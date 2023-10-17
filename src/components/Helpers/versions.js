export const getVersions = () => {
  const versionsString = window.sessionStorage.getItem("versions");
  const versions = versionsString ? JSON.parse(versionsString) : [];

  return versions;
};

export const getVersion = (versionId) =>
  getVersions().filter((versions) => versions.id === versionId);

export const getTextFromVersion = (versionId) =>
  getVersion(versionId)[0]?.text || "";

export const getDescriptionFromVersion = (versionId) =>
  getVersion(versionId)[0].description;

export const getIndexFromLatestVersion = () => getVersions().length - 1;

export const highestID = () => {
  const versions = getVersions();

  return versions.reduce((highestID, version) => {
    return version.id > highestID ? version.id : highestID;
  }, 0);
};

export const createVersion = (description, textInEditor, newText) => {
  const versions = getVersions();
  const isVersion0 = versions.length < 1;

  if (textInEditor.length > 1) {
    if (isVersion0) {
      const baseVersion = {
        id: highestID(),
        description: "Base",
        text: textInEditor,
      };
      versions.push(baseVersion);
    }

    const newActiveVersion = highestID() + 1;

    const newVersion = {
      id: newActiveVersion,
      description: description,
      text: newText,
    };

    versions.push(newVersion);

    window.sessionStorage.setItem("versions", JSON.stringify(versions));
    return newActiveVersion;
  }
};

export const deleteVersion = (versionId) => {
  let versions = getVersions();

  const versionIndex = versions.findIndex(
    (version) => version.id === versionId
  );

  versions.splice(versionIndex, 1);

  window.sessionStorage.setItem("versions", JSON.stringify(versions));
};

export const saveVersion = (versionId, newText) => {
  let versions = getVersions();

  if (newText) {
    const versionIndex = versions.findIndex(
      (version) => version.id === versionId
    );

    versions[versionIndex].text = newText;
    window.sessionStorage.setItem("versions", JSON.stringify(versions));
  }
};

export const deleteAllVersions = () => {
  window.sessionStorage.setItem("versions", JSON.stringify([]));
};
