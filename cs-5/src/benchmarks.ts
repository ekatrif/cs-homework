import { 
  FlatArrayStream, 
  ArrayOfArraysStream, 
  ArrayOfObjectsStream, 
  TypedArrayStream,
  TraverseMode, 
  RGBA,
  PixelStream, 
} from './class';

interface BenchmarkResult {
    implementation: string;
    operation: string;
    durationMs: number;
    operationsPerSecond: number;
}

class PixelStreamBenchmark {
  private width: number;
  private height: number;
  private totalPixels: number;
  private implementations: Map<string, new (width: number, height: number) => PixelStream>;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.totalPixels = width * height;
    this.implementations = new Map<string, new (width: number, height: number) => PixelStream>([
      ['FlatArray', FlatArrayStream],
      ['ArrayOfArrays', ArrayOfArraysStream],
      ['ArrayOfObjects', ArrayOfObjectsStream],
      ['TypedArray', TypedArrayStream],
    ]);
  }

  private measureTime(operation: () => void): number {
    const start = performance.now();
    operation();
    const end = performance.now();
    return end - start;
  }

  private formatResult(result: BenchmarkResult): void {
    console.log(`${result.implementation} - ${result.operation}:`);
    console.log(`  Duration: ${result.durationMs.toFixed(2)}ms`);
    console.log(`  Operations/sec: ${result.operationsPerSecond.toFixed(2)}`);
  }

  private formatComparison(results: BenchmarkResult[]): void {
    if (results.length === 0) return;
    
    // Group by operation
    const operationGroups = new Map<string, BenchmarkResult[]>();
    results.forEach(result => {
      if (!operationGroups.has(result.operation)) {
        operationGroups.set(result.operation, []);
      }
      operationGroups.get(result.operation)!.push(result);
    });

    console.log('\n=== PERFORMANCE COMPARISON ===');
    for (const [operation, groupResults] of operationGroups) {
      console.log(`\n${operation}:`);
      
      // Sort by duration (fastest first)
      const sorted = [...groupResults].sort((a, b) => a.durationMs - b.durationMs);
      const fastest = sorted[0];
      
      sorted.forEach(result => {
        const ratio = result.durationMs / fastest.durationMs;
        const marker = result === fastest ? '★ FASTEST' : `${ratio.toFixed(2)}x slower`;
        console.log(`  ${result.implementation.padEnd(15)}: ${result.durationMs.toFixed(2)}ms (${marker})`);
      });
    }
  }

  // Initialize stream with test data
  private initializeStream(stream: PixelStream): void {
    for (let i = 0; i < this.totalPixels; i++) {
      const x = i % this.width;
      const y = Math.floor(i / this.width);
      stream.setPixel(x, y, [i % 256, (i * 2) % 256, (i * 3) % 256, 255]);
    }
  }

  // 1. getPixel test
  benchmarkGetPixel(): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];
    
    for (const [implName, Constructor] of this.implementations) {
      const stream = new Constructor(this.width, this.height);
      this.initializeStream(stream);
      
      let pixelsRead = 0;
      const duration = this.measureTime(() => {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            stream.getPixel(x, y);
            pixelsRead++;
          }
        }
      });
      
      results.push({
        implementation: implName,
        operation: `getPixel (${this.totalPixels.toLocaleString()} pixels)`,
        durationMs: duration,
        operationsPerSecond: (pixelsRead / duration) * 1000,
      });
    }
    
    return results;
  }

  // 2. setPixel test
  benchmarkSetPixel(): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];
    
    for (const [implName, Constructor] of this.implementations) {
      const stream = new Constructor(this.width, this.height);
      
      let pixelsWritten = 0;
      const duration = this.measureTime(() => {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            stream.setPixel(x, y, [255, 0, 0, 255]);
            pixelsWritten++;
          }
        }
      });
      
      results.push({
        implementation: implName,
        operation: `setPixel (${this.totalPixels.toLocaleString()} pixels)`,
        durationMs: duration,
        operationsPerSecond: (pixelsWritten / duration) * 1000,
      });
    }
    
    return results;
  }

  // 3. forEach with RowMajor test
  benchmarkForEachRowMajor(): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];
    
    for (const [implName, Constructor] of this.implementations) {
      const stream = new Constructor(this.width, this.height);
      this.initializeStream(stream);
      
      let iterations = 0;
      const duration = this.measureTime(() => {
        stream.forEach(TraverseMode.RowMajor, () => {
          iterations++;
        });
      });
      
      results.push({
        implementation: implName,
        operation: `forEach RowMajor (${this.totalPixels.toLocaleString()} iterations)`,
        durationMs: duration,
        operationsPerSecond: (iterations / duration) * 1000,
      });
    }
    
    return results;
  }

  // 4. forEach with ColMajor test
  benchmarkForEachColMajor(): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];
    
    for (const [implName, Constructor] of this.implementations) {
      const stream = new Constructor(this.width, this.height);
      this.initializeStream(stream);
      
      let iterations = 0;
      const duration = this.measureTime(() => {
        stream.forEach(TraverseMode.ColMajor, () => {
          iterations++;
        });
      });
      
      results.push({
        implementation: implName,
        operation: `forEach ColMajor (${this.totalPixels.toLocaleString()} iterations)`,
        durationMs: duration,
        operationsPerSecond: (iterations / duration) * 1000,
      });
    }
    
    return results;
  }

  // 5. setPixel during RowMajor traversal
  benchmarkSetPixelDuringRowMajorTraversal(): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];
    
    for (const [implName, Constructor] of this.implementations) {
      const stream = new Constructor(this.width, this.height);
      
      let modifications = 0;
      const duration = this.measureTime(() => {
        stream.forEach(TraverseMode.RowMajor, (rgba, x, y) => {
          const newColor: RGBA = [x % 256, y % 256, (x + y) % 256, 255];
          stream.setPixel(x, y, newColor);
          modifications++;
        });
      });
      
      results.push({
        implementation: implName,
        operation: `forEach RowMajor + setPixel (${modifications.toLocaleString()} modifications)`,
        durationMs: duration,
        operationsPerSecond: (modifications / duration) * 1000,
      });
    }
    
    return results;
  }

  // 6. setPixel during ColMajor traversal
  benchmarkSetPixelDuringColMajorTraversal(): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];
    
    for (const [implName, Constructor] of this.implementations) {
      const stream = new Constructor(this.width, this.height);
      
      let modifications = 0;
      const duration = this.measureTime(() => {
        stream.forEach(TraverseMode.ColMajor, (rgba, x, y) => {
          const newColor: RGBA = [x % 256, y % 256, (x + y) % 256, 255];
          stream.setPixel(x, y, newColor);
          modifications++;
        });
      });
      
      results.push({
        implementation: implName,
        operation: `forEach ColMajor + setPixel (${modifications.toLocaleString()} modifications)`,
        durationMs: duration,
        operationsPerSecond: (modifications / duration) * 1000,
      });
    }
    
    return results;
  }

  // 7. getPixel + setPixel alternating (RowMajor)
  benchmarkGetAndSetAlternatingRowMajor(): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];
    
    for (const [implName, Constructor] of this.implementations) {
      const stream = new Constructor(this.width, this.height);
      this.initializeStream(stream);
      
      let operations = 0;
      const duration = this.measureTime(() => {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const pixel = stream.getPixel(x, y);
            const modifiedPixel: RGBA = [255 - pixel[0], 255 - pixel[1], 255 - pixel[2], pixel[3]];
            stream.setPixel(x, y, modifiedPixel);
            operations += 2;
          }
        }
      });
      
      results.push({
        implementation: implName,
        operation: `getPixel + setPixel RowMajor (${this.totalPixels.toLocaleString()} pairs)`,
        durationMs: duration,
        operationsPerSecond: (operations / duration) * 1000,
      });
    }
    
    return results;
  }

  // 8. getPixel + setPixel alternating (ColMajor)
  benchmarkGetAndSetAlternatingColMajor(): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];
    
    for (const [implName, Constructor] of this.implementations) {
      const stream = new Constructor(this.width, this.height);
      this.initializeStream(stream);
      
      let operations = 0;
      const duration = this.measureTime(() => {
        for (let x = 0; x < this.width; x++) {
          for (let y = 0; y < this.height; y++) {
            const pixel = stream.getPixel(x, y);
            const modifiedPixel: RGBA = [255 - pixel[0], 255 - pixel[1], 255 - pixel[2], pixel[3]];
            stream.setPixel(x, y, modifiedPixel);
            operations += 2;
          }
        }
      });
      
      results.push({
        implementation: implName,
        operation: `getPixel + setPixel ColMajor (${this.totalPixels.toLocaleString()} pairs)`,
        durationMs: duration,
        operationsPerSecond: (operations / duration) * 1000,
      });
    }
    
    return results;
  }

  // Run all benchmarks for all implementations
  runAll(): void {
    console.log('\n========================================');
    console.log('PIXEL STREAM BENCHMARK - ALL IMPLEMENTATIONS');
    console.log(`Size: ${this.width}x${this.height} pixels`);
    console.log(`Total pixels: ${this.totalPixels.toLocaleString()}`);
    console.log(`Total RGBA values: ${(this.totalPixels * 4).toLocaleString()}`);
    console.log(`Implementations: ${Array.from(this.implementations.keys()).join(', ')}`);
    console.log('========================================\n');

    const allResults: BenchmarkResult[] = [
      ...this.benchmarkGetPixel(),
      ...this.benchmarkSetPixel(),
      ...this.benchmarkForEachRowMajor(),
      ...this.benchmarkForEachColMajor(),
      ...this.benchmarkSetPixelDuringRowMajorTraversal(),
      ...this.benchmarkSetPixelDuringColMajorTraversal(),
      ...this.benchmarkGetAndSetAlternatingRowMajor(),
      ...this.benchmarkGetAndSetAlternatingColMajor(),
    ];

    // Display detailed results grouped by implementation
    console.log('=== DETAILED RESULTS ===\n');
    for (const impl of this.implementations.keys()) {
      console.log(`\n📊 ${impl} Implementation:`);
      console.log('─'.repeat(50));
      const implResults = allResults.filter(r => r.implementation === impl);
      implResults.forEach(result => this.formatResult(result));
    }

    // Display comparison across implementations
    this.formatComparison(allResults);

    // Summary
    console.log('\n=== SUMMARY ===');
    const summary: Map<string, { totalTime: number; testsWon: number }> = new Map();
    
    const operationGroups = new Map<string, BenchmarkResult[]>();
    allResults.forEach(result => {
      if (!operationGroups.has(result.operation)) {
        operationGroups.set(result.operation, []);
      }
      operationGroups.get(result.operation)!.push(result);
    });
    
    for (const [, groupResults] of operationGroups) {
      const fastest = groupResults.reduce((fastest, current) => 
        current.durationMs < fastest.durationMs ? current : fastest,
      );
      
      if (!summary.has(fastest.implementation)) {
        summary.set(fastest.implementation, { totalTime: 0, testsWon: 0 });
      }
      summary.get(fastest.implementation)!.testsWon++;
    }
    
    for (const [impl, data] of summary.entries()) {
      console.log(`🏆 ${impl}: fastest in ${data.testsWon}/${operationGroups.size} tests`);
    }
    
    console.log('\n💡 Recommendation:');
    const overallWinner = Array.from(summary.entries()).reduce((a, b) => 
      a[1].testsWon > b[1].testsWon ? a : b,
    );
    console.log(`   ${overallWinner[0]} is the fastest implementation, winning ${overallWinner[1].testsWon} out of ${operationGroups.size} benchmarks`);
  }
}

// Run benchmarks
const BENCHMARK_WIDTH = 500;  // Reduced for reasonable test time
const BENCHMARK_HEIGHT = 500; // 250,000 pixels total

console.log('Starting benchmarks...');
const benchmark = new PixelStreamBenchmark(BENCHMARK_WIDTH, BENCHMARK_HEIGHT);
benchmark.runAll();