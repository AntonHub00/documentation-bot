import { Activity, CardFactory } from "botbuilder";
import {
  ComponentDialog,
  ConfirmPrompt,
  PromptOptions,
  WaterfallDialog,
  WaterfallStepContext,
} from "botbuilder-dialogs";
import documentationBotBackendServiceInstance from "../../../services/DocumentationBotBackendService";
import IBotDocumentationBackendService from "../../../services/IBotDocumentationBackendService";
import IDocumentationData from "../../shared/IDocumentationData";
import { buildTemplate } from "../../utils/templateBuilder";
import * as documentationCardWithoutEditAndDeleteActions from "./documentationCardWithoutEditAndDeleteActions.json";

const deleteDocumentationDialogId = "deleteDocumentationDialogId";
const confirmPromptId = "confirmPromptId";
const waterfallDialogId = "waterfallDialogId";
const deleteActionName = "deleteActionName";

class DeleteDocumentationDialog extends ComponentDialog {
  private backendServiceInstance: IBotDocumentationBackendService;

  constructor() {
    super(deleteDocumentationDialogId);

    this.backendServiceInstance = documentationBotBackendServiceInstance;

    this.addDialog(new ConfirmPrompt(confirmPromptId));

    this.addDialog(
      new WaterfallDialog(waterfallDialogId, [
        this.displayDocumentationToDeleteStep.bind(this),
        this.confirmDeletionStep.bind(this),
        this.endDialogStep.bind(this),
      ])
    );

    this.initialDialogId = waterfallDialogId;
  }

  private async displayDocumentationToDeleteStep(
    stepContext: WaterfallStepContext<IDocumentationData>
  ) {
    const activity: Partial<Activity> = {
      text: "This is the documentation to be deleted:",
      attachments: [
        CardFactory.adaptiveCard(
          buildTemplate(documentationCardWithoutEditAndDeleteActions, {
            name: stepContext.options.name,
            description: stepContext.options.description,
            link: stepContext.options.link,
          })
        ),
      ],
    };

    await stepContext.context.sendActivity(activity);

    return await stepContext.continueDialog();
  }

  private async confirmDeletionStep(stepContext: WaterfallStepContext) {
    const promptChoiceOptions: PromptOptions = {
      prompt:
        "Do you want to delete this documentation?. \n\n***This operation cannot be reverted***",
    };

    return await stepContext.prompt(confirmPromptId, promptChoiceOptions);
  }

  private async endDialogStep(
    stepContext: WaterfallStepContext<IDocumentationData>
  ) {
    const doDeleteDocumentation = stepContext.result;

    if (doDeleteDocumentation) {
      const documentationId = stepContext.options.id;

      await this.backendServiceInstance.delete(documentationId);

      await stepContext.context.sendActivity("Documentation **deleted**!");
    } else {
      await stepContext.context.sendActivity("Documentation **not deleted**");
    }

    await stepContext.context.sendActivity("Edit action finished!");

    return await stepContext.endDialog();
  }
}

export default DeleteDocumentationDialog;
export { deleteDocumentationDialogId, deleteActionName };
