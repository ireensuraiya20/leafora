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
  var searchInput = document.getElementById('order-search');
  var statusFilter = document.getElementById('order-status-filter');
  var notificationsButton = document.getElementById('enable-notifications');
  var statuses = ['pending','confirmed','preparing','ready','completed','cancelled'];
  var statusLabels = {pending:'Pending',confirmed:'Confirmed',preparing:'Preparing',ready:'Ready for pickup / delivery',completed:'Completed',cancelled:'Cancelled'};
  var allOrders = [];
  var knownOrderIds = null;
  var pollingTimer = null;
  var notificationEnabled = false;

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
      startPolling();
    } catch (error) {
      showLogin(error.message || 'Could not connect to the order database. Run the Leafora schema in Supabase.', true);
    }
  }
  async function loadOrders(options) {
    options = options || {};
    if (!options.silent) {
      notice.classList.remove('error');
      notice.textContent = 'Loading orders…';
    }
    try {
      var result = await api.client.from('orders').select('*').order('created_at',{ascending:false}).limit(100);
      if (result.error) throw result.error;
      allOrders = result.data || [];
      var currentIds = new Set(allOrders.map(function (order) { return String(order.id); }));
      if (knownOrderIds && options.checkNew) {
        var newOrders = allOrders.filter(function (order) { return !knownOrderIds.has(String(order.id)); });
        if (newOrders.length) announceNewOrders(newOrders);
      }
      knownOrderIds = currentIds;
      notice.classList.remove('error');
      notice.textContent = allOrders.length ? 'Showing the latest ' + allOrders.length + ' order' + (allOrders.length === 1 ? '' : 's') + '. Checks for new orders every 20 seconds while this page is open.' : 'No orders yet. This page checks for new orders every 20 seconds.';
      renderOrders();
    } catch (error) {
      if (options.silent) return;
      notice.textContent = 'Could not load orders. Run the updated supabase/schema.sql and check the project connection.';
      notice.classList.add('error');
      orderList.innerHTML = '';
      console.error('Could not load Leafora orders.', error);
    }
  }
  function renderOrders() {
    var query = searchInput.value.trim().toLowerCase();
    var status = statusFilter.value;
    var visible = allOrders.filter(function (order) {
      var matchesStatus = status === 'all' || order.status === status;
      var haystack = [order.id, order.customer_name, order.customer_phone, order.delivery_address].join(' ').toLowerCase();
      return matchesStatus && (!query || haystack.indexOf(query) !== -1);
    });
    orderList.innerHTML = visible.length ? visible.map(renderOrder).join('') : '<div class="order-empty">No orders match these filters.</div>';
  }
  function startPolling() {
    if (pollingTimer) window.clearInterval(pollingTimer);
    pollingTimer = window.setInterval(function () {
      if (!document.hidden && !ordersPanel.hidden) loadOrders({silent:true,checkNew:true});
    }, 20000);
  }
  function announceNewOrders(orders) {
    var message = orders.length === 1
      ? 'New order #' + orders[0].id + ' from ' + orders[0].customer_name
      : orders.length + ' new orders received.';
    notice.textContent = message;
    if (notificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('New Leafora order', {body:message, tag:'leafora-new-order'});
    }
    document.title = '(' + orders.length + ' new) Leafora Orders';
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
      '<section class="order-detail"><h3>Customer</h3><p><strong>' + escapeHtml(order.customer_name) + '</strong></p><p><a href="tel:' + escapeHtml(phoneLink) + '">' + escapeHtml(phone) + '</a> · <a href="https://wa.me/' + escapeHtml(phone.replace(/\D/g,'')) + '" target="_blank" rel="noopener">WhatsApp</a></p>' + (order.delivery_address ? '<p>' + escapeHtml(order.delivery_address) + '</p>' : '') + '</section>' +
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
      var updated = allOrders.find(function (order) { return Number(order.id) === Number(control.dataset.orderStatus); });
      if (updated) updated.status = control.value;
      renderOrders();
    } catch (error) {
      notice.textContent = 'Could not update this order status.';
      notice.classList.add('error');
      console.error('Could not update Leafora order status.', error);
      await loadOrders();
    } finally { control.disabled = false; }
  });
  document.getElementById('refresh-orders').addEventListener('click',function () { loadOrders({checkNew:true}); });
  searchInput.addEventListener('input',renderOrders);
  statusFilter.addEventListener('change',renderOrders);
  notificationsButton.addEventListener('click',async function () {
    if (!('Notification' in window)) {
      notice.textContent = 'This browser does not support desktop notifications. Keep the dashboard open; it checks every 20 seconds.';
      return;
    }
    var permission = Notification.permission;
    if (permission === 'default') permission = await Notification.requestPermission();
    notificationEnabled = permission === 'granted';
    notificationsButton.textContent = notificationEnabled ? 'Alerts are on' : 'Alerts blocked';
    notice.textContent = notificationEnabled
      ? 'Desktop alerts are on. Keep this dashboard tab open to receive new order alerts.'
      : 'Notifications are blocked. Allow them in your browser settings; the dashboard still checks every 20 seconds while open.';
    notificationsButton.disabled = notificationEnabled;
  });
  document.getElementById('sign-out').addEventListener('click',async function () {
    if (pollingTimer) window.clearInterval(pollingTimer);
    await api.client.auth.signOut();
    document.title = 'Leafora Orders';
    showLogin('You are signed out.');
  });
})();