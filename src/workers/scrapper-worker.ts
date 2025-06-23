import { parentPort, workerData } from 'worker_threads';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface WorkerData {
  urls: string[];
  selector?: string;
}

async function scrapeUrl(url: string, selector?: string) {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    const data = selector ? $(selector).text() : response.data;
    
    return {
      url,
      data,
      timestamp: Date.now(),
      success: true
    };
  } catch (error) {
    return {
      url,
      error: (error as Error).message,
      timestamp: Date.now(),
      success: false
    };
  }
}

async function processBatch() {
  const { urls, selector } = workerData as WorkerData;
  const results = [];
  
  for (const url of urls) {
    const result = await scrapeUrl(url, selector);
    results.push(result);
    
    parentPort?.postMessage({ type: 'progress', result });
  }
  
  parentPort?.postMessage({ type: 'complete', results });
}

processBatch();