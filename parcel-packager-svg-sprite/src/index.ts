// @ts-expect-error
import HTMLPackager from "@parcel/packager-html"
import { Packager } from "@parcel/plugin"
import posthtml from "posthtml"

const CONFIG = Symbol.for("parcel-plugin-config")
const packager = HTMLPackager[CONFIG]

async function generateSprite(symbols: Set<string>) {
  let sprite =
    '<svg aria-hidden="true" width="0" height="0" style="position:absolute">'

  symbols.forEach(symbol => {
    sprite += symbol
  })

  sprite += "</svg>"

  return sprite
}

export default new Packager({
  loadConfig: packager.loadConfig,
  async package(args) {
    const { bundleGraph } = args

    // Collect SVGs
    const svgSymbols = new Set<string>()
    const svgBundles: Record<string, string> = {}
    bundleGraph.getBundles().forEach(bundle => {
      // Fill svgBundles which is used to replace href in html `use` tag
      const entryAssets = bundle.getEntryAssets()
      const svgAsset = entryAssets.find(
        asset => asset.meta.type === "svg-sprite",
      )
      if (svgAsset) {
        svgBundles[`/${bundle.name}`] = `#${svgAsset.meta.svgId}`
      }

      // Fill svgSynbols which is used to generate svg sprite
      bundle.traverseAssets(asset => {
        if (
          asset.meta.type === "svg-sprite" &&
          typeof asset.meta.svgSymbol === "string"
        ) {
          svgSymbols.add(asset.meta.svgSymbol)
        }
      })
    })


    const svgSprite = await generateSprite(svgSymbols)

    const injectSprite: posthtml.Plugin<unknown> = tree => {
      tree.match({ tag: "body" }, node => {
        node.content?.splice(0, 0, svgSprite)
        return node
      })
    }

    // If an svg is imported from an html file
    // we replace xlink:href attribute by the symbol id
    const replaceUseHref: posthtml.Plugin<unknown> = tree => {
      tree.match({ tag: "svg" }, node => {
        const svgUseTagElement = node.content?.find(
          child => typeof child !== "string" && child.tag === "use",
        )
        if (svgUseTagElement) {
          const href: string | undefined =
            // @ts-expect-error
            svgUseTagElement.attrs.href ||
            // @ts-expect-error
            svgUseTagElement.attrs["xlink:href"]

          const symbolId = href ? svgBundles[href] : undefined

          if (symbolId) {
            // @ts-expect-error
            delete svgUseTagElement.attrs.href
            // @ts-expect-error
            svgUseTagElement.attrs["xlink:href"] = symbolId
          }
        }
        return node
      })
    }

    // run parcel html packager
    let contents: string = (await packager.package(args)).contents
    // add svg sprite
    const proceedHtml = await posthtml([injectSprite, replaceUseHref]).process(
      contents,
    )
    contents = proceedHtml.html

    return {
      contents: contents,
    }
  },
})
