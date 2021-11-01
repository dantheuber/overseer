import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

export const Site = ({ site }) => {
  const siteDown = site.status === 'down';
  const deleteSite = async () => {
    await fetch(`/api/site?url=${encodeURIComponent(site.url)}`, {
      method: 'DELETE',
      body: JSON.stringify(site),
    });
    window.location.reload();
  };
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <Button variant="link" href={site.url} target="_blank">{site.label}</Button>
        </Card.Title>
      </Card.Header>
      {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
      <Card.Body>
        <Card.Text>{ site.description }</Card.Text>
        <Alert variant={siteDown ? 'danger':'success'}>
          Site is {siteDown ? 'DOWN':'ONLINE'}!
        </Alert>
        <Button onClick={deleteSite} variant="danger">Delete</Button>
      </Card.Body>
    </Card>
  );
};