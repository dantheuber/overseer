const BASE_API_URL = '/api/sites';

export const getSites = async () => {
  const response = await fetch(`${BASE_API_URL}`);
  return await response.json();;
};

export const getSite = async (siteId) => {
  const response = await fetch(`${BASE_API_URL}/${siteId}`);
  return await response.json();
};

export const updateSite = async (site) => {
  const response = await fetch(`${BASE_API_URL}/${site.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
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
    },
    body: JSON.stringify(site),
  });
  return await response.json();
};

export const deleteSite = async (siteId) => {
  const response = await fetch(`${BASE_API_URL}/${siteId}`, {
    method: 'DELETE',
  });
  return await response.json();
};
