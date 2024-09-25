import express, { NextFunction, Request, Response, Router } from 'express'
import { Chat, User } from '../models'
import { HydratedDocument } from 'mongoose'
import { IChat, IUser } from '../interfaces'
import { validateUsersMiddleware } from '../middleware/validateUsersMiddleware'
import { ValidateFriendship } from '../utils/functions'
import { CustomError } from '../utils/classes'

interface CustomRequest extends Request {
  validatedUsers?: {
    owner: HydratedDocument<IUser>
    recipients: HydratedDocument<IUser>[]
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

router.post(
  '/',
  validateUsersMiddleware,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // [X] Validate that users are friends?
    // [] Validate that users don't already have a chat?
    // [X] Create the chat
    // [X] Set the owner
    // [] Add the chat ID to the users
    try {
      // TODO: create an interface to shape this data?
      const { owner, recipients } = req.validatedUsers!

      // // TODO: Convert to middleware. CreateChatMiddleware
      // // Create UTIL function called ValidateUser to ensure that the user exists.
      // // Call this in the middleware.
      // const owner: HydratedDocument<IUser> | null = await User.findById(ownerID)
      // // Throw error if no user with id of ownerID exists.
      // if (!owner) {
      //   throw new CustomError(`No User with provided ID: ${ownerID}`, 404)
      // }
      // Check if the user has friends to start a chat with
      if (owner!.friends!.length < 1 && owner!.pendingFriends!.length < 1) {
        throw new CustomError(
          `No friends or pending friends for provided ownerID: ${owner._id}`,
          400
        )
      }

      // let recipients: HydratedDocument<IUser>[] = []

      // for (const id of recipientsID) {
      //   const user: HydratedDocument<IUser> | null = await User.findById(id)
      //   if (user) {
      //     recipients.push(user)
      //   }
      //   // TODO: Handle user not existing in the DB.
      // }

      // TODO: Need to separate logic into if users are
      // - [ ] Friends
      // - [ ] Pending Friends

      // TODO: Erroring here!
      // Test to create is failing incorrectly checking the users friends.
      ValidateFriendship(owner!, recipients)

      const newChat = await Chat.create({
        owner: owner._id,
        receivers: [...recipients]
      })

      res.status(201).json({ newChat })
    } catch (err) {
      // console.log(err)
      if (err instanceof CustomError) {
        res.status(err.statusCode).json({ error: err.message })
      } else {
        next(err)
      }
    }
  }
)

export default router
