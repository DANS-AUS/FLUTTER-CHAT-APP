import { HydratedDocument, Types } from 'mongoose'
import { serverConnect, serverDisconnect } from '../../db/testConfig'
import { IUser, IChat, IMessage, INotification } from '../../src/interfaces'
import { User, Chat, Message, Notification } from '../../src/models'

beforeAll(async () => {
  await serverConnect()
})

afterAll(async () => {
  await serverDisconnect()
})

const userOneID = new Types.ObjectId()
const userTwoID = new Types.ObjectId()
const newChatId = new Types.ObjectId()

const testUserOne: IUser = {
  authId: 'a1b2c3',
  username: 'testUserOne'
}

const testUserTwo: IUser = {
  authId: 'd4e5f6',
  username: 'testUserTwo'
}

describe('User model', () => {
  test('should create a user', async () => {
    const [newUserOne, newUserTwo]: HydratedDocument<IUser>[] =
      await User.create([
        { _id: userOneID, ...testUserOne },
        { _id: userTwoID, ...testUserTwo }
      ])

    expect(newUserOne).toBeInstanceOf(User)
    expect(newUserOne).toMatchObject(testUserOne)

    expect(newUserTwo).toBeInstanceOf(User)
    expect(newUserTwo).toMatchObject(testUserTwo)
  })

  test('should be able to have friends', async () => {
    // TODO: Create a helper function for this in the API
    await User.findByIdAndUpdate(userOneID, {
      $push: { friends: userTwoID }
    })
    await User.findByIdAndUpdate(userTwoID, {
      $push: { friends: userOneID }
    })

    // Find the user with the updated friend object id but no addition
    // user info for the assertions.
    const userOneWithFriendId = await User.findById(userOneID)
    const userTwoWithFriendId = await User.findById(userTwoID)

    const userOneWithFriendDetails = await User.findById(userOneID).populate(
      'friends'
    )
    const userTwoWithFriendDetails = await User.findById(userTwoID).populate(
      'friends'
    )

    expect(userOneWithFriendDetails?.friends?.length).toBe(1)
    expect(userOneWithFriendDetails?.friends).toMatchObject([
      userTwoWithFriendId
    ])

    expect(userTwoWithFriendDetails?.friends?.length).toBe(1)
    expect(userTwoWithFriendDetails?.friends).toMatchObject([
      userOneWithFriendId
    ])
  })
})

describe('Chat model', () => {
  test('should create a chat', async () => {
    const newChat: HydratedDocument<IChat> = await Chat.create({
      _id: newChatId,
      receivers: [userOneID, userTwoID]
    })

    expect(newChat).toBeInstanceOf(Chat)
    expect(newChat.receivers).toMatchObject([userOneID, userTwoID])
  })

  test('should allow for addition of chat name', async () => {
    const chatWithoutName = await Chat.findByIdAndUpdate(newChatId, {
      chatName: 'test chat'
    })

    const chatWithName = await Chat.findById(chatWithoutName?._id)
    expect(chatWithName).toHaveProperty('chatName', 'test chat')
  })
})

describe('Message model', () => {
  test('should create a message in a chat', async () => {
    const messageInterface: IMessage = {
      sender: userOneID,
      message: 'This is a test message!',
      chatId: newChatId
    }

    const newMessage: HydratedDocument<IMessage> = await Message.create(
      messageInterface
    )

    const chatToUpdate = await Chat.findByIdAndUpdate(newChatId, {
      $push: { messages: newMessage._id }
    })

    const chatWithMessage = await Chat.findById(chatToUpdate?._id).populate(
      'messages'
    )

    expect(newMessage).toHaveProperty('sender', userOneID)
    expect(chatWithMessage?.messages.length).toBe(1)
  })
})

describe('Notification model', () => {
  test('should create a notification', async () => {
    const notificationInterface: INotification = {
      title: 'this is a test notification',
      notificationType: 1,
      to: userOneID,
      from: userTwoID,
      resolved: false
    }

    const newNotification: HydratedDocument<INotification> =
      await Notification.create(notificationInterface)

    expect(newNotification).toBeInstanceOf(Notification)
    expect(newNotification).toMatchObject(notificationInterface)
  })
  // TODO: Implement this test
  // test('should push a notification to the specified user', async() => {})
})
