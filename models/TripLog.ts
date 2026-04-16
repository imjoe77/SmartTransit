import mongoose, { Schema, Document } from 'mongoose'

export interface ITripLog extends Document {
  busId: string
  routeId: string
  dayOfWeek: number
  scheduledDeparture: string
  actualStopTimes: {
    stopId: string
    stopName: string
    scheduledTime: string
    actualTime: string
    delayMinutes: number
  }[]
  totalDelayMinutes: number
  peakHour: boolean
  weatherCondition: 'clear' | 'rain' | 'heavy_rain'
  passengerLoad: 'low' | 'medium' | 'high'
  textSummary: string
  embedding: number[]
  createdAt: Date
}

const TripLogSchema = new Schema<ITripLog>({
  busId: { type: String, required: true },
  routeId: { type: String, required: true },
  dayOfWeek: { type: Number, required: true }, // 0=Sunday, 1=Monday...6=Saturday
  scheduledDeparture: { type: String, required: true },
  actualStopTimes: [{
    stopId: String,
    stopName: String,
    scheduledTime: String,
    actualTime: String,
    delayMinutes: Number
  }],
  totalDelayMinutes: { type: Number, default: 0 },
  peakHour: { type: Boolean, default: false },
  weatherCondition: {
    type: String,
    enum: ['clear', 'rain', 'heavy_rain'],
    default: 'clear'
  },
  passengerLoad: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  textSummary: { type: String, required: true },
  embedding: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.TripLog ||
  mongoose.model<ITripLog>('TripLog', TripLogSchema)