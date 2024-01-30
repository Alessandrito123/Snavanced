/*

    api.js

    programmatically interact with a Snap! project

    written by Jens Mönig
    jens@moenig.org

    Copyright (C) 2022 by Jens Mönig

    This file is part of Snap!.

    Snap! is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


    prerequisites:
    --------------
    needs gui.js, lists.js, objects.js, threads.js and morphic.js


    documentation
    -------------
    along with this file you should have received a copy of the Snap! API
    documentation. If not, see
    https://github.com/jmoenig/Snap/blob/master/API.md
    or https://snap.berkeley.edu/snap/API.md

*/

/*global modules, IDE_Morph, isString, Map, List, world, isNil, Project,
detect, isSnapObject, VariableFrame*/

/*jshint esversion: 6*/

/*
# The Snap! API

Jens Mönig, Bernat Romagosa, January 24, 2024

This document describes how Snap! can be accessed from an outside program to start scripts, send and retrieve information. The model use case is embedding interactive Snap! projects in other websites such as MOOCs or other adaptive learning platforms.

This experimental Snap! API is a set of methods for an IDE_Morph containing a Snap! project. These methods are maintained to work with future versions of Snap! They can be used to trigger scripts, get feedback from running scripts, and access the project's global variables.

Currently the API consists of the following methods:

#### Navigate Scenes

* IDE_Morph.prototype.getScenes()
* IDE_Morph.prototype.getCurrentScene()
* IDE_Morph.prototype.switchTo()

#### Control Processes

* IDE_Morph.prototype.isRunning()
* IDE_Morph.prototype.stop()

#### Broadcast Messages (and optionally wait)

* IDE_Morph.prototype.broadcast()

#### Listen to Messages

* IDE_Morph.prototype.addMessageListenerForAll()
* IDE_Morph.prototype.addMessageListener()
* IDE_Morph.prototype.getMessages()

#### Access Global Variables

* IDE_Morph.prototype.getVarNames()
* IDE_Morph.prototype.getVar()
* IDE_Morph.prototype.setVar()

#### Create and Modify Lists

* IDE_Morph.prototype.newList()

#### Access the Serialized Project

* IDE_Morph.prototype.getProjectXML()
* IDE_Morph.prototype.loadProjectXML()
* IDE_Morph.prototype.unsavedChanges()

## Referencing the IDE

Getting hold of an ide can usually be achieved by
evaluating:

    var ide = world.children[0];

The model case in mind is embedding Snap! in an iframe:

```
<!DOCTYPE html>
<html>
    <head>
        <title>Snap! iFrame</title>
    </head>
    <body>
        <iframe id="inlineFrameExample"
            title="Inline Frame Example"
            width="1024"
            height="720"
            src="snap.html">
        </iframe>
    </body>
</html>
```

In such a set up the ide can be accessed through the ```contentWindow``` property, e.g.

    var ide = document.getElementsByTagName("iframe")[0].contentWindow.world.children[0];

### Cross-domain iframes

If the iframe and the container do not share domains, you won't be able to reach the world
and, thus, the API. For that particular case, you should use the `postMessage` mechanism,
as follows:

    document.querySelector('iframe').contentWindow.postMessage(
        { selector: <API selector>, params: <param array> },
        '*'
    );

For instance, to get the value of a variable named "foo", you would do:

    document.querySelector('iframe').contentWindow.postMessage(
        { selector: 'getVar', params: [ 'foo' ] },
        '*'
    );

The way to capture the return values of these messages from the page containing the iframe
is to define an `onmessage` listener:

    winndow.addEventListener('message',function(e) {
        console.log('the response to', e.data.selector, 'is', e.data.response);
    },false);

Note that `e.data.selector` carries the original selector back, so you can tie it to the
request, while `e.data.response` carries the return value of the API method call.

## Interacting with the IDE

### IDE_Morph.prototype.getScenes()
The getScenes() method returns an array with the names of all scenes in the projects. The minimum number of elements is 1, since there is always at least one scene per project. The scene names are unique strings within the array. Note that the empty string ('') is a valid scene identifier.

#### syntax
    ide.getScenes();

#### return value
an Array of Strings, minimum length 1


### IDE_Morph.prototype.getCurrentScene()
The getCurrentScene() method returns a string representing the name of the currently active scene in the project. If the scene is unnamed and empty string is returned.

#### syntax
    ide.getCurrentScene();

#### return value
a String, can be an empty String


### IDE_Morph.prototype.switchTo()
The switchTo() method displays the specified scene. It suspends all processes and clones of the previously active scene and passes control to the new scene.

#### syntax
    ide.switchTo(sceneName);

#### parameters
* sceneName
    - string, the name of the scene to be activated

#### return value
undefined


### IDE_Morph.prototype.isRunning()
The isRunning() method returns `true` if the active scene is currently running one or more threads, `false` if the scene is idle.

#### syntax
    ide.isRunning();

#### return value
a Boolean


### IDE_Morph.prototype.stop()
The stop() method immediately terminates all currently running threads in the active scene and removes all temporary clones. It does not trigger a "When I am stopped" event.

#### syntax
    ide.stop();

#### return value
undefined


### IDE_Morph.prototype.broadcast()
The broadcast() method triggers all scripts whose hat block listens to the specified message. An optional callback can be added to be run after all triggered scripts have terminated.

#### syntax
    ide.broadcast(message [, callback]);

#### parameters
* message
    - string, the message to be sent to all listeners
* callback | optional
    - function to execute after all scripts terminate, no arguments

#### return value
undefined


### IDE_Morph.prototype.addMessageListenerForAll()
The addMessageListenerForAll() method sets up a function that will be called whenever a message is broadcast. The function takes one argument, the message being broadcast, and can be used to react to any message. Multiple message listeners can be set up, they all get executed in the order in which they were added.

#### syntax
    ide.addMessageListenerForAll(callback);

#### parameters
* callback
    * function to execute whenever a message is sent, takes one argument: The message string

#### return value
undefined


### IDE_Morph.prototype.addMessageListener()
The addMessageListener() method sets up a function that will be called whenever the specified message is broadcast. Multiple message listeners can be set up per message, they all the executed in the order in which they were added.

#### syntax
    ide.addMessageListener(message, callback);

#### parameters
* message
    * string, the message to which the listener will react. If the message is an empty string the callback will be executed at any broadcast, passing the message as argument
* callback
    * function to execute whenever the specified message is sent, takes no argument, except when the message to listen to is the empty string, then it takes the message as argument

#### return value
undefined


#### IDE_Morph.prototype.getMessages()
The getMessage() method returns a new Array that contains all the message strings that occur in the project, both in hat blocks and in broadcast blocks.

#### syntax
    ide.getMessages();

#### return value
an Array of Strings, or an empty Array


### IDE_Morph.prototype.getVarNames()
The getVarNames() method returns a new Array that contains all the global variable names in the project.

#### syntax
    ide.getVarNames();

### return value
an Array of Strings, or an empty Array


### IDE_Morph.prototype.getVar()
The getVar() method returns the value of the global variable indicated by the specified name.

#### syntax
    ide.getVar(name);

#### return value
whatever value the variable holds.


### IDE_Morph.prototype.setVar()
The setVar() methods assigns a value to the a global variable specified by name.

#### syntax
    ide.setVar(name, value);

#### return value
undefined


### IDE_Morph.prototype.newList()
The newList() methods returns a new Snap! list. Optionally a source array containing the list elements can be specified.

#### syntax
    ide.newList([array]);

#### return value
a new Snap! List


### IDE_Morph.prototype.getProjectXML()
the getProjectXML() method returns a string in XML format representing the serialized project currently loaded into the IDE.

#### syntax
    ide.getProjectXML();

#### return value
an XML String


### IDE_Morph.prototype.loadProjectXML()
the loadProjectXML() method replaces the current project of the IDE with another serialized one encoded in a string in XML format. Note that no user acknowledgement is required, all unsaved edits to the prior project are lost.

#### syntax
    ide.loadProjectXML(projectData);

#### parameters
* projectData
    * XML string representing a serialized project

#### return value
unefined


### IDE_Morph.prototype.unsavedChanges()
the unsavedChanges() method return a Boolean value indicating whether the currently edited project has been modifed since it was last saved.

#### syntax
    ide.unsavedChanges();

#### return value
a Boolean


## Manipulating Lists

Snap! lists can be accessed and manipulated through a set of methods described in the file `lists.js`
*/

// Global stuff ////////////////////////////////////////////////////////

modules.api = '2022-December-24';

// IDE_Morph external communication API - experimental

/*
    programmatically trigger scripts from outside of Snap!
    add message listeners to Snap! broadcasts and access
    global variables
*/

window.onmessage = function (event) {if (world) {var ide = world.childThatIsA(IDE_Morph); if (!isNil(event.data.selector)) {window.top.postMessage(
{selector: event.data.selector, response: ide[event.data.selector].apply(ide, event.data.params)}, '*');};};};

IDE_Morph.prototype.getScenes = function () {return this.scenes.itemsArray().map(each => each.name);};

IDE_Morph.prototype.getCurrentScene = function () {return this.scene.name;};

IDE_Morph.prototype.switchTo = function (sceneName) {var scene = detect(this.scenes.itemsArray(), scn => scn.name === sceneName);
if (scene === null) {throw new Error('cannot find scene ' + sceneName);}; this.switchToScene(scene);};

IDE_Morph.prototype.isRunning = function () {return this.stage.threads.processes.length > 0;};

IDE_Morph.prototype.stop = function () {var stage = this.stage; stage.keysPressed = {}; stage.threads.stopAll(); stage.stopAllActiveSounds(); stage.children.forEach(
morph => {if (morph.stopTalking) {morph.stopTalking();}}); stage.removeAllClones(); stage.stopProjection(); this.controlBar.pauseButton.refresh();};

IDE_Morph.prototype.broadcast = function(message, callback) {
    // same as using the broadcast block - launch all scripts
    // in the current project reacting to the specified message,
    // if a callback is supplied wait for all processes to terminate
    // then call the callback, same as using the "broadcast and wait" block

    var rcvrs = this.sprites.contents.concat(this.stage),
        myself = this,
        procs = [];

    function wait() {
        if (procs.some(any => any.isRunning())) {
            return;
        }
        if (callback instanceof Function) {
            myself.onNextStep = function () {
                callback();
                callback = null;
            };
        }
    }

    if (!isString(message)) {
        throw new Error('message must be a String');
    }
    this.stage.lastMessage = message;
    rcvrs.forEach(morph => {
        if (isSnapObject(morph)) {
            morph.allHatBlocksFor(message).forEach(block => {
                var varName, varFrame;
                if (block.selector === 'receiveMessage') {
                    varName = block.inputs()[1].evaluate()[0];
                    if (varName) {
                        varFrame = new VariableFrame();
                        varFrame.addVar(varName, message);
                    }
                    procs.push(this.stage.threads.startProcess(
                        block,
                        morph,
                        this.stage.isThreadSafe,
                        // commented out for now to enable tail recursion:
                        // || // make "any msg" threadsafe
                        // block.inputs()[0].evaluate() instanceof Array,
                        null, // exportResult (bool)
                        callback instanceof Function ? wait : null,
                        null, // isClicked
                        null, // rightAway
                        null, // atomic
                        varFrame
                    ));
                } else {
                    procs.push(this.stage.threads.startProcess(
                        block,
                        morph,
                        this.stage.isThreadSafe
                    ));
                }
            });
        }
    });
    (this.stage.messageCallbacks[''] || []).forEach(
        callback => callback(message)
    );
    (this.stage.messageCallbacks[message] || []).forEach(
        callback => callback()
    );
};

IDE_Morph.prototype.addMessageListenerForAll = function (callback) {this.addMessageListener('', callback);};

IDE_Morph.prototype.addMessageListener = function (message, callback) {var funcs; if (!isString(message)) {throw new Error('message must be a String');};
funcs = this.stage.messageCallbacks[message]; if (funcs instanceof Array) {funcs.push(callback);} else {this.stage.messageCallbacks[message] = [callback];};};

IDE_Morph.prototype.getMessages = function () {var allNames = [], dict = new Map(); this.sprites.contents.concat(this.stage).forEach(sprite => {
allNames = allNames.concat(sprite.allMessageNames());}); allNames.forEach(name => dict.set(name)); return Array.from(dict.keys());};

IDE_Morph.prototype.getVarNames = function () {return this.stage.globalVariables().names();};

IDE_Morph.prototype.getVar = function (name) {return this.stage.globalVariables().getVar(name);};

IDE_Morph.prototype.setVar = function (name, value) {this.stage.globalVariables().setVar(name, value);};

IDE_Morph.prototype.newList = function (array) {return new List(array);};

IDE_Morph.prototype.getProjectXML = function () {return this.serializer.serialize(new Project(this.scenes, this.scene));};

IDE_Morph.prototype.loadProjectXML = function (projectXML) {this.onNextStep = null; this.world().animations = []; this.openProjectString(projectXML);};

IDE_Morph.prototype.unsavedChanges = function () {return this.hasUnsavedEdits();};