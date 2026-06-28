export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export function getInitials(name: string): string {
  return name
    .split(/[\s._-]/)
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
];

export const fieldCls = (hasError: boolean, accent: 'blue' | 'indigo' = 'blue') =>
  [
    'w-full border rounded-lg px-4 py-2.5 text-sm text-gray-900',
    'placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition',
    hasError
      ? 'border-red-400 focus:ring-red-400'
      : accent === 'indigo'
        ? 'border-gray-300 focus:ring-indigo-600'
        : 'border-gray-300 focus:ring-blue-600',
  ].join(' ');

export const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

export const labelSmCls =
  'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';
