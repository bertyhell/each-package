#!/usr/bin/env node

var getopts = require('getopts-compat');

(function () {
  var options = getopts(process.argv.slice(2), {
    alias: { depth: 'd', silent: 's' },
    boolean: ['silent'],
    default: { depth: Infinity },
    stopEarly: true,
  });

  // define.option('-s, --silent, 'silent');
  // define.option('-d, --depth <depth>', 'depth', parseInt, Infinity);

  var args = options._;
  if (!args.length) {
    console.log('Missing command. Example usage: each-package [command]');
    return process.exit(-1);
  }

  var path = require('path');
  var eachPackage = require('..');

  if (!options.silent)
    options.header = function (entry, command, args) {
      console.log('\n----------------------');
      console.log([command].concat(args).join(' ') + ' (' + path.dirname(entry.path) + ')');
      console.log('----------------------');
    };

  eachPackage(args[0], args.slice(1), options, function (err, results) {
    if (err) {
      console.log(err.message);
      return process.exit(err.code || -1);
    }
    var errors = [];
    for (var index = 0; index < results.length; index++) {
      var result = results[index];
      if (result.error || result.result.code !== 0) errors.push(results[index]);
    }

    if (!options.silent) {
      console.log('\n======================');
      if (errors.length) {
        console.log('Errors (' + errors.length + ')');
        // eslint-disable-next-line no-redeclare
        for (var index = 0; index < errors.length; index++) {
          // eslint-disable-next-line no-redeclare
          var result = errors[index];
          if (result.error) console.log(result.path + ' Error: ' + result.error.message);
          else console.log(result.path + ' Exit Code: ' + result.result.code);
        }
      } else console.log('Success (' + results.length + ')');
      console.log('======================');
    }

    process.exit(errors.length ? -1 : 0);
  });
})();
