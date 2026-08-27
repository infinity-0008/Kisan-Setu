import logger from "./logger.js";

const AGMARKNET_API_URL =
  "https://agmarknet.gov.in/api/v1/commodity/search";

/**
 * Fetch live mandi prices from Agmarknet/e-NAM
 * @param {string} cropType - e.g., "wheat", "rice"
 * @param {string} state - e.g., "Uttar Pradesh"
 * @returns {Array} Array of mandi price objects
 */
export const fetchMandiPrices = async (cropType, state) => {
  try {
    // For hackathon: return mock data with realistic Agmarknet-like structure
    // In production: replace with actual API call
    const mockPrices = [
      {
        mandiName: `${state} Central Mandi`,
        cropType,
        price: 2050 + Math.floor(Math.random() * 200), // realistic MSP range
        unit: "quintal",
        fetchedAt: new Date(),
        state,
      },
      {
        mandiName: `${state} District Mandi`,
        cropType,
        price: 2000 + Math.floor(Math.random() * 150),
        unit: "quintal",
        fetchedAt: new Date(),
        state,
      },
      {
        mandiName: `${state} Block Market`,
        cropType,
        price: 1950 + Math.floor(Math.random() * 250),
        unit: "quintal",
        fetchedAt: new Date(),
        state,
      },
    ];

    logger.info(`Fetched mandi prices for ${cropType} in ${state}`);
    return mockPrices;
  } catch (error) {
    logger.error(`Agmarknet API error: ${error.message}`);
    throw error;
  }
};

/**
 * Compare farmer's expected price with mandi prices
 * @param {number} expectedPrice - farmer's listed price
 * @param {Array} mandiPrices - array of mandi price objects
 * @returns {Object} comparison result
 */
export const comparePrices = (expectedPrice, mandiPrices) => {
  const avgMandiPrice =
    mandiPrices.reduce((sum, m) => sum + m.price, 0) / mandiPrices.length;
  const highestMandi = Math.max(...mandiPrices.map((m) => m.price));
  const lowestMandi = Math.min(...mandiPrices.map((m) => m.price));

  return {
    expectedPrice,
    averageMandiPrice: Math.round(avgMandiPrice),
    highestMandiPrice: highestMandi,
    lowestMandiPrice: lowestMandi,
    priceDifference: expectedPrice - avgMandiPrice,
    recommendation:
      expectedPrice > highestMandi * 1.1
        ? "Your price is significantly above mandi rates. Consider lowering to attract buyers."
        : expectedPrice < lowestMandi * 0.9
          ? "Your price is well below mandi rates. You might be underselling."
          : "Your price is competitive with current mandi rates.",
  };
};
