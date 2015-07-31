/*
 * grunt-regress
 * https://github.com/haithem/regress
 *
 * Copyright (c) 2015 Haithem Bel Haj
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    regress: {

      options:{

        dest: 'css_regression'
      },

      task: {

        options: {

          viewports: [
            {
              "name": "phone",
              "width": 320,
              "height": 480
            }, {
              "name": "tablet_v",
              "width": 568,
              "height": 1024
            }, {
              "name": "tablet_h",
              "width": 1024,
              "height": 768
            }
          ]
        },

        scenarios: [
          {
            "label": "getbootstrap.com",
            "url": "http://getbootstrap.com"
          },
          {
            "label": "getting-started",
            "url": "http://getbootstrap.com/getting-started/"
          }
        ]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'regress', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
