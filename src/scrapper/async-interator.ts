import PQueue from 'p-queue';
import { Worker } from 'worker_threads';
import path from 'path';

export class ScrapingIterator {
  private queue: PQueue;
  private results: any[] = [];
  
  constructor(private concurrency: number = 5) {
    this.queue = new PQueue({ concurrency });
  }
  
  async* scrape(urls: string[], selector?: string): AsyncGenerator<any, void, unknown> {
    const chunkSize = Math.ceil(urls.length / this.concurrency);
    const chunks = this.chunkArray(urls, chunkSize);
    
    const workers = chunks.map(chunk => 
      this.queue.add(() => this.createWorker(chunk, selector))
    );
    
    for await (const worker of workers) {
      const results = await worker;
      for (const result of results) {
        yield result;
      }
    }
  }
  
  private async createWorker(urls: string[], selector?: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        path.join(__dirname, '../workers/scraper-worker.js'),
        { workerData: { urls, selector } }
      );
      
      const results: any[] = [];
      
      worker.on('message', (message) => {
        if (message.type === 'progress') {
        } else if (message.type === 'complete') {
          resolve(message.results);
        }
      });
      
      worker.on('error', reject);
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