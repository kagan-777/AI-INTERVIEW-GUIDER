export const mockInterviews = {
  Technical: {
    questions: [
      {
        id: "t1",
        question: "Explain the concept of the Virtual DOM in React and how it differs from the real DOM.",
        keyConcepts: ["Reconciliation", "Diffing Algorithm", "Batch Updates", "Repaint/Reflow", "Memory overhead"],
        structure: "1. Definition of Virtual DOM\n2. How React detects changes (Diffing)\n3. How it syncs changes to Real DOM (Reconciliation)\n4. Performance benefits vs. direct DOM updates",
        points: ["React creates a lightweight in-memory copy of the DOM.", "When state changes, a new virtual tree is created.", "React compares the new tree with the previous one (diffing).", "Only the modified nodes are updated in the real DOM, reducing expensive layout reflows."],
        example: "The Virtual DOM is like a blueprint. Instead of rebuilding the physical house (Real DOM) every time a chair moves, React marks the exact spot on the blueprint, compares it, and only updates that specific chair in the real house."
      },
      {
        id: "t2",
        question: "What is a closure in JavaScript, and how can it be used to create private variables?",
        keyConcepts: ["Lexical Scope", "Scope Chain", "Function execution context", "Encapsulation", "Garbage collection"],
        structure: "1. Definition of Closure (inner function accessing outer scope)\n2. Explaining Lexical Scope\n3. Code example of a counter or getter/setter function\n4. Advantages (encapsulation, state preservation)",
        points: ["A closure is created when an inner function is defined inside an outer function.", "The inner function retains access to variables in the outer function's scope even after the outer function has finished executing.", "It helps in data privacy by exposing only specific methods (like an API) while hiding the state."],
        example: "In JavaScript, closures let you bundle a function together with its surrounding state. For example, `function counter() { let count = 0; return () => ++count; }` creates a closure where `count` is private and can only be accessed/modified by the returned function."
      },
      {
        id: "t3",
        question: "Explain how you would optimize a web application that is experiencing slow load times.",
        keyConcepts: ["Code splitting (lazy loading)", "Image optimization & WebP", "Caching strategies", "Critical rendering path", "Bundle size reduction", "CDN usage"],
        structure: "1. Diagnostic tools (Lighthouse, Web Vitals)\n2. Asset optimization (images, fonts, scripts)\n3. Code optimization (bundle optimization, lazy loading)\n4. Delivery optimization (CDNs, service workers, HTTP caching)",
        points: ["Analyze performance bottlenecks using Chrome DevTools or Lighthouse.", "Compress and modernise assets (use WebP/AVIF, minify CSS/JS).", "Use route-based code splitting and lazy loading of components.", "Implement browser caching, CDN delivery, and prefetching/prerendering."],
        example: "I would start by running a Lighthouse audit. If the primary culprit is bundle size, I'll implement dynamic imports (`React.lazy`) for heavy components and set up server-side gzip or Brotli compression, alongside optimizing images to responsive WebP formats."
      }
    ]
  },
  Behavioral: {
    questions: [
      {
        id: "b1",
        question: "Tell me about a time you faced a difficult technical challenge on a project and how you resolved it.",
        keyConcepts: ["STAR Method", "Problem-solving", "Collaboration", "Technical trade-offs", "Root cause analysis"],
        structure: "1. Situation: Set the scene (context, project)\n2. Task: Explain the challenge and your goal\n3. Action: Detail your steps, technical choices, and troubleshooting\n4. Result: Share the positive outcome (metrics, lessons learned)",
        points: ["Describe a concrete project, not a vague scenario.", "Focus on *your* contributions (use 'I' instead of 'we').", "Explain how you analyzed the issue rather than guessing.", "Include the impact: e.g., 'reduced memory usage by 40%' or 'saved 3 days of development time'."],
        example: "At my previous role, our real-time dashboard would crash when handling over 1,000 concurrent web socket connections (Situation). I was tasked with scaling the event pipeline (Task). I profile the memory and noticed memory leaks in the React cleanups, then implemented a debounced updates buffer and refactored the listener hooks (Action). This reduced RAM consumption by 50% and supported up to 5,000 connections without a single crash (Result)."
      },
      {
        id: "b2",
        question: "Describe a situation where you had a conflict with a team member. How did you handle it?",
        keyConcepts: ["Empathy", "Conflict Resolution", "Professionalism", "Active Listening", "Alignment"],
        structure: "1. Situation: The disagreement (keep it professional, no personal attacks)\n2. Task: The need to reach consensus to deliver the project\n3. Action: Private 1-on-1 discussion, active listening, finding compromise\n4. Result: Mutual agreement, successful delivery, and improved team relationship",
        points: ["Pick a professional, work-related conflict (e.g. design decision or coding styles).", "Show empathy—acknowledge the other person's perspective.", "Emphasize communication and constructive collaboration.", "Explain what you did to de-escalate and build consensus."],
        example: "A senior dev and I disagreed on using GraphQL vs REST for a new feature. I preferred GraphQL for flexibility; they wanted REST for stability. I set up a call, listened to their concerns about schema maintenance, and proposed a pilot with REST first but with a mock schema layer. We compromised, successfully launched, and it built a strong foundation of trust between us."
      },
      {
        id: "b3",
        question: "Tell me about a time you made a mistake at work. What did you learn and how did you correct it?",
        keyConcepts: ["Accountability", "Transparency", "Post-mortem analysis", "Continuous Improvement", "De-escalation"],
        structure: "1. Situation: The context and the mistake made\n2. Task: The immediate response and containment needed\n3. Action: Owning the mistake, communicating with stakeholders, implementing the fix\n4. Result: Mitigating damage, setting up guardrails to prevent it from happening again",
        points: ["Own the mistake fully—don't blame others or external factors.", "Show prompt action to rectify the issue.", "Highlight the systemic fix you implemented (e.g. CI/CD checks, testing).", "Highlight what you learned from the experience."],
        example: "I accidentally pushed a debug configuration to production, disabling auth checks for 15 minutes. Once alerted, I rolled back immediately, notified the lead, analyzed logs to confirm no data leakage, and implemented a git pre-commit hook that automatically blocks commits containing debug tokens."
      }
    ]
  },
  HR: {
    questions: [
      {
        id: "h1",
        question: "Tell me about yourself and your professional journey.",
        keyConcepts: ["Elevator pitch", "Key milestones", "Career trajectory", "Value proposition", "Relevance to current role"],
        structure: "1. Present: Current role and main responsibilities\n2. Past: Core experience milestones or key projects\n3. Future: Why this specific job role aligns with your career goals",
        points: ["Keep it under 2 minutes.", "Connect your achievements to the job description.", "Do not just read your resume; tell a cohesive story.", "Express enthusiasm for the company and the role."],
        example: "I am a Frontend Engineer with 3 years of experience specializing in building responsive React applications. In my previous role at TechCorp, I led the redesign of our core dashboard, boosting user engagement by 25%. I'm looking to bring my skills in UI optimization and client-side architecture to this role, as your product's scale aligns perfectly with my growth goals."
      },
      {
        id: "h2",
        question: "What are your greatest professional strengths and weaknesses?",
        keyConcepts: ["Self-awareness", "Growth mindset", "Authenticity", "Problem solving", "Constructive framing"],
        structure: "1. Strength: State a relevant skill, explain how you use it, and give a quick example\n2. Weakness: State a real but non-fatal weakness, explain how you are actively working to improve it",
        points: ["Choose strengths that directly benefit the employer (e.g., technical adaptability, active collaboration).", "Avoid cliché weaknesses ('I'm a perfectionist').", "Show active steps for weakness improvement (e.g., taking courses, seeking feedback).", "Keep the tone positive and reflective."],
        example: "My greatest strength is my technical adaptability; I can pick up new frameworks quickly and apply them to solve production problems. My weakness used to be public speaking. To improve, I joined Toastmasters and started presenting technical topics at our internal team lunches, which has built my confidence significantly."
      },
      {
        id: "h3",
        question: "Where do you see yourself in five years?",
        keyConcepts: ["Ambition", "Loyalty", "Skill mastery", "Leadership growth", "Long-term vision"],
        structure: "1. Short-term (1-2 years): Master the domain, build strong team relationships, deliver high impact\n2. Long-term (3-5 years): Take on technical leadership, mentor junior engineers, drive architectural decisions",
        points: ["Align your goals with the company's trajectory.", "Focus on professional growth, not just job titles.", "Show that you plan to stay and grow within the company.", "Keep it realistic yet ambitious."],
        example: "In five years, I see myself as a Principal or Staff Engineer, leading technical architecture decisions and mentoring junior devs. I hope to have developed deep expertise in your product stack and become a key driver of performance and scalability improvements here."
      }
    ]
  },
  Managerial: {
    questions: [
      {
        id: "m1",
        question: "How do you prioritize tasks and manage tight deadlines when leading a team?",
        keyConcepts: ["Agile/Scrum", "Eisenhower Matrix", "Delegation", "Scope negotiation", "Risk management"],
        structure: "1. Strategy: How you assess task urgency/impact\n2. Execution: Communication, standups, unblocking tasks\n3. Adaptability: How you handle scope creep or delays\n4. Retrospective: Reviewing metrics to optimize the next sprint",
        points: ["Mention frameworks (Agile, Jira, Eisenhower Matrix).", "Talk about collaboration with Product Managers and stakeholders.", "Explain how you protect the team from distractions.", "Highlight the balance between quality and velocity."],
        example: "I use the Eisenhower Matrix to separate tasks into urgent vs important. When a deadline is tight, I run a planning session to identify the Critical Path, negotiate non-essential scope with PMs, delegate subtasks based on team strengths, and conduct brief daily checkpoints to unblock blockers early."
      },
      {
        id: "m2",
        question: "Explain how you mentor and help junior developers grow in their careers.",
        keyConcepts: ["Constructive Feedback", "Pair Programming", "Individual Development Plans", "Empowerment", "Psychological Safety"],
        structure: "1. Approach: Building trust and understanding their goals\n2. Strategy: Pair programming, code reviews, delegating modular tasks\n3. Growth: Establishing regular check-ins and performance goals\n4. Outcome: Seeing them take ownership of larger systems",
        points: ["Focus on structured guidance, not just random help.", "Emphasize code reviews as a teaching tool, not just checking boxes.", "Show how you encourage self-reliance.", "Provide a concrete success story if possible."],
        example: "I start by setting up 1-on-1s to map their career goals. I use code reviews as educational discussions, asking questions rather than just dictating changes. I also pair-program on complex tasks and gradually assign them ownership of complete features, ensuring they have a safe space to ask questions and learn."
      },
      {
        id: "m3",
        question: "How do you handle a team member who is underperforming?",
        keyConcepts: ["Empathy", "Performance Improvement Plans (PIP)", "Root cause analysis", "Clear expectations", "Support structure"],
        structure: "1. Detection: Spotting the drop in output or quality\n2. Investigation: Private discussion to understand root causes (work-related or personal)\n3. Alignment: Clarifying expectations, setting short-term goals, providing support\n4. Follow-up: Regular checkpoints and transparent documentation",
        points: ["Show empathy first—don't jump to disciplinary action.", "Identify if it is a skill gap, motivation gap, or external issues.", "Demonstrate structured support (mentorship, pairing).", "Keep the conversation professional, constructive, and document progress."],
        example: "I address underperformance in private 1-on-1s immediately. First, I ask how they are doing to see if there are personal issues or roadblocks. If it's a technical gap, we create a 30-day action plan with specific, measurable goals (e.g. completing 3 small tasks per week) and pair them with a senior dev. Most times, clear alignment and support resolve the issue."
      }
    ]
  }
};

// Generates a mock evaluation based on input text analysis
export function generateMockEvaluation(questionText, answerText) {
  const wordCount = answerText.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  if (wordCount < 10) {
    return {
      score: 3,
      strengths: ["You submitted an answer."],
      weaknesses: ["The answer is far too short or incomplete.", "Fails to provide any context or detail."],
      suggestions: ["Write a longer, more structured answer.", "Incorporate the STAR methodology (Situation, Task, Action, Result) if behavioral, or explain technical mechanics step-by-step."]
    };
  }

  // Key matching based on question content
  const lowerQ = questionText.toLowerCase();
  const lowerAns = answerText.toLowerCase();
  
  let score = 5;
  let strengths = [];
  let weaknesses = [];
  let suggestions = [];

  // Evaluate communication & completeness
  if (wordCount > 80) {
    score += 2;
    strengths.push("Good detail and depth in your response.");
  } else if (wordCount > 30) {
    score += 1;
    strengths.push("Clear and concise response length.");
  } else {
    weaknesses.push("The answer is slightly brief. Try to add more explanatory details.");
    suggestions.push("Expand on the action steps or execution details in your answer.");
  }

  // Assess structures
  const hasStarKeywords = ["situation", "task", "action", "result", "for example", "specifically", "at my", "designed", "implemented"].some(kw => lowerAns.includes(kw));
  if (hasStarKeywords) {
    score += 1;
    strengths.push("Structured delivery; references specific scenarios, tools, or methodologies.");
  } else {
    weaknesses.push("Lacks clear structure or direct project references.");
    suggestions.push("Use transitions like 'In my previous role...', 'Specifically, I...', or 'The result was...' to frame your answer.");
  }

  // Question-specific keyword checks
  if (lowerQ.includes("virtual dom")) {
    const matches = ["diff", "reconciliation", "batch", "lightweight", "render", "update"].filter(kw => lowerAns.includes(kw));
    if (matches.length >= 3) {
      score += 2;
      strengths.push(`Excellent technical precision. Mentions core concepts like: ${matches.join(", ")}.`);
    } else if (matches.length > 0) {
      score += 1;
      strengths.push(`Mentions Virtual DOM mechanics (${matches.join(", ")}).`);
      weaknesses.push("Missed some key architectural terms like Reconciliation or Diffing.");
      suggestions.push("Be sure to detail how React compares the virtual tree (diffing) and batches updates to minimize real DOM layout reflows (reconciliation).");
    } else {
      weaknesses.push("Lacks critical technical details of the Virtual DOM diffing process.");
      suggestions.push("Explain what the Virtual DOM is (in-memory copy) and how React's reconciliation algorithm works.");
    }
  } else if (lowerQ.includes("closure")) {
    const matches = ["lexical", "scope", "inner", "outer", "private", "retain", "access"].filter(kw => lowerAns.includes(kw));
    if (matches.length >= 3) {
      score += 2;
      strengths.push(`Solid understanding of scope chain. Highlighted: ${matches.join(", ")}.`);
    } else if (matches.length > 0) {
      score += 1;
      strengths.push(`Addresses closures concepts (${matches.join(", ")}).`);
      weaknesses.push("Did not fully explain lexical environment or how garbage collection is affected.");
      suggestions.push("Mention that outer function variables are kept in memory because the inner function retains a reference to its lexical scope.");
    } else {
      weaknesses.push("Fails to explain lexical scoping and scope retention.");
      suggestions.push("Explain closures by illustrating how an inner function 'remembers' its outer function's variable environment even after the outer function finishes.");
    }
  } else if (lowerQ.includes("optimize") || lowerQ.includes("slow load")) {
    const matches = ["lazy", "split", "webp", "cache", "cdn", "compress", "lighthouse", "minify"].filter(kw => lowerAns.includes(kw));
    if (matches.length >= 3) {
      score += 2;
      strengths.push(`Covers multiple optimization layers: ${matches.join(", ")}.`);
    } else if (matches.length > 0) {
      score += 1;
      strengths.push(`Identifies performance options (${matches.join(", ")}).`);
      weaknesses.push("Limited range of optimization actions mentioned.");
      suggestions.push("Outline solutions covering both asset optimization (WebP, bundle minification) and delivery optimization (CDNs, browser caching).");
    } else {
      weaknesses.push("Lacks actionable web performance strategies.");
      suggestions.push("Explain performance measurement (Lighthouse) and suggest code-splitting, lazy loading, and asset compression.");
    }
  } else {
    // Generic behavioral/HR keyword helper
    const actionWords = ["led", "resolved", "solved", "designed", "created", "managed", "collaborated", "learned", "growth", "improved"].filter(kw => lowerAns.includes(kw));
    if (actionWords.length >= 2) {
      score += 1;
      strengths.push(`Shows strong agency and ownership in actions: (${actionWords.join(", ")}).`);
    } else {
      weaknesses.push("Tone is slightly passive. Needs more proactive action descriptions.");
      suggestions.push("Use strong action verbs like 'led', 'designed', or 'optimized' to describe your personal impact.");
    }
  }

  // Cap score between 1 and 10
  score = Math.min(Math.max(score, 1), 10);

  // Fallbacks for empty arrays
  if (strengths.length === 0) strengths.push("Answered the question directly.");
  if (weaknesses.length === 0) weaknesses.push("None major identified.");
  if (suggestions.length === 0) suggestions.push("Continue giving structured and detailed answers.");

  return {
    score,
    strengths,
    weaknesses,
    suggestions
  };
}
