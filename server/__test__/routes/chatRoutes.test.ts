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

// Tear down up in-memory db before each test.
afterAll(async () => {
  await serverDisconnect()
})

describe('Chat Routes', () => {
  test('GET /id: should return a chat', async () => {
    const res = await request(app).get(`/api/v1/chats/${chatID}`)

    expect(res.status).toBe(200)
    expect(res.body.chat).toHaveProperty('owner', userOneID.toString())
    expect(res.body.chat.messages).toHaveLength(1)
  })

  test('POST should create a chat if users are already friends', async () => {
    const body = {
      ownerID: userThreeID,
      recipientsID: [userOneID] // recipient or to?
    }

    // User three creates a chat with user One
    const res = await request(app).post('/api/v1/chats').send(body)

    expect(res.status).toBe(201)
    expect(res.body.newChat).toHaveProperty('owner', userThreeID.toHexString())
  })

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
