"""
Deployment configuration for AlgoSphere smart contract
"""

import logging
import algokit_utils

logger = logging.getLogger(__name__)


def deploy() -> None:
    """Deploy the AlgoSphere smart contract"""
    from smart_contracts.artifacts.algosphere.algosphere_client import (
        AlgoSphereFactory,
    )

    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer = algorand.account.from_environment("DEPLOYER")

    factory = algorand.client.get_typed_app_factory(
        AlgoSphereFactory, default_sender=deployer.address
    )

    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        # Fund the app account with some ALGO for inner transactions (ASA creation)
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=10),  # 10 ALGO for ASA creation fees
                sender=deployer.address,
                receiver=app_client.app_address,
            )
        )
        logger.info(
            f"✅ Deployed AlgoSphere app {app_client.app_id} to address {app_client.app_address}"
        )
        logger.info(f"🎯 APP_ID: {app_client.app_id}")
        logger.info(f"📍 App Address: {app_client.app_address}")
        print(f"✅ Deployed App ID: {app_client.app_id}")
        print(f"\n🔑 IMPORTANT: Set VITE_ALGOSPHERE_APP_ID={app_client.app_id} in your frontend/.env file\n")
