import Container from 'react-bootstrap/Container';
import { NavBar } from './Navigation';
import { Sites } from './sites/Sites';
import { SitesContext } from './sites/SitesContext';

function App() {
  return (
    <SitesContext>
      <NavBar />
      <Container className="App">
          <Sites />
      </Container>
    </SitesContext>
  );
}

export default App;
