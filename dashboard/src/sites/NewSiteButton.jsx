import React, { useState } from 'react';
import { SiteModal } from './SiteModal';
import Button from 'react-bootstrap/Button';
import { createSite } from './sites.api';
import { useSites } from './SitesContext';

export const NewSiteButton = () => {
  const { addSite } = useSites();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const submit = async (site) => {
    const data = await createSite(site);
    console.log(data);
    addSite(data);
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