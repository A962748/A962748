const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
const navSearchBtn = document.getElementById('navSearchBtn');
const searchInput = document.getElementById('searchInput');
const searchBarContainer = document.getElementById('searchBarContainer');
const externalSearchIcon = document.getElementById('externalSearchIcon'); 
const cairoSection = document.getElementById('cairo-radio-section');

// دالة جديدة لإغلاق القائمة بعد النقر على رابط
function closeMenu() {
    navLinks.classList.remove('active');
}
// دالة جديدة لمحاولة إغلاق النافذة (الخروج من التطبيق)
function exitApp() {
    // محاولة إغلاق النافذة، قد لا تعمل في جميع المتصفحات لأسباب أمنية
    window.close();
}

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});


// **********************************************
// External Search Logic Function
// **********************************************
function performExternalSearch() {
    const query = searchInput.value.trim();
    if (query) {
        // فتح نافذة جديدة والبحث في Google
        const searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(searchURL, '_blank');
        // إغلاق شريط البحث بعد البحث الخارجي
        searchBarContainer.classList.remove('active');
        cairoSection.style.paddingTop = '80px';
        searchInput.value = '';
        applySearchFilter('');
    } else {
        // إذا كان البحث فارغاً، يكتفي بإغلاق الشريط وتصفية النتائج الداخلية (وهي إظهار الكل)
        searchBarContainer.classList.remove('active');
        cairoSection.style.paddingTop = '80px';
    }
}

// NEW: Toggle search bar visibility and manage padding/focus
navSearchBtn.addEventListener('click', () => {
    const isActive = searchBarContainer.classList.toggle('active');
    // Adjust top padding of the main content sections to prevent overlap
    if (isActive) {
        // Search bar is approx 50-60px tall. Nav is 60px. Total offset ~110px.
        cairoSection.style.paddingTop = '115px'; // Adjust padding to clear fixed search bar
        searchInput.focus();
    } else {
        // Restore default padding (80px in CSS)
        cairoSection.style.paddingTop = '80px';
        // Clear search input and re-run filter to show all
        searchInput.value = '';
        applySearchFilter('');
    }
    // Also close the mobile menu if open
    closeMenu();
});

// NEW: Event listener for internal search (on input)
searchInput.addEventListener('input', (e) => {
    applySearchFilter(e.target.value.toLowerCase());
});

// NEW: Event listener for ENTER key press (to trigger external search)
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // منع الإجراء الافتراضي (مثل إرسال نموذج)
        performExternalSearch();
    }
});

// NEW: Event listener for clicking the icon inside the search bar
externalSearchIcon.addEventListener('click', () => {
    performExternalSearch();
});

// Allow closing with ESC key and clearing search
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchBarContainer.classList.contains('active')) {
        // Toggle off the search bar, which triggers the close logic in the click event
        searchBarContainer.classList.remove('active');
        cairoSection.style.paddingTop = '80px';
        // Clear search input and re-run filter to show all
        searchInput.value = '';
        applySearchFilter('');
    }
});


let currentlyPlaying = null;
let customPlayers = [];
// Custom Audio Player Class
class CustomAudioPlayer {
    constructor(playerElement) {
        this.playerElement = playerElement;
        this.audio = null;
        this.playBtn = playerElement.querySelector('.play-pause-btn');
        this.muteBtn = playerElement.querySelector('.mute-btn');
        // لا يزال يتم البحث عن هذا العنصر لتحديث الحالة داخليًا، ولكنه مخفي الآن
        this.statusElement = playerElement.querySelector('.status');
        this.isPlaying = false;
        this.isMuted = false;
        this.volumeBeforeMute = 0.8;
        this.init();
    }
    init() {
        const audioSrc = this.playerElement.dataset.src;
        this.audio = new Audio();
        this.audio.src = audioSrc;
        this.audio.preload = 'none';
        this.audio.volume = 0.8;
        this.playBtn.addEventListener('click', () => this.togglePlay());
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
        }
        this.audio.addEventListener('loadstart', () => this.handleLoadStart());
        this.audio.addEventListener('canplay', () => this.handleCanPlay());
        this.audio.addEventListener('play', () => this.handlePlay());
        this.audio.addEventListener('pause', () => this.handlePause());
        this.audio.addEventListener('error', () => this.handleError());
        this.audio.addEventListener('waiting', () => this.handleWaiting());
        this.audio.addEventListener('playing', () => this.handlePlaying());
    }
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    play() {
        customPlayers.forEach(player => {
            if (player !== this && player.isPlaying) {
                player.pause();
            }
        });
        this.audio.play().catch((error) => {
            console.error('Error playing audio:', error);
            // Handle error UI if needed
        });
    }
    pause() {
        this.audio.pause();
    }
    toggleMute() {
        if (this.isMuted) {
            this.audio.volume = this.volumeBeforeMute;
            this.isMuted = false;
            this.muteBtn.classList.remove('muted');
            this.muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            this.volumeBeforeMute = this.audio.volume;
            this.audio.volume = 0;
            this.isMuted = true;
            this.muteBtn.classList.add('muted');
            this.muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }
    handleLoadStart() {
        this.updateStatus('جاري التحميل...');
    }
    handleCanPlay() {
        // Not necessarily playing yet, but ready
        if (!this.isPlaying) {
            this.updateStatus('جاهز للتشغيل');
        }
    }
    handlePlay() {
        this.isPlaying = true;
        this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.updateStatus('اضغط للتوقف');
        currentlyPlaying = this.audio;
    }
    handlePause() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.updateStatus('اضغط للتشغيل');
        if (currentlyPlaying === this.audio) {
            currentlyPlaying = null;
        }
    }
    handleError() {
        this.updateStatus('خطأ في البث');
        this.playBtn.innerHTML = '<i class="fas fa-redo"></i>'; // Change icon to retry
        if (currentlyPlaying === this.audio) {
            currentlyPlaying = null;
        }
    }
    handleWaiting() {
        this.updateStatus('جاري الاتصال...');
    }
    handlePlaying() {
        // Actual playing started
        this.updateStatus('استماع مباشر');
    }
    updateStatus(text) {
        if (this.statusElement) {
            this.statusElement.textContent = text;
        }
    }
}
// الكلمات المفتاحية التي يجب أن تحتوي عليها التلاوة لتظهر
const allowedKeywords = [
    "فتاوى", "رقية", "عبد الباسط", "عبد الباسط عبد الصمد", "عبدالباسط", "عبد الصمد",
    "المنشاوي", "الطبلاوي", "الحصري", "مصطفى اسماعيل", "آيات السكينة",
    "السيرة النبوية", "حياة الصحابة", "تفسير", "أذكار الصباح", "أذكار المساء",
    "محمود علي البنا", "الفتاوى العامة", "صور من حياة الصحابة", "فضل شهر رمضان",
    "صحيح مسلم", "صحيح البخاري",
    "قصص الانبياء", "قصص الأنبياء والرسل", "قصة", "الأنبياء", "الرسل",
    "رياض الصالحين"
].map(k => k.toLowerCase().trim());

// قائمة بأسماء إذاعات عبد الباسط لتطبيق فلتر الحذف الخاص (حذف الثانية)
const abdulBasitIdentifiers = ["عبد الباسط", "عبد الباسط عبد الصمد", "عبدالباسط", "عبد الصمد"].map(k => k.toLowerCase().trim());

// قائمة بأسماء إذاعات الحصري لتطبيق فلتر الحذف الخاص (حذف الثالثة)
const husaryIdentifiers = ["الحصري"].map(k => k.toLowerCase().trim());

// الكلمات المفتاحية التي يجب ألا تحتوي عليها التلاوة (للحذف)
const forbiddenKeywords = [
    // لحذف اللغات الأجنبية والترجمات
    "الأوردية", "الأردو", "Urdu", "ترجمة",
    "English", "France", "French", "Türkçe", "Espanol", "German"
].map(k => k.toLowerCase().trim());

// --- أدوات التعديل الخاصة بالأسماء المطلوبة ---

// 1. الصحابة
const sahabaIdentifiers = [
    'صور من حياة الصحابة',
    'صور الصحابة',
    'حياة الصحابة',
    'الصحابة والتابعين'
].map(k => k.toLowerCase().trim());
const targetSahabaPhrase = 'نبذة عن حياة الصحابة';

// 2. باقي التعديلات المخصصة
const specificReplacements = [
    // Must be sorted from most specific/required to least specific (Tabari before general tafsir)
    { identifiers: ['الطبري', 'الخلاصة من تفسير الطبري'], target: 'تفسير القران الكريم للطبري' },
    // UPDATE: السيره النبويه الشريفه
    { identifiers: ['السيرة النبوية', 'السيره النبويه'], target: 'السيره النبويه الشريفه' },
    { identifiers: ['رقية', 'الرقية الشرعية'], target: 'الرقية الشرعية' },
    { identifiers: ['فتاوى', 'الفتاوى العامة'], target: 'الفتاوى العامة' },
    // General tafsir, placed last to avoid overriding Tabari
    { identifiers: ['تفسير القران الكريم'], target: 'تفسير القرأن الكريم' },
    // CLEANUP: Ensure قصص الأنبياء is always clean and consistent
    { identifiers: ['قصص الانبياء', ' قصص الأنبياء والرسل', 'قصة الأنبياء', 'الأنبياء والرسل'], target: 'قصص الأنبياء' }

];

// دالة فحص ما إذا كانت التلاوة مسموح بها
function isAllowed(stationName) {
    const name = stationName.toLowerCase();
    // 1. يجب أن تحتوي التلاوة على إحدى الكلمات المسموح بها
    const containsAllowed = allowedKeywords.some(keyword => name.includes(keyword));
    // 2. يجب ألا تحتوي التلاوة على أي من الكلمات المحظورة
    const containsForbidden = forbiddenKeywords.some(keyword => name.includes(keyword));
    // تظهر التلاوة إذا كانت تحتوي على كلمة مسموح بها AND لا تحتوي على كلمة محظورة
    return containsAllowed && !containsForbidden;
}

// دالة تحميل التلاوات وتطبيق التصفية والتعديل
async function loadAllStations() {
    const stationsGrid = document.getElementById('allStationsGrid');
    if (!stationsGrid) return;
    // وضع رسالة التحميل
    stationsGrid.innerHTML = '<p style="color: #004d40; text-align: center;">جاري تحميل التلاوات...</p>';
    // بيانات إذاعة القرآن الكريم من القاهرة (موجودة الآن كعنصر منفصل)
    const cairoStationUrl = "https://stream.radiojar.com/8s5u5tpdtwzuv";
    try {
        const response = await fetch('https://mp3quran.net/api/v3/radios');
        const data = await response.json();
        stationsGrid.innerHTML = ''; // مسح رسالة التحميل
        let count = 0;
        let abdulBasitCount = 0; // عداد لحساب تلاوات عبد الباسط
        let husaryCount = 0; // عداد لحساب تلاوات الحصري

        // تحميل وتصفية المحطات من الـ API
        data.radios.forEach(station => {
            // التأكد من عدم تكرار محطة القاهرة
            if (station.url === cairoStationUrl) return;
            const stationNameLower = station.name.toLowerCase();
            // تحقق من الفلاتر المطلوبة
            if (isAllowed(station.name)) {
                // فلتر حذف الثانية لعبد الباسط
                const isAbdulBasit = abdulBasitIdentifiers.some(keyword => stationNameLower.includes(keyword));
                if (isAbdulBasit) {
                    abdulBasitCount++;
                    if (abdulBasitCount === 2) {
                        return; // تجاوز هذه المحطة (حذفها)
                    }
                }
                // فلتر حذف الثالثة للحصري
                const isHusary = husaryIdentifiers.some(keyword => stationNameLower.includes(keyword));
                if (isHusary) {
                    husaryCount++;
                    if (husaryCount === 3) {
                        return; // تجاوز هذه المحطة (حذفها)
                    }
                }
                // -------------------------------------------------------------
                // *** NEW MODIFICATION: تطبيق التعديلات المخصصة للمحطات المطلوب تغيير اسمها ***
                // -------------------------------------------------------------
                let finalDisplayName = station.name;
                let isSpecificReplacement = false;
                // 1. Sahaba (Highest Priority from previous turns)
                if (sahabaIdentifiers.some(keyword => stationNameLower.includes(keyword))) {
                    finalDisplayName = targetSahabaPhrase; // 'نبذة عن حياة الصحابة'
                    isSpecificReplacement = true;
                } else {
                    // 2. Apply all other specific replacements in order
                    for (const rule of specificReplacements) {
                        // يجب تحويل كل معرف إلى حالة الأحرف الصغيرة للمقارنة
                        if (rule.identifiers.some(id => stationNameLower.includes(id.toLowerCase()))) {
                            finalDisplayName = rule.target;
                            isSpecificReplacement = true;
                            break; // Stop after the first specific match
                        }
                    }
                }
                // 3. Fallback: Apply general 'إذاعة' -> 'تلاوات' replacement if no specific replacement was made
                if (!isSpecificReplacement) {
                    // يغير "إذاعة" إلى "تلاوات" في اسم المحطة بشكل عام
                    finalDisplayName = finalDisplayName.replace(/إذاعة/g, 'تلاوات').replace(/إذاعات/g, 'تلاوات');
                }
                // **4. CRITICAL FIX: Normalize spacing for reliable matching/replacement.**
                // إزالة المسافات المتعددة والمسافات البادئة/الزائدة
                finalDisplayName = finalDisplayName.trim().replace(/\s+/g, ' ');

                // **5. NEW: Insert "الشيخ" after "تلاوات" for reciter names (if not already there).**
                const reciterPrefix = 'تلاوات';
                const sheikhWord = 'الشيخ';
                const sheikhInsertion = `${reciterPrefix} ${sheikhWord} `;

                // التحقق من أنها تبدأ بـ 'تلاوات ' وأنها لا تحتوي على كلمة 'الشيخ' لتجنب التكرار
                if (finalDisplayName.startsWith(`${reciterPrefix} `) && !finalDisplayName.includes(sheikhWord)) {
                    // استبدال 'تلاوات ' بـ 'تلاوات الشيخ '
                    finalDisplayName = finalDisplayName.replace(`${reciterPrefix} `, sheikhInsertion);
                }

                // **6. CLEANUP: Remove any asterisks and extra whitespace from the final display name.**
                finalDisplayName = finalDisplayName.replace(/\*/g, '').trim();
                // -------------------------------------------------------------

                const stationCard = document.createElement('div');
                stationCard.className = 'station-card';
                stationCard.innerHTML = `
                    <div class="station-content">
                        <h3>${finalDisplayName}</h3>
                        <div class="custom-audio-player" data-src="${station.url}">
                            <button class="play-pause-btn">
                                <i class="fas fa-play"></i>
                            </button>
                            <div class="station-info">
                                <span class="station-name">${finalDisplayName}</span>
                                <span class="status">اضغط للتشغيل</span>
                            </div>
                            <button class="mute-btn">
                                <i class="fas fa-volume-up"></i>
                            </button>
                        </div>
                    </div>
                `;
                stationsGrid.appendChild(stationCard);
                count++;
                // Initialize custom player for this station
                const playerElement = stationCard.querySelector('.custom-audio-player');
                const player = new CustomAudioPlayer(playerElement);
                customPlayers.push(player);
            }
        });
        if (count === 0) {
            // نترك رسالة التحميل فارغة إذا لم نجد محطات
        }
    } catch (error) {
        console.error('Error loading stations:', error);
        stationsGrid.innerHTML = '<p class="error-message" style="color: #d32f2f; text-align: center;">عذراً، حدث خطأ في تحميل التلاوات</p>';
    }
}

// Search functionality filter (Internal filter on input, External on Enter/Icon click)
function applySearchFilter(searchTerm) {
    const stationsGrid = document.getElementById('allStationsGrid');
    const cairoCard = document.querySelector('.cairo-card');
    const cairoName = cairoCard.querySelector('h3').textContent.toLowerCase();
    const hr = document.querySelector('.cairo-radio-section hr');
    const allStations = document.querySelectorAll('#allStationsGrid .station-card');
    if (!stationsGrid || !cairoCard) {
        return;
    }

    let foundTotal = 0;

    // 1. Handle Cairo Station visibility
    const cairoMatch = cairoName.includes(searchTerm);
    cairoCard.style.display = cairoMatch ? 'block' : 'none';
    hr.style.display = cairoMatch ? 'block' : 'none';
    if (cairoMatch) foundTotal++;

    // 2. Handle the main stations grid visibility
    allStations.forEach(station => {
        const stationName = station.querySelector('h3').textContent.toLowerCase();
        const match = stationName.includes(searchTerm);
        station.style.display = match ? 'block' : 'none';
        if (match) foundTotal++;
    });
    // 3. Add/Remove "No results" message
    const noResultsMessageId = 'no-results-message';
    let messageElement = document.getElementById(noResultsMessageId);

    if (foundTotal === 0) {
        if (!messageElement) {
            messageElement = document.createElement('p');
            messageElement.id = noResultsMessageId;
            messageElement.style.cssText = "color: #004d40; text-align: center;";
            messageElement.textContent = 'لا توجد نتائج مطابقة لبحثك.';
            stationsGrid.appendChild(messageElement);
        }
    } else {
        if (messageElement) {
            messageElement.remove();
        }
    }
}

// Initialize custom players and load stations when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Cairo player (Point 3)
    const cairoPlayerElement = document.getElementById('cairoPlayer');
    if (cairoPlayerElement) {
        const cairoPlayer = new CustomAudioPlayer(cairoPlayerElement);
        customPlayers.push(cairoPlayer);
    }
    // تحميل التلاوات المفلترة
    loadAllStations();
    // تحديث السنة في حقوق النشر
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
// *** NEW PWA REGISTRATION CODE ***
// تسجيل ملف الـ Service Worker عند تحميل الصفحة
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered: ', registration);
            })
            .catch(registrationError => {
                console.log('ServiceWorker registration failed: ', registrationError);
            });
    });
}
// *** END PWA REGISTRATION CODE ***
