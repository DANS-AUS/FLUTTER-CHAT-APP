import { Types } from 'mongoose'

// TODO: Edit the following fields:
// [ ] Add:
// [X] pendingFriends: Types.ObjectId
// [X] notifications: Types.ObjectId
// [X] newUser: Bool (default true)
export interface IUser {
  authId: string
  username?: string
  firstname?: string
  lastname?: string
  avatar?: string
  friends?: Types.ObjectId[]
  pendingFriends?: Types.ObjectId[]
  notifications?: Types.ObjectId[]
  newUser?: boolean
}
