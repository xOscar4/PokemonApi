# PokemonApi — Pokédex con Expo + TanStack Query

Aplicación móvil académica que consume **PokéAPI** para explorar Pokémon y **MockAPI** para guardar una colección personal con notas y favoritos. La interfaz usa un estilo **Glassmorphism** (tarjetas translúcidas, fondo azul/violeta, bordes suaves).

> Proyecto desarrollado sobre la carpeta existente `PokemonApi` con **Expo SDK 58**, **React Native 0.88**, **Expo Router** y **TanStack Query 5**.

---

## 1. Objetivo

Demostrar en una app móvil:

- Consultas de solo lectura a una API pública (PokéAPI).
- Creación y edición de registros propios en MockAPI.
- Caché de consultas con TanStack Query.
- Persistencia de la caché en AsyncStorage.
- Mutaciones que se pausan sin conexión y se reanudan al reconectar.
- Invalidación selectiva de consultas.
- Navegación con Expo Router (listado, detalle y colección).

---

## 2. Tecnologías

| Tecnología | Uso |
|---|---|
| Expo SDK 58 / React Native 0.88 | Base de la aplicación móvil |
| Expo Router | Navegación por archivos y tabs nativos |
| TypeScript | Tipos estrictos |
| TanStack Query 5 | Consultas, caché, mutaciones y persistencia |
| AsyncStorage 2.2.0 | Almacenamiento local de la caché |
| `expo-network` | Detección de conectividad para `onlineManager` |
| `expo-image` | Carga y caché de imágenes |
| PokéAPI | Lista, detalle, tipos y estadísticas |
| MockAPI | Colección personal (`pokemons`) |

Dependencias relevantes que ya existían: `@tanstack/react-query`, `@tanstack/react-query-persist-client`, `@tanstack/query-async-storage-persister` y `@react-native-async-storage/async-storage`.

Se agregó `expo-network` con `npx expo install` para tener una sola solución de conectividad compatible con Expo SDK 58. Además, AsyncStorage se alineó a la versión esperada por el SDK (`2.2.0`), porque `expo-doctor` detectó una incompatibilidad de versión mayor con `3.1.1`.

---

## 3. Estructura principal

```text
PokemonApi/
├── .env.example
├── app.json
├── eas.json
├── src/
│   ├── app/
│   │   ├── _layout.tsx              # Providers, persistencia, Stack raíz
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx          # Tabs (nativos en Android/iOS, web en web)
│   │   │   ├── index.tsx            # Listado + búsqueda + paginación
│   │   │   └── collection.tsx       # Colección personal
│   │   └── pokemon/[id].tsx         # Detalle de Pokémon
│   ├── api/
│   │   ├── http.ts                  # fetch centralizado y errores
│   │   ├── pokeapi.ts               # PokéAPI
│   │   └── mockapi.ts               # MockAPI
│   ├── components/                  # Tarjetas, botones, estados, glass UI
│   ├── constants/
│   │   ├── cache.ts                 # Tiempos de caché
│   │   ├── glass.ts                 # Paleta y estilos visuales
│   │   ├── pokemon.ts               # Tipos, colores y etiquetas
│   │   └── queryKeys.ts             # Query keys y mutation keys
│   ├── hooks/                       # useQuery / useMutation / pendientes
│   ├── lib/
│   │   ├── connectivity.ts          # expo-network + onlineManager
│   │   ├── debug-log.ts             # Logs con fecha para desarrollo/Logcat
│   │   └── queryClient.ts           # QueryClient, defaults y persistencia
│   ├── types/
│   └── utils/
├── README.md
└── instrucciones.md
```

---

## 4. APIs utilizadas

### PokéAPI (solo lectura)

- Lista: `GET https://pokeapi.co/api/v2/pokemon?limit=2000`
- Detalle: `GET https://pokeapi.co/api/v2/pokemon/{id}`

PokéAPI no ofrece búsqueda parcial por nombre. Para que la búsqueda sea completa, la app descarga una sola vez el índice de nombres/números y filtra en memoria; la paginación visual se hace con el botón **“Ver más Pokémon”** (24 por página). El detalle consume el endpoint individual y reutiliza la caché.

### MockAPI

Endpoint exacto configurado en `.env`:

```env
EXPO_PUBLIC_MOCKAPI_BASE_URL=https://6ade67884e88f1bba4a5218d.mockapi.io/pokemons
```

La URL **ya incluye** el recurso `/pokemons`. Por eso el código no concatena `/pokemons` ni `/api/v1`.

Operaciones:

- `GET /` → lista de la colección.
- `POST /` → crear un registro.
- `PATCH /{id}` → editar nota o favorito usando el `id` real de MockAPI.

Campos respetados:

```ts
{
  id: string;          // generado por MockAPI
  pokemonId: number;
  name: string;
  imageUrl: string;
  note: string;
  isFavorite: boolean;
  createdAt: string;   // generado por MockAPI
}
```

Al crear se envían únicamente `pokemonId`, `name`, `imageUrl`, `note` e `isFavorite`. No se envían `id` ni `createdAt`.

---

## 5. Configuración del entorno

1. Copia `.env.example` a `.env` (en este proyecto ya existe `.env`):

   ```bash
   copy .env.example .env
   ```

2. Verifica el contenido:

   ```env
   EXPO_PUBLIC_MOCKAPI_BASE_URL=https://6ade67884e88f1bba4a5218d.mockapi.io/pokemons
   ```

Las variables `EXPO_PUBLIC_*` se incluyen en el bundle. No guardes secretos ahí. La URL de MockAPI es pública y no contiene credenciales.

---

## 6. Instalación y ejecución

Requisitos: Node.js 20 o superior y npm.

```bash
npm install
npx expo start
```

Opciones:

```bash
npx expo start --android   # abre un emulador/dispositivo Android
npx expo start --web       # versión web
npx expo start --ios       # requiere macOS
```

Validaciones:

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

> La app usa `expo-network`, incluida en Expo Go, pero para el APK se compila el módulo nativo normalmente.

---

## 7. Query keys

Archivo: `src/constants/queryKeys.ts`.

```ts
queryKeys.pokeapi.all                     // ['pokeapi']
queryKeys.pokeapi.list()                  // ['pokeapi', 'list', 'index']
queryKeys.pokeapi.detail(25)              // ['pokeapi', 'detail', '25']

queryKeys.mockapi.all                     // ['mockapi']
queryKeys.mockapi.collectionList()        // ['mockapi', 'collection', 'list']
queryKeys.mockapi.collectionDetail('12')  // ['mockapi', 'collection', 'detail', '12']
```

Ventajas:

- `invalidateQueries({ queryKey: queryKeys.mockapi.collectionList() })` refresca solo la colección.
- Las consultas públicas (`pokeapi.*`) nunca se invalidan al guardar una nota o favorito.
- Los identificadores de PokéAPI y de MockAPI viven en raíces distintas y no se mezclan.

Mutation keys:

```ts
mutationKeys.createSavedPokemon  // ['mockapi','mutation','create-saved-pokemon']
mutationKeys.updateSavedPokemon  // ['mockapi','mutation','update-saved-pokemon']
```

---

## 8. `staleTime`, `gcTime` y `maxAge`

- **`staleTime`**: tiempo durante el cual un dato se considera “fresco”. Si está fresco, TanStack Query no vuelve a pedirlo automáticamente. No borra el dato.
  - PokéAPI: **5 minutos** (`src/hooks/use-pokemon.ts`).
  - MockAPI: **30 segundos** (`src/hooks/use-saved-pokemon.ts`), porque la colección puede cambiar.
- **`gcTime`**: tiempo que una consulta **sin observadores** permanece en memoria antes de eliminarse. Se configuró en **24 horas** para que coincida con la persistencia.
- **`maxAge`**: antigüedad máxima de la caché guardada en AsyncStorage. Si el archivo persistido es más viejo, se descarta al iniciar. Se configuró en **24 horas**.

`gcTime` debe ser igual o mayor que `maxAge`. Si `gcTime` fuera muy bajo, por ejemplo 1 minuto, una consulta podría eliminarse de memoria aunque la copia persistida siga siendo válida; además, al restaurar se perdería rápidamente el beneficio de la caché. En este proyecto ambos valen 24 horas para que el periodo de vida en memoria y en disco sea coherente.

Que un dato esté persistido **no garantiza** que siempre esté disponible: depende de que se haya guardado correctamente, no haya superado `maxAge`, el `buster` coincida y la restauración de AsyncStorage termine sin errores. Si no, la app consulta la API de nuevo.

---

## 9. Persistencia con AsyncStorage

Archivo: `src/lib/queryClient.ts`.

- `createAsyncStoragePersister` guarda el cliente con la clave `pokemonapi-query-cache`.
- `PersistQueryClientProvider` restaura la caché antes de que las pantallas consulten datos.
- Se persisten únicamente consultas exitosas de `pokeapi` y `mockapi`.
- Se persisten únicamente mutaciones **pausadas** (sin conexión), que son las que necesitan reanudarse.
- `maxAge` = 24 h, `buster` = `pokemonapi-cache-v1`.
- Mientras se restaura, la app muestra una pantalla de carga; al terminar, oculta el splash.
- Solo hay **un** `PersistQueryClientProvider` en `src/app/_layout.tsx`; no hay proveedores duplicados.

El botón de cada pantalla que permite refrescar manualmente sigue consultando la API. Si hay caché, los datos se muestran mientras la consulta se actualiza (`query.data` + `isFetching`).

---

## 10. Mutaciones, invalidaciones y modo sin conexión

### Crear un Pokémon

1. La pantalla de detalle verifica la colección cargada para evitar duplicados.
2. Si la verificación falla por red y **no hay caché**, se bloquea el guardado y se muestra un error con “Reintentar”. No se interpreta un error como “no existe”.
3. Si no hay duplicado ni mutación pendiente, se ejecuta `useMutation` con la mutation key de creación.
4. El `mutationFn` registrado con `setMutationDefaults` hace `POST` al endpoint configurado.
5. Cuando MockAPI confirma, se invalida **solo** `queryKeys.mockapi.collectionList()`.
6. Si no hay conexión, la mutación queda en estado `pending` + `isPaused` y la UI muestra “Guardado pendiente de sincronizar”.

### Editar nota o favorito

1. Se usa el `id` real del registro de MockAPI.
2. Se envía `PATCH` con solo los campos modificados.
3. Al confirmar, se invalida la lista de la colección y la clave de detalle propia del registro (`collectionDetail(id)`).
4. No se invalidan las consultas de PokéAPI.

**No se usan actualizaciones optimistas.** Se eligió la estrategia simple y fiable: la UI muestra el valor confirmado por el servidor o un estado “pendiente” con los datos de la mutación. Si una actualización falla, se muestra el error y no se modifica la caché local como si hubiera funcionado.

### `mutationKey` y `setMutationDefaults`

Las mutaciones se registran en `src/lib/queryClient.ts` con:

- `mutationKey`.
- `mutationFn` (necesario para reanudar después de restaurar).
- `networkMode: 'online'`.
- `retry: 0` para no duplicar `POST`/`PATCH` si la respuesta se pierde.

Los hooks (`useCreateSavedPokemon`, `useUpdateSavedPokemon`) solo declaran la key; así las mutaciones restauradas también encuentran su función. Las invalidaciones se ejecutan dentro del `mutationFn`, justo después de la confirmación del servidor, para que ocurran tanto en una mutación normal como en una reanudada.

### Conectividad

`src/lib/connectivity.ts` conecta `onlineManager` de TanStack Query con `expo-network`:

- Lee el estado inicial con `getNetworkStateAsync()`.
- Escucha cambios con `addNetworkStateListener()`.
- En SSR/web de Node evita registrar listeners (`window` no existe).

Al terminar la restauración, `src/app/_layout.tsx` llama a `queryClient.resumePausedMutations()`. Además, se suscribe a `onlineManager` para volver a llamar a `resumePausedMutations()` cuando regresa la conexión.

### Registro de diagnóstico

`src/lib/debug-log.ts` imprime eventos con fecha y categoría (`APP`, `QUERY`, `CACHE`, `NETWORK`, `MUTATION`, `MOCKAPI`, `PERSIST`). Durante el desarrollo se ven en la terminal de Metro; en el APK se pueden leer con:

```bash
adb logcat -s ReactNativeJS
```

Los logs no alteran el flujo de datos ni las mutaciones; solo registran el inicio de la app, consultas, conectividad, persistencia y reanudación.

### Limitaciones de la reanudación

- Si la conexión se corta **después** de que MockAPI procesó la solicitud pero antes de recibir la respuesta, la app no puede saberlo. Al reanudar podría repetirse la operación y crear un duplicado. Por eso no se reintenta automáticamente una mutación que ya falló online: solo se reanudan las que estaban pausadas.
- MockAPI no tiene una restricción única por `pokemonId`; la prevención de duplicados es de la interfaz y se basa en la colección más reciente disponible.
- Sin conexión y sin caché de la colección, no se permite guardar un Pokémon nuevo porque no se puede comprobar si ya existe.

---

## 11. Invalidaciones utilizadas

| Mutación | Consultas invalidadas | Motivo |
|---|---|---|
| Crear Pokémon | `['mockapi','collection','list']` | Aparece el nuevo registro |
| Editar nota/favorito | `['mockapi','collection','list']` y `['mockapi','collection','detail',id]` | Refresca la lista y el detalle propio afectado |
| Ninguna mutación | `['pokeapi', ...]` | PokéAPI es de solo lectura; no cambia |

---

## 12. Interfaz

- Fondo con gradiente azul/violeta y orbes translúcidos.
- Tarjetas `GlassCard` con fondo semitransparente, borde sutil, esquinas redondeadas y sombra moderada.
- No se usa `backdrop-filter` nativo porque no está disponible de forma uniforme en React Native; se simula con capas translúcidas.
- Estados visuales: carga, error, éxito, sin conexión y sincronización pendiente.
- Componentes adaptables con `maxWidth` de 760 px y `ScrollView`/`FlatList`.
- Tabs nativos en Android/iOS y tabs headless en web.

---

## 13. Generar el APK

La app usa Continuous Native Generation: `android/` e `ios/` son generados. No se editan a mano.

### Opción local (Gradle)

Requisitos: JDK 17 o superior, Android SDK con plataformas y build-tools, variable `ANDROID_HOME`/`ANDROID_SDK_ROOT`.

```bash
npx expo prebuild --platform android
cd android
./gradlew :app:assembleRelease
```

En Windows PowerShell:

```powershell
$env:JAVA_HOME = "D:\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
cd android
.\gradlew.bat :app:assembleRelease
```

El APK se genera con la firma de depuración que Expo configura para `release` en el proyecto generado. Es instalable manualmente, pero no está pensado para publicarse en Google Play.

### APK generado en este entorno

Se compiló y verificó un **APK universal** para las cuatro arquitecturas Android:

```text
C:\Users\Administrator\Documents\aplicacion web\PokemonApi\PokemonApi-1.0.0-universal.apk
```

- Tamaño: **99.985.035 bytes (95,35 MiB)**.
- SHA-256: `22EC0DD5CD53AD9BDB9E1D8648A5A0147E15C4752D632195BC38F8B0C06883FF`.
- Paquete: `com.pokemonapi.glass`, versión `1.0.0` (`versionCode` 1).
- `minSdkVersion` 24, `targetSdkVersion` 36.
- Arquitecturas incluidas: `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`.
- Firma APK v2 con el certificado de depuración de Android.
- Verificado con `aapt dump badging`, `apksigner verify` y `zipalign -c -v 4`.

La compilación se ejecutó en `C:\build\PokemonApi` (copia del proyecto sin espacios en la ruta) y el archivo final se copió a la raíz de `PokemonApi`.

> En Windows, CMake/Ninja puede fallar si la ruta del proyecto contiene espacios (por ejemplo, `aplicacion web`). En ese caso, copia el proyecto completo (incluido `node_modules`) a una ruta sin espacios, como `C:\build\PokemonApi`, y compila desde ahí. Cambiar solo la letra de unidad con `subst` no basta porque Node resuelve la ruta real. Si aparece `Filename longer than 260 characters` con el Ninja 1.10.2 incluido en CMake 3.22.1, usa Ninja 1.13.2 o una ruta de proyecto más corta.

### Opción EAS Build

```bash
npx eas-cli@latest build --platform android --profile preview
```

Requiere una cuenta de Expo. El proyecto incluye `eas.json` con el perfil `preview`, que genera un APK (`"buildType": "apk"`). La primera vez hay que vincular el proyecto:

```bash
npx eas-cli@latest init
npx eas-cli@latest build --platform android --profile preview
```

En este entorno no había EAS CLI instalado ni autenticado, por lo que se usó la compilación local con Gradle.

---

## 14. Validaciones realizadas en este entorno

- Inspección de `package.json`, `app.json`, `tsconfig.json` y estructura existente.
- `npm run typecheck` (`tsc --noEmit`): sin errores.
- `npm run lint` (`expo lint` / ESLint): sin errores.
- `npx expo-doctor`: 20/20 comprobaciones correctas.
- `npx expo export --platform all`: bundles iOS, Android y web generados correctamente.
- Solicitudes HTTP de solo lectura:
  - PokéAPI listado: HTTP 200, 1351 resultados.
  - PokéAPI detalle de Pikachu: HTTP 200, tipos y estadísticas correctos.
  - MockAPI `GET`: HTTP 200 y colección accesible. En la comprobación final devolvió 2 registros de prueba; las validaciones de este agente fueron de solo lectura y no crearon ni modificaron registros.
- Compilación Android `:app:assembleRelease` con Gradle: **BUILD SUCCESSFUL**. APK universal de 95,35 MiB generado y verificado con `aapt`, `apksigner` y `zipalign` (firma APK v2, cuatro ABIs).

No se crearon ni modificaron registros reales en MockAPI desde las validaciones de este agente. No se probó la instalación ni el uso en un teléfono físico: arranque, apariencia real, permisos, almacenamiento y reconexión quedan para la instalación manual del APK.

---

## 15. Limitaciones conocidas

- PokéAPI no permite búsqueda parcial; se filtra sobre el índice descargado.
- Las imágenes se cargan desde GitHub (sprites oficiales de PokéAPI) y pueden fallar si hay bloqueo de red; se usa el sprite pequeño como respaldo.
- La prevención de duplicados es local/UI; MockAPI no impone unicidad.
- Una mutación pausada puede repetirse si el servidor la procesó y la respuesta se perdió.
- La persistencia restaura la última copia guardada, pero no garantiza disponibilidad si expiró, se corrompió o AsyncStorage falló.
- El APK local usa firma de depuración; es instalable para pruebas, pero no es apto para Google Play.
- No se ejecutaron pruebas en dispositivo físico: instalación, arranque, apariencia real, permisos, almacenamiento y reconexión quedan pendientes de la prueba manual.
