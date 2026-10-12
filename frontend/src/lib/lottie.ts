import { setWasmUrl } from '@lottiefiles/dotlottie-react'
import lottieWasm from '@lottiefiles/dotlottie-web/dotlottie-player.wasm?url'

// El reproductor, si no se le dice otra cosa, baja este archivo de un CDN.
// La app se liga al Wi-Fi de la campana, que no tiene internet: sin esto el
// canvas queda vacío en cuanto esa descarga falla.
setWasmUrl(lottieWasm)
