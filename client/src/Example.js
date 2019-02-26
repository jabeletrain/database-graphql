import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import autoBind from 'react-autobind';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import User  from './components/User';
import Company from './components/Company';
import UserCompany from './components/UserCompany';
import CreateUser from './components/CreateUser';
import UpdateUser from './components/UpdateUser';
import DeleteUser from './components/DeleteUser';
import CreateCompany from './components/CreateCompany';
import UpdateCompany from './components/UpdateCompany';
import DeleteCompany from './components/DeleteCompany';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql'
});

// eslint-disable-next-line react/prefer-stateless-function
export default class Example extends React.Component {
  constructor() {
    super();
    autoBind(this);
  }

  render() {

    return (
      <ApolloProvider client={client}>
        <Router>
          <div>
            <Route exact path="/user" component={User} />
            <Route exact path="/company" component={Company} />
            <Route exact path="/usercompany" component={UserCompany} />
            <Route exact path="/createuser" component={CreateUser} />
            <Route exact path="/updateuser" component={UpdateUser} />
            <Route exact path="/deleteuser" component={DeleteUser} />
            <Route exact path="/createcompany" component={CreateCompany} />
            <Route exact path="/updatecompany" component={UpdateCompany} />
            <Route exact path="/deletecompany" component={DeleteCompany} />
            <div>
              <Link to={`/user`}>User</Link><br />
              <Link to={`/company`}>Company</Link><br />
              <Link to={`/usercompany`}>User / Company</Link><br /><br />
              <Link to={`/createUser`}>Create User</Link><br />
              <Link to={`/updateUser`}>Update User</Link><br />
              <Link to={`/deleteUser`}>Delete User</Link><br /><br />
              <Link to={`/createCompany`}>Create Company</Link><br />
              <Link to={`/updateCompany`}>Update Company</Link><br />
              <Link to={`/deleteCompany`}>Delete Company</Link><br />
            </div>
          </div>
        </Router>
      </ApolloProvider>
    );
  }
}
