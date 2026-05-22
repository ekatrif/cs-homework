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
    const meta =
      this.memory.allocations.get(this.id);

    if (!meta || meta.freed) {
      return;
    }

    this.memory.freePointer(this.id);
  }

  // RAII
  [Symbol.dispose]() {
    console.log('Ресурс освобождён', this.id);
    this.free();
  }
}

class Rc {
  #pointer;
  #disposed = false;

  constructor(pointer) {
    if (!(pointer instanceof Pointer)) {
      throw new Error(
        "invalid pointer format"
      );
    }

    this.#pointer = pointer;

    pointer.memory.incRef(pointer.id);
  }

  clone() {
    console.log('clone')
    return new Rc(this.#pointer);
  }

  change(arrayBuffer) {
    return this.#pointer.change(
      arrayBuffer
    );
  }

  [Symbol.dispose]() {
    if (this.#disposed) {
      return;
    }

    this.#disposed = true;

    this.#pointer.memory.decRef(
      this.#pointer.id
    );

    console.log('Ресурс освобождён');
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

    this.refCounts = new Map();
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

  incRef(pointerId) {
    const refs =
      this.refCounts.get(pointerId) ?? 0;

    this.refCounts.set(
      pointerId,
      refs + 1
    );

    console.log('inc', refs + 1);
  }

  decRef(pointerId) {
    const refs =
      this.refCounts.get(pointerId);

    if (refs === undefined) {
      throw new Error(
        "unknown pointer"
      );
    }

    const next = refs - 1;

    if (next < 0) {
      throw new Error(
        "reference counter underflow"
      );
    }

    if (next === 0) {
      console.log('dec', refs);
      this.refCounts.delete(pointerId);

      this.freePointer(pointerId);
      console.log('free pointer');

      return;
    }

    console.log('dec', refs);
    this.refCounts.set(
      pointerId,
      next
    );
  }

  getRefCount(pointerId) {
    return (
      this.refCounts.get(pointerId) ?? 0
    );
  }

  freePointer(pointerId) {
    const meta =
      this.allocations.get(pointerId);

    if (!meta) {
      throw new Error("invalid pointer");
    }

    if (meta.freed) {
      throw new Error(
        "double free detected"
      );
    }

    meta.freed = true;

    this.view.fill(
      0,
      meta.start,
      meta.start + meta.size
    );

    this.allocations.delete(pointerId);

    this.freeMemoryBlocks.push({
      start: meta.start,
      size: meta.size,
    });

    this.#mergefreeMemoryBlocks();
  }

  alloc(requestedSize) {
    if (
      !Number.isInteger(requestedSize) ||
      requestedSize <= 0
    ) {
      throw new Error(
        "invalid alloc size"
      );
    }

    const size = this.#align(
      requestedSize
    );

    const index =
      this.freeMemoryBlocks.findIndex(
        (block) => block.size >= size
      );

    if (index === -1) {
      throw new Error("out of memory");
    }

    const block =
      this.freeMemoryBlocks[index];

    const start =
      block.start + block.size - size;

    block.size -= size;

    if (block.size === 0) {
      this.freeMemoryBlocks.splice(
        index,
        1
      );
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

    // пока Rc не создан —
    // владельцев нет
    this.refCounts.set(id, 0);

    return new Pointer(this, meta);
  }
}

// ============================================
//  Проверка работы
// ============================================
const encoder = new TextEncoder();
const mem = new Memory(100 * 1024, {stack: 10 * 1024});
const arrayBuffer = encoder.encode("It works fine").buffer;

// Запрашиваем 128 байт в куче
// Возвращает указатель на первый байт выделенной области
using pointer1 = new Rc(mem.alloc(128));

// Записываем данные в выделенную область
pointer1.change(arrayBuffer);

// Увеличиваем значение счетчика
using pointer2 = pointer1.clone();

// Увеличиваем значение счетчика
using pointer3 = pointer1.clone();