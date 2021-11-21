import {
  ActivityHandler,
  BotState,
  ConversationState,
  MessageFactory,
  StatePropertyAccessor,
  UserState,
} from "botbuilder";
import { Dialog, DialogState } from "botbuilder-dialogs";
import AddDocumentationDialog from "../dialogs/addDocumentationDialog/addDocumentationDialog";

export default class Bot extends ActivityHandler {
  private cancelToken = "cancel";
  private dialog: Dialog;
  private dialogState: StatePropertyAccessor<DialogState>;
  private conversationState: BotState;
  private userState: BotState;

  constructor(
    conversationState: BotState,
    userState: BotState,
    dialog: Dialog
  ) {
    super();

    this.dialog = dialog;
    this.conversationState = conversationState as ConversationState;
    this.userState = userState as UserState;
    this.dialogState = this.conversationState.createProperty("DialogState");

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

      await (this.dialog as AddDocumentationDialog).run(
        context,
        this.dialogState
      );

      await next();
    });

    this.onMessage(async (context, next) => {
      const cancelText = "I'll cancel that";

      if (context.activity.text === this.cancelToken) {
        await context.sendActivity(MessageFactory.text(cancelText, cancelText));
        await this.dialogState.delete(context);
      }

      await (this.dialog as AddDocumentationDialog).run(
        context,
        this.dialogState
      );

      await next();
    });

    this.onDialog(async (context, next) => {
      // Save any state changes. The load happened during the execution of the Dialog.
      await this.conversationState.saveChanges(context, false);
      await this.userState.saveChanges(context, false);
      await next();
    });
  }
}
