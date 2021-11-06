import React, { createContext, useState } from "react";
import { getSites } from './sites.api';

const Context = createContext();

export const useSites = () => React.useContext(Context);

export const SitesContext = ({ children }) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const addSite = (site) => {
    setSites([...sites, site]);
  };

  const removeSite = (site) => {
    setSites(sites.filter(s => s.id !== site.id));
  };

  const fetchSites = async () => {
    try {
      const data = await getSites();
      setSites(data.Items);
      setLoading(false);
    } catch (error) {
      setError(error);
    }
  };

  React.useEffect(() => {
    setInterval(fetchSites, 1000 * 60);
    fetchSites();
  }, []);

  return (
    <Context.Provider
      value={{
        sites,
        addSite,
        removeSite,
        loading,
        error,
      }}
    >
      {children}
    </Context.Provider>
  );
};