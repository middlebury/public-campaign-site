import path from 'node:path';
import gulp from 'gulp';
import replace from 'gulp-replace';
import { createConfig } from '@middlebury/gulp-config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const { cwd } = process;

const args = yargs(hideBin(process.argv)).argv;
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

export const replaceImagePaths = () => {
  const imagesDir = args.imagesDir || '/img/';
  return gulp
    .src('./dist/css/*.css')
    .pipe(replace('/img/', imagesDir))
    .pipe(gulp.dest('./dist/css'));
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

export const { dev, build } = createConfig(options);