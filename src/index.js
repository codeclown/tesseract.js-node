const fs = require('fs');
const path = require('path');
const TesseractCore = require('tesseract.js-core');

const getWorker = options => {
  options = Object.assign({
    tessdata: null,
    languages: []
  }, options);
  options.tessdata = options.tessdata.toString();

  return Promise.resolve()
    .then(() => {
      if (!fs.existsSync(options.tessdata) || !fs.lstatSync(options.tessdata).isDirectory()) {
        throw new Error(`options.tessdata should point to a directory`);
      }

      const languageFiles = options.languages.map(language => {
        const languageFile = path.join(options.tessdata, `${language}.traineddata`);
        if (!fs.existsSync(languageFile) || !fs.lstatSync(languageFile).isFile()) {
          throw new Error(`Language file ${languageFile} is not a file`);
        }
        return languageFile;
      });

      return new Promise((resolve, reject) => {
        TesseractCore().then(TessModule => {
          // Emscripten Module Object causes an infinite Promise-loop
          // https://github.com/emscripten-core/emscripten/issues/5820
          delete TessModule.then;

          options.languages.forEach((language, index) => {
            const buffer = fs.readFileSync(languageFiles[index]);
            TessModule.FS.writeFile(`${language}.traineddata`, buffer);
          });
          resolve(TessModule);
        });
      });
    })
    .then(TessModule => {
      return {
        recognize: (input, language) => {
          let image;
          if (typeof input === 'string') {
            image = fs.readFileSync(input);
          } else if (Buffer.isBuffer(input)) {
            image = input;
          } else {
            throw new Error(`Invalid input type (expected a string of a Buffer, got ${typeof input})`);
          }

          const pointer = TessModule._malloc(image.length * Uint8Array.BYTES_PER_ELEMENT);
          TessModule.HEAPU8.set(image, pointer);
          const pix = TessModule._pixReadMem(pointer, image.length);

          const api = new TessModule.TessBaseAPI();
          api.Init(null, language);
          api.SetImage(pix);

          const text = api.GetUTF8Text();

          api.End();
          TessModule.destroy(api);
          TessModule._free(pointer);

          return text;
        }
      };
    });
};

module.exports = getWorker;
