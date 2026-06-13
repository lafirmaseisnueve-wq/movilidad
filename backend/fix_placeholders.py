#!/usr/bin/env python3
import json

with open('movilidad/backend/data/api_configs.json', 'r') as f:
    data = json.load(f)

placeholders = {
    'google-maps': {
        'apiKey': 'AIzaSyBz1234567890abcdefghijk-XXXXXXXXX',
        'clientId': 'gme-yourcompanyname',
        'urlSignature': 'your_url_signature_secret'
    },
    'mapbox': {
        'accessToken': 'pk.eyJ1IjoieW91cm9yZyIsImEiOiJjbHRlc3QxMjMifQ.xxxxx',
        'secretKey': 'sk.eyJ1IjoieW91cm9yZyIsImEiOiJjbHRlc3QxMjMifQ.xxxxx'
    },
    'here-maps': {
        'appId': 'YOUR_HERE_APP_ID_8chars',
        'appCode': 'YOUR_HERE_APP_CODE_16chars',
        'apiKey': 'YOUR_HERE_API_KEY_v7_32chars'
    },
    'socket-io': {
        'serverUrl': 'https://movilidad-socket.thefirm69.com',
        'port': '3001',
        'authSecret': 'movilidad-socket-secret-2024',
        'redisAdapterUrl': 'redis://default:password@redis-12345.c1.us-east-1.ec2.cloud.redislabs.com:12345'
    },
    'stripe': {
        'publishableKey': 'pk_test_51Ab2c3D4e5f6g7h8i9j0kLmN',
        'secretKey': 'sk_test_51Ab2c3D4e5f6g7h8i9j0kLmN',
        'webhookSigningSecret': 'whsec_xxxxxxxxxxxxxxxxxxxxxxxx',
        'connectClientId': 'ca_XXXXXXXXXXXXXXXXXXXXXXXX'
    },
    'twilio': {
        'accountSid': 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'authToken': 'your_twilio_auth_token_32chars',
        'twilioPhoneNumber': '+12345678900',
        'verifyServiceSid': 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'apiKeySid': 'SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'apiKeySecret': 'your_twilio_api_key_secret'
    },
    'firebase-auth': {
        'apiKey': 'AIzaSyB-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        'authDomain': 'movilidad-app.firebaseapp.com',
        'projectId': 'movilidad-app',
        'storageBucket': 'movilidad-app.appspot.com',
        'messagingSenderId': '123456789012',
        'appId': '1:123456789012:web:abcdef1234567890',
        'serviceAccountKey': '{"type":"service_account","project_id":"movilidad-app","private_key_id":"xxxx","private_key":"-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-xxxxx@movilidad-app.iam.gserviceaccount.com"}'
    },
    'cloudinary': {
        'cloudName': 'your-cloud-name',
        'apiKey': '123456789012345',
        'apiSecret': 'your_cloudinary_api_secret_32chars',
        'uploadPreset': 'movilidad_uploads',
        'defaultFolder': 'movilidad/images'
    },
    'sendgrid': {
        'apiKey': 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'fromEmail': 'noreply@movilidad.app',
        'fromName': 'Movilidad App',
        'defaultTemplateId': 'd-xxxxxxxxxxxxxxxxxxxxxxxx'
    },
    'fcm-push': {
        'serviceAccountJson': '{"type":"service_account","project_id":"movilidad-app","private_key_id":"xxxx","private_key":"-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-xxxxx@movilidad-app.iam.gserviceaccount.com"}',
        'projectId': 'movilidad-app',
        'serverKey': 'AAAAxxxxxx:APA91bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'apnsKey': '-----BEGIN PRIVATE KEY-----\nMIGT...\n-----END PRIVATE KEY-----',
        'apnsKeyId': 'ABCDE12345',
        'appleTeamId': 'ABCDE12345',
        'iosBundleId': 'com.thefirm69.movilidad'
    },
    'kafka': {
        'bootstrapServers': 'kafka-12345.us-east-1.aws.confluent.cloud:9092',
        'schemaRegistryUrl': 'https://psrc-xxxxx.us-east-2.aws.confluent.cloud',
        'apiKey': 'YOUR_CONFLUENT_API_KEY_16chars',
        'apiSecret': 'YOUR_CONFLUENT_API_SECRET',
        'clusterId': 'lkc-xxxxx'
    },
    'geohash-s2': {
        'geohashPrecision': '7',
        'searchRadius': '5',
        's2MaxLevel': '16',
        's2MinLevel': '6'
    },
    'osrm': {
        'osrmServerUrl': 'https://router.project-osrm.org',
        'defaultProfile': 'driving',
        'osmDatasetPath': '/data/mexico-latest.osm.pbf'
    },
    'redis': {
        'host': 'redis-12345.c1.us-east-1.ec2.cloud.redislabs.com',
        'port': '12345',
        'password': 'your_redis_password_here',
        'databaseNumber': '0',
        'clusterMode': 'single'
    },
    'postgresql': {
        'host': 'db.movilidad.thefirm69.com',
        'port': '5432',
        'database': 'movilidad_production',
        'user': 'movilidad_admin',
        'password': 'your_postgresql_password_here',
        'sslMode': 'require',
        'maxPoolSize': '20'
    },
    'aws-s3': {
        'accessKeyId': 'AKIAIOSFODNN7EXAMPLE',
        'secretAccessKey': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        'region': 'us-east-1',
        'bucketName': 'movilidad-storage',
        'cloudFrontUrl': 'https://d1234567890.cloudfront.net'
    },
    'gemini-ai': {
        'apiKey': 'AIzaSyB-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        'model': 'gemini-pro',
        'temperature': '0.2',
        'maxTokens': '2048',
        'safetySettings': 'STANDARD',
        'projectId': 'movilidad-ai-xxxxx'
    }
}

help_texts = {
    'google-maps': {
        'apiKey': 'Obténla en Google Cloud Console → APIs & Services → Credentials',
        'clientId': 'Solo para clientes Premium de Google Maps Platform',
        'urlSignature': 'Solo para clientes Premium — Firma digital de URL'
    },
    'mapbox': {
        'accessToken': 'Obtenlo en account.mapbox.com/access-tokens',
        'secretKey': 'Clave secreta para APIs server-side de Mapbox'
    },
    'here-maps': {
        'appId': 'Obtenlo en developer.here.com/dashboard',
        'appCode': 'Obtenlo junto con App ID en HERE dashboard',
        'apiKey': 'Clave API v7 — Reemplaza App ID/Code en APIs nuevas'
    },
    'socket-io': {
        'serverUrl': 'URL de tu servidor Socket.IO (backend de Movilidad)',
        'port': 'Puerto del servidor Socket.IO',
        'authSecret': 'Secreto compartido para autenticar conexiones socket',
        'redisAdapterUrl': 'URL de Redis para Socket.IO cluster adapter'
    },
    'stripe': {
        'publishableKey': 'Clave pública — pk_test_ para sandbox, pk_live_ para producción',
        'secretKey': 'Clave secreta — sk_test_ para sandbox, sk_live_ para producción',
        'webhookSigningSecret': 'Obtenlo al crear webhook en Stripe Dashboard',
        'connectClientId': 'Para Stripe Connect — pagos directos a conductores'
    },
    'twilio': {
        'accountSid': 'Obtenlo en console.twilio.com → Account Info',
        'authToken': 'Obtenlo en console.twilio.com → Account Info (secreto)',
        'twilioPhoneNumber': 'Número de Twilio comprado para SMS y llamadas',
        'verifyServiceSid': 'Obtenlo al crear Verify Service en Twilio',
        'apiKeySid': 'Obtenlo al crear API Key en Twilio Console',
        'apiKeySecret': 'Secreto de la API Key de Twilio'
    },
    'firebase-auth': {
        'apiKey': 'Obtenlo en Firebase Console → Project Settings → Web App',
        'authDomain': 'Obtenlo en Firebase Console → Project Settings → Web App',
        'projectId': 'Obtenlo en Firebase Console → Project Settings → General',
        'storageBucket': 'Obtenlo en Firebase Console → Project Settings → General',
        'messagingSenderId': 'Obtenlo en Firebase Console → Project Settings → Cloud Messaging',
        'appId': 'Obtenlo en Firebase Console → Project Settings → Web App',
        'serviceAccountKey': 'Obtenlo en Firebase Console → Service Accounts → Generate New Private Key'
    },
    'cloudinary': {
        'cloudName': 'Obtenlo en console.cloudinary.com → Dashboard',
        'apiKey': 'Obtenlo en console.cloudinary.com → Dashboard',
        'apiSecret': 'Obtenlo en console.cloudinary.com → Dashboard (secreto)',
        'uploadPreset': 'Créalo en console.cloudinary.com → Settings → Upload',
        'defaultFolder': 'Carpeta por defecto para uploads de Movilidad'
    },
    'sendgrid': {
        'apiKey': 'Obtenlo en app.sendgrid.com → Settings → API Keys → Create Key',
        'fromEmail': 'Email verificado como remitente en SendGrid',
        'fromName': 'Nombre del remitente para emails de Movilidad',
        'defaultTemplateId': 'ID de template dinámico creado en SendGrid'
    },
    'fcm-push': {
        'serviceAccountJson': 'Obtenlo en Firebase Console → Service Accounts → Generate New Private Key',
        'projectId': 'Obtenlo en Firebase Console → Project Settings → General',
        'serverKey': 'Obtenlo en Firebase Console → Project Settings → Cloud Messaging (legacy)',
        'apnsKey': 'Clave APNs de Apple Developer para push iOS',
        'apnsKeyId': 'ID de la clave APNs en Apple Developer',
        'appleTeamId': 'Team ID de tu cuenta Apple Developer',
        'iosBundleId': 'Bundle ID de la app iOS de Movilidad'
    },
    'kafka': {
        'bootstrapServers': 'Obtenlo en Confluent Cloud → Cluster → Settings → Bootstrap server',
        'schemaRegistryUrl': 'Obtenlo en Confluent Cloud → Schema Registry → Endpoint',
        'apiKey': 'Obtenlo en Confluent Cloud → API Keys → Create Key',
        'apiSecret': 'Secreto de la API Key de Confluent Cloud',
        'clusterId': 'Obtenlo en Confluent Cloud → Cluster → Settings → Cluster ID'
    },
    'geohash-s2': {
        'geohashPrecision': 'Precisión Geohash: 6=ciudad, 7=barrio, 8=calle, 9=edificio',
        'searchRadius': 'Radio de búsqueda en km para encontrar conductores cercanos',
        's2MaxLevel': 'Nivel máximo S2: 16=manzana, 18=edificio',
        's2MinLevel': 'Nivel mínimo S2: 4=región, 6=ciudad'
    },
    'osrm': {
        'osrmServerUrl': 'URL de servidor OSRM público o tu instancia propia',
        'defaultProfile': 'Perfil de routing: driving, cycling, walking',
        'osmDatasetPath': 'Ruta al archivo .osm.pbf para datos de mapa propio'
    },
    'redis': {
        'host': 'Host de Redis (Redis Cloud, AWS ElastiCache, o propio)',
        'port': 'Puerto de conexión Redis',
        'password': 'Contraseña de autenticación Redis',
        'databaseNumber': 'Número de base de datos Redis (0-15)',
        'clusterMode': 'Modo de despliegue: single, cluster, sentinel'
    },
    'postgresql': {
        'host': 'Host de PostgreSQL (AWS RDS, Supabase, DigitalOcean, etc.)',
        'port': 'Puerto de conexión PostgreSQL (5432 por defecto)',
        'database': 'Nombre de la base de datos de Movilidad',
        'user': 'Usuario administrador de la base de datos',
        'password': 'Contraseña del usuario de base de datos',
        'sslMode': 'Modo SSL: disable, require, verify-ca, verify-full',
        'maxPoolSize': 'Conexiones máximas en el pool (recomendado: 20)'
    },
    'aws-s3': {
        'accessKeyId': 'Obtenlo en AWS IAM → Users → Access Keys → Create Key',
        'secretAccessKey': 'Obtenlo junto con Access Key ID (solo se muestra una vez)',
        'region': 'Región AWS del bucket: us-east-1, us-west-2, etc.',
        'bucketName': 'Nombre del S3 bucket para almacenamiento de Movilidad',
        'cloudFrontUrl': 'URL de CloudFront distribution para CDN (opcional)'
    },
    'gemini-ai': {
        'apiKey': 'Obtenlo en Google AI Studio → aistudio.google.com/apikey',
        'model': 'Modelo de Gemini: gemini-pro, gemini-1.5-pro, gemini-1.5-flash',
        'temperature': 'Creatividad: 0.0=determinístico, 1.0=creativo (recomendado: 0.2)',
        'maxTokens': 'Máximo de tokens en respuesta (recomendado: 2048)',
        'safetySettings': 'Nivel de seguridad: STRICT, STANDARD, PERMISSIVE',
        'projectId': 'Google Cloud Project ID (opcional, para Vertex AI)'
    }
}

for api in data['apis']:
    api_id = api['id']
    if api_id in placeholders:
        for cred_key, placeholder_val in placeholders[api_id].items():
            if cred_key in api.get('credentials', {}):
                api['credentials'][cred_key]['placeholder'] = placeholder_val
                if api_id in help_texts and cred_key in help_texts[api_id]:
                    api['credentials'][cred_key]['help'] = help_texts[api_id][cred_key]
    for cred_key, cred in api.get('credentials', {}).items():
        if 'placeholder' not in cred or not cred['placeholder']:
            cred['placeholder'] = f'Ingresa tu {cred["label"]}'
        if 'help' not in cred:
            cred['help'] = f'{cred["label"]} para {api["name"]}'

with open('movilidad/backend/data/api_configs.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f'DONE — {len(data["apis"])} APIs updated with placeholders and help text')

# Count total credentials with placeholders
total_creds = 0
with_placeholders = 0
with_help = 0
for api in data['apis']:
    for ck, cv in api.get('credentials', {}).items():
        total_creds += 1
        if cv.get('placeholder'): with_placeholders += 1
        if cv.get('help'): with_help += 1
print(f'Total credentials: {total_creds}, With placeholders: {with_placeholders}, With help: {with_help}')
