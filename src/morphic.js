/*

    morphic.js

    a lively Web-GUI
    inspired by Squeak

    written by Jens Mönig
    jens@moenig.org

    Copyright (C) 2010-2023 by Jens Mönig

    This documentation last changed: Febraury 10, 2023

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


    documentation contents
    ----------------------
    I. inheritance hierarchy
    II. object definition toc
    III. yet to implement
    IV. open issues
    V. browser compatibility
    VI. the big picture
    VII. programming guide
    VIII. minifying morphic.js
    IX. acknowledgements
    X. contributors


    I. hierarchy
    -------------
    the following tree lists all constructors hierarchically,
    indentation indicating inheritance. Refer to this list to get a
    contextual overview:

    Animation
    Color
    Node
        Morph
            BlinkerMorph
                CursorMorph
            BouncerMorph*
            BoxMorph
                InspectorMorph
                MenuMorph
                MouseSensorMorph*
                SpeechBubbleMorph
            CircleBoxMorph
                SliderButtonMorph
                SliderMorph
            ColorPaletteMorph
                GrayPaletteMorph
            ColorPickerMorph
            DialMorph
            FrameMorph
                ScrollFrameMorph
                    ListMorph
                StringFieldMorph
                WorldMorph
            HandleMorph
            HandMorph
            PenMorph
            ShadowMorph
            StringMorph
            TextMorph
            TriggerMorph
                MenuItemMorph
    Point
    Rectangle


    II. toc
    -------
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

    Global settings
    Global functions

    Animation
    Color
    Point
    Rectangle
    Node
    Morph
    ShadowMorph
    HandleMorph
    PenMorph
    ColorPaletteMorph
    GrayPaletteMorph
    ColorPickerMorph
    BlinkerMorph
    CursorMorph
    BoxMorph
    SpeechBubbleMorph
    DialMorph
    CircleBoxMorph
    SliderButtonMorph
    SliderMorph
    MouseSensorMorph*
    InspectorMorph
    MenuMorph
    StringMorph
    TextMorph
    TriggerMorph
    MenuItemMorph
    FrameMorph
    ScrollFrameMorph
    ListMorph
    StringFieldMorph
    BouncerMorph*
    HandMorph
    WorldMorph

    * included only for demo purposes


    III. yet to implement
    ---------------------
    - keyboard support for scroll frames and lists
    - virtual keyboard support for Android


    IV. open issues
    ----------------
    - clipboard support (copy & paste) for non-textual data


    V. browser compatibility
    ------------------------
    I have taken great care and considerable effort to make morphic.js
    runnable and appearing exactly the same on all current browsers
    available to me:

    - Firefox for Windows
    - Firefox for Mac
    - Firefox for Android (mobile)
    - Chrome for Windows
    - Chrome for Mac
    - Chrome for Android (mobile)
    - Safari for Windows (deprecated)
    - safari for Mac
    - Safari for iOS (mobile)
    - IE for Windows (partial support)
    - Edge for Windows
    - Opera for Windows
    - Opera for Mac


    VI. the big picture
    -------------------
    Morphic.js is completely based on Canvas and JavaScript, it is just
    Morphic, nothing else. Morphic.js is very basic and covers only the
    bare essentials:

        * a stepping mechanism (a time-sharing multiplexer for lively
          user interaction ontop of a single OS/browser thread)
        * progressive display updates (only dirty rectangles are
          redrawn at each display cycle)
        * a tree structure
        * a single World per Canvas element (although you can have
          multiple worlds in multiple Canvas elements on the same web
          page)
        * a single Hand per World (but you can support multi-touch
          events)
        * a single text entry focus per World

    In its current state morphic.js doesn't support transforms (you
    cannot rotate Morphs), but with PenMorph there already is a simple
    LOGO-like turtle that you can use to draw onto any Morph it is
    attached to. I'm planning to add special Morphs that support these
    operations later on, but not for every Morph in the system.
    Therefore these additions ("sprites" etc.) are likely to be part of
    other libraries ("microworld.js") in separate files.

    the purpose of morphic.js is to provide a malleable framework that
    will let me experiment with lively GUIs for my hobby horse, which
    is drag-and-drop, blocks based programming languages. Those things
    (SNAP!9 - https://snap.berkeley.edu) will be written using morphic.js
    as a library.


    VII. programming guide
    ----------------------
    Morphic.js provides a library for lively GUIs inside single HTML
    Canvas elements. Each such canvas element functions as a "world" in
    which other visible shapes ("morphs") can be positioned and
    manipulated, often directly and interactively by the user. Morphs
    are tree nodes and may contain any number of submorphs ("children").

    All things visible in a morphic World are morphs themselves, i.e.
    all text rendering, blinking cursors, entry fields, menus, buttons,
    sliders, windows and dialog boxes etc. are created with morphic.js
    rather than using HTML DOM elements, and as a consequence can be
    changed and adjusted by the programmer regardless of proprietary
    browser behavior.

    Each World has an - invisible - "Hand" resembling the mouse cursor
    (or the user's finger on touch screens) which handles mouse events,
    and may also have a keyboard focus to handle key events.

    The basic idea of Morphic is to continuously run display cycles and
    to incrementally update the screen by only redrawing those  World
    regions which have been "dirtied" since the last redraw. Before
    each shape is processed for redisplay it gets the chance to perform
    a "step" procedure, thus allowing for an illusion of concurrency.


    VIII. minifying morphic.js
    -------------------------
    Coming from Smalltalk and being a Squeaker at heart I am a huge fan
    of browsing the code itself to make sense of it. Therefore I have
    included this documentation and (too little) inline comments so all
    you need to get going is this very file.

    Nowadays with live streaming HD video even on mobile phones 250 KB
    shouldn't be a big strain on bandwith, still minifying and even
    compressing morphic.js down do about 100 KB may sometimes improve
    performance in production use.

    Being an attorney-at-law myself you programmer folk keep harassing
    me with rabulistic nitpickings about free software licenses. I'm
    releasing morphic.js under an AGPL license. Therefore please make
    sure to adhere to that license in any minified or compressed version.


    IX. acknowledgements
    ----------------------
    The original Morphic was designed and written by Randy Smith and
    John Maloney for the SELF programming language, and later ported to
    Squeak (Smalltalk) by John Maloney and Dan Ingalls, who has also
    ported it to JavaScript (the Lively Kernel), once again setting
    a "Gold Standard" for self sustaining systems which morphic.js
    cannot and does not aspire to meet.

    This Morphic implementation for JavaScript is not a direct port of
    Squeak's Morphic, but still many individual functions have been
    ported almost literally from Squeak, sometimes even including their
    comments, e.g. the morph duplication mechanism fullCopy(). Squeak
    has been a treasure trove, and if morphic.js looks, feels and
    smells a lot like Squeak, I'll take it as a compliment.

    Evelyn Eastmond has inspired and encouraged me with her wonderful
    implementation of DesignBlocksJS. Thanks for sharing code, ideas
    and enthusiasm for programming.

    John Maloney has been my mentor and my source of inspiration for
    these Morphic experiments. Thanks for the critique, the suggestions
    and explanations for all things Morphic and for being my all time
    programming hero.

    I have originally written morphic.js in Florian Balmer's Notepad2
    editor for Windows, later switched to Apple's Dashcode and later
    still to Apple's Xcode. I've also come to depend on both Douglas
    Crockford's JSLint and later the JSHint project, as well as on
    Mozilla's Firebug and Google's Chrome to get it right.


    X. contributors
    ----------------------
    Joe Otto found and fixed many early bugs and taught me some tricks.
    Nathan Dinsmore contributed mouse wheel scrolling, cached
    background texture handling, countless bug fixes and optimizations.
    Ian Reynolds contributed backspace key handling for Chrome.
    Davide Della Casa contributed performance optimizations for Firefox.
    Jason N (@cyderize) contributed native copy & paste for text editing.
    Bartosz Leper contributed retina display support.
    Zhenlei Jia and Dariusz Dorożalski pioneered IME text editing.
    Bernat Romagosa contributed to text editing and to the core design.
    Michael Ball found and fixed a longstanding scrolling bug.
    Brian Harvey contributed to the design and implementation of submenus.
    Ken Kahn contributed to Chinese keboard entry and Android support.
    Brian Broll contributed clickable URLs in text elements.

    - Jens Mönig

*/

// Global settings /////////////////////////////////////////////////////

/*global window, HTMLCanvasElement, FileReader, Audio, FileList, Map*/

/*jshint esversion: 6*/

var morphicVersion = '2023-December-11'; var useBlurredShadows = true;

// Global Functions ////////////////////////////////////////////////////

function asAnArray (input) {return ((input instanceof Array) ? input : [input]);}; function asANum (input) {return (contains(['number', 'string', 'boolean'], (typeof input)) ? (isNaN(+input) ? 0 : +input) : (
isNil(input) ? 0 : input.isComplex ? new ComplexNumber(+input, +(input.i)) : (input.isAlphanumerical ? +input : 0)));}; function asABool (input) {if (isNil(input)) {return false;} else {return ((asANum(input
) > 0) ? true : (input === 'true'));};}; function nop () {return null;}; function localize (string) {return string;}; function isNil (thing) {return contains([undefined, null], thing);}; function contains (
list, element) {return ((list instanceof Array) ? (list.indexOf(element) > -1) : false);}; Array.prototype.deepMap = function anonymous (callback) {return this.map(item => ((item instanceof Array) ? item.deepMap(
callback) : callback(item)));}; Array.prototype.fullCopy = function anonymous () {return this.deepMap(item => ((item instanceof Array) ? item.fullCopy() : item));}; function detect (list, predicate) {var i,
size = list.length; for (i = 0; i < size; i += 1) {if (predicate.call(null, list[i])) {return list[i];};}; return null;}; function sizeOf (object) {var size = 0, key; for (key in object) {if (
Object.prototype.hasOwnProperty.call(object, key)) {size += 1;};}; return size;}; function isString (target) {return (((typeof target) === 'string') || (target instanceof String));};
function isObject (target) {return (target !== null) && (typeof target === 'object' || target instanceof Object);}; function radians (degrees) {return degrees * (Math.PI / 180);}; function degrees (radians
) {return radians * (180 / Math.PI);}; function fontHeight (height) {var minHeight = Math.max(height, MorphicPreferences.minimumFontHeight); return minHeight * 1.2;}; function isWordChar (aCharacter) {
return aCharacter.match(/[A-zÀ-ÿ0-9]/);}; function isURLChar (aCharacter) {return aCharacter.match(/[A-z0-9./:?&_+%-]/);}; function isURL(text) {return /^https?:\/\//.test(text);}; if (isNil(localStorage[
'-snap-setting-isShowingBlanks'])) {localStorage['-snap-setting-isShowingBlanks'] = true;}; const BLACK = new Color; const CLEAR = new Color(0, 0, 0, 0); const WHITE = new Color(255, 255, 255);
const ZERO = new Point; Object.freeze(ZERO); Object.freeze(BLACK); Object.freeze(WHITE); function extraContains (list, element) {if (element instanceof Array) {var result = element.deepMap(item => contains(
list, item)), i = 0; while (i < result.length) {if (result[i]) {return true;}; i++;}; return false;} else {return contains(list, element);};}; /* Better Morphic functions and better improvements. :~) */

var standardSettings = {
    minimumFontHeight: getMinimumFontHeight(),
    globalFontFamily: 'morphicGlobalFont',
    menuFontName: 'sans-serif',
    menuFontSize: 12,
    bubbleHelpFontSize: 10,
    prompterFontName: 'sans-serif',
    prompterFontSize: 12,
    prompterSliderSize: 10,
    handleSize: 15,
    scrollBarSize: 9,
    mouseScrollAmount: 40,
    useSliderForInput: false,
    isTouchDevice: false,
    rasterizeSVGs: false,
    isFlat: false,
    grabThreshold: 0,
    showHoles: false
};

var touchScreenSettings = {
    minimumFontHeight: getMinimumFontHeight(),
    globalFontFamily: 'morphicGlobalFont',
    menuFontName: 'sans-serif',
    menuFontSize: 24,
    bubbleHelpFontSize: 18,
    prompterFontName: 'sans-serif',
    prompterFontSize: 24,
    prompterSliderSize: 20,
    handleSize: 26,
    scrollBarSize: 24,
    mouseScrollAmount: 40,
    useSliderForInput: false,
    isTouchDevice: true,
    rasterizeSVGs: false,
    isFlat: false,
    grabThreshold: 0,
    showHoles: false
};

var MorphicPreferences = standardSettings;

// first, try enabling support for retina displays - can be turned off later

/*
    Support for retina displays has been pioneered and contributed by
    Bartosz Leper.

    NOTE: this will make changes to the HTMLCanvasElement that - mostly -
    make Morphic usable on retina displays in very high resolution mode
    with crisp fonts and clear fine lines without you (the programmer)
    needing to know any specifics, provided both the display and the browser
    support these (Safari currently doesn't), otherwise these utilities will
    not be installed.
    If you don't want your Morphic application to support retina resolutions
    you don't have to edit this morphic.js file to comment out the next line
    of code, instead you can simply call

        disableRetinaSupport();

    before you create your World(s) in the html page. Disabling retina
    support also will simply do nothing if retina support is not possible
    or already disabled, so it's equally safe to call.

    For an example how to make retina support user-specifiable refer to
    User Interface >> src >> gui.js >> toggleRetina()
*/

enableRetinaSupport();

function newCanvas(extentPoint, nonRetina, recycleMe) {
    // answer a new empty instance of Canvas, don't display anywhere
    // nonRetina - optional Boolean "false"
    // by default retina support is automatic
    // optional existing canvas to be used again, unless it is marked as
    // being shared among Morphs (dataset property "morphicShare")
    var canvas, ext;
    nonRetina = nonRetina || false;
    ext = (extentPoint ||
            (recycleMe ? new Point(recycleMe.width, recycleMe.height)
                : new Point(0, 0))).ceil();
    if (recycleMe &&
            !recycleMe.dataset.morphicShare &&
            (recycleMe.isRetinaEnabled || false) !== nonRetina &&
            ext.x === recycleMe.width && ext.y === recycleMe.height
    ) {
        canvas = recycleMe;
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        return canvas;
    } else {
        canvas = document.createElement('canvas');
        canvas.width = ext.x;
        canvas.height = ext.y;
        canvas.getContext("2d", {
            willReadFrequently: true
        });
    }
    if (nonRetina && canvas.isRetinaEnabled) {
        canvas.isRetinaEnabled = false;
    }
    return canvas;
}

function copyCanvas(aCanvas) {
    // answer a deep copy of a canvas element respecting its retina status
    var c;
    if (aCanvas && aCanvas.width && aCanvas.height) {
        c = newCanvas(
            new Point(aCanvas.width, aCanvas.height),
            !aCanvas.isRetinaEnabled
        );
        c.getContext("2d").drawImage(aCanvas, 0, 0);
        return c;
    }
    return aCanvas;
}

function getMinimumFontHeight() {
    // answer the height of the smallest font renderable in pixels
    var str = 'I',
        size = 50,
        canvas = document.createElement('canvas'),
        ctx,
        maxX,
        data,
        x,
        y;
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext("2d", {
         willReadFrequently: true
    });
    ctx.font = '1px serif';
    maxX = ctx.measureText(str).width;
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'bottom';
    ctx.fillText(str, 0, size);
    for (y = 0; y < size; y += 1) {
        for (x = 0; x < maxX; x += 1) {
            data = ctx.getImageData(x, y, 1, 1);
            if (data.data[3] !== 0) {
                return size - y + 1;
            }
        }
    }
    return 0;
}

function getDocumentPositionOf(aDOMelement) {
    // answer the relative coordinates of a DOM element in the viewport
    var rect = aDOMelement.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {x: rect.left + scrollLeft, y:rect.top + scrollTop};
}

function copy(target) {
    // answer a shallow copy of target
    var value, c, property, keys, l, i;
    if (typeof target !== 'object') {
        return target;
    }
    value = target.valueOf();
    if (target !== value) {
        return new target.constructor(value);
    }
    if (target instanceof target.constructor &&
            target.constructor !== Object) {
        c = Object.create(target.constructor.prototype);
        keys = Object.keys(target);
        for (l = keys.length, i = 0; i < l; i += 1) {
            property = keys[i];
            if (target[property] instanceof HTMLCanvasElement) {
                // tag canvas elements as being shared,
                // so the next time when rerendering a Morph
                // instead of recycling the shared canvas a
                // new unshared one get created
                // see newCanvas() function
                target[property].dataset.morphicShare = 'true';
            }
            c[property] = target[property];
        }
    } else {
        c = {};
        for (property in target) {
            c[property] = target[property];
        }
    }
    return c;
}

// Retina Display Support //////////////////////////////////////////////

/*
    By default retina support gets installed when Morphic.js loads. There
    are two global functions that let you test for retina availability:

        isRetinaSupported() - Boolean, whether retina support is available
        isRetinaEnabled()   - Boolean, whether currently in retina mode

    and two more functions that let you control retina support if it is
    available:

        enableRetinaSupport()
        disableRetinaSupport()

    Both of these internally test whether retina is available, so they are
    safe to call directly.

    Even when in retina mode it often makes sense to use non-high-resolution
    canvasses for simple shapes in order to save system resources and
    optimize performance. Examples are costumes and backgrounds in Snap.
    In Morphic you can create new canvas elements using

        newCanvas(extentPoint [, nonRetinaFlag])

    If retina support is enabled such new canvasses will automatically be
    high-resolution canvasses, unless the newCanvas() function is given an
    otherwise optional second Boolean <true> argument that explicitly makes
    it a non-retina canvas.

    Not the whole canvas API is supported by Morphic's retina utilities.
    Especially if your code uses putImageData() you will want to "downgrade"
    a target high-resolution canvas to a normal-resolution ("non-retina")
    one before using

        normalizeCanvas(aCanvas [, copyFlag])

    This will change the target canvas' resolution in place (!). If you
    pass in the optional second Boolean <true> flag the function returns
    a non-retina copy and leaves the target canvas unchanged. An example
    of this normalize mechanism is converting the penTrails layer of Snap's
    stage (high-resolution) into a sprite-costume (normal resolution).
*/

function enableRetinaSupport() {
/*
    === contributed by Bartosz Leper ===

    This installs a series of utilities that allow using Canvas the same way
    on retina and non-retina displays. If the display is a retina one, the
    underlying dimensions of the Canvas elements are doubled, but this will
    be transparent to the code that uses Canvas. All dimensions read or
    written to the Canvas element will be scaled appropriately.

    NOTE: This implementation is not exhaustive; it only implements what is
    needed by the Snap! UI.

    [Jens]: like all other retina screen support implementations I've seen
    Bartosz's patch also does not address putImageData() compatibility when
    mixing retina-enabled and non-retina canvasses. If you need to manipulate
    pixels in such mixed canvasses, make sure to "downgrade" them all using
    normalizeCanvas() below.
*/

    // Get the window's pixel ratio for canvas elements.
    // See: http://www.html5rocks.com/en/tutorials/canvas/hidpi/
    var ctx = document.createElement("canvas").getContext("2d"),
        backingStorePixelRatio = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1,

    // Unfortunately, it's really hard to make this work well when changing
    // zoom level, so let's leave it like this right now, and stick to
    // whatever the ratio was in the beginning.

        // originalDevicePixelRatio = window.devicePixelRatio,

    // [Jens]: As of summer 2016 non-integer devicePixelRatios lead to
    // artifacts when blitting images onto canvas elements in all browsers
    // except Chrome, especially Firefox, Edge, IE (Safari doesn't even
    // support retina mode as implemented here).
    // therefore - to ensure crisp fonts - use the ceiling of whatever
    // the devicePixelRatio is. This needs more memory, but looks nicer.

        originalDevicePixelRatio = Math.ceil(window.devicePixelRatio),

        canvasProto = HTMLCanvasElement.prototype,
        contextProto = CanvasRenderingContext2D.prototype,

    // [Jens]: keep track of original properties in a dictionary
    // so they can be iterated over and restored
        uber = {
            drawImage: contextProto.drawImage,
            getImageData: contextProto.getImageData,

            width: Object.getOwnPropertyDescriptor(
                canvasProto,
                'width'
            ),
            height: Object.getOwnPropertyDescriptor(
                canvasProto,
                'height'
            ),
            shadowOffsetX: Object.getOwnPropertyDescriptor(
                contextProto,
                'shadowOffsetX'
            ),
            shadowOffsetY: Object.getOwnPropertyDescriptor(
                contextProto,
                'shadowOffsetY'
            ),
            shadowBlur: Object.getOwnPropertyDescriptor(
                contextProto,
                'shadowBlur'
            )
        };

    // [Jens]: only install retina utilities if the display supports them
    if (backingStorePixelRatio === originalDevicePixelRatio) {return; }
    // [Jens]: check whether properties can be overridden, needed for Safari
    if (Object.keys(uber).some(any => {
        var prop = uber[any];
        return prop.hasOwnProperty('configurable') && (!prop.configurable);
    })) {return; }

    function getPixelRatio(imageSource) {
        return imageSource.isRetinaEnabled ?
            (originalDevicePixelRatio || 1) / backingStorePixelRatio : 1;
    }

    canvasProto._isRetinaEnabled = true;
    // [Jens]: remember the original non-retina properties,
    // so they can be restored again
    canvasProto._bak = uber;

    Object.defineProperty(canvasProto, 'isRetinaEnabled', {
        get: function() {
            return this._isRetinaEnabled;
        },
        set: function(enabled) {
            var prevPixelRatio = getPixelRatio(this),
                prevWidth = this.width,
                prevHeight = this.height;

            this._isRetinaEnabled = enabled;
            if (getPixelRatio(this) != prevPixelRatio) {
                this.width = prevWidth;
                this.height = prevHeight;
            }
        },
        configurable: true // [Jens]: allow to be deleted an reconfigured
    });

    Object.defineProperty(canvasProto, 'width', {
        get: function() {
            return uber.width.get.call(this) / getPixelRatio(this);
        },
        set: function(width) {
            try { // workaround one of FF's dreaded NS_ERROR_FAILURE bugs
                // this should be taken out as soon as FF gets fixed again
                var pixelRatio = getPixelRatio(this),
                    context;
                uber.width.set.call(this, width * pixelRatio);
                context = this.getContext('2d');
                /*
                context.restore();
                context.save();
                */
                context.scale(pixelRatio, pixelRatio);
            } catch (err) {
                console.log('Retina Display Support Problem', err);
                uber.width.set.call(this, width);
            }
        }
    });

    Object.defineProperty(canvasProto, 'height', {
        get: function() {
            return uber.height.get.call(this) / getPixelRatio(this);
        },
        set: function(height) {
            var pixelRatio = getPixelRatio(this),
                context;
            uber.height.set.call(this, height * pixelRatio);
            context = this.getContext('2d');
            /*
            context.restore();
            context.save();
            */
            context.scale(pixelRatio, pixelRatio);
        }
    });

    contextProto.drawImage = function(image) {
        var pixelRatio = getPixelRatio(image),
            sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight;

        // Different signatures of drawImage() method have different
        // parameter assignments.
        switch (arguments.length) {
            case 9:
                sx = arguments[1];
                sy = arguments[2];
                sWidth = arguments[3];
                sHeight = arguments[4];
                dx = arguments[5];
                dy = arguments[6];
                dWidth = arguments[7];
                dHeight = arguments[8];
                break;

            case 5:
                sx = 0;
                sy = 0;
                sWidth = image.width;
                sHeight = image.height;
                dx = arguments[1];
                dy = arguments[2];
                dWidth = arguments[3];
                dHeight = arguments[4];
                break;

            case 3:
                sx = 0;
                sy = 0;
                sWidth = image.width;
                sHeight = image.height;
                dx = arguments[1];
                dy = arguments[2];
                dWidth = image.width;
                dHeight = image.height;
                break;

            default:
                throw Error('Called drawImage() with ' + arguments.length +
                        ' arguments');
        }
        uber.drawImage.call(
                this, image,
                sx * pixelRatio, sy * pixelRatio,
                sWidth * pixelRatio, sHeight * pixelRatio,
                dx, dy,
                dWidth, dHeight);
    };

    contextProto.getImageData = function(sx, sy, sw, sh) {
        var pixelRatio = getPixelRatio(this.canvas);
        return uber.getImageData.call(
                this,
                sx * pixelRatio, sy * pixelRatio,
                sw * pixelRatio, sh * pixelRatio);
    };

    Object.defineProperty(contextProto, 'shadowOffsetX', {
        get: function() {
            return uber.shadowOffsetX.get.call(this) /
                getPixelRatio(this.canvas);
        },
        set: function(offset) {
            var pixelRatio = getPixelRatio(this.canvas);
            uber.shadowOffsetX.set.call(this, offset * pixelRatio);
        }
    });

    Object.defineProperty(contextProto, 'shadowOffsetY', {
        get: function() {
            return uber.shadowOffsetY.get.call(this) /
                getPixelRatio(this.canvas);
        },
        set: function(offset) {
            var pixelRatio = getPixelRatio(this.canvas);
            uber.shadowOffsetY.set.call(this, offset * pixelRatio);
        }
    });

    Object.defineProperty(contextProto, 'shadowBlur', {
        get: function() {
            return uber.shadowBlur.get.call(this) /
                getPixelRatio(this.canvas);
        },
        set: function(blur) {
            var pixelRatio = getPixelRatio(this.canvas);
            uber.shadowBlur.set.call(this, blur * pixelRatio);
        }
    });
}

function isRetinaSupported () {
    var ctx = document.createElement("canvas").getContext("2d"),
        backingStorePixelRatio = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1,
        canvasProto = HTMLCanvasElement.prototype,
        contextProto = CanvasRenderingContext2D.prototype,
        uber = {
            drawImage: contextProto.drawImage,
            getImageData: contextProto.getImageData,

            width: Object.getOwnPropertyDescriptor(
                canvasProto,
                'width'
            ),
            height: Object.getOwnPropertyDescriptor(
                canvasProto,
                'height'
            ),
            shadowOffsetX: Object.getOwnPropertyDescriptor(
                contextProto,
                'shadowOffsetX'
            ),
            shadowOffsetY: Object.getOwnPropertyDescriptor(
                contextProto,
                'shadowOffsetY'
            ),
            shadowBlur: Object.getOwnPropertyDescriptor(
                contextProto,
                'shadowBlur'
            )
        };
    return backingStorePixelRatio !== window.devicePixelRatio &&
        !(Object.keys(uber).some(any => {
            var prop = uber[any];
            return prop.hasOwnProperty('configurable') && (!prop.configurable);
        })
    );
}

function isRetinaEnabled () {return HTMLCanvasElement.prototype.hasOwnProperty('_isRetinaEnabled');};

function disableRetinaSupport() {
    // uninstalls Retina utilities. Make sure to re-create every Canvas
    // element afterwards
    var canvasProto, contextProto, uber;
    if (!isRetinaEnabled()) {return; }
    canvasProto = HTMLCanvasElement.prototype;
    contextProto = CanvasRenderingContext2D.prototype;
    uber = canvasProto._bak;
    Object.defineProperty(canvasProto, 'width', uber.width);
    Object.defineProperty(canvasProto, 'height', uber.height);
    contextProto.drawImage = uber.drawImage;
    contextProto.getImageData = uber.getImageData;
    Object.defineProperty(contextProto, 'shadowOffsetX', uber.shadowOffsetX);
    Object.defineProperty(contextProto, 'shadowOffsetY', uber.shadowOffsetY);
    Object.defineProperty(contextProto, 'shadowBlur', uber.shadowBlur);
    delete canvasProto._isRetinaEnabled;
    delete canvasProto.isRetinaEnabled;
    delete canvasProto._bak;
};

function normalizeCanvas(aCanvas, getCopy) {
    // make sure aCanvas is non-retina, otherwise convert it in place (!)
    // or answer a normalized copy if the "getCopy" flag is <true>
    var cpy;
    if (!aCanvas.isRetinaEnabled) {return aCanvas; }
    cpy = newCanvas(new Point(aCanvas.width, aCanvas.height), true);
    cpy.getContext('2d').drawImage(aCanvas, 0, 0);
    if (getCopy) {return cpy; }
    aCanvas.isRetinaEnabled = false;
    aCanvas.width = cpy.width;
    aCanvas.height = cpy.height;
    aCanvas.getContext('2d').drawImage(cpy, 0, 0);
    return aCanvas;
};

// Animations //////////////////////////////////////////////////////////////

/*
    Animations handle gradual transitions between one state and another over a
    period of time. Transition effects can be specified using easing functions.
    An easing function maps a fraction of the transition time to a fraction of
    the state delta. This way accelerating / decelerating and bouncing sliding
    effects can be accomplished.

    Animations are generic and not limited to motion, i.e. they can also handle
    other transitions such as color changes, transparency fadings, growing,
    shrinking, turning etc.

    Animations need to be stepped by a scheduler, e. g. an interval function.
    In Morphic the preferred way to run an animation is to register it with
    the World by adding it to the World's animation queue. The World steps each
    registered animation once per display cycle independently of the Morphic
    stepping mechanism.

    For an example how to use animations look at how the Morph's methods

        glideTo()
        fadeTo()

    and

        slideBackTo()

    are implemented.
*/

// Animation instance creation:

function Animation(setter, getter, delta, duration, easing, onComplete) {
    this.setter = setter; // function
    this.getter = getter; // function
    this.delta = delta || 0; // number
    this.duration = duration || 0; // milliseconds
    this.easing = isString(easing) ? // string or function
            this.easings[easing] || this.easings.sinusoidal
                : easing || this.easings.sinusoidal;
    this.onComplete = onComplete || null; // optional callback
    this.endTime = null;
    this.destination = null;
    this.isActive = false;
    this.start();
}

Animation.prototype.easings = {
    // dictionary of a few pre-defined easing functions used to transition
    // two states

    // ease both in and out:
    linear: t => t,
    sinusoidal: t => 1 - Math.cos(radians(t * 90)),
    quadratic: t => t < 0.5 ? 2 * t * t : ((4 - (2 * t)) * t) - 1,
    cubic: t => {
        return t < 0.5 ?
            4 * t * t * t
                : ((t - 1) * ((2 * t) - 2) * ((2 * t) - 2)) + 1;
    },
    elastic: t => {
        return (t -= 0.5) < 0 ?
            (0.01 + 0.01 / t) * Math.sin(50 * t)
                : (0.02 - 0.01 / t) * Math.sin(50 * t) + 1;
    },

    // ease in only:
    sine_in: t => 1 - Math.sin(radians(90 + (t * 90))),
    quad_in: t => t * t,
    cubic_in: t => t * t * t,
    elastic_in: t => (0.04 - 0.04 / t) * Math.sin(25 * t) + 1,

    // ease out only:
    sine_out: t => Math.sin(radians(t * 90)),
    quad_out: t => t * (2 - t),
    elastic_out: t => 0.04 * t / (--t) * Math.sin(25 * t)
};

Animation.prototype.start = function () {
    // (re-) activate the animation, e.g. if is has previously completed,
    // make sure to plug it into something that repeatedly triggers step(),
    // e.g. the World's animations queue
    this.endTime = Date.now() + this.duration;
    this.destination = this.getter.call(this) + this.delta;
    this.isActive = true;
};

Animation.prototype.step = function () {
    if (!this.isActive) {return; }
    var now = Date.now();
    if (now > this.endTime) {
        this.setter(this.destination);
        this.isActive = false;
        if (this.onComplete) {this.onComplete(); }
    } else {
        this.setter(
            this.destination -
                (this.delta * this.easing((this.endTime - now) / this.duration))
        );
    }
};

// Colors //////////////////////////////////////////////////////////////

// Color instance creation:

function Color (r, g, b, a) {this.r = Math.max(Math.min(r, 255), 0) || 0;
this.g = Math.max(Math.min(g, 255), 0) || 0; this.b = Math.max(Math.min(
b, 255), 0) || 0; this.a = !isNil(a) ? Math.max(Math.min(a, 1), 0) : 1;
this.quality = (isNil(localStorage['-snap-setting-colorQuality']) ?
1 : (255 / +(localStorage['-snap-setting-colorQuality'])));};

// Color string representation: e.g. 'rgba(255,165,0,1)'

Color.prototype.toString = function anonymous () {return ('rgba\(').concat((Math.round(this.r / this.quality) * this.quality), ',',
(Math.round(this.g / this.quality) * this.quality), ',', (Math.round(this.b / this.quality) * this.quality), ',', this.a, '\)');};

Color.prototype.toRGBstring = function anonymous () {return ('rgb\(').concat((Math.round(this.r / this.quality) * this.quality), ',',
(Math.round(this.g / this.quality) * this.quality), ',', (Math.round(this.b / this.quality) * this.quality), '\)');};

Color.fromString = function (aString) {var components = aString.split(/[\(),]/).slice(1,5); return new Color(components[0], components[1], components[2], components[3]);};

// Color copying:

Color.prototype.copy = function anonymous () {return new Color(this.r, this.g, this.b, this.a);};

// Color comparison:

Color.prototype.eq = function anonymous (aColor, observeAlpha) {
return (aColor instanceof Color) && (this.r === aColor.r &&
this.g === aColor.g && this.b === aColor.b && (
observeAlpha ? this.a === aColor.a : true));};
Color.prototype.equalTo = Color.prototype.eq;

Color.prototype.isCloseTo = function (aColor, observeAlpha, tolerance) {
    // experimental - answer whether a color is "close" to another one by
    // a given percentage. tolerance is the percentage by which each color
    // channel may diverge, alpha needs to be the exact same unless ignored
    var thres = 2.55 * (tolerance || 10);

    function dist(a, b) {
        var diff = a - b;
        return diff < 0 ? 255 + diff : diff;
    }

    return aColor &&
        dist(this.r, aColor.r) < thres &&
        dist(this.g, aColor.g) < thres &&
        dist(this.b, aColor.b) < thres &&
        (observeAlpha ? this.a === aColor.a : true);
};

// Color conversion (hsv):

Color.prototype.hsv = function () {
    // ignore alpha
    var max, min, h, s, v, d,
        rr = this.r / 255,
        gg = this.g / 255,
        bb = this.b / 255;
    max = Math.max(rr, gg, bb);
    min = Math.min(rr, gg, bb);
    h = max;
    s = max;
    v = max;
    d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
        case rr:
            h = (gg - bb) / d + (gg < bb ? 6 : 0);
            break;
        case gg:
            h = (bb - rr) / d + 2;
            break;
        case bb:
            h = (rr - gg) / d + 4;
            break;
        }
        h /= 6;
    }
    return [h, s, v];
};

Color.prototype.set_hsv = function (h, s, v) {
    // ignore alpha, h, s and v are to be within [0, 1]
    var i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
    case 0:
        this.r = v;
        this.g = t;
        this.b = p;
        break;
    case 1:
        this.r = q;
        this.g = v;
        this.b = p;
        break;
    case 2:
        this.r = p;
        this.g = v;
        this.b = t;
        break;
    case 3:
        this.r = p;
        this.g = q;
        this.b = v;
        break;
    case 4:
        this.r = t;
        this.g = p;
        this.b = v;
        break;
    case 5:
        this.r = v;
        this.g = p;
        this.b = q;
        break;
    }

    this.r *= 255;
    this.g *= 255;
    this.b *= 255;

};

// Color conversion (hsl):

Color.prototype.hsl = function () {
    // ignore alpha
    var rr = this.r / 255,
        gg = this.g / 255,
        bb = this.b / 255,
        max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb),
        h,
        s,
        l = (max + min) / 2,
        d;
    if (max === min) { // achromatic
        h = 0;
        s = 0;
    } else {
        d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
        case rr:
            h = (gg - bb) / d + (gg < bb ? 6 : 0);
            break;
        case gg:
            h = (bb - rr) / d + 2;
            break;
        case bb:
            h = (rr - gg) / d + 4;
            break;
        }
        h /= 6;
    }
    return [h, s, l];
};

Color.prototype.set_hsl = function (h, s, l) {
    // ignore alpha, h, s and l are to be within [0, 1]
    var q, p;

    function hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1/6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1/2) {
            return q;
        }
        if (t < 2/3) {
            return p + (q - p) * (2/3 - t) * 6;
        }
        return p;
    }

    if (s == 0) { // achromatic
        this.r = l;
        this.g = l;
        this.b = l;
    } else {
        q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        p = 2 * l - q;
        this.r = hue2rgb(p, q, h + 1/3);
        this.g = hue2rgb(p, q, h);
        this.b = hue2rgb(p, q, h - 1/3);
    }

    this.r *= 255;
    this.g *= 255;
    this.b *= 255;
};

// Color mixing:

Color.prototype.mixed = function (proportion, otherColor) {
    // answer a copy of this color mixed with another color, ignore alpha
    var frac1 = Math.min(Math.max(proportion, 0), 1),
        frac2 = 1 - frac1;
    return new Color(
        this.r * frac1 + otherColor.r * frac2,
        this.g * frac1 + otherColor.g * frac2,
        this.b * frac1 + otherColor.b * frac2
    );
};

Color.prototype.darker = function (percent) {
    // return an rgb-interpolated darker copy of me, ignore alpha
    var fract = 0.8333;
    if (percent) {
        fract = (100 - percent) / 100;
    }
    return this.mixed(fract, BLACK);
};

Color.prototype.lighter = function (percent) {
    // return an rgb-interpolated lighter copy of me, ignore alpha
    var fract = 0.8333;
    if (percent) {
        fract = (100 - percent) / 100;
    }
    return this.mixed(fract, WHITE);
};

Color.prototype.dansDarker = function () {
    // return an hsv-interpolated darker copy of me, ignore alpha
    var hsv = this.hsv(),
        result = new Color(),
        vv = Math.max(hsv[2] - 0.16, 0);
    result.set_hsv(hsv[0], hsv[1], vv);
    return result;
};

Color.prototype.inverted = function () {
    return new Color(
        255 - this.r,
        255 - this.g,
        255 - this.b
    );
};

Color.prototype.solid = function () {
    return new Color(
        this.r,
        this.g,
        this.b
    );
};

// Points //////////////////////////////////////////////////////////////

// Point instance creation:

function Point (x, y
) {this.x = asANum(x
); this.y = asANum(y
);}; /* Restored. */

// Point string representation: e.g. '12@68'

Point.prototype.toString = function () {
    return Math.round(this.x.toString()) +
        '@' + Math.round(this.y.toString());
};

// Point copying:

Point.prototype.copy = function () {
    return new Point(this.x, this.y);
};

// Point comparison:

Point.prototype.eq = function (aPoint) {
    // ==
    return this.x === aPoint.x && this.y === aPoint.y;
};

Point.prototype.lt = function (aPoint) {
    // <
    return this.x < aPoint.x && this.y < aPoint.y;
};

Point.prototype.gt = function (aPoint) {
    // >
    return this.x > aPoint.x && this.y > aPoint.y;
};

Point.prototype.ge = function (aPoint) {
    // >=
    return this.x >= aPoint.x && this.y >= aPoint.y;
};

Point.prototype.le = function (aPoint) {
    // <=
    return this.x <= aPoint.x && this.y <= aPoint.y;
};

Point.prototype.max = function (aPoint) {
    return new Point(Math.max(this.x, aPoint.x),
        Math.max(this.y, aPoint.y));
};

Point.prototype.min = function (aPoint) {
    return new Point(Math.min(this.x, aPoint.x),
        Math.min(this.y, aPoint.y));
};

// Point conversion:

Point.prototype.round = function () {
    return new Point(Math.round(this.x), Math.round(this.y));
};

Point.prototype.abs = function () {
    return new Point(Math.abs(this.x), Math.abs(this.y));
};

Point.prototype.neg = function () {
    return new Point(-this.x, -this.y);
};

Point.prototype.mirror = function () {
    return new Point(this.y, this.x);
};

Point.prototype.floor = function () {
    return new Point(
        Math.max(Math.floor(this.x), 0),
        Math.max(Math.floor(this.y), 0)
    );
};

Point.prototype.ceil = function () {
    return new Point(Math.ceil(this.x), Math.ceil(this.y));
};

// Point arithmetic:

Point.prototype.add = function (other) {
    if (other instanceof Point) {
        return new Point(this.x + other.x, this.y + other.y);
    };  return new Point(this.x + other, this.y + other);
};

Point.prototype.subtract = function (other) {
    if (other instanceof Point) {
        return new Point(this.x - other.x, this.y - other.y);
    };  return new Point(this.x - other, this.y - other);
};

Point.prototype.multiplyBy = function (other) {
    if (other instanceof Point) {
        return new Point(this.x * other.x, this.y * other.y);
    };  return new Point(this.x * other, this.y * other);
};

Point.prototype.divideBy = function (other) {
    if (other instanceof Point) {
        return new Point(this.x / other.x, this.y / other.y);
    };  return new Point(this.x / other, this.y / other);
};

Point.prototype.floorDivideBy = function (other) {
    if (other instanceof Point) {
        return new Point(Math.floor(this.x / other.x),
            Math.floor(this.y / other.y));
    };  return new Point(Math.floor(this.x / other),
        Math.floor(this.y / other));
};

// Point polar coordinates:

Point.prototype.r = function () {
    var t = (this.multiplyBy(this));
    return Math.sqrt(t.x + t.y);
};

Point.prototype.degrees = function () {
/*
    answer the angle I make with origin in degrees.
    Right is 0, down is 90
*/
    var tan, theta;

    if (this.x === 0) {
        if (this.y >= 0) {
            return 90;
        };  return 270;
    };  tan = this.y / this.x;
    theta = Math.atan(tan);
    if (this.x >= 0) {
        if (this.y >= 0) {
            return degrees(theta);
        };  return 360 + (degrees(theta));
    };  return 180 + degrees(theta);
};

Point.prototype.theta = function () {
/*
    answer the angle I make with origin in radians.
    Right is 0, down is 90
*/
    var tan, theta;

    if (this.x === 0) {
        if (this.y >= 0) {
            return (Math.PI / 2);
        };  return (Math.PI * 1.5
    );};    tan = this.y / this.x;
    theta = Math.atan(tan);
    if (this.x >= 0) {
        if (this.y >= 0) {
            return theta;
        };  return (
        Math.PI * 2
        ) + theta;
    };  return Math.PI + theta;
};

// Point functions:

Point.prototype.crossProduct = function (aPoint
) {return this.multiplyBy(aPoint.mirror());};

Point.prototype.distanceTo = function (aPoint
) {return (aPoint.subtract(this)).r();};

Point.prototype.rotate = function (direction, center) {
    // direction must be 'right', 'left' or 'pi'
    var offset = this.subtract(center);
    if (direction === 'right') {
        return new Point(-offset.y, offset.y).add(center);
    };  if (direction === 'left') {
        return new Point(offset.y, -offset.y).add(center);
    };  // direction === 'pi'
    return center.subtract(offset);
};

Point.prototype.flip = function (direction, center) {
    // direction must be 'vertical' or 'horizontal'
    if (direction === 'vertical') {
        return new Point(this.x, center.y * 2 - this.y);
    };  // direction === 'horizontal'
    return new Point(center.x * 2 - this.x, this.y);
};

Point.prototype.distanceAngle = function (dist, angle) {
    var deg = angle, x, y;
    if (deg > 270) {
        deg = deg - 360;
    } else if (deg < -270) {
        deg = deg + 360;
    };  if (-90 <= deg && deg <= 90) {
        x = Math.sin(radians(deg)) * dist;
        y = Math.sqrt((dist * dist) - (x * x));
        return new Point(x + this.x, this.y - y);
    };  x = Math.sin(radians(180 - deg)) * dist;
    y = Math.sqrt((dist * dist) - (x * x));
    return new Point(x + this.x, this.y + y);
};

// Point transforming:

Point.prototype.scaleBy = function (scalePoint
) {return this.multiplyBy(scalePoint);};

Point.prototype.translateBy = function (
deltaPoint) {return this.add(deltaPoint);};

Point.prototype.rotateBy = function (angle, centerPoint) {
    var center = centerPoint || ZERO,
        p = this.subtract(center),
        r = p.r(),
        theta = angle - p.theta();
    return new Point(
        center.x + (r * Math.cos(theta)),
        center.y - (r * Math.sin(theta))
    );
};

// Point conversion:

Point.prototype.asArray = function (
) {return [this.x, this.y];};

// Rectangles //////////////////////////////////////////////////////////

// Rectangle instance creation:

function Rectangle(left, top, right, bottom) {
this.init(new Point((left || 0), (top || 0)),
new Point((right || 0), (bottom || 0)));};

Rectangle.prototype.init = function (
originPoint, cornerPoint) {
this.origin = originPoint;
this.corner = cornerPoint;};

// Rectangle string representation: e.g. '[0@0 | 160@80]'

Rectangle.prototype.toString = function () {
    return '[' + this.origin.toString() + ' | ' +
        this.extent().toString() + ']';
};

// Rectangle copying:

Rectangle.prototype.copy = function () {
    return new Rectangle(
        this.left(),
        this.top(),
        this.right(),
        this.bottom()
    );
};

// creating Rectangle instances from Points:

Point.prototype.corner = function (cornerPoint) {
    // answer a new Rectangle
    return new Rectangle(
        this.x,
        this.y,
        cornerPoint.x,
        cornerPoint.y
    );
};

Point.prototype.rectangle = function (aPoint) {
    // answer a new Rectangle
    var org, crn;
    org = this.min(aPoint);
    crn = this.max(aPoint);
    return new Rectangle(org.x, org.y, crn.x, crn.y);
};

Point.prototype.extent = function (aPoint) {
    //answer a new Rectangle
    var crn = this.add(aPoint);
    return new Rectangle(this.x, this.y, crn.x, crn.y);
};

// Rectangle accessing - setting:

Rectangle.prototype.setTo = function (left, top, right, bottom) {
    // note: all inputs are optional and can be omitted

    this.origin = new Point(
        left || ((left === 0) ? 0 : this.left()),
        top || ((top === 0) ? 0 : this.top())
    );

    this.corner = new Point(
        right || ((right === 0) ? 0 : this.right()),
        bottom || ((bottom === 0) ? 0 : this.bottom())
    );
};

// Rectangle mutating

Rectangle.prototype.setExtent = function(aPoint) {
    this.setWidth(aPoint.x);
    this.setHeight(aPoint.y);
};

Rectangle.prototype.setWidth = function (width) {
    this.corner.x = this.origin.x + width;
};

Rectangle.prototype.setHeight = function (height) {
    this.corner.y = this.origin.y + height;
};

// Rectangle accessing - getting:

Rectangle.prototype.area = function anonymous () {return (Math.abs(
this.width()) * Math.abs(this.height()));}; /* -Better now. :-)- */

Rectangle.prototype.bottom = function () {
    return this.corner.y;
};

Rectangle.prototype.bottomCenter = function () {
    return new Point(this.center().x, this.bottom());
};

Rectangle.prototype.bottomLeft = function () {
    return new Point(this.origin.x, this.corner.y);
};

Rectangle.prototype.bottomRight = function () {
    return this.corner.copy();
};

Rectangle.prototype.boundingBox = function () {
    return this;
};

Rectangle.prototype.center = function () {
    return this.origin.add(
        this.corner.subtract(this.origin).divideBy(2)
    );
};

Rectangle.prototype.corners = function () {
    return [this.origin,
        this.bottomLeft(),
        this.corner,
        this.topRight()];
};

Rectangle.prototype.extent = function () {
    return this.corner.subtract(this.origin);
};

Rectangle.prototype.height = function () {
    return this.corner.y - this.origin.y;
};

Rectangle.prototype.left = function () {
    return this.origin.x;
};

Rectangle.prototype.leftCenter = function () {
    return new Point(this.left(), this.center().y);
};

Rectangle.prototype.right = function () {
    return this.corner.x;
};

Rectangle.prototype.rightCenter = function () {
    return new Point(this.right(), this.center().y);
};

Rectangle.prototype.top = function () {
    return this.origin.y;
};

Rectangle.prototype.topCenter = function () {
    return new Point(this.center().x, this.top());
};

Rectangle.prototype.topLeft = function () {
    return this.origin;
};

Rectangle.prototype.topRight = function () {
    return new Point(this.corner.x, this.origin.y);
};

Rectangle.prototype.width = function () {
    return this.corner.x - this.origin.x;
};

Rectangle.prototype.position = function () {
    return this.origin;
};

// Rectangle comparison:

Rectangle.prototype.eq = function (aRect) {
    return this.origin.eq(aRect.origin) &&
        this.corner.eq(aRect.corner);
};

Rectangle.prototype.abs = function (
) {var newOrigin = this.origin.abs(),
newCorner = this.corner.max(newOrigin);
return newOrigin.corner(newCorner);};

// Rectangle functions:

Rectangle.prototype.insetBy = function (delta) {
    // delta can be either a Point or a Number
    var result = new Rectangle;
    result.origin = this.origin.add(delta);
    result.corner = this.corner.subtract(delta);
    return result;
};

Rectangle.prototype.expandBy = function (delta) {
    // delta can be either a Point or a Number
    var result = new Rectangle;
    result.origin = this.origin.subtract(delta);
    result.corner = this.corner.add(delta);
    return result;
};

Rectangle.prototype.growBy = function (delta) {
    // delta can be either a Point or a Number
    var result = new Rectangle;
    result.origin = this.origin.copy();
    result.corner = this.corner.add(delta);
    return result;
};

Rectangle.prototype.intersect = function (aRect) {
    var result = new Rectangle;
    result.origin = this.origin.max(aRect.origin);
    result.corner = this.corner.min(aRect.corner);
    return result;
};

Rectangle.prototype.merge = function (aRect) {
    var result = new Rectangle;
    result.origin = this.origin.min(aRect.origin);
    result.corner = this.corner.max(aRect.corner);
    return result;
};

Rectangle.prototype.mergeWith = function (aRect) {
    // mutates myself
    this.origin = this.origin.min(aRect.origin);
    this.corner = this.corner.max(aRect.corner);
};

Rectangle.prototype.round = function () {
    return this.origin.round().corner(this.corner.round());
};

Rectangle.prototype.spread = function () {
    // round me by applying floor() to my origin and ceil() to my corner
    // avoids artefacts on retina displays
    return this.origin.floor().corner(this.corner.ceil());
};

Rectangle.prototype.amountToTranslateWithin = function (aRect) {
/*
    Answer a Point, delta, such that self + delta is forced within
    aRectangle. when all of me cannot be made to fit, prefer to keep
    my topLeft inside. Taken from Squeak.
*/
    var dx = 0, dy = 0;

    if (this.right() > aRect.right()) {
        dx = aRect.right() - this.right();
    }
    if (this.bottom() > aRect.bottom()) {
        dy = aRect.bottom() - this.bottom();
    }
    if ((this.left() + dx) < aRect.left()) {
        dx = aRect.left() - this.left();
    }
    if ((this.top() + dy) < aRect.top()) {
        dy = aRect.top() - this.top();
    }
    return new Point(dx, dy);
};

Rectangle.prototype.regionsAround = function (aRect) {
    // answer a list of rectangles surrounding another one,
    // use this to clip "holes"
    var regions = [];
    if (!this.intersects(aRect)) {
        return regions;
    }
    // left
    if (aRect.left() > this.left()) {
        regions.push(
            new Rectangle(
                this.left(),
                this.top(),
                aRect.left(),
                this.bottom()
            )
        );
    }
    // above:
    if (aRect.top() > this.top()) {
        regions.push(
            new Rectangle(
                this.left(),
                this.top(),
                this.right(),
                aRect.top()
            )
        );
    }
    // right:
    if (aRect.right() < this.right()) {
        regions.push(
            new Rectangle(
                aRect.right(),
                this.top(),
                this.right(),
                this.bottom()
            )
        );
    }
    // below:
    if (aRect.bottom() < this.bottom()) {
        regions.push(
            new Rectangle(
                this.left(),
                aRect.bottom(),
                this.right(),
                this.bottom()
            )
        );
    }
    return regions;
};

// Rectangle testing:

Rectangle.prototype.containsPoint = function (aPoint) {
    return this.origin.le(aPoint) && aPoint.lt(this.corner);
};

Rectangle.prototype.containsRectangle = function (aRect) {
    return aRect.origin.gt(this.origin) &&
        aRect.corner.lt(this.corner);
};

Rectangle.prototype.intersects = function (aRect) {
    var ro = aRect.origin, rc = aRect.corner;
    return (rc.x >= this.origin.x) &&
        (rc.y >= this.origin.y) &&
        (ro.x <= this.corner.x) &&
        (ro.y <= this.corner.y);
};

Rectangle.prototype.isNearTo = function (aRect, threshold) {
    var ro = aRect.origin, rc = aRect.corner, border = threshold || 0;
    return (rc.x + border >= this.origin.x) &&
        (rc.y  + border >= this.origin.y) &&
        (ro.x - border <= this.corner.x) &&
        (ro.y - border <= this.corner.y);
};

// Rectangle transforming:

Rectangle.prototype.scaleBy = function (scale) {
    // scale can be either a Point or a scalar
    var o = this.origin.multiplyBy(scale),
        c = this.corner.multiplyBy(scale);
    return new Rectangle(o.x, o.y, c.x, c.y);
};

Rectangle.prototype.translateBy = function (delta) {
    // delta can be either a Point or a number
    var o = this.origin.add(delta),
        c = this.corner.add(delta);
    return new Rectangle(o.x, o.y, c.x, c.y);
};

// Rectangle converting:

Rectangle.prototype.asArray = function () {
    return [this.left(), this.top(), this.right(), this.bottom()];
};

Rectangle.prototype.asArray_xywh = function () {
    return [this.left(), this.top(), this.width(), this.height()];
};

// Nodes ///////////////////////////////////////////////////////////////

// Node instance creation:

function Node(parent, childrenArray) {this.init(parent, childrenArray);};

Node.prototype.init = function (parent, children) {
this.parent = (parent instanceof Node) ? parent : null;
this.children = (children instanceof Array) ? children : [];};

// Node string representation: e.g. 'a Node[3]'

Node.prototype.toString = function () {
    return 'a Node' + '[' + this.children.length.toString() + ']';
};

// Node accessing:

Node.prototype.addChild = function (aNode) {this.children.push(aNode); aNode.parent = this;};

Node.prototype.addChildFirst = function (aNode) {this.children.unshift(aNode); aNode.parent = this;};

Node.prototype.removeChild = function (aNode) {
var idx = this.children.indexOf(aNode); if (
idx > -1) {this.children.splice(idx, 1);};};

// Node functions:

Node.prototype.root = function () {
if (isNil(this.parent)) {return this;
} else {return this.parent.root();};};

Node.prototype.parentThatChecks = function (condition
) {var myself = this; if (isNil(this.parent)) {
return myself;} else if ((condition instanceof Array
) ? condition.map(selected => selected(myself)) : condition(myself)) {
return myself;} else {return myself.parent.parentThatChecks(
condition);};};

Node.prototype.depth = function () {
if (this.parent instanceof Node) {
return this.parent.depth() + 1;
} else {return 0;};};

Node.prototype.allChildren = function () {
    // includes myself
    var result = [this];
    this.children.forEach(child => {
        result = result.concat(child.allChildren());
    });
    return result;
};

Node.prototype.forAllChildren = function (aFunction) {
    if (this.children.length > 0) {
        this.children.forEach(child => child.forAllChildren(aFunction));
    };  aFunction.call(null, this);
};

Node.prototype.anyChild = function (aPredicate) {
    /* includes myself */     var i;
    if (aPredicate.call(null, this)) {
        return true;
    };  for (i = 0; i < this.children.length; i += 1) {
        if (this.children[i].anyChild(aPredicate)) {
            return true;
        };
    };  return false;
};

Node.prototype.allLeafs = function () {
    var result = [];
    this.allChildren().forEach(element => {
        if (element.children.length === 0) {
            result.push(element);
        };
    });     return result;
};

Node.prototype.allParents = function () {
    // includes myself
    var result = [this];
    if (this.parent !== null) {
        result = result.concat(this.parent.allParents());
    };  return result;
};

Node.prototype.siblings = function () {if (isNil(this.parent)) {return [];
} else {return this.parent.children.filter(child => child !== this);};};

Node.prototype.parentThatIsA = function () {
    // including myself
    // Note: you can pass in multiple constructors to test for
    var i;
    for (i = 0; i < arguments.length; i += 1) {
        if (this instanceof arguments[i]) {
            return this;
        };
    };  if (!this.parent) {
        return null;
    };  return this.parentThatIsA.apply(this.parent, arguments);
};

Node.prototype.parentThatIsAnyOf = function (constructors) {
    // deprecated, use parentThatIsA instead
    return this.parentThatIsA.apply(this, constructors);
};

Node.prototype.childThatIsA = function () {
    // including myself
    // Note: you can pass in multiple constructors to test for
    var i, hit;
    for (i = 0; i < arguments.length; i += 1) {
        if (this instanceof arguments[i]) {
            return this;
        };
    };  if (!this.children.length) {
        return null;
    };  for (i = 0; i < this.children.length; i += 1) {
        hit = this.childThatIsA.apply(this.children[i], arguments);
        if (hit) {
            return hit;
        };
    };  return null;
};

// Morphs //////////////////////////////////////////////////////////////

// Morph: referenced constructors

var Morph,
FPSMorph,
HandMorph,
WorldMorph,
FlashMorph,
ShadowMorph,
FrameMorph,
MenuMorph,
HandleMorph,
StringFieldMorph,
ColorPickerMorph,
SliderMorph,
ScrollFrameMorph,
InspectorMorph,
StringMorph,
TextMorph;

// Morph inherits from Node:

Morph.prototype = new Node;
Morph.prototype.constructor = Morph;
Morph.uber = Node.prototype;

// Morph settings:

Morph.prototype.shadowBlur = 4;

// Morph instance creation:

function Morph () {this.init();};

// Morph initialization:

Morph.prototype.init = function () {
    Morph.uber.init.call(this);
    this.isMorph = true; // used to optimize deep copying
    this.cachedImage = null;
    this.isCachingImage = false;
    this.shouldRerender = false;
    this.bounds = new Rectangle(0, 0, 50, 40);
    this.holes = []; // list of "untouchable" regions (rectangles)
    this.color = new Color(80, 80, 80);
    this.texture = null; // optional url of a fill-image
    this.cachedTexture = null; // internal cache of actual bg image
    this.alpha = 1;
    this.isVisible = true;
    this.isDraggable = false;
    this.isTemplate = false;
    this.acceptsDrops = false;
    this.isFreeForm = false;
    this.noDropShadow = false;
    this.fullShadowSource = true;
    this.fps = 0;
    this.customContextMenu = null;
    this.lastTime = Date.now();
    this.onNextStep = null; // optional function to be run once
    this.cursorStyle = null; this.cursorGrabStyle = null;
};

// Morph string representation: e.g. 'a Morph 2 [20@45 | 130@250]'

Morph.prototype.toString = function () {
    return 'a ' +
        (this.constructor.name ||
            this.constructor.toString().split(' ')[1].split('(')[0]) +
        ' ' +
        this.children.length.toString() + ' ' +
        this.bounds;
};

// Morph deleting:

Morph.prototype.destroy = function anonymous (
) {if (!isNil(this.parent)) {this.fullChanged(
); this.parent.removeChild(this);};}; /* :o */

// Morph stepping:

Morph.prototype.stepFrame = function () {
    if (!this.step) {
        return null;
    };  var current, elapsed, leftover, nxt;
    current = Date.now();
    elapsed = current - this.lastTime;
    if (this.fps > 0) {
        leftover = (1000 / this.fps) - elapsed;
    } else {
        leftover = 0;
    };  if (leftover < 1) {
        this.lastTime = current;
        if (this.onNextStep) {
            nxt = this.onNextStep;
            this.onNextStep = null;
            nxt.call(this);
        };  this.step();
        this.children.forEach(child => child.stepFrame());
    };
};

Morph.prototype.nextSteps = function (arrayOfFunctions) {
    var lst = arrayOfFunctions || [],
        nxt = lst.shift();
    if (nxt) {
        this.onNextStep = () => {
            nxt.call(this);
            this.nextSteps(lst);
        };
    };
};

Morph.prototype.step = nop;

// Morph accessing - geometry getting:

Morph.prototype.area = function () {
    return this.bounds.area();
};

Morph.prototype.left = function () {
    return this.bounds.left();
};

Morph.prototype.right = function () {
    return this.bounds.right();
};

Morph.prototype.top = function () {
    return this.bounds.top();
};

Morph.prototype.bottom = function () {
    return this.bounds.bottom();
};

Morph.prototype.center = function () {
    return this.bounds.center();
};

Morph.prototype.bottomCenter = function () {
    return this.bounds.bottomCenter();
};

Morph.prototype.bottomLeft = function () {
    return this.bounds.bottomLeft();
};

Morph.prototype.bottomRight = function () {
    return this.bounds.bottomRight();
};

Morph.prototype.boundingBox = function () {
    return this.bounds;
};

Morph.prototype.corners = function () {
    return this.bounds.corners();
};

Morph.prototype.leftCenter = function () {
    return this.bounds.leftCenter();
};

Morph.prototype.rightCenter = function () {
    return this.bounds.rightCenter();
};

Morph.prototype.topCenter = function () {
    return this.bounds.topCenter();
};

Morph.prototype.topLeft = function () {
    return this.bounds.topLeft();
};

Morph.prototype.topRight = function () {
    return this.bounds.topRight();
};
Morph.prototype.position = function () {
    return this.bounds.origin;
};

Morph.prototype.extent = function () {
    return this.bounds.extent();
};

Morph.prototype.width = function () {
    return this.bounds.width();
};

Morph.prototype.height = function () {
    return this.bounds.height();
};

Morph.prototype.fullBounds = function () {
    var result;
    result = this.bounds;
    this.children.forEach(child => {
        if (child.isVisible) {
            result = result.merge(child.fullBounds());
        }
    });
    return result;
};

Morph.prototype.fullBoundsNoShadow = function () {
    // answer my full bounds but ignore any shadow
    var result;
    result = this.bounds;
    this.children.forEach(child => {
        if (!(child instanceof ShadowMorph) && (child.isVisible)) {
            result = result.merge(child.fullBounds());
        }
    });
    return result;
};

Morph.prototype.visibleBounds = function () {
    // answer which part of me is not clipped by a Frame
    var visible = this.bounds,
        frames = this.allParents().filter(p => p instanceof FrameMorph);
    frames.forEach(f => visible = visible.intersect(f.bounds));
    return visible;
};

// Morph accessing - simple changes:

Morph.prototype.moveBy = function (delta) {
    var children = this.children,
        i = children.length;
    this.changed();
    this.bounds = this.bounds.translateBy(delta);
    this.changed();
    for (i; i > 0; i -= 1) {
        children[i - 1].moveBy(delta);
    }
};

Morph.prototype.setPosition = function (aPoint) {
    var delta = aPoint.subtract(this.topLeft());
    if (!(delta.eq(ZERO))) {
        this.moveBy(delta);
    }
};

Morph.prototype.setLeft = function (x) {
    this.setPosition(
        new Point(
            x,
            this.top()
        )
    );
};

Morph.prototype.setRight = function (x) {
    this.setPosition(
        new Point(
            x - this.width(),
            this.top()
        )
    );
};

Morph.prototype.setTop = function (y) {
    this.setPosition(
        new Point(
            this.left(),
            y
        )
    );
};

Morph.prototype.setBottom = function (y) {
    this.setPosition(
        new Point(
            this.left(),
            y - this.height()
        )
    );
};

Morph.prototype.setCenter = function (aPoint) {
    this.setPosition(
        aPoint.subtract(
            this.extent().divideBy(2)
        )
    );
};

Morph.prototype.setFullCenter = function (aPoint) {
    this.setPosition(
        aPoint.subtract(
            this.fullBounds().extent().divideBy(2)
        )
    );
};

Morph.prototype.keepWithin = function (aMorph) {
    // make sure I am completely within another Morph's bounds
    var leftOff, rightOff, topOff, bottomOff;
    rightOff = this.fullBounds().right() - aMorph.right();
    if (rightOff > 0) {
        this.moveBy(new Point(-rightOff, 0));
    }
    leftOff = this.fullBounds().left() - aMorph.left();
    if (leftOff < 0) {
        this.moveBy(new Point(-leftOff, 0));
    }
    bottomOff = this.fullBounds().bottom() - aMorph.bottom();
    if (bottomOff > 0) {
        this.moveBy(new Point(0, -bottomOff));
    }
    topOff = this.fullBounds().top() - aMorph.top();
    if (topOff < 0) {
        this.moveBy(new Point(0, -topOff));
    }
};

Morph.prototype.scrollIntoView = function () {
    var leftOff, rightOff, topOff, bottomOff,
        sf = this.parentThatIsA(ScrollFrameMorph);
    if (!sf) {return; }
    rightOff = Math.min(
        this.fullBounds().right() - sf.right(),
        sf.contents.right() - sf.right()
    );
    if (rightOff > 0) {
        sf.contents.moveBy(new Point(-rightOff, 0));
    }
    leftOff = this.fullBounds().left() - sf.left();
    if (leftOff < 0) {
        sf.contents.moveBy(new Point(-leftOff, 0));
    }
    topOff = this.fullBounds().top() - sf.top();
    if (topOff < 0) {
        sf.contents.moveBy(new Point(0, -topOff));
    }
    bottomOff = this.fullBounds().bottom() - sf.bottom();
    if (bottomOff > 0) {
        sf.contents.moveBy(new Point(0, -bottomOff));
    }
    sf.adjustScrollBars();
};

// Morph accessing - dimensional changes requiring a complete redraw

Morph.prototype.setExtent = function (aPoint) {
    if (aPoint.eq(this.extent())) {return; }
    this.changed();
    this.bounds.setWidth(aPoint.x);
    this.bounds.setHeight(aPoint.y);
    this.fixLayout();
    this.rerender();
};

Morph.prototype.setWidth = function (width) {
    this.setExtent(new Point(width || 0, this.height()));
};

Morph.prototype.setHeight = function (height) {
    this.setExtent(new Point(this.width(), height || 0));
};

Morph.prototype.setColor = function (aColor) {
    if (aColor) {
        if (!this.color.eq(aColor)) {
            this.color = aColor;
            this.rerender();
        }
    }
};

// Morph rendering:

Morph.prototype.getImage = function () {
    var img;
    if (this.cachedImage && !this.shouldRerender) {
        return this.cachedImage;
    }
    img = newCanvas(this.extent(), false, this.cachedImage);
    if (this.isCachingImage) {
        this.cachedImage = img;
    }
    this.render(img.getContext('2d'));
    this.shouldRerender = false;
    return img;
};

Morph.prototype.render = function (aContext) {
    aContext.fillStyle = this.getRenderColor().toString();
    aContext.fillRect(0, 0, this.width(), this.height());
    if (this.cachedTexture) {
        this.renderCachedTexture(aContext);
    } else if (this.texture) {
        this.renderTexture(this.texture, aContext);
    }
};

Morph.prototype.getRenderColor = function () {
    // can be overriden by my heirs or instances
    return this.color;
};

Morph.prototype.fixLayout = function () {
    // implemented by my heirs
    // determine my extent and arrange my submorphs, if any
    // default is to do nothing
    // NOTE: If you need to set the extent, in order to avoid
    // infinite recursion instead of calling setExtent() (which will
    // in turn call fixLayout() again) directly modify the bounds
    // property, e.g. like this: this.bounds.setExtent()
    return;
};

Morph.prototype.fixHolesLayout = function () {
    // implemented by my heirs
    // arrange my untouchable areas, if any
    // default is to do nothing
    return;
};

// Morph displaying:

Morph.prototype.renderTexture = function (url, ctx) {
    this.cachedTexture = new Image;
    this.cachedTexture.onload = () => this.changed();
    this.cachedTexture.src = this.texture = url;
};

Morph.prototype.renderCachedTexture = function (ctx) {
    var bg = this.cachedTexture, x, y, cols = Math.floor(
    this.width() / bg.width), lines = Math.floor(
    this.height() / bg.height); ctx.save();
    ctx.globalAlpha = this.alpha; ctx.beginPath();
    ctx.rect(0, 0, this.width(), this.height());
    ctx.clip(); for (y = 0; y <= lines; y += 1) {
        for (x = 0; x <= cols; x += 1) {
            ctx.drawImage(bg, (x * bg.width), (y * bg.height));
        };
    }; ctx.restore();
};

Morph.prototype.drawOn = function (ctx, rect) {
    var clipped = rect.intersect(this.bounds),
        pos = this.position(),
        pic, src, w, h, sl, st;

    if (!clipped.extent().gt(ZERO)) {return;};
    ctx.save();
    ctx.globalAlpha = this.alpha;
    if (this.isCachingImage) {
        pic = this.getImage();
        src = clipped.translateBy(pos.neg());
        sl = src.left();
        st = src.top();
        w = Math.min(src.width(), pic.width - sl);
        h = Math.min(src.height(), pic.height - st);
        if (w < 1 || h < 1) {return; }
        ctx.drawImage(
            pic,
            sl,
            st,
            w,
            h,
            clipped.left(),
            clipped.top(),
            w,
            h
        );
    } else { // render directly on target canvas
        ctx.beginPath();
        ctx.rect(clipped.left(), clipped.top(), clipped.width(), clipped.height());
        ctx.clip();
        ctx.translate(pos.x, pos.y);
        this.render(ctx);
        if (MorphicPreferences.showHoles) { // debug hole rendering
            ctx.translate(-pos.x, -pos.y);
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = 'white';
            this.holes.forEach(hole => {
                var sect = hole.translateBy(pos).intersect(clipped);
                ctx.fillRect(
                    sect.left(),
                    sect.top(),
                    sect.width(),
                    sect.height()
                );
            });
        }
    }
    ctx.restore();
};

Morph.prototype.fullDrawOn = function (aContext, aRect) {if (this.isVisible) {this.drawOn(
aContext, aRect); this.children.forEach(child => child.fullDrawOn(aContext, aRect));};};

Morph.prototype.show = function anonymous () {if (!this.isVisible) {this.isVisible = true; this.changed();};};
Morph.prototype.hide = function anonymous () {if (this.isVisible) {this.isVisible = false; this.changed();};};

Morph.prototype.toggleVisibility = function anonymous () {if (this.isVisible) {this.hide();} else {this.show();};};

// Morph full image:

Morph.prototype.fullImage = function anonymous () {var fb = this.fullBounds(), img = newCanvas(fb.extent()),
ctx = img.getContext('2d'); ctx.translate(-fb.origin.x, -fb.origin.y); this.fullDrawOn(ctx, fb); return img;};

// Morph screenshot:

Morph.prototype.screenshot = function anonymous () {var aWorld = (world || this.world()); if (aWorld.currentKey === 16) {var canvas = this.fullImage(
); IDE_Morph.prototype.saveFileAs(canvas.toDataURL(), 'image/png', 'screenshot'); /* You can switch to any screenshot mode with the shift key of your
keyboard. :) */} else {this.nextSteps([(function anonymous () {this.rerender();}), (function anonymous () {var canvas = newCanvas(this.bounds.extent(
)); var ctx = canvas.getContext('2d'); var width = this.bounds.width(); var height = this.bounds.height(); var i = 0; while (i < (width * height)) {
ctx.fillStyle = aWorld.getGlobalPixelColor(new Point(((i % width) + this.bounds.origin.x), (Math.floor(i / width) + this.bounds.origin.y))
).toString(); ctx.fillRect((i % width), Math.floor(i / width), 1, 1); i++;}; IDE_Morph.prototype.saveFileAs(canvas.toDataURL(), 'image/png',
'screenshot');})]);};}; /* The screenshot function is very useful, use it if do you want to take pictures of morphs in dev mode. :) */

// Morph shadow:

Morph.prototype.shadowImage = function (off, color) {
    // for flat design mode
    var fb, img, outline, sha, ctx,
        offset = off || new Point(7, 7),
        clr = color || BLACK;
    if (this.fullShadowSource) {
        fb = this.fullBounds().extent();
        img = this.fullImage();
    } else { // optimization when all submorphs are contained inside
        fb = this.extent();
        img = this.getImage();
    }
    outline = newCanvas(fb);
    ctx = outline.getContext('2d');
    ctx.drawImage(img, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(
        img,
        -offset.x,
        -offset.y
    );
    sha = newCanvas(fb);
    ctx = sha.getContext('2d');
    ctx.drawImage(outline, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = clr.toString();
    ctx.fillRect(0, 0, fb.x, fb.y);
    return sha;
};

Morph.prototype.shadowImageBlurred = function (off, color) {
    var fb, img, sha, ctx,
        offset = off || new Point(7, 7),
        blur = this.shadowBlur,
        clr = color || BLACK;
    if (this.fullShadowSource) {
        fb = this.fullBounds().extent().add(blur * 2);
        img = this.fullImage();
    } else { // optimization when all submorphs are contained inside
        fb = this.extent().add(blur * 2);
        img = this.getImage();
    }
    sha = newCanvas(fb);
    ctx = sha.getContext('2d');
    ctx.shadowOffsetX = offset.x;
    ctx.shadowOffsetY = offset.y;
    ctx.shadowBlur = blur;
    ctx.shadowColor = clr.toString();
    ctx.drawImage(
        img,
        blur - offset.x,
        blur - offset.y
    );
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(
        img,
        blur - offset.x,
        blur - offset.y
    );
    return sha;
};

Morph.prototype.shadow = function (off, a, color) {
    var shadow = new ShadowMorph(),
        offset = off || new Point(7, 7),
        alpha = a || ((a === 0) ? 0 : 0.2),
        fb = this.fullBounds();
    shadow.setExtent(fb.extent().add(this.shadowBlur * 2));
    if (useBlurredShadows && !MorphicPreferences.isFlat) {
        shadow.cachedImage = this.shadowImageBlurred(offset, color);
        shadow.alpha = alpha;
        shadow.setPosition(fb.origin.add(offset).subtract(this.shadowBlur));
    } else {
        shadow.cachedImage = this.shadowImage(offset, color);
        shadow.alpha = alpha;
        shadow.setPosition(fb.origin.add(offset));
    }
    shadow.shouldRerender = false;
    return shadow;
};

Morph.prototype.addShadow = function (off, a, color) {
    var shadow,
        offset = off || new Point(7, 7),
        alpha = a || ((a === 0) ? 0 : 0.2);
    shadow = this.shadow(offset, alpha, color);
    this.addBack(shadow);
    this.fullChanged();
    return shadow;
};

Morph.prototype.getShadow = function () {
    var shadows;
    shadows = this.children.slice(0).reverse().filter(
        child => child instanceof ShadowMorph
    );
    if (shadows.length !== 0) {
        return shadows[0];
    }
    return null;
};

Morph.prototype.removeShadow = function () {
    var shadow = this.getShadow();
    if (shadow !== null) {
        this.fullChanged();
        this.removeChild(shadow);
    }
};

// Morph pen trails:

Morph.prototype.penTrails = function () {
    // answer my pen trails canvas. default is to answer my image
    // NOTE: clients calling this also want to make sure the
    // obtained canvas will be around at the next display cycle,
    // so they might also wish to set the receiver's "isCachingImage"
    // property to "true".
    return this.getImage();
};

// Morph updating:

Morph.prototype.rerender = function () {
    this.shouldRerender = true;
    this.changed();
};

Morph.prototype.changed = function () {
    var w = this.root();
    if (w instanceof WorldMorph) {
        w.broken.push(this.visibleBounds().spread());
    }
    if (this.parent) {
        this.parent.childChanged(this);
    }
};

Morph.prototype.fullChanged = function () {
    var w = this.root();
    if (w instanceof WorldMorph) {
        w.broken.push(
            this.fullBounds().spread()
        );
    }
};

Morph.prototype.childChanged = function () {
    // react to a change in one of my children,
    // default is to just pass this message on upwards
    // override this method for Morphs that need to adjust accordingly
    if (this.parent) {
        this.parent.childChanged(this);
    }
};

// Morph accessing - structure:

Morph.prototype.world = function () {
    var root = this.root();
    if (root instanceof WorldMorph) {
        return root;
    }
    if (root instanceof HandMorph) {
        return root.world;
    }
    return world;
};

Morph.prototype.add = function (aMorph) {
    var owner = aMorph.parent;
    if (owner !== null) {
        owner.removeChild(aMorph);
    }
    this.addChild(aMorph);
};

Morph.prototype.addBack = function (aMorph) {
    var owner = aMorph.parent;
    if (owner !== null) {
        owner.removeChild(aMorph);
    }
    this.addChildFirst(aMorph);
};

Morph.prototype.topMorphAt = function (point) {
    var i, result;
    if (!this.isVisible) {return null; }
    for (i = this.children.length - 1; i >= 0; i -= 1) {
        result = this.children[i].topMorphAt(point);
        if (result) {return result; }
    }
    if (this.bounds.containsPoint(point)) {
        if (this.holes.some(
                any => any.translateBy(this.position()).containsPoint(point))
        ) {
            return null;
        }
        if (this.isFreeForm) {
            if (!this.isTransparentAt(point)) {
                return this;
            }
        } else {
            return this;
        }
    }
    return null;
};

Morph.prototype.topMorphSuchThat = function (predicate) {
    var next;
    if (predicate.call(null, this)) {
        next = detect(
            this.children.slice(0).reverse(),
            predicate
        );
        if (next) {
            return next.topMorphSuchThat(predicate);
        }
        return this;
    }
    return null;
};

Morph.prototype.overlappedMorphs = function () {
    //exclude the World
    var world = this.world(),
        fb = this.fullBounds(),
        allParents = this.allParents(),
        allChildren = this.allChildren(),
        morphs;

    morphs = world.allChildren();
    return morphs.filter(m => {
        return m.isVisible &&
            m !== this &&
            m !== world &&
            !contains(allParents, m) &&
            !contains(allChildren, m) &&
            m.fullBounds().intersects(fb);
    });
};

// Morph pixel access:

Morph.prototype.getPixelColor = function anonymous (aPoint) {try {
var point = aPoint.subtract(this.bounds.origin),
context = this.getImage().getContext('2d'), data;
data = context.getImageData(point.x, point.y, 1, 1).data;
return new Color(data[0], data[1], data[2], (data[3] / 255));
} catch {return new Color(0, 0, 0, 1);};};

Morph.prototype.isTransparentAt = function (aPoint) {
    var point, context, data;
    if (this.bounds.containsPoint(aPoint)) {
        if (this.texture) {
            return false;
        }
        point = aPoint.subtract(this.bounds.origin);
        context = this.getImage().getContext('2d');
        data = context.getImageData(
            Math.floor(point.x),
            Math.floor(point.y),
            1,
            1
        );
        return data.data[3] === 0;
    }
    return false;
};

// Morph duplicating:

Morph.prototype.copy = function () {
    var c = copy(this);
    c.parent = null;
    c.children = [];
    c.bounds = this.bounds.copy();
    return c;
};

Morph.prototype.fullCopy = function () {
    /*
    Produce a copy of me with my entire tree of submorphs. Morphs
    mentioned more than once are all directed to a single new copy.
    Other properties are also *shallow* copied, so you must override
    to deep copy Arrays and (complex) Objects
    */
    var map = new Map(), c;
    c = this.copyRecordingReferences(map);
    c.forAllChildren(m => m.updateReferences(map));
    return c;
};

Morph.prototype.copyRecordingReferences = function (map) {
    /*
    Recursively copy this entire composite morph, recording the
    correspondence between old and new morphs in the given dictionary.
    This dictionary will be used to update intra-composite references
    in the copy. See updateReferences().

    Note: This default implementation copies ONLY morphs. If a morph
    stores morphs in other properties that it wants to copy, then it
    should override this method to do so. The same goes for morphs that
    contain other complex data that should be copied when the morph is
    duplicated.
    */
    var c = this.copy();
    map.set(this, c);
    this.children.forEach(m => c.add(m.copyRecordingReferences(map)));
    return c;
};

Morph.prototype.updateReferences = function (map) {
    /*
    Update intra-morph references within a composite morph that has
    been copied. For example, if a button refers to morph X in the
    orginal composite then the copy of that button in the new composite
    should refer to the copy of X in new composite, not the original X.
    */
    var properties = Object.keys(this),
        l = properties.length,
        property,
        value,
        reference,
        i;
    for (i = 0; i < l; i += 1) {
        property = properties[i];
        value = this[property];
        if (value && value.isMorph) {
            reference = map.get(value);
            if (reference) { this[property] = reference; }
        }
    }
};

// Morph dragging and dropping:

Morph.prototype.rootForGrab = function () {
    if (this instanceof ShadowMorph) {
        return this.parent.rootForGrab();
    }
    if (this.parent instanceof ScrollFrameMorph) {
        return this.parent;
    }
    if (this.parent === null ||
            this.parent instanceof WorldMorph ||
            this.parent instanceof FrameMorph ||
            this.isDraggable === true) {
        return this;
    }
    return this.parent.rootForGrab();
};

Morph.prototype.isCorrectingOutsideDrag = function () {
    // make sure I don't "trail behind" the hand when dragged
    // override for morphs that you want to be dragged outside
    // their full bounds
    return true;
};

Morph.prototype.wantsDropOf = function (aMorph) {
    // default is to answer the general flag - change for my heirs
    if ((aMorph instanceof HandleMorph) ||
            (aMorph instanceof MenuMorph) ||
            (aMorph instanceof InspectorMorph)) {
        return false;
    }
    return this.acceptsDrops;
};

Morph.prototype.pickUp = function (wrrld) {
    var world = wrrld || this.world();
    this.setPosition(
        world.hand.position().subtract(
            this.extent().floorDivideBy(2)
        )
    );
    world.hand.grab(this);
};

Morph.prototype.isPickedUp = function () {
    return this.parentThatIsA(HandMorph) !== null;
};

Morph.prototype.situation = function () {
    // answer a dictionary specifying where I am right now, so
    // I can slide back to it if I'm dropped somewhere else
    if (this.parent) {
        return {
            origin: this.parent,
            position: this.position().subtract(this.parent.position())
        };
    }
    return null;
};

Morph.prototype.slideBackTo = function (
    situation,
    msecs,
    onBeforeDrop,
    onComplete
) {
    var pos = situation.origin.position().add(situation.position);
    this.glideTo(
        pos,
        msecs,
        null, // easing
        () => {
            situation.origin.add(this);
            if (onBeforeDrop) {onBeforeDrop(); }
            if (this.justDropped) {this.justDropped(); }
            if (situation.origin.reactToDropOf) {
                situation.origin.reactToDropOf(this);
            }
            if (onComplete) {onComplete(); }
        }
    );
};

// Morph animating:

Morph.prototype.glideTo = function (endPoint, msecs, easing, onComplete) {
    var world = this.world(),
        horizontal = new Animation(
            x => this.setLeft(x),
            () => this.left(),
            -(this.left() - endPoint.x),
            msecs === 0 ? 0 : msecs || 100,
            easing
        );
    world.animations.push(horizontal);
    world.animations.push(new Animation(
        y => this.setTop(y),
        () => this.top(),
        -(this.top() - endPoint.y),
        msecs === 0 ? 0 : msecs || 100,
        easing,
        () => {
            horizontal.setter(horizontal.destination);
            horizontal.isActive = false;
            onComplete();
        }

    ));
};

Morph.prototype.fadeTo = function (endAlpha, msecs, easing, onComplete) {
    // include all my children, restore all original transparencies
    // on completion, so I can be recovered
    var world = this.world(),
        oldAlpha = this.alpha;
    this.children.forEach(child => child.fadeTo(endAlpha, msecs, easing));
    world.animations.push(new Animation(
        n => {
            this.alpha = n;
            this.changed();
        },
        () => this.alpha,
        endAlpha - this.alpha,
        msecs === 0 ? 0 : msecs || 200,
        easing,
        () => {
            this.alpha = oldAlpha;
            if (onComplete) {onComplete(); }
        }
    ));
};

Morph.prototype.perish = function (msecs, onComplete) {
    this.fadeTo(
        0,
        msecs === 0 ? 0 : msecs || 100,
        null,
        () => {
            this.destroy();
            if (onComplete) {onComplete(); }
        }
    );
};

// Morph utilities:

Morph.prototype.nop = nop;

Morph.prototype.resize = function () {
    this.world().activeHandle = new HandleMorph(this);
};

Morph.prototype.move = function () {
    this.world().activeHandle = new HandleMorph(
        this,
        null,
        null,
        null,
        null,
        'move'
    );
};

Morph.prototype.moveCenter = function () {
    this.world().activeHandle = new HandleMorph(
        this,
        null,
        null,
        null,
        null,
        'moveCenter'
    );
};

Morph.prototype.hint = function (msg) {
    var m, text;
    text = msg;
    if (msg) {
        if (msg.toString) {
            text = msg.toString();
        }
    } else {
        text = 'NULL';
    }
    m = new MenuMorph(this, text);
    m.isDraggable = true;
    m.popUpCenteredAtHand(this.world());
};

Morph.prototype.inform = function (msg) {
    var m, text;
    text = msg;
    if (msg) {
        if (msg.toString) {
            text = msg.toString();
        }
    } else {
        text = 'NULL';
    }
    m = new MenuMorph(this, text);
    m.addItem("Ok");
    m.isDraggable = true;
    m.popUpCenteredAtHand(this.world());
};

Morph.prototype.prompt = function (
    msg,
    callback,
    environment,
    defaultContents,
    width,
    floorNum,
    ceilingNum,
    isRounded,
    action = nop
) {
    var menu, entryField, slider, isNumeric;
    if (ceilingNum) {
        isNumeric = true;
    }
    menu = new MenuMorph(
        callback || null,
        msg || '',
        environment || null
    );
    entryField = new StringFieldMorph(
        defaultContents || '',
        width || 100,
        MorphicPreferences.prompterFontSize,
        MorphicPreferences.prompterFontName,
        false,
        false,
        isNumeric
    );
    menu.items.push(entryField);
    if (ceilingNum || MorphicPreferences.useSliderForInput) {
        slider = new SliderMorph(
            floorNum || 0,
            ceilingNum,
            parseFloat(defaultContents),
            Math.floor((ceilingNum - floorNum) / 4),
            'horizontal'
        );
        slider.alpha = 1;
        slider.color = new Color(225, 225, 225);
        slider.button.color = menu.borderColor;
        slider.button.highlightColor = slider.button.color.copy();
        slider.button.highlightColor.b += 100;
        slider.button.pressColor = slider.button.color.copy();
        slider.button.pressColor.b += 150;
        slider.setHeight(MorphicPreferences.prompterSliderSize);
        if (isRounded) {
            slider.action = (num) => {
                entryField.changed();
                entryField.text.text = Math.round(num).toString();
                entryField.text.fixLayout();
                entryField.text.changed();
                entryField.text.edit();
                action(Math.round(num));
            };
        } else {
            slider.action = (num) => {
                entryField.changed();
                entryField.text.text = num.toString();
                entryField.text.fixLayout();
                entryField.text.changed();
                action(num);
            };
        }
        menu.items.push(slider);
    }

    menu.addLine(2);
    menu.addItem('Ok', () => entryField.string());
    menu.addItem(
        'Cancel',
        () => {
            action(defaultContents);
            return null;
        }
    );
    menu.isDraggable = true;
    menu.popUpAtHand(this.world());
    entryField.text.edit();
};

Morph.prototype.pickColor = function (
    msg,
    callback,
    environment,
    defaultContents
) {
    var menu, colorPicker;
    menu = new MenuMorph(
        callback || null,
        msg || '',
        environment || null
    );
    colorPicker = new ColorPickerMorph(defaultContents);
    menu.items.push(colorPicker);
    menu.addLine(2);
    menu.addItem('Ok', () => colorPicker.getChoice());
    menu.addItem('Cancel', () => null);
    menu.isDraggable = true;
    menu.popUpAtHand(this.world());
};

Morph.prototype.inspect = function (anotherObject) {
    var world = this.world instanceof Function ?
            this.world() : this.root() || this.world,
        inspector,
        inspectee = this;

    if (anotherObject) {
        inspectee = anotherObject;
    };  inspector = new InspectorMorph(inspectee);
    inspector.setPosition(world.hand.position());
    inspector.keepWithin(world);
    world.add(inspector);
    inspector.changed();
};

Morph.prototype.inspectKeyEvent = function (event) {
    this.inform(
        'Key pressed: ' +
            String.fromCharCode(event.charCode) +
            '\n------------------------' +
            '\ncharCode: ' +
            event.charCode.toString() +
            '\nkeyCode: ' +
            event.keyCode.toString() +
            '\nkey: ' +
            event.key.toString() +
            '\nshiftKey: ' +
            event.shiftKey.toString() +
            '\naltKey: ' +
            event.altKey.toString() +
            '\nctrlKey: ' +
            event.ctrlKey.toString() +
            '\ncmdKey: ' +
            event.metaKey.toString()
    );
};

// Morph menus:

Morph.prototype.contextMenu = function () {
    var world;

    if (this.customContextMenu) {
        return this.customContextMenu;
    }; world = ((this.world instanceof Function
    ) ? this.world() : this.world);
    if (world && world.isDevMode) {
        if (this.parent === world) {
            return this.developersMenu();
        }; return this.hierarchyMenu();
    }; return (this.userMenu() || (
    this.parent && this.parent.userMenu(
    )));};

Morph.prototype.hierarchyMenu = function () {
    var parents = this.allParents(),
        world = this.world instanceof Function ? this.world() : this.world,
        menu = new MenuMorph(this, null);

    parents.forEach(each => {
        if (each.developersMenu && (each !== world)) {
            menu.addMenu(
                each.toString().slice(0, 50),
                each.developersMenu()
            );
        }
    });
    return menu;
};

Morph.prototype.developersMenu = function () {
    // 'name' is not an official property of a function, hence:
    var world = this.world instanceof Function ? this.world() : this.world,
        userMenu = this.userMenu() ||
            (this.parent && this.parent.userMenu()),
        menu = new MenuMorph(this, this.constructor.name ||
            this.constructor.toString().split(' ')[1].split('(')[0]);
    if (userMenu) {
        menu.addMenu('user features', userMenu);
        menu.addLine();
    }
    menu.addItem(
        "edit color...",
        () => {this.spawnRGBAEditorDialog(this);},
        'choose another color \nfor this morph'
    );
    menu.addItem(
        "transparency...",
        () => {
            this.prompt(
                menu.title + localize('\nalpha\nvalue:'),
                this.setAlphaScaled,
                this,
                (this.alpha * 100).toString(),
                null,
                1,
                100,
                true
            );
        },
        'set this morph\'s\nalpha value'
    );
    menu.addItem(
        "resize...",
        'resize',
        'show a handle\nwhich can be dragged\nto change this morph\'s' +
            ' extent'
    );
    menu.addLine();
    menu.addItem(
        "duplicate",
        () =>  this.fullCopy().pickUp(this.world()),
        'make a copy\nand pick it up'
    );
    menu.addItem(
        "pick up",
        'pickUp',
        'detach and put \ninto the hand'
    );
    menu.addItem(
        "attach...",
        'attach',
        'stick this morph\nto another one'
    );
    menu.addItem(
        "move...",
        'move',
        'show a handle\nwhich can be dragged\nto move this morph'
    );
    menu.addItem(
        "inspect...",
        'inspect',
        'open a window\non all properties'
    );
    menu.addItem(
        "screenshot...",
        'screenshot',
        'open a new window\nwith a picture of this morph'
    );
    menu.addLine();
    if (this.isDraggable) {
        menu.addItem(
            "lock",
            'toggleIsDraggable',
            'make this morph\nunmovable'
        );
    } else {
        menu.addItem(
            "unlock",
            'toggleIsDraggable',
            'make this morph\nmovable'
        );
    }
    menu.addItem("hide", 'hide');
    menu.addItem("delete", 'destroy');
    if (!(this instanceof WorldMorph)) {
        menu.addLine();
        menu.addItem(
            "World...",
            () => world.contextMenu().popUpAtHand(world),
            'show the\nWorld\'s menu'
        );
    }
    return menu;
};

Morph.prototype.userMenu = function () {return null;};

Morph.prototype.addToDemoMenu = function (aMorphOrMenuArray) {WorldMorph.prototype.customMorphs.push(aMorphOrMenuArray);};

// Morph menu actions

Morph.prototype.setAlphaScaled = function (alpha) {
    // for context menu demo purposes
    var newAlpha, unscaled;
    if (typeof alpha === 'number') {
        unscaled = alpha / 100;
        this.alpha = Math.min(Math.max(unscaled, 0), 1);
    } else {
        newAlpha = parseFloat(alpha);
        if (!isNaN(newAlpha)) {
            unscaled = newAlpha / 100;
            this.alpha = Math.min(Math.max(unscaled, 0), 1);
        }
    }
    this.changed();
};

Morph.prototype.attach = function () {
    var choices = this.overlappedMorphs(),
        menu = new MenuMorph(this, 'choose new parent:');

    choices.forEach(each => {
        menu.addItem(each.toString().slice(0, 50), () => {
            each.add(this);
            this.isDraggable = false;
        });
    });
    if (choices.length > 0) {
        menu.popUpAtHand(this.world());
    }
};

Morph.prototype.toggleIsDraggable = function () {
    // for context menu demo purposes
    this.isDraggable = !this.isDraggable;
};

Morph.prototype.colorSetters = function () {
    // for context menu demo purposes
    return ['color'];
};

Morph.prototype.numericalSetters = function () {
    // for context menu demo purposes
    return [
        'setLeft',
        'setTop',
        'setWidth',
        'setHeight',
        'setAlphaScaled'
    ];
};

// Morph entry field tabbing:

Morph.prototype.allEntryFields = function () {
    return this.allChildren().filter(each => {
        return each.isEditable &&
            (each instanceof StringMorph ||
                each instanceof TextMorph);
    });
};

Morph.prototype.nextEntryField = function (current) {
    var fields = this.allEntryFields(),
        idx = fields.indexOf(current);
    if (idx !== -1) {
        if (fields.length > idx + 1) {
            return fields[idx + 1];
        }
    }
    return fields[0];
};

Morph.prototype.previousEntryField = function (current) {
    var fields = this.allEntryFields(),
        idx = fields.indexOf(current);
    if (idx !== -1) {
        if (idx > 0) {
            return fields[idx - 1];
        }
        return fields[fields.length - 1];
    }
    return fields[0];
};

Morph.prototype.tab = function (editField) {
/*
    the <tab> key was pressed in one of my edit fields.
    invoke my "nextTab()" function if it exists, else
    propagate it up my owner chain.
*/
    if (this.nextTab) {
        this.nextTab(editField);
    } else if (this.parent) {
        this.parent.tab(editField);
    }
};

Morph.prototype.backTab = function (editField) {
/*
    the <back tab> key was pressed in one of my edit fields.
    invoke my "previousTab()" function if it exists, else
    propagate it up my owner chain.
*/
    if (this.previousTab) {
        this.previousTab(editField);
    } else if (this.parent) {
        this.parent.backTab(editField);
    }
};

/*
    the following are examples of what the navigation methods should
    look like. Insert these at the World level for fallback, and at lower
    levels in the Morphic tree (e.g. dialog boxes) for a more fine-grained
    control over the tabbing cycle.

Morph.prototype.nextTab = function (editField) {
    var next = this.nextEntryField(editField);
    editField.clearSelection();
    next.selectAll();
    next.edit();
};

Morph.prototype.previousTab = function (editField) {
    var prev = this.previousEntryField(editField);
    editField.clearSelection();
    prev.selectAll();
    prev.edit();
};

*/

// Morph events:

Morph.prototype.escalateEvent = function (functionName, arg) {
    var handler = this.parent;
    while (!handler[functionName] && handler.parent !== null) {
        handler = handler.parent;
    }
    if (handler[functionName]) {
        handler[functionName](arg);
    }
};

// Morph eval:

Morph.prototype.evaluateString = function (code) {
    var result;

    try {
        result = eval(code);
        this.changed();
    } catch (err) {
        this.inform(err);
    }
    return result;
};

// Morph collision detection:

Morph.prototype.isTouching = function (otherMorph) {
    var data = this.overlappingPixels(otherMorph),
        len, i;

    if (!data) {return false;
    }; len = data[0].length;
    for (i = 3; i < len; i += 4) {
        if (data[0][i] && data[1][i]) {return true; }
    }; return false;
};

Morph.prototype.overlappingPixels = function (otherMorph) {
    var fb = this.fullBounds(),
        otherFb = otherMorph.fullBounds(),
        oRect = fb.intersect(otherFb),
        thisImg, thatImg;

    if (oRect.width() < 1 || oRect.height() < 1) {
        return false;
    }; thisImg = this.fullImage();
    thatImg = otherMorph.fullImage();
    if (thisImg.isRetinaEnabled !== thatImg.isRetinaEnabled) {
        thisImg = normalizeCanvas(thisImg, true);
        thatImg = normalizeCanvas(thatImg, true);
    }; return [
        thisImg.getContext("2d").getImageData(
            oRect.left() - this.left(),
            oRect.top() - this.top(),
            oRect.width(),
            oRect.height()
        ).data,
        thatImg.getContext("2d").getImageData(
            oRect.left() - otherMorph.left(),
            oRect.top() - otherMorph.top(),
            oRect.width(),
            oRect.height()
        ).data
    ];
};

Morph.prototype.spawnRGBAEditorDialog = function anonymous (selectedTarget, optionalColor) {if (selectedTarget
instanceof Morph) {var targetMorph = selectedTarget; if (optionalColor instanceof Color) {var savedColor =
optionalColor;} else {var savedColor = selectedTarget.color;}; var dialog = new DialogBoxMorph;
dialog.labelString = 'Color Editor'; dialog.createLabel(); var editor = new Morph; editor.alpha = 0;
editor.setExtent(new Point(162.5, 100)); var rSlider = new SliderMorph(0, 255, targetMorph.color.r,
0, 'horizontal', new Color(targetMorph.color.r, 0, 0, 1)); rSlider.setExtent(new Point(100, 12.5));
rSlider.action = function anonymous (value) {result.color = new Color(rSlider.value, gSlider.value, bSlider.value,
(aSlider.value / 100)); targetMorph.color = result.color; targetMorph.rerender(); result.fixLayout();
rSlider.color = new Color(rSlider.value, 0, 0, 1); rSlider.fixLayout(); rSlider.parent.children[4].text =
'R: ' + rSlider.value + '\nG: ' + gSlider.value + '\nB: ' + bSlider.value + '\nA: ' + (aSlider.value / 100);
rSlider.parent.children[4].fixLayout(); rSlider.parent.fixLayout(); rSlider.parent.parent.fixLayout();};
var gSlider = new SliderMorph(0, 255, targetMorph.color.g, 0, 'horizontal',
new Color(0, targetMorph.color.g, 0, 1));
gSlider.setExtent(new Point(100, 12.5)); gSlider.action = function anonymous (value) {result.color =
new Color(rSlider.value, gSlider.value, bSlider.value, (aSlider.value / 100)); targetMorph.color =
result.color; targetMorph.rerender(); result.fixLayout(); gSlider.color = new Color(0, gSlider.value,
0, 1); gSlider.fixLayout(); gSlider.parent.children[4].text = 'R: ' + rSlider.value + '\nG: ' + gSlider.value +
'\nB: ' + bSlider.value + '\nA: ' + (aSlider.value / 100); gSlider.parent.children[4].fixLayout();
gSlider.parent.fixLayout(); gSlider.parent.parent.fixLayout();}; var bSlider = new SliderMorph(0, 255,
targetMorph.color.b, 0, 'horizontal', new Color(0, 0, targetMorph.color.b, 1));
bSlider.setExtent(new Point(100, 12.5));
bSlider.action = function anonymous (value) {result.color = new Color(rSlider.value, gSlider.value, bSlider.value,
(aSlider.value / 100)); targetMorph.color = result.color; targetMorph.rerender(); result.fixLayout(); bSlider.color
= new Color(0, 0, bSlider.value, 1); bSlider.fixLayout(); bSlider.parent.children[4].text = 'R: ' + rSlider.value +
'\nG: ' + gSlider.value + '\nB: ' + bSlider.value + '\nA: ' + (aSlider.value / 100);
bSlider.parent.children[4].fixLayout(); bSlider.parent.fixLayout(); bSlider.parent.parent.fixLayout();};
var aSlider = new SliderMorph(0, 100, (targetMorph.color.a * 100), 0, 'horizontal',
new Color((targetMorph.color.a * 255), (targetMorph.color.a * 255), (targetMorph.color.a * 255), 1));
aSlider.setExtent(new Point(100, 12.5)); aSlider.action = function anonymous (value) {result.color = new Color(
rSlider.value, gSlider.value, bSlider.value, (aSlider.value / 100)); result.fixLayout(); targetMorph.color =
result.color; targetMorph.rerender(); aSlider.color = new Color((value * 2.55), (value * 2.55), (value * 2.55), 1);
aSlider.fixLayout(); aSlider.parent.children[4].text = 'R: ' + rSlider.value + '\nG: ' + gSlider.value + '\nB: ' +
bSlider.value + '\nA: ' + (aSlider.value / 100); aSlider.parent.children[4].fixLayout();
aSlider.parent.fixLayout(); aSlider.parent.parent.fixLayout();}; editor.add(rSlider); editor.add(bSlider);
editor.add(gSlider); editor.add(aSlider); gSlider.bounds.origin = new Point(0, 15); gSlider.bounds.corner =
new Point((gSlider.bounds.origin.x + 100), (gSlider.bounds.origin.y + 12.5)); gSlider.fixLayout();
bSlider.bounds.origin = new Point(0, 30); bSlider.bounds.corner =
new Point((bSlider.bounds.origin.x + 100), (bSlider.bounds.origin.y + 12.5)); bSlider.fixLayout();
aSlider.bounds.origin = new Point(0, 45); aSlider.bounds.corner =
new Point((aSlider.bounds.origin.x + 100), (aSlider.bounds.origin.y + 12.5)); aSlider.fixLayout();
var indicators = new TextMorph('', 11.5, null, false, null, null, null, null, (MorphicPreferences.isFlat
? null : new Point(1, 1)), WHITE); indicators.text = 'R: ' + rSlider.value + '\nG: ' + gSlider.value +
'\nB: ' + bSlider.value + '\nA: ' + (aSlider.value / 100); indicators.bounds.origin = new Point(107, 0);
indicators.bounds.corner = new Point((indicators.bounds.origin.x + 100), (indicators.bounds.origin.y + 12.5));
indicators.fixLayout(); editor.add(indicators); var result = new Morph; result.bounds.origin = new Point(0, 62.5);
result.bounds.corner = new Point(100, 100); result.color = new Color(rSlider.value, gSlider.value, bSlider.value,
(aSlider.value / 100)); result.fixLayout(); editor.add(result); var pipetteButton = new PushButtonMorph;
pipetteButton.children.pop(); pipetteButton.add(new SymbolMorph('pipette', 16));
pipetteButton.children[0].bounds.origin = new Point(108.5, 73.5); pipetteButton.children[0].bounds.corner =
new Point((pipetteButton.children[0].bounds.origin.x + 16), (pipetteButton.children[0].bounds.origin.y + 16));
pipetteButton.bounds.origin = new Point(104.5, 70); pipetteButton.bounds.corner = new Point(
(pipetteButton.bounds.origin.x + 24), (pipetteButton.bounds.origin.y + 24)); pipetteButton.action =
function anonymous() {var myself = targetMorph, hand = world.hand, posInDocument = getDocumentPositionOf(
world.worldCanvas), mouseMoveBak = hand.processMouseMove, mouseDownBak = hand.processMouseDown,
mouseUpBak = hand.processMouseUp; hand.processMouseMove = function (event) {var pos = hand.position(),
clr = Morph.prototype.fullImage.call(world).getContext('2d').getImageData(pos.x, pos.y, 1, 1).data;
clr = new Color(clr[0], clr[1], clr[2]); hand.setPosition(new Point(event.pageX - posInDocument.x,
event.pageY - posInDocument.y)); if (!clr.a) {return;}; myself.color = clr; myself.rerender();
result.color = myself.color; rSlider.value = myself.color.r; gSlider.value = myself.color.g;
bSlider.value = myself.color.b; aSlider.value = myself.color.a * 100; rSlider.action(); gSlider.action();
bSlider.action(); aSlider.action(aSlider.value); result.fixLayout(); editor.fixLayout(); dialog.fixLayout();};
hand.processMouseDown = nop; hand.processMouseUp = function () {hand.processMouseMove = mouseMoveBak;
hand.processMouseDown = mouseDownBak; hand.processMouseUp = mouseUpBak;};}; pipetteButton.hint =
'Select any color\nwith your\nmouse\'s movement.\nCheck it out!'; editor.add(pipetteButton);
var settingsButton = new PushButtonMorph; settingsButton.children.pop(); settingsButton.add(
new SymbolMorph('gearBig', 16)); settingsButton.children[0].bounds.origin = new Point(137, 73.5);
settingsButton.children[0].bounds.corner = new Point((settingsButton.children[0].bounds.origin.x + 16),
(settingsButton.children[0].bounds.origin.y + 16)); settingsButton.bounds.origin = new Point(133, 70);
settingsButton.bounds.corner = new Point((settingsButton.bounds.origin.x + 24),
(settingsButton.bounds.origin.y + 24)); settingsButton.hint = 'Change the sliders\nto number inputs.';
settingsButton.action = function anonymous () {(new DialogBoxMorph(targetMorph, (function anonymous (clr) {
targetMorph.color = clr; targetMorph.rerender(); targetMorph.spawnRGBAEditorDialog(targetMorph);
}), this)).promptRGBA("Color Editor", targetMorph.color, world, null, null, targetMorph, savedColor);
dialog.destroy();}; editor.add(settingsButton); dialog.addBody(editor); dialog.addButton((function anonymous () {
targetMorph.color = result.color; targetMorph.rerender(); if (targetMorph.constructor.name === 'ColorSlotMorph'
) {world.children[0].recordUnsavedChanges();}; this.destroy();}), 'OK'); dialog.addButton(
(function anonymous () {targetMorph.color = savedColor; targetMorph.rerender(); this.destroy();}), 'Cancel');
dialog.fixLayout(); dialog.popUp(world);} else {console.error('This must be a Morph, not a ' +
(typeof selectedTarget) + '!');};};

// FlashMorph /////////////////////////////////////////////////////////

// FlashMorph inherits from Morph:

var FlashMorph; FlashMorph.prototype = new Morph;
FlashMorph.prototype.constructor = FlashMorph;
FlashMorph.uber = Morph.prototype;

// FlashMorph instance creation:

function FlashMorph(targetMorph) {this.init(targetMorph);};

FlashMorph.prototype.init = function (targetMorph) {
FlashMorph.uber.init.call(this); this.alpha = 0;
this.color = new Color(255, 255, 255);
this.initialTime = Date.now();
this.terminalTime = this.initialTime + (250 / 1.5);
if (targetMorph instanceof Morph) {
this.target = targetMorph;} else {
this.target = world;};
this.bounds.origin = this.target.bounds.origin;
this.bounds.corner = this.target.bounds.corner;
this.target.add(this);};

FlashMorph.prototype.elapsedTime = function anonymous () {
return (this.terminalTime - Date.now()) / 250;};

FlashMorph.prototype.step = function anonymous () {this.alpha = this.elapsedTime();
this.rerender(); if (this.elapsedTime() < 0) {this.destroy();};};

// ShadowMorph /////////////////////////////////////////////////////////

// ShadowMorph inherits from Morph:

ShadowMorph.prototype = new Morph;
ShadowMorph.prototype.constructor = ShadowMorph;
ShadowMorph.uber = Morph.prototype;

// ShadowMorph instance creation:

function ShadowMorph() {
    this.init();
}

ShadowMorph.prototype.init = function () {
    ShadowMorph.uber.init.call(this);
    this.isCachingImage = true;
};

ShadowMorph.prototype.topMorphAt = function () {
    return null;
};

// HandleMorph ////////////////////////////////////////////////////////

// I am a resize / move handle that can be attached to any Morph

// HandleMorph inherits from Morph:

HandleMorph.prototype = new Morph;
HandleMorph.prototype.constructor = HandleMorph;
HandleMorph.uber = Morph.prototype;

// HandleMorph instance creation:

function HandleMorph(target, minX, minY, insetX, insetY, type) {
    // if insetY is missing, it will be the same as insetX
    this.init(target, minX, minY, insetX, insetY, type);
}

HandleMorph.prototype.init = function (
    target,
    minX,
    minY,
    insetX,
    insetY,
    type
) {
    var size = MorphicPreferences.handleSize;
    this.target = target || null;
    this.minExtent = new Point(minX || 0, minY || 0);
    this.inset = new Point(insetX || 0, insetY || insetX || 0);
    this.type =  type || 'resize'; // also: 'move', 'moveCenter', 'movePivot'
    this.isHighlighted = false;
    HandleMorph.uber.init.call(this);
    this.color = WHITE;
    this.isDraggable = false;
    if (this.type === 'movePivot') {
        size *= 2;
    }; this.setExtent(new Point(size,
    size)); this.fixLayout();
    this.cursorStyle = 'nwse-resize';
};

// HandleMorph drawing:

HandleMorph.prototype.fixLayout = function () {
    if (this.target) {
        if (this.type === 'moveCenter') {
            this.setCenter(this.target.center());
            this.cursorStyle = 'move';
        } else if (this.type === 'movePivot') {
            this.setCenter(this.target.rotationCenter());
            this.cursorStyle = 'move';
        } else {
            this.setPosition(
                this.target.bottomRight().subtract(
                    this.extent().add(this.inset)
                )
            ); this.cursorStyle = 'nwse-resize';
        }; this.target.add(this);
        this.target.changed();
    }
};

HandleMorph.prototype.render = function (ctx) {
    if (this.type === 'movePivot') {
        if (this.isHighlighted) {
            this.renderCrosshairsOn(ctx, 0.5);
        } else {
            this.renderCrosshairsOn(ctx, 0.6);
        }
    } else {
        if (this.isHighlighted) {
            this.renderHandleOn(
                ctx,
                new Color(100, 100, 255),
                WHITE
            );
        } else {
            this.renderHandleOn(
                ctx,
                this.color,
                new Color(100, 100, 100)
            );
        }
    }
};

HandleMorph.prototype.renderCrosshairsOn = function (ctx, fract) {
    var r = this.width() / 2;

    // semi-transparent white background blob
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(
        r,
        r,
        r * 0.9,
        radians(0),
        radians(360),
        false
    );
    ctx.fill();
    
    // solid black ring
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(
        r,
        r,
        r * fract,
        radians(0),
        radians(360),
        false
    );
    ctx.stroke();

    // vertically centered horizontal line
    ctx.moveTo(0, r);
    ctx.lineTo(this.width(), r);
    ctx.stroke();

    // horizontally centered vertical line
    ctx.moveTo(r, 0);
    ctx.lineTo(r, this.height());
    ctx.stroke();
};

HandleMorph.prototype.renderHandleOn = function (
    ctx,
    color,
    shadowColor
) {
    var isSquare = (this.type.indexOf('move') === 0),
        p1 = new Point(0, this.height()), // bottom left
        p2 = new Point(this.width(), 0), // top right
        p11, p22, i;

    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color.toString();

    if (isSquare) {
        p11 = p1.copy();
        p22 = p2.copy();
        for (i = 0; i <= this.height(); i = i + 6) {
            p11.y = p1.y - i;
            p22.y = p2.y - i;

            ctx.beginPath();
            ctx.moveTo(p11.x, p11.y);
            ctx.lineTo(p22.x, p22.y);
            ctx.closePath();
            ctx.stroke();
        }
    }

    p11 = p1.copy();
    p22 = p2.copy();
    for (i = 0; i <= this.width(); i = i + 6) {
        p11.x = p1.x + i;
        p22.x = p2.x + i;

        ctx.beginPath();
        ctx.moveTo(p11.x, p11.y);
        ctx.lineTo(p22.x, p22.y);
        ctx.closePath();
        ctx.stroke();
    }
    ctx.strokeStyle = shadowColor.toString();

    if (isSquare) {
        p11 = p1.copy();
        p22 = p2.copy();
        for (i = -2; i <= this.height(); i = i + 6) {
            p11.y = p1.y - i;
            p22.y = p2.y - i;

            ctx.beginPath();
            ctx.moveTo(p11.x, p11.y);
            ctx.lineTo(p22.x, p22.y);
            ctx.closePath();
            ctx.stroke();
        }
    }

    p11 = p1.copy();
    p22 = p2.copy();
    for (i = 2; i <= this.width(); i = i + 6) {
        p11.x = p1.x + i;
        p22.x = p2.x + i;

        ctx.beginPath();
        ctx.moveTo(p11.x, p11.y);
        ctx.lineTo(p22.x, p22.y);
        ctx.closePath();
        ctx.stroke();
    }
};

// HandleMorph stepping:

HandleMorph.prototype.step = null;

HandleMorph.prototype.mouseDownLeft = function (pos) {
    var world = this.root(),
        offset;

    if (!this.target) {
        return null;
    }
    if (this.type.indexOf('move') === 0) {
        offset = pos.subtract(this.center());
    } else {
        offset = pos.subtract(this.bounds.origin);
    }

    this.step = () => {
        var newPos, newExt;
        if (world.hand.mouseButton) {
            newPos = world.hand.bounds.origin.copy().subtract(offset);
            if (this.type === 'resize') {
                newExt = newPos.add(
                    this.extent().add(this.inset)
                ).subtract(this.target.bounds.origin);
                newExt = newExt.max(this.minExtent);
                this.target.setExtent(newExt);

                this.setPosition(
                    this.target.bottomRight().subtract(
                        this.extent().add(this.inset)
                    )
                );
            } else if (this.type === 'moveCenter') {
                this.target.setCenter(newPos);
            } else if (this.type === 'movePivot') {
                this.target.setPivot(newPos);
                this.setCenter(this.target.rotationCenter());
            } else { // type === 'move'
                this.target.setPosition(
                    newPos.subtract(this.target.extent())
                        .add(this.extent())
                );
            }
        } else {
            this.step = null;
        }
    };

    if (!this.target.step) {
        this.target.step = nop;
    }
};

// HandleMorph dragging and dropping:

HandleMorph.prototype.rootForGrab = function () {
    return this;
};

// HandleMorph events:

HandleMorph.prototype.mouseEnter = function () {
    this.isHighlighted = true;
    this.changed();
};

HandleMorph.prototype.mouseLeave = function () {
    this.isHighlighted = false;
    this.changed();
};

// HandleMorph menu:

HandleMorph.prototype.attach = function () {
    var choices = this.overlappedMorphs(),
        menu = new MenuMorph(this, 'choose target:');

    choices.forEach(each => {
        menu.addItem(each.toString().slice(0, 50), () => {
            this.isDraggable = false;
            this.target = each;
            this.fixLayout();
        });
    });
    if (choices.length > 0) {
        menu.popUpAtHand(this.world());
    }
};

// PenMorph ////////////////////////////////////////////////////////////

// I am a simple LOGO-wise turtle.

// PenMorph: referenced constructors

var PenMorph;

// PenMorph inherits from Morph:

PenMorph.prototype = new Morph();
PenMorph.prototype.constructor = PenMorph;
PenMorph.uber = Morph.prototype;

// PenMorph instance creation:

function PenMorph() {this.init();};

PenMorph.prototype.init = function () {var size = MorphicPreferences.handleSize * 4; this.isWarped = false; this.heading = 0; this.isDown = true; this.size = 1; this.penBounds = null; 
if (this instanceof SpriteMorph) {this.penPoint = 'middle';} else {this.penPoint = 'tip';}; HandleMorph.uber.init.call(this); this.setExtent(new Point(size, size));};

// PenMorph updating - optimized for warping, i.e atomic recursion

PenMorph.prototype.changed = function () {
    if (this.isWarped) {return; }
    PenMorph.uber.changed.call(this);

};

// PenMorph display:

PenMorph.prototype.render = function (ctx, facing) {
if (this.scale > 0) {
    var start, dest, left, right, len,
        direction = (facing || this.heading);

    len = (this.width() / 2);
    start = this.center().subtract(this.bounds.origin);

    if (this.penPoint === 'middle') {
        dest = start.distanceAngle(len * 0.75, direction);
        left = start.distanceAngle(len * (1 / 3), direction + 230);
        right = start.distanceAngle(len * (1 / 3), direction - 230);
    } else {
        dest = start.distanceAngle(len * 0.75, direction - 180);
        left = start.distanceAngle(len, direction + 195);
        right = start.distanceAngle(len, direction - 195);
    };

    // cache penBounds
    this.penBounds = new Rectangle(
        Math.min(start.x, dest.x, left.x, right.x),
        Math.min(start.y, dest.y, left.y, right.y),
        Math.max(start.x, dest.x, left.x, right.x),
        Math.max(start.y, dest.y, left.y, right.y)
    );
    var realSize = ((this.normalExtent instanceof Point) ? ((aPoint) => (aPoint.x + aPoint.y) / 2)(this.extent().divideBy(this.normalExtent)) : 1) / this.scale;

    // draw arrow shape
    ctx.fillStyle = this.color.toString();
    ctx.beginPath();

    ctx.moveTo(start.x, start.y);
    ctx.lineTo(left.x, left.y);
    ctx.lineTo(dest.x, dest.y);
    ctx.lineTo(right.x, right.y);

    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = (2.5 * realSize);
    ctx.stroke();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = realSize;
    ctx.stroke();
    ctx.fill();
};};

// PenMorph access:

PenMorph.prototype.setHeading = function (degrees) {
    this.heading = ((+degrees % 360) + 360) % 360;
    this.fixLayout();
    this.rerender();
};

PenMorph.prototype.numericalSetters = function () {
    // for context menu demo purposes
    return [
        'setLeft',
        'setTop',
        'setWidth',
        'setHeight',
        'setAlphaScaled',
        'setHeading'
    ];
};

// PenMorph menu:

PenMorph.prototype.developersMenu = function () {
    var menu = PenMorph.uber.developersMenu.call(this);
    menu.addLine();
    menu.addItem(
        'set rotation',
        "setRotation",
        'interactively turn this morph\nusing a dial widget'
    );
    return menu;
};

PenMorph.prototype.setRotation = function () {
    var menu, dial,
    	name = this.name || this.constructor.name;
    if (name.length > 10) {
    	name = name.slice(0, 9) + '...';
    }
    menu = new MenuMorph(this, name);
    dial = new DialMorph(this.heading);
    dial.rootForGrab = () => dial;
    dial.target = this;
    dial.action = 'setHeading';
    menu.items.push(dial);
    menu.addLine();
    menu.addItem('(90) right', () => this.setHeading(90));
    menu.addItem('(270) left', () => this.setHeading(270));
    menu.addItem('(0) up', () => this.setHeading(0));
    menu.addItem('(180) down', () => this.setHeading(180));
    menu.isDraggable = true;
    menu.popUpAtHand(this.world());
};

// PenMorph drawing:

PenMorph.prototype.drawLine = function (start, dest) {
    var context = this.parent.penTrails().getContext('2d'),
        from = start.subtract(this.parent.bounds.origin),
        to = dest.subtract(this.parent.bounds.origin);
    if (this.isDown) {
        context.lineWidth = this.size;
        context.strokeStyle = this.color.toString();
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
        if (this.isWarped === false) {
            this.world().broken.push(
                start.rectangle(dest).expandBy(
                    Math.max(this.size / 2, 1)
                ).intersect(this.parent.visibleBounds()).spread()
            );
        }
    }
};

// PenMorph turtle ops:

PenMorph.prototype.turn = function (degrees) {
    this.setHeading(this.heading + parseFloat(degrees));
};

PenMorph.prototype.forward = function (steps) {
    var start = this.center(),
        dest,
        dist = parseFloat(steps);
    if (dist >= 0) {
        dest = this.position().distanceAngle(dist, this.heading);
    } else {
        dest = this.position().distanceAngle(
            Math.abs(dist),
            (this.heading - 180)
        );
    }
    this.setPosition(dest);
    this.drawLine(start, this.center());
};

PenMorph.prototype.up = function () {this.isDown = false;};
PenMorph.prototype.down = function () {this.isDown = true;};
PenMorph.prototype.clear = function () {this.parent.rerender();};

// PenMorph optimization for atomic recursion:

PenMorph.prototype.startWarp = function () {this.isWarped = true;};

PenMorph.prototype.endWarp = function () {this.isWarped = false; this.parent.changed();};

PenMorph.prototype.warp = function (fun) {this.startWarp(); fun.call(this); this.endWarp();};

PenMorph.prototype.warpOp = function anonymous (selector, argsArray) {
this.startWarp(); this[selector].apply(this, argsArray); this.endWarp();};

// PenMorph demo ops:
// try these with WARP eg.: this.warp(function () {tree(12, 120, 20)})

PenMorph.prototype.warpSierpinski = function (length, min) {
    this.warpOp('sierpinski', [length, min]);
};

PenMorph.prototype.sierpinski = function (length, min) {
    var i;
    if (length > min) {
        for (i = 0; i < 3; i += 1) {
            this.sierpinski(length * 0.5, min);
            this.turn(120);
            this.forward(length);
        }
    }
};

PenMorph.prototype.warpTree = function (level, length, angle) {
    this.warpOp('tree', [level, length, angle]);
};

PenMorph.prototype.tree = function (level, length, angle) {
    if (level > 0) {
        this.size = level;
        this.forward(length);
        this.turn(angle);
        this.tree(level - 1, length * 0.75, angle);
        this.turn(angle * -2);
        this.tree(level - 1, length * 0.75, angle);
        this.turn(angle);
        this.forward(-length);
    }
};

// ColorPaletteMorph ///////////////////////////////////////////////////

var ColorPaletteMorph;

// ColorPaletteMorph inherits from Morph:

ColorPaletteMorph.prototype = new Morph;
ColorPaletteMorph.prototype.constructor = ColorPaletteMorph;
ColorPaletteMorph.uber = Morph.prototype;

// ColorPaletteMorph instance creation:

function ColorPaletteMorph(target, sizePoint) {
    this.init(
        (target || null),
        (sizePoint || new Point(80, 50))
    );
}

ColorPaletteMorph.prototype.init = function (target, size) {
    ColorPaletteMorph.uber.init.call(this);
    this.isCachingImage = true;
    this.target = target;
    this.targetSetter = 'color';
    this.setExtent(size);
    this.choice = null;
};

ColorPaletteMorph.prototype.render = function (ctx) {
    var ext = this.extent(),
        x, y, h, l;

    this.choice = BLACK;
    for (x = 0; x <= ext.x; x += 1) {
        h = 360 * x / ext.x;
        for (y = 0; y <= ext.y; y += 1) {
            l = 100 - (y / ext.y * 100);
            ctx.fillStyle = 'hsl(' + h + ',100%,' + l + '%)';
            ctx.fillRect(x, y, 1, 1);
        }
    }
};

ColorPaletteMorph.prototype.mouseMove = function (pos) {
    this.choice = this.getPixelColor(pos);
    this.updateTarget();
};

ColorPaletteMorph.prototype.mouseDownLeft = function (pos) {
    this.choice = this.getPixelColor(pos);
    this.updateTarget();
};

ColorPaletteMorph.prototype.updateTarget = function () {
    if (this.target instanceof Morph && this.choice !== null) {
        if (this.target[this.targetSetter] instanceof Function) {
            this.target[this.targetSetter](this.choice);
        } else {
            this.target[this.targetSetter] = this.choice;
            this.target.rerender();
        }
    }
};

// ColorPaletteMorph menu:

ColorPaletteMorph.prototype.developersMenu = function () {
    var menu = ColorPaletteMorph.uber.developersMenu.call(this);
    menu.addLine();
    menu.addItem(
        'set target',
        "setTarget",
        'choose another morph\nwhose color property\n will be' +
            ' controlled by this one'
    );
    return menu;
};

ColorPaletteMorph.prototype.setTarget = function () {
    var choices = this.overlappedMorphs(),
        menu = new MenuMorph(this, 'choose target:');

    choices.push(this.world());
    choices.forEach(each => {
        menu.addItem(each.toString().slice(0, 50), () => {
            this.target = each;
            this.setTargetSetter();
        });
    });
    if (choices.length === 1) {
        this.target = choices[0];
        this.setTargetSetter();
    } else if (choices.length > 0) {
        menu.popUpAtHand(this.world());
    }
};

ColorPaletteMorph.prototype.setTargetSetter = function () {
    var choices = this.target.colorSetters(),
        menu = new MenuMorph(this, 'choose target property:');

    choices.forEach(each => {
        menu.addItem(each, () => this.targetSetter = each);
    });
    if (choices.length === 1) {
        this.targetSetter = choices[0];
    } else if (choices.length > 0) {
        menu.popUpAtHand(this.world());
    }
};

// GrayPaletteMorph ///////////////////////////////////////////////////

var GrayPaletteMorph;

// GrayPaletteMorph inherits from ColorPaletteMorph:

GrayPaletteMorph.prototype = new ColorPaletteMorph();
GrayPaletteMorph.prototype.constructor = GrayPaletteMorph;
GrayPaletteMorph.uber = ColorPaletteMorph.prototype;

// GrayPaletteMorph instance creation:

function GrayPaletteMorph(target, sizePoint) {
    this.init(
        target || null,
        sizePoint || new Point(80, 10)
    );
}

GrayPaletteMorph.prototype.render = function (ctx) {
    var ext = this.extent(),
        gradient;

    this.choice = BLACK;
    gradient = ctx.createLinearGradient(0, 0, ext.x, ext.y);
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(1, 'white');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ext.x, ext.y);
};

// ColorPickerMorph ///////////////////////////////////////////////////

// ColorPickerMorph inherits from Morph:

ColorPickerMorph.prototype = new Morph;
ColorPickerMorph.prototype.constructor = ColorPickerMorph;
ColorPickerMorph.uber = Morph.prototype;

// ColorPickerMorph instance creation:

function ColorPickerMorph(defaultColor) {
    this.init(defaultColor || WHITE);
}

ColorPickerMorph.prototype.init = function (defaultColor) {
    this.choice = defaultColor;
    ColorPickerMorph.uber.init.call(this);
    this.color = WHITE;
    this.setExtent(new Point(80, 80));
};

ColorPickerMorph.prototype.fixLayout = function () {
    var cpal, gpal, x, y;

    this.children.forEach(child => child.destroy());
    this.children = [];
    this.feedback = new Morph();
    this.feedback.color = this.choice;
    this.feedback.setExtent(new Point(20, 20));
    cpal = new ColorPaletteMorph(
        this.feedback,
        new Point(this.width(), 50)
    );
    gpal = new GrayPaletteMorph(
        this.feedback,
        new Point(this.width(), 5)
    );
    cpal.setPosition(this.bounds.origin);
    this.add(cpal);
    gpal.setPosition(cpal.bottomLeft());
    this.add(gpal);
    x = (gpal.left() +
        Math.floor((gpal.width() - this.feedback.width()) / 2));
    y = gpal.bottom() + Math.floor((this.bottom() -
        gpal.bottom() - this.feedback.height()) / 2);
    this.feedback.setPosition(new Point(x, y));
    this.add(this.feedback);
};

ColorPickerMorph.prototype.getChoice = function () {
    return this.feedback.color;
};

ColorPickerMorph.prototype.rootForGrab = function () {
    return this;
};

// BlinkerMorph ////////////////////////////////////////////////////////

// can be used for text cursors

var BlinkerMorph;

// BlinkerMorph inherits from Morph:

BlinkerMorph.prototype = new Morph;
BlinkerMorph.prototype.constructor = BlinkerMorph;
BlinkerMorph.uber = Morph.prototype;

// BlinkerMorph instance creation:

function BlinkerMorph(rate) {
    this.init(rate);
}

BlinkerMorph.prototype.init = function (rate) {
    BlinkerMorph.uber.init.call(this);
    this.color = BLACK;
    this.fps = 2;
};

// BlinkerMorph stepping:

BlinkerMorph.prototype.step = function () {
    this.toggleVisibility();
};

// CursorMorph /////////////////////////////////////////////////////////

// I am a String/Text editing widget

// CursorMorph: referenced constructors

var CursorMorph;

// CursorMorph inherits from BlinkerMorph:

CursorMorph.prototype = new BlinkerMorph;
CursorMorph.prototype.constructor = CursorMorph;
CursorMorph.uber = BlinkerMorph.prototype;

// CursorMorph preferences settings:

CursorMorph.prototype.viewPadding = 1;

// CursorMorph instance creation:

function CursorMorph(aStringOrTextMorph, aTextarea) {
    this.init(aStringOrTextMorph, aTextarea);
};

CursorMorph.prototype.init = function (aStringOrTextMorph, aTextarea) {
    var ls;

    // additional properties:
    this.keyDownEventUsed = false;
    this.target = aStringOrTextMorph;
    this.originalContents = this.target.text;
    this.originalAlignment = this.target.alignment;
    this.slot = this.target.text.length;
    this.textarea = aTextarea;

    CursorMorph.uber.init.call(this);
    if (aStringOrTextMorph instanceof Morph) {
    this.color = aStringOrTextMorph.color;};

    // override inherited defaults
    ls = fontHeight(this.target.fontSize);
    this.setExtent(new Point(Math.max(Math.floor(ls / 20), 1), ls));
    
    if (this.target instanceof TextMorph &&
            (this.target.alignment !== 'left')) {
        this.target.setAlignmentToLeft();
    }
    this.textarea.value = this.target.text;
    this.textarea.style.fontSize = this.target.fontSize + 'px';
    this.gotoSlot(this.slot);
    this.updateTextAreaPosition();
    this.syncTextareaSelectionWith(this.target);
};

// CursorMorph event handling

 /*
     There are three cases when the textarea gets inputs:

     1. Inputs that represent special shortcuts of Snap!, so we
     don't want the textarea to handle it. These events are captured in
     "keydown" event handler.

     2. inputs that change the content of the textarea, we need to update
     the content of its target morph accordingly. This is handled in
     the "input" event handler.

     3. input that change the textarea without triggering an "input" event,
     e.g. selection change, cursor movements. These are handled in the
     "keyup" event handler.

     Note that some changes in case 2 are not caused by keyboards (for
     example, select a word by clicking in IME window), so there are overlaps
     between case 2 and case 3. but no one can replace the other.
 */

CursorMorph.prototype.processKeyDown = function (event) {
    /* Special shortcuts
        - ctrl-d, ctrl-i and ctrl-p: doit, inspect it and print it
        - tab: goto next text field
        - esc: discard the editing
        - enter / shift+enter: accept the editing
    */
    var keyName = event.key,
        shift = event.shiftKey,
        singleLineText = this.target instanceof StringMorph,
        dest;
 
    if (!isNil(this.target.receiver) && (event.ctrlKey || event.metaKey)) {
        if (keyName === 'd') {
            event.preventDefault();
            this.target.doIt();
            return;
        } else if (keyName === 'i') {
            event.preventDefault();
            this.target.inspectIt();
            return;
        } else if (keyName === 'p') {
            event.preventDefault();
            this.target.showIt();
            return;
        }
    }

    if (keyName === 'Tab' || keyName === 'U+0009') {
        if (shift) {
            this.target.backTab(this.target);
        } else {
            this.target.tab(this.target);
        }
        event.preventDefault();
        this.target.escalateEvent('reactToEdit', this.target);
    } else if (keyName === 'Escape') {
        this.cancel();
    } else if (keyName === "Enter" && (singleLineText || shift)) {
        this.accept();
    } else {
        // catch "up arrow" and "down arrow" keys
        if (keyName === 'ArrowDown') {
            dest = this.target.downFrom(this.slot);
            this.textarea.setSelectionRange(dest, dest);
            // to do: allow holding shift to select
            event.preventDefault();
        }
        if (keyName === 'ArrowUp') {
            dest = this.target.upFrom(this.slot);
            this.textarea.setSelectionRange(dest, dest);
            // to do: allow holding shift to select
            event.preventDefault();
        }
        this.target.escalateEvent('reactToKeystroke', event);
    }
};

CursorMorph.prototype.processKeyUp = function (event) {
    // handle selection change and cursor position change.
    var textarea = this.textarea,
        target = this.target;

    if (textarea.selectionStart === textarea.selectionEnd) {
        target.startMark = null;
        target.endMark = null;
    } else {
        if (textarea.selectionDirection === 'backward') {
            target.startMark = textarea.selectionEnd;
            target.endMark = textarea.selectionStart;
        } else {
            target.startMark = textarea.selectionStart;
            target.endMark = textarea.selectionEnd;
        }
    }
    target.fixLayout();
    target.rerender();
    this.gotoSlot(textarea.selectionEnd);
};

CursorMorph.prototype.processInput = function (event) {
    // handle content change.
    var target = this.target,
        textarea = this.textarea,
        filteredContent,
        caret;

    // filter invalid chars for numeric fields
    function filterText (content) {
        var points = 0,
            hasE = false,
            result = '',
            i, ch, valid;
        for (i = 0; i < content.length; i += 1) {
            ch = content.charAt(i);
            valid = (
                ('0' <= ch && ch <= '9') || // digits
                (ch.toLowerCase() === 'e') || // scientific notation
                ((i === 0 || hasE) && ch === '-')  || // leading '-' or sc. not.
                (ch === '.' && points === 0) // at most '.'
            );
            if (valid) {
                result += ch;
                if (ch === '.') {
                    points += 1;
                }
                if (ch.toLowerCase() === 'e') {
                    hasE = true;
                }
            }
        }
        return result;
    }

    if (target.isNumeric) {
        filteredContent = filterText(textarea.value);
    } else {
        filteredContent = textarea.value;
    }

    if (filteredContent.length < textarea.value.length) {
        textarea.value = filteredContent;
        caret = Math.min(textarea.selectionStart, filteredContent.length);
        textarea.selectionEnd = caret;
        textarea.selectionStart = caret;
    }
    // target morph: copy the content and selection status to the target.
    target.text = filteredContent;

    if (textarea.selectionStart === textarea.selectionEnd) {
        target.startMark = null;
        target.endMark = null;
    } else {
        if (textarea.selectionDirection === 'backward') {
            target.startMark = textarea.selectionEnd;
            target.endMark = textarea.selectionStart;
        } else {
            target.startMark = textarea.selectionStart;
            target.endMark = textarea.selectionEnd;
        }
    }
    target.changed();
    target.fixLayout();
    target.rerender();

    // cursor morph: copy the caret position to cursor morph.
    this.gotoSlot(textarea.selectionStart);

    this.updateTextAreaPosition();

    // the "reactToInput" event gets triggered AFTER "reactToKeystroke"
    this.target.escalateEvent('reactToInput', event);
};

// CursorMorph synching:

CursorMorph.prototype.updateTextAreaPosition = function anonymous () {
var pos = getDocumentPositionOf(this.target.world().worldCanvas),
origin = this.target.bounds.origin.add(new Point(pos.x, pos.y));
function number2px (n) {return Math.ceil(n) + 'px';};
this.textarea.style.top = number2px(origin.y);
this.textarea.style.left = number2px(origin.x);};

CursorMorph.prototype.syncTextareaSelectionWith = function (targetMorph) {
    var start = targetMorph.startMark,
        end = targetMorph.endMark;

    if (start === end) {
        this.textarea.setSelectionRange(this.slot, this.slot, 'none');
    } else if (start < end) {
        this.textarea.setSelectionRange(start, end, 'forward');
    } else {
        this.textarea.setSelectionRange(end, start, 'backward');
    }
    this.textarea.focus();
};

// CursorMorph navigation:

CursorMorph.prototype.gotoSlot = function (slot) {
    var length = this.target.text.length,
        pos = this.target.slotPosition(slot),
        right,
        left;
    this.slot = slot < 0 ? 0 : slot > length ? length : slot;
    if (this.parent && this.target.isScrollable) {
        right = this.parent.right() - this.viewPadding;
        left = this.parent.left() + this.viewPadding;
        if (pos.x > right) {
            this.target.setLeft(this.target.left() + right - pos.x);
            pos.x = right;
        }
        if (pos.x < left) {
            left = Math.min(this.parent.left(), left);
            this.target.setLeft(this.target.left() + left - pos.x);
            pos.x = left;
        }
        if (this.target.right() < right &&
                right - this.target.width() < left) {
            pos.x += right - this.target.right();
            this.target.setRight(right);
        }
    }
    this.show();
    this.setPosition(pos);
    if (this.parent
            && this.parent.parent instanceof ScrollFrameMorph
            && this.target.isScrollable) {
        this.parent.parent.scrollCursorIntoView(this);
    }
};

CursorMorph.prototype.gotoPos = function (aPoint) {
    this.gotoSlot(this.target.slotAt(aPoint));
    this.show();
};

// CursorMorph selecting:

CursorMorph.prototype.updateSelection = function (shift) {
    if (shift) {
        if (isNil(this.target.endMark) && isNil(this.target.startMark)) {
            this.target.startMark = this.slot;
            this.target.endMark = this.slot;
        } else if (this.target.endMark !== this.slot) {
            this.target.endMark = this.slot;
            this.target.changed();
        }
    } else {
        this.target.clearSelection();
    }
};

// CursorMorph editing:

CursorMorph.prototype.accept = function () {
    var world = this.root();
    if (world) {
        world.stopEditing();
    };
    this.escalateEvent('accept', this);
};

CursorMorph.prototype.cancel = function () {
    var world = this.root();
    this.undo();
    if (world) {
        world.stopEditing();
    };
    this.escalateEvent('cancel', this);
};

CursorMorph.prototype.undo = function () {
    this.target.text = this.originalContents;
    this.target.changed();
    this.target.fixLayout();
    this.target.changed();
    this.gotoSlot(0);
};

// CursorMorph destroying:

CursorMorph.prototype.destroy = function () {
    if (this.target.alignment !== this.originalAlignment) {
        this.target.alignment = this.originalAlignment;
        this.target.changed();
    }
    CursorMorph.uber.destroy.call(this);
    this.target.world().resetKeyboardHandler();
};

// BoxMorph ////////////////////////////////////////////////////////////

// I can have an optionally rounded border

var BoxMorph;

// BoxMorph inherits from Morph:

BoxMorph.prototype = new Morph;
BoxMorph.prototype.constructor = BoxMorph;
BoxMorph.uber = Morph.prototype;

// BoxMorph instance creation:

function BoxMorph(edge, border, borderColor) {
    this.init(edge, border, borderColor);
}

BoxMorph.prototype.init = function (edge, border, borderColor) {
    this.edge = edge || 4;
    this.border = border || ((border === 0) ? 0 : 2);
    this.borderColor = borderColor || BLACK;
    BoxMorph.uber.init.call(this);
};

// BoxMorph drawing:

BoxMorph.prototype.render = function (ctx) {
    if ((this.edge === 0) && (this.border === 0)) {
        BoxMorph.uber.render.call(this, ctx);
        return;
    }; ctx.fillStyle = this.color.toString();
    ctx.beginPath();
    this.outlinePath(
        ctx,
        Math.max(this.edge - this.border, 0),
        this.border
    ); ctx.closePath(); ctx.fill();
    if (this.border > 0) {
        ctx.lineWidth = this.border;
        ctx.strokeStyle = this.borderColor.toString();
        ctx.beginPath();
        this.outlinePath(ctx, this.edge, this.border / 2);
        ctx.closePath();
        ctx.stroke();
    };
};

BoxMorph.prototype.outlinePath = function (ctx, corner, inset) {
    var w = this.width(),
        h = this.height(),
        radius = Math.max(Math.min(corner, (Math.min(w, h) - inset) / 2), 0),
        offset = radius + inset;

    // top left:
    ctx.arc(
        offset,
        offset,
        radius,
        radians(-180),
        radians(-90),
        false
    );
    // top right:
    ctx.arc(
        w - offset,
        offset,
        radius,
        radians(-90),
        radians(-0),
        false
    );
    // bottom right:
    ctx.arc(
        w - offset,
        h - offset,
        radius,
        radians(0),
        radians(90),
        false
    );
    // bottom left:
    ctx.arc(
        offset,
        h - offset,
        radius,
        radians(90),
        radians(180),
        false
    );
};

// BoxMorph menus:

BoxMorph.prototype.developersMenu = function () {
    var menu = BoxMorph.uber.developersMenu.call(this);
    menu.addLine();
    menu.addItem(
        "border width...",
        () => {
            this.prompt(
                menu.title + '\nborder\nwidth:',
                this.setBorderWidth,
                this,
                this.border.toString(),
                null,
                0,
                100,
                true
            );
        },
        'set the border\'s\nline size'
    );
    menu.addItem(
        "border color...",
        () => {
            this.pickColor(
                menu.title + '\nborder color:',
                this.setBorderColor,
                this,
                this.borderColor
            );
        },
        'set the border\'s\nline color'
    );
    menu.addItem(
        "corner size...",
        () => {
            this.prompt(
                menu.title + '\ncorner\nsize:',
                this.setCornerSize,
                this,
                this.edge.toString(),
                null,
                0,
                100,
                true
            );
        },
        'set the corner\'s\nradius'
    );
    return menu;
};

BoxMorph.prototype.setBorderWidth = function (size) {
    // for context menu demo purposes
    var newSize;
    if (typeof size === 'number') {
        this.border = Math.max(size, 0);
    } else {
        newSize = parseFloat(size);
        if (!isNaN(newSize)) {
            this.border = Math.max(newSize, 0);
        }
    }
    this.changed();
};

BoxMorph.prototype.setBorderColor = function (color) {
    // for context menu demo purposes
    if (color) {
        this.borderColor = color;
        this.changed();
    }
};

BoxMorph.prototype.setCornerSize = function (size) {
    // for context menu demo purposes
    var newSize;
    if (typeof size === 'number') {
        this.edge = Math.max(size, 0);
    } else {
        newSize = parseFloat(size);
        if (!isNaN(newSize)) {
            this.edge = Math.max(newSize, 0);
        }
    }
    this.changed();
};

BoxMorph.prototype.colorSetters = function () {
    // for context menu demo purposes
    return ['color', 'borderColor'];
};

BoxMorph.prototype.numericalSetters = function () {
    // for context menu demo purposes
    var list = BoxMorph.uber.numericalSetters.call(this);
    list.push('setBorderWidth', 'setCornerSize');
    return list;
};

// SpeechBubbleMorph ///////////////////////////////////////////////////

/*
    I am a comic-style speech bubble that can display either a string,
    a Morph, a Canvas or a toString() representation of anything else.
    If I am invoked using popUp() I behave like a tool tip.
*/

// SpeechBubbleMorph: referenced constructors

var SpeechBubbleMorph;

// SpeechBubbleMorph inherits from BoxMorph:

SpeechBubbleMorph.prototype = new BoxMorph;
SpeechBubbleMorph.prototype.constructor = SpeechBubbleMorph;
SpeechBubbleMorph.uber = BoxMorph.prototype;

// SpeechBubbleMorph instance creation:

function SpeechBubbleMorph(
    contents,
    color,
    edge,
    border,
    borderColor,
    padding,
    isThought,
    noShadow,
    isShouted
) {
    this.init(
        contents,
        color,
        edge,
        border,
        borderColor,
        padding,
        isThought,
        noShadow,
        isShouted
    );
}

SpeechBubbleMorph.prototype.init = function (
    contents,
    color,
    edge,
    border,
    borderColor,
    padding,
    isThought, // bool or anything but "true" to draw no hook at all
    noShadow, // explicit TRUE to suppress
    isShouted // bool or anything but "true" to draw jags on the bubble
) {
    this.isPointingRight = true; // orientation of text
    this.contents = contents || '';
    this.padding = padding || 0; // additional vertical pixels
    this.isThought = isThought || false; // draw "think" bubble
    this.isClickable = false;
    SpeechBubbleMorph.uber.init.call(
        this,
        edge || 6,
        border || ((border === 0) ? 0 : 1),
        borderColor || new Color(140, 140, 140)
    );
    this.hasShadow = noShadow !== true;
    this.noDropShadow = true;
    this.fullShadowSource = false;
    this.color = color || new Color(230, 230, 230);
    this.fixLayout();
};

// SpeechBubbleMorph invoking:

SpeechBubbleMorph.prototype.popUp = function (world, pos, isClickable) {
    this.fixLayout();
    this.setPosition(pos.subtract(new Point(0, this.height())));
    this.keepWithin(world);
    world.add(this);
    this.fullChanged();
    world.hand.destroyTemporaries();
    world.hand.temporaries.push(this);

    if (!isClickable) {
        this.mouseEnter = this.destroy;
    } else {
        this.isClickable = true;
    }
};

// SpeechBubbleMorph drawing:

SpeechBubbleMorph.prototype.fixLayout = function () {
    // determine my extent and arrange my contents

    if (this.contentsMorph) {
        this.contentsMorph.destroy();
    };
    if (this.contents instanceof Morph) {
        this.contentsMorph = this.contents;
    } else if (this.contents instanceof Context) {
        this.contentsMorph = new Morph;
        this.contentsMorph.add(this.contents.visual());
        this.contentsMorph.children[0].bounds.origin = new Point(3.125, 6.25);
        this.contentsMorph.children[0].bounds.corner = new Point(
        (this.contentsMorph.children[0].bounds.origin.x +
        this.contentsMorph.children[0].bounds.corner.x),
        (this.contentsMorph.children[0].bounds.origin.y +
        this.contentsMorph.children[0].bounds.corner.y));
        this.contentsMorph.children[0].children.forEach(child => child.fixLayout());
        this.contentsMorph.color = new Color(0, 0, 0, 0);
        this.contentsMorph.bounds.corner = new Point(
        (this.contentsMorph.children[0].bounds.origin.x +
        this.contentsMorph.children[0].bounds.corner.x + 0.015625),
        (this.contentsMorph.children[0].bounds.origin.y +
        this.contentsMorph.children[0].bounds.corner.y + 0.03125));
    } else if (isString(this.contents)) {
        this.contentsMorph = new TextMorph(
            this.contents,
            MorphicPreferences.bubbleHelpFontSize,
            null,
            false,
            true,
            'center'
        );
    } else if (this.contents instanceof HTMLCanvasElement) {
        this.contentsMorph = new Morph();
        this.contentsMorph.setExtent(new Point(
            this.contents.width,
            this.contents.height
        ));
        this.contentsMorph.cachedImage = this.contents;
    } else {
        this.contentsMorph = new TextMorph(
            this.contents.toString(),
            MorphicPreferences.bubbleHelpFontSize,
            null,
            false,
            true,
            'center'
        );
    }
    this.add(this.contentsMorph);

    // adjust my layout
    this.bounds.setExtent(
        new Point(
            this.contentsMorph.width() +
                (this.padding ? this.padding * 2 : this.edge * 2),
            this.contentsMorph.height() +
                this.edge +
                this.border * 2 +
                this.padding * 2 +
                2
        )
    );

    // position my contents
    this.contentsMorph.setPosition(this.position().add(
        new Point(
            this.padding || this.edge,
            this.border + this.padding + 1
        )
    ));

    // refresh a shallow shadow
    if (this.hasShadow) {
        this.removeShadow();
        this.addShadow(new Point(2, 2), 80);
    }
};

SpeechBubbleMorph.prototype.outlinePath = function (ctx, radius, inset) {
    var offset = radius + inset,
        w = this.width(),
        h = this.height(),
        rad;

    function circle(x, y, r) {
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, radians(0), radians(360));
    };

    if (asABool(this.isShouted)) {
    var jags,
        delta,
        pos = this.position(),
        y = 0,
        i;

    ctx.moveTo(inset, inset);
    ctx.lineTo(w - inset, inset);

    h = this.height() - y - inset;
    jags = Math.round(h / 10);
    delta = h / jags;

    for (i = 0; i < (jags - 1); i += 1) {
        y += delta / 2;
        ctx.lineTo(w - 5 - inset, y);
        y += delta / 2;
        ctx.lineTo(w - inset, y);
    };

    ctx.moveTo(inset, inset);
    y = 0;
    for (i = 0; i < (jags - 1); i += 1) {
        y += delta / 2;
        ctx.lineTo(5 + inset, y);
        y += delta / 2;
        ctx.lineTo(inset, y);
    };
    } else {
    // top left:
    ctx.arc(
        offset,
        offset,
        radius,
        radians(-180),
        radians(-90),
        false
    );
    // top right:
    ctx.arc(
        w - offset,
        offset,
        radius,
        radians(-90),
        radians(-0),
        false
    );
    // bottom right:
    ctx.arc(
        w - offset,
        h - offset - radius,
        radius,
        radians(0),
        radians(90),
        false
    );};
    if (!asABool(this.isThought)) { // draw speech bubble hook
        if (this.isPointingRight) {
            ctx.lineTo(
                offset + radius,
                h - offset
            );
            ctx.lineTo(
                radius / 2 + inset,
                h - inset
            );
        } else { // pointing left
            ctx.lineTo(
                w - (radius / 2 + inset),
                h - inset
            );
            ctx.lineTo(
                w - (offset + radius),
                h - offset
            );
        };
    };
    if (asABool(this.isShouted)) {
    ctx.lineTo(this.isPointingRight ? (w - (
    offset + radius)) : (radius / 2 + inset),
    h - offset); ctx.lineTo(w, h - offset);
    } else {
    // bottom left:
    ctx.arc(
        offset,
        h - offset - radius,
        radius,
        radians(90),
        radians(180),
        false
    );};
    if (asABool(this.isThought)) { // use anything but "true" to draw nothing
        // close large bubble:
        ctx.lineTo(
            inset,
            offset
        );
        // draw thought bubbles:
        if (this.isPointingRight) {
            // tip bubble:
            rad = radius / 4;
            circle(
                rad + inset,
                h - rad - inset,
                rad
            );
            // middle bubble:
            rad = radius / 3.2;
            circle(
                (rad * 2) + inset,
                h - rad - (inset * 2),
                rad
            );
            // top bubble:
            rad = radius / 2.8;
            circle(
                (rad * 3) + inset * 2,
                h - rad - (inset * 4),
                rad
            );
        } else { // pointing left
            // tip bubble:
            rad = radius / 4;
            circle(
                w - (rad + inset),
                h - rad - inset,
                rad
            );
            // middle bubble:
            rad = radius / 3.2;
            circle(
                w - (rad * 2 + inset),
                h - rad - inset * 2,
                rad
            );
            // top bubble:
            rad = radius / 2.8;
            circle(
                w - (rad * 3 + inset * 2),
                h - rad - inset * 4,
                rad
            );
        }
    }
};

// SpeechBubbleMorph shadow

/*
    only take the 'plain' image, so the box rounding and the
    shadow doesn't become conflicted by embedded scrolling panes
*/

SpeechBubbleMorph.prototype.shadowImage = function (off, color) {
    // for "flat" design mode
    var fb, img, outline, sha, ctx,
        offset = off || new Point(7, 7),
        clr = color || BLACK;
    fb = this.extent();
    img = this.getImage();
    outline = newCanvas(fb);
    ctx = outline.getContext('2d');
    ctx.drawImage(img, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(
        img,
        -offset.x,
        -offset.y
    );
    sha = newCanvas(fb);
    ctx = sha.getContext('2d');
    ctx.drawImage(outline, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = clr.toString();
    ctx.fillRect(0, 0, fb.x, fb.y);
    return sha;
};

SpeechBubbleMorph.prototype.shadowImageBlurred = function (off, color) {
    var fb, img, sha, ctx,
        offset = off || new Point(7, 7),
        blur = this.shadowBlur,
        clr = color || BLACK;
    fb = this.extent().add(blur * 2);
    img = this.getImage();
    sha = newCanvas(fb);
    ctx = sha.getContext('2d');
    ctx.shadowOffsetX = offset.x;
    ctx.shadowOffsetY = offset.y;
    ctx.shadowBlur = blur;
    ctx.shadowColor = clr.toString();
    ctx.drawImage(
        img,
        blur - offset.x,
        blur - offset.y
    );
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(
        img,
        blur - offset.x,
        blur - offset.y
    );
    return sha;
};

// DialMorph //////////////////////////////////////////////////////

// I am a knob than can be turned to select a number.

var DialMorph;

// DialMorph inherits from Morph:

DialMorph.prototype = new Morph;
DialMorph.prototype.constructor = DialMorph;
DialMorph.uber = Morph.prototype;

function DialMorph(value, radius, scale) {this.init(value, radius, scale);};

DialMorph.prototype.init = function (value, radius, scale) {this.target = null; this.action = null;
this.scale = asANum(scale); this.value = Process.prototype.reportBasicModulus(value, 360);
this.fillColor = null; DialMorph.uber.init.call(this); this.color = new Color(
230, 230, 230); this.radius = (radius || MorphicPreferences.menuFontSize * 4);
this.setExtent(new Point(this.radius * 2, this.radius * 2));};

// DialMorph stepping:

DialMorph.prototype.step = null;

DialMorph.prototype.mouseDownLeft = function (pos
) {this.step = () => {if (world.hand.mouseButton) {
this.setValue(this.getValueOf(world.hand.bounds.origin),
(world.currentKey !== 16));} else {this.step = null;};};};

DialMorph.prototype.setValue = function (value, snapToTick) {
this.value = Process.prototype.reportBasicModulus((Math.round(
value / ((snapToTick * 14) + 1)) * (
(snapToTick * 14) + 1)), 360); this.changed(); this.updateTarget();};

DialMorph.prototype.getValueOf = function (
point) {var center = this.center(), deltaX = (
point.x - center.x), deltaY = (center.y - point.y
); return degrees(Math.atan2(deltaX, deltaY));};

DialMorph.prototype.setExtent = function anonymous (aPoint
) {var size = Math.min(aPoint.x, aPoint.y); this.radius = (
size / 2); DialMorph.uber.setExtent.call(this, new Point(
size, size));}; DialMorph.prototype.render = function (ctx
) {var i, angle, x1, y1, x2, y2, light = this.color.lighter(
).toString(), face = this.radius * 0.75, inner = face * 0.85,
outer = face * 0.95;

    // draw a light border:
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(
        this.radius,
        this.radius,
        face + Math.min(1, this.radius - face),
        0,
        2 * Math.PI,
        false
    );
    ctx.closePath();
    ctx.fill();

    // fill circle:
    ctx.fillStyle = this.color.toString();
    ctx.beginPath();
    ctx.arc(
        this.radius,
        this.radius,
        face,
        0,
        2 * Math.PI,
        false
    );
    ctx.closePath();
    ctx.fill();

    // fill value
    angle = this.value * (Math.PI * 2) / 360 - Math.PI / 2;
    ctx.fillStyle = (this.fillColor || this.color.darker()).toString();
    ctx.beginPath();
    ctx.arc(
        this.radius,
        this.radius,
        face,
        Math.PI / -2,
        angle,
        false
    );
    ctx.lineTo(this.radius, this.radius);
    ctx.closePath();
    ctx.fill();

    // draw ticks:
    ctx.strokeStyle = new Color(35, 35, 35).toString();
    ctx.lineWidth = this.scale;
    for (i = 0; i < 24; i += 1) {
        angle = (i - 3) * (Math.PI * 2) / 24 - Math.PI / 2;
        ctx.beginPath();
        x1 = this.radius + Math.cos(angle) * inner;
        y1 = this.radius + Math.sin(angle) * inner;
        x2 = this.radius + Math.cos(angle) * outer;
        y2 = this.radius + Math.sin(angle) * outer;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    // draw a filled center:
    inner = face / 20;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(
        this.radius,
        this.radius,
        inner,
        0,
        2 * Math.PI,
        false
    );
    ctx.closePath();
    ctx.fill();

    // draw the outer hand:
    angle = this.value * (Math.PI * 2) / 360 - Math.PI / 2;
    x1 = this.radius + Math.cos(angle) * face;
    y1 = this.radius + Math.sin(angle) * face;
    x2 = this.radius + Math.cos(angle) * (this.radius - 1);
    y2 = this.radius + Math.sin(angle) * (this.radius - 1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = this.scale * 3;
    ctx.strokeStyle = light;
    ctx.stroke();

    // draw arrow tip:
    angle = radians(degrees(angle) - 4);
    x1 = this.radius + Math.cos(angle) * this.radius * 0.9;
    y1 = this.radius + Math.sin(angle) * this.radius * 0.9;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    angle = radians(degrees(angle) + 8);
    x1 = this.radius + Math.cos(angle) * this.radius * 0.9;
    y1 = this.radius + Math.sin(angle) * this.radius * 0.9;
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.lineWidth = this.scale * 3;
    ctx.strokeStyle = light;
    ctx.stroke();
    ctx.lineWidth = this.scale;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fill();

    // draw the outer hand:
    angle = radians(degrees(angle) - 4);
    x1 = this.radius + Math.cos(angle) * face;
    y1 = this.radius + Math.sin(angle) * face;
    x2 = this.radius + Math.cos(angle) * (this.radius - 1);
    y2 = this.radius + Math.sin(angle) * (this.radius - 1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = this.scale;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // draw the inner hand:
    ctx.strokeStyle = 'black';
    ctx.lineWidth = this.scale;
    angle = this.value * (Math.PI * 2) / 360 - Math.PI / 2;
    outer = face * 0.8;
    x1 = this.radius + Math.cos(angle) * inner;
    y1 = this.radius + Math.sin(angle) * inner;
    x2 = this.radius + Math.cos(angle) * outer;
    y2 = this.radius + Math.sin(angle) * outer;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // draw a read-out circle:
    inner = inner * 2;
    x2 = this.radius + Math.cos(angle) * (outer + inner);
    y2 = this.radius + Math.sin(angle) * (outer + inner);
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(
        x2,
        y2,
        inner,
        0,
        2 * Math.PI,
        false
    );
    ctx.closePath();
    ctx.stroke();
};

// DialMorph menu:

DialMorph.prototype.developersMenu = function () {
    var menu = DialMorph.uber.developersMenu.call(this);
    menu.addLine();
    menu.addItem(
        'set target',
        "setTarget",
        'select another morph\nwhose numerical property\nwill be ' +
            'controlled by this one'
    );
    return menu;
};

DialMorph.prototype.setTarget = function () {
    var choices = this.overlappedMorphs(),
        menu = new MenuMorph(this, 'choose target:');

    choices.push(this.world());
    choices.forEach(each => {
        menu.addItem(each.toString().slice(0, 50), () => {
            this.target = each;
            this.setTargetSetter();
        });
    });
    if (choices.length === 1) {
        this.target = choices[0];
        this.setTargetSetter();
    } else if (choices.length > 0) {
        menu.popUpAtHand(this.world());
    }
};

DialMorph.prototype.setTargetSetter = function () {
    var choices = this.target.numericalSetters(),
        menu = new MenuMorph(this, 'choose target property:');

    choices.forEach(each => {
        menu.addItem(each, () => this.action = each);
    });
    if (choices.length === 1) {
        this.action = choices[0];
    } else if (choices.length > 0) {
        menu.popUpAtHand(this.world());
    }
};

DialMorph.prototype.updateTarget = function () {
    if (this.action) {
        if (typeof this.action === 'function') {
            this.action.call(this.target, this.value);
        } else { // assume it's a String
            this.target[this.action](this.value);
        }
    }
};

// CircleBoxMorph //////////////////////////////////////////////////////

// I can be used for sliders

var CircleBoxMorph;

// CircleBoxMorph inherits from Morph:

CircleBoxMorph.prototype = new Morph;
CircleBoxMorph.prototype.constructor = CircleBoxMorph;
CircleBoxMorph.uber = Morph.prototype;

function CircleBoxMorph(orientation) {
    this.init(orientation || 'vertical');
}

CircleBoxMorph.prototype.init = function (orientation) {
    CircleBoxMorph.uber.init.call(this);
    this.orientation = orientation;
    this.autoOrient = true;
    this.setExtent(new Point(20, 100));
};

CircleBoxMorph.prototype.autoOrientation = function () {
    if (this.height() > this.width()) {
        this.orientation = 'vertical';
    } else {
        this.orientation = 'horizontal';
    }
};

CircleBoxMorph.prototype.render = function (ctx) {
    var w = this.width(),
        h = this.height(),
        radius;

    if (this.autoOrient) {
        this.autoOrientation();
    }

    if (this.orientation === 'vertical') {
        radius = w / 2;
        ctx.beginPath();

        // top semi-circle
        ctx.arc(
            radius,
            radius,
            radius,
            radians(180),
            radians(0),
            false
        );

        // right line
        ctx.lineTo(
            w,
            h - radius
        );

        // bottom semi-circle
        ctx.arc(
            radius,
            h - radius,
            radius,
            radians(0),
            radians(180),
            false
        );

    } else {
        radius = h / 2;
        ctx.beginPath();

        // left semi-circle
        ctx.arc(
            radius,
            radius,
            radius,
            radians(90),
            radians(-90),
            false
        );

        // top line
        ctx.lineTo(
            w - radius,
            0
        );

        // right semi-circle
        ctx.arc(
            w - radius,
            radius,
            radius,
            radians(-90),
            radians(90),
            false
        );
    }
    ctx.closePath();
    ctx.fillStyle = this.color.toString();
    ctx.fill();
};

// CircleBoxMorph menu:

CircleBoxMorph.prototype.developersMenu = function () {
    var menu = CircleBoxMorph.uber.developersMenu.call(this);
    menu.addLine();
    if (this.orientation === 'vertical') {
        menu.addItem(
            "horizontal...",
            'toggleOrientation',
            'toggle the\norientation'
        );
    } else {
        menu.addItem(
            "vertical...",
            'toggleOrientation',
            'toggle the\norientation'
        );
    }
    return menu;
};

CircleBoxMorph.prototype.toggleOrientation = function () {
    var center = this.center();
    this.changed();
    if (this.orientation === 'vertical') {
        this.orientation = 'horizontal';
    } else {
        this.orientation = 'vertical';
    }
    this.setExtent(new Point(this.height(), this.width()));
    this.setCenter(center);
};

// SliderButtonMorph ///////////////////////////////////////////////////

var SliderButtonMorph;

// SliderButtonMorph inherits from CircleBoxMorph:

SliderButtonMorph.prototype = new CircleBoxMorph;
SliderButtonMorph.prototype.constructor = SliderButtonMorph;
SliderButtonMorph.uber = CircleBoxMorph.prototype;

function SliderButtonMorph(orientation) {
    this.init(orientation);
}

SliderButtonMorph.prototype.init = function (orientation) {
    this.color = new Color(80, 80, 80);
    this.highlightColor = new Color(90, 90, 140);
    this.pressColor = new Color(80, 80, 160);
    this.userState = 'normal'; // 'highlight', 'pressed'
    this.is3D = false;
    this.hasMiddleDip = true;
    SliderButtonMorph.uber.init.call(this, orientation);

    this.cursorStyle = 'pointer';
};

SliderButtonMorph.prototype.autoOrientation = nop;

SliderButtonMorph.prototype.render = function (ctx) {
    var colorBak = this.color;
    if (this.userState === 'highlight') {
        this.color = this.highlightColor;
    } else if (this.userState === 'pressed') {
        this.color = this.pressColor;
    }
    SliderButtonMorph.uber.render.call(this, ctx);
    if (this.is3D || !MorphicPreferences.isFlat) {
        this.renderEdges(ctx);
    }
    this.color = colorBak;
};

SliderButtonMorph.prototype.renderEdges = function (ctx) {
    var gradient,
        radius,
        w = this.width(),
        h = this.height();

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (this.orientation === 'vertical') {
        ctx.lineWidth = w / 3;
        gradient = ctx.createLinearGradient(
            0,
            0,
            ctx.lineWidth,
            0
        );
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(1, this.color.toString());

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(ctx.lineWidth * 0.5, w / 2);
        ctx.lineTo(ctx.lineWidth * 0.5, h - w / 2);
        ctx.stroke();

        gradient = ctx.createLinearGradient(
            w - ctx.lineWidth,
            0,
            w,
            0
        );
        gradient.addColorStop(0, this.color.toString());
        gradient.addColorStop(1, 'black');

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(w - ctx.lineWidth * 0.5, w / 2);
        ctx.lineTo(w - ctx.lineWidth * 0.5, h - w / 2);
        ctx.stroke();

        if (this.hasMiddleDip) {
            gradient = ctx.createLinearGradient(
                ctx.lineWidth,
                0,
                w - ctx.lineWidth,
                0
            );

            radius = w / 4;
            gradient.addColorStop(0, 'black');
            gradient.addColorStop(0.35, this.color.toString());
            gradient.addColorStop(0.65, this.color.toString());
            gradient.addColorStop(1, 'white');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                w / 2,
                h / 2,
                radius,
                radians(0),
                radians(360),
                false
            );
            ctx.closePath();
            ctx.fill();
        }
    } else if (this.orientation === 'horizontal') {
        ctx.lineWidth = h / 3;
        gradient = ctx.createLinearGradient(
            0,
            0,
            0,
            ctx.lineWidth
        );
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(1, this.color.toString());

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(h / 2, ctx.lineWidth * 0.5);
        ctx.lineTo(w - h / 2, ctx.lineWidth * 0.5);
        ctx.stroke();

        gradient = ctx.createLinearGradient(
            0,
            h - ctx.lineWidth,
            0,
            h
        );
        gradient.addColorStop(0, this.color.toString());
        gradient.addColorStop(1, 'black');

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(h / 2, h - ctx.lineWidth * 0.5);
        ctx.lineTo(w - h / 2, h - ctx.lineWidth * 0.5);
        ctx.stroke();

        if (this.hasMiddleDip) {
            gradient = ctx.createLinearGradient(
                0,
                ctx.lineWidth,
                0,
                h - ctx.lineWidth
            );

            radius = h / 4;
            gradient.addColorStop(0, 'black');
            gradient.addColorStop(0.35, this.color.toString());
            gradient.addColorStop(0.65, this.color.toString());
            gradient.addColorStop(1, 'white');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                this.width() / 2,
                this.height() / 2,
                radius,
                radians(0),
                radians(360),
                false
            );
            ctx.closePath();
            ctx.fill();
        }
    }
};

//SliderButtonMorph events:

SliderButtonMorph.prototype.mouseEnter = function () {
    this.userState = 'highlight';
    this.rerender();
};

SliderButtonMorph.prototype.mouseLeave = function () {
    this.userState = 'normal';
    this.rerender();
};

SliderButtonMorph.prototype.mouseDownLeft = function (pos) {
    this.userState = 'pressed';
    this.rerender();
    this.escalateEvent('mouseDownLeft', pos);
};

SliderButtonMorph.prototype.mouseClickLeft = function () {
    this.userState = 'highlight';
    this.rerender();
};

SliderButtonMorph.prototype.mouseMove = function () {
    // prevent my parent from getting picked up
    nop();
};

// SliderMorph ///////////////////////////////////////////////////

// SliderMorph inherits from CircleBoxMorph:

SliderMorph.prototype = new CircleBoxMorph;
SliderMorph.prototype.constructor = SliderMorph;
SliderMorph.uber = CircleBoxMorph.prototype;

function SliderMorph(start, stop, value, size, orientation, color) {
    this.init(
        start || 0,
        stop || 100,
        value || 0,
        size || 10,
        orientation || 'vertical',
        color
    );
};

SliderMorph.prototype.init = function (
    start,
    stop,
    value,
    size,
    orientation,
    color
) {
    this.target = null;
    this.action = null;
    this.start = start;
    this.stop = stop;
    this.value = value;
    this.size = size;
    this.offset = null;
    this.button = new SliderButtonMorph;
    this.button.isDraggable = false;
    this.button.alpha = MorphicPreferences.isFlat ? 0.7 : 1;
    this.button.color = new Color(200, 200, 200);
    this.button.highlightColor = new Color(210, 210, 255);
    this.button.pressColor = new Color(180, 180, 255);
    SliderMorph.uber.init.call(this, orientation);
    this.add(this.button); this.alpha = (!(
    MorphicPreferences.isFlat) * 3) / 10;
    this.color = color || BLACK;
    this.setExtent(new Point(20, 100));
    this.cursorStyle = 'default';
    this.fixLayout();
};

SliderMorph.prototype.autoOrientation = nop;

SliderMorph.prototype.rangeSize = function () {
    return this.stop - this.start;
};

SliderMorph.prototype.ratio = function () {
    return this.size / (this.rangeSize() + 1);
};

SliderMorph.prototype.unitSize = function () {
    if (this.orientation === 'vertical') {
        return (this.height() - this.button.height()) /
            this.rangeSize();
    }
    return (this.width() - this.button.width()) /
        this.rangeSize();
};

SliderMorph.prototype.fixLayout = function () {
    var bw, bh, posX, posY;

    this.button.orientation = this.orientation;
    if (this.orientation === 'vertical') {
        bw  = this.width() - 2;
        bh = Math.max(bw, Math.round(this.height() * this.ratio()));
        this.button.setExtent(new Point(bw, bh));
        posX = 1;
        posY = Math.max(
            Math.min(
                Math.round((this.value - this.start) * this.unitSize()),
                this.height() - this.button.height()
            ),
            0
        );
    } else {
        bh = this.height() - 2;
        bw  = Math.max(bh, Math.round(this.width() * this.ratio()));
        this.button.setExtent(new Point(bw, bh));
        posY = 1;
        posX = Math.max(
            Math.min(
                Math.round((this.value - this.start) * this.unitSize()),
                this.width() - this.button.width()
            ),
            0
        );
    }
    this.button.setPosition(
        new Point(posX, posY).add(this.bounds.origin)
    );
};

SliderMorph.prototype.updateValue = function () {
    var relPos;
    if (this.orientation === 'vertical') {
        relPos = this.button.top() - this.top();
    } else {
        relPos = this.button.left() - this.left();
    }
    this.value = Math.round(relPos / this.unitSize() + this.start);
    this.updateTarget();
};

SliderMorph.prototype.updateTarget = function () {
    if (this.action) {
        if (typeof this.action === 'function') {
            this.action.call(this.target, this.value);
        } else { // assume it's a String
            this.target[this.action](this.value);
        }
    }
};

// SliderMorph menu:

SliderMorph.prototype.developersMenu = function () {
    var menu = SliderMorph.uber.developersMenu.call(this);
    menu.addItem(
        "show value...",
        'showValue',
        'display a dialog box\nshowing the selected number'
    );
    menu.addItem(
        "floor...",
        () => {
            this.prompt(
                menu.title + '\nfloor:',
                this.setStart,
                this,
                this.start.toString(),
                null,
                0,
                this.stop - this.size,
                true
            );
        },
        'set the minimum value\nwhich can be selected'
    );
    menu.addItem(
        "ceiling...",
        () => {
            this.prompt(
                menu.title + '\nceiling:',
                this.setStop,
                this,
                this.stop.toString(),
                null,
                this.start + this.size,
                this.size * 100,
                true
            );
        },
        'set the maximum value\nwhich can be selected'
    );
    menu.addItem(
        "button size...",
        () => {
            this.prompt(
                menu.title + '\nbutton size:',
                this.setSize,
                this,
                this.size.toString(),
                null,
                1,
                this.stop - this.start,
                true
            );
        },
        'set the range\ncovered by\nthe slider button'
    );
    menu.addLine();
    menu.addItem(
        'set target',
        "setTarget",
        'select another morph\nwhose numerical property\nwill be ' +
            'controlled by this one'
    );
    return menu;
};

SliderMorph.prototype.showValue = function () {
    this.inform(this.value);
};

SliderMorph.prototype.userSetStart = function (num) {
    // for context menu demo purposes
    this.start = Math.max(num, this.stop);
};

SliderMorph.prototype.setStart = function (num, noUpdate) {
    // for context menu demo purposes
    var newStart;
    if (typeof num === 'number') {
        this.start = Math.min(
            num,
            this.stop - this.size
        );
    } else {
        newStart = parseFloat(num);
        if (!isNaN(newStart)) {
            this.start = Math.min(
                newStart,
                this.stop - this.size
            );
        }
    }
    this.value = Math.max(this.value, this.start);
    if (!noUpdate) {this.updateTarget(); }
    this.fixLayout();
    this.rerender();
};

SliderMorph.prototype.setStop = function (num, noUpdate) {
    // for context menu demo purposes
    var newStop;
    if (typeof num === 'number') {
        this.stop = Math.max(num, this.start + this.size);
    } else {
        newStop = parseFloat(num);
        if (!isNaN(newStop)) {
            this.stop = Math.max(newStop, this.start + this.size);
        }
    }
    this.value = Math.min(this.value, this.stop);
    if (!noUpdate) {this.updateTarget(); }
    this.fixLayout();
    this.rerender();
};

SliderMorph.prototype.setSize = function (num, noUpdate) {
    // for context menu demo purposes
    var newSize;
    if (typeof num === 'number') {
        this.size = Math.min(
            Math.max(num, 1),
            this.stop - this.start
        );
    } else {
        newSize = parseFloat(num);
        if (!isNaN(newSize)) {
            this.size = Math.min(
                Math.max(newSize, 1),
                this.stop - this.start
            );
        }
    }
    this.value = Math.min(this.value, this.stop - this.size);
    if (!noUpdate) {this.updateTarget(); }
    this.fixLayout();
    this.rerender();
};

SliderMorph.prototype.setTarget = function () {
    var choices = this.overlappedMorphs(),
        menu = new MenuMorph(this, 'choose target:');

    choices.push(this.world());
    choices.forEach(each => {
        menu.addItem(each.toString().slice(0, 50), () => {
            this.target = each;
            this.setTargetSetter();
        });
    });
    if (choices.length === 1) {
        this.target = choices[0];
        this.setTargetSetter();
    } else if (choices.length > 0) {
        menu.popUpAtHand(this.world());
    }
};

SliderMorph.prototype.setTargetSetter = function () {
    var choices = this.target.numericalSetters(),
        menu = new MenuMorph(this, 'choose target property:');

    choices.forEach(each => {
        menu.addItem(each, () => this.action = each);
    });
    if (choices.length === 1) {
        this.action = choices[0];
    } else if (choices.length > 0) {
        menu.popUpAtHand(this.world());
    }
};

SliderMorph.prototype.numericalSetters = function () {
    // for context menu demo purposes
    var list = SliderMorph.uber.numericalSetters.call(this);
    list.push('setStart', 'setStop', 'setSize');
    return list;
};

// SliderMorph stepping:

SliderMorph.prototype.step = null;

SliderMorph.prototype.mouseDownLeft = function (pos) {
    var world;

    if (!this.button.bounds.containsPoint(pos)) {
        this.offset = new Point(); // return null;
    } else {
        this.offset = pos.subtract(this.button.bounds.origin);
    }
    world = this.root();

    this.step = () => {
        var mousePos, newX, newY;
        if (world.hand.mouseButton) {
            mousePos = world.hand.bounds.origin;
            if (this.orientation === 'vertical') {
                newX = this.button.bounds.origin.x;
                newY = Math.max(
                    Math.min(
                        mousePos.y - this.offset.y,
                        this.bottom() - this.button.height()
                    ),
                    this.top()
                );
            } else {
                newY = this.button.bounds.origin.y;
                newX = Math.max(
                    Math.min(
                        mousePos.x - this.offset.x,
                        this.right() - this.button.width()
                    ),
                    this.left()
                );
            }
            this.button.setPosition(new Point(newX, newY));
            this.updateValue();
        } else {
            this.step = null;
        }
    };
};

// MouseSensorMorph ////////////////////////////////////////////////////

// for demo and debugging purposes only, to be removed later

var MouseSensorMorph;

// MouseSensorMorph inherits from BoxMorph:

MouseSensorMorph.prototype = new BoxMorph;
MouseSensorMorph.prototype.constructor = MouseSensorMorph;
MouseSensorMorph.uber = BoxMorph.prototype;

// MouseSensorMorph instance creation:

function MouseSensorMorph(edge, border, borderColor) {
    this.init(edge, border, borderColor);
}

MouseSensorMorph.prototype.init = function (edge, border, borderColor) {
    MouseSensorMorph.uber.init.call(this);
    this.edge = edge || 4;
    this.border = border || 2;
    this.color = WHITE;
    this.borderColor = borderColor || BLACK;
    this.isTouched = false;
    this.upStep = 0.05;
    this.downStep = 0.02;
};

MouseSensorMorph.prototype.touch = function () {
    if (!this.isTouched) {
        this.isTouched = true;
        this.alpha = 0.6;

        this.step = () => {
            if (this.isTouched) {
                if (this.alpha < 1) {
                    this.alpha += this.upStep;
                }
            } else if (this.alpha > this.downStep) {
                this.alpha -= this.downStep;
            } else {
                this.alpha = 0;
                this.step = null;
            }
            this.changed();
        };
    }
};

MouseSensorMorph.prototype.unTouch = function () {this.isTouched = false;};

MouseSensorMorph.prototype.mouseEnter = function () {this.touch();};

MouseSensorMorph.prototype.mouseLeave = function () {this.unTouch();};

MouseSensorMorph.prototype.mouseDownLeft = function () {this.touch();};

MouseSensorMorph.prototype.mouseClickLeft = function () {this.unTouch();};

// InspectorMorph //////////////////////////////////////////////////////

// InspectorMorph: referenced constructors

var ListMorph;
var TriggerMorph;

// InspectorMorph inherits from BoxMorph:

InspectorMorph.prototype = new BoxMorph;
InspectorMorph.prototype.constructor = InspectorMorph;
InspectorMorph.uber = BoxMorph.prototype;

// InspectorMorph instance creation:

function InspectorMorph(target) {
    this.init(target);
}

InspectorMorph.prototype.init = function (target) {
    // additional properties:
    this.target = target;
    this.currentProperty = null;
    this.showing = 'attributes';
    this.markOwnProperties = false;
    this.hasUserEditedDetails = false;

    // initialize inherited properties:
    InspectorMorph.uber.init.call(this);

    // override inherited properties:
    this.isDraggable = true;
    this.border = 1;
    this.edge = MorphicPreferences.isFlat ? 1 : 5;
    this.color = new Color(60, 60, 60);
    this.borderColor = new Color(95, 95, 95);
    this.fps = 25;

    // panes:
    this.label = null;
    this.list = null;
    this.detail = null;
    this.work = null;
    this.buttonInspect = null;
    this.buttonClose = null;
    this.buttonSubset = null;
    this.buttonEdit = null;
    this.resizer = null;

    if (this.target) {
        this.buildPanes();
    }

    this.setExtent(
        new Point(
            MorphicPreferences.handleSize * 20,
            MorphicPreferences.handleSize * 20 * 2 / 3
        )
    );
};

InspectorMorph.prototype.setTarget = function (target) {
    this.target = target;
    this.currentProperty = null;
    this.buildPanes();
};

InspectorMorph.prototype.updateCurrentSelection = function () {
    var val, txt, cnts,
        sel = this.list.selected,
        currentTxt = this.detail.contents.children[0],
        root = this.root();

    if (root &&
            (root.keyboardFocus instanceof CursorMorph) &&
            (root.keyboardFocus.target === currentTxt)) {
        this.hasUserEditedDetails = true;
        return;
    }
    if (isNil(sel) || this.hasUserEditedDetails) {return; }
    val = this.target[sel];
    this.currentProperty = val;
    if (isNil(val)) {
        txt = 'NULL';
    } else if (isString(val)) {
        txt = val;
    } else {
        txt = val.toString();
    }
    if (currentTxt.text === txt) {return; }
    cnts = new TextMorph(txt);
    cnts.isEditable = true;
    cnts.enableSelecting();
    cnts.setReceiver(this.target);
    this.detail.setContents(cnts);
};

InspectorMorph.prototype.buildPanes = function () {
    var attribs = [], property, ctrl, ev, doubleClickAction;

    // remove existing panes
    this.children.forEach(m => {
        if (m !== this.work) { // keep work pane around
            m.destroy();
        }
    });
    this.children = [];

    // label
    this.label = new TextMorph(this.target.toString());
    this.label.fontSize = MorphicPreferences.menuFontSize;
    this.label.isBold = true;
    this.label.color = WHITE;
    this.add(this.label);

    // properties list
    for (property in this.target) {
        if (property) { // dummy condition, to be refined
            attribs.push(property);
        }
    }
    if (this.showing === 'attributes') {
        attribs = attribs.filter(
            prop => typeof this.target[prop] !== 'function'
        );
    } else if (this.showing === 'methods') {
        attribs = attribs.filter(
            prop => typeof this.target[prop] === 'function'
        );
    } // otherwise show all properties

    doubleClickAction = () => {
        var world, inspector;
        if (!isObject(this.currentProperty)) {return; }
        world = this.world();
        inspector = new InspectorMorph(
            this.currentProperty
        );
        inspector.setPosition(world.hand.position());
        inspector.keepWithin(world);
        world.add(inspector);
        inspector.changed();
    };

    this.list = new ListMorph(
        this.target instanceof Array ? attribs : attribs.sort(),
        null, // label getter
        this.markOwnProperties ?
                [ // format list
                    [ // format element: [color, predicate(element]
                        new Color(0, 0, 180),
                        element => {
                            return Object.prototype.hasOwnProperty.call(
                                this.target,
                                element
                            );
                        }
                    ]
                ]
                : null,
        doubleClickAction
    );

    this.list.action = () => {
        this.hasUserEditedDetails = false;
        this.updateCurrentSelection();
    };

    this.list.hBar.alpha = 0.6;
    this.list.vBar.alpha = 0.6;
    this.list.contents.step = null;
    this.add(this.list);

    // details pane
    this.detail = new ScrollFrameMorph();
    this.detail.acceptsDrops = false;
    this.detail.contents.acceptsDrops = false;
    this.detail.isTextLineWrapping = true;
    this.detail.color = WHITE;
    this.detail.hBar.alpha = 0.6;
    this.detail.vBar.alpha = 0.6;
    ctrl = new TextMorph('');
    ctrl.isEditable = true;
    ctrl.enableSelecting();
    ctrl.setReceiver(this.target);
    this.detail.setContents(ctrl);
    this.add(this.detail);

    // work ('evaluation') pane
    // don't refresh the work pane if it already exists
    if (this.work === null) {
        this.work = new ScrollFrameMorph();
        this.work.acceptsDrops = false;
        this.work.contents.acceptsDrops = false;
        this.work.isTextLineWrapping = true;
        this.work.color = WHITE;
        this.work.hBar.alpha = 0.6;
        this.work.vBar.alpha = 0.6;
        ev = new TextMorph('');
        ev.isEditable = true;
        ev.enableSelecting();
        ev.setReceiver(this.target);
        this.work.setContents(ev);
    }
    this.add(this.work);

    // properties button
    this.buttonSubset = new TriggerMorph();
    this.buttonSubset.labelString = 'show...';
    this.buttonSubset.createLabel();
    this.buttonSubset.action = () => {
        var menu;
        menu = new MenuMorph();
        menu.addItem(
            'attributes',
            () => {
                this.showing = 'attributes';
                this.buildPanes();
            }
        );
        menu.addItem(
            'methods',
            () => {
                this.showing = 'methods';
                this.buildPanes();
            }
        );
        menu.addItem(
            'all',
            () => {
                this.showing = 'all';
                this.buildPanes();
            }
        );
        menu.addLine();
        menu.addItem(
            (this.markOwnProperties ?
                    'un-mark own' : 'mark own'),
            () => {
                this.markOwnProperties = !this.markOwnProperties;
                this.buildPanes();
            },
            'highlight\n\'own\' properties'
        );
        menu.popUpAtHand(this.world());
    };

    this.add(this.buttonSubset);

    // inspect button
    this.buttonInspect = new TriggerMorph();
    this.buttonInspect.labelString = 'inspect...';
    this.buttonInspect.createLabel();
    this.buttonInspect.action = () => {
        var menu, world, inspector;
        if (isObject(this.currentProperty)) {
            menu = new MenuMorph();
            menu.addItem(
                'in new inspector...',
                () => {
                    world = this.world();
                    inspector = new InspectorMorph(
                        this.currentProperty
                    );
                    inspector.setPosition(world.hand.position());
                    inspector.keepWithin(world);
                    world.add(inspector);
                    inspector.changed();
                }
            );
            menu.addItem(
                'here...',
                () => this.setTarget(this.currentProperty)
            );
            menu.popUpAtHand(this.world());
        } else {
            this.inform(
                (this.currentProperty === null ?
                        'null' : typeof this.currentProperty) +
                            '\nis not inspectable'
            );
        }
    };
    this.add(this.buttonInspect);

    // edit button
    this.buttonEdit = new TriggerMorph();
    this.buttonEdit.labelString = 'edit...';
    this.buttonEdit.createLabel();
    this.buttonEdit.action = () => {
        var menu = new MenuMorph(this);
        menu.addItem("save", 'save', 'accept changes');
        menu.addLine();
        menu.addItem("add property...", 'addProperty');
        menu.addItem("rename...", 'renameProperty');
        menu.addItem("remove...", 'removeProperty');
        menu.popUpAtHand(this.world());
    };
    this.add(this.buttonEdit);

    // close button
    this.buttonClose = new TriggerMorph();
    this.buttonClose.labelString = 'close';
    this.buttonClose.createLabel();
    this.buttonClose.action = () => this.destroy();
    this.add(this.buttonClose);

    // resizer
    this.resizer = new HandleMorph(
        this,
        150,
        100,
        this.edge,
        this.edge
    );

    // update layout
    this.fixLayout();
};

InspectorMorph.prototype.fixLayout = function () {
    var x, y, r, b, w, h;

    // label
    x = this.left() + this.edge;
    y = this.top() + this.edge;
    r = this.right() - this.edge;
    w = r - x;
    this.label.setPosition(new Point(x, y));
    this.label.setWidth(w);
    if (this.label.height() > (this.height() - 50)) {
        this.bounds.setHeight(this.label.height() + 50);
    }

    // list
    y = this.label.bottom() + 2;
    w = Math.min(
        Math.floor(this.width() / 3),
        this.list.listContents.width()
    );

    w -= this.edge;
    b = this.bottom() - (2 * this.edge) -
        MorphicPreferences.handleSize;
    h = b - y;
    this.list.setPosition(new Point(x, y));
    this.list.setExtent(new Point(w, h));

    // detail
    x = this.list.right() + this.edge;
    r = this.right() - this.edge;
    w = r - x;
    this.detail.setPosition(new Point(x, y));
    this.detail.setExtent(new Point(w, (h * 2 / 3) - this.edge));

    // work
    y = this.detail.bottom() + this.edge;
    this.work.setPosition(new Point(x, y));
    this.work.setExtent(new Point(w, h / 3));

    // properties button
    x = this.list.left();
    y = this.list.bottom() + this.edge;
    w = this.list.width();
    h = MorphicPreferences.handleSize;
    this.buttonSubset.setPosition(new Point(x, y));
    this.buttonSubset.setExtent(new Point(w, h));

    // inspect button
    x = this.detail.left();
    w = this.detail.width() - this.edge -
        MorphicPreferences.handleSize;
    w = w / 3 - this.edge / 3;
    this.buttonInspect.setPosition(new Point(x, y));
    this.buttonInspect.setExtent(new Point(w, h));

    // edit button
    x = this.buttonInspect.right() + this.edge;
    this.buttonEdit.setPosition(new Point(x, y));
    this.buttonEdit.setExtent(new Point(w, h));

    // close button
    x = this.buttonEdit.right() + this.edge;
    r = this.detail.right() - this.edge -
        MorphicPreferences.handleSize;
    w = r - x;
    this.buttonClose.setPosition(new Point(x, y));
    this.buttonClose.setExtent(new Point(w, h));

    // resizer
    this.resizer.fixLayout();
};

// InspectorMorph editing ops:

InspectorMorph.prototype.save = function () {
    var txt = this.detail.contents.children[0].text.toString(),
        prop = this.list.selected;
    try {
        this.target.evaluateString('this.' + prop + ' = ' + txt);
        this.hasUserEditedDetails = false;
        this.target.changed();
    } catch (err) {
        this.inform(err);
    }
};

InspectorMorph.prototype.addProperty = function () {
    this.prompt(
        'new property name:',
        prop => {
            if (prop) {
                this.target[prop] = null;
                this.buildPanes();
                this.target.changed();
            }
        },
        this,
        'property'
    );
};

InspectorMorph.prototype.renameProperty = function () {
    var propertyName = this.list.selected;
    this.prompt(
        'property name:',
        prop => {
            try {
                delete (this.target[propertyName]);
                this.target[prop] = this.currentProperty;
            } catch (err) {
                this.inform(err);
            }
            this.buildPanes();
            this.target.changed();
        },
        this,
        propertyName
    );
};

InspectorMorph.prototype.removeProperty = function () {
    var prop = this.list.selected;
    try {
        delete (this.target[prop]);
        this.currentProperty = null;
        this.buildPanes();
        this.target.changed();
    } catch (err) {
        this.inform(err);
    }
};

// InspectorMorph stepping

InspectorMorph.prototype.step = function () {
    this.updateCurrentSelection();
    var lbl = this.target.toString();
    if (this.label.text === lbl) {return; }
    this.label.text = lbl;
    this.fixLayout();
};

// InspectorMorph duplicating:

InspectorMorph.prototype.updateReferences = function (map) {
    var active = this.list.activeIndex();
    InspectorMorph.uber.updateReferences.call(this, map);
    this.buildPanes();
    this.list.activateIndex(active);
};

// MenuMorph ///////////////////////////////////////////////////////////

// MenuMorph: referenced constructors

var MenuItemMorph;

// MenuMorph inherits from BoxMorph:

MenuMorph.prototype = new BoxMorph;
MenuMorph.prototype.constructor = MenuMorph;
MenuMorph.uber = BoxMorph.prototype;

// MenuMorph instance creation:

function MenuMorph(target, title, environment, fontSize) {
    this.init(target, title, environment, fontSize);

    /*
    if target is a function, use it as callback:
    execute target as callback function with the action property
    of the triggered MenuItem as argument.
    Use the environment, if it is specified.
    Note: if action is also a function, instead of becoming
    the argument itself it will be called to answer the argument.
    For selections, Yes/No Choices etc.

    else (if target is not a function):

        if action is a function:
        execute the action with target as environment (can be null)
        for lambdafied (inline) actions

        else if action is a String:
        treat it as function property of target and execute it
        for selector-like actions
    */
}

MenuMorph.prototype.init = function (target, title, environment, fontSize) {
    // additional properties:
    this.target = target;
    this.title = title || null;
    this.environment = environment || null;
    this.fontSize = fontSize || null;
    this.items = [];
    this.label = null;
    this.world = null;
    this.isListContents = false;
    this.hasFocus = false;
    this.selection = null;
    this.submenu = null;

    // initialize inherited properties:
    MenuMorph.uber.init.call(this);

    // override inherited properties:
    this.isDraggable = false;
    this.noDropShadow = true;
    this.fullShadowSource = false;

    // immutable properties:
    this.border = null;
    this.edge = null;
};

MenuMorph.prototype.addItem = function (
    labelString,
    action,
    hint,
    color,
    bold, // bool
    italic, // bool
    doubleClickAction, // optional, when used as list contents
    shortcut, // optional string, icon (Morph or Canvas) or tuple [icon, string]
    verbatim // optional bool, don't translate if true
) {
    /*
    labelString is normally a single-line string. But it can also be one
    of the following:

        * a multi-line string (containing line breaks)
        * an icon (either a Morph or a Canvas)
        * a tuple of format: [icon, string]
    */
    this.items.push([
        (verbatim || (labelString instanceof SymbolMorph)) ? labelString || 'close' : localize(labelString || 'close'),
        action === 0 ? 0 : action || nop,
        hint,
        color,
        bold || false,
        italic || false,
        doubleClickAction,
        shortcut,
        verbatim]);
};

MenuMorph.prototype.addMenu = function (label, aMenu, indicator, verbatim) {
    this.addPair(
        label,
        aMenu,
        isNil(indicator) ? '\u25ba' : indicator,
        null,
        verbatim // don't translate
    );
};

MenuMorph.prototype.addPair = function (
    label,
    action,
    shortcut,
    hint,
    verbatim // don't translate
) {
    this.addItem(
        label,
        action,
        hint,
        null,
        null,
        null,
        null,
        shortcut,
        verbatim
    );
};

MenuMorph.prototype.addLine = function (width) {
    this.items.push([0, width || 1]);
};

MenuMorph.prototype.createLabel = function () {
    var text;
    if (this.label !== null) {
        this.label.destroy();
    }
    text = new TextMorph(
        localize(this.title),
        this.fontSize || MorphicPreferences.menuFontSize,
        MorphicPreferences.menuFontName,
        true,
        false,
        'center'
    );
    text.alignment = 'center';
    text.color = WHITE;
    text.backgroundColor = this.borderColor;
    text.fixLayout();
    this.label = new BoxMorph(3, 0);
    this.label.color = this.borderColor;
    this.label.borderColor = this.borderColor;
    this.label.setExtent(text.extent().add(4));
    this.label.add(text);
    this.label.text = text;
};

MenuMorph.prototype.createItems = function () {
    var item,
        fb,
        x,
        y,
        isLine = false;

    this.children.forEach(m => m.destroy());
    this.children = [];
    if (!this.isListContents) {
        this.edge = 5 / (MorphicPreferences.isFlat + 1);
        this.border = 2 - MorphicPreferences.isFlat;
    }; this.color = WHITE;
    this.borderColor = new Color(60, 60, 60);
    this.setExtent(new Point(0, 0));

    y = 2;
    x = this.left() + 4;
    if (!this.isListContents) {
        if (this.title) {
            this.createLabel();
            this.label.setPosition(this.bounds.origin.add(4));
            this.add(this.label);
            y = this.label.bottom();
        } else {
            y = this.top() + 4;
        }
    }
    y += 1;
    this.items.forEach(tuple => {
        isLine = false;
        if (tuple instanceof StringFieldMorph ||
                tuple instanceof ColorPickerMorph ||
                tuple instanceof SliderMorph ||
                tuple instanceof DialMorph ||
                tuple instanceof SymbolMorph) {
            item = tuple;
        } else if (tuple[0] === 0) {
            isLine = true;
            item = new Morph;
            item.color = this.borderColor;
            item.setHeight(tuple[1]);
        } else {
            item = new MenuItemMorph(
                this.target,
                tuple[1],
                tuple[0],
                this.fontSize || MorphicPreferences.menuFontSize,
                MorphicPreferences.menuFontName,
                this.environment,
                tuple[2], // bubble help hint
                tuple[3], // color
                tuple[4], // bold
                tuple[5], // italic
                tuple[6], // doubleclick action
                tuple[7] // shortcut
            );
        }; if (isLine) {
            y += 1;
        }; item.setPosition(new Point(x, y));
        this.add(item);
        y = y + item.height();
        if (isLine) {
            y += 1;
        };
    });

    fb = this.fullBounds();
    this.setExtent(fb.extent().add(4));
    this.adjustWidths();
};

MenuMorph.prototype.maxWidth = function () {
    var w = 0;

    if (this.parent instanceof FrameMorph) {
        if (this.parent.scrollFrame instanceof ScrollFrameMorph) {
            w = this.parent.scrollFrame.width();
        }
    }
    this.children.forEach(item => {
        if (item instanceof MenuItemMorph) {
            w = Math.max(
                w,
                item.label.width() + 8 +
                    (item.shortcut ? item.shortcut.width() + 4 : 0)
            );
        } else if ((item instanceof StringFieldMorph) ||
                (item instanceof ColorPickerMorph) ||
                (item instanceof SliderMorph) ||
                (item instanceof DialMorph)) {
            w = Math.max(w, item.width());
        }
    });
    if (this.label) {
        w = Math.max(w, this.label.width());
    }
    return w;
};

MenuMorph.prototype.adjustWidths = function () {
    var w = this.maxWidth();
    this.children.forEach(item => {
    	if (!(item instanceof DialMorph)) {
            item.setWidth(w);
        }
        item.fixLayout();
        if (item === this.label) {
            item.text.setPosition(
                item.center().subtract(
                    item.text.extent().divideBy(2)
                )
            );
        }
    });
};

MenuMorph.prototype.unselectAllItems = function () {
    this.children.forEach(item => {
        if (item instanceof MenuItemMorph) {
            if (item.userState !== 'normal') {
                item.userState = 'normal';
                item.rerender();
            }
        } else if (item instanceof ScrollFrameMorph) {
        	item.contents.children.forEach(morph => {
         		if (morph instanceof MenuItemMorph &&
                        morph.userState !== 'normal') {
                    morph.userState = 'normal';
                    morph.rerender();
              	}
         	});
        }
    });
};

// MenuMorph popping up

MenuMorph.prototype.popup = function (world, pos) {
	var scroller;

    this.createItems();
    this.setPosition(pos);
    this.addShadow(new Point(2, 2), 80);
    this.keepWithin(world);

    if (this.bottom() > world.bottom()) {
    	// scroll menu items if the menu is taller than the world
    	this.removeShadow();
        scroller = this.scroll();
        this.bounds.corner.y = world.bottom() - 2;
        this.addShadow(new Point(2, 2), 80);
        scroller.setHeight(world.bottom() - scroller.top() - 6);
        scroller.adjustScrollBars(); // ?
     }

    if (world.activeMenu) {
        world.activeMenu.destroy();
    }
    if (this.items.length < 1 && !this.title) { // don't show empty menus
        return;
    }
    world.add(this);
    world.activeMenu = this;
    this.world = world; // optionally enable keyboard support
    this.fullChanged();
};

MenuMorph.prototype.scroll = function () {
    // private - move all items into a scroll frame
    var scroller = new ScrollFrameMorph(),
        start = this.label ? 1 : 0,
        first = this.children[start];

    scroller.setPosition(first.position());
    this.children.slice(start).forEach(morph => scroller.addContents(morph));
    this.add(scroller);
    scroller.setWidth(first.width());
    return scroller;
};

MenuMorph.prototype.popUpAtHand = function (world) {
    var wrrld = world || this.world;
    this.popup(wrrld, wrrld.hand.position());
};

MenuMorph.prototype.popUpCenteredAtHand = function (world) {
    var wrrld = world || this.world;
    this.fixLayout();
    this.createItems();
    this.popup(
        wrrld,
        wrrld.hand.position().subtract(
            this.extent().floorDivideBy(2)
        )
    );
};

MenuMorph.prototype.popUpCenteredInWorld = function (world) {
    var wrrld = world || this.world;
    this.fixLayout();
    this.createItems();
    this.popup(
        wrrld,
        wrrld.center().subtract(
            this.extent().floorDivideBy(2)
        )
    );
};

// MenuMorph submenus

MenuMorph.prototype.closeRootMenu = function () {
    if (this.parent instanceof MenuMorph) {
        this.parent.closeRootMenu();
    } else {
        this.destroy();
    }
};

MenuMorph.prototype.closeSubmenu = function () {
    if (this.submenu) {
        this.submenu.destroy();
        this.submenu = null;
        this.unselectAllItems();
        this.world.activeMenu = this;
    }
};

// MenuMorph keyboard accessibility

MenuMorph.prototype.getFocus = function () {
    this.world.keyboardFocus = this;
    this.selection = null;
    this.selectFirst();
    this.hasFocus = true;
};

MenuMorph.prototype.processKeyDown = function (event) {
    // console.log(event.keyCode);
    switch (event.keyCode) {
    case 13: // 'enter'
    case 32: // 'space'
        if (this.selection) {
            this.selection.mouseClickLeft();
            if (this.submenu) {
                this.submenu.getFocus();
            }
        }
        return;
    case 27: // 'esc'
        return this.destroy();
    case 37: // 'left arrow'
        return this.leaveSubmenu();
    case 38: // 'up arrow'
        return this.selectUp();
    case 39: // 'right arrow'
        return this.enterSubmenu();
    case 40: // 'down arrow'
        return this.selectDown();
    default:
        nop();
    }
};

MenuMorph.prototype.processKeyUp = function (event) {
    nop(event);
};

MenuMorph.prototype.processKeyPress = function (event) {
    nop(event);
};

MenuMorph.prototype.selectFirst = function () {
    var scroller, items, i;

    scroller = detect(
        this.children,
        morph => morph instanceof ScrollFrameMorph
    );
    items = scroller ? scroller.contents.children : this.children;
    for (i = 0; i < items.length; i += 1) {
        if (items[i] instanceof MenuItemMorph) {
            this.select(items[i]);
            return;
    	}
	}
};

MenuMorph.prototype.selectUp = function () {
    var scroller, triggers, idx;

	scroller = detect(
        this.children,
        morph => morph instanceof ScrollFrameMorph
    );
    triggers = (scroller ? scroller.contents.children : this.children).filter(
    	each => each instanceof MenuItemMorph
    );
    if (!this.selection) {
        if (triggers.length) {
            this.select(triggers[0]);
        }
        return;
    }
    idx = triggers.indexOf(this.selection) - 1;
    if (idx < 0) {
        idx = triggers.length - 1;
    }
    this.select(triggers[idx]);
};

MenuMorph.prototype.selectDown = function () {
    var scroller, triggers, idx;

    scroller = detect(
        this.children,
        morph => morph instanceof ScrollFrameMorph
    );
    triggers = (scroller ? scroller.contents.children : this.children).filter(
        each => each instanceof MenuItemMorph
    );
    if (!this.selection) {
        if (triggers.length) {
            this.select(triggers[0]);
        }
        return;
    }
    idx = triggers.indexOf(this.selection) + 1;
    if (idx >= triggers.length) {
        idx = 0;
    }
    this.select(triggers[idx]);
};

MenuMorph.prototype.enterSubmenu = function () {
    if (this.selection && this.selection.action instanceof MenuMorph) {
        this.selection.popUpSubmenu();
        if (this.submenu) {
            this.submenu.getFocus();
        }
    }
};

MenuMorph.prototype.leaveSubmenu = function () {
    var menu = this.parent;
    if (this.parent instanceof MenuMorph) {
        menu.submenu = null;
        menu.hasFocus = true;
        this.destroy();
        menu.world.keyboardFocus = menu;
        menu.world.activeMenu = menu;
    }
};

MenuMorph.prototype.select = function (aMenuItem) {
    this.unselectAllItems();
    aMenuItem.userState = 'highlight';
    aMenuItem.rerender();
    aMenuItem.scrollIntoView();
    this.selection = aMenuItem;
};

MenuMorph.prototype.destroy = function () {
    if (this.hasFocus) {
        this.world.keyboardFocus = null;
    }
    if (!this.isListContents && (this.world.activeMenu === this)) {
        this.world.activeMenu = null;
    }
    MenuMorph.uber.destroy.call(this);
};

// StringMorph /////////////////////////////////////////////////////////

// I am a single line of text

// StringMorph inherits from Morph:

StringMorph.prototype = new Morph;
StringMorph.prototype.constructor = StringMorph;
StringMorph.uber = Morph.prototype;

// StringMorph shared properties:

// context for measuring text dimensions, used by StringMorphs and TextMorphs
StringMorph.prototype.measureCtx = newCanvas().getContext("2d");

// StringMorph instance creation:

function StringMorph(
    text,
    fontSize,
    fontStyle,
    bold,
    italic,
    isNumeric,
    shadowOffset,
    shadowColor,
    color,
    fontName
) {
    this.init(
        text,
        fontSize,
        fontStyle,
        bold,
        italic,
        isNumeric,
        shadowOffset,
        shadowColor,
        color,
        fontName
    );
}

StringMorph.prototype.init = function (
    text,
    fontSize,
    fontStyle,
    bold,
    italic,
    isNumeric,
    shadowOffset,
    shadowColor,
    color,
    fontName
) {
    // additional properties:
    this.text = (isNil(text) ? 'StringMorph' : ((text.toString instanceof Function) ? text.toString() : ''));
    this.fontSize = (fontSize || 12);
    this.isBold = bold || false;
    this.isItalic = italic || false;
    this.acceptedFontName = (fontName || MorphicPreferences.globalFontFamily);
    this.fontName = (this.acceptedFontName.toString()).concat((this.isBold || this.isItalic
    ) ? (this.isBold ? 'Bold' : '').concat(this.isItalic ? 'Italic' : '') : 'Regular');
    this.fontStyle = fontStyle || 'sans-serif';
    this.isEditable = false;
    this.enableLinks = false; // set to "true" if I can contain clickable URLs
    this.isNumeric = isNumeric || false;
    this.isPassword = false;
    this.shadowOffset = shadowOffset || ZERO;
    this.shadowColor = shadowColor || null;
    this.isShowingBlanks = false;
    this.blanksColor = new Color(180, 140, 140);

    // additional properties for text-editing:
    this.isScrollable = true; // scrolls into view when edited
    this.currentlySelecting = false;
    this.startMark = 0;
    this.endMark = 0;
    this.markedTextColor = WHITE;
    this.markedBackgoundColor = new Color(60, 60, 120);

    // initialize inherited properties:
    StringMorph.uber.init.call(this, true);

    // override inherited properites:
    this._autoCursor = true;
    this.color = color || BLACK;
    this.fixLayout(); // determine my extent
};

StringMorph.prototype.toString = function () {
    // e.g. 'a StringMorph("Hello World")'
    return 'a ' +
        (this.constructor.name ||
            this.constructor.toString().split(' ')[1].split('(')[0]) +
        '("' + this.text.slice(0, 30) + '...")';
};

Object.defineProperty(StringMorph.prototype, 'cursorStyle', {
    get() {
        return this._cursorStyle || null;
    },

    set(style) {
        this._cursorStyle = style;
        this._autoCursor = false;
    }
});

Object.defineProperty(StringMorph.prototype, 'cursorGrabStyle', {
    get() {
        return this._cursorGrabStyle || null;
    },

    set(style) {
        this._cursorGrabStyle = style;
        this._autoCursor = false;
    }
});

StringMorph.prototype.password = function (letter, length) {
    var ans = '', i;
    for (i = 0; i < length; i += 1) {
        ans += letter;
    }; return ans;
};

StringMorph.prototype.getRenderColor = function (
) {let color = this.color.copy();
return this.placeholder && this.text == '' ? color.lighter(
30) : color;};

StringMorph.prototype.font = function () {return this.fontSize + 'px ' + (
this.fontName ? this.fontName + ', ' : '') + this.fontStyle;};

StringMorph.prototype.getShadowRenderColor = function () {
    // answer the shadow rendering color, can be overridden for my children
    return this.shadowColor;
};

StringMorph.prototype.fixLayout = function (justMe) {
    this.fontName = ((this.acceptedFontName || MorphicPreferences.globalFontFamily
    ).toString()).concat((this.isBold || this.isItalic) ? (this.isBold ? 'Bold' : ''
    ).concat(this.isItalic ? 'Italic' : '') : 'Regular');

    // determine my extent depending on my current settings
    var width,
        shadowOffset = this.shadowOffset || ZERO,
        txt = this.isPassword ?
            this.password('*', this.text.length) : this.text;

    this.measureCtx.font = this.font();
    width = Math.max(
        this.measureCtx.measureText(txt).width + Math.abs(shadowOffset.x),
        1
    );
    this.bounds.corner = this.bounds.origin.add(
        new Point(
            width,
            fontHeight(this.fontSize) + Math.abs(shadowOffset.y)
        )
    );

    // notify my parent of layout change
    if (!justMe && this.parent) {
        if (this.parent.fixLayout) {
            this.parent.fixLayout();
        };
    };

    if (this._autoCursor && this.cursorStyle == null && this.isEditable) {
        this.cursorStyle = 'text';
        this.cursorGrabStyle = 'grabbing';
        this._autoCursor = true;
    };
};

StringMorph.prototype.render = function (ctx) {
    var start, stop, i, p, c, x, y,
        shadowOffset = this.shadowOffset || ZERO,
        shadowColor = this.getShadowRenderColor(),
        txt = this.isPassword ?
                this.password('*', this.text.length) : this.text;

    // prepare context for drawing text
    ctx.font = this.font();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    // first draw the shadow, if any
    if (shadowColor) {
        x = Math.max(shadowOffset.x, 0);
        y = Math.max(shadowOffset.y, 0);
        ctx.fillStyle = shadowColor.toString();
        ctx.fillText(txt, x, fontHeight(this.fontSize) + y);
    }

    // now draw the actual text
    x = Math.abs(Math.min(shadowOffset.x, 0));
    y = Math.abs(Math.min(shadowOffset.y, 0));
    ctx.fillStyle = this.getRenderColor().toString();

    if (this.isShowingBlanks) {
        this.renderWithBlanks(
            ctx,
            x,
            fontHeight(this.fontSize) + y
        );
    } else {
        ctx.fillText(
            txt,
            x,
            fontHeight(this.fontSize) + y
        );
    }

    // draw the selection
    start = Math.min(this.startMark, this.endMark);
    stop = Math.max(this.startMark, this.endMark);
    for (i = start; i < stop; i += 1) {
        p = this.slotPosition(i).subtract(this.position());
        c = txt.charAt(i);
        ctx.fillStyle = this.markedBackgoundColor.toString();
        ctx.fillRect(p.x, p.y, ctx.measureText(c).width + 1 + x,
            fontHeight(this.fontSize) + y);
        ctx.fillStyle = this.markedTextColor.toString();
        ctx.fillText(c, p.x, fontHeight(this.fontSize) + p.y);
    }
};

StringMorph.prototype.renderWithBlanks = function (ctx, startX, y) {
    var space = ctx.measureText(' ').width,
        blanksColor = this.blanksColor.toString(),
        top = y - this.height() / 2,
        words = this.text.split(' '),
        x = startX || 0,
        isFirst = true;

    function drawBlank() {
        ctx.fillStyle = blanksColor;
        ctx.beginPath();
        ctx.arc(
            x + space / 2,
            top,
            space / 2,
            radians(0),
            radians(360)
        );
        ctx.fill();
        x += space;
    }

    // render my text inserting blanks
    words.forEach(word => {
        if (!isFirst) {
            drawBlank();
        }
        isFirst = false;
        if (word !== '') {
            ctx.fillStyle = this.getRenderColor().toString();
            ctx.fillText(word, x, y);
            x += ctx.measureText(word).width;
        }
    });
};

// StringMorph measuring:

StringMorph.prototype.slotPosition = function (slot) {
    // answer the position point of the given index ("slot")
    // where the cursor should be placed
    var txt = this.isPassword ?
                this.password('*', this.text.length) : this.text,
        dest = Math.min(Math.max(slot, 0), txt.length);

    this.measureCtx.font = this.font();
    this.pos = dest;
    return new Point(
        this.left() + this.measureCtx.measureText(txt.slice(0, dest)).width,
        this.top()
    );
};

StringMorph.prototype.slotAt = function (aPoint) {
    // answer the slot (index) closest to the given point taking
    // in account how far from the middle of the character it is,
    // so the cursor can be moved accordingly

    var txt = this.isPassword ?
                this.password('*', this.text.length) : this.text,
        idx = 0,
        charX = 0;

    this.measureCtx.font = this.font();
    while (aPoint.x - this.left() > charX) {
        charX += this.measureCtx.measureText(txt[idx]).width;
        idx += 1;
        if (idx === txt.length) {
            if ((this.measureCtx.measureText(txt).width -
                    (this.measureCtx.measureText(txt[idx - 1]).width / 2)) <
                    (aPoint.x - this.left())) {
                return idx;
            }
        }
    }

    // see where our click fell with respect to the middle of the char
    if (aPoint.x - this.left() >
            charX - this.measureCtx.measureText(txt[idx - 1]).width / 2) {
        return idx;
    } else {
        return idx - 1;
    }
};

StringMorph.prototype.upFrom = function (slot) {
    // answer the slot above the given one
    return slot;
};

StringMorph.prototype.downFrom = function (slot) {
    // answer the slot below the given one
    return slot;
};

StringMorph.prototype.startOfLine = function () {
    // answer the first slot (index) of the line for the given slot
    return 0;
};

StringMorph.prototype.endOfLine = function () {
    // answer the slot (index) indicating the EOL for the given slot
    return this.text.length;
};

StringMorph.prototype.previousWordFrom = function (aSlot) {
    // answer the slot (index) slots indicating the position of the
    // previous word to the left of aSlot
    var index = aSlot - 1;

    // while the current character is non-word one, we skip it, so that
    // if we are in the middle of a non-alphanumeric sequence, we'll get
    // right to the beginning of the previous word
    while (index > 0 && !isWordChar(this.text[index])) {
        index -= 1;
    }

    // while the current character is a word one, we skip it until we
    // find the beginning of the current word
    while (index > 0 && isWordChar(this.text[index - 1])) {
        index -= 1;
    }

    return index;
};

StringMorph.prototype.nextWordFrom = function (aSlot) {
    var index = aSlot;

    while (index < this.endOfLine() && !isWordChar(this.text[index])) {
        index += 1;
    }

    while (index < this.endOfLine() && isWordChar(this.text[index])) {
        index += 1;
    }

    return index;
};

StringMorph.prototype.rawHeight = function () {
    // answer my corrected fontSize
    return this.height() / 1.2;
};

// StringMorph menus:

StringMorph.prototype.developersMenu = function () {
    var menu = StringMorph.uber.developersMenu.call(this);

    menu.addLine();
    menu.addItem("edit", 'edit');
    menu.addItem(
        "font size...",
        () => {
            this.prompt(
                menu.title + '\nfont\nsize:',
                this.setFontSize,
                this,
                this.fontSize.toString(),
                null,
                6,
                500,
                true
            );
        },
        'set this String\'s\nfont point size'
    );
    if (this.fontStyle !== 'serif') {
        menu.addItem("serif", 'setSerif');
    }
    if (this.fontStyle !== 'sans-serif') {
        menu.addItem("sans-serif", 'setSansSerif');
    }
    if (this.isBold) {
        menu.addItem("normal weight", 'toggleWeight');
    } else {
        menu.addItem("bold", 'toggleWeight');
    }
    if (this.isItalic) {
        menu.addItem("normal style", 'toggleItalic');
    } else {
        menu.addItem("italic", 'toggleItalic');
    }
    if (this.isShowingBlanks) {
        menu.addItem("hide blanks", 'toggleShowBlanks');
    } else {
        menu.addItem("show blanks", 'toggleShowBlanks');
    }
    if (this.isPassword) {
        menu.addItem("show characters", 'toggleIsPassword');
    } else {
        menu.addItem("hide characters", 'toggleIsPassword');
    }
    return menu;
};

StringMorph.prototype.toggleIsDraggable = function () {
    // for context menu demo purposes
    this.isDraggable = !this.isDraggable;
    if (this.isDraggable) {
        this.disableSelecting();
    } else {
        this.enableSelecting();
    }
};

StringMorph.prototype.toggleShowBlanks = function () {
    this.isShowingBlanks = !this.isShowingBlanks;
    this.changed();
    this.fixLayout();
    this.rerender();
};

StringMorph.prototype.toggleWeight = function () {
    this.isBold = !this.isBold;
    this.changed();
    this.fixLayout();
    this.rerender();
};

StringMorph.prototype.toggleItalic = function () {
    this.isItalic = !this.isItalic;
    this.changed();
    this.fixLayout();
    this.rerender();
};

StringMorph.prototype.toggleIsPassword = function () {
    this.isPassword = !this.isPassword;
    this.changed();
    this.fixLayout();
    this.rerender();
};

StringMorph.prototype.setSerif = function () {
    this.fontStyle = 'serif';
    this.changed();
    this.fixLayout();
    this.rerender();
};

StringMorph.prototype.setSansSerif = function () {
    this.fontStyle = 'sans-serif';
    this.changed();
    this.fixLayout();
    this.rerender();
};

StringMorph.prototype.setFontSize = function (size) {
    // for context menu demo purposes
    var newSize;
    if (typeof size === 'number') {
        this.fontSize = Math.round(Math.min(Math.max(size, 4), 500));
    } else {
        newSize = parseFloat(size);
        if (!isNaN(newSize)) {
            this.fontSize = Math.round(
                Math.min(Math.max(newSize, 4), 500)
            );
        }
    }
    this.changed();
    this.fixLayout();
    this.rerender();
};

StringMorph.prototype.setText = function (size) {
    // for context menu demo purposes
    this.text = Math.round(size).toString();
    this.changed();
    this.fixLayout();
    this.rerender();
};

StringMorph.prototype.numericalSetters = function () {
    // for context menu demo purposes
    return [
        'setLeft',
        'setTop',
        'setAlphaScaled',
        'setFontSize',
        'setText'
    ];
};

// StringMorph editing:

StringMorph.prototype.edit = function () {
    this.root().edit(this);
};

StringMorph.prototype.selection = function () {
    var start, stop;
    start = Math.min(this.startMark, this.endMark);
    stop = Math.max(this.startMark, this.endMark);
    return this.text.slice(start, stop);
};

StringMorph.prototype.selectionStartSlot = function () {
    return Math.min(this.startMark, this.endMark);
};

StringMorph.prototype.clearSelection = function () {
    if (!this.currentlySelecting &&
            isNil(this.startMark) &&
            isNil(this.endMark)) {
        return;
    }
    this.currentlySelecting = false;
    this.startMark = null;
    this.endMark = null;
    this.changed();
};

StringMorph.prototype.deleteSelection = function () {
    var start, stop, text;
    text = this.text;
    start = Math.min(this.startMark, this.endMark);
    stop = Math.max(this.startMark, this.endMark);
    this.text = text.slice(0, start) + text.slice(stop);
    this.changed();
    this.clearSelection();
};

StringMorph.prototype.selectAll = function () {
    var cursor;
    if (this.isEditable) {
        this.startMark = 0;
        cursor = this.root().cursor;
        this.endMark = this.text.length;
        if (cursor) {
            cursor.gotoSlot(this.text.length);
            cursor.syncTextareaSelectionWith(this);
        }
        this.fixLayout();
        this.rerender();
    }
};

StringMorph.prototype.mouseDownLeft = function (pos) {
    if (this.world().currentKey === 16) {
        this.shiftClick(pos);
    } else if (this.isEditable) {
        this.clearSelection();
    } else {
        this.escalateEvent('mouseDownLeft', pos);
    }
};

StringMorph.prototype.shiftClick = function (pos) {
    var cursor = this.root().cursor;

    if (cursor) {
        if (!this.startMark) {
            this.startMark = cursor.slot;
        }
        cursor.gotoPos(pos);
        this.endMark = cursor.slot;
        cursor.syncTextareaSelectionWith(this);
        this.changed();
    }
    this.currentlySelecting = false;
    this.escalateEvent('mouseDownLeft', pos);
};

StringMorph.prototype.mouseClickLeft = function (pos) {
    var cursor,
        slot,
        clickedText,
        startMark,
        endMark;

    if (this.isEditable) {
        if (!this.currentlySelecting) {
            this.edit(); // creates a new cursor
        }
        cursor = this.root().cursor;
        if (cursor) {
            cursor.gotoPos(pos);
        }
        this.currentlySelecting = true;
    } else if (this.enableLinks) {
        slot = this.slotAt(pos);
        if (slot === this.text.length) {
            slot -= 1;
        }
        startMark = slot;
        while (startMark > 1 && isURLChar(this.text[startMark-1])) {
            startMark -= 1;
        }
        endMark = slot;
        while (endMark < this.text.length - 1 &&
                isURLChar(this.text[endMark + 1])) {
            endMark += 1;
        }
        clickedText = this.text.substring(startMark, endMark + 1);
        if (isURL(clickedText)) {
            window.open(clickedText, '_blank');
        } else {
            this.escalateEvent('mouseClickLeft', pos);
        }
    } else {
        this.escalateEvent('mouseClickLeft', pos);
    }
};

StringMorph.prototype.mouseDoubleClick = function (pos) {
    // selects the word at pos
    // if there is no word, we select whatever is between
    // the previous and next words
    var slot = this.slotAt(pos);

    if (this.isEditable) {
        this.edit();

        if (slot === this.text.length) {
            slot -= 1;
        }

        if (this.text[slot] && isWordChar(this.text[slot])) {
            this.selectWordAt(slot);
        } else if (this.text[slot]) {
            this.selectBetweenWordsAt(slot);
        } else {
            // special case for when we click right after the
            // last slot in multi line TextMorphs
            this.selectAll();
        }
        this.root().cursor.syncTextareaSelectionWith(this);
    } else {
        this.escalateEvent('mouseDoubleClick', pos);
    }
};

StringMorph.prototype.selectWordAt = function (slot) {
    var cursor = this.root().cursor;

    if (slot === 0 || isWordChar(this.text[slot - 1])) {
        cursor.gotoSlot(this.previousWordFrom(slot));
        this.startMark = cursor.slot;
        this.endMark = this.nextWordFrom(cursor.slot);
    } else {
        cursor.gotoSlot(slot);
        this.startMark = slot;
        this.endMark = this.nextWordFrom(slot);
    }
    this.changed();
};

StringMorph.prototype.selectBetweenWordsAt = function (slot) {
    var cursor = this.root().cursor;

    cursor.gotoSlot(this.nextWordFrom(this.previousWordFrom(slot)));
    this.startMark = cursor.slot;
    this.endMark = cursor.slot;

    while (this.endMark < this.text.length
            && !isWordChar(this.text[this.endMark])) {
        this.endMark += 1;
    }
    this.changed();
};

StringMorph.prototype.enableSelecting = function () {
    this.mouseDownLeft = function (pos) {
        var crs = this.root().cursor,
            already = crs ? crs.target === this : false;
        if (this.world().currentKey === 16) {
            this.shiftClick(pos);
        } else {
            this.clearSelection();
            if (this.isEditable && (!this.isDraggable)) {
                this.edit();
                this.root().cursor.gotoPos(pos);
                this.startMark = this.slotAt(pos);
                this.endMark = this.startMark;
                this.currentlySelecting = true;
                this.root().cursor.syncTextareaSelectionWith(this);
                if (!already) {this.escalateEvent('mouseDownLeft', pos); }
            }
        }
    };
    this.mouseMove = function (pos) {
        if (this.isEditable &&
                this.currentlySelecting &&
                (!this.isDraggable)) {
            var newMark = this.slotAt(pos);
            if (newMark !== this.endMark) {
                this.endMark = newMark;
                this.root().cursor.syncTextareaSelectionWith(this);
                this.changed();
            }
        }
    };
};

StringMorph.prototype.disableSelecting = function () {
    this.mouseDownLeft = StringMorph.prototype.mouseDownLeft;
    delete this.mouseMove;
};

// TextMorph ////////////////////////////////////////////////////////////////

// I am a multi-line, word-wrapping String, quasi-inheriting from StringMorph

// TextMorph inherits from Morph:

TextMorph.prototype = new Morph;
TextMorph.prototype.constructor = TextMorph;
TextMorph.uber = Morph.prototype;

// TextMorph shared properties:

// context for measuring text dimensions, shared with StringMorph prototype
TextMorph.prototype.measureCtx = StringMorph.prototype.measureCtx;

// TextMorph instance creation:

function TextMorph(
    text,
    fontSize,
    fontStyle,
    bold,
    italic,
    alignment,
    width,
    fontName,
    shadowOffset,
    shadowColor
) {
    this.init(text,
        fontSize,
        fontStyle,
        bold,
        italic,
        alignment,
        width,
        fontName,
        shadowOffset,
        shadowColor);
};

TextMorph.prototype.init = function (
    text,
    fontSize,
    fontStyle,
    bold,
    italic,
    alignment,
    width,
    fontName,
    shadowOffset,
    shadowColor
) {
    // additional properties:
    this.text = text || (text === '' ? text : 'TextMorph');
    this.words = [];
    this.lines = [];
    this.lineSlots = [];
    this.fontSize = (fontSize || 12);
    this.isBold = bold || false;
    this.isItalic = italic || false;
    this.acceptedFontName = (fontName || MorphicPreferences.globalFontFamily);
    this.fontName = (this.acceptedFontName.toString()).concat((this.isBold || this.isItalic
    ) ? (this.isBold ? 'Bold' : '').concat(this.isItalic ? 'Italic' : '') : 'Regular');
    this.fontStyle = fontStyle || 'sans-serif';
    this.alignment = alignment || 'left';
    this.shadowOffset = shadowOffset || ZERO;
    this.shadowColor = shadowColor || null;
    this.maxWidth = width || 0;
    this.maxLineWidth = 0;
    this.backgroundColor = null;
    this.isEditable = false;
    this.enableLinks = false; // set to "true" if I can contain clickable URLs

    //additional properties for ad-hoc evaluation:
    this.receiver = null;

    // additional properties for text-editing:
    this.isScrollable = true; // scrolls into view when edited
    this.currentlySelecting = false;
    this.startMark = 0;
    this.endMark = 0;
    this.markedTextColor = WHITE;
    this.markedBackgoundColor = new Color(60, 60, 120);

    // initialize inherited properties:
    TextMorph.uber.init.call(this);
    
    // override inherited properites:
    this._autoCursor = true;
    this.color = BLACK;
    this.fixLayout(); // determine my extent
};

TextMorph.prototype.toString = function () {
    // e.g. 'a TextMorph("Hello World")'
    return 'a TextMorph' + '("' + this.text.slice(0, 30) + '...")';
};

Object.defineProperty(TextMorph.prototype, 'cursorStyle', {
    get() {
        return this._cursorStyle || null;
    },

    set(style) {
        this._cursorStyle = style;
        this._autoCursor = false;
    }
});

Object.defineProperty(TextMorph.prototype, 'cursorGrabStyle', {
    get() {
        return this._cursorGrabStyle || null;
    },

    set(style) {
        this._cursorGrabStyle = style;
        this._autoCursor = false;
    }
});

TextMorph.prototype.getRenderColor = StringMorph.prototype.getRenderColor;

TextMorph.prototype.font = StringMorph.prototype.font;

TextMorph.prototype.parse = function () {
    var paragraphs = this.text.split('\n'),
        context = this.measureCtx,
        oldline = '',
        newline,
        w,
        slot = 0;

    context.font = this.font();
    this.maxLineWidth = 0;
    this.lines = [];
    this.lineSlots = [0];
    this.words = [];

    paragraphs.forEach(p => {
        this.words = this.words.concat(p.split(' '));
        this.words.push('\n');
    });

    this.words.forEach(word => {
        if (word === '\n') {
            this.lines.push(oldline);
            this.lineSlots.push(slot);
            this.maxLineWidth = Math.max(
                this.maxLineWidth,
                context.measureText(
                    this.parent ? (((this.parent.constructor.name === 'TextSlotMorph')
                    && (!(this.isItalic))) ? oldline.slice(0, -1) : oldline) : oldline
                ).width
            );
            oldline = '';
        } else {
            if (this.maxWidth > 0) {
                newline = oldline + word + ' ';
                w = context.measureText(newline).width;
                if (w > this.maxWidth) {
                    this.lines.push(oldline);
                    this.lineSlots.push(slot);
                    this.maxLineWidth = Math.max(
                        this.maxLineWidth,
                        context.measureText(oldline).width
                    );
                    oldline = word + ' ';
                    w = context.measureText(word).width;
                    if (w > this.maxWidth) {
                        oldline = '';
                        word.split('').forEach((letter, idx) => {
                            w = context.measureText(oldline + letter).width;
                            if (w > this.maxWidth && oldline.length) {
                                this.lines.push(oldline);
                                this.lineSlots.push(slot + idx);
                                this.maxLineWidth = Math.max(
                                    this.maxLineWidth,
                                    context.measureText(oldline).width
                                );
                                oldline = '';
                            }
                            oldline += letter;
                        });
                    } else {
                        oldline = word + ' ';
                    };
                } else {
                    oldline = newline;
                }
            } else {
                oldline = oldline + word + ' ';
            }
            slot += word.length + 1;
        }
    });
};

TextMorph.prototype.fixLayout = function () {
    this.fontName = ((this.acceptedFontName || MorphicPreferences.globalFontFamily
    ).toString()).concat((this.isBold || this.isItalic) ? (this.isBold ? 'Bold' : ''
    ).concat(this.isItalic ? 'Italic' : '') : 'Regular');

    // determine my extent depending on my current settings
    var height, shadowHeight, shadowWidth;

    this.parse();

    // set my extent
    shadowWidth = Math.abs(this.shadowOffset.x);
    shadowHeight = Math.abs(this.shadowOffset.y);
    height = this.lines.length * (fontHeight(this.fontSize) + shadowHeight);
    if (this.maxWidth === 0) {
        this.bounds = this.bounds.origin.extent(
            new Point(this.maxLineWidth + shadowWidth, height)
        );
    } else {
        this.bounds = this.bounds.origin.extent(
            new Point(this.maxWidth + shadowWidth, height)
        );
    }

    // notify my parent of layout change
    if (this.parent) {
        if (this.parent.layoutChanged) {
            this.parent.layoutChanged();
        };
    };
    
    if (this._autoCursor && this.cursorStyle == null && this.isEditable) {
        this.cursorStyle = 'text';
        this.cursorGrabStyle = 'grabbing';
        this._autoCursor = true;
    };
};

TextMorph.prototype.render = function (ctx) {
    var shadowWidth = Math.abs(this.shadowOffset.x),
        shadowHeight = Math.abs(this.shadowOffset.y),
        shadowColor = this.getShadowRenderColor(),
        i, line, width, offx, offy, x, y, start, stop, p, c;

    // prepare context for drawing text
    ctx.font = this.font();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    // fill the background, if desired
    if (this.backgroundColor) {
        ctx.fillStyle = this.backgroundColor.toString();
        ctx.fillRect(0, 0, this.width(), this.height());
    }

    // draw the shadow, if any
    if (shadowColor) {
        offx = Math.max(this.shadowOffset.x, 0);
        offy = Math.max(this.shadowOffset.y, 0);
        ctx.fillStyle = shadowColor.toString();

        for (i = 0; i < this.lines.length; i = i + 1) {
            line = this.lines[i];
            width = ctx.measureText(line).width + shadowWidth;
            if (this.alignment === 'right') {
                x = this.width() - width;
            } else if (this.alignment === 'center') {
                x = (this.width() - width) / 2;
            } else { // 'left'
                x = 0;
            }
            y = (i + 1) * (fontHeight(this.fontSize) + shadowHeight)
                - shadowHeight;
            ctx.fillText(line, x + offx, y + offy);
        }
    }

    // now draw the actual text
    offx = Math.abs(Math.min(this.shadowOffset.x, 0));
    offy = Math.abs(Math.min(this.shadowOffset.y, 0));
    ctx.fillStyle = this.getRenderColor().toString();

    for (i = 0; i < this.lines.length; i = i + 1) {
        line = this.lines[i];
        width = ctx.measureText(line).width + shadowWidth;
        if (this.alignment === 'right') {
            x = this.width() - width;
        } else if (this.alignment === 'center') {
            x = (this.width() - width) / 2;
        } else { // 'left'
            x = 0;
        }
        y = (i + 1) * (fontHeight(this.fontSize) + shadowHeight) - shadowHeight;
        ctx.fillText(line, x + offx, y + offy);
    }

    // draw the selection
    start = Math.min(this.startMark, this.endMark);
    stop = Math.max(this.startMark, this.endMark);
    for (i = start; i < stop; i += 1) {
        p = this.slotPosition(i).subtract(this.position());
        c = this.text.charAt(i);
        ctx.fillStyle = this.markedBackgoundColor.toString();
        ctx.fillRect(p.x, p.y, ctx.measureText(c).width + 1,
            fontHeight(this.fontSize));
        ctx.fillStyle = this.markedTextColor.toString();
        ctx.fillText(c, p.x, p.y + fontHeight(this.fontSize));
    }
};

TextMorph.prototype.getShadowRenderColor =
    StringMorph.prototype.getShadowRenderColor;

TextMorph.prototype.setExtent = function (aPoint) {
    this.maxWidth = Math.max(aPoint.x, 0);
    this.changed();
    this.fixLayout();
    this.rerender();
};

// TextMorph mesuring:

TextMorph.prototype.columnRow = function (slot) {
    // answer the logical position point of the given index ("slot")
    var row,
        col,
        idx = 0;

    for (row = 0; row < this.lines.length; row += 1) {
        idx = this.lineSlots[row];
        for (col = 0; col < this.lines[row].length; col += 1) {
            if (idx === slot) {
                return new Point(col, row);
            }
            idx += 1;
        }
    }
    // return new Point(0, 0);
    return new Point(
        this.lines[this.lines.length - 1].length - 1,
        this.lines.length - 1
    );
};

TextMorph.prototype.slotPosition = function (slot) {
    // answer the physical position point of the given index ("slot")
    // where the cursor should be placed
    var colRow = this.columnRow(slot),
        ctx = this.measureCtx,
        shadowHeight = Math.abs(this.shadowOffset.y),
        xOffset = 0,
        yOffset;

    ctx.font = this.font();
    yOffset = colRow.y * (fontHeight(this.fontSize) + shadowHeight);
    xOffset = ctx.measureText(this.lines[colRow.y].slice(0, colRow.x)).width;
    return new Point(this.left() + xOffset, this.top() + yOffset);
};

TextMorph.prototype.slotAt = function (aPoint) {
    // answer the slot (index) closest to the given point taking
    // in account how far from the middle of the character it is,
    // so the cursor can be moved accordingly
    var charX,
        row = 0,
        col = 0,
        columnLength,
        shadowHeight = Math.abs(this.shadowOffset.y),
        ctx = this.measureCtx,
        textWidth;

    while (aPoint.y - this.top() >
            ((fontHeight(this.fontSize) + shadowHeight) * row)) {
        row += 1;
    }
    row = Math.max(row, 1);

    ctx.font = this.font();
    textWidth = ctx.measureText(this.lines[row - 1]).width;
    if (this.alignment === 'right') {
        charX = this.width() - textWidth;
    } else if (this.alignment === 'center') {
        charX = (this.width() - textWidth) / 2;
    } else { // 'left'
        charX = 0;
    }
    columnLength = this.lines[row - 1].length;
    while (col < columnLength - 1 && aPoint.x - this.left() > charX) {
        charX += ctx.measureText(this.lines[row - 1][col]).width;
        col += 1;
    }

    // see where our click fell with respect to the middle of the char
    if (aPoint.x - this.left() >
            charX - ctx.measureText(this.lines[row - 1][col]).width / 2) {
        return this.lineSlots[Math.max(row - 1, 0)] + col;
    } else {
        return this.lineSlots[Math.max(row - 1, 0)] + col - 1;
    }
};

TextMorph.prototype.upFrom = function (slot) {
    // answer the slot above the given one
    var above,
        colRow = this.columnRow(slot);
    if (colRow.y < 1) {
        return slot;
    }
    above = this.lines[colRow.y - 1];
    if (above.length < colRow.x - 1) {
        return this.lineSlots[colRow.y - 1] + above.length;
    }
    return this.lineSlots[colRow.y - 1] + colRow.x;
};

TextMorph.prototype.downFrom = function (slot) {
    // answer the slot below the given one
    var below,
        colRow = this.columnRow(slot);
    if (colRow.y > this.lines.length - 2) {
        return slot;
    }
    below = this.lines[colRow.y + 1];
    if (below.length < colRow.x - 1) {
        return this.lineSlots[colRow.y + 1] + below.length;
    }
    return this.lineSlots[colRow.y + 1] + colRow.x;
};

TextMorph.prototype.startOfLine = function (slot) {
    // answer the first slot (index) of the line for the given slot
    return this.lineSlots[this.columnRow(slot).y];
};

TextMorph.prototype.endOfLine = function (slot) {
    // answer the slot (index) indicating the EOL for the given slot
    return this.startOfLine(slot) +
        this.lines[this.columnRow(slot).y].length - 1;
};

TextMorph.prototype.previousWordFrom = StringMorph.prototype.previousWordFrom;

TextMorph.prototype.nextWordFrom = StringMorph.prototype.nextWordFrom;

// TextMorph editing:

TextMorph.prototype.edit = StringMorph.prototype.edit;

TextMorph.prototype.selection = StringMorph.prototype.selection;

TextMorph.prototype.selectionStartSlot
    = StringMorph.prototype.selectionStartSlot;

TextMorph.prototype.clearSelection = StringMorph.prototype.clearSelection;

TextMorph.prototype.deleteSelection = StringMorph.prototype.deleteSelection;

TextMorph.prototype.selectAll = StringMorph.prototype.selectAll;

TextMorph.prototype.mouseDownLeft = StringMorph.prototype.mouseDownLeft;

TextMorph.prototype.shiftClick = StringMorph.prototype.shiftClick;

TextMorph.prototype.mouseClickLeft = StringMorph.prototype.mouseClickLeft;

TextMorph.prototype.mouseDoubleClick = StringMorph.prototype.mouseDoubleClick;

TextMorph.prototype.selectWordAt = StringMorph.prototype.selectWordAt;

TextMorph.prototype.selectBetweenWordsAt
    = StringMorph.prototype.selectBetweenWordsAt;

TextMorph.prototype.enableSelecting = StringMorph.prototype.enableSelecting;

TextMorph.prototype.disableSelecting = StringMorph.prototype.disableSelecting;

TextMorph.prototype.selectAllAndEdit = function () {
    this.edit();
    this.selectAll();
};

// TextMorph menus:

TextMorph.prototype.developersMenu = function () {
    var menu = TextMorph.uber.developersMenu.call(this);
    menu.addLine();
    menu.addItem("edit", 'edit');
    menu.addItem(
        "font size...",
        () => {
            this.prompt(
                menu.title + '\nfont\nsize:',
                this.setFontSize,
                this,
                this.fontSize.toString(),
                null,
                6,
                100,
                true
            );
        },
        'set this Text\'s\nfont point size'
    );
    if (this.alignment !== 'left') {
        menu.addItem("align left", 'setAlignmentToLeft');
    }
    if (this.alignment !== 'right') {
        menu.addItem("align right", 'setAlignmentToRight');
    }
    if (this.alignment !== 'center') {
        menu.addItem("align center", 'setAlignmentToCenter');
    }
    menu.addLine();
    if (this.fontStyle !== 'serif') {
        menu.addItem("serif", 'setSerif');
    }
    if (this.fontStyle !== 'sans-serif') {
        menu.addItem("sans-serif", 'setSansSerif');
    }
    if (this.isBold) {
        menu.addItem("normal weight", 'toggleWeight');
    } else {
        menu.addItem("bold", 'toggleWeight');
    }
    if (this.isItalic) {
        menu.addItem("normal style", 'toggleItalic');
    } else {
        menu.addItem("italic", 'toggleItalic');
    }
    return menu;
};

TextMorph.prototype.setAlignmentToLeft = function () {
    this.alignment = 'left';
    this.rerender();
};

TextMorph.prototype.setAlignmentToRight = function () {
    this.alignment = 'right';
    this.rerender();
};

TextMorph.prototype.setAlignmentToCenter = function () {
    this.alignment = 'center';
    this.rerender();
};

TextMorph.prototype.toggleIsDraggable
    = StringMorph.prototype.toggleIsDraggable;

TextMorph.prototype.toggleWeight = StringMorph.prototype.toggleWeight;

TextMorph.prototype.toggleItalic = StringMorph.prototype.toggleItalic;

TextMorph.prototype.setSerif = StringMorph.prototype.setSerif;

TextMorph.prototype.setSansSerif = StringMorph.prototype.setSansSerif;

TextMorph.prototype.setText = StringMorph.prototype.setText;

TextMorph.prototype.setFontSize = StringMorph.prototype.setFontSize;

TextMorph.prototype.numericalSetters = StringMorph.prototype.numericalSetters;

// TextMorph evaluation:

TextMorph.prototype.evaluationMenu = function () {
    var menu = new MenuMorph(this, null);
    menu.addItem(
        "do it",
        'doIt',
        'evaluate the\nselected expression'
    );
    menu.addItem(
        "show it",
        'showIt',
        'evaluate the\nselected expression\nand show the result'
    );
    menu.addItem(
        "inspect it",
        'inspectIt',
        'evaluate the\nselected expression\nand inspect the result'
    );
    menu.addLine();
    menu.addItem("select all", 'selectAllAndEdit');
    return menu;
};

TextMorph.prototype.setReceiver = function (obj) {
    this.receiver = obj;
    this.customContextMenu = this.evaluationMenu();
};

TextMorph.prototype.doIt = function () {
    this.receiver.evaluateString(this.selection());
    this.edit();
};

TextMorph.prototype.showIt = function () {
    var result = this.receiver.evaluateString(this.selection());
    if (result !== null) {
        this.inform(result);
    }
};

TextMorph.prototype.inspectIt = function () {
    var result = this.receiver.evaluateString(this.selection()),
        world = this.world(),
        inspector;
    if (isObject(result)) {
        inspector = new InspectorMorph(result);
        inspector.setPosition(world.hand.position());
        inspector.keepWithin(world);
        world.add(inspector);
        inspector.changed();
    }
};

// TriggerMorph ////////////////////////////////////////////////////////

// I provide basic button functionality

// TriggerMorph inherits from Morph:

TriggerMorph.prototype = new Morph();
TriggerMorph.prototype.constructor = TriggerMorph;
TriggerMorph.uber = Morph.prototype;

// TriggerMorph instance creation:

function TriggerMorph(
    target,
    action,
    labelString,
    fontSize,
    fontStyle,
    environment,
    hint,
    labelColor,
    labelBold,
    labelItalic,
    doubleClickAction
) {
    this.init(
        target,
        action,
        labelString,
        fontSize,
        fontStyle,
        environment,
        hint,
        labelColor,
        labelBold,
        labelItalic,
        doubleClickAction
    );
}

TriggerMorph.prototype.init = function (
    target,
    action,
    labelString,
    fontSize,
    fontStyle,
    environment,
    hint,
    labelColor,
    labelBold,
    labelItalic,
    doubleClickAction
) {
    // additional properties:
    this.target = target || null;
    this.action = action === 0 ? 0 : action|| null;
    this.doubleClickAction = doubleClickAction || null;
    this.environment = environment || null;
    this.labelString = labelString || ' ';
    this.label = null;
    this.hint = hint || null; // null, String, or Function
    this.schedule = null; // animation slot for displaying hints
    this.fontSize = fontSize || MorphicPreferences.menuFontSize;
    this.fontStyle = fontStyle || 'sans-serif';
    this.highlightColor = new Color(192, 192, 192);
    this.pressColor = new Color(128, 128, 128);
    this.labelColor = labelColor || BLACK;
    this.labelBold = labelBold || false;
    this.labelItalic = labelItalic || false;
    this.userState = 'normal'; // 'highlight', 'pressed'

    // initialize inherited properties:
    TriggerMorph.uber.init.call(this);

    // override inherited properites:
    this.color = WHITE;
    this.createLabel();
};

// TriggerMorph drawing:

TriggerMorph.prototype.render = function (ctx) {
    var colorBak = this.color;
    if (this.userState === 'highlight') {
        this.color = this.highlightColor;
    } else if (this.userState === 'pressed') {
        this.color = this.pressColor;
    }
    TriggerMorph.uber.render.call(this, ctx);
    this.color = colorBak;
};

TriggerMorph.prototype.createLabel = function () {
    if (this.label !== null) {
        this.label.destroy();
    }
    this.label = new StringMorph(
        this.labelString,
        this.fontSize,
        this.fontStyle,
        this.labelBold,
        this.labelItalic,
        false, // numeric
        null, // shadow offset
        null, // shadow color
        this.labelColor
    );
    this.fixLayout();
    this.add(this.label);
};

TriggerMorph.prototype.fixLayout = function () {
    this.label.setPosition(
        this.center().subtract(
            this.label.extent().divideBy(2)
        )
    );
};

// TriggerMorph action:

TriggerMorph.prototype.trigger = function () {
    /*
    if target is a function, use it as callback:
    execute target as callback function with action as argument
    in the environment as optionally specified.
    Note: if action is also a function, instead of becoming
    the argument itself it will be called to answer the argument.
    for selections, Yes/No Choices etc. As second argument pass
    myself, so I can be modified to reflect status changes, e.g.
    inside a list box:

    else (if target is not a function):

        if action is a function:
        execute the action with target as environment (can be null)
        for lambdafied (inline) actions

        else if action is a String:
        treat it as function property of target and execute it
        for selector-like actions
    */
    if (this.schedule) {
        this.schedule.isActive = false;
    }
    if (typeof this.target === 'function') {
        if (typeof this.action === 'function') {
            this.target.call(this.environment, this.action.call(), this);
        } else {
            this.target.call(this.environment, this.action, this);
        }
    } else {
        if (typeof this.action === 'function') {
            this.action.call(this.target);
        } else { // assume it's a String
            this.target[this.action]();
        }
    }
};

TriggerMorph.prototype.triggerDoubleClick = function () {
    // same as trigger() but use doubleClickAction instead of action property
    // note that specifying a doubleClickAction is optional
    if (!this.doubleClickAction) {return; }
    if (this.schedule) {
        this.schedule.isActive = false;
    }
    if (typeof this.target === 'function') {
        if (typeof this.doubleClickAction === 'function') {
            this.target.call(
                this.environment,
                this.doubleClickAction.call(),
                this
            );
        } else {
            this.target.call(this.environment, this.doubleClickAction, this);
        }
    } else {
        if (typeof this.doubleClickAction === 'function') {
            this.doubleClickAction.call(this.target);
        } else { // assume it's a String
            this.target[this.doubleClickAction]();
        }
    }
};

// TriggerMorph events:

TriggerMorph.prototype.mouseEnter = function () {
    var contents = this.hint instanceof Function ? this.hint() : this.hint;
    this.userState = 'highlight';
    this.rerender();
    if (contents) {
        this.bubbleHelp(contents);
    }
};

TriggerMorph.prototype.mouseLeave = function () {
    this.userState = 'normal';
    this.rerender();
    if (this.schedule) {
        this.schedule.isActive = false;
    }
    if (this.hint) {
        this.world().hand.destroyTemporaries();
    }
};

TriggerMorph.prototype.mouseDownLeft = function () {
    this.userState = 'pressed';
    this.rerender();
};

TriggerMorph.prototype.mouseClickLeft = function () {
    this.userState = 'highlight';
    this.rerender();
    this.trigger();
};

TriggerMorph.prototype.mouseDoubleClick = function () {
    this.triggerDoubleClick();
};

TriggerMorph.prototype.rootForGrab = function () {
    return this.isDraggable ? TriggerMorph.uber.rootForGrab.call(this) : null;
};

// TriggerMorph bubble help:

TriggerMorph.prototype.bubbleHelp = function (contents) {
    var world = this.world();
    this.schedule = new Animation(
        nop,
        nop,
        0,
        500,
        nop,
        () => this.popUpbubbleHelp(contents)
    );
    world.animations.push(this.schedule);
};

TriggerMorph.prototype.popUpbubbleHelp = function (contents) {
    new SpeechBubbleMorph(
        localize(contents),
        null,
        null,
        1
    ).popUp(this.world(), this.rightCenter().add(new Point(-8, 0)));
};

// MenuItemMorph ///////////////////////////////////////////////////////

// I automatically determine my bounds

var MenuItemMorph;

// MenuItemMorph inherits from TriggerMorph:

MenuItemMorph.prototype = new TriggerMorph;
MenuItemMorph.prototype.constructor = MenuItemMorph;
MenuItemMorph.uber = TriggerMorph.prototype;

// MenuItemMorph instance creation:

function MenuItemMorph(
    target,
    action,
    labelString, // can also be a Morph or a Canvas or a tuple: [icon, string]
    fontSize,
    fontStyle,
    environment,
    hint,
    color,
    bold,
    italic,
    doubleClickAction, // optional when used as list morph item
    shortcut // optional string, Morph, Canvas or tuple: [icon, string]
) {
    // additional properties:
    this.shortcutString = shortcut || null;
    this.shortcut = null;

    // initialize inherited properties:
    this.init(
        target,
        action,
        labelString,
        fontSize,
        fontStyle,
        environment,
        hint,
        color,
        bold,
        italic,
        doubleClickAction
    ); this.cursorStyle = 'pointer';
}

MenuItemMorph.prototype.createLabel = function () {
    var w, h;
    if (this.label) {
        this.label.destroy();
    }
    this.label = this.createLabelPart(this.labelString);
    this.add(this.label);
    w = this.label.width();
    h = this.label.height();
    if (this.shortcut) {
        this.shortcut.destroy();
    }
    if (this.shortcutString) {
        this.shortcut = this.createLabelPart(this.shortcutString);
        w += this.shortcut.width() + 4;
        h = Math.max(h, this.shortcut.height());
        this.add(this.shortcut);
    }
    this.setExtent(new Point(w + 8, h));
};

MenuItemMorph.prototype.fixLayout = function () {
    var cntr = this.center();
    this.label.setCenter(cntr);
    this.label.setLeft(this.left() + 4);
    if (this.shortcut) {
        this.shortcut.setCenter(cntr);
        this.shortcut.setRight(this.right() - 4);
    }
};

MenuItemMorph.prototype.createLabelPart = function (source) {
    var part, icon, lbl;
    if (isString(source)) {
        return this.createLabelString(source);
    }
    if (source instanceof Array) {
        // assume its pattern is: [icon, string]
        part = new Morph();
        part.alpha = 0; // transparent
        icon = this.createIcon(source[0]);
        part.add(icon);
        lbl = this.createLabelString(source[1]);
        part.add(lbl);
        lbl.setCenter(icon.center());
        lbl.setLeft(icon.right() + 4);
        part.bounds = (icon.bounds.merge(lbl.bounds));
        part.rerender();
        return part;
    }
    // assume it's either a Morph or a Canvas
    return this.createIcon(source);
};

MenuItemMorph.prototype.createIcon = function (source) {
    // source can be either a Morph or an HTMLCanvasElement
    var icon;

    if (source instanceof Morph) {
        return source.fullCopy();
    }
    // assume a Canvas
    icon = new Morph();
    icon.isCachingImage = true;
    icon.cachedImage = source; // should we copy the canvas?
    icon.bounds.setWidth(source.width);
    icon.bounds.setHeight(source.height);
    return icon;
};

MenuItemMorph.prototype.createLabelString = function (string) {
    var lbl = new TextMorph(
        string,
        this.fontSize,
        this.fontStyle,
        this.labelBold,
        this.labelItalic
    );
    lbl.setColor(this.labelColor);
    return lbl;
};

// MenuItemMorph events:

MenuItemMorph.prototype.mouseEnter = function () {
    var menu = this.parentThatIsA(MenuMorph);
    if (this.isShowingSubmenu()) {
        return;
    }
    if (menu) {
        menu.closeSubmenu();
    }
    if (!this.isListItem()) {
        this.userState = 'highlight';
        this.rerender();
    }
    if (this.action instanceof MenuMorph) {
        this.delaySubmenu();
    } else if (this.hint) {
        this.bubbleHelp(this.hint);
    }
};

MenuItemMorph.prototype.mouseLeave = function () {
    if (!this.isListItem()) {
        if (this.isShowingSubmenu()) {
            this.userState = 'highlight';
        } else {
            this.userState = 'normal';
        }
        this.rerender();
    }
    if (this.schedule) {
        this.schedule.isActive = false;
    }
    if (this.hint) {
        this.world().hand.destroyTemporaries();
    }
};

MenuItemMorph.prototype.mouseDownLeft = function (pos) {
    if (this.isListItem()) {
        this.parentThatIsA(MenuMorph).unselectAllItems();
        this.escalateEvent('mouseDownLeft', pos);
    }
    this.userState = 'pressed';
    this.rerender();
};

MenuItemMorph.prototype.mouseMove = function () {
    if (this.isListItem()) {
        this.escalateEvent('mouseMove');
    }
};

MenuItemMorph.prototype.mouseClickLeft = function () {
    if (this.action instanceof MenuMorph) {
        this.popUpSubmenu();
    } else {
        if (!this.isListItem()) {
            this.parentThatIsA(MenuMorph).closeRootMenu();
            this.world().activeMenu = null;
        }
        this.trigger();
    }
};

MenuItemMorph.prototype.isListItem = function () {
	var menu = this.parentThatIsA(MenuMorph);
    if (menu) {
        return menu.isListContents;
    }
    return false;
};

MenuItemMorph.prototype.isSelectedListItem = function () {
    if (this.isListItem()) {
        return this.userState === 'pressed';
    }
    return false;
};

MenuItemMorph.prototype.isShowingSubmenu = function () {
    var menu = this.parentThatIsA(MenuMorph);
    if (menu && (this.action instanceof MenuMorph)) {
        return menu.submenu === this.action;
    }
    return false;
};

// MenuItemMorph submenus:

MenuItemMorph.prototype.delaySubmenu = function () {
    var world = this.world();
    this.schedule = new Animation(
        nop,
        nop,
        0,
        500,
        nop,
        () => this.popUpSubmenu()
    );
    world.animations.push(this.schedule);
};

MenuItemMorph.prototype.popUpSubmenu = function () {
    var menu = this.parentThatIsA(MenuMorph),
        world = this.world(),
        scroller;

    if (!(this.action instanceof MenuMorph)) {return; }
    this.action.createItems();
    this.action.setPosition(this.topRight().subtract(new Point(0, 5)));
    this.action.addShadow(new Point(2, 2), 80);
    this.action.keepWithin(this.world());
    if (this.action.items.length < 1 && !this.action.title) {return; }

    if (this.action.bottom() > world.bottom()) {
        // scroll menu items if the menu is taller than the world
        this.action.removeShadow();
        scroller = this.action.scroll();
        this.action.bounds.corner.y = world.bottom() - 2;
        this.action.addShadow(new Point(2, 2), 80);
        scroller.setHeight(world.bottom() - scroller.top() - 6);
        scroller.adjustScrollBars(); // ?
     }
    
    menu.add(this.action);
    menu.submenu = this.action;
    menu.submenu.world = menu.world; // keyboard control
    this.action.fullChanged();
};

// FrameMorph //////////////////////////////////////////////////////////

// I clip my submorphs at my bounds

// Frames inherit from Morph:

FrameMorph.prototype = new Morph;
FrameMorph.prototype.constructor = FrameMorph;
FrameMorph.uber = Morph.prototype;

function FrameMorph(aScrollFrame) {
    this.init(aScrollFrame);
}

FrameMorph.prototype.init = function (aScrollFrame) {
    this.scrollFrame = aScrollFrame || null;

    FrameMorph.uber.init.call(this);
    this.color = new Color(255, 250, 245);
    this.acceptsDrops = true;

    if (this.scrollFrame) {
        this.isDraggable = false;
        this.alpha = 0;
    }
};

FrameMorph.prototype.fullBounds = function () {
    var shadow = this.getShadow();
    if (shadow !== null) {
        return this.bounds.merge(shadow.bounds);
    }
    return this.bounds;
};

FrameMorph.prototype.fullImage = function () {
    // use only for shadows
    return this.getImage();
};

FrameMorph.prototype.fullDrawOn = function (ctx, aRect) {
    var shadow, clipped;
    if (!this.isVisible) {return; }
    clipped = this.bounds.intersect(aRect);
    if (!clipped.extent().gt(ZERO)) {return; }
    this.drawOn(ctx, clipped);
    this.children.forEach(child => {
        if (child instanceof ShadowMorph) {
            shadow = child;
        } else {
            child.fullDrawOn(ctx, clipped);
        }
    });
    if (shadow) {
        shadow.drawOn(ctx, aRect);
    }
};

// FrameMorph navigation:

FrameMorph.prototype.topMorphAt = function (point) {
    var i, result;
    if (!(this.isVisible && this.bounds.containsPoint(point))) {
        return null;
    }
    for (i = this.children.length - 1; i >= 0; i -= 1) {
        result = this.children[i].topMorphAt(point);
        if (result) {return result; }
    }
    if (this.isFreeForm) {
        return this.isTransparentAt(point) ? null : this;
    }
    return this;
};

// FrameMorph scrolling support:

FrameMorph.prototype.submorphBounds = function () {
    var result = null;

    if (this.children.length > 0) {
        result = this.children[0].bounds;
        this.children.forEach(child => {
            result = result.merge(child.fullBounds());
        });
    }
    return result;
};

FrameMorph.prototype.keepInScrollFrame = function () {
    if (this.scrollFrame === null) {
        return null;
    }
    if (this.left() > this.scrollFrame.left()) {
        this.moveBy(
            new Point(this.scrollFrame.left() - this.left(), 0)
        );
    }
    if (this.right() < this.scrollFrame.right()) {
        this.moveBy(
            new Point(this.scrollFrame.right() - this.right(), 0)
        );
    }
    if (this.top() > this.scrollFrame.top()) {
        this.moveBy(
            new Point(0, this.scrollFrame.top() - this.top())
        );
    }
    if (this.bottom() < this.scrollFrame.bottom()) {
        this.moveBy(
            0,
            new Point(this.scrollFrame.bottom() - this.bottom(), 0)
        );
    }
};

FrameMorph.prototype.adjustBounds = function () {
    var subBounds,
        newBounds;

    if (this.scrollFrame === null) {return; }
    subBounds = this.submorphBounds();
    if (subBounds && (!this.scrollFrame.isTextLineWrapping)) {
        newBounds = subBounds
            .expandBy(this.scrollFrame.padding)
            .growBy(this.scrollFrame.growth)
            .merge(this.scrollFrame.bounds);
    } else {
        newBounds = this.scrollFrame.bounds.copy();
    }
    if (!this.bounds.eq(newBounds)) {
        this.bounds = newBounds;
        this.keepInScrollFrame();
    }
    if (this.scrollFrame.isTextLineWrapping) {
        this.children.forEach(morph => {
            if (morph instanceof TextMorph) {
                morph.setWidth(this.width());
                this.setHeight(
                    Math.max(morph.height(), this.scrollFrame.height())
                );
            }
        });
    }
    this.scrollFrame.adjustScrollBars();
};

// FrameMorph dragging & dropping of contents:

FrameMorph.prototype.reactToDropOf = function () {
    this.adjustBounds();
};

FrameMorph.prototype.reactToGrabOf = function () {
    this.adjustBounds();
};

// FrameMorph menus:

FrameMorph.prototype.developersMenu = function () {
    var menu = FrameMorph.uber.developersMenu.call(this);
    if (this.children.length > 0) {
        menu.addLine();
        menu.addItem(
            "move all inside...",
            'keepAllSubmorphsWithin',
            'keep all submorphs\nwithin and visible'
        );
    }
    return menu;
};

FrameMorph.prototype.keepAllSubmorphsWithin = function () {
    this.children.forEach(m => m.keepWithin(this));
};

// ScrollFrameMorph ////////////////////////////////////////////////////

ScrollFrameMorph.prototype = new FrameMorph();
ScrollFrameMorph.prototype.constructor = ScrollFrameMorph;
ScrollFrameMorph.uber = FrameMorph.prototype;

function ScrollFrameMorph(scroller, size, sliderColor) {
    this.init(scroller, size, sliderColor);
}

ScrollFrameMorph.prototype.init = function (scroller, size, sliderColor) {
    ScrollFrameMorph.uber.init.call(this);
    this.scrollBarSize = size || MorphicPreferences.scrollBarSize;
    this.autoScrollTrigger = null;
    this.enableAutoScrolling = true; // change to suppress
    this.isScrollingByDragging = true; // change to suppress
    this.hasVelocity = true; // dto.
    this.padding = 0; // around the scrollable area
    this.growth = 0; // pixels or Point to grow right/left when near edge
    this.isTextLineWrapping = false;
    this.contents = scroller || new FrameMorph(this);
    this.add(this.contents);
    this.hBar = new SliderMorph(
        null, // start
        null, // stop
        null, // value
        null, // size
        'horizontal',
        sliderColor
    );
    this.hBar.setHeight(this.scrollBarSize);
    this.hBar.action = (num) => {
        this.contents.setPosition(
            new Point(
                this.left() - num,
                this.contents.position().y
            )
        );
    };
    this.hBar.isDraggable = false;
    this.add(this.hBar);
    this.vBar = new SliderMorph(
        null, // start
        null, // stop
        null, // value
        null, // size
        'vertical',
        sliderColor
    );
    this.vBar.setWidth(this.scrollBarSize);
    this.vBar.action = (num) => {
        this.contents.setPosition(
            new Point(
                this.contents.position().x,
                this.top() - num
            )
        );
    };
    this.vBar.isDraggable = false;
    this.add(this.vBar);
    this.toolBar = null; // optional slot
};

ScrollFrameMorph.prototype.adjustScrollBars = function () {
    var hWidth = this.width() - this.scrollBarSize,
        vHeight = this.height() - this.scrollBarSize;

    this.changed();
    if (this.contents.width() > this.width()) {
        this.hBar.show();
        if (this.hBar.width() !== hWidth) {
            this.hBar.setWidth(hWidth);
        }

        this.hBar.setPosition(
            new Point(
                this.left(),
                this.bottom() - this.hBar.height()
            )
        );
        this.hBar.start = 0;
        this.hBar.stop = this.contents.width() -
            this.width() +
            this.scrollBarSize;
        this.hBar.size =
            this.width() / this.contents.width() * this.hBar.stop;
        this.hBar.value = this.left() - this.contents.left();
        this.hBar.fixLayout();
    } else {
        this.hBar.hide();
    }

    if (this.contents.height() > this.height()) {
        this.vBar.show();
        if (this.vBar.height() !== vHeight) {
            this.vBar.setHeight(vHeight);
        }

        this.vBar.setPosition(
            new Point(
                this.right() - this.vBar.width(),
                this.top()
            )
        );
        this.vBar.start = 0;
        this.vBar.stop = this.contents.height() -
            this.height() +
            this.scrollBarSize;
        this.vBar.size =
            this.height() / this.contents.height() * this.vBar.stop;
        this.vBar.value = this.top() - this.contents.top();
        this.vBar.fixLayout();
    } else {
        this.vBar.hide();
    }
    this.adjustToolBar();
};

ScrollFrameMorph.prototype.adjustToolBar = function () {
    var padding = 3;
    if (this.toolBar) {
        this.toolBar.setTop(this.top() + padding);
        this.toolBar.setRight(
            (this.vBar.isVisible ? this.vBar.left() : this.right()) - padding
        );
    }
};

ScrollFrameMorph.prototype.addContents = function (aMorph) {
    this.contents.add(aMorph);
    this.contents.adjustBounds();
};

ScrollFrameMorph.prototype.setContents = function (aMorph) {
    this.contents.children.forEach(m => m.destroy());
    this.contents.children = [];
    aMorph.setPosition(this.position().add(this.padding + 2));
    this.addContents(aMorph);
};

ScrollFrameMorph.prototype.setExtent = function (aPoint) {
    if (this.isTextLineWrapping) {
        this.contents.setPosition(this.position().copy());
    }
    ScrollFrameMorph.uber.setExtent.call(this, aPoint);
    this.contents.adjustBounds();
};

// ScrollFrameMorph scrolling by dragging:

ScrollFrameMorph.prototype.scrollX = function (steps) {
    var cl = this.contents.left(),
        l = this.left(),
        cw = this.contents.width(),
        r = this.right(),
        newX;

    if (this.vBar.isVisible) {
        r -= this.scrollBarSize;
    };

    newX = cl + steps;
    if (newX + cw < r) {
        newX = r - cw;
    };
    if (newX > l) {
        newX = l;
    };
    if (newX !== cl) {
        this.contents.setLeft(newX);
    };
};

ScrollFrameMorph.prototype.scrollY = function (steps) {
    var ct = this.contents.top(),
        t = this.top(),
        ch = this.contents.height(),
        b = this.bottom(),
        newY;

    if (this.hBar.isVisible) {
        b -= this.scrollBarSize;
    };

    newY = ct + steps;
    if (newY + ch < b) {
        newY = b - ch;
    };
    if (newY > t) {
        newY = t;
    };
    if (newY !== ct) {
        this.contents.setTop(newY);
    };
};

ScrollFrameMorph.prototype.step = nop;

ScrollFrameMorph.prototype.mouseDownLeft = function (pos) {
    if (!this.isScrollingByDragging) {
        return null;
    }
    var world = this.root(),
        hand = world.hand,
        oldPos = pos,
        deltaX = 0,
        deltaY = 0,
        friction = 0.8;

    this.step = () => {
        var newPos;
        if (hand.mouseButton &&
                (hand.children.length === 0) &&
                (this.bounds.containsPoint(hand.bounds.origin))) {

            if (hand.grabPosition &&
                (hand.grabPosition.distanceTo(hand.position()) <=
                    MorphicPreferences.grabThreshold)) {
                // still within the grab threshold
                return null;
            }

            newPos = hand.bounds.origin;
            deltaX = newPos.x - oldPos.x;
            if (deltaX !== 0) {
                this.scrollX(deltaX);
            }
            deltaY = newPos.y - oldPos.y;
            if (deltaY !== 0) {
                this.scrollY(deltaY);
            }
            oldPos = newPos;
        } else {
            if (!this.hasVelocity) {
                this.step = nop;
            } else {
                if ((Math.abs(deltaX) < 0.5) &&
                        (Math.abs(deltaY) < 0.5)) {
                    this.step = nop;
                } else {
                    deltaX = deltaX * friction;
                    this.scrollX(Math.round(deltaX));
                    deltaY = deltaY * friction;
                    this.scrollY(Math.round(deltaY));
                }
            }
        }
        this.adjustScrollBars();
    };
};

ScrollFrameMorph.prototype.startAutoScrolling = function () {
    var inset = MorphicPreferences.scrollBarSize * 3,
        world = this.world(),
        hand,
        inner,
        pos;

    if (!world) {
        return null;
    }
    hand = world.hand;
    if (!this.autoScrollTrigger) {
        this.autoScrollTrigger = Date.now();
    }
    this.step = () => {
        pos = hand.bounds.origin;
        inner = this.bounds.insetBy(inset);
        if ((this.bounds.containsPoint(pos)) &&
                (!(inner.containsPoint(pos))) &&
                (hand.children.length > 0)) {
            this.autoScroll(pos);
        } else {
            this.step = nop;
            this.autoScrollTrigger = null;
        }
    };
};

ScrollFrameMorph.prototype.autoScroll = function (pos) {
    var inset, area;

    if (Date.now() - this.autoScrollTrigger < 500) {
        return null;
    }

    inset = MorphicPreferences.scrollBarSize * 3;
    area = this.topLeft().extent(new Point(this.width(), inset));
    if (area.containsPoint(pos)) {
        this.scrollY(inset - (pos.y - this.top()));
    }
    area = this.topLeft().extent(new Point(inset, this.height()));
    if (area.containsPoint(pos)) {
        this.scrollX(inset - (pos.x - this.left()));
    }
    area = (new Point(this.right() - inset, this.top()))
        .extent(new Point(inset, this.height()));
    if (area.containsPoint(pos)) {
        this.scrollX(-(inset - (this.right() - pos.x)));
    }
    area = (new Point(this.left(), this.bottom() - inset))
        .extent(new Point(this.width(), inset));
    if (area.containsPoint(pos)) {
        this.scrollY(-(inset - (this.bottom() - pos.y)));
    }
    this.adjustScrollBars();
};

// ScrollFrameMorph scrolling by editing text:

ScrollFrameMorph.prototype.scrollCursorIntoView = function (morph) {
    var txt = morph.target,
        offset = txt.position().subtract(this.contents.position()),
        ft = this.top() + this.padding,
        fb = this.bottom() - this.padding;
    this.contents.setExtent(txt.extent().add(offset).add(this.padding));
    if (morph.top() < ft) {
        this.contents.setTop(this.contents.top() + ft - morph.top());
        morph.setTop(ft);
    } else if (morph.bottom() > fb) {
        this.contents.setBottom(this.contents.bottom() + fb - morph.bottom());
        morph.setBottom(fb);
    }
    this.adjustScrollBars();
};

// ScrollFrameMorph events:

ScrollFrameMorph.prototype.mouseScroll = function (y, x) {
    if (y) {
        this.scrollY(y * MorphicPreferences.mouseScrollAmount);
    }
    if (x) {
        this.scrollX(x * MorphicPreferences.mouseScrollAmount);
    }
    this.adjustScrollBars();
};

// ScrollFrameMorph duplicating:

ScrollFrameMorph.prototype.updateReferences = function (map) {
    ScrollFrameMorph.uber.updateReferences.call(this, map);
    if (this.hBar) {
        this.hBar.action = (num) => {
            this.contents.setPosition(
                new Point(this.left() - num, this.contents.position().y)
            );
        };
    }
    if (this.vBar) {
        this.vBar.action = (num) => {
            this.contents.setPosition(
                new Point(this.contents.position().x, this.top() - num)
            );
        };
    }
};

// ScrollFrameMorph menu:

ScrollFrameMorph.prototype.developersMenu = function () {
    var menu = ScrollFrameMorph.uber.developersMenu.call(this);
    if (this.isTextLineWrapping) {
        menu.addItem(
            "auto line wrap off...",
            'toggleTextLineWrapping',
            'turn automatic\nline wrapping\noff'
        );
    } else {
        menu.addItem(
            "auto line wrap on...",
            'toggleTextLineWrapping',
            'enable automatic\nline wrapping'
        );
    }
    return menu;
};

ScrollFrameMorph.prototype.toggleTextLineWrapping = function () {
    this.isTextLineWrapping = !this.isTextLineWrapping;
};

// ListMorph ///////////////////////////////////////////////////////////

ListMorph.prototype = new ScrollFrameMorph();
ListMorph.prototype.constructor = ListMorph;
ListMorph.uber = ScrollFrameMorph.prototype;

function ListMorph(
    elements,
    labelGetter,
    format,
    onDoubleClick,
    separator,
    verbatim
) {
/*
    passing a format is optional. If the format parameter is specified
    it has to be of the following pattern:

        [
            [<color>, <single-argument predicate>],
            ['bold', <single-argument predicate>],
            ['italic', <single-argument predicate>],
            ...
        ]

    multiple conditions can be passed in such a format list, the
    last predicate to evaluate true when given the list element sets
    the given format category (color, bold, italic).
    If no condition is met, the default format (color black, non-bold,
    non-italic) will be assigned.

    An example of how to use fomats can be found in the InspectorMorph's
    "markOwnProperties" mechanism.
*/
    this.init(
        elements || [],
        labelGetter || function (element) {
            if (isString(element)) {
                return element;
            }
            if (element.toSource) {
                return element.toSource();
            }
            return element.toString();
        },
        format || [],
        onDoubleClick, // optional callback
        separator, // string indicating a horizontal line between items
        verbatim
    );
}

ListMorph.prototype.init = function (
    elements,
    labelGetter,
    format,
    onDoubleClick,
    separator,
    verbatim
) {
    ListMorph.uber.init.call(this);

    this.contents.acceptsDrops = false;
    this.color = WHITE;
    this.hBar.alpha = 0.6;
    this.vBar.alpha = 0.6;
    this.elements = elements || [];
    this.labelGetter = labelGetter;
    this.format = format;
    this.listContents = null;
    this.selected = null; // actual element currently selected
    this.active = null; // menu item representing the selected element
    this.action = null;
    this.doubleClickAction = onDoubleClick || null;
    this.separator = separator || '';
    this.verbatim = isNil(verbatim) ? true : verbatim;
    this.acceptsDrops = false;
    this.buildListContents();
};

ListMorph.prototype.buildListContents = function () {
    if (this.listContents) {
        this.listContents.destroy();
    }
    this.listContents = new MenuMorph(
        this.select,
        null,
        this
    );
    if (this.elements.length === 0) {
        this.elements = ['(empty)'];
    }
    this.elements.forEach(element => {
        var color = null,
            bold = false,
            italic = false,
            label;

        this.format.forEach(pair => {
            if (pair[1].call(null, element)) {
                if (pair[0] === 'bold') {
                    bold = true;
                } else if (pair[0] === 'italic') {
                    italic = true;
                } else { // assume it's a color
                    color = pair[0];
                }
            }
        });

        label = this.labelGetter(element);
        if (label === this.separator) {
            this.listContents.addLine();
        } else {
            this.listContents.addItem(
                label, // label string
                element, // action
                null, // hint
                color,
                bold,
                italic,
                this.doubleClickAction,
                null, // shortcut
                this.verbatim // don't translate
            );
        }
    });
    this.listContents.isListContents = true;
    this.listContents.createItems();
    this.listContents.setPosition(this.contents.position());
    this.addContents(this.listContents);
};

ListMorph.prototype.select = function (item, trigger) {
    if (isNil(item)) {return; }
    this.selected = item;
    this.active = trigger;
    if (this.action) {
        this.action.call(null, item);
    }
};

ListMorph.prototype.setExtent = function (aPoint) {
    var lb = this.listContents.bounds,
        nb = this.bounds.origin.copy().corner(
            this.bounds.origin.add(aPoint)
        );

    if (nb.right() > lb.right() && nb.width() <= lb.width()) {
        this.listContents.setRight(nb.right());
    }
    if (nb.bottom() > lb.bottom() && nb.height() <= lb.height()) {
        this.listContents.setBottom(nb.bottom());
    }
    ListMorph.uber.setExtent.call(this, aPoint);
};

ListMorph.prototype.activeIndex = function () {
    return this.listContents.children.indexOf(this.active);
};

ListMorph.prototype.activateIndex = function (idx) {
    var item = this.listContents.children[idx];
    if (!item) {return; }
    item.userState = 'pressed';
    item.rerender();
    item.trigger();
};

// StringFieldMorph ////////////////////////////////////////////////////

// StringFieldMorph inherit from FrameMorph:

StringFieldMorph.prototype = new FrameMorph();
StringFieldMorph.prototype.constructor = StringFieldMorph;
StringFieldMorph.uber = FrameMorph.prototype;

function StringFieldMorph(
    defaultContents,
    minWidth,
    fontSize,
    fontStyle,
    bold,
    italic,
    isNumeric
) {
    this.init(
        defaultContents || '',
        minWidth || 100,
        fontSize || 12,
        fontStyle || 'sans-serif',
        bold || false,
        italic || false,
        isNumeric
    );
}

StringFieldMorph.prototype.init = function (
    defaultContents,
    minWidth,
    fontSize,
    fontStyle,
    bold,
    italic,
    isNumeric
) {
    this.defaultContents = defaultContents;
    this.minWidth = minWidth;
    this.fontSize = fontSize;
    this.fontStyle = fontStyle;
    this.isBold = bold;
    this.isItalic = italic;
    this.isNumeric = isNumeric || false;
    this.text = null;
    StringFieldMorph.uber.init.call(this);
    this.color = WHITE;
    this.isEditable = true;
    this.acceptsDrops = false;
    this.createText();
};

StringFieldMorph.prototype.createText = function () {
    var txt;
    txt = this.text ? this.string() : this.defaultContents;
    this.text = null;
    this.children.forEach(child => child.destroy());
    this.children = [];
    this.text = new StringMorph(
        txt,
        this.fontSize,
        this.fontStyle,
        this.isBold,
        this.isItalic,
        this.isNumeric
    );

    this.text.isNumeric = this.isNumeric; // for whichever reason...
    this.text.setPosition(this.bounds.origin.copy());
    this.text.isEditable = this.isEditable;
    this.text.isDraggable = false;
    this.text.enableSelecting();
    this.setExtent(
        new Point(
            Math.max(this.width(), this.minWidth),
            this.text.height()
        )
    );
    this.add(this.text);
};

StringFieldMorph.prototype.string = function () {
    return this.text.text;
};

StringFieldMorph.prototype.mouseClickLeft = function (pos) {
    if (this.isEditable) {
        this.text.edit();
    } else {
        this.escalateEvent('mouseClickLeft', pos);
    }
};

// BouncerMorph ////////////////////////////////////////////////////////

// I am a Demo of a stepping custom Morph

var BouncerMorph;

// Bouncers inherit from Morph:

BouncerMorph.prototype = new Morph();
BouncerMorph.prototype.constructor = BouncerMorph;
BouncerMorph.uber = Morph.prototype;

// BouncerMorph instance creation:

function BouncerMorph() {
    this.init();
}

// BouncerMorph initialization:

BouncerMorph.prototype.init = function (type, speed) {
    BouncerMorph.uber.init.call(this);

    // additional properties:
    this.isStopped = false;
    this.type = type || 'vertical';
    if (this.type === 'vertical') {
        this.direction = 'down';
    } else {
        this.direction = 'right';
    }
    this.speed = speed || 1;
};

// BouncerMorph moving:

BouncerMorph.prototype.moveUp = function () {
    this.moveBy(new Point(0, -this.speed * 0.5));
};

BouncerMorph.prototype.moveDown = function () {
    this.moveBy(new Point(0, this.speed * 0.5));
};

BouncerMorph.prototype.moveRight = function () {
    this.moveBy(new Point(this.speed * 0.5, 0));
};

BouncerMorph.prototype.moveLeft = function () {
    this.moveBy(new Point(-this.speed * 0.5, 0));
};

// BouncerMorph stepping:

BouncerMorph.prototype.step = function () {
    if (!this.isStopped) {
        if (this.type === 'vertical') {
            if (this.direction === 'down') {
                this.moveDown();
            } else {
                this.moveUp();
            }
            if (this.fullBounds().top() < this.parent.top() &&
                    this.direction === 'up') {
                this.direction = 'down';
            }
            if (this.fullBounds().bottom() > this.parent.bottom() &&
                    this.direction === 'down') {
                this.direction = 'up';
            }
        } else if (this.type === 'horizontal') {
            if (this.direction === 'right') {
                this.moveRight();
            } else {
                this.moveLeft();
            }
            if (this.fullBounds().left() < this.parent.left() &&
                    this.direction === 'left') {
                this.direction = 'right';
            }
            if (this.fullBounds().right() > this.parent.right() &&
                    this.direction === 'right') {
                this.direction = 'left';
            }
        }
    }
};

// HandMorph ///////////////////////////////////////////////////////////

// I represent the Mouse cursor

// HandMorph inherits from Morph:

HandMorph.prototype = new Morph;
HandMorph.prototype.constructor = HandMorph;
HandMorph.uber = Morph.prototype;

// HandMorph instance creation:

function HandMorph (aWorld) {this.init(aWorld);};

// HandMorph initialization:

HandMorph.prototype.init = function (aWorld) {
    HandMorph.uber.init.call(this, true);
    this.bounds = new Rectangle;

    // additional properties:
    this.world = aWorld;
    this.mouseButton = null;
    this.mouseOverList = [];
    this.mouseOverBounds = [];
    this.morphToGrab = null;
    this.grabPosition = null;
    this.grabOrigin = null;
    this.temporaries = [];
    this.touchHoldTimeout = null;
    this.contextMenuEnabled = false;
    this.touchStartPosition = new Point;

    // properties for caching dragged objects:
    this.cachedFullImage = null;
    this.cachedFullBounds = null;
    this.cursorStyle = 'auto';
};

// HandMorph dragging optimizations:

HandMorph.prototype.changed = function () {
    var b;
    if (this.world !== null) {
        b = this.cachedFullBounds || this.fullBounds();
        if (!b.extent().eq(ZERO)) {
            this.world.broken.push(b.spread());
        }
    }
};

HandMorph.prototype.moveBy = function (delta) {
    var children = this.children,
        i = children.length;
    this.changed();
    this.bounds = this.bounds.translateBy(delta);
    if (this.cachedFullBounds) {
        this.cachedFullBounds = this.cachedFullBounds.translateBy(delta);
    }
    this.changed();
    for (i; i > 0; i -= 1) {
        children[i - 1].moveBy(delta);
    }
};

HandMorph.prototype.fullChanged = HandMorph.prototype.changed;

// HandMorph display:

HandMorph.prototype.fullDrawOn = function (ctx, rect) {
    if (!this.cachedFullBounds) {
        HandMorph.uber.fullDrawOn.call(this, ctx, rect);
        return;
    }

    var clipped = rect.intersect(this.cachedFullBounds),
        pos = this.cachedFullBounds.origin,
        pic, src, w, h, sl, st;

    if (!clipped.extent().gt(ZERO)) {return; }
    ctx.save();
    ctx.globalAlpha = this.alpha;
    pic = this.cachedFullImage;
    src = clipped.translateBy(pos.neg());
    sl = src.left();
    st = src.top();
    w = Math.min(src.width(), pic.width - sl);
    h = Math.min(src.height(), pic.height - st);
    if (w < 1 || h < 1) {return; }
    ctx.drawImage(
        pic,
        sl,
        st,
        w,
        h,
        clipped.left(),
        clipped.top(),
        w,
        h
    );
    ctx.restore();
};

// HandMorph navigation:

HandMorph.prototype.morphAtPointer = function () {
    return this.world.topMorphAt(this.bounds.origin) || this.world;
};

HandMorph.prototype.allMorphsAtPointer = function () {
    return this.world.allChildren().filter(m => m.isVisible &&
        m.visibleBounds().containsPoint(this.bounds.origin) &&
        !m.holes.some(any =>
            any.translateBy(m.position()).containsPoint(this.bounds.origin))
        );
};

// HandMorph dragging and dropping:
/*
    drag 'n' drop events, method(arg) -> receiver:

        prepareToBeGrabbed(handMorph) -> grabTarget
        reactToGrabOf(grabbedMorph) -> oldParent
        wantsDropOf(morphToDrop) ->  newParent
        justDropped(handMorph) -> droppedMorph
        reactToDropOf(droppedMorph, handMorph) -> newParent
*/

HandMorph.prototype.dropTargetFor = function (aMorph) {
    var target = this.morphAtPointer();
    while (!target.wantsDropOf(aMorph)) {
        target = target.parent;
    }
    return target;
};

HandMorph.prototype.grab = function (aMorph) {
    var oldParent;
    if (!aMorph) {
        return null;
    }; oldParent = aMorph.parent;
    if (aMorph instanceof WorldMorph) {
        return null;
    }; if (this.children.length === 0) {
        this.world.stopEditing();
        this.grabOrigin = aMorph.situation();
        if (aMorph.prepareToBeGrabbed) {
            aMorph.prepareToBeGrabbed(this);
        }
        if (!aMorph.noDropShadow) {
            aMorph.addShadow();
        }
        this.add(aMorph);

        // cache the dragged object's display resources
        this.cachedFullImage = aMorph.fullImage();
        this.cachedFullBounds = aMorph.fullBounds();

        this.changed();
        if (oldParent instanceof Morph) {
        if (oldParent.reactToGrabOf) {
            oldParent.reactToGrabOf(aMorph);
        }};
    }
};

HandMorph.prototype.drop = function () {
    var target, morphToDrop;
    this.alpha = 1;
    if (this.children.length !== 0) {
        morphToDrop = this.children[0];
        target = this.dropTargetFor(morphToDrop);
        target = target.selectForEdit ? target.selectForEdit() : target;
        this.changed();
        target.add(morphToDrop);
        morphToDrop.changed();

        // invalidate dragging-cache
        this.cachedFullImage = null;
        this.cachedFullBounds = null;

        if (!morphToDrop.noDropShadow) {
	        morphToDrop.removeShadow();
        }
        this.children = [];
        this.setExtent(new Point());
        if (morphToDrop.justDropped) {
            morphToDrop.justDropped(this);
        }
        if (target.reactToDropOf) {
            target.reactToDropOf(morphToDrop, this);
        }
    }
};

// HandMorph event dispatching:
/*
    mouse events:

        mouseDownLeft
        mouseDownRight
        mouseClickLeft
        mouseClickRight
        mouseDoubleClick
        mouseEnter
        mouseLeave
        mouseEnterDragging
        mouseLeaveDragging
        mouseEnterBounds
        mouseLeaveBounds
        mouseMove
        mouseScroll
*/

HandMorph.prototype.processMouseDown = function (event) {
    var morph, actualClick,
        posInDocument = getDocumentPositionOf(this.world.worldCanvas);

    // update my position, in case I've just been initialized
    if (event.pageX) {
        this.setPosition(new Point(
            event.pageX - posInDocument.x,
            event.pageY - posInDocument.y
        ));
    }

    // process the actual event
    this.destroyTemporaries();
    this.contextMenuEnabled = true;
    this.morphToGrab = null;
    this.grabPosition = null;
    if (this.children.length !== 0) {
        this.drop();
        this.mouseButton = null;
    } else {
        morph = this.morphAtPointer();
        if (this.world.activeMenu) {
            if (!contains(
                    morph.allParents(),
                    this.world.activeMenu
                )) {
                this.world.activeMenu.destroy();
            } else {
                clearInterval(this.touchHoldTimeout);
            };
        };
        if (this.world.activeHandle) {
            if (morph !== this.world.activeHandle) {
                this.world.activeHandle.destroy();
            };
        };
        if (this.world.cursor) {
            if (morph !== this.world.cursor.target) {
                this.world.stopEditing();
            };
        };
        if (!morph.mouseMove) {
            this.morphToGrab = morph.rootForGrab();
            this.grabPosition = this.bounds.origin.copy();
        };
        if (event.button === 2 || event.ctrlKey) {
            this.mouseButton = 'right';
            actualClick = 'mouseDownRight';
        } else {
            this.mouseButton = 'left';
            actualClick = 'mouseDownLeft';
        };  while (!morph[actualClick]) {
            morph = morph.parent;
        };  morph[actualClick](this.bounds.origin);
    };
};

HandMorph.prototype.processTouchStart = function (event) {
    MorphicPreferences.isTouchDevice = true;
    clearInterval(this.touchHoldTimeout);
    if (event.touches.length === 1) {
        this.touchStartPosition = new Point(
            event.touches[0].pageX,
            event.touches[0].pageY
        ); this.touchHoldTimeout = setInterval( // simulate mouseRightClick
            () => {
                this.processMouseDown({button: 2});
                this.processMouseUp({button: 2});
                event.preventDefault();
                clearInterval(this.touchHoldTimeout);
            },
            400
        );  this.processMouseMove(event.touches[0]); // update my position
        this.processMouseDown({button: 0});
        event.preventDefault();
    };
};

HandMorph.prototype.processTouchMove = function (event) {
    MorphicPreferences.isTouchDevice = true;
    let pos = new Point(
        event.touches[0].pageX,
        event.touches[0].pageY
    );  let dis = this.touchStartPosition.distanceTo(pos);

    if (dis > MorphicPreferences.grabThreshold) {
        if (event.touches.length === 1) {
            var touch = event.touches[0];
            this.processMouseMove(touch);
            clearInterval(this.touchHoldTimeout);
        };
    };
};

HandMorph.prototype.processTouchEnd = function (event) {
    MorphicPreferences.isTouchDevice = true;
    clearInterval(this.touchHoldTimeout);
    nop(event); // runs the event, but ignore it.
    this.processMouseUp({button: 0});
};

HandMorph.prototype.processMouseUp = function () {
    var morph = this.morphAtPointer(),
        context,
        contextMenu,
        expectedClick;

    this.destroyTemporaries();
    if (this.children.length !== 0) {
        this.drop();
    } else {
        if (this.mouseButton === 'left') {
            expectedClick = 'mouseClickLeft';
        } else {
            expectedClick = 'mouseClickRight';
            if (this.mouseButton && this.contextMenuEnabled) {
                context = morph;
                contextMenu = context.contextMenu();
                while ((!contextMenu) &&
                        context.parent) {
                    context = context.parent;
                    contextMenu = context.contextMenu();
                }
                if (contextMenu) {
                    contextMenu.popUpAtHand(this.world);
                }
            }
        }
        while (!morph[expectedClick]) {
            morph = morph.parent;
        }
        morph[expectedClick](this.bounds.origin);
    }
    this.mouseButton = null;
};

HandMorph.prototype.processDoubleClick = function () {
    var morph = this.morphAtPointer();

    this.destroyTemporaries();
    if (this.children.length !== 0) {
        this.drop();
    } else {
        while (morph && !morph.mouseDoubleClick) {
            morph = morph.parent;
        }
        if (morph) {
            morph.mouseDoubleClick(this.bounds.origin);
        }
    }
    this.mouseButton = null;
};

HandMorph.prototype.processMouseMove = function (event) {
    var pos,
        posInDocument = getDocumentPositionOf(this.world.worldCanvas),
        mouseOverNew,
        mouseOverBoundsNew,
        morph,
        topMorph;

    this.cursorStyle = null;

    pos = new Point(
        event.pageX - posInDocument.x,
        event.pageY - posInDocument.y
    );

    this.setPosition(pos);

    // determine the new mouse-over-list:
    mouseOverNew = this.morphAtPointer().allParents();
    mouseOverBoundsNew = mouseOverNew.filter(m => m.isVisible &&
        m.visibleBounds().containsPoint(this.bounds.origin) &&
            !m.holes.some(any =>
                any.translateBy(m.position()).containsPoint(this.bounds.origin))
    );

    if (!this.children.length && this.mouseButton) {
        topMorph = this.morphAtPointer();
        morph = topMorph.rootForGrab();
        if (topMorph.mouseMove) {
            topMorph.mouseMove(pos, this.mouseButton);
            if (this.mouseButton === 'right') {
                this.contextMenuEnabled = false;
            };
        };

        // if a morph is marked for grabbing, just grab it
        if (this.mouseButton === 'left' &&
                this.morphToGrab &&
                (this.grabPosition.distanceTo(this.bounds.origin) >
                    MorphicPreferences.grabThreshold)) {
            this.setPosition(this.grabPosition);
            if (this.morphToGrab.isDraggable) {
                morph = this.morphToGrab.selectForEdit ?
                        this.morphToGrab.selectForEdit() : this.morphToGrab;
                this.grab(morph);
            } else if (this.morphToGrab.isTemplate) {
                this.world.stopEditing();
                morph = this.morphToGrab.fullCopy();
                morph.isTemplate = false;
                morph.isDraggable = true;
                if (morph.reactToTemplateCopy) {
                    morph.reactToTemplateCopy();
                };
                this.grab(morph);
                this.grabOrigin = this.morphToGrab.situation();
            };
            this.setPosition(pos);
        };
    };

    this.mouseOverBounds.forEach(old => {
        if (!contains(mouseOverBoundsNew, old)) {
            if (old.mouseLeaveBounds) {
                old.mouseLeaveBounds(this.children[0]);
            };
        };
    });
    mouseOverBoundsNew.forEach(newMorph => {
        if (!contains(this.mouseOverBounds, newMorph)) {
            if (newMorph.mouseEnterBounds) {
                newMorph.mouseEnterBounds(this.children[0]);
            };
        };
    });

    this.mouseOverList.forEach(old => {
        if (!contains(mouseOverNew, old)) {
            if (old.mouseLeave) {
                old.mouseLeave();
            };
            if (old.mouseLeaveDragging && this.mouseButton) {
                old.mouseLeaveDragging(this.children[0]);
            };
        };
    });
    mouseOverNew.forEach(newMorph => {
        if (!contains(this.mouseOverList, newMorph)) {
            if (newMorph.mouseEnter) {
                newMorph.mouseEnter();
            };
            if (newMorph.mouseEnterDragging && this.mouseButton) {
                newMorph.mouseEnterDragging(this.children[0]);
            };
        };

        // autoScrolling support:
        if (this.children.length > 0) {
            if (newMorph instanceof ScrollFrameMorph &&
                    newMorph.enableAutoScrolling &&
                    newMorph.contents.allChildren().some(any => {
                        return any.wantsDropOf(this.children[0]);
                    })
            ) {
                if (!newMorph.bounds.insetBy(
                        MorphicPreferences.scrollBarSize * 3
                    ).containsPoint(this.bounds.origin)) {
                    newMorph.startAutoScrolling();
                };
            };
        };
    });
    this.mouseOverList = mouseOverNew;
    this.mouseOverBounds = mouseOverBoundsNew;

    if (this.mouseButton === 'left' && this.morphToGrab) {
        this.cursorStyle = this.morphToGrab.cursorGrabStyle || this.morphToGrab.cursorStyle;
    }; if (this.cursorStyle == null) {
        for (const morph of this.mouseOverList) {
            if (morph.cursorStyle != null) {
                this.cursorStyle = morph.cursorStyle;
                break;
            };
        };
    }; this.world.worldCanvas.style.cursor = this.cursorStyle;
};

HandMorph.prototype.processMouseScroll = function (event) {
    var morph = this.morphAtPointer();
    while (morph && !morph.mouseScroll) {
    morph = morph.parent;}; if (morph) {
        morph.mouseScroll(
            (event.detail / -3) || (
                Object.prototype.hasOwnProperty.call(
                    event,
                    'wheelDeltaY'
                ) ?
                        event.wheelDeltaY / 120 :
                        event.wheelDelta / 120
            ),
            event.wheelDeltaX / 120 || 0
        );
    };
};

/*
    drop event:

        droppedImage
        droppedSVG
        droppedAudio
        droppedText

        beginBulkDrop
        endBulkDrop
*/

HandMorph.prototype.processDrop = function (event) {
/*
    find out whether an external image or audio file was dropped
    onto the world canvas, turn it into an offscreen canvas or audio
    element and dispatch the

        droppedImage(canvas, name)
        droppedSVG(image, name)
        droppedAudio(audio, name)
        droppedText(text, name, type)

    events to interested Morphs at the mouse pointer.

    In case multiple files are dropped simulateneously also displatch
    the events

        beginBulkDrop()
        endBulkDrop()

    to Morphs interested in bracketing the bulk operation
*/
    var files = event instanceof FileList ? event
                : event.target.files || event.dataTransfer.files,
        file,
        fileCount,
        url = event.dataTransfer ?
                event.dataTransfer.getData('URL') : null,
        txt = event.dataTransfer ?
                event.dataTransfer.getData('Text/HTML') : null,
        suffix,
        src,
        target = this.morphAtPointer(),
        img = new Image(),
        canvas,
        i;

    function readSVG(aFile) {
        var pic = new Image(),
            frd = new FileReader(),
            trg = target;
        while (!trg.droppedSVG) {
            trg = trg.parent;
        }
        pic.onload = () => {
            trg.droppedSVG(pic, aFile.name);
            bulkDrop();
        };
        frd = new FileReader();
        frd.onloadend = (e) => pic.src = e.target.result;
        frd.readAsDataURL(aFile);
    }

    function readImage(aFile) {
        var pic = new Image(),
            frd = new FileReader(),
            trg = target;
        while (!trg.droppedImage) {
            trg = trg.parent;
        }
        pic.onload = () => {
            canvas = newCanvas(new Point(pic.width, pic.height), true);
            canvas.getContext('2d').drawImage(pic, 0, 0);
            trg.droppedImage(canvas, aFile.name);
            bulkDrop();
        };
        frd = new FileReader();
        frd.onloadend = (e) => pic.src = e.target.result;
        frd.readAsDataURL(aFile);
    }

    function readAudio(aFile) {
        var snd = new Audio(),
            frd = new FileReader(),
            trg = target;
        while (!trg.droppedAudio) {
            trg = trg.parent;
        }
        frd.onloadend = (e) => {
            snd.src = e.target.result;
            trg.droppedAudio(snd, aFile.name);
            bulkDrop();
        };
        frd.readAsDataURL(aFile);
    }

    function readText(aFile) {
        var frd = new FileReader(),
            trg = target;
        while (!trg.droppedText) {
            trg = trg.parent;
        }
        frd.onloadend = (e) => {
            trg.droppedText(e.target.result, aFile.name, aFile.type);
            bulkDrop();
        };
        frd.readAsText(aFile);
    }

    function readBinary(aFile) {
        var frd = new FileReader(),
            trg = target;
        while (!trg.droppedBinary) {
            trg = trg.parent;
        }
        frd.onloadend = (e) => {
            trg.droppedBinary(e.target.result, aFile.name);
            bulkDrop();
        };
        frd.readAsArrayBuffer(aFile);
    }

    function beginBulkDrop() {
        var trg = target;
        while (!trg.beginBulkDrop) {
            trg = trg.parent;
        }
        trg.beginBulkDrop();
    }

    function bulkDrop() {
        var trg = target;
            fileCount -= 1;
        if (files.length > 1 && fileCount === 0) {
            while (!trg.endBulkDrop) {
                trg = trg.parent;
            }
            trg.endBulkDrop();
        }
    }

    function readURL(url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.responseText) {
                    callback(request.responseText);
                } else {
                    throw new Error('unable to retrieve ' + url);
                }
            }
        };
        request.send();
    }

    function parseImgURL(html) {
        var iurl = '',
            idx,
            c,
            start = html.indexOf('<img src="');
        if (start === -1) {return null; }
        start += 10;
        for (idx = start; idx < html.length; idx += 1) {
            c = html[idx];
            if (c === '"') {
                return iurl;
            }
            iurl = iurl.concat(c);
        }
        return null;
    }

    if (files.length > 0) {
        fileCount = files.length;
        if (fileCount > 1) {
            beginBulkDrop();
        }
        for (i = 0; i < files.length; i += 1) {
            file = files[i];
            suffix = file.name.slice(
                file.name.lastIndexOf('.') + 1
            ).toLowerCase();
            if (file.type.indexOf("svg") !== -1
                    && !MorphicPreferences.rasterizeSVGs) {
                readSVG(file);
            } else if (file.type.indexOf("image") === 0) {
                readImage(file);
            } else if (file.type.indexOf("audio") === 0 ||
                    file.type.indexOf("ogg") > -1) {
                    // check the file-extension because Firefox
                    // thinks OGGs are videos
                readAudio(file);
            } else if ((file.type.indexOf("text") === 0) ||
                    contains(['txt', 'csv', 'json'], suffix)) {
                    // check the file-extension because Windows
                    // doesn't specify CSVs to be text/csv, sigh
                readText(file);
            } else { // assume it's meant to be binary
                readBinary(file);
            }
        }
    } else if (url) {
        suffix = url.slice(url.lastIndexOf('.') + 1).toLowerCase();
        if (
            contains(
                ['gif', 'png', 'jpg', 'jpeg', 'bmp'],
                suffix
            )
        ) {
            while (!target.droppedImage) {
                target = target.parent;
            }
            img = new Image();
            img.onload = () => {
                canvas = newCanvas(new Point(img.width, img.height), true);
                canvas.getContext('2d').drawImage(img, 0, 0);
                target.droppedImage(canvas);
            };
            img.src = url;
        } else if (suffix === 'svg' && !MorphicPreferences.rasterizeSVGs) {
            while (!target.droppedSVG) {
                target = target.parent;
            }
            readURL(
                url,
                txt => {
                    var pic = new Image();
                    pic.onload = () => {
                        target.droppedSVG(
                            pic,
                            url.slice(
                                url.lastIndexOf('/') + 1,
                                url.lastIndexOf('.')
                            )
                        );
                    };
                    pic.src = 'data:image/svg+xml;utf8,' +
                        encodeURIComponent(txt);
                }
            );
        }
    } else if (txt) {
        while (!target.droppedImage) {
            target = target.parent;
        }
        img = new Image();
        img.onload = () => {
            canvas = newCanvas(new Point(img.width, img.height), true);
            canvas.getContext('2d').drawImage(img, 0, 0);
            target.droppedImage(canvas);
        };
        src = parseImgURL(txt);
        if (src) {img.src = src; }
    }
};

// HandMorph tools

HandMorph.prototype.destroyTemporaries = function () {
/*
    temporaries are just an array of morphs which will be deleted upon
    the next mouse click, or whenever another temporary Morph decides
    that it needs to remove them. The primary purpose of temporaries is
    to display tools tips of speech bubble help.
*/
    this.temporaries.forEach(morph => {
        if (!(morph.isClickable
                && morph.bounds.containsPoint(this.position()))) {
            morph.destroy();
            this.temporaries.splice(this.temporaries.indexOf(morph), 1);
        }
    });
};

// FPSMorph //////////////////////////////////////////////////////////

// I'm updating every second to show the FPS counter in me

// FPSMorph inherits from StringMorph:

FPSMorph = function FPSMorph () {this.init(
);}; FPSMorph.prototype = new StringMorph;
FPSMorph.prototype.constructor = FPSMorph;
FPSMorph.uber = StringMorph.prototype;
FPSMorph.prototype.init = function anonymous () {
FPSMorph.uber.init.call(this); this.frameCounter = 0;
this.isVisible = false; this.fontSize = 22;
this.startTime = Date.now();};
FPSMorph.prototype.step = function anonymous (
) {this.frameCounter++; if (!(Date.now() < (
this.startTime + 1000))) {this.text = ('FPS\: '
.concat(this.frameCounter)); this.fixLayout(
); if (this.parent instanceof Morph
) {this.setLeft(this.parent.left());
this.setBottom(this.parent.bottom(
)); this.parent.add(this);}; if (
!this.isVisible) {this.isVisible = true;
}; this.frameCounter = 0;
this.startTime = Date.now();};};

// WorldMorph //////////////////////////////////////////////////////////

// I represent the <canvas> element

// WorldMorph inherits from FrameMorph:

WorldMorph.prototype = new FrameMorph;
WorldMorph.prototype.constructor = WorldMorph;
WorldMorph.uber = FrameMorph.prototype;

// WorldMorph global settings & examples

WorldMorph.prototype.customMorphs = [];

// WorldMorph instance creation:

function WorldMorph(aCanvas, fillPage) {this.init(aCanvas, fillPage);};

// WorldMorph initialization:

WorldMorph.prototype.init = function anonymous (aCanvas, fillPage) {
    WorldMorph.uber.init.call(this);
    var wrrld = this;
    this.color = new Color(205, 205, 205);
    this.alpha = 1;
    this.bounds = new Rectangle(0, 0, aCanvas.width, aCanvas.height);
    this.isVisible = true;
    this.isDraggable = false;
    this.currentKey = null; // currently pressed key code
    this.worldCanvas = aCanvas;
    this.worldCanvas.getContext("2d", {
    willReadFrequently: true});

    // additional properties:
    this.stamp = Date.now(); // reference in multi-world setups
    while (this.stamp === Date.now()) {nop();};
    this.stamp = Date.now();

    this.useFillPage = fillPage;
    if (isNil(this.useFillPage)) {
    this.useFillPage = true;};
    this.isDevMode = false;
    this.broken = [];
    this.animations = [];
    this.hand = new HandMorph(this);
    this.keyboardHandler = null;
    this.keyboardFocus = null;
    this.cursor = null;
    this.lastEditedText = null;
    this.activeMenu = null;
    this.activeHandle = null;

    this.initKeyboardHandler();
    this.resetKeyboardHandler();
    this.initEventListeners();
    if("getBattery" in navigator) {navigator.getBattery(
    ).then(battery => {wrrld.batteryAPI = battery;});};
};

WorldMorph.prototype.beepSound = document.createElement('audio');
WorldMorph.prototype.beepSound.src = 'src/beep.wav';

// World Morph display:

WorldMorph.prototype.fullDrawOn = function anonymous (aContext, aRect
) {WorldMorph.uber.fullDrawOn.call(this, aContext, aRect);
this.hand.fullDrawOn(aContext, aRect);};

WorldMorph.prototype.updateBroken = function () {
    var ctx = this.worldCanvas.getContext('2d');
    this.condenseDamages();
    this.broken.forEach(rect => {
        if (rect.extent().gt(ZERO)) {
            this.fullDrawOn(ctx, rect);
        };
    });
    this.broken = [];
};

WorldMorph.prototype.stepAnimations = function () {
    this.animations.forEach(anim => anim.step());
    this.animations = this.animations.filter(anim => anim.isActive);
};

WorldMorph.prototype.condenseDamages = function () {
    // collapse clustered damaged rectangles into their unions,
    // thereby reducing the array of brokens to a manageable size

    function condense(src) {
        var trgt = [],
            len = src.length,
            rect,
            test = each => each.isNearTo(rect, 20),
            hit, i;

        for (i = 0; i < len; i += 1) {
            rect = src[i];
            hit = detect(trgt, test);
            if (hit) {
                hit.mergeWith(rect);
            } else {
                trgt.push(rect);
            }
        }
        return trgt;
    }

    function mergeAll(rects) {
        var left = rects[0].origin.x,
            top = rects[0].origin.y,
            right = rects[0].corner.x,
            bottom = rects[0].corner.y,
            len = rects.length,
            each,
            i;

        for (i = 1; i < len; i += 1) {
            each = rects[i];
            left = Math.min(left, each.origin.x);
            top = Math.min(top, each.origin.y);
            right = Math.max(right, each.corner.x);
            bottom = Math.max(bottom, each.corner.y);
        }

        return new Rectangle(left, top, right, bottom);
    }

    if (this.broken.length > 1000) {
        this.broken = [mergeAll(this.broken)];
    } else {
        this.broken = condense(this.broken);
    }

    /* // overly eager reduction algorithm, commented out for performance
    var again = true,
        size = this.broken.length;
    
    while (again) {
        this.broken = condense(this.broken);
        again = (this.broken.length < size);
        size = this.broken.length;
    }
    */
};

WorldMorph.prototype.doOneCycle = function anonymous () {
this.stepFrame(); this.stepAnimations(); this.updateBroken();};

WorldMorph.prototype.fillPage = function () {
    var clientHeight = window.innerHeight,
        clientWidth = window.innerWidth;

    this.worldCanvas.style.position = "absolute";
    this.worldCanvas.style.left = "0px";
    this.worldCanvas.style.right = "0px";
    this.worldCanvas.style.width = "100%";
    this.worldCanvas.style.height = "100%";

    if (document.documentElement.scrollTop) {
        // scrolled down b/c of viewport scaling
        clientHeight = document.documentElement.clientHeight;
    }
    if (document.documentElement.scrollLeft) {
        // scrolled left b/c of viewport scaling
        clientWidth = document.documentElement.clientWidth;
    }
    if (this.worldCanvas.width !== clientWidth) {
        this.worldCanvas.width = clientWidth;
        this.setWidth(clientWidth);
    }
    if (this.worldCanvas.height !== clientHeight) {
        this.worldCanvas.height = clientHeight;
        this.setHeight(clientHeight);
    }
    this.children.forEach(child => {
        if (child.reactToWorldResize) {
            child.reactToWorldResize(this.bounds.copy());
        }
    });
};

// WorldMorph global pixel access:

WorldMorph.prototype.getGlobalPixelColor = function anonymous (point) {
/* answer the color at the given point. */ try {/* Catching errors in image */
var dta = Morph.prototype.fullImage.call(this).getContext('2d').getImageData(point.x,
point.y, 1, 1).data; return new Color(dta[0], dta[1], dta[2], 1);} catch {return BLACK;};};

// WorldMorph messages:

WorldMorph.prototype.showMessage = function (message, secs) {
var m = new MenuMorph(null, message), intervalHandle;
m.popUpCenteredInWorld(this); if (secs) {intervalHandle = setInterval(
() => {m.destroy(); clearInterval(intervalHandle
);}, secs * 1000);}; return m;};

// WorldMorph events:

WorldMorph.prototype.initKeyboardHandler = function () {
    var kbd = document.getElementById('morphic_keyboard');
    if (kbd) { // share existing handler with other worlds
        this.keyboardHandler = kbd;
        return;
    }
    kbd = document.createElement('textarea');
    kbd.setAttribute('id', 'morphic_keyboard');
    kbd.setAttribute('style', 'caret-color:transparent;');
    kbd.style.position = 'absolute';
    kbd.style.overflow = "hidden";
    kbd.style.border = 'none';
    kbd.style.resize = 'none';
    kbd.wrap = "off";
    kbd.world = this;
    kbd.style.zIndex = -1;
    kbd.autofocus = true;
    kbd.style.width = '0px'
    kbd.style.height = '0px';
    document.body.appendChild(kbd);
    this.keyboardHandler = kbd;

    kbd.addEventListener(
        "keydown",
         event => {
            // remember the keyCode in the world's currentKey property
            kbd.world.currentKey = event.keyCode;
            if (kbd.world.activeMenu && !kbd.world.activeMenu.hasFocus) {
                kbd.world.stopEditing();
                kbd.world.activeMenu.getFocus();
            }
            if (kbd.world.keyboardFocus &&
                    kbd.world.keyboardFocus.processKeyDown) {
                kbd.world.keyboardFocus.processKeyDown(event);
            }
            // suppress tab override and make sure tab gets
            // received by all browsers
            if (event.keyCode === 9) {
                if (kbd.world.keyboardFocus &&
                        kbd.world.keyboardFocus.processKeyPress) {
                    kbd.world.keyboardFocus.processKeyPress(event);
                }
                event.preventDefault();
            }
            // suppress cmd-d/f/i/p/s override
            if ((event.ctrlKey || event.metaKey) &&
                    'dfiops'.includes(event.key)) {
                event.preventDefault();
            }
        },
        true
    );

    kbd.addEventListener(
        "keyup",
        event => {
            // flush the world's currentKey property
            kbd.world.currentKey = null;
            // dispatch to keyboard receiver
            if (kbd.world.keyboardFocus &&
                    kbd.world.keyboardFocus.processKeyUp) {
                kbd.world.keyboardFocus.processKeyUp(event);
            }
            event.preventDefault();
        },
        false
    );

    kbd.addEventListener(
        "keypress",
        event => {
            if (kbd.world.keyboardFocus &&
                    kbd.world.keyboardFocus.processKeyPress) {
                kbd.world.keyboardFocus.processKeyPress(event);
                event.preventDefault();
            }
        },
        false
    );

    kbd.addEventListener(
        "input",
        event => {
            if (kbd.world.keyboardFocus &&
                    kbd.world.keyboardFocus.processInput) {
                // flush the world's currentKey property
                kbd.world.currentKey = null;
                kbd.world.keyboardFocus.processInput(event);
            } else {
                kbd.world.keyboardHandler.value = '';
            }
            event.preventDefault();
        },
        false
    );
};

WorldMorph.prototype.resetKeyboardHandler = function (keepValue) {
    var pos = getDocumentPositionOf(this.worldCanvas);

    function number2px (n) {
        return Math.ceil(n) + 'px';
    }

    if (!keepValue) {
        this.keyboardHandler.value = '';
    }
    this.keyboardHandler.style.top = number2px(pos.y);
    this.keyboardHandler.style.left = number2px(pos.x);
};

WorldMorph.prototype.initEventListeners = function () {
    var canvas = this.worldCanvas;

    if (this.useFillPage) {
        this.fillPage();
    } else {
        this.changed();
    }

        canvas.addEventListener(
        "mousedown",
        event => {
            event.preventDefault();
            this.keyboardHandler.world = this; // focus the current world
            this.resetKeyboardHandler(true); // keep the handler's value
            if (!this.onNextStep) {
                // horrible kludge to keep Safari from popping up
                // a overlay when right-clicking out of a focused
                // and edited text or string element
                this.keyboardHandler.blur();
                this.onNextStep = () => this.keyboardHandler.focus();
            }
            this.hand.processMouseDown(event);
        }
    );

    canvas.addEventListener(
        "touchstart",
        event => this.hand.processTouchStart(event)
    );

    canvas.addEventListener(
        "mouseup",
        event => {
            event.preventDefault();
            this.hand.processMouseUp(event);
        }
    );

    canvas.addEventListener(
        "dblclick",
        event => {
            event.preventDefault();
            this.hand.processDoubleClick(event);
        }
    );

    canvas.addEventListener(
        "touchend",
        event => this.hand.processTouchEnd(event)
    );

    canvas.addEventListener(
        "mousemove",
        event => this.hand.processMouseMove(event)
    );

    canvas.addEventListener(
        "touchmove",
        event => this.hand.processTouchMove(event)
    );

    canvas.addEventListener(
        "contextmenu",
        event => event.preventDefault()
    );

    canvas.addEventListener( // Safari, Chrome
        "mousewheel",
        event => {
            this.hand.processMouseScroll(event);
            event.preventDefault();
        }
    );
    canvas.addEventListener( // Firefox
        "DOMMouseScroll",
        event => {
            this.hand.processMouseScroll(event);
            event.preventDefault();
        }
    );

    window.addEventListener(
        "dragover",
        event => event.preventDefault()
    );
    window.addEventListener(
        "drop",
        event => {
            this.hand.processDrop(event);
            event.preventDefault();
        }
    );

    window.addEventListener(
        "resize",
        () => {
            if (this.useFillPage) {
                this.fillPage();
            }
        }
    );

window.onbeforeunload = (evt) => {if (!asABool(sessionStorage['-snap-setting-isDesktopMode'])) {if (world.children[0].unsavedChanges() && (localStorage['-snap-setting-backup'] == 'true')) {try {
delete localStorage['-snap-bakflag-']; localStorage['-snap-backup-'] = world.children[0].serializer.serialize(new Project(world.children[0].scenes, world.children[0].scene));
delete localStorage['-snap-bakuser-'];} catch (error) {}; var e = evt || window.event, msg = "Are you sure you want to leave?"; if (e) {e.returnValue = msg; return msg;};};};};};
WorldMorph.prototype.mouseDownLeft = nop; WorldMorph.prototype.mouseClickLeft = nop; WorldMorph.prototype.mouseDownRight = nop; WorldMorph.prototype.mouseClickRight = nop; WorldMorph.prototype.wantsDropOf =
function () {return this.acceptsDrops;}; WorldMorph.prototype.droppedImage = nop; WorldMorph.prototype.droppedSVG = nop; WorldMorph.prototype.droppedAudio = nop; WorldMorph.prototype.droppedText = nop;
WorldMorph.prototype.beginBulkDrop = nop; WorldMorph.prototype.endBulkDrop = nop; WorldMorph.prototype.nextTab = function (editField) {var next = this.nextEntryField(editField); if (next) {
editField.clearSelection(); next.selectAll(); next.edit();};}; WorldMorph.prototype.previousTab = function (editField) {var prev = this.previousEntryField(editField);
if (prev) {editField.clearSelection(); prev.selectAll(); prev.edit();};}; WorldMorph.prototype.contextMenu = function () {var menu; if (this.isDevMode) {
menu = new MenuMorph(this, this.constructor.name || this.constructor.toString().split(' ')[1].split('(')[0]);} else {menu = new MenuMorph(this, 'Morphic');};
    if (this.isDevMode) {
        menu.addItem("demo...", 'userCreateMorph', 'sample morphs');
        menu.addLine();
        menu.addItem("hide all...", 'hideAll');
        menu.addItem("show all...", 'showAllHiddens');
        menu.addItem(
            "move all inside...",
            'keepAllSubmorphsWithin',
            'keep all submorphs\nwithin and visible'
        );
        menu.addItem(
            "inspect...",
            'inspect',
            'open a window on\nall properties'
        );
        menu.addItem(
            "screenshot...",
            'screenshot',
            'open a new window\nwith a picture of this morph'
        );
        menu.addLine();
        menu.addItem(
            "restore display",
            'changed',
            'redraw the\nscreen once'
        );
        menu.addItem(
            "fill page...",
            'fillPage',
            'let the World automatically\nadjust to browser resizing'
        );
        if (useBlurredShadows) {
            menu.addItem(
                "sharp shadows...",
                'toggleBlurredShadows',
                'sharp drop shadows\nuse for old browsers'
            );
        } else {
            menu.addItem(
                "blurred shadows...",
                'toggleBlurredShadows',
                'blurry shades,\n use for new browsers'
            );
        }
        menu.addItem(
            "color...",
            () => {this.spawnRGBAEditorDialog(this);},
            'choose the World\'s\nbackground color'
        );
        if (MorphicPreferences === standardSettings) {
            menu.addItem(
                "touch screen settings",
                'togglePreferences',
                'bigger menu fonts\nand sliders'
            );
        } else {
            menu.addItem(
                "standard settings",
                'togglePreferences',
                'smaller menu fonts\nand sliders'
            );
        }
        if (MorphicPreferences.showHoles) {
            menu.addItem(
                'hide holes',
                'toggleHolesDisplay',
                'debug untouchable regions'
            );
        } else {
            menu.addItem(
                'show holes',
                'toggleHolesDisplay',
                'debug untouchable regions'
            );
        }
        menu.addLine();
    }
    if (this.isDevMode) {
        menu.addItem(
            "user mode...",
            'toggleDevMode',
            'disable developers\'\ncontext menus'
        );
    } else {
        menu.addItem("development mode...", 'toggleDevMode');
    }
    menu.addItem("about morphic.js...", 'about');
    return menu;
};

WorldMorph.prototype.userCreateMorph = function () {
    var myself = this, menu, newMorph;

    function create(aMorph) {
        var cpy = aMorph.fullCopy();
        cpy.isDraggable = true;
        cpy.pickUp(myself);
    }

    menu = new MenuMorph(this, 'make a morph');
    menu.addItem('rectangle', () => create(new Morph));
    menu.addItem('box', () => create(new BoxMorph));
    menu.addItem('circle box', () => create(new CircleBoxMorph));
    menu.addLine();
    menu.addItem('slider', () => create(new SliderMorph));
    menu.addItem('dial', () => {
    	newMorph = new DialMorph;
     	newMorph.pickUp(this);
    });
    menu.addItem('frame', () => {
        newMorph = new FrameMorph;
        newMorph.setExtent(new Point(350, 250));
        create(newMorph);
    });
    menu.addItem('scroll frame', () => {
        newMorph = new ScrollFrameMorph;
        newMorph.contents.acceptsDrops = true;
        newMorph.contents.adjustBounds();
        newMorph.setExtent(new Point(350, 250));
        create(newMorph);
    });
    menu.addItem('handle', () => create(new HandleMorph));
    menu.addLine();
    menu.addItem('string', () => {
        newMorph = new StringMorph('Hello, World!');
        newMorph.isEditable = true;
        create(newMorph);
    });
    menu.addItem('text', () => {
        newMorph = new TextMorph(
            "Ich wei\u00DF nicht, was soll es bedeuten, dass ich so " +
                "traurig bin, ein M\u00E4rchen aus uralten Zeiten, das " +
                "kommt mir nicht aus dem Sinn. Die Luft ist k\u00FChl " +
                "und es dunkelt, und ruhig flie\u00DFt der Rhein; der " +
                "Gipfel des Berges funkelt im Abendsonnenschein. " +
                "Die sch\u00F6nste Jungfrau sitzet dort oben wunderbar, " +
                "ihr gold'nes Geschmeide blitzet, sie k\u00E4mmt ihr " +
                "goldenes Haar, sie k\u00E4mmt es mit goldenem Kamme, " +
                "und singt ein Lied dabei; das hat eine wundersame, " +
                "gewalt'ge Melodei. Den Schiffer im kleinen " +
                "Schiffe, ergreift es mit wildem Weh; er schaut " +
                "nicht die Felsenriffe, er schaut nur hinauf in " +
                "die H\u00F6h'. Ich glaube, die Wellen verschlingen " +
                "am Ende Schiffer und Kahn, und das hat mit ihrem " +
                "Singen, die Loreley getan."
        );
        newMorph.isEditable = true;
        newMorph.maxWidth = 300;
        newMorph.fixLayout();
        create(newMorph);
    });
    menu.addItem('speech bubble', () => {
        newMorph = new SpeechBubbleMorph('Hello, World!');
        create(newMorph);
    });
    menu.addLine();
    menu.addItem('gray scale palette', () => create(new GrayPaletteMorph));
    menu.addItem('color palette', () => create(new ColorPaletteMorph));
    menu.addItem('color picker', () => create(new ColorPickerMorph));
    menu.addLine();
    menu.addItem('sensor demo', () => {
        newMorph = new MouseSensorMorph;
        newMorph.setColor(new Color(230, 200, 100));
        newMorph.edge = 35;
        newMorph.border = 15;
        newMorph.borderColor = new Color(200, 100, 50);
        newMorph.alpha = 0.2;
        newMorph.setExtent(new Point(100, 100));
        create(newMorph);
    });
    menu.addItem('animation demo', () => {
        var foo, bar, baz, garply, fred;

        foo = new BouncerMorph;
        foo.setPosition(new Point(50, 20));
        foo.setExtent(new Point(300, 200));
        foo.alpha = 0.9;
        foo.speed = 3;

        bar = new BouncerMorph;
        bar.setColor(new Color(50, 50, 50));
        bar.setPosition(new Point(80, 80));
        bar.setExtent(new Point(80, 250));
        bar.type = 'horizontal';
        bar.direction = 'right';
        bar.alpha = 0.9;
        bar.speed = 5;

        baz = new BouncerMorph;
        baz.setColor(new Color(20, 20, 20));
        baz.setPosition(new Point(90, 140));
        baz.setExtent(new Point(40, 30));
        baz.type = 'horizontal';
        baz.direction = 'right';
        baz.speed = 3;

        garply = new BouncerMorph;
        garply.setColor(new Color(200, 20, 20));
        garply.setPosition(new Point(90, 140));
        garply.setExtent(new Point(20, 20));
        garply.type = 'vertical';
        garply.direction = 'up';
        garply.speed = 8;

        fred = new BouncerMorph;
        fred.setColor(new Color(20, 200, 20));
        fred.setPosition(new Point(120, 140));
        fred.setExtent(new Point(20, 20));
        fred.type = 'vertical';
        fred.direction = 'down';
        fred.speed = 4;

        bar.add(garply);
        bar.add(baz);
        foo.add(fred);
        foo.add(bar);

        create(foo);
    });
    menu.addItem('pen', () => create(new PenMorph));
    if (this.customMorphs.length) {
        menu.addLine();
        this.customMorphs.forEach(item => {
            var sub;
            if (item instanceof Array) { // assume [name, [morphs]]
                sub = new MenuMorph;
                item[1].forEach(morph => sub.addItem(morph,
                    () => create(morph instanceof Array ? morph[0] : morph)));
                menu.addMenu(item[0], sub);
            } else { // assume a Morph
                menu.addItem(item.toString(), () => create(item));
            }
        });
    }
    menu.popUpAtHand(this);
};

WorldMorph.prototype.toggleDevMode = function () {this.isDevMode = !this.isDevMode;};

WorldMorph.prototype.hideAll = function () {this.children.forEach(child => child.hide());};

WorldMorph.prototype.showAllHiddens = function () {this.forAllChildren(child => {if (!child.isVisible) {child.show();};});};

WorldMorph.prototype.about = function () {
    var versions = '', module;

    for (module in modules) {
        if (Object.prototype.hasOwnProperty.call(modules, module)) {
            versions += ('\n' + module + ' (' + modules[module] + ')');
        }
    }
    if (versions !== '') {
        versions = '\n\nmodules:\n\n' +
            'morphic (' + morphicVersion + ')' +
            versions;
    }

    this.inform(
        'morphic.js\n\n' +
            'a lively Web GUI\ninspired by Squeak\n' +
            morphicVersion +
            '\n\nwritten by Jens M\u00F6nig\njens@moenig.org' +
            versions
    );
};

WorldMorph.prototype.edit = function (aStringOrTextMorph) {
    if (this.lastEditedText === aStringOrTextMorph) {
        return;
    }
    if (!isNil(this.lastEditedText)) {
        this.stopEditing();
    }
    if (!aStringOrTextMorph.isEditable) {
        return null;
    }
    if (this.cursor) {
        this.cursor.destroy();
    }

    // some magic we apparently need for Android
    this.worldCanvas.focus();
    this.keyboardHandler.focus();

    // create a new cursor
    this.cursor = new CursorMorph(aStringOrTextMorph, this.keyboardHandler);
    this.keyboardFocus = this.cursor;
    aStringOrTextMorph.parent.add(this.cursor);
    this.cursor.rerender();
    if (MorphicPreferences.useSliderForInput) {
        if (!aStringOrTextMorph.parentThatIsA(MenuMorph)) {
            this.slide(aStringOrTextMorph);
        }
    }
    if (this.lastEditedText !== aStringOrTextMorph) {
        aStringOrTextMorph.escalateEvent('freshTextEdit', aStringOrTextMorph);
    }
    this.lastEditedText = aStringOrTextMorph;
};

WorldMorph.prototype.slide = function (aStringOrTextMorph) {
    // display a slider for numeric text entries
    var val = parseFloat(aStringOrTextMorph.text),
        menu,
        slider;

    if (isNaN(val)) {
        val = 0;
    }
    menu = new MenuMorph();
    slider = new SliderMorph(
        val - 25,
        val + 25,
        val,
        10,
        'horizontal'
    );
    slider.alpha = 1;
    slider.color = new Color(225, 225, 225);
    slider.button.color = menu.borderColor;
    slider.button.highlightColor = slider.button.color.copy();
    slider.button.highlightColor.b += 100;
    slider.button.pressColor = slider.button.color.copy();
    slider.button.pressColor.b += 150;
    slider.setExtent(new Point(
        MorphicPreferences.scrollBarSize * 10,
        MorphicPreferences.menuFontSize
    ));
    slider.action = (num) => {
        aStringOrTextMorph.changed();
        aStringOrTextMorph.text = Math.round(num).toString();
        aStringOrTextMorph.fixLayout();
        aStringOrTextMorph.rerender();
        aStringOrTextMorph.escalateEvent(
            'reactToSliderEdit',
            aStringOrTextMorph
        );
    };
    menu.items.push(slider);
    menu.popup(this, aStringOrTextMorph.bottomLeft().add(new Point(0, 5)));
};

WorldMorph.prototype.stopEditing = function () {
    if (this.cursor) {
        this.cursor.target.escalateEvent('reactToEdit', this.cursor.target);
        this.cursor.target.clearSelection();
        this.cursor.destroy();
        this.cursor = null;
    }
    if (this.keyboardFocus && this.keyboardFocus.stopEditing) {
    	this.keyboardFocus.stopEditing();
    }
    this.keyboardFocus = null;
    this.lastEditedText = null;
};

WorldMorph.prototype.toggleBlurredShadows = function anonymous () {useBlurredShadows = !useBlurredShadows;}; WorldMorph.prototype.toggleHolesDisplay = function anonymous () {
MorphicPreferences.showHoles = !MorphicPreferences.showHoles; this.rerender();}; WorldMorph.prototype.togglePreferences = function anonymous () {
if (MorphicPreferences === standardSettings) {MorphicPreferences = touchScreenSettings;} else {MorphicPreferences = standardSettings;};};