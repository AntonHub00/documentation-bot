import { StatePropertyAccessor, TurnContext, UserState } from "botbuilder-core";
import {
  ChoiceFactory,
  ChoicePrompt,
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
  WaterfallStepContext,
} from "botbuilder-dialogs";
import DocumentationDTO from "../documentationDTO";

const documentationDTOStateName = "documentationDTOStateName";
const choicePromptId = "choicePromptId";
const waterfallDialogId = "waterfallDialogId";

export default class AddDocumentationDialog extends ComponentDialog {
  private documentationDTO: StatePropertyAccessor<DocumentationDTO>;

  constructor(userState: UserState) {
    super("documentationDialog");

    this.documentationDTO = userState.createProperty(documentationDTOStateName);

    this.addDialog(new ChoicePrompt(choicePromptId));

    this.addDialog(
      new WaterfallDialog(waterfallDialogId, [
        this.crudStep.bind(this),
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

  private async summaryStep(
    stepContext: WaterfallStepContext<DocumentationDTO>
  ) {
    const selection = stepContext.result.value;

    await stepContext.context.sendActivity(
      `Thanks. You have selected "${selection}"`
    );

    return await stepContext.endDialog();
  }
}
