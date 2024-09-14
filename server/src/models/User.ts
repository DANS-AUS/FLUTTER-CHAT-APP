import { IUser } from '../interfaces/IUser'
import { Schema } from 'mongoose'

export const userSchema = new Schema<IUser>(
  {
    authId: { type: String, required: true },
    username: { type: String, required: true },
    firstname: { type: String, default: null },
    lastname: { type: String, default: null },
    avatar: { type: String, default: null },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true
  }
)
