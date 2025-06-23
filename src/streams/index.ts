import { Transform, Writable, pipeline } from 'stream';
import { promisify } from 'util';
import fs from 'fs';

const pipelineAsync = promisify(pipeline);

export class DataProcessor extends Transform {
  constructor(private transformer?: (data: any) => any) {
    super({ objectMode: true });
  }
  
  _transform(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
    try {
      const processed = this.transformer ? this.transformer(chunk) : chunk;
      this.push(JSON.stringify(processed) + '\n');
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }
}

export class FileWriter extends Writable {
  private writeStream: fs.WriteStream;
  
  constructor(filename: string) {
    super({ objectMode: true });
    this.writeStream = fs.createWriteStream(filename, { flags: 'a' });
  }
  
  _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
    this.writeStream.write(chunk, (error) => {
      callback(error);
    });
  }
  
  _final(callback: (error?: Error | null) => void) {
    this.writeStream.end((error: Error) => {
      callback(error);
    });
  }
}

export async function createStreamPipeline(
  source: AsyncIterable<any>,
  filename: string,
  transformer?: (data: any) => any
) {
  const processor = new DataProcessor(transformer);
  const writer = new FileWriter(filename);
  
  const { Readable } = await import('stream');
  const readable = Readable.from(source);
  
  await pipelineAsync(readable, processor, writer);
}