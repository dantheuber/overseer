import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export const Site = ({ site }) => (
  <Col>
    <Card>
      {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
      <Card.Body>
        <Card.Title href={site.url} target="_blank" rel="noopener noreferrer">
          <Button href={site.url}>
            {site.url}
          </Button>
        </Card.Title>
        <Card.Text>
          { site.status === 'up' && <Alert variant="success">Site is ONLINE</Alert> }
          { site.status === 'down' && <Alert variant="danger">Site is OFFLINE!</Alert> }
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
)