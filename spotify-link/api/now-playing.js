const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS for your site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
    
    if (!accessToken) {
      return res.json({ 
        error: 'Spotify token not configured. Please add SPOTIFY_ACCESS_TOKEN in Vercel environment variables.' 
      });
    }
    
    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    // If nothing is playing
    if (response.status === 204) {
      return res.json({ 
        is_playing: false,
        message: 'Nothing is currently playing' 
      });
    }
    
    // Format the response
    const data = response.data;
    const track = {
      is_playing: data.is_playing,
      name: data.item.name,
      artists: data.item.artists.map(artist => artist.name).join(', '),
      album: data.item.album.name,
      album_art_url: data.item.album.images[0]?.url,
      external_url: data.item.external_urls.spotify,
      progress_ms: data.progress_ms,
      duration_ms: data.item.duration_ms
    };
    
    return res.json(track);
    
  } catch (error) {
    console.error('Spotify API Error:', error.message);
    
    // Handle token expiration
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Access token expired. Please refresh it in Vercel environment variables.' 
      });
    }
    
    return res.json({ 
      error: 'Failed to fetch currently playing track',
      details: error.message 
    });
  }
};
