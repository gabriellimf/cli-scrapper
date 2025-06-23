export interface ScrapingTarget<T = any> {
  url: string;
  selector?: string;
  transform?: (data: any) => T;
}

export type ApiResponse<T> = T extends string
  ? { text: T; timestamp: number }
  : T extends object
  ? { data: T; timestamp: number }
  : never;

export type ScrapingOptions = {
  readonly [K in keyof ScrapingTarget]: ScrapingTarget<K>;
} & {
  concurrency?: number;
  delay?: number;
  retries?: number;
};

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
}