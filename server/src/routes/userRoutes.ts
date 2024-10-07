import { Request, Response, Router, NextFunction } from "express";
import { INotification, IUser } from "../interfaces";
import { HydratedDocument } from "mongoose";
import { User, Notification } from "../models";
import { SelectLatestMessages, ValidateSingleUser } from "../utils/functions";
import { CustomError } from "../utils/classes";

const router: Router = Router();

// GET a user by id
router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const user: HydratedDocument<IUser> = await ValidateSingleUser(id);

      res.status(200).json({ user });
    } catch (err) {
      if (err instanceof CustomError) {
        res.status(err.statusCode).json({ error: err.message });
      }
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

      const user: HydratedDocument<IUser> = await ValidateSingleUser(id);

      Object.assign(user, req.body);

      await user.save();

      res.sendStatus(200);
    } catch (err) {
      if (err instanceof CustomError) {
        res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

// GET all chats for a user along with the last message sent
router.get(
  "/:id/chats",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userValidation: HydratedDocument<IUser> = await ValidateSingleUser(
        id
      );
      const user: HydratedDocument<IUser> | null = await User.findById(
        userValidation._id
      )
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
      if (err instanceof CustomError) {
        res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

// PUT (update) a new user
router.put(
  "/:id/newUser",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      // update the user
      const user: HydratedDocument<IUser> | null = await User.findByIdAndUpdate(
        id,
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
                notificationType: 1,
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

// TODO: pseudo-delete

export default router;
