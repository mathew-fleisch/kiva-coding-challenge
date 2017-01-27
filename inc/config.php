<?php


$dbhost = 'localhost';
$dbuser = 'digit26_kivau';
$dbpass = 'kivap@ssw0rd';
$dbname = 'digit26_kiva';

/*
$conn = mysql_connect($dbhost, $dbuser, $dbpass);
if(!$conn) {
die ('Error connecting to mysql');
}

mysql_select_db($dbname);
*/
$conn = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}



?>