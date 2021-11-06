import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { SiteModal } from './SiteModal';
import { updateSite, deleteSite } from './sites.api';

export const Site = ({ site }) => {
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
      {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
      <Card.Body>
        <Card.Text>{ site.description }</Card.Text>
        <Alert variant={siteDown ? 'danger':'success'}>
          Site is {siteDown ? 'DOWN':'ONLINE'}!
        </Alert>
        <Button onClick={deleteSite} variant="danger">Delete</Button>
        <Button onClick={handleShow} variant="primary">Edit</Button>
      </Card.Body>
      <SiteModal show={show} onHide={handleClose} onSubmit={submit} site={site} />
    </Card>
  );
};