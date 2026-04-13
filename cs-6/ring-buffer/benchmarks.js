import { RingBuffer } from './class.js';

const measureTime = (fn, runs = 1) => {
  const start = performance.now();
  for (let i = 0; i < runs; i++) {
    fn();
  }
  const end = performance.now();
  return (end - start) / runs;
}

const benchmarkUnshift = (n, runs = 10) => {
const buffer = new RingBuffer(n + 1);
  
  const time = measureTime(() => {
    for (let i = 0; i < n; i++) {
      buffer.unshift(i);
    }
  }, runs);
  
  return time;
}

const benchmarkShift = (n, runs = 10) => {
  const buffer = new RingBuffer(n + 1);
  for (let i = 0; i < n; i++) {
    buffer.unshift(i);
  }
  
  const time = measureTime(() => {
    for (let i = 0; i < n; i++) {
      buffer.shift();
    }
  }, runs);
  
  return time;
}

const operationsCounts = [100, 1000, 10000, 100000];
const runsPerTest = 10;

console.log('=== Производительность RingBuffer ===\n');
console.log('Кол-во операций | unshift (мс) | shift (мс)');
console.log('----------------------------------------');

for (const n of operationsCounts) {
  const timeUnshift = benchmarkUnshift(n, runsPerTest);
  const timeShift = benchmarkShift(n, runsPerTest);
  console.log(`${String(n)} | ${timeUnshift} | ${timeShift}`);
}