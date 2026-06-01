type ObjectType = Record<string, string | number>;
type ValueType = string | number;

type ConditionFunction = (obj: ObjectType) => ValueType;

const searchInArray = (arr: ValueType[] | ObjectType[]): arr is ValueType[] => {
  if (Array.isArray(arr) && arr.every(el => (typeof el === 'number' || typeof el === 'number') )) {
      return true
  }
  return false;
}

const valueIsNumber = (searchValue: ValueType): searchValue is number => {
  return typeof searchValue === 'number';
}

const valueIs = (searchValue: ValueType): searchValue is number => {
  return typeof searchValue === 'number';
}

function indexOf(arr: number[], value: number): number;
function indexOf(arr: ObjectType[], value: ValueType, condFunc?: ConditionFunction): number;

function indexOf(arr: number[] | ObjectType[], value: ValueType, condFunc?: ConditionFunction): number {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;

  if (searchInArray(arr) && valueIsNumber(value)) {
    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      const current = arr[mid];

      if (current === value) {
        result = mid;
        right = mid - 1;
      } else if (current < value) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return result;
  } else if (arr.every(el => typeof el === 'object') && condFunc) {
    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      const current = arr[mid];
      const valueToCompare = condFunc(current);

      if (valueToCompare === value) {
        result = mid;
        right = mid - 1;
      } else if (valueToCompare < value) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  }

  return -1;

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
console.log(indexOf(users, 42, (item) => item.age));