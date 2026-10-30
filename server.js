const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Bortoman folder-er static file (index.html, dashboard.html ityadi) browser-e dekhonor jonno
app.use(express.static(__dirname));

// Home route ('/') e index.html file serve korar route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const JWT_SECRET = 'super_secret_jwt_key_bangladesh_app_2026';
const DB_FILE = path.join(__dirname, 'database.json');
const SUPER_ADMIN_PHONE = '+8801689333000';

const fullBazarList = [
    { id: 'BZ_1', name: 'মিনিকেট চাল (Miniket Rice)', unit: '১ কেজি', price: '৳ ৭২ - ৳ ৭৫', trend: 'stable', change: 'অপরিবর্তিত', category: 'চাল/ডাল' },
    { id: 'BZ_2', name: 'নাজিরশাইল চাল (Nazirshail Rice)', unit: '১ কেজি', price: '৳ ৮০ - ৳ ৮৫', trend: 'stable', change: 'অপরিবর্তিত', category: 'চাল/ডাল' },
    { id: 'BZ_3', name: 'দেশি মসুর ডাল (Local Lentil)', unit: '১ কেজি', price: '৳ ১৩৫ - ৳ ১৪০', trend: 'stable', change: 'অপরিবর্তিত', category: 'চাল/ডাল' },
    { id: 'BZ_4', name: 'দেশি পেঁয়াজ (Local Onion)', unit: '১ কেজি', price: '৳ ১১৫ - ৳ ১২৫', trend: 'up', change: '+৳ ৫ বৃদ্ধি', category: 'মসলা/সবজি' },
    { id: 'BZ_5', name: 'গোল সাদা আলু (Potato)', unit: '১ কেজি', price: '৳ ৫৫ - ৳ ৬০', trend: 'up', change: '+৳ ৩ বৃদ্ধি', category: 'মসলা/সবজি' },
    { id: 'BZ_6', name: 'বোতলজাত সয়াবিন তেল (1L Bottle)', unit: '১ লিটার', price: '৳ ১৬৮ - ৳ ১৭০', trend: 'stable', change: 'অপরিবর্তিত', category: 'তেল' },
    { id: 'BZ_7', name: 'ফার্মের লাল ডিম (Egg)', unit: '১ হালি (৪টি)', price: '৳ ৪৮ - ৳ ৫০', trend: 'down', change: '-৳ ২ কমেছে', category: 'ডিম/মাংস' },
    { id: 'BZ_8', name: 'ব্রয়লার মুরগি (Broiler Chicken)', unit: '১ কেজি', price: '৳ ১৭৫ - ৳ ১৮৫', trend: 'down', change: '-৳ ৫ কমেছে', category: 'ডিম/মাংস' },
    { id: 'BZ_9', name: 'গরুর মাংস (Fresh Beef)', unit: '১ কেজি', price: '৳ ৭৫০ - ৳ ৭৮০', trend: 'stable', change: 'অপরিবর্তিত', category: 'ডিম/মাংস' }
];

const fullTransportData = {
    buses: [
        { id: 'B_1', name: "রাইদা এন্টারপ্রাইজ (Raida)", from: "পোস্তগোলা", to: "দিয়াবাড়ী (উত্তরা)", via: "ধোলাইপাড় - যাত্রাবাড়ী - মালিবাগ - রামপুরা - বাড্ডা - নতুন বাজার - কুড়িল - এয়ারপোর্ট", fare: "৳ ১০ - ৳ ৬০" },
        { id: 'B_2', name: "অনাবিল সুপার (Anabil Super)", from: "চিটাগাং রোড", to: "গাজীপুর চৌরাস্তা", via: "সাইনবোর্ড - বিশ্বরোড - বাড্ডা - নতুন বাজার - কুড়িল - এয়ারপোর্ট - টঙ্গী", fare: "৳ ১৫ - ৳ ৮০" },
        { id: 'B_3', name: "বিকাশ পরিবহন (Bikash)", from: "আজিমপুর", to: "মিরপুর ১৪", via: "সায়েন্স ল্যাব - ধানমন্ডি - শ্যামলী - টেকনিক্যাল - মিরপুর ১০", fare: "৳ ১০ - ৳ ৪০" },
        { id: 'B_4', name: "আকাশ পরিবহন (Akash)", from: "কদমতলী", to: "টঙ্গী স্টেশন", via: "মেয়র হানিফ ফ্লাইওভার - মালিবাগ - রামপুরা - বাড্ডা - এয়ারপোর্ট", fare: "৳ ১৫ - ৳ ৭০" },
        { id: 'B_5', name: "তুরাগ পরিবহন (Turag)", from: "যাত্রাবাড়ী", to: "টঙ্গী", via: "সায়েদাবাদ - খিলগাঁও - রামপুরা - নতুন বাজার - বিমানবন্দর", fare: "৳ ১৫ - ৳ ৬৫" },
        { id: 'B_6', name: "লাব্বাইক পরিবহন (Labbaik)", from: "সাইনবোর্ড", to: "সাভার", via: "যাত্রাবাড়ী - মতিঝিল - শাহবাগ - আসাদগেট - গাবতলী", fare: "৳ ২০ - ৳ ৯০" },
        { id: 'B_7', name: "বসুমতি ট্রান্সপোর্ট (Basumati)", from: "গাবতলী", to: "গাজীপুর", via: "মিরপুর ১ - মিরপুর ১০ - কালশী - এয়ারপোর্ট - উত্তরা", fare: "৳ ২০ - ৳ ৮০" }
    ],
    trains: [
        { id: 'T_1', name: "সুবর্ণ এক্সপ্রেস (Subarna - 701)", route: "ঢাকা ⇄ চট্টগ্রাম", depTime: "সকাল ০৪:৩০", offDay: "সোমবার", type: "নন-স্টপ আন্তঃনগর" },
        { id: 'T_2', name: "চিত্রা এক্সপ্রেস (Chitra - 763)", route: "ঢাকা ⇄ খুলনা", depTime: "সন্ধ্যা ০৭:০০", offDay: "সোমবার", type: "আন্তঃনগর" },
        { id: 'T_3', name: "বনলতা এক্সপ্রেস (Banalata - 791)", route: "ঢাকা ⇄ রাজশাহী", depTime: "দুপুর ০১:৩০", offDay: "শুক্রবার", type: "হাই-স্পিড আন্তঃনগর" },
        { id: 'T_4', name: "পারাবত এক্সপ্রেস (Parabat - 709)", route: "ঢাকা ⇄ সিলেট", depTime: "সকাল ০৬:২০", offDay: "মঙ্গলবার", type: "আন্তঃনগর" },
        { id: 'T_5', name: "তিস্তা এক্সপ্রেস (Teesta - 707)", route: "ঢাকা ⇄ দেওয়ানগঞ্জ", depTime: "সকাল ০৭:৩০", offDay: "সোমবার", type: "আন্তঃনগর" },
        { id: 'T_6', name: "সোনার বাংলা এক্সপ্রেস (Sonar Bangla - 788)", route: "ঢাকা ⇄ চট্টগ্রাম", depTime: "সকাল ০৭:০০", offDay: "বুধবার", type: "বিরতিহীন আন্তঃনগর" }
    ]
};

const dynamicQuizBank = [
    { id: 'Q_1', question: 'বাংলাদেশের জাতীয় সংগীতের রচয়িতা কে?', options: ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'জসীম উদ্দীন', 'জীবনানন্দ দাশ'], answer: 1 },
    { id: 'Q_2', question: 'পদ্মা বহুমুখী সেতুর মোট দৈর্ঘ্য কত কিলোমিটার?', options: ['৫.৮ কিমি', '৬.১৫ কিমি', '৭.২ কিমি', '৪.৮ কিমি'], answer: 1 },
    { id: 'Q_3', question: 'জাতীয় জরুরি সেবা হটলাইন নম্বর কোনটি?', options: ['৩৩৩', '৯৯৯', '১০৯', '১০৬'], answer: 1 }
];

function loadData() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            users: [],
            resetCodes: {},
            donors: [
                { id: 'DONOR_1', name: 'তানভীর হোসেন', phone: '01755112233', bloodGroup: 'A+', area: 'উত্তর বাড্ডা, ঢাকা', lastDonation: 'Available Now' },
                { id: 'DONOR_2', name: 'সাব্বির আহমেদ', phone: '01822334455', bloodGroup: 'O+', area: 'গুলশান ২, ঢাকা', lastDonation: 'Available Now' },
                { id: 'DONOR_3', name: 'কামরুল হাসান', phone: '01933445566', bloodGroup: 'B+', area: 'রামপুরা, ঢাকা', lastDonation: 'Available Now' },
                { id: 'DONOR_4', name: 'মেহেদী হাসান', phone: '01677889900', bloodGroup: 'AB+', area: 'মিরপুর ১০, ঢাকা', lastDonation: 'Available Now' }
            ],
            marketplace: [
                { id: 'ITEM_1', title: 'চিটাগাং সেগুন কাঠের সোফা সেট (৩+১+১)', category: 'furniture', price: '৳ ২৫,০০০', location: 'গুলশান ২, ঢাকা', sellerName: 'মোহাম্মদ আতিকুল', sellerPhone: '+8801689333000', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60' },
                { id: 'ITEM_2', title: 'সুজুকি জিক্সার এসএফ ২০১৮ (Suzuki Gixxer SF)', category: 'vehicle', price: '৳ ১,৬৫,০০০', location: 'উত্তর বাড্ডা, ঢাকা', sellerName: 'আরিফ আহমেদ', sellerPhone: '+8801711223344', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop&q=60' },
                { id: 'ITEM_3', title: '২ রুমের ফ্যামিলি বাসা ভাড়া (ডিসেম্বর থেকে)', category: 'rent', price: '৳ ১৪,০০০/মাস', location: 'ময়নারবাগ, বাড্ডা, ঢাকা', sellerName: 'বাড়িওয়ালা', sellerPhone: '+8801822334455', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=60' }
            ],
            hisab: [
                { id: 'HISAB_1', userPhone: '+8801689333000', personName: 'করিম সাহেব (দোকান বাকি)', personPhone: '01711002233', type: 'due', amount: 1500, note: 'মুদি চাল ও ডাল বাকি', date: '30 Oct, 2026' }
            ],
            bills: [
                { id: 'BILL_1', userPhone: '+8801689333000', title: 'ডেসকো বিদ্যুৎ বিল (DESCO Prepaid)', category: 'electricity', amount: 1850, dueDate: '2026-11-05', status: 'unpaid' }
            ],
            tasks: [
                { id: 'TASK_1', userPhone: '+8801689333000', text: 'কাঁচা বাজার থেকে দেশি পেঁয়াজ ও ডিম কেনা', completed: false, createdAt: 'আজ সকাল ০৯:৩০' }
            ]
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    const raw = fs.readFileSync(DB_FILE);
    const parsed = JSON.parse(raw);
    if (!parsed.donors || parsed.donors.length === 0) {
        parsed.donors = [
            { id: 'DONOR_1', name: 'তানভীর হোসেন', phone: '01755112233', bloodGroup: 'A+', area: 'উত্তর বাড্ডা, ঢাকা', lastDonation: 'Available Now' },
            { id: 'DONOR_2', name: 'সাব্বির আহমেদ', phone: '01822334455', bloodGroup: 'O+', area: 'গুলশান ২, ঢাকা', lastDonation: 'Available Now' },
            { id: 'DONOR_3', name: 'কামরুল হাসান', phone: '01933445566', bloodGroup: 'B+', area: 'রামপুরা, ঢাকা', lastDonation: 'Available Now' },
            { id: 'DONOR_4', name: 'মেহেদী হাসান', phone: '01677889900', bloodGroup: 'AB+', area: 'মিরপুর ১০, ঢাকা', lastDonation: 'Available Now' }
        ];
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
    }
    if (!parsed.marketplace) parsed.marketplace = [];
    if (!parsed.users) parsed.users = [];
    if (!parsed.bills) parsed.bills = [];
    if (!parsed.hisab) parsed.hisab = [];
    if (!parsed.tasks) parsed.tasks = [];
    return parsed;
}

function saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let db = loadData();

// --- Auth APIs ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password } = req.body;
        if (!fullName || !email || !phoneNumber || !password) return res.status(400).json({ success: false, message: 'Shob field fill-up korun.' });

        let formattedPhone = phoneNumber.trim();
        if (!formattedPhone.startsWith('+880')) formattedPhone = '+880' + formattedPhone.replace(/^0+/, '');

        const existing = db.users.find(u => u.phoneNumber === formattedPhone || u.email.toLowerCase() === email.toLowerCase().trim());
        if (existing) return res.status(409).json({ success: false, message: 'Ei phone ba email agei ache.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const role = (formattedPhone === SUPER_ADMIN_PHONE) ? 'superadmin' : 'user';

        const newUser = {
            id: 'USR_' + Date.now(),
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            phoneNumber: formattedPhone,
            password: hashedPassword,
            points: 10,
            role: role,
            status: 'active',
            createdAt: new Date().toLocaleDateString('en-GB')
        };

        db.users.push(newUser);
        saveData(db);
        res.status(201).json({ success: true, message: 'Registration successful!', user: newUser });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        let formattedPhone = phoneNumber.trim();
        if (!formattedPhone.startsWith('+880')) formattedPhone = '+880' + formattedPhone.replace(/^0+/, '');

        const user = db.users.find(u => u.phoneNumber === formattedPhone);
        if (!user) return res.status(404).json({ success: false, message: 'User khuje paoa jayni.' });
        if (user.status === 'banned') return res.status(403).json({ success: false, message: '🚫 Apnar account-ti ban kora ache.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password!' });

        if (user.phoneNumber === SUPER_ADMIN_PHONE) user.role = 'superadmin';

        const token = jwt.sign({ id: user.id, phoneNumber: user.phoneNumber, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({ success: true, message: 'Login successful!', token, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// --- Super Admin User Management ---
app.get('/api/admin/users', (req, res) => {
    const list = db.users.map(u => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phoneNumber: u.phoneNumber,
        role: u.role,
        status: u.status || 'active',
        points: u.points || 0,
        createdAt: u.createdAt || 'N/A'
    }));
    res.json({ success: true, users: list });
});

app.post('/api/admin/users', async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password, role } = req.body;
        if (!fullName || !email || !phoneNumber || !password) return res.status(400).json({ success: false, message: 'All fields required.' });

        let formattedPhone = phoneNumber.trim();
        if (!formattedPhone.startsWith('+880')) formattedPhone = '+880' + formattedPhone.replace(/^0+/, '');

        const existing = db.users.find(u => u.phoneNumber === formattedPhone || u.email.toLowerCase() === email.toLowerCase().trim());
        if (existing) return res.status(409).json({ success: false, message: 'Phone ba email already exist kore.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            id: 'USR_' + Date.now(),
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            phoneNumber: formattedPhone,
            password: hashedPassword,
            points: 10,
            role: role || 'user',
            status: 'active',
            createdAt: new Date().toLocaleDateString('en-GB')
        };

        db.users.push(newUser);
        saveData(db);
        res.status(201).json({ success: true, message: 'Notun user toiri hoyeche!', user: newUser });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

app.put('/api/admin/users/:id', async (req, res) => {
    try {
        const user = db.users.find(u => u.id === req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User paoa jayni.' });

        const { fullName, email, phoneNumber, newPassword, role, status } = req.body;
        if (fullName) user.fullName = fullName.trim();
        if (email) user.email = email.trim().toLowerCase();
        if (phoneNumber) {
            let p = phoneNumber.trim();
            if (!p.startsWith('+880')) p = '+880' + p.replace(/^0+/, '');
            user.phoneNumber = p;
        }
        if (role) user.role = role;
        if (status) user.status = status;

        if (newPassword && newPassword.trim()) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword.trim(), salt);
        }

        saveData(db);
        res.json({ success: true, message: 'User profile update hoyeche!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Update kora jayni.' });
    }
});

app.patch('/api/admin/users/:id/ban', (req, res) => {
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User paoa jayni.' });
    if (user.phoneNumber === SUPER_ADMIN_PHONE) return res.status(400).json({ success: false, message: 'Super admin-ke ban kora jabe na!' });

    user.status = (user.status === 'banned') ? 'active' : 'banned';
    saveData(db);
    res.json({ success: true, message: `User account-ti ${user.status === 'banned' ? 'Ban' : 'Unban'} kora hoyeche!`, status: user.status });
});

app.delete('/api/admin/users/:id', (req, res) => {
    const user = db.users.find(u => u.id === req.params.id);
    if (user && user.phoneNumber === SUPER_ADMIN_PHONE) return res.status(400).json({ success: false, message: 'Super admin delete kora jabe na.' });

    db.users = db.users.filter(u => u.id !== req.params.id);
    saveData(db);
    res.json({ success: true, message: 'User account delete hoye geche!' });
});

// --- 1. FULL BLOOD DONOR APIS ---
app.get('/api/blood-donors', (req, res) => {
    const { group, area } = req.query;
    let donors = db.donors || [];

    if (group && group !== 'all') {
        donors = donors.filter(d => d.bloodGroup.toUpperCase() === group.toUpperCase());
    }
    if (area && area.trim()) {
        const a = area.toLowerCase().trim();
        donors = donors.filter(d => d.area.toLowerCase().includes(a));
    }
    res.json({ success: true, donors });
});

app.post('/api/blood-donors', (req, res) => {
    const { name, phone, bloodGroup, area } = req.body;
    if (!name || !phone || !bloodGroup || !area) {
        return res.status(400).json({ success: false, message: 'Name, phone, group o area shobgulo puron korun.' });
    }

    const newDonor = {
        id: 'DONOR_' + Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        bloodGroup: bloodGroup.toUpperCase().trim(),
        area: area.trim(),
        lastDonation: 'Available Now'
    };

    if (!db.donors) db.donors = [];
    db.donors.unshift(newDonor);
    saveData(db);
    res.status(201).json({ success: true, message: 'রক্তদাতা হিসেবে সফলভাবে নিবন্ধিত হয়েছেন!', donor: newDonor });
});

// --- 2. FULL TRANSPORT APIS ---
app.get('/api/transport/buses', (req, res) => {
    const search = (req.query.search || '').toLowerCase().trim();
    if (!search) return res.json({ success: true, buses: fullTransportData.buses });
    const filtered = fullTransportData.buses.filter(b => 
        b.name.toLowerCase().includes(search) || 
        b.from.toLowerCase().includes(search) || 
        b.to.toLowerCase().includes(search) || 
        b.via.toLowerCase().includes(search)
    );
    res.json({ success: true, buses: filtered });
});

app.get('/api/transport/trains', (req, res) => {
    res.json({ success: true, trains: fullTransportData.trains });
});

// --- Marketplace Full APIs ---
app.get('/api/marketplace', (req, res) => {
    const { category, search } = req.query;
    let items = db.marketplace || [];
    if (category && category !== 'all') {
        items = items.filter(i => i.category === category);
    }
    if (search && search.trim()) {
        const s = search.toLowerCase().trim();
        items = items.filter(i => i.title.toLowerCase().includes(s) || i.location.toLowerCase().includes(s));
    }
    res.json({ success: true, items });
});

app.post('/api/marketplace', (req, res) => {
    const { title, category, price, location, sellerName, sellerPhone, image } = req.body;
    if (!title || !price || !location || !sellerPhone) {
        return res.status(400).json({ success: false, message: 'Shob field lagbe.' });
    }

    const newItem = {
        id: 'ITEM_' + Date.now(),
        title: title.trim(),
        category: category || 'others',
        price: price.trim(),
        location: location.trim(),
        sellerName: sellerName || 'Community Member',
        sellerPhone: sellerPhone.trim(),
        image: image && image.trim() ? image.trim() : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60'
    };

    if (!db.marketplace) db.marketplace = [];
    db.marketplace.unshift(newItem);
    saveData(db);
    res.status(201).json({ success: true, message: 'Marketplace-e biggapon post hoyeche!', item: newItem });
});

app.delete('/api/marketplace/:id', (req, res) => {
    db.marketplace = db.marketplace.filter(i => i.id !== req.params.id);
    saveData(db);
    res.json({ success: true });
});

// --- Other Services (Bazar, Bills, Quiz, Hisab, Tasks, Weather, Prayer) ---
app.get('/api/bazar-prices', (req, res) => res.json({ success: true, prices: fullBazarList }));

app.get('/api/bills/:phone', (req, res) => {
    const phone = req.params.phone;
    let userBills = (db.bills || []).filter(b => b.userPhone === phone);
    if (userBills.length === 0) {
        userBills = [
            { id: 'BILL_1', userPhone: phone, title: 'ডেসকো বিদ্যুৎ বিল (DESCO)', category: 'electricity', amount: 1850, dueDate: '2026-11-05', status: 'unpaid' },
            { id: 'BILL_2', userPhone: phone, title: 'ওয়াই-ফাই ইন্টারনেট (Amber IT)', category: 'internet', amount: 1050, dueDate: '2026-11-08', status: 'unpaid' }
        ];
        db.bills.push(...userBills);
        saveData(db);
    }
    res.json({ success: true, bills: userBills });
});
app.post('/api/bills', (req, res) => {
    const { userPhone, title, category, amount, dueDate } = req.body;
    const newBill = { id: 'BILL_' + Date.now(), userPhone, title, category, amount: Number(amount), dueDate, status: 'unpaid' };
    db.bills.unshift(newBill);
    saveData(db);
    res.status(201).json({ success: true, bill: newBill });
});
app.patch('/api/bills/:id/pay', (req, res) => {
    const bill = db.bills.find(b => b.id === req.params.id);
    if (bill) { bill.status = (bill.status === 'paid') ? 'unpaid' : 'paid'; saveData(db); }
    res.json({ success: true, bill });
});
app.delete('/api/bills/:id', (req, res) => {
    db.bills = db.bills.filter(b => b.id !== req.params.id);
    saveData(db);
    res.json({ success: true });
});

app.get('/api/quiz/random', (req, res) => {
    const shuffled = [...dynamicQuizBank].sort(() => 0.5 - Math.random());
    res.json({ success: true, quizzes: shuffled.slice(0, 2) });
});
app.post('/api/quiz/submit', (req, res) => {
    const { userPhone, quizId, selectedOption } = req.body;
    const target = dynamicQuizBank.find(q => q.id === quizId);
    if (!target) return res.status(404).json({ success: false });
    const isCorrect = (target.answer === Number(selectedOption));
    let total = 20;
    if (isCorrect) {
        const user = db.users.find(u => u.phoneNumber === userPhone);
        if (user) { user.points = (user.points || 0) + 10; total = user.points; saveData(db); }
    }
    res.json({ success: true, isCorrect, totalPoints: total });
});

app.get('/api/hisab/:phone', (req, res) => res.json({ success: true, records: (db.hisab || []).filter(r => r.userPhone === req.params.phone) }));
app.post('/api/hisab', (req, res) => {
    const { userPhone, personName, personPhone, type, amount, note } = req.body;
    const newRecord = { id: 'HISAB_' + Date.now(), userPhone, personName, personPhone, type, amount: Number(amount), note, date: new Date().toLocaleDateString('en-GB') };
    db.hisab.unshift(newRecord);
    saveData(db);
    res.status(201).json({ success: true, record: newRecord });
});
app.delete('/api/hisab/:id', (req, res) => {
    db.hisab = db.hisab.filter(r => r.id !== req.params.id);
    saveData(db);
    res.json({ success: true });
});

app.get('/api/tasks/:phone', (req, res) => res.json({ success: true, tasks: (db.tasks || []).filter(t => t.userPhone === req.params.phone) }));
app.post('/api/tasks', (req, res) => {
    const newTask = { id: 'TASK_' + Date.now(), userPhone: req.body.userPhone, text: req.body.text, completed: false, createdAt: 'এখন মাত্র' };
    db.tasks.unshift(newTask);
    saveData(db);
    res.status(201).json({ success: true, task: newTask });
});
app.patch('/api/tasks/:id/toggle', (req, res) => {
    const task = db.tasks.find(t => t.id === req.params.id);
    if (task) { task.completed = !task.completed; saveData(db); }
    res.json({ success: true, task });
});
app.delete('/api/tasks/:id', (req, res) => {
    db.tasks = db.tasks.filter(t => t.id !== req.params.id);
    saveData(db);
    res.json({ success: true });
});

app.get('/api/weather', (req, res) => res.json({ success: true, data: { city: "ঢাকা, বাংলাদেশ", temp: "২৮° সে.", condition: "আংশিক মেঘলা", icon: "⛅", rainProb: "১৫%", humidity: "৬৫%", aqi: "১৫২", aqiStatus: "অস্বাস্থ্যকর" } }));
app.get('/api/prayer-times', (req, res) => res.json({ success: true, data: { location: "ঢাকা ও পার্শ্ববর্তী এলাকা", date: "শুক্রবার, ৩০ অক্টোবর ২০২৬", sehriEnd: "০৪:৪১ AM", sunrise: "০৬:০৩ AM", iftar: "০৫:২২ PM", schedules: [{ name: "ফজর", time: "04:47", display: "০৪:৪৭ AM" }, { name: "যোহর", time: "11:45", display: "১১:৪৫ AM" }, { name: "আসর", time: "15:50", display: "০৩:৫০ PM" }, { name: "মাগরিব", time: "17:22", display: "০৫:২২ PM" }, { name: "এশা", time: "18:38", display: "০৬:৩৮ PM" }] } }));

const PORT = 5000;
app.listen(PORT, () => console.log(`BD Super App Server running on http://localhost:${PORT}`));