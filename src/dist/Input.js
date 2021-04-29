"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
var Utils_1 = require("./Utils");
var Vec2_1 = require("./Vec2");
var jquery_1 = __importDefault(require("jquery"));
var Input = /** @class */ (function () {
    function Input() {
    }
    Input.init = function () {
        if (Input.initialized)
            return;
        Input.initialized = true;
        jquery_1.default(window).on('resize', function (event) { Input.onWindowResize.invoke(event); })
            .on('keydown', function (event) { Input.onCanvasKeyDown(event); })
            .on('keyup', function (event) { Input.onCanvasKeyUp(event); })
            .on('mouseup', function (event) { Input.onMouseUp.invoke(event); })
            .on('mousemove', function (event) { Input.onHoverWindow.invoke(event); });
        //$(window).on('mousedown', (event) => { Input.onMouseDown.invoke(event);});
        //$(window).on('mouseup', (event) => {Input.onMouseUp.invoke(event)});
        jquery_1.default('#editor-canvas').on('wheel', function (event) { Input.onWheelCanvas.invoke(event.originalEvent); })
            .on('click', function (event) { Input.onMouseClickCanvas.invoke(event); })
            .on('mousemove', function (event) { Input.onCanvHover(event); })
            //.on('mouseup', (event) => {Input.onMouseUp.invoke(event)})
            .on('mousedown', function (event) { Input.onMouseDownCanvas.invoke(event); })
            .on('mouseover', function (event) { Input.onMouseOverCanvas.invoke(event); });
    };
    Input.update = function () {
        this.lastMousePosition = this.mousePosition;
    };
    Input.isMouseMoved = function () {
        return this.lastMousePosition == this.mousePosition;
    };
    Input.onCanvasMouseButtonDown = function () {
    };
    Input.onCanvasMouseUpButton = function () {
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
        this.keysPressed[event.code] = true;
        console.log('Key pressed' + event.code);
        Input.onKeyDown.invoke(event.code);
    };
    Input.onCanvasKeyUp = function (event) {
        delete this.keysPressed[event.code];
        console.log('Key removed' + event.code);
        Input.onKeyUp.invoke(event);
    };
    Input.initialized = false;
    Input.lastMousePosition = new Vec2_1.Vec2(0, 0);
    Input.mousePosition = new Vec2_1.Vec2(0, 0);
    Input.keysPressed = {};
    Input.onKeyUp = new Utils_1.Event();
    Input.onKeyDown = new Utils_1.Event();
    Input.onMouseUp = new Utils_1.Event();
    Input.onMouseDown = new Utils_1.Event();
    Input.onMouseOverCanvas = new Utils_1.Event();
    Input.onMouseDownCanvas = new Utils_1.Event();
    Input.onMouseClickCanvas = new Utils_1.Event();
    Input.onHoverCanvas = new Utils_1.Event();
    Input.onWheelCanvas = new Utils_1.Event();
    Input.onHoverWindow = new Utils_1.Event();
    Input.onWindowResize = new Utils_1.Event();
    return Input;
}());
exports.Input = Input;
Input.init();
