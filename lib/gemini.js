import { GoogleGenerativeAI } from "@google/generative-ai";

// Model cascade: try primary first, fall back if quota exhausted
const MODEL_CASCADE = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];
const MAX_RETRIES_PER_MODEL = 3;

/**
 * Parse the server-suggested retryDelay from a Gemini 429 error message.
 * Falls back to the provided default if parsing fails.
 */
function parseRetryDelay(errMessage, defaultMs) {
    try {
        // Error contains: "Please retry in 3.495s"
        const match = errMessage?.match(/retry in (\d+(?:\.\d+)?)s/i);
        if (match) {
            const suggested = Math.ceil(parseFloat(match[1]) * 1000);
            // Cap at 65s to keep requests reasonable; never less than 3s
            return Math.min(Math.max(suggested, 3000), 65000);
        }
    } catch (_) { /* ignore */ }
    return defaultMs;
}

function isRateLimit(err) {
    return err.message?.includes("429") || err.message?.includes("quota") ||
        err.status === 429 || err.httpStatus === 429;
}

function isServiceError(err) {
    return err.message?.includes("503") || err.status === 503 ||
        err.message?.includes("high demand") || err.message?.includes("Service Unavailable");
}

/**
 * Generate content with automatic model fallback and smart retry.
 * Tries each model in MODEL_CASCADE up to MAX_RETRIES_PER_MODEL times.
 * Uses the server's suggested retryDelay when available.
 *
 * @param {string} apiKey - Gemini API key
 * @param {string} prompt - The prompt string
 * @returns {Promise<string>} - The response text
 * @throws {Error} with .isRateLimit = true if all models are quota-exhausted
 */
export async function geminiGenerate(apiKey, prompt) {
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of MODEL_CASCADE) {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`[Gemini] Trying model: ${modelName}`);

        for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
            try {
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                if (text) {
                    console.log(`[Gemini] ✅ Success with ${modelName} on attempt ${attempt + 1}`);
                    return text;
                }
            } catch (err) {
                const rateLimited = isRateLimit(err);
                const serviceErr = isServiceError(err);

                console.log(
                    `[Gemini] ${modelName} attempt ${attempt + 1}/${MAX_RETRIES_PER_MODEL} — ` +
                    `${rateLimited ? "RATE LIMIT" : serviceErr ? "SERVICE ERROR" : "ERROR"}: ` +
                    err.message?.split("\n")[0]
                );

                if (rateLimited || serviceErr) {
                    // If on last retry for this model, break to try next model
                    if (attempt === MAX_RETRIES_PER_MODEL - 1) {
                        console.log(`[Gemini] Quota exhausted for ${modelName}, trying next model...`);
                        break; // move to next model in cascade
                    }

                    const defaultDelay = rateLimited
                        ? Math.pow(2, attempt) * 3000   // 3s, 6s for rate limits
                        : Math.pow(2, attempt) * 2000;  // 2s, 4s for service errors
                    const delay = rateLimited
                        ? parseRetryDelay(err.message, defaultDelay)
                        : defaultDelay;

                    console.log(`[Gemini] Retrying ${modelName} in ${Math.round(delay / 1000)}s...`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }

                // Non-retryable error (auth, invalid request, etc.) — throw immediately
                throw err;
            }
        }
    }

    // All models exhausted
    const quotaErr = new Error(
        "All Gemini models have exceeded their daily quota. " +
        "Please get a fresh API key from https://aistudio.google.com/app/apikey " +
        "or wait until tomorrow for the quota to reset."
    );
    quotaErr.isRateLimit = true;
    throw quotaErr;
}
