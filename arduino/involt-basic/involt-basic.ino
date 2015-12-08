/*
  INVOLT BASIC ARDUINO SKETCH
  by Ernest Warzocha 2015
  ------------------------------------------------------
  This file can be used for serial communication
  between Arduino Uno and Involt Chrome App. It can be 
  used with HC-05 Bluetooth device connected via 
  hardware serial.
*/

/*
  involtDigital array contains values received from app.
  Each UI element refers to pin number which is index of
  this array. involtString is array for values received
  with "S" pin. You can increase the length of array to
  store more values then arduino total pins. Use them to
  in sketch.
*/
int    involtDigital[14] = {};
String involtString[2] ={};

/*
  Buffer for received data. If you plan to receive more 
  just increase the array length.
*/
char involt[32];

/*
  String for function received from app.
*/
String fname;

void setup() {
 //Connection speed must be same as app.
 Serial.begin(57600);

}

void loop() {
  involtReceive();

  //ADD YOUR CODE HERE

  //Clear the function to trigger once.
  fname = "";
}


/*
  INVOLT FUNCTIONS
  ------------------------------------------------------
  You don't have to look below. Especially if you don't
  want to complicate everything. 

  involtReceive - read the data from app and parse
  the values received into proper array.
  involtSend - send int value.
  involtSendString = send String.
*/
void involtReceive(){
  
  int pin;
  int j = 0;
  char param; 

  while(Serial.available()>0) {
    char current = Serial.read();
    if (current == 'P' || current == 'S' || current == 'F'){
       if(j == 0) param = current;
    }
    else if(current == 'V' && param != 'F'){
      pin = atoi(involt);
      memset(involt,0,sizeof(involt));
      j = 0;
    }
    else if(current == '\n'){
      if(param == 'P') involtDigital[pin] = atoi(involt);
      else if(param == 'S') involtString[pin] = involt;
      else if(param == 'F') fname = involt;
      memset(involt,0,sizeof(involt));
      break;
    }
    else {
      involt[j] = current;
      j++;
    };
  };
};

void involtSend(int pinNumber, int sendValue){
  Serial.print('A'); 
  Serial.print(pinNumber); 
  Serial.print('V'); 
  Serial.print(sendValue); 
  Serial.println('E'); 
};

void involtSendString(int pinNumber, String sendString){
  Serial.print('A'); 
  Serial.print(pinNumber); 
  Serial.print('V'); 
  Serial.print(sendString); 
  Serial.println('E'); 
};
