import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    
    // Check if the user is logged in
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("NEXTAUTH_SECRET is not defined");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Sign an ephemeral token valid for 2 minutes to prove identity to the web socket server
    const token = jwt.sign(
      { 
        sub: session.user.id,
        name: session.user.name,
      },
      secret,
      { expiresIn: '2m' }
    );

    return NextResponse.json({ token, id: session.user.id, name: session.user.name });
  } catch (error) {
    console.error("Failed to generate socket token:", error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
