---
name: trabajos-latex-unicordoba
description: >-
  Genera trabajos académicos universitarios en LaTeX con el formato del usuario
  (Universidad de Córdoba, Ingeniería de Sistemas): portada institucional, índice
  + índice de tablas + índice de figuras, secciones sin numerar pero indexadas,
  tablas longtable, diagramas TikZ, referencias APA en español y compilación
  verificada a PDF. Úsala SIEMPRE que el usuario pida un trabajo, informe, taller,
  actividad evaluativa, investigación, ensayo o documento académico en LaTeX o PDF
  para la universidad, incluso si solo dice "hazme el trabajo de X", "arma el PDF
  de la actividad", "necesito el documento de la materia Y" o adjunta diapositivas
  de clase y pide desarrollar un tema. También aplícala cuando pida corregir,
  ampliar o recompilar un .tex académico ya existente.
---

# Trabajos académicos en LaTeX (Universidad de Córdoba)

Esta skill reproduce el formato y el estilo de redacción con el que el usuario entrega sus trabajos universitarios. El resultado siempre son **dos archivos**: el `.tex` fuente y el `.pdf` compilado y verificado.

## Antes de escribir: lo que hay que tener claro

Antes de redactar, confirma (o deduce del contexto y de los archivos adjuntos) estos puntos. Si falta algo esencial y no puedes deducirlo, **pregunta con `ask_user_input_v0` en una sola ronda**, no en varias:

1. **Tema exacto asignado.** Si el enunciado reparte temas por grupos, usa solo los del grupo del usuario.
2. **Proyecto de aplicación.** Muchos trabajos no son teóricos: se aplican a un proyecto concreto del curso. Si el usuario adjunta un `.tex` o documento previo, **léelo completo** y reutiliza el proyecto, sus datos y su terminología, para que haya continuidad entre entregas.
3. **Docente y asignatura.** Van en la portada.
4. **Integrantes del grupo.** Van en la portada, en el orden que los dé el usuario.
5. **Extensión.** Por defecto el usuario quiere trabajos extensos y bien desarrollados, no resúmenes.

## Estructura del documento

En este orden:

1. Portada (ver `assets/plantilla.tex`)
2. `\tableofcontents`, `\listoftables`, `\listoffigures`
3. Introducción
4. Objetivos (general y específicos)
5. Marco conceptual — la teoría, con citas
6. Aplicación al proyecto concreto — la parte que más pesa
7. Conclusiones (viñetas con hallazgos reales del análisis, no relleno)
8. Referencias en APA

Usa `assets/plantilla.tex` como punto de partida: ya trae el preámbulo, la portada y ejemplos de tabla y figura correctos.

## Reglas de formato que no se negocian

- **Clase y preámbulo:** `\documentclass[12pt,letterpaper]{article}`, márgenes `2.54cm`, `mathptmx` (Times), `\doublespacing`.
- **Todo en negro**, títulos en negrilla. `\color{black}` explícito.
- **Paginación en el pie:** `\pagestyle{plain}`. Nunca encabezados tipo header.
- **Secciones sin numerar pero sí en el índice.** Siempre en pareja:
  ```latex
  \section*{Título}
  \addcontentsline{toc}{section}{Título}
  ```
  Igual con `\subsection*` + `\addcontentsline{toc}{subsection}{...}`. Los `\subsubsection*` normalmente no se indexan.
- **`\setcounter{tocdepth}{3}`** antes del índice.

## Trampas técnicas ya conocidas (evítalas desde el principio)

Estas ya costaron tiempo antes. No las repitas:

- **`babel` con `spanish` puede no estar instalado** en el entorno. Si al compilar aparece `Unknown option 'spanish'`, quita el paquete y define los nombres a mano:
  ```latex
  \renewcommand{\contentsname}{Índice}
  \renewcommand{\listtablename}{Índice de tablas}
  \renewcommand{\listfigurename}{Índice de figuras}
  \renewcommand{\tablename}{Tabla}
  \renewcommand{\figurename}{Figura}
  ```
  Avísale al usuario que, si compila en su máquina con LaTeX completo, puede volver a poner `babel`.
- **URLs largas desbordan el margen.** Carga `\usepackage{xurl}` **después** de `hyperref`. Esto elimina los `Overfull \hbox` de la sección de referencias.
- **`longtable` duplica la entrada en el índice de tablas** cuando la tabla ocupa más de una página, porque repite el `\caption`. Usa siempre el patrón `\endfirsthead` / `\endhead` de `assets/plantilla.tex`.
- **Diagramas TikZ con texto superpuesto.** Los círculos concéntricos casi siempre encabalgan el texto. Prefiere **capas apiladas, cajas o diagramas radiales con separación amplia**. Verifica siempre el render, no solo que compile.

## Tablas y figuras

- Toda tabla va en `longtable`, con `\caption{...}\label{tab:...}` y el patrón de encabezado repetido.
- Toda figura TikZ va dentro de `figure[H]` (paquete `float`) con `\caption{...}\label{fig:...}`.
- **Referencia cada tabla y figura desde el texto** con `\ref{}`: "como se resume en la Tabla \ref{tab:sectores}". Si una tabla no se menciona en el cuerpo, sobra.
- Columnas siempre con `>{\raggedright\arraybackslash}p{0.XX\textwidth}`, sumando ~0.90–0.92 del ancho.
- `booktabs`: `\toprule`, `\midrule`, `\bottomrule`, `\addlinespace` entre filas.

## Estilo de redacción

Escribe como una persona, no como un chatbot. Aplica el criterio de `humanizer`:

- **Nada de guiones largos** encerrando frases. Usa comas, paréntesis o dos puntos.
- Nada de lenguaje inflado ni publicitario: sin "juega un papel crucial", "pilar fundamental", "en el vibrante panorama de".
- Nada de frases de relleno ni secciones tipo "Desafíos y perspectivas futuras" si no aportan nada real.
- Varía el largo de las frases. Las oraciones cortas están bien.
- Las conclusiones deben decir algo que salga del análisis hecho, no repetir la introducción.
- Español de Colombia, registro académico pero natural.

## Referencias

- APA, sangría francesa con `hangparas`:
  ```latex
  \begin{hangparas}{0.5in}{1}
  ... entradas ...
  \end{hangparas}
  ```
- Orden alfabético.
- **Fuentes confiables, accesibles y en español.** Prioriza: entidades oficiales colombianas (DANE, MinTIC, CREG, UPME, IDEAM, cámaras de comercio), libros de referencia del área, y portales reconocidos. Incluye la URL cuando la fuente sea web.
- Todo lo que citas en el cuerpo debe estar en referencias, y viceversa.
- No inventes fuentes ni datos. Si necesitas cifras actuales del sector, **búscalas en la web** y cítalas.

## Compilación y verificación (obligatorio)

Nunca entregues un `.tex` sin compilar. El flujo es:

```bash
cd /home/claude
pdflatex -interaction=nonstopmode doc.tex > c1.log 2>&1
pdflatex -interaction=nonstopmode doc.tex > c2.log 2>&1
pdflatex -interaction=nonstopmode doc.tex > c3.log 2>&1
grep -iE "! |error" c3.log
grep -iE "overfull" c3.log
```

Tres pasadas: hacen falta para que índice, `\ref` y paginación cuadren. Los logs traen bytes inválidos, así que si necesitas leerlos completos usa `iconv -f utf-8 -t utf-8 -c c3.log | tail -100`.

Luego **revisa visualmente** las páginas críticas (portada, índices, cada figura, alguna tabla larga, referencias):

```bash
python3 -c "
from pdf2image import convert_from_path
pages = convert_from_path('doc.pdf', dpi=100, first_page=1, last_page=1)
pages[0].save('p1.png')
"
```

y ábrelas con `view`. Compilar sin error no garantiza que se vea bien: los problemas de TikZ y de tablas solo se ven mirando.

Corrige y recompila hasta que no queden `error` ni `Overfull \hbox`, y hasta que las figuras se lean bien.

## Entrega

Copia ambos archivos a `/mnt/user-data/outputs/` y preséntalos con `present_files`, el PDF primero:

```
present_files(["/mnt/user-data/outputs/doc.pdf", "/mnt/user-data/outputs/doc.tex"])
```

Cierra con un resumen breve: qué cubre el trabajo, cuántas páginas, cuántas tablas y figuras, y cualquier nota técnica relevante (por ejemplo, si tuviste que quitar `babel`). Sin párrafos largos después de los archivos.
