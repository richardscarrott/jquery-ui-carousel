/*
 * jquery.rs.carousel.js v0.10.4
 *
 * Copyright (c) 2012 Richard Scarrott
 * http://www.richardscarrott.co.uk
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Depends:
 *  jquery.js v1.4+
 *  jquery.ui.widget.js v1.8
 *
 */
 
(function ($, undefined) {

    var _super = $.Widget.prototype;
    
    $.widget('rs.carousel', {

        options: {
            itemsPerTransition: 'auto',
            orientation: 'horizontal',
            loop: false,
            whitespace: false,
            nextPrevActions: true,
            insertPrevAction: function () {
                return $('<a href="#" class="rs-carousel-action rs-carousel-action-prev">Prev</a>').appendTo(this);
            },
            insertNextAction: function () {
                return $('<a href="#" class="rs-carousel-action rs-carousel-action-next">Next</a>').appendTo(this);
            },
            pagination: true,
            insertPagination: function (pagination) {
                return $(pagination).insertAfter($(this).find('.rs-carousel-mask'));
            },
            speed: 'normal',
            easing: 'swing',

            // callbacks
            create: null,
            before: null,
            after: null
        },

        _create: function () {

            this.index = 0;
            this._elements();
            this._setIsHorizontal();
            this._addMask();
            this._addNextPrevActions();
            this.refresh(false);

            return;
        },

        // caches DOM elements
        _elements: function () {

            var elems = this.elements = {},
                baseClass = '.' + this.widgetBaseClass;

            elems.mask = this.element.children(baseClass + '-mask');
            elems.runner = this.element.find(baseClass + '-runner').first();
            elems.items = elems.runner.children(baseClass + '-item');
            elems.pagination = undefined;
            elems.nextAction = undefined;
            elems.prevAction = undefined;

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

        // set isHorizontal
        _setIsHorizontal: function () {

            this.isHorizontal = this.options.orientation === 'horizontal' ? true : false;

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
            
            var self = this,
                width = 0;
            
            this.elements.runner.width(function () {
                
                self.elements.items
                    .each(function () {
                        width += $(this).outerWidth(true);
                    });

                return width;

            });

            return;
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
                opts = this.options;
                
            this._removeNextPrevActions();

            elems.prevAction = opts.insertPrevAction.apply(this.element[0])
                .bind('click.' + this.widgetName, function (e) {
                    e.preventDefault();
                    self.prev();
                });

            elems.nextAction = opts.insertNextAction.apply(this.element[0])
                .bind('click.' + this.widgetName, function (e) {
                    e.preventDefault();
                    self.next();
                });
            
            return;
        },

        _removeNextPrevActions: function () {
        
            var elems = this.elements;
        
            if (elems.nextAction) {
                elems.nextAction.remove();
                elems.nextAction = undefined;
            }
            
            if (elems.prevAction) {
                elems.prevAction.remove();
                elems.prevAction = undefined;
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
                pagination = $('<ol class="' + baseClass + '-pagination" />'),
                links = [],
                noOfPages = this.getNoOfPages(),
                i;
                
            this._removePagination();

            for (i = 0; i < noOfPages; i++) {
                links[i] = '<li class="' + baseClass + '-pagination-link"><a href="#page-' + i + '">' + (i + 1) + '</a></li>';
            }

            pagination
                .append(links.join(''))
                .delegate('a', 'click.' + this.widgetName, function (e) {
                    e.preventDefault();
                    self.goToPage(parseInt(this.hash.split('-')[1], 10));
                });
            
            this.elements.pagination = this.options.insertPagination.call(this.element[0], pagination);
            
            return;
        },

        _removePagination: function () {
        
            if (this.elements.pagination) {
                this.elements.pagination.remove();
                this.elements.pagination = undefined;
            }
            
            return;
        },

        // sets pages array - [jQuery(li, li, li), jQuery(li, li, li, li), jQuery(li, li, li), jQuery(li, li)]
        _setPages: function () {

            var self = this,
                itemIndex = 0,
                lastItemIndex = isNaN(this.options.itemsPerTransition) ? undefined : this._getLastItemIndex(),
                maskDim = this._getMaskDim(),
                page,
                start;
                
            this.pages = [];
            
            while (itemIndex < this.getNoOfItems()) {

                // if itemsPerTransition isn't a number we need to get the visible
                // items at each item index
                if (isNaN(this.options.itemsPerTransition)) {
                    this.pages.push(self._getVisibleItems(itemIndex));
                    itemIndex += this.pages[this.pages.length - 1].length;
                }
                // otherwise simply slice up the items based on itemsPerTransition
                else {
                    // making sure we don't go past the lastItemIndex
                    if (itemIndex >= lastItemIndex) {
                        this.pages.push(this.elements.items.slice(itemIndex));
                        break;
                    }
                    start = itemIndex;
                    itemIndex += this.options.itemsPerTransition;
                    this.pages.push(this.elements.items.slice(start, itemIndex));
                }
            }

            return;
        },

        // returns last logical item index
        _getLastItemIndex: function () {

            if (this.options.whitespace) {
                return;
            }

            return this.elements.items.index(this._getVisibleItems(0, true).last());
        },

        // returns a jquery object containing the visible items where the `itemIndex`
        // is considered to be the first visible item. Passing in reverse as true allows
        // us to, for example, return the visible items from the last item backwards.
        _getVisibleItems: function (itemIndex, reverse) {

            var self = this,
                page = [],
                items = !reverse ? this.elements.items.slice(itemIndex) : [].reverse.apply($(this.elements.items)).slice(itemIndex),
                maskDim = this._getMaskDim(),
                dim = 0;
        
            items
                .each(function () {
                    dim += self.isHorizontal ? $(this).outerWidth(true) : $(this).outerHeight(true);
                    if (dim > maskDim) {
                        // if no items have been pushed to page then it means the
                        // first item is larger than the mask so we still need to push before
                        // breaking.
                        if (page.length === 0) {
                            page.push(this);
                        }
                        return false;
                    }
                    page.push(this);
                });

            return $(page);
        },

        // returns jQuery object of items on page
        getPage: function (index) {

            return this.pages[(typeof index !== 'undefined' ? index : this.index)] || $([]);

        },

        // returns pages array
        getPages: function () {
            
            return this.pages;

        },

        // returns noOfPages
        getNoOfPages: function () {
            
            return this.pages.length;

        },

        _getMaskDim: function () {
            
            return this.elements.mask[this.isHorizontal ? 'width' : 'height']();

        },

        next: function (animate) {

            var index = this.index + 1;

            if (this.options.loop && index >= this.getNoOfPages()) {
                index = 0;
            }
            
            this.goToPage(index, animate);

            return;
        },

        prev: function (animate) {

            var index = this.index - 1;

            if (this.options.loop && index < 0) {
                index = this.getNoOfPages() - 1;
            }
            
            this.goToPage(index, animate);

            return;
        },

        // shows specific page (one based)
        goToPage: function (index, animate) {

            if (!this.options.disabled && this._isValid(index)) {
                this.prevIndex = this.index;
                this.index = index;
                this._go(animate);
            }
            
            return;
        },

        // returns true if index is valid, false if not
        _isValid: function (index) {
            
            if (index < this.getNoOfPages() && index >= 0) {
                return true;
            }
            
            return false;
        },

        // returns valid page index
        _makeValid: function (index) {
                
            if (index < 0) {
                index = 0;
            }
            else if (index >= this.getNoOfPages()) {
                index = this.getNoOfPages() - 1;
            }

            return index;
        },

        // abstract _slide to easily override within extensions
        _go: function (animate) {

            var speed;

            // undefined should pass as true
            animate = animate === false ? false : true;
            speed = animate ? this.options.speed : 0;

            this._slide(speed, animate);

            return;
        },

        _slide: function (speed, animate) {

            var self = this,
                animateProps = {},
                lastPos = this._getAbsoluteLastPos(),
                page = this.getPage(),
                pos = page.first().position()[this.isHorizontal ? 'left' : 'top'];

            // if before returns false return and revert index back to prevIndex
            if (!this._trigger('before', null, {
                elements: this.elements,
                page: page,
                animate: animate
            })) {
                this.index = this.prevIndex;
                return;
            }

            // check pos doesn't go past last posible pos
            if (pos > lastPos) {
                pos = lastPos;
            }

            animateProps[this.isHorizontal ? 'left' : 'top'] = -pos;
            this.elements.runner
                .stop()
                .animate(animateProps, speed, this.options.easing, function () {
                    
                    self._trigger('after', null, {
                        elements: self.elements,
                        page: page,
                        animate: animate
                    });

                });
                
            this._updateUi();

            return;
        },

        // gets lastPos to ensure runner doesn't move beyond mask
        // whilst allowing mask to be any width and the use of margins
        _getAbsoluteLastPos: function () {
            
            if (this.options.whitespace) {
                return;
            }

            var lastItem = this.elements.items.eq(this.getNoOfItems() - 1);
            
            return Math.floor(lastItem.position()[this.isHorizontal ? 'left' : 'top'] + lastItem[this.isHorizontal ? 'outerWidth' : 'outerHeight']() -
                    this._getMaskDim() - parseInt(lastItem.css('margin-' + (this.isHorizontal ? 'right' : 'bottom')), 10));
        },

        // updates pagination, next and prev link state classes
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
            
            var baseClass = this.widgetBaseClass,
                activeClass = baseClass + '-pagination-link-active';

            this.elements.pagination
                .children('.' + baseClass + '-pagination-link')
                    .removeClass(activeClass)
                    .eq(this.index)
                        .addClass(activeClass);

            return;
        },

        _updateNextPrevActions: function () {
            
            var elems = this.elements,
                index = this.index,
                disabledClass = this.widgetBaseClass + '-action-disabled';

            elems.nextAction
                .add(elems.prevAction)
                    .removeClass(disabledClass);

            if (!this.options.loop) {
                
                if (index === this.getNoOfPages() - 1) {
                    elems.nextAction.addClass(disabledClass);
                }
                else if (index === 0) {
                    elems.prevAction.addClass(disabledClass);
                }

            }

            return;
        },

        add: function (items) {

            this.elements.runner.append(items);
            this.refresh();

            return;
        },

        remove: function (selector) {
            
            if (this.getNoOfItems() > 0) {

                this.elements.items
                    .filter(selector)
                    .remove();

                this.refresh();
            }

            return;
        },

        // handles option updates
        _setOption: function (option, value) {

            _super._setOption.apply(this, arguments);

            switch (option) {

            case 'orientation':
            
                this.elements.runner
                    .css(this.isHorizontal ? 'left' : 'top', '')
                    .width('');

                this._setIsHorizontal();
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

            case 'loop':

                this._updateUi();

                break;

            case 'itemsPerTransition':

                this.refresh();

                break;

            case 'whitespace':

                this.refresh();

                break;
            }

            return;
        },

        // if no of items is less than items on first page then the
        // carousel should be disabled.
        _checkDisabled: function () {

            if (this.getNoOfItems() <= this.getPage(0).length) {
                this.elements.runner.css(this.isHorizontal ? 'left' : 'top', '');
                this.disable();
            }
            else {
                this.enable();
            }

            return;
        },

        // refresh carousel
        refresh: function (recache) {

            // undefined should pass condition
            if (recache !== false) {
                this._recacheItems();
            }

            this._addClasses();
            this._setPages();
            this._addPagination();
            this._checkDisabled();
            this._setRunnerWidth();
            this.index = this._makeValid(this.index);
            this.goToPage(this.index, false);

            return;
        },

        // re-cache items in case new items have been added,
        // moved to own method so continuous can easily override
        // to avoid clones
        _recacheItems: function () {

            this.elements.items = this.elements.runner
                .children('.' + this.widgetBaseClass + '-item');

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

            cssProps[this.isHorizontal ? 'left' : 'top'] = '';
            cssProps[this.isHorizontal ? 'width' : 'height'] = '';
            elems.runner.css(cssProps);
            
            this._removePagination();
            this._removeNextPrevActions();
            
            _super.destroy.apply(this, arguments);

            return;
        },

        // returns current index
        getIndex: function () {
            
            return this.index;

        },

        // returns prev index
        getPrevIndex: function () {
            
            return this.prevIndex;

        },

        // `index` can be $obj, element or 0 based index
        goToItem: function (index, animate) {

            var page,
                pageLength,
                item,
                itemLength;

            // if a number get the element
            if (!isNaN(index)) {
                index = this.elements.items.eq(index);
            }

            if (index.jquery) {
                // unwrap from jquery object
                index = index[0];
            }

            // find item in pages array
            pages:
            for (page = 0, pageLength = this.getNoOfPages(); page < pageLength; page++) {
                for (item = 0, itemLength = this.getPage(page).length; item < itemLength; item++) {
                    if (this.getPage(page)[item] === index) {
                        break pages;
                    }
                }
            }

            this.goToPage(page, animate);

            // return item as jquery object
            return $(index);
        }

    });
    
    $.rs.carousel.version = '0.10.4';

})(jQuery);