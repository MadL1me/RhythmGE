
class Editor {
    constructor() {
        this.notes = [];
        
        this.canvas = document.getElementById("editor_canvas");
        this.canvas.addEventListener("click", this.canvasClickHandler)

        this.ctx = this.canvas.getContext("2d");
        this.ctx.translate(0.5,0.5);

        this.timeline = new Timeline();
        this.drawEditor();
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
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        this.timeline.draw(this.canvas);
        this.notes.forEach(note => {
            note.draw(this.canvas);
        });
    }
}

class Timestamp {    
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
    }

    draw(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.moveTo(this.x-this.width, this.y);
        ctx.lineTo(this.x, this.y-this.width);
        ctx.lineTo(this.x+this.width, this.y);
        ctx.lineTo(this.x, this.y+this.width);
        ctx.fill();
    }
}

class Timeline {
    constructor() {
        this.sizeX = 10;
        this.sizeY = 10;
        this.timestep = 0;
        this.bpmLines = [];
        this.beatLines = [];
    }

    draw(canvas) {
        const ctx = canvas.getContext('2d');

        var distanceX = canvas.width/this.sizeX;
        var distanceY = canvas.height/this.sizeY;

        for (var i=0; i<canvas.width/this.sizeX; i++){ 
            this.bpmLines.push(new BPMLine(i*distanceX));
        }
        
        for (var i=0; i<canvas.height/this.sizeY; i++){ 
            this.bpmLines.push(new BeatLine(i*distanceY));
        }

        this.bpmLines.forEach(bpmLine => {
            bpmLine.draw(canvas)
        });

        this.beatLines.forEach(beatLine => {
            beatLine.draw(canvas);
        });
    }
}

class BPMLine {
    constructor(x) {
        this.x = x;
    }

    draw(canvas) {
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = "black";

        ctx.beginPath();
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, canvas.height);
        ctx.stroke();
    }
}

class BeatLine {
    constructor(y) {
        this.y = y;
    }

    draw(canvas) {
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = "black";

        ctx.beginPath();
        ctx.moveTo(0, this.y);
        ctx.lineTo(canvas.width, this.y);
        ctx.stroke();
    }
}

class TimestepLine {
    constructor(x) {
        this.x = x;
    }

    draw(canvas) {
        
    }
}

const editor = new Editor();
module.exports = editor;