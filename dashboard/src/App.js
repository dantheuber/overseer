import Container from 'react-bootstrap/Container';
import { NavBar } from './Navigation';
import { Sites } from './sites/Sites';
import { SitesContext } from './sites/SitesContext';
import { UserContext } from './user/UserContext';
import { FetchProvider } from './FetchProvider'

function App() {
  return (
    <UserContext>
      <FetchProvider>
        <SitesContext>
          <NavBar />
          <Container className="App">
              <Sites />
          </Container>
        </SitesContext>
      </FetchProvider>
    </UserContext>
  );
}

export default App;
