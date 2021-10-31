import React, { useState, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
import { SiteModal } from './SiteModal';
import { Site } from './Site';

export const Sites = () => {
  const [sites, setSites] = useState([]);
  const fetchSites = async () => {
    const results = await fetch('https://p08oc72u3l.execute-api.us-west-1.amazonaws.com/list-sites'); // fix this
    const { Items } = await results.json();
    setSites(Items);
  }
  useEffect(() => {
    setInterval(fetchSites, 1000 * 60);
    const doit = async () => await fetchSites();
    doit();
  }, []);
  return (
    <Row>
      <SiteModal />
      { sites.map((site, i) => (
        <Site key={site.url} site={site} />
      ))}
    </Row>
  );
};
