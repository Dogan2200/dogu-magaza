# DOĞU — örnek alışveriş sitesi

Anadolu el işi ev ve sofra ürünleri satan **örnek** bir markanın mağaza sitesi. Marka adı Doğan Ulusoy'dan türetildi (Doğ + U). Ürünler, fiyatlar ve atölyeler gösterim amaçlıdır; sipariş oluşturulmaz, ödeme alınmaz.

## Neler var
- Ana sayfa: İznik çinisinden esinlenen yıldız-haç desenli giriş
- Koleksiyon: kategori filtresi (Seramik ve çini, Mutfak ve kahve, Tekstil, Hediye) ve fiyat sıralaması
- Ürün ayrıntısı: ölçü, teknik, adet seçimi
- Sepet: adet değiştirme, ücretsiz kargo eşiği (1.500 ₺), örnek sipariş tamamlama
- Sepet tarayıcıda saklanır (localStorage)

## Dosyalar
| Dosya | İçerik |
| --- | --- |
| `index.html` | Sayfa iskeleti |
| `styles.css` | Renkler, yazı tipleri, düzen |
| `products.js` | Ürün ve kategori listesi — yeni ürün buraya eklenir |
| `app.js` | Katalog, ürün ayrıntısı, sepet |

Derleme adımı yoktur; dosyalar olduğu gibi yayınlanır (Vercel, GitHub Pages veya herhangi bir statik sunucu).

## Yeni ürün eklemek
`products.js` içindeki listeye bir satır ekleyin. `motif` şunlardan biri olabilir: `yildiz`, `lale`, `cintemani`, `dalga`, `gul`, `cizgi`, `elibelinde`, `nar`, `nazar`. `colors` üç renk alır: zemin, çerçeve, vurgu.
