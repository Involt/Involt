/*
    INVOLT FRAMEWORK UI ELEMENTS AND UPDATING VALUES OF THEM
    Ernest Warzocha 2015
    involt.github.io

    This file is not required for Involt to work. 
    If you don't need Involt UI kit just remove this file.
*/

//HTML GENERATED ELEMENTS OF FRAMEWORK

$(document).ready(function() {
  
  //html/css operations that create framework objects in html file 

  //bar
  $(".bar").append('<div class="bar-value"><div>Loading...</div></div>');
  $(".bar-value").each(function() {
    $(this).css('max-width', parseInt($(this).css('width')));
  });
 
  //knob
  $(".knob").append(function() {
    var knobMax  = $(this).data('max');
    var knobMin  = $(this).data('min');
    $(this).append('<input type="text" data-width="180" data-height="180" data-fgColor="#0099e7" data-inputColor="#282828;" data-max="'+knobMax+'" data-min="'+knobMin+'" data-readOnly="true" value="0" class="knob-read">'); 
    $(this).children('.knob-read').data($(this).data());
  });

  //knob-send
  $(".knob-send").append('<input type="text" data-width="180" data-height="180" data-fgColor="#0099e7" data-inputColor="#282828;" data-displayPrevious="true" data-angleOffset="-140" data-angleArc="280" class="knob-write">'); 

  //rangeslider
  $(".rangeslider").append('<div class="label"></div><div class="tooltip">slide</div><div class="slider"></div>');

  $(function() {
    $(".knob-read").knob();
  });

  //increase/decrease + and - when empty text
  $(".increase").each(function() {
    if($(this).html() == '') $(this).html("+").css('font-size', '30px');
  });
  $(".decrease").each(function() {
    if($(this).html() == '') $(this).html("-").css('font-size', '30px');
  });

  //toggle ON/OFF when empty
  $(".toggle").each(function() {
    var $t = $(this);
    if ($t.data("value") == 0){
      if($t.html() == '') $t.html("OFF").addClass('inactive');
    }
    else if ($t.data("value") == 1){
      if($t.html() == '') $t.html("ON");
    };
  });
  
});

//UPDATE OF READ-ONLY ELEMENTS

//Updated in 50ms interval to reduce CPU usage
var analogUpdate = function(){

  //show
  $(".show").each(function() {
    $(this).html(analogPins[$(this).data("pinNumber")]);
  });

  //bar
  $(".bar").each(function() {
      var $t = $(this);
      //map the value to bar pixel width
      var bar = {

        maxValue : $t.data('value'),
        maxWidth : parseInt($t.css('width'))

      };
      //scaling the variable
      var widthMap = (bar.maxWidth-0)/(bar.maxValue-0)*(analogPins[$t.data("pinNumber")]-bar.maxValue)+bar.maxWidth;
      //change bar width
      $t.children(".bar-value").css('width', widthMap);
      //display the value
      $t.children(".bar-value").children('div').html(analogPins[$t.data("pinNumber")]);
  });

  //knob
  $(".knob").each(function() {
    $(this).children().children('.knob-read').val(analogPins[$(this).data("pinNumber")]).trigger('change');
  });

  //value
  $(".value").each(function() {
    $(this).attr('value', analogPins[$(this).data("pinNumber")]);
  });

};

setInterval(analogUpdate, updateRate);

//USER INTERFACE AND SEND EVENTS

$(document).ready(function() {

  //button
  $(document).on("click",".button",function() {
    $(this).updateValue().sendValue();
  });

  //toggle
  $(document).on("click",".toggle",function() {
    var $t = $(this);
    var index = $t.data('pinNumber');
    if (digitalPins[index] == 0){
      if ($t.html() == "OFF") {
        $t.html("ON");
      };
      digitalPins[index] = 1;
        $t.sendValue();
    }
    else if (digitalPins[index] == 1){
      if ($t.html() == "ON") {
        $t.html("OFF");
      };
        digitalPins[index] = 0; 
          $t.sendValue();    
    };
    $t.toggleClass('inactive');

  });


  //toggle-pwm
  $(document).on("click",".toggle-pwm",function() {
    var $t = $(this);

    $t.toggleClass('state2');

    if ($t.hasClass('state2')) {
      digitalPins[$t.data("pinNumber")] = $t.data("value2");
        $t.sendValue();
    }
    else {
      digitalPins[$t.data("pinNumber")] = $t.data("value");
        $t.sendValue();       
    };
  });

  //increase
  $(document).on("click",".increase",function() {
    var $t = $(this);
    var index = $t.data("pinNumber");

      digitalPins[index] = digitalPins[index] + $t.data("step");
      digitalPins[index] = Math.min(Math.max(digitalPins[index], $t.data("min")), $t.data("max"));
        $t.sendValue(); 
  });

  //decrease
  $(document).on("click",".decrease",function() {
    var $t = $(this);
    var index = $t.data("pinNumber");

      digitalPins[index] = digitalPins[index] - $t.data("step");
      digitalPins[index] = Math.min(Math.max(digitalPins[index], $t.data("min")), $t.data("max"));
        $t.sendValue(); 
  });

  //hover
  $(document).on({
      mouseenter: function () {
        var $t = $(this);
        digitalPins[$t.data("pinNumber")] = $t.data("value");
          $t.sendValue();
      },
      mouseleave: function () {
        var $t = $(this);
        digitalPins[$t.data("pinNumber")] = $t.data("value2");
          $t.sendValue();
      }
  }, ".hover");

  //knob-send (plugin function)
  $(".knob-send").each(function() {
    //definePin will not work
    var $t = $(this);

      var index = $t.data("pinNumber");
      var currentValue = $t.data("value");
      var max = $t.data("max");
        $t.children('.knob-write').val(currentValue).data($t.data());

    $t.children('.knob-write').knob({
      'min':  $t.data("min"),
      'max':  max,
      'step': $t.data("step"),
      'change' : function (value) {
        //prevent from sending duplicated values when step is higher than 1
        if (digitalPins[index] !== this.cv){

          if (this.cv <= max){
            digitalPins[index] = this.cv;
             $t.sendValue();
          }
          else {
            digitalPins[index] = max;
          };

        };

      },
      'release' : function (value){

        if (digitalPins[index] !== value){

          if (value <= max){
            digitalPins[index] = value;
          }
          else {
            digitalPins[index] = max;
          };

          $t.sendValue(); 

        };
        $t.sendFn()
      }
    });

  });

  //custom-button
  $(document).on("click",".custom-button",function() {
    var customBut = $(this).data("pin");
      involt.send(customBut);
      $(this).sendFn();
  });

  //input-write
 $(document).on("change",".input-write",function() {
    var $t = $(this);
      $t.updateValue($t.val()).sendValue();
  });

  //custom-write
  $(document).on("change",".custom-write",function() {
    var valCustom = $(this).val();
    var valCustomSend = valCustom+"\n";
      involt.send(valCustomSend);
      $(this).sendFn();
  });

  //checkbox
  $(document).on("change",".checkbox",function() {
    var $t = $(this);
    if (this.checked) {
      digitalPins[$t.data("pinNumber")] = $t.data("value");
        $t.sendValue();
    }
    else {
      digitalPins[$t.data("pinNumber")] = $t.data("value2");
        $t.sendValue();
    };
  });

  //radio 
  $(document).on("change",".radio",function() {
    if (this.checked) {
      $(this).updateValue().sendValue(); 
    };
  });

  //slider
  $(".slider").each(function() {
    var $t = $(this);
    var $tp = $(this).parent(".rangeslider");
    var $ts = $t.siblings('.tooltip');

    $ts.html($tp.data('value')).hide();
    $t.siblings('.label').html($tp.data('value')).hide();

    $t.noUiSlider({
      start: [$tp.data("value")],
      range: {
        'min': [$tp.data("min")],
        'max': [$tp.data("max")]
      },
      step: $tp.data("step")
    });
    
    $t.on({
      slide: function(){
        var cssPos = $t.children('.noUi-base').children('.noUi-origin').css('left');
        var val = parseInt($t.val());
          $ts.css('left',cssPos).html(val);
          $t.siblings('.label').html(val);
            digitalPins[$tp.data("pinNumber")] = val;
            arduinoSend($tp.data("pin"), val);
      },
      set: function(){
        $tp.sendFn();
      }
    });

    $tp.hover(function() {
      $ts.css('left', $t.children('.noUi-base').children('.noUi-origin').css('left'));
      $ts.fadeIn(250);
    }, function() {
      $ts.fadeOut(250);
    });

  });

});