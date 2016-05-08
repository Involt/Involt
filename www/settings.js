/*
		INVOLT CONNECTION SETTINGS
		Ernest Warzocha 2015
		involt.github.io
*/

//----------------------------------------------------------------------------------------------

	/*
		CONNECTION TYPE
		Select connection type, only ONE can be defined at once.
	*/
	var isSerial    = true;  //Desktop
	var isBluetooth = false; //Desktop AND Mobile (BT 2.0)
	var isLowEnergy = false; //Mobile (BT LE)
	/*
		LOADING SCREEN
		Set loaderOnLaunch to false and skip loading screen on app launch. 
		Remember to set default connection settings because it's not possible when app is running.
	*/
	var loaderOnLaunch = true;
	/*
		DEFAULT SERIAL PORT
		Choose default serial port to set the connection port when loader is not used.

		PERSISTENT SERIAL CONNECTION
		Use isPersistent to hold the connection after app shutdown. The session is returned when
		relaunching. It's set to false by default because it blocks Arduino sketch upload process.
	*/
	var defaultSerialPort = "COM3";
	var isPersistent = false;
	/*
		BLUETOOTH DEFAULT ADDRESS
		Bluetooth default address. Use when loader is not used.

		BLUETOOTH DISCOVERY DURATION
		In some cases it will take more time for some devices to find them.
	*/
	var defaultBtAddress = "98:D3:31:90:4C:66";
	var discoveryDuration = 3000;
	/*
		CONNECTION UUID
		DESKTOP: The UUID must be same in manifest.json and the app must be reloaded from extensions menu.
		You can get the UUID of your device form hardware documentation or app's chrome console.

		Variable uuid is device uuid.
	*/
	var uuid = "00001101-0000-1000-8000-00805f9b34fb";
	/*
		For Bluetooth Low Energy:
		Change the RX/TX uuid for communication, you should get them from device documentation.
	*/
	var uuidTx = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; //send to device
	var uuidRx = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; //read from device
	/*
		BITRATE
		The bitrate should remain unchanged. 
		If you have to lower the speed don't overload the port from arduino.
		Bitrate in software and hardware must be the same.
	*/
	var bitrate = 57600;
	/*
		RECEIVED VALUES UI UPDATE RATE
		Set update rate of read-only elements in miliseconds. 
		Lower value improves response of UI elements but increases CPU usage.
	*/
	var updateRate = 50;
	/*
		DEBUG MODE
		Debug mode logs more information to console.
	*/
	var debugMode = false;

//----------------------------------------------------------------------------------------------