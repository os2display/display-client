const statusCodes = {
  INIT: 'INIT',
  LOGIN: 'LOGIN',
  ERROR: 'ERROR',
  RUNNING: 'RUNNING',
}

const errorCodes = {
  ERROR_TOKEN_REFRESH_FAILED: 'ER101',        // Api returns 401. Token could not be refreshed.
  ERROR_TOKEN_REFRESH_LOOP_FAILED: 'ER102',   // Token could not be refreshed in normal refresh token loop.
  ERROR_TOKEN_EXP_IAT_NOT_SET: 'ER103',       // Token refresh aborted, refresh token, iat and/or exp not set.
  ERROR_RELEASE_FILE_NOT_LOADED: 'ER104',     // Release file could not be loaded.
}

export {statusCodes, errorCodes};
