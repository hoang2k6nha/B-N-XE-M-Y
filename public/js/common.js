const API_URL = 'http://localhost:3000/api';

// ===== API Helpers =====
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {})
  };

  try {
    // Đảm bảo endpoint bắt đầu bằng /
    if (!endpoint.startsWith('/')) endpoint = '/' + endpoint;
    // Bỏ /api nếu đã có để tránh lặp lại (vì API_URL đã có /api)
    if (endpoint.startsWith('/api')) endpoint = endpoint.replace('/api', '');
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi kết nối API');
    return data;
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

// ===== Auth & User State =====
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function updateNavUser() {
  const user = getUser();
  const userArea = document.getElementById('nav-user-area');
  if (!userArea) return;

  if (user) {
    const tierIcon = user.tier === 'Diamond' ? '💎' : user.tier === 'Gold' ? '🥇' : user.tier === 'Silver' ? '🥈' : '👤';
    const adminLink = user.role === 'admin' ? `<a href="/admin.html" style="color:#ffcc00; font-weight:bold;">Tất cả quyền Admin</a>` : '';
    
    userArea.innerHTML = `
      <div class="nav-user">
        <div class="nav-user-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div class="user-dropdown">
          <div style="padding:10px 16px;border-bottom:1px solid var(--border);margin-bottom:8px">
            <div style="font-weight:700;font-size:14px">${user.name}</div>
            <div style="font-size:12px;color:var(--muted)">${tierIcon} ${user.tier || 'New'} ${user.role === 'admin' ? '(Admin)' : ''}</div>
          </div>
          ${adminLink}
          <a href="/profile.html">Hồ sơ cá nhân</a>
          <a href="/orders.html">Lịch sử đơn hàng</a>
          <a href="/installment.html">Quản lý trả góp</a>
          <a href="#" onclick="logout(event)" style="color:var(--accent);border-top:1px solid var(--border);margin-top:8px">Đăng xuất</a>
        </div>
      </div>
    `;
  } else {
    userArea.innerHTML = `<a href="/login.html" class="btn-nav-login">Đăng Nhập</a>`;
  }
}

function logout(e) {
  if (e) e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Đã đăng xuất thành công', 'success');
  setTimeout(() => window.location.href = '/', 1000);
}

// ===== Cart State =====
function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, quantity = 1, color = null, isPreorder = false) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product._id && item.color === color && item.is_preorder === isPreorder);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product._id,
      name: product.name,
      price: product.price,
      image: color?.image_url || product.image_url,
      color: color?.color_name || 'Mặc định',
      quantity,
      is_preorder: isPreorder,
      deposit_amount: isPreorder ? (product.price * 0.2) : 0
    });
  }
  
  saveCart(cart);
  showToast(isPreorder ? '📝 Đã thêm vào giỏ hàng (Đặt cọc)' : '🛒 Đã thêm vào giỏ hàng', 'success');
}

function updateCartBadge() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// ===== UI Helpers =====
function formatPrice(price) {
  if (!price) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  const icon = type === 'success' ? '✅' : '❌';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

function productCard(p) {
  const price = formatPrice(p.price);
  const isPKL = p.price > 400000000;
  const isNew = p.category_id && p.category_id.name && p.category_id.name.includes('Tay Ga');
  
  // Logic kiểm tra tồn kho & đặt cọc
  const isOutOfStock = p.stock === 0 || p.stock === '0';
  
  let badge = isPKL ? `<div class="p-badge premium">⭐ Premium PKL</div>` 
            : isNew ? `<div class="p-badge new">✨ Phổ Biến</div>` : '';
            
  if (isOutOfStock) {
    badge = `<div class="p-badge" style="background:#ff9900;color:#fff">⏳ Đặt Trước</div>`;
  }

  const actionBtn = isOutOfStock 
    ? `<button class="btn-primary btn-sm" style="background:transparent;border-color:var(--accent);color:var(--accent)" onclick="event.preventDefault(); addToCart({_id: '${p._id}', name: '${p.name}', price: ${p.price}, image_url: '${p.image_url}'}, 1, null, true)">Cọc 20%</button>`
    : `<button class="btn-primary btn-sm" onclick="event.preventDefault(); addToCart({_id: '${p._id}', name: '${p.name}', price: ${p.price}, image_url: '${p.image_url}'})">Thêm 🛒</button>`;

  return `
    <a href="/product-detail.html?id=${p._id}" class="product-card">
      ${badge}
      <div class="p-img-wrap">
        <img src="${p.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'}" alt="${p.name}" loading="lazy">
      </div>
      <div class="p-info">
        <div class="p-brand">${p.brand || 'MotoZone'}</div>
        <div class="p-name">${p.name}</div>
        <div class="p-specs">
          ${p.engine ? `<span class="p-spec">⚙️ ${p.engine}</span>` : ''}
          ${p.fuel_consumption ? `<span class="p-spec">⛽ ${p.fuel_consumption}</span>` : ''}
        </div>
        <div class="p-price-row">
          <div class="p-price">${price}</div>
          ${actionBtn}
        </div>
      </div>
    </a>
  `;
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  updateNavUser();
  updateCartBadge();
  
  const hamburger = document.getElementById('hamburger');
  if(hamburger) {
    hamburger.addEventListener('click', () => {
      document.body.classList.toggle('mobile-menu-active');
    });
  }
  
  // Nạp Socket.io Client và kết nối
  const user = getUser();
  if (user) {
    const script = document.createElement('script');
    script.src = 'http://localhost:3000/socket.io/socket.io.js';
    script.onload = () => {
      const socket = io('http://localhost:3000');
      socket.emit('register', user._id);
      
      socket.on('notification', (data) => {
        showToast(`🔔 ${data.title}: ${data.message}`, data.type || 'success');
      });
    };
    document.head.appendChild(script);
  }
});
