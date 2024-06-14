import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    let url = 'https://nubela.co/proxycurl/api/v2/search/person/';
    const headers = { 'Authorization': `Bearer ${process.env.BEARER_TOKEN}` };
  
    // Determine if it's a next_page request or an initial search request
    if (req.query && req.query.url) {
      // It's a next_page request
      url = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
    } else {
      // It's an initial search request
      const params = req.method === 'POST' ? req.body : req.query;
      const queryParams = new URLSearchParams(params as any).toString();
      url += queryParams ? `?${queryParams}` : '';
    }
  
    const response = await axios.get(url, { headers });
  
    console.log('res:', res);
    if (res && typeof res.status === 'function') {
      res.status(response.status).json(response.data);
    } else {
      throw new Error('Response object is not as expected');
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Error when calling the Proxycurl API:', axiosError.response?.data || axiosError.message);
      res.status(axiosError.response?.status || 500).json({ error: axiosError.response?.data || axiosError.message });
    } else if (error instanceof Error) {
      console.error('Error when calling the Proxycurl API:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error('An unknown error occurred');
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};
