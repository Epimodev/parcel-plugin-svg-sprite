const { Asset } = require('parcel-bundler');
const { isPathIncluded, createHash } = require('./utils');

class SvgAsset extends Asset {
  /**
   * @desc Generate asset of an svg file imported by js bundle
   *
   * @return empty object if file path is not include or exluded
   *         or the svg assets for SvgPackager wth a js asset which contain svg symbol id
   */
  async generate() {
    const hash = await this.generateHash();

    // if path isn't include, we keep original behavior with RawAssets
    if (!isPathIncluded(this.name)) {
      return {};
    }

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
        value: `module.exports = '#${hash}'`,
      },
    ];
  }

  /**
   * @desc generate hash of svg content
   * @return {string}
   */
  async generateHash() {
    return createHash(this.contents).toString();
  }
}

module.exports = SvgAsset;
