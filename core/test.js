var t = function(){
  this.id = "idtest";
  this.displayid = function(){
    console.log(test.id);
  };
  this.testing = function(t){
             //var $t = $(this);
    t.html("Some text and markup");
  };
};

var a = false;

if(a){
t.prototype.change = function(){
  test.id = 2;
  console.log(test.id);
};
}
else{
  t.prototype.change = function(){
  test.id = 10;
  console.log(test.id);
};
}

var test = new t();


test.displayid();
test.change();

$(document).ready(function() {
  
});
var a;
    var onConnect = function(connectionInfo){
      if (!connectionInfo) {
        console.error('Could not open, check if Arduino is connected, try other serial port or relaunch Chrome.', "ヽ༼ຈل͜ຈ༽ﾉ RIOT ヽ༼ຈل͜ຈ༽ﾉ");
        $("body").append('<div id="loader-error">Could not open, check if device is connected, try other serial port or relaunch Chrome.</div>');
        $("#loader-error").delay(2500).fadeOut('slow');
        return;
      }
      //Remove loader if connection is successful + hack for knob and slider
      else {
        $("#loader-bg, #loader-error").remove();
        $(".knob, .knob-send, .rangeslider").show();
      };

      //console.log("Device connected:", defaultSerialPort);

      console.log("Involt connection ID:", connectionInfo.connectionId);

      a = connectionInfo.connectionId;
    };

$(document).ready(function() {
  $("div").click(function() {
    chrome.serial.connect("COM3", {bitrate: 115200}, onConnect);
console.log("connectedd")
});
var discon = function(){
  console.log("disconnected")
}

    $("p").click(function(event) {
      chrome.serial.disconnect(a, discon)
    });
});