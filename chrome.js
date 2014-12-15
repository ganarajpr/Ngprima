var Chrome = require('chrome-remote-interface');
Chrome(function (chrome) {
    with (chrome) {
        Timeline.start();
        on('Timeline.eventRecorded', onExecutionContextCreated);
        Network.enable();
        Page.enable();
        Page.navigate({'url': 'http://localhost:8080'});
    }
}).on('error', function () {
    console.error('Cannot connect to Chrome');
});


function onExecutionContextCreated(){
    console.log(JSON.stringify(arguments));
}