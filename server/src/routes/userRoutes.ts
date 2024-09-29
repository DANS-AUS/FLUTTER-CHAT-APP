import express, { Request, Response, Router, NextFunction } from "express";
import { IChat, INotification, IUser } from "../interfaces";
import { HydratedDocument } from "mongoose";
import { User, Notification } from "../models";
import { SelectLatestMessages } from "../utils/functions";
import { Notification_Type } from "../enums/Notification_Type";

const router: Router = Router();

// GET a user by auth0 user_id
router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user: HydratedDocument<IUser> | null = await User.findOne({
        authId: id,
      });

      if (user) {
        res.status(200).json({ user });
      } else {
        res.status(404).send(`No user with id: ${id}`);
      }
    } catch (err) {
      next(err);
    }
  }
);

// POST a new user. This route will be called by auth0 actions to create a user upon successful auth0 registration
router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { authId, username } = req.body;
      await User.create({ authId: authId, username: username });

      res.status(201).send("New user created");
    } catch (err) {
      next(err);
    }
  }
);

// PUT (update) a user
router.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await User.findOneAndUpdate({ authId: id }, req.body);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);

// GET all chats for a user along with the last message sent
router.get(
  "/:authId/chats",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { authId } = req.params;
      const user: HydratedDocument<IUser> | null = await User.findOne({
        authId: authId,
      })
        .select("chats")
        .populate({
          path: "chats",
          populate: {
            path: "messages",
            options: { sort: { timestamp: -1 } },
          },
        });
      SelectLatestMessages(user);

      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }
);

// PUT (update) a new user
router.put(
  "/:authId/newUser",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { authId } = req.params;
      // update the user
      const user: HydratedDocument<IUser> | null = await User.findOneAndUpdate(
        { authId: authId },
        req.body,
        { new: true }
      );

      if (user) {
        // explicitly update the new user boolean to false
        user.newUser = false;
        user.save();

        // send notifications to all pending friends
        if (user.pendingFriends && user.pendingFriends?.length > 0) {
          for (const friend of user.pendingFriends) {
            // create notification
            const notification: HydratedDocument<INotification> =
              await Notification.create({
                notificationType: Notification_Type.FRIEND_REQUEST,
                to: friend,
                from: user._id,
                resolved: false,
              });

            // adding notification to friends notification list
            if (notification) {
              await User.findOneAndUpdate(
                { _id: friend },
                {
                  $push: { notifications: notification._id },
                }
              );
            }
          }
        }
      }
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
