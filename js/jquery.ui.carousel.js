/*
 * jQuery UI Carousel Plugin v2.0
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
 
(function($, undefined) {

	// ie alias (excuse: ie is choppy when scrollPos is animated)
	var headache = $.browser.msie && $.browser.version.substr(0, 1) < 9;

	$.widget('ui.carousel', {
	
		version: 2.0,
		
		options: {
			itemsPerPage: 1,
			itemsPerTransition: 1,
			noOfRows: 1,
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
		
			this._itemIndex = 0;
			this._elements();
			this._noOfItems = this._elements.items.length / this.options.noOfRows;
			
			if (this._noOfItems <= this.options.itemsPerPage) { return; }
			
			this.noOfPages = Math.ceil((this._noOfItems - this.options.itemsPerPage) / this.options.itemsPerTransition) + 1;
			
			this._setRunnerWidth();
			this._addMask();
			
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
		
			var width = this._elements.items.outerWidth(true) * this._noOfItems;
			this._elements.runner.width(width);
			
		},
		
		_addMask: function() {
		
			var maskHeight = this._elements.runner.outerHeight(true);
			
			this._elements.mask = this._elements.runner
				.wrap('<div class="mask" />')
				.parent()
				.height(maskHeight);
			
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
		
			var self = this;
			
			// bit crap but add() then appendTo() doesn't work in jQuery 1.4.2 so appended individually
			this._elements.prevAction = $('<a href="#" class="prev">Prev</a>').appendTo(this._elements.container);
			this._elements.nextAction = $('<a href="#" class="next">Next</a>').appendTo(this._elements.container);
				
			this._elements.nextAction.bind('click.carousel', function() {
				self.next();
				return false;
			});
			
			this._elements.prevAction.bind('click.carousel', function() {
				self.prev();
				return false;
			});
			
		},
		
		next: function() {
		
			this._itemIndex = this._itemIndex + this.options.itemsPerTransition;
			this._go();
			
		},
		
		prev: function() {
		
			this._itemIndex = this._itemIndex - this.options.itemsPerTransition;
			this._go();
			
		},
		
		_updateUi: function() {
		
			if (this.options.pagination) {
				this._elements.pagination
					.children('li')
						.removeClass('current')
						.eq(Math.ceil(this._itemIndex / this.options.itemsPerTransition))
							.addClass('current');
			}

			if (this.options.nextPrevActions) {
				this._elements.nextAction
					.add(this._elements.prevAction)
						.removeClass('disabled');
						
				if (this._itemIndex === (this._noOfItems - this.options.itemsPerPage)) {
					this._elements.nextAction.addClass('disabled');
				}
				else if (this._itemIndex === 0) {
					this._elements.prevAction.addClass('disabled');
				}
			}
			
		},
		
		goTo: function(index) {
		
			if (typeof index === 'number') {
				this._itemIndex = index;
			}
			else {
				// assume jquery or DOM element
				this._itemIndex = $(index).index();
			}
			
			this._go();
			
		},
		
		_go: function() {
		
			var self = this,
				nextItem, 
				pos;
			
			// check whether there are enough items to animate to
			if (this._itemIndex > (this._noOfItems - this.options.itemsPerPage)) {
				this._itemIndex = this._noOfItems - this.options.itemsPerPage; // go to last panel - items per transition
			}
			if (this._itemIndex < 0) {
				this._itemIndex = 0; // go to first
			}
			
			nextItem = this._elements.items.eq(this._itemIndex);
			pos = nextItem.position();
			
			this._trigger('beforeAnimate', null, {
				index: this._itemIndex
			});
			
			if (headache) {	
				this._elements.runner
					.stop()
					.animate({left: -pos.left}, this.options.speed, this.options.easing, function() {
						
						self._trigger('afterAnimate', null, {
							index: self._itemIndex
						});
						
					});
			}
			else {
				this._elements.mask
					.stop()
					.animate({'scrollLeft': pos.left}, this.options.speed, this.options.easing, function() {
						
						self._trigger('afterAnimate', null, {
							index: self._itemIndex
						});
						
					});
			
			}
			
			this._updateUi();
			
		},
		
		destroy: function() {
		
			this._elements.runner
				.unwrap('.mask')
				.css('left', 'auto');
				
			this._elements.pagination.remove();
			this._elements.nextAction.remove();
			this._elements.prevAction.remove();
			
			// overkill?
			$.each(this._elements, function() {
				$(this).unbind('.carousel');
			});
		
			$.Widget.prototype.destroy.apply(this, arguments);
			
		}
		
	});
})(jQuery);