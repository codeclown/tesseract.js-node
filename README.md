# tesseract.js-node

A focused node-only version of tesseract.js.


## Why?

[tesseract.js](https://github.com/naptha/tesseract.js) is developed for both node and browser, and includes (in my opinion) bloated functionality like automatic downloading of traineddata-files in the background.

At the time of writing, it also does not have any tests for node-environment (only browser). Example issue where this matters: https://github.com/naptha/tesseract.js/issues/339.

I just wanted a way to use Tesseract 4.0 in a node project without all this extra functionality and background downloads from third-party servers.


## Usage

Download traineddata-files from somewhere, e.g. officially:

```bash
mkdir tessdata
cd tessdata
curl -O -L https://github.com/tesseract-ocr/tessdata_fast/raw/master/eng.traineddata
curl -O -L https://github.com/tesseract-ocr/tessdata_fast/raw/master/fin.traineddata
```

Then use the library in a node project:

```js
const getWorker = require('tesseract.js-node');
const worker = await getWorker({
  tessdata: '/path/to/tessdata',    // where .traineddata-files are located
  languages: ['eng', 'fin']         // languages to load
});
const text = await worker.recognize('/path/to/image', 'eng');
```

You can supply the input image in various ways:

```js
// path to image
const text = await worker.recognize('/path/to/image', 'eng');
// Buffer
const text = await worker.recognize(fs.readFileSync('/path/to/image'), 'eng');
// Buffer (from node-canvas)
const text = await worker.recognize(canvas.toBuffer('image/png'), 'eng');
```

See [tesseract.test.js](test/tesseract.test.js) for other examples.


## Development

```bash
npm test
```

Useful resources:

- https://tesseract-ocr.github.io/4.0.0/a02186.html#a96899e8e5358d96752ab1cfc3bc09f3e
- https://github.com/naptha/tesseract.js-core/blob/v2.0.0-beta.11/examples/node/minimal/index.asm.js
- https://github.com/jeromewu/tesseract.js-utils/blob/b5fba24a8ffcdd88302b5709a1023330138a281e/src/readImage.js


## Credits

Thanks to [tesseract.js-core](https://github.com/naptha/tesseract.js-core) contributors for the groundwork!


## License

Apache License 2.0
