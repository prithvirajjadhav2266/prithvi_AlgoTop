import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { WalletProvider, WalletManager, WalletId } from '@txnlab/use-wallet-react'
import App from './App'
import './styles/main.css'

const Main = () => {
  const walletManager = useMemo(
    () =>
      new WalletManager({
        wallets: [
          {
            id: WalletId.PERA,
            options: { shouldShowSignTxnToast: false }
          }
        ],
        defaultNetwork: import.meta.env.VITE_ALGOD_NETWORK || 'localnet',
      }),
    [],
  )

  return (
    <React.StrictMode>
      <WalletProvider manager={walletManager}>
        <App />
      </WalletProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Main />)
