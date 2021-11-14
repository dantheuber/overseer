import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner'
import { Site } from './Site';
import { useSites } from './SitesContext';

export const Sites = () => {
  const {
    sites,
    loading,
    sitesLoaded,
    totalSites,
    error
  } = useSites();

  return (
    <Row>
      { error && <Col>{error}</Col> }
      { sitesLoaded && !totalSites && (
        <Col>
          <h3>No sites found</h3>
        </Col>
      )}
      { sitesLoaded && sites.map((site) => (
        <Col key={site.url} lg="4">
          <Site site={site} />
        </Col>)
      )}
      { loading && <Col><Spinner size="lg" animation="border" variant="primary" /></Col> }
    </Row>
  );
};
