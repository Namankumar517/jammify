import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Playlist from '@/models/Playlist';
import { getPlaylistData, isSpotifyConfigured } from '@/lib/spotify';
import {
    matchAllTracks,
    ACCEPT_THRESHOLD,
    ACCEPT_THRESHOLD_YT,
} from '@/lib/matcher';

// ---------------------------------------------------------------------------
// YOUTUBE MUSIC FETCHER
// ---------------------------------------------------------------------------
const fetchYouTubeMusicPlaylist = async (playlistId) => {
    try {
        console.log(`[YT Music] Fetching playlist: ${playlistId}`);
        const res = await fetch(
            `https://express-ytmusic-api.vercel.app/api/playlist?id=${playlistId}`
        );

        if (!res.ok) {
            console.error(`[YT Music] API returned ${res.status}`);
            return null;
        }

        const data = await res.json();
        if (!data.success || !data.playlist) {
            console.error('[YT Music] Invalid response structure');
            return null;
        }

        const songs = data.playlist.songs || [];
        console.log(`[YT Music] Found ${songs.length} songs`);

        const tracks = songs.map((song, index) => {
            let artistName = '';
            if (song.artist) artistName = song.artist;
            else if (song.subtitle) artistName = song.subtitle;
            else if (song.artists?.length > 0) artistName = song.artists[0].name || song.artists[0];

            if (index < 3) {
                console.log(
                    `[YT Music] Song ${index + 1}: "${song.title}" by "${artistName}"`
                );
            }

            return {
                name: song.title || '',
                artists: [{ name: artistName }],
                duration_ms: 0,
                external_ids: {},
                ytMusicId: song.id,
            };
        });

        return {
            details: {
                name: data.playlist.title || 'Imported Playlist',
                description: 'Imported from YouTube Music',
                images: data.playlist.thumbnail ? [{ url: data.playlist.thumbnail }] : [],
            },
            tracks,
        };
    } catch (err) {
        console.error('[YT Music] Fetch error:', err.message);
        return null;
    }
};

// ---------------------------------------------------------------------------
// ROUTE HANDLER
// ---------------------------------------------------------------------------
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { url } = await request.json();
        if (!url) {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400 }
            );
        }

        // ── Detect source & extract playlist ID ──────────────────────────────
        let sourceName = null;
        let playlistId = null;

        if (url.includes('spotify.com/playlist/')) {
            sourceName = 'spotify';
            playlistId = url.split('/playlist/')[1]?.split('?')[0];
            
            // Check if Spotify is configured before proceeding
            if (!isSpotifyConfigured()) {
                console.error('[Import] Spotify credentials not configured');
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Spotify import is not configured. Please contact the administrator to set up Spotify API credentials.',
                        details: 'Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET'
                    },
                    { status: 503 }
                );
            }
        } else if (url.includes('music.youtube.com/playlist')) {
            sourceName = 'youtube';
            playlistId = new URLSearchParams(url.split('?')[1]).get('list');
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        'Invalid playlist URL. Please provide a Spotify or YouTube Music playlist URL.',
                },
                { status: 400 }
            );
        }

        if (!playlistId) {
            return NextResponse.json(
                { success: false, error: 'Could not extract playlist ID from URL' },
                { status: 400 }
            );
        }

        console.log(`[Import] Source: ${sourceName}, ID: ${playlistId}`);

        // ── Fetch source playlist ─────────────────────────────────────────────
        let playlistData = null;
        let fetchError = null;
        
        try {
            playlistData =
                sourceName === 'spotify'
                    ? await getPlaylistData(playlistId)
                    : await fetchYouTubeMusicPlaylist(playlistId);
        } catch (err) {
            console.error(`[Import] Fetch error (${sourceName}):`, err.message);
            fetchError = err.message;
        }

        if (!playlistData) {
            let msg;
            if (fetchError?.includes('credentials')) {
                msg = 'Spotify API credentials are not configured. Please contact the administrator.';
            } else if (fetchError?.includes('403') || fetchError?.includes('Forbidden')) {
                msg = 'Spotify API access denied (403 Forbidden). This usually means:\n1. Your Spotify app has scope restrictions\n2. Try creating a NEW Spotify app at https://developer.spotify.com/dashboard\n3. Or use YouTube Music import instead';
            } else if (fetchError?.includes('401') || fetchError?.includes('Unauthorized')) {
                msg = 'Invalid Spotify API credentials. Please check your configuration.';
            } else if (sourceName === 'spotify') {
                msg = 'Failed to fetch playlist from Spotify. Make sure:\n1. The playlist is PUBLIC\n2. The playlist URL is correct\n3. The playlist exists\n4. Try using YouTube Music import as an alternative';
            } else {
                msg = 'Failed to fetch playlist from YouTube Music. Make sure:\n1. The playlist is PUBLIC\n2. The playlist URL is correct\n3. It\'s not a radio/mix playlist (starting with "RD")';
            }
            return NextResponse.json({ success: false, error: msg, details: fetchError }, { status: 404 });
        }

        const { details, tracks: sourceTracks } = playlistData;

        if (!sourceTracks?.length) {
            const msg =
                sourceName === 'spotify'
                    ? 'No tracks found in the Spotify playlist.'
                    : 'No tracks found in the YouTube Music playlist. Note: Radio/Mix playlists (starting with "RD") may not be supported.';
            return NextResponse.json({ success: false, error: msg }, { status: 404 });
        }

        console.log(
            `[Import] Processing "${details.name}" — ${sourceTracks.length} tracks`
        );

        const importStart = Date.now();
        
        try {
            await connectDB();
        } catch (dbErr) {
            console.error('[Import] Database connection failed:', dbErr.message);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Database connection failed. Please check your MongoDB configuration.',
                    details: dbErr.message
                },
                { status: 503 }
            );
        }

        const isYouTubeSource = sourceName === 'youtube';
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        // ── Match all tracks via the shared matcher ───────────────────────────
        const matchResults = await matchAllTracks(sourceTracks, apiBase, isYouTubeSource);

        // matchAllTracks returns [{ spotifyId, jioId }] — collect non-null jioIds
        // For import we don't have spotifyIds on every track, so just collect jioIds
        const jammifySongIds = matchResults
            .map((r) => r.jioId)
            .filter(Boolean);

        // ── Save playlist ─────────────────────────────────────────────────────
        const newPlaylist = new Playlist({
            name: details.name || 'Imported Playlist',
            userId: session.user.id,
            songIds: jammifySongIds,
            isPublic: true,
            description: details.description || '',
            image: details.images?.[0]?.url || '',
        });

        await newPlaylist.save();

        const elapsed = ((Date.now() - importStart) / 1000).toFixed(1);
        const sourceLabel = sourceName === 'spotify' ? 'Spotify' : 'YouTube Music';
        console.log(
            `[Import] ✅ Done: ${jammifySongIds.length}/${sourceTracks.length} songs matched in ${elapsed}s (${sourceLabel})`
        );

        return NextResponse.json({
            success: true,
            data: newPlaylist,
            message: `Successfully imported ${jammifySongIds.length} of ${sourceTracks.length} songs from ${sourceLabel}`,
        });
    } catch (error) {
        console.error('[Import] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
