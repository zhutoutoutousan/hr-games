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

interface MatchAnalysis {
  score: number;
  reasoning: string;
  reasoning_steps: string[];
}

const MATCHING_SYSTEM_MESSAGE = `You are a professional HR consultant analyzing the compatibility between two people based on their profiles.
Your task is to evaluate how well these two people would match based on their professional backgrounds, interests, and preferences.
Consider factors like:
1. Professional compatibility (industry, position)
2. Personal interests alignment (hobbies, food preferences)
3. Work-life balance preferences (weekend activities)
4. Social interaction styles
5. HR concerns and interests

For each factor, provide a detailed analysis of how the two profiles align or differ.
Then provide a final compatibility score and summary.

Your response must be a valid JSON object with the following structure:
{
  "score": number (0-100),
  "reasoning": "A summary of the match analysis",
  "reasoning_steps": ["Step 1 explanation", "Step 2 explanation", ...]
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

    // Create a TransformStream to handle streaming responses
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start processing matches in the background
    (async () => {
      try {
        for (const candidate of candidates) {
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

          Please analyze their compatibility step by step and provide a detailed reasoning process.
          Return your analysis in the exact JSON format specified in the system message.`;

          try {
            const response = await generateResponse(prompt, MATCHING_SYSTEM_MESSAGE, false);
            let analysis: MatchAnalysis;
            
            if (typeof response === 'string') {
              try {
                analysis = JSON.parse(response);
              } catch (parseError) {
                const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
                try {
                  analysis = JSON.parse(cleanResponse);
                } catch (error) {
                  console.error(`Failed to parse response for candidate ${candidate.id}:`, error);
                  analysis = {
                    score: 50,
                    reasoning: "Unable to analyze match at this time",
                    reasoning_steps: []
                  };
                }
              }
            } else {
              throw new Error('Unexpected response type');
            }

            const match = {
              id: candidate.id,
              match_score: analysis.score,
              reasoning: analysis.reasoning,
              reasoning_steps: analysis.reasoning_steps,
              person: candidate
            };

            // Stream the match result
            await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'match', data: match })}\n\n`));
          } catch (error) {
            console.error(`Error analyzing match for candidate ${candidate.id}:`, error);
            const fallbackMatch = {
              id: candidate.id,
              match_score: 50,
              reasoning: "Unable to analyze match at this time",
              reasoning_steps: [],
              person: candidate
            };
            await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'match', data: fallbackMatch })}\n\n`));
          }
        }
      } catch (error) {
        console.error('Error in match processing:', error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Failed to process matches' })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in match verification:', error);
    return NextResponse.json(
      { error: 'Failed to verify match' },
      { status: 500 }
    );
  }
}