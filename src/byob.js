/*

    byob.js

    "build your own blocks" for Snap!
    based on morphic.js, widgets.js blocks.js, threads.js and objects.js
    inspired by Scratch

    written by Jens Mönig
    jens@moenig.org

    Copyright (C) 2023 by Jens Mönig

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
    needs blocks.js, threads.js, objects.js, widgets.js and morphic.js


    hierarchy
    ---------
    the following tree lists all constructors hierarchically,
    indentation indicating inheritance. Refer to this list to get a
    contextual overview:

    BlockLabelFragment
    CustomBlockDefinition

    Morph*
        BlockLabelFragmentMorph
        BlockLabelPlaceHolderMorph

    DialogBoxMorph**
        BlockDialogMorph
        BlockEditorMorph
        BlockExportDialogMorph
        BlockImportDialogMorph
        BlockRemovalDialogMorph
        BlockVisibilityDialogMorph
        InputSlotDialogMorph
        VariableDialogMorph

    CommandBlockMorph***
        CustomCommandBlockMorph
        PrototypeHatBlockMorph

    DefinitorBlockMorph***
        CustomDefinitorBlockMorph

    ReporterBlockMorph***
        CustomReporterBlockMorph
        JaggedBlockMorph

    TemplateSlotMorph***
        BlockInputFragmentMorph

    * from morphic.js
    ** from widgets.js
    *** from blocks.js


    toc
    ---
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

    CustomBlockDefinition
    CustomCommandBlockMorph
    CustomDefinitorBlockMorph
    CustomReporterBlockMorph
    JaggedBlockMorph
    BlockDialogMorph
    BlockEditorMorph
    PrototypeHatBlockMorph
    BlockLabelFragmentMorph
    BlockLabelPlaceHolderMorph
    BlockInputFragmentMorph
    InputSlotDialogMorph
    VariableDialogMorph
    BlockExportDialogMorph
    BlockImportDialogMorph
    BlockRemovalDialogMorph
    BlockVisibilityDialogMorph

*/

// Declarations

var CustomBlockDefinition, CustomCommandBlockMorph, BlockVisibilityDialogMorph,
CustomReporterBlockMorph, CustomDefinitorBlockMorph, BlockLabelPlaceHolderMorph,
BlockLabelFragment, BlockLabelFragmentMorph, BlockInputFragmentMorph,
PrototypeHatBlockMorph, BlockEditorMorph, InputSlotDialogMorph,
VariableDialogMorph, JaggedBlockMorph, BlockExportDialogMorph,
BlockDialogMorph, BlockImportDialogMorph, BlockRemovalDialogMorph;

// CustomBlockDefinition ///////////////////////////////////////////////

// CustomBlockDefinition instance creation:

function CustomBlockDefinition (spec, receiver) {
this.body = null; this.scripts = []; (this.category
) = null; this.isGlobal = false; this.spec = (isNil(
spec) ? '' : spec); this.specialBlockType = 'color';
this.type = 'command'; this.declarations = new Map;
this.isCap = false; this.isSpecialReporter = false;
this.variableNames = []; this.comment = null; (this
).isHelper = false; this.password = ''; (this
).codeMapping = null; this.codeHeader = (null
); this.translations = {}; this.receiver = (
receiver || null); (this.editorDimensions
) = null; this.cachedIsRecursive = null;
this.cachedTranslation = null; (this
).storedSemanticSpec = null;};

// CustomBlockDefinition instantiating blocks

CustomBlockDefinition.prototype.blockInstance = function (storeTranslations) {
    var block;
    if (this.type === 'command') {
        block = new CustomCommandBlockMorph(this);
    } else if (this.type === 'definitor') {
        block = new CustomDefinitorBlockMorph(this);
    } else {
        block = new CustomReporterBlockMorph(
            this,
            this.type === 'predicate',
            false,
            this.type === 'arrow'
        );
    };  block.isDraggable = true;
    if (storeTranslations) {
        block.storedTranslations = this.translationsAsText();
    };  return block;};

CustomBlockDefinition.prototype.templateInstance = function (
) {var block = this.blockInstance(); block.refreshDefaults(this);
block.isDraggable = false; block.isTemplate = true; return block;};

CustomBlockDefinition.prototype.prototypeInstance = function () {
    var block, slot;

    // make a new block instance and mark it as prototype
    if (this.type === 'command') {
        block = new CustomCommandBlockMorph(this, true);
    } else if (this.type === 'definitor') {
        block = new CustomDefinitorBlockMorph(this, true);
    } else {
        block = new CustomReporterBlockMorph(
            this, this.type === 'predicate',
            true, this.type === 'arrow');
    };  block.parts().forEach(part => {
        if (part instanceof BlockInputFragmentMorph) {
            slot = this.declarations.get(part.fragment.labelString);
            if (slot) {
                part.fragment.type = slot[0];
                part.fragment.defaultValue = slot[1];
                part.fragment.options = slot[2];
    if (contains(['%s', '%n', '%txt', '%mlt', '%code', '%anyUE',
    '%numericUE', '%textingUE', '%linesUE', '%codeUE'], slot[0])) {
    part.fragment.isReadOnly = slot[3] || false;
    part.fragment.isStatic = slot[4] || false;};
    part.fragment.separator = slot[5] || null;
    };};}); return block;};

// CustomBlockDefinition duplicating

CustomBlockDefinition.prototype.copyAndBindTo = (
function (sprite, headerOnly) {var c = copy(this);

    delete c[XML_Serializer.prototype.idProperty];
    c.receiver = sprite; // only for (kludgy) serialization

    // copy declarations
    c.declarations = new Map;
    for (var [key, val] of this.declarations) {
        c.declarations.set(key, val);
    };  if (headerOnly) {// for serializing inherited method signatures
        c.body = null;
        return c;
    };  if (c.body) {
        c.body = Process.prototype.reify.call(
            null,
            this.body.expression,
            new List(this.inputNames())
        );  c.body.outerContext = null;
    };  // deep copy scripts
    c.scripts = (this.scripts).map(
    each => each.fullCopy()); return c;});

// CustomBlockDefinition accessing

CustomBlockDefinition.prototype.blockSpec = function (
        ) {if (this.storedSemanticSpec) {
            return this.storedSemanticSpec;
        /* for "wishes" */}; var ans = [],
        parts = this.parseSpec(this.spec
        ), spec; parts.forEach(part => {
        if ((part[0] === '%') && ((part.length
        ) > 1)) {spec = this.typeOf(part.slice(
        1));} else if (part.includes('$nl')) {
        spec = '%br';} else {spec = part;};
        ans.push(spec); ans.push(' ');});
    return ''.concat.apply('', ans).trim();};

CustomBlockDefinition.prototype.helpSpec = function () {
    var ans = [],    parts = this.parseSpec(this.spec);
    parts.forEach(part => {
        if (part[0] !== '%') {
            ans.push(part);};
    }); return ''.concat.apply(
    '', ans).replace(/\?/g, '');};

CustomBlockDefinition.prototype.typeOf = function (inputName) {
    if (this.declarations.has(inputName)) {
        return this.declarations.get(
        inputName)[0];}; return '%s';};

CustomBlockDefinition.prototype.defaultValueOf = function (inputName) {return (
this.declarations.has(inputName) ? this.declarations.get(inputName)[1] : '');};

CustomBlockDefinition.prototype.defaultValueOfInputIdx = function (idx) {
    var inputName = this.inputNames()[idx];
    return this.defaultValueOf(inputName);};

CustomBlockDefinition.prototype.dropDownMenuOfInputIdx = function (idx) {
    var inputName = this.inputNames()[idx];
    return this.dropDownMenuOf(inputName);};

CustomBlockDefinition.prototype.isReadOnlyInputIdx = function (idx) {
    var inputName = this.inputNames()[idx];
    return this.isReadOnlyInput(inputName);};

CustomBlockDefinition.prototype.isStaticInputIdx = function (idx) {
    var inputName = this.inputNames()[idx];
    return this.isStaticInput(inputName);};

CustomBlockDefinition.prototype.separatorOfInputIdx = function (idx) {
    var inputName = this.inputNames()[idx];
    return this.separatorOfInput(inputName);};

CustomBlockDefinition.prototype.inputOptionsOfIdx = function (idx) {
    var inputName = this.inputNames()[idx];
    return this.inputOptionsOf(inputName);};

CustomBlockDefinition.prototype.dropDownMenuOf = function (inputName) {
    var fname;
    if (this.declarations.has(inputName) &&
            this.declarations.get(inputName)[2]) {
        if ((this.declarations.get(inputName)[2].indexOf('§_') === 0)) {
            fname = this.declarations.get(inputName)[2].slice(2);
            if (contains(
                [
                    'messagesMenu',
                    'messagesReceivedMenu',
                    'objectsMenu',
                    'costumesMenu',
                    'soundsMenu',
                    'getVarNamesDict',
                    'pianoKeyboardMenu',
                    'directionDialMenu',
                    'typesMenu',
                    'midsMenu'
                ],
                fname
            ) || fname.indexOf(
            'ext_') === 0) {
            return fname;};
        };  return this.parseChoices(
        this.declarations.get(inputName
        )[2]);}; return null;};

CustomBlockDefinition.prototype.parseChoices = function (string) {
    var dict = {},
        stack = [dict],
        params, body;
    if (string.match(/^function\s*\(.*\)\s*{.*\n/)) {
        // It's a JS function definition.
        // Let's extract its params and body, and return a Function out of them.
        params = string.match(/^function\s*\((.*)\)/)[1].split(',');
        body = string.split('\n').slice(1,-1).join('\n');
        return Function.apply(null, params.concat([body]));
    }; string.split('\n').forEach(line => {
        var pair = line.split('=');
        if (pair[0] === '}') {
            stack.pop();
            dict = stack[stack.length - 1];
        } else if (pair[1] === '{') {
            dict = {};
            stack[stack.length - 1][pair[
            0]] = dict; stack.push(dict);
        } else {dict[pair[0]] = isNil(pair[1]
        ) ? pair[0] : pair[1];};}); return dict;};

CustomBlockDefinition.prototype.menuSearchWords = function () {
    // return a single string containing words that can be searched for
    // inside my dropdown menus
    var terms = [];
    this.inputNames().forEach(slot => {
        var menu = this.dropDownMenuOf(slot);
        if (menu) {
            if (isString(menu)) { // special menu, translates its values
                if (typeof InputSlotMorph.prototype[menu] === 'function') {
                    // catch typos in extension menus
                    menu = InputSlotMorph.prototype[menu](true);
                    terms.push(
                        Object.values(menu).map(entry => {
                            if (isNil(entry)) {return ''; }
                            if (entry instanceof Array) {
                                return localize(entry[0]);
                            }
                            return entry.toString();
                        }).join(' ')
                    );
                }
            } else { // assume a dictionary, take its keys
                terms.push(Object.keys(menu).join(' '));
            };
        };
    }); return terms.join(' ').toLowerCase();};

CustomBlockDefinition.prototype.isReadOnlyInput = function (inputName) {
    return this.declarations.has(inputName) &&
        this.declarations.get(inputName)[3] === true;
};

CustomBlockDefinition.prototype.isStaticInput = function (inputName) {
    return this.declarations.has(inputName) &&
        this.declarations.get(inputName)[4] === true;
};

CustomBlockDefinition.prototype.separatorOfInput = function (inputName) {
    if (this.declarations.has(inputName)) {
        return this.declarations.get(inputName)[5] || null;
    }; return null;
};

CustomBlockDefinition.prototype.inputOptionsOf = function (inputName) {
    return [
        this.dropDownMenuOf(inputName),
        this.isReadOnlyInput(inputName),
        this.isStaticInput(inputName)
    ];
};

CustomBlockDefinition.prototype.inputNames = function () {
    var vNames = [],
        parts = this.parseSpec(this.spec);
    parts.forEach(part => {
        if (part[0] === '%' && part.length > 1) {
            vNames.push(part.slice(1));
        };
    });
    return vNames;
};

CustomBlockDefinition.prototype.parseSpec = function (spec) {
    // private
    var parts = [], word = '', i, quoted = false, c;
    for (i = 0; i < spec.length; i += 1) {
        c = spec[i];
        if (c === "'") {
            quoted = !quoted;
        } else if (c === ' ' && !quoted) {
            parts.push(word);
            word = '';
        } else {
            word = word.concat(c);
        };
    }; parts.push(word);
    return parts;
};

CustomBlockDefinition.prototype.isDirectlyRecursive = function () {
    var myspec;
    if (this.cachedIsRecursive !== null) {
        return this.cachedIsRecursive;
    }; if (!this.body) {
        this.cachedIsRecursive = false;
    } else {
        myspec = this.blockSpec();
        this.cachedIsRecursive = this.body.expression.anyChild(
            function (morph) {
                return morph.isCustomBlock &&
                    morph.blockSpec === myspec;
            }
        );
    }; return this.cachedIsRecursive;
};

// CustomBlockDefinition localizing, highly experimental

CustomBlockDefinition.prototype.localizedSpec = function () {
	if (this.cachedTranslation) {return this.cachedTranslation; }

	var loc = this.translations[SnapTranslator.language],
		sem = this.blockSpec(),
        locParts,
  		inputs,
    	i = -1;

	function isInput(str) {
    	return (str.length > 1) && (str[0] === '%');
 	};

    if (isNil(loc)) {return sem;};
    inputs = BlockMorph.prototype.parseSpec(sem).filter(str => isInput(str));
	locParts = BlockMorph.prototype.parseSpec(loc);

	// perform a bunch of sanity checks on the localized spec
	if (locParts.some(str => isInput(str)) ||
 			(locParts.filter(str => str === '_').length !== inputs.length)
    ) {
 		this.cachedTranslation = sem;
    } else {
		// substitute each input place holder with its semantic spec part
		locParts = locParts.map(str => {
			if (str === '_') {
  				i += 1;
  				return inputs[i];
			};
		return str;
		});   this.cachedTranslation = locParts.join(' ');
   	};	return this.cachedTranslation;
};

CustomBlockDefinition.prototype.abstractBlockSpec = function () {
	// answer the semantic block spec substituting each input
 	// with an underscore
    return BlockMorph.prototype.parseSpec(this.blockSpec()).map(str =>
        (str.length > 1 && (str[0]) === '%') ? '_' : str
    ).join(' ');
};

CustomBlockDefinition.prototype.translationsAsText = function () {
	var txt = '';
	Object.keys(this.translations).forEach(lang =>
 		txt += (lang + ':' + this.translations[lang] + '\n')
    );  return txt;
};

CustomBlockDefinition.prototype.updateTranslations = function (text) {
	var lines = text.split('\n').filter(txt => txt.length);
	this.translations = {};
 	lines.forEach(txt => {
  		var idx = txt.indexOf(':'),
    		key = txt.slice(0, idx).trim(),
      		val = txt.slice(idx + 1).trim();
    	if (idx) {
     		this.translations[key] = val;
     	};
    });
};

// CustomBlockDefinition picturing

CustomBlockDefinition.prototype.scriptsPicture = function () {
    return this.scriptsModel().scriptsPicture();
};

CustomBlockDefinition.prototype.sortedElements = function () {
    return this.scriptsModel().sortedElements();
};

CustomBlockDefinition.prototype.scriptsModel = function () {
    // answer a restored scripting area for the sake
    // of creating script pictures
    var scripts, proto, block, comment, template;

    scripts = new ScriptsMorph();
    scripts.cleanUpMargin = 10;
    proto = new PrototypeHatBlockMorph(this);
    proto.setPosition(scripts.position().add(10));
    if (this.comment !== null) {
        comment = this.comment.fullCopy();
        proto.comment = comment;
        comment.block = proto;
    };  if (!isNil(this.body)) {
        proto.nextBlock(this.body.expression.fullCopy());
    };  scripts.add(proto);
    proto.fixBlockColor(null, true);
    this.scripts.forEach(element => {
        block = element.fullCopy();
        block.setPosition(scripts.position().add(element.position()));
        scripts.add(block);
        if (block instanceof BlockMorph) {
            block.allComments().forEach(comment =>
                comment.align(block)
            );
        };
    }); proto.allComments().forEach(comment =>
        comment.align(proto)
    );  template = proto.parts(
    )[1];   template.fixLayout();
    template.forceNormalColoring();
    template.fixBlockColor(proto, true);
    scripts.fixMultiArgs();
    return scripts;
};

// CustomBlockDefinition purging deleted blocks

CustomBlockDefinition.prototype.purgeCorpses = function () {
    // remove blocks that have been marked for deletion
    if (this.body && this.body.expression.isCorpse) {
        this.body = null;
    }
    this.scripts = this.scripts.filter(topBlock =>
        !topBlock.isCorpse
    );
};

// CustomBlockDefinition dependencies

CustomBlockDefinition.prototype.collectDependencies = function (
    excluding,
    result,
    localReceiver // optional when exporting sprite-local blocks
) {
    if (!this.isGlobal && !localReceiver) {
        throw new Error('cannot collect dependencies for local\n' +
            'custom blocks of an unspecified sprite');
    }
    excluding.push(this);
    this.scripts.concat(
        this.body ? [this.body.expression] : []
    ).forEach(script => {
        script.forAllChildren(morph => {
            var def;
            if (morph.isCustomBlock) {
                def = morph.isGlobal ? morph.definition
                    : localReceiver.getMethod(morph.blockSpec);
                if (!contains(excluding, def) && !contains(result, def)) {
                    result.push(def);
                    def.collectDependencies(
                        excluding,
                        result,
                        localReceiver
                    );
                }
            }
        });
    });
    return result;
};

CustomBlockDefinition.prototype.isSending = function (message, receiverName) {
    return this.scripts.concat(
        this.body ? [this.body.expression] : []
    ).some(script => script instanceof BlockMorph &&
        script.isSending(message, receiverName)
    );
};

// CustomCommandBlockMorph /////////////////////////////////////////////

// CustomCommandBlockMorph inherits from CommandBlockMorph:

CustomCommandBlockMorph.prototype = new CommandBlockMorph;
CustomCommandBlockMorph.prototype.constructor = CustomCommandBlockMorph;
CustomCommandBlockMorph.uber = CommandBlockMorph.prototype;

// CustomCommandBlockMorph shared settings:

CustomCommandBlockMorph.prototype.isCustomBlock = true;

// CustomCommandBlockMorph instance creation:

function CustomCommandBlockMorph(definition, isProto) {
    this.init(definition, isProto);
};

CustomCommandBlockMorph.prototype.init = function (definition, isProto) {
    this.definition = definition;
    this.semanticSpec = '';
    this.isGlobal = definition ? definition.isGlobal : false;
    this.isPrototype = isProto || false;
    CustomCommandBlockMorph.uber.init.call(this);
    if (isProto) {this.isTemplate = true;};
    this.category = definition.category;
    this.selector = 'evaluateCustomBlock';
    this.variables = null;
    this.storedTranslations = null;
    this.initializeVariables();
    if (definition) {this.refresh();};
};

CustomCommandBlockMorph.prototype.reactToTemplateCopy = function () {
    var def; if (this.isPrototype
        ) {def = this.definition;
        this.isPrototype = false;
        this.setSpec(' ');
        this.refresh();
        this.refreshDefaults(def);
    };  CustomCommandBlockMorph.uber.reactToTemplateCopy.call(this);};

CustomCommandBlockMorph.prototype.initializeVariables = function (oldVars) {
    this.variables = new VariableFrame;
    if (!this.isGlobal) {
        return;
    }
    this.definition.variableNames.forEach(name => {
        var v = oldVars ? oldVars[name] : null;
        this.variables.addVar(
            name,
            v instanceof Variable ? v.value : null
        );
    });
};

CustomCommandBlockMorph.prototype.refresh = function (aDefinition) {
    var def = aDefinition || this.definition,
        newSpec = this.isPrototype ?
                def.spec : def.localizedSpec(),
        oldInputs;

	this.semanticSpec = def.blockSpec();

    // make sure local custom blocks don't hold on to a method.
    // future performance optimization plan:
    // null out the definition for local blocks here,
    // and then cache them again when invoking them
    if (!this.isGlobal && !this.isPrototype) {
        this.definition = null;
    };

    this.setCategory(def.category);
    if (this.blockSpec !== newSpec) {
        oldInputs = this.inputs();
        if (!this.zebraContrast) {
            this.forceNormalColoring();
        } else {
            this.fixBlockColor();
        }
        this.setSpec(newSpec, def);
        this.fixLabelColor();
        this.restoreInputs(oldInputs);
    } else { // update all input slots' drop-downs
        this.inputs().forEach((inp, i) => {
            if (inp instanceof InputSlotMorph) {
                inp.setChoices.apply(inp, def.inputOptionsOfIdx(i));
            }
        });
    }

    // find unnamed upvars (indicated by non-breaking space) and label them
    // to their internal definition (default)
    this.cachedInputs = null;
    this.inputs().forEach((inp, idx) => {
        if (inp instanceof TemplateSlotMorph && inp.contents() === '\xa0') {
            inp.setContents(def.inputNames()[idx]);
        } else if (inp instanceof MultiArgMorph) {
            inp.setInfix(def.separatorOfInputIdx(idx));
        }
    });

    // initialize block vars
    // preserve values of unchanged variable names
    if (this.isGlobal) {
        this.initializeVariables(this.variables.vars);
    }

    // make (double) sure I'm colored correctly
    this.forceNormalColoring();
    this.fixBlockColor(null, true);
};

CustomCommandBlockMorph.prototype.restoreInputs = BlockMorph.prototype.restoreInputs;

CustomCommandBlockMorph.prototype.refreshDefaults = function (definition) {
    // fill my editable slots with the defaults specified in my definition
    var inputs = this.inputs(),
        idx = 0;

    inputs.forEach(inp => {
        if (inp instanceof InputSlotMorph || inp instanceof BooleanSlotMorph) {
            inp.setContents(
                (definition || this.definition).defaultValueOfInputIdx(idx)
            );
        }
        idx += 1;
    });
    this.cachedInputs = null;
};

CustomCommandBlockMorph.prototype.refreshPrototype = function () {
    // create my label parts from my (edited) fragments only
    var hat,
        protoSpec,
        frags = [],
        myself = this, // CAUTION: myself changes its value in this method
        words,
        newFrag,
        i = 0;

    if (!this.isPrototype) {return null; }

    hat = this.parentThatIsA(PrototypeHatBlockMorph);

    // remember the edited fragments
    this.parts().forEach(part => {
        if (!part.fragment.isDeleted) {
            // take into consideration that a fragment may spawn others
            // if it isn't an input label consisting of several words
            if (part.fragment.type) { // marked as input, take label as is
                frags.push(part.fragment);
            } else { // not an input, devide into several non-input fragments
                words = myself.definition.parseSpec(
                    part.fragment.labelString
                );
                words.forEach(word => {
                    newFrag = part.fragment.copy();
                    newFrag.labelString = word;
                    frags.push(newFrag);
                });
            }
        }
    });

    // remember the edited prototype spec,
    // and prevent removing the last one
    protoSpec = this.specFromFragments() || this.blockSpec;

    // update the prototype's type
    // and possibly exchange 'this' for 'myself'
    if (this instanceof CustomCommandBlockMorph
            && ((hat.type === 'reporter') || (hat.type === 'predicate'))) {
        myself = new CustomReporterBlockMorph(
            this.definition,
            hat.type === 'predicate',
            true,
            hat.type === 'arrow'
        );
        hat.replaceInput(this, myself);
    } else if (this instanceof CustomReporterBlockMorph) {
        if (hat.type === 'command') {
            myself = new CustomCommandBlockMorph(
                this.definition,
                true
            );
            hat.replaceInput(this, myself);
        } else {
            this.isPredicate = (hat.type === 'predicate');
            this.fixLayout();
            this.rerender();
        }
    }
    myself.setCategory(hat.blockCategory || 'other');
    hat.fixBlockColor();

    // update the (new) prototype's appearance
    myself.setSpec(protoSpec);

    // update the (new) prototype's (new) fragments
    // with the previously edited ones

    myself.parts().forEach(part => {
        if (!(part instanceof BlockLabelPlaceHolderMorph)) {
            if (frags[i]) { // don't delete the default fragment
                part.fragment = frags[i];
            }
            i += 1;
        }
    });

    // refresh slot type indicators
    this.refreshPrototypeSlotTypes();

    hat.fixLayout();
};

CustomCommandBlockMorph.prototype.refreshPrototypeSlotTypes = function () {
    this.parts().forEach(part => {
        if (part instanceof BlockInputFragmentMorph) {
            part.template().instantiationSpec = part.contents();
            part.setContents(part.fragment.defTemplateSpecFragment());
        }
    });
    this.fixBlockColor(null, true); // enforce zebra coloring of templates
};

CustomCommandBlockMorph.prototype.inputFragmentNames = function () {
    // for the variable name slot drop-down menu (in the block editor)
    var ans = [];

    this.parts().forEach(part => {
        if (!part.fragment.isDeleted && (part.fragment.type)) {
            ans.push(part.fragment.labelString);
        }
    });
    return ans;
};

CustomCommandBlockMorph.prototype.upvarFragmentNames = function () {
    // for the variable name slot drop-down menu (in the block editor)
    var ans = [];

    this.parts().forEach(part => {
        if (!part.fragment.isDeleted && (part.fragment.type === '%upvar')) {
            ans.push(part.fragment.labelString);
        }
    });
    return ans;
};

CustomCommandBlockMorph.prototype.upvarFragmentName = function (idx) {
    // for block prototypes while they are being edited
    return this.upvarFragmentNames()[idx] || '\u2191';
};

CustomCommandBlockMorph.prototype.specFromFragments = function () {
    // for block prototypes while they are being edited
    var ans = '';

    this.parts().forEach(part => {
        if (!part.fragment.isDeleted) {
            ans = ans + part.fragment.defSpecFragment() + ' ';
        }
    });
    return ans.trim();
};

CustomCommandBlockMorph.prototype.blockSpecFromFragments = function () {
    // for block instances while their prototype is being edited
    var ans = '';

    this.parts().forEach(part => {
        if (!part.fragment.isDeleted) {
            ans = ans + part.fragment.blockSpecFragment() + ' ';
        }
    });
    return ans.trim();
};

CustomCommandBlockMorph.prototype.declarationsFromFragments = function () {
    // returns a Map object for type declarations:
    //     key: inputName
    //     value: [type, default, options, isReadOnly, isStatic, separator]
    var ans = new Map;

    this.parts().forEach(part => {
        if (part instanceof BlockInputFragmentMorph) {
            ans.set(
                part.fragment.labelString,
                [
                    part.fragment.type,
                    part.fragment.defaultValue,
                    part.fragment.options,
                    part.fragment.isReadOnly,
                    part.fragment.isStatic,
                    part.fragment.separator
                ]
            );
        }
    });
    return ans;
};

CustomCommandBlockMorph.prototype.parseSpec = function (spec) {
    if (!this.isPrototype) {
        return CustomCommandBlockMorph.uber.parseSpec.call(this, spec);
    }
    return CustomBlockDefinition.prototype.parseSpec(spec);
};

CustomCommandBlockMorph.prototype.mouseClickLeft = function () {
    if (!this.isPrototype) {
        return CustomCommandBlockMorph.uber.mouseClickLeft.call(this);
    }
    this.edit();
};

CustomCommandBlockMorph.prototype.edit = function () {
    var def = this.definition,
        editor, block,
        hat,
        rcvr;

if (this.isPrototype) {
        block = this.definition.blockInstance();
        block.addShadow();
        hat = this.parentThatIsA(PrototypeHatBlockMorph);
        new BlockDialogMorph(
            null,
            (definition) => {
                if (definition) { // temporarily update everything
                    hat.blockCategory = definition.category;
                    hat.type = definition.type;
                    this.refreshPrototype();
                }
            },
            this
        ).openForChange(
            'Change block',
            hat.blockCategory,
            hat.type, world,
            block.doWithAlpha(1, () => block.fullImage()),
            this.isInUse()
        );
    } else {
if (this.definition instanceof CustomBlockDefinition) {if (this.definition.password.length > 0) {var match = window.prompt('Fill the password here\:'); if (
!(Process.prototype.reportListAttribute(['csv'], Process.prototype.reportPower(Process.prototype.reportUnicode(match), 2)) === this.definition.password)) {
window.alert('Incorrect Password!'); return;};};}; // check for local custom block inheritance
        rcvr = this.scriptTarget();
        if (!this.isGlobal) {
            if (contains(
                    Object.keys(rcvr.inheritedBlocks()),
                    this.blockSpec
                )
            ) {
                this.duplicateBlockDefinition();
                return;
            };
            def = rcvr.getMethod(this.semanticSpec);
        };
        editor = new BlockEditorMorph(def, rcvr);
        editor.popUp();
        editor.changed();
    };};

CustomCommandBlockMorph.prototype.labelPart = function (spec) {
    if (!this.isPrototype) {
        return CustomCommandBlockMorph.uber.labelPart.call(this, spec);
    }
    if ((spec[0] === '%') && (spec.length > 1)) {
        // return new BlockInputFragmentMorph(spec.slice(1));
        return new BlockInputFragmentMorph(spec.replace(/%/g, ''));
    }
    return new BlockLabelFragmentMorph(
        spec,
        CustomCommandBlockMorph.uber.labelPart.call(this, spec)
    );
};

CustomCommandBlockMorph.prototype.placeHolder = function (
) {var part = new BlockLabelPlaceHolderMorph;
part.fontSize = this.fontSize * 7/5;
part.color = new Color(45, 45, 45);
part.fixLayout(); return part;};

CustomCommandBlockMorph.prototype.attachTargets = function () {
    if (this.isPrototype) {
        return [];
    }
    return CustomCommandBlockMorph.uber.attachTargets.call(this);
};

CustomCommandBlockMorph.prototype.isInUse = function () {
    // answer true if an instance of my definition is found
    // in any of my receiver's scripts or block definitions
    // NOTE: for sprite-local blocks only to be used in a situation
    // where the user actively clicks on a block in the IDE,
    // e.g. to edit it (and change its type)
    var def = this.definition,
        rcvr = this.scriptTarget(),
        ide = rcvr.parentThatIsA(IDE_Morph);
    if (def.isGlobal && ide) {
        return ide.sprites.asArray().concat([ide.stage]).some((any, idx) =>
            any.usesBlockInstance(def, false, idx)
        );
    }
    return rcvr.allDependentInvocationsOf(this.blockSpec).length > 0;
};

// CustomCommandBlockMorph menu:

CustomCommandBlockMorph.prototype.userMenu = function () {
    var hat = this.parentThatIsA(PrototypeHatBlockMorph),
        rcvr = this.scriptTarget(),
        myself = this,
        // shiftClicked = this.world().currentKey === 16,
        dlg, menu;

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

   function monitor(vName) {
        var stage = rcvr.parentThatIsA(StageMorph),
            varFrame = myself.variables;
        menu.addItem(
            vName + '...',
            function () {
                var watcher = detect(
                    stage.children,
                    function (morph) {
                        return morph instanceof WatcherMorph
                            && morph.target === varFrame
                            && morph.getter === vName;
                    }
                ),
                    others;
                if (watcher !== null) {
                    watcher.show();
                    watcher.fixLayout(); // re-hide hidden parts
                    return;
                }
                watcher = new WatcherMorph(
                    vName + ' ' + localize('(temporary)'),
                    SpriteMorph.prototype.blockColor.variables,
                    varFrame,
                    vName
                );
                watcher.setPosition(stage.position().add(10));
                others = stage.watchers(watcher.left());
                if (others.length > 0) {
                    watcher.setTop(others[others.length - 1].bottom());
                }
                stage.add(watcher);
                watcher.fixLayout();
            }
        );
    }

    if (this.isPrototype) {
        menu = new MenuMorph(this);
        menu.addItem(
            "script pic...",
            function () {
                var ide = this.world().children[0];
                ide.saveCanvasAs(
                    this.topBlock().scriptPic(),
                    (ide.projectName || localize('untitled')) + ' ' +
                        localize('script pic')
                );
            },
            'open a new window\nwith a picture of this script'
        );
        menu.addItem(
            "translations...",
            () => hat.parentThatIsA(BlockEditorMorph).editTranslations()
        );
        if (this.isGlobal) {
            if (hat.children.length < 4) {
                menu.addItem(
                    "add block variables...",
                    () => hat.enableBlockVars(true)
                );
            } else {
                menu.addItem(
                    "remove block variables...",
                    () => hat.enableBlockVars(false)
                );
            }
        }
        addOption(
            'in palette',
            () => hat.isHelper = !hat.isHelper,
            !hat.isHelper,
            'uncheck to\nhide in palette',
            'check to\nshow in palette'
        ); if (hat.definition.isGlobal
        ) {if (hat.type === 'command') {
        menu.addItem(
            (hat.definition.isCap ? 'be command' : 'be cap'
            ), () => hat.definition.isCap = !hat.definition.isCap,
            (hat.definition.isCap ? "back to a command block" :
            "change to a cap block") /* special custom blocks XD */
        );}; if (hat.type === 'definitor') {
        menu.addItem(
            (hat.definition.isCap ? 'be definitor' : 'be cap'
            ), () => hat.definition.isCap = !hat.definition.isCap,
            (hat.definition.isCap ? "back to a definitor block" :
            "change to a cap block") /* special custom blocks XD */
        );}; if (hat.type === 'reporter') {
        menu.addItem(
            (hat.definition.isSpecialReporter ? 'be reporter' : 'be special'
            ), () => {hat.definition.isSpecialReporter = !hat.definition.isSpecialReporter;
            hat.definition.specialBlockType = 'color';}, (hat.definition.isSpecialReporter ?
            "back to a reporter block" : "change to a special block") /* special custom blocks XD */
        ); if (hat.definition.isSpecialReporter) {menu.addItem(
            ((hat.definition.specialBlockType === 'color') ? 'be lambda type' : 'be color type'
            ), () => hat.definition.specialBlockType = ((hat.definition.specialBlockType === 'color'
            ) ? 'lambda' : 'color'), ((hat.definition.specialBlockType === 'color'
            ) ? "change to a lambda block" : "back to a color block")
            /* special custom blocks XD */
        );};}; menu.addItem('change password...', () => {
            var newPassword = Process.prototype.reportPower(
            Process.prototype.reportUnicode(window.prompt(
            'Fill the new password here\:')), 2);
            hat.definition.password = ((newPassword instanceof List
            ) ? Process.prototype.reportListAttribute(['csv'],
            newPassword) : newPassword); window.alert((
            Process.prototype.reportJoinWords(newPassword
            ).length > 0) ? 'Password Changed!' : 'Password Deleted!'
            );}, "changes the current password" /* set a password
            (optional) to be the custom blocks more secure :-) */
        );};

        menu.addItem(
            "export...",
            () => hat.exportBlockDefinition(),
            'including dependencies'
        );
    } else {
        menu = this.constructor.uber.userMenu.call(this);
        dlg = this.parentThatIsA(DialogBoxMorph);
        if (dlg && !(dlg instanceof BlockEditorMorph)) {
            return menu;
        }
        if (!menu) {
            menu = new MenuMorph(this);
        } else {
            menu.addLine();
        }
        if (this.isTemplate) { // inside the palette
            if (this.isGlobal) {
                menu.addItem(
                    "delete block definition...",
                    'deleteBlockDefinition'
                );
            } else { // local method
                if (contains(
                        Object.keys(rcvr.inheritedBlocks()),
                        this.blockSpec
                )) {
                    // inherited
                    addOption(
                        'inherited',
                        function () {
                            var ide = myself.parentThatIsA(IDE_Morph);
                            rcvr.customBlocks.push(
                                rcvr.getMethod(
                                    myself.blockSpec
                                ).copyAndBindTo(rcvr)
                            );
                            if (ide) {
                                ide.flushPaletteCache();
                                ide.refreshPalette();
                            }
                        },
                        true,
                        'uncheck to\ndisinherit',
                        null
                    );
                } else if (rcvr.exemplar &&
                    rcvr.exemplar.getMethod(this.blockSpec
                )) {
                    // shadowed
                    addOption(
                        'inherited',
                        'deleteBlockDefinition',
                        false,
                        null,
                        localize('check to inherit\nfrom')
                            + ' ' + rcvr.exemplar.name
                    );
                } else {
                    // own block
                    menu.addItem(
                        "delete block definition...",
                        'deleteBlockDefinition'
                    );
                }
            }
            menu.addItem(
                "duplicate block definition...",
                'duplicateBlockDefinition'
            );
            menu.addItem(
                "export block definition...",
                'exportBlockDefinition',
                'including dependencies'
            );
        } else { // inside a script
            // if global or own method - let the user delete the definition
            if (this.isGlobal ||
                contains(
                    Object.keys(rcvr.ownBlocks()),
                    this.blockSpec
                )
            ) {
                menu.addItem(
                    "delete block definition...",
                    'deleteBlockDefinition'
                );
            }
        }

        this.variables.names().forEach(vName =>
            monitor(vName)
        );
    }

            menu.addLine();

menu.addItem(
     "move block to top",
     function () {
       var rcvr = this.scriptTarget(),
           ide = this.parentThatIsA(IDE_Morph),
           def = this.isGlobal ? this.definition : rcvr.getMethod(this.blockSpec),
           spec = def.spec;
    
       if (this.isGlobal) {
          ide.stage.globalBlocks = ide.stage.globalBlocks.filter(item => item !== def);

          ide.stage.globalBlocks.unshift(def);
       } else {
          rcvr.customBlocks = rcvr.customBlocks.filter(item => item !== def);
          rcvr.customBlocks.unshift(def);

       }

       ide.flushPaletteCache();
       ide.refreshPalette();
       ide.recordUnsavedChanges();
 
       }
    );
 menu.addItem(
     "move block to bottom",
     function () {
       var rcvr = this.scriptTarget(),
           ide = this.parentThatIsA(IDE_Morph),
           def = this.isGlobal ? this.definition : rcvr.getMethod(this.blockSpec),
           spec = def.spec;
    
       if (this.isGlobal) {
          ide.stage.globalBlocks = ide.stage.globalBlocks.filter(item => item !== def);

          ide.stage.globalBlocks.push(def);
       } else {
          rcvr.customBlocks = rcvr.customBlocks.filter(item => item !== def);
          rcvr.customBlocks.push(def);

       }

       ide.flushPaletteCache();
       ide.refreshPalette();
       ide.recordUnsavedChanges();
 
       }
    );

    menu.addPair([new SymbolMorph(
    'arrowUp', MorphicPreferences.menuFontSize
    ), localize('move up')], (() => (
    this.moveInPalette(true))), null,
    'move one up in the palette');
    menu.addPair([new SymbolMorph(
    'arrowDown', MorphicPreferences.menuFontSize
    ), localize('move down')], ((
    ) => this.moveInPalette()), null,
    'move one down in the palette');

    menu.addItem("edit...", 'edit');
    return menu;};

CustomCommandBlockMorph.prototype.moveInPalette = function (up) {
    var method, idx, blocks, cat, t_idx,
        rcvr = this.scriptTarget(),
        ide = rcvr.parentThatIsA(IDE_Morph),
        swap = (arr, i1, i2) => {
            let tmp = arr[i1];
            arr[i1] = arr[i2];
            arr[i2] = tmp;
        };
    if (this.isGlobal) {
        method = this.definition;
        blocks = rcvr.parentThatIsA(StageMorph).globalBlocks;
    } else {method = rcvr.getLocalMethod(this.blockSpec);
        blocks = rcvr.customBlocks;};
    idx = blocks.indexOf(method);
    if (idx > -1) {
        cat = blocks[idx].category;
        if (up) {
            for (t_idx = idx - 1; t_idx > -1; t_idx -= 1) {
                if (blocks[t_idx].category === cat) {
                    break;
                }
            }
        } else {
            for (t_idx = idx + 1; t_idx < blocks.length; t_idx += 1) {
                if (blocks[t_idx].category === cat) {
                    break;
                }
            }
        }
        if (-1 < t_idx && t_idx < blocks.length) {
            swap(blocks, t_idx, idx);
        }
    }
    if (ide) {
        ide.flushPaletteCache();
        ide.categories.refreshEmpty();
        ide.refreshPalette();
    }    
};

CustomCommandBlockMorph.prototype.exportBlockDefinition = function () {
    var rcvr = this.scriptTarget(),
        ide = rcvr.parentThatIsA(IDE_Morph),
        def = this.isGlobal || this instanceof PrototypeHatBlockMorph ?
            this.definition
                : rcvr.getMethod(this.blockSpec);
    new BlockExportDialogMorph(ide.serializer,
        [def].concat(def.collectDependencies(
        [], [], rcvr)), ide).popUp(world);};

CustomCommandBlockMorph.prototype.duplicateBlockDefinition = function () {
    var rcvr = this.scriptTarget(),
        ide = this.parentThatIsA(IDE_Morph),
        def = this.isGlobal ? this.definition : rcvr.getMethod(this.blockSpec),
        dup = def.copyAndBindTo(rcvr),
        spec = dup.spec,
        exp = dup.body? dup.body.expression : null,
        count = 1;

    function rebindRecursiveCalls(topBlock) {
        topBlock.forAllChildren(morph => {
            if (morph.definition === def) {
                morph.definition = dup;
                morph.refresh();
            };
        });
    };  if (this.isGlobal) {
        ide.stage.globalBlocks.push(dup);
    } else {
        rcvr.customBlocks.push(dup);
    };  // find a unique spec
    while (rcvr.doubleDefinitionsFor(dup).length > 0) {
        count += 1;
        dup.spec = spec + ' (' + count + ')';
    };  // rebind recursive calls
    dup.scripts.forEach(script => rebindRecursiveCalls(script));
    if (exp instanceof BlockMorph) {
        rebindRecursiveCalls(exp);
    };  ide.flushPaletteCache();
    ide.refreshPalette();
    ide.recordUnsavedChanges();
    (new BlockEditorMorph(dup, rcvr)).popUp();};

CustomCommandBlockMorph.prototype.deleteBlockDefinition = function () {
    var idx, stage, ide, method, block,
        rcvr = this.scriptTarget();
    if (this.isPrototype) {
        return null; // under construction...
    }
    method = this.isGlobal? this.definition
            : rcvr.getLocalMethod(this.blockSpec);
    block = method.blockInstance();
    new DialogBoxMorph(this,
        () => {
            rcvr.deleteAllBlockInstances(method);
            if (method.isGlobal) {
                stage = rcvr.parentThatIsA(StageMorph);
                idx = stage.globalBlocks.indexOf(method);
                if (idx !== -1) {
                    stage.globalBlocks.splice(idx, 1);
                }
            } else {
                // delete local definition
                idx = rcvr.customBlocks.indexOf(method);
                if (idx !== -1) {
                    rcvr.customBlocks.splice(idx, 1);
                };  // refresh instances of inherited method, if any
                method = rcvr.getMethod(this.blockSpec);  if (method) {
                    rcvr.allDependentInvocationsOf(this.blockSpec
                    ).forEach(block => block.refresh(method));};
                    }; ide = rcvr.parentThatIsA(IDE_Morph);
            if (ide) {
                ide.flushPaletteCache();
                ide.categories.refreshEmpty();
                ide.refreshPalette();
                ide.recordUnsavedChanges();
            };  }, this
    ).askYesNo(
        'Delete Custom Block',
        localize('block deletion dialog text'), // long string lookup
        this.world(),
        block.doWithAlpha(
            1, () => {
                block.addShadow();
                return block.fullImage();
            }));};

// CustomCommandBlockMorph relabelling

CustomCommandBlockMorph.prototype.relabel = function (alternatives) {
    var menu = new MenuMorph(this),
        oldInputs = this.inputs().map(each => each.fullCopy());
    alternatives.forEach(def => {
        var block = def.blockInstance();
        block.restoreInputs(oldInputs);
        block.fixBlockColor(null, true);
        block.addShadow(new Point(3, 3));
        menu.addItem(
            block.doWithAlpha(1, () => block.fullImage(
            )), (() => {this.definition = def;
                this.isGlobal = def.isGlobal;
                this.refresh(); (this.scriptTarget(
                )).parentThatIsA(IDE_Morph
                ).recordUnsavedChanges();}));
    }); menu.popup(world, this.bottomLeft().subtract(new Point(8,
    ((this instanceof CommandBlockMorph) ? this.corner : 0))));};

CustomCommandBlockMorph.prototype.alternatives = function () {
    var rcvr = this.scriptTarget(),
        stage = rcvr.parentThatIsA(StageMorph),
        allDefs = rcvr.customBlocks.concat(stage.globalBlocks),
        type = this instanceof CommandBlockMorph ? 'command'
            : (this.isPredicate ? 'predicate' : 'reporter');
    return allDefs.filter(each =>
        each !== this.definition && each.type === type
    );
};

// CustomDefinitorBlockMorph /////////////////////////////////////////////

// CustomDefinitorBlockMorph inherits from CommandBlockMorph:

CustomDefinitorBlockMorph.prototype = new DefinitorBlockMorph;
CustomDefinitorBlockMorph.prototype.constructor = CustomDefinitorBlockMorph;
CustomDefinitorBlockMorph.uber = DefinitorBlockMorph.prototype;

// CustomDefinitorBlockMorph shared settings:

CustomDefinitorBlockMorph.prototype.isCustomBlock = true;

// CustomDefinitorBlockMorph instance creation:

function CustomDefinitorBlockMorph(definition,
isProto) {this.init(definition, isProto);};

CustomDefinitorBlockMorph.prototype.init = function (definition, isProto) {
    this.definition = definition;
    this.semanticSpec = '';
    this.isGlobal = definition ? definition.isGlobal : false;
    this.isPrototype = isProto || false;
    CustomDefinitorBlockMorph.uber.init.call(this);
    if (isProto) {this.isTemplate = true;};
    this.category = definition.category;
    this.selector = 'evaluateCustomBlock';
    this.variables = null;
    this.storedTranslations = null;
    this.initializeVariables();
    if (definition) {this.refresh();};
};

CustomDefinitorBlockMorph.prototype.reactToTemplateCopy = CustomCommandBlockMorph.prototype.reactToTemplateCopy;

CustomDefinitorBlockMorph.prototype.initializeVariables = CustomCommandBlockMorph.prototype.initializeVariables;

CustomDefinitorBlockMorph.prototype.refresh = CustomCommandBlockMorph.prototype.refresh;

CustomDefinitorBlockMorph.prototype.restoreInputs = BlockMorph.prototype.restoreInputs;

CustomDefinitorBlockMorph.prototype.refreshDefaults = CustomCommandBlockMorph.prototype.refreshDefaults;

CustomDefinitorBlockMorph.prototype.refreshPrototype = CustomCommandBlockMorph.prototype.refreshPrototype;

CustomDefinitorBlockMorph.prototype.refreshPrototypeSlotTypes = CustomCommandBlockMorph.prototype.refreshPrototypeSlotTypes;

CustomDefinitorBlockMorph.prototype.inputFragmentNames = CustomCommandBlockMorph.prototype.inputFragmentNames;

CustomDefinitorBlockMorph.prototype.upvarFragmentNames = CustomCommandBlockMorph.prototype.upvarFragmentNames;

CustomDefinitorBlockMorph.prototype.upvarFragmentName = CustomCommandBlockMorph.prototype.upvarFragmentName;

CustomDefinitorBlockMorph.prototype.specFromFragments = CustomCommandBlockMorph.prototype.specFromFragments;

CustomDefinitorBlockMorph.prototype.blockSpecFromFragments = CustomCommandBlockMorph.prototype.blockSpecFromFragments;

CustomDefinitorBlockMorph.prototype.declarationsFromFragments = CustomCommandBlockMorph.prototype.declarationsFromFragments;

CustomDefinitorBlockMorph.prototype.parseSpec = CustomCommandBlockMorph.prototype.parseSpec;

CustomDefinitorBlockMorph.prototype.mouseClickLeft = CustomCommandBlockMorph.prototype.mouseClickLeft;

CustomDefinitorBlockMorph.prototype.edit = CustomCommandBlockMorph.prototype.edit;

CustomDefinitorBlockMorph.prototype.labelPart = CustomCommandBlockMorph.prototype.labelPart;

CustomDefinitorBlockMorph.prototype.placeHolder = CustomCommandBlockMorph.prototype.placeHolder;

CustomDefinitorBlockMorph.prototype.attachTargets = CustomCommandBlockMorph.prototype.attachTargets;

CustomDefinitorBlockMorph.prototype.isInUse = CustomCommandBlockMorph.prototype.isInUse;

// CustomDefinitorBlockMorph menu:

CustomDefinitorBlockMorph.prototype.userMenu = CustomCommandBlockMorph.prototype.userMenu;

CustomDefinitorBlockMorph.prototype.moveInPalette = CustomCommandBlockMorph.prototype.moveInPalette;

CustomDefinitorBlockMorph.prototype.exportBlockDefinition = CustomCommandBlockMorph.prototype.exportBlockDefinition;

CustomDefinitorBlockMorph.prototype.duplicateBlockDefinition = CustomCommandBlockMorph.prototype.duplicateBlockDefinition;

CustomDefinitorBlockMorph.prototype.deleteBlockDefinition = CustomCommandBlockMorph.prototype.deleteBlockDefinition;

// CustomDefinitorBlockMorph relabelling

CustomDefinitorBlockMorph.prototype.relabel = CustomCommandBlockMorph.prototype.relabel;

CustomDefinitorBlockMorph.prototype.alternatives = CustomCommandBlockMorph.prototype.alternatives;

// CustomReporterBlockMorph ////////////////////////////////////////////

// CustomReporterBlockMorph inherits from ReporterBlockMorph:

CustomReporterBlockMorph.prototype = new ReporterBlockMorph;
CustomReporterBlockMorph.prototype.constructor = CustomReporterBlockMorph;
CustomReporterBlockMorph.uber = ReporterBlockMorph.prototype;

// CustomReporterBlockMorph shared settings:

CustomReporterBlockMorph.prototype.isCustomBlock = true;

// CustomReporterBlockMorph instance creation:

function CustomReporterBlockMorph(definition, isPredicate, isProto,
isArrow) {this.init(definition, isPredicate, isProto, isArrow);};

CustomReporterBlockMorph.prototype.init = function (
definition, isPredicate, isProto, isArrow) {(this
).definition = definition; (this.semanticSpec
) = ''; this.isGlobal = (definition ? (
definition.isGlobal) : false); (this
).isPrototype = (isProto || false);
(CustomReporterBlockMorph.uber.init
).call(this, isPredicate, isArrow);
if (isProto) {this.isTemplate = true;
}; this.category = definition.category;
this.storedTranslations = null; (this
).initializeVariables(); (this.selector
) = 'evaluateCustomBlock'; (this
).isSpecialReporter = false; if (
definition) {this.refresh();};};

CustomReporterBlockMorph.prototype.initializeVariables =
    CustomCommandBlockMorph.prototype.initializeVariables;

CustomReporterBlockMorph.prototype.reactToTemplateCopy =
    CustomCommandBlockMorph.prototype.reactToTemplateCopy;

CustomReporterBlockMorph.prototype.refresh = function (aDefinition) {
    var def = aDefinition || this.definition;
    CustomCommandBlockMorph.prototype.refresh.call(this, aDefinition, true);
    if (!this.isPrototype) {
        this.isPredicate = (def.type === 'predicate');
        this.isArrow = (def.type === 'arrow'); if (
        this.isArrow) {this.isPredicate = false;};
    }; var isSpecial = (isNil(this.definition) ? false : asABool(
    this.definition.isSpecialReporter)), specialType = (isNil(
    this.definition) ? 'color' : this.definition.specialBlockType
    ); if (this.parent instanceof SyntaxElementMorph) {
        this.parent.cachedInputs = null;
    };  this.rounding = (9 * this.scale * (
    (specialType === 'color' ? 0 : 1/2) + (
    !isSpecial / (specialType === 'color' ? 1 : 2))));
    this.fixLayout();};

CustomReporterBlockMorph.prototype.mouseClickLeft = function () {
    if (!this.isPrototype) {
        return CustomReporterBlockMorph.uber.mouseClickLeft.call(this);
    };  this.edit();};

CustomReporterBlockMorph.prototype.placeHolder
    = CustomCommandBlockMorph.prototype.placeHolder;

CustomReporterBlockMorph.prototype.parseSpec
    = CustomCommandBlockMorph.prototype.parseSpec;

CustomReporterBlockMorph.prototype.checkToEditThis
    = CustomCommandBlockMorph.prototype.checkToEditThis;

CustomReporterBlockMorph.prototype.edit
    = CustomCommandBlockMorph.prototype.edit;

CustomReporterBlockMorph.prototype.labelPart
    = CustomCommandBlockMorph.prototype.labelPart;

CustomReporterBlockMorph.prototype.upvarFragmentNames
    = CustomCommandBlockMorph.prototype.upvarFragmentNames;

CustomReporterBlockMorph.prototype.upvarFragmentName
    = CustomCommandBlockMorph.prototype.upvarFragmentName;

CustomReporterBlockMorph.prototype.inputFragmentNames
    = CustomCommandBlockMorph.prototype.inputFragmentNames;

CustomReporterBlockMorph.prototype.specFromFragments
    = CustomCommandBlockMorph.prototype.specFromFragments;

CustomReporterBlockMorph.prototype.blockSpecFromFragments
    = CustomCommandBlockMorph.prototype.blockSpecFromFragments;

CustomReporterBlockMorph.prototype.declarationsFromFragments
    = CustomCommandBlockMorph.prototype.declarationsFromFragments;

CustomReporterBlockMorph.prototype.refreshPrototype
    = CustomCommandBlockMorph.prototype.refreshPrototype;

CustomReporterBlockMorph.prototype.refreshPrototypeSlotTypes
    = CustomCommandBlockMorph.prototype.refreshPrototypeSlotTypes;

CustomReporterBlockMorph.prototype.restoreInputs
    = CustomCommandBlockMorph.prototype.restoreInputs;

CustomReporterBlockMorph.prototype.refreshDefaults
    = CustomCommandBlockMorph.prototype.refreshDefaults;

CustomReporterBlockMorph.prototype.isInUse
    = CustomCommandBlockMorph.prototype.isInUse;

// CustomReporterBlockMorph menu:

CustomReporterBlockMorph.prototype.userMenu
    = CustomCommandBlockMorph.prototype.userMenu;

CustomReporterBlockMorph.prototype.moveInPalette =
    CustomCommandBlockMorph.prototype.moveInPalette;

CustomReporterBlockMorph.prototype.duplicateBlockDefinition
    = CustomCommandBlockMorph.prototype.duplicateBlockDefinition;

CustomReporterBlockMorph.prototype.deleteBlockDefinition
    = CustomCommandBlockMorph.prototype.deleteBlockDefinition;

CustomReporterBlockMorph.prototype.exportBlockDefinition
    = CustomCommandBlockMorph.prototype.exportBlockDefinition;

// CustomReporterBlockMorph bubble help:

CustomReporterBlockMorph.prototype.bubbleHelp
    = CustomCommandBlockMorph.prototype.bubbleHelp;

CustomReporterBlockMorph.prototype.popUpbubbleHelp
    = CustomCommandBlockMorph.prototype.popUpbubbleHelp;

// CustomReporterBlockMorph relabelling

CustomReporterBlockMorph.prototype.relabel
    = CustomCommandBlockMorph.prototype.relabel;

CustomReporterBlockMorph.prototype.alternatives
    = CustomCommandBlockMorph.prototype.alternatives;

// JaggedBlockMorph ////////////////////////////////////////////////////

/*
    I am a reporter block with jagged left and right edges conveying the
    appearance of having the broken out of a bigger block. I am used to
    display input types in the long form input dialog.
*/

// JaggedBlockMorph inherits from ReporterBlockMorph:

JaggedBlockMorph.prototype = new ReporterBlockMorph;
JaggedBlockMorph.prototype.constructor = JaggedBlockMorph;
JaggedBlockMorph.uber = ReporterBlockMorph.prototype;

// JaggedBlockMorph instance creation:

function JaggedBlockMorph(spec) {this.init(spec);};

JaggedBlockMorph.prototype.init = function (spec) {JaggedBlockMorph.uber.init.call(this); if (spec) {this.setSpec(
spec);}; if (contains(['%cl', '%c', '%cs', '%cla', '%loop', '%ca'], spec)) {this.minWidth = 25; this.fixLayout();};};

// JaggedBlockMorph drawing:

JaggedBlockMorph.prototype.outlinePath = function (
ctx, inset) {var w = this.width(), h, jags, delta,
i, pos = this.position(), y = 0; ctx.moveTo(inset,
inset); ctx.lineTo(w - inset, inset);

    // C-Slots
    this.cSlots().forEach(slot => {
        slot.outlinePath(ctx, inset, slot.position().subtract(pos));
        y += slot.height();
    });

    h = this.height() - y - inset;
    jags = Math.round(h / this.jag);
    delta = h / jags;

    for (i = 0; i < jags; i += 1) {
        y += delta / 2;
        ctx.lineTo(w - this.jag / 2 - inset, y);
        y += delta / 2;
        ctx.lineTo(w - inset, y);
    };

    h = this.height() - inset;
    jags = Math.round(h / this.jag);
    delta = h / jags;

    ctx.lineTo(inset, h - inset);
    y = h;
    for (i = 0; i < jags; i += 1) {
        y -= delta / 2;
        ctx.lineTo(this.jag / 2 + inset, y);
        y -= delta / 2;
        ctx.lineTo(inset, y);
    };
};

JaggedBlockMorph.prototype.drawEdges = function (ctx) {
    var w = this.width(),
        h = this.height(),
        jags = Math.round(h / this.jag),
        delta = h / jags,
        shift = this.edge / 2,
        gradient,
        i,
        y;

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

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
    ctx.lineTo(w - shift, shift);
    ctx.stroke();

    if (!(this.clearSlots().length)) {y = 0;
        for (i = 0; i < jags; i += 1) {
            ctx.strokeStyle = this.cachedClrDark;
            ctx.beginPath();
            ctx.moveTo(w - shift, y);
            y += delta / 2;
            ctx.lineTo(w - this.jag / 2 - shift, y);
            ctx.stroke();
            y += delta / 2;
        }
    }

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
    ctx.moveTo(w - shift, h - shift);
    ctx.lineTo(shift, h - shift);
    ctx.stroke();

    y = h;
    for (i = 0; i < jags; i += 1) {
        ctx.strokeStyle = this.cachedClrBright;
        ctx.beginPath();
        ctx.moveTo(shift, y);
        y -= delta / 2;
        ctx.lineTo(this.jag / 2 + shift, y);
        ctx.stroke();
        y -= delta / 2;
    }
};

// BlockDialogMorph ////////////////////////////////////////////////////

// BlockDialogMorph inherits from DialogBoxMorph:

BlockDialogMorph.prototype = new DialogBoxMorph; BlockDialogMorph.prototype.constructor = BlockDialogMorph; BlockDialogMorph.uber = DialogBoxMorph.prototype;

// BlockDialogMorph instance creation:

function BlockDialogMorph(target, action, environment) {this.init(target, action, environment);};

BlockDialogMorph.prototype.init = function (target, action, environment) {this.blockType = 'command'; this.category = 'other'; this.isGlobal = true; this.types = null; this.categories = null;
BlockDialogMorph.uber.init.call(this, target, action, environment); this.key = 'makeABlock'; this.types = new AlignmentMorph('row', this.padding); this.add(this.types); this.scopes = new AlignmentMorph('row',
this.padding); this.add(this.scopes); this.categories = new BoxMorph; this.categories.color = SpriteMorph.prototype.paletteColor.lighter(5); this.categories.borderColor = this.categories.color.lighter(40);
this.categories.buttons = []; this.categories.refresh = function () {this.buttons.forEach(cat => {cat.refresh(); if (cat.state) {cat.scrollIntoView();}});}; this.createCategoryButtons(); this.fixCategoriesLayout(
); this.add(this.categories); this.createTypeButtons(); this.createScopeButtons(); this.fixLayout();}; BlockDialogMorph.prototype.openForChange = function (title, category, type, world, pic, preventTypeChange) {
var clr = SpriteMorph.prototype.blockColorFor(category); this.key = 'changeABlock'; this.category = category; this.blockType = type; this.categories.refresh(); this.types.children.forEach(each => {each.setColor(
clr); each.refresh();}); this.labelString = title; this.createLabel(); if (pic) {this.setPicture(pic);}; this.addButton('ok', 'OK'); this.addButton('cancel', 'Cancel'); this.fixLayout(); this.rerender(
); this.popUp(world);}; BlockDialogMorph.prototype.createCategoryButtons = function () {SpriteMorph.prototype.categories.filter(cat => !contains(['motor', 'events', 'strings'], cat)).forEach(
cat => this.addCategoryButton(cat)); Array.from(SpriteMorph.prototype.customCategories.keys()).forEach(name => this.addCustomCategoryButton(name, SpriteMorph.prototype.customCategories.get(name)));};
BlockDialogMorph.prototype.addCategoryButton = function (category) {var labelWidth = 75, colors = [IDE_Morph.prototype.frameColor, IDE_Morph.prototype.frameColor.darker(MorphicPreferences.isFlat ? 5 : 50),
SpriteMorph.prototype.blockColorFor(category)], button; button = new ToggleButtonMorph(colors, this, () => {this.category = category; this.categories.refresh(); if (this.types) {this.types.children.forEach(
each => each.setColor(colors[2]));}; this.edit();}, category[0].toUpperCase().concat(category.slice(1)), () => this.category === category, null, null, labelWidth, true); button.corner = 8; button.padding = 0;
button.labelShadowOffset = new Point(-1, -1); button.labelShadowColor = colors[1]; button.labelColor = IDE_Morph.prototype.buttonLabelColor; if (MorphicPreferences.isFlat) {button.labelPressColor = WHITE;};
button.contrast = this.buttonContrast; button.fixLayout(); button.refresh(); this.categories.add(button); this.categories.buttons.push(button); return button;};

BlockDialogMorph.prototype.addCustomCategoryButton = function (category, clr) {
    var labelWidth = 75,
        colors = [
            IDE_Morph.prototype.frameColor,
            IDE_Morph.prototype.frameColor.darker
                (MorphicPreferences.isFlat ? 5 : 50
            ),
            clr
        ],
        button;

    button = new ToggleButtonMorph(
        colors,
        this, // this block dialog box is the target
        () => {
            this.category = category;
            this.categories.refresh();
            if (this.types) {
                this.types.children.forEach(each =>
                    each.setColor(colors[2])
                );
            }
            this.edit();
        },
        category, // UCase label
        () => this.category === category, // query
        null, // env
        null, // hint
        labelWidth, // minWidth
        true // has preview
    );

    button.corner = 8;
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = IDE_Morph.prototype.buttonLabelColor;
        if (MorphicPreferences.isFlat) {
            button.labelPressColor = WHITE;
        }
    button.contrast = this.buttonContrast;
    button.fixLayout();
    button.refresh();
    this.categories.add(button);
    this.categories.buttons.push(button);
    return button;
};

BlockDialogMorph.prototype.fixCategoriesLayout = function () {
        var myself = this,
            buttonWidth = myself.categories.children[0].width(),
            buttonHeight = myself.categories.children[0].height(),
            border = 3,
            rows =  Math.ceil((myself.categories.children.length) / 2),
            xPadding = (200 // myself.logo.width()
                - border
                - buttonWidth * 2) / 3,
            yPadding = 2,
            l = myself.categories.left(),
            t = myself.categories.top(),
            i = 0,
            row,
            col;

        myself.categories.setWidth(
            3 * xPadding + 2 * buttonWidth
        );

        myself.categories.children.forEach(button => {
            i += 1;
            row = Math.ceil(i / 2);
            col = 2 - (i % 2);
            button.setPosition(new Point(
                l + (col * xPadding + ((col - 1) * buttonWidth)),
                t + (row * yPadding + ((row - 1) * buttonHeight) + border)
            ));
        });

        myself.categories.setHeight(
            (rows + 1) * yPadding
                + rows * buttonHeight
                + 2 * border
        );
};

// type radio buttons

BlockDialogMorph.prototype.createTypeButtons = function () {var block = new CommandBlockMorph, clr = SpriteMorph.prototype.blockColorFor(this.category); block.setColor(clr); block.setSpec(localize(
'Command')); this.addBlockTypeButton(() => this.setType('command'), block, () => this.blockType === 'command'); block = new DefinitorBlockMorph; block.setColor(clr); block.setSpec(localize(
'Definitor')); this.addBlockTypeButton(() => this.setType('definitor'), block, () => this.blockType === 'definitor'); block = new ReporterBlockMorph; block.setColor(clr); block.setSpec(localize(
'Reporter')); this.addBlockTypeButton(() => this.setType('reporter'), block, () => this.blockType === 'reporter'); block = new ReporterBlockMorph(true); block.setColor(clr); block.setSpec(
localize('Predicate')); this.addBlockTypeButton(() => this.setType('predicate'), block, () => this.blockType === 'predicate'); block = new ReporterBlockMorph(null, true); block.setColor(clr
); block.setSpec(localize('Arrow')); this.addBlockTypeButton(() => this.setType('arrow'), block, () => this.blockType === 'arrow');}; /* Create in the block types selector, try these out! */

BlockDialogMorph.prototype.addBlockTypeButton = function (
    action,
    element,
    query
) {
    var button = new ToggleElementMorph(
        this,
        action,
        element,
        query,
        null,
        null,
        'rebuild'
    );
    button.refresh();
    button.fixLayout();
    this.types.add(button);
    return button;
};

BlockDialogMorph.prototype.addTypeButton = function (action, label, query) {
    var button = new ToggleMorph(
        'radiobutton',
        this,
        action,
        label,
        query
    );
    button.edge = this.buttonEdge / 2;
    button.outline = this.buttonOutline / 2;
    button.outlineColor = this.buttonOutlineColor;
    button.outlineGradient = this.buttonOutlineGradient;
    button.contrast = this.buttonContrast;

    button.fixLayout();
    this.types.add(button);
    return button;
};

BlockDialogMorph.prototype.setType = function (blockType) {this.blockType = blockType || this.blockType; this.types.children.forEach(c => c.refresh()); this.edit();};

// scope radio buttons

BlockDialogMorph.prototype.createScopeButtons = function () {this.addScopeButton(() => this.setScope('global'), "for all sprites",
() => this.isGlobal); this.addScopeButton(() => this.setScope('local'), "for this sprite only", () => !this.isGlobal);};

BlockDialogMorph.prototype.addScopeButton = function (action, label, query) {
    var button = new ToggleMorph(
        'radiobutton',
        this,
        action,
        label,
        query
    );
    button.edge = this.buttonEdge / 2;
    button.outline = this.buttonOutline / 2;
    button.outlineColor = this.buttonOutlineColor;
    button.outlineGradient = this.buttonOutlineGradient;
    button.contrast = this.buttonContrast;

    button.fixLayout();
    this.scopes.add(button);
    return button;
};


BlockDialogMorph.prototype.setScope = function (varType) {this.isGlobal = (varType === 'global'); this.scopes.children.forEach(c => c.refresh()); this.edit();};

// other ops

BlockDialogMorph.prototype.getInput = function () {var spec, def, body; if (this.body instanceof InputFieldMorph) {spec = this.normalizeSpaces(this.body.getValue());}; def = new CustomBlockDefinition(
spec); def.type = this.blockType; def.category = this.category; def.isGlobal = this.isGlobal; if (contains(['reporter', 'predicate', 'arrow'], def.type)) {body = Process.prototype.reify.call(null,
SpriteMorph.prototype.blockForSelector('doReport'), new List, true); body.outerContext = null; def.body = body;}; return def;};

BlockDialogMorph.prototype.fixLayout = function () {
    var th = fontHeight(this.titleFontSize) + this.titlePadding * 2;

    if (this.body) {
        this.body.setPosition(this.position().add(new Point(
            this.padding,
            th + this.padding
        )));
        this.bounds.setWidth(this.body.width() + this.padding * 2);
        this.bounds.setHeight(
            this.body.height()
                + this.padding * 2
                + th
        );
        if (this.categories) {
            this.categories.setCenter(this.body.center());
            this.categories.setTop(this.body.top());
            this.body.setTop(this.categories.bottom() + this.padding);
            this.bounds.setHeight(
                this.height()
                    + this.categories.height()
                    + this.padding
            );
        }
    } else if (this.head) { // when changing an existing prototype
        if (this.types) {
            this.types.fixLayout();
            this.bounds.setWidth(
                Math.max(this.types.width(), this.head.width())
                    + this.padding * 2
            );
        } else {
            this.bounds.setWidth(
                Math.max(this.categories.width(), this.head.width())
                    + this.padding * 2
            );
        }
        this.head.setCenter(this.center());
        this.head.setTop(th + this.padding);
        this.bounds.setHeight(
            this.head.height()
                + this.padding * 2
                + th
        );
        if (this.categories) {
            this.categories.setCenter(this.center());
            this.categories.setTop(this.head.bottom() + this.padding);
            this.bounds.setHeight(
                this.height()
                    + this.categories.height()
                    + this.padding
            );
        }
    }

    if (this.label) {
        this.label.setCenter(this.center());
        this.label.setTop(this.top() + (th - this.label.height()) / 2);
    }

    if (this.types) {
        this.types.fixLayout();
        this.bounds.setHeight(
            this.height()
                    + this.types.height()
                    + this.padding
        );
        this.bounds.setWidth(Math.max(
            this.width(),
            this.types.width() + this.padding * 2
        ));
        this.types.setCenter(this.center());
        if (this.body) {
            this.types.setTop(this.body.bottom() + this.padding);
        } else if (this.categories) {
            this.types.setTop(this.categories.bottom() + this.padding);
        }
    }

    if (this.scopes) {
        this.scopes.fixLayout();
        this.bounds.setHeight(
            this.height()
                    + this.scopes.height()
                    + (this.padding / 3)
        );
        this.bounds.setWidth(Math.max(
            this.width(),
            this.scopes.width() + this.padding * 2
        ));
        this.scopes.setCenter(this.center());
        if (this.types) {
            this.scopes.setTop(this.types.bottom() + (this.padding / 3));
        }
    }

    if (this.buttons && (this.buttons.children.length > 0)) {
        this.buttons.fixLayout();
        this.bounds.setHeight(
            this.height()
                    + this.buttons.height()
                    + this.padding
        );
        this.buttons.setCenter(this.center());
        this.buttons.setBottom(this.bottom() - this.padding);
    }

    // refresh a shallow shadow
    this.removeShadow();
    this.addShadow();
};

BlockDialogMorph.prototype.accept = function () {if ((this.body instanceof InputFieldMorph) && (this.normalizeSpaces(this.body.getValue()) === '')) {this.edit();} else {BlockDialogMorph.uber.accept.call(this);}};

// BlockEditorMorph ////////////////////////////////////////////////////

// BlockEditorMorph inherits from DialogBoxMorph:

BlockEditorMorph.prototype = new DialogBoxMorph;
BlockEditorMorph.prototype.constructor = BlockEditorMorph;
BlockEditorMorph.uber = DialogBoxMorph.prototype;

// BlockEditorMorph instance creation:

function BlockEditorMorph(definition, target) {this.init(definition, target);};

BlockEditorMorph.prototype.init = function (definition, target) {
    var scripts, proto, scriptsFrame, block, comment,
        isLive = Process.prototype.enableLiveCoding ||
            Process.prototype.enableSingleStepping;

    // additional properties:
    this.definition = definition;
    this.translations = definition.translationsAsText();
    this.handle = null;

    // initialize inherited properties:
    BlockEditorMorph.uber.init.call(
        this,
        target,
        () => this.updateDefinition(),
        target
    );

    // override inherited properites:
    this.key = 'editBlock' + definition.spec;
    this.labelString = this.definition.isGlobal ? 'Block Editor'
    		: 'Method Editor';
    this.createLabel();

    // create scripting area
    scripts = new ScriptsMorph;
    scripts.rejectsHats = true;
    scripts.isDraggable = false;
    scripts.color = IDE_Morph.prototype.groupColor;
    scripts.cachedTexture = IDE_Morph.prototype.scriptsPaneTexture;
    scripts.cleanUpMargin = 10;

    proto = new PrototypeHatBlockMorph(this.definition);
    proto.setPosition(scripts.position().add(10));
    if (definition.comment !== null) {
        comment = definition.comment.fullCopy();
        proto.comment = comment;
        comment.block = proto;
    }
    if (definition.body !== null) {
        proto.nextBlock(isLive ? definition.body.expression
                : definition.body.expression.fullCopy()
        );
    }
    scripts.add(proto);

    this.definition.scripts.forEach(element => {
        block = element.fullCopy();
        block.setPosition(scripts.position().add(element.position()));
        scripts.add(block);
        if (block instanceof BlockMorph) {
            block.allComments().forEach(comment =>
                comment.align(block)
            );
        }
    });
    proto.allComments().forEach(comment =>
        comment.align(proto)
    );

    scriptsFrame = new ScrollFrameMorph(scripts);
    scriptsFrame.padding = 10;
    scriptsFrame.growth = 50;
    scriptsFrame.isDraggable = false;
    scriptsFrame.acceptsDrops = false;
    scriptsFrame.contents.acceptsDrops = true;
    scripts.scrollFrame = scriptsFrame;
    scriptsFrame.color = scripts.color;
    scripts.updateToolbar();

    scriptsFrame.cursorGrabStyle = 'grabbing';

    this.addBody(scriptsFrame);
    this.addButton('ok', 'OK');
    if (!isLive) {
        this.addButton('updateDefinition', 'Apply');
        this.addButton('cancel', 'Cancel');
    };

    this.setExtent(new Point(375, 300)); // normal initial extent
    scripts.setPosition(scriptsFrame.bounds.origin); this.fixLayout();
    scripts.fixMultiArgs(); block = proto.parts()[1];
    block.forceNormalColoring(); proto.fixBlockColor(null, true);

};

BlockEditorMorph.prototype.popUp = function () {
    var world = this.target.world();

    if (world) {
        BlockEditorMorph.uber.popUp.call(this, world);
        this.setInitialDimensions();
        this.handle = new HandleMorph(
            this,
            361,
            220,
            this.corner,
            this.corner
        );
        world.keyboardFocus = null;
    }
};

BlockEditorMorph.prototype.justDropped = function () {
    // override the inherited default behavior, which is to
    // give keyboard focus to dialog boxes, as in this case
    // we want Snap-global keyboard-shortcuts like ctrl-f
    // to still work
    nop();
};

// BlockEditorMorph ops

BlockEditorMorph.prototype.accept = function (origin) {
    // check DialogBoxMorph comment for accept()
    if (origin instanceof CursorMorph) {return; }
    if (this.action) {
        if (typeof this.target === 'function') {
            if (typeof this.action === 'function') {
                this.target.call(this.environment, this.action.call());
            } else {
                this.target.call(this.environment, this.action);
            }
        } else {
            if (typeof this.action === 'function') {
                this.action.call(this.target, this.getInput());
            } else { // assume it's a String
                this.target[this.action](this.getInput());
            }
        }
    }
    this.close();
};

BlockEditorMorph.prototype.cancel = function (origin) {
    if (origin instanceof CursorMorph) {return; }
    //this.refreshAllBlockInstances();
    this.close();
};

BlockEditorMorph.prototype.close = function () {
    var doubles, block;

    // assert that no scope conflicts exists, i.e. that a global
    // definition doesn't contain any local custom blocks, as they
    // will be rendered "undefined" when reloading the project
    if (this.definition.isGlobal) {
        block = detect(
            this.body.contents.allChildren(),
            morph => morph.isCustomBlock && !morph.isGlobal
        );
        if (block) {
            block = block.scriptTarget()
                .getMethod(block.semanticSpec)
                .blockInstance();
            block.addShadow();
            (new DialogBoxMorph).inform(
                'Local Block(s) in Global Definition',
                'This global block definition contains one or more\n'
                    + 'local custom blocks which must be removed first.',
                this.world(),
                block.doWithAlpha(1, () => block.fullImage())
            );
            return;
        }
    }

    // allow me to disappear only when name collisions
    // have been resolved
    doubles = this.target.doubleDefinitionsFor(this.definition);
    if (doubles.length > 0) {
        block = doubles[0].blockInstance();
        block.addShadow();
        (new DialogBoxMorph(this, 'consolidateDoubles', this)).askYesNo(
            'Same Named Blocks',
            'Another custom block with this name exists.\n'
                + 'Would you like to replace it?',
            this.world(),
            block.doWithAlpha(1, () => block.fullImage())
        );
        return;
    }

    this.destroy();
};

BlockEditorMorph.prototype.consolidateDoubles = function () {
    this.target.replaceDoubleDefinitionsFor(this.definition);
    this.destroy();
};

BlockEditorMorph.prototype.refreshAllBlockInstances = function (oldSpec) {
    var def = this.definition,
        template = this.target.paletteBlockInstance(def);

    if (this.definition.isGlobal) {
        this.target.allBlockInstances(this.definition).reverse().forEach(
            block => block.refresh()
        );
    } else {
        this.target.allDependentInvocationsOf(oldSpec).reverse().forEach(
            block => block.refresh(def)
        );
    }
    if (template) {
        template.refreshDefaults();
    }
};

BlockEditorMorph.prototype.updateDefinition = function () {
    var head, ide,
        oldSpec = this.definition.blockSpec(),
        pos = this.body.contents.position(),
        count = 1,
        element;

    this.definition.receiver = this.target; // only for serialization
    this.definition.spec = this.prototypeSpec();
    this.definition.declarations = this.prototypeSlots();
    this.definition.variableNames = this.variableNames();
    this.definition.scripts = [];
    this.definition.updateTranslations(this.translations);
    this.definition.cachedTranslation = null;
    this.definition.editorDimensions = this.bounds.copy();
    this.definition.cachedIsRecursive = null; // flush the cache, don't update

    this.body.contents.children.forEach(morph => {
        if (morph instanceof PrototypeHatBlockMorph) {
            head = morph;
        } else if (morph instanceof BlockMorph ||
                (morph instanceof CommentMorph && !morph.block)) {
            element = morph.fullCopy();
            element.parent = null;
            element.setPosition(morph.position().subtract(pos));
            this.definition.scripts.push(element);
        }
    });

    if (head) {
        if (this.definition.category !== head.blockCategory) {
            this.target.shadowAttribute('scripts');
        }
        this.definition.category = head.blockCategory;
        this.definition.type = head.type;
        this.definition.isHelper = head.isHelper;
        if (head.comment) {
            this.definition.comment = head.comment.fullCopy();
            this.definition.comment.block = true; // serialize in short form
        } else {
            this.definition.comment = null;
        }
    }

    this.definition.body = this.context(head);

    // make sure the spec is unique
    while (this.target.doubleDefinitionsFor(this.definition).length > 0) {
        count += 1;
        this.definition.spec = this.definition.spec + ' (' + count + ')';
    }

    this.refreshAllBlockInstances(oldSpec);
    ide = this.target.parentThatIsA(IDE_Morph);
    ide.flushPaletteCache();
    ide.categories.refreshEmpty();
    ide.refreshPalette();
    ide.recordUnsavedChanges();
};

BlockEditorMorph.prototype.context = function (prototypeHat) {
    // answer my script reified for deferred execution
    // if no prototypeHat is given, my body is scanned
    var head, topBlock, stackFrame;

    head = prototypeHat || detect(
        this.body.contents.children,
        c => c instanceof PrototypeHatBlockMorph
    );
    topBlock = head.nextBlock();
    if (topBlock === null) {
        return null;
    }
    topBlock.allChildren().forEach(c => {
        if (c instanceof BlockMorph) {c.cachedInputs = null; }
    });
    stackFrame = Process.prototype.reify.call(
        null,
        topBlock,
        new List(this.definition.inputNames()),
        true // ignore empty slots for custom block reification
    );
    stackFrame.outerContext = null;
    return stackFrame;
};

BlockEditorMorph.prototype.prototypeSpec = function () {
    // answer the spec represented by my (edited) block prototype
    return detect(
        this.body.contents.children,
        c => c instanceof PrototypeHatBlockMorph
    ).parts()[1].specFromFragments();
};

BlockEditorMorph.prototype.prototypeSlots = function () {
    // answer the slot declarations from my (edited) block prototype
    return detect(
        this.body.contents.children,
        c => c instanceof PrototypeHatBlockMorph
    ).parts()[1].declarationsFromFragments();
};

BlockEditorMorph.prototype.variableNames = function () {
    // answer the variable declarations from my prototype hat
    return detect(
        this.body.contents.children,
        c => c instanceof PrototypeHatBlockMorph
    ).variableNames();
};

BlockEditorMorph.prototype.isHelper = function () {
    // answer the helper declaration from my (edited) prototype hat
    return detect(
        this.body.contents.children,
        c => c instanceof PrototypeHatBlockMorph
    ).isHelper;
};

// BlockEditorMorph translation

BlockEditorMorph.prototype.editTranslations = function () {
    var block = this.definition.blockInstance();
    block.addShadow(new Point(3, 3));
    new DialogBoxMorph(
        this,
        text => this.translations = text,
        this
    ).promptCode(
        'Custom Block Translations',
        this.translations,
        this.world(),
        block.doWithAlpha(1, () => block.fullImage()),
        this.definition.abstractBlockSpec() +
            '\n\n' +
            localize('Enter one translation per line. ' +
                'use colon (":") as lang/spec delimiter\n' +
                'and underscore ("_") as placeholder for an input, ' +
                'e.g.:\n\nen:say _ for _ secs')
    );
};

// BlockEditorMorph layout

BlockEditorMorph.prototype.setInitialDimensions = function () {
    var world = this.world(),
        mex = world.extent().subtract(new Point(this.padding, this.padding)),
        th = fontHeight(this.titleFontSize) + this.titlePadding * 2,
        bh = this.buttons.height();

    if (this.definition.editorDimensions) {
        this.setPosition(this.definition.editorDimensions.origin);
        this.setExtent(this.definition.editorDimensions.extent().min(mex));
        this.keepWithin(world);
        return;
    }
    this.setExtent(
        this.body.contents.extent().add(
            new Point(this.padding, this.padding + th + bh)
        ).min(mex)
    );
    this.setCenter(this.world().center());
};

BlockEditorMorph.prototype.fixLayout = function () {
    var th = fontHeight(this.titleFontSize) + this.titlePadding * 2;

    if (this.buttons && (this.buttons.children.length > 0)) {
        this.buttons.fixLayout();
    }

    if (this.body) {
        this.body.setPosition(this.position().add(new Point(
            this.padding,
            th + this.padding
        )));
        this.body.setExtent(new Point(
            this.width() - this.padding * 2,
            this.height() - this.padding * 3 - th - this.buttons.height()
        ));
    }

    if (this.label) {
        this.label.setCenter(this.center());
        this.label.setTop(this.top() + (th - this.label.height()) / 2);
    }

    if (this.buttons && (this.buttons.children.length > 0)) {
        this.buttons.setCenter(this.center());
        this.buttons.setBottom(this.bottom() - this.padding);
    }

    // refresh a shallow shadow
    this.removeShadow();
    this.addShadow();
};

// PrototypeHatBlockMorph /////////////////////////////////////////////

// PrototypeHatBlockMorph inherits from HatBlockMorph:

PrototypeHatBlockMorph.prototype = new HatBlockMorph;
PrototypeHatBlockMorph.prototype.constructor = PrototypeHatBlockMorph;
PrototypeHatBlockMorph.uber = HatBlockMorph.prototype;

// PrototypeHatBlockMorph instance creation:

function PrototypeHatBlockMorph(definition) {this.init(definition);};

PrototypeHatBlockMorph.prototype.init = function (definition
) {var proto = definition.prototypeInstance(), vars; (this
).definition = definition; this.blockCategory = ((definition
) ? definition.category : null); this.type = (definition ? (
definition.type) : null); this.isHelper = (definition ? (
definition.isHelper) : false); (PrototypeHatBlockMorph.uber
).init.call(this, true); this.category = 'custom'; (this
).setSpec(localize('define')); this.add(proto); if (
definition.variableNames.length) {vars = this.labelPart(
'%blockVars'); this.add(this.labelPart('%br')); this.add(
vars); definition.variableNames.forEach(name => (vars.addInput(
name)));}; proto.refreshPrototypeSlotTypes(); this.fixLayout();
this.fixBlockColor(); proto.fixBlockColor(this, true); (this
).cursorStyle = 'default'; this.cursorGrabStyle = null;};

PrototypeHatBlockMorph.prototype.outlinePath = function (
ctx, inset) {var indent = this.corner * 2 + this.inset,
bottom = this.height() - this.corner, bottomCorner = (
this.height() - (this.corner * 2)), radius = Math.max(
this.corner - inset, 0), s = this.hatWidth, h = (this
).hatHeight, r = ((4 * h * h) + (s * s)) / (8 * h),
a = degrees(4 * Math.atan(2 * h / s)), sa = a / 2,
x = this.width(), gradient, sp = Math.min(s * 1.7,
this.width() - this.corner), pos = this.position(
), shift = this.edge / 2; ctx.lineJoin = 'round';
ctx.lineCap = 'round'; ctx.strokeStyle = (this.color
).toString(); ctx.lineWidth = this.edge * 5; (ctx
).beginPath(); ctx.moveTo(0, (h * 3/2) + this.corner
); ctx.bezierCurveTo((x / 6), 0, (x * 5/6), 0, x, (
h * 3/2) + this.corner); ctx.stroke(); (ctx.strokeStyle
) = (SpriteMorph.prototype.blockColor.control.lighter(
)).toString(); ctx.lineWidth = this.edge * 5/2; (ctx
).beginPath(); ctx.moveTo(0, (h * 3/2) + this.corner);
ctx.bezierCurveTo((x / 6), 0, (x * 5/6), 0, x, (h * 3/2
) + this.corner); ctx.stroke(); ctx.arc(x - this.corner,
bottomCorner, radius, 0, Math.PI / 2, false); if (!((this
).isStop())) {ctx.lineTo(this.width() - this.corner,
bottom - inset); ctx.lineTo(this.corner * 3 + (this
).inset + this.dent, bottom - inset); ctx.lineTo(
indent + this.dent, bottom + this.corner - inset);
ctx.lineTo(indent, bottom + this.corner - inset);
ctx.lineTo(this.corner + this.inset, bottom - inset
);}; ctx.arc(this.corner, bottomCorner, radius,
Math.PI / 2, Math.PI, false);};

PrototypeHatBlockMorph.prototype.drawEdges = function (ctx) {
    var shift = this.edge / 2, x = this.width(),
    y = 0, indent = this.corner * 2 + this.inset,
    top = this.top(), bump = -(1.5 * this.edge),
    r = ((4 * (this.hatHeight ** 2)) + ((this
    ).hatWidth ** 2)) / (8 * this.hatHeight),
    cslots = this.clearSlots(), lgx = (
    this.corner + this.inset);

    ctx.lineWidth = this.edge;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'butt';

    ctx.strokeStyle = this.cachedClrBright;  ctx.beginPath();
    ctx.moveTo(shift, this.height() - this.corner * 2 - shift
    );  ctx.lineTo(shift, 35 * shift);
    ctx.bezierCurveTo((x / 6), bump, ((5 * x) / 6
    ), bump, x, 35 * shift); ctx.stroke();

    ctx.strokeStyle = this.cachedClrDark; ctx.beginPath();
    ctx.moveTo(x - shift, (this.corner + this.hatHeight
    ) + (this.edge * 3)); if (cslots.length > 0
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
);};    ctx.lineTo(this.corner, y - shift); ctx.stroke();};

PrototypeHatBlockMorph.prototype.mouseClickLeft = function () {if (world.currentKey === 16) {return this.focus();}; this.parts()[1].mouseClickLeft();};

PrototypeHatBlockMorph.prototype.userMenu = function () {return ((this.parts())[1]).userMenu();};

PrototypeHatBlockMorph.prototype.exportBlockDefinition = CustomCommandBlockMorph.prototype.exportBlockDefinition;

// PrototypeHatBlockMorph zebra coloring

PrototypeHatBlockMorph.prototype.fixBlockColor = function (
    nearestBlock,
    isForced
) {
    var nearest = this.parts()[1] || nearestBlock;

    if (!this.zebraContrast && !isForced) {
        return;
    }
    if (!this.zebraContrast && isForced) {
        return this.forceNormalColoring();
    }

    if (nearest.category === this.category) {
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
    }
};

// PrototypeHatBlockMorph block instance variables

PrototypeHatBlockMorph.prototype.variableNames = function (choice) {
    var parts = this.parts();
    if (parts.length < 3) {return [];};
    return parts[3].evaluate();
};

PrototypeHatBlockMorph.prototype.enableBlockVars = function (choice) {
    if (choice === false) {
        if (this.children.length > 3) {
        this.children.filter(child => child.getSpec instanceof Function
        ).filter(child => child.getSpec() === '%br')[0].destroy();
        this.children.filter(child => child instanceof MultiArgMorph)[0].destroy();
        };
    } else {
        if (this.children.filter(child => child instanceof MultiArgMorph).length === 0) {
        this.add(this.labelPart('%br')); this.add(this.labelPart('%blockVars'));};
    };
    this.fixLayout();
};

// BlockLabelFragment //////////////////////////////////////////////////

// BlockLabelFragment instance creation:

function BlockLabelFragment(labelString) {
    this.labelString = labelString || '';
    this.type = '%s';    // null for label, a spec for an input
    this.defaultValue = '';
    this.options = '';
    if (contains(['%s', '%n', '%txt', '%mlt', '%code', '%anyUE',
    '%numericUE', '%textingUE', '%linesUE', '%codeUE'], this.type)) {
    this.isReadOnly = false;
    this.isStatic = false;};
    this.separator = null; // for variadic slots
    this.isDeleted = false;
}

// accessing

BlockLabelFragment.prototype.defSpecFragment = function () {
    // answer a string representing my prototype's spec
    var pref = (this.type ? '%\'' : ''
    ); return (this.isDeleted ? '' : (
    pref + this.labelString + (
    this.type ? '\'' : '')));
};

BlockLabelFragment.prototype.defTemplateSpecFragment = function () {var suff = ''; if (!this.type) {return this.defSpecFragment();}; if (this.isUpvar()) {suff = '\u2191';} else if (this.isMultipleInput(
)) {suff = '...';} else if (contains(Object.keys(SyntaxElementMorph.prototype.pictureLabelExceptions), this.type)) {suff = Object.values(SyntaxElementMorph.prototype.pictureLabelExceptions)[Object.keys(
SyntaxElementMorph.prototype.pictureLabelExceptions).indexOf(this.type)];} else if (contains(['%cmdRing', '%repRing', '%predRing', '%cmd', '%r', '%p', '%instr', '%cl', '%c', '%cs', '%cla', '%loop', '%ca',
'%anyUE', '%numericUE', '%textingUE', '%linesUE', '%codeUE', '%boolUE', '%bUE'], this.type)) {suff = 'λ';} else if (this.defaultValue || contains([true, false, 0, '0'], this.defaultValue)) {if (
this.type === '%n') {suff = '# = ' + this.defaultValue.toString();} else if (contains(['%mlt', '%code'], this.type)) {suff = '¶ = ' + this.defaultValue.toString();} else if (contains(['%b', '%bool'],
this.type)) {suff = '? = ' + this.defaultValue.toString();} else {suff = '= ' + this.defaultValue.toString();};} else if (contains(['%b', '%bool'], this.type)) {suff = '?';} else if (this.type === '%n'
) {suff = '#';} else if (contains(['%mlt', '%code'], this.type)) {suff = '¶';}; return (this.labelString + ((suff.length > 0) ? (' ' + suff) : suff));};

BlockLabelFragment.prototype.blockSpecFragment = function anonymous () {/* answer a string representing my block spec */ return this.isDeleted ? '' : this.type || this.labelString;};

BlockLabelFragment.prototype.copy = function () {
    var ans = new BlockLabelFragment(this.labelString);
    ans.type = this.type;
    ans.defaultValue = this.defaultValue;
    ans.options = this.options;
    if (contains(['%s', '%n', '%txt', '%mlt', '%code', '%anyUE',
    '%numericUE', '%textingUE', '%linesUE', '%codeUE'], ans.type)) {
    ans.isReadOnly = this.isReadOnly;
    ans.isStatic = this.isStatic;};
    ans.separator = this.separator;
    return ans;
};

// options and special drop-down menus

BlockLabelFragment.prototype.hasOptions = function () {
    return this.options !== '' && !this.hasSpecialMenu();
};

BlockLabelFragment.prototype.hasSpecialMenu = function () {
    return contains(
        [
            '§_messagesMenu',
            '§_messagesReceivedMenu',    //for backward (5.0.0 - 5.0.3) support
            '§_objectsMenu',
            '§_costumesMenu',
            '§_soundsMenu',
            '§_getVarNamesDict',
            '§_pianoKeyboardMenu',
            '§_directionDialMenu',
            '§_typesMenu',
            '§_midsMenu'
        ],
        this.options
    );
};

BlockLabelFragment.prototype.hasExtensionMenu = function () {
    return contains(
        Array.from(SnapExtensions.menus.keys()).map(str => '§_ext_' + str),
        this.options
    );
};

// arity

BlockLabelFragment.prototype.isSingleInput = function () {
    return !this.isMultipleInput() &&
        (this.type !== '%upvar');
};

BlockLabelFragment.prototype.isMultipleInput = function () {
    // answer true if the type begins with '%mult'
    if (!this.type) {
        return false; // not an input at all
    }
    return this.type.indexOf('%mult') > -1;
};

BlockLabelFragment.prototype.isUpvar = function () {
    if (!this.type) {
        return false; // not an input at all
    }
    return this.type === '%upvar';
};

BlockLabelFragment.prototype.setToSingleInput = function () {
    if (!this.type) {return null; } // not an input at all
    if (this.type === '%upvar') {
        this.type = '%s';
    } else {
        this.type = this.singleInputType();
    }
};

BlockLabelFragment.prototype.setToMultipleInput = function () {
    if (!this.type) {return null; } // not an input at all
    if (this.type === '%upvar') {
        this.type = '%s';
    } else if (this.type === '%ca') {
        this.type = '%cs';
    }
    this.type = '%mult'.concat(this.singleInputType());
};

BlockLabelFragment.prototype.setToUpvar = function () {
    if (!this.type) {return null; } // not an input at all
    this.type = '%upvar';
};

BlockLabelFragment.prototype.singleInputType = function () {
    // answer the type of my input withtou any preceding '%mult'
    if (!this.type) {
        return null; // not an input at all
    }
    if (this.isMultipleInput()) {
        return this.type.substr(5); // everything following '%mult'
    }
    return this.type;
};

BlockLabelFragment.prototype.setSingleInputType = function (type) {
    if (!this.type || !this.isMultipleInput()) {
        this.type = type;
    } else {
        this.type = '%mult'.concat(type);
    }
};

// BlockLabelFragmentMorph ///////////////////////////////////////////////

/*
    I am a single word in a custom block prototype's label. I can be clicked
    to edit my contents and to turn me into an input placeholder.
*/

// BlockLabelFragmentMorph inherits from Morph:

BlockLabelFragmentMorph.prototype = new Morph;
BlockLabelFragmentMorph.prototype.constructor = BlockLabelFragmentMorph;
BlockLabelFragmentMorph.uber = Morph.prototype;

// BlockLabelFragmentMorph instance creation:

function BlockLabelFragmentMorph(spec, shape) {
    this.init(spec, shape);
}

BlockLabelFragmentMorph.prototype.init = function (spec, shape) {
    BlockLabelFragmentMorph.uber.init.call(this);
    this.spec = spec;
    this.fragment = new BlockLabelFragment(spec);
    this.fragment.type = null;
    this.sO = null; // temporary backup for shadowOffset
    this.shape =  shape; // the actual label part, a StringMorph or SymbolMorph
    this.add(shape);
//    this.fixLayout();
};

BlockLabelFragmentMorph.prototype.fixLayout = function () {
    this.bounds = this.shape.bounds;
};

BlockLabelFragmentMorph.prototype.render = nop;

// BlockLabelFragmentMorph events:

BlockLabelFragmentMorph.prototype.mouseEnter = function () {
    this.sO = this.shape.shadowOffset;
    this.shape.shadowOffset = this.sO.neg();
    this.shape.fixLayout();
    this.shape.rerender();
    this.fixLayout();
};

BlockLabelFragmentMorph.prototype.mouseLeave = function () {
    this.shape.shadowOffset = this.sO;
    this.shape.fixLayout();
    this.shape.rerender();
    this.fixLayout();
};

BlockLabelFragmentMorph.prototype.mouseClickLeft = function () {
/*
    make a copy of my fragment object and open an InputSlotDialog on it.
    If the user acknowledges the DialogBox, assign the - edited - copy
    of the fragment object to be my new fragment object and update the
    custom block'label (the prototype in the block editor). Do not yet update
    the definition and every block instance, as this happens only after
    the user acknowledges and closes the block editor
*/
    var frag = this.fragment.copy(),
        isPlaceHolder = this instanceof BlockLabelPlaceHolderMorph,
        isOnlyElement = this.parent.parseSpec(this.parent.blockSpec).length
            < 2;

    new InputSlotDialogMorph(
        frag,
        null,
        () => this.updateBlockLabel(frag),
        this.spec,
        this.parent.definition.category
    ).open(
        this instanceof BlockLabelFragmentMorph ?
                'Edit label fragment' :
                isPlaceHolder ? 'Create input name' : 'Edit input name',
        frag.labelString,
        this.world(),
        null,
        isPlaceHolder || isOnlyElement
    );
};

BlockLabelFragmentMorph.prototype.updateBlockLabel = function (newFragment) {
    var prot = this.parentThatIsA(BlockMorph);
    this.fragment = newFragment;
    if (prot) {
        prot.refreshPrototype();
    }
};

BlockLabelFragmentMorph.prototype.userMenu = function () {
    // show a menu of built-in special symbols
    var symbolColor = new Color(100, 100, 130),
        menu = new MenuMorph(
            (string) => {
                var tuple = this.spec.split('-');
                this.changed();
                tuple[0] = '$' + string;
                this.text = tuple.join('-');
                this.fragment.labelString = this.spec;
                this.parent.parent.changed();
                this.fixLayout();
                this.parent.parent.fixLayout();
                this.parent.parent.changed();
            },
            null,
            this,
            this.fontSize
        );
    SymbolMorph.prototype.names.forEach(name =>
        menu.addItem(
            [new SymbolMorph(name, menu.fontSize, symbolColor), localize(name)],
            name
        )
    );
    menu.addLine();
    menu.addItem('\u23CE ' + localize('new line'), 'nl');
    return menu;
};

// BlockLabelPlaceHolderMorph ///////////////////////////////////////////////

/*
    I am a space between words or inputs in a custom block prototype's label.
    When I am moused over I display a plus sign on a colored background
    circle. I can be clicked to add a new word or input to the prototype.
*/

// BlockLabelPlaceHolderMorph inherits from Morph:

BlockLabelPlaceHolderMorph.prototype = new Morph;
BlockLabelPlaceHolderMorph.prototype.constructor = BlockLabelPlaceHolderMorph;
BlockLabelPlaceHolderMorph.uber = Morph.prototype;

// BlockLabelPlaceHolderMorph preferences settings

BlockLabelPlaceHolderMorph.prototype.plainLabel = false; // always show (+)

// BlockLabelPlaceHolderMorph instance creation:

function BlockLabelPlaceHolderMorph() {
    this.init();
}

BlockLabelPlaceHolderMorph.prototype.init = function () {
    this.fragment = new BlockLabelFragment('');
    this.fragment.type = '%s';
    this.fragment.isDeleted = true;
    this.isHighlighted = false;
    BlockLabelFragmentMorph.uber.init.call(this);
};

// BlockLabelPlaceHolderMorph drawing

BlockLabelPlaceHolderMorph.prototype.fixLayout = function () {
    var h = fontHeight(SyntaxElementMorph.prototype.fontSize * 1.4);
    this.bounds.setHeight(h);
    this.bounds.setWidth(
        this.isHighlighted || !this.plainLabel ? h / 2 :
            SyntaxElementMorph.prototype.scale
    );

    // notify my parent of layout change - move to fixLayout()
    if (this.parent) {
        if (this.parent.fixLayout) {
            this.parent.fixLayout();
        }
        if (this.parent.parent instanceof PrototypeHatBlockMorph) {
            this.parent.parent.fixLayout();
        }
    }
};

BlockLabelPlaceHolderMorph.prototype.render = function (ctx) {
    var cx = this.width() / 2,
        cy = this.height() / 2,
        r = Math.min(cx, cy),
        unit = SyntaxElementMorph.prototype.scale;

    // draw background, if any
    if (this.isHighlighted) {
        ctx.fillStyle = this.color.toString();
        ctx.beginPath();
        ctx.arc(
            cx,
            cy,
            r,
            radians(0),
            radians(360),
            false
        );
        ctx.closePath();
        ctx.fill();
    }

    if (!this.plainLabel || this.isHighlighted) {
        ctx.strokeStyle = this.isHighlighted ? 'white' : this.color.toString();
        ctx.lineWidth = unit;
        ctx.beginPath();
        ctx.moveTo(unit, cy);
        ctx.lineTo(r * 2 - unit, cy);
        ctx.moveTo(r, cy - r + unit);
        ctx.lineTo(r, cy + r - unit);
        ctx.stroke();
    }
};

// BlockLabelPlaceHolderMorph events:

BlockLabelPlaceHolderMorph.prototype.mouseEnter = function () {
    var hat = this.parentThatIsA(PrototypeHatBlockMorph);
    this.isHighlighted = true;
    if (this.plainLabel && hat) {
        hat.changed();
        this.fixLayout();
        hat.changed();
    } else {
        this.fixLayout();
        this.rerender();
    }
};

BlockLabelPlaceHolderMorph.prototype.mouseLeave = function () {
    var hat = this.parentThatIsA(PrototypeHatBlockMorph);
    this.isHighlighted = false;
    if (this.plainLabel && hat) {
        hat.changed();
        this.fixLayout();
        hat.changed();
    } else {
        this.fixLayout();
        this.rerender();
    }
};

BlockLabelPlaceHolderMorph.prototype.mouseClickLeft
    = BlockLabelFragmentMorph.prototype.mouseClickLeft;

BlockLabelPlaceHolderMorph.prototype.updateBlockLabel
    = BlockLabelFragmentMorph.prototype.updateBlockLabel;

// BlockInputFragmentMorph ///////////////////////////////////////////////

/*
    I am a variable blob in a custom block prototype's label. I can be clicked
    to edit my contents and to turn me into an part of the block's label text.
*/

// BlockInputFragmentMorph inherits from TemplateSlotMorph:

BlockInputFragmentMorph.prototype = new TemplateSlotMorph;
BlockInputFragmentMorph.prototype.constructor = BlockInputFragmentMorph;
BlockInputFragmentMorph.uber = TemplateSlotMorph.prototype;

// BlockInputFragmentMorph instance creation:

function BlockInputFragmentMorph(text) {
    this.init(text);
}

BlockInputFragmentMorph.prototype.init = function (text) {
    this.fragment = new BlockLabelFragment(text);
    this.fragment.type = '%s';
    BlockInputFragmentMorph.uber.init.call(this, text);
};

// BlockInputFragmentMorph events:

BlockInputFragmentMorph.prototype.mouseClickLeft
    = BlockLabelFragmentMorph.prototype.mouseClickLeft;

BlockInputFragmentMorph.prototype.updateBlockLabel
    = BlockLabelFragmentMorph.prototype.updateBlockLabel;

// InputSlotDialogMorph ////////////////////////////////////////////////

// ... "inherits" some methods from BlockDialogMorph

// InputSlotDialogMorph inherits from DialogBoxMorph:

InputSlotDialogMorph.prototype = new DialogBoxMorph();
InputSlotDialogMorph.prototype.constructor = InputSlotDialogMorph;
InputSlotDialogMorph.uber = DialogBoxMorph.prototype;

// InputSlotDialogMorph preferences settings:

// if "isLaunchingExpanded" is true I always open in the long form
InputSlotDialogMorph.prototype.isLaunchingExpanded = false;

// InputSlotDialogMorph instance creation:

function InputSlotDialogMorph(
    fragment,
    target,
    action,
    environment,
    category
) {
    this.init(fragment, target, action, environment, category);
}

InputSlotDialogMorph.prototype.init = function (
    fragment,
    target,
    action,
    environment,
    category
) {
    var scale = SyntaxElementMorph.prototype.scale,
        fh = fontHeight(10) / 1.2 * scale; // "raw height"

    // additional properties:
    this.fragment = fragment || new BlockLabelFragment();
    this.textfield = null;
    this.types = null;
    this.slots = null;
    this.isExpanded = false;
    this.category = category || 'other';
    this.noDelete = false;

    // initialize inherited properties:
    BlockDialogMorph.uber.init.call(
        this,
        target,
        action,
        environment
    );

    // override inherited properites:
    this.types = new AlignmentMorph('row', this.padding);
    this.types.respectHiddens = true; // prevent the arrow from flipping
    this.add(this.types);
    this.slots = new BoxMorph();
    this.slots.color = new Color(55, 55, 55); // same as palette
    this.slots.borderColor = this.slots.color.lighter(50);
    this.slots.setExtent(new Point((fh + 10) * 24, (fh + 10 * scale) * 10.4));
    this.add(this.slots);
    this.createSlotTypeButtons();
    this.fixSlotsLayout();
    this.addSlotsMenu();
    this.createTypeButtons();
    this.fixLayout();
};

InputSlotDialogMorph.prototype.createTypeButtons = function () {
    var block,
        arrow,
        clr = SpriteMorph.prototype.blockColorFor(this.category);


    block = new JaggedBlockMorph(localize('Title text'));
    block.setColor(clr);
    this.addBlockTypeButton(
        () => this.setType(null),
        block,
        () => this.fragment.type === null
    );

    block = new JaggedBlockMorph;
    block.add(new TemplateSlotMorph(localize('Input Name')));
    block.setColor(clr); this.addBlockTypeButton(
        () => this.setType('%s'),
        block,
        () => this.fragment.type !== null
    );

    // add an arrow button for long form/short form toggling
    arrow = new ArrowMorph(
        'right',
        PushButtonMorph.prototype.fontSize + 4,
        2
    );
    arrow.noticesTransparentClick = true;
    this.types.add(arrow);
    this.types.fixLayout();

    // configure arrow button
    arrow.refresh = () => {
        if (this.fragment.type === null) {
            this.isExpanded = false;
            arrow.hide();
        } else {
            arrow.show();
            if (this.isExpanded) {
                arrow.direction = 'down';
            } else {
                arrow.direction = 'right';
            }
            arrow.fixLayout();
            arrow.rerender();
        }
    };

    arrow.mouseClickLeft = () => {
        if (arrow.isVisible) {
            this.isExpanded = !this.isExpanded;
            this.types.children.forEach(c => c.refresh());
            this.changed();
            this.fixLayout();
            this.rerender();
            this.edit();
        }
    };

    arrow.refresh();
};

InputSlotDialogMorph.prototype.addTypeButton
    = BlockDialogMorph.prototype.addTypeButton;

InputSlotDialogMorph.prototype.addBlockTypeButton
    = BlockDialogMorph.prototype.addBlockTypeButton;

InputSlotDialogMorph.prototype.setType = function (fragmentType) {
    this.textfield.choices = fragmentType ? null : this.symbolMenu;
    this.textfield.fixLayout();
    this.fragment.type = fragmentType || null;
    this.types.children.forEach(c => c.refresh());
    this.slots.children.forEach(c => c.refresh());
    this.isExpanded = this.isExpanded || (!isNil(fragmentType) && this.isLaunchingExpanded);
    this.types.children.forEach(c => c.refresh());
    this.changed();
    this.fixLayout();
    this.rerender();
    this.edit();
};

InputSlotDialogMorph.prototype.getInput = function () {
    var lbl;
    if (this.body instanceof InputFieldMorph) {
        lbl = this.normalizeSpaces(this.body.getValue());
    }
    if (lbl) {
        this.fragment.labelString = lbl;
        if (contains(['%b', '%boolUE', '%bool', '%bUE'], this.fragment.type)) {
            this.fragment.defaultValue =
                this.slots.defaultSwitch.evaluate();
        } else {
            this.fragment.defaultValue =
                this.slots.defaultInputField.getValue();
        }
        return lbl;
    }
    // otherwise remove the fragment
    this.fragment.isDeleted = true;
    return null;
};

InputSlotDialogMorph.prototype.fixLayout = function () {
    var maxWidth,
        left = this.left(),
        th = fontHeight(this.titleFontSize) + this.titlePadding * 2;

    if (!this.isExpanded) {
        if (this.slots) {
            this.slots.hide();
        }
        return BlockDialogMorph.prototype.fixLayout.call(this);
    }

    this.slots.show();
    maxWidth = this.slots.width();

    // arrange panes :
    // body (input field)
    this.body.setPosition(this.position().add(new Point(
        this.padding + (maxWidth - this.body.width()) / 2,
        th + this.padding
    )));

    // label
    this.label.setLeft(
        left + this.padding + (maxWidth - this.label.width()) / 2
    );
    this.label.setTop(this.top() + (th - this.label.height()) / 2);

    // types
    this.types.fixLayout();
    this.types.setTop(this.body.bottom() + this.padding);
    this.types.setLeft(
        left + this.padding + (maxWidth - this.types.width()) / 2
    );

    // slots
    this.slots.setPosition(new Point(
        this.left() + this.padding,
        this.types.bottom() + this.padding
    ));
    this.slots.children.forEach(c => c.refresh());

    // buttons
    this.buttons.fixLayout();
    this.buttons.setTop(this.slots.bottom() + this.padding);
    this.buttons.setLeft(
        left + this.padding + (maxWidth - this.buttons.width()) / 2
    );

    // set dialog box dimensions:
    this.bounds.setHeight(this.buttons.bottom() - this.top() + this.padding);
    this.bounds.setWidth(this.slots.right() - this.left() + this.padding);

    // refresh a shallow shadow
    this.removeShadow();
    this.addShadow();
};

InputSlotDialogMorph.prototype.open = function (
    title,
    defaultString,
    world,
    pic,
    noDeleteButton
) {
    var txt = new InputFieldMorph(defaultString);

    if (!this.fragment.type) {
        txt.choices = this.symbolMenu;
    }
    this.isExpanded = this.isLaunchingExpanded;
    txt.setWidth(250);
    this.labelString = title;
    this.createLabel();
    if (pic) {this.setPicture(pic); }
    this.addBody(txt);
    this.textfield = txt;
    this.addButton('ok', 'OK');
    if (!noDeleteButton) {this.addButton('deleteFragment', 'Delete');} else {this.noDelete = true;};
    this.addButton('cancel', 'Cancel');
    this.fixLayout();
    this.popUp(world);
    this.add(this.types);
    this.changed();
};

InputSlotDialogMorph.prototype.symbolMenu = function anonymous () {var symbols = [], symbolColor = new Color(100, 100, 130); SymbolMorph.prototype.names.forEach(sym => symbols.push([[new SymbolMorph(
sym, this.fontSize, symbolColor), localize(sym)],'$' + sym])); symbols.push(['\u23CE ' + localize('new line'), '$nl']); return symbols;}; InputSlotDialogMorph.prototype.deleteFragment = function () {
this.fragment.isDeleted = true; this.accept();}; InputSlotDialogMorph.prototype.createSlotTypeButtons = function () {var defLabel, defInput, defSwitch, loopArrow, settingsButton;
this.addSlotTypeButton('Color\nPicker', '%clr'); this.addSlotTypeButton('Object\nInput', '%obj'); this.addSlotTypeButton('List\nInput', '%l'); this.addSlotTypeButton('Costume Slot', '%costume');
this.addSlotTypeButton('Sound Slot', '%sound'); this.addSlotTypeButton('Unknown Slot', '%unknownSlot'); this.addSlotTypeButton('Command\n\(C-Shape\)', ['%cl', '%c', '%cs', '%cla', '%loop', '%ca']);
defLabel = new StringMorph(localize('Default Value:')); this.addSlotTypeButton('String\nInput', ['%s', '%n', '%txt', '%mlt', '%code', '%anyUE', '%numericUE', '%textingUE', '%linesUE', '%codeUE']);
this.addSlotTypeButton('Boolean\nInput', ['%b', '%boolUE', '%bool', '%bUE']); defLabel.setColor(WHITE); this.addSlotTypeButton('Lambda\nBlock', ['%repRing', '%cmdRing', '%predRing']);
this.addSlotTypeButton('Block\nSlot', ['%cmd', '%r', '%p', '%instr']); this.addSlotTypeButton('Multiple\nVariables', '%scriptVars'); this.addSlotTypeButton('Script\nParameters', '%parms');
this.addSlotTypeButton('Script\nInputs', '%inputs'); this.addSlotTypeButton('Two Default\nInputs', ['%words', '%nums', '%lists', '%colors']); this.slots.radioButtonSingle = this.addSlotArityButton(
() => this.setSlotArity('single'), "Single input.", () => this.fragment.isSingleInput()); this.addSlotArityButton(() => this.setSlotArity('multiple'), "Multiple inputs.",() => this.fragment.isMultipleInput());
this.addSlotArityButton(() => this.setSlotArity('upvar'), "Script variable.", () => this.fragment.isUpvar()); defLabel.fontSize = this.slots.radioButtonSingle.fontSize; defLabel.refresh = () => {
if (this.isExpanded && contains(['%s', '%n', '%txt', '%mlt', '%code', '%anyUE', '%numericUE', '%textingUE', '%linesUE', '%codeUE', '%b', '%boolUE', '%bool', '%bUE'], this.fragment.type)) {defLabel.show();
} else {defLabel.hide();}}; this.slots.defaultInputLabel = defLabel; this.slots.add(defLabel); defInput = new InputFieldMorph(this.fragment.defaultValue); defInput.contents().fontSize = defLabel.fontSize;
defInput.contrast = 90; defInput.setWidth(50); defInput.refresh = () => {if (this.isExpanded && contains(['%s', '%n', '%txt', '%mlt', '%code', '%anyUE', '%numericUE', '%textingUE', '%linesUE', '%codeUE'],
this.fragment.type)) {defInput.show(); if (contains(['%n', '%numericUE'], this.fragment.type)) {defInput.setIsNumeric(true);} else {defInput.setIsNumeric(false);}} else {defInput.hide();}};
this.slots.defaultInputField = defInput; this.slots.add(defInput); defSwitch = new BooleanSlotMorph(this.fragment.defaultValue); defSwitch.refresh = () => {if (this.isExpanded && contains(['%b', '%boolUE',
'%bool', '%bUE'], this.fragment.type)) {defSwitch.show();} else {defSwitch.hide();}}; this.slots.defaultSwitch = defSwitch; this.slots.add(defSwitch); loopArrow = new ToggleMorph('checkbox', this, () => {
if (contains(['%ca', '%loop', '%cla'], this.fragment.type)) {if (this.fragment.type === '%ca') {this.setType('%cs');} else if (this.fragment.type === '%loop') {this.setType('%c');} else if (
this.fragment.type === '%cla') {this.setType('%cl');};} else {if (this.fragment.type === '%cs') {this.setType('%ca');} else if (this.fragment.type === '%c') {this.setType('%loop');} else if (
this.fragment.type === '%cl') {this.setType('%cla');};};}, null, () => contains(['%ca', '%loop', '%cla'], this.fragment.type), null, null, new SymbolMorph('loop', this.fontSize * 0.7, WHITE).getImage(), null);
loopArrow.refresh = () => {ToggleMorph.prototype.refresh.call(loopArrow); if (this.isExpanded && contains(['%cs', '%c', '%cl', '%ca', '%loop', '%cla'], this.fragment.type)) {loopArrow.show();} else {
loopArrow.hide();}}; this.slots.loopArrow = loopArrow; this.slots.add(loopArrow); settingsButton = new PushButtonMorph(this.slots, () => {var menu = (this.slots.userMenu()); if (menu instanceof DialogBoxMorph) {
menu.popUp(world);} else if (menu instanceof MenuMorph) {menu.popUpAtHand(world);};}, new SymbolMorph('gears', this.fontSize * 1.5)); settingsButton.padding = 0; settingsButton.fixLayout();
settingsButton.refresh = nop; this.slots.settingsButton = settingsButton; this.slots.add(settingsButton);}; InputSlotDialogMorph.prototype.setSlotType = function (type) {this.fragment.setSingleInputType(type);
this.slots.children.forEach(c => c.refresh()); this.edit();}; InputSlotDialogMorph.prototype.setSlotArity = function (arity) {if (arity === 'single') {this.fragment.setToSingleInput();} else if (
arity === 'multiple') {this.fragment.setToMultipleInput();} else if (arity === 'upvar') {this.fragment.setToUpvar();}; this.slots.children.forEach(c => c.refresh()); this.edit();};
InputSlotDialogMorph.prototype.setSlotOptions = function (text) {this.fragment.options = text;}; InputSlotDialogMorph.prototype.addSlotTypeButton = function (label, spec) {var action = () => {this.setSlotType(
spec instanceof Array ? spec[0] : spec);}, query, element = new JaggedBlockMorph((spec instanceof Array) ? spec[0] : spec), button; query = () => {return spec instanceof Array ? contains(spec,
this.fragment.singleInputType()) : this.fragment.singleInputType() === spec;}; element.setCategory(this.category); element.rebuild(); button = new ToggleMorph('radiobutton', this, action, label, query, null, null,
element.doWithAlpha(1, () => element.fullImage()), 'rebuild'); button.edge = this.buttonEdge / 2; button.outline = this.buttonOutline / 2; button.outlineColor = this.buttonOutlineColor;
button.outlineGradient = this.buttonOutlineGradient; button.fixLayout(); button.label.isBold = false; button.label.setColor(WHITE); this.slots.add(button); return button;};
InputSlotDialogMorph.prototype.addSlotArityButton = function (action, label, query) {var button = new ToggleMorph('radiobutton', this, action, label, query, null, null); button.edge = this.buttonEdge / 2;
button.outline = this.buttonOutline / 2; button.outlineColor = this.buttonOutlineColor; button.outlineGradient = this.buttonOutlineGradient; button.fixLayout(); /* button.label.isBold = false; */
button.label.setColor(WHITE); this.slots.add(button); return button;}; InputSlotDialogMorph.prototype.fixSlotsLayout = function () {var slots = this.slots, scale = SyntaxElementMorph.prototype.scale,
xPadding = 10 * scale, ypadding = 12.5 * scale, size = 15, bh = (fontHeight(10) / 1.5 + 15) * scale, ah = (fontHeight(10) / 1 + 10) * scale, cols = [slots.left() + xPadding, slots.left() + slots.width(
) * (1.25 / 3), slots.left() + slots.width() * (2 / 3)], rows = [slots.top() + ypadding, slots.top() + ypadding + bh, slots.top() + ypadding + bh * 2, slots.top() + ypadding + bh * 3.0625, slots.top(
) + ypadding + bh * 4, slots.top() + ypadding + bh * 5, slots.top() + ypadding + bh * 5 + ah, slots.top() + ypadding + bh * 5 + ah * 2], idx, row = -1, col; for (idx = 0; idx < size; idx += 1) {col = idx % 3; if (
idx % 3 === 0) {row += 1;} slots.children[idx].setPosition(new Point(cols[col], rows[row]));}; col = 0; row = 5; for (idx = size; idx < size + 3; idx += 1) {slots.children[idx].setPosition(new Point(cols[col],
rows[row + idx - size]));}; this.slots.defaultInputLabel.setPosition(this.slots.radioButtonSingle.label.topRight().add(new Point(5, 0))); this.slots.defaultInputField.setCenter(this.slots.defaultInputLabel.center(
).add(new Point(this.slots.defaultInputField.width() / 2 + this.slots.defaultInputLabel.width() / 2 + 5, 0))); this.slots.defaultSwitch.setCenter(this.slots.defaultInputLabel.center().add(new Point(
this.slots.defaultSwitch.width() / 2 + this.slots.defaultInputLabel.width() / 2 + 5, 0))); this.slots.loopArrow.setPosition(this.slots.defaultInputLabel.position());
this.slots.settingsButton.setPosition(this.slots.bottomRight().subtract(this.slots.settingsButton.extent().add(this.padding + this.slots.border))); this.slots.changed();};
InputSlotDialogMorph.prototype.addSlotsMenu = function anonymous () {this.slots.userMenu = (() => {if ((typeof this.fragment.type) === 'string') {if (this.fragment.type.includes(
'%mult')) {return this.variadicSlotsMenu();} else if (contains(['%cmd', '%r', '%p', '%instr', '%cmdRing', '%repRing', '%predRing'], this.fragment.type)) {return this.scriptSlotsMenu(
);} else if (contains(['%cs', '%c', '%cl', '%ca', '%loop', '%cla'], this.fragment.type)) {return this.cShapeSlotsMenu();} else if (contains(['%words', '%nums', '%lists', '%colors'],
this.fragment.type)) {var menu = new MenuMorph(this), on = new SymbolMorph('checkedBox', MorphicPreferences.menuFontSize * 0.75), off = new SymbolMorph('rectangle', (
MorphicPreferences.menuFontSize * 0.75)); menu.addPair((this.fragment.type === '%words' ? on : off), (function () {this.fragment.type = '%words';}), localize(
'for any types')); menu.addPair((this.fragment.type === '%nums' ? on : off), (function () {this.fragment.type = '%nums';}), localize('for number types'
)); menu.addPair((this.fragment.type === '%lists' ? on : off), (function () {this.fragment.type = '%lists';}), localize('for list types'));
menu.addPair((this.fragment.type === '%colors' ? on : off), (function () {this.fragment.type = '%colors';}), localize('for color types'
)); return menu;} else if (contains(['%b', '%boolUE', '%bool', '%bUE'], this.fragment.type)) {var menu = new MenuMorph(this),
on = new SymbolMorph('checkedBox', MorphicPreferences.menuFontSize * 0.75), off = new SymbolMorph('rectangle', MorphicPreferences.menuFontSize * 0.75);
menu.addPair((contains(['%boolUE', '%bUE'], this.fragment.type) ? on : off), (function () {if (contains(['%boolUE', '%bUE'], this.fragment.type)) {switch (this.fragment.type) {case '%boolUE': this.fragment.type = '%b'; break; case '%bUE': this.fragment.type = '%bool'; break; default: nop();};} else {switch (this.fragment.type) {case '%b':
this.fragment.type = '%boolUE'; break; case '%bool': this.fragment.type = '%bUE'; break; default: nop();};}}), localize('unevaluated'));
menu.addLine(); menu.addMenu(localize('types'), this.booleanSlotsMenu()); return menu;
} else if (contains(['%s', '%n', '%txt', '%mlt', '%code', '%anyUE', '%numericUE', '%textingUE', '%linesUE', '%codeUE'], this.fragment.type)) {var menu = new MenuMorph(this), on = new SymbolMorph('checkedBox',
MorphicPreferences.menuFontSize * 0.75), off = new SymbolMorph('rectangle', MorphicPreferences.menuFontSize * 0.75); menu.addPair((this.fragment.hasOptions() ? on : off), (function () {new DialogBoxMorph(this,
options => this.fragment.options = options.trim(), this).promptCode('Input Slot Options', this.fragment.options, this.world(), null, localize('Enter one option per line.\n' +
'Optionally use "=" as key/value delimiter ' + 'and {} for submenus. ' + 'e.g.\n   the answer=42'));}), localize('options') + '...'); menu.addPair((this.fragment.isReadOnly ? on : off),
(() => this.fragment.isReadOnly = !this.fragment.isReadOnly), localize('read-only')); menu.addPair((this.fragment.isStatic ? on : off), (() => this.fragment.isStatic = !this.fragment.isStatic),
localize('static')); menu.addPair((contains(['%anyUE', '%numericUE', '%textingUE', '%linesUE', '%codeUE'], this.fragment.type) ? on : off), (function () {if (contains(['%anyUE', '%numericUE',
'%textingUE', '%linesUE', '%codeUE'], this.fragment.type)) {switch (this.fragment.type) {case '%anyUE': this.fragment.type = '%s'; break; case '%numericUE': this.fragment.type = '%n'; break;
case '%textingUE': this.fragment.type = '%txt'; break; case '%linesUE': this.fragment.type = '%mlt'; break; case '%codeUE': this.fragment.type = '%code'; break; default: nop();};} else {switch (
this.fragment.type) {case '%s': this.fragment.type = '%anyUE'; break; case '%n': this.fragment.type = '%numericUE'; break; case '%txt': this.fragment.type = '%textingUE'; break; case '%mlt':
this.fragment.type = '%linesUE'; break; case '%code': this.fragment.type = '%codeUE'; break; default: nop();};};}), localize('unevaluated'));
menu.addLine(); menu.addMenu(localize('menu'), this.specialOptionsMenu()); menu.addLine(); menu.addMenu(localize('shapes'), this.stringSlotsMenu()); if (this.world().currentKey === 16) {menu.addMenu(
localize('extensions'), this.extensionOptionsMenu());}; return menu;};}; return InputSlotDialogMorph.prototype.noOptions();});};
InputSlotDialogMorph.prototype.cShapeSlotsMenu = function () {var menu = new MenuMorph(this.setSlotType, null, this), myself = this, on = new SymbolMorph('checkedBox',
MorphicPreferences.menuFontSize * 0.75), off = new SymbolMorph('rectangle', MorphicPreferences.menuFontSize * 0.75); function addSpecialSlotType(label, spec) {menu.addPair((myself.fragment.type === spec ? on : off
), spec, localize(label));}; if (contains(['%cs', '%c', '%cl'],myself.fragment.type)) {addSpecialSlotType('as static', '%cl'); addSpecialSlotType('as report-drop', '%cs');} else if (contains(['%ca', '%loop',
'%cla'], myself.fragment.type)) {addSpecialSlotType('as static', '%cla'); addSpecialSlotType('as report-drop', '%ca');}; return menu;};
InputSlotDialogMorph.prototype.scriptSlotsMenu = function () {var menu = new MenuMorph(this.setSlotType, null, this), myself = this, on = new SymbolMorph('checkedBox', MorphicPreferences.menuFontSize * 0.75),
off = new SymbolMorph('rectangle', MorphicPreferences.menuFontSize * 0.75); function addSpecialSlotType(label, spec) {menu.addPair((myself.fragment.type === spec ? on : off), spec, localize(label));}; if (
contains(['%cmdRing', '%repRing', '%predRing'], myself.fragment.type)) {addSpecialSlotType('as script', '%cmdRing'); addSpecialSlotType('as block', '%repRing');} else if (contains(['%cmd', '%r', '%p', '%instr'],
myself.fragment.type)) {addSpecialSlotType('as command', '%cmd'); addSpecialSlotType('as reporter', '%r'); addSpecialSlotType('as predicate', '%p'); addSpecialSlotType('as all-block', '%instr');}; return menu;};
InputSlotDialogMorph.prototype.stringSlotsMenu = function anonymous () {var menu = new MenuMorph(this.setSlotType, null, this), myself = this, on = new SymbolMorph('checkedBox', MorphicPreferences.menuFontSize *
0.75), off = new SymbolMorph('rectangle', (MorphicPreferences.menuFontSize * 0.75)); function addSpecialSlotType(label, spec) {menu.addPair((myself.fragment.type === spec ? on : off), spec, localize(label));};
if (contains(['%anyUE', '%numericUE', '%textingUE', '%linesUE', '%codeUE'],myself.fragment.type)) {addSpecialSlotType('normal', '%anyUE'); addSpecialSlotType('numerical', '%numericUE'); addSpecialSlotType(
'text-reader', '%textingUE'); addSpecialSlotType('multiline', '%linesUE'); addSpecialSlotType('simple-code', '%codeUE');} else {addSpecialSlotType('normal', '%s'); addSpecialSlotType('numerical', '%n');
addSpecialSlotType('text-reader', '%txt'); addSpecialSlotType('multiline', '%mlt'); addSpecialSlotType('JS code', '%code');}; return menu;}; InputSlotDialogMorph.prototype.booleanSlotsMenu = function () {
var menu = new MenuMorph(this.setSlotType, null, this), myself = this, on = new SymbolMorph('checkedBox', MorphicPreferences.menuFontSize * 0.75), off = new SymbolMorph('rectangle', MorphicPreferences.menuFontSize
* 0.75); function addSpecialSlotType(label, spec) {menu.addPair((myself.fragment.type === spec ? on : off), spec, localize(label));}; if (contains(['%boolUE', '%bUE'], myself.fragment.type)) {
addSpecialSlotType('tiny', '%boolUE'); addSpecialSlotType('big', '%bUE');} else {addSpecialSlotType('tiny', '%b'); addSpecialSlotType('big', '%bool');}; return menu;};
InputSlotDialogMorph.prototype.specialOptionsMenu = function () {var menu = new MenuMorph(this.setSlotOptions, null, this), myself = this, on = new SymbolMorph('checkedBox',
(MorphicPreferences.menuFontSize * 0.75)), off = new SymbolMorph('rectangle', MorphicPreferences.menuFontSize * 0.75); function addSpecialOptions(label, selector) {
menu.addPair((myself.fragment.options === selector ? on : off), selector, localize(label));}; addSpecialOptions('\(none\)', ''); addSpecialOptions('messages', '§_messagesMenu'); addSpecialOptions(
'objects', '§_objectsMenu'); addSpecialOptions('costumes', '§_costumesMenu'); addSpecialOptions('sounds', '§_soundsMenu'); addSpecialOptions('variables', '§_getVarNamesDict'); addSpecialOptions('piano keyboard',
'§_pianoKeyboardMenu'); addSpecialOptions('360° dial', '§_directionDialMenu'); addSpecialOptions('data types', '§_typesMenu'); addSpecialOptions('midi system', '§_midsMenu'); return menu;};
InputSlotDialogMorph.prototype.extensionOptionsMenu = function () {var menu = new MenuMorph(this.setSlotOptions, null, this), myself = this, selectors = Array.from(SnapExtensions.menus.keys()), on = new SymbolMorph('checkedBox', MorphicPreferences.menuFontSize * 0.75), off = new SymbolMorph('rectangle', MorphicPreferences.menuFontSize * 0.75); function addSpecialOptions(label, selector) {menu.addPair((
myself.fragment.options === selector ? on : off), selector, localize(label));}; selectors.forEach(sel => {addSpecialOptions(sel.slice(4), '§_ext_' + sel);}); return menu;};
InputSlotDialogMorph.prototype.show = function () {this.isVisible = true; this.changed();}; InputSlotDialogMorph.prototype.hide = function () {this.isVisible = false; this.changed();};
InputSlotDialogMorph.prototype.editSeparator = function () {new DialogBoxMorph(this, str => this.fragment.separator = str, this).prompt("Name the separator...", (this.fragment.separator || ''), this.world());};
InputSlotDialogMorph.prototype.variadicSlotsMenu = function () {var menu = new MenuMorph(this), on = new SymbolMorph('checkedBox', MorphicPreferences.menuFontSize * 0.75), off = new SymbolMorph(
'rectangle', MorphicPreferences.menuFontSize * 0.75); menu.addPair((this.fragment.separator ? on : off), 'editSeparator', localize('separator') + '...'); return menu;};
InputSlotDialogMorph.prototype.noOptions = function anonymous () {var dialog = new DialogBoxMorph; var txt = new TextMorph('There are no options\nto put here.', DialogBoxMorph.prototype.fontSize,
DialogBoxMorph.prototype.fontStyle, true, false, 'center', null, null, MorphicPreferences.isFlat ? null : new Point(1, 1), WHITE); dialog.key = 'NOINPUTOPTIONSONTHERE'; dialog.labelString = 'Uhh...';
dialog.createLabel(); dialog.addBody(txt); dialog.addButton('ok', 'OK'); dialog.fixLayout(); dialog.rerender(); return dialog;};

// VariableDialogMorph ////////////////////////////////////////////////////

// VariableDialogMorph inherits from DialogBoxMorph:

VariableDialogMorph.prototype = new DialogBoxMorph;
VariableDialogMorph.prototype.constructor = VariableDialogMorph;
VariableDialogMorph.uber = DialogBoxMorph.prototype;

// ... and some behavior from BlockDialogMorph

// VariableDialogMorph instance creation:

function VariableDialogMorph(target, action, environment) {
    this.init(target, action, environment);
}

VariableDialogMorph.prototype.init = function (target, action, environment) {
    // additional properties:
    this.types = null;
    this.isGlobal = true;

    // initialize inherited properties:
    BlockDialogMorph.uber.init.call(
        this,
        target,
        action,
        environment
    );

    // override inherited properites:
    this.types = new AlignmentMorph('row', this.padding);
    this.add(this.types);
    this.createTypeButtons();
};

VariableDialogMorph.prototype.createTypeButtons = function () {
    this.addTypeButton(
        () => this.setType('global'),
        "for all sprites",
        () => this.isGlobal
    );
    this.addTypeButton(
        () => this.setType('local'),
        "for this sprite only",
        () => !this.isGlobal
    );
};

VariableDialogMorph.prototype.addTypeButton
    = BlockDialogMorph.prototype.addTypeButton;

VariableDialogMorph.prototype.setType = function (varType) {
    this.isGlobal = (varType === 'global');
    this.types.children.forEach(c => c.refresh());
    this.edit();
};

VariableDialogMorph.prototype.getInput = function () {
    // answer a tuple: [varName, isGlobal]
    var name = this.normalizeSpaces(this.body.getValue());
    return name ? [name, this.isGlobal] : null;
};

VariableDialogMorph.prototype.fixLayout = function () {
    var th = fontHeight(this.titleFontSize) + this.titlePadding * 2;

    if (this.body) {
        this.body.setPosition(this.position().add(new Point(
            this.padding,
            th + this.padding
        )));
        this.bounds.setWidth(this.body.width() + this.padding * 2);
        this.bounds.setHeight(
            this.body.height()
                + this.padding * 2
                + th
        );
    }

    if (this.label) {
        this.label.setCenter(this.center());
        this.label.setTop(this.top() + (th - this.label.height()) / 2);
    }

    if (this.types) {
        this.types.fixLayout();
        this.bounds.setHeight(
            this.height()
                    + this.types.height()
                    + this.padding
        );
        this.bounds.setWidth(Math.max(
            this.width(),
            this.types.width() + this.padding * 2
        ));
        this.types.setCenter(this.center());
        if (this.body) {
            this.types.setTop(this.body.bottom() + this.padding);
        } else if (this.categories) {
            this.types.setTop(this.categories.bottom() + this.padding);
        }
    }

    if (this.buttons && (this.buttons.children.length > 0)) {
        this.buttons.fixLayout();
        this.bounds.setHeight(
            this.height()
                    + this.buttons.height()
                    + this.padding
        );
        this.buttons.setCenter(this.center());
        this.buttons.setBottom(this.bottom() - this.padding);
    }

    // refresh a shallow shadow
    this.removeShadow();
    this.addShadow();
};

// BlockExportDialogMorph ////////////////////////////////////////////////////

// BlockExportDialogMorph inherits from DialogBoxMorph:

BlockExportDialogMorph.prototype = new DialogBoxMorph;
BlockExportDialogMorph.prototype.constructor = BlockExportDialogMorph;
BlockExportDialogMorph.uber = DialogBoxMorph.prototype;

// BlockExportDialogMorph constants:

BlockExportDialogMorph.prototype.key = 'blockExport';

// BlockExportDialogMorph instance creation:

function BlockExportDialogMorph(serializer, blocks, target) {
    this.init(serializer, blocks, target);
};

BlockExportDialogMorph.prototype.init = function (serializer, blocks, target) {
    // additional properties:
    this.serializer = serializer;
    this.blocks = blocks.slice(0);
    this.handle = null;

    // initialize inherited properties:
    BlockExportDialogMorph.uber.init.call(
        this,
        target, // target
        () => this.exportBlocks(),
        null // environment
    );

    // override inherited properites:
    this.labelString = 'Export blocks';
    this.createLabel();

    // build contents
    this.buildContents();
};

BlockExportDialogMorph.prototype.buildContents = function () {
    var palette, x, y, block, checkBox, lastCat, catCheckBox
        padding = 4;

    // create palette
    palette = new ScrollFrameMorph(
        null,
        null,
        SpriteMorph.prototype.sliderColor
    );
    palette.color = SpriteMorph.prototype.paletteColor;
    palette.padding = padding;
    palette.isDraggable = false;
    palette.acceptsDrops = false;
    palette.contents.acceptsDrops = false;

    // populate palette
    x = palette.left() + padding;
    y = palette.top() + padding;
    SpriteMorph.prototype.allCategories().forEach(category => {
        this.blocks.forEach(definition => {
            if (definition.category === category) {
                if (category !== lastCat) {
                    y += padding;
                    catCheckBox = new ToggleMorph(
                        'checkbox',
                        this,
                        () => {
                            var blocks = [];
                            if (contains(this.blocks.map(b => b.category), category)) {
                                this.blocks.forEach(block => {
                                    if (block.category != category) {
                                        blocks.push(block)
                                    };
                                });
                                this.blocks = blocks;
                            }   else {
                                this.body.contents.children.forEach(block => {
                                    if (block instanceof ToggleMorph) {
                                        if ((block.element instanceof CustomReporterBlockMorph) || (
                                             block.element instanceof CustomCommandBlockMorph) || (
                                             block.element instanceof CustomDefinitorBlockMorph)) {
                                            if (block.element.category == category) {
                                                if (!contains(this.blocks, block.element.definition)) {
                                                    block.trigger()
                                                };
                                            };
                                        };
                                    };
                                });
                            };  this.body.contents.children.forEach(checkBox => {
                                    if (checkBox instanceof ToggleMorph) {
                                        checkBox.refresh();
                                    };
                                });
                        },
                        // category,
                        null,
                        () => contains(this.blocks.map(b => b.category), category),
                        null,
                        null                        
                    )
                    // catCheckBox.label.color = new Color(255, 255, 255, 1)
                    // catCheckBox.label.fontSize = 12
                    // catCheckBox.label.setWidth()
                    // catCheckBox.label.setTop()
                    // catCheckBox.element.setTop(-(catCheckBox.fullBounds().height()/2))
                    catCheckBox.setPosition(new Point(
                        x,
                        y + (catCheckBox.top())
                    ));
                    palette.addContents(catCheckBox);
                    txt = SpriteMorph.prototype.categoryText(category);
                    txt.setPosition(new Point(x + catCheckBox.fullBounds().width() + padding, y));
                    txt.refresh = function() {};
                    palette.addContents(txt);
                    y += catCheckBox.fullBounds().height()
                    y += padding
                }
                lastCat = category;
                block = definition.templateInstance();
                block.isToggleLabel = true; // mark as unrefreshable label
                checkBox = new ToggleMorph(
                    'checkbox',
                    this,
                    () => {
                        var idx = this.blocks.indexOf(definition);
                        if (idx > -1) {
                            this.blocks.splice(idx, 1);
                        } else {
                            this.blocks.push(definition);
                        }
                    },
                    null,
                    () => contains(this.blocks, definition),
                    null,
                    null,
                    this.target ? block : block.fullImage()
                );
                checkBox.setPosition(new Point(
                    x,
                    y + (checkBox.top() - checkBox.toggleElement.top())
                ));
                palette.addContents(checkBox);
                y += checkBox.fullBounds().height() + padding;
            }
        });
    });

    palette.scrollX(padding);
    palette.scrollY(padding);
    this.addBody(palette);

    this.addButton('ok', 'OK');
    this.addButton('cancel', 'Cancel');

    this.setExtent(new Point(220, 300));
    this.fixLayout();
};

BlockExportDialogMorph.prototype.popUp = function (wrrld) {
    var world = wrrld || this.target.world();
    if (world) {
        BlockExportDialogMorph.uber.popUp.call(this, world);
        this.handle = new HandleMorph(
            this,
            200,
            220,
            this.corner,
            this.corner
        );
    }
};

// BlockExportDialogMorph menu

BlockExportDialogMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this, 'select');
    menu.addItem('all', 'selectAll');
    menu.addItem('none', 'selectNone');
    return menu;
};

BlockExportDialogMorph.prototype.selectAll = function () {
    this.body.contents.children.forEach(checkBox => {
        if (!checkBox.state) {
            checkBox.trigger();
        }
    });
};

BlockExportDialogMorph.prototype.selectNone = function () {
    this.blocks = [];
    this.body.contents.children.forEach(checkBox => {
        checkBox.refresh();
    });
};

// BlockExportDialogMorph ops

BlockExportDialogMorph.prototype.exportBlocks = function () {
    var ide = this.world().children[0];

    if (this.blocks.length) {
        ide.saveXMLAs(
            ide.blocksLibraryXML(this.blocks, true), // as file
            (ide.getProjectName() || localize('untitled')) +
                ' ' +
                localize('blocks'
            )
        );
    } else {
        new DialogBoxMorph().inform(
            'Export blocks',
            'no blocks were selected',
            this.world()
        );
    }
};

// BlockExportDialogMorph layout

BlockExportDialogMorph.prototype.fixLayout
    = BlockEditorMorph.prototype.fixLayout;

// BlockImportDialogMorph ////////////////////////////////////////////////////

// BlockImportDialogMorph inherits from DialogBoxMorph
// and pseudo-inherits from BlockExportDialogMorph:

BlockImportDialogMorph.prototype = new DialogBoxMorph;
BlockImportDialogMorph.prototype.constructor = BlockImportDialogMorph;
BlockImportDialogMorph.uber = DialogBoxMorph.prototype;

// BlockImportDialogMorph constants:

BlockImportDialogMorph.prototype.key = 'blockImport';

// BlockImportDialogMorph instance creation:

function BlockImportDialogMorph(blocks, target, name) {
    this.init(blocks, target, name);
};

BlockImportDialogMorph.prototype.init = function (blocks, target, name) {
    // additional properties:
    this.blocks = blocks.slice(0);
    this.handle = null;

    // initialize inherited properties:
    BlockExportDialogMorph.uber.init.call(
        this,
        target,
        () => this.importBlocks(name),
        null // environment
    );

    // override inherited properites:
    this.labelString = localize('Import blocks')
        + (name ? ': ' : '')
        + name || '';
    this.createLabel();

    // build contents
    this.buildContents();
};

BlockImportDialogMorph.prototype.buildContents
    = BlockExportDialogMorph.prototype.buildContents;

BlockImportDialogMorph.prototype.popUp
    = BlockExportDialogMorph.prototype.popUp;

// BlockImportDialogMorph menu

BlockImportDialogMorph.prototype.userMenu
    = BlockExportDialogMorph.prototype.userMenu;

BlockImportDialogMorph.prototype.selectAll
    = BlockExportDialogMorph.prototype.selectAll;

BlockImportDialogMorph.prototype.selectNone
    = BlockExportDialogMorph.prototype.selectNone;

// BlockImportDialogMorph ops

BlockImportDialogMorph.prototype.importBlocks = function (name) {
    var ide = this.target.parentThatIsA(IDE_Morph);
    if (!ide) {return; }
    if (this.blocks.length > 0) {
        this.blocks.forEach(def => {
            if (def.isGlobal) {
                def.receiver = ide.stage;
                ide.stage.globalBlocks.push(def);
                ide.stage.replaceDoubleDefinitionsFor(def);
            } else {
                def.receiver = ide.currentSprite;
                ide.currentSprite.customBlocks.push(def);
                ide.currentSprite.replaceDoubleDefinitionsFor(def);
            }
        });
        ide.flushPaletteCache();
        ide.categories.refreshEmpty();
        ide.refreshPalette();
        ide.showMessage(
            'Imported Blocks Module' + (name ? ': ' + name : '') + '.',
            2
        );
    } else {
        new DialogBoxMorph().inform(
            'Import blocks',
            'no blocks were selected',
            this.world()
        );
    }
};

// BlockImportDialogMorph layout

BlockImportDialogMorph.prototype.fixLayout
    = BlockEditorMorph.prototype.fixLayout;

// BlockRemovalDialogMorph ///////////////////////////////////////////////////

// BlockRemovalDialogMorph inherits from DialogBoxMorph
// and pseudo-inherits from BlockExportDialogMorph:

BlockRemovalDialogMorph.prototype = new DialogBoxMorph;
BlockRemovalDialogMorph.prototype.constructor = BlockImportDialogMorph;
BlockRemovalDialogMorph.uber = DialogBoxMorph.prototype;

// BlockRemovalDialogMorph constants:

BlockRemovalDialogMorph.prototype.key = 'blockRemove';

// BlockRemovalDialogMorph instance creation:

function BlockRemovalDialogMorph(blocks, target) {
    this.init(blocks, target);
};

BlockRemovalDialogMorph.prototype.init = function (blocks, target) {
    // additional properties:
    this.blocks = blocks.slice(0);
    this.handle = null;

    // initialize inherited properties:
    BlockExportDialogMorph.uber.init.call(
        this,
        target,
        () => this.removeBlocks(),
        null // environment
    );

    // override inherited properites:
    this.labelString = localize('Remove unused blocks')
        + (name ? ': ' : '')
        + name || '';
    this.createLabel();

    // build contents
    this.buildContents();
};

BlockRemovalDialogMorph.prototype.buildContents
    = BlockExportDialogMorph.prototype.buildContents;

BlockRemovalDialogMorph.prototype.popUp
    = BlockExportDialogMorph.prototype.popUp;

// BlockRemovalDialogMorph menu

BlockRemovalDialogMorph.prototype.userMenu
    = BlockExportDialogMorph.prototype.userMenu;

BlockRemovalDialogMorph.prototype.selectAll
    = BlockExportDialogMorph.prototype.selectAll;

BlockRemovalDialogMorph.prototype.selectNone
    = BlockExportDialogMorph.prototype.selectNone;

// BlockRemovalDialogMorph ops

BlockRemovalDialogMorph.prototype.removeBlocks = function () {
    var ide = this.target;
    if (!ide) {return; }
    if (this.blocks.length > 0) {
        this.blocks.forEach(def => {
            var idx = ide.stage.globalBlocks.indexOf(def);
            if (idx !== -1) {
                ide.stage.globalBlocks.splice(idx, 1);
            }
        });
        ide.flushPaletteCache();
        ide.categories.refreshEmpty();
        ide.refreshPalette();
        ide.showMessage(
            this.blocks.length + ' ' + localize('unused block(s) removed'),
            2
        );
    } else {
        new DialogBoxMorph().inform(
            'Remove unused blocks',
            'no blocks were selected',
            this.world()
        );
    }
};

// BlockRemovalDialogMorph layout

BlockRemovalDialogMorph.prototype.fixLayout
    = BlockEditorMorph.prototype.fixLayout;

// BlockVisibilityDialogMorph //////////////////////////////////////////////////

// BlockVisibilityDialogMorph inherits from DialogBoxMorph
// and pseudo-inherits from BlockExportDialogMorph:

BlockVisibilityDialogMorph.prototype = new DialogBoxMorph;
BlockVisibilityDialogMorph.prototype.constructor = BlockVisibilityDialogMorph;
BlockVisibilityDialogMorph.uber = DialogBoxMorph.prototype;

// BlockVisibilityDialogMorph constants:

BlockVisibilityDialogMorph.prototype.key = 'blockVisibility';

// BlockVisibilityDialogMorph instance creation:

function BlockVisibilityDialogMorph(target) {
    this.init(target);
};

BlockVisibilityDialogMorph.prototype.init = function (target) {
    // additional properties:
    this.blocks = target.allPaletteBlocks();
    this.selection = this.blocks.filter(each => target.isHidingBlock(each));
    this.handle = null;

    // initialize inherited properties:
    BlockVisibilityDialogMorph.uber.init.call(
        this,
        target,
        () => this.hideBlocks(),
        null // environment
    );

    // override inherited properites:
    this.labelString = localize('Hide blocks in palette')
        + (name ? ': ' : '')
        + name || '';
    this.createLabel();

    // build contents
    this.buildContents();
};

BlockVisibilityDialogMorph.prototype.buildContents = function () {
    var palette, x, y, checkBox, lastCat,
        padding = 4;

    // create palette
    palette = new ScrollFrameMorph(
        null,
        null,
        SpriteMorph.prototype.sliderColor
    );
    palette.color = SpriteMorph.prototype.paletteColor;
    palette.padding = padding;
    palette.isDraggable = false;
    palette.acceptsDrops = false;
    palette.contents.acceptsDrops = false;

    // populate palette
    x = palette.left() + padding;
    y = palette.top() + padding;

    this.blocks.forEach(block => {
        if (lastCat && (block.category !== lastCat)) {
            y += padding;
        };  lastCat = block.category;

        block.isToggleLabel = true; // mark block as unrefreshable toggle label
        checkBox = new ToggleMorph(
            'checkbox',
            this,
            () => {
                var idx = this.selection.indexOf(block);
                if (idx > -1) {
                    this.selection.splice(idx, 1);
                } else {
                    this.selection.push(block);
                }
            },
            null,
            () => contains(this.selection, block),
            null,
            null,
            block // allow block to be dragged off from templates
        );
        checkBox.setPosition(new Point(
            x,
            y + (checkBox.top() - checkBox.toggleElement.top())
        ));
        palette.addContents(checkBox);
        y += checkBox.fullBounds().height() + padding;
    });

    palette.scrollX(padding);
    palette.scrollY(padding);
    this.addBody(palette);

    this.addButton('ok', 'OK');
    this.addButton('cancel', 'Cancel');

    this.setExtent(new Point(220, 300));
    this.fixLayout();
};

BlockVisibilityDialogMorph.prototype.popUp
    = BlockExportDialogMorph.prototype.popUp;

// BlockVisibilityDialogMorph menu

BlockVisibilityDialogMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this, 'select');
    menu.addItem('all', 'selectAll');
    menu.addItem('none', 'selectNone');
    menu.addLine();
    menu.addItem('unused', 'selectUnused');
    return menu;
};


BlockVisibilityDialogMorph.prototype.selectAll = function () {
    this.selection = this.blocks.slice(0);
    this.body.contents.children.forEach(checkBox => {
        checkBox.refresh();
    });
};

BlockVisibilityDialogMorph.prototype.selectNone = function () {
    this.selection = [];
    this.body.contents.children.forEach(checkBox => {
        checkBox.refresh();
    });
};

BlockVisibilityDialogMorph.prototype.selectUnused = function () {
    var used = this.target.scripts.allChildren().filter(
            m => m instanceof BlockMorph),
        uPrim = [],
        uCust = [],
        uVars = [];

    used.forEach(b => {
        if (b.isCustomBlock) {
            uCust.push(b.isGlobal ? b.definition
                : this.target.getMethod(b.semanticSpec));
        } else if (b.selector === 'reportGetVar') {
            uVars.push(b.blockSpec);
        } else {
            uPrim.push(b.selector);
        }
    });

    this.selection = this.blocks.filter(b => {
        if (b.isCustomBlock) {
            return !contains(
                uCust,
                b.isGlobal ? b.definition
                    : this.target.getMethod(b.semanticSpec)
                );
        } else if (b.selector === 'reportGetVar') {
            return !contains(uVars, b.blockSpec);
        } else {
            return !contains(uPrim, b.selector);
        }
    });

    this.body.contents.children.forEach(checkBox => {
        checkBox.refresh();
    });
};

// BlockVisibilityDialogMorph ops

BlockVisibilityDialogMorph.prototype.hideBlocks = function () {
    var ide = this.target.parentThatIsA(IDE_Morph);
    this.blocks.forEach(block => this.target.changeBlockVisibility(
        block,
        contains(this.selection, block),
        true // quick - without palette update
    ));
    if (this.selection.length === 0) {
        StageMorph.prototype.hiddenPrimitives = [];
    }
    ide.flushBlocksCache();
    ide.refreshPalette();
    ide.categories.refreshEmpty();
    ide.recordUnsavedChanges();
};

BlockVisibilityDialogMorph.prototype.fixLayout = BlockEditorMorph.prototype.fixLayout;
