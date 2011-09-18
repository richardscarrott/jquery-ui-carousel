/*
 * jquery.rs.carousel.js v0.8
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
 *
 */
 
(function ($, undefined) {

	var _super = $.Widget.prototype,
		horizontal = {
			pos: 'left',
			pos2: 'right',
			dim: 'width'
		},
		vertical = {
			pos: 'top',
			pos2: 'bottom',
			dim: 'height'
		};
	
	$.widget('rs.carousel', {

		options: {
			itemsPerPage: 'auto',
			itemsPerTransition: 'auto',
			orientation: 'horizontal',
			pagination: true,
			insertPagination: null,
			nextPrevActions: true,
			insertNextAction: null,
			insertPrevAction: null,
			speed: 'normal',
			easing: 'swing',
			startAt: null,
			nextText: 'Next',
			prevText: 'Previous',
			
			create: null,
			beforeAnimate: null,
			afterAnimate: null
		},

		_create: function () {

			this.page = 1;
			this._elements();
			this._addClasses();
			this._defineOrientation();
			this._addMask();
			this._setRunnerWidth();
			this._setPages();
			this._addNextPrevActions();
			this._addPagination();
			this.goToPage(this.options.startAt || 1, false);
			this._trigger('create', null, this._getData());

			return;
		},

		// caches DOM elements
		_elements: function () {

			var elems = this.elements = {},
				baseClass = '.' + this.widgetBaseClass;

			elems.mask = this.element.children(baseClass + '-mask');
			elems.runner = this.element.find(baseClass + '-runner').first();
			elems.items = elems.runner.children(baseClass + '-item');
			elems.pagination = null;
			elems.nextAction = null;
			elems.prevAction = null;

			return;
		},

		_addClasses: function () {

			if (!this.oldClass) {
				this.oldClass = this.element[0].className;
			}

			this._removeClasses();

			var baseClass = this.widgetBaseClass,
				classes = [];

			classes.push(baseClass);
			classes.push(baseClass + '-' + this.options.orientation);
			classes.push(baseClass + '-items-' + this.options.itemsPerPage);

			this.element.addClass(classes.join(' '));

			return;
		},

		// removes rs-carousel* classes
		_removeClasses: function () {

			var self = this,
				widgetClasses = [];

			this.element.removeClass(function (i, classes) {

				$.each(classes.split(' '), function (i, value) {

					if (value.indexOf(self.widgetBaseClass) !== -1) {
						widgetClasses.push(value);
					}

				});

				return widgetClasses.join(' ');

			});

			return;
		},

		// defines obj to hold strings based on orientation for dynamic method calls
		_defineOrientation: function () {

			if (this.options.orientation === 'horizontal') {
				this.isHorizontal = true;
				this.helperStr = horizontal;
			}
			else {
				this.isHorizontal = false;
				this.helperStr = vertical;
			}

			return;
		},

		// adds masking div (aka clipper)
		_addMask: function () {

			var elems = this.elements;

			// already exists in markup
			if (elems.mask.length) {
				return;
			}

			elems.mask = elems.runner
				.wrap('<div class="' + this.widgetBaseClass + '-mask" />')
				.parent();

			// indicates whether mask was dynamically added or already existed in mark-up
			this.maskAdded = true;

			return;
		},

		// sets runners width
		_setRunnerWidth: function () {

			if (!this.isHorizontal) {
				return;
			}
			
			var self = this;

			this.elements.runner.width(function () {
				return self._getItemDim() * (self.getNoOfItems());
			});

			return;
		},

		// sets itemDim to the dimension of first item incl. margin
		_getItemDim: function () {

			// is this ridiculous??
			return this.elements.items['outer' + this.helperStr.dim.charAt(0).toUpperCase() + this.helperStr.dim.slice(1)](true);

		},

		getNoOfItems: function () {
			
			return this.elements.items.length;
			 
		},

		// adds next and prev links
		_addNextPrevActions: function () {

			if (!this.options.nextPrevActions) {
				return;
			}

			var self = this,
				elems = this.elements,
				opts = this.options,
				baseClass = this.widgetBaseClass;
				
			this._removeNextPrevActions();

			elems.prevAction = $('<a href="#" class="' + baseClass + 'action-prev">' + opts.prevText + '</a>')
				.bind('click.' + this.widgetName, function (e) {
					e.preventDefault();
					self.prev();
				});;

			elems.nextAction = $('<a href="#" class="' + baseClass + 'action-next">' + opts.nextText + '</a>')
				.bind('click.' + this.widgetName, function (e) {
					e.preventDefault();
					self.next();
				});

			$.isFunction(opts.insertPrevAction) ?
				opts.insertPrevAction.apply(elems.prevAction[0]) : elems.prevAction.appendTo(this.element);

			$.isFunction(opts.insertNextAction) ?
				opts.insertNextAction.apply(elems.nextAction[0]) : elems.nextAction.appendTo(this.element);

		},

		_removeNextPrevActions: function () {
		
			var elems = this.elements;
		
			if (elems.nextAction) {
				elems.nextAction.remove();
				elems.nextAction = null;
			}	
			
			if (elems.prevAction) {
				elems.prevAction.remove();
				elems.prevAction = null;
			}
			
			return;	
		},

		// adds pagination links and binds associated events
		_addPagination: function () {

			if (!this.options.pagination) {
				return;
			}

			var self = this,
				elems = this.elements,
				opts = this.options,
				baseClass = this.widgetBaseClass,
				links = [],
				noOfPages = this._getNoOfPages(),
				i;
				
			this._removePagination();

			for (i = 1; i <= noOfPages; i++) {
				links[i] = '<li class="' + baseClass + '-pagination-link"><a href="#page-' + i + '">' + i + '</a></li>';
			}

			elems.pagination = $('<ol class="' + baseClass + '-pagination" />')
				.append(links.join(''))
				.delegate('a', 'click.' + this.widgetName, function (e) {
					e.preventDefault();

					self.goToPage(parseInt(this.hash.split('-')[1], 10));

				});

			$.isFunction(opts.insertPagination) ?
				opts.insertPagination.apply(elems.pagination[0]) : elems.pagination.insertAfter(elems.mask);
			
			return;
		},

		_removePagination: function () {
		
			if (this.elements.pagination) {
				this.elements.pagination.remove();
				this.elements.pagination = undefined;
			}
			
			return;
		},

		// sets array of pages
		_setPages: function () {

			var index = 1,
				page = 0,
				noOfPages = this._getNoOfPages();
				
			this.pages = [];
			
			while (page < noOfPages) {
				
				// if index is greater than total number of items just go to last
				if (index > this.getNoOfItems()) {
					index = this.getNoOfItems();
				}

				this.pages[page] = index;
				index += this._getItemsPerTransition(); // this._getItemsPerPage(index);
				page++;
			}

			return;
		},

		// gets noOfPages
		_getNoOfPages: function () {

			return Math.ceil((this.getNoOfItems() - this._getItemsPerPage()) / this._getItemsPerTransition()) + 1;

		},

		// gets options.itemsPerPage. If set to not number it's calculated based on maskdim
		_getItemsPerPage: function () {

			// if itemsPerPage of type number don't dynamically calculate
			if (typeof this.options.itemsPerPage === 'number') {
				return this.options.itemsPerPage;
			}
			
			return Math.floor(this._getMaskDim() / this._getItemDim());

		},

		_getItemsPerTransition: function () {

		    if (typeof this.options.itemsPerTransition === 'number') {
				return this.options.itemsPerTransition;
		    }

		    return this._getItemsPerPage();
			
		},

		_getMaskDim: function () {
			
			return this.elements.mask[this.helperStr.dim]();

		},

		next: function (animate) {
			
			var page = this.page + 1;

			if (this._isValid(page)) {
				this.oldPage = this.page;
				this.page = page;
				this._go(animate);
			}

			return;
		},

		prev: function (animate) {
			
			var page = this.page - 1;

			if (this._isValid(page)) {
				this.oldPage = this.page;
				this.page = page;
				this._go(animate);
			}

			return;
		},

		// shows specific page (one based)
		goToPage: function (page, animate) {

			if (this._isValid(page)) {
				this.oldPage = this.page;
				this.page = page;
				this._go(animate);
			}
			
			return;
		},

		// returns true if page index is valid, false if not
		_isValid: function (page) {
			
			if (page <= this._getNoOfPages() && page >= 1) {
				return true;
			}
			
			return false;
		},

		// returns obj with useful data to be passed into callback events
		_getData: function () {
		
			return {
				page: this.page,
				oldPage: this.oldPage,
				noOfItems: this.getNoOfItems(),
				noOfPages: this._getNoOfPages(),
				elements: this.elements
			};
			
		},

		// abstract _slide to easily override within extensions
		_go: function (animate) {
			
			this._slide(animate);

			return;
		},

		_slide: function (animate) {
		
			var self = this,
				speed = animate === false ? 0 : this.options.speed, // default to animate
				animateProps = {},
				pos;

			this._trigger('beforeAnimate', null, this._getData());
				
			pos = this._getPos();

			animateProps[this.helperStr.pos] = -pos;

			this.elements.runner
				.stop()
				.animate(animateProps, speed, this.options.easing, function () {

					self._trigger('afterAnimate', null, self._getData());

				});
				
			this._updateUi();

			return;
		},

		_getPos: function () {

			var temp = this.page - 1;
			
			var lastPos = this._getAbsoluteLastPos(),
				pos = this.elements.items
					.eq(this.pages[this.page - 1] - 1) // arrays and .eq() are zero based, carousel is 1 based
						.position()[this.helperStr.pos];

			// check pos doesn't go past last posible pos
			if (pos > lastPos) {
				pos = lastPos;
			}
			
			return pos;
		},

		// gets lastPos to ensure runner doesn't move beyond mask (allowing mask to be any width and the use of margins)
		_getAbsoluteLastPos: function () {
 			
			var lastItem = this.elements.items.eq(this.getNoOfItems() - 1);
			
			return lastItem.position()[this.helperStr.pos] + this._getItemDim() -
					this._getMaskDim() - parseInt(lastItem.css('margin-' + this.helperStr.pos2), 10);

		},

		// updates pagination, next and prev link status classes
		_updateUi: function () {

			if (this.options.pagination) {
				this._updatePagination();
			}

			if (this.options.nextPrevActions) {
				this._updateNextPrevActions();
			}

			return;
		},

		_updatePagination: function () {
			
			var activeClass = this.widgetBaseClass + '-pagination-link-active';

			this.elements.pagination
				.children('li')
					.removeClass(activeClass)
					.eq(this.page - 1)
						.addClass(activeClass);

			return;
		},

		_updateNextPrevActions: function () {
			
			var elems = this.elements,
				page = this.page,
				disabledClass = this.widgetBaseClass + '-action-disabled';

			elems.nextAction
				.add(elems.prevAction)
					.removeClass(disabledClass);
				
			if (page === this._getNoOfPages()) {
				elems.nextAction.addClass(disabledClass);
			}
			else if (page === 1) {
				elems.prevAction.addClass(disabledClass);
			}

			return;
		},

		// formalise appending items as, continuous adds cloned items,
		// adding complexity
		add: function (items) {

			this.elements.runner.append(items);
			this.refresh();

			return;
		},

		// handles option updates
		_setOption: function (option, value) {

			var requiresRefresh = [
				'itemsPerPage',
				'itemsPerTransition',
				'orientation'
			];		

			_super._setOption.apply(this, arguments);

			switch (option) {

			case 'orientation':
			
				this.elements.runner
					.css(this.helperStr.pos, '')
					.width('');

				this._defineOrientation();

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

			if ($.inArray(option, requiresRefresh) !== -1) {
				this.refresh();
			}

			return;
		},

		// refresh carousel
		refresh: function () {

			var noOfPages;

			// re-cache items in case new items have been added
			this.elements.items = this.elements.runner.children('.' + this.widgetBaseClass + '-item');

			this._addClasses();
			this._setRunnerWidth();
			this._setPages();
			this._addPagination();

			// validate page
			noOfPages = this._getNoOfPages();
			if (this.page > noOfPages) {
				this.page = noOfPages;
			}
			this.goToPage(this.page, false);

			return;
		},

		// returns carousel to original state
		destroy: function () {

			var elems = this.elements,
				cssProps = {};

			this.element
				.removeClass()
				.addClass(this.oldClass);
			
			if (this.maskAdded) {
				elems.runner
					.unwrap('.' + this.widgetBaseClass + '-mask');
			}

			cssProps[this.helperStr.pos] = '';
			cssProps[this.helperStr.dim] = '';
			elems.runner.css(cssProps);
			
			this._removePagination();
			this._removeNextPrevActions();
			
			_super.destroy.apply(this, arguments);

			return;
		}

	});
	
	$.rs.carousel.version = '0.8';

})(jQuery);