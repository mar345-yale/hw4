// Curated collections matched against product names, so links like
// /products?collection=family land on the right items.
export interface Collection {
  slug: string
  title: string
  body: string
  terms: string[]
}

export const COLLECTIONS: Collection[] = [
  {
    slug: 'residential-colleges',
    title: 'Your Residential College',
    body: 'Berkeley to Timothy Dwight: rep the college that became your home.',
    terms: [
      'benjamin franklin', 'berkeley', 'branford', 'davenport', 'ezra stiles', 'grace hopper',
      'jonathan edwards', 'morse', 'pauli murray', 'pierson', 'saybrook', 'silliman',
      'timothy dwight', 'trumbull',
    ],
  },
  {
    slug: 'athletics',
    title: 'Bulldog Athletics',
    body: 'From the football stands to the squash courts, we stock gear for 20+ Yale sports.',
    terms: [
      'sports', 'football', 'baseball', 'basketball', 'hockey', 'soccer', 'tennis', 'golf',
      'lacrosse', 'sailing', 'squash', 'track', 'diving', 'swim', 'rowing', 'volleyball',
      'softball', 'fencing', 'yale vs harvard',
    ],
  },
  {
    slug: 'family',
    title: 'The Yale Family',
    body: 'Mom, Dad, Grandpa, Brother, Uncle. Everyone gets to show they’re proud.',
    terms: ['mom', 'dad', 'grandpa', 'grandma', 'aunt', 'uncle', 'brother', 'sister'],
  },
  {
    slug: 'schools',
    title: 'Graduate & Professional Schools',
    body: 'Law, Art, Music, Architecture, Engineering, Public Health, and more.',
    terms: ['school'],
  },
]

export function inCollection(name: string, collection: Collection) {
  const words = ` ${name.toLowerCase()} `
  return collection.terms.some((t) => words.includes(` ${t} `))
}
