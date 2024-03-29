var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var idata = ctx.getImageData(0,0,1,1);

// Sets everything up and calls samplePoint() to get the actual values.
function mandelbrot(iter, xres, yres, xCenter, yCenter, xScale, supernum) {
  idata.data[3] = 255;

  canvas.width = xres;
  canvas.height = yres;

  // Where values will be stored before coloring
  var valueArray = array_2D(xres, yres, true);

  var xPixel, yPixel;

  // Scales y range to match x
  var yScale = xScale * (yres / xres);

  // Coordinates of edges
  var xstart = xCenter - xScale;
  var xend   = xCenter + xScale;
  var ystart = yCenter - yScale;
  var yend   = yCenter + yScale;

  // Vars for supersampling
  // Half of the distance between pixel points
  var dx = (xend - xstart) / (2 * xres);
  var dy = (yend - ystart) / (2 * yres);
  // How much to move over for each new sample
  var xShift = 2 * dx / (supernum);
  var yShift = 2 * dy / (supernum);

  for(xindex = 0; xindex < xres; xindex++) {
    for(yindex = 0; yindex < yres; yindex++) {

      // Gets us to the location of a specific pixel
      xPixel = xstart + (xend - xstart) * (xindex / xres);
      yPixel = ystart + (yend - ystart) * (yindex / yres);

      // gets us to the top-left supersampling location (within the pixel)
      xPixel += -dx + xShift/2; 
      yPixel += -dy + yShift/2;

      //sum = 0;

      valueArray[xindex][yindex] = samplePoint(xPixel, yPixel, xShift, yShift, iter, supernum);
      drawPixel(valueArray[xindex][yindex], xindex, yindex, yres);
    }
  }

  return valueArray;
}

// Computes value at each pixel (with supersampling if chosen)
function samplePoint(xPixel, yPixel, xShift, yShift, iter, supernum) {
  var sum, count;
  var x, y, Cr, Ci;
  var Cr2, Ci2, abs;

  sum = 0;

  /* supersampling: samples (supernum^2) points within 
   * each pixel to get a more accurate color*/
  for(xCounter = 0; xCounter < supernum; xCounter++) {
    for(yCounter = 0; yCounter < supernum; yCounter++) {

      // Gets us to current supersampling location
      x = xPixel + (xCounter * xShift);
      y = yPixel + (yCounter * yShift);

      // Another set of coords (these ones will be changed as we iterate)
      Cr = x;
      Ci = y;

      count = 0;

      iterator:
      while(count < iter) {
        // Store squares so we don't compute them repeatedly
        Cr2 = Math.pow(Cr,2);
        Ci2 = Math.pow(Ci,2);
        abs = Math.sqrt(Cr2 + Ci2);

        // If |z| > 2, we know it will diverge.
        if (abs > 2) {
          sum += count;
          break;
        }
        else {
          // Performs complex number squaring (z = z^2 + c) 
          Ci = 2*Cr*Ci + y;
          Cr = Cr2 - Ci2 + x;
          count++;
        }
      }
    }
  }
  return (sum / Math.pow(supernum, 2) + 1 - Math.log(Math.log(abs))/Math.log(2))/iter;
}

// Draws the actual image; will eventually support colors.
function draw (values) {
  var r, g, b;
  for(var x = 0; x < values.length; x++) {
    for(var y = 0; y < values[x].length; y++) {
      if(true) {
        r = values[x][y] * 255;
        g = values[x][y] * 255;
        b = values[x][y] * 255;
      }

      idata.data[0] = r;
      idata.data[1] = g;
      idata.data[2] = b;
      ctx.putImageData(idata, x, values[x].length - 1 - y);
    }
  }
}

function drawPixel(value, x, y, ysize) {
  idata.data[0] = value * 255;
  idata.data[1] = value * 255;
  idata.data[2] = value * 255;
  ctx.putImageData(idata, x, ysize - 1 - y);
}

function update() {
  ctx.clearRect(0,0,canvas.width, canvas.height);
}

// Creates an array of size r x c and initializes entries to 0
function array_2D(r, c, init) {
  var arr = [];
  for(var i = 0; i < r; i++) {
    arr[i] = [];

    if(init)
      for(var j = 0; j < c; j++) {
        arr[i][j] = 0;
      }
  }
  return arr;
}

//draw(mandelbrot(200, 1920, 1080, -0.75, 0, 2.5, 2));
mandelbrot(100, 1200, 600, -0.75, 0, 2.5, 2);