/*
 * jquery.rs.carousel-continuous v0.8.6
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
 *  jquery.rs.carousel.js v0.8.6+
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

            if (this.options.continuous) {

                this._setOption('loop', true);
                this._addClonedItems();
                this.goToPage(1, false); // go to page to ensure we ignore clones

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
                cloneCount = this._getCloneCount(),
                cloneClass = this.widgetBaseClass + '-item-clone';

            this._removeClonedItems();
        
            elems.clonedBeginning = this.elements.items
                .slice(0, cloneCount)
                    .clone()
                        .addClass(cloneClass);

            elems.clonedEnd = this.elements.items
                .slice(-cloneCount)
                    .clone()
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

            var visibleItems = Math.ceil(this._getMaskDim() / this._getItemDim()),
                itemsPerTransition = this.getItemsPerTransition();

            return visibleItems >= itemsPerTransition ? visibleItems : itemsPerTransition;
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

        _slide: function (animate) {

            var self = this,
                itemIndex,
                cloneIndex;

            // if first or last page jump to cloned before slide
            if (this.options.continuous) {

                // this criteria means using goToPage(1) when on last page will act as continuous,
                // good thing is it means autoScrolls _start method doesn't have to be overridden
                // anymore, but is it desired?
                if (this.page === 1 && this.prevPage === this.getNoOfPages()) {

                    // jump to clonedEnd
                    this.elements.runner.css(this.helperStr.pos, function () {

                        // get item index of old page in context of clonedEnd
                        itemIndex = self.pages[self.prevPage - 1];

                        cloneIndex = self.elements.items
                            .slice(-self._getCloneCount())
                            .index(self.elements.items.eq(itemIndex - 1));

                        return -self.elements.clonedEnd
                            .eq(cloneIndex)
                                .position()[self.helperStr.pos];
                    });

                }
                else if (this.page === this.getNoOfPages() && this.prevPage === 1) {

                    // jump to clonedBeginning
                    this.elements.runner.css(this.helperStr.pos, function () {
                        return -self.elements.clonedBeginning
                            .first()
                                .position()[self.helperStr.pos];
                    });
                                                
                }

            }

            // continue
            _super._slide.apply(this, arguments);

            return;
        },

        // don't need to take into account itemsPerPage when continuous as there's no absolute last pos
        getNoOfPages: function () {
            
            var itemsPerTransition;

            if (this.options.continuous) {

                itemsPerTransition = this.getItemsPerTransition();

                if (itemsPerTransition <= 0) {
                    return 0;
                }

                return Math.ceil(this.getNoOfItems() / itemsPerTransition);
            }

            return _super.getNoOfPages.apply(this, arguments);
        },

        // not required as cloned items fill space
        _getAbsoluteLastPos: function () {
            
            if (this.options.continuous) {
                return;
            }

            return _super._getAbsoluteLastPos.apply(this, arguments);
        },

        refresh: function() {

            _super.refresh.apply(this, arguments);
            
            if (this.options.continuous) {
                this._addClonedItems();
                this.goToPage(this.page, false);
            }
            
            return;
        },

        // override to avoid clones
        _recacheItems: function () {

            var baseClass = '.' + this.widgetBaseClass;

            this.elements.items = this.elements.runner
                .children(baseClass + '-item')
                    .not(baseClass + '-item-clone');

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
            
            switch (option) {
                
            case 'continuous':

                this._setOption('loop', value);

                if (!value) {
                    this._removeClonedItems();
                }
                
                this.refresh();
                
                break;
            }

            return;
        },
        
        destroy: function() {
            
            this._removeClonedItems();
            
            _super.destroy.apply(this);
            
            return;
        }
        
    });
    
})(jQuery);