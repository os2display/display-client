import jwtDecode from 'jwt-decode';
import localStorageKeys from './local-storage-keys';

class AppStorage {
  clearAppStorage = () => {
    this.clearToken();
    this.clearRefreshToken();
    this.clearScreenId();
    this.clearTenant();
    this.clearFallbackImageUrl();
  };

  // Token.

  clearToken = () => {
    localStorage.removeItem(localStorageKeys.API_TOKEN);
    localStorage.removeItem(localStorageKeys.API_TOKEN_EXPIRE);
    localStorage.removeItem(localStorageKeys.API_TOKEN_ISSUED_AT);
  };

  getTokenIssueAt = () => {
    const iat = localStorage.getItem(localStorageKeys.API_TOKEN_ISSUED_AT);
    return iat !== null ? parseInt(iat, 10) : null;
  };

  getTokenExpire = () => {
    const expire = localStorage.getItem(localStorageKeys.API_TOKEN_EXPIRE);
    return expire !== null ? parseInt(expire, 10) : null;
  };

  getToken = () => {
    return localStorage.getItem(localStorageKeys.API_TOKEN);
  };

  setToken = (token) => {
    const decodedToken = jwtDecode(token);

    localStorage.setItem(localStorageKeys.API_TOKEN, token);
    localStorage.setItem(localStorageKeys.API_TOKEN_EXPIRE, decodedToken.exp);
    localStorage.setItem(
      localStorageKeys.API_TOKEN_ISSUED_AT,
      decodedToken.iat
    );
  };

  // Refresh token.

  getRefreshToken = () => {
    return localStorage.getItem(localStorageKeys.REFRESH_TOKEN);
  };

  setRefreshToken = (refreshToken) => {
    localStorage.setItem(localStorageKeys.REFRESH_TOKEN, refreshToken);
  };

  clearRefreshToken = () => {
    localStorage.removeItem(localStorageKeys.REFRESH_TOKEN);
  };

  // Screen id.

  getScreenId = () => {
    return localStorage.getItem(localStorageKeys.SCREEN_ID);
  };

  setScreenId = (screenId) => {
    localStorage.setItem(localStorageKeys.SCREEN_ID, screenId);
  };

  clearScreenId = () => {
    localStorage.removeItem(localStorageKeys.SCREEN_ID);
  };

  // Tenant.

  getTenantKey = () => {
    return localStorage.getItem(localStorageKeys.TENANT_KEY);
  };

  getTenantId = () => {
    return localStorage.getItem(localStorageKeys.TENANT_ID);
  };

  setTenant = (tenantKey, tenantId) => {
    localStorage.setItem(localStorageKeys.TENANT_KEY, tenantKey);
    localStorage.setItem(localStorageKeys.TENANT_ID, tenantId);
  };

  clearTenant = () => {
    localStorage.removeItem(localStorageKeys.TENANT_KEY);
    localStorage.removeItem(localStorageKeys.TENANT_ID);
  };

  // Fallback image url.

  getFallbackImageUrl = () => {
    return localStorage.getItem(localStorageKeys.FALLBACK_IMAGE);
  };

  setFallbackImageUrl = (fallbackImageUrl) => {
    return localStorage.setItem(
      localStorageKeys.FALLBACK_IMAGE,
      fallbackImageUrl
    );
  };

  clearFallbackImageUrl = () => {
    localStorage.removeItem(localStorageKeys.FALLBACK_IMAGE);
  };

  // Api URL

  setApiUrl = (apiUrl) => {
    localStorage.setItem(localStorageKeys.API_URL, apiUrl);
  };

  // pBoot - previous boot timestamp

  getPreviousBoot = () => {
    const pBoot = localStorage.getItem(localStorageKeys.PREVIOUS_BOOT);
    return pBoot !== null ? pBoot : 0;
  };

  setPreviousBoot = (pBoot) => {
    localStorage.setItem(localStorageKeys.PREVIOUS_BOOT, pBoot);
  };
}

const appStorage = new AppStorage();

export default appStorage;
