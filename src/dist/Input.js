"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = exports.KeyBinding = void 0;
var Utils_1 = require("./Utils/Utils");
var Vec2_1 = require("./Utils/Vec2");
var jquery_1 = __importDefault(require("jquery"));
var KeyBinding = /** @class */ (function () {
    function KeyBinding() {
        this.onBindPress = new Utils_1.Event();
    }
    KeyBinding.prototype.invoke = function () {
        this.onBindPress.invoke(this);
    };
    return KeyBinding;
}());
exports.KeyBinding = KeyBinding;
var Input = /** @class */ (function () {
    function Input() {
    }
    Input.init = function () {
        if (Input.initialized)
            return;
        Input.initialized = true;
        jquery_1.default(window).on('resize', function (event) { return Input.onWindowResize.invoke(event); })
            .on('keydown', function (event) { return Input.onCanvasKeyDown(event); })
            .on('keyup', function (event) { return Input.onCanvasKeyUp(event); })
            .on('mouseup', function (event) { return Input.onMouseUp.invoke(event); })
            .on('mousemove', function (event) { return Input.onHoverWindow.invoke(event); })
            .on('mousedown', function (event) { return Input.onMouseDown.invoke(event); });
        //$(window).on('mousedown', (event) => { Input.onMouseDown.invoke(event);});
        //$(window).on('mouseup', (event) => {Input.onMouseUp.invoke(event)});
        jquery_1.default('#editor-canvas').on('wheel', function (event) { return Input.onWheelCanvas.invoke(event.originalEvent); })
            .on('click', function (event) { Input.onMouseClickCanvas.invoke(event); Input.onMouseAfterCanvasClick.invoke(null); })
            .on('mousemove', function (event) { return Input.onCanvHover(event); })
            //.on('mouseup', (event) => {Input.onMouseUp.invoke(event)})
            .on('mousedown', function (event) { return Input.onMouseDownCanvas.invoke(event); })
            .on('mouseover', function (event) { return Input.onMouseOverCanvas.invoke(event); });
    };
    Input.update = function () {
        this.lastMousePosition = this.mousePosition;
    };
    Input.isMouseMoved = function () {
        return this.lastMousePosition == this.mousePosition;
    };
    Input.registerKeyBinding = function (keyBind) {
        this.keyBindings.push(keyBind);
    };
    Input.checkForKeyBindings = function () {
        var _this = this;
        this.keyBindings.forEach(function (keyBind) {
            for (var i = 0; i < keyBind.keysList.length; i++) {
                var key = keyBind.keysList[i];
                // console.log("Binds key:");
                // console.log(key);
                if (!_this.keysPressed[key])
                    return;
            }
            keyBind.invoke();
        });
    };
    Input.onCanvHover = function (event) {
        this.mousePosition = new Vec2_1.Vec2(event.clientX, event.clientY);
        this.onHoverCanvas.invoke(event);
    };
    Input.onCanvasKeyDown = function (event) {
        if (event.key == 'Alt') {
            console.log("prevent default");
            event.preventDefault();
        }
        console.log('Key pressed' + event.code);
        this.keysPressed[event.code] = true;
        this.onKeyDown.invoke(event.code);
        this.checkForKeyBindings();
    };
    Input.onCanvasKeyUp = function (event) {
        delete this.keysPressed[event.code];
        console.log('Key removed' + event.code);
        this.onKeyUp.invoke(event);
    };
    Input.initialized = false;
    Input.lastMousePosition = new Vec2_1.Vec2(0, 0);
    Input.keyBindings = new Array();
    Input.mousePosition = new Vec2_1.Vec2(0, 0);
    Input.keysPressed = {};
    Input.onKeyUp = new Utils_1.Event();
    Input.onKeyDown = new Utils_1.Event();
    Input.onMouseUp = new Utils_1.Event();
    Input.onMouseDown = new Utils_1.Event();
    Input.onMouseOverCanvas = new Utils_1.Event();
    Input.onMouseDownCanvas = new Utils_1.Event();
    Input.onMouseClickCanvas = new Utils_1.Event();
    Input.onMouseAfterCanvasClick = new Utils_1.Event();
    Input.onHoverCanvas = new Utils_1.Event();
    Input.onWheelCanvas = new Utils_1.Event();
    Input.onHoverWindow = new Utils_1.Event();
    Input.onWindowResize = new Utils_1.Event();
    Input.onKeyBinding = new Utils_1.Event();
    return Input;
}());
exports.Input = Input;
Input.init();
