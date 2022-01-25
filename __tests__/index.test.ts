import fs from 'fs';
import getFixturePath from '../src/readRootFile';
import run from '../src/runApp';

const readFile = (filename: string) =>
  fs.readFileSync(getFixturePath(filename), { encoding: 'utf8' });

it('app successfully runs', () => {
  document.body.innerHTML = readFile('index.html');
  expect(() => run()).not.toThrow();
});
