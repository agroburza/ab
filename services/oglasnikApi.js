const API_BASE = 'https://ab.hr/wp-json/abapp/v1';

async function parseJson(response) {
  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Došlo je do greške.');
  }

  return json;
}

export async function fetchOglasi({
  page = 1,
  search = '',
  zupanija = '',
  orderby = '',
  category_id = '',
  subcategory_id = '',
} = {}) {
  const params = new URLSearchParams();
  params.append('page', String(page));

  if (search) params.append('search', search);
  if (zupanija) params.append('zupanija', zupanija);
  if (orderby) params.append('orderby', orderby);
  if (category_id) params.append('category_id', String(category_id));
  if (subcategory_id) params.append('subcategory_id', String(subcategory_id));

  const response = await fetch(`${API_BASE}/oglasi?${params.toString()}`);
  return parseJson(response);
}

export async function fetchOglasDetail(id) {
  const response = await fetch(`${API_BASE}/oglasi/${id}`);
  const json = await parseJson(response);
  return json.item;
}

export async function fetchSimilarOglasi(id) {
  const response = await fetch(`${API_BASE}/oglasi/${id}/similar`);
  const json = await parseJson(response);
  return json.items || [];
}

export async function fetchAdCategories() {
  const response = await fetch(`${API_BASE}/ads/categories`);
  const json = await parseJson(response);
  return json.items || [];
}

export async function toggleFavoriteAd(postId, token = '') {
  const response = await fetch(`${API_BASE}/favorites/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ post_id: postId }),
  });

  return parseJson(response);
}

export async function fetchFavoriteAds(token = '') {
  const response = await fetch(`${API_BASE}/favorites`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await parseJson(response);
  return json.items || [];
}

export async function toggleFavoriteCategory(termId, token = '') {
  const response = await fetch(`${API_BASE}/favorite-categories/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ term_id: termId }),
  });

  return parseJson(response);
}

export async function fetchUserProfile(userId) {
  const response = await fetch(`${API_BASE}/user/${userId}`);
  const json = await parseJson(response);
  return json.user;
}

export async function fetchFavoriteCategories(token = '') {
  const response = await fetch(`${API_BASE}/favorite-categories`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await parseJson(response);
  return json.items || [];
}

export async function fetchOglasiByAuthor(authorId) {
  const response = await fetch(`${API_BASE}/oglasi-by-author/${authorId}`);
  const json = await parseJson(response);
  return json.items || [];
}

