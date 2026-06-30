require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const WasteListing = require('./models/WasteListing');
const CollectionPoint = require('./models/CollectionPoint');
const MarketPrice = require('./models/MarketPrice');
const DumpReport = require('./models/DumpReport');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/takaloop';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany(), WasteListing.deleteMany(), CollectionPoint.deleteMany(), MarketPrice.deleteMany(), DumpReport.deleteMany()]);
  console.log('Cleared existing data');

  // Create admin
  const admin = await User.create({ name:'TakaLoop Admin', email:'admin@takaloop.ke', phone:'+254700000000', password:'Admin@2024!', role:'admin', ward:'CBD', county:'Nairobi', isVerified:true, qrCode: await QRCode.toDataURL(`TAKA-${uuidv4()}`) });

  // Create citizen
  const citizen = await User.create({ name:'Jane Wanjiru', email:'citizen@demo.com', phone:'+254701234567', password:'Admin@2024!', role:'citizen', ward:'Westlands', county:'Nairobi', points:350, totalWasteKg:45, isVerified:true, qrCode: await QRCode.toDataURL(`TAKA-${uuidv4()}`) });

  // Create collector
  const collector = await User.create({ name:'Peter Kamau Recyclers', email:'collector@demo.com', phone:'+254712345678', password:'Admin@2024!', role:'collector', businessName:'Kamau Recyclers', ward:'Industrial Area', county:'Nairobi', isVerified:true, qrCode: await QRCode.toDataURL(`TAKA-${uuidv4()}`) });

  // Create business
  const business = await User.create({ name:'GreenPack Kenya', email:'business@demo.com', phone:'+254723456789', password:'Admin@2024!', role:'business', businessName:'GreenPack Kenya Ltd', ward:'Kilimani', county:'Nairobi', isVerified:true, qrCode: await QRCode.toDataURL(`TAKA-${uuidv4()}`) });

  // Create recycler
  const recycler = await User.create({ name:'EcoCycle Solutions', email:'recycler@demo.com', phone:'+254745678901', password:'Admin@2024!', role:'recycler', businessName:'EcoCycle Solutions Ltd', ward:'Industrial Area', county:'Nairobi', isVerified:true, qrCode: await QRCode.toDataURL(`TAKA-${uuidv4()}`) });

  // Create officer
  const officer = await User.create({ name:'Officer Otieno', email:'officer@demo.com', phone:'+254734567890', password:'Admin@2024!', role:'officer', ward:'Westlands', county:'Nairobi', isVerified:true, qrCode: await QRCode.toDataURL(`TAKA-${uuidv4()}`) });

  console.log('Users created');

  // Market prices
  const priceData = [
    { wasteCategory:'plastics', grade:'A', pricePerKg:35, setBy:admin._id },
    { wasteCategory:'plastics', grade:'B', pricePerKg:22, setBy:admin._id },
    { wasteCategory:'plastics', grade:'C', pricePerKg:12, setBy:admin._id },
    { wasteCategory:'metals', grade:'A', pricePerKg:55, setBy:admin._id },
    { wasteCategory:'metals', grade:'B', pricePerKg:40, setBy:admin._id },
    { wasteCategory:'paper', grade:'A', pricePerKg:18, setBy:admin._id },
    { wasteCategory:'paper', grade:'B', pricePerKg:10, setBy:admin._id },
    { wasteCategory:'ewaste', grade:'A', pricePerKg:120, setBy:admin._id },
    { wasteCategory:'glass', grade:'B', pricePerKg:8, setBy:admin._id },
    { wasteCategory:'organics', grade:'A', pricePerKg:5, setBy:admin._id },
  ];
  await MarketPrice.insertMany(priceData);
  console.log('Market prices seeded');

  // Collection points
  await CollectionPoint.create([
    { name:'Westlands Eco Drop', location:{ address:'Westlands Shopping Centre, Nairobi', ward:'Westlands', county:'Nairobi', coordinates:[36.8072,-1.2697] }, officer:officer._id, acceptedWasteTypes:['plastics','paper','glass','metals'], operatingHours:'Mon-Sat 7am-6pm', capacity:2000, currentLoad:430, isActive:true, qrCode: await QRCode.toDataURL(`CP-${uuidv4()}`) },
    { name:'Industrial Area Recycling Hub', location:{ address:'Enterprise Road, Industrial Area', ward:'Industrial Area', county:'Nairobi', coordinates:[36.8488,-1.3092] }, officer:officer._id, acceptedWasteTypes:['metals','ewaste','plastics','rubber'], operatingHours:'Mon-Fri 8am-5pm', capacity:5000, currentLoad:1200, isActive:true, qrCode: await QRCode.toDataURL(`CP-${uuidv4()}`) },
    { name:'CBD Eco Point', location:{ address:'Tom Mboya Street, Nairobi CBD', ward:'CBD', county:'Nairobi', coordinates:[36.8237,-1.2833] }, officer:officer._id, acceptedWasteTypes:['plastics','paper','organics'], operatingHours:'Mon-Sat 8am-7pm', capacity:1000, currentLoad:210, isActive:true, qrCode: await QRCode.toDataURL(`CP-${uuidv4()}`) },
  ]);
  console.log('Collection points seeded');

  // Waste listings
  await WasteListing.create([
    { seller:collector._id, title:'Clean PET Plastic Bottles - Westlands Collection', wasteCategory:'plastics', wasteSubtype:'PET', grade:'A', quantity:500, unit:'kg', pricePerUnit:33, description:'Freshly collected, cleaned and sorted PET bottles from Westlands restaurants and hotels. Ready for immediate pickup.', location:{ address:'Industrial Area, Nairobi', county:'Nairobi', ward:'Industrial Area', coordinates:[36.8488,-1.3092] }, status:'available', carbonOffset:750 },
    { seller:collector._id, title:'Scrap Aluminum Cans - Grade B', wasteCategory:'metals', wasteSubtype:'Aluminum', grade:'B', quantity:200, unit:'kg', pricePerUnit:38, description:'Mixed aluminum cans from various collection points. Slight contamination, priced accordingly.', location:{ address:'Gikomba Market, Nairobi', county:'Nairobi', ward:'Gikomba', coordinates:[36.8383,-1.2889] }, status:'available', carbonOffset:420 },
    { seller:business._id, title:'Office Paper & Cardboard Offcuts', wasteCategory:'paper', wasteSubtype:'Cardboard', grade:'A', quantity:800, unit:'kg', pricePerUnit:16, description:'Clean office paper and cardboard from our packaging operations. Bundled and ready for pulping. Regular supply available.', location:{ address:'Kilimani Business Park, Nairobi', county:'Nairobi', ward:'Kilimani', coordinates:[36.7987,-1.2914] }, status:'available', carbonOffset:640 },
    { seller:collector._id, title:'E-Waste Collection — Phones & Laptops', wasteCategory:'ewaste', wasteSubtype:'Mixed Electronics', grade:'B', quantity:50, unit:'kg', pricePerUnit:100, description:'Mobile phones, laptops, and circuit boards collected from offices. All data wiped. Certified collection.', location:{ address:'Ngong Road, Nairobi', county:'Nairobi', ward:'Kilimani', coordinates:[36.7805,-1.3015] }, status:'available', carbonOffset:160 },
    { seller:business._id, title:'Glass Bottles - Restaurant Surplus', wasteCategory:'glass', wasteSubtype:'Bottles', grade:'B', quantity:300, unit:'kg', pricePerUnit:7, description:'Used glass bottles from restaurants along Westlands strip. Mixed sizes, cleaned.', location:{ address:'Westlands, Nairobi', county:'Nairobi', ward:'Westlands', coordinates:[36.8072,-1.2697] }, status:'available', carbonOffset:180 },
    { seller:collector._id, title:'Organic Compost Material - Market Waste', wasteCategory:'organics', grade:'A', quantity:2000, unit:'kg', pricePerUnit:4, description:'Vegetable and fruit waste from Wakulima Market. Daily availability. Good for biogas or composting operations.', location:{ address:'Wakulima Market, Nairobi', county:'Nairobi', ward:'CBD', coordinates:[36.8237,-1.2833] }, status:'available', carbonOffset:1000 },
  ]);
  console.log('Waste listings seeded');

  // Dump reports
  await DumpReport.create([
    { reporter:citizen._id, title:'Large Plastic Dump Near Karura Forest', description:'Massive illegal dump of plastic waste near the entrance of Karura Forest. Estimates 2+ tonnes. Has been there for over a month.', photos:[], location:{ address:'Karura Forest Road, Runda', ward:'Runda', county:'Nairobi', coordinates:[36.8167,-1.2354] }, wasteTypes:['plastics','other'], severity:'high', status:'pending', upvotes:[] },
    { reporter:citizen._id, title:'Burning Waste Near Kibera', description:'People burning mixed waste including plastics near Kibera Drive. Creates toxic smoke. Children in nearby school at risk.', photos:[], location:{ address:'Kibera Drive, Kibera', ward:'Kibera', county:'Nairobi', coordinates:[36.7842,-1.3118] }, wasteTypes:['plastics','hazardous'], severity:'critical', status:'assigned', assignedOfficer:officer._id, upvotes:[] },
    { reporter:citizen._id, title:'E-Waste Dumped Along Ngong Road', description:'Old electronics including TVs, computers dumped on the roadside near Adams Arcade. Has toxic components.', photos:[], location:{ address:'Ngong Road near Adams Arcade', ward:'Kilimani', county:'Nairobi', coordinates:[36.7805,-1.3015] }, wasteTypes:['ewaste'], severity:'medium', status:'resolved', assignedOfficer:officer._id, resolvedAt:new Date(), pointsReleased:true, upvotes:[] },
  ]);
  console.log('Dump reports seeded');

  console.log('\n✅ Seed complete!\n');
  console.log('Demo Accounts:');
  console.log('  Admin:    admin@takaloop.ke    / Admin@2024!');
  console.log('  Citizen:  citizen@demo.com     / Admin@2024!');
  console.log('  Collector:collector@demo.com   / Admin@2024!');
  console.log('  Business: business@demo.com    / Admin@2024!');
  console.log('  Recycler: recycler@demo.com    / Admin@2024!');
  console.log('  Officer:  officer@demo.com     / Admin@2024!');

  mongoose.disconnect();
};

seed().catch(err => { console.error('Seed error:', err); mongoose.disconnect(); });
