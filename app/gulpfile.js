
var gulp        = require('gulp');
var removeFiles = require('gulp-remove-files');
var gulpFilter  = require('gulp-filter')
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var sass        = require('gulp-sass');
var ts          = require('gulp-typescript');
var mainBowerFiles = require('gulp-main-bower-files');
var bourbon     = require('node-bourbon');

// var jade = require('gulp-jade-for-php')

var sourcemaps  = require('gulp-sourcemaps');
var rename      = require('gulp-rename');
var debug       = require('gulp-debug');

var connect = require('gulp-connect');

var TEMPLATE_PATH = "portfolio-free-wordpress-theme/"

var path = {
    scripts : {
        src  : 'src/typescripts/**/*.ts',
        out  : 'main.js',
        dest : '../' + TEMPLATE_PATH + "js/",
        vendor: 'vendor.js'
    },
    styles  : {
        src  : 'src/styles/**/*.scss',
        dest : '../' + TEMPLATE_PATH
    },
    // views   : {
    //     src  : 'src/views/**/*.jade',
    //     dest : '../' + TEMPLATE_PATH
    // },
    assets :{
        src: 'src/assets/**/*',
        dest : '../' + TEMPLATE_PATH
    }
};

gulp.task('webserver', function() {
    connect.server({
        root: 'public',
        livereload: true,
        directoryListing: true
    });
});


gulp.task('main-bower-files', function() {
    return gulp.src('./bower.json')
        .pipe(mainBowerFiles( ))
        .pipe(uglify())
        .pipe(concat(path.scripts.vendor))
        .pipe(gulp.dest(path.scripts.dest));
});


gulp.task('scripts', function () {
    return gulp.src(path.scripts.src)
        .pipe(gulpFilter(['*', '_*.*']))
        .pipe(sourcemaps.init())
        .pipe(ts({
            target: "ES5",
			noImplicitAny: true,
			out: path.scripts.out
		}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.scripts.dest))
        .pipe(connect.reload());
});

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

// gulp.task('views', function() {
//     return gulp.src(path.views.src)
//         .pipe(gulpFilter(['*', '*/*', '!_*.*', '!*/_*.*']))
//         .pipe(jade({
//             pretty: true
//         }))
//         .pipe(gulp.dest(path.views.dest))
//         .pipe(connect.reload());
// });

gulp.task('copy', function(){
    return gulp.src(path.assets.src)
        .pipe(gulp.dest(path.assets.dest))
        .pipe(connect.reload());
});


gulp.task('clean', function () {
  gulp.src('../' + TEMPLATE_PATH + '**/*')
    .pipe(removeFiles());
});


gulp.task('watch', function () {

    // gulp.watch(path.styles.src, ['copy']);
    gulp.watch(path.styles.src, ['styles']);
    gulp.watch(path.scripts.src, ['scripts']);
    // gulp.watch(path.views.src, ['views']);
});

// gulp.task('default', ['clean', 'copy','styles', 'views', 'webserver', 'watch']);
gulp.task('default', ['main-bower-files', 'scripts', 'styles', 'watch']);
