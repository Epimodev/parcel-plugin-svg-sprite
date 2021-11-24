// @ts-expect-error
import { hashString } from "@parcel/hash"
import { Transformer } from "@parcel/plugin"
import { loadConfig, optimize } from "svgo"

function generateSvgSymbol(id: string, code: string): string {
  let symbol = code.replace('xmlns="http://www.w3.org/2000/svg"', "")
  symbol = symbol.replace(/xml:space="\w+"/, "")
  symbol = symbol.replace("<svg", `<symbol id="${id}"`)
  symbol = symbol.replace("</svg", "</symbol")
  return symbol
}

export default new Transformer({
  async loadConfig() {
    const userConfig = await loadConfig()
    const svgoConfig = userConfig ?? {}

    return {
      svgo: svgoConfig,
    }
  },

  async transform({ asset, config }) {
    if (asset.type === "svg") {
      // @ts-expect-error
      const svgoConfig = config.svgo

      const svgCode = await asset.getCode()
      const optimizedSvg = optimize(svgCode, svgoConfig).data

      const svgId = hashString(optimizedSvg)
      const svgSymbol = generateSvgSymbol(svgId, optimizedSvg)
      const code = `export default "#${svgId}";`

      asset.type = "js"
      asset.setCode(code)
      asset.meta.svgId = svgId
      asset.meta.svgSymbol = svgSymbol
      asset.meta.type = "svg-sprite"
    } else {
      console.warn("parcel-transformer-svg-sprite works only with .svg files")
    }

    return [asset]
  },
})
