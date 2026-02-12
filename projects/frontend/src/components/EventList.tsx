import { useState, useEffect } from 'react'
import { useAlgoSphereClient } from '../hooks/useAlgoSphereClient'
import BuyTicket from './BuyTicket'

interface Event {
    eventId: bigint
    clubOwner: string
    eventName: string
    venue: string
    eventDate: bigint
    ticketPrice: bigint
    totalTickets: bigint
    soldTickets: bigint
    assetId: bigint
}

const EventList = () => {
    const { client, appId } = useAlgoSphereClient()
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    const fetchEvents = async () => {
        if (!appId) return

        try {
            setLoading(true)
            // Get total events count
            const totalEventsResult = await client.send.getTotalEvents({ args: [] })
            const totalEvents = Number(totalEventsResult.return)

            const fetchedEvents: Event[] = []

            // Loop through all event IDs (1 to totalEvents)
            // Note: Event IDs start from 1 based on contract logic
            for (let i = 1; i <= totalEvents; i++) {
                try {
                    const details = await client.send.getEventDetails({ args: { eventId: BigInt(i) } })
                    if (details.return) {
                        // Unpack tuple
                        // (club_owner, event_name, venue, date, price, total, sold, asset_id)
                        const [clubOwner, eventNameBytes, venueBytes, eventDate, ticketPrice, totalTickets, soldTickets, assetId] = details.return

                        fetchedEvents.push({
                            eventId: BigInt(i),
                            clubOwner,
                            eventName: new TextDecoder().decode(eventNameBytes),
                            venue: new TextDecoder().decode(venueBytes),
                            eventDate,
                            ticketPrice,
                            totalTickets,
                            soldTickets,
                            assetId
                        })
                    }
                } catch (e) {
                    console.warn(`Failed to fetch event ${i}`, e)
                }
            }

            setEvents(fetchedEvents.reverse()) // Show newest first
        } catch (error) {
            console.error('Error fetching events:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [client, appId])

    if (loading) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>
    }

    if (events.length === 0) {
        return <div className="text-center p-10 text-gray-500">No events found. Create one!</div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {events.map((event) => (
                <div key={event.eventId.toString()} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="card-body">
                        <h2 className="card-title text-primary">{event.eventName}</h2>
                        <div className="space-y-2 text-sm">
                            <p>📍 {event.venue}</p>
                            <p>📅 {new Date(Number(event.eventDate) * 1000).toLocaleString()}</p>
                            <div className="flex justify-between items-center bg-base-200 p-2 rounded-lg">
                                <span className="font-bold text-lg">{Number(event.ticketPrice) / 1_000_000} ALGO</span>
                                <div className="badge badge-accent">
                                    {Number(event.totalTickets) - Number(event.soldTickets)} left
                                </div>
                            </div>
                        </div>
                        <div className="card-actions justify-end mt-4">
                            {Number(event.soldTickets) < Number(event.totalTickets) ? (
                                <BuyTicket
                                    eventId={event.eventId}
                                    ticketPrice={event.ticketPrice}
                                    assetId={event.assetId}
                                    onPurchaseSuccess={fetchEvents}
                                />
                            ) : (
                                <button className="btn btn-disabled">Sold Out</button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default EventList
