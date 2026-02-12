import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo } from 'react'
import { ellipseAddress } from '../utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

const Account = () => {
  const { activeAddress } = useWallet()
  const algoConfig = getAlgodConfigFromViteEnvironment()

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLocaleLowerCase()
  }, [algoConfig.network])

  return (
    <div className="flex flex-col gap-2 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200/50">
      <a 
        className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors line-clamp-1" 
        target="_blank" 
        href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}
        title={activeAddress || ''}
      >
        👛 {ellipseAddress(activeAddress)}
      </a>
      <div className="text-xs text-neutral/60 font-medium">
        🌐 {networkName.charAt(0).toUpperCase() + networkName.slice(1)}
      </div>
    </div>
  )
}

export default Account
