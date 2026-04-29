export class EncodeDecodeByIndex {
  constructor(endian = 'little') {
    this.littleEndian = endian === 'little';
  }

  encode(arr) {
    const encoder = new TextEncoder();
    const arrLength = arr?.length; // число строк
    const encodedStrings = arr.map(str => encoder.encode(str));
    const strLengths = encodedStrings.reduce((acc, str) => {
      const strLength = str.length;
      return acc + strLength;
    }, 0)

    const bufferSize = arrLength * 8 + strLengths;
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    let offset = 0;

    let startIndex = arrLength * 8; // Индекс, начиная с которого записываются строки друг-за-другом
    const pointers = new Map(); // индекс строки => начало строки
    encodedStrings.forEach((str, index) => {
      pointers.set(index, startIndex);
      startIndex += str.length;
    })

    encodedStrings.forEach((str, index) => {
      const start = pointers.get(index);
      view.setUint32(offset, str.length, this.littleEndian); // длина строки
      offset += 4;

      view.setUint32(offset, start, this.littleEndian); // указатель на строку
      offset += 4;

      let byteOffset = 0;

      str.forEach(byte => {
        view.setUint8(start + byteOffset, byte, this.littleEndian);
        byteOffset ++;
      })
    })

    const atFunc = (index) => {
      if (!buffer) return undefined;
      if (!pointers.get(index)) return '';

      const [start, end] = pointers.get(index);

      const slice = new Uint8Array(buffer).subarray(start, end);

      const decoder = new TextDecoder();
      return decoder.decode(slice);
    }

    buffer.at = function(index) {
      if (index === -1) {
        return ''
      }

      const buffer = this;
      const view = new DataView(buffer);

      const stringLength = view.getUint8(index * 8); // прочитать длину строки по индексу
      const pointer = view.getUint8(index * 8 + 4);

      const slice = new Uint8Array(buffer).subarray(pointer, pointer + stringLength);
      const decoder = new TextDecoder();
      return decoder.decode(slice);

    }

    return buffer;
  }
}

const strings = ["hello", "мир", "", 'I', 'love', 'CS']; // 3 * 8 + 5 + 6 = 35;

const buffer = new EncodeDecodeByIndex().encode(strings);
// console.log(buffer);
// console.log(buffer.at(3))
// console.log(buffer.at(4))
// console.log(buffer.at(5))