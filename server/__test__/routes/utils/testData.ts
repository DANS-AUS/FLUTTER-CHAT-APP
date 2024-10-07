import { Types } from "mongoose";
import { Chat, Message, User } from "../../../src/models";

export const testIDs = {
  users: {
    userOneID: new Types.ObjectId(),
    userTwoID: new Types.ObjectId(),
    userThreeID: new Types.ObjectId(),
    userFourID: new Types.ObjectId(),
  },
  chats: {
    chatOneID: new Types.ObjectId(),
    chatTwoID: new Types.ObjectId(),
  },
  messages: {
    messageOneID: new Types.ObjectId(),
    messageTwoID: new Types.ObjectId(),
    messageThreeID: new Types.ObjectId(),
    messageFourID: new Types.ObjectId(),
  },
  notification: {
    notificationOneID: new Types.ObjectId(),
  }
};

export const createTestData = async () => {
  await createUsers();
  await createMessages();
  await createChats();
};

const createUsers = async () => {
  await User.create(
    {
      _id: testIDs.users.userOneID,
      authId: "pjf564",
      username: "test user one",
      chats: [testIDs.chats.chatOneID, testIDs.chats.chatTwoID],
    }, 
    {
      _id: testIDs.users.userTwoID,
      authId: "gjl454",
      username: "test user two",
    }, 
    {
      _id: testIDs.users.userThreeID,
      authId: "tdk453",
      username: "test user three",
    }, 
    {
      _id: testIDs.users.userFourID,
      authId: "s0493h",
      username: "test user four",
    }, 

  );
};

const createMessages = async () => {
  await Message.create(
    {
        _id: testIDs.messages.messageOneID,
        sender: testIDs.users.userOneID,
        message: "Test message one!",
        chatId: testIDs.chats.chatOneID,
        // Sept 19th 3:24 am 
        timestamp: new Date('2024-09-19T08:24:00.000Z')
    },
    {
        _id: testIDs.messages.messageTwoID,
        sender: testIDs.users.userOneID,
        message: "Test message two!",
        chatId: testIDs.chats.chatOneID,
        // Sept 19th 9am 
        timestamp: new Date('2024-09-19T14:00:00.000Z')
    }, 
    {
        _id: testIDs.messages.messageThreeID,
        sender: testIDs.users.userOneID,
        message: "Test message three!",
        chatId: testIDs.chats.chatTwoID,
        // Sept 20th
        timestamp: new Date('2024-09-20T08:24:00.000Z'),
      }, 
      {
        _id: testIDs.messages.messageFourID,
        sender: testIDs.users.userOneID,
        message: "Test message four!",
        chatId: testIDs.chats.chatTwoID,
        // Sept 21th
        timestamp: new Date('2024-09-21T08:24:00.000Z'),
      }
  );
};
const createChats = async () => {
    await Chat.create(
        {
            _id: testIDs.chats.chatOneID, 
            owner: testIDs.users.userOneID,
            messages: [testIDs.messages.messageOneID, testIDs.messages.messageTwoID]
        }, 
        {
            _id: testIDs.chats.chatTwoID,
            owner: testIDs.users.userOneID,
            messages: [testIDs.messages.messageThreeID, testIDs.messages.messageFourID]
        },
    )
};
