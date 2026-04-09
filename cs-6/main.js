const size = [100, 1000, 10000, 100000];

const n = 100000;

const WARMUP_ITERATIONS = 100000; // количество итераций прогрева

const createHoleyArray = (length) => {
  const array = [];
  for (let i = 0; i < length; i++) {
    // Random array filling
    const random = Math.random() < 0.5 ? 0 : 1;  
    if (random) {
      array[i] = 0;
    }
  }
  return array;
}
const createRegularArray = (length) => new Array(length).fill(0) // без дырок

const logResults = (name, size, method, time) => {
  console.log(`${name} (${size}) for ${method}: ${time}`);
}

const getMethodName = (method) => method.toString().replace(/\(array\) => array\./g, '');

const push = (array) => array.push(0);
const pop = (array) => array.pop();
const shift = (array) => array.shift();
const unshift = (array) => array.unshift(0);
const methods = [push, pop, shift, unshift];

const checkArray = (type, size, method) => {
  const array = type === 'Holey' ? createHoleyArray(size) : createRegularArray(size);
  
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    method(array);
  }
  
  // Restore initial state
  if (type === 'Holey') {
    array.length = 0;
    array.length = size;
    for (let i = 0; i < size; i++) {
      // Random array filling
      const random = Math.random() < 0.5 ? 0 : 1;  
      if (random) {
        array[i] = 0;
      }
    }
  } else {
    array.length = size;
    array.fill(0);
  }
  
  // Measure time
  const start = performance.now();
  for (let i = 0; i < n; i++) {
    method(array);
  }
  const end = performance.now();
  const time = end - start;

  const methodName = getMethodName(method);

  logResults(`${type} array`, size, methodName,  time);
}

const runBenchmarks = (size) => {
  methods.forEach(method => {
    checkArray('Holey', size, method);
    checkArray('Regular', size, method);
  })
}

size.forEach(s => runBenchmarks(s));