"use strict";

const gulp = require("gulp");
const gulpSass = require("gulp-sass");
const gulpChanged = require("gulp-changed");
const gulpRename = require("gulp-rename");
const gulpImagemin = require("gulp-imagemin");
const gulpPostcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const browserSync = require("browser-sync").create();
const childProcess = require("child_process");
const del = require("del");

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "./_site/"
    }
  });
}

function browsersyncReload(done) {
  browserSync.reload();
  done();
}

function clean(done) {
  return del(["./_site/assets/"]);
  done();
}

function css() {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(gulpSass({ outputStyle: "expanded" }))
    .pipe(gulp.dest("./_site/assets/css/"))
    .pipe(gulpRename({ suffix: ".min" }))
    .pipe(gulpPostcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest("./_site/assets/css/"))
    .pipe(browserSync.stream());
}

function jekyll(done) {
  return childProcess
    .spawn("bundle", ["exec", "jekyll", "build"], { stdio: "inherit" })
    .on("close", done);
}

function images() {
  return gulp
    .src("./src/img/**/*")
    .pipe(gulpChanged("./_site/assets/img"))
    .pipe(gulpImagemin())
    .pipe(gulp.dest("./_site/assets/img"))
    .pipe(browserSync.stream());
}

const watch = gulp.parallel(browsersync, watchFiles);
const build = gulp.series(clean, gulp.parallel(css, images, jekyll));

function watchFiles() {
  gulp.watch(["./src/scss/**/*.scss"], css);
  gulp.watch(
    ["./_includes/**/*", "./_layouts/**/*", "./_pages/**/*"],
    gulp.series(jekyll, browsersyncReload)
  );
  gulp.watch(["./src/img/**/*{.png,.jpg,.svg,.gif}"], images);
}

exports.build = build;
exports.watch = watch;
exports.default = build;
