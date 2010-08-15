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
 
/*
 * This event handler processes mousemove events if the element is in the "move" mode.
 * The handler is attached to the container element. 
 * 
 * Requires the photoWidth as input.
 */
function containerMouseMove(event)
{
    var offset = event.data.container.offset();
    var x = event.pageX - offset.left;
    var y = event.pageY - offset.top;
    var curX = (event.data.photo.offsetWidth - this.offsetWidth) / (this.offsetWidth / x);
    var curY = (event.data.photo.offsetHeight - this.offsetHeight) / (this.offsetHeight / y);
    if (curX < 0) curX = 0;
    if (curY < 0) curY = 0;
    event.data.photo.style.marginLeft = "-" + curX + "px";
    event.data.photo.style.marginTop = "-" + curY + "px";
}

/*
 * This event handler processes jQuery/Draggable.drag events and emulates
 * infinite dragging ability (360-degree rotation).
 */
function photoDrag(event, ui)
{
    //var photo_width = ui.helper.width() - 2 * ui.helper.css("margin-left");
    ui.position.left = ui.position.left % ui.helper.picture_width;
}

function initDrag(container)
{
    var photo = container.children(".photo");
    var constraints = [0,0,0,0];
    constraints[0] = container.width() - photo.width() + container.offset().left;
    constraints[1] = container.height() - photo.height() + container.offset().top;
    constraints[2] = container.offset().left;
    constraints[3] = container.offset().top;
    photo.draggable({ containment: constraints });
}

function initDrag360(container)
{
    var photo = container.children(".photo");
    var constraints = [0,0,0,0];
    constraints[0] = container.offset().left - container.width() - photo.width();
    constraints[1] = container.height() - photo.height() + container.offset().top;
    constraints[2] = container.offset().left + photo.width();
    constraints[3] = container.offset().top;
    var totalwidth = photo.width() + container.width() + 2;
    var photo_width = photo.width();
    photo.css("width", totalwidth);
    photo.draggable({
        containment: constraints,
        drag: function(e, ui) {
            var newleft = ui.position.left % photo_width;
            if (newleft > 0) {
                newleft -= photo_width;
            }
            ui.position.left = newleft;
        }
    });
}

function initMove(container)
{
    container.bind("mousemove", {
        container: container,
        photo: container.children(".photo")[0]
    }, containerMouseMove);
}

/*
 * Initialises the PhotoNav instance by calling the appropriate init method
 * above depending on the mode parameter. An invalid mode selection will leave
 * the PhotoNav instance hidden.
 * (This is being called inside jQuery.ready)
 */
function createPhotoNav(id, mode, popup)
{
    var container = jQuery(".container", "#" + id);
    if (mode == 'drag') {
        container.css("display", "block"); // show PhotoNav instance
        initDrag(container);
    }
    else if (mode == 'drag360') {
        container.css("display", "block"); // show PhotoNav instance
        initDrag360(container);
    }
    else if (mode == 'move') {
        container.css("display", "block"); // show PhotoNav instance
        initMove(container);
    }
    if (popup == 'colorbox') {
        var photo = container.children(".photo");
        photo.colorbox({maxWidth:"100%", inline: true, href: "#" + id});
    }
}
