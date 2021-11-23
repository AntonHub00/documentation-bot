import {
  ActivityHandler,
  BotState,
  ConversationState,
  MessageFactory,
  StatePropertyAccessor,
  TurnContext,
} from "botbuilder";
import { Dialog } from "botbuilder-dialogs";
import IDocumentationData from "../dialogs/shared/IDocumentationData";
import MainDocumentationDialog from "../dialogs/mainDocumentationDialog/mainDocumentationDialog";
import conversationState, {
  conversationStateAccessorName,
} from "../states/state";

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
      await this.fillStateWithDataFromAddDocumentationAdaptiveCard(context);
      await next();
    });

    this.onMessage(async (context, next) => {
      if (context.activity.text === this.restartToken) {
        await context.sendActivity(MessageFactory.text("Restarting..."));
        await this.conversationStateAccesor.delete(context);
      }

      await (this.mainDialog as MainDocumentationDialog).run(
        context,
        this.conversationStateAccesor
      );

      await next();
    });

    this.onDialog(async (context, next) => {
      // Save any state changes. The load happened during the execution of the Dialog.
      await this.conversationState.saveChanges(context, false);
      await next();
    });
  }

  private async fillStateWithDataFromAddDocumentationAdaptiveCard(
    context: TurnContext
  ) {
    const value = context.activity.value;

    // If true it means that the user sent info from the "add documentation"
    // adaptive card
    if (value && "name" in value && "description" in value && "link" in value) {
      const currentConversationState = await this.conversationStateAccesor.get(
        context
      );
      currentConversationState.name = value.name;
      currentConversationState.description = value.description;
      currentConversationState.link = value.link;
    }
  }
}
