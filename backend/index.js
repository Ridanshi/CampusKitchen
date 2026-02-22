const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://campus-kitchen.vercel.app",   // your real Vercel domain
    "https://campus-kitchen-brown.vercel.app" // if preview
  ],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ==================== MODELS ====================

// ==================== ADMIN SCHEMA (SEPARATE) ====================

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  adminId: { type: String, required: true, unique: true },  // ← Not "studentId"!
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  equipment: [{ type: String }],
  companions: [{  // ✅ Add this
    name: { type: String },
    registrationNumber: { type: String }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  checkOutPhoto: { type: String },
  createdAt: { type: Date, default: Date.now }
});

bookingSchema.index({ date: 1, timeSlot: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

const availabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  slots: [{
    time: { type: String, required: true },
    maxCapacity: { type: Number, default: 1 },
    currentBookings: { type: Number, default: 0 },
    available: { type: Boolean, default: true }
  }]
});

const Availability = mongoose.model('Availability', availabilitySchema);

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Kitchen Cleanliness',
      'Equipment Issue',
      'Damaged Appliances',
      'Missing Equipment',
      'Safety Concern',
      'Previous User Issue',
      'Other'
    ]
  },
  description: { type: String, required: true },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: { type: String },
  date: { type: Date, required: true },
  photos: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'under-review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminResponse: { type: String },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

// ==================== MIDDLEWARE ====================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;

    if (!name || !email || !password || !studentId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      studentId
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // ✅ Check BOTH User and Admin collections
    let user = await User.findOne({ email });
    let isAdmin = false;

    if (!user) {
      user = await Admin.findOne({ email });
      isAdmin = true;
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: isAdmin ? user.adminId : user.studentId,  // ✅ Return correct ID
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/auth/update-profile', authenticateToken, async (req, res) => {
  try {
    const { name, studentId, password } = req.body;
    const userId = req.user.id;

    if (!name || !studentId) {
      return res.status(400).json({ error: 'Name and Student ID are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (studentId !== user.studentId) {
      const existingUser = await User.findOne({
        studentId,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Student ID already in use' });
      }
    }

    user.name = name;
    user.studentId = studentId;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/change_pass', authenticateToken, async (req, res) => {
  try {
    const { curr, pass } = req.body;
    const userId = req.user.id;

    if (!curr || !pass) {
      return res.status(400).json({ success: false, error: 'Current and new password are required' });
    }

    if (pass.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    // ✅ Check both User and Admin collections
    let user = await User.findById(userId);

    if (!user) {
      user = await Admin.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(curr, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(pass, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== BOOKING ROUTES ====================

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    let query = { userId: req.user.id };
    const now = new Date();

    if (type === 'upcoming') {
      query.status = 'upcoming';
      const allUpcoming = await Booking.find(query)
        .populate('userId', 'name email studentId')
        .sort({ date: -1, timeSlot: 1 });

      const filteredBookings = allUpcoming.filter(booking => {
        const timeSlotEnd = booking.timeSlot.split('-')[1];
        const [hours, minutes] = timeSlotEnd.split(':').map(Number);
        const bookingEndTime = new Date(booking.date);
        bookingEndTime.setHours(hours, minutes, 0, 0);
        return bookingEndTime > now;
      });

      const formattedBookings = filteredBookings.map(booking => ({
        id: booking._id,
        date: booking.date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: booking.timeSlot,
        status: 'upcoming',
        equipment: booking.equipment,
        checkOutPhoto: booking.checkOutPhoto,
        hasUploadedPhoto: !!booking.checkOutPhoto
      }));

      return res.json(formattedBookings);

    } else if (type === 'history') {
      query.$or = [
        { status: 'completed' },
        { status: 'cancelled' }
      ];

      const upcomingBookings = await Booking.find({
        userId: req.user.id,
        status: 'upcoming'
      });

      const passedBookings = upcomingBookings.filter(booking => {
        const timeSlotEnd = booking.timeSlot.split('-')[1];
        const [hours, minutes] = timeSlotEnd.split(':').map(Number);
        const bookingEndTime = new Date(booking.date);
        bookingEndTime.setHours(hours, minutes, 0, 0);
        return bookingEndTime <= now;
      });

      for (const booking of passedBookings) {
        await Booking.findByIdAndUpdate(booking._id, { status: 'completed' });
        booking.status = 'completed';
      }

      const historyBookings = await Booking.find(query)
        .populate('userId', 'name email studentId')
        .sort({ date: -1, timeSlot: 1 });

      const allHistory = [...historyBookings, ...passedBookings];

      const formattedBookings = allHistory.map(booking => ({
        id: booking._id,
        date: booking.date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: booking.timeSlot,
        status: booking.status,
        equipment: booking.equipment,
        checkOutPhoto: booking.checkOutPhoto,
        hasUploadedPhoto: !!booking.checkOutPhoto
      }));

      return res.json(formattedBookings);
    }
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { date, timeSlot, equipment, companions } = req.body; // ✅ Add companions here

    if (!date || !timeSlot) {
      return res.status(400).json({ error: 'Date and time slot are required' });
    }

    // ⭐ NEW CHECK: Does user have any active booking?
    const now = new Date();
    const activeBookingQuery = await Booking.find({
      userId: req.user.id,
      status: 'upcoming'
    });


    // Check if any of these bookings are still in the future
    const hasActiveBooking = activeBookingQuery.some(booking => {
      const [startStr, endStr] = booking.timeSlot.split('-');
      const [endHour, endMinute] = endStr.split(':').map(Number);

      const bookingEndTime = new Date(booking.date);
      bookingEndTime.setHours(endHour, endMinute, 0, 0);

      return bookingEndTime > now;
    });

    if (hasActiveBooking) {
      const existingBooking = activeBookingQuery.find(booking => {
        const [startStr, endStr] = booking.timeSlot.split('-');
        const [endHour, endMinute] = endStr.split(':').map(Number);

        const bookingEndTime = new Date(booking.date);
        bookingEndTime.setHours(endHour, endMinute, 0, 0);

        return bookingEndTime > now;
      });

      return res.status(403).json({
        error: 'You already have an active booking. Please wait for it to complete or cancel it first.',
        activeBooking: {
          date: existingBooking.date,
          timeSlot: existingBooking.timeSlot
        },
        hasActiveBooking: true
      });
    }


    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({ error: 'Cannot book dates in the past' });
    }

    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: 'upcoming'
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // ✅ Filter out empty companions (where both fields are empty)
    const filledCompanions = companions && companions.length > 0
      ? companions.filter(c => c.name.trim() || c.registrationNumber.trim())
      : [];

    const booking = new Booking({
      userId: req.user.id,
      date: bookingDate,
      timeSlot,
      equipment: equipment || [],
      companions: filledCompanions, // ✅ Add companions here
      status: 'upcoming'
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        date: booking.date,
        timeSlot: booking.timeSlot,
        equipment: booking.equipment,
        companions: booking.companions, // ✅ Include in response
        status: booking.status
      }
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (booking.status !== 'upcoming') {
      return res.status(400).json({
        error: 'Cannot cancel this booking'
      });
    }

    const timeSlotStart = booking.timeSlot.split('-')[0];
    const [hours, minutes] = timeSlotStart.split(':').map(Number);

    const bookingDateTime = new Date(booking.date);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const hoursDiff = (bookingDateTime - now) / (1000 * 60 * 60);

    if (hoursDiff < 2 && bookingDateTime < now) {
      return res.status(400).json({
        error: 'Bookings must be cancelled at least 2 hours in advance'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/bookings/active-upload', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    console.log('\n=== ACTIVE UPLOAD CHECK ===');
    console.log('Current time:', now.toLocaleString());
    console.log('User ID:', req.user.id);

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    console.log('Searching for bookings on:', todayStart.toLocaleDateString());

    const bookings = await Booking.find({
      userId: req.user.id,
      date: { $gte: todayStart, $lte: todayEnd },
      status: 'upcoming'
    }).sort({ date: 1, timeSlot: 1 });

    console.log('Found bookings:', bookings.length);

    if (!bookings.length) {
      console.log('No bookings found for today');
      return res.json({ booking: null });
    }

    for (const booking of bookings) {
      console.log('\n--- Checking booking ---');
      console.log('Booking ID:', booking._id);
      console.log('Booking date:', booking.date);
      console.log('Time slot:', booking.timeSlot);

      const [startStr, endStr] = booking.timeSlot.split('-');
      const [startHour, startMinute] = startStr.split(':').map(Number);
      const [endHour, endMinute] = endStr.split(':').map(Number);

      const slotStart = new Date(booking.date);
      slotStart.setHours(startHour, startMinute, 0, 0);

      const slotEnd = new Date(booking.date);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      const uploadDeadline = new Date(slotEnd.getTime() + 30 * 60 * 1000);

      console.log('Slot start:', slotStart.toLocaleTimeString());
      console.log('Slot end:', slotEnd.toLocaleTimeString());
      console.log('Upload deadline:', uploadDeadline.toLocaleTimeString());
      console.log('Current time:', now.toLocaleTimeString());

      const isActive = now >= slotStart && now <= uploadDeadline;
      console.log('Is active?', isActive);

      if (isActive) {
        console.log('✓ ACTIVE BOOKING FOUND!\n');
        return res.json({
          booking: {
            id: booking._id,
            date: booking.date,
            time: booking.timeSlot,
            equipment: booking.equipment,
            hasUploadedPhoto: !!booking.checkOutPhoto
          }
        });
      }
    }

    console.log('No active bookings found\n');
    return res.json({ booking: null });
  } catch (err) {
    console.error('Get active upload booking error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/upload-cleanup/:bookingId', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    booking.checkOutPhoto = `/uploads/${req.file.filename}`;
    // booking.status = 'completed';
    await booking.save();

    res.json({
      message: 'Photo uploaded successfully! You can now leave the kitchen.',
      photoUrl: booking.checkOutPhoto
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// BACKEND FIX FOR GALLERY STATUS AND DELETE FEATURE
// ===================================================

// Replace the /api/my-photos endpoint in your server.js with this:

app.get('/api/my-photos', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.id,
      checkOutPhoto: { $exists: true, $ne: null }
    }).sort({ date: -1 });

    const now = new Date();

    const photos = bookings.map(booking => {
      // Calculate booking time range
      const [startStr, endStr] = booking.timeSlot.split('-');
      const [startHour, startMinute] = startStr.split(':').map(Number);
      const [endHour, endMinute] = endStr.split(':').map(Number);

      const slotStart = new Date(booking.date);
      slotStart.setHours(startHour, startMinute, 0, 0);

      const slotEnd = new Date(booking.date);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      const uploadDeadline = new Date(slotEnd.getTime() + 30 * 60 * 1000); // 30 mins after slot end

      // Determine actual status
      let displayStatus = 'completed';
      if (now >= slotStart && now <= slotEnd) {
        displayStatus = 'ongoing';
      } else if (now > slotEnd && now <= uploadDeadline) {
        displayStatus = 'grace-period';
      }

      return {
        id: booking._id,
        date: booking.date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        timeSlot: booking.timeSlot,
        photoUrl: booking.checkOutPhoto,
        status: displayStatus,
        bookingEndTime: slotEnd.toISOString(), // Send this for frontend to calculate
        uploadDeadline: uploadDeadline.toISOString()
      };
    });

    res.json(photos);
  } catch (err) {
    console.error('Get photos error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add this new DELETE endpoint for deleting photos:

app.delete('/api/delete-cleanup/:photoId', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.photoId,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check if within grace period (30 mins after booking end)
    const [startStr, endStr] = booking.timeSlot.split('-');
    const [endHour, endMinute] = endStr.split(':').map(Number);

    const slotEnd = new Date(booking.date);
    slotEnd.setHours(endHour, endMinute, 0, 0);

    const uploadDeadline = new Date(slotEnd.getTime() + 30 * 60 * 1000);
    const now = new Date();

    if (now > uploadDeadline) {
      return res.status(400).json({
        error: 'Cannot delete photo after grace period (30 minutes after booking end)'
      });
    }

    // Delete the photo
    booking.checkOutPhoto = null;
    await booking.save();

    res.json({
      message: 'Photo deleted successfully',
      success: true
    });
  } catch (err) {
    console.error('Delete photo error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== AVAILABILITY ROUTES ====================

app.get('/api/availability', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0);
    const now = new Date();

    const bookings = await Booking.find({
      date: { $gte: startDate, $lte: endDate },
      status: 'upcoming'
    });

    const availability = {};
    const daysInMonth = endDate.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (currentDate < today) {
        continue;
      }

      const dayBookings = bookings.filter(b =>
        new Date(b.date).getDate() === day
      );

      let totalAvailableSlots = 14;

      if (currentDate.getTime() === today.getTime()) {
        const currentHour = now.getHours();

        if (currentHour >= 22) {
          availability[day] = 'past';
          continue;
        }

        if (currentHour >= 8) {
          if (currentHour >= 21) {
            totalAvailableSlots = 1;
          } else {
            const passedSlots = Math.min(14, currentHour - 8 + 1);
            totalAvailableSlots = 14 - passedSlots;
          }
        }
      }

      const bookedSlots = dayBookings.length;
      const availableSlots = totalAvailableSlots - bookedSlots;

      if (availableSlots <= 0) {
        availability[day] = 'full';
      } else if (availableSlots <= totalAvailableSlots / 2) {
        availability[day] = 'filling';
      } else {
        availability[day] = 'available';
      }
    }

    res.json(availability);
  } catch (err) {
    console.error('Get availability error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/timeslots', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const selectedDate = new Date(date);
    const now = new Date();

    const timeSlots = [
      { id: 1, time: '06:00-07:30' },
      { id: 2, time: '07:30-09:00' },
      { id: 3, time: '09:00-10:30' },
      { id: 4, time: '10:30-12:00' },
      { id: 5, time: '12:00-13:30' },
      { id: 6, time: '13:30-15:00' },
      { id: 7, time: '15:00-16:30' },
      { id: 8, time: '16:30-18:00' },
      { id: 9, time: '18:00-19:30' },
      { id: 10, time: '19:30-21:00' },
      { id: 11, time: '21:00-22:30' }
    ];

    const bookings = await Booking.find({
      date: {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
      },
      status: 'upcoming'
    });

    const bookedSlots = bookings.map(b => b.timeSlot);
    const isToday = selectedDate.toDateString() === now.toDateString();

    const availableSlots = timeSlots.map(slot => {
      const isBooked = bookedSlots.includes(slot.time);
      let isAvailable = !isBooked;
      let isPast = false;

      if (isToday) {
        const timeSlotStart = slot.time.split('-')[0];
        const [hours, minutes] = timeSlotStart.split(':').map(Number);
        const slotStartTime = new Date(selectedDate);
        slotStartTime.setHours(hours, minutes, 0, 0);

        if (slotStartTime <= now) {
          isPast = true;
          isAvailable = false;
        }
      }

      return {
        ...slot,
        available: isAvailable,
        booked: isBooked,
        isPast: isPast
      };
    });

    res.json(availableSlots);
  } catch (err) {
    console.error('Get time slots error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/bookings', authenticateToken, isAdmin, async (req, res) => {
  try {
    // First, update any past bookings that are still marked as "upcoming"
    const now = new Date();
    const upcomingBookings = await Booking.find({ status: 'upcoming' });

    for (const booking of upcomingBookings) {
      const timeSlotEnd = booking.timeSlot.split('-')[1];
      const [hours, minutes] = timeSlotEnd.split(':').map(Number);
      const bookingEndTime = new Date(booking.date);
      bookingEndTime.setHours(hours, minutes, 0, 0);

      // If booking has passed, mark it as completed
      if (bookingEndTime <= now) {
        await Booking.findByIdAndUpdate(booking._id, { status: 'completed' });
      }
    }

    // Now fetch all bookings with updated statuses
    const bookings = await Booking.find()
      .populate('userId', 'name email studentId')
      .sort({ date: -1, timeSlot: 1 });

    res.json(bookings);
  } catch (err) {
    console.error('Admin get bookings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // ✅ Count both students and admins
    const totalStudents = await User.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    const totalUsers = totalStudents + totalAdmins;

    const totalBookings = await Booking.countDocuments();
    const upcomingBookings = await Booking.countDocuments({
      status: 'upcoming',
      date: { $gte: new Date() }
    });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    res.json({
      totalUsers,        // Total of both students and admins
      totalStudents,     // Just students
      totalAdmins,       // Just admins
      totalBookings,
      upcomingBookings,
      completedBookings
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== COMPLAINTS ROUTES ====================

app.post('/api/complaints', authenticateToken, upload.array('photos', 5), async (req, res) => {
  try {
    const { subject, category, description, urgency, location, date } = req.body;

    if (!subject || !category || !description) {
      return res.status(400).json({ error: 'Subject, category, and description are required' });
    }

    const photos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const complaint = new Complaint({
      userId: req.user.id,
      subject,
      category,
      description,
      urgency: urgency || 'medium',
      location: location || '',
      date: date ? new Date(date) : new Date(),
      photos,
      status: 'pending'
    });

    await complaint.save();

    try {
      const user = await User.findById(req.user.id);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `New Complaint: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">New Complaint Received</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>From:</strong> ${user.name} (${user.email})</p>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Urgency:</strong> ${urgency}</p>
              <p><strong>Location:</strong> ${location || 'Not specified'}</p>
              <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Description:</strong></p>
              <p>${description}</p>
            </div>
            ${photos.length > 0 ? `<p><strong>${photos.length}</strong> photo(s) attached</p>` : ''}
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending complaint notification:', emailError);
    }

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: {
        id: complaint._id,
        subject: complaint.subject,
        category: complaint.category,
        status: complaint.status,
        createdAt: complaint.createdAt
      }
    });
  } catch (err) {
    console.error('Submit complaint error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/complaints', authenticateToken, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    const formattedComplaints = complaints.map(complaint => ({
      id: complaint._id,
      subject: complaint.subject,
      category: complaint.category,
      description: complaint.description,
      urgency: complaint.urgency,
      location: complaint.location,
      date: complaint.date,
      photos: complaint.photos,
      status: complaint.status,
      adminResponse: complaint.adminResponse,
      createdAt: complaint.createdAt,
      resolvedAt: complaint.resolvedAt
    }));

    res.json(formattedComplaints);
  } catch (err) {
    console.error('Get complaints error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/complaints/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email studentId');

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(complaint);
  } catch (err) {
    console.error('Get complaint error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/complaints/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (complaint.status !== 'pending') {
      return res.status(400).json({
        error: 'Cannot delete complaints that are already under review or resolved'
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({ message: 'Complaint deleted successfully' });
  } catch (err) {
    console.error('Delete complaint error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/complaints', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate('userId', 'name email studentId')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error('Admin get complaints error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/admin/complaints/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email');

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (status) {
      complaint.status = status;
      if (status === 'resolved') {
        complaint.resolvedAt = new Date();
      }
    }

    if (adminResponse) {
      complaint.adminResponse = adminResponse;
    }

    await complaint.save();

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: complaint.userId.email,
        subject: `Complaint Update: ${complaint.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Complaint Status Update</h2>
            <p>Hi ${complaint.userId.name},</p>
            <p>Your complaint has been updated:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Subject:</strong> ${complaint.subject}</p>
              <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">${status.toUpperCase()}</span></p>
              ${adminResponse ? `
                <p><strong>Admin Response:</strong></p>
                <p>${adminResponse}</p>
              ` : ''}
            </div>
            <p>Thank you for helping us maintain our facilities!</p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending update notification:', emailError);
    }

    res.json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (err) {
    console.error('Update complaint error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/complaints/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const underReview = await Complaint.countDocuments({ status: 'under-review' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });

    const complaintsByCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const complaintsByUrgency = await Complaint.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      total: totalComplaints,
      pending: pendingComplaints,
      underReview: underReview,
      resolved: resolvedComplaints,
      byCategory: complaintsByCategory,
      byUrgency: complaintsByUrgency
    });
  } catch (err) {
    console.error('Complaint stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



app.post('/api/auth/register-admin', async (req, res) => {
  try {
    const { name, email, password, adminId } = req.body;  // ← Changed from studentId

    if (!name || !email || !password || !adminId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { adminId }] });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email or ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      adminId,
      role: 'admin'
    });

    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        adminId: admin.adminId,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});


app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get all students
    const students = await User.find().select('-password');

    // Get all admins
    const admins = await Admin.find().select('-password');

    // Combine and format
    const allUsers = [
      ...students.map(s => ({
        ...s._doc,
        userId: s.studentId
      })),
      ...admins.map(a => ({
        ...a._doc,
        userId: a.adminId
      }))
    ];

    res.json(allUsers);
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ADMIN PHOTOS ROUTE ====================

app.get('/api/admin/photos', authenticateToken, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({
      checkOutPhoto: { $exists: true, $ne: null }
    })
      .populate('userId', 'name email studentId')
      .sort({ date: -1 });

    const photos = bookings.map(booking => ({
      id: booking._id,
      studentName: booking.userId.name,
      studentEmail: booking.userId.email,
      studentId: booking.userId.studentId,
      date: booking.date,
      timeSlot: booking.timeSlot,
      photoUrl: booking.checkOutPhoto,
      status: booking.status,
      uploadedAt: booking.createdAt
    }));

    res.json(photos);
  } catch (err) {
    console.error('Get admin photos error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ==================== ADMIN PHOTO DELETE ROUTE ====================

app.delete('/api/admin/photos/delete', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { photoIds } = req.body;

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({ error: 'No photo IDs provided' });
    }

    console.log('Deleting photos:', photoIds);

    // Find all bookings with these IDs
    const bookings = await Booking.find({
      _id: { $in: photoIds }
    });

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'No photos found' });
    }

    // Optional: Delete physical files from filesystem
    const fs = require('fs');
    const path = require('path');

    for (const booking of bookings) {
      if (booking.checkOutPhoto) {
        const filePath = path.join(__dirname, booking.checkOutPhoto);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Deleted file:', filePath);
          }
        } catch (fileErr) {
          console.error('Error deleting file:', fileErr);
          // Continue even if file deletion fails
        }
      }
    }

    // Remove photo references from database
    const result = await Booking.updateMany(
      { _id: { $in: photoIds } },
      { $set: { checkOutPhoto: null } }
    );

    console.log(`Updated ${result.modifiedCount} bookings`);

    res.json({
      message: `Successfully deleted ${photoIds.length} photo(s)`,
      deletedCount: result.modifiedCount,
      success: true
    });

  } catch (err) {
    console.error('Delete photos error:', err);
    res.status(500).json({ error: 'Server error while deleting photos' });
  }
});

// Add these routes to your server.js

// Get single admin by ID
app.post('/get_admin', authenticateToken, async (req, res) => {
  try {
    const { id } = req.body;

    // Check both User and Admin collections
    let admin = await Admin.findById(id).select('-password');

    if (!admin) {
      admin = await User.findById(id).select('-password');
    }

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      name: admin.name,
      email: admin.email,
      adminId: admin.adminId || admin.studentId
    });
  } catch (err) {
    console.error('Get admin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update admin profile
app.post('/update_admin_profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Try to find in Admin collection first
    let admin = await Admin.findById(userId);

    if (!admin) {
      admin = await User.findById(userId);
    }

    if (!admin) {
      return res.status(404).json({
        data: 'error',
        msg: 'Admin not found'
      });
    }

    // Update name only (email is read-only)
    admin.name = name;

    await admin.save();

    res.json({
      data: 'success',
      msg: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Update admin profile error:', err);
    res.status(500).json({
      data: 'error',
      msg: 'Server error'
    });
  }
});



app.post('/api/auth/reset-password-studentid', async (req, res) => {
  try {
    const { email, studentId, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !studentId || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    // Find user by email AND studentId (both must match)
    let user = await User.findOne({
      email: email.toLowerCase().trim(),
      studentId: studentId.trim()
    });

    if (!user) {
      // Check admin collection
      user = await Admin.findOne({
        email: email.toLowerCase().trim(),
        adminId: studentId.trim()
      });
    }

    if (!user) {
      return res.status(400).json({
        error: 'Invalid credentials. Email and Student/Admin ID do not match.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});



// ==================== SERVER ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});