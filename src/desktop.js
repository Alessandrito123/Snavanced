/*

    desktop.js

    a desktop gui for BYOB Advanced

    written by Alessandro Moisés
    aless01pime@gmail.com

    Copyleft (Ɔ) 2024 by Alessandro Moisés

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
    needs widgets.js, blocks.js and compilers.js

    toc
    ---
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

        LoginUIMorph
        FileMorph
        FolderMorph
        AppMorph
        NormalWindowMorph
        MinimizedWindowMorph
        AboutWindowMorph
        NotificationWindowMorph
        DesktopMorph
        DesktopBarMorph
        DesktopDockMorph
        BatteryVisualizerMorph

    credits
    -------
    Alessandro Moisés contributed to create the desktop of Snavanced!
    and developed its functions. Please use it to manage your own BYOB.

*/

// Declarations

var LoginUIMorph, FileMorph, AppMorph, NormalWindowMorph,
MinimizedWindowMorph, AboutWindowMorph, NotificationWindowMorph,
DesktopMorph, DesktopBarMorph, DesktopDockMorph, BatteryVisualizerMorph;

// LoginUIMorph ////////////////////////////////////////////////

// I am a login waiting zone to change sessions between users ///////////

LoginUIMorph = function LoginUIMorph (world) {this.init(world);}; LoginUIMorph.prototype = new Morph;
LoginUIMorph.prototype.constructor = LoginUIMorph; LoginUIMorph.uber = Morph.prototype;
LoginUIMorph.prototype.init = function (world) {FileMorph.uber.init.call(this);
this.setExtent(world.bounds.corner);if (false) {
this.add(new TextMorph('\nLogin\n', 75, 'sans-serif',
false, false, 'center')); this.children[0].setCenter(
this.bounds.center()); this.children[0].setTop(this.bounds.top()); this.add(
new TextMorph('Password:', 15, 'sans-serif', false, false, 'center'));
this.children[1].setCenter(this.bounds.center());
this.children[1].setTop(this.children[0].bounds.bottom());
this.add(new PushButtonMorph); this.add(new StringFieldMorph);
this.children[3].step = function () {if (this.text instanceof StringMorph) {
this.text.isPassword = true;};};} else {
this.add(new TextMorph('Sorry, the registered users only\ncan access to the local storage.', 75, 'sans-serif',
false, false, 'center'));
this.children[0].setCenter(this.bounds.center());};
}; LoginUIMorph.prototype.step = function () {
if (this.world() instanceof WorldMorph) {
this.setExtent(this.world().bounds.corner);};};

// FileMorph ////////////////////////////////////////////////

// I am any file that you want, please remember me because I'm personalizable like your person ///////////

FileMorph = function FileMorph (contents, id) {this.init(contents, id);}; FileMorph.prototype = new Morph;
FileMorph.prototype.constructor = FileMorph; FileMorph.uber = Morph.prototype;
FileMorph.prototype.init = function (contents, id) {FileMorph.uber.init.call(this);
this.userState = 'normal'; this.color = new Color(Math.round((Math.random() * 127.5) + 127.5),
Math.round((Math.random() * 127.5) + 127.5), Math.round((Math.random() * 127.5) + 127.5));
this.isDraggable = true; this.contents = contents ? contents.toString() : ''; this.id = +id;
this.name = 'file-' + this.id + '.xml'; this.setExtent(new Point(60, 60)); this.rerender();};
FileMorph.prototype.render = function (ctx) {/* draw a page symbol */
var height = this.bounds.height() - 20, width = this.bounds.width(), w = Math.min(width, height) / 2;
ctx.fillStyle = this.color.toString(); ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(w + 10, 0);
ctx.lineTo(w + 10, ((height + 20) / 4)); ctx.lineTo(width - 10, ((height + 20) / 4)); ctx.lineTo(width - 10, height + 5);
ctx.lineTo(10, height + 5); ctx.closePath(); ctx.fill(); ctx.fillStyle = this.color.darker(25).toString();
ctx.beginPath(); ctx.moveTo(w + 10, 0); ctx.lineTo(width - 10, ((height + 20) / 4)); ctx.lineTo(w + 10, ((height + 20) / 4));
ctx.lineTo(w + 10, 0); ctx.closePath(); ctx.fill(); ctx.textAlign = 'left'; ctx.font = '12px sans-serif'; ctx.fillStyle = (
new Color(127.5, 127.5, 127.5)).toString(); ctx.fillText(this.name, 0, height + 17); if (this.userState === 'highlight') {
ctx.strokeWidth = 5; ctx.strokeStyle = (new Color(127.5, 127.5, 127.5)).toString(); ctx.beginPath(); ctx.moveTo(0, 0);
ctx.lineTo(this.bounds.width(), 0); ctx.lineTo(this.bounds.width(), this.bounds.height());
ctx.lineTo(0, this.bounds.height()); ctx.lineTo(0, 0); ctx.stroke(); ctx.closePath();};};
FileMorph.prototype.mouseEnter = function () {this.userState = 'highlight'; this.rerender();};
FileMorph.prototype.mouseLeave = function () {this.userState = 'normal'; this.rerender();};
FileMorph.prototype.contextMenu = function () {var menu = new MenuMorph(this, this.name);
menu.addItem('open', function () {localStorage['-snap-newProjectFile'] = this.contents;
sessionStorage['-snap-setting-isDesktopMode'] = false; location.reload();});
menu.addItem('download', function () {IDE_Morph.prototype.saveXMLAs(this.contents,
(this.name).split('.')[0]);}); menu.addItem('edit color', function () {
this.spawnRGBAEditorDialog(this);}); menu.addItem('delete', function () {
var num = ((function () {var anArray = [], i = 0, j = 0, storage =
window.localStorage; while (i < storage.length) {if (storage.key(i).startsWith('-snap-file-')) {
anArray.push([storage.getItem(storage.key(i)), (j + 1)]); j++;}; i++;};
return j;}).apply(this)); delete localStorage['-snap-file-project-' + this.id];
this.destroy(); localStorage['-snap-notification-newFile'] = true;}); return menu;};
FileMorph.prototype.pickUp = function (wrrld) {this.userState = 'highlight'; this.rerender();
var world = wrrld || this.world(); this.setPosition(world.hand.position(
).subtract(this.extent().divideBy(2))); world.hand.grab(this);};

/*

// FolderMorph ////////////////////////////////////////////////

// I am a folder to save more files inside me ///////////

FolderMorph = function FolderMorph () {this.init();}; FolderMorph.prototype = new Morph;
FolderMorph.prototype.constructor = FolderMorph; FolderMorph.uber = Morph.prototype;
FolderMorph.prototype.init = function () {FolderMorph.uber.init.call(this);
this.isDraggable = true; this.setExtent(new Point(60, 60));};
FolderMorph.prototype.render = function (ctx) {
    // draw a folder symbol
    var height = this.bounds.height(),
        width = this.bounds.width(),
        w = Math.min(width, height) / 2;

    ctx.fillStyle = this.color.toString();
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo((width / 3) + 10, 0);
    ctx.lineTo((width / 3) + 10, (height / 4));
    ctx.lineTo(width - 10, (height / 4));
    ctx.lineTo(width - 10, ((height / 4) * 3));
    ctx.lineTo(10, ((height / 4) * 3));
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fill();
};

*/

// NormalWindowMorph ////////////////////////////////////////////////

// I am with my family, the most common type of windows ///////////

NormalWindowMorph = function NormalWindowMorph (extent, position, titleText, type, icon, fullIcon, optionalData) {
this.init(extent, position, titleText, type, icon, fullIcon, optionalData);}; NormalWindowMorph.prototype = new Morph;
NormalWindowMorph.prototype.constructor = NormalWindowMorph; NormalWindowMorph.uber = Morph.prototype;
NormalWindowMorph.prototype.init = function (extent, position, titleText, type, icon, fullIcon, optionalData) {
NormalWindowMorph.uber.init.call(this); this.cursorStyle = 'move'; this.cursorGrabStyle = 'move'; this.icon = icon || (
new StringMorph('λ', 20, 'sans-serif', false, false, false, null, null, new Color(255, 184, 0), 'ogSnapFontInFileEffort'
)).fullImage(); this.type = type; this.isDraggable = true; this.noDropShadow = true; this.fullShadowSource = false;
this.defaultExtent = extent.copy(); this.defaultPosition = position.copy(); this.titleText = titleText;
this.isMaximized = false; this.setExtent(extent); this.setCenter(position); this.fixShadow();
this.closeButton = new TriggerMorph; this.closeButton.color = new Color(200, 0, 0);
this.closeButton.highlightColor = new Color(255, 0, 0);
this.closeButton.pressColor = new Color(127.5, 0, 0);
this.closeButton.labelString = 'x'; this.closeButton.createLabel();
this.closeButton.setExtent(new Point(20, 20)); this.add(this.closeButton);
this.closeButton.setTop(this.bounds.top());
this.closeButton.setLeft(this.bounds.left());
this.closeButton.action = function () {this.destroy();};
this.closeButton.target = this;
this.minimizeButton = new TriggerMorph; this.minimizeButton.color = new Color(255, 220, 0);
this.minimizeButton.highlightColor = new Color(255, 255, 0);
this.minimizeButton.pressColor = new Color(235, 200, 0);
this.minimizeButton.labelString = '-'; this.minimizeButton.createLabel();
this.minimizeButton.render = function (ctx) {
    var colorBak = this.color;
    if (this.parent.isMaximized) {
        this.color = new Color(127.5, 127.5, 127.5);
    } else if (this.userState === 'highlight') {
        this.color = this.highlightColor;
    } else if (this.userState === 'pressed') {
        this.color = this.pressColor;
    }
    TriggerMorph.uber.render.call(this, ctx);
    this.color = colorBak;
};
this.minimizeButton.setExtent(new Point(20, 20)); this.add(this.minimizeButton);
this.minimizeButton.setTop(this.bounds.top());
this.minimizeButton.setLeft(this.closeButton.bounds.right());
this.minimizeButton.action = function () {if (!this.isMaximized) {
this.parent.removeChild(this); var aMinimizedWindow = new MinimizedWindowMorph(this);
this.parent.add(aMinimizedWindow); aMinimizedWindow.setTop(this.bounds.top());
aMinimizedWindow.setLeft(this.bounds.left());};}; this.minimizeButton.target = this;
this.maximizeButton = new TriggerMorph; this.maximizeButton.color = new Color(0, 200, 0);
this.maximizeButton.highlightColor = new Color(0, 255, 0);
this.maximizeButton.pressColor = new Color(0, 127.5, 0);
this.maximizeButton.labelString = '+'; this.maximizeButton.createLabel();
this.maximizeButton.setExtent(new Point(20, 20)); this.add(this.maximizeButton);
this.maximizeButton.setTop(this.bounds.top());
this.maximizeButton.setLeft(this.minimizeButton.bounds.right());
this.maximizeButton.action = function () {this.resizer.isVisible = this.isMaximized;
this.isDraggable = this.isMaximized; this.cursorGrabStyle = (this.isMaximized ? 'move' : 'auto'
); this.isMaximized = !this.isMaximized; if (this.isMaximized) {this.setTop(this.world(
).bounds.top()); this.setLeft(this.world().bounds.left()); this.setExtent(this.world(
).bounds.extent()); this.parent.add(this);} else {this.setExtent(this.defaultExtent);
this.setCenter(this.defaultPosition);}; this.resizer.setBottom(this.bounds.bottom());
this.resizer.setRight(this.bounds.right()); this.ui.setExtent(new Point(
this.bounds.width(), this.bounds.height() - 20)); this.ui.setCenter(this.bounds.center()
); this.ui.setBottom(this.bounds.bottom()); this.rerender(); this.updateLogo(); this.fixShadow();};
this.maximizeButton.target = this; this.ui = new FrameMorph; this.ui.mouseMove = nop;
if (contains(['aboutSnap'], type)) {this.maximizeButton.hide();
this.ui.contextMenu = function () {var menu = new MenuMorph(this);
return menu;};} else {this.ui.contextMenu = function () {var menu = new MenuMorph(this);
menu.addItem('about...', function () {(this.parentThatIsA(DesktopMorph)).add(new AboutWindowMorph(this.parent));
}); return menu;};}; this.ui.acceptsDrops = false; this.ui.color = WHITE; this.add(this.ui);
this.ui.setExtent(new Point(this.bounds.width(), this.bounds.height() - 20));
this.ui.setCenter(this.bounds.center()); this.ui.setBottom(this.bounds.bottom());
if (type === 'aboutSnap') {this.ui.color = new Color(191.25, 191.25, 191.25);
this.ui.add(new Morph); this.ui.children[0].setExtent(new Point(102, 28));
this.ui.children[0].color = new Color(0, 0, 0, 0); this.ui.children[0].texture = snapLogoTexture;
this.ui.children[0].setCenter(this.ui.bounds.center()); this.ui.children[0].setTop(this.ui.bounds.top() + 6);
this.ui.add(new TextMorph('Snavanced! ' + SnavancedVersion + ' - Desktop Mode (' + LastUpdated + ') \nBuild Your Own Blocks - a reimplementation of Scratch.\nAlessandrito123 '
+ '\(Alessandro Moisés\)\naless01pime@gmail.com\n\nBrian Harvey & Jens Mönig\nbh@cs.berkeley.edu, jens@moenig.org\n\nSnavanced! is an extension of Snap!\n\n      Snap! is '
+ 'developed by the University of California at Berkeley and SAP      \nwith support from the National Science Foundation (NSF),\nMIOsoft and YC Research. Public Domain, all lefts.\nThe design of Snap! '
+ 'is influenced and inspired by Scratch,\n from the Lifelong Kindergarten group at the MIT Media Lab\n\nFor more information, see https://snap.berkeley.edu\nhttps://scratch.mit.edu '
+ 'and https://archive.glitch.pizza\nfor the license, see the license.txt in the main folder.\n If you see a bug, contact to me at aless01pime@gmail.com', 15, 'sans-serif', false,
false, 'center')); this.ui.children[1].setCenter(this.ui.bounds.center()); this.ui.children[1].setTop(this.ui.children[0].bottom() + 5);
} else if (type === 'demo') {(function () {
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

        this.ui.add(foo);
        foo.setCenter(this.ui.bounds.center());
}).apply(this);
} else if (type === 'finder') {
} else if (type === 'calculator') {this.ui.color = new Color(127.5, 127.5, 127.5);
} else if (type === 'jsBlocks') {
this.ui.sprite = new SpriteMorph; this.ui.color = new Color(127.5, 127.5, 127.5);
this.ui.add(new ScrollFrameMorph((function () {var aScriptsPane = new ScriptsMorph;
aScriptsPane._userMenu = aScriptsPane.userMenu; aScriptsPane.userMenu = function () {
var menu = this._userMenu.apply(this); if (this.parentThatIsA(NormalWindowMorph).theFunction.inputs()[0
].nestedBlock() instanceof CommandBlockMorph) {menu.addItem('copy the code to the clipboard', (function () {
try {var result = (new Function(JSBlocksCompiler.apply(this, this.parentThatIsA(NormalWindowMorph).theFunction.inputs(
)[0].nestedBlock().blockSequence()))).toString(); if ("clipboard" in navigator) {navigator.clipboard.writeText(result
).then(() => window.alert(result), () => window.alert('The clipboard failed. \:\'\('));};} catch (error) {
window.alert('An error occurred...\nThe error says\: \"'.concat(error.message, '!!!\"\.'));};}));}; menu.addItem('about...',
function () {(this.parentThatIsA(DesktopMorph)).add(new AboutWindowMorph(this.parentThatIsA(NormalWindowMorph)));}); return menu;};
aScriptsPane.cachedTexture = (function () {var pic = newCanvas(new Point(100, 100)), ctx = pic.getContext('2d'), i; for (i = 0; i < 100; i += 4) {
ctx.fillStyle = (new Color(30, 30, 30)).toString(); ctx.fillRect(i, 0, 1, 100); ctx.fillStyle = (new Color(30, 30, 30)).lighter(5).lighter(2).toString();
ctx.fillRect(i + 1, 0, 1, 100); ctx.fillRect(i + 3, 0, 1, 100); ctx.fillStyle = (new Color(30, 30, 30)).lighter(5).darker(2).toString();
ctx.fillRect(i + 2, 0, 1, 100);}; return pic;}).call(this); aScriptsPane.rerender();
this.theFunction = (function () {var aBlock = new ReporterBlockMorph;
aBlock.setSpec('function \(\) \{ %c \}'); aBlock.setPosition(
aScriptsPane.bounds.topLeft()); aBlock.category = 'other';
aBlock.fixBlockColor(); return aBlock;}).apply(this);
aScriptsPane.add(this.theFunction); this.theFunction.userMenu = nop;
aScriptsPane.add(SpriteMorph.prototype.blockForSelector('reportBoolean'));
aScriptsPane.children.filter(child => (child instanceof BlockMorph) && !(
child === this.theFunction)).forEach(child => {child.isDraggable = true;});
aScriptsPane.setExtent(this.ui.bounds.extent()); aScriptsPane.updateToolbar();
aScriptsPane.rejectsHats = true; aScriptsPane.isDraggable = false;
aScriptsPane.cleanUpMargin = 10; aScriptsPane.cleanUp();
this.maximizeButton.action = function () {this.resizer.isVisible = this.isMaximized;
this.isDraggable = this.isMaximized; this.isMaximized = !this.isMaximized;
if (this.isMaximized) {this.setTop(this.world().bounds.top()); this.setLeft(
this.world().bounds.left()); this.setExtent(this.world().bounds.extent());
this.parent.add(this);} else {this.setExtent(this.defaultExtent);
this.setCenter(this.defaultPosition);}; this.resizer.setBottom(this.bounds.bottom());
this.resizer.setRight(this.bounds.right()); this.ui.setExtent(new Point(
this.bounds.width(), this.bounds.height() - 20)); this.ui.setCenter(this.bounds.center()
); this.ui.setBottom(this.bounds.bottom()); this.ui.childThatIsA(ScrollFrameMorph
).setExtent(this.bounds.extent()); this.rerender(); this.updateLogo();
this.fixShadow();}; return aScriptsPane;}).apply(this)));
this.ui.children[0].padding = 10;
this.ui.children[0].growth = 50;
this.ui.children[0].isDraggable = false;
this.ui.children[0].acceptsDrops = false;
this.ui.children[0].contents.acceptsDrops = true;
this.ui.children[0].setExtent(this.ui.bounds.extent());
this.ui.children[0].setPosition(this.ui.bounds.topLeft());
this.ui.children[0].children[0].scrollFrame = this.ui.children[0];
this.ui.children[0].adjustScrollBars();
} else if (type === 'taskManager') {var theWindows = desk.children.filter(child => (child instanceof NormalWindowMorph) || (child instanceof MinimizedWindowMorph));
}; this.logo = new Morph(); this.logo.cachedTexture = this.icon;
this.logo.setExtent(new Point(this.icon.width, this.icon.height));
this.logo.color = new Color(0, 0, 0, 0); this.add(this.logo);
this.updateLogo(); if (fullIcon) {this.fullLogo = new Morph;
this.fullLogo.cachedTexture = fullIcon; this.fullLogo.setExtent(
new Point(fullIcon.width, fullIcon.height)); this.fullLogo.color = new Color(
0, 0, 0, 0);} else {this.fullLogo = new StringMorph('λ', 30, 'sans-serif',
false, false, false, null, null, new Color(255, 184, 0), 'ogSnapFontInFileEffort'
); this.fullLogo.setExtent(new Point(30, 30));}; this.title = new StringMorph(
this.titleText, 15, 'sans-serif', true, false, false, null, null, WHITE);
this.add(this.title); this.title.rerender(); this.title.setTop(this.bounds.top());
this.resizer = new HandleMorph(this, this.width(), this.height());
this.resizer.mouseDownLeft = function (pos) {
    var world = this.root(),
        offset;

    if (!this.target) {
        return null;
    };
    if (this.type.indexOf('move') === 0) {
        offset = pos.subtract(this.center());
    } else {
        offset = pos.subtract(this.bounds.origin);
    };

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

                if (this.target.ui instanceof Morph) {this.target.ui.setExtent(
                new Point(this.target.bounds.width(), this.target.bounds.height() - 20));
                this.target.ui.setCenter(this.target.bounds.center());
                this.target.ui.setBottom(this.target.bounds.bottom());
                if (this.target.ui.childThatIsA(ScrollFrameMorph)) {
                if (this.target.ui.childThatIsA(ScrollFrameMorph).childThatIsA(ScriptsMorph)) {
                this.target.ui.childThatIsA(ScrollFrameMorph).setExtent(this.target.ui.bounds.extent());
                this.target.ui.childThatIsA(ScrollFrameMorph).childThatIsA(ScriptsMorph).setExtent(this.target.ui.bounds.extent());
                };
                };
                this.target.updateLogo();
                this.target.fixShadow();
                };
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
        };
    };

    if (!this.target.step) {
        this.target.step = nop;
    };
};
if (contains(['aboutSnap'], this.type)) {
this.title.setLeft(this.minimizeButton.bounds.right() + 2.5);
this.resizer.hide();} else {
this.title.setLeft(this.maximizeButton.bounds.right() + 2.5);
}; if (typeof optionalData === 'function') {
try {optionalData.apply(this);} catch (error) {
desk.add(new NotificationWindowMorph('error', error.name,
error.message, [['Ok', (function () {this.destroy();})]]));};};};
NormalWindowMorph.prototype.updateLogo = function () {
this.logo.setCenter(this.closeButton.bounds.center());
this.logo.setRight(this.bounds.right() - ((20 - this.logo.width()) / 2));};
NormalWindowMorph.prototype.contextMenu = function () {
var menu = new MenuMorph(this, ''); return menu;};
NormalWindowMorph.prototype.fixShadow = function () {this.removeShadow(); this.addShadow();};

// MinimizedWindowMorph ////////////////////////////////////////////////

// I am a replacement of a hidden window ///////////

MinimizedWindowMorph = function MinimizedWindowMorph (minimizedWindow) {
this.init(minimizedWindow);}; MinimizedWindowMorph.prototype = new Morph;
MinimizedWindowMorph.prototype.constructor = MinimizedWindowMorph;
MinimizedWindowMorph.uber = Morph.prototype; MinimizedWindowMorph.prototype.init =
function (minimizedWindow) {MinimizedWindowMorph.uber.init.call(this);
this.minimizedWindow = minimizedWindow; this.isDraggable = !this.minimizedWindow.isMaximized;
this.noDropShadow = true; this.fullShadowSource = false; this.setExtent(new Point(
minimizedWindow.bounds.width(), 20)); NormalWindowMorph.prototype.fixShadow.call(this);
this.cursorStyle = 'move'; this.cursorGrabStyle = 'move';
this.normalizeButton = new TriggerMorph;
this.normalizeButton.color = new Color(0, 200, 0);
this.normalizeButton.highlightColor = new Color(0, 255, 0);
this.normalizeButton.pressColor = new Color(0, 127.5, 0);
this.normalizeButton.labelString = '+'; this.normalizeButton.createLabel();
this.normalizeButton.setExtent(new Point(20, 20)); this.add(this.normalizeButton);
this.normalizeButton.setTop(this.bounds.top()); this.normalizeButton.setLeft(this.bounds.left());
this.normalizeButton.action = function () {this.parent.add(this.minimizedWindow);
this.minimizedWindow.setTop(this.bounds.top()); this.minimizedWindow.setLeft(this.bounds.left());
this.destroy();}; this.normalizeButton.target = this;
this.logo = minimizedWindow.logo.fullCopy(); this.add(this.logo);
this.logo.setCenter(this.normalizeButton.bounds.center());
this.logo.setRight(this.bounds.right() - ((20 - this.logo.width()) / 2));
this.title = new StringMorph((minimizedWindow.titleText + ' \(Minimized\)'), 15, 'sans-serif',
true, false, false, null, null, new Color(255, 255, 255), 'morphicGlobalFont');
this.add(this.title); this.title.rerender(); this.title.setTop(this.bounds.top());
this.title.setLeft(this.normalizeButton.bounds.right() + 2.5);};
MinimizedWindowMorph.prototype.contextMenu = function () {
var menu = new MenuMorph(this, ''); return menu;};

// AboutWindowMorph ////////////////////////////////////////////////

// I am a variation of the normal window but reduced only to show an about menu ///////////

AboutWindowMorph = function AboutWindowMorph (aWindow) {
this.init(aWindow);}; AboutWindowMorph.prototype = new Morph;
AboutWindowMorph.prototype.constructor = AboutWindowMorph;
AboutWindowMorph.uber = Morph.prototype; AboutWindowMorph.prototype.init =
function (aWindow) {AboutWindowMorph.uber.init.call(this);
this.noDropShadow = true; NormalWindowMorph.prototype.fixShadow.call(this);
this.setExtent(new Point(500, 500)); this.isDraggable = true;
this.setCenter(aWindow.bounds.center()); NormalWindowMorph.prototype.fixShadow.call(this);
this.cursorStyle = 'move'; this.cursorGrabStyle = 'move'; this.closeButton = new TriggerMorph;
this.closeButton.color = new Color(200, 0, 0);
this.closeButton.highlightColor = new Color(255, 0, 0);
this.closeButton.pressColor = new Color(127.5, 0, 0);
this.closeButton.labelString = 'x'; this.closeButton.createLabel();
this.closeButton.setExtent(new Point(20, 20)); this.add(this.closeButton);
this.closeButton.setTop(this.bounds.top());
this.closeButton.setLeft(this.bounds.left());
this.closeButton.action = function () {this.destroy();};
this.closeButton.target = this;
this.minimizeButton = new TriggerMorph; this.minimizeButton.color = new Color(255, 220, 0);
this.minimizeButton.highlightColor = new Color(255, 255, 0);
this.minimizeButton.pressColor = new Color(235, 200, 0);
this.minimizeButton.labelString = '-'; this.minimizeButton.createLabel();
this.minimizeButton.setExtent(new Point(20, 20)); this.add(this.minimizeButton);
this.minimizeButton.setTop(this.bounds.top());
this.minimizeButton.setLeft(this.closeButton.bounds.right());
this.minimizeButton.action = function () {this.parent.removeChild(this);
var aMinimizedWindow = new MinimizedWindowMorph(this); this.parent.add(aMinimizedWindow);
aMinimizedWindow.setTop(this.bounds.top()); aMinimizedWindow.setLeft(this.bounds.left());
}; this.minimizeButton.target = this; this.ui = new FrameMorph; this.ui.mouseMove = nop;
this.ui.acceptsDrops = false; this.ui.color = new Color(191.25, 191.25, 191.25);
this.add(this.ui); this.ui.setExtent(new Point(this.bounds.width(), this.bounds.height()
- 20)); this.ui.setCenter(this.bounds.center()); this.ui.setBottom(this.bounds.bottom());
this.ui.add(aWindow.fullLogo.fullCopy()); this.ui.children[0].setCenter(this.ui.bounds.center());
this.ui.children[0].setTop(this.ui.bounds.top() + 6);
this.logo = aWindow.logo.fullCopy(); this.add(this.logo);
this.logo.setCenter(this.closeButton.bounds.center());
this.logo.setRight(this.bounds.right() - ((20 - this.logo.width()) / 2));
this.titleText = ('About ' + aWindow.titleText); this.title = new StringMorph(this.titleText,
15, 'sans-serif', true, false, false, null, null, new Color(255, 255, 255));
this.add(this.title); this.title.rerender(); this.title.setTop(this.bounds.top());
this.title.setLeft(this.minimizeButton.bounds.right() + 2.5);
this.ui.add(new TextMorph((function (aWindow) {
var aboutWindowText = aWindow.titleText.concat(' ', SnavancedVersion);
aboutWindowText = aboutWindowText.concat(' - \(', LastUpdated, '\)');
if (aWindow.type === 'finder') {
aboutWindowText = aboutWindowText.concat('\nSnavanced!\'s File Explorer\nTM and \u24B8 1983-2022', ' Apple Inc.');
} else {}; return aboutWindowText;}).apply(this, [aWindow]), 15, 'sans-serif', false, false, 'center')); this.ui.children[
1].parse(); this.ui.children[1].setCenter(this.ui.bounds.center()); this.ui.children[1].setTop(this.ui.children[0].bottom(
) + 5);}; AboutWindowMorph.prototype.contextMenu = function () {var menu = new MenuMorph(this, ''); return menu;};

// NotificationWindowMorph ////////////////////////////////////////////////

// I am a window that shows notification to any user ///////////

NotificationWindowMorph = function NotificationWindowMorph (type, title, body, buttons, icon) {
// startupSound.currentTime = 0; startupSound.play();
this.init(type, title, body, buttons, icon);}; NotificationWindowMorph.prototype = new Morph;
NotificationWindowMorph.prototype.constructor = NotificationWindowMorph;
NotificationWindowMorph.uber = Morph.prototype; NotificationWindowMorph.prototype.init =
function (type, title, body, buttons, icon) {NotificationWindowMorph.uber.init.call(this);
this.cursorStyle = 'move'; this.cursorGrabStyle = 'move'; this.setExtent(new Point(370, 92.5));
this.isDraggable = true; this.noDropShadow = true; NormalWindowMorph.prototype.fixShadow.call(this
); this.setCenter(world.bounds.center()); NormalWindowMorph.prototype.fixShadow.call(this);
this.ui = new FrameMorph; this.ui.mouseMove = nop;
this.ui.acceptsDrops = false; this.ui.color = new Color(191.25, 191.25, 191.25);
this.add(this.ui); this.ui.setExtent(new Point(this.bounds.width(), this.bounds.height()
- 20)); this.ui.setCenter(this.bounds.center()); this.ui.setBottom(this.bounds.bottom());
this.ui.add(new Morph); this.ui.children[0].setExtent(new Point(40, 40));
this.ui.children[0].setPosition(this.ui.bounds.origin.copy().add(new Point(5, 5)));
if (contains(['notification', 'information', 'debugging', 'warning', 'error'], type)) {
DesktopMorph.prototype[type.concat('Sound')].currentTime = 0;
DesktopMorph.prototype[type.concat('Sound')].play();
}; this.ui.children[0].render = function (ctx) {
ctx.lineWidth = (((this.height() + this.width()) / 2) / 30) * 2.5;
ctx.strokeStyle = (new Color(255, 0, 0)).toString(); ctx.beginPath();
ctx.moveTo(0, 0); ctx.lineTo(this.width(), this.height());
ctx.moveTo(0, this.height()); ctx.lineTo(this.width(), 0); ctx.stroke();};
this.title = new StringMorph(title, 15, 'sans-serif', true, false, false, null, null, new Color(255, 255, 255));
this.add(this.title); this.title.rerender(); this.title.setTop(this.bounds.top());
this.title.setLeft(this.bounds.left() + 2.5);
this.ui.add(new TextMorph(body, 15, 'sans-serif', false, false, 'center'));
this.ui.children[1].parse(); this.ui.children[1].setCenter(new Point(
this.ui.bounds.center().x, this.ui.children[0].bounds.origin.y + (this.ui.children[0].bounds.height() / 2)
)); if (buttons instanceof Array) {if (buttons.length > 0) {
this.ui.buttons = (function (buttonsData) {
var i = 0, buttonMorphs = []; while (i < buttonsData.length) {
buttonMorphs.push(new TriggerMorph(this, buttonsData[i][1], buttonsData[i][0])); i++;};
return buttonMorphs;}).apply(this, [buttons]);};}; (function (buttonsData) {
var i = 0; while (i < buttonsData.length) {this.ui.add(buttonsData[i]);
this.ui.children[i + 2].setExtent(this.ui.children[i + 2].label.bounds.extent().add(
new Point(this.ui.children[i + 2].label.fontSize, (this.ui.children[i + 2].label.fontSize / 5))));
this.ui.children[i + 2].setPosition(new Point(
((this.ui.children[i + 1] instanceof TriggerMorph) ? this.ui.children[i + 1].bounds.origin.x : (this.ui.bounds.origin.x + 5))
+ ((this.ui.children[i + 1] instanceof TriggerMorph) ? (this.ui.children[i + 1].bounds.extent().x + 5) : 0),
(this.ui.bounds.corner.y - this.ui.children[i + 2].label.bounds.corner.y
- (this.ui.children[i + 2].label.fontSize / 2)))); i++;};}).apply(this, [this.ui.buttons]);
}; NotificationWindowMorph.prototype.contextMenu = function () {var menu = new MenuMorph(this, ''); return menu;};

// AppMorph ////////////////////////////////////////////////

// I am an app to open new windows related to me if they are not in the desktop ///////////

AppMorph = function AppMorph (type) {this.init(type);}; AppMorph.prototype = new TriggerMorph;
AppMorph.prototype.constructor = AppMorph; AppMorph.uber = TriggerMorph.prototype;
AppMorph.prototype.init = function (type) {AppMorph.uber.init.call(this);
this.setExtent(new Point(30, 30));
if (type === 'finder') {
this.color = new Color(0, 127.5, 255);
this.highlightColor = new Color(127.5, 191.25, 255);
this.pressColor = new Color(0, 63.75, 127.5);
this.hint = 'Finder';
} else if (type === 'calculator') {
this.color = new Color(160, 160, 160);
this.highlightColor = new Color(200, 200, 200);
this.pressColor = new Color(120, 120, 120);
this.hint = 'Calculator';
} else if (type === 'jsBlocks') {
this.color = new Color(255, 220, 0);
this.highlightColor = new Color(255, 255, 0);
this.pressColor = new Color(235, 200, 0);
this.hint = 'JavaScript Blocks';};
/* this.highlightColor = this.color; */
this.type = type;
this.render = function (ctx) {
    var colorBak = this.color;
    if (this.userState === 'highlight') {
        this.color = this.highlightColor;
    } else if (this.userState === 'pressed') {
        this.color = this.pressColor;
    };
    if (this.type === 'finder') {
    ctx.fillStyle = this.color.toString();
    ctx.fillRect(0, 0, ((this.width() / 3) * 2), this.height());
    ctx.fillStyle = (new Color(this.color.b, this.color.b, this.color.b)).toString();
    ctx.fillRect(((this.width() / 3) * 2), 0, (this.width() / 2), this.height());
    ctx.beginPath();
    ctx.moveTo(((this.width() / 3) * 2), 0);
    ctx.lineTo((this.width() / 3), (this.height() / 2));
    ctx.lineTo((this.width() / 2), (this.height() / 2));
    ctx.lineTo(((this.width() / 3) * 2), this.height());
    ctx.lineTo(this.width(), this.height());
    ctx.lineTo(this.width(), 0);
    ctx.lineTo(((this.width() / 3) * 2), 0);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = (((this.height() + this.width()) / 2) / 30) * 2.5;
    ctx.strokeStyle = (new Color(this.color.r, this.color.r, this.color.r)).toString();
    ctx.beginPath();
    ctx.moveTo((this.width() / 6), ((this.height() / 3) * 2));
    ctx.bezierCurveTo((this.width() / 3), (((this.height() / 3) * 2) + (this.height() / 6)),
    ((this.width() / 3) * 2), (((this.height() / 3) * 2) + (this.height() / 6)),
    (((this.width() / 3) * 2) + (this.width() / 6)), ((this.height() / 3) * 2));
    ctx.moveTo(((this.width() / 8) * 2), (this.height() / 5));
    ctx.lineTo(((this.width() / 8) * 2), ((this.height() / 5) * 2));
    ctx.moveTo(((this.width() / 8) * 6), (this.height() / 5));
    ctx.lineTo(((this.width() / 8) * 6), ((this.height() / 5) * 2));
    ctx.stroke();
    } else if (this.type === 'calculator') {
    ctx.fillStyle = this.color.toString();
    ctx.fill();
    ctx.fillStyle = (new Color((this.color.g - 220), (this.color.g - 220), (this.color.g - 220))).toString();
    ctx.font = ((((this.height() + this.width()) / 2) * 0.875).toString()).concat('px times, serif');
    ctx.textAlign = 'left';
    ctx.fillText(' π', (((this.height() + this.width()) / 2) / 30), 24 * (((this.height() + this.width()) / 2) / 30));
    } else if (this.type === 'jsBlocks') {
    ctx.fillStyle = this.color.toString();
    ctx.fill();
    ctx.fillStyle = (new Color((this.color.g - 220), (this.color.g - 220), (this.color.g - 220))).toString();
    ctx.font = ((((this.height() + this.width()) / 2) * 0.875).toString()).concat('px monospace, sans-serif');
    ctx.textAlign = 'left';
    ctx.fillText('JS', (((this.height() + this.width()) / 2) / 30), 24 * (((this.height() + this.width()) / 2) / 30));
    } else {ctx.fillStyle = this.color.toString(); ctx.fill();};
this.color = colorBak;}; this.target = this;
this.action = function () {var userStateBak = this.userState, fullLogo; this.userState = 'normal';
this.rerender(); fullLogo = this.fullImage(); this.setExtent(new Point(20, 20)); this.rerender();
desk.add(new NormalWindowMorph(new Point(500, 500), world.bounds.center(), this.hint, this.type,
this.fullImage(), fullLogo)); this.userState = userStateBak; this.setExtent(new Point(30, 30));
this.rerender();};}; AppMorph.prototype.mouseEnter = function () {this.userState = 'highlight';
this.rerender(); if (this.hint) {
var aBubble = new SpeechBubbleMorph(
        localize(this.hint),
        new Color(255, 255, 255, 0.5),
        0,
        0,
        null,
        0,
        false,
        true
);
aBubble.fixLayout = function () {
    // determine my extent and arrange my contents

    if (this.contentsMorph) {
        this.contentsMorph.destroy();
    };
    this.contentsMorph = new TextMorph(
        this.contents,
        MorphicPreferences.bubbleHelpFontSize * 1.5,
        null,
        false,
        false,
        'center'
    );  this.contentsMorph.color = new Color(40, 40, 40);
    this.contentsMorph.fixLayout(); this.contentsMorph.parse();

    this.add(this.contentsMorph);

    // adjust my layout
    this.bounds.setExtent(
        new Point(
            this.contentsMorph.width() - 3.75 +
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
aBubble.popUp(this.world(), this.topLeft().subtract(new Point(0, (this.height() / 3))));};};

// DesktopMorph ////////////////////////////////////////////////

// I am the desktop, just I'm the entire manager of my related file "desktop.js" ///////////

DesktopMorph = function DesktopMorph (world) {this.init(world);}; DesktopMorph.prototype =
new FrameMorph; DesktopMorph.prototype.constructor = DesktopMorph; DesktopMorph.uber =
FrameMorph.prototype; DesktopMorph.prototype.init = function (world) {
if (isNil(localStorage['snap-desktopStorage'])) {localStorage['snap-desktopStorage'] =
('\{ \"type\"\:\"folder\", \"name\"\:\"Desktop\", \"firstTime\"\:\"').concat( Date.now().toString(), '\", \"lastTime\"\:\"', Date.now().toString(), '\", \"contents\"\:\{\}\}');};
DesktopMorph.uber.init.call(this); this.isDraggable = false; this.step(); this.color = world.color; this.cachedTexture = (function () {
var pic = newCanvas(new Point(100, 100)), ctx = pic.getContext('2d'), i; for (i = 0; i < 100; i += 4) {
ctx.fillStyle = this.color.toString(); ctx.fillRect(i, 0, 1, 100); ctx.fillStyle = this.color.lighter(2).toString();
ctx.fillRect(i + 1, 0, 1, 100); ctx.fillRect(i + 3, 0, 1, 100); ctx.fillStyle = this.color.darker(2).toString();
ctx.fillRect(i + 2, 0, 1, 100);}; return pic;}).call(this); this.rerender(); this.add(new DesktopBarMorph());
this.add(new DesktopDockMorph()); this.add(new FPSMorph);}; DesktopMorph.prototype.step = function (
) {if (this.world() instanceof WorldMorph) {this.setExtent(this.world().bounds.corner);};};
DesktopMorph.prototype.contextMenu = function () {var menu = new MenuMorph(this); menu.addItem('new window',
function () {this.world().hand.add(new NormalWindowMorph(new Point(500, 500), world.bounds.center(),
this.newWindowName(), 'demo')); this.world().hand.children[0].setCenter(this.world().hand.bounds.origin.copy());
}); menu.addItem('clean up', function () {localStorage['-snap-notification-newFile'] = true;}); menu.addItem(
'Programming mode...', function () {sessionStorage['-snap-setting-isDesktopMode'] = false; location.reload();});
menu.addItem('reload...', function () {location.reload();}); menu.addItem(
'open the task manager', function () {this.world().hand.add(new NormalWindowMorph(new Point(500, 500), world.bounds.center(),
'Task Manager', 'taskManager')); this.world().hand.children[0].setCenter(this.world().hand.bounds.origin.copy());});
menu.addItem('save screenshot', (function () {this.screenshot();})); return menu;};
DesktopMorph.prototype.newWindowName = function () {return ('Window ').concat((this.children.filter(child => (child instanceof NormalWindowMorph) || (
child instanceof MinimizedWindowMorph)).filter(child => child instanceof NormalWindowMorph ? !(child.type === 'aboutSnap') : true).length + 1).toString());};
DesktopMorph.prototype.updateStorage = function () {};

(['notification', 'information', 'debugging', 'warning', 'error']).forEach(item => {
DesktopMorph.prototype[item.concat('Sound')] = document.createElement('audio');
DesktopMorph.prototype[item.concat('Sound')].src = ('src/').concat(item, '.wav');});

// DesktopMorph ////////////////////////////////////////////////

// I am the upper bar that appears if you want to discover more aspects of the windows ///////////

DesktopBarMorph = function DesktopBarMorph () {this.init();}; DesktopBarMorph.prototype = new Morph;
DesktopBarMorph.prototype.constructor = DesktopBarMorph; DesktopBarMorph.uber = Morph.prototype; DesktopBarMorph.prototype.init =
function () {DesktopBarMorph.uber.init.call(this); this.hide(); this.setHeight(20); this.alpha = 0.5;
this.startButton = new TriggerMorph;
this.startButton.color = new Color(0, 0, 0, 0);
this.startButton.highlightColor = new Color(255, 255, 255, 0.5);
this.startButton.pressColor = new Color(255, 255, 255, 0.25);
this.startButton.render = function (ctx) {
    var colorBak = this.color;
    if (this.userState === 'pressed') {
        this.color = this.pressColor;
    } else if (this.userState === 'highlight') {
        this.color = this.highlightColor;
    } else {
        this.color = this.color;
    };
    ctx.fillStyle = this.color.toString();
    ctx.fill();
    this.color = colorBak;
    ctx.fillStyle = (new Color(255, 184, 0)).toString();
    ctx.font = '20px ogSnapFontInFileEffortRegular, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('λ', 5, 17);
}; this.startButton.setExtent(new Point(20, 20)); this.add(this.startButton);
this.startButton.action = function () {var menu = new MenuMorph(this);
menu.addItem('about...', function () {desk.add(new NormalWindowMorph(new Point(
500, 420), world.bounds.center(), 'About Snavanced! - Desktop Mode', 'aboutSnap'));});
menu.popup(this.world(), this.bottomLeft());}; this.startButton.target = this;
this.startButton.setCenter(this.bounds.center()); this.startButton.setLeft(this.bounds.left());
this.digitalClock = new StringMorph('', 12.5, 'sans-serif', false, false, false, null, null, WHITE, 'desktopGlobalTimeFont');
this.digitalClock.updateTime = function () {this.text = ('').concat(
localize(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(new Date)['getDay']()]), ' ',
(function (num) {return num >= 10 ? num.toString() : '0'.concat(num.toString());})((new Date)['getDate']()), ' ',
['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][(new Date)['getMonth']()], '.  ',
(function (num) {return num >= 10 ? num.toString() : '0'.concat(num.toString());})((new Date)['getHours']()),
((((new Date)['getSeconds']() % 2) > 0) ? ':' : ' '),
(function (num) {return num >= 10 ? num.toString() : '0'.concat(num.toString());})((new Date)['getMinutes']()),
((((new Date)['getSeconds']() % 2) > 0) ? ':' : ' '),
(function (num) {return num >= 10 ? num.toString() : '0'.concat(num.toString());})((new Date)['getSeconds']()));
this.fixLayout();}; this.add(this.digitalClock); this.batteryViewer = new BatteryVisualizerMorph; this.add(this.batteryViewer);};
DesktopBarMorph.prototype.step = function () {this.setWidth(this.parent.bounds.width()); this.setTop(this.parent.bounds.top());
if (this.world().hand.bounds.origin.y < this.height()) {
if (desk.children.filter(child => (child instanceof NormalWindowMorph) || (child instanceof MinimizedWindowMorph)).filter(child => child.isMaximized).length === 0) {
this.show();} else {this.hide();};} else {this.hide();}; this.parent.add(this);
this.digitalClock.setCenter(this.bounds.center()); this.digitalClock.setRight(this.bounds.right() - 6.25); this.digitalClock.updateTime();
this.batteryViewer.setCenter(this.bounds.center()); this.batteryViewer.setRight(this.digitalClock.bounds.left() - 6.25); this.rerender();};

// DesktopDockMorph ////////////////////////////////////////////////

// I am the dock or the lower part of my hard-working boss, the desktop ///////////

DesktopDockMorph = function DesktopDockMorph () {this.init();}; DesktopDockMorph.prototype = new Morph;
DesktopDockMorph.prototype.constructor = DesktopDockMorph; DesktopDockMorph.uber = Morph.prototype; DesktopDockMorph.prototype.init =
function () {DesktopDockMorph.uber.init.call(this); this.hide(); this.setHeight(60); this.color = new Color(255, 255, 255, 0.5);
this.apps = [new AppMorph('finder'), new AppMorph('calculator'), new AppMorph('jsBlocks')];
(function () {var i = 0; while (i < this.apps.length) {this.add(this.apps[i]); i++;};}).apply(this);};
DesktopDockMorph.prototype.render = function (ctx) {ctx.fillStyle = this.color.copy().toString();
ctx.fillRect(0, 0, this.width(), this.height()); ctx.fillStyle = (new Color(80, 80, 80)).toString();
ctx.beginPath(); var i = 0; while (i < this.apps.length) {if ((desk.children.filter(child => (child
instanceof NormalWindowMorph) || (child instanceof MinimizedWindowMorph)).filter(child => child.type
=== this.apps[i].type).length > 0) || (this.apps[i].type === 'finder')) {ctx.arc((20 + (i * 35
)), ((this.height() / 6) * 5), 2.5, 0, (Math.PI * 2)); ctx.fill();}; i++;}; ctx.closePath();};
DesktopDockMorph.prototype.step = function () {this.setWidth(5 + (this.apps.length * 35)); this.setCenter(this.parent.bounds.center());
this.setBottom(this.parent.bounds.bottom() - (this.height() / 2)); (function () {var i = 0; while (i < this.apps.length) {
this.apps[i].setLeft(this.left() + 5 + (35 * i)); this.apps[i].setTop(this.bounds.top() + (this.height() / 9)); i++;};}).apply(this);
this.parent.add(this); if (this.world().hand.bounds.origin.y > this.bounds.origin.y) {
if (desk.children.filter(child => (child instanceof NormalWindowMorph) || (child instanceof MinimizedWindowMorph)).filter(child => child.isMaximized).length === 0) {
this.show();} else {this.hide();};} else {this.hide();}; this.rerender();}; DesktopDockMorph.prototype.contextMenu = function () {var menu = new MenuMorph(this, ''); return menu;};

// BatteryVisualizerMorph ////////////////////////////////////////////////

// I am just a battery visualizer for your desktop, please see my status to advertise you ///////////

BatteryVisualizerMorph = function BatteryVisualizerMorph () {this.init();}; BatteryVisualizerMorph.prototype = new Morph;
BatteryVisualizerMorph.prototype.constructor = BatteryVisualizerMorph; BatteryVisualizerMorph.uber = Morph.prototype; BatteryVisualizerMorph.prototype.init =
function () {BatteryVisualizerMorph.uber.init.call(this); this.bounds.setExtent(new Point(40, 20));}; BatteryVisualizerMorph.prototype.render =
function (ctx) {if (isNil(world.batteryAPI)) {ctx.fillStyle = (new Color(0, 0, 0, 0)).toString();} else {if (world.batteryAPI.charging) {
ctx.fillStyle = WHITE.toString();} else if (world.batteryAPI.level > 0.25) {ctx.fillStyle = (new Color((340 * ((1.25 + (0 - world.batteryAPI.level)
) - 0.25)), 255, 0)).toString();} else {ctx.fillStyle = (new Color(255, (1020 * world.batteryAPI.level), 0)).toString();};}; ctx.fillRect(0, 0, (
this.bounds.width() * (isNil(world.batteryAPI) ? 0 : world.batteryAPI.level)), this.bounds.height()); ctx.strokeStyle = BLACK.toString(
); ctx.lineWidth = (this.bounds.width() + this.bounds.height()) / 20; ctx.beginPath(); ctx.lineTo(this.bounds.width(), 0); ctx.lineTo(
this.bounds.width(), this.bounds.height()); ctx.lineTo(0, this.bounds.height()); ctx.lineTo(0, 0); ctx.closePath(); ctx.stroke();
ctx.fillStyle = BLACK.toString(); ctx.font = '10px SF Pro Display, sans-serif'; ctx.textAlign = 'left'; if (isNil(
world.batteryAPI)) {ctx.fillText('0', 7.5, 13.75);} else {ctx.fillText(Math.round(
world.batteryAPI.level * 100).toString().concat('%'), 7.5, 13.75);};}; /* This is updated too!!! :D */