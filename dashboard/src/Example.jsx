import React, { useState, useEffect } from 'react';

export const Example = ({ example }) => {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);

  useEffect(() => { console.log('hello wes'); }, []);
  return (
    <div>
      <button onClick={toggleShow}>CLICK ME!</button>
      { show && <h1>LOOK AT ME!</h1> }
    </div>
  );
};
