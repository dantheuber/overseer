import React, { useState, useEffect, useRef } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { SiteModal } from './SiteModal';
import { Site } from './Site';

export const Sites = () => {
  const modalRef = useRef(null);
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

  return ([
    <Row key="button">
      <Col>
        <SiteModal addSite={addSite} modalRef={modalRef} />
      </Col>
    </Row>,
    <Row key="list">
      { sites.map((site) => (
        <Col key={site.url} lg="4">
          <Site site={site} modalRef={modalRef} />
        </Col>)
      )}
    </Row>
  ]);
};
