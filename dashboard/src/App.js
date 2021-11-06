import Container from 'react-bootstrap/Container';
import { NavBar } from './Navigation';
import { Sites } from './sites/Sites';
import { SitesContext } from './sites/SitesContext';

function App() {
  return (
    <Container className="App">
      <SitesContext>
        <NavBar />
        <Sites />
      </SitesContext>
    </Container>
  );
}

export default App;
