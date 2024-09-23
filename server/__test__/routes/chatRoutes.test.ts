import request from 'supertest'
import { NextFunction, Request, response, Response } from 'express'
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

const userOneID = new Types.ObjectId()
const userTwoID = new Types.ObjectId()
const chatID = new Types.ObjectId()
const messageOneID = new Types.ObjectId()

// Set up in-memory db before each test.
beforeAll(async () => {
  await serverConnect()
  // TODO:
  // Create 2 users
  await User.create(
    {
      _id: userOneID,
      authId: 'a1b2c3',
      username: 'test user one',
      chats: [chatID]
    },
    {
      _id: userTwoID,
      authId: 'd4e5f6',
      username: 'test user two',
      chats: [chatID]
    }
  )
  // Create messages in chat
  await Message.create({
    _id: messageOneID,
    sender: userOneID,
    message: 'This is a test message!',
    chatId: chatID,
    timestamp: new Date()
  })
  // Create chat
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
  test('test route', async () => {
    const res = await request(app).get('/api/v1/chats/hello')

    expect(res.status).toBe(200)
    expect(res.body.msg).toMatch(/world/i)
  })

  test('GET /id: should return a chat', async () => {
    const res = await request(app).get(`/api/v1/chats/${chatID}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('owner', userOneID.toString())
  })
})
