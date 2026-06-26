# Documentacion completa del sistema - Roatan Self Storage

Fecha de referencia: 2026-05-26

## 1. Resumen ejecutivo

Roatan Self Storage es un sistema de facturacion fiscal e integracion operativa para conectar Storeganise, pagos BAC, control de CAI/correlativos, generacion de facturas, envio de correos, alertas y reportes administrativos.

La regla principal del negocio es:

1. Storeganise genera la factura origen.
2. El backend recibe el webhook de Storeganise.
3. El sistema guarda el evento y la factura origen.
4. El cliente completa o actualiza sus datos fiscales.
5. El backend crea el pago en BAC.
6. BAC confirma el pago por webhook.
7. Solo si BAC aprueba el pago, el sistema consume un correlativo CAI.
8. Se genera la factura fiscal hondurena.
9. Se genera el PDF.
10. Se envia la factura por correo.
11. Se sincroniza el estado hacia Storeganise.
12. El dashboard muestra estado, alertas, pagos, facturas, reportes y salud del sistema.

Actualmente el proyecto tiene dos grandes partes:

- Frontend: aplicacion Next.js con dashboard administrativo.
- Backend: API FastAPI con servicios, rutas y repositorios en memoria para desarrollo.

## 2. Estado actual del sistema

El sistema ya tiene implementada la estructura principal de frontend y backend. El backend contiene los modulos de negocio y las rutas API necesarias para el flujo completo, pero la persistencia todavia es en memoria. El frontend ya muestra un panel administrativo completo, pero trabaja con datos simulados en `src/lib/dashboard-data.ts` y aun no consume directamente la API del backend.

Estado por area:

| Area | Estado actual |
| --- | --- |
| Dashboard Next.js | Implementado con pantallas administrativas y datos simulados |
| API FastAPI | Implementada por dominios |
| Storeganise webhooks | Implementado con validacion HMAC y procesamiento en background |
| BAC pagos | Implementado con adaptador simulado y webhook |
| CAI/correlativos | Implementado con validaciones, activacion, consumo y alertas |
| Facturas fiscales | Implementado desde pago BAC aprobado |
| PDF | Implementado como servicio simulado/de referencia |
| Correos | Implementado como servicio simulado con logs |
| Alertas | Implementado |
| Reportes | Implementado con exportacion basica |
| Base de datos real | Pendiente; repositorios actuales son en memoria |
| Migraciones | Pendiente |
| Integracion frontend-backend real | Pendiente |
| Autenticacion real | Pendiente |
| Integracion BAC real | Pendiente |
| Integracion Storeganise API real para actualizaciones | Parcial/simulada |

## 3. Tecnologias principales

### Frontend

- Next.js 16.2.4
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- ESLint

Scripts disponibles:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Backend

- FastAPI
- Pydantic / pydantic-settings
- Uvicorn
- Python
- Repositorios en memoria para desarrollo
- Preparado para PostgreSQL/Neon con SQLAlchemy en una siguiente fase

Inicio local del backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 4. Estructura general del proyecto

```text
roatanselfstorage/
  src/
    app/
      dashboard/
      login/
      page.tsx
      layout.tsx
      globals.css
    components/
    lib/
  backend/
    app/
      api/routes/
      core/
      db/repositories/
      models/
      schemas/
      services/
      templates/
      utils/
      workers/
      main.py
    requirements.txt
    Dockerfile
  public/
  package.json
  README.md
  DOCUMENTACION_SISTEMA.md
```

## 5. Arquitectura funcional

El sistema sigue una arquitectura por capas:

1. Rutas API: reciben HTTP requests y webhooks.
2. Schemas: validan payloads de entrada y salida.
3. Servicios: contienen la logica de negocio.
4. Repositorios: administran la persistencia.
5. Modelos: representan entidades del dominio.
6. Utils: formateo, fechas, dinero, validaciones e IDs.
7. Workers: tareas periodicas o de reintento.
8. Frontend: dashboard operativo para usuarios administrativos.

Flujo resumido:

```text
Storeganise -> Webhook FastAPI -> StoreganiseService
                                -> StoreganiseInvoice
                                -> FiscalDataService
                                -> PaymentService
                                -> BacService
BAC webhook -> PaymentService -> InvoiceService
                              -> CaiService
                              -> PdfService
                              -> EmailService
                              -> StoreganiseService/SyncService
                              -> Dashboard/Reportes/Alertas
```

## 6. Backend

El backend se inicializa en `backend/app/main.py`.

Configura:

- Aplicacion FastAPI con nombre `Roatan Self Storage Integrator`.
- CORS basado en `dashboard_origin`.
- Manejo global de errores de negocio.
- Manejo de eventos duplicados.
- Manejo de errores de proveedores externos.
- Registro de routers por modulo.

Routers incluidos:

- `/health`
- `/webhooks/storeganise`
- `/webhooks/bac`
- `/payments`
- `/invoices`
- `/customers`
- `/fiscal-data`
- `/cai`
- `/reports`
- `/alerts`
- `/email-logs`
- `/storeganise`

### 6.1 Configuracion

Archivo: `backend/app/core/config.py`

Variables principales:

| Variable | Uso |
| --- | --- |
| `app_name` | Nombre de la API |
| `environment` | Ambiente actual |
| `database_url` | URL futura de PostgreSQL/Neon |
| `dashboard_origin` | Origen permitido para CORS |
| `storeganise_webhook_secret` | Secreto HMAC de Storeganise |
| `bac_webhook_secret` | Secreto para webhooks BAC |
| `storeganise_api_base_url` | URL base de Storeganise |
| `storeganise_api_token` | Token de API Storeganise |
| `bac_simulator_base_url` | URL base del simulador BAC |
| `company_email_from` | Correo emisor |
| `alert_recipients` | Correos que reciben alertas |

### 6.2 Entidades del dominio

#### StoreganiseInvoice

Representa la factura origen que llega desde Storeganise.

Campos importantes:

- `storeganise_invoice_id`
- `storeganise_user_id`
- `customer_id`
- `amount`
- `currency`
- `status`
- `internal_status`
- `raw_payload`
- `created_at`
- `updated_at`

Estados internos:

- `STOREGANISE_RECEIVED`
- `WAITING_FISCAL_DATA`
- `FISCAL_DATA_COMPLETED`
- `READY_FOR_PAYMENT`
- `PAYMENT_CREATED`
- `WAITING_BAC_CONFIRMATION`
- `BAC_APPROVED`
- `BAC_REJECTED`
- `BAC_FAILED`
- `INVOICE_GENERATED`
- `EMAIL_SENT`
- `STOREGANISE_UPDATED`
- `COMPLETED`
- `FAILED`

#### Customer

Representa el cliente y sus datos fiscales.

Campos importantes:

- `storeganise_user_id`
- `customer_type`
- `email`
- `first_name`
- `last_name`
- `company_name`
- `legal_name`
- `rtn`
- `phone`
- `address`
- `city`
- `fiscal_status`

#### Payment

Representa un pago gestionado por BAC.

Campos importantes:

- `payment_id`
- `storeganise_invoice_id`
- `customer_id`
- `amount`
- `currency`
- `status`
- `provider`
- `payment_url`
- `bac_transaction_id`
- `bac_reference`
- `invoice_id`
- `paid_at`
- `error_message`
- `raw_bac_response`

Estados:

- `PAYMENT_CREATED`
- `WAITING_BAC_CONFIRMATION`
- `APPROVED`
- `REJECTED`
- `FAILED`
- `CANCELLED`
- `REFUNDED`
- `DUPLICATE_BLOCKED`
- `COMPLETED`

#### Invoice

Representa la factura fiscal emitida.

Campos importantes:

- `invoice_number`
- `storeganise_invoice_id`
- `payment_id`
- `customer_id`
- `cai_id`
- `cai`
- `correlative`
- `subtotal`
- `isv`
- `total`
- `pdf_url`
- `email_status`
- `status`
- `issued_at`

#### CaiRange

Representa un rango CAI/correlativo.

Estados:

- `ACTIVE`
- `INACTIVE`
- `EXPIRED`
- `EXHAUSTED`
- `BLOCKED`

#### Alert

Representa una alerta operativa.

Niveles:

- `INFO`
- `WARNING`
- `CRITICAL`

Estados:

- `PENDING`
- `IN_REVIEW`
- `RESOLVED`
- `IGNORED`

#### WebhookEvent

Representa un evento recibido desde un proveedor externo.

Usos:

- Guardar payload crudo.
- Evitar duplicados.
- Procesar eventos por tipo.
- Registrar errores.

### 6.3 Servicios backend

#### StoreganiseService

Responsable de recibir, registrar y procesar eventos de Storeganise.

Eventos soportados:

- `unitRental.invoice.created`
- `invoice.updated`
- `invoice.state.updated`
- `invoice.payments.updated`
- `user.created`
- `user.updated`
- `user.billing.updated`
- `addon.dailyEvent.started`

Funciones principales:

- Registra webhooks.
- Evita duplicados por `event_id`.
- Procesa eventos soportados.
- Ignora eventos no soportados.
- Crea facturas origen.
- Actualiza facturas origen.
- Crea o actualiza clientes.
- Detecta casos donde Storeganise marca una factura como pagada sin BAC aprobado.
- Genera alertas de eventos relevantes.
- Simula sincronizacion posterior al pago.

#### PaymentService

Responsable del ciclo de pagos BAC.

Funciones principales:

- Crear pago interno.
- Solicitar pago al adaptador BAC.
- Guardar URL de pago, transaccion y referencia BAC.
- Procesar confirmacion BAC por webhook.
- Validar webhook BAC.
- Bloquear pagos duplicados.
- Validar que el monto BAC coincida con el monto interno.
- Marcar pagos aprobados, rechazados o fallidos.
- Generar factura fiscal cuando BAC aprueba.
- Marcar pagos en revision manual.

Regla critica:

El sistema no genera factura fiscal si BAC no aprobo el pago.

#### BacService

Adaptador para BAC.

Estado actual:

- Implementacion simulada.
- Genera `payment_url`, `bac_transaction_id` y `bac_reference`.
- Valida que el webhook traiga `payment_id`, `bac_transaction_id`, `bac_reference` y monto positivo.
- Tiene metodos de consulta de estado y reembolso simulados.

Pendiente:

- Sustituir simulador por API real de BAC.
- Implementar firma real de BAC si el proveedor define el esquema exacto.
- Manejar reintentos, timeouts y reconciliacion real.

#### InvoiceService

Responsable de emitir facturas fiscales.

Funciones principales:

- Generar factura desde un pago aprobado.
- Validar que el pago este aprobado o completado.
- Evitar doble facturacion del mismo pago.
- Consumir el siguiente correlativo CAI.
- Separar subtotal, ISV y total.
- Formatear numero fiscal.
- Generar PDF.
- Guardar factura.
- Asociar factura al pago.
- Marcar pago como completado.
- Enviar factura por correo si existe correo.
- Registrar auditoria.

#### CaiService

Responsable del control fiscal de CAI y correlativos.

Funciones principales:

- Registrar rangos CAI.
- Validar que solo exista un CAI activo por tipo de documento, sucursal y punto de emision.
- Activar un CAI y desactivar otros del mismo grupo.
- Desactivar CAI.
- Calcular correlativos disponibles y usados.
- Validar que exista CAI activo.
- Bloquear emision si el CAI esta vencido.
- Bloquear emision si el rango esta agotado.
- Consumir el siguiente correlativo con bloqueo en memoria.
- Generar alertas cuando quedan 100, 50 o 25 correlativos.
- Monitorear vencimientos a 30, 15 y 7 dias.

Nota tecnica:

El servicio usa `RLock` en memoria para evitar colisiones durante desarrollo. En produccion debe reemplazarse por bloqueo transaccional a nivel de base de datos.

#### EmailService

Responsable del envio de facturas por correo.

Estado actual:

- Simula envio exitoso.
- Crea logs de correo.
- Marca factura como `SENT`.
- Permite reintentar logs fallidos.
- Genera alertas si falla el envio.

Pendiente:

- Conectar proveedor real de correo.
- Manejar plantillas definitivas.
- Registrar respuesta real del proveedor.

#### PdfService

Responsable de generar el PDF de la factura.

Estado actual:

- Genera una referencia/URL de PDF.
- Usa plantillas HTML bajo `backend/app/templates`.

Pendiente:

- Render real a PDF.
- Almacenamiento del archivo.
- Descarga segura desde endpoint.

#### FiscalDataService

Responsable de guardar datos fiscales del cliente asociados a la factura origen.

Uso previsto:

- Completar RTN, razon social, direccion y datos de facturacion.
- Cambiar la factura origen de `WAITING_FISCAL_DATA` a estados posteriores.

#### AlertService

Responsable de alertas operativas.

Funciones principales:

- Crear alertas.
- Listar por nivel o estado.
- Marcar en revision.
- Resolver.
- Crear alertas especializadas para CAI proximo a vencer.
- Crear alertas por pago fallido.

#### ReportService

Responsable de reportes.

Reportes disponibles:

- Facturas para contador.
- Pagos.
- CAI/correlativos.
- Errores/alertas.
- Exportacion basica por tipo y formato.

#### AuditService

Responsable de auditoria.

Registra:

- Accion.
- Modulo.
- Entidad.
- Valor anterior.
- Valor nuevo.
- Usuario.

#### SyncService

Responsable de sincronizacion posterior al pago.

Estado actual:

- Envuelve la sincronizacion con Storeganise.
- Devuelve estado simulado `SYNCED`.

Pendiente:

- Actualizar Storeganise por API real.
- Guardar resultado de sincronizacion.
- Reintentar fallos.

### 6.4 Endpoints principales

#### Salud

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/health` | Revisa estado basico de la API |

#### Webhooks Storeganise

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | `/webhooks/storeganise` | Recibe eventos Storeganise con firma `sg-signature` |

Comportamiento:

- Lee el body crudo.
- Valida firma HMAC SHA-256.
- Registra el evento.
- Procesa el evento en background.
- Responde `ACCEPTED`.

#### Webhooks BAC

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | `/webhooks/bac` | Recibe confirmacion BAC |
| POST | `/webhooks/bac/simulate` | Simula confirmacion BAC en desarrollo |

Comportamiento:

- Valida payload BAC.
- Busca el pago por `payment_id`.
- Valida duplicados.
- Valida monto.
- Si el pago es aprobado, genera factura fiscal.

#### Pagos

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | `/payments` | Crea pago BAC |
| GET | `/payments` | Lista pagos |
| GET | `/payments/{payment_id}` | Detalle de pago |
| POST | `/payments/{payment_id}/retry` | Reintento de validacion |
| POST | `/payments/{payment_id}/review` | Marca pago en revision |

#### Facturas

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/invoices` | Lista facturas |
| GET | `/invoices/{invoice_id}` | Detalle de factura |
| GET | `/invoices/{invoice_id}/pdf` | Obtiene referencia al PDF |
| POST | `/invoices/{invoice_id}/resend` | Reenvia correo de factura |
| GET | `/invoices/exports/accountant` | Exportacion para contador |

Nota:

La ruta `/invoices` acepta filtros declarados (`date_from`, `date_to`, `client`, `rtn`, `cai`, `bac_reference`), pero la implementacion actual devuelve la lista completa. Falta aplicar filtros reales en repositorio o servicio.

#### Clientes

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | `/customers` | Crea cliente |
| GET | `/customers` | Lista clientes |
| PATCH | `/customers/{customer_id}` | Actualiza cliente |

#### Datos fiscales

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | `/fiscal-data/{storeganise_invoice_id}` | Guarda datos fiscales para una factura Storeganise |

#### CAI/correlativos

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | `/cai` | Registra rango CAI |
| GET | `/cai` | Lista rangos con usados/disponibles |
| POST | `/cai/{cai_id}/activate` | Activa rango |
| POST | `/cai/{cai_id}/deactivate` | Desactiva rango |
| POST | `/cai/monitor` | Ejecuta monitoreo de alertas CAI |

#### Reportes

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | `/reports` | Genera reporte por tipo |
| GET | `/reports/export` | Exporta reporte por tipo/formato |

Tipos previstos:

- `payments`
- `cai`
- `errors`
- facturas para contador por defecto

#### Alertas

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/alerts` | Lista alertas |
| POST | `/alerts` | Crea alerta |
| POST | `/alerts/{alert_id}/review` | Marca alerta en revision |
| POST | `/alerts/{alert_id}/resolve` | Resuelve alerta |

#### Storeganise administrativo

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/storeganise/events` | Lista eventos Storeganise |
| GET | `/storeganise/invoices` | Lista facturas origen |
| POST | `/storeganise/sync/{storeganise_invoice_id}` | Sincroniza factura con Storeganise |

#### Logs de correo

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/email-logs` | Lista logs de correo |

## 7. Frontend

El frontend esta en `src/app` y usa App Router de Next.js.

### 7.1 Navegacion principal

El layout del dashboard define estas pantallas:

- Overview
- Facturas
- Pagos BAC
- CAI / Correlativos
- Plantilla de Factura
- Storeganise
- Estado del Sistema
- Reportes
- Alertas

El dashboard tiene:

- Sidebar colapsable en escritorio.
- Selector de seccion en movil.
- Header administrativo.
- Componentes reutilizables para metricas, botones, inputs, badges y encabezados.

### 7.2 Datos actuales

Los datos del dashboard vienen de `src/lib/dashboard-data.ts`.

Contiene datos simulados de:

- Facturas.
- Pagos BAC.
- Rangos CAI.
- Eventos Storeganise.
- Alertas.
- Metricas de overview.

Esto permite visualizar el producto antes de conectar la API real.

### 7.3 Pantallas

#### `/`

Pagina de entrada.

Uso esperado:

- Redirigir o guiar hacia login/dashboard.

#### `/login`

Pantalla de login.

Estado actual:

- Vista frontend.
- Falta autenticacion real.

#### `/dashboard/overview`

Pantalla principal de metricas.

Muestra:

- Facturacion del dia.
- Facturacion mensual.
- Pagos aprobados.
- Pagos pendientes.
- Facturas generadas.
- Facturas enviadas.
- Alertas criticas.
- Estado de Storeganise.
- Validacion de si el sistema puede generar facturas segun CAI.

#### `/dashboard/facturas`

Gestion de facturas.

Funciones actuales:

- Listado de facturas.
- Filtros por cliente, estado y fecha.
- Vista de factura imprimible.
- Simulacion de descarga.
- Simulacion de reenvio por correo.

#### `/dashboard/pagos-bac`

Gestion de pagos BAC.

Funciones actuales:

- Tabla de pagos.
- Filtros por texto, estado, fecha y factura.
- Metricas de pagos aprobados, pendientes y montos.
- Detalle de pago.
- Reintento simulado.
- Validaciones criticas visuales.

#### `/dashboard/cai-correlativos`

Gestion de CAI y correlativos.

Funciones actuales:

- Ver rangos CAI.
- Calcular usados, disponibles y porcentaje consumido.
- Agregar rangos desde formulario.
- Activar, inactivar, bloquear o cambiar estados.
- Mostrar alertas por vencimiento o agotamiento.
- Ver historial simulado de rangos.

#### `/dashboard/plantilla-factura`

Configuracion visual de factura.

Funciones actuales:

- Editar datos visibles de plantilla.
- Subir logo local.
- Vista previa con items de ejemplo.
- Guardado simulado.

#### `/dashboard/storeganise`

Monitoreo de eventos Storeganise.

Funciones actuales:

- Ver logs de eventos.
- Filtrar por cliente, factura, evento, estado y fecha.
- Ver detalle de evento.
- Reintentar evento.
- Marcar eventos para revision.

#### `/dashboard/estado-sistema`

Estado operativo del sistema.

Funciones actuales:

- Calcula salud de servicios con base en datos simulados.
- Muestra servicios operativos, degradados o criticos.
- Muestra cola de trabajos.
- Permite simular acciones sobre la cola.
- Resume ultimos webhooks y facturas.

Servicios monitoreados visualmente:

- BAC.
- Storeganise.
- Correos.
- PDF.
- CAI/correlativos.

#### `/dashboard/reportes`

Reportes administrativos y contables.

Funciones actuales:

- Tabs de resumen, facturas, pagos BAC, CAI/correlativos, correos y errores.
- Filtros por fecha, cliente, RTN, estado de factura, estado de pago, CAI y correo.
- Exportacion CSV.
- Exportacion Excel basica.
- Impresion/PDF por `window.print`.

#### `/dashboard/alertas`

Centro de alertas.

Funciones actuales:

- Consolida alertas de CAI, BAC, facturas, correos, Storeganise y PDF.
- Filtros por nivel, estado, modulo, fecha y busqueda.
- Cambio de estado a revision o resuelta.
- Reintento simulado.
- Detalle de alerta.

## 8. Flujo completo de negocio

### 8.1 Creacion de factura origen

1. Storeganise emite evento `unitRental.invoice.created`.
2. El backend recibe `POST /webhooks/storeganise`.
3. Se valida la firma.
4. Se crea un `WebhookEvent`.
5. Se crea un `StoreganiseInvoice`.
6. La factura queda en estado `WAITING_FISCAL_DATA`.

### 8.2 Datos fiscales del cliente

1. El sistema recibe o actualiza datos fiscales.
2. Se crea o actualiza `Customer`.
3. Si el RTN y datos requeridos estan completos, el cliente queda fiscalmente completo.
4. La factura origen puede avanzar hacia pago.

### 8.3 Creacion de pago BAC

1. Se llama `POST /payments`.
2. `PaymentService` crea un pago interno.
3. `BacService` genera datos de pago.
4. El pago queda en `WAITING_BAC_CONFIRMATION`.
5. Se guarda URL de pago, referencia BAC y transaccion.

### 8.4 Confirmacion BAC

1. BAC llama `POST /webhooks/bac`.
2. El sistema valida payload.
3. Busca el pago interno.
4. Valida duplicados.
5. Valida que el monto coincida.
6. Si BAC aprueba, marca el pago como `APPROVED`.
7. Si BAC rechaza, marca `REJECTED`.
8. Si hay error, marca `FAILED` y crea alerta.

### 8.5 Generacion de factura fiscal

1. Si el pago esta aprobado, `InvoiceService` genera la factura.
2. `CaiService` valida el CAI activo.
3. Se consume el siguiente correlativo.
4. Se calcula subtotal e ISV.
5. Se genera el numero fiscal.
6. Se crea `Invoice`.
7. Se genera PDF.
8. Se asocia la factura al pago.
9. El pago pasa a `COMPLETED`.

### 8.6 Envio de correo

1. Si existe correo del cliente, `EmailService` envia la factura.
2. Se crea `EmailLog`.
3. La factura queda con `email_status = SENT`.
4. Si falla, se marca `FAILED` y se crea alerta.

### 8.7 Sincronizacion final

1. El sistema sincroniza el resultado con Storeganise.
2. Se actualiza el estado de la factura origen.
3. Se registra auditoria.
4. El dashboard puede mostrar el proceso como completado.

## 9. Reglas de negocio importantes

1. Storeganise es la fuente de la factura origen.
2. BAC es la fuente de verdad para confirmar pago.
3. No se genera factura fiscal si BAC no aprueba el pago.
4. No se debe consumir correlativo CAI antes de pago aprobado.
5. No se permite facturar dos veces el mismo pago.
6. No se permite procesar un pago duplicado ya completado.
7. El monto confirmado por BAC debe coincidir con el monto interno.
8. Solo puede existir un CAI activo por tipo de documento, sucursal y punto de emision.
9. No se emiten facturas si el CAI esta vencido.
10. No se emiten facturas si el rango de correlativos esta agotado.
11. El sistema genera alertas cuando el CAI esta por vencer o quedan pocos correlativos.
12. Los errores de proveedores deben quedar registrados como alertas o auditoria.

## 10. Seguridad

### Implementado

- Validacion HMAC SHA-256 para webhooks Storeganise mediante `sg-signature`.
- Estructura para validacion de webhooks BAC.
- Manejo global de errores.
- CORS configurable.
- Bloqueo de duplicados en pagos/webhooks.

### Pendiente

- Login real.
- Sesiones o JWT.
- Roles y permisos.
- Proteccion de endpoints administrativos.
- Firma BAC real segun especificacion del proveedor.
- Rate limiting.
- Auditoria persistente.
- Secretos reales por ambiente.

## 11. Persistencia y base de datos

Actualmente los repositorios usan `InMemoryDatabase`.

Esto significa:

- Los datos se pierden al reiniciar el backend.
- Es util para desarrollo y pruebas rapidas.
- No es apto para produccion.

La estructura ya esta preparada para migrar a base de datos real:

- Modelos separados.
- Repositorios por entidad.
- Servicios desacoplados.
- `database_url` configurado.
- README del backend menciona Neon PostgreSQL como siguiente paso.

Pendiente recomendado:

1. Agregar SQLAlchemy.
2. Crear modelos ORM.
3. Agregar Alembic para migraciones.
4. Migrar repositorios a consultas reales.
5. Implementar transacciones.
6. Usar bloqueo de fila para consumo de correlativos CAI.
7. Crear indices para webhooks, pagos, facturas y CAI.

## 12. Workers y procesos automaticos

Existen archivos bajo `backend/app/workers`:

- `background_tasks.py`
- `cai_monitor_worker.py`
- `daily_sync_worker.py`
- `email_retry_worker.py`
- `payment_reconciliation_worker.py`

Uso previsto:

- Monitorear CAI proximos a vencer.
- Reintentar correos fallidos.
- Reconciliar pagos pendientes de BAC.
- Ejecutar sincronizaciones diarias.
- Procesar tareas en background.

Estado actual:

- La estructura existe.
- Falta conectar estos workers a un scheduler real, cola de tareas o proceso operativo continuo.

Opciones futuras:

- APScheduler para tareas simples.
- Celery/RQ si se requiere cola robusta.
- Cron externo.
- Worker separado en Docker.

## 13. Reportes

El sistema contempla reportes para administracion y contabilidad:

- Facturas fiscales emitidas.
- Pagos BAC.
- Rango CAI y consumo de correlativos.
- Correos enviados/fallidos.
- Errores y alertas.
- Exportacion para contador.

Frontend:

- CSV.
- Excel basico.
- Impresion/PDF desde navegador.

Backend:

- `/reports`
- `/reports/export`
- `/invoices/exports/accountant`

Pendiente:

- Exportacion real con filtros.
- PDF de reporte en backend.
- Excel real con formato.
- Permisos por rol.

## 14. Alertas y monitoreo

El sistema genera y muestra alertas sobre:

- CAI proximo a vencer.
- Correlativos bajos.
- Correlativos agotados.
- Pago BAC rechazado.
- Pago BAC fallido.
- Monto BAC distinto al monto interno.
- Storeganise marcando pago sin BAC aprobado.
- Fallo de envio de correo.
- Fallo de PDF.
- Error de webhooks o sincronizacion.

Estados de alerta:

- Pendiente.
- En revision.
- Resuelta.
- Ignorada.

Niveles:

- Informativa.
- Advertencia.
- Critica.

## 15. Integraciones externas

### Storeganise

Implementado:

- Recepcion de webhooks.
- Validacion de firma.
- Procesamiento de eventos.
- Registro de factura origen.
- Registro/actualizacion de cliente.
- Sincronizacion simulada.

Pendiente:

- Cliente API real para actualizar facturas/estados.
- Manejo completo de errores de API.
- Reintentos con backoff.
- Registro persistente de intentos.

### BAC

Implementado:

- Creacion de pago simulada.
- Webhook de confirmacion.
- Simulador de webhook.
- Validacion de pago aprobado/rechazado/fallido.
- Proteccion contra duplicados.

Pendiente:

- Integracion con API real.
- Firma/verificacion real.
- Reconciliacion automatica.
- Manejo de contracargos, anulaciones y reembolsos.

### Correo

Implementado:

- Envio simulado.
- Logs.
- Reintento de fallidos.

Pendiente:

- Proveedor real.
- Plantillas finales.
- Adjuntar PDF real.
- Manejo de bounce o rechazo.

### PDF

Implementado:

- Servicio de generacion.
- Plantillas HTML.

Pendiente:

- Render real.
- Almacenamiento.
- Descarga segura.

## 16. Que hace el sistema hoy

Hoy el sistema permite:

- Levantar un dashboard administrativo completo.
- Visualizar facturas, pagos, CAI, Storeganise, alertas, reportes y estado del sistema.
- Simular acciones de gestion desde el frontend.
- Levantar una API FastAPI con rutas separadas por dominio.
- Recibir webhooks Storeganise.
- Registrar facturas origen.
- Crear clientes.
- Crear pagos BAC simulados.
- Procesar confirmaciones BAC.
- Validar montos y duplicados.
- Generar facturas fiscales desde pagos aprobados.
- Consumir correlativos CAI.
- Generar alertas.
- Simular PDF y envio de correo.
- Consultar reportes basicos.

## 17. Que va a hacer el sistema cuando este completo

Cuando se conecten las piezas pendientes, el sistema deberia:

- Operar como intermediario fiscal real entre Storeganise, BAC y la administracion de Roatan Self Storage.
- Recibir automaticamente facturas de Storeganise.
- Solicitar y validar datos fiscales del cliente.
- Crear pagos reales en BAC.
- Confirmar pagos con webhook real del banco.
- Emitir facturas fiscales validas usando CAI/correlativos autorizados.
- Generar PDF oficial de factura.
- Enviar factura al cliente por correo.
- Actualizar Storeganise con el estado final.
- Mantener auditoria completa de cada cambio.
- Reconciliar pagos pendientes automaticamente.
- Reintentar correos fallidos.
- Alertar antes de vencimiento o agotamiento de CAI.
- Exportar reportes contables confiables.
- Proteger operaciones con login, roles y permisos.
- Persistir todo en PostgreSQL/Neon.
- Ejecutar workers periodicos de monitoreo y conciliacion.

## 18. Roadmap recomendado

### Fase 1: Persistencia real

- Implementar PostgreSQL/Neon.
- Agregar SQLAlchemy y Alembic.
- Migrar repositorios en memoria a repositorios SQL.
- Crear migraciones iniciales.
- Asegurar indices unicos para `event_id`, `payment_id`, `bac_transaction_id`, `invoice_number` y correlativos.

### Fase 2: Integracion frontend-backend

- Crear cliente API en frontend.
- Reemplazar `dashboard-data.ts` por llamadas reales.
- Manejar loading, empty states y errores.
- Conectar filtros de facturas, pagos, alertas y reportes.

### Fase 3: Seguridad

- Implementar autenticacion.
- Agregar roles: administrador, contador, operaciones, solo lectura.
- Proteger rutas backend.
- Registrar usuario en auditoria.

### Fase 4: BAC real

- Implementar creacion de pago real.
- Implementar firma/verificacion real.
- Implementar consulta de estado.
- Implementar reconciliacion de pagos pendientes.
- Definir manejo de anulaciones y reembolsos.

### Fase 5: Storeganise real

- Implementar cliente API.
- Actualizar factura origen despues de pago/factura fiscal.
- Guardar errores y reintentos.
- Alinear estados internos con estados de Storeganise.

### Fase 6: PDF y correo reales

- Generar PDF oficial.
- Adjuntar PDF al correo.
- Integrar proveedor de email.
- Implementar plantillas finales.
- Guardar logs persistentes.

### Fase 7: Operacion y monitoreo

- Activar workers.
- Agregar scheduler.
- Agregar observabilidad.
- Agregar logs estructurados.
- Agregar dashboard de fallos reales.

### Fase 8: Calidad

- Tests unitarios de servicios.
- Tests de integracion de rutas.
- Tests de flujo completo Storeganise -> BAC -> factura.
- Tests de concurrencia para CAI.
- Validaciones fiscales mas estrictas.

## 19. Riesgos actuales

1. La base de datos es en memoria, por lo tanto no hay persistencia real.
2. El frontend no consume aun la API real.
3. BAC esta simulado.
4. El envio de correo esta simulado.
5. PDF esta en etapa base/simulada.
6. Falta autenticacion y autorizacion.
7. El consumo de correlativos usa lock en memoria, no bloqueo transaccional de base de datos.
8. Algunos filtros de endpoints estan declarados pero no aplicados.
9. Falta control completo de errores externos y reintentos persistentes.
10. Falta cobertura de pruebas automatizadas.

## 20. Archivos clave

### Frontend

| Archivo | Descripcion |
| --- | --- |
| `src/app/dashboard/layout.tsx` | Layout del panel administrativo |
| `src/lib/dashboard-data.ts` | Datos simulados del dashboard |
| `src/components/ui.tsx` | Componentes UI reutilizables |
| `src/components/status-badge.tsx` | Badges de estado |
| `src/components/page-header.tsx` | Encabezado de paginas |
| `src/app/dashboard/overview/page.tsx` | Resumen ejecutivo |
| `src/app/dashboard/facturas/page.tsx` | Facturas |
| `src/app/dashboard/pagos-bac/page.tsx` | Pagos BAC |
| `src/app/dashboard/cai-correlativos/page.tsx` | CAI/correlativos |
| `src/app/dashboard/storeganise/page.tsx` | Eventos Storeganise |
| `src/app/dashboard/estado-sistema/page.tsx` | Salud del sistema |
| `src/app/dashboard/reportes/page.tsx` | Reportes |
| `src/app/dashboard/alertas/page.tsx` | Alertas |

### Backend

| Archivo | Descripcion |
| --- | --- |
| `backend/app/main.py` | Entrada FastAPI |
| `backend/app/core/config.py` | Configuracion |
| `backend/app/core/constants.py` | Estados y constantes |
| `backend/app/core/security.py` | Validacion de firmas |
| `backend/app/api/routes/` | Rutas HTTP |
| `backend/app/services/storeganise_service.py` | Logica Storeganise |
| `backend/app/services/payment_service.py` | Logica de pagos |
| `backend/app/services/invoice_service.py` | Logica de facturacion |
| `backend/app/services/cai_service.py` | CAI y correlativos |
| `backend/app/services/email_service.py` | Correos |
| `backend/app/services/bac_service.py` | Adaptador BAC |
| `backend/app/services/report_service.py` | Reportes |
| `backend/app/services/alert_service.py` | Alertas |
| `backend/app/db/repositories/` | Repositorios |
| `backend/app/models/` | Modelos de dominio |
| `backend/app/schemas/` | Schemas Pydantic |
| `backend/app/workers/` | Workers previstos |

## 21. Conclusion

Roatan Self Storage ya tiene una base solida para convertirse en un integrador fiscal completo. La logica principal del negocio esta modelada: Storeganise como origen, BAC como confirmacion de pago, CAI como control fiscal, factura como documento final, correo como entrega, alertas/reportes como supervision administrativa.

El siguiente salto importante es pasar de prototipo funcional con datos simulados y memoria local a sistema persistente e integrado: PostgreSQL/Neon, BAC real, Storeganise API real, correos reales, PDF real, autenticacion y conexion frontend-backend.
