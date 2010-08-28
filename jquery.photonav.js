// vim: ai ts=4 sts=4 et sw=4

/*
 * 	PhotoNavigation for WordPress
 * 	
 * 	Version 0.7
 * 	Date: 10-08-28
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
            container.bind('mousemove', function (event) {
                var image = $(this).find('img');
                var offset = $(this).offset();
                var curX = (this.offsetWidth - image[0].offsetWidth) /
                (this.offsetWidth / (event.pageX - offset.left));
                var curY = (this.offsetHeight - image[0].offsetHeight) /
                (this.offsetHeight / (event.pageY - offset.top));
                var imageWrapper = $(this).find('.image');
                imageWrapper.stop();
                imageWrapper.css('left', curX > 0 ? 0 : curX);
                imageWrapper.css('top',  curY > 0 ? 0 : curY);
            });
        }

        function initDrag(container) {
            var image = container.find('img');
            var constraints = [0,0,0,0];
            constraints[0] = container.offset().left - image.width()  + container.width();
            constraints[1] = container.offset().top  - image.height() + container.height();
            constraints[2] = container.offset().left;
            constraints[3] = container.offset().top;
            container.find('.image').draggable({
                containment: constraints,
                start: function() {
                    $(this).stop();
                }
            });
        }

        function initDrag360(container) {
            var image = container.find('img');
            var constraints = [0,0,0,0];
            constraints[0] = container.offset().left - image.width()  - container.width() ;
            constraints[1] = container.offset().top  - image.height() + container.height();
            constraints[2] = container.offset().left + image.width();
            constraints[3] = container.offset().top;
            var imageWrapper = container.find('.image');
            imageWrapper.css('width', image.width() + container.width() + 2);
            imageWrapper.draggable({
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

        // Initializes the ColorBox popup.
        function initColorbox(image, popup, mode) {
            var container = popup.children('.container');
            var innerImage = container.children('.image');
            image.colorbox({
                maxWidth: '100%',
                maxHeight: '100%',
                inline: true,
                href: popup[0],
                onOpen: function () {
                    container.css('width', 'auto');
                    container.css('height', image.height());
                    innerImage.css('background-repeat', 'repeat');
                    innerImage.css('height', image.height());
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

        function createPhotoNav(photonav, mode, popup_type, animate) {
            var inline = photonav.children('.container');
            var popup = photonav.find('.popup');

            inline.css('display', 'block'); // show PhotoNav instance
            photonav.find('.image').each(function () {
                $(this).css('height', $(this).find('img').height());
            });
            inline.find('.image').each(function () {
                var minLeft = inline.offset().left - $(this).find('img').width()  + inline.width()
                if (animate == '1') {
                    $(this).css('left', 0);
                    $(this).animate({
                        left: minLeft
                    }, -10*minLeft, 'linear');
                }
            });

            initMode(inline, mode);

            if (popup_type == 'colorbox') {
                initColorbox(inline.find('img'), popup, mode);
            }
        }

        this.each(function() {
            createPhotoNav($(this), config['mode'], config['popup'], config['animate']);
        });

        return this;
    };
})(jQuery);
