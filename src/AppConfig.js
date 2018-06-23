import React, { Component } from 'react';
import './AppConfig.css';

export default class AppConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user,
      repo: props.repo,
      token: props.token,
    };
  }

  _handleSubmit() {
    localStorage.setItem('token', this.state.token);
    localStorage.setItem('user', this.state.user);
    localStorage.setItem('repo', this.state.repo);
    this.props.onSubmit(this.state);
  }

  _onChangeUser(e) {
    this.setState({
      user: e.target.value.replace(/(^\s*|\s*$)/g,'')
    });
  }

  _onChangeRepo(e) {
    this.setState({
      repo: e.target.value.replace(/(^\s*|\s*$)/g,'')
    });
  }

  _onChangeToken(e) {
    this.setState({
      token: e.target.value.replace(/(^\s*|\s*$)/g,'')
    });
  }

  render() {
    return (<div className="App-config">
      <h2>Configuration</h2>
        <table>
          <tbody>
            <tr>
              <th>Repository Owner<sup>*</sup></th>
              <td>
                <input
                  autocorrect="off" autocapitalize="off" spellcheck="false"
                  type="text"
                  size="64"
                  value={this.state.user}
                  onChange={(e) => {this._onChangeUser(e);}}
                />
              </td>
            </tr>
            <tr>
              <th>Repository Name<sup>*</sup></th>
              <td>
                <input
                  autocorrect="off" autocapitalize="off" spellcheck="false"
                  type="text"
                  size="64"
                  value={this.state.repo}
                  onChange={(e) => {this._onChangeRepo(e);}}
                />
              </td>
            </tr>
            <tr>
              <th>Personal Access Token</th>
              <td>
                <input
                  autocorrect="off" autocapitalize="off" spellcheck="false"
                  type="text"
                  size="64"
                  value={this.state.token}
                  onChange={(e) => {this._onChangeToken(e);}}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button onClick={()=>{this._handleSubmit();}} className="primary">OK</button>
      </div>);
  }
}