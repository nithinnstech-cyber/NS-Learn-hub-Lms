const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
  publishedAt: string;
}

export interface YouTubePlaylistItem {
  id: string;
  title: string;
  thumbnail: string;
  videoId: string;
  position: number;
  description: string;
}

function parseISO8601Duration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function searchYouTubeVideos(query: string, maxResults = 12): Promise<YouTubeVideo[]> {
  try {
    const searchRes = await fetch(
      `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchRes.json();
    if (!searchData.items) return [];

    const videoIds = searchData.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(',');
    const detailsRes = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const detailsData = await detailsRes.json();
    if (!detailsData.items) return [];

    return detailsData.items.map((item: {
      id: string;
      snippet: { title: string; description: string; thumbnails: { maxres?: { url: string }; high?: { url: string }; default?: { url: string } }; channelTitle: string; publishedAt: string };
      contentDetails: { duration: string };
    }) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || '',
      duration: parseISO8601Duration(item.contentDetails.duration),
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

export async function getYouTubeVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    const item = data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || '',
      duration: parseISO8601Duration(item.contentDetails.duration),
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    };
  } catch (error) {
    console.error('YouTube video details error:', error);
    return null;
  }
}

export async function getPlaylistItems(playlistId: string): Promise<YouTubePlaylistItem[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    if (!data.items) return [];

    return data.items.map((item: {
      snippet: { title: string; thumbnails: { maxres?: { url: string }; high?: { url: string }; default?: { url: string } }; resourceId: { videoId: string }; position: number; description: string };
    }) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || '',
      videoId: item.snippet.resourceId.videoId,
      position: item.snippet.position,
      description: item.snippet.description,
    }));
  } catch (error) {
    console.error('YouTube playlist error:', error);
    return [];
  }
}
