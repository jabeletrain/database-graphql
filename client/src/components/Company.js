import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import autoBind from 'react-autobind';

const COMPANY_QUERY = gql`
    query CompanyQuery($id: Int!) {
        company(ID: $id) {
            ID
            NAME
            ADDRESS
            CITY
            ZIP_CODE
            DESCRIPTION
        }
    }
`;


export default class Company extends Component {
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
                    <h4>Company</h4>
                    <label htmlFor="id_id" style={labelStyle}>ID:</label><input type="text" style={textStyle} id="id_id" name="id" value={this.state.id} onChange={this.handleChange} /><br /><br /><br />
                    <button onClick={this.display} style={buttonStyle}>Display</button><br /><br /><br />
                </div>
            );
        } else if (this.state.display === true && this.state.id !== null) {
            let id = parseInt(this.state.id);

            return (
                <Fragment>
                    <Query query={COMPANY_QUERY} variables={{id}}>
                        {
                            ({ loading, error, data }) => {
                                if (loading) <h4>Loading...</h4>
                                if (error) console.log('Error', error);
                                if (data.company == undefined) {
                                    return ( <div></div> );
                                } else {
                                    return (
                                        <div>
                                            <h4>User Data</h4>
                                            <ul>
                                                <li>ID: {data.company.ID}</li>
                                                <li>Name: {data.company.NAME}</li>
                                                <li>Address: {data.company.ADDRESS}</li>
                                                <li>City: {data.company.CITY}</li>
                                                <li>Zip Code: {data.company.ZIP_CODE}</li>
                                                <li>Description: {data.company.DESCRIPTION}</li>
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
