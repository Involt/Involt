/*
	INVOLT FRAMEWORK UI ELEMENTS AND UPDATING THEIR VALUE
	Ernest Warzocha 2015
	involt.github.io

	It contains functions which generates Involt UI components, their events and automatic update of read-only elements.
	This file is not required for Involt to work only if you use your own JQuery code and UI.
	Involt pagination is also included here. Involt JQuery methods are in involt.js

	1. Update of read-only elements
	2. Creating UI assets (for UI kit not layout)
	3. Knob and Rangeslider plugins
	4. Involt UI events
	5. Involt layout
*/

//----------------------------------------------------------------------------------------------

//UPDATE OF READ-ONLY ELEMENTS

//Updated in 50ms interval from settings to reduce CPU usage
var analogUpdate = function(){

	//show
	$(".show").each(function() {
		var $t = $(this);
		$t.html(involtReceivedPin[$t.data("pinNumber")]);
	});

	//bar
	$(".bar").each(function() {
		var $t = $(this);
		if (isNaN(involtReceivedPin[$t.data("pinNumber")])) return;
		//map the value to bar pixel width
		var bar = {
			minValue : $t.data('min'),
			maxValue : $t.data('max'),
			maxWidth : parseInt($t.children('.bar-background').css('width'))
		};
		//scaling the css width of active element to total width
		var widthMap = (involtReceivedPin[$t.data("pinNumber")]-bar.minValue)*(bar.maxWidth-0)/(bar.maxValue-bar.minValue)+0;
		//change bar width
		$t.children('.bar-background').children(".bar-value").css('width', widthMap);
		//display the value
		$t.children(".bar-label").css('width', widthMap).html(involtReceivedPin[$t.data("pinNumber")]);
	});

	//knob
	$(".knob").each(function() {
		if (isNaN(involtReceivedPin[$(this).data("pinNumber")])) return;
		$(this).children().children('.knob-read').val(involtReceivedPin[$(this).data("pinNumber")]).trigger('change');
	});

	//value
	$(".value").each(function() {
		var $t = $(this);
		$t.attr('value', involtReceivedPin[$t.data("pinNumber")]);
	});

};

setInterval(analogUpdate, updateRate);

//----------------------------------------------------------------------------------------------

//CREATE HTML ELEMENTS REQUIRED FOR UI KIT

Involt.prototype.createUiAssets = function($t){
	//bar
	if($t.hasClass('bar')){
		$t.append('<div class="bar-label">0</div><div class="bar-background"><div class="bar-value"></div></div>');
		$t.children('.bar-background').children('.bar-value').css('max-width', parseInt($t.children('.bar-background').css('width')));
		$t.children('.bar-label').css('max-width', parseInt($t.css('width')));
	};

	//knob
	if($t.hasClass('knob')){
		$t.append(function() {
			var knobMax  = $t.data('max');
			var knobMin  = $t.data('min');
			if($t.hasClass('proto')){
				$t.append('<input type="text" data-width="140" data-height="140" data-fgColor="black" data-inputColor="#363636" data-bgColor="#e5e5e5" data-max="'+knobMax+'" data-min="'+knobMin+'" data-readOnly="true" value="0" class="knob-read">'); 
			}
			else{
				$t.append('<input type="text" data-width="140" data-height="140" data-fgColor="#0064fa" data-inputColor="#363636" data-bgColor="#e5e5e5" data-max="'+knobMax+'" data-min="'+knobMin+'" data-readOnly="true" value="0" class="knob-read">'); 
			};
			$t.children('.knob-read').data($t.data());
		});

		$(function() {
			$t.children(".knob-read").knob();
		});
	};

	//knob-send
	if($t.hasClass('knob-send')){
		if($t.hasClass('proto')){
			$t.append('<input type="text" data-width="140" data-height="140" data-fgColor="black" data-inputColor="#363636" data-bgColor="#e5e5e5" data-displayPrevious="false" data-angleOffset="-140" data-angleArc="280" class="knob-write">'); 
		}
		else{
			$t.append('<input type="text" data-width="140" data-height="140" data-fgColor="#0064fa" data-inputColor="#282828" data-bgColor="#e5e5e5" data-displayPrevious="false" data-angleOffset="-140" data-angleArc="280" class="knob-write">'); 
		};
		involt.knobSendCreate($t);
	};

	//rangeslider
	if($t.hasClass('rangeslider')){
		$t.append('<div class="label"></div><div class="tooltip">slide</div><div class="slider"></div>');
		involt.rangesliderCreate($t);
	};

	//increase/decrease + and - when empty text
	if($t.hasClass('increase')){
		if($t.html() == '') $t.html("+").css('font-size', '30px');
	};
	if($t.hasClass('decrease')){
		if($t.html() == '') $t.html("-").css('font-size', '30px');
	};

	//toggle ON/OFF when empty
	if($t.hasClass('toggle')){
		if ($t.data("value") == 0){
			if($t.html() == '') $t.html("OFF").addClass('inactive');
		}
		else if ($t.data("value") == 1){
			if($t.html() == '') $t.html("ON");
		};
	};  

	if($t.hasClass('switch')){
		$t.append('<div class="switch-track"><div class="switch-handle"></div></div>');
		if($t.hasClass('active')){
			$t.children('.switch-track').children('.switch-handle').addClass('active');
		};
	};

};

//----------------------------------------------------------------------------------------------

//JQUERY KNOB PLUGIN

Involt.prototype.knobSendCreate = function($t){
	//definePin will not work
	var index = $t.data("pinNumber");
	var currentValue = $t.data("value");
	var max = $t.data("max");

	//prevents from buffer overload issue
	var isFluid = false;
	if ($t.hasClass('fluid')) isFluid = true;

	$t.children('.knob-write').val(currentValue).data($t.data());

	$t.children('.knob-write').knob({
		'min':  $t.data("min"),
		'max':  max,
		'step': $t.data("step"),
		'change' : function (value) {
			if(isFluid){
				//prevent from sending duplicated values when step is higher than 1
				if (involtPin[index] !== this.cv){
					if (this.cv <= max){
						involtPin[index] = this.cv;
						if ($t.parent("form").length == 0) $t.sendValue();
					}
					else {
						involtPin[index] = max;
					};
				};
			};
	},
	'release' : function (value){
		if (involtPin[index] !== value){
			if (value <= max){
				involtPin[index] = value;
			}
			else {
				involtPin[index] = max;
			};
			if ($t.parent("form").length == 0) $t.sendValue(); 
		};
		if ($t.parent("form").length == 0) $t.sendFn()
	}
});

};

//----------------------------------------------------------------------------------------------

//JQUERY SLIDER PLUGIN

Involt.prototype.rangesliderCreate = function($t){

	var $slider = $t.children('.slider');
	var $tooltip = $slider.siblings('.tooltip');
	
	//prevents from buffer overload issue
	var isFluid = false;
	if ($t.hasClass('fluid')) isFluid = true;

	$tooltip.html($t.data('value')).hide();
	$slider.siblings('.label').html($t.data('value'));

	$slider.noUiSlider({
		start: [$t.data("value")],
		range: {
			'min': [$t.data("min")],
			'max': [$t.data("max")]
		},
		step: $t.data("step")
	});
	
	$slider.on({
		slide: function(){
			var cssPos = $slider.children('.noUi-base').children('.noUi-origin').css('left');
			var val = parseInt($slider.val());
			$tooltip.css('left',cssPos).html(val);
			$slider.siblings('.label').html(val);
			$tooltip.fadeIn(100);
			if(isFluid){
				involtPin[$t.data("pinNumber")] = val;
				if ($t.parent("form").length == 0) involt.arduinoSend($t.data("pin"), val);
			};
		},
		set: function(){
			var val = parseInt($slider.val());
			$tooltip.fadeOut(500);
			involtPin[$t.data("pinNumber")] = val;
			involt.arduinoSend($t.data("pin"), val);
			if ($t.parent("form").length == 0) $t.sendFn();
			
		}
	});

	$t.hover(function() {
		$tooltip.css('left', $slider.children('.noUi-base').children('.noUi-origin').css('left'));
		$tooltip.fadeIn(250);
	}, function() {
		$tooltip.fadeOut(250);
	});

};

//----------------------------------------------------------------------------------------------

//INVOLT UI EVENTS

$(document).ready(function() {

	//button
	$(document).on("click",".ard.button",function() {
		$(this).updateValue().sendValue();
	});

	//button-toggle
	$(document).on("click",".ard.button-toggle",function() {
		var $t = $(this);
		var values = $t.data("value");
		$t.toggleClass('state2');

		if ($t.hasClass('state2')) {
			$t.updateValue(values[1]).sendValue();
		}
		else {
			$t.updateValue(values[0]).sendValue();       
		};
	});

	//toggle
	$(document).on("click",".ard.toggle",function() {
		var $t = $(this);

		$t.toggleClass('inactive');
		if ($t.hasClass('inactive')){
			involtPin[$t.data('pinNumber')] = 0;
			$t.html("OFF");
		}
		else {
			involtPin[$t.data('pinNumber')] = 1;
			$t.html("ON");
		};

		$t.sendValue();
		
	});

	//switch
	$(document).on("click",".ard.switch",function() {
		var $t = $(this);
		var $handle = $t.children('.switch-track').children('.switch-handle');
		var values = $t.data('value');
		$handle.toggleClass('active');

		if ($handle.hasClass('active')) {
			$t.updateValue(values[1]).sendValue();
		}
		else {
			$t.updateValue(values[0]).sendValue();       
		};  

	});

	//increase
	$(document).on("click",".ard.increase",function() {
		var $t = $(this);
		var index = $t.data("pinNumber");

		involtPin[index] = involtPin[index] + $t.data("step");
		involtPin[index] = Math.min(Math.max(involtPin[index], $t.data("min")), $t.data("max"));
		$t.sendValue(); 
	});

	//decrease
	$(document).on("click",".ard.decrease",function() {
		var $t = $(this);
		var index = $t.data("pinNumber");

		involtPin[index] = involtPin[index] - $t.data("step");
		involtPin[index] = Math.min(Math.max(involtPin[index], $t.data("min")), $t.data("max"));
		$t.sendValue(); 
	});

	//hover
	$(document).on({
		mouseenter: function () {
			var $t = $(this);
			var values = $t.data("value");
			$t.updateValue(values[1]).sendValue();
		},
		mouseleave: function () {
			var $t = $(this);
			var values = $t.data("value");
			$t.updateValue(values[0]).sendValue();
		}
	}, ".ard.hover");

	//custom-button
	$(document).on("click",".ard.custom-button",function() {
		var customBut = $(this).data("pin");
		involt.send(customBut+"\n");
		$(this).sendFn();
	});

	//input-write
	$(document).on("change",".ard.input-write",function() {
		var $t = $(this);
		var value = $t.val();
		if(!isNaN(value)) value = parseInt(value);		
		$t.updateValue(value);
		if ($t.parent("form").length == 0) $t.sendValue();
	});

	//custom-write
	$(document).on("change",".ard.custom-write",function() {
		var valCustom = $(this).val();
		var valCustomSend = valCustom+"\n";
		if ($(this).parent("form").length == 0){
			involt.send(valCustomSend);
			$(this).sendFn();
		};
	});

	//checkbox
	$(document).on("change",".ard.checkbox",function() {
		var $t = $(this);
		var values = $t.data("value");
		if (this.checked) {
			$t.updateValue(values[1]);
		}
		else {
			$t.updateValue(values[0]);
		};
		if ($t.parent("form").length == 0) $t.sendValue();
	});

	//radio 
	$(document).on("change",".ard.radio",function() {
		var $t = $(this);
		if (this.checked) {
			$t.updateValue();
			if ($t.parent("form").length == 0) $t.sendValue();
		};
	});

	$(document).on("change",".ard.involt-input",function(){
		var $t = $(this);
		var value = $t.val();
		if (!isNaN(value)) value = parseInt(value);
		$t.updateValue(value);
		if ($t.parent("form").length == 0) $t.sendValue();
	});

	//form submit button
	$(document).on("click",".ard.submit-button", function(){
		var $t = $(this);
		if($t.parent("form").length>0){
			$t.siblings('.ard.involt-input').each(function() {
				var value = $(this).val();
				if (!isNaN(value)) value = parseInt(value);
				$(this).updateValue(value).sendValue();
			});
			$t.siblings('.ard.custom-write').each(function() {
				$(this).sendString($(this).val()+'\n');
			});
			$t.siblings('.ard.knob-send,.ard.rangeslider,.ard.checkbox').each(function() {
				$(this).sendValue();
			});
			$t.siblings('.ard.radio').each(function() {
				if(this.checked){
					$(this).sendValue();
				};
			});
		};
		$t.sendFn($t.attr('fn'));
	});


//----------------------------------------------------------------------------------------------

	//INVOLT LAYOUT / PAGINATION SYSTEM

	var involtLayout = function(){

		//bar in main navigation header
		var $barInHeader = $(".involt-header").children('.involt-appbar');
		var $nav = $(".involt-nav");
		var $linksInNav = $nav.children('.involt-pagelink');

		//Navigation bar positioning depending on its dimensions;
		var navHeight = parseInt($nav.css('height'));
		var appBarHeight = parseInt($barInHeader.css('height'));
		var totalHeaderHeight = 0;


		
		if($barInHeader.length > 0 ){
			totalHeaderHeight = totalHeaderHeight + appBarHeight;
		};

		if($nav.hasClass('bottom')){
			$(".involt-page").css('bottom', navHeight+'px');
		}
		else{
			if ($(".involt-header").children('.involt-nav').length == 1){
				totalHeaderHeight = totalHeaderHeight + navHeight;
			};
		};

		$(".involt-page").css('top', totalHeaderHeight+'px');

		//same but for fullpage
		$(".involt-fullpage").each(function() {
			if($(this).children('.involt-appbar').length == 1){
				var fullHeaderHeight = parseInt($(this).children('.involt-appbar').css('height'));
				$(this).css('padding-top', fullHeaderHeight + 10 +'px');
			};
		});

		//Define which page is home page and show it on startup.
		var homelink = $(".home").attr('page');
		var countLinks = $linksInNav.length;

		$linksInNav.each(function() {
			if($(this).attr('href') == '#'+ homelink){
				$(this).addClass('active');
			};
			//calculate width of each link in tab menu
			$(this).css('width', 100/countLinks+'%');
		});

		if($barInHeader.length > 1){
			$barInHeader.each(function() {
				if($(this).attr('page') == homelink) $(this).show();
			});
		}
		else{
			$barInHeader.show();
		};

		//toggle between pages

		$(document).on("click","a.involt-pagelink", function(event){
			event.preventDefault();
			var $t = $(this);
			var $openPage;
			var $pageHeader;
			var isMultipleHeader = false;
			var isFullPage = false;
			var linkRaw = $t.attr('href');
			var link = linkRaw.substring(1,linkRaw.length)

			//check the page type
			$(".involt-page,.involt-fullpage").each(function() {
				if($(this).attr('page') == link){
					$openPage = $(this);
					if($openPage.hasClass('involt-fullpage')) {
						isFullPage = true;
					}
					else{
						$(".involt-fullpage,.involt-page").hide();
					};
				};
			});

			//are there more than one header in main navigation level?
			if($barInHeader.length > 1) isMultipleHeader = true;

			//switch between tabs and switch header
			if(!isFullPage){
				$linksInNav.removeClass('active');
				if($t.parent(".involt-nav").length > 0) $t.addClass('active');
				if (isMultipleHeader){
					$('.involt-header').children('.involt-appbar').each(function() {
						$(this).hide();
						if($(this).attr('page') == link){
							$pageHeader = $(this);
						};
					});
					$pageHeader.show();
				};
			};

			if($t.parents(".involt-sidemenu").length > 0){
				$(".involt-dialog, .involt-sidemenu").hide();
				$(".involt-dialogbackground").remove();
			};
			
			//active link when returned from fullpage to main tab
			$linksInNav.each(function() {
				if($(this).attr('href') == linkRaw){
					$(this).addClass('active');
				};
			});

			//show the page
			$openPage.show();

		});

		//make sure to hide all dialogs
		$(".involt-dialog").hide();

		//open dialog
		$(document).on("click","a.involt-showdialog", function(event){
			event.preventDefault();
			var link = $(this).attr('href');

			$(".involt-dialog").each(function() {
				if($(this).attr('page') == link.substring(1,link.length)){
					$(this).show();
				};
			});

			$("body").prepend('<div class="involt-dialogbackground"></div>');
			
		});

		//hide dialog when clicked on background
		$(document).on("click",".involt-dialogbackground", function(event){
			$(".involt-dialog, .involt-sidemenu").hide();
			$(this).remove();
		});

		//hide dialog when clicked on hidedialog button
		$(document).on("click","a.involt-hidedialog", function(event){
			event.preventDefault();
			$(".involt-dialog").hide();
			$(".involt-dialogbackground").remove();
		});

		//hide the fullscreen page (fake back)
		$(document).on("click","a.involt-fullback", function(event){
			event.preventDefault();
			var pageToHide = $(this).attr('href');
			var $pageHide;

			$(".involt-fullpage").each(function() {
				if($(this).attr('page') == pageToHide.substring(1,pageToHide.length)){
					$pageHide = $(this);
				};
			});
			$pageHide.hide();
		});

		//show the side menu
		$(document).on("click","a.involt-sidemenulink", function(event){
			event.preventDefault();
			$(".involt-sidemenu").show();
			$("body").prepend('<div class="involt-dialogbackground"></div>');
		});

		$(document).on("click",".involt-cta", function(event){
			$(this).sendFn($(this).attr('fn'));
		});

		//show the input tooltip on mobile (good when keyboard hid the input)
		if(involt.isMobile){
			$(document).on('focus', 'input:text', function(event) {
				$("body").append('<input type="text" class="involt-mobileinput">');
				$(".involt-mobileinput").val($(this).val());
				if($nav.hasClass('bottom')) {
					$nav.hide();
					$(".involt-page").css('bottom', 0);
				};
			});
			$(document).on('blur', 'input:text', function(event) {
				$(".involt-mobileinput").remove();
				if($nav.hasClass('bottom')) {
					$nav.show();
					$(".involt-page").css('bottom', navHeight+"px");
				};
			});
			$(document).on('keyup', 'input:text', function(event) {
				$(".involt-mobileinput").val($(this).val())
			});
		};

	};

	//Create the assets and bind events when layout is used
	if($(".involt-header,.involt-pagelink,.involt-page,.involt-fullpage,.involt-sidemenu").length > 0){
		involt.debug("Loading Involt Layout assets");
		involtLayout();
	};

});