/**
 * Spotify API Integration Helper
 * Uses the official Spotify Web API with Client Credentials flow
 */

let cachedAccessToken = null;
let tokenExpiresAt = null;

/**
 * Check if Spotify credentials are configured
 */
export function isSpotifyConfigured() {
    return !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

/**
 * Get a valid access token from Spotify API
 * Implements caching with expiration to minimize API calls
 */
async function getSpotifyAccessToken() {
    const now = Date.now();
    
    // Return cached token if still valid
    if (cachedAccessToken && tokenExpiresAt && now < tokenExpiresAt) {
        return cachedAccessToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        const errorMsg = 'Spotify API credentials not configured. Please add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to your .env.local file. See .env.local.example for instructions.';
        console.error('[Spotify Auth]', errorMsg);
        throw new Error(errorMsg);
    }

    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('[Spotify Auth] Error:', error);
            throw new Error(`Spotify auth failed: ${error.error_description || 'Unknown error'}`);
        }

        const data = await response.json();
        cachedAccessToken = data.access_token;
        // Cache for slightly less than actual expiration (1 second buffer)
        tokenExpiresAt = now + (data.expires_in * 1000) - 1000;
        
        console.log('[Spotify Auth] Got new access token');
        return cachedAccessToken;
    } catch (error) {
        console.error('[Spotify Auth] Failed:', error);
        throw error;
    }
}

/**
 * Make a request to Spotify Web API
 */
async function spotifyRequest(endpoint) {
    const accessToken = await getSpotifyAccessToken();
    
    try {
        const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after') || '30';
            throw { status: 429, retryAfter: parseInt(retryAfter) };
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Spotify API Error ${response.status}: ${error.error?.message || 'Unknown error'}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Spotify API]', error);
        throw error;
    }
}

/**
 * Fetch all tracks from a playlist (handles pagination)
 */
async function getAllPlaylistTracks(playlistId) {
    const tracks = [];
    let offset = 0;
    const limit = 50; // Max items per request

    try {
        while (true) {
            const endpoint = `/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`;
            const response = await spotifyRequest(endpoint);
            
            tracks.push(...(response.items || []));
            
            if (!response.next) break; // No more pages
            offset += limit;
        }
        return tracks;
    } catch (error) {
        console.error(`[Spotify] Error fetching tracks for playlist ${playlistId}:`, error);
        throw error;
    }
}

/**
 * Get playlist details
 */
async function getPlaylistInfo(playlistId) {
    try {
        const endpoint = `/playlists/${playlistId}`;
        return await spotifyRequest(endpoint);
    } catch (error) {
        console.error(`[Spotify] Error fetching playlist info for ${playlistId}:`, error);
        throw error;
    }
}

/**
 * Main function: Fetch playlist data from Spotify Web API
 */
export async function getPlaylistData(playlistId) {
    try {
        console.log(`[Spotify] Fetching playlist data: ${playlistId}`);

        // Fetch playlist details and tracks in parallel
        const [playlistInfo, spotifyTracks] = await Promise.all([
            getPlaylistInfo(playlistId),
            getAllPlaylistTracks(playlistId),
        ]);

        if (!playlistInfo) {
            console.error('[Spotify] No playlist info returned');
            return null;
        }

        const details = {
            name: playlistInfo.name || 'Imported Playlist',
            description: playlistInfo.description || '',
            images: playlistInfo.images || [],
        };

        // Convert Spotify tracks to our format
        const tracks = spotifyTracks
            .map(item => {
                const track = item.track;
                if (!track || !track.id) return null;

                return {
                    name: track.name,
                    artists: (track.artists || []).map(artist => ({
                        name: artist.name,
                    })),
                    spotifyId: track.id, // Keep spotifyId for matcher compatibility
                    id: track.id,
                    duration_ms: track.duration_ms || 0,
                    external_ids: track.external_ids || {},
                };
            })
            .filter(Boolean);

        console.log(`[Spotify] Fetched ${tracks.length} tracks from "${details.name}"`);
        return { details, tracks };
    } catch (error) {
        console.error('[Spotify] Error fetching playlist data:', error);
        return null;
    }
}

// Legacy exports kept for backwards compatibility (uses getPlaylistData internally)
export async function getPlaylistTracks(playlistId) {
    const data = await getPlaylistData(playlistId);
    return data?.tracks || [];
}

export async function getPlaylistDetails(playlistId) {
    const data = await getPlaylistData(playlistId);
    return data?.details || null;
}
