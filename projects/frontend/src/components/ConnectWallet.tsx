import { useState } from 'react'
import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'

const ConnectWallet = () => {
  const { wallets, activeAddress } = useWallet()
  const [openModal, setOpenModal] = useState(false)

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  const toggleModal = () => setOpenModal(!openModal)

  return (
    <>
      {/* Connect/Account Button */}
      {!activeAddress ? (
        <button 
          className="btn btn-primary btn-sm text-white font-bold bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 border-0"
          onClick={toggleModal}
          data-test-id="connect-wallet"
        >
          🔗 Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Account />
          <button 
            className="btn btn-sm btn-outline border-blue-300 text-blue-600 hover:bg-blue-50"
            onClick={toggleModal}
          >
            Manage
          </button>
        </div>
      )}

      {/* Wallet Modal */}
      <dialog id="connect_wallet_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
        <form method="dialog" className="modal-box max-w-sm bg-white border border-blue-200/50">
          <h3 className="font-bold text-2xl mb-6 text-neutral bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            {activeAddress ? '👛 Manage Wallet' : '🔗 Select Wallet Provider'}
          </h3>

          <div className="space-y-3 mb-6">
            {activeAddress && (
              <>
                <Account />
                <div className="divider my-4" />
              </>
            )}

            {!activeAddress &&
              wallets?.map((wallet: Wallet) => (
                <button
                  data-test-id={`${wallet.id}-connect`}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200/50 hover:border-blue-400/75 hover:shadow-md transition-all flex items-center gap-3 font-semibold text-neutral"
                  key={`provider-${wallet.id}`}
                  onClick={() => {
                    wallet.connect()
                    toggleModal()
                  }}
                >
                  {!isKmd(wallet) && (
                    <img
                      alt={`wallet_icon_${wallet.id}`}
                      src={wallet.metadata.icon}
                      style={{ objectFit: 'contain', width: '24px', height: 'auto' }}
                    />
                  )}
                  <span>{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
                </button>
              ))}
          </div>

          <div className="modal-action gap-3">
            <button
              data-test-id="close-wallet-modal"
              className="btn btn-outline border-blue-300 text-neutral hover:bg-blue-50"
              onClick={toggleModal}
            >
              Close
            </button>
            {activeAddress && (
              <button
                className="btn btn-error text-white"
                data-test-id="logout"
                onClick={async () => {
                  if (wallets) {
                    const activeWallet = wallets.find((w: Wallet) => w.isActive)
                    if (activeWallet) {
                      await activeWallet.disconnect()
                    } else {
                      localStorage.removeItem('@txnlab/use-wallet:v3')
                      window.location.reload()
                    }
                  }
                  toggleModal()
                }}
              >
                Logout
              </button>
            )}
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button onClick={toggleModal}>close</button>
        </form>
      </dialog>
    </>
  )
}
export default ConnectWallet
