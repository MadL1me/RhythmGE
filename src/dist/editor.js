'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('howler'), Howl = _a.Howl, Howler = _a.Howler;
var Vec2 = /** @class */ (function () {
    function Vec2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vec2.Sum = function (v1, v2) {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    };
    Vec2.Substract = function (v1, v2) {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    };
    Vec2.Multiply = function (v1, v2) {
        return new Vec2(v1.x * v2.x, v1.y * v2.y);
    };
    Vec2.Divide = function (v1, v2) {
        return new Vec2(v1.x / v2.x, v1.y / v2.y);
    };
    return Vec2;
}());
var AppSettings = /** @class */ (function () {
    function AppSettings() {
    }
    return AppSettings;
}());
var Transform = /** @class */ (function () {
    function Transform() {
        this._parent = null;
        this._children = new Array();
        this._localPosition = new Vec2(0, 0);
        this.scale = new Vec2(10, 1);
        this.rotation = new Vec2(0, 0);
        this.maxDeviation = new Vec2(100, 100);
        this.maxScale = new Vec2(100, 100);
        this.minScale = new Vec2(1, 1);
    }
    Object.defineProperty(Transform.prototype, "localPosition", {
        get: function () {
            return this._localPosition;
        },
        set: function (value) {
            var oldLocalPos = this._localPosition;
            this._localPosition = value;
            this._children.forEach(function (child) {
                child.position = Vec2.Sum(child.position, oldLocalPos);
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "position", {
        get: function () {
            if (this._parent == null)
                return this._localPosition;
            return Vec2.Sum(this._localPosition, this._parent.position);
        },
        set: function (value) {
            var pos = this.position;
            console.log("position change");
            this.localPosition = Vec2.Substract(pos, value);
        },
        enumerable: false,
        configurable: true
    });
    Transform.prototype.canvasPosition = function () {
        return this.worldToCanvas(this.position);
    };
    Transform.prototype.worldToCanvas = function (worldCoords) {
        var pos = this.position;
        return new Vec2(pos.x - worldCoords.x / this.scale.x, pos.y - worldCoords.x / this.scale.y);
    };
    Transform.prototype.canvasToWorld = function (canvasCoords) {
        var pos = this.position;
        return new Vec2(pos.x - canvasCoords.x * this.scale.x, pos.y - canvasCoords.y * this.scale.y);
    };
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
var Editor = /** @class */ (function () {
    function Editor() {
        this.isPlaying = false;
        this.audioLoaded = false;
        this.scrollingSpeed = 0.2;
        this.resizingSpeed = 0.01;
        this.fastScrollingSpeed = 5;
        this.notes = Array(5).fill(null).map(function () { return Array(5); });
        this.transform = new Transform();
        this.transform.position = new Vec2(100, 0);
        this.canvas = document.getElementById("editor_canvas");
        this.ctx = this.canvas.getContext("2d");
        //this.ctx.translate(0.5,0.5);
        this.topScale = new TopScale(10);
        this.leftScale = new LeftScale(10);
        this.editorGrid = new EditorGrid(this, this.canvas);
        this.audioCanvas = new AudioAmplitudeCanvas();
        this.timestepLine = new TimestepLine();
        this.timestepLine.transform.parent = this.transform;
        this.drawEditor();
    }
    Editor.prototype.changeBeatlinesCount = function (beatLines) {
        this.editorGrid.setBeatLinesCount(beatLines);
        this.drawEditor();
    };
    Editor.prototype.changeBpmValue = function (bpm) {
        this.editorGrid.setBpmValue(bpm);
        this.drawEditor();
    };
    Editor.prototype.updateLoop = function () {
        if (!this.isPlaying)
            return;
        this.drawEditor();
    };
    Editor.prototype.onAudioLoad = function (audioPath) {
        var _this = this;
        this.audioController = new AudioController(this, audioPath, this.timestepLine);
        this.audioController.sound.on("load", function () {
            _this.audioLoaded = true;
            var gridSize = _this.editorGrid.getGridSize();
            _this.notes = Array(gridSize.y).fill(null).map(function () { return Array(gridSize.x); });
            _this.drawEditor();
            _this.editorGrid.initBpmLines();
        });
    };
    Editor.prototype.onPlay = function () {
        if (this.isPlaying == true)
            return;
        this.isPlaying = true;
        this.audioController.play();
    };
    Editor.prototype.onPause = function () {
        if (this.isPlaying == false)
            return;
        this.isPlaying = false;
        this.audioController.sound.pause();
    };
    Editor.prototype.onCanvasScroll = function (mouseDelta, isSpeededUp) {
        var resultedDelta = mouseDelta * this.scrollingSpeed;
        if (isSpeededUp)
            resultedDelta *= this.fastScrollingSpeed;
        this.transform.position = new Vec2(this.transform.position.x + resultedDelta, this.transform.position.y);
        if (this.transform.position.x > this.transform.maxDeviation.x)
            this.transform.position = new Vec2(this.transform.maxDeviation.x, this.transform.position.y);
        console.log(this.transform.position.x);
        this.drawEditor();
    };
    Editor.prototype.onCanvasResize = function (mouseDelta) {
        var resultedDelta = mouseDelta * this.resizingSpeed;
        console.log("resized!!");
        var oldScale = this.transform.scale.x;
        this.transform.scale = new Vec2(this.transform.scale.x - resultedDelta, this.transform.scale.y);
        this.transform.position = new Vec2(this.transform.position.x * this.transform.scale.x / oldScale, this.transform.position.y);
        if (this.transform.scale.x <= this.transform.minScale.x)
            this.transform.scale = new Vec2(this.transform.minScale.x, this.transform.scale.y);
        if (this.transform.scale.x >= this.transform.maxScale.x)
            this.transform.scale = new Vec2(this.transform.maxScale.x, this.transform.scale.y);
        this.drawEditor();
    };
    Editor.prototype.canvasClickHandle = function (event) {
        if (!this.audioLoaded)
            return;
        var rect = this.canvas.getBoundingClientRect();
        var clickX = event.clientX - rect.left - this.transform.position.x;
        var clickY = event.clientY - rect.top - this.transform.position.y;
        var click = new Vec2(clickX, clickY);
        console.log(clickY);
        if (clickY <= this.topScale.height) {
            console.log("Set Music!!!");
            this.audioController.setMusicFromCanvasPosition(click, this);
        }
        var columnNum = Math.round((clickX) / (this.editorGrid.distanceBetweenBeatLines()) - 1);
        var rowNum = Math.round((clickY) / (this.editorGrid.distanceBetweenBpmLines()) - 1);
        if (columnNum < -0.6 || rowNum < -0.6) {
            return;
        }
        console.log(columnNum);
        console.log(rowNum);
        var x = this.editorGrid.bpmLines[columnNum].transform.position.x + this.transform.position.x - this.transform.position.x;
        var y = this.editorGrid.beatLines[rowNum].transform.position.y + this.transform.position.y - this.transform.position.y;
        //console.log(this.editorGrid.distanceBetweenBpmLines);
        //console.log(this.editorGrid.distanceBetweenBeatLines);
        console.log(columnNum + ":" + rowNum);
        console.log(Math.abs(x - clickX) + ":" + Math.abs(y - clickY));
        if (Math.abs(y - clickY) <= 20 && Math.abs(x - clickX) <= 20) {
            //console.log(this.notes[columnNum][rowNum]);
            if (this.notes[columnNum][rowNum] != undefined && this.notes[columnNum][rowNum] != null) {
                console.log("remove timestamp");
                this.notes[columnNum][rowNum] = null;
                this.drawEditor();
            }
            else {
                console.log("add timestamp");
                var note = new Timestamp(x, y, 10);
                note.transform.parent = this.transform;
                this.notes[columnNum][rowNum] = note;
                note.draw(this.canvas);
            }
        }
    };
    Editor.prototype.drawEditor = function () {
        var _this = this;
        //console.log("draw editor")
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#EDEDED';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.editorGrid.draw(this.audioController != null && this.audioController.sound.state() == "loaded", this);
        this.notes.forEach(function (notes) {
            notes.forEach(function (note) {
                if (note != null) {
                    note.draw(_this.canvas);
                }
            });
        });
        this.audioCanvas.draw(this.transform.position);
        this.topScale.draw(this.canvas);
        this.leftScale.draw(this.canvas);
        if (this.isPlaying) {
            this.timestepLine.transform.position = new Vec2(this.transform.scale.x * this.audioController.sound.seek(), this.transform.scale.y);
        }
        this.timestepLine.draw();
    };
    return Editor;
}());
var AudioController = /** @class */ (function () {
    function AudioController(editor, soundPath, timestepLine) {
        var _this = this;
        this.editor = editor;
        this.timestepLine = timestepLine;
        this.sound = new Howl({ src: [soundPath] });
        this.analyser = Howler.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.sound.on("play", function () {
            console.log(_this);
            console.log(_this.soundId);
            _this.sound._soundById(_this.soundId)._node.bufferSource.connect(_this.analyser);
        });
    }
    AudioController.prototype.play = function () {
        this.soundId = this.sound.play();
        console.log(this.soundId);
        console.log(this.analyser);
    };
    AudioController.prototype.setMusicFromCanvasPosition = function (position, editor) {
        this.timestepLine.transform.position = this.editor.transform.canvasToWorld(position);
        editor;
    };
    AudioController.prototype.setMusicFromTimePosition = function () {
    };
    AudioController.prototype.getDomainData = function () {
        var dataArray = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatTimeDomainData(dataArray);
        return dataArray;
    };
    return AudioController;
}());
var AudioAmplitudeCanvas = /** @class */ (function () {
    function AudioAmplitudeCanvas() {
        this.canvas = document.getElementById("audio_amplitude_canvas");
        this.ctx = this.canvas.getContext("2d");
    }
    AudioAmplitudeCanvas.prototype.draw = function (offset) {
        //var 
    };
    return AudioAmplitudeCanvas;
}());
var TimestepLine = /** @class */ (function () {
    function TimestepLine() {
        this.transform = new Transform();
        this.canvas = document.getElementById("editor_canvas");
        this.ctx = this.canvas.getContext("2d");
    }
    TimestepLine.prototype.draw = function () {
        var x = this.transform.position.x;
        if (x >= this.canvas.width)
            x = this.canvas.width - 5;
        if (x <= 0)
            x = 0;
        this.ctx.beginPath();
        this.ctx.fillStyle = "#f7075b";
        this.ctx.moveTo(x, 10);
        this.ctx.lineTo(x - 5, 0);
        this.ctx.lineTo(x + 5, 0);
        this.ctx.fill();
        this.ctx.strokeStyle = "#f7075b";
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
    };
    return TimestepLine;
}());
var Timestamp = /** @class */ (function () {
    function Timestamp(x, y, width) {
        this.transform = new Transform();
        this.transform.position = new Vec2(x, y);
        this.width = width;
    }
    Timestamp.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        var pos = new Vec2(this.transform.position.x, this.transform.position.y);
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.moveTo(pos.x - this.width, pos.y);
        ctx.lineTo(pos.x, pos.y - this.width);
        ctx.lineTo(pos.x + this.width, pos.y);
        ctx.lineTo(pos.x, pos.y + this.width);
        ctx.fill();
    };
    return Timestamp;
}());
var EditorGrid = /** @class */ (function () {
    function EditorGrid(editor, canvas) {
        this.editor = editor;
        this.canvas = canvas;
        this.bpmValue = 60;
        this.beatLinesCount = 5;
        this.bpmLines = [];
        this.beatLines = [];
        this.initGrid();
    }
    EditorGrid.prototype.distanceBetweenBpmLines = function () {
        var soundLength = this.editor.audioController.sound.duration();
        var bpmCount = (soundLength / 60) * this.bpmValue;
        var pixelsPerBeat = soundLength / bpmCount;
        return pixelsPerBeat * this.editor.transform.scale.x;
        //return (this.canvas.width)/(this.bpmValue+1);
    };
    EditorGrid.prototype.distanceBetweenBeatLines = function () {
        return (this.canvas.height) / (this.beatLinesCount + 1);
    };
    EditorGrid.prototype.setBpmValue = function (bpm) {
        this.bpmValue = bpm;
        console.log(bpm);
    };
    EditorGrid.prototype.setBeatLinesCount = function (beatLines) {
        this.beatLinesCount = beatLines;
        console.log(beatLines);
    };
    EditorGrid.prototype.getGridSize = function () {
        return new Vec2(this.bpmValue, this.beatLinesCount);
    };
    EditorGrid.prototype.initGrid = function () {
        for (var i = 0; i < this.beatLinesCount; i++) {
            var beatLine = new BeatLine(i * this.distanceBetweenBeatLines());
            beatLine.transform.parent = this.editor.transform;
            this.beatLines.push(beatLine);
        }
    };
    EditorGrid.prototype.initBpmLines = function () {
        var soundLength = editor.audioController.sound.duration();
        var bpmCount = (soundLength / 60) * this.bpmValue;
        for (var i = 0; i < bpmCount; i++) {
            var bpmLine = new BPMLine(i * this.distanceBetweenBpmLines());
            bpmLine.transform.parent = this.editor.transform;
            this.bpmLines.push(bpmLine);
        }
    };
    EditorGrid.prototype.draw = function (drawBpmLines, editor) {
        var canvas = this.canvas;
        var ctx = canvas.getContext('2d');
        //console.log(distanceBetweenBeatLines);
        //console.log(distanceBetweenBpmLines);
        // for (var i=0; i<this.beatLines.length; i++){ 
        //     this.beatLines[i].moveY((i+1)*this.distanceBetweenBeatLines());
        // }
        this.beatLines.forEach(function (beatLine) {
            if (beatLine.isActive)
                beatLine.draw(canvas);
        });
        if (drawBpmLines) {
            var soundLength = editor.audioController.sound.duration();
            var bpmCount = (soundLength / 60) * this.bpmValue;
            var pixelsPerBeat = soundLength / bpmCount;
            //console.log(this.bpmLines.length);
            // for (var i=0; i<this.bpmLines.length; i++){ 
            //     //console.log("bpm line is pushed");
            //     this.bpmLines[i].moveX(i*scale.x*pixelsPerBeat);
            // }
            this.bpmLines.forEach(function (bpmLine) {
                if (bpmLine.isActive)
                    bpmLine.draw(canvas);
            });
        }
    };
    return EditorGrid;
}());
var BPMLine = /** @class */ (function () {
    function BPMLine(x) {
        this.transform = new Transform();
        this.isActive = true;
        this.transform.position = new Vec2(x, 0);
    }
    BPMLine.prototype.draw = function (canvas) {
        if (!this.isActive)
            return;
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.transform.position.x, 0);
        ctx.lineTo(this.transform.position.x, canvas.height);
        ctx.stroke();
    };
    BPMLine.prototype.activate = function () {
        this.isActive = true;
    };
    BPMLine.prototype.deactivate = function () {
        this.isActive = false;
    };
    return BPMLine;
}());
var CreatableTimestampLine = /** @class */ (function () {
    function CreatableTimestampLine(x) {
        this.transform = new Transform();
    }
    return CreatableTimestampLine;
}());
var BeatLine = /** @class */ (function () {
    function BeatLine(y) {
        this.transform = new Transform();
        this.isActive = true;
        this.transform.position = new Vec2(0, y);
    }
    BeatLine.prototype.draw = function (canvas) {
        console.log("betline draw");
        console.log(this.transform.position);
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(0, -this.transform.position.y);
        ctx.lineTo(canvas.width, -this.transform.position.y);
        ctx.stroke();
    };
    BeatLine.prototype.activate = function () {
        this.isActive = true;
    };
    BeatLine.prototype.deactivate = function () {
        this.isActive = false;
    };
    return BeatLine;
}());
var TopScale = /** @class */ (function () {
    function TopScale(height) {
        this.height = height;
    }
    TopScale.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#A6A6A6';
        ctx.fillRect(0, -5, canvas.width, this.height + 5);
    };
    return TopScale;
}());
var LeftScale = /** @class */ (function () {
    function LeftScale(width) {
        this.width = width;
    }
    LeftScale.prototype.draw = function (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#A6A6A6';
        ctx.fillRect(0, 0, this.width, canvas.height);
    };
    return LeftScale;
}());
var editor = new Editor();
module.exports = editor;
//# sourceMappingURL=editor.js.map