import express, { NextFunction, Request, Response, Router } from 'express'
import { Chat, User } from '../models'
import { HydratedDocument } from 'mongoose'
import { IChat } from '../interfaces'
import { validateUsersMiddleware } from '../middleware/validateUsersMiddleware'
import { ValidateFriendship } from '../utils/functions'
import { CustomError } from '../utils/classes'
import { CustomRequest } from '../utils/interfaces'

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
    // TODO: Implement the following:
    // [] Validate that users don't already have a chat?
    // [] Add the chat ID to the users
    try {
      const { owner, recipients } = req.validatedUsers!

      // Check if the user has friends to start a chat with
      if (owner!.friends!.length < 1 && owner!.pendingFriends!.length < 1) {
        throw new CustomError(
          `No friends or pending friends for provided ownerID: ${owner._id}`,
          400
        )
      }

      const { friends, pendingFriends } = ValidateFriendship(owner!, recipients)

      const newChat = await Chat.create({
        owner: owner._id,
        receivers: [...recipients]
      })

      // TODO: Assign the chat to all recipients.
      // Need to distinguish friends from pending friends.
      const friendsIDs = [owner._id, ...friends.map((friend) => friend._id)]
      const pendingFriendsIDs = pendingFriends.map(
        (pendingFriend) => pendingFriend._id
      )

      await User.updateMany(
        { _id: { $in: friendsIDs } },
        { $push: { chats: newChat._id } }
      )

      await User.updateMany(
        { _id: { $in: pendingFriendsIDs } },
        { $push: { pendingChats: newChat._id } }
      )

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
