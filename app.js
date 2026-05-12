// 数据存储键
const STORAGE_KEYS = {
  accounts: 'wb_accounts',
  articles: 'wb_articles',
  currentAccount: 'wb_current_account'
};

// 示例数据
const DEFAULT_ACCOUNTS = [
  {
    id: 'acc_1',
    name: '样例公众号',
    accountId: 'sample_account',
    desc: '这是一个示例公众号',
    createdAt: Date.now()
  }
];

const DEFAULT_ARTICLES = [
  {
    id: 'art_1',
    title: '欢迎来到公众号阅读器',
    summary: '点击右上角切换公众号，或点击底部+号添加文章。你可以收藏来自任何公众号的文章链接，方便随时阅读。',
    url: 'https://mp.weixin.qq.com/s/h26JvIDmAs6MtR1TtzMLvQ',
    accountId: 'acc_1',
    createdAt: Date.now()
  },
  {
    id: 'art_2',
    title: '如何添加文章',
    summary: '复制微信文章链接，点击+按钮，粘贴链接并保存。文章会自动归类到当前选中的公众号下。',
    url: 'https://mp.weixin.qq.com/s/h26JvIDmAs6MtR1TtzMLvQ',
    accountId: 'acc_1',
    createdAt: Date.now() - 86400000
  }
];

// 初始化数据
function initData() {
  if (!localStorage.getItem(STORAGE_KEYS.accounts)) {
    localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(DEFAULT_ACCOUNTS));
    localStorage.setItem(STORAGE_KEYS.articles, JSON.stringify(DEFAULT_ARTICLES));
    localStorage.setItem(STORAGE_KEYS.currentAccount, 'acc_1');
  }
}

// 获取数据
function getAccounts() {
  const data = localStorage.getItem(STORAGE_KEYS.accounts);
  return data ? JSON.parse(data) : [];
}

function getArticles() {
  const data = localStorage.getItem(STORAGE_KEYS.articles);
  return data ? JSON.parse(data) : [];
}

function getCurrentAccountId() {
  return localStorage.getItem(STORAGE_KEYS.currentAccount) || '';
}

function getCurrentAccount() {
  const accounts = getAccounts();
  const currentId = getCurrentAccountId();
  return accounts.find(a => a.id === currentId) || accounts[0] || null;
}

// 保存数据
function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
}

function saveArticles(articles) {
  localStorage.setItem(STORAGE_KEYS.articles, JSON.stringify(articles));
}

function setCurrentAccount(accountId) {
  localStorage.setItem(STORAGE_KEYS.currentAccount, accountId);
}

// 页面切换
function showPage(page) {
  // 隐藏所有页面
  document.getElementById('articlesPage').style.display = 'none';
  document.getElementById('accountsPage').style.display = 'none';
  document.getElementById('addArticlePage').style.display = 'none';
  document.getElementById('addAccountPage').style.display = 'none';

  // 更新 Tab 状态
  document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));

  // 显示目标页面
  switch(page) {
    case 'articles':
      document.getElementById('articlesPage').style.display = 'block';
      document.querySelectorAll('.tab-item')[0].classList.add('active');
      document.getElementById('fab').classList.remove('hidden');
      document.getElementById('switchAccountBtn').style.display = 'block';
      renderArticles();
      break;
    case 'accounts':
      document.getElementById('accountsPage').style.display = 'block';
      document.querySelectorAll('.tab-item')[1].classList.add('active');
      document.getElementById('fab').classList.add('hidden');
      document.getElementById('switchAccountBtn').style.display = 'none';
      renderAccounts();
      break;
    case 'addArticle':
      document.getElementById('addArticlePage').style.display = 'block';
      document.getElementById('fab').classList.add('hidden');
      document.getElementById('switchAccountBtn').style.display = 'none';
      break;
    case 'addAccount':
      document.getElementById('addAccountPage').style.display = 'block';
      document.getElementById('fab').classList.add('hidden');
      document.getElementById('switchAccountBtn').style.display = 'none';
      break;
  }

  // 更新标题
  updateHeader();
}

// 更新头部标题
function updateHeader() {
  const currentAccount = getCurrentAccount();
  const headerTitle = document.getElementById('headerTitle');
  if (currentAccount) {
    headerTitle.textContent = currentAccount.name;
  } else {
    headerTitle.textContent = '公众号阅读';
  }
}

// 渲染文章列表
function renderArticles() {
  const articles = getArticles();
  const currentAccountId = getCurrentAccountId();
  const accounts = getAccounts();

  // 过滤当前公众号的文章
  const filteredArticles = articles
    .filter(a => a.accountId === currentAccountId)
    .sort((a, b) => b.createdAt - a.createdAt);

  const container = document.getElementById('articleList');
  const emptyState = document.getElementById('emptyState');

  if (filteredArticles.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  container.style.display = 'block';
  emptyState.style.display = 'none';

  container.innerHTML = filteredArticles.map(article => {
    const account = accounts.find(a => a.id === article.accountId);
    const accountName = account ? account.name : '未知公众号';
    const dateStr = formatDate(article.createdAt);

    return `
      <div class="article-card" onclick="openArticle('${article.url}')">
        <div class="article-title">${escapeHtml(article.title)}</div>
        ${article.summary ? `<div class="article-summary">${escapeHtml(article.summary)}</div>` : ''}
        <div class="article-meta">
          <div class="article-account">
            <div class="account-avatar">${accountName.charAt(0)}</div>
            <span>${escapeHtml(accountName)}</span>
          </div>
          <span>${dateStr}</span>
        </div>
      </div>
    `;
  }).join('');
}

// 渲染公众号列表
function renderAccounts() {
  const accounts = getAccounts();
  const currentId = getCurrentAccountId();
  const articles = getArticles();

  // 当前公众号
  const currentAccount = accounts.find(a => a.id === currentId);
  const currentContainer = document.getElementById('currentAccount');
  if (currentAccount) {
    const count = articles.filter(a => a.accountId === currentId).length;
    currentContainer.innerHTML = `
      <div class="account-item-avatar">${currentAccount.name.charAt(0)}</div>
      <div class="account-item-info">
        <div class="account-item-name">${escapeHtml(currentAccount.name)}</div>
        <div class="account-item-desc">${count} 篇文章</div>
      </div>
    `;
  } else {
    currentContainer.innerHTML = '<div class="empty-text">未选择公众号</div>';
  }

  // 公众号列表
  const listContainer = document.getElementById('accountList');
  listContainer.innerHTML = accounts.map(account => {
    const count = articles.filter(a => a.accountId === account.id).length;
    const isCurrent = account.id === currentId;
    return `
      <div class="account-item" onclick="switchAccount('${account.id}')">
        <div class="account-item-avatar">${account.name.charAt(0)}</div>
        <div class="account-item-info">
          <div class="account-item-name">${escapeHtml(account.name)}</div>
          <div class="account-item-desc">${escapeHtml(account.desc || '')}</div>
        </div>
        <div class="account-item-count">${count}篇</div>
        ${isCurrent ? '<div class="account-item-check">✓</div>' : ''}
      </div>
    `;
  }).join('');
}

// 切换公众号
function switchAccount(accountId) {
  setCurrentAccount(accountId);
  hideAccountModal();
  showPage('articles');
}

// 显示切换弹窗
function showAccountModal() {
  const accounts = getAccounts();
  const currentId = getCurrentAccountId();
  const container = document.getElementById('accountSelectList');

  container.innerHTML = accounts.map(account => {
    const isCurrent = account.id === currentId;
    return `
      <div class="account-item" onclick="switchAccount('${account.id}')">
        <div class="account-item-avatar">${account.name.charAt(0)}</div>
        <div class="account-item-info">
          <div class="account-item-name">${escapeHtml(account.name)}</div>
          <div class="account-item-desc">${escapeHtml(account.desc || '')}</div>
        </div>
        ${isCurrent ? '<div class="account-item-check">✓</div>' : ''}
      </div>
    `;
  }).join('');

  document.getElementById('accountModal').style.display = 'flex';
}

function hideAccountModal() {
  document.getElementById('accountModal').style.display = 'none';
}

// 显示添加文章页
function showAddArticle() {
  document.getElementById('articleTitle').value = '';
  document.getElementById('articleUrl').value = '';
  document.getElementById('articleSummary').value = '';
  showPage('addArticle');
}

// 保存文章
function saveArticle() {
  const title = document.getElementById('articleTitle').value.trim();
  const url = document.getElementById('articleUrl').value.trim();
  const summary = document.getElementById('articleSummary').value.trim();

  if (!title) {
    alert('请输入文章标题');
    return;
  }
  if (!url) {
    alert('请输入文章链接');
    return;
  }

  const currentAccountId = getCurrentAccountId();
  if (!currentAccountId) {
    alert('请先添加公众号');
    return;
  }

  const articles = getArticles();
  articles.push({
    id: 'art_' + Date.now(),
    title,
    url,
    summary,
    accountId: currentAccountId,
    createdAt: Date.now()
  });

  saveArticles(articles);
  showPage('articles');
}

// 显示添加公众号页
function showAddAccount() {
  document.getElementById('accountName').value = '';
  document.getElementById('accountId').value = '';
  document.getElementById('accountDesc').value = '';
  showPage('addAccount');
}

// 保存公众号
function saveAccount() {
  const name = document.getElementById('accountName').value.trim();
  const accountId = document.getElementById('accountId').value.trim();
  const desc = document.getElementById('accountDesc').value.trim();

  if (!name) {
    alert('请输入公众号名称');
    return;
  }

  const accounts = getAccounts();
  const newAccount = {
    id: 'acc_' + Date.now(),
    name,
    accountId,
    desc,
    createdAt: Date.now()
  };

  accounts.push(newAccount);
  saveAccounts(accounts);

  // 如果是第一个公众号，自动设为当前
  if (accounts.length === 1) {
    setCurrentAccount(newAccount.id);
  }

  showPage('accounts');
}

// 打开文章
function openArticle(url) {
  window.open(url, '_blank');
}

// 工具函数
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initData();
  showPage('articles');
});

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
