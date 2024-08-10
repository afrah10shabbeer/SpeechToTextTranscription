const express = require('express');
const multer = require('multer'); 
const path = require('path'); 
const fs = require('fs');
const { SpeechClient } = require('@google-cloud/speech'); 

require('dotenv').config();

const app = express();
const client = new SpeechClient(); 

const uploadDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: function(req, file, callbackFunc){
        // console.log(file.originalname);
        const uniqueFileName = Date.now() + path.extname(file.originalname);
        callbackFunc(null, uniqueFileName);
    }
});

const multerInstance = multer({ storage: storage });

app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/upload', multerInstance.single('recordedAudio'), async (req, res) => {
    // console.log(req);
    if (!req.file) {
        return res.status(400).send("Error: No file uploaded.");
    }

    const filePath = req.file.path; 
    // console.log(`Audio File uploaded at location: ${filePath}\n`); // C:\Afrah stuff\D3V WORK\SPEECH_TO_TEXT\uploads\1722495634193.webm

    try {
        // const file = fs.readFileSync("C:\\Afrah stuff\\D3V WORK\\SPEECH_TO_TEXT\\uploads\\1722498578899.webm");
        // var fileStats = fs.statSync("C:\\Afrah stuff\\D3V WORK\\SPEECH_TO_TEXT\\uploads\\1722498578899.webm");
        const file = fs.readFileSync(filePath); 
        var fileStats = fs.statSync(filePath);
        
        var fileSizeInBytes = fileStats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024); // 1 MB = 1024 * 1024 bytes
        if(fileSizeInMB > 1)
            return res.status(400).send('ERROR: Audio file size is greater than 1 MB');

        const audioBytes = file.toString('base64');
        // console.log(audioBytes);

        const request = {
            audio: {
                content: audioBytes,
            },
            config: {
                encoding: 'WEBM_OPUS', 
                languageCode: 'en-US', 
            },
        };

        const [response] = await client.recognize(request);
        console.log("Speech to text response:",response);

        const apiResponseResult = response.results;
        if (apiResponseResult.length === 0) 
            res.status(400).send("ERROR: No transcription results.");

        // console.log("apiResponseResult",apiResponseResult);

        let transcription = '';
        let confidenceRate = 0;

        const result = apiResponseResult[0];
        transcription += result.alternatives[0].transcript;
        confidenceRate += result.alternatives[0].confidence;

        console.log(`Transcription: ${transcription}`);
        console.log(`Confidence Rate is:${confidenceRate}`);

        const roundedPercentage = (confidenceRate * 100).toFixed(2);

        res.json({transcriptionText: transcription,confidenceValue:roundedPercentage});

    } catch (error) {
        res.status(500).send(`ERROR: ${error}`);
    }
});

const port = 3000; 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
