import { useState } from 'react'
import { useSnackbar } from 'notistack'
import { useAlgoSphereClient } from '../hooks/useAlgoSphereClient'
import { microAlgos } from '@algorandfoundation/algokit-utils'

interface BuyTicketProps {
    eventId: bigint
    ticketPrice: bigint
    assetId: bigint
    onPurchaseSuccess?: () => void
}

const BuyTicket = ({ eventId, ticketPrice, assetId, onPurchaseSuccess }: BuyTicketProps) => {
    const { enqueueSnackbar } = useSnackbar()
    const { client, activeAddress, algorand, transactionSigner } = useAlgoSphereClient()
    const [loading, setLoading] = useState(false)

    const handleBuyTicket = async () => {
        if (!activeAddress) {
            enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
            return
        }

        try {
            setLoading(true)

            // 1. Check if user has opted in to the ticket asset
            const accountInfo = await algorand.client.algod.accountInformation(activeAddress).do()
            const assets = accountInfo['assets'] || []
            const hasOptedIn = assets.some((a: any) => BigInt(a['asset-id']) === assetId)

            if (!hasOptedIn) {
                enqueueSnackbar('Opting in to ticket asset...', { variant: 'info' })
                await algorand.send.assetOptIn({
                    sender: activeAddress,
                    assetId: BigInt(assetId), // Use BigInt just to be safe if it expects bigint
                    signer: transactionSigner,
                })
                enqueueSnackbar('Opt-in successful!', { variant: 'success' })
            }

            // 2. Create Payment Transaction
            const payment = await algorand.createTransaction.payment({
                sender: activeAddress,
                receiver: client.appAddress,
                amount: microAlgos(Number(ticketPrice)),
            })

            // 3. Call buy_ticket
            const result = await client.send.buyTicket({
                args: {
                    eventId,
                    payment,
                },
            })

            enqueueSnackbar(`Ticket purchased successfully! Ticket ID: ${result.return}`, { variant: 'success' })

            if (onPurchaseSuccess) {
                onPurchaseSuccess()
            }
        } catch (error: any) {
            console.error('Error buying ticket:', error)
            enqueueSnackbar(`Failed to buy ticket: ${error.message || 'Unknown error'}`, { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`}
            onClick={handleBuyTicket}
            disabled={loading || !activeAddress}
        >
            {loading ? 'Processing...' : 'Buy Ticket'}
        </button>
    )
}

export default BuyTicket
