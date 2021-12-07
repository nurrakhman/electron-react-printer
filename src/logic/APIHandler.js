import axios from 'axios';
import moment from 'moment';
const BASE_URL = 'https://dev.roemahku.id/';

/**
 * Translate error code to message
 * @param error: error code (ex: 404)
 */
 const handleError = (error) => {
    let errorResponse = null;
    if (error.code === 'ECONNABORTED') {
      errorResponse = {
        status: 408,
        error: [{ msg: error.message }],
        message: 'Request Time Out',
      };
    } else if (error.response) {
      errorResponse = error.response.data;
    } else {
      errorResponse = {
        status: 501,
        error: [{ msg: 'Server Implementation Error' }],
      };
    }
    return errorResponse;
};

/**
 * Handle user login
 * @param data: data required to login
 */
 export const hitLogin = async (email, password) => {
    var errorResponse = null;
    var tokenData;
    var status;
    let object = [];

    object = {
      'email': email,
      'password': password,
    };

    await axios({
      method: 'post',
      url: 'api/v1/auth/login',
      baseURL: BASE_URL,
      data: object,
      timeout: 30000,
      timeoutErrorMessage: 'Request telah melebihi 30s. Silahkan coba lagi.'
    })
      .then(function(response) {
        tokenData = response.data;
        status = response.status;
      })
      .catch(function(error) {
        errorResponse = handleError(error);
        status = error;
      });
    return [tokenData, errorResponse, status];
};

/**
 * Get specific branch store
 * @param id: branch store's ID
 * @param token: user's token
 */
 export const getBranch = async (id, token) => {
  var errorResponse = null;
  var tokenData;
  await axios({
    method: "get",
    url: "api/v1/branch-store/" + id,
    baseURL: BASE_URL,
    headers: {
        "Authorization": "Bearer " + token,
    },
    timeout: 30000,
    timeoutErrorMessage: "Request telah melebihi 30s. Silahkan coba lagi."
  })
    .then(function(response) {
      tokenData = response.data;
    })
    .catch(function(error) {
      errorResponse = handleError(error);
    });
  return [tokenData, errorResponse];
};

// ------------------------------------------------------------------------------------------

/**
 * Get all data for Sales page
 */
 export const getSalesData = async (token) => {
  var errorResponse = null;
  var tokenData;
  await axios({
      method: 'get',
      url: 'api/v1/fetch/mobile-apps',
      baseURL: BASE_URL,
      headers: {
          'Authorization': 'Bearer ' + token,
      },
      timeout: 30000,
      timeoutErrorMessage: 'Request telah melebihi 30s. Silakan coba lagi.',
  })
  .then(function(response) {
      tokenData = response.data;
  })
  .catch(function(error) {
      errorResponse = handleError(error);
  });
  return [tokenData, errorResponse];
};

// ------------------------------------------------------------------------------------------

/**
 * Create new transaction with category="sell"
 * @param data: data required to create new transaction
 */
 export const postTransaction = async (data, token) => {
  var errorResponse = null;
  var tokenData;
  var status;
  let object = data;

  object.category = 'sell';
  object.date = moment().format('YYYY-MM-DD');

  await axios({
    method: 'post',
    url: 'api/v1/transactions',
    baseURL: BASE_URL,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    data: object,
    timeout: 30000,
    timeoutErrorMessage: 'Request telah melebihi 30s. Silahkan coba lagi.',
  })
    .then(function(response) {
      tokenData = response.data;
      status = response.status;
    })
    .catch(function(error) {
      errorResponse = handleError(error);
      status = error;
    });
  return [tokenData, errorResponse, status];
};
