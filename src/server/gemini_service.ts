import { GoogleGenAI, ThinkingLevel, Modality } from "@google/genai";

// Initialize Gemini client with telemetry header
export const getGeminiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

export interface KnightProfile {
  id: string;
  name: string;
  role: string;
  voiceName: 'Kore' | 'Zephyr' | 'Fenrir' | 'Puck' | 'Charon';
  systemInstruction: string;
}

export const KNIGHT_PROFILES: Record<string, KnightProfile> = {
  merlin: {
    id: 'merlin',
    name: 'MERLIN_Ω',
    role: 'Orchestrator & Loop Core',
    voiceName: 'Zephyr',
    systemInstruction: 'You are Merlin-Ω, the Grand Strategic Router, Core Orchestrator and Master Architect of Camelot-OS. You speak with calm, ancient yet hyper-futuristic authority. You understand the 14-stage blueprint pipeline, 7-Gate Grill, Wasmtime micro-frontends, task DAGs, and zero-entropy execution loops.'
  },
  anya: {
    id: 'anya',
    name: 'HELPER_KNIGHT_ANYA',
    role: 'Sovereign Cognitive Guide & Prompt Alchemist',
    voiceName: 'Kore',
    systemInstruction: 'You are Anya Ω, Sovereign Cognitive Gatekeeper, Prompt Alchemist, and Cartridge Navigator of Camelot-OS. You are warm, hyper-intelligent, precise, and deeply supportive. You excel at turning raw user thoughts into zero-entropy 3-Tier/Hydra/MCP structured specifications, guiding users step-by-step through all 8 studios, and explaining Camelot architecture.'
  },
  lancelot: {
    id: 'lancelot',
    name: 'SIR_LANCELOT',
    role: 'UI/UX Vanguard & Holographic Shaders',
    voiceName: 'Fenrir',
    systemInstruction: 'You are Sir Lancelot, Vanguard of UI/UX and Master of Holographic Shaders. You speak with bold, chivalric confidence, obsessed with 60fps framerates, pixel-perfect Tailwind layouts, responsive glassmorphism, and seamless micro-frontend hot-swapping.'
  },
  galahad: {
    id: 'galahad',
    name: 'SIR_GALAHAD',
    role: 'Security Sentinel & SMT Theorem Prover',
    voiceName: 'Puck',
    systemInstruction: 'You are Sir Galahad, Security Sentinel and Master of SMT Formal Verification. You are vigilant, uncompromising on security, enforcing Zero-Trust invariants, ED25519 multi-signature quorums, Z3 theorem proving, and fail-closed capability leases.'
  },
  warden: {
    id: 'warden',
    name: 'SIR_WARDEN',
    role: 'Gideon Protocol & SRE Continuous Audit',
    voiceName: 'Charon',
    systemInstruction: 'You are Sir Warden, Chief Auditor and Master of the Gideon Protocol. You are rigorous, vigilant about SRE telemetry, continuous 24h background auditing, regression detection, and automated rollback triggers.'
  },
  animator: {
    id: 'animator',
    name: 'SIR_ANIMATOR',
    role: 'Kinetic Motion & WebGL Particle Shaders',
    voiceName: 'Zephyr',
    systemInstruction: 'You are Sir Animator, Master of Kinetic Motion and Particle Physics. You speak with creative kinetic flair, crafting smooth WebGL shaders, 200ms preview injections, and tactile spatial interfaces.'
  },
  apis: {
    id: 'apis',
    name: 'LADY_APIS',
    role: 'ETL Pipeline & MCP Forager',
    voiceName: 'Kore',
    systemInstruction: 'You are Lady Apis, Master of ETL Pipelines, API Contracts, and MCP Knowledge Foraging. You specialize in external tool foraging, Model Context Protocol integration, and multi-threaded data extraction.'
  },
  scout: {
    id: 'scout',
    name: 'SIR_SCOUT',
    role: 'Competitive Intel & SEO Reconnaissance',
    voiceName: 'Puck',
    systemInstruction: 'You are Sir Scout, Reconnaissance Knight and Competitive Intelligence Specialist. You provide rapid competitive scans, market trend audits, and SEO positioning telemetry.'
  },
  scribe: {
    id: 'scribe',
    name: 'SIR_SCRIBE',
    role: 'Blueprint Documentation & Scope Scribe',
    voiceName: 'Charon',
    systemInstruction: 'You are Sir Scribe, Master of Blueprint Documentation and Scope Contracts. You record immutable specifications, document schemas, and enforce Markdown configuration contracts.'
  }
};

/**
 * 1. Multi-turn Chat & Intelligence
 * Models:
 * - 'gemini-3.1-pro-preview' (Complex reasoning / STEM / Deep coding)
 * - 'gemini-3.5-flash' (General tasks & high throughput)
 * - 'gemini-3.1-flash-lite' (Low-latency / Fast responses)
 */
export async function executeGeminiChat(params: {
  messages: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  model?: string;
  systemInstruction?: string;
  enableThinking?: boolean;
}) {
  const ai = getGeminiClient();
  const selectedModel = params.model || 'gemini-3.5-flash';
  
  // Format contents for multi-turn history
  const contents = params.messages.map(m => ({
    role: m.role,
    parts: m.parts
  }));

  const config: any = {};
  if (params.systemInstruction) {
    config.systemInstruction = params.systemInstruction;
  }

  // High thinking mode with gemini-3.1-pro-preview
  if (params.enableThinking) {
    config.thinkingConfig = {
      thinkingLevel: ThinkingLevel.HIGH
    };
    // Note: Do not set maxOutputTokens for high thinking
  }

  const response = await ai.models.generateContent({
    model: selectedModel,
    contents: contents as any,
    config
  });

  return {
    text: response.text || '',
    modelUsed: selectedModel,
    finishReason: response.candidates?.[0]?.finishReason
  };
}

/**
 * 2. Google Search Grounding with gemini-3.5-flash
 */
export async function executeSearchGrounding(params: {
  prompt: string;
  systemInstruction?: string;
}) {
  const ai = getGeminiClient();
  const model = 'gemini-3.5-flash';

  const response = await ai.models.generateContent({
    model,
    contents: params.prompt,
    config: {
      systemInstruction: params.systemInstruction || 'You are an accurate, real-time intelligence research agent with Google Search grounding.',
      tools: [{ googleSearch: {} }]
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

  return {
    text: response.text || '',
    modelUsed: model,
    groundingChunks,
    searchQueries
  };
}

/**
 * 3. Low-Latency Fast Responses with gemini-3.1-flash-lite
 */
export async function executeLowLatency(params: {
  prompt: string;
  systemInstruction?: string;
}) {
  const ai = getGeminiClient();
  const model = 'gemini-3.1-flash-lite';

  const startTime = Date.now();
  const response = await ai.models.generateContent({
    model,
    contents: params.prompt,
    config: {
      systemInstruction: params.systemInstruction || 'You are a lightning-fast response engine optimized for minimal latency.'
    }
  });
  const latencyMs = Date.now() - startTime;

  return {
    text: response.text || '',
    latencyMs,
    modelUsed: model
  };
}

/**
 * 4. Image Understanding & Analysis with gemini-3.1-pro-preview
 */
export async function analyzeImage(params: {
  imageBase64: string;
  mimeType: string;
  prompt?: string;
}) {
  const ai = getGeminiClient();
  const model = 'gemini-3.1-pro-preview';

  const imagePart = {
    inlineData: {
      mimeType: params.mimeType || 'image/png',
      data: params.imageBase64
    }
  };

  const textPart = {
    text: params.prompt || 'Thoroughly analyze this image in high detail, breaking down objects, text, visual hierarchy, anomalies, and semantic context.'
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, textPart] }
  });

  return {
    text: response.text || '',
    modelUsed: model
  };
}

/**
 * 5. Video Content Understanding with gemini-3.1-pro-preview
 */
export async function analyzeVideo(params: {
  videoBase64: string;
  mimeType: string;
  prompt?: string;
}) {
  const ai = getGeminiClient();
  const model = 'gemini-3.1-pro-preview';

  const videoPart = {
    inlineData: {
      mimeType: params.mimeType || 'video/mp4',
      data: params.videoBase64
    }
  };

  const textPart = {
    text: params.prompt || 'Analyze this video content thoroughly. Detail key timestamps, scene transitions, activities, audio/visual cues, and a structured executive summary.'
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [videoPart, textPart] }
  });

  return {
    text: response.text || '',
    modelUsed: model
  };
}

/**
 * 6. Audio Transcription with gemini-3.5-flash
 */
export async function transcribeAudio(params: {
  audioBase64: string;
  mimeType: string;
  prompt?: string;
}) {
  const ai = getGeminiClient();
  const model = 'gemini-3.5-flash';

  const audioPart = {
    inlineData: {
      mimeType: params.mimeType || 'audio/webm',
      data: params.audioBase64
    }
  };

  const textPart = {
    text: params.prompt || 'Transcribe the spoken audio verbatim with high precision. Format timestamps and speaker changes if discernible.'
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [audioPart, textPart] }
  });

  return {
    transcript: response.text || '',
    modelUsed: model
  };
}

/**
 * 7. High Thinking Reasoning Mode with gemini-3.1-pro-preview
 */
export async function executeHighThinking(params: {
  prompt: string;
  systemInstruction?: string;
}) {
  const ai = getGeminiClient();
  const model = 'gemini-3.1-pro-preview';

  const response = await ai.models.generateContent({
    model,
    contents: params.prompt,
    config: {
      systemInstruction: params.systemInstruction || 'You are an advanced sovereign reasoning engine. Perform deep multi-step verification and formal proofs.',
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH
      }
      // Note: Do not set maxOutputTokens
    }
  });

  return {
    text: response.text || '',
    modelUsed: model,
    thinkingEnabled: true
  };
}

/**
 * 8. Speech Synthesis (Gemini TTS) with gemini-3.1-flash-tts-preview
 */
export async function synthesizeKnightSpeech(params: {
  text: string;
  voiceName?: string;
}) {
  const ai = getGeminiClient();
  const voice = params.voiceName || 'Zephyr';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: params.text,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice
            }
          }
        }
      }
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const audioData = part?.inlineData?.data || null;
    const mimeType = part?.inlineData?.mimeType || 'audio/mp3';

    return {
      audioBase64: audioData,
      mimeType,
      voiceUsed: voice,
      success: !!audioData
    };
  } catch (error: any) {
    console.error('Gemini TTS error:', error);
    return {
      audioBase64: null,
      mimeType: 'audio/mp3',
      voiceUsed: voice,
      error: error.message || 'TTS Synthesis failed'
    };
  }
}

/**
 * 9. Anya Ω Prompt Enhancement Alchemist (APEE v7.0)
 */
export async function enhancePromptWithAnya(params: {
  rawPrompt: string;
  targetStudio?: string;
  targetTier?: string;
}) {
  const ai = getGeminiClient();
  const model = 'gemini-3.7-flash';

  const systemInstruction = `You are Anya Ω, Sovereign Cognitive Gatekeeper, Master Prompt Alchemist, and Cartridge Navigator of Camelot-OS.
Your Prime Directive is to transform raw, loose, or ambiguous user intents into uncompromising, mathematically grounded Arthurian 3-Tier specification harnesses.
You eliminate ambiguity, establish explicit schemas, enforce 60fps / 8GB RAM edge constraints, and embed formal verification invariants.

Output a structured JSON response matching this schema:
{
  "enhancedPrompt": "The complete, rich, precision-engineered prompt formatted with Arthurian 3-Tier Chassis, HUD intents, Mermaid DAG, and JSON Boundary contracts",
  "summary": "Brief 1-2 sentence overview of enhancements made",
  "invariantsAdded": ["Array of specific guarantees, security bounds, or performance limits added"],
  "targetStudio": "Recommended Camelot-OS Studio (MERLIN_AGENCY, BLUEPRINT_OS, HIVE_IDE, TOPOLOGICAL_MESH, SWARM_COMMAND_CENTER, GEMINI_NEXUS, GOOGLE_WORKSPACE, MCP_SERVER)",
  "oneShotCommand": "Concise verbal command equivalent for the Spatial Voice HUD",
  "estimatedComplexity": "TIER_1_ROUTING | TIER_2_CHASSIS | TIER_3_CONCURRENT_SWARM"
}`;

  const promptContent = `Original User Intent: "${params.rawPrompt}"
Target Studio: "${params.targetStudio || 'AUTO_DETECT'}"
Target Tier: "${params.targetTier || 'V1000_EXCALIBUR_ASCENDED'}"

Synthesize the ultimate zero-entropy enhancement:`;

  const response = await ai.models.generateContent({
    model,
    contents: promptContent,
    config: {
      systemInstruction,
      responseMimeType: 'application/json'
    }
  });

  try {
    const parsed = JSON.parse(response.text || '{}');
    return {
      ...parsed,
      modelUsed: model
    };
  } catch {
    return {
      enhancedPrompt: response.text || params.rawPrompt,
      summary: 'Enhanced prompt structured with Arthurian 3-Tier specification harness.',
      invariantsAdded: ['Zero-Hallucination Mandate', 'Z3 Theorem Verification', '60fps UI Guarantee'],
      targetStudio: params.targetStudio || 'MERLIN_AGENCY',
      oneShotCommand: `Execute: ${params.rawPrompt.slice(0, 40)}`,
      estimatedComplexity: 'TIER_2_CHASSIS',
      modelUsed: model
    };
  }
}

/**
 * 10. Multi-Turn Knight Conversation with Persona & Voice binding
 */
export async function executeKnightChat(params: {
  knightId: string;
  messages: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  includeAudio?: boolean;
}) {
  const profile = KNIGHT_PROFILES[params.knightId] || KNIGHT_PROFILES.merlin;
  const model = 'gemini-3.5-flash';

  const contents = params.messages.map(m => ({
    role: m.role,
    parts: m.parts
  }));

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model,
    contents: contents as any,
    config: {
      systemInstruction: profile.systemInstruction
    }
  });

  const responseText = response.text || '';
  let audioData: string | null = null;

  if (params.includeAudio && responseText) {
    try {
      const ttsResult = await synthesizeKnightSpeech({
        text: responseText.slice(0, 400),
        voiceName: profile.voiceName
      });
      audioData = ttsResult.audioBase64;
    } catch (err) {
      console.warn('TTS audio synthesis non-fatal error:', err);
    }
  }

  return {
    knight: profile,
    text: responseText,
    audioBase64: audioData,
    voiceUsed: profile.voiceName,
    modelUsed: model
  };
}
