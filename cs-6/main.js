const size = [100, 1000, 10000, 100000];

const n = 100000;

const WARMUP_ITERATIONS = 1000; // количество итераций прогрева

const createHoleyArray = (length) => new Array(length) // с дырками
const createRegularArray = (length) => new Array(length).fill(0) // без дырок

const measureTime = (operation, array) => {
    const start = performance.now();
    operation(array);
    const end = performance.now();
    return end - start;
}

const logResults = (name, size, method, time) => {
  console.log(`${name} (${size}) for ${method}: ${time}`);
}

const getMethodName = (method) => method.toString().replace(/\(array\) => array\./g, '');

const push = (array) => array.push();
const pop = (array) => array.pop();
const shift = (array) => array.shift();
const unshift = (array) => array.unshift();
const methods = [push, pop, shift, unshift];

const warmupJIT = (type, size, method) => {
    const warmupArray = type === 'Holey' 
        ? createHoleyArray(size) 
        : createRegularArray(size);
    
    for (let i = 0; i < WARMUP_ITERATIONS; i ++) {
        if (method === push) {
            warmupArray.push(i);
            warmupArray.pop();
        } else if (method === unshift) {
            warmupArray.unshift(i);
            warmupArray.shift();
        } else {
            method(warmupArray);
            if (method === shift) {
                warmupArray.unshift(0);
            } else if (method === pop) {
                warmupArray.push(0);
            }
        }
    }
}

const checkArray = (type, size, method) => {
  warmupJIT(type, size, method);
  
  const array = type === 'Holey' ? createHoleyArray(size) : createRegularArray(size);

  let time = 0;

  for (let i = 0; i < n; i ++) {
    time += measureTime(method, array);
  }

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