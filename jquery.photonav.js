// vim: ai ts=4 sts=4 et sw=4

/*
 * 	PhotoNavigation for WordPress
 * 	
 * 	Version 0.7
 * 	Date: 10-08-15
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

(function ($) { $.fn.photoNav = function(settings) {
    var config = {mode: 'move', popup: 'none'};

    if (settings) $.extend(config, settings);

    /*
     * This event handler processes mousemove events if the element is in the "move"
     * mode. The handler is attached to the container element.
     */
    function initMove(container) {
        container.bind('mousemove', function (event) {
                var image = $(this).find('img');
                var offset = $(this).offset();
                var curX = (this.offsetWidth - image[0].offsetWidth) /
                           (this.offsetWidth / (event.pageX - offset.left));
                var curY = (this.offsetHeight - image[0].offsetHeight) /
                           (this.offsetHeight / (event.pageY - offset.top));
                image.css('margin-left', curX > 0 ? 0 : curX);
                image.css('margin-top', curY > 0 ? 0 : curY);
            });
    }

    function initDrag(container) {
        var image = container.find('img');
        var constraints = [0,0,0,0];
        constraints[0] = container.offset().left - image.width()  + container.width();
        constraints[1] = container.offset().top  - image.height() + container.height();
        constraints[2] = container.offset().left;
        constraints[3] = container.offset().top;
        image.draggable({containment: constraints});
    }

    function initDrag360(container) {
        var image = container.find('.image');
        var imageWidth = image.children('img').width();
        var constraints = [0,0,0,0];
        constraints[0] = container.offset().left - imageWidth     - container.width() ;
        constraints[1] = container.offset().top  - image.height() + container.height();
        constraints[2] = container.offset().left + imageWidth;
        constraints[3] = container.offset().top;
        image.css('width', imageWidth + container.width() + 2);
        image.draggable({
            containment: constraints,
            drag: function(e, ui) {
                var newleft = ui.position.left % imageWidth;
                if (newleft > 0) {
                    newleft -= imageWidth;
                }
                ui.position.left = newleft;
            }
        });
    }

    /*
     * Calls the appropriate init method above depending on the mode parameter.
     */
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

    /*
     * Initializes the ColorBox popup.
     */
    function initColorbox(image, popup, mode) {
            var container = popup.children('.container');
            image.colorbox({
                    maxWidth: '100%', maxHeight: '100%', inline: true, href: popup[0],
                    onOpen: function () {
                            container.css('width', 'auto');
                            container.css('height', image.height());
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

    function createPhotoNav(photonav, mode, popup_type) {
        var container = photonav.children('.container');
        var popup = photonav.find('.popup');

        container.css('display', 'block'); // show PhotoNav instance
        photonav.find('.image').each(function () {
            $(this).css('height', $(this).find('img').height())
        });

        initMode(container, mode);

        if (popup_type == 'colorbox') {
            initColorbox(container.find('img'), popup, mode);
        }
    }

    this.each(function() {
        createPhotoNav($(this), config['mode'], config['popup']);
    });

    return this;
}; })(jQuery);
