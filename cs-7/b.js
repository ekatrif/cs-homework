export class EncodeDecodeIndexed {
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
    const pointers = new Map(); // индекс строки => указатель на строку
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
        if (!str.length) return;
        view.setUint8(start + byteOffset, byte, this.littleEndian);
        byteOffset ++;
      })
    })

    const atFunc = (index) => {
      if (!buffer) return undefined;

      const pointer = pointers.get(index); // Указатель на строку

      if (!pointer) return '';

      const slice = new Uint8Array(buffer).subarray(pointer, pointer + encodedStrings[index].length);

      const decoder = new TextDecoder();
      return decoder.decode(slice);
    }

    return {
      buffer,
      at: atFunc,
    };
  }
}

const strings = ["hello", "мир", ""]; // 3 * 8 + 5 + 6 = 35;

const buffer = new EncodeDecodeIndexed().encode(strings);
console.log(buffer);
console.log(buffer.at(1))