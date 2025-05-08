// services/timelineService.js
const Timeline = require("../models/Timeline");

/**
 * Service for managing user activity timeline
 */
const timelineService = {
  /**
   * Log a user login event
   * @param {string} userId - The user's ID
   * @param {Object} details - Optional additional details
   * @returns {Promise} Promise resolving to the created timeline entry
   */
  logLogin: async (userId, details = {}) => {
    return await Timeline.create({
      userId,
      action: "login",
      details,
    });
  },

  /**
   * Log a user registration event
   * @param {string} userId - The user's ID
   * @param {Object} details - Optional additional details
   * @returns {Promise} Promise resolving to the created timeline entry
   */
  logRegister: async (userId, details = {}) => {
    return await Timeline.create({
      userId,
      action: "register",
      details,
    });
  },

  /**
   * Log a user logout event
   * @param {string} userId - The user's ID
   * @param {Object} details - Optional additional details
   * @returns {Promise} Promise resolving to the created timeline entry
   */
  logLogout: async (userId, details = {}) => {
    return await Timeline.create({
      userId,
      action: "logout",
      details,
    });
  },

  /**
   * Log adding a favorite
   * @param {string} userId - The user's ID
   * @param {Object} favorite - The favorite that was added
   * @returns {Promise} Promise resolving to the created timeline entry
   */
  logFavoriteAdded: async (userId, favorite) => {
    return await Timeline.create({
      userId,
      action: "favorite_added",
      details: {
        favoriteId: favorite._id,
        pokemonId: favorite.pokemonId,
        pokemonName: favorite.name,
      },
    });
  },

  /**
   * Log removing a favorite
   * @param {string} userId - The user's ID
   * @param {Object} favorite - The favorite that was removed
   * @returns {Promise} Promise resolving to the created timeline entry
   */
  logFavoriteRemoved: async (userId, favorite) => {
    return await Timeline.create({
      userId,
      action: "favorite_removed",
      details: {
        favoriteId: favorite._id,
        pokemonId: favorite.pokemonId,
        pokemonName: favorite.name,
      },
    });
  },

  /**
   * Get timeline entries for a user, sorted by most recent first
   * @param {string} userId - The user's ID
   * @param {number} limit - Maximum number of entries to return
   * @param {number} skip - Number of entries to skip for pagination
   * @returns {Promise} Promise resolving to an array of timeline entries
   */
  getUserTimeline: async (userId, limit = 10, skip = 0) => {
    return await Timeline.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
  },
};

module.exports = timelineService;