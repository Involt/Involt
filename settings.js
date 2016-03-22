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
	var isSerial    = false;
	var isBluetooth = true;
	/*
		MOBILE/DESKTOP
		Create project as desktop Chrome packaged app or Cordova/Phonegap mobile app.
		For Involt it's default set to false. Involt mobile template have all required assets.
		When switching from desktop to mobile, changes in App UI are not required but make sure to 
		paste HTML code to mobile template.

		IMPORTANT
		Mobile support works only with bluetooth and is developed (and tested) for Android.
		For details on mobile setup check involt website.
	*/
	var isMobile = false;
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

		CONNECTION UUID
		The UUID must be same in manifest.json and the app must be reloaded from extensions menu.
		You can get the UUID of your device from hardware documentation or app's chrome console.

		BLUETOOTH DISCOVERY DURATION
		In some cases it will take more time for some devices to find them.
	*/
	var defaultBtAddress = "98:D3:31:90:4C:66";
	var uuid = "00001101-0000-1000-8000-00805f9b34fb";
	var discoveryDuration = 3000;
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
	var debugMode = true;

//----------------------------------------------------------------------------------------------