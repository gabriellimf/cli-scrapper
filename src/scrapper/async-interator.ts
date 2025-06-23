import PQueue from 'p-queue';
import { Worker } from 'worker_threads';
import path from 'path';

export class ScrapingIterator {
  private queue: PQueue;
  
  constructor(private concurrency: number = 5) {
    this.queue = new PQueue({ concurrency });
  }
  
  async* scrape(urls: string[], selector?: string): AsyncGenerator<any, void, unknown> {
    const chunkSize = Math.ceil(urls.length / this.concurrency);
    const chunks = this.chunkArray(urls, chunkSize);
    
    const workerPromises = chunks.map(chunk => 
      this.queue.add(() => this.createWorker(chunk, selector))
    );
    
    for (const workerPromise of workerPromises) {
      const results = await workerPromise;
      
      if (results && Array.isArray(results)) {
        for (const result of results) {
          yield result;
        }
      }
    }
  }
  
  private async createWorker(urls: string[], selector?: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        path.join(__dirname, '../workers/scraper-worker.js'),
        { workerData: { urls, selector } }
      );
      
      let finalResults: any[] = [];
      
      worker.on('message', (message) => {
        if (message.type === 'progress') {
          console.log('Progress:', message.result);
        } else if (message.type === 'complete') {
          finalResults = message.results || [];
          resolve(finalResults);
        }
      });
      
      worker.on('error', (error) => {
        console.error('Worker error:', error);
        reject(error);
      });
      
      setTimeout(() => {
        worker.terminate();
        resolve(finalResults);
      }, 30000);
    });
  }
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}