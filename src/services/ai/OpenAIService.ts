import {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources";
import { IAiService } from "./IAiService";
import OpenAI from "openai";
import { Tools } from "./abstract/tool";
import { Logger } from "@brainstack/log";
import { TStore } from "@brainstack/core";
import { CommunicationService } from "../communication/CommunicationService";
import { iBrainOutput } from "../../utils/iBrainOutput";

export class OpenAIService implements IAiService {
  private ai: OpenAI;
  private model: string;

  constructor(
    private logService: Logger,
    private storeService: TStore,
    private communicationService: CommunicationService,
    baseURL: string,
    apiKey: string,
    model: string
  ) {
    this.ai = new OpenAI({
      apiKey,
      baseURL,
    });
    this.model = model;
  }

  private executeToolCall =
    (tools: Tools) => async (toolCall: ChatCompletionMessageToolCall) => {
      const tool = tools[toolCall.function.name];

      if (!tool) {
        this.logService.error(
          `No tool found with name: ${String(
            toolCall.function.name
          ).toLowerCase()}`
        );
        return null;
      }

      try {
        this.logService.verbose(
          `Tool Call Function Name: ${String(
            toolCall.function.name
          ).toLowerCase()} with argument`,
          toolCall.function.arguments
        );
        this.storeService.emit(`event.${toolCall.function.name}.call`, {
          payload: toolCall.function.arguments,
        });
        const content = await tool.execute(toolCall.function.arguments);
        this.storeService.emit(`event.${toolCall.function.name}.response`, {
          payload: content,
        });
        this.logService.verbose(
          `Tool Call Function Name: ${String(
            toolCall.function.name
          ).toLowerCase()} with argument`,
          toolCall.function.arguments,
          ` Result: `,
          content
        );
        return {
          content,
          tool_call_id: toolCall.id,
        };
      } catch (error: any) {
        this.logService.error(
          `Error executing tool ${toolCall.function.name}:`,
          error
        );
        return error?.message;
      }
    };

  async askWithTool(
    message: string,
    context: string,
    tools: Tools
  ): Promise<string> {
    await this.communicationService.addFlowMessage({
      role: "user",
      content: message,
    });
    const messages = await this.communicationService.getFlowMessages(10);

    const response = await this.ai.chat.completions.create({
      model: this.model,
      messages,
      tool_choice: "auto",
      tools: Object.keys(tools).map((key) => tools[key].definition),
      temperature: 0.8,
    });

    this.logService.verbose(`ai response: `, JSON.stringify(response, null, 2));

    // no tool answer direct
    if (!response?.choices?.[0]?.message?.tool_calls) {
      const r = response?.choices?.[0]?.message?.content?.trim() ?? "";
      await this.communicationService.addFlowMessage({
        role: "assistant",
        content: r,
      });

      return r;
    }

    iBrainOutput("Ok, give me a moment. On it!");

    const toolCallsPromises = response.choices[0].message.tool_calls.map(
      this.executeToolCall(tools)
    );
    const toolResponses = await Promise.all(toolCallsPromises);

    const validResponses = toolResponses.filter(
      (response: any) => response !== null
    );

    const toolFinalFlow: ChatCompletionMessageParam[] = [];
    validResponses.forEach((args: any) => {
      if (!args) return;
      const { content, tool_call_id } = args;
      toolFinalFlow.push({
        role: "tool",
        tool_call_id,
        content,
      });
    });

    await this.communicationService.batchFlowMessage(toolFinalFlow);
    const latestMessage: ChatCompletionMessage[] =
      await this.communicationService.getFlowMessages(10);

    try {
      const finalResponse = await this.ai.chat.completions.create({
        model: this.model,
        messages: latestMessage,
      });
      const r = finalResponse?.choices?.[0]?.message?.content?.trim() ?? "";
      await this.communicationService.addFlowMessage({
        role: "assistant",
        content: r,
      });

      return r;
    } catch (error: any) {
      this.logService.error(error);
    }
    return "";
  }

  async ask(message: string, context: string): Promise<string> {
    const response = await this.ai.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: context },
        { role: "user", content: message },
      ],
    });

    return response?.choices?.[0]?.message?.content?.trim() ?? "";
  }
}
