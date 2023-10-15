import axios from "axios";

export const suggest = async (text, messages) => {
    return null;
    const response = await axios.post(
        "http://localhost:3000/api/learn",
        {
            text: text,
            messages: messages,
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    if (response.status !== 200) {
        return null;
    }
    const command = response.data.command;
    return command;
};