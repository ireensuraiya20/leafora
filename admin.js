(function () {
  'use strict';
  var api = window.LEAFORA;
  var loginPanel = document.getElementById('login-panel');
  var editorPanel = document.getElementById('editor-panel');
  var loginForm = document.getElementById('login-form');
  var loginStatus = document.getElementById('login-status');
  var contentForm = document.getElementById('content-form');
  var fields = document.getElementById('content-fields');
  var saveStatus = document.getElementById('save-status');
  var saveButton = document.getElementById('save-button');
  var note = document.getElementById('setup-note');
  var connectionStatus = document.getElementById('connection-status');
  var draft = api.clone(api.defaults);
  var user = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]);
    });
  }
  function pretty(key) {
    return String(key).replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[_-]+/g,' ').replace(/^./,function (c) { return c.toUpperCase(); });
  }
  function pathValue(path) {
    return path.split('.').reduce(function (value, key) { return value == null ? undefined : value[key]; }, draft);
  }
  function setPath(path, value) {
    var parts = path.split('.'), parent = draft;
    for (var i = 0; i < parts.length - 1; i++) parent = parent[parts[i]];
    parent[parts[parts.length - 1]] = value;
  }
  function emptyItem(path) {
    var key = path.split('.').pop();
    if (key === 'products') return {id:'new-item',name:'New plant',bn:'',kind:'leafy',tags:['bright'],rows:[['Light',''],['Water','']],usefulness:'',price:0,imageUrl:''};
    if (key === 'posts') return {slug:'new-post',title:'New post',excerpt:'',body:'',coverImage:'',publishedAt:'',published:false};
    if (key === 'items') return {title:'',text:''};
    if (key === 'filters') return {id:'new-filter',label:''};
    if (key === 'steps' || key === 'tags') return '';
    if (key === 'rows') return ['', ''];
    var source = pathValue(path);
    if (source && source.length && source[0] && typeof source[0] === 'object') {
      var blank = {};
      Object.keys(source[0]).forEach(function (field) { blank[field] = typeof source[0][field] === 'number' ? 0 : typeof source[0][field] === 'boolean' ? false : ''; });
      return blank;
    }
    return '';
  }
  function summary(item, index) {
    var label = item && (item.name || item.title || item.label || item.id || item.slug);
    return (index + 1) + (label ? ' · ' + label : '');
  }
  function fieldMarkup(key, value, path, inArray) {
    var label = pretty(key), full = /description|intro|excerpt|body|text|message|steps|usefulness/i.test(key);
    if (Array.isArray(value)) {
      var rows = value.map(function (item, index) {
        var complex = item !== null && typeof item === 'object';
        var body = complex ? renderFields(item, path + '.' + index) : primitiveMarkup(item, path + '.' + index, key, true);
        return '<div class="array-item">' + (complex ? '<details><summary>' + escapeHtml(summary(item,index)) + '</summary>' + body + '</details>' : body) +
          '<button type="button" class="remove" data-action="remove" data-parent-path="' + escapeHtml(path) + '" data-index="' + index + '">Remove</button></div>';
      }).join('');
      return '<div class="array"><span class="field-label">' + escapeHtml(label) + '</span>' + rows +
        '<button type="button" class="add" data-action="add" data-path="' + escapeHtml(path) + '">+ Add ' + escapeHtml(label.replace(/s$/i,'')) + '</button></div>';
    }
    if (value !== null && typeof value === 'object') {
      return '<details class="section" open><summary>' + escapeHtml(label) + '</summary>' + renderFields(value,path) + '</details>';
    }
    return primitiveMarkup(value,path,key,inArray,full);
  }
  function primitiveMarkup(value, path, key, inArray, forceFull) {
    var label = pretty(key), type = typeof value;
    if (type === 'boolean') return '<label class="field' + (inArray ? '' : ' full') + '"><span>' + escapeHtml(label) + '</span><input type="checkbox" data-path="' + escapeHtml(path) + '" data-kind="boolean" ' + (value ? 'checked' : '') + '></label>';
    var number = type === 'number';
    var multiline = forceFull || /description|intro|excerpt|body|text|message|usefulness/i.test(key);
    var control = multiline
      ? '<textarea data-path="' + escapeHtml(path) + '" data-kind="' + (number ? 'number' : 'string') + '">' + escapeHtml(value) + '</textarea>'
      : '<input type="' + (number ? 'number' : 'text') + '" data-path="' + escapeHtml(path) + '" data-kind="' + (number ? 'number' : 'string') + '" value="' + escapeHtml(value) + '">';
    return '<label class="field' + (multiline || !inArray ? ' full' : '') + '"><span>' + escapeHtml(label) + '</span>' + control + '</label>';
  }
  function renderFields(object, prefix) {
    return '<div class="fields">' + Object.keys(object || {}).map(function (key) {
      return fieldMarkup(key, object[key], prefix ? prefix + '.' + key : key, false);
    }).join('') + '</div>';
  }
  function renderEditor() {
    fields.innerHTML = renderFields(draft,'');
  }
  function showError(element, message) {
    element.textContent = message;
    element.classList.add('error');
  }
  function showLogin(message) {
    editorPanel.hidden = true;
    loginPanel.hidden = false;
    if (message) loginStatus.textContent = message;
  }
  async function openEditor(sessionUser) {
    user = sessionUser;
    loginStatus.textContent = 'Checking dashboard access…';
    try {
      if (!(await api.isAdmin())) {
        await api.client.auth.signOut();
        showError(loginStatus,'This account is not on the Leafora admin list. Ask the project owner to add it in Supabase.');
        return;
      }
      draft = await api.loadContent();
      renderEditor();
      loginPanel.hidden = true;
      editorPanel.hidden = false;
      connectionStatus.textContent = 'Connected to Supabase. Public pages can read this content; only approved admins can save edits.';
      loginStatus.textContent = '';
    } catch (error) {
      showError(loginStatus,error.message || 'Could not load dashboard data. Check the Supabase setup.');
      showLogin(loginStatus.textContent);
    }
  }

  if (!api.configured) {
    note.textContent = 'Supabase is not connected yet. Add the project URL and publishable key after creating the project, then run the provided schema SQL.';
    loginForm.querySelector('button').disabled = true;
  } else {
    api.client.auth.getSession().then(function (result) {
      if (result.data.session) openEditor(result.data.session.user);
    });
  }

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    loginStatus.classList.remove('error');
    loginStatus.textContent = 'Signing in…';
    var values = new FormData(loginForm);
    var result = await api.client.auth.signInWithPassword({email:values.get('email'),password:values.get('password')});
    if (result.error) { showError(loginStatus,result.error.message); return; }
    await openEditor(result.data.user);
  });

  fields.addEventListener('input',function (event) {
    var control = event.target;
    if (!control.dataset.path || control.type === 'checkbox') return;
    setPath(control.dataset.path,control.dataset.kind === 'number' ? Number(control.value) : control.value);
  });
  fields.addEventListener('change',function (event) {
    var control = event.target;
    if (control.dataset.path && control.type === 'checkbox') setPath(control.dataset.path,control.checked);
    if (control.dataset.path && control.dataset.kind === 'number') setPath(control.dataset.path,Number(control.value));
  });
  fields.addEventListener('click',function (event) {
    var button = event.target.closest('button[data-action]');
    if (!button) return;
    var list = pathValue(button.dataset.action === 'add' ? button.dataset.path : button.dataset.parentPath);
    if (!Array.isArray(list)) return;
    if (button.dataset.action === 'add') list.push(emptyItem(button.dataset.path));
    else list.splice(Number(button.dataset.index),1);
    renderEditor();
  });
  contentForm.addEventListener('submit',async function (event) {
    event.preventDefault();
    saveStatus.classList.remove('error');
    saveStatus.textContent = 'Saving…';
    saveButton.disabled = true;
    try {
      var productIds = (draft.products || []).map(function (product) { return String(product.id || ''); });
      if (productIds.some(function (id) { return !/^[a-z0-9][a-z0-9-]*$/.test(id); }) || new Set(productIds).size !== productIds.length) {
        throw new Error('Each product needs a unique id using lowercase letters, numbers, and hyphens.');
      }
      if ((draft.products || []).some(function (product) { return !Number.isFinite(Number(product.price)) || Number(product.price) < 0; })) {
        throw new Error('Product prices must be valid numbers greater than or equal to zero.');
      }
      await api.saveContent(draft,user.id);
      saveStatus.textContent = 'Saved. The public pages will use this content now.';
    } catch (error) {
      showError(saveStatus,error.message || 'Save failed. Check the Supabase connection and database policies.');
    } finally { saveButton.disabled = false; }
  });
  document.getElementById('sign-out').addEventListener('click',async function () {
    await api.client.auth.signOut();
    showLogin('You are signed out.');
  });
})();
