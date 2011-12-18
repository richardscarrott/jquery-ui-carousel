/*
 * jquery.rs.carousel-touch v0.8.6
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
 *  jquery.translate3d.js v0.1+ // if passing in translate3d true for hardware acceleration
 *  jquery.event.drag.js v2.1.0+
 *  jquery.ui.widget.js v1.8+
 *  jquery.rs.carousel.js v0.8.6+
 *
 */

(function ($) {

    var _super = $.Widget.prototype;
    
    // custom drag, if supported it uses 'translate3d' instead of 'left / top'
    // for hardware acceleration in iOS et al.
    $.widget('rs.draggable3d', {
    
        options: {
            axis: 'x',
            translate3d: false
        },
        
        _create: function () {

            var self = this;

            this.element
                .bind('dragstart', function (e) {
                    self._mouseStart(e);
                })
                .bind('drag', function (e) {
                    self._mouseDrag(e);
                })
                .bind('dragend', function (e) {
                    self._mouseStop(e);
                });
            
            return;
        },
        
        _getPosStr: function () {
            
            return this.options.axis === 'x' ? 'left' : 'top';
            
        },
        
        _mouseStart: function(e) {
            
            this.mouseStartPos = this.options.axis === 'x' ? e.pageX : e.pageY;
            
            if (this.options.translate3d) {
                this.runnerPos = this.element.css('translate3d')[this.options.axis];
            }
            else {
                this.runnerPos = parseInt(this.element.position()[this._getPosStr()], 10);
            }
            
            this._trigger('start', e);

            return;
        },
        
        _mouseDrag: function(e) {
        
            var page = this.options.axis === 'x' ? e.pageX : e.pageY,
                pos = (page - this.mouseStartPos) + this.runnerPos,
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
        
        _mouseStop: function (e) {
            
            this._trigger('stop', e);
            
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
            //this._mouseDestroy();
            _super.destroy.apply(this);
            
            return;
        }
        
    });
    
})(jQuery);



// touch extension
(function ($) {
    
    var _super = $.rs.carousel.prototype;
        
    $.widget('rs.carousel', $.rs.carousel, {
    
        options: {
            touch: false,
            translate3d: false,
            sensitivity: 0.8
        },
        
        _create: function () {
            
            _super._create.apply(this);
            
            var self = this;

            if (this.options.touch) {
                
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

            }
                
            // bind CSS transition callback
            if (this.options.translate3d) {
                this.elements.runner.bind('webkitTransitionEnd transitionend oTransitionEnd', function (e) {
                    self._trigger('after', null, {
                        elements: self.elements,
                        animate: animate
                    });
                    e.preventDefault(); // stops page from jumping to top...
                });
            }
            
            return;
        },
        
        _getAxis: function () {
            
            return this.isHorizontal ? 'x' : 'y';
        
        },
        
        _dragStartHandler: function (e) {
        
            // remove transition class to ensure drag doesn't transition
            if (this.options.translate3d) {
                this.elements.runner.removeClass(this.widgetBaseClass + '-runner-transition');
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
            
            if (speed > this.options.sensitivity || distance > (this._getItemDim() * this.getItemsPerTransition() / 2)) {
                if ((this.page === this.getNoOfPages() && direction === 'next')
                    || (this.page === 1 && direction === 'prev')) {
                    this.goToPage(this.page);
                }
                else {
                    this[direction]();
                }
            }
            else {
                this.goToPage(this.page); // go back to current page
            }
            
            return;
        },
        
        _getTime: function () {
            
            var date = new Date();
            return date.getTime();
        
        },
        
        // override _slide to work with tanslate3d - TODO: remove duplication
        _slide: function (animate) {

            var self = this,
                animate = animate === false ? false : true, // undefined should pass as true
                speed = animate ? this.options.speed : 0,
                animateProps = {},
                lastPos = this._getAbsoluteLastPos(),
                pos = this.elements.items
                    .eq(this.pages[this.page - 1] - 1) // arrays and .eq() are zero based, carousel is 1 based
                        .position()[this.helperStr.pos];

            // check pos doesn't go past last posible pos
            if (pos > lastPos) {
                pos = lastPos;
            }

            this._trigger('before', null, {
                elements: this.elements,
                animate: animate
            });
            
            if (this.options.translate3d) {
                
                this.elements.runner
                    .addClass(this.widgetBaseClass + '-runner-transition')
                    .css({
                        translate3d: this.isHorizontal ? {x: -pos} : {y: -pos}
                    });
                
            }
            else {
                
                animateProps[this.helperStr.pos] = -pos;
                animateProps.useTranslate3d = true; // what the hell is this...
                this.elements.runner
                    .stop()
                    .animate(animateProps, speed, this.options.easing, function () {
                        
                        self._trigger('after', null, {
                            elements: self.elements,
                            animate: animate
                        });

                    });
            }
                
            this._updateUi();
            
            return;
        },
        
        _setOption: function (option, value) {
        
            _super._setOption.apply(this, arguments);
            
            switch (option) {
                
            case 'orientation':
                this._switchAxis();
                break;
            }
            
            return;
        },
        
        _switchAxis: function () {
        
            this.elements.runner.draggable3d('option', 'axis', this._getAxis());
            
            return;
        },
        
        destroy: function () {
            
            this.elements.runner.draggable3d('destroy');
            _super.destroy.apply(this);
            
            return;
        }
        
    });

})(jQuery);