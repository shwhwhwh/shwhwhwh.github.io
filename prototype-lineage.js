(() => {
  const hosts = [...document.querySelectorAll('[data-lineage]')];
  if (!hosts.length) return;
  const repoPattern = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
  const shaPattern = /^[a-f0-9]{40}$/;
  const licenseLabel = value => value === 'LicenseRef-Prototype-Plan-Personal-Noncommercial-1.0' ? '保留权利 · 学习/非商业免费 · 商用另授权' : value;
  const source = 'https://api.github.com/repos/shwhwhwh/prototype-plan/actions/workflows/lineage.yml/runs?branch=main&per_page=10';
  let baseline;
  function safeProjects(data) {
    if (!Array.isArray(data.projects) || data.projects.length > 150) throw Error('Invalid registry');
    const ids = new Map(), repos = new Set();
    for (const p of data.projects) {
      if (!/^[a-z][a-z0-9-]{1,70}$/.test(p.id) || ids.has(p.id) || !repoPattern.test(p.repository)
        || !shaPattern.test(p.commit) || typeof p.owner !== 'string' || p.owner.length > 160
        || typeof p.name !== 'string' || p.name.length > 100 || typeof p.license !== 'string'
        || !(p.parentId === null || typeof p.parentId === 'string') || (p.parentCommit !== undefined && !shaPattern.test(p.parentCommit)) || repos.has(p.repository.toLowerCase())) throw Error('Invalid project');
      ids.set(p.id, p); repos.add(p.repository.toLowerCase());
    }
    for (const p of data.projects) {
      let node = p; const seen = new Set();
      while (node.parentId !== null) {
        if (seen.has(node.id)) throw Error('Cycle'); seen.add(node.id);
        node = ids.get(node.parentId); if (!node) throw Error('Missing parent');
      }
      if (!['research-nexus', 'branch-canvas'].includes(node.id)) throw Error('Unknown original');
    }
    return data.projects;
  }
  const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
  const svgEl = (tag, attrs) => { const node = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value); return node; };
  const readableTime = value => { const time = new Date(value); return Number.isFinite(time.getTime()) ? time.toLocaleString('zh-CN', { hour12: false }) : '未取得时间'; };
  function paint(host, report, mode) {
    const active = host.querySelector('.lineage-filter')?.value || host.dataset.root || 'all';
    const projects = safeProjects(report);
    const accepted = new Map(projects.filter(p => p.status === 'passed').map(p => [p.id, p]));
    const selected = projects.filter(p => {
      if (!accepted.has(p.id)) return false;
      let root = p;
      while (root.parentId) { root = accepted.get(root.parentId); if (!root) return false; }
      return active === 'all' || root.id === active;
    });
    const status = host.querySelector('.lineage-status');
    status.textContent = mode === 'live' ? `自动检查通过 · ${readableTime(report.checkedAt)}`
      : `${report.automationState === 'awaiting-workflow-authorization' ? '自动检查待授权启用 · ' : ''}人工核验快照 · ${readableTime(report.checkedAt)} · 暂不展示未经实时确认的衍生项目`;
    host.dataset.mode = mode;
    const roots = selected.filter(p => p.parentId === null), nodes = new Map(selected.map(p => [p.id, { ...p, children: [] }]));
    for (const node of nodes.values()) if (node.parentId && nodes.has(node.parentId)) nodes.get(node.parentId).children.push(node);
    const forest = roots.map(p => nodes.get(p.id));
    const treeRoot = active === 'all' ? { id: 'prototype-plan', name: 'Prototype Plan', repository: 'https://github.com/shwhwhwh/prototype-plan', owner: 'Rui Li (@shwhwhwh)', children: forest, hub: true } : forest[0];
    let leaves = 0, maxDepth = 0; const placed = [];
    function locate(node, depth) {
      maxDepth = Math.max(maxDepth, depth);
      for (const child of node.children) locate(child, depth + 1);
      node.x = node.children.length ? node.children.reduce((sum, child) => sum + child.x, 0) / node.children.length : 145 + leaves++ * 250;
      node.depth = depth; placed.push(node);
    }
    if (treeRoot) locate(treeRoot, 0);
    const width = Math.max(740, leaves * 250 + 40), height = Math.max(360, (maxDepth + 1) * 145 + 95);
    if (leaves <= 2) for (const node of placed) node.x += (width - (leaves * 250 + 40)) / 2;
    for (const node of placed) node.y = height - 75 - node.depth * 145;
    const stage = host.querySelector('.lineage-stage'); stage.replaceChildren(); stage.style.width = width + 'px'; stage.style.height = height + 'px';
    const svg = svgEl('svg', { viewBox: `0 0 ${width} ${height}`, width, height, 'aria-hidden': 'true', class: 'lineage-branches' });
    if (treeRoot) {
      const x = treeRoot.x, y = treeRoot.y;
      svg.append(svgEl('path', { d: `M${x} ${height} C${x - 18} ${height - 35} ${x + 7} ${y + 40} ${x} ${y}`, class: 'lineage-trunk' }));
      // Decorative twigs are not project nodes. Only labeled cards represent registered projects.
      for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
        const dy = i * 30;
        svg.append(svgEl('path', { d: `M${x} ${height - 35 - dy} C${x + side * 20} ${height - 75 - dy} ${x + side * (105 + i * 20)} ${height - 60 - dy} ${x + side * (130 + i * 20)} ${height - 100 - dy}`, class: 'lineage-twig' }));
      }
    }
    for (const node of placed) for (const child of node.children) svg.append(svgEl('path', {
      d: `M${node.x} ${node.y - 27} C${node.x} ${node.y - 90} ${child.x} ${child.y + 85} ${child.x} ${child.y + 30}`,
      class: 'lineage-branch', 'stroke-width': Math.max(1.3, 4 - node.depth * .65)
    }));
    stage.append(svg);
    for (const node of placed) {
      const link = el('a', 'lineage-node' + (node.hub ? ' lineage-hub' : node.parentId === null ? ' lineage-original' : ' lineage-derived'));
      link.href = node.repository; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.style.left = node.x + 'px'; link.style.top = node.y + 'px';
      link.setAttribute('aria-label', `访问 ${node.name} 仓库（新标签页）`);
      link.append(el('span', 'lineage-node-kind', node.hub ? '原型的共同入口' : node.parentId === null ? '原始原型' : '已登记衍生项目'), el('strong', '', node.name), el('small', '', node.hub ? '让想法继续生长 ↗' : node.owner + ' ↗'));
      stage.append(link);
    }
    const list = host.querySelector('.lineage-project-list'); list.replaceChildren();
    for (const p of selected) {
      const item = el('li'), link = el('a', '', p.name + ' ↗'); link.href = p.repository; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const sourceVersion = p.parentId ? ' · 来源 ' + (p.parentCommit || nodes.get(p.parentId).commit).slice(0, 7) : '';
      item.append(link, el('span', '', p.owner + ' · ' + licenseLabel(p.license) + ' · ' + (p.parentId ? '衍生自 ' + nodes.get(p.parentId).name : '原始原型') + sourceVersion)); list.append(item);
    }
    const derivatives = selected.filter(p => p.parentId !== null).length;
    host.querySelector('.lineage-count').textContent = `${roots.length} 个原型 · ${derivatives} 个已登记衍生项目`;
    host.querySelector('.lineage-empty').hidden = derivatives > 0;
    const scroll = host.querySelector('.lineage-scroll'); scroll.scrollLeft = Math.max(0, (width - scroll.clientWidth) / 2);
    const evidence = host.querySelector('.lineage-evidence'); evidence.href = report.runUrl || 'https://github.com/shwhwhwh/prototype-plan/actions';
    host._lineageReport = report; host._lineageMode = mode;
  }
  async function json(url) {
    const response = await fetch(url, { credentials: 'omit', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) { const error = Error('Read unavailable'); error.status = response.status; throw error; } return response.json();
  }
  async function refresh() {
    for (const host of hosts) host.querySelector('.lineage-refresh').disabled = true;
    try {
      if (!baseline) {
        baseline = await json('/assets/prototypes/lineage.json'); safeProjects(baseline);
      }
      const snapshot = { ...baseline, projects: baseline.projects.filter(p => p.parentId === null) };
      for (const host of hosts) paint(host, snapshot, 'snapshot');
      const runs = await json(source);
      const run = runs.workflow_runs?.find(run => run.head_branch === 'main' && ['push', 'schedule', 'workflow_dispatch'].includes(run.event));
      if (!run || run.status !== 'completed' || run.conclusion !== 'success' || !shaPattern.test(run.head_sha)
        || Date.now() - new Date(run.updated_at).getTime() > 50 * 3600000 || new Date(run.updated_at).getTime() > Date.now() + 300000) throw Error('No current passed check');
      const registry = await json(`https://raw.githubusercontent.com/shwhwhwh/prototype-plan/${run.head_sha}/projects.json`);
      if (![2, 3].includes(registry.schemaVersion)) throw Error('Unsupported registry');
      const projects = safeProjects(registry);
      for (const original of snapshot.projects) {
        const entry = projects.find(p => p.id === original.id);
        if (!entry || entry.parentId !== null || entry.repository !== original.repository || entry.owner !== original.owner
          || entry.license !== original.license || entry.commit !== original.commit) throw Error('Original anchor mismatch');
      }
      const report = { checkedAt: run.updated_at, runUrl: `https://github.com/shwhwhwh/prototype-plan/actions/runs/${Number(run.id)}`,
        projects: projects.map(p => ({ ...p, status: 'passed' })) };
      for (const host of hosts) paint(host, report, 'live');
    } catch (error) {
      console.warn('Prototype Plan lineage refresh fallback:', error.message, error.status || 'network');
      if (!baseline) for (const host of hosts) host.querySelector('.lineage-status').textContent = '暂时无法读取来源数据；请使用下方登记与检查链接。';
      else if (error.status === 404) for (const host of hosts) host.querySelector('.lineage-status').textContent = `自动检查待启用 · 人工核验 ${readableTime(baseline.checkedAt)} · 衍生节点暂不展示`;
    } finally { for (const host of hosts) host.querySelector('.lineage-refresh').disabled = false; }
  }
  for (const host of hosts) {
    host.querySelector('.lineage-refresh').addEventListener('click', refresh);
    host.querySelector('.lineage-filter')?.addEventListener('change', () => { if (host._lineageReport) paint(host, host._lineageReport, host._lineageMode); });
  }
  refresh();
})();
