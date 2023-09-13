import React from "react"
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
  ComponentProps,
} from "streamlit-component-lib"
import FileBrowser, {
  Icons,
  FileBrowserFile,
  FileBrowserFolder,
} from "react-keyed-file-browser"

import get from 'lodash.get'
import IframeResizer from 'iframe-resizer-react'
import Actions from "./actions"
import "react-keyed-file-browser/dist/react-keyed-file-browser.css"
import "font-awesome/css/font-awesome.min.css"

interface File {
  path: string
  name?: string
  size?: number
  create_time?: number
  update_time?: number
  access_time?: number
}

enum StreamlitEventType {
  SELECT_FILE = "SELECT_FILE",
  SELECT_FOLDER = "SELECT_FOLDER",
  DOWNLOAD = "DOWNLOAD",
  DELETE_FILE = "DELETE_FILE",
  DELETE_FOLDER = "DELETE_FOLDER",
  RENAME_FOLDER = "RENAME_FOLDER",
  RENAME_FILE = "RENAME_FILE",
  CREATE_FILE = "CREATE_FILE",
  CREATE_FOLDER = "CREATE_FOLDER",
  MOVE_FILE = "MOVE_FILE",
  MOVE_FOLDER = "MOVE_FOLDER",
  CHOOSE_FILE = "CHOOSE_FILE",
}

interface StreamlitEvent {
  type: StreamlitEventType
  target: File | File[]
}

interface State {
  numClicks: number
  isFocused: boolean
}

interface IArgs {
  files: File[]
  path: string
  show_download_file: boolean
  show_delete_file: boolean
  show_choose_file: boolean
  show_new_folder: boolean
  show_upload_file: boolean
  ignore_file_select_event: boolean
}

const noticeStreamlit = (event: StreamlitEvent) =>
  Streamlit.setComponentValue(event)

  
class FileBrowserNative extends StreamlitComponentBase<State> {
  private args: IArgs

  constructor(props: ComponentProps) {
    super(props)
    this.args = props.args
  }

  ajustHeight(revoke_step?: number) {
    const root = document.getElementById("root")
    if (root) {
      const height = Math.min(
        root.clientHeight,
        root.scrollHeight,
        root.offsetHeight
      )
      Streamlit.setFrameHeight(height - (revoke_step ? revoke_step : 0))
      setTimeout(Streamlit.setFrameHeight, 1)
    }
  }

  componentDidMount() {
    this.ajustHeight()
  }

  componentDidUpdate() {
    this.ajustHeight()
  }

  folderOpenHandler = (opts: FileBrowserFolder) => this.ajustHeight()
  folderCloseHandler = (opts: FileBrowserFolder) => this.ajustHeight()

  fileSelectedHandler = (opts: FileBrowserFile) => {
    if (!this.args.ignore_file_select_event) {
      const file = this.args.files.find((file) => file.path === opts.key)
      file &&
        noticeStreamlit({ type: StreamlitEventType.SELECT_FILE, target: file })
    }
  }

  deleteFileHandler = (fileKey: string | string[]) => {
    const files = this.args.files.filter((file) => typeof fileKey === 'string' ? fileKey === file.path : fileKey.includes(file.path))
    console.log("deleteFileHandler", "key", fileKey, "files ", files)

    files.length &&
      noticeStreamlit({ type: StreamlitEventType.DELETE_FILE, target: files })

    const remainingFiles = this.args.files.filter((file) => typeof fileKey === 'string' ? fileKey !== file.path : !fileKey.includes(file.path))
    this.args.files = remainingFiles
  }

  chooseHandler = (keys: string[]) => {
    const files = this.args.files.filter((file) => keys.includes(file.path))
    files.length &&
      noticeStreamlit({ type: StreamlitEventType.CHOOSE_FILE, target: files })
  }

  convertFiles = (files: File[]): FileBrowserFile[] =>
    files.map((file) => ({
      key: file.path,
      modified: file.update_time || 0,
      size: file.size || 0,
    }))

  noop = () => <></>
  public render = () => {
    let that = this
    return (
      <div>
        <FileBrowser
          {...this.args}
          showActionBar
          canFilter={true}
          detailRenderer={this.noop}
          icons={Icons.FontAwesome(4)}
          files={this.convertFiles(this.args.files)}
          onFolderOpen={this.folderOpenHandler}
          onFolderClose={this.folderCloseHandler}
          onSelect={this.fileSelectedHandler}
          onDeleteFile={this.deleteFileHandler}
          actionRenderer={(...args: any) => {
            return Actions({
              ...args[0],
              ...{
                canChooseFile: that.args.show_choose_file,
                canDownloadFile: false,
                canDeleteFile: that.args.show_delete_file,
                onChooseFile: (keys: string[]) =>
                  that.chooseHandler(
                    args[0].selectedItems.map((i: any) => i.key)
                  ),
                onDeleteFile: (fileKey: string[]) =>
                  that.deleteFileHandler(
                      args[0].selectedItems.map((i: any) => i.key)
                  ),
              },
            })
          }}
        />
      </div>
    )
  }
}
const StreamlitFileBrowserNative = withStreamlitConnection(FileBrowserNative)

class FileBrowserWrapper extends StreamlitComponentBase<State> {
  private args: IArgs
  
  constructor(props: ComponentProps) {
    super(props)
    this.args = props.args
  }

  public render(): React.ReactNode {
      return (
        <div>
          <StreamlitFileBrowserNative {...this.props} />
        </div>
      )
  }
}

export default withStreamlitConnection(FileBrowserWrapper)
