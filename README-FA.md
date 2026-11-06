# سایت نامه فاطمه — نسخه Cloudflare Pages

این نسخه برای Cloudflare Pages آماده شده و بک‌اند با **Pages Functions** اجرا می‌شود؛ بنابراین نیازی به سرور جداگانه یا هاست پولی نیست.

## محتویات
- `public/index.html` — سایت فارسی، واکنش‌گرا و انیمیشن پاکت/نامه
- `functions/api/choice.js` — بک‌اند ارسال انتخاب به ایمیل
- `wrangler.toml` — تنظیمات Cloudflare Pages

## راه‌اندازی

### 1. ساخت پروژه در Cloudflare Pages
پوشه پروژه را در GitHub قرار بده و در Cloudflare Dashboard از Workers & Pages یک Pages project با اتصال Git بساز.
- Build command: خالی (یا بدون build)
- Build output directory: `public`
- Root directory: ریشه همین پروژه

برای انتشار با Wrangler نیز می‌توانی از ریشه پروژه اجرا کنی:
```bash
npm install -g wrangler
wrangler login
wrangler pages project create fatemeh-letter
wrangler pages deploy public --project-name fatemeh-letter
```
برای استفاده از Functions، پوشه `functions` باید کنار `public` در ریشه پروژه باشد و انتشار از طریق اتصال Git یا Wrangler انجام شود؛ آپلود ساده فایل HTML به‌تنهایی بک‌اند را فعال نمی‌کند.

### 2. آماده‌سازی سرویس ایمیل
این پروژه از Resend برای ارسال اعلان ایمیل استفاده می‌کند:
1. در `https://resend.com` حساب بساز.
2. دامنه‌ای که مالک آن هستی را در Resend اضافه و DNS آن را تأیید کن.
3. یک API Key بساز.
4. یک فرستنده از دامنه تأییدشده انتخاب کن، مثلاً `Letter <hello@your-domain.com>`.

برای ارسال به ایمیل مقصد دلخواه، معمولاً باید دامنه فرستنده در Resend تأیید شده باشد.

### 3. تنظیم متغیرهای محیطی در Cloudflare
در Cloudflare Dashboard:
Workers & Pages → پروژه Pages → Settings → Variables and Secrets

این سه مقدار را اضافه کن:
- `RESEND_API_KEY` — به‌صورت **Secret**
- `NOTIFY_EMAIL` — ایمیلی که می‌خواهی پاسخ‌ها به آن برسند (بهتر است Secret باشد)
- `FROM_EMAIL` — آدرس فرستنده تأییدشده در Resend، مانند `Letter <hello@your-domain.com>`

یک متغیر معمولی دیگر:
- `SITE_ORIGIN` — آدرس دقیق سایت، مثلاً `https://fatemeh-letter.pages.dev`

بعد از افزودن یا تغییر متغیرها، پروژه را دوباره Deploy کن.

### 4. تست
1. سایت را باز کن.
2. پاکت را لمس کن تا باز شود و نامه نمایش داده شود.
3. یکی از سه گزینه را انتخاب کن.
4. پیام ثبت موفق باید نمایش داده شود و ایمیل اعلان به `NOTIFY_EMAIL` برسد.

## چه چیزی در ایمیل می‌آید؟
- گزینه انتخاب‌شده
- زمان ثبت به وقت تهران
- متن پاسخ مربوط به آن انتخاب

## حریم خصوصی و محدودیت‌ها
- کلید سرویس ایمیل فقط در تنظیمات سرور Cloudflare نگهداری می‌شود و داخل کد مرورگر نیست.
- این نسخه انتخاب را ایمیل می‌کند؛ در دیتابیس دائمی ذخیره نمی‌کند.
- از IP، موقعیت مکانی یا اطلاعات دستگاه بازدیدکننده استفاده نمی‌شود.
- برای حفاظت قوی‌تر در برابر اسپم/درخواست‌های تکراری می‌توان Turnstile و D1 را اضافه کرد.
