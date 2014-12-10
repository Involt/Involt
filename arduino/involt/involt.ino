//INVOLT ARDUINO SKETCH

/*
  DIRECT MODE
  Direct mode send data from app to digital pins without storing
  them in chromeDigital array. For more complex project with
  specified libraries and multiplexers you should set directMode 
  to false and use chromeDigital array to distribute data. 
  
  IMPORTANT
  In direct mode digitalWrite/analogWrite is automatic only for
  values received from Involt.
*/
  boolean directMode = true;
  
//Array for digital pins 
  int chromeDigital[] = {};

void setup() {
  Serial.begin(115200);
}

void loop() {  
  //receive data from your app, do not remove this line.
  chromeReceive();
  

}

//----------------------
  String V = "V";

void chromeSend(int pinNumber, int sendValue){
  String A = "A";
  String E = "E";
  Serial.println(A+pinNumber+V+sendValue+E);
}

void chromeReceive(){
  String chrome;
  String pwm = "P";
  String dig = "D";
  int pin;
  int val;
  int chromeLen;
  
  if(Serial.available() > 0){
    String chrome = Serial.readStringUntil('\n');
    int chromeLen = chrome.length();
    String pinRaw = chrome.substring(1,chrome.indexOf(V));
    String valRaw = chrome.substring(chrome.indexOf(V)+1,chromeLen);
    pin = pinRaw.toInt();
    val = valRaw.toInt();

    if(directMode){
      if (chrome.indexOf(dig) == 0){
        digitalWrite(pin, val);
      }
      else if (chrome.indexOf(pwm) == 0 ){ 
        analogWrite(pin, val);
      }
    }
    else{
      chromeDigital[pin]=val;
    }
    
  }
}
