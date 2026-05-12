const STORAGE_KEY = 'dream_articles';

// 预置示例文章（包括用户提供的那篇）
const DEFAULT_ARTICLES = [
  {
    id: 'art_1',
    title: '欢迎来到梦影露电',
    summary: '这里是梦影露电公众号，记录生活点滴，分享所思所感。点击添加更多文章链接。',
    url: 'https://mp.weixin.qq.com/s/h26JvIDmAs6MtR1TtzMLvQ',
    createdAt: Date.now()
  }
];

// 初始化
function init() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    saveArticles(DEFAULT_ARTICLES);
  }
  renderArticles();
}

function getArticles() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveArticles(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

function renderArticles() {
  const articles = getArticles().sort((a, b) => b.createdAt - a.createdAt);
  const container = document.getElementById('articleList');
  const emptyTip = document.getElementById('emptyTip');

  if (articles.length === 0) {
    container.style.display = 'none';
    emptyTip.style.display = 'block';
    return;
  }

  container.style.display = 'flex';
  emptyTip.style.display = 'none';

  container.innerHTML = articles.map(article => {
    const dateStr = formatDate(article.createdAt);
    return `
      <div class="article-card" onclick="openArticle('${article.url}')">
        <button class="article-delete" onclick="event.stopPropagation(); deleteArticle('${article.id}')">✕</button>
        <div class="article-cover">📰</div>
        <div class="article-body">
          <div class="article-title">${escapeHtml(article.title)}</div>
          ${article.summary ? `<div class="article-summary">${escapeHtml(article.summary)}</div>` : ''}
          <div class="article-meta">
            <span class="article-date">📅 ${dateStr}</span>
            <span class="article-read">👁 阅读原文</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function showAddModal() {
  document.getElementById('articleLinks').value = '';
  document.getElementById('addModal').style.display = 'flex';
}

function hideAddModal() {
  document.getElementById('addModal').style.display = 'none';
}

function addArticles() {
  const input = document.getElementById('articleLinks').value.trim();
  if (!input) {
    alert('请输入文章链接');
    return;
  }

  const lines = input.split('\n').map(l => l.trim()).filter(l => l);
  const articles = getArticles();
  let added = 0;

  lines.forEach(url => {
    if (!url.includes('mp.weixin.qq.com')) {
      return; // 跳过非微信链接
    }
    // 检查是否已存在
    if (articles.some(a => a.url === url)) {
      return;
    }
    articles.push({
      id: 'art_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: '微信文章',
      summary: '',
      url: url,
      createdAt: Date.now()
    });
    added++;
  });

  if (added > 0) {
    saveArticles(articles);
    renderArticles();
    hideAddModal();
    alert(`成功添加 ${added} 篇文章`);
  } else {
    alert('没有有效的微信文章链接，或链接已存在');
  }
}

function deleteArticle(id) {
  if (!confirm('确定删除这篇文章？')) return;
  const articles = getArticles().filter(a => a.id !== id);
  saveArticles(articles);
  renderArticles();
}

function openArticle(url) {
  window.open(url, '_blank');
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 86400000 && date.getDate() === now.getDate()) {
    return '今天';
  }
  if (diff < 172800000 && date.getDate() === now.getDate() - 1) {
    return '昨天';
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 启动
document.addEventListener('DOMContentLoaded', init);

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
