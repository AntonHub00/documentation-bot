import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import * as restify from "restify";

import apiMessagesController from "./controllers/apiMessagesController";

const server = restify.createServer();

server.post("/api/messages", apiMessagesController.handleAPIMessages);

server.listen(process.env.port || process.env.PORT || 3978, () =>
  console.log(`\n${server.name} listening to ${server.url}`)
);
