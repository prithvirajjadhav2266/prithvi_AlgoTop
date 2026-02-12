import { useState } from 'react'
import { useSnackbar } from 'notistack'
import { useAlgoSphereClient } from '../hooks/useAlgoSphereClient'

interface CreateEventProps {
  openModal: boolean
  closeModal: () => void
  onEventCreated?: () => void
}

const CreateEvent = ({ openModal, closeModal, onEventCreated }: CreateEventProps) => {
  const { enqueueSnackbar } = useSnackbar()
  const { client, activeAddress, appId } = useAlgoSphereClient()

  const [eventName, setEventName] = useState<string>('')
  const [venue, setVenue] = useState<string>('')
  const [eventDate, setEventDate] = useState<string>('')
  const [eventTime, setEventTime] = useState<string>('18:00')
  const [ticketPrice, setTicketPrice] = useState<string>('')
  const [ticketCount, setTicketCount] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const resetForm = () => {
    setEventName('')
    setVenue('')
    setEventDate('')
    setEventTime('18:00')
    setTicketPrice('')
    setTicketCount('')
  }

  const handleCreateEvent = async () => {
    // Validate user is connected
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      return
    }

    // Validate event name is provided and not empty
    if (!eventName.trim()) {
      enqueueSnackbar('Please enter an event name', { variant: 'warning' })
      return
    }

    // Validate venue is provided
    if (!venue.trim()) {
      enqueueSnackbar('Please enter a venue', { variant: 'warning' })
      return
    }

    // Validate date is selected
    if (!eventDate) {
      enqueueSnackbar('Please select an event date', { variant: 'warning' })
      return
    }

    // Convert date + time inputs to Unix timestamp for on-chain storage
    // Format: YYYY-MM-DD and HH:MM → UTC timestamp in seconds
    const eventDateTime = new Date(`${eventDate}T${eventTime}`)
    const eventTimestamp = Math.floor(eventDateTime.getTime() / 1000)
    
    // Ensure event is scheduled for the future (contract requirement)
    if (eventTimestamp <= Math.floor(Date.now() / 1000)) {
      enqueueSnackbar('Event date must be in the future', { variant: 'warning' })
      return
    }

    // Parse and validate ticket price (in ALGO)
    const priceInAlgo = parseFloat(ticketPrice)
    if (!ticketPrice || isNaN(priceInAlgo) || priceInAlgo <= 0) {
      enqueueSnackbar('Please enter a valid ticket price greater than 0', { variant: 'warning' })
      return
    }

    // Parse and validate ticket count
    const count = parseInt(ticketCount)
    if (!ticketCount || isNaN(count) || count <= 0) {
      enqueueSnackbar('Please enter a valid number of tickets', { variant: 'warning' })
      return
    }

    // Algorand ASA limit: maximum 10,000 tickets per event
    if (count > 10000) {
      enqueueSnackbar('Maximum 10,000 tickets allowed per event', { variant: 'warning' })
      return
    }

    // Verify smart contract is deployed and configured
    if (!appId || appId === 0 || !client) {
      enqueueSnackbar('Contract not deployed. Please check configuration', { variant: 'error' })
      return
    }

    setLoading(true)

    try {
      // Convert ALGO to microAlgos (1 ALGO = 1,000,000 microAlgos)
      // Algorand stores amounts in smallest unit for precision
      const priceInMicroAlgos = Math.floor(priceInAlgo * 1_000_000)

      // Call smart contract create_event method with validated parameters
      // AlgoKit handles transaction composition and fee calculation
      const result = await client.send.createEvent({
        args: {
          eventName: eventName,
          venue: venue,
          eventDate: BigInt(eventTimestamp),
          ticketPrice: BigInt(priceInMicroAlgos),
          ticketCount: BigInt(count),
        },
      })

      const eventId = result.return
      
      enqueueSnackbar(
        `Event created successfully! Event ID: ${eventId}`, 
        { variant: 'success' }
      )

      console.log('Event created:', { eventId, result })

      // Reset form fields after successful submission
      resetForm()

      // Notify parent component of successful event creation for any needed refreshes
      if (onEventCreated) {
        onEventCreated()
      }

      // Close modal after short delay to show success message
      setTimeout(() => {
        closeModal()
      }, 1500)
    } catch (error: any) {
      console.error('Error creating event:', error)
      const errorMessage = error.message || 'Unknown error'
      
      // Provide specific error messages for common contract validation failures
      if (errorMessage.includes('Club not registered')) {
        enqueueSnackbar('You must register as a club first', { variant: 'error' })
      } else {
        enqueueSnackbar(`Failed to create event: ${errorMessage}`, { variant: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    closeModal()
  }

  if (!openModal) return null

  // Get today's date for the date picker minimum
  const today = new Date().toISOString().split('T')[0]

  return (
    <dialog className={`modal ${openModal ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-2xl mb-4 text-primary">Create New Event</h3>

        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-600">
            Create a ticketed event on the blockchain. Tickets will be minted as Algorand Standard Assets (ASAs).
          </p>

          {activeAddress && (
            <div className="bg-base-200 p-4 rounded-lg">
              <p className="text-xs font-semibold mb-1">Your Club Wallet:</p>
              <p className="text-sm font-mono break-all">{activeAddress}</p>
            </div>
          )}

          {/* Event Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Event Name *</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Spring Tech Fest 2026"
              className="input input-bordered w-full"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              maxLength={64}
              disabled={loading}
            />
            <label className="label">
              <span className="label-text-alt">{eventName.length}/64 characters</span>
            </label>
          </div>

          {/* Venue */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Venue *</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Main Campus Auditorium"
              className="input input-bordered w-full"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              maxLength={64}
              disabled={loading}
            />
            <label className="label">
              <span className="label-text-alt">Event location</span>
            </label>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Event Date *</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={today}
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Event Time *</span>
              </label>
              <input
                type="time"
                className="input input-bordered w-full"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Ticket Price and Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Ticket Price (ALGO) *</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 5.5"
                className="input input-bordered w-full"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                min="0.01"
                step="0.01"
                disabled={loading}
              />
              <label className="label">
                <span className="label-text-alt">Price per ticket in ALGO</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Number of Tickets *</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 100"
                className="input input-bordered w-full"
                value={ticketCount}
                onChange={(e) => setTicketCount(e.target.value)}
                min="1"
                max="10000"
                step="1"
                disabled={loading}
              />
              <label className="label">
                <span className="label-text-alt">Max: 10,000 tickets</span>
              </label>
            </div>
          </div>

          {/* Info Alert */}
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs">
              Creating an event will mint {ticketCount || '0'} ticket ASAs on Algorand. 
              Transaction fees will be covered automatically. Make sure your club wallet is registered first.
            </span>
          </div>

          {/* Estimated Summary */}
          {eventName && ticketPrice && ticketCount && (
            <div className="bg-primary bg-opacity-10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Event Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Event:</span> <strong>{eventName}</strong>
                </div>
                <div>
                  <span className="text-gray-600">Tickets:</span> <strong>{ticketCount}</strong>
                </div>
                <div>
                  <span className="text-gray-600">Price:</span> <strong>{ticketPrice} ALGO</strong>
                </div>
                <div>
                  <span className="text-gray-600">Potential Revenue:</span> 
                  <strong> {(parseFloat(ticketPrice) * parseInt(ticketCount || '0')).toFixed(2)} ALGO</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="modal-action">
          <button 
            className="btn btn-ghost" 
            onClick={handleCancel} 
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreateEvent}
            disabled={loading || !activeAddress || !eventName.trim() || !venue.trim() || !eventDate}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating Event...
              </>
            ) : (
              'Create Event'
            )}
          </button>
        </div>
      </div>

      {/* Modal backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleCancel}>close</button>
      </form>
    </dialog>
  )
}

export default CreateEvent
