"use strict";
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
var Viewport = /** @class */ (function () {
    function Viewport() {
        this.maxDeviation = new Vec2(100, 100);
    }
    Viewport.prototype.worldToCanvas = function (worldCoords) {
        var pos = this.position;
        return new Vec2(worldCoords.x - pos.x, worldCoords.y - pos.y);
    };
    Viewport.prototype.canvasToWorld = function (canvasCoords) {
        var pos = this.position;
        return new Vec2(100, 0);
    };
    Viewport.prototype.canvasToSongTime = function (canvasCoords) {
        var pos = this.position;
        return new Vec2((canvasCoords.x - pos.x), (canvasCoords.y - pos.y));
    };
    return Viewport;
}());
var Transform = /** @class */ (function () {
    function Transform() {
        this._parent = null;
        this._children = new Array();
        this._localPosition = new Vec2(0, 0);
        this.scale = new Vec2(10, 1);
        this.rotation = new Vec2(0, 0);
        this.maxScale = new Vec2(100, 100);
        this.minScale = new Vec2(5, 5);
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
            return Vec2.Sum(Vec2.Multiply(this._localPosition, this._parent.scale), this._parent.position);
        },
        set: function (value) {
            if (this.parent == null) {
                this.localPosition = value;
                return;
            }
            var pos = Vec2.Substract(value, this.position);
            console.log("position change");
            this.localPosition = Vec2.Divide(Vec2.Sum(this.localPosition, pos), this._parent.scale);
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
        this.isFollowingLine = false;
        this.isUsingClaps = false;
        this.audioLoaded = false;
        this.scrollingSpeed = 0.2;
        this.resizingSpeed = 0.01;
        this.fastScrollingSpeed = 5;
        this.notes = Array(5).fill(null).map(function () { return Array(5); });
        this.transform = new Transform();
        this.viewport = new Viewport();
        this.viewport.gridTransform = this.transform;
        this.viewport.position = new Vec2(100, 0);
        this.transform.position = new Vec2(0, 0);
        this.canvas = document.getElementById("editor_canvas");
        this.ctx = this.canvas.getContext("2d");
        //this.ctx.translate(0.5,0.5);
        this.topScale = new TopScale(10);
        this.leftScale = new LeftScale(10);
        this.editorGrid = new EditorGrid(this, this.canvas);
        this.audioCanvas = new AudioAmplitudeCanvas(this);
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
    Editor.prototype.debug = function () {
        console.log(this.audioController.bufferSource.buffer.sampleRate);
        console.log(this.audioController.bufferSource.buffer);
        console.log(this.audioController.bufferSource);
        console.log(this.audioController.sound._soundById(this.audioController.soundId)._node);
        console.log(this.audioController.bufferSource.buffer.getChannelData(0));
        console.log(this.audioController.analyser);
    };
    Editor.prototype.updateLoop = function () {
        if (!this.isPlaying)
            return;
        this.drawEditor();
    };
    Editor.prototype.onAudioLoad = function (audioPath) {
        var _this = this;
        this.audioController = new AudioController(this, audioPath, this.timestepLine);
        this.audioController.timestepLine.transform.parent = this.transform;
        this.audioController.sound.on("load", function () {
            _this.audioLoaded = true;
            var gridSize = _this.editorGrid.getGridSize();
            _this.notes = Array(gridSize.y).fill(null).map(function () { return Array(gridSize.x); });
            _this.editorGrid.initBpmLines();
            _this.drawEditor();
        });
    };
    Editor.prototype.onUseClaps = function () {
    };
    Editor.prototype.onLineFollowingChange = function () {
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
        this.viewport.position = new Vec2(this.viewport.position.x + resultedDelta, this.viewport.position.y);
        if (this.viewport.position.x > this.viewport.maxDeviation.x)
            this.viewport.position = new Vec2(this.viewport.maxDeviation.x, this.viewport.position.y);
        console.log(this.viewport.position.x);
        this.drawEditor();
    };
    Editor.prototype.onWindowResize = function (event) {
        console.log(event);
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        this.canvas.setAttribute('width', (w - 100).toString());
        this.canvas.setAttribute('height', (h / 2).toString());
        this.editorGrid.initGrid();
        this.audioCanvas.onWindowResize(event);
        this.drawEditor();
    };
    Editor.prototype.onCanvasResize = function (mouseDelta) {
        var resultedDelta = mouseDelta * this.resizingSpeed;
        console.log("resized!!");
        var oldScale = this.transform.scale.x;
        this.transform.scale = new Vec2(this.transform.scale.x - resultedDelta, this.transform.scale.y);
        var scaleIsChanged = true;
        if (this.transform.scale.x <= this.transform.minScale.x) {
            this.transform.scale = new Vec2(this.transform.minScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }
        if (this.transform.scale.x >= this.transform.maxScale.x) {
            this.transform.scale = new Vec2(this.transform.maxScale.x, this.transform.scale.y);
            scaleIsChanged = false;
        }
        this.viewport.position = this.viewport.canvasToWorld(new Vec2(this.canvas.width / 2, 0));
        this.drawEditor();
    };
    Editor.prototype.canvasMouseDownHandle = function (event) {
    };
    Editor.prototype.canvasClickHandle = function (event) {
        if (!this.audioLoaded)
            return;
        var rect = this.canvas.getBoundingClientRect();
        var clickX = event.clientX - rect.left;
        var clickY = event.clientY - rect.top;
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
        console.log(columnNum + ":" + rowNum);
        console.log(Math.abs(x - clickX) + ":" + Math.abs(y - clickY));
        if (Math.abs(y - clickY) <= 20 && Math.abs(x - clickX) <= 20) {
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
        this.audioCanvas.draw();
        this.topScale.draw(this.canvas);
        this.leftScale.draw(this.canvas);
        if (this.isPlaying) {
            this.timestepLine.transform.localPosition = new Vec2(this.audioController.sound.seek(), 0);
        }
        this.timestepLine.draw(this.viewport);
    };
    return Editor;
}());
var AudioController = /** @class */ (function () {
    function AudioController(editor, soundPath, timestepLine) {
        var _this = this;
        this.editor = editor;
        this.timestepLine = timestepLine;
        this.timestepLine.transform.parent = this.editor.transform;
        this.sound = new Howl({ src: [soundPath] });
        this.analyser = Howler.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.sound.on("play", function () {
            console.log(_this);
            console.log(_this.soundId);
            _this.bufferSource = _this.sound._soundById(_this.soundId)._node.bufferSource;
            _this.sound._soundById(_this.soundId)._node.bufferSource.connect(_this.analyser);
            editor.audioCanvas.onAudioLoad(_this);
        });
        this.sound.on("seek", function () {
            _this.bufferSource = _this.sound._soundById(_this.soundId)._node.bufferSource;
            _this.sound._soundById(_this.soundId)._node.bufferSource.connect(_this.analyser);
            editor.audioCanvas.onAudioLoad(_this);
        });
    }
    AudioController.prototype.play = function () {
        this.soundId = this.sound.play();
        console.log(this.soundId);
        console.log(this.analyser);
    };
    AudioController.prototype.playClapSound = function () {
    };
    AudioController.prototype.setMusicFromCanvasPosition = function (position, editor) {
        console.log(position);
        var second = editor.viewport.canvasToSongTime(position).x / editor.transform.scale.x;
        this.sound.seek([second]);
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
    function AudioAmplitudeCanvas(editor) {
        this.amplitudeData = new Array();
        this.sampleRate = 48000;
        this.samplesPerArrayValue = this.sampleRate / 10;
        this.editor = editor;
        this.audio = editor.audioController;
        this.canvas = document.getElementById("audio_amplitude_canvas");
        this.ctx = this.canvas.getContext("2d");
    }
    AudioAmplitudeCanvas.prototype.onWindowResize = function (event) {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        this.canvas.setAttribute('width', (w - 100).toString());
        this.canvas.setAttribute('height', (h / 8).toString());
    };
    AudioAmplitudeCanvas.prototype.onAudioLoad = function (audio) {
        this.data = audio.bufferSource.buffer.getChannelData(0);
        this.calculateAmplitudeArray();
    };
    AudioAmplitudeCanvas.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.data == undefined || this.data == null)
            return;
        if (this.amplitudeData == undefined || this.amplitudeData == null)
            return;
        console.log("DRAWING CANVAS!!!");
        for (var i = 0; i < this.amplitudeData.length; i++) {
            var interpolated = this.amplitudeData[i] * this.canvas.height;
            this.ctx.strokeStyle = "black";
            this.ctx.beginPath();
            this.ctx.moveTo(i + this.editor.viewport.position.x, 0);
            this.ctx.lineTo(i + this.editor.viewport.position.x, interpolated);
            this.ctx.stroke();
        }
    };
    AudioAmplitudeCanvas.prototype.calculateAmplitudeArray = function () {
        for (var i = 0; i < this.data.length; i += this.samplesPerArrayValue) {
            var value = this.getAvarageAtRange(i, i + this.samplesPerArrayValue);
            this.amplitudeData.push(value);
        }
        console.log(this.amplitudeData);
    };
    AudioAmplitudeCanvas.prototype.getAmplitudeBarWitdh = function () {
        return this.editor.transform.scale.x * this.samplesPerArrayValue / this.sampleRate;
    };
    AudioAmplitudeCanvas.prototype.getMaxAtRange = function (from, to) {
        var max = -10;
        for (var i = from; i < to && i < this.data.length; i++) {
            if (Math.abs(this.data[i]) >= max) {
                max = Math.abs(this.data[i]);
            }
        }
        return max;
    };
    AudioAmplitudeCanvas.prototype.getAvarageAtRange = function (from, to) {
        var result = 0;
        for (var i = from; i < to && i < this.data.length; i++) {
            result += Math.abs(this.data[i]);
        }
        result = result / (to - from);
        return result;
    };
    return AudioAmplitudeCanvas;
}());
var TimestepLine = /** @class */ (function () {
    function TimestepLine() {
        this.transform = new Transform();
        this.canvas = document.getElementById("editor_canvas");
        this.ctx = this.canvas.getContext("2d");
    }
    TimestepLine.prototype.draw = function (view) {
        var x = this.transform.position.x + view.position.x;
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
        this.beatLinesRange = new Vec2(1, 20);
        this.bpmRange = new Vec2(1, 10000);
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
    EditorGrid.prototype.setBpmValue = function (event) {
        var bpm = parseInt(event.target.value);
        bpm < this.bpmRange.x ? bpm = this.bpmRange.x : bpm = bpm;
        bpm > this.bpmRange.y ? bpm = this.bpmRange.y : bpm = bpm;
        this.bpmValue = bpm;
        console.log(bpm);
    };
    EditorGrid.prototype.setBeatLinesCount = function (event) {
        var beatLines = parseInt(event.target.value);
        beatLines < this.beatLinesRange.x ? beatLines = this.beatLinesRange.x : beatLines = beatLines;
        beatLines > this.beatLinesRange.y ? beatLines = this.beatLinesRange.y : beatLines = beatLines;
        this.beatLinesCount = beatLines;
        this.initGrid();
    };
    EditorGrid.prototype.getGridSize = function () {
        return new Vec2(this.bpmValue, this.beatLinesCount);
    };
    EditorGrid.prototype.initGrid = function () {
        for (var i = 0; i < this.beatLinesCount; i++) {
            if (i + 1 > this.beatLines.length) {
                var beatLine = new BeatLine((i + 1) * this.distanceBetweenBeatLines(), this.editor.transform);
                this.beatLines.push(beatLine);
            }
            this.beatLines[i].transform.position = new Vec2(0, (i + 1) * this.distanceBetweenBeatLines());
            this.beatLines[i].activate();
        }
        for (var i = this.beatLinesCount; i < this.beatLines.length; i++) {
            this.beatLines[i].deactivate();
        }
    };
    EditorGrid.prototype.initBpmLines = function () {
        var soundLength = editor.audioController.sound.duration();
        var bpmCount = (soundLength / 60) * this.bpmValue;
        for (var i = 0; i < bpmCount; i++) {
            var bpmLine = new BPMLine(i, this.editor.transform);
            this.bpmLines.push(bpmLine);
        }
    };
    EditorGrid.prototype.draw = function (drawBpmLines, editor) {
        var canvas = this.canvas;
        var ctx = canvas.getContext('2d');
        this.beatLines.forEach(function (beatLine) {
            if (beatLine.isActive)
                beatLine.draw(editor.viewport, canvas);
        });
        if (drawBpmLines) {
            var soundLength = editor.audioController.sound.duration();
            var bpmCount = (soundLength / 60) * this.bpmValue;
            var pixelsPerBeat = soundLength / bpmCount;
            this.bpmLines.forEach(function (bpmLine) {
                if (bpmLine.isActive)
                    bpmLine.draw(editor.viewport, canvas);
            });
        }
    };
    return EditorGrid;
}());
var BPMLine = /** @class */ (function () {
    function BPMLine(x, parent) {
        this.transform = new Transform();
        this.isActive = true;
        this.transform.parent = parent;
        this.transform.localPosition = new Vec2(x, 0);
    }
    BPMLine.prototype.draw = function (view, canvas) {
        if (!this.isActive)
            return;
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.transform.position.x + view.position.x, 0);
        ctx.lineTo(this.transform.position.x + view.position.x, canvas.height);
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
    function BeatLine(y, parent) {
        this.transform = new Transform();
        this.isActive = true;
        this.transform.parent = parent;
        this.transform.position = new Vec2(0, y);
    }
    BeatLine.prototype.draw = function (view, canvas) {
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(0, this.transform.position.y);
        ctx.lineTo(canvas.width, this.transform.position.y);
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