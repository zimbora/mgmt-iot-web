# Changelog

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
