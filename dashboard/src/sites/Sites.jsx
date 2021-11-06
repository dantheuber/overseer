import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Site } from './Site';
import { useSites } from './SitesContext';

export const Sites = () => {
  const { sites } = useSites();

  return (
    <Row>
      { sites.map((site) => (
        <Col key={site.url} lg="4">
          <Site site={site} />
        </Col>)
      )}
    </Row>
  );
};
