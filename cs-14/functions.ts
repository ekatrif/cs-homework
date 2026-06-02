type ObjectType = Record<string, unknown>;

type KeyFunction = (obj: ObjectType) => number;

type SearchType = 'indexOf' | 'lastIndexOf';

const searchInArrayOfNumbers = (arr: number[] | ObjectType[]): arr is number[] => {
  if (Array.isArray(arr) && arr.every(el => (typeof el === 'number') )) {
    return true
  }
  return false;
}

function getIndex(arr: number[] | ObjectType[], target: number, searchType: SearchType, keyFunc?: KeyFunction): number {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const current = searchInArrayOfNumbers(arr) ? arr[mid] : keyFunc?.(arr[mid]);

    if (current === undefined) {
      throw new Error('keyFunc is undefined');
    }

    if (current === target) {
      result = mid;

      if (searchType === 'indexOf') {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else if (current < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return result;
}

function indexOf(arr: number[] | ObjectType[], target: number, keyFunc?: KeyFunction): number {
  return getIndex(arr, target, 'indexOf', keyFunc);
}

function lastIndexOf(arr: number[] | ObjectType[], target: number, keyFunc?: KeyFunction): number {
  return getIndex(arr, target, 'lastIndexOf', keyFunc);
}

const ages = [12, 42, 42, 42, 56];
const users = [
  { age: 12, name: 'Bob' },
  { age: 42, name: 'Ben' },
  { age: 42, name: 'Jack' },
  { age: 42, name: 'Sam' },
  { age: 56, name: 'Bill' }
];
console.log(indexOf(ages, 42));
console.log(indexOf(users, 42, (item) => item.age as number));
console.log(lastIndexOf(ages, 42));
console.log(lastIndexOf(users, 42, (item) => item.age as number));
console.log(indexOf(ages, 100));
console.log(lastIndexOf(ages, 100));