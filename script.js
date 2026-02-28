// ==================== СТАН ДОДАТКУ ====================
let chatsData = [];
try {
    const rawData = localStorage.getItem('todolist_chats');
    if (rawData) chatsData = JSON.parse(rawData);
    if (!Array.isArray(chatsData) || chatsData.length === 0) throw new Error("No valid chats");
} catch (e) {
    chatsData = [{ id: 'chat_' + Date.now(), name: 'Chat 1', todos: [] }];
    try {
        const oldTodos = JSON.parse(localStorage.getItem('todos'));
        if (Array.isArray(oldTodos) && oldTodos.length > 0) chatsData[0].todos = oldTodos; 
    } catch (oldErr) {}
    localStorage.setItem('todolist_chats', JSON.stringify(chatsData));
}

let activeChatId = localStorage.getItem('todolist_active_chat');
if (!activeChatId || !chatsData.find(c => c.id === activeChatId)) {
    activeChatId = chatsData[0].id;
    localStorage.setItem('todolist_active_chat', activeChatId);
}

let globalToastZIndex = 4000;
let pendingImages = [];
let sortableInstance = null; 

// ==================== МАСИВ МАТОВИХ ТЕМ ====================
const solidThemesColors = {
    'theme-51': '#1A2421', 'theme-52': '#24332D', 'theme-53': '#1B262C', 'theme-54': '#0F172A', 'theme-55': '#2E1F27', 'theme-56': '#3E2723', 'theme-57': '#1B1B1B', 'theme-58': '#2F4F4F', 'theme-59': '#4A4036', 'theme-60': '#36454F', 'theme-61': '#2C3539', 'theme-62': '#343434', 'theme-63': '#28282B', 'theme-64': '#3D2B1F', 'theme-65': '#4B3621', 'theme-66': '#191C20', 'theme-67': '#232B2B', 'theme-68': '#353839', 'theme-69': '#252850', 'theme-70': '#123524', 'theme-71': '#1A1110', 'theme-72': '#212121', 'theme-73': '#2C2C2B', 'theme-74': '#181A18', 'theme-75': '#2A2A35',
    'theme-76': '#F7E7CE', 'theme-77': '#F5F5DC', 'theme-78': '#FAF0E6', 'theme-79': '#FFF8DC', 'theme-80': '#FFE4C4', 'theme-81': '#F5DEB3', 'theme-82': '#FFFACD', 'theme-83': '#F0E68C', 'theme-84': '#EEDD82', 'theme-85': '#D2B48C', 'theme-86': '#DEB887', 'theme-87': '#F5F5F5', 'theme-88': '#E8E4C9', 'theme-89': '#E3DAC9', 'theme-90': '#EADDCD', 'theme-91': '#F2E3C6', 'theme-92': '#E6D6B8', 'theme-93': '#D9C5A0', 'theme-94': '#CFC291', 'theme-95': '#E8E0D5', 'theme-96': '#F3E5AB', 'theme-97': '#F4E2C6', 'theme-98': '#EFE4D1', 'theme-99': '#EAD8C3', 'theme-100': '#E6DFD3'
};

function hexToRgb(hex) {
    let h = hex.replace('#', '');
    if(h.length === 3) h = h.split('').map(c => c+c).join('');
    return `${parseInt(h.substring(0,2),16)}, ${parseInt(h.substring(2,4),16)}, ${parseInt(h.substring(4,6),16)}`;
}

// ==================== МОВИ ТА ТЕМИ ====================
const languageManager = {
    currentLang: 'en',
    translations: {
        en: { appTitle: "Todo list", searchPlaceholder: "Search...", placeholder: "Write a message...", shareToggle: "Shared access", shareTitle: "Shared access", yourId: "Your ID:", connectFriend: "Connect to friend:", friendIdPlaceholder: "Enter friend's ID", copyButton: "Copy", connected: "<i class='ph ph-check-circle'></i> Connected!", copied: "<i class='ph ph-copy'></i> ID copied!", disconnected: "<i class='ph ph-x-circle'></i> Disconnected", darkMode: "Dark mode", staticBg: "Static background", liquidGlass: "Liquid glass", langBtn: "Language", themeBtn: "Other themes", themeDefault: "Default", deleteChat: "Delete", ttSettings: "Settings", ttTitleEdit: "Click to edit title", ttAddPhoto: "Add photo", ttSend: "Send", ttConnect: "Connect", ttDisconnect: "Disconnect", ttCopy: "Copy ID", ttEditTodo: "Edit", ttSaveTodo: "Save", ttDeleteTodo: "Delete", ttNewChat: "New chat", chatLimit: "Max 20 chats", photoLimit: "Max 8 photos!", ttClose: "Close", themeChanged: "<i class='ph ph-palette'></i> Theme changed", langChanged: "<i class='ph ph-translate'></i> Language changed", ttDrag: "Drag to reorder", ttToggle: "Toggle", ttLang: "Choose language", ttTheme: "Choose theme", ttShareMenu: "Connection menu", ttPin: "Pin", msgPinned: "<i class='ph-fill ph-push-pin'></i> Pinned", msgUnpinned: "<i class='ph ph-push-pin-slash'></i> Unpinned", shareChoiceTitle: "Connection type", shareNew: "Create new shared chat", shareCurrent: "Continue in current" },
        uk: { appTitle: "Todo list", searchPlaceholder: "Пошук...", placeholder: "Написати повідомлення...", shareToggle: "Спільний доступ", shareTitle: "Спільний доступ", yourId: "Твій ID:", connectFriend: "Підключитись до друга:", friendIdPlaceholder: "Введіть ID друга", copyButton: "Копіювати", connected: "<i class='ph ph-check-circle'></i> Підключено!", copied: "<i class='ph ph-copy'></i> ID скопійовано!", disconnected: "<i class='ph ph-x-circle'></i> Відключено", darkMode: "Темний режим", staticBg: "Статичний фон", liquidGlass: "Liquid glass", langBtn: "Мова", themeBtn: "Інші теми", themeDefault: "За замовчуванням", deleteChat: "Видалити", ttSettings: "Налаштування", ttTitleEdit: "Натисніть, щоб змінити назву", ttAddPhoto: "Додати фото", ttSend: "Відправити", ttConnect: "Підключити", ttDisconnect: "Відключити", ttCopy: "Копіювати ID", ttEditTodo: "Редагувати", ttSaveTodo: "Зберегти", ttDeleteTodo: "Видалити", ttNewChat: "Новий чат", chatLimit: "Максимум 20 чатів", photoLimit: "Максимум 8 фото!", ttClose: "Закрити", themeChanged: "<i class='ph ph-palette'></i> Тему змінено", langChanged: "<i class='ph ph-translate'></i> Мову змінено", ttDrag: "Перетягніть", ttToggle: "Перемкнути", ttLang: "Вибрати мову", ttTheme: "Вибрати тему", ttShareMenu: "Меню підключення", ttPin: "Закріпити", msgPinned: "<i class='ph-fill ph-push-pin'></i> Закріплено", msgUnpinned: "<i class='ph ph-push-pin-slash'></i> Відкріплено", shareChoiceTitle: "Тип підключення", shareNew: "Створити новий чат", shareCurrent: "Продовжити в поточному" },
        ru: { appTitle: "Todo list", searchPlaceholder: "Поиск...", placeholder: "Написать сообщение...", shareToggle: "Совместный доступ", shareTitle: "Совместный доступ", yourId: "Ваш ID:", connectFriend: "Подключиться к другу:", friendIdPlaceholder: "Введите ID друга", copyButton: "Копировать", connected: "<i class='ph ph-check-circle'></i> Подключено!", copied: "<i class='ph ph-copy'></i> ID скопирован!", disconnected: "<i class='ph ph-x-circle'></i> Отключено", darkMode: "Темный режим", staticBg: "Статичный фон", liquidGlass: "Liquid glass", langBtn: "Язык", themeBtn: "Другие темы", themeDefault: "По умолчанию", deleteChat: "Удалить", ttSettings: "Настройки", ttTitleEdit: "Нажмите, чтобы изменить", ttAddPhoto: "Добавить фото", ttSend: "Отправить", ttConnect: "Подключиться", ttDisconnect: "Отключиться", ttCopy: "Копировать ID", ttEditTodo: "Изменить", ttSaveTodo: "Сохранить", ttDeleteTodo: "Удалить", ttNewChat: "Новый чат", chatLimit: "Максимум 20 чатов", photoLimit: "Максимум 8 фото!", ttClose: "Закрыть", themeChanged: "<i class='ph ph-palette'></i> Тема изменена", langChanged: "<i class='ph ph-translate'></i> Язык изменен", ttDrag: "Перетащите", ttToggle: "Переключить", ttLang: "Выбрать язык", ttTheme: "Выбрать тему", ttShareMenu: "Меню подключения", ttPin: "Закрепить", msgPinned: "<i class='ph-fill ph-push-pin'></i> Закреплено", msgUnpinned: "<i class='ph ph-push-pin-slash'></i> Откреплено", shareChoiceTitle: "Тип подключения", shareNew: "Создать новый чат", shareCurrent: "Продолжить в текущем" }
    },

    init() {
        this.loadSavedLanguage(); this.setupSettingsMenu(); this.renderThemeMenu(); this.loadSavedTheme(); this.highlightSelectedLanguage();
    },

    renderThemeMenu() {
        const isLiquid = document.body.classList.contains('liquid-glass'); const list = document.getElementById('themeList'); if (!list) return;
        let html = `<button data-theme="default" class="selected"><div class="theme-preview default ${isLiquid ? 'liquid' : 'solid'}"></div><span class="theme-name">Default</span></button>`;
        if (isLiquid) {
            const names = ["Ocean Blue", "Fire Orange", "Blood Red", "Deep Purple", "Mint Green", "Neon Pink", "Amethyst", "Galaxy", "Spring Grass", "Toxic Green", "Sunset", "Peach Rose", "Steel Gray", "Midnight Blue", "Coral Reef", "Cyberpunk", "Cotton Candy", "Warm Sun", "Ice Water", "Lavender", "Pastel Peach", "Cloud White", "Frost Rose", "Winter Sky", "Crystal Violet", "Neon Fuchsia", "Cyan Breeze", "Emerald Glow", "Lemonade", "Royal Indigo", "Summer Sky", "Deep Teal", "Crimson Tide", "Electric Violet", "Magenta Pop", "Azure Flow", "Pearl White", "Bright Sapphire", "Forest Emerald", "Bubblegum", "Aqua Marine", "Soft Lilac", "Golden Sand", "Deep Amethyst", "Clear Sky", "Rose Gold", "Volcano", "Lime Neon", "Purple Velvet", "Pure Black"];
            for(let i=1; i<=50; i++) html += `<button data-theme="theme-${i}"><div class="theme-preview liquid t${i}"></div> ${names[i-1]}</button>`;
        } else {
            const darkNames = ["Deep Forest", "Pine Needle", "Dark Navy", "Midnight Slate", "Dark Plum", "Espresso", "Charcoal", "Swamp Green", "Muddy Wood", "Storm Grey", "Iron", "Graphite", "Black Onyx", "Dark Oak", "Roasted Bean", "Obsidian", "Deep Olive", "Carbon", "Night Sky", "Jungle", "Dark Earth", "Matte Black", "Ash", "Deep Moss", "Vintage Leather"];
            for(let i=51; i<=75; i++) html += `<button data-theme="theme-${i}"><div class="theme-preview solid t${i}" style="background-color: ${solidThemesColors['theme-'+i]};"></div> ${darkNames[i-51]}</button>`;
            const lightNames = ["Champagne", "Soft Beige", "Linen", "Cornsilk", "Bisque", "Wheat", "Lemon Chiffon", "Khaki", "Pale Gold", "Tan", "Burlywood", "White Smoke", "Parchment", "Bone", "Alabaster", "Cream", "Sand", "Desert", "Pale Brass", "Oyster", "Vanilla", "Peach Puff", "Cashmere", "Silk", "Pearl"];
            for(let i=76; i<=100; i++) html += `<button data-theme="theme-${i}"><div class="theme-preview solid t${i}" style="background-color: ${solidThemesColors['theme-'+i]};"></div> ${lightNames[i-76]}</button>`;
        }
        list.innerHTML = html;
        const defaultThemeSpan = document.querySelector('.theme-list button[data-theme="default"] .theme-name');
        if (defaultThemeSpan) defaultThemeSpan.textContent = this.getT('themeDefault');
        const savedTheme = isLiquid ? (localStorage.getItem('theme_liquid') || 'default') : (localStorage.getItem('theme_solid') || 'theme-51');
        const selectedBtn = document.querySelector(`.theme-list button[data-theme="${savedTheme}"]`);
        if (selectedBtn) selectedBtn.classList.add('selected');
    },

    setupSettingsMenu() {
        const settingsBtn = document.getElementById('settingsBtn'); const settingsDropdown = document.getElementById('settingsDropdown');
        const langBtn = document.getElementById('langBtn'); const langDropdown = document.getElementById('languageDropdown');
        const themeBtn = document.getElementById('themeBtn'); const themeDropdown = document.getElementById('themeDropdown');
        const shareMenuBtn = document.getElementById('shareMenuBtn'); const shareDropdown = document.getElementById('shareDropdown');
        const searchInput = document.getElementById('langSearch');

        if (!settingsBtn || !settingsDropdown || !langBtn || !langDropdown || !themeBtn || !themeDropdown) return;

        const toggleOverlay = () => { document.body.classList.toggle('menu-open', settingsDropdown.classList.contains('active') || langDropdown.classList.contains('active') || themeDropdown.classList.contains('active') || (shareDropdown && shareDropdown.classList.contains('active'))); };

        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (settingsDropdown.classList.contains('active')) {
                settingsDropdown.classList.remove('active'); [langDropdown, themeDropdown, shareDropdown].forEach(m => { if(m) m.classList.remove('active'); });
            } else { settingsDropdown.classList.add('active'); }
            toggleOverlay();
        });

        const handleSubMenuClick = (e, menuToToggle) => {
            e.stopPropagation();
            const wasActive = menuToToggle.classList.contains('active');
            [langDropdown, themeDropdown, shareDropdown].forEach(m => { if(m && m !== menuToToggle) m.classList.remove('active'); });
            if (!wasActive) menuToToggle.classList.add('active'); else menuToToggle.classList.remove('active');
            settingsDropdown.classList.add('active'); toggleOverlay();
        };

        langBtn.addEventListener('click', (e) => handleSubMenuClick(e, langDropdown));
        themeBtn.addEventListener('click', (e) => handleSubMenuClick(e, themeDropdown));
        if(shareMenuBtn) shareMenuBtn.addEventListener('click', (e) => handleSubMenuClick(e, shareDropdown));

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.settings-menu-container') && !e.target.closest('.solid-dropdown')) {
                const subMenuOpen = langDropdown.classList.contains('active') || themeDropdown.classList.contains('active') || (shareDropdown && shareDropdown.classList.contains('active'));
                if (subMenuOpen) { [langDropdown, themeDropdown, shareDropdown].forEach(m => { if(m) m.classList.remove('active'); }); } 
                else if (settingsDropdown.classList.contains('active')) { settingsDropdown.classList.remove('active'); }
                toggleOverlay();
            }
            if (!e.target.closest('.delete-chat-menu')) removeDeleteMenu();
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => { const term = e.target.value.toLowerCase(); document.querySelectorAll('.language-list button').forEach(btn => { btn.style.display = btn.textContent.toLowerCase().includes(term) ? 'flex' : 'none'; }); });
        }

        const langListContainer = document.getElementById('langList');
        if (langListContainer) { langListContainer.addEventListener('click', (e) => { const btn = e.target.closest('button'); if (btn && btn.dataset.lang) { this.switchLanguage(btn.dataset.lang, true); langDropdown.classList.remove('active'); toggleOverlay(); } }); }

        const themeListContainer = document.getElementById('themeList');
        if (themeListContainer) { themeListContainer.addEventListener('click', (e) => { const btn = e.target.closest('button'); if (btn && btn.dataset.theme) { this.switchTheme(btn.dataset.theme, true); themeDropdown.classList.remove('active'); toggleOverlay(); } }); }

        const setupToggle = (btnId, toggleId, storageKey, action) => {
            const btn = document.getElementById(btnId); const toggle = document.getElementById(toggleId); if (!btn || !toggle) return;
            if (localStorage.getItem(storageKey) === 'true') { toggle.checked = true; btn.classList.add('active-state'); }
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); if(e.target === toggle) return;
                const newState = !toggle.checked; toggle.checked = newState; localStorage.setItem(storageKey, newState);
                if(newState) btn.classList.add('active-state'); else btn.classList.remove('active-state');
                action(newState);
            });
        };

        const toggleStaticBgVisibility = (isLiquid) => { const sb = document.getElementById('staticBgBtn'); if(sb) sb.style.display = isLiquid ? 'flex' : 'none'; };

        setupToggle('darkModeBtn', 'darkModeToggle', 'darkMode', (isDark) => {
            document.body.classList.toggle('dark-mode', isDark);
            this.switchTheme(document.body.classList.contains('liquid-glass') ? (localStorage.getItem('theme_liquid') || 'default') : (localStorage.getItem('theme_solid') || 'theme-51'), false);
        });

        const isLiquid = localStorage.getItem('liquidGlass') !== 'false';
        const liquidToggle = document.getElementById('liquidGlassToggle');
        const liquidBtn = document.getElementById('liquidGlassBtn');
        if(liquidToggle && liquidBtn) {
            liquidToggle.checked = isLiquid; if(isLiquid) liquidBtn.classList.add('active-state');
            document.body.classList.toggle('liquid-glass', isLiquid); toggleStaticBgVisibility(isLiquid);
            
            liquidBtn.addEventListener('click', (e) => {
                e.stopPropagation(); if(e.target === liquidToggle) return;
                const newState = !liquidToggle.checked; liquidToggle.checked = newState; localStorage.setItem('liquidGlass', newState);
                if(newState) liquidBtn.classList.add('active-state'); else liquidBtn.classList.remove('active-state');
                document.body.classList.toggle('liquid-glass', newState); toggleStaticBgVisibility(newState); this.renderThemeMenu(); 
                this.switchTheme(newState ? (localStorage.getItem('theme_liquid') || 'default') : (localStorage.getItem('theme_solid') || 'theme-51'), false);
            });
        }

        setupToggle('staticBgBtn', 'staticBgToggle', 'freezeBg', (isFrozen) => { document.body.style.setProperty('animation-play-state', isFrozen ? 'paused' : 'running', 'important'); });
        if (localStorage.getItem('freezeBg') === 'true') { document.body.style.setProperty('animation-play-state', 'paused', 'important'); }
        if (localStorage.getItem('darkMode') === 'true') { document.body.classList.add('dark-mode'); }
    },

    switchLanguage(lang, showToast = false) {
        if (!this.translations[lang]) lang = 'en'; 
        this.currentLang = lang; this.applyTranslations(); localStorage.setItem('preferredLanguage', lang); this.highlightSelectedLanguage(); renderSidebar(); 
        if (showToast) peerManager.showInd('actionIndicator', this.getT('langChanged'));
    },

    switchTheme(themeName, showToast = false) {
        const isLiquid = document.body.classList.contains('liquid-glass'); const isDarkMode = document.body.classList.contains('dark-mode');
        if (isLiquid) localStorage.setItem('theme_liquid', themeName); else localStorage.setItem('theme_solid', themeName);
        for (let i = 1; i <= 100; i++) document.body.classList.remove('theme-' + i); document.body.classList.remove('theme-default');
        if (themeName !== 'default') document.body.classList.add(themeName); else document.body.classList.add('theme-default');
        
        const lightThemes = ['theme-17', 'theme-18', 'theme-19', 'theme-20', 'theme-21', 'theme-22', 'theme-23', 'theme-24', 'theme-25', 'theme-26', 'theme-28', 'theme-29', 'theme-31', 'theme-37', 'theme-42', 'theme-43', 'theme-45', 'theme-46', 'theme-48'];
        for(let i=76; i<=100; i++) lightThemes.push('theme-'+i);
        const isLight = lightThemes.includes(themeName);

        if (isLight) document.body.classList.add('light-text', 'light-theme-active'); else document.body.classList.remove('light-text', 'light-theme-active');
        
        let targetBgColor = 'rgba(0, 0, 0, 0)'; let dragBg = isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.7)';
        
        if (!isLiquid) {
            document.body.style.backgroundImage = 'none'; let hex = solidThemesColors[themeName] || '#1A2421';
            if (themeName === 'default') hex = '#1A2421';
            document.body.style.backgroundColor = hex; targetBgColor = hex;
            let rgb = hexToRgb(hex).split(',').map(Number); let selRgb;
            if (!isLight) { selRgb = rgb.map(c => Math.min(255, c + 90)).join(', '); } else { selRgb = rgb.map(c => Math.max(0, c - 90)).join(', '); }
            document.documentElement.style.setProperty('--theme-selection-bg', `rgba(${selRgb}, 0.5)`);
            document.documentElement.style.setProperty('--drag-bg', hex);
        } else {
            document.body.style.backgroundColor = ''; document.body.style.backgroundImage = '';
            let previewSelector = (themeName === 'default') ? '.theme-preview.default.liquid' : `.theme-preview.liquid.t${themeName.replace('theme-', '')}`;
            const previewEl = document.querySelector(previewSelector);
            if (previewEl) {
                const match = window.getComputedStyle(previewEl).backgroundImage.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/);
                if (match) targetBgColor = match[0].startsWith('rgb(') ? match[0].replace('rgb(', 'rgba(').replace(')', ', 0.45)') : match[0];
                else targetBgColor = isLight ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
            } else targetBgColor = isLight ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

            let matchRgb = targetBgColor.match(/\d+/g); let selectionRgb = "255, 255, 255";
            if (matchRgb && matchRgb.length >= 3) selectionRgb = `${matchRgb[0]}, ${matchRgb[1]}, ${matchRgb[2]}`;
            document.documentElement.style.setProperty('--theme-selection-bg', `rgba(${selectionRgb}, 0.5)`);
            if (matchRgb && matchRgb.length >= 3) { document.documentElement.style.setProperty('--drag-bg', `rgba(${matchRgb[0]}, ${matchRgb[1]}, ${matchRgb[2]}, 0.85)`); } 
            else { document.documentElement.style.setProperty('--drag-bg', dragBg); }
        }
        
        let styleTag = document.getElementById('dynamic-theme-styles');
        if (!styleTag) { styleTag = document.createElement('style'); styleTag.id = 'dynamic-theme-styles'; document.head.appendChild(styleTag); }

        let menuBgSolid = isLiquid ? targetBgColor : (targetBgColor !== 'rgba(0, 0, 0, 0)' ? targetBgColor : (isLight ? '#F7E7CE' : '#1A2421'));
        let phColor = "rgba(255, 255, 255, 0.6)"; 
        if (isLight && !isDarkMode) phColor = "rgba(0, 0, 0, 0.5)"; else if (isLight && isDarkMode) phColor = "rgba(255, 255, 255, 0.6)"; 

        let css = ``;
        if (isLiquid) {
            css += `.glass-panel { background: rgba(255, 255, 255, 0.1) !important; backdrop-filter: blur(16px) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2) !important; color: white !important; }
                    .inner-chat-bg { background: rgba(0, 0, 0, 0.15) !important; border: 1px inset rgba(255, 255, 255, 0.05) !important; }
                    .settings-dropdown, .solid-dropdown { background: ${menuBgSolid} !important; backdrop-filter: blur(24px) !important; -webkit-backdrop-filter: blur(24px) !important; border: 1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'} !important; box-shadow: 0 10px 40px rgba(0, 0, 0, ${isLight ? '0.1' : '0.4'}) !important; color: ${isLight ? '#1e293b' : 'white'} !important; }
                    .solid-dropdown .language-search { background: ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'} !important; color: inherit !important; }
                    .glass-input { background: rgba(255, 255, 255, 0.1) !important; border: 1px solid rgba(255, 255, 255, 0.3) !important; color: white !important; backdrop-filter: blur(5px) !important; } .glass-input::placeholder { color: ${phColor} !important; font-weight: 400 !important; }
                    .glass-btn { background: rgba(255, 255, 255, 0.15) !important; border: 1px solid rgba(255, 255, 255, 0.3) !important; color: white !important; backdrop-filter: blur(5px) !important; box-shadow: none !important; } .glass-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.25) !important; box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2) !important; }
                    .language-btn.active-state { background: rgba(255,255,255,0.3) !important; font-weight: bold; }
                    li { background: rgba(255, 255, 255, 0.1) !important; backdrop-filter: blur(10px) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; color: white !important; box-shadow: none !important; } li.editing { background: rgba(255, 255, 255, 0.25) !important; box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important; }
                    .chat-dot { background: rgba(255, 255, 255, 0.3) !important; border: 2px solid transparent !important; } .chat-dot.active { background: #ffffff !important; box-shadow: 0 0 14px 2px rgba(255, 255, 255, 0.9) !important; }
                    .todo-content.completed { text-decoration-color: rgba(255, 255, 255, 0.8) !important; opacity: 0.5 !important; }
                    .main-title, #chatTitle, .settings-item, i { color: white !important; } body { color: white !important; }
                    body.light-text .image-previews:not(:empty) { border-bottom-color: rgba(0,0,0,0.15) !important; }`;
            if (isLight) {
                css += `body.light-text:not(.dark-mode) *, body.light-text:not(.dark-mode) #chatTitle, body.light-text:not(.dark-mode) .main-title { color: #1e293b !important; text-shadow: none !important; font-weight: 500 !important; }
                        body.light-text.dark-mode *, body.light-text.dark-mode #chatTitle, body.light-text.dark-mode .main-title { color: #000000 !important; font-weight: 700 !important; text-shadow: none !important; }
                        body.light-text .inner-chat-bg { background: rgba(255, 255, 255, 0.3) !important; border: 1px inset rgba(0, 0, 0, 0.05) !important; }
                        body.light-text .glass-input { background: rgba(255, 255, 255, 0.5) !important; border-color: rgba(0, 0, 0, 0.4) !important; } body.light-text .glass-input::placeholder { color: ${phColor} !important; font-weight: 400 !important; }
                        body.light-text .glass-btn { background: rgba(255, 255, 255, 0.3) !important; border-color: rgba(0, 0, 0, 0.4) !important; } body.light-text .glass-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.6) !important; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15) !important; }
                        body.light-text .language-btn.active-state { background: rgba(0,0,0,0.15) !important; }
                        body.light-text li { background: rgba(255, 255, 255, 0.4) !important; border-color: rgba(0, 0, 0, 0.3) !important; } body.light-text li.editing { background: rgba(255, 255, 255, 0.8) !important; }
                        body.light-text .chat-dot { background: rgba(0, 0, 0, 0.25) !important; border-color: transparent !important; } body.light-text .chat-dot.active { background: #000000 !important; box-shadow: 0 0 12px rgba(0,0,0,0.4) !important; }
                        body.light-text .todo-content.completed { text-decoration-color: #000000 !important; opacity: 0.7 !important; }`;
            }
        } else {
            if (isLight) {
                css += `body.light-text:not(.dark-mode) * { color: #1A2421 !important; text-shadow: none !important; }
                        body.light-text:not(.dark-mode) .main-title, body.light-text:not(.dark-mode) #chatTitle, body.light-text:not(.dark-mode) .settings-item, body.light-text:not(.dark-mode) i { color: #1A2421 !important; text-shadow: none !important; font-weight: 600 !important; }
                        body.light-text.dark-mode * { color: #000000 !important; text-shadow: none !important; } body.light-text.dark-mode .main-title, body.light-text.dark-mode #chatTitle, body.light-text.dark-mode .settings-item, body.light-text.dark-mode i { color: #000000 !important; font-weight: 800 !important; text-shadow: none !important; }
                        .glass-panel { background: rgba(255, 255, 255, 0.45) !important; border: 1px solid rgba(0, 0, 0, 0.1) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; backdrop-filter: none !important; }
                        .inner-chat-bg { background: rgba(0, 0, 0, 0.05) !important; border: 1px inset rgba(0, 0, 0, 0.03) !important; }
                        .settings-dropdown, .solid-dropdown { background: ${menuBgSolid} !important; backdrop-filter: none !important; border: 1px solid rgba(0,0,0,0.1) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important; } .solid-dropdown .language-search { background: rgba(0,0,0,0.05) !important; }
                        .glass-input { background: rgba(255, 255, 255, 0.5) !important; border: 1px solid rgba(0, 0, 0, 0.1) !important; backdrop-filter: none !important; font-weight: 500 !important; } .glass-input::placeholder { color: ${phColor} !important; font-weight: 400 !important; }
                        .glass-btn { background: rgba(255, 255, 255, 0.3) !important; border: 1px solid rgba(0, 0, 0, 0.1) !important; backdrop-filter: none !important; box-shadow: none !important; } .glass-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.7) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important; }
                        .language-btn.active-state { background: rgba(0,0,0,0.1) !important; font-weight: bold; }
                        li { background: rgba(255, 255, 255, 0.4) !important; border: 1px solid rgba(0, 0, 0, 0.1) !important; backdrop-filter: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important; font-weight: 500 !important; } li.editing { background: rgba(255, 255, 255, 0.9) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
                        .chat-dot { background: rgba(0, 0, 0, 0.15) !important; border: none !important; } .chat-dot.active { background: #1A2421 !important; box-shadow: none !important; } .todo-content.completed { text-decoration-color: inherit !important; opacity: 0.5 !important; }
                        .image-previews:not(:empty) { border-bottom-color: rgba(0,0,0,0.1) !important; }`;
            } else {
                css += `body, body * { color: #F7E7CE !important; text-shadow: none !important; } .main-title, #chatTitle, .settings-item, i { color: #F7E7CE !important; text-shadow: none !important; font-weight: 400 !important;}
                        .glass-panel { background: rgba(0, 0, 0, 0.25) !important; border: 1px solid rgba(255, 255, 255, 0.08) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important; backdrop-filter: none !important; }
                        .inner-chat-bg { background: rgba(0, 0, 0, 0.2) !important; border: 1px inset rgba(255, 255, 255, 0.03) !important; }
                        .settings-dropdown, .solid-dropdown { background: ${menuBgSolid} !important; backdrop-filter: none !important; border: 1px solid rgba(255,255,255,0.08) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important; } .solid-dropdown .language-search { background: rgba(255,255,255,0.1) !important; }
                        .glass-input { background: rgba(0, 0, 0, 0.3) !important; border: 1px solid rgba(255, 255, 255, 0.08) !important; backdrop-filter: none !important; font-weight: 500 !important;} .glass-input::placeholder { color: ${phColor} !important; font-weight: 400 !important;}
                        .glass-btn { background: rgba(0, 0, 0, 0.4) !important; border: 1px solid rgba(255, 255, 255, 0.08) !important; backdrop-filter: none !important; box-shadow: none !important; } .glass-btn:hover:not(:disabled) { background: rgba(0, 0, 0, 0.6) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important; }
                        .language-btn.active-state { background: rgba(255,255,255,0.15) !important; font-weight: bold; }
                        li { background: rgba(0, 0, 0, 0.25) !important; border: 1px solid rgba(255, 255, 255, 0.08) !important; backdrop-filter: none !important; box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important; font-weight: 500 !important;} li.editing { background: rgba(0, 0, 0, 0.6) !important; box-shadow: 0 8px 20px rgba(0,0,0,0.3) !important; }
                        .chat-dot { background: rgba(255, 255, 255, 0.2) !important; border: none !important;} .chat-dot.active { background: #F7E7CE !important; box-shadow: none !important;} .todo-content.completed { text-decoration-color: #F7E7CE !important; opacity: 0.5 !important; }`;
            }
        }

        styleTag.innerHTML = css;
        document.querySelectorAll('.theme-list button').forEach(btn => btn.classList.remove('selected'));
        const selectedBtn = document.querySelector(`.theme-list button[data-theme="${themeName}"]`);
        if (selectedBtn) selectedBtn.classList.add('selected');
        if (showToast) peerManager.showInd('actionIndicator', this.getT('themeChanged'));
    },

    loadSavedTheme() { this.switchTheme(document.body.classList.contains('liquid-glass') ? (localStorage.getItem('theme_liquid') || 'default') : (localStorage.getItem('theme_solid') || 'theme-51'), false); },
    safeSetText(id, text) { const el = document.getElementById(id); if (el && text !== undefined) el.textContent = text; },
    safeSetHTML(id, html) { const el = document.getElementById(id); if (el && html !== undefined) el.innerHTML = html; },
    safeSetPlaceholder(id, text) { const el = document.getElementById(id); if (el && text !== undefined) el.placeholder = text; },
    safeSetTooltip(id, text) { const el = document.getElementById(id); if (el && text !== undefined) { if(el.hasAttribute('data-tooltip-bottom')) el.dataset.tooltipBottom = text; else el.dataset.tooltip = text; } },

    applyTranslations() {
        const t = this.translations[this.currentLang] || this.translations['en'];
        this.safeSetPlaceholder('text', t.placeholder); this.safeSetPlaceholder('langSearch', t.searchPlaceholder);
        this.safeSetHTML('langBtn', `<div style="display:flex; align-items:center; gap:10px;"><i class="ph ph-translate"></i> <span>${t.ttLang}</span></div> <i class="ph ph-caret-right" style="margin-left: auto;"></i>`);
        this.safeSetHTML('themeBtn', `<div style="display:flex; align-items:center; gap:10px;"><i class="ph ph-palette"></i> <span id="themeBtnText">${t.ttTheme}</span></div> <i class="ph ph-caret-right" style="margin-left: auto;"></i>`);
        const defaultThemeSpan = document.querySelector('.theme-list button[data-theme="default"] .theme-name'); if (defaultThemeSpan) defaultThemeSpan.textContent = t.themeDefault;

        this.safeSetText('shareBtnMenuText', t.shareToggle); this.safeSetText('shareModalTitle', t.shareTitle);
        this.safeSetText('yourIdLabel', t.yourId); this.safeSetText('connectFriendLabel', t.connectFriend); this.safeSetPlaceholder('friendIdInput', t.friendIdPlaceholder);
        this.safeSetHTML('connectedIndicator', t.connected); this.safeSetHTML('copiedIndicator', t.copied); this.safeSetHTML('disconnectedIndicator', t.disconnected);
        this.safeSetHTML('limitIndicator', t.chatLimit); this.safeSetText('darkModeLabel', t.darkMode); this.safeSetText('staticBgLabel', t.staticBg); this.safeSetText('liquidGlassLabel', t.liquidGlass);

        this.safeSetTooltip('settingsBtn', t.ttSettings); this.safeSetTooltip('chatTitle', t.ttTitleEdit); this.safeSetTooltip('photoAttachBtn', t.ttAddPhoto);
        this.safeSetTooltip('connectBtn', t.ttConnect); this.safeSetTooltip('disconnectBtn', t.ttDisconnect); this.safeSetTooltip('btn', t.ttSend);
        this.safeSetTooltip('copyIdBtn', t.ttCopy); this.safeSetTooltip('closeModalBtn', t.ttClose); 
        this.safeSetTooltip('langBtn', t.ttLang); this.safeSetTooltip('themeBtn', t.ttTheme); this.safeSetTooltip('shareMenuBtn', t.ttShareMenu);
        this.safeSetTooltip('darkModeBtn', t.ttToggle); this.safeSetTooltip('liquidGlassBtn', t.ttToggle); this.safeSetTooltip('staticBgBtn', t.ttToggle);
        
        document.querySelectorAll('.edit-btn').forEach(btn => btn.dataset.tooltip = t.ttEditTodo); 
        document.querySelectorAll('.save-btn').forEach(btn => btn.dataset.tooltip = t.ttSaveTodo); 
        document.querySelectorAll('.delete-btn').forEach(btn => btn.dataset.tooltip = t.ttDeleteTodo);
        document.querySelectorAll('.drag-handle').forEach(handle => handle.dataset.tooltip = t.ttDrag);
        document.querySelectorAll('.pin-btn').forEach(btn => btn.dataset.tooltip = t.ttPin);

        this.safeSetText('shareChoiceTitle', t.shareChoiceTitle || "Connection type");
        this.safeSetText('textShareNew', t.shareNew || "Create new shared chat");
        this.safeSetText('textShareCurrent', t.shareCurrent || "Continue in current");
    },

    highlightSelectedLanguage() { document.querySelectorAll('.language-list button').forEach(btn => btn.classList.remove('selected')); const selectedBtn = document.querySelector(`.language-list button[data-lang="${this.currentLang}"]`); if (selectedBtn) selectedBtn.classList.add('selected'); },
    loadSavedLanguage() { const savedLang = localStorage.getItem('preferredLanguage'); if (savedLang) this.switchLanguage(savedLang, false); else this.applyTranslations(); },
    getT(key) { return (this.translations[this.currentLang] || this.translations['en'])[key] || ""; }
};

// ==================== ЛОГІКА ВІЗУАЛІЗАЦІЇ (ACTIONS) ====================
window.triggerVisualPin = function(li, isPinned, isRemote = false) {
    if(!li) return;
    li.dataset.pinned = isPinned ? 'true' : 'false';
    const pinBtn = li.querySelector('.pin-btn');
    if (isPinned) {
        pinBtn.innerHTML = "<i class='ph-fill ph-push-pin'></i>"; pinBtn.classList.add('active'); li.classList.add('pinned-highlight');
        if(!isRemote) peerManager.showInd('pinIndicator', languageManager.getT('msgPinned'));
    } else {
        pinBtn.innerHTML = "<i class='ph ph-push-pin'></i>"; pinBtn.classList.remove('active'); li.classList.remove('pinned-highlight');
        if(!isRemote) peerManager.showInd('pinIndicator', languageManager.getT('msgUnpinned'));
    }
    const list = document.getElementById("todolist"); reorderListElements(list);
    if (isPinned) list.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
}

window.triggerVisualDelete = function(li) {
    if(!li) return;
    li.classList.add('deleting');
    setTimeout(() => {
        li.style.height = li.offsetHeight + 'px'; li.offsetHeight; 
        li.classList.add('collapsing');
        li.style.height = '0px'; li.style.paddingTop = '0px'; li.style.paddingBottom = '0px'; li.style.marginTop = '0px'; li.style.marginBottom = '0px'; li.style.borderWidth = '0px'; 
        setTimeout(() => { li.remove(); saveAllData(false); }, 400); 
    }, 400);
}

window.triggerVisualAdd = function(itemObj) {
    const list = document.getElementById("todolist");
    if (list) { list.append(createTodoElement(itemObj.text, itemObj.images, itemObj.id, true, itemObj.pinned)); reorderListElements(list); saveAllData(false); }
}

window.triggerVisualEditStart = function(li, isRemote = false) {
    if(!li) return;
    li.classList.add('editing');
    if (isRemote) li.classList.add('remote-editing');
    
    const contentSpan = li.querySelector('.todo-content');
    const textarea = li.querySelector('.edit-textarea');
    const editBtn = li.querySelector('.edit-btn'); const saveBtn = li.querySelector('.save-btn');
    const deleteBtn = li.querySelector('.delete-btn'); const pinBtn = li.querySelector('.pin-btn');
    
    contentSpan.style.display = 'none';
    textarea.value = contentSpan.textContent;
    textarea.style.display = 'block';
    
    if (isRemote) {
        textarea.disabled = true;
        editBtn.style.display = 'none'; saveBtn.style.display = 'none'; deleteBtn.style.display = 'none'; pinBtn.style.pointerEvents = 'none';
    } else {
        editBtn.style.display = 'none'; saveBtn.style.display = 'flex';
        setTimeout(() => { textarea.style.height = 'auto'; textarea.style.height = (textarea.scrollHeight) + 'px'; textarea.focus(); }, 0);
    }
}

window.triggerVisualEditUpdate = function(li, text) {
    if(!li) return;
    const textarea = li.querySelector('.edit-textarea');
    if(textarea) { textarea.value = text; textarea.style.height = 'auto'; textarea.style.height = textarea.scrollHeight + 'px'; }
}

window.triggerVisualEditEnd = function(li, newText) {
    if(!li) return;
    li.classList.remove('editing', 'remote-editing');
    const contentSpan = li.querySelector('.todo-content');
    const textarea = li.querySelector('.edit-textarea');
    const editBtn = li.querySelector('.edit-btn'); const saveBtn = li.querySelector('.save-btn');
    const deleteBtn = li.querySelector('.delete-btn'); const pinBtn = li.querySelector('.pin-btn');
    
    if (newText !== undefined && newText !== null) contentSpan.textContent = newText;
    
    textarea.style.display = 'none'; textarea.disabled = false;
    contentSpan.style.display = contentSpan.textContent ? "block" : "none";
    saveBtn.style.display = 'none'; editBtn.style.display = 'flex'; deleteBtn.style.display = 'flex'; pinBtn.style.pointerEvents = 'auto';
    saveAllData(false);
}

// ==================== ОСНОВНА ЛОГІКА ДОДАТКУ ====================
const getChatElements = () => [document.getElementById("chatTitle"), document.querySelector(".inner-chat-bg")].filter(el => el);

function initApp() {
    renderSidebar(); renderActiveChat(); initImageUpload(); initModals(); 
    const titleEl = document.getElementById('chatTitle');
    if (titleEl) { titleEl.addEventListener('blur', saveChatTitle); titleEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); } }); }
    const btn = document.getElementById("btn"); if (btn) btn.addEventListener("click", add);
}

function reorderListElements(listElement) {
    const items = Array.from(listElement.children);
    const pinned = items.filter(item => item.dataset.pinned === 'true');
    const unpinned = items.filter(item => item.dataset.pinned !== 'true');
    pinned.forEach(item => listElement.appendChild(item));
    unpinned.forEach(item => listElement.appendChild(item));
}

let lastSentIndex = -1; // 🟢 ФІКС ЛАГІВ МЕРЕЖІ: Зберігаємо останній надісланий індекс
function initSortable() {
    const list = document.getElementById('todolist'); if (!list) return;
    if (sortableInstance) sortableInstance.destroy();
    
    sortableInstance = new Sortable(list, {
        handle: '.drag-handle', 
        animation: 150, 
        easing: "cubic-bezier(0.25, 1, 0.5, 1)", 
        ghostClass: 'sortable-ghost', chosenClass: 'sortable-chosen', dragClass: 'sortable-drag', fallbackClass: 'sortable-fallback',
        forceFallback: true, fallbackOnBody: true, axis: 'y', 
        scroll: true, bubbleScroll: true, scrollSensitivity: 200, scrollSpeed: 25,
        fallbackTolerance: 5, // 🟢 ФІКС МІКРО-КЛІКІВ: Запобігає випадковому старту Drag-n-Drop
        delay: 50, delayOnTouchOnly: true, // 🟢 ФІКС ДЛЯ ТЕЛЕФОНІВ: Дозволяє нормально скролити
        
        onStart: function (evt) { 
            list.classList.add('is-dragging'); document.body.classList.add('is-dragging-global'); 
            lastSentIndex = evt.oldIndex;
            peerManager.sendAction('DRAG_START', { id: evt.item.id });
        },
        onChange: function(evt) {
            // 🟢 ФІКС ЛАГІВ МЕРЕЖІ: Відправляємо тільки якщо елемент реально перестрибнув на нове місце
            if (evt.newIndex !== lastSentIndex && evt.newIndex !== undefined) { 
                lastSentIndex = evt.newIndex;
                peerManager.sendAction('DRAG_MOVE', { id: evt.item.id, newIndex: evt.newIndex });
            }
        },
        onEnd: function (evt) { 
            list.classList.remove('is-dragging'); document.body.classList.remove('is-dragging-global'); 
            saveAllData(false); 
            peerManager.sendAction('DRAG_END', { id: evt.item.id, newIndex: evt.newIndex });
        }
    });
}

function initImageUpload() {
    const photoAttachBtn = document.getElementById('photoAttachBtn'); const imageInput = document.getElementById('imageInput');
    if (photoAttachBtn && imageInput) photoAttachBtn.addEventListener('click', () => imageInput.click());
    if (!imageInput) return;
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files); if (!files.length) return;
        let remainingSlots = 8 - pendingImages.length;
        if (remainingSlots <= 0) { peerManager.showInd('limitIndicator', languageManager.getT('photoLimit')); return; }
        files.slice(0, remainingSlots).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas'); let w = img.width, h = img.height; const max = 1000;
                    if (w > max || h > max) { if (w > h) { h *= max / w; w = max; } else { w *= max / h; h = max; } }
                    canvas.width = w; canvas.height = h; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
                    pendingImages.push(canvas.toDataURL('image/jpeg', 0.8)); renderPreviews();
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
        imageInput.value = ''; 
    });
}

function renderPreviews() {
    const container = document.getElementById('imagePreviews'); if (!container) return; container.innerHTML = '';
    pendingImages.forEach((src, index) => {
        const div = document.createElement('div'); div.className = 'preview-box';
        div.innerHTML = `<img src="${src}" class="preview-img" draggable="false" onclick="openModalImage('${src}')"><button class="remove-preview" onclick="event.stopPropagation(); removePreview(${index})"><i class="ph ph-x"></i></button>`;
        container.appendChild(div);
    });
}

window.removePreview = function(index) { pendingImages.splice(index, 1); renderPreviews(); };

function initModals() {
    const imgModal = document.getElementById('imageModal'); const closeImgBtn = document.getElementById('closeModalBtn');
    if (closeImgBtn) closeImgBtn.addEventListener('click', () => imgModal.classList.remove('open'));
    if (imgModal) imgModal.addEventListener('click', (e) => { if (e.target === imgModal) imgModal.classList.remove('open'); });
}

window.openModalImage = function(src) { const modal = document.getElementById('imageModal'); const img = document.getElementById('modalImg'); if (modal && img) { img.src = src; modal.classList.add('open'); } };

function renderSidebar() {
    const sidebar = document.getElementById('chatSidebar'); if (!sidebar) return; sidebar.innerHTML = '';
    chatsData.forEach(chat => {
        const isShared = chat.isShared || (peerManager.conn && peerManager.sharedChatId === chat.id);
        const dot = document.createElement('button'); 
        dot.id = 'dot-' + chat.id; 
        dot.className = `chat-dot ${chat.id === activeChatId ? 'active' : ''} ${isShared ? 'shared' : ''}`; 
        dot.dataset.tooltip = chat.name; 
        
        dot.onclick = () => switchChat(chat.id);
        
        let pressTimer; const startPress = (e) => { if(e.type === 'mousedown' && e.button !== 0) return; pressTimer = setTimeout(() => { showDeleteMenu(chat.id, dot); }, 600); }; const cancelPress = () => clearTimeout(pressTimer);
        dot.addEventListener('mousedown', startPress); dot.addEventListener('mouseup', cancelPress); dot.addEventListener('mouseleave', cancelPress); dot.addEventListener('contextmenu', (e) => { e.preventDefault(); cancelPress(); showDeleteMenu(chat.id, dot); });
        dot.addEventListener('touchstart', startPress, {passive: true}); dot.addEventListener('touchmove', cancelPress, {passive: true}); dot.addEventListener('touchend', cancelPress); dot.addEventListener('touchcancel', cancelPress);
        sidebar.appendChild(dot);
    });
    const addBtn = document.createElement('button'); addBtn.className = 'add-chat-btn'; addBtn.innerHTML = '<i class="ph ph-plus"></i>'; addBtn.dataset.tooltip = languageManager.getT('ttNewChat');
    addBtn.onclick = (e) => { e.stopPropagation(); removeDeleteMenu(); createNewChat(); }; sidebar.appendChild(addBtn);
}

function removeDeleteMenu() { const existing = document.querySelector('.delete-chat-menu'); if (existing) existing.remove(); }
function showDeleteMenu(chatId, dotElement) {
    removeDeleteMenu(); if (chatsData.length <= 1) return;
    const btn = document.createElement('button'); btn.className = 'delete-chat-menu glass-btn';
    btn.innerHTML = `<i class="ph ph-trash"></i> <span>${languageManager.getT('deleteChat')}</span>`;
    btn.style.backgroundColor = 'rgba(255, 60, 60, 0.9)'; btn.style.color = 'white'; btn.style.position = 'absolute'; btn.style.padding = '8px 12px'; btn.style.borderRadius = '12px'; btn.style.zIndex = '5000'; btn.style.display = 'flex'; btn.style.alignItems = 'center'; btn.style.gap = '8px'; btn.style.border = 'none'; btn.style.cursor = 'pointer'; btn.style.fontSize = '14px'; btn.style.fontWeight = '600';
    document.body.appendChild(btn); const rect = dotElement.getBoundingClientRect();
    if (window.innerWidth <= 768) { btn.style.left = (rect.left + rect.width / 2) + 'px'; btn.style.top = (rect.top - 50) + 'px'; btn.style.transform = 'translate(-50%, 0)'; } else { btn.style.top = (rect.top + rect.height / 2) + 'px'; btn.style.left = (rect.left - 25) + 'px'; btn.style.transform = 'translate(-100%, -50%)'; }
    const handleDelete = (e) => { e.stopPropagation(); e.preventDefault(); btn.remove(); deleteChat(chatId); };
    btn.onmousedown = handleDelete; btn.ontouchstart = handleDelete;
}

function deleteChat(id) {
    const dotElement = document.getElementById(`dot-${id}`); const isActiveChat = (id === activeChatId);
    if (dotElement) dotElement.classList.add('deleting');
    const els = getChatElements();
    const performDeletion = () => {
        chatsData = chatsData.filter(c => c.id !== id); if (isActiveChat) activeChatId = chatsData[0].id; saveAllData(false); renderSidebar();
        if (isActiveChat) {
            els.forEach(el => { el.style.transition = 'none'; el.style.transform = 'translateX(-50px) scale(0.95)'; el.style.opacity = '0'; }); renderActiveChat();
            requestAnimationFrame(() => { requestAnimationFrame(() => { els.forEach((el, index) => { el.style.transition = `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.03}s`; el.style.transform = 'translateX(0) scale(1)'; el.style.opacity = '1'; setTimeout(() => { el.style.transition = ""; el.style.transform = ""; el.style.opacity = ""; }, 450); }); }); });
        }
        if(peerManager.conn && peerManager.sharedChatId === id) peerManager.disconnect();
    };
    if (isActiveChat) { els.forEach((el, index) => { el.style.transition = `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.03}s`; el.style.transform = 'translateX(100px) scale(0.9)'; el.style.opacity = '0'; }); setTimeout(performDeletion, 400); } else setTimeout(performDeletion, 300);
}

function switchChat(id) {
    if (activeChatId === id) return;
    const els = getChatElements();
    els.forEach((el, index) => { el.style.transition = `all 0.3s ease ${index * 0.02}s`; el.style.transform = 'translateY(15px)'; el.style.opacity = '0'; });
    setTimeout(() => {
        activeChatId = id; localStorage.setItem('todolist_active_chat', id); renderSidebar();
        els.forEach(el => { el.style.transition = 'none'; el.style.transform = 'translateY(-15px)'; el.style.opacity = '0'; }); renderActiveChat();
        requestAnimationFrame(() => { requestAnimationFrame(() => { els.forEach((el, index) => { el.style.transition = `all 0.3s ease ${index * 0.02}s`; el.style.transform = 'translateY(0)'; el.style.opacity = '1'; setTimeout(() => { el.style.transition = ""; el.style.transform = ""; el.style.opacity = ""; }, 350); }); }); });
    }, 300); 
}

function createNewChat() {
    if (chatsData.length >= 20) { peerManager.showInd('limitIndicator', languageManager.getT('chatLimit')); return; }
    const newChat = { id: 'chat_' + Date.now(), name: `Chat ${chatsData.length + 1}`, todos: [] };
    chatsData.push(newChat); saveAllData(false); switchChat(newChat.id); 
}

function saveChatTitle() {
    const titleEl = document.getElementById('chatTitle'); if (!titleEl) return;
    const newTitle = titleEl.value.trim() || "Unnamed Chat"; titleEl.value = newTitle; 
    const activeChat = chatsData.find(c => c.id === activeChatId);
    if (activeChat && activeChat.name !== newTitle) { 
        activeChat.name = newTitle; saveAllData(false); renderSidebar(); 
        if(peerManager.conn && peerManager.sharedChatId === activeChatId) peerManager.sendData(); 
    }
}

function renderActiveChat() {
    const activeChat = chatsData.find(c => c.id === activeChatId); if (!activeChat) return;
    const titleEl = document.getElementById('chatTitle'); if (titleEl) titleEl.value = activeChat.name;
    const list = document.getElementById("todolist"); if (!list) return; list.innerHTML = "";
    activeChat.todos.forEach(todo => {
        let text = typeof todo === 'object' ? todo.text : todo; 
        let images = typeof todo === 'object' && todo.images ? todo.images : []; 
        let id = typeof todo === 'object' && todo.id ? todo.id : null;
        let pinned = typeof todo === 'object' && todo.pinned ? todo.pinned : false;
        list.append(createTodoElement(text, images, id, false, pinned));
    });
    initSortable(); 
}

function saveAllData(isInitial = false) {
    const activeChat = chatsData.find(c => c.id === activeChatId);
    if (activeChat) {
        const todos = [];
        document.querySelectorAll("#todolist li:not(.deleting)").forEach(li => {
            const span = li.querySelector(".todo-content"); const text = span ? span.textContent : "";
            const images = []; li.querySelectorAll(".todo-img").forEach(img => images.push(img.src));
            const pinned = li.dataset.pinned === 'true';
            todos.push({ id: li.id, text: text, images: images, pinned: pinned });
        });
        activeChat.todos = todos;
    }
    localStorage.setItem("todolist_chats", JSON.stringify(chatsData));
}

function createTodoElement(text, images = [], id = null, isNew = true, pinned = false) {
    const li = document.createElement("li"); li.id = id || `Item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    if (isNew) { li.className = 'new-item'; setTimeout(() => li.classList.remove('new-item'), 600); }
    
    li.dataset.pinned = pinned ? 'true' : 'false';
    if (pinned) li.classList.add('pinned-highlight');
    
    const handleDiv = document.createElement("div");
    handleDiv.className = "drag-handle"; handleDiv.dataset.tooltip = languageManager.getT('ttDrag');
    handleDiv.innerHTML = "<i class='ph ph-dots-six-vertical'></i>";
    li.appendChild(handleDiv);
    
    const mainDiv = document.createElement("div"); mainDiv.className = "todo-main";
    
    const contentSpan = document.createElement("span"); contentSpan.className = "todo-content"; contentSpan.textContent = text;
    contentSpan.style.display = text ? "block" : "none";

    if (images && images.length > 0) {
        const imgContainer = document.createElement("div"); imgContainer.className = "todo-images";
        images.forEach(src => { const img = document.createElement("img"); img.src = src; img.className = "todo-img"; img.draggable = false; img.onclick = (e) => { e.stopPropagation(); openModalImage(src); }; imgContainer.appendChild(img); });
        mainDiv.appendChild(imgContainer);
    }
    mainDiv.appendChild(contentSpan);

    const textarea = document.createElement("textarea"); textarea.className = "edit-textarea glass-input";
    textarea.style.display = 'none'; 
    mainDiv.appendChild(textarea);

    const actionsDiv = document.createElement("div"); actionsDiv.className = "todo-actions";
    
    const pinBtn = document.createElement("button");
    pinBtn.className = "pin-btn glass-btn" + (pinned ? " active" : "");
    pinBtn.dataset.tooltip = languageManager.getT('ttPin');
    pinBtn.innerHTML = pinned ? "<i class='ph-fill ph-push-pin'></i>" : "<i class='ph ph-push-pin'></i>";
    
    pinBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const currentlyPinned = li.dataset.pinned === 'true';
        triggerVisualPin(li, !currentlyPinned);
        saveAllData(false); 
        peerManager.sendAction('PIN', { id: li.id, pinned: !currentlyPinned });
    });

    const editBtn = document.createElement("button"); editBtn.innerHTML = "<i class='ph ph-pencil-simple'></i>"; editBtn.className = "edit-btn glass-btn"; editBtn.dataset.tooltip = languageManager.getT('ttEditTodo');
    const deleteBtn = document.createElement("button"); deleteBtn.innerHTML = "<i class='ph ph-trash'></i>"; deleteBtn.className = "delete-btn glass-btn"; deleteBtn.dataset.tooltip = languageManager.getT('ttDeleteTodo');
    const saveBtn = document.createElement("button"); saveBtn.innerHTML = "<i class='ph ph-floppy-disk'></i>"; saveBtn.className = "save-btn glass-btn"; saveBtn.dataset.tooltip = languageManager.getT('ttSaveTodo');
    saveBtn.style.display = 'none';

    editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        triggerVisualEditStart(li);
        peerManager.sendAction('EDIT_START', { id: li.id });
    });

    const cancelEdit = () => { triggerVisualEditEnd(li, null); peerManager.sendAction('EDIT_END', { id: li.id, text: contentSpan.textContent }); };

    textarea.addEventListener("input", (e) => {
        peerManager.sendAction('EDIT_UPDATE', { id: li.id, text: textarea.value });
    });

    textarea.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); saveBtn.click(); } else if (event.key === "Escape") cancelEdit(); });
    
    saveBtn.addEventListener("click", (e) => {
        e.stopPropagation(); if (!li.classList.contains('editing')) return;
        const newText = textarea.value.trim();
        triggerVisualEditEnd(li, newText);
        peerManager.sendAction('EDIT_END', { id: li.id, text: newText });
    });

    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        triggerVisualDelete(li);
        peerManager.sendAction('DELETE', { id: li.id });
    });

    actionsDiv.append(editBtn, saveBtn, deleteBtn); li.append(mainDiv, actionsDiv, pinBtn); return li;
}

function add() {
    const textarea = document.getElementById("text"); if (!textarea) return;
    const text = textarea.value.trim();
    if(text !== "" || pendingImages.length > 0){
        const newTodo = { id: `Item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, text: text, images: [...pendingImages], pinned: false };
        triggerVisualAdd(newTodo);
        peerManager.sendAction('ADD', { item: newTodo });
    }
    textarea.value = ""; textarea.style.height = '40px'; pendingImages = []; renderPreviews(); textarea.focus();
}

const mainTextInput = document.getElementById("text");
if (mainTextInput) {
    mainTextInput.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = Math.max(40, this.scrollHeight) + 'px'; });
    mainTextInput.addEventListener("keydown", function(e) { if(e.key === "Enter" && !e.shiftKey) { const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0; if (!isTouchDevice) { e.preventDefault(); add(); } } });
}

// ==================== PEERJS (Event Sourcing Architecture) ====================
const peerManager = {
    peer: null, conn: null, sharedChatId: null, pendingFriendId: null,
    init() {
        const myPeerIdEl = document.getElementById("myPeerId"); if (myPeerIdEl) myPeerIdEl.textContent = "Loading...";
        let savedId = 'todo_' + Math.random().toString(36).substr(2, 9);
        this.peer = new Peer(savedId, { debug: 2 });
        this.peer.on('open', (id) => { if (myPeerIdEl) myPeerIdEl.textContent = id; this.updateConnectionButtons(false); });
        this.peer.on('connection', (c) => { this.conn = c; this.setupConnection(); });
        this.peer.on('error', (err) => { if (myPeerIdEl) myPeerIdEl.textContent = "Error"; this.updateConnectionButtons(false); });
        
        const connBtn = document.getElementById("connectBtn"); const disconnBtn = document.getElementById("disconnectBtn"); const copyBtn = document.getElementById("copyIdBtn");
        if (connBtn) connBtn.onclick = () => this.showChoiceModal(); 
        if (disconnBtn) disconnBtn.onclick = () => this.disconnect(); 
        if (copyBtn) copyBtn.onclick = () => this.copyMyId();

        this.setupModalListeners();
    },

    setupModalListeners() {
        const modal = document.getElementById('shareChoiceModal');
        document.getElementById('btnShareCancel').onclick = () => modal.classList.remove('active');
        
        document.getElementById('btnShareNew').onclick = () => {
            modal.classList.remove('active');
            const newChat = { id: 'chat_shared_' + Date.now(), name: "Shared access chat", todos: [], isShared: true };
            chatsData.push(newChat); saveAllData(false); switchChat(newChat.id);
            this.sharedChatId = newChat.id; this.connectToFriend();
        };

        document.getElementById('btnShareCurrent').onclick = () => {
            modal.classList.remove('active');
            const currentChat = chatsData.find(c => c.id === activeChatId);
            if(currentChat) currentChat.isShared = true;
            saveAllData(false); renderSidebar();
            this.sharedChatId = activeChatId; this.connectToFriend();
        };
    },

    showChoiceModal() {
        const friendIdInput = document.getElementById("friendIdInput"); if (!friendIdInput) return; 
        this.pendingFriendId = friendIdInput.value.trim(); if (!this.pendingFriendId) return;
        const settingsDropdown = document.getElementById('settingsDropdown'); if(settingsDropdown) settingsDropdown.classList.remove('active');
        const shareDropdown = document.getElementById('shareDropdown'); if(shareDropdown) shareDropdown.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.getElementById('shareChoiceModal').classList.add('active');
    },

    connectToFriend() {
        this.updateConnectionButtons(true);
        try { this.conn = this.peer.connect(this.pendingFriendId, { reliable: true }); this.setupConnection(); } catch (e) { this.updateConnectionButtons(false); }
    },

    disconnect() { 
        if (this.conn) { this.conn.close(); this.conn = null; } 
        this.sharedChatId = null; this.updateConnectionButtons(false); this.showInd("disconnectedIndicator"); renderSidebar(); 
    },

    setupConnection() {
        if (!this.conn) return;
        this.conn.on('open', () => { 
            this.updateConnectionButtons(true); this.showInd("connectedIndicator"); 
            if(this.sharedChatId) this.sendData(); 
        });
        
        this.conn.on('data', (payload) => {
            if (!payload || !payload.type) return;

            if (payload.type === 'SYNC_CHAT') {
                const incomingChat = payload.chat; incomingChat.isShared = true;
                const existingIndex = chatsData.findIndex(c => c.id === incomingChat.id);
                if (existingIndex !== -1) { chatsData[existingIndex] = incomingChat; } else { chatsData.push(incomingChat); }
                this.sharedChatId = incomingChat.id; localStorage.setItem("todolist_chats", JSON.stringify(chatsData)); renderSidebar();
                if (activeChatId === incomingChat.id) { renderActiveChat(); } else { switchChat(incomingChat.id); }
            }
            
            if (payload.type === 'SYNC_ACTION' && payload.chatId === activeChatId) {
                const p = payload.payload;
                switch(payload.action) {
                    case 'ADD': triggerVisualAdd(p.item); break;
                    case 'DELETE': const liDel = document.getElementById(p.id); if(liDel) triggerVisualDelete(liDel); break;
                    case 'PIN': const liPin = document.getElementById(p.id); if(liPin) triggerVisualPin(liPin, p.pinned, true); break;
                    
                    case 'EDIT_START': const liES = document.getElementById(p.id); if(liES) triggerVisualEditStart(liES, true); break;
                    case 'EDIT_UPDATE': triggerVisualEditUpdate(document.getElementById(p.id), p.text); break;
                    case 'EDIT_END': const liEE = document.getElementById(p.id); if(liEE) triggerVisualEditEnd(liEE, p.text); break;
                    
                    case 'DRAG_START': 
                        const liDS = document.getElementById(p.id); if(liDS) liDS.classList.add('remote-ghost'); 
                        break;
                    case 'DRAG_MOVE': 
                        const list = document.getElementById('todolist'); 
                        const itemToMove = document.getElementById(p.id);
                        if (list && itemToMove) {
                            itemToMove.classList.add('remote-ghost');
                            
                            // 🟢 ФІКС: Оптимізація DOM. Рухаємо тільки якщо він реально на іншому місці!
                            const children = Array.from(list.children);
                            const currentIndex = children.indexOf(itemToMove);
                            
                            if (currentIndex !== p.newIndex && p.newIndex !== -1) {
                                if (p.newIndex >= children.length) { 
                                    list.appendChild(itemToMove); 
                                } else { 
                                    const targetElement = children[p.newIndex]; 
                                    if(targetElement && targetElement !== itemToMove) { 
                                        list.insertBefore(itemToMove, p.newIndex > currentIndex ? targetElement.nextSibling : targetElement); 
                                    } 
                                }
                            }
                        }
                        break;
                    case 'DRAG_END': 
                        const liDE = document.getElementById(p.id); if(liDE) liDE.classList.remove('remote-ghost'); 
                        saveAllData(false);
                        break;
                }
            }

            if (payload.type === 'TOAST') { this.showInd(payload.toastId, languageManager.getT(payload.msgKey)); }
        });

        this.conn.on('close', () => { this.updateConnectionButtons(false); this.showInd("disconnectedIndicator"); this.sharedChatId = null; renderSidebar(); });
    },

    sendData() { 
        if (this.conn && this.conn.open && this.sharedChatId) { 
            const chatToSend = chatsData.find(c => c.id === this.sharedChatId);
            if (chatToSend) { this.conn.send({ type: 'SYNC_CHAT', chat: chatToSend }); }
        } 
    },

    sendAction(actionName, payloadObj) {
        if (this.conn && this.conn.open && this.sharedChatId === activeChatId) {
            this.conn.send({ type: 'SYNC_ACTION', action: actionName, chatId: activeChatId, payload: payloadObj });
        }
    }
    // ... інші методи (без змін)
};

// Продовження ініціалізації
peerManager.updateConnectionButtons = function(isConnected) {
    const connectBtn = document.getElementById("connectBtn"); const disconnectBtn = document.getElementById("disconnectBtn"); const friendIdInput = document.getElementById("friendIdInput");
    if (connectBtn) connectBtn.disabled = isConnected; if (disconnectBtn) disconnectBtn.disabled = !isConnected; if (friendIdInput) friendIdInput.disabled = isConnected;
};

peerManager.copyMyId = function() {
    const myPeerIdEl = document.getElementById("myPeerId"); if (!myPeerIdEl) return;
    const myId = myPeerIdEl.textContent; if (myId === "Loading..." || myId.includes("Error")) return;
    navigator.clipboard.writeText(myId).then(() => { this.showInd("copiedIndicator"); });
};

peerManager.showInd = function(id, text) {
    const el = document.getElementById(id); if (!el) return;
    if (text) el.innerHTML = text;
    if (el.timeoutId) clearTimeout(el.timeoutId);
    globalToastZIndex++; el.style.zIndex = globalToastZIndex; el.style.top = "20px"; el.style.opacity = "1";
    el.timeoutId = setTimeout(() => { el.style.top = "-60px"; el.style.opacity = "0"; }, 2500);
};

window.addEventListener("load", function() {
    try { languageManager.init(); } catch (e) { console.error(e); }
    try { initApp(); } catch (e) { console.error(e); }
    try { peerManager.init(); } catch (e) { console.error(e); }
});
