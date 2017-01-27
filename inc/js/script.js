//Reference
//http://api.kivaws.org/v1/loans/search.json?status=funded
//http://api.kivaws.org/v1/loans/300000.json
//http://api.kivaws.org/v1/loans/300000/lenders.json
//https://www.kiva.org/img/500/1632475.jpg


//Globals
window.apibase						= 'http://api.kivaws.org/v1/loans/';
window.imagebase					= 'https://www.kiva.org/img/';
window.headshot_width				= 300;
window.headshot_thumbnail_divisor	= 2;
window.current_page					= 1;
window.page_size					= 30;
window.default_image_id				= 726677;
window.grow_by						= 10;
window.animation_speed				= 100;

jQuery( document ).ready(function($) {

	//infinite Loader
	$(document).on("click", "#load-more", function(){
		window.current_page++;
		load_funded();
	});


	//Click event for detail view
	$(document).on("click", ".custom-headshot", function(e) {
		var id = $(this).parent().attr("id");
		// console.log("id: "+id);
		if(e.type === 'click') { 
			if($('li#'+id).hasClass('detail-view')) { 
				close_open_detail_view();
			} else { 

				close_open_detail_view();

				get_detail_view(id);

				$('li#'+id).addClass('detail-view');
				// console.log('row classes: '+$('#'+id).attr('class'));

				$('#'+id).animate({	height: window.headshot_width }, window.animation_speed);
				$('#'+id+' .custom-headshot').animate({width:"30%"}, window.animation_speed);
				$('#'+id+' .custom-headshot img').animate({width:"100%"}, window.animation_speed);
				$('#'+id+' .custom-headshot').animate({ height:(window.headshot_width-window.grow_by) }, window.animation_speed);
				$('#'+id+' .custom-summary-info').animate({ width: '48%'}, window.animation_speed);

			}
		}
	});

	//Highlight what row is being looked at by a mouseover event
	$(document).on("mouseenter mouseleave", ".custom-loan-row", function(e) {
		//console.log(e.type);
		var id = $(this).attr("id");

		if(!$('#'+id).hasClass('detail-view')) { 
			if(e.type === 'mouseenter') { 
				// console.log("id:"+id);
				var orig = $('#'+id+' .custom-headshot img').width();
				$('#'+id+' .custom-headshot img,#'+id+' .custom-headshot').animate({width:(orig+window.grow_by)}, window.animation_speed);
			} 
			if(e.type === 'mouseleave') { 
				$('#'+id+' .custom-headshot img,#'+id+' .custom-headshot').animate({width:(window.headshot_width/window.headshot_thumbnail_divisor)}, window.animation_speed);
			}
	    }
	});

	//Display the calculations for each month within the detail view
	$(document).on("mouseenter mouseleave", "ul.payment-schedule-list li", function(e) {
		var loan_id = parseInt($(this).attr('id').replace(/_.*/, ''));
		var loan_period = $(this).attr('id').replace(/.*_/, ''); //string number + '0' for numbers < 10
		var lender_count = parseInt($(this).parent().attr('id').replace(/lc_/, ''));
		var num_months = parseInt($('#'+loan_id+' .payment-schedule-list li').length);
		var payment_block_ratio = Math.floor(100/num_months);
		var extra_space = (100-(payment_block_ratio*num_months));
		var textra_space = (100-(50+extra_space+((payment_block_ratio/2)*num_months)-(payment_block_ratio/2)));

		if(e.type === 'mouseenter') {
			// console.log('loan id: '+loan_id,' | period: '+loan_period,' | lenders: '+lender_count,' | # months: '+num_months,' | extra_space:'+extra_space,' | textra_space:'+textra_space);
			$('#'+loan_id+' .payment-schedule-list li').each(function(d) {
				var cid = $(this).attr('id');
				var tid = parseInt(cid.replace(/_.*/, ''));
				var tperiod = cid.replace(/.*_/, '');
				if(tperiod === loan_period) {
					$(this).css('width',(50+extra_space+textra_space)+'%');
					$('#'+cid+' .ps-detail-view').show();
					$('#'+cid+' .ps-simple-view').hide();
				} else {
					$(this).css('width',(payment_block_ratio/2)+'%');
					$('#'+cid+' .ps-detail-view').hide();
					$('#'+cid+' .ps-simple-view').show();
				}
			});
		} 
		if(e.type === 'mouseleave') {
			// console.log('loan id: '+loan_id,'period: '+loan_period,'lenders: '+lender_count,'# months: '+num_months);
			$('#'+loan_id+' .payment-schedule-list li').each(function(d) {
				var cid = $(this).attr('id');
				var tid = parseInt(cid.replace(/_.*/, ''));
				var tperiod = cid.replace(/.*_/, '');
				if(tperiod === '01') {
					$(this).css('width',(payment_block_ratio+extra_space)+'%');
					$('#'+cid+' .ps-detail-view').hide();
					$('#'+cid+' .ps-simple-view').show();
				} else {
					$(this).css('width',(payment_block_ratio)+'%');
					$('#'+cid+' .ps-detail-view').hide();
					$('#'+cid+' .ps-simple-view').show();
				}
			});
		}
	});


	//Initial load of the latest loans
	load_funded();
});








//Functions







/**
* @method get_lenders() - This function will get the information for each lender, and insert an image within the detail view
* @param {int} id - The id is used to pull a specific lender from the api
* @param {int} lender_count - The lenders page has a default size of 50 people. This value controls how many pages are processed
*/
function get_lenders(id, lender_count) {
	id = parseInt(id);
	lender_count = parseInt(lender_count);
	var default_page_size = 50;
	var thumb_width = 60;
	// console.log("function get_detail_view("+id+")");
	if(Number.isInteger(id)) {

		$('#'+id+' .custom-lender-container').html(
			'<div class="custom-lender-name">'+lender_count+' Lender'+(lender_count > 1 ? 's' : '')+'</div>'
			+'<div class="custom-lender-list-container"><ul class="custom-lender-list"></ul></div>'
		).show();
		// $('.custom-lender-list-container').css('overflow-y', (lender_count > 9 ? 'scroll' : 'none'));

		var track = 0;
		for(var iteration = 0; (iteration*default_page_size) <= lender_count; iteration++) {
			// console.log('iteration: '+iteration);
			$.ajax({
				url:window.apibase+id+'/lenders.json',
				method:'GET',
				data: { 
					// status: 'funded',
					page:(iteration+1)
				},
				success: function(res) {
					// console.log("Lenders:",res);

					for(var l in res.lenders) {
						var lender = res.lenders[l];
						track++;
						var row = '<li id="'+lender.lender_id+'">'
								+'<div class="custom-lender-image-container" '+(lender.image.id !== window.default_image_id ? '' : 'style="background-color:#fff;"')+'>'
									+'<img src="'+window.imagebase+thumb_width+'/'+lender.image.id+'.jpg" width="'+thumb_width+'" '+(lender.image.id !== window.default_image_id ? '' : 'style="margin-top:8px;"')+' alt="local_'+track+'" />'
								+'</div>'
							+'</li>';
						$('#'+id+' .custom-lender-list').append(row);
					}
				}
			});
		}
	} else { 
		//Error
		console.error("Expecting integer... ",id);
	}
}


/**
* @method get_detail_view() - This function will get the information for a specific loan
* @param {int} id - The id is used to pull a specific loan from the api
*/
function get_detail_view(id) { 
	id = parseInt(id);
	// console.log("function get_detail_view("+id+")");
	if(Number.isInteger(id)) {
		$.ajax({
			url:'inc/actions.php',
			method:'POST',
			data: { 
				'action':'track_loan',
				'id':id
			},
			success: function(data) {
				var res = $.parseJSON(data);
				// console.log("Detail View:",res);
				var loan = res.loans[0];

				//Set variables and calculate fields
				var ddate = loan.terms.disbursal_date.substring(0,10).split(/-/);
				var day   = ddate[1].replace(/^0/, '');
				var month = ddate[2].replace(/^0/, '');
				var year  = ddate[0].replace(/^20/, '');

				var num_months    = parseInt(loan.terms.repayment_term);
				var num_lenders   = loan.lender_count;
				var loan_amount   = parseInt(loan.terms.loan_amount);
				var due_per_month = (Math.round((loan_amount / num_lenders)*100)/100);
				var rounded_due   = (Math.round((due_per_month / num_months)*100)/100);
				var rounding_diff = Math.round(((rounded_due * num_months) - due_per_month) * 100);

				var payment_block_ratio = Math.floor(100/num_months);
				var extra_space = (100-(payment_block_ratio*num_months));

				var text = loan.description.texts.en.replace(/<br\ *\/*>/g, ' ');
				$('#'+id+' .custom-description').html(text).slideDown(100);
				$('#'+id+' .custom-disbursal-date').html('Funded: '+day+'/'+month+'/'+year).show();
				$('#'+id+' .custom-town-inline').show();
				$('#'+id+' .custom-payment-schedule').html('<div class="payment-schedule-title">Payment Schedule</div>'
						+'<div class="payment-schedule-container">'
							+'<ul class="payment-schedule-list" id="lc_'+loan.lender_count+'"></ul>'
						+'</div>').show();
				var total = 0;
				for(var i = 1; i <= num_months; i++) { 
					var period = (i < 10 ? '0'+i : i);
					var total = (i < num_months 
						? (Math.round( (total+((i-1) < (num_months - rounding_diff) 
							? (Math.round((rounded_due*num_lenders)*100)/100) 
							: (Math.round(((rounded_due - .01)*num_lenders)*100)/100))) *100)/100) 
						: loan_amount);
					$('#'+id+' .custom-payment-schedule .payment-schedule-list').append(
						'<li id="'+id+'_'+period+'" style=" width:'+(i < 2 ? (payment_block_ratio+extra_space) : payment_block_ratio)+'%">'
							+'<div class="ps-simple-view">'+(i === 1 ? 'Month ' : '')+period+'</div>'
							+'<div class="ps-detail-view">'
								+'<div class="psdv-top-left"><span class="total-paid">'
								+'Total Paid Back: $'+total
								+'</span></div>'
								+'<div class="psdv-bottom-left">'+'Funded: '+day+'/'+month+'/'+year+'</div>'
								+'<div class="psdv-detail">'
									 +'$'+((i-1) < (num_months - rounding_diff) 
								 		? rounded_due 
								 		: (Math.round((rounded_due - .01)*100)/100)
								 	)
									+' X '+num_lenders+' (lender'+(num_lenders > 1 ? 's' : '')+')'
									+' = '+((i-1) < (num_months - rounding_diff) 
										? '$'+(Math.round((rounded_due*num_lenders)*100)/100) 
										: '$'+(Math.round(((rounded_due - .01)*num_lenders)*100)/100)
									)
									+' due Month '+period
								+'</div>'
							+'</div>'
						+'</li>'
					);
				}

				$('#'+id+' .custom-summary, #'+id+' .custom-lender-count').hide();
				$('#'+id+' .custom-town').hide();





				//Calculate Due Dates
				$.ajax({
					url:'inc/actions.php',
					method:'POST',
					data: { 
						'action':'calculate_dates',
						'start_date':ddate.join('-'),
						'num_months':num_months
					},
					success: function(data) {
						// console.log("Calculate Dates:",data);
						if(data.length) {
							var response = $.parseJSON(data);
							var due_dates = response['due_dates'];
							for(var i = 0; i < due_dates.length; i++) {
								var period = (i < 9 ? '0'+(i+1) : (i+1));
								$('#'+id+'_'+period+' .ps-detail-view .psdv-bottom-left').html('Due: '+due_dates[i]);
								// console.log("Period: "+period,"Due Date: "+due_dates[i]);
							}
						} else { 
							console.error('No response from calculate_dates');
						}
					}
				});






				get_lenders(id, loan.lender_count);
			}
		});
	} else { 
		//Error
		console.error("Expecting integer... ",id);
	}
}


/**
* @method close_open_detail_view() - This function will close any open detail views
*/
function close_open_detail_view() { 
	// console.log("function close_open_detail_view()");
	$('.detail-view').each(function() {
		var id = $(this).attr('id');
		$('#'+id+' .custom-summary, #'+id+' .custom-lender-count').show();
		$('#'+id+' .custom-town').show();
		$('#'+id).removeClass('detail-view');
		$('.custom-summary-info').css('width','70%');
		$('#'+id+' .custom-headshot img,#'+id+' .custom-headshot').css('width',(window.headshot_width/window.headshot_thumbnail_divisor)+'px');
		$('#'+id+' .custom-headshot').css('height','140px');
		$('#'+id).css('height','150px');

		$('#'+id+' .custom-description').hide();
		$('#'+id+' .custom-town-inline').hide();
		$('#'+id+' .custom-payment-schedule').hide();
		$('#'+id+' .custom-disbursal-date').hide();
	});
}

/**
* @method load_funded() - This function will populate the page with a list of the most recent (funded) loans
*/
function load_funded() { 
	// console.log("function load_funded()");
	$('#load-more').hide();
	$.ajax({
		url:window.apibase+'search.json',
		method:'GET',
		data: { 
			status: 'funded',
			per_page:window.page_size,
			page:window.current_page
		},
		success: function(res) {
			// console.log("Funded Loans:",res);
			for(var l in res.loans) {
				var loan = res.loans[l];
				var ddate = loan.posted_date.substring(0,10).split(/-/);
				var day   = ddate[1].replace(/^0/, '');
				var month = ddate[2].replace(/^0/, '');
				var year  = ddate[0].replace(/^20/, '');
				// console.log(loan);
				var row = '<li class="custom-loan-row" id="'+loan.id+'">'
					+'<div class="custom-headshot">'
						+'<div class="custom-disbursal-date"></div>'
						// +'<div class="custom-disbursal-date">'+day+'/'+month+'/'+year+'</div>'
						+'<div class="custom-ammount">$'+loan.loan_amount+'</div>'
						+'<img src="'+window.imagebase+window.headshot_width+'/'+loan.image.id+'.jpg" width="'+(window.headshot_width/window.headshot_thumbnail_divisor)+'" />'
					+'</div>'
					+'<div class="custom-summary-info">'
						+'<div class="custom-name">'
							+loan.name
							+' <span class="custom-lender-count">('+loan.lender_count+' lender'+(loan.lender_count > 1 ? 's' : '')+')</span>'
							+'<span class="custom-town-inline">'+(typeof loan.location.town === 'undefined' ?'': loan.location.town+',')
								+' <span class="custom-country-inline">'+loan.location.country+'</span>'
							+'</span>'
						+'</div>'
						+'<div class="custom-town">'+(typeof loan.location.town === 'undefined' ?'': loan.location.town+',')
							+' <span class="custom-country">'+loan.location.country+'</span>'
						+'</div>'
						+'<div class="custom-summary">'+loan.name+' is using this loan '+loan.use+'</div>'
						+'<div class="custom-description"></div>'
						+'<div class="custom-payment-schedule"></div>'
					+'</div>'
					+'<div class="custom-lender-container"></div>'
				+'</li>';
				$('#loan-list').append(row);
				$('#load-more').show();
			}
		}
	});
}