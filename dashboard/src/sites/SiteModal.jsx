import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useSites } from './SitesContext';

const DEFAULT_NEW_SITE = {
  label: '',
  url: '',
  description: '',
  alertDiscord: false,
  tags: [],
};

export const SiteModal = ({
  site,
  onHide,
  onSubmit,
  show,
}) => {
  const { deleteSite } = useSites();
  const formRef = useRef(null);
  const [validated, setValidated] = useState(false);
  const [existingSite, setExistingSite] = useState(false);
  const [newSite, setNewSite] = useState(site);
  
  const resetSite = () => {
    setNewSite(DEFAULT_NEW_SITE);
  };

  const updateSite = (e) => {
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
    if (newSite.alertDiscord && !newSite.discordWebhook) {
      // need to verify webhook provided if alert discord is enabled
    }
    setValidated(true);
    if (!isValid) return;

    await onSubmit(newSite);

    if (!existingSite) {
      resetSite();
    }

    onHide();
  };

  useEffect(() => {
    if (site.url) {
      setExistingSite(true);
    }
  }, [site]);
  
  return (
    <Modal key="modal" show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Monitor Site</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form ref={formRef} noValidate validated={validated}>
          <Form.Group className="mb-3" controlId="formLabel">
            <Form.Label>Site Label</Form.Label>
            <Form.Control
              type="text"
              name="label"
              required
              value={newSite.label}
              placeholder="A short name or label for this site."
              onChange={updateSite}
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
              value={newSite.url}
              onChange={updateSite}
              placeholder="Enter site URL"
            />
            <Form.Control.Feedback type="invalid">What do you expect to be monitored?</Form.Control.Feedback>
            <Form.Text className="text-muted">
              {'Must be the full URL, including http(s)://'}
            </Form.Text>
          </Form.Group>
          <Form.Group>
            <Form.Label>Notification Methods</Form.Label>
            <Form.Group>
              <Form.Check
                label="Discord"
                type="checkbox"
                name="alertDiscord"
                checked={newSite.alertDiscord}
                onChange={updateSite}
              />
              <Form.Control
                type="text"
                name="discordWebhook"
                value={newSite.discordWebhook}
                onChange={updateSite}
                placeholder="Enter Discord Webhook URL"
                disabled={!newSite.alertDiscord}
              />
            </Form.Group>
            <Form.Text className="text-muted">More coming soon!</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={newSite.description}
              name="description"
              onChange={updateSite}
              placeholder="An short description of this site"
            />
            <Form.Text className="text-muted">(Optional)</Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        { existingSite && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => deleteSite(site)}
          >
            Delete
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={onHide}>Close</Button>
        <Button size="sm" variant="primary" onClick={handleSubmit}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}
SiteModal.propTypes = {
  onHide: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  site: PropTypes.object,
};
SiteModal.defaultProps = {
  site: DEFAULT_NEW_SITE,
};