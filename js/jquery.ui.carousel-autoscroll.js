/*
 * jQuery UI Carousel Plugin v0.6 - Auto Scroll Extension
 *
 * Copyright (c) 2011 Richard Scarrott
 * http://www.richardscarrott.co.uk
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Requires:
 * jQuery v1.4+
 * jQuery UI Widget Factory v1.8+
 * jQuery UI Carousel v0.6+
 *
 */
 
(function($, undefined) {

	var _super = $.ui.carousel.prototype;
	
	$.widget('ui.carousel', $.ui.carousel, {
	
		options: {
			pause: 8000,
			autoScroll: false
		},
		
		_create: function() {
		
			_super._create.apply(this);
			
			if (!this.options.autoScroll) { return; }
			
			this.stopped = false;
			
			this.start();
			this.element
				.bind('mouseenter.' + this.widgetName, $.proxy(this, 'stop'))
				.bind('mouseleave.' + this.widgetName, $.proxy(this, 'start'));
			
		},
		
		start: function() {
		
			var self = this;
			
			this.interval = setInterval(function() {
				
				self.pageIndex += 1;
				
				if (self.pageIndex > self.noOfPages) {
					self.pageIndex = 0;
				}
				
				self._go();
			
			}, this.options.pause);
			
		},
		
		stop: function() {
		
			clearInterval(this.interval);
						
		},
		
		_setOption: function (option, value) {
		
			_super._setOption.apply(this, arguments);
			
			switch (option) {
				
			case 'autoScroll':
			
				this.stop();
				
				if (value) {
					this.start();
				}
				
				break;
					
			}
		
		},
		
		destroy: function() {
			
			_super.destroy.apply(this);
			this.stop();
			
		}
		
	});
	
})(jQuery);