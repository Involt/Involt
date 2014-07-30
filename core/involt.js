/*
    INVOLT
    ------------------------------
    INVOLT CORE FILE
    Ernest Warzocha 2014
    [Website adress]
    [Github repository link]  
*/

//--------------------------------
//LOADER SETTINGS:
/*Set loaderOnLaunch to false if you dont want to use loader on every launch
(useful when creating your app but not recommended for finished project).*/
var loaderOnLaunch = true;
//If you want to work without launcher you must define your connected arduino port:
var defaultSerialPort = "COM7";

//ARDUINO->CHROME SETTINGS: 
//Total number of analog pins (Arduino UNO - 6; MEGA - 16):
var analogPinsNumber = 6;
/*You can add additional variables that will be send as additional analog 
pin values. Useful for sending data from sensors like gyro etc.*/
var additionalVariables = 0;
/*Example: 6 Analog pins A0, A1 ... A5 and 3 additonal variables as A6, A7, A8.
Remember to include them inside arduino sketch.*/

//--------------------------------

//PORT DETECTION + LOADER PORT LIST
var loaderCtaPort = defaultSerialPort;
var onGetDevices = function(ports) {
  //create list of ports and print it to console 
  console.log("Available port list:");
  for (var j=0; j<ports.length; j++) {
    console.log(ports[j].path);
    //create objects for loader
    if (loaderOnLaunch){
      $(".loader-ports").append('<p>'+ports[j].path+'</p>');
    }
  }
  //change the port for button to connect based on selected port from list
  $(".loader-ports > p").click(function() {
    $(".loader-ports > p").removeClass("active-port");
    $(this).addClass("active-port");
    loaderCtaPort = $(this).html();
  });
}

chrome.serial.getDevices(onGetDevices);

//CONNECTION + ID
var onConnect = function(connectionInfo) {
  //Error message
  if (!connectionInfo) {
    console.error('Could not open, check if Arduino is connected or try other serial port');
    console.error("ヽ༼ຈل͜ຈ༽ﾉ RIOT ヽ༼ຈل͜ຈ༽ﾉ");
    return;
  }
  //Remove loader if connection is successful
  else {
    $("#loader-bg").remove();
    //hack for knob elements
    $(".knob-read").show();
  }
  //connection info
  console.log("Device connected:");
  if (loaderOnLaunch){
    console.log(loaderCtaPort);
  }
  else {
    console.log(defaultSerialPort);
  }
  console.log("Connection ID:");
  console.log(connectionInfo.connectionId);
  _this.connectionId = connectionInfo.connectionId;
}

//LOADER SCREEN
$(document).ready(function() {
  //create loader html elements if loader is on, if not - connect directly
  //hack for not displaying knob numbers on loader screen
  $(".knob-read").hide();

  if (loaderOnLaunch){
    $("body").prepend('<div id="loader-bg"><div id="loader"></div></div>');
    $("#loader").append('<div id="loader-logo">LOGO</div><div class="loader-ports"></div><div id="loader-button">Connect</div>');
  }
  else {
    chrome.serial.connect(defaultSerialPort, {bitrate: 115200}, onConnect);
  }
  //Connect button
  $("#loader-button").click(function() {
    chrome.serial.connect(loaderCtaPort, {bitrate: 115200}, onConnect);
  });
  
});


//SERIAL DATA READ
//Total number of received variables (analog input + additional variables)
var analogPinsNumber = analogPinsNumber + additionalVariables;
//Array of values for each pin
var analogpins = new Array (analogPinsNumber);

var onReceive = function(receiveInfo) {
  //ID test
  if (receiveInfo.connectionId !== 1) return;
  
  //create array from received arduino data (need to be fixed??)
  var Int8View  = new Int8Array(receiveInfo.data);
  encodedString = String.fromCharCode.apply(null, Int8View);
  //console.log(encodedString); 

  //divide encoded string data (pin/value), it also verify the data.
  var Atest = encodedString.indexOf("A");
  var Btest = encodedString.indexOf("E");
  var Ctest = encodedString.indexOf("V");
  var Dtest = encodedString.length;

  /*
    Example block of encoded data (Pin A3 value 872):
    A3V872E
  */

  //corrupted serial data parameters (Based on my observations)
  // remove corrupted serial data from array list
  if (  Atest == 0 && 
        Btest >= 2 && 
        Btest  < 8 && 
        Ctest >= 1 && 
        Ctest <= 2 && 
        Dtest >= 4    ) {
    //pin counter
    i=encodedString.substring(1,Ctest);
    //count each analog pin number and create array of their values
    if (i<=analogPinsNumber){
      analogpins[i] = encodedString.substring(3,Btest);  
      //console.log(analogpins);    
    }
    else{
      i = 0;
    }
  }

//READ ONLY EVENTS 
//Updated every time when serial data is received

  $(function(){
    $(".ard").each(function() {
      //convert css classes to array (fixed for reading - outside function work slow)
      var analogcsssplit = function(analogclasses){
        var pin = analogclasses[2];
        var command = analogclasses[1]; 
        k = pin.substring(1,pin.length);
      }

      //show 
      if ($(this).hasClass("show")){
        var splitcss = $(this).attr('class').split(' ');
        analogcsssplit(splitcss);
          $(this).html(analogpins[k]);
      }
      //bar
      if ($(this).hasClass("bar")){
        var splitcss = $(this).attr('class').split(' ');
        analogcsssplit(splitcss);
          $(this).children(".bar-value").css('width', analogpins[k]);
          $(this).children(".bar-value").html(analogpins[k]);
      }
      //knob
      if ($(this).hasClass("knob-read")){
        var splitcss = $(this).attr('class').split(' ');
        analogcsssplit(splitcss);
          $('.dial').val(analogpins[k]).trigger('change');
      }
      //value
      if ($(this).hasClass("value")){
        var splitcss = $(this).attr('class').split(' ');
        analogcsssplit(splitcss);
          $(this).attr('value', analogpins[k]);
      }

    /*-----------------------------------
    Here should go additional read events
    -----------------------------------*/

    });
  });

};

//Error message when connection is interrupted
var onError = function (errorInfo) {
  console.error("Received error on serial connection: " + errorInfo.error);
};

chrome.serial.onReceive.addListener(onReceive);
chrome.serial.onReceiveError.addListener(onError);

//SERIAL DATA SEND
//Events triggered on action

//Empty function for testing
var onSend = function(){
    
}

//Sends data to arduino based hon event
var arduinosend = function(ardsend){
  chrome.serial.send(1, sendConvertString(ardsend), onSend);
  //console.log(ardsend);
}

//convert "ardsend" string to arduino friendly format
var sendConvertString = function(ardsend) {
  var buf      = new ArrayBuffer(ardsend.length);
  var bufView  = new Uint8Array(buf);
  for (var i   = 0; i < ardsend.length; i++) {
    bufView[i] = ardsend.charCodeAt(i);
  }
  return buf;
}

//SEND EVENTS

//convert css classes to array 
//(fixed for sending - now it changes X times same element exist??)
var sendcsssplit = function(sendclasses){  
  pin     = sendclasses[2];
  value   = sendclasses[3];
  //console.log(sendclasses);    
}

$(document).ready(function() {
  $(".ard").each(function() {

    //button
    if ($(this).hasClass("button")){
      $(this).click(function() {
        var sendcss = $(this).attr('class').split(' ');
        sendcsssplit(sendcss);
        arduinosend(pin+"V"+value+"\n");
      });
    }

    //toggle
    if ($(this).hasClass("toggle")){
      var tog = true;
      $(this).html("ON");
      $(this).click(function() {
        var sendcss = $(this).attr('class').split(' ');
        sendcsssplit(sendcss);
        //digital toggle statements (LOW=0, HIGH=1)
        tog = !tog;

        if (tog){
          arduinosend(pin+"V"+1+"\n");
          $(this).html("ON");
        }
        else {
          arduinosend(pin+"V"+0+"\n");
          $(this).html("OFF");
        }
        $(this).toggleClass('active');

      });
    }

    //increase/decrease (fixed)
    if ($(this).hasClass('btn')){
      //increase/decrease buttons (at this version it has to be done inside one div)
      $(this).append('<div class="increase">+</div><div class="decrease">-</div>')
      $(this).attr('value', 0); 
      //increase
      $(this).children(".increase").click(function() {
        var sendcss = $(this).parent().attr('class').split(' ');
        sendcsssplit(sendcss);
          //increase the .btn value
          var indecsend = parseInt($(this).parent().attr("value"));
          indecsend = indecsend+parseInt(value);
            //limit the value
            var indecsend = Math.min(Math.max(parseInt(indecsend), 0), 255);
            $(this).parent().attr('value', indecsend);
        //send
        arduinosend(pin+"V"+indecsend+"\n");
      });

      $(this).children(".decrease").click(function() {
        var sendcss = $(this).parent().attr('class').split(' ');
        sendcsssplit(sendcss);
          //decrease the .btn value
          var indecsend = parseInt($(this).parent().attr("value"));
          indecsend = indecsend-parseInt(value);
            //limit the value
            var indecsend = Math.min(Math.max(parseInt(indecsend), 0), 255);
            $(this).parent().attr('value', indecsend);
        //send
        arduinosend(pin+"V"+indecsend+"\n");
      });
    }

    //slider
    if ($(this).hasClass("slider")){
      //create slider elements
      $(this).append('<label class="slider-label">0</label>')
      $(this).append('<input class="slider-input" type="range" min="0" value="0" max="255">')
      //change value when used
      $('.slider-input').change( function() {
        //value
        var valslider = $(this).val();
        var valsliderscaled = Math.round( valslider * 10 ) / 10;  
          //pin
          var sendcss = $(this).parent().attr('class').split(' ');
          sendcsssplit(sendcss);
        
        arduinosend(pin+"V"+valslider+"\n");

        //displayed value as number
        $(this).siblings('.slider-label').html(valsliderscaled);
      });
    }

    //knob-write
    if ($(this).hasClass('knob-write')){

      //NOT WORKING :(
        /*

        $(this).knob({
          change: function (knobwrite) {
          
          }
        });



        */
    }

    //input-write
    if ($(this).hasClass("input-write")){
      $(".input-write").change(function() {
        var valwrite = $(this).val();
        var sendcss = $(this).attr('class').split(' ');
        sendcsssplit(sendcss);
          arduinosend(pin+"V"+valwrite+"\n");
      });
    }

    //custom-write
    if ($(this).hasClass("custom-write")){
      $(".custom-write").change(function() {
        var valcustom = $(this).val();
          arduinosend(valcustom+"\n");
      });
    }

    //custom-button
    if ($(this).hasClass("custom-button")){
      $(this).click(function() {
        classes = $(this).attr('class').split(' ');
        var custombut = classes[2]; 
          arduinosend(custombut+"\n");
      });
    }

    /*------------------------------------
    Here should go additional write events
    ------------------------------------*/

  });
});

//HTML ELEMENTS OF FRAMEWORK
//html/css operations that create framework objects in html file (they dont loop)

$(document).ready(function() {
  //bar
  $(".bar").append("<div class='bar-value'>Slider</div>");
  //knob
  $(".knob-read").append('<input type="text" data-width="150" data-height="150" data-fgColor="#00aae2" data-inputColor="#003e53" data-max="255" data-readOnly="true" value="0" class="dial">');
  $(".knob-write").append('<input type="text" data-width="150" data-height="150" data-fgColor="#00aae2" data-inputColor="#003e53" data-max="255" value="0" class="dial">');

  $(function() {
    $(".dial").knob();
  });

});





/*
TODO:
1. CSS poprawić:
- toggle na stanie niekatywnym
- slider dopasowujący wartości względem szerokości (jak zmapować wartość JQUERY)
- increase w podświetleniu
- show
- okno wczytywania(ramka,logo,pattern)
2. JS:
- zapisać zdarzenia za pomocą osobnych funkcji (click dla wszystkich naraz)
- przeprojektować funckcje tak by były zależne (1 zmienna w ciągu - 1 pin)
- dodać hack do linków
- poprawić toggle
- dodać increase,decrease, show (nie analogów)
3. ARDUINO:
- Dodać zbiór dla zmiennych pinów cyfrowych
- na bieżąco aktualizować stany pinów pobranych z ciągu
4.LOGO/NAZWA/TEKST
5.LANDING PAGE
- jedna strona z wszystkim czy podstrony? (foundation/ux pin jako przykład layoutu)
- Strona główna: landing page z paroma CTA
- API (podział read/write, komendy+przykładowy kod, elementy frameworku )
- Samples
- Getting started?
- Contact
- Faq

Table of Contents:

1. Port detection
2. Connection with arduino
3. Serial data read (analog array)
4. Read-only events
  4.1. show OK
  4.2. bar OK
  4.3. knob-read OK - Przy dużej ilości pinów się jebie
  4.4. value OK - Trudno sprawdzić czy działa w 100% - zrobie przykłady później
  //custom-append?????
5. Serial data send
6. Send events
  6.1. button OK
  6.2. toggle OK - Trudno kontrolować różne pozycje początkowe pinu ale działa
  6.3. increase - OK
  6.4. decrease - OK 
  6.5. slider OK
  6.6. knob-write - NOT WORKING
  6.7. input-write OK
  6.8. custom-write OK
  6.9. custom-button OK
7. Additional HTML elements (bar,knob)
8. Additional loader window elements
9. Pages navigation?



//PORT DETECTION
var onGetDevices = function(ports) {
  console.log("Available port list:");
  for (var j=0; j<ports.length; j++) {
    console.log(ports[j].path);
  }
}

chrome.serial.getDevices(onGetDevices);

//CONNECTION + ID
var onConnect = function(connectionInfo) {
  //Error message
  if (!connectionInfo) {
    console.error('Could not open, check if Arduino is connected or try other serial port');
    return;
  }
  //connection info
  console.log("Arduino connected");
  console.log("Connection ID:");
  console.log(connectionInfo.connectionId);
  _this.connectionId = connectionInfo.connectionId;
}

chrome.serial.connect("COM7", {bitrate: 115200}, onConnect);

//HYPERLINKS & APP WINDOWS (NOT REQUIED)
/*
Chrome packaged app block regular html hyperlinks ("a href"). 
You can use these hacks:
(You can only choose one)

//Set to true if you want to use hyperlinks like on normal website.
//var ahrefNormal = false;
//Hyperlinks open as new window.
//var ahrefWindow = false;
//Hyperlinks open inside Iframe.
//var ahrefIFrame = false;

*/