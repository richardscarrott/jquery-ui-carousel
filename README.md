## Quick start

### This is the basic HTML structure required (element agnostic):

    <div class="rs-carousel">
        <ul class="rs-carousel-runner">
            <li class="rs-carousel-item">
                <!-- item 1 content -->
            </li>
            <li class="rs-carousel-item">
                <!-- item 2 content -->
            </li>
            <li class="rs-carousel-item">
                <!-- item 3 content -->
            </li>
            <li class="rs-carousel-item">
                <!-- item 4 content -->
            </li>
            <li class="rs-carousel-item">
                <!-- item 5 content etc. -->
            </li>
        </ul>
    </div>
	
### Here's the JavaScript:

    $(document).ready(function() {
        $('.rs-carousel').carousel();
    });

### And here's the generated markup:

    <div class="rs-carousel">
        <div class="rs-carousel-mask">
            <ul class="rs-carousel-runner">
                <li class="rs-carousel-item">
                    <!-- item 1 content -->
                </li>
                <li class="rs-carousel-item">
                    <!-- item 2 content -->
                </li>
                <li class="rs-carousel-item">
                    <!-- item 3 content -->
                </li>
                <li class="rs-carousel-item">
                    <!-- item 4 content -->
                </li>
                <li class="rs-carousel-item">
                    <!-- item 5 content etc. -->
                </li>
            </ul>
        </div>
        <ol class="rs-carousel-pagination">
            <li class="rs-carousel-pagination-link rs-carousel-pagination-link-active"><a href="#page-1">1</a></li>
            <li class="rs-carousel-pagination-link"><a href="#page-2">2</a></li>
        </ol>
        <a class="rs-carousel-action-prev" href="#">Previous</a>
        <a class="rs-carousel-action-next rs-carousel-action-disabled" href="#">Next</a>
    </div>

## DOCS

### Overview
This is a rewrite of [jQuery Carousel](http://www.richardscarrott.co.uk/posts/view/jquery-carousel-plugin "see the original jQuery Carousel plugin") leveraging jQuery UIs [Widget Factory](http://docs.jquery.com/UI_Developer_Guide#The_widget_factory "Learn more about the Widget Factory").

### Options
#### itemsPerPage: 'auto' (string, number)
Sets the number of items shown on each page, if set to 'auto' the number of items
will be calculated based on width of mask.

#### itemsPerTransition: 'auto' (string, number)
Sets the number of items to scroll per transition, if set to 'auto' the number of items
will match itemsPerPage.

#### orientation: 'horizontal' (string)
Sets the orientation of the carousel, either 'horizontal' or 'vertical'.

#### loop: false (boolean)
If set to true carousel will loop back to first or last page accordingly.

#### pagination: true (boolean)
Sets whether pagination links should be included, pagination links are inserted as an ordered list.

#### insertPagination: null (function)
Allows you to override where in the DOM the pagination links are inserted.

The context of the function will be the pagination links, e.g.

    function () {
        // this === <ol class="rs-carousel-pagination"></ol>
        $(this).appendTo('body');
    }

#### nextPrevActions: true (boolean)
Sets whether the next and prev actions are included, next and prev actions are inserted as anchor tags.

#### insertNextAction: null (function)
Allows you to override where in the DOM the next action is inserted.

The context of the function will be the next action, e.g.

    function () {
        // this === <a href="#" class="rs-carousel-action-next">Next</a>
        $(this).appendTo('body');
    }

#### insertPrevAction: null (function)
Allows you to override where in the DOM the prev action is inserted.

The context of the function will be the prev action, e.g.

    function () {
        // this === <a href="#" class="rs-carousel-action-prev">Previous</a>
        $(this).appendTo('body');
    }

#### speed: 'normal' (string)
Sets the speed of the carousel.

#### easing: 'swing' (string)
Sets the easing equation used.

#### startAt: null (number)
If set the carousel will start on the specified page (one based).

#### nextText: 'Next' (string)
Defines text to insert into next element.

#### prevText: 'Previous' (string)
Defines text to insert into prev element.

#### disabled: false (boolean)
If set to true carousel will no longer change state.

#### autoScroll: false (boolean)
Set to true to invoke auto scrolling, note when the mouse enters the carousel the interval will stop, it'll consequently begin when the mouse leaves.

NOTE: Requires the autoScroll extension (jquery.rs.carousel-autoscroll.js).

#### pause: 8000 (number)
Sets the amount of time in miliseconds the carousel waits before it automatically scrolls.

NOTE: Requires the autoScroll extension (jquery.rs.carousel-autoscroll.js).

#### continuous: false (boolean)
If set to true the carousel will continuously loop through its pages.

NOTE: Requires the continuous extension (jquery.rs.carousel-continuous.js).

### Events
#### create_: null (function)
Fired on first call.

It can be passed in the options object like this:

    $('.rs-carousel').carousel({
       beforeAnimate: function(event, data) { ... }
    });
	
or bound to as an event like this:
	
    $('.rs-carousel').bind("carouselbeforeAnimate", function(event, data) {
        ...
    });

data contains map of jQuery objects:

    {
        mask
        runner
        items
        pagination
        nextAction
        prevAction
    }

#### beforeAnimate: null (function)
Fired before transition.

It can be passed in the options object like this:

    $('.rs-carousel').carousel({
        beforeAnimate: function(event, data) { ... }
    });
	
or bound to as an event like this:
	
    $('.rs-carousel').bind("carouselbeforeAnimate", function(event, data) {
        ...
    });
	
data contains map of jQuery objects:

    {
        mask
        runner
        items
        pagination
        nextAction
        prevAction
    }

#### afterAnimate: null (function)
Fired after transition.

It can be passed in the options object like this:

    $('.rs-carousel').carousel({
        afterAnimate: function(event, data) { ... }
    });
	
or bound to as an event like this:
	
    $('.rs-carousel').bind("carouselAfterAnimate", function(event, data) {
        ...
    });
	
data contains map of jQuery objects:

    {
        mask
        runner
        items
        pagination
        nextAction
        prevAction
    }

### Methods
#### next .carousel('next')
Moves to the next page.

#### prev .carousel('prev')
Moves to the prev page.

#### goToPage .carousel('goToPage', page, [animate])
Moves to the specified 'page' (one based). If animate is set to false it'll jump straight there.

#### goToItem .carousel('goToItem', item, [animate])
Moves to page containing item, item can be a one based number, a vanilla DOM element
or a jQuery object. If animate is set to false it'll jump straight there.

#### getNoOfItems .carousel('getNoOfItems')
Returns current number of items in carousel.

#### getNoOfPages .carousel('getNoOfPages')
Returns the number of pages.

#### getItemsPerPage .carousel('getItemsPerPage')
Returns the number items per page.

#### getItemsPerTransition .carousel('getItemsPerTransition')
returns the number items per transition

#### add .carousel('add', items)
Appends items to carousel, items can be DOM element, HTML string, or jQuery object.

#### remove .carousel('remove', selector)
Removes matched elements from the carousel.

#### refresh .carousel('refresh')
Refreshes carousel based on new state.

#### getPage .carousel('getPage')
Returns current page.

#### getPrevPage .carousel('getPrevPage')
Returns previous page.

#### getPages .carousel('getPages')
Returns pages array. e.g. [1, 5, 9, 13] // where the index + 1 === page number and the value === index of first item in page.

#### option .carousel('option', optionName , [value])
Get or set any carousel option. If no value is specified, will act as a getter.

#### option .carousel('option', options)
Set multiple carousel options at once by providing an options object.

#### disable .carousel('disable')
Disables the carousel.

#### enable .carousel('enable')
Enables the carousel.

#### widget .carousel('widget')
Returns the .rs-carousel element.

#### destroy .carousel('destroy')
Removes the carousel functionality completely. This will return the element back to its pre-init state.

[If you have any questions or ideas you can contact me here](http://richardscarrott.co.uk/contact "Richard Scarrott").