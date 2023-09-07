const path = require('path');
const gulp = require('gulp');
const { createConfig } = require('@middlebury/gulp-config');

const { cwd } = process;

const DIST_DIR = 'dist';
const SOURCE_DIR = 'src';

const dist = (parts = '') => path.resolve(cwd(), DIST_DIR, parts);
const src = (parts) => path.resolve(cwd(), SOURCE_DIR, parts);

const copyDeps = () => {
  // NOTE: Chart.bundle.min.js includes Momentjs but so far we are not using time axis
  // http://www.chartjs.org/docs/latest/getting-started/installation.html#bundled-build
  return gulp
    .src('./node_modules/chart.js/dist/Chart.min.js')
    .pipe(gulp.dest('./dist/js'));
};

const options = {
    scripts: {
      src: src('js/index.ts'),
      watch: src('js/**/*'),
      dest: dist('js/bundle.js')
    },
    beforeBuild: [copyDeps],
    typescriptBuild: true
};

module.exports = createConfig(options);