import { model } from 'mongoose'
import { userSchema } from './User'
import { chatSchema } from './Chat'
import { messageSchema } from './Message'
import { IUser, IChat, IMessage } from '../interfaces'

export const User = model<IUser>('User', userSchema)
export const Chat = model<IChat>('Chat', chatSchema)
export const Message = model<IMessage>('Message', messageSchema)
