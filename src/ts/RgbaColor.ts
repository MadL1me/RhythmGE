export class RgbaColor {

    private _r: number;
    private _g: number;
    private _b: number;
    private _a: number;

    constructor(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    value(): string {
        if (this.a == 1)
            return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ')';
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
    }

    private normalizeValue(value: number) {
        if (value < 0)
            return 0;
        if (value > 255)
            return 255;
        return value;
    }

    set r(value: number) {
        this._r = this.normalizeValue(value);
    }

    get r() {
        return this._r;
    }

    set g(value: number) {
        this._g = this.normalizeValue(value);
    }

    get g() {
        return this._g;
    }

    set b(value: number) {
        this._b = this.normalizeValue(value);
    }

    get b() {
        return this._b;
    }

    get a() {
        return this._a;
    }

    set a(value: number) {
        value = this.normalizeValue(value);
        if (value > 1)
            value = 1;
        this._a = value;
    }
}
