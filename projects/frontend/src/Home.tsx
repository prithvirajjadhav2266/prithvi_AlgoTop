
import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import ConnectWallet from './components/ConnectWallet'
import ClubRegistration from './components/ClubRegistration'
import CreateEvent from './components/CreateEvent'
import Hero from './components/Hero'
import EventList from './components/EventList'
import MyTickets from './components/MyTickets'
import ClubDashboard from './components/ClubDashboard'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import EventCard from './components/EventCard'
import { useAlgoSphereClient } from './hooks/useAlgoSphereClient'
import { DEMO_EVENTS } from './data/demoEvents'

export default function Home() {
  // Get currently connected wallet address from context
  const { activeAddress } = useWallet()
  
  // Modal state management for club registration and event creation dialogs
  const [isClubRegistrationOpen, setIsClubRegistrationOpen] = useState(false)
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  
  // Tab state to manage which view is displayed (events, tickets, club dashboard, or analytics)
  const [activeTab, setActiveTab] = useState<'events' | 'mytickets' | 'club' | 'analytics'>('events')
  
  // Retrieve smart contract app ID from environment - required for all contract interactions
  const { appId } = useAlgoSphereClient()

  // Toggle handlers for modal dialogs
  const toggleClubRegistration = () => {
    setIsClubRegistrationOpen(!isClubRegistrationOpen)
  }

  const toggleCreateEvent = () => {
    setIsCreateEventOpen(!isCreateEventOpen)
  }

  // Validate smart contract is deployed before rendering the app
  if (!appId) {
    return (
      <div className="min-h-screen hero bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-error">Configuration Error</h1>
            <p className="py-6">
              The AlgoSphere App ID is missing. Please ensure <code>VITE_ALGOSPHERE_APP_ID</code> is set in your .env file.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 font-sans">
      {/* Navigation Bar */}
      <div className="navbar bg-white shadow-md px-4 sm:px-8 border-b border-blue-200/50">
        <div className="flex-1">
          {/* Brand Logo */}
          <a className="btn btn-ghost normal-case text-xl text-blue-600 font-bold tracking-tighter">
            � AlgoSphere
          </a>
        </div>
        
        {/* Navigation Tabs and Actions */}
        <div className="flex-none gap-2">
          {/* Tab Navigation Buttons */}
          <button 
            className="btn btn-sm btn-ghost text-neutral hover:text-blue-600" 
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button 
            className="btn btn-sm btn-ghost text-neutral hover:text-blue-600" 
            onClick={() => setActiveTab('mytickets')}
          >
            My Tickets
          </button>
          <button 
            className="btn btn-sm btn-ghost text-neutral hover:text-blue-600" 
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          
          {/* Club Actions Dropdown Menu */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-sm btn-outline btn-primary m-1">Club Actions</label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a onClick={() => setActiveTab('club')}>Dashboard</a></li>
              <li><a onClick={toggleClubRegistration}>Register Club</a></li>
              <li><a onClick={toggleCreateEvent}>Create Event</a></li>
            </ul>
          </div>
          
          {/* Wallet Connection Button */}
          <ConnectWallet />
        </div>
      </div>

      {/* Hero Section - Only displayed on Events tab */}
      {activeTab === 'events' && (
        <Hero onStartClub={toggleClubRegistration} />
      )}

      {/* Main Content Area */}
      <main className="min-h-screen bg-gradient-tech">
        <div className="container mx-auto p-4 sm:p-8">
          {/* Events Tab - Display event listings and marketplace */}
          {activeTab === 'events' && (
            <div className="space-y-16">
              {/* Demo Events Section */}
              <div id="events">
                <div className="mb-4">
                  <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent mb-2">
                    🎓 Upcoming Campus Events
                  </h2>
                  <p className="text-neutral/70 text-lg">Discover and register for amazing events happening on campus</p>
                </div>

                {/* Demo Events Grid - For showcase/testing purposes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {DEMO_EVENTS.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>

              {/* On-Chain Events Section - Events created via smart contract */}
              <div className="mt-16">
                <h2 className="text-3xl font-bold mb-6 border-b-4 border-blue-500 inline-block pb-2 text-neutral">
                  Community Created Events
                </h2>
                <EventList />
              </div>
            </div>
          )}

          {/* My Tickets Tab - Show user's purchased tickets */}
          {activeTab === 'mytickets' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 border-b-4 border-emerald-500 inline-block pb-2">My Wallet</h2>
              <MyTickets />
            </div>
          )}

          {/* Analytics Tab - Platform statistics and insights */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {/* Club Dashboard Tab - Club management interface */}
          {activeTab === 'club' && (
            <div>
              <ClubDashboard />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-6 bg-white border-t border-blue-200/50 text-neutral/70">
        <div>
          <p className="font-semibold text-neutral">AlgoSphere © 2026</p>
          <p className="text-sm">Decentralized Event Ticketing on Algorand</p>
        </div>
      </footer>

      {/* Modal Dialogs */}
      <ClubRegistration
        openModal={isClubRegistrationOpen}
        closeModal={toggleClubRegistration}
      />

      <CreateEvent
        openModal={isCreateEventOpen}
        closeModal={toggleCreateEvent}
        onEventCreated={() => {
          setIsCreateEventOpen(false)
          // Optionally refresh event list here
        }}
      />
    </div>
  )
}
