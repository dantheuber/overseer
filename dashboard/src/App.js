import Container from 'react-bootstrap/Container';
import { NavBar } from './Navigation';
import { Sites } from './sites/Sites';
import { SitesContext } from './sites/SitesContext';
import { UserContext } from './user/UserContext';

function App() {
  return (
    <UserContext>
      <SitesContext>
        <NavBar />
        <Container className="App">
            <Sites />
        </Container>
      </SitesContext>
    </UserContext>
  );
}

export default App;
