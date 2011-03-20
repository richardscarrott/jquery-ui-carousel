/*
 * jQuery UI Carousel Plugin v0.3 - Auto Scroll Extension
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
 * jQuery UI Carousel 0.3+ 
 *
 */
 
(function($, carousel, undefined) {
	
	var _create = carousel._create,
		destroy = carousel.destroy;
	
	$.extend(carousel.options, {
		pause: 5000,
		autoScroll: false
	});
	
	$.extend(carousel, {
	
		_create: function() {
		
			_create.apply(this);
			
			if (!this.options.autoScroll) { return; }
			
			this.start();
			this.elements.container
				.bind('mouseenter.carousel', $.proxy(this, 'stop'))
				.bind('mouseleave.carousel', $.proxy(this, 'start'));
				
		},
		
		start: function() {
		
			var self = this;
			
			this._interval = setInterval(function() {
			
				self.itemIndex = self.itemIndex + self.options.itemsPerTransition;
				if (self.itemIndex > (self.noOfItems - 1)) {
					self.itemIndex = 0;
				}
				
				self._go();
				
			}, this.options.pause);
			
		},
		
		stop: function() {
		
			clearInterval(this._interval);
			
		},
		
		destroy: function() {
			
			destroy.apply(this);
			this.stop();
			
		}
	
	});
	
})(jQuery, jQuery.ui.carousel.prototype);