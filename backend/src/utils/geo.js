/**
 * Calculate distance between two geo-coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

/**
 * Find nearest mandis within a radius
 * @param {Array} mandiPrices - array of mandi price objects with optional lat/lon
 * @param {number} farmerLat - farmer's latitude
 * @param {number} farmerLon - farmer's longitude
 * @param {number} maxRadiusKm - max distance in km (default 100)
 * @returns {Array} mandis sorted by distance
 */
export const findNearestMandis = (mandiPrices, farmerLat, farmerLon, maxRadiusKm = 100) => {
  if (!farmerLat || !farmerLon) return mandiPrices;

  return mandiPrices
    .map((mandi) => ({
      ...mandi,
      distanceKm: mandi.latitude && mandi.longitude
        ? haversineDistance(farmerLat, farmerLon, mandi.latitude, mandi.longitude)
        : null,
    }))
    .filter((mandi) => mandi.distanceKm === null || mandi.distanceKm <= maxRadiusKm)
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
};
