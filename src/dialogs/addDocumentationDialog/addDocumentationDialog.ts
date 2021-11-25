import { CardFactory, StatePropertyAccessor } from "botbuilder";
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
import IDocumentationData from "../shared/IDocumentationData";
import { buildTemplate } from "../utils/templateBuilder";

import * as addOrEditDocumentationCard from "../shared/addOrEditDocumentationCard.json";
import documentationBotBackendServiceInstance from "../../services/DocumentationBotBackendService";
import IBotDocumentationBackendService from "../../services/IBotDocumentationBackendService";

const addDocumentationDialogId = "addDocumentationDialogId";
const textPromptId = "textPromptId";
const choicePromptId = "choicePromptId";
const waterfallDialogId = "waterfallDialogId";
const addActionName = "addActionName";

class AddDocumentationDialog extends ComponentDialog {
  private conversationStateAccessor: StatePropertyAccessor<IDocumentationData>;
  private backendServiceInstance: IBotDocumentationBackendService;

  constructor() {
    super(addDocumentationDialogId);

    this.backendServiceInstance = documentationBotBackendServiceInstance;

    this.conversationStateAccessor = conversationState.createProperty(
      conversationStateAccessorName
    );

    this.addDialog(new TextPrompt(textPromptId));

    this.addDialog(new ChoicePrompt(choicePromptId));

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
      attachments: [
        CardFactory.adaptiveCard(
          buildTemplate(addOrEditDocumentationCard, {
            nameFieldValue: "",
            descriptionFieldValue: "",
            linkFieldValue: "",
            actionButtonName: "Add",
            actionName: addActionName,
          })
        ),
      ],
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

    if (!(name && description && link)) {
      await stepContext.context.sendActivity("Documentation data discarded!");
    } else {
      try {
        await this.backendServiceInstance.create({
          name,
          description,
          link,
        });

        await stepContext.context.sendActivity("Documentation data saved");
      } catch (error) {
        await stepContext.context.sendActivity(
          "**Documentation data could not be saved!. Try again.**"
        );
      }
    }

    this.conversationStateAccessor.set(stepContext.context, {
      id: "",
      name: "",
      description: "",
      link: "",
    });

    await stepContext.context.sendActivity("Add action finished!");

    return await stepContext.endDialog();
  }
}

export default AddDocumentationDialog;
export { addDocumentationDialogId, addActionName };
