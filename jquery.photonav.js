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

(function ($) {
    $.fn.photoNav = function(settings) {
        var config = {
            mode: 'move',
            popup: 'none',
            animate: '0'
        };

        if (settings) $.extend(config, settings);

        function initMove(container) {
        	var image = container.find('.image');
            var content = container.find('.content');
            container.bind('mousemove', function (event) {
                var offset = $(this).offset();
                var curX = (this.offsetWidth - image[0].offsetWidth) /
                (this.offsetWidth / (event.pageX - offset.left));
                var curY = (this.offsetHeight - image[0].offsetHeight) /
                (this.offsetHeight / (event.pageY - offset.top));
                content.stop();
                content.css('left', curX > 0 ? 0 : curX);
                content.css('top',  curY > 0 ? 0 : curY);
            });
        }

        function initDrag(container) {
            var image = container.find('.image');
            var constraints = [0,0,0,0];
            constraints[0] = container.offset().left - image.width()  + container.width();
            constraints[1] = container.offset().top  - image.height() + container.height();
            constraints[2] = container.offset().left;
            constraints[3] = container.offset().top;
            container.find('.content').draggable({
                containment: constraints,
                start: function() {
                    $(this).stop();
                }
            });
        }

        function initDrag360(container) {
            var image = container.find('.image');
            var constraints = [0,0,0,0];
            constraints[0] = container.offset().left - image.width()  - container.width() ;
            constraints[1] = container.offset().top  - image.height() + container.height();
            constraints[2] = container.offset().left + image.width();
            constraints[3] = container.offset().top;
            var content = container.find('.content');
            content.css('width', image.width() + container.width() + 2);
            content.draggable({
                containment: constraints,
                start: function() {
                    $(this).stop();
                },
                drag: function(e, ui) {
                    var newleft = ui.position.left % image.width();
                    if (newleft > 0) {
                        newleft -= image.width();
                    }
                    ui.position.left = newleft;
                }
            });
        }

        // Calls the appropriate init method above depending on the mode parameter.
        function initMode(container, mode) {
            if (mode == 'move') {
                initMove(container);
            }
            else if (mode == 'drag') {
                initDrag(container);
            }
            else if (mode == 'drag360') {
                initDrag360(container);
            }
        }

        // Sets up the animation
        function initAnimation(container) {
        	container.find('.content').each(function () {
            	var image = $(this).find('.image');
                var minLeft = container.offset().left - image.width()  + container.width();
                $(this).css('left', 0);
                $(this).animate({left: minLeft}, -10 * minLeft, 'linear');
            });
        }
        
        // Initializes the ColorBox popup.
        function initColorbox(image, popup, mode) {
            var container = popup.children('.container');
            var content = container.children('.content');
            image.colorbox({
                maxWidth: '100%',
                maxHeight: '100%',
                inline: true,
                href: popup[0],
                onOpen: function () {
                    container.css('width', 'auto');
                    container.css('height', image.height());
                    content.css('background-repeat', 'repeat');
                    content.css('height', image.height());
                },
                onComplete: function () {
                    var innerHeight = popup.parent().innerHeight();
                    if (innerHeight < popup.height()) {
                        container.css('height', innerHeight);
                    }
                    initMode(container, mode);
                }
            });
        }
        
        function loadPhotoNav(photonav, inline, image, mode, popup_type, animate) {
        	// Copy the image size to the content div
            photonav.find('.content').each(function () {
                $(this).css('height', image.height());
                $(this).css('width', image.width());
            });

            initMode(inline, mode);
            
            if (animate == '1') {
            	initAnimation(inline);
            }

            if (popup_type == 'colorbox') {
                initColorbox(image, photonav.find('.popup'), mode);
            }
        }

        function createPhotoNav(photonav, mode, popup_type, animate) {
            var inline = photonav.children('.container');
            var image = inline.find('.image'); 
            inline.css('display', 'block'); // show PhotoNav instance
            loadPhotoNav(photonav, inline, image, mode, popup_type, animate);
        	image.load(function () {
        		// Update the parameters when the image is loaded completely
            	loadPhotoNav(photonav, inline, $(this), mode, popup_type, animate);
            });
        }

        this.each(function() {
            createPhotoNav($(this), config['mode'], config['popup'], config['animate']);
        });

        return this;
    };
})(jQuery);
