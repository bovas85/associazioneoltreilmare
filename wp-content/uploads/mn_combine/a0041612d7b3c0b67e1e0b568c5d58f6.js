/*nectar_prettyPhoto, isotope, superfish, nectarFrontend, infinite_scroll, flickity*/

/* ------------------------------------------------------------------------
	Class: prettyPhoto
	Use: Lightbox clone for jQuery
	Author: Stephane Caron (http://www.no-margin-for-errors.com)
	Version: 3.1.6
------------------------------------------------------------------------- */
(function($) {
	$.prettyPhoto = {version: '3.1.6'};
	
	$.fn.prettyPhoto = function(pp_settings) {
		pp_settings = jQuery.extend({
			hook: 'rel', /* the attribute tag to use for prettyPhoto hooks. default: 'rel'. For HTML5, use "data-rel" or similar. */
			animation_speed: 'normal', /* fast/slow/normal */
			ajaxcallback: function() {},
			slideshow: 5000, /* false OR interval time in ms */
			autoplay_slideshow: false, /* true/false */
			opacity: 0.80, /* Value between 0 and 1 */
			show_title: true, /* true/false */
			allow_resize: true, /* Resize the photos bigger than viewport. true/false */
			allow_expand: true, /* Allow the user to expand a resized image. true/false */
			default_width: 1024,
			default_height: 576,
			counter_separator_label: '/', /* The separator for the gallery counter 1 "of" 2 */
			theme: 'pp_default', /* light_rounded / dark_rounded / light_square / dark_square / facebook */
			horizontal_padding: 20, /* The padding on each side of the picture */
			hideflash: false, /* Hides all the flash object on a page, set to TRUE if flash appears over prettyPhoto */
			wmode: 'opaque', /* Set the flash wmode attribute */
			autoplay: true, /* Automatically start videos: True/False */
			modal: false, /* If set to true, only the close button will close the window */
			deeplinking: true, /* Allow prettyPhoto to update the url to enable deeplinking. */
			overlay_gallery: true, /* If set to true, a gallery will overlay the fullscreen image on mouse over */
			overlay_gallery_max: 30, /* Maximum number of pictures in the overlay gallery */
			keyboard_shortcuts: true, /* Set to false if you open forms inside prettyPhoto */
			changepicturecallback: function(){}, /* Called everytime an item is shown/changed */
			callback: function(){}, /* Called when prettyPhoto is closed */
			ie6_fallback: true,
			markup: '<div class="pp_pic_holder"> \
						<div class="ppt">&nbsp;</div> \
						<div class="pp_top"> \
							<div class="pp_left"></div> \
							<div class="pp_middle"></div> \
							<div class="pp_right"></div> \
						</div> \
						<div class="pp_content_container"> \
							<div class="pp_left"> \
							<div class="pp_right"> \
								<div class="pp_content"> \
									<div class="pp_loaderIcon"></div> \
									<div class="pp_fade"> \
										<a href="#" class="pp_expand" title="Expand the image">Expand</a> \
										<div class="pp_hoverContainer"> \
											<a class="pp_next" href="#">next</a> \
											<a class="pp_previous" href="#">previous</a> \
										</div> \
										<div id="pp_full_res"></div> \
										<div class="pp_details"> \
											<div class="pp_nav"> \
												<a href="#" class="pp_arrow_previous">Previous</a> \
												<p class="currentTextHolder">0/0</p> \
												<a href="#" class="pp_arrow_next">Next</a> \
											</div> \
											<p class="pp_description"></p> \
											<div class="pp_social">{pp_social}</div> \
											<a class="pp_close" href="#">Close</a> \
										</div> \
									</div> \
								</div> \
							</div> \
							</div> \
						</div> \
						<div class="pp_bottom"> \
							<div class="pp_left"></div> \
							<div class="pp_middle"></div> \
							<div class="pp_right"></div> \
						</div> \
					</div> \
					<div class="pp_overlay"></div>',
			gallery_markup: '<div class="pp_gallery"> \
								<a href="#" class="pp_arrow_previous">Previous</a> \
								<div> \
									<ul> \
										{gallery} \
									</ul> \
								</div> \
								<a href="#" class="pp_arrow_next">Next</a> \
							</div>',
			image_markup: '<img id="fullResImage" src="{path}" />',
			flash_markup: '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',
			quicktime_markup: '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',
			iframe_markup: '<iframe src ="{path}" width="{width}" height="{height}" onload="setTimeout(resizeIframe);" frameborder="no" allowfullscreen></iframe>',
			inline_markup: '<div class="pp_inline">{content}</div>',
			custom_markup: '',
			social_tools: '<div class="twitter"><a href="http://twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></div><div class="facebook"><iframe src="//www.facebook.com/plugins/like.php?locale=en_US&href={location_href}&amp;layout=button_count&amp;show_faces=true&amp;width=500&amp;action=like&amp;font&amp;colorscheme=light&amp;height=23" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:500px; height:23px;" allowTransparency="true"></iframe></div>' /* html or false to disable */
		}, pp_settings);
		
		// Global variables accessible only by prettyPhoto
		var matchedObjects = this, percentBased = false, pp_dimensions, pp_open,
		
		// prettyPhoto container specific
		pp_contentHeight, pp_contentWidth, pp_containerHeight, pp_containerWidth,
		
		// Window size
		windowHeight = $(window).height(), windowWidth = $(window).width(),

		// Global elements
		pp_slideshow;
		
		doresize = true, scroll_pos = _get_scroll();
	
		// Window/Keyboard events
		$(window).unbind('resize.prettyphoto').bind('resize.prettyphoto',function(){ _center_overlay(); _resize_overlay(); });
		
		if(pp_settings.keyboard_shortcuts) {
			$(document).unbind('keydown.prettyphoto').bind('keydown.prettyphoto',function(e){
				if(typeof $pp_pic_holder != 'undefined'){
					if($pp_pic_holder.is(':visible')){
						switch(e.keyCode){
							case 37:
								$.prettyPhoto.changePage('previous');
								e.preventDefault();
								break;
							case 39:
								$.prettyPhoto.changePage('next');
								e.preventDefault();
								break;
							case 27:
								if(!settings.modal)
								$.prettyPhoto.close();
								e.preventDefault();
								break;
						};
						// return false;
					};
				};
			});
		};
		
		/**
		* Initialize prettyPhoto.
		*/
		$.prettyPhoto.initialize = function() {
			
			settings = pp_settings;
			
			if(settings.theme == 'pp_default') settings.horizontal_padding = 16;
			
			// Find out if the picture is part of a set
			theRel = $(this).attr(settings.hook);
			galleryRegExp = /\[(?:.*)\]/;
			isSet = (galleryRegExp.exec(theRel)) ? true : false;
			
			// Put the SRCs, TITLEs, ALTs into an array.
			pp_images = (isSet) ? jQuery.map(matchedObjects, function(n, i){ if($(n).attr(settings.hook).indexOf(theRel) != -1) return $(n).attr('href'); }) : $.makeArray($(this).attr('href'));
			pp_titles = (isSet) ? jQuery.map(matchedObjects, function(n, i){ if($(n).attr(settings.hook).indexOf(theRel) != -1) return ($(n).find('img').attr('alt')) ? $(n).find('img').attr('alt') : ""; }) : $.makeArray($(this).find('img').attr('alt'));
			pp_descriptions = (isSet) ? jQuery.map(matchedObjects, function(n, i){ if($(n).attr(settings.hook).indexOf(theRel) != -1) return ($(n).attr('title')) ? $(n).attr('title') : ""; }) : $.makeArray($(this).attr('title'));
			
			if(pp_images.length > settings.overlay_gallery_max) settings.overlay_gallery = false;
			
			set_position = jQuery.inArray($(this).attr('href'), pp_images); // Define where in the array the clicked item is positionned
			rel_index = (isSet) ? set_position : $("a["+settings.hook+"^='"+theRel+"']").index($(this));
			
			_build_overlay(this); // Build the overlay {this} being the caller
			
			if(settings.allow_resize)
				//$(window).bind('scroll.prettyphoto',function(){ _center_overlay(); });
			
			
			$.prettyPhoto.open();
			
			return false;
		}


		/**
		* Opens the prettyPhoto modal box.
		* @param image {String,Array} Full path to the image to be open, can also be an array containing full images paths.
		* @param title {String,Array} The title to be displayed with the picture, can also be an array containing all the titles.
		* @param description {String,Array} The description to be displayed with the picture, can also be an array containing all the descriptions.
		*/
		$.prettyPhoto.open = function(event) {
			if(typeof settings == "undefined"){ // Means it's an API call, need to manually get the settings and set the variables
				settings = pp_settings;
				pp_images = $.makeArray(arguments[0]);
				pp_titles = (arguments[1]) ? $.makeArray(arguments[1]) : $.makeArray("");
				pp_descriptions = (arguments[2]) ? $.makeArray(arguments[2]) : $.makeArray("");
				isSet = (pp_images.length > 1) ? true : false;
				set_position = (arguments[3])? arguments[3]: 0;
				_build_overlay(event.target); // Build the overlay {this} being the caller
			}
			
			if(settings.hideflash) $('object,embed,iframe[src*=youtube],iframe[src*=vimeo]').css('visibility','hidden'); // Hide the flash

			_checkPosition($(pp_images).size()); // Hide the next/previous links if on first or last images.
		
			$('.pp_loaderIcon').fadeIn(600);
		
			if(settings.deeplinking)
				setHashtag();
		
			// Rebuild Facebook Like Button with updated href
			if(settings.social_tools){
				facebook_like_link = settings.social_tools.replace('{location_href}', encodeURIComponent(location.href)); 
				$pp_pic_holder.find('.pp_social').html(facebook_like_link);
			}
			
			// Fade the content in
			if($ppt.is(':hidden')) $ppt.css('opacity',0).show();
			$pp_overlay.css('opacity',0.85);

			// Display the current position
			$pp_pic_holder.find('.currentTextHolder').text((set_position+1) + settings.counter_separator_label + $(pp_images).size());

			// Set the description
			if(typeof pp_descriptions[set_position] != 'undefined' && pp_descriptions[set_position] != ""){
				$pp_pic_holder.find('.pp_description').show().html(unescape(pp_descriptions[set_position]));
			}else{
				$pp_pic_holder.find('.pp_description').hide();
			}
			
			// Get the dimensions
			movie_width = ( parseFloat(getParam('width',pp_images[set_position])) ) ? getParam('width',pp_images[set_position]) : settings.default_width.toString();
			movie_height = ( parseFloat(getParam('height',pp_images[set_position])) ) ? getParam('height',pp_images[set_position]) : settings.default_height.toString();
			
			// If the size is % based, calculate according to window dimensions
			percentBased=false;
			if(movie_height.indexOf('%') != -1) { movie_height = parseFloat(($(window).height() * parseFloat(movie_height) / 100) - 150); percentBased = true; }
			if(movie_width.indexOf('%') != -1) { movie_width = parseFloat(($(window).width() * parseFloat(movie_width) / 100) - 150); percentBased = true; }
			
			// Fade the holder
			$pp_pic_holder.fadeIn(function(){
				// Set the title
				(settings.show_title && pp_titles[set_position] != "" && typeof pp_titles[set_position] != "undefined") ? $ppt.html(unescape(pp_titles[set_position])) : $ppt.html('&nbsp;');
				
				imgPreloader = "";
				skipInjection = false;
				
				// Inject the proper content
				switch(_getFileType(pp_images[set_position])){
					case 'image':
						imgPreloader = new Image();

						// Preload the neighbour images
						nextImage = new Image();
						if(isSet && set_position < $(pp_images).size() -1) nextImage.src = pp_images[set_position + 1];
						prevImage = new Image();
						if(isSet && pp_images[set_position - 1]) prevImage.src = pp_images[set_position - 1];

						$pp_pic_holder.find('#pp_full_res')[0].innerHTML = settings.image_markup.replace(/{path}/g,pp_images[set_position]);

						imgPreloader.onload = function(){
							// Fit item to viewport
							pp_dimensions = _fitToViewport(imgPreloader.width,imgPreloader.height);

							_showContent();
						};

						imgPreloader.onerror = function(){
							alert('Image cannot be loaded. Make sure the path is correct and image exist.');
							$.prettyPhoto.close();
						};
					
						imgPreloader.src = pp_images[set_position];
					break;
				
					case 'youtube':
						pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
						
						// Regular youtube link
						movie_id = getParam('v',pp_images[set_position]);
						
						// youtu.be link
						if(movie_id == ""){
							movie_id = pp_images[set_position].split('youtu.be/');
							movie_id = movie_id[1];
							if(movie_id.indexOf('?') > 0)
								movie_id = movie_id.substr(0,movie_id.indexOf('?')); // Strip anything after the ?

							if(movie_id.indexOf('&') > 0)
								movie_id = movie_id.substr(0,movie_id.indexOf('&')); // Strip anything after the &
						}

						movie = 'http://www.youtube.com/embed/'+movie_id;
						(getParam('rel',pp_images[set_position])) ? movie+="?rel="+getParam('rel',pp_images[set_position]) : movie+="?rel=1";
							
						if(settings.autoplay) movie += "&autoplay=1";
					
						toInject = settings.iframe_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,movie);
					break;
				
					case 'vimeo':
						pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
					
						movie_id = pp_images[set_position];
						var regExp = /http(s?):\/\/(www\.)?vimeo.com\/(\d+)/;
						var match = movie_id.match(regExp);
						
						movie = 'http://player.vimeo.com/video/'+ match[3] +'?title=0&amp;byline=0&amp;portrait=0';
						if(settings.autoplay) movie += "&autoplay=1;";
				
						vimeo_width = pp_dimensions['width'] + '/embed/?moog_width='+ pp_dimensions['width'];
				
						toInject = settings.iframe_markup.replace(/{width}/g,vimeo_width).replace(/{height}/g,pp_dimensions['height']).replace(/{path}/g,movie);
					break;
				
					case 'quicktime':
						pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
						pp_dimensions['height']+=15; pp_dimensions['contentHeight']+=15; pp_dimensions['containerHeight']+=15; // Add space for the control bar
				
						toInject = settings.quicktime_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,pp_images[set_position]).replace(/{autoplay}/g,settings.autoplay);
					break;
				
					case 'flash':
						pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
					
						flash_vars = pp_images[set_position];
						flash_vars = flash_vars.substring(pp_images[set_position].indexOf('flashvars') + 10,pp_images[set_position].length);

						filename = pp_images[set_position];
						filename = filename.substring(0,filename.indexOf('?'));
					
						toInject =  settings.flash_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,filename+'?'+flash_vars);
					break;
				
					case 'iframe':
						pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
				
						frame_url = pp_images[set_position];
						frame_url = frame_url.substr(0,frame_url.indexOf('iframe')-1);

						toInject = settings.iframe_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{path}/g,frame_url);
					break;
					
					case 'ajax':
						doresize = false; // Make sure the dimensions are not resized.
						pp_dimensions = _fitToViewport(movie_width,movie_height);
						doresize = true; // Reset the dimensions
					
						skipInjection = true;
						$.get(pp_images[set_position],function(responseHTML){
							toInject = settings.inline_markup.replace(/{content}/g,responseHTML);
							$pp_pic_holder.find('#pp_full_res')[0].innerHTML = toInject;
							_showContent();
						});
						
					break;
					
					case 'custom':
						pp_dimensions = _fitToViewport(movie_width,movie_height); // Fit item to viewport
					
						toInject = settings.custom_markup;
					break;
				
					case 'inline':
						// to get the item height clone it, apply default width, wrap it in the prettyPhoto containers , then delete
						myClone = $(pp_images[set_position]).clone().append('<br clear="all" />').css({'width':settings.default_width}).wrapInner('<div id="pp_full_res"><div class="pp_inline"></div></div>').appendTo($('body')).show();
						doresize = false; // Make sure the dimensions are not resized.
						pp_dimensions = _fitToViewport($(myClone).width(),$(myClone).height());
						doresize = true; // Reset the dimensions
						$(myClone).remove();
						toInject = settings.inline_markup.replace(/{content}/g,$(pp_images[set_position]).html());
					break;
				};

				if(!imgPreloader && !skipInjection){
					$pp_pic_holder.find('#pp_full_res')[0].innerHTML = toInject;
				
					// Show content
					_showContent();
				};
			});

			return false;
		};

	
		/**
		* Change page in the prettyPhoto modal box
		* @param direction {String} Direction of the paging, previous or next.
		*/
		$.prettyPhoto.changePage = function(direction){
			currentGalleryPage = 0;
			
			if(direction == 'previous') {
				set_position--;
				if (set_position < 0) set_position = $(pp_images).size()-1;
			}else if(direction == 'next'){
				set_position++;
				if(set_position > $(pp_images).size()-1) set_position = 0;
			}else{
				set_position=direction;
			};
			
			rel_index = set_position;

			if(!doresize) doresize = true; // Allow the resizing of the images
			if(settings.allow_expand) {
				$('.pp_contract').removeClass('pp_contract').addClass('pp_expand');
			}

			_hideContent(function(){ $.prettyPhoto.open(); });
		};


		/**
		* Change gallery page in the prettyPhoto modal box
		* @param direction {String} Direction of the paging, previous or next.
		*/
		$.prettyPhoto.changeGalleryPage = function(direction){
			if(direction=='next'){
				currentGalleryPage ++;

				if(currentGalleryPage > totalPage) currentGalleryPage = 0;
			}else if(direction=='previous'){
				currentGalleryPage --;

				if(currentGalleryPage < 0) currentGalleryPage = totalPage;
			}else{
				currentGalleryPage = direction;
			};
			
			slide_speed = (direction == 'next' || direction == 'previous') ? settings.animation_speed : 0;

			slide_to = currentGalleryPage * (itemsPerPage * itemWidth);

			$pp_gallery.find('ul').animate({left:-slide_to},slide_speed);
		};


		/**
		* Start the slideshow...
		*/
		$.prettyPhoto.startSlideshow = function(){
			if(typeof pp_slideshow == 'undefined'){
				$pp_pic_holder.find('.pp_play').unbind('click').removeClass('pp_play').addClass('pp_pause').click(function(){
					$.prettyPhoto.stopSlideshow();
					return false;
				});
				pp_slideshow = setInterval($.prettyPhoto.startSlideshow,settings.slideshow);
			}else{
				$.prettyPhoto.changePage('next');	
			};
		}


		/**
		* Stop the slideshow...
		*/
		$.prettyPhoto.stopSlideshow = function(){
			$pp_pic_holder.find('.pp_pause').unbind('click').removeClass('pp_pause').addClass('pp_play').click(function(){
				$.prettyPhoto.startSlideshow();
				return false;
			});
			clearInterval(pp_slideshow);
			pp_slideshow=undefined;
		}


		/**
		* Closes prettyPhoto.
		*/
		$.prettyPhoto.close = function(){
			if($pp_overlay.is(":animated")) return;
			
			$.prettyPhoto.stopSlideshow();
			
			$pp_pic_holder.stop().find('object,embed').css('visibility','hidden');
			
			$('div.pp_pic_holder,div.ppt,.pp_fade, div.pp_details, .pp_loaderIcon').fadeOut(350,function(){ $(this).remove(); });
			
			$pp_overlay.css('opacity',0);
			setTimeout(function(){
				
				if(typeof settings.hideflash != 'undefined' && settings.hideflash) $('object,embed,iframe[src*=youtube],iframe[src*=vimeo]').css('visibility','visible'); // Show the flash
				
				$pp_overlay.remove(); // No more need for the prettyPhoto markup
				
				$(window).unbind('scroll.prettyphoto');
				
				clearHashtag();
				
				settings.callback();
				
				doresize = true;
				
				pp_open = false;
				
				delete settings;
				
			},350);
		};
	
		/**
		* Set the proper sizes on the containers and animate the content in.
		*/
		function _showContent(){
			
			// Calculate the opened top position of the pic holder
			projectedTop = scroll_pos['scrollTop'] + ((windowHeight/2) - (pp_dimensions['containerHeight']/2));
			if(projectedTop < 0) projectedTop = 0;

			$ppt.fadeTo(settings.animation_speed,1);
			

			// Resize the content holder
			$pp_pic_holder.find('.pp_content')
				.css({
					height:pp_dimensions['contentHeight'],
					width:pp_dimensions['contentWidth']
				});
			
			// Resize picture the holder
			$pp_pic_holder.css({
				'top': projectedTop,
				'left': ((windowWidth/2) - (pp_dimensions['containerWidth']/2) < 0) ? 0 : (windowWidth/2) - (pp_dimensions['containerWidth']/2),
				width:pp_dimensions['containerWidth']
			});
			
			$pp_pic_holder.find('.pp_hoverContainer,#fullResImage').height(pp_dimensions['height']).width(pp_dimensions['width']);
			
			//make sure the iframe is loaded before fading in
			if( $pp_pic_holder.find('#pp_full_res > iframe').length == 0 ){
				$('.pp_loaderIcon').stop(true,true).fadeOut();
				$pp_pic_holder.find('.pp_fade, div.pp_details').fadeIn(settings.animation_speed); // Fade the new content		
			}
			
			else {
				$pp_pic_holder.find('iframe').load(function(){
							
					$pp_pic_holder.css({
						'top': projectedTop - 50,
					});
					$('.pp_loaderIcon').stop(true,true).fadeOut();
					$pp_pic_holder.find('.pp_fade, div.pp_details').fadeIn(settings.animation_speed); // Fade the new content
				});
			}
			
			
			
		
			

			// Show the nav
			if(isSet && _getFileType(pp_images[set_position])=="image") { $pp_pic_holder.find('.pp_hoverContainer').show(); }else{ $pp_pic_holder.find('.pp_hoverContainer').hide(); }
		
			if(settings.allow_expand) {
				if(pp_dimensions['resized']){ // Fade the resizing link if the image is resized
					$('a.pp_expand,a.pp_contract').show();
				}else{
					$('a.pp_expand').hide();
				}
			}
			
			if(settings.autoplay_slideshow && !pp_slideshow && !pp_open) $.prettyPhoto.startSlideshow();
			
			settings.changepicturecallback(); // Callback!
			
			pp_open = true;
		

			
			_insert_gallery();
			pp_settings.ajaxcallback();
		};
		
		/**
		* Hide the content...DUH!
		*/
		function _hideContent(callback){
			// Fade out the current picture
			$pp_pic_holder.find('#pp_full_res object,#pp_full_res embed').css('visibility','hidden');
			
			$('.pp_loaderIcon').fadeIn(600);
			
			$pp_pic_holder.find('.pp_fade').fadeOut(settings.animation_speed,function(){

				callback();
			});
		};
	
		/**
		* Check the item position in the gallery array, hide or show the navigation links
		* @param setCount {integer} The total number of items in the set
		*/
		function _checkPosition(setCount){
			(setCount > 1) ? $('.pp_nav').show() : $('.pp_nav').hide(); // Hide the bottom nav if it's not a set.
		};
	
		/**
		* Resize the item dimensions if it's bigger than the viewport
		* @param width {integer} Width of the item to be opened
		* @param height {integer} Height of the item to be opened
		* @return An array containin the "fitted" dimensions
		*/
		function _fitToViewport(width,height){
			resized = false;

			_getDimensions(width,height);
			
			// Define them in case there's no resize needed
			imageWidth = width, imageHeight = height;

			if( ((pp_containerWidth > windowWidth) || (pp_containerHeight > windowHeight)) && doresize && settings.allow_resize && !percentBased) {
				resized = true, fitting = false;
			
				while (!fitting){
					if((pp_containerWidth > windowWidth)){
						imageWidth = (windowWidth - 200);
						imageHeight = (height/width) * imageWidth;
					}else if((pp_containerHeight > windowHeight)){
						imageHeight = (windowHeight - 200);
						imageWidth = (width/height) * imageHeight;
					}else{
						fitting = true;
					};

					pp_containerHeight = imageHeight, pp_containerWidth = imageWidth;
				};
			

				
				if((pp_containerWidth > windowWidth) || (pp_containerHeight > windowHeight)){
					_fitToViewport(pp_containerWidth,pp_containerHeight)
				};
				
				_getDimensions(imageWidth,imageHeight);
			};
			
			return {
				width:Math.floor(imageWidth),
				height:Math.floor(imageHeight),
				containerHeight:Math.floor(pp_containerHeight),
				containerWidth:Math.floor(pp_containerWidth) + (settings.horizontal_padding * 2),
				contentHeight:Math.floor(pp_contentHeight),
				contentWidth:Math.floor(pp_contentWidth),
				resized:resized
			};
		};
		
		/**
		* Get the containers dimensions according to the item size
		* @param width {integer} Width of the item to be opened
		* @param height {integer} Height of the item to be opened
		*/
		function _getDimensions(width,height){
			width = parseFloat(width);
			height = parseFloat(height);
			
			// Get the details height, to do so, I need to clone it since it's invisible
			$pp_details = $pp_pic_holder.find('.pp_details');
			$pp_details.width(width);
			detailsHeight = parseFloat($pp_details.css('marginTop')) + parseFloat($pp_details.css('marginBottom'));
			
			$pp_details = $pp_details.clone().addClass(settings.theme).width(width).appendTo($('body')).css({
				'position':'absolute',
				'top':-10000
			});
			detailsHeight += $pp_details.height();
			detailsHeight = (detailsHeight <= 34) ? 36 : detailsHeight; // Min-height for the details
			$pp_details.remove();
			
			// Get the titles height, to do so, I need to clone it since it's invisible
			$pp_title = $pp_pic_holder.find('.ppt');
			$pp_title.width(width);
			titleHeight = parseFloat($pp_title.css('marginTop')) + parseFloat($pp_title.css('marginBottom'));
			$pp_title = $pp_title.clone().appendTo($('body')).css({
				'position':'absolute',
				'top':-10000
			});
			titleHeight += $pp_title.height();
			$pp_title.remove();
			
			// Get the container size, to resize the holder to the right dimensions
			pp_contentHeight = height + detailsHeight;
			pp_contentWidth = width;
			pp_containerHeight = pp_contentHeight + titleHeight + $pp_pic_holder.find('.pp_top').height() + $pp_pic_holder.find('.pp_bottom').height();
			pp_containerWidth = width;
		}
	
		function _getFileType(itemSrc){
			if (itemSrc.match(/youtube\.com\/watch/i) || itemSrc.match(/youtu\.be/i)) {
				return 'youtube';
			}else if (itemSrc.match(/vimeo\.com/i)) {
				return 'vimeo';
			}else if(itemSrc.match(/\b.mov\b/i)){ 
				return 'quicktime';
			}else if(itemSrc.match(/\b.swf\b/i)){
				return 'flash';
			}else if(itemSrc.match(/\biframe=true\b/i)){
				return 'iframe';
			}else if(itemSrc.match(/\bajax=true\b/i)){
				return 'ajax';
			}else if(itemSrc.match(/\bcustom=true\b/i)){
				return 'custom';
			}else if(itemSrc.substr(0,1) == '#'){
				return 'inline';
			}else{
				return 'image';
			};
		};
	
		function _center_overlay(){
			if(doresize && typeof $pp_pic_holder != 'undefined') {
				scroll_pos = _get_scroll();
				contentHeight = $pp_pic_holder.height(), contentwidth = $pp_pic_holder.width();

				projectedTop = (windowHeight/2) + scroll_pos['scrollTop'] - (contentHeight/2);
				if(projectedTop < 0) projectedTop = 0;
				
				if(contentHeight > windowHeight)
					return;

				$pp_pic_holder.css({
					'top': projectedTop,
					'left': (windowWidth/2) + scroll_pos['scrollLeft'] - (contentwidth/2)
				});
			};
		};
	
		function _get_scroll(){
			if (self.pageYOffset) {
				return {scrollTop:self.pageYOffset,scrollLeft:self.pageXOffset};
			} else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
				return {scrollTop:document.documentElement.scrollTop,scrollLeft:document.documentElement.scrollLeft};
			} else if (document.body) {// all other Explorers
				return {scrollTop:document.body.scrollTop,scrollLeft:document.body.scrollLeft};
			};
		};
	
		function _resize_overlay() {
			windowHeight = $(window).height(), windowWidth = $(window).width();
			
			if(typeof $pp_overlay != "undefined") $pp_overlay.height($(document).height()).width(windowWidth);
		};
	
		function _insert_gallery(){
			if(isSet && settings.overlay_gallery && _getFileType(pp_images[set_position])=="image") {
				itemWidth = 52+5; // 52 beign the thumb width, 5 being the right margin.
				navWidth = (settings.theme == "facebook" || settings.theme == "pp_default") ? 50 : 30; // Define the arrow width depending on the theme
				
				itemsPerPage = Math.floor((pp_dimensions['containerWidth'] - 100 - navWidth) / itemWidth);
				itemsPerPage = (itemsPerPage < pp_images.length) ? itemsPerPage : pp_images.length;
				totalPage = Math.ceil(pp_images.length / itemsPerPage) - 1;

				// Hide the nav in the case there's no need for links
				if(totalPage == 0){
					navWidth = 0; // No nav means no width!
					$pp_gallery.find('.pp_arrow_next,.pp_arrow_previous').hide();
				}else{
					$pp_gallery.find('.pp_arrow_next,.pp_arrow_previous').show();
				};

				galleryWidth = itemsPerPage * itemWidth;
				fullGalleryWidth = pp_images.length * itemWidth;
				
				// Set the proper width to the gallery items
				$pp_gallery
					.css('margin-left',-((galleryWidth/2) + (navWidth/2)))
					.find('div:first').width(galleryWidth+5)
					.find('ul').width(fullGalleryWidth)
					.find('li.selected').removeClass('selected');
				
				goToPage = (Math.floor(set_position/itemsPerPage) < totalPage) ? Math.floor(set_position/itemsPerPage) : totalPage;

				$.prettyPhoto.changeGalleryPage(goToPage);
				
				$pp_gallery_li.filter(':eq('+set_position+')').addClass('selected');
			}else{
				$pp_pic_holder.find('.pp_content').unbind('mouseenter mouseleave');
				// $pp_gallery.hide();
			}
		}
	
		function _build_overlay(caller){
			// Inject Social Tool markup into General markup
			if(settings.social_tools)
				facebook_like_link = settings.social_tools.replace('{location_href}', encodeURIComponent(location.href)); 

			settings.markup = settings.markup.replace('{pp_social}',''); 
			
			$('body').append(settings.markup); // Inject the markup
			
			$pp_pic_holder = $('.pp_pic_holder') , $ppt = $('.ppt'), $pp_overlay = $('div.pp_overlay'); // Set my global selectors
			
			// Inject the inline gallery!
			if(isSet && settings.overlay_gallery) {
				currentGalleryPage = 0;
				toInject = "";
				for (var i=0; i < pp_images.length; i++) {
					if(!pp_images[i].match(/\b(jpg|jpeg|png|gif)\b/gi)){
						classname = 'default';
						img_src = '';
					}else{
						classname = '';
						img_src = pp_images[i];
					}
					toInject += "<li class='"+classname+"'><a href='#'><img src='" + img_src + "' width='50' alt='' /></a></li>";
				};
				
				toInject = settings.gallery_markup.replace(/{gallery}/g,toInject);
				
				$pp_pic_holder.find('#pp_full_res').after(toInject);
				
				$pp_gallery = $('.pp_pic_holder .pp_gallery'), $pp_gallery_li = $pp_gallery.find('li'); // Set the gallery selectors
				
				$pp_gallery.find('.pp_arrow_next').click(function(){
					$.prettyPhoto.changeGalleryPage('next');
					$.prettyPhoto.stopSlideshow();
					return false;
				});
				
				$pp_gallery.find('.pp_arrow_previous').click(function(){
					$.prettyPhoto.changeGalleryPage('previous');
					$.prettyPhoto.stopSlideshow();
					return false;
				});
				
				$pp_pic_holder.find('.pp_content').hover(
					function(){
						$pp_pic_holder.find('.pp_gallery:not(.disabled)').fadeIn();
					},
					function(){
						$pp_pic_holder.find('.pp_gallery:not(.disabled)').fadeOut();
					});

				itemWidth = 52+5; // 52 beign the thumb width, 5 being the right margin.
				$pp_gallery_li.each(function(i){
					$(this)
						.find('a')
						.click(function(){
							$.prettyPhoto.changePage(i);
							$.prettyPhoto.stopSlideshow();
							return false;
						});
				});
			};
			
			
			// Inject the play/pause if it's a slideshow
			if(settings.slideshow){
				$pp_pic_holder.find('.pp_nav').prepend('<a href="#" class="pp_play">Play</a>')
				$pp_pic_holder.find('.pp_nav .pp_play').click(function(){
					$.prettyPhoto.startSlideshow();
					return false;
				});
			}
			
			$pp_pic_holder.attr('class','pp_pic_holder ' + settings.theme); // Set the proper theme
			
			$pp_overlay
				.css({
					'height':$(document).height(),
					'width':$(window).width()
				})
				.bind('click',function(){
					if(!settings.modal) $.prettyPhoto.close();
				});

			$('a.pp_close').bind('click',function(){ $.prettyPhoto.close(); return false; });


			if(settings.allow_expand) {
				$('a.pp_expand').bind('click',function(e){
					// Expand the image
					if($(this).hasClass('pp_expand')){
						$(this).removeClass('pp_expand').addClass('pp_contract');
						doresize = false;
					}else{
						$(this).removeClass('pp_contract').addClass('pp_expand');
						doresize = true;
					};
				
					_hideContent(function(){ $.prettyPhoto.open(); });
			
					return false;
				});
			}
		
			$pp_pic_holder.find('.pp_previous, .pp_nav .pp_arrow_previous').bind('click',function(){
				$.prettyPhoto.changePage('previous');
				$.prettyPhoto.stopSlideshow();
				return false;
			});
		
			$pp_pic_holder.find('.pp_next, .pp_nav .pp_arrow_next').bind('click',function(){
				$.prettyPhoto.changePage('next');
				$.prettyPhoto.stopSlideshow();
				return false;
			});
			
			_center_overlay(); // Center it
		};

		if(!pp_alreadyInitialized && getHashtag()){
			pp_alreadyInitialized = true;
			
			// Grab the rel index to trigger the click on the correct element
			hashIndex = getHashtag();
			hashRel = hashIndex;
			hashIndex = hashIndex.substring(hashIndex.indexOf('/')+1,hashIndex.length-1);
			hashRel = hashRel.substring(0,hashRel.indexOf('/'));

			// Little timeout to make sure all the prettyPhoto initialize scripts has been run.
			// Useful in the event the page contain several init scripts.
			setTimeout(function(){ $("a["+pp_settings.hook+"^='"+hashRel+"']:eq("+hashIndex+")").trigger('click'); },50);
		}
		
		return this.unbind('click.prettyphoto').bind('click.prettyphoto',$.prettyPhoto.initialize); // Return the jQuery object for chaining. The unbind method is used to avoid click conflict when the plugin is called more than once
	};
	
	function getHashtag(){
		var url = location.href;
		hashtag = (url.indexOf('#prettyPhoto') !== -1) ? decodeURI(url.substring(url.indexOf('#prettyPhoto')+1,url.length)) : false;

		if(hashtag){  hashtag = hashtag.replace(/<|>/g,''); }
		return hashtag;
	};
	
	function setHashtag(){
		if(typeof theRel == 'undefined') return; // theRel is set on normal calls, it's impossible to deeplink using the API
		location.hash = theRel + '/'+rel_index+'/';
	};
	
	function clearHashtag(){
		if ( location.href.indexOf('#prettyPhoto') !== -1 ) location.hash = "prettyPhoto";
	}
	
	function getParam(name,url){
	  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	  var regexS = "[\\?&]"+name+"=([^&#]*)";
	  var regex = new RegExp( regexS );
	  var results = regex.exec( url );
	  return ( results == null ) ? "" : results[1];
	}
	
})(jQuery);

var pp_alreadyInitialized = false; // Used for the deep linking to make sure not to call the same function several times.
;/*!
 * Isotope PACKAGED v2.2.2
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * http://isotope.metafizzy.co
 * Copyright 2015 Metafizzy
 */

!function(a){function b(){}function c(a){function c(b){b.prototype.option||(b.prototype.option=function(b){a.isPlainObject(b)&&(this.options=a.extend(!0,this.options,b))})}function e(b,c){a.fn[b]=function(e){if("string"==typeof e){for(var g=d.call(arguments,1),h=0,i=this.length;i>h;h++){var j=this[h],k=a.data(j,b);if(k)if(a.isFunction(k[e])&&"_"!==e.charAt(0)){var l=k[e].apply(k,g);if(void 0!==l)return l}else f("no such method '"+e+"' for "+b+" instance");else f("cannot call methods on "+b+" prior to initialization; attempted to call '"+e+"'")}return this}return this.each(function(){var d=a.data(this,b);d?(d.option(e),d._init()):(d=new c(this,e),a.data(this,b,d))})}}if(a){var f="undefined"==typeof console?b:function(a){console.error(a)};return a.bridget=function(a,b){c(b),e(a,b)},a.bridget}}var d=Array.prototype.slice;"function"==typeof define&&define.amd?define("jquery-bridget/jquery.bridget",["jquery"],c):c("object"==typeof exports?require("jquery"):a.jQuery)}(window),function(a){function b(b){var c=a.event;return c.target=c.target||c.srcElement||b,c}var c=document.documentElement,d=function(){};c.addEventListener?d=function(a,b,c){a.addEventListener(b,c,!1)}:c.attachEvent&&(d=function(a,c,d){a[c+d]=d.handleEvent?function(){var c=b(a);d.handleEvent.call(d,c)}:function(){var c=b(a);d.call(a,c)},a.attachEvent("on"+c,a[c+d])});var e=function(){};c.removeEventListener?e=function(a,b,c){a.removeEventListener(b,c,!1)}:c.detachEvent&&(e=function(a,b,c){a.detachEvent("on"+b,a[b+c]);try{delete a[b+c]}catch(d){a[b+c]=void 0}});var f={bind:d,unbind:e};"function"==typeof define&&define.amd?define("eventie/eventie",f):"object"==typeof exports?module.exports=f:a.eventie=f}(window),function(){"use strict";function a(){}function b(a,b){for(var c=a.length;c--;)if(a[c].listener===b)return c;return-1}function c(a){return function(){return this[a].apply(this,arguments)}}var d=a.prototype,e=this,f=e.EventEmitter;d.getListeners=function(a){var b,c,d=this._getEvents();if(a instanceof RegExp){b={};for(c in d)d.hasOwnProperty(c)&&a.test(c)&&(b[c]=d[c])}else b=d[a]||(d[a]=[]);return b},d.flattenListeners=function(a){var b,c=[];for(b=0;b<a.length;b+=1)c.push(a[b].listener);return c},d.getListenersAsObject=function(a){var b,c=this.getListeners(a);return c instanceof Array&&(b={},b[a]=c),b||c},d.addListener=function(a,c){var d,e=this.getListenersAsObject(a),f="object"==typeof c;for(d in e)e.hasOwnProperty(d)&&-1===b(e[d],c)&&e[d].push(f?c:{listener:c,once:!1});return this},d.on=c("addListener"),d.addOnceListener=function(a,b){return this.addListener(a,{listener:b,once:!0})},d.once=c("addOnceListener"),d.defineEvent=function(a){return this.getListeners(a),this},d.defineEvents=function(a){for(var b=0;b<a.length;b+=1)this.defineEvent(a[b]);return this},d.removeListener=function(a,c){var d,e,f=this.getListenersAsObject(a);for(e in f)f.hasOwnProperty(e)&&(d=b(f[e],c),-1!==d&&f[e].splice(d,1));return this},d.off=c("removeListener"),d.addListeners=function(a,b){return this.manipulateListeners(!1,a,b)},d.removeListeners=function(a,b){return this.manipulateListeners(!0,a,b)},d.manipulateListeners=function(a,b,c){var d,e,f=a?this.removeListener:this.addListener,g=a?this.removeListeners:this.addListeners;if("object"!=typeof b||b instanceof RegExp)for(d=c.length;d--;)f.call(this,b,c[d]);else for(d in b)b.hasOwnProperty(d)&&(e=b[d])&&("function"==typeof e?f.call(this,d,e):g.call(this,d,e));return this},d.removeEvent=function(a){var b,c=typeof a,d=this._getEvents();if("string"===c)delete d[a];else if(a instanceof RegExp)for(b in d)d.hasOwnProperty(b)&&a.test(b)&&delete d[b];else delete this._events;return this},d.removeAllListeners=c("removeEvent"),d.emitEvent=function(a,b){var c,d,e,f,g=this.getListenersAsObject(a);for(e in g)if(g.hasOwnProperty(e))for(d=g[e].length;d--;)c=g[e][d],c.once===!0&&this.removeListener(a,c.listener),f=c.listener.apply(this,b||[]),f===this._getOnceReturnValue()&&this.removeListener(a,c.listener);return this},d.trigger=c("emitEvent"),d.emit=function(a){var b=Array.prototype.slice.call(arguments,1);return this.emitEvent(a,b)},d.setOnceReturnValue=function(a){return this._onceReturnValue=a,this},d._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},d._getEvents=function(){return this._events||(this._events={})},a.noConflict=function(){return e.EventEmitter=f,a},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return a}):"object"==typeof module&&module.exports?module.exports=a:e.EventEmitter=a}.call(this),function(a){function b(a){if(a){if("string"==typeof d[a])return a;a=a.charAt(0).toUpperCase()+a.slice(1);for(var b,e=0,f=c.length;f>e;e++)if(b=c[e]+a,"string"==typeof d[b])return b}}var c="Webkit Moz ms Ms O".split(" "),d=document.documentElement.style;"function"==typeof define&&define.amd?define("get-style-property/get-style-property",[],function(){return b}):"object"==typeof exports?module.exports=b:a.getStyleProperty=b}(window),function(a,b){function c(a){var b=parseFloat(a),c=-1===a.indexOf("%")&&!isNaN(b);return c&&b}function d(){}function e(){for(var a={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0},b=0,c=h.length;c>b;b++){var d=h[b];a[d]=0}return a}function f(b){function d(){if(!m){m=!0;var d=a.getComputedStyle;if(j=function(){var a=d?function(a){return d(a,null)}:function(a){return a.currentStyle};return function(b){var c=a(b);return c||g("Style returned "+c+". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"),c}}(),k=b("boxSizing")){var e=document.createElement("div");e.style.width="200px",e.style.padding="1px 2px 3px 4px",e.style.borderStyle="solid",e.style.borderWidth="1px 2px 3px 4px",e.style[k]="border-box";var f=document.body||document.documentElement;f.appendChild(e);var h=j(e);l=200===c(h.width),f.removeChild(e)}}}function f(a){if(d(),"string"==typeof a&&(a=document.querySelector(a)),a&&"object"==typeof a&&a.nodeType){var b=j(a);if("none"===b.display)return e();var f={};f.width=a.offsetWidth,f.height=a.offsetHeight;for(var g=f.isBorderBox=!(!k||!b[k]||"border-box"!==b[k]),m=0,n=h.length;n>m;m++){var o=h[m],p=b[o];p=i(a,p);var q=parseFloat(p);f[o]=isNaN(q)?0:q}var r=f.paddingLeft+f.paddingRight,s=f.paddingTop+f.paddingBottom,t=f.marginLeft+f.marginRight,u=f.marginTop+f.marginBottom,v=f.borderLeftWidth+f.borderRightWidth,w=f.borderTopWidth+f.borderBottomWidth,x=g&&l,y=c(b.width);y!==!1&&(f.width=y+(x?0:r+v));var z=c(b.height);return z!==!1&&(f.height=z+(x?0:s+w)),f.innerWidth=f.width-(r+v),f.innerHeight=f.height-(s+w),f.outerWidth=f.width+t,f.outerHeight=f.height+u,f}}function i(b,c){if(a.getComputedStyle||-1===c.indexOf("%"))return c;var d=b.style,e=d.left,f=b.runtimeStyle,g=f&&f.left;return g&&(f.left=b.currentStyle.left),d.left=c,c=d.pixelLeft,d.left=e,g&&(f.left=g),c}var j,k,l,m=!1;return f}var g="undefined"==typeof console?d:function(a){console.error(a)},h=["paddingLeft","paddingRight","paddingTop","paddingBottom","marginLeft","marginRight","marginTop","marginBottom","borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth"];"function"==typeof define&&define.amd?define("get-size/get-size",["get-style-property/get-style-property"],f):"object"==typeof exports?module.exports=f(require("desandro-get-style-property")):a.getSize=f(a.getStyleProperty)}(window),function(a){function b(a){"function"==typeof a&&(b.isReady?a():g.push(a))}function c(a){var c="readystatechange"===a.type&&"complete"!==f.readyState;b.isReady||c||d()}function d(){b.isReady=!0;for(var a=0,c=g.length;c>a;a++){var d=g[a];d()}}function e(e){return"complete"===f.readyState?d():(e.bind(f,"DOMContentLoaded",c),e.bind(f,"readystatechange",c),e.bind(a,"load",c)),b}var f=a.document,g=[];b.isReady=!1,"function"==typeof define&&define.amd?define("doc-ready/doc-ready",["eventie/eventie"],e):"object"==typeof exports?module.exports=e(require("eventie")):a.docReady=e(a.eventie)}(window),function(a){"use strict";function b(a,b){return a[g](b)}function c(a){if(!a.parentNode){var b=document.createDocumentFragment();b.appendChild(a)}}function d(a,b){c(a);for(var d=a.parentNode.querySelectorAll(b),e=0,f=d.length;f>e;e++)if(d[e]===a)return!0;return!1}function e(a,d){return c(a),b(a,d)}var f,g=function(){if(a.matches)return"matches";if(a.matchesSelector)return"matchesSelector";for(var b=["webkit","moz","ms","o"],c=0,d=b.length;d>c;c++){var e=b[c],f=e+"MatchesSelector";if(a[f])return f}}();if(g){var h=document.createElement("div"),i=b(h,"div");f=i?b:e}else f=d;"function"==typeof define&&define.amd?define("matches-selector/matches-selector",[],function(){return f}):"object"==typeof exports?module.exports=f:window.matchesSelector=f}(Element.prototype),function(a,b){"use strict";"function"==typeof define&&define.amd?define("fizzy-ui-utils/utils",["doc-ready/doc-ready","matches-selector/matches-selector"],function(c,d){return b(a,c,d)}):"object"==typeof exports?module.exports=b(a,require("doc-ready"),require("desandro-matches-selector")):a.fizzyUIUtils=b(a,a.docReady,a.matchesSelector)}(window,function(a,b,c){var d={};d.extend=function(a,b){for(var c in b)a[c]=b[c];return a},d.modulo=function(a,b){return(a%b+b)%b};var e=Object.prototype.toString;d.isArray=function(a){return"[object Array]"==e.call(a)},d.makeArray=function(a){var b=[];if(d.isArray(a))b=a;else if(a&&"number"==typeof a.length)for(var c=0,e=a.length;e>c;c++)b.push(a[c]);else b.push(a);return b},d.indexOf=Array.prototype.indexOf?function(a,b){return a.indexOf(b)}:function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},d.removeFrom=function(a,b){var c=d.indexOf(a,b);-1!=c&&a.splice(c,1)},d.isElement="function"==typeof HTMLElement||"object"==typeof HTMLElement?function(a){return a instanceof HTMLElement}:function(a){return a&&"object"==typeof a&&1==a.nodeType&&"string"==typeof a.nodeName},d.setText=function(){function a(a,c){b=b||(void 0!==document.documentElement.textContent?"textContent":"innerText"),a[b]=c}var b;return a}(),d.getParent=function(a,b){for(;a!=document.body;)if(a=a.parentNode,c(a,b))return a},d.getQueryElement=function(a){return"string"==typeof a?document.querySelector(a):a},d.handleEvent=function(a){var b="on"+a.type;this[b]&&this[b](a)},d.filterFindElements=function(a,b){a=d.makeArray(a);for(var e=[],f=0,g=a.length;g>f;f++){var h=a[f];if(d.isElement(h))if(b){c(h,b)&&e.push(h);for(var i=h.querySelectorAll(b),j=0,k=i.length;k>j;j++)e.push(i[j])}else e.push(h)}return e},d.debounceMethod=function(a,b,c){var d=a.prototype[b],e=b+"Timeout";a.prototype[b]=function(){var a=this[e];a&&clearTimeout(a);var b=arguments,f=this;this[e]=setTimeout(function(){d.apply(f,b),delete f[e]},c||100)}},d.toDashed=function(a){return a.replace(/(.)([A-Z])/g,function(a,b,c){return b+"-"+c}).toLowerCase()};var f=a.console;return d.htmlInit=function(c,e){b(function(){for(var b=d.toDashed(e),g=document.querySelectorAll(".js-"+b),h="data-"+b+"-options",i=0,j=g.length;j>i;i++){var k,l=g[i],m=l.getAttribute(h);try{k=m&&JSON.parse(m)}catch(n){f&&f.error("Error parsing "+h+" on "+l.nodeName.toLowerCase()+(l.id?"#"+l.id:"")+": "+n);continue}var o=new c(l,k),p=a.jQuery;p&&p.data(l,e,o)}})},d}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("outlayer/item",["eventEmitter/EventEmitter","get-size/get-size","get-style-property/get-style-property","fizzy-ui-utils/utils"],function(c,d,e,f){return b(a,c,d,e,f)}):"object"==typeof exports?module.exports=b(a,require("wolfy87-eventemitter"),require("get-size"),require("desandro-get-style-property"),require("fizzy-ui-utils")):(a.Outlayer={},a.Outlayer.Item=b(a,a.EventEmitter,a.getSize,a.getStyleProperty,a.fizzyUIUtils))}(window,function(a,b,c,d,e){"use strict";function f(a){for(var b in a)return!1;return b=null,!0}function g(a,b){a&&(this.element=a,this.layout=b,this.position={x:0,y:0},this._create())}function h(a){return a.replace(/([A-Z])/g,function(a){return"-"+a.toLowerCase()})}var i=a.getComputedStyle,j=i?function(a){return i(a,null)}:function(a){return a.currentStyle},k=d("transition"),l=d("transform"),m=k&&l,n=!!d("perspective"),o={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"otransitionend",transition:"transitionend"}[k],p=["transform","transition","transitionDuration","transitionProperty"],q=function(){for(var a={},b=0,c=p.length;c>b;b++){var e=p[b],f=d(e);f&&f!==e&&(a[e]=f)}return a}();e.extend(g.prototype,b.prototype),g.prototype._create=function(){this._transn={ingProperties:{},clean:{},onEnd:{}},this.css({position:"absolute"})},g.prototype.handleEvent=function(a){var b="on"+a.type;this[b]&&this[b](a)},g.prototype.getSize=function(){this.size=c(this.element)},g.prototype.css=function(a){var b=this.element.style;for(var c in a){var d=q[c]||c;b[d]=a[c]}},g.prototype.getPosition=function(){var a=j(this.element),b=this.layout.options,c=b.isOriginLeft,d=b.isOriginTop,e=a[c?"left":"right"],f=a[d?"top":"bottom"],g=this.layout.size,h=-1!=e.indexOf("%")?parseFloat(e)/100*g.width:parseInt(e,10),i=-1!=f.indexOf("%")?parseFloat(f)/100*g.height:parseInt(f,10);h=isNaN(h)?0:h,i=isNaN(i)?0:i,h-=c?g.paddingLeft:g.paddingRight,i-=d?g.paddingTop:g.paddingBottom,this.position.x=h,this.position.y=i},g.prototype.layoutPosition=function(){var a=this.layout.size,b=this.layout.options,c={},d=b.isOriginLeft?"paddingLeft":"paddingRight",e=b.isOriginLeft?"left":"right",f=b.isOriginLeft?"right":"left",g=this.position.x+a[d];c[e]=this.getXValue(g),c[f]="";var h=b.isOriginTop?"paddingTop":"paddingBottom",i=b.isOriginTop?"top":"bottom",j=b.isOriginTop?"bottom":"top",k=this.position.y+a[h];c[i]=this.getYValue(k),c[j]="",this.css(c),this.emitEvent("layout",[this])},g.prototype.getXValue=function(a){var b=this.layout.options;return b.percentPosition&&!b.isHorizontal?a/this.layout.size.width*100+"%":a+"px"},g.prototype.getYValue=function(a){var b=this.layout.options;return b.percentPosition&&b.isHorizontal?a/this.layout.size.height*100+"%":a+"px"},g.prototype._transitionTo=function(a,b){this.getPosition();var c=this.position.x,d=this.position.y,e=parseInt(a,10),f=parseInt(b,10),g=e===this.position.x&&f===this.position.y;if(this.setPosition(a,b),g&&!this.isTransitioning)return void this.layoutPosition();var h=a-c,i=b-d,j={};j.transform=this.getTranslate(h,i),this.transition({to:j,onTransitionEnd:{transform:this.layoutPosition},isCleaning:!0})},g.prototype.getTranslate=function(a,b){var c=this.layout.options;return a=c.isOriginLeft?a:-a,b=c.isOriginTop?b:-b,n?"translate3d("+a+"px, "+b+"px, 0)":"translate("+a+"px, "+b+"px)"},g.prototype.goTo=function(a,b){this.setPosition(a,b),this.layoutPosition()},g.prototype.moveTo=m?g.prototype._transitionTo:g.prototype.goTo,g.prototype.setPosition=function(a,b){this.position.x=parseInt(a,10),this.position.y=parseInt(b,10)},g.prototype._nonTransition=function(a){this.css(a.to),a.isCleaning&&this._removeStyles(a.to);for(var b in a.onTransitionEnd)a.onTransitionEnd[b].call(this)},g.prototype._transition=function(a){if(!parseFloat(this.layout.options.transitionDuration))return void this._nonTransition(a);var b=this._transn;for(var c in a.onTransitionEnd)b.onEnd[c]=a.onTransitionEnd[c];for(c in a.to)b.ingProperties[c]=!0,a.isCleaning&&(b.clean[c]=!0);if(a.from){this.css(a.from);var d=this.element.offsetHeight;d=null}this.enableTransition(a.to),this.css(a.to),this.isTransitioning=!0};var r="opacity,"+h(q.transform||"transform");g.prototype.enableTransition=function(){this.isTransitioning||(this.css({transitionProperty:r,transitionDuration:this.layout.options.transitionDuration}),this.element.addEventListener(o,this,!1))},g.prototype.transition=g.prototype[k?"_transition":"_nonTransition"],g.prototype.onwebkitTransitionEnd=function(a){this.ontransitionend(a)},g.prototype.onotransitionend=function(a){this.ontransitionend(a)};var s={"-webkit-transform":"transform","-moz-transform":"transform","-o-transform":"transform"};g.prototype.ontransitionend=function(a){if(a.target===this.element){var b=this._transn,c=s[a.propertyName]||a.propertyName;if(delete b.ingProperties[c],f(b.ingProperties)&&this.disableTransition(),c in b.clean&&(this.element.style[a.propertyName]="",delete b.clean[c]),c in b.onEnd){var d=b.onEnd[c];d.call(this),delete b.onEnd[c]}this.emitEvent("transitionEnd",[this])}},g.prototype.disableTransition=function(){this.removeTransitionStyles(),this.element.removeEventListener(o,this,!1),this.isTransitioning=!1},g.prototype._removeStyles=function(a){var b={};for(var c in a)b[c]="";this.css(b)};var t={transitionProperty:"",transitionDuration:""};return g.prototype.removeTransitionStyles=function(){this.css(t)},g.prototype.removeElem=function(){this.element.parentNode.removeChild(this.element),this.css({display:""}),this.emitEvent("remove",[this])},g.prototype.remove=function(){if(!k||!parseFloat(this.layout.options.transitionDuration))return void this.removeElem();var a=this;this.once("transitionEnd",function(){a.removeElem()}),this.hide()},g.prototype.reveal=function(){delete this.isHidden,this.css({display:""});var a=this.layout.options,b={},c=this.getHideRevealTransitionEndProperty("visibleStyle");b[c]=this.onRevealTransitionEnd,this.transition({from:a.hiddenStyle,to:a.visibleStyle,isCleaning:!0,onTransitionEnd:b})},g.prototype.onRevealTransitionEnd=function(){this.isHidden||this.emitEvent("reveal")},g.prototype.getHideRevealTransitionEndProperty=function(a){var b=this.layout.options[a];if(b.opacity)return"opacity";for(var c in b)return c},g.prototype.hide=function(){this.isHidden=!0,this.css({display:""});var a=this.layout.options,b={},c=this.getHideRevealTransitionEndProperty("hiddenStyle");b[c]=this.onHideTransitionEnd,this.transition({from:a.visibleStyle,to:a.hiddenStyle,isCleaning:!0,onTransitionEnd:b})},g.prototype.onHideTransitionEnd=function(){this.isHidden&&(this.css({display:"none"}),this.emitEvent("hide"))},g.prototype.destroy=function(){this.css({position:"",left:"",right:"",top:"",bottom:"",transition:"",transform:""})},g}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("outlayer/outlayer",["eventie/eventie","eventEmitter/EventEmitter","get-size/get-size","fizzy-ui-utils/utils","./item"],function(c,d,e,f,g){return b(a,c,d,e,f,g)}):"object"==typeof exports?module.exports=b(a,require("eventie"),require("wolfy87-eventemitter"),require("get-size"),require("fizzy-ui-utils"),require("./item")):a.Outlayer=b(a,a.eventie,a.EventEmitter,a.getSize,a.fizzyUIUtils,a.Outlayer.Item)}(window,function(a,b,c,d,e,f){"use strict";function g(a,b){var c=e.getQueryElement(a);if(!c)return void(h&&h.error("Bad element for "+this.constructor.namespace+": "+(c||a)));this.element=c,i&&(this.$element=i(this.element)),this.options=e.extend({},this.constructor.defaults),this.option(b);var d=++k;this.element.outlayerGUID=d,l[d]=this,this._create(),this.options.isInitLayout&&this.layout()}var h=a.console,i=a.jQuery,j=function(){},k=0,l={};return g.namespace="outlayer",g.Item=f,g.defaults={containerStyle:{position:"relative"},isInitLayout:!0,isOriginLeft:!0,isOriginTop:!0,isResizeBound:!0,isResizingContainer:!0,transitionDuration:"0.4s",hiddenStyle:{opacity:0,transform:"scale(0.001)"},visibleStyle:{opacity:1,transform:"scale(1)"}},e.extend(g.prototype,c.prototype),g.prototype.option=function(a){e.extend(this.options,a)},g.prototype._create=function(){this.reloadItems(),this.stamps=[],this.stamp(this.options.stamp),e.extend(this.element.style,this.options.containerStyle),this.options.isResizeBound&&this.bindResize()},g.prototype.reloadItems=function(){this.items=this._itemize(this.element.children)},g.prototype._itemize=function(a){for(var b=this._filterFindItemElements(a),c=this.constructor.Item,d=[],e=0,f=b.length;f>e;e++){var g=b[e],h=new c(g,this);d.push(h)}return d},g.prototype._filterFindItemElements=function(a){return e.filterFindElements(a,this.options.itemSelector)},g.prototype.getItemElements=function(){for(var a=[],b=0,c=this.items.length;c>b;b++)a.push(this.items[b].element);return a},g.prototype.layout=function(){this._resetLayout(),this._manageStamps();var a=void 0!==this.options.isLayoutInstant?this.options.isLayoutInstant:!this._isLayoutInited;this.layoutItems(this.items,a),this._isLayoutInited=!0},g.prototype._init=g.prototype.layout,g.prototype._resetLayout=function(){this.getSize()},g.prototype.getSize=function(){this.size=d(this.element)},g.prototype._getMeasurement=function(a,b){var c,f=this.options[a];f?("string"==typeof f?c=this.element.querySelector(f):e.isElement(f)&&(c=f),this[a]=c?d(c)[b]:f):this[a]=0},g.prototype.layoutItems=function(a,b){a=this._getItemsForLayout(a),this._layoutItems(a,b),this._postLayout()},g.prototype._getItemsForLayout=function(a){for(var b=[],c=0,d=a.length;d>c;c++){var e=a[c];e.isIgnored||b.push(e)}return b},g.prototype._layoutItems=function(a,b){if(this._emitCompleteOnItems("layout",a),a&&a.length){for(var c=[],d=0,e=a.length;e>d;d++){var f=a[d],g=this._getItemLayoutPosition(f);g.item=f,g.isInstant=b||f.isLayoutInstant,c.push(g)}this._processLayoutQueue(c)}},g.prototype._getItemLayoutPosition=function(){return{x:0,y:0}},g.prototype._processLayoutQueue=function(a){for(var b=0,c=a.length;c>b;b++){var d=a[b];this._positionItem(d.item,d.x,d.y,d.isInstant)}},g.prototype._positionItem=function(a,b,c,d){d?a.goTo(b,c):a.moveTo(b,c)},g.prototype._postLayout=function(){this.resizeContainer()},g.prototype.resizeContainer=function(){if(this.options.isResizingContainer){var a=this._getContainerSize();a&&(this._setContainerMeasure(a.width,!0),this._setContainerMeasure(a.height,!1))}},g.prototype._getContainerSize=j,g.prototype._setContainerMeasure=function(a,b){if(void 0!==a){var c=this.size;c.isBorderBox&&(a+=b?c.paddingLeft+c.paddingRight+c.borderLeftWidth+c.borderRightWidth:c.paddingBottom+c.paddingTop+c.borderTopWidth+c.borderBottomWidth),a=Math.max(a,0),this.element.style[b?"width":"height"]=a+"px"}},g.prototype._emitCompleteOnItems=function(a,b){function c(){e.dispatchEvent(a+"Complete",null,[b])}function d(){g++,g===f&&c()}var e=this,f=b.length;if(!b||!f)return void c();for(var g=0,h=0,i=b.length;i>h;h++){var j=b[h];j.once(a,d)}},g.prototype.dispatchEvent=function(a,b,c){var d=b?[b].concat(c):c;if(this.emitEvent(a,d),i)if(this.$element=this.$element||i(this.element),b){var e=i.Event(b);e.type=a,this.$element.trigger(e,c)}else this.$element.trigger(a,c)},g.prototype.ignore=function(a){var b=this.getItem(a);b&&(b.isIgnored=!0)},g.prototype.unignore=function(a){var b=this.getItem(a);b&&delete b.isIgnored},g.prototype.stamp=function(a){if(a=this._find(a)){this.stamps=this.stamps.concat(a);for(var b=0,c=a.length;c>b;b++){var d=a[b];this.ignore(d)}}},g.prototype.unstamp=function(a){if(a=this._find(a))for(var b=0,c=a.length;c>b;b++){var d=a[b];e.removeFrom(this.stamps,d),this.unignore(d)}},g.prototype._find=function(a){return a?("string"==typeof a&&(a=this.element.querySelectorAll(a)),a=e.makeArray(a)):void 0},g.prototype._manageStamps=function(){if(this.stamps&&this.stamps.length){this._getBoundingRect();for(var a=0,b=this.stamps.length;b>a;a++){var c=this.stamps[a];this._manageStamp(c)}}},g.prototype._getBoundingRect=function(){var a=this.element.getBoundingClientRect(),b=this.size;this._boundingRect={left:a.left+b.paddingLeft+b.borderLeftWidth,top:a.top+b.paddingTop+b.borderTopWidth,right:a.right-(b.paddingRight+b.borderRightWidth),bottom:a.bottom-(b.paddingBottom+b.borderBottomWidth)}},g.prototype._manageStamp=j,g.prototype._getElementOffset=function(a){var b=a.getBoundingClientRect(),c=this._boundingRect,e=d(a),f={left:b.left-c.left-e.marginLeft,top:b.top-c.top-e.marginTop,right:c.right-b.right-e.marginRight,bottom:c.bottom-b.bottom-e.marginBottom};return f},g.prototype.handleEvent=function(a){var b="on"+a.type;this[b]&&this[b](a)},g.prototype.bindResize=function(){this.isResizeBound||(b.bind(a,"resize",this),this.isResizeBound=!0)},g.prototype.unbindResize=function(){this.isResizeBound&&b.unbind(a,"resize",this),this.isResizeBound=!1},g.prototype.onresize=function(){function a(){b.resize(),delete b.resizeTimeout}this.resizeTimeout&&clearTimeout(this.resizeTimeout);var b=this;this.resizeTimeout=setTimeout(a,100)},g.prototype.resize=function(){this.isResizeBound&&this.needsResizeLayout()&&this.layout()},g.prototype.needsResizeLayout=function(){var a=d(this.element),b=this.size&&a;return b&&a.innerWidth!==this.size.innerWidth},g.prototype.addItems=function(a){var b=this._itemize(a);return b.length&&(this.items=this.items.concat(b)),b},g.prototype.appended=function(a){var b=this.addItems(a);b.length&&(this.layoutItems(b,!0),this.reveal(b))},g.prototype.prepended=function(a){var b=this._itemize(a);if(b.length){var c=this.items.slice(0);this.items=b.concat(c),this._resetLayout(),this._manageStamps(),this.layoutItems(b,!0),this.reveal(b),this.layoutItems(c)}},g.prototype.reveal=function(a){this._emitCompleteOnItems("reveal",a);for(var b=a&&a.length,c=0;b&&b>c;c++){var d=a[c];d.reveal()}},g.prototype.hide=function(a){this._emitCompleteOnItems("hide",a);for(var b=a&&a.length,c=0;b&&b>c;c++){var d=a[c];d.hide()}},g.prototype.revealItemElements=function(a){var b=this.getItems(a);this.reveal(b)},g.prototype.hideItemElements=function(a){var b=this.getItems(a);this.hide(b)},g.prototype.getItem=function(a){for(var b=0,c=this.items.length;c>b;b++){var d=this.items[b];if(d.element===a)return d}},g.prototype.getItems=function(a){a=e.makeArray(a);for(var b=[],c=0,d=a.length;d>c;c++){var f=a[c],g=this.getItem(f);g&&b.push(g)}return b},g.prototype.remove=function(a){var b=this.getItems(a);if(this._emitCompleteOnItems("remove",b),b&&b.length)for(var c=0,d=b.length;d>c;c++){var f=b[c];f.remove(),e.removeFrom(this.items,f)}},g.prototype.destroy=function(){var a=this.element.style;a.height="",a.position="",a.width="";for(var b=0,c=this.items.length;c>b;b++){var d=this.items[b];d.destroy()}this.unbindResize();var e=this.element.outlayerGUID;delete l[e],delete this.element.outlayerGUID,i&&i.removeData(this.element,this.constructor.namespace)},g.data=function(a){a=e.getQueryElement(a);var b=a&&a.outlayerGUID;return b&&l[b]},g.create=function(a,b){function c(){g.apply(this,arguments)}return Object.create?c.prototype=Object.create(g.prototype):e.extend(c.prototype,g.prototype),c.prototype.constructor=c,c.defaults=e.extend({},g.defaults),e.extend(c.defaults,b),c.prototype.settings={},c.namespace=a,c.data=g.data,c.Item=function(){f.apply(this,arguments)},c.Item.prototype=new f,e.htmlInit(c,a),i&&i.bridget&&i.bridget(a,c),c},g.Item=f,g}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("isotope/js/item",["outlayer/outlayer"],b):"object"==typeof exports?module.exports=b(require("outlayer")):(a.Isotope=a.Isotope||{},a.Isotope.Item=b(a.Outlayer))}(window,function(a){"use strict";function b(){a.Item.apply(this,arguments)}b.prototype=new a.Item,b.prototype._create=function(){this.id=this.layout.itemGUID++,a.Item.prototype._create.call(this),this.sortData={}},b.prototype.updateSortData=function(){if(!this.isIgnored){this.sortData.id=this.id,this.sortData["original-order"]=this.id,this.sortData.random=Math.random();var a=this.layout.options.getSortData,b=this.layout._sorters;for(var c in a){var d=b[c];this.sortData[c]=d(this.element,this)}}};var c=b.prototype.destroy;return b.prototype.destroy=function(){c.apply(this,arguments),this.css({display:""})},b}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("isotope/js/layout-mode",["get-size/get-size","outlayer/outlayer"],b):"object"==typeof exports?module.exports=b(require("get-size"),require("outlayer")):(a.Isotope=a.Isotope||{},a.Isotope.LayoutMode=b(a.getSize,a.Outlayer))}(window,function(a,b){"use strict";function c(a){this.isotope=a,a&&(this.options=a.options[this.namespace],this.element=a.element,this.items=a.filteredItems,this.size=a.size)}return function(){function a(a){return function(){return b.prototype[a].apply(this.isotope,arguments)}}for(var d=["_resetLayout","_getItemLayoutPosition","_manageStamp","_getContainerSize","_getElementOffset","needsResizeLayout"],e=0,f=d.length;f>e;e++){var g=d[e];c.prototype[g]=a(g)}}(),c.prototype.needsVerticalResizeLayout=function(){var b=a(this.isotope.element),c=this.isotope.size&&b;return c&&b.innerHeight!=this.isotope.size.innerHeight},c.prototype._getMeasurement=function(){this.isotope._getMeasurement.apply(this,arguments)},c.prototype.getColumnWidth=function(){this.getSegmentSize("column","Width")},c.prototype.getRowHeight=function(){this.getSegmentSize("row","Height")},c.prototype.getSegmentSize=function(a,b){var c=a+b,d="outer"+b;if(this._getMeasurement(c,d),!this[c]){var e=this.getFirstItemSize();this[c]=e&&e[d]||this.isotope.size["inner"+b]}},c.prototype.getFirstItemSize=function(){var b=this.isotope.filteredItems[0];return b&&b.element&&a(b.element)},c.prototype.layout=function(){this.isotope.layout.apply(this.isotope,arguments)},c.prototype.getSize=function(){this.isotope.getSize(),this.size=this.isotope.size},c.modes={},c.create=function(a,b){function d(){c.apply(this,arguments)}return d.prototype=new c,b&&(d.options=b),d.prototype.namespace=a,c.modes[a]=d,d},c}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("masonry/masonry",["outlayer/outlayer","get-size/get-size","fizzy-ui-utils/utils"],b):"object"==typeof exports?module.exports=b(require("outlayer"),require("get-size"),require("fizzy-ui-utils")):a.Masonry=b(a.Outlayer,a.getSize,a.fizzyUIUtils)}(window,function(a,b,c){var d=a.create("masonry");return d.prototype._resetLayout=function(){this.getSize(),this._getMeasurement("columnWidth","outerWidth"),this._getMeasurement("gutter","outerWidth"),this.measureColumns();var a=this.cols;for(this.colYs=[];a--;)this.colYs.push(0);this.maxY=0},d.prototype.measureColumns=function(){if(this.getContainerWidth(),!this.columnWidth){var a=this.items[0],c=a&&a.element;this.columnWidth=c&&b(c).outerWidth||this.containerWidth}var d=this.columnWidth+=this.gutter,e=this.containerWidth+this.gutter,f=e/d,g=d-e%d,h=g&&1>g?"round":"floor";f=Math[h](f),this.cols=Math.max(f,1)},d.prototype.getContainerWidth=function(){var a=this.options.isFitWidth?this.element.parentNode:this.element,c=b(a);this.containerWidth=c&&c.innerWidth},d.prototype._getItemLayoutPosition=function(a){a.getSize();var b=a.size.outerWidth%this.columnWidth,d=b&&1>b?"round":"ceil",e=Math[d](a.size.outerWidth/this.columnWidth);e=Math.min(e,this.cols);for(var f=this._getColGroup(e),g=Math.min.apply(Math,f),h=c.indexOf(f,g),i={x:this.columnWidth*h,y:g},j=g+a.size.outerHeight,k=this.cols+1-f.length,l=0;k>l;l++)this.colYs[h+l]=j;return i},d.prototype._getColGroup=function(a){if(2>a)return this.colYs;for(var b=[],c=this.cols+1-a,d=0;c>d;d++){var e=this.colYs.slice(d,d+a);b[d]=Math.max.apply(Math,e)}return b},d.prototype._manageStamp=function(a){var c=b(a),d=this._getElementOffset(a),e=this.options.isOriginLeft?d.left:d.right,f=e+c.outerWidth,g=Math.floor(e/this.columnWidth);g=Math.max(0,g);var h=Math.floor(f/this.columnWidth);h-=f%this.columnWidth?0:1,h=Math.min(this.cols-1,h);for(var i=(this.options.isOriginTop?d.top:d.bottom)+c.outerHeight,j=g;h>=j;j++)this.colYs[j]=Math.max(i,this.colYs[j])},d.prototype._getContainerSize=function(){this.maxY=Math.max.apply(Math,this.colYs);var a={height:this.maxY};return this.options.isFitWidth&&(a.width=this._getContainerFitWidth()),a},d.prototype._getContainerFitWidth=function(){for(var a=0,b=this.cols;--b&&0===this.colYs[b];)a++;return(this.cols-a)*this.columnWidth-this.gutter},d.prototype.needsResizeLayout=function(){var a=this.containerWidth;return this.getContainerWidth(),a!==this.containerWidth},d}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("isotope/js/layout-modes/masonry",["../layout-mode","masonry/masonry"],b):"object"==typeof exports?module.exports=b(require("../layout-mode"),require("masonry-layout")):b(a.Isotope.LayoutMode,a.Masonry)}(window,function(a,b){"use strict";function c(a,b){for(var c in b)a[c]=b[c];return a}var d=a.create("masonry"),e=d.prototype._getElementOffset,f=d.prototype.layout,g=d.prototype._getMeasurement;
c(d.prototype,b.prototype),d.prototype._getElementOffset=e,d.prototype.layout=f,d.prototype._getMeasurement=g;var h=d.prototype.measureColumns;d.prototype.measureColumns=function(){this.items=this.isotope.filteredItems,h.call(this)};var i=d.prototype._manageStamp;return d.prototype._manageStamp=function(){this.options.isOriginLeft=this.isotope.options.isOriginLeft,this.options.isOriginTop=this.isotope.options.isOriginTop,i.apply(this,arguments)},d}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("isotope/js/layout-modes/fit-rows",["../layout-mode"],b):"object"==typeof exports?module.exports=b(require("../layout-mode")):b(a.Isotope.LayoutMode)}(window,function(a){"use strict";var b=a.create("fitRows");return b.prototype._resetLayout=function(){this.x=0,this.y=0,this.maxY=0,this._getMeasurement("gutter","outerWidth")},b.prototype._getItemLayoutPosition=function(a){a.getSize();var b=a.size.outerWidth+this.gutter,c=this.isotope.size.innerWidth+this.gutter;0!==this.x&&b+this.x>c&&(this.x=0,this.y=this.maxY);var d={x:this.x,y:this.y};return this.maxY=Math.max(this.maxY,this.y+a.size.outerHeight),this.x+=b,d},b.prototype._getContainerSize=function(){return{height:this.maxY}},b}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("isotope/js/layout-modes/vertical",["../layout-mode"],b):"object"==typeof exports?module.exports=b(require("../layout-mode")):b(a.Isotope.LayoutMode)}(window,function(a){"use strict";var b=a.create("vertical",{horizontalAlignment:0});return b.prototype._resetLayout=function(){this.y=0},b.prototype._getItemLayoutPosition=function(a){a.getSize();var b=(this.isotope.size.innerWidth-a.size.outerWidth)*this.options.horizontalAlignment,c=this.y;return this.y+=a.size.outerHeight,{x:b,y:c}},b.prototype._getContainerSize=function(){return{height:this.y}},b}),function(a,b){"use strict";"function"==typeof define&&define.amd?define(["outlayer/outlayer","get-size/get-size","matches-selector/matches-selector","fizzy-ui-utils/utils","isotope/js/item","isotope/js/layout-mode","isotope/js/layout-modes/masonry","isotope/js/layout-modes/fit-rows","isotope/js/layout-modes/vertical"],function(c,d,e,f,g,h){return b(a,c,d,e,f,g,h)}):"object"==typeof exports?module.exports=b(a,require("outlayer"),require("get-size"),require("desandro-matches-selector"),require("fizzy-ui-utils"),require("./item"),require("./layout-mode"),require("./layout-modes/masonry"),require("./layout-modes/fit-rows"),require("./layout-modes/vertical")):a.Isotope=b(a,a.Outlayer,a.getSize,a.matchesSelector,a.fizzyUIUtils,a.Isotope.Item,a.Isotope.LayoutMode)}(window,function(a,b,c,d,e,f,g){function h(a,b){return function(c,d){for(var e=0,f=a.length;f>e;e++){var g=a[e],h=c.sortData[g],i=d.sortData[g];if(h>i||i>h){var j=void 0!==b[g]?b[g]:b,k=j?1:-1;return(h>i?1:-1)*k}}return 0}}var i=a.jQuery,j=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^\s+|\s+$/g,"")},k=document.documentElement,l=k.textContent?function(a){return a.textContent}:function(a){return a.innerText},m=b.create("isotope",{layoutMode:"masonry",isJQueryFiltering:!0,sortAscending:!0});m.Item=f,m.LayoutMode=g,m.prototype._create=function(){this.itemGUID=0,this._sorters={},this._getSorters(),b.prototype._create.call(this),this.modes={},this.filteredItems=this.items,this.sortHistory=["original-order"];for(var a in g.modes)this._initLayoutMode(a)},m.prototype.reloadItems=function(){this.itemGUID=0,b.prototype.reloadItems.call(this)},m.prototype._itemize=function(){for(var a=b.prototype._itemize.apply(this,arguments),c=0,d=a.length;d>c;c++){var e=a[c];e.id=this.itemGUID++}return this._updateItemsSortData(a),a},m.prototype._initLayoutMode=function(a){var b=g.modes[a],c=this.options[a]||{};this.options[a]=b.options?e.extend(b.options,c):c,this.modes[a]=new b(this)},m.prototype.layout=function(){return!this._isLayoutInited&&this.options.isInitLayout?void this.arrange():void this._layout()},m.prototype._layout=function(){var a=this._getIsInstant();this._resetLayout(),this._manageStamps(),this.layoutItems(this.filteredItems,a),this._isLayoutInited=!0},m.prototype.arrange=function(a){function b(){d.reveal(c.needReveal),d.hide(c.needHide)}this.option(a),this._getIsInstant();var c=this._filter(this.items);this.filteredItems=c.matches;var d=this;this._bindArrangeComplete(),this._isInstant?this._noTransition(b):b(),this._sort(),this._layout()},m.prototype._init=m.prototype.arrange,m.prototype._getIsInstant=function(){var a=void 0!==this.options.isLayoutInstant?this.options.isLayoutInstant:!this._isLayoutInited;return this._isInstant=a,a},m.prototype._bindArrangeComplete=function(){function a(){b&&c&&d&&e.dispatchEvent("arrangeComplete",null,[e.filteredItems])}var b,c,d,e=this;this.once("layoutComplete",function(){b=!0,a()}),this.once("hideComplete",function(){c=!0,a()}),this.once("revealComplete",function(){d=!0,a()})},m.prototype._filter=function(a){var b=this.options.filter;b=b||"*";for(var c=[],d=[],e=[],f=this._getFilterTest(b),g=0,h=a.length;h>g;g++){var i=a[g];if(!i.isIgnored){var j=f(i);j&&c.push(i),j&&i.isHidden?d.push(i):j||i.isHidden||e.push(i)}}return{matches:c,needReveal:d,needHide:e}},m.prototype._getFilterTest=function(a){return i&&this.options.isJQueryFiltering?function(b){return i(b.element).is(a)}:"function"==typeof a?function(b){return a(b.element)}:function(b){return d(b.element,a)}},m.prototype.updateSortData=function(a){var b;a?(a=e.makeArray(a),b=this.getItems(a)):b=this.items,this._getSorters(),this._updateItemsSortData(b)},m.prototype._getSorters=function(){var a=this.options.getSortData;for(var b in a){var c=a[b];this._sorters[b]=n(c)}},m.prototype._updateItemsSortData=function(a){for(var b=a&&a.length,c=0;b&&b>c;c++){var d=a[c];d.updateSortData()}};var n=function(){function a(a){if("string"!=typeof a)return a;var c=j(a).split(" "),d=c[0],e=d.match(/^\[(.+)\]$/),f=e&&e[1],g=b(f,d),h=m.sortDataParsers[c[1]];return a=h?function(a){return a&&h(g(a))}:function(a){return a&&g(a)}}function b(a,b){var c;return c=a?function(b){return b.getAttribute(a)}:function(a){var c=a.querySelector(b);return c&&l(c)}}return a}();m.sortDataParsers={parseInt:function(a){return parseInt(a,10)},parseFloat:function(a){return parseFloat(a)}},m.prototype._sort=function(){var a=this.options.sortBy;if(a){var b=[].concat.apply(a,this.sortHistory),c=h(b,this.options.sortAscending);this.filteredItems.sort(c),a!=this.sortHistory[0]&&this.sortHistory.unshift(a)}},m.prototype._mode=function(){var a=this.options.layoutMode,b=this.modes[a];if(!b)throw new Error("No layout mode: "+a);return b.options=this.options[a],b},m.prototype._resetLayout=function(){b.prototype._resetLayout.call(this),this._mode()._resetLayout()},m.prototype._getItemLayoutPosition=function(a){return this._mode()._getItemLayoutPosition(a)},m.prototype._manageStamp=function(a){this._mode()._manageStamp(a)},m.prototype._getContainerSize=function(){return this._mode()._getContainerSize()},m.prototype.needsResizeLayout=function(){return this._mode().needsResizeLayout()},m.prototype.appended=function(a){var b=this.addItems(a);if(b.length){var c=this._filterRevealAdded(b);this.filteredItems=this.filteredItems.concat(c)}},m.prototype.prepended=function(a){var b=this._itemize(a);if(b.length){this._resetLayout(),this._manageStamps();var c=this._filterRevealAdded(b);this.layoutItems(this.filteredItems),this.filteredItems=c.concat(this.filteredItems),this.items=b.concat(this.items)}},m.prototype._filterRevealAdded=function(a){var b=this._filter(a);return this.hide(b.needHide),this.reveal(b.matches),this.layoutItems(b.matches,!0),b.matches},m.prototype.insert=function(a){var b=this.addItems(a);if(b.length){var c,d,e=b.length;for(c=0;e>c;c++)d=b[c],this.element.appendChild(d.element);var f=this._filter(b).matches;for(c=0;e>c;c++)b[c].isLayoutInstant=!0;for(this.arrange(),c=0;e>c;c++)delete b[c].isLayoutInstant;this.reveal(f)}};var o=m.prototype.remove;return m.prototype.remove=function(a){a=e.makeArray(a);var b=this.getItems(a);o.call(this,a);var c=b&&b.length;if(c)for(var d=0;c>d;d++){var f=b[d];e.removeFrom(this.filteredItems,f)}},m.prototype.shuffle=function(){for(var a=0,b=this.items.length;b>a;a++){var c=this.items[a];c.sortData.random=Math.random()}this.options.sortBy="random",this._sort(),this._layout()},m.prototype._noTransition=function(a){var b=this.options.transitionDuration;this.options.transitionDuration=0;var c=a.call(this);return this.options.transitionDuration=b,c},m.prototype.getFilteredItemElements=function(){for(var a=[],b=0,c=this.filteredItems.length;c>b;b++)a.push(this.filteredItems[b].element);return a},m});

/*!
 * Packery layout mode PACKAGED v1.1.1
 * sub-classes Packery
 * http://packery.metafizzy.co
 */

!function(a){function b(a){return new RegExp("(^|\\s+)"+a+"(\\s+|$)")}function c(a,b){var c=d(a,b)?f:e;c(a,b)}var d,e,f;"classList"in document.documentElement?(d=function(a,b){return a.classList.contains(b)},e=function(a,b){a.classList.add(b)},f=function(a,b){a.classList.remove(b)}):(d=function(a,c){return b(c).test(a.className)},e=function(a,b){d(a,b)||(a.className=a.className+" "+b)},f=function(a,c){a.className=a.className.replace(b(c)," ")});var g={hasClass:d,addClass:e,removeClass:f,toggleClass:c,has:d,add:e,remove:f,toggle:c};"function"==typeof define&&define.amd?define("classie/classie",g):"object"==typeof exports?module.exports=g:a.classie=g}(window),function(a){function b(){function a(b){for(var c in a.defaults)this[c]=a.defaults[c];for(c in b)this[c]=b[c]}return c.Rect=a,a.defaults={x:0,y:0,width:0,height:0},a.prototype.contains=function(a){var b=a.width||0,c=a.height||0;return this.x<=a.x&&this.y<=a.y&&this.x+this.width>=a.x+b&&this.y+this.height>=a.y+c},a.prototype.overlaps=function(a){var b=this.x+this.width,c=this.y+this.height,d=a.x+a.width,e=a.y+a.height;return this.x<d&&b>a.x&&this.y<e&&c>a.y},a.prototype.getMaximalFreeRects=function(b){if(!this.overlaps(b))return!1;var c,d=[],e=this.x+this.width,f=this.y+this.height,g=b.x+b.width,h=b.y+b.height;return this.y<b.y&&(c=new a({x:this.x,y:this.y,width:this.width,height:b.y-this.y}),d.push(c)),e>g&&(c=new a({x:g,y:this.y,width:e-g,height:this.height}),d.push(c)),f>h&&(c=new a({x:this.x,y:h,width:this.width,height:f-h}),d.push(c)),this.x<b.x&&(c=new a({x:this.x,y:this.y,width:b.x-this.x,height:this.height}),d.push(c)),d},a.prototype.canFit=function(a){return this.width>=a.width&&this.height>=a.height},a}var c=a.Packery=function(){};"function"==typeof define&&define.amd?define("packery/js/rect",b):"object"==typeof exports?module.exports=b():(a.Packery=a.Packery||{},a.Packery.Rect=b())}(window),function(a){function b(a){function b(a,b,c){this.width=a||0,this.height=b||0,this.sortDirection=c||"downwardLeftToRight",this.reset()}b.prototype.reset=function(){this.spaces=[],this.newSpaces=[];var b=new a({x:0,y:0,width:this.width,height:this.height});this.spaces.push(b),this.sorter=c[this.sortDirection]||c.downwardLeftToRight},b.prototype.pack=function(a){for(var b=0,c=this.spaces.length;c>b;b++){var d=this.spaces[b];if(d.canFit(a)){this.placeInSpace(a,d);break}}},b.prototype.placeInSpace=function(a,b){a.x=b.x,a.y=b.y,this.placed(a)},b.prototype.placed=function(a){for(var b=[],c=0,d=this.spaces.length;d>c;c++){var e=this.spaces[c],f=e.getMaximalFreeRects(a);f?b.push.apply(b,f):b.push(e)}this.spaces=b,this.mergeSortSpaces()},b.prototype.mergeSortSpaces=function(){b.mergeRects(this.spaces),this.spaces.sort(this.sorter)},b.prototype.addSpace=function(a){this.spaces.push(a),this.mergeSortSpaces()},b.mergeRects=function(a){for(var b=0,c=a.length;c>b;b++){var d=a[b];if(d){var e=a.slice(0);e.splice(b,1);for(var f=0,g=0,h=e.length;h>g;g++){var i=e[g],j=b>g?0:1;d.contains(i)&&(a.splice(g+j-f,1),f++)}}}return a};var c={downwardLeftToRight:function(a,b){return a.y-b.y||a.x-b.x},rightwardTopToBottom:function(a,b){return a.x-b.x||a.y-b.y}};return b}if("function"==typeof define&&define.amd)define("packery/js/packer",["./rect"],b);else if("object"==typeof exports)module.exports=b(require("./rect"));else{var c=a.Packery=a.Packery||{};c.Packer=b(c.Rect)}}(window),function(a){function b(a,b,c){var d=a("transform"),e=function(){b.Item.apply(this,arguments)};e.prototype=new b.Item;var f=e.prototype._create;return e.prototype._create=function(){f.call(this),this.rect=new c,this.placeRect=new c},e.prototype.dragStart=function(){this.getPosition(),this.removeTransitionStyles(),this.isTransitioning&&d&&(this.element.style[d]="none"),this.getSize(),this.isPlacing=!0,this.needsPositioning=!1,this.positionPlaceRect(this.position.x,this.position.y),this.isTransitioning=!1,this.didDrag=!1},e.prototype.dragMove=function(a,b){this.didDrag=!0;var c=this.layout.size;a-=c.paddingLeft,b-=c.paddingTop,this.positionPlaceRect(a,b)},e.prototype.dragStop=function(){this.getPosition();var a=this.position.x!==this.placeRect.x,b=this.position.y!==this.placeRect.y;this.needsPositioning=a||b,this.didDrag=!1},e.prototype.positionPlaceRect=function(a,b,c){this.placeRect.x=this.getPlaceRectCoord(a,!0),this.placeRect.y=this.getPlaceRectCoord(b,!1,c)},e.prototype.getPlaceRectCoord=function(a,b,c){var d=b?"Width":"Height",e=this.size["outer"+d],f=this.layout[b?"columnWidth":"rowHeight"],g=this.layout.size["inner"+d];b||(g=Math.max(g,this.layout.maxY),this.layout.rowHeight||(g-=this.layout.gutter));var h;if(f){f+=this.layout.gutter,g+=b?this.layout.gutter:0,a=Math.round(a/f);var i;i=this.layout.options.isHorizontal?b?"ceil":"floor":b?"floor":"ceil";var j=Math[i](g/f);j-=Math.ceil(e/f),h=j}else h=g-e;return a=c?a:Math.min(a,h),a*=f||1,Math.max(0,a)},e.prototype.copyPlaceRectPosition=function(){this.rect.x=this.placeRect.x,this.rect.y=this.placeRect.y},e.prototype.removeElem=function(){this.element.parentNode.removeChild(this.element),this.layout.packer.addSpace(this.rect),this.emitEvent("remove",[this])},e}"function"==typeof define&&define.amd?define("packery/js/item",["get-style-property/get-style-property","outlayer/outlayer","./rect"],b):"object"==typeof exports?module.exports=b(require("desandro-get-style-property"),require("outlayer"),require("./rect")):a.Packery.Item=b(a.getStyleProperty,a.Outlayer,a.Packery.Rect)}(window),function(a){function b(a,b,c,d,e,f){function g(a,b){return a.position.y-b.position.y||a.position.x-b.position.x}function h(a,b){return a.position.x-b.position.x||a.position.y-b.position.y}d.prototype.canFit=function(a){return this.width>=a.width-1&&this.height>=a.height-1};var i=c.create("packery");return i.Item=f,i.prototype._create=function(){c.prototype._create.call(this),this.packer=new e,this.stamp(this.options.stamped);var a=this;this.handleDraggabilly={dragStart:function(b){a.itemDragStart(b.element)},dragMove:function(b){a.itemDragMove(b.element,b.position.x,b.position.y)},dragEnd:function(b){a.itemDragEnd(b.element)}},this.handleUIDraggable={start:function(b){a.itemDragStart(b.currentTarget)},drag:function(b,c){a.itemDragMove(b.currentTarget,c.position.left,c.position.top)},stop:function(b){a.itemDragEnd(b.currentTarget)}}},i.prototype._resetLayout=function(){this.getSize(),this._getMeasurements();var a=this.packer;this.options.isHorizontal?(a.width=Number.POSITIVE_INFINITY,a.height=this.size.innerHeight+this.gutter,a.sortDirection="rightwardTopToBottom"):(a.width=this.size.innerWidth+this.gutter,a.height=Number.POSITIVE_INFINITY,a.sortDirection="downwardLeftToRight"),a.reset(),this.maxY=0,this.maxX=0},i.prototype._getMeasurements=function(){this._getMeasurement("columnWidth","width"),this._getMeasurement("rowHeight","height"),this._getMeasurement("gutter","width")},i.prototype._getItemLayoutPosition=function(a){return this._packItem(a),a.rect},i.prototype._packItem=function(a){this._setRectSize(a.element,a.rect),this.packer.pack(a.rect),this._setMaxXY(a.rect)},i.prototype._setMaxXY=function(a){this.maxX=Math.max(a.x+a.width,this.maxX),this.maxY=Math.max(a.y+a.height,this.maxY)},i.prototype._setRectSize=function(a,c){var d=b(a),e=d.outerWidth,f=d.outerHeight;(e||f)&&(e=this._applyGridGutter(e,this.columnWidth),f=this._applyGridGutter(f,this.rowHeight)),c.width=Math.min(e,this.packer.width),c.height=Math.min(f,this.packer.height)},i.prototype._applyGridGutter=function(a,b){if(!b)return a+this.gutter;b+=this.gutter;var c=a%b,d=c&&1>c?"round":"ceil";return a=Math[d](a/b)*b},i.prototype._getContainerSize=function(){return this.options.isHorizontal?{width:this.maxX-this.gutter}:{height:this.maxY-this.gutter}},i.prototype._manageStamp=function(a){var b,c=this.getItem(a);if(c&&c.isPlacing)b=c.placeRect;else{var e=this._getElementOffset(a);b=new d({x:this.options.isOriginLeft?e.left:e.right,y:this.options.isOriginTop?e.top:e.bottom})}this._setRectSize(a,b),this.packer.placed(b),this._setMaxXY(b)},i.prototype.sortItemsByPosition=function(){var a=this.options.isHorizontal?h:g;this.items.sort(a)},i.prototype.fit=function(a,b,c){var d=this.getItem(a);d&&(this._getMeasurements(),this.stamp(d.element),d.getSize(),d.isPlacing=!0,b=void 0===b?d.rect.x:b,c=void 0===c?d.rect.y:c,d.positionPlaceRect(b,c,!0),this._bindFitEvents(d),d.moveTo(d.placeRect.x,d.placeRect.y),this.layout(),this.unstamp(d.element),this.sortItemsByPosition(),d.isPlacing=!1,d.copyPlaceRectPosition())},i.prototype._bindFitEvents=function(a){function b(){d++,2===d&&c.emitEvent("fitComplete",[c,a])}var c=this,d=0;a.on("layout",function(){return b(),!0}),this.on("layoutComplete",function(){return b(),!0})},i.prototype.resize=function(){var a=b(this.element),c=this.size&&a,d=this.options.isHorizontal?"innerHeight":"innerWidth";c&&a[d]===this.size[d]||this.layout()},i.prototype.itemDragStart=function(a){this.stamp(a);var b=this.getItem(a);b&&b.dragStart()},i.prototype.itemDragMove=function(a,b,c){function d(){f.layout(),delete f.dragTimeout}var e=this.getItem(a);e&&e.dragMove(b,c);var f=this;this.clearDragTimeout(),this.dragTimeout=setTimeout(d,40)},i.prototype.clearDragTimeout=function(){this.dragTimeout&&clearTimeout(this.dragTimeout)},i.prototype.itemDragEnd=function(b){var c,d=this.getItem(b);if(d&&(c=d.didDrag,d.dragStop()),!d||!c&&!d.needsPositioning)return void this.unstamp(b);a.add(d.element,"is-positioning-post-drag");var e=this._getDragEndLayoutComplete(b,d);d.needsPositioning?(d.on("layout",e),d.moveTo(d.placeRect.x,d.placeRect.y)):d&&d.copyPlaceRectPosition(),this.clearDragTimeout(),this.on("layoutComplete",e),this.layout()},i.prototype._getDragEndLayoutComplete=function(b,c){var d=c&&c.needsPositioning,e=0,f=d?2:1,g=this;return function(){return e++,e!==f?!0:(c&&(a.remove(c.element,"is-positioning-post-drag"),c.isPlacing=!1,c.copyPlaceRectPosition()),g.unstamp(b),g.sortItemsByPosition(),d&&g.emitEvent("dragItemPositioned",[g,c]),!0)}},i.prototype.bindDraggabillyEvents=function(a){a.on("dragStart",this.handleDraggabilly.dragStart),a.on("dragMove",this.handleDraggabilly.dragMove),a.on("dragEnd",this.handleDraggabilly.dragEnd)},i.prototype.bindUIDraggableEvents=function(a){a.on("dragstart",this.handleUIDraggable.start).on("drag",this.handleUIDraggable.drag).on("dragstop",this.handleUIDraggable.stop)},i.Rect=d,i.Packer=e,i}"function"==typeof define&&define.amd?define("packery/js/packery",["classie/classie","get-size/get-size","outlayer/outlayer","./rect","./packer","./item"],b):"object"==typeof exports?module.exports=b(require("desandro-classie"),require("get-size"),require("outlayer"),require("./rect"),require("./packer"),require("./item")):a.Packery=b(a.classie,a.getSize,a.Outlayer,a.Packery.Rect,a.Packery.Packer,a.Packery.Item)}(window),function(a){function b(a,b){for(var c in b)a[c]=b[c];return a}function c(a,c,d){var e=a.create("packery"),f=e.prototype._getElementOffset,g=e.prototype._getMeasurement;b(e.prototype,c.prototype),e.prototype._getElementOffset=f,e.prototype._getMeasurement=g;var h=e.prototype._resetLayout;e.prototype._resetLayout=function(){this.packer=this.packer||new c.Packer,h.apply(this,arguments)};var i=e.prototype._getItemLayoutPosition;e.prototype._getItemLayoutPosition=function(a){return a.rect=a.rect||new c.Rect,i.call(this,a)};var j=e.prototype._manageStamp;return e.prototype._manageStamp=function(){this.options.isOriginLeft=this.isotope.options.isOriginLeft,this.options.isOriginTop=this.isotope.options.isOriginTop,j.apply(this,arguments)},e.prototype.needsResizeLayout=function(){var a=d(this.element),b=this.size&&a,c=this.options.isHorizontal?"innerHeight":"innerWidth";return b&&a[c]!==this.size[c]},e}"function"==typeof define&&define.amd?define(["isotope/js/layout-mode","packery/js/packery","get-size/get-size"],c):"object"==typeof exports?module.exports=c(require("isotope-layout/js/layout-mode"),require("packery"),require("get-size")):c(a.Isotope.LayoutMode,a.Packery,a.getSize)}(window);
;/*
 * jQuery Superfish Menu Plugin - v1.7.4
 * Copyright (c) 2013 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 *	http://www.opensource.org/licenses/mit-license.php
 *	http://www.gnu.org/licenses/gpl.html
 */

;(function ($) {
	"use strict";

	var methods = (function () {
		// private properties and methods go here
		var c = {
				bcClass: 'sf-breadcrumb',
				menuClass: 'sf-js-enabled',
				anchorClass: 'sf-with-ul',
				menuArrowClass: 'sf-arrows'
			},
			ios = (function () {
				var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
				if (ios) {
					// iOS clicks only bubble as far as body children
					$(window).load(function () {
						$('body').children().on('click', $.noop);
					});
				}
				return ios;
			})(),
			wp7 = (function () {
				var style = document.documentElement.style;
				return ('behavior' in style && 'fill' in style && /iemobile/i.test(navigator.userAgent));
			})(),
			toggleMenuClasses = function ($menu, o) {
				var classes = c.menuClass;
				if (o.cssArrows) {
					classes += ' ' + c.menuArrowClass;
				}
				$menu.toggleClass(classes);
			},
			setPathToCurrent = function ($menu, o) {
				return $menu.find('li.' + o.pathClass).slice(0, o.pathLevels)
					.addClass(o.hoverClass + ' ' + c.bcClass)
						.filter(function () {
							return ($(this).children(o.popUpSelector).hide().show().length);
						}).removeClass(o.pathClass);
			},
			toggleAnchorClass = function ($li) {
				$li.children('a').toggleClass(c.anchorClass);
			},
			toggleTouchAction = function ($menu) {
				var touchAction = $menu.css('ms-touch-action');
				touchAction = (touchAction === 'pan-y') ? 'auto' : 'pan-y';
				$menu.css('ms-touch-action', touchAction);
			},
			applyHandlers = function ($menu, o) {
				var targets = 'li:has(' + o.popUpSelector + ')';
				if ($.fn.hoverIntent && !o.disableHI) {
					$menu.hoverIntent(over, out, targets);
				}
				else {
					$menu
						.on('mouseenter.superfish', targets, over)
						.on('mouseleave.superfish', targets, out);
				}
				var touchevent = 'MSPointerDown.superfish';
				if (!ios) {
					touchevent += ' touchend.superfish';
				}
				if (wp7) {
					touchevent += ' mousedown.superfish';
				}
				$menu
					.on('focusin.superfish', 'li', over)
					.on('focusout.superfish', 'li', out)
					.on(touchevent, 'a', o, touchHandler);
			},
			touchHandler = function (e) {
				var $this = $(this),
					$ul = $this.siblings(e.data.popUpSelector);

				if ($ul.length > 0 && $ul.is(':hidden')) {
					$this.one('click.superfish', false);
					if (e.type === 'MSPointerDown') {
						$this.trigger('focus');
					} else {
						$.proxy(over, $this.parent('li'))();
					}
				}
			},
			over = function () {
				var $this = $(this),
					o = getOptions($this);
				clearTimeout(o.sfTimer);
				$this.siblings().superfish('hide').end().superfish('show');
			},
			out = function () {
				var $this = $(this),
					o = getOptions($this);
				if (ios) {
					$.proxy(close, $this, o)();
				}
				else {
					clearTimeout(o.sfTimer);
					o.sfTimer = setTimeout($.proxy(close, $this, o), o.delay);
				}
			},
			close = function (o) {
				o.retainPath = ($.inArray(this[0], o.$path) > -1);
				this.superfish('hide');

				if (!this.parents('.' + o.hoverClass).length) {
					o.onIdle.call(getMenu(this));
					if (o.$path.length) {
						$.proxy(over, o.$path)();
					}
				}
			},
			getMenu = function ($el) {
				return $el.closest('.' + c.menuClass);
			},
			getOptions = function ($el) {
				return getMenu($el).data('sf-options');
			};

		return {
			// public methods
			hide: function (instant) {
				if (this.length) {
					var $this = this,
						o = getOptions($this);
					if (!o) {
						return this;
					}
					var not = (o.retainPath === true) ? o.$path : '',
						$ul = $this.find('li.' + o.hoverClass).add(this).not(not).removeClass(o.hoverClass).children(o.popUpSelector),
						speed = o.speedOut;

					if (instant) {
						$ul.show();
						speed = 0;
					}
					o.retainPath = false;
					o.onBeforeHide.call($ul);
					$ul.stop(true, true).animate(o.animationOut, speed, function () {
						var $this = $(this);
						o.onHide.call($this);
					});
				}
				return this;
			},
			show: function () {
				var o = getOptions(this);
				if (!o) {
					return this;
				}
				var $this = this.addClass(o.hoverClass),
					$ul = $this.children(o.popUpSelector);
				
				o.onBeforeShow.call($ul);
				

				//make sure the ul has space 
				if(!$($ul).parents('li').hasClass('megamenu') && !$($ul).parents('ul').hasClass('sub-menu') && $ul.offset()) {
					
					$ul.addClass('temp-hidden-display');
					var docW = $("#top .container").width();
					var elm = $ul;
			        var off = elm.offset();
			        var l = off.left - ($(window).width() - docW)/2;
			        var w = elm.width();
					var isEntirelyVisible = (l+w <= $(window).width()-100);

			        if ( ! isEntirelyVisible ) {
			            $ul.parents('li').addClass('edge');
			        } else {
			            $ul.parents('li').removeClass('edge');
			        }
					$ul.removeClass('temp-hidden-display');
					
				}
				
				
				$ul.stop(true, true).animate(o.animation, o.speed, function () {
					o.onShow.call($ul);
				});
				return this;
			},
			destroy: function () {
				return this.each(function () {
					var $this = $(this),
						o = $this.data('sf-options'),
						$hasPopUp;
					if (!o) {
						return false;
					}
					$hasPopUp = $this.find(o.popUpSelector).parent('li');
					clearTimeout(o.sfTimer);
					toggleMenuClasses($this, o);
					toggleAnchorClass($hasPopUp);
					toggleTouchAction($this);
					// remove event handlers
					$this.off('.superfish').off('.hoverIntent');
					// clear animation's inline display style
					$hasPopUp.children(o.popUpSelector).attr('style', function (i, style) {
						return style.replace(/display[^;]+;?/g, '');
					});
					// reset 'current' path classes
					o.$path.removeClass(o.hoverClass + ' ' + c.bcClass).addClass(o.pathClass);
					$this.find('.' + o.hoverClass).removeClass(o.hoverClass);
					o.onDestroy.call($this);
					$this.removeData('sf-options');
				});
			},
			init: function (op) {
				return this.each(function () {
					var $this = $(this);
					if ($this.data('sf-options')) {
						return false;
					}
					var o = $.extend({}, $.fn.superfish.defaults, op),
						$hasPopUp = $this.find(o.popUpSelector).parent('li');
					o.$path = setPathToCurrent($this, o);

					$this.data('sf-options', o);

					toggleMenuClasses($this, o);
					toggleAnchorClass($hasPopUp);
					toggleTouchAction($this);
					applyHandlers($this, o);

					$hasPopUp.not('.' + c.bcClass).superfish('hide', true);

					o.onInit.call(this);
				});
			}
		};
	})();

	$.fn.superfish = function (method, args) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		}
		else {
			return $.error('Method ' +  method + ' does not exist on jQuery.fn.superfish');
		}
	};

	$.fn.superfish.defaults = {
		popUpSelector: 'ul,.sf-mega', // within menu context
		hoverClass: 'sfHover',
		pathClass: 'overrideThisToUse',
		pathLevels: 1,
		delay: 800,
		animation: {opacity: 'show'},
		animationOut: {opacity: 'hide'},
		speed: 'normal',
		speedOut: 'fast',
		cssArrows: true,
		disableHI: false,
		onInit: $.noop,
		onBeforeShow: $.noop,
		onShow: $.noop,
		onBeforeHide: $.noop,
		onHide: $.noop,
		onIdle: $.noop,
		onDestroy: $.noop
	};

	// soon to be deprecated
	$.fn.extend({
		hideSuperfishUl: methods.hide,
		showSuperfishUl: methods.show
	});

})(jQuery);
;/*-------------------------------------------------------------------------

	1.	Plugin Init
	2.	Helper Functions
	3.	Shortcode Stuff
	4.	Header + Search
	5.	Page Specific
	6.  Scroll to top 
	7.	Cross Browser Fixes


-------------------------------------------------------------------------*/


/*-------------------------------------------------------------------------*/
/*	1.	Plugin Init
/*-------------------------------------------------------------------------*/

/*!
 * imagesLoaded PACKAGED v3.1.1
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

(function(){function e(){}function t(e,t){for(var n=e.length;n--;)if(e[n].listener===t)return n;return-1}function n(e){return function(){return this[e].apply(this,arguments)}}var i=e.prototype,r=this,o=r.EventEmitter;i.getListeners=function(e){var t,n,i=this._getEvents();if("object"==typeof e){t={};for(n in i)i.hasOwnProperty(n)&&e.test(n)&&(t[n]=i[n])}else t=i[e]||(i[e]=[]);return t},i.flattenListeners=function(e){var t,n=[];for(t=0;e.length>t;t+=1)n.push(e[t].listener);return n},i.getListenersAsObject=function(e){var t,n=this.getListeners(e);return n instanceof Array&&(t={},t[e]=n),t||n},i.addListener=function(e,n){var i,r=this.getListenersAsObject(e),o="object"==typeof n;for(i in r)r.hasOwnProperty(i)&&-1===t(r[i],n)&&r[i].push(o?n:{listener:n,once:!1});return this},i.on=n("addListener"),i.addOnceListener=function(e,t){return this.addListener(e,{listener:t,once:!0})},i.once=n("addOnceListener"),i.defineEvent=function(e){return this.getListeners(e),this},i.defineEvents=function(e){for(var t=0;e.length>t;t+=1)this.defineEvent(e[t]);return this},i.removeListener=function(e,n){var i,r,o=this.getListenersAsObject(e);for(r in o)o.hasOwnProperty(r)&&(i=t(o[r],n),-1!==i&&o[r].splice(i,1));return this},i.off=n("removeListener"),i.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},i.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},i.manipulateListeners=function(e,t,n){var i,r,o=e?this.removeListener:this.addListener,s=e?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(i=n.length;i--;)o.call(this,t,n[i]);else for(i in t)t.hasOwnProperty(i)&&(r=t[i])&&("function"==typeof r?o.call(this,i,r):s.call(this,i,r));return this},i.removeEvent=function(e){var t,n=typeof e,i=this._getEvents();if("string"===n)delete i[e];else if("object"===n)for(t in i)i.hasOwnProperty(t)&&e.test(t)&&delete i[t];else delete this._events;return this},i.removeAllListeners=n("removeEvent"),i.emitEvent=function(e,t){var n,i,r,o,s=this.getListenersAsObject(e);for(r in s)if(s.hasOwnProperty(r))for(i=s[r].length;i--;)n=s[r][i],n.once===!0&&this.removeListener(e,n.listener),o=n.listener.apply(this,t||[]),o===this._getOnceReturnValue()&&this.removeListener(e,n.listener);return this},i.trigger=n("emitEvent"),i.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},i.setOnceReturnValue=function(e){return this._onceReturnValue=e,this},i._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},i._getEvents=function(){return this._events||(this._events={})},e.noConflict=function(){return r.EventEmitter=o,e},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return e}):"object"==typeof module&&module.exports?module.exports=e:this.EventEmitter=e}).call(this),function(e){function t(t){var n=e.event;return n.target=n.target||n.srcElement||t,n}var n=document.documentElement,i=function(){};n.addEventListener?i=function(e,t,n){e.addEventListener(t,n,!1)}:n.attachEvent&&(i=function(e,n,i){e[n+i]=i.handleEvent?function(){var n=t(e);i.handleEvent.call(i,n)}:function(){var n=t(e);i.call(e,n)},e.attachEvent("on"+n,e[n+i])});var r=function(){};n.removeEventListener?r=function(e,t,n){e.removeEventListener(t,n,!1)}:n.detachEvent&&(r=function(e,t,n){e.detachEvent("on"+t,e[t+n]);try{delete e[t+n]}catch(i){e[t+n]=void 0}});var o={bind:i,unbind:r};"function"==typeof define&&define.amd?define("eventie/eventie",o):e.eventie=o}(this),function(e){function t(e,t){for(var n in t)e[n]=t[n];return e}function n(e){return"[object Array]"===f.call(e)}function i(e){var t=[];if(n(e))t=e;else if("number"==typeof e.length)for(var i=0,r=e.length;r>i;i++)t.push(e[i]);else t.push(e);return t}function r(e,n){function r(e,n,s){if(!(this instanceof r))return new r(e,n);"string"==typeof e&&(e=document.querySelectorAll(e)),this.elements=i(e),this.options=t({},this.options),"function"==typeof n?s=n:t(this.options,n),s&&this.on("always",s),this.getImages(),o&&(this.jqDeferred=new o.Deferred);var c=this;setTimeout(function(){c.check()})}function f(e){this.img=e}function a(e){this.src=e,h[e]=this}r.prototype=new e,r.prototype.options={},r.prototype.getImages=function(){this.images=[];for(var e=0,t=this.elements.length;t>e;e++){var n=this.elements[e];"IMG"===n.nodeName&&this.addImage(n);for(var i=n.querySelectorAll("img"),r=0,o=i.length;o>r;r++){var s=i[r];this.addImage(s)}}},r.prototype.addImage=function(e){var t=new f(e);this.images.push(t)},r.prototype.check=function(){function e(e,r){return t.options.debug&&c&&s.log("confirm",e,r),t.progress(e),n++,n===i&&t.complete(),!0}var t=this,n=0,i=this.images.length;if(this.hasAnyBroken=!1,!i)return this.complete(),void 0;for(var r=0;i>r;r++){var o=this.images[r];o.on("confirm",e),o.check()}},r.prototype.progress=function(e){this.hasAnyBroken=this.hasAnyBroken||!e.isLoaded;var t=this;setTimeout(function(){t.emit("progress",t,e),t.jqDeferred&&t.jqDeferred.notify(t,e)})},r.prototype.complete=function(){var e=this.hasAnyBroken?"fail":"done";this.isComplete=!0;var t=this;setTimeout(function(){if(t.emit(e,t),t.emit("always",t),t.jqDeferred){var n=t.hasAnyBroken?"reject":"resolve";t.jqDeferred[n](t)}})},o&&(o.fn.imagesLoaded=function(e,t){var n=new r(this,e,t);return n.jqDeferred.promise(o(this))}),f.prototype=new e,f.prototype.check=function(){var e=h[this.img.src]||new a(this.img.src);if(e.isConfirmed)return this.confirm(e.isLoaded,"cached was confirmed"),void 0;if(this.img.complete&&void 0!==this.img.naturalWidth)return this.confirm(0!==this.img.naturalWidth,"naturalWidth"),void 0;var t=this;e.on("confirm",function(e,n){return t.confirm(e.isLoaded,n),!0}),e.check()},f.prototype.confirm=function(e,t){this.isLoaded=e,this.emit("confirm",this,t)};var h={};return a.prototype=new e,a.prototype.check=function(){if(!this.isChecked){var e=new Image;n.bind(e,"load",this),n.bind(e,"error",this),e.src=this.src,this.isChecked=!0}},a.prototype.handleEvent=function(e){var t="on"+e.type;this[t]&&this[t](e)},a.prototype.onload=function(e){this.confirm(!0,"onload"),this.unbindProxyEvents(e)},a.prototype.onerror=function(e){this.confirm(!1,"onerror"),this.unbindProxyEvents(e)},a.prototype.confirm=function(e,t){this.isConfirmed=!0,this.isLoaded=e,this.emit("confirm",this,t)},a.prototype.unbindProxyEvents=function(e){n.unbind(e.target,"load",this),n.unbind(e.target,"error",this)},r}var o=e.jQuery,s=e.console,c=s!==void 0,f=Object.prototype.toString;"function"==typeof define&&define.amd?define(["eventEmitter/EventEmitter","eventie/eventie"],r):e.imagesLoaded=r(e.EventEmitter,e.eventie)}(window);	


/*jQuery Waypoints */
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.invokeAll("enable")},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical);t&&e&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s],l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=e?void 0:this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var r in t){var s=t[r];for(var a in this.waypoints[r]){var l,h,p,u,c,d=this.waypoints[r][a],f=d.options.offset,w=d.triggerPoint,y=0,g=null==w;d.element!==d.element.window&&(y=d.adapter.offset()[s.offsetProp]),"function"==typeof f?f=f.apply(d):"string"==typeof f&&(f=parseFloat(f),d.options.offset.indexOf("%")>-1&&(f=Math.ceil(s.contextDimension*f/100))),l=s.contextScroll-s.contextOffset,d.triggerPoint=y+l-f,h=w<s.oldScroll,p=d.triggerPoint>=s.oldScroll,u=h&&p,c=!h&&!p,!g&&u?(d.queueTrigger(s.backward),o[d.group.id]=d.group):!g&&c?(d.queueTrigger(s.forward),o[d.group.id]=d.group):g&&s.oldScroll>=d.triggerPoint&&(d.queueTrigger(s.forward),o[d.group.id]=d.group)}}return n.requestAnimationFrame(function(){for(var t in o)o[t].flushTriggers()}),this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();

/*
* jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
*/
jQuery.easing["jswing"]=jQuery.easing["swing"];jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(a,b,c,d,e){return jQuery.easing[jQuery.easing.def](a,b,c,d,e)},easeInQuad:function(a,b,c,d,e){return d*(b/=e)*b+c},easeOutQuad:function(a,b,c,d,e){return-d*(b/=e)*(b-2)+c},easeInOutQuad:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b+c;return-d/2*(--b*(b-2)-1)+c},easeInCubic:function(a,b,c,d,e){return d*(b/=e)*b*b+c},easeOutCubic:function(a,b,c,d,e){return d*((b=b/e-1)*b*b+1)+c},easeInOutCubic:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b+c;return d/2*((b-=2)*b*b+2)+c},easeInQuart:function(a,b,c,d,e){return d*(b/=e)*b*b*b+c},easeOutQuart:function(a,b,c,d,e){return-d*((b=b/e-1)*b*b*b-1)+c},easeInOutQuart:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b+c;return-d/2*((b-=2)*b*b*b-2)+c},easeInQuint:function(a,b,c,d,e){return d*(b/=e)*b*b*b*b+c},easeOutQuint:function(a,b,c,d,e){return d*((b=b/e-1)*b*b*b*b+1)+c},easeInOutQuint:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b*b+c;return d/2*((b-=2)*b*b*b*b+2)+c},easeInSine:function(a,b,c,d,e){return-d*Math.cos(b/e*(Math.PI/2))+d+c},easeOutSine:function(a,b,c,d,e){return d*Math.sin(b/e*(Math.PI/2))+c},easeInOutSine:function(a,b,c,d,e){return-d/2*(Math.cos(Math.PI*b/e)-1)+c},easeInExpo:function(a,b,c,d,e){return b==0?c:d*Math.pow(2,10*(b/e-1))+c},easeOutExpo:function(a,b,c,d,e){return b==e?c+d:d*(-Math.pow(2,-10*b/e)+1)+c},easeInOutExpo:function(a,b,c,d,e){if(b==0)return c;if(b==e)return c+d;if((b/=e/2)<1)return d/2*Math.pow(2,10*(b-1))+c;return d/2*(-Math.pow(2,-10*--b)+2)+c},easeInCirc:function(a,b,c,d,e){return-d*(Math.sqrt(1-(b/=e)*b)-1)+c},easeOutCirc:function(a,b,c,d,e){return d*Math.sqrt(1-(b=b/e-1)*b)+c},easeInOutCirc:function(a,b,c,d,e){if((b/=e/2)<1)return-d/2*(Math.sqrt(1-b*b)-1)+c;return d/2*(Math.sqrt(1-(b-=2)*b)+1)+c},easeInElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g))+c},easeOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*b)*Math.sin((b*e-f)*2*Math.PI/g)+d+c},easeInOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e/2)==2)return c+d;if(!g)g=e*.3*1.5;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);if(b<1)return-.5*h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)+c;return h*Math.pow(2,-10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)*.5+d+c},easeInBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*(b/=e)*b*((f+1)*b-f)+c},easeOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*((b=b/e-1)*b*((f+1)*b+f)+1)+c},easeInOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;if((b/=e/2)<1)return d/2*b*b*(((f*=1.525)+1)*b-f)+c;return d/2*((b-=2)*b*(((f*=1.525)+1)*b+f)+2)+c},easeInBounce:function(a,b,c,d,e){return d-jQuery.easing.easeOutBounce(a,e-b,0,d,e)+c},easeOutBounce:function(a,b,c,d,e){if((b/=e)<1/2.75){return d*7.5625*b*b+c}else if(b<2/2.75){return d*(7.5625*(b-=1.5/2.75)*b+.75)+c}else if(b<2.5/2.75){return d*(7.5625*(b-=2.25/2.75)*b+.9375)+c}else{return d*(7.5625*(b-=2.625/2.75)*b+.984375)+c}},easeInOutBounce:function(a,b,c,d,e){if(b<e/2)return jQuery.easing.easeInBounce(a,b*2,0,d,e)*.5+c;return jQuery.easing.easeOutBounce(a,b*2-e,0,d,e)*.5+d*.5+c}})


/*! Mousewheel by Brandon Aaron (http://brandon.aaron.sh) */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});

(function($, window, document) {



jQuery(document).ready(function($){
	

/***************** Pretty Photo ******************/
	
	function prettyPhotoInit(){
		
		//add galleries to portfolios
		$('.portfolio-items').each(function(){
			var $unique_id = Math.floor(Math.random()*10000);
			$(this).find('.pretty_photo').attr('rel','prettyPhoto['+$unique_id+'_gal]').removeClass('pretty_photo');
		});
		
		$("a[data-rel='prettyPhoto[product-gallery]'], a[data-rel='prettyPhoto']").each(function(){
			$(this).attr('rel',$(this).attr('data-rel'));
			$(this).removeAttr('data-rel');
		});
		
		//nectar auto lightbox
		if($('body').hasClass('nectar-auto-lightbox')){
			$('.gallery').each(function(){
				if($(this).find('.gallery-icon a[rel^="prettyPhoto"]').length == 0) {
					var $unique_id = Math.floor(Math.random()*10000);
					$(this).find('.gallery-item .gallery-icon a[href*=".jpg"], .gallery-item .gallery-icon a[href*=".png"], .gallery-item .gallery-icon a[href*=".gif"], .gallery-item .gallery-icon a[href*=".jpeg"]').attr('rel','prettyPhoto['+$unique_id+'_gal]').removeClass('pretty_photo');
				}
			});
			$('.main-content img').each(function(){
				if($(this).parent().is("[href]") && !$(this).parent().is("[rel*='prettyPhoto']") && $(this).parents('.product-image').length == 0 && $(this).parents('.iosSlider.product-slider').length == 0) {
					var match = $(this).parent().attr('href').match(/\.(jpg|png|gif)\b/);
					if(match) $(this).parent().attr('rel','prettyPhoto');
				} 
			});
		}
		
		
		//convert class usage into rel
		$('a.pp').removeClass('pp').attr('rel','prettyPhoto');
		
		 var loading_animation = ($('body[data-loading-animation]').attr('data-loading-animation') != 'none') ? $('body').attr('data-loading-animation') : null ;
		 var ascend_loader = ($('body').hasClass('ascend')) ? '<span class="default-loading-icon spin"></span>' :'';
		 var ascend_loader_class = ($('body').hasClass('ascend')) ? 'default_loader ' : '';
		$("a[rel^='prettyPhoto']").prettyPhoto({
			theme: 'dark_rounded',
			allow_resize: true,
			default_width: 1024,
			opacity: 0.85, 
			animation_speed: 'normal',
			deeplinking: false,
			default_height: 576,
			social_tools: '',
			markup: '<div class="pp_pic_holder"> \
						   <div class="ppt">&nbsp;</div> \
							<div class="pp_details"> \
								<div class="pp_nav"> \
								    <a href="#" class="pp_arrow_previous"> <i class="icon-salient-left-arrow-thin icon-default-style"></i> </a> \
									<a href="#" class="pp_arrow_next"> <i class="icon-salient-right-arrow-thin icon-default-style"></i> </a> \
									<p class="currentTextHolder">0/0</p> \
								</div> \
								<a class="pp_close" href="#"><span class="icon-salient-x icon-default-style"></span></a> \
							</div> \
							<div class="pp_content_container"> \
								<div class="pp_left"> \
								<div class="pp_right"> \
									<div class="pp_content"> \
										<div class="pp_fade"> \
											<div class="pp_hoverContainer"> \
											</div> \
											<div id="pp_full_res"></div> \
											<p class="pp_description"></p> \
										</div> \
									</div> \
								</div> \
								</div> \
							</div> \
						</div> \
						<div class="pp_loaderIcon ' + ascend_loader_class + loading_animation+'"> '+ascend_loader+' </div> \
						<div class="pp_overlay"></div>'
		});
		
	}


	function magnificInit() {
		
		//convert old pp links
		$('a.pp').removeClass('pp').addClass('magnific-popup');
		$("a[rel^='prettyPhoto']:not([rel*='_gal']):not([rel*='product-gallery']):not([rel*='prettyPhoto['])").removeAttr('rel').addClass('magnific-popup');


		//add galleries to portfolios
		$('.portfolio-items').each(function(){
			if($(this).find('.pretty_photo').length > 0) {
				$(this).find('.pretty_photo').removeClass('pretty_photo').addClass('gallery').addClass('magnific');
			} else if($(this).find('a[rel*="prettyPhoto["]').length > 0){
				$(this).find('a[rel*="prettyPhoto["]').removeAttr('rel').addClass('gallery').addClass('magnific');
			}

		});
		
		$("a[data-rel='prettyPhoto[product-gallery]']").each(function(){
			$(this).removeAttr('data-rel').addClass('magnific').addClass('gallery');
		});
		
		//nectar auto lightbox
		if($('body').hasClass('nectar-auto-lightbox')){
			$('.gallery').each(function(){
				if($(this).find('.gallery-icon a[rel^="prettyPhoto"]').length == 0) {
					var $unique_id = Math.floor(Math.random()*10000);
					$(this).find('.gallery-item .gallery-icon a[href*=".jpg"], .gallery-item .gallery-icon a[href*=".png"], .gallery-item .gallery-icon a[href*=".gif"], .gallery-item .gallery-icon a[href*=".jpeg"]').addClass('magnific').addClass('gallery').removeClass('pretty_photo');
				}
			});
			$('.main-content img').each(function(){
				if($(this).parent().is("[href]") && !$(this).parent().is(".magnific-popup") && $(this).parents('.product-image').length == 0 && $(this).parents('.iosSlider.product-slider').length == 0) {
					var match = $(this).parent().attr('href').match(/\.(jpg|png|gif)\b/);
					if(match) $(this).parent().addClass('magnific-popup').addClass('image-link');
				} 
			});
		}
		

		//regular
		$('a.magnific-popup:not(.gallery):not(.nectar_video_lightbox)').magnificPopup({ 
			type: 'image', 
			callbacks: {
				
				imageLoadComplete: function()  {	
					var $that = this;
					setTimeout( function() { $that.wrap.addClass('mfp-image-loaded'); }, 10);
				},
				beforeOpen: function() {
				    this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
			    },
			    open: function() {
					    	
					$.magnificPopup.instance.next = function() {
						var $that = this;

						this.wrap.removeClass('mfp-image-loaded');
						setTimeout( function() { $.magnificPopup.proto.next.call($that); }, 100);
					}

					$.magnificPopup.instance.prev = function() {
						var $that = this;

						this.wrap.removeClass('mfp-image-loaded');
						setTimeout( function() { $.magnificPopup.proto.prev.call($that); }, 100);
					}
					
				}
			},
			fixedContentPos: false,
		    mainClass: 'mfp-zoom-in', 
		    removalDelay: 400 
		});

		//video
		$('a.magnific-popup.nectar_video_lightbox, .swiper-slide a[href*=youtube], .swiper-slide a[href*=vimeo], .nectar-video-box > a.full-link.magnific-popup').magnificPopup({ 
			type: 'iframe', 
			fixedContentPos: false,
		    mainClass: 'mfp-zoom-in', 
		    removalDelay: 400 
		});


		//galleries
		$('a.magnific.gallery').each(function(){

			var $parentRow = ($(this).parents('.wpb_row').length > 0) ? $(this).parents('.wpb_row') : $(this).parents('.row');
			if($parentRow.length > 0 && !$parentRow.hasClass('lightbox-row')) {

				$parentRow.magnificPopup({
					type: 'image',
					delegate: 'a.magnific',
					mainClass: 'mfp-zoom-in',
					fixedContentPos: false,
					callbacks: {

						elementParse: function(item) {
			
							 if($(item.el.context).is('[href]') && $(item.el.context).attr('href').indexOf('iframe=true') != -1) {
						         item.type = 'iframe';
						      } else {
						         item.type = 'image';
						      }
						},

						imageLoadComplete: function()  {	
							var $that = this;
							setTimeout( function() { $that.wrap.addClass('mfp-image-loaded'); }, 10);
						},

						beforeOpen: function() {
					       this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
					    },

					    open: function() {
					    	
							$.magnificPopup.instance.next = function() {
								var $that = this;

								this.wrap.removeClass('mfp-image-loaded');
								setTimeout( function() { $.magnificPopup.proto.next.call($that); }, 100);
							}

							$.magnificPopup.instance.prev = function() {
								var $that = this;

								this.wrap.removeClass('mfp-image-loaded');
								setTimeout( function() { $.magnificPopup.proto.prev.call($that); }, 100);
							}
							
						}
					},
					removalDelay: 400, 
					gallery: {
			          enabled:true
			        }
				});

				$parentRow.addClass('lightbox-row');
			}
			
		});

	}

	function lightBoxInit() {
		if($('body[data-ls="pretty_photo"]').length > 0) {
			prettyPhotoInit();
		} else if($('body[data-ls="magnific"]').length > 0) {
			magnificInit();
		}
	}

	lightBoxInit();
	//check for late links
	setTimeout(lightBoxInit,500);
	
/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */
(function(k){k.transit={version:"0.9.9",propertyMap:{marginLeft:"margin",marginRight:"margin",marginBottom:"margin",marginTop:"margin",paddingLeft:"padding",paddingRight:"padding",paddingBottom:"padding",paddingTop:"padding"},enabled:true,useTransitionEnd:false};var d=document.createElement("div");var q={};function b(v){if(v in d.style){return v}var u=["Moz","Webkit","O","ms"];var r=v.charAt(0).toUpperCase()+v.substr(1);if(v in d.style){return v}for(var t=0;t<u.length;++t){var s=u[t]+r;if(s in d.style){return s}}}function e(){d.style[q.transform]="";d.style[q.transform]="rotateY(90deg)";return d.style[q.transform]!==""}var a=navigator.userAgent.toLowerCase().indexOf("chrome")>-1;q.transition=b("transition");q.transitionDelay=b("transitionDelay");q.transform=b("transform");q.transformOrigin=b("transformOrigin");q.transform3d=e();var i={transition:"transitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",WebkitTransition:"webkitTransitionEnd",msTransition:"MSTransitionEnd"};var f=q.transitionEnd=i[q.transition]||null;for(var p in q){if(q.hasOwnProperty(p)&&typeof k.support[p]==="undefined"){k.support[p]=q[p]}}d=null;k.cssEase={_default:"ease","in":"ease-in",out:"ease-out","in-out":"ease-in-out",snap:"cubic-bezier(0,1,.5,1)",easeOutCubic:"cubic-bezier(.215,.61,.355,1)",easeInOutCubic:"cubic-bezier(.645,.045,.355,1)",easeInCirc:"cubic-bezier(.6,.04,.98,.335)",easeOutCirc:"cubic-bezier(.075,.82,.165,1)",easeInOutCirc:"cubic-bezier(.785,.135,.15,.86)",easeInExpo:"cubic-bezier(.95,.05,.795,.035)",easeOutExpo:"cubic-bezier(.19,1,.22,1)",easeInOutExpo:"cubic-bezier(1,0,0,1)",easeInQuad:"cubic-bezier(.55,.085,.68,.53)",easeOutQuad:"cubic-bezier(.25,.46,.45,.94)",easeInOutQuad:"cubic-bezier(.455,.03,.515,.955)",easeInQuart:"cubic-bezier(.895,.03,.685,.22)",easeOutQuart:"cubic-bezier(.165,.84,.44,1)",easeInOutQuart:"cubic-bezier(.77,0,.175,1)",easeInQuint:"cubic-bezier(.755,.05,.855,.06)",easeOutQuint:"cubic-bezier(.23,1,.32,1)",easeInOutQuint:"cubic-bezier(.86,0,.07,1)",easeInSine:"cubic-bezier(.47,0,.745,.715)",easeOutSine:"cubic-bezier(.39,.575,.565,1)",easeInOutSine:"cubic-bezier(.445,.05,.55,.95)",easeInBack:"cubic-bezier(.6,-.28,.735,.045)",easeOutBack:"cubic-bezier(.175, .885,.32,1.275)",easeInOutBack:"cubic-bezier(.68,-.55,.265,1.55)"};k.cssHooks["transit:transform"]={get:function(r){return k(r).data("transform")||new j()},set:function(s,r){var t=r;if(!(t instanceof j)){t=new j(t)}if(q.transform==="WebkitTransform"&&!a){s.style[q.transform]=t.toString(true)}else{s.style[q.transform]=t.toString()}k(s).data("transform",t)}};k.cssHooks.transform={set:k.cssHooks["transit:transform"].set};if(k.fn.jquery<"1.8"){k.cssHooks.transformOrigin={get:function(r){return r.style[q.transformOrigin]},set:function(r,s){r.style[q.transformOrigin]=s}};k.cssHooks.transition={get:function(r){return r.style[q.transition]},set:function(r,s){r.style[q.transition]=s}}}n("scale");n("translate");n("rotate");n("rotateX");n("rotateY");n("rotate3d");n("perspective");n("skewX");n("skewY");n("x",true);n("y",true);function j(r){if(typeof r==="string"){this.parse(r)}return this}j.prototype={setFromString:function(t,s){var r=(typeof s==="string")?s.split(","):(s.constructor===Array)?s:[s];r.unshift(t);j.prototype.set.apply(this,r)},set:function(s){var r=Array.prototype.slice.apply(arguments,[1]);if(this.setter[s]){this.setter[s].apply(this,r)}else{this[s]=r.join(",")}},get:function(r){if(this.getter[r]){return this.getter[r].apply(this)}else{return this[r]||0}},setter:{rotate:function(r){this.rotate=o(r,"deg")},rotateX:function(r){this.rotateX=o(r,"deg")},rotateY:function(r){this.rotateY=o(r,"deg")},scale:function(r,s){if(s===undefined){s=r}this.scale=r+","+s},skewX:function(r){this.skewX=o(r,"deg")},skewY:function(r){this.skewY=o(r,"deg")},perspective:function(r){this.perspective=o(r,"px")},x:function(r){this.set("translate",r,null)},y:function(r){this.set("translate",null,r)},translate:function(r,s){if(this._translateX===undefined){this._translateX=0}if(this._translateY===undefined){this._translateY=0}if(r!==null&&r!==undefined){this._translateX=o(r,"px")}if(s!==null&&s!==undefined){this._translateY=o(s,"px")}this.translate=this._translateX+","+this._translateY}},getter:{x:function(){return this._translateX||0},y:function(){return this._translateY||0},scale:function(){var r=(this.scale||"1,1").split(",");if(r[0]){r[0]=parseFloat(r[0])}if(r[1]){r[1]=parseFloat(r[1])}return(r[0]===r[1])?r[0]:r},rotate3d:function(){var t=(this.rotate3d||"0,0,0,0deg").split(",");for(var r=0;r<=3;++r){if(t[r]){t[r]=parseFloat(t[r])}}if(t[3]){t[3]=o(t[3],"deg")}return t}},parse:function(s){var r=this;s.replace(/([a-zA-Z0-9]+)\((.*?)\)/g,function(t,v,u){r.setFromString(v,u)})},toString:function(t){var s=[];for(var r in this){if(this.hasOwnProperty(r)){if((!q.transform3d)&&((r==="rotateX")||(r==="rotateY")||(r==="perspective")||(r==="transformOrigin"))){continue}if(r[0]!=="_"){if(t&&(r==="scale")){s.push(r+"3d("+this[r]+",1)")}else{if(t&&(r==="translate")){s.push(r+"3d("+this[r]+",0)")}else{s.push(r+"("+this[r]+")")}}}}}return s.join(" ")}};function m(s,r,t){if(r===true){s.queue(t)}else{if(r){s.queue(r,t)}else{t()}}}function h(s){var r=[];k.each(s,function(t){t=k.camelCase(t);t=k.transit.propertyMap[t]||k.cssProps[t]||t;t=c(t);if(k.inArray(t,r)===-1){r.push(t)}});return r}function g(s,v,x,r){var t=h(s);if(k.cssEase[x]){x=k.cssEase[x]}var w=""+l(v)+" "+x;if(parseInt(r,10)>0){w+=" "+l(r)}var u=[];k.each(t,function(z,y){u.push(y+" "+w)});return u.join(", ")}k.fn.transition=k.fn.transit=function(z,s,y,C){var D=this;var u=0;var w=true;if(typeof s==="function"){C=s;s=undefined}if(typeof y==="function"){C=y;y=undefined}if(typeof z.easing!=="undefined"){y=z.easing;delete z.easing}if(typeof z.duration!=="undefined"){s=z.duration;delete z.duration}if(typeof z.complete!=="undefined"){C=z.complete;delete z.complete}if(typeof z.queue!=="undefined"){w=z.queue;delete z.queue}if(typeof z.delay!=="undefined"){u=z.delay;delete z.delay}if(typeof s==="undefined"){s=k.fx.speeds._default}if(typeof y==="undefined"){y=k.cssEase._default}s=l(s);var E=g(z,s,y,u);var B=k.transit.enabled&&q.transition;var t=B?(parseInt(s,10)+parseInt(u,10)):0;if(t===0){var A=function(F){D.css(z);if(C){C.apply(D)}if(F){F()}};m(D,w,A);return D}var x={};var r=function(H){var G=false;var F=function(){if(G){D.unbind(f,F)}if(t>0){D.each(function(){this.style[q.transition]=(x[this]||null)})}if(typeof C==="function"){C.apply(D)}if(typeof H==="function"){H()}};if((t>0)&&(f)&&(k.transit.useTransitionEnd)){G=true;D.bind(f,F)}else{window.setTimeout(F,t)}D.each(function(){if(t>0){this.style[q.transition]=E}k(this).css(z)})};var v=function(F){this.offsetWidth;r(F)};m(D,w,v);return this};function n(s,r){if(!r){k.cssNumber[s]=true}k.transit.propertyMap[s]=q.transform;k.cssHooks[s]={get:function(v){var u=k(v).css("transit:transform");return u.get(s)},set:function(v,w){var u=k(v).css("transit:transform");u.setFromString(s,w);k(v).css({"transit:transform":u})}}}function c(r){return r.replace(/([A-Z])/g,function(s){return"-"+s.toLowerCase()})}function o(s,r){if((typeof s==="string")&&(!s.match(/^[\-0-9\.]+$/))){return s}else{return""+s+r}}function l(s){var r=s;if(k.fx.speeds[r]){r=k.fx.speeds[r]}return o(r,"ms")}k.transit.getTransitionValue=g})(jQuery);




  // ========================= smartresize ===============================

  /*
   * smartresize: debounced resize event for jQuery
   *
   * latest version and complete README available on Github:
   * https://github.com/louisremi/jquery.smartresize.js
   *
   * Copyright 2011 @louis_remi
   * Licensed under the MIT license.
   */

  var $event = $.event,
      dispatchMethod = $.event.handle ? 'handle' : 'dispatch',
      resizeTimeout;

  $event.special.smartresize = {
    setup: function() {
      $(this).bind( "resize", $event.special.smartresize.handler );
    },
    teardown: function() {
      $(this).unbind( "resize", $event.special.smartresize.handler );
    },
    handler: function( event, execAsap ) {
      // Save the context
      var context = this,
          args = arguments;

      // set correct event type
      event.type = "smartresize";

      if ( resizeTimeout ) { clearTimeout( resizeTimeout ); }
      resizeTimeout = setTimeout(function() {
        $event[ dispatchMethod ].apply( context, args );
      }, execAsap === "execAsap"? 0 : 100 );
    }
  };

  $.fn.smartresize = function( fn ) {
    return fn ? this.bind( "smartresize", fn ) : this.trigger( "smartresize", ["execAsap"] );
  };



/***************** Smooth Scrolling ******************/

	function niceScrollInit(){
		$("html").niceScroll({
			scrollspeed: 60,
			mousescrollstep: 40,
			cursorwidth: 15,
			cursorborder: 0,
			cursorcolor: '#303030',
			cursorborderradius: 6,
			autohidemode: false,
			horizrailenabled: false
		});
		
		
		if($('#boxed').length == 0){
			$('body, body #header-outer, body #header-secondary-outer, body #search-outer').css('padding-right','16px');
		} else if($('body[data-ext-responsive="true"]').length == 0 ) {
			$('body').css('padding-right','16px');
		}
		
		$('html').addClass('no-overflow-y');
	}

	var $smoothActive = $('body').attr('data-smooth-scrolling'); 
	var $smoothCache = ( $smoothActive == 1 ) ? true : false;
	
	if( $smoothActive == 1 && $(window).width() > 690 && $('body').outerHeight(true) > $(window).height() && Modernizr.csstransforms3d && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|Opera Mini)/)){ niceScrollInit(); } else {
		$('body').attr('data-smooth-scrolling','0');
	}
	
	//chrome ss
	if($smoothCache == false && navigator.platform.toUpperCase().indexOf('MAC') === -1 && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|Opera Mini)/) && $(window).width() > 690 && $('#nectar_fullscreen_rows').length == 0) {
		!function(){function e(){var e=!1;e&&c("keydown",r),v.keyboardSupport&&!e&&u("keydown",r)}function t(){if(document.body){var t=document.body,n=document.documentElement,o=window.innerHeight,r=t.scrollHeight;if(S=document.compatMode.indexOf("CSS")>=0?n:t,w=t,e(),x=!0,top!=self)y=!0;else if(r>o&&(t.offsetHeight<=o||n.offsetHeight<=o)){var a=!1,i=function(){a||n.scrollHeight==document.height||(a=!0,setTimeout(function(){n.style.height=document.height+"px",a=!1},500))};if(n.style.height="auto",setTimeout(i,10),S.offsetHeight<=o){var l=document.createElement("div");l.style.clear="both",t.appendChild(l)}}v.fixedBackground||b||(t.style.backgroundAttachment="scroll",n.style.backgroundAttachment="scroll")}}function n(e,t,n,o){if(o||(o=1e3),d(t,n),1!=v.accelerationMax){var r=+new Date,a=r-C;if(a<v.accelerationDelta){var i=(1+30/a)/2;i>1&&(i=Math.min(i,v.accelerationMax),t*=i,n*=i)}C=+new Date}if(M.push({x:t,y:n,lastX:0>t?.99:-.99,lastY:0>n?.99:-.99,start:+new Date}),!T){var l=e===document.body,u=function(){for(var r=+new Date,a=0,i=0,c=0;c<M.length;c++){var s=M[c],d=r-s.start,f=d>=v.animationTime,h=f?1:d/v.animationTime;v.pulseAlgorithm&&(h=p(h));var m=s.x*h-s.lastX>>0,w=s.y*h-s.lastY>>0;a+=m,i+=w,s.lastX+=m,s.lastY+=w,f&&(M.splice(c,1),c--)}l?window.scrollBy(a,i):(a&&(e.scrollLeft+=a),i&&(e.scrollTop+=i)),t||n||(M=[]),M.length?N(u,e,o/v.frameRate+1):T=!1};N(u,e,0),T=!0}}function o(e){x||t();var o=e.target,r=l(o);if(!r||e.defaultPrevented||s(w,"embed")||s(o,"embed")&&/\.pdf/i.test(o.src))return!0;var a=e.wheelDeltaX||0,i=e.wheelDeltaY||0;return a||i||(i=e.wheelDelta||0),!v.touchpadSupport&&f(i)?!0:(Math.abs(a)>1.2&&(a*=v.stepSize/120),Math.abs(i)>1.2&&(i*=v.stepSize/120),n(r,-a,-i),void e.preventDefault())}function r(e){var t=e.target,o=e.ctrlKey||e.altKey||e.metaKey||e.shiftKey&&e.keyCode!==H.spacebar;if(/input|textarea|select|embed/i.test(t.nodeName)||t.isContentEditable||e.defaultPrevented||o)return!0;if(s(t,"button")&&e.keyCode===H.spacebar)return!0;var r,a=0,i=0,u=l(w),c=u.clientHeight;switch(u==document.body&&(c=window.innerHeight),e.keyCode){case H.up:i=-v.arrowScroll;break;case H.down:i=v.arrowScroll;break;case H.spacebar:r=e.shiftKey?1:-1,i=-r*c*.9;break;case H.pageup:i=.9*-c;break;case H.pagedown:i=.9*c;break;case H.home:i=-u.scrollTop;break;case H.end:var d=u.scrollHeight-u.scrollTop-c;i=d>0?d+10:0;break;case H.left:a=-v.arrowScroll;break;case H.right:a=v.arrowScroll;break;default:return!0}n(u,a,i),e.preventDefault()}function a(e){w=e.target}function i(e,t){for(var n=e.length;n--;)E[A(e[n])]=t;return t}function l(e){var t=[],n=S.scrollHeight;do{var o=E[A(e)];if(o)return i(t,o);if(t.push(e),n===e.scrollHeight){if(!y||S.clientHeight+10<n)return i(t,document.body)}else if(e.clientHeight+10<e.scrollHeight&&(overflow=getComputedStyle(e,"").getPropertyValue("overflow-y"),"scroll"===overflow||"auto"===overflow))return i(t,e)}while(e=e.parentNode)}function u(e,t,n){window.addEventListener(e,t,n||!1)}function c(e,t,n){window.removeEventListener(e,t,n||!1)}function s(e,t){return(e.nodeName||"").toLowerCase()===t.toLowerCase()}function d(e,t){e=e>0?1:-1,t=t>0?1:-1,(k.x!==e||k.y!==t)&&(k.x=e,k.y=t,M=[],C=0)}function f(e){if(e){e=Math.abs(e),D.push(e),D.shift(),clearTimeout(z);var t=h(D[0],120)&&h(D[1],120)&&h(D[2],120);return!t}}function h(e,t){return Math.floor(e/t)==e/t}function m(e){var t,n,o;return e*=v.pulseScale,1>e?t=e-(1-Math.exp(-e)):(n=Math.exp(-1),e-=1,o=1-Math.exp(-e),t=n+o*(1-n)),t*v.pulseNormalize}function p(e){return e>=1?1:0>=e?0:(1==v.pulseNormalize&&(v.pulseNormalize/=m(1)),m(e))}var w,g={frameRate:150,animationTime:500,stepSize:120,pulseAlgorithm:!0,pulseScale:8,pulseNormalize:1,accelerationDelta:20,accelerationMax:1,keyboardSupport:!0,arrowScroll:50,touchpadSupport:!0,fixedBackground:!0,excluded:""},v=g,b=!1,y=!1,k={x:0,y:0},x=!1,S=document.documentElement,D=[120,120,120],H={left:37,up:38,right:39,down:40,spacebar:32,pageup:33,pagedown:34,end:35,home:36},v=g,M=[],T=!1,C=+new Date,E={};setInterval(function(){E={}},1e4);var z,A=function(){var e=0;return function(t){return t.uniqueID||(t.uniqueID=e++)}}(),N=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(e,t,n){window.setTimeout(e,n||1e3/60)}}(),K=/chrome/i.test(window.navigator.userAgent),L=null;"onwheel"in document.createElement("div")?L="wheel":"onmousewheel"in document.createElement("div")&&(L="mousewheel"),L&&K&&(u(L,o),u("mousedown",a),u("load",t))}();
	}







/***************** Sliders ******************/

	//gallery
	function flexsliderInit(){
		$('.flex-gallery').each(function(){
			
			var $that = $(this);
			
			imagesLoaded($(this),function(instance){
			
				 $that.flexslider({
			        animation: 'fade',
			        smoothHeight: false, 
			        animationSpeed: 500,
			        useCSS: false, 
			        touch: true
			    });
				
				////gallery slider add arrows
				$('.flex-gallery .flex-direction-nav li a.flex-next').html('<i class="icon-angle-right"></i>');
				$('.flex-gallery .flex-direction-nav li a.flex-prev').html('<i class="icon-angle-left"></i>');
			
			});
			
		});
	}
	flexsliderInit();


	function flickityInit() {
		if($('.nectar-flickity:not(.masonry)').length == 0) return false;

		var $flickitySliders = [];

		$('.nectar-flickity:not(.masonry)').each(function(i){

			if($(this).attr('data-controls').length > 0 && $(this).attr('data-controls') == 'next_prev_arrows') {
				var $paginationBool = false;
				var $nextPrevArrowBool = true;
			} else {
				var $paginationBool = true;
				var $nextPrevArrowBool = false;
			}
			var $that = $(this);

			$flickitySliders[i] = $(this).flickity({
			  contain: true,
			  draggable: true,
			  lazyLoad: false,
			  imagesLoaded: true,
			  percentPosition: true,
			  prevNextButtons: $nextPrevArrowBool,
			  pageDots: $paginationBool,
			  resize: true,
			  setGallerySize: true,
			  wrapAround: true,
			  accessibility: false,
			  arrowShape: { 
				     x0: 20,
  x1: 70, y1: 30,
  x2: 70, y2: 25,
  x3: 70
				}
			});

			var $removeHiddenTimeout;

			$flickitySliders[i].on( 'dragStart.flickity', function() {
			   clearTimeout($removeHiddenTimeout);
			   $that.find('.flickity-prev-next-button').addClass('hidden');
			});
			$flickitySliders[i].on( 'dragEnd.flickity', function() {
				$removeHiddenTimeout = setTimeout(function(){
					$that.find('.flickity-prev-next-button').removeClass('hidden');
				},600);
			 
			});

			$('.flickity-prev-next-button').on( 'click', function() {
			   clearTimeout($removeHiddenTimeout);
			   $(this).parents('.nectar-flickity').find('.flickity-prev-next-button').addClass('hidden');
			   $removeHiddenTimeout = setTimeout(function(){
					$that.find('.flickity-prev-next-button').removeClass('hidden');
				},600);
			});

		});

	
	
	}
	setTimeout(flickityInit,100);

	function flickityBlogInit() {
		if($('.nectar-flickity.masonry.not-initialized').length == 0) return false;

		$('.nectar-flickity.masonry.not-initialized').each(function(){

			//move pos for large_featured
			if($(this).parents('article').hasClass('large_featured')) 
				$(this).insertBefore( $(this).parents('article').find('.content-inner') );
			
		});


		$('.nectar-flickity.masonry.not-initialized').flickity({
		  contain: true,
		  draggable: false,
		  lazyLoad: false,
		  imagesLoaded: true,
		  percentPosition: true,
		  prevNextButtons: true,
		  pageDots: false,
		  resize: true,
		  setGallerySize: true,
		  wrapAround: true,
		  accessibility: false

		});

		$('.nectar-flickity.masonry').removeClass('not-initialized');

		//add count
		$('.nectar-flickity.masonry:not(.not-initialized)').each(function(){
			if($(this).find('.item-count').length == 0) {
				$('<div class="item-count"/>').insertBefore($(this).find('.flickity-prev-next-button.next'));
				$(this).find('.item-count').html('<span class="current">1</span>/<span class="total">' + $(this).find('.flickity-slider .cell').length + '</span>');

				$(this).find('.flickity-prev-next-button, .item-count').wrapAll('<div class="control-wrap" />');

				//move pos for wide_tall
				if($(this).parents('article').hasClass('wide_tall')) 
					$(this).find('.control-wrap').insertBefore( $(this) );
			}
		});

		//update count
		$('.masonry .flickity-prev-next-button.previous,  .masonry .flickity-prev-next-button.next').click(function(){
			if($(this).parents('.wide_tall').length > 0) 
				$(this).parent().find('.item-count .current').html($(this).parents('article').find('.nectar-flickity .cell.is-selected').index()+1);
			else 
				$(this).parent().find('.item-count .current').html($(this).parents('.nectar-flickity').find('.cell.is-selected').index()+1);
		});

		$('body').on('mouseover','.flickity-prev-next-button.next',function(){
			$(this).parent().find('.flickity-prev-next-button.previous, .item-count').addClass('next-hovered');
		});
		$('body').on('mouseleave','.flickity-prev-next-button.next',function(){
			$(this).parent().find('.flickity-prev-next-button.previous, .item-count').removeClass('next-hovered');
		});
	
	}
/****************twenty twenty******************/
	$('.twentytwenty-container').each(function(){
		var $that = $(this);
		$(this).imagesLoaded(function(){
			$that.twentytwenty();
		});
	});

/****************full page******************/
$usingFullScreenRows = false;
$fullscreenSelector = '';


if($('#nectar_fullscreen_rows').length > 0 || $().fullpage) {

	function setFPNavColoring(index,direction) {

		if($('#boxed').length > 0 && overallWidth > 750) return;

		if($('#nectar_fullscreen_rows > .wpb_row:nth-child('+index+')').find('.span_12.light').length > 0) {
    		$('#fp-nav').addClass('light-controls');

    		if(direction == 'up')
    			$('#header-outer.dark-slide').removeClass('dark-slide');
    		else
    			setTimeout(function(){ $('#header-outer.dark-slide').removeClass('dark-slide'); },520);
    	} else {
    		$('#fp-nav.light-controls').removeClass('light-controls');

    		if(direction == 'up')
    			$('#header-outer').addClass('dark-slide');
    		else
    			setTimeout(function(){ $('#header-outer').addClass('dark-slide'); },520);
    	}
	}

	var $anchors = [];
	var $names = [];
	
	function setFPNames() {
		$anchors = [];
		$names = [];
		$('#nectar_fullscreen_rows > .wpb_row').each(function(i){
			$id = ($(this).is('[data-fullscreen-anchor-id]')) ? $(this).attr('data-fullscreen-anchor-id') : '';

			//anchor checks
			if($('#nectar_fullscreen_rows[data-anchors="on"]').length > 0) {
				if($id.indexOf('fws_') == -1) $anchors.push($id);
				else $anchors.push('section-'+(i+1));
			}

			//name checks
			if($(this).find('.full-page-inner-wrap[data-name]').length > 0) 
				$names.push($(this).find('.full-page-inner-wrap').attr('data-name'));
			else 
				$names.push(' ');
		});
	}
	setFPNames();

	function initFullPageFooter() {
		var $footerPos = $('#nectar_fullscreen_rows').attr('data-footer');

		if($footerPos == 'default') {
			$('#footer-outer').appendTo('#nectar_fullscreen_rows').addClass('fp-auto-height').addClass('fp-section').addClass('wpb_row').attr('data-anchor',' ').wrapInner('<div class="span_12" />').wrapInner('<div class="container" />').wrapInner('<div class="full-page-inner" />').wrapInner('<div class="full-page-inner-wrap" />').wrapInner('<div class="full-page-inner-wrap-outer" />');
		}
		else if($footerPos == 'last_row') {
			$('#footer-outer').remove();
			$('#nectar_fullscreen_rows > .wpb_row:last-child').attr('id','footer-outer').addClass('fp-auto-height');
		} else {
			$('#footer-outer').remove();
		}
		
	}	

	if($('#nectar_fullscreen_rows').length > 0)
		initFullPageFooter();

	//fullscreen row logic
	function fullscreenRowLogic() {
		$('.full-page-inner-wrap .full-page-inner > .span_12 > .wpb_column').each(function(){
			if($(this).find('> .vc_column-inner > .wpb_wrapper').find('> .wpb_row').length > 0) {

				//add class for css
				$(this).find('> .vc_column-inner > .wpb_wrapper').addClass('only_rows');

				//set number of rows for css
				$rowNum = $(this).find('> .vc_column-inner > .wpb_wrapper').find('> .wpb_row').length;
				$(this).find('> .vc_column-inner > .wpb_wrapper').attr('data-inner-row-num',$rowNum);
			} 

			else if($(this).find('> .column-inner-wrap > .column-inner > .wpb_wrapper').find('> .wpb_row').length > 0) {

				//add class for css
				$(this).find('> .column-inner-wrap > .column-inner > .wpb_wrapper').addClass('only_rows');

				//set number of rows for css
				$rowNum = $(this).find('> .column-inner-wrap > .column-inner > .wpb_wrapper').find('> .wpb_row').length;
				$(this).find('> .column-inner-wrap > .column-inner > .wpb_wrapper').attr('data-inner-row-num',$rowNum);
			}
		});
	}

	fullscreenRowLogic();

	function fullHeightRowOverflow() {
		//handle rows with full height that are larger than viewport
		if($(window).width() >= 1000) {

	    	$('#nectar_fullscreen_rows > .wpb_row .full-page-inner-wrap[data-content-pos="full_height"]').each(function(){

	    		//reset mobile calcs incase user plays with window resize
	    		$(this).find('> .full-page-inner').css('height','100%');

	    		var maxHeight = overallHeight;
	    		var columnPaddingTop = 0;
	    		var columnPaddingBottom = 0;

	    		$(this).find('> .full-page-inner > .span_12 ').css('height','100%');

	    		$(this).find('> .full-page-inner > .span_12 > .wpb_column > .vc_column-inner > .wpb_wrapper').each(function(){
	    			 columnPaddingTop = parseInt($(this).parents('.wpb_column').css('padding-top'));
	    			 columnPaddingBottom = parseInt($(this).parents('.wpb_column').css('padding-bottom'));

	    			 maxHeight = maxHeight > $(this).height() + columnPaddingTop + columnPaddingBottom ? maxHeight : $(this).height() + columnPaddingTop + columnPaddingBottom;
	    		});
	    	
	    		if(maxHeight > overallHeight)
	    			$(this).find('> .full-page-inner > .span_12').height(maxHeight).css('float','none');
	    		
	    	});

	    }

	    else {
	    	//mobile min height set
	    	$('#nectar_fullscreen_rows > .wpb_row').each(function(){
	    		$totalColHeight = 0;
	    		$(this).find('.fp-scrollable > .fp-scroller > .full-page-inner-wrap-outer > .full-page-inner-wrap[data-content-pos="full_height"] > .full-page-inner > .span_12 > .wpb_column').each(function(){
	    			$totalColHeight += $(this).outerHeight(true);
	    		});

	    		$(this).find('.fp-scrollable > .fp-scroller > .full-page-inner-wrap-outer > .full-page-inner-wrap > .full-page-inner').css('height','100%');
	    		if($totalColHeight > $(this).find('.fp-scrollable > .fp-scroller > .full-page-inner-wrap-outer > .full-page-inner-wrap > .full-page-inner').height())
	    			$(this).find('.fp-scrollable  > .fp-scroller > .full-page-inner-wrap-outer > .full-page-inner-wrap > .full-page-inner').height($totalColHeight);
	    	});
	    }

	}

	function fullscreenElementSizing() {
		//nectar slider
		$nsSelector = '.nectar-slider-wrap[data-fullscreen="true"][data-full-width="true"], .nectar-slider-wrap[data-fullscreen="true"][data-full-width="boxed-full-width"]';
		if($('.nectar-slider-wrap[data-fullscreen="true"][data-full-width="true"]').length > 0 || $('.nectar-slider-wrap[data-fullscreen="true"][data-full-width="boxed-full-width"]').length > 0) {
			$($nsSelector).find('.swiper-container').attr('data-height',$('#nectar_fullscreen_rows').height()+1);
	        $(window).trigger('resize.nsSliderContent');

	        $($nsSelector).parents('.full-page-inner').addClass('only-nectar-slider');
	    }
	}


	//kenburns first slide fix
	$('#nectar_fullscreen_rows[data-row-bg-animation="ken_burns"] > .wpb_row:first-child .row-bg.using-image').addClass('kenburns');
	setTimeout(function(){
		//ken burns first slide fix
		$('#nectar_fullscreen_rows[data-row-bg-animation="ken_burns"] > .wpb_row:first-child .row-bg.using-image').removeClass('kenburns');
	},500);

	//remove kenburns from safari
	if(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) $('#nectar_fullscreen_rows[data-row-bg-animation="ken_burns"]').attr('data-row-bg-animation','none');

	var overallHeight = $(window).height();
	var overallWidth = $(window).width();
	var $fpAnimation = $('#nectar_fullscreen_rows').attr('data-animation');
	var $fpAnimationSpeed;
	var $svgResizeTimeout;

	switch($('#nectar_fullscreen_rows').attr('data-animation-speed')) {
		case 'slow':
			$fpAnimationSpeed = 1150;
			break;
		case 'medium':
			$fpAnimationSpeed = 850;
			break;
		case 'fast':
			$fpAnimationSpeed = 650;
			break;
		default:
			$fpAnimationSpeed = 850;
	}

	function initNectarFP() {

		$usingFullScreenRows = true;
		$fullscreenSelector = '.wpb_row.active ';

		$('.container-wrap, .container-wrap .main-content > .row').css({'padding-bottom':'0', 'margin-bottom': '0'});
		$('#nectar_fullscreen_rows').fullpage({
			sectionSelector: '#nectar_fullscreen_rows > .wpb_row',
			navigation: true,
			css3: true,
			scrollingSpeed: $fpAnimationSpeed,
			anchors: $anchors,
			scrollOverflow: true,
			navigationPosition: 'right',
			navigationTooltips: $names,
			afterLoad: function(anchorLink, index, slideAnchor, slideIndex){ 

				if($('#nectar_fullscreen_rows').hasClass('afterLoaded')) {

					//reset slim scroll to top
					$('.wpb_row:not(.last-before-footer):not(:nth-child('+index+')) .fp-scrollable').each(function(){
						$scrollable = $(this).data('iscrollInstance');
						$scrollable.scrollTo(0,0);
					});

					//reset carousel
					$('.wpb_row:not(:nth-child('+index+')) .owl-carousel').trigger('to.owl.carousel',[0]);

					var $row_id = $('#nectar_fullscreen_rows > .wpb_row:nth-child('+index+')').attr('id');

					$('#nectar_fullscreen_rows > .wpb_row').removeClass('transition-out').removeClass('trans');
					

					$('#nectar_fullscreen_rows > .wpb_row:nth-child('+index+')').removeClass('next-current');
					$('#nectar_fullscreen_rows > .wpb_row:nth-child('+index+') .full-page-inner-wrap-outer').css({'height': '100%'});
					$('#nectar_fullscreen_rows > .wpb_row .full-page-inner-wrap-outer').css({'transform':'none'});
					//take care of nav/control coloring
					//setFPNavColoring(index,'na');
					
					//handle waypoints
					if($row_id != 'footer-outer' && $('#nectar_fullscreen_rows > .wpb_row:nth-child('+index+').last-before-footer').length == 0) {
						if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/)) {
							resetWaypoints();
							waypoints();
							Waypoint.destroyAll();
							startMouseParallax();
							portfolioLoadIn();
						}
						responsiveTooltips();
					}

					if($row_id !='footer-outer') {
						$('#nectar_fullscreen_rows > .wpb_row').removeClass('last-before-footer').css('transform','initial');

						//reset animation attrs
						$('#nectar_fullscreen_rows > .wpb_row:not(.active):not(#footer-outer)').css({'transform':'translateY(0)','left':'-9999px', 'transition': 'none', 'opacity':'1', 'will-change':'auto'});
						$('#nectar_fullscreen_rows > .wpb_row:not(#footer-outer)').find('.full-page-inner-wrap-outer').css({'transition': 'none',  'transform':'none', 'will-change':'auto'});
						$('#nectar_fullscreen_rows > .wpb_row:not(#footer-outer)').find('.fp-tableCell').css({'transition': 'none', 'transform':'none', 'will-change':'auto'});
					}
				} else {
					fullHeightRowOverflow();
					overallHeight = $('#nectar_fullscreen_rows').height();
					$('#nectar_fullscreen_rows').addClass('afterLoaded');

					//for users that have scrolled down prior to turning on full page
					setTimeout(function(){ window.scrollTo(0,0); },1800);

					//ken burns first slide fix
					$('#nectar_fullscreen_rows[data-row-bg-animation="ken_burns"] > .wpb_row:first-child .row-bg.using-image').removeClass('kenburns');

					//handle fullscreen elements
	        		fullscreenElementSizing();
				}

				
				$('#nectar_fullscreen_rows').removeClass('nextSectionAllowed');

				
			 },
	        onLeave: function(index, nextIndex, direction){ 
	        	
	        	var $row_id = $('#nectar_fullscreen_rows > .wpb_row:nth-child('+nextIndex+')').attr('id');
	        	var $indexRow = $('#nectar_fullscreen_rows > .wpb_row:nth-child('+index+')');
	        	var $nextIndexRow = $('#nectar_fullscreen_rows > .wpb_row:nth-child('+nextIndex+')');
	        	var $nextIndexRowInner = $nextIndexRow.find('.full-page-inner-wrap-outer');
	        	var $nextIndexRowFpTable = $nextIndexRow.find('.fp-tableCell');
	        	//mobile/safari  fix
	        	var $transformProp = (!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/)) ? 'transform' : 'all'; 
	        	//if(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) $transformProp = 'all';

	        	if( $row_id == 'footer-outer') {
	        		$indexRow.addClass('last-before-footer'); 
	        		$('#footer-outer').css('opacity','1');
	        	} else {
	        		$('#nectar_fullscreen_rows > .wpb_row.last-before-footer').css('transform','translateY(0px)');
	        		$('#footer-outer').css('opacity','0');
	        	}
	        	if($indexRow.attr('id') == 'footer-outer') {
	        		$('#footer-outer').css({'transition': $transformProp+' 460ms cubic-bezier(0.60, 0.23, 0.2, 0.93)', 'backface-visibility': 'hidden'});
	        		$('#footer-outer').css({'transform': 'translateY(45%) translateZ(0)'});
	        	}
	 

	        	//animation
	        	if($nextIndexRow.attr('id') != 'footer-outer' && $indexRow.attr('id') != 'footer-outer' && $('#nectar_fullscreen_rows[data-animation="none"]').length == 0 ) {

	        		//scrolling down
	        		if(direction == 'down') {

	        			if($fpAnimation == 'parallax') {
		        			$indexRow.css({'transition': $transformProp+' '+$fpAnimationSpeed+'ms cubic-bezier(.29,.23,.13,1)', 'will-change':'transform', 'transform':'translateZ(0)' ,'z-index': '100'});
		        			setTimeout(function() { 
		        				$indexRow.css({'transform': 'translateY(-50%) translateZ(0)'});
		        			}, 60);

		        			$nextIndexRow.css({'z-index':'1000','top':'0','left':'0'});
		        			$nextIndexRowFpTable.css({'transform':'translateY(100%) translateZ(0)', 'will-change':'transform'});
		        			$nextIndexRowInner.css({'transform':'translateY(-50%) translateZ(0)', 'will-change':'transform'});
		        			
	        			} else if($fpAnimation == 'zoom-out-parallax') {

	        				$indexRow.css({'transition': 'opacity '+$fpAnimationSpeed+'ms cubic-bezier(0.37, 0.31, 0.2, 0.85), transform '+$fpAnimationSpeed+'ms cubic-bezier(0.37, 0.31, 0.2, 0.85)', 'z-index': '100', 'will-change':'transform'});
		        			setTimeout(function() { 
		        				$indexRow.css({'transform': 'scale(0.77) translateZ(0)', 'opacity': '0'});
		        			}, 60);

		        			$nextIndexRow.css({'z-index':'1000','top':'0','left':'0'});
		        			$nextIndexRowFpTable.css({'transform':'translateY(100%) translateZ(0)', 'will-change':'transform'});
		        			$nextIndexRowInner.css({'transform':'translateY(-50%) translateZ(0)',  'will-change':'transform'});
	        			} 
	        			/*else if($fpAnimation == 'none') {

	        				$indexRow.css({'transition': $transformProp+' '+$fpAnimationSpeed+'ms cubic-bezier(.29,.23,.13,1)', 'z-index': '100'});
	        				$indexRow.css({'will-change':'transform'});

		        			setTimeout(function() { 
		        				$indexRow.css({'transform': 'translateY(-100%) translateZ(0)'});
		        			}, 80);

		        			$nextIndexRowFpTable.css({'transform':'translateY(100%) translateZ(0)', 'will-change':'transform'});
		        			setTimeout(function() { 
		        				$nextIndexRow.css({'z-index':'1000','top':'0','left':'0'});
		        			}, 30);
	        			}*/
	        		}

	        		//scrolling up
	        		else {

	        			if($fpAnimation == 'parallax') {
		        			$indexRow.css({'transition': $transformProp+' '+$fpAnimationSpeed+'ms cubic-bezier(.29,.23,.13,1)', 'z-index': '100', 'will-change':'transform'});
		        			setTimeout(function() { 
		        				$indexRow.css({'transform': 'translateY(50%) translateZ(0)'});
		        			}, 60);

		        			$nextIndexRow.css({'z-index':'1000','top':'0','left':'0'});
		        			$nextIndexRowFpTable.css({'transform':'translateY(-100%) translateZ(0)','will-change':'transform'});
		        			$nextIndexRowInner.css({'transform':'translateY(50%) translateZ(0)','will-change':'transform'});
	        			}

	        			else if($fpAnimation == 'zoom-out-parallax') {
		        			$indexRow.css({'transition': 'opacity '+$fpAnimationSpeed+'ms cubic-bezier(0.37, 0.31, 0.2, 0.85), transform '+$fpAnimationSpeed+'ms cubic-bezier(0.37, 0.31, 0.2, 0.85)', 'z-index': '100', 'will-change':'transform'});
		        			setTimeout(function() { 
		        				$indexRow.css({'transform': 'scale(0.77) translateZ(0)', 'opacity': '0'});
		        			}, 60);

		        			$nextIndexRow.css({'z-index':'1000','top':'0','left':'0'});
		        			$nextIndexRowFpTable.css({'transform':'translateY(-100%) translateZ(0)', 'will-change':'transform'});
		        			$nextIndexRowInner.css({'transform':'translateY(50%) translateZ(0)', 'will-change':'transform'});
	        			} 
	        			/*else if($fpAnimation == 'none') {
		        			$indexRow.css({'transition': $transformProp+' '+$fpAnimationSpeed+'ms cubic-bezier(.29,.23,.13,1)', 'z-index': '100'});
		        			$indexRow.css({'will-change':'transform'});

		        			setTimeout(function() { 
		        				$indexRow.css({'transform': 'translateY(100%) translateZ(0)'});
		        			}, 80);

		        			$nextIndexRowFpTable.css({'transform':'translateY(-100%) translateZ(0)', 'will-change':'transform'});
		        			setTimeout(function() { 
		        				$nextIndexRow.css({'z-index':'1000','top':'0','left':'0'});
		        			}, 30);
	        			}*/
	        			
	        			
	        		}
	        		
	        		setTimeout(function() { 
	    				$nextIndexRowFpTable.css({'transition':$transformProp+' '+$fpAnimationSpeed+'ms cubic-bezier(.29,.23,.13,1) 0ms', 'transform':'translateY(0%) translateZ(0)'});
	    				if($fpAnimation != 'none') $nextIndexRowInner.css({'transition':$transformProp+' '+$fpAnimationSpeed+'ms cubic-bezier(.29,.23,.13,1) 0ms', 'transform':'translateY(0%) translateZ(0)'});
	    			},60);

	        	}

	        	//adjust transform if larger than row height for parallax
	        	if($('#nectar_fullscreen_rows[data-animation="none"]').length == 0 && $nextIndexRow.find('.fp-scrollable').length > 0)
	        		$nextIndexRow.find('.full-page-inner-wrap-outer').css('height',overallHeight);

	        	setTimeout(function() { 
	        		
	        		if( $row_id == 'footer-outer') {

		        		$indexRow.css('transform','translateY(-'+($('#footer-outer').height()-1)+'px)');

		        		$('#footer-outer').css({'transform': 'translateY(45%) translateZ(0)'});
		        		$('#footer-outer').css({'transition-duration': '0s', 'backface-visibility': 'hidden'});
		        		setTimeout(function() { 
		        			$('#footer-outer').css({'transition': $transformProp+' 500ms cubic-bezier(0.60, 0.23, 0.2, 0.93)', 'backface-visibility': 'hidden'});
	        				$('#footer-outer').css({'transform': 'translateY(0%) translateZ(0)'});
	        			},30);
		        	}
	        	},30);

	        	if($row_id!='footer-outer') {
	        		
	        		stopMouseParallax();

	        		//take care of nav/control coloring
	        		setFPNavColoring(nextIndex,direction);
	        	}
	        		
	        },

	        afterResize: function(){
	        	overallHeight = $('#nectar_fullscreen_rows').height();
	        	overallWidth = $(window).width();
	        	fullHeightRowOverflow();
	        	fullscreenElementSizing();
	        	fullscreenFooterCalcs();

	        	if( $('#footer-outer.active').length > 0) {
	        		setTimeout(function(){
	        			$('.last-before-footer').css('transform','translateY(-'+$('#footer-outer').height()+'px)');
	        		},200);
		        } 

		        //fix for svg animations when resizing and iscroll wraps/unwraps
		        clearTimeout($svgResizeTimeout);
		        $svgResizeTimeout = setTimeout(function(){ 

		        	if($svg_icons.length > 0) {
			        	$('.svg-icon-holder.animated-in').each(function(i){
							$(this).css('opacity','1');
							$svg_icons[$(this).attr('id').slice(-1)].finish();
						});
			        }

		         },300);
	        }

		});
	}
	
	if($('#nectar_fullscreen_rows').length > 0)
		initNectarFP();


	$(window).smartresize(function(){
		
		if($('#nectar_fullscreen_rows').length > 0) {
			setTimeout(function(){
				$('.wpb_row:not(.last-before-footer) .fp-scrollable').each(function(){
					$scrollable = $(this).data('iscrollInstance');
					$scrollable.refresh();
				});
			},200);

			fullHeightRowOverflow();

		}
	});

	function fullscreenFooterCalcs() {
		if($('#footer-outer.active').length > 0) {
	    		$('.last-before-footer').addClass('fp-notransition').css('transform','translateY(-'+$('#footer-outer').height()+'px)');
	    		setTimeout(function(){
	    			$('.last-before-footer').removeClass('fp-notransition');
	    		},10);
	    	}
	}



	function stopMouseParallax(){
		$.each($mouseParallaxScenes,function(k,v){
			v.parallax('disable');
		});
	}

	function startMouseParallax(){
		if($('#nectar_fullscreen_rows > .wpb_row.active .nectar-parallax-scene').length > 0) {
			$.each($mouseParallaxScenes,function(k,v){
				v.parallax('enable');
			});
		}
	}

	if($('#nectar_fullscreen_rows').length > 0) {
		if($('#fp-nav.tooltip_alt').length == 0) setFPNavColoring(1,'na');
		fullscreenElementSizing();
	}

	function resetWaypoints() {
		//animated columns / imgs
		$('img.img-with-animation.animated-in:not([data-animation="none"])').css({'transition':'none'});
		$('img.img-with-animation.animated-in:not([data-animation="none"])').css({'opacity':'0','transform':'none'}).removeClass('animated-in');
		$('.col.has-animation.animated-in:not([data-animation*="reveal"]), .wpb_column.has-animation.animated-in:not([data-animation*="reveal"])').css({'transition':'none'});
		$('.col.has-animation.animated-in:not([data-animation*="reveal"]), .wpb_column.has-animation.animated-in:not([data-animation*="reveal"]), .nectar_cascading_images .cascading-image:not([data-animation="none"]) .inner-wrap').css({'opacity':'0','transform':'none','left':'auto','right':'auto'}).removeClass('animated-in');	
		$('.col.has-animation.boxed:not([data-animation*="reveal"]), .wpb_column.has-animation.boxed:not([data-animation*="reveal"])').addClass('no-pointer-events');

		//reveal columns
		$('.wpb_column.has-animation[data-animation*="reveal"], .nectar_cascading_images').removeClass('animated-in');
		if(overallWidth > 1000 && $('.using-mobile-browser').length == 0) {
			$('.wpb_column.has-animation[data-animation="reveal-from-bottom"] > .column-inner-wrap').css({'transition':'none','transform':'translate(0, 100%)'});
			$('.wpb_column.has-animation[data-animation="reveal-from-bottom"] > .column-inner-wrap > .column-inner').css({'transition':'none','transform':'translate(0, -90%)'});
			$('.wpb_column.has-animation[data-animation="reveal-from-top"] > .column-inner-wrap').css({'transition':'none','transform':'translate(0, -100%)'});
			$('.wpb_column.has-animation[data-animation="reveal-from-top"] > .column-inner-wrap > .column-inner').css({'transition':'none','transform':'translate(0, 90%)'});
			$('.wpb_column.has-animation[data-animation="reveal-from-left"] > .column-inner-wrap').css({'transition-duration':'0s','transform':'translate(-100%, 0)'});
			$('.wpb_column.has-animation[data-animation="reveal-from-left"] > .column-inner-wrap > .column-inner').css({'transition-duration':'0s','transform':'translate(90%, 0)'});
			$('.wpb_column.has-animation[data-animation="reveal-from-right"] > .column-inner-wrap').css({'transition-duration':'0s','transform':'translate(100%, 0)'});
			$('.wpb_column.has-animation[data-animation="reveal-from-right"] > .column-inner-wrap > .column-inner').css({'transition-duration':'0s','transform':'translate(-90%, 0)'});
		}
		$('.wpb_column.has-animation[data-animation*="reveal"] > .column-inner-wrap, .wpb_column.has-animation[data-animation*="reveal"] > .column-inner-wrap > .column-inner').removeClass('no-transform');

		//milestone
		$('.nectar-milestone.animated-in').removeClass('animated-in').removeClass('in-sight');
		$('.nectar-milestone .symbol').removeClass('in-sight');

		//fancy ul
		$('.nectar-fancy-ul[data-animation="true"]').removeClass('animated-in');
		$('.nectar-fancy-ul[data-animation="true"] ul li').css({'opacity':'0','left':'-20px'});

		//progress bars
		$('.nectar-progress-bar').parent().removeClass('completed');
		$('.nectar-progress-bar .bar-wrap > span').css({'width':'0px'});
		$('.nectar-progress-bar .bar-wrap > span > strong').css({'opacity':'0'});
		$('.nectar-progress-bar .bar-wrap').css({'opacity':'0'});

		//clients
		$('.clients.fade-in-animation').removeClass('animated-in');
		$('.clients.fade-in-animation > div').css('opacity','0');

		//carousel
		$('.owl-carousel[data-enable-animation="true"]').removeClass('animated-in');
		$('.owl-carousel[data-enable-animation="true"] .owl-stage > .owl-item').css({'transition':'none','opacity':'0','transform':'translate(0, 70px)'});
		//dividers
		$('.divider-small-border[data-animate="yes"], .divider-border[data-animate="yes"]').removeClass('completed').css({'transition':'none','transform':'scale(0,1)'});

		//icon list
		$('.nectar-icon-list').removeClass('completed');
		$('.nectar-icon-list-item').removeClass('animated');

		//portfolio
		$('.portfolio-items .col').removeClass('animated-in');

		//split line
		$('.nectar-split-heading').removeClass('animated-in');
		$('.nectar-split-heading .heading-line > span').transit({'y':'200%'},0);

		//image with hotspots
		$('.nectar_image_with_hotspots[data-animation="true"]').removeClass('completed');
		$('.nectar_image_with_hotspots[data-animation="true"] .nectar_hotspot_wrap').removeClass('animated-in');

		//animated titles
		$('.nectar-animated-title').removeClass('completed');

		if($('.vc_pie_chart').length > 0)
			vc_pieChart();
	}

	

}



/***************** Superfish ******************/
	
	function initSF(){

		$(".sf-menu").superfish({
			 delay: 700,
			 speed: 'fast',
			 speedOut:      'fast',             
			 animation:   {opacity:'show'}
		}); 

	}
	
	var $navLeave;
	
	/*$('header#top nav > ul > li').hover(function(){
		if(!$(this).hasClass('megamenu')){
			
		}
	});*/

	
	function addOrRemoveSF(){
		
		if( window.innerWidth < 1000 && $('body').attr('data-responsive') == '1'){
			$('body').addClass('mobile');
			$('header#top nav').hide();
		}
		
		else {
			$('body').removeClass('mobile');
			$('header#top nav').show();
			$('#mobile-menu').hide();
			$('.slide-out-widget-area-toggle #toggle-nav .lines-button').removeClass('close');
			
			//recalc height of dropdown arrow
			$('.sf-sub-indicator').css('height',$('a.sf-with-ul').height());
		}

		//add specific class if on device for better tablet tracking
		if(navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/)) $('body').addClass('using-mobile-browser');

	}
	
	addOrRemoveSF();
	initSF();
	
	$(window).resize(addOrRemoveSF);

	
	function SFArrows(){

		//set height of dropdown arrow
		$('.sf-sub-indicator').css('height',$('a.sf-with-ul').height());
	}
	
	SFArrows();
	

	//deactivate hhun on phone
	if(navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|BlackBerry|Opera Mini)/))
		$('body').attr('data-hhun','0');


/***************** Caroufredsel ******************/
	
	function standardCarouselInit() {
		$('.carousel:not(".clients")').each(function(){
	    	var $that = $(this); 
	    	var maxCols = ($(this).parents('.carousel-wrap').attr('data-full-width') == 'true') ? 'auto' : 3 ;
	    	var scrollNum = ($(this).parents('.carousel-wrap').attr('data-full-width') == 'true') ? 'auto' : '' ;
	    	var colWidth = ($(this).parents('.carousel-wrap').attr('data-full-width') == 'true') ? 500 : 453 ;
	    	var scrollSpeed, easing;
	    	var $autoplayBool = ($(this).attr('data-autorotate') == 'true') ? true : false;
			
			if($('body.ascend').length > 0 && $(this).parents('.carousel-wrap').attr('data-full-width') != 'true') {
				if($(this).find('li').length % 3 === 0) {
					var $themeSkin = true;
					var $themeSkin2 = true;
				} else {
					var $themeSkin = false;
					var $themeSkin2 = true;
				}
	
			} else {
				var $themeSkin = true;
				var $themeSkin2 = true;
			}

			(parseInt($(this).attr('data-scroll-speed'))) ? scrollSpeed = parseInt($(this).attr('data-scroll-speed')) : scrollSpeed = 700;
			($(this).attr('data-easing').length > 0) ? easing = $(this).attr('data-easing') : easing = 'linear';
			
			
			var $element = $that;
			if($that.find('img').length == 0) $element = $('body');
			
			imagesLoaded($element,function(instance){
	
				
		    	$that.carouFredSel({
		    		circular: $themeSkin,
		    		infinite: $themeSkin2,
		    		height : 'auto',
		    		responsive: true,
			        items       : {
						width : colWidth,
				        visible     : {
				            min         : 1,
				            max         : maxCols
				        }
				    },
				    swipe       : {
				        onTouch     : true,
				        onMouse         : true,
				        options      : {
				        	excludedElements: "button, input, select, textarea, .noSwipe",
				        	tap: function(event, target){ if($(target).attr('href') && !$(target).is('[target="_blank"]') && !$(target).is('[rel^="prettyPhoto"]') && !$(target).is('.magnific-popup') && !$(target).is('.magnific')) window.open($(target).attr('href'), '_self'); }
				        },
				        onBefore : function(){
				    		//hover effect fix
				    		$that.find('.work-item').trigger('mouseleave');
				    		$that.find('.work-item .work-info a').trigger('mouseup');
				    	}
				    },
				    scroll: {
				    	items			: scrollNum,
				    	easing          : easing,
			            duration        : scrollSpeed,
			            onBefore	: function( data ) {
			            	
			            	 if($('body.ascend').length > 0 && $that.parents('.carousel-wrap').attr('data-full-width') != 'true') {
			            	 	$that.parents('.carousel-wrap').find('.item-count .total').html(Math.ceil($that.find('> li').length / $that.triggerHandler("currentVisible").length));

			            	 }	
						},
						onAfter	: function( data ) {
			            	 if($('body.ascend').length > 0 && $that.parents('.carousel-wrap').attr('data-full-width') != 'true') {
			            	 	$that.parents('.carousel-wrap').find('.item-count .current').html( $that.triggerHandler('currentPage') +1);
			            	 	$that.parents('.carousel-wrap').find('.item-count .total').html(Math.ceil($that.find('> li').length / $that.triggerHandler("currentVisible").length));

			            	 }	
						}

				    },
			        prev    : {
				        button  : function() {
				           return $that.parents('.carousel-wrap').find('.carousel-prev');
				        }
			    	},
				    next    : {
			       		button  : function() {
				           return $that.parents('.carousel-wrap').find('.carousel-next');
				        }
				    },
				    auto    : {
				    	play: $autoplayBool
				    }
			    }, { transition: true }).animate({'opacity': 1},1300);
			    
			    $that.parents('.carousel-wrap').wrap('<div class="carousel-outer">');

			    if($that.parents('.carousel-wrap').attr('data-full-width') == 'true') $that.parents('.carousel-outer').css('overflow','visible');

			    //add count for non full width ascend skin
			    if($('body.ascend').length > 0 && $that.parents('.carousel-wrap').attr('data-full-width') != 'true') {
					$('<div class="item-count"><span class="current">1</span>/<span class="total">'+($that.find('> li').length / $that.triggerHandler("currentVisible").length) +'</span></div>').insertAfter($that.parents('.carousel-wrap').find('.carousel-prev'));
				}
			    
			    $that.addClass('finished-loading');

			    carouselHeightCalcs();
			    
			    //reinit panr
			    if(!$('body').hasClass('mobile') && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|Opera Mini)/)) {
					$(".portfolio-items.carousel .work-item.style-3 img").panr({
						scaleDuration: .28
					}); 
					$(".portfolio-items:not(.carousel) .work-item.style-3-alt img").panr({ scaleDuration: .28, sensitivity: 12.6, scaleTo: 1.08, panDuration: 3 }); 
				}
				
			    
		     });//images loaded
		     	     
	    });//each

		
    }
    if($('.carousel').length > 0) standardCarouselInit();


    function owlCarouselInit() {
    	//owl
		$('.owl-carousel').each(function(){
			var $that = $(this);
			var $stagePadding = ($(window).width()<1000) ? 0 : parseInt($(this).attr('data-column-padding'));
			var $autoRotateBool = $that.attr('data-autorotate');
			var $autoRotateSpeed = $that.attr('data-autorotations-peed');

			$(this).owlCarousel({
			      responsive:{
				        0:{
				            items: $(this).attr('data-mobile-cols')
				        },
				        690:{
				            items: $(this).attr('data-tablet-cols')
				        },
				        1000:{
				          items: $(this).attr('data-desktop-small-cols')
				        },
				        1300:{
				            items: $(this).attr('data-desktop-cols')
				        }
				    },
			      /*stagePadding: $stagePadding,*/
			      autoplay: $autoRotateBool,
			      autoplayTimeout: $autoRotateSpeed,
			      onTranslate: function(){
			      	$that.addClass('moving');
			      },
			      onTranslated: function(){
			      	$that.removeClass('moving');
			      }

			  });

			$(this).on('changed.owl.carousel', function (event) {
			    if (event.item.count - event.page.size == event.item.index)
			        $(event.target).find('.owl-dots div:last')
			          .addClass('active').siblings().removeClass('active');
			});	

		});	


    }



	function owl_carousel_animate() {
		$($fullscreenSelector+'.owl-carousel[data-enable-animation="true"]').each(function(){

			$owlOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? '100%' : 'bottom-in-view';

			var $animationDelay = ($(this).is('[data-animation-delay]') && $(this).attr('data-animation-delay').length > 0 && $(this).attr('data-animation') != 'false') ? $(this).attr('data-animation-delay') : 0;

			var $that = $(this);
			var waypoint = new Waypoint({
	 			element: $that,
	 			 handler: function(direction) {

	 			 	if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
					     waypoint.destroy();
					     return;
					}

					setTimeout(function(){
		 			 	$that.find('.owl-stage > .owl-item').each(function(i){
		 			 		var $that = $(this);
							$that.delay(i*200).transition({
								'opacity': '1',
								'y' : '0'
							},600,'easeOutQuart');
						});
						$that.addClass('animated-in');
		 			 },$animationDelay);

					waypoint.destroy();
				},
				offset: $owlOffsetPos

			}); 

		});
	}




    function productCarouselInit() {
		$('.products-carousel').each(function(){
	    	var $that = $(this).find('ul'); 
	    	var maxCols = 'auto';
	    	var scrollNum = 'auto';
	    	var colWidth = ($(this).parents('.full-width-content ').length > 0) ? 400 : 353 ;
			var scrollSpeed = 800;
			var easing = 'easeInOutQuart';
			
			
			var $element = $that;
			if($that.find('img').length == 0) $element = $('body');
			
			//controls on hover
			$(this).append('<a class="carousel-prev" href="#"><i class="icon-salient-left-arrow"></i></a> <a class="carousel-next" href="#"><i class="icon-salient-right-arrow"></i></a>')

			imagesLoaded($element,function(instance){
	
				
		    	$that.carouFredSel({
		    		circular: true,
		    		responsive: true,
			        items       : {
						width : colWidth,
				        visible     : {
				            min         : 1,
				            max         : maxCols
				        }
				    },
				    swipe       : {
				        onTouch     : true,
				        onMouse         : true,
				        options      : {
				        	excludedElements: "button, input, select, textarea, .noSwipe",
				        	tap: function(event, target){ 
				        		if($(target).attr('href') && !$(target).is('[target="_blank"]') && !$(target).hasClass('add_to_wishlist') && !$(target).hasClass('add_to_cart_button') && !$(target).is('[rel^="prettyPhoto"]')) 
				        			window.open($(target).attr('href'), '_self'); 
				        		if($(target).parent().attr('href') && !$(target).parent().is('[target="_blank"]') && !$(target).parent().hasClass('add_to_wishlist') && !$(target).parent().hasClass('add_to_cart_button') && !$(target).parent().is('[rel^="prettyPhoto"]')) 
				        			window.open($(target).parent().attr('href'), '_self'); 
				        	}
				        },
				        onBefore : function(){
				    		//hover effect fix
				    		$that.find('.product-wrap').trigger('mouseleave');
				    		$that.find('.product a').trigger('mouseup');
				    	}
				    },
				    scroll: {
				    	items			: scrollNum,
				    	easing          : easing,
			            duration        : scrollSpeed
				    },
			        prev    : {
				        button  : function() {
				           return $that.parents('.carousel-wrap').find('.carousel-prev');
				        }
			    	},
				    next    : {
			       		button  : function() {
				           return $that.parents('.carousel-wrap').find('.carousel-next');
				        }
				    },
				    auto    : {
				    	play: false
				    }
			    }).animate({'opacity': 1},1300);
			    
			    $that.parents('.carousel-wrap').wrap('<div class="carousel-outer">');
			    
			    $that.addClass('finished-loading');
			    fullWidthContentColumns();
			    $(window).trigger('resize');

		     });//images loaded
		     	     
	    });//each
    }
    if($('.products-carousel').length > 0) productCarouselInit();




    
    //fullwidth carousel swipe link fix
    function fwCarouselLinkFix() {
	    var $mousePosStart = 0;
	    var $mousePosEnd = 0;
	    $('.carousel-wrap .portfolio-items .col .work-item .work-info a, .woocommerce .products-carousel ul.products li.product a').mousedown(function(e){
	    	$mousePosStart = e.clientX;
	    });
	    
	    $('.carousel-wrap .portfolio-items .col .work-item .work-info a, .woocommerce .products-carousel ul.products li.product a').mouseup(function(e){
	    	$mousePosEnd = e.clientX;
	    });
	    
	    $('.carousel-wrap .portfolio-items .col .work-item .work-info a, .woocommerce .products-carousel ul.products li.product a').click(function(e){
	    	if(Math.abs($mousePosStart - $mousePosEnd) > 10)  return false;
	    });
	}
	fwCarouselLinkFix();
    
     
	function carouselHeightCalcs(){
		
		//recent work carousel
		$('.carousel.portfolio-items.finished-loading').each(function(){

			var bottomSpace = ($(this).parents('.carousel-wrap').attr('data-full-width') == 'true' && $(this).find('.style-2, .style-3, .style-4').length > 0) ? 0 : 28 ;
			
			var tallestMeta = 0;
			
			$(this).find('> li').each(function(){
				($(this).find('.work-meta').height() > tallestMeta) ? tallestMeta = $(this).find('.work-meta').height() : tallestMeta = tallestMeta;
			});	
    	 
     		$(this).parents('.caroufredsel_wrapper').css({
     			'height' : ($(this).find('.work-item').outerHeight() + tallestMeta + bottomSpace -2) + 'px'
     		});

     		 if($('body.ascend').length > 0 && $(this).parents('.carousel-wrap').attr('data-full-width') != 'true') {
        	 	$(this).parents('.carousel-wrap').find('.item-count .current').html(Math.ceil(($(this).triggerHandler("currentPosition")+1)/$(this).triggerHandler("currentVisible").length));
        	 	$(this).parents('.carousel-wrap').find('.item-count .total').html(Math.ceil($(this).find('> li').length / $(this).triggerHandler("currentVisible").length));
        	 }	
   	  	});
   	  	
   	  	//standard carousel
   	  	$('.carousel.finished-loading:not(".portfolio-items, .clients"), .caroufredsel_wrapper .products.finished-loading').each(function(){
			
			var tallestColumn = 0;
			
			$(this).find('> li').each(function(){
				($(this).height() > tallestColumn) ? tallestColumn = $(this).height() : tallestColumn = tallestColumn;
			});	

         	$(this).css('height',tallestColumn + 5);
         	$(this).parents('.caroufredsel_wrapper').css('height',tallestColumn + 5);

         	 if($('body.ascend').length > 0 && $(this).parents('.carousel-wrap').attr('data-full-width') != 'true') {
        	 	$(this).parents('.carousel-wrap').find('.item-count .current').html(Math.ceil(($(this).triggerHandler("currentPosition")+1)/$(this).triggerHandler("currentVisible").length));
        	 	$(this).parents('.carousel-wrap').find('.item-count .total').html(Math.ceil($(this).find('> li').length / $(this).triggerHandler("currentVisible").length));
        	 }	
			
   	  	});
   	  	
	}


	function clientsCarouselInit(){
	     $('.carousel.clients').each(function(){
	    	var $that = $(this);
	    	var columns; 
	    	var $autoRotate = (!$(this).hasClass('disable-autorotate')) ? true : false;
	    	(parseInt($(this).attr('data-max'))) ? columns = parseInt($(this).attr('data-max')) : columns = 5;
	    	if($(window).width() < 690 && $('body').attr('data-responsive') == '1') { columns = 2; $(this).addClass('phone') }
	    	
	    	var $element = $that;
			if($that.find('img').length == 0) $element = $('body');
			
			imagesLoaded($element,function(instance){
	    		
		    	$that.carouFredSel({
			    		circular: true,
			    		responsive: true, 
				        items       : {
							
							height : $that.find('> div:first').height(),
							width  : $that.find('> div:first').width(),
					        visible     : {
					            min         : 1,
					            max         : columns
					        }
					    },
					    swipe       : {
					        onTouch     : true,
					        onMouse         : true
					    },
					    scroll: {
					    	items           : 1,
					    	easing          : 'easeInOutCubic',
				            duration        : '800',
				            pauseOnHover    : true
					    },
					    auto    : {
					    	play            : $autoRotate,
					    	timeoutDuration : 2700
					    }
			    }).animate({'opacity': 1},1300);
			    
			    $that.addClass('finished-loading');

			    $that.parents('.carousel-wrap').wrap('<div class="carousel-outer">');
			     

			    $(window).trigger('resize');
			    
		    
		    });
	
	    });
    }
   if($('.carousel').length > 0)  clientsCarouselInit();
    

    function clientsCarouselHeightRecalc(){

    	var tallestImage = 0;
		  			
    	 $('.carousel.clients.finished-loading').each(function(){
    	 	
    	 	$(this).find('> div').each(function(){
				($(this).height() > tallestImage) ? tallestImage = $(this).height() : tallestImage = tallestImage;
			});	
    	 	
         	$(this).css('height',tallestImage);
         	$(this).parent().css('height',tallestImage);
         });
    }


    //carousel grabbing class
    function carouselfGrabbingClass() {
	    $('body').on('mousedown','.caroufredsel_wrapper, .carousel-wrap[data-full-width="true"] .portfolio-items .col .work-item .work-info a, .woocommerce .products-carousel ul.products li.product a',function(){
	    	$(this).addClass('active');
	    });
	    
	    $('body').on('mouseup','.caroufredsel_wrapper, .carousel-wrap[data-full-width="true"] .portfolio-items .col .work-item .work-info a, .woocommerce .products-carousel ul.products li.product a',function(){
	    	$(this).removeClass('active');
	    });
	}
	carouselfGrabbingClass();
	    

	//ascend arrow hover class
	$('body.ascend').on('mouseover','.carousel-next',function(){
		$(this).parent().find('.carousel-prev, .item-count').addClass('next-hovered');
	});
	$('body.ascend').on('mouseleave','.carousel-next',function(){
		$(this).parent().find('.carousel-prev, .item-count').removeClass('next-hovered');
	});

	//fadein for clients / carousels
	function clientsFadeIn() {

		$clientsOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? 100: 'bottom-in-view';
		$($fullscreenSelector+'.clients.fade-in-animation').each(function() {

			var $that = $(this);
			var waypoint = new Waypoint({
 			element: $that,
 			 handler: function(direction) {
				
				if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
					 waypoint.destroy();
					return;
				}

				 $that.find('> div').each(function(i){
					$(this).delay(i*80).transition({'opacity':"1"},450);
				});
				
				
				//add the css transition class back in after the aniamtion is done
				setTimeout(function(){ $that.addClass('completed'); },($that.find('> div').length*80) + 450);
			

				$that.addClass('animated-in');
				waypoint.destroy();
			},
			offset: $clientsOffsetPos

			}); 
		}); 
	}
	 
	//if($('.nectar-box-roll').length == 0) clientsFadeIn();
	
	
/*-------------------------------------------------------------------------*/
/*	2.	Helper Functions
/*-------------------------------------------------------------------------*/

	jQuery.fn.setCursorPosition = function(position){
	    if(this.lengh == 0) return this;
	    return $(this).setSelection(position, position);
	}
	
	jQuery.fn.setSelection = function(selectionStart, selectionEnd) {
	    if(this.lengh == 0) return this;
	    input = this[0];
	
	    if (input.createTextRange) {
	        var range = input.createTextRange();
	        range.collapse(true);
	        range.moveEnd('character', selectionEnd);
	        range.moveStart('character', selectionStart);
	        range.select();
	    } else if (input.setSelectionRange) {
	        input.focus();
	        input.setSelectionRange(selectionStart, selectionEnd);
	    }
	
	    return this;
	}
	
	

	$.extend($.expr[':'], {
	    transparent: function(elem, i, attr){
	      return( $(elem).css("opacity") === "0" );
	    }
	});
	

	function getQueryParams(qs) {
	    qs = qs.split("+").join(" ");
	    var params = {},
	        tokens,
	        re = /[?&]?([^=]+)=([^&]*)/g;

	    while (tokens = re.exec(qs)) {
	        params[decodeURIComponent(tokens[1])]
	            = decodeURIComponent(tokens[2]);
	    }

	    return params;
	}

	var $_GET = getQueryParams(document.location.search);

	
	//count
	$.fn.countTo = function (options) {
		options = options || {};
		
		return $(this).each(function () {
			// set options for current element
			var settings = $.extend({}, $.fn.countTo.defaults, {
				from:            $(this).data('from'),
				to:              $(this).data('to'),
				speed:           $(this).data('speed'),
				refreshInterval: $(this).data('refresh-interval'),
				decimals:        $(this).data('decimals')
			}, options);
			
			// how many times to update the value, and how much to increment the value on each update
			var loops = Math.ceil(settings.speed / settings.refreshInterval),
				increment = (settings.to - settings.from) / loops;
			
			// references & variables that will change with each update
			var self = this,
				$self = $(this),
				loopCount = 0,
				value = settings.from,
				data = $self.data('countTo') || {};
			
			$self.data('countTo', data);
			
			// if an existing interval can be found, clear it first
			if (data.interval) {
				clearInterval(data.interval);
			}
			data.interval = setInterval(updateTimer, settings.refreshInterval);
			
			// initialize the element with the starting value
			render(value);
			
			function updateTimer() {
				value += increment;
				loopCount++;
				
				render(value);
				
				if (typeof(settings.onUpdate) == 'function') {
					settings.onUpdate.call(self, value);
				}
				
				if (loopCount >= loops) {
					// remove the interval
					$self.removeData('countTo');
					clearInterval(data.interval);
					value = settings.to;
					
					if (typeof(settings.onComplete) == 'function') {
						settings.onComplete.call(self, value);
					}
				}
			}
			
			function render(value) {
				var formattedValue = settings.formatter.call(self, value, settings);
				$self.html(formattedValue);
			}
		});
	};
	
	$.fn.countTo.defaults = {
		from: 0,               // the number the element should start at
		to: 0,                 // the number the element should end at
		speed: 1000,           // how long it should take to count between the target numbers
		refreshInterval: 100,  // how often the element should be updated
		decimals: 0,           // the number of decimal places to show
		formatter: formatter,  // handler for formatting the value before rendering
		onUpdate: null,        // callback method for every time the element is updated
		onComplete: null       // callback method for when the element finishes updating
	};
	
	function formatter(value, settings) {
		return value.toFixed(settings.decimals);
	}
	
	
	
	
/*-------------------------------------------------------------------------*/
/*	3.	Shortcode Stuff
/*-------------------------------------------------------------------------*/


/***************** Milestone Counter ******************/
	
	function milestoneInit() {

		$('.nectar-milestone').each(function() {
			
			//symbol
			if($(this).is('[data-symbol]')) {
				if($(this).find('.symbol-wrap').length == 0) {
					if($(this).attr('data-symbol-pos') == 'before') {
						$(this).find('.number').prepend('<div class="symbol-wrap"><span class="symbol">' + $(this).attr('data-symbol') + '</span></div>');
					} else {
						$(this).find('.number').append('<div class="symbol-wrap"><span class="symbol">' + $(this).attr('data-symbol') + '</span></div>');
					}
				}

				$symbol_size = (  $(this).attr('data-symbol-size') == $(this).find('.number').attr('data-number-size') && $(this).attr('data-symbol-alignment') == 'superscript' ) ? 32 :  parseInt($(this).attr('data-symbol-size'));
			
				$(this).find('.symbol-wrap').css({'font-size': $symbol_size + 'px', 'line-height': $symbol_size + 'px'});
			}

			$(this).find('.number').css({'font-size': $(this).find('.number').attr('data-number-size') +'px', 'line-height': $(this).find('.number').attr('data-number-size') + 'px'});
		});
		
		if(!$('body').hasClass('mobile') && $('.nectar-milestone').length > 0) {
			

			//blur effect
			var $blurCssString = '';
			$($fullscreenSelector+'.nectar-milestone.motion_blur').each(function(i){
					
				$(this).addClass('instance-'+i);

				var $currentColor = $(this).find('.number').css('color');
				var colorInt = parseInt($currentColor.substring(1),16);
		   		var R = (colorInt & 0xFF0000) >> 16;
		    	var G = (colorInt & 0x00FF00) >> 8;
		   		var B = (colorInt & 0x0000FF) >> 0;
		   		
		   		var $rgbaColorStart = 'rgba('+R+','+G+','+B+',0.2)';
				var $rgbaColorEnd = 'rgba('+R+','+G+','+B+',1)';
				var $numberSize = parseInt($(this).find('.number').attr('data-number-size'));

				$blurCssString += '@keyframes motion-blur-number-'+i+' { ' +
				   ' 0% { '+
				   		'opacity: 0;'+
						'color: '+$rgbaColorStart+'; '+
   						'text-shadow: 0 '+$numberSize/20+'px 0 '+$rgbaColorStart+', 0 '+$numberSize/10+'px 0 '+$rgbaColorStart+', 0 '+$numberSize/6+'px 0 '+$rgbaColorStart+', 0 '+$numberSize/5+'px 0 '+$rgbaColorStart+', 0 '+$numberSize/4+'px 0 '+$rgbaColorStart+', 0 -'+$numberSize/20+'px 0 '+$rgbaColorStart+', 0 -'+$numberSize/10+'px 0 '+$rgbaColorStart+', 0 -'+$numberSize/6+'px 0 '+$rgbaColorStart+', 0 -'+$numberSize/5+'px 0 '+$rgbaColorStart+', 0 -'+$numberSize/4+'px 0 '+$rgbaColorStart+'; '+
    					'transform: translateZ(0px) translateY(-100%); '+
    					'-webkit-transform: translateZ(0px) translateY(-100%); '+
    				'} '+
    				'33% { opacity: 1 }' +
    				'100% { '+
						'color: '+$rgbaColorEnd+'; '+
   						'text-shadow: none; '+
    					'transform: translateZ(0px) translateY(0px); '+
    					'-webkit-transform: translateZ(0px) translateY(0px); '+
    				'} '+
    			'} '+
    			'@-webkit-keyframes motion-blur-number-'+i+' { ' +
				   ' 0% { '+
				  	    'opacity: 0;'+
						'color: '+$rgbaColorStart+'; '+
   						'text-shadow: 0 '+$numberSize/20+'px 0 '+$rgbaColorStart+', 0 '+$numberSize/10+'px 0 '+$rgbaColorStart+', 0 '+$numberSize/6+'px 0 '+$rgbaColorStart+', 0 '+$numberSize/5+'px 0 '+$rgbaColorStart+', 0 '+$numberSize/4+'px 0 '+$rgbaColorStart+', 0 -'+$numberSize/20+'px 0 '+$rgbaColorStart+', 0 -'+$numberSize/10+'px 0 '+$rgbaColorStart+', 0 -'+$numberSize/6+'px 0 '+$rgbaColorStart+', 0 -'+$numberSize/5+'px 0 '+$rgbaColorStart+', 0 -'+$numberSize/4+'px 0 '+$rgbaColorStart+'; '+
    					'transform: translateZ(0px) translateY(-100%); '+
    					'-webkit-transform: translateZ(0px) translateY(-100%); '+
    				'} '+
    				'33% { opacity: 1 }' +
    				'100% { '+
						'color: '+$rgbaColorEnd+'; '+
   						'text-shadow: none; '+
    					'transform: translateZ(0px) translateY(0px); '+
    					'-webkit-transform: translateZ(0px) translateY(0px); '+
    				'} '+
    			'} '+
    			'.nectar-milestone.motion_blur.instance-'+i+' .number span.in-sight { animation: 0.65s cubic-bezier(0, 0, 0.17, 1) 0s normal backwards 1 motion-blur-number-'+i+'; -webkit-animation: 0.65s cubic-bezier(0, 0, 0.17, 1) 0s normal backwards 1 motion-blur-number-'+i+'; } ';
    			
    			//separate each character into spans
    			$symbol = $(this).find('.symbol-wrap').clone();
    			$(this).find('.symbol-wrap').remove();
    			var characters = $(this).find('.number').text().split("");
    			$this = $(this).find('.number');
				$this.empty();
    			$.each(characters, function (i, el) {
				    $this.append("<span>" + el + "</span");
				});

				//handle symbol
				if($(this).has('[data-symbol]')) {
	    			if($(this).attr('data-symbol-pos') == 'after') {
	    				$this.append($symbol);
	    			} else {
	    				$this.prepend($symbol);
	    			}
	    		}
				
			});

			var head = document.head || document.getElementsByTagName('head')[0];
				var style = document.createElement('style');

				style.type = 'text/css';
			if (style.styleSheet){
			  style.styleSheet.cssText = $blurCssString;
			} else {
			  style.appendChild(document.createTextNode($blurCssString));
			}
			$(style).attr('id','milestone-blur');
			$('head #milestone-blur').remove();
			head.appendChild(style);


			//activate
			milestoneWaypoint();

		}

	}

	function milestoneWaypoint() {
		$($fullscreenSelector+'.nectar-milestone').each(function() {
			//animation
			var $offset = ($(this).hasClass('motion_blur')) ? '90%' : '105%';


			var $that = $(this);
			var waypoint = new Waypoint({
	 			element: $that,
	 			 handler: function(direction) {

	 			 	if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
					     waypoint.destroy();
					     return;
					}

	 			 	var $endNum = parseInt($that.find('.number span:not(.symbol)').text());
					if(!$that.hasClass('motion_blur')) {
						$that.find('.number span:not(.symbol)').countTo({
							from: 0,
							to: $endNum,
							speed: 1500,
							refreshInterval: 30
						});
					} else {
						$that.find('span').each(function(i){
							var $that = $(this);
							setTimeout(function(){ $that.addClass('in-sight'); },200*i);
						});
					}


					$that.addClass('animated-in');
					waypoint.destroy();
				},
				offset: 'bottom-in-view'

			}); 

		}); 
	}

	var $animationOnScrollTimeOut = ($('.nectar-box-roll').length > 0) ? 850: 125;	
	//if($('.nectar-box-roll').length == 0) setTimeout(function(){  milestoneInit(); },125); 
	
/***************** Tabbed ******************/
	
	$tabbedClickCount = 0;
	$('body').on('click','.tabbed > ul li:not(.cta-button) a',function(){
		var $id = $(this).parents('li').index()+1;
		
		if(!$(this).hasClass('active-tab') && !$(this).hasClass('loading')){
			$(this).parents('ul').find('a').removeClass('active-tab');
			$(this).addClass('active-tab');
			
			$(this).parents('.tabbed').find('> div:not(.clear)').css({'visibility':'hidden','position':'absolute','opacity':'0','left':'-9999px','display':'none'});
			$(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').css({'visibility':'visible', 'position' : 'relative','left':'0','display':'block'}).stop().transition({'opacity':1},300);
			
			if($(this).parents('.tabbed').find('> div:nth-of-type('+$id+') .iframe-embed').length > 0 || $(this).parents('.tabbed').find('> div:nth-of-type('+$id+') .portfolio-items').length > 0) setTimeout(function(){ $(window).resize(); },10); 
		}
		
		//waypoint checking
		if($tabbedClickCount != 0) {
			if($(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.nectar-progress-bar').length > 0 ) 
				progressBars();
			if($(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.divider-small-border [data-animate="yes"]').length > 0 || $(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.divider-border [data-animate="yes"]').length > 0 ) 
				dividers();
			if($(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('img.img-with-animation').length > 0 ||
			   $(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.col.has-animation').length > 0  || 
			   $(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.nectar_cascading_images').length > 0  || 
			   $(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.wpb_column.has-animation').length > 0 ) {
				colAndImgAnimations();
				cascadingImageBGSizing();
			}
			if($(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.nectar-milestone').length > 0 ) 
				milestoneWaypoint();
			if($(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.nectar_image_with_hotspots[data-animation="true"]').length > 0 ) 
				imageWithHotspots();
			if($(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.nectar-fancy-ul').length > 0 ) 
				nectar_fancy_ul_init();
			if($(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.nectar-split-heading').length > 0 ) 
				splitLineHeadings();
			if($(this).parents('.wpb_row').length > 0) {
				if($(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.vc_pie_chart').length > 0  ||
				   $(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.wp-video-shortcode').length > 0 ||
				   $(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.twentytwenty-container').length > 0 ||
				   $(this).parents('.wpb_row').next().hasClass('parallax_section'))
					$(window).trigger('resize');

				if($(this).parents('.tabbed').find('> div:nth-of-type('+$id+')').find('.nectar-flickity').length > 0 )
					$('.nectar-flickity:not(.masonry)').flickity('resize');
			}
		}

		//fix columns inside tabs
		$(this).parents('.tabbed').find('.wpb_row').each(function(){
			if(typeof $(this).find('[class*="vc_col-"]').first().offset() != 'undefined') {
				
				var $firstChildOffset = $(this).find('[class*="vc_col-"]').first().offset().left;
				$(this).find('[class*="vc_col-"]').each(function(){
					$(this).removeClass('no-left-margin');
					if($(this).offset().left < $firstChildOffset + 15) { 
						$(this).addClass('no-left-margin');
					} else {
						$(this).removeClass('no-left-margin');
					}
				});
			}
		});

		$tabbedClickCount++;

		return false;
	});
	
	//make sure the tabs don't have a nectar slider - we'll init this after the sliders load in that case
	function tabbedInit(){ 
		$('.tabbed').each(function(){
			if($(this).find('.swiper-container').length == 0 && $(this).find('.testimonial_slider').length == 0 && $(this).find('.portfolio-items:not(".carousel")').length == 0 && $(this).find('.wpb_gallery .portfolio-items').length == 0 && $(this).find('iframe').length == 0){
				$(this).find('> ul li:first-child a').click();
			}	
			if($(this).find('.testimonial_slider').length > 0 || $(this).find('.portfolio-items:not(".carousel")').length > 0 || $(this).find('.wpb_gallery .portfolio-items').length > 0 || $(this).find('iframe').length > 0 ){
				var $that = $(this);
				
				$(this).find('.wpb_tab').show().css({'opacity':0,'height':'1px'});
				$(this).find('> ul li a').addClass('loading');
				
				setTimeout(function(){ 
					$that.find('.wpb_tab').hide().css({'opacity':1,'height':'auto'}); 
					$that.find('> ul li a').removeClass('loading');
					$that.find('> ul li:first-child a').click(); 
				},900);
			}
		});
	}
	tabbedInit();

	//deep linking
	function tabbbedDeepLinking(){
		if(typeof $_GET['tab'] != 'undefined'){
			$('.wpb_tabs_nav').each(function(){

				$(this).find('li').each(function(){
					var $currentText = $(this).find('a').text();
					var $getText = $_GET['tab'];
					var $that = $(this);

					$currentText = $currentText.replace(/\s+/g, '-').toLowerCase();
					$getText = $getText.replace(/\s+/g, '-').replace(/</g, '&lt;').replace(/"/g, '&quot;').toLowerCase();

					if($currentText == $getText)  { 

			          $(this).find('a').click(); 
			           setTimeout(function(){ 
			              $that.find('a').click(); 
			           },901);
			        }
				})
			});
		}
	}
	tabbbedDeepLinking();

/***************** Toggle ******************/
	
	//toggles
	$('body').on('click','.toggle h3 a', function(){
	
		if(!$(this).parents('.toggles').hasClass('accordion')) { 
			$(this).parents('.toggle').find('> div').slideToggle(300);
			$(this).parents('.toggle').toggleClass('open');
			
			//switch icon
			if( $(this).parents('.toggle').hasClass('open') ){
				$(this).find('i').attr('class','icon-minus-sign');
			} else {
				$(this).find('i').attr('class','icon-plus-sign');
			}

			if($(this).parents('.toggle').find('> div .iframe-embed').length > 0 && $(this).parents('.toggle').find('> div .iframe-embed iframe').height() == '0') responsiveVideoIframes();
			if($(this).parents('.full-width-content').length > 0) setTimeout(function(){ fullWidthContentColumns(); },300);
			if($('#nectar_fullscreen_rows').length > 0) setTimeout(function(){ $(window).trigger('smartresize'); },300);
			return false;
		}
	});
	
	//accordion
	$('body').on('click','.accordion .toggle h3 a', function(){
		
		if($(this).parents('.toggle').hasClass('open')) return false;
		
		$(this).parents('.toggles').find('.toggle > div').slideUp(300);
		$(this).parents('.toggles').find('.toggle h3 a i').attr('class','icon-plus-sign');
		$(this).parents('.toggles').find('.toggle').removeClass('open');
		
		$(this).parents('.toggle').find('> div').slideDown(300);
		$(this).parents('.toggle').addClass('open');
		
		//switch icon
		if( $(this).parents('.toggle').hasClass('open') ){
			$(this).find('i').attr('class','icon-minus-sign');
		} else {
			$(this).find('i').attr('class','icon-plus-sign');
		}

		if($(this).parents('.full-width-content').length > 0) { 
			clearTimeout($t);
			var $t = setTimeout(function(){ fullWidthContentColumns(); },400);
		}
		if($('#nectar_fullscreen_rows').length > 0) {
			clearTimeout($t);
			var $t = setTimeout(function(){ $(window).trigger('smartresize'); },400);
		}
		
		return false;
	});
	
	//accordion start open
	function accordionInit(){ 
		$('.accordion').each(function(){
			$(this).find('> .toggle').first().addClass('open').find('> div').show();
			$(this).find('> .toggle').first().find('a i').attr('class','icon-minus-sign');
		});
		
		
		$('.toggles').each(function(){
			
			var $isAccordion = ($(this).hasClass('accordion')) ? true : false;
			
			$(this).find('.toggle').each(function(){
				if($(this).find('> div .testimonial_slider').length > 0 || $(this).find('> div iframe').length > 0) {
					var $that = $(this);
					$(this).find('> div').show().css({'opacity':0,'height':'1px', 'padding':'0'});
					
					testimonialHeightResize();
					
					setTimeout(function(){
						$that.find('> div').hide().css({'opacity':1,'height':'auto', 'padding':'10px 14px'}); 
						if($isAccordion == true && $that.index() == 0) $that.find('> div').slideDown(300);
					},900);
				} 
			});
		})
	}
	accordionInit();

	//deep linking
	function accordionDeepLinking(){
		if(typeof $_GET['toggle'] != 'undefined'){
			$('.toggles').each(function(){

				$(this).find('.toggle').each(function(){
					var $currentText = $(this).find('h3 a').clone();
					var $getText = $_GET['toggle'];

					$($currentText).find('i').remove();
					$currentText = $currentText.text();
					$currentText = $currentText.replace(/\s+/g, '-').toLowerCase();
					$getText = $getText.replace(/\s+/g, '-').replace(/</g, '&lt;').replace(/"/g, '&quot;').toLowerCase();

					if($currentText == $getText) $(this).find('h3 a').click();
				});
			});
		}
	}
	accordionDeepLinking();

/***************** Button ******************/
	
	$.cssHooks.color = {
	    get: function(elem) {
	        if (elem.currentStyle)
	            var color = elem.currentStyle["color"];
	        else if (window.getComputedStyle)
	            var color = document.defaultView.getComputedStyle(elem,
	                null).getPropertyValue("color");
	        if (color.search("rgb") == -1)
	            return color;
	        else {
	            color = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	            function hex(x) {
	                return ("0" + parseInt(x).toString(16)).slice(-2);
	            }
	            if(color) {
	            	return "#" + hex(color[1]) + hex(color[2]) + hex(color[3]);
	            }
	        }
	    }
	}

	$.cssHooks.backgroundColor = {
	    get: function(elem) {
	        if (elem.currentStyle)
	            var bg = elem.currentStyle["backgroundColor"];
	        else if (window.getComputedStyle)
	            var bg = document.defaultView.getComputedStyle(elem,
	                null).getPropertyValue("background-color");
	        if (bg.search("rgb") == -1)
	            return bg;
	        else {
	            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	            function hex(x) {
	                return ("0" + parseInt(x).toString(16)).slice(-2);
	            }
	            if(bg) {
	            	return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
	            }
	        }
	    }
	}
	
	function shadeColor(hex, lum) {

	  // validate hex string
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		}
		lum = lum || 0;

		// convert to decimal and change luminosity
		var rgb = "#", c, i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i*2,2), 16);
			c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
			rgb += ("00"+c).substr(c.length);
		}

		return rgb;
	}

	//color
	function coloredButtons() {
		$('.nectar-button.see-through[data-color-override], .nectar-button.see-through-2[data-color-override], .nectar-button.see-through-3[data-color-override]').each(function(){
			
			$(this).css('visibility','visible');
			
			//if($(this).attr('data-color-override') != 'false'){

				if($(this).attr('data-color-override') != 'false') {
					var $color = $(this).attr('data-color-override') ;
				} else {
					if($(this).parents('.dark').length > 0) 
						var $color = '#000000';
					else 
						var $color = '#ffffff';
				}

				if(!$(this).hasClass('see-through-3')) $(this).css('color',$color);
				$(this).find('i').css('color',$color);
				
				var colorInt = parseInt($color.substring(1),16);
				var $hoverColor = ($(this).has('[data-hover-color-override]')) ? $(this).attr('data-hover-color-override') : 'no-override';
				var $hoverTextColor = ($(this).has('[data-hover-text-color-override]')) ? $(this).attr('data-hover-text-color-override') : '#fff';
				
		   		var R = (colorInt & 0xFF0000) >> 16;
		    	var G = (colorInt & 0x00FF00) >> 8;
		   		var B = (colorInt & 0x0000FF) >> 0;
		   		
		   		$opacityStr = ($(this).hasClass('see-through-3')) ? '1': '0.75';

				$(this).css('border-color','rgba('+R+','+G+','+B+','+$opacityStr+')');
				
				if($(this).hasClass('see-through')) {
					$(this).hover(function(){
						$(this).css('border-color','rgba('+R+','+G+','+B+',1)');
					},function(){
						$(this).css('border-color','rgba('+R+','+G+','+B+','+$opacityStr+')');
					});
				} else {
					
					$(this).find('i').css('color', $hoverTextColor);
					
					if($hoverColor != 'no-override'){
						$(this).hover(function(){
				
							$(this).css({
								'border-color': $hoverColor,
								'background-color': $hoverColor,
								'color': $hoverTextColor
							});
						},function(){
							$opacityStr = ($(this).hasClass('see-through-3')) ? '1': '0.75';

							if(!$(this).hasClass('see-through-3')) {
								$(this).css({
									'border-color':'rgba('+R+','+G+','+B+','+$opacityStr+')',
									'background-color': 'transparent',
									'color': $color
								});
							} else {
								$(this).css({
									'border-color':'rgba('+R+','+G+','+B+','+$opacityStr+')',
									'background-color': 'transparent'
								});
							}
						});
					
					} else {
						$(this).hover(function(){
							$(this).css({
								'border-color': $hoverColor,
								'color': $hoverTextColor
							});
						},function(){
							$opacityStr = ($(this).hasClass('see-through-3')) ? '1': '0.75';
							$(this).css({
								'border-color':'rgba('+R+','+G+','+B+','+$opacityStr+')',
								'color':  $hoverTextColor
							});
						});
					
					}
			//	}
			
			}
		});
		
		$('.nectar-button:not(.see-through):not(.see-through-2):not(.see-through-3)[data-color-override]').each(function(){
			
			$(this).css('visibility','visible');
			
			if($(this).attr('data-color-override') != 'false'){
				
				var $color = $(this).attr('data-color-override');
				$(this).removeClass('accent-color').removeClass('extra-color-1').removeClass('extra-color-2').removeClass('extra-color-3');
				$(this).css('background-color',$color);
				
			}
			
		});


		//solid color tilt 
		if($('.swiper-slide .solid_color_2').length > 0 || $('.tilt-button-inner').length > 0) {

			var $tiltButtonCssString = '';

			$('.swiper-slide .solid_color_2 a').each(function(i){
				
				$(this).addClass('instance-'+i);

				if($(this).attr('data-color-override') != 'false') {
					var $color = $(this).attr('data-color-override');
				} else {
					if($(this).parents('.dark').length > 0) 
						var $color = '#000000';
					else 
						var $color = '#ffffff';
				}

				$(this).css('color',$color);
				$(this).find('i').css('color',$color);
				
				var $currentColor = $(this).css('background-color');
				var $topColor = shadeColor($currentColor, 0.13);
				var $bottomColor = shadeColor($currentColor, -0.15);
	
				$tiltButtonCssString += '.swiper-slide .solid_color_2 a.instance-'+i + ':after { background-color: '+$topColor+';  }' + ' .swiper-slide .solid_color_2 a.instance-'+i + ':before { background-color: '+$bottomColor+'; } ';

			});


			$('.tilt-button-wrap a').each(function(i){
				
				$(this).addClass('instance-'+i);

				var $currentColor = $(this).css('background-color');

				if($(this).attr('data-color-override') != 'false') {
					var $color = $(this).attr('data-color-override');
					$(this).css('background-color',$color);
					$currentColor = $color;
				} 
			
				var $topColor = shadeColor($currentColor, 0.13);
				var $bottomColor = shadeColor($currentColor, -0.15);
	
				$tiltButtonCssString += '.tilt-button-wrap a.instance-'+i + ':after { background-color: '+$topColor+';  }' + ' .tilt-button-wrap a.instance-'+i + ':before { background-color: '+$bottomColor+'; } ';

			});

			var head = document.head || document.getElementsByTagName('head')[0];
   			var style = document.createElement('style');

   			style.type = 'text/css';
			if (style.styleSheet){
			  style.styleSheet.cssText = $tiltButtonCssString;
			} else {
			  style.appendChild(document.createTextNode($tiltButtonCssString));
			}

			head.appendChild(style);
		}


		//transparent 3d
		if($('.nectar-3d-transparent-button').length > 0) {

			var $3dTransButtonCssString = '';
			$('.nectar-3d-transparent-button').each(function(i){

				var $that = $(this);
				var $size = $that.attr('data-size');
				var $padding = 0;

		

				//size

				if($size == 'large') {
					$padding = 46;
					$font_size = 16;
				} else if($size == 'medium') {
					$padding = 30;
					$font_size = 16;
				} else if($size == 'small') {
					$padding = 20;
					$font_size = 12;
				} else if($size == 'jumbo') {
					$padding = 54;
					$font_size = 24;
				} else if($size == 'extra_jumbo') {
					$padding = 100;
					$font_size = 64;
				}

				$that.find('svg text').attr('font-size',$font_size);
				$boundingRect = $(this).find('.back-3d .button-text')[0].getBoundingClientRect();

				$text_width = $boundingRect.width;
				$text_height = $font_size*1.5;

				$extraMult = (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) ? 0 : 1;

				$that.css({'width': ($text_width+$padding*1.5)+'px','height': ($text_height+$padding)+'px'});
				$that.find('> a').css({'height': ($text_height+$padding)+'px'});

				$that.find('.back-3d svg, .front-3d svg').css({'width': ($text_width+$padding*1.5)+'px','height': ($text_height+$padding)+'px'}).attr('viewBox','0 0 '+ ($text_width+$padding) + ' ' + ($text_height+$padding));
				if($size == 'jumbo')
					$that.find('svg text').attr('transform','matrix(1 0 0 1 '+($text_width+$padding*1.5)/2 +' ' + (($text_height+$padding) / 1.68) +')');
				else if($size == 'extra_jumbo')
					$that.find('svg text').attr('transform','matrix(1 0 0 1 '+($text_width+$padding*1.6)/2 +' ' + (($text_height+$padding) / 1.6) +')');
				else if($size == 'large') {
					$that.find('svg text').attr('transform','matrix(1 0 0 1 '+($text_width+$padding*1.5)/2 +' ' + (($text_height+$padding) / 1.7) +')');
				}
				else {
					$that.find('svg text').attr('transform','matrix(1 0 0 1 '+($text_width+$padding*1.5)/2 +' ' + (($text_height+$padding) / 1.65) +')');
				}
				$that.find('.front-3d ').css('transform-origin','50% 50% -'+($text_height+$padding)/2+'px');
				$that.find('.back-3d').css('transform-origin','50% 50% -'+($text_height+$padding)/2+'px');

				//mask
				$(this).find('.front-3d svg > rect').attr('id','masked-rect-id-'+i);
				$(this).find('.front-3d defs mask').attr('id','button-text-mask-'+i);

				$that.css('visibility','visible');
				$3dTransButtonCssString+= '#masked-rect-id-'+i+' { mask: url(#button-text-mask-'+i+'); -webkit-mask: url(#button-text-mask-'+i+')} ';

			});

			//extra jumbo resize
			function createExtraJumboSize() {
				$('.nectar-3d-transparent-button').each(function(i){
					
					if($(this).css('visibility') != 'visible') return;

					var $that = $(this);
					var $size = $that.attr('data-size');
					if($size == 'extra_jumbo') {

						$extraMult = (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) ? 0 : 1;

						if(window.innerWidth < 1000 && window.innerWidth > 690) {
							$padding = 64;
							$font_size = 34;
							$that.find('.back-3d rect').attr('stroke-width','12');
							$vert_height_divider = 1.7;
						} else if(window.innerWidth <= 690 ) {
							$padding = 46;
							$font_size = 16;
							$that.find('.back-3d rect').attr('stroke-width','10');
							$vert_height_divider = 1.7;
						}  else {
							$padding = 100;
							$font_size = 64;
							$that.find('.back-3d rect').attr('stroke-width','20');
							$vert_height_divider = 1.6;
						}
			

						$that.find('svg text').attr('font-size',$font_size);

						$boundingRect = $(this).find('.back-3d .button-text')[0].getBoundingClientRect();
						$text_width = $boundingRect.width;
						$text_height = $font_size*1.5;

						$that.css({'width': ($text_width+$padding*1.5)+'px','height': ($text_height+$padding)+'px'});
						$that.find('> a').css({'height': ($text_height+$padding)+'px'});

						$that.find('.back-3d svg, .front-3d svg').css({'width': ($text_width+$padding*1.5)+'px','height': ($text_height+$padding)+'px'}).attr('viewBox','0 0 '+ ($text_width+$padding) + ' ' + ($text_height+$padding));

						$that.find('svg text').attr('transform','matrix(1 0 0 1 '+($text_width+$padding*1.6)/2 +' ' + (($text_height+$padding) / $vert_height_divider) +')');

						$that.find('.front-3d ').css('transform-origin','50% 50% -'+($text_height+$padding)/2+'px');
						$that.find('.back-3d').css('transform-origin','50% 50% -'+($text_height+$padding)/2+'px');

					}
				});
			}
			createExtraJumboSize();
			$(window).on('smartresize',createExtraJumboSize);

			var head = document.head || document.getElementsByTagName('head')[0];
				var style = document.createElement('style');

				style.type = 'text/css';
			if (style.styleSheet){
			  style.styleSheet.cssText = $3dTransButtonCssString;
			} else {
			  style.appendChild(document.createTextNode($3dTransButtonCssString));
			}

			head.appendChild(style);
		}

		//gradient btn init
		setTimeout(function(){
			$('.nectar-button.extra-color-gradient-1 .start, .nectar-button.extra-color-gradient-2 .start, .nectar-button.see-through-extra-color-gradient-1 .start, .nectar-button.see-through-extra-color-gradient-2 .start').removeClass('loading');
		},150);
		//no grad for ff
		if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1 || navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.match(/Trident\/7\./)) {
			$('.nectar-button.extra-color-gradient-1, .nectar-button.extra-color-gradient-2, .nectar-button.see-through-extra-color-gradient-1, .nectar-button.see-through-extra-color-gradient-2').addClass('no-text-grad');
		}
	}	

	coloredButtons();


	//large icon hover
	function largeIconHover(){
		$('.icon-3x').each(function(){
			$(this).closest('.col').hover(function(){
				$(this).find('.icon-3x').addClass('hovered')
			},function(){
				$('.icon-3x').removeClass('hovered')
			});
		});

		//remove gradient from FF
		if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1 || navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.match(/Trident\/7\./))
			$('[class^="icon-"].extra-color-gradient-1, [class^="icon-"].extra-color-gradient-2, [class^="icon-"][data-color="extra-color-gradient-1"], [class^="icon-"][data-color="extra-color-gradient-2"], .nectar-gradient-text').addClass('no-grad');
	}
	largeIconHover();



/***************** Column Hover BG ******************/

function columnBGColors() {	
	
	var $columnColorCSS = '';

	$('.wpb_column').each(function(i){

		$(this).addClass('instance-'+i);

		//bg color
		if($(this).attr('data-has-bg-color') == 'true') {
			if($(this).is('[data-animation*="reveal"]') && $(this).hasClass('has-animation')) 
				$columnColorCSS += '.wpb_column.instance-'+i+ ' .column-inner-wrap .column-inner:before { background-color:' + $(this).attr('data-bg-color') + ';  opacity: '+$(this).attr('data-bg-opacity')+'; }';
			else 
				$columnColorCSS += '.wpb_column.instance-'+i+ ':before { background-color:' + $(this).attr('data-bg-color') + ';  opacity: '+$(this).attr('data-bg-opacity')+'; }';
		}

		//hover bg color
		if($(this).is('[data-hover-bg^="#"]')) {
			if($(this).is('[data-animation*="reveal"]') && $(this).hasClass('has-animation')) 
				$columnColorCSS += '.wpb_column.instance-'+i+ ':hover .column-inner:before { background-color: '+$(this).attr('data-hover-bg') + '; opacity: '+$(this).attr('data-hover-bg-opacity')+'; }';
			else 
	   			$columnColorCSS += '.wpb_column.instance-'+i+ ':hover:before { background-color: '+$(this).attr('data-hover-bg') + '; opacity: '+$(this).attr('data-hover-bg-opacity')+'; }';

		}
	});

	if($columnColorCSS.length > 1) {
		var head = document.head || document.getElementsByTagName('head')[0];
		var style = document.createElement('style');

		style.type = 'text/css';
		if (style.styleSheet){
		  style.styleSheet.cssText = $columnColorCSS;
		} else {
		  style.appendChild(document.createTextNode($columnColorCSS));
		}

		head.appendChild(style);
	}

}
columnBGColors();



/***************** Row Color Overlay ******************/
function rowColorOverlay() {	
	
	var $rowOverlayCSS = '';

	$('.row > .wpb_row > .row-bg-wrap > .row-bg[data-color_overlay],  #nectar_fullscreen_rows .full-page-inner-wrap > .full-page-inner > .row-bg-wrap > .row-bg[data-color_overlay], #portfolio-extra > .wpb_row > .row-bg-wrap > .row-bg[data-color_overlay], .single #post-area .content-inner > .wpb_row > .row-bg-wrap > .row-bg[data-color_overlay]').each(function(i){

		$(this).parent().addClass('instance-'+i);

		$overlayOpacity = ($(this).attr('data-overlay_strength').length > 0) ? $(this).attr('data-overlay_strength') : '1';
		$overlay1 = ($(this).attr('data-color_overlay').length > 0) ? $(this).attr('data-color_overlay') : 'transparent';
		$overlay2 = ($(this).attr('data-color_overlay_2').length > 0) ? $(this).attr('data-color_overlay_2') : 'transparent';
		$gradientDirection = ($(this).attr('data-gradient_direction').length > 0) ? $(this).attr('data-gradient_direction') : 'left_t_right';
		switch($gradientDirection) {
			case 'left_to_right' : 
				var $gradientDirectionDeg = '90deg';
				break;
			case 'left_t_to_right_b' : 
				var $gradientDirectionDeg = '135deg';
				break;
			case 'left_b_to_right_t' : 
				var $gradientDirectionDeg = '45deg';
				break;
			case 'top_to_bottom' : 
				var $gradientDirectionDeg = 'to bottom';
				break;
		} 
		$enableGradient = ($(this).attr('data-enable_gradient') == 'true') ? true : false;

		if($enableGradient) {
			
			//safari transparent white fix
			if($overlay1 == '#ffffff' && $overlay2 == 'transparent') $overlay2 = 'rgba(255,255,255,0.001)';
			if($overlay1 == 'transparent' && $overlay2 == '#ffffff') $overlay1 = 'rgba(255,255,255,0.001)';
			
			if($gradientDirection == 'top_to_bottom') {
				if($overlay2 == 'transparent' || $overlay2 == 'rgba(255,255,255,0.001)') $rowOverlayCSS += '.row-bg-wrap.instance-'+i+ ':after { background: linear-gradient('+$gradientDirectionDeg+',' + $overlay1 + ' 0%,' + $overlay2 + ' 75%);  opacity: '+$overlayOpacity+'; }';
				if($overlay1 == 'transparent' || $overlay1 == 'rgba(255,255,255,0.001)') $rowOverlayCSS += '.row-bg-wrap.instance-'+i+ ':after { background: linear-gradient('+$gradientDirectionDeg+',' + $overlay1 + ' 25%,' + $overlay2 + ' 100%);  opacity: '+$overlayOpacity+'; }';
				
				if( $overlay1 != 'transparent' && $overlay2 != 'transparent') $rowOverlayCSS += '.row-bg-wrap.instance-'+i+ ':after {  background: '+$overlay1+'; background: linear-gradient('+$gradientDirectionDeg+',' + $overlay1 + ' 0%,' + $overlay2 + ' 100%);  opacity: '+$overlayOpacity+'; }';
			
			} else
				$rowOverlayCSS += '.row-bg-wrap.instance-'+i+ ':after { background: '+$overlay1+'; background: linear-gradient('+$gradientDirectionDeg+',' + $overlay1 + ' 0%,' + $overlay2 + ' 100%);  opacity: '+$overlayOpacity+'; }';


		} else {

			if($(this).attr('data-color_overlay').length > 0) {
				$rowOverlayCSS += '.row-bg-wrap.instance-'+i+ ':after { background-color:' + $overlay1 + ';  opacity: '+$overlayOpacity+'; }';
			}

		}
	


	});
	
	if($rowOverlayCSS.length > 1) {
		var head = document.head || document.getElementsByTagName('head')[0];
		var style = document.createElement('style');

		style.type = 'text/css';
		if (style.styleSheet){
		  style.styleSheet.cssText = $rowOverlayCSS;
		} else {
		  style.appendChild(document.createTextNode($rowOverlayCSS));
		}

		head.appendChild(style);
	}

}

rowColorOverlay();


/***************** morphing button ******************/

function morphingOutlines() {

	if($('.morphing-outline').length > 0) {

		$morphingOutlineCSS = '';

		$('.morphing-outline').each(function(i){
			$(this).addClass('instance-'+i).css({'visibility':'visible'});
			var $width = $(this).find('.inner').width();
			var $height = $(this).find('.inner').height();
			var $border = parseInt($(this).attr("data-border-thickness"));
			var $hover = ($('body[data-button-style="rounded"]').length > 0) ? ':hover': '';
			var $hover2 = ($('body[data-button-style="rounded"]').length > 0) ? '': ':hover';

			$morphingOutlineCSS += 'body .morphing-outline.instance-'+i+' .inner > * { color: '+$(this).attr("data-starting-color")+'; } ';
			$morphingOutlineCSS += 'body .morphing-outline.instance-'+i+' .inner:after  { border-width:'+$(this).attr("data-border-thickness")+'px ; border-color: '+$(this).attr("data-starting-color")+'; } ';
			
			$morphingOutlineCSS += 'body .wpb_column:hover > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner > *, body .wpb_column:hover > .vc_column-inner > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner > * { color: '+$(this).attr("data-hover-color")+'; } ';
			$morphingOutlineCSS += 'body .wpb_column:hover > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after, body .wpb_column:hover > .vc_column-inner > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after  { border-color: '+$(this).attr("data-hover-color")+'; } ';
			//padding calcs
			$morphingOutlineCSS += 'body .wpb_column'+$hover2+' > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after, body .wpb_column'+$hover2+' > .vc_column-inner > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after { padding: '+(($width+100 + $border*2 - $height)/2 - $border) +'px 50px}';
			$morphingOutlineCSS += '.morphing-outline.instance-'+i+' { padding: '+(30+($width+80 + $border*2 - $height)/2 - $border) +'px 50px}'; //extra space on the outer for mobile/close elements
			$morphingOutlineCSS += 'body .wpb_column'+$hover2+' > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after, body .wpb_column'+$hover2+' > .vc_column-inner > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after { top: -'+ parseInt((($width+100 + $border*2 - $height)/2 - $border) + $border)+ 'px }';

			$morphingOutlineCSS += 'body .wpb_column > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after, body .wpb_column > .vc_column-inner > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after { left: -' + parseInt(50+$border) + 'px }';
			////hover
			$morphingOutlineCSS += 'body .wpb_column'+$hover+' > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after, body .wpb_column'+$hover+' > .vc_column-inner > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after { padding: 50px 50px}';
			$morphingOutlineCSS += 'body .wpb_column'+$hover+' > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after, body .wpb_column'+$hover+' > .vc_column-inner > .wpb_wrapper > .morphing-outline.instance-'+i+' .inner:after { top: -'+parseInt(50+$border) +'px }';

		});

		var head = document.head || document.getElementsByTagName('head')[0];
		var style = document.createElement('style');

		style.type = 'text/css';
		style.id = 'morphing-outlines';
		if (style.styleSheet){
		  style.styleSheet.cssText = $morphingOutlineCSS;
		} else {
		  style.appendChild(document.createTextNode($morphingOutlineCSS));
		}

		$('#morphing-outlines').remove();
		head.appendChild(style);
	}
}

setTimeout(morphingOutlines,100); 
setTimeout(fullWidthContentColumns,126);


/***************** svg icons *******************/

var $svg_icons = [];
function svgAnimations() {
	
	$svgOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? '200%' : 'bottom-in-view';

	if($svg_icons.length == 0) {

		$('.svg-icon-holder:not(.animated-in)').each(function(i){
			var $that = $(this);

			if(navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|BlackBerry|Opera Mini)/)) $that.attr('data-animation','false');

			//size
			$that.css({'height': parseInt($that.attr('data-size')) +'px', 'width': parseInt($that.attr('data-size')) +'px'});

			//animation
			$(this).attr('id','nectar-svg-animation-instance-'+i);
			var $animationSpeed = ($that.is('[data-animation-speed]') && $that.attr('data-animation-speed').length > 0) ? $that.attr('data-animation-speed') : 200;
			if($that.attr('data-animation') == 'false') { 
				$animationSpeed = 1;
				$that.css('opacity','1');
			}

			if(!$that.hasClass('bound'))
				$svg_icons[i] = new Vivus($that.attr('id'), {type: 'delayed', pathTimingFunction: Vivus.EASE_OUT, animTimingFunction: Vivus.LINEAR, duration: $animationSpeed, file: $that.text(), onReady: svgInit });
			
			$that.find('span').remove();
			if($animationSpeed !== 1) {

				var $that = $(this);
				var waypoint = new Waypoint({
		 			element: $that,
		 			 handler: function(direction) {
		 			 	if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
						     waypoint.destroy();
						     return;
						}

		 			 	checkIfReady();
						$that.addClass('animated-in');
						waypoint.destroy();
					},
					offset: $svgOffsetPos

				}); 

			} else {
				checkIfReady();
			}

			function checkIfReady() {
				var $animationDelay = ($that.is('[data-animation-delay]') && $that.attr('data-animation-delay').length > 0 && $that.attr('data-animation') != 'false') ? $that.attr('data-animation-delay') : 0;
				if($svg_icons[$that.attr('id').slice(-1)].isReady == true) {
					$that.css('opacity','1');
					 setTimeout(function(){ $svg_icons[$that.attr('id').slice(-1)].reset().play(); },$animationDelay);
				} else {
					setTimeout(checkIfReady,50);
				}
			}

			function svgInit() {

				//set size
				$that.find('object').css({'height': parseInt($that.attr('data-size')) +'px', 'width': parseInt($that.attr('data-size')) +'px'});

				//stop animation until user scrolls to it
				$svg_icons[$that.attr('id').slice(-1)].reset().stop();

				//set color
				var svgDoc = $that.find('object')[0].contentDocument;

				var styleElement = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
				styleElement.textContent = "svg, svg path { stroke: "+$that.css('color')+"; fill: none; }"; 
				svgDoc.getElementById("Layer_1").appendChild(styleElement);

			}

			$that.addClass('bound');

		});	
	} else {
		$('.svg-icon-holder').addClass('animated-in').css('opacity','1');
	}
	
	//full vc row support
	$('.svg-icon-holder.animated-in').each(function(i){
		
		var $animationDelay = ($(this).is('[data-animation-delay]') && $(this).attr('data-animation-delay').length > 0 && $(this).attr('data-animation') != 'false') ? $(this).attr('data-animation-delay') : 0;
		var $that = $(this);

		if($that.attr('data-animation') == 'false') { 
			$animationSpeed = 1;
			$that.css('opacity','1');
			$svg_icons[$that.attr('id').slice(-1)].finish();
		} else {
			if($(this).parents('.active').length > 0 || $(this).parents('#footer-outer').length > 0 || $('body.mobile').length > 0) {
				$svg_icons[$that.attr('id').slice(-1)].reset();
				setTimeout(function(){ $svg_icons[$that.attr('id').slice(-1)].play(); },$animationDelay);
			}

			else {
				$svg_icons[$(this).attr('id').slice(-1)].reset().stop();
			}
		}
	});
}
//if($('.nectar-box-roll').length == 0 || $('body.mobile').length > 0) setTimeout(svgAnimations,100);

/***************** fancy ul ******************/

	function nectar_fancy_ul_init() {
		$($fullscreenSelector+'.nectar-fancy-ul').each(function(){


			var $icon = $(this).attr('data-list-icon');
			var $color = $(this).attr('data-color');
			var $animation = $(this).attr('data-animation');
			var $animationDelay = ($(this).is('[data-animation-delay]') && $(this).attr('data-animation-delay').length > 0 && $(this).attr('data-animation') != 'false') ? $(this).attr('data-animation-delay') : 0;
			
			$(this).find('li').each(function(){
				
				if($(this).find('> i').length == 0) 
					$(this).prepend('<i class="icon-default-style '+$icon+ ' ' + $color +'"></i> ');
			});

			
			if($animation == 'true') {


				var $that = $(this);
				var waypoint = new Waypoint({
		 			element: $that,
		 			 handler: function(direction) {

		 			 	if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
						     waypoint.destroy();
						     return;
						}

						setTimeout(function(){
			 			 	$that.find('li').each(function(i){
			 			 		var $that = $(this);
								$that.delay(i*220).transition({
									'opacity': '1',
									'left' : '0'
								},220,'easeOutCubic');
							});
			 			 },$animationDelay);

						$that.addClass('animated-in');
						waypoint.destroy();
					},
					offset: 'bottom-in-view'

				}); 

			} 
			
			
			
		});
	}
	setTimeout(function(){ 
		//if($('.nectar-box-roll').length == 0) nectar_fancy_ul_init();
	},$animationOnScrollTimeOut); 

	

/***************** flip box min heights ******************/
//if content height exceeds min height change it
function flipBoxHeights() {
	$('.nectar-flip-box').each(function(){
		
		var $flipBoxMinHeight = parseInt($(this).attr('data-min-height'));
		var $flipBoxHeight = ( $(this).find('.flip-box-back .inner').height() > $(this).find('.flip-box-front .inner').height() ) ? $(this).find('.flip-box-back .inner').height() : $(this).find('.flip-box-front .inner').height();

		if($flipBoxHeight >= $flipBoxMinHeight - 80) {
			$(this).find('> div').css('height', $flipBoxHeight + 80);
		} else 
			$(this).find('> div').css('height','auto');

	});
}
flipBoxHeights();

if(navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|BlackBerry|Opera Mini)/)){
	$('.nectar-flip-box').on('click',function(){
		$(this).toggleClass('flipped');
	});
}

/***************** PARALLAX SECTIONS ******************/
	
	// Create cross browser requestAnimationFrame method:
    window.requestAnimationFrame = window.requestAnimationFrame
     || window.mozRequestAnimationFrame
     || window.webkitRequestAnimationFrame
     || window.msRequestAnimationFrame
     || function(f){setTimeout(f, 1000/60)}


	var $window = $(window);
	var windowHeight = $window.height();
	
	$window.unbind('scroll.parallaxSections').unbind('resize.parallaxSections');
	$window.unbind('resize.parallaxSectionsUpdateHeight');
	$window.unbind('load.parallaxSectionsOffsetL');
	$window.unbind('resize.parallaxSectionsOffsetR');

	$window.on('resize.parallaxSectionsUpdateHeight',psUpdateWindowHeight);

	function psUpdateWindowHeight() {
		windowHeight = $window.height();
	}

	function psUpdateOffset($this) {
		$this.each(function(){
	  	    firstTop = $this.offset().top;
		});
	}
	
	$.fn.parallaxScroll = function(xpos, speedFactor, outerHeight) {
		var $this = $(this);
		var getHeight;
		var firstTop;
		var paddingTop = 0;
		
		//get the starting position of each element to have parallax applied to it		
		$this.each(function(){
		    firstTop = $this.offset().top;
		});
		
		
		$window.on('resize.parallaxSectionsOffsetR',psUpdateOffset($this));
		$window.on('load.parallaxSectionsOffsetL',psUpdateOffset($this));
	
		getHeight = function(jqo) {
			return jqo.outerHeight(true);
		};
		 
			
		// setup defaults if arguments aren't specified
		if (arguments.length < 1 || xpos === null) xpos = "50%";
		if (arguments.length < 2 || speedFactor === null) speedFactor = 0.1;
		if (arguments.length < 3 || outerHeight === null) outerHeight = true;
		
		// function to be called whenever the window is scrolled or resized

		var $element, top, height, pos;

		function update(){

			pos = $window.scrollTop();				
			
			$this.each(function(){

				firstTop = $this.offset().top;

				$element = $(this);
				top = $element.offset().top;
				height = getHeight($element);

				// Check if totally above or totally below viewport
				if (top + height < pos || top > pos + windowHeight) {
					return;
				}

				var ua = window.navigator.userAgent;
		        var msie = ua.indexOf("MSIE ");

		        //for IE, Safari or any setup using the styled scrollbar default to animating the BG pos
		        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./) || $smoothCache == true || navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
		        	$this.find('.row-bg.using-image').css('backgroundPosition', xpos + " " + Math.round((firstTop - pos) * speedFactor) + "px");
		        }
		       	//for Firefox/Chrome use a higher performing method
		        else  {
		        	var $ifFast = ($this.find('.row-bg[data-parallax-speed="fast"]').length > 0) ? ($element.find('.row-bg').height() - height)/2 : 0;
		        	$this.find('.row-bg.using-image').addClass('translate').css({ 'transform':  'translate3d(0, ' + Math.round(((window.innerHeight + pos -  firstTop) * speedFactor) -($ifFast)) + 'px, 0), scale(1.005)' });
		        }              
				
			});
		}		

		if (window.addEventListener) {
			 window.addEventListener('scroll', function(){ 
	          requestAnimationFrame(update); 
	        }, false);
		}

		$window.on('resize.parallaxSections',update);

		update();
	};



	
/***************** Full Width Section ******************/
	function fullWidthSections(){
		
		var $scrollBar = ($('#ascrail2000').length > 0 && window.innerWidth > 1000) ? -13 : 4;
			 
		if($('#boxed').length == 1){
			$justOutOfSight = ((parseInt($('.container-wrap').width()) - parseInt($('.main-content').width())) / 2) + 4;
		} else {
			
			//if the ext responsive mode is on - add the extra padding into the calcs
			var $extResponsivePadding = ($('body[data-ext-responsive="true"]').length > 0 && window.innerWidth >= 1000) ? 180 : 0;
			
			if($(window).width() <= parseInt($('.main-content').css('max-width'))) { 
				var $windowWidth = parseInt($('.main-content').css('max-width'));

				//no need for the scrollbar calcs with ext responsive on desktop views
				if($extResponsivePadding == 180) $windowWidth = $windowWidth - $scrollBar;

			} else { 
				var $windowWidth = $(window).width();
			}

			
			$contentWidth = parseInt($('.main-content').css('max-width'));

			//single post fullwidth
			if($('body.single-post[data-ext-responsive="true"]').length > 0 && $('.container-wrap.no-sidebar').length > 0 ) {
				$contentWidth = $('#post-area').width();
				$extResponsivePadding = 0;
			}
			
			$justOutOfSight = Math.ceil( (($windowWidth + $extResponsivePadding + $scrollBar - $contentWidth) / 2) )
		}
		
		$('.full-width-section').each(function(){
			
			if(!$(this).parents('.span_9').length > 0 && !$(this).parent().hasClass('span_3') && $(this).parent().attr('id') != 'sidebar-inner' && $(this).parent().attr('id') != 'portfolio-extra' &&
			!$(this).hasClass('non-fw')){

				$(this).css({
					'margin-left': - $justOutOfSight,
					'padding-left': $justOutOfSight,
					'padding-right': $justOutOfSight,
					'visibility': 'visible'
				});	

			if($('#boxed').length > 0 && $('#nectar_fullscreen_rows').length > 0) $(this).css({ 'padding-left': 0, 'padding-right': 0 });

			}  else if($(this).parent().attr('id') == 'portfolio-extra' && $('#full_width_portfolio').length != 0) {
				$(this).css({
					'margin-left': - $justOutOfSight,
					'padding-left': $justOutOfSight,
					'padding-right': $justOutOfSight,
					'visibility': 'visible'
				});	
			}
			
			else {
				$(this).css({
					'margin-left': 0,
					'padding-left': 0,
					'padding-right': 0,
					'visibility': 'visible'
				});	
			}
			
		});
	
	
	    //full width content sections
	    $('.carousel-outer').has('.carousel-wrap[data-full-width="true"]').css('overflow','visible');
	    
	    $('.carousel-wrap[data-full-width="true"], .portfolio-items[data-col-num="elastic"], .full-width-content').each(function(){
			
			//single post fullwidth
			if($('#boxed').length == 1){

				var $mainContentWidth = ($('#nectar_fullscreen_rows').length == 0) ? parseInt($('.main-content').width()) : parseInt($(this).parents('.container').width());

				if($('body.single-post[data-ext-responsive="true"]').length > 0 && $('.container-wrap.no-sidebar').length > 0 && $(this).parents('#post-area').length > 0) {
					$contentWidth = $('#post-area').width();
					$extResponsivePadding = 0;
					$windowWidth = $(window).width();
					$justOutOfSight = Math.ceil( (($windowWidth + $extResponsivePadding + $scrollBar - $contentWidth) / 2) )
				} else {
					$justOutOfSight = ((parseInt($('.container-wrap').width()) - $mainContentWidth) / 2) + 4;
				}
			} else {
				if($('body.single-post[data-ext-responsive="true"]').length > 0 && $('.container-wrap.no-sidebar').length > 0 && $(this).parents('#post-area').length > 0) {
					$contentWidth = $('#post-area').width();
					$extResponsivePadding = 0;
					$windowWidth = $(window).width();
				} else {

					var $mainContentMaxWidth = ($('#nectar_fullscreen_rows').length == 0) ? parseInt($('.main-content').css('max-width')) : parseInt($(this).parents('.container').css('max-width'));

					if($(window).width() <= $mainContentMaxWidth) { 
						$windowWidth = $mainContentMaxWidth;
						//no need for the scrollbar calcs with ext responsive on desktop views
						if($extResponsivePadding == 180) $windowWidth = $windowWidth - $scrollBar;
					}
					$contentWidth = $mainContentMaxWidth;
					$extResponsivePadding = ($('body[data-ext-responsive="true"]').length > 0 && window.innerWidth >= 1000) ? 180 : 0;
				}

				$justOutOfSight = Math.ceil( (($windowWidth + $extResponsivePadding + $scrollBar - $contentWidth) / 2) )
			}

			$extraSpace = ($(this).hasClass('carousel-wrap')) ? 1 : 4;
	    	$carouselWidth = ($('#boxed').length == 1) ? $mainContentWidth + parseInt($justOutOfSight*2) : $(window).width() +$extraSpace  + $scrollBar ;
	    	
	    	if($(this).parent().hasClass('default-style')) { 

	    		var $mainContentWidth = ($('#nectar_fullscreen_rows').length == 0) ? parseInt($('.main-content').width()) : parseInt($(this).parents('.container').width());
	    		
	    		if($('#boxed').length != 0) {
	    			$carouselWidth = ($('#boxed').length == 1) ? $mainContentWidth + parseInt($justOutOfSight*2) : $(window).width() + $extraSpace + $scrollBar ;
				}
				else {
					$carouselWidth = ($('#boxed').length == 1) ? $mainContentWidth + parseInt($justOutOfSight*2) : $(window).width()  - ($(window).width()*.025) + $extraSpace + $scrollBar ;
					$windowWidth = ($(window).width() <= $mainContentWidth) ? $mainContentWidth : $(window).width() - ($(window).width()*.025);
					$justOutOfSight = Math.ceil( (($windowWidth + $scrollBar - $mainContentWidth) / 2) )
				}
			}

			else if($(this).parent().hasClass('spaced')) { 

				var $mainContentWidth = ($('#nectar_fullscreen_rows').length == 0) ? parseInt($('.main-content').width()) : parseInt($(this).parents('.container').width());

				if($('#boxed').length != 0) {
	    			$carouselWidth = ($('#boxed').length == 1) ? $mainContentWidth + parseInt($justOutOfSight*2) - ($(window).width()*.02) : $(window).width() + $extraSpace + $scrollBar ;
				} else {
					$carouselWidth = ($('#boxed').length == 1) ? $mainContentWidth + parseInt($justOutOfSight*2) : $(window).width()  - Math.ceil($(window).width()*.02) + $extraSpace + $scrollBar ;
					var $windowWidth2 = ($(window).width() <= $mainContentWidth) ? $mainContentWidth : $(window).width() - ($(window).width()*.02);
					$justOutOfSight = Math.ceil( (($windowWidth2 + $scrollBar - $mainContentWidth) / 2) +2)
				}
			}
	    	
	    	if(!$(this).parents('.span_9').length > 0 && !$(this).parent().hasClass('span_3') && $(this).parent().attr('id') != 'sidebar-inner' && $(this).parent().attr('id') != 'portfolio-extra' 
	        && !$(this).find('.carousel-wrap[data-full-width="true"]').length > 0
	    	&& !$(this).find('.portfolio-items:not(".carousel")[data-col-num="elastic"]').length > 0){

	    		//escape if inside woocoommerce page and not using applicable layout
	    		if($('.single-product').length > 0 && $(this).parents('#tab-description').length > 0 && $(this).parents('.full-width-tabs').length == 0) {
	    			$(this).css({
						'visibility': 'visible'
					});	
	    		} else {
	    			if($(this).hasClass('portfolio-items')) {
	    				$(this).css({
							'transform': 'translateX(-'+ $justOutOfSight + 'px)',
							'margin-left': 0,
							'width': $carouselWidth,
							'visibility': 'visible'
						});	
	    			} else {
	    				$(this).css({
							'margin-left': - $justOutOfSight,
							'width': $carouselWidth,
							'visibility': 'visible'
						});	
	    			}
					
				}
			}  else if($(this).parent().attr('id') == 'portfolio-extra' && $('#full_width_portfolio').length != 0) {
				$(this).css({
					'margin-left': - $justOutOfSight,
					'width': $carouselWidth,
					'visibility': 'visible'
				});	
			}
			
			else {
				$(this).css({
					'margin-left': 0,
					'visibility': 'visible'
				});	
			}
	    	
	    });

	}
	
	var $contentElementsNum = ($('#portfolio-extra').length == 0) ? $('.main-content > .row > *').length : $('.main-content > .row #portfolio-extra > *').length ;

	function parallaxSrollSpeed(speedString) {

		var ua = window.navigator.userAgent;	
		var msie = ua.indexOf("MSIE ");
		var speed;

		 //not as modern browsers
		 if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./) || $smoothCache == true || navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
			 switch(speedString) {
			   	  case 'slow':
			   	      speed = 0.2;
			   	      break;
			   	  case 'medium': 
			   	  	  speed = 0.4;
			   	      break;
			   	  case 'fast': 
			    	  speed = 0.6;
			   	       break;
			   }
		}
		 //chrome/ff
		 else {
		 	 switch(speedString) {
			   	  case 'slow':
			   	      speed = 0.6;
			   	      break;
			   	  case 'medium': 
			   	  	  speed = 0.4;
			   	      break;
			   	  case 'fast': 
			    	  speed = 0.25;
			   	       break;
			   }
		}

		   return speed;
	}

	function parallaxScrollInit(){
		 parallaxRowsBGCals();
		$('.full-width-section.parallax_section, .full-width-content.parallax_section').each(function(){
		   var $id = $(this).attr('id');	
		  
		    var ua = window.navigator.userAgent;	
		    var msie = ua.indexOf("MSIE ");

			if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./) || $smoothCache == true || navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1)  {
		   		if($(this).find('[data-parallax-speed="fixed"]').length == 0) $('#'+$id + ".parallax_section").parallaxScroll("50%", parallaxSrollSpeed($(this).find('.row-bg').attr('data-parallax-speed')) );
		   	} else if($(this).find('[data-parallax-speed="fixed"]').length == 0) {
		   		$('#'+$id + ".parallax_section").parallaxScroll("50%", parallaxSrollSpeed($(this).find('.row-bg').attr('data-parallax-speed')) );
		   	}
		});
	}

	
	if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|BlackBerry|Opera Mini)/)){
		parallaxScrollInit();
		$(window).load(parallaxRowsBGCals);
	}

	function parallaxRowsBGCals(){
		$('.full-width-section.parallax_section, .full-width-content.parallax_section').each(function(){

			 var ua = window.navigator.userAgent;
		     var msie = ua.indexOf("MSIE ");

			 if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./) || $smoothCache == true || navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
			 	$(this).find('.row-bg').css({'height': $(this).outerHeight(true)*2.8, 'margin-top': '-' + ($(this).outerHeight(true)*2.8)/2 + 'px' });
			 } else {
			 	$(this).find('.row-bg').css({'height': Math.ceil( $(window).height() * parallaxSrollSpeed($(this).find('.row-bg').attr('data-parallax-speed')) ) + $(this).outerHeight(true)   });
			 }
			 
		});
	}
	
	//if fullwidth section is first or last, remove the margins so it fits flush against header/footer
	function fwsClasses() {
		
		$('.wpb_wrapper > .nectar-slider-wrap[data-full-width="true"]').each(function(){
			if(!$(this).parent().hasClass('span_9') && !$(this).parent().hasClass('span_3') && $(this).parent().attr('id') != 'sidebar-inner'){
				if($(this).parents('.wpb_row').index() == '0'){
					$(this).addClass('first-nectar-slider');
				} 
			}
		});

		if($('#portfolio-extra').length == 0) {
			$contentElementsNum = ($('.main-content > .row > .wpb_row').length > 0) ? $('.main-content > .row > .wpb_row').length : $('.main-content > .row > *').length;
		} else {
			$contentElementsNum = $('.main-content > .row #portfolio-extra > *').length;
		}

		$('.full-width-section, .full-width-content:not(.page-submenu .full-width-content), .row > .nectar-slider-wrap[data-full-width="true"], .wpb_wrapper > .nectar-slider-wrap[data-full-width="true"], .parallax_slider_outer, .portfolio-items[data-col-num="elastic"]').each(function(){
			
			if(!$(this).parent().hasClass('span_9') && !$(this).parent().hasClass('span_3') && $(this).parent().attr('id') != 'sidebar-inner'){
				
				if($(this).parents('.wpb_row').length > 0){ 
				
					if($(this).parents('#portfolio-extra').length > 0 && $('#full_width_portfolio').length == 0) return false;
					
					////first
					if($(this).parents('.wpb_row').index() == '0' && $('#page-header-bg').length != 0 || $(this).parents('.wpb_row').index() == '0' && $('.parallax_slider_outer').length != 0){
						//$(this).css('margin-top','-2.1em').addClass('first-section nder-page-header');
					} 
					else if($(this).parents('.wpb_row').index() == '0' && $('#page-header-bg').length == 0 && $('.page-header-no-bg').length == 0 
					         && $('.project-title').length == 0 && $(this).parents('.wpb_row').index() == '0' 
					         && $('.parallax_slider_outer').length == 0 && $('.project-title').length == 0 
					         && $('body[data-bg-header="true"]').length == 0) {

					     if($('body[data-header-resize="0"]').length == 1 && $('.single').length == 0) {
					     	$('.container-wrap').css('padding-top','0px');
					     } else {
					     	$(this).css('margin-top','-70px').addClass('first-section');
					     } 	
						
					} 
					
					//check if it's also last (i.e. the only fws)
					if($(this).parents('.wpb_row').index() == $contentElementsNum-1 && $('#respond').length == 0 ) { 
						if($(this).attr('id') != 'portfolio-filters-inline') {
							$('.container-wrap').css('padding-bottom','0px');
							$('#call-to-action .triangle').remove();
						}
					} 
				
				} else {
					
					if($(this).parents('#portfolio-extra').length > 0 && $('#full_width_portfolio').length == 0) return false;
					
					if( $(this).find('.portfolio-filters-inline').length == 0 && $(this).attr('id') != 'post-area' ) {
						
						////first
						if($(this).index() == '0' && $('#page-header-bg').length != 0 || $(this).index() == '0' && $('.parallax_slider_outer').length != 0){
							//$(this).css('margin-top','-2.1em').addClass('first-section nder-page-header');
			
						} 
						else if($(this).index() == '0' && $('#page-header-bg').length == 0 && $(this).index() == '0' && $('.page-header-no-bg').length == 0 && 
						        $(this).index() == '0' && $('.parallax_slider_outer').length == 0 && !$(this).hasClass('blog_next_prev_buttons') ) {
						     
						      if($('body[data-header-resize="0"]').length == 1 && $('.single').length == 0) { 
						          $('.container-wrap').css('padding-top','0px');
						      } else {
						      	  $(this).css('margin-top','-70px').addClass('first-section');
						      }   	
							
						} 
						
						//check if it's also last (i.e. the only fws)
						if($(this).index() == $contentElementsNum-1 && $('#respond').length == 0 ) { 
							$('.container-wrap').css('padding-bottom','0px');
							$('.bottom_controls').css('margin-top','0px');
							$('#call-to-action .triangle').remove();
						} 
					}
					
				}
			}
		});


		//add first class for rows for page header trans effect (zoom only as of now)
		$('.full-width-section.wpb_row, .full-width-content.wpb_row').each(function(){
			
			if(!$(this).parent().hasClass('span_9') && !$(this).parent().hasClass('span_3') && $(this).parent().attr('id') != 'sidebar-inner'){
				
				
				if($(this).parents('#portfolio-extra').length > 0 && $('#full_width_portfolio').length == 0) return false;
					
				if($(this).index() == '0' && $('#page-header-bg').length == 0 && $('.page-header-no-bg').length == 0 
				         && $('.project-title').length == 0 && $('body.single').length == 0 
				         && $('.parallax_slider_outer').length == 0 && $('.project-title').length == 0 ) {

					$(this).addClass('first-section');
					var $that = $(this);
					setTimeout( function() { $that.addClass('loaded'); },50);
					
				} 
					
	
			}
		});	


		
		$('#portfolio-extra > .nectar-slider-wrap[data-full-width="true"], .portfolio-wrap').each(function(){
			//check if it's last 
			if($(this).index() == $contentElementsNum-1 && $('#commentform').length == 0 && $('#pagination').length == 0) { 
				$(this).css('margin-bottom','-40px');
				$('#call-to-action .triangle').remove();
			}
		});
		
		
		
		$('.portfolio-filters').each(function(){
			////first
			if($(this).index() == '0' && $('#page-header-bg').length != 0 || $(this).index() == '0' && $('.parallax_slider_outer').length != 0){
				$(this).css({'margin-top':'-2.1em'}).addClass('first-section nder-page-header');
			}  else if($(this).index() == '0' && $('#page-header-bg').length == 0 || $(this).index() == '0' && $('.parallax_slider_outer').length == 0){
				$(this).css({'margin-top':'0px'}).addClass('first-section');
			}
		});
		
		$('.portfolio-filters-inline').each(function(){
			////first
			if($(this).parents('.wpb_row').length > 0){ 
				
				if($(this).parents('.wpb_row').index() == '0' && $('#page-header-bg').length != 0 || $(this).parents('.wpb_row').index() == '0' && $('.parallax_slider_outer').length != 0){
					if($('body[data-header-resize="0"]').length == 0) $(this).css({'margin-top':'-2.1em', 'padding-top' : '19px'}).addClass('first-section nder-page-header');
				}  else if($(this).parents('.wpb_row').index() == '0' && $('#page-header-bg').length == 0 || $(this).parents('.wpb_row').index() == '0' && $('.parallax_slider_outer').length == 0){
					
					 if($('body[data-header-resize="0"]').length == 1) { 
				          // $(this).css({'margin-top':'-30px', 'padding-top' : '50px'}).addClass('first-section');
				      } else {
				      	  $(this).css({'margin-top':'-70px', 'padding-top' : '50px'}).addClass('first-section');
				      } 

				}
				
			} else {
				if($(this).index() == '0' && $('#page-header-bg').length != 0 || $(this).index() == '0' && $('.parallax_slider_outer').length != 0){
					$(this).css({'margin-top':'-2.1em', 'padding-top' : '19px'}).addClass('first-section nder-page-header');
				}  else if($(this).index() == '0' && $('#page-header-bg').length == 0 || $(this).index() == '0' && $('.parallax_slider_outer').length == 0){
					
					if($('body[data-header-resize="0"]').length == 1) { 
				          $(this).css({'margin-top':'-30px', 'padding-top' : '50px'}).addClass('first-section');
				      } else {
				      	  $(this).css({'margin-top':'-70px', 'padding-top' : '50px'}).addClass('first-section');
				      } 

				
				}
			}
			
		});
		
		
		
		$('.parallax_slider_outer').each(function(){
			if(!$(this).parent().hasClass('span_9') && !$(this).parent().hasClass('span_3') && $(this).parent().attr('id') != 'sidebar-inner'){
				
				if($(this).parents('#portfolio-extra').length > 0 && $('#full_width_portfolio').length == 0) return false;
				////first
				if($(this).parent().index() == '0' && $('#page-header-bg').length != 0){
					$(this).addClass('first-section nder-page-header');

				} 
				else if($(this).parent().index() == '0' && $('#page-header-bg').length == 0){
					$(this).css('margin-top','-40px').addClass('first-section');
					if(!$('body').hasClass('single-post')) $('.container-wrap').css('padding-top', '0px');
				} 
				
				//check if it's also last (i.e. the only fws)
				if($(this).parent().index() == $contentElementsNum-1 && $('#post-area').length == 0) {
					$('#call-to-action .triangle').remove();
					$('.container-wrap').hide();
				}
			}
		});
	}
	
	//if not using a fullwidth slider first, ajdust the top padding
	//if( $('.nectar-slider-wrap.first-section').length > 0 && $('.nectar-slider-wrap.first-section').attr('data-full-width') != 'true' || $('.nectar-slider-wrap.first-section').length > 0 && $('.nectar-slider-wrap.first-section').attr('data-full-width') != 'boxed-full-width' ) $('body').attr('data-bg-header','false');
	//if( $('.wpb_row.first-section:not(".full-width-content") .nectar-slider-wrap').length > 0 && $('.wpb_row.first-section:not(".full-width-content") .nectar-slider-wrap').attr('data-full-width') != 'true' || $('.wpb_row.first-section:not(".full-width-content") .nectar-slider-wrap').length > 0 && $('.wpb_row.first-section:not(".full-width-content") .nectar-slider-wrap').attr('data-full-width') != 'boxed-full-width' ) $('body').attr('data-bg-header','false');
	
	
	//set sizes
	fullWidthSections();
	fwsClasses();
	
	//sizing for fullwidth sections that are image only

	function fullwidthImgOnlySizingInit(){
		////set inital sizes
		$('.full-width-section:not(.custom-skip)').each(function(){
			
			var $fwsHeight = $(this).outerHeight(true);

			//make sure it's empty and also not being used as a small dvider
			if($(this).find('.span_12 *').length == 0 && $.trim( $(this).find('.span_12').text() ).length == 0  && $fwsHeight > 40){
				$(this).addClass('bg-only');
				$(this).css({'height': $fwsHeight, 'padding-top': '0px', 'padding-bottom': '0px'});
				$(this).attr('data-image-height',$fwsHeight);
			}

		});
	}

	function fullwidthImgOnlySizing(){

		$('.full-width-section.bg-only').each(function(){
			var $initialHeight = $(this).attr('data-image-height');
			
			if( window.innerWidth < 1000 && window.innerWidth > 690 ) {
				$(this).css('height', $initialHeight - $initialHeight*.60);
			} 
			
			else if( window.innerWidth <= 690 ) {
				$(this).css('height', $initialHeight - $initialHeight*.78);
			} 
			
			else if( window.innerWidth < 1300 && window.innerWidth >= 1000  ) {
				$(this).css('height', $initialHeight - $initialHeight*.33);
			} 
			
			else {
				$(this).css('height', $initialHeight);
			}
			
		});
		
	}

	fullwidthImgOnlySizingInit();
	fullwidthImgOnlySizing();
	
	
	
	//change % padding on rows to be relative to screen
	function fullWidthRowPaddingAdjustInit(){
		if($('#boxed').length == 0){
			$('.full-width-section, .full-width-content').each(function(){
				var $topPadding = $(this)[0].style.paddingTop;
				var $bottomPadding = $(this)[0].style.paddingBottom;

				if($topPadding.indexOf("%") >= 0) $(this).attr('data-top-percent',$topPadding);
				if($bottomPadding.indexOf("%") >= 0) $(this).attr('data-bottom-percent',$bottomPadding);
				

			});
		}
	}

	function fullWidthRowPaddingAdjustCalc(){
		if($('#boxed').length == 0){
			$('.full-width-section[data-top-percent], .full-width-section[data-bottom-percent], .full-width-content[data-top-percent],  .full-width-content[data-bottom-percent]').each(function(){

				var $windowHeight = $(window).width();
				var $topPadding = ($(this).attr('data-top-percent')) ? $(this).attr('data-top-percent') : 'skip';
				var $bottomPadding = ($(this).attr('data-bottom-percent')) ? $(this).attr('data-bottom-percent') : 'skip';

				//top
				if($topPadding != 'skip') {
					$(this).css('padding-top',$windowHeight*(parseInt($topPadding)/100));
				}

				//bottom
				if($bottomPadding != 'skip'){
					$(this).css('padding-bottom',$windowHeight*(parseInt($bottomPadding)/100));
				}
				

			});
		}
	}
	fullWidthRowPaddingAdjustInit();
	fullWidthRowPaddingAdjustCalc();

	
	//full width content column sizing
	function fullWidthContentColumns(){

		//standard carousel
   	  	$('.main-content > .row > .full-width-content, #portfolio-extra > .full-width-content, .woocommerce-tabs #tab-description > .full-width-content, #post-area.span_12 article .content-inner > .full-width-content').each(function(){
			

			//only set the height if more than one column
			if($(this).find('> .span_12 > .col').length > 1){
				
				var tallestColumn = 0;
				var $columnInnerHeight = 0;
				
				$(this).find('> .span_12 > .col').each(function(){

					$column_inner_selector = ($(this).find('> .vc_column-inner > .wpb_wrapper').length > 0) ? '.vc_column-inner' : '.column-inner-wrap > .column-inner';
					
					var $padding = parseInt($(this).css('padding-top'));
					//var $padding = (!$(this).is('[data-animation*="reveal"]')) ? parseInt($(this).css('padding-top')) : parseInt($(this).find('> .column-inner-wrap > .column-inner').css('padding-top')); start to reveal fix
					($(this).find('> '+$column_inner_selector+' > .wpb_wrapper').height() + ($padding*2) > tallestColumn) ? tallestColumn = $(this).find('> '+$column_inner_selector+' > .wpb_wrapper').height() + ($padding*2)  : tallestColumn = tallestColumn;
				});	
	    	 	
	    	 	$(this).find('> .span_12 > .col').each(function(){

	    	 		$column_inner_selector = ($(this).find('> .vc_column-inner > .wpb_wrapper').length > 0) ? '.vc_column-inner' : '.column-inner-wrap > .column-inner';
					
	    	 		//columns with content
		    	 	if($(this).find('> '+$column_inner_selector+' > .wpb_wrapper > *').length > 0){
		    	 		$(this).css('height',tallestColumn);
		    	 	} 
		    	 	//empty columns
		    	 	else {
		    	 		$(this).css('min-height',tallestColumn);
		    	 		if($(this).is('[data-animation*="reveal"]')) $(this).find('.column-inner').css('min-height',tallestColumn);
		    	 	}
	    	 	});
	         	
	         	//nested column height
	         	var $childRows = $(this).find('> .span_12 > .col .wpb_row').length;
	         	if(window.innerWidth > 1000) { 
	         		
	         		var $padding = parseInt($(this).find('> .span_12 > .col').css('padding-top'));
	         		
	         		//$(this).find('> .span_12 > .col .wpb_row .col').css('min-height',(tallestColumn-($padding*2))/$childRows + 'px'); 
	         	} else {
	         		$(this).find('> .span_12 > .col .wpb_row .col').css('min-height','0px'); 
	         	}
	         	
	         	
	         	//vertically center
	         	if($(this).hasClass('vertically-align-columns') && window.innerWidth > 1000 && !$(this).hasClass('vc_row-o-equal-height')){
	         		
	         		//parent columns
		         	$(this).find('> .span_12 > .col').each(function(){

		         		$column_inner_selector = ($(this).find('> .vc_column-inner > .wpb_wrapper').length > 0) ? '.vc_column-inner' : '.column-inner-wrap > .column-inner';
						
						$columnInnerHeight = $(this).find('> '+$column_inner_selector+' > .wpb_wrapper').height();
						var $marginCalc = ($(this).height()/2)-($columnInnerHeight/2);
						if($marginCalc <= 0) $marginCalc = 0;
						
						$(this).find('> '+$column_inner_selector+' > .wpb_wrapper').css('margin-top',$marginCalc);
						$(this).find('> '+$column_inner_selector+' > .wpb_wrapper').css('margin-bottom',$marginCalc);
						
					});	
	
					
				}
			
			}
			
   	  	});

		//requal height columns in container type with reveal columns
		$('.main-content > .row > .wpb_row:not(.full-width-content).vc_row-o-equal-height').each(function(){
			if($(this).find('>.span_12>.wpb_column[data-animation*="reveal"]').length >0) {
				var tallestColumn = 0;
				var $columnInnerHeight = 0;
				
				$(this).find('> .span_12 > .col').each(function(){
					
					var $padding = parseInt($(this).find('> .column-inner-wrap > .column-inner').css('padding-top'));
					($(this).find('> .column-inner-wrap > .column-inner').height() + ($padding*2) > tallestColumn) ? tallestColumn = $(this).find('> .column-inner-wrap > .column-inner').height() + ($padding*2)  : tallestColumn = tallestColumn;
				});	
	    	 	
	    	 	$(this).find('> .span_12 > .col').each(function(){
					
	    	 		//columns with content
		    	 	if($(this).find('> .column-inner-wrap > .column-inner .wpb_wrapper > *').length > 0){
		    	 		$(this).find('> .column-inner-wrap').css('height',tallestColumn);
		    	 	} 
		    	 	//empty columns
		    	 	else {
		    	 		$(this).css('min-height',tallestColumn);
		    	 		if($(this).is('[data-animation*="reveal"]')) $(this).find('.column-inner').css('min-height',tallestColumn);
		    	 	}
	    	 	});

			}	
		});

		//using equal height option, top/bottom padding % needs to be convered into px for cross browser (flex bug)
		$('.vc_row.vc_row-o-equal-height>.span_12>.wpb_column[class*="padding-"][data-padding-pos="all"]').each(function(){
			$(this).css({ 'padding-top': $(this).css('padding-left'), 'padding-bottom': $(this).css('padding-left')});
		});
		
	}
	
	fullWidthContentColumns();
	if($('.owl-carousel').length > 0) owlCarouselInit();


var $mouseParallaxScenes = [];
function mouseParallaxInit(){
	$('.wpb_row:has(.nectar-parallax-scene)').each(function(i){

		if($(this).hasClass('first-section')) { 
			$('body #header-outer[data-transparent-header="true"] .ns-loading-cover').show();

			if($('body #header-outer[data-transparent-header="true"]').length > 0) { 
				$(this).css('overflow','hidden');
				$(this).find('.nectar-slider-loading').css({
					'top': $('#header-space').height(),
					'margin-top' : '-1px'
				});
				$(this).find('.nectar-slider-loading .loading-icon').css({
					'height' :  $('.first-section .nectar-parallax-scene').height() - $('#header-space').height() + 'px',
					'opacity' : '1'
				});
			}
		}

		var $strength = parseInt($(this).find('.nectar-parallax-scene').attr('data-scene-strength'));

		$mouseParallaxScenes[i] = $(this).find('.nectar-parallax-scene').parallax({
			scalarX: $strength,
	  		scalarY: $strength
		});

		//wait until the images in the scene have loaded
		var images = $(this).find('.nectar-parallax-scene li');
		
		$.each(images, function(){
			if($(this).find('div').length > 0) {
			    var el = $(this).find('div'),
			    image = el.css('background-image').replace(/"/g, '').replace(/url\(|\)$/ig, '');
			    if(image && image !== '' && image !== 'none')
			        images = images.add($('<img>').attr('src', image));
			}
		});

		var $that = $(this);
		images.imagesLoaded(function(){

			$that.find('> .nectar-slider-loading, .full-page-inner > .nectar-slider-loading').fadeOut(800,'easeInOutExpo');
			if($that.hasClass('first-section')) { 
				$('body #header-outer[data-transparent-header="true"] .ns-loading-cover').fadeOut(800,'easeInOutExpo',function(){
    				$(this).remove();
    			});
			}
		});

	});
}
mouseParallaxInit();


	
/***************** Checkmarks ******************/

function ulChecks() {
	$('ul.checks li').prepend('<i class="icon-ok-sign"></i>');
}
ulChecks();

/***************** Image with Animation / Col Animation *******************/


	
function colAndImgAnimations(){

	$colAndImgOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? '200%' : '85%';
	$colAndImgOffsetPos2 = ($('#nectar_fullscreen_rows').length > 0) ? '200%' : '70%';

	$($fullscreenSelector+'img.img-with-animation').each(function() {
		
		var $that = $(this);
		var $animationEasing = ($('body[data-cae]').length > 0) ? $('body').attr('data-cae') : 'easeOutSine';
		var $animationDuration = ($('body[data-cad]').length > 0) ? $('body').attr('data-cad') : '650';

		var waypoint = new Waypoint({
 			element: $that,
 			 handler: function(direction) {
			   
					if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
						 waypoint.destroy();
						return;
					}

					if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/) || $('body[data-responsive="0"]').length > 0) {
				
						if($that.attr('data-animation') == 'fade-in-from-left'){
							$that.delay($that.attr('data-delay')).transition({
								'opacity' : 1,
								'x' : '0px'
							},$animationDuration, $animationEasing);
						} else if($that.attr('data-animation') == 'fade-in-from-right'){
							$that.delay($that.attr('data-delay')).transition({
								'opacity' : 1,
								'x' : '0px'
							},$animationDuration, $animationEasing);
						} else if($that.attr('data-animation') == 'fade-in-from-bottom'){
							$that.delay($that.attr('data-delay')).transition({
								'opacity' : 1,
								'y' : '0px'
							},$animationDuration, $animationEasing);
						} else if($that.attr('data-animation') == 'fade-in') {
							$that.delay($that.attr('data-delay')).transition({
								'opacity' : 1
							},$animationDuration, $animationEasing);	
						} else if($that.attr('data-animation') == 'grow-in') {
							setTimeout(function(){ 
								$that.transition({ scale: 1, 'opacity':1 },$animationDuration,$animationEasing);
							},$that.attr('data-delay'));
						}
						else if($that.attr('data-animation') == 'flip-in') {
							setTimeout(function(){ 
								$that.transition({  rotateY: 0, 'opacity':1 },$animationDuration, $animationEasing);
							},$that.attr('data-delay'));
						}

						$that.addClass('animated-in');
						
					}

					waypoint.destroy();

			  },
			  offset: $colAndImgOffsetPos
		});

		
	
	});


	$($fullscreenSelector+'.nectar_cascading_images').each(function() {
		
		var $that = $(this);
		var $animationEasing = ($('body[data-cae]').length > 0) ? $('body').attr('data-cae') : 'easeOutSine';
		var $animationDuration = ($('body[data-cad]').length > 0) ? $('body').attr('data-cad') : '650';

		var waypoint = new Waypoint({
 			element: $that,
 			 handler: function(direction) {
			   
					if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
						 waypoint.destroy();
						return;
					}

					if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/) || $('body[data-responsive="0"]').length > 0) {
					
						$that.find('.cascading-image').each(function(i){

							var $that2 = $(this);

							if($that2.attr('data-animation') == 'flip-in') {
								setTimeout(function(){
									$that2.find('.inner-wrap').css({
										'opacity' : 1,
										'transform' : 'rotate(0deg) translateZ(0px)'
									});
								}, i*175);
							} else {
								setTimeout(function(){
									$that2.find('.inner-wrap').css({
										'opacity' : 1,
										'transform' : 'translateX(0px) translateY(0px) scale(1,1) translateZ(0px)'
									});
								}, i*175);
							}
					

						});

						$that.addClass('animated-in');
						
					}

					waypoint.destroy();

			  },
			  offset: $colAndImgOffsetPos
		});

		
	
	});
	

	
	$($fullscreenSelector+'.col.has-animation:not([data-animation*="reveal"]), '+$fullscreenSelector+'.wpb_column.has-animation:not([data-animation*="reveal"])').each(function() {
	    
		var $that = $(this);
		var $animationEasing = ($('body[data-cae]').length > 0) ? $('body').attr('data-cae') : 'easeOutSine';
		var $animationDuration = ($('body[data-cad]').length > 0) ? $('body').attr('data-cad') : '650';

		var waypoint = new Waypoint({
 			element: $that,
 			 handler: function(direction) {
				
				if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
					 waypoint.destroy();
					return;
				}

				if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/) || $('body[data-responsive="0"]').length > 0) {
				 	
					if($that.attr('data-animation') == 'fade-in-from-left'){
						$that.delay($that.attr('data-delay')).transition({
							'opacity' : 1,
							'x' : '0px'
						},$animationDuration,$animationEasing);
					} else if($that.attr('data-animation') == 'fade-in-from-right'){
						$that.delay($that.attr('data-delay')).transition({
							'opacity' : 1,
							'x' : '0px'
						},$animationDuration,$animationEasing);
					} else if($that.attr('data-animation') == 'fade-in-from-bottom'){
						$that.delay($that.attr('data-delay')).transition({
							'opacity' : 1,
							'y' : '0px'
						},$animationDuration,$animationEasing);
					} else if($that.attr('data-animation') == 'fade-in') {
						$that.delay($that.attr('data-delay')).transition({
							'opacity' : 1
						},$animationDuration,$animationEasing);	
					} else if($that.attr('data-animation') == 'grow-in') {
						setTimeout(function(){ 
							$that.transition({ scale: 1, 'opacity':1 },$animationDuration,$animationEasing);
						},$that.attr('data-delay'));
					} else if($that.attr('data-animation') == 'flip-in') {
						setTimeout(function(){ 
							$that.transition({  rotateY: 0, 'opacity':1 },$animationDuration, $animationEasing);
						},$that.attr('data-delay'));
					}

					//boxed column hover fix
					if($that.hasClass('boxed')) {
						$that.addClass('no-pointer-events');
						setTimeout(function(){
							$that.removeClass('no-pointer-events');
						},parseInt($animationDuration) + parseInt($that.attr('data-delay')) + 30 );
					}

					$that.addClass('animated-in');
				
				}

				waypoint.destroy();
			},
			offset: $colAndImgOffsetPos
		});
	
	});

	
	$($fullscreenSelector+'.wpb_column.has-animation[data-animation*="reveal"]').each(function() {
	    
		var $that = $(this);
		var $animationEasing = ($('body[data-cae]').length > 0) ? $('body').attr('data-cae') : 'easeOutSine';
		var $animationDuration = ($('body[data-cad]').length > 0) ? $('body').attr('data-cad') : '650';

		var waypoint = new Waypoint({
 			element: $that,
 			 handler: function(direction) {
				
				if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
					 waypoint.destroy();
					return;
				}

				if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/) || $('body[data-responsive="0"]').length > 0) {
					
					if($that.attr('data-animation') == 'reveal-from-bottom' || $that.attr('data-animation') == 'reveal-from-top') {
						setTimeout(function(){ 
							if($that.hasClass('animated-in')) $that.find('.column-inner-wrap, .column-inner').transition({  'y': 0 },$animationDuration, $animationEasing,function(){ if($that.hasClass('animated-in')) $that.find('.column-inner-wrap, .column-inner').addClass('no-transform'); });
						},$that.attr('data-delay'));
					} else if($that.attr('data-animation') == 'reveal-from-right' || $that.attr('data-animation') == 'reveal-from-left') {
						setTimeout(function(){ 
							if($that.hasClass('animated-in'))  $that.find('.column-inner-wrap, .column-inner').transition({  'x': 0 },$animationDuration, $animationEasing,function(){ if($that.hasClass('animated-in')) $that.find('.column-inner-wrap, .column-inner').addClass('no-transform'); });
						},$that.attr('data-delay'));
					} 

					$that.addClass('animated-in');
				
				}

				waypoint.destroy();
			},
			offset: $colAndImgOffsetPos2
		});
	
	}); 	

	
}

setTimeout(function(){ 
	//if($('.nectar-box-roll').length == 0) colAndImgAnimations();
},$animationOnScrollTimeOut); 	


function cascadingImageBGSizing() {
	$('.nectar_cascading_images').each(function(){

		//handle max width for cascading images in equal height columns
		if($(this).parents('.vc_row-o-equal-height').length > 0 && $(this).parents('.wpb_column').length > 0) 
			$(this).css('max-width',$(this).parents('.wpb_column').width());

		//set size for layers with no images
		$(this).find('.bg-color').each(function(){
			var $bgColorHeight = 0;
			var $bgColorWidth = 0;
			if($(this).parent().find('.img-wrap').length == 0) {
				$firstSibling = $(this).parents('.cascading-image').siblings('.cascading-image[data-has-img="true"]').first();

				$firstSibling.css({'position':'relative', 'visiblity':'hidden'});
				$bgColorHeight = $firstSibling.find('.img-wrap').height();
				$bgColorWidth = $firstSibling.find('.img-wrap').width();
				if($firstSibling.index() == 0) {
					$firstSibling.css({'visiblity':'visible'});
				} else {
					$firstSibling.css({'position':'absolute', 'visiblity':'visible'});
				}
			} else {
				$bgColorHeight = $(this).parent().find('.img-wrap').height();
				$bgColorWidth = $(this).parent().find('.img-wrap').width();
			}

			$(this).css({'height': $bgColorHeight,'width': $bgColorWidth});
		});
	});
}
imagesLoaded($('.nectar_cascading_images'),function(instance){
	cascadingImageBGSizing();
});

function splitLineHeadings() {

	$splitLineOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? '100%' : 'bottom-in-view';
	$($fullscreenSelector+'.nectar-split-heading').each(function() {

		var $that = $(this);
		var $animationEasing = ($('body[data-cae]').length > 0) ? $('body').attr('data-cae') : 'easeOutSine';
		var $animationDuration = ($('body[data-cad]').length > 0) ? $('body').attr('data-cad') : '650';

		var waypoint = new Waypoint({
				element: $that,
				 handler: function(direction) {
				
				if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
					 waypoint.destroy();
					return;
				}

				if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/) || $('body[data-responsive="0"]').length > 0) {
				 	
					
					$that.find('.heading-line').each(function(i){
						//if($that.parents('.first-section').length > 0 && $('body[data-aie="zoom-out"]').length > 0) i = i+4;
						$(this).find('> span').delay(i*70).transition({
							'y' : '0px'
						},$animationDuration,$animationEasing);

					});
					

					$that.addClass('animated-in');
				
				}

				waypoint.destroy();
			},
			offset: $splitLineOffsetPos
		});

	});
}

	
/***************** 4 Col Grid in iPad ******************/
	
	//add one-fourth class
	function oneFourthClasses() {
		$('.col.span_3, .vc_span3, .vc_col-sm-3').each(function(){
			var $currentDiv = $(this);
			var $nextDiv = $(this).next('div');
			if( $nextDiv.hasClass('span_3') && !$currentDiv.hasClass('one-fourths') || $nextDiv.hasClass('vc_span3') && !$currentDiv.hasClass('one-fourths') || $nextDiv.hasClass('vc_col-sm-3') && !$currentDiv.hasClass('one-fourths') ) {
				$currentDiv.addClass('one-fourths clear-both');
				$nextDiv.addClass('one-fourths right-edge');
			}
		});
		
		/*$('.vc_span4').each(function(){
			if($(this).find('.team-member').length > 0 && $(this).parents('.full-width-content').length > 0) {
				var $currentDiv = $(this);
				var $nextDiv = $(this).next('div');
				if( !$currentDiv.hasClass('one-fourths')) {
					$currentDiv.addClass('one-fourths clear-both');
					$nextDiv.addClass('one-fourths right-edge');
				}
			}
		});*/
		
		//make empty second 1/2 half columsn display right on iPad
		$('.span_12 .col.span_6').each(function(){
			if($(this).next('div').hasClass('span_6') && $.trim( $(this).next('div').html() ).length == 0 ) {
				$(this).addClass('empty-second')
			}
		}); 
	}
	oneFourthClasses();
	
/***************** Bar Graph ******************/
function progressBars(){
	$progressBarsOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? '100%' : 'bottom-in-view';
	$($fullscreenSelector+'.nectar-progress-bar').parent().each(function(i){

		var $that = $(this);
		var waypoint = new Waypoint({
 			element: $that,
 			 handler: function(direction) {
			   
					if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) { 
						 waypoint.destroy();
						return;
					}

					if($progressBarsOffsetPos == '100%') $that.find('.nectar-progress-bar .bar-wrap').css('opacity','1');

					$that.find('.nectar-progress-bar').each(function(i){


						var percent = $(this).find('span').attr('data-width');
						var $endNum = parseInt($(this).find('span strong i').text());
						var $that = $(this);
						
						$that.find('span').delay(i*90).transition({
							'width' : percent + '%'
						},1050, 'easeInOutQuint',function(){
						});
						
	
					
						setTimeout(function(){
							$that.find('span strong i').countTo({
								from: 0,
								to: $endNum,
								speed: 850,
								refreshInterval: 30,
								onComplete: function(){
						
								}
							});	

							$that.find('span strong').transition({
								'opacity' : 1
							},550, 'easeInCirc');
						}, (i*90) );
					
						////100% progress bar 
						if(percent == '100'){
							$that.find('span strong').addClass('full');
						}
					});

					$that.addClass('completed');

					waypoint.destroy();

			  },
			  offset: $progressBarsOffsetPos
		});

	});
}

//if($('.nectar-box-roll').length == 0) progressBars();
	



/***************** Dividers ******************/
function dividers() {
	$dividerOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? '100%' : 'bottom-in-view';

	$($fullscreenSelector+'.divider-small-border[data-animate="yes"], '+$fullscreenSelector+'.divider-border[data-animate="yes"]').each(function(i){

		var $lineDur = ($(this).hasClass('divider-small-border')) ? 1300 : 1500;
		var $that = $(this);
		var waypoint = new Waypoint({
 			element: $that,
 			 handler: function(direction) {
			   
					if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) { 
						 waypoint.destroy();
						return;
					}
				
					$that.each(function(i){

						$(this).css({'transform':'scale(0,1)', 'visibility': 'visible'});
						var $that = $(this);
						
						$that.delay($that.attr('data-animation-delay')).transition({
							'transform' : 'scale(1, 1)'
						},$lineDur, 'cubic-bezier(.18,1,.22,1)');
						
					});

					$that.addClass('completed');

					waypoint.destroy();

			  },
			  offset: $dividerOffsetPos
		});

	});
}

//if($('.nectar-box-roll').length == 0) dividers();


/***************** Icon List ******************/
function iconList() {
	$iconListOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? '100%' : 'bottom-in-view';

	$($fullscreenSelector+'.nectar-icon-list[data-animate="true"]').each(function(i){

		var $that = $(this);
		var waypoint = new Waypoint({
 			element: $that,
 			 handler: function(direction) {
			   
					if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) { 
						 waypoint.destroy();
						return;
					}
				
					$that.each(function(i){

						$(this).find('.nectar-icon-list-item').each(function(i){
							var $thatt = $(this);
							setTimeout(function(){ $thatt.addClass('animated') },i*300);
						});
						
					});

					$that.addClass('completed');

					waypoint.destroy();

			  },
			  offset: $iconListOffsetPos
		});

	});
}
$('.nectar-icon-list[data-icon-style="border"]').each(function(){
	if($(this).parents('.wpb_row').length > 0 && $(this).parents('.wpb_row').find('.row-bg.using-bg-color').length > 0) {
		var $bgColorToSet = $(this).parents('.wpb_row').find('.row-bg.using-bg-color').css('background-color');
	}
	else {
		if($('#nectar_fullscreen_rows').length > 0)
			var $bgColorToSet = $('#nectar_fullscreen_rows > .wpb_row .full-page-inner-wrap').css('background-color');
		else 
			var $bgColorToSet = $('.container-wrap').css('background-color');
	}
	$(this).find('.list-icon-holder').css('background-color',$bgColorToSet);
});



/***************** Hotspot ******************/
//add pulse animation
$('.nectar_image_with_hotspots[data-hotspot-icon="numerical"]').each(function(){
	$(this).find('.nectar_hotspot_wrap').each(function(i){
		var $that = $(this);
		setTimeout(function(){
			$that.find('.nectar_hotspot').addClass('pulse');
		},i*300);	
	});
});



function hotSpotHoverBind() {

	var hotSpotHoverTimeout = [];

	$('.nectar_hotspot').each(function(i){
		
		hotSpotHoverTimeout[i] = '';

		$(this).on('mouseover', function(){
			clearTimeout(hotSpotHoverTimeout[i]);
			$(this).parent().css({'z-index':'10', 'height':'auto','width':'auto'});
		});

		$(this).on('mouseleave', function(){

			var $that = $(this);
			$that.parent().css({'z-index':'auto'});

			hotSpotHoverTimeout[i] = setTimeout(function(){
				$that.parent().css({'height':'30px','width':'30px'});
			},300);

		});

	});

}

hotSpotHoverBind();

function responsiveTooltips() {
	$('.nectar_image_with_hotspots').each(function(){
		$(this).find('.nectar_hotspot_wrap').each(function(i){
			
			if($(window).width() > 690) {

				//remove click if applicable
				if($(this).parents('.nectar_image_with_hotspots[data-tooltip-func="hover"]').length > 0) {
					$(this).find('.nectar_hotspot').removeClass('click');
					$(this).find('.nttip').removeClass('open');
				}
				$(this).find('.nttip .inner a.tipclose').remove();
				$('.nttip').css('height','auto');

				//reset for positioning
				$(this).css({'width': 'auto','height': 'auto'});
				$(this).find('.nttip').removeClass('force-right').removeClass('force-left').removeClass('force-top').css('width','auto');

				var $tipOffset = $(this).find('.nttip').offset();

				//against right side fix
				if($tipOffset.left > $(this).parents('.nectar_image_with_hotspots').width() - 200)
					$(this).find('.nttip').css('width','250px');
				else 
					$(this).find('.nttip').css('width','auto');

				//responsive
				if($tipOffset.left < 0)
					$(this).find('.nttip').addClass('force-right');
				else if($tipOffset.left + $(this).find('.nttip').outerWidth(true) > $(window).width())
					$(this).find('.nttip').addClass('force-left').css('width','250px');
				else if($tipOffset.top + $(this).find('.nttip').height() + 35 > $(window).height())
					$(this).find('.nttip').addClass('force-top');

				$(this).css({'width': '30px','height': '30px'});

			} else {
				//fixed position
				$(this).find('.nttip').removeClass('force-left').removeClass('force-right').removeClass('force-top');
				$(this).find('.nectar_hotspot').addClass('click');
			
				if($(this).find('.nttip a.tipclose').length == 0)
					$(this).find('.nttip .inner').append('<a href="#" class="tipclose"><span></span></a>');

				//change height of fixed
				$('.nttip').css('height',$(window).height());
			}
		});
	});


}
responsiveTooltips();

function imageWithHotspotClickEvents() {
	//click
	$('body').on('click','.nectar_hotspot.click',function(){
		$(this).parents('.nectar_image_with_hotspots').find('.nttip').removeClass('open');
		$(this).parent().find('.nttip').addClass('open');

		$(this).parents('.nectar_image_with_hotspots').find('.nectar_hotspot').removeClass('open');
		$(this).parent().find('.nectar_hotspot').addClass('open');

		if($(window).width() <= 690) $(this).parents('.wpb_row, [class*="vc_col-"]').css('z-index','200');

		return false;
	});

	$('body').on('click','.nectar_hotspot.open',function(){
		$(this).parent().find('.nttip').removeClass('open');
		$(this).parent().find('.nectar_hotspot').removeClass('open');

		$(this).parents('.wpb_row').css('z-index','auto');
		return false;
	});

	$('body').on('click','.nttip.open',function(){
		$(this).parents('.nectar_image_with_hotspots').find('.nttip').removeClass('open');

		$(this).parents('.wpb_row').css('z-index','auto');
		return false;
	});
}
imageWithHotspotClickEvents();

function imageWithHotspots() {

	$imageWithHotspotsOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? '100%' : '50%';

	$($fullscreenSelector+'.nectar_image_with_hotspots[data-animation="true"]').each(function(i){

		var $that = $(this);
		var waypoint = new Waypoint({
 			element: $that,
 			 handler: function(direction) {
			   
					if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) { 
						 waypoint.destroy();
						return;
					}

					$that.addClass('completed');
					$that.find('.nectar_hotspot_wrap').each(function(i){
						var $that2 = $(this);
						var $extrai = ($that2.parents('.col.has-animation').length > 0) ? 1 : 0;
						setTimeout(function(){
							$that2.addClass('animated-in');
						},175*(i+$extrai));
					});

					waypoint.destroy();

			  },
			  offset: $imageWithHotspotsOffsetPos
		});

	});
}


/***************** Animated Title ******************/
function animated_titles() {
	$animatedTitlesOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? '100%' : 'bottom-in-view';

	$($fullscreenSelector+'.nectar-animated-title').each(function(i){

		var $that = $(this);
		var waypoint = new Waypoint({
 			element: $that,
 			 handler: function(direction) {
			   
					if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('completed')) { 
						 waypoint.destroy();
						return;
					}

					$that.addClass('completed');

					waypoint.destroy();

			  },
			  offset: $animatedTitlesOffsetPos
		});

	});
}

//if($('.nectar-box-roll').length == 0) animated_titles();


/***************** Pricing Tables ******************/


var $tallestCol;

function pricingTableHeight(){
	$('.pricing-table[data-style="default"]').each(function(){
		$tallestCol = 0;
		
		$(this).find('> div ul').each(function(){
			($(this).height() > $tallestCol) ? $tallestCol = $(this).height() : $tallestCol = $tallestCol;
		});	
		
		//safety net incase pricing tables height couldn't be determined
		if($tallestCol == 0) $tallestCol = 'auto';
		
		//set even height
		$(this).find('> div ul').css('height',$tallestCol);

	});
}

pricingTableHeight();

 
/***************** Testimonial Slider ******************/

//testimonial slider controls
$('body').on('click','.testimonial_slider:not([data-style="multiple_visible"]) .controls li', function(){
	
	if($(this).find('span').hasClass('active')) return false;
	
	var $index = $(this).index();
	var currentHeight = $(this).parents('.testimonial_slider').find('.slides blockquote').eq($index).height();
	
	$(this).parents('.testimonial_slider').find('li span').removeClass('active');
	$(this).find('span').addClass('active');
	
	$(this).parents('.testimonial_slider').find('.slides blockquote').stop().css({'opacity':'0', 'left':'-25px', 'z-index': '1'});
	$(this).parents('.testimonial_slider').find('.slides blockquote').eq($index).stop(true,true).animate({'opacity':'1','left':'0'},550,'easeOutCubic').css('z-index','20');
	$(this).parents('.testimonial_slider:not(.disable-height-animation)').find('.slides').stop(true,true).animate({'height' : currentHeight + 40 + 'px' },450,'easeOutCubic');
	
	resizeVideoToCover();
});


var $tallestQuote;

//create controls
function createTestimonialControls() {

	//fadeIn
	$('.testimonial_slider:not([data-style="multiple_visible"])').animate({'opacity':'1'},800);

	$('.testimonial_slider:not([data-style="multiple_visible"])').each(function(){
		
		if($(this).find('blockquote').length > 1 && $(this).find('.controls').length == 0) {
			$(this).append('<div class="controls"><ul></ul></div>');
			
			var slideNum = $(this).find('blockquote').length;
			var $that = $(this);
			
			for(var i=0;i<slideNum;i++) {
				$that.find('.controls ul').append('<li><span class="pagination-switch"></span></li>')
			}
			
			//activate first slide
			$(this).find('.controls ul li').first().click();
			
			//autorotate
			if($(this).attr('data-autorotate').length > 0) {
				slide_interval = (parseInt($(this).attr('data-autorotate')) < 100) ? 4000 : parseInt($(this).attr('data-autorotate'));
				var $that = $(this);
				var $rotate = setInterval(function(){ testimonialRotate($that) },slide_interval);
			}
			
			$(this).find('.controls li').click(function(e){
				if(typeof e.clientX != 'undefined') clearInterval($rotate);
			});
			
			////swipe for testimonials
			$(this).swipe({
			
				swipeLeft : function(e) {
					$(this).find('.controls ul li span.active').parent().next('li').find('span').trigger('click');
					e.stopImmediatePropagation();
					clearInterval($rotate);
					return false;
				 },
				 swipeRight : function(e) {
					$(this).find('.controls ul li span.active').parent().prev('li').find('span').trigger('click');
					e.stopImmediatePropagation();
					clearInterval($rotate);
					return false;
				 }    
			});
		} 
		//only one testimonial
		else if($(this).find('.controls').length == 0) {
			var currentHeight = $(this).find('.slides blockquote').height();
			$(this).find('.slides blockquote').stop().css({'opacity':'0', 'left':'-25px', 'z-index': '1'});
			$(this).find('.slides blockquote').stop(true,true).transition({'opacity':'1','left':'0'},550,'easeOutCubic').css('z-index','20');
			$(this).find('.slides').stop(true,true).animate({'height' : currentHeight + 20 + 'px' },450,'easeOutCubic');
		}
	});



		
	$('.testimonial_slider[data-style="multiple_visible"] .slides').each(function(){
	    	var $that = $(this); 
	    	var $element = $that;
	    	var $autoplay = ($that.parents('.testimonial_slider').attr('data-autorotate').length > 1 && parseInt($that.parents('.testimonial_slider').attr('data-autorotate')) > 100) ? parseInt($that.parents('.testimonial_slider').attr('data-autorotate')) : 4000;
			if($that.find('img').length == 0) $element = $('body');

			//move img pos
			$(this).find('blockquote').each(function(){
				$(this).find('.image-icon').insertAfter($(this).find('p'));
			});
			

			imagesLoaded($element,function(instance){

		    	$that.flickity({
		    		  contain: true,
					  draggable: true,
					  lazyLoad: false,
					  imagesLoaded: true,
					  percentPosition: true,
					  prevNextButtons: false,
					  pageDots: true,
					  resize: true,
					  setGallerySize: true,
					  wrapAround: true,
					  autoPlay: $autoplay,
					  accessibility: false
		    	});

			    $that.parents('.testimonial_slider').css('opacity','1');
			    

		     });//images loaded
		     	     
	    });//each	


}
createTestimonialControls();

function testimonialRotate(slider){
	
	var $testimonialLength = slider.find('li').length;
	var $currentTestimonial = slider.find('.pagination-switch.active').parent().index();
	
	//stop the rotation when toggles are closed
	if( slider.parents('.toggle').length > 0 && slider.parents('.toggle').hasClass('open') ) {

		if( $currentTestimonial+1 == $testimonialLength) {
			slider.find('ul li:first-child').click();
		} else {
			slider.find('.pagination-switch.active').parent().next('li').click();
		}
		
	} else {
		
		if( $currentTestimonial+1 == $testimonialLength) {
			slider.find('ul li:first-child').click();
		} else {
			slider.find('.pagination-switch.active').parent().next('li').click();
		}
	
	}

}

function testimonialHeightResize(){
	$('.testimonial_slider:not(.disable-height-animation):not([data-style="multiple_visible"])').each(function(){
		
		var $index = $(this).find('.controls ul li span.active').parent().index();
		var currentHeight = $(this).find('.slides blockquote').eq($index).height();
		$(this).find('.slides').stop(true,true).css({'height' : currentHeight + 40 + 'px' });
		
	});
}


function testimonialSliderHeight() {
		
	$('.testimonial_slider.disable-height-animation:not([data-style="multiple_visible"])').each(function(){
		$tallestQuote = 0;
			
		$(this).find('blockquote').each(function(){
			($(this).height() > $tallestQuote) ? $tallestQuote = $(this).height() : $tallestQuote = $tallestQuote;
		});	
		
		//safety net incase height couldn't be determined
		if($tallestQuote == 0) $tallestQuote = 100;
		
		//set even height
		$(this).find('.slides').css('height',$tallestQuote+40+'px');
		
		//show the slider once height is set
		$(this).animate({'opacity':'1'});

		fullWidthContentColumns();

	});

}

testimonialSliderHeight(); 



/***************** WP Media Embed / External Embed ******************/

//this isn't the for the video shortcode* This is to help any external iframe embed fit & resize correctly 
function responsiveVideoIframesInit(){
	$('iframe').each(function(){
		
		//make sure the iframe has a src (things like adsense don't)
		if(typeof $(this).attr('src') != 'undefined' && !$(this).parent().hasClass('iframe-embed') && $(this).parents('.ult_modal').length == 0 && $(this).parents('.ls-slide').length == 0 && $(this).parents('.esg-entry-media').length == 0){
			
			if( $(this).attr('src').toLowerCase().indexOf("youtube") >= 0 || $(this).attr('src').toLowerCase().indexOf("vimeo") >= 0  || $(this).attr('src').toLowerCase().indexOf("twitch.tv") >= 0 || $(this).attr('src').toLowerCase().indexOf("kickstarter") >= 0 || $(this).attr('src').toLowerCase().indexOf("embed-ssl.ted") >= 0  || $(this).attr('src').toLowerCase().indexOf("dailymotion") >= 0) {
				$(this).wrap('<div class="iframe-embed"/>');	
				
				$(this).attr('data-aspectRatio', this.height / this.width).removeAttr('height').removeAttr('width');
	
				//add wmode=transparent to all youytube embeds to fix z-index issues in IE
				if($(this).attr('src').indexOf('wmode=transparent') == -1) {
					if($(this).attr('src').indexOf('?') == -1){
						$(this).attr('src',$(this).attr('src') + '?wmode=transparent');
					} else {
						$(this).attr('src',$(this).attr('src') + '&wmode=transparent');
					}
				}
			}
			 
		} else {
			//if($(this).parents('ins').length == 0){ 
			//	$(this).wrap('<div class="iframe-embed-standard"/>');	
			//}
		}
		
	});


}

function responsiveVideoIframes(){
	 $('iframe[data-aspectRatio]').each(function() {
	 	var newWidth = $(this).parent().width();
	 	 
		var $el = $(this);
		
		//in nectar slider
		if($(this).parents('.swiper-slide').length > 0) {
			if($(this).is(':visible')) $el.width(newWidth).height(newWidth * $el.attr('data-aspectRatio'));
		} 
		//all others
		else {
			$el.width(newWidth).height(newWidth * $el.attr('data-aspectRatio'));
		}
		
		
	});
}


function videoshortcodeSize(){
	$('.wp-video').each(function(){

		$(this).attr('data-aspectRatio', parseInt($(this).find('.mejs-overlay').height()) / parseInt($(this).find('.wp-video-shortcode').css('width')));

		var newWidth = $(this).width();
	 	 
		var $el = $(this).find('.wp-video-shortcode');
		$(this).width(newWidth).height(newWidth * $(this).attr('data-aspectRatio'));
	});
}

responsiveVideoIframesInit();
responsiveVideoIframes();
videoshortcodeSize();

//unwrap post and protfolio videos
$('.video-wrap iframe').unwrap();
$('#sidebar iframe[src]').unwrap();

$('video:not(.slider-video)').attr('width','100%');
$('video:not(.slider-video)').attr('height','100%'); 

$('audio').attr('width','100%');
$('audio').attr('height','100%');

$('audio').css('visibility','visible');

if($('body').hasClass('mobile')){
	$('video').css('visibility','hidden');
} else {
	$('video').css('visibility','visible');
}


$(window).load(function(){
	$('video').css('visibility','visible');
	showLateIframes();
	videoshortcodeSize();
});

$('.wp-video').each(function(){
	 video = $(this).find('video').get(0);
	 video.addEventListener('loadeddata', function() {
	   videoshortcodeSize();
	   $(window).trigger('resize');
	 }, false);
});

//webkit video back button fix 
$('.main-content iframe[src]').each(function(){
	$(this).attr('src',$(this).attr('src'));
	$(this).css({'opacity':'1', 'visibility':'visible'});
});

showLateIframes();

function showLateIframes(){
	$('iframe[src]').css('opacity','1');
	setTimeout(function(){ $('iframe[src]').css('opacity','1'); }, 100);
	setTimeout(function(){ $('iframe[src]').css('opacity','1'); }, 500);
	setTimeout(function(){ $('iframe[src]').css('opacity','1'); }, 1000);
	setTimeout(function(){ $('iframe[src]').css('opacity','1'); }, 1500);
	setTimeout(function(){ $('iframe[src]').css('opacity','1'); }, 2500);
}


/***************** Nectar Video BG ******************/


	
	$('.wpb_row:has(".nectar-video-wrap"):not(.fp-section)').each(function(i){
		$(this).css('z-index',100 + i);
	});

	var min_w = 1200; // minimum video width allowed
	var vid_w_orig;  // original video dimensions
	var vid_h_orig;
	
    vid_w_orig = 1280;
    vid_h_orig = 720;
 
	function resizeVideoToCover() {
		$('.nectar-video-wrap').each(function(i){
			
			if($(this).parents('#page-header-bg').length > 0) {
				if($('.container-wrap.auto-height').length > 0) return false;
				var $containerHeight = $(this).parents('#page-header-bg').outerHeight();			
				var $containerWidth = $(this).parents('#page-header-bg').outerWidth();
			} else {
				var $containerHeight = $(this).parents('.wpb_row').outerHeight();			
				var $containerWidth = $(this).parents('.wpb_row').outerWidth();
			}
			
		    // set the video viewport to the window size
		    $(this).width($containerWidth);
		    $(this).height($containerHeight);
		
		    // use largest scale factor of horizontal/vertical
		    var scale_h = $containerWidth / vid_w_orig;
		    var scale_v = ($containerHeight - $containerHeight) / vid_h_orig; 
		    var scale = scale_h > scale_v ? scale_h : scale_v;
			
			//update minium width to never allow excess space
		    min_w = 1280/720 * ($containerHeight+40);
		    
		    // don't allow scaled width < minimum video width
		    if (scale * vid_w_orig < min_w) {scale = min_w / vid_w_orig;}
		        
		    // now scale the video
		    $(this).find('video, .mejs-overlay, .mejs-poster').width(Math.ceil(scale * vid_w_orig +0));
		    $(this).find('video, .mejs-overlay, .mejs-poster').height(Math.ceil(scale * vid_h_orig +0));
		    
		    // and center it by scrolling the video viewport
		    $(this).scrollLeft(($(this).find('video').width() - $containerWidth) / 2);
		    $(this).scrollTop(($(this).find('video').height() - ($containerHeight)) / 2);
		    $(this).find('.mejs-overlay, .mejs-poster').scrollTop(($(this).find('video').height() - ($containerHeight)) / 2);


		    //align bottom
		    if($(this).attr('data-bg-alignment') == 'center bottom' || $(this).attr('data-bg-alignment') == 'bottom'){
		    	$(this).scrollTop(($(this).find('video').height() - ($containerHeight+6)));
		    }
		    //align top
		    else if($(this).attr('data-bg-alignment') == 'center top' || $(this).attr('data-bg-alignment') == 'top') {
		    	$(this).scrollTop(0);
		    } 

		});
	}
    
    //init
    function videoBGInit(){
	    setTimeout(function(){
	    	resizeVideoToCover();
	    	$('.video-color-overlay').each(function(){
	    		$(this).css('background-color',$(this).attr('data-color'));
	    	});
	    	$('.nectar-video-wrap').each(function(i){
	    		var $headerVideo = ($(this).parents('#page-header-bg').length > 0) ? true : false;
	    		var $that = $(this);

	    		 var videoReady = setInterval(function(){

        			if($that.find('video').get(0).readyState > 3) {

        				$that.transition({'opacity':'1'},400);
		    			$that.find('video').transition({'opacity':'1'},400);
		    			$that.parent().find('.video-color-overlay').transition({'opacity':'0.7'},400);

		    			if($headerVideo == true) {
			    			pageHeaderTextEffect();
						}

						//remove page loading screen
						$('#ajax-loading-screen').addClass('loaded');
						setTimeout(function(){ $('#ajax-loading-screen').addClass('hidden'); },1000);
				

						clearInterval(videoReady);
					}
	    		},60);
	    		
	    	});
	    },300);

		if(navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/)){
			$('.wpb_row .mobile-video-image, #page-header-wrap .mobile-video-image, .fullscreen-header .mobile-video-image').show();
			$('.nectar-video-wrap').remove();
		}

		
		 if(navigator.userAgent.indexOf('Chrome') > 0 && !/Edge\/12./i.test(navigator.userAgent) && !/Edge\/13./i.test(navigator.userAgent)) { 
		 	$('.nectar-video-wrap').each(function(i){
		 		if(jQuery(this).find('video source[type="video/webm"]').length > 0 ) {
				  	var webmSource = jQuery(this).find('video source[type="video/webm"]').attr('src') + "?id="+Math.ceil(Math.random()*10000);
		          	var firstVideo = jQuery(this).find('video').get(0);
		          	firstVideo.src = webmSource;
		          	firstVideo.load();
		         }
            });
	    }
	}
	videoBGInit();


/*-------------------------------------------------------------------------*/
/*	4.	Header + Search
/*-------------------------------------------------------------------------*/	 

/***************** Slide Out Widget Area **********/

var $bodyBorderHeaderColorMatch = ($('.body-border-top').css('background-color') == '#ffffff' && $('body').attr('data-header-color') == 'light' || $('.body-border-top').css('background-color') == $('#header-outer').attr('data-user-set-bg')) ? true : false;
var $bodyBorderWidth = ($('.body-border-right').length > 0) ? $('.body-border-right').width() : 0;
var $resetHeader;

//icon effect html creation
if($('#slide-out-widget-area.slide-out-from-right-hover').length > 0) {

	if($('#ajax-content-wrap > .slide-out-widget-area-toggle').length == 0) {
		$('<div class="slide-out-widget-area-toggle slide-out-hover-icon-effect" data-icon-animation="simple-transform"><div> <a href="#sidewidgetarea" class="closed"> <span> <i class="lines-button x2"> <i class="lines"></i> </i> </span> </a> </div> </div>').insertAfter('#slide-out-widget-area');
		if($('#header-outer[data-has-menu="true"]').length > 0 || $('body[data-header-search="true"]').length > 0) $('#ajax-content-wrap > .slide-out-widget-area-toggle').addClass('small');
	}

	//hover triggered
	if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/))
		$('body').on('mouseenter','#header-outer .slide-out-widget-area-toggle:not(.std-menu) a',openRightHoverNav);
	else 
		$('body').on('click','.slide-out-widget-area-toggle:not(.std-menu) a',openRightHoverNav);

	$(window).on('smartresize',calculateHoverNavMinHeight);

	function calculateHoverNavMinHeight() {
		$widgetHeights = 0;
		$('#slide-out-widget-area > .widget').each(function(){
			$widgetHeights += $(this).height();
		});
		$menuHeight = ( ($('#slide-out-widget-area').height() - 25 - $('.bottom-meta-wrap').outerHeight(true) -$widgetHeights) > $('#slide-out-widget-area .off-canvas-menu-container').height() ) ? $('#slide-out-widget-area').height() - 25 - $('.bottom-meta-wrap').outerHeight(true) -$widgetHeights : $('#slide-out-widget-area .off-canvas-menu-container').height();
		$('#slide-out-widget-area .inner').css({'height':'auto', 'min-height': $menuHeight  });

		$('#slide-out-widget-area.slide-out-from-right-hover > .inner .off-canvas-menu-container').transition({ y : '-' + ($('#slide-out-widget-area.slide-out-from-right-hover > .inner .off-canvas-menu-container').height()/2) + 'px' },0);
	
	}

	function openRightHoverNav() {

		

			calculateHoverNavMinHeight();

			if(navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/) && $('.slide-out-widget-area-toggle  .unhidden-line').length > 0) {
				mobileCloseNavCheck();
				return;
			}
			

			$('#slide-out-widget-area').css({ 'transform': 'translate3d(0,0,0)' }).addClass('open');

			//icon effect
			$('.slide-out-hover-icon-effect .lines-button').removeClass('no-delay').addClass('unhidden-line');

			if($('#header-outer[data-permanent-transparent="1"]').length == 0 && $('#nectar_fullscreen_rows').length == 0) {

				if(!($(window).scrollTop() == 0 && $('#header-outer.transparent').length > 0)) {
					$('#header-outer').attr('data-transparent','true').addClass('no-bg-color').addClass('slide-out-hover');
					$('#header-outer header').addClass('all-hidden');
				}

				var headerResize = $('#header-outer').attr('data-header-resize');
				if(headerResize == 1) {

					$(window).off('scroll',bigNav);
					$(window).off('scroll',smallNav);


				} else {
					
					$(window).off('scroll',opaqueCheck);
					$(window).off('scroll',transparentCheck);
				}
			}

			if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/))
				$(window).on('mousemove.rightOffsetCheck',closeNavCheck);

	}

	function closeNavCheck(e) {
		var $windowWidth = $(window).width();
		if(e.clientX < $windowWidth - 340 - $bodyBorderWidth) {

				$(window).off('mousemove.rightOffsetCheck',closeNavCheck);

				$('#slide-out-widget-area').css({ 'transform': 'translate3d(341px,0,0)' }).removeClass('open');

				$('#header-outer').removeClass('style-slide-out-from-right');

				$('.slide-out-hover-icon-effect .lines-button').removeClass('unhidden-line').addClass('no-delay');


				if($('#header-outer[data-permanent-transparent="1"]').length == 0) {

					if(!($(window).scrollTop() == 0 && $('#header-outer.transparent').length > 0)) {
						$('#header-outer').removeClass('no-bg-color');
						$('#header-outer header').removeClass('all-hidden');
					}

					var headerResize = $('#header-outer').attr('data-header-resize');
					if(headerResize == 1) {
					
						$(window).off('scroll.headerResizeEffect');
						if($(window).scrollTop() == 0) {
							$(window).on('scroll.headerResizeEffect',smallNav); 

							if($('#header-outer[data-full-width="true"][data-transparent-header="true"]').length > 0 && $('.body-border-top').length > 0 && $bodyBorderHeaderColorMatch == true && $('#header-outer.pseudo-data-transparent').length > 0) {
								$('#header-outer[data-full-width="true"] header > .container').stop(true,true).animate({
									'padding' : '0'			
								},{queue:false, duration:250, easing: 'easeOutCubic'});	
							}
						}
						else {
							$(window).on('scroll.headerResizeEffect',bigNav);
						}
						
			
					} else {
						
						$(window).off('scroll.headerResizeEffectOpaque');
						$(window).on('scroll.headerResizeEffectOpaque',opaqueCheck);
					}
				}

			}

	}

	function mobileCloseNavCheck(e) {
		

				$('#slide-out-widget-area').css({ 'transform': 'translate3d(341px,0,0)' }).removeClass('open');

				$('#header-outer').removeClass('style-slide-out-from-right');

				$('.slide-out-hover-icon-effect .lines-button').removeClass('unhidden-line').addClass('no-delay');

				if($('#header-outer[data-permanent-transparent="1"]').length == 0) {

					$('#header-outer').removeClass('no-bg-color');
					$('#header-outer header').removeClass('all-hidden');

				}

			

	}

}


//click triggered
$('body').on('click','.slide-out-widget-area-toggle:not(.std-menu) a.closed:not(.animating)',function(){
	if(animating == 'true' || $('.slide-out-from-right-hover').length > 0) return false;
	var $that = $(this);

	//slide out from right
	if($('#slide-out-widget-area').hasClass('slide-out-from-right')) {

		//calc height if used bottom meta
		$('#slide-out-widget-area .inner').css({'height':'auto', 'min-height': $('#slide-out-widget-area').height() - 25 - $('.bottom-meta-wrap').height() });

		if($('#boxed').length == 0) {
			$('.container-wrap, .home-wrap, #header-secondary-outer, #footer-outer:not(#nectar_fullscreen_rows #footer-outer), .nectar-box-roll, .parallax_slider_outer .swiper-slide .image-bg, .parallax_slider_outer .swiper-slide .video-wrap, .parallax_slider_outer .swiper-slide .mobile-video-image, .parallax_slider_outer .swiper-slide .container, #page-header-wrap .page-header-bg-image,  #page-header-wrap .nectar-video-wrap, #page-header-wrap .mobile-video-image, #page-header-wrap #page-header-bg > .container, .page-header-no-bg, div:not(.container) > .project-title').stop(true).transition({ x: '-300px' },700,'easeInOutCubic');

			if($('#header-outer[data-format="centered-logo-between-menu"]').length == 0) {
				if($('#header-outer[data-transparency-option="1"]').length == 0) {
					$('#header-outer').stop(true).css('transform','translateY(0)').transition({ x: '-300px'},700,'easeInOutCubic');
				} else {
					$('#header-outer').stop(true).css('transform','translateY(0)').transition({ x: '-300px', 'background-color':'transparent', 'border-bottom': '1px solid rgba(255,255,255,0.22)' },700,'easeInOutCubic');
				}
			} else {
				$('#header-outer header#top nav > ul.buttons, #header-outer .cart-outer .cart-menu-wrap').transition({ x: '-300px'},700,'easeInOutCubic');
			}

			$('#ascrail2000').transition({ 'x': '-300px' },700,'easeInOutCubic');
			$('body:not(.ascend) #header-outer .cart-menu').stop(true).transition({ 'x': '300px' },700,'easeInOutCubic');
		}

		$slideOutAmount = ($('.body-border-top').length > 0 && $('body.mobile').length == 0) ? '-'+$('.body-border-top').height()+'px' : 0;
		$('#slide-out-widget-area').stop(true).transition({ x: $slideOutAmount },700,'easeInOutCubic').addClass('open');


		if($('#boxed').length == 0) {
			//full width menu adjustments
			if($('#header-outer[data-full-width="true"]').length > 0 && !$('body').hasClass('mobile')) { 
				$('#header-outer').addClass('highzI'); 
				$('#ascrail2000').addClass('z-index-adj');

				if($('#header-outer[data-format="centered-logo-between-menu"]').length == 0) {
					$('header#top #logo').stop(true).transition({ x: '300px' },700,'easeInOutCubic'); 
					
					$('header#top nav > ul > li.megamenu > ul.sub-menu').stop(true).transition({'width': $(window).width() - 360, 'left': '300px' },700,'easeInOutCubic');

				}

				$('header#top .slide-out-widget-area-toggle .lines-button').addClass('close');

				if($('#header-outer[data-remove-border="true"]').length > 0) {
					$('body:not(.ascend) #header-outer[data-full-width="true"] header#top nav > ul.product_added').stop(true).transition({ x: '64px' },700,'easeInOutCubic');
				} else {
					$('body:not(.ascend) #header-outer[data-full-width="true"] header#top nav > ul.product_added').stop(true).transition({ x: '89px' },700,'easeInOutCubic'); 
				}

				$('body #header-outer nav > ul > li > a').css({'margin-bottom':'0'});
				
			}
		}

		$('#header-outer').addClass('style-slide-out-from-right');

		//fade In BG Overlay
		$('#slide-out-widget-area-bg').css({'height':'100%','width':'100%'}).stop(true).transition({
			'opacity' : 1
		},700,'easeInOutCubic',function(){
			$('.slide-out-widget-area-toggle:not(.std-menu) > div > a').removeClass('animating');
		});
		
		//hide menu if no space
		if($('#header-outer[data-format="centered-logo-between-menu"]').length == 0) {
			$logoWidth = ($('#logo img:visible').length > 0) ? $('#logo img:visible').width() : $('#logo').width();
			if($('header#top nav > .sf-menu').offset().left - $logoWidth - 300 < 20) $('#header-outer').addClass('hidden-menu');
		} else {
			$('#header-outer').addClass('hidden-menu-items');
		}

		var headerResize = $('#header-outer').attr('data-header-resize');
		if($bodyBorderHeaderColorMatch == true && headerResize == 1) {
			
			$('#header-outer').stop(true).transition({ y: '0' },0).addClass('transparent');
			if($('#header-outer').attr('data-transparent-header') != 'true') {
				$('#header-outer').attr('data-transparent-header','true').addClass('pseudo-data-transparent');
			}

			$(window).off('scroll',bigNav);
			if($('.small-nav').length > 0 || $('#header-outer').hasClass('pseudo-data-transparent')) bigNav();
			$(window).off('scroll',smallNav);

		} else if ($bodyBorderHeaderColorMatch == true) {
			$('#header-outer').addClass('transparent');
			$(window).off('scroll',opaqueCheck);
			$(window).off('scroll',transparentCheck);
		}


	}
     else if($('#slide-out-widget-area').hasClass('fullscreen')) {

		//scroll away from fixed reveal footer if shown (firefox bug with bluring over it)
		var $scrollDelay = 0;
		var $scrollDelay2 = 0;

		if($(window).scrollTop() + $(window).height() > $('.blurred-wrap').height() && $('#nectar_fullscreen_rows').length == 0) {
			$('body,html').stop().animate({
				scrollTop: $('.blurred-wrap').height() - $(window).height()
			},600,'easeInOutCubic');
			$scrollDelay = 550;
			$scrollDelay2 = 200;
		}

		$('header#top .slide-out-widget-area-toggle:not(.std-menu) .lines-button').addClass('close');
		setTimeout(function(){ $('.blurred-wrap').addClass('blurred'); },$scrollDelay);
		$('#slide-out-widget-area.fullscreen').show().addClass('open');

		hideToTop();

		//remove box shadow incase at the top of the page with nectar box roll above
		$('.container-wrap').addClass('no-shadow');
		$('#header-outer').stop(true).css('transform','translateY(0)');

		setTimeout(function(){

			$('.off-canvas-menu-container .menu > li').each(function(i){
				$(this).delay(i*50).transition({y: 0, 'opacity': 1},800,'easeOutExpo');
			});

			$('#slide-out-widget-area.fullscreen .widget').each(function(i){
				$(this).delay(i*100).transition({y: 0, 'opacity': 1},800,'easeOutExpo');
			});
		},370+$scrollDelay2);

		setTimeout(function(){
			$('#slide-out-widget-area .off-canvas-social-links').addClass('line-shown');

			$('#slide-out-widget-area .off-canvas-social-links li').each(function(i){
				$(this).delay(i*50).transition({'scale':1},400,'easeOutCubic');
			});
			$('#slide-out-widget-area .bottom-text').transition({'opacity':0.7},400,'easeOutCubic');
		},750+$scrollDelay2);
		
		//fade In BG Overlay
		setTimeout(function(){
			$easing = ($('body.mobile').length > 0) ? 'easeOutCubic' : 'easeInOutQuint';
			$('#slide-out-widget-area-bg').css({'height':'100%','width':'100%'}).show().stop(true).transition({
				'y' : '0%'
			},920,$easing,function(){
				$('.slide-out-widget-area-toggle > div > a').removeClass('animating');
			});
		},50+$scrollDelay2);

		//overflow state 
		slideOutWidgetOverflowState();
		if($('.mobile #header-outer[data-permanent-transparent="false"]').length > 0 && $('.container-wrap').hasClass('no-scroll')) $('#ajax-content-wrap').addClass('at-content');
		if($('.mobile #header-outer[data-permanent-transparent="false"]').length > 0 || $('.mobile').length == 0 && $('#header-outer.transparent').length == 0) $('#slide-out-widget-area.fullscreen .inner-wrap').css('padding-top', $('#header-outer').height());
	} 

	else if($('#slide-out-widget-area').hasClass('fullscreen-alt')) {

		$('header#top .slide-out-widget-area-toggle:not(.std-menu) .lines-button').addClass('close');
		$('#slide-out-widget-area.fullscreen-alt').show().addClass('open');
		$('#slide-out-widget-area-bg').addClass('open');

		$('body > div[class*="body-border"]').css('z-index','9995');

		$('.off-canvas-menu-container .menu').transition({y: '0px', 'opacity': 1},0);	

		hideToTop();

		if($('#header-outer-bg-only').length == 0 ) {
			$('body').prepend($('<div id="header-outer-bg-only"/>'));
			$('#header-outer-bg-only').css({'height':$('#header-outer').outerHeight(true), 'background-color': $('#header-outer').css('background-color')});	
		} 

		if($('#header-outer.transparent').length == 0) {

			$('#header-outer-bg-only').show();
			$('#header-outer-bg-only').css({'height':$('#header-outer').outerHeight(true), 'background-color': $('#header-outer').css('background-color')});

			if($('.body-border-top').length > 0) {
				//$('.admin-bar #slide-out-widget-area-bg.fullscreen-alt').addClass('no-transition').css({'padding-top': ($('#header-outer').outerHeight(true)+32) + 'px'});
				//$('body:not(.admin-bar) #slide-out-widget-area-bg.fullscreen-alt').addClass('no-transition').css({'padding-top': ($('#header-outer').outerHeight(true))+ 'px'});
			}
		}
		else { 

			$('#header-outer-bg-only').hide();
			if($('.body-border-top').length > 0) {
				$('.admin-bar #slide-out-widget-area-bg.fullscreen-alt').addClass('no-transition').css({'padding-top': ($('.body-border-top').outerHeight(true)+32) + 'px'});
				$('body:not(.admin-bar) #slide-out-widget-area-bg.fullscreen-alt').addClass('no-transition').css({'padding-top': ($('.body-border-top').outerHeight(true))+ 'px'});
			}
		}

		if($('#logo .starting-logo').length > 0 && $(window).width() > 1000) {
			
			$('#header-outer').addClass('no-transition').addClass('no-bg-color');
			
			$('#header-outer').stop(true).css('transform','translateY(0)').addClass('transparent');
			if($('#header-outer').attr('data-transparent-header') != 'true') {
				$('#header-outer').attr('data-transparent-header','true').addClass('pseudo-data-transparent');
			}
		}

		$('.off-canvas-menu-container .clip-wrap').css('transition-duration','0s');

		setTimeout(function(){

			$('.off-canvas-menu-container .menu > li').each(function(i){
				$(this).delay(i*50).transition({y: 0, 'opacity': 1},750,'easeOutCubic').addClass('no-pointer-events');
			});

			setTimeout(function(){
				$('.off-canvas-menu-container .menu > li').removeClass('no-pointer-events');
				$('.off-canvas-menu-container .clip-wrap').css('transition-duration','.45s');
			},500);
			
		

			$('#slide-out-widget-area.fullscreen-alt .widget').each(function(i){
				$(this).delay(i*100).transition({y: 0, 'opacity': 1},650,'easeOutCubic');
			});
		},200);

		setTimeout(function(){
			$('#slide-out-widget-area .off-canvas-social-links').addClass('line-shown');

			$('#slide-out-widget-area .off-canvas-social-links li').css('opacity','1').each(function(i){
				$(this).delay(i*50).transition({'scale':1},400,'easeOutCubic');
			});
			$('#slide-out-widget-area .bottom-text').transition({'opacity':1},600,'easeOutCubic');
		},200);
		
		//fade In BG Overlay
		if($('#slide-out-widget-area-bg').hasClass('solid')) $opacity = 1;
		if($('#slide-out-widget-area-bg').hasClass('dark')) $opacity = 0.97;
		if($('#slide-out-widget-area-bg').hasClass('medium')) $opacity = 0.6;
		if($('#slide-out-widget-area-bg').hasClass('light')) $opacity = 0.4;
		$('#slide-out-widget-area-bg').removeClass('no-transition');
		setTimeout(function(){
			$('#slide-out-widget-area-bg').addClass('padding-removed').css({'height':'100%','width':'100%', 'left':'0','opacity': $opacity});
		},50);

		setTimeout(function(){
			$('.slide-out-widget-area-toggle > div > a').removeClass('animating');
		},600);
			
		

		//overflow state 
		slideOutWidgetOverflowState();
		if($('.mobile #header-outer[data-permanent-transparent="false"]').length > 0 && $('.container-wrap').hasClass('no-scroll')) $('#ajax-content-wrap').addClass('at-content');
		if($('.mobile #header-outer[data-permanent-transparent="false"]').length > 0 || $('.mobile').length == 0 && $('#header-outer.transparent').length == 0) $('#slide-out-widget-area.fullscreen-alt .inner-wrap').css('padding-top', $('#header-outer').height());
	}



	
		

	//add open class
	$('#header-outer').removeClass('side-widget-closed').addClass('side-widget-open');

	//give header transparent state
	if($('#header-outer[data-transparency-option="1"]').length > 0 && $('#boxed').length == 0 && $('#header-outer[data-full-width="true"]').length > 0) {
		$('#header-outer').addClass('transparent');
	}

	//dark slide transparent nav
	if($('#header-outer.dark-slide.transparent').length > 0  && $('#boxed').length == 0) $('#header-outer').removeClass('dark-slide').addClass('temp-removed-dark-slide');
	
	$('.slide-out-widget-area-toggle > div > a').removeClass('closed').addClass('open');
	$('.slide-out-widget-area-toggle > div > a').addClass('animating');

	return false;
});

$('body').on('click','.slide-out-widget-area-toggle:not(.std-menu) a.open:not(.animating), #slide-out-widget-area .slide_out_area_close, #slide-out-widget-area-bg.slide-out-from-right',function(){
	
	if($('.slide-out-widget-area-toggle:not(.std-menu) a.animating').length > 0) return;

	var $that = $(this);

	$('.slide-out-widget-area-toggle:not(.std-menu) a').removeClass('open').addClass('closed');
	$('.slide-out-widget-area-toggle:not(.std-menu) a').addClass('animating');

	//slide out from right
	if($('#slide-out-widget-area').hasClass('slide-out-from-right')) {

		$('.container-wrap, .home-wrap, #header-secondary-outer, #footer-outer:not(#nectar_fullscreen_rows #footer-outer), .nectar-box-roll, .parallax_slider_outer .swiper-slide .image-bg, .parallax_slider_outer .swiper-slide .container, .parallax_slider_outer .swiper-slide .video-wrap, .parallax_slider_outer .swiper-slide .mobile-video-image, #page-header-wrap .page-header-bg-image,  #page-header-wrap .nectar-video-wrap, #page-header-wrap .mobile-video-image, #page-header-wrap #page-header-bg > .container, .page-header-no-bg, div:not(.container) > .project-title').stop(true).transition({ x: '0px' },700,'easeInOutCubic');

		if($('#header-outer[data-transparency-option="1"]').length > 0  && $('#boxed').length == 0) {
			$currentRowBG = ($('#header-outer[data-current-row-bg-color]').length > 0) ? $('#header-outer').attr('data-current-row-bg-color') : $('#header-outer').attr('data-user-set-bg');
			$('#header-outer').stop(true).transition({ x: '0px', 'background-color': $currentRowBG },700,'easeInOutCubic');
		} else {
			$('#header-outer').stop(true).transition({ x: '0px' },700,'easeInOutCubic');
		}

		$('#ascrail2000').stop(true).transition({ 'x': '0px' },700,'easeInOutCubic');
		$('body:not(.ascend) #header-outer .cart-menu').stop(true).transition({ 'x': '0px' },700,'easeInOutCubic');

		$('#slide-out-widget-area').stop(true).transition({ x: '301px' },700,'easeInOutCubic').removeClass('open');


		if($('#boxed').length == 0) {
			if($('#header-outer[data-full-width="true"]').length > 0) {  
				$('#header-outer').removeClass('highzI'); 
				$('header#top #logo').stop(true).transition({ x: '0px' },700,'easeInOutCubic'); 
				$('header#top nav > ul > li.megamenu > ul.sub-menu').stop(true).transition({'width': '100%', 'left': '0' },700,'easeInOutCubic');
				$('.lines-button').removeClass('close');

				$('body:not(.ascend) #header-outer[data-full-width="true"] header#top nav > ul.product_added').stop(true).transition({ x: '0px' },700,'easeInOutCubic');

			}
		}

		if($('#header-outer[data-format="centered-logo-between-menu"]').length > 0) {
			$('#header-outer header#top nav > ul.buttons, #header-outer .cart-outer .cart-menu-wrap').stop(true).transition({ x: '0px' },700,'easeInOutCubic'); 
		}

		//fade out overlay
		$('#slide-out-widget-area-bg').stop(true).transition({
			'opacity' : 0
		},700,'easeInOutCubic',function(){
			$('.slide-out-widget-area-toggle a').removeClass('animating');
			$(this).css({'height':'1px','width':'1px'});

			//hide menu if transparent, user has scrolled down and hhun is on
			if($('#header-outer').hasClass('parallax-contained') && $(window).scrollTop() > 0 && $('#header-outer[data-permanent-transparent="1"]').length == 0) {
				$('#header-outer').removeClass('parallax-contained').addClass('detached').removeClass('transparent');
			}
			else if($(window).scrollTop() == 0 && $('body[data-hhun="1"]').length > 0 && $('#page-header-bg[data-parallax="1"]').length > 0 ||
				$(window).scrollTop() == 0 && $('body[data-hhun="1"]').length > 0 && $('.parallax_slider_outer').length > 0) {

				if($('#header-outer[data-transparency-option="1"]').length > 0) $('#header-outer').addClass('transparent');
				$('#header-outer').addClass('parallax-contained').removeClass('detached');
			}

			//fix for fixed subpage menu
			$('.container-wrap').css('transform','none');
		});


		$('#header-outer').removeClass('style-slide-out-from-right');


		var headerResize = $('#header-outer').attr('data-header-resize');
		if($bodyBorderHeaderColorMatch == true && headerResize == 1) {
		
			$(window).off('scroll.headerResizeEffect');
			if($(window).scrollTop() == 0) {
				$(window).on('scroll.headerResizeEffect',smallNav); 

				if($('#header-outer[data-full-width="true"][data-transparent-header="true"]').length > 0 && $('.body-border-top').length > 0 && $bodyBorderHeaderColorMatch == true && $('#header-outer.pseudo-data-transparent').length > 0) {
					$('#header-outer[data-full-width="true"] header > .container').stop(true,true).animate({
						'padding' : '0'			
					},{queue:false, duration:250, easing: 'easeOutCubic'});	
				}
			}
			else
				smallNav();

			if($('#header-outer').hasClass('pseudo-data-transparent')) {
				$('#header-outer').attr('data-transparent-header','false').removeClass('pseudo-data-transparent').removeClass('transparent');
			}

		} else if ($bodyBorderHeaderColorMatch == true) {
			
			$(window).off('scroll.headerResizeEffectOpaque');
			$(window).on('scroll.headerResizeEffectOpaque',opaqueCheck);
		}



	} 

	else if($('#slide-out-widget-area').hasClass('fullscreen')) {


		$('.slide-out-widget-area-toggle:not(.std-menu) .lines-button').removeClass('close');
		//$('.slide-out-widget-area-toggle a').removeClass('animating');
		$('.blurred-wrap').removeClass('blurred');
		$('#slide-out-widget-area.fullscreen').transition({'opacity': 0 },700,'easeOutQuad',function(){ $('#slide-out-widget-area.fullscreen').hide().css('opacity','1'); }).removeClass('open');
		$('#slide-out-widget-area.fullscreen .widget').transition({'opacity': 0},700,'easeOutQuad',function(){
			$(this).transition({y: '110px'},0);
		});

		setTimeout(function(){
			$('.off-canvas-menu-container .menu > li').transition({y: '80px', 'opacity': 0},0);		
			$('#slide-out-widget-area .off-canvas-social-links li').transition({'scale':0},0);
			$('#slide-out-widget-area .off-canvas-social-links').removeClass('line-shown');
			$('#slide-out-widget-area .bottom-text').transition({'opacity':0},0);	

			//close submenu items
			$('#slide-out-widget-area .menuwrapper .menu').removeClass( 'subview' );
			$('#slide-out-widget-area .menuwrapper .menu li').removeClass( 'subview subviewopen' );
			$('#slide-out-widget-area.fullscreen .inner .off-canvas-menu-container').css('height','auto');
		},800);

		setTimeout(function(){
			showToTop();
			$('.container-wrap').removeClass('no-shadow');
		},500);

		//fade out overlay
		$('#slide-out-widget-area-bg').stop(true).transition({'opacity': 0},900,'easeOutQuad',function(){
			if($('.mobile #header-outer[data-permanent-transparent="false"]').length > 0 && $('.container-wrap').hasClass('no-scroll')) $('#ajax-content-wrap').removeClass('at-content');
			if($('.mobile #header-outer[data-permanent-transparent="false"]').length == 0) $('#slide-out-widget-area.fullscreen .inner-wrap').css('padding-top', '0');
			$('.slide-out-widget-area-toggle a').removeClass('animating');
			if($('#slide-out-widget-area-bg').hasClass('solid')) $opacity = 1;
			if($('#slide-out-widget-area-bg').hasClass('dark')) $opacity = 0.93;
			if($('#slide-out-widget-area-bg').hasClass('medium')) $opacity = 0.6;
			if($('#slide-out-widget-area-bg').hasClass('light')) $opacity = 0.4;
			$(this).css({'height':'1px','width':'1px', 'opacity': $opacity}).transition({ y : '-100%'},0);
		});

		
	}

	else if($('#slide-out-widget-area').hasClass('fullscreen-alt')) {

		$('.slide-out-widget-area-toggle:not(.std-menu) .lines-button').removeClass('close');
		//$('.slide-out-widget-area-toggle a').removeClass('animating');
		$('.blurred-wrap').removeClass('blurred');
		$('#slide-out-widget-area-bg').removeClass('open');
		
		$('#slide-out-widget-area.fullscreen-alt .widget').transition({'opacity': 0},500,'easeOutQuad',function(){
			$(this).transition({y: '40px'},0);
		});
		$('#slide-out-widget-area .bottom-text, #slide-out-widget-area .off-canvas-social-links li').transition({'opacity': 0},250,'easeOutQuad');
		$('#slide-out-widget-area .off-canvas-social-links').removeClass('line-shown');

		$('.off-canvas-menu-container .menu').transition({y: '-13px', 'opacity': 0},400);	


		setTimeout(function(){
			$('.off-canvas-menu-container .menu > li').stop(true,true).transition({y: '40px', 'opacity': 0},0);		
			$('#slide-out-widget-area .off-canvas-social-links li').transition({'scale':0},0);
			$('#slide-out-widget-area .off-canvas-social-links').removeClass('line-shown');	

			//close submenu items
			$('#slide-out-widget-area .menuwrapper .menu').removeClass( 'subview' );
			$('#slide-out-widget-area .menuwrapper .menu li').removeClass( 'subview subviewopen' );
			$('#slide-out-widget-area.fullscreen-alt .inner .off-canvas-menu-container').css('height','auto');

			if($('.mobile #header-outer[data-permanent-transparent="false"]').length > 0 && $('.container-wrap').hasClass('no-scroll')) $('#ajax-content-wrap').removeClass('at-content');
			if($('.mobile #header-outer[data-permanent-transparent="false"]').length == 0) $('#slide-out-widget-area.fullscreen-alt .inner-wrap').css('padding-top', '0');
			$('.slide-out-widget-area-toggle a').removeClass('animating');
			$('#slide-out-widget-area-bg').css({'height':'1px','width':'1px','left':'-100%'});
			$('#slide-out-widget-area.fullscreen-alt').hide().removeClass('open');
		},550);

		setTimeout(function(){
			showToTop();
		},600);

		//fade out overlay
		setTimeout(function(){
			$('#slide-out-widget-area-bg').removeClass('padding-removed');
		},50);	

		
		var borderDelay = ($bodyBorderHeaderColorMatch == true) ? 250: 50;

		setTimeout(function(){
			$('#slide-out-widget-area-bg').stop(true).css({'opacity': 0});
			$('body > div[class*="body-border"]').css('z-index','10000');
		},borderDelay);

		setTimeout(function(){
			$('#header-outer.transparent.small-nav, #header-outer.transparent.detached, #header-outer.transparent.scrolled-down').removeClass('transparent');
			
			if($('#header-outer').hasClass('pseudo-data-transparent')) {
				$('#header-outer').attr('data-transparent-header','false').removeClass('pseudo-data-transparent').removeClass('transparent');
			}

			
				setTimeout(function(){
					$('#header-outer').removeClass('no-bg-color');
					$('#header-outer-bg-only').hide();
					setTimeout(function(){
						$('#header-outer').removeClass('no-transition');
					},50);
				},250);
			

		},100);
		
	}


	

	//dark slide transparent nav
	if($('#header-outer.temp-removed-dark-slide.transparent').length > 0  && $('#boxed').length == 0) $('#header-outer').removeClass('temp-removed-dark-slide').addClass('dark-slide');

	//remove header transparent state

	if($('#header-outer[data-permanent-transparent="1"]').length == 0 && $('#slide-out-widget-area.fullscreen-alt').length == 0) {

		if($('.nectar-box-roll').length == 0) {
			if($('#header-outer.small-nav').length > 0 || $('#header-outer.scrolled-down').length > 0 || $('#header-outer.detached').length > 0) $('#header-outer').removeClass('transparent');
		} else {
			if($('#header-outer.small-nav').length > 0 || $('#header-outer.scrolled-down').length > 0 || $('.container-wrap.auto-height').length > 0) $('#header-outer').removeClass('transparent');
		}
	} 



	//remove hidden menu
	$('#header-outer').removeClass('hidden-menu');

	$('#header-outer').removeClass('side-widget-open').addClass('side-widget-closed');

	return false;
});

function slideOutWidgetOverflowState() {


	//switch position of social media/extra info based on screen size
	if(window.innerWidth < 1000 || $('body > #boxed').length > 0) {
		$('#slide-out-widget-area.fullscreen .off-canvas-social-links, #slide-out-widget-area.fullscreen-alt .off-canvas-social-links').appendTo('#slide-out-widget-area .inner');
		$('#slide-out-widget-area.fullscreen .bottom-text, #slide-out-widget-area.fullscreen-alt .bottom-text').appendTo('#slide-out-widget-area .inner');
	} else {
		$('#slide-out-widget-area.fullscreen .off-canvas-social-links,#slide-out-widget-area.fullscreen-alt .off-canvas-social-links').appendTo('#slide-out-widget-area .inner-wrap');
		$('#slide-out-widget-area.fullscreen .bottom-text, #slide-out-widget-area.fullscreen-alt .bottom-text').appendTo('#slide-out-widget-area .inner-wrap');
	}

	//add overflow
	if( $('#slide-out-widget-area[class*="fullscreen"] .inner').height() >= $(window).height()-100) { $('#slide-out-widget-area[class*="fullscreen"] .inner, #slide-out-widget-area[class*="fullscreen"]').addClass('overflow-state'); }
	else { $('#slide-out-widget-area[class*="fullscreen"] .inner, #slide-out-widget-area[class*="fullscreen"]').removeClass('overflow-state'); }

	$('#slide-out-widget-area[class*="fullscreen"] .inner').transition({ y : '-' + ($('#slide-out-widget-area[class*="fullscreen"] .inner').height()/2) + 'px' },0);

	//close mobile only slide out widget area if switching back to desktop
	if($('.slide-out-from-right.open .off-canvas-menu-container.mobile-only').length > 0 && $('body.mobile').length == 0) $('#slide-out-widget-area .slide_out_area_close').trigger('click');

}


function fullWidthHeaderSlidingWidgetMenuCalc() {
	$('header#top nav > ul > li.megamenu > ul.sub-menu').stop(true).transition({'width': $(window).width() - 360, 'left': '300px' },700,'easeInOutCubic');
}

//slide out widget area scrolling 
function slideOutWidgetAreaScrolling(){ 
	$('#slide-out-widget-area').mousewheel(function(event, delta) {

	     this.scrollTop -= (delta * 30);
	    
	     event.preventDefault();

	});
}
slideOutWidgetAreaScrolling();


//handle mobile scrolling
if(navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/)) {
	$('#slide-out-widget-area').addClass('mobile');
}


function closeOCM(item) {
    if($('#slide-out-widget-area.open').length > 0) {

    	var $windowCurrentLocation = window.location.href.split("#")[0];
		var $windowClickedLocation = item.find('> a').attr('href').split("#")[0];

    	if($windowCurrentLocation == $windowClickedLocation || item.find('a[href^="#"]').length > 0) 
        $('.slide-out-widget-area-toggle a').trigger('click');
    }
}



//fullscreen submenu


/**
 * jquery.dlmenu.js v1.0.1
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
;( function( $, window, undefined ) {

	'use strict';

	// global
	var Modernizr = window.Modernizr, $body = $( 'body' );

	$.DLMenu = function( options, element ) {
		this.$el = $( element );
		this._init( options );
	};

	// the options
	$.DLMenu.defaults = {
		// classes for the animation effects
		animationClasses : { classin : 'dl-animate-in-1', classout : 'dl-animate-out-1' },
		// callback: click a link that has a sub menu
		// el is the link element (li); name is the level name
		onLevelClick : function( el, name ) { return false; },
		// callback: click a link that does not have a sub menu
		// el is the link element (li); ev is the event obj
		onLinkClick : function( el, ev ) { return false; }
	};

	$.DLMenu.prototype = {
		_init : function( options ) {

			// options
			this.options = $.extend( true, {}, $.DLMenu.defaults, options );
			// cache some elements and initialize some variables
			this._config();
			
			var animEndEventNames = {
					'WebkitAnimation' : 'webkitAnimationEnd',
					'OAnimation' : 'oAnimationEnd',
					'msAnimation' : 'MSAnimationEnd',
					'animation' : 'animationend'
				},
				transEndEventNames = {
					'WebkitTransition' : 'webkitTransitionEnd',
					'MozTransition' : 'transitionend',
					'OTransition' : 'oTransitionEnd',
					'msTransition' : 'MSTransitionEnd',
					'transition' : 'transitionend'
				};
			// animation end event name
			this.animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ] + '.menu';
			// transition end event name
			this.transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ] + '.menu',
			// support for css animations and css transitions
			this.supportAnimations = Modernizr.cssanimations,
			this.supportTransitions = Modernizr.csstransitions;

			this._initEvents();

		},
		_config : function() {
			this.open = false;
			this.$trigger = this.$el.children( '.trigger' );
			this.$menu = this.$el.children( 'ul.menu' );
			this.$menuitems = this.$menu.find( 'li:not(.back) > a' );
			this.$el.find( 'ul.sub-menu' ).prepend( '<li class="back"><a href="#"> '+$('#slide-out-widget-area').attr('data-back-txt')+' </a></li>' );
			this.$back = this.$menu.find( 'li.back' );
		},
		_initEvents : function() {

			var self = this;

			this.$trigger.on( 'click.menu', function() {
				
				if( self.open ) {
					self._closeMenu();
				} 
				else {
					self._openMenu();
				}
				return false;

			} );
			
			this.$menuitems.on( 'click.menu', function( event ) {
				
				//event.stopPropagation();

				var $item = $(this).parent('li'),
					$submenu = $item.children( 'ul.sub-menu' );

				$('.fullscreen-alt .off-canvas-menu-container .clip-wrap, .fullscreen-alt .off-canvas-menu-container .clip-wrap span').css('transition-duration','0s');	
	
				//exit if clicking on background LI (avoids effect wrongly triggering)
				//if( $item.find('> a').length > 0 && $item.find('> a').css('display') === 'none') return false;
			
				if( $submenu.length > 0 ) {

					var $flyin = $submenu.clone().css( 'opacity', 0 ).insertAfter( self.$menu ),
						onAnimationEndFn = function() {
							self.$menu.off( self.animEndEventName ).removeClass( self.options.animationClasses.classout ).addClass( 'subview' );
							$item.addClass( 'subviewopen' ).parents( '.subviewopen:first' ).removeClass( 'subviewopen' ).addClass( 'subview' );
							$flyin.remove();
							setTimeout(function(){
								$('.off-canvas-menu-container .menu > li').removeClass('no-pointer-events');
								$('.off-canvas-menu-container .clip-wrap, .off-canvas-menu-container .clip-wrap span').css('transition-duration','.45s');
							},300);
							
			
						};

					setTimeout( function() {
						$flyin.addClass( self.options.animationClasses.classin );
						self.$menu.addClass( self.options.animationClasses.classout );
						if( self.supportAnimations ) {
							self.$menu.on( self.animEndEventName, onAnimationEndFn );
						}
						else {
							onAnimationEndFn.call();
						}

						self.options.onLevelClick( $item, $item.children( 'a:first' ).text() );
					} );


					//adjust height for mobile / widgets below
					$item.parents('.off-canvas-menu-container').css('height',$item.parents('.off-canvas-menu-container').find('.menuwrapper .menu').height()).transition({ 'height': $flyin.height() },500,'easeInOutQuad' );


					return false;

				}
				else {
		
					self.options.onLinkClick( $item.find('> a'), event );
				}

				closeOCM($item);

			});

			


			this.$back.on( 'click.menu', function( event ) {
				
				var $this = $( this ),
					$submenu = $this.parents( 'ul.sub-menu:first' ),
					$item = $submenu.parent(),

					$flyin = $submenu.clone().insertAfter( self.$menu );

				var onAnimationEndFn = function() {
					self.$menu.off( self.animEndEventName ).removeClass( self.options.animationClasses.classin );
					$flyin.remove();
				};

				setTimeout( function() {
					$flyin.addClass( self.options.animationClasses.classout );
					self.$menu.addClass( self.options.animationClasses.classin );
					if( self.supportAnimations ) {
						self.$menu.on( self.animEndEventName, onAnimationEndFn );
					}
					else {
						onAnimationEndFn.call();
					}

					$item.removeClass( 'subviewopen' );
					
					var $subview = $this.parents( '.subview:first' );
					if( $subview.is( 'li' ) ) {
						$subview.addClass( 'subviewopen' );
					}
					$subview.removeClass( 'subview' );
				} );

		
				//adjust height for mobile / widgets below
				$item.parents('.off-canvas-menu-container').css('height', $item.parents('.off-canvas-menu-container').find('.menuwrapper .menu').height())
				setTimeout(function() { 
					$item.parents('.off-canvas-menu-container').transition({ 'height': $item.parent().height() },500,'easeInOutQuad');
				},50);


				return false;

			} );
			
		},
		closeMenu : function() {
			if( this.open ) {
				this._closeMenu();
			}
		},
		_closeMenu : function() {
			var self = this,
				onTransitionEndFn = function() {
					self.$menu.off( self.transEndEventName );
					self._resetMenu();
				};
			
			this.$menu.removeClass( 'menuopen' );
			this.$menu.addClass( 'menu-toggle' );
			this.$trigger.removeClass( 'active' );
			
			if( this.supportTransitions ) {
				this.$menu.on( this.transEndEventName, onTransitionEndFn );
			}
			else {
				onTransitionEndFn.call();
			}

			this.open = false;
		},
		openMenu : function() {
			if( !this.open ) {
				this._openMenu();
			}
		},
		_openMenu : function() {
			var self = this;
			// clicking somewhere else makes the menu close
			$body.off( 'click' ).on( 'click.menu', function() {
				self._closeMenu() ;
			} );
			this.$menu.addClass( 'menuopen menu-toggle' ).on( this.transEndEventName, function() {
				$( this ).removeClass( 'menu-toggle' );
			} );
			this.$trigger.addClass( 'active' );
			this.open = true;
		},
		// resets the menu to its original state (first level of options)
		_resetMenu : function() {
			this.$menu.removeClass( 'subview' );
			this.$menuitems.removeClass( 'subview subviewopen' );
		}
	};

	var logError = function( message ) {
		if ( window.console ) {
			window.console.error( message );
		}
	};

	$.fn.dlmenu = function( options ) {
		if ( typeof options === 'string' ) {
			var args = Array.prototype.slice.call( arguments, 1 );
			this.each(function() {
				var instance = $.data( this, 'menu' );
				if ( !instance ) {
					logError( "cannot call methods on menu prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				}
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for menu instance" );
					return;
				}
				instance[ options ].apply( instance, args );
			});
		} 
		else {
			this.each(function() {	
				var instance = $.data( this, 'menu' );
				if ( instance ) {
					instance._init();
				}
				else {
					instance = $.data( this, 'menu', new $.DLMenu( options, this ) );
				}
			});
		}
		return this;
	};

} )( jQuery, window );

function fullscreenMenuInit() {
	$('#slide-out-widget-area .off-canvas-menu-container .menu').wrap('<div class="menu-wrap menuwrapper" />');
	$('#slide-out-widget-area .off-canvas-menu-container .menu').addClass('menuopen');
	$ocmAnimationClassNum = ($('#slide-out-widget-area.fullscreen-alt').length > 0) ? '4' : '5';
	$('#slide-out-widget-area .off-canvas-menu-container .menu-wrap').dlmenu({ animationClasses : { classin : 'dl-animate-in-'+$ocmAnimationClassNum, classout : 'dl-animate-out-'+$ocmAnimationClassNum } });

	//add fullscreen alt text effect 
	$('#slide-out-widget-area.fullscreen-alt .menu li, #slide-out-widget-area.slide-out-from-right-hover .menu li').each(function(){

		var $menuItemText = $(this).find('> a').html();
		$(this).find('> a ').html($menuItemText.replace(/ /g, "&nbsp;"));
		$(this).find('> a').append('<span class="clip-wrap"><span>'+$(this).find('> a').text()+'</span></span>');
	});


	$('body').on('mouseover','#slide-out-widget-area.fullscreen-alt .menu li a',function(){
		var $that = $(this);

		$(this).find('> .clip-wrap').css({'transition-duration': '0s' });
		$(this).find('> .clip-wrap span ').css({'transition-duration': '0s' });

	
			$that.find('> .clip-wrap').css({'width':'0%', 'transform':'translateX(0%)' });
			$that.find('> .clip-wrap span').css({'transform':'translateX(0%)' });
		
		

		setTimeout(function(){

			$that.find('> .clip-wrap').css({'transition-duration': '0.45s' });

			$that.find('> .clip-wrap').css({'width':'100%', 'left': '0', 'right': 'auto' });
			//$that.find('> .clip-wrap span').css({'transform':'translateX(0%)'});
		},50);
		
		
	});
	$('body').on('mouseleave','#slide-out-widget-area.fullscreen-alt .menu li a',function(){




		var $that = $(this);

		$(this).find('> .clip-wrap').css({'transition-duration': '0s' });
		$(this).find('> .clip-wrap span ').css({'transition-duration': '0s' });

		
		$that.find('> .clip-wrap').css({'width':'100%', 'transform':'translateX(0%)' });
		$that.find('> .clip-wrap span').css({'transform':'translateX(0%)' });


		$that.find('> .clip-wrap').css({'transition-duration': '0.45s' });
		$that.find('> .clip-wrap span').css({'transition-duration': '0.45s' });

		$that.find('> .clip-wrap').css({'transform':'translateX(100%)'});
		$that.find('> .clip-wrap span').css({'transform':'translateX(-100%)'});
		

	});
}
fullscreenMenuInit();

//submenu link hover fix
$('body').on('mouseover','#slide-out-widget-area .off-canvas-menu-container .menuwrapper > .sub-menu li > a',function(){
	var $currentTxt = $(this).text();
	$('.off-canvas-menu-container .menuwrapper .menu li > a').removeClass('hovered');
	$('.off-canvas-menu-container .menuwrapper .menu li > a:contains('+$currentTxt+')').addClass('hovered');
});
$('body').on('mouseover','.off-canvas-menu-container .menuwrapper .menu li > a',function(){
	$('.off-canvas-menu-container .menuwrapper .menu li > a').removeClass('hovered');
});



/***************** Page Headers ******************/

var pageHeaderHeight;
var pageHeaderHeightCopy;
var pageHeadingHeight;
var extraSpaceFromResize = ($('#header-outer[data-header-resize="1"]').length > 0 && $('.nectar-box-roll').length == 0) ? 51 : 1;
//full screen header
function fullScreenHeaderInit(){

	pageHeaderHeight = parseInt($('#page-header-bg').attr('data-height'));
	pageHeaderHeightCopy = parseInt($('#page-header-bg').attr('data-height'));

	if($('.fullscreen-header').length > 0) {

		if($('#header-outer[data-transparency-option]').length > 0 && $('#header-outer').attr('data-transparency-option') != '0'){
			var calculatedNum = (!$('body').hasClass('mobile')) ? $(window).height() : $(window).height() - parseInt($('#header-outer').height()) ;
		} else {
			var calculatedNum = (!$('body').hasClass('mobile')) ? $(window).height() - parseInt($('#header-space').height()) + extraSpaceFromResize : $(window).height() - parseInt($('#header-outer').height()) ;
		}
		var extraHeight = ($('#wpadminbar').length > 0) ? $('#wpadminbar').height() : 0; //admin bar
		if($('.nectar-box-roll').length > 0) extraHeight = 0;
		pageHeaderHeight =   calculatedNum  - extraHeight; 
		pageHeaderHeightCopy = calculatedNum - extraHeight; 
	}

	$('#page-header-bg').css('height',pageHeaderHeight+'px').removeClass('not-loaded');
	setTimeout(function(){ $('#page-header-bg').css('overflow','visible') },800);

}

fullScreenHeaderInit();

function pageHeader(){
	
	//add loaded class
	$('#page-header-bg[data-animate-in-effect="zoom-out"]').addClass('loaded');

	var $scrollTop = $(window).scrollTop();

	//full screen header
	if($('.fullscreen-header').length > 0) {
		if($('#header-outer[data-transparency-option]').length > 0 && $('#header-outer').attr('data-transparency-option') != '0'){
			var calculatedNum = (!$('body').hasClass('mobile')) ? $(window).height() : $(window).height() - parseInt($('#header-outer').height()) ;
			if($('body[data-permanent-transparent="1"]').length > 0) calculatedNum = $(window).height();
		} else {
			var calculatedNum = (!$('body').hasClass('mobile')) ? $(window).height() - parseInt($('#header-space').height()) + extraSpaceFromResize : $(window).height() - parseInt($('#header-outer').height()) ;
		}
		var extraHeight = ($('#wpadminbar').length > 0) ? $('#wpadminbar').height() : 0; //admin bar
		if($('.nectar-box-roll').length > 0) extraHeight = 0;
		pageHeaderHeight =   calculatedNum  - extraHeight; 
		pageHeaderHeightCopy = calculatedNum - extraHeight; 
	}

	if( window.innerWidth < 1000 && window.innerWidth > 690 && !$('body').hasClass('salient_non_responsive') ) {
		var $multiplier = ($('.fullscreen-header').length > 0) ? 1 : 1.6;
		$('#page-header-bg').attr('data-height', pageHeaderHeightCopy/$multiplier).css('height',pageHeaderHeightCopy/$multiplier +'px');
		$('#page-header-wrap').css('height',pageHeaderHeightCopy/$multiplier +'px');
		
	} else if( window.innerWidth <= 690 && window.innerWidth > 480 && !$('body').hasClass('salient_non_responsive')) {
		var $multiplier = ($('.fullscreen-header').length > 0) ? 1 : 2.1;
		$('#page-header-bg').attr('data-height', pageHeaderHeightCopy/$multiplier).css('height',pageHeaderHeightCopy/$multiplier +'px');
		$('#page-header-wrap').css('height',pageHeaderHeightCopy/$multiplier +'px');
		
	} else if( window.innerWidth <= 480 && !$('body').hasClass('salient_non_responsive')) {
		var $multiplier = ($('.fullscreen-header').length > 0) ? 1 : 2.5;
		$('#page-header-bg').attr('data-height', pageHeaderHeightCopy/$multiplier).css('height',pageHeaderHeightCopy/$multiplier +'px');
		$('#page-header-wrap').css('height',pageHeaderHeightCopy/$multiplier +'px');
		
	} else {
		$('#page-header-bg').attr('data-height', pageHeaderHeightCopy).css('height',pageHeaderHeightCopy +'px');
		if($('.fullscreen-header').length > 0){
			$('#page-header-wrap').css('height',pageHeaderHeightCopy +'px');
		} else {
			$('#page-header-wrap').css('height',pageHeaderHeightCopy +'px');
		}

		if($('#page-header-bg[data-parallax="1"]').length == 0) $('#page-header-wrap').css('height',pageHeaderHeightCopy +'px');
	}

	
	
	if(!$('body').hasClass('mobile')){
		
		//recalc
		pageHeaderHeight = parseInt($('#page-header-bg').attr('data-height'));
		$('#page-header-bg .container > .row').css('top',0);
		var $divisionMultipler = ($('#header-outer[data-remove-border="true"]').length > 0) ? 2 : 1;

		//center the heading
		pageHeadingHeight = $('#page-header-bg .col.span_6').height();
		
		if($('#header-outer[data-transparent-header="true"]').length > 0 && $('.fullscreen-header').length == 0) {
			$('#page-header-bg:not("[data-parallax=1]") .col.span_6').css('top', ((pageHeaderHeight+$('#header-space').height()/$divisionMultipler)/2) - (pageHeadingHeight/2));
		} else {
			var $extraResizeHeight = ($('#header-outer[data-header-resize="1"]').length > 0) ? 22: 0;
			$('#page-header-bg:not("[data-parallax=1]") .col.span_6').css('top', (pageHeaderHeight/2) - (pageHeadingHeight/2) + $extraResizeHeight);
		}
		
		//center portfolio filters
		$('#page-header-bg:not("[data-parallax=1]") .portfolio-filters').css('top', (pageHeaderHeight/2) + 2);	
		
		if($('#page-header-bg[data-parallax="1"] .span_6').css('opacity') > 0) {
			
			if($('#header-outer[data-transparent-header="true"]').length > 0 && $('body.single-post .fullscreen-header').length == 0) {
				//center the parallax heading

			    $('#page-header-bg[data-parallax="1"] .span_6').css({ 
					'opacity' : 1-($scrollTop/(pageHeaderHeight-($('#page-header-bg .col.span_6').height()*2)+60)),
					'top' : (((pageHeaderHeight+$('#header-space').height()/$divisionMultipler)/2) - (pageHeadingHeight/2)) +"px"
			    });
			    
			    //center parllax portfolio filters
			    $('#page-header-bg[data-parallax="1"] .portfolio-filters').css({ 
					'opacity' : 1-($scrollTop/(pageHeaderHeight-($('#page-header-bg .col.span_6').height()*2)+75)),
					'top' : ($scrollTop*-0.10) + ((pageHeaderHeight/2)) - 7 +"px"
			    });
		  } else {
		  		//center the parallax heading
			    $('#page-header-bg[data-parallax="1"] .span_6').css({ 
					'opacity' : 1-($scrollTop/(pageHeaderHeight-($('#page-header-bg .col.span_6').height()*2)+60)),
					'top' : ((pageHeaderHeight/2) - (pageHeadingHeight/2)) +10 +"px"
			    });
			    
			    //center parllax portfolio filters
			    $('#page-header-bg[data-parallax="1"] .portfolio-filters').css({ 
					'opacity' : 1-($scrollTop/(pageHeaderHeight-($('#page-header-bg .col.span_6').height()*2)+75)),
					'top' : ($scrollTop*-0.10) + ((pageHeaderHeight/2)) - 7 +"px"
			    });
		  }
	   }
	}
	
	else {
		//recalc
		pageHeaderHeight = parseInt($('#page-header-bg').attr('data-height'));
		
		//center the heading
		var pageHeadingHeight = $('#page-header-bg .container > .row').height();
		$('#page-header-bg .container > .row').css('top', (pageHeaderHeight/2) - (pageHeadingHeight/2) + 5);
		
	}


	$('#page-header-bg .container > .row').css('visibility','visible');
}

var $pt_timeout = ($('body[data-ajax-transitions="true"]').length > 0 && $('#page-header-bg[data-animate-in-effect="slide-down"]').length > 0) ? 350 : 0; 
setTimeout(function(){ pageHeader(); },$pt_timeout);


if($('#header-outer').attr('data-header-resize') == '' || $('#header-outer').attr('data-header-resize') == '0'){
	$('#page-header-wrap').css('margin-top','0');
}


function extractUrl(input) {
	return input.replace(/"/g,"").replace(/url\(|\)$/ig, "");
}
 
/***************** Parallax Page Headers ******************/
if($('#page-header-bg[data-parallax="1"]').length > 0) {

	//fadeIn

	var img = new Image();
	
	var imgX, imgY, aspectRatio;
	var diffX, diffY;
	var pageHeadingHeight = $('#page-header-bg .col.span_6').height();
	var pageHeaderHeight = parseInt($('#page-header-bg').attr('data-height'));
	var headerPadding2 = parseInt($('#header-outer').attr('data-padding'))*2;
	var wooCommerceHeader = ($('.demo_store').length > 0) ? 32 : 0 ;
	
	
	var $initialImgCheck = extractUrl($('#page-header-bg[data-parallax="1"]').css('background-image'));
	
	if ($initialImgCheck && $initialImgCheck.indexOf('.') !== -1) {    
		img.onload = function() {
		   pageHeaderInit(); 
		}
		
		img.src = extractUrl($('#page-header-bg[data-parallax="1"]').css('background-image'));
		
	} else {
		 pageHeaderInit();
	}
	
	
	
	var extraHeight = ($('#wpadminbar').length > 0) ? $('#wpadminbar').height() : 0; //admin bar


	 if($('body[data-hhun="1"]').length > 0)  $('#header-outer').addClass('parallax-contained');

	 window.addEventListener('scroll', function(){ 
        window.requestAnimationFrame(bindHeaderParallax);
    }, false);

}


function bindHeaderParallax(){

	var $scrollTop = $(window).scrollTop();
	var pageHeadingHeight = $('#page-header-bg .col.span_6').height();
	
	
	if(!$('body').hasClass('mobile') && navigator.userAgent.match(/iPad/i) == null){

		var $multiplier1 =  ($('body[data-hhun="1"]').length > 0) ? 0.40: 0.2;
   	    var $multiplier2 = ($('body[data-hhun="1"]').length > 0) ? 0.09: 0.14;
   	    var $parallaxHeaderHUN = ($('#header-outer[data-transparency-option="1"]').length > 0) ? 0.49: 0.4;

		//calc bg pos
		//$('#page-header-bg[data-parallax="1"]').css({'top': ((- $scrollTop / 5)+logoHeight+headerPadding+headerResizeOffExtra+extraHeight-extraDef+secondaryHeader)  + 'px' });
		if($('#page-header-bg .nectar-particles').length == 0 && $('#page-header-bg.out-of-sight').length == 0) {

			$('#page-header-bg[data-parallax="1"]').css({ 'transform': 'translateY('+ $scrollTop*-$multiplier1 +'px)' });	
		
			var multipler = ($('body').hasClass('single')) ? 1 : 2;
			$('#page-header-bg[data-parallax="1"] .span_6,  #page-header-bg[data-parallax="1"][data-post-hs="default_minimal"] .author-section').css({ 
				'opacity' : 1-($scrollTop/(pageHeaderHeight-60))
			});
			
			$('#page-header-bg[data-parallax="1"] .span_6, body[data-button-style="rounded"] #page-header-bg[data-parallax="1"] .section-down-arrow, #page-header-bg[data-parallax="1"][data-post-hs="default_minimal"] .author-section').css({ 'transform': 'translateY('+ $scrollTop*- $multiplier2+'px)' });
			
			
			if($('#page-header-bg[data-parallax="1"] .span_6').css('opacity') == 0){
				$('#page-header-bg[data-parallax="1"] .span_6, #page-header-bg[data-parallax="1"] .portfolio-filters').hide();
			} else {
				$('#page-header-bg[data-parallax="1"] .span_6, #page-header-bg[data-parallax="1"] .portfolio-filters').show();
			}

			if($('body[data-hhun="1"]').length > 0  && !$('#header-outer').hasClass('side-widget-open') && !$('#header-outer .slide-out-widget-area-toggle a').hasClass('animating')) { 
	            $('#header-outer.parallax-contained').css({ 'transform': 'translateY('+$scrollTop*-$parallaxHeaderHUN+'px)' });
	        }
			
		
		}
		else if($('#page-header-bg.out-of-sight').length == 0) {
			//alt parallax effect
			var multipler = ($('body').hasClass('single')) ? 1 : 2;
			$('#page-header-wrap .nectar-particles .fade-out').css({ 
				'opacity' : 0+($scrollTop/(pageHeaderHeight+pageHeaderHeight*$multiplier))
			});
		}


		//hide elements to allow other parallax sections to work in webkit browsers
		if( ($scrollTop / (pageHeaderHeight + $('#header-space').height() + extraHeight)) > 1 ) {
			$('#page-header-bg, .nectar-particles, #page-header-bg .fade-out').css('visibility','hidden').hide().addClass('out-of-sight');
		}
		else {
		 	$('#page-header-bg, .nectar-particles, #page-header-bg .fade-out').css('visibility','visible').show().removeClass('out-of-sight');

		 		//ensure header is centered
		 		pageHeaderHeight = parseInt($('#page-header-bg').attr('data-height'));
				$('#page-header-bg .container > .row').css('top',0);
				var $divisionMultipler = ($('#header-outer[data-remove-border="true"]').length > 0) ? 2 : 1;
				pageHeadingHeight = $('#page-header-bg .col.span_6').height();

				if($('#header-outer[data-transparent-header="true"]').length > 0 && $('body.single-post .fullscreen-header').length == 0) {
					//center the parallax heading
				    $('#page-header-bg[data-parallax="1"] .span_6').css({ 
						'top' : (((pageHeaderHeight+$('#header-space').height()/$divisionMultipler)/2) - (pageHeadingHeight/2)) +"px"
				    });

			  	} else {
			  		//center the parallax heading
				    $('#page-header-bg[data-parallax="1"] .span_6').css({ 
						'top' : ((pageHeaderHeight/2) - (pageHeadingHeight/2)) +10 +"px"
				    });
			  	}
	    }
		

	}

}

if($('#page-header-bg').length > 0) {
	var $initialImgCheckAscend = extractUrl($('#page-header-bg').css('background-image'));
	if ($initialImgCheckAscend && $initialImgCheckAscend.indexOf('.') !== -1) {    
		   $('#page-header-bg').addClass('has-bg');
	}
}


function pageHeaderInit(){

	 var wooCommerceHeader = ($('.demo_store').length > 0) ? 32 : 0 ;
	 var centeredNavAltSpace = ($('#header-outer[data-format="centered-menu-under-logo"]').length > 0) ? $('header#top nav > .sf-menu').height() -20 : null;
	 //transparent
	  if($('#header-outer[data-transparent-header="true"]').length > 0) {	
	     $('#page-header-bg[data-parallax="1"]').css({'top': extraHeight+wooCommerceHeader });
	  } else {

	  	 var logoHeight = parseInt($('#header-outer').attr('data-logo-height'));
		 var headerPadding = parseInt($('#header-outer').attr('data-padding'));
		 var headerPadding2 = parseInt($('#header-outer').attr('data-padding'));
		 var extraDef = 10;
		 var headerResize = ($('body').hasClass('pp-video-function')) ? '1' : $('#header-outer').attr('data-header-resize');
		 var headerResizeOffExtra = 0;
		 var extraHeight = ($('#wpadminbar').length > 0) ? $('#wpadminbar').height() : 0; //admin bar
		 var usingLogoImage = true;
	     var mediaElement = ($('.wp-video-shortcode').length > 0) ? 36 : 0;
	     var secondaryHeader = ($('#header-outer').attr('data-using-secondary') == '1') ? 32 : 0 ;
	  	 if($('body[data-header-resize="0"]').length == 0) $('#page-header-bg[data-parallax="1"]').css({'top': (logoHeight+headerPadding+centeredNavAltSpace+headerResizeOffExtra+extraHeight-extraDef+secondaryHeader+wooCommerceHeader)  + 'px' });
	  }
	  
	  //fade in header
	  if($('#ajax-content-wrap').length == 0 || !$('body').hasClass('ajax-loaded')){
	  	$('#page-header-bg[data-parallax="1"]').animate({ 'opacity' : 1},650,'easeInCubic');
	  } else if($('#ajax-content-wrap').length == 1) {
	  	$('#page-header-bg[data-parallax="1"]').css({ 'opacity' : 1});
	  }

	  //$('#page-header-wrap').css({'height' : pageHeaderHeight});
	  
	  //verify smooth scorlling
	  if( $smoothCache == true && $(window).width() > 690 && $('body').outerHeight(true) > $(window).height() && Modernizr.csstransforms3d && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/)){ niceScrollInit(); $(window).trigger('resize') } 
	  
	  /* $('#page-header-bg[data-parallax="1"] .span_6').css({ 
			'opacity' : 1-($scrollTop/(pageHeaderHeight-($('#page-header-bg .col.span_6').height()*2)+60))
			'top' : ((pageHeaderHeight/2) - (pageHeadingHeight/2)) +10 +"px"
	   });
	   
	   $('#page-header-bg[data-parallax="1"] #portfolio-filters').css({ 
			'opacity' : 1-($scrollTop/(pageHeaderHeight-($('#page-header-bg .col.span_6').height()*2)+75)),
			'top' : ($scrollTop*-0.10) + ((pageHeaderHeight/2)) - 7 +"px"
	   }); */
	  
	  $('#page-header-bg[data-parallax="1"] .nectar-particles').append('<div class="fade-out" />');
}




function nectarPageHeader() {

	if($('#page-header-bg').length > 0) {
		fullScreenHeaderInit();
		pageHeader();
	}


	if($('#page-header-bg[data-parallax="1"]').length > 0) {

		var img = new Image();
		var $initialImgCheck = extractUrl($('#page-header-bg[data-parallax="1"]').css('background-image'));
			
		if ($initialImgCheck && $initialImgCheck.indexOf('.') !== -1) {    
			img.onload = function() {
			   pageHeaderInit();    
					
			}
			
			img.src = extractUrl($('#page-header-bg[data-parallax="1"]').css('background-image'));
			
		} else {
			 pageHeaderInit();
		}

		//bindHeaderParallax();
		$('#page-header-bg[data-parallax="1"] .span_6').css({ 
			'opacity' : 1
		});

		

		if (window.addEventListener) {
			 window.addEventListener('scroll', function(){ 
	          requestAnimationFrame(bindHeaderParallax); 
	        }, false);
		}

	} 

	if($('#page-header-bg').length > 0) {
		var $initialImgCheckAscend = extractUrl($('#page-header-bg').css('background-image'));
		if ($initialImgCheckAscend && $initialImgCheckAscend.indexOf('.') !== -1) {    
			   $('#page-header-bg').addClass('has-bg');
		}
	}
}

if(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1 || navigator.userAgent.match(/(iPod|iPhone|iPad)/)){
	window.onunload = function(){ nectarPageHeader(); };
}


/***************** header text effects *****************/

// rotate in
function pageHeaderTextEffectInit() {
	$('#page-header-bg').each(function(){
		if($(this).attr('data-text-effect') == 'rotate_in') {
			var $topHeading = 'none';

			if($(this).find('.span_6 h1').length > 0) {
				$topHeading = 'h1';
			} 
			//else if ($(this).find('.span_6 h2').length > 0) {
			//	$topHeading = 'h2';
			//}

			if($topHeading != 'none') {

				var $selector = ($(this).find('.nectar-particles').length > 0) ? '.inner-wrap.shape-1' : '.span_6';

				$(this).find($selector).find($topHeading).addClass('top-heading').contents().filter(function () {
			        return this.nodeType === 3 && typeof this.data != 'undefined' && this.data.replace(/\s+/, "");
			    }).wrap('<span class="wraped"></span>');

			    $(this).find($selector).find('.wraped').each(function () {

				    textNode = $(this);

				    text = textNode.text().split(' ');
				    replace = '';

				    $.each(text, function (index, value) {
				        if (value.replace(/\s+/, "")) {
				            replace += '<span class="wraped"><span>' + value + '</span></span> ';
				        }
				    });
				    textNode.replaceWith($(replace));
				    
				});
			}//make sure suitable heading was found

		}//tilt
	});
	
}
function pageHeaderTextEffect() {

	if($('#page-header-bg .nectar-particles').length == 0 && $('#page-header-bg[data-text-effect="none"]').length == 0 || $('.nectar-box-roll').length > 0 && $('#page-header-bg .nectar-particles').length == 0) {

		var $selector = ($('.nectar-box-roll').length == 0) ? '#page-header-bg .span_6' : '.nectar-box-roll .overlaid-content .span_6';

		$($selector).find('.wraped').each(function(i){
			$(this).find('span').delay(i*370).transition({ rotateX: '0', 'opacity' : 1, y: 0},400,'easeOutQuad');
		});

		setTimeout(function(){

			$($selector).find('.inner-wrap > *:not(.top-heading)').each(function(i){
				$(this).delay(i*370).transition({ rotateX: '0', 'opacity' : 1, y: 0 },650,'easeOutQuad');
			});

			$('.scroll-down-wrap').removeClass('hidden');

		}, $($selector).find('.wraped').length * 370);
	}

}
var $effectTimeout = ($('#ajax-loading-screen').length > 0) ? 800 : 0;
pageHeaderTextEffectInit();
if($('#page-header-bg .nectar-video-wrap video').length == 0) setTimeout(pageHeaderTextEffect,$effectTimeout);




 //submenu fix
  if($('header#top nav > ul.sf-menu ul').length > 0) {

  	var $midnightSubmenuTimeout;
  	$('body').on('mouseover','#header-outer .midnightHeader .sf-with-ul, #header-outer .midnightHeader .cart-menu',function(){

  		if($(this).parents('.midnightHeader').offset().top - $(window).scrollTop() < 50){
  		
  			$(this).parents('.midnightHeader').css({'z-index': '9999'}).addClass('overflow');
  			$(this).parents('.midnightInner').css('overflow','visible');
  		}
  	});
  	$('body').on('mouseleave','#header-outer .midnightHeader',function(){
  		var $that = $(this);
  		clearTimeout($midnightSubmenuTimeout);
  		$midnightSubmenuTimeout = setTimeout(function(){
  			if(!$that.is(':hover')) {
  				$that.css({'z-index': 'auto'}).removeClass('overflow');
  				$that.find('.midnightInner').css('overflow','hidden');
  		
  			}

  		},900);
  	});
  }

  function midnightInit() {
  	if( $('#header-outer[data-permanent-transparent="1"]').length > 0 && $('body[data-bg-header="true"]').length > 0) {
  		 $('#header-outer').midnight();

  		 //no menu
  		 if($('#header-outer[data-has-menu="false"]').length > 0 && $('#header-outer[data-format="centered-logo-between-menu"]').length == 0) {
  			 //fix the pointer events
  			 //var enableHandler = false;

  			 var $buttonsOffset = ($('#social-in-menu').length > 0) ? $('#social-in-menu').position() : $('#header-outer header#top nav > ul.buttons').position();
  			 if($('#header-outer #logo img:visible').length > 0) {
  			 	var $logoOffset = $('#header-outer #logo img:visible').position();
  			 	var $logoOffsetTop = $('#header-outer #logo img:visible').position().top;
  			 	var $logoMargin = parseInt($('#header-outer #logo img:visible').css('margin-top'));
  			 	var $logoWidth = $('#header-outer #logo img:visible').width();
  			 } else {
  			 	var $logoOffset = $('#header-outer .span_3 #logo:visible').offset();
  			 	var $logoOffsetTop = $('#header-outer .span_3 #logo:visible').offset().top - $(window).scrollTop();
  			 	var $logoMargin = parseInt($('#header-outer .span_3 #logo:visible').css('margin-top'));
  			 	var $logoWidth = $('#header-outer #logo').width();
  			 }
  			 var $bodyBorderSize = ($('.body-border-top').length > 0) ? $('.body-border-top').height() : 0;

  			 var $containerMargin = parseInt($('#header-outer header > .container').css('padding-left'));
  			 var $headerOffset = $('#header-outer').position();
  			 //recalc offsets
  			 $(window).on('smartresize', function(){
  			 	if($('#header-outer #logo img').length > 0) {
  				 	$logoMargin = parseInt($('#header-outer #logo img:visible').css('margin-top'));
  				 	$logoOffset = $('#header-outer #logo img:visible').position();
  				 	$logoOffsetTop = $('#header-outer #logo img:visible').position().top;
  				 	$logoWidth = $('#header-outer #logo img:visible').width();
  				 } else {
  				 	$logoMargin = parseInt($('#header-outer .span_3 #logo:visible').css('margin-top'));
  				 	$logoOffset = $('#header-outer .span_3 #logo:visible').offset();
  				 	$logoOffsetTop = $('#header-outer .span_3 #logo:visible').offset().top - $(window).scrollTop();
  				 	$logoWidth = $('#header-outer #logo').width();
  				 }
  			 	$containerMargin = parseInt($('#header-outer header > .container').css('padding-left'));
  			    $buttonsOffset = ($('#social-in-menu').length > 0) ? $('#social-in-menu').position() : $('#header-outer header#top nav > ul.buttons').position();
  			    $headerOffset = $('#header-outer').position();
  			 });

  			 $('body').mousemove(function(e){
  			 	if($('body.mobile').length == 0) {
  			 	
  					 	//hover over buttons || logo check
  					 	if(e.clientX >= $buttonsOffset.left + $containerMargin && 
  					 	   e.clientY >= $buttonsOffset.top + $bodyBorderSize && 
  					 	   e.clientY <= $buttonsOffset.top + $headerOffset.top + $bodyBorderSize + $('#header-outer header#top nav > ul.buttons').height() ||
  					 	   e.clientX <= $logoOffset.left + $containerMargin + $logoWidth &&
  					 	   e.clientY >= $logoOffsetTop + $bodyBorderSize&& 
  					 	   e.clientY <= $logoOffsetTop + $logoMargin + $bodyBorderSize + $headerOffset.top + $('#header-outer #logo img:visible').height() ) {
  					 		$('.midnightHeader, #header-outer').removeClass('no-pointer-events');

  					 	} else {
  					 		$('.midnightHeader, #header-outer').addClass('no-pointer-events');
  					 	}

  					
  				} else {
  					$('.midnightHeader, #header-outer').removeClass('no-pointer-events');
  				}
  			 });

  	
  		}

  		//using menu
  		else if($('#header-outer[data-has-menu="true"]').length > 0) {

  			 var $headerPos = $('header#top .container').position();
  			 var $headerOffset = $('header#top .container').offset();
  			 var $bodyBorderSize = ($('.body-border-top').length > 0) ? $('.body-border-top').height() : 0;

  			 //recalc offsets
  			 $(window).on('smartresize', function(){
  			 	
  			    $headerPos = $('header#top .container').position();
  			    $headerOffset = $('header#top .container').offset();

  			 });

  			 $('body').mousemove(function(e){
  			 	if($('body.mobile').length == 0) {

  					 	//hover over buttons || logo check
  					 	if(e.clientX >= $headerOffset.left &&
  					 	   e.clientY >= $headerPos.top  + $bodyBorderSize && 
  					 	   e.clientY <= $('header#top .container .row').height() + $bodyBorderSize) {
  					 		$('.midnightHeader, #header-outer').removeClass('no-pointer-events');
  					 	} else if($('li.sfHover').length == 0) {
  					 		$('.midnightHeader, #header-outer').addClass('no-pointer-events');
  					 	}

  					
  				} else {
  					$('.midnightHeader, #header-outer').removeClass('no-pointer-events');
  				}
  			 });

  		}
  	}
  }



//box roll
function getScrollbarWidth() {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);        

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
}


function boxRollInit() {
	if($('.nectar-box-roll').length > 0) { 

		$('body').attr('data-scrollbar-width',getScrollbarWidth());

		$('body, html, #ajax-content-wrap, .container-wrap, .blurred-wrap').addClass('no-scroll');
		$('body,html').stop().animate({ scrollTop:0 },0);
		$('.container-wrap').css('opacity',0).addClass('no-transform-animation-bottom-out').addClass('bottomBoxOut');
		//keep loading icon centered if scrollbar is going away
		if($('.mobile').length == 0) $('#ajax-loading-screen .loading-icon > span').css({ 'left' : '-'+getScrollbarWidth()/2 +'px'});

		//change content pos
		var $overlaid = $('#page-header-bg .overlaid-content').clone();
		var $scrollDownOverlaid = $('.scroll-down-wrap').clone();
		$('#page-header-bg').removeAttr('data-midnight');
		$('#page-header-bg .overlaid-content, #page-header-bg .scroll-down-wrap').remove();
		$('.nectar-box-roll').append($overlaid).attr('data-midnight','light');
		$('.overlaid-content').append($scrollDownOverlaid);


		nectarBoxRollContentHeight();
		setTimeout(function() { pageLoadHash(); },700);
	} else {
		$('#ajax-content-wrap, .blurred-wrap').addClass('at-content');
		$('body, html, #ajax-content-wrap, .container-wrap, .blurred-wrap').removeClass('no-scroll');
		$('.container-wrap').css('opacity',1).removeClass('no-transform-animation-bottom-out').removeClass('bottomBoxOut').removeClass('bottomBoxIn');
		perspect = 'not-rolled';
	}
}
boxRollInit();

function nectarBoxRollContentHeight() {
	/*if($('#header-outer[data-transparent-header="true"]').length == 0 && $('.mobile').length == 0) {
		$('.nectar-box-roll').css('top',$('#header-space').height());
	} else {
		$('.nectar-box-roll').css('top','0');
	}*/
	
	if($('#header-outer[data-transparent-header="true"]').length == 0) {
		$('.nectar-box-roll .overlaid-content, .nectar-box-roll .canvas-bg, .container-wrap').css({'height':window.innerHeight - $('#header-space').height(), 'min-height':window.innerHeight - $('#header-space').height() });
		if($('.mobile').length == 0) { $('#ajax-content-wrap').css('margin-top',$('#header-space').height()); $('#slide-out-widget-area.fullscreen').css('margin-top','-'+$('#header-space').height()+'px'); }
		else $('#ajax-content-wrap, #slide-out-widget-area.fullscreen').css('margin-top','0');
	} else {
		$('.nectar-box-roll .overlaid-content, .nectar-box-roll .canvas-bg, .container-wrap').css('height',window.innerHeight);
	}
}

if($('.nectar-box-roll').length > 0) $(window).on('resize',nectarBoxRollContentHeight);


var perspect = 'not-rolled';
var animating = 'false';
function boxRoll(e,d) {
	
	if($('#slide-out-widget-area.open').length > 0) return false;
	if( $('.nectar-box-roll canvas').length > 0 && $('.nectar-box-roll canvas[data-loaded="true"]').length == 0) return false;

	if(perspect == 'not-rolled' && animating == 'false' && d == -1) {
		perspect = 'rolled';
		animating = 'true';
		$('body').addClass('box-animating').addClass('box-perspective-rolled').addClass('box-rolling');

		$('.nectar-box-roll #page-header-bg').removeClass('topBoxIn').addClass('topBoxOut').css('will-change','transform');
		
		$('.nectar-box-roll .overlaid-content').removeClass('topBoxIn2').removeClass('topBoxIn').addClass('topBoxOut2').css('will-change','transform');
		
		$('.container-wrap').removeClass('bottomBoxOut').addClass('bottomBoxIn').removeClass('no-transform-animation-bottom-out').addClass('nectar-box-roll-class').css('will-change','transform');
		if($('#header-outer[data-transparent-header="true"]').length == 0) {
			$('.container-wrap').css({'height':$(window).height() - $('#header-space').height(), 'opacity': 1});
			$('#slide-out-widget-area.fullscreen').css('margin-top','0px');
		} else {
			$('.container-wrap').css({'height':$(window).height(), 'opacity': 1});
		}
		

		$('.nectar-slider-wrap').css({'opacity':0});

		updateRowRightPadding(d);
		pauseVideoBG();

		//old browser workaround
		var timeout1 = 1220;
		var timeout2 = 1650;
		var timeout3 = 1700;
		var timeout4 = 1350;
		if( $('html.no-cssanimations').length > 0) {
			timeout1 = 1;
			timeout2 = 1;
			timeout3 = 1;
			timeout4 = 1;
		}

		$('.container-wrap').css('padding-right',$('body').attr('data-scrollbar-width') + 'px');
		setTimeout(function(){
			$('#header-outer, #wpadminbar, .cart-outer .cart-menu, .midnightHeader .midnightInner').animate({'padding-right': $('body').attr('data-scrollbar-width')},250);
			$('.nectar-box-roll .canvas-bg').addClass('out-of-sight');
			if($('#header-outer[data-permanent-transparent="1"]').length == 0) $('#header-outer').removeClass('transparent');

			if($('body.mobile').length > 0) $('.nectar-box-roll').css({'z-index':'1'});
		},timeout1);
		setTimeout(function(){ 
			updateRowRightPadding(1);
			$('body,html,#ajax-content-wrap, .container-wrap, .blurred-wrap').removeClass('no-scroll'); 
			$('#ajax-content-wrap, .blurred-wrap').addClass('at-content');
			$('.container-wrap, #footer-outer').removeClass('bottomBoxIn').removeClass('nectar-box-roll-class').addClass('auto-height');
			$('#header-outer, #wpadminbar, .container-wrap, .cart-outer .cart-menu, .midnightHeader .midnightInner').stop().css('padding-right',0);

			if( $smoothActive == 1 && $(window).width() > 690  && Modernizr.csstransforms3d && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|Opera Mini)/)){ 
				niceScrollInit();
			}
			
			$('.nectar-box-roll').css({'z-index':'-1000'}).transition({'y': '-200%'},0);
			$('.nectar-box-roll canvas').hide();
			$('body').removeClass('box-rolling');
			$('.nectar-slider-wrap').transition({'opacity':1},600,'easeOutCubic');

			$('.nectar-box-roll #page-header-bg, .nectar-box-roll .overlaid-content, .container-wrap').css('will-change','auto');
			if($waypointsBound == false) waypoints();	
		},timeout2);
		
		//fadeIn
		setTimeout(function(){ 
			$('.container-wrap .main-content > .row > div > div[class*="col"]').css({'opacity':1});
		},timeout4);

		setTimeout(function(){ 
					animating ='false'; 
					$('body').removeClass('box-animating');		
		},timeout3);

		//header position when transparent nav was used
		if($('#header-outer[data-permanent-transparent="1"]').length == 0 && $('.mobile').length == 0 && $('#header-outer[data-transparent-header="true"]').length != 0) { 
			$('#ajax-content-wrap').transition({'margin-top':$('#header-outer').outerHeight(true) + $('#header-outer').offset().top},2000,'easeInOutQuad');
		}
		/*if($('#header-outer[data-transparent-header="true"]').length == 0 && $('.mobile').length == 0) {
			$('.nectar-box-roll').transition({'top': 0},2000,'easeInOutQuad');
		}*/
		

		//remove header if not fixed
		if($('.mobile #header-outer[data-permanent-transparent="1"]').length > 0 && $('.mobile #header-outer[data-mobile-fixed="false"]').length == 1) $('#header-outer').transition({'y':'-100%'},400,'easeOutCubic');

	}

	else if(perspect == 'rolled' && animating == 'false' && d == 1 && $(window).scrollTop() < 100) {

		$('.container-wrap').removeClass('auto-height');
		if($('#header-outer[data-transparent-header="true"]').length == 0) {
			$('.container-wrap').css({'height':$(window).height() - $('#header-space').height(), 'opacity': 1});
		} else {
			$('.container-wrap').css({'height':$(window).height(), 'opacity': 1});
		}
		
		$('#footer-outer').removeClass('auto-height');
		$('body').addClass('box-rolling');

		perspect = 'not-rolled';
		animating = 'true';
		$('body').addClass('box-animating').addClass('box-perspective-not-rolled');

		$('#header-outer, #wpadminbar, .container-wrap, .cart-outer .cart-menu, .midnightHeader .midnightInner').css('padding-right',$('body').attr('data-scrollbar-width') + 'px');
		$('.nectar-slider-wrap').transition({'opacity':0},600,'easeOutCubic');
		$('.container-wrap .main-content > .row > div > div[class*="col"]').stop(true).css({'opacity':0});
		setTimeout(function(){
			$('#header-outer, #wpadminbar, .cart-outer .cart-menu, .midnightHeader .midnightInner').animate({'padding-right': 0},250);
			$('.nectar-box-roll .canvas-bg').removeClass('out-of-sight');
			resizeVideoToCover();
			//header position when transparent nav was used
			if($('#header-outer[data-transparent-header="true"]').length != 0) { 
				$('#ajax-content-wrap').stop(true,true).transition({'margin-top':0},2000,'easeInOutCubic');
			} else {
				if($('.mobile').length == 0) $('#slide-out-widget-area.fullscreen').css('margin-top','-'+$('#header-space').height()+'px');
			}
			//if($('#header-outer[data-permanent-transparent="1"]').length == 0 && $('.mobile').length == 0 ) $('.nectar-box-roll').transition({'top': $('#header-space').height() },2000,'easeInOutQuad');
			
		},30);

		//old browser workaround
		var timeout1 = 1700;
		var timeout2 = 1600;
		var timeout3 = 1300;
		if( $('html.no-cssanimations').length > 0) {
			timeout1 = 1;
			timeout2 = 1;
			timeout3 = 1;
		}

		if($('body.mobile').length > 0) {
			setTimeout(function(){
				$('.nectar-box-roll').css('z-index','1000');
			},timeout3);
		} else {
			$('.nectar-box-roll').css('z-index','1000');
		}

		updateRowRightPadding(d);
		removeNiceScroll();
		$('.nectar-box-roll').transition({'y': '0'},0);
		$('.nectar-box-roll canvas').show();
		setTimeout(function(){ 
			updateRowRightPadding(1);
			animating ='false'; 
			$('body').removeClass('box-animating');
			$('#page-header-bg').removeClass('topBoxIn');
			$('.overlaid-content').removeClass('topBoxIn2');	
			$('body').removeClass('box-rolling');
			resumeVideoBG();
			$('.nectar-box-roll #page-header-bg, .nectar-box-roll .overlaid-content, .container-wrap').css('will-change','auto');
		},timeout1);

		setTimeout(function(){
			if($('.mobile #header-outer[data-permanent-transparent="1"]').length > 0 && $('.mobile #header-outer[data-mobile-fixed="false"]').length == 1) $('#header-outer').transition({'y':'0%'},400,'easeOutCubic');
		},timeout2);

		$('body,html,#ajax-content-wrap, .container-wrap, .blurred-wrap').addClass('no-scroll');
		$('#ajax-content-wrap, .blurred-wrap').removeClass('at-content');
		$('.container-wrap').addClass('nectar-box-roll-class');
		$('.nectar-box-roll #page-header-bg').removeClass('topBoxOut').addClass('topBoxIn').css('will-change','transform');
		
		$('.container-wrap').removeClass('bottomBoxIn').addClass('bottomBoxOut').css('will-change','transform');

		if($('#header-outer[data-transparent-header="true"]').length > 0 && $('#header-outer[data-permanent-transparent="1"]').length == 0) $('#header-outer').addClass('transparent');

		$('.nectar-box-roll .overlaid-content').removeClass('topBoxOut2').removeClass('topBoxOut').addClass('topBoxIn2').css('will-change','transform');
	
		if($('#header-outer[data-header-resize="1"]').length > 0) { bigNav(); }

		$('.nectar-box-roll .trigger-scroll-down').removeClass('hovered');
	}

	
}

function boxScrollEvent(event, delta) {
	if($('#slide-out-widget-area.open.fullscreen').length > 0) return false;
	boxRoll(event,delta);
}

function boxRollMouseWheelInit() {
	if($('.nectar-box-roll').length > 0) {
		$('body').on("mousewheel", boxScrollEvent);
	} else {
		$('body').off("mousewheel", boxScrollEvent);
	}
}

boxRollMouseWheelInit();

$('body').on('click','.nectar-box-roll .section-down-arrow',function(){
	boxRoll(null,-1);
	$(this).addClass('hovered');
	setTimeout(function(){ $('.nectar-box-roll .section-down-arrow').removeClass('hovered'); },2000);
	return false;
});



function updateRowRightPadding(d){
	$('.wpb_row.full-width-section').each(function(){
		if($(this).hasClass('extraPadding') && d == 1) {
			$(this).css('padding-right',parseInt($(this).css('padding-right')) - parseInt($('body').attr('data-scrollbar-width')) + 'px' ).removeClass('extraPadding');
		} else {
			$(this).css('padding-right',parseInt($('body').attr('data-scrollbar-width')) + parseInt($(this).css('padding-right')) + 'px' ).addClass('extraPadding');
		}	
	});
	$('.wpb_row.full-width-content').each(function(){
		if($(this).find('.row-bg.using-image').length == 0) {
			if($(this).hasClass('extraPadding') && d == 1) {
				$(this).find('.row-bg').css('width',parseInt($(this).width()) - parseInt($('body').attr('data-scrollbar-width')) + 'px' ).removeClass('extraPadding');
			} else {
				$(this).find('.row-bg').css('width',parseInt($('body').attr('data-scrollbar-width')) + $(this).width() + 'px' ).addClass('extraPadding');
			}	
		}
	});
}

function pauseVideoBG() {
	if($('.nectar-box-roll video').length > 0) $('.nectar-box-roll video')[0].pause(); 
}
function resumeVideoBG() {
	if($('.nectar-box-roll video').length > 0) $('.nectar-box-roll video')[0].play(); 
}

//touch 
if(navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/) && $('.nectar-box-roll').length > 0) {
	$('body').swipe({
		swipeStatus: function(event, phase, direction, distance, duration, fingers) {
			if($('#slide-out-widget-area.open').length > 0) return false;
			if(direction == 'up') {
				boxRoll(null,-1);
				if($('#ajax-content-wrap.no-scroll').length == 0) $('body').swipe("option", "allowPageScroll", 'vertical');
			} else if(direction == "down" && $(window).scrollTop() == 0) {
				boxRoll(null,1);
				$('body').swipe("option", "allowPageScroll", 'auto');
			}
		}
	});

}

function removeNiceScroll() {
		if($().niceScroll && $("html").getNiceScroll()){
			var nice = $("html").getNiceScroll();
			nice.stop();
			
			$('html').removeClass('no-overflow-y');
			$('.nicescroll-rails').hide();
			if($('#boxed').length == 0){
				$('body, body #header-outer, body #header-secondary-outer, body #search-outer, .midnightHeader .midnightInner').css('padding-right','0px');
			} else if($('body[data-ext-responsive="true"]').length == 0 ) {
				$('body').css('padding-right','0px');
			}

			$('body').attr('data-smooth-scrolling','0');
		}
	}
//called after box roll
$waypointsBound = false;
function waypoints() {
	colAndImgAnimations(); 
	progressBars(); 
	dividers();
	iconList();
	animated_titles();
	imageWithHotspots();
	clientsFadeIn(); 
	splitLineHeadings();
	svgAnimations(); 
	milestoneInit();
	nectar_fancy_ul_init();
	owl_carousel_animate();
	headerRowColorInheritInit();
	morphingOutlines(); 
	$waypointsBound = true;
}



/***************** WooCommerce Cart *****************/
var timeout;
var productToAdd;

//notification
$('body').on('click','.product .add_to_cart_button', function(){
	productToAdd = $(this).parents('li').find('h3').text();
	$('#header-outer .cart-notification span.item-name').html(productToAdd);

	//if($('.cart-menu-wrap').hasClass('first-load')) $('.cart-menu-wrap').removeClass('first-load').addClass('static');
});

//notification hover
$('body').on('mouseenter','#header-outer .cart-notification',function(){
	$(this).fadeOut(400);
	$('#header-outer .widget_shopping_cart').stop(true,true).fadeIn(300);
	$('#header-outer .cart_list').stop(true,true).fadeIn(300);
	clearTimeout(timeout);
});

//cart dropdown
$('#header-outer div.cart-outer').hoverIntent(function(){
	$('#header-outer .widget_shopping_cart').stop(true,true).fadeIn(300);
	$('#header-outer .cart_list').stop(true,true).fadeIn(300);
	clearTimeout(timeout);
	$('#header-outer .cart-notification').fadeOut(300);
});


$('body').on('mouseleave','#header-outer div.cart-outer',function(){
	var $that = $(this);
	setTimeout(function(){
		if(!$that.is(':hover')){
			$('#header-outer .widget_shopping_cart').stop(true,true).fadeOut(300);
			$('#header-outer .cart_list').stop(true,true).fadeOut(300);
		}
	},100);
});

if($('#header-outer[data-cart="false"]').length == 0) {
	$('body').on('added_to_cart', shopping_cart_dropdown_show);
	$('body').on('added_to_cart', shopping_cart_dropdown);
}

function shopping_cart_dropdown() {
		
		if(!$('.widget_shopping_cart .widget_shopping_cart_content .cart_list .empty').length && $('.widget_shopping_cart .widget_shopping_cart_content .cart_list').length > 0 ) {
			$('.cart-menu-wrap').addClass('has_products');
			$('header#top nav > ul, #search-outer #search #close a').addClass('product_added');

			if(!$('.cart-menu-wrap').hasClass('static')) $('.cart-menu-wrap').addClass('first-load');

			//nectar slider nav directional effect
			if($('#header-outer').hasClass('directional-nav-effect') && $('#header-outer .cart-icon-wrap .dark').length == 0 && $('body.ascend').length > 0){
				$('#header-outer .cart-outer .cart-icon-wrap').each(function(){
                    $(this).find('> i, > span.light, > span.dark, > span.original').remove();
                    $(this).append('<span class="dark"><span><i class="icon-salient-cart"></i></span></span><span class="light"><span><i class="icon-salient-cart"></i></span></span><span class="original"><span><i class="icon-salient-cart"></i></span></span>');
                	$(this).find('.original').attr('data-w',$(this).find('span.original').width()+1);
                });
			}
		}

}


function shopping_cart_dropdown_show(e) {
		
		clearTimeout(timeout);
		
		if(!$('.widget_shopping_cart .widget_shopping_cart_content .cart_list .empty').length && $('.widget_shopping_cart .widget_shopping_cart_content .cart_list').length > 0 && typeof e.type != 'undefined' ) {
			//before cart has slide in
			if(!$('#header-outer .cart-menu-wrap').hasClass('has_products')) {
				setTimeout(function(){ $('#header-outer .cart-notification').fadeIn(400); },400);
			}
			else if(!$('#header-outer .cart-notification').is(':visible')) {
				$('#header-outer .cart-notification').fadeIn(400);
			} else {
				$('#header-outer .cart-notification').show();
			}
			timeout = setTimeout(hideCart,2700);

			$('.cart-menu a, .widget_shopping_cart a').addClass('no-ajaxy');
		}
}

function hideCart() {
	$('#header-outer .cart-notification').stop(true,true).fadeOut();
}

function checkForWooItems(){ 
	var checkForCartItems = setInterval(shopping_cart_dropdown,250);
	setTimeout(function(){ clearInterval(checkForCartItems); },4500);
}
if($('#header-outer[data-cart="false"]').length == 0) {
	checkForWooItems();
}

var extraHeight = ($('#wpadminbar').length > 0) ? $('#wpadminbar').height() : 0; //admin bar
var secondaryHeader = ($('#header-outer').attr('data-using-secondary') == '1') ? 32 : 0 ;
function searchFieldCenter(){
	$('#search-outer').css('top',$('#header-outer').outerHeight() + extraHeight + secondaryHeader);
	$('#search-outer > #search #search-box').css('top',($(window).height()/2) - ($('#search-outer > #search input').height()/2) - $('#header-outer').outerHeight() );
}

//text on hover effect
$('body').on('mouseover','.text_on_hover .product-wrap',function(){
	$(this).parent().addClass('hovered');
	//if($(this).find('.star-rating span').length > 0) $(this).find('.star-rating span').stop().animate({ width: $(this).find('.star-rating span').attr('data-width') },400,'easeOutCirc');
});
$('body').on('mouseover','.text_on_hover > a:first-child',function(){
	$(this).parent().addClass('hovered');
});

$('body').on('mouseout','.text_on_hover .product-wrap',function(){
	$(this).parent().removeClass('hovered');
	//if($(this).find('.star-rating span').length > 0) $(this).find('.star-rating span').stop().animate({ width: $(this).find('.star-rating span').attr('data-width') - 40 },500);
});
$('body').on('mouseout','.text_on_hover > a:first-child',function(){
	$(this).parent().removeClass('hovered');
});

/*
$('.text_on_hover.product .star-rating span').each(function(){
	$(this).attr('data-width',$(this).width());
	$(this).css('width', $(this).attr('data-width') - 40);
});*/


/***************** Search ******************/
	var $placeholder = $('#search input[type=text]').attr('data-placeholder');
	var logoHeight = parseInt($('#header-outer').attr('data-logo-height'));
	
	////search box event
	$('body').on('click', '#search-btn a', function(){ return false; });
	$('body').on('mousedown', '#search-btn a:not(.inactive)', function(){

		if($(this).hasClass('open-search')) { return false; } 

		if($('body').hasClass('ascend')){ 
			$('#search-outer > #search form, #search-outer #search .span_12 span').css('opacity',0);
			$('#search-outer > #search form').css('bottom','10px');
			$('#search-outer #search .span_12 span').css('top','10px');
			$('#search-outer').show();
			$('#search-outer').stop().transition({scale: '1,0', 'opacity': 1},0).transition({ scale: '1,1'},400,'easeInOutCubic');

			$('#search-outer > #search form').delay(400).animate({'opacity':1, 'bottom':0},'easeOutCirc');
			$('#search-outer #search .span_12 span').delay(470).animate({'opacity':1, 'top':0},'easeOutCirc');
			
		} else {
			$('#search-outer').stop(true).fadeIn(600,'easeOutExpo');
		}

		$('body:not(.ascend) #search-outer > #search input[type="text"]').css({
			'top' : $('#search-outer').height()/2 - $('#search-outer > #search input[type="text"]').height()/2
		});
		
		setTimeout(function(){

			$('#search input[type=text]').focus();
			
			if($('#search input[type=text]').attr('value') == $placeholder){
				$('#search input[type=text]').setCursorPosition(0);	
			}

		},300);

		//ascend
		if($('body').hasClass('ascend')){ 
			searchFieldCenter();
		}

		$(this).toggleClass('open-search');

		//close slide out widget area
		$('.slide-out-widget-area-toggle a.open:not(.animating)').trigger('click');

		return false;
	});
	
	$('body').on('keydown','#search input[type=text]',function(){
		if($(this).attr('value') == $placeholder){
			$(this).attr('value', '');
		}
	});
	
	$('body').on('keyup','#search input[type=text]',function(){
		if($(this).attr('value') == ''){
			$(this).attr('value', $placeholder);
			$(this).setCursorPosition(0);
		}
	});
	
	
	////close search btn event
	$('body').on('click','#close',function(){
		closeSearch();
		$('#search-btn a').removeClass('open-search');
		return false;
	});

	//if user clicks away from the search close it
	$('body').on('blur','#search-box input[type=text]',function(e){
		closeSearch();
		$('#search-btn a').removeClass('open-search');
	});
	
	
	function closeSearch(){
		if($('body').hasClass('ascend')){ 
			$('#search-outer').stop().transition({'opacity' :0},300,'easeOutCubic');
			$('#search-btn a').addClass('inactive');
			setTimeout(function(){ $('#search-outer').hide(); $('#search-btn a').removeClass('inactive'); },300);
		} else {
			$('#search-outer').stop(true).fadeOut(450,'easeOutExpo');
		}
	}
	
	
	//mobile search
	$('body').on('click', '#mobile-menu #mobile-search .container a#show-search',function(){
		$('#mobile-menu .container > ul').slideUp(500);
		return false;
	});
	
/***************** Nav ******************/

	function centeredLogoMargins() {

		if($('#header-outer[data-format="centered-logo-between-menu"]').length > 0 && $(window).width() > 1000) {
			$midnightSelector = ($('#header-outer .midnightHeader').length > 0) ? '> .midnightHeader:first-child' : '';
			var $navItemLength = $('#header-outer[data-format="centered-logo-between-menu"] '+$midnightSelector+' nav > .sf-menu > li').length;
			if($('#header-outer #social-in-menu').length > 0) $navItemLength--;

			$centerLogoWidth = ($('#header-outer .row .col.span_3 #logo img:visible').length == 0) ? parseInt($('#header-outer .row .col.span_3').width()) : parseInt($('#header-outer .row .col.span_3 img:visible').width());

			$('#header-outer[data-format="centered-logo-between-menu"] nav > .sf-menu > li:nth-child('+Math.floor($navItemLength/2)+')').css({'margin-right': ($centerLogoWidth+40) + 'px'}).addClass('menu-item-with-margin');
			$leftMenuWidth = 0;
			$rightMenuWidth = 0;
			$('#header-outer[data-format="centered-logo-between-menu"] '+$midnightSelector+' nav > .sf-menu > li:not(#social-in-menu)').each(function(i){
				if(i+1 <= Math.floor($navItemLength/2)) {
					$leftMenuWidth += $(this).width();
				} else {
					$rightMenuWidth += $(this).width();
				}

			});

			$menuDiff = Math.abs($rightMenuWidth - $leftMenuWidth);

			if($leftMenuWidth > $rightMenuWidth) 
				$('#header-outer .row > .col.span_9').css('padding-right',$menuDiff);
			else 
				$('#header-outer .row > .col.span_9').css('padding-left',$menuDiff);

			$('#header-outer[data-format="centered-logo-between-menu"] nav').css('visibility','visible');
		}
	}
	
	var logoHeight = parseInt($('#header-outer').attr('data-logo-height'));
	var headerPadding = parseInt($('#header-outer').attr('data-padding'));
	var usingLogoImage = $('#header-outer').attr('data-using-logo');
	
	if( isNaN(headerPadding) || headerPadding.length == 0 ) { headerPadding = 28; }
	if( isNaN(logoHeight) || usingLogoImage.length == 0 ) { usingLogoImage = false; logoHeight = 30;}
	
	//inital calculations
	function headerInit() {
			
		$('#header-outer #logo img').css({
			'height' : logoHeight,				
		});	
		
		$('#header-outer').css({
			'padding-top' : headerPadding
		});	
		
		if($('body.mobile').length == 0) {
			$('header#top nav > ul > li:not(#social-in-menu) > a').css({
				'padding-bottom' : Math.floor( ((logoHeight/2) - ($('header#top nav > ul > li > a').height()/2)) + headerPadding),
				'padding-top' : Math.floor( (logoHeight/2) - ($('header#top nav > ul > li > a').height()/2))
			});	

			$('header#top nav > ul > li#social-in-menu > a').css({
				'margin-bottom' : Math.floor( ((logoHeight/2) - ($('header#top nav > ul > li > a').height()/2)) + headerPadding),
				'margin-top' : Math.floor( (logoHeight/2) - ($('header#top nav > ul > li > a').height()/2))
			});	
		}
		
		if($('#header-outer[data-format="centered-menu-under-logo"]').length == 0) {
			$('#header-outer .cart-menu').css({  
				'padding-bottom' : Math.ceil(((logoHeight/2) - ($('header#top nav ul #search-btn a').height()/2)) + headerPadding),
				'padding-top' : Math.ceil(((logoHeight/2) - ($('header#top nav ul #search-btn a').height()/2)) + headerPadding)
			});	
		} else {
			$('#header-outer .cart-menu').css({  
				'padding-bottom' : Math.ceil(((logoHeight/2) - ($('header#top nav ul #search-btn a').height()/2)) + headerPadding + logoHeight/2 + 7),
				'padding-top' : Math.ceil(((logoHeight/2) - ($('header#top nav ul #search-btn a').height()/2)) + headerPadding + logoHeight/2 + 7)
			});	
		}
		
			
		$('header#top nav > ul li#search-btn, header#top nav > ul li.slide-out-widget-area-toggle').css({
			'padding-bottom' : (logoHeight/2) - ($('header#top nav > ul li#search-btn a').height()/2),
			'padding-top' : (logoHeight/2) - ($('header#top nav > ul li#search-btn a').height()/2)
		});	

		$('.slide-out-hover-icon-effect a').css({
			'padding-top' : headerPadding
		});	

		
		if($('body.ascend ').length > 0 && $('#header-outer[data-full-width="true"]').length > 0) {
			$('header#top nav > ul li#search-btn, header#top nav > ul li.slide-out-widget-area-toggle').css({
				'padding-top': 0,
				'padding-bottom': 0
			});

			$('header#top nav > ul.buttons').css({
				'margin-top' : - headerPadding,
				'height' : Math.floor(logoHeight + headerPadding*2) -1
			});

			$('header#top nav > ul li#search-btn a, header#top nav > ul li.slide-out-widget-area-toggle a, .slide-out-hover-icon-effect a').css({
				'visibility' : 'visible',
				'padding-top': Math.floor((logoHeight/2) - ($('header#top nav > ul li#search-btn a').height()/2) + headerPadding),
				'padding-bottom': Math.floor((logoHeight/2) - ($('header#top nav > ul li#search-btn a').height()/2) + headerPadding)
			});
		}
		
		$('header#top .sf-menu > li > ul, header#top .sf-menu > li.sfHover > ul').css({
			'top' : $('header#top nav > ul > li > a').outerHeight() 
		});	
		
		
		setTimeout(function(){ 
			$('body:not(.ascend) #search-outer #search-box .ui-autocomplete').css({
				'top': parseInt($('#header-outer').outerHeight())+'px'
			}); 
		},1000);
		
		$('body:not(.ascend) #search-outer #search-box .ui-autocomplete').css({
			'top': parseInt($('#header-outer').outerHeight())+'px'
		});

		//header space
		if($('.nectar-parallax-scene.first-section').length == 0) {

			if($('#header-outer').attr('data-using-secondary') == '1'){
				if($('#header-outer[data-mobile-fixed="false"]').length > 0  || $('body.mobile').length == 0 ) {
					$('#header-space').css('height', parseInt($('#header-outer').outerHeight()) + $('#header-secondary-outer').height());
					
				} else {
					$('#header-space').css('height', parseInt($('#header-outer').outerHeight()));
					
				}
				
			} else {

				$('#header-space').css('height', $('#header-outer').outerHeight() );
			} 
		}
		
		$('#header-outer .container, #header-outer .cart-menu').css('visibility','visible');
		
		centeredLogoMargins();

		if($('#header-outer[data-format="centered-menu-under-logo"]').length == 0) {
			$('body:not(.ascend) #search-outer, #search .container').css({
				'height' : logoHeight + headerPadding*2
			});	
			
			$('body:not(.ascend) #search-outer > #search input[type="text"]').css({
				'font-size'  : 43,
				'height' : '59px',
				'top' : ((logoHeight + headerPadding*2)/2) - $('#search-outer > #search input[type="text"]').height()/2
			});
			
			$('body:not(.ascend) #search-outer > #search #close a').css({
				'top' : ((logoHeight + headerPadding*2)/2) - 8
			});	
		} else {
			$('body:not(.ascend) #search-outer, #search .container').css({
				'height' : logoHeight + headerPadding*2 + logoHeight + 17
			});	
			
			$('body:not(.ascend) #search-outer > #search input[type="text"]').css({
				'font-size'  : 43,
				'height' : '59px',
				'top' : ((logoHeight + headerPadding*2)/2) - ($('#search-outer > #search input[type="text"]').height()/2) + logoHeight/2 + 17
			});
			
			$('body:not(.ascend) #search-outer > #search #close a').css({
				'top' : ((logoHeight + headerPadding*2)/2) - 8 + logoHeight/2 + 17
			});	
		}
		
		//if no image is being used
		//if(usingLogoImage == false) $('header#top #logo').addClass('no-image');
		
	}
	
	//one last check to make sure the header space is correct (only if the user hasn't scrolled yet)
	$(window).load(function(){
		if($(window).scrollTop() == 0 ) headerSpace();
	});
	
	
	//is header resize on scroll enabled?
	var headerResize = $('#header-outer').attr('data-header-resize');
	var headerHideUntilNeeded = $('body').attr('data-hhun');

	//transparent fix
	if($(window).scrollTop() != 0 && $('#header-outer.transparent[data-permanent-transparent="false"]').length == 1) $('#header-outer').removeClass('transparent');

	if( headerResize == 1 && headerHideUntilNeeded != '1'){
		
		headerInit();

		$(window).off('scroll.headerResizeEffect');

		if($('#nectar_fullscreen_rows').length == 0)
			$(window).on('scroll.headerResizeEffect',smallNav);

	} else if(headerHideUntilNeeded != '1') {
		headerInit();
		$(window).off('scroll.headerResizeEffectOpaque');
		$(window).on('scroll.headerResizeEffectOpaque',opaqueCheck);
		
	} else if(headerHideUntilNeeded == '1') {

		headerInit();

		if($('.nectar-box-roll').length > 0) $('#header-outer').addClass('at-top-before-box');

		var previousScroll = 0, // previous scroll position
        menuOffset = $('#header-space').height()*2, // height of menu (once scroll passed it, menu is hidden)
        detachPoint = ($('body.mobile').length > 0) ? 150 : 600, // point of detach (after scroll passed it, menu is fixed)
        hideShowOffset = 6; // scrolling value after which triggers hide/show menu

	    // on scroll hide/show menu
	    function hhunCalcs(e) {

	     //stop scrolling while animated anchors
	     if($('body.animated-scrolling').length > 0 && $('#header-outer.detached').length > 0) return false;

	     //stop on mobile if not using sticky option
	      if($('#header-outer[data-mobile-fixed="false"]').length > 0 && $('body.mobile').length > 0) {  $('#header-outer').removeClass('detached'); return false; }

	      var currentScroll = $(this).scrollTop(), // gets current scroll position
	            scrollDifference = Math.abs(currentScroll - previousScroll); // calculates how fast user is scrolling

	      if (!$('#header-outer').hasClass('side-widget-open') && !$('#header-outer .slide-out-widget-area-toggle a').hasClass('animating')) {
	       
	        // if scrolled past menu
	        if (currentScroll > menuOffset) {
	          // if scrolled past detach point add class to fix menu
	          if (currentScroll > detachPoint) {
	            if (!$('#header-outer').hasClass('detached'))
	              $('#header-outer').addClass('detached').removeClass('parallax-contained');
	         
	          	  if($('#header-outer[data-permanent-transparent="1"]').length == 0) $('#header-outer').removeClass('transparent');
	          }

	          // if scrolling faster than hideShowOffset hide/show menu
	          if (scrollDifference >= hideShowOffset) {
	            if (currentScroll > previousScroll) {
	              // scrolling down; hide menu
	              if (!$('#header-outer').hasClass('invisible'))
	                $('#header-outer').addClass('invisible').removeClass('at-top');
	                $('.page-submenu.stuck').css('transform','translateY(0px)').addClass('header-not-visible');
	            	
	            } else {
	              // scrolling up; show menu
	              if ($('#header-outer').hasClass('invisible'))
	                $('#header-outer').removeClass('invisible');
	          	    $('.page-submenu.stuck').css('transform','translateY('+$('#header-outer').outerHeight()+'px)').removeClass('header-not-visible');
	            }
	          }
	        } else {
	          // only remove “detached” class if user is at the top of document (menu jump fix)
	          $topDetachNum = ($('#header-outer[data-using-secondary="1"]').length > 0) ? 32 : 0;
	          if($('.body-border-top').length > 0) {
	          		$topDetachNum = ($('#header-outer[data-using-secondary="1"]').length > 0) ? 32 + $('.body-border-top').height() : $('.body-border-top').height();
	          }

	          if (currentScroll <= $topDetachNum){
	            $('#header-outer').removeClass('detached').addClass('at-top');
	            
	            if($('#header-outer[data-transparent-header="true"]').length > 0 && $('.nectar-box-roll').length == 0) $('#header-outer').addClass('transparent').css('transform','translateY(0)');
	            else if($('.nectar-box-roll').length > 0) $('#header-outer').css('transform','translateY(0)').addClass('at-top-before-box');

	            if($('.parallax_slider_outer').length > 0 || $('#page-header-bg[data-parallax="1"]').length > 0) $('#header-outer').addClass('parallax-contained').css('transform','translateY(0)');
	          }
	        }

	        // if user is at the bottom of document show menu
	        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
	          $('#header-outer').removeClass('invisible');
	          $('.page-submenu.stuck').css('transform','translateY('+$('#header-outer').outerHeight()+'px)').removeClass('header-not-visible');
	        }

	      }

	      // replace previous scroll position with new one
	      previousScroll = currentScroll;

	    }

	    hhunCalcs();
	    $(window).scroll(hhunCalcs);


	}//end if hhun
	
	if($('#nectar_fullscreen_rows').length == 0) midnightInit(); //init midnight	
	else ($('#header-outer').attr('data-permanent-transparent','false'))

	var shrinkNum = 6;
	var extraHeight = ($('#wpadminbar').length > 0) ? $('#wpadminbar').height() : 0; //admin bar
	var $bodyBorderHeaderColorMatch = ($('.body-border-top').css('background-color') == '#ffffff' && $('body').attr('data-header-color') == 'light' || $('.body-border-top').css('background-color') == $('#header-outer').attr('data-user-set-bg')) ? true : false;
	if($('#header-outer[data-shrink-num]').length > 0 ) shrinkNum = $('#header-outer').attr('data-shrink-num');

	function smallNav(){
		var $offset = $(window).scrollTop();
		var $windowWidth = $(window).width();
		

		if($offset > 0 && $windowWidth > 1000) {
			
			if($('#header-outer').attr('data-transparent-header') == 'true' && $('#header-outer.side-widget-open').length == 0 && $('#header-outer[data-permanent-transparent="1"]').length == 0) $('#header-outer').removeClass('transparent');
			$('.ns-loading-cover').hide();
			
			$('#header-outer, #search-outer').addClass('small-nav');
			
			$('#header-outer #logo img').stop(true,true).animate({
				'height' : logoHeight - shrinkNum
			},{queue:false, duration:250, easing: 'easeOutCubic'});	
				
			$('#header-outer').stop(true,true).animate({
				'padding-top' : Math.ceil(headerPadding / 1.8)
			},{queue:false, duration:250, easing: 'easeOutCubic'});	
			

			$('header#top nav > ul > li:not(#social-in-menu) > a').stop(true,true).animate({
				'padding-bottom' :  Math.floor((((logoHeight-shrinkNum)/2) - ($('header#top nav > ul > li > a').height()/2)) + headerPadding / 1.8) ,
				'padding-top' :  Math.floor(((logoHeight-shrinkNum)/2) - ($('header#top nav > ul > li > a').height()/2)) 
			},{queue:false, duration:250, easing: 'easeOutCubic'});	 

			//body border full width side padding
			if($('#header-outer[data-full-width="true"][data-transparent-header="true"]').length > 0 && $('.body-border-top').length > 0 && $bodyBorderHeaderColorMatch == true) {
				$('#header-outer[data-full-width="true"] header > .container').stop(true,true).animate({
					'padding' : '0'			
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			}

			$('header#top nav > ul > li#social-in-menu > a').stop(true,true).animate({
				'margin-bottom' :  Math.floor((((logoHeight-shrinkNum)/2) - ($('header#top nav > ul > li > a').height()/2)) + headerPadding / 1.8) ,
				'margin-top' :  Math.floor(((logoHeight-shrinkNum)/2) - ($('header#top nav > ul > li > a').height()/2)) 
			},{queue:false, duration:250, easing: 'easeOutCubic'});	 
			
			$('header#top nav > ul > li.menu-item-with-margin').stop(true,true).animate({
				'margin-right': (parseInt($('header#top nav > ul > li.menu-item-with-margin').css('margin-right')) - parseInt(shrinkNum)*4) +'px'
			},{queue:false, duration:250, easing: 'easeOutCubic'});	 

			if($bodyBorderHeaderColorMatch == true) {
				$('.body-border-top').stop(true,true).animate({
					'margin-top': '-'+$('.body-border-top').height()+'px'
				},{queue:false, duration:400, easing: 'easeOutCubic', complete: function() { $(this).css('margin-top',0)} });	 
			}

			if($('#header-outer[data-format="centered-menu-under-logo"]').length == 0) {
				$('#header-outer .cart-menu').stop(true,true).animate({
					'padding-top' : Math.ceil(((logoHeight-shrinkNum)/2) - ($('header#top nav > ul li#search-btn a').height()/2) + headerPadding/ 1.7),
					'padding-bottom' : Math.ceil(((logoHeight-shrinkNum)/2) - ($('header#top nav > ul li#search-btn a').height()/2) + headerPadding/ 1.7) +1
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			} else {
				/*$('#header-outer img.starting-logo').stop(true,true).animate({
					'margin-top' :  '-' + (logoHeight + 17 - shrinkNum) + 'px'
				},{queue:false, duration:250, easing: 'easeOutCubic'});	*/

				$('#header-outer .cart-menu').stop(true,true).animate({
					'padding-bottom' : Math.floor((((logoHeight-shrinkNum)/2) - ($('header#top nav ul #search-btn a').height()/2)) + headerPadding / 1.7) + (logoHeight-shrinkNum)/2 + 9,
					'padding-top' : Math.floor((((logoHeight-shrinkNum)/2) - ($('header#top nav ul #search-btn a').height()/2)) + headerPadding / 1.7) + (logoHeight-shrinkNum)/2 + 9
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			}
			
			if($('body.ascend ').length > 0 && $('#header-outer[data-full-width="true"]').length > 0) {
				$('header#top nav > ul.buttons').stop(true,true).animate({
					'margin-top' : - Math.ceil(headerPadding/ 1.8),
					'height' : Math.floor((headerPadding*2)/ 1.8 + logoHeight-shrinkNum)
				},{queue:false, duration:250, easing: 'easeOutCubic'});	

				$('header#top nav > ul li#search-btn a, header#top nav > ul li.slide-out-widget-area-toggle a').stop(true,true).animate({
					'padding-top' : Math.ceil(((logoHeight-shrinkNum)/2) - ($('header#top nav > ul li#search-btn a').height()/2) + headerPadding/ 1.7),
					'padding-bottom' : Math.ceil(((logoHeight-shrinkNum)/2) - ($('header#top nav > ul li#search-btn a').height()/2) + headerPadding/ 1.7) +1
				},{queue:false, duration:250, easing: 'easeOutCubic'});	

			} else {
				$('header#top nav > ul li#search-btn, header#top nav > ul li.slide-out-widget-area-toggle').stop(true,true).animate({
					'padding-bottom' : Math.ceil(((logoHeight-shrinkNum)/2) - ($('header#top nav > ul li#search-btn a').height()/2)),
					'padding-top' : Math.ceil(((logoHeight-shrinkNum)/2) - ($('header#top nav > ul li#search-btn a').height()/2))
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			}

			$('header#top .sf-menu > li > ul, header#top .sf-menu > li.sfHover > ul').stop(true,true).animate({
				'top' : Math.floor($('header#top nav > ul > li > a').height() + (((logoHeight-shrinkNum)/2) - ($('header#top nav > ul > li > a').height()/2))*2 + headerPadding / 1.8),
			},{queue:false, duration:250, easing: 'easeOutCubic'});		
			
			
			$('body:not(.ascend) #search-outer #search-box .ui-autocomplete').stop(true,true).animate({
				'top': Math.floor((logoHeight-shrinkNum) + (headerPadding*2)/ 1.8) +'px'
			},{queue:false, duration:250, easing: 'easeOutCubic'});	
		

			if($('#header-outer[data-format="centered-menu-under-logo"]').length == 0) {
				$('body:not(.ascend) #search-outer, #search .container').stop(true,true).animate({
					'height' : Math.floor((logoHeight-shrinkNum) + (headerPadding*2)/ 1.8)
				},{queue:false, duration:250, easing: 'easeOutCubic'});	

				$('body:not(.ascend) #search-outer > #search input[type="text"]').stop(true,true).animate({
					'font-size'  : 30,
					'line-height' : '30px',
					'height' : '44px',
					'top' : ((logoHeight-shrinkNum+headerPadding+5)/2) - ($('#search-outer > #search input[type="text"]').height()-15)/2
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			
				$('body:not(.ascend) #search-outer > #search #close a').stop(true,true).animate({
					'top' : ((logoHeight-shrinkNum + headerPadding+5)/2) - 10
				},{queue:false, duration:250, easing: 'easeOutCubic'});	

			} else {
				$('body:not(.ascend) #search-outer, #search .container').stop(true,true).animate({
					'height' : Math.floor((logoHeight-shrinkNum) + (headerPadding*2)/ 1.8) + logoHeight - shrinkNum + 17
				},{queue:false, duration:250, easing: 'easeOutCubic'});	

				$('body:not(.ascend) #search-outer > #search input[type="text"]').stop(true,true).animate({
					'font-size'  : 30,
					'line-height' : '30px',
					'height' : '44px',
					'top' : ((logoHeight-shrinkNum+headerPadding+5)/2) - ($('#search-outer > #search input[type="text"]').height()-15)/2 + (logoHeight- shrinkNum)/2 + 8
				},{queue:false, duration:250, easing: 'easeOutCubic'});	

				$('body:not(.ascend) #search-outer > #search #close a').stop(true,true).animate({
					'top' : ((logoHeight-shrinkNum + headerPadding+5)/2) - 10 + (logoHeight- shrinkNum)/2 + 8
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			}

		
			

			//box roll
			if($('.nectar-box-roll').length > 0 && $('#header-outer[data-permanent-transparent="1"]').length == 0) $('#ajax-content-wrap').animate({'margin-top':  (Math.floor((logoHeight-shrinkNum) +(headerPadding*2)/ 1.8 + extraHeight + secondaryHeader))  },{queue:false, duration:250, easing: 'easeOutCubic'})
			
			
			if($('body').hasClass('ascend')){ 
				$('#search-outer').stop(true,true).animate({
					'top' : Math.floor((logoHeight-shrinkNum) +(headerPadding*2)/ 1.8 + extraHeight + secondaryHeader)
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			}
			
			//if no image is being used
			if(usingLogoImage == false) $('header#top #logo').stop(true,true).animate({
				'margin-top' : 0
			},{queue:false, duration:450, easing: 'easeOutExpo'});	
			
			$(window).off('scroll',smallNav);
			$(window).on('scroll',bigNav);

			//dark slider coloring border fix
			$('#header-outer[data-transparent-header="true"]').css('transition','background-color 0.40s ease, box-shadow 0.40s ease, margin 0.25s ease-out');
			$('#header-outer[data-transparent-header="true"] .cart-menu').css('transition','none');
			setTimeout(function(){ 
				$('#header-outer[data-transparent-header="true"]').css('transition','background-color 0.40s ease, box-shadow 0.40s ease, border-color 0.40s ease, margin 0.25s ease-out'); 
				$('#header-outer[data-transparent-header="true"] .cart-menu').css('transition','border-color 0.40s ease');
			},300);

		}

	}
	
	function bigNav(){
		var $offset = $(window).scrollTop();
		var $windowWidth = $(window).width();

		if($offset == 0 && $windowWidth > 1000 || $('.small-nav').length > 0 && $('#ajax-content-wrap.no-scroll').length > 0 || $('.small-nav').length > 0 && $('.slide-out-from-right-hover.open').length > 0 || $('.small-nav').length > 0 && $('.slide-out-from-right.open').length > 0 && $bodyBorderHeaderColorMatch == true) {
			
			$('#header-outer, #search-outer').removeClass('small-nav');
			
			if($('#header-outer').attr('data-transparent-header') == 'true'  && $('.nectar-box-roll').length == 0) $('#header-outer').addClass('transparent');
			$('.ns-loading-cover').show();
			
			$('#header-outer #logo img').stop(true,true).animate({
				'height' : logoHeight,				
			},{queue:false, duration:250, easing: 'easeOutCubic'});	
			

			//body border full width side padding
			if($('#header-outer[data-full-width="true"][data-transparent-header="true"]').length > 0 && $('.body-border-top').length > 0 && $bodyBorderHeaderColorMatch == true) {
				$('#header-outer[data-full-width="true"] header > .container').stop(true,true).animate({
					'padding' : '0 28px'			
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			}

			$('#header-outer').stop(true,true).animate({
				'padding-top' : headerPadding 
			},{queue:false, duration:250, easing: 'easeOutCubic'});	
			
			$('header#top nav > ul > li:not(#social-in-menu) > a').stop(true,true).animate({
				'padding-bottom' : ((logoHeight/2) - ($('header#top nav > ul > li > a').height()/2)) + headerPadding,
				'padding-top' : (logoHeight/2) - ($('header#top nav > ul > li > a').height()/2) 
			},{queue:false, duration:250, easing: 'easeOutCubic'});	

			$('header#top nav > ul > li#social-in-menu > a').stop(true,true).animate({
				'margin-bottom' : ((logoHeight/2) - ($('header#top nav > ul > li > a').height()/2)) + headerPadding,
				'margin-top' : (logoHeight/2) - ($('header#top nav > ul > li > a').height()/2) 
			},{queue:false, duration:250, easing: 'easeOutCubic'});	
				
			$('header#top nav > ul > li.menu-item-with-margin').stop(true,true).animate({
				'margin-right': (parseInt($('header#top nav > ul > li.menu-item-with-margin').css('margin-right')) + parseInt(shrinkNum)*4) +'px'
			},{queue:false, duration:250, easing: 'easeOutCubic'});	 

			if($bodyBorderHeaderColorMatch == true) {
				$('.body-border-top').css({ 'margin-top': '-'+$('.body-border-top').height()+'px'}).stop(true,true).animate({
					'margin-top': '0'
				},{queue:false, duration:250, easing: 'easeOutCubic'});	 
			}

			if($('#header-outer[data-format="centered-menu-under-logo"]').length == 0) {
				$('#header-outer .cart-menu').stop(true,true).animate({
					'padding-bottom' : Math.ceil(((logoHeight/2) - ($('header#top nav ul #search-btn a').height()/2)) + headerPadding),
					'padding-top' : Math.ceil(((logoHeight/2) - ($('header#top nav ul #search-btn a').height()/2)) + headerPadding)
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			} else {
				/*$('#header-outer img.starting-logo').stop(true,true).animate({
					'margin-top' :  '-' + (logoHeight + 17) + 'px'
				},{queue:false, duration:250, easing: 'easeOutCubic'});	*/

				$('#header-outer .cart-menu').stop(true,true).animate({
					'padding-bottom' : Math.ceil(((logoHeight/2) - ($('header#top nav ul #search-btn a').height()/2)) + headerPadding) + logoHeight/2 + 7,
					'padding-top' : Math.ceil(((logoHeight/2) - ($('header#top nav ul #search-btn a').height()/2)) + headerPadding) + logoHeight/2 + 7
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			}

			if($('body.ascend ').length > 0 && $('#header-outer[data-full-width="true"]').length > 0) {
				$('header#top nav > ul.buttons').stop(true,true).animate({
					'margin-top' : - Math.ceil(headerPadding),
					'height' : Math.floor(headerPadding*2 + logoHeight) -1
				},{queue:false, duration:250, easing: 'easeOutCubic'});	

				$('header#top nav > ul li#search-btn a, header#top nav > ul li.slide-out-widget-area-toggle a').stop(true,true).animate({
					'padding-top': Math.floor((logoHeight/2) - ($('header#top nav > ul li#search-btn a').height()/2) + headerPadding),
					'padding-bottom': Math.floor((logoHeight/2) - ($('header#top nav > ul li#search-btn a').height()/2) + headerPadding)
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			} else {
				$('header#top nav > ul li#search-btn, header#top nav > ul li.slide-out-widget-area-toggle').stop(true,true).animate({
					'padding-bottom' : Math.floor((logoHeight/2) - ($('header#top nav > ul li#search-btn a').height()/2)),
					'padding-top' : Math.ceil((logoHeight/2) - ($('header#top nav > ul li#search-btn a').height()/2))
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			}
			
			$('header#top .sf-menu > li > ul, header#top .sf-menu > li.sfHover > ul').stop(true,true).animate({
				'top' : Math.ceil($('header#top nav > ul > li > a').height() + (((logoHeight)/2) - ($('header#top nav > ul > li > a').height()/2))*2 + headerPadding),
			},{queue:false, duration:250, easing: 'easeOutCubic'});		
			
			$('body:not(.ascend) #search-outer #search-box .ui-autocomplete').stop(true,true).animate({
				'top': Math.ceil(logoHeight + headerPadding*2) +'px'
			},{queue:false, duration:250, easing: 'easeOutCubic'});	
			
			
			if($('#header-outer[data-format="centered-menu-under-logo"]').length == 0) {
				$('body:not(.ascend) #search-outer, #search .container').stop(true,true).animate({
					'height' : Math.ceil(logoHeight + headerPadding*2)
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
				
				$('body:not(.ascend) #search-outer > #search input[type="text"]').stop(true,true).animate({
					'font-size'  : 43,
					'line-height' : '43px',
					'height' : '59px',
					'top' : ((logoHeight + headerPadding*2)/2) - 30
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
				
				
				$('body:not(.ascend) #search-outer > #search #close a').stop(true,true).animate({
					'top' : ((logoHeight + headerPadding*2)/2) - 8
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
				
			} else {
				$('body:not(.ascend) #search-outer, #search .container').stop(true,true).animate({
					'height' : Math.ceil(logoHeight + headerPadding*2) + logoHeight + 17
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
				
				$('body:not(.ascend) #search-outer > #search input[type="text"]').stop(true,true).animate({
					'font-size'  : 43,
					'line-height' : '43px',
					'height' : '59px',
					'top' : ((logoHeight + headerPadding*2)/2) - 30 + (logoHeight)/2 + 8
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
				
				
				$('body:not(.ascend) #search-outer > #search #close a').stop(true,true).animate({
					'top' : ((logoHeight + headerPadding*2)/2) - 8 + (logoHeight)/2 + 8
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			}


			if($('body').hasClass('ascend')){ 
				$('#search-outer').stop(true,true).animate({
					'top' : (logoHeight) +(headerPadding*2) + extraHeight + secondaryHeader
				},{queue:false, duration:250, easing: 'easeOutCubic'});	
			}

			//if no image is being used
			if(usingLogoImage == false) $('header#top #logo').stop(true,true).animate({
				'margin-top' : 4
			},{queue:false, duration:450, easing: 'easeOutExpo'});	
			

				//box roll
			if($('.nectar-box-roll').length > 0 && $('#header-outer[data-permanent-transparent="1"]').length == 0) $('#ajax-content-wrap').animate({'margin-top':  (Math.floor((logoHeight) +(headerPadding*2) + extraHeight + secondaryHeader))  },{queue:false, duration:250, easing: 'easeOutCubic'})
			

			$(window).off('scroll',bigNav);
			$(window).on('scroll',smallNav);


			//dark slider coloring border fix
			$('#header-outer[data-transparent-header="true"]').css('transition','background-color 0.40s ease, box-shadow 0.40s ease, margin 0.25s ease-out');
			$('#header-outer[data-transparent-header="true"] .cart-menu').css('transition','none');
			setTimeout(function(){ 
				$('#header-outer[data-transparent-header="true"]').css('transition','background-color 0.40s ease, box-shadow 0.40s ease, border-color 0.40s ease, margin 0.25s ease-out'); 
				$('#header-outer[data-transparent-header="true"] .cart-menu').css('transition','border-color 0.40s ease');
			},300);
		}

	}
	
	
	function headerSpace() {
		if($('.mobile').length > 0) {
			if(window.innerHeight < window.innerWidth && window.innerWidth > 1000) {
				if($('#header-outer.small-nav').length == 0)
					$('#header-space').css('height', $('#header-outer').outerHeight() + $('#header-secondary-outer').height());
			} else {
				$('#header-space').css('height', $('#header-outer').outerHeight());
			}
			
		} else {
			if($('.nectar-parallax-scene.first-section').length == 0) {

				var shrinkNum = 6;	
				var headerPadding = parseInt($('#header-outer').attr('data-padding'));
				if($('#header-outer[data-shrink-num]').length > 0 ) shrinkNum = $('#header-outer').attr('data-shrink-num');
				var headerPadding2 = headerPadding - headerPadding/1.8;
				var $headerHeight = ($('#header-outer[data-header-resize="1"]').length > 0 && $('.small-nav').length > 0 ) ? $('#header-outer').outerHeight() + (parseInt(shrinkNum) + headerPadding2*2) : $('#header-outer').outerHeight();

				if($('#header-outer').attr('data-using-secondary') == '1'){
					$('#header-space').css('height', $headerHeight + $('#header-secondary-outer').height());
				} else {
					$('#header-space').css('height', $headerHeight);
				} 
			}
		}
		
	}

	var lastPosition = -1;
	function headerOffsetAdjust(){
		
		var $scrollTop = $(window).scrollTop();

		 if (lastPosition == $scrollTop) {
            requestAnimationFrame(headerOffsetAdjust);
            return false;
        } else lastPosition = $scrollTop;
		
		headerOffsetAdjustCalc();

		requestAnimationFrame(headerOffsetAdjust);

	}

	function headerOffsetAdjustCalc() {
		if($('body.mobile').length > 0) {
			var $eleHeight = 0;
			var $endOffset = ($('#wpadminbar').css('position') == 'fixed') ? $('#wpadminbar').height() : 0;
			if($('#header-secondary-outer').length > 0) $eleHeight += $('#header-secondary-outer').height();
			if($('#wpadminbar').length > 0) $eleHeight += $('#wpadminbar').height();

			if( $eleHeight - $scrollTop > $endOffset) { 
				$('#header-outer').css('top', $eleHeight - $scrollTop + 'px');
			}
			else { $('#header-outer').css('top', $endOffset); }

		} else {
			var $eleHeight = 0;
			if($('#header-secondary-outer').length > 0) $eleHeight += $('#header-secondary-outer').height();
			if($('#wpadminbar').length > 0) $eleHeight += $('#wpadminbar').height();
			$('#header-outer').css('top',$eleHeight+'px');
		}
	}

	if($('#header-outer[data-mobile-fixed="1"]').length > 0 && $('#wpadminbar').length > 0 || $('#header-outer[data-mobile-fixed="1"]').length > 0 && $('#header-secondary-outer').length > 0) {
		if($('#nectar_fullscreen_rows').length == 0) requestAnimationFrame(headerOffsetAdjust);
		$(window).smartresize(headerOffsetAdjustCalc);
	}
		

	function footerRevealCalcs() {
		if($(window).height() - $('#wpadminbar').height() - $('#header-outer').outerHeight() - $('#footer-outer').height() - 1 -$('#page-header-bg').height() -$('.parallax_slider_outer').height() - $('.page-header-no-bg').height() > 0) {
			$resizeExtra = ($('#header-outer[data-header-resize="1"]').length > 0) ? 55: 0;
			$('.container-wrap').css({'margin-bottom': $('#footer-outer').height()-1, 'min-height': $(window).height() - $('#wpadminbar').height() - $('#header-outer').outerHeight() - $('#footer-outer').height() -1  - $('.page-header-no-bg').height() -$('#page-header-bg').height() -$('.parallax_slider_outer').height() + $resizeExtra });
		} else {
			$('.container-wrap').css({'margin-bottom': $('#footer-outer').height()-1 });
		}
		
		if( $(window).width() < 1000) $('#footer-outer').attr('data-midnight','light');
		else $('#footer-outer').removeAttr('data-midnight');
	}
	if($('body[data-footer-reveal="1"]').length > 0) { 
		footerRevealCalcs();
		//set shadow to match BG color if applicable
		if($('body[data-footer-reveal-shadow="large_2"]').length > 0) $('.container-wrap').css({ boxShadow: '0 70px 110px -30px '+$('#footer-outer').css('backgroundColor') });
	}
	
	function opaqueCheck(){
		var $offset = $(window).scrollTop();
		var $windowWidth = $(window).width();

		if($offset > 0 && $windowWidth > 1000) {
			
			if($('#header-outer').attr('data-transparent-header') == 'true' && $('#header-outer[data-permanent-transparent="1"]').length == 0) $('#header-outer').removeClass('transparent').addClass('scrolled-down');
			$('.ns-loading-cover').hide();
			
			$(window).off('scroll',opaqueCheck);
			$(window).on('scroll',transparentCheck);
		}
	}
	
	
	function transparentCheck(){
		var $offset = $(window).scrollTop();
		var $windowWidth = $(window).width();

		if($offset == 0 && $windowWidth > 1000) {
			
			if($('#header-outer').attr('data-transparent-header') == 'true') $('#header-outer').addClass('transparent').removeClass('scrolled-down');
			$('.ns-loading-cover').show();
			
			$(window).off('scroll',transparentCheck);
			$(window).on('scroll',opaqueCheck);
		}
	}
	
	var adminBarHeight = ($('#wpadminbar').length > 0) ? $('#wpadminbar').height() : 0; //admin bar

	//header inherit row color effect
	function headerRowColorInheritInit(){
		if($('body[data-header-inherit-rc="true"]').length > 0 && $('.mobile').length == 0){
			
			var headerOffset = ($('#header-outer[data-permanent-transparent="1"]').length == 0) ? (logoHeight - shrinkNum) + Math.ceil((headerPadding*2) / 1.8) + adminBarHeight : logoHeight/2 + headerPadding + adminBarHeight;
			
			$('.main-content > .row > .wpb_row').each(function(){


				var $that = $(this);
				var waypoint = new Waypoint({
	 				element: $that,
		 			handler: function(direction) {
	

						if(direction == 'down') {
							
							if($that.find('.row-bg.using-bg-color').length > 0) {
								
								var $textColor = ($that.find('> .col.span_12.light').length > 0) ? 'light-text' : 'dark-text';
								$('#header-outer').css('background-color',$that.find('.row-bg').css('background-color')).removeClass('light-text').removeClass('dark-text').addClass($textColor);
								$('#header-outer').attr('data-current-row-bg-color',$that.find('.row-bg').css('background-color'));
							} else {
								$('#header-outer').css('background-color',$('#header-outer').attr('data-user-set-bg')).removeClass('light-text').removeClass('dark-text');
								$('#header-outer').attr('data-current-row-bg-color',$('#header-outer').attr('data-user-set-bg'));
							}
						
						} else {

							if($that.prev('div.wpb_row').find('.row-bg.using-bg-color').length > 0) {
								var $textColor = ($that.prev('div.wpb_row').find('> .col.span_12.light').length > 0) ? 'light-text' : 'dark-text';
								$('#header-outer').css('background-color',$that.prev('div.wpb_row').find('.row-bg').css('background-color')).removeClass('light-text').removeClass('dark-text').addClass($textColor);
								$('#header-outer').attr('data-current-row-bg-color', $that.prev('div.wpb_row').find('.row-bg').css('background-color'));
							} else {
								$('#header-outer').css('background-color',$('#header-outer').attr('data-user-set-bg')).removeClass('light-text').removeClass('dark-text');
								$('#header-outer').attr('data-current-row-bg-color',$('#header-outer').attr('data-user-set-bg'));
							}

						} 

				
					},
					offset: headerOffset

				}); 


			});
		}
	}

	//if($('.nectar-box-roll').length == 0) headerRowColorInheritInit();









/****************sticky page submenu******************/
	if($('.page-submenu[data-sticky="true"]').length > 0 && $('#nectar_fullscreen_rows').length == 0) {

		(function() {
		  'use strict'

		  var $ = window.jQuery
		  var Waypoint = window.Waypoint
		  var $offsetHeight = 0; 
		  var shrinkNum = 6;	
		  var headerPadding = parseInt($('#header-outer').attr('data-padding'));
		  if($('#header-outer[data-shrink-num]').length > 0 ) shrinkNum = $('#header-outer').attr('data-shrink-num');
		  var headerPadding2 = headerPadding - headerPadding/1.8;
		  var $headerHeight = ($('#header-outer[data-header-resize="1"]').length > 0 && $('body.mobile').length == 0) ? $('#header-outer').outerHeight() - (parseInt(shrinkNum) + headerPadding2*2) : $('#header-outer').outerHeight();

		  if($('#header-secondary-outer').length > 0 && $('body.mobile').length == 0) $headerHeight += $('#header-secondary-outer').height();

		  

		  $(window).on('smartresize',function(){

		  	$headerHeight = ($('#header-outer[data-header-resize="1"]').length > 0 && $('.small-nav').length == 0 && $('body.mobile').length == 0) ? $('#header-outer').outerHeight() - (parseInt(shrinkNum) + headerPadding2*2) : $('#header-outer').outerHeight();
		  	if($('#header-secondary-outer').length > 0  && $('body.mobile').length == 0) $headerHeight += $('#header-secondary-outer').height();

		  	$offsetHeight = 0; 
		
		  	  if($('#wpadminbar').length > 0 && $('#wpadminbar').css('position') == 'fixed') $offsetHeight += $('#wpadminbar').height();
 			  if($('body[data-hhun="0"] #header-outer').length > 0 && !($('body.mobile').length > 0 && $('#header-outer[data-mobile-fixed="false"]').length > 0) ) $offsetHeight += $headerHeight;
 	
 			 // else if($('body[data-hhun="1"] #header-outer.detached:not(.invisible)').length > 0) $offsetHeight += $headerHeight;
 			
 			 //recalc for resizing (same as stuck/unstuck logic below)
 			 if($('.page-submenu.stuck').length > 0) {

		        	$('.page-submenu.stuck').addClass('no-trans').css('top',$offsetHeight).css('transform','translateY(0)').addClass('stuck');
		        	var $that = this;
		        	setTimeout(function(){ $('.page-submenu.stuck').removeClass('no-trans'); },50);
		        	$('.page-submenu.stuck').parents('.wpb_row').css('z-index',10000);

		        	//boxed
		        	if($('#boxed').length > 0) { 
		        		var $negMargin = ($(window).width() > 1000) ? $('.container-wrap').width()*0.04 :39;
		        		$('.page-submenu.stuck').css({'margin-left':'-'+$negMargin+'px', 'width' : $('.container-wrap').width()});
		        	}

		        }
		        else { 
		        	$('.page-submenu.stuck').css('top','0').removeClass('stuck');
		       	   $('.page-submenu.stuck').parents('.wpb_row').css('z-index','auto');

		       	    if($('#boxed').length > 0) $('.page-submenu.stuck').css({'margin-left':'0px', 'width' : '100%'});
		       	}

		  });

		  /* http://imakewebthings.com/waypoints/shortcuts/sticky-elements */
		  function Sticky(options) {
		    this.options = $.extend({}, Waypoint.defaults, Sticky.defaults, options)
		    this.element = this.options.element
		    this.$element = $(this.element)
		    this.createWrapper()
		    this.createWaypoint()
		  }

		  /* Private */
		  Sticky.prototype.createWaypoint = function() {
		    var originalHandler = this.options.handler

		    $offsetHeight = 0; 
		    if($('#wpadminbar').length > 0 && $('#wpadminbar').css('position') == 'fixed') $offsetHeight += $('#wpadminbar').height();
 			if($('body[data-hhun="0"] #header-outer').length > 0 && !($('body.mobile').length > 0 && $('#header-outer[data-mobile-fixed="false"]').length > 0)) $offsetHeight += $headerHeight;

 		
		    this.waypoint = new Waypoint($.extend({}, this.options, {
		      element: this.wrapper,
		      handler: $.proxy(function(direction) {
		        var shouldBeStuck = this.options.direction.indexOf(direction) > -1
		        var wrapperHeight = shouldBeStuck ? this.$element.outerHeight(true) : ''

		        this.$wrapper.height(wrapperHeight)
		        if(shouldBeStuck) {
		        	this.$element.addClass('no-trans').css('top',$offsetHeight).css('transform','translateY(0)').addClass('stuck');
		        	var $that = this;
		        	setTimeout(function(){ $that.$element.removeClass('no-trans'); },50);
		        	this.$element.parents('.wpb_row').css('z-index',10000);

		        	//boxed
		        	if($('#boxed').length > 0) { 
		        		var $negMargin = ($(window).width() > 1000) ? $('.container-wrap').width()*0.04 :39;
		        		this.$element.css({'margin-left':'-'+$negMargin+'px', 'width' : $('.container-wrap').width()});
		        	}

		        }
		        else { 
		        	this.$element.css('top','0').removeClass('stuck');
		       	    //this.$element.parents('.wpb_row').css('z-index','10000');

		       	    if($('#boxed').length > 0) this.$element.css({'margin-left':'0px', 'width' : '100%'});
		       	}

		        if (originalHandler) {
		          originalHandler.call(this, direction)
		        }
		      }, this),
		      offset: $offsetHeight
		    }))

		    var $that = this;

		   // if($('body[data-hhun="1"]').length > 0 ) {
			    setInterval(function(){ 

			    	if($('body[data-hhun="1"] #header-outer.detached:not(.invisible)').length > 0)
		        		$that.waypoint.options.offset = $offsetHeight + $headerHeight;
		        	else 
		        		$that.waypoint.options.offset = $offsetHeight;
			    	Waypoint.refreshAll();
			
			    },100); 
			//}

		  }

		  /* Private */
		  Sticky.prototype.createWrapper = function() {
		    if (this.options.wrapper) {
		      this.$element.wrap(this.options.wrapper)
		    }
		    this.$wrapper = this.$element.parent()
		    this.wrapper = this.$wrapper[0]
		  }

		  /* Public */
		  Sticky.prototype.destroy = function() {
		    if (this.$element.parent()[0] === this.wrapper) {
		      this.waypoint.destroy()
		      this.$element.removeClass(this.options.stuckClass)
		      if (this.options.wrapper) {
		        this.$element.unwrap()
		      }
		    }
		  }

		  Sticky.defaults = {
		    wrapper: '<div class="sticky-wrapper" />',
		    stuckClass: 'stuck',
		    direction: 'down right'
		  }

		  Waypoint.Sticky = Sticky
		}())
		;

		//remove outside of column setups 
		if($('.page-submenu').parents('.span_12').find('> .wpb_column').length > 1){
			var pageMenu = $('.page-submenu').clone();
			var pageMenuParentRow = $('.page-submenu').parents('.wpb_row');
			$('.page-submenu').remove();
			pageMenuParentRow.before(pageMenu);
		}

		var sticky = new Waypoint.Sticky({
		  element: $('.page-submenu[data-sticky="true"]')[0]
		});


	}

	if($('#nectar_fullscreen_rows').length == 0)
		$('.page-submenu').parents('.wpb_row').css('z-index',10000);

	$('.page-submenu .mobile-menu-link').on('click',function(){
		$(this).parents('.page-submenu').find('ul').stop(true).slideToggle(350);
		return false;
	});

	$('.page-submenu ul li a').on('click',function(){
		if($('body.mobile').length > 0) $(this).parents('.page-submenu').find('ul').stop(true).slideToggle(350);
	});





	//responsive nav
	$('body').on('click','#toggle-nav',function(){
		$(this).find('.lines-button').toggleClass('close');
		$('#mobile-menu').stop(true,true).slideToggle(500);
		return false;
	});
	
	
	//add wpml to mobile menu
	if($('header#top nav > ul > li.menu-item-language').length > 0 && $('#header-secondary-outer ul > li.menu-item-language').length == 0){
		var $langSelector = $('header#top nav > ul > li.menu-item-language').clone();
		$langSelector.insertBefore('#mobile-menu ul #mobile-search');
	}
	
	////append dropdown indicators / give classes
	$('#mobile-menu .container ul li').each(function(){
		if($(this).find('> ul').length > 0) {
			 $(this).addClass('has-ul');
			 $(this).find('> a').append('<span class="sf-sub-indicator"><i class="icon-angle-down"></i></span>');
		}
	});
	
	////events
	$('#mobile-menu .container ul li:has(">ul") > a .sf-sub-indicator').click(function(){
		$(this).parent().parent().toggleClass('open');
		$(this).parent().parent().find('> ul').stop(true,true).slideToggle();
		return false;
	});
	


/*-------------------------------------------------------------------------*/
/*	5.	Page Specific
/*-------------------------------------------------------------------------*/	

	//recent work
	function piVertCenter() {
		$('.portfolio-items  > .col').each(function(){
				
			//style 4
			$(this).find('.style-4 .work-info .bottom-meta:not(.shown)').stop().animate({
				'bottom' : '-'+$(this).find('.work-info .bottom-meta').outerHeight()-2+'px'
			},420,'easeOutCubic');

			
		});	 
	}
	
	$(window).load(function(){
	 	 portfolioCommentOrder();
	 	 fullWidthContentColumns();
	 	 resizeVideoToCover();
	});
	
	
	//ie8 width fix
	function ie8Width(){
		if( $(window).width() >= 1300 ) {
			$('.container').css('max-width','1100px');
		} else {
			$('.container').css('max-width','880px');
		}
	}
	
	if( $(window).width() >= 1300 && $('html').hasClass('no-video')) { $('.container').css('max-width','1100px'); $(window).resize(ie8Width); };
	


	function smartResizeInit() {

		 //carousel height calcs
		 carouselHeightCalcs();
		 clientsCarouselHeightRecalc();

		 //portfolio comment order
		 portfolioCommentOrder();
		 
		 //testimonial slider height
		 testimonialHeightResize(); //animated
		 testimonialSliderHeight(); //non-animated
		 
		 //full width content columns sizing
		 fullWidthContentColumns();

		 //parallax BG Calculations
		 if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|BlackBerry|Opera Mini)/)){
		   parallaxRowsBGCals();
		 }

		 headerSpace();

		 centeredLogoMargins();

		 slideOutWidgetOverflowState();
		 recentPostHeight();

		 morphingOutlines();

		 flipBoxHeights();

		 //full width menu megamenu adjust
		if($('.slide-out-widget-area-toggle a.open').length > 0 && $('#header-outer[data-full-width="true"]').length > 0) fullWidthHeaderSlidingWidgetMenuCalc();
		  
	}

    $(window).off('smartresize.srInit'); 
	$(window).on('smartresize.srInit', smartResizeInit); 
	
	
	
	function resizeInit() {
		 portfolioDeviceCheck();

		 //fullwidth page section calcs
		 fullWidthSections(); 
		 fullwidthImgOnlySizing();
		 fullWidthContentColumns();
	  	 fullWidthRowPaddingAdjustCalc();
		 
		 //iframe video emebeds
		 responsiveVideoIframes();
		 videoshortcodeSize();
		 
		 if($('.nectar-social.full-width').length > 0) {
		 	nectarLoveFWCenter();
		 }

		 if($('body').hasClass('ascend')){ 
			searchFieldCenter();
		 }

		 if($('body').hasClass('single-post')) centerPostNextButtonImg();
		 
		 //fixed sidebar for portfolio
		 sidebarPxConversion();

		 cascadingImageBGSizing();

		 responsiveTooltips();

		 //vc mobile columns
		 if($('[class*="vc_col-xs-"], [class*="vc_col-md-"], [class*="vc_col-lg-"]').length > 0) vcMobileColumns();

		 if($('body[data-footer-reveal="1"]').length > 0) footerRevealCalcs();

		 if($('#page-header-bg').length > 0) pageHeader();

		 if($('.nectar-video-bg').length > 0) {
		 	resizeVideoToCover();
		 }
	}

	$(window).off('resize.srInit'); 
	$(window).on('resize.srInit', resizeInit); 

	$(window).on("orientationchange",function(){
	  setTimeout(clientsCarouselHeightRecalc,200);
	});
	
	//blog next post button
	function postNextButtonEffect(){

		$('.blog_next_prev_buttons').imagesLoaded(function(){

			centerPostNextButtonImg();
			
			$('.blog_next_prev_buttons img').css('opacity','1');

			if(!$('body').hasClass('mobile') && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/)) {
				$('.blog_next_prev_buttons img').panr({
					scaleDuration: .28,
					sensitivity: 22,
					scaleTo: 1.06
				}); 
			}

		});
	}

	function centerPostNextButtonImg(){
		
		if($('.blog_next_prev_buttons').length == 0) return false;

		if( $('.blog_next_prev_buttons img').height() >= $('.blog_next_prev_buttons').height() + 50 ) {
			var $height = 'auto';
			var $width = $('.blog_next_prev_buttons').width();
		} else {

			if( $('.blog_next_prev_buttons').width() < $('.blog_next_prev_buttons img').width()) {
				var $height = $('.blog_next_prev_buttons').height() + 49;
				var $width = 'auto';
			} else {
				var $height = 'auto';
				var $width = '100%';
			}
			
		}

		$('.blog_next_prev_buttons img').css({ 'height' : $height, 'width': $width });

		$('.blog_next_prev_buttons img').css({
			'top' : ($('.blog_next_prev_buttons').height()/2) - ($('.blog_next_prev_buttons img').height()/2) + 'px',
			'left' : ($('.blog_next_prev_buttons').width()/2) - ($('.blog_next_prev_buttons img').width()/2) + 'px'
		});

		$('.blog_next_prev_buttons .inner').each(function(){
			$(this).css({'top': $(this).parent().height()/2 - ($(this).height()/2), 'opacity':'1' });
		})
	}
	
	postNextButtonEffect();


	function recentPostHeight() {
		$('.blog-recent[data-style="title_only"]').each(function(){
			if($(this).find('> .col').length > 1) return false;
			if($(this).parent().parent().parent().hasClass('vc_col-sm-3') || 
				$(this).parent().parent().parent().hasClass('vc_col-sm-4') || 
				$(this).parent().parent().parent().hasClass('vc_col-sm-6') || 
				$(this).parent().parent().parent().hasClass('vc_col-sm-8') || 
				$(this).parent().parent().parent().hasClass('vc_col-sm-9')) {
				
				if($('body.mobile').length == 0 && $(this).next('div').length == 0) {
					var tallestColumn = 0;
					
					$(this).find('> .col').css('padding', '50px 20px');

					$(this).parents('.span_12').find(' > .wpb_column').each(function(){
						(Math.floor($(this).height()) > tallestColumn) ? tallestColumn = Math.floor($(this).height()) : tallestColumn = tallestColumn;
					});	
			
					if(Math.floor($(this).find('> .col').outerHeight(true)) < Math.floor($(this).parents('.wpb_row').height()) - 1) {
						$(this).find('> .col').css('padding-top',(tallestColumn-$(this).find('> .col').height())/2 + 'px');
						$(this).find('> .col').css('padding-bottom',(tallestColumn-$(this).find('> .col').height())/2 + 'px');
					}
					
				}
				 else {
				 		$(this).find('> .col').css('padding', '50px 20px');
				}
			}
		});
	}
	recentPostHeight();


	//recent post slider
	function recentPostsFlickityInit() {

		if($('.nectar-recent-posts-slider-inner').length == 0) return false;

		var $rpF = $('.nectar-recent-posts-slider-inner').flickity({
			  contain: true,
			  draggable: true,
			  lazyLoad: false,
			  imagesLoaded: true,
			  percentPosition: true,
			  prevNextButtons: false,
			  pageDots: true,
			  resize: true,
			  setGallerySize: true,
			  wrapAround: true,
			  accessibility: false
		});

		setTimeout(function(){
			$('.nectar-recent-posts-slider-inner').addClass('loaded');
		},1150);
		var flkty = $rpF.data('flickity');
	
		//$rpF.on( 'cellSelect', function() {
		// $(flkty.element).parents('.nectar-recent-posts-slider').find('h2:not(.post-ref-'+flkty.selectedIndex+')').hide().css('opacity','0');
		// $(flkty.element).parents('.nectar-recent-posts-slider').find('h2.post-ref-'+flkty.selectedIndex).show().transition({ 'opacity':1},600);
		//});

		$rpF.on( 'dragStart', function() {
			$('.flickity-viewport').addClass('is-moving');
		});
		$rpF.on( 'dragEnd', function() {
			$('.flickity-viewport').removeClass('is-moving');
		});

		recentPostSliderHeight();
		$(window).resize(recentPostSliderHeight);

		if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|BlackBerry|Opera Mini)/))
			$(window).resize(recentPostSliderParallaxMargins);

		function recentPostSliderHeight(){

			$('.nectar-recent-posts-slider').each(function(){
					
						var $heightCalc;
						var $minHeight = 250;
						var $windowWidth = $(window).width();
						var $definedHeight = parseInt($(this).attr('data-height'));

						var dif = ($('body[data-ext-responsive="true"]').length > 0) ? $(window).width() / 1400 : $(window).width() / 1100;

						if( window.innerWidth > 1000 && $('#boxed').length == 0) {

							if($(this).parents('.full-width-content').length == 0) {
								if($('body[data-ext-responsive="true"]').length > 0 && window.innerWidth >= 1400){
									$(this).find('.nectar-recent-post-slide, .flickity-viewport').css('height',Math.ceil($definedHeight));
								} else if($('body[data-ext-responsive="true"]').length == 0 && window.innerWidth >= 1100) {
									$(this).find('.nectar-recent-post-slide, .flickity-viewport').css('height',Math.ceil($definedHeight));
								} else {
									$(this).find('.nectar-recent-post-slide, .flickity-viewport').css('height',Math.ceil($definedHeight*dif));
								}
								
							} else {
								$(this).find('.nectar-recent-post-slide, .flickity-viewport').css('height',Math.ceil($definedHeight*dif));
							}
							
						} else {
							
							//column sliders
							var $parentCol = ($(this).parents('.wpb_column').length > 0) ? $(this).parents('.wpb_column') : $(this).parents('.col') ;
							if($parentCol.length == 0) $parentCol = $('.main-content');
								
							if(!$parentCol.hasClass('vc_span12') && !$parentCol.hasClass('main-content') && !$parentCol.hasClass('span_12') && !$parentCol.hasClass('vc_col-sm-12') ) {
							
								var $parentColWidth = sliderColumnDesktopWidth($parentCol);
								var $aspectRatio = $definedHeight/$parentColWidth;

								
								//min height
								if( $aspectRatio*$parentCol.width() <= $minHeight ){
									$(this).find('.nectar-recent-post-slide, .flickity-viewport').css('height',$minHeight);
								} else {
									$(this).find('.nectar-recent-post-slide, .flickity-viewport').css('height',$aspectRatio*$parentCol.width());
								}
							  
							} 
							
							

							//regular
							else {
								
								//min height
								if( $definedHeight*dif <= $minHeight ){
									$(this).find('.nectar-recent-post-slide, .flickity-viewport').css('height',$minHeight);
								} else {
									$(this).find('.nectar-recent-post-slide, .flickity-viewport').css('height',Math.ceil($definedHeight*dif));
								}
								
							}
							
						}
						
	
					
				});
		
		}

		////helper function
		function sliderColumnDesktopWidth(parentCol) {
			
			var $parentColWidth = 1100;
			var $columnNumberParsed = $(parentCol).attr('class').match(/\d+/);
			
			if($columnNumberParsed == '2') { $parentColWidth = 170 }
			else if($columnNumberParsed == '3') { $parentColWidth = 260 } 
			else if($columnNumberParsed == '4') { $parentColWidth = 340 } 
			else if($columnNumberParsed == '6') { $parentColWidth = 530 } 
			else if($columnNumberParsed == '8') { $parentColWidth = 700 } 
			else if($columnNumberParsed == '9') { $parentColWidth = 805 }
			else if($columnNumberParsed == '10') { $parentColWidth = 916.3 }
			else if($columnNumberParsed == '12') { $parentColWidth = 1100 }
		
			return $parentColWidth;
		}

	
	}
	
	recentPostsFlickityInit();

	if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|BlackBerry|Opera Mini)/))
		if($('.nectar-recent-posts-slider').length > 0) window.requestAnimationFrame(recentPostSliderParallax);

	function recentPostSliderParallax(){

		$('.nectar-recent-posts-slider').each(function(){
			var $offset = parseInt($(this).find('.flickity-slider').position().left);
			var $slideLength = $(this).find('.nectar-recent-post-slide').length;
			var $lastChildIndex = $(this).find('.nectar-recent-post-slide:last-child').index();
			var $slideWidth = $(this).find('.nectar-recent-post-slide').width();
			//wrapped fix

			////first going to first
			if($offset >= -3) {
				$(this).find('.nectar-recent-post-slide:last-child .nectar-recent-post-bg').css('margin-left',parseInt(Math.ceil($slideWidth/3.5))+'px');
			} else {
				$(this).find('.nectar-recent-post-slide:last-child .nectar-recent-post-bg').css('margin-left','-'+parseInt(Math.ceil($slideWidth/3.5*$lastChildIndex))+'px');
			}
			////last going to first
			if(Math.abs($offset) >= ($slideLength-1) * $slideWidth) {
				$(this).find('.nectar-recent-post-slide:first-child .nectar-recent-post-bg').css('margin-left','-'+parseInt(Math.ceil(($slideWidth/3.5)*$slideLength))+'px');
			} else {
				$(this).find('.nectar-recent-post-slide:first-child .nectar-recent-post-bg').css('margin-left','0px');
			}

			$(this).find('.nectar-recent-post-bg').css('transform','translateX('+Math.ceil($(this).find('.flickity-slider').position().left/-3.5)+'px)');
			
			
		});
		requestAnimationFrame(recentPostSliderParallax);
	}

	function recentPostSliderParallaxMargins(){

		$('.nectar-recent-posts-slider').each(function(){		
			var $slideWidth = $(this).find('.nectar-recent-post-slide').width();
			$(this).find('.nectar-recent-post-slide').each(function(i){
				$(this).find('.nectar-recent-post-bg').css('margin-left','-'+  parseInt(Math.ceil($slideWidth/3.5)*i)+'px');
			});
		
		});
	}

	if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|BlackBerry|Opera Mini)/))
		recentPostSliderParallaxMargins();


	//portfolio item hover effect
	
	////desktop event 
	function portfolioHoverEffects() { 

		if(!$('body').hasClass('mobile') && !navigator.userAgent.match(/(iPad|IEMobile)/)) {
			
			//style 1 & 2
			$('.portfolio-items .col .work-item:not(.style-3-alt):not(.style-3):not([data-custom-content="on"])').hover(function(){
				$(this).find('.work-info .vert-center').css({'margin-top' : 0});
				$(this).find('.work-info, .work-info .vert-center *, .work-info > i').css({'opacity' : 1});
				$(this).find('.work-info-bg').css({ 'opacity' : 0.9 });
			},function(){
				$(this).find('.work-info .vert-center').css({ 'margin-top' : -20 });
				$(this).find('.work-info, .work-info .vert-center *, .work-info > i').css({ 'opacity' : 0 });
				$(this).find('.work-info-bg').css({ 'opacity' : 0 });
			});
			
			
			//style 3
			$('.portfolio-items .col .work-item.style-3').hover(function(){

				$(this).find('.work-info-bg').css({ 'opacity' : 0 });

			},function(){
				
				$(this).find('.work-info-bg').css({ 'opacity' : 0.45 });

			});
			
			
			//style 4
			$('.portfolio-items .col .work-item.style-4').hover(function(){
				
				$(this).find('img').stop().animate({
					'top' : '-'+$(this).find('.work-info .bottom-meta').outerHeight()/2+'px'
				},250,'easeOutCubic');
				
				$(this).find('.work-info .bottom-meta').addClass('shown').stop().animate({
					'bottom' : '0px'
				},320,'easeOutCubic');

			},function(){
				
				$(this).find('img').stop().animate({
					'top' : '0px'
				},250,'easeOutCubic');
				
				$(this).find('.work-info .bottom-meta').removeClass('shown').stop().animate({
					'bottom' : '-'+$(this).find('.work-info .bottom-meta').outerHeight()-2+'px'
				},320,'easeOutCubic');
				
			});
		
		} 
		////mobile event
		else {
			portfolioDeviceCheck();
		}

	}

	portfolioHoverEffects();

	function style6Img(){

		//change sizer pos
		$('.style-5').each(function(){
			$(this).find('.sizer').insertBefore($(this).find('.parallaxImg'));
		});

		//set parent zindex
		$('.style-5').parents('.wpb_row').css('z-index','100');

		var d = document,
			de = d.documentElement,
			bd = d.getElementsByTagName('body')[0],
			htm = d.getElementsByTagName('html')[0],
			win = window,
			imgs = d.querySelectorAll('.parallaxImg'),
			totalImgs = imgs.length,
			supportsTouch = 'ontouchstart' in win || navigator.msMaxTouchPoints;

		if(totalImgs <= 0){
			return;
		}

		// build HTML
		for(var l=0;l<totalImgs;l++){

			var thisImg = imgs[l],
				layerElems = thisImg.querySelectorAll('.parallaxImg-layer'),
				totalLayerElems = layerElems.length;

			if(totalLayerElems <= 0){
				continue;
			}

			while(thisImg.firstChild) {
				thisImg.removeChild(thisImg.firstChild);
			}
			
			var lastMove = 0;

			//throttle performance for all browser other than chrome
			var eventThrottle = $('html').hasClass('cssreflections') ? 1 : 80;
			if(eventThrottle == 80) $('body').addClass('cssreflections');

			var containerHTML = d.createElement('div'),
				shineHTML = d.createElement('div'),
				shadowHTML = d.createElement('div'),
				layersHTML = d.createElement('div'),
				layers = [];

			thisImg.id = 'parallaxImg__'+l;
			containerHTML.className = 'parallaxImg-container';
			//shineHTML.className = 'parallaxImg-shine';
			shadowHTML.className = 'parallaxImg-shadow';
			layersHTML.className = 'parallaxImg-layers';

			for(var i=0;i<totalLayerElems;i++){
				var layer = d.createElement('div'),
					layerInner = d.createElement('div'),
					imgSrc = layerElems[i].getAttribute('data-img');

				$(layer).html($(layerElems[i]).html());
				layer.className = 'parallaxImg-rendered-layer';
				layer.setAttribute('data-layer',i);

				if(i==0) { 
					layerInner.className = 'bg-img';
					layerInner.style.backgroundImage = 'url('+imgSrc+')';
					layer.appendChild(layerInner);
				}
				layersHTML.appendChild(layer);

				layers.push(layer);
			}

			containerHTML.appendChild(layersHTML);
			//containerHTML.appendChild(shineHTML);
			thisImg.appendChild(containerHTML);
			$(thisImg).wrap('<div class="parallaxImg-wrap" />');
			if(!(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1)) { $(thisImg).parent().append(shadowHTML); }

			var w = thisImg.clientWidth || thisImg.offsetWidth || thisImg.scrollWidth;
			//thisImg.style.transform = 'perspective('+ w*3 +'px)';

			if(supportsTouch){
				/*win.preventScroll = false;

		        (function(_thisImg,_layers,_totalLayers,_shine) {
					$(thisImg).parents('.style-5').on('touchmove', function(e){
						if (win.preventScroll){
							e.preventDefault();
						}
						window.requestAnimationFrame(function(){
							processMovement(e,true,_thisImg,_layers,_totalLayers,_shine);
						});		
					});
		            $(thisImg).parents('.style-5').on('touchstart', function(e){
		            	win.preventScroll = true;
						processEnter(e,_thisImg,_layers,_totalLayers,_shine);		
					});
					$(thisImg).parents('.style-5').on('touchend', function(e){
						win.preventScroll = false;
						processExit(e,_thisImg,_layers,_totalLayers,_shine);		
					});
		        })(thisImg,layers,totalLayerElems,shineHTML); */
		    } else {
		    	(function(_thisImg,_layers,_totalLayers,_shine) {
					$(thisImg).parents('.style-5').on('mousemove', function(e){

					 	var now = Date.now();
				        if (now > lastMove + eventThrottle) {
				            lastMove = now;
							window.requestAnimationFrame(function(){
								processMovement(e,false,_thisImg,_layers,_totalLayers,_shine);		
							});
						}

						//window.requestAnimationFrame(function(){
						//	processShineMovement(e,false,_thisImg,_layers,_totalLayers,_shine);		
						//});
					});
		            $(thisImg).parents('.style-5').on('mouseenter', function(e){
						processEnter(e,_thisImg,_layers,_totalLayers,_shine);		
					});
					$(thisImg).parents('.style-5').on('mouseleave', function(e){
						processExit(e,_thisImg,_layers,_totalLayers,_shine);		
					});
		        })(thisImg,layers,totalLayerElems,shineHTML);
		    }

		    //set the depths
		    (function(_thisImg,_layers,_totalLayers,_shine) {
			    depths(false,_thisImg,_layers,_totalLayers,_shine);
			     window.addEventListener('resize', function(e){
			    	  depths(false,_thisImg,_layers,_totalLayers,_shine);
			    });
			 })(thisImg,layers,totalLayerElems,shineHTML);
		}

		function processMovement(e, touchEnabled, elem, layers, totalLayers, shine){

			//stop raf if exit already called
			if(!$(elem.firstChild).hasClass('over')) { processExit(e,elem,layers,totalLayers,shine); return false }

			//set up multipliers

			if($(elem).parents('.col.wide').length > 0 ) {
				var yMult = 0.03;
				var xMult = 0.063;
			} else if( $(elem).parents('.col.regular').length > 0  ) {
				var yMult = 0.045;
				var xMult = 0.045;
			} else if($(elem).parents('.col.tall').length > 0 ) {
				var yMult = 0.05;
				var xMult = 0.015;
			} else if($(elem).parents('.col.wide_tall').length > 0) {
				var yMult = 0.04;
				var xMult = 0.04;
			} else {
				var yMult = 0.045;
				var xMult = 0.075;
			}
			
			var bdst = bd.scrollTop || htm.scrollTop,
				bdsl = bd.scrollLeft,
				pageX = (touchEnabled)? e.touches[0].pageX : e.pageX,
				pageY = (touchEnabled)? e.touches[0].pageY : e.pageY,
				offsets = elem.getBoundingClientRect(),
				w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth, // width
				h = elem.clientHeight || elem.offsetHeight || elem.scrollHeight, // height
				wMultiple = 320/w,
				offsetX = 0.52 - (pageX - offsets.left - bdsl)/w, //cursor position X
				offsetY = 0.52 - (pageY - offsets.top - bdst)/h, //cursor position Y
				dy = (pageY - offsets.top - bdst) - h / 2, //@h/2 = center of container
				dx = (pageX - offsets.left - bdsl) - w / 2, //@w/2 = center of container
				yRotate = (offsetX - dx)*(yMult * wMultiple), //rotation for container Y
				xRotate = (dy - offsetY)*(xMult * wMultiple); //rotation for container X //old
				//imgCSS = ' rotateX(' + xRotate + 'deg) rotateY(' + yRotate + 'deg) translateZ(0)'; //img transform
				if($(elem).parents('.wide_tall').length == 0 && $(elem).parents('.wide').length == 0 && $(elem).parents('.tall').length == 0) {
					var imgCSS = ' perspective('+ w*3 +'px) rotateX(' + xRotate + 'deg) rotateY(' + yRotate + 'deg)  translateY('+offsetY*-10+'px) translateX('+offsetX*-10+'px) scale(1.03)'; //img transform
				} else {
					var imgCSS = ' perspective('+ w*3 +'px) rotateX(' + xRotate + 'deg) rotateY(' + yRotate + 'deg)  translateY('+offsetY*-10+'px) translateX('+offsetX*-10+'px) scale(1.013)'; //img transform	
				}
				//imgCSS2 = 'perspective('+ w*3 +'px) rotateX(' + xRotate + 'deg) rotateY(' + yRotate + 'deg) translateZ(0) translateY('+offsetY*-10+'px) translateX('+offsetX*-10+'px)'; //img transform //old

				
			//container transform
			if(elem.firstChild.className.indexOf(' over') != -1){
				if($(elem).parents('.portfolio-items.masonry-items').length > 0){
					//imgCSS2 = ' scale3d(1.025,1.025,1.025)';
				} else {
					//imgCSS2 = ' scale3d(1.06,1.06,1.06)';
				}
			
				

			}
		
			//elem.firstChild.style.transform = imgCSS;
			$(elem).find('.parallaxImg-container').css('transform',imgCSS);

			if(!(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1)) {
				$(elem).parents('.parallaxImg-wrap').find('.parallaxImg-shadow').css('transform',imgCSS);
			}
			//elem.style.transform = imgCSS2;

			
		}

		function processShineMovement(e, touchEnabled, elem, layers, totalLayers, shine){

			var bdst = bd.scrollTop || htm.scrollTop,
				bdsl = bd.scrollLeft,
				pageX = (touchEnabled)? e.touches[0].pageX : e.pageX,
				pageY = (touchEnabled)? e.touches[0].pageY : e.pageY,
				offsets = elem.getBoundingClientRect(),
				w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth, // width
				h = elem.clientHeight || elem.offsetHeight || elem.scrollHeight, // height
				wMultiple = 320/w,
				offsetX = 0.52 - (pageX - offsets.left - bdsl)/w, //cursor position X
				offsetY = 0.52 - (pageY - offsets.top - bdst)/h, //cursor position Y
				dy = (pageY - offsets.top - bdst) - h / 2, //@h/2 = center of container
				dx = (pageX - offsets.left - bdsl) - w / 2, //@w/2 = center of container
				yRotate = (offsetX - dx)*(0.040 * wMultiple), //rotation for container Y
				xRotate = (dy - offsetY)*(0.070 * wMultiple), //rotation for container X
				
				arad = Math.atan2(dy, dx), //angle between cursor and center of container in RAD
				angle = arad * 180 / Math.PI - 90; //convert rad in degrees


			//get angle between 0-360
			if (angle < 0) {
				angle = angle + 360;
			}

			//gradient angle and opacity for shine
			shine.style.background = 'linear-gradient(' + angle + 'deg, rgba(255,255,255,' + (pageY - offsets.top - bdst)/h * 0.3 + ') 0%,rgba(255,255,255,0) 80%)';
			shine.style.transform = 'translateX(' + (offsetX * totalLayers) - 0.1 + 'px) translateY(' + (offsetY * totalLayers) - 0.1 + 'px) ';	

			
		}

		function processEnter(e, elem, layers, totalLayers, shine){
			//var sAgent = window.navigator.userAgent;
  			//var Idx = sAgent.indexOf("Edge");

			elem.firstChild.className += ' over';
			elem.className += ' over';

			//if(Idx == -1) {
				//$('body').addClass('cssreflections');
				//$(elem).addClass('transition');
			//	//var $timeout = setTimeout(function(){ $(elem).removeClass('transition'); },150);
			//} else {
				$(elem).addClass('transition');
				var $timeout = setTimeout(function(){ $(elem).removeClass('transition'); },200);
			//}

			//depths(false, elem, layers, totalLayers, shine);
		}

		function processExit(e, elem, layers, totalLayers, shine){

			var w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth;
			var container = elem.firstChild;

			container.className = container.className.replace(' over','');
			elem.className = elem.className.replace(' over','');
			$(container).css('transform', 'perspective('+ w*3 +'px) rotateX(0deg) rotateY(0deg) translateZ(0)');
			$(elem).parents('.parallaxImg-wrap').find('.parallaxImg-shadow').css('transform','perspective('+ w*3 +'px) rotateX(0deg) rotateY(0deg) translateZ(0)');
			//elem.style.transform = 'perspective('+ w*3 +'px) rotateX(0deg) rotateY(0deg) translateZ(0) translateX(0) translateY(0)';
			//shine.style.cssText = '';
			
			//for(var ly=0;ly<totalLayers;ly++){
				//layers[ly].style.transform = '';
			//}

			$(elem).addClass('transition');
				var $timeout = setTimeout(function(){ $(elem).removeClass('transition'); },200);

			//removeDepths(false, elem, layers, totalLayers, shine);

		}

		function depths(touchEnabled, elem, layers, totalLayers, shine) {
			
			var w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth;
			var revNum = totalLayers;
			var container = elem.firstChild;
			
			//set z
			for(var ly=0;ly<totalLayers;ly++){
				//layers[ly].style.transform = 'translateX(' + (offsetX * revNum) * ((ly * 2.5) / wMultiple) + 'px) translateY(' + (offsetY * totalLayers) * ((ly * 2.5) / wMultiple) + 'px) translateZ(0)';
				if(ly == 0) $(layers[ly]).css('transform', 'translateZ(0px)');
				else $(layers[ly]).css('transform','translateZ(' +(w*3)/27*(ly*1.1) + 'px) ');

				revNum--;
			}
			
			totalLayers = totalLayers + 3;

			//set perspective from beginning
			$(container).css('transform','perspective('+ w*3 +'px)');

			//$(elem).parents('.col').find('.parallaxImg-shine').css('transform','translateZ('+(w*3)/70*(totalLayers*1.1) +'px)');
		}

		function removeDepths(touchEnabled, elem, layers, totalLayers, shine) {
			
			var w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth;
			var revNum = totalLayers;
			
			//set z
			for(var ly=0;ly<totalLayers;ly++){
				
				if(ly == 0) $(layers[ly]).css('transform', 'translateZ(' +(w*3)/45*(ly*1.1) + 'px) scale(1)');
				else $(layers[ly]).css('transform', 'translateZ(' +(w*3)/45*(ly*1.1) + 'px) scale(1)');

				revNum--;
			}
			
			totalLayers = totalLayers + 3;
			
		}
	}

	style6Img();

	function portfolioDeviceCheck(){
		if($('body').hasClass('mobile') || navigator.userAgent.match(/(iPad|IEMobile)/) ){
			
			//if using more details
			if($('.portfolio-items .col .work-item').find('a:not(".pp")').length > 0){
				$('.portfolio-items .col .work-item').find('a.pp').css('display','none');
			} 
			
			//if only using pp
			else {
				$('.portfolio-items .col .work-item').find('a:not(".pp")').css('display','none');
			}
		
		} else {
			$('.portfolio-items .col .work-item').find('a').css('display','inline');
		}
	}
	
	
	//portfolio accent color
	function portfolioAccentColor() {

		var portfolioSocialColorCss = '';

		$('.portfolio-items .col').each(function(){
			if ($(this).has('[data-project-color]')) { 
				$(this).find('.work-info-bg, .bottom-meta').css('background-color',$(this).attr('data-project-color'));

				//style5
				$(this).find('.parallaxImg-rendered-layer .bg-overlay').css('border-color',$(this).attr('data-project-color'));

				var	$projColor = $(this).attr('data-project-color');
				if($(this).find('.custom-content .nectar-social').length > 0 && $('body[data-button-style="rounded"]') ) portfolioSocialColorCss += 'body[data-button-style="rounded"] .col[data-project-color="'+$projColor+'"] .custom-content .nectar-social > *:hover i { color: '+ $projColor +'!important; } ';

			}
		});
		
		if(portfolioSocialColorCss.length > 1) {

			var head = document.head || document.getElementsByTagName('head')[0];
			var style = document.createElement('style');

				style.type = 'text/css';
			if (style.styleSheet){
			  style.styleSheet.cssText = portfolioSocialColorCss;
			} else {
			  style.appendChild(document.createTextNode(portfolioSocialColorCss));
			}

			head.appendChild(style);
		}
	}
	portfolioAccentColor();
	
	//portfolio sort
	$('body').on('mouseenter','.portfolio-filters',function(){
		$(this).find('> ul').stop(true,true).slideDown(500,'easeOutExpo');
		$(this).find('a#sort-portfolio span').html($(this).find('a#sort-portfolio').attr('data-sortable-label'));
	});

	$('body').on('mouseleave','.portfolio-filters',function(){
		var $activeCat = $(this).find('a.active').html();
		if( typeof $activeCat == 'undefined' || $activeCat.length == 0) $activeCat = $(this).attr('data-sortable-label');
		$(this).find('a#sort-portfolio span').html($activeCat);
		$(this).find('> ul').stop(true,true).slideUp(500,'easeOutExpo');
	});
	
	//portfolio selected category
	$('body').on('click','.portfolio-filters ul li a', function(){
		$(this).parents('.portfolio-filters').find('#sort-portfolio span').html($(this).html());
	});
	
	//inline portfolio selected category
	$('body').on('click','.portfolio-filters-inline ul li a',function(){

		$(this).parents('ul').find('li a').removeClass('active');
		$(this).addClass('active');
		$(this).parents('.portfolio-filters-inline').find('#current-category').html($(this).html());
		
	});
	

	function portfolioFiltersInit() {
		//mobile sort menu fix
		if($('body').hasClass('mobile') || navigator.userAgent.match(/(iPad|IEMobile)/)){
			$('.portfolio-filters').unbind('mouseenter mouseleave');
			$('.portfolio-filters > a, .portfolio-filters ul li a').click(function(e){
				if(e.originalEvent !== undefined) $(this).parents('.portfolio-filters').find('> ul').stop(true,true).slideToggle(600,'easeOutCubic');
			});
		}

		$('.portfolio-filters-inline .container > ul > li:nth-child(2) a').click();
		
		//portfolio more details page menu highlight
		$('body.single-portfolio #header-outer nav > ul > li > a:contains("Portfolio")').parents('li').addClass('current-menu-item');
		
		//blog page highlight
		$('body.single-post #header-outer nav > ul > li > a:contains("Blog")').parents('li').addClass('current-menu-item');
	}

	portfolioFiltersInit();

	
	//blog love center
	function centerLove(){
		$('.post').each(function(){
			
			var $loveWidth = $(this).find('.post-meta .nectar-love').outerWidth();
			var $loveWrapWidth = $(this).find('.post-meta  .nectar-love-wrap').width();
			
			//center
			$(this).find('.post-meta .nectar-love').css('margin-left', $loveWrapWidth/2 - $loveWidth/2 + 'px' );
			$(this).find('.nectar-love-wrap').css('visibility','visible');
		});
	}
	
	$('.nectar-love').on('click',function(){
		centerLove();
	});
	
	centerLove();	
	

	//portfolio single comment order
	function portfolioCommentOrder(){
	
		if($('body').hasClass('mobile') && $('body').hasClass('single-portfolio') && $('#respond').length > 0){
			$('#sidebar').insertBefore('.comments-section');
		}
		 
		else if($('body').hasClass('single-portfolio') && $('#respond').length > 0) {
			$('#sidebar').insertAfter('#post-area');
		}
		
	}

	 portfolioCommentOrder();
	 
	
	//portfolio sidebar follow
	
	var sidebarFollow = $('.single-portfolio #sidebar').attr('data-follow-on-scroll');
	
	function portfolioSidebarFollow(){

		sidebarFollow = $('.single-portfolio #sidebar').attr('data-follow-on-scroll');
	
		if( $('body.single-portfolio').length > 0 && sidebarFollow == 1 && !$('body').hasClass('mobile') && parseInt($('#sidebar').height()) + 50 <= parseInt($('#post-area').height())) {
			
			 $('#sidebar').addClass('fixed-sidebar');
			 
			 var $footer = ($('.comment-wrap.full-width-section').length == 0) ? '#footer-outer' : '.comment-wrap';
			 if( $('#call-to-action').length > 0 ) $footer = '#call-to-action';
			 
			 //convert width into px
			 sidebarPxConversion();
			 
			 $('#sidebar').stickyMojo({footerID: $footer, contentID: '#post-area'});
			 
		}
		
	}
	
	function sidebarPxConversion(){
		
		if( $('body.single-portfolio').length > 0 && sidebarFollow == 1 && !$('body').hasClass('mobile') ) {
			
			var $containerWidth = $('.main-content > .row').width();
			var $sidebarWidth = $containerWidth*.235;
			
			if(window.innerWidth > 1300){
				$sidebarWidth = $containerWidth*.235;
			} else if(window.innerWidth < 1300 && window.innerWidth > 1000 ) {
				$sidebarWidth = $containerWidth*.273;
			}
			
			$('#sidebar').css('width',$sidebarWidth+'px');
		}
	}
	
	$(window).load(function(){
		setTimeout(portfolioSidebarFollow,200);
	});
	
	
	//remove the portfolio filters that are not found in the current page
	function isotopeCatSelection() {


		$('.portfolio-items:not(".carousel")').each(function(){

			var isotopeCatArr = [];
			var $portfolioCatCount = 0;
			$(this).parent().parent().find('div[class^=portfolio-filters] ul li').each(function(i){
				if($(this).find('a').length > 0) {
					isotopeCatArr[$portfolioCatCount] = $(this).find('a').attr('data-filter').substring(1);	
					$portfolioCatCount++;
				}
			});
			
			////ice the first (all)
			isotopeCatArr.shift();
			
			
			var itemCats = '';
			
			$(this).find('> div').each(function(i){
				itemCats += $(this).attr('data-project-cat');
			});
			itemCats = itemCats.split(' ');
			
			////remove the extra item on the end of blank space
			itemCats.pop();
			
			////make sure the array has no duplicates
			itemCats = $.unique(itemCats);
			
			////if user has chosen a set of filters to display - only show those
			if($(this).attr('data-categories-to-show').length != 0 && $(this).attr('data-categories-to-show') != 'all') {
				$userSelectedCats = $(this).attr('data-categories-to-show').replace(/,/g , ' ');
				$userSelectedCats = $userSelectedCats.split(' ');
				
				if(!$(this).hasClass('infinite_scroll')) $(this).removeAttr('data-categories-to-show');
			} else {
				$userSelectedCats = itemCats;
			}
			
			
			////Find which categories are actually on the current page
			var notFoundCats = [];
			$.grep(isotopeCatArr, function(el) {

		    	if ($.inArray(el, itemCats) == -1) notFoundCats.push(el);
		    	if ($.inArray(el, $userSelectedCats) == -1) notFoundCats.push(el);

			});
			
			//manipulate the list
			if(notFoundCats.length != 0){
				$(this).parent().parent().find('div[class^=portfolio-filters] ul li').each(function(){
					if($(this).find('a').length > 0) {
						if( $.inArray($(this).find('a').attr('data-filter').substring(1), notFoundCats) != -1 ){ 
							$(this).hide(); 
						} else {
							$(this).show();
						}
					}
				})
			}
		});
	}
	
	isotopeCatSelection();
	
	
	//sharing buttons
	/*jQuery.sharedCount = function(url, fn) {
		url = encodeURIComponent(url || location.href);
		var arg = {
			url: "//" + (location.protocol == "https:" ? "sharedcount.appspot" : "api.sharedcount") + ".com/?url=" + url,
			cache: true,
			dataType: "json"
		};
		if ('withCredentials' in new XMLHttpRequest) {
			arg.success = fn;
		}
		else {
			var cb = "sc_" + url.replace(/\W/g, '');
			window[cb] = fn;
			arg.jsonpCallback = cb;
			arg.dataType += "p";
		}
		return jQuery.ajax(arg);
	};*/
	
	
	
	
	var completed = 0;
	var windowLocation = window.location.href.replace(window.location.hash, '');

	function facebookShare(){
		windowLocation = window.location.href.replace(window.location.hash, '');
		window.open( 'https://www.facebook.com/sharer/sharer.php?u='+windowLocation, "facebookWindow", "height=380,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0" ) 
		return false;
	}

	function googlePlusShare(){
		windowLocation = window.location.href.replace(window.location.hash, '');
		window.open( 'https://plus.google.com/share?url='+windowLocation, "googlePlusWindow", "height=380,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0" ) 
		return false;
	}

	function twitterShare(){
        windowLocation = window.location.href.replace(window.location.hash, '');		
		if($(".section-title h1").length > 0) {
			var $pageTitle = encodeURIComponent($(".section-title h1").text());
		} else {
			var $pageTitle = encodeURIComponent($(document).find("title").text());
		}
		window.open( 'http://twitter.com/intent/tweet?text='+$pageTitle +' '+windowLocation, "twitterWindow", "height=380,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0" ) 
		return false;
	}

	function wooTwitterShare(){
		windowLocation = window.location.href.replace(window.location.hash, '');
		window.open( 'http://twitter.com/intent/tweet?text='+$("h1.product_title").text() +' '+windowLocation, "twitterWindow", "height=380,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0" ) 
		return false;
	}

	function linkedInShare(){
	    windowLocation = window.location.href.replace(window.location.hash, '');	
		if($(".section-title h1").length > 0) {
			var $pageTitle = encodeURIComponent($(".section-title h1").text());
		} else {
			var $pageTitle = encodeURIComponent($(document).find("title").text());
		}
		window.open( 'http://www.linkedin.com/shareArticle?mini=true&url='+windowLocation+'&title='+$pageTitle+'', "linkedInWindow", "height=480,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0" ) 
		return false;
	}

	function woolinkedInShare(){
	    windowLocation = window.location.href.replace(window.location.hash, '');	
		window.open( 'http://www.linkedin.com/shareArticle?mini=true&url='+windowLocation+'&title='+$("h1.product_title").text(), "twitterWindow", "height=380,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0" ) 
		return false;
	}

	function pinterestShare(){
		windowLocation = window.location.href.replace(window.location.hash, '');
		var $sharingImg = ($('.single-portfolio').length > 0 && $('div[data-featured-img]').attr('data-featured-img') != 'empty' ) ? $('div[data-featured-img]').attr('data-featured-img') : $('#ajax-content-wrap img').first().attr('src'); 
		
		if($(".section-title h1").length > 0) {
			var $pageTitle = encodeURIComponent($(".section-title h1").text());
		} else {
			var $pageTitle = encodeURIComponent($(document).find("title").text());
		}
		
		window.open( 'http://pinterest.com/pin/create/button/?url='+windowLocation+'&media='+$sharingImg+'&description='+$pageTitle, "pinterestWindow", "height=640,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0" ) 
		return false;
	}
	
	function wooPinterestShare(){
		$imgToShare = ($('img.attachment-shop_single').length > 0) ? $('img.attachment-shop_single').first().attr('src') : $('.single-product-main-image img').first().attr('src');
		windowLocation = window.location.href.replace(window.location.hash, '');
		window.open( 'http://pinterest.com/pin/create/button/?url='+windowLocation+'&media='+$imgToShare+'&description='+$('h1.product_title').text(), "pinterestWindow", "height=640,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0" ) 
		return false;
	}


	function socialFade(){
			if(completed == $('a.nectar-sharing').length && $('a.nectar-sharing').parent().hasClass('in-sight')) {

				//$timeout = ($('#page-header-bg[data-animate-in-effect="slide-down"] .nectar-social').length > 0 ) ? 500 : 1;
			//	setTimeout(function(){
					//$('.nectar-social > a').stop(true,true).transition({'padding-right':'15px'},350,'easeOutSine');
					
					//love fadein
					$('.nectar-social .nectar-love span').show(350,'easeOutSine',function(){
						$(this).stop().animate({'opacity':1},800);
					});
					
					//sharing loadin
					$('.nectar-social > a').each(function(i){
						var $that = $(this);
						
						$(this).find('> span').show(350,'easeOutSine',function(){
							$that.find('> span').stop().animate({'opacity':1},800);
						});
						
					});
				//},$timeout);

				//alt blog layout total share count
				var $totalShares = 0;
				$('.nectar-social > a .count').each(function(){
					$totalShares += parseInt($(this).html());
				});

				if($totalShares != 1){
					$('.single .meta-share-count .plural').css({'opacity':'1', 'display':'inline'});
					$('.single .meta-share-count .singular').remove();
				} else {
					$('.single .meta-share-count .singular').css({'opacity':'1', 'position':'relative',  'display':'inline'});
					$('.single .meta-share-count .plural').remove();
				}

				$('.meta-share-count .share-count-total').html($totalShares).css('opacity',1);
			}
		}

	$('body').on('click','#single-below-header .nectar-social a', function(){ return false; });

	$('body').on('click','.facebook-share:not(.inactive)', facebookShare);
	$('body').on('click','.google-plus-share:not(.inactive)', googlePlusShare);
	$('body').on('click','.nectar-social:not(".woo") .twitter-share:not(.inactive)', twitterShare);
	$('body').on('click','.nectar-social.woo .twitter-share', wooTwitterShare);
	$('body').on('click','.nectar-social:not(".woo") .linkedin-share:not(.inactive)', linkedInShare);
	$('body').on('click','.nectar-social.woo .linkedin-share', woolinkedInShare);
	$('body').on('click','.nectar-social:not(".woo") .pinterest-share:not(.inactive)', pinterestShare);
	$('body').on('click','.nectar-social.woo .pinterest-share', wooPinterestShare);


	function socialSharingInit() {

		//mobile fullscreen blog class for click event fix
		if($('body').hasClass('mobile') && $('.single-post .fullscreen-header').length > 0) {
			$('#single-below-header .nectar-social .nectar-sharing, #single-below-header .nectar-social .nectar-sharing-alt').addClass('inactive');
		}

		completed = 0;

		if( $('a.facebook-share').length > 0 || $('a.twitter-share').length > 0 || $('a.google-plus-share').length > 0 || $('a.linkedin-share').length > 0 || $('a.pinterest-share').length > 0) {
  
		 
			////facebook
			if($('a.facebook-share:not(.sharing-default-minimal a.facebook-share)').length > 0 && $('body[data-button-style="rounded"]').length == 0 || $('#project-meta a.facebook-share').length > 0 || $('#single-meta a.facebook-share').length > 0 || $('#single-below-header .facebook-share').length > 0) {
				
				//load share count on load  
				$.getJSON("https://graph.facebook.com/?id="+ windowLocation +'&callback=?', function(data) {
					if((data.shares != 0) && (data.shares != undefined) && (data.shares != null)) { 
						$('.facebook-share a span.count, a.facebook-share span.count').html( data.shares );	
					}
					else {
						$('.facebook-share a span.count, a.facebook-share span.count').html( 0 );	
					}
					completed++;
					socialFade();
				});
			 
				
				
			} else if($('a.facebook-share').length > 0 && $('body[data-button-style="rounded"]').length > 0 || $('.sharing-default-minimal a.facebook-share').length > 0) {
				completed++;
				socialFade();
			}
			
			
			////twitter
			if($('a.twitter-share:not(.sharing-default-minimal a.twitter-share)').length > 0 && $('body[data-button-style="rounded"]').length == 0 || $('#project-meta a.twitter-share').length > 0 || $('#single-meta a.twitter-share').length > 0 || $('#single-below-header .twitter-share').length > 0) {
				//load tweet count on load 
				//$.getJSON('https://cdn.api.twitter.com/1/urls/count.json?url='+windowLocation+'&callback=?', function(data) {
				//	if((data.count != 0) && (data.count != undefined) && (data.count != null)) { 
					//	$('.twitter-share a span.count, a.twitter-share span.count').html( data.count );
					//}
					//else {
					$('.twitter-share a span.count, a.twitter-share span.count').html( 0 );
					//}
					completed++;
					socialFade();
				//});


			} else if($('a.twitter-share').length > 0 && $('body[data-button-style="rounded"]').length > 0 || $('.sharing-default-minimal a.twitter-share').length > 0 ) {
				completed++;
				socialFade();
			}
			
			
			////linkedIn
			if($('a.linkedin-share:not(.sharing-default-minimal a.linkedin-share)').length > 0 && $('body[data-button-style="rounded"]').length == 0 || $('#project-meta a.linkedin-share').length > 0 || $('#single-meta a.linkedin-share').length > 0 || $('#single-below-header .linkedin-share').length > 0) {
				//load share count on load 
				//$.getJSON('https://www.linkedin.com/countserv/count/share?url='+windowLocation+'&callback=', function(data) {
				//	if((data.count != 0) && (data.count != undefined) && (data.count != null)) { 
				//		$('.linkedin-share a span.count, a.linkedin-share span.count').html( data.count );
				//	}
				//	else {
						$('.linkedin-share a span.count, a.linkedin-share span.count').html( 0 );
				//	}
					completed++;
					socialFade();
				//});

				
			} else if($('a.linkedin-share').length > 0 && $('body[data-button-style="rounded"]').length > 0 || $('.sharing-default-minimal a.linkedin-share').length > 0) {
				completed++;
				socialFade();
			}
			
			
			////pinterest
			if($('a.pinterest-share:not(.sharing-default-minimal a.pinterest-share)').length > 0 && $('body[data-button-style="rounded"]').length == 0 || $('#project-meta a.pinterest-share').length > 0 || $('#single-meta a.pinterest-share').length > 0 || $('#single-below-header .pinterest-share').length > 0) {
				//load pin count on load 
				$.getJSON('https://api.pinterest.com/v1/urls/count.json?url='+windowLocation+'&callback=?', function(data) {
					if((data.count != 0) && (data.count != undefined) && (data.count != null)) { 
						$('.pinterest-share a span.count, a.pinterest-share span.count').html( data.count );
					}
					else {
						$('.pinterest-share a span.count, a.pinterest-share span.count').html( 0 );
					}
					completed++;
					socialFade();
				});

			} else if($('a.pinterest-share').length > 0 && $('body[data-button-style="rounded"]').length >  0 || $('.sharing-default-minimal a.pinterest-share').length > 0) {
				completed++;
				socialFade();

			}
			
			
			//fadeIn
			$('a.nectar-sharing > span.count, a.nectar-sharing-alt > span.count').hide().css('width','auto');


			//social light up

			$('.nectar-social').each(function() {
				if($(this).parents('.custom-content').length == 0) {


					var $that = $(this);
					var waypoint = new Waypoint({
		 			element: $that,
		 			 handler: function(direction) {

						$slide_timeout = ($('#page-header-bg[data-animate-in-effect="slide-down"] .nectar-social').length > 0 ) ? 900 : 1;

						setTimeout(function(){

							$that.addClass('in-sight');
							socialFade();
							
							if($('#page-header-bg .nectar-social').length == 0) {
								$that.find('> *').each(function(i){
									
									var $that = $(this);
									var $timeout = ($('body[data-button-style="rounded"]').length > 0) ? 0: 750;

									setTimeout(function(){ 
										
										$that.delay(i*80).queue(function(){ 
											
											var $that = $(this); $(this).addClass('hovered'); 
											
											setTimeout(function(){ 
												$that.removeClass('hovered');
											},300); 
											
										});
									
									},$timeout);
								});
							}

						},$slide_timeout );

						$that.addClass('animated-in');
						waypoint.destroy();
					},
					offset: 'bottom-in-view'

				}); 


					
				}
			}); 

		}

	}
	
	socialSharingInit();


	if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/)) {

		var $socialTimeout;
		$('body').on('mouseenter','#single-meta .meta-share-count, #project-meta .meta-share-count', function(){
			clearTimeout($socialTimeout);

			if($(this).parents('[id*="single-meta"]').length > 0 && $('[data-tab-pos="fullwidth"]').length == 0) 
				$(this).find('.nectar-social').show().stop(true).animate({'opacity': 1, 'right':'0px'},0);
			else 
				$(this).find('.nectar-social').show().stop(true).animate({'opacity': 1, 'left':'0px'},0);

			$(this).parents('[id*="-meta"]').addClass('social-hovered');

			$(this).parents('[id*="-meta"]').find('.n-shortcode a, .meta-comment-count a, .meta-share-count > a ').stop(true).animate({'opacity':0},250);
			$(this).find('.nectar-social a').each(function(i){
				$(this).stop(true).delay(i*40).animate({'opacity': 1,  'left':'0px'}, 150);
			});

		});

	
		$('body').on('mouseleave','#single-meta .meta-share-count, #project-meta .meta-share-count', function(){
			$(this).parents('[id*="-meta"]').removeClass('social-hovered');

			if($(this).parents('[id*="single-meta"]').length > 0 && $('[data-tab-pos="fullwidth"]').length == 0) 
				$(this).find('.nectar-social').stop(true).animate({'opacity': 0,  'right':'-20px'}, 200);
			else 
				$(this).find('.nectar-social').stop(true).animate({'opacity': 0,  'left':'-20px'}, 200);

			$(this).parents('[id*="-meta"]').find('.n-shortcode a, .meta-comment-count a, .meta-share-count > a ').stop(true).animate({'opacity':1},250);

			var $that = $(this);
			
			$socialTimeout = setTimeout(function(){ 
				$that.find('.nectar-social').hide(); 
				if($that.parents('[id*="single-meta"]').length > 0 && $('[data-tab-pos="fullwidth"]').length == 0) 
					$that.find('.nectar-social a').stop(true).animate({'opacity': 0,  'left':'20px'},0);   
				else 
					$that.find('.nectar-social a').stop(true).animate({'opacity': 0,  'left':'-20px'},0);   
			}, 200);
		});
	} else {
		var $socialTimeout;
		$('body').on('click','#single-meta .meta-share-count, #project-meta .meta-share-count', function(){
			clearTimeout($socialTimeout);

			if($(this).parents('[id*="single-meta"]').length > 0 && $('[data-tab-pos="fullwidth"]').length == 0) 
				$(this).find('.nectar-social').show().stop(true).animate({'opacity': 1, 'right':'0px'},0);
			else 
				$(this).find('.nectar-social').show().stop(true).animate({'opacity': 1, 'left':'0px'},0);

			$(this).parents('[id*="-meta"]').addClass('social-hovered');

			$(this).parents('[id*="-meta"]').find('.n-shortcode a, .meta-comment-count a, .meta-share-count > a ').stop(true).animate({'opacity':0},250);
			$(this).find('.nectar-social a').each(function(i){
				$(this).stop(true).delay(i*40).animate({'opacity': 1,  'left':'0px'}, 150);
			});

			return false;
		});

	}

	$('body').on('mouseenter','.fullscreen-header  .meta-share-count', function(){
		$(this).find('> a, > i').stop(true).animate({'opacity': 0},400);
		$(this).find('.nectar-social > *').each(function(i){
			$(this).stop(true).delay(i*50).animate({'opacity':'1', 'top': '0px'},250,'easeOutCubic');
		});
		//allow clickable on mobile
		setTimeout(function(){ $('.meta-share-count .nectar-sharing, .meta-share-count .nectar-sharing-alt').removeClass('inactive'); },300);
	});

	if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/)) {
		$('body').on('mouseleave','.fullscreen-header  .meta-share-count', function(){
			$(this).find('> a, > i').stop(true).animate({'opacity': 1},300,'easeInCubic');
			$(this).find('.nectar-social > *').each(function(i){
				$(this).stop(true).animate({'opacity':'0', 'top': '10px'},200,'easeInCubic');
			});
		});
	}




	//full width love center
	function nectarLoveFWCenter(){
		$('.nectar-social.full-width').each(function(){ 
			$(this).find('.n-shortcode .nectar-love').css('padding-top', $(this).find('> a').css('padding-top'));
		});
	}
	
	nectarLoveFWCenter();
	

	//-----------------------------------------------------------------
	// NectarLove
	//-----------------------------------------------------------------
	
	$('body').on('click','.nectar-love', function() {
			

			var $loveLink = $(this);
			var $id = $(this).attr('id');
			var $that = $(this);
			
			if($loveLink.hasClass('loved')) return false;
			if($(this).hasClass('inactive')) return false;
			
			var $dataToPass = {
				action: 'nectar-love', 
				loves_id: $id,
				love_nonce: nectarLove.loveNonce
			}
			
			$.post(nectarLove.ajaxurl, $dataToPass, function(data){
				$loveLink.find('span').html(data);
				$loveLink.addClass('loved').attr('title','You already love this!');
				$loveLink.find('span').css({'opacity': 1,'width':'auto'});
				//ascend
				if($('body').hasClass('ascend') && $that.parents('.classic_enhanced').length == 0 ){
					$loveLink.find('.icon-salient-heart.loved').show().transition({ scale: 1 },800,'cubic-bezier(0.15, 0.84, 0.35, 1.5)');
					setTimeout(function(){ $loveLink.find('.icon-salient-heart-2').css('opacity','0'); },400);
					if($loveLink.parents('.sharing-default-minimal').length > 0 && $loveLink.parents('.bottom-meta').length >0 ) $loveLink.find('.icon-salient-heart-2').remove();
				} else if($that.parents('.classic_enhanced').length > 0 ) {
					$that.find('.icon-salient-heart-2').addClass('loved');
				}
			});
			
			$(this).addClass('inactive');
			
			return false;
	});


	
	//infinite scroll
	function infiniteScrollInit() {

		if($('.infinite_scroll').length > 0) {
			
			//portfolio
			$('.portfolio-items.infinite_scroll').infinitescroll({
		    	navSelector  : "div#pagination",            
		   	    nextSelector : "div#pagination a:first",    
		   	    itemSelector : ".portfolio-items.infinite_scroll .element",
		   	    finishedMsg: "<em>Congratulations, you've reached the end of the internet.</em>",
		        msgText: " ",         
		   },function(newElements){
		   	

				var $container = $('.portfolio-items.infinite_scroll:not(.carousel)');
				//loading effect   

		        var $newElems = $( newElements ).css('opacity',0);
		        //// ensure that images load before adding to masonry layout
		        $newElems.imagesLoaded(function(){
		          
		          $( newElements ).css('opacity',1);

		          $container.isotope( 'appended', $( newElements ));
		          
		          $( newElements ).find('.work-item').addClass('ajax-loaded');
		          $( newElements ).addClass('ajax-loaded');
		          ///// show elems now they're ready
		          
		          $(newElements).find('.work-meta, .nectar-love-wrap').css({'opacity':1});
		          
		          //keep filtering
		          if($('.portfolio-filters-inline').length > 0 || $('.portfolio-filters').length > 0) {
		          	
		          	  if($('.portfolio-filters-inline').length > 0) {
		          	  	 var selector = $('.portfolio-filters-inline a.active').attr('data-filter');
		          	  } else {
		          	  	 var selector = $('.portfolio-filters a.active').attr('data-filter');
		          	  }
		          	  
		          	  $('.portfolio-filters-inline a.active').attr('data-filter');
			  	 	  $container.isotope({ filter: selector });
		          }
		          
			  	//set width
			  	portfolioItemWidths();
			  	reLayout();

		        if($(newElements).find('.work-item.style-5').length > 0) style6Img();

	          	if($(newElements).find('.inner-wrap').attr('data-animation') == 'none') {
					$('.portfolio-items .col .inner-wrap').removeClass('animated');
				} else {

					$(newElements).each(function(i){

						$(this).delay(130*i).queue(function(next){
						    $(this).addClass("animated-in");
						    next();
						});
	
					}); //each
				}

		       
		        portfolioHoverEffects();	
				portfolioAccentColor();
		         
		        //verify smooth scorlling
				if( $smoothCache == true && $(window).width() > 690 && $('body').outerHeight(true) > $(window).height() && Modernizr.csstransforms3d && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|Opera Mini)/)){ niceScrollInit(); $(window).trigger('resize') } 
				
				
				//Panr 
				if(!$('body').hasClass('mobile') && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|Opera Mini)/)) {
					
					$(".portfolio-items:not(.carousel) .work-item.style-3 img").panr({
						scaleDuration: .28
					}); 
					$(".portfolio-items:not(.carousel) .work-item.style-3-alt img").panr({ scaleDuration: .28, sensitivity: 12.6, scaleTo: 1.08, panDuration: 3 }); 
					
				}
				
				//prettyphoto
				$('.portfolio-items').each(function(){
					var $unique_id = Math.floor(Math.random()*10000);
					$(this).find('a[rel^="prettyPhoto"], a.pretty_photo').attr('rel','prettyPhoto['+$unique_id+'_gal]').removeClass('pretty_photo');
				});
		
				lightBoxInit();
				
				piVertCenter();

				setTimeout(function(){masonryZindex(); reLayout(); $( newElements ).removeClass('ajax-loaded'); },700);
		        
		        //recalc the filters
		        isotopeCatSelection();

		        parallaxRowsBGCals();
	          
	          }); 
		          
		       
				
				
				
		   });
			
			
			
			//blog
			$('#post-area.infinite_scroll .posts-container').infinitescroll({
		    	navSelector  : "div#pagination",            
		   	    nextSelector : "div#pagination a:first",    
		   	    itemSelector : "#post-area .posts-container .post",
		   	    finishedMsg: "<em>Congratulations, you've reached the end of the internet.</em>",
		        msgText: " " 
		   },function(newElements){
		   	
		   	if($('.masonry.meta_overlaid').length == 0) { 
			   	//reinit js
			   	centerLove();
			   	
			   	//gallery
				$(newElements).find('.flex-gallery').each(function(){
					
					var $that = $(this);
					
					 $that.flexslider({
				        animation: 'fade',
				        smoothHeight: false, 
				        animationSpeed: 500,
				        useCSS: false, 
				        touch: true
				    });
					
					////gallery slider add arrows
					$('.flex-gallery .flex-direction-nav li a.flex-next').html('<i class="icon-angle-right"></i>');
					$('.flex-gallery .flex-direction-nav li a.flex-prev').html('<i class="icon-angle-left"></i>');

				});
			   	
			   	
			   	//media players
			   	if($().mediaelementplayer) $(newElements).find('.wp-audio-shortcode, .wp-video-shortcode').mediaelementplayer();
			   	
			   	
			   	//lightbox
			    lightBoxInit();
			   	
			   	//carousels
			   	if($('.carousel').length > 0) {
				   	standardCarouselInit();
			    	clientsCarouselInit();
			    }
			   	
			   	//iframes
			   	showLateIframes();

			   	//milestone
			   	$(newElements).find('.nectar-milestone').each(function() {
					//symbol
					if($(this).has('[data-symbol]')) {
						if($(this).attr('data-symbol-pos') == 'before') {
							$(this).find('.number').prepend($(this).attr('data-symbol'));
						} else {
							$(this).find('.number').append($(this).attr('data-symbol'));
						}
					}
				});
				
				if(!$('body').hasClass('mobile')) {
					
					$(newElements).find('.nectar-milestone').each(function() {
						//animation

							var $that = $(this);
							var waypoint = new Waypoint({
				 			element: $that,
				 			 handler: function(direction) {
								if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
								     waypoint.destroy();
								     return;
								}

								var $endNum = parseInt($that.find('.number span').text());
								$that.find('.number span').countTo({
									from: 0,
									to: $endNum,
									speed: 1500,
									refreshInterval: 30
								});

								$that.addClass('animated-in');
								waypoint.destroy();
							},
							offset: 'bottom-in-view'

						}); 

						
					}); 
				}
				
				//pie chart		
			    if($().vcChat) $(newElements).find('.vc_pie_chart').vcChat();
		    	
		    	//fancy ul
		    	nectar_fancy_ul_init();
		    	
		    	//testimonial slider
		    	$('.testimonial_slider').animate({'opacity':'1'},800);
		    	createTestimonialControls();
				testimonialSliderHeight(); 
				testimonialHeightResize();
		    	
				//bar graph
				$(newElements).find('.nectar-progress-bar').each(function(i){
				

				var $that = $(this);
				var waypoint = new Waypoint({
		 			element: $that,
		 			 handler: function(direction) {
						if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
						     waypoint.destroy();
						     return;
						}

						var percent = $that.find('span').attr('data-width');
						var $endNum = parseInt($that.find('span strong i').text());
						
						$that.find('span').transition({
							'width' : percent + '%'
						},1600, 'easeInOutCirc',function(){
						});
						
						$that.find('span strong').transition({
							'opacity' : 1
						},1350);
						
						
						$that.find('span strong i').countTo({
							from: 0,
							to: $endNum,
							speed: 1100,
							refreshInterval: 30,
							onComplete: function(){
					
							}
						});	
						
						////100% progress bar 
						if(percent == '100'){
							$that.find('span strong').addClass('full');
						}


						$that.addClass('animated-in');
						waypoint.destroy();
					},
					offset: 'bottom-in-view'

				}); 


			
				});
				
				
				//columns & images with animation
				colAndImgAnimations();
				splitLineHeadings();

				setTimeout(function(){
					videoshortcodeSize();
					responsiveVideoIframesInit();
					responsiveVideoIframes();
					$(window).trigger('resize');
				},500);


				parallaxRowsBGCals();

				$(window).trigger('resize');
			   	
		   	}//non meta overlaid style 
		   	else {
		   		parallaxRowsBGCals();

				$(window).trigger('resize');
		   	}

		   	// trigger Masonry as a callback
		   	var $container = $('.posts-container');
		    if($container.parent().hasClass('masonry')) { 
		    	 
		    	$(newElements).addClass('masonry-blog-item');
				$(newElements).prepend('<span class="bottom-line"></span>');
				
				//move the meta to the bottom
				$(newElements).each(function(){
					
					var $metaClone = $(this).find('.post-meta').clone();
		
					$(this).find('.post-meta').remove();
					
					if($('#post-area.meta_overlaid').length > 0){
						$(this).find('.post-header h2').after($metaClone);
					} else {
						$(this).find('.content-inner').after($metaClone);
					}
					
				});
			
		    	}//if masonry


		    	//loading effect   
		    	
		        //// hide new items while they are loading
		        var $newElems = $( newElements );
		        //// ensure that images load before adding to masonry layout

		        if($newElems.find('img').length == 0) $newElems = $('body');
		        
		        $newElems.imagesLoaded(function(){

		          $container.isotope( 'appended', $( newElements ));

		          flickityBlogInit();

		          $( newElements ).addClass('ajax-loaded');
		          ///// show elems now they're ready


		        //classic enhanced specific 
		        if($container.parent().hasClass('classic_enhanced')){
					$container.find('.large_featured.has-post-thumbnail.ajax-loaded .post-featured-img, .wide_tall.has-post-thumbnail.ajax-loaded .post-featured-img').each(function(){
						var $src = $(this).find('img').attr('src');
						$(this).css('background-image','url('+$src+')');
					});

					$container.find('.large_featured.ajax-loaded .nectar-flickity, .wide_tall.ajax-loaded .nectar-flickity').each(function(){

						$(this).find('.cell').each(function(){
							var $src = $(this).find('img').attr('src');
							$(this).css('background-image','url('+$src+')');
						});
						
					});
				}


		          if($(newElements).parents('.posts-container').attr('data-animation') == 'none') {
						$( newElements ).find('.inner-wrap').removeClass('animated');
					} else {

						$(newElements).each(function(i){

							$(this).delay(130*i).queue(function(next){
							    $(this).addClass("animated-in");
							    next();
							});
		
						}); //each
					}

					setTimeout(function(){$( newElements ).removeClass('ajax-loaded'); },700);

		        
		        });
		        
		    
		   	
		   });
		   
	   }

}

infiniteScrollInit();

function destroyInfiniteScroll(){
	$('#post-area.infinite_scroll .posts-container').infinitescroll('destroy');
	$('.portfolio-items.infinite_scroll').infinitescroll('destroy');
}
	
/*-------------------------------------------------------------------------*/
/*	6.	Scroll to top
/*-------------------------------------------------------------------------*/	

var $scrollTop = $(window).scrollTop();

//starting bind
function toTopBind() {
	if( $('#to-top').length > 0 && $(window).width() > 1020 || $('#to-top').length > 0 &&  $('#to-top.mobile-enabled').length > 0 ) {
		
		if($scrollTop > 350){
			$(window).on('scroll',hideToTop);
		}
		else {
			$(window).on('scroll',showToTop);
		}
	}
}
toTopBind();

function showToTop(){
	
	if( $scrollTop > 350 && $('#slide-out-widget-area.fullscreen.open').length == 0){

		$('#to-top').stop().transition({
			'bottom' : '17px'
		},350,'easeInOutCubic');	
		
		$(window).off('scroll',showToTop);
		$(window).on('scroll',hideToTop);
	}

}

function hideToTop(){
	
	if( $scrollTop < 350 || $('#slide-out-widget-area.fullscreen.open').length > 0){

		$animationTiming = ($('#slide-out-widget-area.fullscreen.open').length > 0) ? 1150 : 350;

		$('#to-top').stop().transition({
			'bottom' : '-30px'
		},$animationTiming,'easeInOutQuint');	
		
		$(window).off('scroll',hideToTop);
		$(window).on('scroll',showToTop);	
		
	}
}


//to top color
if( $('#to-top').length > 0 ) {
	
	var $windowHeight, $pageHeight, $footerHeight, $ctaHeight;
	
	function calcToTopColor(){
		$scrollTop = $(window).scrollTop();
		$windowHeight = $(window).height();
		$pageHeight = $('body').height();
		$footerHeight = $('#footer-outer').height();
		$ctaHeight = ($('#call-to-action').length > 0) ? $('#call-to-action').height() : 0;
		
		if( ($scrollTop-35 + $windowHeight) >= ($pageHeight - $footerHeight) && $('#boxed').length == 0){
			$('#to-top').addClass('dark');
		}
		
		else {
			$('#to-top').removeClass('dark');
		}
	}
	
	//calc on scroll
	$(window).scroll(calcToTopColor);
	
	//calc on resize
	$(window).resize(calcToTopColor);

}

//alt style
if($('body[data-button-style="rounded"]').length > 0){
	var $clone = $('#to-top .icon-angle-up').clone();
	$clone.addClass('top-icon');
	$('#to-top').prepend($clone)
}

//scroll up event
$('body').on('click','#to-top, a[href="#top"]',function(){
	$('body,html').stop().animate({
		scrollTop:0
	},800,'easeOutQuad',function(){
		if($('.nectar-box-roll').length > 0) {
			$('body').trigger('mousewheel', [1, 0, 0]);
		}
	})
	return false;
});


/* one page scrolling */
function scrollSpyInit(){ 

	//remove full page URLs from hash if located on same page to fix current menu class
	//if(location.pathname.length > 1) {
		$("#header-outer a[href*='" + location.pathname + "']").each(function(){
			var $href = $(this).attr('href');
			
			if($href.indexOf("#") != -1 && $('div'+$href.substr($href.indexOf("#"))).length > 0 ) {
				$(this).attr('href',$href.substr($href.indexOf("#")));
				$(this).parent().removeClass('current_page_item').removeClass('current-menu-item');
			}
		});
	//}

	$target = ($('.page-submenu[data-sticky="true"]').length == 0) ? '#header-outer nav': '.page-submenu';
	$('body').scrollspy({
		target: $target,
		offset: $('#header-outer').height() + adminBarHeight + 40
	});

}

function pageLoadHash() {

	var $hash = window.location.hash;
	if($hash && $($hash).length > 0) {

		$timeoutVar = 0;
		if($('.nectar-box-roll').length > 0 && $('.container-wrap.bottomBoxOut').length > 0) {
			boxRoll(null,-1);
			$timeoutVar = 2050;
		} 
		setTimeout(function(){
		
			if( $('body[data-permanent-transparent="1"]').length == 0 ) {
				
				if(!$('body').hasClass('mobile')){
					$resize = ($('#header-outer[data-header-resize="0"]').length > 0) ? 0 : parseInt(shrinkNum) + headerPadding2*2;
					var $scrollTopDistance =  $($hash).offset().top - parseInt($('#header-space').height()) +$resize + 3 - adminBarHeight;
				} else {
					var $scrollTopDistance = ($('#header-outer[data-mobile-fixed="1"]').length > 0) ? $($hash).offset().top + 2 - $('#header-space').height() + adminBarHeight : $($hash).offset().top - adminBarHeight + 1;	
				}

			} else {
				var $scrollTopDistance = $($hash).offset().top - adminBarHeight + 1;
			}

			if($('body[data-hhun="1"]').length > 0) {
				//alter offset 
				if($('#header-outer.detached').length == 0) 
					$scrollTopDistance = $scrollTopDistance + $('#header-space').height();
			}

			var $pageSubMenu = ($('.page-submenu[data-sticky="true"]').length > 0) ? $('.page-submenu').height() : 0;

			$('body,html').stop().animate({
				scrollTop: $scrollTopDistance - $pageSubMenu
			},800,'easeInOutCubic');

		},$timeoutVar);
	}
}

if($('body[data-animated-anchors="true"]').length > 0) { 


+ function(t) {
    "use strict";

    function s(e, i) {
        var r = t.proxy(this.process, this);
        this.$body = t("body"), this.$scrollElement = t(t(e).is("body") ? window : e), this.options = t.extend({}, s.DEFAULTS, i), this.selector = (this.options.target || "") + " ul li > a", this.offsets = [], this.targets = [], this.activeTarget = null, this.scrollHeight = 0, this.$scrollElement.on("scroll.bs.scrollspy", r), this.refresh(), this.process()
    }

    function e(e) {
        return this.each(function() {
            var i = t(this),
                r = i.data("bs.scrollspy"),
                o = "object" == typeof e && e;
            r || i.data("bs.scrollspy", r = new s(this, o)), "string" == typeof e && r[e]()
        })
    }
    s.VERSION = "3.2.0", s.DEFAULTS = {
        offset: 10
    }, s.prototype.getScrollHeight = function() {
        return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
    }, s.prototype.refresh = function() {
        var s = "offset",
            e = 0;
        t.isWindow(this.$scrollElement[0]) || (s = "position", e = this.$scrollElement.scrollTop()), this.offsets = [], this.targets = [], this.scrollHeight = this.getScrollHeight();
        var i = this;
        this.$body.find(this.selector).map(function() {
            var i = t(this),
                r = i.data("target") || i.attr("href"),
                o = /^#./.test(r) && t(r);
            return o && o.length && o.is(":visible") && [
                [o[s]().top + e, r]
            ] || null
        }).sort(function(t, s) {
            return t[0] - s[0]
        }).each(function() {
            i.offsets.push(this[0]), i.targets.push(this[1])
        })
    }, s.prototype.process = function() {
    	var $pageSubMenu = ($('.page-submenu[data-sticky="true"]').length > 0 && $('body[data-hhun="1"]').length == 0) ? $('.page-submenu').height() : 0;

        var t, s = this.$scrollElement.scrollTop() + this.options.offset + $pageSubMenu,
            e = this.getScrollHeight(),
            i = this.options.offset + e - this.$scrollElement.height() -$pageSubMenu,
            r = this.offsets,
            o = this.targets,
            l = this.activeTarget;
        if (this.scrollHeight != e && this.refresh(), s >= i) return l != (t = o[o.length - 1]) && this.activate(t);
        if (l && s <= r[0]) return l != (t = o[0]) && this.activate(t);
        for (t = r.length; t--;) l != o[t] && s >= r[t] && (!r[t + 1] || s <= r[t + 1]) && this.activate(o[t])
    }, s.prototype.activate = function(s) {
        this.activeTarget = s, t(this.selector).parentsUntil(this.options.target, ".current-menu-item").removeClass("current-menu-item").removeClass('sfHover');
        var e = this.selector + '[data-target="' + s + '"],' + this.selector + '[href="' + s + '"]',
            i = t(e).parents("li").addClass("current-menu-item");
        i.parent(".dropdown-menu").length && (i = i.closest("li.dropdown").addClass("current-menu-item")), i.trigger("activate.bs.scrollspy")
    };
    var i = t.fn.scrollspy;
    t.fn.scrollspy = e, t.fn.scrollspy.Constructor = s, t.fn.scrollspy.noConflict = function() {
        return t.fn.scrollspy = i, this
    }
}(jQuery);


var shrinkNum = 6;	
if($('#header-outer[data-shrink-num]').length > 0 ) shrinkNum = $('#header-outer').attr('data-shrink-num');
headerPadding2 = headerPadding - headerPadding/1.8;

setTimeout(scrollSpyInit,200);

var $animatedScrollingTimeout;

$('body').on('click','#header-outer nav .sf-menu a, #footer-outer .nectar-button, .container-wrap a:not(.wpb_tabs_nav a):not(.woocommerce-tabs a), .swiper-slide .button a, #slide-out-widget-area a, #mobile-menu .container ul li a, #slide-out-widget-area .inner div a',function(e){

	var $hash = $(this).prop("hash");	

	$('body').addClass('animated-scrolling');
	clearTimeout($animatedScrollingTimeout);
	$animatedScrollingTimeout = setTimeout(function(){ $('body').removeClass('animated-scrolling'); },850);

	if($hash && $($hash).length > 0 && $hash != '#top' && $hash != '' && $(this).attr('href').indexOf(window.location.href.split("#")[0]) !== -1 || $(this).is('[href^="#"]') && $hash != '' && $($hash).length > 0 && $hash != '#top') {

		//stop scrolling for certain elements
		//if($(this).parents('.tabbed').length > 0) return false;
		
		//update hash
		if(history.pushState) {
		    history.pushState(null, null, $hash);
		}
		else {
		    location.hash = $hash;
		}

		if($(this).parents('ul').length > 0) { 
			$(this).parents('ul').find('li').removeClass('current-menu-item');
			//$(this).parents('li').addClass('current-menu-item');
		}

		//side widget area click
		if($(this).parents('#slide-out-widget-area').length > 0){
			$('#slide-out-widget-area .slide_out_area_close').trigger('click');
		}

		//mobile menu click
		if($(this).parents('#mobile-menu').length > 0) $('#toggle-nav').trigger('click');
		var $mobileMenuHeight = ($(this).parents('#mobile-menu').length > 0) ? $(this).parents('#mobile-menu').height() : null;
		
		$timeoutVar = 1;
		if($('.nectar-box-roll').length > 0 && $('.container-wrap.bottomBoxOut').length > 0) {
			boxRoll(null,-1);
			$timeoutVar = 2050;
		} 

		var $that = $(this);

		setTimeout(function(){

			//scrolling
			var $headerSpace = ($('body[data-permanent-transparent="1"]').length > 0) ? 0 : parseInt($('#header-space').height());

			if( $('body[data-permanent-transparent="1"]').length == 0 ) {
				
				if(!$('body').hasClass('mobile')){
					$resize = ($('#header-outer[data-header-resize="0"]').length > 0) ? 0 : parseInt(shrinkNum) + headerPadding2*2;
					var $scrollTopDistance =  $($hash).offset().top - $mobileMenuHeight - parseInt($('#header-space').height()) +$resize + 3 - adminBarHeight;
				} else {
					var $scrollTopDistance = ($('#header-outer[data-mobile-fixed="1"]').length > 0) ? $($hash).offset().top + 2 - $('#header-space').height() + adminBarHeight : $($hash).offset().top - $mobileMenuHeight - adminBarHeight + 1;	
				}

			} else {
				var $scrollTopDistance = $($hash).offset().top - adminBarHeight + 1;
			}

			if($('body[data-hhun="1"]').length > 0) {
				//alter offset 
				if($('#header-outer.detached').length == 0 || $that.parents('.page-submenu[data-sticky="true"]').length > 0) 
					$scrollTopDistance = $scrollTopDistance + $('#header-space').height();

				//hide top header
				if($that.parents('.page-submenu[data-sticky="true"]').length > 0) { 
					$('#header-outer.detached').addClass('invisible');
					$('.page-submenu').addClass('header-not-visible').css('transform','translateY(0px)');
				}
			} 

			var $pageSubMenu = ($that.parents('.page-submenu[data-sticky="true"]').length > 0) ? $that.parents('.page-submenu').height() : 0;
			$('body,html').stop().animate({
				scrollTop: $scrollTopDistance - $pageSubMenu
			},800,'easeInOutCubic');

		},$timeoutVar);
		

		e.preventDefault();

	}

	if($hash == '#top') {
		//side widget area click
		if($(this).parents('#slide-out-widget-area').length > 0){
			$('#slide-out-widget-area .slide_out_area_close').trigger('click');
		}
	}


});


if($('.nectar-box-roll').length == 0 && $('#nectar_fullscreen_rows').length == 0) $(window).load(pageLoadHash);

}










	//portfolio colors
	if($('.portfolio-items .col .style-3-alt').length > 0 || $('.portfolio-items .col .style-3').length > 0 || $('.portfolio-items .col .style-2').length > 0 || $('.portfolio-items .col .style-5').length > 0 ) {
		var portfolioColorCss = '';
		$('.portfolio-items .col').each(function(){
			$titleColor = $(this).attr('data-title-color');
			$subTitleColor = $(this).attr('data-subtitle-color');

			 if($titleColor.length > 0 ) portfolioColorCss += '.col[data-title-color="'+$titleColor+'"] .vert-center h3, .portfolio-items[data-ps="6"] .col[data-title-color="'+$titleColor+'"] .work-meta h4 { color: '+$titleColor+'; } ';
			 if($subTitleColor.length > 0 ) portfolioColorCss += '.col[data-subtitle-color="'+$subTitleColor+'"] .vert-center p, .portfolio-items[data-ps="6"] .col[data-title-color="'+$titleColor+'"] .work-meta p { color: '+$subTitleColor+'; } ';
		});


		var head = document.head || document.getElementsByTagName('head')[0];
		var style = document.createElement('style');

			style.type = 'text/css';
		if (style.styleSheet){
		  style.styleSheet.cssText = portfolioColorCss;
		} else {
		  style.appendChild(document.createTextNode(portfolioColorCss));
		}

		head.appendChild(style);
	}

	// masonryPortfolio

	var $portfolio_containers = [];

	$('.portfolio-items:not(.carousel)').each(function(i){
		$portfolio_containers[i] = $(this);
	});

	function masonryPortfolioInit() {

		$portfolio_containers = [];
		$('.portfolio-items:not(.carousel)').each(function(i){
			$portfolio_containers[i] = $(this);
		});

		//// cache window
		var $window = jQuery(window);	
		
			
			$.each($portfolio_containers,function(i){

				
				//// start up isotope with default settings
				$portfolio_containers[i].imagesLoaded(function(){
					
					//verify smooth scorlling
					if( $smoothCache == true && $(window).width() > 690 && $('body').outerHeight(true) > $(window).height() && Modernizr.csstransforms3d && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|Opera Mini)/)){ niceScrollInit(); $(window).trigger('resize') } 
					
					//transformns enabled logic
					var $isoUseTransforms = true;
					
					//Panr 
					if(!$('body').hasClass('mobile') && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/)) {
						
						$(".portfolio-items:not(.carousel) .work-item.style-3 img").panr({ scaleDuration: .28 }); 
						$(".portfolio-items:not(.carousel) .work-item.style-3-alt img").panr({ scaleDuration: .28, sensitivity: 20, scaleTo: 1.12, panDuration: 1 }); 

						$isoUseTransforms = true;
						
					}

					piVertCenter();

					//initial call to setup isotope
					var $layoutMode = ( $portfolio_containers[i].hasClass('masonry-items')) ? 'packery' : 'fitRows';
					var $startingFilter = ($portfolio_containers[i].attr('data-starting-filter') != '' && $portfolio_containers[i].attr('data-starting-filter') != 'default') ? '.' + $portfolio_containers[i].attr('data-starting-filter') : '*';

					reLayout();
					
					$portfolio_containers[i].isotope({
					  itemSelector : '.element',
					  filter: $startingFilter,
					  layoutMode: $layoutMode,
					  transitionDuration: '0.6s',
					  packery: {
						 gutter: 0
					  }
					}).isotope( 'layout' );
					
					
					if($startingFilter != '*'){
						$('.portfolio-filters ul a[data-filter="'+$startingFilter+'"], .portfolio-filters-inline ul a[data-filter="'+$startingFilter+'"]').click();
					}

					//call the reLayout to get things rollin'
					masonryZindex();
					setTimeout(function(){masonryZindex(); },800);
					$window.resize( reLayout );
					$window.smartresize( function(){
						setTimeout(masonryZindex,700);
					});
					
					//inside fwc fix
					if($portfolio_containers[i].parents('.full-width-content').length > 0) { setTimeout(function(){ fullWidthContentColumns(); },200);  }

					//fadeout the loading animation
					$('.portfolio-loading').stop(true,true).fadeOut(200);
					
					//fadeIn items one by one

					if($portfolio_containers[i].find('.inner-wrap').attr('data-animation') == 'none') {
						$('.portfolio-items .col .inner-wrap').removeClass('animated');
					} else {

						portfolioLoadIn();
					}
			
				});
				


			});//each
			
		

	}

	masonryPortfolioInit();

	function portfolioLoadIn() {

		$($fullscreenSelector+'.portfolio-items').each(function(){

			$portfolioOffsetPos = ($('#nectar_fullscreen_rows').length > 0) ? '100%' : '90%';

			if($(this).find('.inner-wrap').attr('data-animation') == 'none') return;

			var $that = $(this);
			var waypoint = new Waypoint({
 			element: $that,
 			 handler: function(direction) {
				
				if($that.parents('.wpb_tab').length > 0 && $that.parents('.wpb_tab').css('visibility') == 'hidden' || $that.hasClass('animated-in')) { 
				     waypoint.destroy();
				     return;
				}

				$that.find('.col').each(function(i){
					$(this).delay(130*i).queue(function(next){
					    $(this).addClass("animated-in");
					    next();
					});
				});
				
				waypoint.destroy();
			},
			offset: $portfolioOffsetPos

			}); 

		}); //each
					
	}


	

	var mediaQuerySize;
	function reLayout() {

		clearTimeout(clearIsoAnimation);
	    $('.portfolio-items .col').addClass('no-transition');
	    clearIsoAnimation = setTimeout(function(){  $('.portfolio-items .col').removeClass('no-transition'); },700); 

		var windowSize = $window.width();
		var masonryObj;
		var masonryObjHolder = [];

		//remove double quotes for FF
		//if (navigator.userAgent.match('MSIE 8') == null) {
		//	mediaQuerySize = mediaQuerySize.replace(/"/g, '');
		//}
		
		//user defined cols
		var userDefinedColWidth;

		$.each($portfolio_containers,function(i){

			if( $portfolio_containers[i].attr('data-user-defined-cols') == 'span4') {
				userDefinedColWidth = 3
			} 
			
			else if( $portfolio_containers[i].attr('data-user-defined-cols') == 'span3') {
				userDefinedColWidth = 4
			} 
			
			var isFullWidth = $portfolio_containers[i].attr('data-col-num') == 'elastic';
			
			
			//chrome 33 approved method for getting column sizing
			if(window.innerWidth > 1600){
				
				if($portfolio_containers[i].hasClass('constrain-max-cols')) {
					mediaQuerySize = 'four';
				} else {
					mediaQuerySize = 'five';
				}
				
			} else if(window.innerWidth <= 1600 && window.innerWidth > 1300){
				mediaQuerySize = 'four';
			} else if(window.innerWidth <= 1300 && window.innerWidth > 990){
				
				if($portfolio_containers[i].hasClass('constrain-max-cols')) {
					mediaQuerySize = 'four';
				} else {
					mediaQuerySize = 'three';
				}
				
			} else if(window.innerWidth <= 990 && window.innerWidth > 470){
				mediaQuerySize = 'two';
			} else if(window.innerWidth <= 470){
				mediaQuerySize = 'one';
			}
			
			//boxed
			if($('#boxed').length > 0) {
				if(window.innerWidth > 1300){
					mediaQuerySize = 'four';
				} else if(window.innerWidth < 1300 && window.innerWidth > 990){
					
					if($portfolio_containers[i].hasClass('constrain-max-cols')) {
						mediaQuerySize = 'four';
					} else {
						mediaQuerySize = 'three';
					}

				} else if(window.innerWidth < 990){
					mediaQuerySize = 'one';
				}
				
			}
			
			//change masonry columns depending on screen size
			switch (mediaQuerySize) {
				case 'five':
					(isFullWidth) ? colWidth = 5 : colWidth = userDefinedColWidth;
					masonryObj = { columnWidth: Math.floor($portfolio_containers[i].width() / parseInt(colWidth)) };
				break;
				
				case 'four':
					(isFullWidth) ? colWidth = 4 : colWidth = userDefinedColWidth;

					masonryObj = { columnWidth: Math.floor($portfolio_containers[i].width() / parseInt(colWidth)) };
				break;
				
				case 'three':
					(isFullWidth) ? colWidth = 3 : colWidth = userDefinedColWidth;
					
					masonryObj = { columnWidth: Math.floor($portfolio_containers[i].width() / parseInt(colWidth)) };
				break;
				
				case 'two':
					masonryObj = { columnWidth: Math.floor($portfolio_containers[i].width() / 2) };
				break;
				
				case 'one':
					masonryObj = { columnWidth: Math.floor($portfolio_containers[i].width() / 1) };
				break;
			}


			//set widths
			portfolioItemWidths();


			//sizing for large items
			if( $portfolio_containers[i].find('.col.elastic-portfolio-item[class*="regular"]:first:visible').length > 0 || $portfolio_containers[i].find('.col.elastic-portfolio-item[class*="wide"]:first:visible').length > 0 || $portfolio_containers[i].find('.col.elastic-portfolio-item[class*="tall"]:first:visible').length > 0 || $portfolio_containers[i].find('.col.elastic-portfolio-item[class*="wide_tall"]:first:visible').length > 0) {

			var multipler = (window.innerWidth > 470) ? 2 : 1;

			//reset height for calcs
			$itemClassForSizing = 'regular';

			if($portfolio_containers[i].find('.col.elastic-portfolio-item[class*="regular"]:first:visible').length == 0 && $portfolio_containers[i].find('.col.elastic-portfolio-item.wide:first:visible').length > 0) {
				$itemClassForSizing = 'wide';
			} else if($portfolio_containers[i].find('.col.elastic-portfolio-item[class*="regular"]:first:visible').length == 0 && $portfolio_containers[i].find('.col.elastic-portfolio-item.wide_tall:first:visible').length > 0) {
				$itemClassForSizing = 'wide_tall';
				multipler = 1;
			} else if($portfolio_containers[i].find('.col.elastic-portfolio-item[class*="regular"]:first:visible').length == 0 && $portfolio_containers[i].find('.col.elastic-portfolio-item.tall:first:visible').length > 0) {
				$itemClassForSizing = 'tall';
				multipler = 1;
			}

		    $portfolio_containers[i].find('.col.elastic-portfolio-item.'+$itemClassForSizing+' img').css('height','auto');

			var tallColHeight = $portfolio_containers[i].find('.col.elastic-portfolio-item.'+$itemClassForSizing+':first:visible img').height();
			
			 $portfolio_containers[i].find('.col.elastic-portfolio-item[class*="tall"] img, .col.elastic-portfolio-item.wide img, .col.elastic-portfolio-item.regular img').removeClass('auto-height');
			 $portfolio_containers[i].find('.col.elastic-portfolio-item[class*="tall"] img:not(.custom-thumbnail)').css('height',(tallColHeight*multipler));
			 $portfolio_containers[i].find('.col.elastic-portfolio-item.wide img:not(.custom-thumbnail), .col.elastic-portfolio-item.regular img:not(.custom-thumbnail)').css('height',tallColHeight);
			 
			 $portfolio_containers[i].find('.col.elastic-portfolio-item[class*="tall"] .parallaxImg').css('height',(tallColHeight*multipler) + parseInt($portfolio_containers[i].find('.col.elastic-portfolio-item').css('padding-bottom'))*2 );
			 $portfolio_containers[i].find('.col.elastic-portfolio-item.regular .parallaxImg, .col.elastic-portfolio-item.wide .parallaxImg').css('height',tallColHeight);
			
			} else {
				$portfolio_containers[i].find('.col.elastic-portfolio-item[class*="tall"] img, .col.elastic-portfolio-item.wide img, .col.elastic-portfolio-item.regular img').addClass('auto-height');
			}

			//non masonry

			if($portfolio_containers[i].hasClass('no-masonry') && $portfolio_containers[i].find('.col:first:visible').length > 0 && $portfolio_containers[i].parents('.wpb_gallery').length == 0){
			  
			   //reset height for calcs
		   	   $portfolio_containers[i].find('.col img').css('height','auto');
		   	   var tallColHeight = $portfolio_containers[i].find('.col:first:visible img').height();
		   	   $portfolio_containers[i].find('.col img:not(.custom-thumbnail)').css('height',tallColHeight);
		   	   $portfolio_containers[i].find('.col .parallaxImg').css('height',tallColHeight);
			}


			masonryObjHolder[i] = masonryObj;
			
			if($portfolio_containers[i].isotope()) $portfolio_containers[i].isotope( 'layout' ); 
				
			

		}); //each
	
	}

	function portfolioItemWidths() {
		 $.each($portfolio_containers,function(i,v){
		 	var $colSize = 4;
		 	var $mult = (mediaQuerySize == 'one') ? 1 : 2;
		 	if(mediaQuerySize == 'five') $colSize = 5;
		 	if(mediaQuerySize == 'four') $colSize = 4;
		 	if(mediaQuerySize == 'three') $colSize = 3;
		 	if(mediaQuerySize == 'two') $colSize = 2;
		 	if(mediaQuerySize == 'one') $colSize = 1;
		 	if($(v).is('[data-ps="6"]') && $colSize == 5) $colSize = 4;

		 	if($(v).width() % $colSize == 0) {
			 	$(v).find('.elastic-portfolio-item:not(.wide):not(.wide_tall)').css('width',Math.floor($(v).width()/$colSize) +'px');
			 	$(v).find('.elastic-portfolio-item.wide, .elastic-portfolio-item.wide_tall').css('width',Math.floor($(v).width()/$colSize*$mult) +'px');
			 } else {
			 	//find closest number to give 0
			 	for(var i = 1; i<4; i++) {
			 		if(($(v).width() - i) % $colSize == 0) {
			 			$(v).find('.elastic-portfolio-item:not(.wide):not(.wide_tall)').css('width',($(v).width()- i)/$colSize +'px');
			 			$(v).find('.elastic-portfolio-item.wide, .elastic-portfolio-item.wide_tall').css('width',($(v).width()-i)/$colSize*$mult +'px');
			 		}

			 	}
			 }
		 	
		 });
	}

	//z-index for masonry
	function masonryZindex(){
		
		//escape if no browser support
		if($('body .portfolio-items:not(".carousel") .elastic-portfolio-item').css('left')) {
		
			var $coords = {};
			var $zindexRelation = {};
			
			$('body .portfolio-items:not(".carousel") .elastic-portfolio-item').each(function(){
				//$coords[$(this).index()] = $(this).css('left').substring(0, $(this).css('left').length - 2);
				$(this).css('z-index',Math.abs(Math.floor($(this).offset().left/20)));
			});
			
			/*var $corrdsArr = $.map($coords, function (value) { return value; });

			$corrdsArr = removeDuplicates($corrdsArr);
			$corrdsArr.sort(function(a,b){return a-b});

			for(var i = 0; i < $corrdsArr.length; i++){
				$zindexRelation[$corrdsArr[i]] = i*10; 
			}
	
			$.each($coords,function(k,v){
				
				var $zindex;
				var $coordCache = v;
				$.each($zindexRelation,function(k,v){
					if($coordCache == k) {
						$zindex = v;
					}
				});
	
				$('body .portfolio-items:not(".carousel") .elastic-portfolio-item:eq('+k+')').css('z-index',$zindex);
			});*/
			
		}


	}

	function blogMasonryZindex(){
		
		//escape if no browser support
		if($('body .masonry.meta_overlaid .masonry-blog-item').css('left')) {
		
			var $coords = {};
			var $zindexRelation = {};
			
			$('body .masonry.meta_overlaid .masonry-blog-item').each(function(){
				$coords[$(this).index()] = $(this).css('left').substring(0, $(this).css('left').length - 2);
			});
			
			var $corrdsArr = $.map($coords, function (value) { return value; });
			$corrdsArr = removeDuplicates($corrdsArr);
			$corrdsArr.sort(function(a,b){return a-b});
	
			for(var i = 0; i < $corrdsArr.length; i++){
				$zindexRelation[$corrdsArr[i]] = i*10; 
			}
	
			$.each($coords,function(k,v){
				
				var $zindex;
				var $coordCache = v;
				$.each($zindexRelation,function(k,v){
					if($coordCache == k) {
						$zindex = v;
					}
				});
	
				$('body .masonry.meta_overlaid .masonry-blog-item:eq('+k+')').css('z-index',$zindex);
			});
			
		}
		
	}
	
	function matrixToArray(matrix) {
	    return matrix.substr(7, matrix.length - 8).split(', ');
	}
	
	function removeDuplicates(inputArray) {
        var i;
        var len = inputArray.length;
        var outputArray = [];
        var temp = {};

        for (i = 0; i < len; i++) {
            temp[inputArray[i]] = 0;
        }
        for (i in temp) {
            outputArray.push(i);
        }
        return outputArray;
    }

    //// filter items when filter link is clicked
	var clearIsoAnimation = null;
	var $checkForScrollBar = null;


	//number portfolios so multiple sortable ones can work easily on same page
	$('.portfolio-items:not(".carousel")').each(function(i){
		$(this).attr('instance',i);
		$(this).parent().parent().find('div[class^=portfolio-filters]').attr('instance',i);
	});

    function isoClickFilter(){
		 var $timeout;		 
		 if(window.innerWidth > 690 && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|Opera Mini)/)){
		 	

		 	/*clearInterval($checkForScrollBar);

		 	if($('html').outerHeight(true) > $(window).height()) {

			 	$checkForScrollBar = null;
			 	$checkForScrollBar = setInterval(function(){ 

			 		if($('body').height() <= $(window).height()) {
			 			fullWidthSections();
			 			$(window).trigger('resize');
			 			clearInterval($checkForScrollBar);
			 		} 
			 	},40);
			} else {

				$checkForScrollBar = null;
			 	$checkForScrollBar = setInterval(function(){ 

			 		if($('html').outerHeight(true) > $(window).height()) {
			 			fullWidthSections();
			 			$(window).trigger('resize');
			 			clearInterval($checkForScrollBar);
			 		} 
			 	},40);
			}*/	 

			 //add css animation only for sorting	 
			/*  clearTimeout(clearIsoAnimation);
			  $('.isotope, .isotope .isotope-item').css('transition-duration','0.7s');
			  clearIsoAnimation = setTimeout(function(){  $('.isotope, .isotope .isotope-item').css('transition-duration','0s'); },700); */
			  
			 clearTimeout($timeout);
			 $timeout = setTimeout(function(){masonryZindex();  },600);

			  
		 }
		  
		  var selector = $(this).attr('data-filter');
		  var $instance = $(this).parents('div[class^=portfolio-filters]').attr('instance');

		  $.each($portfolio_containers,function(i){
		  	if($portfolio_containers[i].attr('instance') == $instance) $portfolio_containers[i].isotope({ filter: selector }).attr('data-current-cat',selector);
		  });


		  //active classes
		  $(this).parent().parent().find('li a').removeClass('active');
		  $(this).addClass('active');
		  
		  //update pp
		  if($('.portfolio-items a[rel^="prettyPhoto"]').length > 0) {
		  	setTimeout(updatePrettyPhotoGallery,170);
		  }

		  else {
		  	setTimeout(updateMagPrettyPhotoGallery,170);
		  }

		  return false;
	}

	////filter event
	$('body').on('click','.portfolio-filters ul li a, .portfolio-filters-inline ul li a', isoClickFilter);


	function updatePrettyPhotoGallery(){
		$('.portfolio-items').each(function(){

			if($(this).find('a[rel^="prettyPhoto"]').length > 0) {

			var $unique_id = Math.floor(Math.random()*10000);
			var $currentCat = $(this).attr('data-current-cat');
			$(this).find('.col'+$currentCat).find('a[rel^="prettyPhoto"]').attr('rel','prettyPhoto['+$unique_id+'_sorted]');
			
			} 
			
		});
	}

	function updateMagPrettyPhotoGallery(){
		$('.portfolio-items').each(function(){
			
			var $currentCat = $(this).attr('data-current-cat');

			$(this).find('.col').each(function(){

				$(this).find('a.gallery').removeClass('gallery').removeClass('magnific');
				
				if($(this).is($currentCat))
					$(this).find('.work-info a').addClass('gallery').addClass('magnific');

			});
		
			
		});
	}



    function masonryBlogInit() {

		var $posts_container = $('.posts-container')
		
		if($posts_container.parent().hasClass('masonry')) { 
			
			$posts_container.find('article').addClass('masonry-blog-item');
			$posts_container.find('article').prepend('<span class="bottom-line"></span>');
			
			//move the meta to the bottom
			$posts_container.find('article').each(function(){
				
				var $metaClone = $(this).find('.post-meta').clone();

				$(this).find('.post-meta').remove();

				if($('#post-area.meta_overlaid').length > 0){
					$(this).find('.post-header h2').after($metaClone);
				} else {
					$(this).find('.content-inner').after($metaClone);
				}
				
			});
		
			
			if($posts_container.parent().hasClass('masonry') && $posts_container.parent().hasClass('full-width-content')){
				$posts_container.parent().wrap('<div class="full-width-content blog-fullwidth-wrap"> </div>').removeClass('full-width-content').css({'margin-left':'0','width':'auto'});
				
				//page header animation fix
				if( $posts_container.parents('.wpb_row').length > 0 ) $posts_container.parents('.wpb_row').css('z-index',100);

				if($('.masonry.meta_overlaid').length == 0) {

					if($('.masonry.classic_enhanced').length > 0) {
						$posts_container.parent().parents('.full-width-content').css({
							'padding' : '0px 0.2% 0px 2.4%'
						});
					} else {
						$posts_container.parent().parents('.full-width-content').css({
							'padding' : '0px 0.2% 0px 3.2%'
						});
					}
					
				} else {
					$posts_container.parent().parents('.full-width-content').addClass('meta-overlaid');
					$('.container-wrap').addClass('meta_overlaid_blog');
				}

				fullWidthSections(); 
			}
			
			var $cols = 3;
			var $element = $posts_container;
			
			if($posts_container.find('img').length == 0) $element = $('<img />');
		
			imagesLoaded($element,function(instance){
				
				if($('body').hasClass('mobile') || $('#post-area').hasClass('span_9')) {
					$cols = 2;
				}

				//set img as BG if masonry classic enhanced
				if($posts_container.parent().hasClass('classic_enhanced')){
					$posts_container.find('.large_featured.has-post-thumbnail .post-featured-img, .wide_tall.has-post-thumbnail .post-featured-img').each(function(){
						var $src = $(this).find('img').attr('src');
						$(this).css('background-image','url('+$src+')');
					});

					$posts_container.find('.large_featured .nectar-flickity, .wide_tall .nectar-flickity').each(function(){

						$(this).find('.cell').each(function(){
							var $src = $(this).find('img').attr('src');
							$(this).css('background-image','url('+$src+')');
						});
						
					});
				}

				$cols = blogColumnNumbCalcs();
				blogHeightCalcs($posts_container, $cols);

				if($('#post-area.meta_overlaid').length > 0) {
					$posts_container.isotope({
					   itemSelector: 'article',
					   transitionDuration: '0s',
					   layoutMode: 'packery',
					   packery: { 
					   	 gutter: 0
					   	}
					}).isotope( 'layout' );

				   
				} else {
				   if($posts_container.parent().hasClass('classic_enhanced')) {
					   	if($('.span_9.masonry').length == 0) {
					   		$multiplier = (window.innerWidth >= 1600) ? .015 : .02;
					   	} else {
					   		$multiplier = .04;
					    } 
				    }
				   else {
				   	$multiplier = ($('.span_9.masonry').length == 0) ? .02: .04;
				   }	
					$posts_container.isotope({
					   itemSelector: 'article',
					   transitionDuration: '0s',
					   layoutMode: 'packery',
					   packery: { 
					   	 gutter: $('#post-area').width()*$multiplier
					   	}
					}).isotope( 'layout' );
				}

				blogLoadIn();
				flickityBlogInit();
				
				$(window).trigger('resize');

				blogMasonryZindex();
				setTimeout(blogMasonryZindex,700);
				$window.smartresize( function(){
					setTimeout(blogMasonryZindex,700);
				});
					
			});
			
			$(window).resize(function(){
				

			   //size all items in grid 
			   //sizing for large items
			    $cols = blogColumnNumbCalcs();
				blogHeightCalcs($posts_container, $cols);

				if($('#post-area.meta_overlaid').length > 0) {
				
				    $posts_container.isotope({
				      layoutMode: 'packery',
				      packery: {
				      	 gutter: 0
				      }
				   });
				} else {
				   
				   if($posts_container.parent().hasClass('classic_enhanced')) {
				   		if($('.span_9.masonry').length == 0) {
					   		$multiplier = (window.innerWidth >= 1600) ? .015 : .02;
					   	} else {
					   		$multiplier = .04;
					    } 
				   } else {
				   	$multiplier = ($('.span_9.masonry').length == 0) ? .02: .04;
				   }	
				  
				   $posts_container.isotope({
				   	layoutMode: 'packery',
				      packery: { 
				      	gutter: $('#post-area').width()*$multiplier
				      }
				   });
				}

			});
			
			
	    } else {
	    	blogLoadIn();
	    }

	}
	
	masonryBlogInit();

	function blogLoadIn(){

		$('.posts-container').each(function(){

			if($(this).attr('data-load-animation') == 'none') {
			
				$(this).find('.inner-wrap').removeClass('animated');
			} else {

				var $that = $(this);
				var waypoint = new Waypoint({
	 			element: $that,
	 			 handler: function(direction) {
					
					$that.find('article').each(function(i){
						$(this).delay(130*i).queue(function(next){
						    $(this).addClass("animated-in");
						    next();
						});
					});
					
					waypoint.destroy();
				},
				offset: '90%'

				}); 
				
			}

		}); //each
	}

	function blogHeightCalcs($posts_container, cols) {
		if( $posts_container.parent().hasClass('meta_overlaid') && $posts_container.find('article[class*="regular"]').length > 0) {

			//widths
			$.each($posts_container,function(i,v){
			 	var $colSize = 4;
			 	var $mult = (cols == 1) ? 1 : 2;

			 	//check if higher than IE9 -- bugs out with width calc
			 	if($('html.no-csstransitions').length == 0) {
			 		$(v).find('article[class*="regular"]').css('width',Math.floor($(v).width()/cols) +'px');
			 		$(v).find('article[class*="tall"]').css('width',Math.floor($(v).width()/cols*$mult) +'px');
			 	} else {
			 		$('#post-area.masonry').css('width','100%');
			 	}
			 	
			 	
			 });

			   //reset height for calcs
			   $posts_container.find('article[class*="regular"] img').css('height','auto');

			   var tallColHeight = Math.ceil($posts_container.find('article[class*="regular"]:not(".format-link"):not(".format-quote") img').first().height());
			   var multipler = (window.innerWidth > 470) ? 2 : 1 ;
			   $posts_container.find('article[class*="tall"] img, .article.wide img, article.regular img').removeClass('auto-height');
			   $posts_container.find('article[class*="tall"] img').css('height',(tallColHeight*multipler));
			   $posts_container.find('article[class*="regular"] img').css('height',(tallColHeight));
			   //quote/links
			   $posts_container.find('article.regular.format-link,article.regular.format-quote').each(function(){

			   		if(window.innerWidth > 470) {
			   			$(this).css({
			  	 			'height': tallColHeight
			   			});
			   		} else {
			   			$(this).css({
			  	 			'height': 'auto'
			   			});			 		
			   		}
			  	 	
			   	});


		} else {
			$posts_container.find('article[class*="tall"] img, article.regular img').addClass('auto-height');
		}


		if( $posts_container.parent().hasClass('classic_enhanced') && $posts_container.find('article[class*="regular"]').length > 0) {
			if($(window).width() > 690 ) 
				classicEnhancedSizing($posts_container.find('article:not(.large_featured):not(.wide_tall)'));
			else 
				classicEnhancedSizing($posts_container.find('article:not(.wide_tall)'));

			var tallColHeight = ($posts_container.find('article[class*="regular"]:not(".format-link"):not(".format-quote").has-post-thumbnail').first().length > 0) ? Math.ceil($posts_container.find('article[class*="regular"]:not(".format-link"):not(".format-quote").has-post-thumbnail').first().css('height','auto').height()) : 600;

			if($(window).width() > 690 ) 
				$posts_container.find('article.large_featured, article.regular, article[class*="wide_tall"]').css('height',(tallColHeight));
			else 
				$posts_container.find('article.regular, article[class*="wide_tall"]').css('height',(tallColHeight));

		//for when no regular articles exist	
		} else if( $posts_container.parent().hasClass('classic_enhanced') && $posts_container.find('article[class*="regular"]').length == 0) {
			var tallColHeight = ($posts_container.find('article[class*="regular"]:not(".format-link"):not(".format-quote").has-post-thumbnail').first().length > 0) ? Math.ceil($posts_container.find('article[class*="regular"]:not(".format-link"):not(".format-quote").has-post-thumbnail').first().css('height','auto').height()) : 600;

			if($(window).width() > 690 ) 
				$posts_container.find('article.large_featured, article.regular, article[class*="wide_tall"]').css('height',(tallColHeight));
			else 
				$posts_container.find('article.regular, article[class*="wide_tall"]').css('height',(tallColHeight));
		}

		//IE9 fix
		if($('html.no-csstransitions').length > 0) 		
			$('#post-area.masonry').css('width','100%');
			 	
			 	
	}

	function classicEnhancedSizing(elements) {

		var tallestCol = 0;
		elements.find('.article-content-wrap').css('height','auto');
		elements.filter('.has-post-thumbnail').each(function(){
			($(this).find('.article-content-wrap').outerHeight(true) > tallestCol) ? tallestCol = $(this).find('.article-content-wrap').outerHeight(true) : tallestCol = tallestCol;
		});	
		
		elements.filter('.has-post-thumbnail').find('.article-content-wrap').css('height',(tallestCol));

	}


	var blogMediaQuerySize;
	function blogColumnNumbCalcs(){
		   if($('body').hasClass('mobile') && window.innerWidth < 990 || $('#post-area').hasClass('span_9') && $('#post-area.meta_overlaid').length == 0) {
			   $cols = 2;
		   } else if( $('#post-area').hasClass('full-width-content') || $('#post-area').parent().hasClass('full-width-content') && $('#boxed').length == 0 || $('#post-area.meta_overlaid').length > 0 ){
		   		
				var windowSize = $(window).width();

				
				if(window.innerWidth >= 1600){
					blogMediaQuerySize = ($('#post-area.meta_overlaid').length > 0) ? 'four' :'five';
				} else if(window.innerWidth < 1600 && window.innerWidth >= 1300){
					blogMediaQuerySize = 'four';
				} else if(window.innerWidth < 1300 && window.innerWidth >= 990){
					blogMediaQuerySize = ($('#post-area.meta_overlaid').length > 0) ? 'four' :'three';
				} else if(window.innerWidth < 990 && window.innerWidth >= 470){
					blogMediaQuerySize = 'two';
				} else if(window.innerWidth < 470){
					blogMediaQuerySize = ($('#post-area.meta_overlaid').length > 0) ? 'two' :'one';
				}
			
				
				//boxed
				if($('#boxed').length > 0) {
					if(window.innerWidth > 1300){
						blogMediaQuerySize = 'four';
					} else if(window.innerWidth < 1300 && window.innerWidth > 990){
						blogMediaQuerySize = ($('#post-area.meta_overlaid').length > 0) ? 'four' :'three';
					} else if(window.innerWidth < 990){
						blogMediaQuerySize = ($('#post-area.meta_overlaid').length > 0) ? 'two' :'one';
					}
					
				}
				
				
				switch (blogMediaQuerySize) {
					case 'five':
						$cols = 5;
					break;
					
					case 'four':
						$cols = 4;
					break;
					
					case 'three':
						$cols = 3;
					break;
					
					case 'two':
						$cols = 2;
					break;
					
					case 'one':
						$cols = 1;
					break;
				}
		   		
			
		   } else {

		   	   $cols = 3;
		   }

		   return $cols;

	}






var shrinkNum = 6;
		
if($('#header-outer[data-shrink-num]').length > 0 ) shrinkNum = $('#header-outer').attr('data-shrink-num');

headerPadding2 = headerPadding - headerPadding/1.8;

$('body').on('click','.section-down-arrow',function(){
	
	if($(this).parents('.nectar-box-roll').length > 0) return false;

	var $currentSection = $(this).parents('#page-header-bg');
	var $topDistance = $currentSection.attr('data-height');
	var $offset = ($currentSection.parents('.first-section').length == 0 || $('body[data-transparent-header="false"]').length > 0) ? $currentSection.offset().top : 0;
	var $bodyBorderSize = ($('.body-border-top').length > 0 && $(window).width() > 690) ? $('.body-border-top').height(): 0;

	if($('body[data-permanent-transparent="1"]').length == 0) {
		//regular
		if(!$('body').hasClass('mobile')){
			if($('body[data-hhun="1"]').length > 0) {
				$('body,html').stop().animate({
					scrollTop: parseInt($topDistance) + $offset + 2 - $bodyBorderSize*2
				},1000,'easeInOutCubic')
			} else {
				$resize = ($('#header-outer[data-header-resize="0"]').length > 0) ? 0 : parseInt(shrinkNum) + headerPadding2*2;
				$('body,html').stop().animate({
					scrollTop: parseInt($topDistance - $('#header-space').height()) +$resize + 3 + $offset 
				},1000,'easeInOutCubic')
			}
			
		} else {
			$scrollPos = ($('#header-outer[data-mobile-fixed="1"]').length > 0) ? parseInt($topDistance) - $('#header-space').height() + parseInt($currentSection.offset().top) + 2 : parseInt($topDistance) + parseInt($currentSection.offset().top) + 2;
			$('body,html').stop().animate({
				scrollTop: $scrollPos - $bodyBorderSize*2
			},1000,'easeInOutCubic')
		}
	} else {
		//permanent transparent
		$('body,html').stop().animate({
			scrollTop: parseInt($topDistance) + parseInt($currentSection.offset().top) + 2 - $bodyBorderSize*2
		},1000,'easeInOutCubic')
	}
	return false;
});







/*-------------------------------------------------------------------------*/
/*	7.	Cross Browser Fixes
/*-------------------------------------------------------------------------*/	
	 
	 function crossBrowserFixes() {

		//Fix current class in menu 
		if ($("body").hasClass("single-portfolio") || $('body').hasClass("error404") || $('body').hasClass("search-results")) {   
			$("li").removeClass("current_page_parent").removeClass("current-menu-ancestor").removeClass('current_page_ancestor');   
		}
		

		//fix for IE8 nth-child
		$('.recent_projects_widget div a:nth-child(3n+3), #sidebar #flickr div:nth-child(3n+3) a, #footer-outer #flickr div:nth-child(3n+3) a').css('margin-right','0px');
		
		//remove br's from code tag
		$('code').find('br').remove();	
		
		//if a clear is the last div, remove the padding
		if($('.container.main-content > .row > div:last-child').hasClass('clear')) {
			$('.container.main-content > .row > div:last-child').css('padding-bottom','0');
		}
		
		//homepage recent blog for IE8
		$('.container-wrap .blog-recent > div:last-child').addClass('col_last');
		
		//blog ascend bottom padding
		if($('.single .blog_next_prev_buttons').length > 0) $('.container-wrap').css('padding-bottom',0);

		//contact form
		$('.wpcf7-form p:has(input[type=submit])').css('padding-bottom','0px');

		$('.full-width-content .wpcf7-submit').on('click',function(){ setTimeout(function(){ fullWidthContentColumns() },1000); setTimeout(function(){ fullWidthContentColumns() },2000); });
		
		//no caption home slider fix
		$('#featured article').each(function(){
			if($(this).find('h2').attr('data-has-caption') == '0') {
				$(this).parents('.slide').addClass('no-caption');
			}
		});
		
		//add class for IE
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf("Edge/");
		if(msie > 0)
			$('body').addClass('msie');

		//gravity form inside fw content row
		$('.gform_body').click(function(){
		   setTimeout(function(){ fullWidthContentColumns(); },200);
		 });

		//chat post format nth child color
		$('article.post.format-chat .content-inner dt:odd').css('color','#333');
		
		//remove margin on last cols inside of full width sections 
		$('.full-width-section').each(function(){
			$(this).find('> .span_12 > div.col_last').last().css('margin-bottom','0');
		});
		
		//remove p tags from extra content editor when warpping only an img 
		$('#portfolio-extra p').each(function(){
			if($(this).find('*').length == 1 && $(this).find('img').length == 1) {
				$(this).find('img').unwrap();
			}
		});
	

		//vc text_separator color
		$('.vc_text_separator').each(function(){
			if( $(this).parents('.full-width-section').length > 0 ) $(this).find('div').css('background-color',$(this).parents('.full-width-section').find('.row-bg').css('background-color'));
		});
		
		//carousel head button alignment  
		$('.carousel-heading').each(function(){
			if($(this).find('h2').length > 0) $(this).find('.carousel-prev, .carousel-next').css('top','7px');
		});
		
		//remove carousel heading if not being used
		$('.carousel-wrap').each(function(){
			if($(this).find('.carousel-heading .container:empty').length > 0) $(this).find('.carousel-heading').remove();
		});
		
		//woocommerce product thuimbnails
		$('.woocommerce div.product div.images div.thumbnails a:nth-child(4n+4)').css('margin-right','0px');
		
		//remove extra galleries when using the nectar gallery slider on projects and posts
		$('article.post .gallery-slider .gallery,  article.post .gallery-slider .jetpack-slideshow, .single-portfolio .gallery-slider .gallery, .single-portfolio .gallery-slider .jetpack-slideshow').remove();
		
		
		$('.woocommerce .span_9 .products.related .products li:nth-child(4), .woocommerce .span_9 .products.upsells .products li:nth-child(4)').remove();
		$('.woocommerce .span_9 .products.related .products li:nth-child(3), .woocommerce .span_9 .products.upsells .products li:nth-child(3)').css('margin-right','0');	
		
		$('.cart-menu a, .widget_shopping_cart a').addClass('no-ajaxy');

		//clients no hover if no link
		$('div.clients').each(function(){
			$(this).find('> div').each(function(){
				if($(this).find('a').length == 0) {
					$(this).addClass('no-link');
				}
			});
		});

		//remove ajaxy from single posts when using disqus
		if(nectarLove.disqusComments == 'true') $('#post-area article a, .blog_next_prev_buttons a, #portfolio-nav #prev-link a, #portfolio-nav #next-link a, .portfolio-items .col .work-item .work-info a').addClass('no-ajaxy');

		//blog next color bg only 
		if($('.blog_next_prev_buttons').find('.bg-color-only-indicator').length > 0) $('.blog_next_prev_buttons').addClass('bg-color-only').find('.bg-color-only-indicator').remove();
		
		if($('#single-below-header').hasClass('fullscreen-header') && $('.blog_next_prev_buttons').length == 0 ) $('#author-bio, .comment-wrap').addClass('lighter-grey');

		//shop header parallax margin 
		if($('body.woocommerce').find('#page-header-bg').length > 0){
			$('.container-wrap').css({'margin-top':'0px','padding-top':'30px'});
		}

		//remove arrows on mega menu item
		$('header#top nav .megamenu .sub-menu a.sf-with-ul .sf-sub-indicator').remove();
		
		//if using wooCommerce sitewide notice
		if($('.demo_store').length > 0) $('#header-outer, #header-space').css('margin-top','32px');
		
		//footer last column class for IE8
		$('#footer-widgets .container .row > div:last-child').addClass('col_last');
		
		//nectar slider external links
		$('.swiper-slide.external-button-1 .buttons > div:nth-child(1) a').attr('target','_blank');
		$('.swiper-slide.external-button-2 .buttons > div:nth-child(2) a').attr('target','_blank');
		
		//portfolio external links
		$(".portfolio-items a[href*='http://']:not([href*='"+window.location.hostname+"']), .recent_projects_widget a[href*='http://']:not([href*='"+window.location.hostname+"'])").attr("target","_blank"); 
		
		//remove excess inner content when empty row
		$('.container-wrap .row > .wpb_row').each(function(){
			if($(this).find('> .span_12 > .wpb_column > .wpb_wrapper').length > 0 && $(this).find('> .span_12 > .wpb_column > .wpb_wrapper').find('*').length == 0) $(this).find('> .span_12 ').remove();
		});
		
		//remove boxed style from full width content
		$('.full-width-content .col.boxed').removeClass('boxed');
		
		//remove full width attribute on slider in full width content section
		$('.full-width-content .wpb_column .nectar-slider-wrap[data-full-width="true"]').attr('data-full-width','false');	

		if( $('.nectar-slider-wrap.first-section').length == 0 && 
			$('.full-width-section.first-section > .span_12 > .vc_span12 > .wpb_wrapper > .nectar-slider-wrap').length == 0  && 
			$('.parallax_slider_outer.first-section').length == 0 && 
			$('.full-width-content.first-section .wpb_wrapper > .nectar-slider-wrap').length == 0  && 
			!($('.wpb_row.first-section > .nectar-parallax-scene').length == 1 && $('#header-outer[data-transparent-header="true"]').length == 1) ) { 
			$('#header-outer .ns-loading-cover').remove(); 
	    }

	    //portfolio description remove on hover
	    var $tmpTitle = null;
	    $('.portfolio-items > .col a[title]').hover(function(){
	    	$tmpTitle = $(this).attr('title');
	    	$(this).attr('title',' ');
	    },function(){
	    	$(this).attr('title', $tmpTitle);
	    });
	    $('.portfolio-items > .col a[title]').click(function(){
			$(this).attr('title', $tmpTitle);
	    });

	};

	crossBrowserFixes();




	function wooPriceSlider(){


		// woocommerce_price_slider_params is required to continue, ensure the object exists
		if ( typeof woocommerce_price_slider_params === 'undefined' || !$('body').hasClass('woocommerce') ) {
			return false;
		}

		// Get markup ready for slider
		$( 'input#min_price, input#max_price' ).hide();
		$( '.price_slider, .price_label' ).show();

		// Price slider uses jquery ui
		var min_price = $( '.price_slider_amount #min_price' ).data( 'min' ),
			max_price = $( '.price_slider_amount #max_price' ).data( 'max' );

		current_min_price = parseInt( min_price, 10 );
		current_max_price = parseInt( max_price, 10 );

		if ( woocommerce_price_slider_params.min_price ) current_min_price = parseInt( woocommerce_price_slider_params.min_price, 10 );
		if ( woocommerce_price_slider_params.max_price ) current_max_price = parseInt( woocommerce_price_slider_params.max_price, 10 );

		$( 'body' ).bind( 'price_slider_create price_slider_slide', function( event, min, max ) {
			if ( woocommerce_price_slider_params.currency_pos === 'left' ) {

				$( '.price_slider_amount span.from' ).html( woocommerce_price_slider_params.currency_symbol + min );
				$( '.price_slider_amount span.to' ).html( woocommerce_price_slider_params.currency_symbol + max );

			} else if ( woocommerce_price_slider_params.currency_pos === 'left_space' ) {

				$( '.price_slider_amount span.from' ).html( woocommerce_price_slider_params.currency_symbol + " " + min );
				$( '.price_slider_amount span.to' ).html( woocommerce_price_slider_params.currency_symbol + " " + max );

			} else if ( woocommerce_price_slider_params.currency_pos === 'right' ) {

				$( '.price_slider_amount span.from' ).html( min + woocommerce_price_slider_params.currency_symbol );
				$( '.price_slider_amount span.to' ).html( max + woocommerce_price_slider_params.currency_symbol );

			} else if ( woocommerce_price_slider_params.currency_pos === 'right_space' ) {

				$( '.price_slider_amount span.from' ).html( min + " " + woocommerce_price_slider_params.currency_symbol );
				$( '.price_slider_amount span.to' ).html( max + " " + woocommerce_price_slider_params.currency_symbol );

			}

			$( 'body' ).trigger( 'price_slider_updated', min, max );
		});

		$( '.price_slider' ).slider({
			range: true,
			animate: true,
			min: min_price,
			max: max_price,
			values: [ current_min_price, current_max_price ],
			create : function( event, ui ) {

				$( '.price_slider_amount #min_price' ).val( current_min_price );
				$( '.price_slider_amount #max_price' ).val( current_max_price );

				$( 'body' ).trigger( 'price_slider_create', [ current_min_price, current_max_price ] );
			},
			slide: function( event, ui ) {

				$( 'input#min_price' ).val( ui.values[0] );
				$( 'input#max_price' ).val( ui.values[1] );

				$( 'body' ).trigger( 'price_slider_slide', [ ui.values[0], ui.values[1] ] );
			},
			change: function( event, ui ) {

				$( 'body' ).trigger( 'price_slider_change', [ ui.values[0], ui.values[1] ] );

			},
		});

	}
	

//vc col mobile fixes
function vcMobileColumns() {
	$('.wpb_row').each(function(){
		if(typeof $(this).find('.span_12').offset() != 'undefined' ) {
		
			$(this).find('[class*="vc_col-"]').each(function(){

				var $firstChildOffset = $(this).parents('.span_12').offset().left;

				$(this).removeClass('no-left-margin');
				if($(this).offset().left < $firstChildOffset + 27) { 
					$(this).addClass('no-left-margin');
				} else {
					$(this).removeClass('no-left-margin');
				}
			});
		}
	});
}

if($('[class*="vc_col-xs-"], [class*="vc_col-md-"], [class*="vc_col-lg-"]').length > 0) vcMobileColumns();


/*-------------------------------------------------------------------------*/
/*	8.	Form Styling
/*-------------------------------------------------------------------------*/	

if($('body[data-form-style="minimal"]').length > 0) {


	//turn user set place holders into labels for effect
	function convertPlaceholders() {
		$('form input[placeholder], form textarea[placeholder]').each(function(i){
			if($(this).attr('placeholder').length > 1) {
				var $placeholder = $(this).attr('placeholder');
				var $inputID = ($(this).is('[id]')) ? $(this).attr('id') : 'id-'+i;
				//add placeholder as label if label doesn't already exist
				
				//skip cf7                               //|| $(this).prev('label').length == 1 && $placeholder.length > $(this).prev('label').text().length
				if($(this).parents('.wpcf7-form-control-wrap').length == 0) {
					if($(this).prev('label').length == 0 || $(this).is('textarea')) {
						$('<label for="'+$inputID+'">'+$placeholder+'</label>').insertBefore($(this));
					}
				} else {
					if($(this).parents('.wpcf7-form-control-wrap').find('label').length == 0) {
						$('<label for="'+$inputID+'">'+$placeholder+'</label>').insertBefore($(this).parents('.wpcf7-form-control-wrap '));
					}
				}
				$(this).removeAttr('placeholder');
			}
		});
	}
	convertPlaceholders();
	setTimeout(convertPlaceholders,500);
	
	//woocommerce placeholder fix
	$( '#billing_country, #shipping_country, .country_to_state' ).on('change',function(){
		convertPlaceholders();
		removeExcessLabels();
		var $wooDynamicPlaceholders = setInterval(function(){
			convertPlaceholders();
			convertToMinimalStyle('form label');
			removeExcessLabels();
		},30);
		setTimeout(function(){ clearInterval($wooDynamicPlaceholders); },600);
		
	});

	function convertToMinimalStyle(selector){

		$(selector).each(function(){
			if($(this).parent().find('input:not([type="checkbox"]):not([type="hidden"]):not(#search-outer input):not(.adminbar-input):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="date"]):not([type="color"]):not([type="range"]):not([role="button"]):not([role="combobox"]):not(.select2-focusser)').length == 1 || $(this).parent().find('textarea').length == 1) {
				
				if($(this).parents('.minimal-form-input').length == 0) {

					//if there's a direct input next to label
				
					if($(this).next('input').length == 1) {
		
						$(this).next('input').andSelf().wrapAll('<div class="minimal-form-input"/>');
					} else {
						//if we need to traverse to parent instead	
						$(this).parent().wrapInner('<div class="minimal-form-input" />');
					}
					$html = $(this).html();
					$(this)[0].innerHTML = '<span class="text"><span class="text-inner">'+$html+'</span></span>';
			
					if($(this).parent().find('textarea').length == 1) $(this).parents('.minimal-form-input').addClass('textarea');
				}
			}

		});

		//for labels that changed that already have minimal form markup - just need to update content
		$(selector).each(function(){
			if($(this).parents('.minimal-form-input').length == 1 && $(this).find('.text').length == 0) {
				
				$html = $(this).html();
				$(this)[0].innerHTML = '<span class="text"><span class="text-inner">'+$html+'</span></span>';
				
			}

		});
	}
	
	convertToMinimalStyle('form label');

	jQuery( document.body ).on( 'updated_cart_totals', function() { 
		convertToMinimalStyle('form label');
	});

	setTimeout(function(){ convertToMinimalStyle('form label'); removeExcessLabels(); checkValueOnLoad(); },501);

	//remove excess labels
	function removeExcessLabels() {
		$('.minimal-form-input').each(function(){
			if($(this).find('label').length > 1) {
				$lngth = 0;
				$(this).find('label').each(function(){
					if($(this).text().length >= $lngth) {
						$lngth = $(this).text().length;
						$(this).parents('.minimal-form-input').find('label').addClass('tbr');
						$(this).removeClass('tbr');
					}
				});
				$(this).find('label.tbr').remove();
			}
		});
	}
	removeExcessLabels();
	

	//add labels to inputs that don't have them
	$('input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not(#search-outer input):not([type="hidden"]):not([type="button"]):not([type="date"]):not([type="color"]):not([type="number"]):not([type="range"]):not([role="button"]):not([role="combobox"]):not(.select2-focusser), textarea').each(function(){
		if($(this).parents('.minimal-form-input').length == 0) {

			$('<label></label>').insertBefore($(this));
			convertToMinimalStyle($(this).prev('label'));
		}
	});


	$('body').on('focus','.minimal-form-input input, .minimal-form-input textarea',function(){
		$(this).parents('.minimal-form-input').addClass('filled').removeClass('no-text');
	});
	$('body').on('blur','.minimal-form-input input, .minimal-form-input textarea',function(){
		if($(this).val().length > 0) $(this).parents('.minimal-form-input').addClass('has-text').removeClass('no-text');
		else $(this).parents('.minimal-form-input').removeClass('has-text').addClass('no-text');
		$(this).parents('.minimal-form-input').removeClass('filled');
	});


	//on load
	function checkValueOnLoad() {
		$('.minimal-form-input input, .minimal-form-input textarea').each(function(){
			if($(this).val().length > 0) $(this).parents('.minimal-form-input').addClass('has-text').removeClass('no-text');
		});
	}
	checkValueOnLoad();

	 // Textarea Auto Resize
    var hiddenDiv = $('.hiddendiv').first();
    if (!hiddenDiv.length) {
      hiddenDiv = $('<div class="textareahiddendiv common"></div>');
      $('body').append(hiddenDiv);
    }
    var text_area_selector = 'textarea';

    function textareaAutoResize($textarea) {
      // Set font properties of hiddenDiv

      var fontFamily = $textarea.css('font-family');
      var fontSize = $textarea.css('font-size');

      if (fontSize) { hiddenDiv.css('font-size', fontSize); }
      if (fontFamily) { hiddenDiv.css('font-family', fontFamily); }

      if ($textarea.attr('wrap') === "off") {
        hiddenDiv.css('overflow-wrap', "normal")
                 .css('white-space', "pre");
      }




      hiddenDiv.text($textarea.val() + '\n');
      var content = hiddenDiv.html().replace(/\n/g, '<br>');
      hiddenDiv.html(content);


      // When textarea is hidden, width goes crazy.
      // Approximate with half of window size

      if ($textarea.is(':visible')) {
        hiddenDiv.css('width', $textarea.width());
      }
      else {
        hiddenDiv.css('width', $(window).width()/2);
      }

      $textarea.css('height', hiddenDiv.height());
    }

    $(text_area_selector).each(function () {
      var $textarea = $(this);
      if ($textarea.val().length) {
        textareaAutoResize($textarea);
      }
    });

    $('body').on('keyup keydown autoresize', text_area_selector, function () {
      textareaAutoResize($(this));
    });

}


if($('body[data-fancy-form-rcs="1"]').length > 0) {

	 //radio / checkbox markup conversion 

    ////default
    $('input[type="checkbox"]').each(function(){
    	//check if for relationship exists
    	$id = $(this).attr('id');
    	if(typeof $id !== typeof undefined && $id !== false && $('label[for="'+$id+'"]').length > 0) {
    		$('label[for="'+$id+'"]').prepend('<span></span>');
    	} 

    });	

    ////for cf7
    $('.wpcf7-radio .wpcf7-list-item-label').each(function(i){
    	var $data = $(this).html();
    	var $name = $(this).parent().find('input').attr('name') + i;
    	$(this).parent().find('input').attr('id',$name);
    	$(this).replaceWith('<label for="'+$name+'">'+$data+'</label>');
    });

     $('.wpcf7-checkbox .wpcf7-list-item-label').each(function(){
    	var $data = $(this).html();
    	var $name = $(this).parent().find('input').attr('value');
    	$(this).parent().find('input').attr('id',$name);
    	$(this).replaceWith('<label for="'+$name+'"><span></span>'+$data+'</label>');
    });


    //select
    $('select:not(.comment-form-rating #rating)').each(function(){

    	//cf7
    	if($(this).parents('.wpcf7-form-control-wrap').length > 0) {

    		//select 2 already initialized
	    	if($(this).parents('.wpcf7-form-control-wrap').find('.select2-container').length > 0) {
	    		$selector = $($(this).prev('.select2-container'));
	    	} else {
	    		$selector = $(this);
	    	}

	    	//if label is found
	    	if($selector.parents('.wpcf7-form-control-wrap').parent().find('label').length == 1) {
	    		$selector.parents('.wpcf7-form-control-wrap').parent().wrapInner('<div class="fancy-select-wrap" />');
	    	} else {
	    		//default wrap
	    		$selector.wrap('<div class="fancy-select-wrap" />');
	    	}
    	} 
    	//default
    	else {

	    	//select 2 already initialized
	    	if($(this).prev('.select2-container').length > 0) {
	    		$selector = $(this).prev('.select2-container');
	    	} else {
	    		$selector = $(this);
	    	}

	    	//if label is found
	    	if($selector.prev('label').length == 1) {
	    		$selector.prev('label').andSelf().wrapAll('<div class="fancy-select-wrap" />');
	    	} else if($selector.next('label').length == 1) {
	    		$selector.next('label').andSelf().wrapAll('<div class="fancy-select-wrap" />');
	    	} else {
	    		//default wrap
	    		$selector.wrap('<div class="fancy-select-wrap" />');
	    	}
    	}
    });
	
	function select2Init(){
		$('select:not(.state_select):not(.country_select):not(.comment-form-rating #rating)' ).each( function() {
			$( this ).select2({
				minimumResultsForSearch: 7
			});
		});
	}
   
	select2Init();

}
	
	$('a#toggle-section').click(function(){
			
		//open
		if(!$('#style-selection').hasClass('open')){
			var $distance = ($('body[data-smooth-scrolling="0"]').length > 0) ? '0px' : '13px';
			$('#style-selection').addClass('open');
			$('#style-selection').stop().animate({
				'right' : $distance
			},600,'easeOutCubic');
		}
		
		//close  
		else {
			var $distance = ($('body[data-smooth-scrolling="0"]').length > 0) ? '-196px' : '-177px';
			$('#style-selection').removeClass('open');
			$('#style-selection').stop().animate({
				'right' : $distance
			},500,'easeInCubic');
			if($('#style-selection .select2-choice').length > 0) { 
				$('#style-selection .select2-container').removeClass('select2-container-active').removeClass('select2-dropdown-open');
				$('.select2-drop, .select2-drop-mask').hide();
			}
		}

		return false;
	});
	

	if($('body[data-ajax-transitions="true"]').length > 0 && $('#ajax-loading-screen[data-method="ajax"]').length > 0 && !navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/) && $(window).width() > 690 ) {

		$('#ajax-content-wrap').ajaxify({
			'selector':'#ajax-content-wrap a:not(.no-ajaxy):not([target="_blank"]):not([href^="#"]):not(.comment-edit-link):not(#cancel-comment-reply-link):not(.comment-reply-link):not(#toggle-nav):not(.cart_list a):not(.logged-in-as a):not(.no-widget-added a):not(.add_to_cart_button):not(.product-wrap a):not(.section-down-arrow):not([data-filter]):not(.product_list_widget a):not(.pp):not([rel^="prettyPhoto"]):not(.pretty_photo), #header-outer li:not(.no-ajaxy) > a:not(.no-ajaxy), #header-outer #logo',
			'verbosity': 0, 
			requestDelay: 400,
			previewoff : true,
			memoryoff: true,
			turbo : false
		});

		$(window).on("pronto.render", initPage)
		.on("pronto.load", destroyPage)
		.on("pronto.request", transitionPage);

		if($('.nectar-box-roll').length == 0) setTimeout(function() { waypoints(); },300);

		initPage();

	} else if($('body[data-ajax-transitions="true"]').length > 0 && $('#ajax-loading-screen[data-method="standard"]').length > 0 ) {
		
		//chrome white BG flash fix
		$('html').addClass('page-trans-loaded');

		//fadeout loading animation
		if($('#ajax-loading-screen[data-effect="standard"]').length > 0) {
			if($('.nectar-particles').length == 0) setTimeout(function(){ $('#ajax-loading-screen').stop().transition({'opacity':0},800,function(){ $(this).css({'display':'none'}); }); $('#ajax-loading-screen .loading-icon').transition({'opacity':0},800) },100);

			//bind waypoints after loading screen has left
			if($('.nectar-box-roll').length == 0) setTimeout(function() { waypoints(); },750);

			//safari back/prev fix
			if(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1 || navigator.userAgent.match(/(iPod|iPhone|iPad)/)){
				window.onunload = function(){ $('#ajax-loading-screen').stop().transition({'opacity':0},800,function(){ $(this).css({'display':'none'}); }); $('#ajax-loading-screen .loading-icon').transition({'opacity':0},600) };
				window.onpageshow = function(event) {
		    		if (event.persisted) { 
		    			$('#ajax-loading-screen').stop().transition({'opacity':0},800,function(){ 
		    				$(this).css({'display':'none'}); 
		    			}); 
		    			$('#ajax-loading-screen .loading-icon').transition({'opacity':0},600);
		    		}
		    	}
			} else if(navigator.userAgent.indexOf('Firefox') != -1) {
				window.onunload = function(){};
			}

	    		
	    	
			
		} else {
			if($('#page-header-wrap #page-header-bg[data-animate-in-effect="zoom-out"] .nectar-video-wrap').length == 0 && $('.parallax_slider_outer').length == 0 && $('.first-nectar-slider').length == 0) {
				setTimeout(function(){ 
					$('#ajax-loading-screen').addClass('loaded');
					setTimeout(function(){ $('#ajax-loading-screen').addClass('hidden'); },1000);
				},150);
			}


			//safari back/prev fix
			if(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1 || navigator.userAgent.match(/(iPod|iPhone|iPad)/)){
				window.onunload = function(){ $('#ajax-loading-screen').stop().transition({'opacity':0},800,function(){ $(this).css({'display':'none'}); }); $('#ajax-loading-screen .loading-icon').transition({'opacity':0},600) };
				window.onpageshow = function(event) {
		    		if (event.persisted) { 
		    			$('#ajax-loading-screen').stop().transition({'opacity':0},800,function(){ 
		    				$(this).css({'display':'none'}); 
		    			}); 
		    			$('#ajax-loading-screen .loading-icon').transition({'opacity':0},600);
		    		}
		    	}
			} else if(navigator.userAgent.indexOf('Firefox') != -1) {
				window.onunload = function(){};
			}

			//bind waypoints after loading screen has left
			if($('.nectar-box-roll').length == 0) setTimeout(function() { waypoints(); },350);

		}

		//remove excess loading images now
		$('.portfolio-loading, .nectar-slider-loading .loading-icon').remove();


		if($('#ajax-loading-screen[data-disable-fade-on-click="1"]').length == 0) {
			$('a[href]:not(.no-ajaxy):not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not(.comment-edit-link):not(.magnific-popup):not(.magnific):not(.meta-comment-count a):not(.comments-link):not(#cancel-comment-reply-link):not(.comment-reply-link):not(#toggle-nav):not(.logged-in-as a):not(.add_to_cart_button):not(.section-down-arrow):not([data-filter]):not(.pp):not([rel^="prettyPhoto"]):not(.pretty_photo)').click(function(e){
				
				var $windowCurrentLocation = window.location.href.split("#")[0];
				var $windowClickedLocation = $(this).attr('href').split("#")[0];

				if($(this).parent('.menu-item-has-children').length > 0 && $(this).parents('.off-canvas-menu-container').length > 0 || ($windowClickedLocation == $windowCurrentLocation)) {

				} else {
					if(!$(this).parent().hasClass('no-ajaxy')) {

						var $targetLocation = $(this).attr('href');
						var $timeOutDur = 0;
						if($targetLocation != '') {

							$('#ajax-loading-screen').addClass('set-to-fade');

							transitionPageStandard();

							setTimeout(function(){
								window.location = $targetLocation;
							},$timeOutDur)
							
							return false;
						}
					}
				}

			});
		} // if disable fade out is not on
	} else {	
		//bind waypoints regularly
		if($('.nectar-box-roll').length == 0) setTimeout(function() { waypoints(); },100);
	}


	function transitionPage(e) {
		

		if($(window).scrollTop() > 0) {

			//stop nicescroll
			if($().niceScroll && $("html").getNiceScroll()){
				var nice = $("html").getNiceScroll();
				nice.stop();
			}
			
			$('body,html').stop(true,true).animate({
				scrollTop:0
			},500,'easeOutQuad',function(){ 
				$('#ajax-loading-screen').css({'opacity':'1', 'display':'none'});
				$('#ajax-loading-screen').stop(true,true).fadeIn(600,function(){
					$('#ajax-loading-screen .loading-icon').animate({'opacity':1},400);
					//close widget area
					setTimeout(function(){  if($('#header-outer').hasClass('side-widget-open')) $('.slide-out-widget-area-toggle a').trigger('click');  },400);
				});
			});

		} else {
			$('#ajax-loading-screen').css('opacity','1').stop().fadeIn(600,function(){
				$('#ajax-loading-screen .loading-icon').animate({'opacity':1},400);
			});

			//close widget area
			setTimeout(function(){  if($('#header-outer').hasClass('side-widget-open')) $('.slide-out-widget-area-toggle a').trigger('click');  },400);
		}

		
	}

	function transitionPageStandard(e) {
		
		$('#ajax-loading-screen').css('opacity','1').stop().fadeIn(500);
		//setTimeout(function(){ $('#ajax-loading-screen .loading-icon').animate({'opacity':1},500); },400);

	}

	function destroyPage(e) {
		$(window).off('scroll.appear');
		if($('#nectar_fullscreen_rows').length > 0 && $().fullpage) 
			$.fn.fullpage.destroy('all');
	}

	function initPage(e) {

		if(!$('body').hasClass('ajax-loaded')) return false;


		//init js
		lightBoxInit();
		addOrRemoveSF();
		$(".sf-menu").superfish('destroy');
		$('#header-outer').removeClass('dark-slide');
		initSF();
		SFArrows();
		headerInit();
		var $effectTimeout = ($('#ajax-loading-screen').length > 0) ? 800 : 0;
		pageHeaderTextEffectInit();
		if($('#page-header-bg .nectar-video-wrap video').length == 0) setTimeout(pageHeaderTextEffect,$effectTimeout);
		coloredButtons();
		columnBGColors();
		fwCarouselLinkFix();
		if($('.carousel').length > 0) {
			standardCarouselInit();
			clientsCarouselInit();
			carouselHeightCalcs();
		}
		if($('.owl-carousel').length > 0) owlCarouselInit();
		if($('.products-carousel').length > 0) productCarouselInit();
		if($('#nectar_fullscreen_rows').length > 0 && $().fullpage) {
			setFPNames();
			initFullPageFooter();
			fullscreenRowLogic();
			initNectarFP();
		}
		flexsliderInit();
		progressBars();
		dividers();
		animated_titles();
		milestoneInit();
		accordionInit();
		tabbedInit();
		tabbbedDeepLinking();
		accordionDeepLinking();
		ulChecks();
		oneFourthClasses();
		carouselfGrabbingClass();
		cascadingImageBGSizing();
		clientsFadeIn();
		fullWidthSections();
		fwsClasses();
		fullwidthImgOnlySizingInit();
		fullwidthImgOnlySizing();
		fullWidthRowPaddingAdjustInit();
		fullWidthRowPaddingAdjustCalc();
		boxRollInit();
		setTimeout(function(){ 
		   colAndImgAnimations();
		},100); 
		if($('body[data-animated-anchors="true"]').length > 0) setTimeout(scrollSpyInit,200);
	    nectar_fancy_ul_init();
		socialSharingInit();
		hotSpotHoverBind();
		pricingTableHeight();
		createTestimonialControls();
		imageWithHotspotClickEvents();
		testimonialSliderHeight(); 
		largeIconHover();
		fullscreenMenuInit();
		boxRollMouseWheelInit();
		midnightInit();
		setTimeout(morphingOutlines,100); 
		responsiveVideoIframesInit();
		responsiveVideoIframes();
		fullWidthContentColumns();
		videoBGInit();
		$window.unbind('scroll.parallaxSections').unbind('resize.parallaxSections');
		parallaxScrollInit();
		masonryBlogInit();
		masonryPortfolioInit();
		portfolioAccentColor();
		portfolioHoverEffects();
		portfolioFiltersInit();
		style6Img();
		isotopeCatSelection();
		$(window).unbind('.infscr');
		infiniteScrollInit();
		toTopBind();
		centerLove();
		postNextButtonEffect();
		if($('.nectar-box-roll').length == 0) headerRowColorInheritInit();
		pageLoadHash();
		slideOutWidgetAreaScrolling();

		//cf7
		if($().wpcf7InitForm) $('div.wpcf7 > form').wpcf7InitForm();

		//woocommerce price slider
		wooPriceSlider();

		//twitter widget 
		if(typeof twttr != 'undefined') { twttr.widgets.load(); }

		//Calendarize.it
		if(typeof init_rhc === 'function') { init_rhc(); }

		//unwrap post and protfolio videos
		$('.video-wrap iframe').unwrap();
		$('#sidebar iframe[src]').unwrap();

		$('video:not(.slider-video)').attr('width','100%');
		$('video:not(.slider-video)').attr('height','100%'); 

		$('.wp-video-shortcode.mejs-container').each(function(){
			$(this).attr('data-aspectRatio', parseInt($(this).css('height')) / parseInt($(this).css('width')));
		});

		//mediaElement
		$('video.wp-media-shortcode-ajax, audio.wp-media-shortcode-ajax').each(function(){ 
			if(!$(this).parent().hasClass('mejs-mediaelement') && $().mediaelementplayer) {
				$(this).mediaelementplayer();  
			}
		});

		$('.mejs-container').css({'height': '100%', 'width': '100%'});
		
		$('audio').attr('width','100%');
		$('audio').attr('height','100%');

		$('audio').css('visibility','visible');

		if($('body').hasClass('mobile')){
			$('video').css('visibility','hidden');
		} else {
			$('video').css('visibility','visible');
		}

		$('.wpb_row:has(".nectar-video-wrap")').each(function(i){
			$(this).css('z-index',100 + i);
		});

		showLateIframes();

		mouseParallaxInit();

		//chrome self hosted slider bg video correct
		 if(navigator.userAgent.indexOf('Chrome') > 0) { 
		 	$('.swiper-wrapper .video-wrap').each(function(i){
			  	var webmSource = jQuery(this).find('video source[type="video/webm"]').attr('src') + "?id="+Math.ceil(Math.random()*10000);
	          	var firstVideo = jQuery(this).find('video').get(0);
	          	firstVideo.src = webmSource;
	          	firstVideo.load();
            });
	    }


		if($('.nectar-video-bg').length > 0) {
			setTimeout(function(){
			    	resizeVideoToCover();
			    	$('.video-color-overlay').each(function(){
			    		$(this).css('background-color',$(this).attr('data-color'));
			    	});
			    	$('.nectar-video-wrap').transition({'opacity':'1'},0);
			    	$('.video-color-overlay').transition({'opacity':'0.7'},0);
			    	
			    },400);
		}

		
		nectarPageHeader();
	

		//if( $('#featured').length > 0){
		//	
		//	customSliderHeight();
		//	homeSliderInit2();
		//	$(window).off('scroll.hsps');
		//	$(window).on('scroll.hsps',homeSliderParallaxScroll);
		//	$(window).off('resize.hsps');
		//	$(window).on('resize.hsps',homeSliderMobile);
			
		//}

		//cart dropdown
		$('#header-outer div.cart-outer').hoverIntent(function(){
			$('#header-outer .widget_shopping_cart').stop(true,true).fadeIn(400);
			$('#header-outer .cart_list').stop(true,true).fadeIn(400);
			clearTimeout(timeout);
			$('#header-outer .cart-notification').fadeOut(300);
		});


		//remove excess loading images now
		$('.portfolio-loading, .nectar-slider-loading .loading-icon').remove();

		setTimeout(portfolioSidebarFollow,250);
		setTimeout(portfolioSidebarFollow,500);
		setTimeout(portfolioSidebarFollow,1000);

		crossBrowserFixes();


		$(window).trigger('resize');

		//fix admin bar
		$("#wpadminbar").show();	


		//close widget area
		if($('#header-outer').hasClass('side-widget-open')) $('.slide-out-widget-area-toggle a').trigger('click'); 

		//fade in page
		setTimeout(function(){ $('#ajax-loading-screen').stop(true,true).fadeOut(500, function(){ $('#ajax-loading-screen .loading-icon').css({'opacity':0}); }); closeSearch();  },200);
		setTimeout(function(){ $('#ajax-loading-screen').stop(true,true).fadeOut(500, function(){ $('#ajax-loading-screen .loading-icon').css({'opacity':0}); }); closeSearch(); },900);
	} 







/*
 * jQuery Textarea Characters Counter Plugin v 2.0
 * Examples and documentation at: http://roy-jin.appspot.com/jsp/textareaCounter.jsp
 * Copyright (c) 2010 Roy Jin
 * Version: 2.0 (11-JUN-2010)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Requires: jQuery v1.4.2 or later
 */
(function($){
	if(!$.fn.textareaCount) { 
		$.fn.textareaCount = function(options, fn) {
	        var defaults = {
				maxCharacterSize: -1,
				originalStyle: 'originalTextareaInfo',
				warningStyle: 'warningTextareaInfo',
				warningNumber: 20,
				displayFormat: '#input characters | #words words'
			};

			var options = $.extend(defaults, options);

			var container = $(this);

			$("<div class='charleft'>&nbsp;</div>").insertAfter(container);


			//create charleft css
			var charLeftCss = {
				'width' : container.width()
			};

			var charLeftInfo = getNextCharLeftInformation(container);
			charLeftInfo.addClass(options.originalStyle);
			//charLeftInfo.css(charLeftCss);


			var numInput = 0;
			var maxCharacters = options.maxCharacterSize;
			var numLeft = 0;
			var numWords = 0;

			container.bind('keyup', function(event){limitTextAreaByCharacterCount();})
					 .bind('mouseover', function(event){setTimeout(function(){limitTextAreaByCharacterCount();}, 10);})
					 .bind('paste', function(event){setTimeout(function(){limitTextAreaByCharacterCount();}, 10);});

	        limitTextAreaByCharacterCount();

			function limitTextAreaByCharacterCount(){
				charLeftInfo.html(countByCharacters());

				//function call back
				if(typeof fn != 'undefined'){
					fn.call(this, getInfo());
				}
				return true;
			}

			function countByCharacters(){
				var content = container.val();
				var contentLength = content.length;
				//Start Cut
				if(options.maxCharacterSize > 0){
					//If copied content is already more than maxCharacterSize, chop it to maxCharacterSize.
					if(contentLength >= options.maxCharacterSize) {
						content = content.substring(0, options.maxCharacterSize);
					}

					var newlineCount = getNewlineCount(content);

					// newlineCount new line character. For windows, it occupies 2 characters
					var systemmaxCharacterSize = options.maxCharacterSize - newlineCount;
					if (!isWin()){
						 systemmaxCharacterSize = options.maxCharacterSize
					}
					if(contentLength > systemmaxCharacterSize){
						//avoid scroll bar moving
						var originalScrollTopPosition = this.scrollTop;
						container.val(content.substring(0, systemmaxCharacterSize));
						this.scrollTop = originalScrollTopPosition;
					}
					charLeftInfo.removeClass(options.warningStyle);
					if(systemmaxCharacterSize - contentLength <= options.warningNumber){
						charLeftInfo.addClass(options.warningStyle);
					}

					numInput = container.val().length + newlineCount;
					if(!isWin()){
						numInput = container.val().length;
					}

					numWords = countWord(getCleanedWordString(container.val()));

					numLeft = maxCharacters - numInput;
				} else {
					//normal count, no cut
					var newlineCount = getNewlineCount(content);
					numInput = container.val().length + newlineCount;
					if(!isWin()){
						numInput = container.val().length;
					}
					numWords = countWord(getCleanedWordString(container.val()));
				}

				return formatDisplayInfo();
			}

			function formatDisplayInfo(){
				var format = options.displayFormat;
				format = format.replace('#input', numInput);
				format = format.replace('#words', numWords);
				//When maxCharacters <= 0, #max, #left cannot be substituted.
				if(maxCharacters > 0){
					format = format.replace('#max', maxCharacters);
					format = format.replace('#left', numLeft);
				}
				return format;
			}

			function getInfo(){
				var info = {
					input: numInput,
					max: maxCharacters,
					left: numLeft,
					words: numWords
				};
				return info;
			}

			function getNextCharLeftInformation(container){
					return container.next('.charleft');
			}

			function isWin(){
				var strOS = navigator.appVersion;
				if (strOS.toLowerCase().indexOf('win') != -1){
					return true;
				}
				return false;
			}

			function getNewlineCount(content){
				var newlineCount = 0;
				for(var i=0; i<content.length;i++){
					if(content.charAt(i) == '\n'){
						newlineCount++;
					}
				}
				return newlineCount;
			}

			function getCleanedWordString(content){
				var fullStr = content + " ";
				var initial_whitespace_rExp = /^[^A-Za-z0-9]+/gi;
				var left_trimmedStr = fullStr.replace(initial_whitespace_rExp, "");
				var non_alphanumerics_rExp = rExp = /[^A-Za-z0-9]+/gi;
				var cleanedStr = left_trimmedStr.replace(non_alphanumerics_rExp, " ");
				var splitString = cleanedStr.split(" ");
				return splitString;
			}

			function countWord(cleanedWordString){
				var word_count = cleanedWordString.length-1;
				return word_count;
			}
		};
	}
})(jQuery);	
	
	
	
	
});


 }(window.jQuery, window, document));


function resizeIframe() {
	var element = document.getElementById("pp_full_res").getElementsByTagName("iframe");
	var height = element[0].contentWindow.document.body.scrollHeight;
    
    //iframe height
    element[0].style.height = height + 'px';
	
	//pp height
	document.getElementsByClassName("pp_content_container")[0].style.height = height+40+ 'px';
	document.getElementsByClassName("pp_content")[0].style.height = height+40+ 'px';
	
}


//don't load if mobile
if(!navigator.userAgent.match(/(Android|iPod|iPhone|iPad|BlackBerry|IEMobile|Opera Mini)/) ){

	
	/*
	panr - v0.0.1 by Robert Bue (@robert_bue)
	*/
	;(function ( $, window, document, undefined ) {
	// Create the defaults once
				
	var pluginName = "panr",
		defaults = {
		sensitivity: 22,
		moveTarget: "parent",
		scale: false,
		scaleOnHover: false,
		scaleTo: 1.1,
		scaleDuration: .28,
		panY: true,
		panX: true,
		panDuration: 0.7,
		resetPanOnMouseLeave: true,
		onEnter: function(){},
		onLeave: function(){}
	};
	// The actual plugin constructor
	function Plugin ( element, options ) {
		this.element = element;
		//console.log(element);
		this.settings = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}
	Plugin.prototype = {
		init: function () {
		if ( Modernizr.touch ) {
			return;
		}
		// call them like so: this.yourOtherFunction(this.element, this.settings).
		//console.log(this.settings);
		var settings = this.settings,
		target = $(this.element),
		w = target.width(),
		targetWidth = target.width() - settings.sensitivity,
		cx = (w-targetWidth)/targetWidth,
		x,
		y,
		panVars,
		xPanVars,
		yPanVars,
		mouseleaveVars;
		//console.log(cx);
		if ( settings.scale || (!settings.scaleOnHover && settings.scale) ) {
			TweenMax.set(target, { scale: settings.scaleTo });
		}
		// If no target provided we'll use the hovered element
		if ( !settings.moveTarget ) {
			settings.moveTarget = $(this.element);
		}
		if ( settings.moveTarget == "parent" ) {
			settings.moveTarget = $(this.element).parent();
		}
		if ( settings.moveTarget == "parent parent" ) {
			settings.moveTarget = $(this.element).parent().parent();
		}
		if ( settings.moveTarget == "parent parent parent" ) {
			settings.moveTarget = $(this.element).parent().parent().parent();
		}
	
		settings.moveTarget.on('mousemove', function(e){
			x = e.pageX - target.offset().left - target.width()/2; // mouse x coordinate relative to the container
			y = e.pageY - target.offset().top - target.height()/2; // mouse x coordinate relative to the container
			if ( settings.panX ) {
				xPanVars = { x: -cx*x };
			}
			if ( settings.panY ) {
				yPanVars = { y: -cx*y };
			}
			panVars = $.extend({}, xPanVars, yPanVars);
	
			// Pan element
			TweenMax.to(target, settings.panDuration, panVars);
		});
		// On mouseover
		settings.moveTarget.on('mouseenter', function(e){
			// Scale up element
			TweenMax.to(target, settings.scaleDuration, { scale: settings.scaleTo });
			settings.onEnter(target);
		});
		if ( !settings.scale || (!settings.scaleOnHover && !settings.scale) ) {
			mouseleaveVars = { scale: 1.005, x: 0, y: 0 };
		} else {
		
		if ( settings.resetPanOnMouseLeave ) {
			mouseleaveVars = { x: 0, y: 0 };
		}
		}
		settings.moveTarget.on('mouseleave', function(e){
		// Reset element
		TweenMax.to(target, .35, mouseleaveVars );
		settings.onLeave(target);
		});
		}
	};
	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[ pluginName ] = function ( options ) {
		return this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
			$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
		}
	  });
	};
	})( jQuery, window, document ); 

}



/*!
 * hoverIntent r7 // 2013.03.11 // jQuery 1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 */
(function(e){e.fn.hoverIntent=function(t,n,r){var i={interval:100,sensitivity:7,timeout:0};if(typeof t==="object"){i=e.extend(i,t)}else if(e.isFunction(n)){i=e.extend(i,{over:t,out:n,selector:r})}else{i=e.extend(i,{over:t,out:t,selector:n})}var s,o,u,a;var f=function(e){s=e.pageX;o=e.pageY};var l=function(t,n){n.hoverIntent_t=clearTimeout(n.hoverIntent_t);if(Math.abs(u-s)+Math.abs(a-o)<i.sensitivity){e(n).off("mousemove.hoverIntent",f);n.hoverIntent_s=1;return i.over.apply(n,[t])}else{u=s;a=o;n.hoverIntent_t=setTimeout(function(){l(t,n)},i.interval)}};var c=function(e,t){t.hoverIntent_t=clearTimeout(t.hoverIntent_t);t.hoverIntent_s=0;return i.out.apply(t,[e])};var h=function(t){var n=jQuery.extend({},t);var r=this;if(r.hoverIntent_t){r.hoverIntent_t=clearTimeout(r.hoverIntent_t)}if(t.type=="mouseenter"){u=n.pageX;a=n.pageY;e(r).on("mousemove.hoverIntent",f);if(r.hoverIntent_s!=1){r.hoverIntent_t=setTimeout(function(){l(n,r)},i.interval)}}else{e(r).off("mousemove.hoverIntent",f);if(r.hoverIntent_s==1){r.hoverIntent_t=setTimeout(function(){c(n,r)},i.timeout)}}};return this.on({"mouseenter.hoverIntent":h,"mouseleave.hoverIntent":h},i.selector)}})(jQuery);/*jshint undef: true */
/*global jQuery: true */

/*
   --------------------------------
   Infinite Scroll
   --------------------------------
   + https://github.com/paulirish/infinite-scroll
   + version 2.0b2.120519
   + Copyright 2011/12 Paul Irish & Luke Shumard
   + Licensed under the MIT license

   + Documentation: http://infinite-scroll.com/
*/

(function (window, $, undefined) {
	"use strict";

    $.infinitescroll = function infscr(options, callback, element) {
        this.element = $(element);

        // Flag the object in the event of a failed creation
        if (!this._create(options, callback)) {
            this.failed = true;
        }
    };

    $.infinitescroll.defaults = {
        loading: {
            finished: undefined,
            finishedMsg: "All items loaded",
			img: "data:image/gif;base64,R0lGODlh3AATAPQeAPDy+MnQ6LW/4N3h8MzT6rjC4sTM5r/I5NHX7N7j8c7U6tvg8OLl8uXo9Ojr9b3G5MfP6Ovu9tPZ7PT1+vX2+tbb7vf4+8/W69jd7rC73vn5/O/x+K243ai02////wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQECgD/ACwAAAAA3AATAAAF/6AnjmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEj0BAScpHLJbDqf0Kh0Sq1ar9isdioItAKGw+MAKYMFhbF63CW438f0mg1R2O8EuXj/aOPtaHx7fn96goR4hmuId4qDdX95c4+RBIGCB4yAjpmQhZN0YGYGXitdZBIVGAsLoq4BBKQDswm1CQRkcG6ytrYKubq8vbfAcMK9v7q7EMO1ycrHvsW6zcTKsczNz8HZw9vG3cjTsMIYqQkCLBwHCgsMDQ4RDAYIqfYSFxDxEfz88/X38Onr16+Bp4ADCco7eC8hQYMAEe57yNCew4IVBU7EGNDiRn8Z831cGLHhSIgdFf9chIeBg7oA7gjaWUWTVQAGE3LqBDCTlc9WOHfm7PkTqNCh54rePDqB6M+lR536hCpUqs2gVZM+xbrTqtGoWqdy1emValeXKzggYBBB5y1acFNZmEvXAoN2cGfJrTv3bl69Ffj2xZt3L1+/fw3XRVw4sGDGcR0fJhxZsF3KtBTThZxZ8mLMgC3fRatCbYMNFCzwLEqLgE4NsDWs/tvqdezZf13Hvk2A9Szdu2X3pg18N+68xXn7rh1c+PLksI/Dhe6cuO3ow3NfV92bdArTqC2Ebd3A8vjf5QWfH6Bg7Nz17c2fj69+fnq+8N2Lty+fuP78/eV2X13neIcCeBRwxorbZrA1ANoCDGrgoG8RTshahQ9iSKEEzUmYIYfNWViUhheCGJyIP5E4oom7WWjgCeBFAJNv1DVV01MAdJhhjdkplWNzO/5oXI846njjVEIqR2OS2B1pE5PVscajkxhMycqLJghQSwT40PgfAl4GqNSXYdZXJn5gSkmmmmJu1aZYb14V51do+pTOCmA40AqVCIhG5IJ9PvYnhIFOxmdqhpaI6GeHCtpooisuutmg+Eg62KOMKuqoTaXgicQWoIYq6qiklmoqFV0UoeqqrLbq6quwxirrrLTWauutJ4QAACH5BAUKABwALAcABADOAAsAAAX/IPd0D2dyRCoUp/k8gpHOKtseR9yiSmGbuBykler9XLAhkbDavXTL5k2oqFqNOxzUZPU5YYZd1XsD72rZpBjbeh52mSNnMSC8lwblKZGwi+0QfIJ8CncnCoCDgoVnBHmKfByGJimPkIwtiAeBkH6ZHJaKmCeVnKKTHIihg5KNq4uoqmEtcRUtEREMBggtEr4QDrjCuRC8h7/BwxENeicSF8DKy82pyNLMOxzWygzFmdvD2L3P0dze4+Xh1Arkyepi7dfFvvTtLQkZBC0T/FX3CRgCMOBHsJ+EHYQY7OinAGECgQsB+Lu3AOK+CewcWjwxQeJBihtNGHSoQOE+iQ3//4XkwBBhRZMcUS6YSXOAwIL8PGqEaSJCiYt9SNoCmnJPAgUVLChdaoFBURN8MAzl2PQphwQLfDFd6lTowglHve6rKpbjhK7/pG5VinZP1qkiz1rl4+tr2LRwWU64cFEihwEtZgbgR1UiHaMVvxpOSwBA37kzGz9e8G+B5MIEKLutOGEsAH2ATQwYfTmuX8aETWdGPZmiZcccNSzeTCA1Sw0bdiitC7LBWgu8jQr8HRzqgpK6gX88QbrB14z/kF+ELpwB8eVQj/JkqdylAudji/+ts3039vEEfK8Vz2dlvxZKG0CmbkKDBvllRd6fCzDvBLKBDSCeffhRJEFebFk1k/Mv9jVIoIJZSeBggwUaNeB+Qk34IE0cXlihcfRxkOAJFFhwGmKlmWDiakZhUJtnLBpnWWcnKaAZcxI0piFGGLBm1mc90kajSCveeBVWKeYEoU2wqeaQi0PetoE+rr14EpVC7oAbAUHqhYExbn2XHHsVqbcVew9tx8+XJKk5AZsqqdlddGpqAKdbAYBn1pcczmSTdWvdmZ17c1b3FZ99vnTdCRFM8OEcAhLwm1NdXnWcBBSMRWmfkWZqVlsmLIiAp/o1gGV2vpS4lalGYsUOqXrddcKCmK61aZ8SjEpUpVFVoCpTj4r661Km7kBHjrDyc1RAIQAAIfkEBQoAGwAsBwAEAM4ACwAABf/gtmUCd4goQQgFKj6PYKi0yrrbc8i4ohQt12EHcal+MNSQiCP8gigdz7iCioaCIvUmZLp8QBzW0EN2vSlCuDtFKaq4RyHzQLEKZNdiQDhRDVooCwkbfm59EAmKi4SGIm+AjIsKjhsqB4mSjT2IOIOUnICeCaB/mZKFNTSRmqVpmJqklSqskq6PfYYCDwYHDC4REQwGCBLGxxIQDsHMwhAIX8bKzcENgSLGF9PU1j3Sy9zX2NrgzQziChLk1BHWxcjf7N046tvN82715czn9Pryz6Ilc4ACj4EBOCZM8KEnAYYADBRKnACAYUMFv1wotIhCEcaJCisqwJFgAUSQGyX/kCSVUUTIdKMwJlyo0oXHlhskwrTJciZHEXsgaqS4s6PJiCAr1uzYU8kBBSgnWFqpoMJMUjGtDmUwkmfVmVypakWhEKvXsS4nhLW5wNjVroJIoc05wSzTr0PtiigpYe4EC2vj4iWrFu5euWIMRBhacaVJhYQBEFjA9jHjyQ0xEABwGceGAZYjY0YBOrRLCxUp29QM+bRkx5s7ZyYgVbTqwwti2ybJ+vLtDYpycyZbYOlptxdx0kV+V7lC5iJAyyRrwYKxAdiz82ng0/jnAdMJFz0cPi104Ec1Vj9/M6F173vKL/feXv156dw11tlqeMMnv4V5Ap53GmjQQH97nFfg+IFiucfgRX5Z8KAgbUlQ4IULIlghhhdOSB6AgX0IVn8eReghen3NRIBsRgnH4l4LuEidZBjwRpt6NM5WGwoW0KSjCwX6yJSMab2GwwAPDXfaBCtWpluRTQqC5JM5oUZAjUNS+VeOLWpJEQ7VYQANW0INJSZVDFSnZphjSikfmzE5N4EEbQI1QJmnWXCmHulRp2edwDXF43txukenJwvI9xyg9Q26Z3MzGUcBYFEChZh6DVTq34AU8Iflh51Sd+CnKFYQ6mmZkhqfBKfSxZWqA9DZanWjxmhrWwi0qtCrt/43K6WqVjjpmhIqgEGvculaGKklKstAACEAACH5BAUKABwALAcABADOAAsAAAX/ICdyQmaMYyAUqPgIBiHPxNpy79kqRXH8wAPsRmDdXpAWgWdEIYm2llCHqjVHU+jjJkwqBTecwItShMXkEfNWSh8e1NGAcLgpDGlRgk7EJ/6Ae3VKfoF/fDuFhohVeDeCfXkcCQqDVQcQhn+VNDOYmpSWaoqBlUSfmowjEA+iEAEGDRGztAwGCDcXEA60tXEiCrq8vREMEBLIyRLCxMWSHMzExnbRvQ2Sy7vN0zvVtNfU2tLY3rPgLdnDvca4VQS/Cpk3ABwSLQkYAQwT/P309vcI7OvXr94jBQMJ/nskkGA/BQBRLNDncAIAiDcG6LsxAWOLiQzmeURBKWSLCQbv/1F0eDGinJUKR47YY1IEgQASKk7Yc7ACRwZm7mHweRJoz59BJUogisKCUaFMR0x4SlJBVBFTk8pZivTR0K73rN5wqlXEAq5Fy3IYgHbEzQ0nLy4QSoCjXLoom96VOJEeCosK5n4kkFfqXjl94wa+l1gvAcGICbewAOAxY8l/Ky/QhAGz4cUkGxu2HNozhwMGBnCUqUdBg9UuW9eUynqSwLHIBujePef1ZGQZXcM+OFuEBeBhi3OYgLyqcuaxbT9vLkf4SeqyWxSQpKGB2gQpm1KdWbu72rPRzR9Ne2Nu9Kzr/1Jqj0yD/fvqP4aXOt5sW/5qsXXVcv1Nsp8IBUAmgswGF3llGgeU1YVXXKTN1FlhWFXW3gIE+DVChApysACHHo7Q4A35lLichh+ROBmLKAzgYmYEYDAhCgxKGOOMn4WR4kkDaoBBOxJtdNKQxFmg5JIWIBnQc07GaORfUY4AEkdV6jHlCEISSZ5yTXpp1pbGZbkWmcuZmQCaE6iJ0FhjMaDjTMsgZaNEHFRAQVp3bqXnZED1qYcECOz5V6BhSWCoVJQIKuKQi2KFKEkEFAqoAo7uYSmO3jk61wUUMKmknJ4SGimBmAa0qVQBhAAAIfkEBQoAGwAsBwAEAM4ACwAABf/gJm5FmRlEqhJC+bywgK5pO4rHI0D3pii22+Mg6/0Ej96weCMAk7cDkXf7lZTTnrMl7eaYoy10JN0ZFdco0XAuvKI6qkgVFJXYNwjkIBcNBgR8TQoGfRsJCRuCYYQQiI+ICosiCoGOkIiKfSl8mJkHZ4U9kZMbKaI3pKGXmJKrngmug4WwkhA0lrCBWgYFCCMQFwoQDRHGxwwGCBLMzRLEx8iGzMMO0cYNeCMKzBDW19lnF9DXDIY/48Xg093f0Q3s1dcR8OLe8+Y91OTv5wrj7o7B+7VNQqABIoRVCMBggsOHE36kSoCBIcSH3EbFangxogJYFi8CkJhqQciLJEf/LDDJEeJIBT0GsOwYUYJGBS0fjpQAMidGmyVP6sx4Y6VQhzs9VUwkwqaCCh0tmKoFtSMDmBOf9phg4SrVrROuasRQAaxXpVUhdsU6IsECZlvX3kwLUWzRt0BHOLTbNlbZG3vZinArge5Dvn7wbqtQkSYAAgtKmnSsYKVKo2AfW048uaPmG386i4Q8EQMBAIAnfB7xBxBqvapJ9zX9WgRS2YMpnvYMGdPK3aMjt/3dUcNI4blpj7iwkMFWDXDvSmgAlijrt9RTR78+PS6z1uAJZIe93Q8g5zcsWCi/4Y+C8bah5zUv3vv89uft30QP23punGCx5954oBBwnwYaNCDY/wYrsYeggnM9B2Fpf8GG2CEUVWhbWAtGouEGDy7Y4IEJVrbSiXghqGKIo7z1IVcXIkKWWR361QOLWWnIhwERpLaaCCee5iMBGJQmJGyPFTnbkfHVZGRtIGrg5HALEJAZbu39BuUEUmq1JJQIPtZilY5hGeSWsSk52G9XqsmgljdIcABytq13HyIM6RcUA+r1qZ4EBF3WHWB29tBgAzRhEGhig8KmqKFv8SeCeo+mgsF7YFXa1qWSbkDpom/mqR1PmHCqJ3fwNRVXjC7S6CZhFVCQ2lWvZiirhQq42SACt25IK2hv8TprriUV1usGgeka7LFcNmCldMLi6qZMgFLgpw16Cipb7bC1knXsBiEAACH5BAUKABsALAcABADOAAsAAAX/4FZsJPkUmUGsLCEUTywXglFuSg7fW1xAvNWLF6sFFcPb42C8EZCj24EJdCp2yoegWsolS0Uu6fmamg8n8YYcLU2bXSiRaXMGvqV6/KAeJAh8VgZqCX+BexCFioWAYgqNi4qAR4ORhRuHY408jAeUhAmYYiuVlpiflqGZa5CWkzc5fKmbbhIpsAoQDRG8vQwQCBLCwxK6vb5qwhfGxxENahvCEA7NzskSy7vNzzzK09W/PNHF1NvX2dXcN8K55cfh69Luveol3vO8zwi4Yhj+AQwmCBw4IYclDAAJDlQggVOChAoLKkgFkSCAHDwWLKhIEOONARsDKryogFPIiAUb/95gJNIiw4wnI778GFPhzBKFOAq8qLJEhQpiNArjMcHCmlTCUDIouTKBhApELSxFWiGiVKY4E2CAekPgUphDu0742nRrVLJZnyrFSqKQ2ohoSYAMW6IoDpNJ4bLdILTnAj8KUF7UeENjAKuDyxIgOuGiOI0EBBMgLNew5AUrDTMGsFixwBIaNCQuAXJB57qNJ2OWm2Aj4skwCQCIyNkhhtMkdsIuodE0AN4LJDRgfLPtn5YDLdBlraAByuUbBgxQwICxMOnYpVOPej074OFdlfc0TqC62OIbcppHjV4o+LrieWhfT8JC/I/T6W8oCl29vQ0XjLdBaA3s1RcPBO7lFvpX8BVoG4O5jTXRQRDuJ6FDTzEWF1/BCZhgbyAKE9qICYLloQYOFtahVRsWYlZ4KQJHlwHS/IYaZ6sZd9tmu5HQm2xi1UaTbzxYwJk/wBF5g5EEYOBZeEfGZmNdFyFZmZIR4jikbLThlh5kUUVJGmRT7sekkziRWUIACABk3T4qCsedgO4xhgGcY7q5pHJ4klBBTQRJ0CeHcoYHHUh6wgfdn9uJdSdMiebGJ0zUPTcoS286FCkrZxnYoYYKWLkBowhQoBeaOlZAgVhLidrXqg2GiqpQpZ4apwSwRtjqrB3muoF9BboaXKmshlqWqsWiGt2wphJkQbAU5hoCACH5BAUKABsALAcABADOAAsAAAX/oGFw2WZuT5oZROsSQnGaKjRvilI893MItlNOJ5v5gDcFrHhKIWcEYu/xFEqNv6B1N62aclysF7fsZYe5aOx2yL5aAUGSaT1oTYMBwQ5VGCAJgYIJCnx1gIOBhXdwiIl7d0p2iYGQUAQBjoOFSQR/lIQHnZ+Ue6OagqYzSqSJi5eTpTxGcjcSChANEbu8DBAIEsHBChe5vL13G7fFuscRDcnKuM3H0La3EA7Oz8kKEsXazr7Cw9/Gztar5uHHvte47MjktznZ2w0G1+D3BgirAqJmJMAQgMGEgwgn5Ei0gKDBhBMALGRYEOJBb5QcWlQo4cbAihZz3GgIMqFEBSM1/4ZEOWPAgpIIJXYU+PIhRG8ja1qU6VHlzZknJNQ6UanCjQkWCIGSUGEjAwVLjc44+DTqUQtPPS5gejUrTa5TJ3g9sWCr1BNUWZI161StiQUDmLYdGfesibQ3XMq1OPYthrwuA2yU2LBs2cBHIypYQPPlYAKFD5cVvNPtW8eVGbdcQADATsiNO4cFAPkvHpedPzc8kUcPgNGgZ5RNDZG05reoE9s2vSEP79MEGiQGy1qP8LA4ZcdtsJE48ONoLTBtTV0B9LsTnPceoIDBDQvS7W7vfjVY3q3eZ4A339J4eaAmKqU/sV58HvJh2RcnIBsDUw0ABqhBA5aV5V9XUFGiHfVeAiWwoFgJJrIXRH1tEMiDFV4oHoAEGlaWhgIGSGBO2nFomYY3mKjVglidaNYJGJDkWW2xxTfbjCbVaOGNqoX2GloR8ZeTaECS9pthRGJH2g0b3Agbk6hNANtteHD2GJUucfajCQBy5OOTQ25ZgUPvaVVQmbKh9510/qQpwXx3SQdfk8tZJOd5b6JJFplT3ZnmmX3qd5l1eg5q00HrtUkUn0AKaiGjClSAgKLYZcgWXwocGRcCFGCKwSB6ceqphwmYRUFYT/1WKlOdUpipmxW0mlCqHjYkAaeoZlqrqZ4qd+upQKaapn/AmgAegZ8KUtYtFAQQAgAh+QQFCgAbACwHAAQAzgALAAAF/+C2PUcmiCiZGUTrEkKBis8jQEquKwU5HyXIbEPgyX7BYa5wTNmEMwWsSXsqFbEh8DYs9mrgGjdK6GkPY5GOeU6ryz7UFopSQEzygOGhJBjoIgMDBAcBM0V/CYqLCQqFOwobiYyKjn2TlI6GKC2YjJZknouaZAcQlJUHl6eooJwKooobqoewrJSEmyKdt59NhRKFMxLEEA4RyMkMEAjDEhfGycqAG8TQx9IRDRDE3d3R2ctD1RLg0ttKEnbY5wZD3+zJ6M7X2RHi9Oby7u/r9g38UFjTh2xZJBEBMDAboogAgwkQI07IMUORwocSJwCgWDFBAIwZOaJIsOBjRogKJP8wTODw5ESVHVtm3AhzpEeQElOuNDlTZ0ycEUWKWFASqEahGwYUPbnxoAgEdlYSqDBkgoUNClAlIHbSAoOsqCRQnQHxq1axVb06FWFxLIqyaze0Tft1JVqyE+pWXMD1pF6bYl3+HTqAWNW8cRUFzmih0ZAAB2oGKukSAAGGRHWJgLiR6AylBLpuHKKUMlMCngMpDSAa9QIUggZVVvDaJobLeC3XZpvgNgCmtPcuwP3WgmXSq4do0DC6o2/guzcseECtUoO0hmcsGKDgOt7ssBd07wqesAIGZC1YIBa7PQHvb1+SFo+++HrJSQfB33xfav3i5eX3Hnb4CTJgegEq8tH/YQEOcIJzbm2G2EoYRLgBXFpVmFYDcREV4HIcnmUhiGBRouEMJGJGzHIspqgdXxK0yCKHRNXoIX4uorCdTyjkyNtdPWrA4Up82EbAbzMRxxZRR54WXVLDIRmRcag5d2R6ugl3ZXzNhTecchpMhIGVAKAYpgJjjsSklBEd99maZoo535ZvdamjBEpusJyctg3h4X8XqodBMx0tiNeg/oGJaKGABpogS40KSqiaEgBqlQWLUtqoVQnytekEjzo0hHqhRorppOZt2p923M2AAV+oBtpAnnPNoB6HaU6mAAIU+IXmi3j2mtFXuUoHKwXpzVrsjcgGOauKEjQrwq157hitGq2NoWmjh7z6Wmxb0m5w66+2VRAuXN/yFUAIACH5BAUKABsALAcABADOAAsAAAX/4CZuRiaM45MZqBgIRbs9AqTcuFLE7VHLOh7KB5ERdjJaEaU4ClO/lgKWjKKcMiJQ8KgumcieVdQMD8cbBeuAkkC6LYLhOxoQ2PF5Ys9PKPBMen17f0CCg4VSh32JV4t8jSNqEIOEgJKPlkYBlJWRInKdiJdkmQlvKAsLBxdABA4RsbIMBggtEhcQsLKxDBC2TAS6vLENdJLDxMZAubu8vjIbzcQRtMzJz79S08oQEt/guNiyy7fcvMbh4OezdAvGrakLAQwyABsELQkY9BP+//ckyPDD4J9BfAMh1GsBoImMeQUN+lMgUJ9CiRMa5msxoB9Gh/o8GmxYMZXIgxtR/yQ46S/gQAURR0pDwYDfywoyLPip5AdnCwsMFPBU4BPFhKBDi444quCmDKZOfwZ9KEGpCKgcN1jdALSpPqIYsabS+nSqvqplvYqQYAeDPgwKwjaMtiDl0oaqUAyo+3TuWwUAMPpVCfee0cEjVBGQq2ABx7oTWmQk4FglZMGN9fGVDMCuiH2AOVOu/PmyxM630gwM0CCn6q8LjVJ8GXvpa5Uwn95OTC/nNxkda1/dLSK475IjCD6dHbK1ZOa4hXP9DXs5chJ00UpVm5xo2qRpoxptwF2E4/IbJpB/SDz9+q9b1aNfQH08+p4a8uvX8B53fLP+ycAfemjsRUBgp1H20K+BghHgVgt1GXZXZpZ5lt4ECjxYR4ScUWiShEtZqBiIInRGWnERNnjiBglw+JyGnxUmGowsyiiZg189lNtPGACjV2+S9UjbU0JWF6SPvEk3QZEqsZYTk3UAaRSUnznJI5LmESCdBVSyaOWUWLK4I5gDUYVeV1T9l+FZClCAUVA09uSmRHBCKAECFEhW51ht6rnmWBXkaR+NjuHpJ40D3DmnQXt2F+ihZxlqVKOfQRACACH5BAUKABwALAcABADOAAsAAAX/ICdyUCkUo/g8mUG8MCGkKgspeC6j6XEIEBpBUeCNfECaglBcOVfJFK7YQwZHQ6JRZBUqTrSuVEuD3nI45pYjFuWKvjjSkCoRaBUMWxkwBGgJCXspQ36Bh4EEB0oKhoiBgyNLjo8Ki4QElIiWfJqHnISNEI+Ql5J9o6SgkqKkgqYihamPkW6oNBgSfiMMDQkGCBLCwxIQDhHIyQwQCGMKxsnKVyPCF9DREQ3MxMPX0cu4wt7J2uHWx9jlKd3o39MiuefYEcvNkuLt5O8c1ePI2tyELXGQwoGDAQf+iEC2xByDCRAjTlAgIUWCBRgCPJQ4AQBFXAs0coT40WLIjRxL/47AcHLkxIomRXL0CHPERZkpa4q4iVKiyp0tR/7kwHMkTUBBJR5dOCEBAVcKKtCAyOHpowXCpk7goABqBZdcvWploACpBKkpIJI1q5OD2rIWE0R1uTZu1LFwbWL9OlKuWb4c6+o9i3dEgw0RCGDUG9KlRw56gDY2qmCByZBaASi+TACA0TucAaTteCcy0ZuOK3N2vJlx58+LRQyY3Xm0ZsgjZg+oPQLi7dUcNXi0LOJw1pgNtB7XG6CBy+U75SYfPTSQAgZTNUDnQHt67wnbZyvwLgKiMN3oCZB3C76tdewpLFgIP2C88rbi4Y+QT3+8S5USMICZXWj1pkEDeUU3lOYGB3alSoEiMIjgX4WlgNF2EibIwQIXauWXSRg2SAOHIU5IIIMoZkhhWiJaiFVbKo6AQEgQXrTAazO1JhkBrBG3Y2Y6EsUhaGn95hprSN0oWpFE7rhkeaQBchGOEWnwEmc0uKWZj0LeuNV3W4Y2lZHFlQCSRjTIl8uZ+kG5HU/3sRlnTG2ytyadytnD3HrmuRcSn+0h1dycexIK1KCjYaCnjCCVqOFFJTZ5GkUUjESWaUIKU2lgCmAKKQIUjHapXRKE+t2og1VgankNYnohqKJ2CmKplso6GKz7WYCgqxeuyoF8u9IQAgA7",
            msg: null,
            msgText: "",
            selector: null,
            speed: 'fast',
            start: undefined
        },
        state: {
            isDuringAjax: false,
            isInvalidPage: false,
            isDestroyed: false,
            isDone: false, // For when it goes all the way through the archive.
            isPaused: false,
            currPage: 1
        },
        debug: false,
		behavior: undefined,
        binder: $(window), // used to cache the selector
        nextSelector: "div#pagination a:first",
        navSelector: "div#pagination",
        contentSelector: null, // rename to pageFragment
        extraScrollPx: 150,
        itemSelector: ".post",
        animate: false,
        pathParse: undefined,
        dataType: 'html',
        appendCallback: true,
        bufferPx: 40,
        errorCallback: function () { },
        infid: 0, //Instance ID
        pixelsFromNavToBottom: undefined,
        path: undefined, // Either parts of a URL as an array (e.g. ["/page/", "/"] or a function that takes in the page number and returns a URL
		prefill: false, // When the document is smaller than the window, load data until the document is larger or links are exhausted
        maxPage: undefined // to manually control maximum page (when maxPage is undefined, maximum page limitation is not work)
	};

    $.infinitescroll.prototype = {

        /*	
            ----------------------------
            Private methods
            ----------------------------
            */

        // Bind or unbind from scroll
        _binding: function infscr_binding(binding) {

            var instance = this,
            opts = instance.options;

            opts.v = '2.0b2.120520';

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_binding_'+opts.behavior] !== undefined) {
                this['_binding_'+opts.behavior].call(this);
                return;
            }

            if (binding !== 'bind' && binding !== 'unbind') {
                this._debug('Binding value  ' + binding + ' not valid');
                return false;
            }

            if (binding === 'unbind') {
                (this.options.binder).unbind('smartscroll.infscr.' + instance.options.infid);
            } else {
                (this.options.binder)[binding]('smartscroll.infscr.' + instance.options.infid, function () {
                    instance.scroll();
                });
            }

            this._debug('Binding', binding);
        },

        // Fundamental aspects of the plugin are initialized
        _create: function infscr_create(options, callback) {

            // Add custom options to defaults
            var opts = $.extend(true, {}, $.infinitescroll.defaults, options);
			this.options = opts;
			var $window = $(window);
			var instance = this;

			// Validate selectors
            if (!instance._validate(options)) {
				return false;
			}

            // Validate page fragment path
            var path = $(opts.nextSelector).attr('href');
            if (!path) {
                this._debug('Navigation selector not found');
                return false;
            }

            // Set the path to be a relative URL from root.
            opts.path = opts.path || this._determinepath(path);

            // contentSelector is 'page fragment' option for .load() / .ajax() calls
            opts.contentSelector = opts.contentSelector || this.element;

            // loading.selector - if we want to place the load message in a specific selector, defaulted to the contentSelector
            opts.loading.selector = opts.loading.selector || opts.contentSelector;

            var ascend_loader = ($('body').hasClass('ascend')) ? '<span class="default-loading-icon spin"></span>' : '';
            var ascend_loader_class = ($('body').hasClass('ascend')) ? 'default_loader ' : '';

            // Define loading.msg
            opts.loading.msg = opts.loading.msg || $('<div class="infscr-loading-wrap"><div id="infscr-loading" class='+ascend_loader_class+'><img alt="Loading..." src="' + opts.loading.img + '" /> '+ascend_loader+' <div>' + opts.loading.msgText + '</div></div></div>');

            // Preload loading.img
            (new Image()).src = opts.loading.img;

            // distance from nav links to bottom
            // computed as: height of the document + top offset of container - top offset of nav link
            if(opts.pixelsFromNavToBottom === undefined) {
				opts.pixelsFromNavToBottom = $(document).height() - $(opts.navSelector).offset().top;
			}

			var self = this;

            // determine loading.start actions
            if($('#post-area.infinite_scroll').length > 0) { 
                if($('#post-area.infinite_scroll.span_9').length > 0) {
                    var $locationToAppend = '#sidebar';
                } else {
                    var $locationToAppend = '#post-area.infinite_scroll';
                }
            } else { 
                var $locationToAppend = '.portfolio-items.infinite_scroll';
            }
            opts.loading.start = opts.loading.start || function() {
                $(opts.navSelector).hide();
                opts.loading.msg
                .insertAfter($locationToAppend)
                .show(0, $.proxy(function() {
					this.beginAjax(opts);
				}, self)).transition({ scale: 1, 'opacity':1,'height':60,'padding-top':35, 'padding-bottom':35 },400,'easeOutCubic');
            };

            // determine loading.finished actions
            opts.loading.finished = opts.loading.finished || function() {
                opts.loading.msg.stop().transition({ scale: 0.5, 'opacity':0 },400,'easeOutCubic');
            };

			// callback loading
            opts.callback = function(instance, data, url) {
                if (!!opts.behavior && instance['_callback_'+opts.behavior] !== undefined) {
                    instance['_callback_'+opts.behavior].call($(opts.contentSelector)[0], data, url);
                }

                if (callback) {
                    callback.call($(opts.contentSelector)[0], data, opts, url);
                }

				if (opts.prefill) {
					$window.bind("resize.infinite-scroll", instance._prefill);
				}
            };

			if (options.debug) {
				// Tell IE9 to use its built-in console
				if (Function.prototype.bind && (typeof console === 'object' || typeof console === 'function') && typeof console.log === "object") {
					["log","info","warn","error","assert","dir","clear","profile","profileEnd"]
						.forEach(function (method) {
							console[method] = this.call(console[method], console);
						}, Function.prototype.bind);
				}
			}

            this._setup();

			// Setups the prefill method for use
			if (opts.prefill) {
				this._prefill();
			}
			
			
			$('.portfolio-wrap, #post-area.masonry').css('margin-bottom',0);

            // Return true to indicate successful creation
            return true;
        },

		_prefill: function infscr_prefill() {
			var instance = this;
			var $document = $(document);
			var $window = $(window);

			function needsPrefill() {
				return ($document.height() <= $window.height());
			}

			this._prefill = function() {
				if (needsPrefill()) {
					instance.scroll();
				}

				$window.bind("resize.infinite-scroll", function() {
					if (needsPrefill()) {
						$window.unbind("resize.infinite-scroll");
						instance.scroll();
					}
				});
			};

			// Call self after setting up the new function
			this._prefill();
		},

        // Console log wrapper
        _debug: function infscr_debug() {
			if (true !== this.options.debug) {
				return;
			}

			if (typeof console !== 'undefined' && typeof console.log === 'function') {
				// Modern browsers
				// Single argument, which is a string
				if ((Array.prototype.slice.call(arguments)).length === 1 && typeof Array.prototype.slice.call(arguments)[0] === 'string') {
					console.log( (Array.prototype.slice.call(arguments)).toString() );
				} else {
					console.log( Array.prototype.slice.call(arguments) );
				}
			} else if (!Function.prototype.bind && typeof console !== 'undefined' && typeof console.log === 'object') {
				// IE8
				Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));
			}
        },

        // find the number to increment in the path.
        _determinepath: function infscr_determinepath(path) {

            var opts = this.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_determinepath_'+opts.behavior] !== undefined) {
                return this['_determinepath_'+opts.behavior].call(this,path);
            }

            if (!!opts.pathParse) {

                this._debug('pathParse manual');
                return opts.pathParse(path, this.options.state.currPage+1);

            } else if (path.match(/^(.*?)\b2\b(.*?$)/)) {
                path = path.match(/^(.*?)\b2\b(.*?$)/).slice(1);

                // if there is any 2 in the url at all.    
            } else if (path.match(/^(.*?)2(.*?$)/)) {

                // page= is used in django:
                // http://www.infinite-scroll.com/changelog/comment-page-1/#comment-127
                if (path.match(/^(.*?page=)2(\/.*|$)/)) {
                    path = path.match(/^(.*?page=)2(\/.*|$)/).slice(1);
                    return path;
                }

                path = path.match(/^(.*?)2(.*?$)/).slice(1);

            } else {

                // page= is used in drupal too but second page is page=1 not page=2:
                // thx Jerod Fritz, vladikoff
                if (path.match(/^(.*?page=)1(\/.*|$)/)) {
                    path = path.match(/^(.*?page=)1(\/.*|$)/).slice(1);
                    return path;
                } else {
                    this._debug('Sorry, we couldn\'t parse your Next (Previous Posts) URL. Verify your the css selector points to the correct A tag. If you still get this error: yell, scream, and kindly ask for help at infinite-scroll.com.');
                    // Get rid of isInvalidPage to allow permalink to state
                    opts.state.isInvalidPage = true;  //prevent it from running on this page.
                }
            }
            this._debug('determinePath', path);
            return path;

        },

        // Custom error
        _error: function infscr_error(xhr) {

            var opts = this.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_error_'+opts.behavior] !== undefined) {
                this['_error_'+opts.behavior].call(this,xhr);
                return;
            }

            if (xhr !== 'destroy' && xhr !== 'end') {
                xhr = 'unknown';
            }

            this._debug('Error', xhr);

            if (xhr === 'end') {
                this._showdonemsg();
            }

            opts.state.isDone = true;
            opts.state.currPage = 1; // if you need to go back to this instance
            opts.state.isPaused = false;
            this._binding('unbind');

        },

        // Load Callback
        _loadcallback: function infscr_loadcallback(box, data, url) {
            var opts = this.options,
            callback = this.options.callback, // GLOBAL OBJECT FOR CALLBACK
            result = (opts.state.isDone) ? 'done' : (!opts.appendCallback) ? 'no-append' : 'append',
            frag;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_loadcallback_'+opts.behavior] !== undefined) {
                this['_loadcallback_'+opts.behavior].call(this,box,data);
                return;
            }

			switch (result) {
				case 'done':
					this._showdonemsg();
					return false;

				case 'no-append':
					if (opts.dataType === 'html') {
						data = '<div>' + data + '</div>';
						data = $(data).find(opts.itemSelector);
					}
					break;

				case 'append':
					var children = box.children();
					// if it didn't return anything
					if (children.length === 0) {
						return this._error('end');
					}

					// use a documentFragment because it works when content is going into a table or UL
					frag = document.createDocumentFragment();
					while (box[0].firstChild) {
						frag.appendChild(box[0].firstChild);
					}

					this._debug('contentSelector', $(opts.contentSelector)[0]);
					$(opts.contentSelector)[0].appendChild(frag);
					// previously, we would pass in the new DOM element as context for the callback
					// however we're now using a documentfragment, which doesn't have parents or children,
					// so the context is the contentContainer guy, and we pass in an array
					// of the elements collected as the first argument.

					data = children.get();
					break;
			}

            // loadingEnd function
            opts.loading.finished.call($(opts.contentSelector)[0],opts);

            // smooth scroll to ease in the new content
            if (opts.animate) {
                var scrollTo = $(window).scrollTop() + $('#infscr-loading').height() + opts.extraScrollPx + 'px';
                $('html,body').animate({ scrollTop: scrollTo }, 800, function () { opts.state.isDuringAjax = false; });
            }

            if (!opts.animate) {
				// once the call is done, we can allow it again.
				opts.state.isDuringAjax = false;
			}

            callback(this, data, url);

			if (opts.prefill) {
				this._prefill();
			}
		},

        _nearbottom: function infscr_nearbottom() {

            var opts = this.options,
            pixelsFromWindowBottomToBottom = 0 + $(document).height() - (opts.binder.scrollTop()) - $(window).height();

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_nearbottom_'+opts.behavior] !== undefined) {
                return this['_nearbottom_'+opts.behavior].call(this);
            }

            this._debug('math:', pixelsFromWindowBottomToBottom, opts.pixelsFromNavToBottom);

            // if distance remaining in the scroll (including buffer) is less than the orignal nav to bottom....
            return (pixelsFromWindowBottomToBottom - opts.bufferPx < opts.pixelsFromNavToBottom);

        },

        // Pause / temporarily disable plugin from firing
        _pausing: function infscr_pausing(pause) {

            var opts = this.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_pausing_'+opts.behavior] !== undefined) {
                this['_pausing_'+opts.behavior].call(this,pause);
                return;
            }

            // If pause is not 'pause' or 'resume', toggle it's value
            if (pause !== 'pause' && pause !== 'resume' && pause !== null) {
                this._debug('Invalid argument. Toggling pause value instead');
            }

            pause = (pause && (pause === 'pause' || pause === 'resume')) ? pause : 'toggle';

            switch (pause) {
                case 'pause':
                    opts.state.isPaused = true;
                break;

                case 'resume':
                    opts.state.isPaused = false;
                break;

                case 'toggle':
                    opts.state.isPaused = !opts.state.isPaused;
                break;
            }

            this._debug('Paused', opts.state.isPaused);
            return false;

        },

        // Behavior is determined
        // If the behavior option is undefined, it will set to default and bind to scroll
        _setup: function infscr_setup() {

            var opts = this.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_setup_'+opts.behavior] !== undefined) {
                this['_setup_'+opts.behavior].call(this);
                return;
            }

            this._binding('bind');

            return false;

        },

        // Show done message
        _showdonemsg: function infscr_showdonemsg() {

            var opts = this.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_showdonemsg_'+opts.behavior] !== undefined) {
                this['_showdonemsg_'+opts.behavior].call(this);
                return;
            }
			
			 
            opts.loading.msg
            .find('img, .default-loading-icon')
            .hide()
            .parent()
            .find('div').html($('#pagination').attr('data-is-text')).animate({ opacity: 1 }, 500, function () {
                $(this).parent().delay(2100).transition({ scale: 0.4, 'opacity':0 },500,'easeOutCubic');
                $(this).parent().parent().delay(2100).animate({'height':'0', 'padding':0},500,'easeOutCubic');
            });
       
            
            opts.loading.msg.find('#infscr-loading').css({'height':'auto', 'width' : 'auto', 'padding' : '13px 17px' ,'background-image' : 'none', 'border-width' : '2px'})

            // user provided callback when done    
            opts.errorCallback.call($(opts.contentSelector)[0],'done');
        },

        // grab each selector option and see if any fail
        _validate: function infscr_validate(opts) {
            for (var key in opts) {
                if (key.indexOf && key.indexOf('Selector') > -1 && $(opts[key]).length === 0) {
                    this._debug('Your ' + key + ' found no elements.');
                    return false;
                }
            }

            return true;
        },

        /*	
            ----------------------------
            Public methods
            ----------------------------
            */

        // Bind to scroll
        bind: function infscr_bind() {
            this._binding('bind');
        },

        // Destroy current instance of plugin
        destroy: function infscr_destroy() {
            this.options.state.isDestroyed = true;
			this.options.loading.finished();
            return this._error('destroy');
        },

        // Set pause value to false
        pause: function infscr_pause() {
            this._pausing('pause');
        },

        // Set pause value to false
        resume: function infscr_resume() {
            this._pausing('resume');
        },

		beginAjax: function infscr_ajax(opts) {
			var instance = this,
				path = opts.path,
				box, desturl, method, condition;

			// increment the URL bit. e.g. /page/3/
			opts.state.currPage++;

            // Manually control maximum page 
            if ( opts.maxPage != undefined && opts.state.currPage > opts.maxPage ){
                this.destroy();
                return;
            }

			// if we're dealing with a table we can't use DIVs
			box = $(opts.contentSelector).is('table') ? $('<tbody/>') : $('<div/>');

			desturl = (typeof path === 'function') ? path(opts.state.currPage) : path.join(opts.state.currPage);
			instance._debug('heading into ajax', desturl);

			method = (opts.dataType === 'html' || opts.dataType === 'json' ) ? opts.dataType : 'html+callback';
			if (opts.appendCallback && opts.dataType === 'html') {
				method += '+callback';
			}

			switch (method) {
				case 'html+callback':
					instance._debug('Using HTML via .load() method');
					box.load(desturl + ' ' + opts.itemSelector, undefined, function infscr_ajax_callback(responseText) {
						instance._loadcallback(box, responseText, desturl);
					});

					break;

				case 'html':
					instance._debug('Using ' + (method.toUpperCase()) + ' via $.ajax() method');
					$.ajax({
						// params
						url: desturl,
						dataType: opts.dataType,
						complete: function infscr_ajax_callback(jqXHR, textStatus) {
							condition = (typeof (jqXHR.isResolved) !== 'undefined') ? (jqXHR.isResolved()) : (textStatus === "success" || textStatus === "notmodified");
							if (condition) {
								instance._loadcallback(box, jqXHR.responseText, desturl);
							} else {
								instance._error('end');
							}
						}
					});

					break;
				case 'json':
					instance._debug('Using ' + (method.toUpperCase()) + ' via $.ajax() method');
					$.ajax({
						dataType: 'json',
						type: 'GET',
						url: desturl,
						success: function (data, textStatus, jqXHR) {
							condition = (typeof (jqXHR.isResolved) !== 'undefined') ? (jqXHR.isResolved()) : (textStatus === "success" || textStatus === "notmodified");
							if (opts.appendCallback) {
								// if appendCallback is true, you must defined template in options.
								// note that data passed into _loadcallback is already an html (after processed in opts.template(data)).
								if (opts.template !== undefined) {
									var theData = opts.template(data);
									box.append(theData);
									if (condition) {
										instance._loadcallback(box, theData);
									} else {
										instance._error('end');
									}
								} else {
									instance._debug("template must be defined.");
									instance._error('end');
								}
							} else {
								// if appendCallback is false, we will pass in the JSON object. you should handle it yourself in your callback.
								if (condition) {
									instance._loadcallback(box, data, desturl);
								} else {
									instance._error('end');
								}
							}
						},
						error: function() {
							instance._debug("JSON ajax request failed.");
							instance._error('end');
						}
					});

					break;
			}
		},

        // Retrieve next set of content items
        retrieve: function infscr_retrieve(pageNum) {
			pageNum = pageNum || null;

			var instance = this,
            opts = instance.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['retrieve_'+opts.behavior] !== undefined) {
                this['retrieve_'+opts.behavior].call(this,pageNum);
                return;
            }

            // for manual triggers, if destroyed, get out of here
            if (opts.state.isDestroyed) {
                this._debug('Instance is destroyed');
                return false;
            }

            // we dont want to fire the ajax multiple times
            opts.state.isDuringAjax = true;

            opts.loading.start.call($(opts.contentSelector)[0],opts);
        },

        // Check to see next page is needed
        scroll: function infscr_scroll() {

            var opts = this.options,
            state = opts.state;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['scroll_'+opts.behavior] !== undefined) {
                this['scroll_'+opts.behavior].call(this);
                return;
            }

            if (state.isDuringAjax || state.isInvalidPage || state.isDone || state.isDestroyed || state.isPaused) {
				return;
			}

            if (!this._nearbottom()) {
				return;
			}

            this.retrieve();

        },

        // Toggle pause value
        toggle: function infscr_toggle() {
            this._pausing();
        },

        // Unbind from scroll
        unbind: function infscr_unbind() {
            this._binding('unbind');
        },

        // update options
        update: function infscr_options(key) {
            if ($.isPlainObject(key)) {
                this.options = $.extend(true,this.options,key);
            }
        }
    };


    /*	
        ----------------------------
        Infinite Scroll function
        ----------------------------

        Borrowed logic from the following...

        jQuery UI
        - https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js

        jCarousel
        - https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js

        Masonry
        - https://github.com/desandro/masonry/blob/master/jquery.masonry.js		

*/

    $.fn.infinitescroll = function infscr_init(options, callback) {


        var thisCall = typeof options;

        switch (thisCall) {

            // method 
            case 'string':
                var args = Array.prototype.slice.call(arguments, 1);

				this.each(function () {
					var instance = $.data(this, 'infinitescroll');

					if (!instance) {
						// not setup yet
						// return $.error('Method ' + options + ' cannot be called until Infinite Scroll is setup');
						return false;
					}

					if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
						// return $.error('No such method ' + options + ' for Infinite Scroll');
						return false;
					}

					// no errors!
					instance[options].apply(instance, args);
				});

            break;

            // creation 
            case 'object':

                this.each(function () {

                var instance = $.data(this, 'infinitescroll');

                if (instance) {

                    // update options of current instance
                    instance.update(options);

                } else {

                    // initialize new instance
                    instance = new $.infinitescroll(options, callback, this);

                    // don't attach if instantiation failed
                    if (!instance.failed) {
                        $.data(this, 'infinitescroll', instance);
                    }

                }

            });

            break;

        }

        return this;
    };



    /* 
     * smartscroll: debounced scroll event for jQuery *
     * https://github.com/lukeshumard/smartscroll
     * Based on smartresize by @louis_remi: https://github.com/lrbabe/jquery.smartresize.js *
     * Copyright 2011 Louis-Remi & Luke Shumard * Licensed under the MIT license. *
     */

    var event = $.event,
    scrollTimeout;

    event.special.smartscroll = {
        setup: function () {
            $(this).bind("scroll", event.special.smartscroll.handler);
        },
        teardown: function () {
            $(this).unbind("scroll", event.special.smartscroll.handler);
        },
        handler: function (event, execAsap) {
            // Save the context
            var context = this,
            args = arguments;

            // set correct event type
            event.type = "smartscroll";

            if (scrollTimeout) { clearTimeout(scrollTimeout); }
            scrollTimeout = setTimeout(function () {
                $(context).trigger('smartscroll', args);
            }, execAsap === "execAsap" ? 0 : 100);
        }
    };

    $.fn.smartscroll = function (fn) {
        return fn ? this.bind("smartscroll", fn) : this.trigger("smartscroll", ["execAsap"]);
    };


})(window, jQuery);
;/*!
 * Flickity PACKAGED v1.1.1
 * Touch, responsive, flickable galleries
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * http://flickity.metafizzy.co
 * Copyright 2015 Metafizzy
 */

!function(t){function e(){}function i(t){function i(e){e.prototype.option||(e.prototype.option=function(e){t.isPlainObject(e)&&(this.options=t.extend(!0,this.options,e))})}function o(e,i){t.fn[e]=function(o){if("string"==typeof o){for(var s=n.call(arguments,1),a=0,l=this.length;l>a;a++){var c=this[a],h=t.data(c,e);if(h)if(t.isFunction(h[o])&&"_"!==o.charAt(0)){var p=h[o].apply(h,s);if(void 0!==p)return p}else r("no such method '"+o+"' for "+e+" instance");else r("cannot call methods on "+e+" prior to initialization; attempted to call '"+o+"'")}return this}return this.each(function(){var n=t.data(this,e);n?(n.option(o),n._init()):(n=new i(this,o),t.data(this,e,n))})}}if(t){var r="undefined"==typeof console?e:function(t){console.error(t)};return t.bridget=function(t,e){i(e),o(t,e)},t.bridget}}var n=Array.prototype.slice;"function"==typeof define&&define.amd?define("jquery-bridget/jquery.bridget",["jquery"],i):i("object"==typeof exports?require("jquery"):t.jQuery)}(window),function(t){function e(t){return new RegExp("(^|\\s+)"+t+"(\\s+|$)")}function i(t,e){var i=n(t,e)?r:o;i(t,e)}var n,o,r;"classList"in document.documentElement?(n=function(t,e){return t.classList.contains(e)},o=function(t,e){t.classList.add(e)},r=function(t,e){t.classList.remove(e)}):(n=function(t,i){return e(i).test(t.className)},o=function(t,e){n(t,e)||(t.className=t.className+" "+e)},r=function(t,i){t.className=t.className.replace(e(i)," ")});var s={hasClass:n,addClass:o,removeClass:r,toggleClass:i,has:n,add:o,remove:r,toggle:i};"function"==typeof define&&define.amd?define("classie/classie",s):"object"==typeof exports?module.exports=s:t.classie=s}(window),function(){function t(){}function e(t,e){for(var i=t.length;i--;)if(t[i].listener===e)return i;return-1}function i(t){return function(){return this[t].apply(this,arguments)}}var n=t.prototype,o=this,r=o.EventEmitter;n.getListeners=function(t){var e,i,n=this._getEvents();if(t instanceof RegExp){e={};for(i in n)n.hasOwnProperty(i)&&t.test(i)&&(e[i]=n[i])}else e=n[t]||(n[t]=[]);return e},n.flattenListeners=function(t){var e,i=[];for(e=0;e<t.length;e+=1)i.push(t[e].listener);return i},n.getListenersAsObject=function(t){var e,i=this.getListeners(t);return i instanceof Array&&(e={},e[t]=i),e||i},n.addListener=function(t,i){var n,o=this.getListenersAsObject(t),r="object"==typeof i;for(n in o)o.hasOwnProperty(n)&&-1===e(o[n],i)&&o[n].push(r?i:{listener:i,once:!1});return this},n.on=i("addListener"),n.addOnceListener=function(t,e){return this.addListener(t,{listener:e,once:!0})},n.once=i("addOnceListener"),n.defineEvent=function(t){return this.getListeners(t),this},n.defineEvents=function(t){for(var e=0;e<t.length;e+=1)this.defineEvent(t[e]);return this},n.removeListener=function(t,i){var n,o,r=this.getListenersAsObject(t);for(o in r)r.hasOwnProperty(o)&&(n=e(r[o],i),-1!==n&&r[o].splice(n,1));return this},n.off=i("removeListener"),n.addListeners=function(t,e){return this.manipulateListeners(!1,t,e)},n.removeListeners=function(t,e){return this.manipulateListeners(!0,t,e)},n.manipulateListeners=function(t,e,i){var n,o,r=t?this.removeListener:this.addListener,s=t?this.removeListeners:this.addListeners;if("object"!=typeof e||e instanceof RegExp)for(n=i.length;n--;)r.call(this,e,i[n]);else for(n in e)e.hasOwnProperty(n)&&(o=e[n])&&("function"==typeof o?r.call(this,n,o):s.call(this,n,o));return this},n.removeEvent=function(t){var e,i=typeof t,n=this._getEvents();if("string"===i)delete n[t];else if(t instanceof RegExp)for(e in n)n.hasOwnProperty(e)&&t.test(e)&&delete n[e];else delete this._events;return this},n.removeAllListeners=i("removeEvent"),n.emitEvent=function(t,e){var i,n,o,r,s=this.getListenersAsObject(t);for(o in s)if(s.hasOwnProperty(o))for(n=s[o].length;n--;)i=s[o][n],i.once===!0&&this.removeListener(t,i.listener),r=i.listener.apply(this,e||[]),r===this._getOnceReturnValue()&&this.removeListener(t,i.listener);return this},n.trigger=i("emitEvent"),n.emit=function(t){var e=Array.prototype.slice.call(arguments,1);return this.emitEvent(t,e)},n.setOnceReturnValue=function(t){return this._onceReturnValue=t,this},n._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},n._getEvents=function(){return this._events||(this._events={})},t.noConflict=function(){return o.EventEmitter=r,t},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return t}):"object"==typeof module&&module.exports?module.exports=t:o.EventEmitter=t}.call(this),function(t){function e(e){var i=t.event;return i.target=i.target||i.srcElement||e,i}var i=document.documentElement,n=function(){};i.addEventListener?n=function(t,e,i){t.addEventListener(e,i,!1)}:i.attachEvent&&(n=function(t,i,n){t[i+n]=n.handleEvent?function(){var i=e(t);n.handleEvent.call(n,i)}:function(){var i=e(t);n.call(t,i)},t.attachEvent("on"+i,t[i+n])});var o=function(){};i.removeEventListener?o=function(t,e,i){t.removeEventListener(e,i,!1)}:i.detachEvent&&(o=function(t,e,i){t.detachEvent("on"+e,t[e+i]);try{delete t[e+i]}catch(n){t[e+i]=void 0}});var r={bind:n,unbind:o};"function"==typeof define&&define.amd?define("eventie/eventie",r):"object"==typeof exports?module.exports=r:t.eventie=r}(window),function(t){function e(t){if(t){if("string"==typeof n[t])return t;t=t.charAt(0).toUpperCase()+t.slice(1);for(var e,o=0,r=i.length;r>o;o++)if(e=i[o]+t,"string"==typeof n[e])return e}}var i="Webkit Moz ms Ms O".split(" "),n=document.documentElement.style;"function"==typeof define&&define.amd?define("get-style-property/get-style-property",[],function(){return e}):"object"==typeof exports?module.exports=e:t.getStyleProperty=e}(window),function(t){function e(t){var e=parseFloat(t),i=-1===t.indexOf("%")&&!isNaN(e);return i&&e}function i(){}function n(){for(var t={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0},e=0,i=s.length;i>e;e++){var n=s[e];t[n]=0}return t}function o(i){function o(){if(!d){d=!0;var n=t.getComputedStyle;if(c=function(){var t=n?function(t){return n(t,null)}:function(t){return t.currentStyle};return function(e){var i=t(e);return i||r("Style returned "+i+". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"),i}}(),h=i("boxSizing")){var o=document.createElement("div");o.style.width="200px",o.style.padding="1px 2px 3px 4px",o.style.borderStyle="solid",o.style.borderWidth="1px 2px 3px 4px",o.style[h]="border-box";var s=document.body||document.documentElement;s.appendChild(o);var a=c(o);p=200===e(a.width),s.removeChild(o)}}}function a(t){if(o(),"string"==typeof t&&(t=document.querySelector(t)),t&&"object"==typeof t&&t.nodeType){var i=c(t);if("none"===i.display)return n();var r={};r.width=t.offsetWidth,r.height=t.offsetHeight;for(var a=r.isBorderBox=!(!h||!i[h]||"border-box"!==i[h]),d=0,u=s.length;u>d;d++){var f=s[d],v=i[f];v=l(t,v);var y=parseFloat(v);r[f]=isNaN(y)?0:y}var g=r.paddingLeft+r.paddingRight,m=r.paddingTop+r.paddingBottom,b=r.marginLeft+r.marginRight,S=r.marginTop+r.marginBottom,x=r.borderLeftWidth+r.borderRightWidth,w=r.borderTopWidth+r.borderBottomWidth,C=a&&p,E=e(i.width);E!==!1&&(r.width=E+(C?0:g+x));var P=e(i.height);return P!==!1&&(r.height=P+(C?0:m+w)),r.innerWidth=r.width-(g+x),r.innerHeight=r.height-(m+w),r.outerWidth=r.width+b,r.outerHeight=r.height+S,r}}function l(e,i){if(t.getComputedStyle||-1===i.indexOf("%"))return i;var n=e.style,o=n.left,r=e.runtimeStyle,s=r&&r.left;return s&&(r.left=e.currentStyle.left),n.left=i,i=n.pixelLeft,n.left=o,s&&(r.left=s),i}var c,h,p,d=!1;return a}var r="undefined"==typeof console?i:function(t){console.error(t)},s=["paddingLeft","paddingRight","paddingTop","paddingBottom","marginLeft","marginRight","marginTop","marginBottom","borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth"];"function"==typeof define&&define.amd?define("get-size/get-size",["get-style-property/get-style-property"],o):"object"==typeof exports?module.exports=o(require("desandro-get-style-property")):t.getSize=o(t.getStyleProperty)}(window),function(t){function e(t){"function"==typeof t&&(e.isReady?t():s.push(t))}function i(t){var i="readystatechange"===t.type&&"complete"!==r.readyState;e.isReady||i||n()}function n(){e.isReady=!0;for(var t=0,i=s.length;i>t;t++){var n=s[t];n()}}function o(o){return"complete"===r.readyState?n():(o.bind(r,"DOMContentLoaded",i),o.bind(r,"readystatechange",i),o.bind(t,"load",i)),e}var r=t.document,s=[];e.isReady=!1,"function"==typeof define&&define.amd?define("doc-ready/doc-ready",["eventie/eventie"],o):"object"==typeof exports?module.exports=o(require("eventie")):t.docReady=o(t.eventie)}(window),function(t){function e(t,e){return t[s](e)}function i(t){if(!t.parentNode){var e=document.createDocumentFragment();e.appendChild(t)}}function n(t,e){i(t);for(var n=t.parentNode.querySelectorAll(e),o=0,r=n.length;r>o;o++)if(n[o]===t)return!0;return!1}function o(t,n){return i(t),e(t,n)}var r,s=function(){if(t.matches)return"matches";if(t.matchesSelector)return"matchesSelector";for(var e=["webkit","moz","ms","o"],i=0,n=e.length;n>i;i++){var o=e[i],r=o+"MatchesSelector";if(t[r])return r}}();if(s){var a=document.createElement("div"),l=e(a,"div");r=l?e:o}else r=n;"function"==typeof define&&define.amd?define("matches-selector/matches-selector",[],function(){return r}):"object"==typeof exports?module.exports=r:window.matchesSelector=r}(Element.prototype),function(t,e){"function"==typeof define&&define.amd?define("fizzy-ui-utils/utils",["doc-ready/doc-ready","matches-selector/matches-selector"],function(i,n){return e(t,i,n)}):"object"==typeof exports?module.exports=e(t,require("doc-ready"),require("desandro-matches-selector")):t.fizzyUIUtils=e(t,t.docReady,t.matchesSelector)}(window,function(t,e,i){var n={};n.extend=function(t,e){for(var i in e)t[i]=e[i];return t},n.modulo=function(t,e){return(t%e+e)%e};var o=Object.prototype.toString;n.isArray=function(t){return"[object Array]"==o.call(t)},n.makeArray=function(t){var e=[];if(n.isArray(t))e=t;else if(t&&"number"==typeof t.length)for(var i=0,o=t.length;o>i;i++)e.push(t[i]);else e.push(t);return e},n.indexOf=Array.prototype.indexOf?function(t,e){return t.indexOf(e)}:function(t,e){for(var i=0,n=t.length;n>i;i++)if(t[i]===e)return i;return-1},n.removeFrom=function(t,e){var i=n.indexOf(t,e);-1!=i&&t.splice(i,1)},n.isElement="function"==typeof HTMLElement||"object"==typeof HTMLElement?function(t){return t instanceof HTMLElement}:function(t){return t&&"object"==typeof t&&1==t.nodeType&&"string"==typeof t.nodeName},n.setText=function(){function t(t,i){e=e||(void 0!==document.documentElement.textContent?"textContent":"innerText"),t[e]=i}var e;return t}(),n.getParent=function(t,e){for(;t!=document.body;)if(t=t.parentNode,i(t,e))return t},n.getQueryElement=function(t){return"string"==typeof t?document.querySelector(t):t},n.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},n.filterFindElements=function(t,e){t=n.makeArray(t);for(var o=[],r=0,s=t.length;s>r;r++){var a=t[r];if(n.isElement(a))if(e){i(a,e)&&o.push(a);for(var l=a.querySelectorAll(e),c=0,h=l.length;h>c;c++)o.push(l[c])}else o.push(a)}return o},n.debounceMethod=function(t,e,i){var n=t.prototype[e],o=e+"Timeout";t.prototype[e]=function(){var t=this[o];t&&clearTimeout(t);var e=arguments,r=this;this[o]=setTimeout(function(){n.apply(r,e),delete r[o]},i||100)}},n.toDashed=function(t){return t.replace(/(.)([A-Z])/g,function(t,e,i){return e+"-"+i}).toLowerCase()};var r=t.console;return n.htmlInit=function(i,o){e(function(){for(var e=n.toDashed(o),s=document.querySelectorAll(".js-"+e),a="data-"+e+"-options",l=0,c=s.length;c>l;l++){var h,p=s[l],d=p.getAttribute(a);try{h=d&&JSON.parse(d)}catch(u){r&&r.error("Error parsing "+a+" on "+p.nodeName.toLowerCase()+(p.id?"#"+p.id:"")+": "+u);continue}var f=new i(p,h),v=t.jQuery;v&&v.data(p,o,f)}})},n}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/cell",["get-size/get-size"],function(i){return e(t,i)}):"object"==typeof exports?module.exports=e(t,require("get-size")):(t.Flickity=t.Flickity||{},t.Flickity.Cell=e(t,t.getSize))}(window,function(t,e){function i(t,e){this.element=t,this.parent=e,this.create()}var n="attachEvent"in t;return i.prototype.create=function(){this.element.style.position="absolute",n&&this.element.setAttribute("unselectable","on"),this.x=0,this.shift=0},i.prototype.destroy=function(){this.element.style.position="";var t=this.parent.originSide;this.element.style[t]=""},i.prototype.getSize=function(){this.size=e(this.element)},i.prototype.setPosition=function(t){this.x=t,this.setDefaultTarget(),this.renderPosition(t)},i.prototype.setDefaultTarget=function(){var t="left"==this.parent.originSide?"marginLeft":"marginRight";this.target=this.x+this.size[t]+this.size.width*this.parent.cellAlign},i.prototype.renderPosition=function(t){var e=this.parent.originSide;this.element.style[e]=this.parent.getPositionValue(t)},i.prototype.wrapShift=function(t){this.shift=t,this.renderPosition(this.x+this.parent.slideableWidth*t)},i.prototype.remove=function(){this.element.parentNode.removeChild(this.element)},i}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/animate",["get-style-property/get-style-property","fizzy-ui-utils/utils"],function(i,n){return e(t,i,n)}):"object"==typeof exports?module.exports=e(t,require("desandro-get-style-property"),require("fizzy-ui-utils")):(t.Flickity=t.Flickity||{},t.Flickity.animatePrototype=e(t,t.getStyleProperty,t.fizzyUIUtils))}(window,function(t,e,i){for(var n,o=0,r="webkit moz ms o".split(" "),s=t.requestAnimationFrame,a=t.cancelAnimationFrame,l=0;l<r.length&&(!s||!a);l++)n=r[l],s=s||t[n+"RequestAnimationFrame"],a=a||t[n+"CancelAnimationFrame"]||t[n+"CancelRequestAnimationFrame"];s&&a||(s=function(e){var i=(new Date).getTime(),n=Math.max(0,16-(i-o)),r=t.setTimeout(function(){e(i+n)},n);return o=i+n,r},a=function(e){t.clearTimeout(e)});var c={};c.startAnimation=function(){this.isAnimating||(this.isAnimating=!0,this.restingFrames=0,this.animate())},c.animate=function(){this.applyDragForce(),this.applySelectedAttraction();var t=this.x;if(this.integratePhysics(),this.positionSlider(),this.settle(t),this.isAnimating){var e=this;s(function(){e.animate()})}};var h=e("transform"),p=!!e("perspective");return c.positionSlider=function(){var t=this.x;this.options.wrapAround&&this.cells.length>1&&(t=i.modulo(t,this.slideableWidth),t-=this.slideableWidth,this.shiftWrapCells(t)),t+=this.cursorPosition,t=this.options.rightToLeft&&h?-t:t;var e=this.getPositionValue(t);h?this.slider.style[h]=p&&this.isAnimating?"translate3d("+e+",0,0)":"translateX("+e+")":this.slider.style[this.originSide]=e},c.positionSliderAtSelected=function(){if(this.cells.length){var t=this.cells[this.selectedIndex];this.x=-t.target,this.positionSlider()}},c.getPositionValue=function(t){return this.options.percentPosition?.01*Math.round(t/this.size.innerWidth*1e4)+"%":Math.round(t)+"px"},c.settle=function(t){this.isPointerDown||Math.round(100*this.x)!=Math.round(100*t)||this.restingFrames++,this.restingFrames>2&&(this.isAnimating=!1,delete this.isFreeScrolling,p&&this.positionSlider(),this.dispatchEvent("settle"))},c.shiftWrapCells=function(t){var e=this.cursorPosition+t;this._shiftCells(this.beforeShiftCells,e,-1);var i=this.size.innerWidth-(t+this.slideableWidth+this.cursorPosition);this._shiftCells(this.afterShiftCells,i,1)},c._shiftCells=function(t,e,i){for(var n=0,o=t.length;o>n;n++){var r=t[n],s=e>0?i:0;r.wrapShift(s),e-=r.size.outerWidth}},c._unshiftCells=function(t){if(t&&t.length)for(var e=0,i=t.length;i>e;e++)t[e].wrapShift(0)},c.integratePhysics=function(){this.velocity+=this.accel,this.x+=this.velocity,this.velocity*=this.getFrictionFactor(),this.accel=0},c.applyForce=function(t){this.accel+=t},c.getFrictionFactor=function(){return 1-this.options[this.isFreeScrolling?"freeScrollFriction":"friction"]},c.getRestingPosition=function(){return this.x+this.velocity/(1-this.getFrictionFactor())},c.applyDragForce=function(){if(this.isPointerDown){var t=this.dragX-this.x,e=t-this.velocity;this.applyForce(e)}},c.applySelectedAttraction=function(){var t=this.cells.length;if(!this.isPointerDown&&!this.isFreeScrolling&&t){var e=this.cells[this.selectedIndex],i=this.options.wrapAround&&t>1?this.slideableWidth*Math.floor(this.selectedIndex/t):0,n=-1*(e.target+i)-this.x,o=n*this.options.selectedAttraction;this.applyForce(o)}},c}),function(t,e){if("function"==typeof define&&define.amd)define("flickity/js/flickity",["classie/classie","eventEmitter/EventEmitter","eventie/eventie","get-size/get-size","fizzy-ui-utils/utils","./cell","./animate"],function(i,n,o,r,s,a,l){return e(t,i,n,o,r,s,a,l)});else if("object"==typeof exports)module.exports=e(t,require("desandro-classie"),require("wolfy87-eventemitter"),require("eventie"),require("get-size"),require("fizzy-ui-utils"),require("./cell"),require("./animate"));else{var i=t.Flickity;t.Flickity=e(t,t.classie,t.EventEmitter,t.eventie,t.getSize,t.fizzyUIUtils,i.Cell,i.animatePrototype)}}(window,function(t,e,i,n,o,r,s,a){function l(t,e){for(t=r.makeArray(t);t.length;)e.appendChild(t.shift())}function c(t,e){var i=r.getQueryElement(t);return i?(this.element=i,h&&(this.$element=h(this.element)),this.options=r.extend({},this.constructor.defaults),this.option(e),void this._create()):void(d&&d.error("Bad element for Flickity: "+(i||t)))}var h=t.jQuery,p=t.getComputedStyle,d=t.console,u=0,f={};c.defaults={accessibility:!0,cellAlign:"center",freeScrollFriction:.075,friction:.28,percentPosition:!0,resize:!0,selectedAttraction:.025,setGallerySize:!0},c.createMethods=[],r.extend(c.prototype,i.prototype),c.prototype._create=function(){var e=this.guid=++u;this.element.flickityGUID=e,f[e]=this,this.selectedIndex=this.options.initialIndex||0,this.restingFrames=0,this.x=0,this.velocity=0,this.accel=0,this.originSide=this.options.rightToLeft?"right":"left",this.viewport=document.createElement("div"),this.viewport.className="flickity-viewport",c.setUnselectable(this.viewport),this._createSlider(),(this.options.resize||this.options.watchCSS)&&(n.bind(t,"resize",this),this.isResizeBound=!0);for(var i=0,o=c.createMethods.length;o>i;i++){var r=c.createMethods[i];this[r]()}this.options.watchCSS?this.watchCSS():this.activate()},c.prototype.option=function(t){r.extend(this.options,t)},c.prototype.activate=function(){if(!this.isActive){this.isActive=!0,e.add(this.element,"flickity-enabled"),this.options.rightToLeft&&e.add(this.element,"flickity-rtl"),this.getSize();var t=this._filterFindCellElements(this.element.children);l(t,this.slider),this.viewport.appendChild(this.slider),this.element.appendChild(this.viewport),this.reloadCells(),this.options.accessibility&&(this.element.tabIndex=0,n.bind(this.element,"keydown",this)),this.emit("activate"),this.positionSliderAtSelected(),this.select(this.selectedIndex)}},c.prototype._createSlider=function(){var t=document.createElement("div");t.className="flickity-slider",t.style[this.originSide]=0,this.slider=t},c.prototype._filterFindCellElements=function(t){return r.filterFindElements(t,this.options.cellSelector)},c.prototype.reloadCells=function(){this.cells=this._makeCells(this.slider.children),this.positionCells(),this._getWrapShiftCells(),this.setGallerySize()},c.prototype._makeCells=function(t){for(var e=this._filterFindCellElements(t),i=[],n=0,o=e.length;o>n;n++){var r=e[n],a=new s(r,this);i.push(a)}return i},c.prototype.getLastCell=function(){return this.cells[this.cells.length-1]},c.prototype.positionCells=function(){this._sizeCells(this.cells),this._positionCells(0)},c.prototype._positionCells=function(t){t=t||0,this.maxCellHeight=t?this.maxCellHeight||0:0;var e=0;if(t>0){var i=this.cells[t-1];e=i.x+i.size.outerWidth}for(var n,o=this.cells.length,r=t;o>r;r++)n=this.cells[r],n.setPosition(e),e+=n.size.outerWidth,this.maxCellHeight=Math.max(n.size.outerHeight,this.maxCellHeight);this.slideableWidth=e,this._containCells()},c.prototype._sizeCells=function(t){for(var e=0,i=t.length;i>e;e++){var n=t[e];n.getSize()}},c.prototype._init=c.prototype.reposition=function(){this.positionCells(),this.positionSliderAtSelected()},c.prototype.getSize=function(){this.size=o(this.element),this.setCellAlign(),this.cursorPosition=this.size.innerWidth*this.cellAlign};var v={center:{left:.5,right:.5},left:{left:0,right:1},right:{right:0,left:1}};c.prototype.setCellAlign=function(){var t=v[this.options.cellAlign];this.cellAlign=t?t[this.originSide]:this.options.cellAlign},c.prototype.setGallerySize=function(){this.options.setGallerySize&&(this.viewport.style.height=this.maxCellHeight+"px")},c.prototype._getWrapShiftCells=function(){if(this.options.wrapAround){this._unshiftCells(this.beforeShiftCells),this._unshiftCells(this.afterShiftCells);var t=this.cursorPosition,e=this.cells.length-1;this.beforeShiftCells=this._getGapCells(t,e,-1),t=this.size.innerWidth-this.cursorPosition,this.afterShiftCells=this._getGapCells(t,0,1)}},c.prototype._getGapCells=function(t,e,i){for(var n=[];t>0;){var o=this.cells[e];if(!o)break;n.push(o),e+=i,t-=o.size.outerWidth}return n},c.prototype._containCells=function(){if(this.options.contain&&!this.options.wrapAround&&this.cells.length)for(var t=this.options.rightToLeft?"marginRight":"marginLeft",e=this.options.rightToLeft?"marginLeft":"marginRight",i=this.cells[0].size[t],n=this.getLastCell(),o=this.slideableWidth-n.size[e],r=o-this.size.innerWidth*(1-this.cellAlign),s=o<this.size.innerWidth,a=0,l=this.cells.length;l>a;a++){var c=this.cells[a];c.setDefaultTarget(),s?c.target=o*this.cellAlign:(c.target=Math.max(c.target,this.cursorPosition+i),c.target=Math.min(c.target,r))}},c.prototype.dispatchEvent=function(t,e,i){var n=[e].concat(i);if(this.emitEvent(t,n),h&&this.$element)if(e){var o=h.Event(e);o.type=t,this.$element.trigger(o,i)}else this.$element.trigger(t,i)},c.prototype.select=function(t,e){if(this.isActive){var i=this.cells.length;this.options.wrapAround&&i>1&&(0>t?this.x-=this.slideableWidth:t>=i&&(this.x+=this.slideableWidth)),(this.options.wrapAround||e)&&(t=r.modulo(t,i)),this.cells[t]&&(this.selectedIndex=t,this.setSelectedCell(),this.startAnimation(),this.dispatchEvent("cellSelect"))}},c.prototype.previous=function(t){this.select(this.selectedIndex-1,t)},c.prototype.next=function(t){this.select(this.selectedIndex+1,t)},c.prototype.setSelectedCell=function(){this._removeSelectedCellClass(),this.selectedCell=this.cells[this.selectedIndex],this.selectedElement=this.selectedCell.element,e.add(this.selectedElement,"is-selected")},c.prototype._removeSelectedCellClass=function(){this.selectedCell&&e.remove(this.selectedCell.element,"is-selected")},c.prototype.getCell=function(t){for(var e=0,i=this.cells.length;i>e;e++){var n=this.cells[e];if(n.element==t)return n}},c.prototype.getCells=function(t){t=r.makeArray(t);for(var e=[],i=0,n=t.length;n>i;i++){var o=t[i],s=this.getCell(o);s&&e.push(s)}return e},c.prototype.getCellElements=function(){for(var t=[],e=0,i=this.cells.length;i>e;e++)t.push(this.cells[e].element);return t},c.prototype.getParentCell=function(t){var e=this.getCell(t);return e?e:(t=r.getParent(t,".flickity-slider > *"),this.getCell(t))},c.prototype.getAdjacentCellElements=function(t,e){if(!t)return[this.selectedElement];e=void 0===e?this.selectedIndex:e;var i=this.cells.length;if(1+2*t>=i)return this.getCellElements();for(var n=[],o=e-t;e+t>=o;o++){var s=this.options.wrapAround?r.modulo(o,i):o,a=this.cells[s];a&&n.push(a.element)}return n},c.prototype.uiChange=function(){this.emit("uiChange")},c.prototype.childUIPointerDown=function(t){this.emitEvent("childUIPointerDown",[t])},c.prototype.onresize=function(){this.watchCSS(),this.resize()},r.debounceMethod(c,"onresize",150),c.prototype.resize=function(){this.isActive&&(this.getSize(),this.options.wrapAround&&(this.x=r.modulo(this.x,this.slideableWidth)),this.positionCells(),this._getWrapShiftCells(),this.setGallerySize(),this.positionSliderAtSelected())};var y=c.supportsConditionalCSS=function(){var t;return function(){if(void 0!==t)return t;if(!p)return void(t=!1);var e=document.createElement("style"),i=document.createTextNode('body:after { content: "foo"; display: none; }');e.appendChild(i),document.head.appendChild(e);var n=p(document.body,":after").content;return t=-1!=n.indexOf("foo"),document.head.removeChild(e),t}}();c.prototype.watchCSS=function(){var t=this.options.watchCSS;if(t){var e=y();if(!e){var i="fallbackOn"==t?"activate":"deactivate";return void this[i]()}var n=p(this.element,":after").content;-1!=n.indexOf("flickity")?this.activate():this.deactivate()}},c.prototype.onkeydown=function(t){if(this.options.accessibility&&(!document.activeElement||document.activeElement==this.element))if(37==t.keyCode){var e=this.options.rightToLeft?"next":"previous";this.uiChange(),this[e]()}else if(39==t.keyCode){var i=this.options.rightToLeft?"previous":"next";this.uiChange(),this[i]()}},c.prototype.deactivate=function(){if(this.isActive){e.remove(this.element,"flickity-enabled"),e.remove(this.element,"flickity-rtl");for(var t=0,i=this.cells.length;i>t;t++){var o=this.cells[t];o.destroy()}this._removeSelectedCellClass(),this.element.removeChild(this.viewport),l(this.slider.children,this.element),this.options.accessibility&&(this.element.removeAttribute("tabIndex"),n.unbind(this.element,"keydown",this)),this.isActive=!1,this.emit("deactivate")}},c.prototype.destroy=function(){this.deactivate(),this.isResizeBound&&n.unbind(t,"resize",this),this.emit("destroy"),h&&this.$element&&h.removeData(this.element,"flickity"),delete this.element.flickityGUID,delete f[this.guid]},r.extend(c.prototype,a);var g="attachEvent"in t;return c.setUnselectable=function(t){g&&t.setAttribute("unselectable","on")},c.data=function(t){t=r.getQueryElement(t);var e=t&&t.flickityGUID;return e&&f[e]},r.htmlInit(c,"flickity"),h&&h.bridget&&h.bridget("flickity",c),c.Cell=s,c}),function(t,e){"function"==typeof define&&define.amd?define("unipointer/unipointer",["eventEmitter/EventEmitter","eventie/eventie"],function(i,n){return e(t,i,n)}):"object"==typeof exports?module.exports=e(t,require("wolfy87-eventemitter"),require("eventie")):t.Unipointer=e(t,t.EventEmitter,t.eventie)}(window,function(t,e,i){function n(){}function o(){}o.prototype=new e,o.prototype.bindStartEvent=function(t){this._bindStartEvent(t,!0)},o.prototype.unbindStartEvent=function(t){this._bindStartEvent(t,!1)},o.prototype._bindStartEvent=function(e,n){n=void 0===n?!0:!!n;var o=n?"bind":"unbind";t.navigator.pointerEnabled?i[o](e,"pointerdown",this):t.navigator.msPointerEnabled?i[o](e,"MSPointerDown",this):(i[o](e,"mousedown",this),i[o](e,"touchstart",this))},o.prototype.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},o.prototype.getTouch=function(t){for(var e=0,i=t.length;i>e;e++){var n=t[e];if(n.identifier==this.pointerIdentifier)return n}},o.prototype.onmousedown=function(t){var e=t.button;e&&0!==e&&1!==e||this._pointerDown(t,t)},o.prototype.ontouchstart=function(t){this._pointerDown(t,t.changedTouches[0])},o.prototype.onMSPointerDown=o.prototype.onpointerdown=function(t){this._pointerDown(t,t)},o.prototype._pointerDown=function(t,e){this.isPointerDown||(this.isPointerDown=!0,this.pointerIdentifier=void 0!==e.pointerId?e.pointerId:e.identifier,this.pointerDown(t,e))},o.prototype.pointerDown=function(t,e){this._bindPostStartEvents(t),this.emitEvent("pointerDown",[t,e])};var r={mousedown:["mousemove","mouseup"],touchstart:["touchmove","touchend","touchcancel"],pointerdown:["pointermove","pointerup","pointercancel"],MSPointerDown:["MSPointerMove","MSPointerUp","MSPointerCancel"]};return o.prototype._bindPostStartEvents=function(e){if(e){for(var n=r[e.type],o=e.preventDefault?t:document,s=0,a=n.length;a>s;s++){var l=n[s];i.bind(o,l,this)}this._boundPointerEvents={events:n,node:o}}},o.prototype._unbindPostStartEvents=function(){var t=this._boundPointerEvents;if(t&&t.events){for(var e=0,n=t.events.length;n>e;e++){var o=t.events[e];i.unbind(t.node,o,this)}delete this._boundPointerEvents}},o.prototype.onmousemove=function(t){this._pointerMove(t,t)},o.prototype.onMSPointerMove=o.prototype.onpointermove=function(t){t.pointerId==this.pointerIdentifier&&this._pointerMove(t,t)},o.prototype.ontouchmove=function(t){var e=this.getTouch(t.changedTouches);e&&this._pointerMove(t,e)},o.prototype._pointerMove=function(t,e){this.pointerMove(t,e)},o.prototype.pointerMove=function(t,e){this.emitEvent("pointerMove",[t,e])},o.prototype.onmouseup=function(t){this._pointerUp(t,t)},o.prototype.onMSPointerUp=o.prototype.onpointerup=function(t){t.pointerId==this.pointerIdentifier&&this._pointerUp(t,t)},o.prototype.ontouchend=function(t){var e=this.getTouch(t.changedTouches);e&&this._pointerUp(t,e)},o.prototype._pointerUp=function(t,e){this._pointerDone(),this.pointerUp(t,e)},o.prototype.pointerUp=function(t,e){this.emitEvent("pointerUp",[t,e])},o.prototype._pointerDone=function(){this.isPointerDown=!1,delete this.pointerIdentifier,this._unbindPostStartEvents(),this.pointerDone()},o.prototype.pointerDone=n,o.prototype.onMSPointerCancel=o.prototype.onpointercancel=function(t){t.pointerId==this.pointerIdentifier&&this._pointerCancel(t,t)},o.prototype.ontouchcancel=function(t){var e=this.getTouch(t.changedTouches);e&&this._pointerCancel(t,e)},o.prototype._pointerCancel=function(t,e){this._pointerDone(),this.pointerCancel(t,e)},o.prototype.pointerCancel=function(t,e){this.emitEvent("pointerCancel",[t,e])},o.getPointerPoint=function(t){return{x:void 0!==t.pageX?t.pageX:t.clientX,y:void 0!==t.pageY?t.pageY:t.clientY}},o}),function(t,e){"function"==typeof define&&define.amd?define("unidragger/unidragger",["eventie/eventie","unipointer/unipointer"],function(i,n){return e(t,i,n)}):"object"==typeof exports?module.exports=e(t,require("eventie"),require("unipointer")):t.Unidragger=e(t,t.eventie,t.Unipointer)}(window,function(t,e,i){function n(){}function o(t){t.preventDefault?t.preventDefault():t.returnValue=!1}function r(){}function s(){return!1}r.prototype=new i,r.prototype.bindHandles=function(){this._bindHandles(!0)},r.prototype.unbindHandles=function(){this._bindHandles(!1)};var a=t.navigator;r.prototype._bindHandles=function(t){t=void 0===t?!0:!!t;var i;i=a.pointerEnabled?function(e){e.style.touchAction=t?"none":""}:a.msPointerEnabled?function(e){e.style.msTouchAction=t?"none":""}:function(){t&&c(s)};for(var n=t?"bind":"unbind",o=0,r=this.handles.length;r>o;o++){var s=this.handles[o];this._bindStartEvent(s,t),i(s),e[n](s,"click",this)}};var l="attachEvent"in document.documentElement,c=l?function(t){"IMG"==t.nodeName&&(t.ondragstart=s);for(var e=t.querySelectorAll("img"),i=0,n=e.length;n>i;i++){var o=e[i];o.ondragstart=s}}:n;r.prototype.pointerDown=function(i,n){if("INPUT"==i.target.nodeName&&"range"==i.target.type)return this.isPointerDown=!1,void delete this.pointerIdentifier;this._dragPointerDown(i,n);var o=document.activeElement;o&&o.blur&&o.blur(),this._bindPostStartEvents(i),this.pointerDownScroll=r.getScrollPosition(),e.bind(t,"scroll",this),this.emitEvent("pointerDown",[i,n])},r.prototype._dragPointerDown=function(t,e){this.pointerDownPoint=i.getPointerPoint(e);var n="touchstart"==t.type,r=t.target.nodeName;n||"SELECT"==r||o(t)},r.prototype.pointerMove=function(t,e){var i=this._dragPointerMove(t,e);this.emitEvent("pointerMove",[t,e,i]),this._dragMove(t,e,i)},r.prototype._dragPointerMove=function(t,e){var n=i.getPointerPoint(e),o={x:n.x-this.pointerDownPoint.x,y:n.y-this.pointerDownPoint.y};return!this.isDragging&&this.hasDragStarted(o)&&this._dragStart(t,e),o},r.prototype.hasDragStarted=function(t){return Math.abs(t.x)>3||Math.abs(t.y)>3},r.prototype.pointerUp=function(t,e){this.emitEvent("pointerUp",[t,e]),this._dragPointerUp(t,e)},r.prototype._dragPointerUp=function(t,e){this.isDragging?this._dragEnd(t,e):this._staticClick(t,e)},i.prototype.pointerDone=function(){e.unbind(t,"scroll",this)},r.prototype._dragStart=function(t,e){this.isDragging=!0,this.dragStartPoint=r.getPointerPoint(e),this.isPreventingClicks=!0,this.dragStart(t,e)},r.prototype.dragStart=function(t,e){this.emitEvent("dragStart",[t,e])},r.prototype._dragMove=function(t,e,i){this.isDragging&&this.dragMove(t,e,i)
},r.prototype.dragMove=function(t,e,i){o(t),this.emitEvent("dragMove",[t,e,i])},r.prototype._dragEnd=function(t,e){this.isDragging=!1;var i=this;setTimeout(function(){delete i.isPreventingClicks}),this.dragEnd(t,e)},r.prototype.dragEnd=function(t,e){this.emitEvent("dragEnd",[t,e])},r.prototype.pointerDone=function(){e.unbind(t,"scroll",this),delete this.pointerDownScroll},r.prototype.onclick=function(t){this.isPreventingClicks&&o(t)},r.prototype._staticClick=function(t,e){if(!this.isIgnoringMouseUp||"mouseup"!=t.type){var i=t.target.nodeName;if(("INPUT"==i||"TEXTAREA"==i)&&t.target.focus(),this.staticClick(t,e),"mouseup"!=t.type){this.isIgnoringMouseUp=!0;var n=this;setTimeout(function(){delete n.isIgnoringMouseUp},400)}}},r.prototype.staticClick=function(t,e){this.emitEvent("staticClick",[t,e])},r.prototype.onscroll=function(){var t=r.getScrollPosition(),e=this.pointerDownScroll.x-t.x,i=this.pointerDownScroll.y-t.y;(Math.abs(e)>3||Math.abs(i)>3)&&this._pointerDone()},r.getPointerPoint=function(t){return{x:void 0!==t.pageX?t.pageX:t.clientX,y:void 0!==t.pageY?t.pageY:t.clientY}};var h=void 0!==t.pageYOffset;return r.getScrollPosition=function(){return{x:h?t.pageXOffset:document.body.scrollLeft,y:h?t.pageYOffset:document.body.scrollTop}},r.getPointerPoint=i.getPointerPoint,r}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/drag",["classie/classie","eventie/eventie","./flickity","unidragger/unidragger","fizzy-ui-utils/utils"],function(i,n,o,r,s){return e(t,i,n,o,r,s)}):"object"==typeof exports?module.exports=e(t,require("desandro-classie"),require("eventie"),require("./flickity"),require("unidragger"),require("fizzy-ui-utils")):t.Flickity=e(t,t.classie,t.eventie,t.Flickity,t.Unidragger,t.fizzyUIUtils)}(window,function(t,e,i,n,o,r){function s(t){t.preventDefault?t.preventDefault():t.returnValue=!1}function a(e){var i=o.getPointerPoint(e);return i.y-t.pageYOffset}r.extend(n.defaults,{draggable:!0,touchVerticalScroll:!0}),n.createMethods.push("_createDrag"),r.extend(n.prototype,o.prototype),n.prototype._createDrag=function(){this.on("activate",this.bindDrag),this.on("uiChange",this._uiChangeDrag),this.on("childUIPointerDown",this._childUIPointerDownDrag),this.on("deactivate",this.unbindDrag)},n.prototype.bindDrag=function(){this.options.draggable&&!this.isDragBound&&(e.add(this.element,"is-draggable"),this.handles=[this.viewport],this.bindHandles(),this.isDragBound=!0)},n.prototype.unbindDrag=function(){this.isDragBound&&(e.remove(this.element,"is-draggable"),this.unbindHandles(),delete this.isDragBound)},n.prototype._uiChangeDrag=function(){delete this.isFreeScrolling},n.prototype._childUIPointerDownDrag=function(t){s(t),this.pointerDownFocus(t)},n.prototype.pointerDown=function(n,r){if("INPUT"==n.target.nodeName&&"range"==n.target.type)return this.isPointerDown=!1,void delete this.pointerIdentifier;this._dragPointerDown(n,r);var s=document.activeElement;s&&s.blur&&s!=this.element&&s!=document.body&&s.blur(),this.pointerDownFocus(n),this.dragX=this.x,e.add(this.viewport,"is-pointer-down"),this._bindPostStartEvents(n),this.pointerDownScroll=o.getScrollPosition(),i.bind(t,"scroll",this),this.dispatchEvent("pointerDown",n,[r])};var l={touchstart:!0,MSPointerDown:!0},c={INPUT:!0,SELECT:!0};n.prototype.pointerDownFocus=function(t){!this.options.accessibility||l[t.type]||c[t.target.nodeName]||this.element.focus()},n.prototype.pointerMove=function(t,e){var i=this._dragPointerMove(t,e);this.touchVerticalScrollMove(t,e,i),this._dragMove(t,e,i),this.dispatchEvent("pointerMove",t,[e,i])},n.prototype.hasDragStarted=function(t){return!this.isTouchScrolling&&Math.abs(t.x)>3},n.prototype.pointerUp=function(t,i){delete this.isTouchScrolling,e.remove(this.viewport,"is-pointer-down"),this.dispatchEvent("pointerUp",t,[i]),this._dragPointerUp(t,i)};var h={touchmove:!0,MSPointerMove:!0};return n.prototype.touchVerticalScrollMove=function(e,i,n){var o=this.options.touchVerticalScroll,r="withDrag"==o?!o:this.isDragging||!o;!r&&h[e.type]&&!this.isTouchScrolling&&Math.abs(n.y)>10&&(this.startScrollY=t.pageYOffset,this.pointerWindowStartY=a(i),this.isTouchScrolling=!0)},n.prototype.dragStart=function(t,e){this.dragStartPosition=this.x,this.startAnimation(),this.dispatchEvent("dragStart",t,[e])},n.prototype.dragMove=function(t,e,i){s(t),this.previousDragX=this.dragX;var n=this.options.rightToLeft?-1:1,o=this.dragStartPosition+i.x*n;if(!this.options.wrapAround&&this.cells.length){var r=Math.max(-this.cells[0].target,this.dragStartPosition);o=o>r?.5*(o+r):o;var a=Math.min(-this.getLastCell().target,this.dragStartPosition);o=a>o?.5*(o+a):o}this.dragX=o,this.dragMoveTime=new Date,this.dispatchEvent("dragMove",t,[e,i])},n.prototype.dragEnd=function(t,e){this.options.freeScroll&&(this.isFreeScrolling=!0);var i=this.dragEndRestingSelect();if(this.options.freeScroll&&!this.options.wrapAround){var n=this.getRestingPosition();this.isFreeScrolling=-n>this.cells[0].target&&-n<this.getLastCell().target}else this.options.freeScroll||i!=this.selectedIndex||(i+=this.dragEndBoostSelect());delete this.previousDragX,this.select(i),this.dispatchEvent("dragEnd",t,[e])},n.prototype.dragEndRestingSelect=function(){var t=this.getRestingPosition(),e=Math.abs(this.getCellDistance(-t,this.selectedIndex)),i=this._getClosestResting(t,e,1),n=this._getClosestResting(t,e,-1),o=i.distance<n.distance?i.index:n.index;return o},n.prototype._getClosestResting=function(t,e,i){for(var n=this.selectedIndex,o=1/0,r=this.options.contain&&!this.options.wrapAround?function(t,e){return e>=t}:function(t,e){return e>t};r(e,o)&&(n+=i,o=e,e=this.getCellDistance(-t,n),null!==e);)e=Math.abs(e);return{distance:o,index:n-i}},n.prototype.getCellDistance=function(t,e){var i=this.cells.length,n=this.options.wrapAround&&i>1,o=n?r.modulo(e,i):e,s=this.cells[o];if(!s)return null;var a=n?this.slideableWidth*Math.floor(e/i):0;return t-(s.target+a)},n.prototype.dragEndBoostSelect=function(){if(void 0===this.previousDragX||!this.dragMoveTime||new Date-this.dragMoveTime>100)return 0;var t=this.getCellDistance(-this.dragX,this.selectedIndex),e=this.previousDragX-this.dragX;return t>0&&e>0?1:0>t&&0>e?-1:0},n.prototype.staticClick=function(t,e){var i=this.getParentCell(t.target),n=i&&i.element,o=i&&r.indexOf(this.cells,i);this.dispatchEvent("staticClick",t,[e,n,o])},n}),function(t,e){"function"==typeof define&&define.amd?define("tap-listener/tap-listener",["unipointer/unipointer"],function(i){return e(t,i)}):"object"==typeof exports?module.exports=e(t,require("unipointer")):t.TapListener=e(t,t.Unipointer)}(window,function(t,e){function i(t){t.preventDefault?t.preventDefault():t.returnValue=!1}function n(t){this.bindTap(t)}n.prototype=new e,n.prototype.bindTap=function(t){t&&(this.unbindTap(),this.tapElement=t,this._bindStartEvent(t,!0))},n.prototype.unbindTap=function(){this.tapElement&&(this._bindStartEvent(this.tapElement,!0),delete this.tapElement)};var o=n.prototype.pointerDown;n.prototype.pointerDown=function(t){"touchstart"==t.type&&i(t),o.apply(this,arguments)};var r=void 0!==t.pageYOffset;return n.prototype.pointerUp=function(i,n){var o=e.getPointerPoint(n),s=this.tapElement.getBoundingClientRect(),a=r?t.pageXOffset:document.body.scrollLeft,l=r?t.pageYOffset:document.body.scrollTop,c=o.x>=s.left+a&&o.x<=s.right+a&&o.y>=s.top+l&&o.y<=s.bottom+l;c&&this.emitEvent("tap",[i,n])},n.prototype.destroy=function(){this.pointerDone(),this.unbindTap()},n}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/prev-next-button",["eventie/eventie","./flickity","tap-listener/tap-listener","fizzy-ui-utils/utils"],function(i,n,o,r){return e(t,i,n,o,r)}):"object"==typeof exports?module.exports=e(t,require("eventie"),require("./flickity"),require("tap-listener"),require("fizzy-ui-utils")):e(t,t.eventie,t.Flickity,t.TapListener,t.fizzyUIUtils)}(window,function(t,e,i,n,o){function r(t,e){this.direction=t,this.parent=e,this._create()}function s(t){return"string"==typeof t?t:"M "+t.x0+",50 L "+t.x1+","+(t.y1+50)+" L "+t.x2+","+(t.y2+50)+" L "+t.x3+",50  L "+t.x2+","+(50-t.y2)+" L "+t.x1+","+(50-t.y1)+" Z"}var a="http://www.w3.org/2000/svg",l=function(){function t(){if(void 0!==e)return e;var t=document.createElement("div");return t.innerHTML="<svg/>",e=(t.firstChild&&t.firstChild.namespaceURI)==a}var e;return t}();return r.prototype=new n,r.prototype._create=function(){this.isEnabled=!0,this.isPrevious=-1==this.direction;var t=this.parent.options.rightToLeft?1:-1;this.isLeft=this.direction==t;var e=this.element=document.createElement("button");if(e.className="flickity-prev-next-button",e.className+=this.isPrevious?" previous":" next",e.setAttribute("type","button"),i.setUnselectable(e),l()){var n=this.createSVG();e.appendChild(n)}else this.setArrowText(),e.className+=" no-svg";var o=this;this.onCellSelect=function(){o.update()},this.parent.on("cellSelect",this.onCellSelect),this.on("tap",this.onTap),this.on("pointerDown",function(t,e){o.parent.childUIPointerDown(e)})},r.prototype.activate=function(){this.update(),this.bindTap(this.element),e.bind(this.element,"click",this),this.parent.element.appendChild(this.element)},r.prototype.deactivate=function(){this.parent.element.removeChild(this.element),n.prototype.destroy.call(this),e.unbind(this.element,"click",this)},r.prototype.createSVG=function(){var t=document.createElementNS(a,"svg");t.setAttribute("viewBox","0 0 100 100");var e=document.createElementNS(a,"path"),i=s(this.parent.options.arrowShape);return e.setAttribute("d",i),e.setAttribute("class","arrow"),this.isLeft||e.setAttribute("transform","translate(100, 100) rotate(180) "),t.appendChild(e),t},r.prototype.setArrowText=function(){var t=this.parent.options,e=this.isLeft?t.leftArrowText:t.rightArrowText;o.setText(this.element,e)},r.prototype.onTap=function(){if(this.isEnabled){this.parent.uiChange();var t=this.isPrevious?"previous":"next";this.parent[t]()}},r.prototype.handleEvent=o.handleEvent,r.prototype.onclick=function(){var t=document.activeElement;t&&t==this.element&&this.onTap()},r.prototype.enable=function(){this.isEnabled||(this.element.disabled=!1,this.isEnabled=!0)},r.prototype.disable=function(){this.isEnabled&&(this.element.disabled=!0,this.isEnabled=!1)},r.prototype.update=function(){var t=this.parent.cells;if(this.parent.options.wrapAround&&t.length>1)return void this.enable();var e=t.length?t.length-1:0,i=this.isPrevious?0:e,n=this.parent.selectedIndex==i?"disable":"enable";this[n]()},r.prototype.destroy=function(){this.deactivate()},o.extend(i.defaults,{prevNextButtons:!0,leftArrowText:"‹",rightArrowText:"›",arrowShape:{x0:10,x1:60,y1:50,x2:70,y2:40,x3:30}}),i.createMethods.push("_createPrevNextButtons"),i.prototype._createPrevNextButtons=function(){this.options.prevNextButtons&&(this.prevButton=new r(-1,this),this.nextButton=new r(1,this),this.on("activate",this.activatePrevNextButtons))},i.prototype.activatePrevNextButtons=function(){this.prevButton.activate(),this.nextButton.activate(),this.on("deactivate",this.deactivatePrevNextButtons)},i.prototype.deactivatePrevNextButtons=function(){this.prevButton.deactivate(),this.nextButton.deactivate(),this.off("deactivate",this.deactivatePrevNextButtons)},i.PrevNextButton=r,i}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/page-dots",["eventie/eventie","./flickity","tap-listener/tap-listener","fizzy-ui-utils/utils"],function(i,n,o,r){return e(t,i,n,o,r)}):"object"==typeof exports?module.exports=e(t,require("eventie"),require("./flickity"),require("tap-listener"),require("fizzy-ui-utils")):e(t,t.eventie,t.Flickity,t.TapListener,t.fizzyUIUtils)}(window,function(t,e,i,n,o){function r(t){this.parent=t,this._create()}return r.prototype=new n,r.prototype._create=function(){this.holder=document.createElement("ol"),this.holder.className="flickity-page-dots",i.setUnselectable(this.holder),this.dots=[];var t=this;this.onCellSelect=function(){t.updateSelected()},this.parent.on("cellSelect",this.onCellSelect),this.on("tap",this.onTap),this.on("pointerDown",function(e,i){t.parent.childUIPointerDown(i)})},r.prototype.activate=function(){this.setDots(),this.updateSelected(),this.bindTap(this.holder),this.parent.element.appendChild(this.holder)},r.prototype.deactivate=function(){this.parent.element.removeChild(this.holder),n.prototype.destroy.call(this)},r.prototype.setDots=function(){var t=this.parent.cells.length-this.dots.length;t>0?this.addDots(t):0>t&&this.removeDots(-t)},r.prototype.addDots=function(t){for(var e=document.createDocumentFragment(),i=[];t;){var n=document.createElement("li");n.className="dot",e.appendChild(n),i.push(n),t--}this.holder.appendChild(e),this.dots=this.dots.concat(i)},r.prototype.removeDots=function(t){for(var e=this.dots.splice(this.dots.length-t,t),i=0,n=e.length;n>i;i++){var o=e[i];this.holder.removeChild(o)}},r.prototype.updateSelected=function(){this.selectedDot&&(this.selectedDot.className="dot"),this.dots.length&&(this.selectedDot=this.dots[this.parent.selectedIndex],this.selectedDot.className="dot is-selected")},r.prototype.onTap=function(t){var e=t.target;if("LI"==e.nodeName){this.parent.uiChange();var i=o.indexOf(this.dots,e);this.parent.select(i)}},r.prototype.destroy=function(){this.deactivate()},i.PageDots=r,o.extend(i.defaults,{pageDots:!0}),i.createMethods.push("_createPageDots"),i.prototype._createPageDots=function(){this.options.pageDots&&(this.pageDots=new r(this),this.on("activate",this.activatePageDots),this.on("cellAddedRemoved",this.onCellAddedRemovedPageDots),this.on("deactivate",this.deactivatePageDots))},i.prototype.activatePageDots=function(){this.pageDots.activate()},i.prototype.onCellAddedRemovedPageDots=function(){this.pageDots.setDots()},i.prototype.deactivatePageDots=function(){this.pageDots.deactivate()},i.PageDots=r,i}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/player",["eventEmitter/EventEmitter","eventie/eventie","./flickity"],function(t,i,n){return e(t,i,n)}):"object"==typeof exports?module.exports=e(require("wolfy87-eventemitter"),require("eventie"),require("./flickity")):e(t.EventEmitter,t.eventie,t.Flickity)}(window,function(t,e,i){function n(t){if(this.isPlaying=!1,this.parent=t,r){var e=this;this.onVisibilityChange=function(){e.visibilityChange()}}}var o,r;return"hidden"in document?(o="hidden",r="visibilitychange"):"webkitHidden"in document&&(o="webkitHidden",r="webkitvisibilitychange"),n.prototype=new t,n.prototype.play=function(){this.isPlaying=!0,delete this.isPaused,r&&document.addEventListener(r,this.onVisibilityChange,!1),this.tick()},n.prototype.tick=function(){if(this.isPlaying&&!this.isPaused){this.tickTime=new Date;var t=this.parent.options.autoPlay;t="number"==typeof t?t:3e3;var e=this;this.timeout=setTimeout(function(){e.parent.next(!0),e.tick()},t)}},n.prototype.stop=function(){this.isPlaying=!1,delete this.isPaused,this.clear(),r&&document.removeEventListener(r,this.onVisibilityChange,!1)},n.prototype.clear=function(){clearTimeout(this.timeout)},n.prototype.pause=function(){this.isPlaying&&(this.isPaused=!0,this.clear())},n.prototype.unpause=function(){this.isPaused&&this.play()},n.prototype.visibilityChange=function(){var t=document[o];this[t?"pause":"unpause"]()},i.createMethods.push("_createPlayer"),i.prototype._createPlayer=function(){this.player=new n(this),this.on("activate",this.activatePlayer),this.on("uiChange",this.stopPlayer),this.on("pointerDown",this.stopPlayer),this.on("deactivate",this.deactivatePlayer)},i.prototype.activatePlayer=function(){this.options.autoPlay&&(this.player.play(),e.bind(this.element,"mouseenter",this),this.isMouseenterBound=!0)},i.prototype.stopPlayer=function(){this.player.stop()},i.prototype.deactivatePlayer=function(){this.player.stop(),this.isMouseenterBound&&(e.unbind(this.element,"mouseenter",this),delete this.isMouseenterBound)},i.prototype.onmouseenter=function(){this.player.pause(),e.bind(this.element,"mouseleave",this)},i.prototype.onmouseleave=function(){this.player.unpause(),e.unbind(this.element,"mouseleave",this)},i.Player=n,i}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/add-remove-cell",["./flickity","fizzy-ui-utils/utils"],function(i,n){return e(t,i,n)}):"object"==typeof exports?module.exports=e(t,require("./flickity"),require("fizzy-ui-utils")):e(t,t.Flickity,t.fizzyUIUtils)}(window,function(t,e,i){function n(t){for(var e=document.createDocumentFragment(),i=0,n=t.length;n>i;i++){var o=t[i];e.appendChild(o.element)}return e}return e.prototype.insert=function(t,e){var i=this._makeCells(t);if(i&&i.length){var o=this.cells.length;e=void 0===e?o:e;var r=n(i),s=e==o;if(s)this.slider.appendChild(r);else{var a=this.cells[e].element;this.slider.insertBefore(r,a)}if(0===e)this.cells=i.concat(this.cells);else if(s)this.cells=this.cells.concat(i);else{var l=this.cells.splice(e,o-e);this.cells=this.cells.concat(i).concat(l)}this._sizeCells(i);var c=e>this.selectedIndex?0:i.length;this._cellAddedRemoved(e,c)}},e.prototype.append=function(t){this.insert(t,this.cells.length)},e.prototype.prepend=function(t){this.insert(t,0)},e.prototype.remove=function(t){var e,n,o,r=this.getCells(t),s=0;for(e=0,n=r.length;n>e;e++){o=r[e];var a=i.indexOf(this.cells,o)<this.selectedIndex;s-=a?1:0}for(e=0,n=r.length;n>e;e++)o=r[e],o.remove(),i.removeFrom(this.cells,o);r.length&&this._cellAddedRemoved(0,s)},e.prototype._cellAddedRemoved=function(t,e){e=e||0,this.selectedIndex+=e,this.selectedIndex=Math.max(0,Math.min(this.cells.length-1,this.selectedIndex)),this.emitEvent("cellAddedRemoved",[t,e]),this.cellChange(t,!0)},e.prototype.cellSizeChange=function(t){var e=this.getCell(t);if(e){e.getSize();var n=i.indexOf(this.cells,e);this.cellChange(n)}},e.prototype.cellChange=function(t,e){var i=this.slideableWidth;this._positionCells(t),this._getWrapShiftCells(),this.setGallerySize(),this.options.freeScroll?(this.x+=i-this.slideableWidth,this.positionSlider()):(e&&this.positionSliderAtSelected(),this.select(this.selectedIndex))},e}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/lazyload",["classie/classie","eventie/eventie","./flickity","fizzy-ui-utils/utils"],function(i,n,o,r){return e(t,i,n,o,r)}):"object"==typeof exports?module.exports=e(t,require("desandro-classie"),require("eventie"),require("./flickity"),require("fizzy-ui-utils")):e(t,t.classie,t.eventie,t.Flickity,t.fizzyUIUtils)}(window,function(t,e,i,n,o){function r(t){if("IMG"==t.nodeName&&t.getAttribute("data-flickity-lazyload"))return[t];var e=t.querySelectorAll("img[data-flickity-lazyload]");return o.makeArray(e)}function s(t,e){this.img=t,this.flickity=e,this.load()}return n.createMethods.push("_createLazyload"),n.prototype._createLazyload=function(){this.on("cellSelect",this.lazyLoad)},n.prototype.lazyLoad=function(){var t=this.options.lazyLoad;if(t){for(var e="number"==typeof t?t:0,i=this.getAdjacentCellElements(e),n=[],o=0,a=i.length;a>o;o++){var l=i[o],c=r(l);n=n.concat(c)}for(o=0,a=n.length;a>o;o++){var h=n[o];new s(h,this)}}},s.prototype.handleEvent=o.handleEvent,s.prototype.load=function(){i.bind(this.img,"load",this),i.bind(this.img,"error",this),this.img.src=this.img.getAttribute("data-flickity-lazyload"),this.img.removeAttribute("data-flickity-lazyload")},s.prototype.onload=function(t){this.complete(t,"flickity-lazyloaded")},s.prototype.onerror=function(){this.complete(event,"flickity-lazyerror")},s.prototype.complete=function(t,n){i.unbind(this.img,"load",this),i.unbind(this.img,"error",this);var o=this.flickity.getParentCell(this.img),r=o&&o.element;this.flickity.cellSizeChange(r),e.add(this.img,n),this.flickity.dispatchEvent("lazyLoad",t,r)},n.LazyLoader=s,n}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/index",["./flickity","./drag","./prev-next-button","./page-dots","./player","./add-remove-cell","./lazyload"],e):"object"==typeof exports&&(module.exports=e(require("./flickity"),require("./drag"),require("./prev-next-button"),require("./page-dots"),require("./player"),require("./add-remove-cell"),require("./lazyload")))}(window,function(t){return t}),function(t,e){"function"==typeof define&&define.amd?define("flickity-as-nav-for/as-nav-for",["classie/classie","flickity/js/index","fizzy-ui-utils/utils"],function(i,n,o){return e(t,i,n,o)}):"object"==typeof exports?module.exports=e(t,require("desandro-classie"),require("flickity"),require("fizzy-ui-utils")):t.Flickity=e(t,t.classie,t.Flickity,t.fizzyUIUtils)}(window,function(t,e,i,n){return i.createMethods.push("_createAsNavFor"),i.prototype._createAsNavFor=function(){this.on("activate",this.activateAsNavFor),this.on("deactivate",this.deactivateAsNavFor),this.on("destroy",this.destroyAsNavFor);var t=this.options.asNavFor;if(t){var e=this;setTimeout(function(){e.setNavCompanion(t)})}},i.prototype.setNavCompanion=function(t){t=n.getQueryElement(t);var e=i.data(t);if(e&&e!=this){this.navCompanion=e;var o=this;this.onNavCompanionSelect=function(){o.navCompanionSelect()},e.on("cellSelect",this.onNavCompanionSelect),this.on("staticClick",this.onNavStaticClick),this.navCompanionSelect()}},i.prototype.navCompanionSelect=function(){if(this.navCompanion){var t=this.navCompanion.selectedIndex;this.select(t),this.removeNavSelectedElement(),this.selectedIndex==t&&(this.navSelectedElement=this.cells[t].element,e.add(this.navSelectedElement,"is-nav-selected"))}},i.prototype.activateAsNavFor=function(){this.navCompanionSelect()},i.prototype.removeNavSelectedElement=function(){this.navSelectedElement&&(e.remove(this.navSelectedElement,"is-nav-selected"),delete this.navSelectedElement)},i.prototype.onNavStaticClick=function(t,e,i,n){"number"==typeof n&&this.navCompanion.select(n)},i.prototype.deactivateAsNavFor=function(){this.removeNavSelectedElement()},i.prototype.destroyAsNavFor=function(){this.navCompanion&&(this.navCompanion.off("cellSelect",this.onNavCompanionSelect),this.off("staticClick",this.onNavStaticClick),delete this.navCompanion)},i}),function(t,e){"function"==typeof define&&define.amd?define("imagesloaded/imagesloaded",["eventEmitter/EventEmitter","eventie/eventie"],function(i,n){return e(t,i,n)}):"object"==typeof exports?module.exports=e(t,require("wolfy87-eventemitter"),require("eventie")):t.imagesLoaded=e(t,t.EventEmitter,t.eventie)}(window,function(t,e,i){function n(t,e){for(var i in e)t[i]=e[i];return t}function o(t){return"[object Array]"===d.call(t)}function r(t){var e=[];if(o(t))e=t;else if("number"==typeof t.length)for(var i=0,n=t.length;n>i;i++)e.push(t[i]);else e.push(t);return e}function s(t,e,i){if(!(this instanceof s))return new s(t,e);"string"==typeof t&&(t=document.querySelectorAll(t)),this.elements=r(t),this.options=n({},this.options),"function"==typeof e?i=e:n(this.options,e),i&&this.on("always",i),this.getImages(),c&&(this.jqDeferred=new c.Deferred);var o=this;setTimeout(function(){o.check()})}function a(t){this.img=t}function l(t){this.src=t,u[t]=this}var c=t.jQuery,h=t.console,p="undefined"!=typeof h,d=Object.prototype.toString;s.prototype=new e,s.prototype.options={},s.prototype.getImages=function(){this.images=[];for(var t=0,e=this.elements.length;e>t;t++){var i=this.elements[t];"IMG"===i.nodeName&&this.addImage(i);var n=i.nodeType;if(n&&(1===n||9===n||11===n))for(var o=i.querySelectorAll("img"),r=0,s=o.length;s>r;r++){var a=o[r];this.addImage(a)}}},s.prototype.addImage=function(t){var e=new a(t);this.images.push(e)},s.prototype.check=function(){function t(t,o){return e.options.debug&&p&&h.log("confirm",t,o),e.progress(t),i++,i===n&&e.complete(),!0}var e=this,i=0,n=this.images.length;if(this.hasAnyBroken=!1,!n)return void this.complete();for(var o=0;n>o;o++){var r=this.images[o];r.on("confirm",t),r.check()}},s.prototype.progress=function(t){this.hasAnyBroken=this.hasAnyBroken||!t.isLoaded;var e=this;setTimeout(function(){e.emit("progress",e,t),e.jqDeferred&&e.jqDeferred.notify&&e.jqDeferred.notify(e,t)})},s.prototype.complete=function(){var t=this.hasAnyBroken?"fail":"done";this.isComplete=!0;var e=this;setTimeout(function(){if(e.emit(t,e),e.emit("always",e),e.jqDeferred){var i=e.hasAnyBroken?"reject":"resolve";e.jqDeferred[i](e)}})},c&&(c.fn.imagesLoaded=function(t,e){var i=new s(this,t,e);return i.jqDeferred.promise(c(this))}),a.prototype=new e,a.prototype.check=function(){var t=u[this.img.src]||new l(this.img.src);if(t.isConfirmed)return void this.confirm(t.isLoaded,"cached was confirmed");if(this.img.complete&&void 0!==this.img.naturalWidth)return void this.confirm(0!==this.img.naturalWidth,"naturalWidth");var e=this;t.on("confirm",function(t,i){return e.confirm(t.isLoaded,i),!0}),t.check()},a.prototype.confirm=function(t,e){this.isLoaded=t,this.emit("confirm",this,e)};var u={};return l.prototype=new e,l.prototype.check=function(){if(!this.isChecked){var t=new Image;i.bind(t,"load",this),i.bind(t,"error",this),t.src=this.src,this.isChecked=!0}},l.prototype.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},l.prototype.onload=function(t){this.confirm(!0,"onload"),this.unbindProxyEvents(t)},l.prototype.onerror=function(t){this.confirm(!1,"onerror"),this.unbindProxyEvents(t)},l.prototype.confirm=function(t,e){this.isConfirmed=!0,this.isLoaded=t,this.emit("confirm",this,e)},l.prototype.unbindProxyEvents=function(t){i.unbind(t.target,"load",this),i.unbind(t.target,"error",this)},s}),function(t,e){"function"==typeof define&&define.amd?define(["flickity/js/index","imagesloaded/imagesloaded"],function(i,n){return e(t,i,n)}):"object"==typeof exports?module.exports=e(t,require("flickity"),require("imagesloaded")):t.Flickity=e(t,t.Flickity,t.imagesLoaded)}(window,function(t,e,i){return e.createMethods.push("_createImagesLoaded"),e.prototype._createImagesLoaded=function(){this.on("activate",this.imagesLoaded)},e.prototype.imagesLoaded=function(){function t(t,i){var n=e.getParentCell(i.img);e.cellSizeChange(n&&n.element),e.options.freeScroll||e.positionSliderAtSelected()}if(this.options.imagesLoaded){var e=this;i(this.slider).on("progress",t)}},e});;