import { IProcessorProvider } from "./IProcessorProvider";
import { ISequenceParserService } from "../../services/parsers/ISequenceParserService";

export class SequenceProcessorProvider implements IProcessorProvider {
  private parsers: ISequenceParserService[] = [];

  constructor(parsers?: ISequenceParserService[]) {
    if (parsers) {
      this.parsers = parsers;
    }
  }

  add(parser: ISequenceParserService): void {
    this.parsers.push(parser);
  }

  remove(parser: ISequenceParserService): void {
    const index = this.parsers.indexOf(parser);
    if (index > -1) {
      this.parsers.splice(index, 1);
    }
  }

  async process(message: string): Promise<string> {
    let currentOutput = message;
    
    for (const parser of this.parsers) {
      currentOutput = await parser.run(currentOutput);
      if (currentOutput === null || currentOutput === undefined) {
        return '';
      }
    }
    
    return currentOutput as string;
  }
}
