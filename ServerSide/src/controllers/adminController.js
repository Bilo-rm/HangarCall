const { User, Restaurant, Menu, Order, OrderItem } = require('../models'); // Adjust path as needed
const bcrypt = require('bcrypt');

class AdminController {


  // Get all users
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Restaurant,
            as: 'OwnedRestaurant',
            attributes: ['id', 'name', 'location', 'suspended']
          }
        ]
      });
      
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  }

  // Create new user
  static async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'user'
      });

      // Remove password from response
      const userResponse = { ...user.toJSON() };
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: userResponse
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update user
      await user.update({ name, email, role });

      // Remove password from response
      const userResponse = { ...user.toJSON() };
      delete userResponse.password;

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: userResponse
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      });
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.destroy();

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  }

  // =======================
  // RESTAURANT MANAGEMENT
  // =======================

  // Get all restaurants
  static async getAllRestaurants(req, res) {
    try {
      const restaurants = await Restaurant.findAll({
        include: [
          {
            model: User,
            as: 'Owner',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: restaurants
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching restaurants',
        error: error.message
      });
    }
  }

  // Create restaurant
  static async createRestaurant(req, res) {
    try {
      const { name, location, image, userId } = req.body;

      // Validate required fields
      if (!name || !location) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant name and location are required'
        });
      }

      // If userId is provided, validate the user exists and has restaurant role
      if (userId) {
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: 'User not found'
          });
        }

        if (user.role !== 'restaurant') {
          return res.status(400).json({
            success: false,
            message: 'User must have restaurant role to own a restaurant'
          });
        }

        // Check if user already owns a restaurant
        const existingRestaurant = await Restaurant.findOne({ where: { userId } });
        if (existingRestaurant) {
          return res.status(400).json({
            success: false,
            message: 'User already owns a restaurant'
          });
        }
      }

      // Create restaurant
      const restaurant = await Restaurant.create({
        name,
        location,
        image,
        userId
      });

      // Fetch restaurant with owner details
      const restaurantWithOwner = await Restaurant.findByPk(restaurant.id, {
        include: [
          {
            model: User,
            as: 'Owner',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Restaurant created successfully',
        data: restaurantWithOwner
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating restaurant',
        error: error.message
      });
    }
  }

  // Assign restaurant to user
  static async assignRestaurantToUser(req, res) {
    try {
      const { restaurantId, userId } = req.body;

      // Validate required fields
      if (!restaurantId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID and User ID are required'
        });
      }

      // Check if restaurant exists
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Check if user exists and has restaurant role
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.role !== 'restaurant') {
        return res.status(400).json({
          success: false,
          message: 'User must have restaurant role to own a restaurant'
        });
      }

      // Check if user already owns a restaurant
      const existingRestaurant = await Restaurant.findOne({ where: { userId } });
      if (existingRestaurant && existingRestaurant.id !== restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'User already owns another restaurant'
        });
      }

      // Assign restaurant to user
      await restaurant.update({ userId });

      // Fetch updated restaurant with owner details
      const updatedRestaurant = await Restaurant.findByPk(restaurantId, {
        include: [
          {
            model: User,
            as: 'Owner',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Restaurant assigned to user successfully',
        data: updatedRestaurant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error assigning restaurant to user',
        error: error.message
      });
    }
  }

  // Update restaurant
  static async updateRestaurant(req, res) {
    try {
      const { id } = req.params;
      const { name, location, image, suspended } = req.body;

      const restaurant = await Restaurant.findByPk(id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Update restaurant
      await restaurant.update({ name, location, image, suspended });

      // Fetch updated restaurant with owner details
      const updatedRestaurant = await Restaurant.findByPk(id, {
        include: [
          {
            model: User,
            as: 'Owner',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Restaurant updated successfully',
        data: updatedRestaurant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating restaurant',
        error: error.message
      });
    }
  }

  // Suspend/Unsuspend restaurant
  static async toggleRestaurantSuspension(req, res) {
    try {
      const { id } = req.params;

      const restaurant = await Restaurant.findByPk(id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Toggle suspension status
      await restaurant.update({ suspended: !restaurant.suspended });

      res.status(200).json({
        success: true,
        message: `Restaurant ${restaurant.suspended ? 'suspended' : 'unsuspended'} successfully`,
        data: { id: restaurant.id, suspended: restaurant.suspended }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error toggling restaurant suspension',
        error: error.message
      });
    }
  }

  // Delete restaurant
  static async deleteRestaurant(req, res) {
    try {
      const { id } = req.params;

      const restaurant = await Restaurant.findByPk(id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      await restaurant.destroy();

      res.status(200).json({
        success: true,
        message: 'Restaurant deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting restaurant',
        error: error.message
      });
    }
  }

  // =======================
  // DASHBOARD STATS
  // =======================

  // Get admin dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const [
        totalUsers,
        totalRestaurants,
        totalOrders,
        suspendedRestaurants,
        restaurantUsers,
        regularUsers
      ] = await Promise.all([
        User.count(),
        Restaurant.count(),
        Order.count(),
        Restaurant.count({ where: { suspended: true } }),
        User.count({ where: { role: 'restaurant' } }),
        User.count({ where: { role: 'user' } })
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalRestaurants,
          totalOrders,
          suspendedRestaurants,
          restaurantUsers,
          regularUsers,
          adminUsers: totalUsers - restaurantUsers - regularUsers
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard statistics',
        error: error.message
      });
    }
  }

  // Get users with restaurant role who don't have a restaurant assigned
  static async getUnassignedRestaurantUsers(req, res) {
    try {
      const unassignedUsers = await User.findAll({
        where: { role: 'restaurant' },
        include: [
          {
            model: Restaurant,
            as: 'OwnedRestaurant',
            required: false
          }
        ]
      });

      // Filter users who don't have a restaurant
      const usersWithoutRestaurant = unassignedUsers.filter(user => !user.OwnedRestaurant);

      // Remove password from response
      const sanitizedUsers = usersWithoutRestaurant.map(user => {
        const userObj = { ...user.toJSON() };
        delete userObj.password;
        return userObj;
      });

      res.status(200).json({
        success: true,
        data: sanitizedUsers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching unassigned restaurant users',
        error: error.message
      });
    }
  }
}

module.exports = AdminController;