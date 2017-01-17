/*
	INVOLT MAIN OBJECT AND COMMUNICATION

	This file contains all functions related to communication between
	app and device and establishing connection.
*/

var Involt = function(){
	this.id = 0;
	this.connected = {};
	this.selectedDevice = '';
	this.devices = {};
	this.stillConnectedDevices = {};
	this.isMobile = false;
	this.isListening = false;

	this.pin = {
		P: [],
		S: [],
		A: []
	};

	this.involtFunction = {};
	this.involtListenForPin = {};

	this.fullString = "";
	this.onSend =  function(){
		//involt.debug()
	};
	this.send = function(pin, value){
		//convert pin and value to framework-friendly format 
		if(typeof pin !== 'undefined' && typeof value !== 'undefined'){

			if(pin[0] == 'P'){
				if (value == true) value = 1;
				else if (value == false) value = 0;
			};

			var dataBlock = pin+"V"+value+"\n";
			involt.sendToDevice(dataBlock);		
		}
		else{
			involt.debug("Problem while sending the value - pin or value parameter is missing.: "+ pin + ", " + value);
		};
	};
	this.sendFunction = function(functionName){
		var sendFunction = "F" + functionName + "\n";
		involt.sendToDevice(sendFunction);
	};
	this.onError = function (errorInfo){

		console.error("Received error on connection: " + errorInfo.error);

	};
	this.sendStringConvert = function(ardSend){

		var buf      = new ArrayBuffer(ardSend.length);
		var bufView  = new Uint8Array(buf);

		for (var i   = 0; i < ardSend.length; i++) {
			bufView[i] = ardSend.charCodeAt(i);
		};

		return buf;

	};
	this.receivedStringConvert = function(coded){

		var Int8View  = new Int8Array(coded);
		encodedString = String.fromCharCode.apply(null, Int8View);
		return encodedString;

	};
	this.newDeviceFound = function(newDevices){

		var addDevice = function(device){
			if(isSerial){
				if(typeof involt.devices[device.path] !== 'undefined') return;
				involt.devices[device.path] = device;
				involt.addToLoaderList(device.path);
			}
			else if(isBluetooth){
				if(typeof involt.devices[device.name] !== 'undefined') return;
				involt.devices[device.name] = device;
				involt.addToLoaderList(device.name);
			};
		};

		if(Array.isArray(newDevices)){
			for(var j=0; j<newDevices.length; j++){
				addDevice(newDevices[j]);
			};
			console.log("Available devices: ", involt.devices);
		}
		else{
			addDevice(newDevices);
			console.log("New device found: ", newDevices);
		};
	};
	this.checkPersistentDevices = function(persistentDevices){

		if(persistentDevices.length == 0) return;
		
		document.getElementById('loader-resume').style.display = 'block';

		involt.stillConnectedDevices = persistentDevices;

		console.log("Previous Connection detected: ", involt.stillConnectedDevices);

	};
	this.clearUnusedConnections = function(){

		if(involt.stillConnectedDevices.length == 0) return;

		for(var i=0; i<involt.stillConnectedDevices.length; i++){
			if(isSerial){
				involt.disconnect(involt.stillConnectedDevices[i].connectionId);
			}
			else if(isBluetooth){
				involt.disconnect(involt.stillConnectedDevices[i].socketId);
			};

			console.log("Disconnected from: ", involt.stillConnectedDevices[i]);
		};

	};
	this.debug = function(first, second){
		if(debugMode){
			//printing this way makes some elements more readable in dev tools
			if (typeof second !== 'undefined') console.log(first, second);
			else console.log(first);
		};
	};
};

if(isSerial){

	Involt.prototype.begin = function(){

		chrome.serial.getDevices(involt.newDeviceFound);
		chrome.serial.getConnections(involt.checkPersistentDevices);

	};
	Involt.prototype.connect = function(port, baudrate){

		var onConnect = function(device){
			if(!device){
				console.error('Could not open, check if Arduino is connected, try other serial port or relaunch app.');
				involt.bottomError('Could not open, check if Arduino is connected, try other serial port or relaunch app.');
				return;
			};

			involt.connected = device;
			involt.id = device.connectionId;

			console.log("Device connected:", port, " ID:", involt.id, involt.connected);

			if(typeof involtApp.startListening === "function") involtApp.startListening();

			if(loaderOnLaunch) involt.removeLoader();
		}

		involt.clearUnusedConnections();

		chrome.serial.connect(port, {bitrate: baudrate, persistent: isPersistent}, onConnect);
	};
	Involt.prototype.disconnect = function(id){

		var onDisconnect = function(){
			console.log("disconnected from previous session (id:"+id+")");
		};

		chrome.serial.disconnect(id, onDisconnect)
	};
	Involt.prototype.sendToDevice = function(sendString){

		involt.debug(sendString, involt.pin);

		chrome.serial.send(involt.id, involt.sendStringConvert(sendString), involt.onSend);

	};
}


else if (isBluetooth){

	Involt.prototype.adapterState = function(){

		var isAdapterOn;

		var adapterOnLaunch = function(adapter) {
			isAdapterOn = adapter.available;
			if(isAdapterOn){
				console.info("Involt for Classic Bluetooth is running")
				involt.debug("Adapter: " + adapter.address + " : " + adapter.name);
			}
			else{
				console.error("Bluetooth adapter is OFF. Turn ON bluetooth in your computer.");
				involt.bottomError('Bluetooth adapter is turned OFF. Turn ON bluetooth in your computer.');
			};
		};

		var adapterChange = function(adapter) {
			if(isAdapterOn != adapter.available){
				isAdapterOn = adapter.available;
				if(isAdapterOn){
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

	};

	Involt.prototype.begin = function(){

		involt.adapterState();

		var removeDevice = function(device){

			console.log("Device lost: " + device.name, device.address);
			delete involt.devices[device.name];

		};

		chrome.bluetooth.onDeviceAdded.addListener(involt.newDeviceFound);
		chrome.bluetooth.onDeviceChanged.addListener(involt.newDeviceFound);
		chrome.bluetooth.onDeviceRemoved.addListener(removeDevice);	

		chrome.bluetooth.getDevices(involt.newDeviceFound);
		chrome.bluetoothSocket.getSockets(involt.checkPersistentDevices);

		involt.bluetoothDiscovery(discoveryDuration);

	};

	Involt.prototype.bluetoothDiscovery = function(duration){

		var discoveryStopped = function(){
			chrome.bluetooth.stopDiscovery(function() {
				console.info("Discovery stopped");

				involt.discoveryStoppedText();
				//Somehow Android requires this step after the discovery, otherwise it will not detect the devices as in desktop.
				if (involt.isMobile){
					chrome.bluetooth.getDevices(involt.newDeviceFound);
					if(!loaderOnLaunch){
						involt.connect(defaultBtAddress, uuid);
					};
				};
			});			
		};

		chrome.bluetooth.startDiscovery(function() {
			console.info("Start discovery");
			involt.discoveryStartedText();
			setTimeout(discoveryStopped, duration);
		});

	};

	Involt.prototype.connect = function(address, uuid){

		var onConnect = function() {

			if (!involt.isMobile){
				if (chrome.runtime.lastError) {
					console.error("Connection failed: " + chrome.runtime.lastError.message);
					involt.bottomError('Could not connect, check if bluetooth device is paired. For more info open console.');
					return;
				};
			};

			console.log("Connection established: ", address);

			involt.connected = involt.selectedDevice;

			if(typeof involtApp.startListening === "function") involtApp.startListening();

			if(typeof involt.connected['address'] !== 'undefined' && loaderOnLaunch) involt.removeLoader();
			
		};

		var onCreate = function(createInfo){

			chrome.bluetoothSocket.connect(createInfo.socketId, address, uuid, onConnect);
			involt.id = createInfo.socketId;

		};

		involt.clearUnusedConnections();

		//Create bluetooth socket and then connect to device.
		chrome.bluetoothSocket.create(onCreate);

	};

	Involt.prototype.disconnect = function(id){

		var onDisconnect = function(){
			console.log("Disconnected from previous session (id:"+id+")");
		};

		chrome.bluetoothSocket.close(id, onDisconnect);

	};

	Involt.prototype.sendToDevice = function(sendString){

		involt.debug(sendString, involt.pin);

		chrome.bluetoothSocket.send(involt.id, involt.sendStringConvert(sendString), involt.onSend);

	};

};

var involt = new Involt();

if(typeof cordova === 'object') involt.isMobile = true;

if(!loaderOnLaunch){
	document.getElementById("loader-bg").outerHTML = ""; //not removeLoader because it's still not loaded
};

Involt.prototype.launch = function(){

	involt.begin();

	if(!loaderOnLaunch){
		if(isSerial){
			involt.connect(defaultSerialPort,bitrate);
		}
		else if(isBluetooth){
			if(!involt.isMobile){
				involt.connect(defaultBtAddress, uuid);
			};
		};
	};

};

if(involt.isMobile) {
	document.addEventListener('deviceready', involt.launch, false);
}
else{
	involt.launch();
};
