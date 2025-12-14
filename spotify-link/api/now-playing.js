import axios from "axios";

export default async function handler(req, res) {
  try {
    const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error: "Missing SPOTIFY_ACCESS_TOKEN"
      });
    }

    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 204 || !response.data) {
      return res.status(200).json({ isPlaying: false });
    }

    const item = response.data.item;

    return res.status(200).json({
      isPlaying: response.data.is_playing,
      song: item.name,
      artist: item.artists.map(a => a.name).join(", "),
      albumArt: item.album.images[0]?.url,
      songUrl: item.external_urls.spotify
    });

  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Access token expired"
      });
    }

    return res.status(500).json({ error: error.message });
  }
}
