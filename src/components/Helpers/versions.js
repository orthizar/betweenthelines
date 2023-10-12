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
  return versions[versions.length - 1].text;
};

export const createVersion = (description, textInEditor, newText) => {
  const versions = getVersions();
  const isVersion0 = versions.length < 1;

  if (textInEditor.length > 1) {
    if (isVersion0) {
      const baseVersion = {
        id: versions.length + 1,
        description: "Base",
        text: textInEditor,
      };
      versions.push(baseVersion);
    }

    const newVersion = {
      id: versions.length + 1,
      description: description,
      text: newText ? newText : textInEditor,
    };

    versions.push(newVersion);

    window.sessionStorage.setItem("versions", JSON.stringify(versions));
  }
};

export const deleteVersion = (versionId) => {
  const versions = getVersions();
  const versionIndex = versions.findIndex(
    (version) => version.id === versionId
  );

  if (versionIndex !== -1) {
    versions.splice(versionIndex, 1);
    window.sessionStorage.setItem("versions", JSON.stringify(versions));
  }
};

export const saveVersion = (versionId, newText) => {
  let versions = getVersions();

  versions[versionId].text = newText;
  window.sessionStorage.setItem("versions", JSON.stringify(versions));
};
