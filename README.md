WP-PhotoNav
===========

WP-PhotoNav is a WordPress plugin. It is a complete rewrite of a JavaScript
snippet called PhotoNav (originally by Gaya Kessler). It provides for easy
integration of panorama pictures in a WordPress page via a shortcode.
The user can “rotate” the view of the panorama by moving the mouse over the
image area or dragging the image. Additional feature include an integration
with jQuery Colorbox and animated scrolling or zooming.

Maintenance
-----------

I do not plan to significantly increase the functionality of the plugin. Of
course I will try to provide necessary maintenance either in accordance to
changes in WordPress itself or due to bugs in the generated output.

Feel free to report [issues][issues] and/or fork to contribute.

Download
--------

Please download this plugin from the [WordPress plugin directory][directory].

Usage
-----

You can use WP-PhotoNav either via WordPress shortcodes or via the media
button on top of the editor, which will show a dialogue similar to the ones
you know from inserting common images. The dialog does nothing more than
automatically generating the shortcode for you. Below are some examples for
possible shortcodes to be used within your posts or articles. To see some
working examples, please visit the [plugin page][plugin].

### Basic

This is the easiest way to include a panorama in your post. You only have to
specify the URL of the image:

    [photonav url='/wp-uploads/2014/07/panorama.jpg']

### Advanced

For more sophistication, WP-PhotoNav accepts a number of parameters, most of
which are demonstrated in the following example:

    [photonav url='/wp-uploads/2014/07/panorama.jpg' container_height=300
    mode=drag360 popup=colorbox animate=left position=right label=true]

Here is a list of the employed parameters and their meaning:

*   `container_height` -- Defines the height of the displayed frame (hence the
    container). If the image is higher than the given height, vertical
    scrolling (or dragging) is enabled. The unit is one pixel. There is also
    the parameter container_width in case you don’t want the frame to fill the
    horizontal space available in the post or page.
*   `mode` -- Specifies one of the following modes: move, drag or drag360 where
    move is the default mode and doesn’t have to be specified. The drag mode
    allows the user to navigate the panorama by dragging it inside the frame.
    The drag360 mode is similar, but generates the illusion of an vertically
    infinite image. This is useful for 360° panoramas where the user can turn
    around in each direction infinitely.
*   `popup` -- If specified, enables a popup for enlarged view. The only valid
    popup type at the moment is colorbox, which only works if the
    [ColorBox][colorbox] plugin for jQuery is available. It is provided e.g. by
    the [jQuery Colorbox plugin][cbplugin]. You have to install this plugin
    separately to make use of the popup functionality.
*   `animate` -- If specified, enables one of the following animation modes:
    left, right or zoom. By using this option, the panorama can be rotated
    automatically starting from the `position` into the named direction until
    either the user interacts with it (by scrolling in move mode or dragging in
    one of the drag modes) or the image is scrolled through entierely once.
    For 360° panoramas using the drag360 mode, the animation continues until
    the first interaction. In zoom mode, the panorama image is scaled to fit
    the available space and expands it to its full size when the mouse is moved
    over the image. The animation allows to attract the users attention
    to the additional functionality of the panorama compared to a simple, still
    image. Please note that the animation (like everything else) is
    accomplished using JavaScript and might not be 100% fluid on all systems
    and browsers.
*   `position` -- Defines the initial horizontal postion. The parameter may
    be a pixel value for horizontal displacement or take any one of the
    following relative values, for which the corresponding pixel value is
    automatically calculated: center, left or right.
*   `label` -– If this option is enabled, an overlay will be displayed in the
    top right corner of the image to inform the user of the additional
    capabilities.

Developer remarks
-----------------

### DOM tree

The structure of the `div` elements used for the PhotoNav content is:

    .photonav -> .container -> .content -> .image

`.image` is wrapped in `.content` for uniformity with the drag360 mode, where
the image is assigned as repeated background of `.content`.

`.container` is separate from `.photonav`, because the `.photonav` comprises
two `.containers`: one for inline view and one for popup/lightbox view (which
is hidden)

### Infinite scroll

The infinite scroll mode (aka `drag360`) is implemented by a `.content`
element, which is larger than the `.image` by the dimension of `.container`.
The `.image` is left-aligned within `.content`, extending the valid range of
positions of `.content` within `.container` from the negative image width
to 0.

### Interaction with Subversion

The master branch mirrors the SVN trunk used for publication. Development
happens in the progress branch and is rebased to master. Synchronisation with
SVN is achieved by `git-svn`.

An SVN commit is done using the following workflow:

    git checkout master
    git merge --squash [local dev-branch]
    git commit -m "Message for SVN repo"
    git svn rebase
    git svn dcommit
    git push

[issues]: https://github.com/fmos/wp-photonav/issues
[directory]: http://wordpress.org/extend/plugins/wp-photonav/
[plugin]: http://fmos.at/wp-photonav
[colorbox]: http://colorpowered.com/colorbox/
[cbplugin]: http://wordpress.org/extend/plugins/jquery-colorbox/
