import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import * as restify from "restify";
import documentationBotControllerInstance from "./controllers/apiMessagesController";

const server = restify.createServer();

server.post(
  "/api/documentation-bot",
  documentationBotControllerInstance.process
);

server.listen(process.env.port || process.env.PORT || 3978, () =>
  console.log(`\n${server.name} listening to ${server.url}`)
);
