/*

    locale.js

    spoken language translation for SNAP!

    written by Jens Mönig

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

    Note to Translators:
    --------------------
    At this stage of development, Snap! can be translated to any LTR language
    maintaining the current order of inputs (formal parameters in blocks).

    Translating Snap! is easy:

    1. Download

    Download the sources and extract them into a local folder on your
    computer:

        <http://snap.berkeley.edu/snapsource/snap.zip>

    Use the Deustch translation file (named 'lang-de.js') as template for your
    own translations. Start with editing the original file, because that way
    you will be able to immediately check the results in your browsers while
    you're working on your translation (keep the local copy of snap.html open
    in your web browser, and refresh it as you progress with your
    translation).

    2. Edit

    Edit the translation file with a regular text editor, or with your
    favorite JavaScript editor.

    In the first non-commented line (the one right below this
    note) replace "de" with the ISO 639-1 code for your language,
    e.g.

        fr - French => lang-fr.js
        it - Italian => lang-it.js
        es - Spanish => lang-es.js
        el - Greek => => lang-el.js
        pt - Portuguese => lang-pt.js

    etc. (see <http://en.wikipedia.org/wiki/ISO_639-1>)

    3. Translate

    Then work through the dictionary, replacing the German strings against
    your translations. The dictionary is a straight-forward JavaScript ad-hoc
    object, for review purposes it should be formatted as follows:

        {
            'English string':
                'Translation string',
            'last key':
                'last value'
        }

    and you only edit the indented value strings. Note that each key-value
    pair needs to be delimited by a comma, but that there shouldn't be a comma
    after the last pair (again, just overwrite the template file and you'll be
    fine).

    If something doesn't work, or if you're unsure about the formalities you
    should check your file with

        <http://JSLint.com>

    This will inform you about any missed commas etc.

    4. Accented characters

    Depending on which text editor and which file encoding you use you can
    directly enter special characters (e.g. Umlaut, accented characters) on
    your keyboard. However, I've noticed that some browsers may not display
    special characters correctly, even if other browsers do. So it's best to
    check your results in several browsers. If you want to be on the safe
    side, it's even better to escape these characters using Unicode.

        see: <http://0xcc.net/jsescape/>

    5. Block specs:

    At this time your translation of block specs will only work
    correctly, if the order of formal parameters and their types
    are unchanged. Placeholders for inputs (formal parameters) are
    indicated by a preceding % prefix and followed by a type
    abbreviation.

    For example:

        'say %s for %n secs'

    can currently not be changed into

        'say %n secs long %s'

    and still work as intended.

    Similarly

        'point towards %dst'

    cannot be changed into

        'point towards %cst'

    without breaking its functionality.

    6. Submit

    When you're done, rename the edited file by replacing the "de" part of the
    filename with the ISO 639-1 code for your language, e.g.

        fr - French => lang-fr.js
        it - Italian => lang-it.js
        es - Spanish => lang-es.js
        el - Greek => => lang-el.js
        pt - Portuguese => lang-pt.js

    and send it to me for inclusion in the official Snap! distribution.
    Once your translation has been included, Your name will the shown in the
    "Translators" tab in the "About Snap!" dialog box, and you will be able to
    directly launch a translated version of Snap! in your browser by appending

        lang:?

    to the URL, ? representing your translation code.


    7. Known issues

    In some browsers accents or ornaments located in typographic ascenders
    above the cap height are currently (partially) cut-off.

    Enjoy!
    -Jens

*/

localize = function anonymous (string) {
return SnapTranslator.translate(string);};

var Localizer;

// Localizer /////////////////////////////////////////////////////////////

function Localizer (language, dict) {this.language = (language || 'en'
); this.dict = (dict || {});}; /* You can translate words in Snap!. */

Localizer.prototype.translate = function (string) {
    string = (isNil(string) ? '' : string); var myself = this,
    translateWithIdiom = ((language) => (isNil(myself.dict[language]) ? string : (
    isNil(myself.dict[language][string]) ? string : myself.dict[language][string])));
    return translateWithIdiom(this.language);
};

Localizer.prototype.languages = function () {
    var property, arr = [];
    for (property in this.dict) {
        if (Object.prototype.hasOwnProperty.call(this.dict, property)) {
            arr.push(property);
        };
    };
    return arr.sort();
};

Localizer.prototype.languageName = function (lang
) {return this.dict[lang].language_name || lang;};

Localizer.prototype.credits = function () {
    var txt = '';
    this.languages().forEach(lang => {
        txt = txt + '\n'
            + this.languageName(lang)
            + ' (' + lang + ') - '
            + this.dict[lang].language_translator
            + ' - ' + this.dict[lang].last_changed;
    });
    return txt;
};

Localizer.prototype.unload = function () {
    var dict,
        keep = ['language_name', 'language_translator', 'last_changed'];
    this.languages().forEach(lang => {
        var key;
        if (lang !== 'en') {
            dict = this.dict[lang];
            for (key in dict) {
                if (Object.prototype.hasOwnProperty.call(dict, key)
                        && !contains(keep, key)) {
                    delete dict[key];
                }
            }
        }
    });
};

var SnapTranslator = new Localizer;

// SnapTranslator initialization

SnapTranslator.dict.es = {
    'language_name':
        'Español',
    'language_translator':
        'Víctor Manuel Muratalla Morales / Cristián Rizzi Iribarren / Alfonso Ruzafa',
    'translator_e-mail':
        'victor.muratalla@yahoo.com / rizzi.cristian@gmail.com',
    'last_changed':
        '2023-01-22',
};

SnapTranslator.dict.tok = {
    'language_name':
        'toki pona',
    'language_translator':
        'Sonja Lang / Alessandro Pinedo',
    'translator_e-mail':
        'aless01pime@gmail.com',
    'last_changed':
        '2023-05-18',
};

SnapTranslator.dict.en = {
    // meta information
    'language_name':
        'English',
    'language_translator':
        'Jens Mönig',
    'translator_e-mail':
        'jens@moenig.org',
    'last_changed':
        '2024-02-03',

    // long strings look-up only
    'file menu import hint':
        'load an exported project file\nor block library, a costume\n'
            + 'or a sound',
    'settings menu prefer empty slots hint':
        'check to focus on empty slots\nwhen dragging & '
                + 'dropping reporters',
    'costumes tab help':
        'import a picture from another web page or from\n'
            + 'a file on your computer by dropping it here\n',
    'block deletion dialog text':
        'Are you sure you want to delete this\n'
            + 'custom block and all its instances?',
    'download to disk text':
        'This item could not be opened in a new tab.\n' +
        'It has been saved to your browser\'s downloads folder.',
    'unable to export text':
        'This item could not be exported from Snap!.\n' +
        'It\'s likely that your project may contain a lot of media ' +
        '(sounds and images) or that you are using an older browser.' +
        'Please try using a recent version of Chrome, Firefox, or Safari.',


'IDIOM MENU STRING' : 'Idiom',
'ZOOM MENU STRING' : 'Zoom blocks',
'ZOOM 1 SIZE' : 'normal (1x)',
'ZOOM 1.2 SIZE' : 'demo (1.2x)',
'ZOOM 1.4 SIZE' : 'presentation (1.4x)',
'ZOOM 1.5 SIZE' : 'master (1.5x)',
'ZOOM 2 SIZE' : 'big (2x)',
'ZOOM 4 SIZE' : 'huge (4x)',
'ZOOM 8 SIZE' : 'giant (8x)',
'ZOOM 10 SIZE' : 'mounstrous (10x)',
'ZOOM TEST STRING 1 INPUTS %c' : 'build %c',
'ZOOM TEST STRING 2' : 'your',
'ZOOM TEST STRING 3' : 'own',
'ZOOM TEST STRING 4' : 'blocks',
'FADING MENU STRING' : 'Fade blocks',
'DEFAULT SPRITE NAME' : 'Sprite',
'THE NAME OF THE STAGE' : 'Stage',
'NO ITEM IN TRASH' : 'No item is on the trash.',
'TRUE' : 'true', 'FALSE' : 'false',

'SELECTOR forward INPUTS %n %optDir' : 'move %n steps %optDir',
'SELECTOR bounceOffEdge' : 'if on edge, bounce',
'SELECTOR turn INPUTS %n degrees' : 'turn $turnRight-1.5 %n degrees',
'SELECTOR turnLeft INPUTS %n degrees' : 'turn $turnLeft-1.5 %n degrees',
'SELECTOR setHeading INPUTS %dir' : 'point in direction %dir',
'SELECTOR doFaceTowards INPUTS %dst' : 'point towards %dst',
'SELECTOR gotoDeviatedXY INPUTS %n %n %optDir' : 'go to x\: %n y\: %n %optDir',
'SELECTOR doGotoObject INPUTS %dst' : 'go to %dst',
'SELECTOR doGlide INPUTS %n %n %n' : 'glide %n secs to x: %n y: %n',
'SELECTOR doMove INPUTS %n %n %optDir' : 'glide %n secs in %n steps %optDir',
'SELECTOR doShake INPUTS %n %n %decay' : 'shake %n secs with force %n %decay',
'SELECTOR doUpdatePosition INPUTS %setAndChange %xAndY %n' : '%setAndChange %xAndY to/by %n',
'SELECTOR getPosition' : 'this position',
'SELECTOR xPosition' : 'x position',
'SELECTOR yPosition' : 'y position',
'SELECTOR direction' : 'direction',
























};