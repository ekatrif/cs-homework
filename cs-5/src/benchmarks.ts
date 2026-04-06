import { FlatArrayStream, TraverseMode, RGBA } from './main';

interface BenchmarkResult {
    operation: string;
    durationMs: number;
    operationsPerSecond: number;
}

class PixelStreamBenchmark {
    private width: number;
    private height: number;
    private totalPixels: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.totalPixels = width * height;
    }

    private measureTime(operation: () => void): number {
        const start = performance.now();
        operation();
        const end = performance.now();
        return end - start;
    }

    private formatResult(result: BenchmarkResult): void {
        console.log(`${result.operation}:`);
        console.log(`  Duration: ${result.durationMs.toFixed(2)}ms`);
        console.log(`  Operations/sec: ${result.operationsPerSecond.toFixed(2)}`);
        console.log('---');
    }

    // 1. getPixel test
    benchmarkGetPixel(): BenchmarkResult {
        const stream = new FlatArrayStream(this.width, this.height);
        
        // Set initial pixels
        for (let i = 0; i < this.totalPixels; i++) {
            const x = i % this.width;
            const y = Math.floor(i / this.width);
            stream.setPixel(x, y, [i % 256, (i * 2) % 256, (i * 3) % 256, 255]);
        }

        let pixelsRead = 0;
        const duration = this.measureTime(() => {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    stream.getPixel(x, y);
                    pixelsRead++;
                }
            }
        });

        return {
            operation: `getPixel (${this.totalPixels.toLocaleString()} pixels)`,
            durationMs: duration,
            operationsPerSecond: (pixelsRead / duration) * 1000
        };
    }

    // 2. setPixel test
    benchmarkSetPixel(): BenchmarkResult {
        const stream = new FlatArrayStream(this.width, this.height);
        
        let pixelsWritten = 0;
        const duration = this.measureTime(() => {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    stream.setPixel(x, y, [255, 0, 0, 255]);
                    pixelsWritten++;
                }
            }
        });

        return {
            operation: `setPixel (${this.totalPixels.toLocaleString()} pixels)`,
            durationMs: duration,
            operationsPerSecond: (pixelsWritten / duration) * 1000
        };
    }

    // 3. forEach with RowMajor test
    benchmarkForEachRowMajor(): BenchmarkResult {
        const stream = new FlatArrayStream(this.width, this.height);
        
        // Set initial pixels
        for (let i = 0; i < this.totalPixels; i++) {
            const x = i % this.width;
            const y = Math.floor(i / this.width);
            stream.setPixel(x, y, [i % 256, (i * 2) % 256, (i * 3) % 256, 255]);
        }

        let iterations = 0;
        const duration = this.measureTime(() => {
            stream.forEach(TraverseMode.RowMajor, () => {
                iterations++;
            });
        });

        return {
            operation: `forEach RowMajor (${this.totalPixels.toLocaleString()} iterations)`,
            durationMs: duration,
            operationsPerSecond: (iterations / duration) * 1000
        };
    }

    // 4. forEach with ColMajor test
    benchmarkForEachColMajor(): BenchmarkResult {
        const stream = new FlatArrayStream(this.width, this.height);
        
        // Set initial pixels
        for (let i = 0; i < this.totalPixels; i++) {
            const x = i % this.width;
            const y = Math.floor(i / this.width);
            stream.setPixel(x, y, [i % 256, (i * 2) % 256, (i * 3) % 256, 255]);
        }

        let iterations = 0;
        const duration = this.measureTime(() => {
            stream.forEach(TraverseMode.ColMajor, (rgba, x, y) => {
                iterations++;
                if (x === -1 || y === -1) console.log('never');
            });
        });

        return {
            operation: `forEach ColMajor (${this.totalPixels.toLocaleString()} iterations)`,
            durationMs: duration,
            operationsPerSecond: (iterations / duration) * 1000
        };
    }

    // 5. setPixel with RowMajor
    benchmarkSetPixelDuringRowMajorTraversal(): BenchmarkResult {
        const stream = new FlatArrayStream(this.width, this.height);
        
        let modifications = 0;
        
        const duration = this.measureTime(() => {
            stream.forEach(TraverseMode.RowMajor, (rgba, x, y) => {
                const newColor: RGBA = [x % 256, y % 256, (x + y) % 256, 255];
                stream.setPixel(x, y, newColor);
                modifications++;
            });
        });

        return {
            operation: `forEach RowMajor + setPixel (${modifications.toLocaleString()} modifications)`,
            durationMs: duration,
            operationsPerSecond: (modifications / duration) * 1000
        };
    }

    // 6. setPixel with ColMajor
    benchmarkSetPixelDuringColMajorTraversal(): BenchmarkResult {
        const stream = new FlatArrayStream(this.width, this.height);
        
        let modifications = 0;
        
        const duration = this.measureTime(() => {
            stream.forEach(TraverseMode.ColMajor, (rgba, x, y) => {
                const newColor: RGBA = [x % 256, y % 256, (x + y) % 256, 255];
                stream.setPixel(x, y, newColor);
                modifications++;
            });
        });

        return {
            operation: `forEach ColMajor + setPixel (${modifications.toLocaleString()} modifications)`,
            durationMs: duration,
            operationsPerSecond: (modifications / duration) * 1000
        };
    }

// 7. getPixel + setPixel (RowMajor)
benchmarkGetAndSetAlternatingRowMajor(): BenchmarkResult {
    const stream = new FlatArrayStream(this.width, this.height);
    
    // Set initial pixels
    for (let i = 0; i < this.totalPixels; i++) {
        const x = i % this.width;
        const y = Math.floor(i / this.width);
        stream.setPixel(x, y, [i % 256, (i * 2) % 256, (i * 3) % 256, 255]);
    }

    let operations = 0;
    const duration = this.measureTime(() => {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const pixel = stream.getPixel(x, y);
                const modifiedPixel: RGBA = [255 - pixel[0], 255 - pixel[1], 255 - pixel[2], pixel[3]];
                stream.setPixel(x, y, modifiedPixel);
                operations += 2; // get + set
            }
        }
    });

    return {
        operation: `getPixel + setPixel RowMajor (${this.totalPixels.toLocaleString()} pairs)`,
        durationMs: duration,
        operationsPerSecond: (operations / duration) * 1000
    };
}

// 8. getPixel + setPixel (ColMajor)
benchmarkGetAndSetAlternatingColMajor(): BenchmarkResult {
    const stream = new FlatArrayStream(this.width, this.height);
    
    // Set initial pixels
    for (let i = 0; i < this.totalPixels; i++) {
        const x = i % this.width;
        const y = Math.floor(i / this.width);
        stream.setPixel(x, y, [i % 256, (i * 2) % 256, (i * 3) % 256, 255]);
    }

    let operations = 0;
    const duration = this.measureTime(() => {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const pixel = stream.getPixel(x, y);
                const modifiedPixel: RGBA = [255 - pixel[0], 255 - pixel[1], 255 - pixel[2], pixel[3]];
                stream.setPixel(x, y, modifiedPixel);
                operations += 2; // get + set
            }
        }
    });

    return {
        operation: `getPixel + setPixel ColMajor (${this.totalPixels.toLocaleString()} pairs)`,
        durationMs: duration,
        operationsPerSecond: (operations / duration) * 1000
    };
}

    // Run all benchmarks
    runAll(): void {
        console.log('\n========================================');
        console.log(`PIXEL STREAM BENCHMARK`);
        console.log(`Resolution: ${this.width}x${this.height}`);
        console.log(`Total pixels: ${this.totalPixels.toLocaleString()}`);
        console.log(`Total RGBA values: ${(this.totalPixels * 4).toLocaleString()}`);
        console.log('========================================\n');

        const results: BenchmarkResult[] = [
            this.benchmarkGetPixel(),
            this.benchmarkSetPixel(),
            this.benchmarkForEachRowMajor(),
            this.benchmarkForEachColMajor(),
            this.benchmarkSetPixelDuringRowMajorTraversal(),
            this.benchmarkSetPixelDuringColMajorTraversal(),
            this.benchmarkGetAndSetAlternatingRowMajor(),
            this.benchmarkGetAndSetAlternatingColMajor()
        ];

        results.forEach(result => this.formatResult(result));

        // RowMajor vs ColMajor comparison
        console.log('\n=== COMPARISONS ===');
        const rowMajor = results[2];
        const colMajor = results[3];
        const ratio = rowMajor.durationMs / colMajor.durationMs;
        console.log(`RowMajor vs ColMajor: ${ratio.toFixed(2)}x ${ratio > 1 ? 'slower' : 'faster'}`);
        
        const rowMajorWithSet = results[4];
        const colMajorWithSet = results[5];
        const setRatio = rowMajorWithSet.durationMs / colMajorWithSet.durationMs;
        console.log(`RowMajor+setPixel vs ColMajor+setPixel: ${setRatio.toFixed(2)}x ${setRatio > 1 ? 'slower' : 'faster'}`);
    }
}

const BENCHMARK_WIDTH = 1000;  // 1000 * 1000 = 1M pixel
const BENCHMARK_HEIGHT = 1000;

const benchmark = new PixelStreamBenchmark(BENCHMARK_WIDTH, BENCHMARK_HEIGHT);
benchmark.runAll();