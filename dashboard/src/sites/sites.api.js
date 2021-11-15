import { getCookieValue } from 'cookies-utils';
import { COOKIE_KEY } from '../user/UserContext';

const BASE_API_URL = '/api/sites';

const buildAuthHeader = () => {
  const token = getCookieValue(COOKIE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSites = async () => {
  const response = await fetch(`${BASE_API_URL}`, {
    method: 'GET',
    headers: buildAuthHeader(),
  }); 
  return await response.json();
};

export const getSite = async (siteId) => {
  const response = await fetch(`${BASE_API_URL}/${siteId}`, {
    method: 'GET',
    headers: buildAuthHeader(),
  });
  return await response.json();
};

export const updateSite = async (site) => {
  const response = await fetch(`${BASE_API_URL}/${site.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeader(),
    },
    body: JSON.stringify(site),
  });
  return await response.json();
};

export const createSite = async (site) => {
  const response = await fetch(`${BASE_API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeader(),
    },
    body: JSON.stringify(site),
  });
  return await response.json();
};

export const deleteSite = async (siteId) => {
  const response = await fetch(`${BASE_API_URL}/${siteId}`, {
    method: 'DELETE',
    headers: buildAuthHeader(),
  });
  return await response.json();
};
