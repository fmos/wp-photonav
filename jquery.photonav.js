/*
 * 	PhotoNavigation for WordPress "WP-PhotoNav"
 * 	
 * 	Version 0.10
 * 	Date: 11-05-10
 * 
 */

/*  Credits:
 *
 * 	PhotoNavigation the jQuery version
 * 	A Javascript Module by Gaya Kessler
 * 	Version 1.0
 * 	Date: 09-04-09
 * 
 */

(function($) {$.fn.photoNav = function(settings) {
	var config = {
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

		this.updateContent = function(width) {
			// Copy the image size to all content DIVs
			if (width == undefined) {
				width = self.getImageWidth();
			}
			elem.find('.content').each(function() {
				var content = $(this); 
				content.css('height', self.getImageHeight());
				content.css('width', width);
			});
		};

		this.initMove = function(container) {
			var content = container.find('.content');
			function updateMove() {
				var iw = self.getImageWidth(), cw = container.width();
				var ih = self.getImageHeight(), ch = container.height();
				self.updateContent();
				content.css('left', Math.min(0,(cw-iw)/2));
				content.css('top', Math.min(0,(ch-ih)/2));
			};
			updateMove();
			container.mousemove(function(event) {
				var offset = $(this).offset();
				var curX = (event.pageX - offset.left)
						* (1 - self.getImageWidth() / this.offsetWidth);
				var curY = (event.pageY - offset.top)
						* (1 - self.getImageHeight() / this.offsetHeight);
				content.stop();
				content.css('left', curX > 0 ? 0 : curX);
				content.css('top', curY > 0 ? 0 : curY);
			});
			image.load(updateMove);
		};

		this.initDrag = function(container) {
			var content = container.find('.content');
			var wrapper = content.wrap('<div class="dragconstraint" />').parent();
			function updateDrag() {
				self.updateContent();
				var iw = self.getImageWidth(), cw = container.width();
				var ww = 2*iw - cw;
				var ih = self.getImageHeight(), ch = container.height();
				var wh = 2*ih - ch;
				wrapper.width(ww);
				wrapper.css('margin-left', (cw-ww)/2);
				wrapper.height(wh);
				wrapper.css('margin-top', (ch-wh)/2);
				content.css('left', Math.max(0,(iw-cw)/2));
				content.css('top', Math.max(0,(ih-ch)/2));
			}
			updateDrag();
			content.draggable({
				start : function() {
					$(this).stop(); // Stop animation
				},
				containment : 'parent'
			});
			image.load(updateDrag);
		};

		this.initDrag360 = function(container) {
			var content = container.find('.content');
			var wrapper = content.wrap('<div class="dragconstraint" />').parent();
			function updateDrag360() {
				var iw = self.getImageWidth(), cw = container.width();
				var ww = 2*iw + cw + 4;
				var ih = self.getImageHeight(), ch = container.height();
				var wh = 2*ih - ch;
				wrapper.width(ww);
				wrapper.css('margin-left', (cw-ww)/2);
				wrapper.height(wh);
				wrapper.css('margin-top', (ch-wh)/2);
				self.updateContent(iw + cw + 2);
				content.css('left', Math.max(0,(iw+cw)/2));
				content.css('top', Math.max(0,(ih-ch)/2));
			}
			updateDrag360();
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
			image.load(updateDrag360);
		};

		// Calls the appropriate init method above depending on the mode
		// parameter.
		this.initMode = function(container, mode) {
			if (mode == 'move') {
				self.initMove(container);
			} else if (mode == 'drag') {
				self.initDrag(container);
			} else if (mode == 'drag360') {
				self.initDrag360(container);
			}
		};

		// Sets up the animation
		this.initAnimation = function() {
			inline.find('.content').each(
					function() {
						var image = $(this).find('.image');
						var minLeft = container.offset().left - self.getImageWidth()
								+ container.width();
						$(this).css('left', 0);
						$(this).animate({
							left : minLeft
						}, -10 * minLeft, 'linear');
					});
		};

		// Initializes the ColorBox popup.
		this.initColorbox = function(popup, mode) {
			var container = popup.children('.container');
			var content = container.find('.content');
			image.colorbox({
				maxWidth : '100%',
				maxHeight : '100%',
				inline : true,
				href : popup[0],
				onOpen : function() {
					container.css('width', 'auto');
					container.css('height', self.getImageHeight());
					content.css('background-repeat', 'repeat');
					content.css('height', self.getImageHeight());
				},
				onComplete : function() {
					var innerHeight = popup.parent().innerHeight();
					if (innerHeight < popup.height()) {
						container.css('height', innerHeight);
					}
					self.initMode(container, mode);
				}
			});
		};

		this.init = function(mode, popup_type, animate) {
			inline.css('display', 'block'); // unhide
			self.updateContent();
			self.initMode(inline, mode);
			if (animate == '1')
				self.initAnimation();
			if (popup_type == 'colorbox')
				self.initColorbox(elem.find('.popup'), mode);
		};
	};

	this.each(function() {
		var photonav = new PhotoNav($(this));
		photonav.init(config['mode'], config['popup'], config['animate']);
	});

	return this;
};}(jQuery));
