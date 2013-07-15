/*
 *  PhotoNavigation for WordPress "WP-PhotoNav"
 *
 *  Version: 1.1.0
 *  Date: 13-09-15
 *  Author: Fabian Stanke
 *  Author URI: http://fmos.at
 *  License: GPL version 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 */

/*  Credits:
 *
 * 	PhotoNavigation the jQuery version
 * 	A Javascript Module by Gaya Kessler
 * 	Version 1.0
 * 	Date: 09-04-09 
 */

(function($) {

$.ui.plugin.add("draggable", "infinite", {
	drag: function(event, ui) {
		if (ui.position.left > - 2) {
			// right-dragging wrap around
			ui.position.left -= ui.helper.wrapwidth;
		} else if (ui.position.left < - ui.helper.wrapwidth - 1) {
			// left-dragging wrap around
			ui.position.left += ui.helper.wrapwidth;
		}
		return true;
	}
});

$.fn.photoNav = function(settings) {
	var defaults = {
		id : false,
		mode : 'move',
		popup : 'none',
		animate : '0',
		position : 'center',
		label : 'none'
	};

	function PhotoNav(elem) {
		var self = this;
		var config;

		var inline = elem.children('.container');
		var image = inline.find('.image');

		this.getImageWidth = function() {
			return image[0].scrollWidth;
		};
		this.getImageHeight = function() {
			return image[0].scrollHeight;
		};

		this.initMove = function(container) {
			var content = container.find('.content');
			container.mousemove(function(event) {
				var offset = $(this).offset();
				var curX = (event.pageX - offset.left) * (1 - self.getImageWidth() / this.offsetWidth);
				var curY = (event.pageY - offset.top) * (1 - self.getImageHeight() / this.offsetHeight);
				content.stop(); // stop animation
				content.css('left', curX > 0 ? 0 : curX);
				content.css('top', curY > 0 ? 0 : curY);
			});
		};

		this.initDrag = function(container) {
			var content = container.find('.content');
			content.draggable({
				start : function(event, ui) {
					$(this).stop(); // stop animation
				},
				scroll : false
			});
			// Return a callback that gets called with the image dimensions
			return function(container, content, iw, ih, cw, ch) {
				var co = container.offset();
				var containment = [co.left + cw - iw, co.top + ch - ih, co.left, co.top];
				content.draggable("option", "containment", containment);
			}
		};

		this.initDrag360 = function(container) {
			var content = container.find('.content');
			content.draggable({
				start : function(e, ui) {
					$(this).stop(); // stop animation
					ui.helper.wrapwidth = self.getImageWidth();
				},
				scroll : false,
				infinite : true // activate the plugin defined above
			});
			// Return a callback that gets called with the image dimensions
			return function(container, content, iw, ih, cw, ch) {
				content.css('width', iw + cw + 2); // for 360 mode, the dragable content is enlarged
				var co = container.offset();
				var containment = [, co.top + ch - ih, , co.top]; // no horizontal containment
				content.draggable("option", "containment", containment);
			}
		};

		// Parse the position parameters
		this.parsePos = function(position, dimage, dcontainer) {
			var result;
			switch (position) {
				case 'center':
					result = (dcontainer - dimage) / 2;
					break;
				case 'left':
				case 'top':
					result = (dcontainer - dimage);
					break;
				case 'right':
				case 'bottom':
					result = 0;
					break;
				default:
					result = parseFloat(position);
					break;
			}
			return result;
		}

		this.imageLoaded = function(container, callback) {
			var content = container.find('.content');
			var iw = self.getImageWidth(), ih = self.getImageHeight();
			var cw = container.width(); // the div element horizontally fills the parent
			var ch = container.height(); // determine whether a manually assigned height is used
			if (ch == 0) {
				ch = ih; // ... otherwise use the image height
				container.height(ch);
			}
			var leftStart = self.parsePos(config.position, iw, cw);
			content.css('left', leftStart);
			content.css('top', Math.min(0, (ch - ih)/2));
			if (callback) callback(container, content, iw, ih, cw, ch);
			$(window).resize(function() {
				if ((container.width() != cw) || (container.height() != ch)) {
					cw = container.width(); ch = container.height();
					var pos = content.position();
					if (pos.left < cw - iw) content.css('left', cw - iw);
					if (pos.top < ch - ih) content.css('top', ch - ih);
					if (callback) callback(container, content, iw, ih, cw, ch);
				}
			});
			if (config.animate == '1') {
				var leftEnd = self.parsePos('right', iw, cw);
				animate_loop = function(c) {
					c.css('left', c.position().left - iw);
					c.animate({
						left : leftEnd
					}, 10 * Math.abs(iw), 'linear', function() {
						setTimeout(function() { 
							animate_loop(c);
						}, 1);
					});
				};
				content.each(function() { 
					$(this).animate({
						left : leftEnd
					}, 10 * Math.abs(leftEnd - leftStart), 'linear', function() {
						if (config.mode == 'drag360') animate_loop($(this)); 
					});
				});
			}			
		};

		// Calls the appropriate init method above depending on the mode parameter.
		this.initMode = function(container) {
			var callback;
			switch (config.mode) {
				case 'move':
					callback = self.initMove(container);
					break;
				case 'drag':
					callback = self.initDrag(container);
					break;
				case 'drag360':
					callback = self.initDrag360(container);
					break;
			}
			container.find('.image').one('load', function() {
				self.imageLoaded(container, callback);
			}).each(function() {
				if (this.complete) $(this).load();
			});
		};

		// Initializes the ColorBox popup.
		this.initColorbox = function(popup) {
			var container = popup.children('.container');
			var content = container.children('.content');
			image.colorbox({
				maxWidth : '100%',
				maxHeight : '100%',
				width : self.getImageWidth(),
				inline : true,
				href : popup,
				onOpen : function() {
					container.css('width', 'auto');
					container.css('height', self.getImageHeight());
					content.css('background-repeat', 'repeat');
					content.css('height', self.getImageHeight());
				},
				onComplete : function() {
					popup.each(function () {
						var container = $(this).children('.container');
						var innerHeight = $(this).parent().innerHeight();
						if (innerHeight < $(this).height()) {
							container.css('height', innerHeight);
						}
						self.initMode(container);
					});
				}
			});
		};

		// Initialize on jQuery.ready event, do as much as possible to use the time while loading the image
		this.init = function(c) {
			config = c;
			inline.css('display', 'block'); // unhide (skip load optimization)
			self.initMode(inline);
			if (config.popup == 'colorbox') {
				if ($().colorbox) {
					self.initColorbox(elem.find('.popup'));
				}
			}
			if (config.label != 'none') {
				label = document.createElement('div');
				label.className = 'label';
				inline.append(label);
				elem.hover(function() { $(label).fadeTo('fast', 0.0); }, function() { $(label).fadeTo('fast', 1.0); });
			}
		};
	};

	this.each(function() {
		var photonav = new PhotoNav($(this));
		var config = settings ? $.extend({}, defaults, settings) : $.extend({}, defaults)
		photonav.init(config);
	});

	return this;
};

}(jQuery));
