import { Types } from 'mongoose'

export interface IUser {
  authId: string
  username?: string
  firstname?: string
  lastname?: string
  avatar?: string
  friends?: Types.ObjectId[]
  pendingFriends?: Types.ObjectId[]
  chats?: Types.ObjectId[]
  pendingChats?: Types.ObjectId[]
  notifications?: Types.ObjectId[]
  newUser?: boolean
}
