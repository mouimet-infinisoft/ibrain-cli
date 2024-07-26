import {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from "openai/resources";

export interface ICommunicationService {
  addFlowMessage(message: ChatCompletionMessageParam): Promise<void>;
  batchFlowMessage(messages: ChatCompletionMessageParam[]): Promise<void>;
  getFlowMessages(limit: number): Promise<ChatCompletionMessage[]>;
}
