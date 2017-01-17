/*
	CONVERT VALUES RECEIVED FROM DEVICE

	and pass the values and function triggering to layout.
*/

var involt = window.parent.involt;

var involtFunction = involt.involtFunction;
var involtListenForPin = involt.involtListenForPin;

//variables kept for backward compability of custom scripts
var involtPin = involt.pin.P;
var involtString = involt.pin.S;
var involtReceivedPin = involt.pin.A;

var gotData = function(receiveInfo){
	if (isSerial && receiveInfo.connectionId !== involt.id) return;
	if (isBluetooth && receiveInfo.socketId !== involt.id) return;

	var encodedString = involt.receivedStringConvert(receiveInfo.data);
	//console.log(encodedString);

	var matchingPattern = /[AF][^EAF]+\E/g;
	var dataBlock = encodedString.match(matchingPattern);

	if(dataBlock !== null){
		parseData(dataBlock);
		involt.fullString = '';
	}
	else {
		involt.fullString += encodedString;
		
		var isCompleted = involt.fullString.match(matchingPattern);

		if(isCompleted !== null){
			parseData(isCompleted);
			involt.fullString = '';
		};
		
	}; 
};

var parseData = function(data){
	//console.log(dataBlock);
	for (var j=0; j<data.length; j++){
		var indexA = data[j].indexOf('A');
		var indexV = data[j].indexOf('V');
		var indexE = data[j].indexOf('E');

		if(indexA == 0){

			var index = parseInt(data[j].substring(indexA+1,indexV));
			var value = data[j].substring(indexV+1,indexE);

			if(!isNaN(value)){
				if(value.indexOf('.')>0){
					involt.pin.A[index] = parseFloat(value);
				}
				else {
					involt.pin.A[index] = parseInt(value);
				};
			}
			else{
				involt.pin.A[index] = value;
			};
			if(typeof involtListenForPin[index] === 'function') involtListenForPin[index](index, involt.pin.A[index]);
		}
		else if (data[j].indexOf('F') == 0){
			var name = data[j].substring(1,indexE);
			if(typeof involtFunction[name] === 'function') involtFunction[name]();
		};
	};
}

//Putting this inside the iframe has no need of post message (fix for mobile issues, postMessage is slower and causes problems in cordova);

var startListening = function(){
	if(isSerial){
		window.parent.chrome.serial.onReceive.addListener(gotData);
		window.parent.chrome.serial.onReceiveError.addListener(involt.onError);
	}
	else if(isBluetooth){
		window.parent.chrome.bluetoothSocket.onReceive.addListener(gotData);
		window.parent.chrome.bluetoothSocket.onReceiveError.addListener(involt.onError);
	};
	involt.isListening = true;
};

//start listening after the connection or when receive functions are loaded.
if(!involt.isListening){
	startListening();
};