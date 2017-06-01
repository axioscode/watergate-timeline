'use strict';

const gulp = require("gulp");
const env = require("gulp-env");
const gutil = require("gulp-util");
const runSequence = require('run-sequence');
const gulpConfig = require('./gulp/config');
const browserSync = require('./gulp/browsersync')

// Core Sub-Tasks For Processing Static Files
gulp.task('styles', require('./gulp/styles'));
gulp.task('templates', require('./gulp/templates'));
gulp.task('scripts', require('./gulp/scripts').build);
gulp.task('scripts:watch', require('./gulp/scripts').watch);
gulp.task('images', require('./gulp/images'))
gulp.task('data', require('./gulp/data'))
gulp.task('cachebust', require('./gulp/cachebust'))

// Google Drive Tasks
gulp.task('gdrive:add', require('./gulp/gdrive').addFile)
gulp.task('gdrive:fetch', require('./gulp/gdrive').fetch)
gulp.task('fetch-data', ['gdrive:fetch'])


// Env Tasks
gulp.task('set-dev-node-env', function() {
   return process.env.NODE_ENV = 'development';
});
gulp.task('set-prd-node-env', function() {
   return process.env.NODE_ENV = 'production';
});


// Basic Tasks
gulp.task('clean', require('./gulp/clean'))

gulp.task('build', ['set-prd-node-env', 'clean'], (done) => {
  runSequence(['images'], ['styles', 'templates', 'scripts', 'data'], ['cachebust'], done)
})
gulp.task('build:prd', ['build'])
gulp.task('build:dev', ['set-dev-node-env', 'clean'], (done) => {
  runSequence(['images'], ['styles', 'templates', 'scripts', 'data'], done)
})


gulp.task('watch', ['images', 'styles', 'templates', 'scripts:watch', 'data'], function (done) {
  gulp.watch(gulpConfig.paths.src.sass + "/**", ['styles']);
  gulp.watch(gulpConfig.paths.src.templates + "/**", ['templates']);
  gulp.watch(gulpConfig.paths.src.img + "/**", ['images'])

  gulp.watch(gulpConfig.data + "/**", () => {
    gulp.src(gulpConfig.data + "/**")
      .pipe(browserSync.stream({match: "**/*.json"}))
  })

  done();
});

gulp.task('serve', ['watch'], require('./gulp/serve'));
gulp.task('publish', ['build'], require('./gulp/publish'));

gulp.task('default', ['build'])
