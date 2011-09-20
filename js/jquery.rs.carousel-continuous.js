/*
 * jquery.rs.carousel-continuous v0.8.1
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
 *  jquery.rs.carousel.js v0.8.1+
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
                // add clones and go to page (again) to ensure we ignore clones
                this._addClonedItems();
                this.goToPage(this.options.startAt || 1, false);
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
        // perhaps allow number to be adjusted with extra clone option...
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

        // next and prev links are always valid
        _isValid: function (page) {
            
            if (this.options.continuous) {
                return true;
            }
            
            return _super._isValid.apply(this, arguments);
            
        },

        _slide: function (animate) {

            var self = this,
                realIndex,
                cloneIndex;

            // if first or last page jump to cloned before slide
            if (this.options.continuous) {

                if (this.page > this._getNoOfPages()) {

                    // jump to clonedEnd
                    this.elements.runner.css(this.helperStr.pos, function () {

                        // get item index of old page in context of clonedEnd
                        realIndex = self.pages[self.oldPage - 1];

                        // do we need to slice here? try self.elements.clonedEnd.index(self.elements.items.eq(realIndex)); maybe..
                        cloneIndex = self.elements.items.slice(-self._getCloneCount()).index(self.elements.items.eq(realIndex - 1));

                        return -self.elements.clonedEnd.eq(cloneIndex).position()[self.helperStr.pos];
                    });

                    this.page = 1;

                }
                else if (this.page < 1) {

                    // jump to clonedBeginning
                    this.elements.runner.css(this.helperStr.pos, function () {
                        // .eq should be .first()?
                        return -self.elements.clonedBeginning.eq(self.oldPage - 1).position()[self.helperStr.pos];
                    });

                    this.page = this._getNoOfPages();
                                                
                }

            }

            // continue
            _super._slide.apply(this, arguments);

            return;
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
                return;
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

            _super.refresh.apply(this, arguments);
            
            if (this.options.continuous) {
                this._addClonedItems();
                this.goToPage(this.page, false);
            }
            
            return;
        },

        // override to avoid clones
        recacheItems: function () {

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

    $.rs.carousel.version = '0.8.1';
    
})(jQuery);