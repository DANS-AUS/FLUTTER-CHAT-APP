import { Schema } from 'mongoose'
import { INotification } from '../interfaces'
// import { Notification_Type } from '../enums/Notification_Type'

export const notificationSchema = new Schema<INotification>(
  {
    title: { type: String },
    notificationType: {
      type: Number,
      enum: [1],
      required: true
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resolved: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    timestamps: true
  }
)
