//App screen dimensions:
var screenWidth  = 1200;
var screenHeight = 700;

//Create app window on launch (loader)
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    width: screenWidth,
    height: screenHeight
  });
});

