// ==================== STATE MANAGEMENT ====================
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

let draggedItem = null;
let globalToastZIndex = 4000;

// ==================== LANGUAGE & SETTINGS ====================
const languageManager = {
    currentLang: 'uk',
    translations: {
        en: { appTitle: "Todo list", searchPlaceholder: "Search...", placeholder: "Add a task", shareToggle: "<i class='ph ph-broadcast'></i> Shared access", shareToggleClose: "<i class='ph ph-x-circle'></i> Close access", yourId: "Your ID:", connectFriend: "Connect to friend:", friendIdPlaceholder: "Enter friend's ID", copyButton: "Copy", connected: "Connected! <i class='ph ph-confetti'></i>", copied: "ID copied! <i class='ph ph-copy'></i>", disconnected: "Disconnected <i class='ph ph-x'></i>", darkMode: "Dark mode", staticBg: "Static background", liquidGlass: "Liquid glass", langBtn: "Language", themeBtn: "Other themes", themeDefault: "Default", deleteChat: "Delete", ttSettings: "Settings", ttTitleEdit: "Click to edit title", ttAdd: "Add", ttShare: "Connection menu", ttCopy: "Copy your ID", ttConnect: "Connect", ttDisconnect: "Disconnect", ttEditTodo: "Edit", ttSaveTodo: "Save", ttNewChat: "New chat", chatLimit: "Max 20 chats <i class='ph ph-warning'></i>" },
        uk: { appTitle: "Todo list", searchPlaceholder: "Пошук...", placeholder: "Додайте справу", shareToggle: "<i class='ph ph-broadcast'></i> Спільний доступ", shareToggleClose: "<i class='ph ph-x-circle'></i> Закрити доступ", yourId: "Твій ID:", connectFriend: "Підключитись до друга:", friendIdPlaceholder: "Введіть ID друга", copyButton: "Копіювати", connected: "Підключено! <i class='ph ph-confetti'></i>", copied: "ID скопійовано! <i class='ph ph-copy'></i>", disconnected: "Відключено <i class='ph ph-x'></i>", darkMode: "Темний режим", staticBg: "Статичний фон", liquidGlass: "Скляний дизайн", langBtn: "Мова", themeBtn: "Інші теми", themeDefault: "За замовчуванням", deleteChat: "Видалити", ttSettings: "Налаштування", ttTitleEdit: "Натисніть, щоб змінити назву", ttAdd: "Додати", ttShare: "Меню підключення", ttCopy: "Копіювати свій ID", ttConnect: "Підключити", ttDisconnect: "Відключити", ttEditTodo: "Редагувати", ttSaveTodo: "Зберегти", ttNewChat: "Новий чат", chatLimit: "Максимум 20 чатів <i class='ph ph-warning'></i>" },
        ru: { appTitle: "Список дел", searchPlaceholder: "Поиск...", placeholder: "Добавьте задачу", shareToggle: "<i class='ph ph-broadcast'></i> Совместный доступ", shareToggleClose: "<i class='ph ph-x-circle'></i> Закрыть доступ", yourId: "Ваш ID:", connectFriend: "Подключиться к другу:", friendIdPlaceholder: "Введите ID друга", copyButton: "Копировать", connected: "Подключено! <i class='ph ph-confetti'></i>", copied: "ID скопирован! <i class='ph ph-copy'></i>", disconnected: "Отключено <i class='ph ph-x'></i>", darkMode: "Темный режим", staticBg: "Статичный фон", liquidGlass: "Стеклянный дизайн", langBtn: "Язык", themeBtn: "Другие темы", themeDefault: "По умолчанию", deleteChat: "Удалить", ttSettings: "Настройки", ttTitleEdit: "Нажмите, чтобы изменить", ttAdd: "Добавить", ttShare: "Меню подключения", ttCopy: "Копировать ID", ttConnect: "Подключиться", ttDisconnect: "Отключиться", ttEditTodo: "Изменить", ttSaveTodo: "Сохранить", ttNewChat: "Новый чат", chatLimit: "Максимум 20 чатов <i class='ph ph-warning'></i>" },
        pl: { appTitle: "Lista zadań", searchPlaceholder: "Szukaj...", placeholder: "Dodaj zadanie", shareToggle: "<i class='ph ph-broadcast'></i> Dostęp wspólny", shareToggleClose: "<i class='ph ph-x-circle'></i> Zamknij dostęp", yourId: "Twój ID:", connectFriend: "Połącz ze znajomym:", friendIdPlaceholder: "Wpisz ID znajomego", copyButton: "Kopiuj", connected: "Połączono! <i class='ph ph-confetti'></i>", copied: "ID skopiowane! <i class='ph ph-copy'></i>", disconnected: "Rozłączono <i class='ph ph-x'></i>", darkMode: "Tryb ciemny", staticBg: "Tło statyczne", liquidGlass: "Płynne szkło", langBtn: "Język", themeBtn: "Inne motywy", themeDefault: "Domyślny", deleteChat: "Usuń", ttSettings: "Ustawienia", ttTitleEdit: "Kliknij, aby edytować", ttAdd: "Dodaj", ttShare: "Menu połączeń", ttCopy: "Skopiuj ID", ttConnect: "Połącz", ttDisconnect: "Rozłącz", ttEditTodo: "Edytuj", ttSaveTodo: "Zapisz", ttNewChat: "Nowy czat", chatLimit: "Maksymalnie 20 czatów <i class='ph ph-warning'></i>" },
        de: { appTitle: "Aufgabenliste", searchPlaceholder: "Suchen...", placeholder: "Aufgabe hinzufügen", shareToggle: "<i class='ph ph-broadcast'></i> Freigeben", shareToggleClose: "<i class='ph ph-x-circle'></i> Freigabe beenden", yourId: "Deine ID:", connectFriend: "Mit Freund verbinden:", friendIdPlaceholder: "Freunde-ID", copyButton: "Kopieren", connected: "Verbunden! <i class='ph ph-confetti'></i>", copied: "ID kopiert! <i class='ph ph-copy'></i>", disconnected: "Getrennt <i class='ph ph-x'></i>", darkMode: "Dunkler Modus", staticBg: "Statischer Hintergrund", liquidGlass: "Flüssiges Glas", langBtn: "Sprache", themeBtn: "Andere Themen", themeDefault: "Standard", deleteChat: "Löschen", ttSettings: "Einstellungen", ttTitleEdit: "Klicken zum Bearbeiten", ttAdd: "Hinzufügen", ttShare: "Verbindungsmenü", ttCopy: "ID kopieren", ttConnect: "Verbinden", ttDisconnect: "Trennen", ttEditTodo: "Bearbeiten", ttSaveTodo: "Speichern", ttNewChat: "Neuer Chat", chatLimit: "Maximal 20 Chats <i class='ph ph-warning'></i>" },
        fr: { appTitle: "Liste de tâches", searchPlaceholder: "Rechercher...", placeholder: "Ajouter une tâche", shareToggle: "<i class='ph ph-broadcast'></i> Partager", shareToggleClose: "<i class='ph ph-x-circle'></i> Fermer l'accès", yourId: "Votre ID:", connectFriend: "Se connecter à un ami:", friendIdPlaceholder: "Entrer l'ID", copyButton: "Copier", connected: "Connecté! <i class='ph ph-confetti'></i>", copied: "ID copié! <i class='ph ph-copy'></i>", disconnected: "Déconnecté <i class='ph ph-x'></i>", darkMode: "Mode sombre", staticBg: "Fond statique", liquidGlass: "Verre liquide", langBtn: "Langue", themeBtn: "Autres thèmes", themeDefault: "Défaut", deleteChat: "Supprimer", ttSettings: "Paramètres", ttTitleEdit: "Modifier le titre", ttAdd: "Ajouter", ttShare: "Menu connexion", ttCopy: "Copier ID", ttConnect: "Connecter", ttDisconnect: "Déconnecter", ttEditTodo: "Modifier", ttSaveTodo: "Enregistrer", ttNewChat: "Nouveau chat", chatLimit: "Maximum 20 chats <i class='ph ph-warning'></i>" },
        es: { appTitle: "Lista de tareas", searchPlaceholder: "Buscar...", placeholder: "Añadir tarea", shareToggle: "<i class='ph ph-broadcast'></i> Compartir", shareToggleClose: "<i class='ph ph-x-circle'></i> Cerrar", yourId: "Tu ID:", connectFriend: "Conectar con amigo:", friendIdPlaceholder: "ID del amigo", copyButton: "Copiar", connected: "¡Conectado! <i class='ph ph-confetti'></i>", copied: "¡ID copiado! <i class='ph ph-copy'></i>", disconnected: "Desconectado <i class='ph ph-x'></i>", darkMode: "Modo oscuro", staticBg: "Fondo estático", liquidGlass: "Cristal líquido", langBtn: "Idioma", themeBtn: "Otros temas", themeDefault: "Por defecto", deleteChat: "Eliminar", ttSettings: "Ajustes", ttTitleEdit: "Clic para editar", ttAdd: "Añadir", ttShare: "Menú de conexión", ttCopy: "Copiar ID", ttConnect: "Conectar", ttDisconnect: "Desconectar", ttEditTodo: "Editar", ttSaveTodo: "Guardar", ttNewChat: "Nuevo chat", chatLimit: "Máximo 20 chats <i class='ph ph-warning'></i>" },
        pt: { appTitle: "Lista de tarefas", searchPlaceholder: "Buscar...", placeholder: "Adicionar tarefa", shareToggle: "<i class='ph ph-broadcast'></i> Compartilhar", shareToggleClose: "<i class='ph ph-x-circle'></i> Fechar", yourId: "Seu ID:", connectFriend: "Conectar com amigo:", friendIdPlaceholder: "ID do amigo", copyButton: "Copiar", connected: "Conectado! <i class='ph ph-confetti'></i>", copied: "ID copiado! <i class='ph ph-copy'></i>", disconnected: "Desconectado <i class='ph ph-x'></i>", darkMode: "Modo escuro", staticBg: "Fundo estático", liquidGlass: "Vidro líquido", langBtn: "Idioma", themeBtn: "Outros temas", themeDefault: "Padrão", deleteChat: "Excluir", ttSettings: "Configurações", ttTitleEdit: "Clique para editar", ttAdd: "Adicionar", ttShare: "Conexão", ttCopy: "Copiar ID", ttConnect: "Conectar", ttDisconnect: "Desconectar", ttEditTodo: "Editar", ttSaveTodo: "Salvar", ttNewChat: "Novo chat", chatLimit: "Máximo 20 chats <i class='ph ph-warning'></i>" },
        it: { appTitle: "Lista cose da fare", searchPlaceholder: "Cerca...", placeholder: "Aggiungi attività", shareToggle: "<i class='ph ph-broadcast'></i> Condividi", shareToggleClose: "<i class='ph ph-x-circle'></i> Chiudi", yourId: "Tuo ID:", connectFriend: "Connetti a un amico:", friendIdPlaceholder: "ID amico", copyButton: "Copia", connected: "Connesso! <i class='ph ph-confetti'></i>", copied: "ID copiato! <i class='ph ph-copy'></i>", disconnected: "Disconnesso <i class='ph ph-x'></i>", darkMode: "Modalità scura", staticBg: "Sfondo statico", liquidGlass: "Vetro liquido", langBtn: "Lingua", themeBtn: "Altri temi", themeDefault: "Predefinito", deleteChat: "Elimina", ttSettings: "Impostazioni", ttTitleEdit: "Clicca per modificare", ttAdd: "Aggiungi", ttShare: "Menu connessione", ttCopy: "Copia ID", ttConnect: "Connetti", ttDisconnect: "Disconnetti", ttEditTodo: "Modifica", ttSaveTodo: "Salva", ttNewChat: "Nuovo chat", chatLimit: "Massimo 20 chat <i class='ph ph-warning'></i>" },
        nl: { appTitle: "Takenlijst", searchPlaceholder: "Zoek...", placeholder: "Taak toevoegen", shareToggle: "<i class='ph ph-broadcast'></i> Delen", shareToggleClose: "<i class='ph ph-x-circle'></i> Sluiten", yourId: "Jouw ID:", connectFriend: "Verbind met vriend:", friendIdPlaceholder: "Vriend ID", copyButton: "Kopiëren", connected: "Verbonden! <i class='ph ph-confetti'></i>", copied: "ID gekopieerd! <i class='ph ph-copy'></i>", disconnected: "Verbroken <i class='ph ph-x'></i>", darkMode: "Donkere modus", staticBg: "Statische achtergrond", liquidGlass: "Vloeibaar glas", langBtn: "Taal", themeBtn: "Andere thema's", themeDefault: "Standaard", deleteChat: "Verwijderen", ttSettings: "Instellingen", ttTitleEdit: "Klik om te bewerken", ttAdd: "Toevoegen", ttShare: "Verbindingsmenu", ttCopy: "Kopieer ID", ttConnect: "Verbinden", ttDisconnect: "Verbreken", ttEditTodo: "Bewerken", ttSaveTodo: "Opslaan", ttNewChat: "Nieuwe chat", chatLimit: "Maximaal 20 chats <i class='ph ph-warning'></i>" },
        sv: { appTitle: "Att göra", searchPlaceholder: "Sök...", placeholder: "Lägg till uppgift", shareToggle: "<i class='ph ph-broadcast'></i> Dela", shareToggleClose: "<i class='ph ph-x-circle'></i> Stäng", yourId: "Ditt ID:", connectFriend: "Anslut till vän:", friendIdPlaceholder: "Vännens ID", copyButton: "Kopiera", connected: "Ansluten! <i class='ph ph-confetti'></i>", copied: "ID kopierat! <i class='ph ph-copy'></i>", disconnected: "Frånkopplad <i class='ph ph-x'></i>", darkMode: "Mörkt läge", staticBg: "Statisk bakgrund", liquidGlass: "Flytande glas", langBtn: "Språk", themeBtn: "Andra teman", themeDefault: "Standard", deleteChat: "Radera", ttSettings: "Inställningar", ttTitleEdit: "Klicka för att redigera", ttAdd: "Lägg till", ttShare: "Anslutningsmeny", ttCopy: "Kopiera ID", ttConnect: "Anslut", ttDisconnect: "Koppla från", ttEditTodo: "Redigera", ttSaveTodo: "Spara", ttNewChat: "Ny chatt", chatLimit: "Max 20 chattar <i class='ph ph-warning'></i>" },
        tr: { appTitle: "Yapılacaklar", searchPlaceholder: "Ara...", placeholder: "Görev ekle", shareToggle: "<i class='ph ph-broadcast'></i> Paylaş", shareToggleClose: "<i class='ph ph-x-circle'></i> Kapat", yourId: "Senin ID:", connectFriend: "Arkadaşına bağlan:", friendIdPlaceholder: "Arkadaş ID'si", copyButton: "Kopyala", connected: "Bağlandı! <i class='ph ph-confetti'></i>", copied: "ID kopyalandı! <i class='ph ph-copy'></i>", disconnected: "Bağlantı koptu <i class='ph ph-x'></i>", darkMode: "Karanlık mod", staticBg: "Statik arka plan", liquidGlass: "Sıvı cam", langBtn: "Dil", themeBtn: "Diğer temalar", themeDefault: "Varsayılan", deleteChat: "Sil", ttSettings: "Ayarlar", ttTitleEdit: "Düzenlemek için tıklayın", ttAdd: "Ekle", ttShare: "Bağlantı menüsü", ttCopy: "ID kopyala", ttConnect: "Bağlan", ttDisconnect: "Bağlantıyı kes", ttEditTodo: "Düzenle", ttSaveTodo: "Kaydet", ttNewChat: "Yeni sohbet", chatLimit: "Maksimum 20 sohbet <i class='ph ph-warning'></i>" },
        bg: { appTitle: "Списък със задачи", searchPlaceholder: "Търсене...", placeholder: "Добавете задача", shareToggle: "<i class='ph ph-broadcast'></i> Сподели", shareToggleClose: "<i class='ph ph-x-circle'></i> Затвори", yourId: "Твоят ID:", connectFriend: "Свържи се с приятел:", friendIdPlaceholder: "ID на приятел", copyButton: "Копирай", connected: "Свързан! <i class='ph ph-confetti'></i>", copied: "ID копиран! <i class='ph ph-copy'></i>", disconnected: "Изключен <i class='ph ph-x'></i>", darkMode: "Тъмен режим", staticBg: "Статичен фон", liquidGlass: "Течно стъкло", langBtn: "Език", themeBtn: "Други теми", themeDefault: "По подразбиране", deleteChat: "Изтрий", ttSettings: "Настройки", ttTitleEdit: "Натисни за промяна", ttAdd: "Добави", ttShare: "Меню", ttCopy: "Копирай ID", ttConnect: "Свържи се", ttDisconnect: "Прекъсни", ttEditTodo: "Редактирай", ttSaveTodo: "Запази", ttNewChat: "Нов чат", chatLimit: "Максимум 20 чата <i class='ph ph-warning'></i>" },
        ar: { appTitle: "قائمة المهام", searchPlaceholder: "بحث...", placeholder: "أضف مهمة", shareToggle: "<i class='ph ph-broadcast'></i> مشاركة", shareToggleClose: "<i class='ph ph-x-circle'></i> إغلاق", yourId: "المعرف:", connectFriend: "الاتصال بصديق:", friendIdPlaceholder: "أدخل المعرف", copyButton: "نسخ", connected: "متصل! <i class='ph ph-confetti'></i>", copied: "تم النسخ! <i class='ph ph-copy'></i>", disconnected: "غير متصل <i class='ph ph-x'></i>", darkMode: "الوضع المظلم", staticBg: "خلفية ثابتة", liquidGlass: "زجاج سائل", langBtn: "لغة", themeBtn: "مواضيع أخرى", themeDefault: "افتراضي", deleteChat: "حذف", ttSettings: "الإعدادات", ttTitleEdit: "انقر للتعديل", ttAdd: "إضافة", ttShare: "قائمة الاتصال", ttCopy: "نسخ المعرف", ttConnect: "اتصال", ttDisconnect: "قطع الاتصال", ttEditTodo: "تعديل", ttSaveTodo: "حفظ", ttNewChat: "محادثة جديدة", chatLimit: "الحد الأقصى 20 محادثة <i class='ph ph-warning'></i>" },
        zh: { appTitle: "待办事项", searchPlaceholder: "搜索...", placeholder: "添加任务", shareToggle: "<i class='ph ph-broadcast'></i> 共享", shareToggleClose: "<i class='ph ph-x-circle'></i> 关闭", yourId: "你的 ID:", connectFriend: "连接朋友:", friendIdPlaceholder: "朋友的 ID", copyButton: "复制", connected: "已连接! <i class='ph ph-confetti'></i>", copied: "ID 已复制! <i class='ph ph-copy'></i>", disconnected: "已断开 <i class='ph ph-x'></i>", darkMode: "暗黑模式", staticBg: "静态背景", liquidGlass: "液态玻璃", langBtn: "语言", themeBtn: "其他主题", themeDefault: "默认", deleteChat: "删除", ttSettings: "设置", ttTitleEdit: "点击编辑", ttAdd: "添加", ttShare: "连接", ttCopy: "复制 ID", ttConnect: "连接", ttDisconnect: "断开", ttEditTodo: "编辑", ttSaveTodo: "保存", ttNewChat: "新聊天", chatLimit: "最多 20 个聊天 <i class='ph ph-warning'></i>" },
        ja: { appTitle: "To-Doリスト", searchPlaceholder: "検索...", placeholder: "タスクを追加", shareToggle: "<i class='ph ph-broadcast'></i> 共有", shareToggleClose: "<i class='ph ph-x-circle'></i> 閉じる", yourId: "あなたの ID:", connectFriend: "友達に接続:", friendIdPlaceholder: "友達のID", copyButton: "コピー", connected: "接続完了! <i class='ph ph-confetti'></i>", copied: "IDをコピー! <i class='ph ph-copy'></i>", disconnected: "切断されました <i class='ph ph-x'></i>", darkMode: "ダークモード", staticBg: "静的背景", liquidGlass: "液体ガラス", langBtn: "言語", themeBtn: "他のテーマ", themeDefault: "デフォルト", deleteChat: "削除", ttSettings: "設定", ttTitleEdit: "編集", ttAdd: "追加", ttShare: "接続", ttCopy: "IDコピー", ttConnect: "接続", ttDisconnect: "切断", ttEditTodo: "編集", ttSaveTodo: "保存", ttNewChat: "新しいチャット", chatLimit: "最大20チャット <i class='ph ph-warning'></i>" },
        ko: { appTitle: "할 일 목록", searchPlaceholder: "검색...", placeholder: "할 일 추가", shareToggle: "<i class='ph ph-broadcast'></i> 공유", shareToggleClose: "<i class='ph 포-x-circle'></i> 닫기", yourId: "귀하의 ID:", connectFriend: "친구와 연결:", friendIdPlaceholder: "친구의 ID", copyButton: "복사", connected: "연결됨! <i class='ph ph-confetti'></i>", copied: "ID 복사됨! <i class='ph ph-copy'></i>", disconnected: "연결 끊김 <i class='ph ph-x'></i>", darkMode: "다크 모드", staticBg: "정적 배경", liquidGlass: "액체 유리", langBtn: "언어", themeBtn: "다른 테마", themeDefault: "기본값", deleteChat: "삭제", ttSettings: "설정", ttTitleEdit: "수정", ttAdd: "추가", 인Share: "연결", ttCopy: "ID 복사", ttConnect: "연결", ttDisconnect: "연결 끊기", ttEditTodo: "수정", ttSaveTodo: "저장", ttNewChat: "새 채팅", chatLimit: "최대 20개 채팅 <i class='ph ph-warning'></i>" },
        hi: { appTitle: "कार्य सूची", searchPlaceholder: "खोजें...", placeholder: "कार्य जोड़ें", shareToggle: "<i class='ph ph-broadcast'></i> साझा करें", shareToggleClose: "<i class='ph ph-x-circle'></i> बंद करें", yourId: "आपकी ID:", connectFriend: "दोस्त से जुड़ें:", friendIdPlaceholder: "दोस्त की ID", copyButton: "कॉपी", connected: "जुड़ गया! <i class='ph ph-confetti'></i>", copied: "ID कॉपी की गई! <i class='ph ph-copy'></i>", disconnected: "संपर्क टूट गया <i class='ph ph-x'></i>", darkMode: "डार्क मोड", staticBg: "स्थिर पृष्ठभूमि", liquidGlass: "तरल ग्लास", langBtn: "भाषा", themeBtn: "अन्य विषय", themeDefault: "डिफ़ॉल्ट", deleteChat: "हटाएं", ttSettings: "सेटिंग्स", ttTitleEdit: "संपादित करें", ttAdd: "जोड़ें", ttShare: "कनेक्शन", ttCopy: "ID कॉपी", ttConnect: "जुड़ें", ttDisconnect: "डिस्कनेक्ट", ttEditTodo: "संपादित करें", ttSaveTodo: "सहेजें", ttNewChat: "नई चैट", chatLimit: "अधिकतम 20 चैट <i class='ph ph-warning'></i>" }
    },

    init() {
        this.loadSavedLanguage();
        this.setupSettingsMenu();
        this.renderThemeMenu(); 
        this.loadSavedTheme();
        this.highlightSelectedLanguage();
    },

    renderThemeMenu() {
        const isLiquid = document.body.classList.contains('liquid-glass');
        const list = document.getElementById('themeList');
        if (!list) return;

        let html = `<button data-theme="default" class="selected">
                        <div class="theme-preview default ${isLiquid ? 'liquid' : 'solid'}"></div>
                        <span class="theme-name">За замовчуванням</span>
                    </button>`;
        
        if (isLiquid) {
            html += `<div class="settings-divider" style="margin: 8px 0; background: rgba(255,255,255,0.1);"></div>
                     <div style="font-size: 11px; padding: 0 10px 5px; opacity: 0.5; font-weight: bold; text-transform: uppercase;">Liquid Gradients</div>`;
            const liquidNames = [
                "Ocean Blue", "Fire Orange", "Blood Red", "Deep Purple", "Mint Green", 
                "Neon Pink", "Amethyst", "Galaxy", "Spring Grass", "Toxic Green", 
                "Sunset", "Peach Rose", "Steel Gray", "Midnight Blue", "Coral Reef", 
                "Cyberpunk", "Cotton Candy", "Warm Sun", "Ice Water", "Lavender", 
                "Pastel Peach", "Cloud White", "Frost Rose", "Winter Sky", "Crystal Violet", 
                "Neon Fuchsia", "Cyan Breeze", "Emerald Glow", "Lemonade", "Royal Indigo", 
                "Summer Sky", "Deep Teal", "Crimson Tide", "Electric Violet", "Magenta Pop", 
                "Azure Flow", "Pearl White", "Bright Sapphire", "Forest Emerald", "Bubblegum", 
                "Aqua Marine", "Soft Lilac", "Golden Sand", "Deep Amethyst", "Clear Sky", 
                "Rose Gold", "Volcano", "Lime Neon", "Purple Velvet", "Pure Black"
            ];
            for(let i=1; i<=50; i++) {
                html += `<button data-theme="theme-${i}"><div class="theme-preview liquid t${i}"></div> ${liquidNames[i-1]}</button>`;
            }
        } else {
            html += `<div class="settings-divider" style="margin: 8px 0; background: rgba(0,0,0,0.1);"></div>
                     <div style="font-size: 11px; padding: 0 10px 5px; opacity: 0.5; font-weight: bold; text-transform: uppercase;">Deep Forest (Темні)</div>`;
            const forestNames = ["Deep Forest", "Pine Needle", "Dark Navy", "Midnight Slate", "Dark Plum", "Espresso", "Charcoal", "Swamp Green", "Muddy Wood", "Storm Grey", "Iron", "Graphite", "Black Onyx", "Dark Oak", "Roasted Bean", "Obsidian", "Deep Olive", "Carbon", "Night Sky", "Jungle", "Dark Earth", "Matte Black", "Ash", "Deep Moss", "Vintage Leather"];
            for(let i=51; i<=75; i++) {
                html += `<button data-theme="theme-${i}"><div class="theme-preview solid t${i}"></div> ${forestNames[i-51]}</button>`;
            }
            html += `<div class="settings-divider" style="margin: 8px 0; background: rgba(0,0,0,0.1);"></div>
                     <div style="font-size: 11px; padding: 0 10px 5px; opacity: 0.5; font-weight: bold; text-transform: uppercase;">Champagne (Світлі)</div>`;
            const champNames = ["Champagne", "Soft Beige", "Linen", "Cornsilk", "Bisque", "Wheat", "Lemon Chiffon", "Khaki", "Pale Gold", "Tan", "Burlywood", "White Smoke", "Parchment", "Bone", "Alabaster", "Cream", "Sand", "Desert", "Pale Brass", "Oyster", "Vanilla", "Peach Puff", "Cashmere", "Silk", "Pearl"];
            for(let i=76; i<=100; i++) {
                html += `<button data-theme="theme-${i}"><div class="theme-preview solid t${i}"></div> ${champNames[i-76]}</button>`;
            }
        }
        list.innerHTML = html;

        const defaultThemeSpan = document.querySelector('.theme-list button[data-theme="default"] .theme-name');
        if (defaultThemeSpan) defaultThemeSpan.textContent = this.getT('themeDefault');

        const savedTheme = isLiquid 
            ? (localStorage.getItem('theme_liquid') || 'default') 
            : (localStorage.getItem('theme_solid') || 'theme-51');
            
        const selectedBtn = document.querySelector(`.theme-list button[data-theme="${savedTheme}"]`);
        if (selectedBtn) selectedBtn.classList.add('selected');
    },

    setupSettingsMenu() {
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsDropdown = document.getElementById('settingsDropdown');
        const langBtn = document.getElementById('langBtn');
        const langDropdown = document.getElementById('languageDropdown');
        const searchInput = document.getElementById('langSearch');
        const themeBtn = document.getElementById('themeBtn');
        const themeDropdown = document.getElementById('themeDropdown');

        if (!settingsBtn || !settingsDropdown || !langBtn || !langDropdown || !themeBtn || !themeDropdown) return;

        const toggleOverlay = () => {
            const isAnyOpen = settingsDropdown.classList.contains('active') || langDropdown.classList.contains('active') || themeDropdown.classList.contains('active');
            document.body.classList.toggle('menu-open', isAnyOpen);
        };

        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (settingsDropdown.classList.contains('active')) {
                settingsDropdown.classList.remove('active');
                if (window.innerWidth > 768) setTimeout(() => settingsDropdown.style.display = 'none', 400);
                
                langDropdown.classList.remove('active');
                themeDropdown.classList.remove('active');
                if (window.innerWidth > 768) {
                    setTimeout(() => langDropdown.style.display = 'none', 300);
                    setTimeout(() => themeDropdown.style.display = 'none', 300);
                }
            } else {
                if (window.innerWidth > 768) settingsDropdown.style.display = 'flex';
                setTimeout(() => settingsDropdown.classList.add('active'), 10);
            }
            toggleOverlay();
        });

        document.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.settings-menu-container') && !e.target.closest('.solid-dropdown')) {
                let subMenuClosed = false;

                if (langDropdown.classList.contains('active')) {
                    langDropdown.classList.remove('active');
                    if(window.innerWidth > 768) setTimeout(() => langDropdown.style.display = 'none', 300);
                    subMenuClosed = true;
                }
                if (themeDropdown.classList.contains('active')) {
                    themeDropdown.classList.remove('active');
                    if(window.innerWidth > 768) setTimeout(() => themeDropdown.style.display = 'none', 300);
                    subMenuClosed = true;
                }

                if (!subMenuClosed && settingsDropdown.classList.contains('active')) {
                    settingsDropdown.classList.remove('active');
                    if(window.innerWidth > 768) setTimeout(() => settingsDropdown.style.display = 'none', 400);
                }
                toggleOverlay();
            }
            
            if (e.button === 0) {
                const isDeleteMenu = e.target.closest('.delete-chat-menu');
                if (!isDeleteMenu) { removeDeleteMenu(); }
            }
        });
        
        settingsDropdown.addEventListener('click', (e) => e.stopPropagation());

        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (themeDropdown.classList.contains('active')) {
                themeDropdown.classList.remove('active');
                if(window.innerWidth > 768) setTimeout(() => themeDropdown.style.display = 'none', 300);
            }
            if (langDropdown.classList.contains('active')) {
                langDropdown.classList.remove('active');
                if(window.innerWidth > 768) setTimeout(() => langDropdown.style.display = 'none', 300);
            } else {
                if(window.innerWidth > 768) langDropdown.style.display = 'flex';
                setTimeout(() => langDropdown.classList.add('active'), 10);
            }
            toggleOverlay();
        });

        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (langDropdown.classList.contains('active')) {
                langDropdown.classList.remove('active');
                if(window.innerWidth > 768) setTimeout(() => langDropdown.style.display = 'none', 300);
            }
            if (themeDropdown.classList.contains('active')) {
                themeDropdown.classList.remove('active');
                if(window.innerWidth > 768) setTimeout(() => themeDropdown.style.display = 'none', 300);
            } else {
                if(window.innerWidth > 768) themeDropdown.style.display = 'flex';
                setTimeout(() => themeDropdown.classList.add('active'), 10);
            }
            toggleOverlay();
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.language-list button').forEach(btn => {
                    btn.style.display = btn.textContent.toLowerCase().includes(term) ? 'flex' : 'none';
                });
            });
        }

        const langListContainer = document.getElementById('langList');
        if (langListContainer) {
            langListContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (btn && btn.dataset.lang) {
                    this.switchLanguage(btn.dataset.lang);
                    langDropdown.classList.remove('active');
                    if(window.innerWidth > 768) setTimeout(() => langDropdown.style.display = 'none', 300);
                    toggleOverlay();
                }
            });
        }

        const themeListContainer = document.getElementById('themeList');
        if (themeListContainer) {
            themeListContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (btn && btn.dataset.theme) {
                    this.switchTheme(btn.dataset.theme);
                    themeDropdown.classList.remove('active');
                    if(window.innerWidth > 768) setTimeout(() => themeDropdown.style.display = 'none', 300);
                    toggleOverlay();
                }
            });
        }

        const darkModeToggle = document.getElementById('darkModeToggle');
        const freezeBgToggle = document.getElementById('freezeBgToggle');
        const liquidGlassToggle = document.getElementById('liquidGlassToggle');

        if (darkModeToggle && localStorage.getItem('darkMode') === 'true') { document.body.classList.add('dark-mode'); darkModeToggle.checked = true; }
        
        // ЗМІНЕНО: Коректна пауза для анімації
        if (freezeBgToggle && localStorage.getItem('freezeBg') === 'true') { 
            document.body.style.setProperty('animation-play-state', 'paused', 'important'); 
            freezeBgToggle.checked = true; 
        }
        
        if (liquidGlassToggle) {
            const isLiquid = localStorage.getItem('liquidGlass') !== 'false';
            liquidGlassToggle.checked = isLiquid;
            document.body.classList.toggle('liquid-glass', isLiquid);
            
            liquidGlassToggle.addEventListener('change', (e) => {
                const isLiquidChecked = e.target.checked;
                document.body.classList.toggle('liquid-glass', isLiquidChecked);
                localStorage.setItem('liquidGlass', isLiquidChecked);
                this.renderThemeMenu();
                
                const savedTheme = isLiquidChecked 
                    ? (localStorage.getItem('theme_liquid') || 'default') 
                    : (localStorage.getItem('theme_solid') || 'theme-51');
                    
                this.switchTheme(savedTheme);
            });
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                document.body.classList.toggle('dark-mode', e.target.checked);
                localStorage.setItem('darkMode', e.target.checked);
                const isLiq = document.body.classList.contains('liquid-glass');
                const currTheme = isLiq ? (localStorage.getItem('theme_liquid') || 'default') : (localStorage.getItem('theme_solid') || 'theme-51');
                this.switchTheme(currTheme);
            });
        }
        
        // ЗМІНЕНО: Логіка для кнопки паузи (тепер працює 100%)
        if (freezeBgToggle) {
            freezeBgToggle.addEventListener('change', (e) => {
                document.body.style.setProperty('animation-play-state', e.target.checked ? 'paused' : 'running', 'important');
                localStorage.setItem('freezeBg', e.target.checked);
            });
        }
    },

    switchLanguage(lang) {
        if (!this.translations[lang]) lang = 'en'; 
        this.currentLang = lang;
        this.applyTranslations();
        localStorage.setItem('preferredLanguage', lang);
        this.highlightSelectedLanguage();
        renderSidebar(); 
    },

    switchTheme(themeName) {
        const isLiquid = document.body.classList.contains('liquid-glass');
        
        if (isLiquid) { localStorage.setItem('theme_liquid', themeName); } 
        else { localStorage.setItem('theme_solid', themeName); }
        
        // ЗМІНЕНО: Обов'язково видаляємо ВСІ теми
        for (let i = 1; i <= 100; i++) document.body.classList.remove('theme-' + i);
        document.body.classList.remove('theme-default');
        
        if (themeName !== 'default') document.body.classList.add(themeName);
        else document.body.classList.add('theme-default'); // Додаємо клас за замовчуванням
        
        const lightThemes = [
            'theme-17', 'theme-18', 'theme-19', 'theme-20', 'theme-21', 'theme-22', 'theme-23', 'theme-24', 'theme-25', 'theme-26', 'theme-28', 'theme-29', 'theme-31', 'theme-37', 'theme-42', 'theme-43', 'theme-45', 'theme-46', 'theme-48'
        ];
        for(let i=76; i<=100; i++) lightThemes.push('theme-'+i);
        
        const isLight = lightThemes.includes(themeName);
        
        if (isLight) { document.body.classList.add('light-text', 'light-theme-active'); } 
        else { document.body.classList.remove('light-text', 'light-theme-active'); }
        
        let styleTag = document.getElementById('dynamic-theme-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-theme-styles';
            document.head.appendChild(styleTag);
        }

        void document.body.offsetWidth; 
        const rgb = window.getComputedStyle(document.body).backgroundColor;
        let menuBgSolid = isLiquid ? (isLight ? '#f8fafc' : '#1e293b') : (rgb !== 'rgba(0, 0, 0, 0)' ? rgb : (isLight ? '#F7E7CE' : '#1A2421'));

        let css = '';

        if (isLiquid) {
            css += `
                .glass-panel { background: rgba(255, 255, 255, 0.1) !important; backdrop-filter: blur(16px) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2) !important; color: white !important; }
                
                .settings-dropdown, .solid-dropdown { 
                    background: ${menuBgSolid} !important; 
                    backdrop-filter: none !important; 
                    border: 1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'} !important; 
                    box-shadow: 0 10px 40px rgba(0, 0, 0, ${isLight ? '0.1' : '0.4'}) !important; 
                    color: ${isLight ? '#1e293b' : 'white'} !important; 
                }
                .solid-dropdown .language-search { background: ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'} !important; color: inherit !important; }
                
                .glass-input { background: rgba(255, 255, 255, 0.1) !important; border: 1px solid rgba(255, 255, 255, 0.3) !important; color: white !important; backdrop-filter: blur(5px) !important; }
                .glass-input::placeholder { color: rgba(255, 255, 255, 0.6) !important; font-weight: 400 !important; }
                .glass-btn { background: rgba(255, 255, 255, 0.15) !important; border: 1px solid rgba(255, 255, 255, 0.3) !important; color: white !important; backdrop-filter: blur(5px) !important; box-shadow: none !important; }
                .glass-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.25) !important; box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2) !important; }
                li { background: rgba(255, 255, 255, 0.1) !important; backdrop-filter: blur(10px) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; color: white !important; box-shadow: none !important; }
                li.editing { background: rgba(255, 255, 255, 0.25) !important; box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important; }
                .chat-dot { background: rgba(255, 255, 255, 0.3) !important; border: 2px solid transparent !important; }
                .chat-dot.active { background: #ffffff !important; box-shadow: 0 0 14px 2px rgba(255, 255, 255, 0.9) !important; }
                .todo-content.completed { text-decoration-color: rgba(255, 255, 255, 0.8) !important; opacity: 0.5 !important; }
                .main-title, #chatTitle, .settings-item, i { color: white !important; }
                body { color: white !important; }
            `;

            if (isLight) {
                let normalColor = "#1e293b";
                let darkColor = "#000000";
                
                css += `
                    body.light-text:not(.dark-mode), body.light-text:not(.dark-mode) *, body.light-text:not(.dark-mode) #chatTitle, body.light-text:not(.dark-mode) .main-title { color: ${normalColor} !important; text-shadow: none !important; font-weight: 500 !important; }
                    body.light-text.dark-mode, body.light-text.dark-mode *, body.light-text.dark-mode #chatTitle, body.light-text.dark-mode .main-title { color: ${darkColor} !important; font-weight: 700 !important; text-shadow: none !important; }
                    
                    body.light-text .glass-input { background: rgba(255, 255, 255, 0.5) !important; border-color: rgba(0, 0, 0, 0.4) !important; }
                    body.light-text .glass-input::placeholder { color: rgba(0, 0, 0, 0.7) !important; font-weight: 400 !important; }
                    body.light-text .glass-btn { background: rgba(255, 255, 255, 0.3) !important; border-color: rgba(0, 0, 0, 0.4) !important; }
                    body.light-text .glass-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.6) !important; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15) !important; }
                    body.light-text li { background: rgba(255, 255, 255, 0.4) !important; border-color: rgba(0, 0, 0, 0.3) !important; }
                    body.light-text li.editing { background: rgba(255, 255, 255, 0.8) !important; }
                    body.light-text .chat-dot { background: rgba(0, 0, 0, 0.25) !important; border-color: transparent !important; }
                    body.light-text .chat-dot.active { background: #000000 !important; box-shadow: 0 0 12px rgba(0,0,0,0.4) !important; }
                    body.light-text .todo-content.completed { text-decoration-color: #000000 !important; opacity: 0.7 !important; }
                `;
            }

        } else {
            css += `
                #freezeBgContainer { display: none !important; }
            `;

            if (isLight) {
                let normalColor = "#1A2421";
                let darkColor = "#000000";
                
                css += `
                    body.light-text:not(.dark-mode), body.light-text:not(.dark-mode) * { color: ${normalColor} !important; text-shadow: none !important; }
                    body.light-text:not(.dark-mode) .main-title, body.light-text:not(.dark-mode) #chatTitle, body.light-text:not(.dark-mode) .settings-item, body.light-text:not(.dark-mode) i { color: ${normalColor} !important; text-shadow: none !important; font-weight: 600 !important; }
                    
                    body.light-text.dark-mode, body.light-text.dark-mode * { color: ${darkColor} !important; text-shadow: none !important; }
                    body.light-text.dark-mode .main-title, body.light-text.dark-mode #chatTitle, body.light-text.dark-mode .settings-item, body.light-text.dark-mode i { color: ${darkColor} !important; font-weight: 800 !important; text-shadow: none !important; }

                    .glass-panel { background: rgba(255, 255, 255, 0.45) !important; border: 1px solid rgba(0, 0, 0, 0.1) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; backdrop-filter: none !important; }
                    
                    .settings-dropdown, .solid-dropdown { 
                        background: ${menuBgSolid} !important; 
                        backdrop-filter: none !important; 
                        border: 1px solid rgba(0,0,0,0.1) !important; 
                        box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important; 
                    }
                    .solid-dropdown .language-search { background: rgba(0,0,0,0.05) !important; }

                    .glass-input { background: rgba(255, 255, 255, 0.5) !important; border: 1px solid rgba(0, 0, 0, 0.1) !important; backdrop-filter: none !important; font-weight: 500 !important; }
                    .glass-input::placeholder { color: rgba(26, 36, 33, 0.6) !important; font-weight: 400 !important; }
                    .glass-btn { background: rgba(255, 255, 255, 0.3) !important; border: 1px solid rgba(0, 0, 0, 0.1) !important; backdrop-filter: none !important; box-shadow: none !important; }
                    .glass-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.7) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important; }
                    li { background: rgba(255, 255, 255, 0.4) !important; border: 1px solid rgba(0, 0, 0, 0.1) !important; backdrop-filter: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important; font-weight: 500 !important; }
                    li.editing { background: rgba(255, 255, 255, 0.9) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
                    .chat-dot { background: rgba(0, 0, 0, 0.15) !important; border: none !important; }
                    .chat-dot.active { background: ${normalColor} !important; box-shadow: none !important; }
                    .todo-content.completed { text-decoration-color: inherit !important; opacity: 0.5 !important; }
                `;
            } else {
                css += `
                    body, body * { color: #F7E7CE !important; text-shadow: none !important; }
                    .main-title, #chatTitle, .settings-item, i { color: #F7E7CE !important; text-shadow: none !important; font-weight: 400 !important;}
                    
                    .glass-panel { background: rgba(0, 0, 0, 0.25) !important; border: 1px solid rgba(255, 255, 255, 0.08) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important; backdrop-filter: none !important; }
                    
                    .settings-dropdown, .solid-dropdown { 
                        background: ${menuBgSolid} !important; 
                        backdrop-filter: none !important; 
                        border: 1px solid rgba(255,255,255,0.08) !important; 
                        box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important; 
                    }
                    .solid-dropdown .language-search { background: rgba(255,255,255,0.1) !important; }

                    .glass-input { background: rgba(0, 0, 0, 0.3) !important; border: 1px solid rgba(255, 255, 255, 0.08) !important; backdrop-filter: none !important; font-weight: 500 !important;}
                    .glass-input::placeholder { color: rgba(247, 231, 206, 0.5) !important; font-weight: 400 !important;}
                    .glass-btn { background: rgba(0, 0, 0, 0.4) !important; border: 1px solid rgba(255, 255, 255, 0.08) !important; backdrop-filter: none !important; box-shadow: none !important; }
                    .glass-btn:hover:not(:disabled) { background: rgba(0, 0, 0, 0.6) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important; }
                    li { background: rgba(0, 0, 0, 0.25) !important; border: 1px solid rgba(255, 255, 255, 0.08) !important; backdrop-filter: none !important; box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important; font-weight: 500 !important;}
                    li.editing { background: rgba(0, 0, 0, 0.6) !important; box-shadow: 0 8px 20px rgba(0,0,0,0.3) !important; }
                    .chat-dot { background: rgba(255, 255, 255, 0.2) !important; border: none !important;}
                    .chat-dot.active { background: #F7E7CE !important; box-shadow: none !important;}
                    .todo-content.completed { text-decoration-color: #F7E7CE !important; opacity: 0.5 !important; }
                `;
            }
        }
        
        css += `
            .delete-chat-menu { position: absolute; z-index: 10000; display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; background: #000000 !important; border: none !important; cursor: pointer; white-space: nowrap; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4) !important; transition: transform 0.2s ease, background 0.2s ease; }
            .delete-chat-menu, .delete-chat-menu * { color: white !important; font-weight: 600 !important; text-shadow: none !important; font-size: 15px; font-family: inherit; }
            .delete-chat-menu:hover { background: #333333 !important; transform: scale(1.05); }
        `;
        
        styleTag.innerHTML = css;
        
        document.querySelectorAll('.theme-list button').forEach(btn => btn.classList.remove('selected'));
        const selectedBtn = document.querySelector(`.theme-list button[data-theme="${themeName}"]`);
        if (selectedBtn) selectedBtn.classList.add('selected');
    },

    loadSavedTheme() {
        const isLiquid = document.body.classList.contains('liquid-glass');
        const savedTheme = isLiquid 
            ? (localStorage.getItem('theme_liquid') || 'default') 
            : (localStorage.getItem('theme_solid') || 'theme-51');
        this.switchTheme(savedTheme);
    },

    safeSetText(id, text) { const el = document.getElementById(id); if (el && text !== undefined) el.textContent = text; },
    safeSetHTML(id, html) { const el = document.getElementById(id); if (el && html !== undefined) el.innerHTML = html; },
    safeSetPlaceholder(id, text) { const el = document.getElementById(id); if (el && text !== undefined) el.placeholder = text; },
    safeSetTooltip(id, text) { 
        const el = document.getElementById(id); 
        if (el && text !== undefined) { 
            if(el.hasAttribute('data-tooltip-bottom')) el.dataset.tooltipBottom = text; 
            else el.dataset.tooltip = text; 
        } 
    },

    applyTranslations() {
        const t = this.translations[this.currentLang] || this.translations['en'];
        
        this.safeSetText('mainAppTitle', t.appTitle);
        this.safeSetPlaceholder('text', t.placeholder);
        this.safeSetPlaceholder('langSearch', t.searchPlaceholder);
        this.safeSetHTML('langBtn', `<i class="ph ph-translate"></i> <span>${t.langBtn}</span> <i class="ph ph-caret-right" style="margin-left: auto;"></i>`);
        this.safeSetHTML('themeBtn', `<i class="ph ph-palette"></i> <span id="themeBtnText">${t.themeBtn}</span> <i class="ph ph-caret-right" style="margin-left: auto;"></i>`);
        
        const defaultThemeSpan = document.querySelector('.theme-list button[data-theme="default"] .theme-name');
        if (defaultThemeSpan) defaultThemeSpan.textContent = t.themeDefault;

        const shareBtn = document.getElementById('shareToggleBtn');
        const sharePanel = document.getElementById('sharePanel');
        if (shareBtn && sharePanel) shareBtn.innerHTML = sharePanel.classList.contains('open') ? t.shareToggleClose : t.shareToggle;
        
        this.safeSetText('yourIdLabel', t.yourId);
        this.safeSetText('connectFriendLabel', t.connectFriend);
        this.safeSetPlaceholder('friendIdInput', t.friendIdPlaceholder);
        this.safeSetHTML('copyIdBtn', `<i class="ph ph-copy"></i> ${t.copyButton}`);
        this.safeSetHTML('connectedIndicator', t.connected);
        this.safeSetHTML('copiedIndicator', t.copied);
        this.safeSetHTML('disconnectedIndicator', t.disconnected);
        
        this.safeSetHTML('limitIndicator', t.chatLimit || "Максимум 20 чатів <i class='ph ph-warning'></i>");
        
        this.safeSetText('darkModeLabel', t.darkMode);
        this.safeSetText('staticBgLabel', t.staticBg);
        this.safeSetText('liquidGlassLabel', t.liquidGlass || "Liquid glass");

        this.safeSetTooltip('settingsBtn', t.ttSettings);
        this.safeSetTooltip('chatTitle', t.ttTitleEdit);
        this.safeSetTooltip('btn', t.ttAdd);
        this.safeSetTooltip('shareToggleBtn', t.ttShare);
        this.safeSetTooltip('copyIdBtn', t.ttCopy);
        this.safeSetTooltip('connectBtn', t.ttConnect);
        this.safeSetTooltip('disconnectBtn', t.ttDisconnect);
        
        document.querySelectorAll('.edit-btn').forEach(btn => btn.dataset.tooltip = t.ttEditTodo);
        document.querySelectorAll('.save-btn').forEach(btn => btn.dataset.tooltip = t.ttSaveTodo);
    },

    highlightSelectedLanguage() {
        document.querySelectorAll('.language-list button').forEach(btn => btn.classList.remove('selected'));
        const selectedBtn = document.querySelector(`.language-list button[data-lang="${this.currentLang}"]`);
        if (selectedBtn) selectedBtn.classList.add('selected');
    },

    loadSavedLanguage() {
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) this.switchLanguage(savedLang);
        else this.applyTranslations(); 
    },
    
    getT(key) { return (this.translations[this.currentLang] || this.translations['en'])[key] || ""; }
};

// ==================== CORE APP LOGIC ====================

const getChatElements = () => [
    document.getElementById("chatTitle"),
    document.querySelector(".input-container"),
    document.getElementById("shareToggleBtn"),
    document.getElementById("sharePanel"),
    document.getElementById("todolist")
].filter(el => el);

function initApp() {
    renderSidebar();
    renderActiveChat();
    initSharePanel();

    const titleEl = document.getElementById('chatTitle');
    if (titleEl) {
        titleEl.addEventListener('blur', saveChatTitle);
        titleEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); }
        });
    }

    const btn = document.getElementById("btn");
    if (btn) btn.addEventListener("click", add);
}

function renderSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    if (!sidebar) return;
    sidebar.innerHTML = '';
    
    chatsData.forEach(chat => {
        const dot = document.createElement('button');
        dot.id = 'dot-' + chat.id; 
        dot.className = `chat-dot ${chat.id === activeChatId ? 'active' : ''}`;
        dot.dataset.tooltip = chat.name;
        
        dot.onclick = (e) => {
            switchChat(chat.id);
        };

        let pressTimer;
        
        const startPress = (e) => {
            if(e.type === 'mousedown' && e.button !== 0) return;
            pressTimer = setTimeout(() => { showDeleteMenu(chat.id, dot); }, 600); 
        };
        const cancelPress = () => clearTimeout(pressTimer);

        dot.addEventListener('mousedown', startPress);
        dot.addEventListener('mouseup', cancelPress);
        dot.addEventListener('mouseleave', cancelPress);
        
        dot.addEventListener('contextmenu', (e) => {
            e.preventDefault(); 
            cancelPress();
            showDeleteMenu(chat.id, dot);
        });
        
        dot.addEventListener('touchstart', startPress, {passive: true});
        dot.addEventListener('touchmove', cancelPress, {passive: true});
        dot.addEventListener('touchend', cancelPress);
        dot.addEventListener('touchcancel', cancelPress);

        sidebar.appendChild(dot);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'add-chat-btn';
    addBtn.innerHTML = '<i class="ph ph-plus"></i>';
    addBtn.dataset.tooltip = languageManager.getT('ttNewChat') || "Новий чат";
    addBtn.onclick = (e) => { e.stopPropagation(); removeDeleteMenu(); createNewChat(); };
    sidebar.appendChild(addBtn);
}

function removeDeleteMenu() {
    const existing = document.querySelector('.delete-chat-menu');
    if (existing) existing.remove();
}

function showDeleteMenu(chatId, dotElement) {
    removeDeleteMenu();
    if (chatsData.length <= 1) return;

    const btn = document.createElement('button');
    btn.className = 'delete-chat-menu glass-btn';
    btn.innerHTML = `<i class="ph ph-trash"></i> <span>${languageManager.getT('deleteChat') || "Видалити"}</span>`;
    document.body.appendChild(btn);

    const rect = dotElement.getBoundingClientRect();

    if (window.innerWidth <= 768) {
        btn.style.left = (rect.left + rect.width / 2) + 'px';
        btn.style.top = (rect.top - 40) + 'px';
        btn.style.transform = 'translate(-50%, 0)';
    } else {
        btn.style.top = (rect.top + rect.height / 2) + 'px';
        btn.style.left = (rect.left - 10) + 'px';
        btn.style.transform = 'translate(-100%, -50%)';
    }

    const handleDelete = (e) => {
        e.stopPropagation();
        e.preventDefault();
        btn.remove();
        deleteChat(chatId);
    };

    btn.onmousedown = handleDelete;
    btn.ontouchstart = handleDelete;
}

function deleteChat(id) {
    const dotElement = document.getElementById(`dot-${id}`);
    const isActiveChat = (id === activeChatId);
    
    if (dotElement) dotElement.classList.add('deleting');
    
    const els = getChatElements();

    const performDeletion = () => {
        chatsData = chatsData.filter(c => c.id !== id);
        if (isActiveChat) activeChatId = chatsData[0].id;
        saveAllData();
        renderSidebar();
        
        if (isActiveChat) {
            els.forEach(el => {
                el.style.transition = 'none';
                el.style.transform = 'translateX(-50px) scale(0.95)';
                el.style.opacity = '0';
            });
            
            renderActiveChat();
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    els.forEach((el, index) => {
                        el.style.transition = `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.03}s`;
                        el.style.transform = 'translateX(0) scale(1)';
                        el.style.opacity = '1';
                        
                        setTimeout(() => {
                            el.style.transition = ""; el.style.transform = ""; el.style.opacity = "";
                        }, 450);
                    });
                });
            });
        }
        if(peerManager.conn) peerManager.sendData();
    };

    if (isActiveChat) {
        els.forEach((el, index) => {
            el.style.transition = `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.03}s`;
            el.style.transform = 'translateX(100px) scale(0.9)';
            el.style.opacity = '0';
        });
        setTimeout(performDeletion, 400); 
    } else {
        setTimeout(performDeletion, 300);
    }
}

function switchChat(id) {
    if (activeChatId === id) return;
    
    const els = getChatElements();
    
    els.forEach((el, index) => {
        el.style.transition = `all 0.3s ease ${index * 0.02}s`;
        el.style.transform = 'translateY(15px)';
        el.style.opacity = '0';
    });
    
    setTimeout(() => {
        activeChatId = id;
        localStorage.setItem('todolist_active_chat', id);
        renderSidebar();
        
        els.forEach(el => {
            el.style.transition = 'none';
            el.style.transform = 'translateY(-15px)';
            el.style.opacity = '0';
        });
        
        renderActiveChat();
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                els.forEach((el, index) => {
                    el.style.transition = `all 0.3s ease ${index * 0.02}s`;
                    el.style.transform = 'translateY(0)';
                    el.style.opacity = '1';
                    
                    setTimeout(() => {
                        el.style.transition = ""; el.style.transform = ""; el.style.opacity = "";
                    }, 350);
                });
            });
        });
    }, 300); 
}

function createNewChat() {
    if (chatsData.length >= 20) {
        peerManager.showInd('limitIndicator');
        return;
    }

    const newChat = { id: 'chat_' + Date.now(), name: `Chat ${chatsData.length + 1}`, todos: [] };
    chatsData.push(newChat);
    saveAllData();
    switchChat(newChat.id);
    if(peerManager.conn) peerManager.sendData();
}

function saveChatTitle() {
    const titleEl = document.getElementById('chatTitle');
    if (!titleEl) return;
    const newTitle = titleEl.textContent.trim() || "Unnamed Chat";
    titleEl.textContent = newTitle; 
    
    const activeChat = chatsData.find(c => c.id === activeChatId);
    if (activeChat && activeChat.name !== newTitle) {
        activeChat.name = newTitle;
        saveAllData(); renderSidebar(); 
        if(peerManager.conn) peerManager.sendData();
    }
}

function renderActiveChat() {
    const activeChat = chatsData.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const titleEl = document.getElementById('chatTitle');
    if (titleEl) titleEl.textContent = activeChat.name;
    
    const list = document.getElementById("todolist");
    if (!list) return;
    list.innerHTML = "";
    activeChat.todos.forEach(todo => list.append(createTodoElement(todo.text, todo.id, false)));
}

function saveAllData() {
    const activeChat = chatsData.find(c => c.id === activeChatId);
    if (activeChat) {
        const todos = [];
        document.querySelectorAll("#todolist li:not(.deleting)").forEach(li => {
            const span = li.querySelector(".todo-content");
            if (span) todos.push({ id: li.id, text: span.textContent });
            else todos.push({ id: li.id, text: li.innerText.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim() });
        });
        activeChat.todos = todos;
    }
    localStorage.setItem("todolist_chats", JSON.stringify(chatsData));
}

function createTodoElement(text, id = null, isNew = true) {
    const li = document.createElement("li");
    li.id = id || `Item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    if (isNew) { li.className = 'new-item'; setTimeout(() => li.classList.remove('new-item'), 600); }

    const contentSpan = document.createElement("span");
    contentSpan.className = "todo-content"; contentSpan.textContent = text;

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "<i class='ph ph-pencil-simple'></i>"; editBtn.className = "edit-btn glass-btn";
    editBtn.dataset.tooltip = languageManager.getT('ttEditTodo') || "Редагувати";

    const saveBtn = document.createElement("button");
    saveBtn.innerHTML = "<i class='ph ph-floppy-disk'></i>"; saveBtn.className = "save-btn glass-btn";
    saveBtn.dataset.tooltip = languageManager.getT('ttSaveTodo') || "Зберегти";

    editBtn.addEventListener("click", (e) => {
        e.stopPropagation(); li.classList.add('editing');
        const textarea = document.createElement("textarea");
        textarea.className = "edit-textarea glass-input"; textarea.value = contentSpan.textContent;
        li.innerHTML = ""; li.append(textarea, saveBtn); textarea.focus();

        const cancelEdit = () => { li.classList.remove('editing'); li.innerHTML = ""; li.append(contentSpan, editBtn); };
        textarea.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); saveBtn.click(); } else if (event.key === "Escape") cancelEdit();
        });
        saveBtn.addEventListener("click", (e) => {
            e.stopPropagation(); const newText = textarea.value.trim();
            if (newText !== "") {
                contentSpan.textContent = newText; li.classList.remove('editing'); li.innerHTML = ""; li.append(contentSpan, editBtn);
                saveAllData(); if(peerManager.conn) peerManager.sendData();
            } else textarea.focus(); 
        });
    });

    li.append(contentSpan, editBtn);

    li.addEventListener("click", (e) => {
        if(e.target.tagName !== "BUTTON" && !e.target.closest('button') && !li.querySelector("textarea") && !li.classList.contains('deleting')) {
            const content = li.querySelector('.todo-content'); if(content) content.classList.add('completed');
            li.classList.add('deleting');
            setTimeout(() => {
                li.style.height = li.offsetHeight + 'px'; li.offsetHeight; li.classList.add('collapsing');
                li.style.height = '0px'; li.style.paddingTop = '0px'; li.style.paddingBottom = '0px'; li.style.marginTop = '0px'; li.style.marginBottom = '0px'; li.style.borderWidth = '0px';
                setTimeout(() => { li.remove(); saveAllData(); if(peerManager.conn) peerManager.sendData(); }, 400); 
            }, 400); 
        }
    });

    li.draggable = true;
    li.addEventListener("dragstart", (e) => { draggedItem = e.target; e.target.classList.add("dragging"); });
    li.addEventListener("dragend", (e) => { e.target.classList.remove("dragging"); draggedItem = null; saveAllData(); if(peerManager.conn) peerManager.sendData(); });

    return li;
}

function add() {
    const textarea = document.getElementById("text");
    if (!textarea) return;
    const text = textarea.value.trim();
    if(text !== ""){
        const list = document.getElementById("todolist");
        if (list) { list.append(createTodoElement(text, null, true)); saveAllData(); if(peerManager.conn) peerManager.sendData(); }
    }
    textarea.value = ""; textarea.focus();
}

const mainTextInput = document.getElementById("text");
if (mainTextInput) mainTextInput.addEventListener("keydown", function(e) { if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); add(); } });

const todoListContainer = document.getElementById("todolist");
if (todoListContainer) {
    todoListContainer.addEventListener("dragover", (e) => {
        e.preventDefault(); const closest = e.target.closest("li");
        if(!closest || closest === draggedItem) return;
        const rect = closest.getBoundingClientRect();
        if((e.clientY - rect.top) > rect.height / 2) closest.after(draggedItem); else closest.before(draggedItem);
    });
}

// ==================== SHARE PANEL & PEERJS ====================
function initSharePanel() {
    const shareToggleBtn = document.getElementById('shareToggleBtn');
    const sharePanel = document.getElementById('sharePanel');
    if (!shareToggleBtn || !sharePanel) return;
    shareToggleBtn.addEventListener('click', function() {
        const isOpening = !sharePanel.classList.contains('open');
        const t = languageManager.translations[languageManager.currentLang] || languageManager.translations['en'];
        if (isOpening) { 
            sharePanel.classList.add('open'); 
            shareToggleBtn.innerHTML = t.shareToggleClose || "<i class='ph ph-x-circle'></i> Close access"; 
        } else { 
            sharePanel.classList.remove('open'); 
            shareToggleBtn.innerHTML = t.shareToggle || "<i class='ph ph-broadcast'></i> Shared access"; 
        }
    });
}

const peerManager = {
    peer: null, conn: null,
    init() {
        const myPeerIdEl = document.getElementById("myPeerId");
        if (myPeerIdEl) myPeerIdEl.textContent = "Завантаження...";
        this.peer = new Peer(localStorage.getItem('peerId'), { debug: 2 });
        this.peer.on('open', (id) => { if (myPeerIdEl) myPeerIdEl.textContent = id; localStorage.setItem('peerId', id); this.updateConnectionButtons(false); });
        this.peer.on('connection', (c) => { this.conn = c; this.setupConnection(); });
        this.peer.on('error', (err) => {
            if (err.type === 'unavailable-id') { localStorage.removeItem('peerId'); this.init(); } 
            else { if (myPeerIdEl) myPeerIdEl.textContent = "Помилка"; this.updateConnectionButtons(false); }
        });
        const connBtn = document.getElementById("connectBtn"); const disconnBtn = document.getElementById("disconnectBtn"); const copyBtn = document.getElementById("copyIdBtn");
        if (connBtn) connBtn.onclick = () => this.connectToFriend();
        if (disconnBtn) disconnBtn.onclick = () => this.disconnect();
        if (copyBtn) copyBtn.onclick = () => this.copyMyId();
    },
    connectToFriend() {
        const friendIdInput = document.getElementById("friendIdInput"); if (!friendIdInput) return;
        const id = friendIdInput.value.trim(); if (!id) return;
        this.updateConnectionButtons(true);
        try { this.conn = this.peer.connect(id, { reliable: true }); this.setupConnection(); } catch (e) { this.updateConnectionButtons(false); }
    },
    disconnect() { if (this.conn) { this.conn.close(); this.conn = null; } this.updateConnectionButtons(false); this.showInd("disconnectedIndicator"); },
    setupConnection() {
        if (!this.conn) return;
        this.conn.on('open', () => { this.updateConnectionButtons(true); this.showInd("connectedIndicator"); this.sendData(); });
        this.conn.on('data', (data) => {
            if (data && Array.isArray(data)) {
                chatsData = data;
                if (!chatsData.find(c => c.id === activeChatId)) activeChatId = chatsData[0].id;
                saveAllData(); renderSidebar(); renderActiveChat();
            }
        });
        this.conn.on('close', () => { this.updateConnectionButtons(false); this.showInd("disconnectedIndicator"); });
    },
    updateConnectionButtons(isConnected) {
        const connectBtn = document.getElementById("connectBtn"); const disconnectBtn = document.getElementById("disconnectBtn"); const friendIdInput = document.getElementById("friendIdInput");
        if (connectBtn) connectBtn.disabled = isConnected; if (disconnectBtn) disconnectBtn.disabled = !isConnected; if (friendIdInput) friendIdInput.disabled = isConnected;
    },
    sendData() { if (this.conn && this.conn.open) this.conn.send(chatsData); },
    copyMyId() {
        const myPeerIdEl = document.getElementById("myPeerId"); if (!myPeerIdEl) return;
        const myId = myPeerIdEl.textContent; if (myId === "Завантаження..." || myId.includes("Помилка")) return;
        navigator.clipboard.writeText(myId).then(() => { this.showInd("copiedIndicator"); });
    },
    showInd(id) {
        const el = document.getElementById(id); if (!el) return;
        globalToastZIndex++;
        el.style.zIndex = globalToastZIndex;
        el.style.top = "20px"; el.style.opacity = "1";
        setTimeout(() => { el.style.top = "-60px"; el.style.opacity = "0"; }, 2500);
    }
};

window.addEventListener("load", function() {
    try { languageManager.init(); } catch (e) { console.error(e); }
    try { initApp(); } catch (e) { console.error(e); }
    try { peerManager.init(); } catch (e) { console.error(e); }
});
