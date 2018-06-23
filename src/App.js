import React, { Component } from 'react';

import IssueList from './IssueList';
import AppConfig from './AppConfig';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      token: localStorage.getItem('token'),
      repo: localStorage.getItem('repo'),
      user: localStorage.getItem('user'),
      config: false,
    };
  }

  _onClickConfig() {
    this.setState({config: true});
  }

  _onSubmitConfig({ user, repo, token }) {
    this.setState({ user, repo, token, config: false });
  }

  _onCancelConfig() {
    this.setState({ config: false });
  }

  render() {
    const { token, repo, user, config } = this.state;
    const notConfigured = (repo||'') === '' || (user||'') === '';

    return (
      <div className="App">
        <header className="App-header">
          <div className="App-header-content">
            <h1 className="App-title">Milestonia</h1>
            <div className="App-header-rightbox">
              <i className="material-icons icon-button" onClick={()=>{this._onClickConfig();}}>settings</i>
            </div>
          </div>
        </header>
        <div className="App-main">
          { notConfigured || config ?
            <AppConfig token={token} user={user} repo={repo}
              onSubmit={(args) => {this._onSubmitConfig(args);}}
              onCancel={() => {this._onCancelConfig();}}
            /> :
            <IssueList token={token} user={user} repo={repo} /> }
        </div>
      </div>
    );
  }
}

export default App;
