	

	var demo = {
			
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
			
			form = this.elements.form = this.elements.form = view.find('form');
			this.elements.inputs = form.find(':checkbox, select');
			this.elements.addItemsBtn = form.find('#addItemsBtn');
			this.elements.removeItemsBtn = form.find('#removeItemsBtn');
			this.elements.itemCount = form.find('#itemCount');
			this.elements.initBtn = form.find('#init');
			this.elements.destroyBtn = form.find('#destroy');
			
		
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
				
			});
			
			elems.addItemsBtn.click(function() {
				
				var currentNoOfItems = carousel.carousel('getNoOfItems'),
					noOfItems = parseInt(elems.form.find('#addItems').val(), 10),
					items = [],
					i,
					colorClass;
					
				for (i = 1; i <= noOfItems; i++) {
					
					colorClass = Math.floor(Math.random() * 7) + 1;
					items.push('<li class="rs-carousel-item color-' + colorClass + '">' + (currentNoOfItems + i) + '</li>');
					
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
				
				// css translate3d() support detection
				opts.translate3d = Modernizr && Modernizr.csstransforms3d;
				opts.touch = Modernizr && Modernizr.touch;
				
				carousel.carousel(opts);
			});
			
			elems.destroyBtn.click(function(e) {
				e.preventDefault();
				
				$('body').addClass('no-js');
				carousel.carousel('destroy');
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
			
		}
			
	};