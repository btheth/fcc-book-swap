import React, { Component } from 'react';
import Auth from '../../modules/Auth';
import Header from './partials/header';

//image to display if there is no cover picture for a book
const imageMissingUrl = "http://en.immostreet.com/Content/img/icon/icon_missing_photo_detail.png";

class Addbook extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      errors: "",
      success: "",
      search: "",
      input: "",
      results: [],
      searchMethod: "title",
      selected: -1
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleBookClick = this.handleBookClick.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleAddAndStay = this.handleAddAndStay.bind(this);
  }

  //Method to handle the actual adding of a desired book to a user's collection
  handleAddClick() {
    //figure out which book we are adding based on currently selected book
    const book = this.state.results.items[this.state.selected].volumeInfo;

    //get all required info and put it in form data const
    const title = encodeURIComponent(book.title);
    const author = book.authors ? encodeURIComponent(book.authors[0]) : encodeURIComponent('');
    const imageurl = book.imageLinks ? (book.imageLinks.thumbnail ? encodeURIComponent(book.imageLinks.thumbnail) : encodeURIComponent('')) : encodeURIComponent('');
    const description = book.description ? encodeURIComponent(book.description) : encodeURIComponent('');
    const userId = Auth.getId();

    const formData = `title=${title}&author=${author}&imageurl=${imageurl}&description=${description}&userId=${userId}`;

    //send post request to server
    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/books/add');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success

        // change the component-container state
        this.setState({
          errors: "",
          success: ""
        });

        //redirect to profile, where book will appear
        this.props.history.push('/profile');

      } else {
        // failure

        const errors = xhr.response.errors ? xhr.response.errors : "";

        this.setState({
          errors
        });
      }
    });
    xhr.send(formData);
  }

  //Method to add a book and then remain on add page - mostly the same as above method without redirect
  handleAddAndStay() {
    const book = this.state.results.items[this.state.selected].volumeInfo;

    const title = encodeURIComponent(book.title);
    const author = book.authors ? encodeURIComponent(book.authors[0]) : encodeURIComponent('');
    const imageurl = book.imageLinks ? (book.imageLinks.thumbnail ? encodeURIComponent(book.imageLinks.thumbnail) : encodeURIComponent('')) : encodeURIComponent('');
    const description = book.description ? encodeURIComponent(book.description) : encodeURIComponent('');
    const userId = Auth.getId();

    const formData = `title=${title}&author=${author}&imageurl=${imageurl}&description=${description}&userId=${userId}`;

    
    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/books/add');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success

        // change the component-container state
        //Difference here is that we reset some state variables and also display a success message
        this.setState({
          errors: "",
          success: "'" + ((book.title.length > 47) ? book .title.substring(0,47).trim() + "..." : book.title) + "' added to collection!",
          input: "",
          results: [],
          selected: -1
        });

        // make a redirect - i don't think this actually does anything
        this.props.history.push('/addbook');

      } else {
        // failure

        const errors = xhr.response.errors ? xhr.response.errors : "";

        this.setState({
          errors
        });
      }
    });
    xhr.send(formData);
  }

  componentDidMount() {
    //add keydown listener
    document.addEventListener("keydown", this.handleKeyPress, false);
  }

  componentWillUnmount(){
    //remove listener
    document.removeEventListener("keydown", this.handleKeyPress, false);
  }

  //I do my api search here - I know that is technically frowned on but I didn't know how else to get it done
  componentWillUpdate(nextProps, nextState) {

    //do checks to see if next state is different from current state in ways that would trigger a search
    if (this.state.search !== nextState.search 
      || (this.state.searchMethod !== nextState.searchMethod 
        && this.state.search !== '')) {

      //if so, send search to server and handle results
      const search = encodeURIComponent(nextState.search);
      const method = encodeURIComponent(nextState.searchMethod);

      const formData = `search=${search}&method=${method}`;

      const xhr = new XMLHttpRequest();
      xhr.open('post', '/api/books/booksearch');
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
      xhr.responseType = 'json';
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          // success
          console.log(xhr.response);

          // change the component-container state
          this.setState({
            errors: ((xhr.response.totalItems === 0) ? "Search returned no results. Try a new one." : ""),
            results: xhr.response,
            selected: -1,
            success: ""
          });

          
        } else {
          // failure

          // change the error message
          const errors = xhr.response.errors ? xhr.response.errors : "";

          this.setState({
            errors
          });
        }
      });
      xhr.send(formData);
    }
  }

  handleKeyPress(event) {
    //treat enter like submit button click
    if (event.keyCode === 13) {
      this.handleSubmit();
    }
  }

  //method to keep track of currently active "clicked" book
  handleBookClick(event) {
    const ind = Number(event.currentTarget.dataset.id);

    //only set if clicked book isn't currently selected
    if (this.state.selected !== ind) {
      const newResults = this.state.results;

      //set selected variable appropriately
      for (let i = 0; i < this.state.results.items.length; i++) {
        if (i === ind) {
          newResults.items[i].selected = true;
        } else {
          newResults.items[i].selected = false;
        }
      }

      //set state
      this.setState({
        results: newResults,
        selected: ind
      })
    }
  }

  //keep track of search input
  handleChange(event) {
    this.setState({
      input: event.target.value
    });
  }

  //set search to input when it is submitted
  handleSubmit() {
    if (this.state.input.trim() !== '') {
      this.setState({
        search: this.state.input.trim(),
        input: ""
      })
    }
  }

  //keep track of search method with radio buttons
  handleRadioChange(event) {
    if (this.state.searchMethod !== event.target.value) {
      this.setState({
        searchMethod: event.target.value
      })
    }
  }

  render() {
    return (
      <div>
      <Header />
      <div id="addbook">

        <div id="logged-in-title-div">
          <h1 id="logged-in-title">Add Book</h1>
        </div>

        <div id="add-book-body">
        <p>Books you add will not immediately be available for trade. You will need to mark them tradeable from your profile.</p>
        
        {this.state.success && <p className="success-bar">{this.state.success}</p>}
        {this.state.errors && <p className="error-bar">{this.state.errors}</p>}

            <input style={{"width":"50%"}} type="text" value={this.state.input} onChange={this.handleChange} placeholder="Enter search"/>
            <button className="btn btn-success btn-sm" type="text" onClick={this.handleSubmit}>Submit</button>
            <br/>
            Search by:
            <br/>
            <input readOnly checked={(this.state.searchMethod === "title") ? true : false} type="radio" name="searchMethod" value="title" onClick={this.handleRadioChange} /> Title <input readOnly checked={(this.state.searchMethod === "author") ? true : false} type="radio" name="searchMethod" value="author" onClick={this.handleRadioChange} /> Author

        {(this.state.selected !== -1) ? 
          <div style={{"height":"20px", "margin-bottom":"25px"}}>
            <br/>

            Add &#39;{(this.state.results.items[this.state.selected].volumeInfo.title.length > 47) ? 
              this.state.results.items[this.state.selected].volumeInfo.title.substring(0,47).trim() + "..." :
              this.state.results.items[this.state.selected].volumeInfo.title}&#39; to collection?

            <button style={{"margin-left":"5px"}} className="btn btn-success btn-sm" type="text" onClick={this.handleAddClick}>Add</button>
            <button style={{"margin-left":"5px"}} className="btn btn-success btn-sm" type="text" onClick={this.handleAddAndStay}>Add &amp; Stay</button>
          </div> : ((this.state.search.trim() !== '' && this.state.results.totalItems > 0) ? 
          <div style={{"height":"20px", "margin-bottom":"25px"}}>
            <br/>Click image to select book.
          </div> : <div/>)}

        <br/>
        {(this.state.search.trim() !== '' && this.state.results.length > 0) ? 'Search results for ' + this.state.searchMethod + ' \'' + this.state.search  + '\':': ''}

        <div id='book-results'>
          {this.state.results.items ? this.state.results.items.map((d,i) => 
            <table id="search-table">
              <tbody>
                <tr className="search-row">
                  <td rowSpan="3" className="cover-cell">
                    <img data-id={i} onClick={this.handleBookClick} alt={d.volumeInfo.title} className={d.selected ? 
                      'add-book-selected' : 'add-book-unselected'} src={d.volumeInfo.imageLinks ? 
                        d.volumeInfo.imageLinks.thumbnail : imageMissingUrl}/>
                  </td>
                  <td className="title-cell">{d.volumeInfo.title}</td>
                  <td className="description-cell" rowSpan="3">
                    {d.volumeInfo.description ? d.volumeInfo.description : 'No description available'}
                  </td>
                </tr>
                <tr className="search-row">
                  <td className="title-cell">
                    {d.volumeInfo.authors ? 'By: ' + d.volumeInfo.authors[0] : 'Unknown Author'}
                  </td>
                </tr>
              </tbody>
            </table>) : <div/>}
        </div>
        </div>
      </div>
      </div>
    );
  }
}

export default Addbook;