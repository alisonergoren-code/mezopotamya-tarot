# MEZO'POTAMYA TAROT — Yayın Paketi

78 kartlık tarot web uygulaması; soru girme, 3 kart seçimi, yerel yorum, isteğe bağlı yapay zekâ yorumu, Instagram hikâye görseli.

## Hızlı yayın: Render + GitHub

1. ZIP dosyasını çıkar. Dosyaları **özel (private) veya herkese açık** bir GitHub deposuna yükle. `.env` veya API anahtarını depoya ekleme.
2. Render.com → New → Blueprint → GitHub deposunu seç. `render.yaml` otomatik tanınır.
3. Render ortam değişkenlerinde `OPENAI_API_KEY` değerini **Secret** olarak gir. Bu anahtarı HTML dosyasına yazma. İstersen `OPENAI_MODEL` seçimini değiştir.
4. Deploy tamamlandığında Render bir `*.onrender.com` adresi verir. Bu adresi Instagram hikâyende paylaşabilirsin.
5. API anahtarı eklemeden de yayın yapılabilir: ziyaretçiler yerel yorum görür. Yapay zekâ seçeneği etkinse anahtar olmadan yerel yoruma geri döner.

**Not:** Ücretsiz Render servisleri uykuya geçebilir ve ilk ziyaret yavaş açılabilir. Ücretsiz plan koşulları değişebilir. Yapay zekâ API kullanımı ücretli olabilir; bütçe limiti koy. Kullanıcı soruları yapay zekâ seçeneği işaretlenirse API sağlayıcısına iletilir.

## Bilgisayarda çalıştırma

Node.js 20+ kur. `npm start` çalıştır, `http://localhost:3000` aç. AI için `OPENAI_API_KEY` ortam değişkenini sunucuda ayarla. `GET /health` durum kontrolü sağlar.

## Güvenlik ve sınırlar

- Sunucu tarafında API anahtarı saklama, istek başına 3/dakika/IP sınırlama, girdi kontrolü, 18 saniyelik AI zaman aşımı ve güvenlik başlıkları eklendi.
- Bu temel IP sınırlama tek sunucu belleğindedir; yoğun kullanımda Redis benzeri ortak hız sınırlama, kötüye kullanım önleme ve API harcama limiti gereklidir.
- Üretim öncesi gizlilik politikası ve iletişim bilgileri eklenmelidir. Hassas kişisel bilgi paylaşılmaması konusunda kullanıcıları bilgilendirin.
- Tarot sembolik eğlence amaçlıdır, kesin gelecek tahmini değildir.

**Bu paket internete otomatik olarak yüklenmez.** Yayın için kullanıcının GitHub/Render hesabından dağıtım yapması gerekir.
