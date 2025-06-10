import mongoose, { Schema } from 'mongoose'

export interface IPoints {
  address: string
  points: number
}

const PointsSchema: Schema = new Schema(
  {
    address: { type: String, required: true },
    points: { type: Number, required: true }
  },
  {
    timestamps: true
  }
)

const PointsModel = mongoose.model<IPoints>('Points', PointsSchema)

export default PointsModel
