# Streamlit file browser

A streamlit component serve as web file browser from local directory.

## Install

```
pip install st-file-browser
```
## Usage Example


```python
import streamlit as st
from streamlit_file_browser import st_file_browser

st.header('Default Options')
event = st_file_browser("example_artifacts", key='A')
st.write(event)

st.header('With Artifacts Server, Allow choose file, disable download')
event = st_file_browser("example_artifacts", artifacts_site="http://localhost:1024", show_choose_file=True, show_download_file=False, key='B')
st.write(event)

st.header('Show only molecule files')
event = st_file_browser("example_artifacts", artifacts_site="http://localhost:1024", show_choose_file=True, show_download_file=False, glob_patterns=('molecule/*',), key='C')
st.write(event)
```

## API

| name                     | usage                                                                                                                                      | type           | required                                                | default |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|----------------|---------------------------------------------------------|---------|
| key                      | react key                                                                                                                                  | string         | No. But I suggest giving each component a different key | None    |
| path                     | the path of dir                                                                                                                            | strubg         | Yes                                                     |         |
| glob_patterns            | To control file shows, the usage is the same as the patterns of glob.glob                                                                  | string (regex) | No                                                      | '**/*'    |
| ignore_file_select_event | If ignore the 'file_selected' event                                                                                                        | bool           | No                                                      | False   |
| extentions               | Only show the files included in the extentions                                                                                             | list           | No                                                      | None    |
| show_delete_file         | If show the button of delete file                                                                                                          | bool           | No                                                      | False   |
| show_choose_file         | If show the button of choose file                                                                                                          | bool           | No                                                      | False   |
| show_new_folder          | If show the button of new folder                                                                                                           | bool           | No                                                      | False   |
| show_upload_file         | If show the button of upload file                                                                                                          | bool           | No                                                      | False   |
| limit                    | File number limit                                                                                                                          | int            | No                                                      | 10000   |
| use_cache                | If cache file tree                                                                                                                         | bool           | No                                                      | False   |

<br/>

## Run example

</br>

## Build

If any changes were made to the frontend, go to `st_file_browser/frontend` and run `npm run build` (`npm install --legacy-peer-deps` if you don't have the packages on your machine). Then push the changes made to the `frontend/build` folder to the repo. 

You may need to follow [this](https://stackoverflow.com/questions/69692842/error-message-error0308010cdigital-envelope-routinesunsupported) help if you run into issues while building.

Now all you have to do is make a release and the github action will push to PyPi (make sure `setup.py` has a new verison)