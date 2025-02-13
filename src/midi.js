/*

    midi.js

    a midi for BYOB Advanced

    written by Alessandro Moisés
    aless01pime@gmail.com

    Copyleft (Ɔ) 2024 by Alessandro Moisés

    This file is part of Snavanced!

    Snavanced! is free software: you can redistribute it and/or modify
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
    needs threads.js

    toc
    ---
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

        MIDSoundSystem
        MIDSoundData
        MIDVoiceData

    credits
    -------
    Alessandro Moisés contributed to create the MIDI Player and the
    MID Interpreter, any MID have the option to use them in any
    script with a MID song creator or player. (FNF', Scratchin'
    Melodii or any rhythm game are wanting to obtain this.)

*/

// Declarations

var MIDSoundSystem = {}; /* {basicHertzValue : BigDec(256),
basicLogarithmicValue : BigDec('59.760344731969152'
), basicSampleRateValue : BigDec(20)}; */

MIDSoundSystem.createWhiteNoise = function (volume, duration) {if (isNil(volume)) {volume = theOne;
} else {volume = (theOne.min(volume.max())).squareRoot(true);}; if (isNil(duration)) {duration = (
MIDSoundSystem.basicSampleRateValue).multiplicateWith(new BigDec('1000'));} else {duration = (
duration.max()).basicRound();}; duration = +(duration.toString()); var i = 0, result = [new List,
new List]; while (i < duration) {result[0].add(volume.getRandomNumberFromSignedUnits());
result[1].add(volume.getRandomNumberFromSignedUnits()); i++;}; return new List(result);};

var MIDSoundData, MIDVoiceData;

// MIDSoundSystem //////////////////////////////////////////////

// MIDSoundData ////////////////////////////////////////////////

// I am a custom MID with any interpreter callbacks included ///////////

function MIDSoundData (name, optional, callback, isEditable) {this.init(name, optional, callback, isEditable);};

MIDSoundData.prototype.init = function (name, optional, callback, isEditable
) {this.name = name; if ((typeof callback) === 'function') {this.callback = (
callback);} else {this.callback = (() => 0);}; this.makeInitialData(720,
optional); this.isEditable = asABool(isEditable); this.defaultOptional = (
optional);}; MIDSoundData.prototype.makeInitialData = function (length,
optional) {this.initialData = []; var i = 0; while (i < length) {(this
).initialData.push(Process.prototype.fixSimpleNumber(this.callback(47,
100, length, (i + 1), optional))); i++;};};

Process.prototype.makeMIDSound = function (note, volume, length, instrument, optional, isNormal) {
var finalData = [], i = 0, selectedMID = ((this.reportTypeOf(instrument) === 'number') ? world.childThatIsA(
IDE_Morph).mids[instrument - 1] : world.childThatIsA(IDE_Morph).mids.filter(mid => (mid.name === instrument)
)[0]); if (selectedMID instanceof MIDSoundData) {var callback = selectedMID.callback;} else {var callback = ((
) => 0); selectedMID = new MIDSoundData(null, 0, (() => 0), false);}; while (i < length) {finalData.push(
Process.prototype.fixSimpleNumber(callback(note, ((asABool(isNormal) ? 1 : (((length > 360) ? (((i + 1) > (
length - 360)) ? (1 - (((i + 1) - (length - 360)) / 360)) : 1) : (1 - (i / length))))) * volume
), length, (i + 1), ((optional instanceof List) ? ((optional.fullCopy().asArray().length === 1) ? Math.max(0,
Math.min(100, optional.fullCopy().asArray()[0])) : (selectedMID.defaultOptional)) : selectedMID.defaultOptional),
selectedMID.initialData))); i = Process.prototype.reportBasicSum(i, 1);}; return new List(finalData);};
/* Makes a list with all of the generated data from a MID to show to the end-user's screen, use any type of MID
to create songs with any type of voices like FNF', use them and I'm going to be more happy thanks to you. :-) */

Process.prototype.makeNoiseSound = function (intensity, length, volume) {
var aList = new List, i = 0; intensity = Math.max(0, Math.min(100, intensity));
while (i < length) {if (intensity > 0) {aList.add(((Process.prototype.reportRound(
Math.random(), new List([Math.round(Math.max(1, Math.min(100, intensity)) - 1)])
) - 0.5) * 2) * (volume / 100));} else {aList.add(0);}; i++;}; if (intensity > 0
) {Process.prototype.doSetListLength(aList, (aList.length() * (intensity / 100)));
Process.prototype.doSetListLength(aList, (aList.length() / (intensity / 100)));};
return aList;}; /* This process creates the called "white noise". :-) */

// MIDVoiceData ////////////////////////////////////////////////

// Is the successor of the MIDSoundData and improves it with voice data included ///////////

MIDVoiceData.prototype = new MIDSoundData;
MIDVoiceData.prototype.constructor = MIDVoiceData;
MIDVoiceData.uber = MIDSoundData.prototype;

function MIDVoiceData (name, data, callback, optional) {this.init(name, data, callback, optional);};

MIDVoiceData.prototype.init = function (name, data, callback, optional) {
this.name = name; if ((typeof callback) === 'function') {this.callback = callback;
} else {this.callback = (() => 0);}; if (data instanceof Array) {
this.initialData = data;} else {this.initialData = [];};
this.isEditable = false; this.defaultOptional = asANum(
optional); /* Inspired by FNF's Sound Samples. Try it,
its cool! :-) */}; MIDVoiceData.prototype.makeInitialData = nop;

/*
var theMorph = new SoundVisualizerMorph(thing
); theMorph.setExtent(new Point(480, 360));
return new Costume(theMorph.fullImage());
*/