--
-- Table structure for table `loan`
--

CREATE TABLE IF NOT EXISTS `loan` (
  `id` int(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `num_lenders` int(10) NOT NULL,
  `num_months` int(10) NOT NULL,
  `funded_date` varchar(10) NOT NULL,
  `loan_amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE IF NOT EXISTS `payment` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `loan_id` int(20) NOT NULL,
  `month` int(10) NOT NULL,
  `uid` varchar(100) NOT NULL,
  `image_id` int(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `amount_due` decimal(10,2) NOT NULL,
  `due_date` varchar(10) NOT NULL,
  `paid` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1575 ;

