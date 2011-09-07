/*
 * jQuery UI Carousel Plugin v0.7.5 - Continuous Extension (in development)
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
 *  jquery.ui.carousel.js v0.7.5+
 *
 */

//= require ./jquery.ui.carousel.js
 
 // TODO:
 // .updateUi needs to take into account continuous
 // look into multiple rows compatibility with continuous...going to have to be clever about this one!
 // cloned items need to be updated when items are added...
 // how should autoscroll interface?
 
(function($, undefined) {

	function warn(message) {
		if (console && console.warn) {
			console.warn(message);
		}
	}

	var _super = $.ui.carousel.prototype;
	
	$.widget('ui.carousel', $.ui.carousel, {
	
		options: {
			continuous: true // temp, default to false
		},
		
		_create: function () {
		
			_super._create.apply(this, arguments);
			
			// continious
			if (this.options.continuous) {
			
				// warn if items arn't divisible by items per transition (means current page cannot be accurately determined as items shown won't always be the same set)
				if (this.options.pagination && this.noOfItems % this._getItemsPerTransition() != 0) {
					warn('jquery.ui.carousel: number of items isn\'t divisible by itemsPerTransition meaning current page cannot be accurately deteremined');
				}
			
				this._addClonedItems();
				
				// calculate width with cloned items
				this._setRunnerWidth(this.elements.runner.children('li').length / this.options.noOfRows);
				
				// jump to first item to ignore cloned items
				if (!this.options.startAt) {
					this.goToItem(0, false);
				}
			}
			
		},
		
		// appends and prepends items to provide illusion of continuous scrolling
		_addClonedItems: function () {
		
			var elems = this.elements,
				beginning = this._getItemsPerTransition() + this._getItemsPerPage(), 
				end = this.noOfItems - this._getItemsPerTransition() - 1;
				
			this._removeClonedItems();
		
			elems.clonedBeginning = $(this.elements.items
				.eq(beginning)
					.prevAll()
						.clone()
							.removeAttr('id')
							.addClass('ui-carousel-cloned')
							.get()
							.reverse());
			
			elems.clonedEnd = this.elements.items
				.eq(end)
					.nextAll()
						.clone()
							.removeAttr('id')
							.addClass('ui-carousel-cloned')
							.prependTo(this.elements.runner);
			
			elems.clonedBeginning.appendTo(elems.runner);
			elems.clonedEnd.prependTo(elems.runner);
		
		},
		
		_removeClonedItems: function () {
		
			var elems = this.elements;
		
			if (elems.clonedBeginning) {
				elems.clonedBeginning.remove();
			}
			
			if (elems.clonedEnd) {
				elems.clonedEnd.remove();
			}
		
		},
				
		// gets position
		_getPos: function () {

			if (this.options.continuous) {
			
				var elems = this.elements,
					pos,
					cssProps = {};
			
				if (this.itemIndex > this.noOfItems - 1) {
					
					// why have I puts brackets around these calculations?
					var realItems = (this.noOfItems - 1) - this.oldItemIndex,
						clonedItems = (this._getItemsPerTransition() - 1) - realItems;
						
					cssProps[this.helperStr.pos] = -elems.clonedEnd.eq(clonedItems).position()[this.helperStr.pos];
					elems.runner.css(cssProps);
				
					this.itemIndex = clonedItems;
					
				}			
				else if (this.itemIndex < 0) {
					
					cssProps[this.helperStr.pos] = -elems.clonedBeginning.eq(this.oldItemIndex).position()[this.helperStr.pos];
					elems.runner.css(cssProps);
					
					this.itemIndex = this.noOfItems - (this._getItemsPerTransition() - this.oldItemIndex);
					
				}
				
				return elems.items.eq(this.itemIndex).position()[this.helperStr.pos];
			}
			else {
				
				return _super._getItemIndex.apply(this, arguments);
				
			}
			
		},
		
		refresh: function(items) {
			
			if (this.options.continuous) {
				
				var items = this.elements.runner.children('li');
				
				// pass in items explicitly as not to include cloned items
				_super.refresh.call(this, items.filter(':not(.ui-carousel-cloned)'));
				
				// currently has to be called again as it should include cloned items...
				this._setRunnerWidth(this.elements.runner.children('li').length / this.options.noOfRows);
			}
			else {
				_super.refresh.apply(this, arguments);
			}
		
		},
		
		_setOption: function (option, value) {
		
			_super._setOption.apply(this, arguments);
			
			switch (option) {
				
			case 'continuous':
			
				var items;
				
				if (value) {
					this._addClonedItems();
				}
				else {
					this._removeClonedItems();
					this._setLastPos();
				}
				
				this.refresh();
				
				break;
					
			}
		
		},
		
		destroy: function() {
			
			this._removeClonedItems();
			
			_super.destroy.apply(this);
			
		}
		
	});
	
})(jQuery);