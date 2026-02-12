import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo, useEffect } from 'react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgoSphereClient, AlgoSphereFactory } from '../contracts/AlgoSphere'

export const useAlgoSphereClient = () => {
    const { activeAddress, transactionSigner } = useWallet()
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const algorand = useMemo(() => AlgorandClient.fromConfig({ algodConfig }), [algodConfig])
    const appId = parseInt(import.meta.env.VITE_ALGOSPHERE_APP_ID ?? '0')

    useEffect(() => {
        algorand.setDefaultSigner(transactionSigner)
    }, [algorand, transactionSigner])

    const client = useMemo(() => {
        const factory = new AlgoSphereFactory({
            algorand,
            defaultSender: activeAddress || undefined,
        })
        return factory.getAppClientById({ appId: BigInt(appId) })
    }, [activeAddress, transactionSigner, algorand, appId])

    return { client, appId, algorand, activeAddress, transactionSigner }
}
