// Security middleware configuration for Dayli App
// This configures the Content Security Policy (CSP) and other security headers

const securityConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", // For styled-components
        "https://cdn.jsdelivr.net", 
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: [
        "'self'", 
        "data:", 
        "https://play.min.io", // MinIO server
        "https://*.s3.amazonaws.com", // Amazon S3
        "https://*.googleapis.com",
        "https://*.gstatic.com",
        "https://firebasestorage.googleapis.com"
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        "https://play.min.io", // MinIO server
        "https://*.s3.amazonaws.com", // Amazon S3
        "https://*.firebaseio.com",
        "https://*.googleapis.com",
        "wss://*.firebaseio.com",
        "https://firestore.googleapis.com",
        "https://firebase.googleapis.com"
      ],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },

  // Configure other security headers
  strictTransportSecurity: {
    maxAge: 63072000, // 2 years in seconds
    includeSubDomains: true,
    preload: true
  },
  
  xFrameOptions: {
    action: 'deny' // Prevents embedding in iframes
  },
  
  xContentTypeOptions: {
    // Prevents browsers from MIME-sniffing a response away from the declared content-type
    noSniff: true 
  },
  
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  
  permissionsPolicy: {
    features: {
      geolocation: ["'none'"],
      camera: ["'none'"],
      microphone: ["'none'"],
      accelerometer: ["'none'"],
      autoplay: ["'none'"],
      gyroscope: ["'none'"],
      magnetometer: ["'none'"],
      payment: ["'none'"]
    }
  }
};

module.exports = securityConfig;
