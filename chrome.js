var Chrome = require('chrome-remote-interface');
Chrome(function (chrome) {
    with (chrome) {
        Runtime.enable();
        /*on('Runtime.executionContextCreated',function(){
            console.log(JSON.stringify(arguments));
        });*/
        var previousCallFrameId;
        Debugger.enable();
        Debugger.pause();
        on('Debugger.paused', function onDebuggerPaused(response) {

            /*chrome.Debugger.getBacktrace(null,function(a){
             console.log(arguments);

             });*/
            //console.log(response);
            if(response.callFrames[0].callFrameId !== previousCallFrameId){
                previousCallFrameId = response.callFrames[0].callFrameId;
                console.log(response.callFrames[0].functionName);

                if(response.callFrames[0].scopeChain[0].object.className !== 'Window'){
                    chrome.Runtime.getProperties({'objectId':response.callFrames[0].scopeChain[0].object.objectId},function(err,resp){
                        resp.result.forEach(function(res){
                            console.log(res.name);
                        });
                        chrome.Debugger.stepOver(null,function(){
                            console.log(arguments);
                        });
                    });
                }
                else{
                    //chrome.Debugger.resume();
                    chrome.Debugger.stepOver(null,function(){
                        console.log(arguments);
                    });
                }
            }
            else{
                chrome.Debugger.stepOver(null,function(){
                    console.log(arguments);
                });
            }



            /*response.callFrames.forEach(function(callFrame){
                callFrame.scopeChain.forEach(function(scope){
                    chrome.Runtime.getProperties({'objectId':scope.object.objectId},function(err,resp){
                        resp.result.forEach(function(res){
                            console.log(res.name,'=',res.value);
                        });
                    });
                });
            });*/


        });

        Network.enable();
        Page.enable();
        Page.navigate({'url': 'http://localhost:8080/test.html'});




    }
}).on('error', function () {
    console.error('Cannot connect to Chrome');
});


