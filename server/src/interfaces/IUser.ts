import { Types } from 'mongoose'

// TODO: Edit the following fields:
// [ ] Remove:
// [ ] firstname
// [ ] lastname
// [ ] Add:
// [ ] pendingFriends: Types.ObjectId
// [ ] notifications: Types.ObjectId
// [ ] newUser: Bool (default true)
export interface IUser {
  authId: string
  username?: string
  firstname?: string
  lastname?: string
  avatar?: string
  friends?: Types.ObjectId[]
}
