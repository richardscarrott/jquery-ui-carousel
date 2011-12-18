/*
 * jquery.rs.carousel-autoscroll v0.8.6
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
            pause: 8000,
            autoScroll: false
        },
        
        _create: function() {
        
            _super._create.apply(this);
            
            if (!this.options.autoScroll) {
                return;
            }
            
            this._bindAutoScroll();
            this._start();
            
            return;
        },
        
        _bindAutoScroll: function() {
            
            if (this.autoScrollInitiated) {
                return;
            }
            
            this.element
                .bind('mouseenter.' + this.widgetName, $.proxy(this, '_stop'))
                .bind('mouseleave.' + this.widgetName, $.proxy(this, '_start'));
                
            this.autoScrollInitiated = true;
            
            return;
        },
        
        _unbindAutoScroll: function() {
            
            this.element
                .unbind('mouseenter.' + this.widgetName)
                .unbind('mouseleave.' + this.widgetName);
                
            this.autoScrollInitiated = false;
            
            return;
        },
        
        _start: function() {
        
            var self = this;
            
            // ensures interval isn't started twice
            this._stop();
            
            this.interval = setInterval(function() {

                if (self.page === self.getNoOfPages()) {
                    self.goToPage(1);
                }
                else {
                    self.next();
                }
            
            }, this.options.pause);
            
            return;
        },
        
        _stop: function() {
        
            clearInterval(this.interval);
            
            return;     
        },
        
        _setOption: function (option, value) {
        
            _super._setOption.apply(this, arguments);
            
            switch (option) {
                
            case 'autoScroll':
            
                this._stop();
                
                if (value) {
                    this._bindAutoScroll();
                    this._start();
                }
                else {
                    this._unbindAutoScroll();
                }
                
                break;
                    
            }
            
            return;
        },
        
        destroy: function() {
            
            this._stop();
            _super.destroy.apply(this);
            
            return;
        }
        
    });
    
})(jQuery);