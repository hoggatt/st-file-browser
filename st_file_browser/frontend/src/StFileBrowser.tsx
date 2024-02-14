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
  Sorter,
  Sorters,
  SortDirection,
} from "react-keyed-file-browser"

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
  show_choose_file: boolean
  ignore_file_select_event: boolean
  sort_by: string
  sort_dir: SortDirection
}

const noticeStreamlit = (event: StreamlitEvent) =>
  Streamlit.setComponentValue(event)

type AnyFunction = (...args: any[]) => any;

// Function overload for partially applied functions with later arguments prefilled
function partialRight<T extends AnyFunction, Args extends any[], PrefilledArgs extends any[]>(
  fn: T,
  ...prefilledArgs: PrefilledArgs
): (
  ...args: Drop<Parameters<T>, PrefilledArgs['length']> // Drop prefilled arguments from the parameter list
) => ReturnType<T> {
  return (...args: Drop<Parameters<T>, PrefilledArgs['length']>) => {
    return fn(...args, ...prefilledArgs); // Combine prefilled arguments with provided arguments
  };
}

// Utility type to drop elements from an array
type Drop<T extends any[], N extends number> = ((...args: T) => any) extends (
  arg1: any,
  ...args: infer U
) => any
  ? U['length'] extends N
    ? U
    : Drop<U, N>
  : never;
  
class FileBrowserNative extends StreamlitComponentBase<State> {
  private args: IArgs

  constructor(props: ComponentProps) {
    super(props)
    this.args = props.args
  }

  adjustHeight(revoke_step?: number) {
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
    this.adjustHeight()
  }

  componentDidUpdate() {
    this.adjustHeight()
  }

  folderOpenHandler = (opts: FileBrowserFolder) => this.adjustHeight()
  folderCloseHandler = (opts: FileBrowserFolder) => this.adjustHeight()

  fileSelectedHandler = (opts: FileBrowserFile) => {
    if (!this.args.ignore_file_select_event) {
      const file = this.args.files.find((file) => file.path === opts.key)
      file &&
        noticeStreamlit({ type: StreamlitEventType.SELECT_FILE, target: file })
    }
  }

  convertFiles = (files: File[]): FileBrowserFile[] =>
    files.map((file) => ({
      key: file.path,
      modified: file.update_time || 0,
      size: file.size || 0,
    }))

  chooseSorter = (sort_by: string, sort_dir: SortDirection): Sorter => {
    switch (sort_by) {
      case "name":
        return partialRight(Sorters.SortByName, sort_dir)
      case "modified":
        return partialRight(Sorters.SortByModified, sort_dir)
      default:
        return Sorters.SortByDefault
    }
  }

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
          sort={this.chooseSorter(this.args.sort_by, this.args.sort_dir)}
          onFolderOpen={this.folderOpenHandler}
          onFolderClose={this.folderCloseHandler}
          onSelect={this.fileSelectedHandler}
          actionRenderer={(...args: any) => {
            return Actions({
              ...args[0],
              ...{
                canChooseFile: that.args.show_choose_file,
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
