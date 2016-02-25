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
			if(typeof min === 'undefined') involtElement.min = 0;
			if(typeof max === 'undefined') involtElement.max = 255;
			if(typeof step === 'undefined') involtElement.step = 1;
			if(typeof value === 'undefined'){
				value = 0;
				digitalPins[involtElement.pinNumber] = 0;
			};
		};

		if(uiName == 'bar' || uiName == 'knob' ){
			value = 0;
			if(typeof min === 'undefined') involtElement.min = 0;
			if(typeof max === 'undefined') involtElement.max = 1024;
		};
		
		if(typeof $t.attr('string') !== 'undefined') value = $t.attr('string');

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
		if(typeof involt.createUiAssets !== 'undefined') involt.createUiAssets($t);

		//log the data on debug
		involt.debug($t.data());

	};
	this.onReceiveParse = function(encodedString){

		//Example block of encoded data (Pin A3 value 872): A3V872E

		var testCount = (encodedString.match(/A/g) || []).length;
		
		if(encodedString.startsWith("A") && testCount<2){

			var matches = encodedString.match("A(.*)V(.*)E");
			if(!isNaN(matches[2])){
				analogPins[parseInt(matches[1])] = parseInt(matches[2]);
			}
			else{
				analogPins[parseInt(matches[1])] = matches[2];
			};
			
		}
		else if(encodedString.startsWith("F")){

			if(typeof window["involtFunctions"]["test"] !== 'undefined'){
				var matches = encodedString.match("F(.*)E");
				window["involtFunctions"][matches[1]]();
			};

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

			if (encodedString.lastIndexOf('A') == 0 || encodedString.lastIndexOf('F') == 0){

				fullString += encodedString;

				if(encodedString.indexOf('E') == encodedString.lastIndexOf('E')){
					if(encodedString.indexOf('E') > 0){
						involt.onReceiveParse(fullString)
						fullString = '';
					};
				};
			}
			else{
				fullString += encodedString;
				
				if (fullString.indexOf('E') > 0){
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
		$("html").css('overflow:', 'hidden');

		$(document).on("click","#resume-button",function() {
			involt.id = involt.previousConnections[0];
			console.log("Resumed previous connection: ID ", involt.previousConnections);
			$("#loader-bg, #loader-error").remove();
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
			if(involt.devices[device.name] === 'undefined'){
				$(".loader-ports").append('<p>'+involt.devices[device.name].name+'</p>');				
			};

		};
		var removeDevice = function(device){

			console.log("Device lost: " + device.name, device.address);
			delete involt.devices[device.name];

		};

		chrome.bluetooth.onDeviceAdded.addListener(newDevice);
		chrome.bluetooth.onDeviceChanged.addListener(newDevice);
		chrome.bluetooth.onDeviceRemoved.addListener(removeDevice);

		var onGetDevices = function(device){

			console.log("Available devices:");
			for (var i = 0; i < device.length; i++) {
				involt.devices[device[i].name] = device[i];
				$(".loader-ports").append('<p>'+involt.devices[device[i].name].name+'</p>');
				console.log(device[i].name, involt.devices[device[i].name]);
			};	

		};

		var checkConnections = function(socket){
			for (var i=0; i<socket.length; i++) {
				involt.previousConnections[i] = socket[i];
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
				console.log("Connection established:", address);
				$("#loader-bg, #loader-error").remove();
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

		var onDisconnect = function(){
			console.log("disconnected from previous session (id:"+id+")");
		};

		chrome.bluetoothSocket.close(id, onDisconnect);

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
			
			if (encodedString.lastIndexOf('A') == 0 || encodedString.lastIndexOf('F') == 0){

				fullString += encodedString;

				if(encodedString.indexOf('E') == encodedString.lastIndexOf('E')){
					if(encodedString.indexOf('E') > 0){
						involt.onReceiveParse(fullString.trim());
						console.log(fullString.trim());
						fullString = '';
					};
				};
			}
			else{
				fullString += encodedString;
				
				if (fullString.indexOf('E') > 0){
					involt.onReceiveParse(fullString.trim());
					console.log(fullString.trim());
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
	  		
	  		for (var i=0; i<involt.previousConnections.length; i++) {
				involt.disconnect(involt.previousConnections[i].socketId);
			};

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

//FIND CONNECTED DEVICES AND THEIR STATE
involt.begin();

$(document).ready(function() {

	//CREATE LOADER OR CONNECT DIRECTLY
	if (loaderOnLaunch){
		involt.createLoader();
	}
	else {
		//For bluetooth: connection without launcher is right after bluetoothDiscovery in involt.begin
		if(isSerial){
			involt.connect(defaultSerialPort, bitrate);
		};
	};

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

});

//DATA RECEIVE AND VALUE UPDATE
involt.receive();