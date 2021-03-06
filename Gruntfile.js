module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');
  var chrome_mnf = grunt.file.readJSON('code/chrome.json');

  var fileMaps = { browserify: {}, uglify: {} };
  var file, files = grunt.file.expand({cwd:'code/js'}, ['*.js']);
  for (var i = 0; i < files.length; i++) {
    file = files[i];
    fileMaps.browserify['build/unpacked-dev/js/' + file] = 'code/js/' + file;
    fileMaps.uglify['build/unpacked-prod/js/' + file] = 'build/unpacked-dev/js/' + file;
  }

  //
  // config
  //

  grunt.initConfig({

    clean: ['build/unpacked-dev', 'build/unpacked-prod', 'build/*.crx'],

    mkdir: {
      unpacked: { options: { create: ['build/unpacked-dev', 'build/unpacked-prod', 'build/github-awesome-autocomplete.safariextension'] } },
      js: { options: { create: ['build/unpacked-dev/js'] } },
      css: { options: { create: ['build/unpacked-dev/css'] } }
    },

    jshint: {
      options: grunt.file.readJSON('lint-options.json'), // see http://www.jshint.com/docs/options/
      all: { src: ['package.json', 'lint-options.json', 'Gruntfile.js', 'code/**/*.js',
                   'code/**/*.json'] }
    },

    copy: {
      main: { files: [ {
        expand: true,
        cwd: 'code/',
        src: ['**', '!js/**', '!**/*.md'],
        dest: 'build/unpacked-dev/'
      } ] },
      prod: { files: [ {
        expand: true,
        cwd: 'build/unpacked-dev/',
        src: ['**', '!js/*.js', '!**/*.md'],
        dest: 'build/unpacked-prod/'
      } ] },
      artifact: { files: [ {
        expand: true,
        cwd: 'build/',
        src: [pkg.name + '-' + pkg.version + '.crx'],
        dest: process.env.CIRCLE_ARTIFACTS
      } ] }
    },

    browserify: {
      build: {
        files: fileMaps.browserify,
        options: {
          browserifyOptions: {
            debug: true,  // for source maps
            standalone: pkg['export-symbol']
          }
        }
      }
    },

    exec: {
      crx: {
        cmd: [
          './scripts/crxmake.sh build/unpacked-prod ./mykey.pem',
          'mv -v ./unpacked-prod.crx "build/' + pkg.name + '-' + pkg.version + '.crx"',
          '(cd build && zip -r "' + pkg.name + '-' + pkg.version + '.zip" unpacked-prod)'
        ].join(' && ')
      }
    },

    uglify: {
      min: { files: fileMaps.uglify }
    },

    watch: {
      js: {
        files: ['package.json', 'lint-options.json', 'Gruntfile.js', 'code/**/*.js',
                'code/**/*.json', 'code/**/*.sass', 'code/**/*.html'],
        tasks: ['default']
      }
    },

    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'build/unpacked-dev/css/content.css': 'code/scss/content.sass'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');

  //
  // custom tasks
  //

  grunt.registerTask('chrome-manifest',
    'Extend manifest.json with extra fields from package.json',
    function() {
      var fields = ['version', 'description'];
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        chrome_mnf[field] = pkg[field];
      }
      grunt.file.write('build/unpacked-dev/manifest.json', JSON.stringify(chrome_mnf, null, 4) + '\n');
      grunt.log.ok('chrome\'s manifest.json generated');
    }
  );

  //
  // testing-related tasks
  //

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('test-cont', ['default', 'watch']);
  grunt.registerTask('dev', ['test-cont']);

  //
  // DEFAULT
  //

  grunt.registerTask('default', ['clean', 'test', 'mkdir:css', 'sass', 'mkdir:unpacked', 'copy:main', 'chrome-manifest',
    'mkdir:js', 'browserify', 'copy:prod', 'uglify', 'exec']);

};
