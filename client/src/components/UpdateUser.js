import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import autoBind from 'react-autobind';

const EDIT_USER_QUERY = gql`
    mutation EditUserQuery($id: Int!, $name: String, $address: String, $city: String, $zip_code: Int, $age: Int, $company_Id: Int) {
        editUser(ID: $id, NAME: $name, ADDRESS: $address, CITY: $city, ZIP_CODE: $zip_code, AGE: $age, COMPANY_ID: $company_Id) {
            ID
            NAME
            ADDRESS
            CITY
            ZIP_CODE
            AGE
            COMPANY_ID
        }
    }
`;

export default class UpdateUser extends Component {
    constructor() {
        super();
        autoBind(this);

        this.state = {
            id: null,
            name: null,
            address: null,
            city: null,
            zip_code: null,
            age: null,
            company_Id: null,
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
            <Mutation mutation={EDIT_USER_QUERY}>
                {
                    (editUser) => (                        
                        <Fragment>
                            <h4>Update User</h4>
                            <label htmlFor="id_id" style={labelStyle}>ID:</label><input type="text" style={textStyle} id="id_id" name="id" value={this.state.id} onChange={this.handleChange} /><br />
                            <label htmlFor="id_name" style={labelStyle}>Name:</label><input type="text" style={textStyle} id="id_name" name="name" value={this.state.name} onChange={this.handleChange} /><br />
                            <label htmlFor="id_address" style={labelStyle}>Address:</label><input type="text" style={textStyle} id="id_address" name="address" value={this.state.address} onChange={this.handleChange} /><br />
                            <label htmlFor="id_city" style={labelStyle}>City:</label><input type="text" style={textStyle} id="id_city" name="city" value={this.state.city} onChange={this.handleChange} /><br />
                            <label htmlFor="id_zip_code" style={labelStyle}>Zip Code:</label><input type="text" style={textStyle} id="id_zip_code" name="zip_code" value={this.state.zip_code} onChange={this.handleChange} /><br />
                            <label htmlFor="id_age" style={labelStyle}>Age:</label><input type="text" id="id_age" style={textStyle} name="age" value={this.state.age} onChange={this.handleChange} /><br />
                            <label htmlFor="id_company_Id" style={labelStyle}>Company ID:</label><input type="text" style={textStyle} id="id_company_Id" name="company_Id" value={this.state.company_Id} onChange={this.handleChange} /><br /><br /><br />
                            <button onClick={ e => {
                                        editUser( { variables: {
                                            id: parseInt(this.state.id),
                                            name: this.state.name,
                                            address: this.state.address,
                                            city: this.state.city,
                                            zip_code: (this.state.zip_code === null) ? null : parseInt(this.state.zip_code),
                                            age: (this.state.age === null) ? null : parseInt(this.state.age),
                                            company_Id: (this.state.company_Id === null) ? null : parseInt(this.state.company_Id)
                                        }})
                                }
                            } >Update</button><br /><br /><br />
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