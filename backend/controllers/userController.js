const User = require('../models/User');

function sanitizeUser(user) {
  if (!user) return null;
  const doc = user.toObject ? user.toObject() : user;
  delete doc.password;
  return doc;
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bio, org, focusDuration, settings } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Name required' });
    }

    const $set = { name: String(name).trim() };
    if (email !== undefined) $set.email = String(email).trim();
    if (phone !== undefined) $set.phone = String(phone).trim();
    if (bio !== undefined) $set.bio = bio;
    if (org !== undefined) $set.org = org;
    if (focusDuration !== undefined) $set.focusDuration = focusDuration;
    if (settings !== undefined) $set.settings = settings;

    const user = await User.findByIdAndUpdate(req.user.id, { $set }, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (err) {
    console.error('updateProfile error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
