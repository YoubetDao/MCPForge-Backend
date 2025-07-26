/**
 * 统一的 API 客户端，确保所有请求都包含 credentials
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8443";

interface ApiRequestOptions extends RequestInit {
  // 扩展 RequestInit 以支持更多选项
}

/**
 * 统一的 fetch 包装器，自动包含 credentials
 */
export async function apiRequest(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    credentials: 'include', // 总是包含 cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
}

/**
 * GET 请求
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  const response = await apiRequest(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * POST 请求
 */
export async function apiPost<T = any>(
  endpoint: string, 
  data?: any
): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * PUT 请求
 */
export async function apiPut<T = any>(
  endpoint: string, 
  data?: any
): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * DELETE 请求
 */
export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  const response = await apiRequest(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * 检查认证状态
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const response = await apiRequest('/auth/me', { method: 'GET' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser() {
  return apiGet('/auth/me');
}

/**
 * 获取 Bearer Token
 */
export async function getBearerToken() {
  return apiGet('/auth/bearer-token');
}

/**
 * 登出
 */
export async function logout() {
  return apiPost('/user/auth/logout');
}
