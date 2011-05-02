/*
 * jQuery UI Carousel Plugin v0.7
 *
 * Copyright (c) 2011 Richard Scarrott
 * http://www.richardscarrott.co.uk
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
 
(function ($, undefined) {

	var _super = $.Widget.prototype;

	$.widget('ui.carousel', {

		// holds original class string
		oldClass: null,

		options: {
			itemsPerPage: 'auto',
			itemsPerTransition: 'auto',
			orientation: 'horizontal',
			noOfRows: 1, // horizontal only
			pagination: true,
			insertPagination: null,
			nextPrevActions: true,
			insertNextAction: null,
			insertPrevAction: null,
			speed: 'normal',
			easing: 'swing',
			startAt: null,
			init: null,
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
			this._setNoOfPages();
			this._setRunnerWidth();
			this._setLastPos();
			this._addPagination();
			this._addNextPrevActions();

			if (this.options.startAt) {
				this.goToItem(this.options.startAt, false);
			}

			this._updateUi();
			
			this._trigger('init', null, {
				index: this.itemIndex,
				page: this._getPage()
			});

		},

		// caches DOM elements
		_elements: function () {

			var elems = this.elements = {};

			elems.mask = this.element.find('.mask');
			elems.runner = this.element.find('ul');
			elems.items = elems.runner.children('li');
			elems.pagination = null;
			elems.nextAction = null;
			elems.prevAction = null;

		},

		_addClasses: function () {

			if (!this.oldClass) {
				this.oldClass = this.element.attr('class');
			}

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

			if (elems.mask.length) {
				return;
			}

			elems.mask = elems.runner
				.wrap('<div class="mask" />')
				.parent();

			// indicates whether mask was dynamically added or already existed in mark-up
			this.maskAdded = true;

		},

		// sets maskDim to later detemine lastPos
		_setMaskDim: function () {

			this.maskDim = this.elements.mask[this.helperStr.dim]();

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
				// don't directly use options.itemsPerPage as reference to 'auto' needs to be kept if not number
				this.itemsPerPage = this.options.itemsPerPage;
			}
			else {
				this.itemsPerPage = Math.floor(this.maskDim / this.itemDim);
			}

		},

		// sets no of items, not neccesarily the literal number of items if more than one row
		_setNoOfItems: function () {

			this.noOfItems = Math.ceil(this.elements.items.length / this.options.noOfRows);

			// fixed 9 items, 3 rows, 4 shown
			/*if (this.noOfItems < this.itemsPerPage) {
				this.noOfItems = this.itemsPerPage;
			}*/

		},

		// sets noOfPages
		_setNoOfPages: function () {

			this.noOfPages = Math.ceil((this.noOfItems - this.itemsPerPage) / this._getitemsPerTransition()) + 1;

		},

		_getitemsPerTransition: function () {

		    if (this.options.itemsPerTransition === 'auto') {
		        return this.itemsPerPage;
		    }

		    return this.options.itemsPerTransition;
		},

		// sets runners width
		_setRunnerWidth: function (noOfItems) {

			if (!this.horizontal) {
				return;
			}

			var width = this.itemDim * (noOfItems || this.noOfItems);
			this.elements.runner.width(width);

		},

		// sets lastPos to ensure runner doesn't move beyond mask (allowing mask to be any width and the use of margins)
		_setLastPos: function () {

			// noOfrows means last theoretical item might not be the last item
			var lastItem = this.elements.items.eq(this.noOfItems - 1);
			
			if (lastItem.length) {
				this.lastPos = lastItem.position()[this.helperStr.pos] + this.itemDim -
					this.maskDim - parseInt(lastItem.css('margin-' + this.helperStr.pos2), 10);
			}

		},

		// adds pagination links and binds associated events
		_addPagination: function () {

			if (!this.options.pagination) {
				return;
			}

			var self = this,
				elems = this.elements,
				opts = this.options,
				links = [],
				i;
				
			this._removePagination();

			for (i = 0; i < this.noOfPages; i++) {
				links[i] = '<li><a href="#item-' + i + '">' + (i + 1) + '</a></li>';
			}

			elems.pagination = $('<ol class="pagination-links" />')
				.append(links.join(''))
				.delegate('a', 'click.carousel', function () {

					self.goToPage(this.hash.split('-')[1]);

					return false;

				});

			if ($.isFunction(opts.insertPagination)) {
				opts.insertPagination.apply(elems.pagination[0]);
			}
			else {
				elems.pagination.insertAfter(elems.mask);
			}

		},
		
		_removePagination: function () {
		
			if (this.elements.pagination) {
				this.elements.pagination.remove();
				this.elements.pagination = null;
			}
		
		},
		
		// shows specific page (zero based)
		goToPage: function (pageIndex, animate) {
			
			var itemIndex;
			
			itemIndex = pageIndex * this._getitemsPerTransition();
			
			// validate itemIndex
			if (itemIndex > this.noOfItems - 1) {
				itemIndex = this.noOfItems - 1;
			}
			
			this.oldItemIndex = this.itemIndex;
			this.itemIndex = itemIndex;
			this._go(animate);
			
		},
		
		// shows specific item (zero based)
		goToItem: function(itemIndex, animate) {
			
			if (typeof itemIndex !== 'number') { // assume element or jQuery obj
				itemIndex = $(itemIndex).index();
			}
			
			// validate itemIndex
			if (itemIndex > this.noOfItems - 1) {
				itemIndex = this.noOfItems - 1;
			}
			
			this.oldItemIndex = this.itemIndex;
			this.itemIndex = itemIndex;
			
			this._go(animate);
			
		},

		// adds next and prev links
		_addNextPrevActions: function () {

			if (!this.options.nextPrevActions) {
				return;
			}

			var self = this,
				elems = this.elements,
				opts = this.options;
				
			this._removeNextPrevActions();

			elems.prevAction = $('<a href="#" class="prev">Prev</a>')
				.bind('click.carousel', function () {
					self.prev();
					return false;
				});;

			elems.nextAction = $('<a href="#" class="next">Next</a>')
				.bind('click.carousel', function () {
					self.next();
					return false;
				});

			if ($.isFunction(opts.insertPrevAction)) {
				opts.insertPrevAction.apply(elems.prevAction[0]);
			}
			else {
				elems.prevAction.appendTo(this.element);
			}

			if ($.isFunction(opts.insertNextAction)) {
				opts.insertNextAction.apply(elems.nextAction[0]);
			}
			else {
				elems.nextAction.appendTo(this.element);
			}

		},
		
		_removeNextPrevActions: function() {
		
			var elems = this.elements;
		
			if (elems.nextAction) {
				elems.nextAction.remove();
				elems.nextAction = null;
			}	
			
			if (elems.prevAction) {
				elems.prevAction.remove();
				elems.prevAction = null;
			}
					
		},

		// moves to next page
		next: function () {
			
			this.oldItemIndex = this.itemIndex;
			this.itemIndex += this._getitemsPerTransition();
			this._go();

		},

		// moves to prev page
		prev: function () {
			
			this.oldItemIndex = this.itemIndex;
			this.itemIndex -= this._getitemsPerTransition();
			this._go();

		},

		// updates pagination, next and prev link status classes
		_updateUi: function () {

			var elems = this.elements,
				index = this.itemIndex,

				// add void class if ui doesn't make sense - can then be either hidden or styled like disabled / current
				// better than setting pagination to false as this senario isn't an 'option change'
				isVoid = this.noOfItems <= this.itemsPerPage;

			if (this.options.pagination) {

				if (isVoid) {
					elems.pagination.addClass('void');
				}
				else {
					elems.pagination
						.children('li')
							.removeClass('current')
							.eq(this._getPage())
								.addClass('current');		
				}

			}

			if (this.options.nextPrevActions) {

				var nextPrev = elems.nextAction.add(elems.prevAction);
				nextPrev.removeClass('disabled');

				if (isVoid) {
					nextPrev.addClass('void');		
				}
				else {
					nextPrev.removeClass('void');
					
					if (index === (this.noOfItems - this.itemsPerPage)) {
						elems.nextAction.addClass('disabled');
					}
					else if (index === 0) {
						elems.prevAction.addClass('disabled');
					}
				}
			}

		},
		
		// return page based on itemIndex
		_getPage: function (index) {
		
			var index = index || this.itemIndex;
		
			return Math.ceil(index / this._getitemsPerTransition());
			
		},
		
		_go: function (animate) {
		
			var self = this,
				speed = animate === false ? 0 : this.options.speed, // default to animate
				animateProps = {},
				pos;
				
			pos = this._getPos();

			animateProps[this.helperStr.pos] = -pos;
		
			this._trigger('beforeAnimate', null, {
				index: this.itemIndex,
				page: this._getPage(),
				oldIndex: this.oldItemIndex,
				oldPage: this._getPage(this.oldItemIndex)
			});
			
			/* CSS transitions perform very poorly (however 'translate3d()' invokes hardware acceleration in iOS / webkit...)
			elems.runner.css({
				left: -pos,
				transition: 'left .3s linear',
				'-o-transition': 'left .400s linear',
				'-moz-transition': 'left .400s linear',
				'-webkit-transition': 'left .400s linear',
				'-webkit-transition': 'left .400s linear',
				'-moz-transition': 'left .400s linear'
			});*/

			this.elements.runner
				.stop()
				.animate(animateProps, speed, this.options.easing, function () {

					self._trigger('afterAnimate', null, {
						index: self.itemIndex,
						page: self._getPage(),
						oldIndex: self.oldItemIndex,
						oldPage: self._getPage(self.oldItemIndex)
					});

				});
				
			this._updateUi();
		
		},
		
		// gets items pos
		_getPos: function () {
		
			var pos;
			
			// check whether there are enough items to animate to
			if (this.itemIndex > (this.noOfItems - this.itemsPerPage)) {
				this.itemIndex = this.noOfItems - this.itemsPerPage; // go to last panel - items per transition
			}
			else if (this.itemIndex < 0) {
				this.itemIndex = 0; // go to first
			}
			
			pos = this.elements.items.eq(this.itemIndex).position()[this.helperStr.pos];
			// pos = this.itemIndex * this.itemDim;
			
			// check pos doesn't go past last
			if (pos > this.lastPos) {
				pos = this.lastPos;
			}
			
			return pos;
			
		},

		// refresh carousel
		refresh: function (items) {
			
			// re-cache items in case new items have been added
			this.elements.items = items || this.elements.runner.children('li');
			
			// setup
			this._addClasses();
			this._setMaskDim();
			this._setItemDim();
			this._setItemsPerPage();
			this._setNoOfItems();
			this._setRunnerWidth();
			this._setLastPos();
			
			// pagination
			this._setNoOfPages();
			this._addPagination();
			
			this.goToItem(this.itemIndex, false);
			
			this._updateUi();

		},

		// handles option updates
		_setOption: function (option, value) {

			var elems = this.elements,
				opts = this.options;

			_super._setOption.apply(this, arguments);

			switch (option) {

			case 'itemsPerPage':

				this.refresh();

				break;

			case 'itemsPerTransition':

				this.refresh();

				break;

			case 'noOfRows':

				if (this.horizontal) {
					this.refresh();
				}
				else {
					// noOfRows must be 1 if vertical
					opts.noOfRows = 1;
				}

				break;

			case 'orientation':

				this._defineOrientation();
				elems.mask.height('');
				elems.runner.width('');
				this.refresh();

				break;

			case 'pagination':

				if (value) {
					this._addPagination();
					this._updateUi();
				}
				else {
					this._removePagination();
				}

				break;

			case 'nextPrevActions':

				if (value) {
					this._addNextPrevActions();
					this._updateUi();
				}
				else {
					this._removeNextPrevActions();
				}

				break;

			}

		},

		// returns carousel to original state
		destroy: function () {

			var elems = this.elements,
				cssProps = {};

			this.element.removeClass().addClass(this.oldClass);
			
			if (this.maskAdded) {
				elems.runner
					.unwrap('.mask');
			}

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
			
			_super.destroy.apply(this, arguments);

		}

	});
	
	$.ui.carousel.version = '0.6.4';

})(jQuery);