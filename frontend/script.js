let mediaRecorder;
let audioBlobChunks = [];

const openMediaDevice = async (requiredDevices) => {
    return await navigator.mediaDevices.getUserMedia(requiredDevices);
}

document.getElementById('startRecording').addEventListener('click', async () => {
    try {
        const mediaStreamObj = await openMediaDevice({'audio':true}); // MediaStream obj

        mediaRecorder = new MediaRecorder(mediaStreamObj); 
    
        mediaRecorder.start();
        document.getElementById('stopRecording').disabled = false;
        document.getElementById('startRecording').disabled = true;

        mediaRecorder.ondataavailable = (blobEvent) => {
            audioBlobChunks.push(blobEvent.data);
            // console.log(blobEvent); 
            // console.log(blobEvent.data); // blob object 
        };
        // console.log(audioBlobChunks);

    }catch(error)
    {
        console.error('Error accessing audio device',error);
    }
});

document.getElementById('stopRecording').addEventListener('click', async () => {

    mediaRecorder.stop();
    document.getElementById('stopRecording').disabled = true;
    document.getElementById('startRecording').disabled = false;

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioBlobChunks, { type: 'audio/webm;codecs=opus' }); 
        const audioUrl = URL.createObjectURL(audioBlob); 
        document.getElementById('audioPlayback').src = audioUrl; 
        document.getElementById('playAudio').disabled = false; 

        const formData = new FormData();
        formData.append('recordedAudio', audioBlob, 'myAudio.webm');
        // console.log(audioBlob);
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            // console.log("Script.js response object: ",response);
            
            if(!response.ok)
            {
                const errorText = await response.text();
                alert(errorText);
            }
            const resData = await response.json();
            console.log("MyResult:",resData);

            document.getElementById('transcriptionBox').value = resData.transcriptionText;
            document.getElementById('confidenceValueId').textContent = " " + resData.confidenceValue;
            document.getElementById('percentageSymbol').textContent = "%";


        } catch (error) {
            console.error("Error while handling the speech recognition:", error);
            document.getElementById('transcription').value = "Error while handling the speech recognition";
        }
    };
});


document.getElementById('playAudio').addEventListener('click', () => {
    document.getElementById('audioPlayback').play();
});