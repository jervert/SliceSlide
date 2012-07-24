/*jQuery('<article></article>');
jQuery('<section></section>');
jQuery('<header></header>');
jQuery('<hgroup></hgroup>');
jQuery('<footer></footer>');
jQuery('<nav></nav>');*/


jQuery(document).ready(function () {
	// Some fixes for IE8 and earlier
	//jQuery('.slides-2 .slide:nth-child(even)').addClass('slide-even');
	
	// Languages
	/*var languageSetting = 'en';
	var languageValue = $('html').eq(0).attr('lang');
	if (languageValue) {
		languageSetting = languageValue;
	}*/
	
	/*var slideCultures = {
		
		'en': {
						'pause': 'Pause'
						,'resume': 'Resume'
						,'previous': 'Previous'
						,'next': 'Next'
						,'numberedListIntro': 'Go to:'
			
					}
		,'es': {
						'pause': 'Pausar'
						,'resume': 'Continuar'
						,'previous': 'Anterior'
						,'next': 'Siguiente'
						,'numberedListIntro': 'Ir a:'
			
					}
		
	}*/
	


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
			templatesCultureUrl: 'assets/templates_cultures_##CULTURE##.json',
			idSliceSlideTemplates: 'jquery-slice-slide-templates',
			slideTime: 3,
			culture: $('html').attr('lang') || 'en'
		},
		op = $.extend(true, {}, defaults, options),

		defaultFn = {
			culture: {},
			init: function (slidesBox, index) {
				var self = this,
					slides = slidesBox.find(op.slidesBoxSlide),
					idSlideBox = this.getSlidesBoxId(index);

				slidesBox.attr('id',idSlideBox);
				self.setSlides(slidesBox,slides,idSlideBox); // Activate initial slides, and hide all other
				
				self.controls(slidesBox,slides,idSlideBox); // Play-Pause and slide number controls
			},

			getSlidesBoxId: function (index) {
				var idSlideBox = op.prefixId + (index + 1);
				while ($('#' + idSlideBox).length) {
					index += 1;
					idSlideBox = op.prefixId + (index + 1);
				}
				return idSlideBox;
			},

			tmpl: function (id, context) {
				var html = $(id).html();
				return _.template(html, context);
			},

			setSlides: function (slidesBox,slides,idSlideBox) {
				var self = this;
				slides.each(function (index, slide) {
					$(slide).attr('id',idSlideBox+'-'+(index+1));
					if (op.translucentElement) {
						$(slide).append(self.tmpl(op.templatesTranslucent), {text: self.culture});
					}
				});
				self.initialSlides(slidesBox);
			},

			initialSlides: function (slidesBox) {
				var allSlides = slidesBox.find(op.slidesBoxSlide),
					initialSlides = allSlides.filter(':lt(' + op.numberSimultaneousSlides + ')'),
					notInitialSlides = allSlides.filter(':gt(' + (op.numberSimultaneousSlides - 1) + ')');
				initialSlides.addClass(op.classesActive);
				notInitialSlides.hide();
			},

			controls: function (slidesBox, slides, idSlideBox) {
				var self = this,
					pagesNumber = Math.ceil(slides.length / op.numberSimultaneousSlides);
				slidesBox.append(self.tmpl(op.templatesControls, {id: idSlideBox, slides: slides, pagesNumber: pagesNumber, numberSimultaneousSlides: op.numberSimultaneousSlides, text: self.culture}));
				self.startSlide(slidesBox);
			},

			getControls: function (slideControlsBox, controls) {
				return slideControlsBox.find(controls);
			},
			
			startSlide: function (slidesBox) {
				var self = this,
					interval,
					slideControlsBox = slidesBox.find(op.slidesBoxControls).first(),
					slideControls = self.getSlideControls(slideControlsBox),
					intervalTime = op.slideTime * 1000;
				
				interval = setInterval(function () {
					self.changeSlide(slideControlsBox, 1);
				}, intervalTime);
				
				self.eventControlsNextAndPrevious(slideControlsBox, interval, slideControls);
				self.eventControlsFixed(slideControlsBox, interval, slideControls);
				self.eventControlsPauseResume(slidesBox, interval, slideControls);			
			},

			getSlideControls: function (slideControlsBox) {
				var self = this;
				return {
					fixed: self.getControls(slideControlsBox, op.slidesBoxControlsFixed),
					previous: self.getControls(slideControlsBox, op.slidesBoxControlsPrev),
					next: self.getControls(slideControlsBox, op.slidesBoxControlsNext),
					pauseResume: self.getControls(slideControlsBox, op.slidesBoxControlsPauseResume)
				};
			},

			eventControlsNextAndPrevious: function (slideControlsBox, interval, slideControls) {
				var self = this;
				slideControls.previous.bind('click',function (event) {
					event.preventDefault();
					self.pauseSlide(interval, slideControls);
					self.changeSlide(slideControlsBox, -1);
				});
				slideControls.next.bind('click',function (event) {
					event.preventDefault();
					self.pauseSlide(interval, slideControls);
					self.changeSlide(slideControlsBox, 1);
				});
			},

			eventControlsFixed: function (slideControlsBox, interval, slideControls) {
				var self = this;
				slideControls.fixed.find('a, [role="link"]').on('click',function (event) {
					event.preventDefault();
					var newSelectedInFixed = $(this).closest(op.slidesBoxControlsFixed),
						selectedInFixed = newSelectedInFixed.siblings(op.slidesBoxSlideActive);
					self.pauseSlide(interval, slideControls);
					self.goToSlide($(this), $(this).attr(op.attrDestination), slideControlsBox, newSelectedInFixed, selectedInFixed);
				});
			},

			eventControlsPauseResume: function (slidesBox, interval, slideControls) {
				var self = this;
				slideControls.pauseResume.bind('click',function (event) {
					event.preventDefault();
					if (slideControls.pauseResume.find(op.slidesBoxControlsStatePlaying).length > 0) {
						self.pauseSlide(interval, slideControls);
					} else {
						slideControls.pauseResume.html(self.tmpl(op.templateControlsPlaying, {text: self.culture}));
						self.resumeSlide(slidesBox, slideControls);
					}
				});
			},

			resumeSlide: function (slidesBox, slideControls) {
				var self = this;
				slideControls.fixed.add(slideControls.pauseResume).add(slideControls.previous).add(slideControls.next).unbind('click');
				self.startSlide(slidesBox);
			},

			pauseSlide: function (interval, slideControls) {
				var self = this;
				clearInterval(interval);
				slideControls.pauseResume.html(self.tmpl(op.templateControlsPaused, {text: self.culture}));
			},

			changeSlide: function (slideControlsBox, direction) {
				var self = this,
					newSelectedInFixed,
					link,
					destination,
					selectedInFixed = slideControlsBox.find(op.slidesBoxSlideActive).first();
			
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
				self.goToSlide(link, destination, slideControlsBox, newSelectedInFixed, selectedInFixed);
			},

			goToSlide: function (link, destination, slideControlsBox, newSelectedInFixed, selectedInFixed) {
				selectedInFixed.removeClass(op.classesActive);
				newSelectedInFixed.addClass(op.classesActive);
				
				var self = this,
					activeSlides = $(destination).siblings(op.slidesBoxSlideActive);
				
				if ($(destination).is(':hidden')) {
					activeSlides.removeClass(op.classesActive).fadeOut(op.effectTime, function() {
						if (op.numberSimultaneousSlides > 1) {
							var nextDestination = $(destination).next(),
								i=1;
							while (i<op.numberSimultaneousSlides) {
								nextDestination.addClass(op.classesActive);
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