import { EncodeDecode } from './a.js';
import { EncodeDecodeByIndex } from './b.js';

const strings = Array.from({ length: 10_000_000 }, (_, i) => String(i));

const measureTime = (fn) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return (end - start);
}

const buffer = new EncodeDecode().encode(strings);
const buffer2 = new EncodeDecodeByIndex().encode(strings);

// console.log('time for "a" realization: ', measureTime(() => buffer.at(10_000_000)))
console.log('time for "b" realization: ', measureTime(() => buffer2.at(10_000_000)))

