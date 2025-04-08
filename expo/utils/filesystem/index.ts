import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import { File } from 'expo-file-system/next';

/**
 * Prompt user to select a file and read from the file
 *
 * @param {type} - mimeType of the file, defaults to "application/json"
 * @returns string - content of the file
 *
 */
export const readFile = async ({ type = 'application/json' }: { type: string }) => {
  const pickerResult = await DocumentPicker.getDocumentAsync({
    multiple: false,
    type,
  });
  if (!pickerResult.assets || pickerResult.assets.length === 0) {
    return;
  }
  const uri = pickerResult.assets[0].uri;
  const file = new File(uri);
  return file?.text();
};

/**
 * Prompt use to select a directory for storage and store a file in the directory
 *
 * @param name - name of the file
 * @param mimeType - mime type of the file
 * @param content - content of the file
 * @returns void
 *
 */
export const writeFile = async ({
  name,
  mimeType,
  content,
}: {
  name: string;
  mimeType: string;
  content: string;
}) => {
  const permission = await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted) {
    return;
  }
  const fileUri = await StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    name,
    mimeType
  );
  await FileSystem.writeAsStringAsync(fileUri, content);
};
