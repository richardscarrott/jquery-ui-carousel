/*
 * jQuery UI Carousel Plugin v2.1
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
 *
 */
 
 // add keyboard support?
 // store similar items together in attr?
 // refactor
 
(function($, undefined) {

	$.widget('ui.carousel', {
	
		version: 2.1,
		
		options: {
			itemsPerPage: 1,
			itemsPerTransition: 1,
			noOfRows: 1, // only horizontal??
			direction: 'horizontal',
			pagination: true,
			nextPrevActions: true,
			speed: 'normal',
			easing: 'swing',
			animate: true,
			startAt: null,
			beforeAnimate: null,
			afterAnimate: null
		},
		
		_create: function() {
		
			if (this.options.direction === 'horizontal') {
				this.positionStr = 'left';
				this.dimensionStr = 'width';
				this.horizontal = true;
			}
			else {
				this.positionStr = 'top';
				this.dimensionStr = 'height';
				this.horizontal = false;
			}
			
			this.itemIndex = 0;
			this._elements();
			this.noOfItems = this._elements.items.length / this.options.noOfRows;
			this.itemDim = this._elements.items['outer' + this.dimensionStr.charAt(0).toUpperCase() + this.dimensionStr.slice(1)](true); // is this rediculous??
			this._setRunnerWidth();
			this._addMask();
			this.lastPos = this._elements.items.last().position()[this.positionStr] + this.itemDim - this.maskDim;
			this.itemsPerPage = this.options.itemsPerPage;
		
			if (typeof this.options.itemsPerPage !== 'number') {
				this._setItemsPerPage();
			}
			
			this.noOfPages = Math.ceil((this.noOfItems - this.itemsPerPage) / this.options.itemsPerTransition) + 1;
			
			if (this.noOfItems <= this.itemsPerPage) { return; } // bail
			
			if (this.options.pagination) {
				this._addPagination();
			}
			
			if (this.options.nextPrevActions) {
				this._addNextPrevActions();
			}
			
			if (this.options.startAt !== null) {
				this.goTo(this.options.startAt);
			}
			
			this._updateUi();
			
		},
		
		_elements: function() {
		
			this._elements = {};
		
			this._elements.container  = this.element;
			this._elements.runner = this._elements.container.find('ul');
			this._elements.items = this._elements.runner.children('li');
			this._elements.mask = null;
			this._elements.pagination = null;
			this._elements.nextAction = null;
			this._elements.prevAction = null;
		
		},
		
		_setRunnerWidth: function() {
		
			if (this.horizontal) {
				var width = this.itemDim * this.noOfItems;
				this._elements.runner.width(width);
			}
			
		},
		
		_addMask: function() {
		
			var elems = this._elements;
			
			elems.mask = elems.runner
				.wrap('<div class="mask" />')
				.parent();
				
			this.maskDim = this._elements.mask[this.dimensionStr]();
				
			// allows items to have an unknown height
			if (this.horizontal) {
				var maskHeight = elems.runner.outerHeight(true);
				console.log(maskHeight);
				elems.mask.height(maskHeight);
			}
			
		},
		
		_setItemsPerPage: function() {
			
			this.itemsPerPage = Math.floor(this.maskDim / this.itemDim);
		
		},
		
		_addPagination: function() {
		
			var self = this,
				links = [],
				i;
			
			for (i = 0; i < this.noOfPages; i++) {
				links[i] = '<li><a href="#item-' + i + '">' + (i + 1) + '</a></li>';
			}
			
			this._elements.pagination = $('<ol class="pagination-links" />')
				.appendTo(this._elements.container)
				.append(links.join(''))
				.delegate('a', 'click.carousel', function() {
					self.goTo($(this).parent().index()  * self.options.itemsPerTransition);
					return false;
				});
				
		},
		
		_addNextPrevActions: function() {
		
			var self = this,
				elems = this._elements;
			
			// bit crap but add() then appendTo() doesn't work in jQuery 1.4.2 so appended individually
			elems.prevAction = $('<a href="#" class="prev">Prev</a>').appendTo(elems.container);
			elems.nextAction = $('<a href="#" class="next">Next</a>').appendTo(elems.container);
				
			elems.nextAction.bind('click.carousel', function() {
				self.next();
				return false;
			});
			
			elems.prevAction.bind('click.carousel', function() {
				self.prev();
				return false;
			});
			
		},
		
		next: function() {
		
			this.itemIndex = this.itemIndex + this.options.itemsPerTransition;
			this._go();
			
		},
		
		prev: function() {
		
			this.itemIndex = this.itemIndex - this.options.itemsPerTransition;
			this._go();
			
		},
		
		_updateUi: function() {
		
			var elems = this._elements,
				index = this.itemIndex;
		
			if (this.options.pagination) {
			
				elems.pagination
					.children('li')
						.removeClass('current')
						.eq(Math.ceil(index / this.options.itemsPerTransition))
							.addClass('current');
			}

			if (this.options.nextPrevActions) {
				elems.nextAction
					.add(elems.prevAction)
						.removeClass('disabled');
						
				if (index === (this.noOfItems - this.itemsPerPage)) {
					elems.nextAction.addClass('disabled');
				}
				else if (index === 0) {
					elems.prevAction.addClass('disabled');
				}
			}
			
		},
		
		goTo: function(index) {
		
			if (typeof index === 'number') {
				this.itemIndex = index;
			}
			else {
				// assume jquery or DOM element
				this.itemIndex = $(index).index();
			}
			
			this._go();
			
		},
		
		_go: function() {
		
			var self = this,
				elems = this._elements,
				nextItem;
				
			if (typeof this.options.itemsPerPage !== 'number') {
				this._setItemsPerPage();
			}
			
			// check whether there are enough items to animate to
			if (this.itemIndex > (this.noOfItems - this.itemsPerPage)) {
				this.itemIndex = this.noOfItems - this.itemsPerPage; // go to last panel - items per transition
			}
			if (this.itemIndex < 0) {
				this.itemIndex = 0; // go to first
			}
			
			nextItem = elems.items.eq(this.itemIndex);
			
			this._trigger('beforeAnimate', null, {
				index: this.itemIndex
			});
			
			this._slide(nextItem);
			this._updateUi();
		},
		
		_slide: function(nextItem) {
		
			var self = this,
				elems = this._elements,
				pos = nextItem.position(),
				properties = {};
		
			//  check pos doesn't go past last
			if (Math.abs(pos[this.positionStr]) >= this.lastPos) {
				pos[this.positionStr] = this.lastPos;
			}
			
			properties[this.positionStr] = -pos[this.positionStr];
		
			elems.runner
				.stop()
				.animate(properties, this.options.speed, this.options.easing, function() {
					
					self._trigger('afterAnimate', null, {
						index: self.itemIndex
					});
					
				});
				
			/*else {
			
				elems.mask
					.stop()
					.animate({'scrollLeft': pos.left}, this.options.speed, this.options.easing, function() {
						
						self._trigger('afterAnimate', null, {
							index: self.itemIndex
						});
						
					});
			
			}*/
		
		},
		
		destroy: function() {
		
			var elems = this._elements,
				params = {};
				
			params[this.positionStr] = 'auto'; // should really store original value
			params[this.dimensionStr] = 'auto'; // should really store original value
		
			elems.runner
				.unwrap('.mask')
				.css(params);
				
			elems.pagination.remove();
			elems.nextAction.remove();
			elems.prevAction.remove();
			
			// overkill?
			$.each(elems, function() {
				$(this).unbind('.carousel');
			});
		
			$.Widget.prototype.destroy.apply(this, arguments);
			
		}
		
	});
})(jQuery);





/*(function($, carousel) {

	var methods = {
		_setRunnerWidth: carousel._setRunnerWidth;
	};
	
	$.extend(carousel, {
	
		_create: function() {
		
			if (this.options.direction === 'horizontal') {
				
			}
		
		},
	
		_setRunnerWidth: function() {
		
			if (this.options.direction === 'horizontal') {
				methods._setRunnerWidth.apply(this);
			}
		
		},
		
		_setLastPos: function() {
		
			
			
		}
		
	});
	
	
	
})(jQuery, jQuery.ui.carousel.prototype);*/