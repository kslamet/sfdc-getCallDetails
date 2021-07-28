exports.handler = function(context, event, callback) {
  
    // Get Twilio Client brings Twilio authentication parameters
    const twilioClient = context.getTwilioClient();
    const phoneNumber = '+' + event.id;
    let recordingURL = 'no recording available';
    let jsonResp = '';
    
    /* Note that there are 2 actual calls - customer to Twilio, and Twilio to agent.
     For inbound, Customer to Twilio call leg duration will include IVR and waiting time.
     Agent leg will only include the duration where it starts ringing for the agent till end of the convo.
     get Call by phone number (note: recordings are stored in the agent call leg)
     Change to: "client:agentName" to get call recording. */
    twilioClient.calls.list({ status: 'completed', to: phoneNumber, limit: 1 })
        .then((call) => 
            
            //use call SID to get the call recording
            twilioClient.recordings.list({ callSid: call[0].sid, limit: 1 })
            
            //get Recording uri via recording SID
            .then((recording) => {
                
                //check if there's recording
                if(recording[0] != null){
                    recordingURL = "https://api.twilio.com/2010-04-01/Accounts/" + recording[0].accountSid + "/Recordings/" + recording[0].sid + ".mp3"
                }
                    
                   jsonResp = JSON.stringify("{'sid:'" + call[0].sid + ",'duration:'" + call[0].duration + "'recording_link': " + recordingURL + "}");
    
                //return JSON response to caller
                return callback(null, jsonResp);  
            
            })).catch((err) => {
                    console.log(err)
                    return callback(null, 'error: ' + err);
            })
    };
    
    