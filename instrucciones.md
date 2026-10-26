# Instrucciones de uso y prueba — PokemonApi

Guía paso a paso para ejecutar, instalar y probar la aplicación. La documentación técnica completa está en `README.md`.

---

## 1. Requisitos

### Para ejecutar en desarrollo

- Node.js 20 o superior y npm.
- Un teléfono Android con **Expo Go** (misma red Wi-Fi que la computadora) o un emulador Android.
- Opcional: macOS con Xcode para iOS.

### Para compilar el APK localmente

- JDK 17 o superior.
- Android SDK con `platforms` y `build-tools`, y la variable `ANDROID_HOME` o `ANDROID_SDK_ROOT` configurada.
- En este equipo se usó el JDK incluido en Android Studio: `D:\Android\Android Studio\jbr`.

---

## 2. Preparar el proyecto

Abre una terminal en la carpeta `PokemonApi`:

```bash
cd "C:\Users\Administrator\Documents\aplicacion web\PokemonApi"
npm install
```

### Variable de entorno

El proyecto necesita la URL de MockAPI. Copia el ejemplo si no existe `.env`:

```bash
copy .env.example .env
```

Contenido esperado:

```env
EXPO_PUBLIC_MOCKAPI_BASE_URL=https://6ade67884e88f1bba4a5218d.mockapi.io/pokemons
```

> La URL ya incluye `/pokemons`. No agregues `/api/v1` ni otro `/pokemons`.
> Las variables `EXPO_PUBLIC_*` se incluyen en el bundle: no pongas secretos ahí.

---

## 3. Ejecutar en desarrollo

```bash
npx expo start
```

Luego:

- **Teléfono físico:** escanea el código QR con Expo Go (Android) o con la cámara (iOS).
- **Emulador Android:** pulsa `a` en la terminal o ejecuta `npx expo start --android`.
- **Web:** pulsa `w` o ejecuta `npx expo start --web`.
- **iOS:** requiere macOS; pulsa `i` o ejecuta `npx expo start --ios`.

Si el teléfono no conecta, usa el modo túnel:

```bash
npx expo start --tunnel
```

### Comandos de validación

```bash
npm run typecheck   # TypeScript sin errores
npm run lint        # ESLint / expo lint
npx expo-doctor     # compatibilidad de dependencias y configuración
```

---

## 4. Generar e instalar el APK

> **APK ya generado y verificado:** `PokemonApi-1.0.0-universal.apk`, en la raíz de este proyecto. Es universal (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`), pesa **99.976.743 bytes (95,35 MiB)** y su SHA-256 es `F48F362CE81C037D7EAED1040C62099A8F5FA04A36D4C1D0A06D6EAF87425EB6`. Está firmado con el certificado de depuración (APK Signature Scheme v2), por lo que sirve para instalar y probar, no para publicar en Google Play.

Para comprobar la integridad del archivo copiado:

```powershell
Get-FileHash "PokemonApi-1.0.0-universal.apk" -Algorithm SHA256
```

### 4.1 Compilación local con Gradle

La carpeta `android/` es generada (Continuous Native Generation). Si no existe, créala:

```bash
npx expo prebuild --platform android
```

Compila en PowerShell:

```powershell
$env:JAVA_HOME = "D:\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
cd android
.\gradlew.bat :app:assembleRelease --no-daemon
```

El APK queda en:

```text
android\app\build\outputs\apk\release\app-release.apk
```

Verifica que exista y consulta su tamaño:

```powershell
Get-Item "android\app\build\outputs\apk\release\app-release.apk" |
  Select-Object FullName, Length, LastWriteTime
```

> El APK de `release` generado localmente usa la firma de depuración configurada por Expo. Es instalable para pruebas, pero no sirve para publicar en Google Play.

### 4.2 Instalar el APK en el teléfono

**Opción A — USB con ADB:**

1. Activa las **Opciones de desarrollador** y la **Depuración USB** en el teléfono.
2. Conecta el teléfono y acepta la huella RSA.
3. Desde la **raíz del proyecto**, ejecuta:

```bash
adb devices
adb install -r "PokemonApi-1.0.0-universal.apk"
```

Si compilaste tú mismo, también puedes instalar la salida de Gradle:

```bash
adb install -r "android\app\build\outputs\apk\release\app-release.apk"
```

**Opción B — Copiar el archivo:**

1. Copia `PokemonApi-1.0.0-universal.apk` al teléfono (USB, Google Drive, correo, etc.).
2. En el teléfono, abre el archivo desde un explorador de archivos.
3. Permite **“Instalar apps desconocidas”** para esa aplicación cuando Android lo solicite.
4. Instala y abre **PokemonApi**.

### 4.3 Alternativa con EAS Build

Requiere una cuenta de Expo. El proyecto incluye `eas.json` con el perfil `preview`, que genera un APK:

```bash
npx eas-cli@latest init
npx eas-cli@latest build --platform android --profile preview
```

---

## 5. Recorrido funcional

### 5.1 Pokédex (pestaña “Pokédex”)

1. Al abrir, se consulta `GET https://pokeapi.co/api/v2/pokemon?limit=2000`.
2. La lista muestra 24 Pokémon por página.
3. Escribe en el buscador para filtrar por nombre o número; la búsqueda es sobre el índice ya descargado.
4. Pulsa **“Ver más Pokémon”** para cargar los siguientes 24.
5. Desliza hacia abajo para refrescar (`RefreshControl`).
6. Toca una tarjeta para abrir el detalle.

### 5.2 Detalle (`/pokemon/[id]`)

1. Se consulta `GET https://pokeapi.co/api/v2/pokemon/{id}`.
2. Se muestran imagen, tipos, altura, peso y estadísticas.
3. Escribe una nota (opcional) y pulsa **Guardar en mi colección**.
4. Si el Pokémon ya está en la colección, la app lo indica y no crea un duplicado.
5. Si no hay conexión y no existe caché de la colección, el guardado se bloquea con un mensaje; no se asume que el Pokémon no existe.

### 5.3 Colección (pestaña “Mi colección”)

1. Consulta `GET` al endpoint de MockAPI.
2. Muestra cada registro con su imagen, nota, estado de favorito y fecha.
3. Pulsa la **estrella** para marcar o desmarcar un favorito (`PATCH`).
4. Pulsa **Editar** para cambiar la nota y guardarla (`PATCH`).
5. Desliza hacia abajo para refrescar.
6. Las tarjetas muestran “Guardado pendiente” o “Cambio pendiente” cuando hay una mutación en cola.

---

## 6. Prueba del modo sin conexión

La app usa `onlineManager` de TanStack Query conectado a `expo-network`.

1. Abre la app con Internet y entra a **Pokédex** y **Mi colección** para llenar la caché.
2. Activa **modo avión** en el teléfono.
3. Vuelve a abrir ambas pestañas: deben mostrarse los datos guardados y el aviso **“Sin conexión”**.
4. En **Mi colección**, cambia un favorito o guarda una nota.
   - La tarjeta debe quedar en estado pendiente.
   - El banner debe indicar que hay cambios esperando sincronización.
5. Cierra la app por completo (no solo la minimices) y vuelve a abrirla sin conexión.
   - La caché debe restaurarse desde AsyncStorage.
   - Las mutaciones pausadas deben seguir pendientes.
6. Desactiva el modo avión.
7. Al recuperar la conexión, `resumePausedMutations()` envía los cambios y la colección se refresca.

> Para una prueba limpia, instala el APK, abre la app una vez con Internet, cierra sesión de red y repite los pasos.

---

## 7. Lista de comprobación en dispositivo físico

Marca cada punto después de instalar el APK:

- [ ] La app abre sin pantalla en blanco ni cierre inesperado.
- [ ] El splash desaparece y se ve la Pokédex.
- [ ] La lista carga Pokémon con imágenes.
- [ ] El buscador filtra por nombre y número.
- [ ] “Ver más Pokémon” agrega 24 elementos.
- [ ] Abrir un Pokémon muestra tipos y estadísticas.
- [ ] Guardar un Pokémon lo hace aparecer en **Mi colección**.
- [ ] Intentar guardar el mismo Pokémon otra vez muestra el aviso de duplicado.
- [ ] Editar una nota se refleja en la tarjeta.
- [ ] Marcar/desmarcar favorito actualiza el contador.
- [ ] Los estados de carga, error y vacío se ven correctamente.
- [ ] Con modo avión se muestran datos en caché.
- [ ] Los cambios hechos sin conexión quedan pendientes.
- [ ] Al reconectar, los cambios pendientes se sincronizan.
- [ ] Cerrar y reabrir la app conserva la caché.
- [ ] El diseño Glassmorphism se ve bien en una pantalla pequeña y con texto grande del sistema.

---

## 8. Problemas frecuentes

| Problema | Qué revisar |
|---|---|
| La app no conecta con Expo Go | Teléfono y PC en la misma red; prueba `npx expo start --tunnel` |
| Error al consultar MockAPI | Que `.env` tenga la URL exacta y que el recurso `/pokemons` exista |
| No aparece el APK | Revisa el final del log de Gradle; confirma `ANDROID_HOME` y el JDK |
| Gradle falla por SDK faltante | Instala la plataforma/build-tools indicados en el error o ejecuta `sdkmanager` |
| Gradle falla con `ninja: error: mkdir(...)` y la ruta del proyecto tiene espacios | Copia el proyecto completo (incluido `node_modules`) a una ruta sin espacios, por ejemplo `C:\build\PokemonApi`, y compila desde ahí. `subst` no basta porque Node resuelve la ruta real |
| Ninja falla con `Filename longer than 260 characters` | Usa Ninja 1.13.2 o una ruta de proyecto más corta. El Ninja 1.10.2 incluido en CMake 3.22.1 no admite rutas de objetos tan largas |
| Cambios sin conexión que no se sincronizan | Vuelve a abrir la app con red; revisa el banner de pendientes |
| Imágenes que no cargan | Algunas URLs de sprites dependen de GitHub; la app usa un respaldo |

---

## 9. Evidencia de validaciones

En este entorno se ejecutaron correctamente:

- `npm run typecheck`
- `npm run lint`
- `npx expo-doctor` (20/20)
- `npx expo export --platform all` (iOS, Android y web)
- Consultas HTTP de solo lectura a PokéAPI (listado y detalle) y a MockAPI (`GET`).
- `:app:assembleRelease` con Gradle: **BUILD SUCCESSFUL**, APK universal de 95,35 MiB.
- Verificación del APK con `aapt dump badging`, `apksigner verify` y `zipalign -c -v 4`: correcta.

La **instalación y las pruebas en teléfono físico siguen pendientes** y debe realizarlas el usuario. En este entorno no había dispositivo conectado (`adb devices` vacío), así que no se simularon pruebas de instalación, arranque, apariencia, almacenamiento ni reconexión real.
