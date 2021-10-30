import logo from './logo.svg';
import { Example } from './Example';
import './App.css';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <Example example={["test", 'another test', 'dj khalid']} />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Poopy mcpoop
        </a>
      </header>
    </div>
  );
}

export default App;
