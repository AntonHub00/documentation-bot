import { ConversationState, MemoryStorage } from "botbuilder";

const memoryStorage = new MemoryStorage();

// Create conversation state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);

const conversationStateAccessorName = "conversationStateAccessorName";

export default conversationState;
export { conversationStateAccessorName };
