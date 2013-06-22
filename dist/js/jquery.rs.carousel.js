/*global jQuery */
/*jshint bitwise: true, camelcase: true, curly: true, eqeqeq: true, forin: true,
immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: single,
undef: true, unused: true, strict: true, trailing: true, browser: true */

/*
 * jquery.rs.carousel.js 1.0.2
 * https://github.com/richardscarrott/jquery-ui-carousel
 *
 * Copyright (c) 2013 Richard Scarrott
 * http://www.richardscarrott.co.uk
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Depends:
 *  jquery.js v1.8+
 *  jquery.ui.widget.js v1.8+
 */

(function ($, undefined) {

    'use strict';

    var _super = $.Widget.prototype;

    $.widget('rs.carousel', {

        version: '1.0.2',

        options: {
            // selectors
            mask: '> div',
            runner: '> ul',
            items: '> li',

            // options
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
            fx: 'slide',
            translate3d: false,

            // callbacks
            create: null,
            before: null,
            after: null
        },

        _create: function () {

            // widget factory 1.8.* backwards compat
            this.widgetFullName = this.widgetFullName || this.widgetBaseClass;
            this.eventNamespace = this.eventNamespace || '.' + this.widgetName;

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
                fullName = this.widgetFullName;

            this.element.addClass(fullName);

            elems.mask = this.element
                .find(this.options.mask)
                    .addClass(fullName + '-mask');

            elems.runner = (elems.mask.length ? elems.mask : this.element)
                    .find(this.options.runner)
                            .addClass(fullName + '-runner');

            elems.items = elems.runner
                .find(this.options.items)
                    .addClass(fullName + '-item');

            return;
        },

        _setIsHorizontal: function () {

            var elems = this.elements,
                fullName = this.widgetFullName;

            this.element
                .removeClass(fullName + '-horizontal')
                .removeClass(fullName + '-vertical');

            if (this.options.orientation === 'horizontal') {
                this.isHorizontal = true;
                this.element.addClass(fullName + '-horizontal');
                elems.runner.css('top', '');
            }
            else {
                this.isHorizontal = false;
                this.element.addClass(fullName + '-vertical');
                elems.runner.css('left', '');
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
                .wrap('<div class="' + this.widgetFullName + '-mask" />')
                .parent();

            // indicates whether mask was dynamically added or already existed in mark-up
            this.maskAdded = true;

            return;
        },

        // adds next and prev links
        _addNextPrevActions: function () {

            if (!this.options.nextPrevActions) {
                return;
            }

            var self = this,
                elems = this.elements,
                opts = this.options,
                eventNamespace = this.eventNamespace;

            this._removeNextPrevActions();

            elems.prevAction = opts.insertPrevAction.apply(this.element[0])
                .bind('click' + eventNamespace, function (e) {
                    e.preventDefault();
                    self.prev();
                });

            elems.nextAction = opts.insertNextAction.apply(this.element[0])
                .bind('click' + eventNamespace, function (e) {
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

        // refresh carousel
        refresh: function (recache) {

            // undefined should pass condition
            if (recache !== false) {
                this._recacheItems();
            }

            this._setPages();
            this._addPagination();
            this._setRunnerWidth();
            this.index = this._makeValid(this.index);
            this.goToPage(this.index, false, undefined, true);
            this._checkDisabled();

            return;
        },

        // re-cache items in case new items have been added,
        // moved to own method so continuous can easily override
        // to avoid clones
        _recacheItems: function () {

            this.elements.items = this.elements.runner
                .find(this.options.items)
                    .addClass(this.widgetFullName + '-item');

            return;
        },

        // sets pages array - [jQuery(li, li, li), jQuery(li, li, li, li), jQuery(li, li, li), jQuery(li, li)]
        _setPages: function () {

            var self = this,
                itemIndex = 0,
                lastItemIndex = isNaN(this.options.itemsPerTransition) ? undefined : this._getLastItemIndex(),
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
                    // #37 - allow `itemsPerTransition` to be passed in as string
                    itemIndex += parseInt(this.options.itemsPerTransition, 10);
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

        _getMaskDim: function () {

            return this.elements.mask[this.isHorizontal ? 'width' : 'height']();

        },

        getNoOfItems: function () {

            return this.elements.items.length;

        },

        // adds pagination links and binds associated events
        _addPagination: function () {

            if (!this.options.pagination) {
                return;
            }

            var self = this,
                fullName = this.widgetFullName,
                pagination = $('<ol class="' + fullName + '-pagination" />'),
                links = [],
                noOfPages = this.getNoOfPages(),
                i;

            this._removePagination();

            for (i = 0; i < noOfPages; i++) {
                links[i] = '<li class="' + fullName + '-pagination-link"><a href="#page-' + i + '">' + (i + 1) + '</a></li>';
            }

            pagination
                .append(links.join(''))
                .delegate('a', 'click' + this.eventNamespace, function (e) {
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

        // returns noOfPages
        getNoOfPages: function () {

            return this.pages.length;

        },

        // if no of items is less than items on first page then the
        // carousel should be disabled.
        _checkDisabled: function () {

            if (this.getNoOfPages() <= 1) {
                this.disable();
                this._disabled = true;
            }
            // only enable if carousel was disabled internally.
            else if (this._disabled) {
                this.enable();
                this._disabled = false;
            }

            return;
        },

        _setRunnerWidth: function () {

            var elems = this.elements,
                width = 0;

            // reset width in case orientation has been changed
            elems.runner.width('');

            if (!this.isHorizontal) {
                return;
            }

            elems.runner
                .width(function () {
                    elems.items
                        .each(function () {
                            width += $(this).outerWidth(true);
                        });

                    return width;
                });

            return;
        },

        next: function (animate) {

            var index = this.index + 1;

            if (this.options.loop && index >= this.getNoOfPages()) {
                index = 0;
            }

            this.goToPage(index, animate, 'carousel:next');

            return;
        },

        prev: function (animate) {

            var index = this.index - 1;

            if (this.options.loop && index < 0) {
                index = this.getNoOfPages() - 1;
            }

            this.goToPage(index, animate, 'carousel:prev');

            return;
        },

        goToPage: function (index, animate, /* INTERNAL */ eventName, /* INTERNAL */ silent) {

            // undefined should pass
            animate = animate === false ? false : true;

            if (!this.options.disabled && this._isValid(index)) {
                this.prevIndex = this.index;
                this.index = index;
                // calling `this._slide` using `options.fx` to easily override within extensions
                this['_' + this.options.fx]($.Event(eventName ? eventName : 'carousel:gotopage', {
                    animate: animate,
                    speed: animate ? this.options.speed : 0
                }), silent);
            }

            // make sure updateUi is called even when disabled
            this._updateUi();

            return;
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

        // if silent is true callbacks won't be fired
        _slide: function (e, silent) {

            var self = this,
                animateProps = {},
                lastPos = this._getAbsoluteLastPos(),
                page = this.getPage(),
                pos = page.first().position()[this.isHorizontal ? 'left' : 'top'],
                eventNamespace = this.eventNamespace,
                fullName = this.widgetFullName,
                transitionEndEvent;

            // if before returns false return and revert index back to prevIndex
            if (!silent && !this._trigger('before', e, this._getEventData())) {
                this.index = this.prevIndex;
                return;
            }

            // check pos doesn't go past last posible pos
            if (pos > lastPos) {
                pos = lastPos;
            }

            if (this.options.translate3d) {

                transitionEndEvent = [
                    'transitionend' + eventNamespace,
                    'webkitTransitionEnd' + eventNamespace,
                    'oTransitionEnd' + eventNamespace
                ];

                if (e.animate) {
                    this.element.addClass(fullName + '-transition');
                }

                this.elements.runner
                    .unbind(transitionEndEvent.join(' '))
                    .on(transitionEndEvent.join(' '), function () {
                        self.element.removeClass(fullName + '-transition');
                        if (!silent) {
                            self._trigger('after', e, self._getEventData());
                        }
                    })
                    .css('transform', 'translate3d(' + (this.isHorizontal ? -pos + 'px, 0, 0' : '0, ' + -pos + 'px, 0') + ')');

                // if we're not animating the after callback should still be called
                if (!e.animate) {
                    this.element.removeClass(fullName + '-transition');
                    if (!silent) {
                        this._trigger('after', e, this._getEventData());
                    }
                }

            }
            else {

                animateProps[this.isHorizontal ? 'left' : 'top'] = -pos;
                this.elements.runner
                    .stop()
                    .animate(animateProps, e.speed, this.options.easing, function () {
                        if (!silent) {
                            self._trigger('after', e, self._getEventData());
                        }
                    });

            }

            return;
        },

        // gets lastPos to ensure runner doesn't move beyond mask
        _getAbsoluteLastPos: function () {

            if (this.options.whitespace) {
                return;
            }

            var lastPos,
                lastItem = this.elements.items.eq(this.getNoOfItems() - 1),
                lastItemPos = lastItem.position()[this.isHorizontal ? 'left' : 'top'],
                lastItemDim = lastItem[this.isHorizontal ? 'outerWidth' : 'outerHeight'](true);

            lastPos = lastItemPos + lastItemDim - this._getMaskDim();

            // if lastPos is less than 0 it means there aren't enough items to fill the entire mask
            return lastPos < 0 ? undefined : lastPos;
        },

        // returns jQuery object of items on page
        getPage: function (index) {

            return this.pages[(typeof index !== 'undefined' ? index : this.index)] || $([]);

        },

        // returns pages array
        getPages: function () {

            return this.pages;

        },

        _getEventData: function () {

            return {
                page: this.getPage(),
                prevPage: this.getPage(this.prevIndex),
                elements: this.elements
            };

        },

        _getCreateEventData: function () {

            return this._getEventData();

        },


        // updates pagination, next and prev link state classes
        _updateUi: function () {

            this._updateActiveItems();

            if (this.options.pagination) {
                this._updatePagination();
            }

            if (this.options.nextPrevActions) {
                this._updateNextPrevActions();
            }

            return;
        },

        _updateActiveItems: function () {

            var fullName = this.widgetFullName,
                activeClass = fullName + '-item-active';

            this.elements.items
                .removeClass(activeClass);

            this.getPage()
                .addClass(activeClass);

            return;
        },

        _updatePagination: function () {

            var fullName = this.widgetFullName,
                activeClass = fullName + '-pagination-link-active',
                disabledClass = fullName + '-pagination-disabled',
                pagination = this.elements.pagination
                    .removeClass(disabledClass);

            if (this.options.disabled) {
                pagination.addClass(disabledClass);
            }

            pagination
                .children('.' + fullName + '-pagination-link')
                    .removeClass(activeClass)
                    .eq(this.index)
                        .addClass(activeClass);

            return;
        },

        _updateNextPrevActions: function () {

            var elems = this.elements,
                actions = elems.nextAction.add(elems.prevAction),
                index = this.index,
                fullName = this.widgetFullName,
                activeClass = fullName + '-action-active',
                disabledClass = fullName + '-action-disabled';

            actions
                .addClass(activeClass)
                .removeClass(disabledClass);

            if (this.options.disabled) {
                actions.addClass(disabledClass);
            }

            if (!this.options.loop) {

                if (index === this.getNoOfPages() - 1) {
                    elems.nextAction
                        .removeClass(activeClass);
                }

                if (index === 0) {
                    elems.prevAction
                        .removeClass(activeClass);
                }

            }

            return;
        },

        _setOption: function (option, value) {

            _super._setOption.apply(this, arguments);

            switch (option) {

            case 'orientation':

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
            case 'disabled':

                this._updateUi();

                break;

            case 'itemsPerTransition':
            case 'whitespace':

                this.refresh();

                break;
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

        // returns current index
        getIndex: function () {

            return this.index;

        },

        // returns prev index
        getPrevIndex: function () {

            return this.prevIndex;

        },

        // returns carousel to original state
        destroy: function () {

            var elems = this.elements,
                fullName = this.widgetFullName,
                cssProps = {};

            this.element
                .removeClass(fullName)
                .removeClass(fullName + '-horizontal')
                .removeClass(fullName + '-vertical');
            elems.mask
                .removeClass(fullName + '-mask');
            elems.runner
                .removeClass(fullName + '-runner');
            elems.items
                .removeClass(fullName + '-item');

            if (this.maskAdded) {
                elems.runner
                    .unwrap();
            }

            cssProps[this.isHorizontal ? 'left' : 'top'] = '';
            cssProps[this.isHorizontal ? 'width' : 'height'] = '';
            cssProps.transform = '';
            elems.runner
                .css(cssProps);

            this._removePagination();
            this._removeNextPrevActions();

            elems.runner
                .unbind(this.eventNamespace);

            _super.destroy.apply(this, arguments);

            return;
        }

    });

})(jQuery);

