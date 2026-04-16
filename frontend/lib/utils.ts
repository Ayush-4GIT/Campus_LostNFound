export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const getImageUrl = (path?: string | null): string => {
  if (!path) return '/placeholder-item.svg';
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${path}`;
};

export const getInitials = (name: string): string => {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const categoryLabel: Record<string, string> = {
  electronics: 'Electronics',
  clothing:    'Clothing',
  documents:   'Documents / ID',
  books:       'Books',
  accessories: 'Accessories',
  other:       'Other',
};

export const locationOptions = [
  'Library', 'Hostel A', 'Hostel B', 'Cafeteria',
  'Main Gate', 'Sports Complex', 'Admin Block',
  'Lab Block', 'Auditorium', 'Parking Lot', 'Other',
];
