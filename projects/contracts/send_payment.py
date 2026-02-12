#!/usr/bin/env python3
"""Send ALGOs from dispenser to target account on localnet"""

from algosdk.v2client import algod
from algosdk import transaction, account, mnemonic
from algosdk.atomic_transaction_composer import AtomicTransactionComposer, AccountTransactionSigner
import json

# Localnet configuration
ALGOD_ADDRESS = "http://localhost:4001"
ALGOD_TOKEN = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

# Account details
DISPENSER_ADDRESS = "RCMRCAFDZDCGYQKEHSP7VGW6DBB5FAICOFLEHPIVQNI3HVZWNE3CCWW4TY"
DISPENSER_MNEMONIC = "legacy nerve ladder alter error federal sibling chat ability sun glass valve dissemble context religious beneath surface farm let olive fiscal combine evolve inject"

TARGET_ADDRESS = "JIHHW5UA2MAGG5TBVF3E5I5ZYVBBKCFXSY1GFF5CZ87M51KJKY53RSACCM"
AMOUNT_ALGO = 1000

try:
    # Initialize client
    client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)
    
    # Get suggested params
    params = client.suggested_params()
    
    # Create payment transaction
    amount_microalgos = int(AMOUNT_ALGO * 1_000_000)
    
    txn = transaction.PaymentTxn(
        sender=DISPENSER_ADDRESS,
        sp=params,
        receiver=TARGET_ADDRESS,
        amt=amount_microalgos,
    )
    
    # Sign transaction with mnemonic
    private_key = mnemonic.to_private_key(DISPENSER_MNEMONIC)
    signed_txn = txn.sign(private_key)
    
    # Submit transaction
    tx_id = client.send_transaction(signed_txn)
    
    # Wait for confirmation
    import time
    max_rounds = 10
    round_num = 0
    
    print(f"Sending {AMOUNT_ALGO} ALGO to {TARGET_ADDRESS}...")
    print(f"Transaction ID: {tx_id}")
    
    while round_num < max_rounds:
        try:
            pending_txn = client.pending_transaction_info(tx_id)
            if 'confirmed-round' in pending_txn:
                print(f"✅ Transaction confirmed in round {pending_txn['confirmed-round']}")
                print(f"✅ Account {TARGET_ADDRESS} now has {AMOUNT_ALGO} ALGO!")
                break
        except Exception:
            pass
        
        round_num += 1
        time.sleep(1)
    
    if round_num >= max_rounds:
        print(f"⏱️  Transaction pending... Check status with ID: {tx_id}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
