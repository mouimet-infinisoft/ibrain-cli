import tools, { Tools } from "../services/fs/fs.tool";
import { container } from "..";
import { CommunicationService } from "../services/communication/CommunicationService";

export type IPromptProcessorOutput = {
  userMessage: string;
  context: string;
  tools: Tools;
};

export const promptProcessor = async (userInput: string): Promise<IPromptProcessorOutput> => {
    const commService = container.get<CommunicationService>("communicationService")
    const history = ""//await commService?.getHistory(5);
    const context = 
`We are creating a software project together.

History of our discussion:
${history}
`;

  return {
    userMessage: userInput,
    context,
    tools,
  };
};




