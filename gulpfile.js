const path = require('path');
const { createConfig } = require('@middlebury/gulp-config');

const { cwd } = process;

const DIST_DIR = 'dist';
const SOURCE_DIR = 'src';

const dist = (parts = '') => path.resolve(cwd(), DIST_DIR, parts);
const src = (parts) => path.resolve(cwd(), SOURCE_DIR, parts);

const options = {
    scripts: {
      src: src('js/index.ts'),
      watch: src('js/**/*'),
      dest: dist('js/bundle.js')
    },
    typescriptBuild: true
};

module.exports = createConfig(options);