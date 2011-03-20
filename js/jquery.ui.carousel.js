/*
 * jQuery UI Carousel Plugin v0.3
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
 
 // TODO:
 // add keyboard support?
 // continuous option?
 // Theme roller support
 // rethink vertical / horizontal string names
 // complete option changes
 
(function($, undefined) {

	$.widget('ui.carousel', {
	
		version: 0.3,
		
		options: {
			itemsPerPage: 1,
			itemsPerTransition: 1,
			noOfRows: 1, // only horizontal
			horizontal: true,
			pagination: true,
			nextPrevActions: true,
			speed: 'normal',
			easing: 'swing',
			startAt: null,
			beforeAnimate: null,
			afterAnimate: null
		},
		
		_create: function() {
		
			if (this.options.horizontal) {
				this.positionStr = 'left';
				this.dimensionStr = 'width';
			}
			else {
				this.positionStr = 'top';
				this.dimensionStr = 'height';
			}
			
			this.itemIndex = 0;
			this._elements();
			this._setNoOfItems();
			this.itemDim = this.elements.items['outer' + this.dimensionStr.charAt(0).toUpperCase() + this.dimensionStr.slice(1)](true); // is this rediculous??
			this._setRunnerWidth();
			this._addMask();
			this._setLastPos();
		
			if (typeof this.options.itemsPerPage !== 'number') {
				this._setItemsPerPage();
			}
			
			this._setNoOfPages();
			
			if (this.noOfItems <= this.options.itemsPerPage) { return; } // bail
			
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
		
			var elems = this.elements = {};
		
			elems.container  = this.element;
			elems.runner = elems.container.find('ul');
			elems.items = elems.runner.children('li');
			elems.mask = elems.container.find('.mask');
			elems.pagination = null;
			elems.nextAction = null;
			elems.prevAction = null;
		
		},
		
		_setNoOfItems: function() {
			
			this.noOfItems = Math.ceil(this.elements.items.length / this.options.noOfRows);
			
		},
		
		_setRunnerWidth: function() {
		
			if (this.options.horizontal) {
				var width = this.itemDim * this.noOfItems;
				this.elements.runner.width(width);
			}
			
		},
		
		_addMask: function() {
		
			var elems = this.elements;
			
			if (!elems.mask.length) {
				elems.mask = elems.runner
					.wrap('<div class="mask" />')
					.parent();
			}
			
			this._setMaskDim();
				
			// allows items to have an unknown height
			if (this.options.horizontal) {
				var maskHeight = elems.runner.outerHeight(true);
				elems.mask.height(maskHeight);
			}
			
		},
		
		_setMaskDim: function() {
		
			this.maskDim = this.elements.mask[this.dimensionStr]();
		
		},
		
		_setLastPos: function() {
			
			// TODO: remove margin from last pos calc to ensure margin isn't shown on last item (needs to take into account bottom margin if vertical)
			this.lastPos = this.elements.items.last().position()[this.positionStr] + this.itemDim - this.maskDim - parseInt(this.elements.items.last().css('margin-right'), 10);
			
		},
		
		_setItemsPerPage: function() {
			
			this.options.itemsPerPage = Math.floor(this.maskDim / this.itemDim);
		
		},
		
		_setNoOfPages: function() {
		
			this.noOfPages = Math.ceil((this.noOfItems - this.options.itemsPerPage) / this.options.itemsPerTransition) + 1;
		
		},
		
		_addPagination: function() {
		
			var self = this,
				links = [],
				i;
			
			for (i = 0; i < this.noOfPages; i++) {
				links[i] = '<li><a href="#item-' + i + '">' + (i + 1) + '</a></li>';
			}
			
			this.elements.pagination = $('<ol class="pagination-links" />')
				// insertAfter means the order will stay the same if paginatioin is removed through setOption
				// and then readded
				.insertAfter(this.elements.mask)
				.append(links.join(''))
				.delegate('a', 'click.carousel', function() {
					self.goTo($(this).parent().index()  * self.options.itemsPerTransition);
					return false;
				});
				
		},
		
		_refreshPagination: function() {
			
			this.elements.pagination.remove();
			this._setNoOfPages();
			this._addPagination();
			this._updateUi();
			
		},
		
		_addNextPrevActions: function() {
		
			var self = this,
				elems = this.elements;
			
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
		
			var elems = this.elements,
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
						
				if (index === (this.noOfItems - this.options.itemsPerPage)) {
					elems.nextAction.addClass('disabled');
				}
				else if (index === 0) {
					elems.prevAction.addClass('disabled');
				}
			}
			
		},
		
		// think about 'items' be - jquery obj, html string, nodeList, all the above?
		addItems: function(items) {
		
			var elems = this.elements;
		
			items.appendTo(elems.runner);
			elems.items = elems.runner.children('li');
			this._setNoOfItems();
			this._setRunnerWidth();
			this._setLastPos();
			this._refreshPagination();
		
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
				elems = this.elements,
				nextItem;
			
			// check whether there are enough items to animate to
			if (this.itemIndex > (this.noOfItems - this.options.itemsPerPage)) {
				this.itemIndex = this.noOfItems - this.options.itemsPerPage; // go to last panel - items per transition
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
				elems = this.elements,
				pos = nextItem.position(),
				animateProps = {};
		
			//  check pos doesn't go past last
			if (Math.abs(pos[this.positionStr]) >= this.lastPos) {
				pos[this.positionStr] = this.lastPos;
			}
			
			animateProps[this.positionStr] = -pos[this.positionStr];
		
			elems.runner
				.stop()
				.animate(animateProps, this.options.speed, this.options.easing, function() {
					
					self._trigger('afterAnimate', null, {
						index: self.itemIndex
					});
					
				});
		
		},
		
		_setOption: function(option, value) {
			
			var elems = this.elements,
				opts = this.options;
				
			$.Widget.prototype._setOption.apply(this, arguments);
			
			switch(option) {
				
				case 'itemsPerPage':
					// mask dim needs to be re-calculated so lastpos can be re-determined
					this._setMaskDim();
					this._setLastPos();
					this._refreshPagination();
				break;
				
				case 'itemsPerTransition':
					this._refreshPagination();
				break;
				
				case 'noOfRows':
					if (this.options.horizontal) {
						this._setNoOfItems();
						this._setRunnerWidth();
						this._setLastPos();
						this._refreshPagination();
					}
				break;
				
				/*case 'horizontal':
					if (value === 'horizontal') {
						this.options.horizontal = true;
					}
					else {
						this.options.horizontal = false;
					}
				break;*/
				
				case 'pagination':
					if (value && !elems.pagination) {
						this._addPagination();
						this._updateUi();
					}
					else if (!value && elems.pagination) {
						elems.pagination.remove();
						elems.pagination = null;
					}
				break;
				
				case 'nextPrevActions':
					if (value && !elems.nextAction) {
						this._addNextPrevActions();
						this._updateUi();
					}
					else if (!value && elems.nextAction) {
						elems.nextAction.remove();
						elems.nextAction = null;
						elems.prevAction.remove();
						elems.prevAction = null;
					}
				break;
				
			}
		
		},
		
		destroy: function() {
		
			var elems = this.elements,
				cssProps = {};
				
			cssProps[this.positionStr] = 'auto'; // should really store original value
			cssProps[this.dimensionStr] = 'auto'; // should really store original value
		
			// TODO only remove mask if was inserted by widget
			elems.runner
				.unwrap('.mask')
				.css(cssProps);
				
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