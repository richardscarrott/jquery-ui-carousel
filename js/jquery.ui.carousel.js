/*
 * jQuery UI Carousel Plugin v0.5.2
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
 
(function ($, undefined) {

	$.widget('ui.carousel', {

		version: '0.6.2',

		// holds original class string
		oldClass: null,

		options: {
			itemsPerPage: 'auto',
			itemsPerTransition: 'auto',
			orientation: 'horizontal',
			noOfRows: 1, // horizontal only
			unknownHeight: true, // horizontal only (allows unknown item height - useful if, for example, items contains textual content)
			pagination: true,
			insertPagination: null,
			nextPrevActions: true,
			insertNextAction: null,
			insertPrevAction: null,
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
			this._setNoOfPages();
			this._setRunnerWidth();
			this._setMaskHeight();
			this._setLastPos();
			this._addPagination();
			this._addNextPrevActions();

			if (this.options.startAt) {
				this.goTo(this.options.startAt, false);
			}

			this._updateUi();

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
			if (this.noOfItems < this.itemsPerPage) {
				this.noOfItems = this.itemsPerPage;
			}

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
				elems = this.elements,
				opts = this.options,
				links = [],
				i;

			for (i = 0; i < this.noOfPages; i++) {
				links[i] = '<li><a href="#item-' + i + '">' + (i + 1) + '</a></li>';
			}

			elems.pagination = $('<ol class="pagination-links" />')
				.append(links.join(''))
				.delegate('a', 'click.carousel', function () {

					self.goToPage(this.hash.split('-')[1]);

					return false;

				})

			if ($.isFunction(opts.insertPagination)) {
				$.proxy(opts.insertPagination, elems.pagination)();
			}
			else {
				elems.pagination.insertAfter(elems.mask);
			}

		},

		// refreshes pagination links
		_refreshPagination: function () {

			if (!this.options.pagination) {
				return;
			}

			this.elements.pagination.remove();
			this._setNoOfPages();
			this._addPagination();

		},
		
		// shows specific page (zero based)
		goToPage: function (pageIndex, animate) {
			
			this.itemIndex = pageIndex * this._getitemsPerTransition();
			
			this._go(animate);
			
		},
		
		// shows specific item (zero based)
		goToItem: function(itemIndex, animate) {
			
			if (typeof itemIndex !== 'number') { // assume element or jQuery obj
				itemIndex = $(itemIndex).index();
			}
			
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
				$.proxy(opts.insertPrevAction, elems.prevAction)();
			}
			else {
				elems.prevAction.appendTo(this.element);
			}

			if ($.isFunction(opts.insertNextAction)) {
				$.proxy(opts.insertNextAction, elems.nextAction)();
			}
			else {
				elems.nextAction.appendTo(this.element);
			}

		},

		// moves to next page
		next: function () {

			this.itemIndex += this._getitemsPerTransition();
			this._go();

		},

		// moves to prev page
		prev: function () {

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
							.eq(Math.ceil(index / this._getitemsPerTransition()))
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
		
		_getPage: function() {
		
			return Math.ceil(this.itemIndex / this._getitemsPerTransition());
			
		},

		// validates itemIndex and initiates slide
		_go: function (animate, callback) {

			var self = this,
				elems = this.elements,
				speed = animate === false ? 0 : this.options.speed, // default to animate
				animateProps = {},
				pos;
				
			// check whether there are enough items to animate to
			if (this.itemIndex > (this.noOfItems - this.itemsPerPage)) {
				this.itemIndex = this.noOfItems - this.itemsPerPage; // go to last panel - items per transition
			}

			if (this.itemIndex < 0) {
				this.itemIndex = 0; // go to first
			}

			pos = this.itemIndex * this.itemDim;
			
			// check pos doesn't go past last
			if (pos > this.lastPos) {
				pos = this.lastPos;
			}

			animateProps[this.helperStr.pos] = -pos;
			
			/* CSS transitions perform very poorly
			elems.runner.css({
				left: -pos,
				transition: 'left .3s linear',
				'-o-transition': 'left .400s linear',
				'-moz-transition': 'left .400s linear',
				'-webkit-transition': 'left .400s linear',
				'-webkit-transition': 'left .400s linear',
				'-moz-transition': 'left .400s linear'
			});*/
			
			this._trigger('beforeAnimate', null, {
				index: this.itemIndex,
				page: this._getPage()
			});

			elems.runner
				.stop()
				.animate(animateProps, this.options.speed, this.options.easing, function () {

					self._trigger('afterAnimate', null, {
						index: self.itemIndex,
						page: self._getPage()
					});
					
					if ($.isFunction(callback)) {
						callback();
					}

				});
				
			this._updateUi();
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

				this._refresh();

				break;

			case 'noOfRows':

				if (this.horizontal) {
					this._refresh();
				}
				else {
					// noOfRows must be 1 if vertical
					opts.noOfRows = 1;
				}

				break;

			case 'unknownHeight':

				if (value) {
					this._setMaskHeight();
				}
				else {
					elems.mask.height('');
				}

				break;

			case 'orientation':

				this._defineOrientation();
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
			else {
				elems.mask.height('');
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
				$(this).unbind('.carousel');
			});

			$.Widget.prototype.destroy.apply(this, arguments);

		}

	});

})(jQuery);