"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
    value: function draw() {
      console.log('Draw of timestamp' + this.x + ":" + this.y); // var path = new Path2D();
      // path.moveTo(this.x-this.width, this.y);
      // path.lineTo(this.x, this.y-this.width);
      // path.lineTo(this.x+this.width, this.y);
      // path.lineTo(this.x, this.y+this.width);
      // canvas.fillStyle = "green";
      // canvas.fill(path)

      var canvas = document.getElementById("editor_canvas");
      var ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.moveTo(this.x - this.width, this.y);
      ctx.lineTo(this.x, this.y - this.width);
      ctx.lineTo(this.x + this.width, this.y);
      ctx.lineTo(this.x, this.y + this.width);
      ctx.fillStyle = "green";
      ctx.fill();
    }
  }]);

  return Timestamp;
}();

var Editor =
/*#__PURE__*/
function () {
  function Editor() {
    _classCallCheck(this, Editor);

    this.notes = [];
    var canv = document.getElementById("editor_canvas");
    canv.addEventListener("click", this.canvasClickHandler);
    this.canvas = canv.getContext("2d");
    this.Timeline = new Timeline();
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

      Timeline.draw();
      this.notes.forEach(function (note) {
        note.draw(_this.canvas);
      });
    }
  }]);

  return Editor;
}();

var Timeline =
/*#__PURE__*/
function () {
  function Timeline() {
    _classCallCheck(this, Timeline);

    this.size = 1;
    this.timestep = 0;
    this.bmpLines = [];
    this.BeatLines = [];
  }

  _createClass(Timeline, [{
    key: "draw",
    value: function draw(canvas) {}
  }]);

  return Timeline;
}();

var BPMLine =
/*#__PURE__*/
function () {
  function BPMLine(y) {
    _classCallCheck(this, BPMLine);

    this.y = y;
  }

  _createClass(BPMLine, [{
    key: "draw",
    value: function draw(canvas) {}
  }]);

  return BPMLine;
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

var BeatLine =
/*#__PURE__*/
function () {
  function BeatLine(y) {
    _classCallCheck(this, BeatLine);

    this.y = y;
  }

  _createClass(BeatLine, [{
    key: "draw",
    value: function draw(canvas) {}
  }]);

  return BeatLine;
}();

var editor = new Editor();
module.exports = editor;