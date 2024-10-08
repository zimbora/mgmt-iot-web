const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
const crc = require('crc'); 

async function downloadFile() {
    const client = new ftp.Client();

    // Replace with your FTP server details
    const ftpServerUrl = '127.0.0.1'; // change it for your DNS
    const ftpPort = 21; // Ensure this matches the server port you're using
    const username = 'anonymous'; // Change if authentication is required
    const password = 'anonymous'; // Change if authentication is required

    try {
        await client.access({
            host: ftpServerUrl,
            port: ftpPort,
            user: username,
            password: password,
        });

        // Log progress for any transfer from now on.
        client.trackProgress(info => {
            console.log("File", info.name)
            console.log("Type", info.type)
            console.log("Transferred", info.bytes)
            console.log("Transferred Overall", info.bytesOverall)
        })

        console.log('Connected to the FTP server.');

        const file = "halfEG501.bin"
        const remoteFilePath = 'firmwares/'+file; // Specify the name of the file on the server
        const localFilePath = path.join(__dirname, file); // Specify local path to save the file

        // Set a new callback function which also resets the overall counter
        client.trackProgress(info => console.log(info.bytesOverall));

        await client.downloadTo(localFilePath, remoteFilePath);
        console.log(`Downloaded: ${remoteFilePath} to ${localFilePath}`);

        // Stop logging
        client.trackProgress()
    } catch (error) {
        console.error(`Error: ${error.message}`);
    } finally {
        client.close();
    }
}

downloadFile();
