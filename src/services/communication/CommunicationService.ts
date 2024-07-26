import { Logger } from "@brainstack/log";
import { BaseService } from "../base/BaseService";
import { TStore } from "@brainstack/core";
import { MemoryService } from "../../core/di/prepareDiContainer";
import { ICommunicationService } from "./ICommunicationService";
import {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from "openai/resources";
import { Json } from "../../types";

export class CommunicationService
  extends BaseService
  implements ICommunicationService
{
  private flowMessages: ChatCompletionMessageParam[];

  constructor(
    protected logService: Logger,
    protected storeService: TStore,
    private memoryService: MemoryService
  ) {
    super(logService, storeService);
    this.flowMessages = [];
  }
  async batchFlowMessage(
    messages: ChatCompletionMessageParam[]
  ): Promise<void> {
    this.flowMessages.push(...messages);
    // Map messages to the format expected by the database
    const records = messages.map((message) => ({
      flow: message as unknown as Json,
    }));

    // Insert all records at once
    const { data, error } = await this.memoryService
      .from("chat_history")
      .insert(records);

    if (error) {
      console.error("Error inserting batch flow messages:", error);
      throw error;
    }

  }

  async addFlowMessage(message: ChatCompletionMessageParam): Promise<void> {
    this.flowMessages.push(message);

    await this.memoryService
      .from("chat_history")
      .insert([{ flow: message as unknown as Json }])
      .select("*")
      .single();
  }

  async getFlowMessages(limit: number): Promise<ChatCompletionMessage[]> {
    const { data, error } = await this.memoryService
      .from("chat_history")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching latest messages:", error);
      throw error;
    }
    return data.map((i) => i.flow as unknown as ChatCompletionMessage).reverse();
  }
}
