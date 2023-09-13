import os
import re
import json
import os.path
import pathlib
from wcmatch import glob
import streamlit as st
import streamlit.components.v1 as components

CACHE_FILE_NAME = ".st-tree.cache"

parent_dir = os.path.dirname(os.path.abspath(__file__))
build_dir = os.path.join(parent_dir, "frontend/build")
_component_func = components.declare_component("st_file_browser", path=build_dir)


def _get_file_info(root, path):
    stat = os.stat(path)
    info = {
        "path": path[len(root) + 1 :],
        "size": stat.st_size,
        "create_time": stat.st_ctime * 1000,
        "update_time": stat.st_mtime * 1000,
        "access_time": stat.st_atime * 1000,
    }
    info["name"] = os.path.basename(path)
    return info


def ensure_tree_cache(
    path: str,
    glob_patterns=("**/*",),
    file_ignores=None,
    limit=10000,
    use_cache: bool = False,
    force_rebuild: bool = False,
):
    cache_path = os.path.join(path, CACHE_FILE_NAME)
    if use_cache and not force_rebuild and os.path.exists(cache_path):
        with open(cache_path, "r") as cache_file:
            files = json.load(cache_file)
            return files

    root = pathlib.Path(os.path.abspath(path))

    files = [
        root / f
        for f in glob.glob(
            root_dir=path,
            patterns=glob_patterns,
            flags=glob.GLOBSTAR | glob.NODIR,
            limit=limit,
        )
    ]
    for ignore in file_ignores or []:
        files = filter(
            lambda f: (not ignore.match(os.path.basename(f)))
            if isinstance(ignore, re.Pattern)
            else (os.path.basename(f) not in file_ignores),
            files,
        )
    files = [_get_file_info(str(root), str(path)) for path in files]

    if use_cache:
        with open(cache_path, "w+") as cache_file:
            json.dump(files, cache_file)

    return files


def st_file_browser(
    path: str,
    *,
    glob_patterns=("**/*",),
    ignore_file_select_event=False,
    file_ignores=None,
    select_filetype_ignores=None,
    extentions=None,
    show_delete_file=False,
    show_choose_file=False,
    show_download_file=True,
    show_new_folder=False,
    show_upload_file=False,
    limit=10000,
    key=None,
    use_cache=False,
    override_files=None,
):
    extentions = tuple(extentions) if extentions else None
    root = pathlib.Path(os.path.abspath(path))

    if override_files is None:
        files = ensure_tree_cache(
            path,
            glob_patterns,
            file_ignores,
            limit,
            use_cache=use_cache,
        )

        files = (
            [file for file in files if str(file["path"]).endswith(extentions)]
            if extentions
            else files
        )
    else:
        files = [_get_file_info(str(root), str(fl)) for fl in override_files]

    event = _component_func(
        files=files,
        show_choose_file=show_choose_file,
        show_download_file=show_download_file,
        show_delete_file=show_delete_file,
        ignore_file_select_event=ignore_file_select_event,
        key=key,
    )

    if event:
        if event["type"] == "SELECT_FILE" and (
            (not select_filetype_ignores)
            or (not any(event["target"]["path"].endswith(ft) for ft in select_filetype_ignores))
        ):
            file = event["target"]
            if "path" in file:
                if not os.path.exists(os.path.join(root, file["path"])):
                    st.warning(f"File {file['path']} not found")
                    return event

    return event
