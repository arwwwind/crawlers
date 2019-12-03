const sharp = require('sharp');
const fs = require('fs');
const dir = require('path').join(
  require('os').homedir(),
  'Downloads/drive-download-20190805T094912Z-001/'
);

function resize() {
  fs.readdir(dir, function(err, files) {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function(file) {
      // Do whatever you want to do with the file
      console.log(file, typeof file);
      Promise.all(
        [600, 100].map(s => {
          return sharp(`${dir}${file}`)
            .resize(s, s, { fit: sharp.fit.inside })
            .toFile(`${dir}${file}-${s}.jpg`);
        })
      ).then(d => {
        console.log(done);
      });
    });
  });
}

resize();
