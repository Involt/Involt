//INVOLT ARDUINO SKETCH
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
  it in chromeDigital array and without additional code in void 
  loop. It can be used for testing interaction with Arduino 
  inside App. In direct mode digitalWrite/analogWrite is 
  automatic only for values received from Involt.
*/
  boolean directMode = false;
  
  //Array for digital pins.
  int chromeDigital[] = {};

void setup() {
  //Do not change the serial connection bitrate.
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
  int chromeLen;
  int pin;
  int val;
  
  if(Serial.available() > 0){
    String chrome = Serial.readStringUntil('\n');
    int chromeLen = chrome.length();
    pin = chrome.substring(1,chrome.indexOf(V)).toInt();
    String valRaw = chrome.substring(chrome.indexOf(V)+1,chromeLen);
    val = valRaw.toInt();
    
    if (autoPinMode){
      pinMode(pin, OUTPUT);
    };
    
    if (directMode){
      if (chrome.indexOf(dig) == 0){
        digitalWrite(pin, val);
      }
      else if (chrome.indexOf(pwm) == 0 ){ 
        analogWrite(pin, val);
      };
    }
    else{
      chromeDigital[pin]=val;
    };
    
  }
};
