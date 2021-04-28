"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slider = exports.Event = exports.Utils = void 0;
var jquery_1 = __importDefault(require("jquery"));
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.binaryNearestSearch = function (array, searchValue, useFlooring) {
        if (useFlooring === void 0) { useFlooring = false; }
        var left = 0, right = array.length - 1;
        while (right - left > 1) {
            var middle = Math.floor((right + left) / 2);
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
    };
    Utils.binaryNearestSearchNumber = function (array, searchValue, useFlooring) {
        if (useFlooring === void 0) { useFlooring = false; }
        var left = 0, right = array.length - 1;
        while (right - left > 1) {
            var middle = Math.floor((right + left) / 2);
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
    };
    return Utils;
}());
exports.Utils = Utils;
var Event = /** @class */ (function () {
    function Event() {
        this.listeners = new Array();
    }
    Event.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };
    Event.prototype.removeListener = function (listener) {
        var index = this.listeners.findIndex(function (element) { return listener == element; });
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
        this._maxValue = 100;
        this._minValue = 0;
        this.onValueChange = new Event();
        this.sliderInput = jquery_1.default('#' + sliderId)[0];
        this.sliderInput.value = '0';
        this.sliderInput.oninput = function (event) {
            _this.value = event.target.value;
        };
        this.value = 0;
    }
    Object.defineProperty(Slider.prototype, "maxValue", {
        get: function () {
            return this._maxValue;
        },
        set: function (value) {
            this._maxValue = value;
            this.sliderInput.max = value.toString();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Slider.prototype, "minValue", {
        get: function () {
            return this._minValue;
        },
        set: function (value) {
            this._minValue = value;
            this.sliderInput.min = value.toString();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Slider.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
            this.sliderInput.value = value.toString();
            this.onValueChange.invoke(value);
        },
        enumerable: false,
        configurable: true
    });
    return Slider;
}());
exports.Slider = Slider;
