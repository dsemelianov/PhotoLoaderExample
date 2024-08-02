import {useCallback, useEffect, useState} from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export const BATCH_SIZE = 20;

export function useProcessImages() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({
    granularPermissions: ['photo', 'video'],
  });

  const [totalAssets, setTotalAssets] = useState<number>();
  const [processedAssets, setProcessedAssets] = useState<number>();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const fetchAssetInfo = useCallback(async (asset: MediaLibrary.Asset) => {
    return MediaLibrary.getAssetInfoAsync(asset).then(value => {
      return FileSystem.getInfoAsync(asset.uri, {size: true}).then(fileInfo => {
        const fileSize = (fileInfo as any).size || 0;
        const info = {...value, bytes: fileSize};

        const assetWithInfo = {
          ...asset,
          info,
        };
        return assetWithInfo;
      });
    });
  }, []);

  const processBatch = useCallback(
    async (assets: MediaLibrary.Asset[]) => {
      const assetsWithInfo = await Promise.all(assets.map(fetchAssetInfo));

      assetsWithInfo.forEach(_assetWithInfo => {
        try {
          setProcessedAssets(v => {
            return (v || 0) + 1;
          });
        } catch (e) {
          console.error(e);
        }
      });
    },
    [fetchAssetInfo],
  );

  const getAssets = useCallback(
    async (cursor?: string) => {
      console.log('getAssets for ' + cursor);
      const fetchedAssetsPage = await MediaLibrary.getAssetsAsync({
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        ...(cursor ? {after: cursor} : {}),
      });
      const fetchedAssets = fetchedAssetsPage.assets;
      setTotalAssets(fetchedAssetsPage.totalCount);
      // Process assets in batches
      for (let i = 0; i < fetchedAssets.length; i += BATCH_SIZE) {
        const batch = fetchedAssets.slice(i, i + BATCH_SIZE);
        try {
          await processBatch(batch);
        } catch (e) {
          console.error(e);
        }
      }

      if (fetchedAssetsPage.hasNextPage) {
        return fetchedAssetsPage.endCursor;
      } else {
        setIsSyncing(false);
        return undefined;
      }
    },
    [processBatch],
  );

  const fetchAllAssets = useCallback(
    async (cursor: string | undefined) => {
      if (!cursor) {
        setTotalAssets(0);
        setProcessedAssets(0);
        setIsSyncing(true);
      }
      getAssets(cursor).then(nextCursor => {
        if (nextCursor) {
          fetchAllAssets(nextCursor);
        }
      });
    },
    [getAssets],
  );

  useEffect(() => {
    if (permissionResponse?.status !== 'granted') {
      return;
    }
    fetchAllAssets(undefined);
  }, [permissionResponse, fetchAllAssets]);

  return {
    permissionResponse,
    requestPermission,
    rerun: () => {
      fetchAllAssets(undefined);
    },
    totalAssets,
    processedAssets,
    isSyncing,
  };
}
