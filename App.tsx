import React, {useCallback} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useProcessImages} from './app/hooks/useProcessImages';
import GrantPermissions from './app/GrantPermissions';
import * as Progress from 'react-native-progress';

const repeatedString = 'Scroll to test how responsive the UI is';
const dummyDataList = new Array(1000)
  .fill(null)
  .map((_, index) => `${repeatedString} ${index}`);

export function App(): React.JSX.Element {
  const {
    permissionResponse,
    requestPermission,
    rerunSync,
    totalAssets,
    processedAssets,
    isSyncing,
  } = useProcessImages();

  let syncProgress: number = 1;
  if (processedAssets && totalAssets) {
    syncProgress = processedAssets / totalAssets;
  }

  console.log('RENDERING!');

  const renderSyncProgress = useCallback(() => {
    if (isSyncing) {
      return (
        <View style={styles.syncProgressContainer}>
          <Progress.Bar progress={syncProgress} width={null} />
          <Text style={styles.syncProgressText}>
            {`Syncing ${processedAssets} of ${totalAssets} photos`}
          </Text>
          <Text style={[styles.syncProgressText, {marginTop: 8}]}>
            {'Try scrolling the list below - it will be laggy :( '}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.syncProgressContainer}>
        <Text style={styles.syncProgressText}>
          {'Sync is finished. UI should be fine now.'}
        </Text>
        <TouchableOpacity
          onPress={() => {
            rerunSync();
          }}
          style={{
            backgroundColor: 'blue',
            marginTop: 8,
            padding: 4,
            borderRadius: 4,
          }}>
          <Text style={{color: 'white'}}>
            Tap here to rerun sync and make the UI laggy again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [isSyncing, processedAssets, rerunSync, syncProgress, totalAssets]);

  const renderRow = useCallback((data: ListRenderItemInfo<string>) => {
    return <Text key={data.index}>{data.item}</Text>;
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{backgroundColor: 'white', flex: 1}}>
        {permissionResponse?.status !== 'granted' ? (
          <GrantPermissions requestPermission={requestPermission} />
        ) : (
          <>
            {renderSyncProgress()}
            <FlatList
              data={dummyDataList}
              style={{backgroundColor: 'white'}}
              keyExtractor={(_, index) => `row-${index}`}
              renderItem={renderRow}
              showsVerticalScrollIndicator={false}
              windowSize={2}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  syncProgressContainer: {paddingHorizontal: 8, marginVertical: 8},
  syncProgressText: {
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default App;
