import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 });

  const clientId = process.env.FITBIT_CLIENT_ID;
  const clientSecret = process.env.FITBIT_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/fitbit/callback`;
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();

  if (data.access_token) {
    // Store token in Supabase
    const { error } = await supabase
      .from('wearable_tokens')
      .upsert({
        provider: 'fitbit',
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      }, { onConflict: 'provider' });

    if (error) console.error('Error saving token:', error);
    
    // Redirect back to dashboard with success flag
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?fitbit=connected`);
  }

  return NextResponse.json({ error: 'Failed to exchange code' }, { status: 500 });
}
