export class EncodeDecode {
  constructor(endian = 'little') {
    this.littleEndian = endian === 'little';
  }

  encode(arr) {
    const encoder = new TextEncoder();
    const arrLength = arr?.length;
    const encodedStrings = arr.map(str => encoder.encode(str));
    const strLengths = encodedStrings.reduce((acc, str) => {
      const strLength = str.length;
      return acc + strLength;
    }, 0)

    const bufferSize = 4 + arrLength * 4 + strLengths; // число строк + длина каждой строки + сами строки
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    view.setUint32(0, arrLength, this.littleEndian); // запись количества строк

    let offset = 4;

    const indexes = new Map(); // индекс строки => [начало строки, конец строки]

    encodedStrings.forEach((str, idx) => {
      view.setUint32(offset, str.length, this.littleEndian);
      offset += 4;

      if (!str.length) {
        return;
      }

      indexes.set(idx, [offset, offset + str.length]);

      str.forEach(byte => {
        view.setUint8(offset, byte, this.littleEndian);
        offset ++;
      })
    })

    const atFunc = (index) => {
      if (!buffer) return undefined;

      if (!indexes.get(index)) {
        return '';
      }

      const [start, end] = indexes.get(index);
      const slice = new Uint8Array(buffer).subarray(start, end); // subarray() не копирует данные, а создаёт представление (view) над той же памятью

      const decoder = new TextDecoder();
      return decoder.decode(slice);
    }

    return {
      buffer,
      at: atFunc
    };
  }

  decode(buffer) {
    const view = new DataView(buffer);

    const size = view.getUint32(0, this.littleEndian);
    const result = new Array(size).fill('');

    let offset = 4;

    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < size; i ++) {
      const strSize = new DataView(bytes.slice(offset, offset + 4).buffer).getUint32(0, this.littleEndian);
      if (strSize === 0) {
        result[i] = '';
        continue;
      }
      offset += 4;

      const str = bytes.slice(offset, offset + strSize);
      offset += strSize;
      
      const decoder = new TextDecoder();
      const decodedStr = decoder.decode(str);
      result[i] = decodedStr;
    }

    return result;
  }
}

const strings = ["hello", "мир", ""]; // 4 + 4 * 3 + 11 = 27 buffer size

const buffer = new EncodeDecode().encode(strings);
const decodedStrings = new EncodeDecode().decode(buffer.buffer);
// console.log(buffer);
// console.log(decodedStrings);
// console.log(buffer.at(1))