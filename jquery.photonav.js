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

function PhotoNav(elem) {
	var self = this;

	var inline = elem.children('.container');
	var image = inline.find('.image');

	this.updateContent = function(width) {
		// Copy the image size to all content DIVs
		if (width == undefined) {
			width = image.width();
		}
		elem.find('.content').each(function() {
			jQuery(this).css('height', image.height());
			jQuery(this).css('width', image.width());
		});
	};

	this.initMove = function(container) {
		var content = container.find('.content');
		container.mousemove(function(event) {
			var offset = jQuery(this).offset();
			var curX = (event.pageX - offset.left)
					* (1 - image[0].offsetWidth / this.offsetWidth);
			var curY = (event.pageY - offset.top)
					* (1 - image[0].offsetHeight / this.offsetHeight);
			content.stop();
			content.css('left', curX > 0 ? 0 : curX);
			content.css('top', curY > 0 ? 0 : curY);
		});
		image.load(function() {
			self.updateContent();
		});
	};

	this.initDrag = function(container) {
		var content = container.find('.content');
		content.draggable({
			start : function() {
				jQuery(this).stop();
			}
		});
		function updateConstraints() {
			var constraints = [ 0, 0, 0, 0 ];
			constraints[2] = container.offset().left;
			constraints[3] = container.offset().top;
			constraints[0] = constraints[2] - image.width() + container.width();
			constraints[1] = constraints[3] - image.height()
					+ container.height();
			content.draggable('option', 'containment', constraints);
		}
		updateConstraints();
		image.load(function() {
			self.updateContent();
			updateConstraints();
		});
	};

	this.initDrag360 = function(container) {
		var content = container.find('.content');
		content.css('width', image.width() + container.width() + 2);
		content.draggable({
			start : function() {
				jQuery(this).stop();
			},
			drag : function(e, ui) {
				var newleft = ui.position.left % image.width();
				if (newleft > 0) {
					newleft -= image.width();
				}
				ui.position.left = newleft;
			}
		});
		function updateConstraints() {
			var constraints = [ 0, 0, 0, 0 ];
			constraints[0] = container.offset().left - image.width()
					- container.width();
			constraints[1] = container.offset().top - image.height()
					+ container.height();
			constraints[2] = container.offset().left + image.width();
			constraints[3] = container.offset().top;
			content.draggable('option', 'containment', constraints);
		}
		updateConstraints();
		image.load(function() {
			updateContent(image.width() + container.width() + 2);
			updateConstraints();
		});
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
					var image = jQuery(this).find('.image');
					var minLeft = container.offset().left - image.width()
							+ container.width();
					jQuery(this).css('left', 0);
					jQuery(this).animate({
						left : minLeft
					}, -10 * minLeft, 'linear');
				});
	};

	// Initializes the ColorBox popup.
	this.initColorbox = function(popup, mode) {
		var container = popup.children('.container');
		var content = container.children('.content');
		image.colorbox({
			maxWidth : '100%',
			maxHeight : '100%',
			inline : true,
			href : popup[0],
			onOpen : function() {
				container.css('width', 'auto');
				container.css('height', image.height());
				content.css('background-repeat', 'repeat');
				content.css('height', image.height());
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

jQuery.fn.photoNav = function(settings) {
	var config = {
		mode : 'move',
		popup : 'none',
		animate : '0'
	};

	if (settings)
		jQuery.extend(config, settings);

	this.each(function() {
		var instance = new PhotoNav(jQuery(this));
		instance.init(config['mode'], config['popup'], config['animate']);
	});

	return this;
};
