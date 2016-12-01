//JQuery is not used here intentionally making the framework core elements independed from it

Involt.prototype.addToLoaderList = function(name){

	if(!loaderOnLaunch) return;

	var device = document.createElement("p");
	var text = document.createTextNode(name);
	device.appendChild(text); 

	var changeDevice = function(){

		if(isSerial){
			involt.selectedDevice = involt.devices[this.innerHTML];
		}
		else if(isBluetooth){
			involt.selectedDevice = involt.devices[this.innerHTML];
		};

		Array.prototype.filter.call(document.getElementById('loader-ports').children, function(child){
			child.style.color = 'blue';
		});

		this.style.color = 'red';

	};

	device.addEventListener("click", changeDevice);

	document.getElementById('loader-ports').appendChild(device);

};

Involt.prototype.removeLoader = function(){

	var loader = document.getElementById("loader-bg");
	loader.outerHTML = "";
	delete loader;
	
}

if(loaderOnLaunch){
	var startConnecting = function(){

		if(involt.selectedDevice == '') return;

		if(isSerial){
			involt.connect(involt.selectedDevice.path, bitrate);
		}
		else if(isBluetooth){
			involt.connect(involt.selectedDevice.address, uuid);
		};

	};

	document.getElementById('loader-connect').addEventListener("click", startConnecting);

	var resumeSession = function(){

		if(isSerial){
			involt.id = involt.stillConnectedDevice[0].connectionId;
		}
		else if(isBluetooth){
			involt.id = involt.stillConnectedDevice[0].socketId;
		};

		console.log("Resumed previous connection: ID ", involt.id);

	};

	document.getElementById('loader-resume').addEventListener("click", resumeSession);

	var discoverMore = function(){

		involt.bluetoothDiscovery(discoveryDuration);

	};

	document.getElementById('loader-refresh').addEventListener("click", discoverMore);

};