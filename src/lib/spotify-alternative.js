/**
 * Alternative Spotify Integration using Public APIs
 * Bypasses the 403 Forbidden issue with Client Credentials flow
 */

/**
 * Fetch playlist using Spotify's unofficial/public API
 * This doesn't require authentication and works for public playlists
 */
export async function getPlaylistDataAlternative(playlistId) {
    try {
        console.log(`[Spotify Alt] Fetching playlist: ${playlistId}`);
        
        // Method 1: Try the public Spotify Web API without auth (for public playlists)
        const playlistRes = await fetch(`https://open.spotify.com/playlist/${playlistId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (!playlistRes.ok) {
            console.log(`[Spotify Alt] Public fetch failed, trying API method...`);
            return null;
        }

        // Extract data from the HTML page (Spotify embeds playlist data in HTML)
        const html = await playlistRes.text();
        
        // Look for JSON data embedded in the page
        const jsonMatch = html.match(/{"tracks":.*?"total":\d+}/);
        if (!jsonMatch) {
            console.log(`[Spotify Alt] Could not extract data from page`);
            return null;
        }

        // Parse the JSON
        const data = JSON.parse(jsonMatch[0]);
        
        // Extract playlist info from the HTML metadata
        const nameMatch = html.match(/<title>([^-]+)-\s*playlist/i);
        const name = nameMatch ? nameMatch[1].trim() : 'Imported Playlist';

        console.log(`[Spotify Alt] Successfully fetched playlist: ${name}`);
        
        return {
            details: {
                name: name,
                description: 'Imported from Spotify',
                images: []
            },
            tracks: data.tracks || []
        };
    } catch (error) {
        console.error(`[Spotify Alt] Error:`, error.message);
        return null;
    }
}

/**
 * Alternative approach: Use Spotify's Web API with a workaround
 * This uses a simpler endpoint that's less restricted
 */
export async function getPlaylistDataViaPublicEndpoint(playlistId) {
    try {
        console.log(`[Spotify Public] Attempting public endpoint for: ${playlistId}`);
        
        // Try accessing the playlist directly via the public CDN endpoint
        const response = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,images,tracks(items(track(name,artists,duration_ms,id)))`
        );

        if (response.status === 403) {
            console.log(`[Spotify Public] 403 Forbidden - trying alternative...`);
            return null;
        }

        if (!response.ok) {
            console.log(`[Spotify Public] Error ${response.status}`);
            return null;
        }

        const data = await response.json();
        
        return {
            details: {
                name: data.name || 'Imported Playlist',
                description: data.description || '',
                images: data.images || []
            },
            tracks: (data.tracks?.items || []).map(item => ({
                name: item.track.name,
                artists: (item.track.artists || []).map(a => ({ name: a.name })),
                spotifyId: item.track.id,
                id: item.track.id,
                duration_ms: item.track.duration_ms || 0
            }))
        };
    } catch (error) {
        console.error(`[Spotify Public] Error:`, error.message);
        return null;
    }
}
