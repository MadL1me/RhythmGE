'use strict';

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

module.exports =
/*#__PURE__*/
function () {
  function Editor() {
    _classCallCheck(this, Editor);

    this.notes = _toConsumableArray(Array(10)).map(function (e) {
      return Array(5);
    });
    this.canvas = document.getElementById("editor_canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.translate(0.5, 0.5);
    this.topScale = new TopScale(10);
    this.leftScale = new LeftScale(10);
    this.timeline = new Timeline(10, 10, this.canvas);
    this.audioCanvas = new AudioAmplitudeCanvas();
    this.drawEditor();
  }

  _createClass(Editor, [{
    key: "changeBeatlinesCount",
    value: function changeBeatlinesCount(beatLines) {
      this.timeline.setBeatLinesCount(beatLines);
      this.drawEditor();
    }
  }, {
    key: "changeBpmValue",
    value: function changeBpmValue(bpm) {
      this.timeline.setBpmValue(bpm);
      this.drawEditor();
    }
  }, {
    key: "canvasClickHandle",
    value: function canvasClickHandle(event) {
      var rect = this.canvas.getBoundingClientRect();
      var clickX = event.clientX - rect.left;
      var clickY = event.clientY - rect.top;
      var columnNum = Math.round((clickX - this.timeline.offsetX) / this.timeline.distanceX - 1);
      var rowNum = Math.round((clickY - this.timeline.offsetY) / this.timeline.distanceY - 1);

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
        } else {
          console.log("add timestamp");
          var note = new Timestamp(x, y, 10);
          this.notes[columnNum][rowNum] = note;
          note.draw(this.canvas);
        }
      }
    }
  }, {
    key: "drawEditor",
    value: function drawEditor() {
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
      this.audioCanvas.draw();
    }
  }]);

  return Editor;
}();

var AudioAmplitudeCanvas =
/*#__PURE__*/
function () {
  function AudioAmplitudeCanvas() {
    _classCallCheck(this, AudioAmplitudeCanvas);
  }

  _createClass(AudioAmplitudeCanvas, [{
    key: "draw",
    value: function draw(scaleX) {}
  }]);

  return AudioAmplitudeCanvas;
}();

var EditorSettings = function EditorSettings() {
  _classCallCheck(this, EditorSettings);
};

var Timestamp =
/*#__PURE__*/
function () {
  function Timestamp(x, y, width) {
    _classCallCheck(this, Timestamp);

    this.x = x;
    this.y = y;
    this.width = width;
  }

  _createClass(Timestamp, [{
    key: "draw",
    value: function draw(canvas) {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.moveTo(this.x - this.width, this.y);
      ctx.lineTo(this.x, this.y - this.width);
      ctx.lineTo(this.x + this.width, this.y);
      ctx.lineTo(this.x, this.y + this.width);
      ctx.fill();
    }
  }]);

  return Timestamp;
}();

var TopScale =
/*#__PURE__*/
function () {
  function TopScale(height) {
    _classCallCheck(this, TopScale);

    this.height = height;
  }

  _createClass(TopScale, [{
    key: "draw",
    value: function draw(canvas) {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgb(123,32,45)';
      ctx.fillRect(0, 0, canvas.width, this.height);
    }
  }]);

  return TopScale;
}();

var LeftScale =
/*#__PURE__*/
function () {
  function LeftScale(width) {
    _classCallCheck(this, LeftScale);

    this.width = width;
  }

  _createClass(LeftScale, [{
    key: "draw",
    value: function draw(canvas) {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgb(123,32,45)';
      ctx.fillRect(0, 0, this.width, canvas.height);
    }
  }]);

  return LeftScale;
}();

var Timeline =
/*#__PURE__*/
function () {
  function Timeline(offsetX, offsetY, canvas) {
    _classCallCheck(this, Timeline);

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

  _createClass(Timeline, [{
    key: "setBpmValue",
    value: function setBpmValue(bpm) {
      this.bpmValue = bpm;
    }
  }, {
    key: "setBeatLinesCount",
    value: function setBeatLinesCount(beatLines) {
      this.beatinesCount = beatLines;
    }
  }, {
    key: "draw",
    value: function draw(canv) {
      var canvas = canv;
      var ctx = canvas.getContext('2d');
      this.bpmLines = [];
      this.beatLines = [];
      var distanceX = this.distanceX; //canvas.width/(this.bpmValue+1);

      var distanceY = this.distanceY; //canvas.height/(this.beatLinesCount+1);

      console.log(distanceX);
      console.log(distanceY);

      for (var i = 1; i < canvas.width / distanceX - 1; i++) {
        this.bpmLines.push(new BPMLine(this.offsetX, this.offsetY, i * distanceX));
      }

      for (var i = 1; i < canvas.height / distanceY - 1; i++) {
        this.beatLines.push(new BeatLine(this.offsetX, this.offsetY, i * distanceY));
      }

      this.bpmLines.forEach(function (bpmLine) {
        bpmLine.draw(canvas);
      });
      this.beatLines.forEach(function (beatLine) {
        beatLine.draw(canvas);
      });
    }
  }, {
    key: "distanceX",
    get: function get() {
      console.log(this.bpmValue);
      return (this.canvas.width - this.offsetX) / (this.bpmValue + 1);
    }
  }, {
    key: "distanceY",
    get: function get() {
      console.log(this.beatLinesCount);
      return (this.canvas.height - this.offsetY) / (this.beatLinesCount + 1);
    }
  }]);

  return Timeline;
}();

var BPMLine =
/*#__PURE__*/
function () {
  function BPMLine(offsetX, offsetY, x) {
    _classCallCheck(this, BPMLine);

    this.x = x;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  _createClass(BPMLine, [{
    key: "draw",
    value: function draw(canvas) {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.moveTo(this.x + this.offsetX, this.offsetY);
      ctx.lineTo(this.x + this.offsetX, canvas.height);
      ctx.stroke();
    }
  }, {
    key: "X",
    get: function get() {
      return this.x + this.offsetX;
    }
  }]);

  return BPMLine;
}();

var BeatLine =
/*#__PURE__*/
function () {
  function BeatLine(offsetX, offsetY, y) {
    _classCallCheck(this, BeatLine);

    this.y = y;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  _createClass(BeatLine, [{
    key: "draw",
    value: function draw(canvas) {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.moveTo(this.offsetX, this.y + this.offsetY);
      ctx.lineTo(canvas.width, this.y + this.offsetY);
      ctx.stroke();
    }
  }, {
    key: "Y",
    get: function get() {
      return this.y + this.offsetY;
    }
  }]);

  return BeatLine;
}();

var TimestepLine =
/*#__PURE__*/
function () {
  function TimestepLine(x) {
    _classCallCheck(this, TimestepLine);

    this.x = x;
  }

  _createClass(TimestepLine, [{
    key: "movePosition",
    value: function movePosition(x) {
      this.x = x;
    }
  }, {
    key: "draw",
    value: function draw(canvas) {}
  }]);

  return TimestepLine;
}();