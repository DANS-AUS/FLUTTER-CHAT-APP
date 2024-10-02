import request from 'supertest'
import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'
import app from '../../src/app'
import { serverConnect, serverDisconnect } from '../../db/testConfig'
import { Chat, Message, User } from '../../src/models'

jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: jest.fn(() => {
    return (req: Request, res: Response, next: NextFunction) => {
      next()
    }
  })
}))

// IDs for quick access.
const userOneID = new Types.ObjectId()
const userTwoID = new Types.ObjectId()
const userThreeID = new Types.ObjectId()
const userFourID = new Types.ObjectId()
const userFiveID = new Types.ObjectId()
const userSixID = new Types.ObjectId()
const chatID = new Types.ObjectId()
const messageOneID = new Types.ObjectId()

// Set up in-memory db before each test.
beforeAll(async () => {
  await serverConnect()

  // Create mock data in the db.
  /* USERS */
  await User.create(
    {
      _id: userOneID,
      authId: 'a1b2c3',
      username: 'test user one',
      friends: [userTwoID, userThreeID],
      chats: [chatID]
    },
    {
      _id: userTwoID,
      authId: 'd4e5f6',
      username: 'test user two',
      friends: [userOneID],
      chats: [chatID]
    },
    {
      _id: userThreeID,
      authId: 'g7h8i9',
      username: 'test user three',
      friends: [userOneID]
    },
    {
      _id: userFourID,
      authId: '1a2b3c',
      username: 'test user four'
    },
    {
      _id: userFiveID,
      authId: '4d5e6f',
      username: 'test user five',
      pendingFriends: [userSixID]
    },
    {
      _id: userSixID,
      authId: '7g8h9i',
      username: 'test user six',
      pendingFriends: [userFiveID]
    }
  )
  /* MESSAGES */
  await Message.create({
    _id: messageOneID,
    sender: userOneID,
    message: 'This is a test message!',
    chatId: chatID,
    timestamp: new Date()
  })
  /* CHAT */
  await Chat.create({
    _id: chatID,
    owner: userOneID,
    receivers: [userOneID, userTwoID],
    messages: [messageOneID]
  })
})

// Tear down in-memory db before each test.
afterAll(async () => {
  await serverDisconnect()
})

describe('Chat Routes', () => {
  describe('Successful Requests', () => {
    test('GET /id: should return a chat', async () => {
      const res = await request(app).get(`/api/v1/chats/${chatID}`)

      expect(res.status).toBe(200)
      expect(res.body.chat).toHaveProperty('owner', userOneID.toString())
      expect(res.body.chat.messages).toHaveLength(1)
    })

    // Summation:
    // User three creates a chat with user one who is a friend.
    // User one should have 2 chats in their active chat array:
    // 1) The mock chat created at setup
    // 2) The chat created in the test
    // User three should have 1 chat from this test
    test('POST should create a chat if users are already friends', async () => {
      const body = {
        ownerID: userThreeID,
        recipientsID: [userOneID]
      }

      const res = await request(app).post('/api/v1/chats').send(body)
      const newChatID = res.body.newChat._id

      expect(res.status).toBe(201)
      expect(res.body.newChat).toHaveProperty('owner', userThreeID.toString())

      // Users should have the chats added to their chats field.
      const owner = await User.findById(userThreeID)
      const recipient = await User.findById(userOneID)

      // Owner assertions. [userThreeID]
      expect(owner!.chats!.length).toBe(1)
      expect(owner!.chats!.map((chat) => chat._id.toString())).toEqual([
        newChatID
      ])
      expect(owner!.pendingChats!.length).toBe(0)
      // Recipient assertions. [userOneID]
      expect(recipient!.chats!.length).toBe(2)
      expect(recipient!.chats!.map((chat) => chat._id.toString())).toEqual([
        chatID.toString(),
        newChatID
      ])
      expect(recipient!.pendingChats!.length).toBe(0)
    })

    // Summation:
    // userSixID starts a chat with userFive and should have
    // one chat in the active chat as they are the owner.
    // userFiveID should have one chat in the pendingChats fields as the
    // two users are not friends yet.
    test('POST should create a chat if users are pending friends', async () => {
      const body = {
        ownerID: userSixID,
        recipientsID: [userFiveID]
      }

      const res = await request(app).post('/api/v1/chats').send(body)
      const newChatID = res.body.newChat._id

      expect(res.status).toBe(201)
      expect(res.body.newChat).toHaveProperty('owner', userSixID.toString())

      // TODO: Finish these assertions.
      // Users should have the chats added to their chats field.
      const owner = await User.findById(userSixID)
      const pendingRecipient = await User.findById(userFiveID)

      // Owner assertions. [userThreeID]
      expect(owner!.chats!.length).toBe(1)
      expect(owner!.chats!.map((chat) => chat._id.toString())).toEqual([
        newChatID
      ])
      expect(owner!.pendingChats!.length).toBe(0)
      // Pending recipient assertions. [userFiveID]
      expect(pendingRecipient!.pendingChats!.length).toBe(1)
      expect(
        pendingRecipient!.pendingChats!.map((chat) => chat._id.toString())
      ).toEqual([newChatID])
      expect(pendingRecipient!.chats!.length).toBe(0)
    })
  })

  describe('Error Requests', () => {
    test('POST should throw error when no user with provided owner id exists', async () => {
      const fakeUser = new Types.ObjectId()
      const body = {
        ownerID: fakeUser,
        recipientsID: [userOneID]
      }
      const res = await request(app).post('/api/v1/chats').send(body)

      expect(res.error).toBeInstanceOf(Error)
      expect(res.status).toBe(404)
      expect(res.body.error).toMatch(
        new RegExp(`no user with provided id: ${fakeUser.toString()}`, 'i')
      )
    })

    test('POST should throw error when user has no friends with which to start a chat', async () => {
      const body = {
        ownerID: userFourID,
        recipientsID: [userThreeID]
      }

      const res = await request(app).post('/api/v1/chats').send(body)

      expect(res.error).toBeInstanceOf(Error)
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(
        new RegExp(
          `no friends or pending friends for provided ownerID: ${userFourID.toString()}`,
          'i'
        )
      )
    })

    test('POST should throw and error when provided recipients are not friends with owner', async () => {
      const body = {
        ownerID: userTwoID,
        recipientsID: [userThreeID]
      }

      const res = await request(app).post('/api/v1/chats').send(body)

      expect(res.error).toBeInstanceOf(Error)
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(
        new RegExp(
          `provided recipient is not a friend of provided owner: ${userThreeID.toString()}`,
          'i'
        )
      )
    })
  })
})
