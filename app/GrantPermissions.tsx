import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {PermissionResponse} from 'expo-media-library';

export type GrantPermissionsProps = {
  requestPermission: () => Promise<PermissionResponse>;
};

function GrantPermissions(props: GrantPermissionsProps) {
  const {requestPermission} = props;

  return (
    <SafeAreaView style={styles.safeViewContainer}>
      <View style={styles.container}>
        <Text>
          Please give the app photo permissions for see how laggy the UI is.
          Make sure to give access to 300+ photos to run a good test.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              requestPermission().then(response => {
                if (
                  response.accessPrivileges === 'none' &&
                  !response.canAskAgain
                ) {
                  Alert.alert(
                    'Photo access denied!',
                    'To use the app, please grant photo permissions. Remember, your photos never leave your device and are not used for any reason besides cleanup.',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {
                        text: 'Grant permissions',
                        onPress: () => Linking.openSettings(), // This opens the app's settings page
                      },
                    ],
                    {cancelable: false},
                  );
                }
              });
            }}>
            <Text style={styles.buttonText}>{`Give photo permissions`}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeViewContainer: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    ...Platform.select({
      android: {
        paddingTop: 40,
      },
    }),
  },
  container: {
    paddingTop: 20,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
  },
  buttonContainer: {width: '100%'},
  button: {
    paddingHorizontal: 16,
    borderRadius: 40,
    backgroundColor: 'blue',
    height: 60,
    width: '90%',
    alignSelf: 'center',
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    minWidth: 160,
    fontWeight: 'bold',
    height: 60,
    lineHeight: 60,
  },
});

export default GrantPermissions;
