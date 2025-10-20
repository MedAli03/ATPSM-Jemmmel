import { useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
}

export function useFilePicker() {
  const pickFile = useCallback(async (): Promise<PickedFile | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      quality: 0.8
    });
    if (result.canceled) {
      return null;
    }
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName ?? 'attachment',
      mimeType: asset.mimeType ?? 'application/octet-stream'
    };
  }, []);

  return { pickFile };
}
