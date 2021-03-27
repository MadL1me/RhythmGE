'use strict';
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
module.exports = /** @class */ (function () {
    function Editor() {
        this.notes = __spreadArrays(Array(10)).map(function (e) { return Array(5); });
        this.canvas = document.getElementById("editor_canvas");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.translate(0.5, 0.5);
        this.topScale = new TopScale(10);
        this.leftScale = new LeftScale(10);
        this.timeline = new Timeline(10, 10, this.canvas);
        this.audioCanvas = new AudioAmplitudeCanvas();
        this.drawEditor();
    }
    Editor.prototype.changeBeatlinesCount = function (beatLines) {
        this.timeline.setBeatLinesCount(beatLines);
        this.drawEditor();
    };
    Editor.prototype.changeBpmValue = function (bpm) {
        this.timeline.setBpmValue(bpm);
        this.drawEditor();
    };
    Editor.prototype.canvasClickHandle = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        var clickX = event.clientX - rect.left;
        var clickY = event.clientY - rect.top;
        var columnNum = Math.round((clickX - this.timeline.offsetX) / (this.timeline.distanceX) - 1);
        var rowNum = Math.round((clickY - this.timeline.offsetY) / (this.timeline.distanceY) - 1);
        if (columnNum < -0.6 || rowNum < -0.6) {
            return;
        }
        var x = this.timeline.bpmLines[columnNum].X;
        var y = this.timeline.beatLines[rowNum].Y;
        console.log(this.timeline.distanceY);
        console.log(this.timeline.distanceX);
        console.log(columnNum + ":" + rowNum);
        console.log(Math.abs(x - clickX) + ":" + Math.abs(y - clickY));
        if (Math.abs(y - clickY) <= 20 && Math.abs(x - clickX) <= 20) {
            console.log(this.notes[columnNum][rowNum]);
            if (this.notes[columnNum][rowNum] != undefined && this.notes[columnNum][rowNum] != null) {
                console.log("remove timestamp");
                this.notes[columnNum][rowNum] = null;
                this.drawEditor();
            }
            else {
                console.log("add timestamp");
                var note = new Timestamp(x, y, 10);
                this.notes[columnNum][rowNum] = note;
                note.draw(this.canvas);
            }
        }
    };
    Editor.prototype.drawEditor = function () {
        var _this = this;
        console.log("draw editor");
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgb(123,123,123)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.topScale.draw(this.canvas);
        this.leftScale.draw(this.canvas);
        this.timeline.draw(this.canvas);
        this.notes.forEach(function (notes) {
            notes.forEach(function (note) {
                if (note != null) {
                    note.draw(_this.canvas);
                }
            });
        });
        this.audioCanvas.draw(1);
    };
    return Editor;
}());
var AudioAmplitudeCanvas = /** @class */ (function () {
    function AudioAmplitudeCanvas() {
    }
    AudioAmplitudeCanvas.prototype.draw = function (scaleX) {
    };
    return AudioAmplitudeCanvas;
}());
var EditorSettings = /** @class */ (function () {
    function EditorSettings() {
    }
    return EditorSettings;
}());
var Timestamp = /** @class */ (function () {
    function Timestamp(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
    }
    Timestamp.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.moveTo(this.x - this.width, this.y);
        ctx.lineTo(this.x, this.y - this.width);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x, this.y + this.width);
        ctx.fill();
    };
    return Timestamp;
}());
var TopScale = /** @class */ (function () {
    function TopScale(height) {
        this.height = height;
    }
    TopScale.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgb(123,32,45)';
        ctx.fillRect(0, 0, canvas.width, this.height);
    };
    return TopScale;
}());
var LeftScale = /** @class */ (function () {
    function LeftScale(width) {
        this.width = width;
    }
    LeftScale.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgb(123,32,45)';
        ctx.fillRect(0, 0, this.width, canvas.height);
    };
    return LeftScale;
}());
var Timeline = /** @class */ (function () {
    function Timeline(offsetX, offsetY, canvas) {
        this.canvas = canvas;
        this.scaleX = 1;
        this.scaleY = 1;
        this.bpmValue = 10;
        this.beatLinesCount = 5;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.timestep = 0;
        this.bpmLines = [];
        this.beatLines = [];
    }
    Object.defineProperty(Timeline.prototype, "distanceX", {
        get: function () {
            console.log(this.bpmValue);
            return (this.canvas.width - this.offsetX) / (this.bpmValue + 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Timeline.prototype, "distanceY", {
        get: function () {
            console.log(this.beatLinesCount);
            return (this.canvas.height - this.offsetY) / (this.beatLinesCount + 1);
        },
        enumerable: false,
        configurable: true
    });
    Timeline.prototype.setBpmValue = function (bpm) {
        this.bpmValue = bpm;
    };
    Timeline.prototype.setBeatLinesCount = function (beatLines) {
        this.beatLinesCount = beatLines;
    };
    Timeline.prototype.draw = function (canv) {
        var canvas = canv;
        var ctx = canvas.getContext('2d');
        this.bpmLines = [];
        this.beatLines = [];
        var distanceX = this.distanceX; //canvas.width/(this.bpmValue+1);
        var distanceY = this.distanceY; //canvas.height/(this.beatLinesCount+1);
        console.log(distanceX);
        console.log(distanceY);
        for (var i = 1; i < canvas.width / (distanceX) - 1; i++) {
            this.bpmLines.push(new BPMLine(this.offsetX, this.offsetY, i * distanceX));
        }
        for (var i = 1; i < canvas.height / (distanceY) - 1; i++) {
            this.beatLines.push(new BeatLine(this.offsetX, this.offsetY, i * distanceY));
        }
        this.bpmLines.forEach(function (bpmLine) {
            bpmLine.draw(canvas);
        });
        this.beatLines.forEach(function (beatLine) {
            beatLine.draw(canvas);
        });
    };
    return Timeline;
}());
var BPMLine = /** @class */ (function () {
    function BPMLine(offsetX, offsetY, x) {
        this.x = x;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
    BPMLine.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.x + this.offsetX, this.offsetY);
        ctx.lineTo(this.x + this.offsetX, canvas.height);
        ctx.stroke();
    };
    Object.defineProperty(BPMLine.prototype, "X", {
        get: function () {
            return this.x + this.offsetX;
        },
        enumerable: false,
        configurable: true
    });
    return BPMLine;
}());
var BeatLine = /** @class */ (function () {
    function BeatLine(offsetX, offsetY, y) {
        this.y = y;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
    BeatLine.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.offsetX, this.y + this.offsetY);
        ctx.lineTo(canvas.width, this.y + this.offsetY);
        ctx.stroke();
    };
    Object.defineProperty(BeatLine.prototype, "Y", {
        get: function () {
            return this.y + this.offsetY;
        },
        enumerable: false,
        configurable: true
    });
    return BeatLine;
}());
var TimestepLine = /** @class */ (function () {
    function TimestepLine(x) {
        this.x = x;
    }
    TimestepLine.prototype.movePosition = function (x) {
        this.x = x;
    };
    TimestepLine.prototype.draw = function (canvas) {
    };
    return TimestepLine;
}());
