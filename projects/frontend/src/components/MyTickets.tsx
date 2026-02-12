import { useState, useEffect } from 'react'
import { useAlgoSphereClient } from '../hooks/useAlgoSphereClient'
import { useWallet } from '@txnlab/use-wallet-react'

interface Ticket {
    assetId: number
    name: string
    balance: number
}

const MyTickets = () => {
    const { activeAddress, algorand } = useAlgoSphereClient()
    const { signTransactions } = useWallet()
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(false)

    const fetchTickets = async () => {
        if (!activeAddress) return

        try {
            setLoading(true)
            const accountInfo = await algorand.client.algod.accountInformation(activeAddress).do()
            const assets = accountInfo['assets'] || []

            const ticketAssets: Ticket[] = []

            for (const asset of assets) {
                if (asset.amount > 0) {
                    // Get asset details to check if it's a ticket (TKT unit name)
                    try {
                        const assetInfo = await algorand.client.algod.getAssetByID(asset.assetId).do()
                        const params = assetInfo.params

                        if (params.unitName === 'TKT') {
                            ticketAssets.push({
                                assetId: Number(asset.assetId),
                                name: params.name || '',
                                balance: Number(asset.amount)
                            })
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch asset info for ${asset.assetId}`)
                    }
                }
            }

            setTickets(ticketAssets)
        } catch (error) {
            console.error('Error fetching tickets:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [activeAddress])

    if (!activeAddress) {
        return <div className="alert alert-warning">Please connect your wallet to view your tickets.</div>
    }

    if (loading) {
        return <div className="text-center p-10"><span className="loading loading-spinner"></span></div>
    }

    if (tickets.length === 0) {
        return <div className="text-center p-10 text-gray-500">You don't have any tickets yet.</div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((ticket) => (
                <div key={ticket.assetId} className="card bg-secondary text-secondary-content shadow-lg">
                    <div className="card-body">
                        <h3 className="card-title">{ticket.name}</h3>
                        <p className="font-mono text-sm">Asset ID: {ticket.assetId}</p>
                        <div className="badge badge-outline">
                            Quantity: {ticket.balance}
                        </div>
                        {/* 
                Ideally, generate a QR code here containing:
                { "eventId": ..., "wallet": activeAddress }
                which the club owner can scan with the CheckIn component.
                For MVP, just showing the ID is fine.
            */}
                        <button className="btn btn-sm btn-ghost mt-2" onClick={() => navigator.clipboard.writeText(String(ticket.assetId))}>
                            Copy ID
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MyTickets
