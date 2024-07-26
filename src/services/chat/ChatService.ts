import { Logger } from "@brainstack/log";
import { IProcessorProvider } from "../../providers/processors/IProcessorProvider";
import { promptUser } from "../../utils/promptUser";
import { IAiService } from "../ai/IAiService";
import { IChatService } from "./IChatService";
import tool from "../fs/fs.tool";
import { ICommunicationService } from "../communication/ICommunicationService";
import { promptProcessor } from "../../utils/promptProcessor";
import { iBrainOutput } from "../../utils/iBrainOutput";

export class ChatService implements IChatService {
  constructor(
    private aiService: IAiService,
    private aiPostProcessorProvider: IProcessorProvider,
    // private aiProcessorProvider: IProcessorProvider,
    private userProcessorProvider: IProcessorProvider,
    private logService: Logger,
    private communicationService: ICommunicationService
  ) {}

  public async chat(): Promise<void> {
    this.logService.log('Chatting with AI. Type "exit" to quit.');

    while (true) {
      try {
        const userInput = promptUser("You: ");
        await this.userProcessorProvider.process(userInput);

        const aiResponse = await this.aiService.askWithTool(
          userInput,
          "",
          tool
        );
        const response = await this.aiPostProcessorProvider.process(aiResponse);

        iBrainOutput(response);
      } catch (err: any) {
        this.logService.error(err);
      }
    }
  }
}
