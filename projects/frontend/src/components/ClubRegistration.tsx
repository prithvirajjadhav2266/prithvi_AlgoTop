import { useState, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import { useAlgoSphereClient } from '../hooks/useAlgoSphereClient'

interface ClubRegistrationProps {
  openModal: boolean
  closeModal: () => void
  onRegistrationSuccess?: () => void
}

const ClubRegistration = ({ openModal, closeModal, onRegistrationSuccess }: ClubRegistrationProps) => {
  const { enqueueSnackbar } = useSnackbar()
  const { client, activeAddress, appId } = useAlgoSphereClient()

  const [clubName, setClubName] = useState<string>('')
  const [contact, setContact] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [isRegistered, setIsRegistered] = useState<boolean>(false)

  useEffect(() => {
    if (openModal && activeAddress && appId > 0) {
      checkRegistration()
    }
  }, [openModal, activeAddress, appId])

  const checkRegistration = async () => {
    if (!activeAddress || !appId || !client) return

    try {
      // Check if club is already registered
      const registered = await client.isClubRegistered({
        args: { clubAddress: activeAddress }
      })

      setIsRegistered(registered)

      if (registered) {
        enqueueSnackbar('Your wallet is already registered as a club', { variant: 'info' })
      }
    } catch (error) {
      console.error('Error checking registration:', error)
    }
  }

  const handleRegisterClub = async () => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      return
    }

    if (!clubName.trim()) {
      enqueueSnackbar('Please enter a club name', { variant: 'warning' })
      return
    }

    if (!contact.trim()) {
      enqueueSnackbar('Please enter contact information', { variant: 'warning' })
      return
    }

    if (!appId || appId === 0 || !client) {
      enqueueSnackbar('Contract not deployed. Please set VITE_ALGOSPHERE_APP_ID in .env', { variant: 'error' })
      return
    }

    setLoading(true)

    try {
      // Call register_club method
      const result = await client.send.registerClub({
        args: {
          clubName: clubName,
          contact: contact,
        },
      })

      console.log('Registration result:', result)
      enqueueSnackbar('Club registered successfully!', { variant: 'success' })

      setIsRegistered(true)
      setClubName('')
      setContact('')

      if (onRegistrationSuccess) {
        onRegistrationSuccess()
      }

      // Close modal after short delay
      setTimeout(() => {
        closeModal()
      }, 1500)
    } catch (error: any) {
      console.error('Error registering club:', error)
      enqueueSnackbar(`Registration failed: ${error.message || 'Unknown error'}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!openModal) return null


return (
  <dialog className={`modal ${openModal ? 'modal-open' : ''} `}>
    <div className="modal-box max-w-2xl">
      <h3 className="font-bold text-2xl mb-4 text-primary">Register Your Club</h3>

      {isRegistered ? (
        <div className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Your wallet is already registered as a club!</span>
        </div>
      ) : (
        <>
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-600">
              Register your club to start creating ticketed events on the blockchain. Your connected wallet address
              will become your club's unique identifier.
            </p>

            <div className="bg-base-200 p-4 rounded-lg">
              <p className="text-xs font-semibold mb-1">Connected Wallet:</p>
              <p className="text-sm font-mono break-all">{activeAddress || 'Not connected'}</p>
            </div>

            {/* Club Name Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Club Name *</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Computer Science Society"
                className="input input-bordered w-full"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                maxLength={64}
                disabled={loading}
              />
              <label className="label">
                <span className="label-text-alt">{clubName.length}/64 characters</span>
              </label>
            </div>

            {/* Contact Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Contact Information *</span>
              </label>
              <input
                type="text"
                placeholder="e.g., cssociety@campus.edu or @telegram_handle"
                className="input input-bordered w-full"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={128}
                disabled={loading}
              />
              <label className="label">
                <span className="label-text-alt">Email or social media handle</span>
              </label>
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
                ></path>
              </svg>
              <span className="text-xs">
                Registration requires a minimal 0.001 ALGO transaction fee for blockchain storage. Any connected wallet can register.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={closeModal} disabled={loading}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleRegisterClub}
              disabled={loading || !activeAddress || !clubName.trim() || !contact.trim()}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Registering...
                </>
              ) : (
                'Register Club'
              )}
            </button>
          </div>
        </>
      )}

      {isRegistered && (
        <div className="modal-action">
          <button className="btn btn-primary" onClick={closeModal}>
            Close
          </button>
        </div>
      )}
    </div>

    {/* Modal backdrop */}
    <form method="dialog" className="modal-backdrop">
      <button onClick={closeModal}>close</button>
    </form>
  </dialog>
)
}

export default ClubRegistration
