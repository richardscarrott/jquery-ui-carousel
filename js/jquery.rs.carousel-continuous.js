/*
 * jquery.rs.carousel-continuous v0.8
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
 *  jquery.rs.carousel.js v0.8+
 *
 */
 
(function($, undefined) {

	var _super = $.rs.carousel.prototype;
	
	$.widget('rs.carousel', $.rs.carousel, {
	
		options: {
			continuous: false
		},
		
		_create: function () {
		
			_super._create.apply(this, arguments);

			if (!this.options.continuous) {
				return;
			}
			
			this._addClonedItems();
			this._setRunnerWidth();

			// go to page (again) to ensure we ignore clones
			this.goToPage(this.options.startAt || 1, false);
			
		},
		
		// appends and prepends items to provide illusion of continuous scrolling
		_addClonedItems: function () {
		
			var elems = this.elements,
				cloneCount = this._getCloneCount(),
				cloneClass = this.widgetBaseClass + '-item-clone';

			this._removeClonedItems();
		
			elems.clonedBeginning = this.elements.items
				.slice(0, cloneCount)
					.clone()
						.removeAttr('id') // keep it valid
						.addClass(cloneClass);

			elems.clonedEnd = this.elements.items
				.slice(-cloneCount)
					.clone()
						.removeAttr('id')
						.addClass(cloneClass);
			
			elems.clonedBeginning.appendTo(elems.runner);
			elems.clonedEnd.prependTo(elems.runner);
			
			return;
		},

		_removeClonedItems: function () {
		
			var elems = this.elements;
		
			if (elems.clonedBeginning) {
				elems.clonedBeginning.remove();
				elems.clonedBeginning = undefined;
			}
			
			if (elems.clonedEnd) {
				elems.clonedEnd.remove();
				elems.clonedEnd = undefined;
			}
		
		},

		// number of cloned items should equal itemsPerPage or, if greater, itemsPerTransition
		_getCloneCount: function () {
			
			var itemsPerPage = this._getItemsPerPage(),
				itemsPerTransition = this._getItemsPerTransition();
			
			return itemsPerPage >= itemsPerTransition ? itemsPerPage : itemsPerTransition;
		},

		// needs to be overridden to take into account cloned items
		_setRunnerWidth: function () {

			if (!this.isHorizontal) {
				return;
			}

			var self = this;
			
			if (this.options.continuous) {
				
				this.elements.runner.width(function () {
					return self._getItemDim() * (self.getNoOfItems() + (self._getCloneCount() * 2));
				});

			}
			else {
				_super._setRunnerWidth.apply(this, arguments);
			}

			return;
		},

		// next and prev links are always valid when continuous
		_isValid: function (page) {
			
			if (this.options.continuous) {
				return true;
			}
			else {
				return _super._isValid.apply(this, arguments);
			}
			
		},

		// if first or last page jump to cloned before slide 
		_go: function () {
			
			var self = this;

			if (this.options.continuous) {

				if (this.page > this._getNoOfPages()) {

					// jump to clonedEnd
					var realIndex,
						cloneIndex;

					this.elements.runner.css(this.helperStr.pos, function () {

						// get item index of old page in context of clonedEnd
						realIndex = self.pages[self.oldPage - 1];
						cloneIndex = self.elements.items.slice(-self._getCloneCount()).index(self.elements.items.eq(realIndex - 1));

						return -self.elements.clonedEnd.eq(cloneIndex).position()[self.helperStr.pos];
					});

					this.page = 1;

				}
				else if (this.page < 1) {

					// jump to clonedBeginning
					this.elements.runner.css(this.helperStr.pos, function () {
						return -self.elements.clonedBeginning.eq(self.oldPage - 1).position()[self.helperStr.pos];
					});

					this.page = this._getNoOfPages();
												
				}

			}

			// continue
			return _super._go.apply(this, arguments);

		},

		// don't need to take into account itemsPerPage when continuous as there's no absolute last pos
		_getNoOfPages: function () {
			
			if (this.options.continuous) {
				return Math.ceil(this.getNoOfItems() / this._getItemsPerTransition());
			}

			return _super._getNoOfPages.apply(this, arguments);
		},

		// not required as cloned items fill space
		_getAbsoluteLastPos: function () {
			
			if (this.options.continuous) {
				return undefined;
			}

			return _super._getAbsoluteLastPos.apply(this, arguments);
		},
		
		// next and prev links are always active
		_updateNextPrevActions: function () {

			var elems = this.elements;

			if (this.options.continuous) {
			
				if (this.options.nextPrevActions) {

					elems.nextAction
						.add(elems.prevAction)
							.removeClass(this.widgetBaseClass + '-action-disabled');
				}

			}
			else {
				_super._updateNextPrevActions.apply(this, arguments);
			}

			return;
		},

		refresh: function() {
			
			if (this.options.continuous) {

				var noOfPages;

				// re-cache items in case new items have been added, avoiding cloned
				this.elements.items = this.elements.runner.children('li').not('.' + this.widgetBaseClass + '-item-clone');
				this._addClasses();
				this._addClonedItems();
				this._setRunnerWidth();
				this._setPages();
				this._addPagination();

				// validate page
				noOfPages = this._getNoOfPages();
				if (this.page > noOfPages) {
					this.page = noOfPages;
				}
				this.goToPage(this.page, false);

			}
			else {
				_super.refresh.apply(this, arguments);
			}
			
			return;
		},

		add: function (items) {

			this.elements.items
				.last()
					.after(items);

			this.refresh();

			return;
		},

		_setOption: function (option, value) {
			
			_super._setOption.apply(this, arguments);
			
			switch (option) {
				
			case 'continuous':
			
				if (!value) {
					this._removeClonedItems();
				}
				
				this.refresh();
				
				break;
			}

			return;
		},

		// autoscrolls _start overridden to support continuous
		// this however means that autoscroll must be included before continuous...
		_start: function() {

			var self = this;

			if (this.options.continuous) {
				
				this.interval = setInterval(function() {
					
					self.next();
				
				}, this.options.pause);
			
			}

			// _super._start won't exist if autoscroll hasn't been included
			else if ($.isFunction(_super._start)) {
				_super._start.apply(this, arguments);
			}
			
			return;
		},
		
		destroy: function() {
			
			this._removeClonedItems();
			
			_super.destroy.apply(this);
			
			return;
		}
		
	});

	$.rs.carousel.version = '0.8';
	
})(jQuery);