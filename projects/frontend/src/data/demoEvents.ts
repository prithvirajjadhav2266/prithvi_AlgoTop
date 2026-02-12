export interface Event {
  id: number
  title: string
  club: string
  date: string
  location: string
  price: number
  icon: string
  eventDate: number
}

export const DEMO_EVENTS: Event[] = [
  {
    id: 1,
    title: 'MLSC Club Hackathon: Hexpiration 2026',
    club: 'MLSC Club',
    date: 'Feb 28, 2026',
    location: 'Tech Lab, Building A',
    price: 2,
    icon: '💻',
    eventDate: Math.floor(new Date('2026-02-28').getTime() / 1000),
  },
  {
    id: 2,
    title: 'Earn & Sell: Campus Creators Market',
    club: 'Entrepreneurship Club',
    date: 'Mar 5, 2026',
    location: 'Student Center, Hall B',
    price: 1,
    icon: '🎨',
    eventDate: Math.floor(new Date('2026-03-05').getTime() / 1000),
  },
  {
    id: 3,
    title: 'DSA Bootcamp by GDSC',
    club: 'Google Developer Student Club',
    date: 'Mar 12, 2026',
    location: 'Computer Lab, Block C',
    price: 3,
    icon: '📊',
    eventDate: Math.floor(new Date('2026-03-12').getTime() / 1000),
  },
  {
    id: 4,
    title: 'NFT Art Battle – Fine Arts Club',
    club: 'Fine Arts Club',
    date: 'Mar 20, 2026',
    location: 'Art Gallery, East Wing',
    price: 2,
    icon: '🖼️',
    eventDate: Math.floor(new Date('2026-03-20').getTime() / 1000),
  },
  {
    id: 5,
    title: 'Blockchain Basics for Freshers',
    club: 'Crypto & Blockchain Club',
    date: 'Mar 25, 2026',
    location: 'Auditorium, Main Campus',
    price: 1,
    icon: '⛓️',
    eventDate: Math.floor(new Date('2026-03-25').getTime() / 1000),
  },
]
