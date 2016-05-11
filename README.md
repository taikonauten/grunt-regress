# grunt-regress

> visual regression testing for grunt - based on PhantomJS 2

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-regress --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-regress');
```

## The "regress" task

### Overview
In your project's Gruntfile, add a section named `regress` to the data object passed into `grunt.initConfig()`.

### Usage Examples

#### Default Options
In this example, we test the responsiveness of the bootstrap button.

```js
grunt.initConfig({
  regress: {
    options: {
      // destination folder for the tests
      dest: 'css_regression' // this is required
    },
    your_target: {
      // Target-specific file lists and/or options go here.
      options: {
        // viewports you want to test for all scenarios
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
      // the pages
      scenarios: [
        {
          "label": "button", // some label
          "url": "http://getbootstrap.com", // the test page
          "delay": 1, // wait one second
          "selector": ".bs-docs-masthead .btn", // select an element out
          "hide": "#carbonads" // hide an element
        }, ...
      ]
    },
  },
});
```

To generated the reference screens just execute the task `grunt regress:your_target:generate`.
To test your designs and get a nice report just run `grunt regress:your_target`.

### Options

#### options.dest
Type: `String`

The destination path where the generated test file will go. **Make sure to create the folder before firing up the task**

#### options.viewports
Type: `Array`

An Array with all the Viewport definition.
the properties width, height and name are required.

#### scenarios
Type: `Array`

An Array of all the Scenario Objects you want to test.
These Objects must have the label and url properties.

##### scenario.crop

Type: `boolean`  
Default: `false`

Crop to the set height.

##### scenario.delay

Type: `number` *(seconds)*  
Default: `0`

Delay capturing the screenshot. Useful when the site does things after load that you want to capture.

##### scenario.selector

Type: `string`

Capture a specific DOM element.

##### scenario.hide

Type: `array`

Hide an array of DOM elements.

##### scenario.headers

Type: `object`  
Default: `{}`

Set custom headers.

##### scenario.cookies

Type: `array` or `object`

A string with the same format as a [browser cookie](http://en.wikipedia.org/wiki/HTTP_cookie) or an object of what [`phantomjs.addCookie`](http://phantomjs.org/api/phantom/method/add-cookie.html) accepts.

##### scenario.username

Type: `string`

Username for authenticating with HTTP auth.

##### scenario.password

Type: `string`

Password for authenticating with HTTP auth.

##### scenario.format

Type: `string`  
Default: `png`

Set format to render the image as. Supported formats are `png` and `jpg`.

##### scenario.scale

Type: `number`  
Default: `1`

Scale webpage `n` times.

##### scenario.userAgent

Type: `string`

Set a custom user agent. 

## Thanks
Many thanks to:
- The PhamtomJS Team
- sindresorhus for his work on the phantom-bridge
- kevva for his work on screenshot-stream

And to all the community You guys are awesome :)

## License

MIT

Made with ♥ by [taikonauten](https://taikonauten.com)
