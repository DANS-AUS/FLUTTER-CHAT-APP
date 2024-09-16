import { HydratedDocument, Types } from 'mongoose'
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
  const userOneID = new Types.ObjectId()
  const userTwoID = new Types.ObjectId()

  const testUserOne: IUser = {
    authId: 'a1b2c3',
    username: 'testUserOne'
  }

  const testUserTwo: IUser = {
    authId: 'd4e5f6',
    username: 'testUserTwo'
  }
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
