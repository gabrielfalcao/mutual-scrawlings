import React, { Component } from 'react';
import Navbar from './components/Navbar'
import 'bootstrap/dist/css/bootstrap.css'

class App extends Component {
  render() {
    return (
      <div className="App">
          <Navbar />

          <div className="jumbotron">
              <div id="hero" className="container">
                  <h1>All videos. All the time.</h1>
                  <p>Guaranteed 100% server free.</p>
              </div>
          </div>

      </div>
    );
  }
}

export default App;
