/**
 * 运行于webview的React by 司徒正美 Copyright 2019-07-05T02
 * IE9+
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('clipboard'), require('axios'), require('qs'), require('@shared/utils/handleCallback'), require('mobile-detect'), require('socket.io-client')) :
    typeof define === 'function' && define.amd ? define(['clipboard', 'axios', 'qs', '@shared/utils/handleCallback', 'mobile-detect', 'socket.io-client'], factory) :
    (global.React = factory(global.Clipboard,global.axios,global.qs,global.handleCallback,global.MobileDetect,global.io));
}(this, (function (Clipboard,axios,qs,handleCallback,MobileDetect,io) {
    Clipboard = Clipboard && Clipboard.hasOwnProperty('default') ? Clipboard['default'] : Clipboard;
    axios = axios && axios.hasOwnProperty('default') ? axios['default'] : axios;
    qs = qs && qs.hasOwnProperty('default') ? qs['default'] : qs;
    MobileDetect = MobileDetect && MobileDetect.hasOwnProperty('default') ? MobileDetect['default'] : MobileDetect;
    io = io && io.hasOwnProperty('default') ? io['default'] : io;

    var arrayPush = Array.prototype.push;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var gSBU = 'getSnapshotBeforeUpdate';
    var gDSFP = 'getDerivedStateFromProps';
    var hasSymbol = typeof Symbol === 'function' && Symbol['for'];
    var effects = [];
    var topFibers = [];
    var topNodes = [];
    var emptyObject = {};
    var REACT_ELEMENT_TYPE = hasSymbol ? Symbol['for']('react.element') : 0xeac7;
    function noop() {}
    function Fragment(props) {
        return props.children;
    }
    function returnFalse() {
        return false;
    }
    function returnTrue() {
        return true;
    }
    function resetStack(info) {
        keepLast(info.containerStack);
        keepLast(info.contextStack);
    }
    function keepLast(list) {
        var n = list.length;
        list.splice(0, n - 1);
    }
    function get(key) {
        return key._reactInternalFiber;
    }
    var __type = Object.prototype.toString;
    var fakeWindow = {};
    function getWindow() {
        try {
            if (window) {
                return window;
            }
        } catch (e) {        }
        try {
            if (global) {
                return global;
            }
        } catch (e) {        }
        return fakeWindow;
    }
    function isMounted(instance) {
        var fiber = get(instance);
        return !!(fiber && fiber.hasMounted);
    }
    function toWarnDev(msg, deprecated) {
        msg = deprecated ? msg + ' is deprecated' : msg;
        var process = getWindow().process;
        if (process && process.env.NODE_ENV === 'development') {
            throw msg;
        }
    }
    function extend(obj, props) {
        for (var i in props) {
            if (hasOwnProperty.call(props, i)) {
                obj[i] = props[i];
            }
        }
        return obj;
    }
    function inherit(SubClass, SupClass) {
        function Bridge() {}
        var orig = SubClass.prototype;
        Bridge.prototype = SupClass.prototype;
        var fn = SubClass.prototype = new Bridge();
        extend(fn, orig);
        fn.constructor = SubClass;
        return fn;
    }
    try {
        var supportEval = Function('a', 'return a + 1')(2) == 3;
    } catch (e) {}
    var rname = /function\s+(\w+)/;
    function miniCreateClass(ctor, superClass, methods, statics) {
        var className = ctor.name || (ctor.toString().match(rname) || ['', 'Anonymous'])[1];
        var Ctor = supportEval ? Function('superClass', 'ctor', 'return function ' + className + ' (props, context) {\n            superClass.apply(this, arguments); \n            ctor.apply(this, arguments);\n      }')(superClass, ctor) : function ReactInstance() {
            superClass.apply(this, arguments);
            ctor.apply(this, arguments);
        };
        Ctor.displayName = className;
        var proto = inherit(Ctor, superClass);
        extend(proto, methods);
        extend(Ctor, superClass);
        if (statics) {
            extend(Ctor, statics);
        }
        return Ctor;
    }
    var lowerCache = {};
    function toLowerCase(s) {
        return lowerCache[s] || (lowerCache[s] = s.toLowerCase());
    }
    function isFn(obj) {
        return __type.call(obj) === '[object Function]';
    }
    var rword = /[^, ]+/g;
    function oneObject(array, val) {
        if (array + '' === array) {
            array = array.match(rword) || [];
        }
        var result = {},
        value = val !== void 666 ? val : 1;
        for (var i = 0, n = array.length; i < n; i++) {
            result[array[i]] = value;
        }
        return result;
    }
    var rcamelize = /[-_][^-_]/g;
    function camelize(target) {
        if (!target || target.indexOf('-') < 0 && target.indexOf('_') < 0) {
            return target;
        }
        var str = target.replace(rcamelize, function (match) {
            return match.charAt(1).toUpperCase();
        });
        return firstLetterLower(str);
    }
    function firstLetterLower(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }
    var numberMap = {
        '[object Boolean]': 2,
        '[object Number]': 3,
        '[object String]': 4,
        '[object Function]': 5,
        '[object Symbol]': 6,
        '[object Array]': 7
    };
    function typeNumber(data) {
        if (data === null) {
            return 1;
        }
        if (data === void 666) {
            return 0;
        }
        var a = numberMap[__type.call(data)];
        return a || 8;
    }

    function createRenderer(methods) {
        return extend(Renderer, methods);
    }
    var middlewares = [];
    var Renderer = {
        controlledCbs: [],
        mountOrder: 1,
        macrotasks: [],
        boundaries: [],
        onBeforeRender: noop,
        onAfterRender: noop,
        onDispose: noop,
        middleware: function middleware(obj) {
            if (obj.begin && obj.end) {
                middlewares.push(obj);
            }
        },
        updateControlled: function updateControlled() {},
        fireMiddlewares: function fireMiddlewares(begin) {
            var index = begin ? middlewares.length - 1 : 0,
                delta = begin ? -1 : 1,
                method = begin ? "begin" : "end",
                obj = void 0;
            while (obj = middlewares[index]) {
                obj[method]();
                index += delta;
            }
        },
        currentOwner: null
    };

    var fakeObject = {
        enqueueSetState: returnFalse,
        isMounted: returnFalse
    };
    function Component(props, context) {
        Renderer.currentOwner = this;
        this.context = context;
        this.props = props;
        this.refs = {};
        this.updater = fakeObject;
        this.state = null;
    }
    Component.prototype = {
        constructor: Component,
        replaceState: function replaceState() {
            toWarnDev("replaceState", true);
        },
        isReactComponent: returnTrue,
        isMounted: function isMounted$$1() {
            toWarnDev("isMounted", true);
            return this.updater.isMounted(this);
        },
        setState: function setState(state, cb) {
            this.updater.enqueueSetState(get(this), state, cb);
        },
        forceUpdate: function forceUpdate(cb) {
            this.updater.enqueueSetState(get(this), true, cb);
        },
        render: function render() {
            throw "must implement render";
        }
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
    var RESERVED_PROPS = {
        key: true,
        ref: true,
        __self: true,
        __source: true
    };
    function makeProps(type, config, props, children, len) {
        var defaultProps = void 0,
            propName = void 0;
        for (propName in config) {
            if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
            }
        }
        if (type && type.defaultProps) {
            defaultProps = type.defaultProps;
            for (propName in defaultProps) {
                if (props[propName] === undefined) {
                    props[propName] = defaultProps[propName];
                }
            }
        }
        if (len === 1) {
            props.children = children[0];
        } else if (len > 1) {
            props.children = children;
        }
        return props;
    }
    function hasValidRef(config) {
        return config.ref !== undefined;
    }
    function hasValidKey(config) {
        return config.key !== undefined;
    }
    function createElement(type, config) {
        for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            children[_key - 2] = arguments[_key];
        }
        var props = {},
            tag = 5,
            key = null,
            ref = null,
            argsLen = children.length;
        if (type && type.call) {
            tag = type.prototype && type.prototype.render ? 2 : 1;
        } else if (type + '' !== type) {
            toWarnDev('React.createElement: type is invalid.');
        }
        if (config != null) {
            if (hasValidRef(config)) {
                ref = config.ref;
            }
            if (hasValidKey(config)) {
                key = '' + config.key;
            }
        }
        props = makeProps(type, config || {}, props, children, argsLen);
        return ReactElement(type, tag, props, key, ref, Renderer.currentOwner);
    }
    function createFactory(type) {
        var factory = createElement.bind(null, type);
        factory.type = type;
        return factory;
    }
    function ReactElement(type, tag, props, key, ref, owner) {
        var ret = {
            type: type,
            tag: tag,
            props: props
        };
        if (tag !== 6) {
            ret.$$typeof = REACT_ELEMENT_TYPE;
            ret.key = key || null;
            var refType = typeNumber(ref);
            if (refType === 2 || refType === 3 || refType === 4 || refType === 5 || refType === 8) {
                if (refType < 4) {
                    ref += '';
                }
                ret.ref = ref;
            } else {
                ret.ref = null;
            }
            ret._owner = owner;
        }
        return ret;
    }
    function isValidElement(vnode) {
        return !!vnode && vnode.$$typeof === REACT_ELEMENT_TYPE;
    }
    function createVText(text) {
        return ReactElement('#text', 6, text + '');
    }
    function escape(key) {
        var escapeRegex = /[=:]/g;
        var escaperLookup = {
            '=': '=0',
            ':': '=2'
        };
        var escapedString = ('' + key).replace(escapeRegex, function (match) {
            return escaperLookup[match];
        });
        return '$' + escapedString;
    }
    var lastText = void 0,
        flattenIndex = void 0,
        flattenObject = void 0;
    function flattenCb(context, child, key, childType) {
        if (child === null) {
            lastText = null;
            return;
        }
        if (childType === 3 || childType === 4) {
            if (lastText) {
                lastText.props += child;
                return;
            }
            lastText = child = createVText(child);
        } else {
            lastText = null;
        }
        if (!flattenObject[key]) {
            flattenObject[key] = child;
        } else {
            key = '.' + flattenIndex;
            flattenObject[key] = child;
        }
        flattenIndex++;
    }
    function fiberizeChildren(children, fiber) {
        flattenObject = {};
        flattenIndex = 0;
        if (children !== void 666) {
            lastText = null;
            traverseAllChildren(children, '', flattenCb);
        }
        flattenIndex = 0;
        return fiber.children = flattenObject;
    }
    function getComponentKey(component, index) {
        if ((typeof component === 'undefined' ? 'undefined' : _typeof(component)) === 'object' && component !== null && component.key != null) {
            return escape(component.key);
        }
        return index.toString(36);
    }
    var SEPARATOR = '.';
    var SUBSEPARATOR = ':';
    function traverseAllChildren(children, nameSoFar, callback, bookKeeping) {
        var childType = typeNumber(children);
        var invokeCallback = false;
        switch (childType) {
            case 0:
            case 1:
            case 2:
            case 5:
            case 6:
                children = null;
                invokeCallback = true;
                break;
            case 3:
            case 4:
                invokeCallback = true;
                break;
            case 8:
                if (children.$$typeof || children instanceof Component) {
                    invokeCallback = true;
                } else if (children.hasOwnProperty('toString')) {
                    children = children + '';
                    invokeCallback = true;
                    childType = 3;
                }
                break;
        }
        if (invokeCallback) {
            callback(bookKeeping, children,
            nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar, childType);
            return 1;
        }
        var subtreeCount = 0;
        var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;
        if (children.forEach) {
            children.forEach(function (child, i) {
                var nextName = nextNamePrefix + getComponentKey(child, i);
                subtreeCount += traverseAllChildren(child, nextName, callback, bookKeeping);
            });
            return subtreeCount;
        }
        var iteratorFn = getIteractor(children);
        if (iteratorFn) {
            var iterator = iteratorFn.call(children),
                child = void 0,
                ii = 0,
                step = void 0,
                nextName = void 0;
            while (!(step = iterator.next()).done) {
                child = step.value;
                nextName = nextNamePrefix + getComponentKey(child, ii++);
                subtreeCount += traverseAllChildren(child, nextName, callback, bookKeeping);
            }
            return subtreeCount;
        }
        throw 'children: type is invalid.';
    }
    var REAL_SYMBOL = hasSymbol && Symbol.iterator;
    var FAKE_SYMBOL = '@@iterator';
    function getIteractor(a) {
        var iteratorFn = REAL_SYMBOL && a[REAL_SYMBOL] || a[FAKE_SYMBOL];
        if (iteratorFn && iteratorFn.call) {
            return iteratorFn;
        }
    }

    var check = function check() {
        return check;
    };
    check.isRequired = check;
    var PropTypes = {
        array: check,
        bool: check,
        func: check,
        number: check,
        object: check,
        string: check,
        any: check,
        arrayOf: check,
        element: check,
        instanceOf: check,
        node: check,
        objectOf: check,
        oneOf: check,
        oneOfType: check,
        shape: check
    };

    function shallowEqual(objA, objB) {
        if (Object.is(objA, objB)) {
            return true;
        }
        if (typeNumber(objA) < 7 || typeNumber(objB) < 7) {
            return false;
        }
        var keysA = Object.keys(objA);
        var keysB = Object.keys(objB);
        if (keysA.length !== keysB.length) {
            return false;
        }
        for (var i = 0; i < keysA.length; i++) {
            if (!hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) {
                return false;
            }
        }
        return true;
    }

    var PureComponent = miniCreateClass(function PureComponent() {
        this.isPureComponent = true;
    }, Component, {
        shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
            var a = shallowEqual(this.props, nextProps);
            var b = shallowEqual(this.state, nextState);
            return !a || !b;
        }
    });

    var MAX_NUMBER = 1073741823;
    function createContext(defaultValue, calculateChangedBits) {
        if (calculateChangedBits == void 0) {
            calculateChangedBits = null;
        }
        var instance = {
            value: defaultValue,
            subscribers: []
        };
        var Provider = miniCreateClass(function Provider(props) {
            this.value = props.value;
            getContext.subscribers = this.subscribers = [];
            instance = this;
        }, Component, {
            componentWillUnmount: function componentWillUnmount() {
                this.subscribers.length = 0;
            },
            UNSAFE_componentWillReceiveProps: function UNSAFE_componentWillReceiveProps(nextProps) {
                if (this.props.value !== nextProps.value) {
                    var oldValue = this.props.value;
                    var newValue = nextProps.value;
                    var changedBits = void 0;
                    if (Object.is(oldValue, newValue)) {
                        changedBits = 0;
                    } else {
                        this.value = newValue;
                        changedBits = isFn(calculateChangedBits) ? calculateChangedBits(oldValue, newValue) : MAX_NUMBER;
                        changedBits |= 0;
                        if (changedBits !== 0) {
                            instance.subscribers.forEach(function (fiber) {
                                if (fiber.setState) {
                                    fiber.setState({ value: newValue });
                                    fiber = get(fiber);
                                }
                                Renderer.updateComponent(fiber, true);
                            });
                        }
                    }
                }
            },
            render: function render() {
                return this.props.children;
            }
        });
        var Consumer = miniCreateClass(function Consumer() {
            instance.subscribers.push(this);
            this.observedBits = 0;
            this.state = {
                value: instance.value
            };
        }, Component, {
            componentWillUnmount: function componentWillUnmount() {
                var i = instance.subscribers.indexOf(this);
                instance.subscribers.splice(i, 1);
            },
            render: function render() {
                return this.props.children(this.state.value);
            }
        });
        function getContext(fiber) {
            while (fiber.return) {
                if (fiber.type == Provider) {
                    return instance.value;
                }
                fiber = fiber.return;
            }
            return defaultValue;
        }
        getContext.subscribers = [];
        getContext.Provider = Provider;
        getContext.Consumer = Consumer;
        return getContext;
    }

    function DOMElement(type) {
        this.nodeName = type;
        this.style = {};
        this.children = [];
    }
    var NAMESPACE = {
        svg: 'http://www.w3.org/2000/svg',
        xmlns: 'http://www.w3.org/2000/xmlns/',
        xlink: 'http://www.w3.org/1999/xlink',
        xhtml: 'http://www.w3.org/1999/xhtml',
        math: 'http://www.w3.org/1998/Math/MathML'
    };
    var fn = DOMElement.prototype = {
        contains: Boolean
    };
    String('replaceChild,appendChild,removeAttributeNS,setAttributeNS,removeAttribute,setAttribute' + ',getAttribute,insertBefore,removeChild,addEventListener,removeEventListener,attachEvent' + ',detachEvent').replace(/\w+/g, function (name) {
        fn[name] = noop;
    });
    var fakeDoc = new DOMElement();
    fakeDoc.createElement = fakeDoc.createElementNS = fakeDoc.createDocumentFragment = function (type) {
        return new DOMElement(type);
    };
    fakeDoc.createTextNode = fakeDoc.createComment = Boolean;
    fakeDoc.documentElement = new DOMElement('html');
    fakeDoc.body = new DOMElement('body');
    fakeDoc.nodeName = '#document';
    fakeDoc.textContent = '';
    var win = getWindow();
    var inBrowser = !!win.alert;
    if (!inBrowser) {
        win.document = fakeDoc;
    }
    var document$1 = win.document;
    var versions = {
        88: 7,
        80: 6,
        '00': NaN,
        '08': NaN
    };
    var msie = document$1.documentMode || versions[typeNumber(document$1.all) + '' + typeNumber(win.XMLHttpRequest)];
    var modern = /NaN|undefined/.test(msie) || msie > 8;
    function contains(a, b) {
        if (b) {
            while (b = b.parentNode) {
                if (b === a) {
                    return true;
                }
            }
        }
        return false;
    }

    var rnumber = /^-?\d+(\.\d+)?$/;
    function patchStyle(dom, lastStyle, nextStyle) {
        if (lastStyle === nextStyle) {
            return;
        }
        for (var name in nextStyle) {
            var val = nextStyle[name];
            if (lastStyle[name] !== val) {
                name = cssName(name, dom);
                if (val !== 0 && !val) {
                    val = "";
                } else if (rnumber.test(val) && !cssNumber[name]) {
                    val = val + "px";
                }
                try {
                    dom.style[name] = val;
                } catch (e) {
                    console.log("dom.style[" + name + "] = " + val + "throw error");
                }
            }
        }
        for (var _name in lastStyle) {
            if (!(_name in nextStyle)) {
                _name = cssName(_name, dom);
                dom.style[_name] = "";
            }
        }
    }
    var cssNumber = oneObject("animationIterationCount,columnCount,order,flex,flexGrow,flexShrink,fillOpacity,fontWeight,lineHeight,opacity,orphans,widows,zIndex,zoom");
    var prefixes = ["", "-webkit-", "-o-", "-moz-", "-ms-"];
    var cssMap = oneObject("float", "cssFloat");
    function cssName(name, dom) {
        if (cssMap[name]) {
            return cssMap[name];
        }
        var host = dom && dom.style || {};
        for (var i = 0, n = prefixes.length; i < n; i++) {
            var camelCase = camelize(prefixes[i] + name);
            if (camelCase in host) {
                return cssMap[name] = camelCase;
            }
        }
        return null;
    }

    function getSafeValue(value) {
        switch (typeNumber(value)) {
            case 2:
            case 3:
            case 8:
            case 4:
            case 0:
                return value;
            default:
                return "";
        }
    }
    var duplexMap = {
        input: {
            init: function init(node, props) {
                var defaultValue = props.defaultValue == null ? "" : props.defaultValue;
                return node._wrapperState = {
                    initialValue: getSafeValue(props.value != null ? props.value : defaultValue)
                };
            },
            mount: function mount(node, props, state) {
                if (props.hasOwnProperty("value") || props.hasOwnProperty("defaultValue")) {
                    var stateValue = "" + state.initialValue;
                    if (node.value === "" && node.value !== stateValue) {
                        syncValue(node, "value", stateValue);
                    }
                    node.defaultValue = stateValue;
                }
                var name = node.name;
                if (name !== "") {
                    node.name = "";
                }
                node.defaultChecked = !node.defaultChecked;
                node.defaultChecked = !node.defaultChecked;
                if (name !== "") {
                    node.name = name;
                }
            },
            update: function update(node, props) {
                if (props.checked != null) {
                    syncValue(node, "checked", !!props.checked);
                }
                var isActive = node === node.ownerDocument.activeElement;
                var value = isActive ? node.value : getSafeValue(props.value);
                if (value != null) {
                    if (props.type === "number") {
                        if (value === 0 && node.value === "" ||
                        node.value != value) {
                            syncValue(node, "value", "" + value);
                        }
                    } else if (node.value !== "" + value) {
                        syncValue(node, "value", "" + value);
                    }
                }
                if (props.hasOwnProperty("value")) {
                    setDefaultValue(node, props.type, value, isActive);
                } else if (props.hasOwnProperty("defaultValue")) {
                    setDefaultValue(node, props.type, getSafeValue(props.defaultValue), isActive);
                }
                if (props.checked == null && props.defaultChecked != null) {
                    node.defaultChecked = !!props.defaultChecked;
                }
            }
        },
        select: {
            init: function init(node, props) {
                var value = props.value;
                return node._wrapperState = {
                    initialValue: value != null ? value : props.defaultValue,
                    wasMultiple: !!props.multiple
                };
            },
            mount: function mount(node, props) {
                var multiple = node.multiple = !!props.multiple;
                var value = props.value;
                if (value != null) {
                    updateOptions(node, multiple, value, false);
                } else if (props.defaultValue != null) {
                    updateOptions(node, multiple, props.defaultValue, true);
                }
            },
            update: function update(node, props) {
                node._wrapperState.initialValue = void 666;
                var wasMultiple = node._wrapperState.wasMultiple;
                var multiple = node._wrapperState.wasMultiple = !!props.multiple;
                var value = props.value;
                if (value != null) {
                    updateOptions(node, multiple, value, false);
                } else if (wasMultiple !== multiple) {
                    if (props.defaultValue != null) {
                        updateOptions(node, multiple, props.defaultValue, true);
                    } else {
                        updateOptions(node, multiple, multiple ? [] : "", false);
                    }
                }
            }
        },
        textarea: {
            init: function init(node, props) {
                var initialValue = props.value;
                if (initialValue == null) {
                    var defaultValue = props.defaultValue;
                    var children = props.children;
                    if (children != null) {
                        defaultValue = textContent(node);
                        node.innerHTML = "";
                    }
                    if (defaultValue == null) {
                        defaultValue = "";
                    }
                    initialValue = defaultValue;
                }
                return node._wrapperState = {
                    initialValue: "" + initialValue
                };
            },
            mount: function mount(node, props, state) {
                var text = textContent(node);
                var stateValue = "" + state.initialValue;
                if (text !== stateValue) {
                    syncValue(node, "value", stateValue);
                }
            },
            update: function update(node, props) {
                var value = props.value;
                if (value != null) {
                    var newValue = "" + value;
                    if (newValue !== node.value) {
                        syncValue(node, "value", newValue);
                    }
                    if (props.defaultValue == null) {
                        node.defaultValue = newValue;
                    }
                }
                if (props.defaultValue != null) {
                    node.defaultValue = props.defaultValue;
                }
            }
        },
        option: {
            init: function init() {},
            update: function update(node, props) {
                duplexMap.option.mount(node, props);
            },
            mount: function mount(node, props) {
                var elems = node.getElementsByTagName("*");
                var n = elems.length,
                    el = void 0;
                if (n) {
                    for (n = n - 1, el; el = elems[n--];) {
                        node.removeChild(el);
                    }
                }
                if ("value" in props) {
                    node.duplexValue = node.value = props.value;
                } else {
                    node.duplexValue = node.text;
                }
            }
        }
    };
    function textContent(node) {
        return node.textContent || node.innerText;
    }
    function setDefaultValue(node, type, value, isActive) {
        if (
        type !== "number" || !isActive) {
            if (value == null) {
                node.defaultValue = "" + node._wrapperState.initialValue;
            } else if (node.defaultValue !== "" + value) {
                node.defaultValue = "" + value;
            }
        }
    }
    function updateOptions(node, multiple, propValue, setDefaultSelected) {
        var options = node.options;
        if (multiple) {
            var selectedValues = propValue;
            var selectedValue = {};
            for (var i = 0; i < selectedValues.length; i++) {
                selectedValue["$" + selectedValues[i]] = true;
            }
            for (var _i = 0; _i < options.length; _i++) {
                var selected = selectedValue.hasOwnProperty("$" + options[_i].duplexValue);
                if (options[_i].selected !== selected) {
                    options[_i].selected = selected;
                }
                if (selected && setDefaultSelected) {
                    options[_i].defaultSelected = true;
                }
            }
        } else {
            var _selectedValue = "" + propValue;
            var defaultSelected = null;
            for (var _i2 = 0; _i2 < options.length; _i2++) {
                if (options[_i2].duplexValue === _selectedValue) {
                    options[_i2].selected = true;
                    if (setDefaultSelected) {
                        options[_i2].defaultSelected = true;
                    }
                    return;
                }
                if (defaultSelected === null && !options[_i2].disabled) {
                    defaultSelected = options[_i2];
                }
            }
            if (defaultSelected !== null) {
                defaultSelected.selected = true;
            }
        }
    }
    function syncValue(dom, name, value) {
        dom.__anuSetValue = true;
        dom[name] = value;
        dom.__anuSetValue = false;
    }
    function duplexAction(fiber) {
        var dom = fiber.stateNode,
            name = fiber.name,
            props = fiber.props,
            lastProps = fiber.lastProps;
        var fns = duplexMap[name];
        if (name !== "option") {
            enqueueDuplex(dom);
        }
        if (!lastProps || lastProps == emptyObject) {
            var state = fns.init(dom, props);
            fns.mount(dom, props, state);
        } else {
            fns.update(dom, props);
        }
    }
    var duplexNodes = [];
    function enqueueDuplex(dom) {
        if (duplexNodes.indexOf(dom) == -1) {
            duplexNodes.push(dom);
        }
    }
    function fireDuplex() {
        var radioMap = {};
        if (duplexNodes.length) {
            do {
                var dom = duplexNodes.shift();
                var e = dom.__events;
                var fiber = e && e.vnode;
                if (fiber && !fiber.disposed) {
                    var props = fiber.props;
                    var tag = fiber.name;
                    if (name === "select") {
                        var value = props.value;
                        if (value != null) {
                            updateOptions(dom, !!props.multiple, value, false);
                        }
                    } else {
                        duplexMap[tag].update(dom, props);
                        var _name = props.name;
                        if (props.type === "radio" && _name != null && !radioMap[_name]) {
                            radioMap[_name] = 1;
                            collectNamedCousins(dom, _name);
                        }
                    }
                }
            } while (duplexNodes.length);
        }
    }
    function collectNamedCousins(rootNode, name) {
        var queryRoot = rootNode;
        while (queryRoot.parentNode) {
            queryRoot = queryRoot.parentNode;
        }
        var group = queryRoot.getElementsByTagName("input");
        for (var i = 0; i < group.length; i++) {
            var otherNode = group[i];
            if (otherNode === rootNode || otherNode.name !== name || otherNode.type !== "radio" || otherNode.form !== rootNode.form) {
                continue;
            }
            enqueueDuplex(otherNode);
        }
    }

    var rform = /textarea|input|select|option/i;
    var globalEvents = {};
    var eventPropHooks = {};
    var eventHooks = {};
    var eventLowerCache = {
        onClick: 'click',
        onChange: 'change',
        onWheel: 'wheel'
    };
    function eventAction(dom, name, val, lastProps, fiber) {
        var events = dom.__events || (dom.__events = {});
        events.vnode = fiber;
        var refName = toLowerCase(name.slice(2));
        if (val === false) {
            delete events[refName];
        } else {
            if (!lastProps[name]) {
                var eventName = getBrowserName(name);
                var hook = eventHooks[eventName];
                if (hook) {
                    hook(dom, eventName);
                }
                addGlobalEvent(eventName);
            }
            events[refName] = val;
        }
    }
    var isTouch = 'ontouchstart' in document$1;
    function dispatchEvent(e, type, endpoint) {
        e = new SyntheticEvent(e);
        if (type) {
            e.type = type;
        }
        var bubble = e.type,
            terminal = endpoint || document$1,
            hook = eventPropHooks[e.type];
        if (hook && false === hook(e)) {
            return;
        }
        Renderer.batchedUpdates(function () {
            var paths = collectPaths(e.target, terminal, {});
            var captured = bubble + 'capture';
            triggerEventFlow(paths, captured, e);
            if (!e._stopPropagation) {
                triggerEventFlow(paths.reverse(), bubble, e);
            }
        }, e);
    }
    var nodeID = 1;
    function collectPaths(begin, end, unique) {
        var paths = [];
        var node = begin;
        while (node && node.nodeType == 1) {
            var checkChange = node;
            if (node.__events) {
                var vnode = node.__events.vnode;
                inner: while (vnode.return) {
                    if (vnode.tag === 5) {
                        node = vnode.stateNode;
                        if (node === end) {
                            return paths;
                        }
                        if (!node) {
                            break inner;
                        }
                        var uid = node.uniqueID || (node.uniqueID = ++nodeID);
                        if (node.__events && !unique[uid]) {
                            unique[uid] = 1;
                            paths.push({ node: node, events: node.__events });
                        }
                    }
                    vnode = vnode.return;
                }
            }
            if (node === checkChange) {
                node = node.parentNode;
            }
        }
        return paths;
    }
    function triggerEventFlow(paths, prop, e) {
        for (var i = paths.length; i--;) {
            var path = paths[i];
            var fn = path.events[prop];
            if (isFn(fn)) {
                e.currentTarget = path.node;
                fn.call(void 666, e);
                if (e._stopPropagation) {
                    break;
                }
            }
        }
    }
    function addGlobalEvent(name, capture) {
        if (!globalEvents[name]) {
            globalEvents[name] = true;
            addEvent(document$1, name, dispatchEvent, capture);
        }
    }
    function addEvent(el, type, fn, bool) {
        if (el.addEventListener) {
            el.addEventListener(type, fn, bool || false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + type, fn);
        }
    }
    var rcapture = /Capture$/;
    function getBrowserName(onStr) {
        var lower = eventLowerCache[onStr];
        if (lower) {
            return lower;
        }
        var camel = onStr.slice(2).replace(rcapture, '');
        lower = camel.toLowerCase();
        eventLowerCache[onStr] = lower;
        return lower;
    }
    function getRelatedTarget(e) {
        if (!e.timeStamp) {
            e.relatedTarget = e.type === 'mouseover' ? e.fromElement : e.toElement;
        }
        return e.relatedTarget;
    }
    function getTarget(e) {
        return e.target || e.srcElement;
    }
    String('load,error').replace(/\w+/g, function (name) {
        eventHooks[name] = function (dom, type) {
            var mark = '__' + type;
            if (!dom[mark]) {
                dom[mark] = true;
                addEvent(dom, type, dispatchEvent);
            }
        };
    });
    String('mouseenter,mouseleave').replace(/\w+/g, function (name) {
        eventHooks[name] = function (dom, type) {
            var mark = '__' + type;
            if (!dom[mark]) {
                dom[mark] = true;
                var mask = type === 'mouseenter' ? 'mouseover' : 'mouseout';
                addEvent(dom, mask, function (e) {
                    var t = getRelatedTarget(e);
                    if (!t || t !== dom && !contains(dom, t)) {
                        var common = getLowestCommonAncestor(dom, t);
                        dispatchEvent(e, type, common);
                    }
                });
            }
        };
    });
    var specialHandles = {};
    function createHandle(name, fn) {
        return specialHandles[name] = function (e) {
            if (fn && fn(e) === false) {
                return;
            }
            dispatchEvent(e, name);
        };
    }
    function onCompositionStart(e) {
        e.target.__onComposition = true;
    }
    function onCompositionEnd(e) {
        e.target.__onComposition = false;
    }
    var input2change = /text|password|search|url|email/i;
    if (!document$1['__input']) {
        globalEvents.input = document$1['__input'] = true;
        addEvent(document$1, 'compositionstart', onCompositionStart);
        addEvent(document$1, 'compositionend', onCompositionEnd);
        addEvent(document$1, 'input', function (e) {
            var dom = getTarget(e);
            if (input2change.test(dom.type)) {
                if (!dom.__onComposition) {
                    dispatchEvent(e, 'change');
                }
            }
            dispatchEvent(e);
        });
    }
    function getLowestCommonAncestor(instA, instB) {
        var depthA = 0;
        for (var tempA = instA; tempA; tempA = tempA.parentNode) {
            depthA++;
        }
        var depthB = 0;
        for (var tempB = instB; tempB; tempB = tempB.parentNode) {
            depthB++;
        }
        while (depthA - depthB > 0) {
            instA = instA.parentNode;
            depthA--;
        }
        while (depthB - depthA > 0) {
            instB = instB.parentNode;
            depthB--;
        }
        var depth = depthA;
        while (depth--) {
            if (instA === instB) {
                return instA;
            }
            instA = instA.parentNode;
            instB = instB.parentNode;
        }
        return null;
    }
    eventPropHooks.change = function (e) {
        enqueueDuplex(e.target);
    };
    createHandle('doubleclick');
    createHandle('scroll');
    createHandle('wheel');
    globalEvents.wheel = true;
    globalEvents.scroll = true;
    globalEvents.doubleclick = true;
    if (isTouch) {
        eventHooks.click = eventHooks.clickcapture = function (dom) {
            dom.onclick = dom.onclick || noop;
        };
    }
    eventPropHooks.click = function (e) {
        return !e.target.disabled;
    };
    var fixWheelType = document$1.onwheel !== void 666 ? 'wheel' : 'onmousewheel' in document$1 ? 'mousewheel' : 'DOMMouseScroll';
    eventHooks.wheel = function (dom) {
        addEvent(dom, fixWheelType, specialHandles.wheel);
    };
    eventPropHooks.wheel = function (event) {
        event.deltaX = 'deltaX' in event ? event.deltaX :
        'wheelDeltaX' in event ? -event.wheelDeltaX : 0;
        event.deltaY = 'deltaY' in event ? event.deltaY :
        'wheelDeltaY' in event ? -event.wheelDeltaY :
        'wheelDelta' in event ? -event.wheelDelta : 0;
    };
    var focusMap = {
        focus: 'focus',
        blur: 'blur'
    };
    var innerFocus = void 0;
    function blurFocus(e) {
        var dom = getTarget(e);
        var type = focusMap[e.type];
        if (Renderer.inserting) {
            if (type === 'blur') {
                innerFocus = true;
                Renderer.inserting.focus();
                return;
            }
        }
        if (innerFocus) {
            innerFocus = false;
            return;
        }
        do {
            if (dom.nodeType === 1) {
                if (dom.__events && dom.__events[type]) {
                    dispatchEvent(e, type);
                    break;
                }
            } else {
                break;
            }
        } while (dom = dom.parentNode);
    }
    'blur,focus'.replace(/\w+/g, function (type) {
        globalEvents[type] = true;
        if (modern) {
            var mark = '__' + type;
            if (!document$1[mark]) {
                document$1[mark] = true;
                addEvent(document$1, type, blurFocus, true);
            }
        } else {
            eventHooks[type] = function (dom, name) {
                addEvent(dom, focusMap[name], blurFocus);
            };
        }
    });
    eventHooks.scroll = function (dom, name) {
        addEvent(dom, name, specialHandles[name]);
    };
    eventHooks.doubleclick = function (dom, name) {
        addEvent(document$1, 'dblclick', specialHandles[name]);
    };
    function SyntheticEvent(event) {
        if (event.nativeEvent) {
            return event;
        }
        for (var i in event) {
            if (!eventProto[i]) {
                this[i] = event[i];
            }
        }
        if (!this.target) {
            this.target = event.srcElement;
        }
        this.fixEvent();
        this.timeStamp = new Date() - 0;
        this.nativeEvent = event;
    }
    var eventProto = SyntheticEvent.prototype = {
        fixEvent: noop,
        fixHooks: noop,
        persist: noop,
        preventDefault: function preventDefault() {
            var e = this.nativeEvent || {};
            e.returnValue = this.returnValue = false;
            if (e.preventDefault) {
                e.preventDefault();
                this.defaultPrevented = true;
            }
        },
        stopPropagation: function stopPropagation() {
            var e = this.nativeEvent || {};
            e.cancelBubble = this._stopPropagation = true;
            if (e.stopPropagation) {
                e.stopPropagation();
            }
        },
        stopImmediatePropagation: function stopImmediatePropagation() {
            this.stopPropagation();
            this.stopImmediate = true;
        },
        toString: function toString() {
            return '[object Event]';
        }
    };
    Renderer.eventSystem = {
        eventPropHooks: eventPropHooks,
        addEvent: addEvent,
        dispatchEvent: dispatchEvent,
        SyntheticEvent: SyntheticEvent
    };

    var NOWORK = 1;
    var WORKING = 2;
    var PLACE = 3;
    var CONTENT = 5;
    var ATTR = 7;
    var DUPLEX = 11;
    var DETACH = 13;
    var HOOK = 17;
    var REF = 19;
    var CALLBACK = 23;
    var PASSIVE = 29;
    var CAPTURE = 31;
    var effectNames = [DUPLEX, HOOK, REF, DETACH, CALLBACK, PASSIVE, CAPTURE].sort(function (a, b) {
        return a - b;
    });
    var effectLength = effectNames.length;

    var isSpecialAttr = {
        style: 1,
        autoFocus: 1,
        innerHTML: 1,
        dangerouslySetInnerHTML: 1
    };
    var svgCache = {};
    var strategyCache = {};
    var svgCamelCase = {
        w: { r: 1, b: 1, t: 1 },
        e: { n: 1, t: 1, f: 1, p: 1, c: 1, m: 1, a: 2, u: 1, s: 1, v: 1 },
        o: { r: 1 },
        c: { m: 1 },
        p: { p: 1 },
        t: { s: 2, t: 1, u: 1, c: 1, d: 1, o: 1, x: 1, y: 1, l: 1 },
        l: { r: 1, m: 1, u: 1, b: -1, l: -1, s: -1 },
        r: { r: 1, u: 2, h: 1, w: 1, c: 1, e: 1 },
        h: { r: 1, a: 1, l: 1, t: 1 },
        y: { p: 1, s: 1, t: 1, c: 1 },
        g: { c: 1 },
        k: { a: -1, h: -1, r: -1, s: -1, t: -1, c: 1, u: 1 },
        m: { o: 1, l: 1, a: 1 },
        n: { c: 1, t: 1, u: 1 },
        s: { a: 3 },
        f: { x: 1, y: 1 },
        d: { e: 1, f: 1, m: 1, d: 1 },
        x: { c: 1 }
    };
    var specialSVGPropertyName = {
        "overline-thickness": 2,
        "underline-thickness": 2,
        "overline-position": 2,
        "underline-position": 2,
        "stroke-miterlimit": 2,
        "baseline-shift": 2,
        "clip-path": 2,
        "font-size": 2,
        "font-size-adjust": 2,
        "font-stretch": 2,
        "font-style": 2,
        "text-decoration": 2,
        "vert-origin-x": 2,
        "vert-origin-y": 2,
        "paint-order": 2,
        "fill-rule": 2,
        "color-rendering": 2,
        "marker-end": 2,
        "pointer-events": 2,
        "units-per-em": 2,
        "strikethrough-thickness": 2,
        "lighting-color": 2
    };
    var repeatedKey = ["et", "ep", "em", "es", "pp", "ts", "td", "to", "lr", "rr", "re", "ht", "gc"];
    function createRepaceFn(split) {
        return function (match) {
            return match.slice(0, 1) + split + match.slice(1).toLowerCase();
        };
    }
    var rhump = /([a-z])([A-Z])/;
    var toHyphen = createRepaceFn("-");
    var toColon = createRepaceFn(":");
    function getSVGAttributeName(name) {
        if (svgCache[name]) {
            return svgCache[name];
        }
        var match = name.match(rhump);
        if (!match) {
            return svgCache[name] = name;
        }
        var prefix = match[1];
        var postfix = match[2].toLowerCase();
        var orig = name;
        var count = svgCamelCase[prefix] && svgCamelCase[prefix][postfix];
        if (count) {
            if (count === -1) {
                return svgCache[orig] = {
                    name: name.replace(rhump, toColon),
                    ifSpecial: true
                };
            }
            if (~repeatedKey.indexOf(prefix + postfix)) {
                var dashName = name.replace(rhump, toHyphen);
                if (specialSVGPropertyName[dashName]) {
                    name = dashName;
                }
            }
        } else {
            name = name.replace(rhump, toHyphen);
        }
        return svgCache[orig] = name;
    }
    function diffProps(dom, lastProps, nextProps, fiber) {
        var isSVG = fiber.namespaceURI === NAMESPACE.svg;
        var tag = fiber.type;
        var continueProps = skipProps;
        if (!isSVG && rform.test(fiber.type)) {
            continueProps = duplexProps;
            if (!("onChange" in nextProps)) {
                eventAction(dom, "onChange", noop, lastProps, fiber);
            }
            fiber.effectTag *= DUPLEX;
            fiber.onDuplex = continueProps.onDuplex;
        }
        for (var name in nextProps) {
            if (continueProps[name]) {
                continue;
            }
            var val = nextProps[name];
            if (val !== lastProps[name]) {
                var which = tag + isSVG + name;
                var action = strategyCache[which];
                if (!action) {
                    action = strategyCache[which] = getPropAction(dom, name, isSVG);
                }
                actionStrategy[action](dom, name, val, lastProps, fiber);
            }
        }
        for (var _name in lastProps) {
            if (continueProps[_name]) {
                continue;
            }
            if (!nextProps.hasOwnProperty(_name)) {
                var _which = tag + isSVG + _name;
                var _action = strategyCache[_which];
                if (!_action) {
                    continue;
                }
                actionStrategy[_action](dom, _name, false, lastProps, fiber);
            }
        }
    }
    function isBooleanAttr(dom, name) {
        var val = dom[name];
        return val === true || val === false;
    }
    function isEventName(name) {
        return (/^on[A-Z]/.test(name)
        );
    }
    function getPropAction(dom, name, isSVG) {
        if (isSVG && name === "className") {
            return "svgClass";
        }
        if (isSpecialAttr[name]) {
            return name;
        }
        if (isEventName(name)) {
            return "event";
        }
        if (isSVG) {
            return "svgAttr";
        }
        if (name === "width" || name === "height") {
            return "attribute";
        }
        if (isBooleanAttr(dom, name)) {
            return "booleanAttr";
        }
        return name.indexOf("data-") === 0 || dom[name] === void 666 ? "attribute" : "property";
    }
    var builtinStringProps = {
        className: 1,
        title: 1,
        name: 1,
        type: 1,
        alt: 1,
        lang: 1
    };
    var skipProps = {
        innerHTML: 1,
        children: 1,
        onDuplex: noop
    };
    var duplexProps = {
        value: 1,
        defaultValue: 1,
        checked: 1,
        innerHTML: 1,
        children: 1
    };
    var actionStrategy = {
        style: function style(dom, _, val, lastProps) {
            patchStyle(dom, lastProps.style || emptyObject, val || emptyObject);
        },
        autoFocus: function autoFocus(dom) {
            if (/input|text/i.test(dom.nodeName) || dom.contentEditable === "true") {
                dom.focus();
            }
        },
        svgClass: function svgClass(dom, name, val) {
            if (!val) {
                dom.removeAttribute("class");
            } else {
                dom.setAttribute("class", val);
            }
        },
        svgAttr: function svgAttr(dom, name, val) {
            var method = typeNumber(val) < 3 && !val ? "removeAttribute" : "setAttribute";
            var nameRes = getSVGAttributeName(name);
            if (nameRes.ifSpecial) {
                var prefix = nameRes.name.split(":")[0];
                dom[method + "NS"](NAMESPACE[prefix], nameRes.name, val || "");
            } else {
                dom[method](nameRes, typeNumber(val) !== 3 && !val ? "" : val);
            }
        },
        booleanAttr: function booleanAttr(dom, name, val) {
            dom[name] = !!val;
            if (dom[name] === false) {
                dom.removeAttribute(name);
            } else if (dom[name] === "false") {
                dom[name] = "";
            }
        },
        attribute: function attribute(dom, name, val) {
            if (val == null || val === false) {
                return dom.removeAttribute(name);
            }
            try {
                dom.setAttribute(name, val);
            } catch (e) {
                console.warn("setAttribute error", name, val);
            }
        },
        property: function property(dom, name, val) {
            try {
                if (!val && val !== 0) {
                    if (builtinStringProps[name]) {
                        dom[name] = "";
                    } else {
                        dom.removeAttribute(name);
                    }
                } else {
                    dom[name] = val;
                }
            } catch (e) {
                try {
                    dom.setAttribute(name, val);
                } catch (e) {
                }
            }
        },
        event: eventAction,
        dangerouslySetInnerHTML: function dangerouslySetInnerHTML(dom, name, val, lastProps) {
            var oldhtml = lastProps[name] && lastProps[name].__html;
            var html = val && val.__html;
            html = html == null ? "" : html;
            if (html !== oldhtml) {
                dom.innerHTML = html;
            }
        }
    };

    function AnuPortal(props) {
        return props.children;
    }

    function UpdateQueue() {
        return {
            pendingStates: [],
            pendingCbs: []
        };
    }
    function createInstance(fiber, context) {
        var updater = {
            mountOrder: Renderer.mountOrder++,
            enqueueSetState: returnFalse,
            isMounted: isMounted
        };
        var props = fiber.props,
            type = fiber.type,
            tag = fiber.tag,
            ref = fiber.ref,
            key = fiber.key,
            isStateless = tag === 1,
            lastOwn = Renderer.currentOwner,
            instance = {
            refs: {},
            props: props,
            key: key,
            context: context,
            ref: ref,
            _reactInternalFiber: fiber,
            __proto__: type.prototype
        };
        fiber.updateQueue = UpdateQueue();
        fiber.errorHook = 'constructor';
        try {
            if (isStateless) {
                Renderer.currentOwner = instance;
                extend(instance, {
                    __isStateless: true,
                    renderImpl: type,
                    render: function f() {
                        return this.renderImpl(this.props, this.context);
                    }
                });
                Renderer.currentOwner = instance;
                if (type.render) {
                    instance.render = function () {
                        return type.render(this.props, this.ref);
                    };
                }
            } else {
                instance = new type(props, context);
                if (!(instance instanceof Component)) {
                    throw type.name + ' doesn\'t extend React.Component';
                }
            }
        } finally {
            Renderer.currentOwner = lastOwn;
            fiber.stateNode = instance;
            instance._reactInternalFiber = fiber;
            instance.updater = updater;
            instance.context = context;
            updater.enqueueSetState = Renderer.updateComponent;
            if (type[gDSFP] || instance[gSBU]) {
                instance.__useNewHooks = true;
            }
        }
        return instance;
    }

    function Fiber(vnode) {
        extend(this, vnode);
        var type = vnode.type || "ProxyComponent(react-hot-loader)";
        this.name = type.displayName || type.name || type;
        this.effectTag = 1;
    }

    function pushError(fiber, hook, error) {
        var names = [];
        var boundary = findCatchComponent(fiber, names, hook);
        var stack = describeError(names, hook);
        if (boundary) {
            if (fiber.hasMounted) ; else {
                fiber.stateNode = {
                    updater: fakeObject
                };
                fiber.effectTag = NOWORK;
            }
            var values = boundary.capturedValues || (boundary.capturedValues = []);
            values.push(error, {
                componentStack: stack
            });
        } else {
            var p = fiber.return;
            for (var i in p.children) {
                if (p.children[i] == fiber) {
                    fiber.type = noop;
                }
            }
            while (p) {
                p._hydrating = false;
                p = p.return;
            }
            if (!Renderer.catchError) {
                Renderer.catchStack = stack;
                Renderer.catchError = error;
            }
        }
    }
    function guardCallback(host, hook, args) {
        try {
            return applyCallback(host, hook, args);
        } catch (error) {
            pushError(get(host), hook, error);
        }
    }
    function applyCallback(host, hook, args) {
        var fiber = host._reactInternalFiber;
        fiber.errorHook = hook;
        var fn = host[hook];
        if (hook == "componentWillUnmount") {
            host[hook] = noop;
        }
        if (fn) {
            return fn.apply(host, args);
        }
        return true;
    }
    function describeError(names, hook) {
        var segments = ["**" + hook + "** method occur error "];
        names.forEach(function (name, i) {
            if (names[i + 1]) {
                segments.push("in " + name + " (created By " + names[i + 1] + ")");
            }
        });
        return segments.join("\n\r").trim();
    }
    function findCatchComponent(fiber, names, hook) {
        var instance = void 0,
            name = void 0,
            topFiber = fiber,
            retry = void 0,
            boundary = void 0;
        while (fiber) {
            name = fiber.name;
            if (fiber.tag < 4) {
                names.push(name);
                instance = fiber.stateNode || {};
                if (instance.componentDidCatch && !boundary) {
                    if (!fiber.caughtError && topFiber !== fiber) {
                        boundary = fiber;
                    } else if (fiber.caughtError) {
                        retry = fiber;
                    }
                }
            } else if (fiber.tag === 5) {
                names.push(name);
            }
            fiber = fiber.return;
            if (boundary) {
                var boundaries = Renderer.boundaries;
                if (!retry || retry !== boundary) {
                    var effectTag = boundary.effectTag;
                    var f = boundary.alternate;
                    if (f && !f.catchError) {
                        f.forward = boundary.forward;
                        f.sibling = boundary.sibling;
                        if (boundary.return.child == boundary) {
                            boundary.return.child = f;
                        }
                        boundary = f;
                    }
                    if (!boundary.catchError) {
                        if (hook == "componentWillUnmount" || hook == "componentDidUpdate") {
                            boundary.effectTag = CAPTURE;
                        } else {
                            boundary.effectTag = effectTag * CAPTURE;
                        }
                        boundaries.unshift(boundary);
                        boundary.catchError = true;
                    }
                    if (retry) {
                        var arr = boundary.effects || (boundary.effects = []);
                        arr.push(retry);
                    }
                }
                return boundary;
            }
        }
    }
    function removeFormBoundaries(fiber) {
        delete fiber.catchError;
        var arr = Renderer.boundaries;
        var index = arr.indexOf(fiber);
        if (index !== -1) {
            arr.splice(index, 1);
        }
    }
    function detachFiber(fiber, effects$$1) {
        fiber.effectTag = DETACH;
        effects$$1.push(fiber);
        fiber.disposed = true;
        for (var child = fiber.child; child; child = child.sibling) {
            detachFiber(child, effects$$1);
        }
    }

    function setter(compute, cursor, value) {
        this.updateQueue[cursor] = compute(cursor, value);
        Renderer.updateComponent(this, true);
    }
    var hookCursor = 0;
    function resetCursor() {
        hookCursor = 0;
    }
    function getCurrentKey() {
        var key = hookCursor + 'Hook';
        hookCursor++;
        return key;
    }
    function useContext(getContext) {
        if (isFn(getContext)) {
            var fiber = getCurrentFiber();
            var context = getContext(fiber);
            var list = getContext.subscribers;
            if (list.indexOf(fiber) === -1) {
                list.push(fiber);
            }
            return context;
        }
        return null;
    }
    function useReducerImpl(reducer, initValue, initAction) {
        var fiber = getCurrentFiber();
        var key = getCurrentKey();
        var updateQueue = fiber.updateQueue;
        var compute = reducer ? function (cursor, action) {
            return reducer(updateQueue[cursor], action || { type: Math.random() });
        } : function (cursor, value) {
            var novel = updateQueue[cursor];
            return typeof value == 'function' ? value(novel) : value;
        };
        var dispatch = setter.bind(fiber, compute, key);
        if (key in updateQueue) {
            delete updateQueue.isForced;
            return [updateQueue[key], dispatch];
        }
        var value = updateQueue[key] = initAction ? reducer(initValue, initAction) : initValue;
        return [value, dispatch];
    }
    function useCallbackImpl(create, deps, isMemo) {
        var fiber = getCurrentFiber();
        var key = getCurrentKey();
        var updateQueue = fiber.updateQueue;
        var nextInputs = Array.isArray(deps) ? deps : [create];
        var prevState = updateQueue[key];
        if (prevState) {
            var prevInputs = prevState[1];
            if (areHookInputsEqual(nextInputs, prevInputs)) {
                return prevState[0];
            }
        }
        var value = isMemo ? create() : create;
        updateQueue[key] = [value, nextInputs];
        return value;
    }
    function useEffectImpl(create, deps, EffectTag, createList, destroyList) {
        var fiber = getCurrentFiber();
        var cb = useCallbackImpl(create, deps);
        if (fiber.effectTag % EffectTag) {
            fiber.effectTag *= EffectTag;
        }
        var updateQueue = fiber.updateQueue;
        var list = updateQueue[createList] || (updateQueue[createList] = []);
        updateQueue[destroyList] || (updateQueue[destroyList] = []);
        list.push(cb);
    }
    function getCurrentFiber() {
        return get(Renderer.currentOwner);
    }
    function areHookInputsEqual(arr1, arr2) {
        for (var i = 0; i < arr1.length; i++) {
            if (Object.is(arr1[i], arr2[i])) {
                continue;
            }
            return false;
        }
        return true;
    }

    function getInsertPoint(fiber) {
        var parent = fiber.parent;
        while (fiber) {
            if (fiber.stateNode === parent || fiber.isPortal) {
                return null;
            }
            var found = forward(fiber);
            if (found) {
                return found;
            }
            fiber = fiber.return;
        }
    }
    function setInsertPoints(children) {
        for (var i in children) {
            var child = children[i];
            if (child.disposed) {
                continue;
            }
            if (child.tag > 4) {
                var p = child.parent;
                child.effectTag = PLACE;
                child.forwardFiber = p.insertPoint;
                p.insertPoint = child;
                for (var pp = child.return; pp && pp.effectTag === NOWORK; pp = pp.return) {
                    pp.effectTag = WORKING;
                }
            } else {
                if (child.child) {
                    setInsertPoints(child.children);
                }
            }
        }
    }
    function forward(fiber) {
        var found;
        while (fiber.forward) {
            fiber = fiber.forward;
            if (fiber.disposed || fiber.isPortal) {
                continue;
            }
            if (fiber.tag > 3) {
                return fiber;
            }
            if (fiber.child) {
                found = downward(fiber);
                if (found) {
                    return found;
                }
            }
        }
    }
    function downward(fiber) {
        var found;
        while (fiber.lastChild) {
            fiber = fiber.lastChild;
            if (fiber.disposed || fiber.isPortal) {
                return;
            }
            if (fiber.tag > 3) {
                return fiber;
            }
            if (fiber.forward) {
                found = forward(fiber);
                if (found) {
                    return found;
                }
            }
        }
    }

    function reconcileDFS(fiber, info, deadline, ENOUGH_TIME) {
        var topWork = fiber;
        outerLoop: while (fiber) {
            if (fiber.disposed || deadline.timeRemaining() <= ENOUGH_TIME) {
                break;
            }
            var occurError = void 0;
            if (fiber.tag < 3) {
                var keepbook = Renderer.currentOwner;
                try {
                    updateClassComponent(fiber, info);
                } catch (e) {
                    occurError = true;
                    pushError(fiber, fiber.errorHook, e);
                }
                Renderer.currentOwner = keepbook;
                if (fiber.batching) {
                    delete fiber.updateFail;
                    delete fiber.batching;
                }
            } else {
                updateHostComponent(fiber, info);
            }
            if (fiber.child && !fiber.updateFail && !occurError) {
                fiber = fiber.child;
                continue outerLoop;
            }
            var f = fiber;
            while (f) {
                var instance = f.stateNode;
                if (f.tag > 3 || f.shiftContainer) {
                    if (f.shiftContainer) {
                        delete f.shiftContainer;
                        info.containerStack.shift();
                    }
                } else {
                    var updater = instance && instance.updater;
                    if (f.shiftContext) {
                        delete f.shiftContext;
                        info.contextStack.shift();
                    }
                    if (f.hasMounted && instance[gSBU]) {
                        updater.snapshot = guardCallback(instance, gSBU, [updater.prevProps, updater.prevState]);
                    }
                }
                if (f === topWork) {
                    break outerLoop;
                }
                if (f.sibling) {
                    fiber = f.sibling;
                    continue outerLoop;
                }
                f = f.return;
            }
        }
    }
    function updateHostComponent(fiber, info) {
        var props = fiber.props,
            tag = fiber.tag,
            prev = fiber.alternate;
        if (!fiber.stateNode) {
            fiber.parent = info.containerStack[0];
            fiber.stateNode = Renderer.createElement(fiber);
        }
        var parent = fiber.parent;
        fiber.forwardFiber = parent.insertPoint;
        parent.insertPoint = fiber;
        fiber.effectTag = PLACE;
        if (tag === 5) {
            fiber.stateNode.insertPoint = null;
            info.containerStack.unshift(fiber.stateNode);
            fiber.shiftContainer = true;
            fiber.effectTag *= ATTR;
            if (fiber.ref) {
                fiber.effectTag *= REF;
            }
            diffChildren(fiber, props.children);
        } else {
            if (!prev || prev.props !== props) {
                fiber.effectTag *= CONTENT;
            }
        }
    }
    function mergeStates(fiber, nextProps) {
        var instance = fiber.stateNode,
            pendings = fiber.updateQueue.pendingStates,
            n = pendings.length,
            state = fiber.memoizedState || instance.state;
        if (n === 0) {
            return state;
        }
        var nextState = extend({}, state);
        var fail = true;
        for (var i = 0; i < n; i++) {
            var pending = pendings[i];
            if (pending) {
                if (isFn(pending)) {
                    var a = pending.call(instance, nextState, nextProps);
                    if (!a) {
                        continue;
                    } else {
                        pending = a;
                    }
                }
                fail = false;
                extend(nextState, pending);
            }
        }
        if (fail) {
            return state;
        } else {
            return fiber.memoizedState = nextState;
        }
    }
    function updateClassComponent(fiber, info) {
        var type = fiber.type,
            instance = fiber.stateNode,
            props = fiber.props;
        var contextStack = info.contextStack,
            containerStack = info.containerStack;
        var getContext = type.contextType;
        var unmaskedContext = contextStack[0];
        var isStaticContextType = isFn(type.contextType);
        var newContext = isStaticContextType ? getContext(fiber) : getMaskedContext(instance, type.contextTypes, unmaskedContext);
        if (instance == null) {
            fiber.parent = type === AnuPortal ? props.parent : containerStack[0];
            instance = createInstance(fiber, newContext);
            if (isStaticContextType) {
                getContext.subscribers.push(instance);
            }
        }
        if (!isStaticContextType) {
            cacheContext(instance, unmaskedContext, newContext);
        }
        var isStateful = !instance.__isStateless;
        instance._reactInternalFiber = fiber;
        if (isStateful) {
            var updateQueue = fiber.updateQueue;
            delete fiber.updateFail;
            if (fiber.hasMounted) {
                applybeforeUpdateHooks(fiber, instance, props, newContext, contextStack);
            } else {
                applybeforeMountHooks(fiber, instance, props);
            }
            if (fiber.memoizedState) {
                instance.state = fiber.memoizedState;
            }
            fiber.batching = updateQueue.batching;
            var cbs = updateQueue.pendingCbs;
            if (cbs.length) {
                fiber.pendingCbs = cbs;
                fiber.effectTag *= CALLBACK;
            }
            if (fiber.ref) {
                fiber.effectTag *= REF;
            }
        } else if (type === AnuPortal) {
            containerStack.unshift(fiber.parent);
            fiber.shiftContainer = true;
        }
        instance.context = newContext;
        fiber.memoizedProps = instance.props = props;
        fiber.memoizedState = instance.state;
        if (instance.getChildContext) {
            var context = instance.getChildContext();
            context = Object.assign({}, unmaskedContext, context);
            fiber.shiftContext = true;
            contextStack.unshift(context);
        }
        if (fiber.parent && fiber.hasMounted && fiber.dirty) {
            fiber.parent.insertPoint = getInsertPoint(fiber);
        }
        if (isStateful) {
            if (fiber.updateFail) {
                cloneChildren(fiber);
                fiber._hydrating = false;
                return;
            }
            delete fiber.dirty;
            fiber.effectTag *= HOOK;
        } else if (fiber.effectTag == 1) {
            fiber.effectTag = WORKING;
        }
        if (fiber.catchError) {
            return;
        }
        Renderer.onBeforeRender(fiber);
        fiber._hydrating = true;
        Renderer.currentOwner = instance;
        var rendered = applyCallback(instance, 'render', []);
        resetCursor();
        diffChildren(fiber, rendered);
        Renderer.onAfterRender(fiber);
    }
    function applybeforeMountHooks(fiber, instance, newProps) {
        fiber.setout = true;
        if (instance.__useNewHooks) {
            setStateByProps(fiber, newProps, instance.state);
        } else {
            callUnsafeHook(instance, 'componentWillMount', []);
        }
        delete fiber.setout;
        mergeStates(fiber, newProps);
        fiber.updateQueue = UpdateQueue();
    }
    function applybeforeUpdateHooks(fiber, instance, newProps, newContext, contextStack) {
        var oldProps = fiber.memoizedProps;
        var oldState = fiber.memoizedState;
        var updater = instance.updater;
        updater.prevProps = oldProps;
        updater.prevState = oldState;
        var propsChanged = oldProps !== newProps;
        fiber.setout = true;
        if (!instance.__useNewHooks) {
            var contextChanged = instance.context !== newContext;
            if (propsChanged || contextChanged) {
                var prevState = instance.state;
                callUnsafeHook(instance, 'componentWillReceiveProps', [newProps, newContext]);
                if (prevState !== instance.state) {
                    fiber.memoizedState = instance.state;
                }
            }
        }
        var newState = instance.state = oldState;
        var updateQueue = fiber.updateQueue;
        mergeStates(fiber, newProps);
        newState = fiber.memoizedState;
        setStateByProps(fiber, newProps, newState);
        newState = fiber.memoizedState;
        delete fiber.setout;
        fiber._hydrating = true;
        if (!propsChanged && newState === oldState && contextStack.length == 1 && !updateQueue.isForced) {
            fiber.updateFail = true;
        } else {
            var args = [newProps, newState, newContext];
            fiber.updateQueue = UpdateQueue();
            if (!updateQueue.isForced && !applyCallback(instance, 'shouldComponentUpdate', args)) {
                fiber.updateFail = true;
            } else if (!instance.__useNewHooks) {
                callUnsafeHook(instance, 'componentWillUpdate', args);
            }
        }
    }
    function callUnsafeHook(a, b, c) {
        applyCallback(a, b, c);
        applyCallback(a, 'UNSAFE_' + b, c);
    }
    function isSameNode(a, b) {
        if (a.type === b.type && a.key === b.key) {
            return true;
        }
    }
    function setStateByProps(fiber, nextProps, prevState) {
        fiber.errorHook = gDSFP;
        var fn = fiber.type[gDSFP];
        if (fn) {
            var partialState = fn.call(null, nextProps, prevState);
            if (typeNumber(partialState) === 8) {
                fiber.memoizedState = Object.assign({}, prevState, partialState);
            }
        }
    }
    function cloneChildren(fiber) {
        var prev = fiber.alternate;
        if (prev && prev.child) {
            var pc = prev.children;
            var cc = fiber.children = {};
            fiber.child = prev.child;
            fiber.lastChild = prev.lastChild;
            for (var i in pc) {
                var a = pc[i];
                a.return = fiber;
                cc[i] = a;
            }
            setInsertPoints(cc);
        }
    }
    function cacheContext(instance, unmaskedContext, context) {
        instance.__unmaskedContext = unmaskedContext;
        instance.__maskedContext = context;
    }
    function getMaskedContext(instance, contextTypes, unmaskedContext) {
        var noContext = !contextTypes;
        if (instance) {
            if (noContext) {
                return instance.context;
            }
            var cachedUnmasked = instance.__unmaskedContext;
            if (cachedUnmasked === unmaskedContext) {
                return instance.__maskedContext;
            }
        }
        var context = {};
        if (noContext) {
            return context;
        }
        for (var key in contextTypes) {
            if (contextTypes.hasOwnProperty(key)) {
                context[key] = unmaskedContext[key];
            }
        }
        return context;
    }
    function diffChildren(parentFiber, children) {
        var oldFibers = parentFiber.children;
        if (oldFibers) {
            parentFiber.oldChildren = oldFibers;
        } else {
            oldFibers = {};
        }
        var newFibers = fiberizeChildren(children, parentFiber);
        var effects$$1 = parentFiber.effects || (parentFiber.effects = []);
        var matchFibers = new Object();
        delete parentFiber.child;
        for (var i in oldFibers) {
            var newFiber = newFibers[i];
            var oldFiber = oldFibers[i];
            if (newFiber && newFiber.type === oldFiber.type) {
                matchFibers[i] = oldFiber;
                if (newFiber.key != null) {
                    oldFiber.key = newFiber.key;
                }
                continue;
            }
            detachFiber(oldFiber, effects$$1);
        }
        var prevFiber = void 0,
            index = 0;
        for (var _i in newFibers) {
            var _newFiber = newFibers[_i];
            var _oldFiber = matchFibers[_i];
            var alternate = null;
            if (_oldFiber) {
                if (isSameNode(_oldFiber, _newFiber)) {
                    alternate = new Fiber(_oldFiber);
                    var oldRef = _oldFiber.ref;
                    _newFiber = extend(_oldFiber, _newFiber);
                    delete _newFiber.disposed;
                    _newFiber.alternate = alternate;
                    if (_newFiber.ref && _newFiber.deleteRef) {
                        delete _newFiber.ref;
                        delete _newFiber.deleteRef;
                    }
                    if (oldRef && oldRef !== _newFiber.ref) {
                        effects$$1.push(alternate);
                    }
                    if (_newFiber.tag === 5) {
                        _newFiber.lastProps = alternate.props;
                    }
                } else {
                    detachFiber(_oldFiber, effects$$1);
                }
            } else {
                _newFiber = new Fiber(_newFiber);
            }
            newFibers[_i] = _newFiber;
            _newFiber.index = index++;
            _newFiber.return = parentFiber;
            if (prevFiber) {
                prevFiber.sibling = _newFiber;
                _newFiber.forward = prevFiber;
            } else {
                parentFiber.child = _newFiber;
                _newFiber.forward = null;
            }
            prevFiber = _newFiber;
        }
        parentFiber.lastChild = prevFiber;
        if (prevFiber) {
            prevFiber.sibling = null;
        }
    }

    function getDOMNode() {
        return this;
    }
    var Refs = {
        fireRef: function fireRef(fiber, dom) {
            var ref = fiber.ref;
            var owner = fiber._owner;
            try {
                var number = typeNumber(ref);
                refStrategy[number](owner, ref, dom);
                if (owner && owner.__isStateless) {
                    delete fiber.ref;
                    fiber.deleteRef = true;
                }
            } catch (e) {
                pushError(fiber, 'ref', e);
            }
        }
    };
    var refStrategy = {
        4: function _(owner, ref, dom) {
            if (dom === null) {
                delete owner.refs[ref];
            } else {
                if (dom.nodeType) {
                    dom.getDOMNode = getDOMNode;
                }
                owner.refs[ref] = dom;
            }
        },
        5: function _(owner, ref, dom) {
            ref(dom);
        },
        8: function _(owner, ref, dom) {
            ref.current = dom;
        }
    };

    var domFns = ['insertElement', 'updateContent', 'updateAttribute'];
    var domEffects = [PLACE, CONTENT, ATTR];
    var domRemoved = [];
    var passiveFibers = [];
    function commitDFSImpl(fiber) {
        var topFiber = fiber;
        outerLoop: while (true) {
            if (fiber.effects && fiber.effects.length) {
                fiber.effects.forEach(disposeFiber);
                delete fiber.effects;
            }
            if (fiber.effectTag % PLACE == 0) {
                domEffects.forEach(function (effect, i) {
                    if (fiber.effectTag % effect == 0) {
                        Renderer[domFns[i]](fiber);
                        fiber.effectTag /= effect;
                    }
                });
                fiber.hasMounted = true;
            } else {
                if (fiber.catchError) {
                    removeFormBoundaries(fiber);
                    disposeFibers(fiber);
                }
            }
            if (fiber.updateFail) {
                delete fiber.updateFail;
            }
            if (fiber.child && fiber.child.effectTag > NOWORK) {
                fiber = fiber.child;
                continue;
            }
            var f = fiber;
            while (f) {
                if (f.effectTag === WORKING) {
                    f.effectTag = NOWORK;
                    f.hasMounted = true;
                } else if (f.effectTag > WORKING) {
                    commitEffects(f);
                    f.hasMounted = true;
                    if (f.capturedValues) {
                        f.effectTag = CAPTURE;
                    }
                }
                if (f === topFiber || f.hostRoot) {
                    break outerLoop;
                }
                if (f.sibling) {
                    fiber = f.sibling;
                    continue outerLoop;
                }
                f = f.return;
            }
        }
    }
    function commitDFS(effects$$1) {
        Renderer.batchedUpdates(function () {
            var el;
            while (el = effects$$1.shift()) {
                if (el.effectTag === DETACH && el.caughtError) {
                    disposeFiber(el);
                } else {
                    commitDFSImpl(el);
                }
                if (passiveFibers.length) {
                    passiveFibers.forEach(function (fiber) {
                        safeInvokeHooks(fiber.updateQueue, 'passive', 'unpassive');
                    });
                    passiveFibers.length = 0;
                }
                if (domRemoved.length) {
                    domRemoved.forEach(Renderer.removeElement);
                    domRemoved.length = 0;
                }
            }
        }, {});
        var error = Renderer.catchError;
        if (error) {
            delete Renderer.catchError;
            throw error;
        }
    }
    function commitEffects(fiber) {
        var instance = fiber.stateNode || emptyObject;
        var amount = fiber.effectTag;
        var updater = instance.updater || fakeObject;
        for (var i = 0; i < effectLength; i++) {
            var effectNo = effectNames[i];
            if (effectNo > amount) {
                break;
            }
            if (amount % effectNo === 0) {
                amount /= effectNo;
                switch (effectNo) {
                    case WORKING:
                        break;
                    case DUPLEX:
                        Renderer.updateControlled(fiber);
                        break;
                    case HOOK:
                        if (instance.__isStateless) {
                            safeInvokeHooks(fiber.updateQueue, 'layout', 'unlayout');
                        } else if (fiber.hasMounted) {
                            guardCallback(instance, 'componentDidUpdate', [updater.prevProps, updater.prevState, updater.snapshot]);
                        } else {
                            fiber.hasMounted = true;
                            guardCallback(instance, 'componentDidMount', []);
                        }
                        delete fiber._hydrating;
                        if (fiber.catchError) {
                            fiber.effectTag = amount;
                            return;
                        }
                        break;
                    case PASSIVE:
                        passiveFibers.push(fiber);
                        break;
                    case REF:
                        Refs.fireRef(fiber, instance);
                        break;
                    case CALLBACK:
                        var queue = fiber.pendingCbs;
                        fiber._hydrating = true;
                        queue.forEach(function (fn) {
                            fn.call(instance);
                        });
                        delete fiber._hydrating;
                        delete fiber.pendingCbs;
                        break;
                    case CAPTURE:
                        var values = fiber.capturedValues;
                        fiber.caughtError = true;
                        var a = values.shift();
                        var b = values.shift();
                        if (!values.length) {
                            fiber.effectTag = amount;
                            delete fiber.capturedValues;
                        }
                        instance.componentDidCatch(a, b);
                        break;
                }
            }
        }
        fiber.effectTag = NOWORK;
    }
    function disposeFibers(fiber) {
        var list = [fiber.oldChildren, fiber.children];
        for (var i = 0; i < 2; i++) {
            var c = list[i];
            if (c) {
                for (var _i in c) {
                    var child = c[_i];
                    if (!child.disposed && child.hasMounted) {
                        disposeFiber(child, true);
                        disposeFibers(child);
                    }
                }
            }
        }
        delete fiber.child;
        delete fiber.lastChild;
        delete fiber.oldChildren;
        fiber.children = {};
    }
    function safeInvokeHooks(upateQueue, create, destory) {
        var uneffects = upateQueue[destory],
            effects$$1 = upateQueue[create],
            fn;
        if (!uneffects) {
            return;
        }
        while (fn = uneffects.shift()) {
            try {
                fn();
            } catch (e) {      }
        }
        while (fn = effects$$1.shift()) {
            try {
                var f = fn();
                if (typeof f === 'function') {
                    uneffects.push(f);
                }
            } catch (e) {      }
        }
    }
    function disposeFiber(fiber, force) {
        var stateNode = fiber.stateNode,
            effectTag = fiber.effectTag;
        if (!stateNode) {
            return;
        }
        var isStateless = stateNode.__isStateless;
        if (!isStateless && fiber.ref) {
            Refs.fireRef(fiber, null);
        }
        if (effectTag % DETACH == 0 || force === true) {
            if (fiber.tag > 3) {
                domRemoved.push(fiber);
            } else {
                Renderer.onDispose(fiber);
                if (fiber.hasMounted) {
                    if (isStateless) {
                        safeInvokeHooks(fiber.updateQueue, 'layout', 'unlayout');
                        safeInvokeHooks(fiber.updateQueue, 'passive', 'unpassive');
                    }
                    stateNode.updater.enqueueSetState = returnFalse;
                    guardCallback(stateNode, 'componentWillUnmount', []);
                    delete fiber.stateNode;
                }
            }
            delete fiber.alternate;
            delete fiber.hasMounted;
            fiber.disposed = true;
        }
        fiber.effectTag = NOWORK;
    }

    var Unbatch = miniCreateClass(function Unbatch(props) {
        this.state = {
            child: props.child
        };
    }, Component, {
        render: function render() {
            return this.state.child;
        }
    });

    var macrotasks = Renderer.macrotasks;
    var boundaries = Renderer.boundaries;
    var batchedtasks = [];
    function render(vnode, root, callback) {
        var container = createContainer(root),
            immediateUpdate = false;
        if (!container.hostRoot) {
            var fiber = new Fiber({
                type: Unbatch,
                tag: 2,
                props: {},
                hasMounted: true,
                memoizedState: {},
                return: container
            });
            fiber.index = 0;
            container.child = fiber;
            var instance = createInstance(fiber, {});
            container.hostRoot = instance;
            immediateUpdate = true;
            Renderer.emptyElement(container);
        }
        var carrier = {};
        updateComponent(container.child, {
            child: vnode
        }, wrapCb(callback, carrier), immediateUpdate);
        return carrier.instance;
    }
    function wrapCb(fn, carrier) {
        return function () {
            var fiber = get(this);
            var target = fiber.child ? fiber.child.stateNode : null;
            fn && fn.call(target);
            carrier.instance = target;
        };
    }
    function performWork(deadline) {
        workLoop(deadline);
        if (boundaries.length) {
            macrotasks.unshift.apply(macrotasks, boundaries);
            boundaries.length = 0;
        }
        topFibers.forEach(function (el) {
            var microtasks = el.microtasks;
            while (el = microtasks.shift()) {
                if (!el.disposed) {
                    macrotasks.push(el);
                }
            }
        });
        if (macrotasks.length) {
            requestIdleCallback(performWork);
        }
    }
    var ENOUGH_TIME = 1;
    var deadline = {
        didTimeout: false,
        timeRemaining: function timeRemaining() {
            return 2;
        }
    };
    function requestIdleCallback(fn) {
        fn(deadline);
    }
    Renderer.scheduleWork = function () {
        performWork(deadline);
    };
    var isBatching = false;
    Renderer.batchedUpdates = function (callback, event) {
        var keepbook = isBatching;
        isBatching = true;
        try {
            event && Renderer.fireMiddlewares(true);
            return callback(event);
        } finally {
            isBatching = keepbook;
            if (!isBatching) {
                var el = void 0;
                while (el = batchedtasks.shift()) {
                    if (!el.disabled) {
                        macrotasks.push(el);
                    }
                }
                event && Renderer.fireMiddlewares();
                Renderer.scheduleWork();
            }
        }
    };
    function workLoop(deadline) {
        var fiber = macrotasks.shift(),
            info = void 0;
        if (fiber) {
            if (fiber.type === Unbatch) {
                info = fiber.return;
            } else {
                var dom = getContainer(fiber);
                info = {
                    containerStack: [dom],
                    contextStack: [fiber.stateNode.__unmaskedContext]
                };
            }
            reconcileDFS(fiber, info, deadline, ENOUGH_TIME);
            updateCommitQueue(fiber);
            resetStack(info);
            if (macrotasks.length && deadline.timeRemaining() > ENOUGH_TIME) {
                workLoop(deadline);
            } else {
                commitDFS(effects);
            }
        }
    }
    function updateCommitQueue(fiber) {
        var hasBoundary = boundaries.length;
        if (fiber.type !== Unbatch) {
            if (hasBoundary) {
                arrayPush.apply(effects, boundaries);
            } else {
                effects.push(fiber);
            }
        } else {
            effects.push(fiber);
        }
        boundaries.length = 0;
    }
    function mergeUpdates(fiber, state, isForced, callback) {
        var updateQueue = fiber.updateQueue;
        if (isForced) {
            updateQueue.isForced = true;
        }
        if (state) {
            updateQueue.pendingStates.push(state);
        }
        if (isFn(callback)) {
            updateQueue.pendingCbs.push(callback);
        }
    }
    function fiberContains(p, son) {
        while (son.return) {
            if (son.return === p) {
                return true;
            }
            son = son.return;
        }
    }
    function getQueue(fiber) {
        while (fiber) {
            if (fiber.microtasks) {
                return fiber.microtasks;
            }
            fiber = fiber.return;
        }
    }
    function pushChildQueue(fiber, queue) {
        var maps = {};
        for (var i = queue.length, el; el = queue[--i];) {
            if (fiber === el) {
                queue.splice(i, 1);
                continue;
            } else if (fiberContains(fiber, el)) {
                queue.splice(i, 1);
                continue;
            }
            maps[el.stateNode.updater.mountOrder] = true;
        }
        var enqueue = true,
            p = fiber,
            hackSCU = [];
        while (p.return) {
            p = p.return;
            var instance = p.stateNode;
            if (instance.refs && !instance.__isStateless && p.type !== Unbatch) {
                hackSCU.push(p);
                var u = instance.updater;
                if (maps[u.mountOrder]) {
                    enqueue = false;
                    break;
                }
            }
        }
        hackSCU.forEach(function (el) {
            el.updateQueue.batching = true;
        });
        if (enqueue) {
            queue.push(fiber);
        }
    }
    function updateComponent(fiber, state, callback, immediateUpdate) {
        fiber.dirty = true;
        var sn = typeNumber(state);
        var isForced = state === true;
        var microtasks = getQueue(fiber);
        state = isForced ? null : sn === 5 || sn === 8 ? state : null;
        if (fiber.setout) {
            immediateUpdate = false;
        } else if (isBatching && !immediateUpdate || fiber._hydrating) {
            pushChildQueue(fiber, batchedtasks);
        } else {
            immediateUpdate = immediateUpdate || !fiber._hydrating;
            pushChildQueue(fiber, microtasks);
        }
        mergeUpdates(fiber, state, isForced, callback);
        if (immediateUpdate) {
            Renderer.scheduleWork();
        }
    }
    Renderer.updateComponent = updateComponent;
    function validateTag(el) {
        return el && el.appendChild;
    }
    function createContainer(root, onlyGet, validate) {
        validate = validate || validateTag;
        if (!validate(root)) {
            throw 'container is not a element';
        }
        root.anuProp = 2018;
        var useProp = root.anuProp === 2018;
        if (useProp) {
            root.anuProp = void 0;
            if (get(root)) {
                return get(root);
            }
        } else {
            var index = topNodes.indexOf(root);
            if (index !== -1) {
                return topFibers[index];
            }
        }
        if (onlyGet) {
            return null;
        }
        var container = new Fiber({
            stateNode: root,
            tag: 5,
            name: 'hostRoot',
            contextStack: [{}],
            containerStack: [root],
            microtasks: [],
            type: root.nodeName || root.type
        });
        if (useProp) {
            root._reactInternalFiber = container;
        }
        topNodes.push(root);
        topFibers.push(container);
        return container;
    }
    function getContainer(p) {
        if (p.parent) {
            return p.parent;
        }
        while (p = p.return) {
            if (p.tag === 5) {
                return p.stateNode;
            }
        }
    }

    var reuseTextNodes = [];
    function createElement$1(vnode) {
        var p = vnode.return;
        var type = vnode.type,
            props = vnode.props,
            ns = vnode.ns;
        switch (type) {
            case '#text':
                var node = reuseTextNodes.pop();
                if (node) {
                    node.nodeValue = props;
                    return node;
                }
                return document$1.createTextNode(props);
            case '#comment':
                return document$1.createComment(props);
            case 'svg':
                ns = NAMESPACE.svg;
                break;
            case 'math':
                ns = NAMESPACE.math;
                break;
            default:
                do {
                    var s = p.name == 'AnuPortal' ? p.props.parent : p.tag === 5 ? p.stateNode : null;
                    if (s) {
                        ns = s.namespaceURI;
                        if (p.type === 'foreignObject' || ns === NAMESPACE.xhtml) {
                            ns = '';
                        }
                        break;
                    }
                } while (p = p.return);
                break;
        }
        try {
            if (ns) {
                vnode.namespaceURI = ns;
                return document$1.createElementNS(ns, type);
            }
        } catch (e1) {
        }
        var elem = document$1.createElement(type);
        var inputType = props && props.type;
        if (inputType && elem.uniqueID) {
            try {
                elem = document$1.createElement('<' + type + ' type=\'' + inputType + '\'/>');
            } catch (e2) {
            }
        }
        return elem;
    }
    var hyperspace = document$1.createElement('div');
    function _emptyElement(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
    Renderer.middleware({
        begin: noop,
        end: fireDuplex
    });
    function _removeElement(node) {
        if (!node) {
            return;
        }
        var nodeType = node.nodeType;
        if (nodeType === 1 && node.__events) {
            node.__events = null;
        } else if (nodeType === 3 && reuseTextNodes.length < 100) {
            reuseTextNodes.push(node);
        }
        hyperspace.appendChild(node);
        hyperspace.removeChild(node);
    }
    function safeActiveElement() {
        try {
            return document$1.activeElement;
        } catch (e) {}
    }
    function insertElement(fiber) {
        var dom = fiber.stateNode,
            parent = fiber.parent;
        try {
            var insertPoint = fiber.forwardFiber ? fiber.forwardFiber.stateNode : null;
            var after = insertPoint ? insertPoint.nextSibling : parent.firstChild;
            if (after == dom) {
                return;
            }
            if (after === null && dom === parent.lastChild) {
                return;
            }
            Renderer.inserting = fiber.tag === 5 && safeActiveElement();
            parent.insertBefore(dom, after);
            Renderer.inserting = null;
        } catch (e) {
            throw e;
        }
    }
    render.Render = Renderer;
    function mergeContext(container, context) {
        container.contextStack[0] = Object.assign({}, context);
    }
    var DOMRenderer = createRenderer({
        render: render,
        updateAttribute: function updateAttribute(fiber) {
            var props = fiber.props,
                lastProps = fiber.lastProps,
                stateNode = fiber.stateNode;
            diffProps(stateNode, lastProps || emptyObject, props, fiber);
        },
        updateContent: function updateContent(fiber) {
            fiber.stateNode.nodeValue = fiber.props;
        },
        updateControlled: duplexAction,
        createElement: createElement$1,
        insertElement: insertElement,
        emptyElement: function emptyElement(fiber) {
            _emptyElement(fiber.stateNode);
        },
        unstable_renderSubtreeIntoContainer: function unstable_renderSubtreeIntoContainer(instance, vnode, root, callback) {
            var container = createContainer(root),
                fiber = get(instance),
                backup = void 0;
            do {
                var inst = fiber.stateNode;
                if (inst && inst.getChildContext) {
                    backup = mergeContext(container, inst.getChildContext());
                    break;
                } else {
                    backup = fiber;
                }
            } while (fiber = fiber.return);
            if (backup && backup.contextStack) {
                mergeContext(container, backup.contextStack[0]);
            }
            return Renderer.render(vnode, root, callback);
        },
        unmountComponentAtNode: function unmountComponentAtNode(root) {
            var container = createContainer(root, true);
            var fiber = Object(container).child;
            if (fiber) {
                Renderer.updateComponent(fiber, {
                    child: null
                }, function () {
                    removeTop(root);
                }, true);
                return true;
            }
            return false;
        },
        removeElement: function removeElement(fiber) {
            var dom = fiber.stateNode;
            if (dom) {
                _removeElement(dom);
                delete fiber.stateNode;
                if (dom._reactInternalFiber) {
                    removeTop(dom);
                }
            }
        }
    });
    function removeTop(dom) {
        var j = topNodes.indexOf(dom);
        if (j !== -1) {
            topFibers.splice(j, 1);
            topNodes.splice(j, 1);
        }
        dom._reactInternalFiber = null;
    }

    var fakeApp = {
        app: {
            globalData: {}
        }
    };
    function _getApp() {
        if (isFn(getApp)) {
            return getApp();
        }
        return fakeApp;
    }
    if (typeof getApp === 'function') {
        _getApp = getApp;
    }
    function callGlobalHook(method, e) {
        var app = _getApp();
        if (app && app[method]) {
            return app[method](e);
        }
    }
    var delayMounts = [];
    var usingComponents = [];
    var registeredComponents = {};
    function getCurrentPage() {
        var app = _getApp();
        return app.$$page && app.$$page.reactInstance;
    }
    function _getCurrentPages() {
        console.warn('getCurrentPages存在严重的平台差异性，不建议再使用');
        if (typeof getCurrentPages !== 'undefined') {
            return getCurrentPages();
        }
        return [];
    }
    function updateMiniApp(instance) {
        if (!instance || !instance.wx) {
            return;
        }
        var data = safeClone({
            props: instance.props,
            state: instance.state || null,
            context: instance.context
        });
        if (instance.wx.setData) {
            instance.wx.setData(data);
        } else {
            updateQuickApp(instance.wx, data);
        }
    }
    function refreshComponent(reactInstances, wx, uuid) {
        var pagePath = Object(_getApp()).$$pagePath;
        for (var i = 0, n = reactInstances.length; i < n; i++) {
            var reactInstance = reactInstances[i];
            if (reactInstance.$$pagePath === pagePath && !reactInstance.wx && reactInstance.instanceUid === uuid) {
                if (get(reactInstance).disposed) {
                    continue;
                }
                reactInstance.wx = wx;
                wx.reactInstance = reactInstance;
                updateMiniApp(reactInstance);
                return reactInstances.splice(i, 1);
            }
        }
    }
    function detachComponent() {
        var t = this.reactInstance;
        if (t) {
            t.wx = null;
            this.reactInstance = null;
        }
    }
    function updateQuickApp(quick, data) {
        for (var i in data) {
            quick.$set(i, data[i]);
        }
    }
    function isReferenceType(val) {
        return typeNumber(val) > 6;
    }
    function useComponent(props) {
        var is = props.is;
        var clazz = registeredComponents[is];
        props.key = this.key != null ? this.key : props['data-instance-uid'] || new Date() - 0;
        clazz.displayName = is;
        if (this.ref !== null) {
            props.ref = this.ref;
        }
        var owner = Renderer.currentOwner;
        if (owner) {
            Renderer.currentOwner = get(owner)._owner;
        }
        return createElement(clazz, props);
    }
    function handleSuccess(options, success, complete, resolve) {
        success(options);
        complete(options);
        resolve(options);
    }
    function handleFail(options, fail, complete, reject) {
        fail(options);
        complete(options);
        reject(options);
    }
    function safeClone(originVal) {
        var temp = originVal instanceof Array ? [] : {};
        for (var item in originVal) {
            if (hasOwnProperty.call(originVal, item)) {
                var value = originVal[item];
                if (isReferenceType(value)) {
                    if (value.$$typeof) {
                        continue;
                    }
                    temp[item] = safeClone(value);
                } else {
                    temp[item] = value;
                }
            }
        }
        return temp;
    }

    var onAndSyncApis = {
      onSocketOpen: true,
      onSocketError: true,
      onSocketMessage: true,
      onSocketClose: true,
      onBackgroundAudioPlay: true,
      onBackgroundAudioPause: true,
      onBackgroundAudioStop: true,
      onNetworkStatusChange: true,
      onAccelerometerChange: true,
      onCompassChange: true,
      onBluetoothAdapterStateChange: true,
      onBluetoothDeviceFound: true,
      onBLEConnectionStateChange: true,
      onBLECharacteristicValueChange: true,
      onBeaconUpdate: true,
      onBeaconServiceChange: true,
      onUserCaptureScreen: true,
      onHCEMessage: true,
      onGetWifiList: true,
      onWifiConnected: true,
      setStorageSync: true,
      getStorageSync: true,
      getStorageInfoSync: true,
      removeStorageSync: true,
      clearStorageSync: true,
      getSystemInfoSync: true,
      getExtConfigSync: true,
      getLogManager: true
    };
    var noPromiseApis = {
      stopRecord: true,
      getRecorderManager: true,
      pauseVoice: true,
      stopVoice: true,
      pauseBackgroundAudio: true,
      stopBackgroundAudio: true,
      getBackgroundAudioManager: true,
      createAudioContext: true,
      createInnerAudioContext: true,
      createVideoContext: true,
      createCameraContext: true,
      wxpayGetType: true,
      navigateBack: true,
      createMapContext: true,
      canIUse: true,
      startAccelerometer: true,
      stopAccelerometer: true,
      startCompass: true,
      stopCompass: true,
      hideToast: true,
      hideLoading: true,
      showNavigationBarLoading: true,
      hideNavigationBarLoading: true,
      createAnimation: true,
      pageScrollTo: true,
      createSelectorQuery: true,
      createCanvasContext: true,
      createContext: true,
      drawCanvas: true,
      hideKeyboard: true,
      stopPullDownRefresh: true,
      arrayBufferToBase64: true,
      base64ToArrayBuffer: true,
      getUpdateManager: true,
      createWorker: true,
      getPushProvider: true,
      getProvider: true,
      canvasToTempFilePath: true
    };
    var otherApis = {
      uploadFile: true,
      downloadFile: true,
      connectSocket: true,
      sendSocketMessage: true,
      closeSocket: true,
      chooseImage: true,
      previewImage: true,
      getImageInfo: true,
      saveImageToPhotosAlbum: true,
      startRecord: true,
      playVoice: true,
      getBackgroundAudioPlayerState: true,
      playBackgroundAudio: true,
      seekBackgroundAudio: true,
      chooseVideo: true,
      saveVideoToPhotosAlbum: true,
      loadFontFace: true,
      saveFile: true,
      getFileInfo: true,
      getSavedFileList: true,
      getSavedFileInfo: true,
      removeSavedFile: true,
      openDocument: true,
      setStorage: true,
      getStorage: true,
      getStorageInfo: true,
      removeStorage: true,
      clearStorage: true,
      navigateTo: true,
      redirectTo: true,
      switchTab: true,
      reLaunch: true,
      getLocation: true,
      chooseLocation: true,
      openLocation: true,
      getSystemInfo: true,
      getNetworkType: true,
      makePhoneCall: true,
      scanCode: true,
      setClipboardData: true,
      getClipboardData: true,
      openBluetoothAdapter: true,
      closeBluetoothAdapter: true,
      getBluetoothAdapterState: true,
      startBluetoothDevicesDiscovery: true,
      stopBluetoothDevicesDiscovery: true,
      getBluetoothDevices: true,
      getConnectedBluetoothDevices: true,
      createBLEConnection: true,
      closeBLEConnection: true,
      getBLEDeviceServices: true,
      getBLEDeviceCharacteristics: true,
      readBLECharacteristicValue: true,
      writeBLECharacteristicValue: true,
      notifyBLECharacteristicValueChange: true,
      startBeaconDiscovery: true,
      stopBeaconDiscovery: true,
      getBeacons: true,
      setScreenBrightness: true,
      getScreenBrightness: true,
      setKeepScreenOn: true,
      vibrateLong: true,
      vibrateShort: true,
      addPhoneContact: true,
      getHCEState: true,
      startHCE: true,
      stopHCE: true,
      sendHCEMessage: true,
      startWifi: true,
      stopWifi: true,
      connectWifi: true,
      getWifiList: true,
      setWifiList: true,
      getConnectedWifi: true,
      showToast: true,
      showLoading: true,
      showModal: true,
      showActionSheet: true,
      setNavigationBarTitle: true,
      setNavigationBarColor: true,
      setTabBarBadge: true,
      removeTabBarBadge: true,
      showTabBarRedDot: true,
      hideTabBarRedDot: true,
      setTabBarStyle: true,
      setTabBarItem: true,
      showTabBar: true,
      hideTabBar: true,
      setTopBarText: true,
      startPullDownRefresh: true,
      canvasGetImageData: true,
      canvasPutImageData: true,
      getExtConfig: true,
      request: true,
      login: true,
      checkSession: true,
      authorize: true,
      getUserInfo: true,
      requestPayment: true,
      showShareMenu: true,
      hideShareMenu: true,
      updateShareMenu: true,
      getShareInfo: true,
      chooseAddress: true,
      addCard: true,
      openCard: true,
      openSetting: true,
      getSetting: true,
      getWeRunData: true,
      navigateToMiniProgram: true,
      navigateBackMiniProgram: true,
      chooseInvoiceTitle: true,
      checkIsSupportSoterAuthentication: true,
      startSoterAuthentication: true,
      checkIsSoterEnrolledInDevice: true
    };

    function promisefyApis(ReactWX, facade, more) {
        var weApis = Object.assign({}, onAndSyncApis, noPromiseApis, otherApis, more);
        Object.keys(weApis).forEach(function (key) {
            var needWrapper = more[key] || facade[key] || noop;
            if (!onAndSyncApis[key] && !noPromiseApis[key]) {
                ReactWX.api[key] = function (options) {
                    var args = [].slice.call(arguments);
                    if (!options || Object(options) !== options) {
                        return needWrapper.apply(facade, args);
                    }
                    var task = null;
                    var obj = Object.assign({}, options);
                    args[0] = obj;
                    var p = new Promise(function (resolve, reject) {
                        ['fail', 'success', 'complete'].forEach(function (k) {
                            obj[k] = function (res) {
                                options[k] && options[k](res);
                                if (k === 'success') {
                                    resolve(key === 'connectSocket' ? task : res);
                                } else if (k === 'fail') {
                                    reject(res);
                                }
                            };
                        });
                        if (needWrapper === noop) {
                            console.warn('平台未不支持', key, '方法');
                        } else {
                            task = needWrapper.apply(facade, args);
                        }
                    });
                    if (key === 'uploadFile' || key === 'downloadFile') {
                        p.progress = function (cb) {
                            task.onProgressUpdate(cb);
                            return p;
                        };
                        p.abort = function (cb) {
                            cb && cb();
                            task.abort();
                            return p;
                        };
                    }
                    return p;
                };
            } else {
                if (needWrapper == noop) {
                    ReactWX.api[key] = noop;
                } else {
                    ReactWX.api[key] = function () {
                        return needWrapper.apply(facade, arguments);
                    };
                }
            }
        });
    }
    function pxTransform(size) {
        var deviceRatio = this.api.deviceRatio;
        return parseInt(size, 10) / deviceRatio + 'rpx';
    }
    function initPxTransform(facade) {
        function fallback(windowWidth) {
            facade.designWidth = windowWidth;
            facade.deviceRatio = 750 / windowWidth / 2;
        }
        if (facade.getSystemInfo) {
            facade.getSystemInfo({
                success: function success(res) {
                    fallback(res.windowWidth);
                }
            });
        } else {
            fallback(375);
        }
    }
    function registerAPIs(ReactWX, facade, override) {
        registerAPIsQuick(ReactWX, facade, override);
        initPxTransform(ReactWX.api);
        ReactWX.api.pxTransform = ReactWX.pxTransform = pxTransform.bind(ReactWX);
    }
    function registerAPIsQuick(ReactWX, facade, override) {
        if (!ReactWX.api) {
            ReactWX.api = {};
            promisefyApis(ReactWX, facade, override(facade));
        }
    }

    function makePhoneCall() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return new Promise(function (resolve, reject) {
        var _options$phoneNumber = options.phoneNumber,
            phoneNumber = _options$phoneNumber === undefined ? '' : _options$phoneNumber,
            _options$success = options.success,
            success = _options$success === undefined ? function () {} : _options$success,
            _options$fail = options.fail,
            fail = _options$fail === undefined ? function () {} : _options$fail,
            _options$complete = options.complete,
            complete = _options$complete === undefined ? function () {} : _options$complete;
        phoneNumber = String(phoneNumber);
        if (/^\d+$/.test(phoneNumber)) {
          window.location.href = 'tel:' + phoneNumber;
          handleSuccess({
            errMsg: 'makePhoneCall: success',
            phoneNumber: phoneNumber
          }, success, complete, resolve);
        } else {
          handleFail({
            errMsg: 'phoneNumber格式错误',
            phoneNumber: phoneNumber
          }, fail, complete, reject);
        }
      });
    }
    var call = {
      makePhoneCall: makePhoneCall
    };

    var NOTSUPPORTAPI = [
    'openLocation', 'chooseLocation',
    'getClipboardData',
    'saveImageToPhotosAlbum',
    'getNetworkType', 'onNetworkStatusChange',
    'startBeaconDiscovery', 'stopBeaconDiscovery', 'getBeacons', 'onBeaconUpdate', 'onBeaconServiceChange',
    'hideKeyboard',
    'setKeepScreenOn', 'getScreenBrightness', 'setScreenBrightness '];
    function canIUse(api) {
      var apis = Object.keys(apiData).map(function (k) {
        return k;
      });
      return apis.indexOf(api) >= 0 && NOTSUPPORTAPI.indexOf(api) < 0;
    }
    var canIUse$1 = {
      canIUse: canIUse
    };

    var CanvasContext = function CanvasContext(canvasId) {
      var canvasDom = document.getElementById(canvasId);
      if (!canvasDom || !canvasDom.getContext) {
        console.error('canvasId错误，或浏览器不支持canvas');
      } else {
        this.canvasDom = canvasDom;
        this.width = canvasDom.width;
        this.height = canvasDom.height;
        this.ctx = canvasDom.getContext('2d');
      }
      this.missions = [];
    };
    CanvasContext.prototype.setTextAlign = function (align) {
      var _this = this;
      this.missions.push(function () {
        _this.ctx.textAlign = align;
      });
    };
    CanvasContext.prototype.setTextBaseline = function (textBaseline) {
      var _this2 = this;
      this.missions.push(function () {
        _this2.ctx.textBaseline = textBaseline;
      });
    };
    CanvasContext.prototype.setFillStyle = function () {
      var _this3 = this;
      var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'black';
      this.missions.push(function () {
        _this3.ctx.fillStyle = color;
      });
    };
    CanvasContext.prototype.setStrokeStyle = function () {
      var _this4 = this;
      var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'black';
      this.missions.push(function () {
        _this4.ctx.strokeStyle = color;
      });
    };
    CanvasContext.prototype.setShadow = function () {
      var offsetX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var offsetY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var _this5 = this;
      var blur = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'black';
      this.missions.push(function () {
        _this5.ctx.shadowOffsetX = offsetX;
        _this5.ctx.shadowOffsetY = offsetY;
        _this5.ctx.shadowBlur = blur;
        _this5.ctx.shadowColor = color;
      });
    };
    CanvasContext.prototype.createLinearGradient = function (x0, y0, x1, y1) {
      return this.ctx.createLinearGradient(x0, y0, x1, y1);
    };
    CanvasContext.prototype.createCircularGradient = function (x, y, r) {
      return this.ctx.createRadialGradient(x, y, 0, x, y, r);
    };
    CanvasContext.prototype.setLineWidth = function (lineWidth) {
      var _this6 = this;
      this.missions.push(function () {
        _this6.ctx.lineWidth = lineWidth;
      });
    };
    CanvasContext.prototype.setLineCap = function (lineCap) {
      var _this7 = this;
      this.missions.push(function () {
        _this7.ctx.lineCap = lineCap;
      });
    };
    CanvasContext.prototype.setLineJoin = function (lineJoin) {
      var _this8 = this;
      this.missions.push(function () {
        _this8.ctx.lineJoin = lineJoin;
      });
    };
    CanvasContext.prototype.setMiterLimit = function (miterLimit) {
      var _this9 = this;
      this.missions.push(function () {
        _this9.ctx.miterLimit = miterLimit;
      });
    };
    CanvasContext.prototype.rect = function (x, y, width, height) {
      var _this10 = this;
      this.missions.push(function () {
        _this10.ctx.rect(x, y, width, height);
      });
    };
    CanvasContext.prototype.fillRect = function (x, y, width, height) {
      var _this11 = this;
      this.missions.push(function () {
        _this11.ctx.fillRect(x, y, width, height);
      });
    };
    CanvasContext.prototype.strokeRect = function (x, y, width, height) {
      var _this12 = this;
      this.missions.push(function () {
        _this12.ctx.strokeRect(x, y, width, height);
      });
    };
    CanvasContext.prototype.clearRect = function (x, y, width, height) {
      var _this13 = this;
      this.missions.push(function () {
        _this13.ctx.clearRect(x, y, width, height);
      });
    };
    CanvasContext.prototype.fill = function () {
      var _this14 = this;
      this.missions.push(function () {
        _this14.ctx.fill();
      });
    };
    CanvasContext.prototype.stroke = function () {
      var _this15 = this;
      this.missions.push(function () {
        _this15.ctx.stroke();
      });
    };
    CanvasContext.prototype.beginPath = function () {
      var _this16 = this;
      this.missions.push(function () {
        _this16.ctx.beginPath();
      });
    };
    CanvasContext.prototype.closePath = function () {
      var _this17 = this;
      this.missions.push(function () {
        _this17.ctx.closePath();
      });
    };
    CanvasContext.prototype.moveTo = function (x, y) {
      var _this18 = this;
      this.missions.push(function () {
        _this18.ctx.moveTo(x, y);
      });
    };
    CanvasContext.prototype.lineTo = function (x, y) {
      var _this19 = this;
      this.missions.push(function () {
        _this19.ctx.lineTo(x, y);
      });
    };
    CanvasContext.prototype.arc = function (x, y, r, sAngle, eAngle, counterclockwise) {
      var _this20 = this;
      this.missions.push(function () {
        _this20.ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
      });
    };
    CanvasContext.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
      var _this21 = this;
      this.missions.push(function () {
        _this21.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      });
    };
    CanvasContext.prototype.clip = function () {
      var _this22 = this;
      this.missions.push(function () {
        _this22.ctx.clip();
      });
    };
    CanvasContext.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
      var _this23 = this;
      this.missions.push(function () {
        _this23.ctx.quadraticCurveTo(cpx, cpy, x, y);
      });
    };
    CanvasContext.prototype.scale = function (scaleWidth, scaleHeight) {
      var _this24 = this;
      this.missions.push(function () {
        _this24.ctx.scale(scaleWidth, scaleHeight);
      });
    };
    CanvasContext.prototype.rotate = function (rotate) {
      var _this25 = this;
      this.missions.push(function () {
        _this25.ctx.rotate(rotate);
      });
    };
    CanvasContext.prototype.translate = function (x, y) {
      var _this26 = this;
      this.missions.push(function () {
        _this26.ctx.translate(x, y);
      });
    };
    CanvasContext.prototype.setFontSize = function (fontSize) {
      var _this27 = this;
      this.missions.push(function () {
        _this27.ctx.font = fontSize;
      });
    };
    CanvasContext.prototype.fillText = function (text, x, y, maxWidth) {
      var _this28 = this;
      this.missions.push(function () {
        _this28.ctx.fillText(text, x, y, maxWidth);
      });
    };
    CanvasContext.prototype.drawImage = function (imageResource, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight) {
      var _this29 = this;
      this.missions.push(function () {
        _this29.ctx.drawImage(imageResource, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight);
      });
    };
    CanvasContext.prototype.setGlobalAlpha = function (alpha) {
      var _this30 = this;
      this.missions.push(function () {
        _this30.ctx.globalAlpha = alpha;
      });
    };
    CanvasContext.prototype.setLineDash = function (segments, offset) {
      var _this31 = this;
      this.missions.push(function () {
        _this31.ctx.setLineDash(segments, offset);
      });
    };
    CanvasContext.prototype.transform = function (scaleX, skewX, skewY, scaleY, translateX, translateY) {
      var _this32 = this;
      this.missions.push(function () {
        _this32.ctx.transform(scaleX, skewX, skewY, scaleY, translateX, translateY);
      });
    };
    CanvasContext.prototype.setTransform = function (scaleX, skewX, skewY, scaleY, translateX, translateY) {
      var _this33 = this;
      this.missions.push(function () {
        _this33.ctx.setTransform(scaleX, skewX, skewY, scaleY, translateX, translateY);
      });
    };
    CanvasContext.prototype.save = function () {
      var _this34 = this;
      this.missions.push(function () {
        _this34.ctx.save();
      });
    };
    CanvasContext.prototype.restore = function () {
      var _this35 = this;
      this.missions.push(function () {
        _this35.ctx.restore();
      });
    };
    CanvasContext.prototype.draw = function () {
      var reserve = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
      if (!reserve) {
        this.height = this.height;
      }
      this.missions.forEach(function (mission) {
        mission();
      });
      callback();
    };
    CanvasContext.prototype.measureText = function (text) {
      return this.ctx.measureText(text);
    };
    function createCanvasContext(canvasId) {
      return new CanvasContext(canvasId);
    }
    function canvasToTempFilePath() {
      console.warn('暂未实现');
    }
    var canvas = {
      createCanvasContext: createCanvasContext,
      canvasToTempFilePath: canvasToTempFilePath
    };

    function setClipboardData() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return new Promise(function (resolve, reject) {
        var _options$data = options.data,
            data = _options$data === undefined ? '' : _options$data,
            _options$success = options.success,
            success = _options$success === undefined ? function () {} : _options$success,
            _options$fail = options.fail,
            fail = _options$fail === undefined ? function () {} : _options$fail,
            _options$complete = options.complete,
            complete = _options$complete === undefined ? function () {} : _options$complete;
        try {
          var aux = document.createElement('input');
          aux.setAttribute('data-clipboard-text', data);
          new Clipboard(aux);
          aux.click();
          handleSuccess({
            errMsg: 'setClipboardData success',
            data: data
          }, success, complete, resolve);
        } catch (e) {
          handleFail({
            errMsg: e
          }, fail, complete, reject);
        }
      });
    }
    var clipboard = {
      setClipboardData: setClipboardData
    };

    var file = {};

    function chooseImage(_ref) {
      var _ref$files = _ref.files,
          files = _ref$files === undefined ? [] : _ref$files;
      var result = [];
      var _loop = function _loop(i) {
        var f = files[i];
        if (!f) return 'break';
        result.push(new Promise(function (res) {
          var reader = new FileReader();
          reader.readAsDataURL(f);
          reader.onload = function () {
            return res(reader.result);
          };
        }));
      };
      for (var i = 0; i < 9; i++) {
        var _ret = _loop(i);
        if (_ret === 'break') break;
      }
      return Promise.all(result);
    }
    function saveImageToPhotosAlbum(filePath) {
      console.log(filePath);
    }
    function getImageInfo() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var img = new Image();
      var src = options.src,
          _options$success = options.success,
          success = _options$success === undefined ? function () {} : _options$success,
          _options$fail = options.fail,
          fail = _options$fail === undefined ? function () {} : _options$fail,
          _options$complete = options.complete,
          complete = _options$complete === undefined ? function () {} : _options$complete;
      img.src = src;
      var result = {
        width: 1,
        height: 1,
        path: '',
        orientation: '',
        type: ''
      };
      return new Promise(function (resolve, reject) {
        try {
          if (!src) {
            handleFail({
              errMsg: 'getImageInfo 参数错误'
            }, fail, complete, reject);
            return;
          }
          if (img.complete) {
            result.width = img.width;
            result.height = img.height;
            result.path = img.src;
            handleSuccess(result, success, complete, resolve);
          } else {
            img.onload = function () {
              result.width = img.width;
              result.height = img.height;
              result.path = img.src;
              handleSuccess(result, success, complete, resolve);
            };
          }
        } catch (e) {
          handleFail({
            errMsg: e
          }, fail, complete, reject);
        }
      });
    }
    var images = {
      chooseImage: chooseImage,
      saveImageToPhotosAlbum: saveImageToPhotosAlbum,
      getImageInfo: getImageInfo
    };

    var interaction = {
    };

    function getLocation() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return new Promise(function (resolve, reject) {
        var _options$altitude = options.altitude,
            altitude = _options$altitude === undefined ? false : _options$altitude,
            _options$success = options.success,
            success = _options$success === undefined ? function () {} : _options$success,
            _options$fail = options.fail,
            fail = _options$fail === undefined ? function () {} : _options$fail,
            _options$complete = options.complete,
            complete = _options$complete === undefined ? function () {} : _options$complete;
        if (!navigator.geolocation) {
          handleFail({ errMsg: new Error('无法获取位置') }, fail, complete, reject);
        }
        navigator.geolocation.getCurrentPosition(function (position) {
          handleSuccess(position.coords, success, complete, resolve);
        }, function (err) {
          handleFail({ errMsg: err.message }, fail, complete, reject);
        }, {
          enableHighAcuracy: altitude === 'true',
          timeout: 5000
        });
      });
    }
    var location = {
      getLocation: getLocation
    };

    var previewImage = {
    };

    axios.defaults.headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    var cancel = void 0,
        promiseArr = {};
    var CancelToken = axios.CancelToken;
    axios.interceptors.request.use(function (config) {
      if (promiseArr[config.url]) {
        promiseArr[config.url]('操作取消');
        promiseArr[config.url] = cancel;
      } else {
        promiseArr[config.url] = cancel;
      }
      return config;
    }, function (err) {
      console.log('请求超时!');
      return Promise.resolve(err);
    });
    axios.interceptors.response.use(function (response) {
      return response.status === 200 ? Promise.resolve(response) : Promise.reject(response);
    }, function (error) {
      if (error && error.response) {
        switch (error.response.status) {
          case 404:
            error.message = '请求错误,未找到该资源';
            break;
          case 500:
            error.message = '服务器端出错';
            break;
          default:
            error.message = '\u672A\u77E5\u9519\u8BEF: ' + error.response.status;
        }
      }
      return Promise.resolve(error);
    });
    function getFormData(formData) {
      var data = new FormData();
      Object.keys(formData).forEach(function (k) {
        data.append(k, formData[k]);
      });
      return data;
    }
    function request() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$url = _ref.url,
          url = _ref$url === undefined ? '' : _ref$url,
          _ref$method = _ref.method,
          method = _ref$method === undefined ? 'get' : _ref$method,
          _ref$data = _ref.data,
          data = _ref$data === undefined ? {} : _ref$data,
          _ref$header = _ref.header,
          header = _ref$header === undefined ? {} : _ref$header,
          _ref$responseType = _ref.responseType,
          responseType = _ref$responseType === undefined ? 'text' : _ref$responseType,
          _ref$success = _ref.success,
          success = _ref$success === undefined ? function () {} : _ref$success,
          _ref$fail = _ref.fail,
          fail = _ref$fail === undefined ? function () {} : _ref$fail,
          _ref$complete = _ref.complete,
          complete = _ref$complete === undefined ? function () {} : _ref$complete;
      return new Promise(function (resolve, reject) {
        method = method.toLowerCase();
        Object.keys(data).forEach(function (key) {
          if (data[key] === '' || data[key] == null) delete data[key];
        });
        if (method === 'get') data = { params: data };
        if (method === 'post') data = qs.stringify(data);
        axios({
          method: method,
          url: url,
          data: data,
          headers: header,
          responseType: responseType,
          cancelToken: new CancelToken(function (c) {
            cancel = c;
          })
        }).then(function (res) {
          handleCallback.handleSuccess(res, success, complete, resolve);
        }).catch(function (err) {
          handleCallback.handleFail(err, fail, complete, reject);
        });
      });
    }
    function uploadFile() {
      var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var formData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var header = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var success = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};
      var fail = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : function () {};
      var complete = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : function () {};
      return new Promise(function (resolve, reject) {
        axios({
          method: 'post',
          url: url,
          data: getFormData(formData),
          headers: Object.assign({}, { 'content-type': 'multipart/form-data' }, header)
        }).then(function (res) {
          handleCallback.handleSuccess(res, success, complete, resolve);
        }).catch(function (err) {
          handleCallback.handleFail(err, fail, complete, reject);
        });
      });
    }
    function downloadFile() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$url = _ref2.url,
          url = _ref2$url === undefined ? '' : _ref2$url,
          _ref2$name = _ref2.name,
          name = _ref2$name === undefined ? '' : _ref2$name,
          _ref2$header = _ref2.header,
          header = _ref2$header === undefined ? '' : _ref2$header,
          _ref2$formData = _ref2.formData,
          formData = _ref2$formData === undefined ? {} : _ref2$formData,
          _ref2$success = _ref2.success,
          success = _ref2$success === undefined ? function () {} : _ref2$success,
          _ref2$fail = _ref2.fail,
          fail = _ref2$fail === undefined ? function () {} : _ref2$fail,
          _ref2$complete = _ref2.complete,
          complete = _ref2$complete === undefined ? function () {} : _ref2$complete;
      return new Promise(function (resolve, reject) {
        var reg = /\.(\w+)$/;
        name += url.match(reg) ? '.' + url.match(reg)[1] : '';
        axios({
          url: url,
          method: 'GET',
          responseType: 'blob',
          headers: header,
          data: getFormData(formData)
        }).then(function (response) {
          if (response && response.status === 200) {
            var _url = window.URL.createObjectURL(new Blob([response.data]));
            var link = document.createElement('a');
            link.href = _url;
            link.setAttribute('download', name);
            document.body.appendChild(link);
            link.click();
            handleCallback.handleSuccess(response, success, complete, resolve);
          } else {
            handleCallback.handleFail(response, fail, complete, reject);
          }
        }).catch(function (err) {
          handleCallback.handleFail(err, fail, complete, reject);
        });
      });
    }
    var request$1 = {
      request: request,
      uploadFile: uploadFile,
      downloadFile: downloadFile
    };

    function pageScrollTo() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          scrollTop = _ref.scrollTop,
          _ref$duration = _ref.duration,
          _ref$success = _ref.success,
          success = _ref$success === undefined ? function () {} : _ref$success,
          _ref$fail = _ref.fail,
          fail = _ref$fail === undefined ? function () {} : _ref$fail,
          _ref$complete = _ref.complete,
          complete = _ref$complete === undefined ? function () {} : _ref$complete;
      return new Promise(function (resolve, reject) {
        var container = document.getElementsByClassName('page-container');
        if (container.length > 0) {
          container[container.length - 1].scrollTo(0, scrollTop);
          handleCallback.handleSuccess({ scrollTop: scrollTop }, success, complete, resolve);
        } else {
          handleCallback.handleFail({ errMsg: 'pageScrollTo fail' }, fail, complete, reject);
        }
      });
    }
    var scroll = {
      pageScrollTo: pageScrollTo
    };

    var SelectorQuery = function SelectorQuery() {
      var pages = document.getElementsByClassName('page-wrapper');
      this.__page = pages[pages.length - 1];
      this.__node = null;
      this.__consumed = false;
      this.__missions = [];
    };
    SelectorQuery.prototype.select = function (selector) {
      this.__node = this.__page.querySelector(selector);
      this.__consumed = false;
      return this;
    };
    SelectorQuery.prototype.selectAll = function (selector) {
      this.__node = this.__page.querySelectorAll(selector);
      this.__consumed = false;
      return this;
    };
    SelectorQuery.prototype.selectViewport = function () {
      this.__node = this.__page;
      this.__consumed = false;
      return this;
    };
    SelectorQuery.prototype.boundingClientRect = function () {
      if (!this.__consumed) {
        if (!this.__node) {
          this.__missions.push(null);
        } else {
          if (this.__node instanceof NodeList) {
            this.__missions.push(Array.from(this.__node).map(function (__node) {
              return __node.getBoundingClientRect();
            }));
          } else {
            this.__missions.push(this.__node.getBoundingClientRect());
          }
        }
      }
      this.__consumed = true;
      return this;
    };
    SelectorQuery.prototype.scrollOffset = function () {
      if (!this.__consumed) {
        if (!this.__node) {
          this.__missions.push(null);
        } else {
          if (this.__node instanceof NodeList) {
            this.__missions.push(Array.from(this.__node).map(function (__node) {
              return {
                scrollLeft: __node.scrollLeft,
                scrollTop: __node.scrollTop
              };
            }));
          } else {
            this.__missions.push({
              scrollLeft: this.__node.scrollLeft,
              scrollTop: this.__node.scrollTop
            });
          }
        }
      }
      this.__consumed = true;
      return this;
    };
    SelectorQuery.prototype.exec = function (callback) {
      callback(this.__missions);
      this.__consumed = true;
      this.__missions = [];
      return this;
    };
    function createSelectorQuery() {
      return new SelectorQuery();
    }
    var selectorQuery = {
      createSelectorQuery: createSelectorQuery
    };

    var ERROR_MESSAGE = '不支持 localStorage !';
    function isSupportStorage() {
      if (!window.localStorage) {
        console.log(ERROR_MESSAGE);
        return false;
      }
      return true;
    }
    function setStorage() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          key = _ref.key,
          data = _ref.data,
          _ref$success = _ref.success,
          success = _ref$success === undefined ? function () {} : _ref$success,
          _ref$fail = _ref.fail,
          fail = _ref$fail === undefined ? function () {} : _ref$fail,
          _ref$complete = _ref.complete,
          complete = _ref$complete === undefined ? function () {} : _ref$complete;
      return new Promise(function (resolve, reject) {
        if (!isSupportStorage()) {
          handleFail({ errMsg: ERROR_MESSAGE }, fail, complete, reject);
        } else {
          localStorage.setItem(key, JSON.stringify(data));
          handleSuccess({ key: key, data: data }, success, complete, resolve);
        }
      });
    }
    function setStorageSync(key, data) {
      if (!isSupportStorage()) {
        return;
      }
      localStorage.setItem(key, JSON.stringify(data));
    }
    function getStorage() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          key = _ref2.key,
          _ref2$success = _ref2.success,
          success = _ref2$success === undefined ? function () {} : _ref2$success,
          _ref2$fail = _ref2.fail,
          fail = _ref2$fail === undefined ? function () {} : _ref2$fail,
          _ref2$complete = _ref2.complete,
          complete = _ref2$complete === undefined ? function () {} : _ref2$complete;
      return new Promise(function (resolve, reject) {
        if (!isSupportStorage()) {
          handleFail({ errMsg: ERROR_MESSAGE }, fail, complete, reject);
        } else {
          handleSuccess({ data: JSON.parse(localStorage.getItem(key)) }, success, complete, resolve);
        }
      });
    }
    function getStorageSync(key) {
      if (!isSupportStorage()) {
        return;
      }
      return JSON.parse(localStorage.getItem(key));
    }
    function removeStorage() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          key = _ref3.key,
          _ref3$success = _ref3.success,
          success = _ref3$success === undefined ? function () {} : _ref3$success,
          _ref3$fail = _ref3.fail,
          fail = _ref3$fail === undefined ? function () {} : _ref3$fail,
          _ref3$complete = _ref3.complete,
          complete = _ref3$complete === undefined ? function () {} : _ref3$complete;
      return new Promise(function (resolve, reject) {
        if (!isSupportStorage()) {
          handleFail({ errMsg: ERROR_MESSAGE }, fail, complete, reject);
        } else {
          localStorage.removeItem(key);
          handleSuccess(null, success, complete, resolve);
        }
      });
    }
    function removeStorageSync(key) {
      if (!isSupportStorage()) {
        return;
      }
      localStorage.removeItem(key);
    }
    function clearStorage() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref4$success = _ref4.success,
          success = _ref4$success === undefined ? function () {} : _ref4$success,
          _ref4$fail = _ref4.fail,
          fail = _ref4$fail === undefined ? function () {} : _ref4$fail,
          _ref4$complete = _ref4.complete,
          complete = _ref4$complete === undefined ? function () {} : _ref4$complete;
      return new Promise(function (resolve, reject) {
        if (!isSupportStorage()) {
          handleFail({ errMsg: ERROR_MESSAGE }, fail, complete, reject);
        } else {
          localStorage.clear();
          handleSuccess(null, success, complete, resolve);
        }
      });
    }
    function clearStorageSync() {
      if (!isSupportStorage()) {
        return;
      }
      localStorage.clear();
    }
    function get10KBStr() {
      var str = '0123456789';
      function add(s) {
        s += str;
        if (s.length === 10240) {
          str = s;
          return;
        }
        add(s);
      }
      add(str);
      return str;
    }
    var LIMIT_SIZE_CACHE = -1;
    function getStorageUnusedSize(cb) {
      if (LIMIT_SIZE_CACHE !== -1) {
        cb(LIMIT_SIZE_CACHE);
      } else {
        var _10KBStr = get10KBStr();
        var sum = _10KBStr;
        var id = setInterval(function () {
          sum += _10KBStr;
          try {
            localStorage.removeItem('test');
            localStorage.setItem('test', sum);
          } catch (e) {
            LIMIT_SIZE_CACHE = sum.length / 1024;
            cb(LIMIT_SIZE_CACHE);
            clearInterval(id);
          }
        }, 1);
      }
    }
    function getStorageUsedSize() {
      var values = Object.values(localStorage.valueOf());
      return values.reduce(function (size, value) {
        return value.length;
      }, 0) / 1024;
    }
    async function getStorageInfoSync() {
      var needLimitSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var result = await getStorageInfo({ needLimitSize: needLimitSize });
      return result;
    }
    function getStorageInfo() {
      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref5$needLimitSize = _ref5.needLimitSize,
          needLimitSize = _ref5$needLimitSize === undefined ? false : _ref5$needLimitSize,
          _ref5$success = _ref5.success,
          success = _ref5$success === undefined ? function () {} : _ref5$success,
          _ref5$fail = _ref5.fail,
          fail = _ref5$fail === undefined ? function () {} : _ref5$fail,
          _ref5$complete = _ref5.complete,
          complete = _ref5$complete === undefined ? function () {} : _ref5$complete;
      return new Promise(function (resolve, reject) {
        if (!isSupportStorage()) {
          handleFail({ errMsg: ERROR_MESSAGE }, fail, complete, reject);
          return;
        }
        var result = {
          keys: Object.keys(localStorage),
          currentSize: getStorageUsedSize()
        };
        if (needLimitSize) {
          getStorageUnusedSize(function (unUsedSize) {
            handleSuccess(Object.assign({}, result, {
              limitSize: result.currentSize + unUsedSize
            }), success, complete, resolve);
          });
        } else {
          handleSuccess(result, success, complete, resolve);
        }
      });
    }
    var storage = {
      setStorage: setStorage,
      setStorageSync: setStorageSync,
      getStorage: getStorage,
      getStorageSync: getStorageSync,
      removeStorage: removeStorage,
      removeStorageSync: removeStorageSync,
      clearStorage: clearStorage,
      clearStorageSync: clearStorageSync,
      getStorageInfo: getStorageInfo,
      getStorageInfoSync: getStorageInfoSync
    };

    function getSystemInfo() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$success = _ref.success,
          success = _ref$success === undefined ? function () {} : _ref$success,
          _ref$fail = _ref.fail,
          fail = _ref$fail === undefined ? function () {} : _ref$fail,
          _ref$complete = _ref.complete,
          complete = _ref$complete === undefined ? function () {} : _ref$complete;
      return new Promise(function (resolve, reject) {
        try {
          var md = new MobileDetect(navigator.userAgent || navigator.vendor || window.opera, window.screen.width);
          var res = {
            brand: md.mobile(),
            model: md.phone(),
            pixelRatio: '',
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            windowWidth: window.screen.width,
            windowHeight: window.screen.height,
            statusBarHeight: '',
            language: navigator.language || '',
            version: md.version('Webkit'),
            system: md.os(),
            platform: md.os(),
            fontSizeSetting: '',
            SDKVersion: '',
            storage: '',
            currentBattery: '',
            app: '',
            benchmarkLevel: ''
          };
          handleSuccess(res, success, complete, resolve);
        } catch (e) {
          handleFail({ errMsg: e }, fail, complete, reject);
        }
      });
    }
    function getSystemInfoSync() {
      var md = new MobileDetect(navigator.userAgent || navigator.vendor || window.opera, window.screen.width);
      return {
        brand: md.mobile(),
        model: md.phone(),
        pixelRatio: '',
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        windowWidth: window.screen.width,
        windowHeight: window.screen.height,
        statusBarHeight: '',
        language: navigator.language || '',
        version: md.version('Webkit'),
        system: md.os(),
        platform: md.os(),
        fontSizeSetting: '',
        SDKVersion: '',
        storage: '',
        currentBattery: '',
        app: '',
        benchmarkLevel: ''
      };
    }
    var systemInfo = {
      getSystemInfo: getSystemInfo,
      getSystemInfoSync: getSystemInfoSync
    };

    function vibrateLong() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$success = _ref.success,
          success = _ref$success === undefined ? function () {} : _ref$success,
          _ref$fail = _ref.fail,
          fail = _ref$fail === undefined ? function () {} : _ref$fail,
          _ref$complete = _ref.complete,
          complete = _ref$complete === undefined ? function () {} : _ref$complete;
      return new Promise(function (resolve, reject) {
        if (navigator.vibrate) {
          navigator.vibrate(400);
          handleSuccess({ errMsg: 'vibrateLong success' }, success, complete, resolve);
        } else {
          handleFail({ errMsg: '不支持振动api' }, fail, complete, reject);
        }
      });
    }
    function vibrateShort() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$success = _ref2.success,
          success = _ref2$success === undefined ? function () {} : _ref2$success,
          _ref2$fail = _ref2.fail,
          fail = _ref2$fail === undefined ? function () {} : _ref2$fail,
          _ref2$complete = _ref2.complete,
          complete = _ref2$complete === undefined ? function () {} : _ref2$complete;
      return new Promise(function (resolve, reject) {
        if (navigator.vibrate) {
          navigator.vibrate(100);
          handleSuccess({ errMsg: 'vibrateShort success' }, success, complete, resolve);
        } else {
          handleFail({ errMsg: '不支持振动api' }, fail, complete, reject);
        }
      });
    }
    var vibrate = {
      vibrateLong: vibrateLong,
      vibrateShort: vibrateShort
    };

    var Err = 'ws不存在';
    var socket = null;
    function connectSocket() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$url = _ref.url,
          url = _ref$url === undefined ? '' : _ref$url,
          protocols = _ref.protocols,
          _ref$header = _ref.header,
          header = _ref$header === undefined ? {} : _ref$header,
          _ref$success = _ref.success,
          success = _ref$success === undefined ? function () {} : _ref$success,
          _ref$fail = _ref.fail,
          fail = _ref$fail === undefined ? function () {} : _ref$fail,
          _ref$complete = _ref.complete,
          complete = _ref$complete === undefined ? function () {} : _ref$complete;
      return new Promise(async function (resolve, reject) {
        try {
          if (socket) {
            await closeSocket();
          }
          socket = io(url, {
            extraHeaders: header
          });
          handleSuccess('socket created!', success, complete, resolve);
        } catch (e) {
          handleFail(e, fail, complete, reject);
        }
      });
    }
    function onSocketOpen() {
      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      if (!socket) return callback(Err);
      socket.on('connect', function () {
        return callback(socket.id);
      });
    }
    function closeSocket() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$success = _ref2.success,
          success = _ref2$success === undefined ? function () {} : _ref2$success,
          _ref2$fail = _ref2.fail,
          fail = _ref2$fail === undefined ? function () {} : _ref2$fail,
          _ref2$complete = _ref2.complete,
          complete = _ref2$complete === undefined ? function () {} : _ref2$complete;
      return new Promise(function (resolve, reject) {
        if (!socket) return handleFail(Err, fail, complete, reject);
        socket.close();
        socket = null;
        handleSuccess('socket closed.', success, complete, resolve);
      });
    }
    function sendSocketMessage() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          data = _ref3.data,
          _ref3$success = _ref3.success,
          success = _ref3$success === undefined ? function () {} : _ref3$success,
          _ref3$fail = _ref3.fail,
          fail = _ref3$fail === undefined ? function () {} : _ref3$fail,
          _ref3$complete = _ref3.complete,
          complete = _ref3$complete === undefined ? function () {} : _ref3$complete;
      return new Promise(function (resolve, reject) {
        if (!socket) return handleFail(Err, fail, complete, reject);
        socket.send(data, function (res) {
          handleSuccess(res, success, complete, resolve);
        });
      });
    }
    function onSocketMessage() {
      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      if (!socket) return callback(Err);
      socket.on('message', function (res) {
        return callback(res);
      });
    }
    function onSocketError() {
      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      if (!socket) return callback(Err);
      socket.on('error', function (res) {
        return callback(res);
      });
    }
    function onSocketClose() {
      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      if (!socket) return callback(Err);
      socket.on('disconnect', function (res) {
        return callback(res);
      });
    }
    var ws = {
      connectSocket: connectSocket,
      onSocketOpen: onSocketOpen,
      closeSocket: closeSocket,
      sendSocketMessage: sendSocketMessage,
      onSocketMessage: onSocketMessage,
      onSocketError: onSocketError,
      onSocketClose: onSocketClose
    };

    var share = {
    };

    function notSupport(name) {
      return function () {
        console.warn('Web \u7AEF\u6682\u4E0D\u652F\u6301 ' + name);
      };
    }
    var notSupport$1 = {
      scanCode: notSupport('scanCode'),
      getFileInfo: notSupport('getFileInfo'),
      getSavedFileInfo: notSupport('getSavedFileInfo'),
      getSavedFileList: notSupport('getSavedFileList'),
      removeSavedFile: notSupport('removeSavedFile'),
      saveFile: notSupport('saveFile'),
      getClipboardData: notSupport('getClipboardData'),
      getNetworkType: notSupport('getNetworkType'),
      createShortcut: notSupport('createShortcut'),
      showModal: notSupport('showModal'),
      showToast: notSupport('showToast'),
      hideToast: notSupport('hideToast'),
      showLoading: notSupport('showLoading'),
      hideLoading: notSupport('hideLoading'),
      showActionSheet: notSupport('showActionSheet'),
      previewImage: notSupport('previewImage'),
      share: notSupport('share')
    };

    var interfaceNameSpaces = {
      call: call,
      canIUse: canIUse$1,
      canvas: canvas,
      clipboard: clipboard,
      file: file,
      images: images,
      interaction: interaction,
      location: location,
      previewImage: previewImage,
      request: request$1,
      scroll: scroll,
      selectorQuery: selectorQuery,
      storage: storage,
      systemInfo: systemInfo,
      vibrate: vibrate,
      ws: ws,
      share: share,
      notSupport: notSupport$1
    };
    function extractApis(interfaceNameSpaces) {
      return Object.keys(interfaceNameSpaces).reduce(function (apis, interfaceNameSpaceName) {
        return function () {
          return Object.assign({}, apis, interfaceNameSpaces[interfaceNameSpaceName]);
        };
      }, {});
    }
    var apiData = extractApis(interfaceNameSpaces);
    var more = function more() {
      return extractApis(interfaceNameSpaces);
    };

    var rbeaconType = /click|tap|change|blur|input/i;
    function dispatchEvent$1(e) {
        var eventType = toLowerCase(e.type);
        if (eventType == 'message') {
            return;
        }
        var instance = this.reactInstance;
        if (!instance || !instance.$$eventCached) {
            console.log(eventType, '没有实例');
            return;
        }
        var app = _getApp();
        var target = e.currentTarget;
        var dataset = target.dataset || {};
        var eventUid = dataset[eventType + 'Uid'];
        var fiber = instance.$$eventCached[eventUid + 'Fiber'] || {
            props: {},
            type: 'unknown'
        };
        var value = Object(e.detail).value;
        if (eventType == 'change') {
            if (fiber.props.value + '' == value) {
                return;
            }
        }
        var safeTarget = {
            dataset: dataset,
            nodeName: target.tagName || fiber.type,
            value: value
        };
        if (app && app.onCollectLogs && rbeaconType.test(eventType)) {
            app.onCollectLogs(dataset, eventType, fiber.stateNode);
        }
        Renderer.batchedUpdates(function () {
            try {
                var fn = instance.$$eventCached[eventUid];
                fn && fn.call(instance, createEvent(e, safeTarget));
            } catch (err) {
                console.log(err.stack);
            }
        }, e);
    }
    function createEvent(e, target) {
        var event = Object.assign({}, e);
        if (e.detail) {
            Object.assign(event, e.detail);
        }
        event.stopPropagation = function () {
            console.warn("小程序不支持这方法，请使用catchXXX");
        };
        event.nativeEvent = e;
        event.preventDefault = returnFalse;
        event.target = target;
        event.timeStamp = Date.now();
        var touch = e.touches && e.touches[0];
        if (touch) {
            event.pageX = touch.pageX;
            event.pageY = touch.pageY;
        }
        return event;
    }

    function registerComponent(type, name) {
        type.isMPComponent = true;
        registeredComponents[name] = type;
        var reactInstances = type.reactInstances = [];
        return {
            data: {
                props: {},
                state: {},
                context: {}
            },
            options: type.options,
            attached: function attached() {
                usingComponents[name] = type;
                var uuid = this.dataset.instanceUid || null;
                refreshComponent(reactInstances, this, uuid);
            },
            detached: detachComponent,
            dispatchEvent: dispatchEvent$1
        };
    }

    function onLoad(PageClass, path, query) {
        var app = _getApp();
        app.$$pageIsReady = false;
        app.$$page = this;
        app.$$pagePath = path;
        var container = {
            type: 'page',
            props: {},
            children: [],
            root: true,
            appendChild: noop
        };
        var pageInstance = render(
        createElement(PageClass, {
            path: path,
            query: query,
            isPageComponent: true
        }), container);
        callGlobalHook('onGlobalLoad');
        this.reactContainer = container;
        this.reactInstance = pageInstance;
        pageInstance.wx = this;
        updateMiniApp(pageInstance);
        return pageInstance;
    }
    function onReady() {
        var app = _getApp();
        app.$$pageIsReady = true;
        var el = void 0;
        while (el = delayMounts.pop()) {
            el.fn.call(el.instance);
            el.instance.componentDidMount = el.fn;
        }
        callGlobalHook('onGlobalReady');
    }
    function onUnload() {
        for (var i in usingComponents) {
            var a = usingComponents[i];
            if (a.reactInstances) {
                a.reactInstances.length = 0;
            }
            delete usingComponents[i];
        }
        var root = this.reactContainer;
        var container = root && root._reactInternalFiber;
        if (container) {
            Renderer.updateComponent(container.child, {
                child: null
            }, function () {
                root._reactInternalFiber = null;
                var j = topNodes.indexOf(root);
                if (j !== -1) {
                    topFibers.splice(j, 1);
                    topNodes.splice(j, 1);
                }
            }, true);
        }
        callGlobalHook('onGlobalUnload');
    }

    function registerPageHook(appHooks, pageHook, app, instance, args) {
        for (var i = 0; i < 2; i++) {
            var method = i ? appHooks[pageHook] : pageHook;
            var host = i ? app : instance;
            if (host && host[method] && isFn(host[method])) {
                var ret = host[method](args);
                if (ret !== void 0) {
                    if (ret && ret.then && ret['catch']) {
                        continue;
                    }
                    return ret;
                }
            }
        }
    }

    var appHooks = {
        onShow: 'onGlobalShow',
        onHide: 'onGlobalHide'
    };
    function registerPage(PageClass, path, testObject) {
        PageClass.reactInstances = [];
        var config = {
            data: {},
            dispatchEvent: dispatchEvent$1,
            onLoad: function onLoad$$1(query) {
                onLoad.call(this, PageClass, path, query);
            },
            onReady: onReady,
            onUnload: onUnload
        };
        Array('onShareAppMessage', 'onPageScroll', 'onReachBottom', 'onPullDownRefresh', 'onTabItemTap', 'onResize', 'onShow', 'onHide').forEach(function (hook) {
            config[hook] = function (e) {
                var instance = this.reactInstance,
                    pageHook = hook,
                    app = _getApp(),
                    param = e;
                if (pageHook === 'onShareAppMessage') {
                    if (!instance.onShare) {
                        instance.onShare = instance[pageHook];
                    }
                    var shareObject = instance.onShare && instance.onShare(param);
                    if (!shareObject) {
                        shareObject = app.onGlobalShare && app.onGlobalShare(param);
                    }
                    return shareObject;
                } else if (pageHook === 'onShow') {
                    if (this.options) {
                        instance.props.query = this.options;
                    }
                    param = instance.props.query;
                    app.$$page = this;
                    app.$$pagePath = instance.props.path;
                }
                return registerPageHook(appHooks, pageHook, app, instance, param);
            };
        });
        if (testObject) {
            config.setData = function (obj) {
                config.data = obj;
            };
            config.onLoad();
            return config;
        }
        return config;
    }

    function useState(initValue) {
        return useReducerImpl(null, initValue);
    }
    function useReducer(reducer, initValue, initAction) {
        return useReducerImpl(reducer, initValue, initAction);
    }
    function useEffect(create, deps) {
        return useEffectImpl(create, deps, PASSIVE, 'passive', 'unpassive');
    }
    function useCallback(create, deps) {
        return useCallbackImpl(create, deps);
    }
    function useMemo(create, deps) {
        return useCallbackImpl(create, deps, true);
    }

    var render$1 = DOMRenderer.render,
        findDOMNode = DOMRenderer.findDOMNode;
    var React = getWindow().React = {
        findDOMNode: findDOMNode,
        version: '1.5.0',
        render: render$1,
        hydrate: render$1,
        Fragment: Fragment,
        PropTypes: PropTypes,
        Component: Component,
        createContext: createContext,
        createElement: createElement,
        createFactory: createFactory,
        PureComponent: PureComponent,
        isValidElement: isValidElement,
        toClass: miniCreateClass,
        registerComponent: registerComponent,
        getCurrentPage: getCurrentPage,
        getCurrentPages: _getCurrentPages,
        getApp: _getApp,
        registerPage: registerPage,
        useState: useState,
        useReducer: useReducer,
        useCallback: useCallback,
        useMemo: useMemo,
        useEffect: useEffect,
        useContext: useContext,
        useComponent: useComponent,
        appType: 'h5'
    };
    var apiContainer = {
        __app: {},
        __pages: {}
    };
    registerAPIs(React, apiContainer, more);

    return React;

})));
