import { HydratedDocument, Types } from 'mongoose'
import { Request } from 'express'
import { IUser } from '../interfaces'

/**
 * Interface for setting the owner and recipients of a new chat
 * on the request object.
 */
export interface CustomRequest extends Request {
  validatedUsers?: {
    owner: HydratedDocument<IUser>
    recipients: HydratedDocument<IUser>[]
  }
}

/**
 * Interface for shaping the body of the Request object to
 * allow for the addition of an ownerID and list of recipients.
 */
export interface body {
  ownerID: Types.ObjectId
  recipientsID: Types.ObjectId[]
}
