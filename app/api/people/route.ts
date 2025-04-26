import { NextResponse } from 'next/server';

const AVATURE_API_KEY = process.env.AVATURE_API_KEY as string;
const BASE_URL = process.env.AVATURE_BASE_URL as string;

if (!AVATURE_API_KEY || !BASE_URL) {
  throw new Error('Missing required environment variables for Avature API');
}

// Ensure BASE_URL is properly formatted
const normalizedBaseUrl = BASE_URL.replace(/^http:\/\//, 'https://').replace(/\/$/, '');

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function GET() {
  console.log('Starting to fetch people data...');
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  (async () => {
    try {
      console.log('Fetching people list from Avature API...');
      console.log(normalizedBaseUrl);
      const peopleResponse = await fetchWithRetry(`${normalizedBaseUrl}/people?page_number=1&page_size=20`, {
        headers: {
          'accept': 'application/json',
          'X-Avature-REST-API-Key': AVATURE_API_KEY,
        },
      });

      const peopleData = await peopleResponse.json();
      const peopleIds = peopleData.items.map((item: { id: number }) => item.id);
      console.log(`Found ${peopleIds.length} people to process`);

      // Send initial message with total count
      await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'count', total: peopleIds.length })}\n\n`));

      // Then, fetch details for each person
      for (const id of peopleIds) {
        console.log(`Fetching details for person ${id}...`);
        try {
          const detailResponse = await fetchWithRetry(`${normalizedBaseUrl}/people/${id}/form_1172`, {
            headers: {
              'accept': 'application/json',
              'X-Avature-REST-API-Key': AVATURE_API_KEY,
            },
          });

          const detailData = await detailResponse.json();
          const formData = detailData.items[0];

          const personData = {
            id,
            name: formData["我们如何称呼您？"],
            gender: formData.性别,
            industry: formData["您所在行业是？"],
            position: formData["您的职位"],
            hobbies: formData["您的爱好是？"],
            favoriteFood: formData["您最喜欢吃的东西？"],
            leastFavoriteFood: formData["您最讨厌吃的东西？"],
            hrConcern: formData["您现在在HR领域最关心的一个问题是？"],
            weekendActivity: formData["你和朋友一起度过周末时，通常会："],
            socialPreference: formData["你更喜欢哪种社交场合？"],
            avatarRequest: formData["想知道您匹配度最高的新朋友是谁吗？与我们分享您的头像，方便TA找到你"]
          };

          console.log(`Sending data for person ${id}: ${personData.name}`);
          // Send person data
          await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'person', data: personData })}\n\n`));
        } catch (error) {
          console.error(`Failed to fetch details for person ${id}:`, error);
          // Continue with next person instead of failing the entire process
          continue;
        }
      }

      console.log('All people data processed successfully');
      // Send completion message
      await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
    } catch (error) {
      console.error('Error in people data processing:', error);
      await writer.write(encoder.encode(`data: ${JSON.stringify({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to fetch people data' 
      })}\n\n`));
    } finally {
      console.log('Closing writer...');
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
} 