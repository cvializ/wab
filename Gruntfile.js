module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      build: {
        src: ['./*.js*', './js/*.js*', './js/aircraft/*.js*']
      }
    },
    express: {
      options: {

      },
      dev: {
        options: {
          script: './server.js'
        }
      },
      prod: {
        options: {
          script: './server.js',
          node_env: 'production'
        }
      }
    },
    watch: {
      express: {
        files: ['**/*.js','!**/node_modules/**', '!**/bower_components/**'],
        tasks: ['express:dev'],
        options: {
          spawn: false
        }
      }
    }
  });
  grunt.option('stack', true);

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('server', ['express:dev', 'watch']);
};
