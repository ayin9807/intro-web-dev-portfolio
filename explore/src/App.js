import React, { Component } from 'react';
import './App.css';
import Search from './components/Search.js'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {counts: {}, topfive: []}
    this.handleWord = this.handleWord.bind(this)
  }

  handleWord(data) {
    console.log(data);
    console.log(this.state)
    if (data in this.state.counts) {
      this.state.counts[data] = this.state.counts[data] + 1
    } else {
      this.state.counts[data] = 1
    }

    var sortedCounts = []
    for (var word in this.state.counts) {
      sortedCounts.push([word, this.state.counts[word]])
    }

    sortedCounts.sort(function(a, b) {
      return b[1]-a[1];
    })
    this.setState({topfive: sortedCounts.slice(0, 5)}) 
    console.log(this.state.topfive)
  }

  render() {
    return (
      <div className="App"> 
        <h1 className="App-title">WordUp</h1>
        <div className="Main">
            <Search wordClicked={this.handleWord} />
            <div id="Top-results">
              <h3 id="Results-title" className="title">Top 5!!!</h3>
              <div id="Results-list">
                {this.state.topfive.map((wordInfo, index) =>
                  <div key={wordInfo[0]}>{index+1}. {wordInfo[0]}: {wordInfo[1]}</div>
                )}
              </div>
            </div> 
        </div>
      </div>
    );
  }
}

export default App;
