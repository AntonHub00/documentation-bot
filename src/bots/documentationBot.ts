import {
  ActivityHandler,
  ActivityTypes,
  BotState,
  ConversationState,
  MessageFactory,
  StatePropertyAccessor,
  TurnContext,
} from "botbuilder";
import { Dialog, runDialog } from "botbuilder-dialogs";
import IDocumentationData from "../dialogs/shared/IDocumentationData";
import MainDocumentationDialog from "../dialogs/mainDocumentationDialog/mainDocumentationDialog";
import conversationState, {
  conversationStateAccessorName,
} from "../states/state";
import { addActionName } from "../dialogs/addDocumentationDialog/addDocumentationDialog";
import { editActionName } from "../dialogs/listDocumentationDialog/editDocumentationDialog/editDocumentationDialog";
import {
  listDeleteActionButtonName,
  listEditActionButtonName,
} from "../dialogs/listDocumentationDialog/listDocumentationDialog";

export default class DocumentationBot extends ActivityHandler {
  private restartToken = "restart";
  private mainDialog: Dialog;
  private conversationState: BotState;
  private conversationStateAccesor: StatePropertyAccessor<IDocumentationData>;

  constructor() {
    super();

    this.mainDialog = new MainDocumentationDialog();
    this.conversationState = conversationState as ConversationState;
    this.conversationStateAccesor = this.conversationState.createProperty(
      conversationStateAccessorName
    );

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      const welcomeText = `Welcome to documentation bot! \n\n ***You can type "${this.restartToken}" anytime to restart the conversation***`;

      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity(
            MessageFactory.text(welcomeText, welcomeText)
          );
        }
      }

      await context.sendActivity("Type something to show the actions");

      await next();
    });

    this.onTurn(async (context, next) => {
      if (context.activity.type !== ActivityTypes.ConversationUpdate) {
        if (context.activity.type === ActivityTypes.Message) {
          if (context.activity.text === this.restartToken) {
            await context.sendActivity(MessageFactory.text("Restarting..."));
            await this.conversationStateAccesor.delete(context);
          } else {
            await this.validateToOpenEditOrDeleteDialog(context);
            await this.fillStateWithDataFromAllowedAdaptiveCards(context);
          }
        }

        await runDialog(
          this.mainDialog,
          context,
          this.conversationState.createProperty(conversationStateAccessorName)
        );
      }

      await next();
    });
  }

  async run(context: TurnContext) {
    await super.run(context);

    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
  }

  // The "edit" and "delete" actions in the list dialog adaptive card will sent
  // some data when clicked. We need to capture that "event" and sent a text to
  // identify wich button was clicked. The text is required to be sent since the
  // adaptive card is displayed in a loop with a text prompt. Because of that,
  // we set the text simulating user input so that the text promt receives the
  // text and then we can test if an action button was clicked and wich one.
  private async validateToOpenEditOrDeleteDialog(context: TurnContext) {
    const value = context.activity.value;

    if (value?.actionName == listEditActionButtonName)
      context.activity.text = listEditActionButtonName;

    if (value?.actionName == listDeleteActionButtonName)
      context.activity.text = listDeleteActionButtonName;
  }

  // If the user sent the form in the edit/add adaptive card, that "event" will
  // be catched here. The data sent in the form need to be store in the state so
  // it can be retrieved later in other waterfall dialog steps (due to dialogs
  // limitations). Both the "add" and "edit" adaptive card/dialog will share
  // state since both handle the same data and types and both can't be executed
  // at the same time, so it shouldn't be problem to do it this way.
  private async fillStateWithDataFromAllowedAdaptiveCards(
    context: TurnContext
  ) {
    const value = context.activity.value;

    // Only continue if the user sent info from the allowed adaptive cards
    const cameFromAddCard = value?.actionName === addActionName;
    const cameFromEditCard = value?.actionName === editActionName;

    if (!(cameFromAddCard || cameFromEditCard)) return;

    if (value?.name && value?.description && value?.link) {
      const currentConversationState = await this.conversationStateAccesor.get(
        context
      );
      currentConversationState.id = value?.id;
      currentConversationState.name = value.name;
      currentConversationState.description = value.description;
      currentConversationState.link = value.link;
    }
  }
}
