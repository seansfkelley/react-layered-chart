import gulp from 'gulp';
import browserify from 'browserify';
import watchify from 'watchify';
import notify from 'gulp-notify';
import sourceStream from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import filter from 'gulp-filter';
import livereload from 'gulp-livereload';
import rename from 'gulp-rename';
import stylus from 'gulp-stylus';
import concat from 'gulp-concat';

function buildScript(src, dest, standalone, watch = false, dieOnError = false) {
  let bundler = browserify(src, {
    extensions   : [ '.js', '.jsx' ],
    debug        : true,
    cache        : {},
    packageCache : {},
    fullPaths    : true,
    transform    : [ 'babelify' ],
    standalone
  });

  if (watch) {
    bundler = watchify(bundler);
  }

  function rebundle() {
    const bundle = bundler.bundle();

    if (!dieOnError) {
      bundle.on('error', notify.onError({
        title : 'Browserify Error',
        sound : 'Sosumi',
        wait  : false
      }));
    }

    return bundle
      .pipe(sourceStream(dest))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps : true}))
      .pipe(notify({
        title   : 'Finished compiling Javascript',
        message : '<%= file.relative %>',
        sound   : 'Glass',
        wait    : false
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'))
      .pipe(filter([ '*', '!*.map' ]))
      .pipe(livereload());
  }

  bundler.on('update', rebundle);
  return rebundle();
}

function buildStyles() {
  return gulp.src('./styles/**/*.styl')
    .pipe(sourcemaps.init({ loadMaps : true }))
    .pipe(stylus())
    .on('error', notify.onError({
      title : 'Stylus Error',
      sound : 'Sosumi',
      wait  : false
    }))
    .pipe(concat('all-styles.css'))
    .pipe(notify({
      title   : 'Finished compiling CSS',
      message : '<%= file.relative %>',
      sound   : 'Glass',
      wait    : false
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./build'))
    .pipe(filter([ '*', '!*.map' ]))
    .pipe(livereload());
}

gulp.task('styles', buildStyles);

gulp.task('dev:watch', () => {
  livereload.listen();
  buildScript('./src-dev/dev/index.jsx', 'dev-index.js', undefined, true, false);
  buildStyles();
  return gulp.watch('./styles/**/*.styl', [ 'styles' ]);
});

gulp.task('scripts:dist', () => {
  return buildScript('./src/index.js', 'index.js', 'react-layered-chart', false, true);
});
gulp.task('dist', [ 'scripts:dist', 'styles' ]);
gulp.task('default', [ 'dev:watch' ]);
