<?php
$base = "http://api.kivaws.org/v1/loans/";
include 'config.php';
if(isset($_POST['action'])) {
	$action = strip_tags($_POST['action']);
	switch($action) {
		case 'calculate_dates':
			if(isset($_POST['start_date']) && isset($_POST['num_months'])) {
				$start_date = strip_tags($_POST['start_date']);
				$num_months = (int)strip_tags($_POST['num_months']);
				echo calculate_dates($start_date, $num_months);
				exit();
			}
			break;
		case 'track_loan':
			if(isset($_POST['id'])) {
				$id = (int)strip_tags($_POST['id']);
				$loan = file_get_contents($base.$id.".json");


				//TODO: grab return value, and only pass loan back to client side, if db gets new values
				track_loan($conn, $base, $id, $loan);

				echo $loan;
				exit();
			} else {
				echo json_encode(array('ID missing.'));
				exit();
			}
			break;
	}
}


/**
* @method calculate_dates() - return the payment due dates in an array 
* @param {string} start_date - date in string form (YYYY-MM-DD)
* @param {int} num_months - The number of months to return
* @return array - example: array("2/17/2017","3/17/2017","4/17/2017","5/17/2017","6/17/2017","7/17/2017")
*/
function calculate_dates($start_date, $num_months) {
	if(preg_match("/^\d{4}-\d{2}-\d{2}$/", $start_date)) {
		$day = substr($start_date, 8,9);
		$dates = array();
		$date = date("n/j/Y", strtotime(((int)$day > 28 ? "last day of " : "")."+1 month", strtotime($start_date)));
		for($i = 0; $i < $num_months; $i++) {
			array_push($dates, $date);
			$date = date("n/j/Y", strtotime(((int)$day > 28 ? "last day of " : "")."+1 month", strtotime($date)));
		}
		return json_encode(array('start_date' => $day, 'num_months' => $num_months, 'due_dates' => $dates));
		
	} else {
		return json_encode(array('Incorrect Date Format. Expectin YYYY-MM-DD'));
	}
}


/**
* @method track_loan() - Pass the data gathered by the api to a db
* @param {db_connection} conn - The method I used here requires me to pass the db connection here
* @param {string} base - The root url of this api
* @param {int} id - The id is used to pull a specific loan from the api
* @param {obj} loan - The api call for the detail view returned as an object
* @return {bool} - Succcess/Failure
*/
function track_loan($conn, $base, $id, $loan) {
	$lenders = file_get_contents($base.$id."/lenders.json");
	$tloan = json_decode($loan);
	$tlenders = json_decode($lenders);


	$date = substr($tloan->loans[0]->terms->disbursal_date, 0, 10);
	
	$tdue_dates = json_decode(calculate_dates($date, $tloan->loans[0]->terms->repayment_term));
	$due_dates  = $tdue_dates->due_dates;

	$stmt = $conn->prepare("INSERT INTO loan "
			."(id, name, num_lenders, loan_amount, num_months, funded_date) "
			."VALUES "
			."(?, ?, ?, ?, ?, ?)");
	$stmt->bind_param("isidis", 
		$id, 
		$tloan->loans[0]->name, 
		$tloan->loans[0]->lender_count,
		$tloan->loans[0]->loan_amount, 
		$tloan->loans[0]->terms->repayment_term, 
		$date);
	$stmt->execute();
	$stmt->close();

	$stmt = $conn->prepare("INSERT INTO payment "
			."(loan_id, month, uid, image_id, name, amount_due, due_date) "
			."VALUES "
			."(?, ?, ?, ?, ?, ?, ?)");
	$stmt->bind_param("iisisds", $loan_id, $month, $uid, $image_id, $name, $amount_due, $crnt_date);

	// var due_per_month = (Math.round((loan_amount / num_lenders)*100)/100);
	// var rounded_due   = (Math.round((due_per_month / num_months)*100)/100);
	// var rounding_diff = Math.round(((rounded_due * num_months) - due_per_month) * 100);

	$due_per_month = sprintf("%01.2f", ($tloan->loans[0]->loan_amount/$tloan->loans[0]->lender_count));
	$rounded_due   = sprintf("%01.2f", ($due_per_month/$tloan->loans[0]->terms->repayment_term));
	$rounding_diff = round((($rounded_due*$tloan->loans[0]->terms->repayment_term)-$due_per_month)*100);

	for($due_date = 0; $due_date < count($due_dates); $due_date++) {
		for($lender = 0; $lender < $tloan->loans[0]->lender_count; $lender++) {

			$loan_id = $id;
			$month = ($due_date+1);
			$uid = $tlenders->lenders[$lender]->uid;
			$image_id = $tlenders->lenders[$lender]->image->id;
			$name = $tlenders->lenders[$lender]->name;
			$amount_due = (($due_date) < ($tloan->loans[0]->terms->repayment_term - $rounding_diff) 
				? $rounded_due 
				: sprintf("%01.2f", ($rounded_due - .01)));
			$crnt_date = date("Y-m-d", strtotime($due_dates[$due_date]));
			$stmt->execute();
		}
	}
	$stmt->close();	
	$conn->close();
}


?>