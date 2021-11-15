import React, {
  createContext,
  useContext,
  useCallback,
  useState,
} from 'react';
import { getCookieValue } from 'cookies-utils';
import { COOKIE_KEY } from './user/UserContext';
import { buildUrl } from './user/LoginButton';

const Context = createContext();

export const useFetch = () => useContext(Context);

const buildAuthHeader = () => {
  const token = getCookieValue(COOKIE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const FetchProvider = ({ children }) => {
  const [authHeader] = useState(buildAuthHeader());

  const fetcher = useCallback(async (url, options) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...authHeader,
      }
    });
    if (response.status === 401) {
      window.location.href = buildUrl();
    }
    return await response.json();
  }, [authHeader]);

  return (
    <Context.Provider value={{ fetch: fetcher }}>
      {children}
    </Context.Provider>
  );
};