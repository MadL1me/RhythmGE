abstract class Scale {
    width: number;
   
    constructor(width : number) {
        this.width = width;
    }

    abstract draw(canvas : HTMLCanvasElement);
}

export class TopScale extends Scale {
    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1B1C21';
        ctx.fillRect(0,-5,canvas.width,this.width+5);
    }
}

export class BottomScale extends Scale {
    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1B1C21';
        ctx.fillRect(0, canvas.height+5, canvas.width, -this.width-5);
    }
}

export class LeftScale extends Scale {
    draw(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1B1C21'; 
        ctx.fillRect(0,0, this.width,canvas.height);
    }
}