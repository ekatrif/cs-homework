class Matrix {
  constructor(TypedArray, rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = new TypedArray(rows * cols);
  }

  get(row, col) {
    return this.data[row * this.cols + col];
  }

  set(row, col, value) {
    this.data[row * this.cols + col] = value;
  }
}

class Graph {
  constructor(matrix, { directed = false } = {}) {
    if (matrix.rows !== matrix.cols) {
      throw new Error(
        'Матрица смежности должна быть квадратной'
      );
    }

    this.matrix = matrix;
    this.directed = directed;
  }

  #checkVertex(v) {
    if (
      v < 0 ||
      v >= this.matrix.rows
    ) {
      throw new RangeError(
        `Вершина ${v} вне диапазона`
      );
    }
  }

  hasEdge(a, b) {
    if (this.directed) {
      throw new Error(
        'Используйте hasArc для ориентированного графа'
      );
    }

    this.#checkVertex(a);
    this.#checkVertex(b);

    return this.matrix.get(a, b) !== 0;
  }

  hasArc(from, to) {
    this.#checkVertex(from);
    this.#checkVertex(to);

    return this.matrix.get(from, to) !== 0;
  }

  addEdge(a, b, weight = 1) {
    if (this.directed) {
      throw new Error(
        'Используйте addArc для ориентированного графа'
      );
    }

    this.#checkVertex(a);
    this.#checkVertex(b);

    this.matrix.set(a, b, weight);
    this.matrix.set(b, a, weight);
  }

  removeEdge(a, b) {
    if (this.directed) {
      throw new Error(
        'Используйте removeArc для ориентированного графа'
      );
    }

    this.#checkVertex(a);
    this.#checkVertex(b);

    this.matrix.set(a, b, 0);
    this.matrix.set(b, a, 0);
  }

  addArc(from, to, weight = 1) {
    if (!this.directed) {
      throw new Error(
        'Граф не является ориентированным'
      );
    }

    this.#checkVertex(from);
    this.#checkVertex(to);

    this.matrix.set(from, to, weight);
  }

  removeArc(from, to) {
    if (!this.directed) {
      throw new Error(
        'Граф не является ориентированным'
      );
    }

    this.#checkVertex(from);
    this.#checkVertex(to);

    this.matrix.set(from, to, 0);
  }

  traverse(start, cb) {
    this.#checkVertex(start);

    const visited = new Set();
    const queue = [
      {
        id: start,
        depth: 0,
        weight: 0,
      },
    ];

    visited.add(start);

    while (queue.length > 0) {
      const node = queue.shift();

      cb(
        {
          id: node.id,
          weight: node.weight,
        },
        node.depth
      );

      for (let neighbor = 0; neighbor < this.matrix.cols; neighbor++) {
        const weight = this.matrix.get(
          node.id,
          neighbor
        );

        if (weight === 0 || visited.has(neighbor)) {
          continue;
        }

        visited.add(neighbor);

        queue.push({
          id: neighbor,
          depth: node.depth + 1,
          weight,
        });
      }
    }
  }
}

// For best visualisation
function formatMatrix(uint8Array, size) {
    let maxWidth = 1;
    for (let i = 0; i < uint8Array.length; i++) {
        const num = uint8Array[i];
        const width = String(num).length;
        if (width > maxWidth) maxWidth = width;
    }
    
    let result = '';
    for (let i = 0; i < size; i++) {
        const start = i * size;
        
        let row = '';
        for (let j = 0; j < size; j++) {
            const value = uint8Array[start + j];
            const formatted = String(value).padStart(maxWidth, ' ');
            row += formatted;
            if (j < size - 1) row += '  ';
        }
        
        result += row + '\n';
    }
    
    return result;
}

// Checks
const matrix = new Matrix(Uint8Array, 10, 10);
// matrix.set(0, 2, 10);
// matrix.set(3, 3, 13);
// matrix.set(5, 6, 18);
// matrix.set(7, 3, 25);
// matrix.set(9, 8, 50);
// console.log(formatMatrix(matrix.data, 10));

// const graph = new Graph(matrix, { directed: false });
// console.log(graph.hasEdge(0, 2));
// console.log(graph.hasArc(2, 0));

// graph.addEdge(7, 2, 77);
// graph.removeEdge(7, 2);
// console.log(formatMatrix(matrix.data, 10));

// const graphOriented = new Graph(matrix, { directed: true });
// graphOriented.addArc(7, 2, 78);
// graphOriented.removeArc(7, 2);
// console.log(formatMatrix(matrix.data, 10));

const graph = new Graph(matrix);

graph.addEdge(0, 1, 2);
graph.addEdge(0, 2, 3);
graph.addEdge(1, 3, 4);
graph.addEdge(1, 4, 5);
graph.addEdge(2, 5, 6);
graph.addEdge(2, 6, 7);
graph.addEdge(4, 7, 8);
graph.addEdge(5, 8, 9);
graph.addEdge(6, 9, 10);
console.log(formatMatrix(matrix.data, 10));

  //         0
  //       /   \
  //     1       2
  //   /  \    /   \
  //  3    4  5     6
  //       |  |     |
  //       7  8     9

graph.traverse(1, (node, depth) => {
    console.log(`Узел: ${node.id}, глубина: ${depth}, вес ребра: ${node.weight}`);
});

