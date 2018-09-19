const { Asset } = require('parcel-bundler');
const { createHash } = require('./utils');

class SvgAsset extends Asset {
  /**
   * @desc Generate asset of an svg file imported by js bundle
   * We consider that files from an `assets` folder has to be imported has RawAssets
   *
   * @return empty object if file is in an `assets` folder
   *         or the svg assets for SvgPackager wth a js asset which contain svg symbol id
   */
  async generate() {
    // this is used to keep original behavior with files imported by css for font
    // here `parentBundle` is null so we can't know if svg is imported by a css file
    const isFromAssets = this.name.includes('/assets/');
    const hash = await this.generateHash();

    if (isFromAssets) {
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
