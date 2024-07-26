import { ISequenceParserService } from "./ISequenceParserService";

export class SequenceParserService implements ISequenceParserService {

  constructor() {
  }

  shouldRun(message: string): boolean {
    return true
  }

  async run(message: string): Promise<string> {
    if (this.shouldRun(message)) {
      await this.action();
    }

    return message;
  }

  private async action(): Promise<void> {
   
  }
}
