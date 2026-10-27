(() => {
  const search = document.getElementById('prototype-search');
  if (!search) return;
  const cards = [...document.querySelectorAll('.prototype-tile')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  let category = 'all';
  function render() {
    const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const card of cards) {
      const matches = (category === 'all' || card.dataset.category === category)
        && terms.every(term => card.dataset.search.toLocaleLowerCase().includes(term));
      card.hidden = !matches;
      if (matches) count++;
    }
    document.getElementById('catalog-count').textContent = count + ' 个原型';
    document.getElementById('catalog-empty').hidden = count !== 0;
    for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  }
  search.addEventListener('input', render);
  for (const button of filters) button.addEventListener('click', () => { category = button.dataset.filter; render(); });
  document.getElementById('catalog-reset').addEventListener('click', () => { search.value = ''; category = 'all'; render(); search.focus(); });
  render();
})();
