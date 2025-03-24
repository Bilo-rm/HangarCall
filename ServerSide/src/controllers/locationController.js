const { User } = require("../models");

exports.updateLocation = async (req, res) => {
  try {
    const { location } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.location = location;
    await user.save();
    res.json({ message: "Location updated", location });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
