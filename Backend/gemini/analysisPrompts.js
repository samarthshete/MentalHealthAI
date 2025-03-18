// src/gemini/analysisPrompts.js

const analysisReportPrompt =
  "Generate a comprehensive mental health report based on the user's conversation history. Length must be 150-200 words. Use exactly these section headings:\n\n" +
  "Mental Health Report\n\n" +
  "Observations: Analyze specific examples of mood patterns (noting frequency of positive vs. negative statements), energy level fluctuations, sleep metrics mentioned (duration, quality, disruptions), and stress indicators (physical symptoms, cognitive signs). Identify any clear temporal patterns or triggers.\n\n" +
  "Potential Underlying Issues: Based strictly on evidence in the conversation, identify factors contributing to the user's mental state. For healthcare professionals, note specific work stressors (patient load, administrative burden, ethical distress). Identify concrete sleep deprivation effects and specific mood regulation challenges.\n\n" +
  "Concerns: Highlight 2-3 specific high-priority issues that warrant immediate attention. For healthcare workers, assess for specific burnout dimensions (emotional exhaustion, depersonalization, reduced accomplishment), compassion fatigue indicators, or work-life boundary issues.\n\n" +
  "Recommendations: Provide 3-4 evidence-based coping strategies with implementation steps. Include one sleep hygiene improvement with timing guidelines, one stress reduction technique with practice frequency, and one boundary-setting strategy. Suggest specific professional support types if warranted (CBT, mindfulness-based therapy, peer support groups for healthcare workers).\n\n" +
  "Overall: Synthesize current mental health status with specific resilience factors identified. Be compassionate but direct. Avoid clinical jargon while maintaining professional accuracy.";

const analysisScorePrompt =
  "Based solely on the user's conversation history, assess their overall mental wellbeing on a scale of 1 to 10, where 1 represents optimal mental health and 10 indicates severe distress requiring urgent attention. Evaluate these specific factors:\n\n" +
  "1. Sleep: Quality, duration, disturbances, and impact on functioning\n" +
  "2. Mood: Stability, range, reactivity, and presence of persistent negative emotions\n" +
  "3. Energy: Reported fatigue, motivation levels, and capacity for daily activities\n" +
  "4. Stress Management: Effectiveness of coping mechanisms and presence of maladaptive strategies\n" +
  "5. Work Function: For healthcare workers, assess professional burnout indicators, compassion fatigue, and work-life balance\n\n" +
  "After careful assessment, respond ONLY with a single integer between 1 and 10. Do not include any explanation, commentary, or additional text.";

const analysisKeywordsPrompt =
  "Extract exactly 10 keywords or short phrases from the user's conversations that most accurately represent their mental health status, challenges, and needs. Each keyword must be derived directly from conversation content, not inferred.\n\n" +
  "Include terms from these categories:\n" +
  "- Sleep patterns (duration, quality descriptors, disturbances)\n" +
  "- Mood states (specific emotional terms used)\n" +
  "- Energy descriptors (fatigue level, motivation terms)\n" +
  "- Stress factors (named stressors, pressure points)\n" +
  "- Work challenges (especially healthcare-specific terms if applicable)\n" +
  "- Coping mechanisms (both adaptive and maladaptive strategies mentioned)\n" +
  "- Social connection terms (isolation, support, relationships)\n\n" +
  "Format: One keyword per line. No numbering, bullets, or explanations. No special characters. Single words or phrases under 4 words only. Use English language only. Present keywords in order of significance.";

const sleepAnalysisPrompt =
  "Analyze the user's sleep patterns and their relationship to mental wellbeing based strictly on conversation history. Your analysis must address:\n\n" +
  "1. Sleep duration: Calculate average reported hours and consistency patterns. Note any chronic deficits.\n" +
  "2. Sleep quality indicators: Identify specific disruptions mentioned (awakening frequency, difficulty falling asleep, early waking).\n" +
  "3. Sleep-mood correlation: Note specific examples where the user connects sleep to mood or energy levels.\n" +
  "4. Work schedule impact: For healthcare workers, analyze how shift patterns affect circadian rhythm. Note rotating shifts, night shifts, or extended hours specifically mentioned.\n" +
  "5. Sleep disorder indicators: Flag potential signs of sleep disorders requiring clinical attention.\n\n" +
  "Then provide 3-4 evidence-based sleep improvement recommendations tailored to healthcare professionals with irregular schedules. Each recommendation must:\n" +
  "• Be implementable in 15 minutes or less\n" +
  "• Include specific timing parameters\n" +
  "• Address a specific sleep issue mentioned\n" +
  "• Be formatted as a bullet point\n\n" +
  "Total response length: 150-200 words maximum. Use straightforward, practical language.";

const initialEngagementPrompt =
  "You are an empathetic mental health assistant speaking with a healthcare professional who may be experiencing burnout. Create a warm first interaction that establishes psychological safety. Your response must:\n\n" +
  "1. Begin with a gentle, non-clinical greeting that acknowledges the challenges of healthcare work\n" +
  "2. Validate the courage it takes to discuss mental health as a healthcare professional\n" +
  "3. Briefly explain your role as a supportive AI companion (not a diagnostic tool)\n" +
  "4. Assure confidentiality and judgment-free interaction\n" +
  "5. End with ONE open-ended question about their current emotional state that invites sharing (avoid yes/no questions)\n\n" +
  "Use language that normalizes stress reactions in healthcare settings. Avoid medical jargon. Be conversational, not clinical. Convey genuine warmth through your word choice. Keep your response under 120 words. Do not list resources or jump to solutions in this initial message.";

const selfAssessmentPrompt =
  "Based on the user's response, guide them through a step-by-step assessment focusing on healthcare professional wellbeing. Ask ONLY ONE question at a time, waiting for their response before proceeding.\n\n" +
  "Your assessment sequence must cover:\n\n" +
  "1. Emotional state: Ask about specific emotions experienced during work hours versus off hours\n" +
  "2. Sleep assessment: Inquire about sleep duration, quality, and how it affects their workday\n" +
  "3. Energy mapping: Ask them to describe energy levels throughout a typical day (morning, mid-day, evening)\n" +
  "4. Workplace stressors: Explore specific aspects of work that create the most stress (patient care, administrative, interpersonal)\n" +
  "5. Physical manifestations: Ask about specific physical symptoms they attribute to stress or burnout\n" +
  "6. Coping inventory: Inquire about current strategies they use to manage stress, both effective and ineffective\n\n" +
  "For each response, offer a brief empathetic acknowledgment before asking the next question. Use healthcare-specific language that demonstrates understanding of their professional context. Maintain a supportive, conversational tone throughout.";

const analysisInsightsPrompt =
  "Generate a comprehensive mental health analysis based solely on the user's assessment responses. Your analysis must be evidence-based, specific to healthcare professionals, and structured in these exact sections:\n\n" +
  "Current Status Overview (2-3 sentences summarizing primary concerns)\n\n" +
  "Key Findings:\n" +
  "• Burnout Indicators: Identify specific emotional exhaustion, depersonalization, or reduced accomplishment signs present in their responses\n" +
  "• Sleep-Stress Cycle: Analyze the bidirectional relationship between their reported sleep patterns and stress levels\n" +
  "• Energy Management: Evaluate their current energy allocation across work and personal domains\n" +
  "• Coping Effectiveness: Assess which current strategies are helping versus potentially exacerbating issues\n\n" +
  "Strengths & Resources:\n" +
  "• Identify at least 2 specific positive coping mechanisms or resilience factors from their responses\n" +
  "• Note any protective factors mentioned (social support, self-awareness, established routines)\n\n" +
  "Use evidence-based terminology without jargon. Maintain a balance between acknowledging challenges and highlighting capabilities. Length: 200-250 words. Format using bullet points for clarity.";

const interventionsPrompt =
  "Based on the specific issues identified in the user's assessment, provide 4 personalized, evidence-based interventions tailored for healthcare professionals. Each recommendation must follow this exact format:\n\n" +
  "1. [Intervention Name: 2-4 word title]\n" +
  "• What: Describe the specific technique or practice in 1-2 sentences\n" +
  "• Why: Explain the evidence-based mechanism that makes this effective for their specific situation\n" +
  "• How: Provide implementation instructions that require 10 minutes or less, are highly specific, and can fit into a healthcare worker's schedule\n" +
  "• When: Specify optimal timing (e.g., between patients, post-shift, before bed)\n\n" +
  "Your interventions must include:\n" +
  "- One rapid stress reduction technique (e.g., tactical breathing, grounding)\n" +
  "- One sleep hygiene improvement specifically for irregular schedules\n" +
  "- One boundary-setting or cognitive reframing strategy for work-related stress\n" +
  "- One energy conservation or restoration practice\n\n" +
  "Use precise, actionable language. Avoid vague advice like 'practice self-care' or 'reduce stress.' Each intervention must be specifically tailored to the user's reported challenges.";

const professionalHelpPrompt =
  "Based on the user's responses, sensitively suggest professional support options tailored to healthcare workers. Your response must:\n\n" +
  "1. Begin by normalizing professional help-seeking in healthcare (cite prevalence data for healthcare workers seeking support)\n" +
  "2. Clearly state that many challenges they're experiencing respond well to professional support\n" +
  "3. List 3 specific types of professional help most relevant to their situation:\n" +
  "   • [Professional Type]: Brief description of expertise + how they specifically help with the user's reported challenges\n" +
  "4. Address common barriers for healthcare workers:\n" +
  "   • Time constraints: Mention telehealth options with extended hours\n" +
  "   • Confidentiality concerns: Explain provider confidentiality protections\n" +
  "   • Stigma: Emphasize normalization in healthcare communities\n" +
  "5. Suggest one immediate step they could take (e.g., employee assistance program contact)\n\n" +
  "Use supportive, destigmatizing language throughout. Emphasize that seeking help demonstrates professional responsibility and self-awareness. Do not pressure or create urgency unless they've indicated crisis signs.";

module.exports = {
  analysisReportPrompt,
  analysisScorePrompt,
  analysisKeywordsPrompt,
  sleepAnalysisPrompt,
  initialEngagementPrompt,
  selfAssessmentPrompt,
  analysisInsightsPrompt,
  interventionsPrompt,
  professionalHelpPrompt,
};
