import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import Join from "./components/Join";
import Create from "./components/Create";
import Editor from "./components/Editor";
import NewVideo from "./components/NewVideo";

function App() {
  return (
    <div className='App'>
      <p>Hello</p>
      <Router>
        <Switch>
          <Route path='/' exact>
            <Home />
          </Route>
          <Route path='/join' exact>
            <Join />
          </Route>
          <Route path='/create' exact>
            <Create />
          </Route>
          <Route path='/:id'>
            <div className='video-editor'>
              <div className='editor'>
                <Editor />
              </div>
              <div className='newvideo'>
                <NewVideo />
              </div>
            </div>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
