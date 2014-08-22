/*
    INVOLT
    ------------------------------
    INVOLT CORE FILE
    Ernest Warzocha 2014
    involt.github.io
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
    //create port buttons for loader
    if (loaderOnLaunch){
      $(".loader-ports").append('<p>'+ports[j].path+'</p>');
      //change selected port when clicked
      $(".loader-ports > p").click(function() {
        $(".loader-ports > p").removeClass("active-port");
        $(this).addClass("active-port");
        loaderCtaPort = $(this).html();
      });
    }
  }
}

//Function when connecting with Arduino
var onConnect = function(connectionInfo) {
  //Error message
  if (!connectionInfo) {
    console.error('Could not open, check if Arduino is connected or try other serial port');
    console.error("ヽ༼ຈل͜ຈ༽ﾉ RIOT ヽ༼ຈل͜ຈ༽ﾉ");
    return;
  }
  //Remove loader if connection is successful + hack for knob and slider
  else {
    $("#loader-bg").remove();
    $(".knob, .knob-send, .slider").show();
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

//get the port list for loader
chrome.serial.getDevices(onGetDevices);

//LOADER
if(loaderOnLaunch){
  $(document).ready(function() {
    //hack for UI elements that shows on loader background
    $(".knob, .knob-send, .slider").hide();
    //create loader elements
    $("body").prepend('<div id="loader-bg"><div id="loader"></div></div>');
    $("#loader").append('<div id="loader-logo"><img src="img/logo.png" alt="" /></div><div>Please select Arduino port:</div><div class="loader-ports"></div><div id="loader-button">Connect</div>');
    //connect button
    $("#loader-button").click(function() {
      chrome.serial.connect(loaderCtaPort, {bitrate: 115200}, onConnect);
    });
  });

}
else{
  chrome.serial.connect(defaultSerialPort, {bitrate: 115200}, onConnect);
}



//SERIAL DATA READ
//Total number of received variables (analog input + additional variables)
var analogPinsNumber = analogPinsNumber + additionalVariables;
//Array of values for each pin
var analogPins = new Array (analogPinsNumber);

var onReceive = function(receiveInfo) {
  //ID test
  if (receiveInfo.connectionId !== 1) return;
  
  //create array from received arduino data (need to be fixed??)
  var Int8View  = new Int8Array(receiveInfo.data);
  encodedString = String.fromCharCode.apply(null, Int8View);

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
        Ctest >= 1 && 
        Dtest >= 4    ) {
    //pin counter
    i=parseInt(encodedString.substring(1,Ctest));
    //count each analog pin number and create array of their values
    if (i<=analogPinsNumber){
      analogPins[i] = parseInt(encodedString.substring(Ctest+1,Btest));     
    }
    else{
      i = 0;
    }
  }

};

//READ ONLY EVENTS 
//Updated in 50ms interval to reduce CPU usage

var analogCssSplit = function(analogClasses){
  var pin     = analogClasses[2];
  var command = analogClasses[1]; 
  k = pin.substring(1,pin.length);
}

var analogUpdate = function(){
  $(".ard").each(function() {
    //show 
    if ($(this).hasClass("show")){
      var splitCss = $(this).attr('class').split(' ');
      analogCssSplit(splitCss);
      $(this).html(analogPins[k]);
    }
    //bar
    if ($(this).hasClass("bar")){
      var splitCss = $(this).attr('class').split(' ');
      analogCssSplit(splitCss);
      //map the value to bar pixel width
      var maxValue = parseInt(splitCss[3]);
      var barMaxWidth = parseInt($(this).css('width'));
        //scaling the variable
        var widthMap = (barMaxWidth-0)/(maxValue-0)*(analogPins[k]-maxValue)+barMaxWidth;
      $(this).children(".bar-value").css({
        "width": widthMap,
        "max-width": barMaxWidth
      });
      $(this).children(".bar-value").children('div').html(analogPins[k]);
    }
    //knob
    if ($(this).hasClass("knob")){
      var splitCss = $(this).attr('class').split(' ');
      analogCssSplit(splitCss);
      $(this).children().children('.knob-read').val(analogPins[k]).trigger('change');
    }
    //value
    if ($(this).hasClass("value")){
      var splitCss = $(this).attr('class').split(' ');
      analogCssSplit(splitCss);
      $(this).attr('value', analogPins[k]);
    }

    /*------------------------------------
    Here should go additional write events
    ------------------------------------*/

  });
}

setInterval(analogUpdate, 50);

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
    //console.log(ardSend);
}

//Sends data to arduino based on event
var arduinoSend = function(pin, value){
  //check if there are more pins to send
  if(pin.indexOf("-")>0){
    var multiPins = pin.split("-");
    //send value to each pin
    for(var m=0; m<=multiPins.length-1; m++){
      //check if there are multiple values
      if(value.indexOf("-")>0){
        //multiple values+pins
        var multiPinsVal = value.split("-");
        ardSend = multiPins[m]+"V"+multiPinsVal[m]+"\n";
          chrome.serial.send(1, sendConvertString(ardSend), onSend);
      }
      else {
        //multiple pins - same values
        ardSend = multiPins[m]+"V"+value+"\n";
          chrome.serial.send(1, sendConvertString(ardSend), onSend);  
      }
    }
  }
  else {
    //single pin + value
    ardSend = pin+"V"+value+"\n";
      chrome.serial.send(1, sendConvertString(ardSend), onSend);
  }
}

//convert "ardSend" string to arduino serial-friendly format
var sendConvertString = function(ardSend) {
  var buf      = new ArrayBuffer(ardSend.length);
  var bufView  = new Uint8Array(buf);
  for (var i   = 0; i < ardSend.length; i++) {
    bufView[i] = ardSend.charCodeAt(i);
  }
  return buf;
}

//SEND EVENTS
var digitalPins = [];
//convert css classes to array 
//(fixed for sending - now it changes X times same element exist??)
var sendCssSplit = function(sendClasses){  
  pin       = sendClasses[2];
  pinNumber = pin.substring(1,pin.length);
  value     = sendClasses[3];
  //console.log(sendClasses);    
}

$(document).ready(function() {

  $(".ard").not('.custom-write').each(function() {
    //defines value for each pin in digitalPins array (only on startup)
    var sendCss = $(this).attr('class').split(' ');
    sendCssSplit(sendCss);
    //remove analog pin from reading on startup
    if(pin.indexOf("A")<0){
      digitalPins[pinNumber] = parseInt(sendCss[3]);
      //console.log(digitalPins);
    }

    //button
    if ($(this).hasClass("button")){      
      $(this).click(function() {
        sendCssSplit(sendCss);
        digitalPins[pinNumber] = value;
          arduinoSend(pin, digitalPins[pinNumber]);
      });
    }

     //toggle
    if ($(this).hasClass("toggle")){
       
      if (digitalPins[pinNumber]==0){
        $(this).html("OFF");
        $(this).addClass('inactive')
      }
      else if (digitalPins[pinNumber]==1){
        $(this).html("ON");
      }
      $(this).click(function() {
       sendCssSplit(sendCss);
        if (digitalPins[pinNumber]==0){
          $(this).html("ON");
          $(this).toggleClass('inactive');
            digitalPins[pinNumber]=1;
              arduinoSend(pin, digitalPins[pinNumber]);
        }
        else if (digitalPins[pinNumber]==1){
          $(this).html("OFF");
          $(this).toggleClass('inactive');
            digitalPins[pinNumber]=0; 
              arduinoSend(pin, digitalPins[pinNumber]);         
        }
      });
    }

    //increase
    if ($(this).hasClass('increase')) {
      $(this).html("+");
      $(this).click(function() {
        var sendCss = $(this).attr('class').split(' ');
        sendCssSplit(sendCss);
        digitalPins[pinNumber] = digitalPins[pinNumber]+parseInt(sendCss[5]);
        digitalPins[pinNumber] = Math.min(Math.max(parseInt(digitalPins[pinNumber]), 0), sendCss[4]);
          arduinoSend(pin, digitalPins[pinNumber]); 
      });
    }

    //decrease
    if ($(this).hasClass('decrease')) {
      $(this).html("-");
      $(this).click(function() {
        var sendCss = $(this).attr('class').split(' ');
        sendCssSplit(sendCss);
        digitalPins[pinNumber] = digitalPins[pinNumber]-parseInt(sendCss[5]);
        digitalPins[pinNumber] = Math.min(Math.max(parseInt(digitalPins[pinNumber]), 0), sendCss[4]);
          arduinoSend(pin, digitalPins[pinNumber]); 
      });
    }

    //slider
    if ($(this).hasClass('slider')) {
      $(this).append('<div class="sliderjq"></div>');
      $(this).append('<div class="tooltip">0</div>');
      $(this).append('<input class="slidervalue" disabled>');
      $(".tooltip").hide();
      $(".slidervalue").hide();

      $(this).hover(function() {
        $(this).children('.tooltip').fadeIn(250);
      }, function() {
        $(this).children('.tooltip').fadeOut(250);
      });

      //Call the Slider
      $(this).children('.sliderjq').slider({
        //Config
        range: "min",
        min: 0,
        max: value,
        value: 0,

        start: function( event, ui ) {
          var sendCss = $(this).parent().attr('class').split(' ');
          sendCssSplit(sendCss); 
        },

        //Slider Event
        slide: function(event, ui) {
          var tooltipPosition = $(this).children(".ui-slider-handle").css('left');
          $(this).siblings('.tooltip').css('left', tooltipPosition); 
          $(this).siblings('.tooltip').text(ui.value);
          $(this).siblings('.slidervalue').val(ui.value).change();    
          digitalPins[pinNumber] = $(this).siblings('.tooltip').html();
            arduinoSend(pin, digitalPins[pinNumber]); 

        },

        stop: function( event, ui ) {
          var tooltipPosition = $(this).children(".ui-slider-handle").css('left');
          $(this).siblings('.tooltip').css('left', tooltipPosition);
          digitalPins[pinNumber] = $(this).siblings('.tooltip').html();
            arduinoSend(pin, digitalPins[pinNumber]);              
        },

      });
    }

    //hover
    if ($(this).hasClass("hover")){
      $(this).mouseenter(function() {
        sendCssSplit(sendCss);
          arduinoSend(pin, digitalPins[pinNumber]);
      });
      $(this).mouseleave(function() {
        sendCssSplit(sendCss);
          arduinoSend(pin, sendCss[4]);
      });
    }

    //input-write
    if ($(this).hasClass("input-write")){
      $(this).mouseenter(function(event) {
        var sendCss = $(this).attr('class').split(' ');
        digitalPins[pinNumber] = $(this).val();
        sendCssSplit(sendCss);
      });
      $(this).change(function() {
        var sendCss = $(this).attr('class').split(' ');
        digitalPins[pinNumber] = $(this).val();
        sendCssSplit(sendCss);
          arduinoSend(pin, digitalPins[pinNumber]);
      });
    }

    //custom-button
    if ($(this).hasClass("custom-button")){
      $(this).click(function() {
        classes = $(this).attr('class').split(' ');
        var customBut = classes[2]+"\n"; 
          chrome.serial.send(1, sendConvertString(customBut), onSend);
      });
    }

    /*------------------------------------
    Here should go additional write events
    ------------------------------------*/

  });

    //custom-write
    if ($(".ard").hasClass("custom-write")){
      $(".custom-write").change(function() {
        var valCustom = $(this).val();
        var valCustomSend = valCustom+"\n";
          chrome.serial.send(1, sendConvertString(valCustomSend), onSend);
      });
    }

//HTML GENERATED ELEMENTS OF FRAMEWORK
//html/css operations that create framework objects in html file 

  //bar
  $(".bar").append('<div class="bar-value"><div>Loading...</div></div>');
  //knob
  $(".knob").append(function() {
    var splitCss = $(this).attr('class').split(' ');
    var knobMax  = splitCss[3];
    $(this).append('<input type="text" data-width="180" data-height="180" data-fgColor="#0099e7" data-inputColor="#282828;" data-max="'+knobMax+'" data-readOnly="true" value="0" class="knob-read">'); 
  });

  //knob-send (plugin function)
  $(".knob-send").append(function() {
    var sendCss = $(this).attr('class').split(' ');
    var knobMax  = sendCss[3];
    sendCssSplit(sendCss);
    $(this).append('<input type="text" data-width="180" data-height="180" data-fgColor="#0099e7" data-inputColor="#282828;" data-max="'+knobMax+'"value="0" data-displayPrevious="true" class="knob-write">'); 
    $(this).children(".knob-write").knob({
      'change' : function (value) {
        sendCssSplit(sendCss);
        digitalPins[pinNumber] = value;
        arduinoSend(pin, digitalPins[pinNumber]);
        //console.log(pin+"-"+digitalPins[pinNumber]);
      }
    });
  }); 

  //jquery-knob plugin function
  $(function() {
    $(".knob-read").knob();
  });

  $("#involthankyou").css({
    "margin": '0 auto',
    "margin-top": '300px',
    "width": '90%',
    "text-align": 'center',
    "font-size": 36,
    "font-family": 'Source Sans Pro Light',
  });

});