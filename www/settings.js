/*
		INVOLT CONNECTION SETTINGS
		Ernest Warzocha 2016
		involt.github.io
*/

//----------------------------------------------------------------------------------------------

	/*
		CONNECTION TYPE
		Select connection type, only ONE can be defined at once.
	*/
	var isSerial    = true; //Desktop
	var isBluetooth = false; //Desktop AND Mobile (BT 2.0)
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
		Changes from chrome apps to node-webkit made this currently not working (?).
	*/
	var defaultSerialPort = "COM4";
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
		CONNECTION UUID (Serial Port Profile)
	*/
	var uuid = "00001101-0000-1000-8000-00805f9b34fb";
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