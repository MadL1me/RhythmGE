export class Vec2 {
    
    readonly x: number;
    readonly y: number;
    
    constructor(x:number, y:number) {
        this.x = x;  
        this.y = y;
    }
    
    get magnitude() : number {
        return Math.sqrt(this.x*this.x+this.y*this.y); 
    }

    get normalized() : Vec2 {
        let magnitude = this.magnitude;
        return new Vec2(this.x/magnitude, this.y/magnitude);
    }

    static Sum(v1: Vec2, v2: Vec2) : Vec2 { 
        return new Vec2(v1.x+v2.x, v1.y+v2.y);
    }

    static Substract(v1: Vec2, v2: Vec2) : Vec2 {
        return new Vec2(v1.x-v2.x, v1.y-v2.y);
    }

    static Multiply(v1: Vec2, v2: Vec2) : Vec2 { 
        return new Vec2(v1.x*v2.x, v1.y*v2.y);
    }

    static Divide(v1: Vec2, v2: Vec2) : Vec2 {
        return new Vec2(v1.x/v2.x, v1.y/v2.y);
    }

    static MultiplyToNum(v1: Vec2, num: number) : Vec2 {
        return new Vec2(v1.x*num, v1.y*num);
    }
    
    static Distance(v1: Vec2, v2: Vec2) : number {
        return Math.sqrt(Math.pow(v1.x - v2.x, 2)+Math.pow(v1.y - v2.y, 2));
    }

    static Normal(v1: Vec2): Vec2 {
        return new Vec2(v1.y, -v1.x);
    }
}