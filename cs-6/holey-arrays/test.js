// const array = [1,2,3,4,5,6,7,8,9,10];
// array[20] = 0;
// array.fill(0);
// %DebugPrint(array)

// const array = [1,2,3,4,5,6,7,8,9,10];
// array[20] = 0;
// for (let i = 0; i < array.length; i++) {
//   array[i] = 0;
// }
// %DebugPrint(array)

// const array = [1,2,3,4,5,6,7,8,9,10];
// array.length = 15;
// %DebugPrint(array)
// console.log(array)

const array = [1,2,3,4,5,6,7,8,9,10];
array.splice(15);
%DebugPrint(array)
console.log(array)
