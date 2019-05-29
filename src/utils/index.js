const path = require('path');
const XXHash = require('xxhashjs');
const { includePaths, excludePaths } = require('./config');
const { createSprite } = require('./sprite');

const STYLE_EXTENSIONS = ['.css', '.scss', '.sass', '.less', '.styl'];

/**
 * @desc Hash content with XXHash
 * @param {string} content - file content
 * @return {number} hash of the content
 */
function createHash(content) {
  const buffer = Buffer.from(content, 'utf8');
  const hash = XXHash.h32(buffer, 0xcafebabe);
  return hash.toNumber();
}

/**
 * @desc Check if asset is imported by style file (css, sass, less or stylus)
 * @param {Asset} asset - loaded asset
 * @return {boolean} true if asset is imported by style file
 */
function importedByStyle(asset) {
  const parentDep = asset.parentDeps.values().next().value;
  if (parentDep) {
    const parentPath = parentDep.parent;
    const parentExt = path.extname(parentPath);
    return STYLE_EXTENSIONS.includes(parentExt);
  }
  return false;
}

function isPathIncluded(filePath) {
  // if includePaths is null, it means the option isn't set. By default we include all svg
  const isIncluded = includePaths !== null ? includePaths.some(p => p === filePath) : true;
  // if excludePaths is null, it means the option isn't set. By default we don't exclude any svg
  const isExluded = excludePaths !== null ? excludePaths.some(p => p === filePath) : false;

  return isIncluded && !isExluded;
}

module.exports = {
  isPathIncluded,
  createHash,
  importedByStyle,
  createSprite,
};
