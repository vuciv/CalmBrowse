const LLM_CONFIG = {
  provider: "gemini",
  models: {
    awanllm: {
      apiKey: "",
      endpoint: "https://api.awanllm.com/v1/chat/completions",
      model: "Meta-Llama-3-8B-Instruct",
    },
    gemini: {
      apiKey: "",
      endpoint:
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent",
      model: "gemini-2.5-flash-preview-04-17",
    },
  },
};

chrome.runtime.onInstalled.addListener(() => {});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getContextData") {
    const pageTitle = request.pageTitle;
    const pageContent = request.pageContent || "";
    const keywords = request.keywords || [];
    const url = request.url || "";

    analyzeHealthContent(pageTitle, pageContent, url)
      .then((analysis) => {
        sendResponse({
          mainCondition: analysis.mainCondition,
          prevalence: analysis.prevalence,
          context: analysis.context,
          reframe: analysis.reframe,
          calmingSuggestion: analysis.calmingSuggestion,
          commonBenignCauses: analysis.commonBenignCauses,
        });
      })
      .catch((error) => {
        console.error("Error analyzing health content:", error);

        sendResponse({
          mainCondition: null,
          prevalence: null,
          context: null,
          reframe: null,
          calmingSuggestion: "Take a few slow, deep breaths to calm your body.",
          commonBenignCauses: null,
        });
      });

    return true;
  }
});

async function analyzeHealthContent(pageTitle, pageContent, url) {
  const extractedContent = extractRelevantContent(pageTitle, pageContent);

  try {
    const mainCondition = await callLLM({
      task: "identify_condition",
      data: {
        title: pageTitle,
        content: extractedContent,
        url: url,
      },
    });

    const prevalenceInfo = null;

    const reframeInfo = await callLLM({
      task: "get_reframe",
      data: {
        title: pageTitle,
        content: extractedContent,
        condition: mainCondition,
        prevalence: prevalenceInfo,
        url: url,
      },
    });

    const calmingSuggestion = await callLLM({
      task: "get_calming_suggestion",
      data: {
        title: pageTitle,
        condition: mainCondition,
        url: url,
      },
    });

    return {
      mainCondition: mainCondition,
      prevalence: prevalenceInfo,
      context: prevalenceInfo,
      reframe: reframeInfo,
      commonBenignCauses: prevalenceInfo,
      calmingSuggestion: calmingSuggestion,
    };
  } catch (error) {
    return {
      mainCondition: null,
      prevalence: null,
      context: null,
      reframe: null,
      commonBenignCauses: null,
      calmingSuggestion: "Take a few slow, deep breaths.",
    };
  }
}

function extractRelevantContent(title, content) {
  if (content.length < 5000) {
    return content;
  }

  const firstPortion = content.substring(0, 1000);
  const middleStart = Math.floor(content.length / 2) - 500;
  const middlePortion = content.substring(middleStart, middleStart + 1000);
  const lastPortion = content.substring(content.length - 1000);

  const healthTerms = [
    "symptom",
    "treatment",
    "diagnosis",
    "prognosis",
    "cancer",
    "disease",
    "condition",
    "pain",
    "syndrome",
    "infection",
    "chronic",
    "acute",
  ];

  const paragraphs = content.split(/\n\s*\n/);
  const relevantParagraphs = paragraphs
    .filter((para) => {
      const paraLower = para.toLowerCase();
      return healthTerms.some((term) => paraLower.includes(term));
    })
    .slice(0, 5)
    .join("\n\n");

  return (
    `TITLE: ${title}\n\n` +
    `BEGINNING OF CONTENT:\n${firstPortion}\n\n` +
    `MIDDLE OF CONTENT:\n${middlePortion}\n\n` +
    `END OF CONTENT:\n${lastPortion}\n\n` +
    `RELEVANT HEALTH PARAGRAPHS:\n${relevantParagraphs}`
  );
}

async function callLLM({ task, data }) {
  const promptMapping = {
    identify_condition: `
      Based on the following health webpage content, identify the main health condition
      or symptom being discussed. Provide ONLY the name of the condition in 2-4 words.
      If no specific condition is mentioned, respond with the main symptom.

      ${data.content}
    `,
    get_prevalence: `
      For the health condition "${data.condition}", provide:
      
      1. One sentence giving a concrete annual or point prevalence. Use ONE denominator
         (e.g. 'about 3 in 10,000 adults each year'). Cite one trusted source in brackets.
    `,
    get_reframe: `
      For someone reading about "${data.condition}" with health anxiety,
      provide a brief cognitive-behavioral reframe that:
      
      1. Validates their concern in one sentence
      2. Emphasizes the benign odds, or how unlikely it is that they have the condition or how prevalent symptoms are that may be related to the condition
    `,
    get_calming_suggestion: `
      For someone experiencing anxiety while reading about "${data.condition}",
      suggest ONE brief, actionable self-calming technique (like breathing exercise,
      grounding, or a quick 2-minute activity).
      
      Provide ONLY the suggestion in 15 words or less, with no additional text.
    `,
  };
  const provider = LLM_CONFIG.provider;
  const config = LLM_CONFIG.models[provider];

  if (!config) {
    throw new Error(`LLM provider ${provider} not configured`);
  }

  const systemPrompt = `
    You are CalmBrowse-Coach, a psychology-informed assistant that helps readers
    put frightening health information into perspective—without giving medical
    advice or diagnosis.
    
    **Your mission**
    1. Reduce health-anxiety (cyberchondria) by:
       • reminding users of the LOW BASE-RATE of serious illness
       • offering a SHORT cognitive-behavioural reframe
       • suggesting ONE evidence-based self-calming action (e.g. 60-sec breathing)
    
    2. Stay strictly factual and kind:
       • No moral judgement ("smokers are…" → instead "risk is higher among people who…")
       • No direct reassurance ("YOU probably don't have…"). Speak in 3rd person:
         "Most people who read about…" / "The vast majority of adults…"
    
    3. Never prescribe or diagnose. End every answer with
       "This is general information, not a diagnosis. Consider talking to a clinician
        if symptoms persist or worsen."
    `;

  const prompt = promptMapping[task];

  try {
    if (provider === "awanllm") {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          repetition_penalty: 1.1,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          max_tokens: 600,
          stream: false,
        }),
      });

      if (!response.ok) {
        console.error("API error status:", response.status);
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (
        !data.choices ||
        !data.choices[0] ||
        !data.choices[0].message ||
        !data.choices[0].message.content
      ) {
        console.error("Unexpected API response format:", data);
        throw new Error("Unexpected API response format");
      }

      const content = data.choices[0].message.content.trim();

      return content;
    } else if (provider === "gemini") {
      const url = `${config.endpoint}?key=${config.apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error("API error status:", response.status);
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts
      ) {
        console.error("Unexpected Gemini API response format:", data);
        throw new Error("Unexpected API response format");
      }

      const content = data.candidates[0].content.parts[0].text.trim();

      return content;
    }

    throw new Error(`Implementation for provider ${provider} not complete`);
  } catch (error) {
    console.error(`Error calling ${provider} LLM:`, error);
    throw error;
  }
}
