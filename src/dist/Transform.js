"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transform = void 0;
var Vec2_1 = require("./Vec2");
var Transform = /** @class */ (function () {
    function Transform() {
        this._parent = null;
        this._children = new Array();
        this._localPosition = new Vec2_1.Vec2(0, 0);
        this._localScale = new Vec2_1.Vec2(1, 1);
        this.maxScale = new Vec2_1.Vec2(1000, 1);
        this.minScale = new Vec2_1.Vec2(1, 1);
    }
    Object.defineProperty(Transform.prototype, "localPosition", {
        get: function () {
            return this._localPosition;
        },
        set: function (value) {
            this._localPosition = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "position", {
        get: function () {
            if (this._parent == null)
                return this._localPosition;
            return Vec2_1.Vec2.Sum(Vec2_1.Vec2.Multiply(this._localPosition, this._parent.scale), this._parent.position);
        },
        set: function (value) {
            if (this._parent == null) {
                this.localPosition = value;
                return;
            }
            var pos = Vec2_1.Vec2.Substract(value, this.parent.position);
            this.localPosition = Vec2_1.Vec2.Divide(pos, this._parent.scale);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "scale", {
        get: function () {
            if (this._parent == null)
                return this._localScale;
            return Vec2_1.Vec2.Multiply(this._localScale, this._parent.scale);
        },
        set: function (value) {
            if (this._parent == null) {
                this.localScale = value;
                return;
            }
            this.localScale = Vec2_1.Vec2.Divide(this._parent.scale, value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "localScale", {
        get: function () {
            return this._localScale;
        },
        set: function (value) {
            this._localScale = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (parent) {
            var _a;
            if (parent == null) {
                parent.removeChild(this);
                this._parent = parent;
                return;
            }
            this._parent = parent;
            (_a = this._parent) === null || _a === void 0 ? void 0 : _a.addChild(this);
            this.position = this.localPosition;
        },
        enumerable: false,
        configurable: true
    });
    Transform.prototype.addChild = function (child) {
        this._children.push(child);
    };
    Transform.prototype.removeChild = function (child) {
        var index = this._children.indexOf(child);
        if (index !== -1) {
            this._children.splice(index, 1);
        }
    };
    return Transform;
}());
exports.Transform = Transform;
