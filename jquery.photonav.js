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
		var image = inline.find('.image')[0]; // find to traverse dragconstraints

		this.initMove = function(container) {
			var content = container.find('.content');
			function updateMove() {
				var iw = image.scrollWidth, cw = container.width();
				var ih = image.scrollHeight, ch = container.height();
				content.width(iw);
				content.height(ih);
				content.css('left', Math.min(0,(cw-iw)/2));
				content.css('top', Math.min(0,(ch-ih)/2));
				return [0, cw-iw];
			};
			container.mousemove(function(event) {
				var offset = $(this).offset();
				var curX = (event.pageX - offset.left) * (1 - image.scrollWidth / this.offsetWidth);
				var curY = (event.pageY - offset.top) * (1 - image.scrollHeight / this.offsetHeight);
				content.stop();
				content.css('left', curX > 0 ? 0 : curX);
				content.css('top', curY > 0 ? 0 : curY);
			});
			return updateMove;
		};

		this.initDrag = function(container) {
			var content = container.find('.content');
			var wrapper = content.parent();
			if (wrapper.attr('class') != 'dragconstraint') {
				wrapper = content.wrap('<div class="dragconstraint" />').parent();
			}
			function updateDrag() {
				var iw = image.scrollWidth, cw = container.width();
				var ww = 2*iw - cw;
				var ih = image.scrollHeight, ch = container.height();
				var wh = 2*ih - ch;
				content.width(iw);
				content.height(ih);
				wrapper.width(ww);
				wrapper.css('margin-left', (cw-ww)/2);
				wrapper.height(wh);
				wrapper.css('margin-top', (ch-wh)/2);
				content.css('left', Math.max(0,(iw-cw)/2));
				content.css('top', Math.max(0,(ih-ch)/2));
				return [iw-cw,0];
			}
			//updateDrag();
			content.draggable({
				start : function() {
					$(this).stop(); // Stop animation
				},
				containment : 'parent'
			});
			return updateDrag;
		};

		this.initDrag360 = function(container) {
			var content = container.find('.content');
			var wrapper = content.parent();
			if (wrapper.attr('class') != 'dragconstraint') {
				wrapper = content.wrap('<div class="dragconstraint" />').parent();
			}
			function updateDrag360() {
				var iw = image.scrollWidth, cw = container.width();
				var ww = 2*iw + cw + 4;
				var ih = image.scrollHeight, ch = container.height();
				var wh = 2*ih - ch;
				wrapper.width(ww);
				wrapper.css('margin-left', (cw-ww)/2);
				wrapper.height(wh);
				wrapper.css('margin-top', (ch-wh)/2);
				content.width(iw + cw + 2);
				content.height(ih);
				content.css('left', Math.max(0,(iw+cw)/2));
				content.css('top', Math.max(0,(ih-ch)/2));
				return [iw, cw];
			}
			content.draggable({
				start : function() {
					$(this).stop();
				},
				drag : function(e, ui) {
					var iw = image.scrollWidth;
					var newleft = ui.position.left;
					if (newleft > iw) {
						$(this).data('draggable').offset.click.left += iw;
					} else if (newleft < 1) {
						$(this).data('draggable').offset.click.left -= iw;
					}
				},
				containment : 'parent'
			});
			return updateDrag360;
		};

		// Sets up the animation (called on load)
		this.initAnimation = function(container, anirange) {
			var content = container.find('.content');
			content.css('left', anirange[0]);
			content.animate({ left : anirange[1] }, 10 * Math.abs(anirange[1] - anirange[0]), 'linear');
		};

		// Calls the appropriate init method above depending on the mode
		// parameter. Can be called for the inline or popup view
		this.initView = function(container, mode, animate) {
			var callback = function() { console.warn("initView callback undefined"); };
			if (mode == 'move') {
				callback = self.initMove(container);
			} else if (mode == 'drag') {
				callback = self.initDrag(container);
			} else if (mode == 'drag360') {
				callback = self.initDrag360(container);
			}
			return function() {
				var anirange = callback();
				if (animate) {
					self.initAnimation(container, anirange)
				}
			};
		};

		// Initializes the ColorBox popup.
		this.initColorbox = function(popup, id, mode, animate) {
			var popupid = id + '-popup';
			popup.attr('id', popupid);
			var container = popup.children('.container');
			var content = container.find('.content');
            inline.find('.content').colorbox({
				maxWidth : '100%',
				maxHeight : '100%',
				inline : true,
				href : '#'+popupid,
				onOpen : function() {
					container.css('width', 'auto');
					container.css('height', image.scrollHeight);
					content.css('background-repeat', 'repeat');
					content.css('height', image.scrollHeight);
				},
				onComplete : function() {
					$('#'+popupid).each(function () {
						var container = $(this).children('.container');
						container.css('height', image.scrollHeight);
						container.find('.content').css('height', image.scrollHeight);
						var innerHeight = $(this).parent().innerHeight();
						if (innerHeight < $(this).height()) {
							container.css('height', innerHeight);
						}
						callback = self.initView(container, mode, animate);
						callback();
					});
				}
			});
		};

		// Initialisation of one instance, 
		this.init = function(id, mode, popup_type, animate) {
			inline.css('display', 'block'); // unhide
			var callback = self.initView(inline, mode, animate);
			inline.find('.content').children('.image').one('load', function() {
				callback();
				if (popup_type == 'colorbox') {
					if ($().colorbox) {
						self.initColorbox(elem.find('.popup'), id, mode, animate);
					}
				}
			}).each(function() {
				if (this.complete) $(this).load();
			});
		};
	};

	this.each(function() {
		var photonav = new PhotoNav($(this));
		photonav.init(config['id'], config['mode'], config['popup'], config['animate'] == '1');
	});

	return this;
};}(jQuery));