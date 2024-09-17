import { Schema } from 'mongoose'
import { IChat } from '../interfaces'

export const chatSchema = new Schema<IChat>(
  {
    chatName: { type: String, default: null },
    chatAvatar: { type: String, default: null },
    receivers: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
  },
  { timestamps: true }
)
