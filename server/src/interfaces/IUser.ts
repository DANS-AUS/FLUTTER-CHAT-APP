import { Types } from 'mongoose'

export interface IUser {
  authId: string
  username?: string
  firstname?: string
  lastname?: string
  avatar?: string
  friends?: Types.ObjectId[]
}
