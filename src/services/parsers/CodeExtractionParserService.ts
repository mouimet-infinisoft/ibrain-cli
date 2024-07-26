import { ISequenceParserService } from "./ISequenceParserService";
import fs from "fs";
import path from "path";

export class CodeExtractionParserService implements ISequenceParserService {

  constructor() {}

  shouldRun(message: string): boolean {
    return false;
    // Check if the message contains code enclosed in triple backticks
    return /```[\s\S]*?```/.test(message);
  }

  async run(message: string): Promise<string> {
    if (this.shouldRun(message)) {
      const codes = this.extractCodes(message);
      if (codes.length > 0) {
        // Save each extracted code block to a file
        for (const code of codes) {
          await this.saveCodeToFile(code);
        }
        // Remove the code blocks from the message and add annotation
        return message.replace(/```[\s\S]*?```/g, "[source code has been removed]");
      }
    }
    return message;
  }

  private extractCodes(message: string): string[] {
    // Extract code blocks enclosed in triple backticks
    const matches = message.match(/```[\s\S]*?```/g);
    return matches ? matches.map(code => code.replace(/```/g, '').trim()) : [];
  }

  private async saveCodeToFile(code: string): Promise<void> {
    // Generate a unique file name for the source code
    const fileName = `source_code_${Date.now()}.txt`;
    const filePath = path.join(__dirname, "source_code_files", fileName);

    // Ensure the directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // Save the code to a file
    fs.writeFileSync(filePath, code);
  }
}
