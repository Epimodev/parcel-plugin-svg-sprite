const HTMLPackager = require('parcel-bundler/src/packagers/HTMLPackager');
const posthtml = require('posthtml');
const { createSprite } = require('./utils');

/**
 * @desc check if a similar svg is already in svg list based on hash content instead of file path
 * @param {object[]} svgList - list of svg imported
 * @param {object} svgItem - imported svg to check
 * @return {boolean}
 */
function svgAlreadyExists(svgList, svgItem) {
  const itemIndex = svgList.findIndex(({ hash }) => hash === svgItem.hash);
  return itemIndex >= 0;
}

/**
 * @desc inject svg sprite as first child of body element
 * @param {string} svgSprite - generated sprite
 * @param {object} tree - html tree from posthtml
 */
function insertSvg(svgSprite, tree) {
  if (svgSprite !== '') {
    tree.match({ tag: 'body' }, node => {
      node.content.splice(0, 0, svgSprite);
      return node;
    });
  }
}

class HtmlPackager extends HTMLPackager {
  /**
   * @desc inject in html file imported js, css, and svg
   * @param {Asset} asset - Html asset
   */
  async addAsset(asset) {
    let html = asset.generated.html || '';
    // Find child bundles that have JS or CSS sibling bundles,
    // add them to the head so they are loaded immediately.
    const siblingBundles = Array.from(this.bundle.childBundles).reduce(
      (p, b) => p.concat([...b.siblingBundles.values()]),
      [],
    );
    const headBundles = siblingBundles.filter(b => ['css', 'js'].includes(b.type));
    // generate sprite in html packager because svg packager is run after
    const svgSprite = await this.getSvgSprite();

    if (siblingBundles.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      html = posthtml([
        this.insertSiblingBundles.bind(this, headBundles),
        insertSvg.bind(this, svgSprite),
      ]).process(html, { sync: true }).html;
    }

    await this.write(html);
  }

  /**
   * @desc get all svg assets which are imported by js file
   * @return {Asset[]}
   */
  getSvgAssets() {
    // only svg loaded from js file have 'generated.svg' property
    // more details in `./asset.js` file
    return Array.from(this.bundler.loadedAssets)
      .map(loadedAsset => loadedAsset[1])
      .filter(a => a.type === 'svg' && !!a.generated.svg);
  }

  /**
   * @desc get all svg imported by js and create the svg sprite
   * @return {string}
   */
  async getSvgSprite() {
    const assets = this.getSvgAssets();
    const svgList = assets.reduce((acc, asset) => {
      const { hash, path, content } = asset.generated.svg;
      const svgItem = { hash, path, content };
      const alreadyExists = svgAlreadyExists(acc, svgItem);

      if (!alreadyExists) {
        return [...acc, svgItem];
      }
      return acc;
    }, []);

    if (svgList.length > 0) {
      return createSprite(svgList);
    }
    return '';
  }
}

module.exports = HtmlPackager;
