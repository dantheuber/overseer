import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
import { SiteModal } from './SiteModal';
import { Site } from './Site';

export const Sites = () => {
  const [sites, setSites] = useState([]);
  const fetchSites = async () => {
    const results = await fetch('/api/list-sites');
    const { Items } = await results.json();
    setSites(Items);
  };

  const addSite = (site) => {
    setSites([site, ...sites]);
  };
  useEffect(() => {
    setInterval(fetchSites, 1000 * 60);
    const doit = async () => await fetchSites();
    doit();
  }, []);
  return (
    <Row>
      <SiteModal addSite={addSite} />
      { sites.map((site, i) => (
        <Site key={site.url} site={site} />
      ))}
    </Row>
  );
};
