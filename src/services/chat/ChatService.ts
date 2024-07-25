import { Logger } from "@brainstack/log";
import { IProcessorProvider } from "../../providers/processors/IProcessorProvider";
import { promptUser } from "../../utils/promptUser";
import { IAiService } from "../ai/IAiService";
import { IDataService } from "../data/IDataService";
import { IChatService } from "./IChatService";
import { plantUmlErdSkill } from "../prompts/erd.plantuml";
import tool from "../fs/fs.tool";
import { container } from "../..";
import { TStore } from "@brainstack/core";
import { MemoryService } from "../../core/di/prepareDiContainer";

export class ChatService implements IChatService {
  constructor(
    private aiService: IAiService,
    private dataService: IDataService,
    private aiProcessorProvider: IProcessorProvider,
    private userProcessorProvider: IProcessorProvider,
    private logService: Logger
  ) {}

  public async chat(): Promise<void> {
    this.logService.log('Chatting with AI. Type "exit" to quit.');
    const memoryService = container.get<MemoryService>("supabaseService");
    if (!memoryService) {
      throw new Error("Memory service is not available");
    }

    while (true) {
      const context1 = await this.dataService.getContext();

      // const context = await new FSDataService("", "").getContext();
      // + "\n\n" + plantUmlErdSkill;
      // const context = "";
      let context = `We are creating a software project together.
        Project Source Codes are in:
        /home/nitr0gen/rqrsda24/src`;
      const userInput = promptUser("You: ");
      await this.userProcessorProvider.process(userInput);

      const { data: memoryData, error: memoryError } = await memoryService
        .from("chat_history")
        .select("*")
        .eq("user_id", "user123")
        .order("timestamp", { ascending: false })
        .limit(10);

      if (!memoryError && memoryData) {
        context =
          `${context} \n\nConsider following message as the history of our conversation: ` +
          memoryData
            .map((c) => `User: ${c.message}'\nAI Response:${c.response}\n `)
            .join("\n");
      }

      const { data: currentMessageData, error: currentMessageError } =
        await memoryService
          .from("chat_history")
          .insert([{ user_id: "user123", message: userInput }])
          .select("*")
          .single();

      const aiResponse = await this.aiService.askWithTool(
        userInput,
        context,
        tool
      );

      await this.aiProcessorProvider.process(aiResponse);
      const s = container.get<TStore>("storeService");
      s?.emit("ai.talk", { answer: aiResponse });

      console.log(
        `
\x1b[1m\x1b[34miBrain:\x1b[0m`,
        `\x1b[34m`,
        aiResponse,
        `\x1b[0m`
      );

      const { data, error } = await memoryService
        .from("chat_history")
        .update({ response: aiResponse })
        .eq("id", currentMessageData?.id!);
    }
  }
}
