/*
 *  PhotoNavigation for WordPress "WP-PhotoNav"
 *
 *  Version: 1.0.2
 *  Date: 13-07-07
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

(function($) {$.fn.photoNav = function(settings) {
	var config = {
			id : false,
			mode : 'move',
			popup : 'none',
			animate : '0',
			position : 'center'
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

		/* PhotoNav DOM tree notes

		   .photonav -> .container -> .content -> .image

		   .image is wrapped in .content for uniformity with the drag360 mode, 
		   where the image is assigned as x-repeat background of .content

		   .container is separate from .photonav, because the .photonav comprises
		   two .containers: one for inline view and one for popup/lightbox view

		 */

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
				start : function() {
					$(this).stop(); // stop animation
				},
				drag : function(e, ui) {
					var iw = self.getImageWidth();
					var newleft = ui.position.left;
					if (newleft > - 2) {
						$(this).data('draggable').offset.click.left += iw;
					} else if (newleft < - iw - 1) {
						$(this).data('draggable').offset.click.left -= iw;
					}
				},
				scroll : false
			});
			// Return a callback that gets called with the image dimensions
			return function(container, content, iw, ih, cw, ch) {
				content.css('width', iw + cw + 2); // for 360 mode, the dragable content is enlarged
				var co = container.offset();
				var containment = [co.left - iw - 2, co.top + ch - ih, co.left, co.top];
				content.draggable("option", "containment", containment);
			}
		};

		// Parse the position parameters
		this.parsePos = function(position, dimage, dcontainer) {
			if (position == 'center') {
				result = (dcontainer - dimage) / 2;
			} else if (position == 'left') {
				result = (dcontainer - dimage);
			} else if (position == 'right') {
				result = 0;
			} else {
				result = parseFloat(position);
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
			if (config.animate == '1') {
				content.each(
					function() {
						var leftEnd = self.parsePos('right', iw, cw);
						$(this).animate({
							left : leftEnd
						}, 10 * Math.abs(leftEnd - leftStart), 'linear');
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
		this.initColorbox = function(popup, id, mode, position) {
			var popupid = id + '-popup';
			var container = popup.children('.container');
			var content = container.find('.content');
			popup.attr('id', popupid);
			image.colorbox({
				maxWidth : '100%',
				maxHeight : '100%',
				inline : true,
				href : '#'+popupid,
				onOpen : function() {
					container.css('width', 'auto');
					container.css('height', self.getImageHeight());
					content.css('background-repeat', 'repeat');
					content.css('height', self.getImageHeight());
				},
				onComplete : function() {
					$('#'+popupid).each(function () {
						var container = $(this).children('.container');
						var innerHeight = $(this).parent().innerHeight();
						if (innerHeight < $(this).height()) {
							container.css('height', innerHeight);
						}
						self.initMode(container, mode, position);
					});
				}
			});
		};

		// Initialize on jQuery.ready event, do as much as possible to use the time while loading the image
		this.init = function(c) {
			config = c;
			inline.css('display', 'block'); // unhide (skip load optimization)
			self.initMode(inline);

			if (config.popup_type == 'colorbox') {
				if ($().colorbox) {
					self.initColorbox(elem.find('.popup'));
				}
			}
		};
	};

	this.each(function() {
		var photonav = new PhotoNav($(this));
		var c = settings ? $.extend({}, config, settings) : $.extend({}, config)
		photonav.init(c);
	});

	return this;
};}(jQuery));
