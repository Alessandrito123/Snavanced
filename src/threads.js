/*

    threads.js

    a tail call optimized blocks-based programming language interpreter
    based on morphic.js and blocks.js
    inspired by Scratch, Scheme and Squeak

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
    needs blocks.js and objects.js


    toc
    ---
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

        ThreadManager
        Process
        Context
        Variable
        VariableFrame
        JSCompiler

    credits
    -------
    John Maloney and Dave Feinberg designed the original Scratch evaluator
    Ivan Motyashov contributed initial porting from Squeak

*/

// Global stuff ////////////////////////////////////////////////////////

/* global ArgMorph, BlockMorph, CommandBlockMorph, CommandSlotMorph, Morph, ZERO, MultiArgMorph, BLACK, Point,
ReporterBlockMorph, SyntaxElementMorph, HatBlockMorph, contains, Costume, degrees, detect, nop, radians,
ReporterSlotMorph, CSlotMorph, Sound, IDE_Morph, ArgLabelMorph, localize, XML_Element, hex_sha512,
TableDialogMorph, StageMorph, SpriteMorph, StagePrompterMorph, Note, modules, isString, copy,
Map, isNil, WatcherMorph, List, ListWatcherMorph, alert, console, TableMorph, TableFrameMorph,
ColorSlotMorph, isSnapObject, newCanvas, Symbol, SVG_Costume, SnapExtensions, AlignmentMorph, TextMorph, Cloud */

var Numeral = function (number, base) {number = asANum(number); numeral = new Number(asANum(number)); numeral.base = base; numeral.textRepresentation = ''; if ((base < 2) || (base > 36)) {
throw Error('You put in here an illegal base!');}; var dividend = Math.trunc(Math.abs(number)), showChar = (char => ((char < 10) ? char : String.fromCharCode(char + 55)).toString()); while (
!(dividend < base)) {numeral.textRepresentation = (showChar(dividend % base)).concat(numeral.textRepresentation); dividend = Math.trunc(dividend / base);}; numeral.alphabetic = ((Math.sign(
number) == -1) ? '-' : '').concat(showChar(dividend), numeral.textRepresentation); numeral.textRepresentation = (numeral.alphabetic).concat('\(', base, '\)'); numeral.isAlphanumerical = true;
return numeral;}, ComplexNumber = function (real, imag) {try {var number = new Number(asANum(real));} catch (err1) {var number = 0;}; number.isComplex = true; try {number.i = asANum(imag);
} catch (error) {number.i = 0;}; var imaginaryRepresentation = ((Math.abs(number.i) == 1) ? ((number.i > 0) ? 'i' : '-i') : (number.i).toString().concat('i')); number.textRepresentation = (
(number == 0) ? ((number.i == 0) ? '0' : imaginaryRepresentation) : number.toString().concat(((number.i > 0) ? '+' : ''), ((number.i == 0) ? '' : imaginaryRepresentation))); if ((+((number
).i) == 0) && (+number < Infinity)) {number.enableEditing = true;}; return number;}, asAComplexNum = function (n) {var real = +(asANum(n)); try {var imag = (isNil(n.i) ? 0 : +(asANum(n.i)
));} catch (error) {var imag = 0;}; return (new ComplexNumber(real, imag));}; ThreadManager, Process, Context, Variable, VariableFrame; const NONNUMBERS = [true, false, '']; (() => {for (
var i = 9; i <= 13; i += 1) {NONNUMBERS.push(String.fromCharCode(i));}; NONNUMBERS.push(String.fromCharCode(160)); /* "zum Schneckengang verdorben, was Adlerflug geworden wäre" collecting
edge-cases that somebody complained about on Github. Folks, take it easy and keep it fun, okay? This type of things like this is patently ugly and slows Snap!. Thanks, for this. :-( */})(
); function gammaFunction (x) {function gammaln(z) {var lg, z1; if (!(z < 3/2) && (z < 5/2)) {lg = Math.log(helper(z));} else if (!(z < 5/2)) {lg = 0; z1 = z; while (!(z1 < 5/2)) {z1--;
lg+= Math.log(z1);}; lg+= Math.log(helper(z1));} else if (z == 1) {lg = 0;} else {lg = 0; z1 = z; while (z1 < 3/2) {lg-= Math.log(z1); z1++;}; lg+= Math.log(helper(z1));}; return lg;
}; function helper(z) {var p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012,
9.9843695780195716e-6, 1.5056327351493116e-7]; z--; var g = 7, a = p[0], t = (z + g + 1/2); for (var i = 1; (i < p.length); i++) {a += (p[i] / (z + i));}; return (Math.sqrt(
2 * Math.PI) * (t ** (z + 1/2)) * Math.exp(-t) * a);}; var result = Math.exp(gammaln(x)); return (isNaN(result) ? 0 : result);};

function snapEquals(a, b) {if (isNil(a) || isNil(b)) {
return a === b;}; if (a.equalTo || b.equalTo) {if (
a.constructor.name === b.constructor.name) {return (
a.equalTo(b));} else {return false;};}; if ((
a instanceof Array) && (b instanceof Array
)) {return (new List(a.deepMap(item => ((
item instanceof Array) ? new List(item) : (
item))))).equalTo(new List(b.deepMap(item => (
(item instanceof Array) ? new List(item) : item
))));}; var x = +a, y = +b; try {if (a.isComplex
) {x += a.i;};} catch (err1) {}; try {if (b.isComplex
) {y += b.i;};} catch (err2) {}; if (isNaN(x) || isNaN(
y) || [a, b].some(any => contains(NONNUMBERS, any) || (
isString(any) && (any.indexOf(' ') > -1)))) {x = a;
y = b;}; if (isString(x) && isString(y)) {return ((x
).toLowerCase() === y.toLowerCase());}; return (x === y);};

function invoke(
    action, // a BlockMorph or a Context, a reified ("ringified") block
    contextArgs, // optional List of arguments for the context, or null
    receiver, // sprite or environment, optional for contexts
    timeout, // msecs
    timeoutErrorMsg, // string
    suppressErrors, // bool
    callerProcess, // optional for JS-functions
    returnContext // bool
) {
    // execute the given block or context synchronously without yielding.
    // Apply context (not a block) to a list of optional arguments.
    // Receiver (sprite, stage or  environment), timeout etc. are optional.
    // If a timeout (in milliseconds) is specified, abort execution
    // after the timeout has been reached and throw an error.
    // SuppressErrors (bool) if non-timeout errors occurring in the
    // block are handled elsewhere.
    // This is highly experimental.
    // Caution: Kids, do not try this at home!
    // Use ThreadManager.prototype.startProcess with a callback instead

    var proc = new Process, deadline = (
    timeout ? Date.now() + timeout : null);

    if (action instanceof Context) {
        if (receiver) { // optional
            action = proc.reportContextFor(receiver);
        };  proc.initializeFor(action, (contextArgs || new List));
    } else if (action instanceof BlockMorph) {
        proc.topBlock = action;
        if (receiver) {
            proc.homeContext = new Context;
            proc.homeContext.receiver = receiver;
            if (receiver.variables) {
                proc.homeContext.variables.parentFrame = receiver.variables;
            };
        } else {
            throw new Error('expecting a receiver but getting ' + receiver);
        };  proc.context = new Context(
            null, action.blockSequence(
            ), proc.homeContext);
    } else if (action.evaluate) {
        return action.evaluate();
    } else if (action instanceof Function) {
        return action.apply(
            receiver,
            contextArgs.itemsArray().concat(callerProcess)
        );
    } else {
        throw new Error('expecting a block or ring but getting ' + action);
    }; if (suppressErrors) {
        proc.isCatchingErrors = false;
    };  while (proc.isRunning()) {
        if (deadline && (Date.now() > deadline)) {
            throw (new Error(
                localize(
                    timeoutErrorMsg ||
                        "a synchronous Snap! script has timed out")
                )
            );
        };  proc.runStep(deadline);
    };  return returnContext ? proc.homeContext : proc.homeContext.inputs[0];};

// ThreadManager ///////////////////////////////////////////////////////

function ThreadManager () {this.processes = [];
this.wantsToPause = false;}; /* Focus on init. */
ThreadManager.prototype.pauseCustomHatBlocks = false;
ThreadManager.prototype.disableClickToRun = false;

ThreadManager.prototype.toggleProcess = function anonymous (block, receiver) {
if (!(this.disableClickToRun)) {var active = this.findProcess(block, receiver);
if (active) {active.stop(); if (active.context) {if (active.context.activeAudio
) {world.childThatIsA(StageMorph).activeSounds.splice(world.childThatIsA(StageMorph
).activeSounds.indexOf(active.context.activeAudio), 1); active.context.activeAudio.pause(
); active.context.activeAudio = null;};};} else {return this.startProcess(block,
receiver, null, null, null, true, null, null, this.clickFrameFor(block));};};};

ThreadManager.prototype.startProcess = function (
    block,
    receiver,
    isThreadSafe,
    exportResult,
    callback,
    isClicked,
    rightAway,
    atomic,
    variables
) {
    var top = block.topBlock(),
        active = this.findProcess(top, receiver),
        glow,
        newProc;
    if (active) {
        if (isThreadSafe) {
            return active;
        };  active.stop();
        active.canBroadcast = true;
        this.removeTerminatedProcesses();
    };  newProc = new Process(top, receiver,
    callback, isClicked); (newProc.exportResult
    ) = exportResult; newProc.isClicked = (
    isClicked || false); (newProc.isAtomic
    ) = atomic || false;

    // in case an optional variable frame has been passed,
    // copy it into the new outer context.
    // Relevance: When a predicate inside a generic WHEN hat block
    // publishes an upvar, this code makes the upvar accessible
    // to the script attached to the WHEN hat
    if (variables instanceof VariableFrame) {
        Object.keys(variables.vars).forEach(vName =>
            newProc.context.outerContext.variables.vars[
                vName] = variables.vars[vName]
        );
    };  // show a highlight around the running stack
    // if there are more than one active processes for
    // a block, display the thread count next to it
    glow = top.getHighlight();
    if (glow) {
        glow.threadCount = this.processesForBlock(top).length + 1;
        glow.updateReadout();
    } else {
        top.addHighlight();
    };  this.processes.push(newProc);
    if (rightAway) {newProc.runStep(
    );};     return newProc;};

ThreadManager.prototype.stopAll = function (excpt) {this.processes.forEach(
proc => {if (proc !== excpt) {proc.stop();};});}; /* Useful for you. :~) */
ThreadManager.prototype.stopAllForReceiver = function (rcvr, excpt) {this.processes.forEach(proc => {if
(proc.homeContext.receiver === rcvr && proc !== excpt) {proc.stop(); if (rcvr.isTemporary) {proc.isDead = true;};};});};
ThreadManager.prototype.stopAllForBlock = function (aTopBlock) {this.processesForBlock(aTopBlock, true).forEach(proc => proc.stop());};
ThreadManager.prototype.stopProcess = function (block, receiver) {var active = this.findProcess(block, receiver); if (active) {active.stop();};};

ThreadManager.prototype.pauseAll = function (stage) {window.speechSynthesis.pause(); this.processes.forEach(proc => (proc.root instanceof BlockMorph) ? (
(proc.root.selector === 'receiveInteraction') ? ((proc.root.inputs()[0].evaluate() === 'paused') ? null : proc.pause()) : proc.pause()) : proc.pause());
world.childThatIsA(StageMorph).runPauseScripts(); if (stage) {stage.pauseAllActiveSounds();};}; /* The tts will be paused in any cirmcunstance too! :o */
ThreadManager.prototype.isPaused = function anonymous () {return detect(this.processes, (proc => proc.isPaused)) !== null;};
ThreadManager.prototype.resumeAll = function anonymous (stage) {window.speechSynthesis.resume(); this.processes.forEach(
proc => proc.resume()); if (stage) {stage.resumeAllActiveSounds();}; world.childThatIsA(StageMorph).runUnpauseScripts();};

ThreadManager.prototype.step = function anonymous () {
    // run each process until it gives up control, skipping processes
    // for sprites that are currently picked up, then filter out any
    // processes that have been terminated

    var isInterrupted;
    if (Process.prototype.enableSingleStepping) {
        this.processes.forEach(proc => {
            if (proc.isInterrupted) {
                proc.runStep();
                isInterrupted = true;
            } else {
                proc.lastYield = Date.now();
            };
        });
        this.wantsToPause = (Process.prototype.flashTime > 0.5);
        if (isInterrupted) {
            if (this.wantsToPause) {
                this.pauseAll();
            }; return;
        };
    };

    this.processes.forEach(proc => {
        if (!proc.homeContext.receiver.isPickedUp() && !proc.isDead) {
            proc.runStep();
        };
    }); this.removeTerminatedProcesses();
};

ThreadManager.prototype.removeTerminatedProcesses = function () {
    // and un-highlight their scripts
    var remaining = [],
        count;
    this.processes.forEach(proc => {
        var result,
            glow;
        if ((!proc.isRunning() && !proc.errorFlag) || proc.isDead) {
            if (proc.topBlock instanceof BlockMorph) {
                proc.unflash();
                // adjust the thread count indicator, if any
                count = this.processesForBlock(proc.topBlock).length;
                if (count) {
                    glow = proc.topBlock.getHighlight() ||
                        proc.topBlock.addHighlight();
                    glow.threadCount = count;
                    glow.updateReadout();
                } else {
                    proc.topBlock.removeHighlight();
                };
            }; if (proc.prompter) {
                proc.prompter.destroy();
                if (proc.homeContext.receiver.stopTalking) {
                    proc.homeContext.receiver.stopTalking();
                };
            }; if (proc.topBlock instanceof ReporterBlockMorph ||
                    proc.isShowingResult || proc.exportResult) {
                result = proc.homeContext.inputs[0];
                if (proc.onComplete instanceof Function) {
                    proc.onComplete(result);
                } else {
                    if (result instanceof List) {
                        proc.topBlock.showBubble(
                            result.isTable() ?
                                    new TableFrameMorph(
                                        new TableMorph(result, 10)
                                    )
                                    : new ListWatcherMorph(result),
                            proc.exportResult,
                            proc.receiver
                        );
                    } else {
                        proc.topBlock.showBubble(
                            result,
                            proc.exportResult,
                            proc.receiver
                        );
                    }
                }
            } else if (proc.onComplete instanceof Function) {
                proc.onComplete();
            };
        } else {
            remaining.push(proc);
        };
    });
    this.processes = remaining;
};

ThreadManager.prototype.findProcess = function (block, receiver) {
    var top = block.topBlock();
    return detect(
        this.processes,
        each => each.topBlock === top && (each.receiver === receiver)
    );
};

ThreadManager.prototype.processesForBlock = function (block, only) {
    var top = only ? block : block.topBlock();
    return this.processes.filter(each =>
        each.topBlock === top &&
            each.isRunning() &&
                !each.isDead
    );
};

ThreadManager.prototype.doWhen = function (block, receiver, stopIt) {
    if (this.pauseCustomHatBlocks) {return;};
    if ((!block) || this.findProcess(block,
    receiver)) {return;}; var pred = (block
    ).inputs()[0], test; if ((block
    ).removeHighlight()) {if (world
    ) {world.hand.destroyTemporaries();
    };}; if (stopIt) {return;}; try {
        test = invoke(
            pred,
            null,
            receiver,
            50, // timeout in msecs
            'the predicate takes\ntoo long for a\ncustom hat block',
            true, // suppress errors => handle them right here instead
            null, // caller process for JS-functions
            true // return the whole home context instead of just he result
        );
    } catch (error) {
        block.addErrorHighlight();
        block.showBubble(
            error.name
            + '\n'
            + error.message
        );
    }; // since we're asking for the whole context instead of just the result
    // of the computation, we need to look at the result-context's first
    // input to find out whether the condition is met
    if (test === true || (test && test.inputs && test.inputs[0] === true)) {
        this.startProcess(
            block,
            receiver,
            null, // isThreadSafe
            null, // exportResult
            null, // callback
            null, // isClicked
            true,  // rightAway
            null, // atomic
            test.variables // make the test-context's variables available
        );
    };
};

ThreadManager.prototype.toggleSingleStepping = function (
    ) {(Process.prototype.enableSingleStepping
    ) = !(Process.prototype.enableSingleStepping);
    if (!Process.prototype.enableSingleStepping) {
        this.processes.forEach(proc => {
            if (!(proc.isPaused)) {
            proc.unflash();};});};};

ThreadManager.prototype.clickFrameFor = function (block) {
    // private - answer a variable frame or null containing upvar declarations
    // in certain hat blocks if the user manually clicks on them
    var name, frame;
    if (block instanceof HatBlockMorph) {
        if (block.selector === 'receiveKey' ||
                block.selector === 'receiveMessage') {
            name = (((block.inputs())[1]).evaluate())[0];
            if (name) {
                frame = new VariableFrame;
                frame.addVar(name, '');
            return frame;};};}; return null;};

// Process /////////////////////////////////////////////////////////////

/*
    A Process is what brings a stack of blocks to life. The process
    keeps track of which block to run next, evaluates block arguments,
    handles control structures, and so forth.

    The ThreadManager is the (passive) scheduler, telling each process
    when to run by calling its runStep() method. The runStep() method
    will execute some number of blocks, then voluntarily yield control
    so that the ThreadManager can run another process.

    The Scratch etiquette is that a process should yield control at the
    end of every loop iteration, and while it is running a timed command
    (e.g. "wait 5 secs") or a synchronous command (e.g. "broadcast xxx
    and wait"). Since Snap also has lambda and custom blocks Snap adds
    yields at the beginning of each non-atomic custom command block
    execution, and - to let users escape infinite loops and recursion -
    whenever the process runs into a timeout.

    a Process runs for a receiver, i.e. a sprite or the stage or any
    blocks-scriptable object that we will introduce.

    structure:

    topBlock            the stack's first block, of which all others
                        are children
    root                the original parent, your top block's ancestor
    receiver            object (sprite) to which the process applies,
                        cached from the top block
    instrument          musical instrument type, cached from the receiver,
                        so a single sprite can play several instruments
                        at once
    context             the Context describing the current state
                        of this process
    homeContext         stores information relevant to the whole process,
                        i.e. its receiver, result etc.
    isPaused            boolean indicating whether to pause
    readyToYield        boolean indicating whether to yield control to
                        another process
    readyToTerminate    boolean indicating whether the stop method has
                        been called
    debugDialog         the dialog from a block that is going to be debugged
    isDead              boolean indicating a terminated clone process
    timeout             msecs after which to force yield
    lastYield           msecs when the process last yielded
    isFirstStep         boolean indicating whether on first step - for clones
    errorFlag           boolean indicating whether an error was encountered
    prompter            active instance of StagePrompterMorph
    httpRequest         active instance of an HttpRequest or null
    pauseOffset         msecs between the start of an interpolated operation
                        and when the process was paused
    isClicked           boolean flag indicating whether the process was
                        initiated by a user-click on a block
    isShowingResult     boolean flag indicating whether a "report" command
                        has been executed in a user-clicked process
    exportResult        boolean flag indicating whether a picture of the top
                        block along with the result bubble shoud be exported
    onComplete          an optional callback function to be executed when
                        the process is done
    procedureCount      number counting procedure call entries,
                        used to tag custom block calls, so "stop block"
                        invocations can catch them
    flashingContext     for single stepping
    isInterrupted       boolean, indicates intra-step flashing of blocks
    canBroadcast        boolean, used to control reentrancy & "when stopped"
*/

Process.prototype = {}; Process.prototype.constructor = Process;
Process.prototype.timeout = 500; Process.prototype.isCatchingErrors = true;
Process.prototype.enableHyperOps = true; Process.prototype.enableJS = false;
Process.prototype.enableSingleStepping = false; Process.prototype.enableLiveCoding = false;
Process.prototype.flashTime = 0; Process.prototype.enableCompiling = false;

function Process (topBlock, receiver, onComplete, yieldFirst) {
    this.topBlock = topBlock || null;
    this.root = this.topBlock;
    this.receiver = receiver;
    this.instrument = receiver ? receiver.instrument : 1;
    this.readyToYield = false;
    this.readyToTerminate = false;
    this.debugDialog = null;
    this.isDead = false;
    this.isClicked = false;
    this.isShowingResult = false;
    this.errorFlag = false;
    this.context = null;
    this.homeContext = new Context(
    null, null, null, receiver);
    this.lastYield =  Date.now(
    ); this.isFirstStep = true;
    this.isAtomic = false;
    this.prompter = null;
    this.httpRequest = null;
    this.isPaused = false;
    this.pauseOffset = null;
    this.currentTime = Date.now(); // keeping track of time between yields
    this.frameCount = 0; // only used for profiling and debugging
    this.stepFrameCount = 0; // keeping track of when to keep time
    this.yieldCount = 0; // only used for profiling and debugging
    this.exportResult = false;
    this.onComplete = onComplete || null;
    this.procedureCount = 0;
    this.flashingContext = null; // for single-stepping
    this.isInterrupted = false; // for single-stepping
    this.canBroadcast = true; // used to control "when I am stopped"

    if (topBlock) {
        (this.homeContext.variables.parentFrame
        ) = this.homeContext.receiver.variables;
        this.context = new Context(
            null,
            topBlock.blockSequence(
            ),  this.homeContext
        );  if (yieldFirst) {
            this.pushContext('doYield');
        };};};

// Process accessing

Process.prototype.isRunning = function () {return !((this
).readyToTerminate) && (this.context || this.isPaused);};

// Process entry points

Process.prototype.runStep = function (deadline) {
    // a step is an an uninterruptable 'atom', it can consist
    // of several contexts, even of several blocks

    if (this.isPaused) {
        return this.pauseStep();
    };  this.readyToYield = false;
    this.isInterrupted = false;

    // repeatedly evaluate the next context (stack frame) until
    // it's time to yield. In case of WARP or infinite recursive
    // reporters (or long HOFs) emergency-yield every 500 ms.
    // Since looking up the current time at every stack frame puts
    // an amazing strain on performance, only check the system time
    // every n (=100) contexts.
    // This is happens over at evaluateContext().
    while (!this.readyToYield && !this.isInterrupted
            && this.context
            && (this.currentTime - this.lastYield < this.timeout)
    ) {
        // also allow pausing inside atomic steps - for PAUSE block primitive:
        if (this.isPaused) {
            return this.pauseStep();
        };
        if (deadline && (this.currentTime > deadline)) {
            if (this.isAtomic &&
                    this.homeContext.receiver &&
                    this.homeContext.receiver.endWarp) {
                this.homeContext.receiver.endWarp();
            };  return;
        };  this.evaluateContext();
    };

    this.stepFrameCount = 0;
    this.yieldCount += 1;
    this.lastYield = Date.now();
    this.isFirstStep = false;

    // make sure to redraw atomic things
    if (this.isAtomic &&
            this.homeContext.receiver &&
            this.homeContext.receiver.endWarp
        )  {this.homeContext.receiver.endWarp();
        this.homeContext.receiver.startWarp();
    };  if (this.readyToTerminate
        ) {while (this.context
        ) {this.popContext();};
        if (this.homeContext.receiver) {
            if (this.homeContext.receiver.endWarp) {
        this.homeContext.receiver.endWarp();};};};};

Process.prototype.stop = function () {this.errorFlag = false; (this.readyToTerminate
) = true; this.readyToYield = true; this.canBroadcast = false; if (this.context) {(this
).context.stopMusic();}; if (isSnapObject(this.receiver)) {(this.receiver).stopFreq();};};

Process.prototype.stopTheScript = function (aScript) {myObj = this.receiver; world.children[0].stage.threads.processes.map(function (process) {var block = (process.root || process.topBlock
); if ((block instanceof HatBlockMorph) || (block instanceof DefinitorBlockMorph)) {if ((aScript = block) && (process.receiver === myObj)) {process.stop(); return process;} else {return (
process);};} else {return process;};});}; Process.prototype.stopTheMessage = function (aMessage) {try {var stg = world.children[0].stage; stg.lastMessage = ''; myObj = this.receiver; (stg
).threads.processes.map(function (process) {var block = process.context.expression.topBlock(); if ((block instanceof HatBlockMorph) && (block.selector === 'receiveMessage') && (block.inputs(
)[0].evaluate() === (aMessage || null)) && (process.receiver === myObj)) {process.stop(); return process;} else {return process;};});} catch (err) {};}; /* This is at least, hard work. :O */

Process.prototype.pause = function () {if (this.readyToTerminate) {return;}; this.isPaused = true; this.flashPausedContext(); if (this.context && this.context.startTime) {(this.pauseOffset
) = (Date.now() - this.context.startTime);};}; Process.prototype.resume = function () {if (!(this.enableSingleStepping)) {this.unflash();}; this.isPaused = false; this.pauseOffset = null;};

Process.prototype.pauseStep = function () {this.lastYield = Date.now(); if (this.context && this.context.startTime) {this.context.startTime = this.lastYield - this.pauseOffset;};};

// Process evaluation

Process.prototype.evaluateContext = function () {
    var exp = this.context.expression;

    // keep track of overall frames for profiling purposes.
    // also keep track of frames inside the current atomic step.
    // In order to let Snap! behave similarly on a wide range of
    // differently performant hardware decide when to yield inside
    // a WARPed script or an infinitely recursive reporter
    // by how much time has elapsed since the last yield, but since
    // looking up the system time is surprisingly costly only look it
    // up every 100 frames.

    this.frameCount += 1;
    this.stepFrameCount += 1;
    if (this.stepFrameCount > 100) {
        this.currentTime = Date.now(
        ); this.stepFrameCount = 0;
    };  if (this.context.tag === 'exit'
        ) {this.expectReport();}; if (
        exp instanceof Array) {return (
        this.evaluateSequence(exp));}; if (
        exp instanceof MultiArgMorph) {
        return this.evaluateMultiSlot(
        exp, exp.inputs().length);}; if (
        exp instanceof ArgLabelMorph) {
        return this.evaluateArgLabel(exp
    );}; if ((exp instanceof ArgMorph
    ) || exp.bindingID) {return (this
        ).evaluateInput(exp);}; if (
        exp instanceof BlockMorph) {
        return this.evaluateBlock(exp,
        exp.inputs().length);}; if (
        isString(exp)) {return (this[
        exp]).apply(this, (this
        ).context.inputs);}; if (
        exp instanceof Variable) {
        this.returnValueToParentContext(
    exp.value);}; this.popContext();};

Process.prototype.evaluateBlock = function (block, argCount) {
    var rcvr, inputs, selector = block.selector;

    // check for special forms
    if (selector === 'doIf' ||
            selector === 'reportIfElse' ||
            selector === 'doReport') {
        if (this.isCatchingErrors) {
            try {
                return this[selector](block);
            } catch (error) {
                this.handleError(error, block);
            };
        } else {
            return this[selector](block);
        };
    };  // first evaluate all inputs, then apply the primitive
    rcvr = this.context.receiver || this.receiver;
    inputs = this.context.inputs;

    if (argCount > inputs.length) {
        // this.evaluateNextInput(block);
        this.evaluateNextInputSet(block); // frame-optimized version
    } else {
        if (this.flashContext()) {return;}; // yield to flash the block
        if (this[selector]) {
            rcvr = this;
        };
        if (this.isCatchingErrors) {
            try {
                this.returnValueToParentContext(
                    rcvr[selector].apply(rcvr, inputs)
                );
                this.popContext();
            } catch (error) {
                this.handleError(error, block);
            };
        } else {
            this.returnValueToParentContext(
                rcvr[selector].apply(rcvr, inputs)
            ); this.popContext();
        };};};

Process.prototype.playBeep = function () {var beep = WorldMorph.prototype.beepSound; if (beep instanceof Audio) {beep.currentTime = 0; beep.play();};
if ((world.children.filter(child => child instanceof FlashMorph) < 1) && asABool(localStorage['-snap-setting-flashScreenInBeep'])) {new FlashMorph;};};

// Process: Primitive Extensions (for libraries etc.)

Process.prototype.doApplyExtension = function (prim,
args) {this.reportApplyExtension(prim, args);};

Process.prototype.reportApplyExtension = function (prim, args) {
    var ext = SnapExtensions.primitives.get(prim);
    if (isNil(ext)) {
        throw new Error(localize('missing / unspecified extension') + ': ' + prim);
    };  return ext.apply(
        this.blockReceiver(),
        args.itemsArray().concat([this])
    );};

Process.prototype.doPauseThread = function () {var myself = this; if (!(myself.debugDialog)) {myself.debugDialog = new DialogBoxMorph; myself.debugDialog.setPicture(myself.topBlock.fullImage()); (myself
).debugDialog.labelString = ((myself.blockReceiver()).name + ' ^'); myself.debugDialog.addButton(function () {this.isDestroyed = true; this.destroy();}, new SymbolMorph('pointRight', 12)); (myself.debugDialog
).addButton(function () {myself.stop(); this.destroy();}, new SymbolMorph('rectangle', 12)); myself.debugDialog.key = ('debug - ' + Date.now()); myself.debugDialog.process = myself; (myself.debugDialog
).createLabel(); myself.debugDialog.fixLayout(); myself.debugDialog.popUp(world); myself.isOnDebug = true; myself.pushContext('doYield'); myself.pushContext();} else {if (!(myself.debugDialog.isDestroyed
)) {myself.pushContext('doYield'); myself.pushContext();} else {myself.debugDialog = null;};};}; Process.prototype.reportInPause = function (input) {var myself = this; if (!(myself.debugDialog)) {(myself
).debugDialog = new DialogBoxMorph; myself.debugDialog.setPicture(myself.topBlock.fullImage()); myself.debugDialog.labelString = ((myself.blockReceiver()).name + ' ^'); myself.debugDialog.addButton(function (
) {this.isDestroyed = true; this.destroy();}, new SymbolMorph('pointRight', 12)); myself.debugDialog.addButton(function () {myself.stop(); this.destroy();}, new SymbolMorph('rectangle', 12)); (myself.debugDialog
).key = ('debug - ' + Date.now()); myself.debugDialog.process = myself; myself.debugDialog.createLabel(); myself.debugDialog.fixLayout(); myself.debugDialog.popUp(world); myself.isOnDebug = true; (myself
).pushContext('doYield'); myself.pushContext();} else {if (!(myself.debugDialog.isDestroyed)) {this.context.inputs = []; myself.pushContext('doYield'); myself.pushContext();} else {myself.debugDialog = null;
myself.returnValueToParentContext(input);};};}; Process.prototype.durationOf = function (action) {if (action instanceof CommandBlockMorph) {if (!(this.context.startTime)) {this.context.startTime = Date.now();};
if (this.context.isOnlyToOnce) {delete this.context.isOnlyToOnce; return ((Date.now() - this.context.startTime) / 1000);} else {this.context.isOnlyToOnce = true; this.pushContext(action.blockSequence()); (this
).pushContext('doYield'); this.pushContext();};} else {return 0;};}; Process.prototype.reportLocalStorage = function () {return new List([new List(Object.keys(localStorage)), new List(Object.values(localStorage
))]);}; Process.prototype.blockComment = nop; Process.prototype.doIgnoreValue = nop; Process.prototype.scriptNamer = function (name, action) {action = action.at(1); if (action instanceof CommandBlockMorph) {if (
this.context.isOnlyToOnce) {delete this.context.isOnlyToOnce;} else {this.context.isOnlyToOnce = true; this.pushContext(action.blockSequence()); this.pushContext('doYield'); this.pushContext();};};}; (Process
).prototype.scriptChanger = function (option, block, selector) {if (!(block instanceof Context)) {block = this.reify();}; if (block.expression instanceof BlockMorph) {if (selector.length() > 0) {selector = (
selector.at(1));} else {selector = block.expression.selector;};} else {return block;}; var result = (Process.prototype.reportBlockAttribute(['sequence'], block).map(block => Process.prototype.basicScriptChanger(
Process.prototype.inputOption(option), block, selector))); if (result.length() < 2) {result = result.at(1);}; return result;}; Process.prototype.basicScriptChanger = function (option, block, selector) {if (
option === 'commandize') {if (block.expression.isCustomBlock) {var aDefinition = copy(block.expression.definition); aDefinition.type = 'command'; var aBlock = new CustomCommandBlockMorph(aDefinition);} else {
var aBlock = new CommandBlockMorph;};} else if (option === 'definitize') {if (block.expression.isCustomBlock) {var aDefinition = copy(block.expression.definition); aDefinition.type = 'definitor'; var aBlock = (
new CustomDefinitorBlockMorph(aDefinition));} else {var aBlock = new DefinitorBlockMorph;};} else if (contains(['reporterize', 'predicatize', 'arrowize'], option)) {if (block.expression.isCustomBlock) {
var aDefinition = copy(block.expression.definition); aDefinition.type = ((option === 'predicatize') ? 'predicate' : ((option === 'arrowize') ? 'arrow' : 'reporter')); var aBlock = new CustomReporterBlockMorph(
aDefinition);} else {var aBlock = new ReporterBlockMorph((option === 'predicatize'), (option === 'arrowize'));};} else if (option === 'hatize') {var aBlock = new HatBlockMorph;} else if (option === 'ringize') {
var aBlock = new RingMorph;} else {var aBlock = new JaggedBlockMorph;}; var i = 0; if (!(block.expression.isCustomBlock)) {aBlock.selector = selector;}; aBlock.setSpec('block'); aBlock.children[(aBlock.children
).length - 1].destroy(); aBlock.category = block.expression.category; while (i < block.expression.children.length) {if (block.expression.isCustomBlock) {aBlock.children[i] = block.expression.children[i].fullCopy(
);} else {aBlock.add((block.expression.children[i]).fullCopy());}; i++;}; aBlock.blockSpec = block.expression.blockSpec; aBlock.fixLayout(); aBlock.fixBlockColor(); return ((aBlock instanceof CommandBlockMorph
) ? this.reportScript(null, aBlock) : this.reify(aBlock));}; Process.prototype.reportVariadicAnd = function (inputs) {this.assertType(inputs, 'list'); if (inputs.length() > 2) {return this.reportAnd(inputs.at(1
), this.reportVariadicAnd(inputs.cdr()));} else if (inputs.length() > 1) {return this.reportAnd(inputs.at(1), inputs.at(2));} else if (inputs.length() > 0) {return asABool(inputs.at(1));} else {return true;};};
Process.prototype.reportAnd = function (input1, input2) {if (input1 instanceof List) {input1 = this.reportVariadicAnd(input1);}; if (input2 instanceof List) {input2 = this.reportVariadicAnd(input2);}; return (
asABool(this.reportBasicAnd(input1, input2)));}; Process.prototype.reportBasicAnd = function (input1, input2) {return +((Math.sign(Math.abs(input1)) + Math.sign(Math.abs(input2))) > 1);}; (Process.prototype
).reportVariadicOr = function (inputs) {this.assertType(inputs, 'list'); if (inputs.length() > 2) {return this.reportOr(inputs.at(1), this.reportVariadicOr(inputs.cdr()));} else if (inputs.length() > 1) {
return this.reportOr(inputs.at(1), inputs.at(2));} else if (inputs.length() > 0) {return asABool(inputs.at(1));} else {return false;};}; Process.prototype.reportOr = function (input1, input2) {if ((input1
) instanceof List) {input1 = this.reportVariadicOr(input1);}; if (input2 instanceof List) {input2 = this.reportVariadicOr(input2);}; return asABool(this.reportBasicOr(input1, input2));}; (Process.prototype
).reportBasicOr = function (input1, input2) {return +((Math.sign(Math.abs(input1)) + Math.sign(Math.abs(input2))) > 0);}; Process.prototype.reportOnlyOne = function (inputs) {return (inputs.filter((input
) => (input === true)).length === 1);}; /* Isn't variadic "xor" but is useful in some cases but "xor" isn't an associative operator. Only the arrays are to use here. */ Process.prototype.reportXor = function (
input1, input2) {this.assertType(input1, ['nothing', 'number', 'Boolean']); this.assertType(input2, ['nothing', 'number', 'Boolean']); return asABool(this.reportBasicXor(input1, input2));}; (Process.prototype
).reportBasicXor = function (input1, input2) {return +(Math.abs(Math.sign(Math.abs(input1)) - Math.sign(Math.abs(input2))) > 0);}; Process.prototype.reportNot = function (input) {myself = this; return (((input
) instanceof List) ? (input.fullCopy().map(item => myself.reportNot(item))) : asABool(myself.reportBasicNot(input)));}; Process.prototype.reportBasicNot = function (input) {return (1 - Math.sign(Math.abs(input
)));}; /* Any of the boolean operators are now better. */ Process.prototype.doPauseScript = function (script) {var myself = this; if (!(myself.debugDialog)) {myself.debugDialog = new DialogBoxMorph; (myself
).debugDialog.setPicture(myself.topBlock.fullImage()); myself.debugDialog.labelString = (myself.blockReceiver()).name + ' ^'; myself.debugDialog.addButton(function () {this.isDestroyed = true; this.destroy();
}, new SymbolMorph('pointRight', 12)); myself.debugDialog.addButton(function () {this.isDestroyed = true; this.destroy(); if (!isNil(script)) {myself.execute(['run'], script, new List);};}, new SymbolMorph(
'stepForward', 12)); myself.debugDialog.addButton(function () {myself.stop(); this.destroy();}, new SymbolMorph('rectangle', 12)); myself.debugDialog.key = ('debug - ' + Date.now());
myself.debugDialog.process = myself; myself.debugDialog.createLabel(); myself.debugDialog.fixLayout(); myself.debugDialog.popUp(world); myself.isOnDebug = true; myself.pushContext(
'doYield'); myself.pushContext();} else {if (!(myself.debugDialog.isDestroyed)) {myself.pushContext('doYield'); myself.pushContext();} else {myself.debugDialog = null;};};};

// Process: Special Forms Blocks Primitives

Process.prototype.doReport = function (block) {var outer = this.context.outerContext; if (
this.flashContext()) {return;}; if (this.isClicked && (block.topBlock() === this.topBlock)
) {this.isShowingResult = true;}; if (block.partOfCustomCommand) {this.doStopCustomBlock(
); this.popContext();} else {while (this.context && this.context.tag !== 'exit') {if (
this.context.expression === 'doStopWarping') {this.doStopWarping();} else {this.popContext(
);};}; if (this.context) {if (this.context.expression === 'expectReport') {this.popContext(
);} else {this.context.tag = null;};};}; this.pushContext(block.inputs()[0], outer);
this.context.isCustomCommand = block.partOfCustomCommand;};

// Process: Non-Block evaluation

Process.prototype.evaluateMultiSlot = function (multiSlot, argCount) {
    // first evaluate all subslots, then return a list of their values
    var inputs = this.context.inputs,
        ans;
    if (multiSlot.bindingID) {
        if (this.isCatchingErrors) {
            try {
                ans = this.context.variables.getVar(multiSlot.bindingID);
            } catch (error) {
                this.handleError(error, multiSlot);
            };
        } else {
            ans = this.context.variables.getVar(multiSlot.bindingID);
        }; this.returnValueToParentContext(ans);
        this.popContext();
    } else {
        if (argCount > inputs.length) {
            // this.evaluateNextInput(multiSlot);
            this.evaluateNextInputSet(multiSlot); // frame-optimized version
        } else {
            this.returnValueToParentContext(new List(inputs));
            this.popContext();
        };
    };};

Process.prototype.evaluateArgLabel = function (argLabel) {
    // perform the ID function on an ArgLabelMorph element
    var inputs = this.context.inputs;
    if (inputs.length < 1) {
        this.evaluateNextInput(argLabel);
    } else {
        this.returnValueToParentContext(inputs[0]);
        this.popContext();
    };};

Process.prototype.evaluateInput = function (input) {
    // evaluate the input unless it is bound to an implicit parameter
    var ans;
    if (this.flashContext()) {return;}; // yield to flash the current argMorph
    if (input.bindingID) {
        if (this.isCatchingErrors) {
            try {
                ans = this.context.variables.getVar(input.bindingID);
            } catch (error) {
                this.handleError(error, input);
            };
        } else {
            ans = this.context.variables.getVar(input.bindingID);
        };
    } else {
        ans = input.evaluate();
        if (ans) {
            if (input.constructor === CommandSlotMorph ||
                    input.constructor === ReporterSlotMorph ||
                    input.constructor === BlockSlotMorph ||
                    ((input instanceof CSlotMorph) &&
                        (!input.isStatic || input.isLambda ||
                inputSlot.parentThatIsA(BlockMorph)?.isCustomBlock))) {
                // I know, this still needs yet to be done right...
                ans = this.reify(ans, new List);
            };
       };
    }; this.returnValueToParentContext(ans); this.popContext();};

Process.prototype.evaluateSequence = function (arr) {
    var pc = this.context.pc,
        outer = this.context.outerContext,
        isCustomBlock = this.context.isCustomBlock;
    if (pc === (arr.length - 1)) { // tail call elimination
        this.context = new Context(
            this.context.parentContext,
            arr[pc],
            this.context.outerContext,
            this.context.receiver
        ); this.context.isCustomBlock = isCustomBlock;
    } else {
        if (pc >= arr.length) {
            this.popContext();
        } else {
            this.context.pc += 1;
            this.pushContext(arr[pc], outer);
        };
    };
};

/*
// version w/o tail call optimization:
--------------------------------------
Caution: we cannot just revert to this version of the method, because to make
tail call elimination work many tweaks had to be done to various primitives.
For the most part these tweaks are about schlepping the outer context (for
the variable bindings) and the isCustomBlock flag along, and are indicated
by a short comment in the code. But to really revert would take a good measure
of trial and error as well as debugging. In the developers file archive there
is a version of threads.js dated 120119(2) which basically resembles the
last version before introducing tail call optimization on 120123.

Process.prototype.evaluateSequence = function (arr) {
    var pc = this.context.pc;
    if (pc >= arr.length) {
        this.popContext();
    } else {
        this.context.pc += 1;
        this.pushContext(arr[pc]);
    };
};
*/

Process.prototype.evaluateNextInput = function (element) {
    var nxt = this.context.inputs.length,
        args = element.inputs(),
        exp = args[nxt],
        sel = this.context.expression.selector,
        outer = this.context.outerContext; // for tail call elimination

    if (exp.isUnevaluated) {
        if (exp.isUnevaluated === true || exp.isUnevaluated()) {
            // just return the input as-is
            this.context.addInput(contains(['reportScript', 'reify', 'reifyScript', 'reifyReporter', 'reifyPredicate'], sel) ? exp : this.reify(exp, new List));
        } else {
            this.pushContext(exp, outer);
        };
    } else {
        this.pushContext(exp, outer);
    };
};

Process.prototype.evaluateNextInputSet = function (element) {
    // Optimization to use instead of evaluateNextInput(), bums out a few
    // frames and function calls to save a some milliseconds.
    // the idea behind this optimization is to keep evaluating the inputs
    // while we know for sure that we aren't boing to yield anyway
    var args = element.inputs(), exp,
        sel = this.context.expression.selector,
        outer = this.context.outerContext, // for tail call elimination
        ans;

    while (args.length > this.context.inputs.length) {
        exp = args[this.context.inputs.length];
        if (exp.isUnevaluated) {
            if (exp.isUnevaluated === true || exp.isUnevaluated()) {
                this.context.addInput(contains(['reportScript', 'reify', 'reifyScript', 'reifyReporter', 'reifyPredicate'], sel) ? exp : this.reify(exp, new List));
            } else {
                this.pushContext(exp, outer);
                break;
            };
        } else {
            if (exp instanceof MultiArgMorph || exp instanceof ArgLabelMorph ||
                    exp instanceof BlockMorph) {
                 this.pushContext(exp, outer);
                 break;
            } else { // asuming an ArgMorph
                if (this.flashContext()) {return; } // yield to flash
                if (exp.bindingID) {
                    if (this.isCatchingErrors) {
                        try {
                            ans = this.context.variables.getVar(exp.bindingID);
                        } catch (error) {
                            this.handleError(error, exp);
                        };
                    } else {
                        ans = this.context.variables.getVar(exp.bindingID);
                    };
                } else {
                    ans = exp.evaluate();
                    if (ans) {
                        if (exp.constructor === CommandSlotMorph ||
                                exp.constructor === ReporterSlotMorph ||
                                exp.constructor === BlockSlotMorph ||
                                (exp instanceof CSlotMorph &&
                                    (!exp.isStatic || exp.isLambda))) {
                            ans = this.reify(ans, new List);
                        };
                    };
                };
                this.context.addInput(ans);
            };
        };
    };
};

Process.prototype.doYield = function () {this.popContext(); if (!(this.isAtomic)) {this.readyToYield = true;
};}; Process.prototype.expectReport = function () {this.handleError(new Error('The result is missing...'));};

// Process Exception Handling

Process.prototype.launchError = function (contents) {throw Error(contents, {cause: 'user'});}; Process.prototype.throwError = function (error, element) {var ide = (this.homeContext.receiver).parentThatIsA(
IDE_Morph); this.stop(); this.errorFlag = true; this.topBlock.addErrorHighlight(); if (ide.isAppMode) {ide.showMessage(localize(error.name) + '\n' + error.message);} else {this.topBlock.showBubble((this
).errorBubble(error, element), this.exportResult, this.receiver);};}; Process.prototype.tryCatch = function (action, exception, errVarName) {var next = this.context.continuation(); (this.handleError
) = function (error) {this.resetErrorHandling(); if (!(exception instanceof Context)) {exception = this.reify(SpriteMorph.prototype.blockForSelector('doIgnoreValue'), new List);}; if ((exception
).expression instanceof CommandBlockMorph) {exception.expression = exception.expression.blockSequence();} else {exception.expression = [exception.expression];}; exception.pc = 0; (exception
).outerContext.variables.addVar(errVarName); exception.outerContext.variables.setVar(errVarName, error.message); this.context = exception; this.evaluate(next, new List, true);}; this.evaluate(
action, new List, true);}; Process.prototype.resetErrorHandling = function () {this.handleError = this.throwError;}; Process.prototype.resetErrorHandling(); Process.prototype.commandObsolete = (
() => {throw Error('This block isn\'t defined.');}); Process.prototype.reporterObsolete = Process.prototype.commandObsolete; Process.prototype.errorBubble = function (error, element) {
var errorMorph = new AlignmentMorph('column', 5), errorIsNested = this.topBlock.isCustomBlock, errorPrefix = errorIsNested ? `${localize('Inside a custom block')}\n` : '', errorMessage = (
new TextMorph(`${errorPrefix}${localize(error.name)}\n${localize(error.message)}`, SyntaxElementMorph.prototype.fontSize)), blockToShow = element; errorMorph.add(errorMessage); if (
errorIsNested && error.cause !== 'user') {if (blockToShow instanceof BlockMorph) {if (blockToShow.selector === 'reportGetVar') {blockToShow = blockToShow.parent;}; errorMorph.children[
0].text += `\n${localize('The question came up at')}`; errorMorph.children[0].fixLayout(); errorMorph.add(blockToShow.fullCopy());};}; errorMorph.fixLayout(); return errorMorph;};

// Process Lambda primitives

Process.prototype.reify = function (topBlock, parameterNames, isCustomBlock) {
var context = new Context(null, null, (this.context ? (this.context.outerContext
) : null)), i = 0; if (isNil(parameterNames)) {parameterNames = new List;}; if (
topBlock) {context.expression = this.enableLiveCoding || (this.enableSingleStepping
) ? topBlock : topBlock.fullCopy(); context.expression.show(); if (!(isCustomBlock
) && !(parameterNames.length())) {context.expression.allEmptySlots().forEach((slot
) => {i += 1; if (slot instanceof MultiArgMorph) {slot.bindingID = Symbol.for(
'arguments');} else {slot.bindingID = i;};}); context.emptySlots = i;};} else {
context.expression = this.enableLiveCoding || this.enableSingleStepping ? [(this
).context.expression] : [this.context.expression.fullCopy()];}; context.inputs = (
parameterNames.itemsArray()); context.receiver = this.context ? (this.context.receiver
) : this.receiver; context.origin = context.receiver; return context;}; (Process
).prototype.reportScript = function (parameterNames, topBlock) {var context = (this
).reify(((topBlock instanceof Morph) ? topBlock.fullCopy() : null), parameterNames);
context.selector = 'reportScript'; return context;}; (Process.prototype.reifyScript
) = function (topBlock, parameterNames) {var context = this.reportScript(parameterNames,
topBlock); context.selector = 'reifyScript'; return context;}; (Process.prototype
).reifyReporter = function (topBlock, parameterNames) {var context = this.reify(
topBlock, parameterNames); context.selector = 'reifyReporter'; return context;
}; Process.prototype.reifyPredicate = function (topBlock, parameterNames) {
var context = this.reify(topBlock, parameterNames); (context
).selector = 'reifyPredicate'; return context;};

// First Class Colors

Process.prototype.getColor = function (data) {if (
this.reportTypeOf(data) === 'color') {return data;
} else {throw Error('This isn\'t a color.');};};
Process.prototype.makeColor = function (r, g, b,
a) {return new Color(r, g, b, a.asArray()[0]);};
Process.prototype.colorAttr = function (attr, data
) {if (this.inputOption(attr) === 'hex') {return (
'#' + (this.reportNumberWithMoreDigits(this.reportNumeralText(
this.reportNewNumeral(data.r, 16)), 2)).concat(
this.reportNumberWithMoreDigits(this.reportNumeralText(
this.reportNewNumeral(data.g, 16)), 2),
this.reportNumberWithMoreDigits(this.reportNumeralText(
this.reportNewNumeral(data.b, 16)), 2), ((data.a < 1
) ? this.reportNumberWithMoreDigits(this.reportNumeralText(
this.reportNewNumeral((data.a * 255), 16)), 2) : '')));
} else if (this.inputOption(attr) === 'R') {return this.getColor(
data).r;} else if (this.inputOption(attr) === 'G') {
return this.getColor(data).g;} else if (this.inputOption(
attr) === 'B') {return this.getColor(data).b;} else if (
this.inputOption(attr) === 'A') {return this.getColor(data
).a;} else if (this.inputOption(attr) === 'RGB') {return new List(
[this.colorAttr('R', data), this.colorAttr('G', data), this.colorAttr(
'B', data)]);} else if (this.inputOption(attr) === 'RGBA') {
return new List((this.colorAttr('RGB', data).asArray()).concat([
this.colorAttr('A', data)]));} else {return null;};};
Process.prototype.clrFlags = function (flag,
data, num) {num = Math.min(Math.max(+num, 0), 100); if (
!(this.inputOption(flag) === 'saturate') && (+num === 0
)) {return this.getColor(data);} else {if (this.inputOption(
flag) === 'light up') {return data.lighter(num);} else if (
this.inputOption(flag) === 'light down') {return data.darker(
num);} else if (this.inputOption(flag) === 'negate') {return new Color(
(this.colorAttr('R', data) + ((255 - (this.colorAttr('R', data) * 2)
) * (num / 100))), (this.colorAttr('G', data) + ((255 - (this.colorAttr(
'G', data) * 2)) * (num / 100))), (this.colorAttr('B', data) + ((255 - (
this.colorAttr('B', data) * 2)) * (num / 100))), this.colorAttr('A', data
));} else if (this.inputOption(flag) === 'saturate') {var lerp = ((from,
to, percent) => (from + ((to - from) * (percent / 100)))), luminosity = (
(this.colorAttr('R', data) * 0.2989) + (this.colorAttr('G', data) * 0.5870
) + (this.colorAttr('B', data) * 0.1141)); return new Color(lerp(luminosity,
data.r, num), lerp(luminosity, data.g, num), lerp(luminosity, data.b, num),
data.a);} else {return data;};};}; Process.prototype.mixColors = function (
inputs) {this.assertType(inputs, 'list'); var result = inputs.fullCopy().asArray(
).map(function (clr0) {return [clr0.r, clr0.g, clr0.b, clr0.a];}).reduce(
function (clr1, clr2) {return [(clr1[0] + clr2[0]), (clr1[1] + clr2[1]),
(clr1[2] + clr2[2]), (clr1[3] + clr2[3])];}); return new Color((result[0
] / inputs.length()), (result[1] / inputs.length()), (result[2] / inputs.length(
)), (result[3] / inputs.length()));}; Process.prototype.mixClrsAt = function (
color1, color2, percent) {percent = Math.min(Math.max(+percent, 0), 100);
return new Color(((color1.r * (1 - (percent / 100))) + (color2.r * (
percent / 100))), ((color1.g * (1 - (percent / 100))) + (color2.g * (
percent / 100))), ((color1.b * (1 - (percent / 100))) + (color2.b * (
percent / 100))), ((color1.a * (1 - (percent / 100))) + (color2.a * (
percent / 100))));};

// Manage Custom Categories

Process.prototype.createCategory = function (name, color) {if (!(world.children[0].currentSprite.customCategories.get(name))) {world.children[0].addPaletteCategory(name, color)}}; Process.prototype.renameCategory
= function (oldName, newName) {var ide = world.children[0], ctg = ide.currentSprite.customCategories; if (ctg.has(oldName) && !ctg.has(newName)) {var col = ctg.get(oldName); ide.addPaletteCategory(newName, col);
ide.stage.globalBlocks.forEach(def => {if (def.category === oldName) {def.category = newName; ide.currentSprite.allBlockInstances(def).reverse().forEach(block => block.refresh());}}); ide.sprites.asArray().concat(
ide.stage).forEach(obj => {obj.customBlocks.forEach(def => {if (def.category === oldName) {def.category = newName; obj.allDependentInvocationsOf(def.blockSpec()).reverse().forEach(block => block.refresh(def));
}});}); SpriteMorph.prototype.customCategories.delete(oldName); ide.createCategories(); ide.createPaletteHandle(); ide.categories.fixLayout(); ide.flushPaletteCache(); ide.refreshPalette(true); ide.categories.
refreshEmpty(); ide.fixLayout(); ide.recordUnsavedChanges(); if (ide.currentCategory === oldName) {ide.currentCategory = newName;}; ide.categories.children.forEach(function (each) {each.refresh();}); ide.
refreshPalette(true); ide.savingPreferences = true;};}; Process.prototype.setCategoryColor = function (name, color) {var ide = world.children[0], ctg = ide.currentSprite.customCategories; if (ctg.has(name)) {
ctg.set(name, color); ide.createCategories(); ide.createPaletteHandle(); ide.categories.fixLayout(); ide.flushPaletteCache(); ide.refreshPalette(true); ide.categories.refreshEmpty(); ide.fixLayout(); ide.
recordUnsavedChanges(); var def = ide.stage.globalBlocks; def = def.filter(block => {return block.category === name;}); def.map(def => {ide.currentSprite.allBlockInstances(def).map(block => block.refresh())})}};
Process.prototype.deleteCategory = function (name) {world.children[0].deletePaletteCategory(name);}; /* List Manager */ Process.prototype.reportListContents = function (list) {return list.itemsArray().join('');};
Process.prototype.reportListCopy = function anonymous (list, copies) {this.assertType(list, 'list'); var backup = list.fullCopy().asArray(), result = [], iCopy = 0; while (iCopy < +copies) {iCount = 0; while (
iCount < backup.length) {result.push(backup[iCount]); iCount++;}; iCopy++;}; return new List(result); /* Copy. */}; Process.prototype.reportJSFunction = function anonymous (parmNames, body) {if (!this.enableJS) {
throw new Error('JavaScript extensions for Snap!\nare turned off');}; return Function.apply(null, parmNames.itemsArray().concat([body]));}; Process.prototype.doRun = function anonymous (context, args, root) {
return this.evaluate(context, args, true, root);}; Process.prototype.evaluate = function (context, args = new List, isCommand = false, root) {if (root instanceof BlockMorph) {this.root = root;}; if (!context) {
return this.returnValueToParentContext('');}; if (context instanceof Function) {if (this.enableJS) {return context.apply(this.blockReceiver(), args.itemsArray().concat([this]));} else {throw Error(
'JavaScript extensions for Snap!\nare turned off');};}; if (context.isContinuation) {return this.runContinuation(context, args);}; if (!(context instanceof Context)) {throw Error('expecting a lambda but getting '
+ context);}; if (context instanceof Context) {if ((context.selector === 'reportScript') && (!context.isContinuation) && (context.expression instanceof Array) && (context.inputs.length === 0)) {if (args.fullCopy(
).asArray().length > 1) {throw Error(localize('expecting') + ' ' + localize('1 input, but getting') + ' ' + args.length());} else if (args.fullCopy().asArray().length === 1) {
return (args.fullCopy().asArray())[0];} else {return context;};};};
    if (context instanceof Context) {if ((context.selector === 'reify')
    && (!context.isContinuation) && (context.expression instanceof Array)
    && (context.inputs.length === 0)) {
    if (args.fullCopy().asArray().length > 1) {
    throw Error(
                    localize('expecting') + ' '
                        + localize('1 input, but getting') + ' '
                        + args.length()
                );
    }  else if (args.fullCopy().asArray().length === 1
    )  {return (args.fullCopy().asArray())[0];};};};
    var outer = new Context(null, null, context.outerContext),
    caller = this.context.parentContext, exit, runnable, expr,
    cont = this.context.rawContinuation(!isCommand), i, value,
    parms = args.itemsArray(); if (!outer.receiver) {
    outer.receiver = context.receiver;}; // for custom blocks
    runnable = new Context(
        this.context.parentContext,
        context.expression,
        outer,
        context.receiver
    );  runnable.isCustomCommand = isCommand;
    this.context.parentContext = runnable;

    if (context.expression instanceof ReporterBlockMorph) {
        // auto-"warp" nested reporters
        this.readyToYield = (this.currentTime - this.lastYield > this.timeout);
    }; // assign a self-reference for introspection and recursion
    outer.variables.addVar(Symbol.for('self'), context);
    // capture the dynamic scope in "this caller"
    outer.variables.addVar(Symbol.for('caller'), this.context);
    // capture the current continuation
    outer.variables.addVar(Symbol.for('continuation'), cont);
    // assign the actual arguments list to the special
    // parameter ID Symbol.for('arguments'), to be used for variadic inputs
    outer.variables.addVar(Symbol.for('arguments'), args);
    // assign arguments that are actually passed
    if (parms.length > 0) {
        // assign formal parameters
        for (i = 0; i < context.inputs.length; i += 1) {
            value = null;
            if (!isNil(parms[i])) {
                value = parms[i];
            }; outer.variables.addVar(context.inputs[i], value);
        }; // assign implicit parameters if there are no formal ones
        if (context.inputs.length === 0) {
            // in case there is only one input
            // assign it to all empty slots...
            if (parms.length === 1) {
                // ... unless it's an empty reporter ring,
                // in which special case it gets treated as the ID-function;
                // experimental feature jens is not at all comfortable with
                if (!context.emptySlots) {
                    expr = context.expression;
                    if (expr instanceof Array &&
                            expr.length === 1 &&
                            expr[0].selector &&
                            expr[0].selector === 'reifyReporter' &&
                            !expr[0].contents()) {
                        runnable.expression = new Variable(parms[0]);
                    };
                } else {
                    for (i = 1; i <= context.emptySlots; i += 1) {
                        outer.variables.addVar(i, parms[0]);
                    };
                }; // if the number of inputs matches the number
            // of empty slots distribute them sequentially
            } else if (parms.length === context.emptySlots) {
                for (i = 1; i <= parms.length; i += 1) {
                    outer.variables.addVar(i, parms[i - 1]);
                };
            } else if (context.emptySlots !== 1) {
                throw new Error(
                    localize('expecting') + ' ' + context.emptySlots + ' '
                        + localize('input(s), but getting') + ' '
                        + parms.length
                );
            };
        };
    }; if (runnable.expression instanceof CommandBlockMorph) {
        runnable.expression = runnable.expression.blockSequence();
        if (!isCommand) {
            if (caller) {
                // tag caller, so "report" can catch it later
                caller.tag = 'exit';
            } else {
                // top-level context, insert a tagged exit context
                // which "report" can catch later
                exit = new Context(
                    runnable.parentContext,
                    'expectReport',
                    outer,
                    outer.receiver
                ); exit.tag = 'exit';
                runnable.parentContext = exit;
    };};};};

Process.prototype.fork = function anonymous (context, args) {if (context instanceof Context) {if (this.readyToTerminate) {return;}; var proc = new Process, stage = this.homeContext.receiver.parentThatIsA(
StageMorph); proc.instrument = this.instrument; proc.receiver = this.receiver; proc.initializeFor(context, args); stage.threads.processes.push(proc);} else if (context instanceof Function) {
throw Error('Forking JavaScript functions is not available.\nIf do you want to launch one,\nplease put it in a \"\[run\] %cmd\" block\nand put them in the launch %cmd block.');};};

Process.prototype.initializeFor = function (context, args) {
    // used by Process.fork() and global invoke()
    if (context.isContinuation) {
        throw new Error(
            'continuations cannot be forked'
        );
    };  if (!(context instanceof Context)) {
        throw new Error(
            localize('expecting a') + ' ' +
            localize('ring') + ' ' +
            localize('but getting a') + ' ' +
            localize(this.reportTypeOf(context))
        );
    }; var outer = new Context(null, null, context.outerContext),
        runnable = new Context(null,
            context.expression,
            outer),
        parms = args.itemsArray(),
        i,  value;

    // remember the receiver
    this.context = context.receiver;

    // assign arguments to parameters

    // assign the actual arguments list to the special
    // parameter ID Symbol.for('arguments'), to be used for variadic inputs
    outer.variables.addVar(Symbol.for('arguments'), args);

    // assign arguments that are actually passed
    if (parms.length > 0) {

        // assign formal parameters
        for (i = 0; i < context.inputs.length; i += 1) {
            value = 0;
            if (!isNil(parms[i])) {
                value = parms[i];
            }; outer.variables.addVar(context.inputs[i], value);
        };  // assign implicit parameters if there are no formal ones
        if (context.inputs.length === 0) {
            // in case there is only one input
            // assign it to all empty slots
            if (parms.length === 1) {
                for (i = 1; i <= context.emptySlots; i += 1) {
                    outer.variables.addVar(i, parms[0]);
                };
            // if the number of inputs matches the number
            // of empty slots distribute them sequentially
            } else if (parms.length === context.emptySlots) {
                for (i = 1; i <= parms.length; i += 1) {
                    outer.variables.addVar(i, parms[i - 1]);
                };
            } else if (context.emptySlots !== 1) {
                throw new Error(
                    localize('expecting') + ' ' + context.emptySlots + ' '
                        + localize('input(s), but getting') + ' '
                        + parms.length
                );
            };
        };
    };  if (runnable.expression instanceof CommandBlockMorph) {
    runnable.expression = runnable.expression.blockSequence();
    }; this.homeContext = new Context; // context.outerContext;
    this.homeContext.receiver = context.outerContext.receiver;
    this.topBlock = context.expression; this.context = runnable;};

Process.prototype.execute = function (choice, context, args) {if (this.inputOption(choice) === 'run') {
this.doRun(context, args);}; if (this.inputOption(choice) === 'launch') {this.fork(context, args);};};

// Process introspection

Process.prototype.reportThisContext = function () {var sym = Symbol.for('self'), frame = this.context.variables.silentFind(
sym), ctx; if (frame) {return copy(frame.vars[sym].value);} else {ctx = (this.topBlock).reify();}; ctx.outerContext = (this
).context.outerContext; if (ctx.outerContext) {ctx.variables.parentFrame = ctx.outerContext.variables;}; if (!((this
).isAtomic) && this.context.expression.parent?.selector === 'execute') {this.readyToYield = true;}; return ctx;};

Process.prototype.reportThisCaller = function anonymous () {
    var sym = Symbol.for('caller'),
        frame = this.context.variables.silentFind(sym),
        ctx, nb;
    if (frame) {
        ctx = copy(frame.vars[sym].value);
        // ctx.expression = ctx.expression?.topBlock().fullCopy();
        ctx.expression = ctx.expression?.fullCopy();
        nb = ctx.expression?.nextBlock ? ctx.expression.nextBlock() : null;
        if (nb) {
            nb.destroy();
        }; ctx.inputs = [];
        return ctx;
    }; return this.blockReceiver();
};

Process.prototype.reportThisContinuation = function anonymous () {
    var sym = Symbol.for('continuation'),
        frame = this.context.variables.silentFind(sym),
        cont;
    if (frame) {
        cont = frame.vars[sym].value;
        cont = cont.copyForContinuation();
        cont.tag = null;
    } else {
        cont = new Context(
            null,
            'popContext'
        );
    };  cont.isContinuation = true;
    return cont;};

Process.prototype.reportThisInputs = function () {
    var sym = Symbol.for('arguments'),
        frame = this.context.variables.silentFind(sym);
    return (frame ? frame.vars[sym].value : new List);
};

// Process stopping blocks primitives

Process.prototype.doStopBlock = function () {
    var target = this.context.expression.exitTag;
    if (isNil(target)) {
        return this.doStopCustomBlock();
    }; while (this.context &&
            (isNil(this.context.tag) || (this.context.tag > target))) {
        if (this.context.expression === 'doStopWarping') {
            this.doStopWarping();
        } else {
            this.popContext();
        };
    }; this.pushContext();
};

Process.prototype.doStopCustomBlock = function () {
    // fallback solution for "report" blocks inside
    // custom command definitions and untagged "stop" blocks
    while (this.context && !this.context.isCustomBlock) {
        if (this.context.expression === 'doStopWarping') {
            this.doStopWarping();
        } else {
            this.popContext();
        };
    };
};

// Process continuations primitives

Process.prototype.doCallCC = function anonymous (aContext, isReporter) {this.evaluate(aContext, new List([this.context.continuation(
isReporter)]), !isReporter);}; Process.prototype.reportCallCC = function anonymous (aContext) {this.doCallCC(aContext, true);};
Process.prototype.runContinuation = function (aContext, args) {var parms = args.itemsArray(); if ((parms.length > 0) && (
aContext.expression === 'expectReport')) {this.stop(); this.homeContext.inputs[0] = parms[0]; return;};
this.context.parentContext = aContext.copyForContinuationCall(); if (parms.length === 1) {
this.context.parentContext.outerContext.variables.addVar(1, parms[0]);};};

// Process custom block primitives

Process.prototype.evaluateCustomBlock = function () {
    var caller = this.context.parentContext,
        block = this.context.expression,
        method = block.isGlobal ? block.definition
                : this.blockReceiver().getMethod(block.semanticSpec),
        context = method.body,
        declarations = method.declarations,
        cont = this.context.rawContinuation(method.type !== 'command'),
        args = new List(this.context.inputs),
        parms = args.itemsArray(), runnable,
        exit, i, value, outer, self;

    if (!context) {return null;
    }; this.procedureCount += 1;
    outer = new Context;
    outer.receiver = this.context.receiver;
    outer.variables.parentFrame = block.variables;

    // block (instance) var support:
    // only splice in block vars if any are defined, because block vars
    // can cause race conditions in global block definitions that
    // access sprite-local variables at the same time.
    if (method.variableNames.length) {
        block.variables.parentFrame = outer.receiver ?
                outer.receiver.variables : null;
    } else {
        // original code without block variables:
        outer.variables.parentFrame = outer.receiver ?
                outer.receiver.variables : null;
    }; runnable = new Context(
        this.context.parentContext,
        context.expression,
        outer,
        outer.receiver
    ); runnable.isCustomBlock = true;
    		
    this.context.parentContext = runnable;
    // capture the runtime environment in "this script"
    self = copy(context);
    self.outerContext = outer;

    // passing parameters if any were passed
    if (parms.length > 0) {

        // assign formal parameters
        for (i = 0; i < context.inputs.length; i += 1) {
            value = null; if (!isNil(parms[i])) {
                value = parms[i];
            }; outer.variables.addVar(context.inputs[i], value);

            // if the parameter is an upvar,
            // create a reference to the variable it points to
            if (declarations.get(context.inputs[i])[0] === '%upvar') {
                this.context.outerContext.variables.vars[value] =
                    outer.variables.vars[context.inputs[i]];
            };
        };
    }; // tag return target
    if (method.type !== 'command') {
        // clear previous exit tags, if any
        runnable.expression.tagExitBlocks(undefined, false);
        if (caller) {
            // tag caller, so "report" can catch it later
            caller.tag = 'exit';
        } else {
            // top-level context, insert a tagged exit context
            // which "report" can catch later
            exit = new Context(
                runnable.parentContext,
                'expectReport',
                outer,
                outer.receiver
            ); exit.tag = 'exit';
            runnable.parentContext = exit;
        }; // auto-"warp" nested reporters
        this.readyToYield = ((this.currentTime - this.lastYield) > this.timeout);
    } else {
        // tag all "stop this block" blocks with the current
        // procedureCount as exitTag, and mark all "report" blocks
        // as being inside a custom command definition
        runnable.expression.tagExitBlocks(this.procedureCount, true);

        // tag the caller with the current procedure count, so
        // "stop this block" blocks can catch it, but only
        // if the caller hasn't been tagged already
        if (caller && !caller.tag) {
            caller.tag = this.procedureCount;
        }; // yield commands unless explicitly "warped" or directly recursive
        if (!this.isAtomic && method.isDirectlyRecursive()) {
            this.readyToYield = true;
        };
    }; // keep track of the environment for recursion and introspection
    outer.variables.addVar(Symbol.for('self'), self);
    outer.variables.addVar(Symbol.for('caller'), this.context);
    outer.variables.addVar(Symbol.for('continuation'), cont);
    outer.variables.addVar(Symbol.for('arguments'), args);
    runnable.expression = runnable.expression.blockSequence();
};

// Process variables primitives

Process.prototype.doDeclareVariables = function (varNames) {
var varFrame = this.context.outerContext.variables; ((varNames
).itemsArray()).forEach(name => varFrame.addVar(name));};

Process.prototype.doSetVar = function (varName, value) {var varFrame = this.context.variables,
name = varName; if (name instanceof Context) {if (name.expression.selector === 'reportGetVar'
) {name.variables.setVar(name.expression.blockSpec, value, this.blockReceiver()); return;
}; this.doSet(name, value); return;}; if (name instanceof Array) {this.doSet(name,
value); return;}; varFrame.setVar(name, value, this.blockReceiver());};

Process.prototype.doChangeVar = function (varName, value) {var varFrame = this.context.variables,
name = varName; if (name instanceof Context) {if (name.expression.selector === 'reportGetVar') {
name.variables.changeVar(name.expression.blockSpec, value, this.blockReceiver()); return;};};
varFrame.changeVar(name, value, this.blockReceiver());};

Process.prototype.reportGetVar = function () {this.returnValueToParentContext(
this.context.variables.getVar(this.context.expression.blockSpec));};

Process.prototype.doShowingVarOptions = function (option, variable) {if (option == 'show') {this.doShowVar(variable);} else if
(option == 'hide') {this.doHideVar(variable);}; world.children[0].flushBlocksCache('variables'); world.children[0].refreshPalette();};

Process.prototype.doShowVar = function (varName, context) {
    // context is an optional start-context to be used by extensions
    var varFrame = (context || (this.context || this.homeContext)).variables,
        stage,
        watcher,
        target,
        label,
        others,
        isGlobal,
        name = varName;

    if (name instanceof Context) {
        if (name.expression.selector === 'reportGetVar') {
            name = name.expression.blockSpec;
        } else {
            this.blockReceiver().changeBlockVisibility(name.expression, false);
            return;
        };
    };  if (this.homeContext.receiver) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (stage) {
            target = varFrame.silentFind(name);
            if (!target) {return; }
            // first try to find an existing (hidden) watcher
            watcher = detect(
                stage.children,
                morph => morph instanceof WatcherMorph &&
                    morph.target === target &&
                        morph.getter === name
            );
            if (watcher !== null) {
                watcher.show();
                watcher.fixLayout(); // re-hide hidden parts
                return;
            }
            // if no watcher exists, create a new one
            isGlobal = contains(
                this.homeContext.receiver.globalVariables().names(),
                varName
            );
            if (isGlobal || target.owner) {
                label = name;
            } else {
                label = name + ' ' + localize('(temporary)');
            }
            watcher = new WatcherMorph(
                label,
                SpriteMorph.prototype.blockColor.variables,
                target,
                name
            );
            watcher.setPosition(stage.position().add(10));
            others = stage.watchers(watcher.left());
            if (others.length > 0) {
                watcher.setTop(others[others.length - 1].bottom());
            }
            stage.add(watcher);
            watcher.fixLayout();
            watcher.rerender();
        };
    };
};

Process.prototype.doHideVar = function (varName, context) {
    // if no varName is specified delete all watchers on temporaries
    // context is an optional start-context to be used by extensions
    var varFrame = (context || this.context).variables,
        stage,
        watcher,
        target,
        name = varName;

    if (name instanceof Context) {
        if (name.expression.selector === 'reportGetVar') {
            name = name.expression.blockSpec;
        } else {
            this.blockReceiver().changeBlockVisibility(name.expression, true);
            return;
        };
    };  if (!name) {
        this.doRemoveTemporaries();
        return;
    };  if (this.homeContext.receiver) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (stage) {
            target = varFrame.find(name);
            watcher = detect(
                stage.children,
                morph => morph instanceof WatcherMorph &&
                    morph.target === target &&
                        morph.getter === name
            );
            if (watcher !== null) {
                if (watcher.isTemporary()) {
                    watcher.destroy();
                } else {
                    watcher.hide();
                };
            };
        };
    };
};

Process.prototype.doRemoveTemporaries = function () {
    var stage;
    if (this.homeContext.receiver) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (stage) {
            stage.watchers().forEach(watcher => {
                if (watcher.isTemporary()) {
                    watcher.destroy();
                }
            });
        }
    }
};

// Process sprite inheritance primitives

Process.prototype.doDeleteAttr = function (attrName) {var name = attrName, rcvr = this.blockReceiver(); if (name instanceof SpriteMorph) {if (attrName.isTemporary) {world.children[0].silentRemoveSprite(attrName);}
else {world.children[0].removeSprite(attrName);}} else if (name instanceof Context) {if (name.expression.selector === 'reportGetVar') {name = name.expression.blockSpec;} else {name = {xPosition: 'x position',
yPosition: 'y position', direction: 'direction', getCostumeIdx: 'costume #', size: 'size'}[name.expression.selector]; if (!isNil(name)) {rcvr.inheritAttribute(name);};}} if (name instanceof Array) {return
rcvr.inheritAttribute(this.inputOption(name));}; if (contains(rcvr.inheritedVariableNames(true), name)) {rcvr.deleteVariable(name);}};

// message passing primitives

Process.prototype.doTellTo = function anonymous (sprite, context, args) {this.doRun(this.reportAttributeOf(context, sprite), args);};
Process.prototype.tellToCT = Process.prototype.doTellTo; Process.prototype.reportAskFor = function anonymous (sprite, context, args) {
this.evaluate(this.reportAttributeOf(context, sprite), args);}; /* These block processes are to passing arguments to sprites or the stage. */

// Process speech synthesis primitives 

Process.prototype.doSpeakAndWait = function anonymous (msg) {var myself = this; if (!(myself.tts instanceof SpeechSynthesisUtterance)) {myself.tts = new SpeechSynthesisUtterance(msg.toString(
)); myself.tts.pitch = +myself.receiver.speakingPitch; myself.tts.rate = +myself.receiver.speakingSpeed; myself.tts.lang = myself.receiver.speakingLanguage; myself.speakingDone = false; (myself
).tts.onend = (() => {myself.speakingDone = true;}); window.speechSynthesis.speak(myself.tts);}; if (!(myself.speakingDone)) {myself.pushContext('doYield'); myself.pushContext();} else {delete (
myself.tts);};}; Process.prototype.doSetSpeakingPitch = function (pitch) {this.receiver.speakingPitch = [1, 0.5, 1.5, 0, 2][Object.keys(InputSlotMorph.prototype.speakingPitchMenu()).indexOf((pitch
).toString())];}; Process.prototype.doSetSpeakingSpeed = function (speed) {this.receiver.speakingSpeed = [4, 2, 1, 0.5, 0.25][Object.keys(InputSlotMorph.prototype.speakingSpeedMenu()).indexOf(
speed.toString())];}; Process.prototype.doSetSpeakingLanguage = function (language) {this.receiver.speakingLanguage = ['ar', 'zh-TW', 'dk', 'nl', 'en-GB', 'en-US', 'fr', 'de', 'el', 'bn', 'is',
'it', 'ja', 'kr', 'no', 'pl', 'pt', 'pt-BR', 'ro', 'ru', 'es-AR', 'es-MX', 'sv', 'tr', 'cy'][Object.keys(InputSlotMorph.prototype.speakingLanguageMenu()).indexOf(language.toString())];};

// Process lists primitives

Process.prototype.reportNewList = function anonymous (elements) {return elements;};

Process.prototype.reportCONS = function anonymous (car, cdr) {this.assertType(cdr, 'list'); return (new List).cons(car, cdr);};
Process.prototype.reportCDR = function anonymous (list) {this.assertType(list, 'list'); return list.cdr();};

Process.prototype.doAddToList = function anonymous (element, list) {
this.assertType(list, 'list'); if (list.type) {this.assertType(element,
list.type); list = this.shadowListAttribute(list);}; list.add(element);};

Process.prototype.doDeleteFromList = function (index, list) {
    var idx = index;
    this.assertType(list, 'list');
    if (list.type) {
        list = this.shadowListAttribute(list);
    };  if (this.inputOption(index) === 'all') {
        return list.clear();
    };  if (index === '') {
        return null;
    };  if (this.inputOption(index) === 'last') {
        idx = list.length();
    } else if (isNaN(+this.inputOption(index))) {
        return null;
    };  list.remove(idx);
};

Process.prototype.doInsertInList = function (element, index, list) {
    var idx = index;
    this.assertType(list, 'list');
    if (list.type) {
        this.assertType(element, list.type);
        list = this.shadowListAttribute(list);
    };  if (index === '') {
        return null;
    };  if (this.inputOption(index) === 'any') {
        idx = this.reportBasicRandom(1, list.length() + 1);
    };  if (this.inputOption(index) === 'last') {
        idx = list.length() + 1;
    };  list.add(element, idx);
};

Process.prototype.doReplaceInList = function (index, list, element) {
    var idx = index;
    this.assertType(list, 'list');
    if (list.type) {
        this.assertType(element, list.type);
        list = this.shadowListAttribute(list);
    }
    if (index === '') {
        return null;
    }
    if (this.inputOption(index) === 'any') {
        idx = this.reportBasicRandom(1, list.length());
    }
    if (this.inputOption(index) === 'last') {
        idx = list.length();
    }
    list.put(element, idx);
};

Process.prototype.shadowListAttribute = function (list) {
    var rcvr;
    if (list.type === 'costume' || list.type === 'sound') {
        rcvr = this.blockReceiver();
        if (list === rcvr.costumes) {
            rcvr.shadowAttribute('costumes');
            list = rcvr.costumes;
        } else if (list === rcvr.sounds) {
            rcvr.shadowAttribute('sounds');
            list = rcvr.sounds;
        }
    }
    return list;
};

// Process accessing list elements - hyper dyadic

Process.prototype.reportListItem = function (index, list) {
    this.assertType(list, 'list');
    if (index === '') {
        return '';
    }
    if (index instanceof Array) {
        if (index[0] === 'any') {
            return list.at(this.reportBasicRandom(1, list.length()));
        }
        if (index[0] === 'last') {
            return list.at(list.length());
        }
        return '';
    }
    if (index instanceof List && this.enableHyperOps) {
        return list.query(index);
    }
    return list.at(index);
};

// Process - tabular list ops

Process.prototype.reportTranspose = function anonymous (list
) {this.assertType(list, 'list'); return list.transpose();};

Process.prototype.reportCrossproduct = function (lists) {
this.assertType(lists, 'list'); if (lists.isEmpty()) {
return lists;}; this.assertType(lists.at(1), 'list');
return lists.crossproduct();};

Process.prototype.reportExpandedList = function anonymous (length, list
) {this.assertType(list, ['list']); list = list.fullCopy(); var i = 0;
while (i < length) {if (list.type) {this.assertType(0, list.type);};
list.add(0); i++;}; return list;}; /* New feature after down. v */

Process.prototype.doSetListLength = function anonymous (list, length) {
this.assertType(list, ['list']); var backup = list.asArray(), i = 0;
list.clear(); while (i < length) {if (list.type) {this.assertType(element,
list.type); list = this.shadowListAttribute(list);}; list.add(backup[
Math.round((i * (backup.length / length)) - 0.5)]); i++;};}; /* New feature. */

Process.prototype.reportListAtThatLength = function anonymous (list, length
) {this.assertType(list, ['list']); var backup = list.fullCopy().asArray(
), i = 0, result = []; while (i < length) {result.push(backup[Math.round((
i * (backup.length / length)) - 0.5)]); i++;}; return new List(result);};

Process.prototype.reportReshape = function (list, shape) {
    this.assertType(shape, 'list');
    list = list instanceof List ? list : new List([list]);
    return list.reshape(shape);
};

Process.prototype.reportSlice = function (list, indices) {
    this.assertType(list, 'list');
    this.assertType(indices, 'list');
    return list.slice(indices);
};

// Process - other basic list accessors

Process.prototype.reportListAttribute = function (choice, list) {
    var option = this.inputOption(choice);
    switch (option) {
    case 'length':
        this.assertType(list, 'list');
        return list.length(); break;
    case 'size':
        this.assertType(list, 'list');
        return list.size(); break;
    case 'rank':
        return (list instanceof List
        ) ? list.rank() : 0; break;
    case 'dimensions':
        return (list instanceof List
        ) ? list.shape() : new List;
        break;
    case 'flatten':
        return (list instanceof List
        ) ? list.ravel() : new List([list]);
        break;
    case 'columns':
        this.assertType(list, 'list');
        return list.columns(); break;
    case 'no copies':
    case 'uniques':
    case 'values':
        this.assertType(list, 'list');
        return this.reportRemoveDuplicates(list);
        break;
    case 'transpose':
        this.assertType(list, 'list');
        return list.transpose();
        break;
    case 'distribution':
        this.assertType(list, 'list');
        return this.reportAnalyze(list);
        break;
    case 'reverse':
        this.assertType(list, 'list');
        return list.reversed(); break;
    case 'sorted':
        this.assertType(list, 'list');
        return this.reportSorted(list);
        break;
    case 'shuffled':
        this.assertType(list, 'list');
        return this.reportShuffled(list);
        break;
    case 'lines':
        this.assertType(list, 'list');
        if (list.canBeTXT()) {
            return list.asTXT();
        };  throw new Error(
            localize('unable to convert to') + ' ' + localize('lines')
        );  break;
    case 'csv':
        this.assertType(list, 'list');
        if (list.canBeCSV()) {
            return list.asCSV();
        };  throw new Error(
            localize('unable to convert to') + ' ' + localize('CSV')
        );  break;
    case 'json':
        this.assertType(list, 'list');
        if (list.canBeJSON()) {
            return list.asJSON();
        };  throw new Error(
            localize('unable to convert to') + ' ' + localize('JSON')
        );  break;
    case 'xml':
        this.assertType(list, 'list');
        if (list.canBeXML()) {
            return list.asXML();
        };  throw new Error(
            localize('unable to convert to') + ' ' + localize('XML')
        );  break;
    case 'blocks':
        this.assertType(list, 'list');
        if (list.canBeBlocks()) {
            return this.reify(list.blockify(), new List);
        };  throw new Error(
            localize('unable to convert to') + ' ' + localize('blocks')
        );  break;
    default:
        return 0;
    };
};

Process.prototype.reportListIndexFixed = function anonymous (option, element, list) {
this.assertType(list, 'list'); return list[(this.inputOption(option)).concat('Of')](element);};

Process.prototype.reportListContainsItem = function (list, element) {
    this.assertType(list, 'list');
    return list.contains(element);
};  Process.prototype.reportListOnlyHasItem = function (list, element) {
    this.assertType(list, 'list');
    return list.onlyHas(element);
};  Process.prototype.reportListIsEmpty = function (list) {
    this.assertType(list, 'list');
    return list.isEmpty();
};  Process.prototype.doShowTable = function (list) {
    this.assertType(list, 'list');
    new TableDialogMorph(list).popUp(
    this.blockReceiver().world());
};  Process.prototype.reportSorted = function (data) {
return new List(data.itemsArray().slice().sort((a,
b) => this.sortingLessThan(a, b) ? - 1 : 1));};

Process.prototype.sortingLessThan = function (a, b) {
    // private - this is an elaborate version of reportBasicLessThan()
    // that is similar to snapEquals in that it will work with heterogeneous
    // data types but is too slow for everyday use. Therefore it is currently
    // only used for the generalized sorting of arbitrary data (lists)
    // and not exposed as the (better) semantics behind "<"

    var order = [
            'list',
            'text',
            'number',
            'Boolean',
            'command',
            'reporter',
            'predicate',
            'function',
            'costume',
            'sound',
            'color',
            'sprite',
            'stage',
            'nothing',
            'undefined'
        ], typeA = this.reportTypeOf(
        a), typeB = this.reportTypeOf(
        b), lenA, lenB;

    if (typeA !== typeB) {
        return order.indexOf(typeA) < order.indexOf(typeB);
    }; switch (typeA) {
    case 'list':
        // primary: length of list descending (!)
        // secondary: contents of columns from left to right
        // recursive, hope this doesn't crash on large tables
        lenA = a.length();
        lenB = b.length();
        return lenA > lenB || (
            lenA === lenB && (
                !lenA ||
                this.sortingLessThan(a.at(1), b.at(1)) ||
                    (snapEquals(a.at(1), b.at(1)) &&
                    this.sortingLessThan(a.cdr(), b.cdr()))
            )
        );
    case 'command':
    case 'reporter':
    case 'predicate':
        return a.expression.abstractBlockSpec() <
            b.expression.abstractBlockSpec();
    case 'costume':
    case 'sound':
    case 'sprite':
    case 'stage':
        return a.name < b.name;
    case 'color':
        return (a.r + a.g + a.b + a.a) < (b.r + b.g + b.b + b.a);
    default:
        // number, Boolean, text or other
        return this.reportBasicLessThan(a, b);
    };
};

Process.prototype.reportShuffled = function (data) {
    // Fisher-Yates algorithm
    var array = [...data.itemsArray()],
        i, k, tmp;
    for (i = array.length - 1; i > 0; i -= 1) {
        k = Math.floor(Math.random() * (i + 1));
        tmp = array[i];
        array[i] = array[k];
        array[k] = tmp;
    }; return new List(array);
};

Process.prototype.reportRemoveDuplicates = function anonymous (list) {var sourceList = list.fullCopy(), result = [], i = 0;
while (i < sourceList.length()) {if (sourceList.indexOf(sourceList.at(i + 1)) === (i + 1)) {result.push(sourceList.at(i + 1
));}; i++;}; return new List(result);}; /* This algorithm have the possibility to remove the duplicated items of a list. */

// Process non-HOF list primitives

Process.prototype.reportNumbers = function (start, end) {
    // hyper-dyadic
    if (this.enableHyperOps) {
        return this.hyperDyadic(
            (strt, stp) => new List(this.reportBasicNumbers(strt, stp)),
            start,
            end
        );
    }; return this.reportLinkedNumbers(start, end);
};

Process.prototype.reportBasicNumbers = function (start, end) {
    // answer a new arrayed list containing an linearly ascending progression
    // of integers beginning at start to end.
    var result, len, i,
        s = +start,
        e = +end,
        n = s;

    this.assertType(s, 'number');
    this.assertType(e, 'number');

    if (e > s) {
        len = Math.floor(e - s);
        result = new Array(len);
        for(i = 0; i <= len; i += 1) {
            result[i] = n;
            n += 1;
        };
    } else {
        len = Math.floor(s - e);
        result = new Array(len);
        for(i = 0; i <= len; i += 1) {
            result[i] = n;
            n -= 1;
        };
    }; return result;
};

Process.prototype.reportListCombination = function (choice, lists) {
    var option = this.inputOption(choice);
    switch (option) {
    case 'append':
        return this.reportConcatenatedLists(lists);
    case 'cross product':
        return this.reportCrossproduct(lists);
    default:
        return lists;
    };
};

Process.prototype.reportConcatenatedLists = function (lists) {
    var first, result, rows, row, rowIdx, cols, col;
    this.assertType(lists, 'list');
    if (lists.isEmpty()) {
        return lists;
    }; first = lists.at(1);
    this.assertType(first, 'list');
    if (first.isLinked) { // link everything
        return this.concatenateLinkedLists(lists);
    }; // in case the first sub-list is arrayed
    result = []; rows = lists.length();
    for (rowIdx = 1; rowIdx <= rows; rowIdx += 1) {
        row = lists.at(rowIdx);
        this.assertType(row, 'list');
        cols = row.length();
        for (col = 1; col <= cols; col += 1) {
            result.push(row.at(col));
    };}; return new List(result);
};

Process.prototype.concatenateLinkedLists = function (lists) {
    var first;
    if (lists.isEmpty()) {
        return lists;
    }; first = lists.at(1);
    this.assertType(first, 'list');
    if (lists.length() === 1) {
        return first;
    }; if (first.isEmpty()) {
        return this.concatenateLinkedLists(lists.cdr());
    }; return lists.cons(
        first.at(1),
        this.concatenateLinkedLists(
            lists.cons(
                first.cdr(),
                lists.cdr()
            )
        )
    );
};

// Process interpolated non-HOF list primitives

Process.prototype.reportLinkedNumbers = function (start, end) {
    // answer a new linked list containing an linearly ascending progression
    // of integers beginning at start to end.
    // this is interpolated so it can handle big ranges of numbers
    // without blocking the UI

    var dta; if (this.context.accumulator === null) {
        this.assertType(start, 'number');
        this.assertType(end, 'number');
        this.context.accumulator = {
            target : new List(),
            end : null,
            idx : +start,
            step: +end > +start ? +1 : -1
        }; this.context.accumulator.target.isLinked = true;
        this.context.accumulator.end = this.context.accumulator.target;
    }; dta = this.context.accumulator;
    if (dta.step === 1 ? dta.idx > +end : dta.idx < +end) {
        dta.end.rest = new List();
        this.returnValueToParentContext(dta.target.cdr());
        return;
    }; dta.end.rest = dta.target.cons(dta.idx);
    dta.end = dta.end.rest;
    dta.idx += dta.step;
    this.pushContext();
};

// Process conditionals primitives

Process.prototype.doIf = function (block) {
    var args = this.context.inputs,
        inps = block.inputs(),
        outer = this.context.outerContext,
        acc = this.context.accumulator,
        isCustomBlock = this.context.isCustomBlock;

    if (!acc) {
        acc = this.context.accumulator = {
            args: inps.slice(0, 2).concat(inps[2].inputs())
        };
    }; if (!args.length) {
        if (acc.args.length) {
            this.pushContext(
	          acc.args.shift(), outer);
            this.context.isCustomBlock = isCustomBlock;
            return;
        }; this.popContext(); return;
    }; if (args.pop()) {
        this.popContext();
        this.pushContext(acc.args.shift().evaluate()?.blockSequence(), outer);
        this.context.isCustomBlock = isCustomBlock;
        return;
    }; acc.args.shift();
};

Process.prototype.doIfElse = function () {
    var args = this.context.inputs,
        outer = this.context.outerContext, // for tail call elimination
        isCustomBlock = this.context.isCustomBlock;

    // this.assertType(args[0], ['Boolean']);
    this.popContext();
    if (asABool(args[0])) {
        if (args[1]) {
            this.pushContext(args[1].blockSequence(), outer);
        };
    } else {
        if (args[2]) {
            this.pushContext(args[2].blockSequence(), outer);
        } else {
            this.pushContext('doYield');
        };
    }; if (this.context) {
        this.context.isCustomBlock = isCustomBlock;
    }; this.pushContext();
};

Process.prototype.reportIfElse = function (block) {
    var inputs = this.context.inputs,
        accumulator,
        condition,
        expression,
        trueIsBlock,
        falseIsBlock;

    if (inputs.length < 1) {
        // evaluate the first input, either a Boolean or a (nested) list
        this.evaluateNextInput(block);
        return;
    }; if (inputs[0] instanceof List && this.enableHyperOps) {
        // hyperize a (nested) list of Booleans
        if (this.context.accumulator === null) {
            // cache literal true/false cases for optimized evaluation
            trueIsBlock = block.inputs()[1] instanceof BlockMorph;
            falseIsBlock = block.inputs()[2] instanceof BlockMorph;
            this.context.accumulator = {
                results : [],
                trueIsLiteral : !trueIsBlock,
                trueCase : trueIsBlock ? null : block.inputs()[1].evaluate(),
                falseIsLiteral : !falseIsBlock,
                falseCase : falseIsBlock ? null : block.inputs()[2].evaluate()
            };
            // optimize if both true-/false- cases are literals
            // for atomic conditions:
            if (!trueIsBlock && !falseIsBlock) {
                this.returnValueToParentContext(inputs[0].deepMap(
                    leaf => leaf ? this.context.accumulator.trueCase
                        : this.context.accumulator.falseCase)
                );
                this.popContext();
                return;
            };
        } else if (inputs.length > 1) {
            // retrieve & remember previous result & remove it from the inputs
            this.context.accumulator.results.push(inputs.pop());
        };  accumulator = this.context.accumulator;
        if (accumulator.results.length === inputs[0].length()) {
            // done with all the conditions in the current list
            this.returnValueToParentContext(
                new List(accumulator.results)
            );
            this.popContext();
            return;
        };  condition = inputs[0].at(accumulator.results.length + 1);
        // optimize single literal true-/false- cases for atomic conditions:
        if (!(condition instanceof List)) {
            if (condition && accumulator.trueIsLiteral) {
                accumulator.results.push(accumulator.trueCase);
                return;
            };  if (!condition && accumulator.falseIsLiteral) {
                accumulator.results.push(accumulator.falseCase);
                return;
            };
        };  this.pushContext(block); // recursive call
        this.context.addInput(condition);
        // optimize evaluation of literals:
        this.context.accumulator = copy(accumulator);
        this.context.accumulator.results = [];
        return;
    };  // handle a scalar condition
    if (inputs.length > 1) {
        // done with evaluating a case, retrieve and return its result
        if (this.flashContext()) {return; }
        this.returnValueToParentContext(inputs.pop());
        this.popContext();
        return;
    };  // this.assertType(inputs[0], ['Boolean']);
    if (inputs[0]) {
        expression = block.inputs()[1]; // true block
    } else {
        expression = block.inputs()[2]; // false block
    };  this.pushContext(expression);
};  //  Processing related primitives

Process.prototype.doStopThis = function (choice) {var ide = world.children[0]; switch (this.inputOption(choice)) {case 'this scene': case 'all': ide.scene.stop(); break; case 'this scene and restart':
(ide.scene).restart(); ide.runScripts(); break; case 'all scenes': ide.scenes.forEach(scn => scn.stop(true)); break; case 'this sprite': ide.stage.threads.stopAllForReceiver((this.context.outerContext
).receiver, this); this.stop(); if (this.blockReceiver() instanceof SpriteMorph) {this.blockReceiver().stopTalking();}; break; case 'this script': this.stop(); break; case 'this block': this.doStopBlock(
); break; case 'this scene but this script': case 'all but this script': ide.stage.threads.stopAll(this); break; case 'this sprite but this script': case 'other scripts in sprite': (ide.stage.threads
).stopAllForReceiver(this.context.outerContext.receiver, this); break; default: nop();};}; Process.prototype.runScript = function (action) {if ((action) instanceof CommandBlockMorph
) {if (!this.context.startTime) {this.context.startTime = Date.now();}; if (this.context.isOnlyToOnce) {delete this.context.isOnlyToOnce;} else {this.context.isOnlyToOnce = true;
this.pushContext(action.blockSequence()); this.pushContext('doYield'); this.pushContext();};};};

// Atomic Functions: The atomic functions are functions that are running all of the blocks inside them all at once. In BYOB, only appears as an option menu for the custom blocks.

Process.prototype.doWarp = function (body) {var outer = this.context.outerContext, isCustomBlock = this.context.isCustomBlock, stage; this.popContext(); if (body) {if (
this.homeContext.receiver) {if (this.homeContext.receiver.startWarp) {this.homeContext.receiver.startWarp();}; stage = this.homeContext.receiver.parentThatIsA(StageMorph
);}; this.pushContext('popContext'); if (this.context) {this.context.isCustomBlock = isCustomBlock;}; if (!this.isAtomic) {this.pushContext('doStopWarping');}; (this
).pushContext(body.blockSequence(), outer); this.isAtomic = true;}; this.pushContext();}; Process.prototype.doStopWarping = function () {var stage; this.popContext();
this.isAtomic = false; if (this.homeContext.receiver) {if (this.homeContext.receiver.endWarp) {this.homeContext.receiver.endWarp();}; stage = (this.homeContext.receiver
).parentThatIsA(StageMorph);};}; Process.prototype.doSetFastTracking = function (bool) {var ide; if (this.homeContext.receiver) {ide = (this.homeContext.receiver
).parentThatIsA(IDE_Morph); if (ide) {if (asABool(bool)) {ide.startFastTracking();} else {ide.stopFastTracking();};};};}; (Process.prototype.reportIsFastTracking
) = function () {var ide = world.childThatIsA(IDE_Morph); return ((ide instanceof IDE_Morph) ? ide.stage.isFastTracked : false);}; (Process.prototype.compileFast
) = function (action) {/* window.alert(reportBasicToJS(action)); */ reportBasicToJS(action).apply(this.blockReceiver(), [this]);};

// Statement Functions: Are for managing scripts more than expected. :-)

Process.prototype.doCatch = function anonymous (tag, action) {if (action instanceof CommandBlockMorph) {if (this.context.isOnlyToOnce) {delete this.context.isOnlyToOnce;} else {this.context.isOnlyToOnce = true;
this.context.outerContext.variables.addVar(tag); this.context.outerContext.variables.setVar(tag, this.context.catchContinuation()); this.pushContext(action.blockSequence()); this.pushContext('doYield');
this.pushContext();};};}; Process.prototype.throw = function anonymous (catchtag) {if (catchtag instanceof Context) {if (catchtag.isCatchContinuation) {this.doRun(catchtag, new List);} else {throw Error(
localize('The catchtag isn\'t a tag-continuation.'));};} else {throw Error(localize('The catchtag isn\'t a tag-continuation.'));};}; /* Are really managed by modified and catched continuations. :-) */

// Global Flags:

Process.prototype.doSetGlobalFlag = function anonymous (name, bool) {var stage = this.homeContext.receiver.parentThatIsA(StageMorph); name = this.inputOption(name); switch (name) {case 'turbo mode':
this.doSetFastTracking(bool); break; case 'flat line ends': SpriteMorph.prototype.useFlatLineEnds = asABool(bool); break; case 'log pen vectors': StageMorph.prototype.enablePenLogging = asABool(
bool); break; case 'video capture': if (asABool(bool)) {this.startVideo(stage);} else {stage.stopProjection();}; break; case 'mirror video': stage.mirrorVideo = asABool(bool); break;};};

Process.prototype.reportGlobalFlag = function (name) {var stage = this.homeContext.receiver.parentThatIsA(StageMorph); name = this.inputOption(name); switch (name) {case 'turbo mode':
return this.reportIsFastTracking(); case 'flat line ends': return SpriteMorph.prototype.useFlatLineEnds; case 'log pen vectors': return StageMorph.prototype.enablePenLogging; case 'video capture':
return !isNil(stage.projectionSource) && stage.projectionLayer().getContext('2d').getImageData(0, 0, 1, 1).data[3] > 0; case 'mirror video': return stage.mirrorVideo; default: return '';};};

// Pause and Resume:

Process.prototype.doPauseOptions = function (choice) {var stage = world.childThatIsA(IDE_Morph).stage; if (choice == 'this scene') {stage.threads.pauseAll(stage); stage.timerProcedure.pauseNow();} else if (
choice == 'this scene but this script') {stage.pauseAllActiveSounds(); var myObj = this.blockReceiver(), myself = this; stage.threads.processes.filter(proc => (!(proc === myself))).forEach(proc => (proc.root instanceof BlockMorph) ? ((proc.root.selector === 'receiveInteraction') ? ((proc.root.inputs()[0].evaluate() === 'paused') ? null : proc.pause()) : proc.pause()) : proc.pause()); myObj.receiveUserInteraction(
'paused', true, true);} else if (choice == 'this sprite') {this.doPauseOptions(['this sprite but this script']); this.pause();} else if (choice == 'this script') {this.pause();} else if (choice == (
'this sprite but this script')) {var myObj = this.blockReceiver(), myself = this; stage.threads.processes.filter(proc => ((proc.blockReceiver() === myObj) && !(proc === myself))).forEach(proc => (
proc.root instanceof BlockMorph) ? ((proc.root.selector === 'receiveInteraction') ? ((proc.root.inputs()[0].evaluate() === 'paused') ? null : proc.pause()) : proc.pause()) : proc.pause()); (myObj
).receiveUserInteraction('paused', true, true);}; world.childThatIsA(IDE_Morph).controlBar.pauseButton.refresh();}; Process.prototype.doResumeOptions = function (choice) {var ide = world.children[
0]; if (Process.prototype.inputOption(choice) === 'this scene') {ide.stage.threads.resumeAll(ide.stage); ide.stage.timerProcedure.resumeNow(); ide.controlBar.pauseButton.refresh(); (ide.stage
).resumeAllActiveSounds(); world.children.filter(function (child) {if (child instanceof DialogBoxMorph) {return (child.key).includes('debug');} else {return false;};}).forEach(function (child
) {child.destroy();});} else {var myself = this; ide.stage.threads.processes.forEach(proc => ((proc.receiver === myself.receiver) ? proc.resume() : nop())); ide.stage.runUnpauseScripts((this
).receiver);};}; /* You can pause or resume scripts in many different ways, you can try every choice in the revamped pause block and try the new resume block. Also, debugging works with. */

// Process loop primitives

Process.prototype.doForever = function (body) {this.context.inputs = []; this.pushContext('doYield'
); if (body instanceof BlockMorph) {this.pushContext(body.blockSequence());}; this.pushContext();};

Process.prototype.doRepeat = function anonymous (counter, body) {var block = this.context.expression, outer = this.context.outerContext,
isCustomBlock = this.context.isCustomBlock; if (isNaN(counter) || (counter < 1)) {return null;}; this.popContext(); this.pushContext(
block, outer); this.context.isCustomBlock = isCustomBlock; this.context.addInput(counter - 1); this.pushContext('doYield'); if (body
) {this.pushContext(body.blockSequence());}; this.pushContext();}; /* Repeats the script's action for n times. Is really useful. :) */

Process.prototype.doTimrLp = function anonymous (secs, body) {
if (!this.context.timerLoop) {this.context.timerLoop = Date.now();};
if ((Date.now() - this.context.timerLoop) >= (secs * 1000)) {
delete this.context.timerLoop; this.popContext(); this.pushContext('doYield');
return null;}; this.context.inputs = []; this.pushContext('doYield');
if (body) {this.pushContext(body.blockSequence());}; this.pushContext();};
/* Repeats the script's action for n seconds. Is really useful. :) */

Process.prototype.doUntil = function (goalCondition, body) {if (asABool(goalCondition)) {this.popContext(); this.pushContext('doYield'); return null;};
this.context.inputs = []; this.pushContext('doYield'); if (body) {this.pushContext(body.blockSequence());}; this.pushContext();};
Process.prototype.doWhile = function (goalCondition, body) {if (!asABool(goalCondition)) {this.popContext(); this.pushContext('doYield'); return null;};
this.context.inputs = []; this.pushContext('doYield'); if (body) {this.pushContext(body.blockSequence());}; this.pushContext();};

Process.prototype.doWaitUntil = function (goalCondition) {if (asABool(goalCondition)) {this.popContext(); this.pushContext('doYield');
return null;}; this.context.inputs = []; this.pushContext('doYield'); this.pushContext();};
Process.prototype.doWaitWhile = function (goalCondition) {if (!asABool(goalCondition)) {this.popContext(); this.pushContext('doYield');
return null;}; this.context.inputs = []; this.pushContext('doYield'); this.pushContext();};

// Process interpolated iteration primitives

Process.prototype.doForEach = function (upvar, list, script) {var next; if (this.context.accumulator === null) {this.assertType(list, 'list'); this.context.accumulator = {source : list, remaining : list.length(
), idx : 0};}; if (this.context.accumulator.remaining === 0) {return;}; this.context.accumulator.remaining -= 1; if (this.context.accumulator.source.isLinked) {next = this.context.accumulator.source.at(1);
this.context.accumulator.source = this.context.accumulator.source.cdr();} else {this.context.accumulator.idx += 1; next = this.context.accumulator.source.at(this.context.accumulator.idx);
}; if (script instanceof BlockMorph) {this.pushContext('doYield'); this.pushContext(script.blockSequence()); this.pushContext();}; this.context.outerContext.variables.addVar(upvar);
this.context.outerContext.variables.setVar(upvar, next);}; /* This block is revamped with changing a little bit its processing function to make it more faster to run for now. :-) */

Process.prototype.doFor = function (upvar, start, end, script) {var vars = this.context.outerContext.variables, dta = this.context.accumulator; if (dta === null) {this.assertType(start, 'number'
); this.assertType(end, 'number'); dta = this.context.accumulator = {test : +start < +end ? (() => vars.getVar(upvar) > +end) : (() => vars.getVar(upvar) < +end), step : +start < +end ? 1 : -1
}; vars.addVar(upvar); vars.setVar(upvar, Math.floor(+start));} else {vars.changeVar(upvar, dta.step);}; if (!dta.test()) {if (script instanceof BlockMorph) {this.pushContext('doYield');
this.pushContext(script.blockSequence()); this.pushContext();};};}; /* This block is revamped with changing a little bit its processing function to make it more faster to run for now. :-) */

// Process interpolated HOF primitives

/*
    this.context.inputs:
    [0] - reporter
    [1] - list (original source)
    -----------------------------
    [2] - last reporter evaluation result

    these primitives used to store the accumulated data in the unused parts
    of the context's input-array. For reasons obscure to me this led to
    JS stack overflows when used on large lists (> 150 k items). As a remedy
    aggregations are now accumulated in the "accumulator" property slot
    of Context. Why this speeds up execution by orders of magnitude while
    "fixing" the stack-overflow issue eludes me. -Jens
*/

Process.prototype.reportMap = function (reporter, list) {
    // answer a new list containing the results of the reporter applied
    // to each value of the given list. Distinguish between linked and
    // arrayed lists.
    // if the reporter uses formal parameters instead of implicit empty slots
    // there are two additional optional parameters:
    // #1 - element
    // #2 - optional | index
    // #3 - optional | source list
    var next, index, parms;
    if (list.isLinked) {
        if (this.context.accumulator === null) {
            this.assertType(list, 'list');
            this.context.accumulator = {
                source : list,
                idx : 1,
                target : new List(),
                end : null,
                remaining : list.length()
            };  this.context.accumulator.target.isLinked = true;
            this.context.accumulator.end = this.context.accumulator.target;
        } else if (this.context.inputs.length > 2) {
            this.context.accumulator.end.rest = list.cons(
                this.context.inputs.pop()
            );  this.context.accumulator.end = this.context.accumulator.end.rest;
            this.context.accumulator.idx += 1;
            this.context.accumulator.remaining -= 1;
        };  if (this.context.accumulator.remaining === 0) {
            this.context.accumulator.end.rest = list.cons(
                this.context.inputs[2]
            ).cdr();
            this.returnValueToParentContext(
                this.context.accumulator.target.cdr()
            );  return;
        };  index = this.context.accumulator.idx;
        next = this.context.accumulator.source.at(1);
        this.context.accumulator.source = this.context.accumulator.source.cdr();
    } else { // arrayed
        if (this.context.accumulator === null) {
            this.assertType(list, 'list');
            this.context.accumulator = [];
        } else if (this.context.inputs.length > 2) {
            this.context.accumulator.push(this.context.inputs.pop());
        };  if (this.context.accumulator.length === list.length()) {
            this.returnValueToParentContext(
                new List(this.context.accumulator)
            );  return;
        };  index = this.context.accumulator.length + 1;
        next = list.at(index);
    };  this.pushContext();
    parms = [next];
    if (reporter.constructor.name === 'Function') {
        if (reporter.length > 1) {
            parms.push(index);
        };  if (reporter.length > 2) {
            parms.push(list);
        };
    };  if (reporter instanceof Context) {
        // can also be a list of rings
        if (reporter.inputs.length > 1) {
            parms.push(index);
        };
        if (reporter.inputs.length > 2) {
            parms.push(list);
        };
    };  return this.evaluate(reporter, new List(parms));
};

Process.prototype.reportKeep = function (predicate, list) {
    // Filter - answer a new list containing the items of the list for which
    // the predicate evaluates TRUE.
    // Distinguish between linked and arrayed lists.
    // if the predicate uses formal parameters instead of implicit empty slots
    // there are two additional optional parameters:
    // #1 - element
    // #2 - optional | index
    // #3 - optional | source list
    var next, index, parms;
    if (list.isLinked) {
        if (this.context.accumulator === null) {
            this.assertType(list, 'list');
            this.context.accumulator = {
                source : list,
                idx: 1,
                target : new List(),
                end : null,
                remaining : list.length()
            };
            this.context.accumulator.target.isLinked = true;
            this.context.accumulator.end = this.context.accumulator.target;
        } else if (this.context.inputs.length > 2) {
            if (this.context.inputs.pop() === true) {
                this.context.accumulator.end.rest = list.cons(
                    this.context.accumulator.source.at(1)
                );
                this.context.accumulator.end =
                    this.context.accumulator.end.rest;
            }
            this.context.accumulator.remaining -= 1;
            this.context.accumulator.idx += 1;
            this.context.accumulator.source =
                this.context.accumulator.source.cdr();
        }
        if (this.context.accumulator.remaining === 0) {
            this.context.accumulator.end.rest = new List;
            this.returnValueToParentContext(
                this.context.accumulator.target.cdr()
            );
            return;
        }
        index = this.context.accumulator.idx;
        next = this.context.accumulator.source.at(1);
    } else { // arrayed
        if (this.context.accumulator === null) {
            this.assertType(list, 'list');
            this.context.accumulator = {
                idx : 0,
                target : []
            };
        } else if (this.context.inputs.length > 2) {
            if (this.context.inputs.pop() === true) {
                this.context.accumulator.target.push(
                    list.at(this.context.accumulator.idx)
                );
            }
        }
        if (this.context.accumulator.idx === list.length()) {
            this.returnValueToParentContext(
                new List(this.context.accumulator.target)
            );
            return;
        }
        this.context.accumulator.idx += 1;
        index = this.context.accumulator.idx;
        next = list.at(index);
    }
    this.pushContext();
    parms = [next];
    if (predicate.constructor.name === 'Function') {
        if (predicate.length > 1) {
            parms.push(index);
        };
        if (predicate.length > 2) {
            parms.push(list);
        };
    };  if (predicate instanceof Context) {
        // can also be a list of rings
        if (predicate.inputs.length > 1) {
            parms.push(index);
        };
        if (predicate.inputs.length > 2) {
            parms.push(list);
        };
    };  return this.evaluate(predicate, new List(parms));
};

Process.prototype.reportFindFirstFixed = function (option, predicate, list) {
    // Find - answer the first item of the list for which
    // the predicate evaluates TRUE.
    // Distinguish between linked and arrayed lists.
    // if the predicate uses formal parameters instead of implicit empty slots
    // there are two additional optional parameters:
    // #1 - element
    // #2 - optional | index
    // #3 - optional | source list
    var next, index, parms;
    if (list.isLinked) {
        if (this.context.accumulator === null) {
            this.assertType(list, 'list');
            this.context.accumulator = {
                source : list,
                idx : 1,
                remaining : list.length()
            };
        } else if (this.context.inputs.length > 2) {
            if (this.context.inputs.pop() === true) {
                this.returnValueToParentContext(
                    (Process.prototype.inputOption(option) === 'index'
                    ) ? this.context.accumulator.idx : this.context.accumulator.source.at(1)
                );  return;
            };  this.context.accumulator.remaining -= 1;
            this.context.accumulator.idx += 1;
            this.context.accumulator.source =
                this.context.accumulator.source.cdr();
        };  if (this.context.accumulator.remaining === 0) {
            this.returnValueToParentContext((Process.prototype.inputOption(
            option) === 'index') ? 0 : '');          return;
        };  index = this.context.accumulator.idx;
        next = this.context.accumulator.source.at(1);
    } else { // arrayed
        if (this.context.accumulator === null) {
            this.assertType(list, 'list');
            this.context.accumulator = {
                idx : 0,
                current : null
            };
        } else if (this.context.inputs.length > 2) {
            if (this.context.inputs.pop() === true) {
                this.returnValueToParentContext(
                    (Process.prototype.inputOption(option) === 'index'
                    ) ? this.context.accumulator.idx : this.context.accumulator.current
                );  return;
            };
        };  if (this.context.accumulator.idx === list.length()) {
            this.returnValueToParentContext((
            Process.prototype.inputOption(option
            ) === 'index') ? 0 : '');  return;
        };  this.context.accumulator.idx += 1;
        index = this.context.accumulator.idx;
        next = list.at(index);
        this.context.accumulator.current = next;
    };  this.pushContext();       parms = [next];
    if (predicate.constructor.name === 'Function') {
        if (predicate.length > 1) {
            parms.push(index);
        };  if (predicate.length > 2) {
            parms.push(list);
        };
    };  if (predicate instanceof Context) {
        // can also be a list of rings
        if (predicate.inputs.length > 1) {
            parms.push(index);
        };  if (predicate.inputs.length > 2) {
            parms.push(list);
        };
    };  return this.evaluate(predicate, new List(parms));
};

Process.prototype.reportCombine = function (list, reporter) {
    // Fold - answer an aggregation of all list items from "left to right"
    // Distinguish between linked and arrayed lists.
    // if the reporter uses formal parameters instead of implicit empty slots
    // there are two additional optional parameters:
    // #1 - accumulator
    // #2 - element
    // #3 - optional | index
    // #4 - optional | source list
    var next, current, index, parms;
    this.assertType(list, 'list');
    if (list.isLinked) {
        if (this.context.accumulator === null) {
            // check for special cases to speed up
            if (reporter instanceof Context &&
                    this.canRunOptimizedForCombine(reporter)) {
                return this.reportListAggregation(
                    list,
                    reporter.expression.selector
                );
            };  // test for base cases
            if (list.length() < 2) {
                this.returnValueToParentContext(
                    list.length() ?
                        list.at(1)
                        : (reporter.expression.selector === 'reportJoinWords' ?
                            ''
                            : 0)
                );  return;
            };  // initialize the accumulator
            this.context.accumulator = {
                source : list.cdr(),
                idx : 1,
                target : list.at(1),
                remaining : list.length() - 1
            };
        } else if (this.context.inputs.length > 2) {
            this.context.accumulator.target = this.context.inputs.pop();
            this.context.accumulator.remaining -= 1;
            this.context.accumulator.idx += 1;
            this.context.accumulator.source =
                this.context.accumulator.source.cdr();
        };  if (this.context.accumulator.remaining === 0) {
            this.returnValueToParentContext(this.context.accumulator.target);
            return;
        };  next = this.context.accumulator.source.at(1);
    } else { // arrayed
        if (this.context.accumulator === null) {
            // check for special cases to speed up
            if (reporter instanceof Context &&
                    this.canRunOptimizedForCombine(reporter)) {
                return this.reportListAggregation(
                    list,
                    reporter.expression.selector
                );
            };  // test for base cases
            if (list.length() < 2) {
                this.returnValueToParentContext(
                    list.length() ?
                        list.at(1)
                        : (reporter.expression.selector === 'reportJoinWords' ?
                            ''
                            : 0)
                );
                return;
            };  // initialize the accumulator
            this.context.accumulator = {
                idx : 1,
                target : list.at(1)
            };
        } else if (this.context.inputs.length > 2) {
            this.context.accumulator.target = this.context.inputs.pop();
        };  if (this.context.accumulator.idx === list.length()) {
            this.returnValueToParentContext(this.context.accumulator.target);
            return;
        };  this.context.accumulator.idx += 1;
        next = list.at(this.context.accumulator.idx);
    };  index = this.context.accumulator.idx;
    current = this.context.accumulator.target;
    this.pushContext();
    parms = [current, next];
    if (reporter.constructor.name === 'Function') {
        if (reporter.length > 1) {
            parms.push(index);
        };  if (reporter.length > 2) {
            parms.push(list);
        };
    };  if (reporter instanceof Context) {
        // can also be a list of rings
        if (reporter.inputs.length > 1) {
            parms.push(index);
        };  if (reporter.inputs.length > 2) {
            parms.push(list);
        };
    };  this.evaluate(reporter, new List(parms));
};

Process.prototype.reportListAggregation = function (list, selector) {var len = list.length(), result, i, op = {reportVariadicSum: 'reportSum', reportVariadicProduct: 'reportProduct',
reportVariadicMax: 'reportMax', reportVariadicMin: 'reportMin'}[selector] || selector; if (len === 0) {switch (op) {case 'reportProduct': return 1; case 'reportMin': return Infinity;
case 'reportMax': return -Infinity; default: return 0;};}; result = list.at(1); if (len > 1) {for (i = 2; i <= len; i += 1) {result = this[op](result, list.at(i));};}; return result;};

Process.prototype.canRunOptimizedForCombine = function (aContext) {
    var op = aContext.expression,
        slots,
        eligible;
    if (op instanceof BlockMorph) {
    if (!op.selector) {return false;
    };} else {return false;};
    eligible = [
        'reportVariadicSum',
        'reportVariadicProduct',
        'reportVariadicMin',
        'reportVariadicMax'
    ];
    if (!contains(eligible, op)) {return false;};
    slots = aContext.expression.inputs()[0].inputs();
    if (slots.length !== 2) {
        return false;
    }; if (aContext.inputs.length === 0) {
        return slots.every(each => each.bindingID);
    }; if (aContext.inputs.length !== 2) {
        return false;
    }; return slots.every(each =>
        each.selector === 'reportGetVar' &&
            contains(aContext.inputs, each.blockSpec)
    );
};

Process.prototype.reportPipe = function (value, reporterList) {
    // Pipe - answer an aggregation of channeling an initial value
    // through a sequence of monadic functions
    var next, current;
    this.assertType(reporterList, 'list');
    if (this.context.accumulator === null) {
        // test for base cases
        if (reporterList.length() === 0) {
            this.returnValueToParentContext(value);
            return;
        }; // initialize the accumulator
        this.context.accumulator = {
            idx : 0,
            result : value
        };
    } else if (this.context.inputs.length > 2) {
        this.context.accumulator.result = this.context.inputs.pop();
    }; if (this.context.accumulator.idx === reporterList.length()) {
        this.returnValueToParentContext(this.context.accumulator.result);
        return;
    }; this.context.accumulator.idx += 1;
    next = reporterList.at(this.context.accumulator.idx);
    this.assertType(next, ['command', 'reporter', 'predicate']);
    current = this.context.accumulator.result; this.pushContext();
    this.evaluate(next, new List([current]));
};

Process.prototype.reportSequence = function (reporter, valueList) {if ((this.context.sequenceList
) instanceof List) {var sequence = this.context.sequenceList, initialValue = (this.context
).initialSequencePart; if ((initialValue instanceof Context) && (sequence.length() > 0)) {(this
).context.initialSequencePart = invoke(initialValue, ((sequence.at(1) instanceof List) ? (sequence
).at(1) : new List([sequence.at(1)]))); this.context.sequenceList.remove(1); this.pushContext('doYield'
); this.pushContext();} else {this.returnValueToParentContext(initialValue); delete ((this.context
).sequenceList); delete this.context.initialSequencePart;};} else {this.assertType(reporter, ['command',
'reporter', 'predicate']); this.assertType(valueList, 'list'); this.context.sequenceList = valueList;
this.context.initialSequencePart = reporter; this.pushContext('doYield'); this.pushContext();};};

// Process interpolated primitives

Process.prototype.doWait = function (secs) {if (!(this.context.startTime)) {this.context.startTime = Date.now();}; if ((Date.now() - this.context.startTime) >= (
secs * 1000)) {if (!(this.isAtomic) && (secs === 0)) {this.readyToYield = true;}; return null;}; this.pushContext('doYield'); this.pushContext();}; /* Wait. */

Process.prototype.doGlide = function (secs, endX, endY) {
    if (!this.context.startTime) {
        this.context.startTime = Date.now();
        this.context.startValue = new Point(
            this.blockReceiver().xPosition(),
            this.blockReceiver().yPosition()
        );
    };  if ((Date.now() - this.context.startTime) >= (secs * 1000)) {
        this.blockReceiver().gotoXY(endX, endY);
        return null;
    };  this.blockReceiver().glide(
        secs * 1000, endX, endY,
        Date.now() - this.context.startTime,
        this.context.startValue
    );  this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.doMove = function (secs, steps, optDir) {
    if (!this.context.startTime) {
        var direction = ((optDir.length() > 0) ? optDir.asArray()[0] : this.blockReceiver().heading);
        if (direction instanceof Array) {if (direction[0] === 'random'
        ) {direction = this.reportBasicRandom(0, 360000) / 1000;};};
        this.context.endX = (this.blockReceiver().xPosition() + (steps * Process.prototype.reportMonadic(['sin'], direction)));
        this.context.endY = (this.blockReceiver().yPosition() + (steps * Process.prototype.reportMonadic(['cos'], direction)));
        this.context.startTime = Date.now();
        this.context.startValue = new Point(this.blockReceiver().xPosition(), this.blockReceiver().yPosition());
    };  if ((Date.now() - this.context.startTime
        ) >= (secs * 1000)) {
        this.blockReceiver().gotoXY(
        this.context.endX,
        this.context.endY);
        delete this.context.endX;
        delete this.context.endY;
        return null;
    };  this.blockReceiver().glide(
        secs * 1000,
        this.context.endX,
        this.context.endY,
        Date.now() - this.context.startTime,
        this.context.startValue
    );  this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.doShake = function (secs, force, decay) {
    if (!this.context.startTime) {
        this.context.startX = this.blockReceiver().xPosition();
        this.context.startY = this.blockReceiver().yPosition();
        this.context.startTime = Date.now();
    };
    if ((Date.now() - this.context.startTime) >= (secs * 1000)) {
        this.blockReceiver().gotoXY(this.context.startX, this.context.startY);
        delete this.context.startX;
        delete this.context.startY;
        return null;
    };
    if (!(decay.isEmpty())) {if (!(decay.at(1) === '')) {if (asABool(decay.at(
    1))) {force = (force * (1 - ((Date.now() - this.context.startTime) / (
    secs * 1000))));} else {force = (force * ((Date.now() - this.context.startTime
    ) / (secs * 1000)));};};}; newX = (this.context.startX + (((Math.random(
    ) - 0.5) * 2) * force)), newY = (this.context.startY + (((Math.random(
    ) - 0.5) * 2) * force)); this.blockReceiver().gotoXY(newX, newY);

    this.context.inputs.pop();
    this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.doUpdatePosition = function (a, b, c) {
var obj = this.blockReceiver(); if (obj instanceof SpriteMorph) {
if (this.inputOption(a) === 'change') {if (this.inputOption(b
) === 'x') {obj.changeXPosition(c);} else if (this.inputOption(b
) === 'y') {obj.changeYPosition(c);};} else {if (this.inputOption(b
) === 'x') {obj.setXPosition(c);} else if (this.inputOption(b
) === 'y') {obj.setYPosition(c);};};};};

Process.prototype.customizableBubble = function (option, data, secs) {
option = this.inputOption(option);
if (secs.length() > 0) {
    secs = secs.at(1);
    if (!this.context.startTime) {
        this.context.startTime = Date.now();
        this.blockReceiver().bubble(data, (option === 'think'), false, (option === 'shout'), (option === 'whisper'));
    };  if ((Date.now() - this.context.startTime) >= (secs * 1000)) {
        this.blockReceiver().stopTalking();
        return null;
    };  this.pushContext('doYield');
    this.pushContext();
} else {
    this.blockReceiver().bubble(data, (option === 'think'), false, (option === 'shout'), (option === 'whisper'));
};};

Process.prototype.doSayFor = function (data, secs) {
    if (!this.context.startTime) {
        this.context.startTime = Date.now();
        this.blockReceiver().bubble(data);
    }; if ((Date.now() - this.context.startTime) >= (secs * 1000)) {
        this.blockReceiver().stopTalking();
        return null;
    }; this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.doThinkFor = function (data, secs) {
    if (!this.context.startTime) {
        this.context.startTime = Date.now();
        this.blockReceiver().doThink(data);
    }; if ((Date.now() - this.context.startTime) >= (secs * 1000)) {
        this.blockReceiver().stopTalking();
        return null;
    };  this.pushContext('doYield');
    this.pushContext();};

Process.prototype.blockReceiver = function () {return (
this.context ? ((this.context.receiver || (this.homeContext
).receiver)) : (this.homeContext.receiver || this.receiver));};

// Process sound primitives (interpolated)

Process.prototype.playSound = function (name) {
if (this.context.activeAudio) {
this.context.activeAudio.pause();
this.context.activeAudio = null;};
    if (name instanceof List) {
        return this.doPlaySoundAtRate(name, 44100);
    };  return this.blockReceiver().doPlaySound(name);
};

Process.prototype.doPlaySoundUntilDone = function (name) {
var stage = world.childThatIsA(StageMorph);
if (this.readyToTerminate) {
if (this.context.activeAudio) {
if ((typeof this.context.activeAudio.stop) === 'function'
) {this.context.activeAudio.stop();} else if ((
typeof this.context.activeAudio.pause) === 'function'
) {this.context.activeAudio.pause();}; if (
this.context.activeAudio && this.context.activeAudio.remove
) {this.context.activeAudio.remove();};
stage.activeSounds.splice(stage.activeSounds.indexOf(
this.context.activeAudio), 1); this.context.activeAudio = null;
};} else {
    if (this.context.activeAudio === null) {
        this.context.activeAudio = this.playSound(name);
    }; if (!(this.context.activeAudio === null)) {
    if (name === null || this.context.activeAudio.ended
            || this.context.activeAudio.terminated) {
        if ((typeof this.context.activeAudio.stop) === 'function'
        ) {this.context.activeAudio.stop();} else if ((
        typeof this.context.activeAudio.pause) === 'function'
        ) {this.context.activeAudio.pause();};
        if (this.context.activeAudio && this.context.activeAudio.remove) {
            stage.activeSounds.splice(stage.activeSounds.indexOf(
            this.context.activeAudio), 1);
            this.context.activeAudio.remove();
            this.context.activeAudio = null;
        };  return null;
    };  this.pushContext('doYield');
    this.pushContext();
};};};

Process.prototype.doStopAllSounds = function () {
    var stage = this.homeContext.receiver.parentThatIsA(StageMorph);
    if (stage) {
        stage.threads.processes.forEach(thread => {
            if (thread.context) {
                thread.context.stopMusic();
                if (thread.context.activeAudio) {
                    thread.popContext();
                };
            };
        }); stage.stopAllActiveSounds();
    };
};

Process.prototype.doPlaySoundAtRate = function (name, rate) {
    var sound, samples, ctx, gain, pan, source, rcvr;

    if (!(name instanceof List)) {
        sound = name instanceof Sound ? name
            : (typeof name === 'number' ? this.blockReceiver().sounds.at(name)
                : detect(
                    this.blockReceiver().sounds.asArray(),
                    s => s.name === name.toString()
            )
        );
        if (!sound.audioBuffer) {
            this.decodeSound(sound);
            return;
        };  samples = this.reportGetSoundAttribute('samples', sound);
    } else {
        samples = name;
    };  rcvr = this.blockReceiver(
    );  ctx = rcvr.audioContext();
    gain = rcvr.getGainNode();
    pan = rcvr.getPannerNode();
    source = this.encodeSound(samples, rate);
    rcvr.setVolume(rcvr.volume);
    source.connect(gain);
    if (pan) {
        gain.connect(pan);
        pan.connect(ctx.destination);
        rcvr.setPan(rcvr.pan);
    } else {
        gain.connect(ctx.destination);
    }; source.pause = source.stop;
    source.ended = false;
    source.onended = function anonymous () {
    var stage = world.childThatIsA(StageMorph);
    stage.activeSounds.splice(stage.activeSounds.indexOf(
    source), 1); source.ended = true;};
    source.start();
    rcvr.parentThatIsA(StageMorph).activeSounds.push(source);
    return source;
};

Process.prototype.reportGetSoundAttribute = function (choice, soundName) {
    var sound = soundName instanceof Sound ? soundName
            : (typeof soundName === 'number' ?
                    this.blockReceiver().sounds.at(soundName)
                : (soundName instanceof List ? this.encodeSound(soundName)
                    : detect(
                        this.blockReceiver().sounds.asArray(),
                        s => s.name === soundName.toString()
                    )
                )
            ),
        option = this.inputOption(choice);

    if (option === 'name') {
        return sound.name;
    };  if (!sound.audioBuffer) {
        this.decodeSound(sound);
        return;
    };

    switch (option) {
    case 'samples':
        if (!sound.cachedSamples) {
            sound.cachedSamples = (function (sound, untype) {
                var buf = sound.audioBuffer,
                    result, i;
                if (buf.numberOfChannels > 1) {
                    result = new List;
                    for (i = 0; i < buf.numberOfChannels; i += 1) {
                        result.add(new List(untype(buf.getChannelData(i))));
                    };  return result;
                };  return new List(untype(buf.getChannelData(0)));
            })(sound, this.untype);
        }; return sound.cachedSamples;
    case 'sample rate':
        return sound.audioBuffer.sampleRate;
    case 'duration':
        return sound.audioBuffer.duration;
    case 'length':
        return sound.audioBuffer.length;
    case 'number of channels':
        return sound.audioBuffer.numberOfChannels;
    default:
        return 0;
    };
};

Process.prototype.decodeSound = function (sound, callback) {
    // private - callback is optional and invoked with sound as argument
    var base64, binaryString, len, bytes, i, arrayBuffer, audioCtx;

    if (sound.audioBuffer) {
        return (callback || nop)(sound);
    };  if (!sound.isDecoding) {
        base64 = sound.audio.src.split(',')[1];
        binaryString = window.atob(base64);
        len = binaryString.length;
        bytes = new Uint8Array(len);
        for (i = 0; i < len; i += 1)        {
            bytes[i] = binaryString.charCodeAt(i);
        };  arrayBuffer = bytes.buffer;
        audioCtx = Note.prototype.getAudioContext();
        sound.isDecoding = true;
        audioCtx.decodeAudioData(
            arrayBuffer,
            buffer => {
                sound.audioBuffer = buffer;
                sound.isDecoding = false;
            },
            err => {
                sound.isDecoding = false;
                this.handleError(err);
            }
        );
    };  this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.encodeSound = function (samples, rate) {
    // private
    var rcvr = this.blockReceiver(),
        ctx = rcvr.audioContext(),
        channels = (samples.at(1) instanceof List) ? samples.length() : 1,
        frameCount = (channels === 1) ?
            samples.length()
            : samples.at(1).length(),
        arrayBuffer = ctx.createBuffer(channels, frameCount, +rate || 44100),
        i,
        source;

    if (!arrayBuffer.copyToChannel) {
        arrayBuffer.copyToChannel = function (src, channel) {
            var buffer = this.getChannelData(channel);
            for (i = 0; i < src.length; i += 1) {
                buffer[i] = src[i];
            }
        };
    }
    if (channels === 1) {
        arrayBuffer.copyToChannel(
            Float32Array.from(samples.itemsArray()),
            0,
            0
        );
    } else {
        for (i = 0; i < channels; i += 1) {
            arrayBuffer.copyToChannel(
                Float32Array.from(samples.at(i + 1).itemsArray()),
                i,
                0
            );
        };
    };  source = ctx.createBufferSource();
    source.buffer = arrayBuffer;
    source.audioBuffer = source.buffer;
    return source;
};

// Process first-class sound creation from samples, interpolated

Process.prototype.reportNewSoundFromSamples = function (samples, rate) {
// this method inspired by: https://github.com/Jam3/audiobuffer-to-wav
// https://www.russellgood.com/how-to-convert-audiobuffer-to-audio-file

    var audio, blob, reader, myself = this;
    if (isNil(this.context.accumulator)) {
        this.assertType(samples, 'list'); // check only the first time
        this.context.accumulator = {
            audio: null
        };  audio = new Audio;
        blob = new Blob(
            [
                this.audioBufferToWav(
                    this.encodeSound(samples, rate).audioBuffer
                )
            ],
            {type: "audio/wav"}
        );
        reader = new FileReader;
        reader.onload = () => {
            audio.src = reader.result;
            myself.context.accumulator.audio = audio;
        };  reader.readAsDataURL(blob);
    };  if (this.context.accumulator.audio) {
        return new Sound(
            this.context.accumulator.audio,
            this.blockReceiver().newSoundName(localize('sound'))
        );
    };  this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.audioBufferToWav = function (buffer, opt) {
    var numChannels = buffer.numberOfChannels,
        sampleRate = buffer.sampleRate,
        format = (opt || {}).float32 ? 3 : 1,
        bitDepth = format === 3 ? 32 : 16,
        result;

    function interleave(inputL, inputR) {
        var length = inputL.length + inputR.length,
            result = new Float32Array(length),
            index = 0,
            inputIndex = 0;

        while (index < length) {
            result[index++] = inputL[inputIndex];
            result[index++] = inputR[inputIndex];
            inputIndex += 1;
        };  return result;
    };  if (numChannels === 2) {
        result = interleave(
            buffer.getChannelData(0),
            buffer.getChannelData(1)
        );
    } else {
        result = buffer.getChannelData(0);
    };  return this.encodeWAV(result, format, sampleRate, numChannels, bitDepth);
};

Process.prototype.encodeWAV = function (
    samples,
    format,
    sampleRate,
    numChannels,
    bitDepth
) {
    var bytesPerSample = bitDepth / 8,
        blockAlign = numChannels * bytesPerSample,
        buffer = new ArrayBuffer(44 + samples.length * bytesPerSample),
        view = new DataView(buffer);

    function writeFloat32(output, offset, input) {
        for (var i = 0; i < input.length; i += 1, offset += 4) {
            output.setFloat32(offset, input[i], true);
        }
    }

    function floatTo16BitPCM(output, offset, input) {
        var i, s;
        for (i = 0; i < input.length; i += 1, offset += 2) {
            s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    function writeString(view, offset, string) {
        for (var i = 0; i < string.length; i += 1) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    writeString(view, 0, 'RIFF'); // RIFF identifier
    // RIFF chunk length:
    view.setUint32(4, 36 + samples.length * bytesPerSample, true);
    writeString(view, 8, 'WAVE'); // RIFF type
    writeString(view, 12, 'fmt '); // format chunk identifier
    view.setUint32(16, 16, true); // format chunk length
    view.setUint16(20, format, true); // sample format (raw)
    view.setUint16(22, numChannels, true); // channel count
    view.setUint32(24, sampleRate, true); // sample rate
    // byte rate (sample rate * block align):
    view.setUint32(28, sampleRate * blockAlign, true);
    // block align (channel count * bytes per sample):
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true); // bits per sample
    writeString(view, 36, 'data'); // data chunk identifier
    // data chunk length:
    view.setUint32(40, samples.length * bytesPerSample, true);
    if (format === 1) { // Raw PCM
        floatTo16BitPCM(view, 44, samples);
    } else {
        writeFloat32(view, 44, samples);
    };  return buffer;
};

// Process audio input (interpolated)

Process.prototype.reportAudio = function (choice) {
    var stage = this.blockReceiver().parentThatIsA(StageMorph),
        selection = this.inputOption(choice);
    if (selection === 'resolution') {
        return stage.microphone.binSize();
    }
    if (selection === 'modifier') {
        return stage.microphone.modifier;
    }
    if (stage.microphone.isOn()) {
        switch (selection) {
        case 'volume':
            return stage.microphone.volume * 100;
        case 'frequency':
            return stage.microphone.pitch;
        case 'note':
            return stage.microphone.note;
        case 'samples':
            return new List(this.untype(stage.microphone.signals));
        case 'sample rate':
            return stage.microphone.audioContext.sampleRate;
        case 'output':
            return new List(this.untype(stage.microphone.output));
        case 'spectrum':
            return new List(this.untype(stage.microphone.frequencies));
        default:
            return null;
        }
    }
    this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.untype = function (typedArray) {
    var len = typedArray.length,
        arr = new Array(len),
        i;
    for (i = 0; i < len; i += 1) {
        arr[i] = typedArray[i];
    }
    return arr;
};

Process.prototype.setMicrophoneModifier = function (modifier) {
    var stage = this.blockReceiver().parentThatIsA(StageMorph),
        invalid = [
            'sprite',
            'stage',
            'list',
            'costume',
            'sound',
            'number',
            'text',
            'Boolean'
        ];
    if (!modifier || contains(invalid, this.reportTypeOf(modifier))) {
        stage.microphone.modifier = null;
        stage.microphone.stop();
        return;
    }
    stage.microphone.modifier = modifier;
    stage.microphone.compiledModifier = this.reportCompiled(modifier, 1);
    stage.microphone.compilerProcess = this;
};

// Process user prompting primitives (interpolated)

Process.prototype.doAsk = function (data) {var stage = this.homeContext.receiver.parentThatIsA(StageMorph), rcvr = this.blockReceiver(), isStage = rcvr instanceof StageMorph, isHiddenSprite = rcvr instanceof
SpriteMorph && !rcvr.isVisible, activePrompter; stage.keysPressed = {}; if (this.readyToTerminate) {return;}; if (!this.prompter) {activePrompter = detect(stage.children, morph => (
morph instanceof StagePrompterMorph));
        if (!activePrompter) {
            if (!isStage && !isHiddenSprite) {
                rcvr.bubble(data, false, true);
            };
            this.prompter = new StagePrompterMorph(
                isStage || isHiddenSprite ? data : null
            );
            if (stage.scale < 1) {
                this.prompter.setWidth(stage.width() - 10);
            } else {
                this.prompter.setWidth(stage.dimensions.x - 20);
            };
            this.prompter.fixLayout();
            this.prompter.setCenter(stage.center());
            this.prompter.setBottom(stage.bottom() - this.prompter.border);
            stage.add(this.prompter);
            this.prompter.inputField.edit();
            stage.changed();
        };
    } else {
        if (this.prompter.isDone) {
            stage.lastAnswer = this.prompter.inputField.getValue();
            this.prompter.destroy();
            this.prompter = null;
            if (!isStage) {rcvr.stopTalking();};
            return null;
        };
    };
    this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.reportLastAnswer = function () {return this.homeContext.receiver.parentThatIsA(StageMorph).lastAnswer;};

// Process URI retrieval (interpolated)

Process.prototype.doURL = function anonymous (url) {window.open(url);};
Process.prototype.reportURL = function (url) {
    var response;
    // this.checkURLAllowed(url);
    if (!this.httpRequest) {
        // use the location protocol unless the user specifies otherwise
        if (!isURL(url)) {if (contains(['https://', 'http://'], location.protocol)) {url = (location.protocol + url);} else {url = ('https://' + url);};};
        this.httpRequest = new XMLHttpRequest();
        this.httpRequest.open("GET", url, true);
        // cache-control, commented out for now
        // added for Snap4Arduino but has issues with local robot servers
        // this.httpRequest.setRequestHeader('Cache-Control', 'max-age=0');
        this.httpRequest.send(null);
        if (this.context.isCustomCommand) {
            // special case when ignoring the result, e.g. when
            // communicating with a robot to control its motors
            this.httpRequest = null;
            return null;
        }
    } else if (this.httpRequest.readyState === 4) {
        response = this.httpRequest.responseText;
        this.httpRequest = null;
        return response;
    }
    this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.checkURLAllowed = function (url) {
    if ([ 'users', 'logout', 'projects', 'collections' ].some(
        pathPart => {
            // Check out whether we're targeting one of the remote domains
            return Object.values(Cloud.prototype.knownDomains).filter(
                each => each.includes('snap')
            ).some(
                domain => url.match(
                    // Check only against the host -not the protocol, path or
                    // port- of the domain
                    new RegExp(`${(new URL(domain)).host}.*${pathPart}`, 'i'))
            );
        }
    )) {
        throw new Error('Request blocked');
    }
};

// Process event messages primitives

Process.prototype.doBroadcast = function (message, receivers) {
    var stage = this.homeContext.receiver.parentThatIsA(StageMorph),
        target = this.inputOption(receivers.at(1) || ['all']),
        thisObj,
        msg = this.inputOption(message),
        rcvrs,
        procs = [];
    if (!this.canBroadcast) {
        return [];
    };

    // determine the receivers
    thisObj = this.blockReceiver();
    if (target === 'all') {
        rcvrs = stage.children.concat(stage);
    } else if (target === 'myself') {
        rcvrs = [thisObj];
    } else if (isSnapObject(target)) {
        rcvrs = [target];
    } else if (isString(target)) {
        // assume the string to be the name of a sprite or the stage
        if (target === stage.name) {
            rcvrs = [stage];
        } else {
            rcvrs = [this.getOtherObject(target, thisObj, stage)];
        };
    } else if (target instanceof List) {
        // assume all elements to be sprites or sprite names
        rcvrs = target.itemsArray().map(each =>
            this.getOtherObject(each, thisObj, stage)
        );
    } else {
        return; // abort
    };

    // transmit the message
    if (msg !== '') {
        stage.lastMessage = message; // retained for backwards compatibility
        rcvrs.forEach(morph => {
            if (isSnapObject(morph)) {
                morph.allHatBlocksFor(msg).forEach(block => {
                    var varName, varFrame;
                    if (block.selector === 'receiveMessage') {
                        varName = block.inputs()[1].evaluate()[0];
                        if (varName) {
                            varFrame = new VariableFrame;
                            varFrame.addVar(varName, message);
                        }
                        procs.push(stage.threads.startProcess(
                            block,
                            morph,
                            stage.isThreadSafe,
                            // commented out for now to enable tail recursion:
                            // || // make "any msg" threadsafe
                            // block.inputs()[0].evaluate() instanceof Array,
                            null, // exportResult (bool)
                            null, // callback
                            null, // isClicked
                            null, // rightAway
                            null, // atomic
                            varFrame
                        ));
                    } else {
                        procs.push(stage.threads.startProcess(
                            block,
                            morph,
                            stage.isThreadSafe
                        ));
                    };
                });
            };
        });
        (stage.messageCallbacks[''] || []).forEach(callback =>
            callback(msg) // for "any" message, pass it along as argument
        );
        (stage.messageCallbacks[msg] || []).forEach(callback =>
            callback() // for a particular message
        );
    };
    return procs;
};

Process.prototype.doBroadcastAndWait = function (message, target) {
    if (!this.context.activeSends) {
        this.context.activeSends = this.doBroadcast(message, target);
        if (this.isRunning()) {
            this.context.activeSends.forEach(proc =>
                proc.runStep()
            );
        };
    };
    this.context.activeSends = this.context.activeSends.filter(proc =>
        proc.isRunning()
    );
    if (this.context.activeSends.length === 0) {
        return null;
    };
    this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.getLastMessage = function () {
    var stage;
    if (this.homeContext.receiver) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (stage) {
            return stage.getLastMessage();
        };
    }; return '';
};

// Process type inference

Process.prototype.assertAlive = function (thing) {if (thing && thing.isCorpse) {return; /* throw Error('cannot operate on a deleted sprite'); */;}};

Process.prototype.assertType = function (thing, typeString) {
    // make sure "thing" is a particular type or any of a number of types
    // and raise an error if not
    // use responsibly wrt performance implications
    var thingType = this.reportTypeOf(thing);
    if (thingType === typeString) {return true; }
    if (typeString instanceof Array) {
    if (contains(typeString, thingType)) {
    return true;};};
    throw new Error(
        localize('expecting a') + ' ' +
        (typeString instanceof Array ?
            typeString.reduce((a, b) => localize(a) + ' / ' + localize(b))
            : localize(typeString)) +
        ' ' +
        localize('but getting a') + ' ' +
        localize(thingType)
    );
};

Process.prototype.reportIsA = function (thing, typeString) {var choice = this.inputOption(typeString); switch (choice) {case 'agent': return isSnapObject(
thing); break; case 'script': return thing instanceof Context; break; default: return (this.reportTypeOf(thing) === choice); break};}; /* Improved now. */

Process.prototype.reportTypeOf = function (thing) {
    // answer a string denoting the argument's type
    var exp;
    if (isNil(thing)) {return 'nothing';};
    if ((thing === true) || (thing === false)) {
    return 'Boolean';}; if (thing instanceof List) {
    return 'list';}; if (parseFloat(thing) === +thing) {
    return 'number';}; if (isString(thing)) {return 'text';};
    if (thing instanceof SpriteMorph) {return 'sprite';};
    if (thing instanceof StageMorph) {return 'stage';};
    if (thing instanceof Costume) {return 'costume';};
    if (thing instanceof Sound) {return 'sound';};
    if (thing instanceof Color) {return 'color';};
    if (thing instanceof Context) {
    return thing.toBlock().dataType();};
    if ((typeof thing) === 'function'
    ) {return 'function';};
    return 'undefined';
};

// Process math primtives - hyper-dyadic

Process.prototype.hyperDyadic = function (baseOp, a, b) {
    // enable dyadic operations to be performed on lists and tables
    var len, i, result;
    if (this.enableHyperOps) {
        if (this.isMatrix(a)) {
            if (this.isMatrix(b)) {
                // zip both arguments ignoring out-of-bounds indices
                a = a.itemsArray();
                b = b.itemsArray();
                len = Math.min(a.length, b.length);
                result = new Array(len);
                for (i = 0; i < len; i += 1) {
                    result[i] = this.hyperDyadic(baseOp, a[i], b[i]);
                }
                return new List(result);
            }
            return a.map(each => this.hyperDyadic(baseOp, each, b));
        }
        if (this.isMatrix(b)) {
            return b.map(each => this.hyperDyadic(baseOp, a, each));
        }
        return this.hyperZip(baseOp, a, b);
    }
    return baseOp(a, b);
};

Process.prototype.hyperZip = function (baseOp, a, b) {
    // enable dyadic operations to be performed on lists and tables
    var len, i, result;
    if (a instanceof List) {
        if (b instanceof List) {
            // zip both arguments ignoring out-of-bounds indices
            a = a.itemsArray();
            b = b.itemsArray();
            len = Math.min(a.length, b.length);
            result = new Array(len);
            for (i = 0; i < len; i += 1) {
                result[i] = this.hyperZip(baseOp, a[i], b[i]);
            };  return new List(result);
        };
        return a.map(each => this.hyperZip(baseOp, each, b));
    };  if (b instanceof List) {
        return b.map(each => this.hyperZip(baseOp, a, each));
    };  return baseOp(a, b);};

Process.prototype.packCoordinates = function (list) {
    // convert all numerical 2-item sub-lists into a variable to they
    // can be handled as atomic by hyperDyadic(),
    // remember to let the baseOp unpack them.
    return this.isCoordinate(list) ? new Variable(list)
        : list.map(each => each instanceof List ? this.packCoordinates(each)
            : each);
};

Process.prototype.isMatrix = function anonymous (data) {return ((data instanceof List) ? (data.at(1) instanceof List) : false);};

// Process math primtives - arithmetic

Process.prototype.reportVariadicSum = function anonymous (numbers) {this.assertType(numbers, 'list'); return this.reportListAggregation(numbers, 'reportSum');};

Process.prototype.reportSum = function anonymous (a, b) {return this.hyperDyadic(this.reportComplexSum, a, b);};

Process.prototype.reportComplexSum = function anonymous (a, b) {a = asAComplexNum(a); b = asAComplexNum(b); var realResult = Process.prototype.reportBasicSum(a, b); realResult = (((Math.abs(+a) === Infinity) && (
Math.abs(+b) === Infinity)) ? (isNaN(realResult) ? Infinity : realResult) : realResult); var imaginaryResult = Process.prototype.reportBasicSum(a.i, b.i); imaginaryResult = (((Math.abs(a.i) === Infinity) && (
Math.abs(b.i) === Infinity)) ? (isNaN(imaginaryResult) ? Infinity : imaginaryResult) : imaginaryResult); return new ComplexNumber(realResult, imaginaryResult);};

Process.prototype.reportBasicSum = function anonymous (a, b) {return Process.prototype.fixSimpleNumber((+a) + (+b));};

Process.prototype.reportDifference = function anonymous (a, b) {return this.hyperDyadic(this.reportComplexDifference, a, b);};

Process.prototype.reportComplexDifference = function anonymous (a, b) {a = asAComplexNum(a); b = asAComplexNum(b); var realResult = Process.prototype.reportBasicDifference(a, b); realResult = (((Math.abs(+a
) === Infinity) && (Math.abs(+b) === Infinity)) ? (isNaN(realResult) ? 0 : realResult) : realResult); var imaginaryResult = Process.prototype.reportBasicDifference(a.i, b.i); imaginaryResult = (((Math.abs(a.i
) === Infinity) && (Math.abs(b.i) === Infinity)) ? (isNaN(imaginaryResult) ? 0 : imaginaryResult) : imaginaryResult); return new ComplexNumber(realResult, imaginaryResult);}; /* Infinity is now better!!! */

Process.prototype.reportBasicDifference = function anonymous (a, b) {return Process.prototype.fixSimpleNumber((+a) - (+b));};

Process.prototype.reportVariadicProduct = function anonymous (numbers) {this.assertType(numbers, 'list'); return this.reportListAggregation(numbers, 'reportProduct');};

Process.prototype.reportProduct = function anonymous (a, b) {return this.hyperDyadic(this.reportComplexProduct, a, b);};

Process.prototype.reportComplexProduct = function anonymous (a, b) {a = asAComplexNum(a); b = asAComplexNum(b); var realResult = Process.prototype.reportBasicProduct(a, b),
imaginaryResult = Process.prototype.fixSimpleNumber(Process.prototype.fixSimpleNumber((+a) * b.i) + Process.prototype.fixSimpleNumber(a.i * (+b))); if (((a.i > 0) && (b.i < 0)
) || ((a.i < 0) && (b.i > 0))) {realResult = Process.prototype.fixSimpleNumber(realResult + Process.prototype.fixSimpleNumber(a.i * (-(b.i))));} else if ((Math.sign(a.i
) === Math.sign(b.i)) && ((Math.sign(a.i) !== 0) && (Math.sign(b.i) !== 0))) {realResult = Process.prototype.fixSimpleNumber(realResult - Process.prototype.fixSimpleNumber(
a.i * b.i));}; return new ComplexNumber(realResult, imaginaryResult);}; /* Complex numbers are really in this Snap! mod. :) */

Process.prototype.reportBasicProduct = function anonymous (a, b) {return (Process.prototype.fixSimpleNumber(Math.abs(+a) * Math.abs(+b)) * Math.sign((+a) * (+b)));};

Process.prototype.reportQuotient = function anonymous (a, b) {return this.hyperDyadic(this.reportComplexQuotient, a, b);};

Process.prototype.reportComplexQuotient = function anonymous (a, b) {a = asAComplexNum(a); b = asAComplexNum(b); if ((+(a.i) === 0) && (+(b.i) === 0)) {return Process.prototype.reportBasicQuotient(+a,
+b);} else if ((Math.abs(+a) == 0) && (Math.abs(+(a.i)) > 0) && (Math.abs(+b) == 0) && (Math.abs(+(b.i)) == 0)) {return ComplexNumber(0, [-Infinity, 0, Infinity][Math.sign((+a) + (a.i)) + 1]);} else if (
(Math.abs(+b) + Math.abs(b.i)) == 0) {return [-Infinity, 0, Infinity][Math.sign((+a) + (a.i)) + 1];} else {var numerator = Process.prototype.reportComplexProduct(a, Process.prototype.reportMonadic(['conjugate'
], b)), denominator = Process.prototype.reportComplexSum(Process.prototype.reportComplexProduct(+b, +b), Process.prototype.reportComplexProduct(+(b.i), +(b.i)));}; return new ComplexNumber(
Process.prototype.reportBasicQuotient(+numerator, denominator), Process.prototype.reportBasicQuotient(+(numerator.i), denominator));}; /* Now we can divide complex numbers!!! :D */

Process.prototype.reportBasicQuotient = function anonymous (a, b) {return (+b === 0) ? ((+a === 0) ? 0 : (Infinity * +a)) : ((Process.prototype.reportMonadic(['periodic?'
], +b) || Process.prototype.reportMonadic(['constant?'], +a) || Process.prototype.reportMonadic(['constant?'], +b)) ? (+a / +b) : (((Math.abs(a) === Infinity) && (Math.abs(
b) === Infinity)) ? (isNaN((+a) - (+b)) ? 1 : -1) : (Process.prototype.fixSimpleNumber(Math.abs(+a) / Math.abs(+b)) * Math.sign((+a) * (+b)))));}; /* The revamped operation. */

Process.prototype.reportModulus = function anonymous (a, b) {return this.hyperDyadic(this.reportComplexModulus, a, b);};

Process.prototype.reportComplexModulus = function anonymous (a, b) {/* -bmp- */ a = asAComplexNum(a); b = asAComplexNum(b);
return ComplexNumber(Process.prototype.reportBasicModulus(+a, +b), Process.prototype.reportBasicModulus(+(a.i), +(b.i)));};

Process.prototype.reportBasicModulus = function anonymous (a, b) {a = +a; b = +b; return ((b == 0
) ? 0 : (((a % b) == 0) ? 0 : Process.prototype.fixSimpleNumber((Math.sign(a) == Math.sign(b)) ? (
(Math.abs(a) % Math.abs(b)) * Math.sign(a)) : (Math.sign(b) * (Math.abs(b) - (Math.abs(a) % Math.abs(
b)))))));}; /* The modulus is now better with the fixed numbers and the correct number signs. :-) */

Process.prototype.reportPower = function anonymous (a, b) {return this.hyperDyadic(this.reportComplexPower, a, b);};

Process.prototype.reportComplexPower = function anonymous (a, b) {a = asAComplexNum(a); b = asAComplexNum(b); if (((
Math.abs(+a) + Math.abs(+(a.i))) > 0) && (Math.abs(+(b.i)) > 0)) {var poweredEuler = (num) => ((Math.abs(+(num.i)) > 0
) ? new ComplexNumber(Process.prototype.reportMonadic(['cos'], degrees(num.i)), Process.prototype.reportMonadic(['sin'
], degrees(num.i))) : Math.exp(+num)), c = Process.prototype.reportComplexProduct(b, Process.prototype.reportComplexLogarithm(
Math.E, a)); return Process.prototype.reportComplexProduct(poweredEuler(+c), poweredEuler(new ComplexNumber(0, +(c.i))));
} else if (b == 0) {return Process.prototype.reportBasicPower((Math.abs(+a) + Math.abs(a.i)), 0);} else if (Math.abs(a.i
) > 0) {if (Math.abs(+b) == 1) {return a;} else if (Math.trunc(Math.abs(+b)) == Math.abs(+b)) {var i = 1, result = a;
while (i < Math.round(Math.abs(b))) {if (!isFinite(result)) {if (+a == 0) {if (Math.abs(a.i) == 1) {return 1;
} else if (Math.abs(a.i) < 1) {return 0;} else {return Infinity;};} else {return Infinity;};};
result = Process.prototype.reportComplexProduct(result, a); i++;}; return ((b < 0
) ? Process.prototype.reportComplexQuotient(1, result) : result);} else {
var result = Process.prototype.reportComplexNumAttrs(a, ['polar']);
result = Process.prototype.reportComplexNumAttrs((new List([
Process.prototype.reportBasicPower(result.at(1), Math.abs(+b
)), Process.prototype.reportBasicModulus((((result.at(2) - 90
) * Math.abs(+b)) + 90), 360)])), ['complex']);}; return ((b < 0
) ? Process.prototype.reportComplexQuotient(1, result) : result);
} else {var result = ((+b < 0) ? Process.prototype.reportComplexQuotient(
1, Process.prototype.reportComplexPower(+a, -b)) : new ComplexNumber((((
+a < 0) && (+b < 1) && (Process.prototype.reportBasicModulus((1 / +b),
2) == 1)) ? 0 : Process.prototype.reportBasicPower(+a, b)), (((+a < 0
) && (+b < 1) && (Process.prototype.reportBasicModulus((1 / +b), 2
) == 1)) ? Process.prototype.reportBasicPower(-a, b) : 0))); return (
isNaN(result) ? 0 : (((+a < 0) && (+b < 0)) ? 0 : result));};};

Process.prototype.reportBasicPower = function anonymous (
a, b) {if (+a === Math.E) {return Math.exp(+b);};
var result = +a, i = 0; if ((+b > 0) && isFinite(+b
) && !isNaN(+b) && ((Math.abs(+b) % 1) === 0)) {if (
+b > 100000) {result = Process.prototype.fixSimpleNumber(
(+a) ** (+b));} else {while ((i + 1) < +b) {
result = Process.prototype.fixSimpleNumber((
+result) * (+a)); i++;};};} else {result = ((+b === 0) ? ((
Math.abs(+a) > 0) ? 1 : 0) : ((Math.abs(+a) == 1) ? 1 : ((
Math.abs(+a) == 0) ? 0 : ((+a) ** (+b))))); if (isNaN(
+result)) {return 0;};}; return (+a == 10) ? ((
Process.prototype.reportMonadic(['dec'], +b) > 0
) ? result : ((+b < 0) ? ('1e' + b) : +('1e+' + b))) : (((
result < 1) ? result : Process.prototype.fixSimpleNumber(
result)));}; /* This is very impressive. :~) */

Process.prototype.reportRadical = function anonymous (a, b, c) {result = ((c === 'as a list') ? this.reportComplexRadical(a, b) : this.hyperDyadic(this.reportComplexRadical, a, b)); if (c === 'as a list'
) {var variants = [result], i = 0, complexAttrs = Process.prototype.reportComplexNumAttrs(result, ['polar']); a = +a; if (isNaN(a)) {a = 0;}; if (a > 1) {while (i < (a - 1)) {variants.push(
Process.prototype.reportComplexNumAttrs(new List([result.at(1), (result.at(2) + (360 * ((i + 1) / a)))]), ['complex'])); i++;};}; return new List(variants);} else {return result;};};

Process.prototype.reportComplexRadical = function anonymous (a, b) {a = asAComplexNum(a); b = asAComplexNum(b); return (((Math.abs(+(a.i)) > 0) || ((Math.abs(+(b.i)) > 0)) ? Process.prototype.reportComplexPower(b,
Process.prototype.reportComplexQuotient(1, a)) : Process.prototype.reportBasicRadical(+a, +b)));}; /* The reciprocal exponentiation is here to take the place of the basic radication operation in Snavanced! :) */

Process.prototype.reportBasicRadical = function anonymous (a, b) {return ((+a === 2) ? ((+b < 0) ? new ComplexNumber(0, Process.prototype.fixSimpleNumber(Math.sqrt(-b))) : Process.prototype.fixSimpleNumber(
Math.sqrt(+b))) : ((+a === 3) ? ((+b < 0) ? -(Process.prototype.fixSimpleNumber(Math.cbrt(-b))) : Process.prototype.fixSimpleNumber(Math.cbrt(+b))) : Process.prototype.reportComplexPower(+b,
Process.prototype.reportBasicQuotient(1, +a))));}; /* Reports real or imaginary numbers. Just like Boyfriend practicing to upgrade his little digital voice. FNF' reference, anyone are not funking? :~) */

Process.prototype.reportLogarithm = function anonymous (a, b) {return this.hyperDyadic(this.reportComplexLogarithm, a, b);};

Process.prototype.reportComplexLogarithm = function anonymous (a, b) {a = asAComplexNum(a); b = asAComplexNum(b); var polar = Process.prototype.reportPolar(b); var result = (((+b < 0) || (Math.abs(
+(b.i)) > 0)) ? new ComplexNumber(Process.prototype.reportBasicLogarithm(Math.E, polar.at(1)), radians(polar.at(2))) : Process.prototype.reportBasicLogarithm(a, b)); return ((+a === Math.E
) ? result : Process.prototype.reportComplexQuotient(Process.prototype.reportComplexLogarithm(Math.E, b), Process.prototype.reportComplexLogarithm(Math.E, a)));}; /* Use it for good. :) */

Process.prototype.reportBasicLogarithm = function anonymous (a, b) {var result = 0; switch (+a) {case 2: result = Math.log2(+b); break; case Math.E: result = Math.log(+b); break; case 10: result = Math.log10(+b
); break; default: result = Process.prototype.reportBasicQuotient(Math.log(+b), Math.log(+a)); break;}; if (!contains([2, Math.E], +a)) {result = (isNaN(result) ? 0 : result); result = ((+a < 1) ? +result : (
Process.prototype.reportTextContains(b.toString(), '1e') ? +(b.toString().split('1e')[1]) : (Process.prototype.reportRound(result, new List([(b < Process.prototype.reportBasicPower(+a, -321)) ? 1 : ((
b < Process.prototype.reportBasicPower(+a, -320)) ? 2 : ((b < Process.prototype.reportBasicPower(+a, -317)) ? 5 : ((b < Process.prototype.reportBasicPower(+a, -316)) ? 6 : ((b < Process.prototype.reportBasicPower(
+a, -315)) ? 7 : ((b < Process.prototype.reportBasicPower(+a, -314)) ? 8 : ((b < Process.prototype.reportBasicPower(+a, -312)) ? 10 : ((b < Process.prototype.reportBasicPower(+a, -311)) ? 11 : (((
b < Process.prototype.reportBasicPower(+a, -225)) ? 12 : ((b < Process.prototype.reportBasicPower(+a, -22)) ? 13 : (((b < Process.prototype.reportBasicPower(+a, -1)) ? 14 : ((
b < Process.prototype.reportBasicPower(+a, 5)) ? 15 : ((b < Process.prototype.reportBasicPower(+a, 46)) ? 14 : 13))))))))))))))])))));}; if (!contains([2, Math.E, 10], +a)) {
result = Process.prototype.fixSimpleNumber(+result, 12);}; return ((+a === 0) ? Infinity : (isNaN(result) ? 0 : result
));}; /* Snavanced! is the only mod that have customizable logarithms. Try them, they are useful in everything! :) */

Process.prototype.reportAverage = function anonymous (option, numbers) {switch (this.inputOption(option)) {case 'median': numbers = new List(numbers.asArray().sort((a, b) => (asANum(a) - asANum(b))));
return ((this.reportBasicModulus(numbers.length(), 2) > 0) ? numbers.at(this.reportRound(this.reportBasicQuotient(numbers.length(), 2), new List)) : this.reportBasicQuotient(this.reportBasicSum(numbers.at(
this.reportBasicQuotient(numbers.length(), 2)), numbers.at(this.reportBasicSum(this.reportBasicQuotient(numbers.length(), 2), 1))), 2)); break; case 'arithmetic mean': return Process.prototype.reportQuotient(
Process.prototype.reportVariadicSum(numbers), numbers.length()); break; case 'geometric mean': return Process.prototype.reportRadical(numbers.length(), Process.prototype.reportVariadicProduct(numbers)); break;
case 'variance': var mean = Process.prototype.reportAverage(['arithmetic mean'], numbers); return Process.prototype.reportQuotient(Process.prototype.reportVariadicSum(numbers.map(x => (
Process.prototype.reportDifference(x, mean) ** 2))), numbers.length()); break; case 'harmonic mean': return Process.prototype.reportQuotient(numbers.length(),
Process.prototype.reportVariadicSum(numbers.map(num => (1 / num)))); break; default: return 0; break;};}; /* The means are beautiful operators. :-) */

Process.prototype.fixSimpleNumber = function anonymous (
number, optional) {var power = (10 ** (isNil(optional
) ? 15 : +optional)); var result = (((+number % 1) > 0
) ? (Math.round(Math.abs(+number) * power) / power
) : Math.abs(+number)); return ((Math.sign(+number
) < 0) ? -result : +result);};

Process.prototype.reportRandom = function anonymous (a, b, c) {
return ((c === 'without rounding') ? ((+a) + (Math.random() * (
+b - +a))) : this.hyperDyadic(this.reportBasicRandom, a, b));};

Process.prototype.reportBasicRandom = function (min, max) {var floor = Math.min(
+min, +max), ceil = Math.max(+min, +max); if (!((floor % 1) == 0) || !((ceil % 1
) == 0)) {return Math.random() * (ceil - floor) + floor;}; return Math.floor(
Math.random() * (ceil - floor + 1)) + floor;}; /* Aligned perfectly. :~) */

Process.prototype.reportIntegral = function anonymous (a, b, c, d) {a = asAComplexNum(a); b = asAComplexNum(b); c = asAComplexNum(c); d = asAComplexNum(d); return Process.prototype.reportComplexQuotient(
Process.prototype.reportComplexProduct(b, Process.prototype.reportComplexDifference(Process.prototype.reportComplexPower(a, Process.prototype.reportComplexSum(c, 1)), Process.prototype.reportComplexPower(
d, Process.prototype.reportComplexSum(c, 1)))), Process.prototype.reportComplexSum(c, 1));};

Process.prototype.reportCombsNPerms = function anonymous (a, b, c) {a = +asANum(a); c = +asANum(c); return Process.prototype.reportBasicQuotient(Process.prototype.reportMonadic(['gamma'],
Process.prototype.reportBasicSum(a, 1)), Process.prototype.reportBasicProduct(Process.prototype.reportMonadic(['gamma'], Process.prototype.reportBasicSum(Process.prototype.reportBasicDifference(
a, c), 1)), ((b === 'C') ? Process.prototype.reportMonadic(['gamma'], Process.prototype.reportBasicSum(c, 1)) : 1)));};

Process.prototype.reportAtan2 = function anonymous (a, b) {return this.hyperDyadic(this.reportComplexAtan2, a, b);};

Process.prototype.reportComplexAtan2 = function anonymous (a, b) {a = asAComplexNum(a); b = asAComplexNum(b); return (((Math.abs(a.i) > 0) || (Math.abs(b.i) > 0)) ? Process.prototype.reportComplexProduct(2,
Process.prototype.reportMonadic(['atan'], Process.prototype.reportComplexQuotient(a, Process.prototype.reportComplexSum(Process.prototype.reportComplexRadical(2, Process.prototype.reportComplexSum(
Process.prototype.reportComplexPower(b, 2), Process.prototype.reportComplexPower(a, 2))), b)))) : Process.prototype.reportBasicAtan2(+a, +b));}; Process.prototype.reportBasicAtan2 = function anonymous (
a, b) {return Process.prototype.reportBasicModulus(degrees(Math.atan2(+a, +b)), 360);}; /* The new complex arc tagent for only 2 inputs. This is so beautiful and cool! :~) */

Process.prototype.reportVariadicMin = function (numbers) {
    this.assertType(numbers, 'list');
    return this.reportListAggregation(numbers, 'reportMin');
};

Process.prototype.reportMin = function anonymous (a, b) {return this.hyperDyadic(this.reportBasicMin, a, b);};

Process.prototype.reportBasicMin = function (a, b) {
var x = +a, y = +b; if (isNaN(x) || isNaN(y)) {
x = a; y = b;}; return [y, x][asANum(x < y)];};

Process.prototype.reportVariadicMax = function (numbers) {
    this.assertType(numbers, 'list');
    return this.reportListAggregation(numbers, 'reportMax');
};

Process.prototype.reportMax = function anonymous (a, b) {return this.hyperDyadic(this.reportBasicMax, a, b);};

Process.prototype.reportBasicMax = function (a, b) {
var x = +a, y = +b; if (isNaN(x) || isNaN(y)) {
x = a; y = b;}; return [y, x][asANum(x > y)];};

Process.prototype.reportConstrainToClamp = ((value, min1, max1, min2, max2) => Process.prototype.reportComplexSum(Process.prototype.reportComplexProduct(
Process.prototype.reportComplexQuotient(Process.prototype.reportComplexDifference(value, min1), Process.prototype.reportComplexDifference(max1, min1)),
Process.prototype.reportComplexDifference(max2, min2)), min1)); Process.prototype.reportInterpolate = ((min, max, force) => Process.prototype.reportComplexSum(
min, Process.prototype.reportComplexProduct(Process.prototype.reportComplexDifference(max, min), force))); /* These primitives are base on "PenguinMod"-likes. :~) */

Process.prototype.reportAnEulerNumberPower = ((power, acurracy) => ((((+(asANum(acurracy))) + (+(asANum(power)))) / (+(asANum(acurracy)))) ** (+(asANum(acurracy)))));

// Process bases primitives

Process.prototype.reportNewNumeral = function anonymous (number, base) {if (Process.prototype.reportTypeOf(number) === 'number') {return ((+base == 10) ? +number : new Numeral(+number, +base));} else {throw Error(
'Your first input isn\'t a numeral!');};}; Process.prototype.reportNumeralBase = function anonymous (numeral) {if (isNil(numeral)) {return 10;}; return (isNil(numeral.base) ? 10 : numeral.base);};
Process.prototype.reportNumeralText = (numeral => ((numeral.base === undefined) ? numeral : numeral.alphabetic)); Process.prototype.decomposeAPolynomicallyNumeral = function anonymous (numeral, base) {if (
!contains(['text', 'number'], Process.prototype.reportTypeOf(numeral))) {throw Error('Your first input isn\'t a numeral!');}; if ((base < 2) || (base > 36)) {throw Error('You put an illegal base!');} else {
return Process.prototype.reportVariadicSum(new List(((Process.prototype.reportLetter(1, numeral.toString().toUpperCase()) === '-') ? Process.prototype.reportLetter(Process.prototype.reportNumbers(2,
numeral.toString().toUpperCase().length), numeral.toString().toUpperCase()) : numeral.toString().toUpperCase()).split('').reverse().map((value, index, list) => {var unicode = Process.prototype.reportUnicode(value
); if (!(unicode < 65)) {value = Math.round(unicode - 55);}; if (!(value < base)) {throw Error('You put an illegal digit!');}; return (value * (base ** index));})));};};
Process.prototype.reportNumberWithMoreDigits = function anonymous (number, digits) {var i = 0; decimal = Process.prototype.reportDecimalAsInteger(Math.abs(asANum(number)
)), sign = Math.sign(asANum(number)); try {if (this.reportTypeOf(number) === 'number') {number = Math.trunc(Math.abs(+number));}; number = number.toString(); var result = number;
while (i < (digits - number.length)) {result = ('0').concat(result); i++;}; return ((sign < 0) ? '-' : '').concat(((decimal > 0) ? result.concat('.', decimal) : result));
} catch (error) {number = ''; while (i < digits) {number = ('0').concat(number); i++;}; return number;};}; /* All block of the bases sub-category are only monadic. */
Process.prototype.reportDecimalAsInteger = function anonymous (n) {if (+(asANum(n)) === 0) {return 0;}; n = Process.prototype.reportMonadic(['dec'], asANum(
n)).toString(); return Process.prototype.reportJoinWords(Process.prototype.reportLetter(Process.prototype.reportNumbers(3, n.length), n));};

// Process logic primitives - hyper-dyadic / monadic where applicable

Process.prototype.reportLessThan = function (a, b) {return this.hyperDyadic(this.reportBasicLessThan, a, b);};

Process.prototype.reportLessThanOrEquals = function (a, b) {return this.hyperDyadic(((a, b) => !this.reportBasicGreaterThan(a, b)), a, b);};

Process.prototype.reportBasicLessThan = function (a, b) {var x = +a, y = +b; if (isNaN(x) || isNaN(y)) {x = a; y = b;}; return (x < y);};

Process.prototype.reportGreaterThan = function (a, b) {return this.hyperDyadic(this.reportBasicGreaterThan, a, b);};

Process.prototype.reportGreaterThanOrEquals = function (a, b) {return this.hyperDyadic(((a, b) => !this.reportBasicLessThan(a, b)), a, b);};

Process.prototype.reportBasicGreaterThan = function (a, b) {var x = +a, y = +b; if (isNaN(x) || isNaN(y)) {x = a; y = b;}; return (x > y);};

Process.prototype.reportVariadicEquals = function anonymous (inputs) {var backupInputs = inputs.fullCopy().asArray(
); i = 1; if (backupInputs.length > 1)  {result = backupInputs[0]; while (i < (backupInputs.length - 1)) {i++; if (
snapEquals(result, backupInputs[i - 1])) {result = backupInputs[i - 1];} else {return false;};}; return snapEquals(
result, backupInputs[backupInputs.length - 1]);} else {return false;};}; /* Variadic equals is so cool!!! :~) */

Process.prototype.reportVariadicNotEquals = function anonymous (inputs) {var backupInputs = inputs.fullCopy().asArray(
); i = 1; if (backupInputs.length > 1)  {result = backupInputs[0]; while (i < (backupInputs.length - 1)) {i++; if (
!snapEquals(result, backupInputs[i - 1])) {result = backupInputs[i - 1];} else {return false;};}; return !snapEquals(
result, backupInputs[backupInputs.length - 1]);} else {return false;};}; /* Its sibling is so cool too!!! :^A */

Process.prototype.reportVariadicIsIdentical = function anonymous (inputs) {var backupInputs = inputs.fullCopy().asArray(
); i = 1; if (backupInputs.length > 1)  {result = backupInputs[0]; while (i < (backupInputs.length - 1)) {i++; if (
Process.prototype.reportIsIdentical(result, backupInputs[i - 1])) {result = backupInputs[i - 1];} else {return false;};
}; return Process.prototype.reportIsIdentical(result, backupInputs[backupInputs.length - 1]);} else {return false;};};

Process.prototype.reportIsIdentical = function (a, b) {var tag = 'idTag'; if (isString(a) && isString(b)) {return a === b;} else if ((a instanceof Color) && (b instanceof Color)) {return a.eq(b, true);}; if (
this.isImmutable(a) || this.isImmutable(b)) {return snapEquals(a, b);}; function clear () {if (Object.prototype.hasOwnProperty.call(a, tag)) {delete a[tag];}; if (Object.prototype.hasOwnProperty.call(b, tag)) {
delete b[tag];}}; clear(); a[tag] = Date.now(); if (b[tag] === a[tag]) {clear(); return true;}; clear(); return false;}; /* Added the comparison of colors in the "snapEquals" function. Now is much better. :-) */

Process.prototype.isImmutable = function (obj) {var type = this.reportTypeOf(obj
); return contains(['nothing', 'Boolean', 'text', 'number', 'undefined'], type);};

Process.prototype.reportBoolean = (b => b);

Process.prototype.reportRound = function (n, optional) {var myself = this; if (n instanceof List) {return new List(n.asArray().map(input => myself.reportRound(input, optional)));} else {try {if (
n.i === undefined) {n = new ComplexNumber(n);};} catch (err1) {n = new ComplexNumber;}; return new ComplexNumber(myself.reportBasicRound(+n, optional), myself.reportBasicRound(+(n.i), optional));};};

Process.prototype.reportBasicRound = function (n, optional) {if (optional.asArray().length > 0) {if (optional.asArray()[0] > 0) {return Math.round(
+n * Math.pow(10, optional.asArray()[0])) / Math.pow(10, optional.asArray()[0]);} else {return Math.round(+n);};} else {return Math.round(+n);};};

// Process - hyper-monadic text primitive

Process.prototype.reportConstants = function (cname) {var ide = world.childThatIsA(IDE_Morph); if (ide instanceof IDE_Morph) {var keys = ide.mathConstants().map((con
) => con[0]), values = ide.mathConstants().map(con => con[1]);}; return (contains(keys, this.inputOption(cname)) ? values[keys.indexOf(this.inputOption(cname))] : 0);};

Process.prototype.reportMonadic = function anonymous (fname, n) {if (this.enableHyperOps) {if (n instanceof List) {return n.map(each => this.reportMonadic(fname, each));};}; function abs (num) {return (
+num < 0) ? -num : +num;}; function sign (num) {if (num === 0) {return 0;} else {return Process.prototype.reportBasicQuotient(num, abs(num));};}; function sin (x) {x = Process.prototype.reportBasicModulus(
x, 360); var y = Process.prototype.fixSimpleNumber(sign(180 - x)); x = radians(Process.prototype.fixSimpleNumber(abs(((((+x / 2) + 45) % 90) - 45) * 2))); /* Taking faster time. */ var answer = Math.sin(
Process.prototype.reportBasicProduct(Process.prototype.reportRound(x, new List([15])), y)); return (isNaN(answer) ? 0 : answer);}; function circ (x) {x = Process.prototype.reportBasicQuotient(+x, 90);
return Process.prototype.fixSimpleNumber(Math.sqrt(1 - ((Process.prototype.reportBasicModulus(+x, 2) - 1) ** 2))) * (-2 * ((Process.prototype.reportBasicModulus(+x, 4) > 2) - 0.5));}; function complexRadians (
degrees) {return Process.prototype.reportComplexProduct(degrees, Process.prototype.reportComplexQuotient(Math.PI, 180));}; function complexDegrees (radians) {return Process.prototype.reportComplexProduct(radians,
Process.prototype.reportComplexQuotient(180, Math.PI));}; switch (this.inputOption(fname)) {
    case 'abs':
        try {var complex = (new ComplexNumber(
        +n, ((n.i === undefined) ? 0 : +(n.i))));
        if ((abs(+complex) > 0) && (abs(+(complex.i
        )) > 0)) {return Process.prototype.reportBasicRadical(
        2, Process.prototype.reportBasicSum((abs(
        complex) ** 2), ((abs(complex.i)) ** 2
        )));} else {
        if ((abs(+complex) > 0)) {
        return abs(+complex);};
        if ((abs(+(complex.i)) > 0)) {
        return abs(+(complex.i));};
        }; return 0;
        } catch (error) {return 0;};
        break;
    case 'sign':
        return sign(+n);
        break;
    case 'ceiling':
        return Math.ceil(+n);
        break;
    case 'floor':
        return Math.floor(+n);
        break;
    case 'perfectRound':
        return (Math.round(
        Math.abs(+n)) * sign(
        +n)); break;
    case 'int':
        return Math.trunc(+n);
        break;
    case 'dec':
        return Process.prototype.reportBasicModulus(+n, sign(+n));
        break;
    case 'real':
        return +(asANum(n));
        break;
    case 'imag':
        return ((imaginaryPart) => isNil(imaginaryPart
               ) ? 0 : imaginaryPart)(asANum(n).i);
        break;
    case 'gamma':
        return ((Math.trunc(+n) == +n) ? Math.round(gammaFunction(+n)) : gammaFunction(+n));
        break;
    case 'fib':
        var poweredPhi = Process.prototype.reportComplexPower(Process.prototype.reportConstants(['φ Phi']), n); return Process.prototype.reportComplexQuotient(Process.prototype.reportComplexDifference(poweredPhi,
        Process.prototype.reportComplexProduct(Process.prototype.reportMonadic(['ccos'], Process.prototype.reportComplexProduct(180, n)), Process.prototype.reportComplexQuotient(1, poweredPhi))), Math.sqrt(5));
    case 'luc':
        var poweredPhi = Process.prototype.reportComplexPower(Process.prototype.reportConstants(['φ Phi']), n); return Process.prototype.reportComplexSum(poweredPhi,
        Process.prototype.reportComplexProduct(Process.prototype.reportMonadic(['ccos'], Process.prototype.reportComplexProduct(180, n)), Process.prototype.reportComplexQuotient(1, poweredPhi)));
        break;
    case 'nep':
        return Process.prototype.reportComplexProduct(23025851, Process.prototype.reportComplexDifference(7, Process.prototype.reportComplexLogarithm(10, n)));
        break;
    case 'circ':
        return circ(+n);
        break;
    case 'curve':
        return ((contains([0, 2], Math.round(Process.prototype.reportBasicModulus(+n, 360) / 180))) ? circ(+n) : sin(+n));
        break;
    case 'tri':
        return (((+n) * (+n + 1)) / 2);
        break;
    case 'tetra':
        return (((+n) * (+n + 1) * (+n + 2)) / 6);
        break;
    case 'conjugate':
        try {return new ComplexNumber(+n, ((n.i === undefined
        ) ? 0 : -(n.i)));} catch (error) {return 0;}; break;
    case 'prime?':
        n = abs(n);
        if ((+n < 1000) && ((+n % 1) === 0)) {
        var range = Process.prototype.reportBasicNumbers(2, (
        +n - 1)), i = 0; return ((+n === 2) || (range.filter(
        number => ((+n % number) === 0)).length === 0));
        } else {return false;}; break;
    case 'periodic?':
        n = abs(n);
        if ((+n < 1000) && ((+n % 1) === 0)) {
        var result = +n, lastDivisor = 1, steps = [result], divisors = [];
        while (result > 1) {if (((result % lastDivisor) === 0) && ((result === 1
        ) || (lastDivisor > 1))) {result = (result / lastDivisor); steps.push(
        result); divisors.push(lastDivisor); lastDivisor = 1;} else {
        lastDivisor++;};}; return contains(divisors.map(divisor => !(
        contains([2, 5], divisor))), true);} else {return false;};
        break;
    case 'constant?':
        var ide = world.childThatIsA(IDE_Morph); if (ide instanceof IDE_Morph) {
        return contains(ide.mathConstants().map(con => con[1]), +n);} else {return false;};
        break;
    case 'happy?':
        var test = abs(+n), count = 0;
        while (!(test === 1)) {
        count++;
        test = Process.prototype.reportVariadicSum(new List(Array.from(test.toString()).map(digit => ((+digit) ** (2)))));
        if (count > 100) {return false;};};
        return true;
        break;
    case 'sin':
        return Process.prototype.fixSimpleNumber(sin(+n));
        break;
    case 'cos':
        return Process.prototype.fixSimpleNumber(sin(+n + 90));
        break;
    case 'tan':
        return Process.prototype.reportBasicQuotient(sin(+n), sin(+n + 90));
        break;
    case 'csin':
        return Process.prototype.reportComplexQuotient(Process.prototype.reportComplexDifference(Process.prototype.reportComplexPower(
        Math.E, Process.prototype.reportComplexProduct(complexRadians(n), new ComplexNumber(0, 1))), Process.prototype.reportComplexPower(
        Math.E, Process.prototype.reportComplexProduct(complexRadians(n), new ComplexNumber(0, -1)))), new ComplexNumber(0, 2));
        break;
    case 'ccos':
        return Process.prototype.reportComplexQuotient(Process.prototype.reportComplexSum(
        Process.prototype.reportComplexPower(Math.E, Process.prototype.reportComplexProduct(
        complexRadians(n), new ComplexNumber(0, 1))), Process.prototype.reportComplexPower(
        Math.E, Process.prototype.reportComplexProduct(complexRadians(n), new ComplexNumber(
        0, -1)))), 2);
        break;
    case 'ctan':
        return Process.prototype.reportComplexQuotient(Process.prototype.reportMonadic(['csin'], n), Process.prototype.reportMonadic(['cos'], n));
        break;
    case 'sinh':
        return Process.prototype.reportComplexQuotient(Process.prototype.reportComplexDifference(Process.prototype.reportComplexPower(
        Math.E, n), Process.prototype.reportComplexPower(Math.E, Process.prototype.reportComplexDifference(0, n))), 2); break;
    case 'cosh':
        return Process.prototype.reportComplexQuotient(Process.prototype.reportComplexSum(Process.prototype.reportComplexPower(
        Math.E, n), Process.prototype.reportComplexPower(Math.E, Process.prototype.reportComplexDifference(0, n))), 2); break;
        break;
    case 'tanh':
        return Process.prototype.reportComplexQuotient(Process.prototype.reportComplexDifference(Process.prototype.reportComplexPower(
        Math.E, Process.prototype.reportComplexProduct(2, n)), 1), Process.prototype.reportComplexSum(Process.prototype.reportComplexPower(
        Math.E, Process.prototype.reportComplexProduct(2, n)), 1)); break;
        break;
    case 'asin':
        return complexDegrees(Process.prototype.reportComplexProduct(ComplexNumber(0, -1), Process.prototype.reportComplexLogarithm(Math.E, Process.prototype.reportComplexSum(
        Process.prototype.reportComplexRadical(2, Process.prototype.reportComplexDifference(1, Process.prototype.reportComplexPower(n, 2))), Process.prototype.reportComplexProduct(ComplexNumber(0, 1), n)))));
        break;
    case 'acos':
        return complexDegrees(Process.prototype.reportComplexProduct(ComplexNumber(0, -1), Process.prototype.reportComplexLogarithm(Math.E, Process.prototype.reportComplexSum(
        Process.prototype.reportComplexRadical(2, Process.prototype.reportComplexDifference(Process.prototype.reportComplexPower(n, 2), 1)), n))));
        break;
    case 'atan':
        return complexDegrees(Process.prototype.reportComplexProduct(ComplexNumber(0, -0.5), Process.prototype.reportComplexLogarithm(Math.E, Process.prototype.reportComplexQuotient(
        Process.prototype.reportComplexDifference(ComplexNumber(0, 1), n), Process.prototype.reportComplexSum(ComplexNumber(0, 1), n)))));
        break;
    case 'asinh':
        return Process.prototype.reportComplexLogarithm(Math.E, Process.prototype.reportComplexSum(n,
        Process.prototype.reportComplexRadical(2, Process.prototype.reportComplexSum(Process.prototype.reportComplexPower(n, 2), 1))));
        break;
    case 'acosh':
        return Process.prototype.reportComplexLogarithm(Math.E, Process.prototype.reportComplexSum(n,
        Process.prototype.reportComplexRadical(2, Process.prototype.reportComplexDifference(Process.prototype.reportComplexPower(n, 2), 1))));
        break;
    case 'atanh':
        return Process.prototype.reportComplexQuotient(Process.prototype.reportComplexLogarithm(Math.E, Process.prototype.reportComplexQuotient(
        Process.prototype.reportComplexSum(1, n), Process.prototype.reportComplexDifference(1, n))), 2);
        break;
    case 'radians':
        return complexRadians(n);
        break;
    case 'degrees':
        return complexDegrees(n);
        break;
    default:
        return ((n instanceof List) ? n.fullCopy() : n);
        break;
    };
};

Process.prototype.reportComplexNumAttrs = function anonymous (n, option) {
option = this.inputOption(option);
if (option === 'complex') {
        this.assertType(n, 'list');
        return new ComplexNumber(Process.prototype.reportBasicProduct(
        +(n.at(1)), Process.prototype.reportMonadic(['sin'], (180 - (n.at(2)
        )))), Process.prototype.reportBasicProduct(+(n.at(1)),
        Process.prototype.reportMonadic(['cos'], (n.at(2)))));
} else {
        this.assertType(n, ['number', 'text', 'Boolean'
        ]); try {var complex = (new ComplexNumber(+n, (
        (n.i === undefined) ? 0 : +(n.i))));} catch (error
        ) {return new List([0, 90]);}; result = new List([
        Process.prototype.reportMonadic(['abs'], n),
        Process.prototype.reportBasicModulus((
        Process.prototype.reportBasicAtan2(
        +complex, ((complex.i === undefined
        ) ? 0 : +(complex.i)))), 360)]);
        if (+(result.at(1)) === 0) {
        return new List([0, 90]);};
        return result;
};};

Process.prototype.reportPolar = function anonymous (n) {
        this.assertType(n, ['number', 'text', 'Boolean'
        ]); try {var complex = (new ComplexNumber(+n, (
        (n.i === undefined) ? 0 : +(n.i))));} catch (error
        ) {return new List([0, 90]);}; result = new List([
        Process.prototype.reportMonadic(['abs'], n),
        (Process.prototype.reportBasicAtan2(
        ((complex.i === undefined) ? 0 : +(
        complex.i)), +complex))]); if (+(
        result.at(1)) === 0) {
        return new List([0, 0]);};
        return result;
};

Process.prototype.reportTextFunction = function (fname, string) {var x = (isNil(string) ? '' : string).toString(), result = ''; switch (this.inputOption(fname)) {
    case 'encode URI':
        result = encodeURI(x);
        break;
    case 'decode URI':
        result = decodeURI(x);
        break;
    case 'encode URI component':
        result = encodeURIComponent(x);
        break;
    case 'decode URI component':
        result = decodeURIComponent(x);
        break;
    case 'XML escape':
        result = (new XML_Element).escape(x);
        break;
    case 'XML unescape':
        result = (new XML_Element).unescape(x);
        break;
    case 'JS escape':
        result = JSCompiler.prototype.escape(x);
        break;
    case 'hex sha512 hash':
        result = hex_sha512(x);
        break;
    };  return result;};

Process.prototype.reportJoin = function (a, b) {var x = (isNil(a) ? '' : a).toString(), y = (isNil(b) ? '' : b).toString(); return x.concat(y);};

Process.prototype.reportJoinWords = function (aList) {
    if (aList instanceof List) {
        if (this.isAST(aList)) {
            var blocks = this.assemble(aList);
            return ((blocks instanceof Context) ? ((blocks.expression instanceof CommandBlockMorph
            ) ? this.reportScript(new List(blocks.inputs), blocks.expression) : this.reify(
            blocks.expression, new List(blocks.inputs))) : blocks);
        }; return aList.asText();};
    return (aList || '').toString();};

Process.prototype.isAST = function (aList) {
    var first = aList.at(1);
    if (first instanceof Context) {
        return true;
    };  if (first instanceof List) {
        return first.at(1) instanceof Context;
    };  return false;
};

// Process string ops - hyper-monadic/dyadic

Process.prototype.reportLetter = function (idx, string) {
    return this.hyperDyadic(
        (ix, str) => this.reportBasicLetter(ix, str),
        idx,
        string
    );
};

Process.prototype.reportBasicLetter = function (idx, string) {
    var str, i;

    str = isNil(string) ? '' : string.toString();
    if (this.inputOption(idx) === 'any') {
        idx = this.reportBasicRandom(1, str.length);
    }; if (this.inputOption(idx) === 'last') {
        idx = str.length;
    }; i = +(idx || 0);
    return str[i - 1] || '';};

Process.prototype.reportTextAttribute = function (choice, text) {
    var option = this.inputOption(choice);
    switch (option) {
    case 'length':
        return this.reportStringSize(text);
    case 'upper case':
        return this.hyperDyadic(
            str => isString(str) ? str.toUpperCase() : str,
            text
        );
    case 'lower case':
        return this.hyperDyadic(
            str => isString(str) ? str.toLowerCase() : str,
            text); default: return 0;};};

Process.prototype.reportStringSize = function (data) {
    return this.hyperDyadic(
        str => isString(str) ? str.length
                : (parseFloat(str) === +str ? str.toString().length : 0),
        // proposed scheme by Michael to address text with emojis, has
        // memory issue when the stringd get very large:
        // str => isNil(data) ? 0 : Array.from(str.toString()).length,
        data);};

Process.prototype.reportTextContains = function (string1, string2) {if (
string2.length > 0) {return string1.includes(string2);} else {return false;};};

Process.prototype.reportUnicode = function (string) {
    /* special case to report a list of numbers for a
    string of characters, hence this is NOT using hyperDyadic() */
    var str, unicodeList;

    if (this.enableHyperOps) {
        if (string instanceof List) {
            return string.map(each => this.reportUnicode(each));
        };  str = isNil(string) ? '\u0000' : string.toString();
        unicodeList = str.split('');
        if (unicodeList.length > 1) {
            return this.reportUnicode(new List(unicodeList));
        };
    } else {
        str = isNil(string) ? '\u0000' : string.toString();
    };  if (str.codePointAt) {
        return str.codePointAt(0) || 0;
    };  return str.charCodeAt(0) || 0;
};

Process.prototype.reportUnicodeAsLetter = function (num) {
    return this.hyperDyadic(this.reportBasicUnicodeAsLetter, num);
};

Process.prototype.reportBasicUnicodeAsLetter = function (num) {
    var code = +(num || 0);
    if (String.fromCodePoint) {
    /* support for Unicode in newer browsers. */
        return String.fromCodePoint(code);
    }
    return String.fromCharCode(code);
};

Process.prototype.reportTextSplit = function (string, delimiter) {
    if (this.inputOption(delimiter) === 'blocks') {
        this.assertType(string, ['command', 'reporter', 'predicate']);
        return string.components();
    }
    return this.hyperDyadic(
        (str, delim) => this.reportBasicTextSplit(str, delim),
        string,
        delimiter
    );
};

Process.prototype.reportBasicTextSplit = function (string, delimiter) {
    var types = ['text', 'number'],
        strType = this.reportTypeOf(string),
        delType = this.reportTypeOf(this.inputOption(delimiter)),
        str,
        del;
    if (!contains(types, strType)) {
        throw new Error(
            localize('expecting a') + ' ' +
            localize('text') + ' ' +
            localize('but getting a') + ' ' +
            localize(strType)
        );
    }
    if (!contains(types, delType)) {
        throw new Error(
            localize('expecting a') + ' ' +
            localize('text') + ' ' +
            localize('but getting a') + ' ' +
            localize(delType)
        );
    }
    str = isNil(string) ? '' : string.toString();
    switch (this.inputOption(delimiter)) {
    case 'line':
        del = /\r\n|[\n\v\f\r\x85\u2028\u2029]/;
        break;
    case 'tab':
        del = '\t';
        break;
    case 'cr':
        del = '\r';
        break;
    case 'word':
    case 'whitespace':
        str = str.trim();
        del = /\s+/;
        break;
    case '':
    case 'letter':
        return new List(str.split(''));
        break;
    case 'csv':
        return this.parseCSV(string);
        break;
    case 'json':
        return this.parseJSON(string);
        break;
    case 'xml':
        return this.parseJSON(JSON.stringify(xmlToJson.parse(string), null, 4)).at(1);
        break;
    /*
    case 'csv records':
        return this.parseCSVrecords(string);
        break;
    case 'csv fields':
        return this.parseCSVfields(string);
        break;
    */
    default:
        del = delimiter.toString();
        break;
    };
    return new List(str.split(del));
};

// Process - parsing primitives

Process.prototype.parseCSV = function (text) {
    // try to address the kludge that Excel sometimes uses commas
    // and sometimes semi-colons as delimiters, try to find out
    // which makes more sense by examining the first line
    return this.rawParseCSV(text, this.guessDelimiterCSV(text));
};

Process.prototype.guessDelimiterCSV = function (text) {
    // assumes that the first line contains the column headers.
    // report the first delimiter for which parsing the header
    // yields more than a single field, otherwise default to comma
    var delims = [',', ';', '|', '\t'],
        len = delims.length,
        firstLine = text.split('\n')[0],
        i;
    for (i = 0; i < len; i += 1) {
        if (this.rawParseCSV(firstLine, delims[i]).length() > 1) {
            return delims[i];
        }
    }
    return delims[0];
};

Process.prototype.rawParseCSV = function (text, delim) {
    // RFC 4180
    // parse a csv table into a two-dimensional list.
    // if the table contains just a single row return it a one-dimensional
    // list of fields instead (for backwards-compatibility)
    var prev = '',
        fields = [''],
        records = [fields],
        col = 0,
        r = 0,
        esc = true,
        len = text.length,
        idx,
        char;
    delim = delim || ',';
    for (idx = 0; idx < len; idx += 1) {
        char = text[idx];
        if (char === '\"') {
            if (esc && char === prev) {
                fields[col] += char;
            }
            esc = !esc;
        } else if (char === delim && esc) {
            char = '';
            col += 1;
            fields[col] = char;
        } else if (char === '\r' && esc) {
            r += 1;
            records[r] = [''];
            fields = records[r];
            col = 0;
        } else if (char === '\n' && esc) {
            if (prev !== '\r') {
                r += 1;
                records[r] = [''];
                fields = records[r];
                col = 0;
            }
        } else {
            fields[col] += char;
        }
        prev = char;
    }

    // remove the last record, if it is empty
    if ((records[records.length - 1].length === 1
        ) && (records[records.length - 1][0] === ''
        )) {records.pop();};

    records = new List(
        records.map(row => new List(row))
    );  if (records.length() === 1) {
        return records.at(1);
    };  return records;};

Process.prototype.parseJSON = function (string) {
    // Bernat's original Snapi contribution
    function listify(jsonObject) {
        if (isNil(jsonObject)) {return jsonObject;
        } else if (jsonObject instanceof Array) {
            return new List(
                jsonObject.map(function(eachElement) {
                    return listify(eachElement);
                })
            );
        } else if (jsonObject instanceof Object) {
            return new List(
                Object.keys(jsonObject).map(function(eachKey) {
                    return new List([
                        eachKey,
                        listify(jsonObject[eachKey])
                    ]);
                })
            );
        } else if ((typeof jsonObject.toString) === 'function') {if (
        jsonObject.toString().includes('rgba\(') && jsonObject.toString(
        ).includes('\)')) {try {return new Color(jsonObject.split(',')[0
        ].split('rgba\(')[1], jsonObject.split(',')[1], jsonObject.split(
        ',')[2], jsonObject.split(',')[3].split('\)')[0]);} catch (error
        ) {return jsonObject;};} else {return jsonObject;};} else {
        return jsonObject;};}; return listify(JSON.parse(string));};

// Process syntax analysis

Process.prototype.assemble = function (blocks
) {var first; if (!(blocks instanceof List)
) {return blocks;}; first = blocks.at(1);
if (first instanceof Context) {return (first
).copyWithInputs(blocks.cdr().map(each => (
this.assemble(each))));}; if (blocks.isEmpty(
)) {return blocks;}; if (this.reportIsA((blocks
).at(1), 'number')) {return blocks.map((each
) => this.assemble(each));}; return blocks.map(
each => this.assemble(each)).itemsArray(
).reduce((a, b) => a.copyWithNext(b));};

// Process debugging

Process.prototype.doAlert = function (data) {alert(data);
}; Process.prototype.doPrompt = function (data, answer) {
return prompt(data,answer);}; (Process.prototype.doConfirm
) = function (data) {return confirm(data);};

Process.prototype.doOptionToConsole = function (option, data) {var script = new Function(['string'], ('console.'
) + option + '\(string\)'); if (contains(['log', 'info', 'debug', 'warn', 'error'], option)) {script(data);}};

// Process motion primitives

Process.prototype.getOtherObject = function (name, thisObj, stageObj) {
    // private, find the sprite indicated by the given name
    // either onstage or in the World's hand

    // deal with first-class sprites
    if (isSnapObject(name)) {
    return name;};

    if (this.inputOption(name) === 'myself') {
        return thisObj;
    };  var stage = isNil(stageObj) ?
                thisObj.parentThatIsA(StageMorph) : stageObj,
        thatObj = null;
    if (stage) {
        // find the corresponding sprite on the stage
        thatObj = detect(
            stage.children,
            morph => morph.name === name
        );
        if (!thatObj) {
            // check if the sprite in question is currently being
            // dragged around
            thatObj = detect(
                stage.world().hand.children,
                morph => morph instanceof SpriteMorph &&
                    morph.name === name
            );
        };
    };  return thatObj;};

Process.prototype.getObjectsNamed = function (name, thisObj, stageObj) {
    // private, find all sprites and their clones indicated
    // by the given name either onstage or in the World's hand

    var stage = isNil(stageObj) ?
                thisObj.parentThatIsA(StageMorph) : stageObj,
        those = [];

    function check(obj) {
        return obj instanceof SpriteMorph && obj.isTemporary ?
                obj.cloneOriginName === name : obj.name === name;
    };

    if (stage) {
        // find the corresponding sprite on the stage
        those = stage.children.filter(
        check); if (!(those.length)) {
        those = (stage.world().hand.children
        ).filter(check);};}; return those;};

Process.prototype.setHeading = function anonymous (direction) {var myself = this.blockReceiver(
); if (myself) {if (this.inputOption(direction) === 'random') {direction = this.reportBasicRandom(
0, 360000) / 1000;}; myself.setHeading(direction);};}; /* Sets the direction before the sprite. */

Process.prototype.doFaceTowards = function (name) {
    var thisObj = this.blockReceiver(),
        thatObj;

    if (thisObj) {
        if (this.inputOption(name) === 'center') {
            thisObj.faceToXY(0, 0);
        } else if (this.inputOption(name) === 'mouse-pointer') {
            thisObj.faceToXY(this.reportMouseX(), this.reportMouseY());
        } else if (this.inputOption(name) === 'random position') {
        	thisObj.setHeading(this.reportBasicRandom(0, 360000) / 1000);
        } else {
            if (name instanceof List) {
                thisObj.faceToXY(
                    name.at(1),
                    name.at(2)
                );
                return;
            };
            thatObj = this.getOtherObject(name, this.homeContext.receiver);
            if (thatObj) {
                thisObj.faceToXY(
                    thatObj.xPosition(),
                    thatObj.yPosition()
                );};};};};

Process.prototype.doGotoObject = function (name) {
var thisObj = this.blockReceiver(), thatObj, stage;

    if (thisObj) {
        if (this.inputOption(name) === 'center') {
            thisObj.gotoXY(0, 0);
        } else if (this.inputOption(name) === 'mouse-pointer') {
            thisObj.gotoXY(this.reportMouseX(), this.reportMouseY());
        } else if (this.inputOption(name) === 'random position') {
	        stage = thisObj.parentThatIsA(StageMorph);
    	    if (stage) {thisObj.setCenter(new Point(
                    this.reportBasicRandom(stage.left(), stage.right()),
                    this.reportBasicRandom(stage.top(), stage.bottom())
                ));
         	}
        } else {
            if (name instanceof List) {
                thisObj.gotoXY(
                    name.at(1),
                    name.at(2)
                );
                return;
            };  thatObj = this.getOtherObject(name, this.homeContext.receiver);
            if (thatObj) {
                thisObj.gotoXY(
                    thatObj.xPosition(),
                    thatObj.yPosition()
                );
            };
        };
    };};

// Process layering primitives

Process.prototype.goToLayer = function (
name) {var option = this.inputOption(name
), thisObj = this.blockReceiver(); if (
thisObj instanceof SpriteMorph) {if (
option === 'front') {thisObj.comeToFront(
);} else if (option === 'back') {
thisObj.goToBack();};};};

// Process scene primitives

Process.prototype.doSwitchToScene = function (id, transmission) {var rcvr = this.blockReceiver(), idx = 0, message = this.inputOption(transmission.at(1)), ide, scenes, num, scene; this.assertAlive(rcvr); (this
).assertType(message, ['text', 'number', 'Boolean', 'list']); if (message instanceof List) {if (message.canBeJSON()) {message = message.deepMap(leif => leif);} else {throw new Error(localize('cannot send ' + (
'media,\nsprites or procedures\nto another scene')));}}; if (this.readyToTerminate) {return;}; ide = rcvr.parentThatIsA(IDE_Morph); scenes = ide.scenes; if (id instanceof Array) {switch (this.inputOption(id)) {
case 'next': idx = scenes.indexOf(ide.scene) + 1; if (idx > scenes.length()) {idx = 1;}; break; case 'previous': idx = scenes.indexOf(ide.scene) - 1; if (idx < 1) {idx = scenes.length();}; break; case 'last':
idx = scenes.length(); break; case 'random': idx = this.reportBasicRandom(1, scenes.length()); break;}; this.stop(); ide.switchToScene(scenes.at(idx), null, message); return;}; scene = detect((scenes
).itemsArray(), scn => scn.name === id); if (scene === null) {num = parseFloat(id); if (isNaN(num)) {return;}; scene = scenes.at(num);}; this.stop(); ide.switchToScene(scene, null, message);};

// Process color primitives

Process.prototype.setColorDimension = function (name, num) {
var options = ['hue', 'saturation', 'brightness', 'transparency', 'size'],
choice = this.inputOption(name); if (choice === 'r-g-b(-a)') {
this.blockReceiver().setColorRGBA(num); return;};
this.blockReceiver().setColorDimension(
options.indexOf(choice), +num);};

Process.prototype.changeColorDimension = function (name, num) {
var options = ['hue', 'saturation', 'brightness', 'transparency', 'size'],
choice = this.inputOption(name); if (choice === 'r-g-b(-a)') {
this.blockReceiver().changeColorRGBA(num); return;};
this.blockReceiver().changeColorDimension(
options.indexOf(choice), +num);};

Process.prototype.setPenColorDimension =
    Process.prototype.setColorDimension;

Process.prototype.changePenColorDimension =
    Process.prototype.changeColorDimension;

Process.prototype.setBackgroundColorDimension =
    Process.prototype.setColorDimension;

Process.prototype.changeBackgroundColorDimension =
    Process.prototype.changeColorDimension;

// Process cutting & pasting primitives

Process.prototype.doPasteOn = function (name) {this.blitOn(name, 'source-atop');};
Process.prototype.doCutFrom = function (name) {this.blitOn(name, 'destination-out');};

Process.prototype.blitOn = function (name, mask, thisObj, stage) {
    var those;
    thisObj = thisObj || this.blockReceiver();
    stage = stage || thisObj.parentThatIsA(StageMorph);
    if (stage.name === name) {
        name = stage;
    }
    if (isSnapObject(name)) {
        return thisObj.blitOn(name, mask);
    }
    if (name instanceof List) {
        those = name.itemsArray();
    } else {
        those = this.getObjectsNamed(name, thisObj, stage);
    }
    those.forEach(each => {
        if (!each.inheritsAttribute('costume #')) {
            this.blitOn(each, mask, thisObj, stage);
        }
    });
};

// Process sensing primitives

Process.prototype.reportTouchingObject = function (name) {
var thisObj = this.blockReceiver(); if (thisObj) {
return this.objectTouchingObject(thisObj, name);};
return false;};

Process.prototype.objectTouchingObject = function (thisObj, name) {
    // helper function for reportTouchingObject()
    // also check for temparary clones, as in Scratch 2.0,
    // and for any parts (subsprites)
    var those,
        stage,
        box,
        mouse;

    if (this.inputOption(name) === 'mouse-pointer') {
        mouse = thisObj.world().hand.position();
        if (thisObj.bounds.containsPoint(mouse) &&
                !thisObj.isTransparentAt(mouse)) {
            return true;
        };
    } else {
        stage = thisObj.parentThatIsA(StageMorph);
        if (stage) {
            if (this.inputOption(name) === 'edge') {
                box = thisObj.bounds;
                if (!thisObj.costume && thisObj.penBounds) {
                    box = thisObj.penBounds.translateBy(thisObj.position());
                };
                if (!stage.bounds.containsRectangle(box)) {
                    return true;
                };
            };
            if (this.inputOption(name) === 'pen trails' &&
                    thisObj.isTouching(stage.penTrailsMorph())) {
                return true;
            };
            if (isSnapObject(name)) {
                return name.isVisible && thisObj.isTouching(name);
            };
            if (name instanceof List) { // assume all elements to be sprites
                those = name.itemsArray();
            } else {
                those = this.getObjectsNamed(name, thisObj, stage); // clones
            };
            if (those.some(any => any.isVisible && thisObj.isTouching(any)
                    // check collision with any part, performance issue
                    // commented out for now
                /*
                    return any.allParts().some(function (part) {
                        return part.isVisible && thisObj.isTouching(part);
                    })
                */
                )) {
                return true;
            };
        };
    };
    return thisObj.parts.some(any =>
        this.objectTouchingObject(any, name)
    );
};

Process.prototype.reportAspect = function (aspect, location) {
    // sense colors and sprites anywhere,
    // use sprites to read/write data encoded in colors.
    //
    // usage:
    // ------
    // left input selects color/saturation/brightness/transparency or "sprites".
    // right input selects "mouse-pointer", "myself" or name of another sprite.
    // you can also embed a a reporter with a reference to a sprite itself
    // or a list of two items representing x- and y- coordinates.
    //
    // what you'll get:
    // ----------------
    // left input (aspect):
    //
    //      'hue'           - hsl HUE on a scale of 0 - 100
    //      'saturation'    - hsl SATURATION on a scale of 0 - 100
    //      'brightness'    - hsl BRIGHTNESS on a scale of 0 - 100
    //      'transparency'  - rgba ALPHA on a reversed (!) scale of 0 - 100
    //      'r-g-b-a'       - list of rgba values on a scale of 0 - 255 each
    //      'sprites'       - a list of sprites at the location, empty if none
    //
    // right input (location):
    //
    //      'mouse-pointer' - color/sprites at mouse-pointer anywhere in Snap
    //      'myself'        - sprites at or color UNDERNEATH the rotation center
    //      sprite-name     - sprites at or color UNDERNEATH sprites's rot-ctr.
    //      two-item-list   - color/sprites at x-/y- coordinates on the Stage
    //
    // what does "underneath" mean?
    // ----------------------------
    // the not-fully-transparent color of the top-layered sprite at the given
    // location excluding the receiver sprite's own layer and all layers above
    // it gets reported.
    //
    // color-aspect "underneath" a sprite means that the sprite's layer is
    // relevant for what gets reported. Sprites can only sense colors in layers
    // below themselves, not their own color and not colors in sprites above
    // their own layer.

    if (this.enableHyperOps) {
        if (location instanceof List && !this.isCoordinate(location)) {
            return location.map(each => this.reportAspect(aspect, each));
        }
    }

    var choice = this.inputOption(aspect),
        target = this.inputOption(location),
        options = ['hue', 'saturation',
        'brightness', 'transparency'],
        idx = options.indexOf(choice),
        thisObj = this.blockReceiver(),
        thatObj, point, clr, stage = (
        thisObj.parentThatIsA(StageMorph));

    if (target === 'myself') {
        if (choice === 'sprites') {
            if (thisObj instanceof StageMorph) {
                point = thisObj.center();
            } else {
                point = thisObj.rotationCenter();
            }
            return this.spritesAtPoint(point, stage);
        } else {
            clr = this.colorAtSprite(thisObj);
        }
    } else if (target === 'mouse-pointer') {
        if (choice === 'sprites') {
            return this.spritesAtPoint(world.hand.position(), stage);
        } else {
            clr = world.getGlobalPixelColor(world.hand.position());
        }
    } else if (target instanceof List) {
        point = new Point(
            target.at(1) * stage.scale + stage.center().x,
            stage.center().y - (target.at(2) * stage.scale)
        );
        if (choice === 'sprites') {
            return this.spritesAtPoint(point, stage);
        } else {
            clr = world.getGlobalPixelColor(point);
        }
    } else {
        if (!target) {return; }
        thatObj = this.getOtherObject(target, thisObj, stage);
        if (thatObj) {
            if (choice === 'sprites') {
                point = thatObj instanceof SpriteMorph ?
                    thatObj.rotationCenter() : thatObj.center();
                return this.spritesAtPoint(point, stage);
            } else {
                clr = this.colorAtSprite(thatObj);
            }
        } else {
            return;
        }

    }

    if (choice === 'r-g-b-a') {
        return new List([clr.r, clr.g, clr.b, Math.round(clr.a * 255)]);
    }
    if (idx < 0 || idx > 3) {
        return;
    }
    if (idx === 3) {
        return (1 - clr.a) * 100;
    }; return clr[SpriteMorph.prototype.penColorModel]()[idx] * 100;
};

Process.prototype.colorAtSprite = function (sprite) {
    // private - helper function for aspect of location
    // answer the top-most color at the sprite's rotation center
    // excluding the sprite itself
    var point = sprite instanceof SpriteMorph ? sprite.rotationCenter()
            : sprite.center(),
        stage = sprite.parentThatIsA(StageMorph),
        child, i;

    if (!stage) {return BLACK;};
    for (i = stage.children.length; i > 0; i -= 1) {
        child = stage.children[i - 1];
        if ((child !== sprite) &&
            child.isVisible &&
            child.bounds.containsPoint(point) &&
            !child.isTransparentAt(point)
        ) {
            return child.getPixelColor(point);
        };
    }; if (stage.bounds.containsPoint(point)) {
        return stage.getPixelColor(point);
    }; return BLACK;
};

Process.prototype.colorBelowSprite = function (sprite) {
    // private - helper function for aspect of location
    // answer the color underneath the layer of the sprite's rotation center
    // NOTE: layer-aware color sensing is currently unused
    // in favor of top-layer detection because of user-observations
    var point = sprite instanceof SpriteMorph ? sprite.rotationCenter()
            : sprite.center(),
        stage = sprite.parentThatIsA(StageMorph),
        below = stage, found = false, child, i;

    if (!stage) {return BLACK;};
    for (i = 0; i < stage.children.length; i += 1) {
        if (!found) {
            child = stage.children[i];
            if (child === sprite) {
                found = true;
            } else if (child.isVisible &&
                child.bounds.containsPoint(point) &&
                !child.isTransparentAt(point)
            ) {
                below = child;
            };
        };
    }; if (below.bounds.containsPoint(point)) {
        return below.getPixelColor(point);
    }; return BLACK;
};

Process.prototype.spritesAtPoint = function (point, stage) {
    // private - helper function for aspect of location
    // point argument is an absolute (Morphic) point
    // answer a list of sprites, if any, at the given point
    // ordered by their layer, i.e. top-layer is last in the list
    return new List(
        stage.children.filter(morph =>
            morph instanceof SpriteMorph &&
                morph.isVisible &&
                    morph.bounds.containsPoint(point) &&
                        !morph.isTransparentAt(point)
        )
    );
};

Process.prototype.reportRelationTo = function (relation, name) {
    if (this.enableHyperOps) {
        if (name instanceof List) {
            // make all numerical 2-item lists atomic
            name = this.packCoordinates(name);
        }; return this.hyperDyadic(
            (rel, nam) => this.reportBasicRelationTo(rel, nam),
            relation, name
        );
    }; return this.reportBasicRelationTo(relation, name);
};

Process.prototype.reportBasicRelationTo = function (relation, name) {
	var rel = this.inputOption(relation);
    if (name instanceof Variable) { // atomic coordinate
        name = name.value;
    }; var rel = this.inputOption(relation);
    if (rel === 'distance') {
  	return this.reportDistanceTo(name);
    }; if (rel === 'ray length') {
    	return this.reportRayLengthTo(name);
    }; if (rel === 'direction') {
    	return this.reportDirectionTo(name);
    }; if (this.reportTypeOf(rel) === 'number') {
        return this.reportRayLengthTo(name, +rel);
    };  return 0;};

Process.prototype.isCoordinate = function (data) {
    return data instanceof List &&
        (data.length() === 2) &&
            this.reportTypeOf(data.at(1)) === 'number' &&
                this.reportTypeOf(data.at(2)) === 'number';
};

Process.prototype.reportDistanceTo = function (name) {var thisObj = (
this).blockReceiver(), thatObj, stage, rc, point; if (thisObj) {rc = (
thisObj).rotationCenter(); point = rc; if (this.inputOption(name) === (
'mouse-pointer')) {point = thisObj.world().hand.position();} else if (
this.inputOption(name) === 'center') {return new Point((thisObj
).xPosition(), thisObj.yPosition()).distanceTo(ZERO);} else if (
name instanceof List) {return new Point(thisObj.xPosition(),
thisObj.yPosition()).distanceTo(new Point(name.at(1), name.at(
2)));}; stage = thisObj.parentThatIsA(StageMorph); thatObj = (
this).getOtherObject(name, thisObj, stage); if (thatObj) {
point = thatObj.rotationCenter();}; return (rc.distanceTo(
point) / stage.scale);}; return 0;};

Process.prototype.reportRayLengthTo = function (name, relativeAngle = 0) {
    // raycasting edge detection - answer the distance between the asking
    // sprite's rotation center to the target sprite's outer edge (the first
    // opaque pixel) in the asking sprite's current direction offset by
    // an optional relative angle in degrees
    var thisObj = this.blockReceiver(),
        thatObj, stage, rc, targetBounds,
        intersections = [], dir, a, b,
        x, y, top, bottom, left, right,
        circa = (num => (Math.round(
        num * 10000000) / 10000000)
        ), hSect, vSect, point, hit,
        temp, width, imageData;

    hSect = (yLevel) => {
        var theta = radians(dir);
        b = rc.y - yLevel;
        a = b * Math.tan(theta);
        x = rc.x + a;
        if (
            (circa(x) === circa(rc.x) &&
                ((dir === 180 && rc.y < yLevel) ||
                dir === 0 && rc.y > yLevel)
            ) ||
            (x > rc.x && dir >= 0 && dir < 180) ||
            (circa(x) < circa(rc.x) &&
                dir >= 180 && dir < 360)
        ) {
            if (x >= left && x <= right) {
                intersections.push(new Point(x, yLevel));
            };
        };
    };

    vSect = (xLevel) => {
        var theta = radians(360 - dir - 90);
        b = rc.x - xLevel;
        a = b * Math.tan(theta);
        y = rc.y + a;
        if (
            (circa(y) === circa(rc.y) &&
                ((dir === 90 && rc.x < xLevel) ||
                dir === 270 && rc.x > xLevel)
            ) ||
            (y > rc.y && dir >= 90 && dir < 270) ||
            (y < rc.y && (dir >= 270 || dir < 90))
        ) {
            if (y >= top && y <= bottom) {
                intersections.push(new Point(xLevel, y));
            };
        };
    };

    if (!thisObj) {return -1;};
    rc = thisObj.rotationCenter(); point = rc;
    stage = thisObj.parentThatIsA(StageMorph);
    thatObj = this.getOtherObject(name, thisObj, stage);
    if (!(thatObj instanceof SpriteMorph)) {return -1;};

    // determine intersections with the target's bounding box
    dir = thisObj.heading + relativeAngle;
    dir = ((+dir % 360) + 360) % 360;
    targetBounds = thatObj.bounds;
    top = targetBounds.top();
    bottom = targetBounds.bottom();
    left = targetBounds.left();
    right = targetBounds.right() - 1;

    // test if already inside the target
    if (targetBounds.containsPoint(rc)) {
        intersections.push(rc);
        hSect(top);
        hSect(bottom);
        vSect(left);
        vSect(right);
        if (intersections.length < 2) {
            return -1;
        };
    } else {
        hSect(top);
        hSect(bottom);
        vSect(left);
        vSect(right);
        if (intersections.length < 2) {
            return -1;
        };  // sort
        if (dir !== 90) {
            if (Math.sign(rc.x - intersections[0].x) !==
                Math.sign(intersections[0].x - intersections[1].x) ||
                Math.sign(rc.y - intersections[0].y) !==
                Math.sign(intersections[0].y - intersections[1].y)
            ) {
                temp = intersections[0];
                intersections[0] = intersections[1];
                intersections[1] = temp;
            };
        };
    };

    // for debugging:
    /*
    return new List(intersections)
        .map(point => thisObj.snapPoint(point))
        .map(point => new List([point.x, point.y]));
    */

    // convert intersections to local bitmap coordinates of the target
    intersections = intersections.map(point =>
        point.subtract(targetBounds.origin
        ).floorDivideBy(stage.scale)
    );

    // get image data
    width = Math.floor(targetBounds.width() / stage.scale);
    imageData = thatObj.getImageData();

    // scan the ray along the coordinates of a Bresenham line
    // for the first opaque pixel
    function alphaAt(imageData, width, x, y) {
        var idx = y * width + x;
        return imageData[idx] && 0x000000FF; // alpha
    };  function isOpaque(x, y) {
        return alphaAt(imageData, width, x, y) > 0;
    };  function scan(testFunc, x0, y0, x1, y1) {
        // Bresenham's algorithm
        var dx = Math.abs(x1 - x0),
            sx = x0 < x1 ? 1 : -1,
            dy = -Math.abs(y1 - y0),
            sy = y0 < y1 ? 1 : -1,
            err = dx + dy,
            e2;

        while (true) {
            if (testFunc(x0, y0)) {
                return new Point(x0 * stage.scale, y0 * stage.scale);
            };  if (x0 === x1 && y0 === y1) {
                return -1;
            };  e2 = 2 * err;
            if (e2 > dy) {
                err += dy;
                x0 += sx;
            };  if (e2 < dx) {
                err += dx;
                y0 += sy;
            };
        };
    };

    hit = scan(
        isOpaque,
        intersections[0].x,
        intersections[0].y,
        intersections[1].x,
        intersections[1].y
    );  if (hit === -1) {return hit;};
    return (rc.distanceTo(hit.add(
    targetBounds.origin)) / (
    stage.scale));
};

Process.prototype.reportDirectionTo = function (name) {
    var thisObj = this.blockReceiver(), thatObj;

    if (thisObj) {
        if (this.inputOption(name) === 'mouse-pointer') {
            return thisObj.angleToXY(this.reportMouseX(), this.reportMouseY());
        };  if (this.inputOption(name) === 'center') {
            return thisObj.angleToXY(0, 0);
        };  if (name instanceof List) {
            return thisObj.angleToXY(
            name.at(1), name.at(2));
        };  thatObj = this.getOtherObject(name, this.homeContext.receiver);
        if (thatObj) {
            return thisObj.angleToXY(
                thatObj.xPosition(),
                thatObj.yPosition()
            );
        };  return thisObj.direction();
    };  return 0;};

Process.prototype.doEditCostume = function (input) {if (this.context.costumeDialog instanceof DialogBoxMorph) {if (this.context.costumeDialog.isDestroyed) {if (this.context.costumeDialog.isReplaced) {
this.context.costumeDialog = this.context.costumeDialog.replacement; this.pushContext('doYield'); this.pushContext();} else {delete this.context.costumeDialog;};} else {this.pushContext('doYield');
this.pushContext();};} else {var slctdCst = this.costumeNamed(input); if (slctdCst instanceof Costume) {this.context.costumeDialog = slctdCst.edit(world, world.childThatIsA(IDE_Morph), false, nop,
nop, true); this.pushContext('doYield'); this.pushContext();};};}; /* Edits the costume and waits until the editor's dialog is closed. This function works with no problem. Try it for fun!!! :-) */

Process.prototype.reportBlockAttribute = function (attribute, block) {return this.hyperDyadic((att, obj) => this.reportBasicBlockAttribute(att, obj), attribute, block);};
Process.prototype.reportBasicBlockAttribute = function (attribute, block) {
    var choice = this.inputOption(attribute), expr = block.expression, myself = this; this.assertType(block, ['command', 'reporter', 'predicate']);
    switch (choice) {
    case 'spec':
        return (expr ? expr.blockSpec : '');
        break;
    case 'label':
        return (expr ? expr.parseSpec(expr.blockSpec).map(str => (str.length > 1 && (str[0]) === '%') ? '_' : str).join(' ') : '');
        break;
    case 'definition':
        if (expr.isCustomBlock) {
            if (expr.isGlobal) {
                return (expr.definition.body || new Context);
            };
            return this.blockReceiver().getMethod(expr.semanticSpec).body;
        } else {return new Context;};
        break;
    case 'parameters':
        return new List(block.inputs);
        break;
    case 'variables':
        var block = expr, each, result = [];
        return new List(Object.entries(block.variables.vars
        ).map(each => new List([each[0], each[1].value])));
        break;
    case 'sequence':
        var result = expr.fullCopy().blockSequence(); if (!(
        result instanceof Array)) {result = [result];}; if (
        result[0] instanceof ReporterBlockMorph) {return (
        new List(result)).map(block => myself.reify(block,
        new List));} else {return (new List(result)).map(
        block => {block.children.forEach(child => {if (
        child instanceof CommandBlockMorph) {
        block.removeChild(child);};});
        return myself.reportScript(
        null, block);});}; break;
    case 'selector':
        return (expr ? expr.selector : '');
        break;
    case 'category':
        return expr.category;
        break;
    case 'custom?':
        return (expr ? asABool(expr.isCustomBlock) : false);
        break;
    case 'global?':
        return ((expr && expr.isCustomBlock) ? asABool(expr.isGlobal) : true);
        break;
    case 'pic':
        if (expr instanceof BlockMorph) {expr = expr.fullCopy();
        expr.fixBlockColor(); return new Costume(expr.fullImage(),
        expr.selector);} else if (block.isContinuation) {
        if (expr[block.pc] instanceof BlockMorph) {expr = expr[block.pc];
        expr = expr.fullCopy(); expr.fixBlockColor(); return new Costume(
        expr.fullImage(), expr.selector);} else {return new Costume(
        newCanvas(new Point, true), "empty");};} else {
        return new Costume(newCanvas(new Point, true), "empty");};
        break;
    default:
        return '';
        break;};};

/*
// Process - Block attributes, DEFINE and introspection prims

Process.prototype.reportBlockAttribute = function (attribute, block) {
    // hyper-dyadic
    // note: attributes in the left slot
    // can only be queried via the dropdown menu and are, therefore, not
    // reachable as dyadic inputs
    return this.hyper(
        (att, obj) => this.reportBasicBlockAttribute(att, obj),
        attribute,
        block
    );
};

Process.prototype.reportBasicBlockAttribute = function (attribute, block) {
    var choice = this.inputOption(attribute),
        expr, body, slots, def, info, loc;
    this.assertType(block, ['command', 'reporter', 'predicate']);
    expr = block.expression;
    switch (choice) {
    case 'label':
        return expr ? expr.abstractBlockSpec() : '';
    case 'definition':
        if (expr.isCustomBlock) {
            if (expr.isGlobal) {
                body = expr.definition.body || new Context();
            } else {
                body = this.blockReceiver().getMethod(expr.semanticSpec).body ||
                    new Context();
            }
        } else {
            body = new Context();
        }
        if (body.expression && body.expression.selector === 'doReport' &&
                body.expression.inputs()[0] instanceof BlockMorph) {
            return body.expression.inputs()[0].reify(body.inputs);
        }
        return body;
    case 'category':
        return expr ?
            SpriteMorph.prototype.allCategories().indexOf(expr.category) + 1
                : 0;
    case 'custom?':
        return expr ? !!expr.isCustomBlock : false;
    case 'global?':
        return (expr && expr.isCustomBlock) ? !!expr.isGlobal : true;
    case 'type':
        return ['command', 'reporter', 'predicate'].indexOf(
            this.reportTypeOf(block)
        ) + 1;
    case 'scope':
        return expr.isCustomBlock ? (expr.isGlobal ? 1 : 2) : 0;
    case 'slots':
        if (expr.isCustomBlock) {
            slots = [];
            (expr.isGlobal ?
                expr.definition
                : this.blockReceiver().getMethod(expr.semanticSpec)
            ).declarations.forEach(value => slots.push(value[0]));
            return new List(slots).map(spec => this.slotType(spec));
        }
        return new List(
            expr.inputs().map(each =>
                each instanceof ReporterBlockMorph ?
                    each.getSlotSpec() : each.getSpec()
            )
        ).map(spec => this.slotType(spec));
    case 'defaults':
        slots = new List();
        if (expr.isCustomBlock) {
            def = (expr.isGlobal ?
                expr.definition
                : this.blockReceiver().getMethod(expr.semanticSpec));
            def.declarations.forEach(value => slots.add(value[1]));
        } else {
            info = SpriteMorph.prototype.blocks[expr.selector];
            if (!info) {return slots; }
            slots = new List(info.defaults);
        }
        return slots;
    case 'menus':
        slots = new List();
        if (expr.isCustomBlock) {
            def = (expr.isGlobal ?
                expr.definition
                : this.blockReceiver().getMethod(expr.semanticSpec));
            def.declarations.forEach(value => slots.add(
                isString(value[2]) ?
                    def.decodeChoices(def.parseChoices(value[2]))
                    : ''
            ));
        } else {
            expr.inputs().forEach(slot => {
                if (slot instanceof ReporterBlockMorph) {
                    slot = SyntaxElementMorph.prototype.labelPart(
                        slot.getSlotSpec()
                    );
                }
                slots.add(slot instanceof InputSlotMorph ?
                    (isString(slot.choices) ? slot.choices
                        : CustomBlockDefinition.prototype.decodeChoices(
                            slot.choices
                        ))
                    : ''
                );
            });
        }
        return slots;
    case 'editables':
        slots = new List();
        if (expr.isCustomBlock) {
            def = (expr.isGlobal ?
                expr.definition
                : this.blockReceiver().getMethod(expr.semanticSpec));
            def.declarations.forEach(value => slots.add(!value[3]));
        } else {
            expr.inputs().forEach(slot => {
                if (slot instanceof ReporterBlockMorph) {
                    slot = SyntaxElementMorph.prototype.labelPart(
                        slot.getSlotSpec()
                    );
                }
                slots.add(slot instanceof InputSlotMorph ?
                    !slot.isReadOnly : false
                );
            });
        }
        return slots;
    case 'translations':
        if (expr.isCustomBlock) {
            def = (expr.isGlobal ?
                expr.definition
                : this.blockReceiver().getMethod(expr.semanticSpec));
            loc = new List();
            Object.keys(def.translations).forEach(lang =>
                loc.add(new List([lang, def.translations[lang]]))
            );
            return loc;
        }
        return '';
    }
    return '';
};

Process.prototype.slotType = function (spec) {
    // answer a number indicating the shape of a slot represented by its spec.
    // Note: you can also use it to translate mnemonics into slot type numbers
    var shift = 0,
        key = spec.toLowerCase(),
        num;

    if (spec.startsWith('%')) {
        key = spec.slice(1).toLowerCase();
        if (key.startsWith('mult')) {
            shift = 100;
            key = key.slice(5);
        }
    } else if (spec.endsWith('...')) {
        shift = 100;
        key = spec.slice(0, -3).toLowerCase();
    }

    num =  {
        '0':        0,
        's':        0, // spec
        // mnemonics:
        ' ':        0,
        '_':        0,
        'a':        0,
        'any':      0,

        '1':        1,
        'n':        1, // spec
        // mnemonics:
        '#':        1,
        'num':      1,
        'number':   1,

        '2':        2,
        'b':        2, // spec
        // mnemonics:
        '?':        2,
        'tf':       2,
        'bool':     2,
        'boolean':  2,

        '3':        3,
        'l':        3, // spec
        // mnemonics:
        ':':        3,
        'lst':      3,
        'list':     3,

        '4':        4,
        'txt':      4, // spec
        'mlt':      4, // spec
        'code':     4, // spec
        // mnemonics:
        'x':        4,
        'text':     4,
        'abc':      4,

        '5':        5,
        'c':        5, // spec
        'cs':       5, // spec
        'loop':     5, // spec
        'ca':       5, // spec
        // mnemonics:
        'script':   5,
        
        '6':        6,
        'cmdring':  6, // spec
        // mnemonics:
        'cmd':      6,
        'command':  6,

        '7':        7,
        'repring':  7, // spec
        // mnemonics:
        'rep':      7,
        'reporter': 7,

        '8':        8,
        'predring': 8, // spec
        // mnemonics:
        'pred':     8,
        'predicate': 8,

        '9':        9,
        'anyue':    9, // spec
        // mnemonics:
        'unevaluated': 9,

        '10':       10,
        'boolue':   10, // spec
        // mnemonics: none

        '11':       11,
        'obj':      11, // spec
        // mnemonics:
        'o':        11,
        'object':   11,

        '12':       12,
        't':        12, // spec
        'upvar':    12, // spec
        // mnemonics:
        'v':        12,
        'var':      12
    }[key];
    if (num === undefined) {
        return spec;
    }
    return shift + num;
};

Process.prototype.slotSpec = function (num) {
    // answer a spec indicating the shape of a slot represented by a number
    // or by a textual mnemomic
    var prefix = '',
        id = this.reportIsA(num, 'text') ? this.slotType(num) : +num,
        spec;

    if (id >= 100) {
        prefix = '%mult';
        id -= 100;
    }

    spec = ['s', 'n', 'b', 'l', 'mlt', 'cs', 'cmdRing', 'repRing', 'predRing',
    'anyUE', 'boolUE', 'obj', 'upvar'][id];

    if (spec === undefined) {
        return null;
    }
    if (spec === 'upvar' && id > 100) {
        return null;
    }
    return prefix + '%' + spec;
};

Process.prototype.doSetBlockAttribute = function (attribute, block, val) {
    var choice = this.inputOption(attribute),
        rcvr = this.blockReceiver(),
        ide = rcvr.parentThatIsA(IDE_Morph),
        types = ['command', 'reporter', 'predicate'],
        scopes = ['global', 'local'],
        idx, oldSpec, expr, def, inData, template, oldType, type, loc;

    this.assertType(block, types);
    expr = block.expression;
    if (!expr.isCustomBlock) {
        throw new Error('expecting a custom block\nbut getting a primitive');
    }
    def = expr.isGlobal ? expr.definition : rcvr.getMethod(expr.semanticSpec);
    oldSpec = def.blockSpec();

    function isInUse() {
        if (def.isGlobal) {
            return ide.sprites.asArray().concat([ide.stage]).some((any, idx) =>
                any.usesBlockInstance(def, false, idx)
            ) || ide.stage.allBlockInstancesInData(def).some(any =>
                !any.isUnattached()
            );
        }
        return rcvr.allDependentInvocationsOf(oldSpec).some(any =>
            !any.isUnattached()
        );
    }

    function remove(arr, value) {
        var idx = arr.indexOf(value);
        if (idx > -1) {
            arr.splice(idx, 1);
        }
    }

    function isMajorTypeChange() {
        var rep = ['reporter', 'predicate'];
        return (type === 'command' && rep.includes(oldType)) ||
            (oldType == 'command' && rep.includes(type));
    }

    switch (choice) {
    case 'label':
        def.setBlockLabel(val);
        break;
    case 'definition':
        this.assertType(val, types);
        def.setBlockDefinition(val);
        break;
    case 'category':
        this.assertType(val, ['number', 'text']);
        if (this.reportTypeOf(val) === 'text') {
            idx = SpriteMorph.prototype.allCategories().map(
                cat => cat.toLowerCase()
            ).indexOf(val.toLowerCase());
            val = idx + 1;
        }
        def.category = SpriteMorph.prototype.allCategories()[+val - 1] ||
            'other';
        break;
    case 'type':
        this.assertType(val, ['number', 'text']);
        if (this.reportTypeOf(val) === 'text') {
            type = val.toLowerCase();
        } else {
            type = types[val - 1] || '';
        }
        if (!types.includes(type)) {return;}

        if (rcvr.allBlockInstances(def).every(block =>
            block.isChangeableTo(type))
        ) {
            oldType = def.type;
            def.type = type;
        } else {
            throw new Error('cannot change this\nfor a block that is in use');
        }
        if (isMajorTypeChange()) {
            // since we've already scanned all contexts we know that those
            // that contain block instances only contain single, unattached
            // ones. Therefore we can simply replace them with new ones.
            if (def.isGlobal) {
                ide.stage.allContextsUsing(def).forEach(context =>
                    context.expression = def.blockInstance()
                );
            } else {
                ide.stage.allContextsInvoking(def.blockSpec(), rcvr).forEach(
                    context => context.expression = def.blockInstance()
                );
            }
        }
        break;
    case 'scope':
        if (isInUse()) {
            throw new Error('cannot change this\nfor a block that is in use');
        }
        this.assertType(val, ['number', 'text']);
        if (this.reportTypeOf(val) === 'text') {
            type = val.toLowerCase();
        }
        if (scopes.includes(type)) {
            type = scopes.indexOf(type) + 1;
        } else {
            type = +val;
        }
        if (type === 1 && !def.isGlobal) {
            // make global
            inData = ide.stage.allContextsInvoking(def.blockSpec(), rcvr);
            def.isGlobal = true;
            remove(rcvr.customBlocks, def);
            ide.stage.globalBlocks.push(def);
        } else if (type === 2 && def.isGlobal) {
            // make local
            inData = ide.stage.allContextsUsing(def);
            def.isGlobal = false;
            remove(ide.stage.globalBlocks, def);
            rcvr.customBlocks.push(def);
        } else {
            return;
        }
        inData.forEach(context => {
            context.expression = def.blockInstance();
            context.changed();
        });
        break;
    case 'slots':
        this.assertType(val, ['list', 'number', 'text']);
        if (!(val instanceof List)) {
            val = new List([val]);
        }
        def.inputNames().forEach((name, idx) => {
            var info = def.declarations.get(name),
                id = val.at(idx + 1);
            if (id !== '') {
                info[0] = this.slotSpec(id) || info[0];
                def.declarations.set(name, info);
            }
        });
        break;
    case 'defaults':
        this.assertType(val, ['list', 'Boolean', 'number', 'text']);
        if (!(val instanceof List)) {
            val = new List([val]);
        }
        def.inputNames().forEach((name, idx) => {
            var info = def.declarations.get(name),
                options = val.at(idx + 1);
            this.assertType(options, ['Boolean', 'number', 'text']);
            info[1] = options;
            def.declarations.set(name, info);
        });
        break;
    case 'menus':
        this.assertType(val, ['list', 'text', 'number']);
        if (!(val instanceof List)) {
            val = new List([val.toString()]);
        }
        def.inputNames().forEach((name, idx) => {
            var info = def.declarations.get(name),
                options = val.at(idx + 1);
            if (options !== '') {
                if (!(options instanceof List)) {
                    options = new List([options]);
                }
                info[2] = def.encodeChoices(options);
                def.declarations.set(name, info);
            }
        });
        break;
    case 'editables':
        this.assertType(val, ['list', 'Boolean', 'number']);
        if (!(val instanceof List)) {
            val = new List([val]);
        }
        def.inputNames().forEach((name, idx) => {
            var info = def.declarations.get(name),
                options = val.at(idx + 1);
            if ([true, false, 0, 1, '0', '1'].includes(options)) {
                options = +options;
                info[3] = !options;
                def.declarations.set(name, info);
            }
        });
        break;
    case 'translations':
        this.assertType(val, 'list');
        loc = {};
        val.map(row =>
            loc[row.at(1).toString()] = row.at(2).toString()
        );
        def.translations = loc;
        break;
    default:
        return;
    }

    // make sure the spec is unique
    while (rcvr.doubleDefinitionsFor(def).length > 0) {
        def.spec += (' (2)');
    }
    
    // update all block instances:
    // refer to "updateDefinition()" of BlockEditorMorph:
    template = rcvr.paletteBlockInstance(def);

    if (def.isGlobal) {
        rcvr.allBlockInstances(def).reverse().forEach(block => block.refresh());
        ide.stage.allContextsUsing(def).forEach(context => context.changed());
    } else {
        rcvr.allDependentInvocationsOf(oldSpec).reverse().forEach(
            block => block.refresh(def)
        );
        ide.stage.allContextsInvoking(def.blockSpec(), rcvr).forEach(context =>
            context.changed()
        );
    }
    if (template) {
        template.refreshDefaults();
    }
    ide.flushPaletteCache();
    ide.categories.refreshEmpty();
    ide.refreshPalette();
    rcvr.recordUserEdit(
        'scripts',
        'custom block',
        def.isGlobal ? 'global' : 'local',
        'changed attribute',
        def.abstractBlockSpec(),
        choice
    );
};

Process.prototype.doDefineBlock = function (upvar, label, context) {
    var rcvr = this.blockReceiver(),
        ide = rcvr.parentThatIsA(IDE_Morph),
        vars = this.context.outerContext.variables,
        type = this.reportTypeOf(context),
        count = 1,
        matches, spec, def;

    this.assertType(label, 'text');
    label = label.trim();
    if (label === '') {return ''; }
    this.assertType(context, ['command', 'reporter', 'predicate']);

    // replace upvar self references inside the definition body
    // with "reportEnvironment" reporters
    if (context.expression instanceof BlockMorph) {
        this.compileBlockReferences(context, upvar);
    }

    // identify global custom block matching the specified label
    matches = ide.stage.globalBlocks.filter(def =>
        def.abstractBlockSpec() === label
    );
    if (matches.length > 1) {
        throw new Error(
            'several block definitions\nalready match this label'
        );
    } else if (matches.length === 1) {
        // update the existing global definition with the context body
        def = matches[0];
        this.doSetBlockAttribute(
            'definition',
            def.blockInstance().reify(),
            context
        );

        // create the reference to the new block
        vars.addVar(upvar);
        vars.setVar(upvar, def.blockInstance().reify());
        return;
    }

    // make a new custom block definition
    def = new CustomBlockDefinition('BYOB'); // haha!
    def.type = type;
    def.category = 'other';
    def.isGlobal = true;
    def.setBlockDefinition(context);
    def.setBlockLabel(label);
    ide.stage.globalBlocks.push(def);

    // make sure the spec is unique
    spec = def.spec;
    while (rcvr.doubleDefinitionsFor(def).length > 0) {
        count += 1;
        def.spec = spec + ' (' + count + ')';
    }

    // update the IDE
    ide.flushPaletteCache();
    ide.categories.refreshEmpty();
    ide.refreshPalette();
    rcvr.recordUserEdit(
        'palette',
        'custom block',
        def.isGlobal ? 'global' : 'local',
        'new',
        def.abstractBlockSpec()
    );

    // create the reference to the new block
    vars.addVar(upvar);
    vars.setVar(upvar, def.blockInstance().reify());
};

Process.prototype.compileBlockReferences = function (context, varName) {
    // private - replace self references inside the definition body
    // with "this script" reporters
    var report, declare, assign, self;

    function block(selector) {
        return SpriteMorph.prototype.blockForSelector(selector);
    }

    if (context.expression.allChildren().some(any =>
        any.selector === 'reportGetVar' && any.parentThatIsA(RingMorph)
    )) {
        if (context.expression instanceof ReporterBlockMorph) {
            // turn into a REPORT script
            report = block('doReport');
            report.replaceInput(
                report.inputs()[0],
                context.expression.fullCopy()
            );
            context.expression = report;
        }
        // add a script var to capture the outer definition
        // don't replace any references, because they now should just work
        self = block('reportEnvironment');
        self.inputs()[0].setContents(['script']);
        declare = block('doDeclareVariables');
        declare.inputs()[0].setContents([varName]);
        assign = block('doSetVar');
        assign.inputs()[0].setContents(varName);
        assign.replaceInput(assign.inputs()[1], self);
        declare.nextBlock(assign);
        assign.nextBlock(context.expression.fullCopy());
        context.expression = declare;
        return;
    }

    if (context.expression instanceof BlockMorph) {
        context.expression.forAllChildren(morph => {
            var ref;
            if (morph.selector === 'reportGetVar' &&
                (morph.blockSpec === varName))
            {
                ref = block('reportEnvironment');
                ref.inputs()[0].setContents(['script']);
                if (morph.parent instanceof SyntaxElementMorph) {
                    morph.parent.replaceInput(morph, ref);
                } else {
                    context.expression = ref;
                }
            }
        });
    }
};

Process.prototype.doDeleteBlock = function (context) {
    var rcvr = this.blockReceiver(),
        ide = rcvr.parentThatIsA(IDE_Morph),
        stage = ide.stage,
        expr, def, method, idx;

    this.assertType(context, ['command', 'reporter', 'predicate']);
    expr = context.expression;
    if (!expr.isCustomBlock) {
        throw new Error('expecting a custom block\nbut getting a primitive');
    }
    def = expr.isGlobal ? expr.definition : rcvr.getMethod(expr.semanticSpec);
    rcvr.deleteAllBlockInstances(def);
    if (def.isGlobal) {
        idx = stage.globalBlocks.indexOf(def);
        if (idx !== -1) {
            stage.globalBlocks.splice(idx, 1);
        }
    } else {
        // delete local definition
        idx = rcvr.customBlocks.indexOf(def);
        if (idx !== -1) {
            rcvr.customBlocks.splice(idx, 1);
        }
        // refresh instances of inherited method, if any
        method = rcvr.getMethod(def.blockSpec);
        if (method) {
            rcvr.allDependentInvocationsOf(method.blockSpec).forEach(
                block => block.refresh(method)
            );
        }
    }

    // update the IDE
    ide.flushPaletteCache();
    ide.categories.refreshEmpty();
    ide.refreshPalette();
    rcvr.recordUserEdit(
        'palette',
        'custom block',
        def.isGlobal ? 'global' : 'local',
        'delete definition',
        def.abstractBlockSpec()
    );
};
*/

Process.prototype.reportAttributeOf = function (attribute, name) {
    // hyper-dyadic
    // note: specifying strings in the left input only accesses
    // sprite-local variables. Attributes such as "width", "direction" etc.
    // can only be queried via the dropdown menu and are, therefore, not
    // reachable as dyadic inputs
    return this.hyperDyadic((att, obj
    ) => this.reportBasicAttributeOf(
    att, obj), attribute, name);
};

Process.prototype.reportBasicAttributeOf = function (attribute, name) {
    var thisObj = this.blockReceiver(),
        thatObj,
        stage;

    if (name instanceof Context && attribute instanceof Context) {
        return this.reportContextFor(attribute, name);
    }
    if (thisObj) {
        this.assertAlive(thisObj);
        stage = thisObj.parentThatIsA(StageMorph);
        if (name instanceof Context) {
            thatObj = name;
        } else if (stage.name === name) {
            thatObj = stage;
        } else {
            thatObj = this.getOtherObject(name, thisObj, stage);
        }
        if (isSnapObject(thatObj)) {
            this.assertAlive(thatObj);
            if (attribute instanceof BlockMorph) { // a "wish"
            	return this.reportContextFor(
             	   this.reify(
                		thatObj.getMethod(attribute.semanticSpec)
                        	.blockInstance(),
                		new List()
                	),
                 	thatObj
                );
            }
            if (attribute instanceof Context) {
                return this.reportContextFor(attribute, thatObj);
            }
            if (isString(attribute)) {
                return thatObj.variables.getVar(attribute);
            }
            switch (this.inputOption(attribute)) {
            case 'position':
                return thatObj.xPosition ?
                    new List([thatObj.xPosition(), thatObj.yPosition()])
                    : '';
            case 'x position':
                return thatObj.xPosition ? thatObj.xPosition() : '';
            case 'y position':
                return thatObj.yPosition ? thatObj.yPosition() : '';
            case 'direction':
                return thatObj.direction ? thatObj.direction() : '';
            case 'costume #':
                return thatObj.getCostumeIdx();
            case 'costume name':
                return thatObj.costume ? thatObj.costume.name
                        : thatObj instanceof SpriteMorph ? localize('Turtle')
                                : localize('Empty');
            case 'size':
                return thatObj.getScale ? thatObj.getScale() : '';
            case 'volume':
                return thatObj.getVolume();
            case 'balance':
                return thatObj.getPan();
            case 'width':
                if (thatObj instanceof StageMorph) {
                    return thatObj.dimensions.x;
                }
                this.assertType(thatObj, 'sprite');
                return thatObj.width() / stage.scale;
            case 'height':
                if (thatObj instanceof StageMorph) {
                    return thatObj.dimensions.y;
                }
                this.assertType(thatObj, 'sprite');
                return thatObj.height() / stage.scale;
            case 'left':
                return thatObj.xLeft();
            case 'right':
                return thatObj.xRight();
            case 'top':
                return thatObj.yTop();
            case 'bottom':
                return thatObj.yBottom();
            }
        }
        if (isString(attribute)) {
            return thatObj.outerContext.variables.getVar(attribute);
        }
        if (this.inputOption(attribute) === 'variables') {
            return new List((thatObj instanceof Context ?
                thatObj.outerContext
                : thatObj).variables.allNames()
            );
        }
    }
    return '';
}; Process.prototype.reportGet = function (query) {var thisObj = this.blockReceiver(), stage, objName; if (thisObj) {switch (this.inputOption(query)) {case 'draggable?': return thisObj.isDraggable; case 'name':
return thisObj.name; case 'rotation style': return thisObj.rotationStyle || 0; case 'synchronous?': return thisObj.rotatesWithAnchor; case 'direction': return thisObj.direction(); case 'x position': return (
thisObj.xPosition()); case 'y position': return thisObj.yPosition(); case 'costume #': return thisObj.getCostumeIdx(); case 'costumes': return thisObj.reportCostumes(); case 'current costume': return (thisObj
).costume; case 'hidden?': return !thisObj.isVisible; case 'layer': stage = thisObj.parentThatIsA(StageMorph); result = stage.children.filter(each => each instanceof SpriteMorph); return (result.indexOf(thisObj
) + 1); case 'size': return (thisObj.scale * 100); case 'brightness effect': case 'color effect': case 'fisheye effect': case 'ghost effect': case 'mosaic effect': case 'pixelate effect': case 'whirl effect':
case 'comic effect': case 'negative effect': case 'confetti effect': case 'duplicate effect': case 'saturation effect': case 'red effect': case 'green effect': case 'blue effect': return thisObj.getEffect(
(this.inputOption(query)).split(' effect')[0]); case 'instrument': return this.instrument; case 'sounds': return thisObj.sounds; case 'tempo': return world.children[0].stage.tempo; case 'volume': return (
thisObj).volume; case 'pen RGBA': return thisObj.color; case 'pen down?': return thisObj.isDown; case 'pen size': return thisObj.size; case 'anchor': return (thisObj.anchor || ''); case 'children':
return new List(thisObj.specimens ? thisObj.specimens() : []); case 'parent': return thisObj.exemplar || ''; case 'parts': return new List(thisObj.parts); default: return '';};} else {return '';};};
Process.prototype.myGettables = function (query) {var thisObj = this.blockReceiver(); switch (query) {case 'temporary?': return thisObj.isTemporary || false; case 'clones': stage = thisObj.parentThatIsA(
StageMorph); objName = thisObj.name || thisObj.cloneOriginName; return new List(stage.children.filter(each => each.isTemporary && (each !== thisObj) && (each.cloneOriginName === objName))); case 'other clones':
return thisObj.isTemporary ? this.reportGet(['clones']) : new List(); case 'neighbors': return thisObj.neighbors(); case 'dangling?': return !thisObj.rotatesWithAnchor; case 'rotation x': return thisObj.xPosition(
); case 'rotation y': return thisObj.yPosition(); case 'center x': return thisObj.xCenter(); case 'center y': return thisObj.yCenter(); case 'left': return thisObj.xLeft(); case 'right': return thisObj.xRight(
); case 'top': return thisObj.yTop(); case 'bottom': return thisObj.yBottom(); case 'stage': return thisObj.parentThatIsA(StageMorph); case 'scripts': return new List(thisObj.scripts.children.filter(each => (
each instanceof BlockMorph)).map(each => each.fullCopy().reify())); case 'blocks': return new List(thisObj.parentThatIsA(StageMorph).globalBlocks.concat(thisObj.allBlocks(true)).filter(def => !(def.isHelper)
).map(def => (def.blockInstance()).reify()).concat(SpriteMorph.prototype.categories.reduce((blocks, category) => blocks.concat(thisObj.getPrimitiveTemplates(category).filter((each => (each instanceof BlockMorph
)) && !(each instanceof HatBlockMorph)).map(block => {let instance = block.fullCopy(); instance.isTemplate = false; return instance.reify();})), [])));
        case 'categories': return new List(thisObj.allCategories());
        case 'width':
            if (thisObj instanceof StageMorph) {
                return thisObj.dimensions.x;
            }
            stage = thisObj.parentThatIsA(StageMorph);
            return stage ? thisObj.width() / stage.scale : 0;
        case 'height':
            if (thisObj instanceof StageMorph) {
                return thisObj.dimensions.y;
            }
            stage = thisObj.parentThatIsA(StageMorph);
            return stage ? thisObj.height() / stage.scale : 0;
        default: return '';
    };
};

Process.prototype.reportObject = function (name) {
    if (this.enableHyperOps) {
        if (name instanceof List) {
            return name.map(each => this.reportObject(each));
    };}; var thisObj = this.blockReceiver(), thatObj, stage;

    if (thisObj) {
        this.assertAlive(thisObj);
        stage = thisObj.parentThatIsA(StageMorph);
        if (stage.name === name) {
            thatObj = stage;
        } else if (name === 'allSprites') {
            stage = thisObj.parentThatIsA(StageMorph
            ); return new List(stage.children.filter(
            each => each instanceof SpriteMorph));
        } else {
            thatObj = this.getOtherObject(name,
            thisObj, stage);}; if (thatObj) {
            this.assertAlive(thatObj);
        };  return thatObj;};};

Process.prototype.doSet = function (attribute, value) {var name, rcvr, ide; rcvr = this.blockReceiver(); this.assertAlive(rcvr); if (!((attribute instanceof Context) || (attribute instanceof Array)) || (attribute
instanceof Context && !(attribute.expression.selector === 'reportGet'))) {if (attribute.expression.selector === 'xPosition') {rcvr.setXPosition(value);} else if (attribute.expression.selector === 'yPosition') {
rcvr.setYPosition(value);} else if (attribute.expression.selector === 'direction') {rcvr.setHeading(value);} else if (attribute.expression.selector === 'getCostumeIdx') {rcvr.doSwitchToCostume(
rcvr.costumes.asArray()[value - 1]);} else if (attribute.expression.selector === 'getPenDown') {rcvr.down = value;} else {throw new Error(localize('Unsupported Attribute.'));}} else {
    name = attribute instanceof Context ?
            attribute.expression.inputs()[0].evaluate()
                : attribute;
    if (name instanceof Array) {name = name[0];};
    switch (name) {
    case 'anchor':
    case 'my anchor':
        this.assertType(rcvr, 'sprite');
        if (value instanceof SpriteMorph) {
            if (!rcvr.enableNesting || contains(rcvr.allParts(), value)) {throw new Error(localize('unable to nest\n(disabled or circular?)'));};
            rcvr.detachFromAnchor(); value.attachPart(rcvr);
        } else {
            rcvr.detachFromAnchor();
        };
        break;
    case 'parent':
    case 'my parent':
        this.assertType(rcvr, 'sprite');
        value = value instanceof SpriteMorph ? value : null;
        rcvr.setExemplar(value, true);
        break;
    case 'temporary?':
    case 'my temporary?':
        this.assertType(rcvr, 'sprite');
        this.assertType(value, 'Boolean');
        if (value) {
            rcvr.release();
        } else {
            rcvr.perpetuate();
        };  break; case 'name':
    case 'my name':
        this.assertType(rcvr, ['sprite', 'stage']);
        this.assertType(value, ['text', 'number']);
        ide = rcvr.parentThatIsA(IDE_Morph);
        if (ide) {
            rcvr.setName(
                ide.newSpriteName(value.toString(), rcvr)
            );  ide.spriteBar.nameField.setContents(
                ide.currentSprite.name.toString()
            );
        };  break;
    case 'dangling?':
    case 'my dangling?':
        this.assertType(rcvr, 'sprite');
        this.assertType(value, 'Boolean');
        rcvr.rotatesWithAnchor = !value;
        rcvr.version = Date.now();
        break;
    case 'draggable?':
    case 'my draggable?':
        this.assertType(rcvr, 'sprite');
        this.assertType(value, 'Boolean');
        rcvr.isDraggable = value;
        // update padlock symbol in the IDE:
        ide = rcvr.parentThatIsA(IDE_Morph);
        if (ide) {
            ide.spriteBar.children.forEach(each => {
                if (each.refresh) {
                    each.refresh();
                }
            });
        };  rcvr.version = Date.now();
        break;
    case 'rotation style':
    case 'my rotation style':
        this.assertType(rcvr, 'sprite');
        this.assertType(+value, 'number');
        if (!contains([0, 1, 2], +value)) {
            return; // maybe throw an error msg
        }
        rcvr.changed();
        rcvr.rotationStyle = +value;
        rcvr.fixLayout();
        rcvr.rerender();
        // update padlock symbol in the IDE:
        ide = rcvr.parentThatIsA(IDE_Morph);
        if (ide) {
            ide.spriteBar.children.forEach(each => {
                if (each.refresh) {
                    each.refresh();
                }
            });
        };  rcvr.version = Date.now();
        break;
    case 'rotation x':
    case 'my rotation x':
        this.assertType(rcvr, 'sprite');
        this.assertType(value, 'number');
        rcvr.setRotationX(value);
        break;
    case 'rotation y':
    case 'my rotation y':
        this.assertType(rcvr, 'sprite');
        this.assertType(value, 'number');
        rcvr.setRotationY(value);
        break;
    case 'microphone modifier':
        this.setMicrophoneModifier(value);
        break;
    default:
        throw new Error(
            '"' + localize(name) + '" ' + localize('is read-only')
        );
    };};};

Process.prototype.reportContextFor = function (context, otherObj) {
var result = copy(context), receiverVars, rootVars; if ((otherObj
) instanceof Context) {result.outerContext = otherObj.outerContext;
result.variables.parentFrame = otherObj.outerContext.variables;
result.receiver = otherObj.receiver; return result;}; (result
).receiver = otherObj; if (!(result.outerContext)) {(result
).outerContext = new Context; (result.variables.parentFrame
) = result.outerContext.variables;}; result.outerContext = (
copy(result.outerContext)); result.outerContext.variables = (
copy(result.outerContext.variables)); (result.outerContext
).receiver = otherObj; if ((result.outerContext.variables
).parentFrame) {rootVars = (result.outerContext.variables
).parentFrame; receiverVars = copy(otherObj.variables);
receiverVars.parentFrame = rootVars; (result.outerContext
).variables.parentFrame = receiverVars;} else {(result
).outerContext.variables.parentFrame = otherObj.variables;
}; return result;};

Process.prototype.reportMousePosition = function () {
    var world, pos;
    if (this.homeContext.receiver) {
        world = this.homeContext.receiver.world();
        if (world) {
            pos = this.homeContext.receiver.snapPoint(world.hand.position());
            return new List([pos.x, pos.y]);
        };
    };  return new List([0, 0]);};

Process.prototype.reportMouseX = function () {
    var world;
    if (this.homeContext.receiver) {
        world = this.homeContext.receiver.world();
        if (world) {
            return this.homeContext.receiver.snapPoint(world.hand.position()).x;
        };
    };  return 0;};

Process.prototype.reportMouseY = function () {
    var world;
    if (this.homeContext.receiver) {
        world = this.homeContext.receiver.world();
        if (world) {
            return this.homeContext.receiver.snapPoint(world.hand.position()).y;
        };
    };  return 0;};

Process.prototype.reportMouseButton = function (
button) {var world; if (this.homeContext.receiver
) {world = this.homeContext.receiver.world(); if (
world) {return world.hand.mouseButton === (this
).inputOption(button);};}; return false;};

Process.prototype.reportKeyPressed = function (keyString) {
    // hyper-monadic
    var stage;
    if (this.homeContext.receiver) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (stage) {
            if (this.inputOption(keyString) === 'any key') {
                return Object.keys(stage.keysPressed).length > 0;
            }
            if (keyString instanceof List && this.enableHyperOps) {
                return keyString.map(
                    each => stage.keysPressed[each] !== undefined
                );
            }
            return stage.keysPressed[keyString] !== undefined;
        };
    };  return false;};

Process.prototype.doChangeTimer = function (option) {
var stage; if (this.homeContext.receiver) {stage = (
this.homeContext.receiver.parentThatIsA(StageMorph));
if (stage) {stage.changeTimer(option);};};}; (Process
).prototype.doSetTimer = function (option, value) {
var stage; if (this.homeContext.receiver) {stage = (
this.homeContext.receiver.parentThatIsA(StageMorph)
); if (stage) {stage.setTimer(option, value);};};};

// Process Dates and times in Snap
Process.prototype.reportDate = function (datefn) {
    var currDate, func, result,
        inputFn = this.inputOption(datefn),
        // Map block options to built-in functions
        dateMap = {
            'year' : 'getFullYear',
            'month' : 'getMonth',
            'date': 'getDate',
            'day of week' : 'getDay',
            'hour' : 'getHours',
            'minute' : 'getMinutes',
            'second' : 'getSeconds',
            'time in milliseconds' : 'getTime'
        };

    if (!dateMap[inputFn]) {if (datefn == 'days since 2000') {return ((Date.now() - 946627200000) / 86400000);} else {return '';};};
    currDate = new Date();
    func = dateMap[inputFn];
    result = currDate[func]();

    // Show months as 1-12 and days as 1-7
    if (inputFn === 'month' || inputFn === 'day of week') {result += 1;};
    return result;
};

// Process battery manager api primitive

Process.prototype.getBatteryChargingTime = function (option) {return (isNil(world.batteryAPI) ? 0 : (((this
).inputOption(option) === 'charging') ? world.batteryAPI.chargingTime : world.batteryAPI.dischargingTime));};

// Process video motion detection primitives

Process.prototype.doSetVideoTransparency = function (factor) {
    var stage;
    if (this.homeContext.receiver) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (stage) {
            stage.projectionTransparency = Math.max(0, Math.min(100, factor));
        }
    }
};

Process.prototype.doSetVideoToMode = function anonymous (mode) {
var stage = this.homeContext.receiver.parentThatIsA(StageMorph);
switch (this.inputOption(mode)) {case 'on': case 'on flipped':
this.startVideo(stage); stage.mirrorVideo = (!(this.inputOption(
mode) === 'on flipped')); break; default: stage.stopProjection(
); break;};}; /* Like in Scratch 3.0, Snavanced! is great. */

Process.prototype.reportVideo = function (attribute, name) {
    // hyper-monadic
    var thisObj = this.blockReceiver(),
        stage = thisObj.parentThatIsA(StageMorph),
        thatObj;

    if (!stage.projectionSource || !stage.projectionSource.stream) {
        // wait until video is turned on
        if (!this.context.accumulator) {
            this.context.accumulator = true; // started video
            stage.startVideo();
        }
        this.pushContext('doYield');
        this.pushContext();
        return;
    }

    if (this.enableHyperOps) {
        if (name instanceof List) {
            return name.map(each => this.reportVideo(attribute, each));
        }
    }
    thatObj = this.getOtherObject(name, thisObj, stage);
    switch (this.inputOption(attribute)) {
    case 'motion':
        if (thatObj instanceof SpriteMorph) {
            stage.videoMotion.getLocalMotion(thatObj);
            return thatObj.motionAmount;
        }
        stage.videoMotion.getStageMotion();
        return stage.videoMotion.motionAmount;
    case 'direction':
        if (thatObj instanceof SpriteMorph) {
            stage.videoMotion.getLocalMotion(thatObj);
            return thatObj.motionDirection;
        }
        stage.videoMotion.getStageMotion();
        return stage.videoMotion.motionDirection;
    case 'snap':
        if (thatObj instanceof SpriteMorph) {
            return thatObj.projectionSnap();
        }
        return stage.projectionSnap();
    }
    return -1;
};

Process.prototype.startVideo = function(stage) {
    // interpolated
    if (this.reportGlobalFlag('video capture')) {return; }
    if (!stage.projectionSource || !stage.projectionSource.stream) {
        // wait until video is turned on
        if (!this.context.accumulator) {
            this.context.accumulator = true; // started video
            stage.startVideo();
        }
    }
    this.pushContext('doYield');
    this.pushContext();
};

// Process code mapping

/*
    for generating textual source code using
    blocks - not needed to run or debug Snap
*/

Process.prototype.doMapCodeOrHeader = function (aContext, anOption, aString) {
    if (this.inputOption(anOption) === 'code') {
        return this.doMapCode(aContext, aString);
    }
    if (this.inputOption(anOption) === 'header') {
        return this.doMapHeader(aContext, aString);
    }
    throw new Error(
        ' \'' + anOption + '\'\n' + localize('is not a valid option')
    );
};

Process.prototype.doMapHeader = function (aContext, aString) {
    if (aContext instanceof Context) {
        if (aContext.expression instanceof SyntaxElementMorph) {
            return aContext.expression.mapHeader(aString || '');
        }
    }
};

Process.prototype.doMapCode = function (aContext, aString) {
    if (aContext instanceof Context) {
        if (aContext.expression instanceof SyntaxElementMorph) {
            return aContext.expression.mapCode(aString || '');
        }
    }
};

Process.prototype.doMapValueCode = function (type, aString) {
    var tp = this.inputOption(type);
    switch (tp) {
    case 'String':
        StageMorph.prototype.codeMappings.string = aString || '<#1>';
        break;
    case 'Number':
        StageMorph.prototype.codeMappings.number = aString || '<#1>';
        break;
    case 'true':
        StageMorph.prototype.codeMappings.boolTrue = aString || 'true';
        break;
    case 'false':
        StageMorph.prototype.codeMappings.boolFalse = aString || 'true';
        break;
    default:
        throw new Error(
            localize('unsupported data type') + ': "' + tp + '"'
        );
    }

};

Process.prototype.doMapListCode = function (part, kind, aString) {
    var key1 = '',
        key2 = 'delim';

    if (this.inputOption(kind) === 'parameters') {
        key1 = 'parms_';
    } else if (this.inputOption(kind) === 'variables') {
        key1 = 'tempvars_';
    }

    if (this.inputOption(part) === 'list') {
        key2 = 'list';
    } else if (this.inputOption(part) === 'item') {
        key2 = 'item';
    }

    StageMorph.prototype.codeMappings[key1 + key2] = aString || '';
};

Process.prototype.reportMappedCode = function (aContext) {
if (aContext instanceof Context) {if ((aContext.expression
) instanceof SyntaxElementMorph) {return ((aContext
).expression).mappedCode();};};   return '';};

// Process music primitives

Process.prototype.doRest = function (
beats) {var tempo = (this.reportTempo(
)); this.doWait((60 / tempo) * beats);};

Process.prototype.reportTempo = function () {
    var stage;
    if (this.homeContext.receiver) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (stage) {return stage.getTempo();};}; return 0;};

Process.prototype.doChangeTempo = function (delta) {
    var stage;
    if (this.homeContext.receiver) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (stage) {
            stage.changeTempo(delta);
        };};};

Process.prototype.doSetTempo = function (bpm) {
    var stage;
    if (this.homeContext.receiver) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (stage) {
            stage.setTempo(bpm);
        };};};

Process.prototype.doPlayNote = function (pitch, beats) {
    var tempo = this.reportTempo();
    this.doPlayNoteForSecs(
        parseFloat(pitch || '0'),
        60 / tempo * parseFloat(beats || '0')
    );};

Process.prototype.doPlayNoteForSecs = function (pitch, secs) {
    // interpolated
    var rcvr = this.blockReceiver();
    if (!this.context.startTime) {
        rcvr.setVolume(rcvr.getVolume()); // b/c Chrome needs lazy init
        rcvr.setPan(rcvr.getPan()); // b/c Chrome needs lazy initialization
        this.context.startTime = Date.now();
        this.context.activeNote = new Note(pitch);
        this.context.activeNote.play(
            this.instrument,
            rcvr.getGainNode(),
            rcvr.getPannerNode()
        );
    }; if ((Date.now() - this.context.startTime) >= (secs * 1000)) {
        if (this.context.activeNote) {
            this.context.activeNote.stop();
            this.context.activeNote = null;
        }; return null;
    };  this.pushContext('doYield');
    this.pushContext();};

Process.prototype.doPlayFrequency = function (hz, secs) {
    this.doPlayFrequencyForSecs(
        parseFloat(hz || '0'),
        parseFloat(secs || '0')
    );};

Process.prototype.doPlayFrequencyForSecs = function (hz, secs) {
    // interpolated
    var rcvr = this.blockReceiver();
    if (!this.context.startTime) {
        rcvr.setVolume(rcvr.getVolume()); // b/c Chrome needs lazy init
        rcvr.setPan(rcvr.getPan()); // b/c Chrome needs lazy initialization
        this.context.startTime = Date.now();
        this.context.activeNote = new Note;
        this.context.activeNote.frequency = hz;
        this.context.activeNote.play(
            this.instrument,
            rcvr.getGainNode(),
            rcvr.getPannerNode()
        );
    }; if ((Date.now() - this.context.startTime) >= (secs * 1000)) {
        if (this.context.activeNote) {
            this.context.activeNote.stop();
            this.context.activeNote = null;
        }; return null;
    };  this.pushContext('doYield');
    this.pushContext();};

Process.prototype.doSetInstrument = function (num) {var textInstrument = undefined; if (!(this.reportTypeOf(num) === 'number')) {textInstrument = world.childThatIsA(IDE_Morph).mids.filter(
mid => (mid.name === num.toString()))[0];}; if (!isNil(textInstrument)) {this.instrument = (world.childThatIsA(IDE_Morph).mids.indexOf(textInstrument) + 1);} else {this.instrument = Math.min(
Math.max(asANum(num), 1), world.childThatIsA(IDE_Morph).mids.length);}; this.blockReceiver().instrument = Math.min(Math.max(this.instrument, 1), world.childThatIsA(IDE_Morph).mids.length
); if (this.receiver.freqPlayer) {this.receiver.freqPlayer.setInstrument(Math.min(Math.max(this.instrument, 1), 4));};}; /* Now you can set the instrument using text too. :-) */

/* var aMorph = new SoundVisualizerMorph(list); aMorph.setHeight(360); aMorph.setWidth(480); return new Costume(aMorph.fullImage()); var list = [], i = 0, n = 39/4; while (i < 44100) {list.push(
Math.sin(radians((i + 1) * (2 ** n)) / 122.5)); i++;}; var list = [], i = 0; while (i < 44100) {list.push(Math.sin(2 * radians((i + 1) * (2 ** ((n - 59) / 12))))); i++;}; return new List(list); */

// Process image processing primitives

Process.prototype.reportGetImageAttribute = function (choice, name) {
    if (this.enableHyperOps) {
        if (name instanceof List) {
            return name.map(each => this.reportGetImageAttribute(choice, each));
        };
    };

    var cst = (this.costumeNamed(name) || new Costume),
        option = this.inputOption(choice);

    switch (option) {
    case 'name':
        return cst.name;
    case 'width':
        return cst.width();
    case 'height':
        return cst.height();
    case 'pixels':
        return cst.rasterized().pixels();
    default:
        return cst;
    }
};

Process.prototype.reportNewCostumeStretched = function (name, xP, yP) {
    var cst;
    if (name instanceof List) {
        return this.reportNewCostume(name, xP, yP);
    }
    cst = this.costumeNamed(name);
    if (!cst) {
        return new Costume();
    }
    if (!isFinite(+xP * +yP) || isNaN(+xP * +yP)) {
        throw new Error(
            'expecting a finite number\nbut getting Infinity or NaN'
        );
    }
    return cst.stretched(
        Math.round(cst.width() * +xP / 100),
        Math.round(cst.height() * +yP / 100)
    );
};

Process.prototype.reportNewCostumeSkewed = function (name, angle, factor) {
    var cst = this.costumeNamed(name);
    if (!cst) {
        return new Costume();
    }
    if (!isFinite(+angle * +factor) || isNaN(+angle * +factor)) {
        throw new Error(
            'expecting a finite number\nbut getting Infinity or NaN'
        );
    }
    return cst.skewed(+angle, +factor);
};

Process.prototype.costumeNamed = function (name) {
    // private
    if (name instanceof Costume) {
        return name;
    }
    if (typeof name === 'number') {
        return this.blockReceiver().costumes.at(name);
    }
    if (this.inputOption(name) === 'current') {
        return this.blockReceiver().costume;
    }
    return detect(
        this.blockReceiver().costumes.asArray(),
        c => c.name === name.toString()
    );
};

Process.prototype.reportNewCostume = function (pixels, width, height, name) {var myself = this; if (pixels instanceof List ? (pixels.fullCopy().asArray().filter(color => myself.reportTypeOf(color) === 'color'
).length === pixels.length()) : false) {if (asABool(localStorage['-snap-setting-backToOldPixelGetting'])) {return this.reportNewCostume(pixels.fullCopy(), width, height, name);} else {return this.reportNewCostume(
new List(pixels.fullCopy().asArray().map(color => new List([color.r, color.g, color.b, (color.a * 255)]))), width, height, name);};} else {var rcvr, stage, canvas, ctx, src, dta, i, k, px;

    this.assertType(pixels, 'list');
    if (this.inputOption(width) === 'current') {
        rcvr = this.blockReceiver();
        stage = rcvr.parentThatIsA(StageMorph);
        width = rcvr.costume ? rcvr.costume.width() : stage.dimensions.x;
    }
    if (this.inputOption(height) === 'current') {
        rcvr = rcvr || this.blockReceiver();
        stage = stage || rcvr.parentThatIsA(StageMorph);
        height = rcvr.costume ? rcvr.costume.height() : stage.dimensions.y;
    }
    width = Math.abs(Math.floor(+width));
    height = Math.abs(Math.floor(+height));
    if (width <= 0 || height <= 0) {
        return new Costume();
    }
    if (!isFinite(width * height) || isNaN(width * height)) {
       throw new Error(
           'expecting a finite number\nbut getting Infinity or NaN'
       );
    }

    canvas = newCanvas(new Point(width, height), true);
    ctx = canvas.getContext('2d');
    src = pixels.itemsArray();
    dta = ctx.createImageData(width, height);
    for (i = 0; i < src.length; i += 1) {
        px = src[i] instanceof List ? src[i].itemsArray() : [src[i]];
        for (k = 0; k < 3; k += 1) {
            dta.data[(i * 4) + k] = px[k] === undefined ? +px[0] : +px[k];
        }
        dta.data[i * 4 + 3] = (px[3] === undefined ? 255 : +px[3]);
    }
    ctx.putImageData(dta, 0, 0);
    return new Costume(
        canvas,
        name || (rcvr || this.blockReceiver()).newCostumeName(
            localize('costume')
        )
    );
};};

Process.prototype.reportPentrailsAsSVG = function () {
    // interpolated
    var rcvr, stage, svg, acc, offset;

    if (!this.context.accumulator) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (!stage.trailsLog.length) {
            throw new Error (localize(
                'there are currently no\nvectorizable pen trail segments'
            ));
        };  svg = stage.trailsLogAsSVG();
        this.context.accumulator = {
            img : new Image,
            rot : svg.rot,
            ready : false
        };  acc = this.context.accumulator;
        acc.img.onload = () => acc.ready = true;
        acc.img.src = 'data:image/svg+xml,' + svg.src;
        acc.img.rot = svg.rotationShift;
    } else if (this.context.accumulator.ready) {
        offset = ZERO;
        rcvr = this.blockReceiver();
        if (rcvr instanceof SpriteMorph) {
            offset = new Point(rcvr.xPosition(), -rcvr.yPosition());
        };  this.returnValueToParentContext(
            new SVG_Costume(
                this.context.accumulator.img,
                this.blockReceiver().newCostumeName(localize('Costume')),
                this.context.accumulator.rot.translateBy(offset)
            )
        );  return;
    };  this.pushContext();};

// Process constant input options

Process.prototype.inputOption = function (data) {
return (data instanceof Array) ? data[0] : data;};

// Process stack

Process.prototype.pushContext = function (expression, outerContext) {
    this.context = new Context(
        this.context,
        expression,
        outerContext || (this.context ? this.context.outerContext : null),
            // for tail call elimination
        this.context ? // check needed due to tail call elimination
                this.context.receiver : this.homeContext.receiver
    );
};

Process.prototype.popContext = function () {
if (this.context) {this.context.stopMusic(
);}; this.context = (this.context ? (this
).context.parentContext : null);};

Process.prototype.returnValueToParentContext = function (value) {if (!(value === undefined)) {var target = (this.context ? (this.context.parentContext || this.homeContext) : this.homeContext
); target.addInput(value); /* if the script has been clicked on by the user in visible stepping mode, show the result of evaluating a reporter in a speech balloon. Thanks, Vic! */ if ((this
).enableSingleStepping && this.isClicked && (this.context.expression instanceof ReporterBlockMorph)) {let anchor = this.context.expression; if (!anchor.world()) {/* find a place to display the
result of custom reporters */ anchor = this.topBlock;}; if (value instanceof List) {anchor.showBubble(value.isTable() ? new TableFrameMorph(new TableMorph(value, 10)) : new ListWatcherMorph(
value), this.exportResult, this.receiver);} else {anchor.showBubble(value, this.exportResult, this.receiver);};};};}; Process.prototype.reportStackSize = function () {return (this.context ? (this
).context.stackSize() : 0);}; Process.prototype.reportFrameCount = function anonymous () {return this.frameCount;}; Process.prototype.reportYieldCount = function anonymous () {return this.yieldCount;};

// Process single-stepping

Process.prototype.flashContext = function () {
    var expr = this.context.expression;
    if (this.enableSingleStepping &&
            !this.isAtomic &&
            expr instanceof SyntaxElementMorph &&
            !(expr instanceof CommandSlotMorph) &&
            !this.context.isFlashing &&
            expr.world() &&
            !(expr instanceof ColorSlotMorph)) {
        this.unflash();
        expr.flash();
        this.context.isFlashing = true;
        this.flashingContext = this.context;
        if (this.flashTime > 0 && (this.flashTime <= 0.5)) {
            this.pushContext('doIdle');
            this.context.addInput(this.flashTime);
        } else {
            this.pushContext('doInterrupt');
        }
        return true;
    }
    return false;
};

Process.prototype.flashPausedContext = function () {
    var flashable = this.context ? this.context.lastFlashable() : null;
    if (flashable) {
        this.unflash();
        flashable.expression.flash();
        flashable.isFlashing = true;
        this.flashingContext = flashable;
    };
};

Process.prototype.doInterrupt = function () {
    this.popContext();
    if (!this.isAtomic) {
        this.isInterrupted = true;
    };
};

Process.prototype.doIdle = function (secs) {
    if (!this.context.startTime) {
        this.context.startTime = Date.now();
    };  if ((Date.now() - this.context.startTime) < (secs * 1000)) {
        this.pushContext('doInterrupt');
        return;
    };  this.popContext();
};

Process.prototype.unflash = function () {
    if (this.flashingContext) {
        this.flashingContext.expression.unflash();
        this.flashingContext.isFlashing = false;
        this.flashingContext = null;
    };
};

// Process: Compile (as of yet simple) block scripts to JS

/*
	with either only explicit formal parameters or a specified number of
	implicit formal parameters mapped to empty input slots
	*** highly experimental and heavily under construction ***
*/

Process.prototype.reportCompiled = function (context, implicitParamCount) {return (new JSCompiler(this)).compileFunction(context, implicitParamCount);};

Process.prototype.capture = function (aContext) {if (aContext instanceof Context) {var proc = new Process(this.topBlock, this.receiver); var clos = new Context(aContext.parentContext, aContext.expression,
aContext.outerContext, aContext.receiver); clos.variables = aContext.variables.fullCopy(); clos.variables.root().parentFrame = proc.variables; proc.context = clos; return proc;} else {return null;};};

Process.prototype.getVarNamed = function (name) {
    // private - special form for compiled expressions
    // DO NOT use except in compiled methods!
    // first check script vars, then global ones
    var frame = this.homeContext.variables.silentFind(name) ||
            this.context.variables.silentFind(name),
        value;  if (frame) {
        value = frame.vars[name].value;
        return (value === 0 ? 0
                : value === false ? false
                        : value === '' ? ''
                            : value || 0); // don't return null
    };  throw new Error(
        localize('a variable of name \'')
            + name
            + localize('\'\ndoes not exist in this context')
    );};

Process.prototype.setVarNamed = function (name, value) {
    // private - special form for compiled expressions
    // incomplete, currently only sets named vars
    // DO NOT use except in compiled methods!
    // first check script vars, then global ones
    var frame = this.homeContext.variables.silentFind(name) ||
            this.context.variables.silentFind(name);
    if (isNil(frame)) {
        throw new Error(
            localize('a variable of name \'')
                + name
                + localize('\'\ndoes not exist in this context')
        );
    };  frame.vars[name].value = value;};

Process.prototype.incrementVarNamed = function (name, delta) {
this.setVarNamed(name, +(this.getVarNamed(name)) + (+delta));};

// Process: Atomic HOFs using experimental JIT-compilation

Process.prototype.reportAtomicMap = function (reporter, list) {
    // if the reporter uses formal parameters instead of implicit empty slots
    // there are two additional optional parameters:
    // #1 - element
    // #2 - optional | index
    // #3 - optional | source list

    this.assertType(list, 'list');
        var result = [],
        src = list.itemsArray(),
        len = src.length,
        formalParameterCount = 0,
        parms,
     	func,
    	i;

        if (reporter.constructor.name === 'Function') {
        formalParameterCount = reporter.length;};
        if (reporter instanceof Context) {
        formalParameterCount = reporter.inputs.length;};

	// try compiling the reporter into generic JavaScript
 	// fall back to the morphic reporter if unsuccessful
    try {
    	func = this.reportCompiled(reporter, 1); // a single expected input
    } catch (err) {
        console.log(err.message);
     	func = reporter;
    }

	// iterate over the data in a single frame:
 	// to do: Insert some kind of user escape mechanism

	for (i = 0; i < len; i += 1) {
        parms = [src[i]];
        if (formalParameterCount > 1) {
            parms.push(i + 1);
        }
        if (formalParameterCount > 2) {
            parms.push(list);
        };  result.push(
                invoke(func,
                new List(parms),
                null,
                null,
                null,
                null,
                this.capture(reporter) // process
            )
        );};    return new List(result);};

Process.prototype.reportAtomicKeep = function (reporter, list) {
    // if the reporter uses formal parameters instead of implicit empty slots
    // there are two additional optional parameters:
    // #1 - element
    // #2 - optional | index
    // #3 - optional | source list

    this.assertType(list, 'list');
    var result = [],
        src = list.itemsArray(),
        len = src.length,
        formalParameterCount = 0,
        parms,
        func,
        i;

        if (reporter.constructor.name === 'Function') {
        formalParameterCount = reporter.length;};
        if (reporter instanceof Context) {
        formalParameterCount = reporter.inputs.length;};

    // try compiling the reporter into generic JavaScript
    // fall back to the morphic reporter if unsuccessful
    try {
        func = this.reportCompiled(reporter, 1); // a single expected input
    } catch (err) {
        console.log(err.message);
        func = reporter;
    }

    // iterate over the data in a single frame:
    // to do: Insert some kind of user escape mechanism
    for (i = 0; i < len; i += 1) {
        parms = [src[i]];
        if (formalParameterCount > 1) {
            parms.push(i + 1);
        }
        if (formalParameterCount > 2) {
            parms.push(list);
        }
    	if (
        	invoke(
            	func,
                new List(parms),
                null,
                null,
                null,
                null,
                this.capture(reporter) // process
            )
        ) {
     		result.push(src[i]);
     	}
    }
    return new List(result);
};

Process.prototype.reportAtomicFindFirstFixed = function (option, reporter, list) {
    // if the reporter uses formal parameters instead of implicit empty slots
    // there are two additional optional parameters:
    // #1 - element
    // #2 - optional | index
    // #3 - optional | source list

    this.assertType(list, 'list');
    var src = list.itemsArray(),
        len = src.length,
        formalParameterCount = 0,
        parms,
        func,
        i;

        if (reporter.constructor.name === 'Function') {
        formalParameterCount = reporter.length;};
        if (reporter instanceof Context) {
        formalParameterCount = reporter.inputs.length;};

    // try compiling the reporter into generic JavaScript
    // fall back to the morphic reporter if unsuccessful
    try {
        func = this.reportCompiled(reporter, 1); // a single expected input
    } catch (err) {
        console.log(err.message);
        func = reporter;
    }

    // iterate over the data in a single frame:
    // to do: Insert some kind of user escape mechanism
    for (i = 0; i < len; i += 1) {
        parms = [src[i]];
        if (formalParameterCount > 1) {
            parms.push(i + 1);
        }
        if (formalParameterCount > 2) {
            parms.push(list);
        }
        if (
            invoke(
                func,
                new List(parms),
                null,
                null,
                null,
                null,
                this.capture(reporter) // process
            )
        ) {
            return (Process.prototype.inputOption(option) === 'index') ? i + 1 : src[i];
         }
    }
    return (Process.prototype.inputOption(option) === 'index') ? 0 : '';
};

Process.prototype.reportAtomicCombine = function (list, reporter) {
    // if the reporter uses formal parameters instead of implicit empty slots
    // there are two additional optional parameters:
    // #1 - accumulator
    // #2 - element
    // #3 - optional | index
    // #4 - optional | source list

    var result, src, len, formalParameterCount, parms, func, i;
    this.assertType(list, 'list');

    // check for special cases to speed up
    if (this.canRunOptimizedForCombine(reporter)) {
        return this.reportListAggregation(
            list,
            reporter.expression.selector
        );
    };  result = '';
    src = list.itemsArray();
    len = src.length;
    if (reporter.constructor.name === 'Function') {
    formalParameterCount = reporter.length;};
    if (reporter instanceof Context) {
    formalParameterCount = reporter.inputs.length;};

        if (len === 0) {
            return result;
        };  result = src[0];

    // try compiling the reporter into generic JavaScript
    // fall back to the morphic reporter if unsuccessful
    try {
        func = this.reportCompiled(reporter, 2); // a single expected input
    } catch (err) {
        console.log(err.message);
        func = reporter;
    };

    // iterate over the data in a single frame:
    // to do: Insert some kind of user escape mechanism
    for (i = 1; i < len; i += 1) {
        parms = [result, src[i]];
        if (formalParameterCount > 2) {
            parms.push(i + 1);
        }
        if (formalParameterCount > 3) {
            parms.push(list);
        }
    	result = invoke(
        	func,
            new List(parms),
            null,
            null,
            null,
            null,
            this.capture(reporter) // process
        );
    };  return result;};

Process.prototype.reportAtomicSort = function (list, predicate) {
    this.assertType(predicate, ['command', 'reporter', 'predicate']);
    this.assertType(list, 'list');
    var func;
    try {
         func = this.reportCompiled(predicate, 2);
    } catch (err) {
         console.log(err.message);
         func = predicate;
    };

    // iterate over the data in a single frame:
	return new List(
  		list.fullCopy().itemsArray().sort((a, b) =>
            ((!invoke(
                func,
                new List([a, b]),
                null,
                null,
                null,
                null,
                this.capture(predicate) // process
            ) - 1/2) * 2)
        )
    );};

Process.prototype.reportAtomicGroup = function (list, reporter) {
    this.assertType(reporter, ['command', 'reporter', 'predicate']);
    this.assertType(list, 'list');
    var result = [],
        dict = new Map,
        groupKey,
        src = list.fullCopy().itemsArray(),
        len = src.length,
        func,
        i;

    // try compiling the reporter into generic JavaScript
    // fall back to the morphic reporter if unsuccessful
    try {
        func = this.reportCompiled(reporter, 1); // a single expected input
    } catch (err) {
        console.log(err.message);
        func = reporter;
    };

    // iterate over the data in a single frame:
    // to do: Insert some kind of user escape mechanism

    for (i = 0; i < len; i += 1) {
        groupKey = invoke(
            func,
            new List([src[i]]),
            null,
            null,
            null,
            null,
            this.capture(reporter) // process
        );
        if (dict.has(groupKey)) {
            dict.get(groupKey).push(src[i]);
        } else {
            dict.set(groupKey, [src[i]]);
        }
    }

    dict.forEach((value, key) =>
        result.push(new List([key, value.length, new List(value)]))
    );
    return new List(result);
};

Process.prototype.reportAnalyze = function (list) {
// return a table representing a dictionary indicating the occurrence count
// of each unique elements
// note: for compound data this method uses identity rather than equality
var dict = new Map,
    result = [],
    data = list.itemsArray(),
    len = data.length,
    i;
for (i = 0; i < len; i += 1) {
    if (dict.has(data[i])) {
        dict.set(data[i], dict.get(data[i]) + 1);
    } else {
        dict.set(data[i], 1);
    };
};  dict.forEach(function (value, key) {
    result.push(new List([key, value]));
}); return new List(result);};

Process.prototype.callMeWith = function (string) {if ((typeof string) === 'string') {if (string.toLowerCase() === 'please') {if (this.blockReceiver(
) instanceof StageMorph) {return 'first drag me from the stage into a sprite, then call me again!';} else {return this.reify((SpriteMorph.prototype
).blockForSelector('runMeWith'), new List);};} else {return 'call me with \"please\", please!';};} else {return 'come on, call me with \"please\"!';
};}; Process.prototype.runMeWith = function (name) {if (this.blockReceiver() instanceof SpriteMorph) {if ((typeof name) === 'string') {if ((name
).length > 0) {this.blockReceiver().bubble(name + ('! Nice talking to you :~) Congratulations for figuring out this little riddle. You are now '
) + 'a certified lambdaist!');} else {this.blockReceiver().bubble('Run me with your name!');};};};}; /* Now enjoy this class, guy. :-) */

// Context /////////////////////////////////////////////////////////////

/*
    A Context describes the state of a Process.

    Each Process has a pointer to a Context containing its
    state. Whenever the Process yields control, its Context
    tells it exactly where it left off.

    structure:

    selector        optional for the context's block image
    parentContext   the Context to return to when this one has
                    been evaluated.
    outerContext    the Context holding my lexical scope
    expression      SyntaxElementMorph, an array of blocks to evaluate,
                    null or a String denoting a selector, e.g. 'doYield'
    origin          the object of origin, only used for serialization
    receiver        the object to which the expression applies, if any
    variables       the current VariableFrame, if any
    inputs          an array of input values computed so far
                    (if expression is a    BlockMorph)
    pc              the index of the next block to evaluate
                    (if expression is an array)
    isContinuation  flag for marking a transient continuation context
    isEmpty         test it, if the context don't have a expression
    startTime       time when the context was first evaluated
    startValue      initial value for interpolated operations
    activeAudio     audio buffer for interpolated operations, don't persist
    activeNote      audio oscillator for interpolated ops, don't persist
    activeSends		forked processes waiting to be completed
    isCustomBlock   marker for return ops
    isCustomCommand marker for interpolated blocking reporters (reportURL)
    emptySlots      caches the number of empty slots for reification
    tag             string or number to optionally identify the Context,
                    as a "return" target (for the "stop block" primitive)
    isFlashing      flag for single-stepping
    accumulator     slot for collecting data from reentrant visits
*/

function Context(parentContext, expression, outerContext, receiver) {this.selector = ('reify').concat(
asABool(localStorage['-snap-setting-oldLambdaOn']) ? '' : 'Reporter'); this.outerContext = ((outerContext
) || null); this.parentContext = (parentContext || null); this.expression = (expression || [(SpriteMorph
).prototype.blockForSelector(this.selector)]); this.receiver = (receiver || null); this.origin = ((receiver
) || null); this.variables = new VariableFrame; if (this.outerContext) {this.variables.parentFrame = (this
).outerContext.variables; this.receiver = this.outerContext.receiver;}; this.inputs = []; this.pc = 0; (this
).isContinuation = false; this.startTime = null; this.activeSends = null; this.activeAudio = null; (this
).activeNote = null; this.isCustomBlock = false; this.isCustomCommand = null; this.emptySlots = 0; (this.tag
) = null; this.isFlashing = false; this.accumulator = null; this.version = null;}; (Context.prototype.toString
) = function () {var expr = this.expression; if (expr instanceof Array) {if (expr.length > 0) {expr = '[' + (
expr[0]) + ']';};}; return 'Context >> ' + expr + ' ' + this.variables;}; Context.prototype.getBYOB = function (
) {var aBlock = new CommandBlockMorph; aBlock.category = 'control'; aBlock.setSpec('BY %r B'); aBlock.fixLayout(
); aBlock.fixBlockColor(); return new Context(null, aBlock.fullCopy());}; Context.prototype.visual = function (
) {if (asABool(localStorage['-snap-setting-oldLambdaOn'])) {if (this.isContinuation) {if ((this.expression
) instanceof Array) {var aBlock = this.expression[this.pc].fullCopy();} else if (this.expression instanceof Morph
) {var aBlock = this.beDraggable().fullCopy();} else {var aBlock = (new Context).beDraggable();};} else if ((
this.selector === 'reify') && (this.inputs.length > 0) && !(this.expression instanceof Morph)) {var aBlock = (
new CommandBlockMorph); aBlock.setSpec('input names:'); this.inputs.forEach(function (name) {aBlock.add((
function (spec) {var aVar = new ReporterBlockMorph; aVar.category = 'variables'; aVar.fixBlockColor();
aVar.setSpec(spec); return aVar;})(name));}); aBlock.fixBlockColor(); var otherBlock = (SpriteMorph
).prototype.blockForSelector('doReport'); otherBlock.fixLayout(); aBlock.add(otherBlock); (aBlock
).fixLayout();} else if (this.expression instanceof InputSlotMorph) {var aBlock = (this.beDraggable(
)).blockSlot().nestedBlock().fullCopy();} else if (this.expression instanceof BooleanSlotMorph) {
var aBlock = this.beDraggable().blockSlot().nestedBlock().fullCopy();} else if ((this.expression
) instanceof ReporterBlockMorph) {if (this.inputs.length > 0) {var aBlock = new CommandBlockMorph;
aBlock.setSpec('input names:'); this.inputs.forEach(function (name) {aBlock.add((function (spec) {
var aVar = new ReporterBlockMorph; aVar.category = 'variables'; aVar.fixBlockColor(); aVar.setSpec(
spec); return aVar;})(name));}); aBlock.fixLayout(); aBlock.fixBlockColor(); var otherBlock = (
SpriteMorph).prototype.blockForSelector('doReport'); otherBlock.children.pop(); otherBlock.add(
this.expression.fullCopy()); otherBlock.children[1].fixBlockColor(); otherBlock.fixLayout();
aBlock.add(otherBlock); aBlock.fixLayout();} else if (this.expression.selector === 'reportScript'
) {var aBlock = SpriteMorph.prototype.blockForSelector('doReport'); aBlock.children.pop(); (aBlock
).add(this.expression.fullCopy()); aBlock.children[1].fixBlockColor(); aBlock.fixLayout();} else {
var aBlock = this.expression.fullCopy(); aBlock.fixBlockColor();};} else if ((this.expression
) instanceof CommandBlockMorph) {if (this.inputs.length > 0) {var aBlock = new CommandBlockMorph;
aBlock.setSpec('input names:'); this.inputs.forEach(function (name) {aBlock.add((function (spec) {
var aVar = new ReporterBlockMorph; aVar.category = 'variables'; aVar.fixBlockColor(); aVar.setSpec(
spec); return aVar;})(name));}); aBlock.fixLayout(); aBlock.fixBlockColor(); aBlock.add((this
).expression.fullCopy());} else {if (this.expression.selector === 'doReport') {if ((this.expression
).children[1] instanceof ReporterBlockMorph) {var aBlock = this.expression.children[1].fullCopy();
} else {var aBlock = this.expression.fullCopy();};} else {var aBlock = this.expression.fullCopy();
};};} else {var aBlock = this.beDraggable().fullCopy();}; aBlock.highlight = function (color, blur,
border) {var highlight = new BlockHighlightMorph; border = (border * (SyntaxElementMorph.prototype
).scale); var fb = this.fullBounds(); var edge = border; highlight.bounds.setExtent(fb.extent().add(
edge * 2)); highlight.holes = [highlight.bounds]; highlight.color = color; highlight.cachedImage = (
this).highlightImage(color, border); highlight.setPosition(fb.origin.subtract(new Point(edge, edge)
)); return highlight;}; aBlock.addBack(aBlock.highlight(SyntaxElementMorph.prototype.rfColor, 0, 0)
); aBlock.fixBlockColor(); aBlock.fixLayout(); aBlock.fixLabelColor(); aBlock.isHighContrast = true;
aBlock.forAllChildren(child => {if (child instanceof SyntaxElementMorph) {child.isHighContrast = true;
child.rerender();};}); aBlock.rerender(); return aBlock;} else {return this.beDraggable();};}; (Context
).prototype.image = function () {return (this.visual()).fullImage();}; Context.prototype.beDraggable = (
function () {if (asABool(localStorage['-snap-setting-oldLambdaOn'])) {if (this.expression instanceof Array
) {if (this.isContinuation) {var aBlock = SpriteMorph.prototype.blockForSelector((this.expression[this.pc
] instanceof CommandBlockMorph) ? 'reportScript' : 'reify');} else {var aBlock = (SpriteMorph.prototype
).blockForSelector(this.selector);}; if (aBlock.selector === 'reportScript') {var thatParameters = (
aBlock).inputNamesElement(); var thatC = aBlock.blockSlot();} else {var thatParameters = (aBlock
).inputNamesElement(); var thatC = aBlock.blockSlot();}; this.inputs.forEach(function (input) {
thatParameters.addInput(input);}); if ((this.expression[this.pc] instanceof Morph) && (this
).isContinuation) {thatC.nestedBlock(this.expression[this.pc].fullCopy());};} else if (!(
this.expression instanceof Morph)) {var aBlock = SpriteMorph.prototype.blockForSelector(
'reportScript'); var thatParameters = aBlock.inputNamesElement(); this.inputs.forEach(function (
input) {thatParameters.addInput(input);});} else if (this.expression instanceof InputSlotMorph) {
var aBlock = SpriteMorph.prototype.blockForSelector('reportScript'); var thatParameters = (
aBlock.inputNamesElement()); this.inputs.forEach(function (input) {thatParameters.addInput(
input);}); var otherBlock = SpriteMorph.prototype.blockForSelector('doReport'); (otherBlock
).children.pop().parent = null; otherBlock.add(this.expression.fullCopy()); (otherBlock
).fixLayout(); aBlock.blockSlot().nestedBlock(otherBlock); aBlock.fixLayout(); otherBlock.fixLayout();} else if (
this.expression instanceof BooleanSlotMorph) {var aBlock = SpriteMorph.prototype.blockForSelector(
'reify'); var thatParameters = aBlock.inputNamesElement(); this.inputs.forEach(function (input) {thatParameters.addInput(input);});
if (this.expression.evaluate() === true) {var otherBlock = SpriteMorph.prototype.blockForSelector('reportTrue', true);
} else if (this.expression.evaluate() === false) {var otherBlock = SpriteMorph.prototype.blockForSelector('reportFalse', true);
} else {var otherBlock = SpriteMorph.prototype.blockForSelector('reportBoolean');}; aBlock.blockSlot().nestedBlock(otherBlock);
aBlock.blockSlot().nestedBlock().fixBlockColor(); aBlock.fixLayout();} else if (this.expression instanceof CommandBlockMorph) {
if (this.expression.selector === 'doReport') {if (this.expression.children[1] instanceof ReporterBlockMorph) {
var aBlock = SpriteMorph.prototype.blockForSelector('reify'); var thatSlot = aBlock.blockSlot();
var thatParameters = aBlock.inputNamesElement(); this.inputs.forEach(function (input) {thatParameters.addInput(input);});
thatSlot.nestedBlock(this.expression.children[1]);} else {var aBlock = SpriteMorph.prototype.blockForSelector(
'reportScript'); var thatC = aBlock.blockSlot(); var thatParameters = aBlock.inputNamesElement(); this.inputs.forEach(
function (input) {thatParameters.addInput(input);}); if (this.expression instanceof Morph) {thatC.nestedBlock(
this.expression.fullCopy());};};} else {var aBlock = SpriteMorph.prototype.blockForSelector('reportScript');
var thatC = aBlock.blockSlot(); var thatParameters = aBlock.inputNamesElement(); this.inputs.forEach(function (input) {
thatParameters.addInput(input);}); if (this.expression instanceof Morph) {thatC.nestedBlock(this.expression.fullCopy());};};
} else {var aBlock = SpriteMorph.prototype.blockForSelector('reify'); var thatSlot = aBlock.blockSlot();
var thatParameters = aBlock.inputNamesElement(); this.inputs.forEach(function (input) {thatParameters.addInput(
input);}); if (this.expression instanceof Morph) {thatSlot.nestedBlock(this.expression.fullCopy());};
}; aBlock.fixLayout(); aBlock.isDraggable = true; if (this.expression instanceof ReporterBlockMorph) {
if (aBlock.selector === 'reify') {aBlock.blockSlot().nestedBlock().fixBlockColor();};}; return aBlock;
} else {if (this.expression instanceof Array) {return (this.expression)[this.pc].fullCopy();} else {
var aBlock = SpriteMorph.prototype.blockForSelector(this.selector); if (this.expression instanceof Morph
) {var block = this.expression.fullCopy(); if (block instanceof BooleanSlotMorph) {
var anotherBlock = SpriteMorph.prototype.blockForSelector('reportBoolean'
); anotherBlock.children[0].value = block.evaluate(); anotherBlock.children[
0].fullChanged(); anotherBlock.fullChanged(); block = anotherBlock;} else if (
block instanceof InputSlotMorph) {var anotherBlock = SpriteMorph.prototype.blockForSelector(
'doReport'); anotherBlock.children.pop().parent = null; anotherBlock.add(block.fullCopy(
)); anotherBlock.fixLayout(); block = anotherBlock;}; block.isDraggable = true; (aBlock
).embed(block, this.inputs, true);}; aBlock.isDraggable = true; aBlock.fixLayout();
return aBlock;};};}); Context.prototype.toBlock = function () {var ring = new RingMorph,
block, cont; if (this.expression instanceof Morph) {block = this.expression.fullCopy(
); /* replace marked call/cc block with empty slot */ if (this.isContinuation) {
cont = detect(block.allInputs(), inp => inp.bindingID === 1); if (cont) {
block.revertToDefaultInput(cont, true);};}; ring.embed(block, this.inputs);
ring.clearAlpha(); return ring;}; if (this.expression instanceof Array) {
block = this.expression[this.pc].fullCopy(); if (block instanceof RingMorph &&
!block.contents()) {return block;}; ring.embed(block, this.isContinuation ? [] :
this.inputs); return ring;}; /* otherwise show an empty ring */ ring.selector = (
'reify').concat(asABool(localStorage['-snap-setting-oldLambdaOn']) ? '' : 'Reporter');
ring.setSpec(asABool(localStorage['-snap-setting-oldLambdaOn']
) ? 'the %f block %parms' : '%rr %ringparms');
// also show my inputs, unless I am a continuation
if (!this.isContinuation) {this.inputs.forEach(
inp => ring.childThatIsA(MultiArgMorph).addInput(inp));};
return ring;}; Context.prototype.rawContinuation = function (isReporter) {
    var cont;
    if (this.expression instanceof Array) {
        return this;
    } else if (this.parentContext) {
        return this.parentContext;
    } else {
    cont = new Context(
        null,
        isReporter ? 'expectReport' : 'popContext'
    );}; cont.isContinuation = true;
    return cont;
};
Context.prototype.catchContinuation = function () {
    var cont;
    if (this.expression instanceof Array) {
        cont = this;
    } else if (this.parentContext) {
        cont = this.parentContext;
    } else {
    cont = new Context(
        null,
        'popContext'
    );}; cont = cont.copyForContinuation();
    cont.tag = null;
    cont.isContinuation = true;
    cont.isCatchContinuation = true;
    return cont;
};
Context.prototype.continuation = function (isReporter) {
    var cont; if (this.expression instanceof Array) {
        cont = this;
    } else if (this.parentContext) {
        cont = this.parentContext;
    } else {
        cont = new Context(
            null,
            isReporter ? 'expectReport' : 'popContext'
        );
        cont.isContinuation = true;
        return cont;
    }; cont = cont.copyForContinuation();
    cont.tag = null;
    cont.isContinuation = true;
    return cont;
}; Context.prototype.copyForContinuation = function () {
    var cpy = copy(this), cur = cpy,
        isReporter = !(this.expression instanceof Array ||
            isString(this.expression));
    if (isReporter) {
        cur.prepareContinuationForBinding();
        while (cur.parentContext) {
            cur.parentContext = copy(cur.parentContext);
            cur = cur.parentContext;
            cur.inputs = [];
        };
    }; return cpy;
}; Context.prototype.copyForContinuationCall = function () {
    var cpy = copy(this), cur = cpy,
        isReporter = !(this.expression instanceof Array ||
            isString(this.expression));
    if (isReporter) {
        this.expression = this.expression.fullCopy();
        this.inputs = [];
        while (cur.parentContext) {
            cur.parentContext = copy(cur.parentContext);
            cur = cur.parentContext;
            cur.inputs = [];
        };
    }; return cpy;
}; Context.prototype.prepareContinuationForBinding = function () {
    var pos = this.inputs.length,
        slot;
    this.expression = this.expression.fullCopy();
    slot = this.expression.inputs()[pos];
    if (slot) {
        this.inputs = [];
        // mark slot containing the call/cc reporter with an identifier
        slot.bindingID = 1;
        // and remember the number of detected empty slots
        this.emptySlots = 1;
    };
}; Context.prototype.addInput = function (input) {this.inputs.push(input);};
Context.prototype.stopMusic = function () {if (this.activeNote) {this.activeNote.stop(
);  this.activeNote = null;};}; Context.prototype.lastFlashable = function () {
    // for single-stepping when pausing
    if (this.expression instanceof SyntaxElementMorph &&
            !(this.expression instanceof CommandSlotMorph)) {
        return this;
    } else if (this.parentContext) {
        return this.parentContext.lastFlashable();
    }; return null;};
Context.prototype.stackSize = function () {if (!this.parentContext) {return 1;};
return 1 + this.parentContext.stackSize();}; Context.prototype.isInCustomBlock = function () {
if (this.isCustomBlock) {return true;}; if (this.parentContext) {return this.parentContext.isInCustomBlock();
}; return false;}; Context.prototype.components = function () {if (this.expression instanceof Morph) {
var expr = this.expression;} else {var expr = this.expression;};
if (expr && expr.components) {expr = expr.components(this.inputs.slice());} else {
expr = new Context(); expr.inputs = this.inputs.slice();};
return (expr instanceof Context) ? new List([expr]) : expr;}; Context.prototype.equalTo = function (other) {
    var c1 = this.components(),
        c2 = other.components();
    if (this.emptyOrEqual(c1.cdr(), c2.cdr())) {
        if (this.expression && this.expression.length === 1 &&
                other.expression && other.expression.length === 1) {
            return snapEquals(this.expression[0], other.expression[0]);
        }; return snapEquals(this.expression, other.expression);
    }; return false;}; Context.prototype.emptyOrEqual = function (
    list1, list2) { // private - return TRUE if both lists are
    // either equal or only contain empty items
    return list1.equalTo(list2) || (
        list1.itemsArray().every(item => !item) &&
        list2.itemsArray().every(item => !item)
    );
}; Context.prototype.copyWithInputs = function (inputs) {
    return this.expression ?
        this.expression.copyWithInputs(inputs)
        : this;
}; Context.prototype.copyWithNext = function (next) {
return this.expression.copyWithNext(next.expression, this.inputs.slice());
}; Context.prototype.updateEmptySlots = function () {this.emptySlots = this.expression.markEmptySlots();};

// Variable /////////////////////////////////////////////////////////////////

function Variable(value, isTransient, isHidden) {this.value = value; this.isTransient = asABool(isTransient); this.isHidden = asABool(isHidden);};

Variable.prototype.toString = function () {return 'a ' + (this.isTransient ? 'transient ' : '') + (this.isHidden ? 'hidden ' : '') + 'Variable [' + this.value + ']';};

Variable.prototype.copy = function () {return new Variable(this.value, this.isTransient, this.isHidden);};

// VariableFrame ///////////////////////////////////////////////////////

function VariableFrame (parentFrame, owner) {this.vars = {};
this.parentFrame = parentFrame || null; this.owner = owner || null;};

VariableFrame.prototype.toString = function anonymous (
) {return 'a VariableFrame {' + this.names() + '}';};

VariableFrame.prototype.copy = function () {
    var frame = new VariableFrame(this.parentFrame);
    this.names().forEach(vName =>
        frame.addVar(vName, this.getVar(vName))
    ); return frame;
};

VariableFrame.prototype.fullCopy = function () {
    // experimental - for compiling to JS
    var frame;
    if (this.parentFrame) {
        frame = new VariableFrame(this.parentFrame.fullCopy());
    } else {frame = new VariableFrame;
    }; frame.vars = copy(this.vars);
    return frame;
};

// Variable Frame forking and merging for libraries

VariableFrame.prototype.fork = function (names = []) {
    // answer a copy that only has entries for the given array of variable names
    // and only has values for primitive data.
    // used for including data dependencies in libraries.
    var frame = new VariableFrame;
    this.names(true).forEach(vName => {
        var v, val, typ;
        if (names.includes(vName)) {
            v = this.vars[vName];
            if (v.isTransient) {
                val = '';
            } else {
                typ = Process.prototype.reportTypeOf(v.value);
                if (['text', 'number', 'Boolean'].includes(typ) ||
                    (v.value instanceof List &&
                        (v.value.canBeCSV() || v.value.canBeJSON()))
                ) {
                    val = v.value;
                } else {
                    val = '';
                };
            };  frame.vars[vName] = new Variable(val, v.isTransient, v.isHidden);
        };
    }); return frame;
};

VariableFrame.prototype.merge = function (otherFrame) {
    // add another frame's variables overwriting existing values and
    // settings (transient, hidden) if any. Merge only replaces and
    // adds to the frame, does not delete any entries.
    // used for handling data dependencies in libraries.
    otherFrame.names(true).forEach(vName =>
        this.vars[vName] = otherFrame.vars[vName]
    );
};

// Variable Frame ops

VariableFrame.prototype.root = function () {
    if (this.parentFrame) {
        return this.parentFrame.root();
    }; return this;
};

VariableFrame.prototype.find = function (name) {
    // answer the closest variable frame containing
    // the specified variable. otherwise throw an exception.
    var frame = this.silentFind(name);
    if (frame) {return frame; }
    throw new Error(
        localize('a variable of name \'')
            + name
            + localize('\'\ndoes not exist in this context')
    );
};

VariableFrame.prototype.silentFind = function (name) {
    // answer the closest variable frame containing
    // the specified variable. Otherwise return null.
    if (this.vars[name] instanceof Variable) {
        return this;
    }; if (this.parentFrame) {
        return this.parentFrame.silentFind(name);
    }; return null;
};

VariableFrame.prototype.setVar = function (name, value, sender) {
    // change the specified variable if it exists
    // else throw an error, because variables need to be
    // declared explicitly (e.g. through a "script variables" block),
    // before they can be accessed.
    // if the found frame is inherited by the sender sprite
    // shadow it (create an explicit one for the sender)
    // before setting the value ("create-on-write")

    var frame = this.find(name);
    if (frame) {
        if (sender instanceof SpriteMorph &&
                (frame.owner instanceof SpriteMorph) &&
                (sender !== frame.owner)) {
            sender.shadowVar(name, value);
        } else {
            frame.vars[name].value = value;
        };
    };
};

VariableFrame.prototype.changeVar = function (name, delta, sender) {
    // change the specified variable if it exists
    // else throw an error, because variables need to be
    // declared explicitly (e.g. through a "script variables" block,
    // before they can be accessed.
    // if the found frame is inherited by the sender sprite
    // shadow it (create an explicit one for the sender)
    // before changing the value ("create-on-write")

    var frame = this.find(name), newValue; if (frame) {
        newValue = Process.prototype.reportSum(frame.vars[name].value, delta);
        if (sender instanceof SpriteMorph &&
                (frame.owner instanceof SpriteMorph) &&
                (sender !== frame.owner)) {
            sender.shadowVar(name, newValue);
        } else {
            frame.vars[name].value = newValue;
        };
    };
};

VariableFrame.prototype.getVar = function (name) {
    var frame = this.silentFind(name),
        value;
    if (frame) {
        value = frame.vars[name].value;
        return (value === 0 ? 0
                : value === false ? false
                        : value === '' ? ''
                            : value || 0); // don't return null
    }; if (typeof name === 'number') {
        // empty input with a Binding-ID called without an argument
        return '';
    }; throw new Error(
        localize('a variable of name \'')
            + name
            + localize('\'\ndoes not exist in this context')
    );
};

VariableFrame.prototype.addVar = function (name, value) {
    this.vars[name] = new Variable(value === 0 ? 0
              : value === false ? false
                       : value === '' ? '' : value || 0);
};

VariableFrame.prototype.deleteVar = function (name) {
    var frame = this.find(name);
    if (frame) {
        delete frame.vars[name];
    };
};

// VariableFrame tools

VariableFrame.prototype.names = function (includeHidden) {
    var each, names = [];
    for (each in this.vars) {
        if (Object.prototype.hasOwnProperty.call(this.vars, each)) {
            if (!this.vars[each].isHidden || includeHidden) {
                names.push(each);
            };
        };
    }; return names;
};

VariableFrame.prototype.allNamesDict = function (upTo, includeHidden) {
	// "upTo" is an optional parent frame at which to stop, e.g. globals
    var dict = {}, current = this;

    function addKeysToDict(srcDict, trgtDict) {
        var eachKey;
        for (eachKey in srcDict) {
            if (Object.prototype.hasOwnProperty.call(srcDict, eachKey)) {
                if (!srcDict[eachKey].isHidden || includeHidden) {
                    trgtDict[eachKey] = eachKey;
                };
            };
        };
    };

    while (current && (current !== upTo)) {
        addKeysToDict(current.vars, dict);
        current = current.parentFrame;
    }; return dict;
};

VariableFrame.prototype.allNames = function (upTo, includeHidden) {
/*
    only show the names of the lexical scope, hybrid scoping is
    reserved to the daring ;-)
	"upTo" is an optional parent frame at which to stop, e.g. globals
*/
    var answer = [], each, dict = this.allNamesDict(upTo, includeHidden);

    for (each in dict) {
        if (Object.prototype.hasOwnProperty.call(dict, each)) {
            answer.push(each);
        };
    }; return answer;
};