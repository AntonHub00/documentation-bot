import { Request, Response } from "restify";
import adapter from "../adapters/adapter";
import documentationBotInstance, {
  DocumentationBot,
} from "../bots/documentationBot";

class DocumentationBotController {
  private documentationBotInstance: DocumentationBot;

  constructor() {
    this.documentationBotInstance = documentationBotInstance;
    this.process = this.process.bind(this);
  }

  public async process(req: Request, res: Response) {
    adapter.process(req, res, (context) =>
      this.documentationBotInstance.run(context)
    );
  }
}

const documentationBotControllerInstance = new DocumentationBotController();

export default documentationBotControllerInstance;
