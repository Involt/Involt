/*
    INVOLT FRAMEWORK UI ELEMENTS AND UPDATING VALUES OF THEM
    Ernest Warzocha 2015
    involt.github.io

    This file is not required for Involt to work. 
    If you don't need Involt UI kit just remove this file.
*/

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

        minValue : $t.data('min'),
        maxValue : $t.data('max'),
        maxWidth : parseInt($t.css('width'))

      };
      //scaling the css width of active element to total width
      var widthMap = (analogPins[$t.data("pinNumber")]-bar.minValue)*(bar.maxWidth-0)/(bar.maxValue-bar.minValue)+0;
      //change bar width
      $t.children('.bar-background').children(".bar-value").css('width', widthMap);
      //display the value
      $t.children(".bar-label").css('width', widthMap).html(analogPins[$(this).data("pinNumber")]);
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


//knob-send (plugin function) is in core.js as knobSendCreate function
//rangeslider is in rangesliderCreate function

$(document).ready(function() {

  //button
  $(document).on("click",".ard.button",function() {
    $(this).updateValue().sendValue();
  });

  //button-toggle
  $(document).on("click",".ard.button-toggle",function() {
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

  //toggle
  $(document).on("click",".ard.toggle",function() {
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

  //increase
  $(document).on("click",".ard.increase",function() {
    var $t = $(this);
    var index = $t.data("pinNumber");

      digitalPins[index] = digitalPins[index] + $t.data("step");
      digitalPins[index] = Math.min(Math.max(digitalPins[index], $t.data("min")), $t.data("max"));
        $t.sendValue(); 
  });

  //decrease
  $(document).on("click",".ard.decrease",function() {
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
  }, ".ard.hover");

  //custom-button
  $(document).on("click",".ard.custom-button",function() {
    var customBut = $(this).data("pin");
      involt.send(customBut);
      $(this).sendFn();
  });

  //input-write
 $(document).on("change",".ard.input-write",function() {
    var $t = $(this);
      $t.updateValue($t.val());
      if ($t.parent("form").length == 0) $t.sendValue();
  });

  //custom-write
  $(document).on("change",".ard.custom-write",function() {
    var valCustom = $(this).val();
    var valCustomSend = valCustom+"\n";
    if ($(this).parent("form").length == 0){
      involt.send(valCustomSend);
      $(this).sendFn();
    };
  });

  //checkbox
  $(document).on("change",".ard.checkbox",function() {
    var $t = $(this);
    if (this.checked) {
      digitalPins[$t.data("pinNumber")] = $t.data("value");
    }
    else {
      digitalPins[$t.data("pinNumber")] = $t.data("value2");
    };
    if ($t.parent("form").length == 0) $t.sendValue();
  });

  //radio 
  $(document).on("change",".ard.radio",function() {
    var $t = $(this);
    if (this.checked) {
      $t.updateValue();
      if ($t.parent("form").length == 0) $t.sendValue();
    };
  });

  //form submit button
  $(document).on("click",".ard.submit-button", function(){
    var $t = $(this);
    if($t.parent("form").length>0){
      $t.siblings('input.ard').not(".custom-write").not(".radio").sendValue();
      $t.siblings('.ard.custom-write').each(function() {
        $(this).sendString($(this).val()+'\n');
      });
      $t.siblings('.ard.knob-send').each(function() {
        $(this).sendValue();
      });
      $t.siblings('.ard.rangeslider').each(function() {
        $(this).sendValue();
      });
      $t.siblings('.ard.radio').each(function() {
        if(this.checked){
          $(this).sendValue();
        };
      });
    };
    $t.sendFn($t.attr('fn'));
  });

});