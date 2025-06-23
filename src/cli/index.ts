import { Command } from 'commander';
import cliProgress from 'cli-progress';
import { ScrapingIterator } from '../scrapper/async-interator';
import { createStreamPipeline } from '../streams';
import { measure, retry } from '../decorators';

export class CLI {
  private program: Command;
  private progressBar: cliProgress.SingleBar;
  
  constructor() {
    this.program = new Command();
    this.progressBar = new cliProgress.SingleBar({
      format: 'Progresso |{bar}| {percentage}% | {value}/{total} URLs | ETA: {eta}s',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });
  }
  
  @measure
  @retry(3)
  async scrapeCommand(urls: string[], options: any) {
    console.log(`🚀 Iniciando scraping de ${urls.length} URLs...`);
    
    const iterator = new ScrapingIterator(parseInt(options.concurrency) || 5);
    const results: any[] = [];
    
    this.progressBar.start(urls.length, 0);
    
    try {
      for await (const result of iterator.scrape(urls, options.selector)) {
        results.push(result);
        this.progressBar.increment();
      }
      
      this.progressBar.stop();
      
      if (options.output) {
        console.log(`Salvando resultados em ${options.output}...`);
        
        const resultGenerator = async function* () {
          for (const result of results) {
            yield result;
          }
        };
        
        await createStreamPipeline(
          resultGenerator(),
          options.output,
          options.transform ? eval(`(${options.transform})`) : undefined
        );
      }
      
      console.log(`Concluído! ${results.length} resultados processados.`);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;
      console.log(`Sucesso: ${successful}, Falhas: ${failed}`);
      
    } catch (error) {
      this.progressBar.stop();
      throw error;
    }
  }
  
  setupCommands() {
    this.program
      .name('advanced-scraper')
      .description('CLI avançado para web scraping concorrente')
      .version('1.0.0');
    
    this.program
      .command('scrape')
      .description('Fazer scraping de URLs')
      .argument('<urls...>', 'URLs para fazer scraping')
      .option('-c, --concurrency <number>', 'Número de requests simultâneos', '5')
      .option('-s, --selector <string>', 'Seletor CSS para extrair dados')
      .option('-o, --output <file>', 'Arquivo de saída')
      .option('-t, --transform <function>', 'Função de transformação dos dados (ex: "data => data.title")')
      .action((urls, options) => this.scrapeCommand(urls, options));
    
    return this.program;
  }
}