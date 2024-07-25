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


export type MemoryService = ReturnType<typeof createClient<Database>>
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

  const supaBaseDataService = new SupabaseDataService(
    loadedEnv.SUPABASE_CONNEXION_STRING
  );
  const microTemplateDataService = new MicroAppTemplateDataService("", "");

  const aiService = new OpenAIService(
    loadedEnv.AI_PROVIDER_BASE_URL,
    loadedEnv.AI_PROVIDER_API_KEY,
    loadedEnv.AI_MODEL
  );

  const userProcessorProvider = new ProcessorProvider([
    new ExitParserService(),
  ]);
  const aiProcessorProvider = new ProcessorProvider([
    new MicroAppTemplateParserService(microTemplateDataService),
    // new SupabaseParserService(dataService),
    // new UmlDiagramParserService()
  ]);

  const chatService = new ChatService(
    aiService,
    // dataService,
    microTemplateDataService,
    aiProcessorProvider,
    userProcessorProvider,
    logService
  );

  container.register<IAiService>("aiService", aiService);
  // container.register<IDataService>("dataService", dataService);
  container.register<IChatService>("chatService", chatService);
  container.register<Logger>("logService", logService);
  container.register<TStore>("storeService", storeService);
  // container.register<ProcessorProvider>("aiProcessor", aiProcessorProvider);
  container.register<MemoryService>("supabaseService", memoryService);

  return container;
};
