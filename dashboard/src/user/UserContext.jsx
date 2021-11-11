import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import jwtDecode from 'jwt-decode';

const Context = createContext();

export const useUser = () => useContext(Context);

export const UserContext = ({ children }) => {
  const [tokens, setTokens] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    // pull  params from location.hash
    if (!window.location.hash) return;
    const params = window.location.hash.substring(1).split('&');
    const parsed = params.reduce((acc, param) => {
      const [key, value] = param.split('=');
      return { ...acc, [key]: value };
    }, {});
    setTokens(parsed);
    if (parsed.id_token) {
      const {
        email,
        email_verified: emailVerified,
        phone_number: phoneNumber,
        phone_number_verified: phoneNumberVerified,
        ['cognito:username']: username,
      } = jwtDecode(parsed.id_token);
      setUser({
        email,
        emailVerified,
        phoneNumber,
        phoneNumberVerified,
        username,
      });
      window.location.hash = '';
    }
  }, []);
  useEffect(() => console.log(user), [user]);
  return (
    <Context.Provider value={[user, setUser]}>{children}</Context.Provider>
  );
}