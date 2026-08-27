import logger from "./logger.js";
import Scheme from "../models/scheme.model.js";
import Farmer from "../models/farmer.model.js";

/**
 * RAG Pipeline - Retrieval Augmented Generation
 * For hackathon: uses MongoDB text search as vector substitute
 * In production: replace with LangGraph.js + ChromaDB/MongoDB Atlas Vector Search
 */

/**
 * Classify user intent from query text
 * @param {string} query - user query
 * @returns {string} intent type
 */
export const classifyIntent = (query) => {
  const lowerQuery = query.toLowerCase();

  if (
    lowerQuery.includes("eligible") ||
    lowerQuery.includes("apply") ||
    lowerQuery.includes("scheme") ||
    lowerQuery.includes("yojana")
  ) {
    return "scheme_eligibility";
  }
  if (
    lowerQuery.includes("sell") ||
    lowerQuery.includes("price") ||
    lowerQuery.includes("mandi") ||
    lowerQuery.includes("rate")
  ) {
    return "crop_selling";
  }
  if (
    lowerQuery.includes("help") ||
    lowerQuery.includes("guide") ||
    lowerQuery.includes("process")
  ) {
    return "application_help";
  }
  return "general_query";
};

/**
 * Retrieve relevant schemes based on farmer profile and query
 * @param {Object} farmer - farmer profile
 * @param {string} query - user query
 * @returns {Array} relevant schemes
 */
export const retrieveSchemes = async (farmer, query) => {
  try {
    // Step 1: Pre-filter by farmer's state and land
    const filter = {
      isActive: true,
      $or: [{ state: farmer.state }, { state: "All India" }],
    };

    // Step 2: Text search for relevant schemes
    const schemes = await Scheme.find(filter)
      .limit(5)
      .sort({ createdAt: -1 });

    // Step 3: Simple relevance scoring
    const scored = schemes.map((scheme) => {
      let score = 0;
      const q = query.toLowerCase();

      if (scheme.name.toLowerCase().includes(q)) score += 3;
      if (scheme.eligibilityCriteria?.toLowerCase().includes(q)) score += 2;
      if (scheme.description?.toLowerCase().includes(q)) score += 1;

      // Boost for farmer's beneficiary status
      if (
        farmer.beneficiaryStatus?.pmKisan &&
        scheme.schemeCode === "PM-KISAN"
      ) {
        score += 2;
      }

      return { scheme: scheme.toObject(), score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map((s) => s.scheme);
  } catch (error) {
    logger.error(`RAG retrieval error: ${error.message}`);
    throw error;
  }
};

/**
 * Check farmer eligibility for a specific scheme
 * @param {Object} farmer - farmer profile
 * @param {Object} scheme - scheme details
 * @returns {Object} eligibility result
 */
export const checkEligibility = (farmer, scheme) => {
  const reasons = [];
  let eligible = true;

  // PM-KISAN checks
  if (scheme.schemeCode === "PM-KISAN") {
    if (farmer.landHolding <= 0) {
      eligible = false;
      reasons.push("PM-KISAN requires minimum land holding");
    }
    if (farmer.beneficiaryStatus?.pmKisan) {
      reasons.push("Already registered under PM-KISAN");
    }
  }

  // PMFBY checks
  if (scheme.schemeCode === "PMFBY") {
    if (farmer.cropsGrown?.length === 0) {
      eligible = false;
      reasons.push("No crops registered in profile");
    }
    if (farmer.beneficiaryStatus?.pmfby) {
      reasons.push("Already enrolled in PMFBY");
    }
  }

  // KCC checks
  if (scheme.schemeCode === "KCC") {
    if (farmer.landHolding <= 0) {
      eligible = false;
      reasons.push("KCC requires land records");
    }
    if (farmer.beneficiaryStatus?.kcc) {
      reasons.push("Already have a Kisan Credit Card");
    }
  }

  // PM Dhan Dhanya Krishi Yojana — priority to small/marginal farmers
  if (scheme.schemeCode === "PM-DDKY") {
    if (farmer.landHolding <= 0) {
      eligible = false;
      reasons.push("Requires cultivable land holding");
    }
    if (farmer.landHolding > 2) {
      reasons.push("Priority given to small/marginal farmers (<2 hectares)");
    }
    if (!farmer.cropsGrown || farmer.cropsGrown.length === 0) {
      eligible = false;
      reasons.push("Active crop sowing required");
    }
  }

  // State check (for non-central schemes)
  if (scheme.state !== "All India" && scheme.state !== farmer.state) {
    eligible = false;
    reasons.push(`Scheme available only in ${scheme.state}`);
  }

  return {
    eligible,
    reasons,
    recommendation: eligible
      ? "You appear to be eligible. Proceed with application."
      : "You do not meet the eligibility criteria for this scheme.",
  };
};

/**
 * Generate response with source citation
 * @param {Object} farmer - farmer profile
 * @param {Array} schemes - retrieved schemes
 * @param {Object} eligibility - eligibility check result
 * @returns {Object} formatted response
 */
export const generateResponse = (farmer, schemes, eligibility) => {
  if (schemes.length === 0) {
    return {
      text: "I couldn't find any matching schemes for your profile. Please try again with different keywords.",
      sources: [],
      confidence: 0.3,
    };
  }

  const topScheme = schemes[0];
  const responseText = `
Based on your profile (${farmer.landHolding} acres in ${farmer.district}, ${farmer.state}):

Eligibility: ${eligibility.eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
Scheme: ${topScheme.name}
Details: ${topScheme.eligibilityCriteria}
Benefits: ${topScheme.benefits?.join(", ") || "See scheme details"}
Application Process: ${topScheme.applicationProcess || "Contact your nearest CSC"}

${eligibility.reasons.length > 0 ? "Notes: " + eligibility.reasons.join(". ") : ""}
  `.trim();

  return {
    text: responseText,
    sources: schemes.map((s) => ({
      schemeCode: s.schemeCode,
      name: s.name,
      source: s.source,
    })),
    confidence: 0.85,
  };
};
