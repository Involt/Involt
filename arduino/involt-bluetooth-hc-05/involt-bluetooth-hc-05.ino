//INVOLT ARDUINO SERIAL COMMUNICATION SKETCH
/*
  AUTO PINMODE
  Involt by default automatically adds pinMode to received
  pin data so you don't need to add pinMode output in setup for
  basic interactions. This mode is not recommended when
  mixing digital inputs and outputs.
*/
boolean autoPinMode = true;
/*
  DIRECT MODE
  Direct mode sends data from app to digital pins without storing
  it in involtDigital array and without additional code in void
  loop. It can be used for testing interaction with Arduino
  inside App. In direct mode digitalWrite/analogWrite is
  automatic only for values received from Involt.
*/
boolean directMode = true;
/*
  ARRAY FOR DIGITAL/PWM PINS
  IMPORTANT: You need to declare the beginning number of variables.
  Without the declared length there may occur problems when sending
  undeclared value to declared pin in void loop.
  Default is Arduino UNO total pin number +1. 
*/
int involtDigital[14] = {};

String fname;

//Software serial for HC-05 Bluetooth
#include <SoftwareSerial.h>
SoftwareSerial InvoltBT(2, 3);

void setup() {
  Serial.begin(57600);
  InvoltBT.begin(57600);
}


void loop() {
  //receive data from your app, do not remove this line.
  involtReceive();
  involtSend(0, analogRead(A0));
  delay(2);
  involtSend(1, analogRead(A1));
  
  //Add your code here
  delay(2);
  
  //clear the fname to prevent from duplicating functions
  fname = "";
}

//----------------------
//INVOLT FUNCTIONS

String V = "V";
String A = "A";
String E = "E";

void involtSend(int pinNumber, int sendValue) {
  InvoltBT.println(A + pinNumber + V + sendValue + E);
}

void involtSendString(int pinNumber, String sendString) {
  InvoltBT.println(A + pinNumber + V + sendString + E);
}

void involtReceive() {

  String involt;
  int involtLen;
  int pin;
  int val;
  
  String pwm = "P";
  String dig = "D";
  String fn = "FN";
  
  if (InvoltBT.available() > 0) {
    involt = InvoltBT.readStringUntil('\n');
    involtLen = involt.length();

    if (involt.indexOf(fn) == 0) {
      fname = involt.substring(2, involtLen);
    }
    else if (involt.indexOf(dig) == 0 || involt.indexOf(pwm) == 0 ){
      pin = involt.substring(1, involt.indexOf(V)).toInt();
      val = involt.substring(involt.indexOf(V) + 1, involtLen).toInt();
      

      if (autoPinMode) {
        pinMode(pin, OUTPUT);
      };

      if (directMode) {
        if (involt.indexOf(dig) == 0) {
          digitalWrite(pin, val);
        }
        else if (involt.indexOf(pwm) == 0 ) {
          analogWrite(pin, val);
        };
      }
      else {
        involtDigital[pin] = val;
      };

    };
    
  };
};
