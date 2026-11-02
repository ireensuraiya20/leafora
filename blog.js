(function () {
  'use strict';
  var root = document.getElementById('blog-content');
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g,function (ch) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]);
    });
  }
  function render(content) {
    var blog = content.blog || {};
    document.title = (blog.title || 'Blog') + ' | ' + (content.brandName || 'Leafora');
    document.querySelectorAll('[data-cms]').forEach(function (element) {
      var value = element.getAttribute('data-cms').split('.').reduce(function (item,key) { return item && item[key]; },content);
      if (value != null) element.textContent = value;
    });
    document.querySelectorAll('[data-cms-aria]').forEach(function (element) {
      var value = element.getAttribute('data-cms-aria').split('.').reduce(function (item,key) { return item && item[key]; },content);
      if (value != null) element.setAttribute('aria-label',value);
    });
    var posts = (blog.posts || []).filter(function (post) { return post.published; });
    if (!posts.length) {
      root.innerHTML = '<div class="empty" role="status"><p>' + esc(blog.emptyMessage || '') + '</p></div>';
      return;
    }
    root.innerHTML = posts.map(function (post) {
      var image = post.coverImage ? '<img class="post-image" src="' + esc(post.coverImage) + '" alt="" loading="lazy">' : '';
      var body = post.body ? '<div class="post-body">' + esc(post.body).replace(/\n/g,'<br>') + '</div>' : '';
      var date = post.publishedAt ? '<time>' + esc(post.publishedAt) + '</time>' : '';
      return '<article class="post">' + image + '<div class="post-copy">' + date + '<h2>' + esc(post.title) + '</h2><p class="post-excerpt">' + esc(post.excerpt) + '</p>' + body + '</div></article>';
    }).join('');
  }
  window.LEAFORA.loadContent().then(render).catch(function (error) {
    console.warn('Leafora blog content could not be loaded; showing default copy.',error);
    render(window.LEAFORA_DEFAULT_CONTENT);
  });
  var year = document.getElementById('year');
  if (year) year.textContent = '© ' + new Date().getFullYear() + ' Leafora';
})();
