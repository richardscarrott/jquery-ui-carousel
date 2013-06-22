/*global jQuery */
/*jshint bitwise: true, camelcase: true, curly: true, eqeqeq: true, forin: true,
immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: single,
undef: true, unused: true, strict: true, trailing: true, browser: true */

/*
 * jquery.rs.carousel-autoscroll 1.0.2
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
 *  jquery.rs.carousel.js v0.11.1
 */
 
(function ($, undefined) {

    'use strict';

    var _super = $.rs.carousel.prototype;
    
    $.widget('rs.carousel', $.rs.carousel, {
    
        options: {
            pause: 8000,
            autoScroll: false
        },
        
        _create: function () {
        
            _super._create.apply(this);
            
            if (!this.options.autoScroll) {
                return;
            }
            
            this._bindAutoScroll();
            this._start();
            
            return;
        },
        
        _bindAutoScroll: function () {
            
            if (this.autoScrollInitiated) {
                return;
            }

            var eventNamespace = this.eventNamespace;
            
            this.element
                .bind('mouseenter' + eventNamespace, $.proxy(this, '_stop'))
                .bind('mouseleave' + eventNamespace, $.proxy(this, '_start'));
                
            this.autoScrollInitiated = true;
            
            return;
        },
        
        _unbindAutoScroll: function () {

            var eventNamespace = this.eventNamespace;
            
            this.element
                .unbind('mouseenter' + eventNamespace)
                .unbind('mouseleave' + eventNamespace);
                
            this.autoScrollInitiated = false;
            
            return;
        },
        
        _start: function () {
        
            var self = this;
            
            this._stop();
            
            this.interval = setInterval(function () {
                self.next();
            }, this.options.pause);
            
            return;
        },
        
        _stop: function () {
        
            clearInterval(this.interval);
            
            return;
        },
        
        _setOption: function (option, value) {
        
            _super._setOption.apply(this, arguments);

            if (option === 'autoScroll' || option === 'pause') {
                
                if (value) {
                    this._bindAutoScroll();
                    this._start();
                }
                else {
                    this._unbindAutoScroll();
                    this._stop();
                }

            }
            
            return;
        },
        
        destroy: function () {
            
            this._stop();
            _super.destroy.apply(this);
            
            return;
        }
        
    });
    
})(jQuery);