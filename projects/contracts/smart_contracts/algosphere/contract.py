"""
AlgoSphere Smart Contract
Decentralized event ticketing platform for Algorand.
Handles club registration, event creation, ticket sales (as ASAs), and verification.
"""

from algopy import (
    ARC4Contract,
    Account,
    BoxMap,
    Global,
    String,
    UInt64,
    Txn,
    gtxn,
    itxn,
    op,
    Bytes,
)
from algopy.arc4 import abimethod, Bool


class AlgoSphere(ARC4Contract):
    """
    AlgoSphere: Main contract for decentralized event ticketing on Algorand.
    
    This contract manages:
    - Organization registration and verification
    - Event creation with ticket minting as ASAs (Algorand Standard Assets)
    - Ticket purchasing and transfers
    - Ticket verification for check-in and attendance tracking
    
    Storage uses BoxMaps for efficient on-chain data management and scalability.
    """

    def __init__(self) -> None:
        """
        Initialize contract state with BoxMaps for persistent storage.
        Each BoxMap uses a key prefix for efficient lookups and management.
        """
        # Club management: Maps club wallet address → club name (Bytes)
        self.club_names = BoxMap(Account, Bytes, key_prefix=b"c")
        
        # Event management: Multiple maps indexed by event_id (UInt64)
        self.event_clubs = BoxMap(UInt64, Account, key_prefix=b"ec")    # The club owner/creator
        self.event_names = BoxMap(UInt64, Bytes, key_prefix=b"en")      # Event name
        self.event_venues = BoxMap(UInt64, Bytes, key_prefix=b"ev")     # Event location
        self.event_dates = BoxMap(UInt64, UInt64, key_prefix=b"ed")     # Event timestamp (Unix)
        self.event_prices = BoxMap(UInt64, UInt64, key_prefix=b"ep")    # Ticket price in microALGOs
        self.event_total = BoxMap(UInt64, UInt64, key_prefix=b"et")     # Total tickets available
        self.event_sold = BoxMap(UInt64, UInt64, key_prefix=b"es")      # Tickets sold/distributed so far
        self.event_assets = BoxMap(UInt64, UInt64, key_prefix=b"ea")    # ASA ID of the ticket NFT
        
        # Global counter for generating unique event IDs
        self.event_counter = UInt64(0)

    @abimethod()
    def register_club(self, club_name: String, contact: String) -> String:
        """
        Register a new club organization on-chain.
        Each club can only register once. Contact info can be stored off-chain via IPFS/Pinata.
        
        Args:
            club_name: Official name of the club (e.g., "Tech Club", "Robotics Society")
            contact: Contact information (email, telegram handle, etc.) - stored off-chain recommended
            
        Returns:
            Success message confirming registration
            
        Raises:
            Assertion Error: If the caller's address is already registered as a club
        """
        # Check if club already registered - prevent duplicate registrations
        existing_name, exists = self.club_names.maybe(Txn.sender)
        assert not exists, "Club already registered"
        
        # Store club name on-chain using the caller's address as key
        # Contact info can be stored off-chain or in a separate box if needed for privacy
        self.club_names[Txn.sender] = club_name.bytes
        
        return String("Club registered successfully")

    @abimethod()
    def create_event(
        self,
        event_name: String,
        venue: String,
        event_date: UInt64,
        ticket_price: UInt64,
        ticket_count: UInt64,
    ) -> UInt64:
        """
        Create a new ticketed event and mint ticket ASAs.
        Only registered clubs can create events. Each ticket is an NFT (ASA) on Algorand.
        
        Args:
            event_name: Official name of the event (e.g., "Tech Talk 2026")
            venue: Event location/venue name
            event_date: Unix timestamp of when the event occurs (must be in the future)
            ticket_price: Price per ticket in microALGOs (1 ALGO = 1,000,000 microALGOs)
            ticket_count: Total number of tickets to mint (max 10,000 per event)
            
        Returns:
            event_id: Unique on-chain identifier for this event (can be used to reference it)
            
        Raises:
            Assertion Error: If caller is not a registered club, parameters are invalid, or constraints are violated
        """
        # Access control: Only registered clubs can create events
        club_name_val, club_exists = self.club_names.maybe(Txn.sender)
        assert club_exists, "Only registered clubs can create events"
        
        # Input validation: Ensure all parameters meet business logic requirements
        assert event_date > Global.latest_timestamp, "Event must be scheduled for the future"
        assert ticket_price > 0, "Ticket price must be greater than 0"
        assert ticket_count > 0, "Must have at least 1 ticket available"
        assert ticket_count <= 10000, "Cannot create more than 10000 tickets per event (ASA limitation)"
        
        # Generate unique event ID by incrementing counter
        self.event_counter += UInt64(1)
        event_id = self.event_counter
        
        # Create ticket ASA (Algorand Standard Asset) - each ticket is an NFT
        ticket_asa = itxn.AssetConfig(
            total=ticket_count,
            decimals=0,  # Tickets are non-divisible
            default_frozen=False,
            unit_name=String("TKT"),
            asset_name=event_name,
            url=String("https://campus-tix.algo"),
            manager=Global.current_application_address,
            reserve=Global.current_application_address,
            freeze=Global.current_application_address,
            clawback=Global.current_application_address,
            fee=UInt64(15000),  # Increased fee for inner ASA creation transaction
        ).submit()
        
        ticket_asset_id = ticket_asa.created_asset.id
        
        # Store event information in separate boxes
        self.event_clubs[event_id] = Txn.sender
        self.event_names[event_id] = event_name.bytes
        self.event_venues[event_id] = venue.bytes
        self.event_dates[event_id] = event_date
        self.event_prices[event_id] = ticket_price
        self.event_total[event_id] = ticket_count
        self.event_sold[event_id] = UInt64(0)
        self.event_assets[event_id] = ticket_asset_id
        
        return event_id

    @abimethod()
    def buy_ticket(
        self,
        event_id: UInt64,
        payment: gtxn.PaymentTransaction,
    ) -> UInt64:
        """
        Purchase a ticket for an event via atomic transaction group.
        The buyer sends ALGO payment, and the contract transfers 1 ticket ASA to their wallet.
        Buyer must have already opted-in to the ticket ASA.
        
        Args:
            event_id: ID of the event to purchase a ticket for
            payment: Payment transaction (grouped with this call) containing ALGO from buyer
            
        Returns:
            ticket_asset_id: The ASA ID of the ticket that was transferred
            
        Raises:
            Assertion Error: If event doesn't exist, no tickets available, payment is incorrect, etc.
        """
        # Verify event exists in our storage
        club_owner, exists = self.event_clubs.maybe(event_id)
        assert exists, "Event not found"
        
        # Retrieve event details from storage - all events have these fields
        ticket_price, price_exists = self.event_prices.maybe(event_id)
        total_tickets, total_exists = self.event_total.maybe(event_id)
        sold_tickets, sold_exists = self.event_sold.maybe(event_id)
        ticket_asset_id, asset_exists = self.event_assets.maybe(event_id)
        
        # Business logic: Check ticket availability
        assert sold_tickets < total_tickets, "Event sold out - no tickets remaining"
        
        # Payment verification: Ensure the grouped payment matches our requirements
        assert payment.receiver == club_owner, "Payment must be sent to the event organizer (club)"
        assert payment.amount == ticket_price, "Payment amount must match ticket price exactly"
        assert payment.sender == Txn.sender, "Payment must come from ticket buyer"
        
        # Transfer 1 ticket ASA to the buyer from the contract's holding
        # Note: Buyer must have already opted-in to this ASA before calling this method
        itxn.AssetTransfer(
            xfer_asset=ticket_asset_id,
            asset_receiver=Txn.sender,
            asset_amount=1,
            sender=Global.current_application_address,
            fee=UInt64(2000),
        ).submit()
        
        # Update sold counter to track capacity and prevent double-selling
        self.event_sold[event_id] = sold_tickets + UInt64(1)
        
        return ticket_asset_id

    @abimethod(readonly=True)
    def verify_ticket(
        self,
        event_id: UInt64,
        attendee: Account,
    ) -> Bool:
        """
        Verify if an attendee owns a valid ticket for an event (used for check-in).
        This is a read-only query that checks the attendee's ASA balance for the ticket.
        
        Args:
            event_id: ID of the event to verify attendance for
            attendee: Wallet address of the person to check
            
        Returns:
            True if attendee owns at least 1 ticket for this event, False otherwise
            
        Raises:
            Assertion Error: If the event doesn't exist
        """
        # Get the ticket ASA ID for this event
        ticket_asset_id, exists = self.event_assets.maybe(event_id)
        assert exists, "Event not found"
        
        # Query the attendee's balance of the ticket ASA
        # Returns (balance, opted_in) tuple for the account's holding of this asset
        asset_balance, balance_exists = op.AssetHoldingGet.asset_balance(attendee, ticket_asset_id)
        
        # Return True if attendee has opted-in AND has at least 1 ticket
        # This enables efficient check-in at the event venue
        return Bool(balance_exists and asset_balance > 0)

    @abimethod(readonly=True)
    def get_event_details(
        self,
        event_id: UInt64,
    ) -> tuple[Bytes, Bytes, Bytes, UInt64, UInt64, UInt64, UInt64, UInt64]:
        """
        Retrieve all details about a specific event.
        Used by the frontend to display event information and check availability.
        
        Args:
            event_id: ID of the event to retrieve
            
        Returns:
            Tuple containing:
            - club_owner (Bytes): Wallet address of the event organizer
            - event_name (Bytes): Name of the event
            - venue (Bytes): Location/venue of the event
            - date (UInt64): Unix timestamp of event date/time
            - price (UInt64): Price per ticket in microALGOs
            - total (UInt64): Total tickets minted for this event
            - sold (UInt64): Number of tickets sold/distributed
            - asset_id (UInt64): ASA ID of the ticket NFT
            
        Raises:
            Assertion Error: If the event doesn't exist
        """
        # Retrieve club/organizer who created this event
        club_owner, exists = self.event_clubs.maybe(event_id)
        assert exists, "Event not found"
        
        # Retrieve all event metadata from storage boxes
        event_name, name_exists = self.event_names.maybe(event_id)
        venue, venue_exists = self.event_venues.maybe(event_id)
        date, date_exists = self.event_dates.maybe(event_id)
        price, price_exists = self.event_prices.maybe(event_id)
        total, total_exists = self.event_total.maybe(event_id)
        sold, sold_exists = self.event_sold.maybe(event_id)
        asset_id, asset_exists = self.event_assets.maybe(event_id)
        
        # Return all event data as tuple for frontend consumption
        return club_owner.bytes, event_name, venue, date, price, total, sold, asset_id

    @abimethod(readonly=True)
    def get_club_name(self, club_address: Bytes) -> Bytes:
        """
        Retrieve the registered name of a club by its wallet address.
        
        Args:
            club_address: Wallet address (bytes) of the club to look up
            
        Returns:
            Registered club name as bytes
            
        Raises:
            Assertion Error: If the address is not registered as a club
        """
        # Convert Bytes input to Account type for BoxMap lookup
        club_account = Account(club_address)
        club_name, exists = self.club_names.maybe(club_account)
        assert exists, "Club not registered"
        return club_name

    @abimethod(readonly=True)
    def get_total_events(self) -> UInt64:
        """
        Get the total number of events that have been created on-chain.
        This counter increments each time a club creates a new event.
        
        Returns:
            Total event count (includes all events regardless of status)
        """
        return self.event_counter

    @abimethod(readonly=True)
    def is_club_registered(self, club_address: Account) -> Bool:
        """
        Check if a given wallet address is registered as a club.
        Useful for UI validation before allowing event creation.
        
        Args:
            club_address: Wallet address to check
            
        Returns:
            True if the address is registered as a club, False otherwise
        """
        club_name_val, exists = self.club_names.maybe(club_address)
        return Bool(exists)
