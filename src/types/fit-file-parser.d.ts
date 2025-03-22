declare module "fit-file-parser" {
  export interface FitParserOptions {
    force?: boolean;
    mode?: "list" | "object";
  }

  export interface FitData {
    records: Array<{
      timestamp: Date;
      heart_rate?: number;
      power?: number;
      speed?: number;
      [key: string]: unknown;
    }>;
  }

  export class FitParser {
    constructor(options?: FitParserOptions);
    parse(
      buffer: ArrayBuffer,
      callback: (error: Error | null, data: FitData) => void
    ): void;
  }
}
