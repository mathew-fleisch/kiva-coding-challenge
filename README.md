# Kiva Coding Challenge - Mathew Fleisch

This challenge was given to me by [kiva.org](http://kiva.org) while interviewing for a programming role, in January 2017. The specific challenge document can be found [here](https://github.com/mathew-fleisch/kiva-coding-challenge/blob/master/challenge-doc.txt) and asks for a basic method for accessing their public api. The kiva api is used to pull information about micro loans and the lenders that provide money to the lendees. I took the challenge a step further, and created a prototype interface using the LAMP stack and jQuery to make ajax calls. This interface should display a list of the newest (funded) loans and allow the user to select specific people, to learn more about them and how their payments will break down, month to month. Each time a user loads a specific person, the api call passes through a local database to create an audit trail for each lender [Click here](https://github.com/mathew-fleisch/kiva-coding-challenge/blob/master/example_db_data.sql) to see a db export of one loan of $825. 

* 20 lenders loaned a total of $875, and the lendee will payback a total of $75 per month for 11 months. 
	* $875 / 11 months = $75
* The monthly payment is then distributed between the 20 lenders.
	* $75 / 20 = $3.75 
* Each lender should get back $3.75 per month to pay back their initial loan of $41.25.
	* $3.75 * 11 = $41.25 
* The total amount paid back each month should finally equal the total amount loaned.
	* $41.25 * 11 months = $875

## Requirements
* Must have a LAMP or MAMP stack already set up for this to work.
* Must have a virtual host set up to interpret php files in the cloned repo destination.

## Instructions
* Clone the repository to your local computer. 
* Create a new mysql db and user with all privileges assigned to it.
* Run [db.sql](https://github.com/mathew-fleisch/kiva-coding-challenge/blob/master/db.sql) on the database to initialize the tables
* Fill in the credentials you created into [inc/config.php](https://github.com/mathew-fleisch/kiva-coding-challenge/blob/master/inc/config.php) file.
* Open index.php in a browser


### Notes
I had a lot of fun with this project and spent a couple of days working on it. However, I got a little carried away with creating the interface and didn't leave enough time to create the unit tests. I had a little trouble working out the math when rounding errors popped up (Superman 3/Office Space), but tried my best to compensate, when that happened. If I had more time on the project, I would first complete the unit tests, and then start optimizing the display (don't reload a detail-view, if it is already hidden on the page). Finally I would take the prototype that I have created here, and implement it with a more standard MVC architecture. I would create a local api library to standardize the requests to the public api so that all requests went through the back-end, and not on the client side, directly to the browser. That way, additional processing (sql audit trail and condensing multiple public api requests into one response from the local server) could be done faster, and with less back-and-forth from the client to the server. 

#### [Live Demo](http://mathewfleisch.com/kiva/)


### More on rounding
I introduced a concept in my code called the "rounding difference" which is how I tried to compensate for rounding errors that occur. Consider the following example:

* $325 Loan
* Between 5 lenders
* Paid back over 8 months

The total payment back to each lender, should be $65
```
$325 / 5 lenders = $65
```
That amount divided over 8 months (rounded) should be $8.13
```
$65 / 8 months = $8.13
```

However, if that exact amount is paid back to each lender, over 8 months, the total paid back would be $325.20 because of previous rounding. To get the total amount paid back, closer to the original loan amount, my algorithm reduces the payback amount by 1 cent for all lenders after a certain point, which is determined by what I called, the “rounding difference” and it goes something like this:
```
Rounding_diff = 100 * { ([(loan_total / num_lenders) / num_months] * num_months) – (loan_total / num_lenders) } 
or in this case
rounding_diff = 100 * (({($325 / 5 lenders) / 8 months} * 8 months) - ($325 / 5 lenders)) = 4
rounding_diff = 100 * (({$65 / 8 months} * 8 months) - $65) = 4
rounding_diff = 100 * (($8.13 * 8 months) - $65) = 4
rounding_diff = 100 * ($0.04) = 4
```
The rounding difference is finally used to determine what month to subtract one cent from every lender's bill. In this case, the first 4 months will be at $8.13 and $8.12 for the remaining 4 months.
```
Total Paid Back = ( ($8.13 * 5 lenders) * 4 months) + ( ($8.12 * 5 lenders) * 4 months)
Total Paid Back = $162.60 + $162.40
Total Paid Back = $375
```
 