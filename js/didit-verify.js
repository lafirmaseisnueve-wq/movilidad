/* ================================================================
   MOVILIDAD - Didit Identity Verification Integration
   By TheFirm69 Systems
   
   Integrates with https://business.didit.me/ for:
   - INE credential validity verification (mex_ine_vigencia)
   - ID Verification (OCR + document liveness)
   - KYC Session creation (hosted verification flow)
   
   API Docs: https://docs.didit.me/api-reference/overview
   ================================================================ */

const DiditVerify = (() => {
  // ---- Configuration ----
  const DIDIT_BASE_URL = 'https://verification.didit.me';
  const DIDIT_V3_SESSION = '/v3/session/';
  const DIDIT_V3_ID_VERIFY = '/v3/id-verification/';
  const DIDIT_V3_DB_VALIDATE = '/v3/database-validation/';
  const DIDIT_V3_SESSION_DECISION = '/v3/session/{sessionId}/decision/';
  const DIDIT_SDK_WEB = 'https://cdn.jsdelivr.net/npm/@didit-protocol/sdk-web@latest/dist/index.min.js';

  let _apiKey = '';
  let _workflowId = '';
  let _webhookSecret = '';
  let _webhookUrl = '';
  let _initialized = false;

  // ---- Initialization ----
  function init(config = {}) {
    _apiKey = config.apiKey || '';
    _workflowId = config.workflowId || '';
    _webhookSecret = config.webhookSecret || '';
    _webhookUrl = config.webhookUrl || '';
    _initialized = true;
    console.log('[Didit] Initialized with workflow:', _workflowId ? '✓' : '✗ (required for sessions)');
    return true;
  }

  function loadConfig() {
    try {
      const saved = localStorage.getItem('movilidad_api_configs');
      if (saved) {
        const parsed = JSON.parse(saved);
        const diditApi = parsed.apis?.find(a => a.id === 'didit-verification');
        if (diditApi) {
          _apiKey = diditApi.credentials?.apiKey?.value || '';
          _workflowId = diditApi.credentials?.workflowId?.value || '';
          _webhookSecret = diditApi.credentials?.webhookSecret?.value || '';
          _webhookUrl = diditApi.credentials?.webhookUrl?.value || '';
          _initialized = true;
          return true;
        }
      }
    } catch(e) {
      console.error('[Didit] Error loading config:', e);
    }
    return false;
  }

  function isConfigured() {
    return _apiKey && _apiKey.length > 10;
  }

  // ---- KYC Session (Hosted Verification Flow) ----
  async function createSession(params = {}) {
    if (!isConfigured()) {
      return { error: 'Didit API Key not configured. Go to Admin Panel → API Config → Didit Verification.' };
    }

    const workflowId = params.workflowId || _workflowId;
    if (!workflowId) {
      return { error: 'Workflow ID required. Configure it in Admin Panel → API Config → Didit Verification.' };
    }

    const body = {
      workflow_id: workflowId,
      vendor_data: params.vendorData || `movilidad-user-${Date.now()}`,
      callback: params.callback || _webhookUrl || window.location.origin + '/verify/callback',
      callback_method: params.callbackMethod || 'both',
      language: params.language || 'es',
      metadata: params.metadata || { platform: 'movilidad', app_type: params.appType || 'passenger' }
    };

    if (params.contactDetails) {
      body.contact_details = params.contactDetails;
    }

    if (params.expectedDetails) {
      body.expected_details = params.expectedDetails;
    }

    try {
      const response = await fetch(DIDIT_BASE_URL + DIDIT_V3_SESSION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': _apiKey
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.status === 201) {
        // Store session info locally
        _saveSessionData(data);
        return { success: true, session: data };
      }

      return { error: data.detail || data.error || 'Failed to create session', status: response.status };
    } catch(e) {
      console.error('[Didit] Session creation error:', e);
      return { error: 'Network error: ' + e.message };
    }
  }

  // ---- INE Credential Validity Verification (Database Validation) ----
  async function verifyINE(ineData = {}) {
    if (!isConfigured()) {
      return { error: 'Didit API Key not configured. Go to Admin Panel → API Config → Didit Verification.' };
    }

    const formData = new FormData();
    formData.append('issuing_state', 'MEX');
    formData.append('services', 'mex_ine_vigencia');
    formData.append('vendor_data', ineData.vendorData || `movilidad-ine-${Date.now()}`);

    // Optional cross-check fields from INE
    if (ineData.cic) formData.append('cic', ineData.cic);
    if (ineData.identificadorCiudadano) formData.append('identificador_ciudadano', ineData.identificadorCiudadano);
    if (ineData.ocr) formData.append('ocr', ineData.ocr);
    if (ineData.voterNumber) formData.append('voter_number', ineData.voterNumber);
    if (ineData.emissionNumber) formData.append('emission_number', ineData.emissionNumber);
    if (ineData.firstName) formData.append('first_name', ineData.firstName);
    if (ineData.lastName) formData.append('last_name', ineData.lastName);
    if (ineData.dateOfBirth) formData.append('date_of_birth', ineData.dateOfBirth);

    try {
      const response = await fetch(DIDIT_BASE_URL + DIDIT_V3_DB_VALIDATE, {
        method: 'POST',
        headers: {
          'x-api-key': _apiKey
        },
        body: formData
      });

      const data = await response.json();

      if (response.status === 200) {
        const result = {
          success: true,
          matchType: data.match_type,
          status: data.status,
          requestId: data.request_id,
          validations: data.validations || [],
          isVerified: data.match_type === 'full_match' && data.status === 'Approved'
        };
        _saveVerificationResult('ine', result);
        return result;
      }

      return { error: data.detail || 'INE verification failed', status: response.status };
    } catch(e) {
      console.error('[Didit] INE verification error:', e);
      return { error: 'Network error: ' + e.message };
    }
  }

  // ---- ID Verification (OCR + Document Liveness) ----
  async function verifyDocument(frontImage, backImage = null, options = {}) {
    if (!isConfigured()) {
      return { error: 'Didit API Key not configured. Go to Admin Panel → API Config → Didit Verification.' };
    }

    const formData = new FormData();
    formData.append('front_image', frontImage);
    if (backImage) formData.append('back_image', backImage);
    formData.append('perform_document_liveness', options.performLiveness ? 'true' : 'true');
    formData.append('save_api_request', 'true');
    formData.append('vendor_data', options.vendorData || `movilidad-doc-${Date.now()}`);
    if (options.minimumAge) formData.append('minimum_age', options.minimumAge.toString());
    if (options.metadata) formData.append('metadata', JSON.stringify(options.metadata));

    try {
      const response = await fetch(DIDIT_BASE_URL + DIDIT_V3_ID_VERIFY, {
        method: 'POST',
        headers: {
          'x-api-key': _apiKey
        },
        body: formData
      });

      const data = await response.json();

      if (response.status === 200) {
        const result = {
          success: true,
          status: data.id_verification?.status,
          documentType: data.id_verification?.document_type,
          documentNumber: data.id_verification?.document_number,
          fullName: data.id_verification?.full_name,
          firstName: data.id_verification?.first_name,
          lastName: data.id_verification?.last_name,
          dateOfBirth: data.id_verification?.date_of_birth,
          age: data.id_verification?.age,
          gender: data.id_verification?.gender,
          nationality: data.id_verification?.nationality,
          expirationDate: data.id_verification?.expiration_date,
          issuingState: data.id_verification?.issuing_state,
          address: data.id_verification?.formatted_address,
          portraitImage: data.id_verification?.portrait_image,
          warnings: data.id_verification?.warnings || [],
          isApproved: data.id_verification?.status === 'Approved',
          requestId: data.request_id,
          qualityScores: {
            front: data.id_verification?.front_image_quality_score,
            back: data.id_verification?.back_image_quality_score
          },
          mrz: data.id_verification?.mrz,
          raw: data
        };
        _saveVerificationResult('document', result);
        return result;
      }

      if (response.status === 400 && data.error === 'COULD_NOT_RECOGNIZE_DOCUMENT') {
        return { error: 'No se pudo reconocer el documento. Asegúrate de que la imagen sea clara y el documento sea válido.', status: 400 };
      }

      return { error: data.detail || 'Document verification failed', status: response.status };
    } catch(e) {
      console.error('[Didit] Document verification error:', e);
      return { error: 'Network error: ' + e.message };
    }
  }

  // ---- Get Session Decision ----
  async function getSessionDecision(sessionId) {
    if (!isConfigured()) {
      return { error: 'Didit API Key not configured' };
    }

    try {
      const url = DIDIT_BASE_URL + DIDIT_V3_SESSION_DECISION.replace('{sessionId}', sessionId);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': _apiKey
        }
      });

      const data = await response.json();

      if (response.status === 200) {
        return { success: true, decision: data };
      }

      return { error: data.detail || 'Failed to get decision', status: response.status };
    } catch(e) {
      console.error('[Didit] Get decision error:', e);
      return { error: 'Network error: ' + e.message };
    }
  }

  // ---- Start Hosted Verification (for iframe/redirect) ----
  async function startHostedVerification(params = {}) {
    const sessionResult = await createSession(params);

    if (sessionResult.success && sessionResult.session?.url) {
      return {
        success: true,
        url: sessionResult.session.url,
        sessionId: sessionResult.session.session_id,
        sessionToken: sessionResult.session.session_token,
        mode: params.mode || 'redirect' // 'redirect', 'iframe', 'sdk'
      };
    }

    return sessionResult;
  }

  // ---- Open Verification in iframe ----
  function openVerificationIframe(containerId, verificationUrl, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('[Didit] Container not found:', containerId);
      return false;
    }

    const iframe = document.createElement('iframe');
    iframe.src = verificationUrl;
    iframe.style.width = '100%';
    iframe.style.height = options.height || '700px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '16px';
    iframe.allow = 'camera; microphone; fullscreen; autoplay; encrypted-media';
    iframe.id = 'didit-verify-iframe';
    container.innerHTML = '';
    container.appendChild(iframe);
    return true;
  }

  // ---- UniLink iframe (no backend required) ----
  function openUniLinkIframe(containerId, workflowId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return false;

    // Base64 encode workflow ID for UniLink URL
    const encoded = btoa(workflowId);
    const url = `https://verify.didit.me/u/${encoded}`;

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = options.height || '700px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '16px';
    iframe.allow = 'camera; microphone; fullscreen; autoplay; encrypted-media';
    iframe.id = 'didit-verify-iframe';
    container.innerHTML = '';
    container.appendChild(iframe);
    return true;
  }

  // ---- Local Storage Helpers ----
  function _saveSessionData(session) {
    try {
      const sessions = JSON.parse(localStorage.getItem('movilidad_didit_sessions') || '[]');
      sessions.push({ ...session, savedAt: new Date().toISOString() });
      localStorage.setItem('movilidad_didit_sessions', JSON.stringify(sessions));
    } catch(e) {
      console.error('[Didit] Error saving session:', e);
    }
  }

  function _saveVerificationResult(type, result) {
    try {
      const results = JSON.parse(localStorage.getItem('movilidad_didit_results') || '{}');
      results[type] = { ...result, verifiedAt: new Date().toISOString() };
      localStorage.setItem('movilidad_didit_results', JSON.stringify(results));

      // Also update the user verification status
      const userStatus = JSON.parse(localStorage.getItem('movilidad_user_verification') || '{}');
      if (type === 'ine') {
        userStatus.ineVerified = result.isVerified;
        userStatus.ineVerifiedAt = new Date().toISOString();
        userStatus.ineMatchType = result.matchType;
      } else if (type === 'document') {
        userStatus.docVerified = result.isApproved;
        userStatus.docVerifiedAt = new Date().toISOString();
        userStatus.docType = result.documentType;
        userStatus.docName = result.fullName;
      }
      localStorage.setItem('movilidad_user_verification', JSON.stringify(userStatus));
    } catch(e) {
      console.error('[Didit] Error saving result:', e);
    }
  }

  function getVerificationStatus() {
    try {
      return JSON.parse(localStorage.getItem('movilidad_user_verification') || '{}');
    } catch(e) {
      return {};
    }
  }

  function getVerificationResults() {
    try {
      return JSON.parse(localStorage.getItem('movilidad_didit_results') || '{}');
    } catch(e) {
      return {};
    }
  }

  function getSessions() {
    try {
      return JSON.parse(localStorage.getItem('movilidad_didit_sessions') || '[]');
    } catch(e) {
      return [];
    }
  }

  // ---- Clear verification data ----
  function clearVerificationData() {
    localStorage.removeItem('movilidad_didit_sessions');
    localStorage.removeItem('movilidad_didit_results');
    localStorage.removeItem('movilidad_user_verification');
  }

  // ---- Passenger INE Verification Flow ----
  async function verifyPassengerINE(ineData) {
    // Step 1: Verify INE against government registry
    const ineResult = await verifyINE(ineData);

    if (ineResult.error) {
      return { error: ineResult.error, step: 'ine_registry' };
    }

    // If INE matches, mark as verified
    if (ineResult.isVerified) {
      return {
        success: true,
        message: 'INE verificada exitosamente contra el registro del INE',
        matchType: ineResult.matchType,
        step: 'ine_registry'
      };
    }

    // If no match, still save the attempt
    return {
      success: false,
      message: 'La INE no pudo ser verificada contra el registro. Se requiere revisión manual.',
      matchType: ineResult.matchType,
      step: 'ine_registry'
    };
  }

  // ---- Driver Full Verification Flow ----
  async function verifyDriverDocuments(driverData) {
    const results = {
      ine: null,
      license: null,
      overall: false
    };

    // Step 1: INE verification against government registry
    if (driverData.ine) {
      results.ine = await verifyINE(driverData.ine);
    }

    // Step 2: Document OCR verification (license, etc.)
    if (driverData.licenseFront) {
      results.license = await verifyDocument(
        driverData.licenseFront,
        driverData.licenseBack || null,
        {
          vendorData: driverData.vendorData || `movilidad-driver-${Date.now()}`,
          metadata: { doc_type: 'driver_license', app_type: 'driver' }
        }
      );
    }

    // Overall status
    results.overall = (results.ine?.isVerified || results.ine?.success) &&
                      (results.license?.isApproved || !driverData.licenseFront);

    return results;
  }

  // ---- Public API ----
  return {
    init,
    loadConfig,
    isConfigured,
    createSession,
    verifyINE,
    verifyDocument,
    getSessionDecision,
    startHostedVerification,
    openVerificationIframe,
    openUniLinkIframe,
    verifyPassengerINE,
    verifyDriverDocuments,
    getVerificationStatus,
    getVerificationResults,
    getSessions,
    clearVerificationData
  };
})();

// Auto-load config on script load
document.addEventListener('DOMContentLoaded', () => {
  DiditVerify.loadConfig();
  console.log('[Didit] Auto-loaded config. Configured:', DiditVerify.isConfigured());
});
