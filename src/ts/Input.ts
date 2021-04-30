import { Editor } from "./Editor";
import { Slider, Event, Action } from "./Utils";
import { Vec2 } from "./Vec2";

import $ from 'jquery';

export abstract class Input {
    private static initialized = false;
    private static lastMousePosition = new Vec2(0,0)
    
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

    static init() {
        if (Input.initialized)
            return;
        
        Input.initialized = true;

        $(window).on('resize', (event) => { Input.onWindowResize.invoke(event); })
        .on('keydown', (event) => { Input.onCanvasKeyDown(event);})
        .on('keyup', (event) => { Input.onCanvasKeyUp(event);})
        .on('mouseup', (event) => {Input.onMouseUp.invoke(event)})
        .on('mousemove', (event) => {Input.onHoverWindow.invoke(event);});
        
        //$(window).on('mousedown', (event) => { Input.onMouseDown.invoke(event);});
        //$(window).on('mouseup', (event) => {Input.onMouseUp.invoke(event)});

        $('#editor-canvas').on('wheel', (event) => { Input.onWheelCanvas.invoke(event.originalEvent);})
        .on('click', (event) => { Input.onMouseClickCanvas.invoke(event); this.onMouseAfterCanvasClick.invoke(null);})
        .on('mousemove', (event) => { Input.onCanvHover(event);})

        //.on('mouseup', (event) => {Input.onMouseUp.invoke(event)})
        .on('mousedown', (event) => { Input.onMouseDownCanvas.invoke(event);})
        .on('mouseover', (event) => { Input.onMouseOverCanvas.invoke(event);});
    }

    static update() {
        this.lastMousePosition = this.mousePosition;
    }

    static isMouseMoved() : boolean {
        return this.lastMousePosition == this.mousePosition;
    }

    private static onCanvasMouseButtonDown() {

    }

    private static onCanvasMouseUpButton() {

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

        this.keysPressed[event.code] = true;
        console.log('Key pressed' + event.code);
        Input.onKeyDown.invoke(event.code);
    }

    private static onCanvasKeyUp(event) {
        delete this.keysPressed[event.code];
        console.log('Key removed' + event.code);
        Input.onKeyUp.invoke(event);
    }
}

Input.init();