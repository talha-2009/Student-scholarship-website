(function renderBlogCards() {
  var container = document.getElementById("blog-posts");
  if (!container || !BLOG_POSTS) return;

  var html = "";
  for (var i = 0; i < BLOG_POSTS.length; i++) {
    var p = BLOG_POSTS[i];
    html += '<article class="blog-card" itemscope itemtype="https://schema.org/BlogPosting">';
    html += '<div class="blog-card-body">';
    html += '<span class="blog-card-category ' + p.categoryClass + '">' + p.category + '</span>';
    html += '<h2 itemprop="headline"><a href="' + p.url + '" itemprop="url">' + p.title + '</a></h2>';
    html += '<p itemprop="description">' + p.excerpt + '</p>';
    html += '<div class="blog-card-meta">';
    html += '<time datetime="' + p.date + '" itemprop="datePublished">' + p.date + '</time>';
    html += '<span class="blog-card-readtime">' + p.readTime + '</span>';
    html += '</div>';
    html += '<a href="' + p.url + '" class="blog-card-cta">Read More</a>';
    html += '</div>';
    html += '</article>';
  }
  container.innerHTML = html;
})();
