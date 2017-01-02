//JQuery is not used here intentionally making the framework core elements independed from it

Involt.prototype.addToLoaderList = function(name){

	if(!loaderOnLaunch) return;

	var device = document.createElement("p");
	device.textContent = name;

	var changeDevice = function(){

		if(isSerial){
			involt.selectedDevice = involt.devices[this.innerHTML];
		}
		else if(isBluetooth){
			involt.selectedDevice = involt.devices[this.innerHTML];
		};

		Array.prototype.filter.call(document.getElementById('loader-ports').children, function(child){
			child.style.background = 'rgb(240,240,240)';
		});

		this.style.background = 'rgb(209,209,209)';

	};

	device.addEventListener("click", changeDevice);

	document.getElementById('loader-ports').appendChild(device);

};

Involt.prototype.removeLoader = function(){

	var loader = document.getElementById("loader-bg");
	loader.outerHTML = "";
	delete loader;
	
};

Involt.prototype.bottomError = function(message){
	var bottom = document.createElement("div");
	bottom.className = "loader-bottom";
	bottom.textContent = message;
	document.body.appendChild(bottom);

	var removeBar = function(){
		bottom.remove();
	};

	setTimeout(removeBar, 5000);

};

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

	if(involt.stillConnectedDevices.length>0){

		document.getElementById('loader-resume').style.display = "block";

		var resumeSession = function(){

			if(isSerial){
				involt.id = involt.stillConnectedDevices[0].connectionId;
			}
			else if(isBluetooth){
				involt.id = involt.stillConnectedDevices[0].socketId;
			};

			console.log("Resumed previous connection: ID ", involt.id);

		};

		document.getElementById('loader-resume').addEventListener("click", resumeSession);
	};

	var discoverMore = function(){

		involt.bluetoothDiscovery(discoveryDuration);

	};

	if(isBluetooth)	document.getElementById('loader-refresh').addEventListener("click", discoverMore);

};