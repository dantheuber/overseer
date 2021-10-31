import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Sites } from './sites/Sites';

function App() {
  return (
    <Container className="App">
      <Row>
        <Col>
          <header className="App-header">
            Overseer
          </header>
        </Col>
      </Row>
      <Sites />
    </Container>
  );
}

export default App;
