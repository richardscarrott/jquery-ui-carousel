/*
 * jQuery UI Carousel Plugin v0.7.2 - Auto Scroll Extension
 *
 * Copyright (c) 2011 Richard Scarrott
 * http://www.richardscarrott.co.uk
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Depends:
 *  jquery.js v1.4+
 *  jquery.ui.widget.js v1.8+
 *  jquery.ui.carousel.js v0.7.3+
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
			
			this._bindAutoScroll();
			this._start();
			
		},
		
		_bindAutoScroll: function() {
			
			if (this.autoScrollInitiated) {
				return;
			}
			
			this.element
				.bind('touchstart.' + this.widgetName + ' mouseover.' + this.widgetName, $.proxy(this, '_stop'))
				.bind('touchend.' + this.widgetName + ' mouseout.' + this.widgetName, $.proxy(this, '_start'));
				
			this.autoScrollInitiated = true;
			
		},
		
		_unbindAutoScroll: function() {
			
			this.element
				.unbind('mouseover.' + this.widgetName)
				.unbind('mouseout.' + this.widgetName);
				
			this.autoScrollInitiated = false;
			
		},
		
		_start: function() {
		
			var self = this;
			
			this.interval = setInterval(function() {
				
				if (self.itemIndex === self.lastItem) {
					self.goToItem(1);
				}
				else {
					self.next();
				}
			
			}, this.options.pause);
			
		},
		
		_stop: function() {
		
			clearInterval(this.interval);
						
		},
		
		_setOption: function (option, value) {
		
			_super._setOption.apply(this, arguments);
			
			switch (option) {
				
			case 'autoScroll':
			
				this._stop();
				
				if (value) {
					this._bindAutoScroll();
					this._start();
				}
				else {
					this._unbindAutoScroll();
				}
				
				break;
					
			}
		
		},
		
		destroy: function() {
			
			_super.destroy.apply(this);
			this._stop();
			
		}
		
	});
	
})(jQuery);