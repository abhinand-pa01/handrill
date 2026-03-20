const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

function getToken() {
  return localStorage.getItem('handrill_token');
}

async function tryRefresh() {
  const refreshToken = localStorage.getItem('handrill_refresh');
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('handrill_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('handrill_refresh', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

/**
 * Core fetch wrapper.
 * skipAuthRefresh=true for login/register so a 401 just throws directly
 * (instead of being swallowed by the refresh-token flow).
 */
async function request(path, options = {}, skipAuthRefresh = false) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && !skipAuthRefresh && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 401 on a protected route → try refresh, then give up
  if (response.status === 401 && !skipAuthRefresh) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newHeaders = { ...headers, Authorization: `Bearer ${getToken()}` };
      const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers: newHeaders });
      if (!retry.ok) throw new Error('Unauthorized');
      return retry.json();
    }
    localStorage.removeItem('handrill_token');
    localStorage.removeItem('handrill_refresh');
    localStorage.removeItem('handrill_user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

// Auth endpoints skip the refresh-token interceptor so a wrong password
// throws directly and lets AuthContext fall through to the demo fallback.
export const AuthAPI = {
  login:    (email, password) => request('/auth/login',    { method: 'POST', body: JSON.stringify({ email, password }) }, true),
  register: (data)            => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }, true),
  logout:   ()                => request('/auth/logout',   { method: 'POST' }),
  me:       ()                => request('/auth/me'),
};

export const ServicesAPI = {
  list:    ()         => request('/services'),
  get:     (id)       => request(`/services/${id}`),
  preview: (id)       => request(`/services/${id}/assignment-preview`),
};

export const BookingsAPI = {
  create:       (data)         => request('/bookings',            { method: 'POST',  body: JSON.stringify(data) }),
  my:           ()             => request('/bookings/my'),
  get:          (id)           => request(`/bookings/${id}`),
  updateStatus: (id, status)   => request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  cancel:       (id)           => request(`/bookings/${id}/cancel`,  { method: 'PATCH' }),
  assign:       (id, workerId) => request(`/bookings/${id}/assign`,  { method: 'PATCH', body: JSON.stringify({ workerId }) }),
  all:          (params = {})  => request(`/bookings?${new URLSearchParams(params)}`),
};

export const WorkersAPI = {
  me:              ()     => request('/workers/me'),
  toggleAvailability: () => request('/workers/me/availability', { method: 'PATCH' }),
  updateProfile:   (data) => request('/workers/me/profile',     { method: 'PATCH', body: JSON.stringify(data) }),
  reviews:         ()     => request('/workers/me/reviews'),
  adminCreate:     (data) => request('/workers/admin/create',   { method: 'POST',  body: JSON.stringify(data) }),
  list:            ()     => request('/workers'),
  get:             (id)   => request(`/workers/${id}`),
};

export const ReviewsAPI = {
  create:     (data) => request('/reviews',             { method: 'POST', body: JSON.stringify(data) }),
  forBooking: (id)   => request(`/reviews/booking/${id}`),
};

export const AdminAPI = {
  dashboard: () => request('/admin/dashboard'),
  monthly:   () => request('/admin/analytics/monthly'),
  leaderboard: () => request('/admin/analytics/leaderboard'),
  customers: () => request('/admin/customers'),
};

export const UserAPI = {
  changePassword: (data) => request('/users/me/password', { method: 'PATCH', body: JSON.stringify(data) }),
};
