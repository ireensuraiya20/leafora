(function () {
  'use strict';
  var api = window.LEAFORA;
  var loginPanel = document.getElementById('login-panel');
  var ordersPanel = document.getElementById('orders-panel');
  var loginForm = document.getElementById('login-form');
  var loginStatus = document.getElementById('login-status');
  var setupNote = document.getElementById('setup-note');
  var notice = document.getElementById('orders-notice');
  var orderList = document.getElementById('order-list');
  var statuses = ['pending','confirmed','preparing','ready','completed','cancelled'];
  var statusLabels = {pending:'Pending',confirmed:'Confirmed',preparing:'Preparing',ready:'Ready for pickup / delivery',completed:'Completed',cancelled:'Cancelled'};

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]);
    });
  }
  function money(value) {
    return '৳' + Number(value || 0).toLocaleString('en-US');
  }
  function showLogin(message, isError) {
    loginPanel.hidden = false;
    ordersPanel.hidden = true;
    if (message) {
      loginStatus.textContent = message;
      loginStatus.classList.toggle('error', !!isError);
    }
  }
  async function openOrders() {
    loginStatus.textContent = 'Checking dashboard access…';
    try {
      if (!(await api.isAdmin())) {
        await api.client.auth.signOut();
        showLogin('This account is not on the Leafora admin list.', true);
        return;
      }
      loginStatus.textContent = '';
      loginPanel.hidden = true;
      ordersPanel.hidden = false;
      await loadOrders();
    } catch (error) {
      showLogin(error.message || 'Could not connect to the order database. Run the Leafora schema in Supabase.', true);
    }
  }
  async function loadOrders() {
    notice.classList.remove('error');
    notice.textContent = 'Loading orders…';
    try {
      var result = await api.client.from('orders').select('*').order('created_at',{ascending:false}).limit(100);
      if (result.error) throw result.error;
      var orders = result.data || [];
      notice.textContent = orders.length ? 'Showing the latest ' + orders.length + ' order' + (orders.length === 1 ? '' : 's') + '.' : 'No orders yet.';
      orderList.innerHTML = orders.length ? orders.map(renderOrder).join('') : '<div class="order-empty">New website orders will appear here.</div>';
    } catch (error) {
      notice.textContent = 'Could not load orders. Run the updated supabase/schema.sql and check the project connection.';
      notice.classList.add('error');
      orderList.innerHTML = '';
      console.error('Could not load Leafora orders.', error);
    }
  }
  function renderOrder(order) {
    var date = new Date(order.created_at);
    var dateText = Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
    var phone = String(order.customer_phone || '');
    var phoneLink = phone.replace(/[^0-9+]/g,'');
    var items = Array.isArray(order.items) ? order.items : [];
    var itemsHtml = items.map(function (item) {
      return '<li>' + escapeHtml(item.name) + ' × ' + Number(item.quantity || 0) + ' — ' + money(item.subtotal) + '</li>';
    }).join('');
    var options = statuses.map(function (status) {
      return '<option value="' + status + '" ' + (order.status === status ? 'selected' : '') + '>' + escapeHtml(statusLabels[status]) + '</option>';
    }).join('');
    var fulfillment = order.fulfillment === 'pickup' ? 'Store pickup' : 'Local delivery';
    return '<article class="order-card" data-order-id="' + Number(order.id) + '">' +
      '<div class="order-card-head"><div><h2>Order #' + Number(order.id) + '</h2><p class="order-meta">' + escapeHtml(dateText) + ' · ' + escapeHtml(fulfillment) + '</p></div><strong class="order-total">' + money(order.total_amount) + '</strong></div>' +
      '<div class="order-detail-grid">' +
      '<section class="order-detail"><h3>Customer</h3><p><strong>' + escapeHtml(order.customer_name) + '</strong></p><p><a href="tel:' + escapeHtml(phoneLink) + '">' + escapeHtml(phone) + '</a></p>' + (order.delivery_address ? '<p>' + escapeHtml(order.delivery_address) + '</p>' : '') + '</section>' +
      '<section class="order-detail"><h3>Items</h3><ul>' + itemsHtml + '</ul>' + (order.note ? '<p><strong>Note:</strong> ' + escapeHtml(order.note) + '</p>' : '') + '</section>' +
      '</div><div class="order-status-row"><span>Order status</span><label><span class="sr-only">Status for order ' + Number(order.id) + '</span><select data-order-status="' + Number(order.id) + '">' + options + '</select></label></div></article>';
  }

  if (!api.configured) {
    setupNote.textContent = 'Supabase is not connected. Add the project key and run the updated schema SQL to enable ordering.';
    loginForm.querySelector('button').disabled = true;
  } else {
    api.client.auth.getSession().then(function (result) {
      if (result.data.session) openOrders();
    });
  }
  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    loginStatus.classList.remove('error');
    loginStatus.textContent = 'Signing in…';
    var values = new FormData(loginForm);
    var result = await api.client.auth.signInWithPassword({email:values.get('email'),password:values.get('password')});
    if (result.error) { showLogin(result.error.message,true); return; }
    await openOrders();
  });
  orderList.addEventListener('change', async function (event) {
    var control = event.target.closest('select[data-order-status]');
    if (!control) return;
    control.disabled = true;
    notice.classList.remove('error');
    notice.textContent = 'Updating order…';
    try {
      var result = await api.client.from('orders').update({status:control.value}).eq('id',Number(control.dataset.orderStatus)).select('id').single();
      if (result.error) throw result.error;
      notice.textContent = 'Order status updated.';
    } catch (error) {
      notice.textContent = 'Could not update this order status.';
      notice.classList.add('error');
      console.error('Could not update Leafora order status.', error);
      await loadOrders();
    } finally { control.disabled = false; }
  });
  document.getElementById('refresh-orders').addEventListener('click',loadOrders);
  document.getElementById('sign-out').addEventListener('click',async function () {
    await api.client.auth.signOut();
    showLogin('You are signed out.');
  });
})();
