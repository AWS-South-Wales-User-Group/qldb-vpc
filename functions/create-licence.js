/*
 * Lambda function that implements the create licence functionality
 */
const Log = require('@dazn/lambda-powertools-logger');
const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const { QldbDriver } = require('amazon-qldb-driver-nodejs');
const qldbDriver = new QldbDriver('qldb-private-dev');


const handler = async (event) => {

  const {
    firstName, lastName
  } = JSON.parse(event.body);

  try {
    console.log('About to call out to create licence');
    const response = await createLicence(firstName, lastName);
    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.log('Caught an error in the handler');
    const errorBody = {
      status: 500,
      title: error.name,
      detail: error.message,
    };
    return {
      statusCode: 500,
      body: JSON.stringify(errorBody),
    };
  }
};

const createLicence = async (firstName, lastName) => {
  console.log(`In createLicence function with ${firstName} and ${lastName}`);

  let response;
  // Get a QLDB Driver instance
  await qldbDriver.executeLambda(async (txn) => {
    console.log('About to call the createRecord function');
    const licenceDoc = { firstName, lastName };
    // Create the record. This returns the unique document ID in an array as the result set
    const result = await createRecord(txn, licenceDoc);
    const docIdArray = result.getResultList();
    const docId = docIdArray[0].get('documentId').stringValue();
    response = {
      docId
    }
  });
  return response;
};

async function createRecord(txn, licenceDoc) {
  console.log('Inside createRecord function');
  const statement = `INSERT INTO Test ?`;
  return txn.execute(statement, licenceDoc);
}


module.exports.handler = middy(handler).use(cors())