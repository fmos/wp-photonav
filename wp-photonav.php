<?php 
/*
 Plugin Name: WP-PhotoNav
 Plugin URI: http://www.fabianmoser.at/wp-photonav
 Description: Provides a scrolling field without scrollbars for huge pictures. Especially usefull for panorama pictures.
 Version: 0.2
 Author: Fabian Moser
 Author URI: http://www.fabianmoser.at
 */

if (!class_exists('PhotoNav')) {

class PhotoNav {
	
	function init() {
	    $baseDir = '/'.PLUGINDIR.'/wp-photonav';
	    wp_enqueue_script('photonav_script', $baseDir.'/wp-photonav.js', array('jquery'), '0.1');
		wp_enqueue_style('photonav_style', $baseDir.'/wp-photonav.css', array(), '0.1');
	    $this->register_fullscreen_media_button();
	}
	
	// Registers the TinyMCE plugin which renders the media button in fullscreen mode
	function register_fullscreen_media_button() {
	    // Don't bother doing this stuff if the current user lacks permissions
	    if (!current_user_can('edit_posts') && !current_user_can('edit_pages'))
	        return;
	        
	    // Add only in Rich Editor mode
	    if (get_user_option('rich_editing') == 'true') {
	        add_filter('mce_external_plugins', array(&$this, 'register_tinymce_plugin'));
	        add_filter('mce_buttons', array(&$this, 'register_tinymce_button'));
	    }
	}

	// Callback function for the TinyMCE plugin
	function register_tinymce_button($buttons) {
	    array_push($buttons, 'separator', 'photonav');
	    return $buttons;
	}

	// Callback function for the TinyMCE plugin
	function register_tinymce_plugin($plugin_array) {
	    $plugin_array['photonav'] = WP_PLUGIN_URL.'/wp-photonav/editor_plugin.js';
	    return $plugin_array;
	}

	// Adds a media button above the editor in normal (non-fullscreen) mode
	function add_media_button() {
		global $post_ID, $temp_ID;
		$uploading_iframe_ID = (int) (0 == $post_ID ? $temp_ID : $post_ID);
		$media_upload_iframe_src = "media-upload.php?post_id=$uploading_iframe_ID";
		$photonav_upload_iframe_src = apply_filters('photonav_upload_iframe_src', "$media_upload_iframe_src&amp;type=photonav&amp;tab=type_url");
		$photonav_title = 'photonav.add_photonav';
		$out = "<a href='{$photonav_upload_iframe_src}&amp;TB_iframe=true' id='add_photonav' class='thickbox' title='$image_title' onclick='return false;'><img src='".WP_PLUGIN_URL."/wp-photonav/media-button.gif' alt='$image_title' /></a>";
		print($out);
	}
	
	// Media upload handler
	function media_upload_photonav() {
		$errors = array();
		$id = 0;
	
		if ( isset($_POST['html-upload']) && !empty($_FILES) ) {
			// Upload File button was clicked
			$id = media_handle_upload('async-upload', $_REQUEST['post_id']);
			unset($_FILES);
			if ( is_wp_error($id) ) {
				$errors['upload_error'] = $id;
				$id = false;
			}
		}
	
		if ( !empty($_POST['insertonlybutton']) ) {
			if ( !empty($_POST['insertonly']['id']) ) {
				$id = stripslashes( htmlspecialchars ($_POST['insertonly']['id'], ENT_QUOTES));
			}
			$url = $_POST['insertonly']['url'];
			if ( !empty($url) && !strpos($url, '://') ) {
				$url = "http://$url";
			}

			$extras = '';
			if ( !empty($_POST['insertonly']['containerwidth']) && intval($_POST['insertonly']['containerwidth']) ) {
				$extras .= ' container_width='.stripslashes( htmlspecialchars ($_POST['insertonly']['containerwidth'], ENT_QUOTES));
			}
			if ( !empty($_POST['insertonly']['photowidth']) && intval($_POST['insertonly']['photowidth']) ) {
				$extras .= ' photo_width='.stripslashes( htmlspecialchars ($_POST['insertonly']['photowidth'], ENT_QUOTES));
			}
			if ( !empty($_POST['insertonly']['height']) && intval($_POST['insertonly']['height']) ) {
				$extras .= ' height='.stripslashes( htmlspecialchars ($_POST['insertonly']['height'], ENT_QUOTES));
			}

			if ( !empty($id) && !empty($url) ) {
				$html  = "[photonav id='$id' url='$url'$extras]";
			}			
			
			return media_send_to_editor($html);
		}
	
		if ( !empty($_POST) ) {
			$return = media_upload_form_handler();
	
			if ( is_string($return) )
				return $return;
			if ( is_array($return) )
				$errors = $return;
		}
	
		if ( isset($_POST['save']) ) {
			$errors['upload_notice'] = __('Saved.');
			return media_upload_gallery();
		}
	
		if ( isset($_GET['tab']) && $_GET['tab'] == 'type_url' )
			return wp_iframe( 'media_upload_type_url_form', 'photonav', $errors, $id );
	
		// The upload tab is deactivated and there is no upload form available, only the URL form
		return;
	}
	
	// Hide the upload tab for photonav dialogs
	function remove_type_tab($tabs) {
		if ( isset($_REQUEST['type']) && ($_REQUEST['type'] == 'photonav') ) {
			unset($tabs['type']);
		}
		return $tabs;
	}

	// Parses the shortcode and its parameters and inserts the actual html code
	function parse_shortcode($atts) {
	    extract(shortcode_atts(array('id'=>'undefined', 'url'=>'', 'container_width'=>100, 'photo_width'=>200, 'height'=>100, 'debugging'=>0, ), $atts));
		$template_photonav = '';
	    if ($debugging == 1) {
	        $template_photonav = 'block';
	    } else {
	        $template_photonav = 'none';
	    }
	    $template_photonav = "<div class='photonav'><div class='container' style='display: none; width: %PHOTONAV_CONTAINERWIDTH%px;' id='%PHOTONAV_ID%'><div class='photo' style='width: %PHOTONAV_PHOTOWIDTH%px; height: %PHOTONAV_HEIGHT%px; background-image: url(%PHOTONAV_URL%)'></div></div><br /><br /><div style='display: ".$template_photonav.";'><strong>Debug info:</strong><br /><div id='status'>&nbsp;</div></div><script type='text/javascript'>document.getElementById('%PHOTONAV_ID%').style.display = 'block';var %PHOTONAV_ID% = new PhotoNav('%PHOTONAV_ID%', %PHOTONAV_CONTAINERWIDTH%, %PHOTONAV_PHOTOWIDTH%, %PHOTONAV_DEBUGGING%);</script></div>";
	    $template_photonav = str_replace("%PHOTONAV_ID%", $id, $template_photonav);
	    $template_photonav = str_replace("%PHOTONAV_URL%", $url, $template_photonav);
	    $template_photonav = str_replace("%PHOTONAV_CONTAINERWIDTH%", $container_width, $template_photonav);
	    $template_photonav = str_replace("%PHOTONAV_PHOTOWIDTH%", $photo_width, $template_photonav);
	    $template_photonav = str_replace("%PHOTONAV_HEIGHT%", $height, $template_photonav);
	    $template_photonav = str_replace("%PHOTONAV_DEBUGGING%", $debugging, $template_photonav);
	    return $template_photonav;
	}

} // end PhotoNav class

} // end class_exists check

if (class_exists('PhotoNav')) {
	$photonav = new PhotoNav();
}

load_plugin_textdomain('wp-photonav', $baseDir, 'wp-photonav');

function type_url_form_photonav() { 
	return ' 
	<table class="describe"><tbody>
		<tr>
			<th valign="top" scope="row" class="label">
				<span class="alignleft"><label for="insertonly[id]">' . __('ID', 'wp-photonav') . '</label></span>
				<span class="alignright"><abbr title="required" class="required">*</abbr></span>
			</th>
			<td class="field">
				<input id="insertonly[id]" name="insertonly[id]" value="" type="text">
			</td>
		</tr>	
		<tr>
			<th valign="top" scope="row" class="label">
				<span class="alignleft"><label for="insertonly[url]">' . __('Panorama URL', 'wp-photonav') . '</label></span>
				<span class="alignright"><abbr title="required" class="required">*</abbr></span>
			</th>
			<td class="field"><input id="insertonly[url]" name="insertonly[url]" value="" type="text"></td>
		</tr>			
		<tr>
			<th valign="top" scope="row" class="label">
				<span class="alignleft"><label for="insertonly[containerwidth]">' . __('Container width', 'wp-photonav') . '</label></span>
				<span class="alignright"><abbr title="required" class="required">*</abbr></span>
			</th>
			<td class="field">
				<input id="insertonly[containerwidth]" name="insertonly[containerwidth]" value="" type="text" class="halfpint">
			</td>
		</tr>
		<tr>
			<th valign="top" scope="row" class="label">
				<span class="alignleft"><label for="insertonly[photowidth]">' . __('Photo width', 'wp-photonav') . '</label></span>
				<span class="alignright"><abbr title="required" class="required">*</abbr></span>
			</th>
			<td class="field">
				<input id="insertonly[photowidth]" name="insertonly[photowidth]" value="" type="text" class="halfpint">
			</td>
		</tr>
		<tr>
			<th valign="top" scope="row" class="label">
				<span class="alignleft"><label for="insertonly[height]">' . __('Height', 'wp-photonav') . '</label></span>
				<span class="alignright"><abbr title="required" class="required">*</abbr></span>
			</th>
			<td class="field">
				<input id="insertonly[height]" name="insertonly[height]" value="" type="text" class="halfpint">
			</td>
		</tr>
		<tr>
			<td></td>
			<td>
				<input type="submit" class="button" name="insertonlybutton" value="' . esc_attr__('Insert into Post') . '" />
			</td>
		</tr>
	</tbody></table>
	';
}

if (isset($photonav)) {
	add_action('init', array(&$photonav, 'init'));
	add_action('media_buttons', array(&$photonav, 'add_media_button'), 20);
	add_action('media_upload_photonav', array(&$photonav, 'media_upload_photonav'));
	add_filter('media_upload_tabs', array(&$photonav, 'remove_type_tab'));
	add_shortcode('photonav', array(&$photonav, 'parse_shortcode'));
}

?>
