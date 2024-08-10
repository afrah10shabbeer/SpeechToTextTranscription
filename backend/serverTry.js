const express = require('express');
const multer = require('multer'); // For handling file uploads
const path = require('path'); // For working with file and directory paths
const fs = require('fs'); // For file system operations

const { SpeechClient } = require('@google-cloud/speech'); // Client library for speech to text

const app = express();
const client = new SpeechClient(); // Initialize Google Cloud Speech client

require('dotenv').config();


// multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, '../frontend')));

// Define a POST route 
app.post('/uploadNot', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Access the file buffer directly
    const audioBuffer = req.file.buffer; 
    console.log(`File uploaded, buffer length: ${audioBuffer.length}`);

    try {
        const audioBytes = audioBuffer.toString('base64');

        // Build the request for Google Cloud Speech-to-Text API
        const request = {
            audio: {
                content: audioBytes,
            },
            config: {
                encoding: 'LINEAR16', 
                languageCode: 'en-US', 
            },
        };

        // Send the request to the Speech-to-Text API and get the response
        const [response] = await client.recognize(request);

        // Extract and join the transcriptions from the response
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');

        // Send the transcription back to the client
        console.log(`Transcription: ${transcription}`);
        res.send(`Transcription: ${transcription}`);

    } catch (error) {
        res.status(500).send('Error during speech recognition.');
    }
});

const port = 3000; 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
