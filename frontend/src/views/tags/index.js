import React, { useState } from 'react';

import Context from './context';
import { STAGE } from './data';

import List from './list';
import Form from './form';

const Tags = () => {
  const value = useState({
    stage: STAGE.RESET,
    form: null
  });

  return (
    <Context.Provider value={value}>
      <List />
      <Form />
    </Context.Provider>
  );
};

export default Tags;
