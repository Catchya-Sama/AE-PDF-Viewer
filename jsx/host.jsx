// ============================================================
// host.jsx — ExtendScript host bridge for PDF Viewer (CEP 9 / AE 2020)
// Loaded by CEP via manifest <ScriptPath>. Provides functions
// that the React panel can call through CSInterface.evalScript().
// ============================================================

// Config object - read from global set by CEP or use fallback
var config = (typeof __CEP_CONFIG__ !== 'undefined') ? __CEP_CONFIG__ : {
    productName: 'PDF Viewer',
    userDataFolder: 'com.catchya.pdfviewer',
    eventPrefix: 'com.catchya.pdfviewer.jsx',
    bundleId: 'com.catchya.pdfviewer'
};

var scriptName = config.productName;
var os = $.os;

// global vars
var curReactComp = "";
var appDataPath = "";

// ------------------------------------------------------------------
// Basic initialization (called explicitly, NOT at top-level)
// ------------------------------------------------------------------

function init() {
    try {
        var appVersion = parseFloat(app.version);

        // Setup user data paths
        if ($.os.indexOf("Windows") !== -1) {
            appDataPath = Folder.userData.toString() + "/" + config.userDataFolder;
        } else {
            appDataPath = Folder.userData.toString() + "/" + config.userDataFolder;
        }

        // AE-only: version check
        if (typeof app.project !== "undefined") {
            if (appVersion < 17) {
                alert(config.productName + " requires After Effects 2020 (v17.0) or higher.");
                return;
            }
            storeCurComp();
        }

    } catch (err) {
        logError(err);
    }
}

// Error logging function
function logError(errorMessage) {
    try {
        if (appDataPath !== "") {
            var errorLog = new File(appDataPath + "/" + config.userDataFolder + ".log");
            errorLog.open("a");
            errorLog.writeln(new Date().toString() + ": " + errorMessage);
            errorLog.close();
        }
    } catch (e) {
        $.writeln("CEP Error: " + errorMessage);
    }
}

// Console output function
if (typeof writeLn === 'undefined') {
    function writeLn(message) {
        try {
            $.writeln(config.productName + ": " + message);
        } catch (e) {
            // Silent fallback
        }
    }
}

// ------------------------------------------------------------------
// Core functions that CEP panel will call
// ------------------------------------------------------------------

// Store current comp so we can restore focus after panel interactions
function storeCurComp() {
    try {
        if (app.project && app.project.activeItem !== null) {
            if (app.project.activeItem instanceof CompItem) {
                curReactComp = app.project.activeItem.name;
            }
        }
    } catch (err) {
        logError("Error storing current comp: " + err.toString());
    }
}

// Restore comp focus
function reselectComp() {
    try {
        if (curReactComp !== "") {
            for (var i = 1; i <= app.project.numItems; i++) {
                if (app.project.item(i) instanceof CompItem) {
                    if (app.project.item(i).name === curReactComp) {
                        app.project.item(i).openInViewer();
                        break;
                    }
                }
            }
        }
    } catch (err) {
        logError("Error reselecting comp: " + err.toString());
    }
}

// Return host info to the panel (called via evalScript)
// NOTE: ExtendScript (ES3) has no JSON object — build string manually
function getHostInfo() {
    try {
        var projectName = (app.project && app.project.file) ? app.project.file.name : "";
        var projectFile = (app.project && app.project.file) ? app.project.file.fsName : "";
        
        // Build JSON string manually (no JSON.stringify in ES3)
        var json = '{"appName":"' + app.appName + '"' +
                   ',"appVersion":"' + app.version + '"' +
                   ',"os":"' + $.os + '"' +
                   ',"projectFile":"' + projectFile + '"' +
                   ',"projectName":"' + projectName + '"' +
                   ',"userDataPath":"' + appDataPath + '"}';
        return json;
    } catch (err) {
        logError("Error getting host info: " + err.toString());
        return '{"error":"' + err.toString() + '"}';
    }
}

// Ping function for testing bridge connectivity
function ping() {
    return "pong";
}