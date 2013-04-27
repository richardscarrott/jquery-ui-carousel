/*
 * jQuery.translate3d.js v0.2
 *
 * Copyright (c) 2013 Richard Scarrott
 * http://www.richardscarrott.co.uk
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * // getter
 * $(selector).css('translate3d'); // returns { x: val, y: val, z: val }
 *
 * // setter
 * $(selector).css('translate3d', { x: val, y: val, z: val });
 *
 * // support
 * $.support.transform3d; // returns boolean
 *
 */
 
(function ($) {

	// getSupportedProp mostly taken from http://api.jquery.com/jQuery.cssHooks/
	var getSupportedProp = function (prop) {
		
		var vendorProp,
			supportedProp,
			capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
			prefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'Ms'],
			style = document.documentElement.style;

		if (prop in style) {
			supportedProp = prop;
		}
		else {
			for (var i = 0; i < prefixes.length; i++) {
				vendorProp = prefixes[i] + capProp;
				if (vendorProp in style) {
					supportedProp = vendorProp;
					break;
				}
			}
		}

		div = null;
		$.support[prop] = supportedProp;
		return supportedProp;
	},
	transform = getSupportedProp('transform');
	
	if ($.support.transform) {
		$.cssHooks.translate3d = {
			set: function(elem, obj) {

				obj = $.extend({
					x: 0,
					y: 0,
					z: 0
				}, obj);

				// append px if unit not passed in
				$.each(obj, function (prop, val) {
					obj[prop] = typeof val === 'number' ? val + 'px' : val;
				});

				elem.style[transform] = 'translate3d(' + obj.x + ', ' + obj.y + ', ' + obj.z + ')';
			},

			// properly regex out all three values... prob shouldn't convert to Int here incase the value was percentage etc.
			get: function (elem) {
				var value = elem.style[transform];
				if (value) {
					value = value.split('(')[1].split(',');  // a bit rubbish me thinks...
					return {
						x: parseInt(value[0], 10),
						y: parseInt(value[1], 10),
						z: parseInt(value[2].split(')')[0], 10)
					};
				}
			}
		};
	}
	
})(jQuery);