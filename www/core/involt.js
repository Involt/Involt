/*
	INVOLT FRAMEWORK CORE FILE
	Ernest Warzocha 2015
	involt.github.io

	This file is required. It contains communication bridge, core functions and JQuery methods.

	1. Common functions and converting CSS to parameters
	2. Serial communication functions
	3. Bluetooth communication functions
	4. JQuery methods
	5. Initializing the app
*/

//----------------------------------------------------------------------------------------------

//Array of values (numeric for pins/strings) stored for sending to device with Involt functions and HTML elements.
var involtPin = [];
var involtString = [];
//Array of values received from device.
var involtReceivedPin = [];
//Custom function to trigger when its name is called from arduino. Create own file to add them and include in this object.
var involtFunction = {};

//MAIN INVOLT OBJECT (COMMUNICATION BRIDGE)

var Involt =  function (){
	this.id = 0;
	this.devices = [];
	this.previousConnections = [];
	this.isMobile = false;
	this.fullString = '';
	this.onSend =  function(){
		involt.debug(involtPin);
		involt.debug(involtString);
	};
	this.onError = function (errorInfo){
		console.error("Received error on connection: " + errorInfo.error);
	};
	//involt.arduinoSend is responsible for sending the data, involt.send is used to send as specified connection type.
	this.arduinoSend = function(pin, value){
		//convert pin and value to framework-friendly format
		if(typeof pin !== 'undefined' && typeof value !== 'undefined'){
			var ardSend = pin+"V"+value+"\n";
			involt.send(ardSend);		
		}
		else{
			involt.debug("Problem while sending the value - pin or value parameter is missing.: "+ pin + ", " + value);
		};
	};
	this.arduinoFn = function(functionName){
		var sendFunction = "F" + functionName + "\n";
		involt.debug("Triggered function: " + functionName);
		involt.send(sendFunction);
	};
	this.defineElement = function($t){

		var involtElement = {};
		//split the classes to array
		var classes = $t.attr('class').split(' ');
		var ardIndex = classes.indexOf("ard");

		//define target pin
		involtElement.pin = classes[ardIndex+2];
		involtElement.pinType = involtElement.pin[0];
		involtElement.pinNumber = parseInt(classes[ardIndex+2].substring(1,classes[ardIndex+2].length));

		var value;

		//search for involt parameters in classes
		for(var i = 0; i < classes.length; i++){
			//value
			if (classes[i].indexOf("value-") == 0) {
				var valueSplit = classes[i].split('-');
				if(valueSplit.length == 2){
					value = valueSplit[1];
				}
				else if(valueSplit.length == 3){
					value = [valueSplit[1], valueSplit[2]];
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
		
		//use the older syntax for numeric single value
		if(typeof value === 'undefined' && !isNaN(classes[ardIndex+3])){
			value = parseInt(classes[ardIndex+3]);
		};

		//define default parameters
		var uiName = classes[ardIndex+1];
		involtElement.name = uiName;

		if(uiName == 'rangeslider' || uiName == 'knob-send' || uiName == 'increase' || uiName == 'decrease'){
			if(typeof involtElement.min === 'undefined') involtElement.min = 0;
			if(typeof involtElement.max === 'undefined') involtElement.max = 255;
			if(typeof involtElement.step === 'undefined') involtElement.step = 1;
			if(typeof value === 'undefined'){
				value = 0;
				involtPin[involtElement.pinNumber] = 0;
			};
		}
		else if(uiName == 'bar' || uiName == 'knob'){
			value = 0;
			involtReceivedPin[involtElement.pinNumber] = 0;
			if(typeof involtElement.min === 'undefined') involtElement.min = 0;
			if(typeof involtElement.max === 'undefined') involtElement.max = 1024;
		};

		if(uiName == 'involt-input'){
			if($t.val() == '') $t.val(0);
			value = $t.val();
		}
		
		//define values from html attribute
		if(typeof $t.attr('string') !== 'undefined') value = $t.attr('string');
		if(typeof $t.attr('value') !== 'undefined') value = $t.val();

		//convert strings to numeric value if they are numeric
		if (typeof value === 'object'){
			for(var k = 0; k<value.length; k++){
				if(!isNaN(value[k])){
					value[k] = parseInt(value[k]);
				}
				else{
					value[k] = value[k];
				};
			};
		}
		else {
			if (!isNaN(value)){
				value = parseInt(value);
			};
		};

		//add the value to proper array
		if(involtElement.pinType == 'P'){
			if (typeof value !== 'object') involtPin[involtElement.pinNumber] = value;
		}
		else if(involtElement.pinType == 'S'){
			involtString[involtElement.pinNumber] = value;
		}
		else if(involtElement.pinType == 'A'){
			involtReceivedPin[involtElement.pinNumber] = value;
		}

		involtElement.value = value;
		$t.data(involtElement);

		//HTML GENERATED ELEMENTS OF FRAMEWORK
		if(typeof involt.createUiAssets !== 'undefined') involt.createUiAssets($t);

		//log the data on debug
		involt.debug(uiName);
		involt.debug($t.data());

	};
	this.onReceive = function(receiveInfo){

		if (isSerial && receiveInfo.connectionId !== involt.id) return;
		if (isBluetooth && receiveInfo.socketId !== involt.id) return;

		var encodedString = involt.receiveConvertString(receiveInfo.data);

		var matchingPattern = /[AF][^EAF]+\E/g;
		var dataBlock = encodedString.match(matchingPattern);

		if(dataBlock !== null){
			involt.onReceiveParse(dataBlock);
			involt.fullString = '';
		}
		else {
			involt.fullString += encodedString;
			
			var isCompleted = involt.fullString.match(matchingPattern);

			if(isCompleted !== null){
				involt.onReceiveParse(isCompleted);
				involt.fullString = '';
			};
			
		};

	};
	this.onReceiveParse = function(dataBlock){

		//Example block of encoded data (Pin A3 value 872): A3V872E

		for (var j=0; j<dataBlock.length; j++){
			var indexA = dataBlock[j].indexOf('A');
			var indexV = dataBlock[j].indexOf('V');
			var indexE = dataBlock[j].indexOf('E');

			if(indexA == 0 && indexA < indexV && indexV == dataBlock[j].lastIndexOf('V') && indexV >= 0){
				var index = parseInt(dataBlock[j].substring(indexA+1,indexV));
				var value = dataBlock[j].substring(indexV+1,indexE);
				if(!isNaN(value)){
					involtReceivedPin[index] = parseInt(value);
				}
				else{
					involtReceivedPin[index] = value;
				};
			}
			else if (dataBlock[j].indexOf('F') == 0){
				var name = dataBlock[j].substring(1,indexE);
				if(typeof window["involtFunction"][name] !== 'undefined'){
					window["involtFunction"][name]();
				};
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
		$(document).on("click","#loader-error", function(){
			$(this).remove();
		});
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

		chrome.serial.onReceive.addListener(involt.onReceive);
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
				involt.debug("Adapter: " + adapter.address + " : " + adapter.name);
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
					involt.debug("Adapter: " + adapter.address + " : " + adapter.name);
				}
				else{
					console.log("Bluetooth adapter is OFF");
				};
			};
		};

		chrome.bluetooth.getAdapterState(adapterOnLaunch);
		chrome.bluetooth.onAdapterStateChanged.addListener(adapterChange);

		var newDevice = function(device){

			involt.devices[device.name] = device;

			if($('.loader-ports:contains('+ involt.devices[device.name].name +')').length > 0){
				involt.debug("Device already on the list: " + device.name);
			}
			else {
				console.log("New device found: " + device.name, device);
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

		var onGetDevices = function(device){
			console.log("Available devices:");
			for (var i = 0; i < device.length; i++) {
				involt.devices[device[i].name] = device[i];
				if($('.loader-ports:contains('+ involt.devices[device[i].name].name +')').length == 0){
					$(".loader-ports").append('<p>'+involt.devices[device[i].name].name+'</p>');
					console.log(device[i].name, involt.devices[device[i].name]);
				}
			};	
		};

		chrome.bluetooth.startDiscovery(function() {
			console.info("Start discovery");
			setTimeout(function() {
				chrome.bluetooth.stopDiscovery(function() {
					console.info("Discovery stopped");
					if (loaderOnLaunch){
						$(".loader-txt>span").hide();
						$("#discover-button").html("Search for more?").fadeIn('fast');
					};
					//Somehow Android requires this step after the discovery, otherwise it will not detect the devices as in desktop.
					if (involt.isMobile){
						chrome.bluetooth.getDevices(onGetDevices);
						if(!loaderOnLaunch){
							involt.connect(defaultBtAddress, uuid);
						};
					};
				});
			}, duration);
		});

	};

	Involt.prototype.connect = function(address, uuid){

		var onConnect = function() {

			if (!involt.isMobile){
				if (chrome.runtime.lastError) {
					console.error("Connection failed: " + chrome.runtime.lastError.message);
					involt.bottomError('Could not connect, check if bluetooth device is paired. For more info open chrome console.');
					$("#loader-button").html("Connect");
					return;
				};
			};

			console.log("Connection established:", address);
			$("#loader-bg, #loader-error").remove();
			$("html").css('overflow', 'auto');
			
			
		};

		var onCreate = function(createInfo){

			chrome.bluetoothSocket.connect(createInfo.socketId, defaultBtAddress, uuid, onConnect);
			involt.id = createInfo.socketId;

		};

		//console.log(involt.previousConnections);
		for (var i=0; i<involt.previousConnections.length; i++) {
			involt.disconnect(involt.previousConnections[i].socketId);
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

		chrome.bluetoothSocket.onReceive.addListener(involt.onReceive);
		chrome.bluetoothSocket.onReceiveError.addListener(involt.onError);

	};

	Involt.prototype.createLoader = function(){

		if(!involt.isMobile){
			$("body").prepend('<div id="loader-bg"><div id="loader"></div></div>');
			$("#loader").append('<div id="loader-logo"><img src="img/logo.png" alt="" /></div><div class="loader-txt"><span>Please select your device: </span><div id="discover-button"></div></div><div class="loader-ports"></div>');
			$("#loader").append('<div id="loader-button">Connect</div>');
			$("#discover-button").hide();
			$("html").css('overflow:', 'hidden');
		};

		$(document).on("click","#loader-button",function() {
			$(this).html("Connecting...");
			console.log("Connection attempt to: " + defaultBtAddress);

			chrome.bluetooth.stopDiscovery(function() {});

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

//INVOLT JQUERY METHODS

(function($) {

	//Send name of function to trigger it in arduino
	$.fn.sendFn = function(name) {

		return this.each(function() {
			var $t = $(this);
			if (typeof name === 'undefined'){
				if (typeof $t.data('fn') !== 'undefined'){
					involt.arduinoFn($t.data('fn'));
				};
			}
			else {
				involt.arduinoFn(name);
			};
		});

	};
	
	//Send the value for pin related to UI element pin, if no value defined - send the value defined in array
	$.fn.sendValue = function(pin, value){

		return this.each(function() {
			var $t = $(this);

			if(typeof value === 'undefined') {
				if (typeof pin === 'undefined') {
					if ($t.data("pinType") == 'P') {
						involt.arduinoSend($t.data("pin"), involtPin[$t.data("pinNumber")]);
					}
					else if ($t.data("pinType") == 'S') {
						involt.arduinoSend($t.data("pin"), involtString[$t.data("pinNumber")]);
					};
				}
				else {
					involt.arduinoSend($t.data("pin"), pin);
				};
			}
			else {
				involt.arduinoSend(pin, value);
			};

			$t.not('.knob-send').not('.rangeslider').sendFn();
		});	

	};

	//Update the value related to target pin, if nothing is defined the value in array will be data of UI element
	$.fn.updateValue = function(newValue){

		return this.each(function() {
			var $t = $(this);
			if (typeof newValue === 'undefined') {
				if ($t.data("pinType") == 'P') {
					involtPin[$t.data("pinNumber")] = $t.data("value");

				}
				else if ($t.data("pinType") == 'S') {
					involtString[$t.data("pinNumber")] = $t.data("value");
				};

			}
			else{
				if (!isNaN(newValue)) parseInt(newValue);
				if ($t.data("pinType") == 'P') {
					if (typeof $t.data("value") === typeof newValue){
						$t.data("value", newValue); 
					};
					involtPin[$t.data("pinNumber")] = newValue;
				}
				else if ($t.data("pinType") == 'S') {
					involtString[$t.data("pinNumber")] = newValue;
					if (typeof $t.data("value") === typeof newValue){
						$t.data("value", newValue); 
					};
				};
			};
		});

	};

	//Send raw string directly to device
	$.fn.sendString = function(string){

		return this.each(function() {
			var directSend = string+"\n";
				involt.send(directSend);
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
			var previousPin = $t.data("pinNumber");

			$t.data("pin", newPin);
			$t.data("pinType", newPin[0]);
			$t.data("pinNumber", parseInt(newPin.substring(1,newPin.length)));

			//check if the new pin value is defined - if not, put the previous value
			if ($t.data("pinType") == 'P') {
				if (typeof involtPin[$t.data("pinNumber")] === 'undefined') {
					involtPin[$t.data("pinNumber")] = involtPin[previousPin];
				};
			}
			else if ($t.data("pinType") == 'S') {
				if (typeof involtString[$t.data("pinNumber")] === 'undefined') {
					involtString[$t.data("pinNumber")] = involtString[previousPin];
				};
			};

		});

	};

	// Mix of update and sendValue - it defines the value and send it for previously defined pin or also define pin
	$.fn.sendAndUpdate = function(pin, value){

		return this.each(function(){

			if (typeof value === 'undefined') {
				$(this).updateValue(pin).sendValue();
			}
			else {
				$(this).pinDefine(pin).updateValue(value).sendValue();
			};
			
		});

	};

}(jQuery));

//----------------------------------------------------------------------------------------------

//LAUNCH THE FRAMEWORK

Involt.prototype.launch = function(){
	//FIND CONNECTED DEVICES AND RECEIVE THEIR STATE
	involt.begin();

	$(document).ready(function() {
		//CREATE LOADER OR CONNECT DIRECTLY
		if (loaderOnLaunch){
			involt.createLoader();
		}
		else {
			if (isSerial){
				involt.connect(defaultSerialPort, bitrate);
			}
			else if (isBluetooth){
				if(!involt.isMobile){
					var checkConnections = function(sockets){
						for (var i=0; i<sockets.length;i++){
							involt.previousConnections[i] = sockets[i];
							involt.disconnect(involt.previousConnections[i].socketId);
						};
					};
					chrome.bluetoothSocket.getSockets(checkConnections);
					involt.connect(defaultBtAddress, uuid);
				};
			};
		};

	});

	//RECEIVE THE DATA AND UPDATE THE VALUES
	//For updating the read-only UI elements check analogUpdate function in framework.js
	involt.receive();	
};

//CREATE INVOLT APP
var involt = new Involt();

if(typeof cordova === 'object') involt.isMobile = true;

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
});

//On mobile, wait for Cordova to load all plugins and assets, desktop version runs immediately.
if (involt.isMobile){

	//Create loader before the plugins load (user don't have to look at not fully loaded UI and then suddenly see the loader).
	//The device connects after discovery
	if(loaderOnLaunch){
		
		$(document).ready(function() {
			$("body").prepend('<div id="loader-bg"><div id="loader"></div></div>');
			$("#loader").append('<div id="loader-logo"><img src="img/logo.png" alt="" /></div><div class="loader-txt"><span>Please select your device: </span><div id="discover-button"></div></div><div class="loader-ports"></div>');
			$("#loader").append('<div id="loader-button">Connect</div>');
			$("#discover-button").hide();
			$("html").css('overflow:', 'hidden');
		});
		
	};
	
	document.addEventListener('deviceready', involt.launch, false);
}
else {
	involt.launch();
};