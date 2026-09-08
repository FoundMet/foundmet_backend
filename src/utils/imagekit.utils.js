import ImageKit from "@imagekit/nodejs";
const imagekit = new ImageKit({
    privateKey:"private_xwLfK+CD6v3r1/rDsoZvIdkcXks="
});
async function  uploadFile(buffer) {
    const result = await imagekit.files.upload({
        file:buffer.toString('base64'),
        fileName:"image.png",
        folder:"foundmet"
    
    })
    return result
}

export default uploadFile;