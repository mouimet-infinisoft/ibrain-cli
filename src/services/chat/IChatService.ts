// IChatService.ts
export interface IChatService {
  chat(): Promise<void>;
  message(message: string): Promise<string>;
}
