const { Asset } = require('parcel-bundler');
const urlJoin = require('parcel-bundler/lib/utils/urlJoin');
const md5 = require('parcel-bundler/lib/utils/md5');
const { isPathIncluded, createHash } = require('./utils');

class SvgAsset extends Asset {
  /**
   * @desc check if we use raw asset behavior or svg sprite behavior
   */
  useRawAssetsBehavior() {
    return !isPathIncluded(this.name);
  }

  /**
   * @desc load asset contents
   */
  // eslint-disable-next-line consistent-return
  load() {
    if (this.useRawAssetsBehavior()) {
      // we do nothing because it will be copied by the RawPackager directly.
    } else {
      return super.load();
    }
  }

  /**
   * @desc Generate asset of an svg file imported by js bundle
   *
   * @return generated assets for packagers
   */
  async generate() {
    // if path isn't include, we keep original RawAsset behavior
    if (this.useRawAssetsBehavior()) {
      // code copied from RawAsset to copy RawAsset behavior
      // https://github.com/parcel-bundler/parcel/blob/master/packages/core/parcel-bundler/src/assets/RawAsset.js
      const pathToAsset = urlJoin(this.options.publicURL, this.generateBundleName());
      return [
        {
          type: 'js',
          value: `module.exports=${JSON.stringify(pathToAsset)};`,
        },
      ];
    }

    const hash = await this.generateHash();

    return [
      {
        type: 'svg',
        value: {
          hash,
          path: this.name,
          content: this.contents,
        },
      },
      {
        type: 'js',
        value: `module.exports='#${hash}'`,
      },
    ];
  }

  /**
   * @desc generate hash of svg content
   * @return {string}
   */
  async generateHash() {
    if (this.content) {
      return createHash(this.contents).toString();
    }

    return md5.file(this.name);
  }
}

module.exports = SvgAsset;
