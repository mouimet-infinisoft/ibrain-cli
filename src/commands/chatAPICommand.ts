// chatAPICommand.ts
import { container } from "..";
import express from "express";
import cors from "cors";
import { IChatService } from "../services/chat/IChatService";
import { Readable } from "stream";

export const chatAPICommand = async (): Promise<void> => {
  const chatService = container.get<IChatService>("chatService");
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: "*" }));

  app.post("/chat", async (req, res) => {
    console.info("Received a POST request at /chat");

    const userInput = req.body.text;
    console.info(`User input: ${userInput}`);
    const response = await chatService!.message(userInput);
    res.json({ response });
  });

  app.post("/chat/stream", async (req, res) => {
    console.info("Received a POST request at /chat/stream");

    const userInput = req.body.text;
    console.info(`User input: ${userInput}`);

    const responseStream = new Readable({
      read() {},
    });

    const sendMessage = async () => {
      const response = await chatService!.message(userInput);
      responseStream.push(JSON.stringify({ response }));
    };

    sendMessage();

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
    });

    responseStream.pipe(res);
  });

  app.listen(3200, () => {
    console.log("Server is running on port 3200");
  });
};
