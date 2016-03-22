/*
    INVOLT FRAMEWORK UI ELEMENTS AND UPDATING THEIR VALUE
    Ernest Warzocha 2015
    involt.github.io

    This file is not required for Involt to work if you use only your own JQuery code without Involt UI kit.
    It contains functions which generates Involt UI assets, their events and automatic update of read-only elements.
    Involt pagination is also included here. Involt JQuery methods are in involt.js
*/

//----------------------------------------------------------------------------------------------

//UPDATE OF READ-ONLY ELEMENTS

//Updated in 50ms interval from settings to reduce CPU usage
var analogUpdate = function(){

  //show
  $(".show").each(function() {
    var $t = $(this);
    $t.html(involtReceivedPin[$t.data("pinNumber")]);
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
      var widthMap = (involtReceivedPin[$t.data("pinNumber")]-bar.minValue)*(bar.maxWidth-0)/(bar.maxValue-bar.minValue)+0;
      //change bar width
      $t.children('.bar-background').children(".bar-value").css('width', widthMap);
      //display the value
      $t.children(".bar-label").css('width', widthMap).html(involtReceivedPin[$t.data("pinNumber")]);
  });

  //knob
  $(".knob").each(function() {
    $(this).children().children('.knob-read').val(involtReceivedPin[$(this).data("pinNumber")]).trigger('change');
  });

  //value
  $(".value").each(function() {
    var $t = $(this);
    $t.attr('value', involtReceivedPin[$t.data("pinNumber")]);
  });

};

setInterval(analogUpdate, updateRate);

//----------------------------------------------------------------------------------------------

//CREATE HTML ELEMENTS REQUIRED FOR UI KIT

Involt.prototype.createUiAssets = function($t){
  //bar
  if($t.hasClass('bar')){
    $t.append('<div class="bar-label">0</div><div class="bar-background"><div class="bar-value"></div></div>');
    $t.children('.bar-background').children('.bar-value').css('max-width', parseInt($t.children('.bar-background').css('width')));
    $t.children('.bar-label').css('max-width', parseInt($t.children('.bar-background').css('width')));
  };

  //knob
  if($t.hasClass('knob')){
    $t.append(function() {
      var knobMax  = $t.data('max');
      var knobMin  = $t.data('min');
      if($t.hasClass('proto')){
        $t.append('<input type="text" data-width="180" data-height="180" data-fgColor="#626262" data-inputColor="#363636" data-bgColor="#d9d9d9" data-max="'+knobMax+'" data-min="'+knobMin+'" data-readOnly="true" value="0" class="knob-read">'); 
      }
      else{
        $t.append('<input type="text" data-width="180" data-height="180" data-fgColor="#00C5FF" data-inputColor="#282828;" data-max="'+knobMax+'" data-min="'+knobMin+'" data-readOnly="true" value="0" class="knob-read">'); 
      };
      $t.children('.knob-read').data($t.data());
    });

    $(function() {
        $t.children(".knob-read").knob();
    });
  };

  //knob-send
  if($t.hasClass('knob-send')){
    if($t.hasClass('proto')){
      $t.append('<input type="text" data-width="180" data-height="180" data-fgColor="#626262" data-inputColor="#363636" data-bgColor="#d9d9d9" data-displayPrevious="true" data-angleOffset="-140" data-angleArc="280" class="knob-write">'); 
    }
    else{
      $t.append('<input type="text" data-width="180" data-height="180" data-fgColor="#00C5FF" data-inputColor="#282828;" data-displayPrevious="true" data-angleOffset="-140" data-angleArc="280" class="knob-write">'); 
    };
    involt.knobSendCreate($t);
  };
  
  //rangeslider
  if($t.hasClass('rangeslider')){
    $t.append('<div class="label"></div><div class="tooltip">slide</div><div class="slider"></div>');
    involt.rangesliderCreate($t);
  };
  
  //increase/decrease + and - when empty text
  if($t.hasClass('increase')){
    if($t.html() == '') $t.html("+").css('font-size', '30px');
  };
  if($t.hasClass('decrease')){
    if($t.html() == '') $t.html("-").css('font-size', '30px');
  };

  //toggle ON/OFF when empty
  if($t.hasClass('toggle')){
    if ($t.data("value") == 0){
        if($t.html() == '') $t.html("OFF").addClass('inactive');
      }
      else if ($t.data("value") == 1){
        if($t.html() == '') $t.html("ON");
      };
  };  

  if($t.hasClass('switch')){
    $t.append('<div class="switch-track"><div class="switch-handle"></div></div>');
  };

};

//----------------------------------------------------------------------------------------------

//JQUERY KNOB PLUGIN

Involt.prototype.knobSendCreate = function($t){
  //definePin will not work
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
        if (involtPin[index] !== this.cv){
          if (this.cv <= max){
            involtPin[index] = this.cv;
            if ($t.parent("form").length == 0) $t.sendValue();
          }
          else {
            involtPin[index] = max;
          };
        };
    },
    'release' : function (value){
      if (involtPin[index] !== value){
        if (value <= max){
          involtPin[index] = value;
        }
        else {
          involtPin[index] = max;
        };
        if ($t.parent("form").length == 0) $t.sendValue(); 
      };
      if ($t.parent("form").length == 0) $t.sendFn()
    }
  });

};

//----------------------------------------------------------------------------------------------

//JQUERY SLIDER PLUGIN

Involt.prototype.rangesliderCreate = function($t){

  var $slider = $t.children('.slider');
  var $tooltip = $slider.siblings('.tooltip');

  $tooltip.html($t.data('value')).hide();
  $slider.siblings('.label').html($t.data('value'));

  $slider.noUiSlider({
    start: [$t.data("value")],
    range: {
      'min': [$t.data("min")],
      'max': [$t.data("max")]
    },
    step: $t.data("step")
  });
  
  $slider.on({
    slide: function(){
      var cssPos = $slider.children('.noUi-base').children('.noUi-origin').css('left');
      var val = parseInt($slider.val());
        $tooltip.css('left',cssPos).html(val);
        $slider.siblings('.label').html(val);
          involtPin[$t.data("pinNumber")] = val;
          if ($t.parent("form").length == 0) involt.arduinoSend($t.data("pin"), val);
    },
    set: function(){
      if ($t.parent("form").length == 0) $t.sendFn();
    }
  });

  $t.hover(function() {
    $tooltip.css('left', $slider.children('.noUi-base').children('.noUi-origin').css('left'));
    $tooltip.fadeIn(250);
  }, function() {
    $tooltip.fadeOut(250);
  });

};

//----------------------------------------------------------------------------------------------

//INVOLT UI EVENTS

$(document).ready(function() {

  //button
  $(document).on("click",".ard.button",function() {
    $(this).updateValue().sendValue();
  });

  //button-toggle
  $(document).on("click",".ard.button-toggle",function() {
    var $t = $(this);
    var values = $t.data("value");
    $t.toggleClass('state2');

    if ($t.hasClass('state2')) {
      involtPin[$t.data("pinNumber")] = values[0];
        $t.sendValue();
    }
    else {
      involtPin[$t.data("pinNumber")] = values[1];
        $t.sendValue();       
    };
  });

  //toggle
  $(document).on("click",".ard.toggle",function() {
    var $t = $(this);

    $t.toggleClass('inactive');
    if ($t.hasClass('inactive')){
      involtPin[$t.data('pinNumber')] = 0;
      $t.html("OFF");
    }
    else {
      involtPin[$t.data('pinNumber')] = 1;
      $t.html("ON");
    };

    $t.sendValue();
    /*
    if (involtPin[index] == 0){
      if ($t.html() == "OFF") {
        $t.html("ON");
      };
      involtPin[index] = 1;
        $t.sendValue();
    }
    else if (involtPin[index] == 1){
      if ($t.html() == "ON") {
        $t.html("OFF");
      };
        involtPin[index] = 0; 
          $t.sendValue();    
    };
    */
    
  });

  //switch
  $(document).on("click",".ard.switch",function() {
    var $t = $(this);
    var $handle = $t.children('.switch-track').children('.switch-handle');
    var values = $t.data('value');
    $handle.toggleClass('inactive');

    if ($handle.hasClass('inactive')) {
      involtPin[$t.data("pinNumber")] = values[0];
        $t.sendValue();
    }
    else {
      involtPin[$t.data("pinNumber")] = values[1];
        $t.sendValue();       
    };  

  });

  //increase
  $(document).on("click",".ard.increase",function() {
    var $t = $(this);
    var index = $t.data("pinNumber");

      involtPin[index] = involtPin[index] + $t.data("step");
      involtPin[index] = Math.min(Math.max(involtPin[index], $t.data("min")), $t.data("max"));
        $t.sendValue(); 
  });

  //decrease
  $(document).on("click",".ard.decrease",function() {
    var $t = $(this);
    var index = $t.data("pinNumber");

      involtPin[index] = involtPin[index] - $t.data("step");
      involtPin[index] = Math.min(Math.max(involtPin[index], $t.data("min")), $t.data("max"));
        $t.sendValue(); 
  });

  //hover
  $(document).on({
      mouseenter: function () {
        var $t = $(this);
        var value = $t.data("value");
        involtPin[$t.data("pinNumber")] = value[0];
          $t.sendValue();
      },
      mouseleave: function () {
        var $t = $(this);
        var value = $t.data("value");
        involtPin[$t.data("pinNumber")] = value[1];
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
    var values = $t.data("value");
    if (this.checked) {
      involtPin[$t.data("pinNumber")] = values[0];
    }
    else {
      involtPin[$t.data("pinNumber")] = values[1];
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

  $(document).on("change",".ard.involt-input",function(){
    var $t = $(this);
    var value = $t.val();
    if (!isNaN(value)){
      value = parseInt($t.val());
    };
    $t.updateValue(value);
    if ($t.parent("form").length == 0) $t.sendValue();
  });

  //form submit button
  $(document).on("click",".ard.submit-button", function(){
    var $t = $(this);
    if($t.parent("form").length>0){
      $t.siblings('.ard.involt-input').each(function() {
        $(this).sendValue();
      });
      $t.siblings('.ard.custom-write').each(function() {
        $(this).sendString($(this).val()+'\n');
      });
      $t.siblings('.ard.knob-send').each(function() {
        $(this).sendValue();
      });
      $t.siblings('.ard.rangeslider').each(function() {
        $(this).sendValue();
      });
      $t.siblings('.ard.checkbox').each(function() {
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

//----------------------------------------------------------------------------------------------

  //INVOLT PAGINATION SYSTEM

  //make sure to show only the home screen
  $(".involt-page").not(".home").hide();

  //Start with active state of home link in navigation bar
  var homelink = $(".home").attr('id');
  //count how many links are in navigation
  var countLinks = $(".involt-nav").children('.involt-pagelink').length;

  $(".involt-nav").children('.involt-pagelink').each(function() {
    if($(this).attr('href') == '#'+ homelink){
      $(this).addClass('active');
    };

    $(this).css('width', 100/countLinks+'%');
  });

  //toggle between pages
  $(document).on("click","a.involt-pagelink", function(event){
    event.preventDefault();
    var $t = $(this);
    var link = $t.attr('href');
    var $openPage = $(link);

    $(".involt-nav").children('.involt-pagelink').removeClass('active');
    $t.addClass('active');
    $(".involt-page").each(function() {
      $(this).hide();
    });
    $openPage.show();

  });

  //make sure to hide all dialogs
  $(".involt-dialog").hide();

  //open dialog
  $(document).on("click","a.involt-showdialog", function(event){
    event.preventDefault();
    var $t = $(this);
    var link = $t.attr('href');
    var $openDialog = $(link);
    $("body").prepend('<div class="involt-dialogbackground"></div>')
    $openDialog.show();
  });

  //hide dialog when clicked on background
  $(document).on("click",".involt-dialogbackground", function(event){
    $(".involt-dialog").hide();
    $(this).remove();
  });

  //hide dialog when clicked on hidedialog button
  $(document).on("click","a.involt-hidedialog", function(event){
    event.preventDefault();
    $(".involt-dialog").hide();
    $(".involt-dialogbackground").remove();
  });

});