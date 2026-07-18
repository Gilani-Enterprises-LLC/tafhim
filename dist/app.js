const STORAGE_KEYS = {
  theme: 'tafaTheme',
  history: 'audioHistory',
  lastPlayed: 'lastPlayedAudioId'
};

const state = {
  audios: [],
  volume: 'all',
  query: '',
  history: JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]'),
  lastPlayedAudioId: localStorage.getItem(STORAGE_KEYS.lastPlayed) || '',
  currentAudio: null
};

const els = {
  themeToggle: document.querySelector('#theme-toggle'),
  searchInput: document.querySelector('#search-input'),
  volumeFilters: document.querySelector('#volume-filters'),
  audioList: document.querySelector('#audio-list'),
  template: document.querySelector('#audio-card-template'),
  player: document.querySelector('#global-player'),
  nowPlayingTitle: document.querySelector('#now-playing-title'),
  nowPlayingMeta: document.querySelector('#now-playing-meta'),
  lastPlayedTitle: document.querySelector('#last-played-title'),
  lastPlayedMeta: document.querySelector('#last-played-meta'),
  historyCount: document.querySelector('#history-count'),
  resumeBanner: document.querySelector('#resume-banner'),
  resumeText: document.querySelector('#resume-text'),
  resumeButton: document.querySelector('#resume-button')
};

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  els.themeToggle.textContent = theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode';
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

function bootTheme() {
  applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || 'dark');
}

function parseXmlRecord(node) {
  return {
    id: node.getAttribute('id'),
    volume: node.parentElement.getAttribute('id'),
    volumeLabel: node.parentElement.getAttribute('label'),
    order: node.getAttribute('order'),
    slug: node.getAttribute('slug'),
    title: node.getAttribute('title'),
    file: node.getAttribute('file'),
    url: node.getAttribute('url')
  };
}

async function loadAudios() {
  const response = await fetch('./audios.xml');
  const xmlText = await response.text();
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  state.audios = [...xml.querySelectorAll('audio')].map(parseXmlRecord);
}

function filteredAudios() {
  const q = state.query.trim().toLowerCase();
  return state.audios.filter((audio) => {
    const inVolume = state.volume === 'all' || audio.volume === state.volume;
    const inQuery = !q || `${audio.title} ${audio.slug} ${audio.volumeLabel}`.toLowerCase().includes(q);
    return inVolume && inQuery;
  });
}

function updateStatus() {
  els.historyCount.textContent = `${state.history.length} item${state.history.length === 1 ? '' : 's'}`;
  const lastAudio = state.audios.find((item) => item.id === state.lastPlayedAudioId);
  if (!lastAudio) {
    els.lastPlayedTitle.textContent = 'Nothing yet';
    els.lastPlayedMeta.textContent = 'Pick any audio to start tracking locally.';
    els.resumeBanner.classList.add('hidden');
    return;
  }
  els.lastPlayedTitle.textContent = lastAudio.title;
  els.lastPlayedMeta.textContent = `${lastAudio.volumeLabel} • ${lastAudio.file}`;
  els.resumeText.textContent = `${lastAudio.volumeLabel} — ${lastAudio.title}`;
  els.resumeBanner.classList.remove('hidden');
}

function renderVolumeFilters() {
  const volumes = ['all', ...new Set(state.audios.map((audio) => audio.volume))];
  els.volumeFilters.innerHTML = '';
  volumes.forEach((volume) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip${state.volume === volume ? ' active' : ''}`;
    button.textContent = volume === 'all' ? 'All volumes' : volume.replace('volume', 'Volume ');
    button.addEventListener('click', () => {
      state.volume = volume;
      renderVolumeFilters();
      renderAudios();
    });
    els.volumeFilters.appendChild(button);
  });
}

function persistPlayback(audio) {
  state.lastPlayedAudioId = audio.id;
  localStorage.setItem(STORAGE_KEYS.lastPlayed, audio.id);
  state.history = [audio.id, ...state.history.filter((id) => id !== audio.id)].slice(0, 24);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history));
  updateStatus();
  renderAudios();
}

function selectAudio(audio, shouldScroll = false) {
  state.currentAudio = audio;
  els.player.src = audio.url;
  els.player.dataset.audioId = audio.id;
  els.nowPlayingTitle.textContent = audio.title;
  els.nowPlayingMeta.textContent = `${audio.volumeLabel} • ${audio.file}`;
  persistPlayback(audio);
  if (shouldScroll) {
    document.querySelector(`[data-audio-id="${CSS.escape(audio.id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function renderAudios() {
  const list = filteredAudios();
  els.audioList.innerHTML = '';
  if (!list.length) {
    els.audioList.innerHTML = '<article class="audio-card"><div class="audio-card__body"><div><p class="audio-kicker">No matches</p><h2>Try a broader search</h2><p class="audio-meta">Search by title, slug, or volume.</p></div></div></article>';
    return;
  }
  list.forEach((audio) => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.dataset.audioId = audio.id;
    if (audio.id === state.lastPlayedAudioId) node.classList.add('is-last-played');
    node.querySelector('.audio-kicker').textContent = `${audio.volumeLabel} • ${audio.order}`;
    node.querySelector('h2').textContent = audio.title;
    node.querySelector('.audio-meta').textContent = `${audio.file} • Anonymous access static clone`;
    node.querySelector('.play-button').addEventListener('click', () => selectAudio(audio, false));
    els.audioList.appendChild(node);
  });
}

function attachEvents() {
  els.themeToggle.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  els.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderAudios();
  });
  els.player.addEventListener('play', () => {
    const audio = state.audios.find((item) => item.id === els.player.dataset.audioId);
    if (audio) persistPlayback(audio);
  });
  els.resumeButton.addEventListener('click', () => {
    const audio = state.audios.find((item) => item.id === state.lastPlayedAudioId);
    if (audio) {
      state.volume = audio.volume;
      renderVolumeFilters();
      renderAudios();
      selectAudio(audio, true);
    }
  });
}

async function init() {
  bootTheme();
  attachEvents();
  await loadAudios();
  updateStatus();
  renderVolumeFilters();
  renderAudios();
  const lastAudio = state.audios.find((item) => item.id === state.lastPlayedAudioId);
  if (lastAudio) {
    state.volume = lastAudio.volume;
    renderVolumeFilters();
    renderAudios();
    selectAudio(lastAudio, true);
  }
}

init().catch((error) => {
  console.error(error);
  els.audioList.innerHTML = `<article class="audio-card"><div class="audio-card__body"><div><p class="audio-kicker">Load error</p><h2>Could not load audio records</h2><p class="audio-meta">${error.message}</p></div></div></article>`;
});
