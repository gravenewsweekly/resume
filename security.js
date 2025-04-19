document.addEventListener('DOMContentLoaded', function () {
    // Initialize security overlay (briefly shown for retro effect)
    const securityOverlay = document.getElementById('security-overlay');
    securityOverlay.style.display = 'block';
    setTimeout(() => {
        securityOverlay.style.display = 'none';
    }, 1000); // Hide after 1 second for retro "loading" vibe

    // Security event logging (client-side, simulates server-side logging)
    function logSecurityEvent(event, details) {
        const timestamp = new Date().toISOString();
        const eventData = {
            event,
            details,
            timestamp,
            userAgent: navigator.userAgent,
            ip: 'CLIENT_IP', // Placeholder; real IP logging requires server-side
            sessionId: generateSessionId()
        };

        // In a real app, send to a server via fetch
        if (console.originalLog) {
            console.originalLog('Security Event:', eventData);
        }

        // Store in sessionStorage for debugging (limited to session)
        const events = JSON.parse(sessionStorage.getItem('securityEvents') || '[]');
        events.push(eventData);
        sessionStorage.setItem('securityEvents', JSON.stringify(events.slice(-50))); // Keep last 50 events
    }

    // Generate a unique session ID
    function generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Simulated IP ban (client-side warning; real bans require server-side)
    function triggerSecurityWarning(reason) {
        logSecurityEvent('Security Warning Triggered', { reason });

        // Show retro-style warning
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            background: #000080; color: #ff0000; z-index: 9999;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            font-family: 'Courier New', monospace; text-align: center; padding: 20px;
        `;
        warningDiv.innerHTML = `
            <h1>⚠ SECURITY ALERT ⚠</h1>
            <p>Unauthorized activity detected: ${reason}</p>
            <p>Your actions have been logged. Please refrain from attempting to bypass security.</p>
            <p>Contact <a href="mailto:support@retroresume.site" style="color: #00ffff;">support@retroresume.site</a> if this is an error.</p>
            <button onclick="this.parentElement.remove(); document.body.style.pointerEvents = 'auto';" style="background: #c0c0c0; border: 2px outset #fff; padding: 10px; cursor: pointer;">
                Acknowledge and Continue
            </button>
        `;
        document.body.appendChild(warningDiv);
        document.body.style.pointerEvents = 'none'; // Disable interactions until acknowledged

        // Limit warnings to prevent spam
        const warnings = parseInt(sessionStorage.getItem('securityWarnings') || '0') + 1;
        sessionStorage.setItem('securityWarnings', warnings);
        if (warnings > 3) {
            escalateSecurityAction();
        }
    }

    // Escalate to simulated ban after repeated violations
    function escalateSecurityAction() {
        logSecurityEvent('Security Escalation', { reason: 'Multiple security warnings' });

        const banDiv = document.createElement('div');
        banDiv.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            background: #000; color: #ff0000; z-index: 10000;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            font-family: 'Courier New', monospace; text-align: center; padding: 20px;
        `;
        banDiv.innerHTML = `
            <h1>ACCESS DENIED</h1>
            <p>Your session has been terminated due to repeated security violations.</p>
            <p>All activities have been logged for review.</p>
            <p>Please contact <a href="mailto:support@retroresume.site" style="color: #00ffff;">support@retroresume.site</a> to resolve this issue.</p>
        `;
        document.body.innerHTML = '';
        document.body.appendChild(banDiv);
        document.body.style.pointerEvents = 'none'; // Permanently disable interactions
    }

    // Disable right-click with retro warning
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        logSecurityEvent('Right-click attempt', { target: e.target.tagName });
        triggerSecurityWarning('Right-click disabled to protect site content');
    });

    // Disable specific keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        const blockedShortcuts = [
            { key: 'F12', action: 'Developer tools' },
            { ctrl: true, shift: true, key: 'I', action: 'Inspect Element' },
            { ctrl: true, shift: true, key: 'J', action: 'Console' },
            { ctrl: true, shift: true, key: 'C', action: 'Copy Element' },
            { ctrl: true, key: 'u', action: 'View Source' }
        ];

        const isBlocked = blockedShortcuts.some(shortcut => {
            return (
                (!shortcut.ctrl || e.ctrlKey) &&
                (!shortcut.shift || e.shiftKey) &&
                e.key.toLowerCase() === shortcut.key.toLowerCase()
            );
        });

        if (isBlocked) {
            e.preventDefault();
            const shortcut = blockedShortcuts.find(s =>
                (!s.ctrl || e.ctrlKey) &&
                (!s.shift || e.shiftKey) &&
                e.key.toLowerCase() === s.key.toLowerCase()
            );
            logSecurityEvent('Keyboard shortcut blocked', { shortcut: shortcut.action });
            triggerSecurityWarning(`Attempt to open ${shortcut.action} detected`);
        }
    });

    // Detect DevTools (less aggressive, with threshold adjustment)
    let devToolsWarningIssued = false;
    function detectDevTools() {
        const threshold = 200; // Adjusted for modern browsers
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;

        if ((widthDiff > threshold || heightDiff > threshold) && !devToolsWarningIssued) {
            devToolsWarningIssued = true;
            logSecurityEvent('Potential DevTools detection', { widthDiff, heightDiff });
            triggerSecurityWarning('Developer tools may be open');
            setTimeout(() => {
                devToolsWarningIssued = false; // Allow retry after 30 seconds
            }, 30000);
        }
    }

    setInterval(detectDevTools, 1000); // Check every second

    // Protect console usage
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
    };

    function protectConsole() {
        ['log', 'warn', 'error', 'info'].forEach(method => {
            console[method] = function (...args) {
                logSecurityEvent(`Console.${method} attempt`, { args });
                triggerSecurityWarning(`Use of console.${method} detected`);
                // Still log to original console for debugging
                originalConsole[method].apply(console, args);
            };
        });
    }

    protectConsole();

    // Store original console methods securely
    console.originalLog = originalConsole.log;
    console.originalWarn = originalConsole.warn;
    console.originalError = originalConsole.error;
    console.originalInfo = originalConsole.info;

    // Prevent iframe embedding (anti-clickjacking)
    if (window !== window.top) {
        logSecurityEvent('Iframe embedding attempt', { location: window.location.href });
        triggerSecurityWarning('Unauthorized framing detected');
        setTimeout(() => {
            window.top.location.href = window.location.href; // Redirect top window
        }, 1000);
    }

    // Detect debugger usage (less aggressive)
    function detectDebugger() {
        const startTime = performance.now();
        let i = 0;
        while (i < 1000) i++; // Simulate light computation
        const endTime = performance.now();

        if (endTime - startTime > 50) { // Adjusted threshold
            logSecurityEvent('Potential debugger detected', { detectionTime: endTime - startTime });
            triggerSecurityWarning('Debugger usage detected');
        }
    }

    setInterval(detectDebugger, 15000); // Check every 15 seconds
    detectDebugger();

    // Basic script obfuscation placeholder
    function obfuscateScripts() {
        // In a real app, use tools like JavaScript Obfuscator
        // This is a placeholder to maintain retro "protection" vibe
        const decoy = ['c', 'o', 'n', 's', 'o', 'l', 'e'];
        const trap = decoy.join('');
        window[trap] = function () {
            logSecurityEvent('Decoy console access', {});
            triggerSecurityWarning('Unauthorized script access');
        };
    }
    obfuscateScripts();

    // Monitor DOM mutations for unauthorized changes
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const suspicious = Array.from(mutation.addedNodes).some(node =>
                    node.nodeName === 'SCRIPT' || node.nodeName === 'IFRAME'
                );
                if (suspicious) {
                    logSecurityEvent('Suspicious DOM mutation', { mutation });
                    triggerSecurityWarning('Unauthorized DOM modification detected');
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Rate-limit security triggers to prevent abuse
    let lastTrigger = 0;
    function rateLimitSecurityTrigger() {
        const now = Date.now();
        if (now - lastTrigger < 1000) {
            return false; // Prevent triggers within 1 second
        }
        lastTrigger = now;
        return true;
    }

    // Override triggerSecurityWarning to include rate-limiting
    const originalTriggerSecurityWarning = triggerSecurityWarning;
    triggerSecurityWarning = function (reason) {
        if (rateLimitSecurityTrigger()) {
            originalTriggerSecurityWarning(reason);
        }
    };
});
