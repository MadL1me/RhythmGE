'use strict';

module.exports = class Editor {

    notes: Array<Array<Timestamp>>;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    topScale: TopScale;
    leftScale: LeftScale;
    timeline: Timeline;
    audioCanvas: AudioAmplitudeCanvas;    

    constructor() {
        this.notes = [...Array(10)].map(e => Array(5));
        
        this.canvas = document.getElementById("editor_canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.translate(0.5,0.5);
        
        this.topScale = new TopScale(10);
        this.leftScale = new LeftScale(10);
        this.timeline = new Timeline(10, 10, this.canvas);
        this.audioCanvas = new AudioAmplitudeCanvas();
        
        this.drawEditor();
    }

    changeBeatlinesCount(beatLines) {
        this.timeline.setBeatLinesCount(beatLines);
        this.drawEditor();
    }

    changeBpmValue(bpm) {
        this.timeline.setBpmValue(bpm);
        this.drawEditor();
    }

    canvasClickHandle(event) {
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        var columnNum = Math.round((clickX-this.timeline.offsetX)/(this.timeline.distanceX)-1);
        var rowNum = Math.round((clickY-this.timeline.offsetY)/(this.timeline.distanceY)-1); 

        if (columnNum < -0.6 || rowNum < -0.6) {
            return;
        }

        const x = this.timeline.bpmLines[columnNum].X;
        const y = this.timeline.beatLines[rowNum].Y;

        console.log(this.timeline.distanceY);
        console.log(this.timeline.distanceX);
        console.log(columnNum+":"+rowNum);
        console.log(Math.abs(x - clickX) + ":" + Math.abs(y - clickY))

        if (Math.abs(y - clickY) <= 20 && Math.abs(x - clickX) <= 20) {
            
            console.log(this.notes[columnNum][rowNum]);
            
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
        console.log("draw editor")
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = 'rgb(123,123,123)'
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height)
        this.topScale.draw(this.canvas);
        this.leftScale.draw(this.canvas);
        this.timeline.draw(this.canvas);
        this.notes.forEach(notes => { notes.forEach(note => {
            if (note!=null) { note.draw(this.canvas);
        }})});
        this.audioCanvas.draw(1);
    }
}

class AudioAmplitudeCanvas {
    constructor() {

    }

    draw(scaleX) {
        
    }
}

class EditorSettings {
    constructor() {
        
    }
}

class Timestamp {    
    
    x:number;
    y:number;
    width: number;
   
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
   
    height: number;
   
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
    
    width: number;
    
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
    
    canvas: HTMLCanvasElement;

    scaleX: number;
    scaleY: number;
    bpmValue: number;
    beatLinesCount: number;
    offsetX: number;
    offsetY: number;
    timestep: number;

    bpmLines: Array<BPMLine>;
    beatLines: Array<BeatLine>;

    constructor(offsetX, offsetY, canvas) {
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

    get distanceX() {
        console.log(this.bpmValue);
        return (this.canvas.width-this.offsetX)/(this.bpmValue+1);
    }

    get distanceY() {
        console.log(this.beatLinesCount);
        return (this.canvas.height-this.offsetY)/(this.beatLinesCount+1);
    }

    setBpmValue(bpm) {
        this.bpmValue = bpm;
    }

    setBeatLinesCount(beatLines) {
        this.beatLinesCount = beatLines;
    }

    draw(canv) {
        const canvas = canv;
        const ctx = canvas.getContext('2d');

        this.bpmLines = [];
        this.beatLines = [];

        var distanceX = this.distanceX;//canvas.width/(this.bpmValue+1);
        var distanceY = this.distanceY;//canvas.height/(this.beatLinesCount+1);

        console.log(distanceX);
        console.log(distanceY);

        for (var i=1; i<canvas.width/(distanceX)-1; i++){ 
            this.bpmLines.push(new BPMLine(this.offsetX, this.offsetY, i*distanceX));
        }
        
        for (var i=1; i<canvas.height/(distanceY)-1; i++){ 
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
    
    x: number;
    offsetX: number;
    offsetY: number;
    
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
    
    y: number;
    offsetX: number;
    offsetY: number;
    
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
   
    x: number;
    
    constructor(x) {
        this.x = x;
    }

    movePosition(x) {
        this.x = x;
    }

    draw(canvas) {
        
    }
}