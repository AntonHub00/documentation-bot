import { ConversationState, MemoryStorage, UserState } from "botbuilder";
import { Request, Response } from "restify";
import adapter from "../adapters/adapter";
import Bot from "../bots/bot";
import AddDocumentationDialog from "../dialogs/addDocumentationDialog/addDocumentationDialog";

const memoryStorage = new MemoryStorage();

// Create conversation state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create the main dialog.
const dialog = new AddDocumentationDialog(userState);
const myBot = new Bot(conversationState, userState, dialog);

const handleAPIMessages = async (req: Request, res: Response) => {
  adapter.process(req, res, (context) => myBot.run(context));
};

export default {
  handleAPIMessages,
};
