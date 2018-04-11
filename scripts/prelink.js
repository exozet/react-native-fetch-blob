try {
  var fs = require('fs');
  var glob = require('glob');
  var addAndroidPermissions = process.env.RNFB_ANDROID_PERMISSIONS == 'true';
  var MANIFEST_PATH = glob.sync(process.cwd() + '/android/app/src/main/**/AndroidManifest.xml')[0];
  var PACKAGE_JSON = process.cwd() + '/package.json';
  var package = JSON.parse(fs.readFileSync(PACKAGE_JSON));
  var APP_NAME = package.name;
  var PACKAGE_GRADLE = process.cwd() + '/node_modules/react-native-fetch-blob/android/build.gradle'
  var VERSION = checkVersion();

  console.log('RNFetchBlob detected app version => ' + VERSION);

  console.log('Add Android permissions => ' + (addAndroidPermissions == "true"))

  if(addAndroidPermissions) {

    // set file access permission for Android < 6.0
    fs.readFile(MANIFEST_PATH, function(err, data) {

      if(err)
        console.log('failed to locate AndroidManifest.xml file, you may have to add file access permission manually.');
      else {

        console.log('RNFetchBlob patching AndroidManifest.xml .. ');
        // append fs permission
        data = String(data).replace(
          '<uses-permission android:name="android.permission.INTERNET" />',
          '<uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" /> '
        )
        // append DOWNLOAD_COMPLETE intent permission
        data = String(data).replace(
          '<category android:name="android.intent.category.LAUNCHER" />',
          '<category android:name="android.intent.category.LAUNCHER" />\n     <action android:name="android.intent.action.DOWNLOAD_COMPLETE"/>'
        )
        fs.writeFileSync(MANIFEST_PATH, data);
        console.log('RNFetchBlob patching AndroidManifest.xml .. ok');

      }

    })
  }
  else {
    console.log(
      '\033[95mreact-native-fetch-blob \033[97mwill not automatically add Android permissions after \033[92m0.9.4 '+
      '\033[97mplease run the following command if you want to add default permissions :\n\n' +
      '\033[96m\tRNFB_ANDROID_PERMISSIONS=true react-native link \n')
  }

  function checkVersion() {
    console.log('RNFetchBlob checking app version ..');
    return parseFloat(/\d\.\d+(?=\.)/.exec(package.dependencies['react-native']));
  }

} catch(err) {
  console.log(
    '\033[95mreact-native-fetch-blob\033[97m link \033[91mFAILED \033[97m\nCould not automatically link package :'+
    err.stack +
    'please follow the instructions to manually link the library : ' +
    '\033[4mhttps://github.com/wkh237/react-native-fetch-blob/wiki/Manually-Link-Package\n')
}
