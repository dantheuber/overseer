import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { SiteModal } from './SiteModal';
import { useSites } from './SitesContext';

export const Site = ({ site }) => {
  const { updateSite } = useSites();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const submit = async (values) => {
    await updateSite(values);
    handleClose();
  };

  const siteDown = site.status === 'down';
  
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <Button variant="link" href={site.url} target="_blank">{site.label}</Button>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Card.Text>{ site.description }</Card.Text>
        <Alert variant={siteDown ? 'danger':'success'}>
          Site is {siteDown ? 'OFFLINE':'ONLINE'}!
        </Alert>
        <Button size="sm" onClick={handleShow} variant="secondary">Edit</Button>
      </Card.Body>
      <SiteModal show={show} onHide={handleClose} onSubmit={submit} site={site} />
    </Card>
  );
};