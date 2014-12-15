var Chrome = require('chrome-remote-interface');
Chrome(function (chrome) {
    with (chrome) {
        Debugger.enable();
        on('Debugger.paused', function onDebuggerPaused(){
            console.log(JSON.stringify(arguments));
            chrome.Debugger.resume();
        });
        on('Debugger.resumed', function onDebuggerResumed(){
            console.log(JSON.stringify(arguments));
            chrome.Debugger.pause();
        });
        Network.enable();
        Page.enable();
        Page.navigate({'url': 'http://localhost:8080'});
        Debugger.pause();



    }
}).on('error', function () {
    console.error('Cannot connect to Chrome');
});


