import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import autoBind from 'react-autobind';

const ADD_COMPANY_QUERY = gql`
    mutation CompanyUserQuery($id: Int!, $name: String!, $address: String!, $city: String!, $zip_code: Int!,  $description: String!) {
        addCompany(ID: $id, NAME: $name, ADDRESS: $address, CITY: $city, ZIP_CODE: $zip_code, DESCRIPTION: $description) {
            ID
            NAME
            ADDRESS
            CITY
            ZIP_CODE
            DESCRIPTION
        }
    }
`;

export default class CreateCompany extends Component {
    constructor() {
        super();
        autoBind(this);

        this.state = {
            name: null,
            description: null,
        }
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
        
        return (
            <Mutation mutation={ADD_COMPANY_QUERY}>
                {
                    (addCompany) => (                        
                        <Fragment>
                            <h4>Create Company</h4>
                            <label htmlFor="id_id" style={labelStyle}>ID:</label><input type="text" style={textStyle} id="id_id" name="id" value={this.state.id} onChange={this.handleChange} /><br />
                            <label htmlFor="id_name" style={labelStyle}>Company Name:</label><input type="text" style={textStyle} id="id_name" name="name" value={this.state.name} onChange={this.handleChange} /><br />
                            <label htmlFor="id_address" style={labelStyle}>Address:</label><input type="text" style={textStyle} id="id_address" name="address" value={this.state.address} onChange={this.handleChange} /><br />
                            <label htmlFor="id_city" style={labelStyle}>City:</label><input type="text" style={textStyle} id="id_city" name="city" value={this.state.city} onChange={this.handleChange} /><br />
                            <label htmlFor="id_zip_code" style={labelStyle}>Zip Code:</label><input type="text" style={textStyle} id="id_zip_code" name="zip_code" value={this.state.zip_code} onChange={this.handleChange} /><br />
                            <label htmlFor="id_description" style={labelStyle}>Description:</label><input type="text"  style={textStyle}id="id_description" name="description" value={this.state.description} onChange={this.handleChange} /><br />
                            <button style={buttonStyle} onClick={ e => {
                                        addCompany( { variables: {
                                            id: parseInt(this.state.id),
                                            name: this.state.name,
                                            address: this.state.address,
                                            city: this.state.city,
                                            zip_code: parseInt(this.state.zip_code),
                                            description: this.state.description,
                                        }})
                                }
                            } >Create</button><br /><br /><br />
                        </Fragment>
                    )
                }
            </Mutation>
        );
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