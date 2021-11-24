import { CardFactory } from "botbuilder";
import {
  ComponentDialog,
  PromptOptions,
  TextPrompt,
  WaterfallDialog,
  WaterfallStepContext,
} from "botbuilder-dialogs";
import { Activity } from "botframework-schema";
import IDocumentationData from "../shared/IDocumentationData";
import { buildTemplate } from "../utils/templateBuilder";

import * as documentationCard from "./documentationCard.json";

const listDocumentationDialogId = "listDocumentationDialogId";
const textPromptId = "textPromptId";
const waterfallDialogId = "waterfallDialogId";

class ListDocumentationDialog extends ComponentDialog {
  private filterDoneToken = "done";

  constructor() {
    super(listDocumentationDialogId);

    this.addDialog(new TextPrompt(textPromptId));

    this.addDialog(
      new WaterfallDialog(waterfallDialogId, [
        this.getDocumentationSearchTokenStep.bind(this),
        this.loopFilterCardsStep.bind(this),
        this.endDialogStep.bind(this),
      ])
    );

    this.initialDialogId = waterfallDialogId;
  }

  private async buildActivityDocumentationCards(
    cardsData: IDocumentationData[]
  ): Promise<Partial<Activity>> {
    const activity: Partial<Activity> = {
      text: "Here's what I found:",
      attachments: cardsData.map((card) =>
        CardFactory.adaptiveCard(
          buildTemplate(documentationCard, {
            name: card.name,
            description: card.description,
            link: card.link,
          })
        )
      ),
      attachmentLayout: "carousel",
    };

    return activity;
  }

  private async getDocumentationSearchTokenStep(
    stepContext: WaterfallStepContext
  ) {
    const promptOptions: PromptOptions = {
      prompt: `Type to filter documentation or type "*" to get all. To finish type "${this.filterDoneToken}"`,
    };

    return await stepContext.prompt(textPromptId, promptOptions);
  }

  private async loopFilterCardsStep(stepContext: WaterfallStepContext) {
    const searchToken = stepContext.result;

    if (searchToken === this.filterDoneToken) return await stepContext.next();

    // NOTE: Perform some filter logic for the given search token.

    const testCards: IDocumentationData[] = [
      {
        name: "Documentation name 1",
        description: "Documentation description 1",
        link: "https://en.wikipedia.org/wiki/PDF",
      },
      {
        name: "Documentation name 2",
        description: "Documentation description 2",
        link: "https://en.wikipedia.org/wiki/PDF",
      },
      {
        name: "Documentation name 3",
        description: "Documentation description 3",
        link: "https://en.wikipedia.org/wiki/PDF",
      },
      {
        name: "Documentation name 4",
        description: "Documentation description 4",
        link: "https://en.wikipedia.org/wiki/PDF",
      },
    ];

    const cardsActivity = await this.buildActivityDocumentationCards(testCards);

    await stepContext.context.sendActivity(cardsActivity);

    return await stepContext.replaceDialog(listDocumentationDialogId);
  }

  private async endDialogStep(stepContext: WaterfallStepContext) {
    await stepContext.context.sendActivity("List action finished!");

    return await stepContext.endDialog();
  }
}

export default ListDocumentationDialog;
export { listDocumentationDialogId };
