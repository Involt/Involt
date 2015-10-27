HTML and Arduino prototyping framework for designers. 
======

Why Involt?
------

Prototyping interactive product is multidisciplinary task. It's related to industrial design, programming, user experience and sometimes graphic design skills. Arduino is easy hardware prototyping platform but things get complicated when software is involved in project. For designers it's a huge obstacle that blocks many concepts from making it to the real world. Involt is a framework to help designers in their projects on early stages without advanced programming. The key to Involt is to "make it simple" to develop software to hardware communication. 

The main feature of this framework is easy and quick workflow. The syntax was inspired by popular responsive design frameworks. You can create your app with basic knowledge about HTML, CSS and Arduino. You can also create more advanced interactions with use of JavaScript and JQuery.

Main features:

* Fast results with easy to learn CSS syntax.
* Ready to use UI kit.
* JS/JQuery based.
* Minimum Arduino code required.

http://involt.github.io/
-

How does it work?
------

Involt is Chrome Packaged App with build-in serial and bluetooth communication. 

Involt translates CSS classes into functions. You need to specify UI element, target pin and variables like desired values or their range. Here is simple button example (Send to pin 5 value 255):

    <div class = “ard button P5 255”> Click me </div> 

It's also possible to do the same with JQuery:

	$(this).pinDefine("P5").sendValue(255); 
    
Getting started:
http://involt.github.io/getting-started.html

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

http://involt.github.io/examples/blink.html
-

Other examples can be found on http://involt.github.io/examples.html or https://github.com/Involt/examples

For developement check wiki and issues on github.