import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import * as restify from "restify";
import DocumentationBot from "./bots/documentationBot";
import DocumentationBotController from "./controllers/apiMessagesController";

const documentationBotInstance = new DocumentationBot();
const documentationBotControllerInstance = new DocumentationBotController(
  documentationBotInstance
);

const server = restify.createServer();

server.post(
  "/api/documentation-bot",
  documentationBotControllerInstance.process
);

server.listen(process.env.port || process.env.PORT || 3978, () =>
  console.log(`\n${server.name} listening to ${server.url}`)
);
