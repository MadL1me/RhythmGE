import $ from 'jquery';
import { GridElement, ICompareNumberProvider } from './GridElements';

export abstract class Utils {
    
    static binaryNearestSearch(array : Array<ICompareNumberProvider>, searchValue: number, useFlooring=false): number {
        let left = 0, right = array.length-1;

        while(right - left > 1) {
            let middle = Math.floor((right + left) / 2);
    
            if (array[middle].value < searchValue) {
                left = middle;
            }
            else {
                right = middle;
            }
        }
        
        if (!useFlooring)
            return Math.abs(searchValue - array[left].value)
            < Math.abs(searchValue - array[right].value) ? left : right;
        
        return left;
    }

    static binaryNearestSearchNumber(array : Array<number>, searchValue: number, useFlooring=false): number {
        let left = 0, right = array.length-1;

        while(right - left > 1) {
            let middle = Math.floor((right + left) / 2);
    
            if (array[middle] < searchValue) {
                left = middle;
            }
            else {
                right = middle;
            }
        }
        
        if (!useFlooring)
            return Math.abs(searchValue - array[left])
            < Math.abs(searchValue - array[right]) ? left : right;
        
        return left;
    }
}

export type Action<T> = (item: T) => void;

export type EmptyAction = () => void;

export class Event<T> {
    private listeners = new Array<Action<T>>();

    addListener(listener: Action<T>) {
        this.listeners.push(listener)
    }

    removeListener(listener: Action<T>) {
        var index = this.listeners.findIndex((element)=>{ return listener==element; });
        this.listeners.slice(index,index);
    }   

    invoke(data: T) {
        this.listeners.forEach(listener => {
            listener(data);
        });
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