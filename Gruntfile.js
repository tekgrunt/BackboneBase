'use strict';
var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 9000;
var fs = require('fs');
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var serveStatic = require('serve-static');
var mountFolder = function (connect, dir) {
  return serveStatic(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'
// templateFramework: 'lodash'

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);

  // Automatically load required Grunt tasks
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin'
  });

  grunt.loadNpmTasks('grunt-connect-proxy');

  // configurable paths
  var config = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    config: config,
    watch: {
      options: {
        nospawn: true,
        livereload: LIVERELOAD_PORT
      },
      sass: {
        files: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['sass:server']
      },
      livereload: {
        options: {
          livereload: grunt.option('livereloadport') || LIVERELOAD_PORT
        },
        files: [
          '<%= config.app %>/*.html',
          '{.tmp,<%= config.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= config.app %>}/scripts/{,*/}*.js',
          '<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
          '<%= config.app %>/scripts/templates/*.{ejs,mustache,hbs}'
        ]
      },
      jst: {
        files: [
          '<%= config.app %>/scripts/templates/*.ejs'
        ],
        tasks: ['jst']
      },
      test: {
        files: ['<%= config.app %>/scripts/{,*/}*.js', 'test/spec/**/*.js'],
        tasks: ['test:true']
      }
    },
    connect: {
      options: {
        port: grunt.option('port') || SERVER_PORT,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      proxies: [],
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              require('grunt-connect-proxy/lib/utils').proxyRequest,
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, config.app),
              function (req, res, next) {
                if (!/\/artist/.test(req.url)) return next();
                fs.createReadStream(config.app + '/index.html').pipe(res);
              }
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              mountFolder(connect, 'test'),
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, config.app)
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect, options, defaultMiddleware) {
            return [
              require('grunt-connect-proxy/lib/utils').proxyRequest,
              mountFolder(connect, config.dist),
              function (req, res, next) {
                if (!/\/artist/.test(req.url)) return next();
                fs.createReadStream(config.dist + '/index.html').pipe(res);
              }
            ].concat(defaultMiddleware);
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      },
      test: {
        path: 'http://localhost:<%= connect.test.options.port %>'
      }
    },
    clean: {
      dist: ['.tmp', '<%= config.dist %>/*'],
      server: '.tmp'
    },
    xo: {
      all: [
        'Gruntfile.js',
        '<%= config.app %>/scripts/{,*/}*.js',
        '!<%= config.app %>/scripts/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://localhost:<%= connect.test.options.port %>/index.html']
        }
      }
    },
    sass: {
      options: {
        sourceMap: true,
        includePaths: ['app/bower_components']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/styles',
          src: ['*.{scss,sass}'],
          dest: '.tmp/styles',
          ext: '.css'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/styles',
          src: ['*.{scss,sass}'],
          dest: '.tmp/styles',
          ext: '.css'
        }]
      }
    },
    requirejs: {
      dist: {
        // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options: {
          almond: true,

          replaceRequireScript: [{
            files: ['<%= config.dist %>/index.html'],
            module: 'main'
          }],

          modules: [{name: 'main'}],

          baseUrl: '<%= config.app %>/scripts',

          mainConfigFile: '<%= config.app %>/scripts/main.js', // contains path specifications and nothing else important with respect to config
          dir: '.tmp/scripts',

          optimize: 'none', // optimize by uglify task
          useStrict: true,
          wrap: true

        }
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= config.dist %>/scripts/main.js': [
            '.tmp/scripts/main.js'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= config.app %>/index.html',
      options: {
        dest: '<%= config.dist %>'
      }
    },
    usemin: {
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: ['<%= config.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= config.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= config.dist %>/images'
        }]
      }
    },
    cssmin: {
      dist: {
        files: {
          '<%= config.dist %>/styles/main.css': [
            '.tmp/styles/{,*/}*.css',
            '<%= config.app %>/styles/{,*/}*.css'
          ]
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          /* removeCommentsFromCDATA: true,
          // https://github.com/config/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= config.app %>',
          src: '*.html',
          dest: '<%= config.dist %>'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,txt}',
            'images/{,*/}*.{webp,gif}',
            'assets/**',
            'Content/**',
            'styles/fonts/{,*/}*.*',
            'bower_components/bootstrap-sass-official/assets/fonts/bootstrap/*.*'
          ]
        }, {
          src: 'node_modules/apache-server-configs/dist/.htaccess',
          dest: '<%= config.dist %>/.htaccess'
        }]
      }
    },
    bower: {
      all: {
        rjsConfig: '<%= config.app %>/scripts/main.js'
      }
    },
    jst: {
      options: {
        amd: true
      },
      compile: {
        files: {
          '.tmp/scripts/templates.js': ['<%= config.app %>/scripts/templates/*.ejs']
        }
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= config.dist %>/scripts/{,*/}*.js',
            '<%= config.dist %>/styles/{,*/}*.css',
            '<%= config.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
            '<%= config.dist %>/styles/fonts/{,*/}*.*',
            'bower_components/bootstrap-sass-official/assets/fonts/bootstrap/*.*'
          ]
        }
      }
    },
    compress: {
      dist: {
        options: {
          archive: 'project.zip',
          pretty: true
        },
        expand: true,
        cwd: 'dist/',
        src: ['**/*'],
        dest: '/'
      }
    }
  });

  grunt.registerTask('createDefaultTemplate', function () {
    grunt.file.write('.tmp/scripts/templates.js', 'this.JST = this.JST || {};');
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve' + (target ? ':' + target : '')]);
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        'build',
        'configureProxies:server',
        'open:server',
        'connect:dist:keepalive'
      ]);
    }

    if (target === 'test') {
      return grunt.task.run([
        'clean:server',
        'createDefaultTemplate',
        'jst',
        'sass:server',
        'connect:test',
        'open:test',
        'watch'
      ]);
    }

    grunt.task.run([
      'clean:server',
      'createDefaultTemplate',
      'jst',
      'configureProxies:server',
      'sass:server',
      'connect:livereload',
      'open:server',
      'watch'
    ]);
  });

  grunt.registerTask('test', function (isConnected) {
    isConnected = Boolean(isConnected);
    var testTasks = [
      'clean:server',
      'createDefaultTemplate',
      'jst',
      'sass',
      'connect:test',
      'mocha'
    ];

    if (isConnected) {
      // already connected so not going to connect again, remove the connect:test task
      testTasks.splice(testTasks.indexOf('connect:test'), 1);
    }

    return grunt.task.run(testTasks);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'createDefaultTemplate',
    'jst',
    'sass:dist',
    'useminPrepare',
    'imagemin',
    'htmlmin',
    // 'concat',
    'cssmin',
    'requirejs',
    'uglify',
    'copy',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('package', [
    'build',
    'compress:dist'
  ]);

  grunt.registerTask('default', [
    'xo',
    'test',
    'build'
  ]);
};
