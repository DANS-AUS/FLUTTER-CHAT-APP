import { Request, Response, NextFunction } from 'express'
import { ValidateUser } from '../utils/functions'
import { CustomError } from '../utils/classes'
import { HydratedDocument, Types } from 'mongoose'
import { IUser } from '../interfaces'

interface CustomRequest extends Request {
  validatedUsers?: {
    owner: HydratedDocument<IUser>
    recipients: HydratedDocument<IUser>[]
  }
}

interface body {
  ownerID: Types.ObjectId
  recipientsID: Types.ObjectId[]
}

export const validateUsersMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { ownerID, recipientsID } = req.body as body
  const ids = [ownerID, ...recipientsID]
  try {
    const users = await ValidateUser(ids)
    req.validatedUsers = {
      owner: users[0],
      recipients: users.slice(1)
    }
    next()
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      next(err)
    }
  }
}
