
void setup() {
  Serial.begin(115200);
}

String chrome;
String A = "A";
String V = "V";
String E = "E";
String pwm = "P";
int pin;
int val;
int chromeLen;
int vara =0;

void loop() {  
  //Number of analog pins, pin A0 is chromeAnalog[0]
  int chromeAnalog[6] = {};
  
  chromeReceive();

  //send input values to chrome (i is number of pins)
  for (int i=0; i<6; i++){
    //increase dealay to reduce cpu usage of app.
    delay(6);
    Serial.println(A+i+V+chromeAnalog[i]+E);
  }
}

void chromeReceive(){
  if(Serial.available() > 0){
    String chrome = Serial.readStringUntil('\n');
    int chromeLen = chrome.length();
    String pinraw = chrome.substring(1,chrome.indexOf(V));
    String valraw = chrome.substring(chrome.indexOf(V)+1,chromeLen);
    pin = pinraw.toInt();
    val = valraw.toInt();

    if (chrome.indexOf(pwm) == -1){
      digitalWrite(pin, val);
    }
    else if (chrome.indexOf(pwm) >= 0 ){ 
      analogWrite(pin, val);
    }
    
  }
}
