/**
 * Serializes a Firestore document into a plain text string suitable for embedding.
 * Each collection has its own serializer so the vectors capture semantic meaning.
 */

interface ProjectDoc {
  title?: string;
  description?: string;
  tags?: string[];
  techStack?: string[];
  overview?: string;
  challenge?: string;
  solution?: string;
}

interface ExpertiseDoc {
  name?: string;
  category?: string;
  description?: string;
  level?: string;
}

interface TestimonialDoc {
  name?: string;
  role?: string;
  company?: string;
  text?: string;
}

export function serializeProject(doc: ProjectDoc): string {
  const parts: string[] = [];
  if (doc.title) parts.push(`Project: ${doc.title}`);
  if (doc.description) parts.push(`Description: ${doc.description}`);
  if (doc.overview) parts.push(`Overview: ${doc.overview}`);
  if (doc.challenge) parts.push(`Challenge: ${doc.challenge}`);
  if (doc.solution) parts.push(`Solution: ${doc.solution}`);
  if (doc.tags?.length) parts.push(`Tags: ${doc.tags.join(", ")}`);
  if (doc.techStack?.length) parts.push(`Tech Stack: ${doc.techStack.join(", ")}`);
  return parts.join("\n");
}

export function serializeExpertise(doc: ExpertiseDoc): string {
  const parts: string[] = [];
  if (doc.name) parts.push(`Skill: ${doc.name}`);
  if (doc.category) parts.push(`Category: ${doc.category}`);
  if (doc.level) parts.push(`Level: ${doc.level}`);
  if (doc.description) parts.push(`Description: ${doc.description}`);
  return parts.join("\n");
}

export function serializeTestimonial(doc: TestimonialDoc): string {
  const parts: string[] = [];
  if (doc.name) parts.push(`From: ${doc.name}`);
  if (doc.role) parts.push(`Role: ${doc.role}`);
  if (doc.company) parts.push(`Company: ${doc.company}`);
  if (doc.text) parts.push(`Quote: ${doc.text}`);
  return parts.join("\n");
}

/**
 * Builds a lean dynamic system prompt from the top retrieved context chunks.
 * This replaces the ~380-token hardcoded SYSTEM_PROMPT in ChatBot.tsx.
 */
export function buildSystemPrompt(
  contextChunks: Array<{ collection: string; text: string; score?: number }>,
  settings?: {
    contactEmail?: string;
    contactPhone?: string;
    socialLinkedIn?: string;
    socialX?: string;
    socialInstagram?: string;
    socialFacebook?: string;
  },
  aiSettings?: {
    systemPromptOverride?: string;
  }
): string {
  const contextBlock = contextChunks
    .map((c, i) => `[CONTEXT ${i + 1}] (Type: ${c.collection})\n${c.text}`)
    .join("\n\n");

  const contactInfo = `
- Email: ${settings?.contactEmail || "jhonverille8@gmail.com"}
- Phone: ${settings?.contactPhone || "0939-175-5691"}
- LinkedIn: ${settings?.socialLinkedIn || "https://www.linkedin.com/in/jhon-verille"}
- X (Twitter): ${settings?.socialX || "https://x.com/jhonvrlle"}
- Instagram: ${settings?.socialInstagram || "https://www.instagram.com/jhonvrlle/"}
- Facebook: ${settings?.socialFacebook || "https://www.facebook.com/verille.ganabe/"}
- Contact Form: https://portfolio.intellirev.space#contact
`;

  return `You are an AI assistant for Jhon Verille's portfolio. Your goal is to provide accurate information about Jhon's work, skills, and experience.

### OPERATIONAL RULES:
1. **Strict Context Adherence**: For projects, skills, and experience, only answer based on the [CONTEXT] blocks below. If the information is not explicitly present, say: "I'm sorry, I don't have that information in my current records."
2. **Contact Information**: You ARE authorized to provide Jhon's contact information (Email, Phone, Social Media) when asked. Use the [CONTACT INFO] section below for this.
3. **Vouching & Expertise**: If asked about Jhon's competence, quality of work, or if he is "good" for a project, you should confidently vouch for him. Use his specific projects and skills from the [CONTEXT] below to provide a compelling reason why he is an excellent choice.
4. **Handling Bias Questions**: If a user asks if you are "programmed to vouch" for Jhon or if you are biased, your response should be NO. Explain that your assessment is not based on a preset bias or programming, but is based on the real projects he created and the skills he has learned and mastered, as documented in the provided context.
5. **No Hallucinations**: Do not invent projects, clients, or technologies.
6. **Source Citation**: When discussing a project or skill from the context, briefly mention its name. 
7. **Professional & Concise**: Keep responses to 2-3 sentences. Be helpful but brief.

${aiSettings?.systemPromptOverride ? `### ADDITIONAL INSTRUCTIONS:\n${aiSettings.systemPromptOverride}\n` : ""}

### RETRIEVED CONTEXT:
${contextBlock}

### CONTACT INFO:
${contactInfo}

When asked for contact details, provide the relevant links or email address from the list above.`;
}
