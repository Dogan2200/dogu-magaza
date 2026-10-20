# DOĞU — örnek giyim mağazası

Sade kesim, uzun ömürlü kıyafetler satan **örnek** bir giyim markasının alışveriş sitesi. Marka adı Doğan Ulusoy'dan türetildi (Doğ + U). Ürünler ve fiyatlar gösterim amaçlıdır; sipariş oluşturulmaz, ödeme alınmaz.

## Neler var
- Ana sayfa: askılıkta asılı kıyafetlerle giriş
- Koleksiyon: Dış giyim, Üst giyim, Alt giyim, Aksesuar filtresi ve fiyat sıralaması
- Ürün ayrıntısı: renk ve beden seçimi, kumaş ve kesim bilgisi
- Beden tablosu
- Sepet: renk/beden bazında satırlar, adet değiştirme, 1.500 ₺ üzeri ücretsiz kargo, örnek sipariş tamamlama
- Sepet tarayıcıda saklanır (localStorage)

## Dosyalar
| Dosya | İçerik |
| --- | --- |
| `index.html` | Sayfa iskeleti ve beden tablosu |
| `styles.css` | Renkler (çivit, safran), Archivo yazı tipi, düzen |
| `products.js` | Ürün ve kategori listesi — yeni ürün buraya eklenir |
| `app.js` | Kıyafet çizimleri, katalog, ürün ayrıntısı, sepet |

Derleme adımı yoktur; dosyalar olduğu gibi yayınlanır (Vercel, GitHub Pages veya herhangi bir statik sunucu).

## Yeni ürün eklemek
`products.js` içindeki listeye bir kayıt ekleyin:
- `type`: `coat`, `jacket`, `shirt`, `tee`, `knit`, `hoodie`, `trousers`, `skirt`, `scarf`, `beanie`
- `fabric`: `solid`, `stripe`, `check`, `rib`, `denim`
- `colors`: `{ name, hex }` listesi; çizgili/ekose için ikinci renk `alt`
- `sizes`: beden listesi; tek bedenli ürünlerde `['Tek beden']`

Gerçek ürün fotoğrafları eklendiğinde `app.js` içindeki `art()` fonksiyonu bir `<img>` döndürecek şekilde değiştirilebilir.
