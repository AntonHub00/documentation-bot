import {
  ActivityHandler,
  BotState,
  ConversationState,
  MemoryStorage,
  MessageFactory,
  StatePropertyAccessor,
} from "botbuilder";
import { Dialog, DialogState } from "botbuilder-dialogs";
import MainDocumentationDialog from "../dialogs/mainDocumentationDialog/mainDocumentationDialog";

const conversationStateAccessorName = "conversationStateAccessorName";

class DocumentationBot extends ActivityHandler {
  private cancelToken = "cancel";
  private dialog: Dialog;
  private conversationState: BotState;
  private conversationStateAccesor: StatePropertyAccessor<DialogState>;

  constructor(conversationState: BotState, dialog: Dialog) {
    super();

    this.dialog = dialog;
    this.conversationState = conversationState as ConversationState;
    this.conversationStateAccesor = this.conversationState.createProperty(
      conversationStateAccessorName
    );

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      const welcomeText = `Welcome to documentation bot! \n\n ***You can type "${this.cancelToken}" any time to reset the conversation***`;

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

    this.onMessage(async (context, next) => {
      const cancelText = "I'll cancel that";

      if (context.activity.text === this.cancelToken) {
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
