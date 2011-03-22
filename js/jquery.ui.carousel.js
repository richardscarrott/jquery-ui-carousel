/*
 * jQuery UI Carousel Plugin v0.5
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
 // support disabled and enabled methods
 // storing this.element in this.elements.container is prob not overly sensible
 // add keyboard support
 // continuous option - i.e. append not slide back to beginning
 // theme roller support - does a carousel ever need a generic look and feel, maybe icons etc.?
 // moving from vertical to horizontal doesn't take into account noOfRows as vertical resets it to 1...store original somewhere
 // include addItems() input demo
 // if noOfRows > 1 runner width
 // set 'disbale' flag for nextAndPrevActions and pagination instead so it can't be reactivated after logically it's been removed
 
 // Drop noOfRows?
 
(function ($, undefined) {

	$.widget('ui.carousel', {
	
		version: 0.5,
		
		// holds original class string
		oldClass: null,
		
		options: {
			itemsPerPage: 4,
			itemsPerTransition: 4,
			orientation: 'horizontal',
			noOfRows: 1, // only horizontal
			unknownHeight: false, // horizontal only (allows unknown item height - useful if, for example, item contains textual content)
			pagination: true,
			nextPrevActions: true,
			speed: 'normal',
			easing: 'swing',
			startAt: null,
			beforeAnimate: null,
			afterAnimate: null
		},
		
		_create: function () {
		
			this.itemIndex = 0;
			this._elements();
			this._addClasses();
			this._defineOrientation();
			this._addMask();
			this._setMaskDim();
			this._setItemDim();
			this._setItemsPerPage();
			this._setNoOfItems();
			
			// bail if too few items
			if (this.noOfItems <= this.options.itemsPerPage) {
				return; 
			}
			
			this._setNoOfPages();
			this._setRunnerWidth();
			this._setMaskHeight();
			this._setLastPos();
			this._addPagination();
			this._addNextPrevActions();
			
			if (this.options.startAt !== null) {
				this.goTo(this.options.startAt);
			}
			
			this._updateUi();
			
		},
		
		// caches DOM elements
		_elements: function () {
		
			var elems = this.elements = {};
		
			elems.container  = this.element;
			elems.runner = elems.container.find('ul');
			elems.items = elems.runner.children('li');
			elems.mask = elems.container.find('.mask');
			elems.pagination = null;
			elems.nextAction = null;
			elems.prevAction = null;
		
		},
		
		_addClasses: function () {
		
			this.oldClass = this.element.attr('class');
		
			this._removeClasses();
			
			var baseClass = this.widgetBaseClass,
				classes = [];
				
			classes.push(baseClass);
			classes.push(baseClass + '-' + this.options.orientation);
			classes.push(baseClass + '-items-' + this.options.itemsPerPage);
			classes.push(baseClass + '-rows-' + this.options.noOfRows);
		
			this.element.addClass(classes.join(' '));
		
		},
		
		// removes ui-carousel* classes
		_removeClasses: function () {
		
			var uiClasses = [],
				current,
				fragments;
		
			this.element.removeClass(function (i, currentClasses) {
				
				currentClasses = currentClasses.split(' ');
				
				$.each(currentClasses, function (i) {
					
					current = currentClasses[i];
					fragments = current.split('-');
					
					// don't remove ui-carousel as it holds basic styling which would be required when no-js
					// and carousel destroyed?
					if (fragments[0] === 'ui' && fragments[1] === 'carousel') {
						uiClasses.push(current);
					}
					
				});
				
				return uiClasses.join(' ');
				
			});
		
		},
		
		// defines obj to hold strings based on orientation for dynamic method calls
		_defineOrientation: function () {

			if (this.options.orientation === 'horizontal') {
				this.horizontal = true;
				this.helperStr = {
					pos: 'left',
					pos2: 'right',
					dim: 'width'
				};
			}
			else {
				this.horizontal = false;
				this.helperStr = {
					pos: 'top',
					pos2: 'bottom',
					dim: 'height'
				};	
				this.options.noOfRows = 1;
			}
		
		},
		
		// adds masking div (aka clipper)
		_addMask: function () {
		
			var elems = this.elements;
			
			if (!elems.mask.length) {
				elems.mask = elems.runner
					.wrap('<div class="mask" />')
					.parent();
				
				// indicates whether mask was dynamically added or already existed in mark-up
				this.maskAdded = true;
			}
			
		},
		
		// sets maskDim to later detemine lastPos
		_setMaskDim: function () {
		
			this.maskDim = this.elements.mask[this.helperStr.dim]();
		
		},
		
		// sets masks height allowing items to have an unknown height (not applicable to vertical orientation)
		_setMaskHeight: function () {
		
			if (!this.horizontal || !this.options.unknownHeight) {
				return;
			}
			
			var elems = this.elements,
				maskHeight = elems.runner.outerHeight(true);
			
			elems.mask.height(maskHeight);
			
		},
		
		// sets itemDim to the dimension of first item incl. margin
		_setItemDim: function () {
			
			// is this ridiculous??
			this.itemDim = this.elements.items['outer' + this.helperStr.dim.charAt(0).toUpperCase() + this.helperStr.dim.slice(1)](true);
			
		},
		
		// sets options.itemsPerPage based on maskdim
		_setItemsPerPage: function () {
			
			// if itemsPerPage of type number don't dynamically calculate
			if (typeof this.options.itemsPerPage === 'number') {
				return;
			}
			
			this.options.itemsPerPage = Math.floor(this.maskDim / this.itemDim);
		
		},
		
		// sets no of items, not neccesarily the literal number of items if more than one row
		_setNoOfItems: function () {

			this.noOfItems = Math.ceil(this.elements.items.length / this.options.noOfRows);
			
			// fixed 9 items, 3 rows, 4 shown 
			if (this.noOfItems < this.options.itemsPerPage) {
				this.noOfItems = this.options.itemsPerPage;
			}
			
		},
		
		// sets noOfPages
		_setNoOfPages: function () {
		
			this.noOfPages = Math.ceil((this.noOfItems - this.options.itemsPerPage) / this.options.itemsPerTransition) + 1;
		
		},
		
		// sets runners width
		_setRunnerWidth: function () {
		
			if (!this.horizontal) {
				return;
			}
			
			var width = this.itemDim * this.noOfItems;
			this.elements.runner.width(width);
			
		},
		
		// sets lastPos to ensure runner doesn't move beyond mask (allowing mask to be any width and the use of margins)
		_setLastPos: function () {
			
			// noOfrows means last theoretical item might not be the last item
			var lastItem = this.elements.items.eq(this.noOfItems - 1);
			
			this.lastPos = lastItem.position()[this.helperStr.pos] + this.itemDim -
				this.maskDim - parseInt(lastItem.css('margin-' + this.helperStr.pos2), 10);
				
		},
		
		// adds pagination links and binds associated events
		_addPagination: function () {
		
			if (!this.options.pagination) {
				return;
			}
		
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
				.delegate('a', 'click.' + this.widgetEventPrefix, function () {
					self.goTo($(this).parent().index()  * self.options.itemsPerTransition);
					return false;
				});
				
		},
		
		// refreshes pagination links
		_refreshPagination: function () {
			
			if (!this.elements.pagination) {
				return;
			}
			
			this.elements.pagination.remove();
			this._setNoOfPages();
			this._addPagination();
			
		},
		
		// jumps to specific element
		goTo: function (index) {
		
			if (typeof index === 'number') {
				this.itemIndex = index;
			}
			else {
				// assume jquery or DOM element
				this.itemIndex = $(index).index();
			}
			
			this._go();
			
		},
		
		// adds next and prev links
		_addNextPrevActions: function () {
		
			if (!this.options.nextPrevActions) {
				return;
			}
		
			var self = this,
				elems = this.elements;
			
			// bit crap but add() then appendTo() doesn't work in jQuery 1.4.2 so appended individually
			elems.prevAction = $('<a href="#" class="prev">Prev</a>').appendTo(elems.container);
			elems.nextAction = $('<a href="#" class="next">Next</a>').appendTo(elems.container);
				
			elems.nextAction.bind('click.' + this.widgetEventPrefix, function () {
				self.next();
				return false;
			});
			
			elems.prevAction.bind('click.' + this.widgetEventPrefix, function () {
				self.prev();
				return false;
			});
			
		},
		
		// moves to next page
		next: function () {
		
			this.itemIndex = this.itemIndex + parseInt(this.options.itemsPerTransition, 10);
			this._go();
			
		},
		
		// moves to prev page
		prev: function () {
		
			this.itemIndex = this.itemIndex - this.options.itemsPerTransition;
			this._go();
			
		},
		
		// updates pagination, next and prev link status classes
		_updateUi: function () {
		
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
		
		// validates itemIndex and initiates slide
		_go: function () {
		
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
		
		// slides runner
		_slide: function (nextItem) {
		
			var self = this,
				elems = this.elements,
				pos = nextItem.position(),
				animateProps = {};
		
			//  check pos doesn't go past last
			if (Math.abs(pos[this.helperStr.pos]) > this.lastPos) {
				pos[this.helperStr.pos] = this.lastPos;
			}
			
			animateProps[this.helperStr.pos] = -pos[this.helperStr.pos];
		
			elems.runner
				.stop()
				.animate(animateProps, this.options.speed, this.options.easing, function () {
					
					self._trigger('afterAnimate', null, {
						index: self.itemIndex
					});
					
				});
		
		},
		
		// refresh carousel
		_refresh: function () {
			
			this.itemIndex = 0;
			this.elements.runner.css({
				left: '',
				top: ''
			});
			this._addClasses();
			this._setMaskDim();
			this._setItemDim();
			this._setItemsPerPage();
			this._setNoOfItems();
			
			// remove pagination and nextPrevActions if not enough items
			if (this.noOfItems <= this.options.itemsPerPage) {
				this._setOption('pagination', false);
				this._setOption('nextPrevActions', false);
			}
			else {
				this._setOption('pagination', true);
				this._setOption('nextPrevActions', true);
			}
			
			this._setRunnerWidth();
			this._setMaskHeight();
			this._setLastPos();
			this._refreshPagination();
			this._updateUi();
			
		},
		
		// adds items to end and refreshes carousel, items === jquery obj
		addItems: function (items) {
		
			var elems = this.elements;
		
			items.appendTo(elems.runner);
			elems.items = elems.runner.children('li');
			this._refresh();
		
		},
		
		_enable: function () {
			
			$.Widget.prototype._enable.apply(this, arguments);
			
		},
		
		_disable: function () {
		
			$.Widget.prototype._disable.apply(this, arguments);
		
		},
		
		// handles option updates
		_setOption: function (option, value) {
			
			var elems = this.elements,
				opts = this.options;
				
			$.Widget.prototype._setOption.apply(this, arguments);
			
			switch (option) {
				
			case 'itemsPerPage':
				
				this._refresh();
				
				break;
				
			case 'itemsPerTransition':
				
				this._refreshPagination();
				this._updateUi();
				
				break;
				
			case 'noOfRows':
				
				if (this.horizontal) {
					this._refresh();
				}
				else {
					// noOfRows must be 1 if vertical
					this.options.noOfRows = 1;
				}
				
				break;
				
			case 'orientation':
						
				this._defineOrientation();
				
				// noOfRows must be 1 if vertical
				if (!this.horizontal) {
					this.options.noOfRows = 1;
				}
				
				elems.mask.height('');
				elems.runner.width('');
				this._refresh();
				
				break;
					
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
		
		// returns carousel to original state
		destroy: function () {
		
			var elems = this.elements,
				cssProps = {};
				
			this.element.removeClass().addClass(this.oldClass);
		
			if ('maskAdded' in this) {
				elems.runner
					.unwrap('.mask');
			}
			
			// should really store original value?
			cssProps[this.helperStr.pos] = '';
			cssProps[this.helperStr.dim] = '';
			elems.runner.css(cssProps);
			
			if (elems.pagination) {
				elems.pagination.remove();
			}
			
			if (elems.nextAction) {
				elems.nextAction.remove();
				elems.prevAction.remove();
			}
			
			// overkill?
			$.each(elems, function () {
				$(this).unbind(this.widgetEventPrefix);
			});
		
			$.Widget.prototype.destroy.apply(this, arguments);
			
		}
		
	});
	
})(jQuery);