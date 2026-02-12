import { motion } from 'framer-motion'
import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useAlgoSphereClient } from '../hooks/useAlgoSphereClient'
import { useSnackbar } from 'notistack'
import { microAlgos } from '@algorandfoundation/algokit-utils'
import type { Event } from '../data/demoEvents'

interface EventCardProps {
  event: Event
  onRegistered?: () => void
}

const EventCard = ({ event, onRegistered }: EventCardProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const { activeAddress } = useWallet()
  const { client, algorand, transactionSigner } = useAlgoSphereClient()
  const { enqueueSnackbar } = useSnackbar()

  const handleRegisterNow = async () => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      return
    }

    if (!client) {
      enqueueSnackbar('Contract not initialized', { variant: 'error' })
      return
    }

    setIsLoading(true)
    try {
      // Verify event exists first
      try {
        await client.send.getEventDetails({
          args: {
            eventId: BigInt(event.id),
          },
        })
      } catch (err) {
        throw new Error(`Event ID ${event.id} does not exist. Please create the event first in "Club Actions" > "Create Event".`)
      }

      // Create Payment Transaction
      // Note: Sending 0.001 ALGO (1,000 microAlgos) for demonstration/testing
      // UI shows event.price, but actual transaction is minimal to conserve testnet faucet
      const payment = await algorand.createTransaction.payment({
        sender: activeAddress,
        receiver: client.appAddress,
        amount: microAlgos(1_000), // 0.001 ALGO for testing
      })

      // Call buy_ticket method
      const result = await client.send.buyTicket({
        args: {
          eventId: BigInt(event.id),
          payment,
        },
      })

      const ticketAsaId = result.return
      const txId = result.txIds[0]

      // Store locally for display
      localStorage.setItem(
        `ticket_${event.id}_${activeAddress}`,
        JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          asaId: ticketAsaId,
          txId,
          timestamp: new Date().toISOString(),
          price: event.price,
        })
      )

      setIsRegistered(true)
      enqueueSnackbar(
        `🎉 Successfully registered for ${event.title}! Ticket minted to your wallet.`,
        { variant: 'success', autoHideDuration: 6000 }
      )

      // Show transaction link
      const algoExplorerUrl = `https://testnet.algoexplorer.io/tx/${txId}`
      enqueueSnackbar(
        <a href={algoExplorerUrl} target="_blank" rel="noopener noreferrer" className="underline text-white hover:text-gray-200">
          View Transaction on AlgoExplorer
        </a>,
        { variant: 'info', persist: true }
      )

      if (onRegistered) {
        onRegistered()
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Registration failed'
      enqueueSnackbar(`Failed to register: ${errorMsg}`, { variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: '-100px' }}
      className="h-full"
    >
      <div className="relative h-full rounded-2xl overflow-hidden group bg-gradient-to-br from-white via-blue-50 to-emerald-50 border border-blue-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-md">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/0 to-emerald-500/0 group-hover:via-blue-500/5 group-hover:to-emerald-500/5 transition-all duration-300" />

        {/* Content */}
        <div className="relative p-6 flex flex-col h-full">
          {/* Icon and Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="text-5xl">{event.icon}</div>
            {isRegistered && (
              <span className="badge badge-success badge-lg text-white">✓ Registered</span>
            )}
          </div>

          {/* Event Title */}
          <h3 className="text-2xl font-bold text-neutral mb-2 line-clamp-2">{event.title}</h3>

          {/* Club Name */}
          <p className="text-blue-600 font-semibold mb-4">By {event.club}</p>

          {/* Event Details */}
          <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-center gap-2 text-neutral/70">
              <span>📅</span>
              <span className="text-sm">{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral/70">
              <span>📍</span>
              <span className="text-sm">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral/70">
              <span>💰</span>
              <span className="text-sm font-semibold text-emerald-600">{event.price} ALGO</span>
            </div>
          </div>

          {/* Register Button */}
          <motion.button
            whileHover={!isRegistered && !isLoading ? { scale: 1.02 } : {}}
            whileTap={!isRegistered && !isLoading ? { scale: 0.98 } : {}}
            onClick={handleRegisterNow}
            disabled={isLoading || isRegistered}
            className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${
              isRegistered
                ? 'bg-success/20 text-success cursor-not-allowed'
                : isLoading
                  ? 'bg-primary/30 text-primary cursor-wait'
                  : 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:from-blue-700 hover:to-emerald-600 shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                Processing...
              </span>
            ) : isRegistered ? (
              'Ticket Minted! ✓'
            ) : (
              'Register Now →'
            )}
          </motion.button>

          {/* Connect Wallet Prompt */}
          {!activeAddress && (
            <p className="text-xs text-center text-neutral/60 mt-3 italic">
              Connect wallet to register
            </p>
          )}
        </div>

        {/* Decorative element */}
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-200/10 rounded-full blur-xl group-hover:bg-blue-200/20 transition-all duration-300" />
      </div>
    </motion.div>
  )
}

export default EventCard
