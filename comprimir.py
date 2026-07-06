from PIL import Image
import os

carpeta_raiz = "data"
total_antes, total_despues = 0, 0

for raiz, dirs, archivos in os.walk(carpeta_raiz):
    for archivo in archivos:
        if archivo.lower().endswith(('.jpg', '.png', 'jpeg')):
            ruta = os.path.join(raiz, archivo)
            peso_antes = os.path.getsize(ruta)
            img = Image.open(ruta)
            if img.width > 1200:
                alto = int(img.height * 1200 / img.width)
                img = img.resize((1200, alto), Image.LANCZOS)
            nueva_ruta = ruta.rsplit('.', 1)[0] + ".webp"
            img.convert("RGB").save(nueva_ruta, "WEBP", quality=80)
            if nueva_ruta != ruta:
                os.remove(ruta)
            peso_despues = os.path.getsize(nueva_ruta)
            total_antes += peso_antes
            total_despues += peso_despues
            print(f"{archivo}: {peso_antes/1e6:.1f} MB -> {peso_despues/1e6:.2f} MB")

print(f"\nTOTAL: {total_antes/1e6:.0f} MB -> {total_despues/1e6:.0f} MB")