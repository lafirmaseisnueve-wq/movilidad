/* ================================================================
   MOVILIDAD - Didit Identity Verification Integration
   By TheFirm69 Systems
   
   Integrates with https://business.didit.me/ for:
   - KYC Session creation (hosted biometric verification flow)
     - INE photo capture (front + back)
     - Selfie with liveness detection
     - OCR extraction + INE registry validation
     - Facial comparison (selfie vs INE portrait)
   - Session decision retrieval
   
   ALL verifications are BIOMETRIC (photo/selfie + OCR + liveness)
   No text-based registry queries — the Didit hosted session
   handles everything in one seamless flow.
   
   API Docs: https://docs.didit.me/api-reference/overview
   ================================================================ */

const DiditVerify = (() => {
  // ---- Configuration ----
  const DIDIT_BASE_URL = 'https://verification.didit.me';
  const DIDIT_V3_SESSION = '/v3/session/';
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
          console.log('[Didit] Config loaded. API Key:', _apiKey ? '✓' : '✗', 'Workflow:', _workflowId ? '✓' : '✗');
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

  // ---- KYC Session (Hosted Biometric Verification Flow) ----
  // This is the PRIMARY verification method.
  // Creates a hosted session where the user:
  // 1. Photographs their INE (front + back)
  // 2. Takes a selfie with liveness detection
  // 3. System performs: OCR + INE registry validation + facial comparison
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
      vendor_data: params.vendorData || `movilidad-${params.appType || 'user'}-${Date.now()}`,
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

    console.log('[Didit] Creating KYC session for:', params.appType || 'user');

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
        console.log('[Didit] Session created:', data.session_id);
        return { success: true, session: data };
      }

      console.error('[Didit] Session creation failed:', response.status, data);
      return { error: data.detail || data.error || 'Failed to create session', status: response.status };
    } catch(e) {
      console.error('[Didit] Session creation error:', e);
      return { error: 'Network error: ' + e.message };
    }
  }

  // ---- Start Hosted Verification (for iframe/redirect) ----
  // This is the main entry point for biometric verification.
  // Creates a session and returns the URL for the hosted verification flow.
  async function startHostedVerification(params = {}) {
    const appType = typeof params === 'string' ? params : (params.appType || 'passenger');
    const sessionParams = {
      ...params,
      appType: appType
    };

    const sessionResult = await createSession(sessionParams);

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

  // ---- Get Session Decision ----
  // After the user completes the biometric verification flow,
  // call this to get the decision (approved/rejected/pending).
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
        // Save the verification result locally
        const isApproved = data.status === 'approved' || data.decision === 'Approved';
        _saveVerificationResult('biometric', {
          success: isApproved,
          status: data.status,
          sessionId: sessionId,
          decision: data,
          isVerified: isApproved
        });
        return { success: true, decision: data };
      }

      return { error: data.detail || 'Failed to get decision', status: response.status };
    } catch(e) {
      console.error('[Didit] Get decision error:', e);
      return { error: 'Network error: ' + e.message };
    }
  }

  // ---- Open Verification in iframe (Legacy - kept for compatibility) ----
  function openVerificationIframe(verificationUrl, sessionToken, options = {}) {
    // Use the full-screen overlay approach instead of container-based
    _openFullscreenOverlay(verificationUrl, sessionToken, options);
    return true;
  }

  // ---- Full-screen overlay for Didit verification ----
  function _openFullscreenOverlay(verifyUrl, sessionId, options = {}) {
    // Remove any existing overlay
    const existing = document.getElementById('didit-verify-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'didit-verify-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;background:rgba(0,0,0,.95);display:flex;flex-direction:column;';

    const appLabel = options.appType === 'driver' ? 'Verificación de Conductor' : 'Verificación de Identidad';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#7C3AED;color:white;';
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <i class="fas fa-shield-alt"></i>
        <span style="font-weight:700;font-size:14px;">${appLabel}</span>
      </div>
      <button id="didit-overlay-close-btn" style="background:rgba(255,255,255,.2);border:none;color:white;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">
        <i class="fas fa-times"></i> Cerrar
      </button>
    `;

    const iframe = document.createElement('iframe');
    iframe.src = verifyUrl;
    iframe.style.cssText = 'flex:1;width:100%;border:none;';
    iframe.allow = 'camera; microphone; fullscreen; autoplay; encrypted-media';
    iframe.id = 'didit-verify-iframe';

    overlay.appendChild(header);
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    // Close button handler
    document.getElementById('didit-overlay-close-btn').onclick = () => {
      overlay.remove();
      if (options.onClose) options.onClose(sessionId);
    };

    // Listen for completion messages from Didit
    const messageHandler = (e) => {
      if (e.data && (e.data.type === 'didit-verification-complete' || e.data.status === 'completed' || e.data.event === 'verification.completed')) {
        window.removeEventListener('message', messageHandler);
        overlay.remove();
        if (options.onComplete) options.onComplete(sessionId);
      }
    };
    window.addEventListener('message', messageHandler);

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

      // Update the user verification status
      const userStatus = JSON.parse(localStorage.getItem('movilidad_user_verification') || '{}');
      if (type === 'biometric') {
        userStatus.ineVerified = result.isVerified;
        userStatus.ineVerifiedAt = new Date().toISOString();
        userStatus.docVerified = result.isVerified;
        userStatus.docVerifiedAt = new Date().toISOString();
        userStatus.verificationMethod = 'biometric_kyc';
        userStatus.sessionId = result.sessionId;
      } else if (type === 'ine') {
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

  // ---- Legacy methods (kept for backward compatibility, not used in UI) ----
  // These are kept in case the Admin Panel or other parts reference them,
  // but the primary flow is biometric KYC sessions only.

  async function verifyINE(ineData = {}) {
    console.warn('[Didit] verifyINE() is deprecated — use startHostedVerification() for biometric verification');
    if (!isConfigured()) {
      return { error: 'Didit API Key not configured. Go to Admin Panel → API Config → Didit Verification.' };
    }

    const formData = new FormData();
    formData.append('issuing_state', 'MEX');
    formData.append('services', 'mex_ine_vigencia');
    formData.append('vendor_data', ineData.vendorData || `movilidad-ine-${Date.now()}`);

    if (ineData.cic) formData.append('cic', ineData.cic);
    if (ineData.ocr) formData.append('ocr', ineData.ocr);
    if (ineData.voterNumber) formData.append('voter_number', ineData.voterNumber);
    if (ineData.emissionNumber) formData.append('emission_number', ineData.emissionNumber);
    if (ineData.firstName) formData.append('first_name', ineData.firstName);
    if (ineData.lastName) formData.append('last_name', ineData.lastName);
    if (ineData.dateOfBirth) formData.append('date_of_birth', ineData.dateOfBirth);

    try {
      const response = await fetch(DIDIT_BASE_URL + '/v3/database-validation/', {
        method: 'POST',
        headers: { 'x-api-key': _apiKey },
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

  async function verifyDocument(frontImage, backImage = null, options = {}) {
    console.warn('[Didit] verifyDocument() is deprecated — use startHostedVerification() for biometric verification');
    if (!isConfigured()) {
      return { error: 'Didit API Key not configured. Go to Admin Panel → API Config → Didit Verification.' };
    }

    const formData = new FormData();
    formData.append('front_image', frontImage);
    if (backImage) formData.append('back_image', backImage);
    formData.append('perform_document_liveness', 'true');
    formData.append('save_api_request', 'true');
    formData.append('vendor_data', options.vendorData || `movilidad-doc-${Date.now()}`);
    if (options.minimumAge) formData.append('minimum_age', options.minimumAge.toString());
    if (options.metadata) formData.append('metadata', JSON.stringify(options.metadata));

    try {
      const response = await fetch(DIDIT_BASE_URL + '/v3/id-verification/', {
        method: 'POST',
        headers: { 'x-api-key': _apiKey },
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
          isApproved: data.id_verification?.status === 'Approved',
          requestId: data.request_id,
          raw: data
        };
        _saveVerificationResult('document', result);
        return result;
      }

      return { error: data.detail || 'Document verification failed', status: response.status };
    } catch(e) {
      console.error('[Didit] Document verification error:', e);
      return { error: 'Network error: ' + e.message };
    }
  }

  async function verifyPassengerINE(ineData) {
    console.warn('[Didit] verifyPassengerINE() is deprecated — use startHostedVerification() for biometric verification');
    return await verifyINE(ineData);
  }

  async function verifyDriverDocuments(driverData) {
    console.warn('[Didit] verifyDriverDocuments() is deprecated — use startHostedVerification() for biometric verification');
    const ine = driverData.ine || driverData;
    return await verifyINE(ine);
  }

  // ---- Public API ----
  return {
    init,
    loadConfig,
    isConfigured,
    createSession,
    startHostedVerification,
    getSessionDecision,
    openVerificationIframe,
    openUniLinkIframe,
    getVerificationStatus,
    getVerificationResults,
    getSessions,
    clearVerificationData,
    // Legacy methods (deprecated — use startHostedVerification instead)
    verifyINE,
    verifyDocument,
    verifyPassengerINE,
    verifyDriverDocuments
  };
})();

// Auto-load config on script load
document.addEventListener('DOMContentLoaded', () => {
  DiditVerify.loadConfig();
  console.log('[Didit] Auto-loaded config. Configured:', DiditVerify.isConfigured());
});
