const assert = require('assert');
const fs = require('fs');
const path = require('path');
const getWorker = require('../src/index');

const tessdata = path.join(__dirname, 'fixtures/tessdata');
const word = path.join(__dirname, 'fixtures/word.png');
const umlauts = path.join(__dirname, 'fixtures/umlauts.png');

describe('getWorker', () => {
  it('throws if tessdata is not a folder', async () => {
    try {
      const worker = await getWorker({ tessdata: '' });
      assert.fail();
    } catch (exception) {
      assert.equal(exception.message, 'options.tessdata should point to a directory');
    }
  });

  it('throws if language.traineddata is not found', async () => {
    try {
      const worker = await getWorker({ tessdata, languages: ['xyz'] });
      assert.fail();
    } catch (exception) {
      assert.equal(true, /Language file .*\/test\/fixtures\/tessdata\/xyz\.traineddata is not a file/.test(exception.message));
    }
  });

  it('exports worker.recognize', async () => {
    const worker = await getWorker({ tessdata, languages: ['eng'] });
    assert.equal('function', typeof worker.recognize);
  });

  it('recognizes text', async () => {
    const worker = await getWorker({ tessdata, languages: ['eng'] });
    const text = await worker.recognize(word, 'eng');
    assert.equal(text, 'Cool\n');
  });

  it('allows subsequent recognization', async () => {
    const worker = await getWorker({ tessdata, languages: ['eng'] });
    const first = await worker.recognize(word, 'eng');
    assert.equal(first, 'Cool\n');
    const second = await worker.recognize(word, 'eng');
    assert.equal(second, 'Cool\n');
  });

  it('loads different languages', async () => {
    const worker = await getWorker({ tessdata, languages: ['fin'] });
    const text = await worker.recognize(umlauts, 'fin');
    assert.equal(text, 'Mörkö\n');
  });

  it('respects language option', async () => {
    const worker = await getWorker({ tessdata, languages: ['eng', 'fin'] });
    const eng = await worker.recognize(umlauts, 'eng');
    assert.equal(eng, 'Morko\n');
    const fin = await worker.recognize(umlauts, 'fin');
    assert.equal(fin, 'Mörkö\n');
  });

  it('accepts Buffer', async () => {
    const worker = await getWorker({ tessdata, languages: ['eng'] });
    const text = await worker.recognize(fs.readFileSync(word), 'eng');
    assert.equal(text, 'Cool\n');
  });

  it('throws on unexpected image type', async () => {
    try {
      const worker = await getWorker({ tessdata, languages: ['eng'] });
      const text = await worker.recognize(null, 'eng');
      assert.fail();
    } catch (exception) {
      assert.equal(exception.message, 'Invalid input type (expected a string of a Buffer, got object)');
    }
  });
});
