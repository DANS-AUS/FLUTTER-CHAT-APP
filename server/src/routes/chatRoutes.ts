import express, { NextFunction, Request, Response, Router } from 'express'
import { Chat } from '../models'
import { HydratedDocument } from 'mongoose'
import { IChat } from '../interfaces'

const router: Router = express.Router()

router.get('/hello', (req: Request, res: Response) => {
  res.status(200).json({ msg: 'world' })
})

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
      res.json(chat)
    } catch (err) {
      next(err)
    }
  }
)

export default router
