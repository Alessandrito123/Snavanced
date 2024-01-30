modules.compilers = '2023-June-01'; var JSCompiler;

// JSCompiler /////////////////////////////////////////////////////////////////

/*
	Compile simple, side-effect free reporters
    with either only explicit formal parameters or a specified number of
    implicit formal parameters mapped to empty input slots
	*** highly experimental and heavily under construction ***
*/

function JSCompiler (aProcess) {this.process = aProcess; /* proc */ this.source = null; /* context */
this.gensyms = new Map; /* temp dictionary for parameter substitutions */ this.implicitParams = null;
this.paramCount = null; this.scriptVarCounter = null;}; /* compiling scripts to be JIT for now. :) */

JSCompiler.prototype.toString = function anonymous () {return 'a JSCompiler';};

JSCompiler.prototype.compileFunction = function (aContext, implicitParamCount) {
    var block = aContext.expression,
  		parameters = aContext.inputs,
        hasEmptySlots = false,
        plength = 0,
        code;

	this.source = aContext;
    if (isNil(implicitParamCount) || implicitParamCount === '') {
        this.implicitParams = 1;
    } else {
        this.implicitParams = Math.floor(implicitParamCount);
        if (this.implicitParams < 0) {
            // use 1 if implicitParamCount doesn't make sense
            this.implicitParams = 1;
        }
    }

	// scan for empty input slots
 	hasEmptySlots = !isNil(detect(
  		block.allChildren(),
    	morph => morph.isEmptySlot && morph.isEmptySlot()
    ));

    // translate formal parameters into gensyms
    this.gensyms.clear();
    this.paramCount = 0;
    if (parameters.length) {
        // test for conflicts
        if (hasEmptySlots) {
        	throw new Error(
                'compiling does not yet support\n' +
                'mixing explicit formal parameters\n' +
                'with empty input slots'
            );
        }
        // map explicit formal parameters
        parameters.forEach((pName, idx) => {
        	this.gensyms.set(pName, 'p[' + idx + ']');
        });
        plength = parameters.length;
    } else if (hasEmptySlots) {
    	plength = this.implicitParams;
    }

    // compile using gensyms

    this.scriptVarCounter = 0;
    code = 'proc=p.pop();\n';
    if (plength) {
        // fill missing parameters with empty string
        code += 'while(' + plength + '>p.length)p.push("");\n';
    }
    if (block instanceof CommandBlockMorph) {
        code += this.compileSequence(block) + 'return ""';
    } else {
        code += 'return ' + this.compileExpression(block);
    }
    block = 'var ';
    this.gensyms.forEach(value => {
        if (value.charAt(0) === 's') {
            // declare script variable
            block += value + '=0,';
        }
    });
    return Function('...p', block + code);
};

JSCompiler.prototype.compileExpression = function (block) {
    var selector = block.selector,
        inputs = block.inputs(),
        target,
        rcvr,
        args;

    // first check for special forms and infix operators
    switch (selector) {
    case 'reportVariadicOr':
        return this.compileInfix('||', inputs[0].inputs());
    case 'reportVariadicAnd':
        return this.compileInfix('&&', inputs[0].inputs());
    case 'reportIfElse':
        return '(' +
            this.compileInput(inputs[0]) +
            ' ? ' +
            this.compileInput(inputs[1]) +
            ' : ' +
            this.compileInput(inputs[2]) +
            ')';
    case 'evaluateCustomBlock':
        throw new Error(
            'compiling does not yet support\n' +
            'custom blocks'
        );

    // special evaluation primitives
    case 'execute':
        return 'invoke(' +
            this.compileInput(inputs[1]) +
            ', ' +
            this.compileInput(inputs[2]) +
            ')';

    // special command forms
    case 'doDeclareVariables':
        block = '';

        inputs[0].inputs().forEach(({children: {0: {blockSpec: name}}}) => {
            var gensym = this.gensyms.get(name);
            if (gensym) {
                // we already have that script variable, just set it to 0
                block += gensym + '=';
                return;
            }
            gensym = 's' + this.scriptVarCounter++;
            block += gensym + '=';
            this.gensyms.set(name, gensym);
        });
        return block + '0';
    case 'reportGetVar':
        return this.gensyms.get(block.blockSpec) || ('proc.getVarNamed("' +
            this.escape(block.blockSpec) +
            '")');
    case 'doSetVar':
        if (inputs[0] instanceof ArgMorph) {
            target = this.gensyms.get(inputs[0].evaluate());
            if (target) {
                // setting gensym (script or argument) variable
                return target + ' = ' + this.compileInput(inputs[1]);
            }
        }
        // redirect var to process
        return 'proc.setVarNamed(' +
            this.compileInput(inputs[0]) +
            ', ' +
            this.compileInput(inputs[1]) +
            ')';
    case 'doChangeVar':
        if (inputs[0] instanceof ArgMorph) {
            target = this.gensyms.get(inputs[0].evaluate());
            if (target) {
                return '{const d=' + this.compileInput(inputs[1]) +
                    ',v=parseFloat(' + target + ');' +
                    target + '=isNaN(v)?d:Process.prototype.fixSimpleNumber(v+parseFloat(d))}';
            }
        }
        // redirect var to process
        return 'proc.incrementVarNamed(' +
            this.compileInput(inputs[0]) +
            ', ' +
            this.compileInput(inputs[1]) +
            ')';
    case 'doReport':
        return 'return ' + this.compileInput(inputs[0]);
    case 'doIf':
        return 'if (' +
            this.compileInput(inputs[0]) +
            ') {\n' +
            this.compileSequence(inputs[1].evaluate()) +
            '}' +
            this.compileElseIf(inputs[2]);
    case 'doIfElse':
        return 'if (' +
            this.compileInput(inputs[0]) +
            ') {\n' +
            this.compileSequence(inputs[1].evaluate()) +
            '} else {\n' +
            this.compileSequence(inputs[2].evaluate()) +
            '}';
    case 'doWarp':
        // synchronous javascript is already like warp
        return this.compileSequence(inputs[0].evaluate());
    case 'reportBoolean':
    case 'reportNewList':
        return this.compileInput(inputs[0]);
    default:
        target = this.process[selector] ? this.process
            : (this.source.receiver || this.process.receiver);
        rcvr = target.constructor.name + '.prototype';
        args = this.compileInputs(inputs);
        if (isSnapObject(target)) {
            if (rcvr === 'SpriteMorph.prototype') {
                // fix for blocks like (x position)
                rcvr = 'proc.blockReceiver()';
            }
            return rcvr + '.' + selector + '(' + args + ')';
        } else {
            return 'proc.' + selector + '(' + args + ')';
        }
    }
};

JSCompiler.prototype.compileElseIf = function (multiArg) {
    return (multiArg.inputs().map((slot, i) => i % 2 === 0 ?
        ' else if (' + this.compileInput(slot) + ') '
        : '{\n' + this.compileSequence(slot.evaluate()) + '}'
    ).join(''));
};

JSCompiler.prototype.compileSequence = function (commandBlock) {
    if (commandBlock == null) return '';
    commandBlock = commandBlock.blockSequence();
    var l = commandBlock.length, i = 0, body = '';
    while (l > i) {
        body += this.compileExpression(commandBlock[i++]) + ';\n';
    }
    return body;
};

JSCompiler.prototype.compileInfix = function (operator, inputs) {
    return '(' + this.compileInput(inputs[0]) + ' ' + operator + ' ' +
        this.compileInput(inputs[1]) + ')';
};

JSCompiler.prototype.compileInputs = function (array) {
    var args = '';
    array.forEach(inp => {
        if (args) {
            args += ', ';
        }
        args += this.compileInput(inp);
    });
    return args;
};

JSCompiler.prototype.compileInput = function (inp) {
    var value, type;

    if (inp.isEmptySlot && inp.isEmptySlot()) {
        // implicit formal parameter
        if (this.implicitParams > 1) {
         	if (this.paramCount < this.implicitParams) {
            	this.paramCount += 1;
             	return 'p[' + (this.paramCount - 1) + ']';
        	}
            throw new Error(
                localize('expecting') + ' ' + this.implicitParams + ' '
                    + localize('input(s), but getting') + ' '
                    + this.paramCount
            );
        }
		return 'p[0]';
    } else if (inp instanceof MultiArgMorph) {
        return 'new List([' + this.compileInputs(inp.inputs()) + '])';
    } else if (inp instanceof ArgLabelMorph) {
    	return this.compileInput(inp.argMorph());
    } else if (inp instanceof ArgMorph) {
        // literal - evaluate inline
        value = inp.evaluate();
        type = this.process.reportTypeOf(value);
        switch (type) {
        case 'number':
        case 'Boolean':
            return '' + value;
        case 'text':
            // escape and enclose in double quotes
            return '"' + this.escape(value) + '"';
        case 'list':
            return 'new List([' + this.compileInputs(value) + '])';
        default:
            if (value instanceof Array) {
                return '\[\"' + this.escape(value[0]) + '\"\]';
            }
            throw new Error(
                'compiling does not yet support\n' +
                'inputs of type\n' +
                 type
            );
        }
    } else if (inp instanceof BlockMorph) {
        return this.compileExpression(inp);
    } else {
        throw new Error(
            'compiling does not yet support\n' +
            'input slots of type\n' +
            inp.constructor.name
        );
    }
};

JSCompiler.prototype.escape = function(string) {
    // make sure string is a string
    string += '';
    var len = string.length, i = 0, char, escaped = '', safe_chars =
        ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$' +
        "%&'()*+,-./:;<=>?@[]^_`{|}~";
    while (len > i) {
        char = string.charAt(i++);
        if (safe_chars.indexOf(char) === -1) {
            escaped += '\\u' + (char.charCodeAt(0) | 0x10000)
                .toString(16).substring(1);
        } else {
            escaped += char;
        }
    }
    return escaped;
};

function resultsJS (anInput) {if (anInput instanceof RingMorph) {return reportBasicToJS(anInput.expression);} else {return anInput.evaluate();};};
function checkTypeAndApply (anInput) {return ((parseFloat(anInput) === +anInput) ? anInput : (contains(['true', 'false'], anInput) ? anInput : '\'' + anInput + '\''));};
function reportBasicToJS (blocks) {if (blocks instanceof Context) {return new Function(blocks.inputs.concat(['proc']), reportBasicToJS(blocks.expression));
} else if (blocks instanceof RingMorph) {return '\(' + (new Function(blocks.inputs()[1].evaluate(), reportBasicToJS(blocks.inputs()[0].evaluate()))).toString() + '\)';
} else if ((blocks instanceof CSlotMorph) || (blocks instanceof CommandSlotMorph) || (blocks instanceof ReporterSlotMorph)) {return '\(' + (new Function([], reportBasicToJS(blocks.nestedBlock()))).toString(
) + '\)';} else if (blocks instanceof ColorSlotMorph) {return '\(new Color\(' + blocks.evaluate().r + ',' + blocks.evaluate().g + ',' + blocks.evaluate().b + ',' + blocks.evaluate().a + '\)\)';
} else if (blocks instanceof ArgLabelMorph) {return blocks.inputs()[0].inputs()[0].inputs().map(input => ('\(' + reportBasicToJS(input) + '.asArray()\)'));
} else if (blocks instanceof CommandBlockMorph) {var i = 1; var preresult = blocks.blockSequence().filter(input => input instanceof CommandBlockMorph).map(function (block) {
if (block.selector === 'forward') {
return 'this.forward\(' + asANum(reportBasicToJS(block.inputs()[0])) + ', new List\(' + reportBasicToJS(block.inputs()[1]) + '\)\)\;';
} else if (block.selector === 'turn') {
return 'this.turn\(' + (contains(['number', 'Boolean'], (new Process).reportTypeOf(reportBasicToJS(block.inputs()[0]))) ? (0 + reportBasicToJS(block.inputs()[0])) : (reportBasicToJS(block.inputs()[0]))) + '\)\;';
} else if (block.selector === 'turnLeft') {
return 'this.turn\(' + (contains(['number', 'Boolean'], (new Process).reportTypeOf(reportBasicToJS(block.inputs()[0]))) ? (0 - reportBasicToJS(block.inputs()[0])) : ('0 - ' + reportBasicToJS(block.inputs()[0]))) + '\)\;';
} else if (block.selector === 'setHeading') {
return 'this.setHeading\(' + (contains(['number', 'Boolean'], (new Process).reportTypeOf(reportBasicToJS(block.inputs()[0]))) ? (0 + reportBasicToJS(block.inputs()[0])) : (reportBasicToJS(block.inputs()[0]))) + '\)\;';
} else if (block.selector === 'doIf') {return 'if \(' + reportBasicToJS(block.inputs()[0]) + '\) \{\n' + reportBasicToJS(block.inputs()[1].nestedBlock()) + '\n\}\;';
} else if (block.selector === 'doIfElse') {return 'if \(' + reportBasicToJS(block.inputs()[0]) + '\) \{\n' + reportBasicToJS(block.inputs()[1].nestedBlock()) +
'\n\} else \{\n' + reportBasicToJS(block.inputs()[2].nestedBlock()) + '\n\}\;';
} else if (block.selector === 'doForever') {return 'while \(true\) \{\n' + reportBasicToJS(block.inputs()[0].nestedBlock()) + '\n\}\;';
} else if (block.selector === 'doUntil') {return 'while \(!\(' + reportBasicToJS(block.inputs()[0]) + '\)\) \{\n' + reportBasicToJS(block.inputs()[1].nestedBlock()) + '\n\}\;';
} else if (block.selector === 'doWhile') {return 'while \(' + reportBasicToJS(block.inputs()[0]) + '\) \{\n' + reportBasicToJS(block.inputs()[1].nestedBlock()) + '\n\}\;';
} else if (block.selector === 'doReport') {return 'return ' + reportBasicToJS(block.inputs()[0]) + ';';
} else if (block.selector === 'doRun') {return reportBasicToJS(block.inputs()[0]) + '.apply\(this, ' + reportBasicToJS(block.inputs()[1]) + '\);';
} else if (block.selector === 'doTellTo') {return reportBasicToJS(block.inputs()[1]) + '.apply\(' + reportBasicToJS(block.inputs()[0]) + ', \[' + reportBasicToJS(block.inputs()[2]) + '\]\);';
} else if (block.selector === 'doResetTimer') {return 'world.children[0].stage.timerStart = Date.now\(\)\;';
} else if (block.selector === 'doSetVar') {return resultsJS(block.inputs()[0]) + ' = ' + reportBasicToJS(block.inputs()[1]) + '\;';
} else if (block.selector === 'doChangeVar') {return resultsJS(block.inputs()[0]) + ' += ' + reportBasicToJS(block.inputs()[1]) + '\;';
} else if (block.selector === 'doDeclareVariables') {return 'var ' + block.inputs()[0].evaluate() + ' = 0\;';
} else if (block.selector === 'doForEach') {return '(new Process).assertType\(' + reportBasicToJS(block.inputs()[1]) + ', \'list\'\);\n' + reportBasicToJS(block.inputs()[1]) + '.asArray\(\).forEach\(\n' +
(function anonymous () {var aContext = (new Context(null, block.inputs()[2].nestedBlock())); aContext.inputs = [block.inputs()[0].evaluate()]; return reportBasicToJS(aContext);})() + '\);';
} else if (block.selector === 'evaluateCustomBlock') {return reportBasicToJS(block.definition.body.toBlock()) + '.apply\(this, \[' + block.inputs().map(value => reportBasicToJS(value)) + '\]\);';
} else {return '';};}); var result = preresult[0]; while (i < preresult.length) {result = (result + '\n' + preresult[i]); i++;}; return result;
} else if (blocks instanceof ArgMorph) {if (blocks instanceof MultiArgMorph) {return (blocks.parent.isCustomBlock ? 'new List\(\[' : ((blocks.parent.selector === 'reportJoinWords') ? '' : '\[')) + blocks.children.filter(
miniInput => (miniInput instanceof BlockMorph) || (miniInput instanceof ArgMorph)).map(function anonymous (miniInput) {
if (miniInput instanceof BlockMorph) {return reportBasicToJS(miniInput);} else if (miniInput instanceof CSlotMorph) {return reportBasicToJS(miniInput.nestedBlock());} else {return contains(['number', 'Boolean', 'nothing'],
(new Process).reportTypeOf(miniInput.evaluate())) ? miniInput.evaluate() : ('\'' + miniInput.evaluate() + '\'');};}) + (blocks.parent.isCustomBlock ? '\]\)' : ((blocks.parent.selector === 'reportJoinWords') ? '' : '\]'));
} else {return contains(['number', 'Boolean', 'nothing'], (new Process).reportTypeOf(blocks.evaluate())) ? (blocks.evaluate()) : ('\''  + blocks.evaluate() + '\'');};} else if (blocks instanceof ReporterBlockMorph) {
if (contains(['xPosition', 'yPosition', 'direction', 'getCostumeIdx', 'getScale', 'reportShown', 'getTempo', 'getVolume', 'getPan', 'getPenDown', 'getLastMessage', 'getLastAnswer', 'reportMouseX', 'reportMouseY', 'getTimer'],
blocks.selector)) {return 'this.' + blocks.selector + '\(\)';
} else if (blocks.selector === 'reportIfElse') {return '\(' + reportBasicToJS(blocks.inputs()[0]) + ' ? ' + reportBasicToJS(blocks.inputs()[1]) + ' : ' + reportBasicToJS(blocks.inputs()[2]) + '\)';
} else if (blocks.selector === 'evaluate') {return reportBasicToJS(blocks.inputs()[0]) + '.apply\(this, ' + reportBasicToJS(blocks.inputs()[1]) + '\)';
} else if (blocks.selector === 'reportTouchingColor') {return 'this.reportTouchingColor\(' + reportBasicToJS(blocks.inputs()[0]) + '\)';
} else if (blocks.selector === 'reportColorIsTouchingColor') {return 'this.reportColorIsTouchingColor\(' + reportBasicToJS(blocks.inputs()[0]) + ',' + reportBasicToJS(blocks.inputs()[1]) + '\)';
} else if (blocks.selector === 'reportObject') {if (blocks.inputs()[0].evaluate()[0] === 'myself') {return 'this';
} else if (blocks.inputs()[0].evaluate().toString() === world.children[0].stage.name) {return 'world.children[0].stage';} else {
return '\(function anonymous \(selectedName\) \{return world.children[0].stage.children.find\(child => \(child.name === selectedName\)\);\}\)\(\'' + blocks.inputs()[0].evaluate().toString() + '\'\)';};
} else if (blocks.selector === 'reportNot') {return '\(!' + reportBasicToJS(blocks.inputs()[0]) + '\)'
} else if (blocks.selector === 'reportBoolean') {return blocks.inputs()[0].evaluate();} else if (blocks.selector === 'reportJoinWords') {return '\'\'.concat\(' + reportBasicToJS(blocks.inputs()[0]) + '\)';
} else if (blocks.selector === 'reportLetter') {
return ((contains(['number', 'Boolean'], (new Process).reportTypeOf(reportBasicToJS(blocks.inputs()[1]))) ? ('\'' + reportBasicToJS(blocks.inputs()[1]) + '\'') : (reportBasicToJS(blocks.inputs()[1])))) + '.charAt\('
+ ((contains(['number', 'Boolean'], (new Process).reportTypeOf(reportBasicToJS(blocks.inputs()[0]))) ? (reportBasicToJS(blocks.inputs()[0]) - 1) : (reportBasicToJS(blocks.inputs()[0])) + ' - 1')) + '\)';
} else if (blocks.selector === 'reportStringSize') {
return ((contains(['number', 'Boolean'], (new Process).reportTypeOf(reportBasicToJS(blocks.inputs()[0]))) ? ('\'' + reportBasicToJS(blocks.inputs()[0]) + '\'') : (reportBasicToJS(blocks.inputs()[0])))) + '.length';
} else if (blocks.selector === 'reportJSFunction') {return '\(function anonymous \(' + blocks.inputs()[0].evaluate() + '\n\) \{\n' + blocks.inputs()[1].evaluate() + '\n\}\)';
} else if (blocks.selector === 'reportScript') {return '\(' + (new Function(blocks.inputs()[0].evaluate(), reportBasicToJS(blocks.inputs()[1].nestedBlock()))) + '\)';
} else if (blocks.selector === 'reify') {return '\(' + (new Function(blocks.inputs()[1].evaluate(), reportBasicToJS(blocks.inputs()[0].nestedBlock()))) + '\)';
} else if (blocks.selector === 'reportNewList') {return 'new List\(' + reportBasicToJS(blocks.inputs()[0]) + '\)';
} else if (blocks.selector === 'reportNumbers') {return '\(\(new Process\).reportNumbers\(' + reportBasicToJS(blocks.inputs()[0]) + ',' + reportBasicToJS(blocks.inputs()[1]) + '\)\)';
} else if (blocks.selector === 'reportConcatenatedLists') {return '\(new List\(\[\].concat\(' + reportBasicToJS(blocks.inputs()[0]) + '\)\)\)';
} else if (blocks.selector === 'evaluateCustomBlock') {return reportBasicToJS(blocks.definition.body.toBlock()) + '.apply\(this, \[' + blocks.inputs().map(value => reportBasicToJS(value)) + '\]\);';
} else if (blocks.selector === 'reportGetVar') {return blocks.blockSpec;} else {return '';};} else {return '';};};
function reportToJS (input) {if (input instanceof List) {return new List(input.asArray().map(miniInput => reportToJS(miniInput)));}
else if (input instanceof Context) {return reportBasicToJS(input);} else {return reportBasicToJS(new Context());};};

function JSBlocksCompiler (morphs) {var result = '';
if (morphs instanceof CommandBlockMorph) {
if (morphs.selector === 'JSBlocksReturnStatement') {
result = result.concat('return '.concat(JSBlocksCompiler(morphs.children[1]), '\;'));
} else if (morphs.selector === 'JSBlocksSwitchStatement') {
result = result.concat('switch \('.concat((JSBlocksCompiler(morphs.children[0]) === '' ? 'null' : JSBlocksCompiler(morphs.children[0])),
'\) \{\n', JSBlocksCompiler(morphs.inputs()[1].nestedBlock()), '\}\;'));
} else if (morphs.selector === 'JSBlocksCaseStatement') {
result = result.concat('case \('.concat((JSBlocksCompiler(morphs.children[0]) === '' ? 'null' : JSBlocksCompiler(morphs.children[0])),
'\) :\n', JSBlocksCompiler(morphs.inputs()[1].nestedBlock())));
} else if (morphs.selector === 'JSBlocksBreakStatement') {
result = result.concat('break'.concat((morphs.inputs()[0].inputs().length === 0 ? '' : (' ').concat(morphs.inputs()[0].inputs(
)[0].blockSpec)), '\;'));
} else if (morphs.selector === 'JSBlocksContinueStatement') {result = result.concat('continue'.concat(
(morphs.inputs()[0].inputs().length === 0 ? '' : (' ').concat(morphs.inputs()[0].inputs()[0].blockSpec)), '\;'));
} else if (morphs.selector === 'JSBlocksWithStatement') {
result = result.concat('with \('.concat((JSBlocksCompiler(morphs.children[0]) === '' ? 'null' : JSBlocksCompiler(morphs.children[0])),
'\) \{\n', JSBlocksCompiler(morphs.inputs()[1].nestedBlock()), '\}\;'));
} else {
result = result.concat((JSBlocksCompiler(morphs.children[0].nestedBlock()) === '' ? 'null' : JSBlocksCompiler(
morphs.children[0].nestedBlock())).concat('\;'));
}; if (morphs.nextBlock() instanceof CommandBlockMorph) {result = result.concat(
'\n', JSBlocksCompiler(morphs.nextBlock()));}; return result;
} else if (morphs instanceof ReporterBlockMorph) {
if (morphs.selector === 'JSBlocksTraditionalFunction') {return ''.concat(morphs.inputs()[0].evaluate(), ((morphs.inputs(
)[0].evaluate() === '') ? '' : ' '), morphs.inputs()[1].evaluate(), ' ', morphs.inputs()[2].contents().text, ((morphs.inputs(
)[2].contents().text === '') ? '' : ' '), '\(', morphs.inputs()[3].evaluate(), '\) \{\n', JSBlocksCompiler(morphs.inputs(
)[4].nestedBlock()), '\}');
} else if (morphs.selector === 'JSBlocksArrowClosureFunction') {return '\('.concat(morphs.inputs(
)[0].evaluate(), '\) \=\> \{', JSBlocksCompiler(morphs.inputs()[1].nestedBlock()), '\}');
} else if (morphs.selector === 'JSBlocksArrowResultFunction') {
return '\('.concat(morphs.inputs()[0].evaluate(), '\) \=\> ', '\(', (JSBlocksCompiler(
morphs.inputs()[1]) === '' ? 'null' : JSBlocksCompiler(morphs.inputs()[1])), '\)');
} else if (morphs.selector === 'reportGetVar') {return morphs.blockSpec;
} else if (morphs.selector === 'reportBoolean') {return morphs.children[0].evaluate();
} else if (morphs.selector === 'JSBlocksArray') {return ('\[').concat(JSBlocksCompiler(morphs.inputs()[0]), '\]');
} else if (morphs.selector === 'JSBlocksCloser') {return ('\(').concat(JSBlocksCompiler(morphs.inputs()[0]), '\)');
} else if (morphs.selector === 'JSBlocksString1') {return ('\'').concat(morphs.children[1].evaluate(), '\'');
} else if (morphs.selector === 'JSBlocksString2') {return ('\"').concat(morphs.children[1].evaluate(), '\"');
} else if (morphs.selector === 'JSBlocksString3') {return ('\`').concat(morphs.children[1].evaluate(), '\`');
} else if (morphs.selector === 'JSBlocksObjectProp1') {return (JSBlocksCompiler(
morphs.inputs()[0].nestedBlock())).concat('\[', JSBlocksCompiler(morphs.inputs()[1]), '\]');
} else if (morphs.selector === 'JSBlocksObjectProp2') {return JSBlocksCompiler(morphs.inputs()[0]);
} else if (morphs.selector === 'JSBlocksCall') {return '\('.concat(JSBlocksCompiler(morphs.inputs()[0].nestedBlock()),
'\)\(', JSBlocksCompiler(morphs.inputs()[1]), '\)');
} else if (morphs.selector === 'JSBlocksObjectDeclaration') {
return ('\{').concat(JSBlocksCompiler(morphs.inputs()[0]), '\}');
} else if (morphs.selector === 'JSBlocksObjectProperty') {
return JSBlocksCompiler(morphs.inputs()[0]).concat(' \: ', JSBlocksCompiler(morphs.inputs()[1]));
} else if (morphs.selector === 'JSBlocksNewObject') {
return ('new ').concat(JSBlocksCompiler(morphs.children[1]));
} else if (morphs.selector === 'JSBlocksNewTarget') {return 'new.target';
} else if (morphs.selector === 'JSBlocksNotOperator') {
return ('!').concat(JSBlocksCompiler(morphs.children[1]));
} else {return '';};} else if (
morphs instanceof MultiArgMorph) {return (function anonymous (morphs) {var theChildren = morphs.inputs(),
i = 0, miniResult = ''; while (i < theChildren.length) {if (i === (theChildren.length - 1)) {
miniResult = miniResult.concat(JSBlocksCompiler(theChildren[i]));} else {
miniResult = miniResult.concat(JSBlocksCompiler(theChildren[i]), morphs.infix);
}; i++;}; return miniResult;})(morphs);} else if (morphs instanceof TextSlotMorph) {
return morphs.contents().text;} else if (morphs instanceof InputSlotMorph) {
return morphs.contents().text;} else {return '';};};