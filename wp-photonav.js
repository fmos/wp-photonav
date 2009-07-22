/*
 * 	PhotoNavigation for WordPress
 * 	
 * 	Version 0.1
 * 	Date: 09-07-17
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
 
function PhotoNav_addStatus(str) 
{
	if (this.debugging == true) 
	{
		this.statusArr.unshift(str);
		this.statusArr.splice(3, 10);
		jQuery("#status").html("");
		for (var i = 2; i > 0; i = i - 1) 
		{
			jQuery("#status").html(this.statusArr[i] + "<br />" + jQuery("#status").html());
		}
	}
}
	
function PhotoNav_posPicture(x)
{
	var full = this.photoWidth;
	full = full - this.containerWidth;
	var curX = full * (x / 100);
	if (curX < 0) curX = 0;
	this.addStatus("Mouse X container: " + curX);
	this.photo.css({
		'marginLeft': '-' + curX + 'px'
	});
}

function photoNavMouseMove(event)
{
	var x = event.pageX - this.offsetLeft;
	var y = event.pageY - this.offsetTop;
	var perc = (100 / (this.photoNav.containerWidth / x));
	this.photoNav.posPicture(perc);
	this.photoNav.addStatus('X: ' + x + '  Y:' + y + ' ' + perc + '%');
}

function PhotoNav(id, containerWidth, photoWidth, debugging)
{
	this.statusArr = new Array();
	//make room in status array
	this.statusArr[0] = "";
	this.statusArr[1] = "";
	this.photo = "";
	this.container = "";
	
	this.id = id;
	this.containerWidth = containerWidth;
	this.photoWidth = photoWidth;
	this.debugging = false;
	
	this.addStatus = PhotoNav_addStatus;
	this.posPicture = PhotoNav_posPicture;
	
	//catch undefined vars
	if (typeof(debugging) != 'undefined') 
	{
		this.debugging = debugging;
	}
	
	var photoNav = this;
	jQuery("#" + id).each(function(i) {
		this.photoNav = photoNav;
		jQuery(this).mousemove(photoNavMouseMove);
	});
	
	jQuery("#" + id + " .photo").each(function(i) {
		photoNav.photo = jQuery(this);
	});
}
