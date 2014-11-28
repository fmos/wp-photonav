<?php
/*
 Plugin Name: WP-PhotoNav
 Plugin URI: http://fmos.at/wp-photonav
 Description: Provides a scrolling field without scrollbars for huge pictures.
 Especially useful for panorama pictures.
 Version: 1.2.2
 Author: Fabian Stanke
 Author URI: http://fmos.at
 License: GPL version 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 Text Domain: wp-photonav
 */

if ( ! class_exists( "PhotoNav" ) ) {

	class PhotoNav {

		function __construct() {
			add_action( 'admin_init', array( $this, 'admin_init' ) );
			add_action( 'init', array( $this, 'init' ) );
		}

		function admin_init() {
			add_filter( 'mce_external_plugins', array( $this, 'register_tinymce_plugin' ) );
			add_filter( 'mce_buttons', array( $this, 'register_tinymce_button' ) );
		}

		function register_tinymce_plugin( $plugin_array ) {
			$plugin_array['photonav'] = plugins_url( 'editor_plugin.js', __FILE__ );
			return $plugin_array;
		}

		function register_tinymce_button( $buttons ) {
			array_push( $buttons, 'separator', 'photonav' );
			return $buttons;
		}

		function init() {
			add_action( 'wp_enqueue_scripts', array( $this, 'register_resources' ) );
			add_shortcode( 'photonav', array( $this, 'parse_shortcode' ) );
		}

		// Registers the custom JavaScript and CSS
		function register_resources() {
			wp_register_script( 'jquery-photonav', plugins_url( 'jquery.photonav.js', __FILE__ ),
				array( 'jquery', 'jquery-ui-draggable', 'jquery-touch-punch' ), '1.2.1' );
			wp_register_style( 'wp-photonav', plugins_url( 'wp-photonav.css', __FILE__ ),
				array(), '1.2.0' );
			wp_enqueue_script( 'jquery-photonav' );
			wp_enqueue_style( 'wp-photonav' );
		}

		// Parses the shortcode and its parameters and inserts the actual html code
		function parse_shortcode( $atts ) {
			$defaults = array(                  // introduced in version
				'url' => '',                    // 0.1
				'height'=>'auto',               // 0.1 for backward compatibility
				'container_width'=>'auto',      // 0.1
				'container_height'=>NULL,       // 0.2
				'mode'=>'move',                 // 0.2
				'popup'=>'none',                // 0.7
				'animate' => 'none',            // 0.7
				'position' => 'center',         // 1.1
				'label' => 'none',              // 1.1
				'speed' => 1,					// 1.2.2
			);
			$a = shortcode_atts( $defaults, $atts );
			$id = $this->get_unique_id();
			if ( is_numeric( $a['height'] ) ) {
				$a['height'] = $a['height']."px";
			}
			if ( is_numeric( $a['container_width'] ) ) {
				$a['container_width'] = $a['container_width']."px";
			} else {
				if ( $a['container_width'] == '' ) {
					$a['container_width'] = 'auto';
				}
			}
			if ( is_null( $a['container_height'] ) ) {
				$a['container_height'] = $a['height']; // default to height
			} else {
				if ( is_numeric( $a['container_height'] ) ) {
					$a['container_height'] = $a['container_height']."px";
				}
			}
			if ( '' === $a['container_height'] ) {
				$a['container_height'] = 'auto';
			}
			$valid_modes = array( 'move', 'drag', 'drag360' );
			if ( ! in_array( $a['mode'], $valid_modes ) ) {
				$a['mode'] = 'move';
			}
			$valid_popups = array( 'none', 'colorbox' );
			if ( ! in_array( $a['popup'], $valid_popups ) ) {
				$a['popup'] = 'none';
			}
			$valid_animates = array( 'none', 'right', 'left', 'zoom', '1' );
			if ( ! in_array( $a['animate'], $valid_animates ) ) {
				$a['animate'] = $defaults['animate'];
			} else {
				// For backward compatibility
				if ( '1' === $a['animate'] ) {
					$a['animate'] = 'right';
				}
			}
			if ( ! is_numeric( $a['speed'] ) || $a['speed'] <= 0 ) {
				$a['speed'] = 1;
			}
			$valid_positions = array( 'left', 'center', 'right' );
			if ( ! in_array( $a['position'], $valid_positions ) ) {
				if ( ! is_numeric( $a['position'] ) ) {
					$a['position'] = $defaults['position'];
				}
			}
			if ( '' === $a['label'] ) {
				$a['label'] = $defaults['label'];
			}
			$photonav_insert = <<<PHOTONAVTEMPLATE
<div class="photonav" id="%PHOTONAV_ID%">
	<div class="container" style="width: %PHOTONAV_CONTAINERWIDTH%; height: %PHOTONAV_CONTAINERHEIGHT%;">
		<div class="content" style="background-image: url(%PHOTONAV_URL%);">
			<img id="photonav-image" class="image colorbox-off" src="%PHOTONAV_URL%">
		</div>
	</div>
	<div style="display: none;">
		<div class="photonav popup">
			<div class="container" style="display: block; overflow: hidden;">
				<div class="content" style="background-image: url(%PHOTONAV_URL%);">
					<img id="photonav-image" class="image colorbox-off" src="%PHOTONAV_URL%">
				</div>
			</div>
		</div>
	</div>
	<script type="text/javascript">jQuery(document).ready(function(){jQuery("#%PHOTONAV_ID%").photoNav({id:"%PHOTONAV_ID%",mode:"%PHOTONAV_MODE%",popup:"%PHOTONAV_POPUP%",animate:"%PHOTONAV_ANIMATE%",speed:%PHOTONAV_SPEED%,position:"%PHOTONAV_POSITION%",label:"%PHOTONAV_LABEL%"});});</script>
</div>
PHOTONAVTEMPLATE;
			$photonav_insert = str_replace( '%PHOTONAV_ID%', $id, $photonav_insert );
			$photonav_insert = str_replace( '%PHOTONAV_MODE%', $a['mode'], $photonav_insert );
			$photonav_insert = str_replace( '%PHOTONAV_URL%', $a['url'], $photonav_insert );
			$photonav_insert = str_replace( '%PHOTONAV_CONTAINERWIDTH%', $a['container_width'], $photonav_insert );
			$photonav_insert = str_replace( '%PHOTONAV_CONTAINERHEIGHT%', $a['container_height'], $photonav_insert );
			$photonav_insert = str_replace( '%PHOTONAV_POPUP%', $a['popup'], $photonav_insert );
			$photonav_insert = str_replace( '%PHOTONAV_ANIMATE%', $a['animate'], $photonav_insert );
			$photonav_insert = str_replace( '%PHOTONAV_SPEED%', $a['speed'], $photonav_insert );
			$photonav_insert = str_replace( '%PHOTONAV_POSITION%', $a['position'], $photonav_insert );
			$photonav_insert = str_replace( '%PHOTONAV_LABEL%', $a['label'], $photonav_insert );
			return $photonav_insert;
		}

		// Generate a random string for DOM identification
		function get_unique_id() {
			return substr( md5( uniqid( rand(), true ) ), 0, 16 );
		}

	} // end PhotoNav class

} // end !class_exists check

if ( class_exists( 'PhotoNav' ) ) {
	$photonav = new PhotoNav();
}

