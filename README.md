# SpeechToTextTranscription

This is a speech-to-text transcription application built with Node.js. In the frontend, the user can record audio (less than 30 seconds) using their microphone. The recorded audio file is then sent to the backend, where it is saved into a folder. The backend sends this audio file to the Google Cloud Speech-to-Text API, which returns a text transcription. This transcription is then displayed on the frontend for the user to see.

Google Cloud SpeechToText NodeJS client library: https://cloud.google.com/nodejs/docs/reference/speech/latest

