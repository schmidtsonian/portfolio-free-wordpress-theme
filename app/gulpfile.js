
var gulp        = require('gulp');
var gulpFilter  = require('gulp-filter')
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var sass        = require('gulp-sass');
var mainBowerFiles = require('gulp-main-bower-files');
var bourbon     = require('node-bourbon');

// var jade        = require('gulp-jade');

var jade = require('gulp-jade-for-php')

var sourcemaps  = require('gulp-sourcemaps');
var rename      = require('gulp-rename');
var debug       = require('gulp-debug');

var connect = require('gulp-connect');

var TEMPLATE_PATH = "portfolio-free-wordpress-theme/"

var path = {
    styles  : {
        src  : 'app/styles/**/*.scss',
        dest : '../' + TEMPLATE_PATH
    },
    views   : {
        src  : 'app/views/**/*.jade',
        dest : '../' + TEMPLATE_PATH
    },
};

gulp.task('webserver', function() {
    connect.server({
        root: 'public',
        livereload: true,
        directoryListing: true
    });
});
 

// gulp.task('main-bower-files', function() {
//     return gulp.src('./bower.json')
//         .pipe(mainBowerFiles( ))
//         .pipe(uglify())
//        .pipe(concat(path.scripts.vendor))
//         .pipe(gulp.dest(path.scripts.dest));
// });


gulp.task('styles', function () {
    return gulp.src(path.styles.src)
        .pipe(gulpFilter(['*', '_*.*']))
        .pipe(sourcemaps.init())
        .pipe(sass({ 
            includePaths: require('node-bourbon').includePaths
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.styles.dest))
        .pipe(connect.reload());
});

gulp.task('views', function() {
    return gulp.src(path.views.src)
        .pipe(gulpFilter(['*', '*/*', '!_*.*', '!*/_*.*']))
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(path.views.dest))
        .pipe(connect.reload());
});

gulp.task('watch', function () {

    gulp.watch(path.views.src, ['views']);
    gulp.watch(path.styles.src, ['styles']);
    // gulp.watch(path.scripts.src, ['scripts']);
});

gulp.task('default', ['styles', 'views', 'webserver', 'watch']);
// gulp.task('default', ['main-bower-files', 'scripts', 'styles', 'views', 'webserver', 'watch']);
