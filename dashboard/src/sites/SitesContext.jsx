import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";
import { useUser } from '../user/UserContext';
import { useFetch } from '../FetchProvider';

const BASE_API_URL = '/api/sites';

const Context = createContext();

export const useSites = () => useContext(Context);

export const SitesContext = ({ children }) => {
  const { fetch } = useFetch();
  const { isLoggedIn } = useUser();
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
      const data = await fetch(BASE_API_URL, { method: 'GET' });
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
      setError(`${error}`);
    }
  };

  const updateSite = async (site) => {
    try {
      const data = await fetch(`${BASE_API_URL}/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site)
      });
      setSites(sites.map(s => s.id === site.id ? data : s));
    } catch (error) {
      setError(error);
    }
  };

  const deleteSite = async (site) => {
    try {
      await fetch(`${BASE_API_URL}/${site.id}`, {
        method: 'DELETE'
      });
      removeSite(site);
    } catch (error) {
      setError(error);
    }
  };

  const createSite = async (site) => {
    try {
      const data = await fetch(BASE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site)
      });
      addSite(data);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      setInterval(fetchSites, 1000 * 60);
      fetchSites();
    }
  }, [isLoggedIn]);

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