module.exports = function(grunt) {

  var _ = require('underscore'),
    pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    
    pkg: pkg,

    jquerymanifest: {
        options: {
            source: "<%= pkg %>",
            overrides: {
                name: "rs.carousel",
                keywords: _.without(pkg.keywords, 'jquery')
            },
            dependencies: {
              jquery: '>=1.8',
              'jquery.ui.widget': '>=1.8'
            }
        }
    },

    jshint: {
      src: 'js/<%= pkg.name %>.js',
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
        banner: '/*! <%= pkg.name %> | <%= pkg.version %> | <%= grunt.template.today("yyyy-mm-dd") %> | <%= pkg.docs %> */\n'
      },
      build: {
        src: 'src/js/<%= pkg.name %>.js',
        dest: 'dist/js/<%= pkg.name %>.min.js'
      }
    },

    jasmine: {
      src: 'src/js/jquery.rs.carousel.js',
      options: {
        specs: 'tests/spec/*.js',
        helpers: 'tests/lib/jasmine-jquery.js',
        vendor: ['vendor/modernizr.3dtransforms.touch.js', 'vendor/jquery.js', 'vendor/jquery.ui.widget.js'],
        styles: ['tests/lib/reset.css', 'src/css/jquery.rs.carousel.css']
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-jquerymanifest');

  grunt.registerTask('default', ['jshint', 'jasmine', 'uglify', 'jquerymanifest']);
};