import { Schema } from 'mongoose'
import { IMessage } from '../interfaces/IMessage'

export const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    timestamp: { type: Date, default: Date.now, required: true }
  },
  { timestamps: true }
)
