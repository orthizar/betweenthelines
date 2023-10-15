
export async function* invokePipeline(text, transformationCommand, refine) {
    // read stream from localhost:3000/api/refine
    // chunk is a string or a json object
    const response = await fetch("http://localhost:3000/api/refine", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text: text,
            transformationCommand: transformationCommand,
            refine: refine,
        }),
    });
    console.log(response)
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    var chunk = undefined;
    var result = undefined;
    var done = false;
    while (!done) {
        result = await reader.read();
        done = result.done;
        console.log(result)
        chunk = decoder.decode(result.value, { stream: !done });
        console.log(chunk)
        if (chunk) {
            yield chunk;
        }
    }
}