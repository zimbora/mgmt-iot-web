# Changelog

## version 1.0.61
  - Small refactor to db queries and struct shared with frontend.
  - Fixes graph display
  - Depends on mqtt-devices-parser v1.0.13

## version 1.0.60
  - supports request to send MQTT message and gets response from to device

## version 1.0.59
  recovers call /device/${deviceId}/info for dashboard compatibility
  
## version 1.0.58
  Enhancements
    - devices:
      - Adds: method to get devices with changes from date x
      - Adds: property owner field
      - Changes: get devices where client has permissions greater than level 3
      - Redefines: device storage into project, fw and model.
      - Supports: query only one field from logs table
      - fine-tune device access
    - fw upload
      - limits file size to 4MB
      - improves error handling
  Bug fixes
    - server/models/devices: fixes get info query
    - server/routes/index: fixes api status call
    - fixes model deletion

## version 1.0.57
  - fixes NODE_ENV var
  - changes fw release names
  - fixes device deletion
  - Requests "tech" from db and uses it to display Wifi credentials

## version 1.0.56
  - fixes pre version
  
## version 1.0.55
  - fixes pre version

## version 1.0.54
  - fixes pre version

## version 1.0.53
  - Store firmware uploads on volume

## version 1.0.52
  - Adds CRC16 modbus and CRC32 to file transfer "firmware/" folder

## version 1.0.51
  - FTP: supports passive connections
  - FTP: allows enable or disable of download and upload methods
  - FTP: working locally
  - FTP: hard to configure with nginx
  - FTP: adds download test

## version 1.0.50
  - access safely to settings pass as arg to init call

## version 1.0.49
  - changes init(arg_name)

## version 1.0.48
  - Adds FTP server - 1st draft, basic auth

## version 1.0.47
  - Files are stored with the original filename
  - Adds link to download firmware on front-end

## version 1.0.46
  - Show sensors on device page
  - Improves model editing sensors

## version 1.0.45
  - Allows adding sensors to model configuration

## version 1.0.44
  - supporting mqtt sensors definition (in development)
  - testing github action

## version 1.0.43
  - fixes 1.0.42 express-web file, line 455

## version 1.0.42
  - device/:device_id/.. - changes redirect
  - collect data - keep action if no sensors were found for the respective model
  - change settings device ref logic on settings.ejs file

## version 1.0.41
  - removes dependencies from external libraries

## version 1.0.40
 - adds display module for devices and sensors logs
 - collects sensors data on device request

## version 1.0.39
 - allows enable/disable ARs, Alarms, JSCode, Firmwares

## version 1.0.38
 - shows packages versions on sidebar

## version 1.0.37
 - Supports references to other devices in order to use their configuration
 - shows device list on model tab as entry index

## version 1.0.36
 - associates firmwares to models
 - shows more data on dashboard
 - shows model on devices
 - changes tab firmwares to models

## version 1.0.35
 - adds projects and models table
 - fixes auth with low permissions
 - adds model to devices list

## version 1.0.34
 - Stable version, all features are expected to be working.

## version 1.0.33
 - fixes MQTT ssl connection

## version 1.0.32
 - fixes Ars, Alarms, JScode and access pages

## version 1.0.31
 - changes mysql tables and queries
 - adds deploy command to sync mysql tables

## version 1.0.30
 - check if network vars exist

## version 1.0.28
 - fixes db connections

## version 1.0.27
 - pass db parameter to limit db connections

## version 1.0.26
 - pass docker container name for dashboard through env

## version 1.0.25
 - supports docker API and mqtt client. Get docker container db statistics from mqtt and represents on dashboard

## version 1.0.24
 - Only documentation was added to readme file

## version 1.0.23
 - formats received JSON struct for ARs and Alarms

## version 1.0.22
 - changes cookie-express by session-express
 - verify IP and user agent on authentication

## Version 1.0.21
- adds functionality to allow associate client to device and remove client from device
- fixes client_list table

## Version 1.0.20
- hides passwords
- fixes number of clients and users - dashboard

## Version 1.0.19
- adds icon to delete devices
- improves layout responsiveness
- adds mysql traffic do dashboard

## Version 1.0.18
- allows change user type of each client, shows name and avatar when signed with google
- supports gauth login

## Version 1.0.17
- changes release field in firmware table to fw_release; edits respectives files to accommodate the new change

## Version 1.0.16
- version to check if firmware download and upload was fixed (it was)

## Version 1.0.15
- fixes model forcing on express-web

## Version 1.0.14
- add logs for fileupload (already deleted for future versions)

## Version 1.0.13
 - remove debug logs
 - adds modem support
 - fixes Autorequests, Alarms and JSCode acknowledgment

## Version 1.0.12
 - adds some debug logs

## Version 1.0.11
 - supports mqtt over wss on https connections

## Version 1.0.10
 - Not useful

## Version 1.0.9
  - fixes json struct send msg for alarms and ARs, adds new field on db for setpoints JSON file
  - fixes null responses for device info

## Version 1.0.8
  - adds port var to mysql connection

## Version 1.0.7
  - supports fw and app version control

## Version 1.0.6
 - RS485 module removed

## Version 1.0.5
  - Security issue fix

## Version 1.0.4
  - supports keepalive and log read in device/settings page
  - adds main dashboard, removes db packets out of order warning

## Version 1.0.3
  - Supports firmware download with md5 and SHA256 token validation
  - HTTPS not tested
