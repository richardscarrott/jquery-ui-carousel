	
	var demo = {

		settings: {
			minItemWidth: 50, // when variable widths are applied
			variableItemWidth: false
		},
			
		init: function(view) {
		
			this.view = view;
			this.elements();
			this.events();
			
			this.elements.initBtn.click();
			this.updateItemCount();
		
		},
		
		elements: function() {
		
			var view = this.view,
				form;
				
			this.elements = {};
		
			this.elements.carousel = view.find('#rs-carousel');
			
			form = this.elements.form = view.find('form');
			this.elements.inputs = form.find(':checkbox, select');
			this.elements.addItemsBtn = form.find('#addItemsBtn');
			this.elements.removeItemsBtn = form.find('#removeItemsBtn');
			this.elements.itemCount = form.find('#itemCount');
			this.elements.initBtn = form.find('#init');
			this.elements.destroyBtn = form.find('#destroy');
			this.elements.variableWidthBtn = form.find('#toggleVariableWidth');
			
		
		},
		
		events: function() {
		
			var self = this,
				elems = this.elements,
				carousel = elems.carousel;
				
			elems.inputs.change(function() {
				
				var input = $(this),
					option = this.name;
					
				value = self.getValueAsOption(input);
				
				carousel.carousel('option', option, value);

				// there's no orientation change event, prob wouldn't be worth including but this means
				// the variable widths will only update when actually 'clicking' on this button
				if ($(this).is('#orientation')) {
					self.updateItemWidths();
				}
				
			});
			
			elems.addItemsBtn.click(function() {
				
				var currentNoOfItems = carousel.carousel('getNoOfItems'),
					noOfItems = parseInt(elems.form.find('#addItems').val(), 10),
					items = [],
					i,
					colorClass,
					heightOrWidth = self.elements.carousel.hasClass('rs-carousel-horizontal') ? 'width' : 'height';
					
				for (i = 1; i <= noOfItems; i++) {
					
					colorClass = Math.floor(Math.random() * 7) + 1;
					if (self.settings.variableItemWidth) {
						items.push('<li style="' + heightOrWidth + ': ' + self.getRandomWidth() + 'px" class="rs-carousel-item color-' + colorClass + '">' + (currentNoOfItems + i) + '</li>');
					}
					else {
						items.push('<li class="rs-carousel-item color-' + colorClass + '">' + (currentNoOfItems + i) + '</li>');
					}
					
				}
				
				self.elements.carousel.carousel('add', items.join(''));
				self.updateItemCount();
				
				return false;
				
			});

			elems.removeItemsBtn.click(function () {

				var currentNoOfItems = carousel.carousel('getNoOfItems'),
					noOfItems = parseInt(elems.form.find('#removeItems').val(), 10),
					index = currentNoOfItems - noOfItems;

					if (index < 0) {
						index = 0;
					}
				
				self.elements.carousel.carousel('remove', ':eq(' + index + '), :gt(' + index + ')');
				self.updateItemCount();

				return false;
			});
			
			// carousel is initiated here
			elems.initBtn.click(function(e) {
				e.preventDefault();
				
				// get form values
				
				var opts = {};
				
				elems.inputs.each(function() {
					
					opts[this.name] = self.getValueAsOption($(this));
					
				});
				
				opts.translate3d = Modernizr && Modernizr.csstransforms3d;
				opts.touch = true; // Modernizr && Modernizr.touch;
				
				carousel.carousel(opts);
			});
			
			elems.destroyBtn.click(function(e) {
				e.preventDefault();
				
				$('body').addClass('no-js');
				self.settings.variableItemWidth = false;
				self.updateItemWidths();
				carousel.carousel('destroy');
			});

			elems.variableWidthBtn.click(function (e) {
				e.preventDefault();
				self.settings.variableItemWidth = self.settings.variableItemWidth ? false : true;
				self.updateItemWidths();
			});

			$(window).resize(function () {
				elems.carousel.carousel('refresh');
			});

		},

		updateItemCount: function () {
			
			// perhaps make getItemCount as a public method..?
			this.elements.itemCount.find('.count').text(this.elements.carousel.carousel('getNoOfItems'));

			return;
		},
		
		// ensures option are correct type (not always string)
		getValueAsOption: function(input) {
		
			var value,
				integer;
			
			if (input.is(':checkbox')) {
				if (input.is(':checked')) {
					value = true;
				}
				else {
					value = false;
				}
			}
			else {
				value = input[0].value;
			}
			
			// ensure numbers are of type number
			integer = parseInt(value, 10);
			if (!isNaN(integer)) {
				value = integer;
			}
			
			return value;
			
		},

		updateItemWidths: function () {

			var self = this,
				heightOrWidth = this.elements.carousel.hasClass('rs-carousel-horizontal') ? 'width' : 'height';

			this.elements.carousel
				.find('.rs-carousel-item')
					.width('')
					.height('')
					[heightOrWidth](function () {
						if (self.settings.variableItemWidth) {
							return self.getRandomWidth();
						}
					})
					.end()
				.carousel('refresh');

			return;
		},

		getRandomWidth: function () {

			var heightOrWidth = this.elements.carousel.hasClass('rs-carousel-horizontal') ? 'width' : 'height',
				maxWidth = this.elements.carousel.find('.rs-carousel-mask')[heightOrWidth]() / 2;

			return this.settings.minItemWidth + (Math.floor(Math.random() * maxWidth));
		}
			
	};