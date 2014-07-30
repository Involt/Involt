int led1 = 11;

void setup() {
  Serial.begin(115200);

  pinMode(led1, OUTPUT);
  digitalWrite(led1, HIGH);

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


  if(Serial.available() > 0)
  {
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

  int pot = analogRead(A0);
  int potmap = map(pot,0,1023,0,255);
  

  vara++;
  int chromeAnalog[]= { potmap,666,1004,900,97,9 };

  for (int i=0; i<6; i++){
    delay(6);
    Serial.println(A+i+V+chromeAnalog[i]+E);
  }
  int i=0;

}

