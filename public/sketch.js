function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
    for (let j = 0; j < arr[i].length; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}
let grid;
let w = 5;
let cols, rows;
let hueValue = 0

function setup() {
  let cnv = createCanvas(200, 400);
  cnv.parent("canvas"); // Attach to specific div
  colorMode(HSB, 360, 255, 255);
  cols = width / w;
  rows = height / w;
  grid = make2DArray(cols, rows);
  //document.addEventListener('contextmenu', event => event.preventDefault());
}
function mouseDragged() {
  let col = floor(mouseX / w);
  let row = floor(mouseY / w);
  let matrix = 5
  let side = floor(matrix / 2)
  if (0 <= col && col < cols && 0 <= row && row < rows) {
    for (let i = 0; i < matrix; i++) {
      for (let j = 0; j < matrix; j++) {
        let currCol = col - side + i
        let currRow = row - side + j
        if (0 <= currCol && currCol < cols && 0 <= currRow && currRow < rows) {
          if(mouseButton===LEFT && grid[currCol][currRow]===0){
            grid[currCol][currRow] = hueValue;
          }
          else if(mouseButton===RIGHT){
            grid[currCol][currRow] = 0;
          }
          
        }
      }
      hueValue += 1;
      if (hueValue === 360) {
        hueValue = 0
      }

    }

  }
}

function draw() {
  background(0);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      noStroke()
      if (grid[i][j] > 0) {
        fill(grid[i][j], 255, 255);
        let x = i * w;
        let y = j * w;
        square(x, y, w);
      }
    }
  }
  let nextGrid = make2DArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      if (state > 0) {
        let below = 1;
        let below_right = 1;
        let below_left = 1;

        if (j < rows - 1) {
          below = grid[i][j + 1];
          if (i < cols - 1) {
            below_right = grid[i + 1][j + 1];
          }
          if (i > 0) {
            below_left = grid[i - 1][j + 1];
          }
        }

        if (below === 0) {
          nextGrid[i][j] = 0;
          nextGrid[i][j + 1] = grid[i][j];
        } else if (below_right == 0 && below_left == 0) {
          let rand = Math.random()
          if (rand > 0.50) {
            nextGrid[i + 1][j + 1] = grid[i][j];
          }
          else {
            nextGrid[i - 1][j + 1] = grid[i][j];
          }
        } else if (below_right === 0) {
          nextGrid[i + 1][j + 1] = grid[i][j];
        } else if (below_left === 0) {
          nextGrid[i - 1][j + 1] = grid[i][j];

        } else {
          nextGrid[i][j] = grid[i][j];
        }
      }
    }

  }
  grid = nextGrid;


}
