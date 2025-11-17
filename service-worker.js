// اسم ذاكرة التخزين المؤقت (Cache)
const CACHE_NAME = 'tasabih-v1'; 

// قائمة بجميع الأصول التي يجب تخزينها مؤقتًا للعمل دون اتصال
// يجب تحديث هذه القائمة في كل مرة يتم فيها تغيير الأصول
const urlsToCache = [
  '/', 
  '/index.html', // أو إذا كان الملف الرئيسي هو 1.docx يجب تسميته بالاسم الصحيح
  '/manifest.json', // ملف الإعدادات الخاص بالـ PWA
  '/kaaba.png', // أيقونة التطبيق (مذكورة في HTML)
  '/أشرف.jpg', // صورة المطور (مذكورة في HTML)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', // خطوط Font Awesome
  // ملاحظة: يجب أيضاً تخزين ملف الـ CSS إذا كان منفصلاً (غير مضمن)
];

// ********************************************************
// 1. حدث التثبيت (Install Event) - لتخزين الأصول الأساسية
// ********************************************************
self.addEventListener('install', (event) => {
  // انتظر حتى يتم فتح الذاكرة المؤقتة وتخزين جميع الملفات
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and adding all static assets');
        return cache.addAll(urlsToCache);
      })
  );
});

// ********************************************************
// 2. حدث الجلب (Fetch Event) - لخدمة المحتوى من الذاكرة المؤقتة أولاً
// ********************************************************
self.addEventListener('fetch', (event) => {
  // استراتيجية Cache-First: حاول إرجاع الأصول من الذاكرة المؤقتة، وإلا اذهب إلى الشبكة
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا وجد تطابق في الذاكرة المؤقتة، قم بإرجاعه
        if (response) {
          return response;
        }
        // وإلا، اذهب إلى الشبكة لجلب الأصل
        return fetch(event.request);
      })
  );
});

// ********************************************************
// 3. حدث التفعيل (Activate Event) - لتنظيف أي إصدارات قديمة من الـ Cache
// ********************************************************
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  // قم بإزالة أي Cache غير موجود في القائمة البيضاء
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

