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
			animate : '0'
	};

	if (settings)
		$.extend(config, settings);

	function PhotoNav(elem) {
		var self = this;

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
			function updateMove() {
				var iw = self.getImageWidth(), ih = self.getImageHeight();
				content.css('width', iw);
				content.css('height', ih);
				var overflow =  container.width() - iw;
				content.css('left', Math.min(0, overflow/2));
				content.css('top', Math.min(0, (container.height()-ih)/2));
				return [0, overflow];
			};
			var anirange = updateMove();
			container.mousemove(function(event) {
				var offset = $(this).offset();
				var curX = (event.pageX - offset.left) * (1 - self.getImageWidth() / this.offsetWidth);
				var curY = (event.pageY - offset.top) * (1 - self.getImageHeight() / this.offsetHeight);
				content.stop();
				content.css('left', curX > 0 ? 0 : curX);
				content.css('top', curY > 0 ? 0 : curY);
			});
			content.children('.image').load(updateMove);
			return anirange;
		};

		this.initDrag = function(container) {
			var content = container.find('.content');
			var wrapper = content.parent();
			if (wrapper.attr('class') != 'dragconstraint') {
				wrapper = content.wrap('<div class="dragconstraint" />').parent();
			}
			function updateDrag() {
				var iw = self.getImageWidth(), ih = self.getImageHeight();
				content.css('width', iw);
				content.css('height', ih);
				var cw = container.width(), ch = container.height();
				var ww = 2*iw - cw;
				var wh = 2*ih - ch;
				wrapper.width(ww);
				wrapper.css('margin-left', (cw-ww)/2);
				wrapper.height(wh);
				wrapper.css('margin-top', (ch-wh)/2);
				content.css('left', Math.max(0, (iw-cw)/2));
				content.css('top', Math.max(0, (ih-ch)/2));
				return [iw-cw, 0];
			}
			var anirange = updateDrag();
			content.draggable({
				start : function() {
					$(this).stop(); // Stop animation
				},
				containment : 'parent'
			});
			content.children('.image').load(updateDrag);
			return anirange;
		};

		this.initDrag360 = function(container) {
			var content = container.find('.content');
			var wrapper = content.parent();
			if (wrapper.attr('class') != 'dragconstraint') {
				wrapper = content.wrap('<div class="dragconstraint" />').parent();
			}
			function updateDrag360() {
				var iw = self.getImageWidth(), ih = self.getImageHeight();
				var cw = container.width(), ch = container.height();
				content.css('width', iw + cw + 2);
				content.css('height', ih);
				var ww = 2*iw + cw + 4;
				var wh = 2*ih - ch;
				wrapper.width(ww);
				wrapper.css('margin-left', (cw-ww)/2);
				wrapper.height(wh);
				wrapper.css('margin-top', (ch-wh)/2);
				content.css('left', Math.max(0,(iw+cw)/2));
				content.css('top', Math.max(0,(ih-ch)/2));
				return [iw, cw];
			}
			var anirange = updateDrag360();
			content.draggable({
				start : function() {
					$(this).stop();
				},
				drag : function(e, ui) {
					var iw = self.getImageWidth();
					var newleft = ui.position.left;
					if (newleft > iw) {
						$(this).data('draggable').offset.click.left += iw;
					} else if (newleft < 1) {
						$(this).data('draggable').offset.click.left -= iw;
					}
				},
				containment : 'parent'
			});
			content.children('.image').load(updateDrag360);
			return anirange;
		};

		// Calls the appropriate init method above depending on the mode
		// parameter.
		this.initMode = function(container, mode) {
			if (mode == 'move') {
				return self.initMove(container);
			} else if (mode == 'drag') {
				return self.initDrag(container);
			} else if (mode == 'drag360') {
				return self.initDrag360(container);
			}
		};

		// Sets up the animation
		this.initAnimation = function(container, anirange) {
			inline.find('.content').each(
					function() {
						var image = $(this).find('.image');
						var minLeft = container.offset().left - self.getImageWidth() + container.width();
						$(this).css('left', anirange[0]);
						$(this).animate({
							left : anirange[1]
						}, 10 * Math.abs(anirange[1] - anirange[0]), 'linear');
					});
		};

		// Initializes the ColorBox popup.
		this.initColorbox = function(popup, id, mode) {
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
						self.initMode(container, mode);
					});
				}
			});
		};

		this.init = function(id, mode, popup_type, animate) {
			inline.css('display', 'block'); // unhide
			anirange = self.initMode(inline, mode);
			if (animate == '1')
				self.initAnimation(inline, anirange);
			if (popup_type == 'colorbox') {
				if ($().colorbox) {
					self.initColorbox(elem.find('.popup'), id, mode);
				}
			}
		};
	};

	this.each(function() {
		var photonav = new PhotoNav($(this));
		photonav.init(config['id'], config['mode'], config['popup'], config['animate']);
	});

	return this;
};}(jQuery));
