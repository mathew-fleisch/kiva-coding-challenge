<?php

//Reference
//http://api.kivaws.org/v1/loans/search.json?status=funded
//http://api.kivaws.org/v1/loans/300000.json
//http://api.kivaws.org/v1/loans/300000/lenders.json
$base = "http://api.kivaws.org/v1/loans/";
include 'inc/header.php';
?>
<h1>Mathew Fleisch - Coding Challenge</h1>
<div id="custom-main-container">
	<ul id="loan-list"></ul>
	<button id="load-more">Load More</button>
</div>
<?php include 'inc/footer.php'; ?>