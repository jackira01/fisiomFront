import { BASE_URL } from '@/utils/api';
import axios from 'axios';

export const getTypes = async () => {
  const { data, status } = await axios.get(`${BASE_URL}/types`, {
    method: 'GET',
    cache: 'no-cache',
    withCredentials: true,
  });

  if (status !== 200) {
    throw new Error('Error fetching types');
  }

  return data;
};
