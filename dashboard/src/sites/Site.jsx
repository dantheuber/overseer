import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export const Site = ({ site }) => (
  <Col>
    <Card>
      <Card.Header>
        <Card.Title>
          {site.label}
        </Card.Title>
      </Card.Header>
      {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
      <Card.Body>
        <Card.Text>
          { site.description }
          <Button variant="link" href={site.url} target="_blank">{site.url}</Button>
          { !site.status || site.status === 'up' && <Alert variant="success">Site is ONLINE</Alert> }
          { site.status === 'down' && <Alert variant="danger">Site is OFFLINE!</Alert> }
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
)