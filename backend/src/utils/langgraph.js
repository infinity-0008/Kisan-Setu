import { ChatOpenAI } from "@langchain/openai";
import Scheme from "../models/scheme.model.js";
import logger from "./logger.js";

/**
 * LangGraph Pipeline for Kisan Setu
 * Handles: intent classification → RAG retrieval → eligibility → response generation
 */

// Initialize LLM
const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.3,
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Step 1: Intent Classification
 */
export const classifyIntent = async (query) => {
  try {
    const prompt = `Classify this farmer's query into one of these intents:
    - scheme_eligibility: asking if they qualify for a scheme
    - application_help: asking how to apply for something
    - crop_selling: asking about selling crops or prices
    - video_request: asking for educational videos
    - general_query: anything else

    Query: "${query}"

    Return ONLY the intent category name.`;

    const response = await llm.invoke(prompt);
    const intent = response.content.toString().trim().toLowerCase();

    const validIntents = [
      "scheme_eligibility",
      "application_help",
      "crop_selling",
      "video_request",
      "general_query",
    ];

    return validIntents.includes(intent) ? intent : "general_query";
  } catch (error) {
    logger.error(`Intent classification error: ${error.message}`);
    return "general_query";
  }
};

/**
 * Step 2: RAG Retrieval from MongoDB Vector Store
 */
export const retrieveRelevantSchemes = async (farmer, query, topK = 5) => {
  try {
    // Use MongoDB text search as vector substitute
    // In production: use MongoDB Atlas Vector Search with embeddings
    const schemes = await Scheme.find({
      isActive: true,
      $or: [{ state: farmer.state }, { state: "All India" }],
      $text: { $search: query },
    })
      .limit(topK)
      .sort({ score: { $meta: "textScore" } });

    if (schemes.length === 0) {
      // Fallback: return top schemes for farmer's state
      return await Scheme.find({
        isActive: true,
        $or: [{ state: farmer.state }, { state: "All India" }],
      }).limit(topK);
    }

    return schemes;
  } catch (error) {
    logger.error(`RAG retrieval error: ${error.message}`);
    return [];
  }
};

/**
 * Step 3: Eligibility Reasoning
 */
export const reasonEligibility = (farmer, scheme) => {
  const checks = [];

  // PM-KISAN checks
  if (scheme.schemeCode === "PM-KISAN") {
    checks.push({
      criterion: "Land holding",
      required: "> 0 acres",
      actual: `${farmer.landHolding} acres`,
      pass: farmer.landHolding > 0,
    });
    checks.push({
      criterion: "Already registered",
      required: "Not already registered",
      actual: farmer.beneficiaryStatus?.pmKisan ? "Already registered" : "Not registered",
      pass: !farmer.beneficiaryStatus?.pmKisan,
    });
  }

  // PMFBY checks
  if (scheme.schemeCode === "PMFBY") {
    checks.push({
      criterion: "Active crops",
      required: "At least one crop sown",
      actual: `${farmer.cropsGrown?.length || 0} crops`,
      pass: (farmer.cropsGrown?.length || 0) > 0,
    });
  }

  // KCC checks
  if (scheme.schemeCode === "KCC") {
    checks.push({
      criterion: "Land holding",
      required: "> 0 acres",
      actual: `${farmer.landHolding} acres`,
      pass: farmer.landHolding > 0,
    });
  }

  // PM Dhan Dhanya Krishi Yojana checks
  if (scheme.schemeCode === "PM-DDKY") {
    checks.push({
      criterion: "Cultivable land",
      required: "> 0 acres",
      actual: `${farmer.landHolding} acres`,
      pass: farmer.landHolding > 0,
    });
    checks.push({
      criterion: "Small/marginal farmer priority",
      required: "< 2 hectares preferred",
      actual: `${farmer.landHolding} acres`,
      pass: farmer.landHolding <= 2,
    });
    checks.push({
      criterion: "Active crops",
      required: "At least one crop sown",
      actual: `${farmer.cropsGrown?.length || 0} crops`,
      pass: (farmer.cropsGrown?.length || 0) > 0,
    });
  }

  // State check (for non-central schemes)
  if (scheme.state !== "All India") {
    checks.push({
      criterion: "State eligibility",
      required: scheme.state,
      actual: farmer.state,
      pass: farmer.state === scheme.state,
    });
  }

  const passed = checks.filter((c) => c.pass).length;
  const total = checks.length;
  const confidence = total > 0 ? passed / total : 0;

  return {
    eligible: passed === total,
    checks,
    confidence,
    summary: `Passed ${passed}/${total} eligibility criteria`,
  };
};

/**
 * Step 4: Response Generation with Source Citation
 */
export const generateCitedResponse = async (farmer, query, schemes, eligibility) => {
  try {
    const schemeContext = schemes
      .map(
        (s, i) =>
          `[${i + 1}] ${s.name} (${s.schemeCode}): ${s.eligibilityCriteria || "No criteria specified"}`
      )
      .join("\n");

    const eligibilityContext = eligibility
      ? `\nEligibility Analysis:\n${eligibility.checks.map((c) => `- ${c.criterion}: ${c.pass ? "PASS" : "FAIL"} (${c.actual} vs ${c.required})`).join("\n")}`
      : "";

    const prompt = `You are Kisan Setu, a Hindi-first assistant helping Indian farmers.

Farmer Profile:
- Name: ${farmer.name}
- State: ${farmer.state}, District: ${farmer.district}
- Land: ${farmer.landHolding} acres
- Crops: ${farmer.cropsGrown?.join(", ") || "Not specified"}

Relevant Government Schemes:
${schemeContext}

${eligibilityContext}

Query: "${query}"

Generate a helpful, plain-language response in Hindi (with English terms for scheme names).
Include the source scheme codes in brackets like [PM-KISAN] when referencing them.
If eligibility is low confidence, suggest visiting the nearest CSC.`;

    const response = await llm.invoke(prompt);

    return {
      text: response.content.toString(),
      sources: schemes.map((s) => ({
        schemeCode: s.schemeCode,
        name: s.name,
      })),
      confidence: eligibility?.confidence || 0.5,
    };
  } catch (error) {
    logger.error(`Response generation error: ${error.message}`);
    return {
      text: "क्षमा करें, आपके प्रश्न का उत्तर देने में असमर्थ हैं। कृपया अपने निकटतम CSC से संपर्क करें।",
      sources: [],
      confidence: 0,
    };
  }
};

/**
 * Full Pipeline: Query → Intent → Retrieve → Reason → Respond
 */
export const runPipeline = async (farmer, query) => {
  try {
    // Step 1: Classify intent
    const intent = await classifyIntent(query);
    logger.info(`Pipeline intent: ${intent}`);

    // Step 2: Retrieve relevant schemes
    const schemes = await retrieveRelevantSchemes(farmer, query);

    // Step 3: Check eligibility for top scheme
    let eligibility = null;
    if (schemes.length > 0 && intent === "scheme_eligibility") {
      eligibility = reasonEligibility(farmer, schemes[0]);
    }

    // Step 4: Generate response
    const response = await generateCitedResponse(farmer, query, schemes, eligibility);

    // Step 5: Escalation check
    const needsEscalation = response.confidence < 0.5;

    return {
      intent,
      schemes,
      eligibility,
      response,
      needsEscalation,
    };
  } catch (error) {
    logger.error(`Pipeline error: ${error.message}`);
    throw error;
  }
};
