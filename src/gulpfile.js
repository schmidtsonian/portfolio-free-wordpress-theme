
var gulp        = require('gulp');
var gulpFilter  = require('gulp-filter')
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var sass        = require('gulp-sass');
var jade        = require('gulp-jade');
var ts          = require('gulp-typescript');
var mainBowerFiles = require('gulp-main-bower-files');
var bourbon     = require('node-bourbon');

var sourcemaps  = require('gulp-sourcemaps');
var rename      = require('gulp-rename');
var debug       = require('gulp-debug');

var connect = require('gulp-connect');

var path = {
    scripts : {
        src  : 'app/typescripts/**/*.ts',
        out  : 'main.js',
        dest : 'public/js/',
        vendor: 'vendor.js'
    },
    styles  : {
        src  : 'app/styles/**/*.scss',
        dest : 'public/css/',
    },
    views   : {
        src  : 'app/views/**/*.jade',
        dest : 'public/'
    },
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

//TO-DO:
//watch all typescript files and reload on save
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

gulp.task('views', function() {
    return gulp.src(path.views.src)
            .pipe(jade({
                pretty: true
            }))
            .pipe(gulpFilter(['*', '*/*', '!_*.*', '!*/_*.*']))
            .pipe(gulp.dest(path.views.dest))
            .pipe(connect.reload());
});

gulp.task('watch', function () {

    gulp.watch(path.views.src, ['views']);
    gulp.watch(path.styles.src, ['styles']);
    gulp.watch(path.scripts.src, ['scripts']);
});

gulp.task('default', ['main-bower-files', 'scripts', 'styles', 'views', 'webserver', 'watch']);
