export type RGBA = [red: number, green: number, blue: number, alpha: number];

export enum TraverseMode {
  RowMajor,
  ColMajor
}

export interface PixelStream {
    getPixel(x: number, y: number): RGBA;
    setPixel(x: number, y: number, rgba: RGBA): RGBA;
    forEach(mode: TraverseMode, callback: (rgba: RGBA, x: number, y: number) => void): void;
}

interface RGBObject {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class FlatArrayStream implements PixelStream {
  private data: number[];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const size = width * height * 4;
        
    this.data = new Array(size).fill(0);
  }

  getPixel(x: number, y: number): RGBA {
    const idx = (y * this.width + x) * 4;
    return [this.data[idx], this.data[idx + 1], this.data[idx + 2], this.data[idx + 3]];
  }

  setPixel(x: number, y: number, rgba: RGBA): RGBA {
    const idx = (y * this.width + x) * 4;
    const pixelColor = this.getPixel(x, y);
    this.data[idx] = rgba[0];
    this.data[idx + 1] = rgba[1];
    this.data[idx + 2] = rgba[2];
    this.data[idx + 3] = rgba[3];
    return pixelColor;
  }

  forEach(mode: TraverseMode, callback: (rgba: RGBA, x: number, y: number) => void): void {
    if (mode === TraverseMode.RowMajor) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          callback(this.getPixel(x, y), x, y);
        }
      }
    } else {
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          callback(this.getPixel(x, y), x, y);
        }
      }
    }
  }
}

export class ArrayOfArraysStream implements PixelStream {
  private data: RGBA[][];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    
    this.data = Array(height).fill(null).map(
      () => Array(width).fill(null).map(
        () => [0, 0, 0, 0],
      ),
    );
  }

  getPixel(x: number, y: number): RGBA {
    return [...this.data[y][x]] as RGBA;
  }

  setPixel(x: number, y: number, rgba: RGBA): RGBA {
    const pixelColor = this.getPixel(x, y);
    this.data[y][x] = [...rgba] as RGBA;
    return pixelColor;
  }

  forEach(mode: TraverseMode, callback: (rgba: RGBA, x: number, y: number) => void): void {
    if (mode === TraverseMode.RowMajor) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          callback(this.getPixel(x, y), x, y);
        }
      }
    } else {
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          callback(this.getPixel(x, y), x, y);
        }
      }
    }
  }
}

export class ArrayOfObjectsStream implements PixelStream {
  private data: RGBObject[][];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    
    this.data = Array(height).fill(null).map(
      () => Array(width).fill(null).map(
        () => ({ r: 0, g: 0, b: 0, a: 0 }),
      ),
    );
  }

  getPixel(x: number, y: number): RGBA {
    const pixel = this.data[y][x];
    return [pixel.r, pixel.g, pixel.b, pixel.a];
  }

  setPixel(x: number, y: number, rgba: RGBA): RGBA {
    const pixelColor = this.getPixel(x, y);
    this.data[y][x] = { r: rgba[0], g: rgba[1], b: rgba[2], a: rgba[3] };
    return pixelColor;
  }

  forEach(mode: TraverseMode, callback: (rgba: RGBA, x: number, y: number) => void): void {
    if (mode === TraverseMode.RowMajor) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          callback(this.getPixel(x, y), x, y);
        }
      }
    } else {
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          callback(this.getPixel(x, y), x, y);
        }
      }
    }
  }
}

export class TypedArrayStream implements PixelStream {
  private data: Uint8Array;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const size = width * height * 4;
    
    this.data = new Uint8Array(size);
  }

  getPixel(x: number, y: number): RGBA {
    const idx = (y * this.width + x) * 4;
    return [this.data[idx], this.data[idx + 1], this.data[idx + 2], this.data[idx + 3]];
  }

  setPixel(x: number, y: number, rgba: RGBA): RGBA {
    const idx = (y * this.width + x) * 4;
    const pixelColor = this.getPixel(x, y);
    this.data[idx] = rgba[0];
    this.data[idx + 1] = rgba[1];
    this.data[idx + 2] = rgba[2];
    this.data[idx + 3] = rgba[3];
    return pixelColor;
  }

  forEach(mode: TraverseMode, callback: (rgba: RGBA, x: number, y: number) => void): void {
    if (mode === TraverseMode.RowMajor) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          callback(this.getPixel(x, y), x, y);
        }
      }
    } else {
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          callback(this.getPixel(x, y), x, y);
        }
      }
    }
  }
}