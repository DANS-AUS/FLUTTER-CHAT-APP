import { HydratedDocument, Types } from 'mongoose'
import { User } from '../models'
import { IUser } from '../interfaces'
import { CustomError } from './classes'

/**
 * Use to validate that each user in a given array
 * exists in the database.
 *
 * @param Types.ObjectId[]
 */
export const ValidateUser = async (ids: Types.ObjectId[]) => {
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

// export interface ValidatedFriends {
//   friends: HydratedDocument<IUser>[]
//   pendingFriends: HydratedDocument<IUser>[]
// }

/**
 *  Use to validate that the provided owner of a new chat is in fact friends
 *  with the users provided.
 */
export const ValidateFriendship = (
  owner: HydratedDocument<IUser>,
  recipients: HydratedDocument<IUser>[]
) => {
  // TODO: Clean this up? conversion of objectIds is required for use in the set.
  let friendIdsToString = owner.friends?.map((friend) => friend.toString())
  let friendsOfOwner = new Set(friendIdsToString)

  let pendingIdsToString = owner.pendingFriends?.map((pendingFriend) =>
    pendingFriend.toString()
  )
  let pendingFriendsOfOwner = new Set(pendingIdsToString)

  let friendsArr: HydratedDocument<IUser>[] = []
  let pendingFriendsArr: HydratedDocument<IUser>[] = []

  for (let recipient of recipients) {
    if (friendsOfOwner.has(recipient._id.toString())) {
      friendsArr.push(recipient)
    } else if (pendingFriendsOfOwner.has(recipient._id.toString())) {
      pendingFriendsArr.push(recipient)
    } else {
      throw new CustomError(
        `Provided recipient is not a friend of provided owner: ${recipient._id}`,
        400
      )
    }
  }

  return {
    friends: friendsArr,
    pendingFriends: pendingFriendsArr
  }
}
