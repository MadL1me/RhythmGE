"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slider = exports.Event = void 0;
var jquery_1 = __importDefault(require("jquery"));
var Event = /** @class */ (function () {
    function Event() {
        this.listeners = [];
    }
    Event.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };
    Event.prototype.removeListener = function (listener) {
        var index = this.listeners.findIndex(listener);
        this.listeners.slice(index, index);
    };
    Event.prototype.invoke = function (data) {
        this.listeners.forEach(function (listener) {
            listener(data);
        });
    };
    return Event;
}());
exports.Event = Event;
var Slider = /** @class */ (function () {
    function Slider(sliderId) {
        var _this = this;
        this.maxValue = 100;
        this.minValue = 0;
        this.onValueChange = new Event();
        this.sliderInput = jquery_1.default('#' + sliderId)[0];
        this.sliderInput.value = '0';
        this.sliderInput.oninput = function (event) {
            _this.setValue(event.target.value);
        };
        this.value = 0;
    }
    Slider.prototype.setMaxValue = function (value) {
        this.maxValue = value;
        this.sliderInput.max = value.toString();
    };
    Slider.prototype.setMinValue = function (value) {
        this.minValue = value;
        this.sliderInput.min = value.toString();
    };
    Slider.prototype.setValue = function (value) {
        this.value = value;
        this.sliderInput.value = value.toString();
        this.onValueChange.invoke(value);
    };
    return Slider;
}());
exports.Slider = Slider;
