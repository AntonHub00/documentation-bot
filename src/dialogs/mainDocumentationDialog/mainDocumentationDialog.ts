import { StatePropertyAccessor, TurnContext } from "botbuilder-core";
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

import AddDocumentationDialog, {
  addDocumentationDialogId,
} from "../addDocumentationDialog/addDocumentationDialog";

const mainDocumentationDialogId = "mainDocumentationDialogId";
const choicePromptId = "choicePromptId";
const waterfallDialogId = "waterfallDialogId";

export default class MainDocumentationDialog extends ComponentDialog {
  private actions = { list: "List", add: "Add" };

  constructor() {
    super(mainDocumentationDialogId);

    this.addDialog(new ChoicePrompt(choicePromptId));

    this.addDialog(new ListDocumentationDialog());
    this.addDialog(new AddDocumentationDialog());

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
      choices: ChoiceFactory.toChoices(Object.values(this.actions)),
      prompt: "Please enter the documentation action.",
    });
  }

  private async initializeDocumentationActionDialog(
    stepContext: WaterfallStepContext
  ) {
    const selection = stepContext.result.value;

    if (selection === this.actions.list) {
      return await stepContext.beginDialog(listDocumentationDialogId);
    }

    if (selection === this.actions.add) {
      return await stepContext.beginDialog(addDocumentationDialogId);
    }

    return await stepContext.next();
  }

  private async summaryStep(stepContext: WaterfallStepContext) {
    await stepContext.context.sendActivity(
      "Type something to show the actions"
    );

    return await stepContext.endDialog();
  }
}
