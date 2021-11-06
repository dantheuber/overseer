import React, { useState } from 'react';
import { SiteModal } from './SiteModal';
import Button from 'react-bootstrap/Button';
import { useSites } from './SitesContext';

export const NewSiteButton = () => {
  const { createSite } = useSites();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const submit = async (site) => {
    await createSite(site);
    handleClose();
  };
  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        New Site
      </Button>
      <SiteModal show={show} onHide={handleClose} onSubmit={submit} />
    </>
  );
};