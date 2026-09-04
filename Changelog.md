# Changelog

## version 1.1.7
  fix: resolve unhandled promise rejection in triggerFota when only one firmware version exists (#140)
  perf: Move firmware upload UI into modal (#138)
  fix: firmware deletion failure on model firmware page (#136)
  refix: #140 fota or any mqtt message requested through API was failing for model sniffer
  perf(pages/device/mqtt): get version and app_version from device struct
  fix(pages/device/sensors): title message for read sensor
  fix: Normalize datetime handling to UTC at write-time and localize log timestamps in the browser (#142)
  fix: handle device status properly for mqtt and sensors page
  feat: Add per-topic MQTT logs action on Manage page (#144)
  fix: double JSON encoding of MQTT write payloads in browser (#146)
  fix(js/display): mqtt log messages order, remove duration


## version 1.1.6
  fix(env/index): wrong log, crashing program when gauthweb not defined on file keys

## version 1.1.5
  fix: ReferenceError in lwm2m.ejs caused by undefined `path` variable (#125)
  perf(devices): allow query sensor logs without "hour" parameter
  perf(pages/device/mqtt): remove logs from webpage
  perf(pages/models/sensors): close propagate modal without page reload (#127)
  fix: MQTT page Value column not updating on message received (#131)
  fix: FOTA firmware upload rejecting duplicate version/release across different variants (#134)
  fix: Tighten device page authorization and render forbidden access state (#129)
  perf(condif/env/index): print error if gauthweb key is not defined
  fix(pages/login): fix login gauth for localhost, port not defined

## version 1.1.4
  fix: assign template, show title on mouse hover for json text
  fix: duration display showing -1:-1:00 and chart legend overflowing modal (#115)
  fix: unhandled promise rejection in device sensor creation (#117)
  fix: sidebar text hidden on mobile (phone view) (#119)
  fix: table overflow: keep tables within container bounds with scroll (#123)

  feat: Harden MQTT FOTA flow: offline gating, attempt reset, and logs_fota visibility (#113)

## version 1.1.3
  fix(fota): wrong comparison between app_version
  perf: devices list

## version 1.1.2
  Fix device sensor creation from sensor templates (#107)
  fix(pages/device/mqtt): fix link syntax
  feat: Add variant column to device list pages (#109)
  fix: Propagate model sensor `active` and `graph` state (#111)
  ci: add Codacy coverage reporting workflow (#105)
  fix: npm vulnerabilities

## version 1.1.1
  test: Increase test coverage for low-coverage controller and route files (#103)
  fix: replace unused googleapis with google-auth-library to eliminate moderate CVEs (#91)
  fota: filter latest firmware by variant_id (#97)
  feat: persist user login across server restarts via JWT cookie (#93)
  feat: generate and persist PSK on device creation, return id/uid/psk (#87)
  feat: Add user profile page with editable fields and API token management (#89)
  fix: Remove ftp-srv and replace markdown for marked. high-risk dependencies (#84)
  fix: resolve npm vulnerabilities (brace-expansion DoS, minimatch ReDoS) (#99)
  ci: Disable babel-jest transform — project needs no transpilation (#101)
  
## version 1.1.0
  feat: adds test coverage (#71)
    All files: 81.4% statements, 66.75% branches, 88.43% functions, 81.7% lines
      - server/controllers: 80.1% statements
      - server/models: 81.82% statements
      - server/routes: 87.42% statements
  fix(models/devices): device
    - project_table and project_logs_table are still used
  feat!: add variant support for models, devices, and firmwares (#73)
  fix: FOTA modal stalling indefinitely after firmware update trigger (#70)
  fix: Add `opaque` type support to LWM2M resource validators (#74)
  ci: run test coverage on PRs and master (#76)
  Fix:  models delete `user.level` → `req.user.level` in controller (#78)
  fix: manage page wrong status button and template name display (#80)
  feat: Add dashboard view to model pages (#82)

## version 1.0.77
  
  web:
    fix: release selector: adds unknown label
    feat: Show full filename on hover in firmware list (#63)
    feat: Display modal on empty sensor logs with actionable guidance (#60)
    feat: Auto-prepend project prefix to device UID on creation (#58)
    fix: Make app_version optional in firmware upload (#68)
    feat: fotaTrigger: add version check, confirmation, and loading modal before FOTA dispatch (#66)

  api:
    feat: Add chunked MQTT message support with merge and timeout (#65)

## version 1.0.76
  fix device deletion
  
  Sensors template (#56)

    * adds a method for soft delete and disable a device
    Check if we should use it later on

    * new sensor: fix error while adding new sensor
    property "property" was not accepting empty values
    Force property to be defined if sensor is of type json

    * adds new functionality: sensorsTemplate
    on device creation associate sensors from model to device

    Creates sensorsTemplate CRUD
    Allows sensor propagation from model sensors to all associated devices

    * all sensors are now associated to each device
    Each sensor has the last reading stored in db
    server/models/sensors: adds updateObject
    updateObject added to enable sensors synch with model

    * pages/device/sensors: fix
    show last value
    fix api call
    removes api calls to models

    * pages/device/mqttSettings: fix device uid text
    removes log

    * public/js/display: get payload type by analyzing it's type
    remove reversed data before display logs
    fix indentation

    * express-web: routes changes
    send data associated to device
    if protocol is lwm2m sends lwm2m settings page, else sends mqtt settings page
    creates new route for manage device
    On manage route request sends lwm2m for protocol lwm2m otherwise sends mqtt page
    Changes on sensors request. Sensors are now created for each device

    * server/models/devices:
    dedicated tables for each model are now deprecated
    getSensors method is now public

    * pages/device/mqttSettings: Small change on dashboard (shows model name)

    * pages/device/sensors: sensor logs
    Logs are now obtained from sensors
    Updated column removed
    Allows sensor request
    If model is sniffer, subscribes only sniffer topic
    If model is sniffer-gw, ignores packets messages
    sendMessage: builds properly topic for sniffer model
    rows are now filled with sensor json struct. No api request needed to get this data
    New readSensor method

    * pages/device/settings: get logs from sensors
    Logs are now obtained from sensors
    If model is sniffer, subscribes only sniffer topic
    sendMessage: builds properly topic for sniffer model
    rows are now filled with sensor json struct. No api request needed to get this data

    * partials/device/sidebar: mqttSettings removed, added Manage

    * Adds lwm2m and mqtt pages. Moved from inloc project

## version 1.0.75
  fix mqtt web connection
    Get parameters from config file or use default configurations
  Synch mqtt topics (#52)
    * allows remote config change
    * mqttSettings page: shows default and remote configs, allows remote config changes
    * page mqttSettings: synch support
    supports synch update for mqtt topics
    fixes localData
    fixes json data
    Adds labels synched and synching if available
  Fix device creation: handle null template_id and add owner permissions (#51)
  Show latest firmware versions on device settings page (#5)
  supports template assignment and unassignment
    Use Settings tab in UI to do it
    MQTT: Template topics are created on device (assignment)
    MQTT: Template topics are removed from device (unassignment)
    Lwm2m: need to check
  Model sensor (#55)
    * model sensor: new features
      supports property key (backend/frontend)
      supports sensor deletion (backend)
    * Add sensor deletion with confirmation modal to model sensors table (#54)
  device/sensor: enables editing and deleting sensors associated to device

## version 1.0.74
  server/controllers/db:delete: fix call
    truncate table, fix filter construction
  server/models/devices:delete: add curly brackets
  pages/devices_list:deleteDevice: fix object text

## version 1.0.73
  fix device registration
    catch error while double inserting a device
    fix associateMqttTemplateToDevice if no template is selected

## version 1.0.72
  ftp-serv updated to 4.6.3
  Add active state checkbox to MQTT second connection settings (#49)
  server/models/devices: fix getProjectInfo query

## version 1.0.71
  feat: Add template association functionality to device settings page (#45)
    * Add template selection UI and functionality to device settings page
    * Add backend support for updating device template_id field
    * Complete template association feature implementation and testing
    * Adds remove lwm2m and mqtt templates
  Add release option support for firmware uploads with multiple releases per version (#47)
    * Add release option to firmware upload with validation
    * Complete firmware release feature implementation with testing

## version 1.0.70
  Mqtt template (#43) (Fixes previous PR - mqtt templates)
    * Add freeRTOS2 template support for MQTT-based projects (#39)
    * Add freeRTOS2 template support - models, controllers, routes and UI
    * Complete freeRTOS2 template implementation with database schema
    * mqtt: Supports mqtt template and CRUD for device mqtt settings

## version 1.0.69
  Add global exception handling to prevent application exit except in dev mode
  Supports templates for mqtt projects

## version 1.0.68
  template/lwm2mEdit: fixes error defaultData.value not defined
  
## version 1.0.67
  - Supports LWM2M
  - Supports templates for LWM2M
  - Adds methods: getObservations and getObservationsStatus
  - Fixes addClientPermission, deleteClientPermission, updateClientPermission

## version 1.0.66
  - fixes: Create new model (backend)
    Only admin can create project or model
  - fixes add sensor:
    allows sensor creation by model and device
  server/models/devices: implement getSensorLogs (1st version)
  server/public/js/display: fixes showSensorsLogs (deviceId)
  List sensors by modelId and deviceId
  Supports 2 new routes for lwm2m: (#15):
    - /:device_id/objects
    - /:device_id/resources
  Adds routes for preSharedKey and observationStatus (lwm2m)
  Adds getId and fixes getPreSharedKey.
  Fixes sendMqttMessage and return message success on api.status call

## version 1.0.65
  - Add MQTT password generation on user creation (#10)
  - Add project creation modal with UID prefix and length validation (#12)
  - Add model creation functionality with project association (#14)
  
## version 1.0.64
  Projects (#8)
  * Supports project Management, Adds models access management:
    Project features:
    - Adds project list
    - Adds project Models
    - Adds project settings (to be defined yet)
    - Adds project Access
    Models new features:
    - Adds model Access
  * enables AR, Alarms and JS code features (#7)

## version 1.0.63
  - shows firmware sidebar tab only for users with a privileged level >= 4
  - Add manual FOTA trigger button (settings)

## version 1.0.62
  - fixes fw upload
  - server/models/devices: fixes getModelInfo call

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
