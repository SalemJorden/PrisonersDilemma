import React from 'react';
import PrisonersDilemmaGame from './PrisonersDilemmaGame';
import { CssBaseline, Container } from '@material-ui/core';

function App() {
  return (
    <>
    <CssBaseline />
    <Container maxWidth="md">
      <PrisonersDilemmaGame />
    </Container>
  </>
  );
}

export default App;