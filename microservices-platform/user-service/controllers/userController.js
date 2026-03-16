
let userProfiles = [];

exports.getProfile = (req, res) => {
  try {
    const userId = req.params.id;
    const profile = userProfiles.find(p => p.userId === userId);

    if (!profile) {

      return res.json({ userId, bio: '', location: '' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

exports.updateProfile = (req, res) => {
  try {
    const userId = req.params.id;
    const { bio, location } = req.body;

    let profile = userProfiles.find(p => p.userId === userId);

    if (profile) {
      profile.bio = bio !== undefined ? bio : profile.bio;
      profile.location = location !== undefined ? location : profile.location;
    } else {
      profile = { userId, bio, location };
      userProfiles.push(profile);
    }

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const userId = req.params.id;
    userProfiles = userProfiles.filter(p => p.userId !== userId);
    res.json({ message: `User ${userId} deleted successfully` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
};
