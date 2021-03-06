const { app } = require('electron');

let template = [{
  label: '文件',
  submenu: [{
    label: '新建',
    accelerator: 'CmdOrCtrl+N',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('create-new-file');
    }
  }, {
    label: '保存',
    accelerator: 'CmdOrCtrl+S',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('save-edit-file');
    }
  }, {
    label: '搜索',
    accelerator: 'CmdOrCtrl+F',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('search-file');
    }
  }, {
    label: '导入',
    accelerator: 'CmdOrCtrl+O',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('import-file');
    }
  }]
}, {
  label: '编辑',
  submenu: [{
    label: '撤销',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: '重做',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: '剪切',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: '复制',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: '粘贴',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: '全选',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }]
}, {
  label: '视图',
  submenu: [{
    label: '开发者工具',
    role: 'toggleDevTools'
  }, {
    label: '刷新页面',
    role: 'reload'
  }]
}];

if (process.platform === 'darwin') {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [{
      label: `关于 ${name}`,
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: '设置',
      accelerator: 'Command+,',
      click: () => {

      }
    }, {
      label: '服务',
      role: 'services',
      submenu: []
    }, {
      type: 'separator' 
    }, {
      label: `隐藏 ${name}`,
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: '隐藏其他',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: '显示全部',
      role: 'unhide'
    }]
  })
};

module.exports = template;