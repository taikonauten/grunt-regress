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
      tests: ['css_regression']
    },

    // Configuration to be run (and then tested).
    regress: {

      options:{

        dest: './css_regression',
        delay: 1
      },

      test: {

        options: {

          hide: ['#carbonads-container'],

          viewports: [
            {
              name: "phone",
              width: 320
            },
            {
              name: "tablet",
              width: 568
            }
          ]
        },

        scenarios: [
          {
            label: "getbootstrap.com",
            url: "http://getbootstrap.com/getting-started/"
          }
        ]
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'regress']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
