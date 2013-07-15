(function() {
	// Load plugin specific language pack
	tinymce.PluginManager.requireLangPack('photonav');

	tinymce.create('tinymce.plugins.PhotoNav', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {
			// Register wp-photonav button
			ed.addButton('add_photonav', {
				title : 'photonav.add_photonav',
				image : url + '/media-button-fullscreen.gif',
				onclick : function() {
					tb_show('', tinymce.DOM.get('add_photonav').href);
					tinymce.DOM.setStyle( ['TB_overlay','TB_window','TB_load'], 'z-index', '999999' );
				}
			});

			// Add a node change handler, selects the button in the UI when a image is selected
			ed.onNodeChange.add(function(ed, cm, n) {
				// cm.setActive('photonav', n.nodeName == 'IMG');
			});

			// Add Media button to fullscreen
			ed.onBeforeExecCommand.add(function(ed, cmd, ui, val) {
				if ( 'mceFullScreen' != cmd ) return;
				if ( 'mce_fullscreen' != ed.id )
					ed.settings.theme_advanced_buttons1 += ',|,add_photonav';
			});
		},

		/**
		 * Creates control instances based in the incomming name. This method is normally not
		 * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
		 * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
		 * method can be used to create those.
		 *
		 * @param {String} n Name of the control to create.
		 * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
		 * @return {tinymce.ui.Control} New control instance or null if no control was created.
		 */
		createControl : function(n, cm) {
			return null;
		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'WP-PhotoNav plugin',
				author : 'Fabian Stanke',
				authorurl : 'http://fmos.at',
				infourl : 'http://fmos.at/wp-photonav',
				version : "1.1"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('photonav', tinymce.plugins.PhotoNav);
})();