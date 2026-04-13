import { RingBuffer } from './class.js';

const measureTime = (fn) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return (end - start);
}

const benchmarkUnshift = (n) => {
const buffer = new RingBuffer(n + 1);
  
  const time = measureTime(() => {
    for (let i = 0; i < n; i++) {
      buffer.unshift(i);
    }
  });
  
  return time;
}

const benchmarkShift = (n) => {
  const buffer = new RingBuffer(n + 1);
  for (let i = 0; i < n; i++) {
    buffer.unshift(i);
  }
  
  const time = measureTime(() => {
    for (let i = 0; i < n; i++) {
      buffer.shift();
    }
  });
  
  return time;
}

const operationsCounts = [10, 1000, 10000, 100000];

console.log('=== Производительность RingBuffer ===\n');
console.log('Кол-во операций | unshift (мс) | shift (мс)');
console.log('----------------------------------------');

for (const n of operationsCounts) {
  const timeUnshift = benchmarkUnshift(n);
  const timeShift = benchmarkShift(n);
  console.log(`${String(n)} | ${timeUnshift} | ${timeShift}`);
}