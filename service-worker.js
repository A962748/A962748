// 1. تحديد اسم ونسخة الذاكرة المؤقتة (Cache)
// تغيير هذا الاسم يؤدي إلى تحديث جميع الملفات المخزنة لدى المستخدمين
const CACHE_NAME = 'tasabeeh-cache-v1.0.1';

// 2. قائمة بالملفات الأساسية التي يجب تخزينها مؤقتاً
// هذه هي كل الملفات المطلوبة لتشغيل التطبيق دون اتصال بالإنترنت
const urlsToCache = [
    '/', // المسار الأساسي (نفس index.html)
    'index.html',
    'style.css',
    'script.js',
    'manifest.json', // ملف إعدادات التثبيت
    'kaaba.png', // أيقونة التطبيق (مستخدمة كـ favicon)
    'أشرف.jpg', // صورة المطور (مستخدمة في حقوق النشر والقائمة)
    // المكتبات والخطوط الخارجية (يفضل تخزينها أيضاً لضمان التشغيل دون اتصال)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Reem+Kufi:wght@600&display=swap',
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap'
    // ملاحظة: لا يمكن تخزين الخطوط نفسها (*.woff, *.ttf) مباشرةً بدون إضافة أكواد إضافية، لكن سنعتمد على الرابط
];

// *************************************************************
// 3. حدث "التثبيت" (Install Event)
// يتم تشغيل هذا الحدث عندما يتم تثبيت الـ Service Worker لأول مرة
// *************************************************************
self.addEventListener('install', (event) => {
    // نطلب من المتصفح الانتظار حتى يتم تخزين كل الملفات بنجاح
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache. Caching core app shell files...');
                return cache.addAll(urlsToCache); // تخزين جميع الملفات في القائمة
            })
    );
    // تفعيل الـ Service Worker فوراً دون انتظار إغلاق الصفحات القديمة
    self.skipWaiting();
});

// *************************************************************
// 4. حدث "الجلب" (Fetch Event)
// يتم تشغيل هذا الحدث في كل مرة يطلب فيها التطبيق أي ملف
// *************************************************************
self.addEventListener('fetch', (event) => {
    // استراتيجية "Cache-First, then Network"
    // أولاً: البحث في الذاكرة المؤقتة (الـ Cache)
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // إذا وجدنا الملف في الذاكرة المؤقتة، نعيده مباشرةً
                if (response) {
                    return response;
                }

                // إذا لم نجده، نتوجه للشبكة لجلبه
                return fetch(event.request)
                    .then((networkResponse) => {
                        // ملاحظة: لا يتم تخزين استجابة الـ Network API (إلا إذا كانت ملفات ثابتة)
                        return networkResponse;
                    })
                    // معالجة أي خطأ في الاتصال بالشبكة
                    .catch(() => {
                        // إذا فشل الاتصال بالشبكة وكان الطلب هو الصفحة الرئيسية، يمكنك إرجاع صفحة "Offline"
                        if (event.request.mode === 'navigate') {
                            // يمكنك هنا إضافة صفحة HTML بسيطة لـ "أنت غير متصل بالإنترنت"
                            // حالياً، سنعتمد على أن الملفات الأساسية مخزنة
                            return caches.match('index.html'); 
                        }
                    });
            })
    );
});


// *************************************************************
// 5. حدث "التفعيل" (Activate Event)
// يتم تشغيله عند تفعيل Service Worker جديد
// *************************************************************
self.addEventListener('activate', (event) => {
    // نطلب من المتصفح حذف جميع الذاكرة المؤقتة القديمة التي لا تتطابق مع CACHE_NAME الحالي
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName); // حذف الذاكرة المؤقتة القديمة
                    }
                })
            );
        })
    );
    // نطلب السيطرة الفورية على جميع الصفحات المفتوحة حالياً
    event.waitUntil(self.clients.claim());
});

// *************************************************************
// ملاحظة هامة:
// بث الإذاعات (Radio Streaming) لا يمكن تخزينه مؤقتاً، لذا لا حاجة لمعالجته هنا،
// وستظل تتطلب اتصالاً بالإنترنت.
// *************************************************************
