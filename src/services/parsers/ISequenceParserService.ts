export interface ISequenceParserService {
  run(content: string): Promise<string>;
  shouldRun(content: string): boolean;
}
