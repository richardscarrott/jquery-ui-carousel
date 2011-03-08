/*
 * jQuery UI Carousel Plugin v2.0 - Autoplay Extension
 *
 * Copyright (c) 2011 Richard Scarrott
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Requires:
 * jQuery v1.4+,
 * jQuery UI Widget Factory 1.8+
 * jQuery UI Carousel 2.0+ 
 *
 */
 
(function($, carousel, undefined) {
	
	var _create = carousel._create,
		destroy = carousel.destroy;
	
	$.extend(carousel.options, {
		pause: 5000,
		autoScroll: true
	});
	
	$.extend(carousel, {
	
		_create: function() {
		
			_create.apply(this);
			
			if (!this.options.autoScroll) { return; }
			
			this._setInterval();
			this._elements.container
				.bind('mouseenter.carousel', $.proxy(this, '_clearInterval'))
				.bind('mouseleave.carousel', $.proxy(this, '_setInterval'));
				
		},
		
		_setInterval: function() {
		
			var self = this;
			
			this._interval = setInterval(function() {
			
				self._itemIndex = self._itemIndex + self.options.itemsPerTransition;
				if (self._itemIndex > (self._noOfItems - self.options.itemsPerPage)) {
					self._itemIndex = 0;
				}
				
				self._go();
				
			}, this.options.pause);
			
		},
		
		_clearInterval: function() {
		
			clearInterval(this._interval);
			
		},
		
		destroy: function() {
			
			destroy.apply(this);
			this._clearInterval();
			
		}
	
	});
	
})(jQuery, jQuery.ui.carousel.prototype);