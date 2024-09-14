import { HydratedDocument } from 'mongoose'
import { serverConnect, serverDisconnect } from '../../db/testConfig'
import { IUser } from '../../src/interfaces'
import { User } from '../../src/models'

beforeAll(async () => {
  await serverConnect()
})

afterAll(async () => {
  await serverDisconnect()
})

describe('User model', () => {
  test('should create a user', async () => {
    const testUser: IUser = {
      authId: 'a1b2c3',
      username: 'testUser'
    }

    const newUser = await User.create(testUser)

    expect(newUser).toBeInstanceOf(User)
    expect(newUser).toMatchObject(testUser)
  })
})
