<?php
/*
Plugin Name: WP-PhotoNav
Plugin URI: http://www.fabianmoser.at/wp-photonav
Description: Provides a scrolling field without scrollbars for huge pictures. Especially usefull for panorama pictures.
Version: 0.1
Author: Fabian Moser
Author URI: http://www.fabianmoser.at
*/

/*  Copyright 2009  Fabian Moser  (email : e-mailÄTfabianmoser.at)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

function photonav_init() {
	$baseDir = '/' . PLUGINDIR . '/wp-photonav';
	wp_enqueue_script('photonav_script', $baseDir . '/wp-photonav.js', array('jquery'), '0.1');
	wp_enqueue_style('photonav_style', $baseDir . '/wp-photonav.css', array(), '0.1');
}

add_action('init', 'photonav_init');

function photonav_add_stylesheet() {
	wp_enqueue_style('photonav_style');
}

add_action('wp_print_styles', 'photonav_add_stylesheet');

function photonav_shortcode($atts) {
	extract(shortcode_atts(array(
			'id' => 'undefined',
			'url' => '',
			'container_width' => 100,
			'photo_width' => 200,
			'height' => 100,
			'debugging' => 0,
			), $atts));
	$template_photonav_part1 = 
			"<div class='photonav'>\n" .
			"	<div class='container' style='display: none; width: %PHOTONAV_CONTAINERWIDTH%px;' id='%PHOTONAV_ID%'>\n" .
			"		<div class='photo' style='width: %PHOTONAV_PHOTOWIDTH%px; height: %PHOTONAV_HEIGHT%px; background-image: url(%PHOTONAV_URL%)'></div>\n" .
			"	</div>\n" .
			"	<br /><br />\n" .
			"	<div style='display: ";
	$template_photonav_part2 = ";'>\n" .
			"		<strong>Debug info:</strong><br />\n" .
			"		<div id='status'>&nbsp;</div>\n" .
			"	</div>\n" .
			"	<script type='text/javascript'><!--\n" .
			"		document.getElementById('%PHOTONAV_ID%').style.display = 'block';\n" .
			"		var %PHOTONAV_ID% = new PhotoNav('%PHOTONAV_ID%', %PHOTONAV_CONTAINERWIDTH%, %PHOTONAV_PHOTOWIDTH%, %PHOTONAV_DEBUGGING%);\n" .
			"	// --></script>\n" .
			"</div>\n";
	$template_photonav = '';
	if ($debugging == 1) {
		$template_photonav = $template_photonav_part1 . "block" . $template_photonav_part2;
	} else {
		$template_photonav = $template_photonav_part1 . "none" . $template_photonav_part2;
	}
	$template_photonav = str_replace("%PHOTONAV_ID%", $id, $template_photonav);
	$template_photonav = str_replace("%PHOTONAV_URL%", $url, $template_photonav);
	$template_photonav = str_replace("%PHOTONAV_CONTAINERWIDTH%", $container_width, $template_photonav);
	$template_photonav = str_replace("%PHOTONAV_PHOTOWIDTH%", $photo_width, $template_photonav);
	$template_photonav = str_replace("%PHOTONAV_HEIGHT%", $height, $template_photonav);
	$template_photonav = str_replace("%PHOTONAV_DEBUGGING%", $debugging, $template_photonav);
	return $template_photonav;
}

add_shortcode('photonav', 'photonav_shortcode');

?>
