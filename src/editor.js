
class Timestamp {   
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
    }

    draw() {
        console.log('Draw of timestamp' + this.x + ":" + this.y);

        // var path = new Path2D();
        // path.moveTo(this.x-this.width, this.y);
        // path.lineTo(this.x, this.y-this.width);
        // path.lineTo(this.x+this.width, this.y);
        // path.lineTo(this.x, this.y+this.width);

        // canvas.fillStyle = "green";
        // canvas.fill(path)

        var canvas = document.getElementById("editor_canvas");
        var ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.moveTo(this.x-this.width, this.y);
        ctx.lineTo(this.x, this.y-this.width);
        ctx.lineTo(this.x+this.width, this.y);
        ctx.lineTo(this.x, this.y+this.width);
        ctx.fillStyle = "green";
        ctx.fill();
    }
}

class Editor {
    constructor() {
        this.notes = [];
        
        var canv = document.getElementById("editor_canvas");
        canv.addEventListener("click", this.canvasClickHandler)

        this.canvas = canv.getContext("2d");
        this.Timeline = new Timeline();
    }

    addTimestamp(x,y) {
        console.log("time stamp added at ${x}, ${y}")
        const note = new Timestamp(50, 50, 10);
        note.draw();
    }

    canvasClickHandler() {
        this.addTimestamp(100, 100);
    }
 
    drawEditor() {

        Timeline.draw();

        this.notes.forEach(note => {
            note.draw(this.canvas);
        });
    }
}

class Timeline {
    constructor() {
        this.size = 1;
        this.timestep = 0;
        this.bmpLines = [];
        this.BeatLines = [];
    }

    draw(canvas) {
        

    }
}

class BPMLine {
    constructor(y) {
        this.y = y;
    }

    draw(canvas) {

    }
}

class TimestepLine {
    constructor(x) {
        this.x = x;
    }

    draw(canvas) {

    }
}

class BeatLine {
    constructor(y) {
        this.y = y;
    }

    draw(canvas) {

    }
}

const editor = new Editor();
module.exports = editor;
//export default Editor;