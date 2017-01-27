<?php
$dbhost = 'localhost';
$dbuser = '';
$dbpass = '';
$dbname = '';
$conn = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>