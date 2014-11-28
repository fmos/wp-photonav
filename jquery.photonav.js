/*
 *  PhotoNavigation for WordPress "WP-PhotoNav"
 *
 *  Version: 1.2.1
 *  Date: 16-08-14
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

(function( $ ) {

	// Extend the draggable plugin for 360 degree "infinite" dragging
	$.ui.plugin.add( 'draggable', 'infinite', {
		drag: function( event, ui ) {
			if ( ui.position.left > -2 ) {
				// right-dragging wrap around
				ui.position.left -= ui.helper.wrapwidth;
			} else if ( ui.position.left < -ui.helper.wrapwidth - 1 ) {
				// left-dragging wrap around
				ui.position.left += ui.helper.wrapwidth;
			}
			return true;
		}
	});

	$.fn.photoNav = function( settings ) {
		var defaults = {
			mode: 'move',
			popup: 'none',
			animate: 'none',
			speed: 1,
			position: 'center',
			label: 'none',
		};

		function PhotoNav( elem ) {
			var self = this;

			// Parse the position parameters
			function parsePos( position, dimage, dcontainer ) {
				var result;
				switch ( position ) {
					case 'center':
						result = ( dcontainer - dimage ) / 2;
						break;
					case 'left':
					case 'top':
						result = ( dcontainer - dimage );
						break;
					case 'right':
					case 'bottom':
						result = 0;
						break;
					default:
						result = parseFloat( position );
						break;
				}
				return result;
			}

			function Container( container, photonav ) {
				var content = container.find( '.content' ),
					cw = container.width(),
					ch = container.height(),
					iw = photonav.image[0].scrollWidth,
					ih = photonav.image[0].scrollHeight,
					is_fullview = false,
					leftStart = 0,
					callback;

				function initMove() {
					container.mousemove(function( event ) {
						var offset = $( this ).offset(),
							curX = ( event.pageX - offset.left ) * ( 1 - iw / this.offsetWidth ),
							curY = ( event.pageY - offset.top ) * ( 1 - ih / this.offsetHeight );
						content.stop(); // stop animation
						content.css({
							left: Math.min( 0, curX ),
							top: Math.min( 0, curY ),
						});
					});
				}

				function initDrag() {
					content.draggable({
						start: function( event, ui ) {
							$( this ).stop(); // stop animation
						},
						drag: function( event, ui ) {
							return ( ! is_fullview );
						},
						scroll: false
					});
					// Return a callback that gets called when the image is loaded
					return function() {
						container.mousedown(function(){
							var co = container.offset();
							content.draggable(
								'option',
								'containment',
								[ co.left + cw - iw, co.top + ch - ih, co.left, co.top ] );
						});
					}
				}

				function initDrag360() {
					content.draggable({
						start: function( event, ui ) {
							$( this ).stop(); // stop animation
							ui.helper.wrapwidth = iw;
						},
						drag: function( event, ui ) {
							return ( ! is_fullview );
						},
						scroll: false,
						infinite: true // activate the plugin defined above
					});
					// Return a callback that gets called when the image is loaded
					return function() {
						content.css( 'width', iw + cw + 2 ); // for 360 mode, the dragable content is enlarged
						
						container.mousedown(function(){
							var co = container.offset();
							content.draggable(
								'option',
								'containment',
								[ , co.top + ch - ih, , co.top ] );
						});	
					}
				}

				function initAutoScroll() {
					var turnLeft = 'left' === photonav.config.animate,
						turnLoop = 'drag360' === photonav.config.mode,
						leftEnd; // Stop (or turn-around) position

					function animate_loop( content ) {
						content.css( 'left',
						       turnLeft ?
						       content.position().left + iw :
						       content.position().left - iw );
						content.animate( {
								left: leftEnd
							},
							10/photonav.config.speed * Math.abs( iw ),
							'linear',
							function() {
								setTimeout( function() {
										animate_loop( content );
									},
									1 );
							} );
					}

					if ( turnLoop ) {
						leftEnd = turnLeft ?
						          - iw :
						          0;
					} else {
						leftEnd = turnLeft ?
						          parsePos( 'left', iw, cw ) :
						          parsePos( 'right', iw, cw );
					}

					content.each(function() {
						$( this ).animate( {
								left: leftEnd
							},
							10/photonav.config.speed * Math.abs( leftEnd - leftStart ),
							'linear',
							function() {
								if ( turnLoop ) {
									animate_loop( $( this ) );
								}
							} );
					});
				}

				function initZoom() {
					var savePos = content.position();
					container.mouseenter(function( event ) {
						// Un-zoom, i.e. reset original size
						photonav.image.css( 'width', 'auto' );
						content.removeClass( 'zoomed' );
						content.css({
							left: savePos.left,
							top: savePos.top
						});
						// Reset content width where necessary:
						if ( undefined !== callback ) {
							callback();
						}
						is_fullview = false;
					});
					container.mouseleave(function( event ) {
						// Zoom out
						savePos = content.position();
						photonav.image.css( 'width', '100%' );
						content.addClass( 'zoomed' );
						content.css({
							left: '',
							top: '',
							width: '',
						});
						is_fullview = true;
					});
					container.trigger( 'mouseleave' );
				}

				function setupDimensions() {
					leftStart = parsePos( photonav.config.position, iw, cw );
					if ( 0 === ch ) {
						ch = ih; // ... otherwise use the image height
						container.height( ch + 'px' );
					}
					content.css({
						left: leftStart,
						top: Math.min( 0, ( ch - ih ) / 2 ),
					});
					if ( callback !== undefined ) {
						callback();
					}
					$( window ).resize( function() {
						if ( ( container.width() !== cw ) || ( container.height() !== ch ) ) {
							cw = container.width();
							if ( ! is_fullview ) {
								ch = container.height();
							}
							if ( content.position().left < cw - iw ) {
								content.css( 'left', cw - iw );
							}
							if ( content.position().top < ch - ih ) {
								content.css( 'top', ch - ih );
							}
							if ( callback !== undefined ) {
								callback();
							}
						}
					} );
				}

				function imageLoaded() {
					iw = photonav.image[0].scrollWidth;
					ih = photonav.image[0].scrollHeight;
					cw = container.width();
					ch = container.height();

					setupDimensions();

					var anim = photonav.config.animate;

					if ( '1' === anim || 'right' === anim || 'left' === anim ) {
						initAutoScroll();
					} else if ( 'zoom' === anim ) {
						initZoom();
					}
				}

				// Call the appropriate init method above depending on the mode parameter.
				switch ( photonav.config.mode ) {
					case 'move':
						callback = initMove();
						break;
					case 'drag':
						callback = initDrag();
						break;
					case 'drag360':
						callback = initDrag360();
						break;
				}

				container
					.find( '.image' )
					.one( 'load', imageLoaded )
					.each(function() {
						if ( this.complete ) {
							$( this ).load();
						}
					});
			} // end function Container

			// Initializes the ColorBox popup.
			function initColorbox() {
				var popup = elem.find( '.popup' ).first(),
					container = popup.children( '.container' ).first(),
					content = container.children( '.content' ).first();
				self.image.colorbox({
					maxWidth: '100%',
					maxHeight: '100%',
					width: self.image[0].scrollWidth,
					inline: true,
					href: popup,
					onOpen: function() {
						container.height( self.image[0].scrollHeight );
					},
					onComplete: function() {
						var ph = popup.parent().innerHeight();
						if ( ph < popup.height() ) {
							container.height( ph );
						}
						var c_popup = new Container( container, self );
					}
				});
			}

			// Initialize on jQuery.ready event, do as much as possible to use the time while loading the image
			this.init = function( config ) {
				var inline = elem.children( '.container' );

				self.config = config;
				self.image = inline.find( '.image' ).first();

				inline.css( 'display', 'block' ); // unhide (skip load optimization)

				var c_inline = new Container( inline, self );

				if ( 'colorbox' === config.popup ) {
					if ( undefined !== $().colorbox ) {
						initColorbox();
					}
				}

				if ( 'none' !== config.label ) {
					label = document.createElement( 'div' );
					label.className = 'label';
					inline.append( label );
					elem.hover(function() {
						$( label ).fadeTo( 'fast', 0.0 );
					}, function() {
						$( label ).fadeTo( 'fast', 1.0 );
					});
				}
				
				if( 'number' !== typeof config.speed || config.speed <= 0) {
					config.speed = 1;
				}
			};
		};

		this.each(function() {
			var photonav = new PhotoNav( $( this ) );
			var config = undefined !== settings ?
			             $.extend( {}, defaults, settings ) :
			             $.extend( {}, defaults )
			photonav.init( config );
		});

		return this;
	};

})( jQuery );
