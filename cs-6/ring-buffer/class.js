export class RingBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.head = 0;
    this.size = 0;
  }

  unshift(element) {
    this.head = (this.head - 1 + this.capacity) % this.capacity;
    this.buffer[this.head] = element;

    if (this.size < this.capacity) {
      this.size++;
    }
  }

  shift() {
    const element = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return element;
  }
}
