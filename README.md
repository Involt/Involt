Chrome based Arduino to HTML framework for designers. 
======

Why Involt?
------

Involt is Chrome Packaged App with build in serial communication. The key to Involt is to "make it simple" to develop on every step of design process. You can use it to create app or to quickly prototype and iterate on early stages of bigger project.

The main feature of this framework is easy and quick workflow. You can create your app with basic knowledge about HTML, CSS and Arduino. You can also create more advanced interactions with use of JavaScript and JQuery.

* Fast results with easy to learn CSS syntax.
* Ready to use UI kit.
* JS/JQuery based.

http://involt.github.io/
-

How does it work?
------

Involt translates CSS classes into functions. You need to specify UI element, target pin and variables like desired values or their range. Here is simple button example (Send to pin 5 value 255):

    <div class = “ard button P5 255”> Click me </div> 

It's also possible to do the same with JQuery:

	$(this).pinDefine("P5").sendValue(255); 
    
Getting started:
http://involt.github.io/gettingstarted

Reference:
http://involt.github.io/reference


Install
-------

    1. Install Google Chrome.
    2. Download and unpack Involt.
    3. In Chrome go to tools > extensions.
    4. Toggle Developer mode
    5. Click “Load unpacked extension...” and choose unpacked folder.

Now you can open your project with launch button or Chrome App Launcher. 

Basic blink example
-------------------

http://involt.github.io/examples/ex1.html
-

For developement check wiki and issues on github.