import axios from 'axios';

/**
 * BharatBenefits AI - Central API Service
 * Interacts with FastAPI Backend running at http://localhost:8000
 */
const BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Check backend health status
 * @returns {Promise<Object>} APIResponse object { success, message, data }
 */
export const getHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.warn('[API Service] getHealth error:', error.message);
    return { success: false, message: error.message, data: { status: 'offline' } };
  }
};

/**
 * Fetch list of all schemes with pagination
 * @param {number} [skip=0] - Number of items to skip
 * @param {number} [limit=100] - Maximum number of items to return
 * @returns {Promise<Object>} APIResponse object containing list of schemes
 */
export const getSchemes = async (skip = 0, limit = 100) => {
  try {
    const response = await apiClient.get('/schemes', {
      params: { skip, limit },
    });
    return response.data;
  } catch (error) {
    console.warn('[API Service] getSchemes error:', error.message);
    return { success: false, message: error.message, data: [] };
  }
};

/**
 * Retrieve details of a specific scheme by scheme ID
 * @param {string} schemeId - The scheme ID (e.g. 'SCH0001')
 * @returns {Promise<Object>} APIResponse object containing scheme details
 */
export const getSchemeById = async (schemeId) => {
  try {
    const response = await apiClient.get(`/schemes/${encodeURIComponent(schemeId)}`);
    return response.data;
  } catch (error) {
    console.warn(`[API Service] getSchemeById('${schemeId}') error:`, error.message);
    return { success: false, message: error.message, data: null };
  }
};

/**
 * Search schemes based on demographic & category filters
 * @param {Object} filters - Search filter parameters
 * @param {string} [filters.category] - Category filter
 * @param {string} [filters.state] - State filter
 * @param {number} [filters.age] - Target age limit
 * @param {number} [filters.income] - Income threshold
 * @param {string} [filters.occupation] - Occupation filter
 * @param {string} [filters.education] - Education level filter
 * @returns {Promise<Object>} APIResponse object with matching schemes
 */
export const searchSchemes = async (filters = {}) => {
  try {
    const response = await apiClient.get('/schemes/search', {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.warn('[API Service] searchSchemes error:', error.message);
    return { success: false, message: error.message, data: [] };
  }
};

/**
 * Fetch list of pre-calculated future scheme opportunities
 * @returns {Promise<Object>} APIResponse object containing future opportunity records
 */
export const getFutureOpportunities = async () => {
  try {
    const response = await apiClient.get('/future-opportunities');
    return response.data;
  } catch (error) {
    console.warn('[API Service] getFutureOpportunities error:', error.message);
    return { success: false, message: error.message, data: [] };
  }
};

/**
 * Submit applicant citizen profile to trigger rule-based AI recommendation engine
 * @param {Object} profile - Citizen profile input object
 * @returns {Promise<Object>} APIResponse containing eligible schemes, future opportunities, recommended bundle, confidence score, & AI explanation
 */
export const getRecommendation = async (profile) => {
  try {
    const response = await apiClient.post('/recommend', profile);
    return response.data;
  } catch (error) {
    console.warn('[API Service] getRecommendation error:', error.message);
    return { success: false, message: error.message, data: null };
  }
};

// Aliased exports for backward compatibility across context providers
export const checkHealth = getHealth;
export const fetchSchemes = getSchemes;
export const fetchSchemeById = getSchemeById;
export const fetchFutureOpportunities = getFutureOpportunities;
export const getRecommendations = getRecommendation;
