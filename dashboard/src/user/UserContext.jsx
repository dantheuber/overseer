import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import jwtDecode from 'jwt-decode';
import { setCookie, getCookieValue } from 'cookies-utils';
export const COOKIE_KEY = 'id';
export const AUTH_KEY = 'jwt';

const Context = createContext();

export const useUser = () => useContext(Context);

const parseUserFromToken = token => {
  const {
    email,
    email_verified: emailVerified,
    phone_number: phoneNumber,
    phone_number_verified: phoneNumberVerified,
    ['cognito:username']: username,
  } = jwtDecode(token);
  return {
    email,
    emailVerified,
    phoneNumber,
    phoneNumberVerified,
    username,
  };
}

export const UserContext = ({ children }) => {
  const [tokens, setTokens] = useState({});
  const [user, setUser] = useState(null);
  const isLoggedIn = !!user;  
  useEffect(() => {
    if (window.location.hash) {
      const params = window.location.hash.substring(1).split('&');
      const parsed = params.reduce((acc, param) => {
        const [key, value] = param.split('=');
        return { ...acc, [key]: value };
      }, {});
      
      if (parsed.id_token) {
        setTokens(parsed);
        setUser(parseUserFromToken(parsed.id_token));
        setCookie({
          name: COOKIE_KEY,
          value: parsed.id_token,
        });
        setCookie({
          name: AUTH_KEY,
          value: parsed.access_token,
        });
        window.location.hash = '';
        return;
      }
    }
    // if hash is empty then check cookies
    const id_token = getCookieValue(COOKIE_KEY);
    const access_token = getCookieValue(AUTH_KEY);
    if (id_token && access_token) {
      setTokens({ id_token, access_token });
      setUser(parseUserFromToken(id_token));
      return;
    }
  }, []);
  useEffect(() => console.log(user, tokens), [user, tokens]);
  return (
    <Context.Provider value={{ user, tokens, isLoggedIn }}>{children}</Context.Provider>
  );
}