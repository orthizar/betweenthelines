export const getVersions = () => {
  const versionsString = window.sessionStorage.getItem("versions");
  const versions = versionsString ? JSON.parse(versionsString) : [];

  return versions;
};

export const getVersion = (versionId) =>
  getVersions().filter((versions) => versions.id === versionId);

export const getTextFromVersion = (versionId) => getVersion(versionId)[0].text;

export const getDescriptionFromVersion = (versionId) =>
  getVersion(versionId)[0].description;

export const getIndexFromLatestVersion = () => getVersions().length - 1;

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
  const existingVersionIndex = versions.findIndex(
    (version) => version.id === versionId
  );

  versions[existingVersionIndex].text = newText;
  window.sessionStorage.setItem("versions", JSON.stringify(versions));
};
