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

    var generate = _.partial(generateScreenshots, targetScenarios, options);
    var compare = _.partial(compareFiles, targetScenarios, options);
    var render = _.partial(renderReport, grunt, options);

    var jobPromise;

    if(flags.generate){

      jobPromise = generate('reference')

    }else{

      jobPromise = compare().then(render);
    }

    return jobPromise.then(done);
  });
};


/**
 * Initialise all the needed folders
 * @param options
 * @returns {{reference: string, actual: string, diff: string}}
 */
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

/**
 * Loop over every senario and viewport and apply func
 * @param senarios
 * @param options
 * @param func
 */
function loop(senarios, options, func){

  var folders = initDirs(options);

  return Promise.all(senarios.map(function(senario){

    var url = senario.url;
    var filename = (senario.label || url).replace(/https?:\/\//, '');

    return Promise.all(options.viewports.map(function(viewport){

      var file = filename+'-'+viewport.name+'.png';

      return func(senario, viewport, file, folders);
    }));

  }))
}

/**
 * generate a screenshot
 *
 * @param dest
 * @param senario
 * @param viewport
 * @param file
 * @param folders
 * @returns {*}
 */
function generateScreenshot(dest, senario, viewport, file, folders){

  var size = viewport.width+'x'+viewport.height;
  var filePath = path.join(folders[dest], file);

  var stream = screenshot(senario.url, size, senario);

  stream.pipe(fs.createWriteStream(filePath));

  return new Promise(function(resolve, reject){

    stream.on('error', reject);

    stream.on('end', _.partial(resolve, filePath));
  })
}

/**
 * generate all screenshots and pack them in dest
 * @param senarios
 * @param options
 * @param dest
 * @returns {*}
 */
function generateScreenshots(senarios, options, dest){

  return loop(senarios, options, _.partial(generateScreenshot, dest));
}

/**
 * compare file
 * @param senario
 * @param viewport
 * @param file
 * @param folders
 */
function compareFile(senario, viewport, file, folders){

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

      diffStream.on('end', _.partial(resolve, data));

    })
  });
}

/**
 * generate the actual screens and compare them
 * @param senarios
 * @param options
 * @returns {*}
 */
function compareFiles(senarios, options){

  return loop(senarios, options, function(senario, viewport, file, folders){

    return generateScreenshot('actual', senario, viewport, file, folders).then(function(){

      return compareFile(senario, viewport, file, folders);
    });

  })
}

/**
 * Renders the report
 * @param grunt
 * @param options
 * @param results
 */
function renderReport(grunt, options, results){

  var templatePath = path.join(__dirname, '../template');
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



