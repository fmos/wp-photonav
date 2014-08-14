(function() {
	tinymce.PluginManager.requireLangPack( 'photonav' );

	tinymce.create( 'tinymce.plugins.PhotoNav', {

		init : function( ed, url ) {
			ed.addButton( 'photonav', {
				title : 'WP-PhotoNav shortcode',
				cmd : 'photonav_dlg',
				image : url + '/media-button-fullscreen.gif',
			});
			ed.addCommand( 'photonav_dlg', function() {
				ed.windowManager.open({
					title: 'WP-PhotoNav',
					body: [
						{ type: 'textbox', name: 'url', label: ed.getLang( 'photonav.image_url' ) },
						{ type: 'listbox', name: 'mode', label: ed.getLang( 'photonav.mode' ), values: [
							{ text: ed.getLang( 'photonav.mode_move' ), value: 'move' },
							{ text: ed.getLang( 'photonav.mode_drag' ), value: 'drag' },
							{ text: ed.getLang( 'photonav.mode_360' ), value: 'drag360' },
						] },
						{ type: 'listbox', name: 'popup', label: ed.getLang( 'photonav.popup' ), values: [
							{ text: ed.getLang( 'photonav.pop_none' ), value: 'none' },
							{ text: ed.getLang( 'photonav.pop_colorbox' ), value: 'colorbox' },
						] },
						{ type: 'listbox', name: 'animate', label: ed.getLang( 'photonav.animation' ), values: [
							{ text: ed.getLang( 'photonav.ani_none' ), value: 'none' },
							{ text: ed.getLang( 'photonav.ani_left' ), value: 'left' },
							{ text: ed.getLang( 'photonav.ani_right' ), value: 'right' },
							{ text: ed.getLang( 'photonav.ani_zoom' ), value: 'zoom' },
						] },
						{ type: 'listbox', name: 'position', label: ed.getLang( 'photonav.position' ), values: [
							{ text: ed.getLang( 'photonav.pos_center' ), value: 'center' },
							{ text: ed.getLang( 'photonav.pos_left' ), value: 'left' },
							{ text: ed.getLang( 'photonav.pos_right' ), value: 'right' },
						] },
						{ type: 'checkbox', name: 'label', label: ed.getLang( 'photonav.label' )},
						{ type: 'textbox', name: 'width', label: ed.getLang( 'photonav.width' )},
						{ type: 'textbox', name: 'height', label: ed.getLang( 'photonav.height' )},
					],
					onSubmit: function( e ) {
						var output = '';
						// setup the output of our shortcode
						output = '[photonav ';
						output += 'url=' + e.data.url + ' ';
						output += 'mode=' + e.data.mode + ' ';
						output += 'popup=' + e.data.popup + ' ';
						output += 'animate=' + e.data.animate + ' ';
						output += 'position=' + e.data.position + ' ';
						if ( e.data.label === true ) {
							output += 'label=true ';
						}
						output += 'container_width=' + e.data.width + ' ';
						output += 'container_height=' + e.data.height + ']';
						ed.execCommand( 'mceInsertContent', false, output );
					},
				}, {
					plugin_url : url,
				});
			});
		},

		createControl : function( n, cm ) {
			return null;
		},

		getInfo : function() {
			return {
				longname : 'WP-PhotoNav plugin',
				author : 'Fabian Stanke',
				authorurl : 'http://fmos.at',
				infourl : 'http://fmos.at/wp-photonav',
				version : "1.2"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add( 'photonav', tinymce.plugins.PhotoNav );
})();