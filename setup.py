import setuptools

with open('README.md') as f:
    long_description = f.read()

setuptools.setup(
    name="st-file-browser",
    version="0.1.0",
    author="hoggatt",
    author_email="",
    description="A streamlit file browser",
    long_description=long_description,
    long_description_content_type='text/markdown',
    url="https://github.com/hoggatt/st-file-browser",
    packages=setuptools.find_packages(),
    include_package_data=True,
    classifiers=[],
    project_urls={
        'Source Code': 'https://github.com/hoggatt/st-file-browser',
    },
    python_requires=">=3.6",
    install_requires=[
        "wcmatch",
        "streamlit >= 1.0",
    ],
)
