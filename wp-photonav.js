/*
 * 	PhotoNavigation for WordPress
 * 	
 * 	Version 0.5
 * 	Date: 10-03-21
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

function containerReady(obj, mode)
{
    var photo = obj.children(".photo");
    var constraints = [0,0,0,0];
    if (mode == 'drag') {
        constraints[0] = obj.width() - photo.width() + obj.offset().left;
        constraints[1] = obj.height() - photo.height() + obj.offset().top;
        constraints[2] = obj.offset().left;
        constraints[3] = obj.offset().top;
        photo.draggable({ containment: constraints });
    }
    else if (mode == 'drag360') {
        constraints[0] = obj.offset().left - obj.width() - photo.width();
        constraints[1] = obj.height() - photo.height() + obj.offset().top;
        constraints[2] = obj.offset().left + photo.width();
        constraints[3] = obj.offset().top;
        var totalwidth = photo.width() + obj.width() + 2;
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
    else if (mode == 'move') {
        obj.bind("mousemove", {
            container: obj,
            photo: obj.children(".photo")[0]
        }, containerMouseMove);
    }
}

function createPhotoNav(id, mode)
{
    var container = jQuery("#" + id);
    container.css("display", "block");
    container.ready(containerReady(container, mode));
}
