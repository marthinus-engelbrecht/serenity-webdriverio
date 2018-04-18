import gulp = require('gulp');
import ts = require('gulp-typescript');
import sourceMaps = require('gulp-sourcemaps');
import {spawn} from 'child_process';

gulp.task('pre-push', ['test']);

gulp.task('test', ['compile'], () => {
    return spawn(
        'istanbul',
        'cover --root build/local -x **/**unit_test.js --dir ./build/coverage ./node_modules/mocha/bin/_mocha build/**/**unit_test.js --require build/local/config/mocha-bootstrap.js'.split(' '),
        {stdio: 'inherit'})
        .on('close', (exitCode)=> {
            process.exit(exitCode)
        });
});

gulp.task('compile', function () {
    const tsProject = ts.createProject('tsconfig.json');

    return gulp.src('source/**/*.ts')
        .pipe(sourceMaps.init())
        .pipe(tsProject())
        .on('error', ()=> {
            process.exit(1)
        })
        .pipe(sourceMaps.write('../maps'))
        .pipe(gulp.dest('build/local'));
});