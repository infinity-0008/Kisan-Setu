import logger from "./logger.js";

/**
 * AgriStack integration - Farmer profile verification & mock registry
 * Easily add or edit records by Mobile Number or Kisan ID below!
 */

export const MOCK_KISAN_REGISTRY = {
  "KISAN123456": {
    name: "Ram Kumar",
    mobile: "9876543210",
    state: "Uttar Pradesh",
    district: "Lucknow",
    village: "Sitapur",
    landHolding: 2.5,
    cropsGrown: ["wheat", "mustard"],
    pmKisan: true,
    pmfby: true,
    kcc: true,
  },
  "KISAN001": {
    name: "Ramlal Singh",
    mobile: "9876543210",
    state: "Uttar Pradesh",
    district: "Hardoi",
    village: "Pali",
    landHolding: 4.5,
    cropsGrown: ["wheat", "rice"],
    pmKisan: true,
    pmfby: false,
    kcc: true,
  },
  "ABHAY9528": {
    name: "Abhay Yadav",
    mobile: "9528972702",
    state: "Uttar Pradesh",
    district: "Agra",
    village: "Basai",
    landHolding: 700,
    cropsGrown: ["vegetables"],
    pmKisan: true,
    pmfby: true,
    kcc: false,
  },
};

/**
 * Fetch farmer profile from AgriStack by Kisan ID or Mobile Number
 */
export const fetchFarmerProfile = async (kisanId, providedMobile = null) => {
  try {
    logger.info(`Fetching AgriStack profile for Kisan ID: ${kisanId}, Mobile: ${providedMobile}`);

    // Search registry by key (Kisan ID), by mobile match, or by name match
    let keyMatch = MOCK_KISAN_REGISTRY[kisanId];
    let matchedKey = kisanId;

    if (!keyMatch) {
      const foundEntry = Object.entries(MOCK_KISAN_REGISTRY).find(
        ([key, item]) => 
          item.mobile === providedMobile || 
          item.mobile === kisanId || 
          item.name?.toLowerCase() === kisanId?.toLowerCase() ||
          key.toLowerCase() === kisanId?.toLowerCase()
      );
      if (foundEntry) {
        matchedKey = foundEntry[0];
        keyMatch = foundEntry[1];
      }
    }

    if (keyMatch) {
      return {
        kisanId: matchedKey,
        name: keyMatch.name,
        mobile: keyMatch.mobile,
        state: keyMatch.state,
        district: keyMatch.district,
        village: keyMatch.village || "Gramin",
        landHolding: keyMatch.landHolding || 3.0,
        landParcels: [
          {
            area: keyMatch.landHolding || 3.0,
            geoRef: { type: "Point", coordinates: [78.0, 27.18] },
            soilType: "alluvial",
            irrigation: "wells",
          },
        ],
        cropsGrown: keyMatch.cropsGrown || ["wheat", "vegetables"],
        beneficiaryStatus: {
          pmKisan: keyMatch.pmKisan ?? true,
          pmfby: keyMatch.pmfby ?? true,
          kcc: keyMatch.kcc ?? false,
          pmDhanDhanyaKrishi: false,
        },
        profileVerified: true,
        agriStackLastSynced: new Date().toISOString(),
      };
    }

    // Dynamic prototype fallback for unlisted numbers
    const mobile = providedMobile || kisanId;
    const autoKisanId = `KISAN${mobile.slice(-6)}`;
    return {
      kisanId: autoKisanId,
      name: `Kisan ${autoKisanId}`,
      mobile,
      state: "Uttar Pradesh",
      district: "Lucknow",
      village: "Gramin",
      landHolding: 3.5,
      landParcels: [
        {
          area: 3.5,
          geoRef: { type: "Point", coordinates: [80.95, 26.85] },
          soilType: "alluvial",
          irrigation: "canal",
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
 */
export const verifyFarmer = async (kisanId, mobile) => {
  try {
    const profile = await fetchFarmerProfile(kisanId, mobile);
    return {
      verified: true,
      profile,
    };
  } catch (error) {
    logger.error(`AgriStack verification error: ${error.message}`);
    return { verified: false, profile: null };
  }
};
