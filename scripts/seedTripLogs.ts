import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI!

const tripLogs = [
  // R-01 Towards Dharwad - Morning peak
  { busId: 'BUS-01', routeId: 'R-01', dayOfWeek: 1, scheduledDeparture: '08:00', totalDelayMinutes: 14, peakHour: true, weatherCondition: 'clear', passengerLoad: 'high', textSummary: 'BUS-01 on Route R-01 Towards Dharwad departed Monday 08:00 peak hour. High load. Arrived Dharwad New Bus Stand 14 mins late due to traffic at RTO Circle.' },
  { busId: 'BUS-01', routeId: 'R-01', dayOfWeek: 1, scheduledDeparture: '08:00', totalDelayMinutes: 11, peakHour: true, weatherCondition: 'clear', passengerLoad: 'high', textSummary: 'BUS-01 Route R-01 Monday 08:00. Heavy load caused boarding delays at SDM College and Navanagar. 11 mins late overall.' },
  { busId: 'BUS-01', routeId: 'R-01', dayOfWeek: 1, scheduledDeparture: '08:00', totalDelayMinutes: 16, peakHour: true, weatherCondition: 'rain', passengerLoad: 'high', textSummary: 'BUS-01 Route R-01 Monday morning. Rain and high load caused 16 min delay. Isckon and New Court Stop worst affected.' },
  { busId: 'BUS-01', routeId: 'R-01', dayOfWeek: 2, scheduledDeparture: '08:00', totalDelayMinutes: 5, peakHour: true, weatherCondition: 'clear', passengerLoad: 'medium', textSummary: 'BUS-01 Route R-01 Tuesday 08:00. Medium load, clear weather. Minor 5 min delay at RTO Circle only.' },
  { busId: 'BUS-01', routeId: 'R-01', dayOfWeek: 3, scheduledDeparture: '08:00', totalDelayMinutes: 0, peakHour: true, weatherCondition: 'clear', passengerLoad: 'low', textSummary: 'BUS-01 Route R-01 Wednesday 08:00. Low load. On time at all stops including Dharwad New Bus Stand.' },
  { busId: 'BUS-01', routeId: 'R-01', dayOfWeek: 5, scheduledDeparture: '08:00', totalDelayMinutes: 9, peakHour: true, weatherCondition: 'clear', passengerLoad: 'medium', textSummary: 'BUS-01 Route R-01 Friday 08:00. Medium load. 9 min delay near Navanagar and Isckon stop.' },
  { busId: 'BUS-01', routeId: 'R-01', dayOfWeek: 1, scheduledDeparture: '17:30', totalDelayMinutes: 18, peakHour: true, weatherCondition: 'clear', passengerLoad: 'high', textSummary: 'BUS-01 Route R-01 Monday 17:30 evening. Max load. 18 min delay, worst at SDM College pickup.' },
  { busId: 'BUS-01', routeId: 'R-01', dayOfWeek: 3, scheduledDeparture: '17:30', totalDelayMinutes: 7, peakHour: false, weatherCondition: 'clear', passengerLoad: 'medium', textSummary: 'BUS-01 Route R-01 Wednesday 17:30. Medium load smooth trip. 7 min delay only at last stop Dharwad New Bus Stand.' },

  // R-02 Towards Hubli - Morning peak
  { busId: 'BUS-02', routeId: 'R-02', dayOfWeek: 1, scheduledDeparture: '07:45', totalDelayMinutes: 22, peakHour: true, weatherCondition: 'heavy_rain', passengerLoad: 'high', textSummary: 'BUS-02 Route R-02 Monday 07:45. Heavy rain caused 22 min delay. Hubli Railway Station and CBT stops worst affected.' },
  { busId: 'BUS-02', routeId: 'R-02', dayOfWeek: 2, scheduledDeparture: '07:45', totalDelayMinutes: 12, peakHour: true, weatherCondition: 'rain', passengerLoad: 'high', textSummary: 'BUS-02 Route R-02 Tuesday 07:45. Light rain and peak hour. 12 min delay across KMC and Vidyanagar stops.' },
  { busId: 'BUS-02', routeId: 'R-02', dayOfWeek: 3, scheduledDeparture: '07:45', totalDelayMinutes: 3, peakHour: true, weatherCondition: 'clear', passengerLoad: 'medium', textSummary: 'BUS-02 Route R-02 Wednesday 07:45. Clear weather medium load. Nearly on time, 3 min delay at Old Bus Stand.' },
  { busId: 'BUS-02', routeId: 'R-02', dayOfWeek: 4, scheduledDeparture: '07:45', totalDelayMinutes: 0, peakHour: false, weatherCondition: 'clear', passengerLoad: 'low', textSummary: 'BUS-02 Route R-02 Thursday 07:45. Low load clear weather. Perfect on time at all stops including Keshwapur.' },
  { busId: 'BUS-02', routeId: 'R-02', dayOfWeek: 5, scheduledDeparture: '07:45', totalDelayMinutes: 10, peakHour: true, weatherCondition: 'clear', passengerLoad: 'high', textSummary: 'BUS-02 Route R-02 Friday 07:45. High Friday load. 10 min delay at CBT and Hubli Railway Station.' },
  { busId: 'BUS-02', routeId: 'R-02', dayOfWeek: 1, scheduledDeparture: '18:00', totalDelayMinutes: 20, peakHour: true, weatherCondition: 'clear', passengerLoad: 'high', textSummary: 'BUS-02 Route R-02 Monday 18:00 evening peak. Maximum load. 20 min delay, worst stop Keshwapur.' },

  // R-03 Rural Loop
  { busId: 'BUS-03', routeId: 'R-03', dayOfWeek: 1, scheduledDeparture: '08:15', totalDelayMinutes: 6, peakHour: false, weatherCondition: 'clear', passengerLoad: 'medium', textSummary: 'BUS-03 Route R-03 Rural Loop Monday 08:15. Medium load. Minor 6 min delay near Agadi and Lakshmeshwar.' },
  { busId: 'BUS-03', routeId: 'R-03', dayOfWeek: 2, scheduledDeparture: '08:15', totalDelayMinutes: 0, peakHour: false, weatherCondition: 'clear', passengerLoad: 'low', textSummary: 'BUS-03 Route R-03 Tuesday 08:15. Low load clear. On time at all stops including Sulla and RamNagar.' },
  { busId: 'BUS-03', routeId: 'R-03', dayOfWeek: 3, scheduledDeparture: '08:15', totalDelayMinutes: 25, peakHour: false, weatherCondition: 'heavy_rain', passengerLoad: 'medium', textSummary: 'BUS-03 Route R-03 Wednesday 08:15. Heavy rain on rural roads caused 25 min delay. Kusugal and Hebballi worst affected.' },
  { busId: 'BUS-03', routeId: 'R-03', dayOfWeek: 4, scheduledDeparture: '08:15', totalDelayMinutes: 4, peakHour: false, weatherCondition: 'clear', passengerLoad: 'low', textSummary: 'BUS-03 Route R-03 Thursday 08:15. Low load smooth trip. 4 min delay only near RamNagar.' },
  { busId: 'BUS-03', routeId: 'R-03', dayOfWeek: 5, scheduledDeparture: '08:15', totalDelayMinutes: 11, peakHour: false, weatherCondition: 'clear', passengerLoad: 'high', textSummary: 'BUS-03 Route R-03 Friday 08:15. Unusually high Friday load. 11 min delay at Agadi and Lakshmeshwar stops.' },
  { busId: 'BUS-03', routeId: 'R-03', dayOfWeek: 1, scheduledDeparture: '17:45', totalDelayMinutes: 15, peakHour: true, weatherCondition: 'clear', passengerLoad: 'high', textSummary: 'BUS-03 Route R-03 Monday 17:45 evening. High load on rural return. 15 min delay, Sulla and Hebballi stops affected.' },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

 const db = mongoose.connection.useDb('campusride')
 await db.collection('triplogs').deleteMany({})
  console.log('Cleared existing trip logs')

  await db.collection('triplogs').insertMany(
    tripLogs.map(log => ({
      ...log,
      embedding: [], // embeddings will be generated in Step 3
      createdAt: new Date()
    }))
  )

  console.log(`Seeded ${tripLogs.length} trip logs`)
  await mongoose.disconnect()
  console.log('Done')
}

seed().catch(console.error)