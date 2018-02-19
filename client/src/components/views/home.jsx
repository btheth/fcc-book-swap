import React, { Component } from 'react';
import { Link } from 'react-router-dom';

//Home page of website - default if not logged in
class Home extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            errors: {},
            bookurls: [],
            width: 0,
            height: 0
        };
        this.getBooks = this.getBooks.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    //get book images to display in scrolly bar
    getBooks() {
        fetch('/api/books/tradeableimages')
        .then(response => response.json())
        .then(data => {
            this.setState({
                bookurls: data
            });
        })
        .catch(error => console.error(error))
    }

    //track window size for scroll bar size and speed
    componentDidMount() {
        this.getBooks();
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    //remove listender
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    //function to track window size
    updateWindowDimensions() {
        console.log(window.innerWidth);
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    render() {

        //funciton to get size of scrolling div
        const innerScrollWidth = () => {
            return this.state.bookurls.length * 175;
        }

        return (
            <div id='home'>

            <div id="title-div">
                <h1 id="title">BookSwap</h1>
            </div>

            <div id="home-body">
                <p>Welcome to BookSwap! Trade your used books for new ones with people all over the world.</p>
                <p><Link to='/login'><button style={{"width":"100px"}} className="btn btn-info" type='button'>Log In</button></Link> or <Link to='/register'><button style={{"width":"100px"}} className="btn btn-info" type='button'>Register</button></Link></p> 
            </div>

            <div id="outer-scroll">
                {(this.state.bookurls.length > 0) ?
                <div id="inner-scroll" style={
                    {
                        "width": innerScrollWidth() + "px",
                        "animation": "scroll-left " + (this.state.bookurls.length * 175 / 100) + "s linear infinite",
                        "transform": "translateX(" + this.state.width + "px)"
                    }
                }>
                     {this.state.bookurls.map((d) => <img className="home-books" src={d} alt='book cover'/>)}
                </div> : 
                <div/>}
            </div>

          </div>
        )
    }
} 

export default Home;