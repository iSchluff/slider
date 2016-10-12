var path = require("path");
var babel = require("rollup-plugin-babel");

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    rollup: {
      options: {
        sourceMap: true,
        plugins: [
          babel({
            exclude: './node_modules/**'
          })
        ]
      },
      files: {
        'dest': 'dist/slider.js',
        'src' : 'index.js', // Only one source file is permitted
      },
    },

    watch: {
      js: {
        files: ["src/*.js"],
        tasks: ["rollup"],
        options: {spawn: false}
      }
    }
  });

  // Default task(s).
  grunt.registerTask("build", ["rollup"]);
  grunt.registerTask("default", ["build"]);
  grunt.registerTask("dev", ["build", "watch"])

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });
};
