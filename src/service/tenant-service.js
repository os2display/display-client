import ConfigLoader from "../util/config-loader.js";
import appStorage from "../util/app-storage.js";

class TenantService {
  loadTenantConfig = () => {
    ConfigLoader.loadConfig().then((config) => {
      const token = appStorage.getToken();
      const tenantKey = appStorage.getTenantKey();
      const tenantId = appStorage.getTenantId();

      if (token && tenantKey && tenantId) {
        // Get fallback image.
        fetch(`${config.apiEndpoint}/v2/tenants/${tenantId}`, {
          headers: {
            authorization: `Bearer ${token}`,
            "Authorization-Tenant-Key": tenantKey,
          },
        })
          .then((response) => response.json())
          .then((tenantData) => {
            if (tenantData?.fallbackImageUrl) {
              appStorage.setFallbackImageUrl(tenantData.fallbackImageUrl);
            }
          });
      }
    });
  }
}

const tenantService = new TenantService();

export default tenantService;
