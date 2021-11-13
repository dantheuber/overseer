import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import jwtDecode from 'jwt-decode';
import { setCookie, getCookieValue } from 'cookies-utils';
const COOKIE_KEY = 'ovs_jwt';

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
    const jwt = getCookieValue(COOKIE_KEY);
    if (jwt) {
      setTokens({ id_token: jwt });
      setUser(parseUserFromToken(jwt));
      return;
    }
    // pull  params from location.hash and look for cookie if not present
    if (!window.location.hash) return;
    const params = window.location.hash.substring(1).split('&');
    const parsed = params.reduce((acc, param) => {
      const [key, value] = param.split('=');
      return { ...acc, [key]: value };
    }, {});
    setTokens(parsed);
    if (parsed.id_token) {
      setUser(parseUserFromToken(parsed.id_token));
      setCookie({
        name: COOKIE_KEY,
        value: parsed.id_token,
      });
      window.location.hash = '';
    }
  }, []);
  useEffect(() => console.log(user), [user]);
  return (
    <Context.Provider value={{ user, tokens, isLoggedIn }}>{children}</Context.Provider>
  );
}