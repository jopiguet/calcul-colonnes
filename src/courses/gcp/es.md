# Google Cloud — lo esencial del test

## Cómo usar este curso

Este curso acompaña al test de Google Cloud. Sigue la lista de comprobación de un equipo de plataforma: quién es dueño de qué, quién puede hacer qué, cómo circula el tráfico, dónde se ejecutan las cargas de trabajo y cómo se conservan los datos. Los comandos usan `gcloud`; ejecútelos en Cloud Shell sobre un proyecto de prueba.

| Nivel | Lo que pide |
|---|---|
| Principiante | Proyectos, regiones y zonas, roles, VPC, Compute Engine y Cloud Storage |
| Intermedio | IAM en la práctica, cuentas de servicio, reglas de cortafuegos, Cloud Run, clases de almacenamiento |
| Avanzado | Herencia, suplantación, políticas de organización, balanceo de carga, GKE, Terraform |
| Experto | Políticas de denegación, federación de identidades de carga de trabajo, VPC Service Controls, cortafuegos jerárquicos, diseño de disponibilidad |

## Parte 1 — La jerarquía de recursos

Los recursos están en **proyectos**; los proyectos en **carpetas**, bajo una única **organización** ligada a un dominio. La facturación se vincula proyecto a proyecto. Las políticas fijadas en un nodo las hereda todo lo que está debajo. Las políticas de organización restringen lo que se puede configurar — por ejemplo `constraints/iam.allowedPolicyMemberDomains` limita el uso compartido a su dominio, y `constraints/gcp.resourceLocations` limita las regiones. Una landing zone prepara esta jerarquía, la red compartida, el registro y las salvaguardas antes de que llegue la primera carga de trabajo.

## Parte 2 — IAM

Una vinculación concede un **rol** a un **principal** sobre un **recurso**. Los roles básicos (Owner, Editor, Viewer) son demasiado amplios; los predefinidos como `roles/storage.objectViewer` corresponden a un servicio; los personalizados enumeran permisos exactos. Las políticas de permiso se heredan y se suman: un permiso concedido en la carpeta no se puede quitar en el proyecto. Las políticas de denegación se evalúan antes que las de permiso y prevalecen. Las condiciones restringen un permiso por hora, nombre del recurso o etiqueta.

```bash
gcloud projects add-iam-policy-binding my-project \
  --member="group:data-readers@example.com" \
  --role="roles/bigquery.dataViewer"
```

Conceda a grupos, no a usuarios individuales, y prefiera el rol más estrecho en el nivel más bajo.

## Parte 3 — Las cuentas de servicio

Una cuenta de servicio es una identidad para el código. Asóciela a la carga de trabajo — una VM, un servicio de Cloud Run — y el código obtiene credenciales de corta duración del servidor de metadatos; evite las claves descargables. Un usuario con `roles/iam.serviceAccountTokenCreator` puede **suplantar** una cuenta de servicio para actuar como ella, lo que queda auditado y no necesita clave. Las cargas de trabajo fuera de Google Cloud — GitHub Actions, AWS, un clúster local — usan la **federación de identidades de carga de trabajo** para cambiar sus propios tokens por credenciales de Google.

## Parte 4 — La seguridad

Cloud Audit Logs registra la actividad de administración (siempre activa), el acceso a datos (hay que activarlo) y las denegaciones de políticas. Security Command Center reúne los hallazgos. Secret Manager guarda secretos con versiones e IAM; Cloud KMS gestiona claves de cifrado, incluidas las claves gestionadas por el cliente para almacenamiento y bases de datos. **VPC Service Controls** traza un perímetro alrededor de servicios como Cloud Storage y BigQuery, de modo que los datos no pueden copiarse fuera ni siquiera con credenciales válidas.

## Parte 5 — La red

Una red VPC es global; sus **subredes** son regionales, cada una con un rango de IP. Un `/24` da 256 direcciones, de las que Google reserva 4, así que se pueden usar 252. Las reglas de cortafuegos se aplican a toda la red, seleccionan instancias por etiqueta o por cuenta de servicio y se evalúan por prioridad (el número más bajo primero); las reglas implícitas permiten toda la salida y deniegan toda la entrada. Las políticas de cortafuegos jerárquicas se aplican desde la organización o una carpeta y pueden delegar en las reglas de la VPC con `goto_next`.

Conectividad: el emparejamiento de VPC une dos redes, la VPC compartida permite a proyectos de servicio usar la red de un proyecto host, Cloud VPN e Interconnect llegan a las instalaciones propias, Cloud NAT da salida a las VM privadas. El balanceador de carga de aplicaciones externo global sirve HTTP(S) desde una única IP anycast; los balanceadores de carga de red dejan pasar TCP y UDP.

## Parte 6 — La computación

| Servicio | Cuándo |
|---|---|
| Compute Engine | Control total de una VM, cualquier software |
| Cloud Run | Un contenedor que responde a peticiones y escala a cero |
| GKE | Muchos contenedores, las funciones de Kubernetes, servicios de larga duración |
| Cloud Run functions | Una pequeña función disparada por un evento |

Los grupos de instancias gestionados recrean las VM que fallan y escalan automáticamente. Cloud Run escala según las peticiones simultáneas por instancia; un número mínimo de instancias evita los arranques en frío. GKE Autopilot gestiona los nodos por usted; Standard se los deja a usted.

## Parte 7 — Almacenamiento y protección de datos

Las clases de Cloud Storage cambian precio de almacenamiento por precio de acceso: Standard, Nearline (30 días mínimo), Coldline (90), Archive (365). Las reglas de ciclo de vida mueven o borran objetos según su antigüedad. Use el acceso uniforme a nivel de bucket para que solo IAM controle el acceso, y URL firmadas para compartir temporalmente. El control de versiones de objetos y las políticas de retención protegen contra el borrado; una política de retención bloqueada no puede acortarse. Bases de datos: Cloud SQL para PostgreSQL y MySQL, Spanner para escala global, Firestore para documentos, BigQuery para análisis.

## Parte 8 — La operación

`gcloud config set project`, `gcloud auth login` y `gcloud auth application-default login` preparan las herramientas. Terraform describe la infraestructura como código; guarde su estado en un bucket de Cloud Storage con control de versiones. Cloud Monitoring y Cloud Logging recogen métricas y registros; las políticas de alerta avisan al superar un umbral. La fiabilidad se diseña por región: los recursos zonales caen con su zona, los regionales sobreviven a una zona y los diseños multirregionales a una región. Un SLO con un presupuesto de errores decide cuándo publicar y cuándo corregir.

## Fuentes

| Tema | Referencia gratuita |
|---|---|
| Todos los servicios | [Documentación de Google Cloud](https://cloud.google.com/docs) |
| IAM | [Descripción general de IAM](https://cloud.google.com/iam/docs/overview) |
| La red | [Descripción general de VPC](https://cloud.google.com/vpc/docs/overview) |
| La arquitectura | [Google Cloud Architecture Framework](https://cloud.google.com/architecture/framework) |
| La fiabilidad | [Los libros de SRE de Google](https://sre.google/books/) |
