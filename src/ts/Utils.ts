import $ from 'jquery';

export class Event {
    private listeners = [];

    addListener(listener: any) {
        this.listeners.push(listener)
    }

    removeListener(listener: any) {
        var index = this.listeners.findIndex(listener);
        this.listeners.slice(index,index);
    }   

    invoke(data: any) {
        this.listeners.forEach(listener => {
            listener(data);
        });
    }
}

export class Slider {
    
    maxValue: number = 100;
    minValue: number = 0;
    value: number
    sliderInput: HTMLInputElement;
    onValueChange = new Event();

    constructor(sliderId: string) {
        this.sliderInput = $('#' + sliderId)[0] as HTMLInputElement;
        this.sliderInput.value = '0';
        this.sliderInput.oninput = (event : any) => {
            this.setValue(event.target.value);
        };
        this.value = 0;
    }

    setMaxValue(value: number) {
        this.maxValue = value;
        this.sliderInput.max = value.toString();
    }

    setMinValue(value: number) {
        this.minValue = value;
        this.sliderInput.min = value.toString();
    }

    setValue(value: number) {
        this.value = value;
        this.sliderInput.value = value.toString();
        this.onValueChange.invoke(value);
    }
}