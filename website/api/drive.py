from googleapiclient.http import MediaFileUpload
import json


from .Google import Create_Service
from .modules import mime_test


CLIENT_FILE = 'website/api/client.json'
API_NAME = 'drive'
API_VERSION = 'v3'
SCOPES = ['https://www.googleapis.com/auth/drive']


class GoogleDrive():
    def __init__(self):
        pass
        # try:
        #     self.service = Create_Service(CLIENT_FILE,API_NAME,API_VERSION,SCOPES)
        # except Exception as e:
        #     print(e)

    def create_folder(self, folder_name: str, parent_id: str = '') -> '{kind, id, name, mimeType}':
        if parent_id:
            parent_id = [parent_id]

        service = self.service.files().create(body={
            # file_metadata
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': parent_id
        })
        return service.execute()

    def create_file(self, filepath: str, parent_id: str = '') -> '{id }':
        if parent_id:
            parent_id = [parent_id]

        filename = filepath.split('\\')[-1]

        file_metadata = {
            'name': filename,
            'mimeType': mime_test(filename),
            'parents': parent_id
        }

        media = MediaFileUpload(filepath, mimetype=mime_test(filename), resumable=True)

        return self.service.files().create(
            body = file_metadata,
            media_body = media,
            fields = 'id'
        ).execute()


GoogleDrive = GoogleDrive()


def getAllFiles():
    r = GoogleDrive.service.files().list().execute()
    files = r.get('files')
    nextPageToken = r.get('nextPageToken')

    while nextPageToken:
        # print(nextPageToken)
        r = GoogleDrive.service.files().list(pageToken=nextPageToken).execute()
        files.extend(r.get('files'))
        nextPageToken = r.get('nextPageToken')
        print('loaded:',files.__len__())

    f = open('website/api/filesss.txt',mode='w+',encoding='utf-8')
    f.write(json.dumps(files,ensure_ascii=False,separators=(',',':')))
    f.close()