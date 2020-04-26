var path = require('path');
var Iterator = require('fs-iterator');

var exec = require('./lib/exec');

function execCommand(command, options, callback) {
  if (!options.silent) {
    console.log('\n----------------------');
    console.log(command.join(' ') + ' (' + options.relativePath + ')');
    console.log('----------------------');
  }
  // console.log()
  exec(command, options, callback);
}

module.exports = function eachPackage(command, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  var iterator = new Iterator(process.cwd(), {
    filter: function filter(entry) {
      if (entry.stats.isDirectory()) return entry.basename !== '.git' && entry.basename !== 'node_modules';
      if (entry.stats.isFile()) return entry.basename === 'package.json';
    },
    alwaysStat: true,
  });
  iterator.forEach(
    function (entry, callback) {
      if (!entry.stats.isFile()) return callback();
      execCommand(command, { relativePath: path.dirname(entry.path), cwd: path.dirname(entry.fullPath), silent: options.silent }, function (err) {
        callback(err);
      });
    },
    { callbacks: true, concurrency: 1 },
    callback
  );
};
