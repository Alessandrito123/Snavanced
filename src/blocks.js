/*

    blocks.js

    a programming construction kit
    based on morphic.js
    inspired by Scratch

    written by Jens Mönig
    jens@moenig.org

    Copyright (C) 2024 by Jens Mönig

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
    needs morphic.js, symbols.js and widgets.js


    hierarchy
    ---------
    the following tree lists all constructors hierarchically,
    indentation indicating inheritance. Refer to this list to get a
    contextual overview:

        Morph*
            ArrowMorph
            BlockHighlightMorph
            ScriptsMorph
            SyntaxElementMorph
                BlockSlotMorph
                ArgMorph
                    ArgLabelMorph
                    BooleanSlotMorph
                    ColorSlotMorph
                    CommandSlotMorph
                        CSlotMorph
                        RingCommandSlotMorph
                    FunctionSlotMorph
                        ReporterSlotMorph
                            RingReporterSlotMorph
                    InputSlotMorph
                        TextSlotMorph
                    MultiArgMorph
                    TemplateSlotMorph
                BlockMorph
                    CommandBlockMorph
                        HatBlockMorph
                    ReporterBlockMorph
                        RingMorph
        BoxMorph*
            CommentMorph
            ScriptFocusMorph
        StringMorph*
            BlockLabelMorph
            InputSlotStringMorph
            InputSlotTextMorph
        SymbolMorph*
            BlockSymbolMorph

    * from morphic.js


    toc
    ---
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

        SyntaxElementMorph
        BlockLabelMorph
        BlockSymbolMorph
        BlockMorph
        CommandBlockMorph
        HatBlockMorph
        ReporterBlockMorph
        RingMorph
        ScriptsMorph
        ArgMorph
        BlockSlotMorph
        CommandSlotMorph
        RingCommandSlotMorph
        CSlotMorph
        InputSlotMorph
        InputSlotStringMorph
        InputSlotTextMorph
        BooleanSlotMorph
        TextSlotMorph
        ColorSlotMorph
        TemplateSlotMorph
        BlockHighlightMorph
        MultiArgMorph
        ArgLabelMorph
        FunctionSlotMorph
        ReporterSlotMorph
        RingReporterSlotMorph
        CommentMorph


    structure of syntax elements
    ----------------------------
    the structure of syntax elements is identical with their morphic
    tree. There are, however, accessor methods to get (only) the
    parts which are relevant for evaluation wherever appropriate.

    In Scratch/BYOB every sprite and the stage has its own "blocks bin",
    an instance of ScriptsMorph (we're going to name it differently in
    Snap, probably just "scripts").

    At the top most level blocks are assembled into stacks in ScriptsMorph
    instances. A ScriptsMorph contains nothing but blocks, therefore
    every child of a ScriptsMorph is expected to be a block.

    Each block contains:

        selector    - indicating the name of the function it triggers,

    Its arguments are first evaluated and then passed along    as the
    selector is called. Arguments can be either instances of ArgMorph
    or ReporterBlockMorph. The getter method for a block's arguments is

        inputs()    - gets an array of arg morphs and/or reporter blocks

    in addition to inputs, command blocks also know their

        nextBlock()    - gets the block attached to the receiver's bottom

    and the block they're attached to - if any: Their parent.

    please also refer to the high-level comment at the beginning of each
    constructor for further details.

*/

var SyntaxElementMorph, BlockMorph, BlockLabelMorph,
BlockSymbolMorph, CommandBlockMorph, ScriptsMorph,
DefinitorBlockMorph, ReporterBlockMorph, ArgMorph,
BlockSlotMorph, CommandSlotMorph, InputSlotMorph,
CSlotMorph, InputSlotStringMorph, MultiArgMorph,
ColorSlotMorph, BooleanSlotMorph, HatBlockMorph,
InputSlotTextMorph, BlockHighlightMorph, RingMorph,
TemplateSlotMorph, ReporterSlotMorph, CommentMorph,
ArgLabelMorph, RingReporterSlotMorph, FunctionSlotMorph,
RingCommandSlotMorph, TextSlotMorph, ScriptFocusMorph;

// SyntaxElementMorph //////////////////////////////////////////////////

// I am the ancestor of all blocks and input slots

// SyntaxElementMorph inherits from Morph:

SyntaxElementMorph.prototype = new Morph;
SyntaxElementMorph.prototype.constructor = SyntaxElementMorph;
SyntaxElementMorph.uber = Morph.prototype;

// SyntaxElementMorph preferences settings:

/*
    the following settings govern the appearance of all syntax elements
    (blocks and slots) where applicable:

    outline:

        corner      - radius of command block rounding
        rounding    - radius of reporter block rounding
        edge        - width of 3D-ish shading box
        hatHeight   - additional top space for hat blocks
        hatWidth    - minimum width for hat blocks
        rfBorder    - pixel width of reification border (grey outline)
        minWidth    - minimum width for any syntax element's contents

    jigsaw shape:

        inset       - distance from indentation to left edge
        dent        - width of indentation bottom

    paddings:

        bottomPadding   - adds to the width of the bottom most c-slot
        cSlotPadding    - adds to the width of the open "C" in c-slots
        typeInPadding   - adds pixels between text and edge in input slots
        labelPadding    - adds left/right pixels to block labels

    label:

        labelFontName       - <string> specific font family name
        labelFontStyle      - <string> generic font family name, cascaded
        labelSize           - <number> duh, obviously the font's own size
        fontSize            - <number> duh, obviously the font's own size
        embossing           - <Point> offset for embossing effect
        labelWidth          - <number> column width, used for word wrapping
        labelWordWrap       - <bool> if true labels can break after each word
        dynamicInputLabels  - <bool> if true inputs can have dynamic labels

    snapping:

        feedbackMinHeight   - height of white line for command block snaps
        minSnapDistance     - threshold when commands start snapping
        reporterDropFeedbackPadding  - increases reporter drop feedback

    color gradients:

        contrast        - <percent int> 3D-ish shading gradient contrast
        labelContrast   - <percent int> 3D-ish label shading contrast
        activeHighlight - <Color> for stack highlighting when active
        errorHighlight  - <Color> for error highlighting
        activeBlur      - <pixels int> shadow for blurred activeHighlight
        activeBorder    - <pixels int> unblurred activeHighlight
        rfColor         - <Color> for reified outlines and slot backgrounds
*/

SyntaxElementMorph.prototype.rfColor = new Color(128,
128, 128); SyntaxElementMorph.prototype.contrast = 65;
SyntaxElementMorph.prototype.listOfContractives = ['%rcv',
'%scndN']; /* The contractives are inside of multiargs. */
SyntaxElementMorph.prototype.setScale = function (num) {
var scale = Math.round(Math.min(Math.max(num, 1/2), 10
) * 1000) / 1000; this.scale = scale; this.corner = (
3 * scale); this.flatEdge = (scale / 2); (this.rounding
) = scale * 9; this.jag = (this.rounding / 2); (this
).inset = 6 * scale; this.hatHeight = 12 * scale; (this
).hatWidth = 70 * scale; this.rfBorder = 3 * scale; (this
).edge = scale; this.minWidth = 0; this.dent = 8 * scale;
this.cSlotPadding = this.dent / 2; this.labelPadding = (
this).cSlotPadding; this.fontSize = (10 * scale); (this
).bottomPadding = this.rfBorder; (this.typeInPadding
) = scale; this.labelFontName = ((localStorage[
'-snap-setting-language'] === 'tok') ? (
'blockTokiPonaFont') : 'blockGlobalFont'
); this.labelFontStyle = 'sans-serif'; (this
).labelSize = (10 + (contains(['blockGlobalFont',
'blockTokiPonaFont'], this.labelFontName) ? ({
'blockGlobalFont' : 0, 'blockTokiPonaFont' : 4
})[this.labelFontName] : 0)) * scale; (this
).embossing = new Point(-1 * Math.max(scale / 2,
1), -1 * Math.max(scale / 2, 1)); (this.labelWordWrap
) = true; this.labelWidth = (450 * scale); (this
).reporterDropFeedbackPadding = (10 * scale); (this
).dynamicInputLabels = true; (this.feedbackMinHeight
) = 5; this.minSnapDistance = 20; (this.activeHighlight
) = new Color(153, 255, 213); (this.errorHighlight
) = new Color(173, 15, 0); this.activeBorder = 4;
this.activeBlur = 20; this.labelContrast = 25;};
SyntaxElementMorph.prototype.isCachingInputs = (
false); SyntaxElementMorph.prototype.setScale(
1); SyntaxElementMorph.prototype.alpha = 1;

// SyntaxElementMorph label part specs:

SyntaxElementMorph.prototype.labelParts = {
    /*
        Input slots

        type: 'input'
        tags: 'numeric read-only unevaluated landscape static'
        menu: dictionary or selector
        react: selector
        value: string, number or Array for localized strings / constants
    */

    '%s': {
        type: 'input'
    },
    '%n': {
        type: 'input',
        tags: 'numeric'
    },
    '%zeroN': {
        type: 'zero number'
    },
    '%scndN': {
        type: 'second number'
    },
    '%defN': {
        type: 'default number'
    },
    '%degN': {
        type: 'degrees number'
    },
    '%antN': {
        type: 'another number'
    },
    '%txt': {
        type: 'input',
        tags: 'landscape'
    },
    '%mlt': {
        type: 'text entry',
    },
    '%code': {
        type: 'text entry',
        tags: 'monospace'
    },
    '%anyUE': {
        type: 'input',
        tags: 'unevaluated'
    },
    '%numericUE': {
        type: 'input',
        tags: 'numeric unevaluated'
    },
    '%textingUE': {
        type: 'input',
        tags: 'landscape unevaluated'
    },
    '%linesUE': {
        type: 'text entry',
        tags: 'unevaluated'
    },
    '%codeUE': {
        type: 'text entry',
        tags: 'unevaluated monospace'
    },
    '%commentTxt': {
        type: 'text entry',
        tags: 'static'
    },
    '%speakingPitch': {
        type: 'input',
        tags: 'read-only',
        menu: 'speakingPitchMenu'
    },
    '%speakingSpeed': {
        type: 'input',
        tags: 'read-only',
        menu: 'speakingSpeedMenu'
    },
    '%speakingLanguage': {
        type: 'input',
        tags: 'read-only',
        menu: 'speakingLanguageMenu'
    },
    '%dir': {
        type: 'input',
        tags: 'numeric',
        menu: {
            '§_dir': null,
            '(90) right' : 90,
            '(270) left' : 270,
            '(0) up' : 0,
            '(180) down' : 180,
            'random' : ['random']
        }
    },
    '%averageOptions': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'median': ['median'],
            'arithmetic mean': ['arithmetic mean'],
            'geometric mean': ['geometric mean'],
            'harmonic mean': ['harmonic mean'],
            'variance': ['variance']
        }
    },
    '%setAndChange': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'set': ['set'],
            'change': ['change']
        }
    },
    '%findfirst': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'item': ['item'],
            'index': ['index']
        }
    },
    '%execute': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'run': ['run'],
            'launch': ['launch']
        }
    },
    '%indexing': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'index': ['index'],
            'indexes': ['indexes']
        }
    },
    '%xAndY': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'x': ['x'],
            'y': ['y']
        }
    },
    '%downOrUpOptions': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'up': ['up'],
            'down': ['down']
        }
    },
    '%scriptChanger': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'hatize': ['hatize'],
            'definitize': ['definitize'],
            'commandize': ['commandize'],
            'reporterize': ['reporterize'],
            'predicatize': ['predicatize'],
            'arrowize': ['arrowize'],
            'ringize': ['ringize'],
            'jaggize': ['jaggize']
        }
    },
    '%note': {
        type: 'input',
        tags: 'numeric',
        menu: 'pianoKeyboardMenu'
    },
    '%inst': {
        type: 'input',
        tags: 'numeric',
        menu: 'midsMenu'
    },
    '%prim': {
        type: 'input',
        tags: 'read-only static',
        menu: 'primitivesMenu'
    },
    '%audio': {
        type: 'input',
        tags: 'read-only static',
        menu: 'audioMenu'
    },
    '%aa': { // audio attributes
        type: 'input',
        tags: 'read-only static',
        menu: {
            'name' : ['name'],
            'duration' : ['duration'],
            'length' : ['length'],
            'number of channels' : ['number of channels'],
            'sample rate' : ['sample rate'],
            'samples' : ['samples']
        }
    },
    '%cstAttrs': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'pixels' : ['pixels']
        }
    },
    '%img': { // image attributes
        type: 'input',
        tags: 'read-only static',
        menu: {
            'name' : ['name'],
            'width' : ['width'],
            'height' : ['height'],
            'pixels' : ['pixels']
        }
    },
    '%imgsource': {
        type: 'input',
        tags: 'read-only',
        menu: {
            'pen trails': ['pen trails'],
            'stage image': ['stage image']
        }
    },
    '%rate': {
        type: 'input',
        tags: 'numeric',
        menu: {
            '22.05 kHz' : 22050,
            '44.1 kHz' : 44100,
            '48 kHz' : 48000,
            '88.2 kHz' : 88200,
            '96 kHz' : 96000
        }
    },
    '%interaction': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'clicked' : ['clicked'],
            'pressed' : ['pressed'],
            'dropped' : ['dropped'],
            'mouse-entered' : ['mouse-entered'],
            'mouse-departed' : ['mouse-departed'],
            'scrolled-up' : ['scrolled-up'],
            'scrolled-down' : ['scrolled-down'],
            'paused' : ['paused'],
            'unpaused' : ['unpaused'],
            'stopped' : ['stopped']
        }
    },
    '%dates': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'year' : ['year'],
            'month' : ['month'],
            'date' : ['date'],
            'day of week' : ['day of week'],
            'hour' : ['hour'],
            'minute' : ['minute'],
            'second' : ['second'],
            'time in milliseconds' : ['time in milliseconds'],
            'days since 2000' : ['days since 2000']
        }
    },
    '%delim': {
        type: 'input',
        menu: {
            'letter' : ['letter'],
            'word' : ['word'],
            'line' : ['line'],
            'tab' : ['tab'],
            'cr' : ['cr'],
            'csv' : ['csv'],
            'json' : ['json'],
            'xml' : ['xml'],
            '~' : null,
            'blocks' : ['blocks']
            /*
            'csv records' : ['csv records'],
            'csv fields' : ['csv fields']
            */
        }
    },
    '%ida': {
        type: 'input',
        tags: 'numeric',
        menu: {
            '1' : 1,
            last : ['last'],
            '~' : null,
            all : ['all']
        }
    },
    '%idx': {
        type: 'input',
        tags: 'numeric',
        menu: {
            '1' : 1,
            last : ['last'],
            any : ['any'],
            '~' : null,
            parent : ['parent']
        }
    },
    '%la': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'length' : ['length'],
            'size' : ['size'],
            'rank' : ['rank'],
            'dimensions' : ['dimensions'],
            'flatten' : ['flatten'],
            'columns' : ['columns'],
            'uniques' : ['uniques'],
            'distribution' : ['distribution'],
            'transpose' : ['transpose'],
            'sorted' : ['sorted'],
            'shuffled' : ['shuffled'],
            'reverse' : ['reverse'],
            '~' : null,
            'lines' : ['lines'],
            'csv' : ['csv'],
            'json' : ['json'],
            'xml' : ['xml'],
            'blocks' : ['blocks']
        }
    },
    '%ta': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'length' : ['length'],
            '~' : null,
            'upper case' : ['upper case'],
            'lower case' : ['lower case']
        }
    },
    '%mlfunc': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'append' : ['append'],
            'cross product' : ['cross product']
        }
    },
    '%dim': {
        type: 'input',
        tags: 'numeric',
        menu: {
            current : ['current']
        }
    },
    '%rel': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'distance' : ['distance'],
            'direction' : ['direction'],
            'ray length' : ['ray length']
        }
    },
    '%loc': {
        type: 'input',
        tags: 'read-only',
        menu: 'locationMenu'
    },
    '%rcv': {
        type: 'input',
        tags: 'read-only',
        menu: 'receiversMenu',
        value: ['all']
    },
    '%spr': {
        type: 'input',
        tags: 'read-only',
        menu: 'objectsMenu'
    },
    '%self': {
        type: 'input',
        tags: 'read-only',
        menu: 'objectsMenuWithSelf'
    },
    '%col': { // collision detection
        type: 'input',
        tags: 'read-only',
        menu: 'collidablesMenu'
    },
    '%dst': { // distance measuring
        type: 'input',
        tags: 'read-only',
        menu: 'distancesMenu'
    },
    '%cln': { // clones
        type: 'input',
        tags: 'read-only',
        menu: 'clonablesMenu'
    },
    '%get': { // sprites, parts, specimen, clones
        type: 'input',
        tags: 'read-only static',
        menu: 'gettablesMenu'
    },
    '%cst': {
        type: 'input',
        tags: 'read-only',
        menu: 'costumesMenu'
    },
    '%eff': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            color: ['color'],
            saturation: ['saturation'],
            brightness : ['brightness'],
            red: ['red'],
            green: ['green'],
            blue: ['blue'],
            ghost: ['ghost'],
            fisheye: ['fisheye'],
            whirl: ['whirl'],
            pixelate: ['pixelate'],
            mosaic: ['mosaic'],
            negative : ['negative'],
            duplicate: ['duplicate'],
            comic: ['comic'],
            confetti: ['confetti']
        }
    },
    '%env': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            script: ['script'],
            caller: ['caller'],
            continuation: ['continuation'],
            '~' : null,
            inputs : ['inputs'],
            object : ['object']
        }
    },
    '%snd': {
        type: 'input',
        tags: 'read-only',
        menu: 'soundsMenu'
    },
    '%key': {
        type: 'input',
        tags: 'read-only',
        menu: 'keysMenu'
    },
    '%keyHat': {
        type: 'input',
        tags: 'read-only static',
        menu: 'keysMenu',
        react: 'updateEventUpvar'
    },
    '%msg': {
        type: 'input',
        tags: 'read-only',
        menu: 'messagesMenu'
    },
    '%msgHat': {
        type: 'input',
        tags: 'read-only static',
        menu: 'messagesReceivedMenu'
    },
    '%msgSend': {
        type: 'input',
        menu: 'eventsMenu'
    },
    '%att': {
        type: 'input',
        tags: 'read-only',
        menu: 'attributesMenu'
    },
    '%fun': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            abs : ['abs'],
            sign : ['sign'],
            ceiling : ['ceiling'],
            floor : ['floor'],
            perfectRound : ['perfectRound'],
            int : ['int'],
            dec : ['dec'],
            real : ['real'],
            imag : ['imag'],
            gamma : ['gamma'],
            fib : ['fib'],
            luc : ['luc'],
            nep : ['nep'],
            circ : ['circ'],
            curve : ['curve'],
            tri : ['tri'],
            tetra : ['tetra'],
            conjugate : ['conjugate'],
            'prime?' : ['prime?'],
            'periodic?' : ['periodic?'],
            'constant?' : ['constant?'],
            'happy?' : ['happy?'],
            sin : ['sin'],
            cos : ['cos'],
            tan : ['tan'],
            csin : ['csin'],
            ccos : ['ccos'],
            ctan : ['ctan'],
            sinh : ['sinh'],
            cosh : ['cosh'],
            tanh : ['tanh'],
            asin : ['asin'],
            acos : ['acos'],
            atan : ['atan'],
            asinh : ['asinh'],
            acosh : ['acosh'],
            atanh : ['atanh'],
            radians: ['radians'],
            degrees: ['degrees'],
            id: ['id']
        }
    },
    '%com': {
       type: 'input',
       tags: 'read-only static',
       menu: { 
            polar : ['polar'],
            complex : ['complex']
       }
    },
    '%con': {
       type: 'input',
       tags: 'read-only static',
       menu: 'constantsMenu'
    },
    '%layer': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            front : ['front'],
            back : ['back']
        }
    },
    '%clrdim': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            hue : ['hue'],
            saturation : ['saturation'],
            brightness : ['brightness'],
            transparency : ['transparency'],
            '~' : null,
            'r-g-b(-a)' : ['r-g-b(-a)']
        }
    },
    '%pen': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            size : ['size'],
            hue : ['hue'],
            saturation : ['saturation'],
            brightness : ['brightness'],
            transparency : ['transparency'],
            '~' : null,
            'r-g-b-a' : ['r-g-b-a']
        }
    },
    '%asp': { // aspect
        type: 'input',
        tags: 'read-only static',
        menu: {
            hue : ['hue'],
            saturation : ['saturation'],
            brightness : ['brightness'],
            transparency : ['transparency'],
            'r-g-b-a' : ['r-g-b-a'],
            '~' : null,
            sprites : ['sprites'],
        }
    },
    '%txtfun': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'encode URI' : ['encode URI'],
            'decode URI' : ['decode URI'],
            'encode URI component' : ['encode URI component'],
            'decode URI component' : ['decode URI component'],
            'XML escape' : ['XML escape'],
            'XML unescape' : ['XML unescape'],
            'JS escape' : ['JS escape'],
            'hex sha512 hash' : ['hex sha512 hash']
        }
    },
    '%setting': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'turbo mode' : ['turbo mode'],
            'flat line ends' : ['flat line ends'],
            'log pen vectors' : ['log pen vectors'],
            'video capture' : ['video capture'],
            'mirror video' : ['mirror video']
        }
    },
    '%typ': {
        type: 'input',
        tags: 'read-only static',
        menu: 'typesMenu'
    },
    '%mouseButtons': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'left' : ['left'],
            'right' : ['right']
        }
    },
    '%colorAttrs': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'hex' : ['hex'],
            'RGBA' : ['RGBA']
        }
    },
    '%clrFlags': {
       type: 'input',
       tags: 'read-only static',
       menu: {
           'light up' : ['light up'],
           'light down' : ['light down'],
           'saturate' : ['saturate'],
           'negate' : ['negate']
       }
    },
    '%batteryMenu': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'charging' : ['charging'],
            'discharging' : ['discharging']
        }
    },
    '%motorMenu': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'this way' : ['this way'],
            'that way' : ['that way'],
            'reverse' : ['reverse']
        }
    },
    '%mapValue': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            String : ['String'],
            Number : ['Number'],
            'true' : ['true'],
            'false' : ['false']
        }
    },
    '%var': {
        type: 'input',
        tags: 'read-only',
        menu: 'getVarNamesDict'
    },
    '%shd': {
        type: 'input',
        tags: 'read-only',
        menu: 'shadowedVariablesMenu'
    },

    // code mapping (experimental)

    '%codeKind': {
        type: 'input',
        tags: 'read-only',
        menu: {
            code : ['code'],
            header : ['header']
        }
    },
    '%codeListPart': {
        type: 'input',
        tags: 'read-only',
        menu: {
            'list' : ['list'],
            'item' : ['item'],
            'delimiter' : ['delimiter']
        }
    },
    '%codeListKind': {
        type: 'input',
        tags: 'read-only',
        menu: {
            'collection' : ['collection'],
            'variables' : ['variables'],
            'parameters' : ['parameters']
        }
    },
    '%scn': {
        type: 'input',
        tags: 'read-only',
        menu: 'scenesMenu'
    },

    // video

    '%videoModes': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'off': ['off'],
            'on': ['on'],
            'on flipped': ['on flipped']
        }
    },

    '%vid': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'motion': ['motion'],
            'direction': ['direction'],
            'snap': ['snap']
        }
    },

    // block

    '%block': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'spec' : ['spec'],
            'label' : ['label'],
            'definition' : ['definition'],
            'parameters' : ['parameters'],
            'variables' : ['variables'],
            'sequence' : ['sequence'],
            'selector' : ['selector'],
            'category' : ['category'],
            'custom?' : ['custom?'],
            'global?' : ['global?'],
            'pic' : ['pic']
        }
    },
    '%varShowing': {
        type: 'input',
        tags: 'read-only static',
        menu: {'show' : ['show'], 'hide' : ['hide']}
    },
    '%stopChoices': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'scene choices' : {
            'this scene but this script' : ['this scene but this script'],
            'this scene' : ['this scene'],
            'this scene and restart' : ['this scene and restart'],
            'all scenes' : ['all scenes']
            },
            'sprite choices' : {
            'this block' : ['this block'],
            'this script' : ['this script'],
            'this sprite but this script' : ['this sprite but this script'],
            'this sprite' : ['this sprite']
            }
        }
    },
    '%pauseOptions': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'scene choices' : {
            'this scene but this script' : ['this scene but this script'],
            'this scene' : ['this scene'],
            },
            'sprite choices' : {
            'this script' : ['this script'],
            'this sprite but this script' : ['this sprite but this script'],
            'this sprite' : ['this sprite']
            }
        }
    },
    '%resumeOptions': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'this scene' : ['this scene'],
            'this sprite' : ['this sprite'],
        }
    },
    '%bubbleOptions': {
       type: 'input',
       tags: 'static read-only',
       menu: {
           'say' : ['say'],
           'think' : ['think'],
           'shout' : ['shout'],
           'whisper' : ['whisper']
       }
    },
    '%timerOptions': {
       type: 'input',
       tags: 'static read-only',
       menu: {
           'pause' : ['pause'],
           'resume' : ['resume'],
           'reset' : ['reset'],
           'stop' : ['stop']
       }
    },
    '%edit': {
       type: 'input',
       tags: 'static read-only',
       menu: {
           'anything' : ['anything'],
       }
    },
    '%scripts': {
       type: 'input',
       tags: 'read-only static widget',
       menu: 'scriptsMenu'
    },
    '%asAList': {
        type: 'labelString',
        oldText: '',
        newText: 'as a list'
    },
    '%withoutRounding': {
        type: 'labelString',
        oldText: '',
        newText: 'without rounding'
    },
    '%b': {type: 'boolean'},
    '%boolUE': {
        type: 'boolean',
        tags: 'unevaluated'
    },
    '%bool': {
        type: 'boolean',
        tags: 'static'
    },
    '%bUE': {
        type: 'boolean',
        tags: 'unevaluated static'
    },
    '%cs': {type: 'c'},
    '%c': {
        type: 'c',
        tags: 'static'
    },
    '%cl': {
        type: 'c',
        tags: 'static lambda'
    },
    '%ca': {
        type: 'c',
        tags: 'loop'
    },
    '%loop': {
        type: 'c',
        tags: 'static loop'
    },
    '%cla': {
        type: 'c',
        tags: 'static lambda loop'
    },
    '%t': {
        type: 'template',
        label: '\xa0'
    },
    '%upvar': {
        type: 'template',
        label: '\xa0'
    },
    '%loopName': {
        type: 'script variable',
        label: 'loop'
    },
    '%br': {type: 'break'},
    '%inputName': {
        type: 'template',
        tags: 'static',
        label: localize('Input Name'),
    },
    '%cmd': {
        type: 'slot',
        kind: 'command'
    },
    '%r': {
        type: 'slot',
        kind: 'reporter'
    },
    '%p': {
        type: 'slot',
        kind: 'predicate'
    },
    '%f': {
        type: 'slot',
        tags: 'static',
        kind: 'function'
    },
    '%instr': {
        type: 'slot',
        tags: 'static',
        kind: 'instructions'
    },
    '%rc': {
        type: 'ring slot',
        tags: 'static',
        kind: 'command'
    },
    '%rr': {
        type: 'ring slot',
        tags: 'static',
        kind: 'reporter'
    },
    '%rp': {
        type: 'ring slot',
        tags: 'static',
        kind: 'predicate'
    },
    '%obj': {
        type: 'slot',
        kind: 'object'
    },
    '%sound': {
        type: 'slot',
        kind: 'sound'
    },
    '%l': {
        type: 'slot',
        kind: 'list'
    },
    '%costume': {
        type: 'slot',
        kind: 'costume'
    },
    '%clr': {
        type: 'slot',
        kind: 'color'
    },
    '%unknownSlot': {
        type: 'slot',
        kind: 'unknown'
    },
    '%cmdRing': {
        type: 'block',
        selector: 'reifyScript'
    },
    '%repRing': {
        type: 'block',
        selector: 'reifyReporter'
    },
    '%predRing': {
        type: 'block',
        selector: 'reifyPredicate'
    },

    /*
        type: 'symbol'
        name: string
        color: a color, default is WHITE
        scale: float (factor of fontSize) default is 1
        tags: 'static fading protected' (protected = no zebra coloring)
    */
    '%unknown': {
        type: 'text symbol',
        name: '?'
    },
    '%wardrobe': {
        type: 'symbol',
        name: 'poster',
        scale: 6/5
    },
    '%turtle': {
        type: 'symbol',
        name: 'turtle',
        scale: 6/5
    },
    '%turtleOutline': {
        type: 'symbol',
        name: 'turtleOutline',
        scale: 6/5
    },
    '%pipette': {
        type: 'symbol',
        name: 'pipette',
        scale: 6/5
    },
    '%notes': {
        type: 'symbol',
        name: 'notes',
        scale: 6/5
    },
    '%verticalEllipsis': {
        type: 'symbol',
        name: 'verticalEllipsis',
        scale: 6/5
    },
    '%list': {
        type: 'symbol',
        name: 'list'
    },
    '%flagTheme': {
        type: 'symbol',
        name: 'flagTheme'
    },
    '%loopArrow': {
        type: 'symbol',
        name: 'loop',
        scale: 7/10,
        tags: 'fading'
    },

    // javascript

    '%jsAwaitHideout': {
        type: 'labelString',
        oldText: '',
        newText: 'await'
    },
    '%jsParethesesStatement': {
        type: 'block',
        selector: 'jsParethesesStatement'
    },
    '%jsBlockBracesStatement1': {
        type: 'block',
        selector: 'jsBlockBracesStatement1'
    },
    '%jsBlockBracesStatement2': {
        type: 'block',
        selector: 'jsBlockBracesStatement2'
    },
    '%jsBreakChanging': {
        type: 'labelString',
        oldText: 'break',
        newText: 'continue'
    },
    '%jsReporterHideout': {
        type: 'multi',
        tags: 'static',
        slots: '%rr',
        max: 1
    },
    '%jsCaseOrDefault': {
        type: 'multi',
        tags: 'static',
        slots: '%n',
        dflt: [0],
        label: 'case',
        collapse: 'default',
        defaults: 1,
        max: 1
    },
    '%jsReturnChanging': {
        type: 'labelString',
        oldText: 'return',
        newText: 'throw'
    },
    '%jsNullChanging': {
        type: 'labelString',
        oldText: 'null',
        newText: 'undefined'
    },
    '%jsInputHideout': {
        type: 'multi',
        tags: 'static',
        slots: '%n',
        dflt: [0],
        max: 1
    },
    '%jsArrayPrimitive': {
        type: 'block',
        selector: 'jsArrayPrimitive',
    },
    '%jsComparatorsMenu': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            '==': ['=='],
            '===': ['==='],
            '!=': ['!='],
            '!==': ['!=='],
            '>': ['>'],
            '>=': ['>='],
            '<': ['<'],
            '<=': ['<='],
            '&&': ['&&'],
            '||': ['||'],
            '===': ['==='],
            '!=': ['!='],
        }
    },
    '%jsVariableMenu': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            'var': ['var'],
            'let': ['let'],
            'const': ['const']
        }
    },
    '%jsVariadicInputsSyntax': {
        type: 'block',
        tags: 'static',
        selector: 'jsVariadicInputsSyntax'
    },
    '%jsVariadicProperties': {
        type: 'multi',
        tags: 'static',
        infix: ',',
        slots: '%jsVariableSetter',
        min: 1
    },
    '%jsVariadicParameters': {
        type: 'multi',
        tags: 'static',
        slots: '%jsVariableSetter',
        infix: ','
    },
    '%jsVariadicAttributes': {
        type: 'multi',
        tags: 'static',
        slots: '%jsPropertySetter',
        infix: ','
    },
    '%jsCommaInputs': {
        type: 'multi',
        tags: 'static widget',
        slots: '%n',
        infix: ',',
        dflt: [0]
    },
    '%jsCommaParms': {
        type: 'multi',
        slots: '%t',
        infix: ','
    },
    '%jsVariableSetter': {
        type: 'block',
        selector: 'jsVariableSetter'
    },
    '%jsPropertySetter': {
        type: 'block',
        selector: 'jsPropertySetter'
    },
    '%jsOptionalSetting': {
        type: 'multi',
        tags: 'static widget',
        group: '\= %n',
        dflt: [0],
        max: 1
    },
    '%jsElseHideout': {
        type: 'multi',
        label: 'else',
        slots: '%jsBlockBracesStatement1',
        tags: 'static widget',
        max: 1
    },
    '%jsElseIf': {
        type: 'multi',
        group: 'else if \( %rp \) %jsBlockBracesStatement1',
        tags: 'static widget'
    },
    '%jsAsyncHideout': {
        type: 'labelString',
        oldText: '',
        newText: 'async'
    },
    '%jsFunctionOrGenerator': {
        type: 'labelString',
        oldText: 'function',
        newText: 'function*'
    },
    '%jsFunctionName': {
        type: 'multi',
        slots: '%t',
        dflt: ['anonymous'],
        max: 1
    },
    '%jsMiscellaneousName': {
        type: 'input',
        tags: 'static'
    },
    '%jsBool': {
        type: 'boolean',
        tags: 'static binary'
    },
    '%jsComment': {
        type: 'text entry',
        tags: 'static'
    },
    '%jsParenthesesGrouping': {
        type: 'multi',
        tags: 'static',
        slots: '%n',
        infix: '\)\(',
        dflt: [0],
        min: 1
    },

    // specialized variadic inputs
    /*
        type: 'multi'
        slots: a slot spec string
        label: (optional)
        infix: (optional)
        collapse: (optional) alternative label to "Input list"
        tags: 'widget' // doesn't count as "empty" slot implicit parameter
        min: (optional) number of minimum inputs) or zero
        max: (optional) number of maximum inputs) or zero
        defaults: (optional) number of visible slots to begin with or zero
        dflt: (optional) array with default value(s)
        group: (optional) number of slots including labels to expand or collapse
    */

    '%inputs': {
        type: 'multi',
        slots: '%s',
        label: 'with inputs',
        tags: 'widget'
    },
    '%commentHidden': {
        type: 'multi',
        slots: '%commentTxt',
        tags: 'static widget',
        hidden: true
    },
    '%scriptHidden': {
        type: 'multi',
        slots: '%c',
        tags: 'static widget',
        hidden: true
    },
    '%send': {
        type: 'multi',
        slots: '%msgSend',
        label: 'and trigger',
        tags: 'static',
        max: 1
    },
    '%receive': {
        type: 'multi',
        slots: '%rcv',
        label: 'to',
        tags: 'static',
        max: 1
    },
    '%timingOptions': {
        type: 'multi',
        slots: '%scndN',
        label: 'for secs in',
        tags: 'static widget',
        max:  1
    },
    '%combiPermn': {
        type: 'labelString',
        oldText: 'C',
        newText: 'P'
    },
    '%alpha': {
        type: 'multi',
        slots: '%defN',
        label: 'A:',
        tags: 'static widget',
        max:  1
    },
    '%optNum': {
        type: 'multi',
        slots: '%antN',
        label: 'optional:',
        tags: 'static widget',
        max:  1
    },
    '%optDir': {
        type: 'multi',
        slots: '%degN',
        label: 'in direction of:',
        tags: 'static widget',
        max:  1
    },
    '%decNum': {
        type: 'multi',
        tags: 'static widget',
        label: 'with decimals in',
        slots: '%zeroN',
        max: 1
    },
    '%decay': {
        type: 'multi',
        tags: 'static widget',
        label: 'and decay?',
        slots: '%b',
        max: 1
    },
    '%selector': {
        type: 'multi',
        tags: 'static widget',
        label: 'with selector',
        slots: '%s',
        max: 1
    },
    '%scriptVars': {
        type: 'multi',
        slots: '%t',
        tags: 'widget',
        min: 1
    },
    '%blockVars': {
        type: 'multi',
        slots: '%t',
        label: 'block variables',
        tags: 'widget'
    },
    '%message': {
        type: 'multi',
        slots: '%t',
        tags: 'widget',
        max: 1
    },
    '%keyName': {
        type: 'multi',
        slots: '%t',
        tags: 'widget',
        max: 1
    },
    '%parms': {
        type: 'multi',
        slots: '%t',
        label: 'Input names:',
        tags: 'widget'
    },
    '%ringparms': {
        type: 'multi',
        slots: '%t',
        label: 'input names:'
    },
    '%words': {
        type: 'multi',
        slots: '%s',
        defaults: 2
    },
    '%nums': {
        type: 'multi',
        slots: '%n',
        defaults: 2
    },
    '%booleans': {
        type: 'multi',
        slots: '%b',
        defaults: 2
    },
    '%lists': {
        type: 'multi',
        slots: '%l',
        defaults: 2
    },
    '%colors': {
        type: 'multi',
        slots: '%clr',
        defaults: 2
    },
    '%exp': {
        type: 'multi',
        slots: '%s',
        label: '',
        tags: 'static widget'
    },
    '%sum': {
        type: 'multi',
        slots: '%n',
        min: 2,
        infix: '+',
        collapse: '∑\='
    },
    '%product': {
        type: 'multi',
        slots: '%n',
        defaults: 1,
        min: 1,
        infix: '\)\(',
        collapse: '∏\='
    },
    '%min': {
        type: 'multi',
        slots: '%n',
        min: 2,
        infix: 'min',
        collapse: 'minimum\='
    },
    '%max': {
        type: 'multi',
        slots: '%n',
        min: 2,
        infix: 'max',
        collapse: 'maximum\='
    },
    '%averageNumbers': {
        type: 'multi',
        slots: '%n',
        min: 2
    },
    '%and': {
        type: 'multi',
        slots: '%b',
        min: 2,
        infix: 'and',
        collapse: 'all'
    },
    '%or': {
        type: 'multi',
        slots: '%b',
        min: 2,
        infix: 'or',
        collapse: 'any'
    },
    '%equals': {
        type: 'multi',
        slots: '%s',
        min: 2,
        infix: '=',
        collapse: 'siblings\='
    },
    '%notequals': {
        type: 'multi',
        slots: '%s',
        min: 2,
        infix: '≠',
        collapse: 'neighbors\≠'
    },
    '%identicals': {
        type: 'multi',
        slots: '%s',
        min: 2,
        infix: '≡',
        collapse: 'copies\≡'
    },
    '%mix': {
        type: 'multi',
        slots: '%clr',
        min: 2,
        infix: 'with',
        collapse: 'with colors:'
    },
    '%elseif': {
        type: 'multi',
        group: 'else if %b %c',
        dflt: [true, null],
        tags: 'static widget'
    }
};

// SyntaxElementMorph instance creation:

function SyntaxElementMorph () {this.init();};

SyntaxElementMorph.prototype.init = function () {
this.cachedClr = null; this.cachedClrBright = null;
this.cachedClrDark = null; (this.cachedNormalColor
) = null; this.isStatic = false; (SyntaxElementMorph
).uber.init.call(this); this.defaults = []; (this
).cachedInputs = null; delete this.alpha;};

// SyntaxElementMorph accessing:

SyntaxElementMorph.prototype.parts = function () {
    // answer my non-crontrol submorphs
    var nb = null;
    if (this.nextBlock) { // if I am a CommandBlock or a HatBlock
        nb = this.nextBlock();
    };  return this.children.filter(
        child => (child !== nb) &&
            !(child instanceof ShadowMorph) && !(
            child instanceof BlockHighlightMorph));};

SyntaxElementMorph.prototype.inputs = function () {
if (isNil(this.cachedInputs) || !this.isCachingInputs
) {this.cachedInputs = this.parts().filter(part => (
part instanceof SyntaxElementMorph));};
return this.cachedInputs;};

SyntaxElementMorph.prototype.debugCachedInputs = function () {
    // private - only used for manually debugging inputs caching
    var realInputs, i;
    if (!isNil(this.cachedInputs)) {
        realInputs = this.parts().filter(part =>
            part instanceof SyntaxElementMorph
        );
    };  if (this.cachedInputs.length !== realInputs.length) {
        throw new Error('cached inputs size do not match: ' +
            this.constructor.name);
    };  for (i = 0; i < realInputs.length; i += 1) {
        if (this.cachedInputs[i] !== realInputs[i]) {
            throw new Error('cached input does not match: ' +
                this.constructor.name +
                ' #' +
                i +
                ' ' +
                this.cachedInputs[i].constructor.name +
                ' != ' +
                realInputs[i].constructor.name);
        };};};

SyntaxElementMorph.prototype.allInputs = function () {
    // answer arguments and nested reporters of all children
    return this.allChildren().slice(0).reverse().filter(child =>
        (child instanceof ArgMorph) ||
            (child instanceof ReporterBlockMorph &&
                child !== this)
    );};

SyntaxElementMorph.prototype.allEmptySlots = function (
) {var empty = []; if (!(this instanceof RingMorph) && (
!(contains(['reportJSFunction', 'reportScript', 'reify',
'reifyScript', 'reifyReporter', 'reifyPredicate'],
this.selector)))) {this.children.forEach(morph => {
if (morph.isEmptySlot && morph.isEmptySlot()) {
empty.push(morph);} else if (morph.allEmptySlots) {
empty = empty.concat(morph.allEmptySlots());};});};
return empty;}; /* Detect all replaceable slots. */

SyntaxElementMorph.prototype.tagExitBlocks = function (stopTag, isCommand) {
if (this.selector === 'doReport') {this.partOfCustomCommand = isCommand;
} else if (this.selector === 'doStopThis') {this.exitTag = stopTag;} else {
if (!(this instanceof RingMorph)) {this.children.forEach(morph => {if (
morph.tagExitBlocks) {morph.tagExitBlocks(stopTag, isCommand);};});};};};

SyntaxElementMorph.prototype.replaceInput = function (oldArg,
newArg) {var scripts = this.parentThatIsA(ScriptsMorph),
replacement = newArg, idx = this.children.indexOf(oldArg
), i = 0; if ((idx < 0) && (newArg instanceof MultiArgMorph
)) {this.children.forEach(morph => {if ((morph instanceof (
ArgLabelMorph)) && (morph.argMorph() === oldArg)) {idx = i;};
i += 1;});}; if (oldArg.cachedSlotSpec) {(oldArg.cachedSlotSpec
) = null;}; if (newArg.cachedSlotSpec) {(newArg.cachedSlotSpec
) = null;}; this.changed(); if (newArg.parent) {(newArg.parent
).removeChild(newArg);}; if (oldArg instanceof MultiArgMorph
) {(oldArg.inputs()).forEach(inp => oldArg.replaceInput(inp,
new InputSlotMorph)); if (((this.dynamicInputLabels) || (
oldArg.collapse)) && (newArg instanceof ReporterBlockMorph
)) {replacement = new ArgLabelMorph(newArg, oldArg.collapse
);};}; replacement.parent = this; this.children[idx] = (
replacement); if ((oldArg instanceof ReporterBlockMorph
) && scripts && !(oldArg.isPrototype)) {if (!((oldArg
) instanceof RingMorph) || ((oldArg instanceof RingMorph
) && oldArg.contents())) {scripts.add(oldArg); (oldArg
).moveBy(replacement.extent()); oldArg.fixBlockColor();
};}; if ((replacement instanceof MultiArgMorph) || (
replacement instanceof ArgLabelMorph) || ((replacement
).constructor === CommandSlotMorph)) {(replacement
).fixLayout(); if (this.fixLabelColor) {(this
).fixLabelColor();};} else {this.fixLayout();
}; this.cachedInputs = null;};

SyntaxElementMorph.prototype.revertToDefaultInput = function (arg, noValues) {
    var deflt = this.revertToEmptyInput(arg),
        inp = this.inputs().indexOf(deflt),
        def;
    if (noValues || inp < 0) {
        return deflt;
    };  if (this instanceof BlockMorph
        )  {if (this.isCustomBlock) {
            def = this.isGlobal ? this.definition
                    : this.scriptTarget().getMethod(this.blockSpec);
            if (!noValues && (
                (deflt instanceof InputSlotMorph) ||
                (deflt instanceof BooleanSlotMorph))
            )  {deflt.setContents(
                    def.defaultValueOfInputIdx(inp)
                );};};};
    if (deflt instanceof MultiArgMorph && !inp) {
        // first - and only - input is variadic
        deflt.setContents(this.defaults);
        deflt.defaults = this.defaults;
    } else if (!isNil(this.defaults[inp])) {
        deflt.setContents(this.defaults[inp]);
        if (deflt instanceof MultiArgMorph) {
            deflt.defaults = this.defaults[inp];
        };}; return deflt;};

SyntaxElementMorph.prototype.revertToEmptyInput = function (arg) {
    var idx = this.parts().indexOf(arg),
        inp = this.inputs().indexOf(arg),
        deflt = new InputSlotMorph,
        rcvr, def;

    if (idx > -1) {
        if (this instanceof BlockMorph) {
            deflt = this.labelPart(this.parseSpec(this.blockSpec)[idx]);
            if (this.isCustomBlock) {
                if (this.isGlobal) {
                    def = this.definition;
                } else {
                    rcvr = this.scriptTarget(true);
                    if (rcvr) {
                        def = rcvr.getMethod(this.blockSpec);
                    };
                };  if (def) {
                    if (deflt instanceof InputSlotMorph) {
                        deflt.setChoices.apply(
                            deflt,
                            def.inputOptionsOfIdx(inp)
                        );
                    } else if (deflt instanceof MultiArgMorph) {
                        deflt.setInfix(def.separatorOfInputIdx(inp));
                    };
                };
            };
        } else if (this instanceof MultiArgMorph) {
            deflt = this.labelPart(this.slotSpecFor(inp));
        } else if (this instanceof ReporterSlotMorph) {
            deflt = this.emptySlot();
        };
    };  if (deflt.icon || deflt instanceof BooleanSlotMorph
        )  {deflt.fixLayout();
    };  this.replaceInput(arg, deflt);
    if (deflt instanceof MultiArgMorph) {
        deflt.refresh();
    } else if (deflt instanceof RingMorph) {
        deflt.fixBlockColor();
    };  this.cachedInputs = null;
    return deflt;};

SyntaxElementMorph.prototype.isLocked = (
function () {return this.isStatic;});

// SyntaxElementMorph enumerating:

SyntaxElementMorph.prototype.topBlock = function (
) {if (this.parent && ((this.parent).topBlock)) {
return this.parent.topBlock();}; return this;};

// SyntaxElementMorph reachable variables

SyntaxElementMorph.prototype.getVarNamesDict = function () {
var block = this.parentThatIsA(BlockMorph), tempVars = [
], rcvr, dict; if (!block) {return {};}; rcvr = (block
).scriptTarget(); block.allParents().forEach(morph => {
if (morph instanceof PrototypeHatBlockMorph) {(tempVars
).push.apply(tempVars, morph.variableNames()); (tempVars
).push.apply(tempVars, morph.inputs()[0].inputFragmentNames(
));} else if (morph instanceof BlockMorph) {(morph.inputs()
).forEach(inp => {inp.allChildren().forEach(child => {if ((
child) instanceof TemplateSlotMorph) {tempVars.push((child
).contents());} else if (child instanceof MultiArgMorph) {
(child.children).forEach(m => {if (m instanceof (
TemplateSlotMorph)) {tempVars.push(m.contents());};
});};});});};}); if (rcvr) {dict = (rcvr.variables
).allNamesDict(); tempVars.forEach(name => dict[name
] = name); if (block.selector === 'doSetVar') {dict[
'~'] = null; dict.my = [{'anchor' : ['my anchor'],
'parent' : ['my parent'], 'name' : ['my name'],
'temporary?' : ['my temporary?'], 'dangling?' : [
'my dangling?'], 'draggable?' : ['my draggable?'
], 'rotation style' : ['my rotation style'
], 'rotation x' : ['my rotation x'],
'rotation y' : ['my rotation y']}];
if (world.currentKey === 16) {(dict
).my[0]['~'] = null; (dict.my[0]
)['microphone modifier'] = [
'microphone modifier'];};};
return dict;}; return {};};

// Variable refactoring

SyntaxElementMorph.prototype.refactorVarInStack = function (
    oldName,
    newName,
    isScriptVar
)  {// Rename all oldName var occurrences found in this block stack into newName
    // taking care of not being too greedy

    if ((this instanceof RingMorph && contains(this.inputNames(), oldName))
            || (!isScriptVar && this.definesScriptVariable(oldName))) {
        return;
    };  if (this.selector === 'reportGetVar'
            && this.blockSpec === oldName) {
        this.setSpec(newName);
        this.fullChanged();
        this.fixLabelColor();
    };  if (this.choices === 'getVarNamesDict'
            && this.contents().text === oldName) {
        this.setContents(newName);
    };  if (this instanceof CustomCommandBlockMorph) {
    var theDefinition = this.definition;
    if (isNil(theDefinition)) {theDefinition = this.scriptTarget(
    ).getMethod(this.semanticSpec);}; if (isNil(theDefinition.declarations.get(
    oldName)) && !contains(theDefinition.variableNames, oldName)) {
        theDefinition.body.expression.refactorVarInStack(oldName, newName);
    };}; this.inputs().forEach(input =>
        input.refactorVarInStack(oldName, newName)
    );  if (this.nextBlock) {
        var nb = this.nextBlock();
        if (nb) {
            nb.refactorVarInStack(oldName, newName);
        };};};

SyntaxElementMorph.prototype.definesScriptVariable = function (name) {
    // Returns true if this block is defining either a script local var or
    // an upVar called `name`
    return (this.selector === 'doDeclareVariables' ||
            (this.blockSpec && this.blockSpec.match('%upvar'))
    ) && detect(
        this.inputs()[0].allInputs(),
            input => (input.selector === 'reportGetVar' &&
                input.blockSpec === name)
    );};

// SyntaxElementMorph copy-on-write support:

SyntaxElementMorph.prototype.selectForEdit = function (
) {var scripts = this.parentThatIsA(ScriptsMorph),
ide = this.parentThatIsA(IDE_Morph), rcvr = (ide ? (
ide.currentSprite) : null), selected; if ((scripts
) && rcvr && (rcvr.inheritsAttribute('scripts'))) {
this.selectionID = true; rcvr.shadowAttribute('scripts'
); selected = detect(rcvr.scripts.allChildren(),
(m => m.selectionID)); delete this.selectionID;
delete selected.selectionID; return selected;
}; return this;}; /* Select while editing. */

// SyntaxElementMorph drag & drop:

SyntaxElementMorph.prototype.reactToGrabOf = function (grabbedMorph) {
var topBlock = this.topBlock(), affected; if (grabbedMorph instanceof (
CommandBlockMorph)) {affected = this.parentThatIsA(CommandSlotMorph,
ReporterSlotMorph); if (affected) {affected.fixLayout();};}; if (
topBlock) {topBlock.allComments().forEach(comment => ((comment
).align(topBlock))); if (topBlock.getHighlight()) {(topBlock
).addHighlight(topBlock.removeHighlight());};};};

// SyntaxElementMorph 3D - border color rendering:

SyntaxElementMorph.prototype.bright = function () {
return this.color.lighter(this.contrast).toString();
}; SyntaxElementMorph.prototype.dark = function () {
return this.color.darker(this.contrast).toString();};

// SyntaxElementMorph color changing:

SyntaxElementMorph.prototype.setColor = function (
aColor) {var block; if (aColor) {if (!((this.color
).eq(aColor))) {block = this.parentThatIsA(BlockMorph
); this.color = aColor; this.children.forEach(morph => {
if (block && ((morph instanceof StringMorph) || ((morph
) instanceof SymbolMorph))) {morph.shadowColor = (block
).color.darker(block.labelContrast); morph.rerender(
);} else if (morph instanceof CommandSlotMorph) {
morph.setColor(aColor);};}); if (block) {(block
).fixLabelColor();}; this.rerender();};};};

SyntaxElementMorph.prototype.setLabelColor = function (
    textColor,
    shadowColor,
    shadowOffset
)  {this.children.forEach(morph => {
        if (morph instanceof StringMorph && !morph.isProtectedLabel) {
            morph.shadowOffset = shadowOffset || morph.shadowOffset;
            morph.shadowColor = shadowColor || morph.shadowColor;
            morph.setColor(textColor);
        } else if (morph instanceof MultiArgMorph
                || morph instanceof ArgLabelMorph
                || (morph instanceof SymbolMorph && !morph.isProtectedLabel)
                || (morph instanceof InputSlotMorph
                    && morph.isReadOnly)) {
            morph.setLabelColor(textColor, shadowColor, shadowOffset);
        } else if (morph.isLoop) { // C-shaped slot with loop arrow symbol
            (morph.loop()).setLabelColor(textColor, shadowColor, shadowOffset);
        };});};

SyntaxElementMorph.prototype.flash = function () {
    if (!this.cachedNormalColor) {
        this.cachedNormalColor = this.color;
        this.setColor(this.activeHighlight);
    };};

SyntaxElementMorph.prototype.unflash = function () {
    if (this.cachedNormalColor) {
        var clr = this.cachedNormalColor;
        this.cachedNormalColor = null;
        this.setColor(clr);
    };};

SyntaxElementMorph.prototype.doWithAlpha = function (
alpha, callback) {var current = ((SyntaxElementMorph
).prototype.alpha), result; ((SyntaxElementMorph
).prototype.alpha) = alpha; result = callback();
SyntaxElementMorph.prototype.alpha = (
current); return result;};

// SyntaxElementMorph zebra coloring

SyntaxElementMorph.prototype.fixBlockColor = function (
nearestBlock, isForced) {this.children.forEach((morph
) => {if (morph instanceof SyntaxElementMorph) {(morph
).fixBlockColor(nearestBlock, isForced);};});};

SyntaxElementMorph.prototype.pictureLabelExceptions = {'%l' : '\uFE19'
/* '%verticalEllipsis' */, '%clr' : '%pipette', '%obj' : '%turtle'};

// SyntaxElementMorph label parts:

SyntaxElementMorph.prototype.labelPart = function (spec) {
    var part, info, tokens, cnts, i;
    if (spec[0] === '%' &&
            spec.length > 1 &&
            (!(this.selector == 'reportGetVar') ||
                (contains(Object.values(SyntaxElementMorph.prototype.pictureLabelExceptions), spec) && this.isObjInputFragment()))) {

        // check for variable multi-arg-slot:
        if ((spec.length > 5) && (spec.slice(0, 5) === '%mult')) {
            part = new MultiArgMorph(spec.slice(5));
            part.addInput();
            return part;
        }; // single-arg and specialized multi-arg slots:
        // look up the spec
        info = this.labelParts[spec];
        if (!info) {throw new Error('label part spec not found: "' + spec + '"');};
        // create the morph
        switch (info.type) {
        case 'labelString':
            part = new StringSyntaxMorph(
            info.oldText, info.newText,
            spec); break; case 'input':
            part = new InputSlotMorph(null, null, info.menu);
            part.onSetContents = (info.react || null);
            break;
        case 'default number':
            part = new InputSlotMorph(1, true);
            break;
        case 'second number':
            part = new InputSlotMorph(2, true);
            break;
        case 'zero number':
            part = new InputSlotMorph(0, true);
            break;
        case 'degrees number':
            part = new InputSlotMorph(
            90, true, {'§_dir': null,
             '(90) right' : 90,
             '(270) left' : 270,
             '(0) up' : 0,
             '(180) down' : 180,
             'random' : ['random']
            }); break;
        case 'another number':
            part = new InputSlotMorph(
            50, true); break;
        case 'text entry':
            part = new TextSlotMorph;
            break;
        case 'slot':
            switch (info.kind) {
            case 'command':
            part = new CommandSlotMorph;
            break; case 'reporter':
            part = new ReporterSlotMorph;
            break; case 'predicate':
            part = new ReporterSlotMorph(
            true); break; case 'function':
            part = new RingReporterSlotMorph;
            part.getSpec = (() => '%f');
            break; case 'instructions':
            part = new BlockSlotMorph;
            break; case 'color': part = (
            new ColorSlotMorph); if ((this
            ) instanceof BlockMorph) {if (
            this.selector === 'getColor') {
            part.isStatic = true;};}; break;
            default: part = new ArgMorph(
            info.kind);}; break;
        case 'boolean': part = new BooleanSlotMorph(null,
            (((typeof info.tags) === 'string') ? !(((info
            ).tags).includes('binary')) : true)); break;
            case 'symbol': part = new BlockSymbolMorph((
            info.name === 'flagTheme' ? 'flag' : info.name
            )); part.size = (this.labelSize * (((info.name
            ) === 'flagTheme') ? 3/2 : (info.scale || 1)));
            part.color = ((info.name === 'flagTheme') ? (IDE_Morph
            ).prototype.flagColor : (info.color || WHITE));
            part.shadowColor = this.color.darker(this.labelContrast
            ); part.shadowOffset = (MorphicPreferences.isFlat ? (
            ZERO) : this.embossing); if (info.name === 'flagTheme'
            ) {part.setLabelColor = nop;}; part.fixLayout(); break;
            case 'text symbol': part = new TextMorph(info.name
            ); part.size = (this.fontSize * (info.scale || 1));
            part.color = info.color || WHITE; (part.shadowColor
            ) = this.color.darker(this.labelContrast); (part
            ).shadowOffset = (MorphicPreferences.isFlat ? (
            ZERO) : this.embossing); part.fixLayout(); break;
        case 'c': part = new CSlotMorph; break;
        case 'script variable': part = new ReporterBlockMorph;
            part.category = 'variables'; part.fixBlockColor();
            part.selector = 'reportGetVar'; part.setSpec(info.label
            ); part.isDraggable = true; break; case 'block':
            part = SpriteMorph.prototype.blockForSelector(
            info.selector, true); part.isDraggable = (((typeof (
            info.tags)) === 'string') ? !((info.tags).includes(
            'static')) : true); break; case 'ring slot': switch (
            info.kind) {case 'command': part = (
            new RingCommandSlotMorph); break;
            default:
               part = new RingReporterSlotMorph(
               info.kind === 'predicate');
               part.color = this.color;
            }; break;
        case 'template':
            part = new TemplateSlotMorph(info.label);
            break;
        case 'break':
            part = new Morph; part.setExtent(
            ZERO); part.isBlockLabelBreak = true;
            part.getSpec = (() => '%br'); break;
        case 'multi':
            part = new MultiArgMorph(
                info.slots, info.label,
                info.min || 0,   spec,
                null, null, null, null,
                null, info.infix, (info
                ).collapse, info.dflt,
                info.group, info.hidden
            );  part.maxInputs = (info.hidden ? 1 : info.max
            );  for (i = 0; i < (info.hidden ? 1 : ((info.defaults
            ) || 0)); i += 1) {part.addInput();};  break; default:
            throw new Error('unknown label part type: "' + info.type + '"');
        };

        // apply the tags
        // ---------------
        // input: numeric, read-only, unevaluated, landscape, static
        // text entry: monospace
        // boolean: unevaluated, static
        // symbol: static, fading, protected
        // c: loop, static, lambda
        // command slot: (none)
        // ring: static
        // ring slot: static
        // template: (none)
        // color: static
        // break: (none)
        // variable: (none)
        // multi: widget

        if (info.tags) {
            info.tags.split(' ').forEach(tag => {
                if (tag) {
                    switch (tag) {
                    case 'numeric':
                        part.isNumeric = true;
                        break;
                    case 'read-only':
                        part.isReadOnly = true;
                        if (!(MorphicPreferences.isFlat)) {
                            cnts = part.contents();
                            cnts.shadowOffset = new Point(1, 1);
                            cnts.fixLayout();
                        };  break;
                    case 'unevaluated':
                        part.isUnevaluated = true;
                        break;
                    case 'static':
                        part.isStatic = true;
                        break;
                    case 'landscape':
                        part.minWidth = part.height() * 2;
                        break;
                    case 'monospace':
                        part.contents().acceptedFontName = 'morphicGlobalCodeScript';
                        part.contents().fixLayout();
                        break;
                    case 'fading':
                        part.isFading = true;
                        break;
                    case 'protected':
                        part.isProtectedLabel = true;
                        break;
                    case 'loop':
                        part.isLoop = true;
                        part.add(this.labelPart('%loopArrow'));
                        break;
                    case 'lambda':
                        part.isLambda = true;
                        break;
                    case 'widget':
                        part.canBeEmpty = false;
                        break;
                    };
                };
            });  part.fixLayout();
        };

        // apply the default value
        // -----------------------
        // only for input slots and Boolean inputs,
        // and only for rare exceptions where we cannot
        // specify the default values in the block specs,
        // e.g. for expandable "receiver" slots in "broadcast"

        if (!isNil(info.value)) {
            part.setContents(info.value);
        }

    } else if (spec[0] === '$' &&
            spec.length > 1 &&
            this.selector !== 'reportGetVar') {

        // allow GUI symbols as label icons
        // usage: $symbolName[-size-r-g-b], size and color values are optional
        // If there isn't a symbol under that name, it just styles whatever is
        // after "$", so you can add unicode icons to your blocks, for example
        // ☺️
        tokens = spec.slice(1).split('-');
        if (!contains(SymbolMorph.prototype.names, tokens[0])) {
            part = new StringMorph(tokens[0]);
            part.acceptedFontName = this.labelFontName;
            part.fontStyle = this.labelFontStyle;
            part.fontSize = this.fontSize * (+tokens[1] || 1);
        } else {
            part = new BlockSymbolMorph(tokens[0]);
            part.size = this.fontSize * (+tokens[1] || 1.2);
        };  part.color = new Color(
            +tokens[2] === 0 ? 0 : +tokens[2] || 255,
            +tokens[3] === 0 ? 0 : +tokens[3] || 255,
            +tokens[4] === 0 ? 0 : +tokens[4] || 255
        ); part.isProtectedLabel = tokens.length > 2; // zebra colors
        part.shadowColor = this.color.darker(this.labelContrast);
        part.shadowOffset = MorphicPreferences.isFlat ?
                ZERO : this.embossing;
        part.fixLayout();
    } else {
        part = new BlockLabelMorph(
            spec, // text
            this.labelSize, // labelSize
            this.labelFontStyle, // fontStyle
            true, // bold
            false, // italic
            false, // isNumeric
            MorphicPreferences.isFlat ?
                    ZERO : this.embossing, // shadowOffset
            this.color.darker(this.labelContrast), // shadowColor
            WHITE, // color
            this.labelFontName // fontName
        );
    };  return part;};

SyntaxElementMorph.prototype.isObjInputFragment = function () {
return (((this.selector === 'reportGetVar') && (this.getSlotSpec(
) === '%t')) && contains(Object.keys((SyntaxElementMorph.prototype
).pictureLabelExceptions), this.parent.fragment.type));};

// SyntaxElementMorph layout:

SyntaxElementMorph.prototype.fixLayout = function (
) {var nb, parts = this.parts(), pos = this.position(
), x = 0, y, lineHeight = 0, maxX = 0, blockWidth = (
this.minWidth), blockHeight, l = [], lines = [],
        space = this.isPrototype ?
                1 : Math.floor(fontHeight(this.fontSize) / 3),
        ico = this instanceof BlockMorph && this.hasLocationPin() ?
        	this.methodIconExtent().x + space : 0,
        bottomCorrection,
        rightMost,
        hasLoopCSlot = false,
        hasLoopArrow = false;

    if ((this instanceof MultiArgMorph) && (!extraContains(['%cl', '%c', '%cs', '%cla', '%loop', '%ca'], this.slotSpec))) {
        blockWidth += this.arrows().width();
    } else if (this instanceof ReporterBlockMorph) {
        blockWidth += (this.rounding * 2) + (this.edge * 2);
    } else {
        blockWidth += (this.corner * 4)
            + (this.edge * 2)
            + (this.inset * 3)
            + this.dent;
    };  if (this.nextBlock) {
        nb = this.nextBlock();
    };

    // determine lines
    parts.forEach(part => {
        if ((part instanceof CSlotMorph) ||
            (part instanceof MultiArgMorph && extraContains(['%cl', '%c', '%cs', '%cla', '%loop', '%ca'], part.slotSpec))
        )  {if (l.length > 0) {
                lines.push(l);
                lines.push([part]);
                l = [];
                x = 0;
            } else {
                lines.push([part]);
            };
        } else if (this.isVertical() && !(part instanceof FrameMorph
        )) {if (l.length > 0) {lines.push(l);}; l = [part];
        x = part.fullBounds().width() + space;
        } else {
            if (part.isVisible) {
                x += part.fullBounds().width() + space;
            };  if ((x > this.labelWidth) || part.isBlockLabelBreak) {
                if (l.length > 0) {lines.push(l); l = [];
                    x = part.fullBounds().width() + space;
                };};  l.push(part);
            if (part.isBlockLabelBreak) {
                x = 0;
            };
        };
    }); if (l.length > 0) {lines.push(
    l);}; // distribute parts on lines
    if (this instanceof CommandBlockMorph) {
        y = this.top() + this.corner + this.edge;
        if ((this instanceof DefinitorBlockMorph
        ) || (this instanceof HatBlockMorph
        )) {y += this.hatHeight; if ((this
        ).isPrototypeLike) {y += this.hatHeight;};};
    } else if (this instanceof ReporterBlockMorph) {
        y = this.top() + (this.edge * 2);
    } else if (this instanceof MultiArgMorph
            || this instanceof ArgLabelMorph) {
        y = this.top();
        if (contains(['%cl', '%c', '%cs', '%cla', '%loop', '%ca'
            ], asAnArray(this.slotSpec)[0]) && (((this.inputs(
            )).length) > 0)) {y -= this.rounding;};
    }; lines.forEach(line => {
        if (hasLoopCSlot) {
            hasLoopArrow = true;
            hasLoopCSlot = false;
        }; x = this.left() + ico + this.edge + this.labelPadding;
        if ((this instanceof RingMorph) && contains(['reifyScript',
        'reifyReporter', 'reifyPredicate'], this.selector)) {
            x = this.left() + space; // this.labelPadding
        } else if (this instanceof ReporterBlockMorph) {
        if (this.isPredicate || this.isArrow) {
            x = this.left() + ico + this.rounding;
        };} else if (this instanceof MultiArgMorph ||
            this instanceof ArgLabelMorph
        )  {x = this.left();
        }; y += lineHeight;
        lineHeight = 0;
        line.forEach(part => {
            if (part.isLoop) {
                hasLoopCSlot = true;
            }; if (part instanceof CSlotMorph) {
                x -= this.labelPadding;
                if (this.isPredicate || this.isArrow) {
                    x = this.left() + ico + this.rounding;
                }; part.setColor(this.color);
                part.setPosition(new Point(x,
                y)); lineHeight = part.height();
            } else if (part instanceof MultiArgMorph &&
                    (extraContains(['%cl', '%c', '%cs', '%cla', '%loop', '%ca'], part.slotSpec))) {
                if (this.isPredicate || this.isArrow) {
                    x += this.corner;
                }; part.setPosition(new Point(x, y));
                lineHeight = part.height();
                if (part.slotSpec instanceof Array) {
                    maxX = Math.max(
                        maxX,
                        Math.max(...part.children.map(each => each.right()))
                    );
                };
            } else {
                part.setPosition(new Point(x, y));
                if (!part.isBlockLabelBreak) {
                    if ((extraContains(['%c', '%loop'], part.slotSpec))) {
                        x += part.width();
                    } else if (part.isVisible) {
                        x += part.fullBounds().width() + space;
                    };
                };
                maxX = Math.max(maxX, x);
                lineHeight = Math.max(
                    lineHeight,
                    part instanceof StringMorph ?
                            part.rawHeight() : part.height()
                );};});

    // adjust label row below a loop-arrow C-slot to accomodate the loop icon
    if (hasLoopArrow) {
        x += this.fontSize * 3/2;
        maxX = Math.max(maxX, x);
        hasLoopArrow = false;
    };

    // center parts vertically on each line:
        line.forEach(part => {
            part.moveBy(new Point(
                0,
                Math.floor((lineHeight - part.height()) / 2)
            ));
        });
    }); // determine my height:
    y += lineHeight;
    if (this.children.some(any => any instanceof CSlotMorph)) {
        bottomCorrection = this.bottomPadding;
        if (this.inputs()[this.inputs().length - 1] instanceof MultiArgMorph) {
            bottomCorrection = -this.bottomPadding;
        }; if (this instanceof ReporterBlockMorph && !(this.isPredicate || this.isArrow)) {
            bottomCorrection = Math.max(
                this.bottomPadding,
                this.rounding - this.bottomPadding
            );
        };  y += bottomCorrection;
    };  if (this instanceof CommandBlockMorph) {
        blockHeight = y - this.top() + (this.corner * 2);
    } else if (this instanceof ReporterBlockMorph) {
        blockHeight = y - this.top() + (this.edge * 2);
    } else if (this instanceof MultiArgMorph
            || this instanceof ArgLabelMorph) {
        blockHeight = y - this.top();
    }; // determine my width:
    if (this.isPredicate || this.isArrow) {
        blockWidth = Math.max(
            blockWidth,
            maxX - this.left() + this.rounding
        );
    } else if ((this instanceof MultiArgMorph && !extraContains(['%cl', '%c', '%cs', '%cla', '%loop', '%ca'], this.slotSpec))
            || this instanceof ArgLabelMorph) {
        blockWidth = Math.max(
            blockWidth,
            maxX - this.left() - space
        );
    } else {
        blockWidth = Math.max(
            blockWidth,
            maxX - this.left() + this.labelPadding - this.edge
        );  // adjust right padding if rightmost input has arrows
        rightMost = parts[parts.length - 1];
        if (rightMost instanceof MultiArgMorph && rightMost.isVisible &&
                (lines.length === 1)) {
            blockWidth -= space;
        };  // adjust width to hat width
        if ((this instanceof HatBlockMorph
        ) || (this instanceof DefinitorBlockMorph
        )) {blockWidth = Math.max(blockWidth,
        this.hatWidth * 3/2);};
    }; // set my extent (silently, because we'll redraw later anyway):
    this.bounds.setWidth(blockWidth); this.bounds.setHeight(blockHeight);

    // adjust CSlots and collect holes
    this.holes = [];
    parts.forEach(part => {
        var adjustMultiWidth = 0;
        if (part instanceof CSlotMorph || extraContains(['%cl', '%c', '%cs', '%cla', '%loop', '%ca'], part.slotSpec)) {
            if (this.isPredicate || this.isArrow) {
                part.bounds.setWidth(
                    blockWidth -
                        ico -
                        this.rounding -
                        this.inset -
                        this.corner
                );
                adjustMultiWidth = this.corner;
            } else {
                part.bounds.setWidth(blockWidth - this.edge - ico);
                adjustMultiWidth = this.corner + this.edge;
            }; if (part.fixLoopLayout) {
                part.fixLoopLayout();
            };
        }; if (part instanceof MultiArgMorph && extraContains(['%cl', '%c', '%cs', '%cla', '%loop', '%ca'], part.slotSpec)) {
            part.inputs().filter(each =>
                each instanceof CSlotMorph
            ).forEach(slot =>
                slot.bounds.setWidth(
                    part.right() - slot.left() - adjustMultiWidth
                )
            );
        }; part.fixHolesLayout();
        this.holes.push.apply(
            this.holes,
            part.holes.map( hole =>
                hole.translateBy(part.position().subtract(pos))
            )
        );
    });

    // position next block:
    if (nb) {
        nb.setPosition(
            new Point(
                this.left(),
                this.bottom() - (this.corner)
            )
        );
    };

    // find out if one of my parents needs to be fixed
    if (this instanceof BlockMorph && this.parent && this.parent.fixLayout) {
        this.parent.fixLayout();
        this.parent.changed();
        if (this.parent instanceof SyntaxElementMorph) {
            return;
        };
    };  this.fixHighlight();
};

SyntaxElementMorph.prototype.methodIconExtent = function (
) {var ico = this.fontSize * 6/5; return this.hasLocationPin(
) ? new Point(ico * 2/3, ico) : ZERO;};

SyntaxElementMorph.prototype.fixHighlight = function (
) {var top = this.topBlock(); if (top.getHighlight && (top
).getHighlight()) {top.addHighlight(top.removeHighlight());};};

SyntaxElementMorph.prototype.isVertical = (() => false);

// SyntaxElementMorph evaluating:

SyntaxElementMorph.prototype.evaluate = (() => null);

SyntaxElementMorph.prototype.isEmptySlot = (() => false);

// SyntaxElementMorph speech bubble feedback:

SyntaxElementMorph.prototype.showBubble = function (value, exportPic,
        target) {var bubble, txt, img, morphToShow, isClickable = true,
        ide = this.parentThatIsA(IDE_Morph) || ((target instanceof Morph
        ) ? target.parentThatIsA(IDE_Morph) : world.childThatIsA(IDE_Morph
        )), anchor = this, pos = this.rightCenter().add(new Point(2, 0)),
        sf = this.parentThatIsA(ScrollFrameMorph);
    if (value === undefined) {return null;};
    if (value instanceof ListWatcherMorph) {
        morphToShow = value;
        morphToShow.update(true);
        morphToShow.step = value.update;
        morphToShow.isDraggable = false;
        var frame = this.parentThatIsA(
        ScrollFrameMorph); if ((frame
        ) instanceof Morph) {(morphToShow
        ).expand(frame.extent());};
        isClickable = true;
    } else if (value instanceof TableFrameMorph) {
        morphToShow = value;
        morphToShow.isDraggable = false;
        var frame = this.parentThatIsA(
        ScrollFrameMorph); if ((frame
        ) instanceof Morph) {(morphToShow
        ).expand(frame.extent());};
        isClickable = true;
    } else if (value instanceof Morph) {
        if (isSnapObject(value)) {
            img = value.thumbnail(new Point(40, 40));
            morphToShow = new Morph;
            morphToShow.isCachingImage = true;
            morphToShow.bounds.setWidth(img.width);
            morphToShow.bounds.setHeight(img.height);
            morphToShow.cachedImage = img;
            morphToShow.version = value.version;
            morphToShow.step = function () {
                if (this.version !== value.version) {
                    img = value.thumbnail(new Point(40, 40));
                    this.cachedImage = img;
                    this.version = value.version;
                    this.changed();
                };};
        } else {
            img = value.fullImage();
            morphToShow = new Morph;
            morphToShow.isCachingImage = true;
            morphToShow.bounds.setWidth(img.width);
            morphToShow.bounds.setHeight(img.height
            );  morphToShow.cachedImage = img;};
    } else if (value instanceof Costume) {
        img = value.thumbnail(new Point(40, 40));
        morphToShow = new Morph;
        morphToShow.isCachingImage = true;
        morphToShow.bounds.setWidth(img.width);
        morphToShow.bounds.setHeight(img.height);
        morphToShow.cachedImage = img;

        // support costumes to be dragged out of result bubbles:
        morphToShow.isDraggable = true;

        morphToShow.selectForEdit = function () {
            var cst = value.copy(),
                icon,
                prepare;

            cst.name = ide.currentSprite.newCostumeName(cst.name);
            icon = new CostumeIconMorph(cst);
            prepare = icon.prepareToBeGrabbed;

            icon.prepareToBeGrabbed = function (hand) {
                hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                };  this.prepareToBeGrabbed = prepare;
            };  icon.setCenter(this.center());
            return icon;
        };

        // support exporting costumes directly from result bubbles:
        morphToShow.userMenu = function () {
            var menu = new MenuMorph(this);
            menu.addItem(
                'export',
                () => {
                    if (value instanceof SVG_Costume) {
                        // don't show SVG costumes in a new tab (shows text)
                        ide.saveFileAs(
                            value.contents.src,
                            'text/svg',
                            value.name
                        );
                    } else { // rasterized Costume
                        ide.saveCanvasAs(value.contents, value.name);
                    };
                }
            ); return menu;
        };
    } else if (value instanceof Sound) {
        morphToShow = new SymbolMorph('notes', 30);

        // support sounds to be dragged out of result bubbles:
        morphToShow.isDraggable = true;

        morphToShow.selectForEdit = function () {
            var snd = value.copy(),
                icon,
                prepare;

            snd.name = ide.currentSprite.newSoundName(snd.name);
            icon = new SoundIconMorph(snd);
            prepare = icon.prepareToBeGrabbed;

            icon.prepareToBeGrabbed = function (hand) {
                hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                };  this.prepareToBeGrabbed = prepare;
            };  icon.setCenter(this.center());
            return icon;};

        // support exporting sounds directly from result bubbles:
        morphToShow.userMenu = function () {
            var menu = new MenuMorph(this);
            menu.addItem(
                'export',
                () => ide.saveAudioAs(value.audio, value.name)
            ); return menu;
        };
    } else if (value instanceof Context) {
        img = value.image();
        morphToShow = new Morph;
        morphToShow.isCachingImage = true;
        morphToShow.bounds.setWidth(img.width);
        morphToShow.bounds.setHeight(img.height);
        morphToShow.cachedImage = img;

        // support blocks to be dragged out of result bubbles:
        morphToShow.isDraggable = true;

        morphToShow.selectForEdit = function () {
            var script = value.beDraggable(),
                prepare = script.prepareToBeGrabbed;

            script.prepareToBeGrabbed = function (hand) {
                prepare.call(this, hand);
                hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                }; this.prepareToBeGrabbed = prepare;
            };  if (ide.isAppMode) {return;};
            script.setPosition(this.position());
            return script;
        };
    } else if (value instanceof Color) {
        img = (ColorImageMorph(value)).fullImage();
        morphToShow = new Morph;
        morphToShow.isCachingImage = true;
        morphToShow.bounds.setWidth(img.width);
        morphToShow.bounds.setHeight(img.height);
        morphToShow.cachedImage = img;

        // support blocks to be dragged out of speech balloons:
        morphToShow.isDraggable = true;

        morphToShow.selectForEdit = function () {
                var script = SpriteMorph.prototype.blockForSelector(
                    'getColor'), prepare = script.prepareToBeGrabbed,
                    ide = this.parentThatIsA(IDE_Morph) || (
                        world.childThatIsA(IDE_Morph));
                script.children[1].setColor(value.copy());
                script.isDraggable = true;

                script.prepareToBeGrabbed = function (hand) {
                    prepare.call(this, hand);
                    hand.grabOrigin = {
                        origin: ide.palette,
                        position: ide.palette.center()
                    };  this.prepareToBeGrabbed = prepare;
                };  if (ide.isAppMode) {return;};
                script.setPosition(this.position(
                )); return script;};
    } else if (typeof value === 'boolean') {
        morphToShow = BooleanImageMorph(value);

        // support blocks to be dragged out of speech balloons:
        morphToShow.isDraggable = true;

        morphToShow.selectForEdit = function () {
                var script = SpriteMorph.prototype.blockForSelector('reportBoolean'),
                    prepare = script.prepareToBeGrabbed,
                    ide = this.parentThatIsA(IDE_Morph) ||
                        this.world().childThatIsA(IDE_Morph);
                script.children[0].setContents(value);
                script.isDraggable = true;

                script.prepareToBeGrabbed = function (hand) {
                    prepare.call(this, hand);
                    hand.grabOrigin = {
                        origin: ide.palette,
                        position: ide.palette.center()
                    };  this.prepareToBeGrabbed = prepare;
                };  if (ide.isAppMode) {return;};
                script.setPosition(this.position(
                )); return script;
        };
    } else if (isString(value)) {
        txt  = value.length > 500 ? value.slice(0, 500) + '...' : value;
        morphToShow = new TextMorph(txt, this.fontSize);

        // support exporting text / numbers directly from result bubbles:
        morphToShow.userMenu = function () {
            var menu = new MenuMorph(this);
            menu.addItem(
                'export',
                () => ide.saveFileAs(value,
                    'text/plain;charset=utf-8',
                    localize('data')
                )
            );  return menu;
        };
    } else if (value === null) {
        morphToShow = new TextMorph(
        '', this.fontSize);
    } else if (value.toString) {
        morphToShow = new TextMorph(
            ((value.textRepresentation === undefined
            ) ? value.toString() : getText(
            value.textRepresentation,
            value)), this.fontSize);
    };  if (ide && !(ide.currentSprite === target)) {
        if (target instanceof StageMorph) {
            anchor = ide.corral.stageIcon;
        } else if (target) {
        if (target.isTemporary) {
        target = detect(target.allExemplars(),
        each => !(each.isTemporary));
        };  anchor = detect(
        ide.corral.frame.contents.children,
        icon => icon.object === target);
        } else {
        target = ide;
        };  pos = anchor.center();
    }; bubble = new SpeechBubbleMorph(
        morphToShow, null,   Math.max(
        this.rounding - 2, 6),   0
    ); bubble.popUp(
        world,
        pos,
        isClickable
    );  if (exportPic) {
        this.exportPictureWithResult(bubble);
    };  if (anchor instanceof SpriteIconMorph
    )  {bubble.keepWithin(ide.corral);
    }  else if (sf) {
        bubble.keepWithin(sf);
    };};

SyntaxElementMorph.prototype.exportPictureWithResult = function (aBubble) {
    var ide = this.parentThatIsA(IDE_Morph) ||
            this.parentThatIsA(BlockEditorMorph
            ).target.parentThatIsA(IDE_Morph),
        scr = this.fullImage(),
        bub = aBubble.fullImage(),
        taller = Math.max(0, bub.height - scr.height),
        pic = newCanvas(new Point(
            scr.width + bub.width + 2,
            scr.height + taller
        )), ctx = pic.getContext('2d');
    ctx.drawImage(scr, 0, pic.height - scr.height);
    ctx.drawImage(bub, scr.width + 2, 0);
    ide.saveCanvasAs(pic, (ide.projectName || (
    localize('Untitled'))) + ' ' + localize('script pic'));};

// SyntaxElementMorph code mapping

/*
    code mapping lets you use blocks to generate arbitrary text-based
    source code that can be exported and compiled / embedded elsewhere,
    it's not part of Snap's evaluator and not needed for Snap itself
*/

SyntaxElementMorph.prototype.mappedCode = function (definitions) {
    var result = this.evaluate();
    if (result instanceof BlockMorph) {
        return result.mappedCode(definitions);
    };  return result;
};

SyntaxElementMorph.prototype.cSlots = function () {
    var result = [];
    this.parts().forEach(part => {
        if (part instanceof CSlotMorph) {
            result.push(part);
        } else if (part instanceof MultiArgMorph
            ) {(part.cSlots()).forEach(
            slot => result.push(slot));
        };});    return result;};

SyntaxElementMorph.prototype.clearSlots = function () {
    var result = [];
    this.parts().forEach(part => {
        if ((part instanceof RingCommandSlotMorph) || (
        part instanceof RingReporterSlotMorph)) {
            result.push(part);
        } else if (part instanceof MultiArgMorph
            ) {(part.clearSlots()).forEach(
            slot => result.push(slot));
        };});    return result;};

// BlockLabelMorph ///////////////////////////////////////////////

/*
    I am a piece of single-line text written on a block. I serve as a
    container for sharing typographic attributes among my instances
*/

// BlockLabelMorph inherits from StringMorph:

BlockLabelMorph.prototype = new StringMorph;
BlockLabelMorph.prototype.constructor = BlockLabelMorph;
BlockLabelMorph.uber = StringMorph.prototype;

function BlockLabelMorph(
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
};

BlockLabelMorph.prototype.getRenderColor = function () {
    var block = this.parentThatIsA(BlockMorph);
    if (MorphicPreferences.isFlat) {
        return block.alpha > 1/2 ? this.color
            : block.color.solid().darker(Math.max(block.alpha * 200, 1/10));
    }
    return block.alpha > 1/2 ? this.color
        : block.color.solid().lighter(Math.max(block.alpha * 200, 1/10));

};

BlockLabelMorph.prototype.getShadowRenderColor = function () {
    return this.parentThatIsA(BlockMorph).alpha > 1/2 ?
        this.shadowColor
            : CLEAR;
};

// BlockSymbolMorph //////////////////////////////////////////////////////////

/*
    I am a pictogram written on a block. I serve as a
    container for sharing typographic attributes among my instances.
    NOTE: I have an additional attribute ".isFading" that governs
    my behavior when fading out the blocks I'm embedded in
*/

// BlockSymbolMorph inherits from SymbolMorph:

BlockSymbolMorph.prototype = new SymbolMorph;
BlockSymbolMorph.prototype.constructor = BlockSymbolMorph;
BlockSymbolMorph.uber = SymbolMorph.prototype;

function BlockSymbolMorph(name, size, color, shadowOffset, shadowColor) {
    this.init(name, size, color, shadowOffset, shadowColor);
}

BlockSymbolMorph.prototype.getRenderColor = function () {
    var block = this.parentThatIsA(BlockMorph);
    if (MorphicPreferences.isFlat) {
        if (this.isFading) {
            return this.color.mixed(block.alpha, WHITE);
        };  if (this.color.eq(WHITE)) {
            return this.parent.alpha > 1/2 ? this.color
                : block.color.solid().darker(Math.max(block.alpha * 200, 1/10));
        };  if (this.color.eq(BLACK)) {
            return this.parent.alpha > 1/2 ? this.color
                : block.color.solid().darker(Math.max(block.alpha * 200, 1/10));
        };  return this.color;
    };  if (this.isFading) {
        return this.color.mixed(
            block.alpha,
            SpriteMorph.prototype.paletteColor
        );
    };  if (this.color.eq(BLACK)) {
        return block.alpha > 1/2 ? this.color
            : block.color.solid().lighter(Math.max(block.alpha * 200, 1/10));
    };  if (this.color.eq(WHITE)) {
        return this.parent.alpha > 1/2 ? this.color
            : block.color.solid().lighter(Math.max(block.alpha * 200, 1/10));
    };  return this.color;
};

BlockSymbolMorph.prototype.getShadowRenderColor = function () {
return ((this.parent.alpha > 1/2) ? this.shadowColor : CLEAR);};

// BlockMorph //////////////////////////////////////////////////////////

/*
    I am an abstraction of all blocks (commands, reporters, hats).

    Aside from the visual settings inherited from Morph and
    SyntaxElementMorph my most important attributes and public
    accessors are:

    selector        - (string) name of method to be triggered
    scriptTarget()  - answer the object (sprite) to which I apply
    inputs()        - answer an array with my arg slots and nested reporters
    defaults        - an optional Array containing default input values
    topBlock()      - answer the top block of the stack I'm attached to
    blockSpec       - a formalized description of my label parts
    setSpec()       - force me to change my label structure
    evaluate()      - answer the result of my evaluation
    isUnevaluated() - answer whether I am part of a special form

    Zebra coloring provides a mechanism to alternate brightness of nested,
    same colored blocks (of the same category). The deviation of alternating
    brightness is set in the preferences setting:

    zebraContrast - <number> percentage of brightness deviation

    attribute. If the attribute is set to zero, zebra coloring is turned
    off. If it is a positive number, nested blocks will be colored in
    a brighter shade of the same hue and the label color (for texts)
    alternates between white and black. If the attribute is set to a negative
    number, nested blocks are colored in a darker shade of the same hue
    with no alternating label colors.

    Note: Some of these methods are inherited from SyntaxElementMorph
    for technical reasons, because they are shared among Block and
    MultiArgMorph (e.g. topBlock()).

    blockSpec is a formatted string consisting of plain words and
    reserved words starting with the percent character (%), which
    represent the following pre-defined input slots and/or label
    features:

    arity: single

    %br     - user-forced line break
    %s      - white rectangular type-in slot ("string-type")
    %txt    - white rectangular type-in slot ("text-type")
    %mlt    - white rectangular type-in slot ("multi-line-text-type")
    %code   - white rectangular type-in slot, monospaced font
    %n      - white roundish type-in slot ("numerical")
    %dir    - white roundish type-in slot with drop-down for directions
    %inst   - white roundish type-in slot with drop-down for instruments
    %ida    - white roundish type-in slot with drop-down for list indices
    %idx    - white roundish type-in slot for indices incl. "any"
    %dim    - white roundish type-in slot for dimensions incl. "current"
    %obj    - specially drawn slot for object reporters
    %rel    - chameleon colored rectangular drop-down for relation options
    %spr    - chameleon colored rectangular drop-down for object-names
    %col    - chameleon colored rectangular drop-down for collidables
    %dst    - chameleon colored rectangular drop-down for distances
    %cst    - chameleon colored rectangular drop-down for costume-names
    %eff    - chameleon colored rectangular drop-down for graphic effects
    %snd    - chameleon colored rectangular drop-down for sound names
    %key    - chameleon colored rectangular drop-down for keyboard keys
    %msg    - chameleon colored rectangular drop-down for messages
    %att    - chameleon colored rectangular drop-down for attributes
    %fun    - chameleon colored rectangular drop-down for math functions
    %typ    - chameleon colored rectangular drop-down for data types
    %var    - chameleon colored rectangular drop-down for variable names
    %shd    - Chameleon colored rectuangular drop-down for shadowed var names
    %b      - chameleon colored hexagonal slot (for predicates)
    %bool   - chameleon colored hexagonal slot (for predicates), static
    %l      - list icon
    %c      - C-shaped command slot, special form for primitives
    %loop   - C-shaped with loop arrow, special form for certain primitives
    %ca     - C-shaped with loop arrow, for custom blocks
    %cs     - C-shaped, auto-reifying, accepts reporter drops
    %cl     - C-shaped, auto-reifying, rejects reporters
    %cla    - C-shaped with loop arrows, auto-reifying, rejects reporters
    %clr    - interactive color slot
    %t      - inline variable reporter template
    %anyUE  - white rectangular type-in slot, unevaluated if replaced
    %boolUE - chameleon colored hexagonal slot, unevaluated if replaced
    %cmd    - command slot
    %r      - round reporter slot
    %p      - hexagonal predicate slot
    %f      - round function slot, unevaluated if replaced
    %vid    - chameleon colored rectangular drop-down for video modes
    %scn    - chameleon colored rectangular drop-down for scene names

    rings:

    %cmdRing    - command slotted ring with %ringparms
    %repRing    - round slotted ringn with %ringparms
    %predRing   - diamond slotted ring with %ringparms

    arity: multiple

    %mult%x      - where %x stands for any of the above single inputs
    %inputs      - for an additional text label 'with inputs'
    %words       - for an expandable list of default 2 (used in JOIN)
    %lists       - for an expandable list of default 2 lists (CONCAT)
    %exp         - for a static expandable list of minimum 0 (used in LIST)
    %scriptVars  - for an expandable list of variable reporter templates
    %parms       - for an expandable list of formal parameters
    %ringparms   - the same for use inside Rings

    special form: upvar

    %upvar       - same as %t (inline variable reporter template)

    special form: input name

    %inputName   - variable blob (used in input type dialog)
*/

// BlockMorph inherits from SyntaxElementMorph:

BlockMorph.prototype = new SyntaxElementMorph;
BlockMorph.prototype.constructor = BlockMorph;
BlockMorph.uber = SyntaxElementMorph.prototype;

// BlockMorph preferences settings:

BlockMorph.prototype.isCachingInputs = true;
BlockMorph.prototype.zebraContrast = 40; // alternating color brightness

// BlockMorph sound feedback:

BlockMorph.prototype.getSpec = function () {
return (this.blockSpec.toString() || '');};

BlockMorph.prototype.snapSound = null;

BlockMorph.prototype.toggleSnapSound = function (
) {if (isNil(this.snapSound)) {(BlockMorph.prototype
).snapSound = document.createElement('audio');
BlockMorph.prototype.snapSound.src = (
'src/click.wav');} else {(this.snapSound
) = null;}; (CommentMorph.prototype.snapSound
) = BlockMorph.prototype.snapSound; (BlockSlotMorph
).prototype.snapSound = BlockMorph.prototype.snapSound;};

// BlockMorph instance creation:

function BlockMorph () {this.init();};

BlockMorph.prototype.init = function () {
    this.selector = null; // name of method to be triggered
    this.blockSpec = ''; // formal description of label and arguments
    this.comment = null; // optional "sticky" comment morph

    // not to be persisted:
    this.instantiationSpec = null; // spec to set upon fullCopy() of template
    this.category = null; // for zebra coloring (non persistent)
    this.isCorpse = false; // marked for deletion fom a custom block definition
    BlockMorph.uber.init.call(this); this.shouldRerender = true;
    this.color = new Color(102, 102, 102);
    this.cachedInputs = null;

    if (this.isPrototype) {
        this.cursorStyle = 'pointer';
    } else {
        this.cursorStyle = 'grab';
    }; this.cursorGrabStyle = 'grabbing';
};

BlockMorph.prototype.scriptTarget = function (noError) {
    // answer the sprite or stage that this block acts on,
    // if the user clicks on it.
    // NOTE: since scripts can be shared by more than a single sprite
    // this method only gives the desired result within the context of
    // the user actively clicking on a block inside the IDE
    // there is no direct relationship between a block and a sprite.
    var scripts = this.parentThatIsA(ScriptsMorph),
        ide, dlg;
    if (scripts) {
        return scripts.scriptTarget();
    }
    ide = this.parentThatIsA(IDE_Morph);
    if (ide) {
        return ide.currentSprite;
    };
    win = this.parentThatIsA(NormalWindowMorph);
    if (win) {return win.ui.sprite;};
    dlg = this.parentThatIsA(DialogBoxMorph);
    if (dlg) {
        if (isSnapObject(dlg.target)) {
            return dlg.target;
        };  if (dlg.target instanceof IDE_Morph
        )   {return dlg.target.currentSprite;};
    };  if (noError) {return null;};
    throw new Error('script target cannot be found for orphaned block');
};

BlockMorph.prototype.toString = function () {
    return 'a ' +
        (this.constructor.name ||
            this.constructor.toString().split(' ')[1].split('(')[0]) +
        ' ("' +
        this.blockSpec.slice(0, 30) + '...")';
};

// BlockMorph spec:

BlockMorph.prototype.parseSpec = function (spec) {
    var result = [],
        words,
        word = '';

    words = isString(spec) ? spec.split(' ') : [];
    if (words.length === 0) {
        words = [spec];
    };  if (this.labelWordWrap) {
        return words;
    };  function addWord(w) {
        if ((w[0] === '%') && (w.length > 1)) {
            if (word !== '') {
                result.push(word);
                word = '';
            }
            result.push(w);
        } else {
            if (word !== '') {
                word += ' ' + w;
            } else {
                word = w;
            };
        };
    };  words.forEach(
    each => addWord(each
    )); if (word !== '') {
        result.push(word);
    };  return result;
};

BlockMorph.prototype.setSpec = function (spec, definition) {
    var part,
        inputIdx = -1;

    if (!spec) {return; }
    this.parts().forEach(part =>
        part.destroy()
    ); if (this.isPrototype) {
        this.add(this.placeHolder());
    }; this.parseSpec(spec).forEach((word, idx, arr) => {
        if (word[0] === '%' && (word !== '%br')) {
            inputIdx += 1;
        };  part = this.labelPart(word);
        if (isNil(part)) {
            // console.log('could not create label part', word);
            return;
        }; this.add(part);
        if (!(part instanceof CommandSlotMorph ||
                part instanceof StringMorph)) {
            part.fixLayout();
            part.rerender();
        }; if (part instanceof BlockMorph) {
            part.fixBlockColor();
        }; if (part instanceof MultiArgMorph ||
                part.constructor === CommandSlotMorph ||
                part.constructor === RingCommandSlotMorph) {
            part.fixLayout();
        }; if (this.isPrototype) {
            this.add(this.placeHolder());
        }; if (part instanceof InputSlotMorph && this.isCustomBlock) {
            part.setChoices.apply(
                part,
                (definition || this.definition).inputOptionsOfIdx(inputIdx)
            );
        };
    }); this.blockSpec = spec; if (contains([
    'reportScript', 'zoomLambdaTest'], this.selector
    ) && (this instanceof ReporterBlockMorph)) {
    this.rounding = (9/2 * this.scale);} else if ((
    contains(['getColor', 'makeColor', 'mixColors',
    'mixClrsAt', 'clrFlags'], this.selector)) && (
    this instanceof ReporterBlockMorph)) {(this
    ).rounding = 0;} else {this.rounding = (9 * (
    this).scale);}; this.fixLayout(); (this
    ).rerender(); this.cachedInputs = null;
};

BlockMorph.prototype.userSetSpec = function (
spec) {var tb = this.topBlock(); tb.fullChanged(
); this.setSpec(spec); tb.fullChanged();};

BlockMorph.prototype.buildSpec = function () {this.blockSpec = ''; this.parts().forEach(part => {if (part instanceof StringMorph) {
this.blockSpec += part.text;} else if (part instanceof ArgMorph) {this.blockSpec += part.getSpec();} else if (part.isBlockLabelBreak) {
this.blockSpec += part.getSpec();} else {this.blockSpec += '[undefined]';}; this.blockSpec += ' ';}); this.blockSpec = this.blockSpec.trim();};

BlockMorph.prototype.rebuild = function (contrast) {this.setSpec(this.blockSpec); if (contrast) {this.inputs().forEach(input => {
if (input instanceof ReporterBlockMorph) {input.setColor(input.color.lighter(contrast)); input.setSpec(input.blockSpec);};});};};

BlockMorph.prototype.abstractBlockSpec = function () {
	// answer the semantic block spec substituting each input
 	// with an underscore. Used as "name" of the Block.
    return this.parseSpec(this.blockSpec).map(str =>
        (str.length > 1 && (str[0]) === '%') ? '_' : str
    ).join(' ');
};

BlockMorph.prototype.localizeBlockSpec = function (spec) {
    // answer the translated block spec where the translation itself
    // is in the form of an abstract spec, i.e. with padded underscores
    // in place for percent-sign prefixed slot specs.
    var slotSpecs = [],
        slotCount = -1,
        abstractSpec,
        translation;

    abstractSpec = this.parseSpec(spec).map(str => {
        if (str.length > 1 && (str[0]) === '%') {
            slotSpecs.push(str);
            return '_';
        }
        return str;
    }).join(' ');

    // make sure to also remove any explicit slot specs from the translation
    translation = this.parseSpec(localize(abstractSpec)).map(str =>
        (str.length > 1 && (str[0]) === '%') ? '_' : str
    ).join(' ');

    // replace abstract slot placeholders in the translation with their
    // concrete specs from the original block spec
    return translation.split(' ').map(word => {
        if (word === '_') {
            slotCount += 1;
            return slotSpecs[slotCount] || '';
        }
        return word;
    }).join(' ');
};

// BlockMorph menu:

BlockMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this), myself = this,
        hasLine = false, proc = this.activeProcess(
        ), top = this.topBlock(),
        vNames = proc && proc.context && proc.context.outerContext ?
                proc.context.outerContext.variables.names() : [],
        slot, mult, alternatives, field, rcvr;

    function addOption(label, toggle, test, onHint, offHint) {
        menu.addItem(
            [
                test ? new SymbolMorph(
                    'checkedBox',
                    MorphicPreferences.menuFontSize * 3/4
                ) : new SymbolMorph(
                    'rectangle',
                    MorphicPreferences.menuFontSize * 3/4
                ),
                localize(label)
            ],
            toggle,
            test ? onHint : offHint
        );
    }

    function renameVar() {
        var blck = myself.fullCopy();
        blck.addShadow();
        new DialogBoxMorph(
            myself,
            myself.userSetSpec,
            myself
        ).prompt(
            "Variable name",
            myself.blockSpec,
            world,
            blck.doWithAlpha(1, () => blck.fullImage()), // pic
            InputSlotMorph.prototype.getVarNamesDict.call(myself)
        );
    }

    menu.addItem("help...", 'showHelp');
    if (this.isTemplate) {
        if (this.parent instanceof SyntaxElementMorph) {
            if (this.selector === 'reportGetVar') { // script var definition
                menu.addLine();
                menu.addItem(
                    'rename...',
                    () => this.refactorThisVar(true), // just the template
                    'rename only\nthis reporter'
                );
                menu.addItem(
                    'rename all...',
                    'refactorThisVar',
                    'rename all blocks that\naccess this variable'
                );
                if (this.parent.parent instanceof MultiArgMorph && this.parentThatIsA(ScriptsMorph)) {
                    slot = this.parent;
                    mult = slot.parent;
                    menu.addLine();
                    if (!mult.maxInputs ||
                            (mult.inputs().length < mult.maxInputs)) {
                        if (mult.is3ArgRingInHOF() && (mult.inputs().length < 3)) {
                            menu.addItem(
                                'put a HOF-attribute output',
                                () => mult.insertNewInputBefore(
                                    slot, localize(['value',' index',
                                    'list'][mult.children.indexOf(this)])
                                )
                            );
                        } else {menu.addItem('insert a variable', () => mult.insertNewInputBefore(slot, localize('variable')));};
                    }
                    if (mult.inputs().length > mult.minInputs) {
                        menu.addItem(
                            'delete variable',
                            () => mult.deleteSlot(slot)
                        );
                    }
                }
            }
        } else { // in palette
            if (this.selector === 'reportGetVar') {
                rcvr = this.scriptTarget();
                if (this.isInheritedVariable(false)) { // fully inherited
                    addOption(
                        'inherited',
                        () => rcvr.toggleInheritedVariable(this.blockSpec),
                        true,
                        'uncheck to\ndisinherit',
                        null
                    );
                } else { // not inherited
                    if (this.isInheritedVariable(true)) { // shadowed
                        addOption(
                            'inherited',
                            () => rcvr.toggleInheritedVariable(
                                this.blockSpec
                            ),
                            false,
                            null,
                            localize('check to inherit\nfrom')
                                + ' ' + rcvr.exemplar.name
                        );
                    }
                    addOption(
                        'transient',
                        'toggleTransientVariable',
                        this.isTransientVariable(),
                        'uncheck to save contents\nin the project',
                        'check to prevent contents\nfrom being saved'
                    );
                    menu.addLine();
                    menu.addItem(
                        'rename...',
                        () => this.refactorThisVar(true), // just the template
                        'rename only\nthis reporter'
                    );
                    menu.addItem(
                        'rename all...',
                        'refactorThisVar',
                        'rename all blocks that\naccess this variable'
                    );
                }
            }

            // allow toggling inheritable attributes
            if (StageMorph.prototype.enableInheritance) {
                rcvr = this.scriptTarget();
                field = {
                    xPosition: 'x position',
                    yPosition: 'y position',
                    direction: 'direction',
                    getScale: 'size',
                    getCostumeIdx: 'costume #',
                    getVolume: 'volume',
                    getPan: 'balance',
                    reportShown: 'shown?',
                    getPenDown: 'pen down?'
                }[this.selector];
                if (field && rcvr && rcvr.exemplar) {
                    menu.addLine();
                    addOption(
                        'inherited',
                        () => rcvr.toggleInheritanceForAttribute(field),
                        rcvr.inheritsAttribute(field),
                        'uncheck to\ndisinherit',
                        localize('check to inherit\nfrom')
                            + ' ' + rcvr.exemplar.name
                    );
                }
            }

            if (StageMorph.prototype.enableCodeMapping) {
                menu.addLine();
                menu.addItem(
                    'header mapping...',
                    'mapToHeader'
                );
                menu.addItem(
                    'code mapping...',
                    'mapToCode'
                );
            };
        };
        return menu;
    };  if (!applyingToExecuteOrToAcess('isTemplate', this)) {
            menu.addLine();
            if (world.currentKey === 16) {
            menu.addItem(
                "copy",
                () => {
                    window.blockCopy = this.fullCopy()
                },
                'copies this script'
            );  menu.addItem(
                "cut",
                () => {window.blockCopy = this.fullCopy(); this.destroy();},
                'copies this script and\ndeletes it'
            );} else {
            menu.addItem(
                "copy",
                () => {
                    window.blockCopy = this.fullCopy()
                    var nb = window.blockCopy.nextBlock()
                    if (nb) {
                        nb.destroy();
                    }
                },
                'copies this block'
            );
            menu.addItem(
                "cut",
                'userCut',
                'copies this block and\ndeletes it'
            );};
        }
    menu.addLine();
    if (this.selector === 'reportGetVar') {
        menu.addItem(
            'rename...',
            renameVar,
            'rename only\nthis reporter'
        );
    } else if (SpriteMorph.prototype.blockAlternatives[this.selector]) {
        menu.addItem(
            'relabel...',
            () => this.relabel(
                SpriteMorph.prototype.blockAlternatives[this.selector]
            )
        );
    } else if (this.isCustomBlock && this.alternatives) {
        alternatives = this.alternatives();
        if (alternatives.length > 0) {
            menu.addItem(
                'relabel...',
                () => this.relabel(alternatives)
            );
        }
    };

    // direct relabelling:
    // - JIT-compile HOFs - experimental
    // - vector pen trails
    // - all at once
    // - mixing colors
    if (this.selector === 'mixColors') {
    if (this.inputs()[0].constructor.name === 'MultiArgMorph') {
    if (this.inputs()[0].inputs().length === 2) {
    menu.addItem('relabel...', (() => {
    var clr1 = this.inputs()[0].inputs()[0].color;
    var clr2 = this.inputs()[0].inputs()[1].color;
    this.setSelector('mixClrsAt');
    this.inputs()[0].setColor(clr1);
    this.inputs()[1].setColor(clr2);
    this.fixLayout();
    }));};};}; if (this.selector === 'mixClrsAt') {
    if (this.inputs()[2].constructor.name === 'InputSlotMorph') {
    if (this.inputs()[2].evaluate() === 50) {
    menu.addItem('relabel...', (() => {
    var clr1 = this.inputs()[0]; var clr2 = this.inputs()[1];
    this.setSelector('mixColors');
    this.inputs()[0].children[0] = clr1;
    this.inputs()[0].children[2] = clr2;
    this.fixLayout();}));};};}; if (this.selector === 'receiveGo') {menu.addItem('be inner', ((
    ) => {var block = this.nextBlock(); Object.setPrototypeOf(this, DefinitorBlockMorph.prototype
    ); this.selector = 'runScript'; this.setSpec('when %flagTheme clicked %c'); if (
    block instanceof Morph) {this.inputs()[0].nestedBlock(block); this.inputs()[0].nestedBlock(
    ).fixBlockColor();}; this.fixLayout(); this.fullChanged();}));} else if (this.selector === 'runScript'
    ) {menu.addItem('be outer', (() => {var block = this.inputs()[0].nestedBlock(); Object.setPrototypeOf(this,
    HatBlockMorph.prototype); this.selector = 'receiveGo'; this.setSpec('when %flagTheme clicked'); if (
    block instanceof Morph) {this.nextBlock(block); this.nextBlock().fixBlockColor();}; this.fixLayout();
    this.fullChanged();}));}; if (
        contains(
            ['reportMap', 'reportKeep', 'reportFindFirstFixed', 'reportCombine'],
            this.selector
        )
    ) {
        alternatives = {
            reportMap : 'reportAtomicMap',
            reportKeep : 'reportAtomicKeep',
            reportFindFirstFixed: 'reportAtomicFindFirstFixed',
            reportCombine : 'reportAtomicCombine'
        };
        menu.addItem(
            'compile',
            () => this.setSelector(alternatives[this.selector]),
            'experimental!\nmake this reporter fast and uninterruptable\n' +
                'CAUTION: Errors in the ring\ncan break your Snap! session!'
        );
    } else if (
        contains(
            [
                'reportAtomicMap',
                'reportAtomicKeep',
                'reportAtomicFindFirstFixed',
                'reportAtomicCombine'
            ],
            this.selector
        )
    ) {
        alternatives = {
            reportAtomicMap : 'reportMap',
            reportAtomicKeep : 'reportKeep',
            reportAtomicFindFirstFixed: 'reportFindFirstFixed',
            reportAtomicCombine : 'reportCombine'
        };
        menu.addItem(
            'uncompile',
            () => this.setSelector(alternatives[this.selector])
        );
    } else if (
        contains(
            ['reportPenTrailsAsCostume', 'reportPentrailsAsSVG'],
            this.selector
        )
    ) {
        alternatives = {
            reportPenTrailsAsCostume : 'reportPentrailsAsSVG',
            reportPentrailsAsSVG : 'reportPenTrailsAsCostume'
        };
        menu.addItem(
            localize(
                SpriteMorph.prototype.blocks[
                    alternatives[this.selector]
                ].spec
            ),
            () => {
                this.setSelector(alternatives[this.selector]);
                this.changed();
            }
        );
    }

    menu.addItem(
        "duplicate",
        () => {
            var dup = this.fullCopy(),
                ide = this.parentThatIsA(IDE_Morph),
                blockEditor = this.parentThatIsA(BlockEditorMorph);
            dup.pickUp(world);
            // register the drop-origin, so the block can
            // slide back to its former situation if dropped
            // somewhere where it gets rejected
            if (!ide && blockEditor) {
                ide = blockEditor.target.parentThatIsA(IDE_Morph);
            }
            if (ide) {
                world.hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                };
            }
        },
        'make a copy\nand pick it up'
    );
    if (this instanceof CommandBlockMorph && this.nextBlock()) {
        menu.addItem(
            (proc ? this.fullCopy() : this).thumbnail(0.5, 60),
            () => {
                var cpy = this.fullCopy(),
                    nb = cpy.nextBlock(),
                    ide = this.parentThatIsA(IDE_Morph),
                    blockEditor = this.parentThatIsA(BlockEditorMorph);
                if (nb) {nb.destroy(); }
                cpy.pickUp(world);
                if (!ide && blockEditor) {
                    ide = blockEditor.target.parentThatIsA(IDE_Morph);
                }
                if (ide) {
                    world.hand.grabOrigin = {
                        origin: ide.palette,
                        position: ide.palette.center()
                    };
                }
            },
            'only duplicate this block'
        );
        menu.addItem(
            'extract',
            'userExtractJustThis',
            'only grab this block'
        );
    }
    menu.addItem(
        "delete",
        'userDestroy'
    );
    if (isNil(this.comment)) {
        menu.addItem(
            "add comment",
            () => {
                var comment = new CommentMorph;
                this.comment = comment;
                comment.block = this;
                comment.layoutChanged();

                // Simulate drag/drop for better undo/redo behavior
                var scripts = this.parentThatIsA(ScriptsMorph),
                    ide = this.parentThatIsA(IDE_Morph),
                    blockEditor = this.parentThatIsA(BlockEditorMorph);
                if (!ide && blockEditor) {
                    ide = blockEditor.target.parentThatIsA(IDE_Morph);
                }
                if (ide) {
                    world.hand.grabOrigin = {
                        origin: ide.palette,
                        position: ide.palette.center()
                    };
                }
                scripts.clearDropInfo();
                scripts.lastDropTarget = {element : this};
                scripts.lastDroppedBlock = comment;
                scripts.recordDrop(world.hand.grabOrigin);
            }
        );
    }
    menu.addLine();
    menu.addItem(
        "script pic...",
        () => {
            var ide = this.parentThatIsA(IDE_Morph) ||
                this.parentThatIsA(BlockEditorMorph).target.parentThatIsA(
                    IDE_Morph
            );
            ide.saveCanvasAs(
                top.scriptPic(),
                (ide.projectName || localize('untitled')) + ' ' +
                    localize('script pic')
            );
        },
        'save a picture\nof this script'
    );
    if (top instanceof ReporterBlockMorph ||
        (!(top instanceof PrototypeHatBlockMorph) &&
            top.allChildren().some((any) => any.selector === 'doReport'))
    ) {
        menu.addItem(
            "result pic...",
            () => top.exportResultPic(),
            'save a picture of both\nthis script and its result'
        );
    };
    if (top instanceof PrototypeHatBlockMorph) {
        menu.addItem(
            "export...",
            () => top.exportBlockDefinition(),
            'including dependencies'
        );
    } else {
        menu.addItem(
            'export script',
            () => top.exportScript(),
            'download this script\nas an XML file'
        );
    };
    if (proc) {
        if (vNames.length) {
            menu.addLine();
            vNames.forEach(vn =>
                menu.addItem(
                    vn + '...',
                    () => proc.doShowVar(vn)
                )
            );
        }
        proc.homeContext.variables.names().forEach(vn => {
            if (!contains(vNames, vn)) {
                menu.addItem(
                    vn + '...',
                    () => proc.doShowVar(vn)
                );
            }
        });
        return menu;
    }
    if (this.parent.parentThatIsA(RingMorph)) {
        menu.addLine();
        menu.addItem("unquote", 'unringify');
        menu.addItem("quote", 'ringify');
        return menu;
    };
    if (contains(
        ['doBroadcast', 'doBroadcastAndWait', 'stopTheMessage', 'receiveMessage'],
        this.selector
    )) {
        hasLine = true;
        menu.addLine();
        menu.addItem(
            (this.selector.indexOf('receive') === 0 ?
                "senders..." : "receivers..."),
            'showMessageUsers'
        );
    };
    if ((this.parent instanceof ReporterSlotMorph
    ) || (this.parent instanceof CommandSlotMorph)
    ) {return menu;}; if (!hasLine) {menu.addLine(
    );}; menu.addItem("quote", 'ringify'); if (
    StageMorph.prototype.enableCodeMapping) {
        menu.addLine();
        menu.addItem(
            'header mapping...',
            'mapToHeader'
        );
        menu.addItem(
            'code mapping...',
            'mapToCode'
        );
    };
    return menu;
};

BlockMorph.prototype.showMessageUsers = function () {
    // for the following selectors:
    // ['doBroadcast', 'doBroadcastAndWait',
    // 'stopTheMessage', 'receiveMessage']

    var ide = this.parentThatIsA(IDE_Morph) ||
            this.parentThatIsA(BlockEditorMorph)
                .target.parentThatIsA(IDE_Morph),
        corral = ide.corral,
        isSender = this.selector.indexOf('doBroadcast') === 0,
        isReceiver = this.selector.indexOf('receive') === 0,
        getter = isReceiver ? 'allSendersOf' : 'allHatBlocksFor',
        inputs = this.inputs(),
        message, receiverSlot, receiverName, knownSenders;

    if (this.selector === 'receiveGo') {
        message = '__shout__go__';
    } else if (this.selector === 'receiveOnClone') {
        message = '__clone__init__';
    } else if (inputs[0] instanceof InputSlotMorph) {
        message = inputs[0].evaluate();
        if (isSender && message instanceof Array) {
            message = message[0];
        }
    }

    if (isSender) {
        receiverSlot = inputs[1].inputs()[0];
        if (receiverSlot instanceof InputSlotMorph) {
            receiverName = receiverSlot.evaluate();
            if (receiverName instanceof Array) { // ['all']
                receiverName = null;
            }
        }
    } else if (isReceiver) {
        receiverName = this.scriptTarget().name;
    }

    if (message !== '') {
        if (isReceiver) {
            knownSenders = ide.stage.globalBlocksSending(message, receiverName);
        }
        corral.frame.contents.children.concat(corral.stageIcon).forEach(
            icon => {
                if (icon.object &&
                    icon.object[getter](
                        message,
                        receiverName,
                        knownSenders
                    ).length
                ) {
                    icon.flash();
                }
            }


        );
    }
};

BlockMorph.prototype.isSending = function (message, receiverName, known = []) {
    if (typeof message === 'number') {
        message = message.toString();
    };
    return this.allChildren().some(morph => {
        var inputs, event, receiverSlot, eventReceiver;
        if (morph.isCustomBlock &&
                morph.isGlobal &&
                    contains(known, morph.definition)
        ) {
            return true;
        };
        if (morph.selector && morph.selector.indexOf('doBroadcast') === 0) {
            inputs = morph.inputs();
            event = inputs[0].evaluate();
            if (event instanceof Array) {
                event = event[0];
            };
            receiverSlot = inputs[1].inputs()[0];
            if (receiverSlot instanceof InputSlotMorph) {
                eventReceiver = receiverSlot.evaluate();
                if (eventReceiver instanceof Array) {eventReceiver = null;};
            };
            return (!eventReceiver || (receiverName === eventReceiver)) &&
                ((event === message) ||
                    (message instanceof Array &&
                        message[0] === 'any message'));
        };
        return false;
    });
};

BlockMorph.prototype.developersMenu = function () {
    var menu = BlockMorph.uber.developersMenu.call(this);
    menu.addLine();
    menu.addItem("delete block", 'deleteBlock');
    menu.addItem(
        "spec...",
        () => new DialogBoxMorph(
            this,
            this.userSetSpec,
            this
        ).prompt(
            menu.title + '\nspec',
            this.blockSpec,
            this.world()
        )
    );
    return menu;
};

BlockMorph.prototype.isInheritedVariable = function (shadowedOnly) {
    // private - only for variable getter template inside the palette
    if (this.isTemplate &&
            (this.selector === 'reportGetVar') &&
            (this.parent instanceof FrameMorph)) {
        return contains(
            this.scriptTarget().inheritedVariableNames(shadowedOnly),
            this.blockSpec
        );
    }
    return false;
};

BlockMorph.prototype.isTransientVariable = function () {
    // private - only for variable getter template inside the palette
    var varFrame = this.scriptTarget().variables.silentFind(this.blockSpec);
    return varFrame ? varFrame.vars[this.blockSpec].isTransient : false;
};

BlockMorph.prototype.toggleTransientVariable = function () {
    // private - only for variable getter template inside the palette
    var varFrame = this.scriptTarget().variables.silentFind(this.blockSpec);
    if (!varFrame) {return; }
    varFrame.vars[this.blockSpec].isTransient =
        !(varFrame.vars[this.blockSpec].isTransient);
};

BlockMorph.prototype.deleteBlock = function () {
    // delete just this one block, keep inputs and next block around
    var scripts = this.parentThatIsA(ScriptsMorph),
        nb = this.nextBlock ? this.nextBlock() : null,
        tobefixed,
        isindef;
    if (scripts) {
        if (nb) {
            scripts.add(nb);
        }
        this.inputs().forEach(inp => {
            if (inp instanceof BlockMorph) {
                scripts.add(inp);
            }
        });
    }
    if (this instanceof ReporterBlockMorph &&
			((this.parent instanceof BlockMorph)
            	|| (this.parent instanceof MultiArgMorph)
            	|| (this.parent instanceof ReporterSlotMorph))) {
        this.parent.revertToDefaultInput(this);
    } else { // CommandBlockMorph
        if (this.parent && this.parent.fixLayout) {
            tobefixed = this.parentThatIsA(ArgMorph);
        } else { // must be in a custom block definition
            isindef = true;
        }
    }
    this.destroy();
    if (isindef) {
        /*
            since the definition's body still points to this block
            even after it has been destroyed, mark it to be deleted
            later.
        */
        this.isCorpse = true;
    }
    if (tobefixed) {
        tobefixed.fixLayout();
    }
};

BlockMorph.prototype.ringify = function () {var ring, top, center, target = this.selectForEdit();
if (target !== this) {return this.ringify.call(target);}; ring = new RingMorph; top = this.topBlock();
center = top.fullBounds().center(); if (this.parent === null) {return null;}; top.fullChanged();
    if (this.parent instanceof SyntaxElementMorph) {
        if (this instanceof ReporterBlockMorph) {
            this.parent.replaceInput(this, ring, true); // don't vanish
            ring.embed(this, null, true); // don't vanish
        } else if (top) {
            top.parent.add(ring);
            ring.embed(top);
            ring.setCenter(center);
        }
    } else {
        this.parent.add(ring);
        ring.embed(this);
        ring.setCenter(center);
    }
    this.fixBlockColor(null, true);
    top.fullChanged();
    this.scriptTarget().parentThatIsA(IDE_Morph).recordUnsavedChanges();
};

BlockMorph.prototype.unringify = function () {
    var ring, top, center, scripts, block,
        target = this.selectForEdit();
    if (target !== this) {
        return this.unringify.call(target);
    }
    ring = this.parent.parentThatIsA(RingMorph);
    top = this.topBlock();
    scripts = this.parentThatIsA(ScriptsMorph);
    if (ring === null) {return null; }
    block = ring.contents();
    center = ring.center();

    top.fullChanged();
    if (ring.parent instanceof SyntaxElementMorph) {
        if (block instanceof ReporterBlockMorph) {
            ring.parent.replaceInput(ring, block);
        } else if (scripts) {
            scripts.add(block);
            block.setFullCenter(center);
            block.moveBy(20);
            ring.parent.revertToDefaultInput(ring);
        }
    } else {
        ring.parent.add(block);
        block.setFullCenter(center);
        ring.destroy();
    }
    this.fixBlockColor(null, true);
    top.fullChanged();
    this.scriptTarget().parentThatIsA(IDE_Morph).recordUnsavedChanges();
};

BlockMorph.prototype.relabel = function (alternativeSelectors) {
    var menu, oldInputs,
        target = this.selectForEdit(); // copy-on-edit
    if (target !== this) {
        return this.relabel.call(target, alternativeSelectors);
    }
    menu = new MenuMorph(this);
    oldInputs = this.inputs();
    alternativeSelectors.forEach(alternative => {
        var block, selector, offset;
        if (alternative instanceof Array) {
            selector = alternative[0];
            offset = -alternative[1];
        } else {
            selector = alternative;
            offset = 0;
        }
        block = SpriteMorph.prototype.blockForSelector(selector, true);
        block.restoreInputs(oldInputs, offset);
        block.fixBlockColor(null, true);
        block.addShadow(new Point(3, 3));
        menu.addItem(
            block.doWithAlpha(1, () => block.fullImage()),
            () => {
                this.setSelector(selector, -offset);
                this.scriptTarget().parentThatIsA(
                    IDE_Morph
                ).recordUnsavedChanges();
            }
        );
    });
    menu.popup(world, this.bottomLeft().subtract(new Point(
        8,
        this instanceof CommandBlockMorph ? this.corner : 0
    )));
};

BlockMorph.prototype.setSelector = function (aSelector, inputOffset = 0) {
    // private - used only for relabel()
    // input offset is optional and can be used to shift the inputs
    // to be restored
    var oldInputs = this.inputs(),
        scripts = this.parentThatIsA(ScriptsMorph),
        surplus,
        info,
        slots,
        i;
    info = SpriteMorph.prototype.blocks[aSelector];
    this.setCategory(info.category);
    this.selector = aSelector;
    this.setSpec(localize(info.spec));
    this.defaults = info.defaults || [];

    // restore default values
    slots = this.inputs();
    if (slots[0] instanceof MultiArgMorph) {
        slots[0].setContents(this.defaults);
        slots[0].defaults = this.defaults;
    } else {
        for (i = 0; i < this.defaults.length; i += 1) {
            if (this.defaults[i] !== null && slots[i].setContents) {
                slots[i].setContents(this.defaults[i]);
            }
        }
    }

    // restore previous inputs
    surplus = this.restoreInputs(oldInputs, -inputOffset);
    this.fixLabelColor();

    // place surplus blocks on scipts
    if (scripts && surplus.length) {
        surplus.forEach(blk => {
            blk.moveBy(10);
            scripts.add(blk);
        });
    };
};

BlockMorph.prototype.restoreInputs = function (oldInputs, offset = 0) {
    // private - used only for relabel()
    // try to restore my previous inputs when my spec has been changed
    // return an Array of left-over blocks, if any
    // optional offset parameter allows for shifting the range
    // of inputs to be restored
    var old, nb, i, src, trg
        scripts = this.parentThatIsA(ScriptsMorph),
        element = this,
        inputs = this.inputs(),
        leftOver = [],
        myself = this;

    function preserveBlocksIn(slot) {
    if (myself.isCustomBlock) {
        // keep unused blocks around in the scripting area
        if (slot instanceof MultiArgMorph) {
            return slot.inputs().forEach(item => preserveBlocksIn(item));
        } else if (slot instanceof CSlotMorph) {
            slot = slot.evaluate();
        };
        if (slot instanceof BlockMorph && scripts) {
            scripts.add(slot);
            slot.moveBy(new Point(20, 20));
            slot.fixBlockColor();
    };} else {
        if (slot instanceof ReporterBlockMorph) {
            leftOver.push(slot);
        } else if (slot instanceof CommandSlotMorph) {
            nb = slot.nestedBlock();
            if (nb) {
                leftOver.push(nb);
            };
        } else if (slot instanceof MultiArgMorph) {
            slot.inputs().forEach(inp => {
                if (inp instanceof ReporterBlockMorph) {
                    leftOver.push(inp);
                } else if (inp instanceof CommandSlotMorph) {
                    nb = inp.nestedBlock();
                    if (nb) {
                        leftOver.push(nb);
                    };
                };
            });
        };
    };}; // gather leading surplus blocks
    for (i = 0; i < offset; i += 1) {
        old = oldInputs[i];
        if (old instanceof ReporterBlockMorph) {
            leftOver.push(old);
        } else if (old instanceof CommandSlotMorph) {
            nb = old.nestedBlock();
            if (nb) {
                leftOver.push(nb);
            };
        };
    };

    // special cases for relabelling to / from single variadic infix reporters
    src = oldInputs[0];
    trg = inputs[0];

    // 1.
    // both blocks have exactly one variadic slot, with the same slot spec but
    // different infixes, and not nessesarily matching numbers of expanded
    // slots.
    if (oldInputs.length === 1 &&
        (inputs.length === 1) &&
        src instanceof MultiArgMorph &&
        trg instanceof MultiArgMorph &&
        snapEquals(src.slotSpec, trg.slotSpec) &&
        (!snapEquals(src.infix, trg.infix))
    ) {
        element = trg;
        oldInputs = src.inputs();
        while(element.inputs().length < oldInputs.length) {
            element.addInput();
        }
        inputs = element.inputs();
    }

    // 2.
    // this block has a single variadic infix slot which will hold all of the
    // old block inputs.
    else if (oldInputs.length &&
        (inputs.length === 1) &&
        trg instanceof MultiArgMorph &&
        !(src instanceof MultiArgMorph) &&
        !(src instanceof ArgLabelMorph)
    ) {
        element = trg;
        inputs = element.inputs();
    }

    // 3.
    // the old inputs are a single variadic infix slot whose inputs will be
    // distributed over this blocks non-variadic slots
    else if (oldInputs.length === 1 &&
        inputs.length &&
        src instanceof MultiArgMorph &&
        !(trg instanceof MultiArgMorph)
    ) {
        oldInputs = src.inputs();
    }; // restore matching inputs in their original order
    inputs.forEach(inp => {
        old = oldInputs[offset];
        if ((old instanceof ArgLabelMorph) && (inp instanceof MultiArgMorph)) {
        old = old.argMorph();}; if (old instanceof BooleanSlotMorph) {
            inp.setContents(old.evaluate());
        } else if (old instanceof RingMorph) {
            if (old.contents()) {
                element.replaceInput(inp, old.fullCopy());
            };
        } else if (old instanceof ReporterBlockMorph) {
            if (inp instanceof TemplateSlotMorph || inp.isStatic) {
                leftOver.push(old);
            } else {
                element.replaceInput(inp, old.fullCopy());
            };
        } else if (old && inp instanceof InputSlotMorph) {
            // original - turns empty numberslots to 0:
            // inp.setContents(old.evaluate());
            // "fix" may be wrong b/c constants
            if (old.contents) {
                inp.setContents(old.contents().text);
                if (old.constant) {
                    inp.constant = old.constant;
                };
            };
        } else if (((old instanceof BlockSlotMorph) || (old instanceof CommandSlotMorph)) &&
                   ((inp instanceof BlockSlotMorph) || (inp instanceof CommandSlotMorph))) {
            var bigOld = old.fullCopy(), selectedBlock = ((old[((old instanceof BlockSlotMorph
            ) ? 'evaluate' : 'nestedBlock')])()), bigInp = inp.fullCopy(); if (
            selectedBlock instanceof SyntaxElementMorph) {
            selectedBlock = selectedBlock.fullCopy(); if (
            selectedBlock instanceof BlockMorph) {if (
            inp instanceof BlockSlotMorph) {if (selectedBlock instanceof CommandBlockMorph
            ) {bigInp.reactToDropOf(selectedBlock);};} else {bigInp.nestedBlock(selectedBlock
            );};}; if (!isNil(old)) {element.replaceInput(inp, bigInp);};} else {
            element.replaceInput(inp, bigInp);};
        } else if ((old instanceof ColorSlotMorph) &&
                   (inp instanceof ColorSlotMorph)) {
            element.replaceInput(inp, old.fullCopy());
        } else if ((old instanceof FunctionSlotMorph) &&
                   (inp instanceof FunctionSlotMorph)) {
        var oldSlot = old.fullCopy(), isReplaced = false;
            if ((old.constructor.name === 'RingReporterSlotMorph'
            ) && (inp.constructor.name === 'RingReporterSlotMorph')) {
            isReplaced = true; inp.nestedBlock(oldSlot.nestedBlock());
            } else if ((old.constructor.name === 'ReporterSlotMorph'
            ) && (inp.constructor.name === 'ReporterSlotMorph')) {
            old.isPredicate = inp.isPredicate; if (inp.isPredicate
            ) {oldSlot.backupRender = oldSlot.renderPredicate;} else {
            oldSlot.backupRender = oldSlot.renderReporter;};
            oldSlot.rerender(); oldSlot.fullChanged();};
            if (!isReplaced) {element.replaceInput(inp, oldSlot);};
        } else if ((old instanceof MultiArgMorph) &&
                (inp instanceof MultiArgMorph)) {
            if (snapEquals(old.slotSpec, inp.slotSpec
            ) && snapEquals(old.infix, inp.infix)) {
            element.replaceInput(inp, old.fullCopy(
        ));};} else {
            preserveBlocksIn(old);
        }; offset++;
    }); // gather trailing surplus blocks
    for (offset; offset < oldInputs.length; offset += 1) {
        preserveBlocksIn(oldInputs[offset]);
    }; element.cachedInputs = null;
    this.cachedInputs = null;
    if (!(myself.isCustomBlock
    )) {return leftOver;};
};

// BlockMorph helpscreens

BlockMorph.prototype.showHelp = function () {
    var myself = this,
        ide = this.parentThatIsA(IDE_Morph),
        pic = new Image,
        dlg,
        help,
        def,
        comment,
        block,
        spec,
        ctx;

    if (this.isCustomBlock) {
        if (this.isGlobal) {
            spec = this.definition.helpSpec();
        } else {
            spec = (this.scriptTarget()
            ).getMethod(this.blockSpec).helpSpec();
        }
    } else {
        spec = this.selector;
    }

    if (!ide) {
        dlg = this.parentThatIsA(DialogBoxMorph);
        if (dlg && isSnapObject(dlg.target)) {
            ide = dlg.target.parentThatIsA(IDE_Morph);
        }
    }

    pic.onload = function () {
        help = newCanvas(new Point(pic.width,
        pic.height), true); // nonRetina
        ctx = help.getContext('2d');
        ctx.drawImage(pic, 0, 0);
        var helpDialog = new DialogBoxMorph;
        helpDialog.key = 'dialog-help-' + spec;
        helpDialog.inform(
            'Help',
            null,
            world,
            help
        );
    };

    if (this.isCustomBlock) {
        def = this.isGlobal ? this.definition
                : this.scriptTarget().getMethod(this.blockSpec);
        comment = def.comment;
        if (comment) {
            block = def.blockInstance();
            block.refreshDefaults(def);
            comment = comment.fullCopy();
            comment.contents.parse();
            help = '';
            comment.contents.lines.forEach(line =>
                help = help + '\n' + line
            );
            var helpDialog = new DialogBoxMorph;
            helpDialog.key = 'dialog-help-' + spec;
            helpDialog.inform(
                'Help',
                help.substr(1),
                myself.world(),
                block.doWithAlpha(
                    1,
                    () => {
                        block.addShadow();
                        return block.fullImage();
                    }
                )
            );
        };
    } else {
    pic.src = 'src/help/' + spec + '.svg';
    };
};

// BlockMorph exporting picture with result bubble

BlockMorph.prototype.exportResultPic = function () {
    var top = this.topBlock(),
        receiver = top.scriptTarget(),
        stage;
    if (top !== this) {return; }
    if (receiver) {
        stage = receiver.parentThatIsA(StageMorph);
        if (stage) {
            stage.threads.stopProcess(top);
            stage.threads.startProcess(top, receiver, false, true);
        }
    }
};

// BlockMorph exporting a script

BlockMorph.prototype.exportScript = function () {
    // assumes this is the script's top block
    var ide = this.parentThatIsA(IDE_Morph),
        blockEditor = this.parentThatIsA(BlockEditorMorph),
        xml;

    if (!ide && blockEditor) {
        ide = blockEditor.target.parentThatIsA(IDE_Morph);
    }
    if (!ide) {
        return;
    }

    xml = this.toXMLString();
    if (xml) {
        ide.saveXMLAs(
            xml,
            this.selector + ' script',
            false
        );
    }
};

BlockMorph.prototype.toXMLString = function () {
    var ide = this.parentThatIsA(IDE_Morph),
        blockEditor = this.parentThatIsA(BlockEditorMorph),
        rcvr = this.scriptTarget(),
        dependencies = [],
        isReporter = this instanceof ReporterBlockMorph;

    if (!ide && blockEditor) {
        ide = blockEditor.target.parentThatIsA(IDE_Morph);
    }
    if (!ide) {
        return;
    }

    // collect custom block definitions referenced in this script:
    this.forAllChildren(morph => {
        var def;
        if (morph.isCustomBlock) {
            def = morph.isGlobal ? morph.definition
                : rcvr.getMethod(morph.semanticSpec);
            [def].concat(def.collectDependencies([], [], rcvr)).forEach(
                fun => {
                    if (!contains(dependencies, fun)) {
                        dependencies.push(fun);
                    }
                }
            );
        }
    });

    return '<script app="' +
        ide.serializer.app +
        '" version="' +
        ide.serializer.version +
        '">' +
        (dependencies.length ? ide.blocksLibraryXML(dependencies, false) : '') +
        (isReporter ? '<script>' : '') +
        ide.serializer.serialize(this) +
        (isReporter ? '</script>' : '') +
        '</script>';
};

// BlockMorph syntax analysis

BlockMorph.prototype.components = function (parameterNames = []) {
    if (this instanceof ReporterBlockMorph) {
        return this.syntaxTree(parameterNames);
    }
    var seq = new List(this.metaSequence()).map((block, i) =>
        block.syntaxTree(i < 1 ? parameterNames : [])
    );
    return seq.length() === 1 ? seq.at(1) : seq;
};

BlockMorph.prototype.syntaxTree = function (parameterNames) {
    var expr = this.fullCopy(),
        nb = expr.nextBlock ? expr.nextBlock() : null,
        inputs, parts;
    if (nb) {
        nb.destroy();
    }
    expr.fixBlockColor(null, true);
    inputs = expr.inputs();
    parts = new List([expr.reify()]);
    inputs.forEach(inp => {
        var val;
        if (inp instanceof BlockMorph) {
            if (inp instanceof RingMorph && inp.isEmptySlot()) {
                parts.add();
                return;
            }
            parts.add(inp.components());
            expr.revertToEmptyInput(inp);
        } else if (inp.isEmptySlot()) {
            parts.add();
        } else if (inp instanceof MultiArgMorph) {
            if (!inp.inputs().length) {
                parts.add();
            }
            inp.inputs().forEach((slot, i) => {
                var entry;
                if (slot instanceof BlockMorph) {
                    if (slot instanceof RingMorph && slot.isEmptySlot()) {
                        parts.add();
                        return;
                    }
                    parts.add(slot.components());
                } else if (slot.isEmptySlot()) {
                    parts.add();
                } else {
                    entry = slot.evaluate();
                    parts.add(entry instanceof BlockMorph ?
                        entry.components() : entry);
                }
                inp.revertToEmptyInput(slot);
            });
        } else if (inp instanceof ArgLabelMorph) {
            parts.add(inp.argMorph().components());
            expr.revertToEmptyInput(inp).collapseAll();
        } else {
            val = inp.evaluate();
            if (val instanceof Array) {
                val = '[' + val + ']';
            }
            if (inp instanceof ColorSlotMorph) {
                val = val.toString();
            }
            parts.add(val instanceof BlockMorph ? val.components() : val);
            expr.revertToEmptyInput(inp, true);
        }
    });
    parts.at(1).updateEmptySlots();
    if (expr.selector === 'reportGetVar') {
        parts.add(expr.blockSpec);
        expr.setSpec('\xa0'); // non-breaking space, appears blank
    }
    parameterNames.forEach(name => parts.add(name));
    return parts;
};

BlockMorph.prototype.equalTo = function (other) {
    // private - only to be called from a Context
    return this.constructor.name === other.constructor.name &&
        this.selector === other.selector &&
        this.blockSpec === other.blockSpec;
};

BlockMorph.prototype.copyWithInputs = function (inputs) {
    // private - only to be called from a Context
    var cpy = this.fullCopy(),
        slots = cpy.inputs(),
        dta = inputs.itemsArray().map(inp =>
            inp instanceof Context ? inp.expression : inp
        ),
        count = 0,
        dflt;

    function isOption(data) {
        return isString(data) &&
            data.length > 2 &&
            data[0] === '[' &&
            data[data.length - 1] === ']';
    };

    if (dta.length === 0) {
        return cpy.reify();
    };  if (cpy.selector === 'reportGetVar' && (
        (dta.length === 1) || (cpy.blockSpec === '\xa0' && dta.length > 1))
    ) {
        cpy.setSpec(dta[0]);
        return cpy.reify(dta.slice(1));
    };

    // restore input slots
    slots.forEach(slt => {
        if (slt instanceof BlockMorph) {
            dflt = cpy.revertToEmptyInput(slt);
            if (dflt instanceof MultiArgMorph) {
                dflt.collapseAll();
            }
        } else if (slt instanceof MultiArgMorph) {
            slt.inputs().forEach(entry => {
                if (entry instanceof BlockMorph) {
                    slt.revertToEmptyInput(entry);
                }
            });
        }
    });

    // distribute inputs among the slots
    slots = cpy.inputs();
    slots.forEach((slot) => {
        var inp, i, cnt;
        if (slot instanceof MultiArgMorph && dta[count] instanceof List) {
            // let the list's first item control the arity of the polyadic slot
            // fill with the following items in the list
            inp = dta[count];
            if (inp.length() === 0) {
                nop(); // ignore, i.e. leave slot as is
            } else {
                slot.collapseAll();
                for (i = 1; i <= inp.at(1); i += 1) {
                    cnt = inp.at(i + 1);
                    if (cnt instanceof List) {
                        cnt = Process.prototype.assemble(cnt);
                    }
                    if (cnt instanceof Context) {
                        slot.replaceInput(
                            slot.addInput(),
                            cnt.expression.fullCopy()
                        );
                    } else {
                        slot.addInput(cnt);
                    };
                };
            };  count += 1;
        } else if (slot instanceof MultiArgMorph && slot.inputs().length) {
            // fill the visible slots of the polyadic input as if they were
            // permanent inputs each
            slot.inputs().forEach(entry => {
                inp = dta[count];
                if (inp instanceof BlockMorph) {
                    if (inp instanceof CommandBlockMorph && entry.nestedBlock) {
                        entry.nestedBlock(inp);
                    } else if (inp instanceof ReporterBlockMorph &&
                            (!entry.isStatic || entry instanceof RingMorph)) {
                    slot.replaceInput(entry, inp);};
                } else {
                    if (inp instanceof List && inp.length() === 0) {
                        nop(); // ignore, i.e. leave slot as is
                    } else if (entry instanceof InputSlotMorph ||
                            entry instanceof TemplateSlotMorph ||
                            entry instanceof BooleanSlotMorph) {
                        entry.setContents(inp);
                    };};      count += 1;});
        } else {
            // fill the visible slot, treat collapsed variadic slots as single
            // input (to be replaced by a reporter),
            // skip in case the join value is an empty list
            inp = dta[count];
            if (inp === undefined) {return; }
            if (inp instanceof BlockMorph) {
                if (inp instanceof CommandBlockMorph && slot.nestedBlock) {
                    slot.nestedBlock(inp);
                } else if (inp instanceof ReporterBlockMorph &&
                        (!slot.isStatic || slot instanceof RingMorph)) {
                    cpy.replaceInput(slot, inp);
                } else if (inp instanceof ReporterBlockMorph &&
                        slot.nestedBlock) {
                    slot.nestedBlock(inp);
                };
            } else {
                if (inp instanceof List && inp.length() === 0) {
                    nop(); // ignore, i.e. leave slot as is
                } else if (slot instanceof ColorSlotMorph) {
                    slot.setColor(Color.fromString(inp));
                } else if (slot instanceof InputSlotMorph) {
                    slot.setContents(isOption(inp) ? [inp.slice(1, -1)] : inp);
                } else if (slot instanceof TemplateSlotMorph ||
                        slot instanceof BooleanSlotMorph) {
                    slot.setContents(inp);
                };
            };  count += 1;
        };
    }); return cpy.reify(dta.slice(count));
};

BlockMorph.prototype.copyWithNext = function (
next, parameterNames) {var expr = this.fullCopy(
), top; if (this instanceof ReporterBlockMorph) {
return expr.reify();}; top = (next.fullCopy()
).topBlock(); if (top instanceof CommandBlockMorph
) {expr.bottomBlock().nextBlock(top);}; return (
expr.reify(parameterNames));};

BlockMorph.prototype.reify = function (inputNames) {
var context = new Context; context.expression = this;
context.inputs = (inputNames || []); (context.emptySlots
) = this.markEmptySlots(); return context;};

BlockMorph.prototype.markEmptySlots = function (
) {var count = 0; this.allInputs().forEach((input
) => (delete input.bindingID)); (this.allEmptySlots(
)).forEach(slot => {count += 1; if ((slot
) instanceof MultiArgMorph) {(slot.bindingID
) = Symbol.for('arguments');} else {(slot
).bindingID = count;};}); return count;};

// BlockMorph code mapping

/*
    code mapping lets you use blocks to generate arbitrary text-based
    source code that can be exported and compiled / embedded elsewhere,
    it's not part of Snap's evaluator and not needed for Snap itself
*/

BlockMorph.prototype.mapToHeader = function () {
    var key = (((this.selector.substr(0, 5) === 'reify') || (this.selector === 'reportScript'
    )) ? 'reify' : this.selector), block = this.codeDefinitionHeader(), help, pic;
    block.addShadow(new Point(3, 3)); pic = block.doWithAlpha(1, (
    ) => block.fullImage()); if (this.isCustomBlock) {
        help = 'Enter code that corresponds to the block\'s definition. ' +
            'Use the formal parameter\nnames as shown and <body> to ' +
            'reference the definition body\'s generated text code.';
    } else {
        help = 'Enter code that corresponds to the block\'s definition. ' +
            'Choose your own\nformal parameter names (ignoring the ones ' +
            'shown).';
    };  new DialogBoxMorph(
        this,
        code => {
            if (key === 'evaluateCustomBlock') {
                this.definition.codeHeader = code;
            } else {
                StageMorph.prototype.codeHeaders[key] = code;
            };
        },  this
    ).promptCode(
        'Header mapping',
        key === 'evaluateCustomBlock' ? this.definition.codeHeader || ''
                 : StageMorph.prototype.codeHeaders[key] || '',
        this.world(),
        pic,
        help
    );
};

BlockMorph.prototype.mapToCode = function () {
    var key = (((this.selector.substr(0, 5) === 'reify') || (this.selector === 'reportScript'
    )) ? 'reify' : this.selector), block = this.codeMappingHeader(), pic; block.addShadow(
    new Point(3, 3)); pic = block.doWithAlpha(1, () => block.fullImage()); new DialogBoxMorph(
        this,
        code => {
            if (key === 'evaluateCustomBlock') {
                this.definition.codeMapping = code;
            } else {
                StageMorph.prototype.codeMappings[key] = code;
            };
        },  this
    ).promptCode(
        'Code mapping',
        key === 'evaluateCustomBlock' ? this.definition.codeMapping || ''
                 : StageMorph.prototype.codeMappings[key] || '',
        this.world(),    pic,
        'Enter code that corresponds to the block\'s operation ' +
            '(usually a single\nfunction invocation). Use <#n> to ' +
            'reference actual arguments as shown.'
    );
};

BlockMorph.prototype.mapHeader = function (aString, key) {
    // primitive for programatically mapping header code
    var sel = key || ((this.selector.substr(0, 5) === 'reify') || (this.selector === 'reportScript')) ?
            'reify' : this.selector;
    if (aString) {
        if (this.isCustomBlock) {
            this.definition.codeHeader = aString;
        } else {
            StageMorph.prototype.codeHeaders[sel] = aString;
        };
    };
};

BlockMorph.prototype.mapCode = function (aString, key) {
    // primitive for programatically mapping code
    var sel = key || ((this.selector.substr(0, 5) === 'reify') || (this.selector === 'reportScript')) ?
            'reify' : this.selector;
    if (aString) {
        if (this.isCustomBlock) {
            this.definition.codeMapping = aString;
        } else {
            StageMorph.prototype.codeMappings[sel] = aString;
        };
    };
};

BlockMorph.prototype.mappedCode = function (definitions) {
    var key = (((this.selector.substr(0, 5) === 'reify') || ((this
        ).selector === 'reportScript')) ? 'reify' : this.selector),
        code, codeLines, count = 1,
        header, headers, headerLines,
        body, bodyLines, defKey = (
        this.isCustomBlock ? (this
        ).definition.spec : key),
        defs = definitions || {},
        parts = [];
    code = key === 'reportGetVar' ? this.blockSpec
            : this.isCustomBlock ? this.definition.codeMapping || ''
                    : StageMorph.prototype.codeMappings[key] || '';

    // map header
    if (key !== 'reportGetVar' && !defs.hasOwnProperty(defKey)) {
        defs[defKey] = null; // create the property for recursive definitions
        if (this.isCustomBlock) {
            header = this.definition.codeHeader || '';
            if (header.indexOf('<body') !== -1) { // replace with def mapping
                body = '';
                if (this.definition.body) {
                    body = this.definition.body.expression.mappedCode(defs);
                };  bodyLines = body.split('\n');
                headerLines = header.split('\n');
                headerLines.forEach((headerLine, idx) => {
                    var prefix = '',
                        indent;
                    if (headerLine.trimLeft().indexOf('<body') === 0) {
                        indent = headerLine.indexOf('<body');
                        prefix = headerLine.slice(0, indent);
                    };  headerLines[idx] = headerLine.replace(
                        new RegExp('<body>'),
                        bodyLines.join('\n' + prefix)
                    );  headerLines[idx] = headerLines[idx].replace(
                        new RegExp('<body>', 'g'),
                        bodyLines.join('\n')
                    );
                }); header = headerLines.join('\n');
            };  defs[defKey] = header;
        } else {
            defs[defKey] = StageMorph.prototype.codeHeaders[defKey];
        };
    };  codeLines = code.split('\n');
    this.inputs().forEach(input =>
        parts.push(input.mappedCode(defs).toString())
    );
    parts.forEach(part => {
        var partLines = part.split('\n'),
            placeHolder = '<#' + count + '>',
            rx = new RegExp(placeHolder, 'g');
        codeLines.forEach((codeLine, idx) => {
            var prefix = '',
                indent;
            if (codeLine.trimLeft().indexOf(placeHolder) === 0) {
                indent = codeLine.indexOf(placeHolder);
                prefix = codeLine.slice(0, indent);
            };  codeLines[idx] = codeLine.replace(
                new RegExp(placeHolder),
                partLines.join('\n' + prefix)
            );  codeLines[idx] = codeLines[idx].replace(rx, partLines.join('\n'));
        });
        count += 1;
    }); code = codeLines.join('\n');
    if (this.nextBlock && this.nextBlock()) { // Command
        code += ('\n' + this.nextBlock().mappedCode(defs));
    };  if (!definitions) {headers = [];
        Object.keys(defs).forEach(each => {
            if (defs[each]) {
                headers.push(defs[each]);
            }
        });
        if (headers.length) {
            return headers.join('\n\n')
                + '\n\n'
                + code;
        }
    }
    return code;
};

BlockMorph.prototype.codeDefinitionHeader = function () {
    var block = this.isCustomBlock ? new PrototypeHatBlockMorph(this.definition)
            : SpriteMorph.prototype.blockForSelector(this.selector),
        hat = new HatBlockMorph(true), count = 1;

    if (this.isCustomBlock) {return block;};
    block.inputs().forEach(input => {
        var part = new TemplateSlotMorph('#' + count);
        block.replaceInput(input, part);
        count += 1;
    }); block.isPrototype = true;
    hat.replaceInput(hat.inputs()[0], block);
    return hat;
};

BlockMorph.prototype.codeMappingHeader = function () {
    var block = this.isCustomBlock ? this.definition.blockInstance()
            : SpriteMorph.prototype.blockForSelector(this.selector),
        hat = new HatBlockMorph(true), count = 1;

    block.inputs().forEach(input => {
        var part = new TemplateSlotMorph('<#' + count + '>');
        block.replaceInput(input, part);
        count += 1;
    }); block.isPrototype = true;
    hat.replaceInput(hat.inputs()[0], block);
    return hat;
};

// Variable refactoring

BlockMorph.prototype.refactorThisVar = function (justTheTemplate
) {/* Rename all occurrences of the variable this block is holding,
taking care of its lexical scope */ var receiver = this.scriptTarget(
), oldName = (this.instantiationSpec || this.blockSpec), cpy = (this
).fullCopy(); cpy.addShadow(); (new DialogBoxMorph(this, renameVarTo,
this)).prompt('Variable name', oldName, world, cpy.doWithAlpha(1,
() => cpy.fullImage()), (InputSlotMorph.prototype.getVarNamesDict
).call(this)); function renameVarTo (newName) {newName = (newName
).trim(); if (newName === '') {return;}; var block; if ((this.parent
) instanceof SyntaxElementMorph) {

            // commented out by jens and reformulated below
            // in an attempt to catch some bugs in v6:

        /*
            if (this.parentThatIsA(BlockEditorMorph)) {
                this.doRefactorBlockParameter(
                    oldName,
                    newName,
                    justTheTemplate
                );
            } else if (this.parentThatIsA(RingMorph)) {
                this.doRefactorRingParameter(oldName, newName, justTheTemplate);
            } else {
                this.doRefactorScriptVar(oldName, newName, justTheTemplate);
            }
        */

            // trying to make some things more reliable below,
            // I guess at one point we'll have to rethink the
            // whole mechanism (jens)

            if (this.parent instanceof BlockInputFragmentMorph) {
                this.doRefactorBlockParameter(
                    oldName,
                    newName,
                    justTheTemplate
                );
            } else if (this.parent instanceof TemplateSlotMorph) {
                block = this.parent.parentThatIsA(BlockMorph);
                if (block instanceof RingMorph) {
                    this.doRefactorRingParameter(
                        oldName,
                        newName,
                        justTheTemplate
                    );
                } else if (block.selector === 'doDeclareVariables') {
                    this.doRefactorScriptVar(oldName, newName, justTheTemplate);
                } else {
                    // I guess it could also be an upvar ... (jens)
                    // perhaps we should show an error here?
                }
            }

        } else if (receiver.hasSpriteVariable(oldName)) {
            this.doRefactorSpriteVar(oldName, newName, justTheTemplate);
        } else {
            this.doRefactorGlobalVar(oldName, newName, justTheTemplate);
        }
    }
};

BlockMorph.prototype.varExistsError = function (ide, where) {ide.inform(localize(
'A variable with this name exists.'), localize('A variable with this name already exists '
) + (where || localize('in this context')) + '.');};

BlockMorph.prototype.doRefactorBlockParameter = function (
    oldName,
    newName,
    justTheTemplate
) {
    var fragMorph = this.parentThatIsA(BlockInputFragmentMorph),
        fragment = fragMorph.fragment.copy(),
        definer = fragMorph.parent,
        editor = this.parentThatIsA(BlockEditorMorph),
        scripts = editor.body.contents;

    if (definer.anyChild(any =>
            any.blockSpec === newName
    )) {
        this.varExistsError(editor.target.parentThatIsA(IDE_Morph));
        return;
    }

    fragment.labelString = newName;
    fragMorph.updateBlockLabel(fragment);

    if (justTheTemplate) {
        return;
    }

    scripts.children.forEach(script =>
        script.refactorVarInStack(oldName, newName)
    );
};

BlockMorph.prototype.doRefactorRingParameter = function (
    oldName, newName, justTheTemplate
)  {var ring = this.parentThatIsA(RingMorph),
        script = ring.contents(),
        tb = this.topBlock();

    if (contains(ring.inputNames(), newName)) {
        this.varExistsError(this.parentThatIsA(IDE_Morph));
        return;
    };  tb.fullChanged();
    this.setSpec(newName);

    if (justTheTemplate) {
        tb.fullChanged();
        return;
    };  if (script) {
        script.refactorVarInStack(oldName, newName);
    };  tb.fullChanged();};

BlockMorph.prototype.doRefactorScriptVar = function (
    oldName, newName, justTheTemplate
)  {var definer = this.parentThatIsA(
    CommandBlockMorph), receiver, ide;

    if (definer.definesScriptVariable(newName)) {
        receiver = this.scriptTarget();
        ide = receiver.parentThatIsA(IDE_Morph);
        this.varExistsError(ide);
        return;
    }

    this.userSetSpec(newName);

    if (justTheTemplate) {
        return;
    }

    definer.refactorVarInStack(oldName, newName, true);};

BlockMorph.prototype.doRefactorSpriteVar = function (
    oldName,
    newName,
    justTheTemplate
) {
    var receiver = this.scriptTarget(),
        ide = receiver.parentThatIsA(IDE_Morph),
        oldWatcher = receiver.findVariableWatcher(oldName),
        oldValue, newWatcher;

    if (receiver.hasSpriteVariable(newName)) {
        this.varExistsError(ide);
        return;
    } else if (!isNil(ide.globalVariables.vars[newName])) {
        this.varExistsError(ide, 'as a global variable');
        return;
    } else {
        oldValue = receiver.variables.getVar(oldName);
        receiver.deleteVariable(oldName);
        receiver.addVariable(newName, false);
        receiver.variables.setVar(newName, oldValue);

        if (oldWatcher && oldWatcher.isVisible) {
            newWatcher = receiver.toggleVariableWatcher(
                newName,
                false
            );
            newWatcher.setPosition(oldWatcher.position());
        };  if (!justTheTemplate) {
            receiver.refactorVariableInstances(
                oldName, newName, false
            );  receiver.customBlocks.forEach(eachBlock =>
                eachBlock.body.expression.refactorVarInStack(
                    oldName,
                    newName
                )
            );
        };
    };  ide.flushBlocksCache('variables');
    ide.refreshPalette();};

BlockMorph.prototype.doRefactorGlobalVar = function (
    oldName, newName, justTheTemplate
)  {var receiver = this.scriptTarget(),
        ide = receiver.parentThatIsA(IDE_Morph),
        stage = ide ? ide.stage : null,
        oldWatcher = receiver.findVariableWatcher(oldName),
        oldValue, newWatcher;

    if (!isNil(ide.globalVariables.vars[newName])) {
        this.varExistsError(ide);
        return;
    } else if (detect(
        stage.children,
        any => any instanceof SpriteMorph &&
            any.hasSpriteVariable(newName)
    )) {this.varExistsError(ide, 'as a sprite local variable');
        return;} else {
        oldValue = ide.globalVariables.getVar(oldName);
        stage.deleteVariable(oldName);
        stage.addVariable(newName, true);
        ide.globalVariables.setVar(newName, oldValue);

        if (oldWatcher && oldWatcher.isVisible) {
            newWatcher = receiver.toggleVariableWatcher(
                    newName,
                    true
                    );
            newWatcher.setPosition(oldWatcher.position());
        }

        if (!justTheTemplate) {
            stage.refactorVariableInstances(
                oldName, newName, true);
            stage.globalBlocks.forEach(eachBlock => {
                if (eachBlock.body) {
                    eachBlock.body.expression.refactorVarInStack(
                    oldName, newName);};});
            stage.forAllChildren(child => {
                if (child instanceof SpriteMorph) {
                    child.refactorVariableInstances(
                        oldName, newName, true);
                        child.customBlocks.forEach(eachBlock =>
                        eachBlock.body.expression.refactorVarInStack(
                            oldName, newName)
            );};});};};     ide.flushBlocksCache(
            'variables'); ide.refreshPalette();};

// BlockMorph thumbnail and script pic

BlockMorph.prototype.thumbnail = function (scale, clipWidth) {
    var nb = this.nextBlock(),
        fadeout = 12,
        ext,
        trgt,
        ctx,
        gradient;

    if (nb) {nb.isVisible = false; }
    ext = this.fullBounds().extent();
    trgt = newCanvas(new Point(
        clipWidth ? Math.min(
        ext.x * scale, clipWidth
        ) : ext.x * scale,
        ext.y * scale
    )); ctx = trgt.getContext(
    '2d'); ctx.scale(scale, scale);
    ctx.drawImage(this.fullImage(), 0,
    0); // draw fade-out
    if (clipWidth && ext.x * scale > clipWidth) {
        gradient = ctx.createLinearGradient(
            trgt.width / scale - fadeout,
            0,
            trgt.width / scale,
            0
        ); gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'black');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = gradient;
        ctx.fillRect(
            trgt.width / scale - fadeout,
            0,
            trgt.width / scale,
            trgt.height / scale
        );
    };  if (nb) {
    nb.isVisible = true;
    };  return trgt;};

BlockMorph.prototype.scriptPic = function () {
    // answer a canvas image that also includes comments
    var scr = this.fullImage(),
        fb = this.stackFullBounds(),
        pic = newCanvas(fb.extent()),
        ctx = pic.getContext('2d');

    this.allComments().forEach(comment =>
        ctx.drawImage(comment.fullImage(),
            comment.fullBounds().left() - fb.left(),
            comment.top() - fb.top())
    ); ctx.drawImage(scr, 0, 0); return pic;};

BlockMorph.prototype.fullImage = function () {
    // answer a canvas image meant for (semi-) transparent blocks
    // that lets the background shine through
    var src, solid, pic, ctx;

    if (this.alpha === 1) {
    return (BlockMorph.uber
    ).fullImage.call(this);
    }; this.forAllChildren(m => {
    if (m instanceof BlockMorph
    ) {m.mouseLeaveBounds();};}
    ); src = (BlockMorph.uber
    ).fullImage.call(this);
    solid = this.doWithAlpha(1,
    () => BlockMorph.uber.fullImage.call(this));
    pic = newCanvas((this.fullBounds()).extent());
    ctx = pic.getContext('2d');
    ctx.fillStyle = ScriptsMorph.prototype.getRenderColor().toString();
    ctx.fillRect(0, 0, pic.width, pic.height);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(solid, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(src, 0, 0); return pic;};

BlockMorph.prototype.clearAlpha = (
function () {this.forAllChildren(
m => {if (m instanceof BlockMorph
) {delete m.alpha;};});});

// BlockMorph drawing

BlockMorph.prototype.childChanged = function (
) {/* react to a change in one of my children,
default is to just pass this message on upwards
override this method for Morphs that need to
adjust accordingly */ if (this.parent) {
this.shouldRerender = true; (this
).parent.childChanged(this);};};

BlockMorph.prototype.render = function (ctx) {
if (this.shouldRerender) {(this.selectedImage
) = this.getBodyImage();}; if (!isNil((this
).selectedImage)) {ctx.drawImage((this
).selectedImage, 0, 0);};};

BlockMorph.prototype.backupRender = function (ctx) {
    this.cachedClr = this.color.toString();
    this.cachedClrBright = (((this.color).lighter(
    this.contrast)).withAlpha((1 + (MorphicPreferences
    ).isFlat) / 2)).toString(); this.cachedClrDark = (
    ((this.color).darker(this.contrast)).withAlpha((
    1 + (MorphicPreferences).isFlat) / 2)).toString();
    var slots = this.clearSlots(), pos = this.position();

    if (MorphicPreferences.isFlat) {
        // draw the outline
        ctx.fillStyle = this.cachedClrDark;
        ctx.beginPath(); this.outlinePath(
        ctx, 0); ctx.clip(); ctx.closePath();

        slots.forEach(slot => {if (slot.isVisible
        ) {slot.outlinePath(ctx, (slot.position()
        ).subtract(pos));};}); ctx.clip('evenodd'
        ); ctx.fill();

        // draw the inner filled shaped
        ctx.fillStyle = this.cachedClr;
        ctx.beginPath(); this.outlinePath(
        ctx, this.flatEdge); ctx.clip(
        ); ctx.closePath();

        slots.forEach(slot => {if (slot.isVisible
        ) {slot.outlinePath(ctx, (slot.position()
        ).subtract(pos));};}); ctx.clip('evenodd'
        ); ctx.fill();
    } else {
        // draw the flat shape
        var gradient = (ctx
        ).createLinearGradient(
        0, 0, 0, this.height());

        // Add three color stops
        gradient.addColorStop(0,
        (this.color).toString());
        gradient.addColorStop(1,
        ((this.color).darker(
        )).toString()); (ctx
        ).fillStyle = gradient;
        ctx.beginPath(); (this
        ).outlinePath(ctx, 0
        ); ctx.clip(); (ctx
        ).closePath();

        slots.forEach(slot => {if (slot.isVisible
        ) {slot.outlinePath(ctx, (slot.position()
        ).subtract(pos));};}); ctx.clip('evenodd'
        ); ctx.fill();

        // add 3D-Effect:
        this.drawEdges(ctx);
    };  // draw location pin icon if applicable
    if (this.hasLocationPin()) {
    this.drawMethodIcon(ctx);};
    // draw infinity / chain link icon if applicable
    if (this.isRuleHat()) {
        this.drawRuleIcon(ctx);
    };};

BlockMorph.prototype.drawMethodIcon = function (ctx) {
var ext = this.methodIconExtent(), w = ext.x, h = ext.y,
r = w / 2, x = this.edge + this.labelPadding, y = (((this
) instanceof CustomDefinitorBlockMorph) ? (this.hatHeight
) : this.edge), isNormal = (this.color === (SpriteMorph
).prototype.blockColorFor(this.category)); if ((this
).isPredicate || this.isArrow) {x = this.rounding;
    }; if (this instanceof CommandBlockMorph) {
        y += this.corner;
    }; ctx.fillStyle = (isNormal ? this.bright() : this.dark());
    // pin
    ctx.beginPath();
    ctx.arc(x + r, y + r, r, radians(-210), radians(30), false);
    ctx.lineTo(x + r, y + h);
    ctx.closePath();
    ctx.fill();
    // hole
    ctx.fillStyle = this.cachedClr;
    ctx.beginPath();
    ctx.arc(x + r, y + r, r * 2/5, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();};

BlockMorph.prototype.drawRuleIcon = function (ctx) {
    var h = this.hatHeight * 4/5,
        l = Math.max(h / 4, 1),
        r = h / 2,
        x = (this.hatWidth - h * 7/4) * 11/20,
        y = h / 2,
        isNormal =
            this.color === SpriteMorph.prototype.blockColorFor(this.category);
    ctx.lineWidth = l;
    // ctx.strokeStyle = color.toString();
    ctx.strokeStyle = (isNormal ? this.bright() : this.dark());
    // left arc
    ctx.beginPath();
    ctx.arc(x + r, y + r, r - l / 2, radians(60), radians(360), false);
    ctx.stroke();
    // right arc
    ctx.beginPath();
    ctx.arc(x + r * 3 - l, y + r, r - l / 2, radians(-120), radians(180), false);
    ctx.stroke();
};

BlockMorph.prototype.hasLocationPin = function () {return (((this
).isCustomBlock && !(this.isGlobal)) || this.isLocalVarTemplate);};

(BlockMorph.prototype.isRuleHat
) = function () {return false;};

// BlockMorph highlighting

BlockMorph.prototype.addHighlight = function (oldHighlight) {
    var isHidden = !this.isVisible, highlight;
    if (isHidden) {this.show();};
    if (SyntaxElementMorph.prototype.alpha < 1) {
        this.clearAlpha();
    }
    highlight = this.highlight(
        oldHighlight ? oldHighlight.color : this.activeHighlight,
        this.activeBlur,
        this.activeBorder
    );
    this.addBack(highlight);
    this.fullChanged(); if (
    isHidden) {this.hide();
    }; return highlight;};

BlockMorph.prototype.addErrorHighlight = function () {
    var isHidden = !this.isVisible,
        highlight;

    if (isHidden) {this.show();
    }; this.removeHighlight();
    highlight = this.highlight(
        this.errorHighlight,
        this.activeBlur,
        this.activeBorder
    );
    this.addBack(highlight);
    this.fullChanged();
    if (isHidden) {this.hide();};
    return highlight;};

BlockMorph.prototype.removeHighlight = function () {
    var highlight = this.getHighlight();
    if (highlight !== null) {
        this.fullChanged();
        this.removeChild(highlight);
    }
    return highlight;
};

BlockMorph.prototype.toggleHighlight = function () {
    if (this.getHighlight()) {
        this.removeHighlight();
    } else {
        this.addHighlight();
    }
};

BlockMorph.prototype.highlight = function (color, blur, border) {
    var highlight = new BlockHighlightMorph,
        fb = this.fullBounds(),
        edge = useBlurredShadows && !MorphicPreferences.isFlat ?
                blur : border;
    highlight.bounds.setExtent(fb.extent().add(edge * 2));
    highlight.holes = [highlight.bounds]; // make the highlight untouchable
    highlight.color = color;
    highlight.cachedImage = useBlurredShadows && !MorphicPreferences.isFlat ?
            this.highlightImageBlurred(color, blur)
                : this.highlightImage(color, border);
    highlight.setPosition(fb.origin.subtract(new Point(edge, edge)));
    return highlight;
};

BlockMorph.prototype.highlightImage = function (color, border) {
    var fb, img, hi, ctx, out,
    fb = this.fullBounds().extent();
    this.doWithAlpha(1, () => img = this.fullImage());

    hi = newCanvas(fb.add(border * 2));
    ctx = hi.getContext('2d');

    ctx.drawImage(img, 0, 0);
    ctx.drawImage(img, border * 2, 0);
    ctx.drawImage(img, border * 2, border);
    ctx.drawImage(img, border * 2, border * 2);
    ctx.drawImage(img, border, border * 2);
    ctx.drawImage(img, 0, border * 2);
    ctx.drawImage(img, 0, border);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(img, border, border);

    out = newCanvas(fb.add(border * 2));
    ctx = out.getContext('2d');
    ctx.drawImage(hi, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = color.toString();
    ctx.fillRect(0, 0, out.width, out.height);

    return out;
};

BlockMorph.prototype.highlightImageBlurred = function (color, blur) {
    var fb, img, hi, ctx;
    fb = this.fullBounds().extent();
    this.doWithAlpha(1, () => img = this.fullImage());

    hi = newCanvas(fb.add(blur * 2));
    ctx = hi.getContext('2d');
    ctx.shadowBlur = blur;
    ctx.shadowColor = color.toString();
    ctx.drawImage(img, blur, blur);

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(img, blur, blur);
    return hi;
};

BlockMorph.prototype.getHighlight = function () {
    var highlights;
    highlights = this.children.slice(0).reverse().filter(child =>
        child instanceof BlockHighlightMorph
    );
    if (highlights.length !== 0) {
        return highlights[0];
    }
    return null;
};

BlockMorph.prototype.outline = function (color, border) {
    var highlight = new BlockHighlightMorph(),
        fb = this.fullBounds(),
        edge = border;
    highlight.bounds.setExtent(fb.extent().add(edge * 2));
    highlight.color = color;
    highlight.cachedImage = this.highlightImage(color, border);
    highlight.setPosition(fb.origin.subtract(new Point(edge, edge)));
    return highlight;
};

// BlockMorph zebra coloring

BlockMorph.prototype.fixBlockColor = function (nearestBlock, isForced) {
    if (this.parent instanceof BlockSlotMorph) {
    this.parent.fixLayout(); clr = this.parent.color;
    if (this.color.eq(clr)) {this.alternateBlockColor(); return;};};
    var nearest = nearestBlock,
        clr,
        cslot;

    if (!this.zebraContrast && !isForced) {
        return;
    }
    if (!this.zebraContrast && isForced) {
        return this.forceNormalColoring(true);
    }

    if (!nearest) {
        if (this.parent) {
            if (this.isPrototype) {
                nearest = null; // this.parent; // the PrototypeHatBlockMorph
            } else if (this instanceof ReporterBlockMorph) {
                nearest = this.parent.parentThatIsA(BlockMorph);
            } else { // command
                cslot = this.parentThatIsA(CommandSlotMorph, ReporterSlotMorph);
                if (cslot) {
                    nearest = cslot.parentThatIsA(BlockMorph);
                }
            }
        }
    }
    if (!nearest) { // top block
        clr = SpriteMorph.prototype.blockColorFor(this.category);
        if (!this.color.eq(clr)) {
            this.alternateBlockColor();
        }
    } else if (nearest.category === this.category) {
        if (nearest.color.eq(this.color)) {
            this.alternateBlockColor();
        }
    } else if (this.category && !this.color.eq(
            SpriteMorph.prototype.blockColorFor(this.category)
        )) {
        this.alternateBlockColor();
    }
    if (isForced) {
        this.fixChildrensBlockColor(true);
    }; this.children.filter(child => (child instanceof StringSyntaxMorph
    )).forEach(child => child.fixLayout());
};

BlockMorph.prototype.forceNormalColoring = function () {
    if (this.category === 'random') {clr = this.color;} else {
    var clr = SpriteMorph.prototype.blockColorFor(this.category);
    this.setColor(clr);};
    this.setLabelColor(
        WHITE,
        clr.darker(this.labelContrast),
        MorphicPreferences.isFlat ? ZERO : this.embossing
    );
    this.fixChildrensBlockColor(true);
    this.children.filter(child => (child instanceof StringSyntaxMorph
    )).forEach(child => child.fixLayout());
};

BlockMorph.prototype.alternateBlockColor = function () {
    if (!(this.category === 'random')) {
    var clr = SpriteMorph.prototype.blockColorFor(this.category);
    if (this.color.eq(clr)) {
        this.setColor(
            this.zebraContrast < 0 ? clr.darker(Math.abs(this.zebraContrast))
                : clr.lighter(this.zebraContrast),
            this.hasLabels() // silently
        );
    } else {
        this.setColor(clr, this.hasLabels()); // silently
    };};
    this.fixLabelColor();
    this.fixChildrensBlockColor(true); // has issues if not forced
    this.children.filter(child => (child instanceof StringSyntaxMorph
    )).forEach(child => child.fixLayout());
};

BlockMorph.prototype.ghost = function () {
    this.setColor(
        SpriteMorph.prototype.blockColorFor(this.category).lighter(35)
    ); this.children.filter(child => (child instanceof StringSyntaxMorph
    )).forEach(child => child.fixLayout());
};

BlockMorph.prototype.fixLabelColor = function () {
    if ((this.zebraContrast > 0) && this.category) {
        var clr = SpriteMorph.prototype.blockColorFor(this.category);
        if (this.color.eq(clr)) {
        var selectedColor = WHITE;
            this.setLabelColor(
                selectedColor,
                clr.darker(this.labelContrast),
                MorphicPreferences.isFlat ? null : this.embossing
            );
        } else {
        var selectedColor = BLACK;
            this.setLabelColor(
                selectedColor,
                clr.lighter(this.zebraContrast)
                    .lighter(this.labelContrast * 2),
                MorphicPreferences.isFlat ? null : this.embossing.neg()
            );
        };
    }; this.children.filter(child => (child instanceof StringSyntaxMorph
    )).forEach(child => child.fixLayout(selectedColor));
};

BlockMorph.prototype.fixChildrensBlockColor = function (isForced) {
    this.children.forEach(morph => {
        if (morph instanceof CommandBlockMorph) {
            morph.fixBlockColor(null, isForced);
        } else if (morph instanceof SyntaxElementMorph) {
            morph.fixBlockColor(this, isForced);
            if (morph instanceof BooleanSlotMorph) {
                morph.fixLayout();
            }
        }
    }); this.children.filter(child => (child instanceof StringSyntaxMorph
    )).forEach(child => child.fixLayout());
};

BlockMorph.prototype.setCategory = function (aString) {
    this.category = aString;
    this.fixBlockColor();
};

BlockMorph.prototype.hasLabels = function () {
    return this.children.some(any => any instanceof StringMorph);
};

// BlockMorph copying

BlockMorph.prototype.fullCopy = function () {
    var ans = BlockMorph.uber.fullCopy.call(this);
    ans.removeHighlight();
    ans.isDraggable = true;
    if (this.instantiationSpec) {
        ans.setSpec(this.instantiationSpec);
    }
    ans.allChildren().filter(block => {
        if (block instanceof SyntaxElementMorph) {
            block.cachedInputs = null;
            if (block.isCustomBlock) {
                block.initializeVariables();
            }
        }
        return !isNil(block.comment);
    }).forEach(block => {
        var cmnt = block.comment.fullCopy();
        block.comment = cmnt;
        cmnt.block = block;
    });
    ans.cachedInputs = null;
    return ans;
};

BlockMorph.prototype.reactToTemplateCopy = function () {
    if (this.isLocalVarTemplate) {
    	this.isLocalVarTemplate = null;
        this.fixLayout();
    }
    this.forceNormalColoring();
};

BlockMorph.prototype.hasBlockVars = function () {
    return this.anyChild(any =>
        any.isCustomBlock &&
            any.isGlobal &&
                any.definition.variableNames.length
    );
};

BlockMorph.prototype.pickUp = function (wrrld) {
    // used when duplicating and grabbing a block via its context menu
    // position the duplicate's top-left corner at the mouse pointer
    var wrrld = wrrld || world; this.setPosition((wrrld.hand.position(
    )).subtract(this.rounding)); wrrld.hand.grab(this);};

// BlockMorph events

BlockMorph.prototype.mouseClickLeft = function () {
var top = this.topBlock(), receiver = top.scriptTarget(
), shiftClicked = world.currentKey === 16, stage;
if (shiftClicked && !(this.isTemplate)) {return (
this.selectForEdit()).focus();}; if ((top
) instanceof PrototypeHatBlockMorph) {
return;}; if (receiver) {stage = (
receiver.parentThatIsA(StageMorph
)); if (stage) {(stage.threads
).toggleProcess(top, receiver);};};};

BlockMorph.prototype.focus = function () {
    var scripts = this.parentThatIsA(
        ScriptsMorph), focus;
    if (!scripts || !ScriptsMorph.prototype.enableKeyboard) {return; }
    if (scripts.focus) {scripts.focus.stopEditing(); }
    world.stopEditing();
    focus = new ScriptFocusMorph(scripts, this);
    scripts.focus = focus;
    focus.getFocus(world);
    if (this instanceof HatBlockMorph) {
        focus.nextCommand();
    }
};

BlockMorph.prototype.activeProcess = function () {
    var top = this.topBlock(),
        receiver = top.scriptTarget(),
        stage;
    if (top instanceof PrototypeHatBlockMorph) {
        return null;
    }
    if (receiver) {
        stage = receiver.parentThatIsA(StageMorph);
        if (stage) {
            return stage.threads.findProcess(top, receiver);
        }
    }
    return null;
};

BlockMorph.prototype.mouseEnterBounds = function (dragged) {
    if (!dragged && this.alpha < 1) {
        this.alpha = Math.min(this.alpha + 1/5, 1);
        this.rerender();
    };
};

BlockMorph.prototype.mouseLeaveBounds = function (dragged) {
    if (SyntaxElementMorph.prototype.alpha < 1) {
        delete this.alpha;
        this.rerender();
    };
};

// BlockMorph dragging and dropping

BlockMorph.prototype.rootForGrab = function () {return this;};

/*
    for demo purposes, allows you to drop arg morphs onto
    blocks and forces a layout update. This section has
    no relevance in end user mode.
*/

BlockMorph.prototype.wantsDropOf = function (aMorph) {
    // override the inherited method
    return (aMorph instanceof ArgMorph
        || aMorph instanceof StringMorph
        || aMorph instanceof TextMorph
    ) && !this.isTemplate;
};

BlockMorph.prototype.reactToDropOf = function (droppedMorph) {
    droppedMorph.isDraggable = false;
    droppedMorph.fixLayout();
    this.fixLayout();
    this.buildSpec();
};

BlockMorph.prototype.situation = function () {
    // answer a dictionary specifying where I am right now, so
    // I can slide back to it if I'm dropped somewhere else
    // NOTE: We can also add more key-value pairs to the situation
    // dictionary to support non-standard modes of user-interaction,
    // such as extracting single commands from within a stack
    // see recordDrop() and userExtractJustThis()
    if (!(this.parent instanceof TemplateSlotMorph)) {
        var scripts = this.parentThatIsA(ScriptsMorph);
        if (scripts) {
            return {
                origin: scripts,
                position: this.position().subtract(scripts.position())
            };
        }
    }
    return BlockMorph.uber.situation.call(this);
};

// BlockMorph sticky comments

BlockMorph.prototype.prepareToBeGrabbed = function (hand) {
    var wrld = hand ? hand.world : world;
    this.allInputs().forEach(input =>
        delete input.bindingID
    );
    this.allComments().forEach(comment =>
        comment.startFollowing(this, wrld)
    );
};

BlockMorph.prototype.justDropped = function () {
delete this.alpha; (this.allComments()).forEach(
comment => comment.stopFollowing()); (this
).fixBlockColor(); this.fixLayout(); (this
).rerender(); this.forAllChildren(child => {
if (child instanceof CSlotMorph) {(child
).fixLayout();}; child.rerender();});};

BlockMorph.prototype.allComments = function () {
    return this.allChildren().filter(block =>
        !isNil(block.comment)
    ).map(block =>
        block.comment
    );
};

BlockMorph.prototype.destroy = function (justThis) {
    // private - use IDE_Morph.removeBlock() to first stop all my processes
    if (justThis) {
        if (!isNil(this.comment)) {
            this.comment.destroy();
        }
    } else {
        this.allComments().forEach(comment =>
            comment.destroy()
        );
    }
    BlockMorph.uber.destroy.call(this);
};

BlockMorph.prototype.stackHeight = function () {
    var fb = this.fullBounds(),
        commentsBottom = Math.max(this.allComments().map(comment =>
            comment.bottom()
        )) || this.bottom();
    return Math.max(fb.bottom(), commentsBottom) - fb.top();
};

BlockMorph.prototype.stackFullBounds = function () {
    var fb = this.fullBounds();
    this.allComments().forEach(comment =>
        fb.mergeWith(comment.bounds)
    );
    return fb;
};

BlockMorph.prototype.stackWidth = function () {
    var fb = this.fullBounds(),
        commentsRight = Math.max(this.allComments().map(comment =>
            comment.right()
        )) || this.right();
    return Math.max(fb.right(), commentsRight) - fb.left();
};

BlockMorph.prototype.snap = function () {
    var top = this.topBlock(),
        receiver,
        stage,
        ide;
    top.allComments().forEach(comment =>
        comment.align(top)
    );
    // fix highlights, if any
    if (this.getHighlight() && (this !== top)) {
        this.removeHighlight();
    };
    if (top.getHighlight()) {
        top.addHighlight(top.removeHighlight());
    };
    // register generic hat blocks
    if ((this instanceof CustomDefinitorBlockMorph
    ) || (this.selector === 'receiveCondition')) {
        receiver = top.scriptTarget();
        if (receiver) {
            stage = receiver.parentThatIsA(StageMorph);
            if (stage) {
                stage.enableCustomHatBlocks = true;
                stage.threads.pauseCustomHatBlocks = false;
                ide = stage.parentThatIsA(IDE_Morph);
                if (ide) {
                    ide.controlBar.stopButton.refresh();
                };};};};};

// CommandBlockMorph ///////////////////////////////////////////////////

/*
    I am a stackable jigsaw-shaped block.

    I inherit from BlockMorph adding the following most important
    public accessors:

        nextBlock()       - set / get the block attached to my bottom
        bottomBlock()     - answer the bottom block of my stack
        blockSequence()   - answer an array of blocks starting with myself

    and the following "lexical awareness" indicators:

        partOfCustomCommand - temporary bool set by the evaluator
        exitTag           - temporary string or number set by the evaluator
*/

// CommandBlockMorph inherits from BlockMorph:

CommandBlockMorph.prototype = new BlockMorph;
CommandBlockMorph.prototype.constructor = CommandBlockMorph;
CommandBlockMorph.uber = BlockMorph.prototype;

// CommandBlockMorph instance creation:

function CommandBlockMorph () {this.init();};

CommandBlockMorph.prototype.init = function () {
    CommandBlockMorph.uber.init.call(this);

    this.bounds.setExtent(new Point(60, 24).multiplyBy(this.scale));
    this.fixLayout();
    this.rerender();

    this.partOfCustomCommand = false;
    this.exitTag = null;
};

// CommandBlockMorph enumerating:

CommandBlockMorph.prototype.metaSequence = function () {
var sequence = [this], nb = this.nextBlock(); while (nb) {
sequence.push(nb); nb = nb.nextBlock();}; return sequence;};

CommandBlockMorph.prototype.blockSequence = CommandBlockMorph.prototype.metaSequence;

CommandBlockMorph.prototype.bottomBlock = function () {if ((this
).nextBlock()) {return this.nextBlock().bottomBlock();}; return this;};

CommandBlockMorph.prototype.nextBlock = function (block) {
    if (block) {
        var nb = this.nextBlock(),
            affected = this.parentThatIsA(CommandSlotMorph, ReporterSlotMorph);
        this.add(block);
        if (nb) {
            block.bottomBlock().nextBlock(nb);
        };  block.setPosition(
            new Point(
                this.left(),
                this.bottom() - (this.corner)
            )
        );  if (affected) {
            affected.fixLayout();
        };
    } else {
        return detect(
            this.children,
            child => child instanceof CommandBlockMorph && !child.isPrototype
        );
};};

// CommandBlockMorph attach targets:

CommandBlockMorph.prototype.topAttachPoint = function () {
    return new Point(
        this.dentCenter(),
        this.top()
    );
};

CommandBlockMorph.prototype.bottomAttachPoint = function () {
    return new Point(
        this.dentCenter(),
        this.bottom()
    );
};

CommandBlockMorph.prototype.wrapAttachPoint = function () {
    var cslot = detect( // could be a method making uses of caching...
        this.inputs(), // ... although these already are cached
        each => each instanceof CSlotMorph
    );
    if (cslot && !cslot.nestedBlock()) {
        return new Point(
            cslot.left() + (cslot.inset * 2) + cslot.corner,
            cslot.top() + (cslot.corner * 2)
        );
    }
    return null;
};

CommandBlockMorph.prototype.dentLeft = function () {
    return this.left()
        + this.corner
        + this.inset;
};

CommandBlockMorph.prototype.dentCenter = function () {
    return this.dentLeft()
        + this.corner
        + (this.dent / 2);
};

CommandBlockMorph.prototype.attachTargets = function () {
    var answer = [],
        tp = this.topAttachPoint();
        if (!this.parentThatIsA(CommandSlotMorph)) {
            answer.push({
                point: tp,
                element: this,
                loc: 'wrap',
                type: 'block'
            });
        }
    if (!((this instanceof HatBlockMorph) || (this instanceof DefinitorBlockMorph))) {
        if (!(this.parent instanceof SyntaxElementMorph)) {
            answer.push({
                point: tp,
                element: this,
                loc: 'top',
                type: 'block'
            });
        };
    }
    if (!this.isStop()) {
        answer.push({
            point: this.bottomAttachPoint(),
            element: this,
            loc: 'bottom',
            type: 'block'
        });
    }
    return answer;
};

CommandBlockMorph.prototype.allAttachTargets = function (newParent) {
    var target = newParent || this.parent,
        answer = [],
        topBlocks;

    if (((this instanceof HatBlockMorph) || (this instanceof DefinitorBlockMorph)) && newParent.rejectsHats) {
        return answer;
    }
    topBlocks = target.children.filter(child =>
        (child !== this) &&
            child instanceof SyntaxElementMorph &&
                !child.isTemplate
    );
    topBlocks.forEach(block =>
        block.forAllChildren(child => {
            if (child.attachTargets) {
                child.attachTargets().forEach(at =>
                    answer.push(at)
                );
            }
        })
    );
    return answer;
};

CommandBlockMorph.prototype.closestAttachTarget = function (newParent) {
    var target = newParent || this.parent,
        bottomBlock = this.bottomBlock(),
        answer = null,
        thresh = Math.max(
            this.corner * 2 + this.dent,
            this.minSnapDistance
        ), dist, wrap, ref = [],
        minDist = 1000;
    if (!((this instanceof HatBlockMorph) || (this instanceof DefinitorBlockMorph))) {
        ref.push(
            {
                point: this.topAttachPoint(),
                loc: 'top'
            }
        );
        wrap = this.wrapAttachPoint();
        if (wrap) {
            ref.push(
                {
                    point: wrap,
                    loc: 'wrap'
                }
            );
        }
    }
    if (!bottomBlock.isStop()) {
        ref.push(
            {
                point: bottomBlock.bottomAttachPoint(),
                loc: 'bottom'
            }
        );
    }
    this.allAttachTargets(target).forEach(eachTarget =>
        ref.forEach(eachRef => {
            // match: either both locs are 'wrap' or both are different,
            // none being 'wrap' (can this be expressed any better?)
            if ((eachRef.loc === 'wrap' && (eachTarget.loc === 'wrap')) ||
                ((eachRef.loc !== eachTarget.loc) &&
                    (eachRef.loc !== 'wrap') && (eachTarget.loc !== 'wrap'))
            ) {
                dist = eachRef.point.distanceTo(eachTarget.point);
                if ((dist < thresh) && (dist < minDist)) {
                    minDist = dist;
                    answer = eachTarget;
                }
            }
        })
    );
    return answer;
};

CommandBlockMorph.prototype.snap = function (hand) {
    var target = this.closestAttachTarget(),
        scripts = this.parentThatIsA(ScriptsMorph),
        before,
        next,
        offsetY,
        cslot,
        affected;

    scripts.clearDropInfo();
    scripts.lastDroppedBlock = this;
    if (target === null) {
        this.fixBlockColor();
        CommandBlockMorph.uber.snap.call(this); // align stuck comments
        if (hand) {
            scripts.recordDrop(hand.grabOrigin);
        }
        return;
    }

    scripts.lastDropTarget = target;

    if (target.loc === 'bottom') {
        if (target.type === 'slot') {
            this.removeHighlight();
            scripts.lastNextBlock = target.element.nestedBlock();
            target.element.nestedBlock(this);
        } else {
            scripts.lastNextBlock = target.element.nextBlock();
            target.element.nextBlock(this);
        }
        if (this.isStop()) {
            next = this.nextBlock();
            if (next) {
                scripts.add(next);
                next.moveBy(this.extent().divideBy(2));
                affected = this.parentThatIsA(
                    CommandSlotMorph,
                    ReporterSlotMorph
                );
                if (affected) {
                    affected.fixLayout();
                }
            }
        }
    } else if (target.loc === 'top') {
        target.element.removeHighlight();
        offsetY = this.bottomBlock().bottom() - this.bottom();
        this.setBottom(target.element.top() + this.corner - offsetY);
        this.setLeft(target.element.left());
        this.bottomBlock().nextBlock(target.element);
    } else if (target.loc === 'wrap') {
        cslot = detect( // this should be a method making use of caching
            this.inputs(), // these are already cached, so maybe it's okay
            each => each instanceof CSlotMorph
        );  // assume the cslot is (still) empty, was checked determining the target
        before = (target.element.parent);
        scripts.lastWrapParent = before;

        // adjust position of wrapping block
        this.moveBy(target.point.subtract(cslot.slotAttachPoint()));

        // wrap c-slot around target
        cslot.nestedBlock(target.element);
        if (before instanceof CommandBlockMorph) {
            before.nextBlock(this);
        } else if (before instanceof CommandSlotMorph) {
            before.nestedBlock(this);
        } else if (before instanceof RingReporterSlotMorph) {
            before.add(this);
            before.fixLayout();
        }

        // fix zebra coloring.
        // this could probably be generalized into the fixBlockColor mechanism
        target.element.metaSequence().forEach(cmd =>
            cmd.fixBlockColor()
        );
    };
    this.fixBlockColor();
    CommandBlockMorph.uber.snap.call(this); // align stuck comments
    if (hand) {
        scripts.recordDrop(hand.grabOrigin);
    };  if (this.snapSound) {
        this.snapSound.play();
    };  if (target.element instanceof Morph) {
    target.element.parentThatIsA(BlockMorph).fixLayout();
    target.element.parentThatIsA(BlockMorph).rerender();
    target.element.parentThatIsA(BlockMorph).forAllChildren(
    child => {if (child instanceof CSlotMorph) {
    child.fixLayout();}; child.rerender();});};};

CommandBlockMorph.prototype.prepareToBeGrabbed = function (handMorph) {
    // check whether the shift-key is held down and if I can be "extracted"
    if (handMorph && handMorph.world.currentKey === 16 && this.nextBlock()) {
        this.extract(); // NOTE: no infinite recursion, because extract()
                        // doesn't call this again with a hand
        handMorph.grabOrigin.action = 'extract'; // ???
        return;
    }

    var oldPos = this.position(), oldParent = this.parent;

    if (this.parent instanceof RingReporterSlotMorph) {
        this.parent.revertToDefaultInput(this);
        this.setPosition(oldPos);
    };

    CommandBlockMorph.uber.prepareToBeGrabbed.call(this, handMorph);

    if (oldParent instanceof CommandSlotMorph) {
    oldParent.parentThatIsA(BlockMorph).fixLayout();
    oldParent.parentThatIsA(BlockMorph).rerender();
    oldParent.parentThatIsA(BlockMorph).forAllChildren(
    child => {if (child instanceof CSlotMorph) {
    child.fixLayout();}; child.rerender();});};};

CommandBlockMorph.prototype.isStop = function () {if (this.isCustomBlock) {return (
(this.definition instanceof CustomBlockDefinition) ? this.definition.isCap : false);
} else {if (this.selector === 'doStopThis') {var choice = this.inputs()[0].evaluate(
); return (['this scene', 'this sprite', 'this script', 'this block', 'all scenes',
'this scene and restart'].indexOf((choice instanceof Array) && choice[0]) > -1);
} else {return contains(['doForever', 'doReport', 'removeClone', 'doSwitchToScene',
'launchError', 'runScript', 'throw', 'jsReturnThrow', 'jsBreakContinue'], this.selector);};};};

// CommandBlockMorph deleting

CommandBlockMorph.prototype.userDestroy = function () {
    var target = this.selectForEdit(); // enable copy-on-edit
    if (target !== this) {
        return this.userDestroy.call(target);
    }
    if (this.nextBlock()) {
        this.userDestroyJustThis();
        return;
    }

    var scripts = this.parentThatIsA(ScriptsMorph),
        ide = this.parentThatIsA(IDE_Morph),
        parent = this.parentThatIsA(SyntaxElementMorph),
        cslot = this.parentThatIsA(CSlotMorph);

    // for undrop / redrop
    if (scripts) {
        scripts.clearDropInfo();
        scripts.lastDroppedBlock = this;
        scripts.recordDrop(this.situation());
        scripts.dropRecord.action = 'delete';
    }

    this.prepareToBeGrabbed(); // fix outer ring reporter slot

    if (ide) {
        // also stop all active processes hatted by this block
        ide.removeBlock(this);
    } else {
        this.destroy();
    }
    if (cslot) {
        cslot.fixLayout();
    }
    if (parent) {
        parent.reactToGrabOf(this); // fix highlight
    }
};

CommandBlockMorph.prototype.userDestroyJustThis = function () {
    // delete just this one block, reattach next block to the previous one,
    var scripts = this.parentThatIsA(ScriptsMorph),
        nb = this.nextBlock();

    // for undrop / redrop
    if (scripts) {
        scripts.clearDropInfo();
        scripts.lastDroppedBlock = this;
        scripts.recordDrop(this.situation());
        scripts.dropRecord.lastNextBlock = nb;
        scripts.dropRecord.action = 'delete';
    }

    this.extract();
};

CommandBlockMorph.prototype.userExtractJustThis = function () {
    // extract just this one block, reattach next block to the previous one,
    var situation = this.situation();
    situation.action = "extract"; // record how this block was retrieved
    this.extract();
    this.pickUp(situation.origin.world());
    this.parent.grabOrigin = situation;
};

CommandBlockMorph.prototype.extract = function () {
    // private: extract just this one block
    // reattach next block to the previous one,
    var scripts = this.parentThatIsA(ScriptsMorph),
        ide = this.parentThatIsA(IDE_Morph),
        cs = this.parentThatIsA(CommandSlotMorph, RingReporterSlotMorph),
        pb,
        nb = this.nextBlock(),
        above,
        parent = this.parentThatIsA(SyntaxElementMorph),
        cslot = this.parentThatIsA(CSlotMorph, RingReporterSlotMorph);

    this.topBlock().fullChanged();
    if (this.parent) {
        pb = this.parent.parentThatIsA(CommandBlockMorph);
    }
    if (pb && (pb.nextBlock() === this)) {
        above = pb;
    } else if (cs && (cs.nestedBlock() === this)) {
        above = cs;
        this.prepareToBeGrabbed(); // restore ring reporter slot, if any
    }
    if (ide) {
        // also stop all active processes hatted by this block
        ide.removeBlock(this, true); // just this block
    } else {
        this.destroy(true); // just this block
    }
    if (nb) {
        if (above instanceof CommandSlotMorph ||
            above instanceof RingReporterSlotMorph
        ) {
            above.nestedBlock(nb);
        } else if (above instanceof CommandBlockMorph) {
            above.nextBlock(nb);
        } else {
            scripts.add(nb);
        }
    } else if (cslot) {
        cslot.fixLayout();
    }
    if (parent) {
        parent.reactToGrabOf(this); // fix highlight
    }
};

// CommandBlockMorph drawing:

CommandBlockMorph.prototype.outlinePath = function(ctx, inset) {
    var indent = this.corner * 2 + this.inset,
        bottom = this.height() - this.corner,
        bottomCorner = this.height() - this.corner * 2,
        radius = Math.max(this.corner - inset, 0),
        pos = this.position();

    // top left:
    ctx.arc(
        this.corner,
        this.corner,
        radius,
        radians(-180),
        radians(-90),
        false
    );

    // top dent:
    ctx.lineTo(this.corner + this.inset, inset
    ); ctx.lineTo(indent, this.corner + inset);
    ctx.lineTo(indent + this.dent, this.corner + inset);
    ctx.lineTo(this.corner * 3 + this.inset + this.dent,
    inset); ctx.lineTo(this.width() - this.corner, inset);

    // top right:
    ctx.arc(
        this.width() - this.corner,
        this.corner,
        radius,
        radians(-90),
        radians(-0),
        false
    );

    // C-Slots
    this.cSlots().forEach(slot => {
        slot.outlinePath(ctx, inset, slot.position().subtract(pos));
    });

    // bottom right:
    ctx.arc(
        this.width() - this.corner,
        bottomCorner,
        radius,
        radians(0),
        radians(90),
        false
    );

    if (!this.isStop()) {
        ctx.lineTo(this.width() - this.corner, bottom - inset);
        ctx.lineTo(this.corner * 3 + this.inset + this.dent, bottom - inset);
        ctx.lineTo(indent + this.dent, bottom + this.corner - inset);
        ctx.lineTo(indent, bottom + this.corner - inset);
        ctx.lineTo(this.corner + this.inset, bottom - inset);
    };

    // bottom left:
    ctx.arc(
        this.corner,
        bottomCorner,
        radius,
        radians(90),
        radians(180),
        false
    );
};

CommandBlockMorph.prototype.drawEdges = function (
    ctx) {var shift = this.edge * 1/2, x = 0, y = 0,
    indent = x + this.corner * 2 + this.inset,
    top = this.top(), lgx = (x + this.corner
    ) + this.inset, cslots = this.cSlots();

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';

    ctx.strokeStyle = this.cachedClrBright; ctx.beginPath();
    ctx.moveTo(shift, this.height() - this.corner * 2 - shift
    );  ctx.lineTo(shift, this.corner);
    ctx.arc(
        this.corner,
        this.corner,
        this.corner - shift,
        radians(-180),
        radians(-90),
        false
    );  ctx.lineTo(this.corner + this.inset, shift);
    ctx.lineTo(indent, y + this.corner + shift);  ctx.lineTo(
    indent + this.dent, y + this.corner + shift); ctx.moveTo(
        x + this.corner * 3 + this.inset + this.dent + shift,
        y + shift
    );  ctx.lineTo(this.width() - this.corner,
    shift); ctx.stroke(); x = this.width();

    ctx.strokeStyle = this.cachedClrDark;
        ctx.beginPath(); ctx.moveTo((x
        ) - shift, this.corner + shift);
    if (cslots.length > 0) {
        ctx.beginPath();
        ctx.moveTo(x - shift, (this.corner
        ) + shift);  cslots.forEach(
            slot => {y = slot.top(
            ) - top; ctx.lineTo((
            x - shift), y); (ctx
            ).stroke(); ctx.beginPath(
            ); ctx.moveTo(x - shift,
            y + slot.height());});
    };  y = this.height() - this.corner;
        ctx.arc(this.width() - this.corner,
        this.height() - this.corner * 2,
        this.corner - shift, 0, Math.PI / 2
    );  if (!(this.isStop())) {ctx.lineTo(
        this.corner * 3 + this.inset + this.dent,
        y - shift);  ctx.lineTo(indent + this.dent,
    y + this.corner - shift); ctx.lineTo(
    indent + shift, y + this.corner - shift);
    ctx.stroke();  ctx.beginPath();  ctx.moveTo(
    this.corner + this.inset - shift,  y - shift
    );}; ctx.lineTo(this.corner, y - shift); ctx.stroke();};

    CommandBlockMorph.prototype.userCut = function() {

        window.blockCopy = this.fullCopy()
        var nb = window.blockCopy.nextBlock()
        if (nb) {nb.destroy();
        };  var target = this.selectForEdit();
        if (target !== this) {
            return this.userDestroy.call(target);
        };  if (this.nextBlock()) {
            this.userDestroyJustThis();
            return;
        };  var scripts = this.parentThatIsA(ScriptsMorph
            ),  ide = this.parentThatIsA(IDE_Morph),
            parent = this.parentThatIsA(SyntaxElementMorph),
            cslot = this.parentThatIsA(CSlotMorph);

        // for undrop / redrop
        if (scripts) {
            scripts.clearDropInfo();
            scripts.lastDroppedBlock = this;
            scripts.recordDrop(this.situation());
            scripts.dropRecord.action = 'delete';
        };  this.prepareToBeGrabbed();

        if (ide) {
            // also stop all active processes hatted by this block
            ide.removeBlock(this);
        } else {
            this.destroy();
        };  if (cslot) {
            cslot.fixLayout();
        };  if (parent) {
            parent.reactToGrabOf(this); // fix highlight
        };
    };

// HatBlockMorph ///////////////////////////////////////////////////////

/*
    I am a script's top most block. I can attach command blocks at my
    bottom, but not on top.

*/

// HatBlockMorph inherits from CommandBlockMorph:

HatBlockMorph.prototype = new CommandBlockMorph;
HatBlockMorph.prototype.constructor = HatBlockMorph;
HatBlockMorph.uber = CommandBlockMorph.prototype;

// HatBlockMorph instance creation:

function HatBlockMorph (isPrototypeLike) {this.init(isPrototypeLike);};

HatBlockMorph.prototype.init = function (isPrototypeLike) {HatBlockMorph.uber.init.call(this);
if (asABool(isPrototypeLike)) {this.category = 'custom'; this.setSpec(localize('define').concat(
' %s')); this.fixBlockColor();}; this.bounds.setExtent(new Point(120, 36).multiplyBy(this.scale
)); this.isPrototypeLike = asABool(isPrototypeLike); this.fixLayout(); this.rerender();};

// HatBlockMorph enumerating:

HatBlockMorph.prototype.blockSequence = function () {if (this.selector === 'receiveCondition') {return (
this);} else {var result = HatBlockMorph.uber.blockSequence.call(this); result.shift(); return result;};};

HatBlockMorph.prototype.isRuleHat = function () {
return (this.selector === 'receiveCondition');};

// HatBlockMorph drawing:

HatBlockMorph.prototype.outlinePath = function (ctx, inset) {
if (this.isPrototypeLike) {((PrototypeHatBlockMorph.prototype
).outlinePath).call(this, ctx, inset);} else {
    var indent = this.corner * 2 + this.inset,
        bottom = this.height() - this.corner,
        bottomCorner = this.height() - this.corner * 2,
        radius = Math.max(this.corner - inset, 0),
        s = this.hatWidth,
        h = this.hatHeight,
        r = ((4 * h * h) + (s * s)) / (8 * h),
        a = degrees(4 * Math.atan(2 * h / s)),
        sa = a / 2,
        sp = Math.min(s * 17/10, this.width() - this.corner),
        pos = this.position();

    // top left:
    ctx.moveTo(inset, h + this.corner);
    ctx.arc(
        s / 2,
        r,
        r,
        radians(-sa - 90),
        radians(-90),
        false
    );

    // top arc:
    ctx.bezierCurveTo(
        s,
        0,
        s,
        h,
        sp,
        h
    );

    // top right:
    ctx.arc(
        this.width() - this.corner,
        h + this.corner,
        radius,
        radians(-90),
        0, false
    );

    // C-Slots
    this.cSlots().forEach(slot => {
        slot.outlinePath(ctx, inset, slot.position().subtract(pos));
    });

    // bottom right:
    ctx.arc(
        this.width() - this.corner,
        bottomCorner,
        radius, 0,
        radians(90),
        false
    );

    if (!this.isStop()) {
        ctx.lineTo(this.width() - this.corner, bottom - inset);
        ctx.lineTo(this.corner * 3 + this.inset + this.dent, bottom - inset);
        ctx.lineTo(indent + this.dent, bottom + this.corner - inset);
        ctx.lineTo(indent, bottom + this.corner - inset);
        ctx.lineTo(this.corner + this.inset, bottom - inset);
    };

    // bottom left:
    ctx.arc(
        this.corner,
        bottomCorner,
        radius,
        radians(90),
        radians(180),
        false
    );
};};

HatBlockMorph.prototype.drawEdges = function (ctx) {
    if (this.isPrototypeLike) {
    PrototypeHatBlockMorph.prototype.drawEdges.call(this, ctx);
    } else {var shift = this.edge / 2, x = 0, y = 0,
    indent = x + this.corner * 2 + this.inset,
    top = this.top(), lgx = (x + this.corner
    ) + this.inset, cslots = this.cSlots(),
    r = ((4 * (this.hatHeight ** 2)) + (this.hatWidth ** 2)) / (8 * this.hatHeight);

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';

    ctx.strokeStyle = this.cachedClrBright;  ctx.beginPath();
    ctx.moveTo(shift, this.height() - this.corner * 2 - shift
    );  ctx.lineTo(shift, this.hatHeight + shift);
    ctx.arc(this.hatWidth / 2, shift + r, r,
        radians((degrees(4 * Math.atan(2 * (
        this.hatHeight / this.hatWidth))
        ) / -2) - 90), Math.PI / -2
    );  ctx.bezierCurveTo((this
        ).hatWidth, shift, (this
        ).hatWidth, this.hatHeight + shift,
        Math.min(this.hatWidth * 1.7,
        this.width() - this.corner),
        this.hatHeight + shift
    );  ctx.lineTo(this.width() - this.corner,
    this.hatHeight + shift); ctx.stroke(); x = this.width();

    ctx.strokeStyle = this.cachedClrDark; ctx.beginPath();
    ctx.moveTo(x - shift, (this.corner + this.hatHeight
    ) + shift); if (cslots.length > 0
        ) {cslots.forEach(slot => {
            y = slot.top() - top;
            ctx.lineTo(x - shift,
            y); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x - shift, y + slot.height(
    ));});};   y = this.height() - this.corner;
    ctx.arc(this.width() - this.corner,
        this.height() - this.corner * 2,
        this.corner - shift, 0, Math.PI / 2
    );  if (!(this.isStop())) {ctx.lineTo(
        this.corner * 3 + this.inset + this.dent,
        y - shift );  ctx.lineTo(indent + this.dent,
    y + this.corner - shift); ctx.lineTo(indent + shift,
    y + this.corner - shift); ctx.stroke(); ctx.beginPath(
    );  ctx.moveTo(this.corner + this.inset - shift, y - shift
);};};  ctx.lineTo(this.corner, y - shift); ctx.stroke();};

// DefinitorBlockMorph ///////////////////////////////////////////////////////

/*
    I am a script's definition and starter block. I can attach command blocks
    at my bottom, but not on top like my brother, the hat block.

*/

// DefinitorBlockMorph inherits from CommandBlockMorph:

DefinitorBlockMorph.prototype = new CommandBlockMorph;
DefinitorBlockMorph.prototype.constructor = DefinitorBlockMorph;
DefinitorBlockMorph.uber = CommandBlockMorph.prototype;

// DefinitorBlockMorph instance creation:

function DefinitorBlockMorph() {this.init();};

DefinitorBlockMorph.prototype.init = function () {(DefinitorBlockMorph
).uber.init.call(this); this.fixLayout(); this.rerender();};

// DefinitorBlockMorph enumerating:

DefinitorBlockMorph.prototype.blockSequence = function () {if ((['evaluateCustomBlock', 'runScript']).includes(this.selector
)) {return this;} else {var result = DefinitorBlockMorph.uber.blockSequence.call(this); result.shift(); return result;};};

DefinitorBlockMorph.prototype.outlinePath = HatBlockMorph.prototype.outlinePath;
DefinitorBlockMorph.prototype.drawEdges = HatBlockMorph.prototype.drawEdges;

// ReporterBlockMorph //////////////////////////////////////////////////

/*
    I am a block with a return value, either round-ish, diamond shaped
    or arrow-ish. I inherit all my important accessors from BlockMorph
*/

// ReporterBlockMorph inherits from BlockMorph:

ReporterBlockMorph.prototype = new BlockMorph;
ReporterBlockMorph.prototype.constructor = ReporterBlockMorph;
ReporterBlockMorph.uber = BlockMorph.prototype;

// ReporterBlockMorph instance creation:

function ReporterBlockMorph(isPredicate,
isArrow) {this.init(isPredicate, isArrow);};

ReporterBlockMorph.prototype.init = function (isPredicate, isArrow) {
ReporterBlockMorph.uber.init.call(this); this.isPredicate = isPredicate || false;
this.isArrow = isArrow || false; this.bounds.setExtent(new Point(50, 22
).multiplyBy(this.scale)); this.fixLayout(); this.rerender();
this.cachedSlotSpec = null; this.isLocalVarTemplate = null;};

// ReporterBlockMorph drag & drop:

ReporterBlockMorph.prototype.snap = function (hand) {
    // passing the hand is optional (for when blocks are dragged & dropped)
    var scripts = this.parent,
        nb,
        target;

    this.cachedSlotSpec = null;
    if (!(scripts instanceof ScriptsMorph)
    ) {return null;}; scripts.clearDropInfo(
    ); scripts.lastDroppedBlock = this;

    target = scripts.closestInput(this, hand);
    if (target instanceof Morph) {if (!(
        target.constructor.name === 'BlockSlotMorph'
        )) {scripts.lastReplacedInput = target;
        scripts.lastDropTarget = target.parent;
        if (target instanceof MultiArgMorph) {
            scripts.lastPreservedBlocks = target.inputs();
            scripts.lastReplacedInput = target.fullCopy();
            target.parentThatIsA(BlockMorph).rerender();
        } else if (target instanceof CommandSlotMorph) {
            scripts.lastReplacedInput = target;
            nb = target.nestedBlock();
            if (nb) {
                nb = nb.fullCopy();
                scripts.add(nb);
                nb.moveBy(nb.extent());
                nb.fixBlockColor();
                scripts.lastPreservedBlocks = [nb
            ];};};  target.parent.replaceInput(
            target, this);
    target.parentThatIsA(BlockMorph).fixLayout();
    target.parentThatIsA(BlockMorph).rerender();
    target.parentThatIsA(BlockMorph).forAllChildren(
    child => {if (child instanceof CSlotMorph) {
    child.fixLayout();}; child.rerender();});
        if (this.snapSound) {this.snapSound.play();
    };};}; ReporterBlockMorph.uber.snap.call(this);
    this.fixBlockColor(); if (hand) {
        scripts.recordDrop(hand.grabOrigin);
    };  this.rerender(); this.forAllChildren(
    child => {if (child instanceof CSlotMorph) {
    child.fixLayout();}; child.rerender();});};

ReporterBlockMorph.prototype.prepareToBeGrabbed = function (handMorph) {
    var oldPos = this.position();

    if ((this.parent instanceof BlockMorph)
            || (this.parent instanceof MultiArgMorph)
            || (this.parent instanceof ReporterSlotMorph
        )) {var oldParent = this.parent; (oldParent
        ).revertToDefaultInput(this); this.setPosition(
        oldPos); (ReporterBlockMorph.uber.prepareToBeGrabbed
        ).call(this, handMorph); this.fixBlockColor();
    this.fixLayout(); this.rerender(); this.forAllChildren(
    child => {if (child instanceof CSlotMorph) {(child
    ).fixLayout();}; child.rerender();}); (oldParent
    ).parentThatIsA(BlockMorph).forAllChildren(child => {
    if (child instanceof CSlotMorph) {child.fixLayout();};
    child.rerender();});}; handMorph.alpha = ((17 + (3 * (
    this.alpha < 1))) / 20); this.cachedSlotSpec = null;};

// ReporterBlockMorph enumerating

(ReporterBlockMorph.prototype.blockSequence
) = function () {return this;};

// ReporterBlockMorph evaluating

ReporterBlockMorph.prototype.isUnevaluated = function () {var spec = this.getSlotSpec(); return contains(['%anyUE', '%numericUE', '%textingUE', '%linesUE', '%codeUE', '%boolUE', '%bUE'], spec);};

ReporterBlockMorph.prototype.isLocked = function () {return (
this.isStatic || (this.getSlotSpec() === '%t'));};

ReporterBlockMorph.prototype.getSlotSpec = function () {
    // answer the spec of the slot I'm in, if any
    // cached for performance
    if (!this.cachedSlotSpec) {
        this.cachedSlotSpec = this.determineSlotSpec();
    /*
    } else {
        // debug slot spec caching
        var real = this.determineSlotSpec();
        if (real !== this.cachedSlotSpec) {
            throw new Error(
                'cached slot spec ' +
                this.cachedSlotSpec +
                ' does not match: ' +
                real
            );
        }
    */
    };  return this.cachedSlotSpec;
};

ReporterBlockMorph.prototype.determineSlotSpec = function () {
    // private - answer the spec of the slot I'm in, if any
    var parts, idx;
    if (this.parent instanceof BlockMorph) {
        parts = this.parent.parts().filter(part =>
            !(part instanceof BlockHighlightMorph)
        );  idx = parts.indexOf(this);
        if (idx !== -1) {
            if (this.parent.blockSpec) {
                return this.parseSpec(this.parent.blockSpec)[idx];
            };
        };
    };
    if (this.parent instanceof MultiArgMorph) {
        return this.parent.slotSpec;
    };  if (this.parent instanceof TemplateSlotMorph) {
        return this.parent.getSpec();
    };  return '';
};

// ReporterBlockMorph events

ReporterBlockMorph.prototype.mouseClickLeft = function (pos) {
    var label;
    if (this.parent instanceof BlockInputFragmentMorph) {
        return this.parent.mouseClickLeft();
    }
    if (this.parent instanceof TemplateSlotMorph) {
        if (this.parent.parent && this.parent.parent.parent &&
                this.parent.parent.parent instanceof RingMorph) {
            label = "Input name";
        } else if (this.parent.parent.elementSpec === '%blockVars') {
            label = "Block variable name";
        } else {
            label = "Script variable name";
        };  new DialogBoxMorph(
            this,
            this.userSetSpec,
            this
        ).prompt(
            label,
            this.blockSpec,
            world
        );
    } else {
        ReporterBlockMorph.uber.mouseClickLeft.call(this, pos);
    }
};

// ReporterBlockMorph deleting

ReporterBlockMorph.prototype.userDestroy = function () {
    // make sure to restore default slot of parent block
    var target = this.selectForEdit(); // enable copy-on-edit
    if (target !== this) {
        return this.userDestroy.call(target);
    };

    // for undrop / redrop
    var scripts = this.parentThatIsA(ScriptsMorph);
    if (scripts) {
        scripts.clearDropInfo();
        scripts.lastDroppedBlock = this;
        scripts.recordDrop(this.situation());
        scripts.dropRecord.action = 'delete';
    };

    this.topBlock().fullChanged();
    this.prepareToBeGrabbed(this.world().hand);
    this.destroy();
};

// ReporterBlockMorph drawing:

ReporterBlockMorph.prototype.outlinePath = function (ctx, inset) {
    if (this.isPredicate) {
        this.outlinePathDiamond(ctx, inset);
    } else if (this.isArrow) {
        this.outlinePathArrow(ctx, inset);
    } else {
        this.outlinePathOval(ctx, inset);
    };
};

ReporterBlockMorph.prototype.outlinePathOval = function (ctx, inset) {
    // draw the 'flat' shape
    var h = this.height(),
        r = Math.min(this.rounding, (h / 2)),
        radius = Math.max(r - inset, 0),
        w = this.width(),
        pos = this.position();

    // top left:
    ctx.arc(
        r,
        r,
        radius,
        radians(-180),
        radians(-90),
        false
    );

    // top right:
    ctx.arc(
        w - r,
        r,
        radius,
        radians(-90),
        radians(-0),
        false
    );

    // C-Slots
    this.cSlots().forEach(slot => {
        slot.outlinePath(ctx, inset, slot.position().subtract(pos));
    });

    // bottom right:
    ctx.arc(
        w - r,
        h - r,
        radius,
        radians(0),
        radians(90),
        false
    );

    // bottom left:
    ctx.arc(
        r,
        h - r,
        radius,
        radians(90),
        radians(180),
        false
    );

    ctx.lineTo(r - radius, r);
};

ReporterBlockMorph.prototype.outlinePathDiamond = function (ctx, inset) {
    // draw the 'flat' shape:
    var w = this.width(),
        h = this.height(),
        h2 = Math.floor(h / 2),
        r = this.rounding,
        right = w - r,
        pos = this.position(),
        cslots = this.cSlots();

    ctx.moveTo(inset, h2);
    ctx.lineTo(r, inset);
    ctx.lineTo(right - inset, inset);

    // C-Slots
    if (cslots.length) {
        cslots.forEach(slot => {
            slot.outlinePath(ctx, inset, slot.position().subtract(pos));
        });
    } else {
        ctx.lineTo(w - inset, h2);
    };

    ctx.lineTo(right - inset, h - inset);
    ctx.lineTo(r, h - inset);
};

ReporterBlockMorph.prototype.outlinePathArrow = function (ctx, inset) {
    // draw the 'flat' shape:
    var w = this.width(),
        h = this.height(),
        h2 = Math.floor(h / 2),
        r = this.rounding,
        right = w - r,
        pos = this.position(),
        cslots = this.cSlots();

    ctx.moveTo(r, h2);
    ctx.lineTo(0, inset);
    ctx.lineTo(right - inset, inset);

    // C-Slots
    if (cslots.length) {
        cslots.forEach(slot => {
            slot.outlinePath(ctx, inset, slot.position().subtract(pos));
        });
    } else {
        ctx.lineTo(w - inset, h2);
    };

    ctx.lineTo(right - inset, h - inset);
    ctx.lineTo(inset, h - inset);
};

ReporterBlockMorph.prototype.drawEdges = function (ctx) {
    if (this.isPredicate) {
        this.drawEdgesDiamond(ctx);
    } else if (this.isArrow) {
        this.drawEdgesArrow(ctx);
    } else {
        this.drawEdgesOval(ctx);
    };};

ReporterBlockMorph.prototype.drawEdgesOval = function (
    ctx) {var h = this.height(),
        r = Math.max(Math.min(
        this.rounding, (h / 2
        )), this.edge), w = (
        this).width(), shift = (
        this.edge / 2), y, top = (
        this.top()), cslots = (
        this.cSlots());

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';

    ctx.strokeStyle = this.cachedClrBright;
    ctx.beginPath();
    ctx.arc(r,
        h - r,
        r - shift,
        Math.PI / 2,
        Math.PI,
        false
    );  ctx.arc(r,
        r, r - shift,
        Math.PI,
        Math.PI / -2,
        false); (ctx
        ).lineTo(w - r,
    shift); ctx.stroke();

    ctx.strokeStyle = this.cachedClrDark;
    ctx.beginPath(); ctx.arc(w - r, r,
        r - shift, Math.PI / -2, 0
        ); if (cslots.length > 0) {
        cslots.forEach(slot => {
            y = slot.top() - top;
            ctx.lineTo(w - shift,
            y);  ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(w - shift,
            y + slot.height());
    });}; ctx.lineTo(w - shift,
    h - r); ctx.arc(w - r, h - r,
    r - shift, 0,  Math.PI / 2,
    false); ctx.lineTo(r, h - (
    shift)); ctx.stroke();};

ReporterBlockMorph.prototype.drawEdgesDiamond = function (ctx) {
    // add 3D-Effect
    var w = this.width(),
        h = this.height(),
        h2 = Math.floor(h / 2),
        r = this.rounding,
        shift = this.edge / 2,
        cslots = this.cSlots(
        ), top = this.top(),
        y, gradient;

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // half-tone edges
    // bottom left corner
    gradient = ctx.createLinearGradient(
        -r,
        0,
        r,
        0
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(shift, h2);
    ctx.lineTo(r, h - shift);
    ctx.closePath();
    ctx.stroke();

    // normal gradient edges
    // top edge: left corner
    gradient = ctx.createLinearGradient(
        0,
        0,
        r,
        0
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(shift, h2);
    ctx.lineTo(r, shift);
    ctx.closePath();
    ctx.stroke();

    // top edge: straight line
    gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(r, shift);

    // right edge
    if (cslots.length) {
        // end of top edge
        ctx.lineTo(w - r - shift, shift);
        ctx.closePath();
        ctx.stroke();

        // right vertical edge
        gradient = ctx.createLinearGradient(w - r - this.edge, 0, w - r, 0);
        gradient.addColorStop(0, this.cachedClr);
        gradient.addColorStop(1, this.cachedClrDark);

        ctx.lineWidth = this.edge;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(w - r - shift, this.edge + shift);
        cslots.forEach(slot => {
            y = slot.top() - top;
            ctx.lineTo(w - r - shift, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(w - r - shift, y + slot.height());
        });
        ctx.lineTo(w - r - shift, h - shift);
        ctx.stroke();
    } else {
        // end of top edge
        ctx.lineTo(w - r, shift);
        ctx.closePath();
        ctx.stroke();

        // top diagonal slope right
        gradient = ctx.createLinearGradient(
            w - r,
            0,
            w + r,
            0
        );
        gradient.addColorStop(0, this.cachedClr);
        gradient.addColorStop(1, this.cachedClrDark);
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(w - shift, h2);
        ctx.lineTo(w - r, shift);
        ctx.closePath();
        ctx.stroke();

        // bottom diagonal slope right
        gradient = ctx.createLinearGradient(
            w - r,
            0,
            w,
            0
        );
        gradient.addColorStop(0, this.cachedClr);
        gradient.addColorStop(1, this.cachedClrDark);
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(w - r, h - shift);
        ctx.lineTo(w - shift, h2);
        ctx.closePath();
        ctx.stroke();
    }

    // bottom edge: straight line
    gradient = ctx.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(r + shift, h - shift);
    ctx.lineTo(w - r - shift, h - shift);
    ctx.closePath();
    ctx.stroke();
};

ReporterBlockMorph.prototype.drawEdgesArrow = function (ctx) {
    // add 3D-Effect
    var w = this.width(),
        h = this.height(),
        h2 = Math.floor(h / 2),
        r = this.rounding,
        shift = this.edge / 2,
        cslots = this.cSlots(
        ), top = this.top(),
        y, gradient;

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // half-tone edges
    // bottom left corner
    gradient = ctx.createLinearGradient(
        -r,
        0,
        r,
        0
    );
    gradient.addColorStop(1, this.cachedClrBright);
    gradient.addColorStop(0, this.cachedClr);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(r, h2);
    ctx.lineTo(shift, h - shift);
    ctx.closePath();
    ctx.stroke();

    // normal gradient edges
    // top edge: left corner
    gradient = ctx.createLinearGradient(
        0,
        0,
        r,
        0
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrBright);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(r, h2);
    ctx.lineTo(shift, shift);
    ctx.closePath();
    ctx.stroke();

    // top edge: straight line
    gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(shift, shift);

    // right edge
    if (cslots.length) {
        // end of top edge
        ctx.lineTo(w - r - shift, shift);
        ctx.closePath();
        ctx.stroke();

        // right vertical edge
        gradient = ctx.createLinearGradient(w - r - this.edge, 0, w - r, 0);
        gradient.addColorStop(0, this.cachedClr);
        gradient.addColorStop(1, this.cachedClrDark);

        ctx.lineWidth = this.edge;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(w - r - shift, this.edge + shift);
        cslots.forEach(slot => {
            y = slot.top() - top;
            ctx.lineTo(w - r - shift, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(w - r - shift, y + slot.height());
        });
        ctx.lineTo(w - r - shift, h - shift);
        ctx.stroke();
    } else {
        // end of top edge
        ctx.lineTo(w - r, shift);
        ctx.closePath();
        ctx.stroke();

        // top diagonal slope right
        gradient = ctx.createLinearGradient(
            w - r,
            0,
            w + r,
            0
        );
        gradient.addColorStop(0, this.cachedClr);
        gradient.addColorStop(1, this.cachedClrDark);
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(w - shift, h2);
        ctx.lineTo(w - r, shift);
        ctx.closePath();
        ctx.stroke();

        // bottom diagonal slope right
        gradient = ctx.createLinearGradient(
            w - r,
            0,
            w,
            0
        );
        gradient.addColorStop(0, this.cachedClr);
        gradient.addColorStop(1, this.cachedClrDark);
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(w - r, h - shift);
        ctx.lineTo(w - shift, h2);
        ctx.closePath();
        ctx.stroke();
    }

    // bottom edge: straight line
    gradient = ctx.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(shift, h - shift);
    ctx.lineTo(w - r - shift, h - shift);
    ctx.closePath();
    ctx.stroke();
};

ReporterBlockMorph.prototype.userCut = function() {

    window.blockCopy = this.fullCopy()

    // make sure to restore default slot of parent block
    var target = this.selectForEdit(); // enable copy-on-edit
    if (target !== this) {
        return this.userDestroy.call(target);
    }

    // for undrop / redrop
    var scripts = this.parentThatIsA(ScriptsMorph);
    if (scripts) {
        scripts.clearDropInfo();
        scripts.lastDroppedBlock = this;
        scripts.recordDrop(this.situation());
        scripts.dropRecord.action = 'delete';};

    this.topBlock().fullChanged();
    this.prepareToBeGrabbed(world.hand);
    this.destroy();

    var nb = window.blockCopy.fullCopy(
    );  nb = nb.nextBlock(); if (
    nb) {nb.destroy();};};

// RingMorph /////////////////////////////////////////////////////////////

/*
    I am a reporter block which lambdifies it's contents todo outputs,
    my outer shape will be sometimes roundish, diamondish or arrowish. 
*/

// RingMorph inherits from ReporterBlockMorph:

RingMorph.prototype = new ReporterBlockMorph;
RingMorph.prototype.constructor = RingMorph;
RingMorph.uber = ReporterBlockMorph.prototype;

// RingMorph preferences settings:

RingMorph.prototype.isCachingInputs = false;

// RingMorph instance creation:

function RingMorph () {this.init();};

RingMorph.prototype.init = function () {RingMorph.uber.init.call(this); (this
).contrast = RingMorph.prototype.contrast; this.bounds.setExtent(new Point(50,
22).multiplyBy(this.scale)); this.rerender();}; /* Init the block for fun. */

// RingMorph dragging and dropping

RingMorph.prototype.rootForGrab = function (
) {if (this.isDraggable) {return this;} else {
return BlockMorph.uber.rootForGrab.call(this);};};

// RingMorph ops - Note: these assume certain layouts defined elsewhere -

RingMorph.prototype.embed = function (aBlock, inputNames, noVanish) {
    var slot; this.isDraggable = true; this.category = asABool(
    localStorage['-snap-setting-oldLambdaOn']) ? 'operators' : 'other';
    this.color = SpriteMorph.prototype.blockColorFor(this.category);
    // set my type, selector, and nested block:
    this.isStatic = false;
    if (aBlock instanceof CommandBlockMorph) {
    this.selector = asABool(localStorage['-snap-setting-oldLambdaOn']) ? 'reportScript' : 'reifyScript';
    this.setSpec(localize(asABool(localStorage['-snap-setting-oldLambdaOn']) ? 'the script %parms %c' : '%rc %ringparms'));
    slot = this.parts().filter(part => ((part instanceof CommandSlotMorph) || (part instanceof FunctionSlotMorph)))[0];
    slot.nestedBlock(aBlock);} else {
    this.selector = ('reify').concat(asABool(localStorage['-snap-setting-oldLambdaOn']) ? '' : (aBlock.isPredicate ? 'Predicate' : 'Reporter'
    )); this.setSpec(localize(asABool(localStorage['-snap-setting-oldLambdaOn']) ? 'the %f block %parms' : (aBlock.isPredicate ? '%rp' : '%rr'
    ).concat(' %ringparms'))); slot = this.parts().filter(part => ((part instanceof CommandSlotMorph) || (part instanceof FunctionSlotMorph
    )))[0]; if (slot instanceof Morph) {slot.replaceInput(slot.contents(), aBlock, noVanish);};};

    // set my inputs, if any
    slot = this.children.filter(part => (part instanceof MultiArgMorph))[0];
    if (!isNil(slot)) {if (inputNames) {inputNames.forEach(name => slot.addInput(name));};};

    // ensure zebra coloring
    this.fixBlockColor(null, true);
};

RingMorph.prototype.vanishForSimilar = function () {
    // let me disappear if I am nesting a variable getter or Ring
    // but only if I'm not already inside another ring
    var slot = this.parts().filter(part => ((part instanceof CommandSlotMorph) || (part instanceof FunctionSlotMorph)))[0];
    var block = slot.nestedBlock();

    if (!(block)) {return null;}; if (!((this.parent
    ) instanceof SyntaxElementMorph)) {return null;};
    if ((this.parent instanceof RingReporterSlotMorph
             ) || (this.parent instanceof CommandSlotMorph
             )) {return null;
    };  if ((block.selector === 'reportGetVar' &&
            !contains(this.inputNames(), block.blockSpec)) ||
        contains(['reportJSFunction', 'reportAttributeOf',
        'reportCompiled'], block.selector) ||
        (block instanceof RingMorph)
    )  {this.parent.replaceInput(this, block);};};

RingMorph.prototype.blockSlot = function () {var slots = this.parts().filter(part => ((part instanceof CommandSlotMorph) || (part instanceof FunctionSlotMorph
))); if (slots.length > 0) {return slots[0];} else {return null;};}; RingMorph.prototype.contents = function () {var thatSlot = this.blockSlot();
return ((thatSlot instanceof Morph) ? thatSlot.nestedBlock() : null);}; RingMorph.prototype.inputNamesElement = function () {var inputs = this.children.filter(
part => (part instanceof MultiArgMorph))[0]; if (inputs instanceof MultiArgMorph) {return inputs;} else {return null;};}; (RingMorph.prototype.inputNames
) = function () {var inputs = this.inputNamesElement(); if (inputs instanceof MultiArgMorph) {return inputs.evaluate();} else {return [];};};
RingMorph.prototype.dataType = function () {return contains(['reportScript', 'reifyScript'], this.selector) ? 'command' : (((this.contents()
) instanceof ReporterBlockMorph) ? (this.contents().isPredicate ? 'predicate' : 'reporter') : (this.blockSlot().isPredicate ? 'predicate' : (
'reporter')));}; RingMorph.prototype.isEmptySlot = function () {return ((this.contents() === null) && (this.getSlotSpec().indexOf('Ring') > 0));};

// ScriptsMorph ////////////////////////////////////////////////////////

/*
    I give feedback about possible drop targets and am in charge
    of actually snapping blocks together.

    My children are the top blocks of scripts.

    I store a back-pointer to my owner, i.e. the object (sprite)
    to whom my scripts apply.
*/

// ScriptsMorph inherits from FrameMorph:

ScriptsMorph.prototype = new FrameMorph;
ScriptsMorph.prototype.constructor = ScriptsMorph;
ScriptsMorph.uber = FrameMorph.prototype;

// ScriptsMorph preference settings

ScriptsMorph.prototype.cleanUpMargin = 20;
ScriptsMorph.prototype.cleanUpSpacing = 15;
ScriptsMorph.prototype.isPreferringEmptySlots = true;
ScriptsMorph.prototype.enableKeyboard = false;
ScriptsMorph.prototype.enableNestedAutoWrapping = true;
ScriptsMorph.prototype.feedbackColor = WHITE;

// ScriptsMorph instance creation:

function ScriptsMorph() {this.init();};

ScriptsMorph.prototype.init = function () {
    this.feedbackMorph = new BoxMorph;
    this.rejectsHats = false;

    // "undrop" attributes:
    this.lastDroppedBlock = null;
    this.lastReplacedInput = null;
    this.lastDropTarget = null;
    this.lastPreservedBlocks = null;
    this.lastNextBlock = null;
    this.lastWrapParent = null;

    // keyboard editing support:
    this.focus = null;

    ScriptsMorph.uber.init.call(this
    ); this.cursorStyle = 'default';
    this.setColor(new Color(70, 70, 70));

    // initialize "undrop" queue
    this.isAnimating = false;
    this.dropRecord = null;
    this.recordDrop();
};

// ScriptsMorph deep copying:

ScriptsMorph.prototype.fullCopy = function () {
    var cpy = new ScriptsMorph,
        pos = this.position(),
        child;
    if (this.focus) {
        this.focus.stopEditing();
    }
    this.children.forEach(morph => {
        if (!morph.block) { // omit anchored comments
            child = morph.fullCopy();
            cpy.add(child);
            child.setPosition(morph.position().subtract(pos));
            if (child instanceof BlockMorph) {
                child.allComments().forEach(comment =>
                    comment.align(child)
                );
            }
        }
    });
    cpy.adjustBounds();
    return cpy;
};

// ScriptsMorph rendering:

ScriptsMorph.prototype.render = function (aContext) {
    aContext.fillStyle = this.getRenderColor().toString();
    aContext.fillRect(0, 0, this.width(), this.height());
    if (this.cachedTexture) {
        this.renderCachedTexture(aContext);
    } else if (this.texture) {
        this.renderTexture(this.texture);
    }
};

ScriptsMorph.prototype.getRenderColor = function () {
    if (MorphicPreferences.isFlat ||
            SyntaxElementMorph.prototype.alpha > 0.85) {
        return this.color;
    }
    return this.color.mixed(
        Math.max(SyntaxElementMorph.prototype.alpha - 0.15, 0),
        SpriteMorph.prototype.paletteColor
    );
};

ScriptsMorph.prototype.renderCachedTexture = function (ctx) {
    // support blocks-to-text slider
    if (SyntaxElementMorph.prototype.alpha > 4/5) {
        ScriptsMorph.uber.renderCachedTexture.call(this, ctx);
    }
};

// ScriptsMorph stepping:

ScriptsMorph.prototype.step = function () {
    var hand = world.hand, block;

    if (this.feedbackMorph.parent) {
        this.feedbackMorph.destroy();
        this.feedbackMorph.parent = null;
    };
    if (this.focus && (!world.keyboardFocus ||
            world.keyboardFocus instanceof StageMorph)) {
        this.focus.getFocus(world);
    };
    if (hand.children.length === 0) {
        return null;
    };
    if (!this.bounds.containsPoint(hand.bounds.origin)) {
        return null;
    };
    block = hand.children[0];
    if (!(block instanceof BlockMorph) && !(block instanceof CommentMorph)) {
        return null;
    };
    if (!contains(hand.morphAtPointer().allParents(), this)) {
        return null;
    };
    if (block instanceof CommentMorph) {
        this.showCommentDropFeedback(block, hand);
    } else if (block instanceof ReporterBlockMorph) {
        this.showReporterDropFeedback(block, hand);
    } else {
        this.showCommandDropFeedback(block, hand);
    };
};

ScriptsMorph.prototype.showReporterDropFeedback = function (block, hand) {
    var target = this.closestInput(block, hand);

    if (target === null) {
        return null;
    };
    this.feedbackMorph.edge = SyntaxElementMorph.prototype.rounding;
    this.feedbackMorph.border = Math.max(
        SyntaxElementMorph.prototype.edge,
        3
    );
    if (target instanceof MultiArgMorph) {
        this.feedbackMorph.color =
            SpriteMorph.prototype.blockColor.lists.copy();
        this.feedbackMorph.borderColor =
            SpriteMorph.prototype.blockColor.lists;
        target = target.arrows();
    } else {
        this.feedbackMorph.color = this.feedbackColor.copy();
        this.feedbackMorph.borderColor = this.feedbackColor;
    };
    this.feedbackMorph.bounds = target.fullBounds()
        .expandBy(Math.max(
            block.edge * 2,
            block.reporterDropFeedbackPadding
        ));
    this.feedbackMorph.color.a = 0.5;
    this.feedbackMorph.rerender();
    this.add(this.feedbackMorph);
};

ScriptsMorph.prototype.showCommandDropFeedback = function (block) {
    var y, target;

    target = block.closestAttachTarget(this);
    if (!target) {return null;};
    if (target.loc === 'wrap') {
        this.showCSlotWrapFeedback(block, target.element);
        return;
    };
    this.add(this.feedbackMorph);
    this.feedbackMorph.border = 0;
    this.feedbackMorph.edge = 0;
    this.feedbackMorph.alpha = 1;
    this.feedbackMorph.bounds.setWidth(target.element.width());
    this.feedbackMorph.bounds.setHeight(Math.max(
            SyntaxElementMorph.prototype.corner,
            SyntaxElementMorph.prototype.feedbackMinHeight
        )
    );
    this.feedbackMorph.color = this.feedbackColor;
    y = target.point.y;
    if (target.loc === 'bottom') {
        if (target.type === 'block') {
            if (target.element.nextBlock()) {
                y -= SyntaxElementMorph.prototype.corner;
            }
        } else if (target.type === 'slot') {
            if (target.element.nestedBlock()) {
                y -= SyntaxElementMorph.prototype.corner;
            }
        }
    }
    this.feedbackMorph.setPosition(new Point(
        target.element.left(),
        y
    ));
};

ScriptsMorph.prototype.showCommentDropFeedback = function (comment, hand) {
    var target = this.closestBlock(comment, hand);
    if (!target) {
        return null;
    }

    this.feedbackMorph.bounds = target.bounds
        .expandBy(Math.max(
            BlockMorph.prototype.edge * 2,
            BlockMorph.prototype.reporterDropFeedbackPadding
        ));
    this.feedbackMorph.edge = SyntaxElementMorph.prototype.rounding;
    this.feedbackMorph.border = Math.max(
        SyntaxElementMorph.prototype.edge,
        3
    );
    this.add(this.feedbackMorph);
    this.feedbackMorph.color = comment.color.copy();
    this.feedbackMorph.color.a = 0.25;
    this.feedbackMorph.borderColor = comment.titleBar.color;
    this.feedbackMorph.rerender();
};

ScriptsMorph.prototype.showCSlotWrapFeedback = function (srcBlock, trgBlock) {
    var clr;
    this.feedbackMorph.bounds = trgBlock.fullBounds()
        .expandBy(BlockMorph.prototype.corner);
    this.feedbackMorph.edge = SyntaxElementMorph.prototype.corner;
    this.feedbackMorph.border = Math.max(
        SyntaxElementMorph.prototype.edge,
        3
    );
    this.add(this.feedbackMorph);
    clr = srcBlock.color.lighter(40);
    this.feedbackMorph.color = clr.copy();
    this.feedbackMorph.color.a = 1/10;
    this.feedbackMorph.borderColor = clr;
    this.feedbackMorph.rerender();
};

ScriptsMorph.prototype.closestInput = function (reporter, hand) {
    // passing the hand is optional (when dragging reporters)
    var fb = reporter.fullBoundsNoShadow(),
        stacks = this.children.filter(child =>
            (child instanceof BlockMorph) &&
                (child.fullBounds().intersects(fb))
        ),
        blackList = reporter.allInputs(),
        handPos,
        target,
        all = [];
    stacks.forEach(stack => (all = all.concat(stack.allInputs())));
    if (all.length === 0) {return null;};

    function touchingVariadicArrowsIfAny(inp, point) {
        if (inp instanceof MultiArgMorph) {
            if (point) {
                return inp.arrows().bounds.containsPoint(point);
            }
            return inp.arrows().bounds.intersects(fb);
        }
        return true;
    }

    if (this.isPreferringEmptySlots) {
        if (hand) {
            handPos = hand.position();
            target = detect(
                all,
                input => (input instanceof InputSlotMorph ||
                        (input instanceof ArgMorph &&
                            !(input instanceof CommandSlotMorph) &&
                            !(input instanceof MultiArgMorph)
                        ) ||
                        (input instanceof RingMorph && !input.contents()) ||
                        input.isEmptySlot()
                    ) &&
                        !input.isLocked() &&
                            input.bounds.containsPoint(handPos) &&
                                !contains(blackList, input)
            );
            if (target) {
                return target;
            }
        }
        target = detect(
            all,
            input => (input instanceof InputSlotMorph ||
                    input instanceof ArgMorph ||
                    (input instanceof RingMorph && !input.contents()) ||
                    input.isEmptySlot()
                ) &&
                    !input.isLocked() &&
                        input.bounds.intersects(fb) &&
                            !contains(blackList, input) &&
                                touchingVariadicArrowsIfAny(input, handPos)
        );
        if (target) {
            return target;
        }
    }

    if (hand) {
        handPos = hand.position();
        target = detect(
            all,
            input => (input !== reporter) &&
                !input.isLocked() &&
                    input.bounds.containsPoint(handPos) &&
                        !(input.parent instanceof PrototypeHatBlockMorph) &&
                            !contains(blackList, input) &&
                                touchingVariadicArrowsIfAny(input, handPos)
        );
        if (target) {
            return target;
        }
    }
    return detect(
        all,
        input => (input !== reporter) &&
            !input.isLocked() &&
                input.fullBounds().intersects(fb) &&
                    !(input.parent instanceof PrototypeHatBlockMorph) &&
                        !contains(blackList, input) &&
                            touchingVariadicArrowsIfAny(input)
    );
};

ScriptsMorph.prototype.closestBlock = function (comment, hand) {
    // passing the hand is optional (when dragging comments)
    var fb = comment.bounds,
        stacks = this.children.filter(child =>
            (child instanceof BlockMorph) &&
                (child.fullBounds().intersects(fb))
        ),
        handPos,
        target,
        all;

    all = [];
    stacks.forEach(stack => {
        all = all.concat(stack.allChildren().slice(0).reverse().filter(
            child => child instanceof BlockMorph && !child.isTemplate
        ));
    });
    if (all.length === 0) {return null;};

    if (hand) {
        handPos = hand.position();
        target = detect(
            all,
            block => !block.comment &&
                !block.isPrototype &&
                    block.bounds.containsPoint(handPos)
        );
        if (target) {
            return target;
        }
    }
    return detect(
        all,
        block => !block.comment &&
            !block.isPrototype &&
                block.bounds.intersects(fb)
    );
};

// ScriptsMorph user menu

ScriptsMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this),
        ide = this.parentThatIsA(IDE_Morph),
        shiftClicked = this.world().currentKey === 16,
        blockEditor, obj = this.scriptTarget(),
        hasUndropQueue, stage = obj.parentThatIsA(
        StageMorph), scriptsLength = this.children.filter(
        child => (child instanceof BlockMorph)).length;

    function addOption(label, toggle, test, onHint, offHint) {
        menu.addItem(
            [
                test ? new SymbolMorph(
                    'checkedBox',
                    MorphicPreferences.menuFontSize * 3/4
                ) : new SymbolMorph(
                    'rectangle',
                    MorphicPreferences.menuFontSize * 3/4
                ),
                localize(label)
            ], toggle,
            test ? onHint : offHint
        );
    };

    if (!ide) {
        blockEditor = this.parentThatIsA(BlockEditorMorph);
        if (blockEditor) {
            ide = blockEditor.target.parentThatIsA(IDE_Morph);
        };
    };

    if (!(this.parentThatIsA(NormalWindowMorph) instanceof NormalWindowMorph)) {
    if (this.dropRecord) {
        if (this.dropRecord.lastRecord) {
            hasUndropQueue = true;
            menu.addPair(
                [
                    new SymbolMorph(
                        'turnBack',
                        MorphicPreferences.menuFontSize
                    ),
                    localize('undrop')
                ],
                'undrop',
                '^Z',
                'undo the last\nblock drop\nin this pane'
            );
        }; if (this.dropRecord.nextRecord) {
            hasUndropQueue = true;
            menu.addPair(
                [
                    new SymbolMorph(
                        'turnForward',
                        MorphicPreferences.menuFontSize
                    ),
                    localize('redrop')
                ],
                'redrop',
                '^Y',
                'redo the last undone\nblock drop\nin this pane'
            );
        }; if (hasUndropQueue) {
            if (shiftClicked) {
                menu.addItem(
                    "clear undrop queue",
                    () => {
                        this.dropRecord = null;
                        this.clearDropInfo();
                        this.recordDrop();
                    }, 'forget recorded block drops\non this pane',
                    new Color(100, 0, 0)
                );
            }; menu.addLine();
        };
    };};

    menu.addItem('clean up', 'cleanUp', 'arrange scripts\nvertically'); if (scriptsLength > 1
    ) {menu.addItem(('delete the').concat(' ', scriptsLength, ' ', 'scripts from the editor'
    ), 'deleteAllBlocks', (('deletes all scripts of the ').concat((obj instanceof StageMorph
    ) ? 'stage' : 'sprite')));}; menu.addItem('add comment', 'addComment');
    menu.addItem(
        'scripts pic...',
        'exportScriptsPicture',
        'save a picture\nof all scripts'
    ); if (window.blockCopy) {
        menu.addItem(
            "paste",
            () => {
                var cpy = window.blockCopy.fullCopy(),
                    ide = this.parentThatIsA(IDE_Morph),
                    blockEditor = this.parentThatIsA(BlockEditorMorph);
                cpy.pickUp(world);
                if (!ide && blockEditor) {
                    ide = blockEditor.target.parentThatIsA(IDE_Morph);
                }; if (ide) {
                    world.hand.grabOrigin = {
                        origin: ide.palette,
                        position: ide.palette.center()
                    };
                };
            }, 'retrieve copied script'
        );}; if (ide) {
        menu.addLine();
        if (!blockEditor && obj.exemplar) {
            addOption(
                'inherited',
                () => obj.toggleInheritanceForAttribute('scripts'),
                obj.inheritsAttribute('scripts'),
                'uncheck to\ndisinherit',
                localize('check to inherit\nfrom')
                    + ' ' + obj.exemplar.name
            );
        }; menu.addItem(
            'make a block...',
            () => new BlockDialogMorph(
                null,
                definition => {
                    if (definition.spec !== '') {
                        if (definition.isGlobal) {
                            stage.globalBlocks.push(definition);
                        } else {
                            obj.customBlocks.push(definition);
                        }; ide.flushPaletteCache();
                        ide.refreshPalette();
                        new BlockEditorMorph(definition, obj).popUp();
                    };
                },
                this
            ).prompt(
                'Make a block',
                null,
                this.world()
            )
        );
    }; return menu;
};

// ScriptsMorph user menu features:

ScriptsMorph.prototype.cleanUp = function () {
    var target = this.selectForEdit(), // enable copy-on-edit
        origin = target.topLeft(),
        y = target.cleanUpMargin;
    target.children.sort((a, b) =>
        // make sure the prototype hat block always stays on top
        a instanceof PrototypeHatBlockMorph ? 0 : a.top() - b.top()
    ).forEach(child => {
        if (child instanceof CommentMorph && child.block) {
            return; // skip anchored comments
        }; child.setPosition(origin.add(new Point(target.cleanUpMargin, y)));
        if (child instanceof BlockMorph) {
            child.allComments().forEach(comment =>
                comment.align(child, true) // ignore layer
            );
        }; y += child.stackHeight() + target.cleanUpSpacing;
    }); if (target.parent) {
        target.setPosition(target.parent.topLeft());
    }; target.adjustBounds();
};

ScriptsMorph.prototype.deleteAllBlocks = function () {
    var target = this.selectForEdit();
    target.children.fullCopy().forEach(
    child => child.userDestroy());
    if (target.parent) {
        target.setPosition(target.parent.topLeft());
    }; target.adjustBounds();
};

ScriptsMorph.prototype.exportScriptsPicture = function () {
    var pic = this.scriptsPicture(),
        ide = this.world().children[0];
    if (pic) {
        ide.saveCanvasAs(
            pic,
            (ide.projectName || localize('untitled')) + ' ' +
                localize('script pic')
        );
    }
};

ScriptsMorph.prototype.scriptsPicture = function () {
    // private - answer a canvas containing the pictures of all scripts
    var boundingBox, pic, ctx;
    if (this.children.length === 0) {return; }
    boundingBox = this.children[0].fullBounds();
    this.children.forEach(child => {
        if (child.isVisible) {
            boundingBox = boundingBox.merge(child.fullBounds());
        }
    });
    pic = newCanvas(boundingBox.extent());
    ctx = pic.getContext('2d');
    this.children.forEach(child => {
        var pos = child.fullBounds().origin;
        if (child.isVisible) {
            ctx.drawImage(
                child.fullImage(),
                pos.x - boundingBox.origin.x,
                pos.y - boundingBox.origin.y
            );
        }
    });
    return pic;
};

ScriptsMorph.prototype.addComment = function () {
    var ide = this.parentThatIsA(IDE_Morph),
        blockEditor = this.parentThatIsA(BlockEditorMorph),
        world = this.world();
    new CommentMorph().pickUp(world);
    // register the drop-origin, so the element can
    // slide back to its former situation if dropped
    // somewhere where it gets rejected
    if (!ide && blockEditor) {
        ide = blockEditor.target.parentThatIsA(IDE_Morph);
    }
    if (ide) {
        world.hand.grabOrigin = {
            origin: ide.palette,
            position: ide.palette.center()
        };
    }
};

// ScriptsMorph undrop / redrop

ScriptsMorph.prototype.undrop = function () {
    if (this.isAnimating) {return; }
    if (!this.dropRecord || !this.dropRecord.lastRecord) {return; }
    if (!this.dropRecord.situation) {
        this.dropRecord.situation =
            this.dropRecord.lastDroppedBlock.situation();
    }
    this.isAnimating = true;
    this.dropRecord.lastDroppedBlock.slideBackTo(
        this.dropRecord.lastOrigin,
        null,
        this.recoverLastDrop(),
        () => {
            this.updateToolbar();
            this.isAnimating = false;
        }
    );
    this.dropRecord = this.dropRecord.lastRecord;
};

ScriptsMorph.prototype.redrop = function () {
    if (this.isAnimating) {return; }
    if (!this.dropRecord || !this.dropRecord.nextRecord) {return; }
    this.dropRecord = this.dropRecord.nextRecord;
    if (this.dropRecord.action === 'delete') {
        this.recoverLastDrop(true);
        this.dropRecord.lastDroppedBlock.destroy();
        this.updateToolbar();
    } else {
        this.isAnimating = true;
        if (this.dropRecord.action === 'extract') {
            this.dropRecord.lastDroppedBlock.extract();
        }
        this.dropRecord.lastDroppedBlock.slideBackTo(
            this.dropRecord.situation,
            null,
            this.recoverLastDrop(true),
            () => {
                this.updateToolbar();
                this.isAnimating = false;
            }
        );
    }
};

ScriptsMorph.prototype.recoverLastDrop = function (forRedrop) {
    // retrieve the block last touched by the user and answer a function
    // to be called after the animation that moves it back right before
    // dropping it into its former situation
    var rec = this.dropRecord,
        dropped,
        onBeforeDrop,
        parent;

    if (!rec || !rec.lastDroppedBlock) {
        throw new Error('nothing to undrop');
    }
    dropped = rec.lastDroppedBlock;
    parent = dropped.parent;
    if (dropped instanceof CommandBlockMorph) {
        if (rec.lastNextBlock) {
            if (rec.action === 'delete') {
                if (forRedrop) {
                    this.add(rec.lastNextBlock);
                }
            } else {
                this.add(rec.lastNextBlock);
            }
        }
        if (rec.lastDropTarget) {
            if (rec.lastDropTarget.loc === 'bottom') {
                if (rec.lastDropTarget.type === 'slot') {
                    if (rec.lastNextBlock) {
                        rec.lastDropTarget.element.nestedBlock(
                            rec.lastNextBlock
                        );
                    }
                } else { // 'block'
                    if (rec.lastNextBlock) {
                        rec.lastDropTarget.element.nextBlock(
                            rec.lastNextBlock
                        );
                    }
                }
            } else if (rec.lastDropTarget.loc === 'top') {
                this.add(rec.lastDropTarget.element);
            } else if (rec.lastDropTarget.loc === 'wrap') {
                var cslot = detect( // could be cached...
                    rec.lastDroppedBlock.inputs(), // ...although these are
                    each => each instanceof CSlotMorph
                );
                if (rec.lastWrapParent instanceof CommandBlockMorph) {
                    if (forRedrop) {
                        onBeforeDrop = () =>
                            cslot.nestedBlock(rec.lastDropTarget.element);
                    } else {
                        rec.lastWrapParent.nextBlock(
                            rec.lastDropTarget.element
                        );
                    }
                } else if (rec.lastWrapParent instanceof CommandSlotMorph) {
                    if (forRedrop) {
                        onBeforeDrop = () =>
                            cslot.nestedBlock(rec.lastDropTarget.element);
                    } else {
                        rec.lastWrapParent.nestedBlock(
                            rec.lastDropTarget.element
                        );
                    }
                } else {
                    this.add(rec.lastDropTarget.element);
                }

                // fix zebra coloring.
                // this could be generalized into the fixBlockColor mechanism
                rec.lastDropTarget.element.metaSequence().forEach(cmd =>
                    cmd.fixBlockColor()
                );
                cslot.fixLayout();
            }
        }
    } else if (dropped instanceof ReporterBlockMorph) {
        if (rec.lastDropTarget) {
            if (forRedrop) {
                rec.lastDropTarget.replaceInput(
                    rec.lastReplacedInput,
                    rec.lastDroppedBlock
                );
            } else {
                rec.lastDropTarget.replaceInput(
                    rec.lastDroppedBlock,
                    rec.lastReplacedInput
                );
            }
            rec.lastDropTarget.fixBlockColor(null, true);
            if (rec.lastPreservedBlocks) {
                rec.lastPreservedBlocks.forEach(morph =>
                    morph.destroy()
                );
            }
        }
    } else if (dropped instanceof CommentMorph) {
        if (forRedrop && rec.lastDropTarget) {
            onBeforeDrop = () => {
                rec.lastDropTarget.element.comment = dropped;
                dropped.block = rec.lastDropTarget.element;
                dropped.align();
            };
        }
    } else {
        throw new Error('unsupported action for ' + dropped);
    }
    this.clearDropInfo();
    dropped.prepareToBeGrabbed(this.world().hand);
    if (dropped instanceof CommentMorph) {
        dropped.removeShadow();
    }
    this.add(dropped);
    parent.reactToGrabOf(dropped);
    if (dropped instanceof ReporterBlockMorph && parent instanceof BlockMorph) {
        parent.changed();
    }
    if (rec.action === 'delete') {
        if (forRedrop && rec.lastNextBlock) {
            if (parent instanceof CommandBlockMorph) {
                parent.nextBlock(rec.lastNextBlock);
            } else if (parent instanceof CommandSlotMorph) {
                parent.nestedBlock(rec.lastNextBlock);
            }
        }

        // animate "undelete"
        if (!forRedrop) {
            dropped.moveBy(new Point(-100, -20));
        }
    }
    return onBeforeDrop;
};

ScriptsMorph.prototype.clearDropInfo = function () {
    this.lastDroppedBlock = null;
    this.lastReplacedInput = null;
    this.lastDropTarget = null;
    this.lastPreservedBlocks = null;
    this.lastNextBlock = null;
    this.lastWrapParent = null;
};

ScriptsMorph.prototype.recordDrop = function (lastGrabOrigin) {
    // support for "undrop" / "redrop"
    var ide, blockEditor,
        record = {
            lastDroppedBlock: this.lastDroppedBlock,
            lastReplacedInput: this.lastReplacedInput,
            lastDropTarget: this.lastDropTarget,
            lastPreservedBlocks: this.lastPreservedBlocks,
            lastNextBlock: this.lastNextBlock,
            lastWrapParent: this.lastWrapParent,
            lastOrigin: lastGrabOrigin,

        // for special gestures, e.g. deleting or extracting single commands:
            action: lastGrabOrigin ? lastGrabOrigin.action || null : null,

            situation: null,
            lastRecord: this.dropRecord,
            nextRecord: null
        };
    if (this.dropRecord) {
        this.dropRecord.nextRecord = record;
    }
    this.dropRecord = record;
    this.updateToolbar();

    // notify the IDE of an unsaved user edit
    ide = this.parentThatIsA(IDE_Morph);
    if (!ide) {
        blockEditor = this.parentThatIsA(BlockEditorMorph);
        if (blockEditor) {
            ide = blockEditor.target.parentThatIsA(IDE_Morph);
        }
    }
    if (ide) {
        ide.recordUnsavedChanges();
    }
};

ScriptsMorph.prototype.addToolbar = function () {
    var toolBar = new AlignmentMorph(),
        shade = new Color(140, 140, 140);

    toolBar.respectHiddens = true;
    toolBar.undoButton = new PushButtonMorph(
        this,
        "undrop",
        new SymbolMorph("turnBack", 12)
    );
    toolBar.undoButton.alpha = 0.2;
    toolBar.undoButton.padding = 4;
    // toolBar.undoButton.hint = 'undo the last\nblock drop\nin this pane';
    toolBar.undoButton.labelShadowColor = shade;
    toolBar.undoButton.edge = 0;
    toolBar.undoButton.fixLayout();
    toolBar.add(toolBar.undoButton);

    toolBar.redoButton = new PushButtonMorph(
        this,
        "redrop",
        new SymbolMorph("turnForward", 12)
    );
    toolBar.redoButton.alpha = 0.2;
    toolBar.redoButton.padding = 4;
    // toolBar.redoButton.hint = 'redo the last undone\nblock drop\nin this pane';
    toolBar.redoButton.labelShadowColor = shade;
    toolBar.redoButton.edge = 0;
    toolBar.redoButton.fixLayout();
    toolBar.add(toolBar.redoButton);

    toolBar.keyboardButton = new ToggleButtonMorph(
    	null, // colors
        this, // target
        "toggleKeyboardEntry",
        [
            new SymbolMorph('keyboard', 12),
            new SymbolMorph('keyboardFilled', 12)
        ],
		() => !isNil(this.focus) // query
    );
    toolBar.keyboardButton.alpha = 0.2;
    toolBar.keyboardButton.padding = 4;
    toolBar.keyboardButton.edge = 0;
    toolBar.keyboardButton.hint = 'use the keyboard\nto enter blocks';
    //toolBar.keyboardButton.pressColor = new Color(40, 40, 40);
    toolBar.keyboardButton.labelShadowColor = shade;
    toolBar.keyboardButton.fixLayout();
    toolBar.add(toolBar.keyboardButton);

    return toolBar;
};

ScriptsMorph.prototype.updateToolbar = function () {
    var sf = this.parentThatIsA(ScrollFrameMorph);
    if (!sf) {return;};
    if (!(sf.toolBar)) {
        sf.toolBar = this.addToolbar();
        sf.add(sf.toolBar);
    }
    if (this.enableKeyboard && !(this.parentThatIsA(NormalWindowMorph) instanceof NormalWindowMorph)) {
    	sf.toolBar.keyboardButton.show();
    	sf.toolBar.keyboardButton.refresh();
    } else {
        sf.toolBar.keyboardButton.hide();
    }
    if (this.dropRecord) {
        if (this.dropRecord.lastRecord) {
            if (!sf.toolBar.undoButton.isVisible) {
                sf.toolBar.undoButton.show();
            }
        } else {
            if (sf.toolBar.undoButton.isVisible) {
                sf.toolBar.undoButton.hide();
            }
        }
        if (this.dropRecord.nextRecord) {
            if (!sf.toolBar.redoButton.isVisible) {
                sf.toolBar.redoButton.show();
                sf.toolBar.undoButton.mouseLeave();
            }
        } else {
            if (sf.toolBar.redoButton.isVisible) {
                sf.toolBar.redoButton.hide();
            }
        }
    }
	if (detect(
			sf.toolBar.children,
            each => each.isVisible
    )) {
	    sf.toolBar.fixLayout();
	    sf.adjustToolBar();
	}
    if (this.parentThatIsA(NormalWindowMorph) instanceof NormalWindowMorph
    ) {sf.toolBar.undoButton.hide(); sf.toolBar.redoButton.hide();};
};

// ScriptsMorph sorting blocks and comments

ScriptsMorph.prototype.sortedElements = function () {
    // return all scripts and unattached comments
    var scripts = this.children.filter(each =>
        each instanceof CommentMorph ? !each.block : true
    );
    scripts.sort((a, b) =>
        // make sure the prototype hat block always stays on top
        a instanceof PrototypeHatBlockMorph ? 0 : a.top() - b.top()
    );
    return scripts;
};

// ScriptsMorph blocks layout fix

ScriptsMorph.prototype.fixMultiArgs = function () {
    this.forAllChildren(morph => {
        if (morph instanceof MultiArgMorph) {
            morph.fixLayout();
        }
    });
};

// ScriptsMorph drag & drop:

ScriptsMorph.prototype.wantsDropOf = function (aMorph) {
    // override the inherited method
    if ((aMorph instanceof HatBlockMorph) || (aMorph instanceof DefinitorBlockMorph)) {
        return !this.rejectsHats;
    }
    return aMorph instanceof SyntaxElementMorph ||
        aMorph instanceof CommentMorph;
};

ScriptsMorph.prototype.reactToDropOf = function (droppedMorph, hand) {
    if (droppedMorph instanceof BlockMorph ||
            droppedMorph instanceof CommentMorph) {
        droppedMorph.snap(hand);
    };  this.adjustBounds();
};

// ScriptsMorph events

ScriptsMorph.prototype.mouseClickLeft = function (pos) {
    var shiftClicked = world.currentKey === 16;
    if (shiftClicked) {
        return this.edit(pos);
    };  if (this.focus) {this.focus.stopEditing();};
};

ScriptsMorph.prototype.selectForEdit = function () {
    var ide = this.parentThatIsA(IDE_Morph),
        rcvr = ide ? ide.currentSprite : null;
    if (rcvr && rcvr.inheritsAttribute('scripts')) {
        // copy on write:
        this.feedbackMorph.destroy();
        rcvr.shadowAttribute('scripts');
        return rcvr.scripts;
    };  return this;};

// ScriptsMorph keyboard support

ScriptsMorph.prototype.edit = function (pos) {var target; if (
this.focus) {this.focus.stopEditing();}; world.stopEditing();
if (!ScriptsMorph.prototype.enableKeyboard) {return;}; (target
) = this.selectForEdit(); target.focus = new ScriptFocusMorph(
target, target, pos); target.focus.getFocus(world);};

ScriptsMorph.prototype.toggleKeyboardEntry = function () {
	// when the user clicks the keyboard button in the toolbar
    var target, sorted;
    if (this.focus) {
    	this.focus.stopEditing();
        return;};  world.stopEditing();
    if (ScriptsMorph.prototype.enableKeyboard) {
    target = this.selectForEdit(); // enable copy-on-edit
    target.focus = new ScriptFocusMorph(target, target, target.position());
    target.focus.getFocus(world);
    sorted = target.focus.sortedScripts();
    if (sorted.length) {
        target.focus.element = sorted[0];
        if (target.focus.element instanceof HatBlockMorph) {
            target.focus.nextCommand();
        }
    } else {
        target.focus.moveBy(new Point(50, 50));
    }
    target.focus.fixLayout();
    };
};

// ScriptsMorph context - scripts target

ScriptsMorph.prototype.scriptTarget = function () {
    // answer the sprite or stage that this script editor acts on,
    // if the user clicks on a block.
    // NOTE: since scripts can be shared by more than a single sprite
    // this method only gives the desired result within the context of
    // the user actively clicking on a block inside the IDE
    // there is no direct relationship between a block or a scripts editor
    //  and a sprite.
    var editor = this.parentThatIsA(IDE_Morph);
    if (editor) {
        return editor.currentSprite;
    };
    editor = this.parentThatIsA(NormalWindowMorph);
    if (editor) {return editor.ui.sprite;};
    editor = this.parentThatIsA(BlockEditorMorph);
    if (editor) {
        return editor.target;
    };  throw new Error('script target cannot be found for orphaned scripts');};

// ArgMorph //////////////////////////////////////////////////////////

/*
    I am a syntax element and the ancestor of all block inputs.
    I am present in block labels.
    Usually I am just a receptacle for inherited methods and attributes,
    however, if my 'type' attribute is set to one of the following
    values, I act as an iconic slot myself:

        'list'      - a list symbol
        'object'    - a turtle symbol
*/

// ArgMorph inherits from SyntaxElementMorph:

ArgMorph.prototype = new SyntaxElementMorph;
ArgMorph.prototype.constructor = ArgMorph;
ArgMorph.uber = SyntaxElementMorph.prototype;

// ArgMorph instance creation:

function ArgMorph(type) {this.init(type);};

ArgMorph.prototype.init = function (type) {
this.type = type || null; this.icon = null;
ArgMorph.uber.init.call(this); (this.color
) = new Color(0, 17, 173); this.createIcon(
); if (type === 'list') {this.alpha = 1;};
this.shouldRerender = true;};

// ArgMorph preferences settings:

ArgMorph.prototype.executeOnSliderEdit = false;

// ArgMorph events:

ArgMorph.prototype.reactToSliderEdit = function () {
/*
    directly execute the stack of blocks I'm part of if my
    "executeOnSliderEdit" setting is turned on, obeying the stage's
    thread safety setting. This feature allows for "Bret Victor" style
    interactive coding.
*/
    var block, top, receiver, stage;
    if (!this.executeOnSliderEdit) {return; }
    block = this.parentThatIsA(BlockMorph);
    if (block) {
        top = block.topBlock();
        receiver = top.scriptTarget();
        if (top instanceof PrototypeHatBlockMorph) {
            return;
        };  if (receiver) {
            stage = receiver.parentThatIsA(StageMorph);
            if (stage && (stage.isThreadSafe ||
                    Process.prototype.enableSingleStepping)) {
                stage.threads.startProcess(top, receiver, stage.isThreadSafe);
            } else {
                top.mouseClickLeft();
            };
        };
    };};

// ArgMorph drag & drop: for demo puposes only

ArgMorph.prototype.justDropped = function (
) {if (!(this instanceof CommandSlotMorph)
) {this.fixLayout(); this.rerender();};};

// ArgMorph spec extrapolation (for demo purposes)

ArgMorph.prototype.getSpec = (() => '%s');

// ArgMorph menu

ArgMorph.prototype.userMenu = function () {
    var sm = this.slotMenu(),
        menu;
    if (!sm && !(this.parent instanceof MultiArgMorph)) {
        return this.parent.userMenu();
    };  menu = sm || new MenuMorph(this);
    if (this.parent instanceof MultiArgMorph &&
            this.parentThatIsA(ScriptsMorph)) {
        if (!this.parent.maxInputs ||
                (this.parent.inputs().length < this.parent.maxInputs)) {
            menu.addItem(
                'insert a slot',
                () => this.parent.insertNewInputBefore(this)
            );
        };  if (this.parent.inputs().length > this.parent.minInputs) {
            menu.addItem(
                'delete slot',
                () => this.parent.deleteSlot(this)
            );
        };
    };  return menu;};

ArgMorph.prototype.slotMenu = function () {return null;};

// ArgMorph drawing

ArgMorph.prototype.createIcon = function () {switch (this.type) {case 'costume': this.icon = this.labelPart('%wardrobe'); this.add(this.icon); break; case 'sound':
this.icon = this.labelPart('%notes'); this.add(this.icon); break; case 'object': this.icon = this.labelPart('%turtleOutline'); this.add(this.icon); break; case 'list':
this.icon = this.labelPart('%list'); this.add(this.icon); break; case 'unknown': this.icon = this.labelPart('%unknown'); this.add(this.icon); break; default: nop();};};

ArgMorph.prototype.fixLayout = function () {
if (this.icon) {this.icon.setPosition((this
).position()); this.bounds.setExtent(((this
).icon).extent());} else {(ArgMorph
).uber.fixLayout.call(this);};};

ArgMorph.prototype.childChanged = BlockMorph.prototype.childChanged;

ArgMorph.prototype.render = BlockMorph.prototype.render;

ArgMorph.prototype.backupRender = function (ctx) {
var block; if (this.icon) {block = this.parentThatIsA(
BlockMorph); if (block) {this.icon.shadowColor = (
block.color).darker(this.labelContrast);}; if (
this.type === 'list') {this.color = new Color(255,
140, 0); ArgMorph.uber.render.call(this, ctx);};};};

// ArgMorph evaluation

ArgMorph.prototype.evaluate = function () {
return ((this.type === 'list') ? new List : null);};

ArgMorph.prototype.isEmptySlot = function () {return !isNil(this.type);};

// BlockSlotMorph //////////////////////////////////////////////////////

/*
    I am an all-block input slot, because I can support all block types:
    commands, reporters, predicates, hats, definitors, jaggeds, etc. I'm
    from the Scratch 1.4 mod called "Dream". I'm an all-block input slot.

    My command spec is %instr

    evaluate() returns my block child or null
*/

// BlockSlotMorph inherits form SyntaxElementMorph:

BlockSlotMorph.prototype = new SyntaxElementMorph; BlockSlotMorph.prototype.constructor = BlockSlotMorph; BlockSlotMorph.uber = SyntaxElementMorph.prototype; function BlockSlotMorph (
) {this.init();}; BlockSlotMorph.prototype.init = function () {this.touchingMouse = false; BlockSlotMorph.uber.init.call(this); this.fixLayout(); this.cursorStyle = 'default';};
BlockSlotMorph.prototype.render = function (ctx) {var borderColor; if (this.parent) {borderColor = this.parent.color.darker();} else {borderColor = new Color(120, 120, 120);}; if (
this.touchingMouse && (world.hand.children[0] instanceof BlockMorph)) {borderColor = borderColor.copy(); borderColor = borderColor.lighter();}; this.cachedClr = borderColor.toString(
); this.cachedClrBright = borderColor.lighter(this.contrast).toString(); var h = this.height(), w = this.width(); this.cachedClrDark = borderColor.darker(this.contrast).toString();
ctx.fillStyle = this.cachedClr; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w,0); ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.lineTo(0,0); ctx.fill(); if (!(MorphicPreferences.isFlat)) {
ctx.strokeStyle = (new Color(64, 64, 64)).toString(); ctx.lineWidth = this.scale; ctx.lineCap = 'square'; ctx.lineJoin = 'miter'; ctx.lineTo(w,0); ctx.lineTo(w,h); ctx.lineTo(0,
h); ctx.lineTo(0,0); ctx.stroke();}; ctx.closePath();}; BlockSlotMorph.prototype.fixLayout = function () {var myBlock = this.children[0]; if (myBlock instanceof BlockMorph) {
this.bounds.setExtent(myBlock.bounds.extent().add(this.edge * 2 + this.rfBorder * 2));} else {this.bounds.setExtent(new Point((40 * this.edge), (20 * this.edge)));}; if (
this.parent instanceof Morph) {this.parent.fixLayout();};}; BlockSlotMorph.prototype.step = nop; BlockSlotMorph.prototype.wantsDropOf = function (aMorph) {if ((aMorph
) instanceof BlockMorph) {if (aMorph.parent === world.hand) {if (this.snapSound) {this.snapSound.play();};}; return true;} else {return false;};}; (BlockSlotMorph
).prototype.reactToDropOf = function (aMorph) {if (aMorph instanceof BlockMorph) {this.add(aMorph); aMorph.fixBlockColor(); this.fixLayout(); aMorph.setCenter(
this.bounds.center()); if (this.parent instanceof Morph) {this.parent.fixLayout();};};}; BlockSlotMorph.prototype.evaluate = function () {var myBlock = (this
).children[0]; return ((myBlock instanceof BlockMorph) ? myBlock : null);}; BlockSlotMorph.prototype.getSpec = (() => '%instr'); (BlockSlotMorph.prototype
).mouseEnter = function () {this.touchingMouse = true; this.rerender();}; BlockSlotMorph.prototype.mouseLeave = function () {this.touchingMouse = false;
this.rerender();}; BlockSlotMorph.prototype.reactToGrabOf = function () {if (this.parent instanceof SyntaxElementMorph) {if (!((this.evaluate()
) instanceof BlockMorph)) {this.parent.revertToDefaultInput(this);};}; this.rerender();}; /* Included the flat design mode for this. */

// CommandSlotMorph ////////////////////////////////////////////////////

/*
    I am a CommandBlock-shaped input slot. I can nest command blocks
    and also accept    reporters (containing reified scripts).

    my most important accessor is

    nestedBlock()    - answer the command block I encompass, if any

    My command spec is %cmd

    evaluate() returns my nested block or null
*/

// CommandSlotMorph inherits from ArgMorph:

CommandSlotMorph.prototype = new ArgMorph;
CommandSlotMorph.prototype.constructor = CommandSlotMorph;
CommandSlotMorph.uber = ArgMorph.prototype;

// CommandSlotMorph instance creation:

function CommandSlotMorph () {this.init();};

CommandSlotMorph.prototype.init = function () {
this.fillingColor = this.rfColor.lighter().lighter(10);
this.borderColor = BLACK; CommandSlotMorph.uber.init.call(
this); this.fixLayout(); this.setColor(this.fillerColor
); this.cursorStyle = 'default'; this.cachedClr = (
this.fillingColor).toString();}; (CommandSlotMorph
).prototype.getSpec = (() => '%cmd');

// CommandSlotMorph enumerating:

CommandSlotMorph.prototype.topBlock = function () {
    if (this.parent.topBlock) {
        return this.parent.topBlock();
    };  return this.nestedBlock();
};

// CommandSlotMorph nesting:

CommandSlotMorph.prototype.nestedBlock = function (block) {
    if (block) {
        var nb = this.nestedBlock();
        this.add(block);
        if (nb) {
            block.bottomBlock().nextBlock(nb);
        };  this.fixLayout();
    } else {
        return detect(
            this.children,
            child => child instanceof CommandBlockMorph
        );
    };
};

// CommandSlotMorph attach targets:

CommandSlotMorph.prototype.slotAttachPoint = function () {
    return new Point(
        this.dentCenter(),
        this.top() + this.corner * 2
    );
};

CommandSlotMorph.prototype.dentLeft = function () {
    return this.left()
        + this.corner
        + this.inset * 2;
};

CommandSlotMorph.prototype.dentCenter = function () {
    return this.dentLeft()
        + this.corner
        + (this.dent / 2);
};

CommandSlotMorph.prototype.attachTargets = function () {
    var answer = [];
    answer.push({
        point: this.slotAttachPoint(),
        element: this,
        loc: 'bottom',
        type: 'slot'
    }); return answer;
};

// CommandSlotMorph layout:

CommandSlotMorph.prototype.fixLayout = function (
    ) {var nb = this.nestedBlock();
    if (this.borderColor && this.parent) {
        if (!this.borderColor.eq(this.parent.color
        )) {this.borderColor = this.parent.color;};
    };  if (nb) {
        nb.setPosition(
           new Point(
                this.left() + this.edge + this.rfBorder,
                this.top() + this.edge + this.rfBorder
           )
        ); this.bounds.setWidth(nb.fullBounds().width(
           ) + (this.edge + this.rfBorder) * 2);
        this.bounds.setHeight(nb.fullBounds().height()
            + this.edge + (this.rfBorder * 2) - (
            this.corner - this.edge));
    } else {var shrink = ((this.rfBorder * 2) + (
        this.edge * 2)); this.bounds.setExtent((new Point(
        (this.fontSize + this.edge * 2) * 2 - shrink,
        this.fontSize + this.edge * 2 - shrink
    )).add(this.edge * 2 + this.rfBorder * 2
    ));}; if (this.parent && (
          this.parent.fixLayout)) {
          this.parent.fixLayout();
    };
};

// CommandSlotMorph evaluating:

CommandSlotMorph.prototype.evaluate = (
function () {return this.nestedBlock();});

CommandSlotMorph.prototype.isEmptySlot = function () {
return (!(this.isStatic) && isNil(this.evaluate()));};

// CommandSlotMorph context menu ops

CommandSlotMorph.prototype.attach = function () {
    // for context menu demo and testing purposes
    // override inherited version to adjust new owner's layout
    var choices = this.overlappedMorphs(),
        menu = new MenuMorph(this, 'choose new parent:');

    choices.forEach(each =>
        menu.addItem(
            each.toString().slice(0, 50),
            () => {
                each.add(this);
                this.isDraggable = false;
                if (each.fixLayout) {
                    each.fixLayout();
                };
            }
        )
    );  if (choices.length > 0) {
    menu.popUpAtHand(world);};};

// CommandSlotMorph drawing:

CommandSlotMorph.prototype.backupRender = function (ctx) {this.cachedClrBright = (
((this.borderColor).lighter(this.contrast)).withAlpha(1/2)).toString(); (this
).cachedClrDark = (((this.borderColor).darker(this.contrast)).withAlpha(1/2)
).toString(); var gradient = ctx.createLinearGradient(0, 0, 0, this.height());
if (!(MorphicPreferences.isFlat)) {gradient.addColorStop(0, (this.fillingColor
).toString()); gradient.addColorStop(1, (this.fillingColor.darker()).toString(
)); ctx.fillStyle = gradient; this.drawFlat(ctx); this.drawEdges(ctx);
} else {ctx.fillStyle = this.cachedClr; this.drawFlat(ctx);};};

CommandSlotMorph.prototype.drawFlat = function (
    ctx) {var isFilled = !isNil(this.nestedBlock()),
        ins = (isFilled ? this.inset : this.inset / 2),
        dent = (isFilled ? this.dent : this.dent / 2),
        edge = this.edge, indent = (this.corner * 2
        ) + ins, rf = (isFilled ? this.rfBorder : 0),
        filledForCornedEdge = (this.corner + edge + (
        (isFilled * (this.rfBorder > 0)) * edge * 3/2
        )), cornerWithFilling = this.corner + (
        isFilled * edge * 3/2); ctx.beginPath();

    // top left:
    ctx.arc(
        filledForCornedEdge,
        filledForCornedEdge,
        cornerWithFilling,
        -Math.PI,
        -Math.PI / 2,
        false);  // dent:
    ctx.lineTo(this.corner + ins + edge + rf * 2, edge);
    ctx.lineTo(indent + edge + rf * 2, this.corner + edge);
    ctx.lineTo(
        indent + edge + rf * 2 + (dent - rf * 2),
        this.corner + edge
    );  ctx.lineTo(
        indent + edge + rf * 2 + (dent - rf * 2) + this.corner,
        edge
    );  ctx.lineTo(this.width() - this.corner - edge, edge);

    // top right:
    ctx.arc(
        this.width() - filledForCornedEdge,
        filledForCornedEdge,
        cornerWithFilling,
        -Math.PI / 2, 0,
        false);  // bottom right:
    ctx.arc(
        this.width() - filledForCornedEdge,
        this.height() - filledForCornedEdge,
        cornerWithFilling, 0, Math.PI / 2,
        false);  // bottom left:
    ctx.arc(
        filledForCornedEdge,
        this.height() - filledForCornedEdge,
        cornerWithFilling, Math.PI / 2,
        Math.PI, false);  ctx.closePath(); ctx.fill();};

CommandSlotMorph.prototype.drawEdges = function (ctx
     ) {var isFilled = !isNil(this.nestedBlock()),
        ins = (isFilled ? this.inset : this.inset / 2),
        dent = (isFilled ? this.dent : this.dent / 2),
        indent = this.corner * 2 + ins, edge = (this
        ).edge, shift = this.edge / 2, filledForCornedEdge = (
        this.corner + edge + ((isFilled * (this.rfBorder > 0
        )) * edge * 3/2)), rf = (isFilled ? this.rfBorder : 0),
        shift = this.edge / 2, cornerWithFilling = Math.max(
        (this.corner + shift + ((isFilled * ((this.rfBorder
        ) > 0)) * edge * 3/2)), 0); ctx.lineWidth = this.edge;
        ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
        ctx.strokeStyle = this.cachedClrBright;
        ctx.beginPath();  ctx.moveTo(
        this.width() - shift, (edge * 2) + this.corner
    );  ctx.lineTo(this.width() - shift,
        this.height() - filledForCornedEdge
    );  ctx.arc(this.width() - filledForCornedEdge,
        this.height() - filledForCornedEdge,
        cornerWithFilling, 0,
        Math.PI / 2,  false);
    ctx.lineTo(filledForCornedEdge,
    this.height() - shift); ctx.stroke();

    if (useBlurredShadows) {
        ctx.shadowOffsetY = shift;
        ctx.shadowBlur = edge;
        ctx.shadowColor = "black";
    };  ctx.strokeStyle = this.cachedClrDark;

    ctx.beginPath(); ctx.moveTo(shift, (this
    ).height() - filledForCornedEdge); ctx.arc(
        filledForCornedEdge,
        filledForCornedEdge,
        cornerWithFilling,
        -Math.PI, -Math.PI / 2,  false
    ); ctx.lineTo((this.corner + ins) + (
    edge + rf * 2), shift); ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(indent + edge + rf * 2,
    this.corner + shift);  ctx.lineTo(
        indent + edge + rf * 2 + (dent - rf * 2),
        this.corner + shift
    );  ctx.lineTo(
        indent + edge + rf * 2 + (dent - rf * 2
        ) + this.corner, shift
    );  ctx.lineTo(this.width(
    ) - filledForCornedEdge, shift); ctx.stroke();};

// RingCommandSlotMorph ///////////////////////////////////////////////////

/*
    I am a CommandBlock-shaped input slot for use in RingMorphs.
    I can only nest command blocks, not reporters.

    My command spec is %rc

    evaluate() returns my nested block or null
    (inherited from CommandSlotMorph)
*/

// RingCommandSlotMorph inherits from CommandSlotMorph:

RingCommandSlotMorph.prototype = new CommandSlotMorph;
RingCommandSlotMorph.prototype.constructor = RingCommandSlotMorph;
RingCommandSlotMorph.uber = CommandSlotMorph.prototype;

// RingCommandSlotMorph preferences settings

RingCommandSlotMorph.prototype.rfBorder = 0;

// RingCommandSlotMorph instance creation:

function RingCommandSlotMorph () {this.init();};

RingCommandSlotMorph.prototype.init = function (
)  {RingCommandSlotMorph.uber.init.call(this);
    this.fillingColor = CLEAR; (this.cachedClr
    ) = (this.fillingColor).toString(); (this
    ).contrast = RingMorph.prototype.contrast;
    this.setColor(this.fillerColor);
    this.rerender();};

RingCommandSlotMorph.prototype.getSpec = (() => '%rc');

// RingCommandSlotMorph drawing:

RingCommandSlotMorph.prototype.backupRender = function (ctx) {(this
).cachedClrBright = (((this.borderColor).lighter(this.contrast
)).withAlpha(1/2)).toString(); this.cachedClrDark = ((((this
).borderColor).darker(this.contrast)).withAlpha(1/2)).toString(
); ctx.fillStyle = this.cachedClr; this.drawFlat(ctx); if (
!(MorphicPreferences.isFlat)) {this.drawEdges(ctx);};};

RingCommandSlotMorph.prototype.fixHolesLayout = function (
) {var edge = this.edge; this.holes = [new Rectangle(edge,
edge, (this.width() - edge), (this.height() - edge))];};

RingCommandSlotMorph.prototype.outlinePath = function (
    ctx, offset) {var ox = offset.x, oy = offset.y,
        isFilled = !isNil(this.nestedBlock()),
        ins = this.inset / (2 - isFilled),
        dent = this.dent / (2 - isFilled),
        indent = this.corner * 2 + ins,
        edge = this.edge,
        w = this.width(),
        h = this.height(),
        rf = (isFilled ? this.rfBorder : 0),
        y = h - this.corner - edge;

    ctx.arc(
        this.corner + edge + ox,
        this.corner + edge + oy,
        this.corner, -(Math.PI),
        Math.PI / -2, false);

    // dent:
    ctx.lineTo(this.corner + ins + edge + rf * 2 + ox, edge + oy);
    ctx.lineTo(indent + edge + rf * 2 + ox, this.corner + edge + oy);
    ctx.lineTo(
        indent + edge  + rf * 2 + (dent - rf * 2) + ox,
        this.corner + edge + oy
    );  ctx.lineTo(
        indent + edge  + rf * 2 + (dent - rf * 2) + this.corner + ox,
        edge + oy
    );  ctx.lineTo(this.width() - this.corner - edge + ox, edge + oy);

    ctx.arc(
        w - this.corner - edge + ox,
        this.corner + edge + oy,
        this.corner,
        (Math.PI / -2),
        0, false
    );  ctx.arc(
        this.width() - this.corner - edge + ox,
        y + oy,
        this.corner,
        0, (Math.PI / 2),
        false
    );  ctx.arc(
        this.corner + edge + ox,
        y + oy,
        this.corner,
        (Math.PI / 2),
        Math.PI,
        false
    );  ctx.lineTo(
        this.corner + edge + ox - this.corner,
        this.corner + edge + oy
    );};

// CSlotMorph ////////////////////////////////////////////////////

/*
    I am a C-shaped input slot. I can nest command blocks and also accept
    reporters (containing reified scripts).

    my most important accessor is

    nestedBlock()    - the command block I encompass, if any (inherited)

    My command spec is %c

    evaluate() returns my nested block or null
*/

// CSlotMorph inherits from CommandSlotMorph:

CSlotMorph.prototype = new CommandSlotMorph;
CSlotMorph.prototype.constructor = CSlotMorph;
CSlotMorph.uber = CommandSlotMorph.prototype;

// CSlotMorph instance creation:

function CSlotMorph () {this.init();};
CSlotMorph.prototype.init = function (
) {CommandSlotMorph.uber.init.call(this);
this.isLambda = false; this.isLoop = (false
); this.color = BLACK; this.fixLayout();};

CSlotMorph.prototype.getSpec = function (
) {return this.isLoop ? '%loop' : '%c';};

CSlotMorph.prototype.mappedCode = function (definitions) {
    var code = StageMorph.prototype.codeMappings.reify || '<#1>',
        codeLines = code.split('\n'), nested = this.nestedBlock(
        ), part = (nested ? nested.mappedCode(definitions
        ) : ''), partLines = (part.toString()).split('\n'
        ), rx = new RegExp('<#1>', 'g');

    codeLines.forEach((codeLine, idx
        ) => {var prefix = '', indent;
        if (codeLine.trimLeft().indexOf('<#1>') === 0) {
            indent = codeLine.indexOf('<#1>');
            prefix = codeLine.slice(0, indent);
        };  codeLines[idx] = codeLine.replace(
            new RegExp('<#1>'),
            partLines.join('\n' + prefix)
        );  codeLines[idx] = codeLines[idx
        ].replace(rx, partLines.join('\n'));
        }); return codeLines.join('\n');};

// CSlotMorph layout:

CSlotMorph.prototype.fixLayout = function () {
    var nb = this.nestedBlock();  if (nb) {
        nb.setPosition(
            new Point(
                this.left() + this.inset,
                this.top() + this.corner
            )
        );  this.bounds.setHeight(nb.fullBounds(
        ).height() + this.corner);   this.bounds.setWidth(
            nb.fullBounds().width() + (this.cSlotPadding * 2)
        );
    } else {var shrink = ((this.rfBorder * 2) + (
        this.edge * 2)); this.bounds.setExtent((new Point(
        (this.fontSize + this.edge * 2) * 2 - shrink,
        this.fontSize + this.edge * 2 - shrink + this.cSlotPadding
    )).add(this.edge * 2 + this.rfBorder * 2));};
    if (this.parent && this.parent.fixLayout
    ) {this.parent.fixLayout();};};

CSlotMorph.prototype.fixLoopLayout = function () {var loop;
if (this.isLoop) {loop = this.loop(); if (loop) {(loop
).setRight(this.right() - this.corner); loop.setBottom(
this.bottom() + this.cSlotPadding + this.edge);};};};

CSlotMorph.prototype.loop = function () {if ((this
).isLoop) {return detect(this.children, (child => (
child instanceof SymbolMorph)));}; return null;};

CSlotMorph.prototype.isLocked = function () {return ((
this.isStatic) || (this.parent instanceof MultiArgMorph
));}; CSlotMorph.prototype.fixHolesLayout = function (
) {this.holes = [new Rectangle(this.inset, this.corner,
this.width(), (this.height() - this.corner))];};

// CSlotMorph drawing:

CSlotMorph.prototype.backupRender = function (ctx) {
    if (this.parent instanceof SyntaxElementMorph) {
    this.color = this.parent.color;}; this.cachedClr = (
    this.color).toString(); this.cachedClrBright = (((
    this.color).lighter(this.contrast)).withAlpha((1 + (
    MorphicPreferences).isFlat) / 2)).toString(); (this
    ).cachedClrDark = (((this.color).darker(this.contrast
    )).withAlpha((1 + (MorphicPreferences).isFlat) / 2)
    ).toString(); ctx.fillStyle = this.cachedClr;

    // only add 3D-Effect here, rendering of the flat shape happens at the
    // encompassing block level
    if (!MorphicPreferences.isFlat) {this.drawEdges(ctx);};
    
};

CSlotMorph.prototype.drawEdges = function (
ctx) {var shift = this.edge / 2, x = (this
).width() - this.corner, y = 0, indent = (
x + this.corner * 2 + this.inset); (ctx
).lineWidth = this.edge; ctx.lineJoin = (
'round'); ctx.lineCap = 'butt'; (ctx
).strokeStyle = this.cachedClrDark; (
ctx).beginPath(); ctx.arc(x, y, (this
).corner - shift, radians(0), radians(
90));  x = this.inset; y = this.corner;
ctx.lineTo(x + (this.corner * 3) + (
this.inset + this.dent), y - shift);
ctx.lineTo(x + this.inset + ((this
).corner * 2) + this.dent, y + (
this.corner - shift)); ctx.lineTo(
x + this.inset + (this.corner * 2),
y + this.corner - shift); ctx.stroke(
); ctx.beginPath(); ctx.moveTo(x + (this
).corner + this.inset - shift, y - shift
); ctx.arc(this.corner + this.inset,
this.corner * 2, this.corner + shift,
radians(270), Math.PI, true); ctx.lineTo(
x - shift, this.height() - this.corner * 2
); ctx.stroke(); ctx.strokeStyle = (this
).cachedClrBright; ctx.beginPath(); ctx.arc(
this.corner + this.inset, this.height() - (
this.corner * 2), this.corner + shift,
Math.PI, Math.PI / 2, true); ctx.lineTo(
this.width() - this.corner, this.height(
) - this.corner + shift); ctx.stroke();};

CSlotMorph.prototype.outlinePath = function (ctx,
inset, offset) {var ox = offset.x,  oy = (offset
).y, radius = Math.max(this.corner - inset, 0);

    // top corner:
    ctx.lineTo(this.width() + ox - inset, oy);

    // top right:
    ctx.arc(
        this.width() - this.corner + ox,
        oy,
        radius,
        radians(90),
        radians(0),
        true
    );

    // jigsaw shape:
    ctx.lineTo(
        this.width() - this.corner + ox,
        this.corner + oy - inset
    );
    ctx.lineTo(
        (this.inset * 2) + (this.corner * 3) + this.dent + ox,
        this.corner + oy - inset
    );
    ctx.lineTo(
        (this.inset * 2) + (this.corner * 2) + this.dent + ox,
        this.corner * 2 + oy - inset
    );
    ctx.lineTo(
        (this.inset * 2) + (this.corner * 2) + ox,
        this.corner * 2 + oy - inset
    );
    ctx.lineTo(
        (this.inset * 2) + this.corner + ox,
        this.corner + oy - inset
    );
    ctx.lineTo(
        this.inset + this.corner + ox,
        this.corner + oy - inset
    );
    ctx.arc(
        this.inset + this.corner + ox,
        this.corner * 2 + oy,
        this.corner + inset,
        radians(270),
        radians(180),
        true
    );

    // bottom:
    ctx.lineTo(
        this.inset + ox - inset,
        this.height() - (this.corner * 2) + oy
    );
    ctx.arc(
        this.inset + this.corner  + ox,
        this.height() - (this.corner * 2) + oy,
        this.corner + inset,
        radians(180),
        radians(90),
        true
    );
    ctx.lineTo(
        this.width() - this.corner + ox,
        this.height() - this.corner + oy + inset
    );
    ctx.arc(
        this.width() - this.corner + ox,
        this.height() + oy,
        radius,
        radians(-90),
        radians(-0),
        false
    );
};

CSlotMorph.prototype.drawTopRightEdge = function (ctx) {
    var shift = this.edge / 2,
        x = this.width() - this.corner,
        y = 0,
        gradient;

    gradient = ctx.createRadialGradient(
        x,
        y,
        this.corner,
        x,
        y,
        this.corner - this.edge
    );
    gradient.addColorStop(0, this.cachedClrDark);
    gradient.addColorStop(1, this.cachedClr);

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.strokeStyle = gradient;

    ctx.beginPath();
    ctx.arc(
        x,
        y,
        this.corner - shift,
        radians(90),
        radians(0),
        true
    );
    ctx.stroke();
};

CSlotMorph.prototype.drawTopEdge = function (ctx, x, y) {
    var shift = this.edge / 2,
        indent = x + this.corner * 2 + this.inset,
        upperGradient,
        lowerGradient,
        rightGradient;

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    upperGradient = ctx.createLinearGradient(
        0,
        y - this.edge,
        0,
        y
    );
    upperGradient.addColorStop(0, this.cachedClr);
    upperGradient.addColorStop(1, this.cachedClrDark);

    ctx.strokeStyle = upperGradient;
    ctx.beginPath();
    ctx.moveTo(x + this.corner, y - shift);
    ctx.lineTo(x + this.corner + this.inset - shift, y - shift);
    ctx.stroke();

    lowerGradient = ctx.createLinearGradient(
        0,
        y + this.corner - this.edge,
        0,
        y + this.corner
    );
    lowerGradient.addColorStop(0, this.cachedClr);
    lowerGradient.addColorStop(1, this.cachedClrDark);

    ctx.strokeStyle = lowerGradient;
    ctx.beginPath();
    ctx.moveTo(indent + shift, y + this.corner - shift);
    ctx.lineTo(indent + this.dent, y + this.corner - shift);
    ctx.stroke();

    rightGradient = ctx.createLinearGradient(
        (x + this.inset + (this.corner * 2) + this.dent) - shift,
        (y + this.corner - shift) - shift,
        (x + this.inset + (this.corner * 2) + this.dent) + (shift * 0.7),
        (y + this.corner - shift) + (shift * 0.7)
    );
    rightGradient.addColorStop(0, this.cachedClr);
    rightGradient.addColorStop(1, this.cachedClrDark);


    ctx.strokeStyle = rightGradient;
    ctx.beginPath();
    ctx.moveTo(
        x + this.inset + (this.corner * 2) + this.dent,
        y + this.corner - shift
    );
    ctx.lineTo(
        x + this.corner * 3 + this.inset + this.dent,
        y - shift
    );
    ctx.stroke();

    ctx.strokeStyle = upperGradient;
    ctx.beginPath();
    ctx.moveTo(
        x + this.corner * 3 + this.inset + this.dent,
        y - shift
    );
    ctx.lineTo(this.width() - this.corner, y - shift);
    ctx.stroke();
};

CSlotMorph.prototype.drawTopLeftEdge = function (ctx) {
    var shift = this.edge / 2,
        gradient;

    gradient = ctx.createRadialGradient(
        this.corner + this.inset,
        this.corner * 2,
        this.corner,
        this.corner + this.inset,
        this.corner * 2,
        this.corner + this.edge
    );
    gradient.addColorStop(0, this.cachedClrDark);
    gradient.addColorStop(1, this.cachedClr);

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.strokeStyle = gradient;

    ctx.beginPath();
    ctx.arc(
        this.corner + this.inset,
        this.corner * 2,
        this.corner + shift,
        radians(-180),
        radians(-90),
        false
    );
    ctx.stroke();
};

CSlotMorph.prototype.drawRightEdge = function (ctx) {
    var shift = this.edge / 2,
        x = this.inset,
        gradient;

    gradient = ctx.createLinearGradient(x - this.edge, 0, x, 0);
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x - shift, this.corner * 2);
    ctx.lineTo(x - shift, this.height() - this.corner * 2);
    ctx.stroke();
};

CSlotMorph.prototype.drawBottomEdge = function (ctx) {
    var shift = this.edge / 2,
        gradient,
        upperGradient;

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    upperGradient = ctx.createRadialGradient(
        this.corner + this.inset,
        this.height() - (this.corner * 2),
        this.corner, /*- this.edge*/ // uncomment for half-tone
        this.corner + this.inset,
        this.height() - (this.corner * 2),
        this.corner + this.edge
    );
    upperGradient.addColorStop(0, this.cachedClrBright);
    upperGradient.addColorStop(1, this.cachedClr);
    ctx.strokeStyle = upperGradient;
    ctx.beginPath();
    ctx.arc(
        this.corner + this.inset,
        this.height() - (this.corner * 2),
        this.corner + shift,
        radians(180),
        radians(90),
        true
    );
    ctx.stroke();

    gradient = ctx.createLinearGradient(
        0,
        this.height() - this.corner,
        0,
        this.height() - this.corner + this.edge
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);

    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(
        this.inset + this.corner,
        this.height() - this.corner + shift
    );
    ctx.lineTo(
        this.width() - this.corner,
        this.height() - this.corner + shift
    );

    ctx.stroke();
};

// InputSlotMorph //////////////////////////////////////////////////////

/*
    I am an editable text input slot. I can be either rectangular or
    rounded, and can have an optional drop-down menu. If I'm set to
    read-only I must have a drop-down menu and will assume a darker
    shade of my parent's color.

    my most important public attributes and accessors are:

    setContents(str/float)    - display the argument (string or float)
    contents().text           - get the displayed string
    choices                   - a key/value list for my optional drop-down
    isReadOnly                - governs whether I am editable or not
    isNumeric                 - governs my outer shape (round or rect)

    my block specs are:

    %s        - string input, rectangular
    %n        - numerical input, semi-circular vertical edges
    %anyUE    - any unevaluated

    evaluate() returns my displayed string, cast to float if I'm numerical

    there are also a number of specialized drop-down menu presets, refer
    to BlockMorph for details.
*/

// InputSlotMorph inherits from ArgMorph:

InputSlotMorph.prototype = new ArgMorph;
InputSlotMorph.prototype.constructor = InputSlotMorph;
InputSlotMorph.uber = ArgMorph.prototype;

// InputSlotMorph instance creation:

function InputSlotMorph(text, isNumeric,
choiceDict, isReadOnly) {this.init(text,
isNumeric, choiceDict, isReadOnly);};

InputSlotMorph.prototype.init = function (
text, isNumeric, choiceDict, isReadOnly) {
var contents = new InputSlotStringMorph(
''), arrow = new ArrowMorph('down', 0,
Math.max(Math.floor(this.fontSize / 6),
1), BLACK, true); contents.fontSize = (
this.fontSize); (contents.isShowingBlanks
) = asABool(localStorage[('-snap-setting'
) + '-isShowingBlanks']); this.symbol = (
null); this.selectedBlock = null; (this
).oldContentsExtent = contents.extent();
this.isUnevaluated = false; (this.choices
) = choiceDict || null; (this.isNumeric
) = isNumeric || false; (this.isReadOnly
) = isReadOnly || false; (this.minWidth
) = 0; this.onSetContents = null; (this
).constant = null; (InputSlotMorph.uber
).init.call(this, null, true); (this.color
) = WHITE; this.add(contents); this.add(
arrow); contents.isEditable = true;
contents.isDraggable = false;
contents.enableSelecting();
this.setContents(text);};

// InputSlotMorph accessing:

InputSlotMorph.prototype.getSpec = function (
) {return (this.isNumeric ? '%n' : '%s');};

InputSlotMorph.prototype.contents = function (
) {return detect(this.children, (child => (
child instanceof StringMorph)));};

InputSlotMorph.prototype.arrow = function (
) {return detect(this.children, ((child
) => child instanceof ArrowMorph));};

InputSlotMorph.prototype.setContents = function (data) {
	// data can be a String, Float, or "wish" Block
    var	cnts = this.contents(), dta = data,
       	isConstant = dta instanceof Array;

	if (this.selectedBlock) {
   	this.selectedBlock = null;
	};  if (this.symbol) {
	this.symbol.destroy();
	this.symbol = null;};

    if (isConstant) {
         dta = localize(dta[0]);
         cnts.isItalic = !this.isReadOnly;
    } else if (dta instanceof BlockMorph) {
    	this.selectedBlock = dta;
      	dta = ''; // make sure the contents text emptied
    } else { // assume dta is a localizable choice if it's a key in my choices
        cnts.isItalic = false;
        if (!isNil(this.choices) && this.choices[dta] instanceof Array) {
        return this.setContents(this.choices[dta]);};}; cnts.text = dta;
    if (isNil(dta)) {
        cnts.text = '';
    } else if (dta.toString) {
        cnts.text = dta.toString();
    };  if (this.isReadOnly && !(MorphicPreferences.isFlat)) {
        cnts.shadowOffset = new Point(1, 1); // correct initial dimensions
    };  cnts.fixLayout();

    // remember the constant, if any
    this.constant = isConstant ? data : null;

    // adjust to zebra coloring:
    if (this.isReadOnly && (this.parent instanceof BlockMorph)) {
        this.parent.fixLabelColor();
    };

    // run onSetContents if any
    if (this.onSetContents) {
        this[this.onSetContents](data);
    };};

InputSlotMorph.prototype.userSetContents = function (aStringOrFloat) {
    // enable copy-on-edit for inherited scripts
    var block = this.parentThatIsA(BlockMorph),
        ide = this.parentThatIsA(IDE_Morph);
    this.selectForEdit().setContents(aStringOrFloat);
    if (ide && !block.isTemplate) {
        ide.recordUnsavedChanges();
    }
};

// InputSlotMorph drop-down menu:

InputSlotMorph.prototype.dropDownMenu = function (enableKeyboard) {
    var menu = this.menuFromDict(this.choices, false, enableKeyboard);
    if (!menu) { // has already happened
        return;
    };  if (menu.items.length > 0) {
        if (enableKeyboard) {
            menu.popup(world, this.bottomLeft());
            menu.getFocus();
        } else {
            menu.popUpAtHand(world);
        };
    };};

InputSlotMorph.prototype.menuFromDict = function (
    choices,
    noEmptyOption,
    enableKeyboard
)  {var key, dial, flag, myself = this, selector,
        block = this.parentThatIsA(BlockMorph),
        ide = this.parentThatIsA(IDE_Morph),
        menu = new MenuMorph(
        this.userSetContents,
        null, this, (this
        ).fontSize);

	function update(num) {
    	myself.setContents(num);
        myself.reactToSliderEdit();
        if (ide && !block.isTemplate) {
        ide.recordUnsavedChanges();};};

    function getImg(block) {return (() => block.fullImage());};

    menu.addItem(' ', null);
    if (choices instanceof Function) {
        if (!Process.prototype.enableJS) {
            menu.addItem('JavaScript extensions for Snap!\nare turned off');
            return menu;
        }
        choices = choices.call(this);
    } else if (isString(choices)) {
        if (choices.indexOf('ext_') === 0) {
            selector = choices.slice(4);
            choices = SnapExtensions.menus.get(selector);
            if (choices) {
                choices = choices.call(this);
            } else {
                menu.addItem('cannot find extension menu "' + selector + '"');
                return menu;
            };
        } else {
            choices = this[choices]();
        };
        if (!choices) { // menu has already happened
            return;
        };
    }; for (key in choices) {
        if (Object.prototype.hasOwnProperty.call(choices, key)) {
            if (key[0] === '~') {
            if (menu.items.length > 0) {menu.addLine();};
            } else if (key.indexOf('§_def') === 0) {
                menu.addItem(
                    this.doWithAlpha(1, getImg(choices[key])),
                    choices[key]
                );
            } else if (key.indexOf('§_dir') === 0) {
			dial = new DialMorph(0, this.fontSize * 3, SyntaxElementMorph.prototype.scale)
    			dial.rootForGrab = function () {return this;};
    			dial.target = this; dial.action = update;
       			dial.fillColor = this.parent.color;
			dial.setValue(+this.evaluate(), false, true);
       			menu.addLine();
			    menu.items.push(dial);
            	menu.addLine();
            } else if (key.indexOf('§_') === 0) {
                // prefixing a key with '§_' only makes the menu item
                // appear when the user holds down the shift-key
                // use with care because mobile devices might only
                // have a "soft" keyboard that isn't always there
                if (world.currentKey === 16) { // shift
                    menu.addItem(
                        key.slice(2),
                        choices[key],
                        null, // hint
                        null, // color
                        null, // bold
                        true, // italic
                        null, // doubleClickAction
                        null, // shortcut
                        !(choices[key] instanceof Array) &&
                            typeof choices[key] !== 'function' // verbatim?
                    );
                }
            } else if (choices[key] instanceof Object &&
                    !(choices[key] instanceof Array) &&
                    (typeof choices[key] !== 'function')) {
                menu.addMenu(
                    localize(key),
                    this.menuFromDict(choices[key], true),
                    null,  // indicator
                    true   // verbatim? - don't translate
                );
            } else if (choices[key] instanceof Array &&
                    choices[key][0] instanceof Object &&
                    typeof choices[key][0] !== 'function') {
                menu.addMenu(
                    key,
                    this.menuFromDict(choices[key][0], true),
                    null,  // indicator
                    false  // verbatim? - do translate, if inside an array
                );
            } else {
                menu.addItem(
                    key,
                    choices[key],
                    null, // hint
                    null, // color
                    null, // bold
                    null, // italic
                    null, // doubleClickAction
                    null, // shortcut
                    !(choices[key] instanceof Array) &&
                        typeof choices[key] !== 'function' &&
                            typeof(choices[key]) !== 'number' // verbatim?
                );
            };
        };
    }; return menu;
};

// InputSlotMorph special drop-down menus:
// Note each function returning a drop-down menu
// must accept a Boolean parameter enabling its
// access for searching

InputSlotMorph.prototype.keysMenu = function () {
    return {
        'any key' : ['any key'],
        'up arrow': ['up arrow'],
        'down arrow': ['down arrow'],
        'right arrow': ['right arrow'],
        'left arrow': ['left arrow'],
        enter: ['enter'],
        esc: ['esc'],
        backspace: ['backspace'],
        shift: ['shift'],
        space : ['space'],
        control : ['control'],
        alt : ['alt'],
        meta : ['meta'],
        tab : ['tab'],
        capslock : ['capslock'],
        '+' : ['+'],
        '-' : ['-'],
        '.' : ['.'],
        ',' : [','],
        '\;' : ['\;'],
        'f1' : ['f1'],
        'f2' : ['f2'],
        'f3' : ['f3'],
        'f4' : ['f4'],
        'f5' : ['f5'],
        'f6' : ['f6'],
        'f7' : ['f7'],
        'f8' : ['f8'],
        'f9' : ['f9'],
        'f10' : ['f10'],
        'f11' : ['f12'],
        'f12' : ['f12'],
        '\[' : ['\['],
        '\]' : ['\]'],
        '\\' : ['\\'],
        '\'' : ['\''],
        '\`' : ['\`'],
        '\/' : ['\/'],
        a : ['a'],
        b : ['b'],
        c : ['c'],
        d : ['d'],
        e : ['e'],
        f : ['f'],
        g : ['g'],
        h : ['h'],
        i : ['i'],
        j : ['j'],
        k : ['k'],
        l : ['l'],
        m : ['m'],
        n : ['n'],
        o : ['o'],
        p : ['p'],
        q : ['q'],
        r : ['r'],
        s : ['s'],
        t : ['t'],
        u : ['u'],
        v : ['v'],
        w : ['w'],
        x : ['x'],
        y : ['y'],
        z : ['z'],
        '0' : ['0'],
        '1' : ['1'],
        '2' : ['2'],
        '3' : ['3'],
        '4' : ['4'],
        '5' : ['5'],
        '6' : ['6'],
        '7' : ['7'],
        '8' : ['8'],
        '9' : ['9']
    };
};

InputSlotMorph.prototype.messagesMenu = function (searching) {
    if (!searching) {
    var dict = {},
        rcvr = this.parentThatIsA(BlockMorph).scriptTarget(),
        stage = rcvr.parentThatIsA(StageMorph),
        allNames = [];

    stage.children.concat(stage).forEach(morph => {
        if (isSnapObject(morph)) {
            allNames = allNames.concat(morph.allMessageNames());
        };
    }); allNames.sort().forEach(
    name => dict[name] = name);
    if (allNames.length > 0) {
        dict['~'] = null;
    };  dict['new...'] = () =>
        new DialogBoxMorph(
            this,
            this.setContents,
            this
        ).prompt(
            'Message name',
            null,
            world
        );
    return dict;};};

InputSlotMorph.prototype.messagesReceivedMenu = function (searching) {
    var dict = {'any message': ['any message']},
        rcvr,
        stage,
        allNames;

    if (searching) {return dict;};

    rcvr = this.parentThatIsA(BlockMorph).scriptTarget();
    stage = rcvr.parentThatIsA(StageMorph);
    allNames = [];

    stage.children.concat(stage).forEach(morph => {
        if (isSnapObject(morph)) {
            allNames = allNames.concat(morph.allMessageNames());
        }
    });
    allNames.sort().forEach(name => {
        if (name !== '__shout__go__') {
            dict[name] = name;
        }
    });
    dict['~'] = null;
    dict['new...'] = () =>
        new DialogBoxMorph(
            this,
            this.setContents,
            this
        ).prompt(
            'Message name',
            null,
            world
        );
    return dict;
};

InputSlotMorph.prototype.eventsMenu = function (searching) {
    if (searching) {return {}; }
    return {__shout__go__: ['__shout__go__']};
};

InputSlotMorph.prototype.primitivesMenu = function () {
    var dict = {},
        allNames = Array.from(SnapExtensions.primitives.keys());

    allNames.sort().forEach(name =>
        dict[name] = name
    );
    return dict;
};

InputSlotMorph.prototype.collidablesMenu = function (searching) {
    var dict = {
            'mouse-pointer' : ['mouse-pointer'],
            edge : ['edge'],
            'pen trails' : ['pen trails']
        },
        rcvr,
        stage,
        allNames;

    if (searching) {return dict; }

    rcvr = this.parentThatIsA(BlockMorph).scriptTarget();
    stage = rcvr.parentThatIsA(StageMorph);
    allNames = [];

    stage.children.forEach(morph => {
        if (morph instanceof SpriteMorph && !morph.isTemporary) {
            if (morph.name !== rcvr.name) {
                allNames = allNames.concat(morph.name);
            }
        }
    });
    if (allNames.length > 0) {
        dict['~'] = null;
        allNames.forEach(name =>
            dict[name] = name
        );
    }
    return dict;
};

InputSlotMorph.prototype.locationMenu = function (searching) {
    var dict = {
            'mouse-pointer' : ['mouse-pointer'],
            'myself' : ['myself']
        },
        rcvr,
        stage,
        allNames = [];

    if (searching) {return dict; }

    rcvr = this.parentThatIsA(BlockMorph).scriptTarget();
    stage = rcvr.parentThatIsA(StageMorph);
    allNames = [];

    stage.children.forEach(morph => {
        if (morph instanceof SpriteMorph && !morph.isTemporary) {
            if (morph.name !== rcvr.name) {
                allNames = allNames.concat(morph.name);
            }
        }
    });
    if (allNames.length > 0) {
        dict['~'] = null;
        allNames.forEach(name =>
            dict[name] = name
        );
    }
    return dict;
};

InputSlotMorph.prototype.distancesMenu = function (searching) {
    if (searching) {
        return {
            'mouse-pointer': ['mouse-pointer'],
            center: ['center']
        };
    }

	var block = this.parentThatIsA(BlockMorph),
        dict = {},
        rcvr = this.parentThatIsA(BlockMorph).scriptTarget(),
        stage = rcvr.parentThatIsA(StageMorph),
        allNames = [];

	if (block && (block.selector !== 'reportRelationTo')) {
	    dict['random position'] = ['random position'];
 	}
	dict['mouse-pointer'] = ['mouse-pointer'];
    dict.center = ['center'];

    stage.children.forEach(morph => {
        if (morph instanceof SpriteMorph && !morph.isTemporary) {
            if (morph.name !== rcvr.name) {
                allNames = allNames.concat(morph.name);
            }
        }
    });
    if (allNames.length > 0) {
        dict['~'] = null;
        allNames.forEach(name =>
            dict[name] = name
        );
    }
    return dict;
};

InputSlotMorph.prototype.clonablesMenu = function (searching) {if (searching) {return {};} return this.objectsMenu(false, true, false, true);};

InputSlotMorph.prototype.objectsMenuWithSelf = function (searching) {if (searching) {return {};} return this.objectsMenu(false, true);};

InputSlotMorph.prototype.receiversMenu = function (searching) {if (searching) {return {};} return this.objectsMenu(false, true, true);};

InputSlotMorph.prototype.objectsMenu = function (searching, includeMyself, includeAll, noStage) {
    if (searching) {return {}; }

    var rcvr = this.parentThatIsA(BlockMorph).scriptTarget(),
        stage = rcvr.parentThatIsA(StageMorph),
        dict = includeAll ? {all : ['all']} : {}, allNames = [];

    dict[stage.name] = stage.name;
    if (includeMyself) {dict.myself = ['myself'];};
    stage.children.forEach(morph => {
        if (morph instanceof SpriteMorph && !morph.isTemporary) {
            allNames.push(morph.name);
        }
    });
    if (this.parentThatIsA(BlockMorph).selector === 'reportObject') {
    dict['all sprites'] = 'allSprites';}; if (allNames.length > 0) {
        dict['~'] = null;
        allNames.forEach(name =>
            dict[name] = name
        );
    };
    return dict;
};

InputSlotMorph.prototype.midsMenu = function (
) {var dict = {}, mids = world.childThatIsA(IDE_Morph).mids,
i = 0; while (i < mids.length) {dict[('').concat('\(', (i + 1
) , '\) ', mids[i].name)] = (i + 1); i++;}; return dict;};

InputSlotMorph.prototype.typesMenu = function () {
    var dict = {
        number : ['number'],
        text : ['text'],
        Boolean : ['Boolean'],
        list : ['list'],
        costume : ['costume'],
        sound : ['sound'],
        color : ['color'],
        nothing : ['nothing'],
        undefined : ['undefined'],
        sprite : ['sprite'],
        stage : ['stage'],
        command : ['command'],
        reporter : ['reporter'],
        predicate : ['predicate'],
        function : ['function']
    };
    dict['~'] = null;
    dict.agent = ['agent'];
    dict.script = ['script'];
    return dict;
};

InputSlotMorph.prototype.gettablesMenu = function () {var dict = {}, nest = SpriteMorph.prototype.enableNesting, oop = StageMorph.prototype.enableInheritance; dict['draggable?'] = ['draggable?']; dict['name'] = [
'name']; dict['rotation style'] = ['rotation style']; dict['synchronous?'] = ['synchronous?']; dict['~'] = null; dict['direction'] = ['direction']; dict['x position'] = ['x position']; dict['y position'] = [
'y position']; dict['~1'] = null; dict['costume #'] = ['costume #']; dict['costumes'] = ['costumes']; dict['hidden?'] = ['hidden?']; dict['layer'] = ['layer']; dict['size'] = ['size']; dict['~2'] = null;
dict['brightness effect'] = ['brightness effect']; dict['color effect'] = ['color effect']; dict['fisheye effect'] = ['fisheye effect']; dict['ghost effect'] = ['ghost effect']; dict['mosaic effect'] = [
'mosaic effect']; dict['pixelate effect'] = ['pixelate effect']; dict['whirl effect'] = ['whirl effect']; dict['comic effect'] = ['comic effect']; dict['negative effect'] = ['negative effect']; dict[
'confetti effect'] = ['confetti effect']; dict['duplicate effect'] = ['duplicate effect']; dict['saturation effect'] = ['saturation effect']; dict['red effect'] = ['red effect']; dict['green effect'] = [
'green effect']; dict['blue effect'] = ['blue effect']; dict['~3'] = null; dict['instrument'] = ['instrument']; dict['sounds'] = ['sounds']; dict['tempo'] = ['tempo']; dict['volume'] = ['volume']; dict['~4'
] = null; dict['pen RGBA'] = ['pen RGBA']; dict['pen down?'] = ['pen down?']; dict['pen size'] = ['pen size']; dict['~5'] = null; if (nest) {dict.anchor = ['anchor'];}; if (oop) {dict.children = ['children'];
dict.parent = ['parent'];}; if (nest) {dict.parts = ['parts'];}; return dict;};

InputSlotMorph.prototype.myPropertiesMenu = function (
) {var dict = {}; dict.neighbors = ['neighbors'];
dict.self = ['self']; dict['other sprites'] = [
'other sprites']; dict.clones = ['clones'];
dict['other clones'] = ['other clones'];
dict.stage = ['stage']; if ((StageMorph
).prototype.enableInheritance) {dict[
'temporary?'] = ['temporary?'];}; dict[
'current costume'] = ['current costume'
]; dict.scripts = ['scripts']; (dict
).blocks = ['blocks']; dict['dangling?'
] = ['dangling?']; dict.width = ['width'
]; dict.height = ['height']; (dict.left
) = ['left']; dict.right = ['right'];
dict.top = ['top']; dict.bottom = [
'bottom']; dict['rotation x'] = [
'rotation x']; dict['rotation y'
] = ['rotation y']; dict['center x'
] = ['center x']; dict['center y'
] = ['center y']; return dict;};

InputSlotMorph.prototype.scriptsMenu = function () {var dict = {}, root = this.parentThatIsA(HatBlockMorph); if (this.parent) {var scripts = world.children[0].currentSprite.scripts.children; var i = 0;
while (i < scripts.length) {if (((scripts[i] instanceof HatBlockMorph) || (scripts[i] instanceof DefinitorBlockMorph)) && !(scripts[i] === root)) {dict['§_def' + i] = scripts[i];}; i++;};}; return dict;};

InputSlotMorph.prototype.constantsMenu = function () {var dict = {}, ide = world.childThatIsA(IDE_Morph);
if (ide instanceof IDE_Morph) {ide.mathConstants().forEach(con => {dict[con[0]] = con[0];});}; return dict;};

InputSlotMorph.prototype.attributesMenu = function (
searching) {var dict = {
            'position' : ['position'],
            'x position' : ['x position'],
            'y position' : ['y position'],
            'direction' : ['direction'],
            'costume #' : ['costume #'],
            'costume name' : ['costume name'],
            'size' : ['size'],
            'width': ['width'],
            'height': ['height'],
            'left' : ['left'],
            'right' : ['right'],
            'top' : ['top'],
            'bottom' : ['bottom'],
            'volume' : ['volume'],
            'balance' : ['balance']
        },  block, objName, rcvr,
        stage, obj, varNames;

    if (searching) {return dict;};

    block = this.parentThatIsA(BlockMorph);
    objName = block.inputs()[1].evaluate();
    rcvr = block.scriptTarget();
    stage = rcvr.parentThatIsA(StageMorph);
    varNames = [];

    if (objName === stage.name) {
        obj = stage;
    } else {
        obj = detect(
            stage.children,
            morph => morph.name === objName
        );
    };  if (obj instanceof StageMorph) {
        dict = {
            'costume #' : ['costume #'],
            'costume name' : ['costume name'],
            'volume' : ['volume'],
            'balance' : ['balance'],
            'width': ['width'],
            'height': ['height'],
            'left' : ['left'],
            'right' : ['right'],
            'top' : ['top'],
            'bottom' : ['bottom']
        };
    };  dict['~'] = null;
    dict.variables = ['variables'];
    if (obj) {
        varNames = obj.variables.names();
        if (varNames.length > 0) {
            varNames.forEach(name =>
                dict[name] = name
            );
        };  obj.allBlocks(true).forEach((def, i) =>
            dict['§_def' + i] = def.blockInstance(true) // include translations
        );}; return dict;};

InputSlotMorph.prototype.costumesMenu = function (searching) {
    if (searching) {return {};};

    var block = this.parentThatIsA(BlockMorph),
        rcvr = block.scriptTarget(),
        dict,
        allNames = [];
    if (!contains(['reportGetImageAttribute', 'reportNewCostumeStretched', 'doEditCostume'], block.selector)) {
    if (rcvr instanceof StageMorph) {
        dict = {Empty : ['Empty']};
    } else {
        dict = {Turtle : ['Turtle']};
    };} else {dict = {};};
    if (!contains(['doSwitchToCostume', 'doSwitchToBackground'], block.selector)) {
        dict.current = ['current'];
    };  rcvr.costumes.asArray().forEach(costume =>
        allNames = allNames.concat(costume.name)
    );  if (allNames.length > 0) {
        dict['~'] = null;
        allNames.forEach(name =>
            dict[name] = name
        );}; return dict;};

InputSlotMorph.prototype.soundsMenu = function (searching) {
    if (searching) {return {}; }

    var rcvr = this.parentThatIsA(BlockMorph).scriptTarget(),
        allNames = [],
        dict = {};

    rcvr.sounds.asArray().forEach(sound =>
        allNames = allNames.concat(sound.name)
    );  if (allNames.length > 0) {
        allNames.sort().forEach(name =>
            dict[name] = name
        );
    };  return dict;};

InputSlotMorph.prototype.shadowedVariablesMenu = function (searching) {
    if (searching) {return {};};

    var block = this.parentThatIsA(BlockMorph
        ), vars, attribs, rcvr, dict = {};

    if (!block) {return dict; }
    rcvr = block.scriptTarget();
    if (this.parentThatIsA(RingMorph) ||
            this.topBlock().selector === 'receiveOnClone') {
    	// show own local vars and attributes, because this is likely to be
     	// inside TELL, ASK or OF or when initializing a new clone
        vars = rcvr.variables.names();
        vars.forEach(name =>
            dict[name] = name
        );
        attribs = rcvr.attributes;
        /*
        if (vars.length && attribs.length) {
            dict['~'] = null; // add line
        }
        */
        attribs.forEach(name =>
            dict[name] = [name]
        );
    } else if (rcvr && rcvr.exemplar) {
    	// only show shadowed vars and attributes
        vars = rcvr.inheritedVariableNames(true);
        vars.forEach(name =>
            dict[name] = name
        );
        attribs = rcvr.shadowedAttributes();
        /*
        if (vars.length && attribs.length) {
            dict['~'] = null; // add line
        }
        */
        attribs.forEach(name =>
            dict[name] = [name]
        );}; return dict;};

InputSlotMorph.prototype.speakingPitchMenu = function (searching) {
if (searching) {return {};}; var dict = {}; dict[localize('alto')
] = localize('alto'); dict[localize('tenor')] = localize('tenor'
); dict[localize('squeak')] = localize('squeak'); dict[localize(
'giant')] = localize('giant'); dict[localize('kitten'
)] = localize('kitten'); return dict;};

InputSlotMorph.prototype.speakingSpeedMenu = function (searching
) {if (searching) {return {};}; var dict = {}; dict[localize(
'very fast')] = localize('very fast'); dict[localize('fast')
] = localize('fast'); dict[localize('normal')] = localize(
'normal'); dict[localize('slow')] = localize('slow'); dict[
localize('very slow')] = localize('very slow'); return dict;};

InputSlotMorph.prototype.speakingLanguageMenu = function (searching
) {var dict = {}; dict[localize('Arabic')] = localize('Arabic'); dict[
localize('Chinese \(Mandarin\)')] = localize('Chinese \(Mandarin\)');
dict[localize('Danish')] = localize('Danish'); dict[localize('Dutch')
] = localize('Dutch'); dict[localize('English')] = localize('English');
dict[localize('English \(United States\)')] = localize('English ' + (
'\(United States\)')); dict[localize('French')] = localize('French');
dict[localize('German')] = localize('German'); dict[localize('Greek'
)] = localize('Greek'); dict[localize('Hindi')] = localize('Hindi');
dict[localize('Icelandic')] = localize('Icelandic'); dict[localize(
'Italian')] = localize('Italian'); dict[localize('Japanese')] = (
localize('Japanese')); dict[localize('Korean')] = localize('Korean');
dict[localize('Norwegian')] = localize('Norwegian'); dict[localize(
'Polish')] = localize('Polish'); dict[localize('Portuguese')] = (
localize('Portuguese')); dict[localize('Portuguese \(Brazilian\)'
)] = localize('Portuguese \(Brazilian\)'); dict[localize('Romanian'
)] = localize('Romanian'); dict[localize('Russian')] = localize(
'Russian'); dict[localize('Spanish')] = localize('Spanish'); dict[
localize('Spanish \(Latin American\)')] = localize('Spanish \(' + (
'Latin American\)')); dict[localize('Swedish')] = localize('Swedish'
); dict[localize('Turkish')] = localize('Turkish'); dict[localize(
'Welsh')] = localize('Welsh'); return (searching ? dict : {});};

InputSlotMorph.prototype.directionDialMenu = (searching => ((searching
) ? {} : {'§_dir': null})); (InputSlotMorph.prototype.pianoKeyboardMenu
) = function (searching) {if (searching) {return {};}; var instrument,
menu, block = this.parentThatIsA(BlockMorph); if (block) {instrument = (
block.scriptTarget()).instrument;}; menu = new PianoMenuMorph((this
).setContents, this, this.fontSize, instrument); menu.popup(world,
new Point((this.right() - (menu.width() / 2)), this.bottom())); (menu
).selectKey(Math.min(Math.max(asANum(this.evaluate()), 0), 143));};

InputSlotMorph.prototype.audioMenu = function (searching
) {var dict = {'volume' : ['volume'], 'note' : ['note'],
'frequency' : ['frequency'], 'samples' : ['samples'],
'sample rate' : ['sample rate'], 'spectrum' : ['spectrum'
], 'resolution' : ['resolution']}; if (searching) {
return dict;}; if (world.currentKey === 16) {dict[
'~'] = null; dict.modifier = ['modifier'];
dict.output = ['output'];}; return dict;};

InputSlotMorph.prototype.scenesMenu = function (searching) {
    var dict = {},
        scenes;
    if (!searching) {
        scenes = this.parentThatIsA(IDE_Morph).scenes;
        if (scenes.length() > 1) {
            scenes.itemsArray().forEach(scn => {
                if (scn.name) {
                    dict[scn.name] = scn.name;
                };
            });
        };
    };  dict['~'] = null;
    dict.next = ['next'];
    dict.previous = ['previous'];
    // dict['1 '] = 1; // trailing space needed to prevent undesired sorting
    // dict.last = ['last'];
    dict.random = ['random'];
    return dict;};

InputSlotMorph.prototype.setChoices = function (dict, readonly, static) {
    // externally specify choices, read-only status and static,
    // used for custom blocks
    var cnts = this.contents();
    this.choices = dict;
    this.isReadOnly = readonly || false;
    this.isStatic = static || false;
    if (this.parent instanceof BlockMorph) {
        this.parent.fixLabelColor();
        if (!readonly) {
            cnts.shadowOffset = ZERO;
            cnts.shadowColor = null;
            cnts.setColor(BLACK);
        };
    };  this.fixLayout();};

// InputSlotMorph layout:

InputSlotMorph.prototype.fixLayout = function () {
    var width, height, arrowWidth,
        contents = this.contents(),
        arrow = this.arrow(),
        tp = this.topBlock();

    contents.isNumeric = this.isNumeric;
    contents.isEditable = (!this.isReadOnly);
    contents.cursorStyle = this.isReadOnly ? null : 'text';
    if (this.isReadOnly) {
        contents.disableSelecting();
        contents.color = WHITE;
    } else {
        contents.enableSelecting();
        contents.color = BLACK;
    };  if (this.choices) {
        arrow.setSize(this.fontSize);
        arrow.show();
    } else {
        arrow.hide();
    };  arrowWidth = arrow.isVisible ? arrow.width() : 0;

	// determine slot dimensions
    if (this.selectedBlock) { // a "wish" in the OF-block's left slot
        height = this.selectedBlock.height() + this.edge * 2;
         width = this.selectedBlock.width()
            + arrowWidth
            + this.edge * 2
            + this.typeInPadding * 2;
    } else if (this.symbol) {
        this.symbol.fixLayout();
        this.symbol.setPosition(this.position().add(this.edge * 2));
        height = this.symbol.height() + this.edge * 4;
        width = this.symbol.width()
            + arrowWidth
            + this.edge * 4
            + this.typeInPadding * 2;
    } else {
        height = contents.height() + this.edge * 2; // + this.typeInPadding * 2
        if (this.isNumeric) {
            width = contents.width()
                + Math.floor(arrowWidth * 0.5)
                + height
                + this.typeInPadding * 2;
        } else {
            width = Math.max(
                contents.width()
                    + arrowWidth
                    + this.edge * 2
                    + this.typeInPadding * 2,
                contents.rawHeight ? // single vs. multi-line contents
                            contents.rawHeight() + arrowWidth
                                    : fontHeight(contents.fontSize) / 1.3
                                        + arrowWidth,
                this.minWidth // for text-type slots
            );
        };
    };  this.bounds.setExtent(new Point(width, height));

    if (this.isNumeric) {
        contents.setPosition(new Point(
            Math.floor(height / 2),
            this.edge
        ).add(new Point(this.typeInPadding, 0)).add(this.position()));
    } else {
        contents.setPosition(new Point(
            this.edge,
            this.edge
        ).add(new Point(this.typeInPadding, 0)).add(this.position()));
    }; if (arrow.isVisible) {
        arrow.setPosition(new Point(
            this.right() - arrowWidth - this.edge,
            contents.top()
        ));
    }; if (this.parent && this.parent.fixLayout) {
        tp.fullChanged();
        this.parent.fixLayout();
        tp.fullChanged();
    }; if (this.isReadOnly) {
        this.cursorStyle = 'default';
    } else {
        this.cursorStyle = 'text';
    };};

// InputSlotMorph events:

InputSlotMorph.prototype.mouseDownLeft = function (pos) {
    if (this.isReadOnly || this.symbol ||
            this.arrow().bounds.containsPoint(pos)) {
        this.escalateEvent('mouseDownLeft', pos);
    } else {
        this.selectForEdit().contents().edit();
    };};

InputSlotMorph.prototype.mouseClickLeft = function (pos) {
    if (this.arrow().bounds.containsPoint(pos)) {
        this.dropDownMenu();
    } else if (this.isReadOnly || this.symbol) {
        this.dropDownMenu();
    } else {
        this.contents().edit();
    };};

InputSlotMorph.prototype.reactToKeystroke = (
function () {var cnts; if (this.constant) {
cnts = this.contents(); this.constant = null;
cnts.isItalic = false; cnts.rerender();};});

InputSlotMorph.prototype.reactToEdit = function () {
var block = this.parentThatIsA(BlockMorph), ide = (
this.parentThatIsA(IDE_Morph)); (this.contents()
).clearSelection(); if (ide && !(block.isTemplate
)) {ide.recordUnsavedChanges();};};

InputSlotMorph.prototype.freshTextEdit = function (aStringOrTextMorph
) {this.onNextStep = (() => aStringOrTextMorph.selectAll());};

// InputSlotMorph menu:

InputSlotMorph.prototype.slotMenu = function () {
var menu; if (StageMorph.prototype.enableCodeMapping
) {menu = new MenuMorph(this); if (this.isNumeric) {
menu.addItem('code number mapping...', 'mapNumberToCode'
);} else {menu.addItem('code string mapping...',
'mapStringToCode');}; return menu;}; return null;};

// InputSlotMorph reacting to user choices

/*
    if selecting an option from a dropdown menu might affect the visibility
    or contents of another input slot, the methods in this section can
    offer functionality that can be specified externally by setting
    the "onSetContents" property to the name of the according method
*/

InputSlotMorph.prototype.updateEventUpvar = function (data) {
var trg = (this.parent.inputs())[1]; if ((data instanceof Array
) && data[0].indexOf('any') === 0) {trg.show();} else {(trg
).removeInput(); trg.hide();}; this.parent.fixLayout();};

// InputSlotMorph code mapping

/*
    code mapping lets you use blocks to generate arbitrary text-based
    source code that can be exported and compiled / embedded elsewhere,
    it's not part of Snap's evaluator and not needed for Snap itself
*/

InputSlotMorph.prototype.mapStringToCode = function () {
(new DialogBoxMorph(this, code => (StageMorph.prototype
).codeMappings.string = code, this)).promptCode(
'Code mapping - String <#1>', (StageMorph
).prototype.codeMappings.string || '', world);};

InputSlotMorph.prototype.mapNumberToCode = function () {
(new DialogBoxMorph(this, code => (StageMorph.prototype
).codeMappings.number = code, this)).promptCode(
'Code mapping - Number <#1>', (StageMorph
).prototype.codeMappings.number || '', world);};

InputSlotMorph.prototype.mappedCode = function (
) {var block = this.parentThatIsA(BlockMorph),
val = this.evaluate(), code; if (this.isNumeric
) {code = ((StageMorph.prototype.codeMappings
).number || '<#1>'); return code.replace(/<#1>/g,
val);}; if (!isNaN(parseFloat(val))) {return val;
}; if (!isString(val)) {return val;}; if ((block
) && contains(['doSetVar', 'doChangeVar',
'doShowVar', 'doHideVar'], block.selector)) {
return val;}; code = ((StageMorph.prototype
).codeMappings.string || '<#1>'); return (
code.replace(/<#1>/g, val));};

// InputSlotMorph evaluating:

InputSlotMorph.prototype.evaluate = function (
) {var num, contents; if (this.selectedBlock) {
return this.selectedBlock;}; if (this.symbol
) {if (this.symbol.name === 'flag') {return [
'__shout__go__'];}; return '';}; if (
this.constant) {return this.constant;};
contents = this.contents(); if ((this
).isNumeric) {num = asANum((contents
).text);}; return contents.text;};

InputSlotMorph.prototype.isEmptySlot = function () {return ((this
).contents().text === '' && !(this.selectedBlock) && !(this.symbol));};

// InputSlotMorph single-stepping:

InputSlotMorph.prototype.unflash = function () {
if (this.cachedNormalColor) {var clr = (this
).cachedNormalColor; this.color = clr; (this
).cachedNormalColor = null; this.rerender();};
}; InputSlotMorph.prototype.flash = function (
) {if (!(this.cachedNormalColor)) {(this.color
) = this.activeHighlight; (this.cachedNormalColor
) = this.color; this.rerender();};};

// InputSlotMorph drawing:

InputSlotMorph.prototype.backupRender = function (ctx) {
    var borderColor;

    // initialize my surface property
    if (this.cachedNormalColor) {
        borderColor = this.color;
    } else if (this.parent) {
        borderColor = this.parent.color;
    } else {
        borderColor = new Color(120, 120, 120
    );};  ctx.fillStyle = this.color.toString();
    if (this.isReadOnly && !this.cachedNormalColor) {
        if (MorphicPreferences.isFlat) {(ctx.fillStyle
        ) = borderColor.darker().toString();} else {
        var gradient = ctx.createLinearGradient(0, 0,
        0, this.height()); gradient.addColorStop(0,
        borderColor.darker().toString()); (gradient
        ).addColorStop(1, (borderColor.darker(
        ).darker()).toString()); (ctx.fillStyle
        ) = gradient;};}; this.cachedClr = (
        borderColor.toString()); (this.cachedClrBright
        ) = borderColor.lighter(this.contrast).toString(
        ); this.cachedClrDark = borderColor.darker(
        this.contrast).toString();

    if (this.isNumeric) {
        var r = Math.max((this.height() - (this.edge * 2)) / 2, 0);
        ctx.beginPath();
        ctx.arc(
            r + this.edge,
            r + this.edge,
            r,
            Math.PI / 2,
            Math.PI / -2,
            false
        );  ctx.arc(
            this.width() - r - this.edge,
            r + this.edge,
            r,
            Math.PI / -2,
            Math.PI / 2,
            false
        );  ctx.closePath();
        ctx.fill();
        if (!(MorphicPreferences.isFlat)) {
            this.drawRoundBorder(ctx, borderColor);
        };
    } else {
        ctx.fillRect(
            this.edge,
            this.edge,
            this.width() - this.edge * 2,
            this.height() - this.edge * 2
        );  if (!(MorphicPreferences.isFlat)) {
        this.drawRectBorder(ctx, borderColor);};
    };  // draw my "wish" block, if any
        if (this.selectedBlock) {
            ctx.drawImage(
        this.doWithAlpha(1,
        () => this.selectedBlock.fullImage()),
            this.edge + this.typeInPadding,
            this.edge);};};

InputSlotMorph.prototype.drawRoundBorder = function (ctx, borderColor) {
var shift = this.edge / 2, r = Math.max(this.height() / 2, this.edge);
ctx.lineCap = 'round'; ctx.lineWidth = this.edge; ctx.lineJoin = 'round';
if (useBlurredShadows) {ctx.shadowOffsetX = shift; ctx.shadowOffsetY = (
shift); ctx.shadowBlur = this.edge; ctx.shadowColor = (this.color.darker(
80).withAlpha(1/2)).toString();}; ctx.strokeStyle = (borderColor.darker(
this.contrast).withAlpha(1/2)).toString(); ctx.lineCap = 'butt'; (ctx
).beginPath(); ctx.strokeStyle = (borderColor.darker(this.contrast
).withAlpha(1/2)).toString(); ctx.beginPath(); ctx.arc(r, r, ((r
) - shift), Math.PI, Math.PI * 3/2, false); ctx.lineTo(this.width(
) - (r + this.edge), shift); ctx.stroke(); ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0; ctx.shadowBlur = 0; ctx.strokeStyle = (
borderColor.lighter(this.contrast).withAlpha(1/2)).toString();
ctx.beginPath(); ctx.arc(this.width() - r, r, r - shift, 0,
Math.PI / 2, false); ctx.lineTo(r, this.height() - shift);
ctx.stroke();}; InputSlotMorph.prototype.drawRectBorder = (
function (ctx, borderColor) {var shift = this.edge / 2;
ctx.lineJoin = 'round'; ctx.lineWidth = this.edge; if (
useBlurredShadows) {ctx.shadowOffsetX = shift; (ctx
).shadowOffsetY = shift; ctx.shadowBlur = this.edge; (ctx.shadowColor
) = (this.color.darker(80).withAlpha(1/2)).toString();}; (ctx.strokeStyle
) = (borderColor.darker(this.contrast).withAlpha(1/2)).toString(); (ctx
).lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(this.width() - this.edge,
shift); ctx.lineTo(shift, shift); ctx.lineTo(shift, this.height() - (this
).edge); ctx.stroke(); ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; (ctx
).shadowOffsetY = 0; ctx.strokeStyle = (borderColor.lighter(this.contrast
).withAlpha(1/2)).toString(); ctx.beginPath(); ctx.moveTo(0, this.height(
) - shift); ctx.lineTo(this.width() - shift, this.height() - shift); (ctx
).lineTo(this.width() - shift, 0); ctx.stroke();}); /* Render borders. */

// InputSlotStringMorph ///////////////////////////////////////////////

/*
    I am a piece of single-line text inside an input slot block. I serve as a
    container for sharing typographic attributes among my instances
*/

// InputSlotStringMorph inherits from StringMorph:

InputSlotStringMorph.prototype = new StringMorph;
InputSlotStringMorph.prototype.constructor = InputSlotStringMorph;
InputSlotStringMorph.uber = StringMorph.prototype;

function InputSlotStringMorph(
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
        'blockGlobalFont'
    );
};  InputSlotStringMorph.prototype.getRenderColor = function () {
    if (MorphicPreferences.isFlat) {
        if (this.isEditable) {
            return this.color;
        };  return this.parent.alpha > 1/2 ? this.color : BLACK;
    };  return this.parent.alpha > 1/4 ? this.color : WHITE;
};  InputSlotStringMorph.prototype.getShadowRenderColor = function () {
    return this.parent.alpha > 1/4 ? this.shadowColor : CLEAR;
};

// InputSlotTextMorph ///////////////////////////////////////////////

/*
    I am a piece of multi-line text inside an input slot block. I serve as a
    container for sharing typographic attributes among my instances
*/

// InputSlotTextMorph inherits from TextMorph:

InputSlotTextMorph.prototype = new TextMorph;
InputSlotTextMorph.prototype.constructor = InputSlotTextMorph;
InputSlotTextMorph.uber = StringMorph.prototype;

function InputSlotTextMorph(
    text,
    fontSize,
    fontStyle,
    bold,
    italic,
    alignment,
    width,
    fontName,
    shadowOffset,
    shadowColor) {
    this.init(text,
        fontSize,
        fontStyle,
        bold,
        italic,
        alignment,
        width,
        'blockGlobalFont',
        shadowOffset,
        shadowColor
    );
};  InputSlotTextMorph.prototype.getRenderColor = (
    InputSlotStringMorph.prototype.getRenderColor);
    InputSlotTextMorph.prototype.getShadowRenderColor = (
    InputSlotStringMorph.prototype.getShadowRenderColor);

// TemplateSlotMorph ///////////////////////////////////////////////////

/*
    I am a reporter block template sitting on a pedestal.
    My block spec is

    %t        - template

    evaluate returns the embedded reporter template's label string
*/

// TemplateSlotMorph inherits from ArgMorph:

TemplateSlotMorph.prototype = new ArgMorph;
TemplateSlotMorph.prototype.constructor = TemplateSlotMorph;
TemplateSlotMorph.uber = ArgMorph.prototype;

// TemplateSlotMorph instance creation:

function TemplateSlotMorph (name) {this.init(name);};

TemplateSlotMorph.prototype.init = function (name) {var template = new ReporterBlockMorph; this.labelString = name || ''; template.isDraggable = false; (template.isTemplate
) = true; template.color = SpriteMorph.prototype.blockColor.variables; template.category = 'variables'; template.setSpec(this.labelString); template.selector = 'reportGetVar';
TemplateSlotMorph.uber.init.call(this); this.add(template); this.fixLayout(); this.isDraggable = false; this.isStatic = true; template.cursorStyle = 'pointer';};

// TemplateSlotMorph accessing:

TemplateSlotMorph.prototype.getSpec = function () {return '%t';}; TemplateSlotMorph.prototype.template = function () {
return this.children[0];}; TemplateSlotMorph.prototype.contents = function () {return (this.template()).blockSpec;};

TemplateSlotMorph.prototype.setContents = function (aString) {var tmp = this.template(); tmp.setSpec((
aString instanceof Array) ? localize(aString[0]) : aString); tmp.fixBlockColor(); tmp.fixLabelColor();};

// TemplateSlotMorph evaluating:

TemplateSlotMorph.prototype.evaluate = (
function () {return this.contents();});

// TemplateSlotMorph layout:

TemplateSlotMorph.prototype.fixLayout = function () {var template = this.template(); (this.bounds
).setExtent(template.extent().add(this.edge * 2 + 2)); template.setPosition(this.position().add(
this.edge + 1)); if (this.parent) {if (this.parent.fixLayout) {this.parent.fixLayout();};};};

// TemplateSlotMorph drop behavior:

TemplateSlotMorph.prototype.wantsDropOf = function (
aMorph) {return aMorph.selector === 'reportGetVar';};
TemplateSlotMorph.prototype.reactToDropOf = function (
droppedMorph) {if (droppedMorph.selector === (
'reportGetVar')) {droppedMorph.destroy();};};

// TemplateSlotMorph drawing:

TemplateSlotMorph.prototype.backupRender = function (ctx) {if (this.parent instanceof Morph) {
this.color = this.parent.color.copy();}; BlockMorph.prototype.backupRender.call(this, ctx);
}; TemplateSlotMorph.prototype.outlinePath = ReporterBlockMorph.prototype.outlinePathOval;
TemplateSlotMorph.prototype.cSlots = function () {return [];}; (TemplateSlotMorph.prototype
).drawEdges = ReporterBlockMorph.prototype.drawEdgesOval; (TemplateSlotMorph.prototype.isRuleHat
) = function () {return false;}; TemplateSlotMorph.prototype.hasLocationPin = function () {
return false;}; TemplateSlotMorph.prototype.clearSlots = TemplateSlotMorph.prototype.cSlots;

// TemplateSlotMorph single-stepping

TemplateSlotMorph.prototype.flash = function () {(this.template()).flash();};
TemplateSlotMorph.prototype.unflash = function () {(this.template()).unflash();};

// BooleanSlotMorph ////////////////////////////////////////////////////

/*
    I am a diamond-shaped argument slot.
    My block spec is

    %b         - Boolean
    %boolUE    - Boolean unevaluated

    I can be directly edited. When the user clicks on me I toggle
    between <true>, <false> and <null> values.

    evaluate() returns my value.

    my most important public attributes and accessors are:

    value                      - user editable contents (Boolean or null)
    setContents(Boolean/null)  - display the argument (Boolean or null)
*/

// BooleanSlotMorph inherits from ArgMorph:

BooleanSlotMorph.prototype = new ArgMorph;
BooleanSlotMorph.prototype.constructor = BooleanSlotMorph;
BooleanSlotMorph.uber = ArgMorph.prototype;

// BooleanSlotMorph preferences settings

BooleanSlotMorph.prototype.isTernary = false;

// BooleanSlotMorph instance creation:

function BooleanSlotMorph(initialValue,
isTernary) {this.init(initialValue, isTernary);};

BooleanSlotMorph.prototype.init = function (initialValue, isTernary
) {if (!isNil(isTernary)) {this.isTernary = isTernary;}; (this
).value = ((typeof initialValue === 'boolean') ? (initialValue
) : null); this.isUnevaluated = false; this.progress = 0; (
BooleanSlotMorph).uber.init.call(this); this.alpha = 1;
this.fixLayout(); this.cursorStyle = 'pointer';};

BooleanSlotMorph.prototype.getSpec = function () {
return (this.isUnevaluated ? '%boolUE' : '%b');};

// BooleanSlotMorph accessing:

(BooleanSlotMorph.prototype.evaluate
) = function () {return this.value;};

BooleanSlotMorph.prototype.isEmptySlot = (
function () {return isNil(this.value);});

BooleanSlotMorph.prototype.isBinary = function () {return (
!(this.isTernary) && isNil(this.parentThatIsA(RingMorph
)) && !isNil(this.parentThatIsA(ScriptsMorph)));};

BooleanSlotMorph.prototype.setContents = function (
boolOrNull) {this.value = (typeof boolOrNull === (
'boolean')) ? boolOrNull : null; this.rerender();};

BooleanSlotMorph.prototype.toggleValue = function (
    )  {var target = this.selectForEdit(),
        block = this.parentThatIsA(BlockMorph
        ), ide; if (target !== this) {
        return this.toggleValue.call(target);
    }; ide = this.parentThatIsA(IDE_Morph
    ); this.value = this.nextValue();
    if (ide) {if (!block.isTemplate) {
            ide.recordUnsavedChanges(
        );};  if (!ide.isAnimating) {
        this.rerender(); return;};
    }; this.nextSteps([
        () => {
            this.progress = 2;
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI / 16));
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI / 8));
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI / 16));
            this.rerender();
        },
        () => {
            this.progress = 2;
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI / 16));
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI / 8));
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI * 3/16));
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI / 4));
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI * 5/16));
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI * 3/8));
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI * 7/16));
            this.rerender();
        },
        () => {
            this.progress = 0;
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI * 7/16));
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI * 3/8));
            this.rerender();
        },
        () => {
            this.progress = 2 * (1 - Math.sin(Math.PI * 7/16));
            this.rerender();
        },
        () => {
            this.progress = 0;
            this.rerender();
        }]);};

BooleanSlotMorph.prototype.nextValue = function () {
if (this.isTernary) {switch (this.value) {case true:
return false; break; case false: return null; case null:
return true;};} else {return !(this.value);};};

// BooleanSlotMorph events:

BooleanSlotMorph.prototype.mouseClickLeft = function (
) {this.toggleValue(); if (isNil(this.value)) {return;
}; this.reactToSliderEdit();};

BooleanSlotMorph.prototype.mouseEnter = function (
) {this.progress = ((0.5 - (this.nextValue(
) === null)) * 2); this.rerender();};

BooleanSlotMorph.prototype.mouseLeave = function (
) {this.progress = 0; this.rerender();};

// BooleanSlotMorph menu:

BooleanSlotMorph.prototype.slotMenu = function (
)  {var menu;
    if (StageMorph.prototype.enableCodeMapping) {
        menu = new MenuMorph(this);
        if (this.evaluate() === true) {
            menu.addItem(
                'code true mapping...',
                'mapTrueToCode'
            );
        } else {
            menu.addItem(
                'code false mapping...',
                'mapFalseToCode'
            );
        };  return menu;
    };  return null;};

// BooleanSlotMorph code mapping

/*
    code mapping lets you use blocks to generate arbitrary text-based
    source code that can be exported and compiled / embedded elsewhere,
    it's not part of Snap's evaluator and not needed for Snap itself
*/

BooleanSlotMorph.prototype.mapTrueToCode = function () {
    // private - open a dialog box letting the user map code via the GUI
    (new DialogBoxMorph(
        this,
        code => StageMorph.prototype.codeMappings['true'] = code,
        this
    )).promptCode(
        'Code mapping - true',
        StageMorph.prototype.codeMappings['true'] || 'true',
        world
    );
};

BooleanSlotMorph.prototype.mapFalseToCode = function () {
    // private - open a dialog box letting the user map code via the GUI
    (new DialogBoxMorph(
        this,
        code => StageMorph.prototype.codeMappings['false'] = code,
        this
    )).promptCode(
        'Code mapping - false',
        StageMorph.prototype.codeMappings['false'] || 'false',
        world
    );};

BooleanSlotMorph.prototype.mappedCode = function (
) {if (this.evaluate() === true) {return (StageMorph
).prototype.codeMappings.boolTrue || 'true';}; return (
StageMorph.prototype.codeMappings.boolFalse || 'false');};

// BooleanSlotMorph layout:

BooleanSlotMorph.prototype.fixLayout = function () {
    // determine my extent
    var text, h;
    if (this.isStatic) {
        text = this.textLabelExtent();
        h = text.y + (this.edge * 3);
        this.bounds.setWidth(text.x + (h * 3/2) + (this.edge * 2));
        this.bounds.setHeight(h);
    } else {
        this.bounds.setWidth((this.fontSize + this.edge * 2) * 2);
        this.bounds.setHeight(this.fontSize + this.edge * 2);
    };};

// BooleanSlotMorph drawing:

BooleanSlotMorph.prototype.backupRender = function (ctx) {
    if (!(this.cachedNormalColor)) { // unless flashing
        this.color = this.parent ?
                this.parent.color : new Color(200, 200,
    200);};     this.cachedClr = this.color.toString();
    this.cachedClrBright = ((this.color.lighter(
    this.contrast)).withAlpha(1/2)).toString();
    this.cachedClrDark = ((this.color.darker(
    this.contrast)).withAlpha(1/2)).toString();
    this.drawDiamond(ctx, this.progress);
    this.drawLabel(ctx);
    this.drawKnob(ctx, this.progress);
};

BooleanSlotMorph.prototype.drawDiamond = function (ctx,
progress) {var w = this.width(), h = this.height(), r = (
h / 2), w2 = (w * ((this.value ? (3 - progress) : progress
) + 1/2)) / 4, shift = this.edge / 2, gradient; if ((this
).cachedNormalColor) {ctx.fillStyle = this.color.toString();
} else if (progress < 0) {ctx.fillStyle = this.color.darker(
25).toString();} else {switch (this.value) {case true: (ctx
).fillStyle = 'rgb(0, 200, 0)'; break; case false: (ctx
).fillStyle = 'rgb(200, 0, 0)'; break; default: (ctx
).fillStyle = this.color.darker(25).toString();};}; if (
(progress > 0) && !(this.isEmptySlot())) {(ctx.fillStyle
) = 'rgb(0, 200, 0)'; ctx.beginPath(); ctx.moveTo(0, r);
ctx.lineTo(r, 0); ctx.lineTo(w2, 0); ctx.lineTo(w2, h);
ctx.lineTo(r, h); ctx.closePath(); ctx.fill(); (ctx.fillStyle
) = 'rgb\(200, 0, 0\)'; ctx.beginPath(); ctx.moveTo(w2, 0);
ctx.lineTo(w - r, 0); ctx.lineTo(w, r); ctx.lineTo(w - r, h);
ctx.lineTo(w2, h); ctx.closePath(); ctx.fill();} else {(ctx
).beginPath(); ctx.moveTo(0, r); ctx.lineTo(r, 0); ctx.lineTo(
w - r, 0); ctx.lineTo(w, r); ctx.lineTo(w - r, h); ctx.lineTo(
r, h); ctx.closePath(); ctx.fill();}; if (!((MorphicPreferences
).isFlat)) {ctx.lineWidth = this.edge; ctx.lineJoin = 'round';
ctx.lineCap = 'butt'; if (useBlurredShadows) {(ctx.shadowOffsetX
) = shift; ctx.shadowOffsetY = shift; ctx.shadowBlur = (this
).edge; ctx.shadowColor = (new Color(0, 0, 0, 1/2)).toString(
);}; ctx.strokeStyle = this.cachedClrDark; ctx.beginPath();
ctx.moveTo(shift / 2, r + shift / 2); ctx.lineTo(r, shift);
ctx.lineTo(w - r, shift); ctx.stroke(); ctx.closePath();
ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; (ctx.strokeStyle
) = this.cachedClrBright; ctx.beginPath(); ctx.moveTo((w - (
shift / 2)), (r - (shift / 2))); ctx.lineTo(w - r, h - shift);
ctx.lineTo(r, h - shift); ctx.stroke(); ctx.closePath();};};

BooleanSlotMorph.prototype.drawLabel = function (ctx
) {var w = this.width(), r = (this.height() / 2) - this.edge,
r2 = r / 2, shift = this.edge / 2, text, R = r * 2/5,
x, y = this.height() / 2; if (this.isEmptySlot() || (
this.progress < 0)) {return;}; if (this.isStatic) {
        text = this.textLabelExtent();
        y = this.height() - (this.height() - text.y) / 2;
        if (this.value) {
            x = this.height() / 2;
        } else {
            x = this.width() - (this.height() / 2) - text.x;
        }; ctx.save();
        if (!MorphicPreferences.isFlat && useBlurredShadows) {
            ctx.shadowOffsetX = -shift;
            ctx.shadowOffsetY = -shift;
            ctx.shadowBlur = shift;
            ctx.shadowColor = this.value ? 'rgb(0, 100, 0)' : 'rgb(100, 0, 0)';
        }; ctx.font = new StringMorph('', this.fontSize, null, true, false,
        false, null, null, null, language = ((localStorage['-snap-setting-language'
        ] === 'tok') ? 'blockTokiPonaFont' : 'blockGlobalFont')).font();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = WHITE.toString();
        ctx.fillText(
            localize(this.value ? 'TRUE' : 'FALSE'),
            x, y); ctx.restore();
        return;
    }; // "tick:"
    x = r + (this.edge * 2);
    if (!MorphicPreferences.isFlat && useBlurredShadows) {
        ctx.shadowOffsetX = -shift;
        ctx.shadowOffsetY = -shift;
        ctx.shadowBlur = shift;
        ctx.shadowColor = 'rgb(0, 100, 0)';
    }; ctx.strokeStyle = 'white';
    ctx.lineWidth = this.edge + shift;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x - ((r2 * 2) / 3), y + (r2 / 3));
    ctx.lineTo(x, y + r2);
    ctx.lineTo(x + r2, r2 + this.edge);
    ctx.stroke(); // "cross:"
    x = w - y - (this.edge * 2);
    if (!MorphicPreferences.isFlat && useBlurredShadows) {
        ctx.shadowOffsetX = -shift;
        ctx.shadowOffsetY = -shift;
        ctx.shadowBlur = shift;
        ctx.shadowColor = 'rgb(100, 0, 0)';
    }; ctx.beginPath();
    ctx.moveTo(x - R, y - R);
    ctx.lineTo(x + R, y + R);
    ctx.moveTo(x - R, y + R);
    ctx.lineTo(x + R, y - R);
    ctx.stroke();
};

BooleanSlotMorph.prototype.drawKnob = function (ctx, progress) {
    var w = this.width(), r = this.height() / 2, shift = this.edge / 2,
        slideStep = (this.width() - this.height()) / 4 * Math.max(0, (
        progress || 0)), gradient, x, y = r, outline = (
        PushButtonMorph.prototype.outline * this.scale) / 2,
        outlineColor = PushButtonMorph.prototype.outlineColor,
        color = PushButtonMorph.prototype.color,
        contrast = PushButtonMorph.prototype.contrast,
        topColor = color.lighter(contrast),
        bottomColor = color.darker(contrast);

    // draw the 'flat' shape:
    switch (this.value) {
    case false:
        x = r + slideStep;
        if (!MorphicPreferences.isFlat && useBlurredShadows) {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 2 * shift;
            ctx.shadowColor = 'black';
        }; if (progress < 0) {
            ctx.globalAlpha = 3/5;
        }; break;
    case true:
        x = w - r - slideStep;
        if (!MorphicPreferences.isFlat) {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 2 * shift;
            ctx.shadowColor = 'black';
        }; break;
    default:
        if (!progress) {return;}; x = r;
        if (!MorphicPreferences.isFlat && useBlurredShadows) {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 2 * shift;
            ctx.shadowColor = 'black';
        }; ctx.globalAlpha = 3/5;
    }; ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    if (!(MorphicPreferences.isFlat)) {
        ctx.globalAlpha = 1;
    // outline:
    ctx.shadowOffsetX = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'black';
    ctx.lineWidth = outline;
    ctx.strokeStyle = outlineColor.toString();
    ctx.beginPath();
    ctx.arc(x, y, r - (outline / 2),
    0, 2 * Math.PI); ctx.stroke();

    if (!(r < (outline + this.edge))) {
    // top-left:
    gradient = ctx.createRadialGradient(
        x,
        y,
        r - outline - this.edge,
        x,
        y,
        r - outline
    ); gradient.addColorStop(1, topColor.toString(
    )); gradient.addColorStop(0, color.toString());

    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.lineWidth = this.edge;
    ctx.beginPath();
    ctx.arc(
        x,
        y,
        r - outline - this.edge / 2,
        -(Math.PI),
        Math.PI / -2,
        false
    ); ctx.stroke();

    // bottom-right:
    gradient = ctx.createRadialGradient(
        x,
        y,
        r - outline - this.edge,
        x,
        y,
        r - outline
    ); gradient.addColorStop(1, bottomColor.toString(
    )); gradient.addColorStop(0, color.toString());

    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.lineWidth = this.edge;
    ctx.beginPath();
    ctx.arc(
        x,
        y,
        r - outline - this.edge / 2,
        0,
        Math.PI / 2,
        false
    ); ctx.stroke();};};
    ctx.globalAlpha = 1;};

BooleanSlotMorph.prototype.textLabelExtent = function () {var font = (((localStorage['-snap-setting-language'] === 'tok') ? 'blockTokiPonaFont' : (
'blockGlobalFont'))), t = new StringMorph(localize('TRUE'), this.fontSize, null, true, false, false, null, null, WHITE, font), f = new StringMorph(
localize('FALSE'), this.fontSize, null, true, false, false, null, null, WHITE, font); return new Point(Math.max(t.width(), f.width()), t.height());};

// TextSlotMorph //////////////////////////////////////////////////////

/*
    I am a multi-line input slot, primarily used in Snap's code-mapping
    blocks.
*/

// TextSlotMorph inherits from InputSlotMorph:

TextSlotMorph.prototype = new InputSlotMorph;
TextSlotMorph.prototype.constructor = TextSlotMorph;
TextSlotMorph.uber = InputSlotMorph.prototype;

// TextSlotMorph instance creation:

function TextSlotMorph(text, isNumeric, choiceDict, isReadOnly, isStatic) {
    this.init(text, isNumeric, choiceDict, isReadOnly, isStatic);
}

TextSlotMorph.prototype.init = function (
    text,
    isNumeric,
    choiceDict,
    isReadOnly,
    isStatic
) {
    var contents = new InputSlotTextMorph(''),
        arrow = new ArrowMorph(
            'down',
            0,
            Math.max(Math.floor(this.fontSize / 6), 1),
            BLACK,
            true
        );

    contents.fontSize = this.fontSize;
    contents.fixLayout();

    this.isUnevaluated = false;
    this.choices = choiceDict || null; // object, function or selector
    this.oldContentsExtent = contents.extent();
    this.isNumeric = isNumeric || false;
    this.isReadOnly = isReadOnly || false;
    this.isStatic = isStatic || false;
    this.minWidth = 0;
    this.constant = null;

    InputSlotMorph.uber.init.call(this, null, null, null, null, true);
    this.color = WHITE;
    this.add(contents);
    this.add(arrow);
    contents.isEditable = true;
    contents.isDraggable = false;
    contents.enableSelecting();
    this.setContents(text);

};

// TextSlotMorph accessing:

TextSlotMorph.prototype.getSpec = (() => '%mlt');

TextSlotMorph.prototype.contents = function () {
    return detect(
        this.children,
        child => child instanceof TextMorph
    );
};

// TextSlotMorph events:

TextSlotMorph.prototype.layoutChanged = (
function () {this.fixLayout();});

// ColorSlotMorph //////////////////////////////////////////////////////

/*
    I am an editable input slot for a color. Users can edit my color by
    clicking on me, in which case a display a color gradient palette
    and let the user select another color. Note that the user isn't
    restricted to selecting a color from the palette, any color from
    anywhere within the World can be chosen.

    my block spec is %clr

    evaluate() returns my color
*/

// ColorSlotMorph  inherits from ArgMorph:

ColorSlotMorph.prototype = new ArgMorph;
ColorSlotMorph.prototype.constructor = ColorSlotMorph;
ColorSlotMorph.uber = ArgMorph.prototype;

// ColorSlotMorph  instance creation:

function ColorSlotMorph(clr) {this.init(clr);};

ColorSlotMorph.prototype.init = function (clr) {ColorSlotMorph.uber.init.call(this); this.alpha = 1; this.setColor(clr || new Color(Math.round((
Math.random() * 255)), Math.round((Math.random() * 255)), Math.round((Math.random() * 255)), 1)); this.fixLayout(); this.cursorStyle = 'pointer';};

ColorSlotMorph.prototype.getSpec = (() => '%clr');

// ColorSlotMorph  color sensing:

ColorSlotMorph.prototype.getUserColor = function () {this.spawnRGBAEditorDialog(this);};

// ColorSlotMorph events:

ColorSlotMorph.prototype.mouseClickLeft = function () {this.selectForEdit().getUserColor();};

// ColorSlotMorph evaluating:

ColorSlotMorph.prototype.evaluate = (
function () {return this.color;});

// ColorSlotMorph drawing:

ColorSlotMorph.prototype.fixLayout = function () {
var side = (this.fontSize + this.edge * 2 + (this
).typeInPadding * 2); this.bounds.setWidth(side);
this.bounds.setHeight(side);}; (ColorSlotMorph
).prototype.backupRender = function (ctx) {
var borderColor; if (this.parent) {
borderColor = this.parent.color.withAlpha(
1/2);} else {borderColor = new Color(120,
120, 120, 1/2);}; ctx.fillStyle = (this.color
).toString(); this.cachedClr = (borderColor
).toString(); this.cachedClrBright = (
borderColor.withAlpha(1/2)).lighter((this
).contrast).toString(); (this.cachedClrDark
) = (borderColor.withAlpha(1/2)).darker((this
).contrast).toString(); ctx.fillRect(this.edge,
this.edge, this.width() - this.edge * 2,
this.height() - (this.edge * 2)); if (!(
MorphicPreferences).isFlat) {(this
).drawRectBorder(ctx, borderColor
);};}; (ColorSlotMorph.prototype
).drawRectBorder = (InputSlotMorph
).prototype.drawRectBorder;

// BlockHighlightMorph /////////////////////////////////////////////////

/*
    I am a glowing halo around a block or stack of blocks indicating that
    a script is currently active or has encountered an error.
    I halso have an optional readout that can display a thread count
    if more than one process shares the same script
*/

// BlockHighlightMorph inherits from Morph:

BlockHighlightMorph.prototype = new Morph;
BlockHighlightMorph.prototype.constructor = BlockHighlightMorph;
BlockHighlightMorph.uber = Morph.prototype;

// BlockHighlightMorph instance creation:

function BlockHighlightMorph() {this.threadCount = 0; this.init();};

BlockHighlightMorph.prototype.init = function () {
    BlockHighlightMorph.uber.init.call(this);
    this.isCachingImage = true;
};

// BlockHighlightMorph thread count readout

BlockHighlightMorph.prototype.readout = function () {
    return this.children.length ? this.children[0] : null;
};

BlockHighlightMorph.prototype.updateReadout = function () {
    var readout = this.readout(),
        inset = useBlurredShadows && !MorphicPreferences.isFlat ?
            SyntaxElementMorph.prototype.activeBlur * 0.4
                : SyntaxElementMorph.prototype.activeBorder * -2;
    if (this.threadCount < 2) {
        if (readout) {
            readout.destroy();
        }
        return;
    }
    if (readout) {
        readout.changed();
        readout.contents = this.threadCount.toString();
        readout.fixLayout();
        readout.rerender();
    } else {
        readout = new SpeechBubbleMorph(
            this.threadCount.toString(),
            this.color, // color,
            null, // edge,
            null, // border,
            this.color.darker(), // borderColor,
            null, // padding,
            1, // isThought - don't draw a hook
            true // no shadow - faster
        );
        this.add(readout);
    }
    readout.setPosition(this.position().add(inset));
};

// StringSyntaxMorph ///////////////////////////////////////////////////

/*
    I am a text for a block but with the power to change the text in it

    my block spec is

        %labelText - for the changing text

    evaluation is handles by the obtained text
*/

// StringSyntaxMorph inherits from SyntaxElementMorph:

StringSyntaxMorph.prototype = new SyntaxElementMorph;
StringSyntaxMorph.prototype.constructor = StringSyntaxMorph;
StringSyntaxMorph.uber = SyntaxElementMorph.prototype;

function StringSyntaxMorph(oldText, newText, spec) {this.init(oldText, newText, spec);};

StringSyntaxMorph.prototype.init = function (oldText, newText, spec) {
StringSyntaxMorph.uber.init.call(this); this.arrow = new ArrowMorph(
'right', this.fontSize * 9/8, Math.max(Math.floor(this.fontSize / 6),
1), BLACK, true); this.oldText = oldText; this.newText = newText;
this.label = new BlockLabelMorph(oldText, this.labelSize, (this
).labelFontStyle, true, false, false, ((MorphicPreferences.isFlat
) ? ZERO : this.embossing), BLACK, WHITE, this.labelFontName); (this
).setExtent(new Point(this.label.bounds.width(), this.fontSize * 9/8
)); this.add(this.label); this.label.setPosition(ZERO); this.add((this
).arrow); this.arrow.setPosition(new Point(this.label.bounds.corner.x,
this.label.bounds.corner.y - this.label.bounds.extent().y)); (this.arrow
).mouseClickLeft = function () {this.parent.toggleText();}; (this
).labelSpec = spec;}; StringSyntaxMorph.prototype.render = nop;

StringSyntaxMorph.prototype.fixLayout = function (aColor) {if ((this.label instanceof Morph) && (
this.parent instanceof Morph)) {this.color = this.parentThatIsA(BlockMorph).color; if (aColor instanceof Color
) {this.label.color = aColor;}; if ((this.label.color).eq(WHITE)) {this.label.shadowOffset = (
MorphicPreferences.isFlat ? ZERO : this.embossing); this.label.shadowColor = this.color.darker(
this.labelContrast);} else if ((this.label.color).eq(BLACK)) {this.label.shadowOffset = (
MorphicPreferences.isFlat ? ZERO : (this.embossing).neg()); this.label.shadowColor = this.color.lighter(
this.zebraContrast).lighter(this.labelContrast * 2);};}; this.arrow.rerender();};

StringSyntaxMorph.prototype.toggleText = function () {if (this.label.text === this.oldText) {
this.label.text = this.newText; this.arrow.direction = 'left'; this.label.fixLayout();
this.arrow.setPosition(new Point(this.label.bounds.corner.x + (this.arrow.bounds.width() / 2),
this.label.bounds.corner.y - this.label.bounds.extent().y)); this.setExtent(new Point(
this.label.bounds.width(), this.fontSize * 9/8));} else {this.label.text = this.oldText;
this.arrow.direction = 'right'; this.label.fixLayout(); this.arrow.setPosition(new Point(
this.label.bounds.corner.x, this.label.bounds.corner.y - this.label.bounds.extent().y));
this.setExtent(new Point(this.label.bounds.width(), this.fontSize * 9/8));};
this.fixLayout(); this.parentThatIsA(BlockMorph).fixLayout();};

StringSyntaxMorph.prototype.getSpec = function () {return this.labelSpec;};

StringSyntaxMorph.prototype.evaluate = function () {return (
this.label instanceof Morph) ? this.label.text : '';};

// MultiArgMorph ///////////////////////////////////////////////////////

/*
    I am an arity controlled list of input slots

    my block specs are

        %mult%x - where x is any single input slot
        %inputs - for an additional text label 'with inputs'

    evaluation is handles by the interpreter
*/

// MultiArgMorph inherits from ArgMorph:

MultiArgMorph.prototype = new ArgMorph;
MultiArgMorph.prototype.constructor = MultiArgMorph;
MultiArgMorph.uber = ArgMorph.prototype;

// MultiArgMorph instance creation:

function MultiArgMorph(
    slotSpec,
    labelTxt,
    min,
    eSpec,
    arrowColor,
    labelColor,
    shadowColor,
    shadowOffset,
    isTransparent,
    infix,
    collapse,
    defaults,
    group,
    hidden
) {
    this.init(
        slotSpec,
        labelTxt,
        min,
        eSpec,
        arrowColor,
        labelColor,
        shadowColor,
        shadowOffset,
        isTransparent,
        infix,
        collapse,
        defaults,
        group,
        hidden
    );
}

MultiArgMorph.prototype.init = function (
    slotSpec, // string or array of type strings
    labelTxt, // string or array of prefix labels
    min,
    eSpec,
    arrowColor,
    labelColor,
    shadowColor,
    shadowOffset,
    isTransparent,
    infix,
    collapse,
    defaults,
    group,
    hidden
) {
    var label,
        collapseLabel,
        arrows = new FrameMorph,
        listSymbol,
        leftArrow,
        rightArrow,
        i;

    this.slotSpec = slotSpec || '%s';
    this.labelText = (labelTxt instanceof Array) ?
        labelTxt.map(each => localize(each || ''))
        : localize(labelTxt || '');
    this.infix = isNil(infix) ? '' : localize(infix);
    this.collapse = localize(collapse) || '';
    this.defaultValue = defaults || null;
    this.groupInputs = 1;
    this.minInputs = hidden ? 0 : (min || 0);
    this.maxInputs = null;
    this.elementSpec = eSpec || null;
    this.labelColor = labelColor || null;
    this.shadowColor = shadowColor || null;
    this.shadowOffset = shadowOffset || null;
    this.hidden = hidden;

    // in case an input group spec is specified, initialize it
    this.initGroup(group);

    this.canBeEmpty = true;
    MultiArgMorph.uber.init.call(this);

    // MultiArgMorphs are transparent by default b/c of zebra coloring
    this.alpha = asANum(isTransparent);
    arrows.alpha = asANum(isTransparent);

    // label text:
    if (this.labelText || (extraContains(['%cl', '%c', '%cs', '%cla', '%loop', '%ca'], this.slotSpec))) {
        label = this.labelPart(
            this.labelText instanceof Array ?
                this.labelText[0]
                : this.labelText
        );
        this.add(label);
        label.hide();
    }

    // left arrow:
    leftArrow = new ArrowMorph(
        'left',
        this.fontSize * 9/8,
        Math.max(Math.floor(this.fontSize / 6), 1),
        arrowColor,
        true
    );

    // list symbol:
    listSymbol = this.labelPart(
    '$verticalEllipsis-0.875'
    ); listSymbol.color = BLACK;
    listSymbol.getRenderColor = function () {
    if (MorphicPreferences.isFlat) {return this.color;};
    return (SyntaxElementMorph.prototype.alpha > 1/4 ? this.color : WHITE);
    }; listSymbol.rerender();

    // right arrow:
    rightArrow = new ArrowMorph(
        'right',
        this.fontSize * 9/8,
        Math.max(Math.floor(this.fontSize / 6), 1),
        arrowColor,
        true
    );

    // control panel:
    arrows.add(leftArrow);
    arrows.add(rightArrow);
    arrows.add(listSymbol);
    arrows.rerender();
    arrows.acceptsDrops = false;
    this.add(arrows);

    // create the minimum number of inputs
    for (i = 0; i < this.minInputs;
    i += 1) {this.addInput();};
};

MultiArgMorph.prototype.initGroup = function (aBlockSpec) {
    var groupSpec,
        words,
        isSlot = word => word.startsWith('%') && word.length > 1,
        labels = [],
        part = [];
    if (aBlockSpec) {
        // translate block spec
        groupSpec = localize(aBlockSpec);
        // determine input slot specs
        words =  groupSpec.split(' ');
        this.slotSpec = words.filter(word => isSlot(word));
        // determine group size
        this.groupInputs = this.slotSpec.length;
        // determine label texts
        words.forEach(word => {
            if (isSlot(word)) {
                labels.push(part);
                part = [];
            } else {
                part.push(word);
            }
        });
        // only add a postfix if it's non-empty
        if (part.some(any => any.length)) {
            labels.push(part);
        }
        this.labelText = labels.map(arr => arr.join(' '));
    }
};

MultiArgMorph.prototype.label = function () {
    return this.labelText ? this.children[0] : null;
};

MultiArgMorph.prototype.allLabels = function () {
    // including infix labels
    return this.children.filter(m => m instanceof BlockLabelMorph);
};

MultiArgMorph.prototype.arrows = function () {
    return this.children[this.children.length - 1];
};

MultiArgMorph.prototype.listSymbol = function () {
    return this.arrows().children[2];
};

MultiArgMorph.prototype.getSpec = function () {
    return '%mult' + this.slotSpec;
};

MultiArgMorph.prototype.setInfix = function (separator = ''
    ) {var inps; if (this.infix === separator) {return;};
    inps = this.inputs(); this.collapseAll(); this.infix = separator;
    inps.forEach(slot => this.replaceInput(this.addInput(), slot));
    if (inps.length === 1 && this.infix) { // show at least 2 slots with infix
        this.addInput();
    };
};

// MultiArgMorph defaults:

MultiArgMorph.prototype.setContents = function (anArray) {
    var inputs = this.inputs(), i;

    if (!(anArray instanceof Array) && contains(SyntaxElementMorph.prototype.listOfContractives, this.slotSpec)) {
        anArray = [anArray];
    }

    for (i = 0; i < anArray.length; i += 1) {
        if (anArray[i] !== null && (inputs[i])) {
            inputs[i].setContents(anArray[i]);
        }
    }
};

// MultiArgMorph hiding and showing:

/*
    override the inherited behavior to recursively hide/show all
    children, so that my instances get restored correctly when
    switching back out of app mode.
*/

MultiArgMorph.prototype.hide = function () {
    this.isVisible = false;
    this.changed();
};

MultiArgMorph.prototype.show = function () {
    this.isVisible = true;
    this.changed();
};

// MultiArgMorph coloring:

MultiArgMorph.prototype.setLabelColor = function (
    textColor,
    shadowColor,
    shadowOffset
)  {this.textColor = textColor;
    this.shadowColor = shadowColor;
    this.shadowOffset = shadowOffset;
    MultiArgMorph.uber.setLabelColor.call(
        this,
        textColor,
        shadowColor,
        shadowOffset
    );};

// MultiArgMorph layout:

MultiArgMorph.prototype.fixLayout = function () {
    var labels, shadowColor, shadowOffset, block;
    if (this.slotSpec === '%t') {
        this.isStatic = true; // in this case I cannot be exchanged
    }
    if (this.parent) {
        labels = this.allLabels();
        this.color = this.parent.color;
        (this.arrows()).color = this.color;
        if (labels.length) {
            shadowColor = this.shadowColor ||
                this.parent.color.darker(this.labelContrast);
            labels.forEach(label => {
                shadowOffset = this.shadowOffset ||
                    (label ? label.shadowOffset : null);
                if (!label.shadowColor.eq(shadowColor)) {
                    label.shadowColor = shadowColor;
                    label.shadowOffset = shadowOffset;
                    label.fixLayout();
                    label.rerender();
                };});}; if (!(this.isStatic)) {
               block = this.parentThatIsA(BlockMorph);
               (this.arrows()).children[2].shadowColor = (block ? (
               block.color.darker(this.labelContrast)) : shadowColor);
    };};       this.fixArrowsLayout();
    MultiArgMorph.uber.fixLayout.call(this);
    if (this.parent instanceof BlockMorph) {
    if (this.arrows().children[0].isVisible) {
    if (contains([localize('the script %parms %c'), localize('the script %parms %cl')], this.parent.blockSpec)) {
    if (this.parent.children[1] instanceof StringMorph) {
    this.parent.children[1].text = localize('script.');
    this.parent.children[1].fixLayout();
    };} else if (this.parent.blockSpec === localize('the %f block %parms')) {
    if (this.parent.children[2] instanceof StringMorph) {
    this.parent.children[2].text = localize('block.');
    this.parent.children[2].fixLayout();};};} else {
    if (contains([localize('the script %parms %c'), localize('the script %parms %cl')], this.parent.blockSpec)) {
    if (this.parent.children[1] instanceof StringMorph) {
    this.parent.children[1].text = localize('script');
    this.parent.children[1].fixLayout();
    };} else if (this.parent.blockSpec === localize('the %f block %parms')) {
    if (this.parent.children[2] instanceof StringMorph) {
    this.parent.children[2].text = localize('block');
    this.parent.children[2].fixLayout();
    };};};}; if (this.parent instanceof Morph) {
    this.parent.fixLayout(); (this.parent
    ).forAllChildren(child => child.rerender());};
    this.forAllChildren(child => child.rerender());};

MultiArgMorph.prototype.fixArrowsLayout = function () {
    var label = this.label(),
        arrows = this.arrows(),
        leftArrow = arrows.children[0],
        rightArrow = arrows.children[1],
        listSymbol = arrows.children[2],
        inpCount = this.inputs().length,
        dim = new Point(rightArrow.width() / 2, rightArrow.height()),
        centerList = true;
if (this.hidden) {if (this.isStatic) {listSymbol.hide();}; if (this.hiddenInput) {if (this.hiddenInput.isVisible
) {if (label) {label.show();}; leftArrow.show(); rightArrow.hide(); arrows.setExtent(dim);} else {if (label) {label.hide();}; leftArrow.hide(); rightArrow.show(); rightArrow.setPosition(arrows.position().subtract(
new Point(dim.x, 0))); arrows.setExtent(dim);};};} else {
    leftArrow.show();
    listSymbol.show();
    rightArrow.show();
    arrows.setHeight(dim.y);
    if (this.isStatic) {
        listSymbol.hide();
    }
    if (inpCount < (this.minInputs + 1)) { // hide left arrow
        if (label) {
            label.hide();
        }
        leftArrow.hide();
        if (this.isStatic) {
            arrows.setWidth(dim.x);
        } else {
            arrows.setWidth((dim.x * 1.2) + listSymbol.width());
            listSymbol.setCenter(arrows.center());
            listSymbol.setLeft(arrows.left());
            centerList = false;
        }
    } else if (this.is3ArgRingInHOF() && inpCount > 2) { // hide right arrow
        rightArrow.hide();
        arrows.width(dim.x);
    } else { // show both arrows
        if (label) {
            label.show();
        }
        arrows.setWidth((dim.x * 2.4) + (this.isStatic ? 0 : listSymbol.width()));
        if (this.maxInputs && inpCount > this.maxInputs - 1) {
            // hide right arrow
            rightArrow.hide();
            arrows.setWidth(dim.x);
        }
    }
    leftArrow.setCenter(arrows.center());
    leftArrow.setLeft(arrows.left());
    rightArrow.setCenter(arrows.center());
    rightArrow.setRight(arrows.right());
    if (centerList) {
        listSymbol.setCenter(arrows.center());
    };};
    listSymbol.moveBy((listSymbol.shadowOffset).multiplyBy(
    new Point(1/8, 1/2))); arrows.rerender(); if ((this
    ).parent instanceof Morph) {this.parent.fixLayout();
    this.parent.forAllChildren(child => child.rerender());
    }; this.forAllChildren(child => child.rerender());};

MultiArgMorph.prototype.fixHolesLayout = function () {
    var pos;
    this.holes = [];
    if (extraContains(['%cl', '%c', '%cs', '%cla', '%loop', '%ca'], this.slotSpec)) {
        pos = this.position();
        this.inputs().forEach(slot => {
            if (slot instanceof CSlotMorph) {
                slot.fixHolesLayout();
                this.holes.push(
                    slot.holes[0].translateBy(slot.position().subtract(pos))
                );
            }
        });
    }
};

MultiArgMorph.prototype.refresh = function (
) {(this.inputs()).forEach(input => {(input
).fixLayout(); input.rerender();});};

// MultiArgMorph deleting & inserting slots:
/*
    caution, only call these methods with "primitive" inputs,
    since they don't preserve embedded blocks (yes, on purpose)
*/

MultiArgMorph.prototype.deleteSlot = function (anInput) {
    var len = this.inputs().length,
        idx = this.children.indexOf(anInput);
    if (len <= this.minInputs) {
        return;
    }
    if (this.infix) {
        if (idx === (this.children.length - 2)) { // b/c arrows
            this.removeChild(this.children[idx - 1]);
        } else {
            this.removeChild(this.children[idx + 1]);
        }
    }
    this.removeChild(anInput);
    this.fixLayout();
};

MultiArgMorph.prototype.insertNewInputBefore = function (anInput, contents) {
    var idx = this.children.indexOf(anInput),
        newPart = this.labelPart(this.slotSpec),
        infix;
    
    if (this.maxInputs && (this.inputs().length >= this.maxInputs)) {
        return;
    }
    if (contents) {
        newPart.setContents(contents);
    }
    newPart.parent = this;
    if (this.infix) {
        infix = this.labelPart(localize(this.infix));
        infix.parent = this;
        this.children.splice(idx, 0, newPart, infix);
    } else {
        this.children.splice(idx, 0, newPart);
    };  newPart.fixLayout();
    if (this.parent instanceof BlockMorph) {
        this.parent.fixLabelColor();
    };  if (newPart instanceof BlockMorph) {
    newPart.fixBlockColor();}; this.fixLayout();
    return newPart;
};

// MultiArgMorph arity control:

MultiArgMorph.prototype.addInput = function (contents) {var len = (this.inputs()
).length, newPart = this.labelPart(this.slotSpecFor(len)), value = (isNil(contents
) ? this.defaultValueFor(len) : contents), i, name, idx; this.addInfix(); idx = (
this.children.length - 1); if (!isNil(value)) {newPart.setContents(value);} else if (
contains(['%scriptVars', '%blockVars', '%jsCommaParms'], this.elementSpec)) {name = '';
i = idx; if (contains(['%scriptVars', '%jsCommaParms'], this.elementSpec)) {i += 1;
}; if (this.infix) {if (this.elementSpec === '%jsCommaParms') {name = ('parm').concat(
(this.inputs().length + 1).toString());} else {name = ['A','B','C','D','E','F','G',
'H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b',
'c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w',
'x','y','z'][(this.infix ? (this.inputs()).length : 0)];};} else {while (i > 0) {
name = String.fromCharCode(97 + ((i - 1) % 26)) + name; i = Math.floor((i - 1) / 26
);};}; newPart.setContents(name);} else if (contains(['%parms', '%ringparms'],
this.elementSpec)) { if (this.is3ArgRingInHOF() && idx < 4) {newPart.setContents([
localize('value'), localize('index'), localize('list')][idx - 1]);} else {(newPart
).setContents('#' + idx);};} else if (this.elementSpec === '%message') {(newPart
).setContents(localize('message'));} else if (this.elementSpec === '%keyName') {
newPart.setContents(localize('key'));}; newPart.parent = this; (this.children
).splice(idx, 0, newPart); this.addPostfix(); newPart.fixLayout(); if ((this
).parent instanceof BlockMorph) {this.parent.fixLabelColor();}; this.fixLayout(
); if (this.hidden) {this.hiddenInput = newPart;}; if (newPart instanceof BlockMorph
) {newPart.fixBlockColor();}; return newPart;};

MultiArgMorph.prototype.addInfix = function () {
    var infix,
        len = this.inputs().length,
        label = this.infix ? localize(this.infix
        ) : (this.labelText instanceof Array ?
            this.labelText[len % this.slotSpec.length
            ] : '');

    if (label === '' || !len) {return; }
    infix = this.labelPart(label);
    infix.parent = this;
    this.children.splice(this.children.length - 1, 0, infix);
};


MultiArgMorph.prototype.addPostfix = function () {
    var postfix;
    if (this.labelText instanceof Array &&
        this.inputs().length % this.slotSpec.length === 0 &&
        this.labelText.length === (this.slotSpec.length + 1)
    ) {
        postfix = this.labelPart(this.labelText[this.slotSpec.length]);
        postfix.parent = this;
        this.children.splice(this.children.length - 1, 0, postfix);
    }
};

MultiArgMorph.prototype.removePostfix = function (idx) {
    if (this.labelText instanceof Array &&
        idx % this.slotSpec.length === 0 &&
        this.labelText.length === (this.slotSpec.length + 1)
    ) {
        this.removeChild(this.children[this.children.length - 2]);
    }
};

MultiArgMorph.prototype.removeInput = function () {
    var len = this.inputs().length,
        oldPart, scripts;
    if (len > 0) {
        this.removePostfix(len);
        oldPart = this.inputs()[len - 1];
        this.removeChild(oldPart);
        if (oldPart instanceof CSlotMorph) {
            oldPart = oldPart.nestedBlock();
        };
        if (oldPart instanceof BlockMorph &&
                !(oldPart instanceof RingMorph && !oldPart.contents())) {
            scripts = this.parentThatIsA(ScriptsMorph);
            if (scripts) {
                oldPart.moveBy(10);
                scripts.add(oldPart);
            };
        };
    };
    if (this.infix ||
        (this.labelText instanceof Array && this.inputs().length)
    ) {
        if (this.children.length > 1 &&
                !(this.labelText instanceof Array &&
                    this.labelText[this.inputs().length % this.labelText.length]
                        === '')
        ) {
            this.removeChild(this.children[this.children.length - 2]);
        };
    };  this.fixLayout();
};

MultiArgMorph.prototype.showThatInput = function () {
    var len = this.inputs().length,
        newPart = this.labelPart(this.slotSpecFor(len));

    this.addInfix(); this.hiddenInput.parent = this;
    this.hiddenInput.isHidden = false; this.hiddenInput.setExtent(
    this.hiddenInput.hiddenExtent); this.hiddenInput.show();
    this.hiddenInput.fixLayout(); this.fixLayout();
    this.refresh(); this.hiddenInput.fixBlockColor();
    this.addPostfix(); if (this.parent instanceof BlockMorph
    ) {this.parent.fixLabelColor();}; this.fixLayout();
};

MultiArgMorph.prototype.hideThatInput = function () {
    var len = this.inputs().length, scripts;
    this.hiddenInput.fixBlockColor();
    this.hiddenInput.isHidden = true;
    this.hiddenInput.hiddenExtent = this.hiddenInput.extent();
    this.hiddenInput.bounds.setExtent(ZERO);
    this.hiddenInput.hide(); this.fixLayout();
    if (len > 0) {
        this.removePostfix(len);
    };  if (this.infix ||
        (this.labelText instanceof Array && this.inputs().length)
    ) {
        if (this.children.length > 1 &&
                !(this.labelText instanceof Array &&
                    this.labelText[this.inputs().length % this.labelText.length]
                        === '')
        ) {
            this.removeChild(this.children[this.children.length - 2]);
        };
    };  this.fixLayout();
};

MultiArgMorph.prototype.collapseAll = function () {
var len = this.inputs().length, i; for (i = 0;
i < len; i+= 1) {this.removeInput();};};

MultiArgMorph.prototype.isVertical = function () {return contains(['%p',
'%r', '%cmd', '%cmdRing', '%repRing', '%predRing'], this.slotSpec);};

MultiArgMorph.prototype.is3ArgRingInHOF = function () {
    var ring = this.parent,
        block;
    if (ring) {
        block = ring.parent;
        if (block instanceof ReporterBlockMorph) {
            return block.inputs()[0] === ring &&
                contains(
                    [
                        'reportMap',
                        'reportAtomicMap',
                        'reportKeep',
                        'reportAtomicKeep',
                        'reportFindFirstFixed',
                        'reportAtomicFindFirstFixed'
                    ],
                    block.selector
                );
        }
    }
    return false;
};

MultiArgMorph.prototype.slotSpecFor = function (index) {
    return this.slotSpec instanceof Array ?
        this.slotSpec[index % this.slotSpec.length]
        : this.slotSpec;
};

MultiArgMorph.prototype.defaultValueFor = function (index) {
    return this.defaultValue instanceof Array ?
        this.defaultValue[index % this.defaultValue.length]
        : this.defaultValue;
};

// MultiArgMorph events:

MultiArgMorph.prototype.mouseClickLeft = function (pos) {
    // prevent expansion in the palette
    // (because it can be hard or impossible to collapse again)
    var block = this.parentThatIsA(BlockMorph),
        sprite = block.scriptTarget();
    if (!this.parentThatIsA(ScriptsMorph)) {
        this.escalateEvent('mouseClickLeft', pos);
        return;
    }
    // if the <shift> key is pressed, repeat action 3 times
    var target = this.selectForEdit(),
        arrows = target.arrows(),
        leftArrow = arrows.children[0],
        rightArrow = arrows.children[1],
        arrowsBounds = target.arrows().bounds.expandBy(this.fontSize / 3),
        arrowsCenter = arrows.center().x,
        isExpansionClick,
        repetition = this.groupInputs *
            (((target.world().currentKey === 16) * 2) + 1),
        i;

    if (arrowsBounds.containsPoint(pos)) {
        if (leftArrow.isVisible && rightArrow.isVisible) {
            isExpansionClick = pos.x >= arrowsCenter;
        } else {
            isExpansionClick = rightArrow.isVisible;
        }
        if (isExpansionClick) { // right arrow
            for (i = 0; i < repetition; i += 1) {
                if (rightArrow.isVisible) {
                    if (this.hidden) {if (this.hiddenInput) {
                    target.showThatInput();} else {
                    target.addInput();};
                    } else {target.addInput();};
                }
            }
        } else { // left arrow
            for (i = 0; i < repetition; i += 1) {
                if (leftArrow.isVisible) {
                    if (this.hidden) {if (this.hiddenInput) {
                    target.hideThatInput();};} else {
                    target.removeInput();};
                }
            }
        }
    } else {
        target.escalateEvent('mouseClickLeft', pos);
    }
};

// MultiArgMorph menu:

MultiArgMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this),
        block = this.parentThatIsA(BlockMorph),
        key = '';
    if (!StageMorph.prototype.enableCodeMapping) {
        return this.parent.userMenu();
    }
    if (block) {
        if (block instanceof RingMorph) {
            key = 'parms_';
        } else if (block.selector === 'doDeclareVariables') {
            key = 'tempvars_';
        }
    }
    menu.addItem(
        'code list mapping...',
        () => this.mapCodeList(key)
    );
    menu.addItem(
        'code item mapping...',
        () => this.mapCodeItem(key)
    );
    menu.addItem(
        'code delimiter mapping...',
        () => this.mapCodeDelimiter(key)
    );
    return menu;
};

// MultiArgMorph code mapping

/*
    code mapping lets you use blocks to generate arbitrary text-based
    source code that can be exported and compiled / embedded elsewhere,
    it's not part of Snap's evaluator and not needed for Snap itself
*/

MultiArgMorph.prototype.mapCodeDelimiter = function (key) {
    this.mapToCode(key + 'delim', 'list item delimiter');
};

MultiArgMorph.prototype.mapCodeList = function (key) {
    this.mapToCode(key + 'list', 'list contents <#1>');
};

MultiArgMorph.prototype.mapCodeItem = function (key) {
    this.mapToCode(key + 'item', 'list item <#1>');
};

MultiArgMorph.prototype.mapToCode = function (key, label) {
    // private - open a dialog box letting the user map code via the GUI
    new DialogBoxMorph(
        this,
        code => StageMorph.prototype.codeMappings[key] = code,
        this
    ).promptCode(
        'Code mapping - ' + label,
        StageMorph.prototype.codeMappings[key] || '',
        world
    );
};

MultiArgMorph.prototype.mappedCode = function (definitions) {
    var block = this.parentThatIsA(BlockMorph),
        key = '',
        code,
        items = '',
        itemCode,
        delim,
        count = 0,
        parts = [];

    if (block) {
        if (block instanceof RingMorph) {
            key = 'parms_';
        } else if (block.selector === 'doDeclareVariables') {
            key = 'tempvars_';
        }
    }

    code = StageMorph.prototype.codeMappings[key + 'list'] || '<#1>';
    itemCode = StageMorph.prototype.codeMappings[key + 'item'] || '<#1>';
    delim = StageMorph.prototype.codeMappings[key + 'delim'] || ' ';

    this.inputs().forEach(input =>
        parts.push(itemCode.replace(/<#1>/g, input.mappedCode(definitions)))
    );
    parts.forEach(part => {
        if (count) {
            items += delim;
        }
        items += part;
        count += 1;
    });
    code = code.replace(/<#1>/g, items);
    return code;
};

// MultiArgMorph arity evaluating:

MultiArgMorph.prototype.evaluate = function () {
    // this is usually overridden by the interpreter. This method is only
    // called (and needed) for the variables menu.
    var result = []; this.inputs(
    ).forEach(slot => result.push(
    slot.evaluate())); return result;
};

MultiArgMorph.prototype.isEmptySlot = function () {
    return this.canBeEmpty ? this.inputs().length === 0 : false;
};

// ArgLabelMorph ///////////////////////////////////////////////////////

/*
    I am a label string that is wrapped around an ArgMorph, usually
    a MultiArgMorph, so to indicate that it has been replaced entirely
    for an embedded reporter block

    I don't have a block spec, I get embedded automatically by the parent
    block's argument replacement mechanism

    My evaluation method is the identity function, i.e. I simply pass my
    input's value along.
*/

// ArgLabelMorph inherits from ArgMorph:

ArgLabelMorph.prototype = new ArgMorph;
ArgLabelMorph.prototype.constructor = ArgLabelMorph;
ArgLabelMorph.uber = ArgMorph.prototype;

// ArgLabelMorph instance creation:

function ArgLabelMorph(argMorph, labelTxt) {
    this.init(argMorph, labelTxt);
}

ArgLabelMorph.prototype.init = function (argMorph, labelTxt) {
    var label;

    this.labelText = localize(labelTxt || 'input list:');
    ArgLabelMorph.uber.init.call(this);

    this.isStatic = true; // I cannot be exchanged

    // ArgLabelMorphs are transparent
    this.alpha = 0;

    // label text:
    label = this.labelPart(this.labelText);
    this.add(label);

    // argMorph
    this.add(argMorph);
};

ArgLabelMorph.prototype.label = function () {
    return this.children[0];
};

ArgLabelMorph.prototype.argMorph = function () {
    return this.children[1];
};

// ArgLabelMorph layout:

ArgLabelMorph.prototype.fixLayout = function () {
    var label = this.label(),
        shadowColor,
        shadowOffset;

    if (this.parent) {
        this.color = this.parent.color;
        shadowOffset = label.shadowOffset || ZERO;

        // determine the shadow color for zebra coloring:
        if (shadowOffset.x < 0) {
            shadowColor = this.parent.color.darker(this.labelContrast);
        } else {
            shadowColor = this.parent.color.lighter(this.labelContrast);
        }

        if (this.labelText !== '') {
            if (!label.shadowColor.eq(shadowColor)) {
                label.shadowColor = shadowColor;
                label.shadowOffset = shadowOffset;
                label.rerender();
            }
        }
    }
    ArgLabelMorph.uber.fixLayout.call(this);
    if (this.parent) {
        this.parent.fixLayout();
    }
};

ArgLabelMorph.prototype.refresh = function () {
    this.inputs().forEach(input => {
        input.fixLayout();
        input.rerender();
    });
};

// ArgLabelMorph label color:

ArgLabelMorph.prototype.setLabelColor = function (
    textColor,
    shadowColor,
    shadowOffset
) {
    if (this.labelText !== '') {
        var label = this.label();
        label.color = textColor;
        label.shadowColor = shadowColor;
        label.shadowOffset = shadowOffset;
        label.rerender();
    }
};

// ArgLabelMorph events:

ArgLabelMorph.prototype.reactToGrabOf = function () {
    if (this.parent instanceof SyntaxElementMorph) {
        this.parent.revertToDefaultInput(this);
    }
};

// ArgLabelMorph evaluating:

ArgLabelMorph.prototype.evaluate = function () {
    // this is usually overridden by the interpreter. This method is only
    // called (and needed) for the variables menu.

    return this.argMorph().evaluate();
};

ArgLabelMorph.prototype.isEmptySlot = (() => false);

// FunctionSlotMorph ///////////////////////////////////////////////////

/*
    I am an unevaluated, non-editable, rf-colored, rounded or diamond
    input slot. My current (only) use is in the THE BLOCK block.

    My command spec is %f
*/

// FunctionSlotMorph inherits from ArgMorph:

FunctionSlotMorph.prototype = new ArgMorph;
FunctionSlotMorph.prototype.constructor = FunctionSlotMorph;
FunctionSlotMorph.uber = ArgMorph.prototype;

// FunctionSlotMorph instance creation:

function FunctionSlotMorph(isPredicate) {this.init(isPredicate);};

FunctionSlotMorph.prototype.init = function (isPredicate) {
FunctionSlotMorph.uber.init.call(this); (this.isPredicate
) = asABool(isPredicate); this.color = ((this.rfColor
).lighter()).lighter(10); this.cursorStyle = 'default';
}; FunctionSlotMorph.prototype.getSpec = (() => '%f');
FunctionSlotMorph.prototype.nestedBlock = (() => null);

// FunctionSlotMorph drawing:

FunctionSlotMorph.prototype.backupRender = function (ctx
) {var borderColor; if (this.parent) {borderColor = (this
).parent.color;} else {borderColor = new Color(120, 120,
120);}; this.cachedClr = borderColor.toString(); (this
).cachedClrBright = (borderColor.lighter(this.contrast
)).toString(); this.cachedClrDark = (borderColor.darker(
this.contrast)).toString(); if (this.isPredicate) {(this
).drawDiamond(ctx);} else {this.drawRounded(ctx);};};

// ReporterSlotMorph ///////////////////////////////////////////////////

/*
    I am a ReporterBlock-shaped input slot. I can nest as well as
    accept reporter blocks (containing reified scripts).

    my most important accessor is

    nestedBlock()    - answer the reporter block I encompass, if any

    My command spec is %r for reporters (round) and %p for
    predicates (diamond)

    evaluate() returns my nested block or null
*/

// ReporterSlotMorph inherits from FunctionSlotMorph:

ReporterSlotMorph.prototype = new FunctionSlotMorph;
ReporterSlotMorph.prototype.constructor = ReporterSlotMorph;
ReporterSlotMorph.uber = FunctionSlotMorph.prototype;

// ReporterSlotMorph instance creation:

function ReporterSlotMorph (isPredicate
) {this.init(isPredicate);}; // init

ReporterSlotMorph.prototype.init = function (isPredicate
) {ReporterSlotMorph.uber.init.call(this, isPredicate,
true); this.add(this.emptySlot()); if (isPredicate
) {this.backupRender = this.renderPredicate;} else {(this
).backupRender = this.renderReporter;}; this.fixLayout();};

ReporterSlotMorph.prototype.drawModifiedRounded = function (
ctx) {if (this.nestedBlock() instanceof ReporterBlockMorph
) {var rounding = (this.nestedBlock()).rounding;} else {
var rounding = this.rounding;}; var h = this.height(),
r = Math.max(Math.min(rounding, h / 2), this.edge),
w = this.width(), shift = this.edge / 2, gradient;
if (MorphicPreferences.isFlat) {ctx.fillStyle = (
this.color.toString());} else {var gradient = (ctx
).createLinearGradient(0, 0, 0, this.height());
gradient.addColorStop(0, this.color.toString()
); gradient.addColorStop(1, (this.color.darker()
).toString()); ctx.fillStyle = gradient;}; (ctx
).beginPath(); ctx.arc(r, r, r - this.edge, -(
Math.PI), Math.PI / -2, false); ctx.arc(w - r,
r, r - this.edge, Math.PI / -2, 0, false); (ctx
).arc(w - r, h - r, r - this.edge, 0, ((Math.PI
) / 2), false); ctx.arc(r, h - r, r - this.edge,
(Math.PI / 2), Math.PI, false); ctx.closePath();
ctx.fill(); if (!(MorphicPreferences.isFlat)) {
ctx.lineWidth = this.edge; ctx.lineJoin = 'round';
ctx.lineCap = 'butt'; if (useBlurredShadows) {(ctx
).shadowOffsetY = shift; ctx.shadowBlur = this.edge;
ctx.shadowColor = "black";}; ctx.strokeStyle = (this
).cachedClrDark; ctx.beginPath(); ctx.moveTo(shift,
h - r); ctx.arc(r, r, r - shift, Math.PI, ((Math.PI
) * 3/2), false); ctx.lineTo(w - r, shift); (ctx
).stroke(); ctx.shadowOffsetX = 0; (ctx.shadowOffsetY
) = 0; ctx.shadowBlur = 0; ctx.strokeStyle = (this
).cachedClrBright; ctx.beginPath(); ctx.moveTo(
w - shift, r - this.edge); ctx.arc(w - r, h - r,
r - shift, 0, (Math.PI / 2), false); ctx.lineTo(
r - this.edge, h - shift); ctx.stroke();};};

ReporterSlotMorph.prototype.drawModifiedDiamond = function (
ctx) {if (this.nestedBlock() instanceof ReporterBlockMorph
) {var isArrow = (this.nestedBlock()).isArrow;} else {
var isArrow = false;}; var w = this.width(), h = (this
).height(), h2 = Math.floor(h / 2), r = Math.min((this
).rounding, h2), shift = this.edge / 2, gradient; if (
MorphicPreferences.isFlat) {ctx.fillStyle = (this.color
).toString();} else {var gradient = ctx.createLinearGradient(
0, 0, 0, this.height()); gradient.addColorStop(0, (this.color
).toString()); gradient.addColorStop(1, (this.color.darker(
)).toString()); ctx.fillStyle = gradient;}; ctx.beginPath();
if (isArrow) {ctx.moveTo(this.edge, this.edge); ctx.lineTo(
w - r, this.edge); ctx.lineTo(w - this.edge, h2); ctx.lineTo(
w - r, h - this.edge); ctx.lineTo(0, h - this.edge); ctx.lineTo(
r + (shift / 2), h2 - (shift / 2));} else {ctx.moveTo(shift, h2
); ctx.lineTo(r, this.edge); ctx.lineTo(w - r, this.edge); (ctx
).lineTo(w - this.edge, h2); ctx.lineTo(w - r, h - this.edge);
ctx.lineTo(r, h - this.edge);}; ctx.closePath(); ctx.fill(); if (
!(MorphicPreferences.isFlat)) {ctx.lineWidth = this.edge; (ctx
).lineJoin = 'round'; ctx.lineCap = 'butt'; if (useBlurredShadows
) {ctx.shadowOffsetY = shift; ctx.shadowBlur = this.edge; (ctx
).shadowColor = "black";}; ctx.strokeStyle = this.cachedClrDark;
ctx.beginPath(); ctx.moveTo((isArrow * r), h2); ctx.lineTo((
!isArrow * r), shift); ctx.lineTo(w - r, shift); ctx.stroke();
ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; (ctx.shadowBlur
) = 0; ctx.strokeStyle = this.cachedClrBright; ctx.beginPath(
); ctx.moveTo((!isArrow * r), h - shift); ctx.lineTo(w - r,
h - shift); ctx.lineTo(w - shift, h2); ctx.stroke();};};

ReporterSlotMorph.prototype.renderReporter = function (ctx) {var borderColor; if (
this.parent) {borderColor = this.parent.color;} else {borderColor = new Color(120,
120, 120);}; this.cachedClr = borderColor.toString(); this.cachedClrBright = ((
borderColor.lighter(this.contrast)).withAlpha(1/2)).toString(); (this.cachedClrDark
) = ((borderColor.darker(this.contrast)).withAlpha(1/2)).toString(); if ((this
).nestedBlock() instanceof ReporterBlockMorph) {if ((this.nestedBlock().isPredicate
) || (this.nestedBlock()).isArrow) {this.drawModifiedDiamond(ctx);} else {
this.drawModifiedRounded(ctx);};} else {this.drawModifiedRounded(ctx);};};

ReporterSlotMorph.prototype.renderPredicate = function (ctx) {var borderColor; if (
this.parent) {borderColor = this.parent.color;} else {borderColor = new Color(120,
120, 120);}; this.cachedClr = borderColor.toString(); this.cachedClrBright = ((
borderColor.lighter(this.contrast)).withAlpha(1/2)).toString(); (this.cachedClrDark
) = ((borderColor.darker(this.contrast)).withAlpha(1/2)).toString(); if ((this
).nestedBlock() instanceof ReporterBlockMorph) {if ((this.nestedBlock().isPredicate
) || (this.nestedBlock()).isArrow) {this.drawModifiedDiamond(ctx);} else {
this.drawModifiedRounded(ctx);};} else {this.drawModifiedDiamond(ctx);};};

ReporterSlotMorph.prototype.emptySlot = function () {
var empty = new ArgMorph, shrink = ((this.rfBorder * 2
) + (this.edge * 2)); empty.color = this.color.lighter(
); empty.alpha = 0; empty.bounds.setExtent(new Point(
((this.fontSize + (this.edge * 2)) * 2) - shrink,
(this.fontSize + (this.edge * 2) - shrink))
); empty.render = nop; return empty;};

// ReporterSlotMorph accessing:

ReporterSlotMorph.prototype.getSpec = function (
) {return (this.isPredicate ? '%p' : '%r');
}; (ReporterSlotMorph.prototype.contents
) = function () {return (this.children)[0];};

ReporterSlotMorph.prototype.nestedBlock = function (
) {var contents = this.contents(); return (((contents
) instanceof BlockMorph) ? contents : null);};

// ReporterSlotMorph evaluating:

ReporterSlotMorph.prototype.evaluate = CommandSlotMorph.prototype.evaluate;
ReporterSlotMorph.prototype.isEmptySlot = CommandSlotMorph.prototype.isEmptySlot;

// ReporterSlotMorph layout:

ReporterSlotMorph.prototype.fixLayout = function () {
    var contents = this.contents();
    this.bounds.setExtent(contents.extent().add(
        this.edge * 2 + this.rfBorder * 2
    ));
    contents.setCenter(this.center());
    if (this.parent) {
        if (this.parent.fixLayout) {
            this.parent.fixLayout();
        }
    }
};

FunctionSlotMorph.prototype.drawRounded = ReporterSlotMorph.prototype.drawModifiedRounded;
FunctionSlotMorph.prototype.drawDiamond = ReporterSlotMorph.prototype.drawModifiedDiamond;

// RingReporterSlotMorph ///////////////////////////////////////////////////

/*
    I am a ReporterBlock-shaped input slot for use in RingMorphs.
    I can nest reporter blocks (both round and diamond) as well
    as command blocks (jigsaw shaped).

    My command spec is %rr for reporters (round) and %rp for
    predicates (diamond)

    evaluate() returns my nested block or null
    (inherited from ReporterSlotMorph
*/

// RingReporterSlotMorph inherits from ReporterSlotMorph:

RingReporterSlotMorph.prototype = new ReporterSlotMorph;
RingReporterSlotMorph.prototype.constructor = RingReporterSlotMorph;
RingReporterSlotMorph.uber = ReporterSlotMorph.prototype;

// ReporterSlotMorph preferences settings:

RingReporterSlotMorph.prototype.rfBorder
    = RingCommandSlotMorph.prototype.rfBorder;

// RingReporterSlotMorph instance creation:

function RingReporterSlotMorph(isPredicate) {this.init(isPredicate);}

RingReporterSlotMorph.prototype.init = function (isPredicate
) {ReporterSlotMorph.uber.init.call(this, isPredicate, true
); this.add(this.emptySlot()); this.contrast = (RingMorph
).prototype.contrast; this.fixLayout();};

// RingReporterSlotMorph accessing:

RingReporterSlotMorph.prototype.getSpec = function (
) {return (this.isPredicate ? '%rp' : '%rr');};

RingReporterSlotMorph.prototype.replaceInput = function (
    source,
    target,
    noVanish
) {
    RingReporterSlotMorph.uber.replaceInput.call(this, source, target);
    if (this.parent instanceof RingMorph && !noVanish) {
        this.parent.vanishForSimilar();
    };
};

// RingReporterSlotMorph nesting for reporters:

RingReporterSlotMorph.prototype.nestedBlock = function (block) {
    if (block) {
        var nb = this.nestedBlock();
        this.replaceInput(this.children[0], block);
        this.fixLayout();
    } else {
        return detect(
            this.children,
            child => child instanceof BlockMorph
        );
    };
};

// RingReporterSlotMorph layout:

RingReporterSlotMorph.prototype.fixLayout = function (
) {RingReporterSlotMorph.uber.fixLayout.call(this);
}; (RingReporterSlotMorph.prototype.fixHolesLayout
) = RingCommandSlotMorph.prototype.fixHolesLayout;

// RingReporterSlotMorph drawing:

RingReporterSlotMorph.prototype.backupRender = function (ctx
    ) {if (MorphicPreferences.isFlat) {return;};
    var borderColor; if (this.parent
    ) {borderColor = this.parent.color;
    } else {borderColor = new Color(
    120, 120, 120);};

    // init
    this.cachedClr = borderColor.toString();
    this.cachedClrBright = borderColor.lighter(this.contrast).toString();
    this.cachedClrDark = borderColor.darker(this.contrast).toString();
    ctx.fillStyle = this.cachedClr;

    // only add 3D-Effect here, rendering of the flat shape happens at the
    // encompassing block level


var state = ((this.nestedBlock() instanceof ReporterBlockMorph) ? (
this.nestedBlock().isPredicate ? 'predicate' : (this.nestedBlock(
).isArrow ? 'arrow' : 'reporter')) : 'reporter'); if (this.getSpec(
) === '%rp') {if ((state === 'predicate') || isNil(this.nestedBlock(
))) {this.drawEdgesDiamond(ctx);} else if (state === 'arrow') {
this.drawEdgesArrow(ctx);} else {this.drawEdgesOval(ctx, (
(this.nestedBlock() instanceof ReporterBlockMorph) ? (this
).nestedBlock().rounding : null));};} else {if ((state
) === 'predicate') {this.drawEdgesDiamond(ctx);} else if (
state === 'arrow') {this.drawEdgesArrow(ctx);} else {
this.drawEdgesOval(ctx, ((this.nestedBlock(
) instanceof ReporterBlockMorph) ? (this
).nestedBlock().rounding : null));};};};

RingReporterSlotMorph.prototype.outlinePath = function (ctx, offset) {
var state = ((this.nestedBlock() instanceof ReporterBlockMorph) ? (
this.nestedBlock().isPredicate ? 'predicate' : (this.nestedBlock(
).isArrow ? 'arrow' : 'reporter')) : 'reporter'); if (this.getSpec(
) === '%rp') {if ((state === 'predicate') || isNil(this.nestedBlock()
)) {this.outlinePathDiamond(ctx, offset);} else if (state === 'arrow'
) {this.outlinePathArrow(ctx, offset);} else {this.outlinePathOval(
ctx, offset, ((this.nestedBlock() instanceof ReporterBlockMorph) ? (
this).nestedBlock().rounding : null));};} else {if (state === 'predicate'
) {this.outlinePathDiamond(ctx, offset);} else if (state === 'arrow') {
this.outlinePathArrow(ctx, offset);} else {this.outlinePathOval(ctx,
offset, ((this.nestedBlock() instanceof ReporterBlockMorph
) ? this.nestedBlock().rounding : null));};};};

RingReporterSlotMorph.prototype.outlinePathOval = function (ctx, offset, rounding) {
    var ox = offset.x,
        oy = offset.y,
        fixedSize = Math.max(this.edge, 1),
        w = this.width(),
        h = this.height(),
        r = Math.min(this.rounding, h / 2) * ((isNil(rounding) ? (9 * fixedSize) : rounding) / (9 * fixedSize));

    // top left:
    if (r === 0) {
    ctx.lineTo(r + this.edge + ox, r + this.edge + oy);
    } else {
    ctx.arc(
        r + this.edge + ox,
        r + this.edge + oy,
        r,
        -(Math.PI),
        -(Math.PI / 2),
        false
    );};

    // top right:
    if (r === 0) {
    ctx.lineTo(w - r - this.edge + ox, r + this.edge + oy);
    } else {
    ctx.arc(
        w - r - this.edge + ox,
        r + this.edge + oy,
        r,
        -(Math.PI / 2),
        0,
        false
    );};

    // bottom right:
    if (r === 0) {
    ctx.lineTo(w - r - this.edge + ox, h - r - this.edge + oy);
    } else {
    ctx.arc(
        w - r - this.edge + ox,
        h - r - this.edge + oy,
        r,
        0,
        (Math.PI / 2),
        false
    );};

    // bottom left:
    if (r === 0) {
    ctx.lineTo(r + this.edge + ox, h - r - this.edge + oy);
    } else {
    ctx.arc(
        r + this.edge + ox,
        h - r - this.edge + oy,
        r,
        (Math.PI / 2),
        Math.PI,
        false
    );};

    // "close" the path
    ctx.lineTo(this.edge + ox, r + this.edge + oy);
};

RingReporterSlotMorph.prototype.drawEdgesOval = function (ctx, rounding) {
    var fixedSize = Math.max(this.edge, 1), h = this.height(),
        r = Math.min(this.rounding, h / 2) * ((isNil(rounding) ? (9 * fixedSize) : rounding) / (9 * fixedSize)),
        w = this.width(),
        shift = this.edge / 2,
        gradient;


    // add 3D-Effect:
    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // bottom left corner
    ctx.strokeStyle = this.cachedClr;
    ctx.beginPath();
    if (r === 0) {
    ctx.lineTo(r, h - r);
    } else {
    ctx.arc(
        r,
        h - r,
        Math.max(r - shift, 0),
        (Math.PI / 2),
        Math.PI,
        false
    );};
    ctx.stroke();

    // top right corner
    ctx.strokeStyle = this.cachedClr;
    ctx.beginPath();
    if (r === 0) {
    ctx.lineTo(w - r, r);
    } else {
    ctx.arc(
        w - r,
        r,
        Math.max(r - shift, 0),
        -(Math.PI / 2),
        0,
        false
    );};
    ctx.stroke();

    // normal gradient edges

    if (useBlurredShadows) {
        ctx.shadowOffsetX = shift;
        ctx.shadowOffsetY = shift;
        ctx.shadowBlur = this.edge;
        ctx.shadowColor = this.color.darker(80).toString();
    }

    // top edge: straight line
    gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(r - shift, shift);
    ctx.lineTo(w - r + shift, shift);
    ctx.stroke();

    // top edge: left corner
    gradient = ctx.createRadialGradient(
        r,
        r,
        Math.max(r - this.edge, 0),
        r,
        r,
        r
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrDark);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    if (r === 0) {
    ctx.moveTo(0, 0);
    } else {
    ctx.arc(
        r,
        r,
        Math.max(r - shift, 0),
        Math.PI,
        (Math.PI * 3/2),
        false
    );};
    ctx.stroke();

    // left edge: straight vertical line
    gradient = ctx.createLinearGradient(0, 0, this.edge, 0);
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(shift, r);
    ctx.lineTo(shift, h - r);
    ctx.stroke();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // bottom edge: right corner
    gradient = ctx.createRadialGradient(
        w - r,
        h - r,
        Math.max(r - this.edge, 0),
        w - r,
        h - r,
        r
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    if (r === 0) {
    ctx.lineTo(w - r, h - r);
    } else {
    ctx.arc(
        w - r,
        h - r,
        Math.max(r - shift, 0),
        0,
        (Math.PI / 2),
        false
    );};
    ctx.stroke();

    // bottom edge: straight line
    gradient = ctx.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(r - shift, h - shift);
    ctx.lineTo(w - r + shift, h - shift);
    ctx.stroke();

    // right edge: straight vertical line
    gradient = ctx.createLinearGradient(w - this.edge, 0, w, 0);
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(w - shift, r + shift);
    ctx.lineTo(w - shift, h - r);
    ctx.stroke();
};

RingReporterSlotMorph.prototype.outlinePathDiamond = function (ctx, offset) {
    var ox = offset.x,
        oy = offset.y,
        w = this.width(),
        h = this.height(),
        h2 = Math.floor(h / 2),
        r = Math.min(this.rounding, h2);

    ctx.moveTo(ox + this.edge, h2 + oy);
    ctx.lineTo(r + this.edge + ox, this.edge + oy);
    ctx.lineTo(w - r - this.edge + ox, this.edge + oy);
    ctx.lineTo(w - this.edge + ox, h2 + oy);
    ctx.lineTo(w - r - this.edge + ox, h - this.edge + oy);
    ctx.lineTo(r + this.edge + ox, h - this.edge + oy);
    ctx.lineTo(ox + this.edge, h2 + oy);
};

RingReporterSlotMorph.prototype.drawEdgesDiamond = function (ctx) {
    var w = this.width(),
        h = this.height(),
        h2 = Math.floor(h / 2),
        r = Math.min(this.rounding, h2),
        shift = this.edge / 2,
        gradient;

    // add 3D-Effect:
    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // half-tone edges
    // bottom left corner
    ctx.strokeStyle = this.cachedClr;
    ctx.beginPath();
    ctx.moveTo(shift, h2);
    ctx.lineTo(r, h - shift);
    ctx.stroke();

    // top right corner
    ctx.strokeStyle = this.cachedClr;
    ctx.beginPath();
    ctx.moveTo(w - shift, h2);
    ctx.lineTo(w - r, shift);
    ctx.stroke();

    // normal gradient edges
    // top edge: left corner

    if (useBlurredShadows) {
        ctx.shadowOffsetX = shift;
        ctx.shadowOffsetY = shift;
        ctx.shadowBlur = this.edge;
        ctx.shadowColor = this.color.darker(80).toString();
    }

    gradient = ctx.createLinearGradient(
        0,
        0,
        r,
        0
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(shift, h2);
    ctx.lineTo(r, shift);
    ctx.stroke();

    // top edge: straight line
    gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(r, shift);
    ctx.lineTo(w - r, shift);
    ctx.stroke();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // bottom edge: right corner
    gradient = ctx.createLinearGradient(
        w - r,
        0,
        w,
        0
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(w - r, h - shift);
    ctx.lineTo(w - shift, h2);
    ctx.stroke();

    // bottom edge: straight line
    gradient = ctx.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(r + shift, h - shift);
    ctx.lineTo(w - r - shift, h - shift);
    ctx.stroke();
};

RingReporterSlotMorph.prototype.outlinePathArrow = function (ctx, offset) {
    var ox = offset.x,
        oy = offset.y,
        w = this.width(),
        h = this.height(),
        h2 = Math.floor(h / 2),
        r = Math.min(this.rounding, h2);

    ctx.moveTo(ox + this.edge, this.edge + oy);
    ctx.lineTo(w - r - this.edge + ox, this.edge + oy);
    ctx.lineTo(w - this.edge + ox, h2 + oy);
    ctx.lineTo(w - r - this.edge + ox, h - this.edge + oy);
    ctx.lineTo(ox + this.edge, h - this.edge + oy);
    ctx.lineTo(r - this.edge + ox, h2 + oy);
    ctx.lineTo(ox + this.edge, this.edge + oy);
};

RingReporterSlotMorph.prototype.drawEdgesArrow = function (ctx) {
    var w = this.width(),
        h = this.height(),
        h2 = Math.floor(h / 2),
        r = Math.min(this.rounding, h2),
        shift = this.edge / 2,
        gradient;

    // add 3D-Effect:
    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // half-tone edges
    // bottom left corner
    ctx.strokeStyle = this.cachedClr;
    ctx.beginPath();
    ctx.moveTo(shift, h - shift);
    ctx.lineTo(r, h2);
    ctx.stroke();

    // top right corner
    ctx.strokeStyle = this.cachedClr;
    ctx.beginPath();
    ctx.moveTo(w - shift, h2);
    ctx.lineTo(w - r, shift);
    ctx.stroke();

    // normal gradient edges
    // top edge: left corner

    if (useBlurredShadows) {
        ctx.shadowOffsetX = shift;
        ctx.shadowOffsetY = shift;
        ctx.shadowBlur = this.edge;
        ctx.shadowColor = this.color.darker(80).toString();
    }

    gradient = ctx.createLinearGradient(
        0,
        0,
        r,
        0
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(shift, shift);
    ctx.lineTo(r, h2);
    ctx.stroke();

    // top edge: straight line
    gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(shift, shift);
    ctx.lineTo(w - r, shift);
    ctx.stroke();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // bottom edge: right corner
    gradient = ctx.createLinearGradient(
        w - r,
        0,
        w,
        0
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(w - r, h - shift);
    ctx.lineTo(w - shift, h2);
    ctx.stroke();

    // bottom edge: straight line
    gradient = ctx.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(shift, h - shift);
    ctx.lineTo(w - r - shift, h - shift);
    ctx.stroke();
};

/*
RingReporterSlotMorph.prototype.outlinePathOval = function (ctx) {
if (this.nestedBlock() instanceof ReporterBlockMorph) {
var rounding = (this.nestedBlock()).rounding;} else {
var rounding = this.rounding;};

    var h = this.height(),
        r = Math.min(rounding, h / 2),
        w = this.width(),
        shift = this.edge / 2,
        gradient;

    // draw the 'flat' shape:
    if (MorphicPreferences.isFlat) {
    ctx.fillStyle = this.color.toString();} else {
    var gradient = ctx.createLinearGradient(0, 0, 0, this.height());
    gradient.addColorStop(0, this.color.toString());
    gradient.addColorStop(1, (this.color.darker()).toString());
    ctx.fillStyle = gradient;};
    ctx.beginPath();
    ctx.arc(
        r,
        r,
        r - this.edge,
        -(Math.PI),
        -(Math.PI / 2),
        false
    );  ctx.arc(
        w - r,
        r,
        r - this.edge,
        -(Math.PI / 2),
        0,
        false
    );  ctx.arc(
        w - r,
        h - r,
        r - this.edge,
        0,
        (Math.PI / 2),
        false
    );  ctx.arc(
        r,
        h - r,
        r - this.edge,
        (Math.PI / 2),
        Math.PI,
        false
    );  ctx.closePath();
    ctx.fill();

    if (!(MorphicPreferences.isFlat)) {
    // add 3D-Effect:
    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';

    if (useBlurredShadows) {
        ctx.shadowOffsetY = shift;
        ctx.shadowBlur = this.edge;
        ctx.shadowColor = "black";
    };

    ctx.strokeStyle = this.cachedClrDark;
    ctx.beginPath();
    ctx.moveTo(shift, h - r);
    ctx.arc(
        r,
        r,
        Math.max(r - shift, 0),
        Math.PI,
        (Math.PI * 3/2),
        false
    );
    ctx.lineTo(w - r + shift, shift);
    ctx.stroke();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    ctx.strokeStyle = this.cachedClrBright;
    ctx.beginPath();
    ctx.moveTo(w - shift, r + shift);
    ctx.arc(
        w - r,
        h - r,
        Math.max(r - shift, 0),
        0,
        (Math.PI / 2),
        false
    );
    ctx.lineTo(r - shift, h - shift);
    ctx.stroke();
};};

RingReporterSlotMorph.prototype.outlinePathDiamond = function (
ctx) {if (this.nestedBlock() instanceof ReporterBlockMorph
) {var isArrow = (this.nestedBlock()).isArrow;} else {
var isArrow = false;}; var w = this.width(), h = (this
).height(), h2 = Math.floor(h / 2), r = Math.min((this
).rounding, h2), shift = this.edge / 2, gradient; if (
MorphicPreferences.isFlat) {ctx.fillStyle = (this.color
).toString();} else {var gradient = ctx.createLinearGradient(
0, 0, 0, this.height()); gradient.addColorStop(0, (this.color
).toString()); gradient.addColorStop(1, (this.color.darker(
)).toString()); ctx.fillStyle = gradient;}; ctx.beginPath();
if (isArrow) {ctx.moveTo(this.edge, this.edge); ctx.lineTo(
w - r, this.edge); ctx.lineTo(w - this.edge, h2); ctx.lineTo(
w - r, h - this.edge); ctx.lineTo(0, h - this.edge); ctx.lineTo(
r + (shift / 2), h2 - (shift / 2));} else {ctx.moveTo(shift, h2
); ctx.lineTo(r, this.edge); ctx.lineTo(w - r, this.edge); (ctx
).lineTo(w - this.edge, h2); ctx.lineTo(w - r, h - this.edge);
ctx.lineTo(r, h - this.edge);}; ctx.closePath(); ctx.fill(); if (
!(MorphicPreferences.isFlat)) {ctx.lineWidth = this.edge; (ctx
).lineJoin = 'round'; ctx.lineCap = 'butt'; if (useBlurredShadows
) {ctx.shadowOffsetY = shift; ctx.shadowBlur = this.edge; (ctx
).shadowColor = "black";}; ctx.strokeStyle = this.cachedClrDark;
ctx.beginPath(); ctx.moveTo((isArrow * r), h2); ctx.lineTo((
!isArrow * r), shift); ctx.lineTo(w - r, shift); ctx.stroke();
ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; (ctx.shadowBlur
) = 0; ctx.strokeStyle = this.cachedClrBright; ctx.beginPath(
); ctx.moveTo((!isArrow * r), h - shift); ctx.lineTo(w - r,
h - shift); ctx.lineTo(w - shift, h2); ctx.stroke();};};
*/

// CommentMorph //////////////////////////////////////////////////////////

/*
    I am an editable, multi-line non-scrolling text window. I can be collapsed
    to a single abbreviated line or expanded to full. My width can be adjusted
    by the user, by height is determined by the size of my text body. I can be
    either placed in a scripting area or "stuck" to a block.
*/

// CommentMorph inherits from BoxMorph:

CommentMorph.prototype = new BoxMorph;
CommentMorph.prototype.constructor = CommentMorph;
CommentMorph.uber = BoxMorph.prototype;

// CommentMorph preferences settings (pseudo-inherited from SyntaxElement):

CommentMorph.prototype.refreshScale = function () {
    CommentMorph.prototype.fontSize = SyntaxElementMorph.prototype.fontSize;
    CommentMorph.prototype.padding = 5 * SyntaxElementMorph.prototype.scale;
    CommentMorph.prototype.rounding = 8 * SyntaxElementMorph.prototype.scale;
};

CommentMorph.prototype.refreshScale();

// CommentMorph instance creation:

function CommentMorph (contents
) {this.init(contents);};

CommentMorph.prototype.titleColor = new Color(255, 255, 165);

CommentMorph.prototype.init = function (contents
) {var scale = SyntaxElementMorph.prototype.scale;
this.block = null; this.stickyOffset = null; (this
).isCollapsed = false; this.titleBar = new BoxMorph(
this.rounding, scale, CommentMorph.prototype.titleColor
);  this.titleBar.color = (CommentMorph.prototype
).titleColor; this.titleBar.setHeight(fontHeight(
SyntaxElementMorph.prototype.fontSize) + this.padding
); this.title = null; this.arrow = new ArrowMorph('down',
this.fontSize, 0, new Color(128, 128, 105)); (this.arrow
).mouseClickLeft = (() => this.toggleExpand()); (this
).contents = new TextMorph((contents || localize(
'Please edit\nthis comment.')), (SyntaxElementMorph
).prototype.fontSize, 'sans-serif', false, false,
null, null, 'blockGlobalFont', 0, null); (this
).contents.isEditable = true; (this.contents
).enableSelecting(); this.contents.maxWidth = (
Math.round((this.contents).width()) + (4 * scale
)); this.contents.fixLayout(); this.handle = (
new HandleMorph(this.contents, (this.contents
).maxWidth, (this.fontSize * 2), 4, 4, ('move'
).concat('Horizontal'))); (this.handle.color
) = new Color(136, 136, 136); (this.handle
).setExtent(new Point(12 * scale, 12 * scale
)); this.anchor = null; (CommentMorph.uber
).init.call(this, this.rounding, scale,
new Color(255, 255, 160)); this.color = (
new Color(255, 255, 210)); (this.isDraggable
) = true; this.cursorStyle = 'grab'; (this
).titleBar.cursorStyle = 'grab'; (this
).cursorGrabStyle = 'grabbing'; (this
).titleBar.cursorGrabStyle = 'grabbing';
this.add(this.titleBar); this.add((this
).arrow); this.add(this.contents); (this
).add(this.handle); this.fixLayout();};

// CommentMorph ops:

CommentMorph.prototype.fullCopy = function () {
    var cpy = new CommentMorph(this.contents.text);
    cpy.isCollapsed = this.isCollapsed;
    cpy.setTextWidth(this.textWidth());
    if (this.selectionID) { // for copy on write
        cpy.selectionID = true;
    };  return cpy;
};

CommentMorph.prototype.setTextWidth = function (pixels) {
    this.contents.maxWidth = pixels;
    this.contents.fixLayout();
    this.fixLayout();
};

CommentMorph.prototype.textWidth = function (
) {return this.contents.maxWidth;};

CommentMorph.prototype.text = function (
) {return this.contents.text;};

CommentMorph.prototype.toggleExpand = function () {
this.isCollapsed = !this.isCollapsed; this.fixLayout();
this.align(); if (!this.isCollapsed) {this.comeToFront();};};

CommentMorph.prototype.comeToFront = function () {if (
this.parent) {this.parent.add(this); this.changed();};};

// CommentMorph events:

CommentMorph.prototype.mouseClickLeft = function (
) {this.comeToFront();};

// CommentMorph layout:

CommentMorph.prototype.layoutChanged = function () {
    // react to a change of the contents area
    var ide = this.parentThatIsA(IDE_Morph);
    this.fixLayout();
    this.align();
    this.comeToFront();
    if (ide) {
        ide.recordUnsavedChanges();
    };
};

CommentMorph.prototype.fixLayout = function () {
var label, tw = this.contents.width() + 2 * this.padding;

    if (this.title) {
        this.title.destroy();
        this.title = null;
    };  if (this.isCollapsed) {
        this.contents.hide();
        this.title = new FrameMorph;
        this.title.alpha = 0;
        this.title.acceptsDrops = false;
        label = new StringMorph(
            this.contents.text,
            SyntaxElementMorph.prototype.fontSize,
            'sans-serif',
            true,
           false,
          false,
         0,
        null,
        BLACK,
        'blockGlobalFont'
        );  label.rootForGrab = () => this;
        this.title.add(label);
        this.title.setHeight(label.height());
        this.title.setWidth(
            tw - this.arrow.width() - this.padding * 2 - this.rounding
        );  this.add(this.title);
    } else {
        this.contents.show();
    };  this.titleBar.setWidth(tw);
    this.contents.setLeft(this.titleBar.left() + this.padding);
    this.contents.setTop(this.titleBar.bottom() + this.padding);
    this.arrow.direction = this.isCollapsed ? 'right' : 'down';
    this.arrow.rerender();
    this.arrow.setCenter(this.titleBar.center());
    this.arrow.setLeft(this.titleBar.left() + this.padding);
    if (this.title) {
        this.title.setPosition(
            this.arrow.topRight().add(new Point(this.padding, 0))
        );
    };  this.changed();
    this.bounds.setHeight(
        this.titleBar.height()
            + (this.isCollapsed ? 0 :
                    this.padding
                        + this.contents.height()
                        + this.padding)
    );  this.bounds.setWidth(this.titleBar.width());
    this.rerender();
    this.handle.fixLayout();
};

CommentMorph.prototype.userCut = function (
) {window.blockCopy = this.fullCopy();
this.selectForEdit().destroy();};

// CommentMorph menu:

CommentMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this);

    menu.addItem(
        "duplicate",
        () => {
            var dup = this.fullCopy(),
                ide = this.parentThatIsA(IDE_Morph),
                blockEditor = this.parentThatIsA(BlockEditorMorph),
                world = this.world();
            dup.pickUp(world);
            // register the drop-origin, so the comment can
            // slide back to its former situation if dropped
            // somewhere where it gets rejected
            if (!ide && blockEditor) {
                ide = blockEditor.target.parentThatIsA(IDE_Morph);
            }
            if (ide) {
                world.hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                };
            }
        },
        'make a copy\nand pick it up'
    );
    menu.addItem("delete", 'userDestroy');
    menu.addItem(
        "comment pic...",
        () => {
            var ide = this.parentThatIsA(IDE_Morph) ||
                this.parentThatIsA(BlockEditorMorph)
                    .target.parentThatIsA(IDE_Morph);
            ide.saveCanvasAs(
                this.fullImage(),
                (ide.projectName || localize('untitled')) + ' ' +
                    localize('comment pic')
            );
        },
        'save a picture\nof this comment'
    );
        menu.addItem(
            "copy",
            () => {
                window.blockCopy = this.fullCopy()
            }
        );
        menu.addItem(
            "cut",
            'userCut'
        );
    return menu;
};

CommentMorph.prototype.userDestroy = (
function () {this.selectForEdit().destroy();});

// CommentMorph dragging & dropping

CommentMorph.prototype.prepareToBeGrabbed = function (hand) {
    // disassociate from the block I'm posted to
    if (this.block) {
        this.block.comment = null;
        this.block = null;
    };  if (this.anchor) {
        this.anchor.destroy();
        this.anchor = null;
    };
};

CommentMorph.prototype.selectForEdit =
    SyntaxElementMorph.prototype.selectForEdit;

CommentMorph.prototype.snap = function (hand) {
    // passing the hand is optional (for when blocks are dragged & dropped)
    var scripts = this.parent,
        target;

    if (!(scripts instanceof ScriptsMorph)) {
        return null;
    };  scripts.clearDropInfo();
    target = scripts.closestBlock(this, hand);
    if (target !== null) {
        target.comment = this;
        this.block = target;
        if (this.snapSound) {
            this.snapSound.play();
        };  scripts.lastDropTarget = {element: target};
    };  this.align();
    scripts.lastDroppedBlock = this;
    if (hand) {
        scripts.recordDrop(hand.grabOrigin);
    };

};

// CommentMorph sticking to blocks

CommentMorph.prototype.align = function (topBlock, ignoreLayer) {
    if (this.block) {
        var top = topBlock || this.block.topBlock(),
            affectedBlocks,
            tp,
            bottom,
            rightMost,
            scripts = top.parentThatIsA(ScriptsMorph);
        this.setTop(this.block.top() + this.block.corner);
        tp = this.top();
        bottom = this.bottom();
        affectedBlocks = top.allChildren().filter(child =>
            child instanceof BlockMorph &&
                child.bottom() > tp &&
                    child.top() < bottom
        );  rightMost = Math.max.apply(
            null,
            affectedBlocks.map(block => block.right())
        );

        this.setLeft(rightMost + 5);
        if (!ignoreLayer && scripts) {
            scripts.addBack(this); // push to back and show
        }

        if (!this.anchor) {
            this.anchor = new Morph();
            this.anchor.color = this.titleBar.color;
        }
        this.anchor.setPosition(new Point(
            this.block.right(),
            this.top() + this.edge
        ));
        this.anchor.bounds.corner = new Point(
            this.left(),
            this.top() + this.edge + 1
        );
        this.anchor.rerender();
        this.addBack(this.anchor);
    }
};

CommentMorph.prototype.startFollowing = function (topBlock, world
) {this.align(topBlock); world.add(this); this.addShadow(); (this
).stickyOffset = (this.position()).subtract(this.block.position(
)); this.step = (() => {if (!(this.block)) {this.stopFollowing(
); return;}; this.setPosition((this.block.position()).add((this
).stickyOffset));});}; CommentMorph.prototype.stopFollowing = (
function () {this.removeShadow(); delete this.step;});
CommentMorph.prototype.destroy = function (
) {if (this.block) {this.block.comment = null;
}; CommentMorph.uber.destroy.call(this);};
CommentMorph.prototype.stackHeight = (
function () {return this.height();});

// ScriptFocusMorph //////////////////////////////////////////////////////////

/*
    I offer keyboard navigation for syntax elements, blocks and scripts:

    activate:
      - shift + click on a scripting pane's background
      - shift + click on any block
      - shift + enter in the IDE's edit mode

    stop editing:
      - left-click on scripting pane's background
      - esc

    navigate among scripts:
      - tab: next script
      - backtab (shift + tab): last script

    start editing a new script:
      - shift + enter

    navigate among commands within a script:
      - down arrow: next command
      - up arrow: last command

    navigate among all elements within a script:
      - right arrow: next element (block or input)
      - left arrow: last element

    move the currently edited script (stack of blocks):
      - shift + arrow keys (left, right, up, down)

    editing scripts:

      - backspace:
        * delete currently focused reporter
        * delete command above current insertion mark (blinking)
        * collapse currently focused variadic input by one element

      - enter:
        * edit currently focused input slot
        * expand currently focused variadic input by one element

      - space:
        * activate currently focused input slot's pull-down menu, if any
        * show a menu of reachable variables for the focused input or reporter

      - any other key:
        start searching for insertable matching blocks

      - in menus triggered by this feature:
        * navigate with up / down arrow keys
        * trigger selection with enter
        * cancel menu with esc

      - in the search bar triggered b this feature:
        * keep typing / deleting to narrow and update matches
        * navigate among shown matches with up / down arrow keys
        * insert selected match at the focus' position with enter
        * cancel searching and inserting with esc

    running the currently edited script:
        * shift+ctrl+enter simulates clicking the edited script with the mouse
*/

// ScriptFocusMorph inherits from BoxMorph:

ScriptFocusMorph.prototype = new BoxMorph;
ScriptFocusMorph.prototype.constructor = ScriptFocusMorph;
ScriptFocusMorph.uber = BoxMorph.prototype;

// ScriptFocusMorph instance creation:

function ScriptFocusMorph(editor, initialElement, position) {
    this.init(editor, initialElement, position);
}

ScriptFocusMorph.prototype.init = function (
    editor,
    initialElement,
    position
) {
    this.editor = editor; // a ScriptsMorph
    this.element = initialElement;
    this.atEnd = false;
    ScriptFocusMorph.uber.init.call(this);
    if (this.element instanceof ScriptsMorph) {
        this.setPosition(position);
    }
};

// ScriptFocusMorph keyboard focus:

ScriptFocusMorph.prototype.getFocus = function (world) {
    if (!world) {world = this.world(); }
    if (world && world.keyboardFocus !== this) {
        world.stopEditing();
    }
    world.keyboardFocus = this;
    this.fixLayout();
    this.editor.updateToolbar();
};

// ScriptFocusMorph layout:

ScriptFocusMorph.prototype.fixLayout = function () {
    this.changed();
    if (this.element instanceof CommandBlockMorph ||
            this.element instanceof CommandSlotMorph ||
            this.element instanceof ScriptsMorph) {
        this.manifestStatement();
    } else {
        this.manifestExpression();
    }
    this.editor.add(this); // come to front
    this.scrollIntoView();
    this.changed();
};

ScriptFocusMorph.prototype.manifestStatement = function () {
    var newScript = this.element instanceof ScriptsMorph,
        y = this.element.top();
    this.border = 0;
    this.edge = 0;
    this.alpha = 1;
    this.color = this.editor.feedbackColor;
    this.bounds.setExtent(new Point(
        newScript ?
                SyntaxElementMorph.prototype.hatWidth : this.element.width(),
        Math.max(
            SyntaxElementMorph.prototype.corner,
            SyntaxElementMorph.prototype.feedbackMinHeight
        )
    ));
    if (this.element instanceof CommandSlotMorph) {
        y += SyntaxElementMorph.prototype.corner;
    } else if (this.atEnd) {
        y = this.element.bottom();
    }
    if (!newScript) {
        this.setPosition(new Point(
            this.element.left(),
            y
        ));
    }
    this.fps = 2;
    this.show();
    this.step = function () {
        this.toggleVisibility();
    };
};

ScriptFocusMorph.prototype.manifestExpression = function () {
    this.edge = SyntaxElementMorph.prototype.rounding;
    this.border = Math.max(
        SyntaxElementMorph.prototype.edge,
        3
    );
    this.color = this.editor.feedbackColor.copy();
    this.color.a = 0.5;
    this.borderColor = this.editor.feedbackColor;

    this.bounds = this.element.fullBounds()
        .expandBy(Math.max(
            SyntaxElementMorph.prototype.edge * 2,
            SyntaxElementMorph.prototype.reporterDropFeedbackPadding
        ));
    this.rerender();
    delete this.fps;
    delete this.step;
    this.show();
};

// ScriptFocusMorph editing

ScriptFocusMorph.prototype.trigger = function () {
    var current = this.element;
    if (current instanceof MultiArgMorph) {
        if (current.arrows().children[1].isVisible) {
            current.addInput();
            this.fixLayout();
        };  return;
    };  if (current.parent instanceof TemplateSlotMorph) {
        current.mouseClickLeft();
        return;
    };  if (current instanceof BooleanSlotMorph) {
        current.toggleValue();
        return;
    };  if (current instanceof InputSlotMorph) {
        if (!current.isReadOnly) {
            delete this.fps;
            delete this.step;
            this.hide();
            this.world().onNextStep = () => {
                current.contents().edit();
                current.contents().selectAll();
            };
        } else if (current.choices) {
            current.dropDownMenu(true);
            delete this.fps;
            delete this.step;
            this.hide();
        };
    };
};

ScriptFocusMorph.prototype.menu = function () {
    var current = this.element;
    if (current instanceof InputSlotMorph && current.choices) {
        current.dropDownMenu(true);
        delete this.fps;
        delete this.step;
        this.hide();
    } else {
        this.insertVariableGetter();
    }
};

ScriptFocusMorph.prototype.deleteLastElement = function () {
    var current = this.element;
    if (current.parent instanceof ScriptsMorph) {
        if (this.atEnd || current instanceof ReporterBlockMorph) {
            current.destroy();
            this.element = this.editor;
            this.atEnd = false;
        }
    } else if (current instanceof MultiArgMorph) {
        if (current.arrows().children[0].isVisible) {
            current.removeInput();
        }
    } else if (current instanceof BooleanSlotMorph) {
        if (!current.isStatic) {
            current.setContents(null);
        }
    } else if (current instanceof ReporterBlockMorph) {
        if (!current.isTemplate) {
            this.lastElement();
            current.prepareToBeGrabbed();
            current.destroy();
        }
    } else if (current instanceof CommandBlockMorph) {
        if (this.atEnd) {
            this.element = current.parent;
            current.userDestroy();
        } else {
            if (current.parent instanceof CommandBlockMorph) {
                current.parent.userDestroy();
            }
        }
    }
    this.editor.adjustBounds();
    this.fixLayout();
};

ScriptFocusMorph.prototype.insertBlock = function (block) {
    // insert the block after a short gliding animation
    this.world().add(block);
    block.glideTo(
        this.position(),
        null,
        null,
        () => this.fillInBlock(block)
    );
};

ScriptFocusMorph.prototype.fillInBlock = function (block) {
    var pb, stage, ide, rcvr;
    block.isTemplate = false;
    block.isDraggable = true;

    if (block.snapSound) {
        block.snapSound.play();
    }

    if (this.element instanceof ScriptsMorph) {
        this.editor.add(block);
        this.element = block;
        if (block instanceof CommandBlockMorph) {
            block.setLeft(this.left());
            if (block.isStop()) {
                block.setTop(this.top());
            } else {
                block.setBottom(this.top());
                this.atEnd = true;
            }
        } else {
            block.setCenter(this.center());
            block.setLeft(this.left());
        }
    } else if (this.element instanceof CommandBlockMorph) {
        if (this.atEnd) {
            this.element.nextBlock(block);
            this.element = block;
            this.fixLayout();
        } else {
            // to be done: special case if block.isStop()
            pb = this.element.parent;
            if (pb instanceof ScriptsMorph) { // top block
                block.setLeft(this.element.left());
                block.setBottom(this.element.top() + this.element.corner);
                this.editor.add(block);
                block.nextBlock(this.element);
                this.fixLayout();
            } else if (pb instanceof CommandSlotMorph) {
                pb.nestedBlock(block);
            } else if (pb instanceof RingReporterSlotMorph) {
                block.nextBlock(pb.nestedBlock());
                pb.add(block);
                pb.fixLayout();
            } else if (pb instanceof CommandBlockMorph) {
                pb.nextBlock(block);
            }
        }
    } else if (this.element instanceof CommandSlotMorph) {
        // to be done: special case if block.isStop()
        this.element.nestedBlock(block);
        this.element = block;
        this.atEnd = true;
    } else {
        pb = this.element.parent;
        if (pb instanceof ScriptsMorph) {
            this.editor.add(block);
            block.setPosition(this.element.position());
            this.element.destroy();
        } else {
            pb.replaceInput(this.element, block);
        }
        this.element = block;
    }
    block.fixBlockColor();
    this.editor.adjustBounds();
    // block.scrollIntoView();
    this.fixLayout();

    // register generic hat blocks
    if ((block instanceof CustomDefinitorBlockMorph
    ) || (block.selector === 'receiveCondition')) {
        rcvr = this.editor.scriptTarget();
        if (rcvr) {
            stage = rcvr.parentThatIsA(StageMorph);
            if (stage) {
                stage.enableCustomHatBlocks = true;
                stage.threads.pauseCustomHatBlocks = false;
                ide = stage.parentThatIsA(IDE_Morph);
                if (ide) {
                    ide.controlBar.stopButton.refresh();
                }
            }
        }
    }

    // experimental: if the inserted block has inputs, go to the first one
    if (block.inputs && (block.inputs()).length) {
        this.element = block;
        this.atEnd = false;
        this.nextElement();
    }
};

ScriptFocusMorph.prototype.insertVariableGetter = function () {
    var types = this.blockTypes(),
        vars,
        menu = new MenuMorph();
    if (!types || !contains(types, 'reporter')) {
        return;
    }
    vars = InputSlotMorph.prototype.getVarNamesDict.call(this.element);
    Object.keys(vars).forEach(vName => {
        var block = SpriteMorph.prototype.variableBlock(vName);
        block.addShadow(new Point(3, 3));
        menu.addItem(
            block,
            () => {
                block.removeShadow();
                this.insertBlock(block);
            }
        );
    });
    if (menu.items.length > 0) {
        menu.popup(this.world(), this.element.bottomLeft());
        menu.getFocus();
    }
};

ScriptFocusMorph.prototype.stopEditing = function () {
    this.editor.focus = null;
    this.editor.updateToolbar();
    this.world().keyboardFocus = null;
    this.destroy();
};

// ScriptFocusMorph navigation

ScriptFocusMorph.prototype.lastElement = function () {
    var items = this.items(),
        idx;
    if (!items.length) {
        this.shiftScript(new Point(-50, 0));
        return;
    }
    if (this.atEnd) {
        this.element = items[items.length - 1];
        this.atEnd = false;
    } else {
        idx = items.indexOf(this.element) - 1;
        if (idx < 0) {idx = items.length - 1; }
        this.element = items[idx];
    }
    if (this.element instanceof CommandSlotMorph &&
            this.element.nestedBlock()) {
        this.lastElement();
    } else if (this.element instanceof HatBlockMorph) {
        if (items.length > 1) {
            this.lastElement();
        } else {
            this.atEnd = true;
        }
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.nextElement = function () {
    var items = this.items(), idx, nb;
    if (!items.length) {
        this.shiftScript(new Point(50, 0));
        return;
    }
    idx = items.indexOf(this.element) + 1;
    if (idx >= items.length) {
        idx = 0;
    }
    this.atEnd = false;
    this.element = items[idx];
    if (this.element instanceof CommandSlotMorph) {
        nb = this.element.nestedBlock();
        if (nb) {this.element = nb; }
    } else if (this.element instanceof HatBlockMorph) {
        if (items.length === 1) {
            this.atEnd = true;
        } else {
            this.nextElement();
        }
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.lastCommand = function () {
    var cm = this.element.parentThatIsA(CommandBlockMorph),
        pb;
    if (!cm) {
        if (this.element instanceof ScriptsMorph) {
            this.shiftScript(new Point(0, -50));
        }
        return;
    }
    if (this.element instanceof CommandBlockMorph) {
        if (this.atEnd) {
            this.atEnd = false;
        } else {
            pb = cm.parent.parentThatIsA(CommandBlockMorph);
            if (pb) {
                this.element = pb;
            } else {
                pb = cm.topBlock().bottomBlock();
                if (pb) {
                    this.element = pb;
                    this.atEnd = true;
                }
            }
        }
    } else {
        this.element = cm;
        this.atEnd = false;
    }
    if (this.element instanceof HatBlockMorph && !this.atEnd) {
        this.lastCommand();
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.nextCommand = function () {
    var cm = this.element,
        tb,
        nb,
        cs;
    if (cm instanceof ScriptsMorph) {
        this.shiftScript(new Point(0, 50));
        return;
    }
    while (!(cm instanceof CommandBlockMorph)) {
        cm = cm.parent;
        if (cm instanceof ScriptsMorph) {
            return;
        }
    }
    if (this.atEnd) {
        cs = cm.parentThatIsA(CommandSlotMorph);
        if (cs) {
            this.element = cs.parentThatIsA(CommandBlockMorph);
            this.atEnd = false;
            this.nextCommand();
        } else {
            tb = cm.topBlock().parentThatIsA(CommandBlockMorph);
            if (tb) {
                this.element = tb;
                this.atEnd = false;
                if (this.element instanceof HatBlockMorph) {
                    this.nextCommand();
                }
            }
        }
    } else {
        nb = cm.nextBlock();
        if (nb) {
            this.element = nb;
        } else {
            this.element = cm;
            this.atEnd = true;
        }
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.nextScript = function () {
    var scripts = this.sortedScripts(),
        idx;
    if (scripts.length < 1) {return; }
    if (this.element instanceof ScriptsMorph) {
        this.element = scripts[0];
    }
    idx = scripts.indexOf(this.element.topBlock()) + 1;
    if (idx >= scripts.length) {idx = 0; }
    this.element = scripts[idx];
    this.element.scrollIntoView();
    this.atEnd = false;
    if (this.element instanceof HatBlockMorph) {
        return this.nextElement();
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.lastScript = function () {
    var scripts = this.sortedScripts(),
        idx;
    if (scripts.length < 1) {return; }
    if (this.element instanceof ScriptsMorph) {
        this.element = scripts[0];
    }
    idx = scripts.indexOf(this.element.topBlock()) - 1;
    if (idx < 0) {idx = scripts.length - 1; }
    this.element = scripts[idx];
    this.element.scrollIntoView();
    this.atEnd = false;
    if (this.element instanceof HatBlockMorph) {
        return this.nextElement();
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.shiftScript = function (deltaPoint) {
    var tb;
    if (this.element instanceof ScriptsMorph) {
        this.moveBy(deltaPoint);
    } else {
        tb = this.element.topBlock();
        if (tb && !(tb instanceof PrototypeHatBlockMorph)) {
            tb.moveBy(deltaPoint);
        }
    }
    this.editor.adjustBounds();
    this.fixLayout();
};

ScriptFocusMorph.prototype.newScript = function () {
    var pos = this.position();
    if (!(this.element instanceof ScriptsMorph)) {
        pos = this.element.topBlock().fullBounds().bottomLeft().add(
            new Point(0, 50)
        );
    }
    this.setPosition(pos);
    this.element = this.editor;
    this.editor.adjustBounds();
    this.fixLayout();
};

ScriptFocusMorph.prototype.runScript = function () {
    if (this.element instanceof ScriptsMorph) {return; }
    this.element.topBlock().mouseClickLeft();
};

ScriptFocusMorph.prototype.items = function () {
    if (this.element instanceof ScriptsMorph) {return []; }
    var script = this.element.topBlock();
    return script.allChildren().filter(each =>
        each instanceof SyntaxElementMorph &&
            !(each instanceof TemplateSlotMorph) &&
                (!each.isStatic ||
                    each.choices ||
                    each instanceof BooleanSlotMorph ||
                    each instanceof RingMorph ||
                    each instanceof MultiArgMorph ||
                    each instanceof CommandSlotMorph
                )
    );
};

ScriptFocusMorph.prototype.sortedScripts = function () {
    var scripts = this.editor.children.filter(each =>
        each instanceof BlockMorph
    );
    scripts.sort((a, b) =>
        // make sure the prototype hat block always stays on top
        a instanceof PrototypeHatBlockMorph ? 0 : a.top() - b.top()
    );
    return scripts;
};

// ScriptFocusMorph undo / redo

ScriptFocusMorph.prototype.undrop = function () {
    this.editor.undrop();
};

ScriptFocusMorph.prototype.redrop = function () {
    this.editor.redrop();
};

// ScriptFocusMorph block types

ScriptFocusMorph.prototype.blockTypes = function () {
    // answer an array of possible block types that fit into
    // the current situation, NULL if no block can be inserted

    if (this.element.isTemplate) {return null;};
    if (this.element instanceof ScriptsMorph) {
        return ['hat', 'command', 'reporter', 'predicate', 'arrow', 'ring', 'definitor'];
    }
    if (this.element instanceof CommandSlotMorph) {
        return ['command', 'hat', 'definitor'];
    }
    if (this.element instanceof HatBlockMorph ||
            this.element instanceof DefinitorBlockMorph) {
        return ['command'];
    }
    if (this.element instanceof CommandBlockMorph) {
        if (this.atEnd && this.element.isStop()) {
            return null;
        }
        if (this.element.parent instanceof ScriptsMorph) {
            return ['hat', 'command'];
        }
        return ['command'];
    }
    if (this.element instanceof ReporterBlockMorph) {
        if (contains(['%n', '%clr'], this.element.getSpec())) {
            return ['reporter'];
        }
        return ['reporter', 'predicate', 'arrow', 'ring'];
    }
    if (contains(['%n', '%clr'], this.element.getSpec())) {
        return ['reporter'];
    }
    if (this.element.isStatic) {
        return null;
    }
    return ['reporter', 'predicate', 'arrow', 'ring'];
};

// ScriptFocusMorph keyboard events

ScriptFocusMorph.prototype.processKeyDown = function (event) {
    this.processKeyEvent(
        event,
        this.reactToKeyEvent
    );
};

ScriptFocusMorph.prototype.processKeyUp = function (event) {
    nop(event);
};

ScriptFocusMorph.prototype.processKeyPress = function (event) {
    nop(event);
};

ScriptFocusMorph.prototype.processKeyEvent = function (event, action) {
    var keyName, ctrl, shift;

    //console.log(event.keyCode);
    this.world().hand.destroyTemporaries(); // remove result bubbles, if any
    switch (event.keyCode) {
    case 8:
        keyName = 'backspace';
        break;
    case 9:
        keyName = 'tab';
        break;
    case 13:
        keyName = 'enter';
        break;
    case 16:
    case 17:
    case 18:
        return;
    case 27:
        keyName = 'esc';
        break;
    case 32:
        keyName = 'space';
        break;
    case 37:
        keyName = 'left arrow';
        break;
    case 39:
        keyName = 'right arrow';
        break;
    case 38:
        keyName = 'up arrow';
        break;
    case 40:
        keyName = 'down arrow';
        break;
    default:
        keyName = String.fromCharCode(event.keyCode || event.charCode);
    }
    ctrl = (event.ctrlKey || event.metaKey) ? 'ctrl ' : '';
    shift = event.shiftKey ? 'shift ' : '';
    keyName = ctrl + shift + keyName;
    action.call(this, keyName);
};

ScriptFocusMorph.prototype.reactToKeyEvent = function (key) {
    var evt = key.toLowerCase(), shift = 50, types, vNames;

    // console.log(evt);
    switch (evt) {
    case 'esc':
        return this.stopEditing();
    case 'enter':
        return this.trigger();
    case 'shift enter':
        return this.newScript();
    case 'ctrl shift enter':
        return this.runScript();
    case 'space':
        return this.menu();
    case 'left arrow':
        return this.lastElement();
    case 'shift left arrow':
        return this.shiftScript(new Point(-shift, 0));
    case 'right arrow':
        return this.nextElement();
    case 'shift right arrow':
        return this.shiftScript(new Point(shift, 0));
    case 'up arrow':
        return this.lastCommand();
    case 'shift up arrow':
        return this.shiftScript(new Point(0, -shift));
    case 'down arrow':
        return this.nextCommand();
    case 'shift down arrow':
        return this.shiftScript(new Point(0, shift));
    case 'tab':
        return this.nextScript();
    case 'shift tab':
        return this.lastScript();
    case 'backspace':
        return this.deleteLastElement();
    case 'ctrl z':
        return this.undrop();
    case 'ctrl y':
    case 'ctrl shift z':
        return this.redrop();
    case 'ctrl [': // ignore the first press of the Mac cmd key
        return;
    default:
        types = this.blockTypes();
        if (!(this.element instanceof ScriptsMorph) &&
                types && contains(types, 'reporter')) {
            vNames = Object.keys(this.element.getVarNamesDict());
        };  if (types) {
            delete this.fps;
            delete this.step;
            this.show();
            this.editor.scriptTarget().searchBlocks(
                key,
                types,
                vNames,
                this
            );
        };
    };
};