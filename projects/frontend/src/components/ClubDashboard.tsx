
import { useState, useEffect } from 'react'
import { useAlgoSphereClient } from '../hooks/useAlgoSphereClient'
import CreateEvent from './CreateEvent'
import CheckIn from './CheckIn'

interface EventStats {
    totalEvents: number
    totalTicketsSold: number
    totalRevenue: number
}

interface ClubEvent {
    eventId: bigint
    eventName: string
    venue: string
    eventDate: bigint
    ticketPrice: bigint
    totalTickets: bigint
    soldTickets: bigint
}

const ClubDashboard = () => {
    const { client, activeAddress, appId } = useAlgoSphereClient()
    const [clubName, setClubName] = useState<string>('')
    const [events, setEvents] = useState<ClubEvent[]>([])
    const [stats, setStats] = useState<EventStats>({ totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0 })
    const [loading, setLoading] = useState(true)
    const [isRegistered, setIsRegistered] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'checkin'>('overview')
    const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)

    const fetchClubData = async () => {
        if (!activeAddress || !appId) return

        try {
            setLoading(true)

            // 1. Check if registered
            const regResult = await client.send.isClubRegistered({ args: { clubAddress: activeAddress } })
            if (!regResult.return) {
                setIsRegistered(false)
                setLoading(false)
                return
            }
            setIsRegistered(true)

            // 2. Get Club Name
            const nameResult = await client.send.getClubName({ args: { clubAddress: activeAddress } })
            if (nameResult.return) {
                setClubName(new TextDecoder().decode(nameResult.return))
            }

            // 3. Get All Events and filter by this club
            // Note: In a real app, we might want an indexer. For now, we loop.
            const totalEventsResult = await client.send.getTotalEvents({ args: [] })
            const totalEvents = Number(totalEventsResult.return)
            const myEvents: ClubEvent[] = []
            let revenue = 0
            let ticketsSold = 0

            for (let i = 1; i <= totalEvents; i++) {
                try {
                    const details = await client.send.getEventDetails({ args: { eventId: BigInt(i) } })
                    if (details.return) {
                        // Tuple: (club_owner, event_name, venue, date, price, total, sold, asset_id)
                        const [
                            eventOwner,
                            eventNameBytes,
                            venueBytes,
                            eventDate,
                            ticketPrice,
                            totalTickets,
                            soldTickets,
                            _assetId
                        ] = details.return

                        if (eventOwner === activeAddress) {
                            myEvents.push({
                                eventId: BigInt(i),
                                eventName: new TextDecoder().decode(eventNameBytes),
                                venue: new TextDecoder().decode(venueBytes),
                                eventDate,
                                ticketPrice,
                                totalTickets,
                                soldTickets
                            })

                            revenue += Number(soldTickets) * Number(ticketPrice)
                            ticketsSold += Number(soldTickets)
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to fetch event ${i}`, e)
                }
            }

            setEvents(myEvents.reverse())
            setStats({
                totalEvents: myEvents.length,
                totalTicketsSold: ticketsSold,
                totalRevenue: revenue
            })

        } catch (error) {
            console.error('Error fetching club dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (activeAddress) {
            fetchClubData()
        }
    }, [activeAddress, appId])


    if (!activeAddress) {
        return <div className="alert alert-warning">Please connect your wallet to access the Club Dashboard.</div>
    }

    if (loading) {
        return <div className="text-center p-10"><span className="loading loading-spinner text-primary"></span></div>
    }

    if (!isRegistered) {
        return (
            <div className="hero bg-base-200 rounded-box p-10">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <h1 className="text-3xl font-bold">Club Dashboard</h1>
                        <p className="py-6">You are not registered as a club yet. Please register on the Home page to access dashboard features.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary">
                    Dashboard: {clubName || 'My Club'}
                </h1>
                <div className="stats shadow">
                    <div className="stat">
                        <div className="stat-title">Total Revenue</div>
                        <div className="stat-value text-secondary text-2xl">{stats.totalRevenue / 1_000_000} ALGO</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Tickets Sold</div>
                        <div className="stat-value text-accent text-2xl">{stats.totalTicketsSold}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Events</div>
                        <div className="stat-value text-2xl">{stats.totalEvents}</div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="tabs tabs-boxed flex-1">
                    <a
                        className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >Overview</a>
                    <a
                        className={`tab ${activeTab === 'checkin' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('checkin')}
                    >Check-In</a>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => setIsCreateEventOpen(true)}
                >
                    + Create Event
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Date</th>
                                <th>Price</th>
                                <th>Sales</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event.eventId.toString()}>
                                    <td>
                                        <div className="font-bold">{event.eventName}</div>
                                        <div className="text-sm opacity-50">{event.venue}</div>
                                    </td>
                                    <td>{new Date(Number(event.eventDate) * 1000).toLocaleDateString()}</td>
                                    <td>{Number(event.ticketPrice) / 1_000_000} ALGO</td>
                                    <td>
                                        <progress className="progress progress-primary w-20 mr-2" value={Number(event.soldTickets)} max={Number(event.totalTickets)}></progress>
                                        {Number(event.soldTickets)} / {Number(event.totalTickets)}
                                    </td>
                                    <td>
                                        {Number(event.soldTickets) === Number(event.totalTickets) ?
                                            <span className="badge badge-error">Sold Out</span> :
                                            <span className="badge badge-success">Active</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center">No events created yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'checkin' && (
                <CheckIn />
            )}

            {/* Create Event Modal */}
            <CreateEvent 
                openModal={isCreateEventOpen} 
                closeModal={() => setIsCreateEventOpen(false)}
                onEventCreated={() => {
                    fetchClubData()
                    setIsCreateEventOpen(false)
                }} 
            />
        </div>
    )
}

export default ClubDashboard
