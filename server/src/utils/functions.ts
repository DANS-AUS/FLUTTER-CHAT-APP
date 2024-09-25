import { HydratedDocument, Types } from 'mongoose'
import { User } from '../models'
import { IUser } from '../interfaces'
import { CustomError } from './classes'

/**
 * Use to validate that each user in a given array
 * exists in the database.
 *
 */
export const ValidateUser = async (ids: Types.ObjectId[]) => {
  // TODO: Need to figure out best way to validate users AND pass them
  // to the controller.
  let users: HydratedDocument<IUser>[] = []

  for (let id of ids) {
    const user: HydratedDocument<IUser> | null = await User.findById(id)
    if (!user) {
      throw new CustomError(`No user with provided id: ${id}`, 404)
    }

    users.push(user)
  }
  return users
}

/**
 *  Use to validate that the provided owner of a new chat is in fact friends
 *  with the users provided.
 */
export const ValidateFriendship = (
  owner: HydratedDocument<IUser>,
  recipients: HydratedDocument<IUser>[]
) => {
  let idsToString = owner.friends!.map((friend) => friend.toString())
  let friendsOfOwner = new Set(idsToString)

  // TODO: Add validation to check the users pending friends.
  for (let recipient of recipients) {
    if (!friendsOfOwner.has(recipient._id.toString())) {
      throw new Error(
        `Provided recipient is not a friend of provided owner: ${recipient._id}`
      )
    }
  }
}
