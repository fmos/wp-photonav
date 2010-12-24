<?php

if (!class_exists("PhotoNavWidget")) {

    class PhotoNavWidget {
    	
		function init() {
			register_sidebar_widget("WP-Photonav-Widget", array(&$this, 'render'));    
			register_widget_control( "WP-Photonav-Widget", array(&$this, 'control'));
			
			return;
		}

        function render() {
			// load config
			$options = $newoptions = get_option('photonavwidget_widget');
			
			// title
			echo'<h2>'.attribute_escape($options['title']).'</H2>';
			
			// shortcode
			echo do_shortcode("[photonav url='".attribute_escape($options['url'])."' width=".attribute_escape($options['width'])." height=".attribute_escape($options['height'])."]");
			
			return;
		}
		
		// widget variables
		function control() {
			$options = $newoptions = get_option('photonavwidget_widget');
			if ( $_POST["photonavwidget_widget_submit"] ) {
				$newoptions['title'] = strip_tags(stripslashes($_POST["photonavwidget_widget_title"]));
				$newoptions['url'] = strip_tags(stripslashes($_POST["photonavwidget_widget_url"]));
				$newoptions['width'] = strip_tags(stripslashes($_POST["photonavwidget_widget_width"]));
				$newoptions['height'] = strip_tags(stripslashes($_POST["photonavwidget_widget_height"]));
			}
			if ( $options != $newoptions ) {
				$options = $newoptions;
				update_option('photonavwidget_widget', $options);
			}
	
			// set variables
			$title = attribute_escape($options['title']);
			$url = attribute_escape($options['url']);
			$width = attribute_escape($options['width']);
			$height = attribute_escape($options['height']);
	
			// set defaults
			if ($title == '')
				$title = 'WP-Photonav';
			if ($url == '')
				$url = 'Photo URL';
			if ($width == '')
				$width = '310';
			if ($height == '')
				$height = '197';
		
			// widget label	
			?>
	<p><label for="photonavwidget_widget_title"><?php _e('Title:'); ?> <input class="widefat" id="photonavwidget_widget_title" name="photonavwidget_widget_title" type="text" value="<?php echo $title; ?>" /></label></p>
				<p><label for="photonavwidget_widget_url"><?php _e('URL:'); ?> <input class="widefat" id="photonavwidget_widget_url" name="photonavwidget_widget_url" type="text" value="<?php echo $url; ?>" /></label></p>
				<p><label for="photonavwidget_widget_width"><?php _e('Width:'); ?> <input class="widefat" id="photonavwidget_widget_width" name="photonavwidget_widget_width" type="text" value="<?php echo $width; ?>" /></label></p>
				<p><label for="photonavwidget_widget_height"><?php _e('Height:'); ?> <input class="widefat" id="photonavwidget_widget_height" name="photonavwidget_widget_height" type="text" value="<?php echo $height; ?>" /></label></p>
				<input type="hidden" id="photonavwidget_widget_submit" name="photonavwidget_widget_submit" value="1" />
			<?php
			
			return;
		}

    } // end PhotoNavWidget class

} // end class_exists check

if (class_exists('PhotoNavWidget')) {
    $photonavwidget = new PhotoNavWidget();
}

if (isset($photonavwidget)) {
    add_action('plugins_loaded', array(&$photonavwidget, 'init'));
}

// vim: ai ts=4 sts=4 et sw=4
?>
