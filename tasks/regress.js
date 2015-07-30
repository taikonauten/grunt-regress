/*
 * grunt-regress
 * https://github.com/haithem/regress
 *
 * Copyright (c) 2015 Haithem Bel Haj
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var Promise = require('bluebird');
var _ = require('lodash');

var screenshot = require('../lib/screenshot-stream');
var diff = require('../lib/diff');


module.exports = function(grunt) {

  grunt.registerMultiTask('regress', 'CSS Regression Testing Plugin', function() {

    var done = this.async();
    var flags = this.flags;

    var options = this.options();
    var targetScenarios = this.data.scenarios;

    var generateScreens = _.partial(generateScreenshots, targetScenarios, options);
    var compare = _.partial(compareFiles, targetScenarios, options);
    var generateTempl = _.partial(generateTemplate, grunt, options);

    var jobPromise;

    if(flags.generate){

      jobPromise = generateScreens('reference')

    }else{

      jobPromise = generateScreens('actual').then(compare).then(generateTempl);
    }

    jobPromise.then(done);
  });


};

function initDirs(options){

  var referenceDir = options.dest+'/reference';
  var actualDir = options.dest+'/actual';
  var diffDir = options.dest+'/diff';

  mkdirp(referenceDir);
  mkdirp(actualDir);
  mkdirp(diffDir);

  return {
    reference: referenceDir,
    actual: actualDir,
    diff: diffDir
  }
}


function loop(senarios, options, func){

  var folders = initDirs(options);

  return Promise.all(senarios.map(function(senario){

    var url = senario.url;
    var filename = (senario.label || url).replace(/https?:\/\//, '');

    return Promise.all(options.viewports.map(function(viewport){

      var size = viewport.width+'x'+viewport.height;
      var file = filename+'-'+viewport.name+'.png';

      return func(senario, viewport, file, folders);
    }));

  }))
}


function generateScreenshots(senarios, options, dest){

  return loop(senarios, options, function(senario, viewport, file, folders){

    var size = viewport.width+'x'+viewport.height;
    var filePath = path.join(folders[dest], file);

    var stream = screenshot(senario.url, size, senario);

    stream.pipe(fs.createWriteStream(filePath));

    return new Promise(function(resolve, reject){

      stream.on('error', reject);

      stream.on('end', function(){

        resolve(filePath);
      });
    })
  });
}

function compareFiles(senarios, options){

  return loop(senarios, options, function(senario, viewport, file, folders){

    var referenceFile = path.join(folders.reference, file);
    var actualFile = path.join(folders.actual, file);
    var diffFile = path.join(folders.diff, file);

    return diff(referenceFile, actualFile).then(function (data) {

      data.senario = senario;
      data.viewport = viewport;
      data.folders = folders;
      data.file = file;

      return new Promise(function(resolve, reject){

        var diffStream = data.getDiffImage().pack();

        diffStream.pipe(fs.createWriteStream(diffFile));

        diffStream.on('error', reject);

        diffStream.on('end', function () {

          resolve(data)
        });
      })
    });

  });
}


function generateTemplate(grunt, options, results){

  var templatePath = 'template';
  var data = {};

  var index = path.join(templatePath, 'index.html');
  var dest = path.join(options.dest, 'index.html');
  var styles = path.join(templatePath, 'semantic.min.css');
  var script = path.join(templatePath, 'semantic.min.js');

  data.script = grunt.file.read(script);
  data.styles = grunt.file.read(styles);
  data.results = results;
  data.flatResult = _.flatten(results);
  data.average = _.reduce(data.flatResult, missSum, 0) / data.flatResult.length;

  var indexTemplate = _.template(grunt.file.read(index));

  grunt.file.write(dest, indexTemplate(data));

  function missSum(a, b){

    return a + parseFloat(b.misMatchPercentage);
  }
}


