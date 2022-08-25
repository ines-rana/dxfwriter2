// Get some points (with an optional label), produce a DXF file

/* Usage:
      curl --data-binary @- https://dxfwriter.gtsb.io

   Sample input:
A       41248.66       42682.69
B       41355.82       42625.14
C       41224.19       42535.84
D       41158.71       42621.83
*/

// query parameters
//  labelSize                     :  desired label size
//  distanceMagnifier:  each label will be drawn
//      at (point distance from geometric center) times this
//      away from the geometric center
//  delimiter                     :  field delimiter  (default comma)
const version = "2022-08"

import parse, { DxfParser } from 'dxf-parser';
import Cors from "cors"
const cors = Cors()

export default async function corsHandler(req, res) {


// Run CORS middleware and handle errors.
await new Promise((resolve, reject) => {
  cors(req, res, result => {
    if (result instanceof Error) {
      reject(result)
    }
    resolve(result)
  })
});




const Drawing = require('dxf-writer');
res.setHeader('X-Version_12', version);



var inputHasLabels = false;

var label_x_y = [];
/* sample data
  ["a",50,50],
  ["b",100, 100],
  ["c",150,50],
  ["d",100, 0],
*/



// req.files[0] =  {"fieldname":"DXFfile","originalname":"file.dxf","encoding":"7bit","mimetype":"application/octet-stream","buffer":{"type":"Buffer","data":[123,...,123]},"size":524}

// handle file uploads
if (!req.files) { // curl --data-binary @points.txt http://this.url
  // No file uploaded; continue
} else { // curl -F DXFfile=@file.dxf http://this.url
  res.append('Content-Type', 'text/plain; charset=UTF-8');
  if (req.files[0] && req.files[0].fieldname &&
    req.files[0].fieldname === "DXFfile") {
    console.log('/: file uploaded', '(' + /*req.files[0].originalname +*/ req.files[0].size + ' bytes)');
    res.send(fileUploadHandler(req));
    res.end();
    return;
  } else { // curl -F foo=@bar http://this.url
    res.send('DXFfile field not found' + "\n");
    res.end();
    return;
  }
}


res.append('Content-Type', 'application/dxf');
res.append('Content-Disposition', 'attachment; filename="polygon.dxf"');

var distanceMagnifier = req.query.distanceMagnifier;
if (!distanceMagnifier) distanceMagnifier = 1.05;
var delimiter = req.query.delimiter;
if (!delimiter) delimiter = '\t';
var labels = req.query.labels;
if (!labels) labels = false;

//console.log("req.body:", JSON.stringify(req.body));

// curl --data-binary 'A\t66\t69\nc\t82\t41\nL\t54\t35\n' ==>
//  req.body sample: {"A\t66\t69\nc\t82\t41\nL\t54\t35\n":""}
var pointsArray = Object.keys(req.body)[0]
  .replace(/\r/mg, "")
  .replace(/\n$/, "")
  .split('\n');
//console.log("Points array", pointsArray, "  length:", pointsArray.length);

// check first line to determine number of fields;
// if it's two then no label exist       X<delimiter>Y
// if it's three then there is a label   label<delimiter>X<delimiter>Y
if (pointsArray && pointsArray[0]) {
  inputHasLabels = pointsArray[0].split(delimiter).length >= 3;
}
//console.log("delimiter, inputHasLabels", delimiter, inputHasLabels);


label_x_y.splice(0, label_x_y.length); // delete array elements
for (var i = 0; i < pointsArray.length; i++) {
  var t = pointsArray[i].split(delimiter);
  if (t.length >= (inputHasLabels ? 3 : 2)) {
    label_x_y
      .push([
        (inputHasLabels ? t[0] : (i + 1).toString()), // 1-based counter
        Number(t[inputHasLabels ? 1 : 0]),
        Number(t[inputHasLabels ? 2 : 1])
      ]);
  }
}
//console.log(label_x_y);
console.log('/: converted', label_x_y.length, 'points to DXF');

var labelSize = req.query.labelSize;
if (!labelSize) labelSize = findMaxDxDy(label_x_y) * 0.02;
//console.log("labelSize:", labelSize);

const here_doc = (function() {/*HERE DOCUMENT
  MORE LINES...
  */
}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

var center = findCentroid(label_x_y);
var centerX = center[0], centerY = center[1];
//console.log("center at:", centerX, centerY);


let d = new Drawing();
d.setUnits('Meters')
  .addLayer('l_labels', Drawing.ACI.WHITE, 'CONTINUOUS')
  .addLayer('l_points', Drawing.ACI.GREEN, 'CONTINUOUS');

/*
    d.setActiveLayer('l_points');
    d.drawLine(50, 50, 100, 100)
     .drawLine(100, 100, 150, 50)
     .drawLine(150, 50, 100, 0)
     .drawLine(100, 0, 50, 50)

    d.addLayer('l_red', Drawing.ACI.RED, 'CONTINUOUS');
     .setActiveLayer('l_red');
     .drawPolyline3d([ [0, 0, 20], [10, 10, 5], [20, 10, 5], [30, 30, 40] ]);
*/


/* draw polygon using line segments ---------------------------- */
//    for (var i=0;i<label_x_y.length;i++){
//      var j=( (i+1) % label_x_y.length);
//
//      d.setActiveLayer('l_points');
//      d.drawLine(
//        label_x_y[i][1],label_x_y[i][2], label_x_y[j][1],label_x_y[j][2]
//      );
////console.log("drawing line from:", label_x_y[i][1],label_x_y[i][2], " to:",label_x_y[j][1],label_x_y[j][2]);
//
//      var labelPosition = labelLocation(
//        centerX, centerY,
//        label_x_y[i][1],label_x_y[i][2], distanceMagnifier
//      );
//      d.setActiveLayer('l_labels');
//      d.drawText(labelPosition[0], labelPosition[1], labelSize, 0,
//        label_x_y[i][0], 'center', 'middle');
////console.log("drawing label at:", labelPosition[0], labelPosition[1], "  size:", labelSize, "distanceMagnifier:", distanceMagnifier)
//    }



/* draw polygon using a polyline ------------------------------- */
d.setActiveLayer('l_labels');
for (var i = 0; i < label_x_y.length; i++) {
  var labelPosition = labelLocation(
    centerX, centerY,
    label_x_y[i][1], label_x_y[i][2], distanceMagnifier
  );
  d.drawText(labelPosition[0], labelPosition[1], labelSize, 0,
    label_x_y[i][0], 'center', 'middle');
  //console.log("drawing label at:", labelPosition[0], labelPosition[1], "  size:", labelSize, "distanceMagnifier:", distanceMagnifier)
}


// remove first element (label) of label_x_y array elements and add z=0
//    [ label, x, y ]   -->  [ x, y, 0 ]
for (var i = 0; i < label_x_y.length; i++) {
  label_x_y[i].shift();
  label_x_y[i].push(0);
}
// make sure that the polygon is closed
if (JSON.stringify(label_x_y[0]) != JSON.stringify(label_x_y[label_x_y.length - 1])) {
  label_x_y.push(label_x_y[0]);
}

d.setActiveLayer('l_points');
d.drawPolyline3d(label_x_y); /* param:  Array of points like [ [x1, y1, z1], [x2, y2, z2], ...] */
//console.log("drawing polyline from:", label_x_y[0][0],label_x_y[0][1], " to:",label_x_y[label_x_y.length-1][0],label_x_y[label_x_y.length-1][1]);
console.log('/:', JSON.stringify(label_x_y), "\n");



/*
d.drawText(0,  0, 10, 0, 'aBc');
d.drawText(0, 15, 10, 0, 'aBc', 'center', 'middle');
d.drawText(0, 20, 10, 0, 'aBc', 'right');
*/

res.append('X-polygonPoints', label_x_y.length);
res.append('X-polygonCenter', centerX + " " + centerY);
res.append('X-delimiter', JSON.stringify(delimiter));
res.append('X-labelSize', labelSize);
res.append('X-distanceMagnifier', distanceMagnifier);

res.send('' +
  d.toDxfString() +
  '\n'
);
res.end();
})

}




function labelLocation(centerX, centerY, X, Y, distanceMagnifier) {
  // move distance*distanceMagnifier away from center
  var labelX = centerX + (X - centerX) * distanceMagnifier;
  var labelY = centerY + (Y - centerY) * distanceMagnifier;
  return [labelX, labelY];
}




function findMaxDxDy(points) {
  // points sample:  [ ["a", 50, 50], ["b",100, 100], ["c",150, 50] ];
  // returns:        the maximum of (maxX-minX, maxY-minY)

  var nPts = points.length;
  if (nPts == 0) return (1.0);

  var minX = points[0][1];
  var maxX = minX;
  var minY = points[0][2];
  var maxY = minY;
  for (var i = 0; i < nPts; j = i++) {
    var x = points[i][1],
      y = points[i][2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  var dX = (maxX - minX);
  var dY = (maxY - minY);
  var maxDxDy = (dX > dY ? dX : dY);
  return maxDxDy;
}


function findCentroid(points) {
  // points sample:  [ ["a", 50, 50], ["b",100, 100], ["c",150, 50] ];
  // returns:        [ center_x, center_y ]

  var nPts = points.length;

  // special cases
  if (nPts == 0) return ([undefined, undefined]);
  if (nPts == 1) return ([points[0][1], points[0][2]]);
  if (nPts == 2) return ([(points[0][1] + points[1][1]) / 2, (points[0][2] + points[1][2]) / 2]);

  // generic case
  var off = points[0];
  var twicearea = 0;
  var x = 0;
  var y = 0;
  var p1, p2;
  var f;
  for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
    p1 = points[i];
    p2 = points[j];
    f = (p1[1] - off[1]) * (p2[2] - off[2]) -
      (p2[1] - off[1]) * (p1[2] - off[2]);
    twicearea += f;
    x += (p1[1] + p2[1] - 2 * off[1]) * f;
    y += (p1[2] + p2[2] - 2 * off[2]) * f;
  }
  f = twicearea * 3;
  return [x / f + off[1], y / f + off[2]];
}





function fileUploadHandler(req) {
  try {
    if (!req.files) {
      return ({
        status: false,
        message: 'No file uploaded\n'
      });
    } else {
      // first uploaded file's contents
      var parsed = parser.parseSync(req.files[0].buffer.toString());

      if (parsed && parsed.error) {
        return (JSON.stringify(parsed) + "\n");
      }

      return (parsed2coefficients(parsed));
    }
  } catch (err) {
    return (err + "\n");
  }
}
