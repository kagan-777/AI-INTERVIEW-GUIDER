// API integration for client-side direct Gemini calls
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Common call to Gemini API
 */
async function callGemini(apiKey, prompt, jsonMode = true) {
  const url = `${API_URL}?key=${apiKey}`;
  
  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  if (jsonMode) {
    payload.generationConfig = {
      responseMimeType: "application/json"
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Failed API call");
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (jsonMode) {
      return JSON.parse(text);
    }
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

/**
 * Generate the welcoming message and the first question
 */
export async function getFirstQuestion(apiKey, settings) {
  const prompt = `
    You are an advanced AI Interview Preparation System consisting of three virtual personalities:
    1. HR Interviewer (professional, realistic interviewer)
    2. JARVIS Interview Assistant (personal coach)
    3. Evaluation Expert (grades responses)

    We are starting the mock interview.
    
    Settings:
    - Job Role: ${settings.jobRole}
    - Experience Level: ${settings.experienceLevel}
    - Interview Type: ${settings.interviewType}
    - Difficulty Level: ${settings.difficulty}
    - Resume: ${settings.resumeContent || "No resume provided"}

    INSTRUCTIONS FOR FIRST STEP:
    - Act as the HR Interviewer. Welcome the candidate professionally and generate Question 1.
    - If a resume is provided, generate a question based on projects, skills, or experience listed in the resume.
    - Also act as the JARVIS Interview Assistant and pre-generate the hints, structure, key concepts, and example approach for this Question 1.

    Output a JSON object matching this schema exactly:
    {
      "welcomeMessage": "Professional welcome text greeting the candidate and starting the session",
      "question": "The text of Question 1",
      "jarvis": {
        "keyConcepts": ["Concept 1", "Concept 2", ...],
        "structure": "Step-by-step structure to answer this question",
        "points": ["Important point 1", "Important point 2", ...],
        "example": "A high-quality example approach or outline"
      }
    }
    Ensure valid JSON format and return nothing else.
  `;

  return callGemini(apiKey, prompt, true);
}

/**
 * Evaluate the current answer and generate the next question
 */
export async function submitAnswerAndGetNext(apiKey, settings, history, currentAnswer, currentQuestionIndex, totalQuestions = 5) {
  const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;
  const historyText = history.map((h, i) => `Q${i+1}: ${h.question}\nCandidate Answer: ${h.answer}\nScore: ${h.evaluation?.score || "N/A"}`).join("\n\n");
  
  const prompt = `
    You are an advanced AI Interview Preparation System.
    
    Settings:
    - Job Role: ${settings.jobRole}
    - Experience Level: ${settings.experienceLevel}
    - Interview Type: ${settings.interviewType}
    - Difficulty Level: ${settings.difficulty}
    - Resume: ${settings.resumeContent || "No resume provided"}

    History of the interview so far:
    ${historyText}

    Current Question (Question ${currentQuestionIndex + 1}):
    ${history[currentQuestionIndex].question}

    Candidate's Answer:
    "${currentAnswer}"

    INSTRUCTIONS:
    1. Act as the Evaluation Expert:
       Grade the candidate's answer out of 10.
       Assess Technical Knowledge, Communication, Clarity, Confidence (based on speech/text flow), Problem Solving, and Completeness.
       Provide bullet points for Strengths, Areas for Improvement, and Suggestions.
    
    2. Act as the HR Interviewer:
       Determine if the interview is ending. If this was Question ${totalQuestions} (currentQuestionIndex = ${currentQuestionIndex}), set isEnd to true.
       Otherwise, generate Question ${currentQuestionIndex + 2}.
       Adapt the difficulty of the next question based on the score of this answer (e.g., if score is low, make the next question slightly more guiding; if high, increase complexity).
       Incorporate resume context if applicable.
    
    3. Act as the JARVIS Interview Assistant:
       If isEnd is false, pre-generate hints, structure, key concepts, and example approach for the NEXT question.
       If isEnd is true, jarvis can be null.

    Output a JSON object matching this schema exactly:
    {
      "evaluation": {
        "score": number (1 to 10),
        "strengths": ["Strength 1", "Strength 2", ...],
        "weaknesses": ["Weakness 1", "Weakness 2", ...],
        "suggestions": ["Suggestion 1", "Suggestion 2", ...]
      },
      "nextQuestion": "The text of the next question (or null if isEnd is true)",
      "jarvis": {
        "keyConcepts": ["Concept 1", "Concept 2", ...],
        "structure": "Structure of the next answer",
        "points": ["Point 1", "Point 2", ...],
        "example": "Example approach for the next question"
      } (or null if isEnd is true),
      "isEnd": boolean
    }
    Ensure valid JSON format and return nothing else.
  `;

  return callGemini(apiKey, prompt, true);
}

/**
 * Generate final interview performance report
 */
export async function getFinalReport(apiKey, settings, history) {
  const historyText = history.map((h, i) => `Q${i+1}: ${h.question}\nAnswer: ${h.answer}\nScore: ${h.evaluation?.score || 0}/10\nStrengths: ${h.evaluation?.strengths?.join(", ")}\nWeaknesses: ${h.evaluation?.weaknesses?.join(", ")}`).join("\n\n");

  const prompt = `
    You are an advanced AI Interview Preparation System (Evaluation Expert).
    The mock interview is complete. Generate the FINAL PERFORMANCE REPORT.

    Settings:
    - Job Role: ${settings.jobRole}
    - Experience Level: ${settings.experienceLevel}
    - Interview Type: ${settings.interviewType}
    - Difficulty Level: ${settings.difficulty}

    Interview Transcript & Grades:
    ${historyText}

    INSTRUCTIONS:
    Evaluate the candidate's entire performance and output a JSON object containing:
    1. Overall Score as a percentage (0 to 100).
    2. Categorized scores (out of 10) for: Technical Knowledge, Communication, Confidence, Problem Solving, and Behavioral Skills.
    3. Detailed strengths and weaknesses across the entire session.
    4. Recommended learning topics/resources customized to their weak areas.
    5. A final hiring recommendation: "Strong Hire", "Hire", "Borderline", or "Needs Improvement".
    6. A structured technical/behavioral roadmap for improvement.

    Output a JSON object matching this schema exactly:
    {
      "overallScore": number (0 to 100),
      "categories": {
        "technicalKnowledge": number (1 to 10),
        "communication": number (1 to 10),
        "confidence": number (1 to 10),
        "problemSolving": number (1 to 10),
        "behavioralSkills": number (1 to 10)
      },
      "strengths": ["Overall strength 1", "Overall strength 2", ...],
      "weaknesses": ["Overall weakness 1", "Overall weakness 2", ...],
      "recommendedLearning": ["Topic 1: Details", "Topic 2: Details", ...],
      "hiringRecommendation": "Strong Hire | Hire | Borderline | Needs Improvement",
      "improvementRoadmap": [
        {
          "phase": "Immediate (Week 1-2)",
          "steps": ["Step 1", "Step 2"]
        },
        {
          "phase": "Medium Term (Month 1)",
          "steps": ["Step 3", "Step 4"]
        }
      ]
    }
    Ensure valid JSON format and return nothing else.
  `;

  return callGemini(apiKey, prompt, true);
}
