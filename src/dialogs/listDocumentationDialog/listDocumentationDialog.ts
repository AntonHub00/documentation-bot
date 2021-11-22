import {
  ComponentDialog,
  PromptOptions,
  TextPrompt,
  WaterfallDialog,
  WaterfallStepContext,
} from "botbuilder-dialogs";

const listDocumentationDialogId = "listDocumentationDialogId";
const textPromptId = "textPromptId";
const waterfallDialogId = "waterfallDialogId";

class ListDocumentationDialog extends ComponentDialog {
  constructor() {
    super(listDocumentationDialogId);

    this.addDialog(new TextPrompt(textPromptId));

    this.addDialog(
      new WaterfallDialog(waterfallDialogId, [
        this.getDocumentationNameStep.bind(this),
        this.summaryStep.bind(this),
      ])
    );

    this.initialDialogId = waterfallDialogId;
  }

  private async getDocumentationNameStep(stepContext: WaterfallStepContext) {
    const promptOptions: PromptOptions = {
      prompt: "Enter the name of the documentation.",
    };

    return await stepContext.prompt(textPromptId, promptOptions);
  }

  private async summaryStep(stepContext: WaterfallStepContext) {
    const selection = stepContext.result;

    await stepContext.context.sendActivity(
      `You selected the project "${selection}"`
    );

    return await stepContext.endDialog(selection);
  }
}

export default ListDocumentationDialog;
export { listDocumentationDialogId };
