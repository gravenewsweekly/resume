// Advanced Security Measures
document.addEventListener('DOMContentLoaded', function() {
    // Enable security overlay
    const securityOverlay = document.getElementById('security-overlay');
    securityOverlay.style.display = 'block';
    
    // Disable right click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        logSecurityEvent('Right click disabled', e);
        return false;
    });
    
    // Disable keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
            e.preventDefault();
            logSecurityEvent('Developer tools shortcut disabled', e);
            banIP();
            return false;
        }
        
        // Disable Ctrl+U (View source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            logSecurityEvent('View source disabled', e);
            banIP();
            return false;
        }
    });
    
    // Detect and prevent DevTools opening
    let devToolsOpen = false;
    
    function detectDevTools() {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        if ((widthThreshold || heightThreshold) && !devToolsOpen) {
            devToolsOpen = true;
            logSecurityEvent('Developer tools detected', { type: 'size detection' });
            banIP();
            window.location.href = 'about:blank';
        }
    }
    
    setInterval(detectDevTools, 500);
    
    // Prevent console usage
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
    };
    
    function overrideConsole() {
        console.log = function() {
            logSecurityEvent('Console.log attempted', arguments);
            banIP();
        };
        console.warn = function() {
            logSecurityEvent('Console.warn attempted', arguments);
            banIP();
        };
        console.error = function() {
            logSecurityEvent('Console.error attempted', arguments);
            banIP();
        };
        console.info = function() {
            logSecurityEvent('Console.info attempted', arguments);
            banIP();
        };
    }
    
    overrideConsole();
    
    // Log security events (in a real app, this would send to a server)
    function logSecurityEvent(event, details) {
        const timestamp = new Date().toISOString();
        const eventData = {
            event,
            details,
            timestamp,
            userAgent: navigator.userAgent,
            ip: 'IP_LOGGED' // In a real app, you'd get this from the server
        };
        
        // In a real app, you'd send this to your server
        console.originalLog('Security Event:', eventData);
    }
    
    // Simulate IP banning (in a real app, this would be handled server-side)
    function banIP() {
        logSecurityEvent('IP Ban Triggered', { reason: 'Security violation' });
        
        // In a real implementation, you would:
        // 1. Send the IP to your server to be banned
        // 2. Store a persistent ban in localStorage/sessionStorage
        // 3. Redirect to a banned page
        
        // For this prototype, we'll just show an alert and prevent further interaction
        alert('SECURITY VIOLATION DETECTED! YOUR IP HAS BEEN BANNED!');
        document.body.innerHTML = `
            <div style="background-color: black; color: red; padding: 20px; text-align: center; height: 100vh;">
                <h1>ACCESS DENIED</h1>
                <p>Your IP address has been banned due to a security violation.</p>
                <p>All attempts to bypass security measures have been logged.</p>
                <p>If this is an error, please contact support.</p>
            </div>
        `;
        
        // Prevent any further interaction
        document.body.style.pointerEvents = 'none';
    }
    
    // Protect against iframe embedding
    if (window !== window.top) {
        logSecurityEvent('Framing attempt detected', { location: window.location.href });
        window.top.location.href = window.location.href;
    }
    
    // Store original console methods for debugging (but don't expose them)
    console.originalLog = originalConsole.log;
    console.originalWarn = originalConsole.warn;
    console.originalError = originalConsole.error;
    console.originalInfo = originalConsole.info;
    
    // Additional protection: Detect debugger statements
    function detectDebugger() {
        const startTime = performance.now();
        debugger;
        const endTime = performance.now();
        
        if (endTime - startTime > 100) {
            logSecurityEvent('Debugger detected', { detectionTime: endTime - startTime });
            banIP();
        }
    }
    
    // Run debugger detection periodically
    setInterval(detectDebugger, 10000);
    detectDebugger();
    
    // Obfuscate JavaScript (in a real app, you'd use proper obfuscation tools)
    // This is just a simple example
    function obfuscate() {
        return;
        // This function is intentionally confusing
        const a = ['l', 'o', 'g'];
        const b = a.join('');
        console[b] = function() {};
    }
    obfuscate();
});
