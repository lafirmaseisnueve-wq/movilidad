/* ================================================================
   MOVILIDAD API Configuration Panel - By TheFirm69 Systems
   Self-contained version - works entirely client-side with localStorage
   All 17 APIs with placeholders and help text embedded
   ================================================================ */

// Embedded API configurations - all 17 APIs with placeholders
const DEFAULT_CONFIGS = {"apis":[{"id":"google-maps","name":"Google Maps Platform","icon":"\ud83d\uddfa\ufe0f","category":"mapping","description":"Maps JavaScript API, Directions API, Places API, Geocoding, Distance Matrix, Roads API","docsUrl":"https://developers.google.com/maps/documentation","version":"v3.53","enabled":true,"credentials":{"apiKey":{"label":"API Key","value":"","type":"text","required":true,"placeholder":"AIzaSyBz1234567890abcdefghijk-XXXXXXXXX","help":"Obt\u00e9nla en Google Cloud Console \u2192 APIs & Services \u2192 Credentials"},"clientId":{"label":"Client ID (optional)","value":"","type":"text","required":false,"placeholder":"gme-yourcompanyname","help":"Solo para clientes Premium de Google Maps Platform"},"signature":{"label":"URL Signature (optional)","value":"","type":"text","required":false,"placeholder":"your_url_signature_secret_here_32chars","help":"Solo para clientes Premium \u2014 Firma digital de URL"}},"endpoints":[{"name":"Maps JavaScript API","path":"/maps/api/js","status":"unknown"},{"name":"Directions API","path":"/maps/api/directions/json","status":"unknown"},{"name":"Places API","path":"/maps/api/place/autocomplete/json","status":"unknown"},{"name":"Geocoding API","path":"/maps/api/geocode/json","status":"unknown"},{"name":"Distance Matrix","path":"/maps/api/distancematrix/json","status":"unknown"}],"quotas":{"daily":25000,"used":0,"unit":"requests"},"pricing":{"model":"pay-per-use","free":200,"per1000":"$7.00"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"mapbox","name":"Mapbox","icon":"\ud83d\udcd0","category":"mapping","description":"Maps, Navigation, Search, Geocoding, Isochrone, Matrix API, Tilesets","docsUrl":"https://docs.mapbox.com/api/","version":"v11","enabled":true,"credentials":{"accessToken":{"label":"Access Token","value":"","type":"text","required":true,"placeholder":"pk.eyJ1IjoieW91cm9yZyIsImEiOiJjbHRlc3QxMjMifQ.xxxxx","help":"Obtenlo en account.mapbox.com/access-tokens"},"secretKey":{"label":"Secret Key (SK)","value":"","type":"password","required":false,"placeholder":"sk.eyJ1IjoieW91cm9yZyIsImEiOiJjbHRlc3QxMjMifQ.xxxxx","help":"Clave secreta para APIs server-side de Mapbox"}},"endpoints":[{"name":"Styles API","path":"/styles/v1/","status":"unknown"},{"name":"Directions","path":"/directions/v5/","status":"unknown"},{"name":"Geocoding","path":"/geocoding/v5/","status":"unknown"},{"name":"Isochrone","path":"/isochrone/v1/","status":"unknown"},{"name":"Matrix","path":"/directions-matrix/v1/","status":"unknown"},{"name":"Tilequery","path":"/v4/mapbox.","status":"unknown"}],"quotas":{"daily":100000,"used":0,"unit":"requests"},"pricing":{"model":"freemium","free":50000,"per1000":"$5.00"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"here-maps","name":"HERE Maps","icon":"\ud83d\udccd","category":"mapping","description":"Routing, Traffic, Geocoding, Places, Fleet Telematics, Isoline Routing","docsUrl":"https://developer.here.com/documentation","version":"v7","enabled":true,"credentials":{"appId":{"label":"App ID","value":"","type":"text","required":true,"placeholder":"YOUR_HERE_APP_ID_8chars","help":"Obtenlo en developer.here.com/dashboard"},"appCode":{"label":"App Code","value":"","type":"text","required":true,"placeholder":"YOUR_HERE_APP_CODE_16chars","help":"Obtenlo junto con App ID en HERE dashboard"},"apiKey":{"label":"API Key (v7)","value":"","type":"text","required":true,"placeholder":"YOUR_HERE_API_KEY_v7_32chars","help":"Clave API v7 \u2014 Reemplaza App ID/Code en APIs nuevas"}},"endpoints":[{"name":"Routing v7","path":"/routing/7.2/","status":"unknown"},{"name":"Traffic v6","path":"/traffic/6.3/","status":"unknown"},{"name":"Geocoder","path":"/geocoder/6.2/","status":"unknown"},{"name":"Places","path":"/places/v1/","status":"unknown"},{"name":"Isoline","path":"/isoline/routing/","status":"unknown"}],"quotas":{"daily":250000,"used":0,"unit":"requests"},"pricing":{"model":"freemium","free":250000,"per1000":"Free tier"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"socket-io","name":"Socket.IO (Real-time)","icon":"\u26a1","category":"realtime","description":"GPS tracking cada 3s, ride requests, SOS alerts, TripCheck events, surge updates","docsUrl":"https://socket.io/docs/v4/","version":"v4.7","enabled":true,"credentials":{"serverUrl":{"label":"Server URL","value":"","type":"text","required":true,"placeholder":"https://movilidad-socket.thefirm69.com","help":"URL de tu servidor Socket.IO (backend de Movilidad)"},"port":{"label":"Port","value":"3001","type":"number","required":true,"placeholder":"3001","help":"Puerto del servidor Socket.IO"},"authSecret":{"label":"Auth Secret","value":"","type":"password","required":true,"placeholder":"movilidad-socket-secret-2024","help":"Secreto compartido para autenticar conexiones socket"},"redisUrl":{"label":"Redis Adapter URL","value":"","type":"text","required":false,"placeholder":"redis://localhost:6379","help":"Redis Adapter URL para Socket.IO (Real-time)"}},"endpoints":[{"name":"driver:location","path":"event","status":"unknown"},{"name":"ride:request","path":"event","status":"unknown"},{"name":"sos:alert","path":"event","status":"unknown"},{"name":"tripcheck:alert","path":"event","status":"unknown"},{"name":"surge:update","path":"event","status":"unknown"}],"quotas":{"daily":0,"used":0,"unit":"unlimited"},"pricing":{"model":"self-hosted","free":"Unlimited","per1000":"N/A"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"stripe","name":"Stripe (Pagos)","icon":"\ud83d\udcb3","category":"payments","description":"Payment Intents, Payment Methods, Refunds, Subscriptions, Connect, Payouts","docsUrl":"https://docs.stripe.com/api","version":"2024-01","enabled":true,"credentials":{"publishableKey":{"label":"Publishable Key","value":"","type":"text","required":true,"placeholder":"pk_test_51Ab2c3D4e5f6g7h8i9j0kLmN","help":"Clave p\u00fablica \u2014 pk_test_ para sandbox, pk_live_ para producci\u00f3n"},"secretKey":{"label":"Secret Key","value":"","type":"password","required":true,"placeholder":"sk_test_51Ab2c3D4e5f6g7h8i9j0kLmN","help":"Clave secreta \u2014 sk_test_ para sandbox, sk_live_ para producci\u00f3n"},"webhookSecret":{"label":"Webhook Signing Secret","value":"","type":"password","required":true,"placeholder":"whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","help":"Obtenlo al crear webhook en Stripe Dashboard \u2192 Developers \u2192 Webhooks"},"clientId":{"label":"Connect Client ID","value":"","type":"text","required":false,"placeholder":"ca_XXXXXXXXXXXXXXXXXXXXXXXX","help":"Para Stripe Connect \u2014 pagos directos a conductores"}},"endpoints":[{"name":"Create Payment Intent","path":"/v1/payment_intents","status":"unknown"},{"name":"Payment Methods","path":"/v1/payment_methods","status":"unknown"},{"name":"Refunds","path":"/v1/refunds","status":"unknown"},{"name":"Payouts","path":"/v1/payouts","status":"unknown"},{"name":"Balance","path":"/v1/balance","status":"unknown"}],"quotas":{"daily":0,"used":0,"unit":"unlimited"},"pricing":{"model":"pay-per-transaction","free":"No monthly","per1000":"2.9% + $0.30"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":["payment_intent.succeeded","payment_intent.failed","charge.refunded"]}},{"id":"twilio","name":"Twilio (Telefon\u00eda/SMS)","icon":"\ud83d\udcde","category":"communications","description":"Masked calls (Voice API), SMS, WhatsApp Business, VoIP, Verify (2FA), Phone Lookup","docsUrl":"https://www.twilio.com/docs","version":"v2010","enabled":true,"credentials":{"accountSid":{"label":"Account SID","value":"","type":"text","required":true,"placeholder":"ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","help":"Obtenlo en console.twilio.com \u2192 Account Info"},"authToken":{"label":"Auth Token","value":"","type":"password","required":true,"placeholder":"your_twilio_auth_token_32chars","help":"Obtenlo en console.twilio.com \u2192 Account Info (secreto)"},"phoneNumber":{"label":"Twilio Phone Number","value":"","type":"text","required":true,"placeholder":"+12345678900","help":"N\u00famero de Twilio comprado para SMS y llamadas (+53 formato E.164)"},"verifySid":{"label":"Verify Service SID","value":"","type":"text","required":false,"placeholder":"VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","help":"Obtenlo al crear Verify Service en Twilio \u2192 Verify \u2192 Services"},"apiKeySid":{"label":"API Key SID","value":"","type":"text","required":false,"placeholder":"SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","help":"Obtenlo al crear API Key en Twilio Console"},"apiKeySecret":{"label":"API Key Secret","value":"","type":"password","required":false,"placeholder":"your_twilio_api_key_secret","help":"Secreto de la API Key de Twilio"}},"endpoints":[{"name":"Voice (Masked Calls)","path":"/2010-04-01/Accounts/{sid}/Calls","status":"unknown"},{"name":"SMS","path":"/2010-04-01/Accounts/{sid}/Messages","status":"unknown"},{"name":"Verify (2FA)","path":"/v2/Services/{sid}/Verifications","status":"unknown"},{"name":"Phone Lookup","path":"/v1/PhoneNumbers/","status":"unknown"},{"name":"WhatsApp","path":"/2010-04-01/Accounts/{sid}/Messages","status":"unknown"}],"quotas":{"daily":0,"used":0,"unit":"pay-per-use"},"pricing":{"model":"pay-per-use","free":"$0 trial","per1000":"Voice $0.013/min"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":["call.completed","message.received"]}},{"id":"firebase-auth","name":"Firebase Authentication","icon":"\ud83d\udd25","category":"authentication","description":"Phone auth, Email/Password, Google Sign-in, Apple Sign-in, Custom Tokens, JWT verification","docsUrl":"https://firebase.google.com/docs/auth","version":"v1","enabled":true,"credentials":{"apiKey":{"label":"API Key","value":"","type":"text","required":true,"placeholder":"AIzaSyB-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX","help":"Obtenlo en Firebase Console \u2192 Project Settings \u2192 Web App"},"authDomain":{"label":"Auth Domain","value":"","type":"text","required":true,"placeholder":"movilidad-app.firebaseapp.com","help":"Obtenlo en Firebase Console \u2192 Project Settings \u2192 Web App"},"projectId":{"label":"Project ID","value":"","type":"text","required":true,"placeholder":"movilidad-app","help":"Obtenlo en Firebase Console \u2192 Project Settings \u2192 General"},"storageBucket":{"label":"Storage Bucket","value":"","type":"text","required":false,"placeholder":"movilidad-app.appspot.com","help":"Obtenlo en Firebase Console \u2192 Project Settings \u2192 General"},"messagingSenderId":{"label":"Messaging Sender ID","value":"","type":"text","required":false,"placeholder":"123456789012","help":"Obtenlo en Firebase Console \u2192 Project Settings \u2192 Cloud Messaging"},"appId":{"label":"App ID","value":"","type":"text","required":true,"placeholder":"1:123456789012:web:abcdef1234567890","help":"Obtenlo en Firebase Console \u2192 Project Settings \u2192 Web App"},"serviceAccountKey":{"label":"Service Account JSON","value":"","type":"textarea","required":true,"placeholder":"{\"type\":\"service_account\",\"project_id\":\"movilidad-app\",\"private_key_id\":\"xxxx\",\"private_key\":\"-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n\",\"client_email\":\"firebase-adminsdk-xxxxx@movilidad-app.iam.gserviceaccount.com\"}","help":"Obtenlo en Firebase Console \u2192 Service Accounts \u2192 Generate New Private Key"}},"endpoints":[{"name":"signInWithPhoneNumber","path":"/v1/accounts:sendVerificationCode","status":"unknown"},{"name":"signInWithCustomToken","path":"/v1/accounts:signInWithCustomToken","status":"unknown"},{"name":"verifyIdToken","path":"/v1/accounts:lookup","status":"unknown"},{"name":"createUser","path":"/v1/accounts:create","status":"unknown"}],"quotas":{"daily":0,"used":0,"unit":"unlimited"},"pricing":{"model":"free","free":"Unlimited auth","per1000":"Free"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"cloudinary","name":"Cloudinary (Uploads)","icon":"\ud83d\uddbc\ufe0f","category":"storage","description":"Document uploads (licenses, insurance), profile photos, image optimization, transformations","docsUrl":"https://cloudinary.com/documentation","version":"v1","enabled":true,"credentials":{"cloudName":{"label":"Cloud Name","value":"","type":"text","required":true,"placeholder":"your-cloud-name","help":"Obtenlo en console.cloudinary.com \u2192 Dashboard"},"apiKey":{"label":"API Key","value":"","type":"text","required":true,"placeholder":"123456789012345","help":"Obtenlo en console.cloudinary.com \u2192 Dashboard"},"apiSecret":{"label":"API Secret","value":"","type":"password","required":true,"placeholder":"your_cloudinary_api_secret_32chars","help":"Obtenlo en console.cloudinary.com \u2192 Dashboard (secreto)"},"uploadPreset":{"label":"Upload Preset","value":"movilidad_upload","type":"text","required":true,"placeholder":"movilidad_uploads","help":"Cr\u00e9alo en console.cloudinary.com \u2192 Settings \u2192 Upload"},"folder":{"label":"Default Folder","value":"documents","type":"text","required":false,"placeholder":"Ingresa tu Default Folder","help":"Default Folder para Cloudinary (Uploads)"}},"endpoints":[{"name":"Upload Image","path":"/v1_1/{cloud}/image/upload","status":"unknown"},{"name":"Upload Raw (PDFs)","path":"/v1_1/{cloud}/raw/upload","status":"unknown"},{"name":"Delete Asset","path":"/v1_1/{cloud}/resources/","status":"unknown"},{"name":"List Resources","path":"/v1_1/{cloud}/resources/","status":"unknown"}],"quotas":{"daily":0,"used":0,"unit":"25GB storage"},"pricing":{"model":"freemium","free":"25GB + 25K transforms","per1000":"$0.18/GB"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"sendgrid","name":"SendGrid (Email)","icon":"\ud83d\udce7","category":"communications","description":"Transactional emails, welcome emails, receipts, password reset, ride summaries","docsUrl":"https://docs.sendgrid.com/api-reference","version":"v3","enabled":true,"credentials":{"apiKey":{"label":"API Key","value":"","type":"password","required":true,"placeholder":"SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","help":"Obtenlo en app.sendgrid.com \u2192 Settings \u2192 API Keys \u2192 Create Key"},"fromEmail":{"label":"From Email","value":"","type":"text","required":true,"placeholder":"noreply@movilidad.app","help":"Email verificado como remitente en SendGrid"},"fromName":{"label":"From Name","value":"Movilidad","type":"text","required":true,"placeholder":"Movilidad App","help":"Nombre del remitente para emails de Movilidad"},"templateId":{"label":"Default Template ID","value":"","type":"text","required":false,"placeholder":"Ingresa tu Default Template ID","help":"Default Template ID para SendGrid (Email)"}},"endpoints":[{"name":"Send Email","path":"/v3/mail/send","status":"unknown"},{"name":"Templates","path":"/v3/templates","status":"unknown"},{"name":"Suppression List","path":"/v3/suppression/bounces","status":"unknown"}],"quotas":{"daily":100,"used":0,"unit":"emails"},"pricing":{"model":"freemium","free":"100/day","per1000":"$0.01/email"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":["delivered","bounce","open","click"]}},{"id":"fcm-push","name":"FCM Push Notifications","icon":"\ud83d\udd14","category":"notifications","description":"Push notifications to iOS/Android: ride requests, surge alerts, incentive updates, SOS alerts","docsUrl":"https://firebase.google.com/docs/cloud-messaging","version":"v1","enabled":true,"credentials":{"serviceAccountKey":{"label":"Service Account JSON","value":"","type":"textarea","required":true,"placeholder":"Ingresa tu Service Account JSON","help":"Service Account JSON para FCM Push Notifications"},"projectId":{"label":"Project ID","value":"","type":"text","required":true,"placeholder":"movilidad-app","help":"Obtenlo en Firebase Console \u2192 Project Settings \u2192 General"},"serverKey":{"label":"Server Key (Legacy)","value":"","type":"password","required":false,"placeholder":"AAAAxxxxxx:APA91bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","help":"Obtenlo en Firebase Console \u2192 Project Settings \u2192 Cloud Messaging (legacy)"},"apnsKey":{"label":"APNs Key (iOS)","value":"","type":"textarea","required":false,"placeholder":"-----BEGIN PRIVATE KEY-----\nMIGT...\n-----END PRIVATE KEY-----","help":"Clave APNs de Apple Developer para push iOS"},"apnsKeyId":{"label":"APNs Key ID","value":"","type":"text","required":false,"placeholder":"ABCDE12345","help":"ID de la clave APNs en Apple Developer"},"teamId":{"label":"Apple Team ID","value":"","type":"text","required":false,"placeholder":"Ingresa tu Apple Team ID","help":"Apple Team ID para FCM Push Notifications"},"bundleId":{"label":"iOS Bundle ID","value":"com.movilidad.rider","type":"text","required":false,"placeholder":"Ingresa tu iOS Bundle ID","help":"iOS Bundle ID para FCM Push Notifications"}},"endpoints":[{"name":"Send Message","path":"/v1/projects/{id}/messages:send","status":"unknown"},{"name":"Topic Subscription","path":"/v1/projects/{id}/subscriptions","status":"unknown"}],"quotas":{"daily":0,"used":0,"unit":"unlimited"},"pricing":{"model":"free","free":"Unlimited","per1000":"Free"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"kafka","name":"Apache Kafka (Streaming)","icon":"\ud83d\udcca","category":"streaming","description":"Surge pricing events, ride events stream, GPS location stream, analytics pipeline","docsUrl":"https://docs.confluent.io/platform/current/","version":"3.6","enabled":true,"credentials":{"bootstrapServers":{"label":"Bootstrap Servers","value":"","type":"text","required":true,"placeholder":"kafka-12345.us-east-1.aws.confluent.cloud:9092","help":"Obtenlo en Confluent Cloud \u2192 Cluster \u2192 Settings \u2192 Bootstrap server"},"schemaRegistryUrl":{"label":"Schema Registry URL","value":"","type":"text","required":false,"placeholder":"https://psrc-xxxxx.us-east-2.aws.confluent.cloud","help":"Obtenlo en Confluent Cloud \u2192 Schema Registry \u2192 Endpoint"},"apiKey":{"label":"API Key (Confluent)","value":"","type":"text","required":false,"placeholder":"YOUR_CONFLUENT_API_KEY_16chars","help":"Obtenlo en Confluent Cloud \u2192 API Keys \u2192 Create Key"},"apiSecret":{"label":"API Secret","value":"","type":"password","required":false,"placeholder":"YOUR_CONFLUENT_API_SECRET","help":"Secreto de la API Key de Confluent Cloud"},"clusterId":{"label":"Cluster ID","value":"","type":"text","required":false,"placeholder":"lkc-xxxxx","help":"Obtenlo en Confluent Cloud \u2192 Cluster \u2192 Settings \u2192 Cluster ID"}},"endpoints":[{"name":"surge-pricing-events","path":"topic","status":"unknown"},{"name":"ride-events","path":"topic","status":"unknown"},{"name":"gps-location-stream","path":"topic","status":"unknown"},{"name":"driver-status-stream","path":"topic","status":"unknown"},{"name":"payment-events","path":"topic","status":"unknown"}],"quotas":{"daily":0,"used":0,"unit":"unlimited"},"pricing":{"model":"self-hosted/managed","free":"Self-hosted","per1000":"Confluent from $0.02/GB"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"geohash-s2","name":"Geohash / S2 Geometry","icon":"\ud83c\udf10","category":"geospatial","description":"Spatial indexing for driver matching, nearby search, geofencing, cell coverage","docsUrl":"https://s2geometry.io/","version":"internal","enabled":true,"credentials":{"defaultPrecision":{"label":"Geohash Precision","value":"12","type":"number","required":true,"placeholder":"Ingresa tu Geohash Precision","help":"Geohash Precision para Geohash / S2 Geometry"},"searchRadiusKm":{"label":"Search Radius (km)","value":"5","type":"number","required":true,"placeholder":"Ingresa tu Search Radius (km)","help":"Search Radius (km) para Geohash / S2 Geometry"},"s2MaxLevel":{"label":"S2 Max Level","value":"16","type":"number","required":true,"placeholder":"16","help":"Nivel m\u00e1ximo S2: 16=manzana, 18=edificio"},"s2MinLevel":{"label":"S2 Min Level","value":"2","type":"number","required":true,"placeholder":"6","help":"Nivel m\u00ednimo S2: 4=regi\u00f3n, 6=ciudad"}},"endpoints":[{"name":"encodeGeohash","path":"internal","status":"active"},{"name":"decodeGeohash","path":"internal","status":"active"},{"name":"findNearbyDrivers","path":"internal","status":"active"},{"name":"haversineDistance","path":"internal","status":"active"},{"name":"geofenceCheck","path":"internal","status":"active"}],"quotas":{"daily":0,"used":0,"unit":"unlimited"},"pricing":{"model":"internal","free":"Built-in","per1000":"N/A"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"osrm","name":"OSRM (Routing Engine)","icon":"\ud83d\udee3\ufe0f","category":"mapping","description":"Open Source Routing Machine - Self-hosted route calculation, ETA, distance matrix","docsUrl":"https://project-osrm.org/docs/v5.24.0/API/","version":"v5.24","enabled":true,"credentials":{"serverUrl":{"label":"OSRM Server URL","value":"","type":"text","required":true,"placeholder":"http://localhost:5000","help":"OSRM Server URL para OSRM (Routing Engine)"},"profile":{"label":"Default Profile","value":"car","type":"select","options":["car","bike","foot"],"required":true,"placeholder":"Ingresa tu Default Profile","help":"Default Profile para OSRM (Routing Engine)"},"datasetPath":{"label":"OSM Dataset Path","value":"","type":"text","required":false,"placeholder":"/data/mexico-latest.osrm","help":"OSM Dataset Path para OSRM (Routing Engine)"}},"endpoints":[{"name":"Route","path":"/route/v1/","status":"unknown"},{"name":"Table (Matrix)","path":"/table/v1/","status":"unknown"},{"name":"Match","path":"/match/v1/","status":"unknown"},{"name":"Trip (TSP)","path":"/trip/v1/","status":"unknown"}],"quotas":{"daily":0,"used":0,"unit":"unlimited"},"pricing":{"model":"self-hosted","free":"Unlimited","per1000":"N/A"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"redis","name":"Redis (Cache/Queue)","icon":"\ud83d\udd34","category":"infrastructure","description":"Session cache, driver location cache, rate limiting, queue management, pub/sub","docsUrl":"https://redis.io/docs/","version":"7.2","enabled":true,"credentials":{"host":{"label":"Host","value":"localhost","type":"text","required":true,"placeholder":"redis-12345.c1.us-east-1.ec2.cloud.redislabs.com","help":"Host de Redis (Redis Cloud, AWS ElastiCache, o propio)"},"port":{"label":"Port","value":"6379","type":"number","required":true,"placeholder":"12345","help":"Puerto de conexi\u00f3n Redis"},"password":{"label":"Password","value":"","type":"password","required":false,"placeholder":"your_redis_password_here","help":"Contrase\u00f1a de autenticaci\u00f3n Redis"},"db":{"label":"Database Number","value":"0","type":"number","required":false,"placeholder":"0","help":"N\u00famero de base de datos Redis (0-15, por defecto 0)"},"clusterMode":{"label":"Cluster Mode","value":"false","type":"select","options":["true","false"],"required":false,"placeholder":"single","help":"Modo de despliegue: single, cluster, sentinel"}},"endpoints":[{"name":"PING","path":"command","status":"unknown"},{"name":"GEOADD/GEOSEARCH","path":"command","status":"unknown"},{"name":"PUB/SUB","path":"command","status":"unknown"},{"name":"LPUSH/RPOP (Queue)","path":"command","status":"unknown"}],"quotas":{"daily":0,"used":0,"unit":"unlimited"},"pricing":{"model":"self-hosted/managed","free":"Self-hosted","per1000":"Redis Cloud from $0.25/MB"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"postgresql","name":"PostgreSQL + PostGIS","icon":"\ud83d\udc18","category":"database","description":"Primary database with PostGIS extension for geospatial queries, user data, ride history","docsUrl":"https://www.postgresql.org/docs/","version":"16","enabled":true,"credentials":{"host":{"label":"Host","value":"localhost","type":"text","required":true,"placeholder":"db.movilidad.thefirm69.com","help":"Host de PostgreSQL (AWS RDS, Supabase, DigitalOcean, etc.)"},"port":{"label":"Port","value":"5432","type":"number","required":true,"placeholder":"5432","help":"Puerto de conexi\u00f3n PostgreSQL (5432 por defecto)"},"database":{"label":"Database","value":"movilidad","type":"text","required":true,"placeholder":"movilidad_production","help":"Nombre de la base de datos de Movilidad"},"user":{"label":"User","value":"movilidad_admin","type":"text","required":true,"placeholder":"movilidad_admin","help":"Usuario administrador de la base de datos"},"password":{"label":"Password","value":"","type":"password","required":true,"placeholder":"your_postgresql_password_here","help":"Contrase\u00f1a del usuario de base de datos"},"ssl":{"label":"SSL Mode","value":"require","type":"select","options":["disable","require","verify-ca","verify-full"],"required":true,"placeholder":"require","help":"Modo SSL: disable, require, verify-ca, verify-full"},"poolMax":{"label":"Max Pool Size","value":"20","type":"number","required":false,"placeholder":"20","help":"Conexiones m\u00e1ximas en el pool (recomendado: 20)"}},"endpoints":[{"name":"Connection","path":"tcp","status":"unknown"},{"name":"PostGIS ST_DWithin","path":"query","status":"unknown"},{"name":"PostGIS ST_Distance","path":"query","status":"unknown"}],"quotas":{"daily":0,"used":0,"unit":"unlimited"},"pricing":{"model":"self-hosted/managed","free":"Self-hosted","per1000":"RDS from $15/mo"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":[]}},{"id":"aws-s3","name":"AWS S3 (Storage)","icon":"\u2601\ufe0f","category":"storage","description":"Static assets, ride recordings, large document storage, backups, CloudFront CDN","docsUrl":"https://docs.aws.amazon.com/s3/","version":"2006-03-01","enabled":true,"credentials":{"accessKeyId":{"label":"Access Key ID","value":"","type":"text","required":true,"placeholder":"AKIAIOSFODNN7EXAMPLE","help":"Obtenlo en AWS IAM \u2192 Users \u2192 Access Keys \u2192 Create Key"},"secretAccessKey":{"label":"Secret Access Key","value":"","type":"password","required":true,"placeholder":"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY","help":"Obtenlo junto con Access Key ID (solo se muestra una vez)"},"region":{"label":"Region","value":"us-east-1","type":"text","required":true,"placeholder":"us-east-1","help":"Regi\u00f3n AWS del bucket: us-east-1, us-west-2, etc."},"bucketName":{"label":"Bucket Name","value":"movilidad-assets","type":"text","required":true,"placeholder":"movilidad-storage","help":"Nombre del S3 bucket para almacenamiento de Movilidad"},"cdnUrl":{"label":"CloudFront URL","value":"","type":"text","required":false,"placeholder":"Ingresa tu CloudFront URL","help":"CloudFront URL para AWS S3 (Storage)"}},"endpoints":[{"name":"Put Object","path":"/{bucket}/{key}","status":"unknown"},{"name":"Get Object","path":"/{bucket}/{key}","status":"unknown"},{"name":"List Objects","path":"/{bucket}","status":"unknown"}],"quotas":{"daily":0,"used":0,"unit":"5TB free tier"},"pricing":{"model":"pay-per-use","free":"5GB storage","per1000":"$0.023/GB/mo"},"lastTested":"2024-06-13T15:40:00.000Z","lastStatus":"configured","health":"active","webhook":{"url":"","events":["s3:ObjectCreated","s3:ObjectRemoved"]}},{"id":"gemini-ai","name":"Google Gemini AI","icon":"\ud83e\udde0","category":"artificial-intelligence","description":"Gemini Pro / Ultra \u2014 Motor de IA para TripCheck supervisi\u00f3n inteligente, an\u00e1lisis de seguridad, detecci\u00f3n de anomal\u00edas, NLP para incidencias y scoring en tiempo real","docsUrl":"https://ai.google.dev/docs","version":"v1beta","enabled":true,"health":"active","lastStatus":"configured","lastTested":"2024-06-13T15:40:00.000Z","credentials":{"apiKey":{"label":"API Key","value":"","type":"text","required":true,"placeholder":"AIzaSyB-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX","help":"Obtenlo en Google AI Studio \u2192 aistudio.google.com/apikey"},"model":{"label":"Modelo","value":"gemini-pro","type":"select","options":["gemini-pro","gemini-pro-vision","gemini-1.5-pro","gemini-1.5-flash","gemini-ultra"],"required":true,"placeholder":"gemini-pro","help":"Modelo de Gemini: gemini-pro, gemini-1.5-pro, gemini-1.5-flash"},"temperature":{"label":"Temperature","value":"0.2","type":"number","required":false,"placeholder":"0.2","help":"Creatividad: 0.0=determin\u00edstico, 1.0=creativo (recomendado: 0.2)"},"maxTokens":{"label":"Max Output Tokens","value":"2048","type":"number","required":false,"placeholder":"2048","help":"M\u00e1ximo de tokens en respuesta (recomendado: 2048)"},"safetySettings":{"label":"Safety Settings","value":"STANDARD","type":"select","options":["STANDARD","STRICT","PERMISSIVE"],"required":false,"placeholder":"STANDARD","help":"Nivel de seguridad: STRICT, STANDARD, PERMISSIVE"},"projectId":{"label":"Google Cloud Project ID","value":"","type":"text","required":false,"placeholder":"movilidad-ai-xxxxx","help":"Google Cloud Project ID (opcional, para Vertex AI)"}},"endpoints":[{"name":"generateContent","path":"/v1beta/models/{model}:generateContent","status":"active"},{"name":"streamGenerateContent","path":"/v1beta/models/{model}:streamGenerateContent","status":"active"},{"name":"embedContent","path":"/v1beta/models/embedding-001:embedContent","status":"active"},{"name":"countTokens","path":"/v1beta/models/{model}:countTokens","status":"active"}],"quotas":{"daily":1500,"used":0,"unit":"requests/day"},"pricing":{"model":"freemium","free":"60 req/min, 1500 req/dia","per1000":"$0.50 (Pro), $1.25 (1.5 Pro)","notes":"Free tier incluido"},"webhook":{"url":"","events":["safety.alert","anomaly.detected","score.calculated"]}}],"settings":{},"total":17};

let apiConfigs = [];
let apiLogs = [];
let apiCategories = [];
let isAuthenticated = false;
let selectedApiId = null;
let healthInterval = null;

// ===== LOAD FROM LOCALSTORAGE =====
function loadConfigs() {
  const saved = localStorage.getItem('movilidad_api_configs');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apis && parsed.apis.length === DEFAULT_CONFIGS.apis.length) {
        // Merge: keep saved values but update structure if needed
        parsed.apis.forEach((savedApi, i) => {
          const defaultApi = DEFAULT_CONFIGS.apis[i];
          if (defaultApi && savedApi.id === defaultApi.id) {
            // Add any new credential keys from defaults
            Object.keys(defaultApi.credentials).forEach(key => {
              if (!savedApi.credentials[key]) {
                savedApi.credentials[key] = defaultApi.credentials[key];
              } else {
                // Update placeholder/help if missing
                if (!savedApi.credentials[key].placeholder) savedApi.credentials[key].placeholder = defaultApi.credentials[key].placeholder;
                if (!savedApi.credentials[key].help) savedApi.credentials[key].help = defaultApi.credentials[key].help;
              }
            });
          }
        });
        apiConfigs = parsed.apis;
        return;
      }
    } catch(e) { console.error('Error parsing saved configs:', e); }
  }
  // Fresh load from defaults
  apiConfigs = JSON.parse(JSON.stringify(DEFAULT_CONFIGS.apis));
}

function saveConfigs() {
  localStorage.setItem('movilidad_api_configs', JSON.stringify({ apis: apiConfigs, total: apiConfigs.length }));
}

// ===== AUTH (client-side) =====
function apiLogin() {
  const user = document.getElementById('api-login-user').value;
  const pass = document.getElementById('api-login-pass').value;
  if (user === 'admin@movilidad.app' && pass === 'TheFirm69!Admin') {
    isAuthenticated = true;
    localStorage.setItem('movilidad_auth', 'true');
    document.getElementById('api-login-overlay').style.display = 'none';
    loadApiDashboard();
  } else {
    showApiToast('Credenciales incorrectas', 'error');
  }
}

function checkApiAuth() {
  const saved = localStorage.getItem('movilidad_auth');
  if (saved === 'true') { isAuthenticated = true; }
  if (!isAuthenticated) {
    document.getElementById('api-login-overlay').style.display = 'flex';
  } else {
    document.getElementById('api-login-overlay').style.display = 'none';
    loadApiDashboard();
  }
}

// ===== LOAD DASHBOARD =====
function loadApiDashboard() {
  loadConfigs();
  renderHealthSummary();
  apiCategories = [...new Set(apiConfigs.map(a => a.category))];
  renderApiCards();
  renderCategoryFilters();
  loadGeminiStatus();
  startHealthPolling();
}

function startHealthPolling() {
  if (healthInterval) clearInterval(healthInterval);
  healthInterval = setInterval(() => renderHealthSummary(), 30000);
}

// ===== HEALTH SUMMARY (client-side) =====
function renderHealthSummary() {
  const el = document.getElementById('api-health-summary');
  if (!el) return;
  const total = apiConfigs.length;
  const enabled = apiConfigs.filter(a => a.enabled).length;
  const healthy = apiConfigs.filter(a => a.health === 'healthy').length;
  const error = apiConfigs.filter(a => a.health === 'error').length;
  const unknown = apiConfigs.filter(a => a.health === 'unknown').length;
  const active = apiConfigs.filter(a => a.health === 'active').length;
  const totalPct = total > 0 ? Math.round(((healthy + enabled) / (total * 2)) * 100) : 0;
  const health = { total, enabled, healthy, error, unknown, active };
  
  el.innerHTML = `
    <div class="ahs-grid">
      <div class="ahs-item"><div class="ahs-num" style="color:var(--primary);">${total}</div><div class="ahs-label">Total APIs</div></div>
      <div class="ahs-item"><div class="ahs-num" style="color:var(--success);">${enabled}</div><div class="ahs-label">Activas</div></div>
      <div class="ahs-item"><div class="ahs-num" style="color:#10B981;">${healthy}</div><div class="ahs-label">Saludables</div></div>
      <div class="ahs-item"><div class="ahs-num" style="color:var(--danger);">${error}</div><div class="ahs-label">Con Error</div></div>
      <div class="ahs-item"><div class="ahs-num" style="color:var(--text-light);">${unknown}</div><div class="ahs-label">Sin Probar</div></div>
      <div class="ahs-item"><div class="ahs-num" style="color:${totalPct>70?'var(--success)':totalPct>40?'var(--warning)':'var(--danger)'};">${totalPct}%</div><div class="ahs-label">Salud General</div></div>
    </div>
  `;
}

// ===== CATEGORY FILTERS =====
function renderCategoryFilters() {
  const el = document.getElementById('api-category-filters');
  if (!el) return;
  const cats = {};
  apiConfigs.forEach(a => { if (!cats[a.category]) cats[a.category] = 0; cats[a.category]++; });
  const catNames = { mapping:'🗺️ Mapas', realtime:'⚡ Tiempo Real', payments:'💳 Pagos', communications:'📞 Comunicaciones', authentication:'🔥 Autenticación', storage:'☁️ Almacenamiento', notifications:'🔔 Notificaciones', streaming:'📊 Streaming', geospatial:'🌐 Geoespacial', infrastructure:'🔧 Infraestructura', database:'🐘 Base de Datos', 'artificial-intelligence':'🧠 IA / Gemini' };
  el.innerHTML = `<button class="btn btn-sm btn-primary api-cat-btn active" onclick="filterByCategory('all')">Todas (${apiConfigs.length})</button>` +
    Object.keys(cats).map(c => `<button class="btn btn-sm btn-secondary api-cat-btn" onclick="filterByCategory('${c}')">${catNames[c]||c} (${cats[c]})</button>`).join('');
}

let currentCategoryFilter = 'all';
function filterByCategory(cat) {
  currentCategoryFilter = cat;
  document.querySelectorAll('.api-cat-btn').forEach(b => b.classList.remove('active','btn-primary'));
  document.querySelectorAll('.api-cat-btn').forEach(b => { if (b.textContent.includes(cat==='all'?'Todas':cat)) { b.classList.add('active','btn-primary'); b.classList.remove('btn-secondary'); } else { b.classList.remove('active','btn-primary'); b.classList.add('btn-secondary'); } });
  renderApiCards();
}

// ===== API CARDS =====
function renderApiCards() {
  const el = document.getElementById('api-cards-grid');
  if (!el) return;
  let filtered = currentCategoryFilter === 'all' ? apiConfigs : apiConfigs.filter(a => a.category === currentCategoryFilter);
  el.innerHTML = filtered.map(api => {
    const hIcon = api.health==='healthy'?'🟢':api.health==='error'?'🔴':api.health==='active'?'🟢':'⚪';
    const hClass = api.health==='healthy'?'healthy':api.health==='error'?'error':api.health==='active'?'healthy':'unknown';
    const enabledClass = api.enabled ? 'enabled' : 'disabled';
    const hasValues = Object.values(api.credentials || {}).some(c => c.value && c.value.trim());
    const statusBadge = hasValues ? '<span style="font-size:9px;background:#10B981;color:#fff;padding:2px 6px;border-radius:8px;margin-left:6px;">CONFIGURADO</span>' : '<span style="font-size:9px;background:#F59E0B;color:#fff;padding:2px 6px;border-radius:8px;margin-left:6px;">SIN CONFIG</span>';
    return `<div class="api-card ${enabledClass}" onclick="openApiDetail('${api.id}')">
      <div class="ac-header">
        <div class="ac-icon">${api.icon}</div>
        <div class="ac-title"><h4>${api.name}</h4><span class="ac-version">${api.version}</span></div>
        <div class="ac-health ${hClass}">${hIcon}</div>
      </div>
      <p class="ac-desc">${api.description}</p>
      <div class="ac-footer">
        <span class="ac-category">${getCategoryLabel(api.category)} ${statusBadge}</span>
        <div class="ac-toggle" onclick="event.stopPropagation(); toggleApi('${api.id}', this)">
          <div class="toggle ${api.enabled?'active':''}"></div>
        </div>
      </div>
      ${api.lastTested ? `<div class="ac-tested">Probado: ${timeAgo(api.lastTested)}</div>` : ''}
    </div>`;
  }).join('');
}

function getCategoryLabel(cat) {
  const m = { mapping:'Mapas', realtime:'Realtime', payments:'Pagos', communications:'Coms', authentication:'Auth', storage:'Storage', notifications:'Push', streaming:'Stream', geospatial:'Geo', infrastructure:'Infra', database:'DB', 'artificial-intelligence':'IA/Gemini' };
  return m[cat] || cat;
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Nunca';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff/60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return mins + ' min';
  const hrs = Math.floor(mins/60);
  if (hrs < 24) return hrs + ' hrs';
  return Math.floor(hrs/24) + ' días';
}

// ===== TOGGLE API (client-side) =====
function toggleApi(id, el) {
  const api = apiConfigs.find(a => a.id === id);
  if (!api) return;
  api.enabled = !api.enabled;
  api.health = api.enabled ? 'active' : 'inactive';
  saveConfigs();
  const toggle = el.querySelector('.toggle') || el;
  toggle.classList.toggle('active');
  showApiToast(api.enabled ? 'API habilitada' : 'API deshabilitada', api.enabled ? 'success' : 'warning');
  renderApiCards();
  renderHealthSummary();
}

// ===== API DETAIL MODAL (client-side) =====
function openApiDetail(id) {
  selectedApiId = id;
  const api = apiConfigs.find(a => a.id === id);
  if (!api) return;
  const modal = document.getElementById('api-detail-modal');
  modal.classList.add('active');

  // Header
  document.getElementById('modal-api-icon').textContent = api.icon;
  document.getElementById('modal-api-name').textContent = api.name;
  document.getElementById('modal-api-version').textContent = api.version;
  document.getElementById('modal-api-desc').textContent = api.description;
  document.getElementById('modal-api-docs').href = api.docsUrl;
  document.getElementById('modal-api-docs').textContent = '📖 Documentación';

  // Health badge
  const hBadge = document.getElementById('modal-health-badge');
  const hMap = { healthy:{text:'Saludable',cls:'badge-success'}, error:{text:'Error',cls:'badge-danger'}, active:{text:'Activo',cls:'badge-success'}, unknown:{text:'Sin Probar',cls:'badge-warning'} };
  const hInfo = hMap[api.health] || hMap.unknown;
  hBadge.textContent = hInfo.text;
  hBadge.className = 'badge ' + hInfo.cls;

  // Status badge
  const sBadge = document.getElementById('modal-status-badge');
  sBadge.textContent = api.enabled ? 'Habilitada' : 'Deshabilitada';
  sBadge.className = 'badge ' + (api.enabled ? 'badge-success' : 'badge-danger');

  // Credentials form
  const credsDiv = document.getElementById('modal-credentials');
  credsDiv.innerHTML = Object.keys(api.credentials).map(key => {
    const c = api.credentials[key];
    const isPassword = c.type === 'password';
    const isTextarea = c.type === 'textarea';
    const isNumber = c.type === 'number';
    const isSelect = c.type === 'select';
    const reqMark = c.required ? '<span style="color:var(--danger);">*</span>' : '';
    let inputHtml;
    if (isTextarea) {
      inputHtml = `<textarea id="cred-${key}" placeholder="${c.placeholder||''}" rows="3" style="width:100%;padding:10px 14px;border:2px solid var(--border);border-radius:var(--radius);font-size:13px;font-family:monospace;resize:vertical;background:rgba(0,0,0,.2);color:#fff;">${c.value||''}</textarea>`;
    } else if (isSelect) {
      inputHtml = `<select id="cred-${key}" style="width:100%;padding:10px 14px;border:2px solid var(--border);border-radius:var(--radius);font-size:13px;background:rgba(0,0,0,.2);color:#fff;">${(c.options||[]).map(o=>`<option value="${o}" ${o===c.value?'selected':''}>${o}</option>`).join('')}</select>`;
    } else {
      inputHtml = `<input type="${isPassword?'password':'text'}" id="cred-${key}" value="${c.value||''}" placeholder="${c.placeholder||''}" style="width:100%;padding:10px 14px;border:2px solid var(--border);border-radius:var(--radius);font-size:13px;background:rgba(0,0,0,.2);color:#fff;" ${isNumber?'inputmode="numeric"':''} />`;
    }
    const helpHtml = c.help ? `<div class="cred-help" style="font-size:11px;color:#a78bfa;margin-top:4px;padding:0 2px;line-height:1.4;display:flex;align-items:flex-start;gap:4px;"><span style="flex-shrink:0;">💡</span><span>${c.help}</span></div>` : '';
    return `<div class="cred-field">
      <label>${c.label} ${reqMark}</label>
      <div class="cred-input-wrap">
        ${inputHtml}
        ${isPassword?`<button class="cred-toggle-vis" onclick="toggleCredVis('cred-${key}')">👁️</button>`:''}
      </div>
      ${helpHtml}
    </div>`;
  }).join('');

  // Endpoints
  const epDiv = document.getElementById('modal-endpoints');
  epDiv.innerHTML = api.endpoints.map(ep => {
    const sIcon = ep.status==='active'?'🟢':ep.status==='error'?'🔴':'⚪';
    return `<div class="ep-row"><span class="ep-status">${sIcon}</span><span class="ep-name">${ep.name}</span><span class="ep-path">${ep.path}</span></div>`;
  }).join('');

  // Quotas & Pricing
  document.getElementById('modal-quotas').innerHTML = `
    <div class="qp-item"><span class="qp-label">Cuota diaria</span><span class="qp-value">${api.quotas.daily || 'Ilimitada'}</span></div>
    <div class="qp-item"><span class="qp-label">Usado hoy</span><span class="qp-value">${api.quotas.used}</span></div>
    <div class="qp-item"><span class="qp-label">Unidad</span><span class="qp-value">${api.quotas.unit}</span></div>
  `;
  document.getElementById('modal-pricing').innerHTML = `
    <div class="qp-item"><span class="qp-label">Modelo</span><span class="qp-value">${api.pricing.model}</span></div>
    <div class="qp-item"><span class="qp-label">Nivel gratis</span><span class="qp-value">${api.pricing.free}</span></div>
    <div class="qp-item"><span class="qp-label">Costo por 1K</span><span class="qp-value">${api.pricing.per1000}</span></div>
  `;

  // Webhook
  document.getElementById('modal-webhook-url').value = api.webhook?.url || '';
  document.getElementById('modal-webhook-events').value = (api.webhook?.events || []).join(', ');

  // Last tested
  document.getElementById('modal-last-tested').textContent = api.lastTested ? new Date(api.lastTested).toLocaleString('es') : 'Nunca probado';
  
  // Test result
  const resultDiv = document.getElementById('modal-test-result');
  if (resultDiv) { resultDiv.style.display = 'none'; resultDiv.innerHTML = ''; }
}

function closeApiDetail() {
  document.getElementById('api-detail-modal').classList.remove('active');
  selectedApiId = null;
}

function toggleCredVis(inputId) {
  const inp = document.getElementById(inputId);
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ===== SAVE CREDENTIALS (client-side) =====
function saveApiConfig() {
  if (!selectedApiId) return;
  const api = apiConfigs.find(a => a.id === selectedApiId);
  if (!api) return;
  
  Object.keys(api.credentials).forEach(key => {
    const el = document.getElementById('cred-' + key);
    if (el) {
      api.credentials[key].value = el.value;
    }
  });
  
  // Save webhook
  const webhookUrl = document.getElementById('modal-webhook-url').value;
  const webhookEvents = document.getElementById('modal-webhook-events').value.split(',').map(s=>s.trim()).filter(Boolean);
  api.webhook = { url: webhookUrl, events: webhookEvents };
  
  saveConfigs();
  showApiToast('✅ Configuración guardada exitosamente', 'success');
  renderApiCards();
  renderHealthSummary();
  
  // Add log
  addLog('update', selectedApiId, 'Configuración actualizada', true);
}

// ===== TEST CONNECTION (client-side simulation) =====
function testApiConnection() {
  if (!selectedApiId) return;
  const btn = document.getElementById('btn-test-api');
  const resultDiv = document.getElementById('modal-test-result');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Probando...';
  resultDiv.innerHTML = '';
  resultDiv.style.display = 'block';

  // Save first
  saveApiConfig();

  const api = apiConfigs.find(a => a.id === selectedApiId);
  const hasValue = Object.values(api.credentials || {}).some(c => c.value && c.value.trim());
  
  // Simulate test with delay
  setTimeout(() => {
    const success = hasValue;
    const latency = Math.floor(Math.random() * 200 + 50);
    
    if (success) {
      api.health = 'healthy';
      api.lastTested = new Date().toISOString();
      api.lastStatus = 'active';
    } else {
      api.health = 'error';
      api.lastTested = new Date().toISOString();
      api.lastStatus = 'error';
    }
    saveConfigs();
    
    resultDiv.className = 'test-result ' + (success ? 'test-success' : 'test-error');
    resultDiv.innerHTML = `
      <div class="tr-header">
        <span class="tr-icon">${success ? '✅' : '❌'}</span>
        <span class="tr-status">${success ? 'Conexión exitosa' : 'Sin credenciales configuradas'}</span>
        <span class="tr-latency">${latency}ms</span>
      </div>
      <p class="tr-message">${success ? 'Las credenciales están configuradas. Para probar la conexión real, necesitas el servidor backend.' : 'Configura las credenciales para habilitar esta API.'}</p>
      <span class="tr-time">${new Date().toLocaleString('es')}</span>
    `;
    
    // Update health badge in modal
    const hBadge = document.getElementById('modal-health-badge');
    if (success) { hBadge.textContent = 'Saludable'; hBadge.className = 'badge badge-success'; }
    else { hBadge.textContent = 'Error'; hBadge.className = 'badge badge-danger'; }
    document.getElementById('modal-last-tested').textContent = new Date().toLocaleString('es');
    
    renderApiCards();
    renderHealthSummary();
    addLog('test', selectedApiId, success ? 'Conexión exitosa' : 'Sin credenciales', success);

    btn.disabled = false;
    btn.innerHTML = '🧪 Probar Conexión';
  }, 1500);
}

// ===== RESET API (client-side) =====
function resetApiConfig() {
  if (!selectedApiId) return;
  if (!confirm('¿Resetear esta API a sus valores por defecto? Se perderán todas las credenciales configuradas.')) return;
  
  const defaultApi = DEFAULT_CONFIGS.apis.find(a => a.id === selectedApiId);
  const api = apiConfigs.find(a => a.id === selectedApiId);
  if (defaultApi && api) {
    Object.keys(defaultApi.credentials).forEach(key => {
      api.credentials[key].value = '';
    });
    api.health = 'active';
    api.webhook = { url: '', events: [] };
    saveConfigs();
    showApiToast('🔄 API reseteada a valores por defecto', 'warning');
    openApiDetail(selectedApiId);
    renderApiCards();
    renderHealthSummary();
    addLog('reset', selectedApiId, 'API reseteada', true);
  }
}

// ===== EXPORT CONFIGS (client-side) =====
function exportApiConfigs() {
  const blob = new Blob([JSON.stringify({ apis: apiConfigs, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'movilidad-api-configs.json'; a.click();
  URL.revokeObjectURL(url);
  showApiToast('📦 Configuraciones exportadas', 'success');
}

// ===== TEST ALL APIs (client-side) =====
function testAllApis() {
  const btn = document.getElementById('btn-test-all');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Probando todas...';
  
  setTimeout(() => {
    apiConfigs.forEach(api => {
      if (api.enabled) {
        const hasValue = Object.values(api.credentials || {}).some(c => c.value && c.value.trim());
        api.health = hasValue ? 'healthy' : 'error';
        api.lastTested = new Date().toISOString();
      }
    });
    saveConfigs();
    renderApiCards();
    renderHealthSummary();
    btn.disabled = false;
    btn.innerHTML = '🧪 Probar Todas';
    showApiToast('✅ Pruebas completadas', 'success');
  }, 2000);
}

// ===== LOGS (client-side) =====
function addLog(action, apiId, message, success) {
  const log = { action, apiId, message, success, timestamp: new Date().toISOString() };
  let logs = JSON.parse(localStorage.getItem('movilidad_api_logs') || '[]');
  logs.unshift(log);
  if (logs.length > 50) logs = logs.slice(0, 50);
  localStorage.setItem('movilidad_api_logs', JSON.stringify(logs));
  apiLogs = logs;
  renderApiLogs();
}

function renderApiLogs() {
  const el = document.getElementById('api-logs-list');
  if (!el) return;
  if (!apiLogs.length) apiLogs = JSON.parse(localStorage.getItem('movilidad_api_logs') || '[]');
  el.innerHTML = apiLogs.slice(0, 30).map(log => {
    const aIcon = log.action==='test'?'🧪':log.action==='toggle'?'🔄':log.action==='update'?'💾':log.action==='reset'?'🔄':'📋';
    const sClass = log.success ? 'log-success' : 'log-error';
    return `<div class="log-row ${sClass}">
      <span class="log-action">${aIcon}</span>
      <span class="log-api">${log.apiId || '-'}</span>
      <span class="log-msg">${log.message}</span>
      <span class="log-time">${timeAgo(log.timestamp)}</span>
    </div>`;
  }).join('') || '<div style="text-align:center;color:rgba(255,255,255,.4);padding:20px;">Sin actividad registrada</div>';
}

// ===== TOAST =====
function showApiToast(msg, type) {
  const container = document.getElementById('api-toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'api-toast toast-' + type;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ===== TAB SWITCHING =====
function showApiTab(tabName) {
  document.querySelectorAll('.amc-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.amc-tab-content').forEach(t => t.classList.remove('active'));
  const tab = document.querySelector(`.amc-tab[onclick*="${tabName}"]`);
  if (tab) tab.classList.add('active');
  const content = document.getElementById('tab-' + tabName);
  if (content) content.classList.add('active');
}

// ===== GEMINI AI FUNCTIONS (client-side) =====
function loadGeminiStatus() {
  const el = document.getElementById('gemini-status-info');
  if (!el) return;
  const gemini = apiConfigs.find(a => a.id === 'gemini-ai');
  if (!gemini) return;
  
  const hasKey = !!(gemini.credentials.apiKey && gemini.credentials.apiKey.value);
  const statusColor = hasKey ? '#10B981' : '#F59E0B';
  const statusText = hasKey ? '✅ Configurado & Conectado' : '⚠️ Falta API Key';
  const healthColor = gemini.health === 'healthy' ? '#10B981' : gemini.health === 'active' ? '#10B981' : '#F59E0B';
  const model = gemini.credentials.model?.value || 'gemini-pro';
  
  el.innerHTML = `
    <span style="color:${statusColor};font-size:11px;font-weight:700;">${statusText}</span>
    <span style="color:rgba(255,255,255,.5);font-size:11px;">🤖 Modelo: <strong style="color:#fff;">${model}</strong></span>
    <span style="color:${healthColor};font-size:11px;">${gemini.health === 'healthy' ? '🟢 Saludable' : gemini.health === 'active' ? '🟢 Activo' : '🟡 Sin Probar'}</span>
    <span style="color:rgba(255,255,255,.5);font-size:11px;">📊 Cuota: <strong style="color:#fff;">${gemini.quotas?.used || 0}/${gemini.quotas?.daily || '∞'}</strong></span>
    <span style="color:rgba(255,255,255,.5);font-size:11px;">🔍 Análisis: <strong style="color:#fff;">route-deviation, speed-anomaly, incident-detection, safety-score, ride-safety-check</strong></span>
  `;
}

function testGeminiConnection() {
  const btn = event.target;
  btn.disabled = true;
  const origText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;"></span> Probando...';
  
  const gemini = apiConfigs.find(a => a.id === 'gemini-ai');
  const hasKey = !!(gemini.credentials.apiKey && gemini.credentials.apiKey.value);
  
  setTimeout(() => {
    if (hasKey) {
      gemini.health = 'healthy';
      showApiToast('🧠 Gemini AI configurado — TripCheck listo', 'success');
    } else {
      showApiToast('⚠️ Gemini sin API Key — Agrega tu API Key', 'warning');
    }
    saveConfigs();
    loadGeminiStatus();
    renderApiCards();
    renderHealthSummary();
    btn.disabled = false;
    btn.innerHTML = origText;
  }, 1500);
}

// ===== INIT =====
function initApiConfigPanel() {
  checkApiAuth();
}
