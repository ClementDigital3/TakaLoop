export const formatKES = (amount) => `KES ${Number(amount || 0).toLocaleString()}`;
export const formatPoints = (pts) => `${Number(pts || 0).toLocaleString()} pts`;
export const formatKg = (kg) => `${Number(kg || 0).toFixed(1)} kg`;
export const formatCO2 = (kg) => kg >= 1000 ? `${(kg/1000).toFixed(2)} tonnes` : `${Number(kg||0).toFixed(1)} kg`;

export const WASTE_CATEGORIES = [
  { value: 'plastics', label: 'Plastics', emoji: '♻️', subcategories: ['PET','HDPE','PVC','LDPE','Mixed'] },
  { value: 'metals', label: 'Metals', emoji: '🔩', subcategories: ['Aluminum','Steel','Copper','Iron','Mixed'] },
  { value: 'paper', label: 'Paper & Cardboard', emoji: '📦', subcategories: ['Cardboard','Newsprint','Office Paper','Mixed'] },
  { value: 'ewaste', label: 'E-Waste', emoji: '💻', subcategories: ['Phones','Computers','Cables','Batteries','Mixed'] },
  { value: 'organics', label: 'Organics', emoji: '🌱', subcategories: ['Food Waste','Agricultural','Garden Waste'] },
  { value: 'hazardous', label: 'Hazardous', emoji: '⚠️', subcategories: ['Chemicals','Medical','Batteries','Paints'] },
  { value: 'textiles', label: 'Textiles', emoji: '👗', subcategories: ['Clothing','Fabric Offcuts','Industrial Textile'] },
  { value: 'glass', label: 'Glass', emoji: '🍾', subcategories: ['Bottles','Flat Glass','Mixed'] },
  { value: 'rubber', label: 'Rubber', emoji: '🔄', subcategories: ['Tyres','Industrial Rubber'] },
  { value: 'other', label: 'Other', emoji: '🗑️', subcategories: ['Mixed','Construction Waste'] },
];

export const KENYAN_COUNTIES = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Uasin Gishu','Thika','Malindi',
  'Kitale','Garissa','Kakamega','Nyeri','Meru','Embu','Machakos',
  'Kericho','Kisii','Kilifi','Lamu','Mandera','Wajir','Trans Nzoia',
  'Nandi','Siaya','Homa Bay','Migori','Bomet','Narok','Kajiado',
  'Kiambu','Murangá','Kirinyaga','Laikipia','Samburu','Isiolo','Marsabit',
  'Turkana','West Pokot','Baringo','Elgeyo Marakwet','Nyandarua','Nyamira',
  'Vihiga','Bungoma','Busia','Kwale','Taita Taveta','Makueni','Kitui'
];

export const ROLES = {
  citizen: { label: 'Citizen', color: 'green', desc: 'Report dumps, earn TakaPoints' },
  collector: { label: 'Collector', color: 'blue', desc: 'Collect and sell waste' },
  business: { label: 'Business', color: 'purple', desc: 'Buy waste, get AI audits' },
  recycler: { label: 'Recycler', color: 'yellow', desc: 'Process and upcycle waste' },
  county_officer: { label: 'County Officer', color: 'orange', desc: 'Manage reports and collection points' },
  admin: { label: 'Admin', color: 'red', desc: 'Platform administration' },
};

export const STATUS_COLORS = {
  active: 'green', reserved: 'yellow', sold: 'blue', cancelled: 'red',
  pending: 'yellow', processing: 'blue', completed: 'green', failed: 'red',
  escrow: 'purple', disputed: 'orange', refunded: 'gray',
  verified: 'green', assigned: 'blue', in_progress: 'yellow', resolved: 'green', rejected: 'red'
};
