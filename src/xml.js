/*

    xml.js

    a simple XML DOM, encoder and parser for morphic.js

    written by Jens Mönig
    jens@moenig.org

    Copyright (C) 2020 by Jens Mönig

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
    needs morphic.js


    hierarchy
    ---------
    the following tree lists all constructors hierarchically,
    indentation indicating inheritance. Refer to this list to get a
    contextual overview:

        Node*
            XML_Element
        ReadStream

    * defined in morphic.js


    toc
    ---
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

        ReadStream
        XML_Element


    credits
    -------
    Nathan Dinsmore contributed to the design and implemented a first
    working version of a complete XMLSerializer. I have taken much of the
    overall design and many of the functions and methods in this file from
    Nathan's fine original prototype. Recently Nathan has once again
    worked his magic on the parser and optimized it by an order of
    magnitude.

*/

// Declarations

var ReadStream, XML_Element;

// ReadStream ////////////////////////////////////////////////////////////

// I am a sequential reading interface to an Array or String

// ReadStream instance creation:

function ReadStream(arrayOrString) {
this.contents = arrayOrString || '';
this.index = 0;};

// ReadStream constants:

ReadStream.prototype.nonSpace = /\S|$/g;
ReadStream.prototype.nonWord = /[\s\>\/\=]|$/g;

// ReadStream accessing:

ReadStream.prototype.next = function (count) {
    var element, start;
    if (count === undefined) {
        element = this.contents[this.index];
        this.index += 1;
        return element;
    };  start = this.index;
    this.index += count;
    return this.contents.slice(start, this.index);
};

ReadStream.prototype.peek = function () {
    return this.contents[this.index];
};

ReadStream.prototype.skip = function (count) {
    this.index += count || 1;
};

ReadStream.prototype.atEnd = function () {
    return this.index > (this.contents.length - 1);
};

// ReadStream accessing String contents:

ReadStream.prototype.upTo = function (str) {
    var i = this.contents.indexOf(str, this.index);
    return i === -1 ? '' : this.contents.slice(this.index, this.index = i);
};

ReadStream.prototype.peekUpTo = function (str) {
    var i = this.contents.indexOf(str, this.index);
    return i === -1 ? '' : this.contents.slice(this.index, i);
};

ReadStream.prototype.skipSpace = function () {
    this.nonSpace.lastIndex = this.index;
    var result = this.nonSpace.exec(this.contents);
    if (result) this.index = result.index;
};

ReadStream.prototype.word = function () {
    this.nonWord.lastIndex = this.index;
    var result = this.nonWord.exec(this.contents);
    return result ? this.contents.slice(this.index, this.index = result.index) : '';
};

// XML_Element ///////////////////////////////////////////////////////////
/*
    I am a DOM-Node which can encode itself to as well as parse itself
    from a well-formed XML string. Note that there is no separate parser
    object, all the parsing can be done in a single object.
*/

// XML_Element inherits from Node:

XML_Element.prototype = Object.create(Node.prototype);
XML_Element.prototype.constructor = XML_Element;
XML_Element.uber = Node.prototype;

// XML_Element preferences settings:

XML_Element.prototype.indentation = '  ';

// XML_Element instance creation:

function XML_Element(tag, contents, parent) {
    this.init(tag, contents, parent);
};

XML_Element.prototype.init = function (tag, contents, parent) {
    // additional properties:
    this.tag = tag || 'unnamed';
    this.attributes = {};
    this.contents = contents || '';

    // initialize inherited properties:
    XML_Element.uber.init.call(this);

    // override inherited properties
    if (parent) parent.addChild(this);
};

// XML_Element DOM navigation: (aside from what's inherited from Node)

XML_Element.prototype.require = function (tagName, fallback) {
    // answer the first direct child with the specified tagName.
    // if it doesn't exist execute the fallback function or return the
    // fallback value, otherwise throw an error
    var child = this.childNamed(tagName);
    if (!child) {
        if (fallback instanceof Function) {
            return fallback();
        }
        if (!isNil(fallback)) {
            return fallback;
        };  throw new Error('Missing required element <' + tagName + '>!');
    };  return child;
};

XML_Element.prototype.childNamed = function (tagName) {
    // answer the first direct child with the specified tagName, or null
    return detect(
        this.children,
        child => child.tag === tagName
    );
};

XML_Element.prototype.childrenNamed = function (tagName) {
    // answer all direct children with the specified tagName
    return this.children.filter(child => child.tag === tagName);
};

XML_Element.prototype.parentNamed = function (tagName) {
    // including myself
    if (this.tag === tagName) {
        return this;
    };  if (!this.parent) {
        return null;
    };  return this.parent.parentNamed(tagName);
};

// XML_Element output:

XML_Element.prototype.toString = function (isFormatted, indentationLevel) {
    var result = '',
        indent = '',
        level = indentationLevel || 0,
        key,
        i;

    // spaces for indentation, if any
    if (isFormatted) {
        for (i = 0; i < level; i += 1) {
            indent += this.indentation;
        };  result += indent;
    };

    // opening tag
    result += ('<' + this.tag);

    // attributes, if any
    for (key in this.attributes) {
        if (Object.prototype.hasOwnProperty.call(this.attributes, key)
                && this.attributes[key]) {
            result += ' ' + key + '="' + this.escape(this.attributes[key]) + '"';
        };
    };

    // contents, subnodes, and closing tag
    if (!this.contents.length && !this.children.length) {
        result += '/>';
    } else {
        result += '>';
        result += this.escape(this.contents);
        this.children.forEach(element => {
            if (isFormatted) {
                result += '\n';
            };  result += element.toString(isFormatted, level + 1);
        }); if (isFormatted && this.children.length) {
            result += ('\n' + indent);
        };  result += '</' + this.tag + '>';
    };  return result;
};

XML_Element.prototype.escape = function (string, ignoreQuotes) {
    var src = isNil(string) ? '' : string.toString(),
        result = '', i, ch;
    for (i = 0; i < src.length; i += 1) {
        ch = src[i];
        switch (ch) {
        case '\'':
            result += '&apos;';
            break;
        case '\"':
            result += ignoreQuotes ? ch : '&quot;';
            break;
        case '<':
            result += '&lt;';
            break;
        case '>':
            result += '&gt;';
            break;
        case '&':
            result += '&amp;';
            break;
        case '\n': // escape CR b/c of export to URL feature
            result += '&#xD;';
            break;
        case '~': // escape tilde b/c it's overloaded in serializer.store()
            result += '&#126;';
            break;
        default:
            result += ch;
        };
    };  return result;
};

XML_Element.prototype.unescape = function (string) {
    return string.replace(/&(amp|apos|quot|lt|gt|#xD|#126);/g, (_, name) => {
        switch (name) {
            case 'amp': return '&';
            case 'apos': return '\'';
            case 'quot': return '"';
            case 'lt': return '<';
            case 'gt': return '>';
            case '#xD': return '\n';
            case '#126': return '~';
            default: console.warn('unreachable');
        }
    });
};

// XML_Element parsing:

XML_Element.prototype.parseString = function (string) {
    var stream = new ReadStream(string);
    stream.upTo('<');
    stream.skip();
    this.parseStream(stream);
};

XML_Element.prototype.parseStream = function (stream) {
    var key, value, ch, child;

    // tag:
    this.tag = stream.word();
    stream.skipSpace();

    // attributes:
    ch = stream.peek();
    while (ch !== '>' && ch !== '/') {
        key = stream.word();
        stream.skipSpace();
        if (stream.next() !== '=') {
            throw new Error('Expected "=" after attribute name');
        };  stream.skipSpace();
        ch = stream.next();
        if (ch !== '"' && ch !== "'") {
            throw new Error('Expected single- or double-quoted attribute value');
        };  value = stream.upTo(ch);
        stream.skip(1);
        stream.skipSpace();
        this.attributes[key] = this.unescape(value);
        ch = stream.peek();
    };

    // empty tag:
    if (ch === '/') {
        stream.skip();
        if (stream.next() !== '>') {
            throw new Error('Expected ">" after "/" in empty tag');
        };  return;
    };  if (stream.next() !== '>') {
        throw new Error('Expected ">" after tag name and attributes');
    };

    // contents and children
    while (!stream.atEnd()) {
        ch = stream.next();
        if (ch === '<') {
            if (stream.peek() === '/') { // closing tag
                stream.skip();
                if (stream.word() !== this.tag) {
                    throw new Error('Expected to close ' + this.tag);
                };  stream.upTo('>');
                stream.skip();
                this.contents = this.unescape(this.contents);
                return;
            };  child = new XML_Element(null, null, this);
            child.parseStream(stream);
        } else {
            this.contents += ch;
        };
    };
};

/*
 * DOMParser JS extension
 * 2012-09-04
 *
 * By Eli Grey, https://eligrey.com
 * Public domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*! @source https://gist.github.com/1129031 */
/*global document, DOMParser*/

(function(DOMParser) {
 "use strict";

 var proto = DOMParser.prototype,
 nativeParse = proto.parseFromString;

 // Firefox/Opera/IE throw errors on unsupported types
 try {
  // WebKit returns null on unsupported types
  if ((new DOMParser).parseFromString("", "text/html")) {
   // text/html parsing is natively supported
   return;
  };
 } catch (ex) {console.error(ex);};

proto.parseFromString = function(markup, type) {
  if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
   var doc = document.implementation.createHTMLDocument("");
         if (markup.toLowerCase().indexOf('<!doctype') > -1) {
           doc.documentElement.innerHTML = markup;
         } else {
           doc.body.innerHTML = markup;
         };
   return doc;
  } else {
   return nativeParse.apply(this, arguments);
  };
 };
}(DOMParser));

/**
* Object assign is required, so ensure that browsers know how to execute this method
*
* @method Object.assign
* @returns {Function}
*/
if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
};

/**
* Object to convert XML into a structured JSON object
*
* @method xmlToJson
* @returns [object Object]
*/
var xmlToJson = (function () {
  var self = this;

	/**
	* Adds an object value to a parent object
	*
	* @method addToParent
	* @param {Object} parent
	* @param {String} nodeName
	* @param {Mixed} obj
	* @returns none
	*/
  self.addToParent = function (parent, nodeName, obj) {
    // If this is the first or only instance of the node name, assign it as
    // an object on the parent.
    if (!parent[nodeName]) {
      parent[nodeName] = obj;
    }
    // Else the parent knows about other nodes of the same name
    else {
      // If the parent has a property with the node name, but it is not an array,
      // store the contents of that property, convert the property to an array, and
      // assign what was formerly an object on the parent to the first member of the
      // array
      if (!Array.isArray(parent[nodeName])) {
        var tmp = parent[nodeName];
        parent[nodeName] = [];
        parent[nodeName].push(tmp);
      }

      // Push the current object to the collection
      parent[nodeName].push(obj);
    }
  };

  self.convertXMLStringToDoc = function (str) {
    var xmlDoc = null;

    if (str && typeof str === 'string') {
      // Create a DOMParser
      var parser = new DOMParser;

      // Use it to turn your xmlString into an XMLDocument
      xmlDoc = parser.parseFromString(str, 'application/xml');
    }

    return xmlDoc;
  }

	/**
	* Validates if an data is an XMLDocument
	*
	* @method isXML
	* @param {Mixed} data
	* @returns {Boolean}
	*/
  self.isXML = function (data) {
    var documentElement = (data ? data.ownerDocument || data : 0).documentElement;

    return documentElement ? documentElement.nodeName.toLowerCase() !== 'html' : false;
  };

	/**
	* Reads through a node's attributes and assigns the values to a new object
	*
	* @method parseAttributes
	* @param {XMLNode} node
	* @returns {Object}
	*/
  self.parseAttributes = function (node) {
    var attributes = node.attributes,
      obj = {};

    // If the node has attributes, assign the new object properties
    // corresponding to each attribute
    if (node.hasAttributes()) {
      for (var i = 0; i < attributes.length; i++) {
        obj[attributes[i].name] = self.parseValue(attributes[i].value);
      }
    }

    // return the new object
    return obj;
  };

	/**
	* Rips through child nodes and parses them
	*
	* @method parseChildren
	* @param {Object} parent
	* @param {XMLNodeMap} childNodes
	* @returns none
	*/
  self.parseChildren = function (parent, childNodes) {
    // If there are child nodes...
    if (childNodes.length > 0) {
      // Loop over all the child nodes
      for (var i = 0; i < childNodes.length; i++) {
        // If the child node is a XMLNode, parse the node
        if (childNodes[i].nodeType == 1) {
          self.parseNode(parent, childNodes[i]);
        }
      }
    }
  };

	/**
	* Converts a node into an object with properties
	*
	* @method parseNode
	* @param {Object} parent
	* @param {XMLNode} node
	* @returns {Object}
	*/
  self.parseNode = function (parent, node) {
    var nodeName = node.nodeName,
      obj = Object.assign({}, self.parseAttributes(node)),
      tmp = null;

    // If there is only one text child node, there is no need to process the children
    if (node.childNodes.length == 1 && node.childNodes[0].nodeType == 3) {
      // If the node has attributes, then the object will already have properties.
      // Add a new property 'text' with the value of the text content
      if (node.hasAttributes()) {
        obj['text'] = self.parseValue(node.childNodes[0].nodeValue);
      }
      // If there are no attributes, then the parent[nodeName] property value is
      // simply the interpreted textual content
      else {
        obj = self.parseValue(node.childNodes[0].nodeValue);
      }
    }
    // Otherwise, there are child XMLNode elements, so process them
    else {
      self.parseChildren(obj, node.childNodes);
    }

    // Once the object has been processed, add it to the parent
    self.addToParent(parent, nodeName, obj)

    // Return the parent
    return parent;
  };

	/**
	* Interprets a value and converts it to Boolean, Number or String based on content
	*
	* @method parseValue
	* @param {Mixed} val
	* @returns {Mixed}
	*/
  this.parseValue = function (val) {
    // Create a numeric value from the passed parameter
    var num = ((contains(['', '\n', null], val)) ? 0 : asANum(val.trim()));

    // If the value is 'true' or 'false', parse it as a Boolean and return it
    if (contains(['true', 'false'], val.toLowerCase())) {
      return (val.toLowerCase() === 'true');
    };

    // If the num parsed to a Number, return the numeric value
    // Else if the valuse passed has no length (an attribute without value) return null,
    // Else return the param as is
    return ((isNaN(num)) ? val.trim() : ((val.trim() === '') ? {} : (
    Process.prototype.reportIsA(val, ['number']) ? num : val.trim())));
  };

  // Expose the API
  return {
    parse: function (xml) {
      if (xml && typeof xml === 'string') {
        xml = self.convertXMLStringToDoc(xml);
      }
      return (xml && self.isXML(xml)) ? self.parseNode({}, xml.firstChild) : null;
    }
  }
})();