import express, { NextFunction, Request, Response, Router } from 'express'
import { Chat, User } from '../models'
import { HydratedDocument } from 'mongoose'
import { IChat, IUser } from '../interfaces'

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
  // Validate that users are friends?
  // Validate that users don't already have a chat?
  // Create the chat
  // Set the owner
  // add the chat ID to the users
  try {
    // TODO: create an interface to shape this data?
    const { ownerID, recipientsID } = req.body

    const owner: HydratedDocument<IUser> | null = await User.findById(ownerID)

    // Throw error if no user with id of ownerID exists.
    if (!owner) {
      throw new Error(`No User with provided ID: ${ownerID}`)
    }

    // Check if the user has friends to start a chat with
    if (owner!.friends!.length < 1 && owner!.pendingFriends!.length < 1) {
      throw new Error(
        `No friends or pending friends for provided ownerID: ${ownerID}`
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
    console.log(err)
    next(err)
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

  for (let recipient of recipients) {
    if (!friendsOfOwner.has(recipient._id)) {
      return new Error(
        `Provided recipient is not a friend of provided owner: ${recipient._id}`
      )
    }
  }

  return null
}
