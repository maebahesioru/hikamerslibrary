import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    // JWT生成
    const secret = new TextEncoder().encode(process.env.ADMIN_KEY || 'default-secret');
    const token = await new SignJWT({ username, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);
    
    return NextResponse.json({ success: true, token });
  }
  
  return NextResponse.json({ success: false }, { status: 401 });
}
