<?php
/*
 Plugin Name: WP-PhotoNav
 Plugin URI: http://fmos.at/wp-photonav
 Description: Provides a scrolling field without scrollbars for huge pictures. Especially useful for panorama pictures.
 Version: 1.1.0
 Author: Fabian Stanke
 Author URI: http://fmos.at
 License: GPL version 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 Text Domain: wp-photonav
 */

if (!class_exists("PhotoNav")) {

	class PhotoNav {

		function init() {
			$this->register_fullscreen_media_button();
		}

		// Registers the custom JavaScript and CSS
		function register_resources() {
			$baseDir = "/".PLUGINDIR."/wp-photonav";
			wp_register_script('jquery-photonav', $baseDir."/jquery.photonav.js", array('jquery', 'jquery-ui-draggable'), '1.1.0');
			wp_register_style('wp-photonav', $baseDir."/wp-photonav.css", array(), '1.1.0');
			wp_enqueue_script('jquery-photonav');
			wp_enqueue_style('wp-photonav');
		}

		// Registers the TinyMCE plugin which renders the media button in fullscreen mode
		function register_fullscreen_media_button() {
			// Don"t bother doing this stuff if the current user lacks permissions
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
			$plugin_array['photonav'] = WP_PLUGIN_URL."/wp-photonav/editor_plugin.js";
			return $plugin_array;
		}

		// Adds a media button above the editor in normal (non-fullscreen) mode
		function add_media_button() {
			global $post_ID, $temp_ID;
			$uploading_iframe_ID = (int) (0 == $post_ID ? $temp_ID : $post_ID);
			$media_upload_iframe_src = "media-upload.php?post_id=$uploading_iframe_ID";
			$photonav_upload_iframe_src = apply_filters("photonav_upload_iframe_src", "$media_upload_iframe_src&amp;type=photonav&amp;tab=type_url");
			$image_title = "WP-PhotoNav";
			$out = "<a href='{$photonav_upload_iframe_src}&amp;TB_iframe=true' id='add_photonav' class='button thickbox' title='$image_title' onclick='return false;'><img src='".WP_PLUGIN_URL."/wp-photonav/media-button.gif' alt='$image_title' /> Photonav</a>";
			print($out);
		}

		// Media upload handler
		function media_upload_photonav() {
			$errors = array();
			$id = 0;
			$mode = 'move';

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
				$url = $_POST['insertonly']['url'];
				if ( !empty($url) && !strpos($url, "://") ) {
					$url = "http://$url";
				}
				if ( !empty($_POST['insertonly']['mode']) ) {
					$mode = stripslashes( htmlspecialchars ($_POST['insertonly']['mode'], ENT_QUOTES));
				}
				$extras = "";
				if ( !empty($_POST['insertonly']['containerwidth'])) {
					$extras .= " container_width=".stripslashes( htmlspecialchars ($_POST['insertonly']['containerwidth'], ENT_QUOTES));
				}
				if ( !empty($_POST['insertonly']['containerheight'])) {
					$extras .= " container_height=".stripslashes( htmlspecialchars ($_POST['insertonly']['containerheight'], ENT_QUOTES));
				}
				if ( !empty($_POST['insertonly']['popup'])) {
					$extras .= " popup='".stripslashes( htmlspecialchars ($_POST['insertonly']['popup'], ENT_QUOTES))."'";
				}
				if ( !empty($_POST['insertonly']['animate'])) {
					$extras .= " animate=".stripslashes( htmlspecialchars ($_POST['insertonly']['animate'], ENT_QUOTES));
				}
				if ( !empty($url) ) {
					$html  = "[photonav url='$url' mode='$mode'$extras]";
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
				$errors['upload_notice'] = __("Saved.");
				return media_upload_gallery();
			}

			if ( isset($_GET['tab']) && $_GET['tab'] == 'type_url' ) {
				return wp_iframe( 'media_upload_type_url_form', 'photonav', $errors, $id );
			}

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

		/**
		 * Retrieve HTML for the mode radio buttons with the specified one checked.
		 * @since 0.9
		 */
		function mode_input_field( $post, $check = '' ) {
			$mode_names = array('move' => __('Move'), 'drag' => __('Drag'), 'drag360' => __('Drag 360°'));

			if ( empty($check) )
			$check = 'move';

			foreach ( $mode_names as $mode => $label ) {
				$checked = '';

				$css_id = "photonav-mode-{$mode}-{$post->ID}";
				// if this size is the default but that's not available, don't select it
				if ( $mode == $check ) {
					$checked = " checked='checked'";
				}

				$html = "<span class='photonav-mode-item'><input type='radio' name='attachments[$post->ID][photonav-mode]' id='{$css_id}' value='{$mode}'$checked />";
				$html .= "<label for='{$css_id}'>$label</label>";
				$html .= '</span>';

				$out[] = $html;
			}

			return array(
                'label' => __('Mode'),
                'input' => 'html',
                'html'  => join("\n", $out),
			);
		}

		/**
		 * Retrieve HTML for the popup radio buttons with the specified one checked.
		 * @since 0.9
		 */
		function popup_input_field( $post, $check = '' ) {
			$popup_names = array('none' => __('None'), 'colorbox' => __('Colorbox'));

			if ( empty($check) )
			$check = 'none';

			foreach ( $popup_names as $popup => $label ) {
				$checked = '';

				$css_id = "photonav-mode-{$popup}-{$post->ID}";
				// if this size is the default but that's not available, don't select it
				if ( $popup == $check ) {
					$checked = " checked='checked'";
				}

				$html = "<span class='photonav-popup-item'><input type='radio' name='attachments[$post->ID][photonav-popup]' id='{$css_id}' value='{$popup}'$checked />";
				$html .= "<label for='{$css_id}'>$label</label>";
				$html .= '</span>';

				$out[] = $html;
			}

			return array(
                'label' => __('Popup'),
                'input' => 'html',
                'html'  => join("\n", $out),
			);
		}

		/**
		 * Retrieve HTML for the animate checkbox.
		 * @since 0.9
		 */
		function animate_input_field( $post, $check = '' ) {
			if ( empty($check) )
			$check = '0';

			$css_id = "photonav-animate-{$post->ID}";
			$html = "<span class='photonav-animate'><input type='checkbox' name='attachments[$post->ID][photonav-animate]' id='{$css_id}' value='1' /></span>";
			$out[] = $html;

			return array(
                'label' => __('Animate'),
                'input' => 'html',
                'html'  => join("\n", $out),
			);
		}

		/**
		 * Retrieve HTML for the frame size.
		 * @since 0.9
		 */
		function framesize_input_field( $post ) {
			$dim_names = array('height' => __('Height'), 'width' => __('Width'));

			foreach ( $dim_names as $dim => $label ) {
				$css_id = "photonav-{$dim}-{$post->ID}";

				$html = "<span class='photonav-frame-item'>";
				$html .= "<label for='{$css_id}'>$label (px)</label>";
				$html .= "<input type='text' name='attachments[$post->ID][photonav-$dim]' id='{$css_id}' value='' style='width:100px'' />";
				$html .= '</span>';

				$out[] = $html;
			}

			return array(
                'label' => __('Frame size'),
                'input' => 'html',
                'html'  => join("\n", $out),
			);
		}


		function attachment_fields_edit($form_fields, $post) {
			if ( isset($_REQUEST['type']) && ($_REQUEST['type'] == 'photonav') ) {
				$form_fields['photonav-mode'] = $this->mode_input_field( $post );
				$form_fields['photonav-framesize'] = $this->framesize_input_field( $post );
				$form_fields['photonav-popup'] = $this->popup_input_field( $post );
				$form_fields['photonav-animate'] = $this->animate_input_field( $post );

				unset($form_fields['align'], $form_fields['image-size'],
				$form_fields['url'], $form_fields['post_title'], $form_fields['image_alt'],
				$form_fields['post_excerpt'], $form_fields['post_content']);
			}
			return $form_fields;
		}

		function media_send_to_editor($html, $attachment_id, $attachment) {
			$post =& get_post($attachment_id);
			if ( isset($_REQUEST['type']) && ($_REQUEST['type'] == 'photonav') ) {
				$url = wp_get_attachment_url($attachment_id);
				$mode = $attachment['photonav-mode'];
				$popup = $attachment['photonav-popup'];
				$animate = $attachment['photonav-animate'];
				$height = $attachment['photonav-height'];
				$width = $attachment['photonav-width'];
				return "[photonav url='$url' mode='$mode' popup='$popup' animate='$animate' container_width='$width' container_height='$height']";
			}
			return $html;
		}

		// Generate a random string for DOM identification
		function getUniqueId() {
			return substr(md5(uniqid(rand(), true)), 0, 16);
		}

		// Parses the shortcode and its parameters and inserts the actual html code
		function parse_shortcode($atts) {
			$defaults = array(                  // introduced in version
                'url' => '',                    // 0.1
                'height'=>'auto',               // 0.1 for backward compatibility
                'container_width'=>'auto',      // 0.1
                'container_height'=>NULL,       // 0.2
                'mode'=>'move',                 // 0.2
                'popup'=>'none',                // 0.7
                'animate' => '0',               // 0.7
                'position' => 'center',			// 1.1
                'label' => 'none'				// 1.1
			);
			$a = shortcode_atts($defaults, $atts);
			$id = $this->getUniqueId();
			if (is_numeric($a['height'])) {
				$a['height'] = $a['height']."px";
			}
			if (is_numeric($a['container_width'])) {
				$a['container_width'] = $a['container_width']."px";
			} else if ($a['container_width'] == '') {
				$a['container_width'] = 'auto';
			}
			if (is_null($a['container_height'])) {
				$a['container_height'] = $a['height']; // default to height
			} else if (is_numeric($a['container_height'])) {
				$a['container_height'] = $a['container_height']."px";
			}
			if ($a['container_height'] == '') {
				$a['container_height'] = 'auto';
			}
			$valid_modes = array('move', 'drag', 'drag360');
			if (!in_array($a['mode'], $valid_modes)) {
				$a['mode'] = 'move';
			}
			$valid_popups = array('none', 'colorbox');
			if (!in_array($a['popup'], $valid_popups)) {
				$a['popup'] = 'none';
			}
			$valid_positions = array('left', 'center', 'right');
			if (!in_array($a['position'], $valid_positions)) {
				if (!is_numeric($a['position'])) {
					$a['position'] = $defaults['position'];
				}
			}
			if ($a['label'] == '') {
				$a['label'] = 'none';
			}
			$template_photonav = <<<PHOTONAVTEMPLATE
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
    <script type="text/javascript">jQuery(document).ready(function(){jQuery("#%PHOTONAV_ID%").photoNav({id:"%PHOTONAV_ID%",mode:"%PHOTONAV_MODE%",popup:"%PHOTONAV_POPUP%",animate:"%PHOTONAV_ANIMATE%",position:"%PHOTONAV_POSITION%",label:"%PHOTONAV_LABEL%"});});</script>
</div>
PHOTONAVTEMPLATE;
			$template_photonav = str_replace("%PHOTONAV_ID%", $id, $template_photonav);
			$template_photonav = str_replace("%PHOTONAV_MODE%", $a['mode'], $template_photonav);
			$template_photonav = str_replace("%PHOTONAV_URL%", $a['url'], $template_photonav);
			$template_photonav = str_replace("%PHOTONAV_CONTAINERWIDTH%", $a['container_width'], $template_photonav);
			$template_photonav = str_replace("%PHOTONAV_CONTAINERHEIGHT%", $a['container_height'], $template_photonav);
			$template_photonav = str_replace("%PHOTONAV_POPUP%", $a['popup'], $template_photonav);
			$template_photonav = str_replace("%PHOTONAV_ANIMATE%", $a['animate'], $template_photonav);
			$template_photonav = str_replace("%PHOTONAV_POSITION%", $a['position'], $template_photonav);
			$template_photonav = str_replace("%PHOTONAV_LABEL%", $a['label'], $template_photonav);
			return $template_photonav;
		}

	} // end PhotoNav class

} // end class_exists check

if (class_exists('PhotoNav')) {
	$photonav = new PhotoNav();
}

load_plugin_textdomain( 'wp-photonav', false, dirname( plugin_basename( __FILE__ ) ) );

function type_url_form_photonav() {
	return '
        <table class="describe"><tbody>
                <tr>
                        <th valign="top" scope="row" class="label">
                                <span class="alignleft"><label for="insertonly[url]">' . __('Panorama URL', 'wp-photonav') . '</label></span>
                                <span class="alignright"><abbr title="required" class="required">*</abbr></span>
                        </th>
                        <td class="field"><input id="insertonly[url]" name="insertonly[url]" value="" type="text"></td>
                </tr>
                <tr>
                        <th valign="top" scope="row" class="label">
                                <span class="alignleft"><label for="insertonly[mode]">' . __('Mode', 'wp-photonav') . '</label></span>
                        </th>
                        <td class="field">
                                <input id="insertonly[mode]" name="insertonly[mode]" value="move" type="radio" class="halfpint" /> Move<br />
                                <input id="insertonly[mode]" name="insertonly[mode]" value="drag" type="radio" class="halfpint" /> Drag<br />
                                <input id="insertonly[mode]" name="insertonly[mode]" value="drag360" type="radio" class="halfpint" /> Drag 360°
                        </td>
                </tr>
                <tr>
                        <th valign="top" scope="row" class="label">
                                <span class="alignleft"><label for="insertonly[containerwidth]">' . __('Frame width', 'wp-photonav') . '</label></span>
                        </th>
                        <td class="field">
                                <input id="insertonly[containerwidth]" name="insertonly[containerwidth]" value="" type="text" class="halfpint">
                        </td>
                </tr>
                <tr>
                        <th valign="top" scope="row" class="label">
                                <span class="alignleft"><label for="insertonly[containerheight]">' . __('Frame height', 'wp-photonav') . '</label></span>
                        </th>
                        <td class="field">
                                <input id="insertonly[containerheight]" name="insertonly[containerheight]" value="" type="text" class="halfpint">
                        </td>
                </tr>
                <tr>
                        <th valign="top" scope="row" class="label">
                                <span class="alignleft"><label for="insertonly[popup]">' . __('Popup', 'wp-photonav') . '</label></span>
                        </th>
                        <td class="field">
                                <input id="insertonly[popup]" name="insertonly[popup]" value="none" type="radio" class="halfpint" /> None<br />
                                <input id="insertonly[popup]" name="insertonly[popup]" value="colorbox" type="radio" class="halfpint" /> Colorbox
                        </td>
                </tr>
                <tr>
                        <th valign="top" scope="row" class="label">
                                <span class="alignleft"><label for="insertonly[animate]">' . __('Animate', 'wp-photonav') . '</label></span>
                        </th>
                        <td class="field">
                                <input id="insertonly[animate]" name="insertonly[animate]" value="1" type="checkbox" class="halfpint"> Enable
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
	add_action('wp_enqueue_scripts', array(&$photonav, 'register_resources'));
	add_action('media_buttons', array(&$photonav, 'add_media_button'), 20);
	add_action('media_upload_photonav', array(&$photonav, 'media_upload_photonav'));
	add_filter('media_upload_tabs', array(&$photonav, 'remove_type_tab'));
	add_filter('attachment_fields_to_edit', array(&$photonav, 'attachment_fields_edit'), 11, 2);
	add_filter('media_send_to_editor', array(&$photonav, 'media_send_to_editor'), 11, 3);
	add_shortcode('photonav', array(&$photonav, 'parse_shortcode'));
}

?>