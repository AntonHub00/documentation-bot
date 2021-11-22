import { BotFrameworkAdapter } from "botbuilder";
import { conversationState } from "../bots/documentationBot";

const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
});

adapter.onTurnError = async (context, error) => {
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  await context.sendActivity(
    "There was an error with the bot. We apologize for the inconvenience"
  );

  await conversationState.clear(context);
};

export default adapter;
