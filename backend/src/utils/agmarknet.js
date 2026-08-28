import MandiPriceCache from "../models/mandiPriceCache.model.js";
import { MSP_PRICES, MSP_SCHEME_MAP } from "../constants.js";
import { haversineDistance } from "./geo.js";
import logger from "./logger.js";

/**
 * Fetch mandi prices — first check cache, then mock fresh fetch
 * @param {string} cropType
 * @param {string} state
 * @param {number} farmerLat
 * @param {number} farmerLon
 * @returns {Array} mandi prices with distance
 */
export const fetchMandiPrices = async (cropType, state, farmerLat, farmerLon) => {
  try {
    // Check cache first
    const cached = await MandiPriceCache.find({
      cropType: cropType.toLowerCase(),
      state,
      fetchedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (cached.length > 0) {
      logger.info(`Returning cached mandi prices for ${cropType} in ${state}`);
      return cached.map((m) => {
        const obj = m.toObject();
        if (farmerLat && farmerLon && m.latitude && m.longitude) {
          obj.distanceKm = haversineDistance(farmerLat, farmerLon, m.latitude, m.longitude);
        }
        return obj;
      });
    }

    // Mock fresh fetch from Agmarknet
    const mockMandis = [
      {
        cropType: cropType.toLowerCase(),
        mandiName: `${state} Central Mandi`,
        price: 2050 + Math.floor(Math.random() * 200),
        unit: "quintal",
        state,
        latitude: farmerLat ? farmerLat + (Math.random() - 0.5) * 0.5 : null,
        longitude: farmerLon ? farmerLon + (Math.random() - 0.5) * 0.5 : null,
        fetchedAt: new Date(),
      },
      {
        cropType: cropType.toLowerCase(),
        mandiName: `${state} District Mandi`,
        price: 2000 + Math.floor(Math.random() * 150),
        unit: "quintal",
        state,
        latitude: farmerLat ? farmerLat + (Math.random() - 0.5) * 0.8 : null,
        longitude: farmerLon ? farmerLon + (Math.random() - 0.5) * 0.8 : null,
        fetchedAt: new Date(),
      },
      {
        cropType: cropType.toLowerCase(),
        mandiName: `${state} Block Market`,
        price: 1950 + Math.floor(Math.random() * 250),
        unit: "quintal",
        state,
        latitude: farmerLat ? farmerLat + (Math.random() - 0.5) * 1.2 : null,
        longitude: farmerLon ? farmerLon + (Math.random() - 0.5) * 1.2 : null,
        fetchedAt: new Date(),
      },
    ];

    // Cache the results
    await MandiPriceCache.insertMany(mockMandis);
    logger.info(`Cached ${mockMandis.length} mandi prices for ${cropType} in ${state}`);

    // Add distance if farmer coordinates available
    return mockMandis.map((m) => {
      const obj = { ...m };
      if (farmerLat && farmerLon && m.latitude && m.longitude) {
        obj.distanceKm = haversineDistance(farmerLat, farmerLon, m.latitude, m.longitude);
      }
      return obj;
    });
  } catch (error) {
    logger.error(`Mandi price fetch error: ${error.message}`);
    throw error;
  }
};

/**
 * Compare farmer's price with mandi prices + MSP
 * @param {number} expectedPrice
 * @param {Array} mandiPrices
 * @param {string} cropType
 * @returns {Object} comparison result
 */
export const comparePrices = (expectedPrice, mandiPrices, cropType) => {
  const msp = MSP_PRICES[cropType.toLowerCase()] || null;
  const avgMandiPrice =
    mandiPrices.reduce((sum, m) => sum + m.price, 0) / mandiPrices.length;
  const highestMandi = Math.max(...mandiPrices.map((m) => m.price));
  const lowestMandi = Math.min(...mandiPrices.map((m) => m.price));

  const result = {
    expectedPrice,
    averageMandiPrice: Math.round(avgMandiPrice),
    highestMandiPrice: highestMandi,
    lowestMandiPrice: lowestMandi,
    priceDifference: expectedPrice - avgMandiPrice,
    msp,
    mspScheme: MSP_SCHEME_MAP[cropType.toLowerCase()] || null,
    recommendation: "",
  };

  // MSP cross-check
  if (msp) {
    result.mspAvailable = true;
    if (highestMandi < msp) {
      result.mspRecommendation = `MSP ₹${msp}/quintal is higher than all mandi prices. Consider selling through government procurement centre.`;
    } else {
      result.mspRecommendation = `MSP ₹${msp}/quintal. Open market prices are higher — you may get better rates selling directly.`;
    }
  } else {
    result.mspAvailable = false;
  }

  // General recommendation
  if (expectedPrice > highestMandi * 1.1) {
    result.recommendation = "Your price is significantly above mandi rates. Consider lowering to attract buyers.";
  } else if (expectedPrice < lowestMandi * 0.9) {
    result.recommendation = "Your price is well below mandi rates. You might be underselling.";
  } else {
    result.recommendation = "Your price is competitive with current mandi rates.";
  }

  return result;
};
