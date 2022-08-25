// Parse a DXF file, return points' coefficients

/* Usage:
     curl -F DXFfile=@1.dxf https://dxfwriter.gtsb.io/api/parser


   Sample output:
1       10.5    37.25
2       3.3     30
3       24      35.1
4       24.4    41.79


   Sample output:
Πολύγωνο_1
1 541248.66 4112682.69
2 541355.82 4112625.14
Πολύγωνο_2
1 541355.82 4112625.14
2 541224.19 4112535.84
Πολύγωνο_3
1 541224.19 4112535.84
2 541158.71 4112621.83
Πολύγωνο_4
1 541158.71 4112621.83
2 541248.66 4112682.69
*/



const version = "2022-08"

import parse, { DxfParser } from 'dxf-parser';
import Cors from "cors"
const cors = Cors()

export default async function corsHandler(req, res) {
  // Run Cors middleware and handle errors.
  await new Promise((resolve, reject) => {
    cors(req, res, result => {
      if (result instanceof Error) {
        reject(result)
      }
      resolve(result)
    })
  })



  res.setHeader('X-Version', version);


  // first uploaded file contents:  (ignoring parameter (DXFfile) name)
  //console.log(req.files[0].buffer.toString());
  var parsed_input;
  var failure = false;
  var parser = new DxfParser();
  try {
    // parse DXF file
    parsed_input = parser.parseSync(req.files[0].buffer.toString());
  } catch (err) {
    //console.error(err.stack);
    failure = true;
    res.status(400).json({ "error": err.stack });
  }
  if (failure) return;


  res.setHeader('content-type', 'text/plain; charset=UTF-8');

  if (parsed_input) {
    res.send(parsed2coefficients(parsed_input));
  } else {
    res.send("");
  }
  res.end();

  return;
}







// pick up coefficients' pairs
function parsed2coefficients(parsed){

  // collect x/y coefficient pairs for every vertex of a LINE/LWPOLYLINE
  var coeffs = [];
  parsed.entities                          // get entities
    .filter(
      function(e) {
        return (
          (e.type == "LINE") ||          // which are points collections
          (e.type == "LWPOLYLINE") ||
          (e.type == "POLYLINE")
        )
      }).
  forEach(function(e) {
    //console.log( e )
  
    var v = [];
    e.vertices.forEach(function(p) {
      //console.log("p",p)
      v.push(p.x, p.y);                  // vertex v_n: [xn1,yn1,xn2,yn2,...]
    });
    //console.log("v",v);                // coeffs: [vertex1, vertex2, ...]
    coeffs.push(v)                       //       = [ [x11,y11,x12,y12..],
  })                                     //           [x21,y21,x22,y22..]..]
  
  var ret = "";
  var prevX, prevY;
  
  var addPolygonHeaders = (coeffs.length > 1)
  
  for (var polygon = 0; polygon < coeffs.length; polygon++) {
    prevX=""; prevY="";

    // if more than one polygons, print a header
    if (addPolygonHeaders) ret += (polygon == 0 ? "" : "\n") + 'Ξ ΞΏΞ»ΟΞ³Ο‰Ξ½ΞΏ_' + (polygon + 1) + "\n";

    // for all lines in polygon push their points' coefficients
    for (var line = 0; line < coeffs[polygon].length; line += 2) {
  
      // last point identical to first point?
      if ((line == coeffs[polygon].length - 2) &&
        (JSON.stringify(coeffs[polygon][0]) == JSON.stringify(coeffs[polygon][line]))
      ) continue;
  
      // duplicate point?
      if ((coeffs[polygon][line] == prevX)&&(coeffs[polygon][line+1] == prevY)) continue;
  
      prevX = coeffs[polygon][line];
      prevY = coeffs[polygon][line+1];
  
      // print coefficient pairs
      ret += ((line / 2) + 1) + "\t" + coeffs[polygon][line] + "\t" + coeffs[polygon][line + 1] + "\n";
    }
  }
//console.log(coeffs)
//console.log(ret)

  return(ret)

}


/* 
console.log( parsed2coefficients(
{"header":{"$HANDSEED":"13","$INSUNITS":6},"tables":{"lineType":{"handle":"1","lineTypes":{"CONTINUOUS":{"name":"CONTINUOUS","description":"______","patternLength":0},"DASHED":{"name":"DASHED","description":"_ _ _","pattern":[5,-5],"patternLength":10},"DOTTED":{"name":"DOTTED","description":". . .","pattern":[0,-5],"patternLength":5}}},"layer":{"handle":"2","layers":{"0":{"name":"0","visible":true,"colorIndex":7,"color":16777215,"frozen":false},"l_labels":{"name":"l_labels","visible":true,"colorIndex":7,"color":16777215,"frozen":false},"l_points":{"name":"l_points","visible":true,"colorIndex":3,"color":65280,"frozen":false}}}},"blocks":{},"entities":[{"type":"TEXT","handle":"c","layer":"l_labels","startPoint":{"x":541248.6157114437,"y":4112686.11906602,"z":0},"textHeight":3.942199999999721,"text":"A","rotation":0,"halign":1,"endPoint":{"x":541248.6157114437,"y":4112686.11906602,"z":0},"valign":2},{"type":"TEXT","handle":"e","layer":"l_labels","startPoint":{"x":541361.1337114436,"y":4112625.6915660203,"z":0},"textHeight":3.942199999999721,"text":"c","rotation":0,"halign":1,"endPoint":{"x":541361.1337114436,"y":4112625.6915660203,"z":0},"valign":2},{"type":"TEXT","handle":"10","layer":"l_labels","startPoint":{"x":541222.9222114437,"y":4112531.9265660197,"z":0},"textHeight":3.942199999999721,"text":"L","rotation":0,"halign":1,"endPoint":{"x":541222.9222114437,"y":4112531.9265660197,"z":0},"valign":2},{"type":"TEXT","handle":"12","layer":"l_labels","startPoint":{"x":541154.1682114437,"y":4112622.21606602,"z":0},"textHeight":3.942199999999721,"text":"3","rotation":0,"halign":1,"endPoint":{"x":541154.1682114437,"y":4112622.21606602,"z":0},"valign":2},{"type":"LINE","vertices":[{"x":541248.66,"y":4112682.69,"z":0},{"x":541355.82,"y":4112625.14,"z":0}],"handle":"b","layer":"l_points"},{"type":"LINE","vertices":[{"x":541355.82,"y":4112625.14,"z":0},{"x":541224.19,"y":4112535.84,"z":0}],"handle":"d","layer":"l_points"},{"type":"LINE","vertices":[{"x":541224.19,"y":4112535.84,"z":0},{"x":541158.71,"y":4112621.83,"z":0}],"handle":"f","layer":"l_points"},{"type":"LINE","vertices":[{"x":541158.71,"y":4112621.83,"z":0},{"x":541248.66,"y":4112682.69,"z":0}],"handle":"11","layer":"l_points"}]}
))

console.log( parsed2coefficients(
{"header":{"$ACADVER":"AC1015","$HANDSEED":"FFFF","$DIMADEC":0,"$DIMASZ":2.5,"$DIMAUNIT":0,"$DIMAZIN":2,"$DIMDEC":4,"$DIMEXE":1.25,"$DIMEXO":0.625,"$DIMGAP":0.625,"$DIMLUNIT":2,"$DIMSCALE":1,"$DIMTSZ":0,"$DIMTXT":2.5,"$DIMZIN":8,"$DWGCODEPAGE":"ANSI_1252","$INSUNITS":5,"$LTSCALE":1,"$MEASUREMENT":1,"$PDMODE":0,"$PDSIZE":0},"tables":{"viewPort":{"handle":"8","viewPorts":[{"name":"*Active","lowerLeftCorner":{"x":0,"y":0},"upperRightCorner":{"x":1,"y":1},"center":{"x":286.3055555555555,"y":148.5},"snapBasePoint":{"x":0,"y":0},"snapSpacing":{"x":10,"y":10},"gridSpacing":{"x":10,"y":10},"viewDirectionFromTarget":{"x":0,"y":0,"z":1},"viewTarget":{"x":0,"y":0,"z":0},"lensLength":50,"frontClippingPlane":0,"backClippingPlane":0,"snapRotationAngle":0,"viewTwistAngle":0,"renderMode":0,"ucsOrigin":{"x":0,"y":0,"z":0},"ucsXAxis":{"x":1,"y":0,"z":0},"ucsYAxis":{"x":0,"y":1,"z":0},"orthographicType":0}]},"lineType":{"handle":"5","lineTypes":{"Continuous":{"name":"Continuous","description":"Solid line","patternLength":0},"ACAD_ISO15W100":{"name":"ACAD_ISO15W100","description":"ISO double-dash triple-dot __ __ . . . __ __ . .","pattern":[12,-3,12,-3,0,-3,0,-3,0,-3],"patternLength":39},"CUTRIGHT2":{"name":"CUTRIGHT2","description":"G42 reversed----\\----\\----\\----","pattern":[5.08,5.08],"patternLength":10.16},"HOT_WATER_SUPPLY":{"name":"HOT_WATER_SUPPLY","description":"Hot water supply ---- HW ---- HW ---- HW ----","pattern":[12.7,-5.08,-5.08],"patternLength":22.86},"DIVIDE":{"name":"DIVIDE","description":"Divide ____ . . ____ . . ____ . . ____ . . ____","pattern":[12.7,-6.35,0,-6.35,0,-6.35],"patternLength":31.75},"CUTRIGHT":{"name":"CUTRIGHT","description":"G42 ----/----/-----/---","pattern":[5.08,5.08],"patternLength":10.16},"ACAD_ISO10W100":{"name":"ACAD_ISO10W100","description":"ISO dash dot __ . __ . __ . __ . __ . __ . __ .","pattern":[12,-3,0,-3],"patternLength":18},"CUTLEFT":{"name":"CUTLEFT","description":"G41 ----\\----\\----\\----","pattern":[5.08,5.08],"patternLength":10.16},"GAS_LINE":{"name":"GAS_LINE","description":"Gas line ----GAS----GAS----GAS----GAS----GAS----GAS--","pattern":[12.7,-5.08,-6.35],"patternLength":24.130000000000003},"ACAD_ISO04W100":{"name":"ACAD_ISO04W100","description":"ISO long-dash dot ____ . ____ . ____ . ____ . _","pattern":[24,-3,0,-3],"patternLength":30},"CUTLEFT2":{"name":"CUTLEFT2","description":"G41 reversed----/----/----/----","pattern":[5.08,5.08],"patternLength":10.16},"CENTER2":{"name":"CENTER2","description":"Center (.5x) ___ _ ___ _ ___ _ ___ _ ___ _ ___","pattern":[19.05,-3.175,3.175,-3.175],"patternLength":28.575000000000003},"ACAD_ISO11W100":{"name":"ACAD_ISO11W100","description":"ISO double-dash dot __ __ . __ __ . __ __ . __ _","pattern":[12,-3,12,-3,0,-3],"patternLength":33},"HIDDEN2":{"name":"HIDDEN2","description":"Hidden (.5x) _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _","pattern":[3.175,-1.5875],"patternLength":4.762499999999999},"BORDERX2":{"name":"BORDERX2","description":"Border (2x) ____  ____  .  ____  ____  .  ___","pattern":[25.4,-12.7,25.4,-12.7,0,-12.7],"patternLength":88.89999999999999},"ACAD_ISO05W100":{"name":"ACAD_ISO05W100","description":"ISO long-dash double-dot ____ .. ____ .. ____ .","pattern":[24,-3,0,-3,0,-3],"patternLength":33},"DASHDOTX2":{"name":"DASHDOTX2","description":"Dash dot (2x) ____  .  ____  .  ____  .  ___","pattern":[25.4,-12.7,0,-12.7],"patternLength":50.8},"HIDDENX2":{"name":"HIDDENX2","description":"Hidden (2x) ____ ____ ____ ____ ____ ____ ____","pattern":[12.7,-6.35],"patternLength":19.049999999999997},"CENTERX2":{"name":"CENTERX2","description":"Center (2x) ________  __  ________  __  _____","pattern":[63.5,-12.7,12.7,-12.7],"patternLength":101.60000000000001},"BORDER2":{"name":"BORDER2","description":"Border (.5x) __.__.__.__.__.__.__.__.__.__.__.","pattern":[6.35,-3.175,6.35,-3.175,0,-3.175],"patternLength":22.224999999999998},"DASHDOT2":{"name":"DASHDOT2","description":"Dash dot (.5x) _._._._._._._._._._._._._._._.","pattern":[6.35,-3.175,0,-3.175],"patternLength":12.7},"ACAD_ISO12W100":{"name":"ACAD_ISO12W100","description":"ISO dash double-dot __ . . __ . . __ . . __ . .","pattern":[12,-3,0,-3,0,-3],"patternLength":21},"ACAD_ISO07W100":{"name":"ACAD_ISO07W100","description":"ISO dot . . . . . . . . . . . . . . . . . . . .","pattern":[0,-3],"patternLength":3},"ACAD_ISO06W100":{"name":"ACAD_ISO06W100","description":"ISO long-dash triple-dot ____ ... ____ ... ____","pattern":[24,-3,0,-3,0,-3,0,-3],"patternLength":36},"CENTER":{"name":"CENTER","description":"Center ____ _ ____ _ ____ _ ____ _ ____ _ ____","pattern":[31.75,-6.35,6.35,-6.35],"patternLength":50.800000000000004},"HIDDEN":{"name":"HIDDEN","description":"Hidden __ __ __ __ __ __ __ __ __ __ __ __ __ __","pattern":[6.35,-3.175],"patternLength":9.524999999999999},"DOTX2":{"name":"DOTX2","description":"Dot (2x) .  .  .  .  .  .  .  .  .  .  .  .  .  .","pattern":[0,-12.7],"patternLength":12.7},"PHANTOM":{"name":"PHANTOM","description":"Phantom ______  __  __  ______  __  __  ______","pattern":[31.75,-6.35,6.35,-6.35,6.35,-6.35],"patternLength":63.50000000000001},"ACAD_ISO08W100":{"name":"ACAD_ISO08W100","description":"ISO long-dash short-dash ____ __ ____ __ ____ _","pattern":[24,-3,6,-3],"patternLength":36},"DASHEDX2":{"name":"DASHEDX2","description":"Dashed (2x) ____  ____  ____  ____  ____  ___","pattern":[25.4,-12.7],"patternLength":38.099999999999994},"DRAINAGE":{"name":"DRAINAGE","description":"Drainage ---->---->---->----","pattern":[5.08,5.08],"patternLength":10.16},"ACAD_ISO02W100":{"name":"ACAD_ISO02W100","description":"ISO dash __ __ __ __ __ __ __ __ __ __ __ __ __","pattern":[12,-3],"patternLength":15},"PHANTOM2":{"name":"PHANTOM2","description":"Phantom (.5x) ___ _ _ ___ _ _ ___ _ _ ___ _ _","pattern":[15.875,-3.175,3.175,-3.175,3.175,-3.175],"patternLength":31.750000000000004},"DASHED2":{"name":"DASHED2","description":"Dashed (.5x) _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _","pattern":[6.35,-3.175],"patternLength":9.524999999999999},"ACAD_ISO09W100":{"name":"ACAD_ISO09W100","description":"ISO long-dash double-short-dash ____ __ __ ____","pattern":[24,-3,6,-3,6,-3],"patternLength":45},"ACAD_ISO13W100":{"name":"ACAD_ISO13W100","description":"ISO double-dash double-dot __ __ . . __ __ . . _","pattern":[12,-3,12,-3,0,-3,0,-3],"patternLength":36},"TRACKS":{"name":"TRACKS","description":"Tracks -|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-","pattern":[3.81,3.81],"patternLength":7.62},"DRAINAGE2":{"name":"DRAINAGE2","description":"Drainage reversed----<----<----<----","pattern":[5.08,5.08],"patternLength":10.16},"DOT2":{"name":"DOT2","description":"Dot (.5x) ........................................","pattern":[0,-3.175],"patternLength":3.175},"ZIGZAG":{"name":"ZIGZAG","description":"Zig zag /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/","pattern":[0.00254,-5.08,-10.16,-5.08],"patternLength":20.32254},"DASHED":{"name":"DASHED","description":"Dashed __ __ __ __ __ __ __ __ __ __ __ __ __ _","pattern":[12.7,-6.35],"patternLength":19.049999999999997},"ACAD_ISO14W100":{"name":"ACAD_ISO14W100","description":"ISO dash triple-dot __ . . . __ . . . __ . . . _","pattern":[12,-3,0,-3,0,-3,0,-3],"patternLength":24},"BYLAYER":{"name":"BYLAYER","description":"","patternLength":0},"PHANTOMX2":{"name":"PHANTOMX2","description":"Phantom (2x) ____________    ____    ____   _","pattern":[63.5,-12.7,12.7,-12.7,12.7,-12.7],"patternLength":127.00000000000001},"BYBLOCK":{"name":"BYBLOCK","description":"","patternLength":0},"DIVIDEX2":{"name":"DIVIDEX2","description":"Divide (2x) ________  .  .  ________  .  .  _","pattern":[25.4,-12.7,0,-12.7,0,-12.7],"patternLength":63.5},"BORDER":{"name":"BORDER","description":"Border __ __ . __ __ . __ __ . __ __ . __ __ .","pattern":[12.7,-6.35,12.7,-6.35,0,-6.35],"patternLength":44.449999999999996},"DIVIDE2":{"name":"DIVIDE2","description":"Divide (.5x) __..__..__..__..__..__..__..__.._","pattern":[6.35,-3.175,0,-3.175,0,-3.175],"patternLength":15.875},"DOT":{"name":"DOT","description":"Dot . . . . . . . . . . . . . . . . . . . . . . . .","pattern":[0,-6.35],"patternLength":6.35},"DASHDOT":{"name":"DASHDOT","description":"Dash dot __ . __ . __ . __ . __ . __ . __ . __","pattern":[12.7,-6.35,0,-6.35],"patternLength":25.4},"FENCELINE1":{"name":"FENCELINE1","description":"Fenceline circle ----0-----0----0-----0----0-----0--","pattern":[6.35,-2.54,-2.54,25.4],"patternLength":36.83},"BATTING":{"name":"BATTING","description":"Batting SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS","pattern":[0.00254,-2.54,-5.08,-2.54],"patternLength":10.16254},"ACAD_ISO03W100":{"name":"ACAD_ISO03W100","description":"ISO dash space __    __    __    __    __    __","pattern":[12,-18],"patternLength":30},"FENCELINE2":{"name":"FENCELINE2","description":"Fenceline square ----[]-----[]----[]-----[]----[]---","pattern":[6.35,-2.54,-2.54,25.4],"patternLength":36.83}}},"layer":{"handle":"2","layers":{"0":{"name":"0","frozen":false,"visible":true,"colorIndex":7,"color":16777215}}}},"blocks":{"*Model_Space":{"handle":"20","layer":"0","name":"*Model_Space","position":{"x":0,"y":0,"z":0},"name2":"*Model_Space","xrefPath":""},"*Paper_Space":{"handle":"1C","paperSpace":true,"layer":"0","name":"*Paper_Space","position":{"x":0,"y":0,"z":0},"name2":"*Paper_Space","xrefPath":""},"*Paper_Space0":{"handle":"24","layer":"0","name":"*Paper_Space0","position":{"x":0,"y":0,"z":0},"name2":"*Paper_Space0","xrefPath":""}},"entities":[{"type":"CIRCLE","handle":"66","layer":"0","colorIndex":256,"lineweight":-1,"lineTypeScale":1,"lineType":"BYLAYER","center":{"x":39.900000000000006,"y":38.3,"z":0},"radius":23.800210083106407},{"type":"LWPOLYLINE","vertices":[{"x":80,"y":70,"z":0},{"x":120,"y":60,"z":0},{"x":130,"y":30,"z":0},{"x":130,"y":10,"z":0},{"x":110,"y":0,"z":0},{"x":100,"y":20,"z":0},{"x":110,"y":40,"z":0},{"x":80,"y":40,"z":0},{"x":70,"y":60,"z":0},{"x":80,"y":70,"z":0}],"handle":"67","layer":"0","colorIndex":256,"lineweight":-1,"lineTypeScale":1,"lineType":"BYLAYER","shape":false,"hasContinuousLinetypePattern":false}]}
))
*/
