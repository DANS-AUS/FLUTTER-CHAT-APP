import { Types } from 'mongoose'
import { Notification_Type } from '../enums/Notification_Type'

export interface INotification {
  notificationType: Notification_Type
  from: Types.ObjectId
  to: Types.ObjectId
  resolved?: boolean
}
