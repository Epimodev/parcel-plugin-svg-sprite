# SVG sprite parcel plugin
A parcel plugin which create a svg sprite of imported svg and inject it in html entry point.

> warning : this plugin overwrite HTMLPackager, it can be in conflit with other plugin which also overwrite HTMLPackager.

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
  <!-- relative path to the html file -->
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

But if the svg file is in an `assets` folder, the plugin will ignore the file and the import will return the url of the file.
> This behavior was added to avoid impacts on svg font loaded by css. For the moment, I didn't find a better way to handle this case.

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

### In which case I didn't recommend this plugin
Like I said above, if you want to import a lot of svg files, or big illustrations, this plugin is not good for your case.
You first render time can be too much delayed.

### Improvement to make
- code splitting : this plugin can generate a svg by bundle, but I didn't find a way to inject them at runtime. For the moment, all svg of all bundles are injected at compilation time in HTML entry point.
