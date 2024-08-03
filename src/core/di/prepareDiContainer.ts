import {
  inject,
  createLogger,
  consoleIntegration,
  Logger,
  LogLevel,
  createConfigManager,
  createStore,
  createCRUD,
  TStore,
} from "@brainstack/core";

import { prepareEnvironment } from "../initialization/prepareEnvironment";
import { OpenAIService } from "../../services/ai/OpenAIService";
import { SupabaseDataService } from "../../services/services/SupabaseDataService";
import { IAiService } from "../../services/ai/IAiService";
import { IDataService } from "../../services/data/IDataService";
import { ChatService } from "../../services/chat/ChatService";
import { IChatService } from "../../services/chat/IChatService";
import { ProcessorProvider } from "../../providers/processors/ProcessorProvider";
import { ExitParserService } from "../../services/parsers/ExitParserService";
import { MicroAppTemplateDataService } from "../../services/microappTemplate/MicroAppTemplateDataService";
import { MicroAppTemplateParserService } from "../../services/microappTemplate/MicroAppTemplateParserService";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types";
import { CommunicationService } from "../../services/communication/CommunicationService";
import { SequenceProcessorProvider } from "../../providers/processors/SequenceProcessorProvider";
import { SequenceParserService } from "../../services/parsers/SequenceParserService";
import { CodeExtractionParserService } from "../../services/parsers/CodeExtractionParserService";

export type MemoryService = ReturnType<typeof createClient<Database>>;
export type DIContainer = ReturnType<typeof inject>;

export const prepareDiContainer = (
  loadedEnv: ReturnType<typeof prepareEnvironment>
): DIContainer => {
  const container = inject();

  const logService = createLogger(LogLevel.VERBOSE, [consoleIntegration]);
  const storeService = createStore();
  const memoryService = createClient<Database>(
    loadedEnv.SUPABASE_URL,
    loadedEnv.SUPABASE_KEY
  );

  const communicationService = new CommunicationService(
    logService,
    storeService,
    memoryService
  );

  communicationService
    .addFlowMessage({
      role: "system",
      content: `You are iBrain One an AI assistant. You will call apprropriate function only if required. Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous. If no tool call required just answer.`,
    })
    .then()
    .catch();


  const supaBaseDataService = new SupabaseDataService(
    loadedEnv.SUPABASE_CONNEXION_STRING
  );
  const microTemplateDataService = new MicroAppTemplateDataService("", "");

  const aiService = new OpenAIService(
    logService,
    storeService,
    communicationService,
    loadedEnv.AI_PROVIDER_BASE_URL,
    loadedEnv.AI_PROVIDER_API_KEY,
    loadedEnv.AI_MODEL
  );

  const userProcessorProvider = new ProcessorProvider([
    new ExitParserService(),
  ]);
  // const aiProcessorProvider = new ProcessorProvider([
  //   new MicroAppTemplateParserService(microTemplateDataService),
  //   // new SupabaseParserService(dataService),
  //   // new UmlDiagramParserService()
  // ]);
  const aiPostProcessorProvider = new SequenceProcessorProvider([
    new SequenceParserService(),
    new CodeExtractionParserService(),
  ]);

  const chatService = new ChatService(
    aiService,
    aiPostProcessorProvider,
    // aiProcessorProvider,
    userProcessorProvider,
    logService,
    communicationService
  );

  container.register<IAiService>("aiService", aiService);
  container.register<IChatService>("chatService", chatService);
  container.register<Logger>("logService", logService);
  container.register<TStore>("storeService", storeService);
  container.register<MemoryService>("supabaseService", memoryService);
  container.register<CommunicationService>(
    "communicationService",
    communicationService
  );

  return container;
};
