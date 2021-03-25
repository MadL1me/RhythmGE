'use strict';

module.exports = class Editor {
    
    //notes = [[],[]]

    constructor() {
        this.notes = [...Array(10)].map(e => Array(10));
        
        this.canvas = document.getElementById("editor_canvas");
        this.canvas.addEventListener("click", this.canvasClickHandler)

        this.ctx = this.canvas.getContext("2d");
        this.ctx.translate(0.5,0.5);

        this.topScale = new TopScale(10);
        this.leftScale = new LeftScale(10);
        this.timeline = new Timeline(10, 10, this.canvas);
        
        this.drawEditor();
    }

    canvasClickHandle(event) {
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        var columnNum = Math.round((clickX-this.timeline.offsetX)/this.timeline.distanceX);
        var rowNum = Math.round((clickY-this.timeline.offsetY)/this.timeline.distanceY); 

        const x = this.timeline.bpmLines[columnNum].X;
        const y = this.timeline.beatLines[rowNum].Y;

        console.log(columnNum+":"+rowNum);

        if (Math.abs(y - clickY) <= 20 && Math.abs(x - clickX) <= 20) {
            
            //console.log(this.notes[columnNum][rowNum]);
            
            if (this.notes[columnNum][rowNum] != undefined && this.notes[columnNum][rowNum] != null) {
                console.log("remove timestamp");
                this.notes[columnNum][rowNum] = null;
                this.drawEditor();
            }
            else {
                console.log("add timestamp")
                const note = new Timestamp(x, y, 10);
                this.notes[columnNum][rowNum] = note;
                note.draw(this.canvas);
            }
        }
    }

    drawEditor() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = 'rgb(123,123,123)'
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height)
        this.topScale.draw(this.canvas);
        this.leftScale.draw(this.canvas);
        this.timeline.draw(this.canvas);
        this.notes.forEach(notes => { notes.forEach(note => {
            if (note!=null) { note.draw(this.canvas);
        }})});
    }
}

class EditorSettings {
    constructor() {
        
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

class TopScale {
    constructor(height) {
        this.height = height;
    }

    draw(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgb(123,32,45)';
        ctx.fillRect(0,0,canvas.width,this.height);
    }
}

class LeftScale {
    constructor(width) {
        this.width = width;
    }

    draw(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgb(123,32,45)';
        ctx.fillRect(0,0, this.width,canvas.height);
    }
}

class Timeline {
    constructor(offsetX, offsetY, canvas) {
        this.canvas = canvas;
        this.sizeX = 10;
        this.sizeY = 10;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.timestep = 0;
        this.bpmLines = [];
        this.beatLines = [];
    }

    get distanceX() {
        return this.canvas.width/this.sizeX;
    }

    get distanceY() {
        return this.canvas.height/this.sizeY;
    }

    draw() {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');

        this.bpmLines = [];
        this.beatLines = [];

        var distanceX = canvas.width/this.sizeX;
        var distanceY = canvas.height/this.sizeY;

        for (var i=0; i<canvas.width/(distanceX); i++){ 
            this.bpmLines.push(new BPMLine(this.offsetX, this.offsetY, i*distanceX));
        }
        
        for (var i=0; i<canvas.height/(distanceY); i++){ 
            this.beatLines.push(new BeatLine(this.offsetX, this.offsetY, i*distanceY));
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
    constructor(offsetX, offsetY, x) {
        this.x = x;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    draw(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "black";

        ctx.beginPath();
        ctx.moveTo(this.x + this.offsetX, this.offsetY);
        ctx.lineTo(this.x + this.offsetX, canvas.height);
        ctx.stroke();
    }

    get X() {
        return this.x + this.offsetX;
    }
}

class BeatLine {
    constructor(offsetX, offsetY, y) {
        this.y = y;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    draw(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.offsetX, this.y + this.offsetY);
        ctx.lineTo(canvas.width, this.y + this.offsetY);
        ctx.stroke();
    }

    get Y() {
        return this.y + this.offsetY;
    }
}

class TimestepLine {
    constructor(x) {
        this.x = x;
    }

    movePosition(x) {
        this.x = x;
    }

    draw(canvas) {
        
    }
}