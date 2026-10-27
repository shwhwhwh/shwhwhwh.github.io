(() => {
  const video = document.getElementById('rn-demo-video');
  const videoToggle = document.getElementById('rn-video-toggle');
  if (video && videoToggle) {
    videoToggle.addEventListener('click', async () => {
      try {
        document.getElementById('rn-video-status').textContent = '';
        if (video.paused) await video.play(); else video.pause();
      } catch { document.getElementById('rn-video-status').textContent = '浏览器未能播放，可下载视频后观看。'; }
    });
    video.addEventListener('play', () => { videoToggle.textContent = '暂停演示'; });
    video.addEventListener('pause', () => { videoToggle.textContent = '播放演示'; });
    video.addEventListener('ended', () => { videoToggle.textContent = '重新播放'; });
  }
  const host = document.getElementById('bc-demo');
  if (!host) return;
  const tree = document.getElementById('bc-demo-tree');
  const form = document.getElementById('bc-demo-form');
  const input = document.getElementById('bc-demo-input');
  const status = document.getElementById('bc-demo-status');
  const initial = () => [
    { id: 'root', parentId: null, q: '怎样探索一个想法？', a: '把共同的问题作为起点。你可以从同一回答，分别探索交互、上下文和其他方向。' },
    { id: 'design', parentId: 'root', q: '从交互设计出发', a: '让每条思路成为可选中的节点。选中一个回答，再点击 ＋，就能从这里建立新的追问。' },
    { id: 'context', parentId: 'root', q: '从上下文隔离出发', a: '每条路径继承共同历史，保留各自的后续追问。兄弟分支的后续内容不会加入当前路径。' }
  ];
  let nodes = initial(), selectedId = 'root', nextId = 1;
  const element = (tag, className, text) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  function path(id) {
    const result = [];
    let node = nodes.find(item => item.id === id);
    while (node) { result.unshift(node); node = nodes.find(item => item.id === node.parentId); }
    return result;
  }
  function add(parentId, question) {
    if (nodes.length >= 8) { status.textContent = '这份示意最多展示 8 个节点，点击“重置”可以重新探索。'; return; }
    const q = question.trim() || '新的探索方向 ' + nextId;
    const node = { id: 'branch-' + nextId++, parentId, q: q.slice(0, 80), a: '这是一段预置演示回复。\n真实 Branch Canvas 会继承所选节点的路径，在本机调用 Codex，并保存新回答。' };
    nodes.push(node); selectedId = node.id; input.value = ''; render();
    status.textContent = '已从“' + nodes.find(item => item.id === parentId).q + '”创建演示分支；没有调用模型。';
  }
  function level(parentId) {
    const list = element('ul', 'demo-tree-level');
    for (const node of nodes.filter(item => item.parentId === parentId)) {
      const item = element('li'); item.dataset.nodeId = node.id; item.dataset.parentId = node.parentId || '';
      const row = element('div', 'demo-node' + (selectedId === node.id ? ' selected' : ''));
      const select = element('button', 'demo-select'); select.type = 'button';
      select.setAttribute('aria-pressed', String(selectedId === node.id));
      select.setAttribute('aria-label', '查看演示节点：' + node.q);
      select.append(element('small', '', node.parentId ? '分支 / 预置回复' : '共同起点'), element('strong', '', node.q));
      select.addEventListener('click', () => { selectedId = node.id; render(); status.textContent = '已选中“' + node.q + '”，可以从这里添加演示追问。'; });
      const plus = element('button', 'demo-add', '+'); plus.type = 'button'; plus.setAttribute('aria-label', '从“' + node.q + '”创建演示分支');
      plus.addEventListener('click', () => add(node.id, ''));
      row.append(select, plus); item.append(row);
      if (nodes.some(child => child.parentId === node.id)) item.append(level(node.id));
      list.append(item);
    }
    return list;
  }
  function render() {
    const node = nodes.find(item => item.id === selectedId);
    tree.replaceChildren(level(null));
    document.getElementById('bc-demo-path').textContent = path(selectedId).map(item => item.q).join(' → ');
    document.getElementById('bc-demo-question').textContent = node.q;
    document.getElementById('bc-demo-answer').textContent = node.a;
  }
  form.addEventListener('submit', event => { event.preventDefault(); add(selectedId, input.value); });
  document.getElementById('bc-reset').addEventListener('click', () => { nodes = initial(); selectedId = 'root'; nextId = 1; input.value = ''; render(); status.textContent = '已重置示意。试试从同一回答创建两个不同分支。'; });
  render();
})();
