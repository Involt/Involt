/*
		INVOLT FRAMEWORK CORE FILE
		Ernest Warzocha 2015
		involt.github.io
*/

//----------------------------------------------------------------------------------------------

//Array of values stored for sending to device with Involt functions and HTML elements.
var digitalPins = [];
//Array of values received from device.
var analogPins = [];
//Custom function to trigger when its name is called from arduino. Create own file to add them and include in this object.
var involtFunctions = {};

//MAIN INVOLT OBJECT (COMMUNICATION BRIDGE)

var Involt =  function (){
	this.id = 0;
	this.devices = [];
	this.previousConnections = [];
	this.onSend =  function(){
		involt.debug(digitalPins);
	};
	this.onError = function (errorInfo) {
		console.error("Received error on connection: " + errorInfo.error);
	};
	//involt.arduinoSend is responsible for sending the data, involt.send is used to send as specified connection type.
	this.arduinoSend = function(pin, value){
		//convert pin and value to framework-friendly format
		var ardSend = pin+"V"+value+"\n";
		involt.send(ardSend);
	};
	this.arduinoFn = function(functionName){
		var sendFunction = "F" + functionName + "\n";
		involt.debug("Triggered function:" + functionName);
		involt.send(sendFunction);
	};
	this.defineElement = function($t){

		var involtElement = {};
		//split the classes to array
		var classes = $t.attr('class').split(' ');
		var ardIndex = classes.indexOf("ard");

		//define target pin
		involtElement.pin = classes[ardIndex+2];
		involtElement.pinNumber = parseInt(classes[ardIndex+2].substring(1,classes[ardIndex+2].length));

		var value, value2;

		//search for involt parameters in classes
		for(var i = 0; i < classes.length; i++){
			//value
			if (classes[i].indexOf("value-") == 0) {
				var valueSplit = classes[i].split('-');
				if(valueSplit.length == 2){
					value = valueSplit[1];
					if (!isNaN(valueSplit[1])){
						value = parseInt(value);
					};
				}
				else if(valueSplit.length == 3){
					value = valueSplit[1];
					involtElement.value2 = valueSplit[2];
					if (!isNaN(valueSplit[1])){
						value = parseInt(value);
					};
					if (!isNaN(valueSplit[2])){
						involtElement.value2 = parseInt(involtElement.value2);
					};
				};
			}
			//range
			else if (classes[i].indexOf("range-") == 0) {
				var range = classes[i].split('-');
					involtElement.min = parseInt(range[1]);
					involtElement.max = parseInt(range[2]);
			}
			//step
			else if (classes[i].indexOf("step-") == 0) {
				var step = classes[i].split('-');
					involtElement.step = parseInt(step[1]);
			}
			//function
			else if (classes[i].indexOf("fn-") == 0) {
				var fn = classes[i].split('-');
					involtElement.fn = fn[1];
			};
		};
		

		//define default parameters
		var uiName = classes[ardIndex+1];

		if(uiName == 'rangeslider' || uiName == 'knob-send' || uiName == 'increase' || uiName == 'decrease'){
			if(typeof min === 'undefined'){
				involtElement.min = 0;
			};
			if(typeof max === 'undefined'){
				involtElement.max = 255;
			};
			if(typeof step === 'undefined'){
				involtElement.step = 1;
			};
			if(typeof value === 'undefined'){
				value = 0;
				digitalPins[involtElement.pinNumber] = 0;
			};
		};

		if(uiName == 'bar' || uiName == 'knob' ){
			value = 0;
			if(typeof min === 'undefined'){
				involtElement.min = 0;
			};
			if(typeof max === 'undefined'){
				involtElement.max = 1024;
			};
		};
		
		if(typeof $t.attr('string') !== 'undefined'){
			value = $t.attr('string');
		};

		if(typeof $t.attr('value') !== 'undefined'){
			value = $t.val();
			if (!isNaN(value)){
				value = parseInt(value);
			};
		};

		if(involtElement.pin.indexOf('A')<0){
			digitalPins[involtElement.pinNumber] = value;
		}
		else{
			analogPins[involtElement.pinNumber] = value;
		};

		involtElement.value = value;
		$t.data(involtElement);

		//HTML GENERATED ELEMENTS OF FRAMEWORK
		  
		//html/css operations that create framework objects in html file 
		//bar
		if($t.hasClass('bar')){
			$t.append('<div class="bar-label">0</div><div class="bar-background"><div class="bar-value"></div></div>');
			$t.children('.bar-background').children('.bar-value').css('max-width', parseInt($t.children('.bar-background').css('width')));
		};

		//knob
		if($t.hasClass('knob')){
			$t.append(function() {
				var knobMax  = $t.data('max');
				var knobMin  = $t.data('min');
				if($t.hasClass('proto')){
					$t.append('<input type="text" data-width="180" data-height="180" data-fgColor="#626262" data-inputColor="#363636" data-bgColor="#d9d9d9" data-max="'+knobMax+'" data-min="'+knobMin+'" data-readOnly="true" value="0" class="knob-read">'); 
				}
				else{
					$t.append('<input type="text" data-width="180" data-height="180" data-fgColor="#00C5FF" data-inputColor="#282828;" data-max="'+knobMax+'" data-min="'+knobMin+'" data-readOnly="true" value="0" class="knob-read">'); 
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
				$t.append('<input type="text" data-width="180" data-height="180" data-fgColor="#626262" data-inputColor="#363636" data-bgColor="#d9d9d9" data-displayPrevious="true" data-angleOffset="-140" data-angleArc="280" class="knob-write">'); 
			}
			else{
				$t.append('<input type="text" data-width="180" data-height="180" data-fgColor="#00C5FF" data-inputColor="#282828;" data-displayPrevious="true" data-angleOffset="-140" data-angleArc="280" class="knob-write">'); 
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

		//log the data on debug
		involt.debug($t.data());

	};
	//JQuery Knob plugin function
	//this is required to be here to support appending
	this.knobSendCreate = function($t){
    //definePin will not work

      var index = $t.data("pinNumber");
      var currentValue = $t.data("value");
      var max = $t.data("max");
        $t.children('.knob-write').val(currentValue).data($t.data());

        $t.children('.knob-write').knob({
        	'min':  $t.data("min"),
        	'max':  max,
        	'step': $t.data("step"),
        	'change' : function (value) {
		        //prevent from sending duplicated values when step is higher than 1
		        if (digitalPins[index] !== this.cv){

		        	if (this.cv <= max){
		        		digitalPins[index] = this.cv;
		        		if ($t.parent("form").length == 0) $t.sendValue();
		        	}
		        	else {
		        		digitalPins[index] = max;
		        	};

		        };

	    	},
		    'release' : function (value){

		    	if (digitalPins[index] !== value){

		    		if (value <= max){
		    			digitalPins[index] = value;
		    		}
		    		else {
		    			digitalPins[index] = max;
		    		};

		    		if ($t.parent("form").length == 0) $t.sendValue(); 

		    	};
		    	if ($t.parent("form").length == 0) $t.sendFn()
		    }
		});

  	};
  	//JQuery slider plugin
  	this.rangesliderCreate = function($t){

	  	var $slider = $t.children('.slider');
	  	var $tooltip = $slider.siblings('.tooltip');

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
	            digitalPins[$t.data("pinNumber")] = val;
	            if ($t.parent("form").length == 0) involt.arduinoSend($t.data("pin"), val);
	      },
	      set: function(){
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
	this.onReceiveParse = function(encodedString){

		/*
			Example block of encoded data (Pin A3 value 872):
			A3V872E
			A14VteststringE
		*/

		var Vtest = encodedString.indexOf("V");
		var endTest = encodedString.indexOf("E");
		var testCount = (encodedString.match(/A/g) || []).length;
		
		if(encodedString.indexOf("A") == 0 && endTest>Vtest && testCount<2){

			var matches = encodedString.match("A(.*)V(.*)E");
			if(!isNaN(matches[2])){
				analogPins[parseInt(matches[1])] = parseInt(matches[2]);
			}
			else{
				analogPins[parseInt(matches[1])] = matches[2];
			};
			
		}
		else if(encodedString.indexOf("F")==0){
			var matches = encodedString.match("F(.*)E");
			window["involtFunctions"][matches[1]]();
		};
	};
	this.sendConvertString = function(ardSend){

		var buf      = new ArrayBuffer(ardSend.length);
		var bufView  = new Uint8Array(buf);

		for (var i   = 0; i < ardSend.length; i++) {
			bufView[i] = ardSend.charCodeAt(i);
		};

		return buf;

	};
	this.receiveConvertString = function(coded){

		var Int8View  = new Int8Array(coded);

		encodedString = String.fromCharCode.apply(null, Int8View);

		return encodedString;

	};
	this.debug = function(data){
		if(debugMode){
			console.log(data);
		};
	};
	this.bottomError = function(text){
		$("body").append('<div id="loader-error">'+ text +'</div>');
	    $("#loader-error").delay(2500).fadeOut("slow", function() {
	    	$(this).remove();
	    });
	};
};

//----------------------------------------------------------------------------------------------

//CONNECTION FUNCTIONS
//Depending on selected type the framework defines different functions.

//SERIAL CONNECTION

if (isSerial){

	Involt.prototype.begin = function(){

		var onGetDevices = function(ports){
			for (var j=0; j<ports.length; j++) {
				involt.devices[j] = ports[j].path;
				$(".loader-ports").append('<p>'+involt.devices[j]+'</p>');
			};
			console.log("Available port list:", involt.devices);
		};
		
		var checkConnections = function(connectionInfo){
			if(connectionInfo){

				for(var k=0; k<connectionInfo.length; k++){
					involt.previousConnections[k] = connectionInfo[k].connectionId;
				};

				if(involt.previousConnections.length > 0){
					$("#loader").append('<div id="resume-button">Continue previous session</div>');
				};

			};
		};

		chrome.serial.getDevices(onGetDevices);
		chrome.serial.getConnections(checkConnections);

	};

	Involt.prototype.connect = function(port, speed){

		var onConnect = function(connectionInfo){

			if (!connectionInfo) {
				console.error('Could not open, check if Arduino is connected, try other serial port or relaunch Chrome.');
				involt.bottomError('Could not open, check if device is connected, try other serial port or relaunch Chrome.');
				return;
			};

			$("#loader-bg, #loader-error").remove();
			$(".knob, .knob-send, .rangeslider").show();
			$("html").css('overflow', 'auto');

			console.log("Device connected:", defaultSerialPort, " ID:", connectionInfo.connectionId, connectionInfo);

			involt.id = connectionInfo.connectionId;

		};

		if(involt.previousConnections.length > 0){
			for(var i=0; i<involt.previousConnections.length; i++){
				involt.disconnect(involt.previousConnections[i]);
			};
		};

		chrome.serial.connect(port, {bitrate: speed, persistent: isPersistent}, onConnect);

	};

	Involt.prototype.disconnect = function(id){

		var onDisconnect = function(){
			console.log("disconnected from previous session (id:"+id+")");
		};

		chrome.serial.disconnect(id, onDisconnect)

	};

	Involt.prototype.send = function(sendString){

		involt.debug(sendString);

		chrome.serial.send(involt.id, involt.sendConvertString(sendString), involt.onSend);

	};

	Involt.prototype.receive = function(){

		var fullString = '';

		var onReceive = function(receiveInfo) {

			if (receiveInfo.connectionId !== involt.id) return;

			var encodedString = involt.receiveConvertString(receiveInfo.data);

			//if string received has errors it's splitted but correct string always starts with A and ends with E
			if (encodedString.indexOf("E") >=0){
				involt.onReceiveParse(encodedString.trim());
			}
			//append strings to combine splitted elements to correct format
			//this is not arduino issue because data in serial monitor is OK
			else {
				fullString += encodedString;
				if (fullString.indexOf("E") >=0){
					involt.onReceiveParse(fullString.trim());
					
					fullString = '';
					
				};
			};
		};

		chrome.serial.onReceive.addListener(onReceive);
		chrome.serial.onReceiveError.addListener(involt.onError);

	};

	Involt.prototype.createLoader = function(){

		$("body").prepend('<div id="loader-bg"><div id="loader"></div></div>');
		$("#loader").append('<div id="loader-logo"><img src="img/logo.png" alt="" /></div><div class="loader-txt"><span>Please select your device:</span></div><div class="loader-ports"></div>');
		$("#loader").append('<div id="loader-button">Connect</div>');
		$(".knob, .knob-send, .rangeslider").hide();
		$("html").css('overflow:', 'hidden');

		$(document).on("click","#resume-button",function() {
			involt.id = involt.previousConnections[0];
			console.log("Resumed previous connection: ID ", involt.previousConnections);
			$("#loader-bg, #loader-error").remove();
			$(".knob, .knob-send, .rangeslider").show();
			$("html").css('overflow', 'auto');	
		});

		$(document).on("click","#loader-button",function() {
			involt.connect(defaultSerialPort, bitrate);
		});

		$(document).on("click",".loader-ports > p",function() {
			$(".loader-ports > p").removeClass("active-port");
			$(this).addClass("active-port");
			defaultSerialPort = $(this).html();
		});		

	};	

}

//----------------------------------------------------------------------------------------------

//BLUETOOTH CONNECTION

else if (isBluetooth){

	Involt.prototype.begin = function(){

		var adapterOn;

		var adapterOnLaunch = function(adapter) {
			adapterOn = adapter.available;
			if(adapterOn){
				console.info("Involt for Classic Bluetooth is running")
				involt.debug("Adapter " + adapter.address + ": " + adapter.name);
			}
			else{
				console.error("Bluetooth adapter is OFF. Turn ON bluetooth in your computer.");
				involt.bottomError('Bluetooth adapter is turned OFF. Turn on and search again.');
			};
		};

		var adapterChange = function(adapter) {
			if(adapterOn != adapter.available){
				adapterOn = adapter.available;
				if(adapterOn){
					console.info("Bluetooth adapter is ON");
					involt.debug("Adapter " + adapter.address + ": " + adapter.name);
				}
				else{
					console.log("Bluetooth adapter is OFF");
				};
			};
		};

		chrome.bluetooth.getAdapterState(adapterOnLaunch);
		chrome.bluetooth.onAdapterStateChanged.addListener(adapterChange);

		var newDevice = function(device){
			console.log("New device found: " + device.name, device);
			involt.devices[device.name] = device;	 
		};
		var removeDevice = function(device){
			console.log("Device lost: " + device.name, device.address);
			delete involt.devices[device.name];
		};

		chrome.bluetooth.onDeviceAdded.addListener(newDevice);
		chrome.bluetooth.onDeviceChanged.addListener(newDevice);
		chrome.bluetooth.onDeviceRemoved.addListener(removeDevice);

		var onGetDevices = function(devices){
			for (var i = 0; i < devices.length; i++) {
				involt.devices[devices[i].name] = devices[i];
				$(".loader-ports").append('<p>'+involt.devices[i]+'</p>');
			};
			console.log("Available devices:", involt.devices);
		};

		var checkConnections = function(socket){
			for (var i=0; i<socket.length; i++) {
				involt.previousConnections[i] = socket[i].socketId;
			};
		};

		chrome.bluetooth.getDevices(onGetDevices);
		chrome.bluetoothSocket.getSockets(checkConnections);

		involt.bluetoothDiscovery(discoveryDuration);
	};

	Involt.prototype.bluetoothDiscovery = function(duration){
		chrome.bluetooth.startDiscovery(function() {

		console.info("Start discovery");
		setTimeout(function() {

		    chrome.bluetooth.stopDiscovery(function() {
		    	console.info("Discovery stopped");  	
		    	$(".loader-txt>span").hide();
		    	$("#discover-button").html("Search for more?").fadeIn('fast');
		    	if(!loaderOnLaunch){
					involt.connect(defaultBtAddress, uuid);
				};
		  		
		    });

		}, duration);

		});
	};

	Involt.prototype.connect = function(address, uuid){

		var onConnect = function() {
			if (chrome.runtime.lastError) {
				console.error("Connection failed: " + chrome.runtime.lastError.message);
				involt.bottomError('Could not connect, check if bluetooth device is paired. For more info open chrome console.');
				$("#loader-button").html("Connect");
			} 
			else {
				console.log("Connection established");
				$("#loader-bg, #loader-error").remove();
				$(".knob, .knob-send, .rangeslider").show();
				$("html").css('overflow', 'auto');
			};
		};

		var onCreate = function(createInfo){

			chrome.bluetoothSocket.connect(createInfo.socketId, defaultBtAddress, uuid, onConnect);
			involt.id = createInfo.socketId;
		
		};

		//Create bluetooth socket and then connect to device.
		chrome.bluetoothSocket.create(onCreate);

	};

	Involt.prototype.disconnect = function(id){

		chrome.bluetoothSocket.close(id, involt.onDisconnect(id));

	};

	Involt.prototype.send = function(sendString){

		involt.debug(sendString);

		chrome.bluetoothSocket.send(involt.id, involt.sendConvertString(sendString), involt.onSend);

	};

	Involt.prototype.receive = function(){

		var fullString = '';

		var onReceive = function(receiveInfo) {
			
	  		if (receiveInfo.socketId !== involt.id) return;

			var encodedString = involt.receiveConvertString(receiveInfo.data);

			//if string received has errors it's splitted but correct string always starts with A and ends with E
			if (encodedString.indexOf("A") == 0 && encodedString.indexOf("E") >=0){
				involt.onReceiveParse(encodedString.substring(0, encodedString.indexOf("E")+1).trim());
			}
			//append strings to combine splitted elements to correct format
			//this is not arduino issue because data in serial monitor is OK
			else {
				fullString += encodedString;
				if (fullString.indexOf("A") == 0 && fullString.indexOf("E") >=0){
					involt.onReceiveParse(fullString.substring(0, fullString.indexOf("E")+1).trim());
					fullString = '';
				};
			};
		};


		chrome.bluetoothSocket.onReceive.addListener(onReceive);
		chrome.bluetoothSocket.onReceiveError.addListener(involt.onError);

	};

	Involt.prototype.createLoader = function(){

		$("body").prepend('<div id="loader-bg"><div id="loader"></div></div>');
		$("#loader").append('<div id="loader-logo"><img src="img/logo.png" alt="" /></div><div class="loader-txt"><span>Please select your device: </span><div id="discover-button"></div></div><div class="loader-ports"></div>');
		$("#loader").append('<div id="loader-button">Connect</div>');
		$("#discover-button").hide();
		$("html").css('overflow:', 'hidden');

		$(document).on("click","#loader-button",function() {
			$(this).html("Connecting...");
			console.log("Connection attempt to: " + defaultBtAddress);

			chrome.bluetooth.stopDiscovery(function() {
	    		console.info("Discovery stopped");  	
	  		});
	  		
			involt.connect(defaultBtAddress, uuid);
		});

		$(document).on("click","#discover-button",function() {
			involt.bluetoothDiscovery(discoveryDuration);
			$(this).html("Searching for devices...");
		});

		$(document).on("click",".loader-ports > p",function() {
			$(".loader-ports > p").removeClass("active-port");
			$(this).addClass("active-port");
			defaultBtAddress = involt.devices[$(this).html()].address;
		});			

	};	

};

//----------------------------------------------------------------------------------------------

//ONLINE CONNECTION COMING SOON

//----------------------------------------------------------------------------------------------

//INVOLT JQUERY METHODS

(function($) {

	$.fn.sendFn = function(name) {

		return this.each(function() {
			var $t = $(this);
			if (typeof name === 'undefined'){
				if (typeof $t.data('fn') !== 'undefined'){
					involt.arduinoFn($t.data('fn'));
				};
			}
			else{
				involt.arduinoFn(name);
			};
		});

	};
	
	$.fn.sendValue = function(value){

		return this.each(function() {
			var $t = $(this);
			if (typeof value === 'undefined') {
				involt.arduinoSend($t.data("pin"), digitalPins[$t.data("pinNumber")]);
			}
			else{
				involt.arduinoSend($t.data("pin"), value);
			};
			$t.not('.knob-send').not('.rangeslider').sendFn();
		});

	};

	$.fn.updateValue = function(newValue){

		return this.each(function() {
			var $t = $(this);
			if (typeof newValue === 'undefined') {
				digitalPins[$t.data("pinNumber")] = $t.data("value");
			}
			else{
				var valueCheck = isNaN(newValue);
				if(valueCheck == false) parseInt(newValue);
					digitalPins[$t.data("pinNumber")] = newValue;
					if (typeof $t.data("value2") === 'undefined') {
						$t.data("value", newValue);
					};       
			};
		});

	};

	$.fn.sendString = function(string){

		return this.each(function() {
			var directSend = string+"\n";
				involt.send(directSend);
		});

	};

	$.fn.pinDefine = function(pin){

		return this.each(function() {

			$(this).data("pin", pin).data("pinNumber", parseInt(pin.substring(1,pin.length)));

		});

	};

	$.fn.pinSwap = function(newPin){

		return this.each(function() {

			var $t = $(this);
			var previousPin = $t.data("pinNumber");

			$t.data("pin", newPin);
			$t.data("pinNumber", parseInt(newPin.substring(1,newPin.length)));

			//check if the new pin value is defined - if not - put the previous value
			if (typeof digitalPins[$t.data("pinNumber")] == 'undefined') {
				digitalPins[$t.data("pinNumber")] = digitalPins[previousPin];
			};

		});

	};

}(jQuery));

//----------------------------------------------------------------------------------------------

//CREATE INVOLT APP

var involt = new Involt();

//FIND CONNECTED DEVICES

involt.begin();

//IDENTIFY INVOLT OBJECTS AND DEFINE THEIR PARAMETERS

$(document).ready(function() {

	//DEFINE FRAMEWORK ELEMENTS FROM CSS CLASSES
	involt.debug("Involt UI generated elements:");
	$(".ard").not(".custom-write").not(".submit-button").each(function(index, el) {
		involt.defineElement($(this));
	});

	/*
		INSERTION QUERY
		Additional plugin for listening to new dom elements.
		With this plugin Involt fully appends new framework elements.
	*/
	insertionQ('.ard').every(function(element){
		element = $(element);
		involt.defineElement(element);
	});
	
	//create loader or connect directly
	if (loaderOnLaunch){
		involt.createLoader();
	}
	else {
		//For bluetooth: connection without launcher is right after bluetoothDiscovery
		if(isSerial){
			involt.connect(defaultSerialPort, bitrate);
		};
	};

});

//DATA RECEIVE AND VALUE UPDATE
involt.receive();