// import oracledb from 'oracledb';
var oracledb = require ('oracledb');
var UserDir = require ('./UserDir');

const PRINT = true; // Indicates that the query should be printed to the console (true).  A value of false indicates that nothing should be printed to the console.

// The oracle defaults
oracledb.autoCommit = true;             // Always commit the transaction to the database
oracledb.extendedMetaData = true;       // Indicates additional metadata, such as name, fetchType, precision, scale, or nullable, is available for queries
oracledb.maxRows = 1000000;             // Maximum number of rows that can be returned
oracledb.outFormat = oracledb.ARRAY;    // Display the output as an array instead of an object

var connectionInfo = {};                // The connection information needed to make a connection
var roleName = null;                    // The name of the role associated with the connection
var result_set = false;                 // Indicates whether the results are being returned as a result set (true) or not (false)
var reason = null;                      // The audit reason for inserts, updates, or deletes

/********************************************************************************************
 *
 * This mehtod will set the autoCommit, which will automatically commit the transaction to
 * the database if set to true; otherwise, it must be done with the commit command if false.
 *
 * @param commit - indicates whether autocommit is on (true) or off (false)
 *
 *********************************************************************************************/
var setAutoCommit = function(commit) {
    oracledb.autoCommit = commit;
}

module.exports.autoCommit = setAutoCommit;

/*********************************************************************************************
 *
 * This method sets how the data is to be returned from the SELECT statement.  The options are
 * OBJECT (return the data as an object) or ARRAY (return the data as an array of objects).
 *
 * @param type - indictates how the data is to be returned from the SELECT object.  The values
 *               can be OBJECT or ARRAY.
 *
 **********************************************************************************************/
var setReturn = function(type) {
    if (type === 'OBJECT') {
        oracledb.outFormat = oracledb.OBJECT;
    } else if (type === 'ARRAY') {
        oracledb.outFormat = oracledb.ARRAY;
    } else {    // Netiher OBJECT or ARRY was selected, so default to ARRAY
        oracledb.outFormat = oracledb.ARRAY;
    }
}

module.exports.setReturn = setReturn;

/***********************************************************************************************
 *
 * Sets the connection information that is needed to access the database.
 *
 * @param userName - the name of the user who can access this database
 * @param password - the password of the user who can access this database
 * @param connectionString - the TNSName or URL that contains the database to access
 *
 ***********************************************************************************************/
var setConnectionInfo = function (userName, password, connectString) {
    connectionInfo = {
        "user": userName,
        "password": password,
        "connectString": connectString
    };
}

module.exports.setConnectionInfo = setConnectionInfo;

/***********************************************************************************************
 *
 * This sets the role for the user, which indicates which tables and rights to those tables
 * the user has.
 *
 * @param roleValue - the name of the role to be assigned to the user
 *
 ***********************************************************************************************/
var setRole = function(roleValue) {
    roleName = roleValue;
}

module.exports.setRole = setRole;

/***********************************************************************************************
 *
 * Sets the audit reason, which is the reason why the user is inserting, updating, or deleting
 * data from the database.
 *
 * @param why - the reason why the data in the database is being inserted into, updated, or
 *              deleted
 *
 ***********************************************************************************************/
var setReason = function(why) {
    reason = why;
}

module.exports.setReason = setReason;

/***********************************************************************************************
 *
 * This method will retrieve the audit reason that the user set.
 *
 ***********************************************************************************************/
var getReason = function() {
    return reason;
}

module.exports.getReason = getReason;

/**********************************************************************************
 *
 * This will create a temporary table that is needed for this session.
 *
 * @param tableName - the name of the temporary table
 * @param columns - the columns for the table
 * @param tempTable - indicates whether it is a temporary table (true) or not (false)
 * @param withPreserve - indicates if the rows will be preserved (true) or not (false)
 *
 **********************************************************************************/
var createTempTable = function (tableName, columns, tempTable = false, withPreserve = false) {
    var col = '';  // Holds the column names

    // Place the column names in the string
    for (var i = 0; i < columns.length; i++) {
        col += columns[i];

        // Place a comma between each column, except for the last column
        if (i < columns.length - 1) {   // Not the last column
            col += " , ";
        }
    }

    var createStatement = null; // The statement that will create the temporary table

    // Using ON COMMIT PRESERVE ROWS, this will preserve the rows until end
    // of the session
    if (tempTable) {
        createStatement = "CREATE GLOBAL TEMPORARY TABLE " + tableName +
                            " ( " + col + " ) ";
    } else {
        createStatement = "CREATE TABLE " + tableName +
                            " ( " + col + " ) ";
    }

    if (withPreserve) { // Should the row be preserved
        createStatement += " ON COMMIT PRESERVE ROWS ";
    }

    return new Promise ( (resolve, reject) => {
        this.databaseExecute (createStatement)  // Execute the create statement
        .then (results => resolve (results))
        .catch (err => reject (err));
    })
}

module.exports.createTempTable = createTempTable;

/*********************************************************************************
 *
 * This will execute the SELECT statement that is passed to it.
 *
 * @param selectQuery - the SELECT statement to be executed
 *
 **********************************************************************************/
var databaseSELECT = function(selectQuery) {
    if (PRINT) {    // Print the SELECT statement
        console.log (selectQuery);
    }
    return new Promise ((resolve, reject) => {
        oracledb.getConnection (connectionInfo) // Connect to the database
        .then (connection => {
            if (roleName != null && roleName !== "") {  // There is a role name
                connection.execute ("SET ROLE " + roleName) // Set the role in the database
                .then (result => {
                    connection.execute (selectQuery, [])    // Execute the SELECT statement
                    .then (result => {
                        var results = [];   // Results from the execution of the SELECT statement

                        results = result.rows.slice();  // Only return the rows from the result

                        if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                        }

                        resolve (results);  // Return the results
                    })
                    .catch (err => {
                        console.log ("SELECT Error: " + err.message);
                        if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                        }
                        reject (err);
                    })
                })
                .catch (err => {
                    console.error (err.message);
                    if (connection != null) {   // Close the connection if not already closed
                        connection.close();
                    }
                    reject (err);
                })
            } else {    // There is not a role name
                connection.execute (selectQuery, [])    // Execute the SELECT statement
                .then (result => {
                    var results = [];   // Results from the execution of the SELECT statement

                    results = result.rows.slice();  // Only return the rows from the result

                    if (connection != null) {   // Close the connection if not already closed
                        connection.close();
                    }

                    resolve (results);
                })
                .catch (err => {
                    console.log ("SELECT Error: " + err.message);
                    if (connection != null) {   // Close the connection if not already closed
                        connection.close();
                    }
                    reject (err);  // Return the results
                })
            }
        })
        .catch (err => {
            console.error (err.message);
            reject (err);
        })
    })
}

module.exports.databaseSELECT = databaseSELECT;

/***************************************************************************
 *
 * This will execute the an SQL database query and return the results.
 *
 * @param query - the query to execute
 *
 **************************************************************************/
var databaseExecute = function (query) {
    if (PRINT) {    // Print the query to the console
        console.log (query);
    }
    return new Promise ((resolve, reject) => {
        oracledb.getConnection (connectionInfo) // Connect to the database
        .then (connection => {
            if (roleName != null && roleName !== "") {
                connection.execute ("SET ROLE " + roleName)  // There is a role name
                .then (results => {
                    connection.execute (query, [])  // Execute the query
                    .then (results => {
                        if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                        }

                        resolve (results);  // Return the results
                    })
                    .catch (err => {
                        console.log ("SELECT Error: " + err.message);
                        if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                        }
                        reject (err);
                    })
                })
                .catch (err => {
                    console.error (err.message);
                    if (connection != null) {   // Close the connection if not already closed
                        connection.close();
                    }
                    reject (err);
                })
            } else {    // There is not a role name
                connection.execute (query, [])  // Execute the query
                .then (results => {
                    if (connection != null) {   // Close the connection if not already closed
                        connection.close();
                    }

                    resolve (results);  // Return the results
                })
                .catch (err => {
                    console.log ("SELECT Error: " + err.message);
                    if (connection != null) {   // Close the connection if not already closed
                        connection.close();
                    }
                    reject (err);
                })
            }
        })
        .catch (err => {
            console.error (err.message);
            reject (err);
        })
    })
}

module.exports.databaseExecute = databaseExecute;

/*******************************************************************************
 *
 * This will execute a stored procedure in the database with audit information.
 *
 * @param command - the command to execute the stored procedure
 * @param bind - the binding of the parameters passed to the stored procedure
 * @param type - used for the why if there is no why
 * @param who - the person who is doing the DELETE statement
 * @param why - the audit reason as to why the data is being deleted from the
 *              table
 *
 ******************************************************************************/
var storedProc = function(command, bind, type, who, why) {
    var uDir = new UserDir (this);  // Used to determine who is doing the delete from the database

    if (why === null || why === undefined) {    // Why does not have a value; therefore, see if a reason has already been set
        why = this.getReason();
        if (why === null || why === undefined) {    // A reason has not been set
            why = type;
        }
    }

    return new Promise ( (resolve, reject) => {
        uDir.getUserDirInfoByNetworkID (process.env.username)   // Retrieve the user who is executing the DELETE statement
        .then (results => {
            let val = this.retrieveValues (results[0]);
            let who = val[0];

            this.storedProcDatabase (command, bind, who, why)   // Execute the stored procedure
            .then (results => resolve (results) )
            .catch (err => reject (err) );
        })
        .catch (err => reject (err) );
    })
}

module.exports.storedProc = storedProc;

/*****************************************************************************
 *
 * This will execute a stored procedure in the database.
 *
 * @param command - the command to execute the stored procedure
 * @param bind - the binding of the parameters passed to the stored procedure
 * @param who - the person who is doing the DELETE statement
 * @param why - the audit reason as to why the data is being deleted from the
 *              table
 *
 ******************************************************************************/
var storedProcDatabase = function (command, bind, who, why) {
    if (PRINT) {    // Print the stored database command
        console.log (command);
    }

    return new Promise ((resolve, reject) => {
        oracledb.getConnection (connectionInfo) // Connect to the database
        .then (connection => {
                if (roleName != null && roleName !== "") {
                    connection.execute ("SET ROLE " + roleName)  // There is a role name
                    .then (result => {
                            connection.execute (command, bind)  // Execute the stored procedure
                            .then (results => {
                                if (connection != null) {   // Close the connection if not already closed
                                    connection.close();
                                }
                                resolve (results.outBinds); // Return the results
                            })
                            .catch (err => {
                                console.log ("Error: " + err.message);
                                if (connection != null) {   // Close the connection if not already closed
                                    connection.close();
                                }
                                reject (err);
                            })
                    })
                    .catch (err => {
                        console.error ("Role Error: " + err.message);
                        if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                        }
                        reject (err);
                    })
                } else {   // There is not a role name
                    connection.execute (command, bind)  // Execute the stored procedure
                    .then (results => {
                        resolve (results.outBinds); // Return the results
                        if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                        }
                    })
                    .catch (err => {
                        console.log ("Error: " + err.message);
                        if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                        }
                        reject (err);
                    })
                }
        })
        .catch (err => {
            console.error (err.message);
            reject (err);
        })
    })
}

module.exports.storedProcDatabase = storedProcDatabase;

/*********************************************************************************
 *
 * This will execute the INSERT, UPDATE, MERGE, and DELETE statements with
 * their values.  It will return a positive number if successful and zero if
 * unsuccessful.  This will also call an audit package to store the record
 * along with who did what to the record and why.
 *
 * @param query - the INSERT, UPDATE, DELETE, or MERGE statement to execute
 * @param values - the values to INSERT or UPDATE
 * @param errorMessage - the error message to display in case there is an error
 * @param auditPackage - the name of the audit packages to execute
 * @param who - the person who is doing the DELETE statement
 * @param why - the audit reason as to why the data is being deleted from the
 *              table
 *
 ******************************************************************************/
var databaseAudit = function(query, values, errorMessage, auditPackage, who, why) {
    if (PRINT) {    // Print out the SQL statement and the values to be inserted or updated
        console.log (query);

        console.log ("VALUES"); // Print the values
        for (let i = 0; i < values.length; i++) {
            console.log (values[i]);
        }
    }
    return new Promise ((resolve, reject) => {
        oracledb.getConnection (connectionInfo) // Connect to the database
        .then (connection => {
            // Execute the audit package
            var auditCommand = "BEGIN " + auditPackage + "('" + why + "', " + who + "); END;";

            connection.execute (auditCommand)
            .then (result => {
                if (roleName != null && roleName !== "") {  // There is a role name
                    connection.execute ("SET ROLE " + roleName) // Execute the role command
                    .then (result => {
                            connection.execute (query, values)  // Execute the query
                            .then (result => {
                                var results = result.rowsAffected;  // Indicate the number of rows that were affected
                                if (connection != null) {   // Close the connection if not already closed
                                    connection.close();
                                }
                                resolve (results);  // Return the results
                            })
                            .catch (err => {
                                console.log (errorMessage + " Error: " + err.message);
                                if (connection != null) {   // Close the connection if not already closed
                                    connection.close();
                                }
                                reject (err);
                            })
                    })
                    .catch (err => {
                        console.error ("Role Error: " + err.message);
                        if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                        }
                        reject (err);
                    })
                } else {   // There is not a role name
                    connection.execute (query, values)  // Execute the query
                    .then (result => {
                        var results = result.rowsAffected;  // Indicate the number of rows that were affected
                        resolve (results);  // Return the results
                        if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                        }
                    })
                    .catch (err => {
                        console.log (errorMessage + " Error: " + err.message);
                        if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                        }
                        reject (err);
                    })
                }
            })
            .catch (err => {
                console.error ("Audit Error: " + err.message);
                if (connection != null) {   // Close the connection if not already closed
                    connection.close();
                }
                reject (err);
            })
        })
        .catch (err => {
            console.error (err.message);
            reject (err);
        })
    })
}

module.exports.databaseAudit = databaseAudit;

/*********************************************************************************
 *
 * This will execute the INSERT, UPDATE, MERGE, and DELETE statements with
 * their values.  It will return a positive number if successful and zero if
 * unsuccessful.  No auditing will occur with this.
 *
 * @param query - the INSERT, UPDATE, DELETE, or MERGE statement to execute
 * @param values - the values to INSERT or UPDATE
 * @param errorMessage - the error message to display in case there is an error
 *
 ******************************************************************************/
var databaseNoAudit = function (query, values, errorMessage) {
    if (PRINT) {    // Print out the SQL statement and the values to be inserted or updated
        console.log (query);

        console.log ("VALUES"); // Print the values
        for (let i = 0; i < values.length; i++) {
            console.log (values[i]);
        }
    }
    return new Promise ((resolve, reject) => {
        oracledb.getConnection (connectionInfo) // Connect to the database
        .then (connection => {
            if (roleName != null && roleName !== "") {  // There is a role name
                connection.execute ("SET ROLE " + roleName) // Execute the role command
                .then (result => {
                        connection.execute (query, values)  // Execute the query
                        .then (result => {
                            var results = result.rowsAffected;  // Indicate the number of rows that were affected
                            if (connection != null) {   // Close the connection if not already closed
                                    connection.close();
                            }
                            resolve (results);  // Return the results
                        })
                        .catch (err => {
                            console.log (errorMessage + " Error: " + err.message);
                            if (connection != null) {   // Close the connection if not already closed
                                    connection.close();
                            }
                            reject (err);
                        })
                })
                .catch (err => {
                    console.error ("Role Error: " + err.message);
                    if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                    }
                    reject (err);
                })
            } else {   // There is not a role name
                connection.execute (query, values)  // Execute the query
                .then (result => {
                    var results = result.rowsAffected;  // Indicate the number of rows that were affected
                    resolve (results);  // Return the results
                    if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                    }
                })
                .catch (err => {
                    console.log (errorMessage + " Error: " + err.message);
                    if (connection != null) {   // Close the connection if not already closed
                            connection.close();
                    }
                    reject (err);
                })
            }
        })
        .catch (err => {
            console.error (err.message);
            reject (err);
        })
    })
}

module.exports.databaseNoAudit = databaseNoAudit;

/**********************************************************************************
 *
 * This will release the database connection.
 *
 * @param connection - the database connection to be released
 *
 **********************************************************************************/
var releaseDB = function(connection) {
    connection.release((err) => {   // Release the connection
        if (err) {
            console.error(err.message);
        }
    });
}

/***********************************************************************************
 *
 * This will remove all the null values in the object.
 *
 * @param value - the object in which the null values will be removed
 *
 * @return returns an object with all the nulls removed
 *
 ************************************************************************************/
var removeNulls = function(value) {
    var newValue = {...value};  // The object will all the null values removed

    // Spin through each field in the object and remove all the null values
    Object.keys(newValue).forEach (key => {
        if (newValue[key] == null) {    // Value is null
            delete newValue[key];       // Remove the null value
        }
    } );

    return newValue;
}

module.exports.removeNulls = removeNulls;

/****************************************************************************
 *
 * This will remove all null values from value object and any field in the
 * object value that does not match a field in the fields array.
 *
 * @param value - the object in which the null values will be removed
 * @param fields = the fields to remove from the object value
 *
 * @return returns an object with all the nulls removed
 *
 ************************************************************************************/
var removeAndNullsInFields = function(value, fields) {
    var newValue = {...value};  // The object will all the null values removed
    var i = 0;                  // Loop control variable
    var found = false;          // Indicates whether the field was found in the object or not

    if (fields === null || fields === undefined) {  // The fields array is empty, so return nothing
        return null;
    }

    // Spin through the fields in the value object and remove all fields that hava a value of null and
    // all fields that are not in the fields array
    Object.keys(newValue).forEach (key => {
        if (newValue[key] === null) {   // Value is null, so remove it
            delete newValue[key];
        }

        found = false;
        // Spin through the fields array to see if that field is in the value object
        for (i = 0; i < fields.length && found === false; i++) {
            if (key === fields[i]) {    // Field is found in the value object, so do not remove it
                found = true;
            }
        }

        if (found === false) {  // Field was not found in the fields array, so remove it
            delete newValue[key];
        }
    } );

    return newValue;
}

module.exports.removeAndNullsInFields = removeAndNullsInFields;

/***********************************************************************************************
 *
 * Retrieves all the field names in an object and places them in an array.
 *
 * @param value - the object from which the field names are extracted
 *
 * @returns returns an array that has all the field names in the value object
 *
 *************************************************************************************************/
var retrieveFields = function(value) {
    var fields = [];    // The array of fields in the object to return

    for (let field in value) {  // Spin through all the fields in the object
        if (field !== undefined) {  // Field is defined, so place it in the array
            fields.push (field);
        }
    }

    return fields;  // Return the array of fields
}

module.exports.retrieveFields = retrieveFields;

/************************************************************************************************
 *
 * Retrieves all the values in an object and places them in an array.
 *
 * @param value - the object that contains the values to be placed in an array
 *
 * @return returns an array that contains all the values in an object
 *
 ************************************************************************************************/
var retrieveValues = function(value) {
    var objectValues = [];  // The array of values in the object to return

    Object.keys(value).forEach (key => {    // Spin through each value in the object and
        objectValues.push (value[key]);     // place the value in the array
    });

    return objectValues;    // Return the array of values
}

module.exports.retrieveValues = retrieveValues;

/**************************************************************************************************
 *
 * This will convert the date from MM/DD/YYYY HH:MM:SS or MM-DD-YYYY HH:MM:SS or YYYY-MM-DD HH:MM:SS to
 * DD-MMM-YYYY HH.MM.SS, where MMM is the written three character abbreviation.
 *
 * @param date - the date in the form MM/DD/YYYY HH:MM:SS or MM-DD-YYYY HH:MM:SS
 *
 * @return returns the date in the format of DD-MMM-YYYY HH:MM:SS
 *
 **************************************************************************************************/
var convertDate3 = function(date) {
    var blankSplit = date.split(" ");   // Split the date and time apart
    var dateSplit = null;               // The date split into an array where index 0 is the month, index 1 is the day and index 2 is the year
    var newDate = null;                 // The new date and time in the form of DD-MMM-YYYY HH.MM.SS
    var time = null;                    // The time in the form of HH.MM.SS

    if (blankSplit[0].indexOf("/") !== -1) {    // The date has slashes in it
        dateSplit = blankSplit[0].split("/");   // Split the date at the slashes
        newDate = dateSplit[1] + "-" + this.convertMonth2(dateSplit[0]) + "-" + dateSplit[2];   // Reformat the date into its new format
    } else {    // The date has dashes in it
        dateSplit = blankSplit[0].split("-");   // Split the date at the dashes
        if (dateSplit[0].length === 4) {    // Year is first, so format is YYYY-MM-DD
            newDate = dateSplit[2] + "-" + this.convertMonth2(dateSplit[1]) + "-" + dateSplit[0];   // Reformat the date into its new format
        } else {    // Year is not first, so format is MM-DD-YYYY
            newDate = dateSplit[1] + "-" + this.convertMonth2(dateSplit[0]) + "-" + dateSplit[2];   // Reformat the date into its new format
        }
    }

    if (blankSplit.length === 2) {  // There is a time with the date
        if (blankSplit[1].indexOf(".") !== -1) {    // There are colons between the hours, minutes, and seconds
            time = blankSplit[1];                   // Replace the : with . for the time, time is in the correct format
            while (time.indexOf(".") !== -1) {
                time = time.replace (".", ":");
            }
            newDate += " " + time;  // Combine the date and time into the DD-MMM-YYYY HH:MM:SS format
        } else {    // There are dots between the hours, minutes, and seconds
            newDate += " " + blankSplit[1]; // Combine the date and time into the DD-MMM-YYYY HH:MM:SS format
        }
    }

    return newDate; // Return the date and time into the DD-MMM-YYYY HH:MM:SS format
}

module.exports.convertDate3 = convertDate3;

/******************************************************************************************************
 *
 * This will convert the month from a one or two digit number into its three character abbreviation.
 *
 * @param month - the one or two digit month
 *
 * @return returns the month as a three character abbreviation
 *
 ******************************************************************************************************/
var convertMonth2 = function(month) {
    switch (month) {    // Convert the month to a three character abbreviation
        case "01": return "JAN";
        case "1": return "JAN";
        case "02": return "FEB";
        case "2": return "FEB";
        case "03": return "MAR";
        case "3": return "MAR";
        case "04": return "APR";
        case "4": return "APR";
        case "05": return "MAY";
        case "5": return "MAY";
        case "06": return "JUN";
        case "6": return "JUN";
        case "07": return "JUL";
        case "7": return "JUL";
        case "08": return "AUG";
        case "8": return "AUG";
        case "09": return "SEP";
        case "9": return "SEP";
        case "10": return "OCT";
        case "11": return "NOV";
        case "12": return "DEC";
        default: return "UNK";
    }
}

module.exports.convertMonth2 = convertMonth2;
