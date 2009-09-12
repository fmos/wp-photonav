=== WP-PhotoNav ===
Contributors: fmos
Donate link: 
Tags: photo, picture, panorama, photonav, jquery, scroll
Requires at least: 2.8
Tested up to: 2.8
Stable tag: 0.1
Text Domain: wp-photonav

Provides a scrolling field without scrollbars for pictures with huge horizontal dimensions. Especially usefull for panorama pictures.

== Description ==

This plugin is a rewrite of a JavaScript snippet called PhotoNav. It provides for easy integration of panaorama pictures in a Wordpress page throught using shortcode. The user can "rotate" the view of the panorama by moving the mouse over the image area. 

Suitable panorama pictures can be created e.g. using the [Hugin](http://hugin.sourceforge.net/) panorama photo stitcher.

== Installation ==

1. Upload the wp-photonav directory to the `/wp-content/plugins/` directory
2. Activate the plugin through the Plugins menu in WordPress
3. Upload a panorama picture and note the dimensions
4. Include PhotoNav in your post by entering `[photonav id='panorama' url='/wp-content/uploads/2009/07/panorama.jpg' container_width=400 photo_width=3000 height=200]`. Remember to use **unique** id strings and note that the image will be cropped (not scaled) to the given sizes.

== Version History ==

= Version 0.2 =
* Changes php source structure to object orientation
* Panorama media button as a simple shortcode helper
* I18n

= Version 0.1 =
* Initial release.
* Shortcode ability

== Frequently Asked Questions ==

= What are possible ids? =

You can use any valid html id. Every panorama has to have a unique id.
