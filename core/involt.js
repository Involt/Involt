/*
    INVOLT
    ------------------------------
    INVOLT CORE FILE
    Ernest Warzocha 2014
    involt.github.io
*/

//--------------------------------

//LOADER SETTINGS:
/*Set loaderOnLaunch to false if you dont want to run loader on every launch
(direct connction is useful when creating your app but not recommended for finished project).*/
var loaderOnLaunch = true;
//If you want to work without launcher you must define your connected arduino port:
var defaultSerialPort = "COM7";
//Connection bitrate (slow bitrate will send errors)
var arduinoBitrate = 115200;

//--------------------------------

//PORT DETECTION + LOADER PORT LIST
var loaderCtaPort = defaultSerialPort;
// ID of the connection, defined once.
var involtID;

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
    console.error('Could not open, check if Arduino is connected or try other serial port', "ヽ༼ຈل͜ຈ༽ﾉ RIOT ヽ༼ຈل͜ຈ༽ﾉ");
    return;
  }
  //Remove loader if connection is successful + hack for knob and slider
  else {
    $("#loader-bg").remove();
    $(".knob, .knob-send, .rangeslider").show();
  }

  console.log("Device connected:");
  if (loaderOnLaunch){
    console.log(loaderCtaPort);
  }
  else {
    console.log(defaultSerialPort);
  }

  console.log("Connection ID:", connectionInfo.connectionId);

  involtID = connectionInfo.connectionId;
}

//get the port list for loader
chrome.serial.getDevices(onGetDevices);

//LOADER
if(loaderOnLaunch){
  $(document).ready(function() {
    //hack for UI elements that shows on loader background
    $(".knob, .knob-send, .rangeslider").hide();
    //create loader elements
    $("body").prepend('<div id="loader-bg"><div id="loader"></div></div>');
      $("#loader").append('<div id="loader-logo"><img src="img/logo.png" alt="" /></div><div>Please select Arduino port:</div><div class="loader-ports"></div><div id="loader-button">Connect</div>');
    //connect button
    $("#loader-button").click(function() {
      chrome.serial.connect(loaderCtaPort, {bitrate: arduinoBitrate}, onConnect);
    });
  });

}
else{
  chrome.serial.connect(defaultSerialPort, {bitrate: arduinoBitrate}, onConnect);
}

//IDENTIFY INVOLT OBJECTS AND DEFINE THEIR PARAMETERS

//analog pins values (real time update)
var analogPins = [];
//digital pins values
var digitalPins = [];
//identify involt elements
$(document).ready(function() {
  $(".ard").not(".custom-write").each(function(index, el) {
    //split css classes and store them for each object
    $(this).data($(this).attr('class').split(' '));

      //set default values and their pins
      var pinRawData = $(this).data('2');
      var pinData    = parseInt(pinRawData.substring(1,pinRawData.length));
      var valueData  = $(this).data('3');

      $(this).data('pinNumber', pinData);

    if (pinRawData.indexOf("A")<0){
      //define default value for digital pins
      digitalPins[pinData] = valueData;

      //check if string is number and convert
      var numberCheck = isNaN(digitalPins[pinData]);
      if (numberCheck == false) {
         digitalPins[pinData] = parseInt(valueData);
      }
    }
    else if (pinRawData.indexOf("A")==0){
      //define analog pins variables
      analogPins[pinData] = pinData;
    };

  });

  //HTML GENERATED ELEMENTS OF FRAMEWORK
  //html/css operations that create framework objects in html file 
  //bar
  $(".bar").append('<div class="bar-value"><div>Loading...</div></div>');
 
  //knob
  $(".knob").append(function() {
    var knobMax  = $(this).data('3');
    $(this).append('<input type="text" data-width="180" data-height="180" data-fgColor="#0099e7" data-inputColor="#282828;" data-max="'+knobMax+'" data-readOnly="true" value="0" class="knob-read">'); 
  });

  //knob-send
  $(".knob-send").append(function() {
    var knobMax     = $(this).data("4");
    var knobCurrent = $(this).data("3");
    $(this).append('<input type="text" data-width="180" data-height="180" data-fgColor="#0099e7" data-inputColor="#282828;" data-max="'+knobMax+'"value="'+knobCurrent+'" data-displayPrevious="true" data-angleOffset="-140" data-angleArc="280" class="knob-write">'); 
  })

  //rangeslider
  $(".rangeslider").append('<div class="rangeval"></div><div class="rangeobj"></div>');
  $(".rangeobj").replaceWith('<input type="text" class="range"/><div class="tooltip">slide</div>');

  $(function() {
    $(".knob-read").knob();
  });

  $("#involthankyou").css({
    "margin": '0 auto',
    "margin-top": '300px',
    "width": '90%',
    "text-align": 'center',
    "font-size": 36,
    "font-family": 'SourceSansProLight',
  });
});

//SERIAL DATA READ

var onReceive = function(receiveInfo) {
  //ID test
  if (receiveInfo.connectionId !== involtID) return;
  
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
    var i = parseInt(encodedString.substring(1,Ctest));

    var stringValue = encodedString.substring(Ctest+1,Btest);
    var stringValueCheck = isNaN(stringValue);

    //count each analog pin number and create array of their values
    if (stringValueCheck == false){
      analogPins[i] = parseInt(stringValue);  
    }
    else {
      analogPins[i] = stringValue; 
    }

  }

};

//READ ONLY EVENTS 
//Updated in 50ms interval to reduce CPU usage
var analogUpdate = function(){


  //show
  $(".show").each(function() {
    $(this).html(analogPins[$(this).data("pinNumber")]);
  });

  //bar
  $(".bar").each(function() {
      //map the value to bar pixel width
      var bar = {

        maxValue : parseInt($(this).data('3')),
        maxWidth : parseInt($(this).css('width'))

      };
      //scaling the variable
      var widthMap = (bar.maxWidth-0)/(bar.maxValue-0)*(analogPins[$(this).data("pinNumber")]-bar.maxValue)+bar.maxWidth;
      //change bar width
      $(this).children(".bar-value").css({

        "width": widthMap,
        "max-width": bar.maxWidth

      });
      //display the value
      $(this).children(".bar-value").children('div').html(analogPins[$(this).data("pinNumber")]);
  });

  //knob
  $(".knob").each(function() {
    $(this).children().children('.knob-read').val(analogPins[$(this).data("pinNumber")]).trigger('change');
  });

  //value
  $(".value").each(function() {
    $(this).attr('value', analogPins[$(this).data("pinNumber")]);
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

  console.log(ardSend);
  console.log(digitalPins);

}

//get object pin from data
var definePin = function(pinData){

    pinIndex  = pinData["pinNumber"];
    pin       = pinData[2];

}

//Sends data to arduino based on event
var arduinoSend = function(pin, value){

  ardSend = pin+"V"+value+"\n";
  
  chrome.serial.send(involtID, sendConvertString(ardSend), onSend);

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

$(document).ready(function() {

  //button
  $(".button").click(function() {
    definePin($(this).data());
    digitalPins[pinIndex] = parseInt($(this).data("3"));
        arduinoSend(pin, digitalPins[pinIndex]);
  });

  //toggle
  $(".toggle").each(function() {
    if ($(this).data("3")==0){
      $(this).html("OFF");
      $(this).addClass('inactive')
    }
    else if ($(this).data("3")==1){
      $(this).html("ON");
    }

    $(this).click(function() {
      definePin($(this).data());

      if (digitalPins[pinIndex] == 0){
        $(this).html("ON");
          digitalPins[pinIndex]=1;
            arduinoSend(pin, digitalPins[pinIndex]);
      }
      else if (digitalPins[pinIndex] == 1){
        $(this).html("OFF");
          digitalPins[pinIndex]=0; 
            arduinoSend(pin, digitalPins[pinIndex]);      
      }
      $(this).toggleClass('inactive');
    });
  });

  //toggle-pwm
  $(".toggle-pwm").each(function() {
    var togglePwm = {

      state1 : parseInt($(this).data('3')),
      state2 : parseInt($(this).data('4'))

    };

    definePin($(this).data());

    $(this).click(function(event) {
      $(this).toggleClass('state2');

      if ($(this).hasClass('state2')) {
        digitalPins[pinIndex] = togglePwm.state2;
          arduinoSend(pin, digitalPins[pinIndex]);
      }
      else {
        digitalPins[pinIndex] = togglePwm.state1;
          arduinoSend(pin, digitalPins[pinIndex]);        
      }
    });
  });

  //increase
  $(".increase").html("+");

  $(".increase").click(function() {
    definePin($(this).data());

      digitalPins[pinIndex] = parseInt(digitalPins[pinIndex])+parseInt($(this).data("5"));
      digitalPins[pinIndex] = Math.min(Math.max(parseInt(digitalPins[pinIndex]), 0), $(this).data("4"));
        arduinoSend(pin, digitalPins[pinIndex]); 
  });

  //decrease
  $(".decrease").html("-");

  $(".decrease").click(function() {
    definePin($(this).data());

      digitalPins[pinIndex] = parseInt(digitalPins[pinIndex])-parseInt($(this).data("5"));
      digitalPins[pinIndex] = Math.min(Math.max(parseInt(digitalPins[pinIndex]), 0), $(this).data("4"));
        arduinoSend(pin, digitalPins[pinIndex]); 
  });

  //hover
  $(".hover").hover(function() {
    definePin($(this).data());
    digitalPins[pinIndex] = parseInt($(this).data("3"));
      arduinoSend(pin, digitalPins[pinIndex]);
  }, function() {
    definePin($(this).data());
    digitalPins[pinIndex] = parseInt($(this).data("4"));
      arduinoSend(pin, digitalPins[pinIndex]);
  });

  //knob-send (plugin function)
  $(".knob-send").each(function() {
    //definePin will not work
      var pinIndex = $(this).data("pinNumber");
      var pin = $(this).data("2");

    $(this).children('.knob-write').knob({
      'change' : function (value) {
        digitalPins[pinIndex] = value;
          arduinoSend(pin, digitalPins[pinIndex]);
      }
    });
  });

  //custom-button
  $(".custom-button").click(function() {
    var customBut = $(this).data("2");
      chrome.serial.send(involtID, sendConvertString(customBut), onSend);
  });

  //input-write
  $(".input-write").change(function() {
    definePin($(this).data());
    digitalPins[pinIndex] = $(this).val();
      arduinoSend(pin, digitalPins[pinIndex]);
  });

  //custom-write
  $(".custom-write").change(function() {
    var valCustom = $(this).val();
    var valCustomSend = valCustom+"\n";
      chrome.serial.send(involtID, sendConvertString(valCustomSend), onSend);
  });

  //checkbox
  $(".checkbox").change(function() {
    definePin($(this).data());
    if (this.checked) {
      digitalPins[pinIndex] = parseInt($(this).data("3"));
        arduinoSend(pin, digitalPins[pinIndex]);
    }
    else {
      digitalPins[pinIndex] = parseInt($(this).data("4"));
        arduinoSend(pin, digitalPins[pinIndex]);      
    }
  });

  //radio 
  $(".radio").change(function() {
    if (this.checked) {
      definePin($(this).data());
      digitalPins[pinIndex] = parseInt($(this).data("3"));
        arduinoSend(pin, digitalPins[pinIndex]);
    }
  });
  
  //slider (simple-slider plugin)
  $(".rangeslider").each(function() {
    $(this).children('.tooltip').hide();

    var rangeslider = {

      maxValue    : $(this).data("3"),
      step        : $(this).data("4")

    };

    //define range element
    $(this).children('.range').simpleSlider({

      range    :[0,rangeslider.maxValue],
      step     :rangeslider.step,
      snap     :true,
      highlight:true

    });

    //do something on change
    $(this).children('.range').bind("slider:changed", function (event, data) {
      
      //display value
      $(this).siblings('.tooltip').html(data.value);
      $(this).parent().siblings('.rangeval').html(data.value);

        //position of tooltip
        var tooltipPosition = $(this).siblings('.slider').children('.dragger').css('left');
        $(this).siblings('.tooltip').css('left', tooltipPosition);

      definePin($(this).parent().data());
      digitalPins[pinIndex] = parseInt(data.value);
        arduinoSend(pin, digitalPins[pinIndex]);
    });

    //toggle tooltip on hover
    $(this).hover(function() {
      $(this).children('.tooltip').fadeIn(250);
    }, function() {
      $(this).children('.tooltip').fadeOut(250);
    });

  });

});