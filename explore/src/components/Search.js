import React, { Component } from 'react';
import '../App.css';
import dictionary from '../assets/dictionary.json';

class Search extends Component {
    constructor(props) {
        super(props)
        this.state = {value: '', results: []}
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    handleChange(e) {
        this.setState({value: e.target.value})
    }
    
    handleKeyPress(e) {
        if (e.key == 'Enter') {
            // console.log(this.state.value)
            this.state.results = []
            for (var key in dictionary) {
                if (key.startsWith(this.state.value.toUpperCase()) && key.length/this.state.value.length <= 2) {
                    this.state.results.push(key)
                }
            }
            this.setState({value: ''})
            // console.log(this.state.results)
        }
    }

    handleClick(e) {
        this.props.wordClicked(e.target.id)
        
    }
    
    render() {
        return (
            <div className="Search-comp">
                <h3 id="Search-title" className="title">Search a Word</h3>
                <input type="text" className="Search-box" placeholder="Type in a word..." onChange={this.handleChange.bind(this)} onKeyPress={this.handleKeyPress} value={this.state.value} />
                <div id="Results">
                    {this.state.results.map((word) =>
                        <div key={word} className="Result-cell">
                            <div className="Result-text">{word.toLowerCase()}: {dictionary[word.toUpperCase()]}</div>
                            <input type="button" value="^" id={word} className="Upvote" onClick={this.handleClick.bind(this)} />
                        </div>        
                    )}
                </div>
            </div>
        );
    }
}

export default Search;