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
 * Performs operations on a newly uploaded image
 */

$userDataPath = "/home/chris/artsite/ud/";

/**
 * Handles loading a new image
 */
$img = isset($_FILES['i']) ? $_FILES['i'] : null;
$userId = isset($_REQUEST['u']) ? $_REQUEST['u'] : null;

// Make sure we have something
if (empty($img) || empty($userId)) {
	http_response_code(400);
	return;
}

// Make the destination folder if needed
if (!file_exists($userDataPath . $userId)) {
	mkdir ($userDataPath . $userId);
}

// Use the user's ID to store the loaded file
if (!copy($img['tmp_name'], $userDataPath . $userId . DIRECTORY_SEPARATOR . $img['name'])) {
	http_response_code(413);
	return;
}

$fullImg = $userDataPath . $userId . DIRECTORY_SEPARATOR . $img['name'];

// Load the image so it can be scaled
$res = imagecreatefromstring(file_get_contents($fullImg));
if ($res === false) {
	http_response_code(500);
	return;
}

// Scaling
$newWidth = imagesx($res);
$newHeight = imagesy($res);

$scale = 250.0 / max($newWidth,$newHeight);
$newWidth = intval($newWidth * $scale);
$newHeight = intval($newHeight * $scale);
$newImg = imagescale($res, $newWidth, $newHeight);

// Free resources
imagedestroy($res);
unset($res);

// Save the thumbnail
imagepng($newImg, pathinfo($fullImg, PATHINFO_DIRNAME) 
		. DIRECTORY_SEPARATOR . pathinfo($fullImg, PATHINFO_FILENAME) 
			. "_tn.png");
