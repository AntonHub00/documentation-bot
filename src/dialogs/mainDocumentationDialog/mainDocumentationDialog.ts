import {
  BotState,
  ConversationState,
  StatePropertyAccessor,
  TurnContext,
} from "botbuilder-core";
import {
  ChoiceFactory,
  ChoicePrompt,
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
  WaterfallStepContext,
} from "botbuilder-dialogs";

import ListDocumentationDialog, {
  listDocumentationDialogId,
} from "../listDocumentationDialog/listDocumentationDialog";

const mainDocumentationDialogId = "mainDocumentationDialogId";
const documentationDTOStateName = "documentationDTOStateName";
const choicePromptId = "choicePromptId";
const waterfallDialogId = "waterfallDialogId";

export default class MainDocumentationDialog extends ComponentDialog {
  private conversationState: BotState;

  constructor(conversationState: ConversationState) {
    super(mainDocumentationDialogId);

    this.conversationState = conversationState;

    this.addDialog(new ChoicePrompt(choicePromptId));

    this.addDialog(new ListDocumentationDialog());

    this.addDialog(
      new WaterfallDialog(waterfallDialogId, [
        this.crudStep.bind(this),
        this.initializeDocumentationActionDialog.bind(this),
        this.summaryStep.bind(this),
      ])
    );

    this.initialDialogId = waterfallDialogId;
  }

  public async run(turnContext: TurnContext, accessor: StatePropertyAccessor) {
    const dialogSet = new DialogSet(accessor);

    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);

    const result = await dialogContext.continueDialog();

    if (result.status === DialogTurnStatus.empty)
      await dialogContext.beginDialog(this.id);
  }

  private async crudStep(stepContext: WaterfallStepContext) {
    return await stepContext.prompt(choicePromptId, {
      choices: ChoiceFactory.toChoices(["List", "Add", "Edit", "Remove"]),
      prompt: "Please enter the documentation action.",
    });
  }

  private async initializeDocumentationActionDialog(
    stepContext: WaterfallStepContext
  ) {
    const selection = stepContext.result.value;

    if (selection === "List") {
      return await stepContext.beginDialog(listDocumentationDialogId);
    }

    return await stepContext.continueDialog();
  }

  private async summaryStep(stepContext: WaterfallStepContext) {
    const selection = stepContext.result;

    await stepContext.context.sendActivity(
      `Thanks. You have selected "${selection}"`
    );

    return await stepContext.endDialog();
  }
}
