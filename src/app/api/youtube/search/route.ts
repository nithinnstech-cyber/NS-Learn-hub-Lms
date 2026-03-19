import { NextRequest, NextResponse } from 'next/server';
import { searchYouTubeVideos } from '@/lib/youtube';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const maxResults = parseInt(searchParams.get('maxResults') || '12');

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  const videos = await searchYouTubeVideos(query, maxResults);
  return NextResponse.json({ videos });
}
