## Quick start

### This is the basic HTML structure required:

    <div id="my-carousel">
        <ul>
            <li>
                <!-- item 1 content -->
            </li>
            <li>
                <!-- item 2 content -->
            </li>
            <li>
                <!-- item 3 content -->
            </li>
            <li>
                <!-- item 4 content -->
            </li>
            <li>
                <!-- item 5 content etc. -->
            </li>
        </ul>
    </div>
	
### And here's the JavaScript:

    $(document).ready(function() {
        $('#my-carousel').carousel();
    });

## DOCS

### Overview
This is a rewrite of [jQuery Carousel](http://www.richardscarrott.co.uk/posts/view/jquery-carousel-plugin "see the original jQuery Carousel plugin") leveraging jQuery UIs [Widget Factory](http://docs.jquery.com/UI_Developer_Guide#The_widget_factory "Learn more about the Widget Factory").

### Options
#### itemsPerPage: 'auto' (string, number)
Sets the number of items shown on each page, if set to 'auto' the number of items
will be calculated based on width of mask (aka clipping div).

#### itemsPerTransition: 'auto' (string, number)
Sets the number of items to scroll per transition, if set to 'auto' the number of items
will match itemsPerPage.

#### orientation: 'horizontal' (string)
Sets the orientation of the carousel, either 'horizontal' or 'vertical'.

#### noOfRows: 1 (number)
Sets the number of rows.

NOTE: This is only applicable to horizontal carousels

#### unknownHeight: true, (boolean)
If set to true the height of the mask (aka clipping div) will be dynamically calculated.

This can be useful if, for example, the carousel's items contain textual content which cannot be determined due
to varying font sizes etc.

NOTE: This is only applicable to horizontal carousels.

#### pagination: true (boolean)
Sets whether pagination links should be included, pagination links are inserted as an ordered list.

#### insertPagination: null (function)
Allows you to override where in the DOM the pagination links are inserted.

The function is passed the pagination links (ol) as it's context wrapped pre wrapped as a jQuery object, e.g.

	function() {
		// this === $paginationLinks
		this.appendTo('body');
	}

NOTE: By default they are inserted after the mask (aka clipping div).

#### nextPrevActions: true (boolean)
Sets whether the next and prev actions are included, next and prev actions are inserted as anchor tags.

#### insertNextAction: null (function)
Allows you to override where in the DOM the next action is inserted.

The function is passed the next action (a) as it's context , e.g.

	function() {
		// this === $nextAction
		this.appendTo('body');
	}

NOTE: By default the next action is appended to the carousels container.

#### insertPrevAction: null (function)
Allows you to override where in the DOM the prev action is inserted.

The function is passed the prev action (a) as it's context , e.g.

	function() {
		// this === $prevAction
		this.appendTo('body');
	}

NOTE: By default the prev action is appended to the carousels container.

#### speed: 'normal' (string)
Sets the speed of the carousel.

#### easing: 'swing' (string)
Sets the easing equation used.

#### startAt: null (number)
If set the carousel will start on the specified page (one based).

### Events
#### beforeAnimate: null (function)
Fired before transition.

#### afterAnimate: null (function)
Fired after transition.

### Methods
#### next .carousel('next')
Moves to the next page.

#### prev .carousel('prev')
Moves to the prev page.

#### goToPage .carousel('goToPage', page, [animate])
Moves to the specified 'page' (one based), if animate set to false it'll jump straight there.

#### goToItem .carousel('goToItem', item, [animate])
Moves to page containing item, item can be a one based number, a vanilla DOM element
or a jQuery object.

#### addItems .carousel('addItems', items)
This allows you to easily add items to the carousel whilst ensuring it's state is updated.

items must be a jQuery object of list items.

#### option .carousel('option', optionName , [value])
Get or set any carousel option. If no value is specified, will act as a getter.

#### option .carousel('option', options)
Set multiple carousel options at once by providing an options object.

#### widget .carousel('widget')
Returns the .ui-carousel element.

#### destroy .carousel('destroy')
Remove the carousel functionality completely. This will return the element back to its pre-init state.

[If you have any questions or ideas you can contact me here](http://richardscarrott.co.uk/contact "Richard Scarrott").