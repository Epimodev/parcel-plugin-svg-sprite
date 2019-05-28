# SVG sprite parcel plugin
A parcel plugin which create a svg sprite of imported svg and inject it in html entry point.

> warning : this plugin overwrite HTMLPackager, it can be in conflit with other plugin which also overwrite HTMLPackager.

> Until version `1.1.2` files in an `assets` folder or subfolder wasn't injected in sprite to have the possibility to use svg files in css (css can't reference a svg symbol).  
> Since version `1.2.0` you can use options `include` and `exclude` to define path patterns you don't want to inject in sprite and import them as file url.
> This can be usefull to import svg font in css or to use svg file in css background-image.

### Installation
```bash
yarn add -D parcel-plugin-svg-sprite

# or with npm

npm install -D parcel-plugin-svg-sprite
```

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

### Options :

This plugin has 2 options to give the possibility to handle specific cases.  
Those options can be set only in `package.json` in the field `svgSpriteOptions`.

**exclude** `string[]`  
List of glob patterns which should not be included in svg sprite and should be imported as file url (like Parcel's default behavior).  
This can be usefull if you need to import file in css (for font or background-image).  
example (to avoid inject files from assets folder in svg sprite):
```json
// package.json
"name": "my-package-name",
...
"svgSpriteOptions": {
  "exclude": ["**/assets/**/*"]
}
```

**include** `string[]`  
List of glob patterns which can be injected in svg sprite.  
If the option isn't set all svg file which aren't exluded will be injected in svg sprite.  
If a file path matches with both include and exclude options, the path will be excluded.  
example:
```json
// package.json
"name": "my-package-name",
...
"svgSpriteOptions": {
  "include": ["src/**/*"]
}
```

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
- code splitting : this plugin can generate a svg by bundle, but I didn't find a way to inject them at runtime. For the moment, all svg of all bundles are injected at compilation time in HTML entry point.
