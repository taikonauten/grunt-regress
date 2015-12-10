/*
 * grunt-regress
 * https://github.com/haithem/regress
 *
 * Copyright (c) 2015 Haithem Bel Haj
 * Licensed under the MIT license.
 */

'use strict';

var regress = require('../lib/regress');


module.exports = function (grunt) {

  grunt.registerMultiTask('regress', 'CSS Regression Testing Plugin', function () {

    regress(this.options(), this.data.scenarios, this.flags.generate, this.async())
  });
};