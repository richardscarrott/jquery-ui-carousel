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
	
And here's the JavaScript:
--------------------------
    $(document).ready(function() {
        $('#my-carousel').carousel();
    });

Full docs and API coming shortly.

[Get in touch here](http://richardscarrott.co.uk/contact "Richard Scarrott").