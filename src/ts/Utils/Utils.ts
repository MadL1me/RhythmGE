import $ from 'jquery';
import { GridElement, ICompareNumberProvider } from '../GridElements';
import { Vec2 } from './Vec2';

export enum Func{ 
    Ceil,
    Floor,
    Round
}

export abstract class Utils {
    
    static binaryNearestSearch(array : Array<ICompareNumberProvider>, searchValue: number, func=Func.Round): number {
        let left = 0, right = array.length-1;

        if (array[0].value > searchValue)
            return 0;
        if (array[array.length-1].value < searchValue)
            return array.length-1

        while(right - left > 1) {
            let middle = Math.floor((right + left) / 2);
    
            if (array[middle].value < searchValue) {
                left = middle;
            }
            else {
                right = middle;
            }
        }
        
        if (func == Func.Round)
            return Math.abs(searchValue - array[left].value)
            < Math.abs(searchValue - array[right].value) ? left : right;
        else if (func == Func.Floor)
            return left;
        else 
            return right;
    }

    static binaryNearestSearchNumber(array : Array<number>, searchValue: number, func=Func.Round): number {
        let left = 0, right = array.length-1;

        if (array[0] > searchValue)
            return 0;
        if (array[array.length-1] < searchValue)
            return array.length-1

        while(right - left > 1) {
            let middle = Math.floor((right + left) / 2);
    
            if (array[middle] < searchValue) {
                left = middle;
            }
            else {
                right = middle;
            }
        }
        
        if (func == Func.Round)
            return Math.abs(searchValue - array[left])
            < Math.abs(searchValue - array[right]) ? left : right;
        else if (func == Func.Floor)
            return left;
        else 
            return right;
    }

    static isOutOfCanvasBounds(pos: Vec2, canvas: HTMLCanvasElement): boolean {
        return (!(pos.x > canvas.width || pos.y > canvas.height ||
                  pos.x < 0 || pos.y < 0))
    }
}

export class EventVar<T> {
    private _value: T;

    readonly onValueChange = new Event<T>();

    constructor(initialValue: T) {
        this._value = initialValue;
    }

    get value() {
        return this._value;
    }

    set value(value: T) {
        this._value = value;
        this.onValueChange.invoke(value);
    }
}

export type Action<T> = (item: T) => void;

export type EmptyAction = () => void;

export class Event<T> {
    private listeners = new Array<Action<T>>();
    private _preventOnce: boolean = false;
    private _preventFiring: boolean = false;
    private _id: number = -1;

    addListener(listener: Action<T>): number {
        this.listeners.push(listener)
        this._id++;
        return this._id;
    }

    removeListener(id: number) {
        this.listeners.splice(id,1);
    }   

    invoke(data: T) {
        if (this._preventFiring)
            return;
        
        this.listeners.forEach(listener => {
            if (this._preventOnce || this._preventFiring) {
                this._preventOnce = false;
                return;
            }
            listener(data);
        });
    }

    preventFiring() {
        this._preventFiring = true;
    }

    allowFiring() {
        this._preventFiring = false;
    }

    preventFiringEventOnce() {
        this._preventOnce = true;
    }

    allowEventFiringOnce() {
        this._preventOnce = false;
    }
}

export class Slider {
    
    private _maxValue: number = 100;
    private _minValue: number = 0;
    private _value: number
    private sliderInput: HTMLInputElement;
    
    onValueChange = new Event<number>();

    constructor(sliderId: string) {
        this.sliderInput = $('#' + sliderId)[0] as HTMLInputElement;
        this.sliderInput.value = '0';
        this.sliderInput.oninput = (event : any) => {
            this.value = event.target.value;
        };
        this.value = 0;
    }

    set maxValue(value: number) {
        this._maxValue = value;
        this.sliderInput.max = value.toString();
    }

    get maxValue() {
        return this._maxValue;
    }

    set minValue(value: number) {
        this._minValue = value;
        this.sliderInput.min = value.toString();
    }

    get minValue() {
        return this._minValue;
    }

    get value() : number { 
        return this._value;
    }

    set value(value: number) {
        this._value = value;
        this.sliderInput.value = value.toString();
        this.onValueChange.invoke(value);
    }
}