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
  int chromeDigital[14] = {};
  
/*
  analogNumber - total number of analog pin variables,
  pin A0 is chromeAnalog[0].
*/
  #define analogNumber 6
  int chromeAnalog[analogNumber] = {};

void setup() {
  Serial.begin(115200);
}

void loop() {  
  //receive data from your app
  chromeReceive();
  
  
  
  
  //send data to your app
  chromeSend();
}

//----------------------

void chromeSend(){
  String A = "A";
  String E = "E";
   for (int i=0; i<analogNumber; i++){
    /*
      High delay - lower CPU usage, 
      Low delay - smoothnes of read elements 
      (not recomended to remove this delay)
    */
    delay(6);
    Serial.println(A+i+"V"+chromeAnalog[i]+E);
  }
}

void chromeReceive(){
  String chrome;
  String pwm = "P";
  int pin;
  int val;
  int chromeLen;
  
  if(Serial.available() > 0){
    String chrome = Serial.readStringUntil('\n');
    int chromeLen = chrome.length();
    String pinRaw = chrome.substring(1,chrome.indexOf("V"));
    String valRaw = chrome.substring(chrome.indexOf("V")+1,chromeLen);
    pin = pinRaw.toInt();
    val = valRaw.toInt();

    if(directMode){
      if (chrome.indexOf(pwm) == -1){
        digitalWrite(pin, val);
      }
      else if (chrome.indexOf(pwm) >= 0 ){ 
        analogWrite(pin, val);
      }
    }
    else{
      chromeDigital[pin]=val;
    }
    
  }
}
