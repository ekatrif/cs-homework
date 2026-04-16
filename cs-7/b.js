export class EncodeDecodeIndexed {
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

    const bufferSize = arrLength * 8 + strLengths;
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    let offset = 0;

    let startIndex = arrLength * 8;
    const startIndexes = new Map();
    encodedStrings.forEach((str, index) => {
      startIndexes.set(index, startIndex);
      startIndex += str.length;
    })

    encodedStrings.forEach((str, index) => {
      const start = startIndexes.get(index);
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

      const arr = new Uint8Array(buffer);

      let currentByte = 1;
      let strIndex = 0;
      let currentStrLength = new Uint8Array(4);
      let currentStart = new Uint8Array(4);
      const map = new Map(); // index => [указатель, длина]

      let result = '';

      arr.forEach(byte => {
        if (currentByte <= 4) {
          currentStrLength[currentByte - 1] = byte;
        }

        if (currentByte > 4 && currentByte <= 8) {
          currentStart[currentByte - 4 - 1] = byte;
        }

        if (currentByte === 8) {
          const viewStrLength = new DataView(currentStrLength.buffer);
          const decodedStrLength = viewStrLength.getUint32(0, this.littleEndian);
          const viewStart = new DataView(currentStart.buffer);
          const decodedStart = viewStart.getUint32(0, this.littleEndian);

          map.set(strIndex, [decodedStart, decodedStrLength]);

          currentStrLength = new Uint8Array(4);
          currentStart = new Uint8Array(4);
          currentByte = 0;
          strIndex ++;
        }
        currentByte ++;

        const lastEntry = Array.from(map)[map.size - 1];
        if (lastEntry && arr.length === lastEntry[1][0]) { // Прочитаны все длины строк и указатели
          // start read string
          if (!map.get(index)) return;
          const [start, length] = map.get(index);
          const slice = new Uint8Array(buffer).slice(start, start + length);

          const decoder = new TextDecoder();
          result = decoder.decode(slice);
        } 
      })

      return result;
    }

    return {
      buffer,
      at: atFunc,
    };
  }
}

const strings = ["hello", "мир", ""]; // 3 * 8 + 5 + 6 = 35;

const buffer = new EncodeDecodeIndexed().encode(strings);
// console.log(buffer);
// console.log(buffer.at(1))