import { Request, Response } from "restify";
import adapter from "../adapters/adapter";
import DocumentationBot from "../bots/documentationBot";

export default class DocumentationBotController {
  private documentationBotInstance: DocumentationBot;

  constructor(documentationBotInstance: DocumentationBot) {
    this.documentationBotInstance = documentationBotInstance;
    this.process = this.process.bind(this);
  }

  public async process(req: Request, res: Response) {
    adapter.process(req, res, (context) =>
      this.documentationBotInstance.run(context)
    );
  }
}
