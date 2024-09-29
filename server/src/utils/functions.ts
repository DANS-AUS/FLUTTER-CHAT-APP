import { HydratedDocument, Types } from "mongoose";
import { User } from "../models";
import { IChat, IUser } from "../interfaces";
import { CustomError } from "./classes";

/**
 * Use to validate that each user in a given array
 * exists in the database.
 *
 * @param Types.ObjectId[]
 */
export const ValidateUser = async (ids: Types.ObjectId[]) => {
  // TODO: Need to figure out best way to validate users AND pass them
  // to the controller.
  let users: HydratedDocument<IUser>[] = [];

  for (let id of ids) {
    const user: HydratedDocument<IUser> | null = await User.findById(id);
    if (!user) {
      throw new CustomError(`No user with provided id: ${id}`, 404);
    }

    users.push(user);
  }
  return users;
};

/**
 *  Use to validate that the provided owner of a new chat is in fact friends
 *  with the users provided.
 */
export const ValidateFriendship = (
  owner: HydratedDocument<IUser>,
  recipients: HydratedDocument<IUser>[]
) => {
  // TODO: Clean this up? conversion of objectIds is required for use in the set
  let idsToString = owner.friends!.map((friend) => friend.toString());
  let friendsOfOwner = new Set(idsToString);

  // TODO: Add validation to check the users pending friends.
  for (let recipient of recipients) {
    if (!friendsOfOwner.has(recipient._id.toString())) {
      throw new Error(
        `Provided recipient is not a friend of provided owner: ${recipient._id}`
      );
    }
  }
};

/**
 * Used to select only the most recent messages for a chat.
 * This `limit` option in mongoose does not work with very nested populations
 * so a custom method is needed.
 */
export const SelectLatestMessages = (user: HydratedDocument<IUser> | null) => {
  if (user && user.chats && Array.isArray(user.chats)) {
    const populatedChats = user.chats as unknown as IChat[];
    populatedChats.forEach((chat) => {
      if (chat.messages && chat.messages.length > 1) {
        chat.messages = chat.messages.slice(0, 1);
      }
    });
  }
};
