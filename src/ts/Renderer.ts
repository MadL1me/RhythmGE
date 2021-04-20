var Howler = require("howler");
var Howl = require("howler");
var editor = require("./dist/editor");

let arr = [0, 1, 10, 12, 16]

function binSearch(array, searchValue: number, useFlooring=false): number {
    let left = 0, right = array.length-1;

    while(right - left > 1) {
        let middle = Math.floor((right + left) / 2);

        console.log(`left: ${left} right: ${right}`);
        console.log(`middle is ${middle}`);

        if (array[middle] < searchValue) {
            left = middle;
        }
        else if (array[middle] >= searchValue) {
            right = middle;
        }
    }
    
    if (!useFlooring)
        return Math.abs(searchValue - array[left])
        < Math.abs(searchValue - array[right]) ? left : right;
    
    return left;
}

console.log(binSearch(arr, 0));
console.log(binSearch(arr, 11));
console.log(binSearch(arr, 16));
console.log(binSearch(arr, 9));
console.log(binSearch(arr, 5));

setInterval(() => { editor.updateLoop(); }, 15);