import { Request, Response } from "restify";
import adapter from "../adapters/adapter";
import Bot from "../bots/bot";

const myBot = new Bot();

const handleAPIMessages = async (req: Request, res: Response) => {
  adapter.processActivity(req, res, async (context) => {
    await myBot.run(context);
  });
};

export default {
  handleAPIMessages,
};
