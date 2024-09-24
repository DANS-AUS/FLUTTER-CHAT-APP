import express, { NextFunction, Request, Response, Router } from 'express'
import { Chat, User } from '../models'
import { HydratedDocument } from 'mongoose'
import { IChat, IUser } from '../interfaces'

// TODO: Extract this to its own file.
class CustomError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message)
  }
}

const router: Router = express.Router()

router.get(
  '/:chatId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params
      const chat: HydratedDocument<IChat> | null = await Chat.findById(
        chatId
      ).populate('messages')

      if (!chat) {
        return res.status(401).json({ msg: `No chat with id: ${chatId}` })
      }
      res.json({ chat })
    } catch (err) {
      next(err)
    }
  }
)

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  // [X] Validate that users are friends?
  // [] Validate that users don't already have a chat?
  // [X] Create the chat
  // [X] Set the owner
  // [] Add the chat ID to the users
  try {
    // TODO: create an interface to shape this data?
    const { ownerID, recipientsID } = req.body

    // TODO: Convert to middleware. CreateChatMiddleware
    // Create UTIL function called ValidateUser to ensure that the user exists.
    // Call this in the middleware.
    const owner: HydratedDocument<IUser> | null = await User.findById(ownerID)
    // Throw error if no user with id of ownerID exists.
    if (!owner) {
      throw new CustomError(`No User with provided ID: ${ownerID}`, 404)
    }
    // Check if the user has friends to start a chat with
    if (owner!.friends!.length < 1 && owner!.pendingFriends!.length < 1) {
      throw new CustomError(
        `No friends or pending friends for provided ownerID: ${ownerID}`,
        400
      )
    }

    let recipients: HydratedDocument<IUser>[] = []

    for (const id of recipientsID) {
      const user: HydratedDocument<IUser> | null = await User.findById(id)
      if (user) {
        recipients.push(user)
      }
      // TODO: Handle user not existing in the DB.
    }

    // TODO: Need to separate logic into if users are
    // - [ ] Friends
    // - [ ] Pending Friends
    ValidateFriendship(owner, recipients)

    const newChat = await Chat.create({
      owner: ownerID,
      receivers: [...recipients]
    })

    res.status(201).json({ newChat })
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      next(err)
    }
  }
})

export default router

// TODO: Move this to a UTIL file.
/**
 *  @desc Function to validate that the provided owner of a new chat is in fact friends
 *  with the users provided.
 */
const ValidateFriendship = (
  owner: HydratedDocument<IUser>,
  recipients: HydratedDocument<IUser>[]
): Error | null => {
  let friendsOfOwner = new Set(owner.friends!)

  // TODO: Add validation to check the users pending friends.
  for (let recipient of recipients) {
    if (!friendsOfOwner.has(recipient._id)) {
      return new Error(
        `Provided recipient is not a friend of provided owner: ${recipient._id}`
      )
    }
  }

  return null
}
