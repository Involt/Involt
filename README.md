HTML and Arduino prototyping framework for designers. 
======

Why Involt?
------

Developing interactive product is multidisciplinary task. It's related to industrial design, programming, user experience and sometimes graphic design skills. Arduino is easy hardware prototyping platform but things get complicated when software is involved in project - even if there are many great tools and frameworks for app prototyping. It's a huge obstacle that blocks many concepts from making it to the real world. Involt is a framework to help you on early stages without advanced programming.

The key to Involt is to "make it simple" to prototype, iterate and quickly show results to users. It simplifies the injection of hardware interactions into HTML based prototypes. It makes it as simple as adding CSS class to element. Involt can be a huge boost in your design process, especially during RITE method (Rapid Iterative Testing and Evaluation).

The main feature of this framework is easy and quick workflow. The syntax was inspired by popular responsive design frameworks. You can create your app with basic knowledge about HTML, CSS and Arduino. You can also create more advanced interactions with use of JavaScript and JQuery.

Main features:

* Fast results with easy to learn CSS syntax.
* Works "out of the box" including basic UI elements.
* Same app can work on both desktop and mobile (with Bluetooth 2.0);
* JS/JQuery based.
* Minimum Arduino code required.

http://involt.github.io/
-

How does it work?
------

Involt translates CSS classes into functions. You need to specify UI element, target pin and variables like desired values or their range. Here is simple button example (Send to pin 5 value 255):

	<div class=“ard button P5 value-255”> Click me </div> 
    
HTML attributes also works:

	<div class="ard button" pin="P5" value="255"> Click me </div>

It's possible to do the same with JQuery:

	$(this).pinDefine("P5").sendValue(255); 
    
Getting started:
http://involt.github.io/getting-started.html

Reference:
http://involt.github.io/reference.html


Install
-------

    1. Download Node-webkit* from http://nwjs.io/
    2. Download Involt and unpack it into Node-webkit root folder.
    3. Open the NW app.

*The SDK version of NW is recommended as it contains Chrome Dev Tools and HTML inspector. (Mac version is in download section)

Due to discontinuation of supporting Chrome Packaged Apps by Google, Involt moves to Node-webkit permanently (it shares same API).

Project works on Win, OSX and Chrome OS (Serial, Bluetooth 2.0). For mobile currently Android and Bluetooth 2.0 is supported.

For mobile support and installation check http://involt.github.io/getting-started/mobile.html

Basic blink example
-------------------

http://involt.github.io/examples/blink.html
-

Other examples can be found on http://involt.github.io/examples.html

For development check wiki and issues on github.
