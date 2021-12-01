import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import * as restify from "restify";
import DocumentationBot from "./bots/documentationBot";
import DocumentationBotController from "./controllers/apiMessagesController";

const documentationBotInstance = new DocumentationBot();
const documentationBotControllerInstance = new DocumentationBotController(
  documentationBotInstance
);

// Create HTTP server.
// maxParamLength defaults to 100, which is too short for the conversationId
// created in skillConversationIdFactory.
// See: https://github.com/microsoft/BotBuilder-Samples/issues/2194.
const server = restify.createServer({ maxParamLength: 1000 });

server.use(restify.plugins.bodyParser());

server.post("/api/messages", documentationBotControllerInstance.process);

server.listen(process.env.port || process.env.PORT || 3978, () =>
  console.log(`\n${server.name} listening to ${server.url}`)
);
