import request from 'supertest'
import app from '../../src/app'
import { NextFunction, Request, Response } from 'express'

jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: jest.fn(() => {
    return (req: Request, res: Response, next: NextFunction) => {
      next()
    }
  })
}))

describe('Chat Routes', () => {
  test('test route', async () => {
    const res = await request(app).get('/api/v1/chats/hello')

    expect(res.status).toBe(200)
    expect(res.body.msg).toMatch(/world/i)
  })
})
