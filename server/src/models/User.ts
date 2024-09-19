import { Schema } from 'mongoose'
import { IUser } from '../interfaces/IUser'

export const userSchema = new Schema<IUser>(
  {
    authId: { type: String, required: true },
    username: { type: String, required: true },
    firstname: { type: String, default: null }, // Future implementation
    lastname: { type: String, default: null }, // Future implementation
    avatar: { type: String, default: null },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    pendingFriends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Notification'
      }
    ],
    newUser: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)
