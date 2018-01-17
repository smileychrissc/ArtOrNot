<?php

/*
 *	Copyright Chris Schnaufer All Rights Reserved
 *	Author: Chris Schnaufer
 *
 *	This heading is is restricted by the following numbered items:
 *		1. must be included in all derivatives of this file
 *		2. must be included in all copies of this file
 *		3. must not be changed without written consent from the Author
 *		4. Is not governed by any license(s) covering the rest of this file
 *
 *	The rest of this file (not consisting of this heading) is protected under 
 *	GNU GENERAL PUBLIC LICENSE Version 3.
 *	This file can be freely used, shared, and modified as permitted by
 *	by the preceeding license
 */

/*
 * Performs any preparation for displaying the ratings page
 */

$userId = 1;
$dataPath = "ud" . DIRECTORY_SEPARATOR . $userId;
$userDataPath = "/home/chris/artsite" . DIRECTORY_SEPARATOR . $dataPath;

// Peruse the users folder for images they've loaded building up the HTML string
// for each found item
$imagesHtml = "";
$idx = 0;
$dir = opendir($userDataPath);
if ($dir !== false) {
	while (($oneFile = readdir($dir)) !== false) {
		if (strcasecmp("_tn.png",substr($oneFile,-7)) == 0) {
			$title = pathinfo($oneFile,PATHINFO_FILENAME);
			$title = substr($title,0,strlen($title) - 3);
			$imagesHtml .= '<div id="img'.$idx.'_frame" class="image_frame">'
				 . '<div class="img_title_wrap">' . ratingsHtml(0, $idx) . titleHtml($title, $idx) . '</div>'
				 . imgHtml($dataPath . DIRECTORY_SEPARATOR . $oneFile, $idx)
				 . commentHtml(0, $idx) . commentAddHtml($idx)
				 . '</div>'. PHP_EOL;
			$idx++;
		}
	}
}

// Include the rating page
include_once \realpath(__DIR__ . DIRECTORY_SEPARATOR . "rate.html");

/** Generated the HTML string for the ratings UI elements
 * @param number $rating The rating to generate the UI for
 * @param number $idx A unique number assigned to different
 *	generated elements
 * @return string The HTML string representing a rating
 */
function ratingsHtml($rating, $idx) {
	$numOn = 0;
	if (($rating > 0) && ($rating < 6)) {
		$numOn = $rating;
	}
	$numOff = 5 - $numOn;

	$html = '<div id="rate' . $idx . '_frame" class="rating_frame">';
	for ($i = 0; $i < $numOn; $i++) {
		$html .= '<div id="rate' . $idx . '_' . $i . '" class="rate rate_on" title="'
				. 'rate this ' . ($ii + 1) . ' stars" onclick="rate(\"' . $idx . '\",\"' 
				. $i . '\");"></div>';
	}
	for ($i = 0; $i < $numOff; $i++) {
		$html .= '<div id="rate' . $idx . '_' . ($i + $numOn) . '" class="rate rate_off" title="'
			. 'Rate this ' . ($i + $numOn) . ' stars" onclick="rate(\"' . $idx . '\",\"' 
			. ($i + $numOn) . '\");"></div>';
	}
	$html .= '</div>';

	return $html;
}

/** Generates the HTML for an image's title
 * @param string $name The title of an image
 * @param number $idx A unique number assigned to different
 *	generated elements
 * @return string The HTML string representing a title
 */
function titleHtml($name, $idx) {
	return '<div id="img_name_wrap' . $idx . '" class="img_name_wrap"><div id="img_name_' 
		. $idx . '_frame" class="img_name_frame"><div id="img_name' . $idx 
		. '" class="img_name vcenter">' . $name . '</div></div></div>';
}


/** Generates the HTML for an image
 * @param string $src The URL of an image
 * @param number $idx A unique number assigned to different
 *	generated elements
 * @return string The HTML string representing an image
 */
function imgHtml($src, $idx) {
	return '<div id="img' . $idx . '_frame" class="img_tn_frame">'
		  . '<img id="img' . $idx . '" class="img_tn" src="' . $src . '"/>'
		  . '</div>';
}


/** Generates the HTML for a the comments count
 * @param string $name The number of comments
 * @param number $idx A unique number assigned to different
 *	generated elements
 * @return string The HTML string representing the comment count
 */
function commentHtml($count, $idx) {
	return '<div id="comment' . $idx . '_frame" class="comment_frame">'
		 . '<div id="comment' . $idx . '" class="comment">comments ' . $count . '</div>'
		 . '</div>';
}


/** Generates the HTML for adding comments
 * @param number $idx A unique number assigned to different
 *	generated elements
 * @return string The HTML string representing adding a comment
 */
function commentAddHtml($idx) {
	return '<div id="comment_add_frame" class="comment_add_frame"><a id="comment_add_' . $idx
		. '" class="comment_add" href="javascript:void(0);" onclick="add_comment(\'' . $idx 
		. '\');">add comment</a>';
}

?>