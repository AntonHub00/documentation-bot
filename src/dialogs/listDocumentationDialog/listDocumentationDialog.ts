import { CardFactory } from "botbuilder";
import {
  ComponentDialog,
  PromptOptions,
  TextPrompt,
  WaterfallDialog,
  WaterfallStepContext,
} from "botbuilder-dialogs";
import { Activity } from "botframework-schema";
import documentationBotBackendServiceInstance from "../../services/DocumentationBotBackendService";
import IBotDocumentationBackendService from "../../services/IBotDocumentationBackendService";
import IDocumentationData from "../shared/IDocumentationData";
import { buildTemplate } from "../utils/templateBuilder";
import DeleteDocumentationDialog, {
  deleteDocumentationDialogId,
} from "./deleteDocumentationDialog/deleteDocumentationDialog";

import * as documentationCard from "./documentationCard.json";
import EditDocumentationDialog, {
  editDocumentationDialogId,
} from "./editDocumentationDialog/editDocumentationDialog";

const listEditActionButtonName = "listEditActionButtonName";
const listDeleteActionButtonName = "listDeleteActionButtonName";
const listDocumentationDialogId = "listDocumentationDialogId";
const textPromptId = "textPromptId";
const waterfallDialogId = "waterfallDialogId";

class ListDocumentationDialog extends ComponentDialog {
  private filterDoneToken = "done";
  private currentCardsResult: IDocumentationData[] = [];
  private backendServiceInstance: IBotDocumentationBackendService;

  constructor() {
    super(listDocumentationDialogId);

    this.backendServiceInstance = documentationBotBackendServiceInstance;

    this.addDialog(new TextPrompt(textPromptId));

    this.addDialog(new EditDocumentationDialog());

    this.addDialog(new DeleteDocumentationDialog());

    this.addDialog(
      new WaterfallDialog(waterfallDialogId, [
        this.getDocumentationSearchTokenStep.bind(this),
        this.loopFilterCardsStep.bind(this),
        this.endDialogStep.bind(this),
      ])
    );

    this.initialDialogId = waterfallDialogId;
  }

  private async customBeginDialog(
    stepContext: WaterfallStepContext,
    dialogId: string
  ) {
    const cardActionData = stepContext.context.activity.value;

    const selectedCard = this.currentCardsResult.find(
      (card) => card.id == cardActionData.id
    );

    return await stepContext.beginDialog(dialogId, selectedCard);
  }

  private async getDocumentations(text: string) {
    let cards: IDocumentationData[];

    if (text === "*") {
      cards = await this.backendServiceInstance.findAll();
    } else {
      cards = await this.backendServiceInstance.findByText(text);
    }

    return cards;
  }

  private async buildActivityDocumentationCards(
    cardsData: IDocumentationData[]
  ): Promise<Partial<Activity>> {
    const activity: Partial<Activity> = {
      text: "Here's what I found:",
      attachments: cardsData.map((card) =>
        CardFactory.adaptiveCard(
          buildTemplate(documentationCard, {
            listEditActionName: listEditActionButtonName,
            listDeleteActionName: listDeleteActionButtonName,
            id: card.id,
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

    // If the edit button in the adaptive card was clicked, the bot will sent a
    // text so we can identify that the edit button was clicked. This action in
    // not a default behaviour, so we programmed it inside the bot logic
    // ("onTurn").
    if (searchToken === listEditActionButtonName) {
      return await this.customBeginDialog(
        stepContext,
        editDocumentationDialogId
      );
    }

    // If the delete button in the adaptive card was clicked, the bot will sent
    // a text so we can identify that the delete button was clicked. This action
    // in not a default behaviour, so we programmed it inside the bot logic
    // ("onTurn").
    if (searchToken === listDeleteActionButtonName) {
      return await this.customBeginDialog(
        stepContext,
        deleteDocumentationDialogId
      );
    }

    const cards = await this.getDocumentations(searchToken);

    if (cards?.length) {
      const cardsActivity = await this.buildActivityDocumentationCards(cards);
      await stepContext.context.sendActivity(cardsActivity);
    } else {
      await stepContext.context.sendActivity("**No documentation found**");
    }

    // We store the last search result so we can access the cards in the next
    // loop if the user clicks the "edit" or "delete" button.
    this.currentCardsResult = cards;

    return await stepContext.replaceDialog(listDocumentationDialogId);
  }

  private async endDialogStep(stepContext: WaterfallStepContext) {
    await stepContext.context.sendActivity("List action finished!");

    return await stepContext.endDialog();
  }
}

export default ListDocumentationDialog;
export {
  listDocumentationDialogId,
  listEditActionButtonName,
  listDeleteActionButtonName,
};
