import { Editor } from "./Editor";
import { Slider, Event, Action } from "./Utils/Utils";
import { Vec2 } from "./Utils/Vec2";

import $ from 'jquery';

export class KeyBinding {
    keysList: Array<string>;
    onBindPress = new Event<KeyBinding>();

    invoke() {
        this.onBindPress.invoke(this);
    }
}

export abstract class Input {
    private static initialized = false;
    private static lastMousePosition = new Vec2(0,0)
    private static keyBindings = new Array<KeyBinding>();

    static mousePosition = new Vec2(0,0);
    static keysPressed = {};

    static onKeyUp = new Event<JQuery.KeyUpEvent>();
    static onKeyDown = new Event<JQuery.KeyDownEvent>();
    
    static onMouseUp = new Event<JQuery.MouseUpEvent>();
    static onMouseDown = new Event<JQuery.MouseDownEvent>();

    static onMouseOverCanvas = new Event<JQuery.MouseOverEvent>();
    static onMouseDownCanvas = new Event<JQuery.MouseDownEvent>();
    static onMouseClickCanvas = new Event<JQuery.ClickEvent>();
    static onMouseAfterCanvasClick = new Event<any>();
    static onHoverCanvas = new Event<JQuery.MouseMoveEvent>();
    static onWheelCanvas = new Event<any>();
   
    static onHoverWindow = new Event<JQuery.MouseMoveEvent>();
    static onWindowResize = new Event<JQuery.ResizeEvent>();

    static onKeyBinding = new Event<KeyBinding>();

    static init() {
        if (Input.initialized)
            return;
        
        Input.initialized = true;

        $(window).on('resize', event => Input.onWindowResize.invoke(event))
        .on('keydown', event => Input.onCanvasKeyDown(event))
        .on('keyup', event => Input.onCanvasKeyUp(event))
        .on('mouseup', event => Input.onMouseUp.invoke(event))
        .on('mousemove', event => Input.onHoverWindow.invoke(event))
        .on('mousedown', event => Input.onMouseDown.invoke(event));

        //$(window).on('mousedown', (event) => { Input.onMouseDown.invoke(event);});
        //$(window).on('mouseup', (event) => {Input.onMouseUp.invoke(event)});

        $('#editor-canvas').on('wheel', event => Input.onWheelCanvas.invoke(event.originalEvent))
        .on('click', (event) => { Input.onMouseClickCanvas.invoke(event); Input.onMouseAfterCanvasClick.invoke(null);})
        .on('mousemove', event => Input.onCanvHover(event))

        //.on('mouseup', (event) => {Input.onMouseUp.invoke(event)})
        .on('mousedown', event => Input.onMouseDownCanvas.invoke(event))
        .on('mouseover', event => Input.onMouseOverCanvas.invoke(event));
    }

    static update() {
        this.lastMousePosition = this.mousePosition;
    }

    static isMouseMoved() : boolean {
        return this.lastMousePosition == this.mousePosition;
    }

    static registerKeyBinding(keyBind: KeyBinding) {
        this.keyBindings.push(keyBind);
    }

    private static checkForKeyBindings() {
        this.keyBindings.forEach((keyBind) => {
            for(let i = 0; i<keyBind.keysList.length; i++) {
                let key = keyBind.keysList[i];
                // console.log("Binds key:");
                // console.log(key);
                if (!this.keysPressed[key])
                    return;
            }
            keyBind.invoke();
        });
    }

    private static onCanvHover(event) {
        this.mousePosition = new Vec2(event.clientX, event.clientY);
        this.onHoverCanvas.invoke(event);
    }

    private static onCanvasKeyDown(event) {
        if (event.key == 'Alt') {
            console.log("prevent default");
            event.preventDefault();
        }

        console.log('Key pressed' + event.code);

        this.keysPressed[event.code] = true;
        this.onKeyDown.invoke(event.code);
        this.checkForKeyBindings();
    }

    private static onCanvasKeyUp(event) {
        delete this.keysPressed[event.code];
        console.log('Key removed' + event.code);
        this.onKeyUp.invoke(event);
    }
}

Input.init();