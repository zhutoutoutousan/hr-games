import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start streaming response
  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });

  // Process in background
  (async () => {
    try {
      // Get all people from our database
      const { data: people, error } = await supabase
        .from('People')
        .select('*');

      if (error) {
        throw error;
      }

      // Stream each person
      for (const person of people) {
        const personData = {
          id: person.id,
          name: person.name,
          email: person.email,
          gender: person.gender,
          industry: person.industry,
          position: person.position,
          hobbies: person.hobbies,
          favoriteFood: person.favoriteFood,
          leastFavoriteFood: person.leastFavoriteFood,
          hrConcern: person.hrConcern,
          weekendActivity: person.weekendActivity,
          socialPreference: person.socialPreference,
          avatarRequest: person.avatarRequest,
        };

        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'person', data: personData })}\n\n`));
      }

      await writer.close();
    } catch (error) {
      console.error('Error streaming people:', error);
      await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Failed to stream people' })}\n\n`));
      await writer.close();
    }
  })();

  return response;
} 