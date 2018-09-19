const path = require('path');
const XXHash = require('xxhash');
const { createSprite } = require('./sprite');

const STYLE_EXTENSIONS = ['.css', '.scss', '.sass', '.less', '.styl'];

/**
 * @desc Hash content with XXHash
 * @param {string} content - file content
 * @return {number} hash of the content
 */
function createHash(content) {
  const buffer = Buffer.from(content, 'utf8');
  const hash = XXHash.hash(buffer, 0xcafebabe);
  return hash;
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

module.exports = {
  createHash,
  importedByStyle,
  createSprite,
};
