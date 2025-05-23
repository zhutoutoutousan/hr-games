import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchWithRetry } from '@/lib/utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AVATURE_API_KEY = process.env.AVATURE_API_KEY!;
const AVATURE_BASE_URL = 'https://voutiquefteng.avature.net/rest/upfront';

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

export async function GET() {
  try {
    let pageNumber = 1;
    const pageSize = 50; // Maximum allowed page size
    let allPeopleIds: string[] = [];
    let totalSynced = 0;
    
    // Fetch all people IDs from Avature with pagination
    while (true) {
      console.log(`Fetching page ${pageNumber}...`);
      
      const response = await fetchWithRetry(
        `${AVATURE_BASE_URL}/people?page_number=${pageNumber}&page_size=${pageSize}`,
        {
          headers: {
            'accept': 'application/json',
            'X-Avature-REST-API-Key': AVATURE_API_KEY,
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
            'X-Avature-REST-API-Key': AVATURE_API_KEY,
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
            avatarRequest: formData['想知道您匹配度最高的"新朋友"是谁吗？与我们分享您的头像，方便TA找到你'] || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

        if (error) {
          console.error(`Error creating person ${id}:`, error);
          throw error;
        }

        totalSynced++;
        console.log(`Successfully synced person ${id}`);
      } catch (error) {
        console.error(`Failed to sync person ${id}:`, error);
        continue;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'People sync completed',
      stats: {
        totalFound: allPeopleIds.length,
        totalSynced,
        pagesProcessed: pageNumber
      }
    });
  } catch (error) {
    console.error('Failed to sync people:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync people' },
      { status: 500 }
    );
  }
} 