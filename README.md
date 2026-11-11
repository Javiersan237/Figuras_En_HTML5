# 🧊 Análisis del Pipeline 3D y Construcción de Nuevas Primitivas HTML5

Práctica de Graficación 3D que implementa un pipeline completo de transformaciones
(traslación, escalamiento, rotación, sesgado) y proyección perspectiva sobre
primitivas geométricas construidas manualmente con vértices y aristas,
renderizadas en un <canvas> de HTML5 sin librerías externas.

## 🌐 Demo en vivo

Ver proyecto en GitHub Pages:
[https://javiersan237.github.io/Figuras_En_HTML5/](https://javiersan237.github.io/Figuras_En_HTML5/)
---

## 📋 Descripción

El proyecto parte de un cubo 3D base y extiende el modelo local para incluir
cuatro primitivas geométricas centradas en el origen (0,0,0). Cada figura se
define mediante una lista de vértices y una matriz de conectividad (aristas)
que el pipeline transforma y proyecta en tiempo real según los controles del
usuario.

El flujo de renderizado sigue el pipeline clásico de graficación:

    Modelo local (3D)
       -> Escalamiento
       -> Shear
       -> Rotación (X, Y, Z)
       -> Traslación
       -> Proyección perspectiva
       -> Coordenadas 2D (Canvas)

---

## ✨ Características

### Parte 1 — Nuevas primitivas geométricas

| Primitiva                  | Vértices | Aristas | Descripción                                              |
|----------------------------|:--------:|:-------:|----------------------------------------------------------|
| Cubo                       |    8     |   12    | Figura base del proyecto original                        |
| Pirámide de base cuadrada  |    5     |    8    | Base en Y = -S, ápice en (0, S, 0)                       |
| Prisma triangular          |    6     |    9    | Dos triángulos equiláteros unidos por aristas verticales |
| Octaedro                   |    6     |   12    | Dos pirámides unidas por su base, alineado a los ejes    |

Cada primitiva se selecciona desde un <select> en el panel lateral.

### Parte 2 — Pipeline de transformaciones

- Traslación (Tx, Ty, Tz) — deslizadores de -200 a 200.
- Escalamiento (Sx, Sy, Sz) — deslizadores de 0.2 a 3.0.
- Rotación (Rx, Ry, Rz) — deslizadores de -180° a 180°.
- Sesgado / Shear (Sh-XY, Sh-XZ) — deslizadores de -1.0 a 1.0.
- Proyección perspectiva con distanciaCamara = 500.

### Parte 3 — Personalización visual

- Paleta propia: violeta #a855f7, cian #22d3ee, amarillo #facc15.
- Aristas con gradiente violeta -> cian.
- Vértices con halo amarillo (shadowBlur).
- Grosor de línea variable según la escala promedio: lineWidth = 2 * escalaProm.

### 🎯 Reto — Auto-rotación

Botón "▶ Auto-Rotación (Yaw)" que activa un bucle con requestAnimationFrame
incrementando el ángulo de rotación en Y en 1.2° por frame, sin intervención
manual de los deslizadores.

---

## 🛠️ Tecnologías utilizadas

- HTML5 — estructura del canvas y panel de controles.
- CSS3 — tema oscuro, layout flex, estilos del panel y gradientes.
- JavaScript (Vanilla) — pipeline 3D, matemática vectorial, proyección y renderizado.
- Canvas 2D API — dibujo de ejes, aristas y vértices.

> Sin frameworks, sin dependencias, sin build tools. Solo abrir index.html.

---

## 📁 Estructura del proyecto

    .
    ├── index.html      # Estructura del canvas y panel de controles
    ├── styles.css      # Tema visual y estilos del panel
    ├── script.js       # Pipeline 3D, primitivas y renderizado
    ├── .gitignore      # Archivos ignorados por Git
    └── README.md       # Este archivo

---

## 🚀 Cómo ejecutar localmente

1. Clona el repositorio:

       git clone https://github.com/TU_USUARIO/TU_REPO.git

2. Entra a la carpeta:

       cd TU_REPO

3. Abre index.html en tu navegador (doble clic o usa Live Server en VS Code).

> No requiere servidor ni instalación de dependencias.

---

## 🎮 Cómo usar la aplicación

1. Selecciona una primitiva en el desplegable del panel lateral.
2. Mueve los deslizadores para aplicar transformaciones en tiempo real.
3. Presiona "Auto-Rotación" para ver la figura girar continuamente sobre el eje Y.
4. Vuelve a presionarlo para detener la animación.

---

## 📐 Respuestas de análisis del pipeline

### 1. Perspectiva — efecto de distanciaCamara

En proyectar3Da2D(), el factor de proyección se calcula como:

    factorProyeccion = distanciaCamara / (v3d.z + distanciaCamara);

- Con distanciaCamara = 500 (valor base): profundidad moderada.
- Con distanciaCamara = 200: el observador se acerca; el factor crece y la
  diferencia entre vértices cercanos y lejanos se exagera -> efecto "ojo de
  pez", perspectiva muy agresiva.
- Con distanciaCamara = 1000: el observador se aleja; el factor tiende a 1 ->
  la proyección se vuelve casi ortográfica (paralela), la figura se ve más
  plana y pequeña.

### 2. Orden de transformaciones — Traslación antes de Rotación

Si se traslada primero, el objeto deja de estar centrado en el origen y la
rotación se aplica alrededor del origen del mundo, no de su propio centro.
La figura orbita alrededor del origen en lugar de girar sobre sí misma
(efecto "satélite"). El orden correcto del pipeline es:
Escala -> Shear -> Rotación -> Traslación.

### 3. Inversión del eje Y

En el Canvas HTML5 el origen (0,0) está en la esquina superior izquierda y el
eje Y crece hacia abajo. En el espacio 3D matemático el eje Y crece hacia
arriba. Por eso se usa CENTRO_Y - (v3d.y * factorProyeccion) para que un valor
positivo de Y en 3D aparezca arriba del centro en pantalla. Sin la inversión,
la figura saldría reflejada verticalmente.
---

## 👤 Autor

- Nombre: Ortega Cortez Javier Aram
- Materia: Graficación
- Unidad: 3 — Graficación y Transformaciones 3D

---

## 📄 Licencia

Proyecto académico sin fines de lucro. Libre para uso educativo.
