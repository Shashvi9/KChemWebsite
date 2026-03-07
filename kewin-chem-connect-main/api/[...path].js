// Vercel serverless function to proxy API requests to Render backend
export default async function handler(req, res) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  
  // Construct the backend URL
  const backendUrl = `https://kewinchem-backend.onrender.com/api/${apiPath}`;
  
  // Forward query parameters
  const queryString = new URLSearchParams(req.url.split('?')[1] || '').toString();
  const fullUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;
  
  try {
    // Forward the request to the backend
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    
    // Get response data
    const data = await response.json();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Return the response
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from backend', details: error.message });
  }
}
