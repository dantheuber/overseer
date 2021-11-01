import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export const SiteModal = ({
  site,
  addSite,
  modifyExisting
}) => {
  const formRef = useRef(null);
  const [show, setShow] = useState(false);
  const [validated, setValidated] = useState(false);
  const [newSite, setNewSite] = useState(site);
  const handleShow = () => setShow(true);
  const handleHide = () => setShow(false);

  const updateNewSite = (e) => {
    const { name, value, type, checked } = e.target;
    const isCheckbox = type === 'checkbox';
    setNewSite({
      ...newSite,
      [name]: isCheckbox ? checked : value
    });
  };

  const handleSubmit = async () => {
    const form = formRef.current;
    const isValid = form.checkValidity();
    setValidated(true);
    if (!isValid) return;
    const response = await fetch('/api/site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSite),
    });
    const data = await response.json();
    addSite(data);
    handleHide();
  };
  
  return [
    <Button key="toggle" onClick={handleShow} variant="success">New Site</Button>,
    <Modal key="modal" show={show} onHide={handleHide}>
      <Modal.Header closeButton>
        <Modal.Title>Monitor New Site</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form ref={formRef} noValidate validated={validated}>
          <Form.Group className="mb-3" controlId="formLabel">
            <Form.Label>Site Label</Form.Label>
            <Form.Control
              type="text"
              name="label"
              required
              placeholder="A short name or label for this site."
              onChange={updateNewSite}
            />
            <Form.Control.Feedback type="invalid">Please provide a label</Form.Control.Feedback>
            <Form.Text className="text-muted">
              Example: My Site
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formUrl">
            <Form.Label>Site URL</Form.Label>
            <Form.Control
              type="text"
              name="url"
              required
              onChange={updateNewSite}
              placeholder="Enter site URL"
            />
            <Form.Control.Feedback type="invalid">What do you expect to be monitored?</Form.Control.Feedback>
            <Form.Text className="text-muted">
              {'Must be the full URL, including http(s)://'}
            </Form.Text>
          </Form.Group>
          <Form.Group>
            <Form.Label>Notification Methods</Form.Label>
            <Form.Check
              label="Discord"
              type="checkbox"
              name="alertDiscord"
              onChange={updateNewSite}
            />
            <Form.Text className="text-muted">More coming soon!</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              onChange={updateNewSite}
              placeholder="An short description of this site"
            />
            <Form.Text className="text-muted">(Optional)</Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleHide}>Close</Button>
        <Button variant="primary" onClick={handleSubmit}>Save</Button>
      </Modal.Footer>
    </Modal>
  ]
}
SiteModal.propTypes = {
  addSite: PropTypes.func.isRequired,
  site: PropTypes.object,
};
SiteModal.defaultProps = {
  site: {}
};