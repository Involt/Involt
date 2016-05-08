/*
  INVOLT BLUEFRUIT LE SKETCH
  based on Adafruit bleuart_cmdmode sketch,
  adapted by Ernest Warzocha 2016
  ------------------------------------------------------
  This file was tested on Adafruit Bluefruit LE Micro.
  However, it should work on other Bluefruit derivatives.

  Bluetooth Low Energy and Involt works ONLY on mobile.
  Remember to set isLowEnergy (only) in settings.js to true.
*/

/*
  involtPin array contains values received from app.
  Each UI element refers to pin number which is index of
  this array. involtString is array for values received
  with "S" pin. You can increase the length of array to
  store more values then arduino total pins. Use them 
  in sketch for not only pin-to-pin communication.
*/
int    involtPin[14] = {};
String involtString[2] ={};

/*
  Buffer for received data is in BluefruitConfig.
*/

/*
  String for function received from app.
*/
String fname;


/*
  Bluefruit Required
*/

#include <Arduino.h>
#include <SPI.h>
#if not defined (_VARIANT_ARDUINO_DUE_X_) && not defined (_VARIANT_ARDUINO_ZERO_)
  #include <SoftwareSerial.h>
#endif

#include "Adafruit_BLE.h"
#include "Adafruit_BluefruitLE_SPI.h"
#include "Adafruit_BluefruitLE_UART.h"
#include "BluefruitConfig.h"

#define FACTORYRESET_ENABLE         1
#define MINIMUM_FIRMWARE_VERSION    "0.6.6"
#define MODE_LED_BEHAVIOUR          "MODE"

Adafruit_BluefruitLE_SPI ble(BLUEFRUIT_SPI_CS, BLUEFRUIT_SPI_IRQ, BLUEFRUIT_SPI_RST);

// A small helper
void error(const __FlashStringHelper*err) {
  Serial.println(err);
  while (1);
};

void setup(void){
  while (!Serial);  // required for Flora & Micro
  delay(500);

  Serial.begin(115200);
  
  //Everything related to bluefruit setup (for better readability of sketch)
  bluefruitInit();
};

void loop(void){


  
  char inputs[BUFSIZE+1];
  involtReceive();



  // ADD YOUR CODE HERE


  //Clear the function to trigger once.
  fname = "";
};

/*
  INVOLT AND BLUEFRUIT FUNCTIONS
  ------------------------------------------------------
  You don't need to change anything below. The functions
  works same as in involt-basic sketch but they have 
  different behaviour to fit the needs of BT Low Energy 
  protocol and the Bluefruit itself.
*/

void involtReceive(){
  // Check for incoming characters from Bluefruit
  ble.println("AT+BLEUARTRX");
  ble.readline();
  if (strcmp(ble.buffer, "OK") == 0) {
    // no data
    return;
  }

  int pin;
  if (ble.buffer[0] == 'P'){
    int value;
    sscanf(ble.buffer, "P%dV%d", &pin, &value);
    involtPin[pin] = value;
  }
  else if (ble.buffer[0] == 'S'){
    char value[sizeof(ble.buffer)];
    sscanf(ble.buffer, "S%dV%s", &pin, &value);
    involtString[pin] = value;
  }
  else if (ble.buffer[0] == 'F'){
    char value[sizeof(ble.buffer)];
    sscanf(ble.buffer, "F%s", &value);
    fname = value;
  };
  //Serial.println(ble.buffer);
  ble.waitForOK();
};

void involtSend(int pinNumber, int sendValue){
  ble.print("AT+BLEUARTTX=");
  ble.print('A'); 
  ble.print(pinNumber); 
  ble.print('V'); 
  ble.print(sendValue); 
  ble.println('E');
  if (! ble.waitForOK() ) {
    Serial.println(F("Failed to send?"));
  };
};

void involtSendString(int pinNumber, String sendString){
  ble.print("AT+BLEUARTTX=");
  ble.print('A'); 
  ble.print(pinNumber); 
  ble.print('V'); 
  ble.print(sendString); 
  ble.println('E'); 
  if (! ble.waitForOK() ) {
    Serial.println(F("Failed to send?"));
  };

};

void involtSendFunction(String functionName){
  ble.print("AT+BLEUARTTX=");
  ble.print('F'); 
  ble.print(functionName); 
  ble.println('E'); 
  if (! ble.waitForOK() ) {
    Serial.println(F("Failed to send?"));
  };
};

void bluefruitInit(){
  if ( !ble.begin(VERBOSE_MODE) ){
    error(F("Couldn't find Bluefruit"));
  };
  
  Serial.println( F("OK!") );
  if (FACTORYRESET_ENABLE){
   Serial.println(F("Performing a factory reset: "));
   if ( ! ble.factoryReset() ){
      error(F("Couldn't factory reset"));
    };
  };

  ble.echo(false);
  ble.info();
  ble.verbose(false);

  /* Wait for connection */
  while (! ble.isConnected()) {
      delay(500);
  };
};
