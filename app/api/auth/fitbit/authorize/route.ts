import { NextResponse } from 'next/server';
import { FITBIT_SCOPES } from '@/lib/wearable';

export async function GET() {
  const clientId = process.env.FITBIT_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/fitbit/callback`;
  
  const url = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${FITBIT_SCOPES.join('%20')}&expires_in=604800`;
  
  return NextResponse.redirect(url);
}
