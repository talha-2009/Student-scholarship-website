(function renderBlogCards() {
  var container = document.getElementById("blog-posts");
  if (!container || typeof BLOG_POSTS === "undefined") return;

  function esc(str) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  var html = "";
  for (var i = 0; i < BLOG_POSTS.length; i++) {
    var p = BLOG_POSTS[i];
    var safeUrl = esc(p.url);
    var safeTitle = esc(p.title);
    var safeExcerpt = esc(p.excerpt);
    var safeCategory = esc(p.category);
    var safeCatClass = esc(p.categoryClass || "");
    var safeDate = esc(p.date || "");
    var safeReadTime = esc(p.readTime || "");

    html += '<article class="blog-card" itemscope itemtype="https://schema.org/BlogPosting">';
    html += '<div class="blog-card-body">';
    html += '<span class="blog-card-category ' + safeCatClass + '">' + safeCategory + '</span>';
    html += '<h2 itemprop="headline"><a href="' + safeUrl + '" itemprop="url">' + safeTitle + '</a></h2>';
    html += '<p itemprop="description">' + safeExcerpt + '</p>';
    html += '<div class="blog-card-meta">';
    html += '<time datetime="' + safeDate + '" itemprop="datePublished">' + safeDate + '</time>';
    html += '<span class="blog-card-readtime">' + safeReadTime + '</span>';
    html += '</div>';
    html += '<a href="' + safeUrl + '" class="blog-card-cta">Read More</a>';
    html += '</div>';
    html += '</article>';
  }
  container.innerHTML = html;
})();
