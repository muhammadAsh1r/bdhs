import { NextResponse } from 'next/server';
import { getFitbitTokens, refreshFitbitToken, normalizeFitbitData } from '@/lib/wearable';

export async function GET() {
  const tokens = await getFitbitTokens();
  if (!tokens) return NextResponse.json({ error: 'Not connected' }, { status: 401 });

  let accessToken = tokens.access_token;
  const isExpired = new Date(tokens.expires_at) < new Date();

  if (isExpired) {
    accessToken = await refreshFitbitToken(tokens.refresh_token);
    if (!accessToken) return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch Activity and Heart Rate data
    const [activityRes, heartRes] = await Promise.all([
      fetch(`https://api.fitbit.com/1/user/-/activities/date/${today}.json`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }),
      fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
    ]);

    const activityData = await activityRes.json();
    const heartData = await heartRes.json();

    const sweatMl = normalizeFitbitData(activityData, heartData);

    return NextResponse.json({ 
      sweat_ml: sweatMl,
      calories: activityData?.summary?.caloriesOut || 0,
      steps: activityData?.summary?.steps || 0,
      heartRate: heartData?.['activities-heart']?.[0]?.value?.restingHeartRate || 0,
      provider: 'fitbit',
      status: 'live'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wearable data' }, { status: 500 });
  }
}
