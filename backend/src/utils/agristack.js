import logger from "./logger.js";

/**
 * AgriStack integration - Farmer profile verification
 * For hackathon: returns mock data based on AgriStack published schema
 * In production: replace with actual AgriStack API calls
 */

/**
 * Fetch farmer profile from AgriStack by Kisan ID
 * @param {string} kisanId - AgriStack Farmer ID
 * @returns {Object} farmer profile data
 */
export const fetchFarmerProfile = async (kisanId) => {
  try {
    // Mock AgriStack response based on published data schema
    logger.info(`Fetching AgriStack profile for: ${kisanId}`);

    return {
      kisanId,
      name: "Ram Kumar",
      mobile: "9876543210",
      state: "Uttar Pradesh",
      district: "Lucknow",
      village: "Sitapur",
      landHolding: 2.5,
      landParcels: [
        {
          area: 1.5,
          geoRef: {
            type: "Point",
            coordinates: [80.95, 26.85],
          },
          soilType: "alluvial",
          irrigation: "canal",
        },
        {
          area: 1.0,
          geoRef: {
            type: "Point",
            coordinates: [80.96, 26.86],
          },
          soilType: "loamy",
          irrigation: "wells",
        },
      ],
      cropsGrown: ["wheat", "mustard"],
      beneficiaryStatus: {
        pmKisan: true,
        pmfby: true,
        kcc: false,
        pmDhanDhanyaKrishi: false,
      },
      profileVerified: true,
      agriStackLastSynced: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`AgriStack API error: ${error.message}`);
    throw error;
  }
};

/**
 * Verify if farmer exists in AgriStack
 * @param {string} kisanId
 * @param {string} mobile
 * @returns {Object} { verified, profile }
 */
export const verifyFarmer = async (kisanId, mobile) => {
  try {
    const profile = await fetchFarmerProfile(kisanId);
    const verified = profile.mobile === mobile;

    return {
      verified,
      profile: verified ? profile : null,
    };
  } catch (error) {
    logger.error(`AgriStack verification error: ${error.message}`);
    return { verified: false, profile: null };
  }
};
