/*
	DEFINE FRAMEWORK ELEMENTS AND THEIR EVENTS

	Also contains JQuery methods and update of read-only elements.
*/

var defineElement = function($t){

	var involtElement = {
		name: null,
		pin: null,
		value: 0,
		range: null,
		min: 0,
		max: 255,
		step: 1,
		fn: null
	};

	var classes = $t.attr('class').trim().split(' ');
	var ardIndex = classes.indexOf('ard');
	involtElement.name = classes[ardIndex+1];

	if(['bar','knob'].indexOf(involtElement.name) > -1) involtElement.max = 1024;

	var searchInClasses = function(name){
		return name.startsWith(prop+'-');
	};

	var defineValue = function(data){
		if(Array.isArray(data)){
			for(var i=0; i<data.length; i++){
				if(!isNaN(data[i])) data[i] = parseInt(data[i]);
			};
			if(data.length == 1) data = data[0];
		}
		else{
			if(!isNaN(data)) data = parseInt(data);
		}

		return data;
	};

	for(prop in involtElement){

		if(typeof $t.attr(prop) !== 'undefined') involtElement[prop] = defineValue($t.attr(prop));
		else {

			var propInClass = classes.find(searchInClasses);

			if(typeof propInClass !== 'undefined'){
				var classData = propInClass.split('-');
				classData.shift();
				involtElement[prop] = defineValue(classData);
			};
		};

	};

	if(involtElement.range != null){
		involtElement.min = involtElement.range[0];
		involtElement.max = involtElement.range[1];
	};

	//This element requires only the fn
	if(involtElement.name == 'button-cta' || involtElement.name == 'involt-submit'){
		$t.data('fn', involtElement.fn);
		return;
	};

	//Define pin from class after the name not attr/pin-
	if(involtElement.pin == null){
		involtElement.pin = classes[ardIndex+2];
	};

	involtElement.pinType = involtElement.pin[0];
	involtElement.pinNumber = parseInt(involtElement.pin.substring(1,involtElement.pin.length));

	//Shorthand single value from old syntax
	if(!isNaN(classes[ardIndex+3])){
		involtElement.value = parseInt(classes[ardIndex+3]);
	};

	//Values for toggle when it's not defined
	if(involtElement.name == "toggle" || $t.attr('type') == 'checkbox' || involtElement.name == "hover" || involtElement.name == "switch"){
		if(involtElement.value == 0) involtElement.value = [0,1];
		if(typeof involtElement.value === 'number') involtElement.value = [0,involtElement.value];
	};

	if($t.is('input')){
		var dataToAttribute = {
			min: involtElement.min,
			max: involtElement.max,
			step: involtElement.step		
		};
		if(!$t.attr('placeholder')) dataToAttribute.value = involtElement.value;
		$t.attr(dataToAttribute);
	}
	else if($t.is('select')){
		$t.children('option').each(function() {
			if(this.selected) {
				involtElement.value = $(this).val();
			};		
		});

		if(!isNaN(involtElement.value)) involtElement.value = parseInt(involtElement.value);
	};

	$t.data(involtElement);
	//console.log(involtElement.name, involtElement);
	involt.debug(involtElement.name, involtElement);
	
	//Add beginning values to pin array (if there are on/off values put the inactive state as default)
	if(involtElement.pinType == 'P'){
		if (typeof involtElement.value !== 'object') involt.pin.P[involtElement.pinNumber] = involtElement.value;
		else involt.pin.P[involtElement.pinNumber] = involtElement.value[0];
	}
	else if(involtElement.pinType == 'S'){
		if (typeof involtElement.value !== 'object') involt.pin.S[involtElement.pinNumber] = involtElement.value;
		else involt.pin.P[involtElement.pinNumber] = involtElement.value[0];
	}
	else if(involtElement.pinType == 'A'){
		involt.pin.A[involtElement.pinNumber] = involtElement.value;
	};

	//Generate UI additional assets
	if(involtElement.name == 'knob'){
		involtElement.readOnly = true;
		if(typeof $t.data('fgcolor') === 'undefined') involtElement.fgColor = "#00baff";
		if(typeof $t.data('bgcolor') === 'undefined') involtElement.bgColor = "#e5e5e5";
		if(typeof $t.data('inputcolor') === 'undefined') involtElement.inputColor = "#363636";
		$t.knob(involtElement);	
	}
	else if(involtElement.name == 'knob-send'){
		if(typeof $t.data('displayprevious') === 'undefined') involtElement.displayPrevious = true;
		if(typeof $t.data('angleoffset') === 'undefined') involtElement.angleOffset = -140;
		if(typeof $t.data('anglearc') === 'undefined') involtElement.angleArc = 280;
		if(typeof $t.data('fgcolor') === 'undefined') involtElement.fgColor = "#00baff";
		if(typeof $t.data('bgcolor') === 'undefined') involtElement.bgColor = "#e5e5e5";
		if(typeof $t.data('inputcolor') === 'undefined') involtElement.inputColor = "#363636";

		if(classes.indexOf('fluid')>=0){
			involtElement.change = function(){
				var index = $t.data("pinNumber");
				var max = $t.data("max");

				if (involt.pin.P[index] !== this.cv){
					if (this.cv <= max){
						involt.pin.P[index] = this.cv;
						if ($t.parents("form").length == 0) $t.sendValue();
					}
					else {
						involt.pin.P[index] = max;
					};
				};	
			};
		};
		
		involtElement.release = function(value){
			var index = $t.data("pinNumber");
			var max = $t.data("max");

			if (involt.pin.P[index] !== value){
				if (value <= max){
					involt.pin.P[index] = value;
				}
				else {
					involt.pin.P[index] = max;
				};
				if ($t.parents("form").length == 0) $t.sendValue(); 
			};
			if ($t.parents("form").length == 0) $t.sendFn();
		};

		$t.knob(involtElement);	
	}
	else if(involtElement.name == 'bar'){
		$t.append('<div class="bar-label">0</div><div class="bar-background"><div class="bar-value"></div></div>');
		$t.children('.bar-background').children('.bar-value').css('max-width', parseInt($t.children('.bar-background').css('width')));
		$t.children('.bar-label').css('max-width', parseInt($t.css('width')));
	}
	else if(involtElement.name == 'rangeslider'){
		$t.append('<div class="label"></div><div class="tooltip">slide</div><div class="slider"></div>');
		
		var $slider = $t.children('.slider');
		var $tooltip = $slider.siblings('.tooltip');
		var $label = $slider.siblings('.label');
		
		var isFluid = $t.hasClass('fluid');
		var isLabel = $t.hasClass('label-constant');

		if(isLabel) {
			$tooltip.remove();
			$label.html(involtElement.value);
		}
		else {
			$label.remove();
			$tooltip.html(involtElement.value);
			$tooltip.hide();

			$t.hover(function() {
				$tooltip.css('left', $slider.children('.noUi-base').children('.noUi-origin').css('left'));
				$tooltip.fadeIn(250);
			}, function() {
				$tooltip.fadeOut(250);
			});
		};

		$slider.noUiSlider({
			start: [involtElement.value],
			range: {
				'min': [involtElement.min],
				'max': [involtElement.max]
			},
			step: involtElement.step
		});

		$slider.on({
			slide: function(){ 
				var position = $slider.children('.noUi-base').children('.noUi-origin').css('left');
				var val = parseInt($slider.val());

				if(isLabel){
					$label.html(val);
				}
				else{
					$tooltip.css('left', position).html(val);
				};

				if(isFluid){
					involt.pin.P[$t.data("pinNumber")] = val;
					if ($t.parents("form").length == 0) involt.send($t.data("pin"), val);
				};

			},
			set: function(){
				var val = parseInt($slider.val());

				involt.pin.P[$t.data("pinNumber")] = val;
				if(!isFluid) involt.send($t.data("pin"), val);
				if($t.parents("form").length == 0) $t.sendFn();
			}
		});
	}
	else if(involtElement.name == 'switch'){
		$t.append('<div class="switch-track"><div class="switch-handle"></div></div>');
		if($t.hasClass('active')){
			$t.children('.switch-track').children('.switch-handle').addClass('active');
		};
	};

};

//INVOLT JQUERY METHODS

(function($) {

	//Send name of function to trigger it in arduino
	$.fn.sendFn = function(name) {

		return this.each(function() {
			var $t = $(this);

			if(typeof name === 'undefined'){
				if($t.data('fn') != null){
					involt.sendFunction($t.data('fn'));
				};
			}
			else {
				involt.sendFunction(name);
			};

		});

	};
	
	//Send the value for pin related to UI element pin, if no value defined - send the value defined in array
	$.fn.sendValue = function(value){

		return this.each(function() {
			var $t = $(this);

			if(typeof value === 'undefined'){
				involt.send($t.data('pin'), involt.pin[$t.data('pinType')][$t.data("pinNumber")]);
			}
			else{
				involt.send($t.data('pin'), value);
			};

			$t.not('.knob-send, .rangeslider').sendFn();

		});	

	};

	//Update the value related to target pin, if nothing is defined the pin value will be data of UI element
	$.fn.updateValue = function(newValue, updateElement){

		return this.each(function() {
			var $t = $(this);

			if(typeof newValue === 'undefined'){
				involt.pin[$t.data("pinType")][$t.data("pinNumber")] = $t.data("value");
			}
			else{
				if(!isNaN(newValue)) newValue = parseInt(newValue); 
				involt.pin[$t.data("pinType")][$t.data("pinNumber")] = newValue;
			};

			if(typeof updateElement !== 'undefined'){
				if(updateElement){
					$t.data("value", newValue);

					if($t.is('input')){
						$t.val(newValue);
					};
				};
			};

		});

	};

	//Define the pin of UI element
	$.fn.pinDefine = function(pin){

		return this.each(function() {

			var $t = $(this);
			$t.data("pin", pin);
			$t.data("pinType", pin[0]);
			$t.data("pinNumber", parseInt(pin.substring(1,pin.length)));

		});

	};

	//Change target pin and if there is undefined value - move the previous value
	$.fn.pinSwap = function(newPin){

		return this.each(function() {

			var $t = $(this);
			var $oldPin = $t.data("pinNumber");

			$t.data("pin", newPin);
			$t.data("pinType", newPin[0]);
			$t.data("pinNumber", parseInt(newPin.substring(1,newPin.length)));

			var $pinType = $t.data("pinType");

			if(typeof involt.pin[$pinType][$t.data("pinNumber")] === 'undefined') {
				involt.pin[$pinType][$t.data("pinNumber")] = involt.pin[$pinType][$oldPin];
			};

		}); 

	};

	// Mix of update and sendValue - it defines the value and send it for previously defined pin or also define pin
	$.fn.sendAndUpdate = function(pin, value){

		return this.each(function(){
			$(this).pinDefine(pin).updateValue(value, true).sendValue();
		});

	};

	//Send raw string directly to device
	$.fn.sendRawString = function(string){

		return this.each(function() {
			involt.sendToDevice(string+"\n");
		});

	};

}(jQuery));

$(document).ready(function() {

	//DEFINE FRAMEWORK ELEMENTS FROM CSS CLASSES
	involt.debug("Involt UI generated elements:");
	$(".ard").each(function(index, el) {
		defineElement($(this));
	});

	/*
		INSERTION QUERY
		Additional plugin for listening to new dom elements.
		With this plugin Involt fully appends new framework elements.
	*/
	insertionQ('.ard').every(function(element){
		element = $(element);
		defineElement(element);
	});	

	//button
	$(document).on("click",".ard.button",function(){
		$(this).updateValue().sendValue();
	});

	//toggle
	$(document).on("click",".ard.toggle",function(){
		var $t = $(this);
		var $values = $t.data("value");
		$t.toggleClass('active');

		if ($t.hasClass('active')) $t.updateValue($values[1]).sendValue();
		else $t.updateValue($values[0]).sendValue();
	});

	//switch
	$(document).on("click",".ard.switch",function(){
		var $t = $(this);
		var $handle = $t.children('.switch-track').children('.switch-handle');
		var $values = $t.data("value");
		$handle.toggleClass('active');

		if ($handle.hasClass('active')) $t.updateValue($values[1]).sendValue();
		else $t.updateValue($values[0]).sendValue();
	});	

	//increase
	$(document).on("click",".ard.increase",function() {
		var $t = $(this);
		var index = $t.data("pinNumber");

		involt.pin.P[index] = involt.pin.P[index] + $t.data("step");
		involt.pin.P[index] = Math.min(Math.max(involt.pin.P[index], $t.data("min")), $t.data("max"));
		$t.sendValue(); 
	});

	//decrease
	$(document).on("click",".ard.decrease",function() {
		var $t = $(this);
		var index = $t.data("pinNumber");

		involt.pin.P[index] = involt.pin.P[index] - $t.data("step");
		involt.pin.P[index] = Math.min(Math.max(involt.pin.P[index], $t.data("min")), $t.data("max"));
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

	//handle checkbox dual value behaviour
	$(document).on("change",".ard.involt-input[type='checkbox']",function(){
		var $t = $(this);
		var $checkboxValue = $t.data('value');

		if(this.checked) $t.updateValue($checkboxValue[1]);
		else $t.updateValue($checkboxValue[0]);
	
		if($t.parents("form").length == 0) $t.sendValue();
	});

	//handle html inputs
	$(document).on("change",".ard.involt-input",function(){
		var $t = $(this);

		if($t.attr('type') == 'checkbox') return;

		var $value = $t.val();

		if(!isNaN($value)) $value = parseInt($value);

		$t.data('value', $value);
		$t.updateValue();

		if($t.parents("form").length == 0) $t.sendValue();
	});

	//handle inputs in form when submitted
	$(document).on("click",".ard.involt-submit",function(){
		var $t = $(this);
		var $form = $t.parents("form");

		$form.find('input.ard, select.ard, .ard.knob-send, .ard.rangeslider').not(".involt-submit").each(function() {

			var $input = $(this);
			var $inputType = $input.attr('type');

			if(['text','number','range'].indexOf($inputType) >-1 || $input.is('select')){
				if($input.val() != '') $input.sendValue($input.val());
			}
			else if($inputType == 'checkbox'){
				var $checkboxValue = $input.data('value');
				if(this.checked) $input.sendValue($checkboxValue[1]);
				else $input.sendValue($checkboxValue[0]);
			}
			else if($inputType == 'radio'){
				if(this.checked) $input.sendValue();
			};

			if($input.hasClass("knob-send")){
				$input.sendValue();
			}
			else if($input.hasClass('rangeslider')){
				$input.sendValue();
			};

		});

		$t.sendFn();
	});

	//button that only sends function
	$(document).on("click",".ard.button-cta",function(){
		$(this).sendFn();
	});


});

var analogUpdate = function(){

	//show
	$(".ard.show").each(function() {
		var $t = $(this);
		$t.html(involt.pin.A[$t.data("pinNumber")]);
	});

	//bar
	$(".ard.bar").each(function() {
		var $t = $(this);
		if (isNaN(involt.pin.A[$t.data("pinNumber")])) return;
		//map the value to bar pixel width
		var bar = {
			minValue : $t.data('min'),
			maxValue : $t.data('max'),
			maxWidth : parseInt($t.children('.bar-background').css('width'))
		};
		//scaling the css width of active element to total width
		var widthMap = (involt.pin.A[$t.data("pinNumber")]-bar.minValue)*(bar.maxWidth-0)/(bar.maxValue-bar.minValue)+0;
		//change bar width
		$t.children('.bar-background').children(".bar-value").css('width', widthMap);
		//display the value
		$t.children(".bar-label").css('width', widthMap).html(involt.pin.A[$t.data("pinNumber")]);
	});

	//knob
	$(".ard.knob").each(function() {
		if (isNaN(involt.pin.A[$(this).data("pinNumber")])) return;
		$(this).val(involt.pin.A[$(this).data("pinNumber")]).trigger('change');
	});

	//value
	$(".ard.value").each(function() {
		var $t = $(this);
		$t.attr('value', involt.pin.A[$t.data("pinNumber")]);
		$t.data("value", involt.pin.A[$t.data("pinNumber")]);
	});

};

setInterval(analogUpdate, updateRate);