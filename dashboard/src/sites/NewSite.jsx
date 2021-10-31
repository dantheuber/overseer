import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export const NewSiteModal = () => {
  const [show, setShow] = useState(false);
  const [newSite, setNewSite] = useState({});
  const handleShow = () => setShow(true);
  const handleHide = () => setShow(false);

  return [
    <Button key="toggle" onClick={handleShow} variant="success">New Site</Button>,
    <Modal key="modal" show={show} onHide={handleHide}>
      <Modal.Header closeButton>
        <Modal.Title>Monitor New Site</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formUrl">
            <Form.Label>Site URL</Form.Label>
            <Form.Control type="text" placeholder="Enter site URL" />
            <Form.Text className="text-muted">
              {'Must be the full URL, including http(s)://'}
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="A quick description of this site" />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleHide}>Close</Button>
        <Button variant="primary">Save</Button>
      </Modal.Footer>
    </Modal>
  ]
}
