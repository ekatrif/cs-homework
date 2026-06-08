class TreeMap {
    constructor() {
        this.root = null;
        this.size = 0;
    }

    #createNode(key, value) {
        return {
            key,
            value,
            left: null,
            right: null
        };
    }

    set(key, value) {
        if (!this.root) {
            this.root = this.#createNode(key, value);
            this.size++;
            return this;
        }

        let current = this.root;

        while (true) {
            if (key < current.key) {
                if (!current.left) {
                    current.left = this.#createNode(key, value);
                    this.size++;
                    return this;
                }
                current = current.left;
            } else if (key > current.key) {
                if (!current.right) {
                    current.right = this.#createNode(key, value);
                    this.size++;
                    return this;
                }
                current = current.right;
            } else {
                current.value = value;
                return this;
            }
        }
    }

    get(key) {
        let current = this.root;

        while (current) {
            if (key < current.key) {
                current = current.left;
            } else if (key > current.key) {
                current = current.right;
            } else {
                return current.value;
            }
        }

        return undefined;
    }

    has(key) {
      return this.get(key) !== undefined ;
    }

    keys() {
      const result = [];

      function traverse(node) {
          if (!node) return;

          traverse(node.left);
          result.push(node.key);
          traverse(node.right);
      }

      traverse(this.root);

      return result;
    }

    entries() {
      const result = [];

      function traverse(node) {
        if (!node) return;

        traverse(node.left);
        result.push([node.key, node.value]);
        traverse(node.right);
      }

      traverse(this.root);

      return result;
    }

  delete(key) {
    const removeNode = (node, key) => {
      if (!node) return null;

      if (key < node.key) {
          node.left = removeNode(node.left, key);
          return node;
      }

      if (key > node.key) {
          node.right = removeNode(node.right, key);
          return node;
      }

      // Нет потомков
      if (!node.left && !node.right) {
          this.size--;
          return null;
      }

      // Один потомок
      if (!node.left) {
          this.size--;
          return node.right;
      }

      if (!node.right) {
          this.size--;
          return node.left;
      }

      // Два потомка
      let successor = node.right;

      while (successor.left) {
          successor = successor.left;
      }

      node.key = successor.key;
      node.value = successor.value;

      node.right = removeNode(node.right, successor.key);

      return node;
    };

    const oldSize = this.size;

    this.root = removeNode(this.root, key);

    return this.size !== oldSize;
  }
}

const map = new TreeMap();

map.set("banana", 3);
map.set("apple", 2);
map.set("cherry", 5);
map.set("date", 1);

console.log(map.get("apple"));     // 2
console.log(map.has("banana"));    // true
console.log(map.keys());           // ["apple", "banana", "cherry", "date"]

map.delete("cherry");
console.log(map.entries()); // [["apple", 2], ["banana", 3], ["date", 1]]