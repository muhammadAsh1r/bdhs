import { supabase } from './supabase';

export const FITBIT_SCOPES = ['activity', 'heartrate', 'profile', 'weight'];

export async function getFitbitTokens() {
  const { data, error } = await supabase
    .from('wearable_tokens')
    .select('*')
    .eq('provider', 'fitbit')
    .single();

  if (error || !data) return null;
  return data;
}

export async function refreshFitbitToken(refreshToken: string) {
  const clientId = process.env.FITBIT_CLIENT_ID;
  const clientSecret = process.env.FITBIT_CLIENT_SECRET;
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();
  if (data.access_token) {
    await supabase
      .from('wearable_tokens')
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      })
      .eq('provider', 'fitbit');
    
    return data.access_token;
  }
  return null;
}

export function normalizeFitbitData(activityData: any, heartRateData: any) {
  // Logic to convert calories/intensity to sweat (mL)
  // Base: 1 calorie burned ~ 0.1mL sweat (simplified for demo)
  // Intensity: Heart rate zones increase sweat rate
  
  const calories = activityData?.summary?.caloriesOut || 0;
  const baseSweat = calories * 0.12; // 0.12mL per calorie
  
  // Refine based on heart rate (average HR above rest)
  const avgHR = heartRateData?.['activities-heart']?.[0]?.value?.heartRateZones?.[1]?.minutes || 0;
  const intensityBonus = avgHR * 0.5; // 0.5mL per "active minute"
  
  return Math.round(baseSweat + intensityBonus);
}
