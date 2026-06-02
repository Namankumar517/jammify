/**
 * Spotify API Integration Helper
 * Uses the official Spotify Web API with Client Credentials flow
 */

let cachedAccessToken = null;
let tokenExpiresAt = null;

/**
 * Get a valid access token from Spotify API
 * Implements caching with expiration to minimize API calls
 */
async function getSpotifyAccessToken() {
    const now = Date.now();
    
    // Return cached token if still valid
    if (cachedAccessToken && tokenExpiresAt && now < tokenExpiresAt) {
        console.log('[Spotify Auth] Using cached token');
        return cachedAccessToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    console.log('[Spotify Auth] Checking credentials - ID exists:', !!clientId, ', Secret exists:', !!clientSecret);

    if (!clientId || !clientSecret) {
        const msg = 'Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variables';
        console.error('[Spotify Auth] ERROR:', msg);
        console.error('[Spotify Auth] Available env vars:', Object.keys(process.env).filter(k => k.includes('SPOTIFY')));
        throw new Error(msg);
    }

    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    try {
        console.log('[Spotify Auth] Requesting access token from Spotify...');
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        console.log('[Spotify Auth] Token response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Spotify Auth] Token error response:', response.status, errorText);
            let error = {};
            try {
                error = JSON.parse(errorText);
            } catch (e) {
                error = { error_description: errorText };
            }
            throw new Error(`Spotify auth failed (${response.status}): ${error.error_description || 'Unknown error'}`);
        }

        const data = await response.json();
        cachedAccessToken = data.access_token;
        // Cache for slightly less than actual expiration (1 second buffer)
        tokenExpiresAt = now + (data.expires_in * 1000) - 1000;
        
        console.log('[Spotify Auth] Successfully obtained access token');
        return cachedAccessToken;
    } catch (error) {
        console.error('[Spotify Auth] Failed:', error.message);
        throw error;
    }
}

/**
 * Make a request to Spotify Web API
 */
async function spotifyRequest(endpoint) {
    console.log('[Spotify API] Requesting endpoint:', endpoint);
    
    let accessToken;
    try {
        accessToken = await getSpotifyAccessToken();
    } catch (error) {
        console.error('[Spotify API] Failed to get access token:', error.message);
        throw error;
    }
    
    try {
        const url = `https://api.spotify.com/v1${endpoint}`;
        console.log('[Spotify API] Fetching:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        console.log('[Spotify API] Response status for', endpoint, ':', response.status);

        if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after') || '30';
            console.error('[Spotify API] Rate limited, retry after:', retryAfter);
            throw { status: 429, retryAfter: parseInt(retryAfter) };
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Spotify API] Error response:', response.status, errorText);
            let error = {};
            try {
                error = JSON.parse(errorText);
            } catch (e) {
                // Not JSON response
            }
            throw new Error(`Spotify API Error ${response.status}: ${error.error?.message || errorText || 'Unknown error'}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Spotify API] Request failed for', endpoint, ':', error.message);
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
        console.log(`[Spotify] START: Fetching playlist data for ID: ${playlistId}`);

        // Fetch playlist details and tracks in parallel
        console.log('[Spotify] Fetching playlist info and tracks in parallel...');
        const [playlistInfo, spotifyTracks] = await Promise.all([
            getPlaylistInfo(playlistId),
            getAllPlaylistTracks(playlistId),
        ]);

        if (!playlistInfo) {
            console.error('[Spotify] ERROR: No playlist info returned');
            return null;
        }

        console.log('[Spotify] Playlist info retrieved:', playlistInfo.name, '- Total tracks:', spotifyTracks.length);

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
                    id: track.id,
                    duration_ms: track.duration_ms || 0,
                    external_ids: track.external_ids || {},
                };
            })
            .filter(Boolean);

        console.log(`[Spotify] SUCCESS: Fetched ${tracks.length} valid tracks from "${details.name}"`);
        return { details, tracks };
    } catch (error) {
        console.error('[Spotify] FAILED: Error fetching playlist data:', error.message);
        console.error('[Spotify] Stack:', error.stack);
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
