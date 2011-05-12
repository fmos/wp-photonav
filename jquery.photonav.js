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

(function($) {
	$.fn.photoNav = function(settings) {
		var config = {
			mode : 'move',
			popup : 'none',
			animate : '0'
		};

		if (settings)
			$.extend(config, settings);

		function updateContent(photonav, width) {
			// Copy the image size to all content DIVs
			if (width == undefined) {
				width = photonav.image.width();
			}
			photonav.find('.content').each(function() {
				$(this).css('height', photonav.image.height());
				$(this).css('width', photonav.image.width());
			});
		}

		function initMove(photonav, container) {
			container.bind('mousemove',
					function(event) {
						var offset = $(this).offset();
						var curX = (event.pageX - offset.left)
								* (1 - photonav.image[0].offsetWidth
										/ this.offsetWidth);
						var curY = (event.pageY - offset.top)
								* (1 - photonav.image[0].offsetHeight
										/ this.offsetHeight);
						container.content.stop();
						container.content.css('left', curX > 0 ? 0 : curX);
						container.content.css('top', curY > 0 ? 0 : curY);
					});
			photonav.image.load(function() {
				updateContent(photonav);
			});
		}

		function initDrag(photonav, container) {
			container.content.draggable({
				containment : constraints,
				start : function() {
					$(this).stop();
				}
			});
			function updateConstraints() {
				var constraints = [ 0, 0, 0, 0 ];
				constraints[2] = container.offset().left;
				constraints[3] = container.offset().top;
				constraints[0] = constraints[2] - photonav.image.width()
						+ container.width();
				constraints[1] = constraints[3] - photonav.image.height()
						+ container.height();
				container.content.draggable('option', 'containment',
						constraints);
			}
			updateConstraints();
			photonav.image.load(function() {
				updateContent(photonav);
				updateConstraints();
			});
		}

		function initDrag360(photonav, container) {
			container.content.css('width', photonav.image.width()
					+ container.width() + 2);
			container.content.draggable({
				start : function() {
					$(this).stop();
				},
				drag : function(e, ui) {
					var newleft = ui.position.left % photonav.image.width();
					if (newleft > 0) {
						newleft -= photonav.image.width();
					}
					ui.position.left = newleft;
				}
			});
			function updateConstraints() {
				var constraints = [ 0, 0, 0, 0 ];
				constraints[0] = container.offset().left
						- photonav.image.width() - container.width();
				constraints[1] = container.offset().top
						- photonav.image.height() + container.height();
				constraints[2] = container.offset().left
						+ photonav.image.width();
				constraints[3] = container.offset().top;
				container.content.draggable('option', 'containment',
						constraints);
			}
			updateConstraints();
			photonav.image.load(function() {
				updateContent(photonav, photonav.image.width()
						+ container.width() + 2);
				updateConstraints();
			});
		}

		// Calls the appropriate init method above depending on the mode
		// parameter.
		function initMode(photonav, container, mode) {
			container.content = container.find('.content');
			if (mode == 'move') {
				initMove(photonav, container);
			} else if (mode == 'drag') {
				initDrag(photonav, container);
			} else if (mode == 'drag360') {
				initDrag360(photonav, container);
			}
		}

		// Sets up the animation
		function initAnimation(photonav) {
			photonav.inline.find('.content').each(
					function() {
						var image = $(this).find('.image');
						var minLeft = container.offset().left - image.width()
								+ container.width();
						$(this).css('left', 0);
						$(this).animate({
							left : minLeft
						}, -10 * minLeft, 'linear');
					});
		}

		// Initializes the ColorBox popup.
		function initColorbox(photonav, popup, mode) {
			var container = popup.children('.container');
			var content = container.children('.content');
			photonav.image.colorbox({
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
					initMode(container, mode);
				}
			});
		}

		function createPhotoNav(photonav, mode, popup_type, animate) {
			// Find the inline container (and not the popup)
			photonav.inline = photonav.children('.container');
			photonav.image = inline.find('.image');
			photonav.inline.css('display', 'block'); // show PhotoNav
			// instance

			updateContent(photonav);

			initMode(photonav, photonav.inline, mode);
			if (animate == '1')
				initAnimation(photonav);
			if (popup_type == 'colorbox')
				initColorbox(photonav, photonav.find('.popup'), mode);
		}

		this.each(function() {
			createPhotoNav($(this), config['mode'], config['popup'],
					config['animate']);
		});

		return this;
	};
})(jQuery);
