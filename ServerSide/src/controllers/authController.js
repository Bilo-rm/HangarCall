const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User,Restaurant  } = require("../models");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user with their restaurant (if they own one)
    const user = await User.findOne({ 
      where: { email },
      include: [
        {
          model: Restaurant,
          as: 'OwnedRestaurant',
          required: false // LEFT JOIN - user might not have a restaurant
        }
      ]
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Prepare token payload
    const tokenPayload = { 
      id: user.id, 
      role: user.role 
    };

    // Add restaurant ID to token if user is a restaurant owner and has a restaurant
    if (user.role === 'restaurant' && user.OwnedRestaurant) {
      tokenPayload.restaurantId = user.OwnedRestaurant.id;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    // Prepare user response
    const userResponse = { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    };

    // Add restaurant info to response if available
    if (user.OwnedRestaurant) {
      userResponse.restaurant = {
        id: user.OwnedRestaurant.id,
        name: user.OwnedRestaurant.name,
        location: user.OwnedRestaurant.location,
        suspended: user.OwnedRestaurant.suspended
      };
    }

    res.json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};