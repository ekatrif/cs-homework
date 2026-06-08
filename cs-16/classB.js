class ArrayTreeMap {
  constructor(capacity = 16) {
    this.tree = new Array(capacity).fill(null);
  }

  #enlargeCapacity(index) {
    while (index >= this.tree.length) {
      this.tree.length *= 2;

      for (let i = 0; i < this.tree.length; i++) {
        if (this.tree[i] === undefined) {
          this.tree[i] = null;
      }
    }
    }
  }

  set(key, value) {
    let index = 0;

    while (true) {
      this.#enlargeCapacity(index);

      const node = this.tree[index];

      if (node === null) {
        this.tree[index] = { key, value };
        return;
      }

      if (key === node.key) {
        node.value = value;
        return;
      }

      if (key < node.key) {
          index = 2 * index + 1;
      } else {
          index = 2 * index + 2;
      }
    }
  }

  get(key) {
    let index = 0;

    while (index < this.tree.length) {
      const node = this.tree[index];

      if (node === null) {
        return undefined;
      }

      if (key === node.key) {
        return node.value;
      }

      if (key < node.key) {
        index = 2 * index + 1;
      } else {
        index = 2 * index + 2;
      }
    }

    return undefined;
  }

  getIndex(key) {
    let index = 0;

    while (index < this.tree.length) {
      const node = this.tree[index];

      if (node === null) {
        return -1;
      }

      if (key === node.key) {
        return index;
      }

      if (key < node.key) {
        index = 2 * index + 1;
      } else {
        index = 2 * index + 2;
      }
    }

    return -1;
  }

  keys() {
    const result = [];

    const inorder = (index) => {
      if (index >= this.tree.length) return;

      const node = this.tree[index];
      if (node === null) return;

      inorder(2 * index + 1);
      result.push(node.key);
      inorder(2 * index + 2);
    };

    inorder(0);

    return result;
  }
}

const map = new ArrayTreeMap(16); // Стартовая емкость

map.set(10, "A");
map.set(5, "B");
map.set(15, "C");
map.set(3, "D");
map.set(7, "E");
map.set(2, "F");
map.set(8, "G");

console.log(map);

console.log(map.get(7));           // "E"
console.log(map.keys());           // [3, 5, 7, 10, 15]
console.log(map.getIndex(10));     // 0
console.log(map.getIndex(7));      // 4