import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";
import {
  getSites,
  updateSite as update,
  deleteSite as del,
  createSite as create,
} from './sites.api';
import { useUser } from '../user/UserContext';

const Context = createContext();

export const useSites = () => useContext(Context);

export const SitesContext = ({ children }) => {
  const [sites, setSites] = useState([]);
  const [sitesLoaded, setSitesLoaded] = useState(false);
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
      if (data.message) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setSites(data.Items);
      setLoading(false);
      if (!sitesLoaded) setSitesLoaded(true);
    } catch (error) {
      console.log(error);
      setError(error);
    }
  };

  const updateSite = async (site) => {
    try {
      const data = await update(site);
      setSites(sites.map(s => s.id === site.id ? data : s));
    } catch (error) {
      setError(error);
    }
  };

  const deleteSite = async (site) => {
    try {
      await del(site.id);
      removeSite(site);
    } catch (error) {
      setError(error);
    }
  };

  const createSite = async (site) => {
    try {
      const data = await create(site);
      addSite(data);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    setInterval(fetchSites, 1000 * 60);
    fetchSites();
  }, []);

  return (
    <Context.Provider
      value={{
        sites,
        totalSites: sites.length,
        createSite,
        removeSite,
        updateSite,
        deleteSite,
        sitesLoaded,
        loading,
        error,
      }}
    >
      {children}
    </Context.Provider>
  );
};