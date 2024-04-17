class ImageModifierFactory {
  static async build(wasmPath) {
    const options = {};
    const teavm = await TeaVM.wasm.load(wasmPath, options);
    return new ImageMofifier(teavm);
  }
}

class ImageMofifier {
  #teavm;
  #buffer;
  #exports;

  constructor(teavm) {
    this.#teavm = teavm;
    this.#exports = this.#teavm.instance.exports;
    this.#buffer = this.#teavm.memory.buffer;
  }

  /**
   * @param {File}
   * @return {Promise<File>}
   */
  async compressImage(imageFile) {
    let ptr = await this.#copyImageInSharedMemory(imageFile);

    this.#exports.process(); // seems to not modify the memory buffer

    const processedImageData = new Uint8Array(this.#buffer, ptr, imageFile.size);
    const processedImageName = "processed_" + imageFile.name;
    const options = {type: imageFile.type};
    return new File([processedImageData], processedImageName, options); 
  }

  /**
   * @param {File}
   * @return {Promise<number>} the index of the data in the wasm memory
   */
  async #copyImageInSharedMemory(imageFile) {
    const imageData = new Uint8Array(await imageFile.arrayBuffer());
    this.#exports.ensureCapacity(imageFile.size);
    const ptr = this.#exports.getBufferPointer();
    const sharedArray = new Uint8Array(this.#buffer, ptr, imageFile.size);
    sharedArray.set(imageData);
    return ptr;
  }
}

/**
 * @param {File}
 */
function dlFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}

const imageModifier = ImageModifierFactory.build("classes.wasm");
imageModifier.then(imageModifier => {
  document.getElementById("image-input").addEventListener("change", async (event) => {
    const image = event.target.files[0];
    resizedImage = await imageModifier.compressImage(image);
    dlFile(resizedImage);
  });
});


