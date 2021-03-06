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
} from "../../../states/state";
import IDocumentationData from "../../shared/IDocumentationData";
import { buildTemplate } from "../../utils/templateBuilder";

import * as addOrEditDocumentationCard from "../../shared/addOrEditDocumentationCard.json";
import IBotDocumentationBackendService from "../../../services/IBotDocumentationBackendService";
import documentationBotBackendServiceInstance from "../../../services/DocumentationBotBackendService";

const editDocumentationDialogId = "addDocumentationDialogId";
const textPromptId = "textPromptId";
const choicePromptId = "choicePromptId";
const waterfallDialogId = "waterfallDialogId";
const editActionName = "editActionName";

class EditDocumentationDialog extends ComponentDialog {
  private conversationStateAccessor: StatePropertyAccessor<IDocumentationData>;
  private backendServiceInstance: IBotDocumentationBackendService;

  constructor() {
    super(editDocumentationDialogId);

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
    stepContext: WaterfallStepContext<IDocumentationData>
  ) {
    const activity: Partial<Activity> = {
      text: "Edit the form to modify the documentation resource:",
      attachments: [
        CardFactory.adaptiveCard(
          buildTemplate(addOrEditDocumentationCard, {
            id: stepContext.options.id,
            nameFieldValue: stepContext.options.name,
            descriptionFieldValue: stepContext.options.description,
            linkFieldValue: stepContext.options.link,
            actionButtonName: "Edit",
            actionName: editActionName,
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
        "Did you already modified the form values and send it?. \n\n***If the form is not filled correctly or not sent, it'll be discarded***",
    };

    return await stepContext.prompt(choicePromptId, promptChoiceOptions);
  }

  private async endDialogStep(stepContext: WaterfallStepContext) {
    const currentConversationState = await this.conversationStateAccessor.get(
      stepContext.context
    );

    const id = currentConversationState.id;
    const name = currentConversationState.name;
    const description = currentConversationState.description;
    const link = currentConversationState.link;

    if (!(id && name && description && link)) {
      await stepContext.context.sendActivity("Documentation data discarded!");
    } else {
      await this.backendServiceInstance.update({ id, name, description, link });
      await stepContext.context.sendActivity("Documentation data saved");
    }

    this.conversationStateAccessor.set(stepContext.context, {
      id: undefined,
      name: "",
      description: "",
      link: "",
    });

    await stepContext.context.sendActivity("Edit action finished!");

    return await stepContext.endDialog();
  }
}

export default EditDocumentationDialog;
export { editDocumentationDialogId, editActionName };
