# SVG sprite parcel plugin
A parcel plugin which create a svg sprite of imported svg and inject it in html entry point.

> Since version 2.0.0 this plugin works only with Parcel 2.0.
> If you use Parcel 1.x you can use v1.4.1

### Installation

This plugins is composed of a transformer and a packager.

```bash
yarn add -D parcel-transformer-svg-sprite
yarn add -D parcel-packager-svg-sprite

# or with npm

npm install -D parcel-transformer-svg-sprite
npm install -D parcel-packager-svg-sprite
```

### Configuration

Once the transformer and the packager are installed, you have to create `.parcelrc` file:
```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.svg": ["parcel-transformer-svg-sprite"]
  },
  "packagers": {
    "*.html": "parcel-packager-svg-sprite"
  }
}
```

> You can set a more specific pattern instead of `*.svg` if you want to create a sprite only with svg from a specific folder.

### Exemple
Once the plugin is installed, you can import svg like this :

In html file :
```html
...
<body>
  ...
  <!-- relative path from the html file -->
  <svg>
    <use href="icons/checkmark.svg">
  </svg>
  ...
</body>
...
```

In javascript file :
```javascript
import checkmark from './icons/checkmark.svg';

const icon = `
<svg>
  <use xlink:href="${checkmark}" />
</svg>`;
```

Or with JSX :
```javascript
import React from 'react';
import checkmark from './icons/checkmark.svg';

const icon = (
  <svg>
    <use xlinkHref={checkmark} />
  </svg>
);
```

When you import a svg, you get the id of the symbol generated in built sprite. This is why you can use it as `xlink:href` attribute.

#### HTML input example:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <div id="app"></div>
  <script src="app.tsx"></script>
</body>
</html>
```

#### Generated HTML expected
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <!-- Begin of svg sprite wrapper -->
  <svg width="0" height="0" style="position:absolute">
    <symbol id="generated_symbol_id_1" xmlns="http://www.w3.org/2000/svg">
      <!-- first imported svg file content -->
    </symbol>
    <symbol id="generated_symbol_id_2" xmlns="http://www.w3.org/2000/svg">
      <!-- second imported svg file content -->
    </symbol>
    ...
  </svg>
  <!-- End of svg sprite wrapper -->
  <div id="app"></div>
  <script src="app.tsx"></script>
</body>
</html>
```

### Optimization

This plugin uses [svgo](https://github.com/svg/svgo) to optimize svgs before generating the sprite.  
You can configure svgo by creating `svgo.config.js` file. More info about available options here: https://github.com/svg/svgo#configuration

### Advantages :
- Unlike initial parcel behaviour which return an url, here you can apply css to customise the imported svg (for example the color, the stroke, ...)
- Optimize the size of imported svg
- Create a sprite to avoid several http requests
- Inject sprite at compilation time instead of browser run time
- Limit DOM manipulation by injected only symbol id instead of all svg nodes when the svg is injected in a page

### Why inject SVG sprite in HTML instead of using an external file ?
Each time we inject an element \<use xlink:href="file.svg#icon" /> in the DOM, a request is launch to get "file.svg". So the icon appear with a delay depending on http response time. If you have an animation when svg symbol is injected in DOM, the icon will appear in the middle of animation.

### In which case this plugin is made for
This plugin was developped to create icon system based on svg.
As long as you import little svg and the size of the sprite isn't too heavy, I think there isn't any problem (it depends on your case but in my opinion the sprite should not exceed 100kb).
If you have to much icons, there is a risk to have a significantly bad impact on the delay of first render of your web app.

### In which case I don't recommend this plugin
Like I said above, if you want to import a lot of svg files, or big illustrations, this plugin is not good for your case.
You first render time can be too much delayed.

### Improvement to make
- code splitting: this plugin can generate a svg by bundle. For the moment, all svg of all bundles are injected at compilation time in HTML entry point.
