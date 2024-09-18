import { Types } from 'mongoose'

// TODO: Edit the timestamp?
export interface IMessage {
  sender: Types.ObjectId
  message: string
  chatId: Types.ObjectId
  timestamp?: Date
}
