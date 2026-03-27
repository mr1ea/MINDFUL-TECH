import Groq from 'groq-sdk';

export const analyzeContent = async (contentInput) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are a content safety AI for a digital wellness app called MindfulTech.
Analyze this content and respond ONLY with valid JSON, no extra text.

Content to analyze: "${contentInput}"

Categories:
- educational: tutorials, learning, how-to, documentaries
- entertainment: movies, comedy, gaming, music, sports
- social: vlogs, personal content, lifestyle
- news: current events, journalism, politics
- harmful: violence, hate speech, misinformation, self-harm
- inappropriate: explicit/adult content
- other: anything else

Respond ONLY in this exact JSON format, no extra text:
{
  "category": "category_name",
  "harmful": false,
  "reason": "One sentence explanation",
  "riskLevel": "low",
  "confidence": 0.92,
  "suggestion": "One short wellness tip"
}`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
     model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.3,
      max_tokens: 300
    });

    const text = response.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

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