import {sendImageRequest} from './request';

export const annotateImage = async (imageData) => {
    const rawAnnotations = await sendImageRequest(imageData);

    const annotations = {
        labels: rawAnnotations.labelAnnotations ? rawAnnotations.labelAnnotations.filter((label) => label).map((label) => label.description).slice(0, 3) : null,
        text: rawAnnotations.textAnnotations ? rawAnnotations.textAnnotations.filter((text) => text).map((text) => text.description).slice(0, 3) : null,
        logos: rawAnnotations.logoAnnotations ? rawAnnotations.logoAnnotations.filter((logo) => logo).map((logo) => logo.description).slice(0, 3) : null,
        web: rawAnnotations.webDetection ? rawAnnotations.webDetection.webEntities.filter((entity) => entity).map((entity) => entity.description).slice(0, 3) : null,
        objects: rawAnnotations.localizedObjectAnnotations ? rawAnnotations.localizedObjectAnnotations.filter((object) => object).map((object) => object.name).slice(0, 3) : null,
    };

    return annotations;
};