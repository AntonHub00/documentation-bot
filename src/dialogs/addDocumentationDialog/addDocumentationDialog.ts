import {
  CardFactory,
  ConversationState,
  StatePropertyAccessor,
} from "botbuilder";
import {
  ChoicePrompt,
  ComponentDialog,
  PromptOptions,
  TextPrompt,
  WaterfallDialog,
  WaterfallStepContext,
} from "botbuilder-dialogs";
import { Activity } from "botframework-schema";
import conversationState, {
  conversationStateAccessorName,
} from "../../states/state";
import DocumentationDTO from "../documentationDTO";

import * as addDocumentationCard from "./addDocumentationCard.json";

const addDocumentationDialogId = "addDocumentationDialogId";
const textPromptId = "textPromptId";
const choicePromptId = "choicePromptId";
const waterfallDialogId = "waterfallDialogId";

class AddDocumentationDialog extends ComponentDialog {
  private conversationStateAccessor: StatePropertyAccessor<DocumentationDTO>;

  constructor() {
    super(addDocumentationDialogId);

    this.conversationStateAccessor = conversationState.createProperty(
      conversationStateAccessorName
    );

    this.addDialog(new TextPrompt(textPromptId));

    this.addDialog(new ChoicePrompt(textPromptId));

    this.addDialog(
      new WaterfallDialog(waterfallDialogId, [
        this.displayDocumentationFormStep.bind(this),
        this.confirmCompletedFormStep.bind(this),
        this.endDialogStep.bind(this),
      ])
    );

    this.initialDialogId = waterfallDialogId;
  }

  private async displayDocumentationFormStep(
    stepContext: WaterfallStepContext
  ) {
    const activity: Partial<Activity> = {
      text: "Fill the form to add the documentation resource:",
      attachments: [CardFactory.adaptiveCard(addDocumentationCard)],
    };

    await stepContext.context.sendActivity(activity);

    return await stepContext.continueDialog();
  }

  private async confirmCompletedFormStep(stepContext: WaterfallStepContext) {
    const promptChoiceOptions: PromptOptions = {
      choices: ["Continue"],
      prompt:
        "Did you already fill the form and send it?. \n\n***If the form is not filled correctly or not sent, it'll be discarded***",
    };

    return await stepContext.prompt(choicePromptId, promptChoiceOptions);
  }

  private async endDialogStep(stepContext: WaterfallStepContext) {
    const currentConversationState = await this.conversationStateAccessor.get(
      stepContext.context
    );

    const name = currentConversationState.name;
    const description = currentConversationState.description;
    const link = currentConversationState.link;

    if (
      !(
        "name" in currentConversationState &&
        "description" in currentConversationState &&
        "link" in currentConversationState
      )
    ) {
      await stepContext.context.sendActivity("Documentation data discarded!");
    } else {
      // NOTE: Perform some save logic for the given search token.
      await stepContext.context.sendActivity("Documentation data saved");
    }

    await stepContext.context.sendActivity("Add action finished!");

    await this.conversationStateAccessor.delete(stepContext.context);

    return await stepContext.endDialog();
  }
}

export default AddDocumentationDialog;
export { addDocumentationDialogId };
