import Groq from 'groq-sdk';

const getAiApiKey = () => process.env.GROQ_API_KEY || process.env.GENERATIVE_API_KEY || process.env.GOOGLE_API_KEY;
const createGroqClient = () => {
  const apiKey = getAiApiKey();
  if (!apiKey) {
    throw new Error('Missing AI API key. Set GROQ_API_KEY, GENERATIVE_API_KEY, or GOOGLE_API_KEY.');
  }
  return new Groq({ apiKey });
};

export const analyzeContent = async (contentInput) => {
  try {
    const groq = createGroqClient();

    const prompt = `You are a content classification AI for a digital wellness app.
Analyze the provided content (page title and text) and classify it into one of the following categories:
- harmful: content promoting violence, hate, self-harm, misinformation, or extreme negativity
- educational: learning materials, tutorials, how-to guides, documentaries
- explicit: adult/sexual content, pornography, explicit language
- entertaining: movies, comedy, gaming, music, sports, fun content
- news: current events, journalism, politics, breaking news
- social_media: social networking, personal posts, vlogs, lifestyle sharing
- productive: work-related, productivity tools, professional development
- neutral: general browsing, shopping, utilities, uncategorized

Respond ONLY with valid JSON in this exact format:
{
  "category": "one_of_the_above_categories",
  "confidence": 0.95,
  "reason": "Brief explanation of why this category was chosen"
}

Content to analyze: "${contentInput}"`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.1,
      max_tokens: 200
    });

    const text = response.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate category
    const validCategories = ['harmful', 'educational', 'explicit', 'entertaining', 'news', 'social_media', 'productive', 'neutral'];
    if (!validCategories.includes(analysis.category)) {
      analysis.category = 'neutral';
      analysis.confidence = 0.5;
      analysis.reason = 'Unable to classify, defaulting to neutral';
    }

    return analysis;

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      analysis: {
        category: analysis.category || 'other',
        harmful: analysis.harmful || false,
        reason: analysis.reason || 'Content analyzed successfully',
        riskLevel: analysis.riskLevel || 'low',
        confidence: analysis.confidence || 0.8,
        suggestion: analysis.suggestion || 'Be mindful of your screen time.'
      }
    };

  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    return {
      success: false,
      error: error.message,
      analysis: {
        category: 'other',
        harmful: false,
        reason: 'Analysis unavailable',
        riskLevel: 'low',
        confidence: 0,
        suggestion: ''
      }
    };
  }
};

export const analyzeScreenshot = async (imageBase64) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      model: 'llama-3.2-11b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            },
            {
              type: 'text',
              text: `You are a content safety AI. Analyze this screenshot and respond ONLY in JSON:
{
  "platform": "app name visible (TikTok/YouTube/Instagram/etc or Unknown)",
  "category": "educational/entertainment/social/news/harmful/inappropriate/other",
  "harmful": false,
  "riskLevel": "low/medium/high",
  "description": "one sentence describing what is on screen",
  "confidence": 0.9
}`
            }
          ]
        }
      ],
      max_tokens: 200
    });

    const text = response.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    return {
      success: true,
      analysis: JSON.parse(jsonMatch[0])
    };

  } catch (error) {
    console.error('Screenshot analysis error:', error.message);
    return {
      success: false,
      analysis: {
        platform: 'Unknown',
        category: 'other',
        harmful: false,
        riskLevel: 'low',
        description: 'Could not analyze screenshot',
        confidence: 0
      }
    };
  }
};