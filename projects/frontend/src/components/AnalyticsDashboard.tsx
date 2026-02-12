import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAlgoSphereClient } from '../hooks/useAlgoSphereClient'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'

interface EventStats {
  eventId: bigint
  eventName: string
  clubOwner: string
  price: number
  totalTickets: number
  ticketsSold: number
  revenue: number
  venue: string
}

interface ClubStats {
  clubAddress: string
  clubName: string
  eventsCreated: number
  totalRevenue: number
  totalTicketsSold: number
}

const AnalyticsDashboard = () => {
  const { client, activeAddress } = useAlgoSphereClient()
  const { enqueueSnackbar } = useSnackbar()
  const [eventStats, setEventStats] = useState<EventStats[]>([])
  const [clubStats, setClubStats] = useState<ClubStats | null>(null)
  const [totalEventsOnPlatform, setTotalEventsOnPlatform] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [client, activeAddress])

  const fetchAnalytics = async () => {
    if (!client) return

    setLoading(true)
    try {
      // Get total events on platform
      const totalEvents = await client.send.getTotalEvents()
      const totalEventsNum = Number(totalEvents.return)
      setTotalEventsOnPlatform(totalEventsNum)

      // Fetch details for each event
      const events: EventStats[] = []
      let platformRevenue = 0
      let platformTicketsSold = 0
      let clubRevenue = 0
      let clubTicketsSold = 0
      let clubEventsCreated = 0

      for (let i = 1n; i <= BigInt(totalEventsNum); i++) {
        try {
          const result = await client.send.getEventDetails({
            args: {
              eventId: i,
            },
          })

          const [clubOwner, eventNameBytes, venueBytes, dateNum, priceNum, totalNum, soldNum, assetIdNum] = result.return as any[]

          const eventName = eventNameBytes.toString()
          const venue = venueBytes.toString()
          const price = Number(priceNum) / 1_000_000 // Convert to ALGOs
          const total = Number(totalNum)
          const sold = Number(soldNum)
          const revenue = (price * sold)

          events.push({
            eventId: i,
            eventName,
            clubOwner: clubOwner.toString(),
            price,
            totalTickets: total,
            ticketsSold: sold,
            revenue,
            venue,
          })

          // Platform stats
          platformRevenue += revenue
          platformTicketsSold += sold

          // Club stats (if this is the current user's club)
          if (activeAddress && clubOwner.toString() === activeAddress) {
            clubRevenue += revenue
            clubTicketsSold += sold
            clubEventsCreated += 1
          }
        } catch (error) {
          console.error(`Error fetching event ${i}:`, error)
        }
      }

      setEventStats(events)

      // Set club stats if user is a club
      if (activeAddress && clubEventsCreated > 0) {
        const clubName = await client.send.getClubName({
          args: {
            clubAddress: activeAddress,
          },
        })

        setClubStats({
          clubAddress: activeAddress,
          clubName: clubName.return?.toString() || 'Unknown Club',
          eventsCreated: clubEventsCreated,
          totalRevenue: clubRevenue,
          totalTicketsSold: clubTicketsSold,
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      enqueueSnackbar('Failed to load analytics', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-tech p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent mb-2">
            📊 Platform Analytics
          </h1>
          <p className="text-neutral/70">Real-time ticketing data and revenue tracking</p>
        </motion.div>

        {/* Club Stats (if user is a club) */}
        {clubStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="bg-white border border-blue-200/50 rounded-xl p-6 shadow-lg">
              <p className="text-neutral/70 text-sm font-semibold mb-2">Club Name</p>
              <p className="text-3xl font-bold text-neutral">{clubStats.clubName}</p>
            </div>
            <div className="bg-white border border-blue-200/50 rounded-xl p-6 shadow-lg">
              <p className="text-neutral/70 text-sm font-semibold mb-2">Events Created</p>
              <p className="text-3xl font-bold text-blue-600">{clubStats.eventsCreated}</p>
            </div>
            <div className="bg-white border border-blue-200/50 rounded-xl p-6 shadow-lg">
              <p className="text-neutral/70 text-sm font-semibold mb-2">Tickets Sold</p>
              <p className="text-3xl font-bold text-emerald-500">{clubStats.totalTicketsSold}</p>
            </div>
            <div className="bg-white border border-blue-200/50 rounded-xl p-6 shadow-lg">
              <p className="text-neutral/70 text-sm font-semibold mb-2">Revenue (ALGO)</p>
              <p className="text-3xl font-bold text-purple-600">{clubStats.totalRevenue.toFixed(2)}</p>
            </div>
          </motion.div>
        )}

        {/* Platform Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300/50 rounded-xl p-6 shadow-lg">
            <p className="text-neutral/70 text-sm font-semibold mb-2">Total Events</p>
            <p className="text-4xl font-bold text-blue-600">{totalEventsOnPlatform}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-300/50 rounded-xl p-6 shadow-lg">
            <p className="text-neutral/70 text-sm font-semibold mb-2">Total Tickets Sold</p>
            <p className="text-4xl font-bold text-emerald-600">
              {eventStats.reduce((sum, e) => sum + e.ticketsSold, 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300/50 rounded-xl p-6 shadow-lg">
            <p className="text-neutral/70 text-sm font-semibold mb-2">Platform Revenue (ALGO)</p>
            <p className="text-4xl font-bold text-purple-600">
              {eventStats.reduce((sum, e) => sum + e.revenue, 0).toFixed(2)}
            </p>
          </div>
        </motion.div>

        {/* Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-blue-200/50 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-6 border-b border-blue-200/50">
            <h2 className="text-2xl font-bold text-neutral">All Events</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral/5 border-b-2 border-blue-200/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral">Event Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral">Venue</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral">Price (ALGO)</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral">Total Tickets</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral">Sold</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral">Revenue (ALGO)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {eventStats.map((event) => (
                  <tr key={event.eventId.toString()} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-neutral">{event.eventName}</td>
                    <td className="px-6 py-4 text-neutral/70 text-sm">{event.venue}</td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-600">{event.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-neutral">{event.totalTickets}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="badge badge-success text-white font-bold">{event.ticketsSold}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">{event.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {eventStats.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-neutral/60 text-lg">No events created yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
