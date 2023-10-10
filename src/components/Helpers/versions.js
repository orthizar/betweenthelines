export const getVersions = () => {
  const versionsString = window.sessionStorage.getItem("versions");
  const versions = versionsString ? JSON.parse(versionsString) : [];

  return versions;
};

export const getVersion = (versionId) => {
  const versions = getVersions();
  const version = versions.filter((versions) => versions.id === versionId);
  return version;
};

export const getTextFromVersion = (versionId) => {
  return getVersion(versionId)[0].text;
};

export const getDescriptionFromVersion = (versionId) => {
  return getVersion(versionId)[0].description;
};

export const getTextFromLatestVersion = () => {
  const versions = getVersions();
  return versions[versions.length - 1][0].text;
};

export const createVersion = (description, textInEditor) => {
  const versions = getVersions();

  if (textInEditor.length > 1) {
    const newVersion = {
      id: versions.length + 1,
      description: description,
      text: textInEditor,
    };
    versions.push(newVersion);

    window.sessionStorage.setItem("versions", JSON.stringify(versions));
  }
};
