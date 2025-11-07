'kaaba.png',            // الأيقونة الرئيسية
  'أشرف.jpg',             // صورتك الشخصية (افتراضاً أنها بهذا الاسم)
  // ملفات الـ CSS والأيقونات الخارجية:
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  // خطوط جوجل (قد تحتاج لتعديلها إذا كان لديك خطوط أخرى)
  'https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Reem+Kufi:wght@600&display=swap',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap'
];

// 1. مرحلة التثبيت: تخزين الملفات الأساسية مؤقتاً
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files');
        // يتم تجاهل الأخطاء في جلب بعض الروابط الخارجية مؤقتاً لضمان تثبيت ملفاتك المحلية
        return cache.addAll(urlsToCache.map(url => {
          return new Request(url, { cache: "no-cache" });
        }));
      })
  );
});

// 2. مرحلة الجلب: استخدام الملفات المخزنة مؤقتاً في وضع عدم الاتصال
self.addEventListener('fetch', event => {
  // نحن نخزن فقط الأصول الثابتة، وليس روابط البث المباشر (الراديو)
  // روابط الراديو يتم جلبها مباشرة من الشبكة دائماً
  if (event.request.url.includes('radiojar.com') || event.request.url.includes('mp3quran.net/api')) {
    return; // لا تخزن أو تخدم طلبات الراديو والـ API من الكاش
  }

  // لجميع الملفات الأخرى، حاول جلبها من الشبكة، وإذا فشل، استخدم الكاش
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا كان الملف موجوداً في الكاش (وضع عدم الاتصال)، استخدمه
        if (response) {
          return response;
        }
        // وإلا، قم بجلبه من الشبكة (وضع الاتصال)
        return fetch(event.request);
      })
  );
});

// 3. مرحلة التفعيل: مسح الكاشات القديمة
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // حذف الكاشات القديمة
          }
        })
      );
    })
  );
});
