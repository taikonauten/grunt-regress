/*
 * grunt-regress
 * https://github.com/haithem/regress
 *
 * Copyright (c) 2015 Haithem Bel Haj
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var path = require('path');
var open = require('open');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var mkdirp = Promise.promisify(require('mkdirp'));

var screenshot = require('./screenshot-stream');
var diff = require('./diff');

// mus do this first
var templatePath = path.join(__dirname, '../template');

var styles = fs.readFileAsync(path.join(templatePath, 'semantic.min.css'));
var scripts = fs.readFileAsync(path.join(templatePath, 'semantic.min.js'));
var index = fs.readFileAsync(path.join(templatePath, 'index.html')).then(_.template.bind(_))


// export the module
module.exports = function (options, scenarios, dogenerate, done) {

  var generate = _.partial(generateScreenshots, scenarios, options);
  var compare = _.partial(compareFiles, scenarios, options);
  var render = _.partial(renderReport, options);

  var jobPromise = dogenerate? generate('reference') : compare().then(render);

  return jobPromise.then(done);
};


/**
 * Initialise all the needed folders
 * @param options
 * @returns {{reference: string, actual: string, diff: string}}
 */
function initDirs(options) {

  var dest = options.dest;

  var referenceDir = dest + '/reference';
  var actualDir = dest + '/actual';
  var diffDir = dest + '/diff';

  return Promise.all([

    mkdirp(referenceDir),
    mkdirp(actualDir),
    mkdirp(diffDir)

  ]).then(function(){

    return {
      reference: referenceDir,
      actual: actualDir,
      diff: diffDir
    }
  })


}

/**
 * Loop over every scenario and viewport and apply func
 * @param scenarios
 * @param options
 * @param func
 */
function loop(scenarios, options, func) {

  return initDirs(options).then(function(folders){

    return Promise.all(scenarios.map(function (scenario) {

      var senario = _.extend(scenario, options);

      var url = scenario.url;
      var filename = (scenario.label || url).replace(/https?:\/\//, '');

      return Promise.all(options.viewports.map(function (viewport) {

        var file = filename + '-' + viewport.name + '.png';

        return func(scenario, viewport, file, folders);
      }));

    }))
  });

}

/**
 * generate a screenshot
 *
 * @param dest
 * @param scenario
 * @param viewport
 * @param file
 * @param folders
 * @returns {*}
 */
function generateScreenshot(dest, scenario, viewport, file, folders) {

  var size = viewport.width + 'x' + (viewport.height || 1);
  var filePath = path.join(folders[dest], file);

  var stream = screenshot(scenario.url, size, scenario);

  stream.pipe(fs.createWriteStream(filePath));

  return new Promise(function (resolve, reject) {

    stream.on('error', reject);

    stream.on('end', _.partial(resolve, filePath));
  })
}

/**
 * generate all screenshots and pack them in dest
 * @param scenarios
 * @param options
 * @param dest
 * @returns {*}
 */
function generateScreenshots(scenarios, options, dest) {

  return loop(scenarios, options, _.partial(generateScreenshot, dest));
}

/**
 * compare file
 * @param scenario
 * @param viewport
 * @param file
 * @param folders
 */
function compareFile(scenario, viewport, file, folders) {

  var referenceFile = path.join(folders.reference, file);
  var actualFile = path.join(folders.actual, file);
  var diffFile = path.join(folders.diff, file);

  return diff(referenceFile, actualFile).then(function (data) {

    data.scenario = scenario;
    data.viewport = viewport;
    data.folders = folders;
    data.file = file;

    return new Promise(function (resolve, reject) {

      var diffStream = data.getDiffImage().pack();

      diffStream.pipe(fs.createWriteStream(diffFile));

      diffStream.on('error', reject);

      diffStream.on('end', _.partial(resolve, data));

    })
  });
}

/**
 * generate the actual screens and compare them
 * @param scenarios
 * @param options
 * @returns {*}
 */
function compareFiles(scenarios, options) {

  return loop(scenarios, options, function (scenario, viewport, file, folders) {

    return generateScreenshot('actual', scenario, viewport, file, folders).then(function () {

      return compareFile(scenario, viewport, file, folders);
    });

  })
}

/**
 * Renders the report
 * @param grunt
 * @param options
 * @param results
 */
function renderReport(options, results) {

  var data = {};

  var dest = path.join(options.dest, 'index.html');

  return Promise.all([index, styles, scripts]).then(function(arr){

    var indexTemplate = arr[0];

    data.styles = arr[1];
    data.script = arr[2];
    data.results = results;
    data.flatResult = _.flatten(results);
    data.average = _.reduce(data.flatResult, missSum, 0) / data.flatResult.length;

    return Promise.promisify(fs.writeFile)(dest, indexTemplate(data)).then(_.partial(open, dest));
  })



  function missSum(a, b) {

    return a + parseFloat(b.misMatchPercentage);
  }
}