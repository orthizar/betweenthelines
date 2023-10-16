import {sendPictureRequest} from './request';

export const annotateImage = async (imageData) => {
    const imageAnalysis = await sendPictureRequest(imageData);

    const descriptions = imageAnalysis.slice(0, 3);

    return descriptions;
};