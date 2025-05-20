const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Implement fetchWithRetry function
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<Response> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`Attempt ${i + 1} failed: ${lastError.message}`);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError!;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AVATURE_API_KEY = process.env.AVATURE_API_KEY;
const AVATURE_BASE_URL = 'https://voutiquefteng.avature.net/rest/upfront';

const SYNC_INTERVAL = 1; // 5 minutes in milliseconds

async function syncPeople() {
  try {
    console.log('Starting people sync...');
    
    // Fetch all people IDs from Avature
    const response = await fetchWithRetry(`${AVATURE_BASE_URL}/people`, {
      headers: {
        'accept': 'application/json',
        'X-Avature-REST-API-Key': AVATURE_API_KEY!,
      },
    });

    const data = await response.json();
    const peopleIds = data.items.map((item: any) => item.id);

    console.log(`Found ${peopleIds.length} people to sync`);

    // Process each person
    for (const id of peopleIds) {
      try {
        // Check if person already exists in our database
        const { data: existingPerson } = await supabase
          .from('People')
          .select('id')
          .eq('avatureId', id.toString())
          .single();

        if (existingPerson) {
          console.log(`Person ${id} already exists in database, skipping...`);
          continue;
        }

        // Fetch person details from Avature
        const detailResponse = await fetchWithRetry(`${AVATURE_BASE_URL}/people/${id}/form_1172`, {
          headers: {
            'accept': 'application/json',
            'X-Avature-REST-API-Key': AVATURE_API_KEY!,
          },
        });

        const detailData = await detailResponse.json();
        const formData = detailData.items[0];

        // Create person in our database with default values for missing data
        const { error } = await supabase
          .from('People')
          .insert({
            id: id.toString(),
            avatureId: id.toString(),
            name: formData["我们如何称呼您？"] || "未提供",
            email: formData["您的邮箱？"] || "未提供",
            gender: formData.性别 || "未提供",
            industry: formData["您所在行业是？"] || "未提供",
            position: formData["您的职位"] || "未提供",
            hobbies: formData["您的爱好是？"] || "未提供",
            favoriteFood: formData["您最喜欢吃的东西？"] || "未提供",
            leastFavoriteFood: formData["您最讨厌吃的东西？"] || "未提供",
            hrConcern: formData["您现在在HR领域最关心的一个问题是？"] || "未提供",
            weekendActivity: formData["你和朋友一起度过周末时，通常会："] || "未提供",
            socialPreference: formData["你更喜欢哪种社交场合？"] || "未提供",
            avatarRequest: formData["想知道您匹配度最高的新朋友是谁吗？与我们分享您的头像，方便TA找到你"] || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

        if (error) {
          console.error(`Error creating person ${id}:`, error);
          throw error;
        }

        console.log(`Successfully synced person ${id}`);
      } catch (error) {
        console.error(`Failed to sync person ${id}:`, error);
        continue;
      }
    }

    console.log('People sync completed successfully');
  } catch (error) {
    console.error('Failed to sync people:', error);
  }
}

// Function to start the infinite sync loop
async function startSyncLoop() {
  while (true) {
    await syncPeople();
    console.log(`Waiting ${SYNC_INTERVAL / 1000} seconds before next sync...`);
    await new Promise(resolve => setTimeout(resolve, SYNC_INTERVAL));
  }
}

// Start the sync loop
console.log('Starting infinite people sync loop...');
startSyncLoop().catch(error => {
  console.error('Fatal error in sync loop:', error);
  process.exit(1);
}); 