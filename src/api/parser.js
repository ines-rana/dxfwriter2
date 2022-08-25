// Parse a DXF file

/* Usage:
     curl -F DXFfile=@1.dxf https://dxfwriter.gtsb.io/api/parser[?format=json]
*/

// query parameters
//   format=json     (default is text/plain)


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



  res.setHeader('X-Version', version + '_34');

  var format = req.query.format || ""; // default

  //console.log(req.files[0].buffer.toString());
  const parsed_input = parserFunction(req.files[0].buffer.toString());

  if (format.toUpperCase() === "JSON" )
    {
      if (parsed_input) {
        res.send(parsed_input).json();
      } else {
        res.send({}).json();
      }
      res.end();
    } 
  else
    {
      res.setHeader('content-type', 'text/plain; charset=UTF-8');
      if (parsed_input) {
        res.send(JSON.stringify(parsed_input, null, 2) + '\n');
      } else {
        res.send("");
      }
      res.end();
    };

  return;
}




function parserFunction(text) {
  //console.log("input length:", text.length);
console.log("input length:", text.length);
  var parser = new DxfParser();
  try {
    var dxf = parser.parseSync(text);
console.log("parser OK");
    return (dxf);
  } catch (err) {
console.error(err.stack);
    //console.error(err.stack);
    return ({
      "error": err.stack
    });
  }
}
