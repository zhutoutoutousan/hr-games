import { NextResponse } from 'next/server';

interface Person {
  id: number;
  name: string;
  gender: string;
  industry: string;
  position: string;
  hobby: string;
  favoriteFood: string;
  leastFavoriteFood: string;
  hrConcern: string;
  weekendActivity: string;
  socialPreference: string;
}

export async function POST(request: Request) {
  try {
    const { person1, person2 } = await request.json();

    // Calculate basic match score
    let matchScore = 0;
    const fields: (keyof Person)[] = [
      'industry',
      'position',
      'hobby',
      'favoriteFood',
      'leastFavoriteFood',
      'hrConcern',
      'weekendActivity',
      'socialPreference'
    ];

    fields.forEach(field => {
      if (person1[field] === person2[field]) {
        matchScore += 1;
      }
    });

    // Use DeepSeek API to analyze compatibility
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional HR consultant analyzing the compatibility between two people based on their profiles.'
          },
          {
            role: 'user',
            content: `Analyze the compatibility between these two people:
            
            Person 1:
            - Name: ${person1.name}
            - Industry: ${person1.industry}
            - Position: ${person1.position}
            - Hobby: ${person1.hobby}
            - Favorite Food: ${person1.favoriteFood}
            - Least Favorite Food: ${person1.leastFavoriteFood}
            - HR Concern: ${person1.hrConcern}
            - Weekend Activity: ${person1.weekendActivity}
            - Social Preference: ${person1.socialPreference}

            Person 2:
            - Name: ${person2.name}
            - Industry: ${person2.industry}
            - Position: ${person2.position}
            - Hobby: ${person2.hobby}
            - Favorite Food: ${person2.favoriteFood}
            - Least Favorite Food: ${person2.leastFavoriteFood}
            - HR Concern: ${person2.hrConcern}
            - Weekend Activity: ${person2.weekendActivity}
            - Social Preference: ${person2.socialPreference}

            Based on their profiles, would they be a good match? Consider their:
            1. Professional compatibility
            2. Personal interests alignment
            3. Work-life balance preferences
            4. Social interaction styles

            Respond with a JSON object containing:
            {
              "isMatch": boolean,
              "score": number (0-100),
              "reasoning": string
            }`
          }
        ]
      })
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({
      isMatch: analysis.isMatch,
      score: analysis.score,
      reasoning: analysis.reasoning,
      basicMatchScore: matchScore
    });
  } catch (error) {
    console.error('Error in match verification:', error);
    return NextResponse.json(
      { error: 'Failed to verify match' },
      { status: 500 }
    );
  }
} 