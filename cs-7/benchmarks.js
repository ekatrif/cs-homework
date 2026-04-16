import { EncodeDecode } from './a.js';
import { EncodeDecodeIndexed } from './b.js';

const strings = ["hello", "мир", ""];

const measureTime = (fn) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return (end - start);
}

console.log('time for "a" realization: ', measureTime(() => new EncodeDecode().encode(strings).at(1)))
console.log('time for "b" realization: ', measureTime(() => new EncodeDecodeIndexed().encode(strings).at(1)))

