const express = require('express');
const AdminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();


// Get all users
router.get('/users', authMiddleware, roleMiddleware(["admin"]), AdminController.getAllUsers);

// Create new user
router.post('/users', authMiddleware, roleMiddleware(["admin"]), AdminController.createUser);

// Update user
router.put('/users/:id', authMiddleware, roleMiddleware(["admin"]), AdminController.updateUser);

// Delete user
router.delete('/users/:id', authMiddleware, roleMiddleware(["admin"]), AdminController.deleteUser);

// Get users with restaurant role who don't have a restaurant assigned
router.get('/users/unassigned-restaurant', authMiddleware, roleMiddleware(["admin"]), AdminController.getUnassignedRestaurantUsers);

// Get all restaurants
router.get('/restaurants', authMiddleware, roleMiddleware(["admin"]), AdminController.getAllRestaurants);

// Create restaurant
router.post('/restaurants', authMiddleware, roleMiddleware(["admin"]), AdminController.createRestaurant);

// Update restaurant
router.put('/restaurants/:id', authMiddleware, roleMiddleware(["admin"]), AdminController.updateRestaurant);

// Delete restaurant
router.delete('/restaurants/:id', authMiddleware, roleMiddleware(["admin"]), AdminController.deleteRestaurant);

// Assign restaurant to user
router.post('/restaurants/assign', authMiddleware, roleMiddleware(["admin"]), AdminController.assignRestaurantToUser);

// Toggle restaurant suspension
router.patch('/restaurants/:id/toggle-suspension', authMiddleware, roleMiddleware(["admin"]), AdminController.toggleRestaurantSuspension);

// Get dashboard statistics
router.get('/dashboard/stats', authMiddleware, roleMiddleware(["admin"]), AdminController.getDashboardStats);

module.exports = router;