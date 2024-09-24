import { Types } from 'mongoose'

export interface IChat {
  owner: Types.ObjectId
  chatName?: string
  chatAvatar?: string
  receivers: Types.ObjectId[]
  messages: Types.ObjectId[]
}
