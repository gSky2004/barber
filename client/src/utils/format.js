export function formatTZS(amount) {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-TZ', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const SERVICE_CATEGORIES = {
  barber: 'Barbershop',
  gaming: 'Gaming Station',
  repair: 'Repair Center',
  phone: 'Phone Accessories',
  electrical: 'Electrical Accessories',
  digital: 'Digital Support',
};

export const BOOKING_SERVICES = [
  { value: 'haircut', label: 'Haircut' },
  { value: 'beard', label: 'Beard Trim' },
  { value: 'styling', label: 'Styling' },
  { value: 'shave', label: 'Shave' },
];

export const GAMING_DURATIONS = [
  { value: '1', label: '1 hour' },
  { value: '2', label: '2 hours' },
  { value: '3', label: '3 hours' },
  { value: '4', label: '4 hours' },
];
