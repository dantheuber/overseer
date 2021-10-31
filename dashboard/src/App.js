import Container from 'react-bootstrap/Container';
import { Sites } from './sites/Sites';

function App() {
  return (
    <Container className="App">
      <header>
        <h1>Overseer</h1>
      </header>
      <Sites />
    </Container>
  );
}

export default App;
