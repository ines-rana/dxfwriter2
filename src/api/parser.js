/*
We parse commonly used data types. You can parse more by adding custom
middleware. Data available by default on the req object:

   Cookies at req.cookies
   URL Queries (e.g. api/foo?query=foo) at req.query
   Form parameters and data at req.body
   JSON POST bodies at req.body
   Files uploaded from forms at req.files
      E.g. curl -F xls=@file.xls ... will set
      req.files[0] =  {"fieldname":"xls","originalname":"file.xls","encoding":"7bit","mimetype":"application/octet-stream","buffer":{"type":"Buffer","data":[123,...,123]},"size":524}
  req object keys: ["_readableState","_events","_eventsCount","_maxListeners","socket","httpVersionMajor","httpVersionMinor","httpVersion","complete","headers","rawHeaders","trailers","rawTrailers","aborted","upgrade","url","method","statusCode","statusMessage","client","_consuming","_dumped","next","baseUrl","originalUrl","_parsedUrl","params","query","res","body","cookies"]
*/

const version = "2022-08"
const Drawing = require('dxf-writer');
const fs = require('fs');

export default function handler(req, res) {
let d = new Drawing();

d.setUnits('Decimeters');
d.drawText(10, 0, 10, 0, 'Hello World'); // draw text in the default layer named "0"
d.addLayer('l_green', Drawing.ACI.GREEN, 'CONTINUOUS');
d.setActiveLayer('l_green');
d.drawText(20, -70, 10, 0, 'go green!');

//or fluent
d.addLayer('l_yellow', Drawing.ACI.YELLOW, 'DOTTED')
 .setActiveLayer('l_yellow')
 .drawCircle(50, -30, 25);

/*
fs.writeFileSync(__filename + '.dxf', d.toDxfString());
*/

  res.setHeader('X-Version', version);
  res.status(200).send(d.toDxfString());
/*
  res.status(200).json({
    "req.method": req.method,
    "req.query": req.query,
    "req.headers": req.headers,
    "req.url": req.url,
    "req.httpVersion": req.httpVersion,
    "req.body": req.body,
    "req.cookies": req.cookies,
  })
*/
}
