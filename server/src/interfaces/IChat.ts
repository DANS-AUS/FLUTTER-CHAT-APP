import { Types } from 'mongoose'

export interface IChat {
  chatName?: string
  chatAvatar?: string
  receivers: Types.ObjectId[]
  messages: Types.ObjectId[]
}
