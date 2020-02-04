import React, { useState } from 'react';
import { faPlus, faFileImport, faSave } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';
import uuidv4 from 'uuid/v4';
import { flattenArr, objToArr } from './utils/helper';
import fileHelper from './utils/fileHelper';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'easymde/dist/easymde.min.css';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/TabList';
import useIpcRenderer from './hooks/useIpcRenderer';

// require node.js modules
const { join, basename, extname, dirname } = window.require('path');
const { remote } = window.require('electron');
const Store = window.require('electron-store');
const fileStore = new Store({'name': 'Files Data'});
const saveFilesToStore = (files) => {
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt } = file;
    result[id] = {
      id,
      path,
      title,
      createdAt
    }
    return result;
  }, {});
  fileStore.set('files', filesStoreObj);
}

function App() {
  const [ files, setFiles ] = useState(fileStore.get('files') || {});
  const [ activeFileID, setActiveFileID ] = useState('');
  const [ openedFileIDs, setOpenedFileIDs ] = useState([]);
  const [ unsavedFileIDs, setunsavedFileIDs ] = useState([]);
  const [ searchedFiles, setsearchedFiles ] = useState([]);
  const filesArr = objToArr(files);
  const openedFiles = openedFileIDs.map(openID => {
    return files[openID];
  });
  const activeFile = files[activeFileID];
  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr;
  const savedLocation = remote.app.getPath('documents');

  const fileChange = (id, value) => {
    if (value !== files[id].body) {
      const newFile = { ...files[id], body: value };
      setFiles({ ...files, [id]: newFile });
      if (!unsavedFileIDs.includes(id)) {
        setunsavedFileIDs([ ...unsavedFileIDs, id ]);
      }
    }
  }
  const fileClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID);
    const currentFile = files[fileID];
    if (!currentFile.isLoaded) {
      fileHelper.readFile(currentFile.path).then(value => {
        const newFile = { ...currentFile, body: value, isLoaded: true };
        setFiles({ ...files, [fileID]: newFile });
      });
    }
    // if openedFileIDs don't have the current ID
    // then add new fileID to openedFileIDs
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([ ...openedFileIDs, fileID ]);
    }
  }
  const tabClick = (fileID) => {
    setActiveFileID(fileID);
  }
  const tabClose = (id) => {
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id);
    setOpenedFileIDs(tabsWithout);
    // set the active to the first opened tab if still tabs left
    if (tabsWithout.length > 0) {
      setActiveFileID(tabsWithout[0]);
    } else {
      setActiveFileID('');
    }
  }
  const deleteFile = (id) => {
    if (files[id].isNew) {
      const { [id]: value, ...afterDelete } = files;
      setFiles(afterDelete);
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        const { [id]: value, ...afterDelete } = files;
        setFiles(afterDelete);
        saveFilesToStore(afterDelete);
        // close tab if opened
        tabClose(id);
      });
    }
  }
  const updateFileName = (id, title, isNew) => {
    const newPath = isNew ? join(savedLocation, `${title}.md`)
      : join(dirname(files[id].path), `${title}.md`);
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath };
    const newFiles = { ...files, [id]: modifiedFile };
    if (isNew) {
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles);
        saveFilesToStore(newFiles);
      });
    } else {
      const oldPath = files[id].path;
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles);
        saveFilesToStore(newFiles);
      });
    }
  }
  const searchFile = (keyword) => {
    const newFiles = filesArr.filter(file => file.title.includes(keyword));
    setsearchedFiles(newFiles);
  }
  const createNewFile = () => {
    const newID = uuidv4();
    const newFile = {
      id: newID,
      title: '',
      body: '## 请输入 Markdown',
      createdAt: new Date().getTime(),
      isNew: true
    }
    setFiles({ ...files, [newID]: newFile });
  }
  const saveCurrentFile = () => {
    fileHelper.writeFile(activeFile.path, activeFile.body).then(() => {
      setunsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id));
    });
  }
  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Markdown files', extensions: ['md']}
      ]
    }).then(ret => {
      const { filePaths } = ret;
      // filter out the path we already have in electron store
      const filteredPaths = filePaths.filter(path => {
        const alreadyAdded = Object.values(files).find(file => file.path === path);
        return !alreadyAdded;
      })
      // extend the path array to an array contains files info
      const importFilesArr = filteredPaths.map(path => {
        return {
          id: uuidv4(),
          title: basename(path, extname(path)),
          path
        }
      });
      console.log(importFilesArr);
      // get the new files object in flattenArr
      const newFiles = { ...files, ...flattenArr(importFilesArr) };
      console.log(newFiles);
      // setState and update electron store
      setFiles(newFiles);
      saveFilesToStore(newFiles);
      if (importFilesArr.length > 0) {
        remote.dialog.showMessageBox({
          type: 'info',
          title: `成功导入了${importFilesArr.length}个文件`,
          message: `成功导入了${importFilesArr.length}个文件`
        });
      }
    })
  }
  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile
  })
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 left-panel">
          <FileSearch
            title="My Document"
            onFileSearch={searchFile}
          />
          <FileList
            files={fileListArr}
            onFileClick={fileClick}
            onFileDelete={deleteFile}
            onSaveEdit={updateFileName}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary"
                icon={faPlus}
                onBtnClick={createNewFile}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
                onBtnClick={importFiles}
              />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          { !activeFile &&
            <div className="start-page">
              选择或者创建新的 Markdown 文档
            </div>
          }
          {
            activeFile &&
            <>
              <TabList
                files={openedFiles}
                activeId={activeFileID}
                unsaveIds={unsavedFileIDs}
                onTabClick={tabClick}
                onCloseTab={tabClose}
              />
              <SimpleMDE
                key={activeFile && activeFile.id}
                value={activeFile && activeFile.body}
                onChange={(value) => {fileChange(activeFile.id, value)}}
                options={{
                  minHeight: '500px'
                }}
              />
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
