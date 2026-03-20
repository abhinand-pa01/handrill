export const SERVICES = [
  { id: 's1', name: 'Plumbing',         category: 'Repair',      description: 'Pipe repairs, leakage fixing, tap installations and bathroom plumbing', price: 599, durationMinutes: 60,  icon: 'Wrench',      color: '#3B82F6', rating: 4.7, totalBookings: 1240, active: true, features: ['Pipe repair','Tap installation','Drain cleaning','Water heater fix'] },
  { id: 's2', name: 'Electrical',        category: 'Repair',      description: 'Wiring, switchboard repair, fan and light installations',                price: 749, durationMinutes: 90,  icon: 'Zap',         color: '#F59E0B', rating: 4.8, totalBookings: 980,  active: true, features: ['Wiring repair','Switchboard fix','Fan installation','MCB replacement'] },
  { id: 's3', name: 'Cleaning',          category: 'Cleaning',    description: 'Deep home cleaning, kitchen scrubbing, bathroom sanitization',           price: 399, durationMinutes: 120, icon: 'Sparkles',    color: '#14B8A6', rating: 4.6, totalBookings: 2100, active: true, features: ['Deep cleaning','Kitchen scrub','Bathroom sanitize','Floor mopping'] },
  { id: 's4', name: 'AC Service',        category: 'Appliance',   description: 'AC cleaning, gas refilling, compressor repair and filter replacement',   price: 449, durationMinutes: 75,  icon: 'Wind',        color: '#8B5CF6', rating: 4.5, totalBookings: 760,  active: true, features: ['Filter cleaning','Gas refill','Compressor check','Coil cleaning'] },
  { id: 's5', name: 'Carpentry',         category: 'Repair',      description: 'Furniture repair, door fitting, cabinet installation',                    price: 499, durationMinutes: 90,  icon: 'Hammer',      color: '#D97706', rating: 4.4, totalBookings: 540,  active: true, features: ['Furniture repair','Door fitting','Cabinet work','Wood polish'] },
  { id: 's6', name: 'Painting',          category: 'Renovation',  description: 'Interior and exterior wall painting with premium finish',                 price: 749, durationMinutes: 180, icon: 'PaintBucket', color: '#EC4899', rating: 4.3, totalBookings: 430,  active: true, features: ['Wall painting','Texture finish','Primer coat','Touch-up work'] },
  { id: 's7', name: 'Pest Control',      category: 'Cleaning',    description: 'Termite, cockroach, mosquito and rat control treatment',                  price: 349, durationMinutes: 60,  icon: 'ShieldCheck', color: '#EF4444', rating: 4.6, totalBookings: 890,  active: true, features: ['Termite control','Cockroach spray','Mosquito fogging','Rat traps'] },
  { id: 's8', name: 'Appliance Repair',  category: 'Appliance',   description: 'Washing machine, refrigerator, microwave and TV repairs',                 price: 399, durationMinutes: 60,  icon: 'Settings',    color: '#10B981', rating: 4.5, totalBookings: 670,  active: true, features: ['Washing machine','Fridge repair','Microwave fix','TV repair'] },
];

export const KERALA_CITIES = [
  'Thrissur','Kochi','Thiruvananthapuram','Kozhikode','Kannur',
  'Kollam','Palakkad','Malappuram','Ernakulam','Alappuzha',
  'Kottayam','Idukki','Pathanamthitta','Wayanad','Kasaragod',
];

// Only the two demo accounts + admin
export const WORKERS = [
  {
    id: 'w7', name: 'Vinod Varma', email: 'worker@handrill.com', phone: '+91 98765 43216',
    role: 'WORKER', avatar: null, _password: 'demo123',
    profile: {
      online: true, location: 'Thrissur', experience: 7,
      bio: 'Multi-skilled technician. Handles electrical, plumbing and general repairs efficiently.',
      languages: 'Malayalam, English',
      idProof: true, averageRating: 4.7, totalJobsCompleted: 298, activeJobCount: 1,
      performanceScore: 91, workStartTime: '08:00', workEndTime: '20:00',
      specializations: ['s2','s8','s1'],
    },
  },
];

export const CUSTOMERS = [
  {
    id: 'c1', name: 'Arjun Pillai', email: 'customer@handrill.com', phone: '+91 94470 12345',
    role: 'CUSTOMER', avatar: null, _password: 'demo123',
    address: '45 MG Road, Swaraj Round, Thrissur, Kerala - 680001',
  },
];

export const ADMINS = [
  {
    id: 'a1', name: 'Admin Handrill', email: 'admin@handrill.com', phone: '+91 80000 00001',
    role: 'ADMIN', avatar: null, _password: 'demo123',
    address: 'Handrill HQ, Thrissur, Kerala - 680001',
  },
];

// Helper to build past dates
const d = (days) => new Date(Date.now() - days * 86400000);
const dmo = (months, day = 15) => {
  const dt = new Date();
  dt.setMonth(dt.getMonth() - months);
  dt.setDate(day);
  return dt;
};
const f = (days) => new Date(Date.now() + days * 86400000);

// Bookings spread across 6 months for meaningful admin charts
// Only references w7 (Vinod) and c1 (Arjun)
export const BOOKINGS = [
  // --- Current active / recent ---
  { id:'b1', customerId:'c1', serviceId:'s2', workerId:'w7', status:'INPROGRESS', paymentStatus:'PAID',    amount:749, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'Living room fan not working, two switches need replacement', reviewed:false, scheduledAt:new Date(), assignedAt:d(1), startedAt:new Date(), completedAt:null, createdAt:d(2) },
  { id:'b2', customerId:'c1', serviceId:'s1', workerId:null,  status:'PENDING',    paymentStatus:'PENDING', amount:599, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'Kitchen sink pipe is leaking', reviewed:false, scheduledAt:f(2), assignedAt:null, startedAt:null, completedAt:null, createdAt:d(0) },

  // --- Completed bookings this month (for revenue charts) ---
  { id:'b3', customerId:'c1', serviceId:'s8', workerId:'w7', status:'COMPLETED', paymentStatus:'PAID',    amount:399, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'Washing machine not draining', reviewed:true,  scheduledAt:d(5),   assignedAt:d(5),  startedAt:d(5),  completedAt:d(5),  createdAt:d(6) },
  { id:'b4', customerId:'c1', serviceId:'s3', workerId:null,  status:'CANCELLED', paymentStatus:'CANCELLED', amount:399, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'', reviewed:false, scheduledAt:d(8),  assignedAt:null, startedAt:null, completedAt:null, createdAt:d(9) },

  // --- Month 1 ago ---
  { id:'b5', customerId:'c1', serviceId:'s2', workerId:'w7', status:'COMPLETED', paymentStatus:'PAID', amount:749, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'Full home rewiring check', reviewed:true,  scheduledAt:dmo(1,10), assignedAt:dmo(1,10), startedAt:dmo(1,10), completedAt:dmo(1,10), createdAt:dmo(1,9) },
  { id:'b6', customerId:'c1', serviceId:'s8', workerId:'w7', status:'COMPLETED', paymentStatus:'PAID', amount:399, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'Refrigerator not cooling', reviewed:false, scheduledAt:dmo(1,20), assignedAt:dmo(1,20), startedAt:dmo(1,20), completedAt:dmo(1,20), createdAt:dmo(1,19) },
  { id:'b7', customerId:'c1', serviceId:'s4', workerId:null,  status:'COMPLETED', paymentStatus:'PAID', amount:449, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'AC gas refill needed',  reviewed:false, scheduledAt:dmo(1,25), assignedAt:dmo(1,25), startedAt:dmo(1,25), completedAt:dmo(1,25), createdAt:dmo(1,24) },

  // --- Month 2 ago ---
  { id:'b8', customerId:'c1', serviceId:'s1', workerId:'w7', status:'COMPLETED', paymentStatus:'PAID', amount:599, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'Bathroom tap replacement', reviewed:true,  scheduledAt:dmo(2,5),  assignedAt:dmo(2,5),  startedAt:dmo(2,5),  completedAt:dmo(2,5),  createdAt:dmo(2,4) },
  { id:'b9', customerId:'c1', serviceId:'s7', workerId:null,  status:'COMPLETED', paymentStatus:'PAID', amount:349, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'Cockroach problem kitchen', reviewed:false, scheduledAt:dmo(2,15), assignedAt:dmo(2,15), startedAt:dmo(2,15), completedAt:dmo(2,15), createdAt:dmo(2,14) },
  { id:'b10',customerId:'c1', serviceId:'s3', workerId:null,  status:'CANCELLED', paymentStatus:'CANCELLED', amount:399, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'', reviewed:false, scheduledAt:dmo(2,22), assignedAt:null, startedAt:null, completedAt:null, createdAt:dmo(2,21) },

  // --- Month 3 ago ---
  { id:'b11',customerId:'c1', serviceId:'s8', workerId:'w7', status:'COMPLETED', paymentStatus:'PAID', amount:399, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'Microwave not heating', reviewed:false, scheduledAt:dmo(3,8),  assignedAt:dmo(3,8),  startedAt:dmo(3,8),  completedAt:dmo(3,8),  createdAt:dmo(3,7) },
  { id:'b12',customerId:'c1', serviceId:'s2', workerId:'w7', status:'COMPLETED', paymentStatus:'PAID', amount:749, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'MCB trips frequently', reviewed:true,  scheduledAt:dmo(3,18), assignedAt:dmo(3,18), startedAt:dmo(3,18), completedAt:dmo(3,18), createdAt:dmo(3,17) },

  // --- Month 4 ago ---
  { id:'b13',customerId:'c1', serviceId:'s6', workerId:null,  status:'COMPLETED', paymentStatus:'PAID', amount:749, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'Living room painting', reviewed:false, scheduledAt:dmo(4,12), assignedAt:dmo(4,12), startedAt:dmo(4,12), completedAt:dmo(4,12), createdAt:dmo(4,11) },
  { id:'b14',customerId:'c1', serviceId:'s1', workerId:'w7', status:'COMPLETED', paymentStatus:'PAID', amount:599, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'Water heater repair',  reviewed:false, scheduledAt:dmo(4,25), assignedAt:dmo(4,25), startedAt:dmo(4,25), completedAt:dmo(4,25), createdAt:dmo(4,24) },

  // --- Month 5 ago ---
  { id:'b15',customerId:'c1', serviceId:'s5', workerId:null,  status:'COMPLETED', paymentStatus:'PAID', amount:499, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'Wardrobe door hinge', reviewed:false, scheduledAt:dmo(5,7),  assignedAt:dmo(5,7),  startedAt:dmo(5,7),  completedAt:dmo(5,7),  createdAt:dmo(5,6) },
  { id:'b16',customerId:'c1', serviceId:'s4', workerId:null,  status:'COMPLETED', paymentStatus:'PAID', amount:449, serviceAddress:'45 MG Road, Thrissur, Kerala - 680001', notes:'AC annual service', reviewed:false, scheduledAt:dmo(5,20), assignedAt:dmo(5,20), startedAt:dmo(5,20), completedAt:dmo(5,20), createdAt:dmo(5,19) },
];

export const REVIEWS = [
  { id:'r1', bookingId:'b3', customerId:'c1', workerId:'w7', rating:5, comment:'Excellent work! Fixed the washing machine quickly. Very professional and clean.', createdAt:d(4) },
  { id:'r2', bookingId:'b5', customerId:'c1', workerId:'w7', rating:4, comment:'Good electrical work. Explained everything clearly.', createdAt:dmo(1,11) },
  { id:'r3', bookingId:'b8', customerId:'c1', workerId:'w7', rating:5, comment:'Tap fixed perfectly. Arrived on time and very courteous.', createdAt:dmo(2,6) },
  { id:'r4', bookingId:'b12',customerId:'c1', workerId:'w7', rating:4, comment:'MCB issue resolved. Knowledgeable technician.', createdAt:dmo(3,19) },
];

export const DEMO_ACCOUNTS = {
  'customer@handrill.com': { password: 'demo123', userId: 'c1' },
  'worker@handrill.com':   { password: 'demo123', userId: 'w7' },
  'admin@handrill.com':    { password: 'demo123', userId: 'a1' },
};

export const TIME_SLOTS = [
  '08:00 AM','09:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','01:00 PM','02:00 PM','03:00 PM',
  '04:00 PM','05:00 PM','06:00 PM','07:00 PM',
];
