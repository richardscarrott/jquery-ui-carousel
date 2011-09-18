/*
 * jQuery UI Carousel Plugin v0.7.5 - Touch Extension
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
 *  jquery.ui.mouse.js v1.8+
 *  jquery.ui.touch-punch.js v0.1.0+ - at least until $.ui.mouse.js supports touch events (https://github.com/furf/jquery-ui-touch-punch)
 *  jquery.ui.carousel.js v0.7.5+
 *
 */
 
// CSS transform() hook currently just deals with webkit...
(function ($) {
	
	$.cssHooks.carouselTransform = {
		set: function(elem, value) {
			elem.style['-webkit-transform'] = value;
		},
		get: function (elem) {
			var value = elem.style['-webkit-transform'];
			if (value) {
				value = value.split('(')[1].split(',');  // a bit rubbish me thinks...
				return {
					x: parseInt(value[0]),
					y: parseInt(value[1])
				}
			}
		}
	};
	
})(jQuery);

// custom drag, if supported it uses 'translate3d' instead of 'left / top' for hardware acceleration
(function ($) {

	var _super = $.ui.mouse.prototype;
	
	$.widget('ui._carouselDrag', $.ui.mouse, {
	
		options: {
			axis: 'x',
			translate3d: false
		},
		
		_create: function () {
		
			var cssProps = {};
			
			if (this.options.translate3d) {
				this.element.css('carousel-transform', 'translate3d(0, 0, 0)');
			}
			else {
				cssProps[this._getPosStr()] = 0;
				this.element.css(cssProps);
			}
			
			this._mouseInit();
		
		},
		
		_getPosStr: function () {
			
			return this.options.axis === 'x' ? 'left' : 'top';
			
		},
		
		_mouseStart: function(e) {
			
			this.mouseStartPos = this.options.axis === 'x' ? e.pageX : e.pageY;
			
			if (this.options.translate3d) {
				this.runnerPos = this.element.css('carousel-transform')[this.options.axis];
			}
			else {
				this.runnerPos = parseInt(this.element.css(this._getPosStr()), 10);
			}
			
			this._trigger('start', e);
			
		},
		
		_mouseDrag: function(e) {
		
			var page = this.options.axis === 'x' ? e.pageX : e.pageY,
				pos = (page - this.mouseStartPos) + this.runnerPos,
				cssProps = {};
			
			if (this.options.translate3d) {
				cssProps['carousel-transform'] = this.options.axis === 'x' ? 'translate3d(' + pos + 'px, 0, 0)' : 'translate3d(0, ' + pos + 'px, 0)';
			}
			else {
				cssProps[this._getPosStr()] = pos;
			}
			
			this.element.css(cssProps);
		
		},
		
		_mouseStop: function (e) {
			
			this._trigger('stop', e);
			
		},
		
		destroy: function () {
		
			var cssProps = {};
			
			if (this.options.translate3d) {
				cssProps['carousel-transform'] = '';
			}
			else {
				cssProps[this._getPosStr()] = '';
			}
			
			this.element.css(cssProps);
			this._mouseDestroy();
			_super.destroy.apply(this);
			
		}
		
	});
	
})(jQuery);



// touch extension
(function ($) {
	
	var _super = $.ui.carousel.prototype;
		
	$.widget('ui.carousel', $.ui.carousel, {
	
		options: {
			sensitivity: 0.8,
			translate3d: false
		},
		
		_create: function () {
			
			_super._create.apply(this);
			
			var self = this;
			
			this.elements.runner
				._carouselDrag({
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
				
			// bind CSS transition callback
			if (this.options.translate3d) {
				this.elements.runner.bind('webkitTransitionEnd', function(e) {
					self._trigger('afterAnimate', e, self._getData());
					e.preventDefault(); // stops page from jumping to top...
				});
			}
			
		},
		
		_getAxis: function () {
			
			return this.isHorizontal ? 'x' : 'y';
		
		},
		
		_dragStartHandler: function (e) {
		
			// reset transition prop to ensure drag doesn't transition
			this.elements.runner.css({
				'-webkit-transition': 'none'
			});
		
			this.startTime = this._getTime();
			
			this.startPos = {
				x: e.pageX,
				y: e.pageY
			};
		
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
			
			if (speed > this.options.sensitivity || distance > (this.itemDim * this._getItemsPerTransition() / 2)) {
				this[direction]();
			}
			else {
				this.goToItem(this.itemIndex); // go to current element
			}
		
		},
		
		_getTime: function () {
			
			var date = new Date();
			return date.getTime();
		
		},
		
		// override _slide to work with tanslate3d
		_slide: function (animate) {
		
			var self = this,
				speed = animate === false ? 0 : this._getSpeed(), // default to animate
				animateProps = {},
				pos;
				
			pos = this._getPos();
			
			this._trigger('beforeAnimate', null, this._getData());
			
			if (this.options.translate3d) {
				
				this.elements.runner.css({
					'-webkit-transition': '-webkit-transform .' + speed + 's ' + this._getEasing(),
					'carousel-transform': this.isHorizontal ? 'translate3d(' + -pos + 'px, 0, 0)' : 'translate3d(0, ' + -pos + 'px, 0)'
				});
				
			}
			else {
				
				animateProps[this.helperStr.pos] = -pos;
				
				this.elements.runner
					.stop()
					.animate(animateProps, speed, this.options.easing, function () {

						self._trigger('afterAnimate', null, self._getData());

					});
			}
				
			this._updateUi();
		
		},
		
		// translates speed to ensure CSS transforms get type number
		_getSpeed: function () {
		
			if (!this.options.translate3d) {
				return this.options.speed;
			}
		
			var speed = this.options.speed,
				$speeds = $.fx.speeds;
			
			switch (speed) {
				
			case 'slow':
				speed = $speeds.slow;
				break;
			case 'normal':
				speed = $speeds._default;
				break;
			case 'fast':
				speed = $speeds.fast;
				break;
			}
			
			return speed;
			
		},
		
		// ensures easing is a valid css timing function name
		_getEasing: function () {
			
			if (!this.options.translate3d) {
				return this.options.easing;
			}
			
			var easing = this.options.easing,
				allowed = ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'];
			
			// default to ease
			if ($.inArray(easing, allowed) === -1) {
				easing = 'ease';
			}
			
			return easing;
		
		},
		
		_setOption: function (option, value) {
		
			_super._setOption.apply(this, arguments);
			
			switch (option) {
				
			case 'orientation':
				this._switchAxis();
				break;
			}
			
		},
		
		_switchAxis: function () {
		
			this.elements.runner._carouselDrag('option', 'axis', this._getAxis());
		
		},
		
		destroy: function () {
			
			this.elements.runner._carouselDrag('destroy');
			_super.destroy.apply(this);
			
		}
		
	});

})(jQuery);