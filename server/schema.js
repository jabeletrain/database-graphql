const graphql = require('graphql');
const database = require('./Database');
const userdir = require('./UserDir');
const fs = require('fs');

let databaseInfo = {
    user: null,
    password: null,
    connection: null
};

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        ID: { type: GraphQLInt },
        NAME: { type: GraphQLString },
        ADDRESS: { type: GraphQLString },
        CITY: { type: GraphQLString },
        ZIP_CODE: { type: GraphQLInt },
        AGE: { type: GraphQLInt },
        COMPANY_ID: {type: GraphQLInt },
    })
});

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        ID: { type: GraphQLInt },
        NAME: { type: GraphQLString },
        ADDRESS: { type: GraphQLString },
        CITY: { type: GraphQLString },
        ZIP_CODE: { type: GraphQLInt },
        DESCRIPTION: { type: GraphQLString },
    })
});

const UserCompanyType = new GraphQLObjectType({
    name: 'UserCompany',
    fields: () => ({
        ID: { type: GraphQLInt },
        NAME: { type: GraphQLString },
        ADDRESS: { type: GraphQLString },
        CITY: { type: GraphQLString },
        ZIP_CODE: { type: GraphQLInt },
        AGE: { type: GraphQLInt },
        COMPANY_ID: {type: GraphQLInt },
        COMPANY_NAME: { type: GraphQLString },
        COMPANY_ADDRESS: { type: GraphQLString },
        COMPANY_CITY: { type: GraphQLString },
        COMPANY_ZIP_CODE: { type: GraphQLInt },
        COMPANY_DESCRIPTION: { type: GraphQLString },
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { ID: { type: GraphQLInt }},
            resolve(parentValue, args) {
                if (databaseInfo.user === null) {
                    readIni();
                }

                let statement = `SELECT ID, NAME, ADDRESS, CITY, ZIP_CODE, AGE, COMPANY_ID FROM USER_TAB WHERE ID = ${args.ID}`;
                database.setConnectionInfo(databaseInfo.user, databaseInfo.password, databaseInfo.connection);
                database.setReturn('OBJECT');
                return database.databaseSELECT(statement)
                .then (results => results[0])
                .catch(err => console.log ('The following error occurred', err));
            }
        },
        company: {
            type: CompanyType,
            args: { ID: { type: GraphQLInt }},
            resolve(parentValue, args) {
                if (databaseInfo.user === null) {
                    readIni();
                }

                let statement = `SELECT ID, NAME, ADDRESS, CITY, ZIP_CODE, DESCRIPTION FROM COMPANY WHERE ID = ${args.ID}`;
                database.setConnectionInfo(databaseInfo.user, databaseInfo.password, databaseInfo.connection);
                database.setReturn('OBJECT');
                return database.databaseSELECT(statement)
                .then (results => results[0])
                .catch(err => console.log ('The following error occurred', err));
            }
        },
        usercompany: {
            type: UserCompanyType,
            args: { ID: { type: GraphQLInt }},
            resolve(parentValue, args) {
                if (databaseInfo.user === null) {
                    readIni();
                }

                let statement = `SELECT USER_TAB.ID, 
                                        USER_TAB.NAME, 
                                        USER_TAB.ADDRESS, 
                                        USER_TAB.CITY, 
                                        USER_TAB.ZIP_CODE, 
                                        USER_TAB.COMPANY_ID, 
                                        COMPANY.NAME AS COMPANY_NAME,
                                        COMPANY.ADDRESS AS COMPANY_ADDRESS,
                                        COMPANY.CITY AS COMPANY_CITY,
                                        COMPANY.ZIP_CODE AS COMPANY_ZIP_CODE,
                                        COMPANY.DESCRIPTION AS COMPANY_DESCRIPTION
                                 FROM USER_TAB, COMPANY WHERE COMPANY_ID = COMPANY.ID AND USER_TAB.ID = ${args.ID}`;
                database.setConnectionInfo(databaseInfo.user, databaseInfo.password, databaseInfo.connection);
                database.setReturn('OBJECT');
                return database.databaseSELECT(statement)
                .then (results => results[0])
                .catch(err => console.log ('The following error occurred', err));
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                ID: { type: new GraphQLNonNull(GraphQLInt) },
                NAME: { type: new GraphQLNonNull(GraphQLString) },
                ADDRESS: { type: new GraphQLNonNull(GraphQLString) },
                CITY: { type: new GraphQLNonNull(GraphQLString) },
                ZIP_CODE: { type: new GraphQLNonNull(GraphQLInt) },
                AGE: { type: new GraphQLNonNull(GraphQLInt) },
                COMPANY_ID: { type: GraphQLInt }
            },
            resolve(parentValue, { ID, NAME, ADDRESS, CITY, ZIP_CODE, AGE, COMPANY_ID }) {
                if (databaseInfo.user === null) {
                    readIni();
                }

                let statement = `INSERT INTO USER_TAB (ID, NAME, ADDRESS, CITY, ZIP_CODE, AGE, COMPANY_ID) VALUES (${ID}, '${NAME}', '${ADDRESS}', '${CITY}', ${ZIP_CODE}, ${AGE}, ${COMPANY_ID})`;
                database.setConnectionInfo(databaseInfo.user, databaseInfo.password, databaseInfo.connection);
                database.setReturn('OBJECT');
                return database.databaseExecute(statement)
                .then (results => results[0])
                .catch(err => console.log ('The following error occurred', err));
            }
        },
        deleteUser: {
            type: UserType,
            args: { ID: { type: new GraphQLNonNull(GraphQLInt) }},
            resolve (parentValue, args) {
                if (databaseInfo.user === null) {
                    readIni();
                }

                let statement = `DELETE FROM USER_TAB WHERE ID = ${args.ID}`;
                database.setConnectionInfo(databaseInfo.user, databaseInfo.password, databaseInfo.connection);
                database.setReturn('OBJECT');
                return database.databaseExecute(statement)
                .then (results => results[0])
                .catch(err => console.log ('The following error occurred', err));
            }
        },
        editUser: {
            type: UserType,
            args: {
                ID: { type: new GraphQLNonNull(GraphQLInt) },
                NAME: { type: GraphQLString },
                ADDRESS: { type: GraphQLString },
                CITY: { type: GraphQLString },
                ZIP_CODE: { type: GraphQLInt },
                AGE: { type: GraphQLInt },
                COMPANY_ID: {type: GraphQLInt },
            },
            resolve(parentValue, args) {
                if (databaseInfo.user === null) {
                    readIni();
                }

                let statement = "UPDATE USER_TAB SET ";

                for (const key in args) {
                    if (args[key] !== null && key !== 'ID') {
                        if (typeof args[key] === 'string') {
                            statement += `${key} = '${args[key]}', `
                        } else {
                            statement += `${key} = ${args[key]}, `
                        }
                    }
                }

                statement = statement.substr(0, statement.length - 2);
                statement += ` WHERE ID = ${args.ID}`;

                database.setConnectionInfo(databaseInfo.user, databaseInfo.password, databaseInfo.connection);
                database.setReturn('OBJECT');
                return database.databaseExecute(statement)
                .then (results => results[0])
                .catch(err => console.log ('The following error occurred', err));
            }
        },
        addCompany: {
            type: CompanyType,
            args: {
                ID: { type: new GraphQLNonNull(GraphQLInt) },
                NAME: { type: new GraphQLNonNull(GraphQLString) },
                ADDRESS: { type: new GraphQLNonNull(GraphQLString) },
                CITY: { type: new GraphQLNonNull(GraphQLString) },
                ZIP_CODE: { type: new GraphQLNonNull(GraphQLInt) },
                DESCRIPTION: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { ID, NAME, ADDRESS, CITY, ZIP_CODE, DESCRIPTION }) {
                if (databaseInfo.user === null) {
                    readIni();
                }

                let statement = `INSERT INTO COMPANY (ID, NAME, ADDRESS, CITY, ZIP_CODE, DESCRIPTION) VALUES (${ID}, '${NAME}', '${ADDRESS}', '${CITY}', ${ZIP_CODE}, '${DESCRIPTION}')`;
                database.setConnectionInfo(databaseInfo.user, databaseInfo.password, databaseInfo.connection);
                database.setReturn('OBJECT');
                return database.databaseExecute(statement)
                .then (results => results[0])
                .catch(err => console.log ('The following error occurred', err));
            }
        },
        deleteCompany: {
            type: CompanyType,
            args: { ID: { type: new GraphQLNonNull(GraphQLInt) }},
            resolve (parentValue, args) {
                if (databaseInfo.user === null) {
                    readIni();
                }

                let statement = `DELETE FROM COMPANY WHERE ID = ${args.ID}`;
                database.setConnectionInfo(databaseInfo.user, databaseInfo.password, databaseInfo.connection);
                database.setReturn('OBJECT');
                return database.databaseExecute(statement)
                .then (results => results[0])
                .catch(err => console.log ('The following error occurred', err));
            }
        },
        editCompany: {
            type: CompanyType,
            args: {
                ID: { type: new GraphQLNonNull(GraphQLInt) },
                NAME: { type: GraphQLString },
                ADDRESS: { type: GraphQLString },
                CITY: { type: GraphQLString },
                ZIP_CODE: { type: GraphQLInt },
                DESCRIPTION: { type: GraphQLString },
            },
            resolve(parentValue, args) {
                if (databaseInfo.user === null) {
                    readIni();
                }

                let statement = "UPDATE COMPANY SET ";

                for (const key in args) {
                    if (args[key] !== null && key !== 'ID') {
                        if (typeof args[key] === 'string') {
                            statement += `${key} = '${args[key]}', `
                        } else {
                            statement += `${key} = ${args[key]}, `
                        }
                    }
                }

                statement = statement.substr(0, statement.length - 2);
                statement += ` WHERE ID = ${args.ID}`;

                database.setConnectionInfo(databaseInfo.user, databaseInfo.password, databaseInfo.connection);
                database.setReturn('OBJECT');
                return database.databaseExecute(statement)
                .then (results => results[0])
                .catch(err => console.log ('The following error occurred', err));
            }
        }
    }
})


module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: mutation
});

/*******************************************************************************
 *
 * This will read the INI file for a server and will read in the user, password,
 * connection string (host and port), role, and audit package.
 *
 *******************************************************************************/
var readIni = function () {
    let argLen = process.argv.length;   // The number of command line arguments
    let file = "./data/server.ini";    // The name of the INI file, if one is not supplied through the command line arguments
  
    // Spin through the command line arguments until the --ini command line argument is found
    for (let i = 0; i < argLen; i++) {
      // Find the command line argument --ini and make sure there is one more command line
      // argument, which will be the file name
      if (process.argv[i] === '--ini' && (i + 1) < argLen) {
        file = process.argv[i + 1];
        break;
      }
    }
  
    // Read the INI file
    var contents = fs.readFileSync (file).toString();
  
    // Seperate each line into a key value pair
    var keyValue = contents.split('\n');
  
    // Spin through each key value pair and seperate the key from the value
    for (let i = 0; i < keyValue.length; i++) {
        var seperate = keyValue[i].split('=');  // Seperate the key value pairs
  
        // Place each value in a variable based on the key
        if (seperate[0] === "User") {
            databaseInfo.user = seperate[1].replace('\r', '');
        } else if (seperate[0] === "Password") {
            databaseInfo.password = seperate[1].replace('\r', '');
        } else if (seperate[0] === "Host") {
            databaseInfo.connection = seperate[1].replace('\r', '');
        }
    }
  }
  
  
