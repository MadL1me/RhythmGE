'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

module.exports =
/*#__PURE__*/
function () {
  function Editor() {
    _classCallCheck(this, Editor);

    this.notes = [];
    this.canvas = document.getElementById("editor_canvas");
    this.canvas.addEventListener("click", this.canvasClickHandler);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.translate(0.5, 0.5);
    this.topScale = new TopScale(10);
    this.leftScale = new LeftScale(10);
    this.timeline = new Timeline(10, 10, this.canvas);
    this.drawEditor();
  }

  _createClass(Editor, [{
    key: "addTimestamp",
    value: function addTimestamp(canvas, event) {
      var rect = canvas.getBoundingClientRect();
      var clickX = event.clientX - rect.left;
      var clickY = event.clientY - rect.top;
      var columnNum = Math.round((clickX - this.timeline.offsetX) / this.timeline.distanceX);
      var rowNum = Math.round((clickY - this.timeline.offsetY) / this.timeline.distanceY);
      console.log(columnNum);
      console.log(clickX);
      console.log(this.timeline.bpmLines);
      var x = this.timeline.bpmLines[columnNum].X;
      var y = this.timeline.beatLines[rowNum].Y;
      console.log(Math.abs(y - clickY));

      if (Math.abs(y - clickY) <= 20 && Math.abs(x - clickX) <= 20) {
        var note = new Timestamp(x, y, 10);
        note.draw(this.canvas);
      }
    }
  }, {
    key: "drawEditor",
    value: function drawEditor() {
      var _this = this;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'rgb(123,123,123)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.topScale.draw(this.canvas);
      this.leftScale.draw(this.canvas);
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
    this.sizeX = 10;
    this.sizeY = 10;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.timestep = 0;
    this.bpmLines = [];
    this.beatLines = [];
  }

  _createClass(Timeline, [{
    key: "draw",
    value: function draw() {
      var canvas = this.canvas;
      var ctx = canvas.getContext('2d');
      this.bpmLines = [];
      this.beatLines = [];
      var distanceX = canvas.width / this.sizeX;
      var distanceY = canvas.height / this.sizeY;

      for (var i = 0; i < canvas.width / distanceX; i++) {
        this.bpmLines.push(new BPMLine(this.offsetX, this.offsetY, i * distanceX));
      }

      for (var i = 0; i < canvas.height / distanceY; i++) {
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
      return this.canvas.width / this.sizeX;
    }
  }, {
    key: "distanceY",
    get: function get() {
      return this.canvas.height / this.sizeY;
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