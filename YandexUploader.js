import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const YandexUploader = ({ accessToken }) => {
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 100) {
        toast.error('Нельзя загружать более 100 файлов за раз.');
        return;
      }

      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));

      for (let file of acceptedFiles) {
        const uploadPath = `https://cloud-api.yandex.net/v1/disk/resources/upload?path=${encodeURIComponent('/path/to/upload/')}&overwrite=true`; // '/path/to/upload/' must be changed to an actual path. We can either get it from user after he logs in using OAuth or use a predetermined path.
        try {
          const response = await fetch(uploadPath, {
            method: 'GET',
            headers: {
              Authorization: `OAuth ${accessToken}` // Same with the token - we can get the token from user's OAuth or use a pregenerated token for uploading to a specific disk.
            }
          });
          const result = await response.json();
          const formData = new FormData();
          formData.append('file', file);
          const uploadResponse = await fetch(result.href, {
            method: 'PUT',
            body: formData
          });
          if (!uploadResponse.ok) {
            // basic error handling
            toast.error(`Не получилось загрузить файл: ${file.name}`);
          }
        } catch (err) {
          toast.error(`Ошибка при загрузке файла ${file.name}: ${err}`);
        }
      }
    }
  });

  return (
    <div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Перетащите или выберите несколько файлов для загрузки</p>
      </div>
      <aside>
        <h4>Files:</h4>
        {files.map(file => (
          <div key={file.name}>
            <div>{file.name}</div>
          </div>
        ))}
      </aside>
      <ToastContainer />
    </div>
  );
}
export default YandexUploader;
