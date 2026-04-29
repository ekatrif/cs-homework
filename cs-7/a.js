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

    encodedStrings.forEach((str, idx) => {
      view.setUint32(offset, str.length, this.littleEndian);
      offset += 4;

      if (!str.length) {
        return;
      }

      str.forEach(byte => {
        view.setUint8(offset, byte, this.littleEndian);
        offset ++;
      })
    })

    buffer.at = function(index) {
      if (index === -1) {
        return ''
      }

      const buffer = this;
      const view = new DataView(buffer);

      let currentIndex = 0;
      let offset = 0; // сколько байтов пропустить до следующей строки

      for (let i = 4; i < buffer.byteLength; i++) {
        if (offset > 0) { // пропустить байты до байта с длиной следующей строки
          offset --;
          continue;
        };

        const stringLength = view.getUint8(i); // прочитать длину строки

        if (currentIndex === index) {
          const slice = new Uint8Array(buffer).subarray(i + 4, i + 4 + stringLength);
          const decoder = new TextDecoder();
          return decoder.decode(slice);
        }

        offset = 4 + stringLength - 1;
        currentIndex ++;
      }
    }

    return buffer;
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

const strings = ["hello", "мир", "", 'I', 'love', 'CS']; // 4 + 4 * 3 + 11 = 27 buffer size

const buffer = new EncodeDecode().encode(strings);
// const decodedStrings = new EncodeDecode().decode(buffer.buffer);
console.log(buffer);
// console.log(decodedStrings);
// console.log(buffer.at(3))
// console.log(buffer.at(4))
// console.log(buffer.at(5))