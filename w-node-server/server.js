var multiparty = require('multiparty')
var http = require('http')
var util = require('util')
var path = require('path')
var fs = require('fs')

http.createServer(function (req, res) {
  if (req.url === '/upload' && req.method === 'POST') {
    // parse a file upload
    var form = new multiparty.Form({
      uploadDir: path.join(__dirname, 'uploads')
    })

    form.parse(req, function (err, fields, files) {
      Object.keys(files).forEach(key => {
        let file = files[key][0]
        console.log(file)
        console.log(path.join(__dirname, 'uploads/sfsf.jpg'))
        if (file.originalFilename === 'blob') {
          fs.renameSync(file.path, path.join(__dirname, 'uploads/sfsf.jpg'))
        }
      })
      res.writeHead(200, {
        'content-type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      })
      res.write('received upload:\n\n')
      res.end(util.inspect({fields: fields, files: files}))
    })
  } else {
    res.writeHead(200, {
      'content-type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    })
    res.end()
  }

}).listen(5555)
