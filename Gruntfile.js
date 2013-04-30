module.exports = function (grunt) {

    'use strict';

    var _ = require('underscore'),
        pkg = grunt.file.readJSON('package.json'),
        rVersion = /@VERSION/g,
        rHomepage = /@HOMEPAGE/g;

    grunt.initConfig({

        pkg: pkg,

        clean: ['dist/'],

        jshint: {
            src: ['GruntFile.js', 'src/**/*.js'],
            options: {
                globals: {
                    require: true,
                    module: true,
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

        jasmine: {
            src: 'src/js/jquery.rs.carousel.js',
            options: {
                specs: 'tests/spec/*.js',
                helpers: 'tests/lib/jasmine-jquery.js',
                vendor: ['vendor/modernizr.3dtransforms.touch.js', 'vendor/jquery.js', 'vendor/jquery.ui.widget.js'],
                styles: ['tests/lib/reset.css', 'src/css/*.css']
            }
        },

        copy: {
            build: {
                options: {
                    processContent: function (file) {
                        return file
                        .replace(rVersion, pkg.version)
                        .replace(rHomepage, pkg.homepage);
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**'],
                    dest: 'dist/'
                }]
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
                    // https://github.com/PixelMEDIA/grunt-jquerymanifest/commit/db34b1750dd8fb9ee9fffada1b793225426d730c
                    licenses: pkg.licenses,
                    author: pkg.author
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-jquerymanifest');

    grunt.registerTask('default', ['clean', 'jshint', 'jasmine', 'copy', 'uglify', 'cssmin', 'jquerymanifest']);
};