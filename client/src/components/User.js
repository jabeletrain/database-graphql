import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import autoBind from 'react-autobind';

const USER_QUERY = gql`
    query UserQuery($id: Int!) {
        user(ID: $id) {
            ID
            NAME
            ADDRESS
            CITY
            ZIP_CODE
            AGE
        }
    }
`;


export default class User extends Component {
    constructor() {
        super();
        autoBind(this);
        
        this.state = {
            display: false,
            id: null,
        };
    }

    display() {
        this.setState( { display: true });
    }

    reset() {
        this.setState( { display: false });
    }

    render() {
        const labelStyle = {
            margin: "5px",
        };

        const textStyle = {
            margin: "5px",
        };

        const buttonStyle = {
            margin: "5px",
        };

        if (this.state.display === false) {
            return (
                <div>
                    <h4>User</h4>
                    <label htmlFor="id_id" style={labelStyle}>ID:</label><input type="text" style={textStyle} id="id_id" name="id" value={this.state.id} onChange={this.handleChange} /><br /><br /><br />
                    <button onClick={this.display} style={buttonStyle}>Display</button><br /><br /><br />
                </div>
            );
        } else if (this.state.display === true && this.state.id !== null) {
            let id = parseInt(this.state.id);

            return (
                <Fragment>
                    <Query query={USER_QUERY} variables={{id}}>
                        {
                            ({ loading, error, data }) => {
                                if (loading) <h4>Loading...</h4>
                                if (error) console.log('Error', error);
                                if (data.user == undefined) {
                                    return ( <div></div> );
                                } else {
                                    return (
                                        <div>
                                            <h4>User Data</h4>
                                            <ul>
                                                <li>ID: {data.user.ID}</li>
                                                <li>Name: {data.user.NAME}</li>
                                                <li>Address: {data.user.ADDRESS}</li>
                                                <li>City: {data.user.CITY}</li>
                                                <li>Zip Code: {data.user.ZIP_CODE}</li>
                                                <li>Age: {data.user.AGE}</li>
                                            </ul>
                                        </div>
                                    )
                                }
                            }
                        }
                    </Query>
                    <button onClick={this.reset}>Reset</button><br /><br /><br />
                </Fragment>
            );
        }
    }

    handleChange(e) {
        if (typeof e.preventDefault === 'function') {
           e.preventDefault();
        }
    
        if ('target' in e && 'name' in e.target && 'value' in e.target) { 
          let name = e.target.name;    // Name of the state variable
          let value = e.target.value;  // The new value to be assigned to the state variable
    
          //console.log({name,value});
    
          let stateChange = {};  // Used to change the state
          stateChange[name] = value;
    
          this.setState(stateChange);
        }
        else {
          console.log(typeof e);  // Something unusual, lets find out
          console.log(e);
        }
    }
}
