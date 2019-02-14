var database = require ('./Database');

const fields = [ // Fields for the SELECT statement
    "NCTR_ID# AS NCTR_ID",
    "LAST_NAME",
    "FIRST_NAME",
    "MIDDLE_INITIAL",
    "GOES_BY",
    "FAMILY_RANK",
    "FACILITY_CODE",
    "DIVISION_CODE",
    "BRANCH_CODE",
    "NETWORK_ID",
    "DATE_CHANGED",
    "TIME_CHANGED",
    "CHANGED_BY",
    "EMPLOYEE_TYPE",
    "INACTIVE_FLAG",
    "MAIL_CODE",
    "ACCT_FLAG",
    "SUPERVISOR_ID",
    "EHRP_ID",
    "PHONE_NUMBER",
    "FAX_NUMBER",
    "BUILDING",
    "ROOM",
    "EMAIL",
    "FULL_NAME",
    "ORG",
    "LOCATION_TXT",
    "EMPLOYEENUMBER",
];

var buildFields = function() {
  let build = '';

  for (let i = 0; i < fields.length - 1; i++) {
      build += fields[i] + ", "
  }

  build += fields[fields.length - 1];

  return build;
}

module.exports.buildFields;

/*******************************************************************************************
 *
 * This method will return the information about a user based on the user's network ID
 *
 *
 *******************************************************************************************/
var getUserDirInfoByNetworkID = function(info) {
    database.setConnectionInfo (info.user, info.password, info.connection); // Connect to the database

    if (info.role !== '' && info.role !== '?') {  // Check for a role
      database.setRole (info.role);
    }

    database.setReturn ('OBJECT');

    const where = "UPPER(NETWORK_ID) = '" + info.who.trim().toUpperCase() + "'"; // WHERE clause for the SELECT statement

    let query = 'SELECT ' + buildFields() + ' FROM USERDIR WHERE ' + where;  // Build the SQL database query

    return new Promise ( (resolve, reject) => { // Return the user information
        // Retrieve the user information from the database
        database.databaseSELECT (query)
        .then (results => resolve (results[0]) )
        .catch (err => reject (err) );
    })
}

module.exports.getUserDirInfoByNetworkID = getUserDirInfoByNetworkID;

/*******************************************************************************************
 *
 * This method will return the information about a user based on the user's NCTR ID
 *
 * param nctrID - the NCTR ID of the user
 *
 *******************************************************************************************/
var getUserDirInfoByNCTRID = function(nctrID) {
    database.setConnectionInfo (info.user, info.password, info.connection); // Connect to the database

    if (info.role !== '' && info.role !== '?') {  // Check for a role
      database.setRole (info.role);
    }

    const where = "NCTR_ID# = " + nctrID;   // WHERE clause for the SELECT statement

    let query = 'SELECT ' + buildFields() + ' FROM USERDIR WHERE ' + where;  // Build the SQL database query

    return new Promise ( (resolve, reject) => { // Return the user information
        // Retrieve the user information from the database
        database.databaseSELECT (query)
        .then (results => resolve (results) )
        .catch (err => reject (err) );
    })
}

module.exports.getUserDirInfoByNCTRID = getUserDirInfoByNCTRID;

/*******************************************************************************************
 *
 * This method will return the information about a user based on the user's full name field
 *
 * param name - the full name of the user
 *
 *******************************************************************************************/
var getUserByFullName = function(name) {
    database.setConnectionInfo (info.user, info.password, info.connection); // Connect to the database

    if (info.role !== '' && info.role !== '?') {  // Check for a role
      database.setRole (info.role);
    }

    const where = "FULL_NAME = " + name;    // WHERE clause for the SELECT statement

    let query = 'SELECT ' + buildFields() + ' FROM USERDIR WHERE ' + where;  // Build the SQL database query

    return new Promise ( (resolve, reject) => { // Return the user information
        // Retrieve the user information from the database
        database.databaseSELECT (query)
        .then (results => resolve (results) )
        .catch (err => reject (err) );
    })
}

module.exports.getUserByFullName = getUserByFullName;
