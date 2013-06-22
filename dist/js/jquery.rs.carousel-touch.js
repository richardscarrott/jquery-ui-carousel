/*global jQuery */
/*jshint bitwise: true, camelcase: true, curly: true, eqeqeq: true, forin: true,
immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: single,
undef: true, unused: true, strict: true, trailing: true, browser: true */

/*
 * jquery.rs.carousel-touch 1.0.2
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
 *  jquery.translate3d.js v0.2+ // if passing in translate3d true for hardware acceleration
 *  jquery.event.drag.js v2.3+ // https://github.com/richardscarrott/jquery.threedubmedia/
 *  jquery.ui.widget.js v1.8+
 *  jquery.rs.carousel.js v0.11.1+
 */

(function ($) {

    'use strict';

    var _super = $.Widget.prototype;
    
    // custom drag, if supported it uses 'translate3d' instead of 'left / top'
    // for hardware acceleration in iOS et al.
    $.widget('rs.draggable3d', {
    
        options: {
            axis: 'x',
            translate3d: false
        },
        
        _create: function () {

            this.eventNamespace = this.eventNamespace || '.' + this.widgetName;
            this._bindDragEvents();
            
            return;
        },

        _bindDragEvents: function () {

            var self = this,
                eventNamespace = this.eventNamespace;

            this.element
                .unbind(eventNamespace)
                .bind('dragstart' + eventNamespace, {
                    axis: this.options.axis
                }, function (e) {
                    self._start(e);
                })
                .bind('drag' + eventNamespace, function (e) {
                    self._drag(e);
                })
                .bind('dragend' + eventNamespace, function (e) {
                    self._end(e);
                });

            return;
        },
        
        _getPosStr: function () {
            
            return this.options.axis === 'x' ? 'left' : 'top';
            
        },
        
        _start: function (e) {
            
            this.mouseStartPos = this.options.axis === 'x' ? e.pageX : e.pageY;
            
            if (this.options.translate3d) {
                this.elPos = this.element.css('translate3d')[this.options.axis];
            }
            else {
                this.elPos = parseInt(this.element.position()[this._getPosStr()], 10);
            }
            
            this._trigger('start', e);

            return;
        },
        
        _drag: function (e) {
        
            var page = this.options.axis === 'x' ? e.pageX : e.pageY,
                pos = (page - this.mouseStartPos) + this.elPos,
                cssProps = {};
            
            if (this.options.translate3d) {
                cssProps.translate3d = this.options.axis === 'x' ? {x: pos} : {y: pos};
            }
            else {
                cssProps[this._getPosStr()] = pos;
            }
            
            this.element.css(cssProps);
            
            return;
        },
        
        _end: function (e) {
            
            this._trigger('stop', e);
            
            return;
        },

        _setOption: function (option) {
        
            _super._setOption.apply(this, arguments);
            
            if (option === 'axis') {
                this._bindDragEvents();
            }
            
            return;
        },
        
        destroy: function () {
        
            var cssProps = {};
            
            if (this.options.translate3d) {
                cssProps.translate3d = {};
            }
            else {
                cssProps[this._getPosStr()] = '';
            }
            
            this.element.css(cssProps);

            _super.destroy.apply(this);
            
            return;
        }
        
    });
    
})(jQuery);



// touch extension
(function ($) {
    
    'use strict';

    var _super = $.rs.carousel.prototype;
        
    $.widget('rs.carousel', $.rs.carousel, {
    
        options: {
            touch: false,
            sensitivity: 1
        },
        
        _create: function () {
            
            _super._create.apply(this);

            this._initDrag();
            
            return;
        },

        _initDrag: function () {

            var self = this;

            this.elements.runner
                .draggable3d({
                    translate3d: this.options.translate3d,
                    axis: this._getAxis(),
                    start: function (e) {
                        e = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
                        self._dragStartHandler(e);
                    },
                    stop: function (e) {
                        e = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
                        self._dragStopHandler(e);
                    }
                });

            return;
        },

        _destroyDrag: function () {

            this.elements.runner
                .draggable3d('destroy');

            // go back to page as destroying draggable3d removes elements position
            this.goToPage(this.index, false, undefined, true);

            return;
        },
        
        _getAxis: function () {
            
            return this.isHorizontal ? 'x' : 'y';
        
        },
        
        _dragStartHandler: function (e) {
        
            // remove transition class to ensure drag doesn't transition
            if (this.options.translate3d) {
                this.elements.runner
                    .removeClass(this.widgetFullName + '-runner-transition');
            }
        
            this.startTime = this._getTime();
            
            this.startPos = {
                x: e.pageX,
                y: e.pageY
            };
            
            return;
        },
        
        _dragStopHandler: function (e) {
        
            var time,
                distance,
                speed,
                direction,
                axis = this._getAxis();
                
            // if touch direction changes start date should prob be reset to correctly determine speed...
            this.endTime = this._getTime();
            
            time = this.endTime - this.startTime;
            
            this.endPos = {
                x: e.pageX,
                y: e.pageY
            };
            
            distance = Math.abs(this.startPos[axis] - this.endPos[axis]);
            speed = distance / time;
            direction = this.startPos[axis] > this.endPos[axis] ? 'next' : 'prev';

            if (speed > this.options.sensitivity || distance > this._getMaskDim() / 2) {
                if ((this.index === this.getNoOfPages() - 1 && direction === 'next') || (this.index === 0 && direction === 'prev')) {
                    this.goToPage(this.index);
                }
                else {
                    this[direction]();
                }
            }
            else {
                this.goToPage(this.index); // go back to current page
            }
            
            return;
        },
        
        _getTime: function () {
            
            var date = new Date();
            return date.getTime();
        
        },
        
        _setOption: function (option, value) {
        
            _super._setOption.apply(this, arguments);
            
            switch (option) {
                
            case 'orientation':

                this._switchAxis();

                break;

            case 'touch':
                
                if (value) {
                    this._initDrag();
                }
                else {
                    this._destroyDrag();
                }

                break;
            }
            
            return;
        },
        
        _switchAxis: function () {
        
            this.elements.runner
                .draggable3d('option', 'axis', this._getAxis());
            
            return;
        },
        
        destroy: function () {
            
            this._destroyDrag();
            _super.destroy.apply(this);
            
            return;
        }
        
    });

})(jQuery);