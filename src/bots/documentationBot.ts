import {
  ActivityHandler,
  BotState,
  ConversationState,
  MemoryStorage,
  MessageFactory,
  StatePropertyAccessor,
  TurnContext,
} from "botbuilder";
import { Dialog } from "botbuilder-dialogs";
import DocumentationDTO from "../dialogs/documentationDTO";
import MainDocumentationDialog from "../dialogs/mainDocumentationDialog/mainDocumentationDialog";

const conversationStateAccessorName = "conversationStateAccessorName";

class DocumentationBot extends ActivityHandler {
  private restartToken = "restart";
  private dialog: Dialog;
  private conversationState: BotState;
  private conversationStateAccesor: StatePropertyAccessor<DocumentationDTO>;

  constructor(conversationState: BotState, dialog: Dialog) {
    super();

    this.dialog = dialog;
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

      await (this.dialog as MainDocumentationDialog).run(
        context,
        this.conversationStateAccesor
      );

      await next();
    });

    this.onTurn(async (context, next) => {
      await this.fillStateWithDataFromAddDocumentationAdaptiveCard(context);
      await next();
    });

    this.onMessage(async (context, next) => {
      const cancelText = "Restarting...";

      if (context.activity.text === this.restartToken) {
        await context.sendActivity(MessageFactory.text(cancelText, cancelText));
        await this.conversationStateAccesor.delete(context);
      }

      await (this.dialog as MainDocumentationDialog).run(
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
      const conversationState = await this.conversationStateAccesor.get(
        context
      );
      conversationState.name = value.name;
      conversationState.description = value.description;
      conversationState.link = value.link;
    }
  }
}

const memoryStorage = new MemoryStorage();

// Create conversation state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);

// Create the main dialog.
const dialog = new MainDocumentationDialog(conversationState);
const documentationBotInstance = new DocumentationBot(
  conversationState,
  dialog
);

export default documentationBotInstance;
export { DocumentationBot, conversationState, conversationStateAccessorName };
