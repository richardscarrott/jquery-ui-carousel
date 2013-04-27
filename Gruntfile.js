module.exports = function(grunt) {

  var _ = require('underscore'),
    pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    
    pkg: pkg,

    jquerymanifest: {
        options: {
          source: '<%= pkg %>',
          overrides: {
            name: 'rs.carousel',
            keywords: _.without(pkg.keywords, 'jquery'),
            dependencies: {
              jquery: '>=1.8',
              'jquery.ui.widget': '>=1.8'
            },
            // for some reason licences aren't picked up from package.json
            licenses: pkg.licenses
          }
        }
    },

    jshint: {
      src: 'src/**/*.js',
      options: {
        globals: {
          jQuery: true
        },
        bitwise: true,
        camelcase: true,
        curly: true,
        eqeqeq: true,
        forin: true,
        immed: true,
        indent: 4,
        latedef: true,
        newcap: true,
        nonew: true,
        quotmark: 'single',
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        browser: true
      }
    },

    uglify: {
      options: {
          banner: '/*! <%= pkg.name %>-min.js | <%= pkg.version %> | <%= grunt.template.today("yyyy-mm-dd") %> | <%= pkg.docs %> */\n',
          report: 'gzip'
      },
      build: {
        files: {
          'dist/js/min/<%= pkg.name %>-min.js': ['dist/js/<%= pkg.name %>.js'],
          'dist/js/min/<%= pkg.name %>-autoscroll-min.js': ['dist/js/<%= pkg.name %>-autoscroll.js'],
          'dist/js/min/<%= pkg.name %>-continuous-min.js': ['dist/js/<%= pkg.name %>-continuous.js'],
          'dist/js/min/<%= pkg.name %>-touch-min.js': ['dist/js/<%= pkg.name %>-touch.js'],
          'dist/js/min/<%= pkg.name %>-all-min.js': ['dist/js/*.js']
        }
      }
    },

    cssmin: {
      options: {
          banner: '/*! <%= pkg.name %>-min.css | <%= pkg.version %> | <%= grunt.template.today("yyyy-mm-dd") %> | <%= pkg.docs %> */',
          report: 'gzip'
      },
      build: {
        src: 'dist/css/*.css',
        dest: 'dist/css/min/rs-carousel-min.css'
      }
    },

    jasmine: {
      src: 'src/js/jquery.rs.carousel.js',
      options: {
        specs: 'tests/spec/*.js',
        helpers: 'tests/lib/jasmine-jquery.js',
        vendor: ['vendor/modernizr.3dtransforms.touch.js', 'vendor/jquery.js', 'vendor/jquery.ui.widget.js'],
        styles: ['tests/lib/reset.css', 'src/css/*.css']
      }
    },

    replace: {
      build: {
        options: {
          variables: {
            'VERSION': '<%= pkg.version %>',
            'HOMEPAGE': '<%= pkg.homepage %>'
          },
          prefix: '@'
        },
        files: [{
          expand: true,
          cwd: 'src/',
          src: '**',
          dest: 'dist/'
        }]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-jquerymanifest');
  grunt.loadNpmTasks('grunt-replace');

  grunt.registerTask('default', ['jshint', 'jasmine', 'replace', 'uglify', 'cssmin', 'jquerymanifest']);
};