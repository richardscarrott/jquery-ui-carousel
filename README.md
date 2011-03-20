This is the basic HTML structure required:
------------------------------------------
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

Here's some CSS to get you going (I've flagged which declarations are required):
--------------------------------------------------------------------------------
    #my-carousel ul {
        position:absolute; /* required */
        overflow:hidden; /* required */
        margin:0;
        padding:0;
        list-style:none;
    }
     
    #my-carousel ul li {
        float:left; /* required */
        width:100px;
        height:200px;
        margin:0 10px 0 0;
    }
     
    #my-carousel .mask {
        position:relative; /* required */
        overflow:hidden; /* required */
        width:540px; /* required */
    }
     
    #my-carousel .pagination-links {
        list-style:none;
        margin:0;
        padding:0;
    }
     
    #my-carousel .pagination-links li {
        display:inline;
    }
     
    #my-carousel .pagination-links li.current {
        background:grey;
    }
     
    #my-carousel .disabled {
        color:grey;
    }

And here's the JavaScript:
--------------------------
    $(document).ready(function() {
        $('#my-carousel').carousel();
    });

You can pass in any number of options from the following defaults:
------------------------------------------------------------------
	{
		itemsPerPage: 1, // number of items to show on each page
		itemsPerTransition: 1, // number of items moved with each transition
		noOfRows: 1, // number of rows (only horizontal, see demo)
		horizontal: true, // orientation
		pagination: true, // whether next and prev links will be included
		nextPrevActions: true, // whether next and prev links will be included
		speed: 'normal', // animation speed
		easing: 'swing', // supports the jQuery easing
		startAt: null, // takes number, DOM element or jquery object indicating which list item to animate to on load
		beforeAnimate: null, // callback before animation
		afterAnimate: null, // callback after animation
		autoScroll: true, // sets interval NOTE: requires jquery.ui.carousel-autoscroll.js
		pause: 3000 // duration before auto scroll NOTE: requires jquery.ui.carousel-autoscroll.js
	}

The plugin supports multiple carousels on a single page and maintains jQuery's chainability through the use of jquery UI's Widget Factory. If you do become stuck see the demo or leave me a [message](http://richardscarrott.co.uk/posts/view/jquery-carousel-plugin "Richard Scarrott").