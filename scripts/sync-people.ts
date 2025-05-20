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

// Add helper function to process avatar data
function processAvatarData(avatarData: string | { id: number; file_name: string; file_size_kb: number; contents: string; } | null): string | null {
  if (!avatarData) return null;
  
  // If it's already a string (URL or data URL), return it
  if (typeof avatarData === 'string') {
    if (avatarData.startsWith('data:')) {
      return avatarData;
    }
    if (avatarData.match(/^[A-Za-z0-9+/=]+$/)) {
      return `data:image/jpeg;base64,${avatarData}`;
    }
    return avatarData;
  }
  
  // If it's an Avature file object
  if (typeof avatarData === 'object' && avatarData.contents) {
    // If contents is already a data URL
    if (avatarData.contents.startsWith('data:')) {
      return avatarData.contents;
    }
    // If contents is a base64 string
    if (avatarData.contents.startsWith('/9j/')) {
      return `data:image/jpeg;base64,${avatarData.contents}`;
    }
    // If contents is a relative path
    if (avatarData.contents.startsWith('/')) {
      return avatarData.contents;
    }
  }
  
  return null;
}

// Add helper function to safely parse JSON with base64 data
function safeJSONParse(jsonString: string): any {
  try {
    // First try normal parsing
    return JSON.parse(jsonString);
  } catch (error) {
    // If normal parsing fails, try to handle base64 data
    try {
      // Replace any unescaped quotes in base64 data
      const sanitized = jsonString.replace(/"contents":"([^"]*)"/g, (match, p1) => {
        return `"contents":"${p1.replace(/"/g, '\\"')}"`;
      });
      return JSON.parse(sanitized);
    } catch (innerError) {
      console.error('Failed to parse JSON:', innerError);
      throw innerError;
    }
  }
}

async function syncPeople() {
  try {
    console.log('Starting people sync...');
    
    let pageNumber = 1;
    const pageSize = 50; // Maximum allowed page size
    let allPeopleIds: string[] = [];
    
    // Fetch all people IDs from Avature with pagination
    while (true) {
      console.log(`Fetching page ${pageNumber}...`);
      
      const response = await fetchWithRetry(
        `${AVATURE_BASE_URL}/people?page_number=${pageNumber}&page_size=${pageSize}`,
        {
          headers: {
            'accept': 'application/json',
            'X-Avature-REST-API-Key': AVATURE_API_KEY!,
          },
        }
      );

      const data = await response.json();
      const pagePeopleIds = data.items.map((item: any) => item.id);
      
      if (pagePeopleIds.length === 0) {
        console.log('No more people to fetch');
        break;
      }
      
      allPeopleIds = [...allPeopleIds, ...pagePeopleIds];
      console.log(`Fetched ${pagePeopleIds.length} people from page ${pageNumber}`);
      
      pageNumber++;
    }

    console.log(`Found total of ${allPeopleIds.length} people to sync`);

    // Process each person
    for (const id of allPeopleIds) {
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

        const detailData = await safeJSONParse(await detailResponse.text());
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
            avatarRequest: processAvatarData(formData['想知道您匹配度最高的“新朋友”是谁吗？与我们分享您的头像，方便TA找到你']),
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