import { parentPort, workerData } from 'worker_threads';

interface WorkerData {
  urls: string[];
  selector?: string;
}

interface ScrapingResult {
  url: string;
  data?: any;
  error?: string;
  timestamp: number;
  success: boolean;
}

async function scrapeUrl(url: string, selector?: string): Promise<ScrapingResult> {
  try {
    const response = await fetch(url, { 
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    let data: any;
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
      
      if (selector && contentType.includes('text/html')) {
        data = { text: data, selector };
      }
    }
    
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
  const results: ScrapingResult[] = [];
  
  for (const url of urls) {
    const result = await scrapeUrl(url, selector);
    results.push(result);
    
    parentPort?.postMessage({ type: 'progress', result });
  }
  
  parentPort?.postMessage({ type: 'complete', results });
}

processBatch().catch((error) => {
  parentPort?.postMessage({ 
    type: 'complete', 
    results: [],
    error: error.message 
  });
});