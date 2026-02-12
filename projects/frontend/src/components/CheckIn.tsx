import { useState } from 'react'
import { useSnackbar } from 'notistack'
import { useAlgoSphereClient } from '../hooks/useAlgoSphereClient'

const CheckIn = () => {
    const { enqueueSnackbar } = useSnackbar()
    const { client, activeAddress } = useAlgoSphereClient()
    const [eventId, setEventId] = useState('')
    const [studentAddress, setStudentAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<boolean | null>(null)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeAddress) {
            enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
            return
        }

        try {
            setLoading(true)
            setResult(null)

            const verifyResult = await client.send.verifyTicket({
                args: {
                    eventId: BigInt(eventId),
                    attendee: studentAddress
                }
            })

            const isValid = verifyResult.return
            setResult(isValid as boolean)

            if (isValid) {
                enqueueSnackbar('Ticket Verified! ✅', { variant: 'success' })
            } else {
                enqueueSnackbar('Invalid Ticket ❌', { variant: 'error' })
            }

        } catch (error: any) {
            console.error('Error verifying ticket:', error)
            enqueueSnackbar(`Verification failed: ${error.message}`, { variant: 'error' })
            setResult(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card bg-base-100 shadow-xl max-w-md mx-auto mt-8 border border-base-200">
            <div className="card-body">
                <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
                    🎟️ Event Check-In
                </h2>

                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Event ID</span>
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 1"
                            className="input input-bordered font-mono"
                            value={eventId}
                            onChange={(e) => setEventId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Student Wallet Address</span>
                        </label>
                        <input
                            type="text"
                            placeholder="ALG..."
                            className="input input-bordered font-mono text-sm"
                            value={studentAddress}
                            onChange={(e) => setStudentAddress(e.target.value)}
                            required
                        />
                    </div>

                    <div className="card-actions justify-end mt-6">
                        <button
                            type="submit"
                            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                            disabled={loading || !activeAddress || !eventId || !studentAddress}
                        >
                            Verify Ticket
                        </button>
                    </div>
                </form>

                {result !== null && (
                    <div className={`alert mt-4 ${result ? 'alert-success' : 'alert-error'}`}>
                        {result ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>Valid Ticket! Access Granted.</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>Invalid Ticket. Access Denied.</span>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CheckIn
