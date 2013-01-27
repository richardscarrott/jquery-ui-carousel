/*global jQuery */
/*jshint bitwise: true, camelcase: true, curly: true, eqeqeq: true, forin: true,
immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: single,
undef: true, unused: true, strict: true, trailing: true, browser: true */

/*
 * jquery.rs.carousel-continuous v0.10.7
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
 *  jquery.js v1.6+
 *  jquery.ui.widget.js v1.8+
 *  jquery.rs.carousel.js v0.10.7
 *
 */
 
(function ($, undefined) {

    'use strict';

    var _super = $.rs.carousel.prototype;
    
    $.widget('rs.carousel', $.rs.carousel, {
    
        options: {
            continuous: false
        },
        
        _create: function () {

            if (this.options.continuous) {
                this.options.loop = true;
                // clones fill whitespace
                this.options.whitespace = true;
            }
        
            _super._create.apply(this, arguments);

            if (this.options.continuous) {
                this._addClonedItems();
                this._setRunnerWidth();
                // go to page to ensure clones are ignored
                this.goToPage(0, false);
            }
            
            return;
        },
        
        // appends and prepends items to provide illusion of continuous scrolling
        _addClonedItems: function () {

            if (this.options.disabled) {
                this._removeClonedItems();
                return;
            }
        
            var elems = this.elements,
                cloneClass = this._getWidgetFullName() + '-item-clone',
                visibleItems = this._getVisibleItems(0);

            this._removeClonedItems();

            elems.clonedBeginning = visibleItems
                .clone()
                    // add one extra item in case its partially visible
                    .add(this.elements.items.slice(visibleItems.length).first().clone())
                        .addClass(cloneClass)
                        .appendTo(elems.runner);

            elems.clonedEnd = this.getPage(this.getNoOfPages() - 1)
                .clone()
                    .addClass(cloneClass)
                    .prependTo(elems.runner);
            
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

        // needs to be overridden to take into account cloned items
        _setRunnerWidth: function () {

            var elems = this.elements,
                width = 0;
            
            if (this.options.continuous) {

                // reset width in case orientation
                // has been changed
                elems.runner.width('');

                if (!this.isHorizontal) {
                    return;
                }
                
                elems.runner
                    .width(function () {
                        elems.items
                            .add(elems.clonedBeginning)
                                .add(elems.clonedEnd)
                                    .each(function () {
                                        width += $(this).outerWidth(true);
                                    });

                        return width;
                    });

            }
            else {
                _super._setRunnerWidth.apply(this, arguments);
            }

            return;
        },

        _slide: function (e) {

            var pos;

            if (this.options.continuous) {

                // if moving to first page
                if (e.type === 'carousel:next' && this.index === 0) {
                    // jump to last page clone
                    pos = this.elements.clonedEnd
                        .first()
                            .position()[this.isHorizontal ? 'left' : 'top'];
                }
                // if moving to last page
                else if (e.type === 'carousel:prev' && this.index === this.getNoOfPages() - 1) {
                    // jump to first page clone
                    pos = this.elements.clonedBeginning
                        .first()
                            .position()[this.isHorizontal ? 'left' : 'top'];
                }

                this.elements.runner
                        .css(this.isHorizontal ? 'left' : 'top', -pos);
            }

            // continue
            _super._slide.apply(this, arguments);

            return;
        },

        refresh: function () {

            _super.refresh.apply(this, arguments);
            
            if (this.options.continuous) {
                this._addClonedItems();
                this._setRunnerWidth();
                this.goToPage(this.index, false);
            }
            
            return;
        },

        // override to avoid clones
        _recacheItems: function () {

            var fullName = this._getWidgetFullName();

            this.elements.items = this.elements.runner
                .find(this.options.items)
                    .not('.' + fullName + '-item-clone')
                        .addClass(fullName + '-item');

            return;
        },

        add: function (items) {

            if (this.elements.items.length) {

                this.elements.items
                    .last()
                        .after(items);

                this.refresh();

                return;
            }
            
            // cloned items won't exist so use add from prototype (appends to runner)
            _super.add.apply(this, arguments);

            return;
        },

        _setOption: function (option, value) {
            
            _super._setOption.apply(this, arguments);

            if (option === 'continuous') {

                this.options.loop = true;
                this.options.whitespace = true;

                if (!value) {
                    this._removeClonedItems();
                }
                
                this.refresh();
            }
            
            return;
        },
        
        destroy: function () {
            
            this._removeClonedItems();
            
            _super.destroy.apply(this);
            
            return;
        }
        
    });
    
})(jQuery);