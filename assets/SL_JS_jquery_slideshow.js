/*jQuery('<article></article>');
jQuery('<section></section>');
jQuery('<header></header>');
jQuery('<hgroup></hgroup>');
jQuery('<footer></footer>');
jQuery('<nav></nav>');*/


jQuery(document).ready(function () {
	// Some fixes for IE8 and earlier
	jQuery('.slice-slides-2 .slide:nth-child(even)').addClass('slide-even');

	// Slides!
	jQuery.fn.sliceSlide();

	// Slides!
	jQuery.fn.sliceSlide({
		slidesBox: '[data-slice-slide-box-twins]',
		templatesControls: '#slice-slide-controls-only-text',
		numberSimultaneousSlides: 2
	});
	
});



(function($){
	$.fn.sliceSlide = function (options, extendedFn) {
		_.templateSettings = {
			interpolate: /\{\{(.+?)\}\}/g,
			evaluate: /\[\[(.+?)\]\]/g
		};
		var fnBase, defaults = {
			slidesBox: '[data-slice-slide-box]',
			slidesBoxSlide: '[data-slice-slide]',
			slidesBoxSlideActive: '.slice-slide-active',
			slidesBoxControls: '[data-slice-slide-controls]',
			slidesBoxControlsFixed: '[data-slice-slide-controls-fixed]',
			slidesBoxControlsNext: '[data-slice-slide-controls-next]',
			slidesBoxControlsPrev: '[data-slice-slide-controls-prev]',
			slidesBoxControlsPauseResume: '[data-slice-slide-controls-pause-resume]',
			slidesBoxControlsStatePlaying: '[data-slice-slide-playing]',

			templatesTranslucent: '#slice-slide-translucent',
			templatesControls: '#slice-slide-controls',
			templateControlsPlaying: '#slice-slide-controls-playing',
			templateControlsPaused: '#slice-slide-controls-paused',

			classesActive: 'slice-slide-active',
			attrDestination: 'data-slice-slide-destination',
			translucentElement: true,

			prefixId: 'jquery-slice-slide-',
			numberSimultaneousSlides: 1,
			effectTime: 150,
			templatesUrl: 'assets/templates.html',
			templatesCultureUrl: 'assets/cultures/templates_cultures_##CULTURE##.json',
			idSliceSlideTemplates: 'jquery-slice-slide-templates',
			slideTime: 3,
			culture: $('html').attr('lang') || 'en'
		},
		op = $.extend(true, {}, defaults, options),

		defaultFn = {
			culture: {},
			el: {},
			init: function () {
				var self = this;
				self.el.slides = self.el.slidesBox.find(op.slidesBoxSlide);
				self.el.idSlideBox = this.getSlidesBoxId();
				self.el.slidesBox.attr('id', self.el.idSlideBox);
				self.ariaSlideBox();
				self.ariaSlides();
				self.setSlides(); // Activate initial slides, and hide all other
				self.controls(); // Play-Pause and slide number controls
			},

			ariaSlideBox: function () {
				var self = this;
				self.el.slidesBox.is('[role="listbox"]') || self.el.slidesBox.attr('role', 'listbox');
			},
			ariaSlides: function () {
				var self = this;
				$.each(self.el.slides, function (index, slideObject) {
					var slide = $(slideObject)
					slide.is('[tabindex="0"]') || slide.attr('tabindex', '0');
					slide.is('[role="option"]') || slide.attr('role', 'option');
				});
			},

			getSlidesBoxId: function () {
				var self = this,
					idSlideBox = op.prefixId + (self.el.slidesBoxIndex + 1);
				while ($('#' + idSlideBox).length) {
					self.el.slidesBoxIndex += 1;
					idSlideBox = op.prefixId + (self.el.slidesBoxIndex + 1);
				}
				return idSlideBox;
			},

			tmpl: function (id, context) {
				var html = $(id).html();
				return _.template(html, context);
			},

			setSlides: function () {
				var self = this;
				self.el.slides.each(function (index, slide) {
					$(slide).attr('id', self.el.idSlideBox+'-'+(index+1));
					if (op.translucentElement) {
						$(slide).append(self.tmpl(op.templatesTranslucent), {text: self.culture});
					}
				});
				self.initialSlides();
			},

			initialSlides: function () {
				var self = this,
					allSlides = self.el.slidesBox.find(op.slidesBoxSlide),
					initialSlides = allSlides.filter(':lt(' + op.numberSimultaneousSlides + ')'),
					notInitialSlides = allSlides.filter(':gt(' + (op.numberSimultaneousSlides - 1) + ')');
				initialSlides.addClass(op.classesActive);
				notInitialSlides.hide();
			},

			controls: function () {
				var self = this,
					pagesNumber = Math.ceil(self.el.slides.length / op.numberSimultaneousSlides);
				self.el.slidesBox.append(self.tmpl(op.templatesControls, {id: self.el.idSlideBox, slides: self.el.slides, pagesNumber: pagesNumber, numberSimultaneousSlides: op.numberSimultaneousSlides, text: self.culture}));
				self.startSlide();
			},

			getControls: function (controls) {
				var self = this;
				return self.el.slideControlsBox.find(controls);
			},
			
			startSlide: function () {
				var self = this;
				self.el.slideControlsBox = self.el.slidesBox.find(op.slidesBoxControls).first();
				self.el.slideControls = self.getSlideControls();
	
				self.eventControlsNextAndPrevious();
				self.eventControlsFixed();
				self.eventControlsPauseResume();	

				self.startInterval();		
			},

			startInterval: function () {
				var self = this;
				self.el.interval = setInterval(function () {
					self.changeSlide(1);
				}, self.el.intervalTime);
			},

			getSlideControls: function () {
				var self = this;
				return {
					fixed: self.getControls(op.slidesBoxControlsFixed),
					previous: self.getControls(op.slidesBoxControlsPrev),
					next: self.getControls(op.slidesBoxControlsNext),
					pauseResume: self.getControls(op.slidesBoxControlsPauseResume)
				};
			},

			eventControlsNextAndPrevious: function () {
				var self = this;
				self.el.slideControls.previous.bind('click',function (event) {
					event.preventDefault();
					self.pauseSlide();
					self.changeSlide(-1);
				});
				self.el.slideControls.next.bind('click',function (event) {
					event.preventDefault();
					self.pauseSlide();
					self.changeSlide(1);
				});
			},

			eventControlsFixed: function () {
				var self = this;
				self.el.slideControls.fixed.find('a, [role="link"]').on('click',function (event) {
					event.preventDefault();
					var newSelectedInFixed = $(this).closest(op.slidesBoxControlsFixed),
						selectedInFixed = newSelectedInFixed.siblings(op.slidesBoxSlideActive);
					self.pauseSlide();
					self.goToSlide($(this), $(this).attr(op.attrDestination), newSelectedInFixed, selectedInFixed);
				});
			},

			eventControlsPauseResume: function () {
				var self = this;
				self.el.slideControls.pauseResume.bind('click',function (event) {
					event.preventDefault();
					if (self.el.slideControls.pauseResume.find(op.slidesBoxControlsStatePlaying).length > 0) {
						self.pauseSlide();
					} else {
						self.el.slideControls.pauseResume.html(self.tmpl(op.templateControlsPlaying, {text: self.culture}));
						self.resumeSlide();
					}
				});
			},

			resumeSlide: function () {
				var self = this;
				self.startInterval();
			},

			pauseSlide: function () {
				var self = this;
				clearInterval(self.el.interval);
				self.el.slideControls.pauseResume.html(self.tmpl(op.templateControlsPaused, {text: self.culture}));
			},

			changeSlide: function (direction) {
				var self = this,
					newSelectedInFixed,
					link,
					destination,
					selectedInFixed = self.el.slideControlsBox.find(op.slidesBoxSlideActive).first();
			
				if (direction > 0) {
					if (selectedInFixed.is(':last-child')) {
						newSelectedInFixed = selectedInFixed.siblings().first();
					} else {
						newSelectedInFixed = selectedInFixed.next();
					}
				} else {
					if (selectedInFixed.is(':first-child')) {
						newSelectedInFixed = selectedInFixed.siblings().last();
					} else {
						newSelectedInFixed = selectedInFixed.prev();
					}
				}
			
				link = newSelectedInFixed.find('a, [role="link"]').first();
				destination = link.attr(op.attrDestination);
				self.goToSlide(link, destination, newSelectedInFixed, selectedInFixed);
			},

			goToSlide: function (link, destination, newSelectedInFixed, selectedInFixed) {
				selectedInFixed.removeClass(op.classesActive);
				newSelectedInFixed.addClass(op.classesActive);
				
				var self = this,
					activeSlides = $(destination).siblings(op.slidesBoxSlideActive);
				
				if ($(destination).is(':hidden')) {
					activeSlides.removeClass(op.classesActive).removeAttr('aria-selected').fadeOut(op.effectTime, function() {
						if (op.numberSimultaneousSlides > 1) {
							var nextDestination = $(destination).next(),
								i=1;
							while (i<op.numberSimultaneousSlides) {
								nextDestination.addClass(op.classesActive).attr('aria-selected', true);
								nextDestination = nextDestination.next();
								i += 1;
							}
						}

						$(destination).addClass(op.classesActive).add($(destination).siblings(op.slidesBoxSlideActive)).fadeIn(op.effectTime);
					});
				}
				
			}
		},
		cultureContent;

		fnBase = $.extend(true, {}, defaultFn, extendedFn);

		function initSliceSlides (cultureContent) {
			$(op.slidesBox).each(function (index) {
				var fn = $.extend(true, {}, fnBase);
				fn.culture = cultureContent;
				fn.el = $.extend({}, {
					slidesBox: $(this),
					slidesBoxIndex: index,
					intervalTime: op.slideTime * 1000
				});
				fn.init($(this), index);
			});
		}

		if ($('#' + op.idSliceSlideTemplates).length === 0) {
			$.get(op.templatesUrl, function (data) {
				$('body').append('<div id="' + op.idSliceSlideTemplates + '">' + data + '</div>');
				$.getJSON(op.templatesCultureUrl.replace('##CULTURE##', op.culture), function (json) {
					cultureContent = json;
					initSliceSlides(cultureContent);
				});
			});
		} else {
			initSliceSlides(cultureContent);
		}
	};
}(jQuery));