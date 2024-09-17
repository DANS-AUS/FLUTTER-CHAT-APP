import { Types } from 'mongoose'

export interface IMessage {
  sender: Types.ObjectId
  message: string
  chatId: Types.ObjectId
  timestamp?: Date
}
