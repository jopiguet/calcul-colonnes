# GitHub — un curso completo

## Cómo usar este curso

Este curso lleva del primer repositorio a dirigir un equipo en GitHub: colaboración, revisión, automatización con Actions y seguridad del código y de sus dependencias. Describe GitHub tal como funciona a finales de 2026; los ajustes cambian de sitio en la interfaz de vez en cuando, así que el curso nombra las funciones en vez de las rutas de menú.

**Para quién.** Desarrolladores que han usado Git por su cuenta y quieren trabajar bien con otros en GitHub, y responsables de equipo que montan repositorios, reglas y pipelines. Basta con Git básico (commit, rama, fusión) para empezar.

**Organización.** Ocho partes en dos bloques:

| Bloque | Partes | Qué sabes hacer después |
|---|---|---|
| Trabajar juntos | 1 Repositorios · 2 Issues y Projects · 3 Pull requests · 4 Organizaciones y método | Llevar un proyecto en el que los cambios se proponen, se revisan y se siguen |
| Automatización y seguridad | 5 Protección de ramas y rulesets · 6 Actions · 7 Proteger los workflows · 8 La cadena de suministro | Garantizar la calidad en `main`, automatizar pruebas y despliegues, y mantener bajo control secretos y dependencias |

Cada parte termina con lo que hay que recordar. Los ejercicios del final dan una tarea por parte, con respuestas.

**Con Luma.** El test *🐙 GitHub* del grupo *Informatique* de Luma sigue las mismas ocho partes en cuatro niveles (Principiante a Experto), con 128 preguntas redactadas. Lee una parte y luego haz el test sobre ella: la revisión de errores remite a la parte que necesitas.

**Qué necesitas.** Una cuenta de GitHub, Git instalado e idealmente la CLI de GitHub (`gh`). Un repositorio personal basta para las partes 1 a 3 y 5 a 8; la parte 4 es más fácil con una organización gratuita.

## Parte 1 — Los repositorios

Un repositorio son los archivos de un proyecto más todo su historial. GitHub aloja el repositorio y añade todo lo que lo rodea: issues, pull requests, Actions, funciones de seguridad y permisos.

### Commits, ramas e historial

Un **commit** es una instantánea de todo el árbol de archivos, con un autor, una fecha, un mensaje y un enlace a su commit padre. Git identifica cada commit con un hash (su SHA) calculado sobre todo eso, así que cambiar cualquier cosa de un commit antiguo cambia el SHA de todos sus descendientes. Por eso reescribir un historial publicado molesta: los demás siguen teniendo los commits antiguos.

Una **rama** no es más que un nombre móvil que apunta a un commit. Crear una es instantáneo, así que el trabajo se hace en ramas de corta duración y llega a `main` mediante una pull request. Un **tag** es un nombre que no se mueve, usado para las versiones (`v1.4.0`); una **release** de GitHub es una página construida sobre un tag, con notas y archivos descargables.

### Clon, fork y remotos

- `git clone` copia un repositorio y su historial en tu máquina.
- Un **fork** es una copia en GitHub, bajo tu cuenta. Haces fork de un proyecto en el que no puedes escribir, subes una rama a tu fork y abres una pull request hacia el original.

Por convención, en un clon de tu fork, `origin` es tu fork y `upstream` el original:

```sh
git clone git@github.com:you/project.git
cd project
git remote add upstream git@github.com:acme/project.git
git fetch upstream
git switch -c fix-typo upstream/main
```

El botón Sync fork, o `gh repo sync`, pone al día el `main` de tu fork. Mantén tus propios commits fuera del `main` de tu fork, para que sincronizar nunca dé conflicto.

### Los archivos que todo repositorio debería tener

| Archivo | Función |
|---|---|
| `README.md` | Qué es el proyecto, cómo instalarlo y usarlo |
| `LICENSE` | Quién puede usar el código y cómo; sin licencia, nadie puede reutilizarlo legalmente |
| `.gitignore` | Los archivos que Git no debe seguir: resultados de build, dependencias, `.env` |
| `CONTRIBUTING.md` | Cómo proponer un cambio: instalación, pruebas, estilo, pull requests |
| `SECURITY.md` | Cómo informar en privado de una vulnerabilidad |
| `CODE_OF_CONDUCT.md` | La conducta que se espera de cada uno |

Una organización puede dar archivos comunitarios por defecto en un repositorio llamado `.github`. Un **repositorio plantilla** da sus archivos a los repositorios nuevos, con un historial nuevo.

### Reescribir el historial sin peligro

En tu propia rama, `git rebase` y `git commit --amend` reescriben commits; la rama remota necesita entonces un push forzado. Usa la forma prudente:

```sh
git push --force-with-lease
```

Se niega si otra persona subió entretanto, en vez de borrar sus commits. Nunca reescribas una rama compartida.

Un secreto confirmado por error se queda en el historial aunque un commit nuevo lo borre. Revoca primero la credencial; luego, si hace falta, reescribe el historial con `git filter-repo`, fuerza el push de cada rama y tag, y haz que los colaboradores vuelvan a clonar.

### Archivos grandes, firmas y repositorios grandes

- **Git LFS** guarda los binarios grandes fuera de Git, dejando punteros pequeños en el repositorio; GitHub rechaza en Git normal los archivos de más de 100 MB.
- Los **commits firmados** (claves GPG, SSH o S/MIME) reciben una insignia Verified: el campo autor por sí solo no prueba nada.
- Los **clones superficiales y parciales** hacen rápida la CI: `actions/checkout` solo descarga el commit que se construye, salvo que fijes `fetch-depth: 0`.

**Para recordar.** Un commit es una instantánea inmutable con nombre de hash; las ramas son nombres baratos; los forks son copias en el servidor; nunca reescribas un historial compartido y considera filtrado cualquier secreto confirmado.

## Parte 2 — Issues y Projects

Las issues son la lista de tareas del proyecto; los Projects planifican sobre muchas de ellas; Discussions acoge las conversaciones que aún no son trabajo.

### Las issues

Una issue tiene un título, una descripción, etiquetas, asignados, un milestone opcional y una conversación. Unos pocos hábitos las hacen útiles:

- Las **etiquetas** clasifican y filtran: `bug`, `docs`, `good first issue`, `help wanted`. Las dos últimas se muestran a los recién llegados.
- Las **menciones** (`@lea`, `@acme/backend`) notifican a las personas y las suscriben.
- Las **palabras de cierre** en una pull request (`Fixes #42`, `Closes #42`, `Resolves #42`) enlazan la issue y la cierran cuando la pull request se fusiona en la rama por defecto.
- Un buen informe de error da los pasos para reproducirlo, el comportamiento esperado y el real, y la versión.

### Plantillas y formularios

Los archivos de `.github/ISSUE_TEMPLATE/` dan forma a las issues nuevas. Los formularios de issue son YAML con campos de verdad:

```yaml
name: Bug report
description: Something does not work
labels: [bug]
body:
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: Version
```

Un `config.yml` en la misma carpeta puede desactivar las issues en blanco y remitir las preguntas a Discussions.

### Los Projects

Un Project es una tabla, un tablero o una hoja de ruta sobre issues y pull requests de cualquier repositorio de su propietario. Los elementos son las issues reales, con campos adicionales: Status, Priority, Iteration, Estimate. Unos workflows integrados añaden elementos automáticamente y fijan Status cuando un elemento se añade, se cierra o se fusiona; lo que sea más concreto se programa con la API GraphQL.

Las **sub-issues** convierten una función en un padre con issues hijas, incluso entre repositorios, y los **tipos de issue** (bug, feature, task), definidos por la organización, completan a las etiquetas.

### Búsqueda y triaje

Los calificadores de búsqueda se combinan: `is:issue is:open label:bug no:assignee` lista los bugs sin responsable. Guardada como vista de un Project, una consulta así se convierte en la lista de triaje. Las iteraciones no mueven solas los elementos sin terminar: moverlos es una decisión de planificación.

### Moderación

Los mantenedores pueden bloquear una conversación, ocultar comentarios fuera de tema o abusivos, transferir una issue a otro repositorio del mismo dueño y fijar límites temporales de interacción en un repositorio público lleno de spam. Un código de conducta da las reglas a las que remitir.

**Para recordar.** Una issue, una tarea; etiquetas y formularios agilizan el triaje; los Projects planifican entre repositorios con campos y vistas; Discussions mantiene accionable la lista de issues.

## Parte 3 — Las pull requests

Una pull request propone fusionar una rama (head) en otra (base), muestra el diff, lanza las comprobaciones y reúne la revisión.

### Abrir y revisar

- Abre pronto como **borrador** para recibir opinión sobre la dirección; márcala lista cuando lo esté.
- Mantenla **pequeña y concreta**: unos cientos de líneas reciben una revisión real; miles, una ojeada. Separa las refactorizaciones y el reformateo de los cambios de comportamiento.
- Describe el **porqué** y **cómo probarla**, y enlaza la issue.

Una revisión es Comment, Approve o Request changes. Los revisores pueden escribir **cambios sugeridos** que el autor confirma con un clic. Un autor no puede aprobar su propia pull request.

### Los tres métodos de fusión

| Método | Resultado en la rama base | Bueno para |
|---|---|---|
| Create a merge commit | Cada commit de la rama, más un commit de fusión | Conservar el historial exacto de la rama |
| Squash and merge | Un commit por pull request | Un historial limpio en el que cada commit es un cambio revisado |
| Rebase and merge | Cada commit reaplicado, sin commit de fusión | Un historial lineal con los commits individuales |

La fusión squash facilita los reverts y los backports (un commit por cambio) y ayuda a `git bisect`, porque cada commit de `main` pasó las comprobaciones.

### CODEOWNERS

Un archivo `CODEOWNERS` (en `.github/`, en la raíz o en `docs/`) asocia rutas a dueños:

```text
*            @acme/maintainers
*.js         @acme/web
/api/        @acme/backend
/docs/       @acme/writers @lea
```

A los dueños se les pide revisión automáticamente; con la revisión de code owners de la protección de rama, se exige la aprobación de un dueño por cada ruta tocada. Para cada archivo solo cuenta la **última línea que coincide**: `/api/server.js` arriba pertenece solo a `@acme/backend`. Pon primero los patrones generales y después los concretos. Los dueños necesitan acceso de escritura; el archivo no da ninguno.

### Conflictos, reverts y backports

Un conflicto significa que ambas ramas cambiaron las mismas líneas; fusiona la base en tu rama o haz rebase sobre ella, resuelve y sube. Para deshacer una pull request fusionada, usa el botón **Revert**: abre una pull request nueva con un commit que la deshace, revisada como cualquier cambio. Para llevar una corrección a una rama de versión mantenida, haz cherry-pick en una rama que parta de esa versión y abre una pull request de backport.

### Merge queues, auto-merge y pilas

- Una **merge queue** prueba cada pull request junto con las que tiene delante sobre la base más reciente, y solo fusiona lo que pasa. Los workflows exigidos también deben correr `on: merge_group`.
- El **auto-merge** fusiona en cuanto se cumplen todos los requisitos.
- Las **pull requests apiladas** dividen un cambio grande en una cadena, cada una con base en la rama anterior, para revisar cada paso por separado.

**Para recordar.** Pull requests pequeñas con un porqué claro; squash para un historial de cambios revisados; gana la última línea de `CODEOWNERS` que coincide; revierte mediante una pull request, nunca reescribiendo `main`.

## Parte 4 — Organizaciones y método

### Cuentas, organizaciones y roles

Cada uno conserva su cuenta personal y se une a **organizaciones**, que son dueñas de los repositorios, así que nada se pierde cuando alguien se va. El acceso a un repositorio viene de cinco roles:

| Rol | Añade |
|---|---|
| Read | Ver, clonar, abrir issues, comentar |
| Triage | Gestionar issues y pull requests: etiquetas, asignados, cierre |
| Write | Subir, fusionar pull requests |
| Maintain | Gestionar los ajustes del repositorio, salvo los destructivos |
| Admin | Todo, incluidos accesos, borrado y ajustes de seguridad |

Da acceso por **equipos** (`@acme/backend`), no persona a persona: la pertenencia gobierna entonces todos los repositorios a la vez. Los equipos hijos heredan los accesos de su padre. El **permiso base** de la organización se aplica a cada miembro en cada repositorio; los colaboradores externos solo ven los repositorios a los que se les añadió. Las empresas añaden SSO SAML, aprovisionamiento SCIM, roles de repositorio personalizados y un registro de auditoría.

### Modelos de ramas

| Modelo | Forma | Encaja con |
|---|---|---|
| GitHub flow | `main` más ramas cortas de funcionalidad, fusionadas tras revisión y luego desplegadas | Servicios web desplegados continuamente |
| Trunk-based development | Ramas muy cortas fusionadas al menos a diario, con el trabajo a medias tras feature flags | Equipos que practican el despliegue continuo |
| Git flow | `develop`, ramas de release y de hotfix junto a `main` | Software entregado por versiones, con versiones mantenidas |

Los release trains combinan el trabajo en tronco con un calendario fijo: se corta una rama de release en la fecha, y lo que no está listo espera al tren siguiente.

### Versiones y mensajes de commit

El **versionado semántico** se lee MAYOR.MENOR.PARCHE: un cambio incompatible sube la mayor, una función compatible la menor y una corrección compatible el parche; tras `2.3.1`, una función nueva da `2.4.0`. Los **Conventional Commits** se escriben `type(scope): description`, como `fix(parser): handle empty input` o `feat!: drop Node 18`, para que las herramientas deduzcan la versión siguiente y el changelog.

### Una cultura de revisión sana

- Revisar es parte del trabajo: acordad una primera respuesta en el día laborable.
- Pide revisión a un equipo en vez de a una persona; `CODEOWNERS` reparte la carga.
- Comenta el código, no a la persona; separa lo imprescindible de las sugerencias.
- **Inner source**: deja que cualquier equipo lea los repositorios de otro y proponga cambios, con buenos README y guías de contribución.

**Para recordar.** Las organizaciones son dueñas del código, los equipos llevan los accesos y los roles siguen el mínimo privilegio; elige un modelo de ramas que encaje con tu forma de entregar; versiona y describe los cambios para que máquinas y personas los lean.

## Parte 5 — Protección de ramas y rulesets

Las reglas convierten los buenos hábitos en garantías en las ramas que importan.

### Qué exigir en `main`

- **Una pull request antes de fusionar**, con al menos una aprobación, y revisión de code owners donde los haya.
- **Descartar las aprobaciones caducadas** cuando se suben commits nuevos, y exigir la aprobación del último push, para que nadie fusione código sin revisar.
- **Comprobaciones de estado exigidas**: comprobaciones con nombre (por ejemplo `test`) deben pasar. Exigir que la rama esté **al día** hace que las comprobaciones corran sobre lo que producirá la fusión; una merge queue da la misma garantía sin actualizaciones manuales.
- **Historial lineal** (solo fusiones squash o rebase), **commits firmados**, **resolución de conversaciones**.
- **Ni force-push ni borrado.**

### Los rulesets

Los rulesets son la forma reciente de las reglas. Frente a la protección de rama clásica:

- Varios rulesets pueden apuntar a la misma rama, y se **agregan**: para una regla presente en varios, se aplica el ajuste más restrictivo. Un ruleset de organización que exige una aprobación y uno de repositorio que exige dos dan dos.
- Apuntan a ramas, **tags** y, en repositorios privados e internos, **push** (rutas, extensiones, tamaños de archivo), en muchos repositorios a la vez.
- Una **lista de omisión** nombra los roles, equipos o apps autorizados a saltárselos; mantenla corta y prefiere apps.
- El **modo evaluación** (en los planes Enterprise) informa de lo que se bloquearía antes de imponerlo.
- Cualquiera con acceso de lectura ve qué reglas se aplican.

Un ruleset de tags sobre `v*` que solo una app de release puede omitir garantiza que los tags de versión vienen del pipeline de release.

### Comprobaciones de fiar

Una comprobación exigida se reconoce por su nombre, así que fija su **origen esperado** (por ejemplo GitHub Actions), o una imitación de otra app u otro workflow podría satisfacerla. Los workflows exigidos de los rulesets van más allá: un workflow central que cada repositorio debe pasar y no puede editar.

### Los entornos como controles

Los despliegues usan **entornos** con sus propias reglas: revisores exigidos, temporizadores, ramas o tags permitidos, y reglas de protección de despliegue personalizadas en las que una app externa aprueba o rechaza el job (por ejemplo, no desplegar durante un incidente).

**Para recordar.** Exige en `main` pull requests revisadas, comprobadas y al día; prefiere los rulesets, que se superponen y en los que gana el ajuste más estricto; mantén mínimas las listas de omisión; fija el origen de las comprobaciones exigidas.

## Parte 6 — Actions

GitHub Actions ejecuta workflows: archivos YAML en `.github/workflows/`, disparados por eventos.

### Anatomía de un workflow

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: ${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test
```

- Los **eventos** (`on:`) lanzan ejecuciones: `push`, `pull_request`, `schedule`, `workflow_dispatch` (manual, con entradas), `release`, `merge_group` y muchos más.
- Los **jobs** corren en runners distintos y nuevos, en paralelo salvo que `needs:` los ordene.
- Los **pasos** corren en orden dentro de un job y comparten su espacio de trabajo; `uses:` ejecuta una acción y `run:` órdenes de shell.
- Una **matriz** ejecuta el job una vez por combinación: dos versiones de Node por dos sistemas son cuatro jobs.

### Pasar datos y ahorrar tiempo

- Los **artefactos** (`actions/upload-artifact`) guardan archivos de una ejecución para descargarlos o para jobs posteriores.
- Las **cachés** (`actions/cache`, o la opción `cache:` de las acciones de setup) restauran las dependencias según una clave como el hash del lockfile; si no hay caché tiene que funcionar igual.
- Las **salidas**: un paso añade `name=value` al archivo que indica `GITHUB_OUTPUT`; los pasos siguientes leen `steps.<id>.outputs.name`, y los demás jobs leen las salidas del job mediante `needs`.
- Las **programaciones** usan la sintaxis cron en UTC, se ejecutan desde la rama por defecto y pueden arrancar tarde en horas de mucha carga.

### Las condiciones

Un paso sin `if:` solo se ejecuta si todo lo anterior tuvo éxito. Las funciones de estado cambian eso:

| Condición | Se ejecuta cuando |
|---|---|
| `success()` (implícita) | Todos los pasos anteriores tuvieron éxito |
| `failure()` | Un paso anterior falló |
| `always()` | Siempre, incluso tras una cancelación |
| `!cancelled()` | Tras éxito o fallo, pero no tras una cancelación |

### Reutilización y control

- Los **workflows reutilizables** (`on: workflow_call`) se llaman como jobs completos, con entradas y secretos; las **acciones compuestas** agrupan pasos usados dentro de un job.
- Los **grupos de concurrencia** corren de uno en uno; una ejecución pendiente más nueva sustituye a una más antigua, y `cancel-in-progress` cancela también la que está en marcha (bueno para pull requests, arriesgado para despliegues).
- Las **matrices dinámicas**: un primer job emite un array JSON, que lee con `fromJSON` la matriz del job siguiente.
- Los **runners autoalojados** van bien para hardware especial o redes privadas, pero hay que mantenerlos limpios y nunca deben atender repositorios públicos.

### Trampas que conviene conocer

- Los eventos causados por el `GITHUB_TOKEN` (un push, un tag) no lanzan ejecuciones nuevas, para evitar bucles; usa un token de GitHub App cuando un workflow deba disparar otro.
- Los workflows programados de los repositorios públicos se desactivan tras 60 días sin actividad.
- Una matriz está limitada a 256 jobs, y una matriz vacía falla.

**Para recordar.** Los workflows son código en el repositorio: los eventos lanzan jobs y los jobs ejecutan pasos en runners nuevos; guarda en caché las entradas y los resultados como artefactos; entiende lo que de verdad significa `if:`; reutiliza con workflows reutilizables y acciones compuestas.

## Parte 7 — Proteger los workflows

Un workflow ejecuta código con credenciales. Trátalo como producción.

### Los secretos y el token

- Guarda las credenciales como **secretos** (de repositorio, de entorno o de organización) y léelas con `secrets.NAME`. Nunca las confirmes; un secreto confirmado hay que revocarlo.
- Los registros enmascaran los valores exactos de los secretos, no los transformados; no imprimas nunca secretos.
- El **`GITHUB_TOKEN`** se crea para cada ejecución, limitado al repositorio, y caduca al terminar el job. Fija sus ámbitos con `permissions:`; en cuanto la clave está presente, cada ámbito no listado vale `none`. Parte de `contents: read` y da más por job.

### Forks, Dependabot y entornos

- Las ejecuciones `pull_request` que vienen de **forks** no tienen secretos y tienen un token de solo lectura; las de contribuidores nuevos pueden requerir aprobación.
- Las ejecuciones disparadas por **Dependabot** se tratan igual y solo ven los secretos de Dependabot.
- Los **entornos** mantienen los secretos de producción fuera de todos los demás jobs: un job que nombra `environment: production` espera a sus revisores exigidos, y solo después recibe los secretos del entorno.

### OIDC en lugar de claves

Un job con `id-token: write` puede pedir a GitHub un token OIDC firmado que describe la ejecución. Workload Identity Federation de Google Cloud (o sus equivalentes en AWS y Azure) confía en ese emisor y cambia el token por credenciales de corta duración. No existe ninguna clave duradera que filtrar. Restringe la condición de confianza al repositorio y al entorno, mediante el claim `sub` del token (por ejemplo `repo:acme/shop:environment:production`), nunca a toda una organización.

### La cadena de suministro del propio workflow

- **Fija las acciones de terceros por SHA de commit completo**, con la versión en un comentario; los tags se pueden mover. En marzo de 2025, los tags de `tj-actions/changed-files` se movieron a un commit que volcaba los secretos en los registros; los workflows fijados por SHA no se vieron afectados. Deja que Dependabot actualice los SHA.
- **La inyección de script**: valores como el título de una issue se pegan en el script antes de ejecutarlo. Pásalos por una variable de entorno:

```yaml
- name: Greet
  env:
    TITLE: ${{ github.event.issue.title }}
  run: echo "New issue: $TITLE"
```

- **`pull_request_target`** se ejecuta con los secretos del repositorio base; nunca descargues ni construyas en él el código de la pull request.
- Las **cachés** creadas en la rama por defecto son visibles para todas las ramas; impide que los jobs poco fiables escriban cachés que restauran los builds de release.
- Las **atestaciones de artefacto** (`actions/attest-build-provenance`) firman dónde y cómo se construyó un archivo; `gh attestation verify` lo comprueba.

**Para recordar.** Token con mínimo privilegio, secretos solo donde hacen falta, OIDC en lugar de claves con una condición de confianza estrecha, acciones fijadas por SHA, el texto no fiable mediante variables de entorno y nada de código no fiable en disparadores privilegiados.

## Parte 8 — La cadena de suministro: Dependabot, code scanning, secret scanning

### Dependabot

- Las **alertas**: el grafo de dependencias (sacado de manifiestos y lockfiles) se compara con la GitHub Advisory Database.
- Las **actualizaciones de seguridad**: pull requests que llevan una dependencia vulnerable a la primera versión corregida.
- Las **actualizaciones de versión**: pull requests que mantienen al día las dependencias, configuradas en `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      minor-and-patch:
        update-types: [minor, patch]
    cooldown:
      default-days: 5
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

Los grupos reúnen actualizaciones relacionadas en una pull request; `ignore` se salta algunas; `cooldown` espera unos días tras una versión antes de proponerla, para que una versión envenenada tenga tiempo de detectarse (las actualizaciones de seguridad no se retrasan). Confirma los lockfiles para que las instalaciones sean reproducibles y las dependencias indirectas visibles.

El auto-merge es razonable para las actualizaciones de parche (y quizá menores), cuando pasan las pruebas exigidas: un workflow lee `dependabot/fetch-metadata` y ejecuta `gh pr merge --auto --squash` para esas. Las versiones mayores merecen a una persona.

### Code scanning y secret scanning

- El **code scanning con CodeQL** encuentra patrones de vulnerabilidad (inyección, recorrido de rutas…). La configuración por defecto no necesita archivo; la avanzada es un workflow para builds y consultas propios. Los resultados aparecen como alertas en las pull requests.
- El **secret scanning** encuentra credenciales en todo el historial y avisa a muchos proveedores; la **push protection** bloquea un push que contiene un secreto reconocido, salvo que quien sube registre un motivo para omitirla.
- La **acción dependency review** muestra las dependencias que añade una pull request y puede fallar por vulnerabilidades conocidas o licencias prohibidas.

Los repositorios públicos tienen estas funciones gratis; los privados de los planes Team y Enterprise compran por separado **GitHub Secret Protection** y **GitHub Code Security**.

### Inventario y divulgación

- El grafo de dependencias exporta una **SBOM** en formato SPDX.
- El **aviso privado de vulnerabilidades** y los **avisos de seguridad del repositorio** permiten a los mantenedores preparar una corrección en privado, pedir un CVE y publicar; Dependabot alerta entonces a cada repositorio dependiente.

### El triaje

La gravedad describe el paquete, no tu uso. Una dependencia de desarrollo vulnerable que nunca se entrega suele suponer menos riesgo, aunque una que corre en la CI con secretos puede importar. Descarta indicando el motivo, para que la decisión quede registrada.

**Para recordar.** Lockfiles, actualizaciones de Dependabot agrupadas y con espera, Actions incluidas, CodeQL y push protection activados, la dependency review como comprobación exigida, y una divulgación privada y coordinada.

## Ejercicios

1. Haz fork de un proyecto público, añade `upstream` y crea una rama desde `upstream/main`. ¿A qué remoto subes?
2. Escribe un formulario de issue con un campo Steps to reproduce obligatorio y un campo Version. ¿Dónde va el archivo?
3. `CODEOWNERS` tiene `*.ts @acme/web` y, más abajo, `/server/ @acme/api`. ¿Quién es dueño de `/server/app.ts`, y cómo serían dueños los dos equipos?
4. Tu equipo entrega un servicio web varias veces al día. ¿Qué modelo de ramas y qué método de fusión encajan, y por qué?
5. Un ruleset de organización exige una aprobación y uno de repositorio exige dos, una de ellas de un code owner. ¿Qué se aplica a una pull request en `main`?
6. Escribe un workflow que pruebe en Node 20 y 22 en las pull requests y en los push a `main`, con permisos de solo lectura y caché de npm.
7. Un job de despliegue usa una clave JSON de cuenta de servicio guardada como secreto. Describe el paso a OIDC y la condición de confianza que fijarías.
8. Escribe un `dependabot.yml` que actualice npm y GitHub Actions cada semana, agrupe las actualizaciones menores y de parche y espere cinco días tras las versiones.

### Respuestas

1. A `origin`, tu fork; la pull request va luego de la rama de tu fork al `main` de upstream.
2. En `.github/ISSUE_TEMPLATE/`, como archivo `.yml` con campos `body` y `validations: required: true` en los pasos.
3. `@acme/api`: gana la última línea que coincide. Pon los dos en una línea: `/server/ @acme/api @acme/web`.
4. GitHub flow o trunk-based development con fusiones squash: ramas cortas, un commit revisado por cambio en `main`, reverts fáciles.
5. Dos aprobaciones, una de un code owner: los rulesets se agregan y se aplica el ajuste más estricto de cada regla.
6. Ver el workflow de la parte 6: `on: pull_request` y `push` en `main`, `permissions: contents: read`, una matriz sobre `node`, `cache: npm`.
7. Borra la clave; da `id-token: write` al job; crea un pool y un proveedor de identidad de carga de trabajo que confíen en el emisor de GitHub; permite solo que `sub` igual a `repo:<owner>/<repo>:environment:production` suplante a la cuenta de servicio de despliegue; usa la acción de autenticación con el proveedor en vez de la clave.
8. Ver el archivo de la parte 8, con `interval: weekly`, un grupo `update-types: [minor, patch]` y `cooldown: default-days: 5`.

## Fuentes

Páginas de referencia de cada parte. Las funciones y los planes cambian: comprueba la página antes de fiarte de un detalle.

| Parte | Páginas |
|---|---|
| 1 | [About Git](https://docs.github.com/en/get-started/using-git/about-git) · [Git LFS](https://git-lfs.com/) · [git filter-repo](https://github.com/newren/git-filter-repo) |
| 2 | [About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects) · [Transferir una issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/transferring-an-issue-to-another-repository) |
| 3 | [About pull request merges](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges) · [About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) |
| 4 | [Repository roles for an organization](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization) · [Semantic Versioning](https://semver.org/) · [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) |
| 5 | [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) · [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) |
| 6 | [Documentación de GitHub Actions](https://docs.github.com/en/actions) |
| 7 | [Preventing pwn requests](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/) · [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) |
| 8 | [Opciones de Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file) · [SLSA](https://slsa.dev/) |
