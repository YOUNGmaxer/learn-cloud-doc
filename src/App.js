import React, { useState } from 'react';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'easymde/dist/easymde.min.css';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/TabList';
import defaultFiles from './utils/defaultFiles';
function App() {
  const [ files, setFiles ] = useState(defaultFiles);
  const [ activeFileID, setActiveFileID ] = useState('');
  const [ openedFileIDs, setOpenedFileIDs ] = useState([]);
  const [ unsaveFileIDs, setUnsaveFileIDs ] = useState([]);
  const openedFiles = openedFileIDs.map(openID => {
    return files.find(file => file.id === openID);
  });
  const activeFile = files.find(file => file.id === activeFileID);
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 left-panel">
          <FileSearch
            title="My Document"
            onFileSearch={(value) => { console.log(value); }}
          />
          <FileList
            files={files}
            onFileClick={(id) => {console.log(id)}}
            onFileDelete={(id) => {console.log('delete', id)}}
            onSaveEdit={(id, newValue) => {console.log(id, newValue)}}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary"
                icon={faPlus}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
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
                unsaveIds={unsaveFileIDs}
                onTabClick={(id) => {console.log(id)}}
                onCloseTab={(id) => {console.log('closing', id)}}
              />
              <SimpleMDE
                value={activeFile && activeFile.body}
                onChange={(value) => {console.log(value)}}
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
