# 🏗️ Sistema SG-SST — Torres de Anim II

**NIT:** 900563807-7  
**Dirección:** Calle 103A No. 11B-34  
**Email:** torresdeanim2@gmail.com  
**Administradora:** Gloria Azcárate — 315 633 0171  
**Resolución aplicable:** 0312/2019  

---

## ⚙️ Configuración inicial

### 1. Credenciales Firebase

Abre el archivo `js/firebase-config.js` y reemplaza los valores `PEGAR_*` con las credenciales
del proyecto Firebase de Compliance Pro:

```javascript
const firebaseConfig = {
    apiKey:            "TU_API_KEY",
    authDomain:        "TU_AUTH_DOMAIN",
    databaseURL:       "TU_DATABASE_URL",
    projectId:         "TU_PROJECT_ID",
    ...
};
```

> 💡 Las credenciales están en el archivo `index.html` del sistema Convivienda (busca `firebaseConfig`).

### 2. Usuario administrador en Firebase Auth

1. Ve a [Firebase Console](https://console.firebase.google.com) → Autenticación → Usuarios
2. Agrega usuario con correo: **torresdeanim2@gmail.com**
3. Define una contraseña segura para la administradora

### 3. Plano de evacuación

Reemplaza el archivo `assets/plano.png` con el plano de evacuación del edificio.

### 4. Contratistas

Edita `datos-edificio.json` y llena los campos de contratistas:
```json
"contratistas": [
  {
    "nombre": "Empresa S.A.S.",
    "contacto": "Juan Pérez · 300 123 4567",
    "servicio": "Mantenimiento locativo"
  }
]
```

---

## 🚀 Subir a GitHub Pages

```bash
# Desde la carpeta sst-anim2/
git init
git add .
git commit -m "Sistema SG-SST Torres de Anim II inicial"
git remote add origin https://github.com/torresdeanim2/sst-anim2.git
git push -u origin main
```

Luego en GitHub: Settings → Pages → Branch: main → / (root) → Save

**URL del sistema:** `https://torresdeanim2.github.io/sst-anim2/`

---

## 📂 Estructura Firebase

Todos los datos del edificio se guardan bajo el nodo:
```
/edificios/anim2/
  ejecucion/
  documentos/
  informes/
  cuentas/
  cotizaciones/
  supervisiones/
  habeas_data/
```

---

Responsable: Carla Castellano Madriz | C.E. 679955 | © 2026 — Compliance Pro
