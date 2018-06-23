import React, { Component } from 'react';
import GitHub from 'github-api';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Popup from 'reactjs-popup';
import 'react-tabs/style/react-tabs.css';

import './IssueList.css';

let gh = null;

const filterByDueOnSince = (milestones, unixtime) => {
  return milestones.filter(e => (Date.parse(e.due_on) >= unixtime) || e.due_on == null);
}

export default class IssueList extends Component {
  state = { milestones: [] };
  _milestones = [];

  constructor(props) {
    super(props);
    if (gh == null) {
      gh = new GitHub({token: props.token});
    }
    this._issuesApi = gh.getIssues(props.user, props.repo);
    this._limitApi = gh.getRateLimit();
    this._limitApi.getRateLimit().then(res => {
      this.setState({ rateLimit: res.data.resources.core });
    });
  }

  loadIssues(milestone) {
    const state = milestone.due_on == null ? 'open' : 'all';
    const opt = { milestone: milestone.number, state, sort: 'updated', direction: 'desc' };
    this._issuesApi.listIssues(opt, (error, result) => {
      if (!error) {
        milestone.issues = result;
        this.setState({
          milestones: this._milestones
        });
      }
    });
  }

  load() {
    this._issuesApi.listMilestones({ state: 'all', direction: 'desc', per_page: 10 }, (error, result) => {
      if (!error) {
        this._milestones = result;
        this.setState({ milestones: this._milestones });
      }
      this._issuesApi.listMilestones({ state: 'all', direction: 'asc', per_page: 10}, (error, result) => {
        if (!error) {
          this._milestones = this._milestones.concat(result.filter(e => e.due_on == null));
          this._milestones.forEach(e => this.loadIssues(e));
        }
      })
    });

    this._issuesApi.listIssues({ state: 'open', direction: 'desc', milestone: "none" }, (error, result) => {
      if (!error){
        const orphans = result.filter(e => !e.pull_request);
        this.setState({ orphans });
      }
    });
  }

  componentDidMount() {
    this.load();
  }

  _renderAssignees(assignees) {
    return assignees.map((e) => {
      return <img key={e.id} alt={e.login} src={e.avatar_url} className="avatar" />;
    });
  }

  _renderLabels(labels) {
    return labels.map((e) => {
      return <span key={e.id} className="label" style={{backgroundColor: `#${e.color}`}}>{e.name}</span>;
    });
  }

  _onMilestoneChange(issue, milestone) {
    const from = this.state.milestones.find(e => e.number === issue.milestone.number);
    const to = milestone;

    this._issuesApi.editIssue(issue.number, { milestone: to.number }).then(res => {
      if (res.status === 200) {
        if (from != null) {
          const index = from.issues.find(e => e.number === issue.number);
          from.issues.splice(index, 1);
        }
        const updatedIssue = res.data;
        to.issues.unshift(updatedIssue);
        this.setState({ milestones: this.state.milestones });
      }
    });
  }

  _renderMilestoneMenu(issue, close) {
    return this.state.milestones.map((e) => {
      const selected = issue.milestone ? (e.number === issue.milestone.number) : false;
      if (selected) {
        return (
          <div key={`${e.number}`} className="menuItem checked">
            {e.title} <i className="material-icons">check</i>
          </div>
        );
      }
      return (
        <div key={`${e.number}`}
          className="menuItem not-checked"
          onClick={() => {
            close();
            this._onMilestoneChange(issue, e);
          }} >
          {e.title}
       </div>);
    });
  }

  _renderIssues(issues) {
    if (!issues) {
      return <div className="tr message">Loading...</div>;
    }
    if (issues.length === 0) {
      return <div className="tr message">No Issue</div>;
    }
    return issues.map(e => {
      return (
        <div key={e.id} className={`tr ${e.state}`}>
          <div className="td state"><i className="material-icons">{e.state === 'closed' ? 'check' : 'error_outline'}</i></div>
          <div className="td title">
            <a href={e.html_url} target={`_issue#${e.number}`}>{e.title}</a><br/>
            <span className="subtext">#{e.number} by {e.user.login}</span>
          </div>
          <div className="td assignees">{this._renderAssignees(e.assignees)}</div>
          <div className="td labels">{this._renderLabels(e.labels)}</div>
          <div className="td menu">
            <Popup
              trigger={<i className="material-icons">more_horiz</i>}
              on="click"
              position="bottom right"
              arrow={false}
            >
              {close => this._renderMilestoneMenu(e, close)}
            </Popup>
          </div>
        </div>
      );
    });
  }

  _renderMilestones(milestones) {
    if (milestones != null) {
      return milestones.map((e) => {
          const numOpen = e.issues ? e.issues.filter(e => e.state === 'open').length : 0;
          const numClosed = e.issues ? e.issues.filter(e => e.state === 'closed').length : 0;
          const progress = (numOpen + numClosed) > 0 ? numClosed / (numOpen + numClosed) : 0;
          return (
          <div key={e.number} className="IssueList">
            <div className="section-header">
              {e.number ? e.title : 'No milestone'}&nbsp;
              {e.number ? <a href={e.html_url}  target={`milestone_${e.number}`}>
                <i className="material-icons" style={{fontSize:18,verticalAlign:'middle'}}>exit_to_app</i>
              </a> : null}
              <div className="info">
                <i className="material-icons" style={{fontSize:18,verticalAlign:'middle'}}>event</i>&nbsp;
                {e.due_on ?
                  <span>Due by {new Date(Date.parse(e.due_on)).toLocaleDateString()}</span> :
                  <span>No due date</span>
                }
                <span><b>{Math.floor(progress * 100)}%</b> complete</span>
              </div>
            </div>
            <div className="issue-header">
              <i className="material-icons">error_outline</i><span>{numOpen} Open</span>
              <i className="material-icons">check</i><span>{numClosed} Closed</span>
            </div>
            <div className="progress-slider">
              <div className="progress-inner" style={{width: Math.ceil(820 * progress)}} />
            </div>
            {this._renderIssues(e.issues)}
          </div>
        );
      });
    }
    return null;
  }

  _renderOrphans() {
    return this._renderMilestones([{
      title: null,
      number: null,
      html_url: '',
      issues: this.state.orphans,
    }]);
  }

  render() {
    const { milestones, rateLimit } = this.state;

    const determinate = milestones.filter(e => e.due_on != null);
    const indeterminate = milestones.filter(e => e.due_on == null);

    return (
      <div>
        <p className="rateLimit">API Limit: { rateLimit ? `${rateLimit.remaining}/${rateLimit.limit}` : ''}</p>
        <Tabs>
          <TabList>
            <Tab>Due by fixed date</Tab>
            <Tab>No due date</Tab>
            <Tab>No milestone</Tab>
          </TabList>
          <TabPanel>
            {this._renderMilestones(determinate)}
          </TabPanel>
          <TabPanel>
            {this._renderMilestones(indeterminate)}
          </TabPanel>
          <TabPanel>
            {this._renderOrphans()}
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

