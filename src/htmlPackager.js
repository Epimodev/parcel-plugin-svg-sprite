const path = require('path');
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
 * @desc create svg sprite with all svg imported
 * @return {string}
 */
async function createSvgSprite(assets) {
  const svgList = assets.reduce((acc, asset) => {
    const { hash, path: svgPath, content } = asset.generated.svg;
    const svgItem = { hash, path: svgPath, content };
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

/**
 * @desc replace href values in `svg use` elements
 * @param {object[]} svgAssets - list of svg assets
 * @param {object} tree - html tree from posthtml
 */
function replaceSvgHref(svgAssets, tree) {
  if (svgAssets.length > 0) {
    tree.match({ tag: 'svg' }, node => {
      const svgUseTagElement = node.content.find(child => child.tag === 'use');
      if (svgUseTagElement) {
        const href = svgUseTagElement.attrs.href || svgUseTagElement.attrs['xlink:href'];
        if (href) {
          svgAssets.forEach(svgAsset => {
            const { hash, path: svgPath } = svgAsset.generated.svg;
            const svgName = path.basename(svgPath).slice(0, -4);
            if (href.indexOf(svgName) >= 0) {
              delete svgUseTagElement.attrs.href;
              svgUseTagElement.attrs['xlink:href'] = `#${hash}`;
            }
          });
        }
      }
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
    const svgAssets = this.getSvgAssets();
    const svgSprite = await createSvgSprite(svgAssets);

    if (siblingBundles.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      html = posthtml([
        this.insertSiblingBundles.bind(this, headBundles),
        insertSvg.bind(this, svgSprite),
        replaceSvgHref.bind(this, svgAssets),
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
}

module.exports = HtmlPackager;
