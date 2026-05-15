class Pointer {
  constructor(memory, meta) {
    this.memory = memory;

    this.id = meta.id;
    this.type = meta.type;
  }

  #getMeta() {
    const meta = this.memory.allocations.get(this.id);

    if (!meta) {
      throw new Error("invalid pointer");
    }

    return meta;
  }

  deref() {
    const meta = this.#getMeta();

    return this.memory.buffer.slice(
      meta.start,
      meta.start + meta.size
    );
  }

  change(arrayBuffer) {
    const meta = this.#getMeta();

    if (!(arrayBuffer instanceof ArrayBuffer)) {
      throw new Error("invalid ArrayBuffer format");
    }

    if (arrayBuffer.byteLength > meta.size) {
      throw new Error("buffer overflow");
    }

    const view = this.memory.view;

    view.fill(0, meta.start, meta.start + meta.size);

    view.set(
      new Uint8Array(arrayBuffer),
      meta.start
    );
  }

  free() {
    this.memory.freePointer(this.id);
  }
}

class Memory {
  constructor(totalSize, options = {}) {
    const stackSize = options.stack ?? 0;

    if (stackSize <= 0 || stackSize >= totalSize) {
      throw new Error("invalid stack size");
    }

    this.totalSize = totalSize;
    this.stackSize = stackSize;

    this.buffer = new ArrayBuffer(totalSize);
    this.view = new Uint8Array(this.buffer);

    this.stackStart = 0;
    this.stackOffset = 0;

    this.stackFrames = [];

    this.freeMemoryBlocks = [
      {
        start: stackSize,
        size: totalSize - stackSize,
      },
    ];

    this.allocations = new Map();

    this.pointerId = 0;
  }

  #align(size, alignment = 8) {
    return (
      Math.ceil(size / alignment) * alignment
    );
  }

  #mergefreeMemoryBlocks() {
    this.freeMemoryBlocks.sort(
      (a, b) => a.start - b.start
    );

    const merged = [];

    for (const block of this.freeMemoryBlocks) {
      if (merged.length === 0) {
        merged.push(block);
        continue;
      }

      const last =
        merged[merged.length - 1];

      const lastEnd =
        last.start + last.size;

      if (lastEnd === block.start) {
        last.size += block.size;
      } else {
        merged.push(block);
      }
    }

    this.freeMemoryBlocks = merged;
  }

  freePointer(pointerId) {
    const meta = this.allocations.get(pointerId);

    if (meta.freed) {
      throw new Error("double free detected");
    }

    meta.freed = true;

    this.view.fill(
      0,
      meta.start,
      meta.start + meta.size
    );

    this.freeMemoryBlocks.push({
      start: meta.start,
      size: meta.size,
    });

    this.#mergefreeMemoryBlocks();
  }

  // ============================================
  //  Работа со стеком (LIFO)
  // ============================================

  push(arrayBuffer) {
    if (!(arrayBuffer instanceof ArrayBuffer)) {
      throw new Error("invalid arrayBuffer format");
    }

    const size = this.#align(arrayBuffer.byteLength);

    const start = this.stackOffset;
    const end = start + size;

    if (end > this.stackSize) {
      throw new Error("stack overflow");
    }

    this.view.set(
      new Uint8Array(arrayBuffer),
      start
    );

    const id = this.pointerId++;

    const meta = {
      id,
      type: "stack",
      start,
      size,
      freed: false,
    };

    this.allocations.set(id, meta);

    this.stackFrames.push(id);

    this.stackOffset = end;

    return new Pointer(this, meta);
  }

  pop() {
    if (this.stackFrames.length === 0) {
      throw new Error("stack is already empty");
    }

    const id = this.stackFrames.pop();

    const meta = this.allocations.get(id);

    if (!meta || meta.freed) {
      throw new Error("invalid stack");
    }

    this.stackOffset = meta.start;

    this.view.fill(
      0, // or nulls?
      meta.start,
      meta.start + meta.size
    );

    meta.freed = true;
  }

  // ============================================
  //  Работа с кучей (динамическое управление)
  // ============================================

  alloc(requestedSize) {
    if (
      !Number.isInteger(requestedSize) ||
      requestedSize <= 0
    ) {
      throw new Error(
        "invalid alloc size"
      );
    }

    const size = this.#align(requestedSize);

    const index = this.freeMemoryBlocks.findIndex(
      (block) => block.size >= size
    );

    if (index === -1) {
      throw new Error("out of memory");
    }

    const block = this.freeMemoryBlocks[index];

    const start =
      block.start + block.size - size;

    block.size -= size;

    if (block.size === 0) {
      this.freeMemoryBlocks.splice(index, 1);
    }

    if (start < this.stackOffset) {
      throw new Error(
        "heap collided with stack"
      );
    }

    const id = this.pointerId++;

    const meta = {
      id,
      type: "heap",
      start,
      size,
      freed: false,
    };

    this.allocations.set(id, meta);

    return new Pointer(this, meta);
  }
}

  // ============================================
  //  Проверка работы
  // ============================================

const mem = new Memory(
  100 * 1024,
  {
    stack: 10 * 1024,
  }
);

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const buf1 = encoder.encode("I").buffer;
const buf2 = encoder.encode("Love").buffer;
const buf3 = encoder.encode("CS").buffer;
const buf4 = encoder.encode("It works fine").buffer;

mem.push(buf1);
mem.push(buf2);
mem.push(buf3);
// const pointer = mem.push(buf3);
// pointer.change(buf2);
// mem.pop();
// mem.pop();
// mem.pop();
// mem.pop();
// console.log(mem)
// console.log(pointer.deref());

const pointer1 = mem.alloc(128);
pointer1.change(buf4);

const pointer2 = mem.alloc(8);
const pointer3 = mem.alloc(4);
const pointer4 = mem.alloc(5 * 1024);

// pointer1.free();
pointer2.free();
pointer3.free();
pointer4.free();
// pointer4.free();

console.log(mem);


