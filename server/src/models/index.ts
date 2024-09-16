import { model } from 'mongoose'
import { userSchema } from '../models/User'
import { IUser } from '../interfaces'

export const User = model<IUser>('User', userSchema)
