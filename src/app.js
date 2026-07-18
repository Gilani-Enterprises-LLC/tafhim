const STORAGE_KEYS = {
  theme: 'tafaTheme',
  language: 'tafaLanguage',
  history: 'audioHistory',
  lastPlayed: 'lastPlayedAudioId'
};

const I18N = {
  en: {
    appTitle: 'Tafheem-ul-Quran',
    eyebrow: 'Modernized clone',
    heroTitle: 'Tafheem-ul-Quran',
    heroText: 'A clean, mobile-first listening experience with resume history, last-played recovery, and a bilingual English/Urdu interface.',
    languageLabel: 'Language',
    openOriginal: 'Open original',
    lastPlayedLabel: 'Last played',
    historyLabel: 'History',
    historyHelp: 'Stored only in this browser via localStorage.',
    searchLabel: 'Search',
    searchPlaceholder: 'Search by volume, surah, or title',
    resumeTitle: 'Resume where you left off',
    resumeButton: 'Jump to last audio',
    nowSelected: 'Now selected',
    nothingYet: 'Nothing yet',
    pickAny: 'Pick any audio to start tracking locally.',
    allVolumes: 'All volumes',
    historyItems: (count) => `${count} item${count === 1 ? '' : 's'}`,
    noMatchesTitle: 'Try a broader search',
    noMatchesText: 'Search by title, slug, or volume.',
    noMatchesKicker: 'No matches',
    loadError: 'Could not load audio records',
    loadErrorKicker: 'Load error',
    chooseAudio: 'Choose an audio',
    playerHelp: 'Your place and history stay in this browser.',
    playHere: 'Play here',
    surah: 'Surah',
    preface: 'Preface',
    introduction: 'Introduction'
  },
  ur: {
    appTitle: 'تفہیم القرآن',
    eyebrow: 'جدید انداز',
    heroTitle: 'تفہیم القرآن',
    heroText: 'موبائل فرسٹ، آسان اور خوب صورت تجربہ جس میں سننے کی ہسٹری، آخری آڈیو سے دوبارہ آغاز، اور انگریزی/اردو زبان کی سہولت شامل ہے۔',
    languageLabel: 'زبان',
    openOriginal: 'اصل ویب سائٹ',
    lastPlayedLabel: 'آخری سنی گئی آڈیو',
    historyLabel: 'ہسٹری',
    historyHelp: 'یہ معلومات صرف اسی براؤزر کے localStorage میں محفوظ ہوتی ہیں۔',
    searchLabel: 'تلاش',
    searchPlaceholder: 'جلد، سورت یا عنوان سے تلاش کریں',
    resumeTitle: 'جہاں چھوڑا تھا وہیں سے دوبارہ شروع کریں',
    resumeButton: 'آخری آڈیو پر جائیں',
    nowSelected: 'اب منتخب',
    nothingYet: 'ابھی کچھ نہیں',
    pickAny: 'لوکل ٹریکنگ شروع کرنے کے لیے کوئی بھی آڈیو منتخب کریں۔',
    allVolumes: 'تمام جلدیں',
    historyItems: (count) => `${count} آئٹمز`,
    noMatchesTitle: 'ذرا وسیع تلاش آزمائیں',
    noMatchesText: 'عنوان، سلگ یا جلد کے نام سے تلاش کریں۔',
    noMatchesKicker: 'کوئی نتیجہ نہیں',
    loadError: 'آڈیو ریکارڈ لوڈ نہیں ہو سکے',
    loadErrorKicker: 'لوڈ ایرر',
    chooseAudio: 'کوئی آڈیو منتخب کریں',
    playerHelp: 'آپ کی جگہ اور ہسٹری اسی براؤزر میں محفوظ رہے گی۔',
    playHere: 'یہاں چلائیں',
    surah: 'سورۃ',
    preface: 'دیباچہ',
    introduction: 'مقدمہ'
  }
};

const state = {
  audios: [],
  volume: 'all',
  query: '',
  language: localStorage.getItem(STORAGE_KEYS.language) || 'en',
  history: JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]'),
  lastPlayedAudioId: localStorage.getItem(STORAGE_KEYS.lastPlayed) || '',
  currentAudio: null
};

const els = {
  themeToggle: document.querySelector('#theme-toggle'),
  languageSelect: document.querySelector('#language-select'),
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

function t(key, ...args) {
  const value = I18N[state.language][key];
  return typeof value === 'function' ? value(...args) : value;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  els.themeToggle.textContent = theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode';
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

function bootTheme() {
  applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || 'dark');
}

function applyLanguage(language) {
  state.language = language;
  localStorage.setItem(STORAGE_KEYS.language, language);
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  document.body.classList.toggle('lang-urdu', language === 'ur');
  els.languageSelect.value = language;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.title = t('appTitle');
  els.searchInput.placeholder = t('searchPlaceholder');
}

function parseXmlRecord(node) {
  return {
    id: node.getAttribute('id'),
    volume: node.parentElement.getAttribute('id'),
    volumeLabel: node.parentElement.getAttribute('label'),
    volumeLabelUrdu: node.parentElement.getAttribute('labelUrdu') || node.parentElement.getAttribute('label'),
    order: node.getAttribute('order'),
    slug: node.getAttribute('slug'),
    title: node.getAttribute('title'),
    titleUrdu: node.getAttribute('titleUrdu') || node.getAttribute('title'),
    description: node.getAttribute('description') || node.getAttribute('title'),
    descriptionUrdu: node.getAttribute('descriptionUrdu') || node.getAttribute('titleUrdu') || node.getAttribute('title'),
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

function audioTitle(audio) {
  return state.language === 'ur' ? audio.titleUrdu : audio.title;
}

function audioDescription(audio) {
  return state.language === 'ur' ? audio.descriptionUrdu : audio.description;
}

function audioVolumeLabel(audio) {
  return state.language === 'ur' ? audio.volumeLabelUrdu : audio.volumeLabel;
}

function filteredAudios() {
  const q = state.query.trim().toLowerCase();
  return state.audios.filter((audio) => {
    const inVolume = state.volume === 'all' || audio.volume === state.volume;
    const haystack = `${audio.title} ${audio.titleUrdu} ${audio.description} ${audio.descriptionUrdu} ${audio.slug} ${audio.volumeLabel} ${audio.volumeLabelUrdu}`.toLowerCase();
    return inVolume && (!q || haystack.includes(q));
  });
}

function updateStatus() {
  els.historyCount.textContent = t('historyItems', state.history.length);
  const lastAudio = state.audios.find((item) => item.id === state.lastPlayedAudioId);
  if (!lastAudio) {
    els.lastPlayedTitle.textContent = t('nothingYet');
    els.lastPlayedMeta.textContent = t('pickAny');
    els.resumeBanner.classList.add('hidden');
    return;
  }
  els.lastPlayedTitle.textContent = audioTitle(lastAudio);
  els.lastPlayedMeta.textContent = `${audioVolumeLabel(lastAudio)} • ${audioDescription(lastAudio)}`;
  els.resumeText.textContent = `${audioVolumeLabel(lastAudio)} — ${audioTitle(lastAudio)}`;
  els.resumeBanner.classList.remove('hidden');
}

function renderVolumeFilters() {
  const volumes = ['all', ...new Set(state.audios.map((audio) => audio.volume))];
  els.volumeFilters.innerHTML = '';
  volumes.forEach((volume) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip${state.volume === volume ? ' active' : ''}`;
    button.textContent = volume === 'all' ? t('allVolumes') : (state.language === 'ur' ? `جلد ${volume.replace('volume', '')}` : volume.replace('volume', 'Volume '));
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
  els.nowPlayingTitle.textContent = audioTitle(audio);
  els.nowPlayingMeta.textContent = `${audioVolumeLabel(audio)} • ${audioDescription(audio)}`;
  persistPlayback(audio);
  if (shouldScroll) {
    document.querySelector(`[data-audio-id="${CSS.escape(audio.id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function renderAudios() {
  const list = filteredAudios();
  els.audioList.innerHTML = '';
  if (!list.length) {
    els.audioList.innerHTML = `<article class="audio-card"><div class="audio-card__body"><div><p class="audio-kicker">${t('noMatchesKicker')}</p><h2>${t('noMatchesTitle')}</h2><p class="audio-meta">${t('noMatchesText')}</p></div></div></article>`;
    return;
  }
  list.forEach((audio) => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.dataset.audioId = audio.id;
    if (audio.id === state.lastPlayedAudioId) node.classList.add('is-last-played');
    node.querySelector('.audio-kicker').textContent = `${audioVolumeLabel(audio)} • ${audio.order}`;
    node.querySelector('h2').textContent = audioTitle(audio);
    node.querySelector('h2').classList.toggle('urdu-text', state.language === 'ur');
    node.querySelector('.audio-meta').textContent = `${audioDescription(audio)} • ${audio.file}`;
    node.querySelector('.audio-meta').classList.toggle('urdu-text', state.language === 'ur');
    node.querySelector('.play-button').textContent = t('playHere');
    node.querySelector('.play-button').addEventListener('click', () => selectAudio(audio, false));
    els.audioList.appendChild(node);
  });
}

function attachEvents() {
  els.themeToggle.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  els.languageSelect.addEventListener('change', (event) => {
    applyLanguage(event.target.value);
    updateStatus();
    renderVolumeFilters();
    renderAudios();
    if (state.currentAudio) selectAudio(state.currentAudio, false);
  });
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
  applyLanguage(state.language);
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
  } else {
    els.nowPlayingTitle.textContent = t('chooseAudio');
    els.nowPlayingMeta.textContent = t('playerHelp');
  }
}

init().catch((error) => {
  console.error(error);
  els.audioList.innerHTML = `<article class="audio-card"><div class="audio-card__body"><div><p class="audio-kicker">${t('loadErrorKicker')}</p><h2>${t('loadError')}</h2><p class="audio-meta">${error.message}</p></div></div></article>`;
});
