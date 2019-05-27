const path = require('path');
const fse = require('fs-extra');
const glob = require('glob');

/**
 * @desc Create a svg sprite with <symbol> elements
 * @param {object[]} svgList - list of svg info for sprite creation
 * @param {string} svgList[].path
 * @param {string} svgList[].hash
 * @param {string} svgList[].content
 * @return {Promise} promise with svg sprite string
 */
function getConfig() {
  const packagePath = path.resolve('package.json');
  const packageContent = fse.readJsonSync(packagePath);
  if (packageContent && packageContent.svgSpriteOptions) {
    const { include, exclude } = packageContent.svgSpriteOptions;

    // check options
    if (include && !isStringArray(include)) {
      throw new Error('include option must be an array of string');
    }
    if (exclude && !isStringArray(exclude)) {
      throw new Error('include option must be an array of string');
    }

    return {
      include: include || null,
      exclude: exclude || null,
    };
  }

  // if option doesn't exist, we set default options
  return {
    include: null,
    exclude: null,
  };
}

/**
 * @desc Get list of files which can be include
 *       files will be include in sprite only if file is imported
 * @param {object} config - plugin config
 * @param {string[] | null} config.include - glob pattern to include
 * @param {string[] | null} config.exclude - glob pattern to exclude
 * @param {string[] | null} excludePaths - path to exclude
 * @return {string[] | null}
 */
function getIncludePaths(config, excludePaths) {
  if (config.include) {
    // second params will avoid to have path which are in excludePaths
    // in case there are intersection between `include` and `exclude` patterns
    return getPaths(config.include, excludePaths || []);
  }
  return null;
}

/**
 * @desc Get list of files which will not be include
 *       instead those file will be imported with original behavior
 *       (copy the file in dist folder)
 * @param {object} config - plugin config
 * @param {string[] | null} config.include - glob pattern to include
 * @param {string[] | null} config.exclude - glob pattern to exclude
 * @return {string[] | null}
 */
function getExcludePaths(config) {
  if (config.exclude) {
    return getPaths(config.exclude);
  }
  return null;
}

/**
 * @desc Get list of path of svg files which match with a glob pattern
 * @param {string[]} patterns
 * @param {string[]} exclude - path to exclude
 * @return {string[]}
 */
function getPaths(patterns, exclude = []) {
  const svgPaths = [];

  patterns.forEach(pattern => {
    const matches = glob.sync(pattern);
    matches.forEach(match => {
      const extension = path.extname(match);

      // we push only svg file because this plugin works only svg files
      if (extension === '.svg') {
        const absolutePath = path.resolve(match);

        const alreadyInclude = svgPaths.some(svgPath => absolutePath === svgPath);
        const excluded = exclude.some(excludePath => absolutePath === excludePath);

        // avoid doublons and paths which are exluded
        if (!alreadyInclude && !excluded) {
          svgPaths.push(absolutePath);
        }
      }
    });
  });

  return svgPaths;
}

/**
 * @desc Check if a value is an array of string
 * @param {any} value
 * @return {boolean}
 */
function isStringArray(value) {
  if (Array.isArray(value)) {
    return value.every(v => typeof v === 'string');
  }
  return false;
}

const config = getConfig();
const excludePaths = getExcludePaths(config);
const includePaths = getIncludePaths(config, excludePaths);

module.exports = {
  config,
  includePaths,
  excludePaths,
};
