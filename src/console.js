var localFonts = [], snavancedIsRunning = false; async function loadAFont (name, url) {var newFont = new FontFace(name, ('url\(').concat(
window.location.toString().split('snap.html')[0], url, '\)')); try {/* :~) */ await newFont.load(); document.fonts.add(newFont); (localFonts
).push([url, name, newFont]); console.log([url, name, newFont]);} catch (error) {console.error([url, name, error]); localFonts.push([
url, name, newFont]);}; if ((localFonts.length > 18) && !(snavancedIsRunning)) {initSnavanced();};}; function initSnavanced (
) {function detectPreferredLanguage () {if ('language' in navigator) {var selectedLanguage = (navigator.language.split('-'))[
0]; return (contains(Object.keys(SnapTranslator.dict), selectedLanguage) ? selectedLanguage : 'en');} else {return 'en';};};
if (isNil(localStorage['-snap-setting-language'])) {localStorage['-snap-setting-language'] = detectPreferredLanguage();};
snavancedIsRunning = true; if (asABool(sessionStorage['-snap-setting-isDesktopMode'])) {/* world.add(new LoginUIMorph(world)); */
world.add(desk); if (isNil(BlockMorph.prototype.snapSound)) {BlockMorph.prototype.toggleSnapSound();}; document.title = ('Snavanced! '
).concat('- Desktop Mode'); if (true || asABool(localStorage['-snap-notification-newFile'])) {localStorage['-snap-notification-newFile'
] = false; (function () {var i = 0; deskItems.forEach(function (aDeskItem) {aDeskItem.destroy();});})(); deskItems = []; ((function () {
var anArray = [], i = 0, j = 1, storage = window.localStorage; while (i < storage.length) {if ((storage.key(i)).startsWith('-snap-file-'
)) {anArray.push([storage['-snap-file-project-' + j], j]); j++;}; i++;}; return anArray;}).apply(this)).forEach(function (pair) {(deskItems
).push(new FileMorph(pair[0], pair[1]));}); (function () {var i = 0; deskItems.forEach(function (aDeskItem) {desk.add(aDeskItem); (aDeskItem
).bounds.origin = new Point(15 + ((i % 19) * 75), 15 + (Math.floor(i / 19) * 75)); aDeskItem.bounds.corner = new Point((aDeskItem.bounds
).origin.x + 60, aDeskItem.bounds.origin.y + 60); i++;});})();}; function loop () {requestAnimationFrame(loop); world.doOneCycle(); (world
).rerender();};} else {(new IDE_Morph).openIn(world); function loop () {requestAnimationFrame(loop); world.doOneCycle();};}; loop();};

IDE_Morph.prototype.doLog = function (
object) {this.console.push(['log', object
]); this.newLogs = (this.newLogs + 1);};
IDE_Morph.prototype.doWarn = function (
object) {this.console.push(['warn', object
]); this.newLogs = (this.newLogs + 1);};
IDE_Morph.prototype.doError = function (
object) {this.console.push(['error', object
]); this.newLogs = (this.newLogs + 1);};
IDE_Morph.prototype.doInform = function (
object) {this.console.push(['information',
object]); this.newLogs = (this.newLogs + 1);
}; IDE_Morph.prototype.doDebug = function (
object) {this.console.push(['debug', object
]); this.newLogs = (this.newLogs + 1);};
IDE_Morph.prototype.doClear = function (
) {this.newLogs = 0; this.console = [];};

try {console._log = console.log;
console.log = function (object) {
var center = (world.childThatIsA(IDE_Morph
) || world.childThatIsA(DesktopMorph));
if ((center instanceof IDE_Morph) || (
center instanceof DesktopMorph)) {
center.doLog(object);}; this._log(
object);}; /* Modifies the JS. */
console._warn = console.warn;
console.warn = function (object) {
var center = (world.childThatIsA(IDE_Morph
) || world.childThatIsA(DesktopMorph));
if ((center instanceof IDE_Morph) || (
center instanceof DesktopMorph)) {
center.doWarn(object);}; this._warn(
object);}; /* Modifies the JS. */
console._error = console.log;
console.error = function (object) {
var center = (world.childThatIsA(IDE_Morph
) || world.childThatIsA(DesktopMorph));
if ((center instanceof IDE_Morph) || (
center instanceof DesktopMorph)) {
center.doError(object);}; this._error(
object);}; /* Modifies the JS. */
console._info = console.info;
console.info = function (object) {
var center = (world.childThatIsA(IDE_Morph
) || world.childThatIsA(DesktopMorph));
if ((center instanceof IDE_Morph) || (
center instanceof DesktopMorph)) {
center.doInform(object);}; this._info(
object);}; /* Modifies the JS. */
console._debug = console.debug;
console.debug = function (object) {
var center = (world.childThatIsA(IDE_Morph
) || world.childThatIsA(DesktopMorph));
if ((center instanceof IDE_Morph) || (
center instanceof DesktopMorph)) {
center.doDebug(object);}; this._debug(
object);}; /* Modifies the JS. */
console._clear = console.clear;
console.clear = function () {
var center = (world.childThatIsA(IDE_Morph
) || world.childThatIsA(DesktopMorph));
if ((center instanceof IDE_Morph) || (
center instanceof DesktopMorph)) {
center.doClear();}; console._clear(
);}; /* Modifies the JS. */} catch (
error) {console.error(error);};