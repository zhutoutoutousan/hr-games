import { NextResponse } from 'next/server';
import { generateResponse } from '@/lib/deepseek';

interface Person {
  id: number;
  name: string;
  gender: string;
  industry: string;
  position: string;
  hobbies: string;
  favoriteFood: string;
  leastFavoriteFood: string;
  hrConcern: string;
  weekendActivity: string;
  socialPreference: string;
  avatarRequest: string;
}

interface MatchRequest {
  userData: Person;
}

const MATCHING_SYSTEM_MESSAGE = `You are a professional HR consultant analyzing the compatibility between two people based on their profiles.
Your task is to evaluate how well these two people would match based on their professional backgrounds, interests, and preferences.
Consider factors like:
1. Professional compatibility (industry, position)
2. Personal interests alignment (hobbies, food preferences)
3. Work-life balance preferences (weekend activities)
4. Social interaction styles
5. HR concerns and interests

Respond with a JSON object containing:
{
  "score": number (0-100),
  "reasoning": string (brief explanation of the match)
}`;

export async function POST(request: Request) {
  try {
    const { userData } = await request.json() as MatchRequest;

    if (!userData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Fetch candidates from people API
    const peopleResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/people`);
    if (!peopleResponse.ok) {
      throw new Error('Failed to fetch candidates');
    }

    const candidates: Person[] = [];
    const reader = peopleResponse.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'person') {
              // Skip the current user from candidates
              if (data.data.name !== userData.name) {
                candidates.push(data.data);
              }
            }
          }
        }
      }
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: 'No candidates found' },
        { status: 404 }
      );
    }

    // Calculate matches for each candidate using DeepSeek
    const matches = await Promise.all(candidates.map(async (candidate) => {
      const prompt = `Analyze the compatibility between these two people:
      
      Person 1 (User):
      - Name: ${userData.name}
      - Industry: ${userData.industry}
      - Position: ${userData.position}
      - Hobbies: ${userData.hobbies}
      - Favorite Food: ${userData.favoriteFood}
      - Least Favorite Food: ${userData.leastFavoriteFood}
      - HR Concern: ${userData.hrConcern}
      - Weekend Activity: ${userData.weekendActivity}
      - Social Preference: ${userData.socialPreference}

      Person 2 (Candidate):
      - Name: ${candidate.name}
      - Industry: ${candidate.industry}
      - Position: ${candidate.position}
      - Hobbies: ${candidate.hobbies}
      - Favorite Food: ${candidate.favoriteFood}
      - Least Favorite Food: ${candidate.leastFavoriteFood}
      - HR Concern: ${candidate.hrConcern}
      - Weekend Activity: ${candidate.weekendActivity}
      - Social Preference: ${candidate.socialPreference}

      Please analyze their compatibility and provide a match score and reasoning.`;

      try {
        const response = await generateResponse(prompt, MATCHING_SYSTEM_MESSAGE);
        let analysis;
        try {
          // First try to parse the response directly
          analysis = JSON.parse(response);
        } catch (parseError) {
          // If that fails, try cleaning the response
          const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
          analysis = JSON.parse(cleanResponse);
        }

        return {
          id: candidate.id,
          match_score: analysis.score,
          reasoning: analysis.reasoning,
          person: candidate
        };
      } catch (error) {
        console.error(`Error analyzing match for candidate ${candidate.id}:`, error);
        // Fallback to basic scoring if DeepSeek fails
        return {
          id: candidate.id,
          match_score: 50, // Default score
          reasoning: "Unable to analyze match at this time",
          person: candidate
        };
      }
    }));

    // Sort matches by score
    const sortedMatches = matches.sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({
      matches: sortedMatches
    });
  } catch (error) {
    console.error('Error in match verification:', error);
    return NextResponse.json(
      { error: 'Failed to verify match' },
      { status: 500 }
    );
  }
}