import React from 'react';
import Button from 'react-bootstrap/Button';
import { authDomain, userPoolClientId } from '../config.json';

export const buildUrl = () => 
  `https://${authDomain}/login?client_id=${
    userPoolClientId
  }&response_type=token&scope=email+openid+profile&redirect_uri=${
    encodeURIComponent(`${window.location.protocol}//${window.location.host}`)
  }`;

export const LoginButton = () => {
  const onClick = () => {
    const url = buildUrl();
    window.location.href = url;
  };
  return (
    <Button variant="primary" onClick={onClick}>
      Login
    </Button>
  );
};