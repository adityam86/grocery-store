import { Sparkles, Wheat, Flame, Milk, Coffee, Cookie } from 'lucide-react';

export const CATEGORIES_LIST = [
  { id: 'all', name: 'All Products', icon: Sparkles },
  { id: 'staples', name: 'Staples & Grains', icon: Wheat },
  { id: 'spices', name: 'Spices & Masalas', icon: Flame },
  { id: 'dairy', name: 'Fresh & Dairy', icon: Milk },
  { id: 'snacks', name: 'Sweets & Snacks', icon: Cookie },
  { id: 'beverages', name: 'Beverages', icon: Coffee },
];

export const CATEGORY_GROUPS = [
  {
    groupName: 'Pantry Essentials',
    hindiGroup: 'रसोई सामग्री',
    categories: [
      { id: 'staples', name: 'Staples & Grains', icon: Wheat, subtitle: 'Atta, Rice, Dals' },
      { id: 'spices', name: 'Spices & Masalas', icon: Flame, subtitle: 'Garam Masala, Haldi' },
    ],
  },
  {
    groupName: 'Fresh & Chilled',
    hindiGroup: 'ताज़ा उत्पाद',
    categories: [
      { id: 'dairy', name: 'Fresh & Dairy', icon: Milk, subtitle: 'Paneer, Dahi, Ghee' },
    ],
  },
  {
    groupName: 'Snacks & Drinks',
    hindiGroup: 'चाय और नाश्ता',
    categories: [
      { id: 'snacks', name: 'Sweets & Snacks', icon: Cookie, subtitle: 'Aloo Bhujia, Biscuits' },
      { id: 'beverages', name: 'Beverages', icon: Coffee, subtitle: 'Chai Leaf, Coffee' },
    ],
  },
];

export const CATEGORY_EMOJI = {
  staples: '🌾',
  spices: '🌶️',
  dairy: '🥛',
  beverages: '☕',
  snacks: '🍪',
};
