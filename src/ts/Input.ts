import { Editor } from "./Editor";
import { Slider, Event, Action } from "./Utils";
import { Vec2 } from "./Vec2";

import $ from 'jquery';

export abstract class Input {
    private static initialized = false;
    private static lastMousePosition = new Vec2(0,0)
    
    static mousePosition = new Vec2(0,0);
    static keysPressed = {};

    static onKeyUp = new Event<any>();
    static onKeyDown = new Event<any>();
    static onMouseDown = new Event<any>();
    static onMouseUp = new Event<any>();
    static onMouseOver = new Event<any>();

    static onWindowResize = new Event<any>();
    static onCanvasWheel = new Event<any>();
    static onMainCanvasMouseClick = new Event<any>();
    static onCanvasHover = new Event<any>();

    static init() {
        if (Input.initialized)
            return;
        
        Input.initialized = true;

        $(window).on('resize', (event) => { Input.onWindowResize.invoke(event); });
        $(window).on('keydown', (event) => { Input.onCanvasKeyDown(event);});
        $(window).on('keyup', (event) => { Input.onCanvasKeyUp(event);});

        $(window).on('mouseup', (event) => {Input.onMouseUp.invoke(event)});
        //$(window).on('mousedown', (event) => { Input.onMouseDown.invoke(event);});
        //$(window).on('mouseup', (event) => {Input.onMouseUp.invoke(event)});

        $('#editor-canvas').on('wheel', (event) => { Input.onCanvasWheel.invoke(event.originalEvent);})
        .on('click', (event) => { Input.onMainCanvasMouseClick.invoke(event);})
        .on('mousemove', (event) => { Input.onCanvHover(event);})

        //.on('mouseup', (event) => {Input.onMouseUp.invoke(event)})
        .on('mousedown', (event) => { Input.onMouseDown.invoke(event);})
        .on('mouseover', (event) => { Input.onMouseOver.invoke(event);});
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
        this.onCanvasHover.invoke(event);
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