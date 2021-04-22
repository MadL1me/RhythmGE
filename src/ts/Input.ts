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
    static onWindowResize = new Event<any>();
    static onCanvasWheel = new Event<any>();
    static onCanvasResize = new Event<any>();
    static onMouseClick = new Event<any>();

    static init() {
        if (Input.initialized)
            return;
        
        Input.initialized = true;

        $(window).on('resize', (event) => { Input.onWindowResize.invoke(event); });
        $(window).on('keydown', (event) => { Input.onCanvasKeyDown(event);});
        $(window).on('keyup', (event) => { Input.onCanvasKeyUp(event);});

        $('#editor-canvas').on('wheel', (event) => { Input.onCanvasWheel.invoke(event.originalEvent);})
        .on('click', (event) => { Input.onMouseClick.invoke(event);})
        .on('mousemove', (event) => { Input.onCanvasHover(event);});
    }

    static update() {
        this.lastMousePosition = this.mousePosition;
    }

    static isMouseMoved() : boolean {
        return this.lastMousePosition == this.mousePosition;
    }

    private static onCanvasHover(event) {
        this.mousePosition = new Vec2(event.clientX, event.clientY);
    }

    private static onCanvasKeyDown(event) {
        if (event.key == 'Alt') {
            console.log("prevent default");
            event.preventDefault();
        }

        this.keysPressed[event.key] = true;
    }

    private static onCanvasKeyUp(event) {
        delete this.keysPressed[event.key];
        console.log('Key removed' + event.key);
        Input.onKeyUp.invoke(event);
    }

    private static onCanvasWheelEvent(event) {
        Input.onCanvasWheel.invoke(event);
    }
}

Input.init();