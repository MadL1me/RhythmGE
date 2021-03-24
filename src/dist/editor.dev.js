"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Editor =
/*#__PURE__*/
function () {
  function Editor() {
    _classCallCheck(this, Editor);

    this.notes = [];
    this.canvas = document.getElementById("editor_canvas");
    this.canvas.addEventListener("click", this.canvasClickHandler);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.translate(0.5, 0.5);
    this.timeline = new Timeline();
    this.drawEditor();
  }

  _createClass(Editor, [{
    key: "addTimestamp",
    value: function addTimestamp(x, y) {
      console.log("time stamp added at ${x}, ${y}");
      var note = new Timestamp(50, 50, 10);
      note.draw();
    }
  }, {
    key: "canvasClickHandler",
    value: function canvasClickHandler() {
      this.addTimestamp(100, 100);
    }
  }, {
    key: "drawEditor",
    value: function drawEditor() {
      var _this = this;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.timeline.draw(this.canvas);
      this.notes.forEach(function (note) {
        note.draw(_this.canvas);
      });
    }
  }]);

  return Editor;
}();

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

var Timeline =
/*#__PURE__*/
function () {
  function Timeline() {
    _classCallCheck(this, Timeline);

    this.sizeX = 10;
    this.sizeY = 10;
    this.timestep = 0;
    this.bpmLines = [];
    this.beatLines = [];
  }

  _createClass(Timeline, [{
    key: "draw",
    value: function draw(canvas) {
      var ctx = canvas.getContext('2d');
      var distanceX = canvas.width / this.sizeX;
      var distanceY = canvas.height / this.sizeY;

      for (var i = 0; i < canvas.width / this.sizeX; i++) {
        this.bpmLines.push(new BPMLine(i * distanceX));
      }

      for (var i = 0; i < canvas.height / this.sizeY; i++) {
        this.bpmLines.push(new BeatLine(i * distanceY));
      }

      this.bpmLines.forEach(function (bpmLine) {
        bpmLine.draw(canvas);
      });
      this.beatLines.forEach(function (beatLine) {
        beatLine.draw(canvas);
      });
    }
  }]);

  return Timeline;
}();

var BPMLine =
/*#__PURE__*/
function () {
  function BPMLine(x) {
    _classCallCheck(this, BPMLine);

    this.x = x;
  }

  _createClass(BPMLine, [{
    key: "draw",
    value: function draw(canvas) {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.moveTo(this.x, 0);
      ctx.lineTo(this.x, canvas.height);
      ctx.stroke();
    }
  }]);

  return BPMLine;
}();

var BeatLine =
/*#__PURE__*/
function () {
  function BeatLine(y) {
    _classCallCheck(this, BeatLine);

    this.y = y;
  }

  _createClass(BeatLine, [{
    key: "draw",
    value: function draw(canvas) {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.moveTo(0, this.y);
      ctx.lineTo(canvas.width, this.y);
      ctx.stroke();
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
    key: "draw",
    value: function draw(canvas) {}
  }]);

  return TimestepLine;
}();

var editor = new Editor();
module.exports = editor;